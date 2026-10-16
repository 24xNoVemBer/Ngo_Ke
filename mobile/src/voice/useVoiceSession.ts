import { useAudioPlayer, useAudioPlayerStatus, useAudioRecorder, useAudioRecorderState, RecordingPresets, setAudioModeAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import type { AudioSource } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Crypto from 'expo-crypto';
import { File } from 'expo-file-system';
import { DEFAULT_LOCALE, type Locale } from '../data/locale';
import { translate, type TranslationKey } from '../i18n/translator';
import { DEFAULT_VOICE_COLLECTION, lookupVoiceTrack } from './localizedCatalog';
import { canCleanUpVoiceTurn, canContinueVoiceStart, canStartVoiceTurn, isCurrentVoiceTurn, shouldCancelVoiceOnAppStateChange, shouldCancelVoiceOnScopeChange } from './appState';
import { prepareVoiceRecorderForTurn, startVoiceRecorder, stopVoiceRecorderWithTimeout, type RecorderStopCompletion } from './recorderPreparation';
import { hasReachedVoiceRecordingLimit } from './recordingLimit';
import { createVoiceRequestBody, transcribeVoiceRequest } from './transcribe';
import { isPlaybackRequestCurrent, restartAudioPlayer, stopAudioPlayer } from './playback';
import { recordVoicePerformance, voicePerformanceNow } from './performance';

export type VoiceStage = 'idle' | 'preparing' | 'recording' | 'stopping' | 'ready' | 'transcribing' | 'error';
export type VoiceMode = 'demo' | 'live';

export type VoiceTurnContext = {
  turnId: string;
  scope: string;
  collectionId: string;
  locale: Locale;
  nodeId: string;
  mode: VoiceMode;
  datasetRevision: string;
};

const voiceRecordingOptions = { ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true };

type Options = {
  apiBaseUrl?: string;
  collectionId?: string;
  locale?: Locale;
  scope: string;
  nodeId: string;
  mode: VoiceMode;
  datasetRevision: string;
  isFocused: boolean;
  onTranscript: (transcript: string, context: VoiceTurnContext) => void;
};

function turnId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

const voiceErrorKeys: Record<string, TranslationKey> = {
  MIC_PERMISSION_DENIED: 'voice.error.MIC_PERMISSION_DENIED',
  MIC_PERMISSION_BLOCKED: 'voice.error.MIC_PERMISSION_BLOCKED',
  AUDIO_TOO_SHORT: 'voice.error.AUDIO_TOO_SHORT',
  RECORDER_START_FAILED: 'voice.error.RECORDER_START_FAILED',
  AUDIO_PLAYER_STOP_TIMEOUT: 'voice.error.AUDIO_PLAYER_STOP_TIMEOUT',
  AUDIO_TOO_LONG: 'voice.error.AUDIO_TOO_LONG',
  NO_SPEECH: 'voice.error.NO_SPEECH',
  VOICE_NOT_CONFIGURED: 'voice.error.VOICE_NOT_CONFIGURED',
  ASR_TIMEOUT: 'voice.error.ASR_TIMEOUT',
  ASR_UNAVAILABLE: 'voice.error.ASR_UNAVAILABLE',
  ASR_BUSY: 'voice.error.ASR_BUSY',
  RATE_LIMITED: 'voice.error.RATE_LIMITED',
  INVALID_AUDIO: 'voice.error.INVALID_AUDIO',
  UNSUPPORTED_LOCALE: 'voice.error.UNSUPPORTED_LOCALE',
  RECORDER_RECOVERY_PENDING: 'voice.error.RECORDER_RECOVERY_PENDING',
};

function messageForError(code: string, locale: Locale): string {
  return translate(locale, voiceErrorKeys[code] ?? 'voice.error.DEFAULT');
}

function removeRecording(uri: string | null | undefined): void {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // The cache may already have removed a canceled recording.
  }
}

export function useVoiceSession({
  apiBaseUrl,
  collectionId = DEFAULT_VOICE_COLLECTION,
  locale = DEFAULT_LOCALE,
  scope,
  nodeId,
  mode,
  datasetRevision,
  isFocused,
  onTranscript,
}: Options) {
  // Keep iOS audio active across pause so Expo's delayed deactivation cannot silence the next recording.
  const player = useAudioPlayer(null, { updateInterval: 200, keepAudioSessionActive: true });
  const playback = useAudioPlayerStatus(player);
  const recorder = useAudioRecorder(voiceRecordingOptions);
  const recording = useAudioRecorderState(recorder, 100);
  const [stage, setStage] = useState<VoiceStage>('idle');
  const stageRef = useRef<VoiceStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const turnRef = useRef<VoiceTurnContext | null>(null);
  const scopeRef = useRef(scope);
  const collectionIdRef = useRef(collectionId);
  const localeRef = useRef(locale);
  const onTranscriptRef = useRef(onTranscript);
  const abortRef = useRef<AbortController | null>(null);
  const permissionPendingRef = useRef<string | null>(null);
  const nativeRecoveryPendingRef = useRef<string | null>(null);
  const readyRecordingRef = useRef<{ turnId: string; uri: string; durationMs: number } | null>(null);
  const cancelStartedAtRef = useRef<number | null>(null);
  const requestRef = useRef(0);
  const previousScopeRef = useRef(scope);
  const previousCollectionIdRef = useRef(collectionId);
  const previousLocaleRef = useRef(locale);

  scopeRef.current = scope;
  collectionIdRef.current = collectionId;
  localeRef.current = locale;
  onTranscriptRef.current = onTranscript;

  const changeStage = useCallback((next: VoiceStage) => {
    stageRef.current = next;
    setStage(next);
  }, []);

  const finishCancelPerformance = useCallback(() => {
    const startedAt = cancelStartedAtRef.current;
    if (startedAt === null || stageRef.current !== 'idle') return;
    cancelStartedAtRef.current = null;
    recordVoicePerformance('cancel-to-idle', voicePerformanceNow() - startedAt);
  }, []);

  const holdForRecorderRecovery = useCallback((context: VoiceTurnContext, completion: Promise<RecorderStopCompletion>, uri?: string | null) => {
    nativeRecoveryPendingRef.current = context.turnId;
    turnRef.current = null;
    if (readyRecordingRef.current?.turnId === context.turnId) readyRecordingRef.current = null;
    setError(messageForError('RECORDER_RECOVERY_PENDING', context.locale));
    changeStage('error');
    void completion.then(async (outcome) => {
      if (outcome.kind !== 'stopped' || nativeRecoveryPendingRef.current !== context.turnId
          || !canCleanUpVoiceTurn(turnRef.current?.turnId ?? null, context.turnId)) return;
      removeRecording(uri ?? recorder.uri);
      try { await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }); } catch { return; }
      if (nativeRecoveryPendingRef.current === context.turnId
          && canCleanUpVoiceTurn(turnRef.current?.turnId ?? null, context.turnId)) {
        nativeRecoveryPendingRef.current = null;
        setError(null);
        changeStage('idle');
        finishCancelPerformance();
      }
    });
  }, [changeStage, finishCancelPerformance, recorder]);

  const stopPlayback = useCallback(async () => {
    requestRef.current += 1;
    setActiveTrackId(null);
    return stopAudioPlayer(player);
  }, [player]);

  const cancel = useCallback(() => {
    const currentStage = stageRef.current;
    const context = turnRef.current;
    if (context === null) return;
    cancelStartedAtRef.current = voicePerformanceNow();
    turnRef.current = null;
    abortRef.current?.abort();
    abortRef.current = null;
    if (permissionPendingRef.current === context.turnId) permissionPendingRef.current = null;
    setError(null);
    if (currentStage === 'ready') {
      removeRecording(readyRecordingRef.current?.uri);
      readyRecordingRef.current = null;
      changeStage('idle');
      finishCancelPerformance();
    } else if (currentStage === 'recording') {
      changeStage('stopping');
      void stopVoiceRecorderWithTimeout(() => recorder.stop()).then(async (outcome) => {
        if (outcome.kind === 'timed-out') {
          holdForRecorderRecovery(context, outcome.completion);
          return;
        }
        if (outcome.kind === 'failed') {
          holdForRecorderRecovery(context, Promise.resolve(outcome));
          return;
        }
        removeRecording(recorder.uri);
        try { await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }); } catch {
          holdForRecorderRecovery(context, Promise.resolve({ kind: 'failed', error: new Error('AUDIO_MODE_RESET_FAILED') }));
          return;
        }
        if (canCleanUpVoiceTurn(turnRef.current?.turnId ?? null, context.turnId)) {
          changeStage('idle');
          finishCancelPerformance();
        }
      });
    } else if (currentStage === 'preparing') {
      if (nativeRecoveryPendingRef.current === context.turnId) {
        setError(messageForError('RECORDER_RECOVERY_PENDING', context.locale));
        changeStage('error');
      }
      void setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => undefined);
    } else if (currentStage !== 'stopping') {
      changeStage('idle');
      finishCancelPerformance();
    }
  }, [changeStage, finishCancelPerformance, holdForRecorderRecovery, recorder]);

  const startRecording = useCallback(async () => {
    if (!isFocused || !canStartVoiceTurn(stageRef.current, nativeRecoveryPendingRef.current !== null)) return;
    const context: VoiceTurnContext = {
      turnId: turnId(), scope, collectionId, locale, nodeId, mode, datasetRevision,
    };
    const isCurrentTurn = () => context.locale === localeRef.current
      && context.collectionId === collectionIdRef.current
      && isCurrentVoiceTurn(turnRef.current, scopeRef.current, context);
    turnRef.current = context;
    nativeRecoveryPendingRef.current = context.turnId;
    setError(null);
    setPermissionBlocked(false);
    setPlaybackError(null);
    changeStage('preparing');

    try {
      if (!await stopPlayback()) throw new Error('AUDIO_PLAYER_STOP_TIMEOUT');
      if (!isCurrentTurn()) return;
      permissionPendingRef.current = context.turnId;
      const permission = await requestRecordingPermissionsAsync();
      if (permissionPendingRef.current === context.turnId) permissionPendingRef.current = null;
      if (!isCurrentTurn()) return;
      if (!permission.granted) {
        const blocked = !permission.canAskAgain;
        setPermissionBlocked(blocked);
        throw new Error(blocked ? 'MIC_PERMISSION_BLOCKED' : 'MIC_PERMISSION_DENIED');
      }
      if (!canContinueVoiceStart(AppState.currentState)) throw new Error('RECORDER_START_FAILED');
      const prepared = await prepareVoiceRecorderForTurn({
        isCurrent: isCurrentTurn,
        enableAudioMode: () => setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true }),
        recordingOptions: voiceRecordingOptions,
        prepareRecorder: (options) => recorder.prepareToRecordAsync(options),
        stopRecorder: () => recorder.stop(),
        removeRecording: () => removeRecording(recorder.uri),
        disableAudioMode: () => setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }),
      });
      if (!prepared || !isCurrentTurn()) return;
      const started = await startVoiceRecorder(
        () => recorder.record(),
        () => recorder.isRecording,
        isCurrentTurn,
        () => recorder.stop(),
      );
      if (!started || !isCurrentTurn()) return;
      changeStage('recording');
    } catch (cause) {
      if (permissionPendingRef.current === context.turnId) permissionPendingRef.current = null;
      if (!isCurrentTurn()) return;
      try { await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }); } catch { /* Preserve the original recorder error. */ }
      if (!isCurrentTurn()) return;
      turnRef.current = null;
      nativeRecoveryPendingRef.current = null;
      const code = cause instanceof Error ? cause.message : 'VOICE_ERROR';
      setError(messageForError(code, context.locale));
      changeStage('error');
    } finally {
      if (permissionPendingRef.current === context.turnId) permissionPendingRef.current = null;
      const recoverCancelledStart = !isCurrentTurn() && nativeRecoveryPendingRef.current === context.turnId;
      if (nativeRecoveryPendingRef.current === context.turnId) nativeRecoveryPendingRef.current = null;
      if (!isCurrentTurn() && canCleanUpVoiceTurn(turnRef.current?.turnId ?? null, context.turnId)
          && (stageRef.current === 'preparing' || (recoverCancelledStart && stageRef.current === 'error'))) {
        if (turnRef.current?.turnId === context.turnId) turnRef.current = null;
        setError(null);
        changeStage('idle');
        finishCancelPerformance();
      }
    }
  }, [changeStage, collectionId, datasetRevision, finishCancelPerformance, isFocused, locale, mode, nodeId, recorder, scope, stopPlayback]);

  const stopAtRecordingLimit = useCallback(async (durationMs: number) => {
    const context = turnRef.current;
    if (!context || stageRef.current !== 'recording') return;
    const isCurrentTurn = () => context.locale === localeRef.current
      && context.collectionId === collectionIdRef.current
      && isCurrentVoiceTurn(turnRef.current, scopeRef.current, context);
    changeStage('stopping');
    let uri: string | null = null;
    try {
      const stop = await stopVoiceRecorderWithTimeout(() => recorder.stop());
      if (stop.kind === 'timed-out') {
        holdForRecorderRecovery(context, stop.completion);
        return;
      }
      if (stop.kind === 'failed') {
        holdForRecorderRecovery(context, Promise.resolve(stop));
        return;
      }
      uri = recorder.uri;
      if (!isCurrentTurn()) {
        if (canCleanUpVoiceTurn(turnRef.current?.turnId ?? null, context.turnId)) {
          removeRecording(uri);
          try { await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }); } catch { /* A stale turn must not own a newer session's mode. */ }
          if (canCleanUpVoiceTurn(turnRef.current?.turnId ?? null, context.turnId)) {
            changeStage('idle');
            finishCancelPerformance();
          }
        }
        return;
      }
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      if (!isCurrentTurn()) {
        if (canCleanUpVoiceTurn(turnRef.current?.turnId ?? null, context.turnId)) {
          removeRecording(uri);
          changeStage('idle');
          finishCancelPerformance();
        }
        return;
      }
      if (!uri) throw new Error('INVALID_AUDIO');
      readyRecordingRef.current = { turnId: context.turnId, uri, durationMs };
      changeStage('ready');
    } catch (cause) {
      const canCleanUp = canCleanUpVoiceTurn(turnRef.current?.turnId ?? null, context.turnId);
      if (canCleanUp) removeRecording(uri ?? recorder.uri);
      if (canCleanUp) {
        try { await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }); } catch { /* Preserve the recorder error. */ }
      }
      if (isCurrentTurn()) {
        turnRef.current = null;
        setError(messageForError(cause instanceof Error ? cause.message : 'VOICE_ERROR', context.locale));
        changeStage('error');
      } else if (canCleanUpVoiceTurn(turnRef.current?.turnId ?? null, context.turnId)) {
        changeStage('idle');
        finishCancelPerformance();
      }
    }
  }, [changeStage, finishCancelPerformance, holdForRecorderRecovery, recorder]);

  const submitRecording = useCallback(async () => {
    const context = turnRef.current;
    const isReady = stageRef.current === 'ready';
    if (!context || (!isReady && stageRef.current !== 'recording')) return;
    const readyRecording = readyRecordingRef.current;
    if (isReady && (!readyRecording || readyRecording.turnId !== context.turnId)) return;
    const submitStartedAt = voicePerformanceNow();
    const isCurrentTurn = () => context.locale === localeRef.current
      && context.collectionId === collectionIdRef.current
      && isCurrentVoiceTurn(turnRef.current, scopeRef.current, context);
    changeStage('stopping');
    let recordingUri: string | null = null;
    let recorderStopped = isReady;
    let audioModeReset = isReady;
    let durationMs = recording.durationMillis;
    if (isReady) {
      recordingUri = readyRecording!.uri;
      durationMs = readyRecording!.durationMs;
    }
    readyRecordingRef.current = null;
    let requestController: AbortController | null = null;
    let errorCode: string | null = null;
    try {
      if (!recorderStopped) {
        const stop = await stopVoiceRecorderWithTimeout(() => recorder.stop());
        if (stop.kind === 'timed-out' || stop.kind === 'failed') {
          recorderStopped = true;
          audioModeReset = true;
          holdForRecorderRecovery(context, stop.kind === 'timed-out' ? stop.completion : Promise.resolve(stop), recordingUri);
          return;
        }
        recorderStopped = true;
        recordingUri = recorder.uri;
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
        audioModeReset = true;
      }
      if (!isCurrentTurn()) return;
      if (durationMs < 500) throw new Error('AUDIO_TOO_SHORT');
      if (!recordingUri) throw new Error('INVALID_AUDIO');
      if (!apiBaseUrl) throw new Error('VOICE_NOT_CONFIGURED');

      const controller = new AbortController();
      requestController = controller;
      abortRef.current = controller;
      changeStage('transcribing');
      const fileName = recordingUri.split('/').pop() || 'voice-question.m4a';
      const transcriptContext = {
        turnId: context.turnId,
        locale: context.locale,
        mode: context.mode,
        nodeId: context.nodeId,
        datasetRevision: context.datasetRevision,
      };
      const recordingFile = new File(recordingUri);
      const audioFile = {
        name: fileName,
        type: fileName.toLowerCase().endsWith('.wav') ? 'audio/wav' : 'audio/mp4',
        bytes: () => recordingFile.bytes(),
      };
      const body = createVoiceRequestBody(audioFile, fileName, transcriptContext);

      const transcript = await transcribeVoiceRequest(apiBaseUrl, body, controller, transcriptContext);
      if (!isCurrentTurn()) return;
      recordVoicePerformance('stop-to-transcript', voicePerformanceNow() - submitStartedAt);
      turnRef.current = null;
      changeStage('idle');
      onTranscriptRef.current(transcript, context);
    } catch (cause) {
      if (isCurrentTurn()) {
        errorCode = cause instanceof Error ? cause.message : 'VOICE_ERROR';
        const diagnostic = errorCode.replace(/\S*[\\/]\S+/g, '<path>').slice(0, 120);
        console.warn('Voice submit failed', cause instanceof Error ? cause.name : 'UnknownError', diagnostic);
      }
    } finally {
      const recoveryPending = nativeRecoveryPendingRef.current === context.turnId;
      if (!recoveryPending && !audioModeReset && canCleanUpVoiceTurn(turnRef.current?.turnId ?? null, context.turnId)) {
        try { await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }); } catch { /* Keep cleanup best-effort after stop failure. */ }
      }
      if (requestController && abortRef.current === requestController) abortRef.current = null;
      if (!recoveryPending) removeRecording(recordingUri ?? (canCleanUpVoiceTurn(turnRef.current?.turnId ?? null, context.turnId) ? recorder.uri : null));
      if (errorCode && isCurrentTurn()) {
        turnRef.current = null;
        setError(messageForError(errorCode, context.locale));
        changeStage('error');
      } else if (!isCurrentTurn() && canCleanUpVoiceTurn(turnRef.current?.turnId ?? null, context.turnId)) {
        if (turnRef.current?.turnId === context.turnId) turnRef.current = null;
        const finalStage = stageRef.current as VoiceStage;
        if (finalStage === 'stopping' || finalStage === 'transcribing') {
          changeStage('idle');
          finishCancelPerformance();
        }
      }
    }
  }, [apiBaseUrl, changeStage, finishCancelPerformance, holdForRecorderRecovery, recorder, recording.durationMillis]);

  const playTrack = useCallback(async (
    id: string,
    text: string,
    expectedKind: 'story' | 'answer',
    expectedNodeId: string,
    restart = false,
  ) => {
    if (mode !== 'demo') {
      setPlaybackError(translate(locale, 'voice.notice.live_no_audio'));
      return;
    }
    const track = lookupVoiceTrack({ collectionId, locale, contentId: id, datasetRevision });
    if (!track || track.kind !== expectedKind || track.nodeId !== expectedNodeId) {
      setPlaybackError(translate(locale, 'voice.notice.audio_unavailable'));
      return;
    }
    const request = ++requestRef.current;
    const requestedScope = scope;
    const requestedLocale = locale;
    const requestedCollectionId = collectionId;
    const isCurrentRequest = () => requestedLocale === localeRef.current
      && requestedCollectionId === collectionIdRef.current
      && isPlaybackRequestCurrent(request, requestRef.current, requestedScope, scopeRef.current);
    setPlaybackError(null);
    try {
      const textHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text);
      if (!isCurrentRequest()) return;
      if (textHash !== track.textHash) {
        setPlaybackError(translate(locale, 'voice.notice.audio_unavailable'));
        return;
      }
      player.loop = true;
      if (activeTrackId === id) {
        if (restart) {
          await restartAudioPlayer(player, isCurrentRequest);
        } else if (playback.playing) player.pause();
        else player.play();
        return;
      }
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      if (!isCurrentRequest()) return;
      player.replace(track.source as AudioSource);
      setActiveTrackId(id);
      player.play();
    } catch {
      if (isCurrentRequest()) {
        setPlaybackError(translate(locale, 'voice.notice.audio_unavailable'));
      }
    }
  }, [activeTrackId, collectionId, datasetRevision, locale, mode, playback.playing, player, scope]);

  const replayTrack = useCallback(async (
    id: string,
    text: string,
    expectedKind: 'story' | 'answer',
    expectedNodeId: string,
  ) => {
    await playTrack(id, text, expectedKind, expectedNodeId, true);
  }, [playTrack]);

  useEffect(() => {
    const scopeChanged = shouldCancelVoiceOnScopeChange(previousScopeRef.current, scope)
      || previousCollectionIdRef.current !== collectionId
      || previousLocaleRef.current !== locale;
    previousScopeRef.current = scope;
    previousCollectionIdRef.current = collectionId;
    previousLocaleRef.current = locale;
    if (!isFocused || scopeChanged) {
      cancel();
      void stopPlayback();
      if (scopeChanged) {
        if (nativeRecoveryPendingRef.current === null) setError(null);
        else setError(messageForError('RECORDER_RECOVERY_PENDING', locale));
        setPermissionBlocked(false);
        setPlaybackError(null);
        if (nativeRecoveryPendingRef.current === null && stageRef.current !== 'preparing' && stageRef.current !== 'stopping') changeStage('idle');
      }
    }
  }, [cancel, changeStage, collectionId, isFocused, locale, scope, stopPlayback]);

  useEffect(() => {
    return () => {
      cancel();
      requestRef.current += 1;
    };
  }, [cancel]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (shouldCancelVoiceOnAppStateChange(state, permissionPendingRef.current !== null)) {
        cancel();
        void stopPlayback();
      }
    });
    return () => subscription.remove();
  }, [cancel, stopPlayback]);

  useEffect(() => {
    if (stage === 'recording' && hasReachedVoiceRecordingLimit(recording.durationMillis)) {
      void stopAtRecordingLimit(recording.durationMillis);
    }
  }, [recording.durationMillis, stage, stopAtRecordingLimit]);

  return {
    stage,
    error,
    permissionBlocked,
    recordingDurationMs: stage === 'ready' ? (readyRecordingRef.current?.durationMs ?? 0) : recording.durationMillis,
    metering: recording.metering,
    playback,
    activeTrackId,
    playbackError,
    startRecording,
    submitRecording,
    cancel,
    playTrack,
    replayTrack,
    stopPlayback,
  };
}
