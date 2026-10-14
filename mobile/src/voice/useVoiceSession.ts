import { useAudioPlayer, useAudioPlayerStatus, useAudioRecorder, useAudioRecorderState, RecordingPresets, setAudioModeAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import type { AudioSource } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Crypto from 'expo-crypto';
import { File } from 'expo-file-system';
import { voiceTracks, voiceCatalogueRevision } from './catalog';
import { canContinueVoiceStart, isCurrentVoiceTurn, shouldCancelVoiceOnAppStateChange, shouldCancelVoiceOnScopeChange } from './appState';
import { prepareVoiceRecorderForTurn, startVoiceRecorder } from './recorderPreparation';
import { hasReachedVoiceRecordingLimit } from './recordingLimit';
import { createVoiceRequestBody, transcribeVoiceRequest } from './transcribe';
import { isPlaybackRequestCurrent, restartAudioPlayer, stopAudioPlayer } from './playback';

export type VoiceStage = 'idle' | 'preparing' | 'recording' | 'stopping' | 'ready' | 'transcribing' | 'error';
export type VoiceMode = 'demo' | 'live';

export type VoiceTurnContext = {
  turnId: string;
  scope: string;
  nodeId: string;
  mode: VoiceMode;
  datasetRevision: string;
};

const voiceRecordingOptions = { ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true };

type Options = {
  apiBaseUrl?: string;
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

function messageForError(code: string): string {
  if (code === 'MIC_PERMISSION_DENIED') return 'Ngõ Kể chưa được cấp quyền dùng micro. Bạn có thể gõ câu hỏi thay thế.';
  if (code === 'MIC_PERMISSION_BLOCKED') return 'Quyền micro đã bị chặn trong Cài đặt. Bật quyền micro hoặc gõ câu hỏi thay thế.';
  if (code === 'AUDIO_TOO_SHORT') return 'Câu nói hơi ngắn. Hãy nói rõ câu hỏi rồi chạm Gửi.';
  if (code === 'RECORDER_START_FAILED') return 'Micro chưa bắt đầu thu được. Hãy chạm để thử lại.';
  if (code === 'AUDIO_PLAYER_STOP_TIMEOUT') return 'Lời kể chưa dừng hẳn. Hãy thử lại sau một chút.';
  if (code === 'AUDIO_TOO_LONG') return 'Câu nói dài quá. Hãy chia thành một câu hỏi ngắn hơn.';
  if (code === 'NO_SPEECH') return 'Mình chưa nghe thấy lời nói rõ. Hãy thử lại gần micro hơn.';
  if (code === 'VOICE_NOT_CONFIGURED') return 'Bản thử chưa cấu hình máy nhận giọng nói. Hãy mở lại Expo Go theo hướng dẫn, hoặc gõ câu hỏi thay thế.';
  if (code === 'ASR_TIMEOUT') return 'Nhận dạng mất quá lâu. Hãy thử lại khi kết nối ổn định.';
  if (code === 'ASR_UNAVAILABLE') return 'Máy nhận dạng giọng nói chưa chạy. Hãy thử lại sau.';
  if (code === 'ASR_BUSY') return 'Máy nhận dạng đang bận. Chờ một chút rồi thử lại nhé.';
  if (code === 'RATE_LIMITED') return 'Bạn vừa gửi nhiều lượt liên tiếp. Chờ một chút rồi thử lại nhé.';
  if (code === 'INVALID_AUDIO') return 'Bản ghi không đọc được. Hãy thu lại câu hỏi.';
  return 'Chưa gửi được câu hỏi. Kiểm tra kết nối tới máy nhận giọng nói rồi thử lại.';
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

export function useVoiceSession({ apiBaseUrl, scope, nodeId, mode, datasetRevision, isFocused, onTranscript }: Options) {
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
  const onTranscriptRef = useRef(onTranscript);
  const abortRef = useRef<AbortController | null>(null);
  const permissionPendingRef = useRef(false);
  const readyRecordingRef = useRef<{ turnId: string; uri: string; durationMs: number } | null>(null);
  const requestRef = useRef(0);
  const previousScopeRef = useRef(scope);

  scopeRef.current = scope;
  onTranscriptRef.current = onTranscript;

  const changeStage = useCallback((next: VoiceStage) => {
    stageRef.current = next;
    setStage(next);
  }, []);

  const stopPlayback = useCallback(async () => {
    requestRef.current += 1;
    setActiveTrackId(null);
    return stopAudioPlayer(player);
  }, [player]);

  const cancel = useCallback(() => {
    const currentStage = stageRef.current;
    if (turnRef.current === null) return;
    turnRef.current = null;
    abortRef.current?.abort();
    abortRef.current = null;
    permissionPendingRef.current = false;
    setError(null);
    if (currentStage === 'ready') {
      removeRecording(readyRecordingRef.current?.uri);
      readyRecordingRef.current = null;
      changeStage('idle');
    } else if (currentStage === 'recording') {
      changeStage('stopping');
      void recorder.stop().catch(() => undefined).finally(async () => {
        removeRecording(recorder.uri);
        try { await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }); } catch { /* Cancellation still closes the UI. */ }
        if (stageRef.current === 'stopping') changeStage('idle');
      });
    } else if (currentStage === 'preparing') {
      void setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => undefined);
    } else if (currentStage !== 'stopping') {
      changeStage('idle');
    }
  }, [changeStage, recorder]);

  const startRecording = useCallback(async () => {
    if (!isFocused || !['idle', 'error'].includes(stageRef.current)) return;
    const context: VoiceTurnContext = {
      turnId: turnId(), scope, nodeId, mode, datasetRevision,
    };
    const isCurrentTurn = () => isCurrentVoiceTurn(turnRef.current, scopeRef.current, context);
    turnRef.current = context;
    setError(null);
    setPermissionBlocked(false);
    setPlaybackError(null);
    changeStage('preparing');

    try {
      if (!await stopPlayback()) throw new Error('AUDIO_PLAYER_STOP_TIMEOUT');
      if (!isCurrentTurn()) return;
      permissionPendingRef.current = true;
      const permission = await requestRecordingPermissionsAsync();
      permissionPendingRef.current = false;
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
      permissionPendingRef.current = false;
      if (!isCurrentTurn()) return;
      try { await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }); } catch { /* Preserve the original recorder error. */ }
      if (!isCurrentTurn()) return;
      turnRef.current = null;
      const code = cause instanceof Error ? cause.message : 'VOICE_ERROR';
      setError(messageForError(code));
      changeStage('error');
    } finally {
      permissionPendingRef.current = false;
      if (!isCurrentTurn() && stageRef.current === 'preparing') {
        if (turnRef.current?.turnId === context.turnId) turnRef.current = null;
        changeStage('idle');
      }
    }
  }, [changeStage, datasetRevision, isFocused, mode, nodeId, recorder, scope, stopPlayback]);

  const stopAtRecordingLimit = useCallback(async (durationMs: number) => {
    const context = turnRef.current;
    if (!context || stageRef.current !== 'recording') return;
    const isCurrentTurn = () => isCurrentVoiceTurn(turnRef.current, scopeRef.current, context);
    changeStage('stopping');
    let uri: string | null = null;
    try {
      await recorder.stop();
      uri = recorder.uri;
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      if (!isCurrentTurn()) {
        removeRecording(uri);
        changeStage('idle');
        return;
      }
      if (!uri) throw new Error('INVALID_AUDIO');
      readyRecordingRef.current = { turnId: context.turnId, uri, durationMs };
      changeStage('ready');
    } catch (cause) {
      removeRecording(uri ?? recorder.uri);
      try { await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }); } catch { /* Preserve the recorder error. */ }
      if (isCurrentTurn()) {
        turnRef.current = null;
        setError(messageForError(cause instanceof Error ? cause.message : 'VOICE_ERROR'));
        changeStage('error');
      } else {
        changeStage('idle');
      }
    }
  }, [changeStage, recorder]);

  const submitRecording = useCallback(async () => {
    const context = turnRef.current;
    const isReady = stageRef.current === 'ready';
    if (!context || (!isReady && stageRef.current !== 'recording')) return;
    const readyRecording = readyRecordingRef.current;
    if (isReady && (!readyRecording || readyRecording.turnId !== context.turnId)) return;
    const isCurrentTurn = () => isCurrentVoiceTurn(turnRef.current, scopeRef.current, context);
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
        await recorder.stop();
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
        locale: 'vi' as const,
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
      if (!recorderStopped) {
        try {
          await recorder.stop();
          recordingUri ??= recorder.uri;
        } catch { /* The recorder can already be reset after a native stop error. */ }
      }
      if (!audioModeReset) {
        try { await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }); } catch { /* Keep cleanup best-effort after stop failure. */ }
      }
      if (requestController && abortRef.current === requestController) abortRef.current = null;
      removeRecording(recordingUri ?? recorder.uri);
      if (errorCode && isCurrentTurn()) {
        turnRef.current = null;
        setError(messageForError(errorCode));
        changeStage('error');
      } else if (!isCurrentTurn()) {
        if (turnRef.current?.turnId === context.turnId) turnRef.current = null;
        const finalStage = stageRef.current as VoiceStage;
        if (finalStage === 'stopping' || finalStage === 'transcribing') changeStage('idle');
      }
    }
  }, [apiBaseUrl, changeStage, recorder, recording.durationMillis]);

  const playTrack = useCallback(async (
    id: string,
    text: string,
    expectedKind: 'story' | 'answer',
    expectedNodeId: string,
    restart = false,
  ) => {
    if (mode !== 'demo' || datasetRevision !== voiceCatalogueRevision) {
      setPlaybackError('Audio truyện này không khớp phiên bản dữ liệu hiện tại.');
      return;
    }
    const track = voiceTracks[id];
    if (!track || track.kind !== expectedKind || track.nodeId !== expectedNodeId) {
      setPlaybackError('Chưa có bản đọc đúng cho nội dung này.');
      return;
    }
    const request = ++requestRef.current;
    const requestedScope = scope;
    const isCurrentRequest = () => isPlaybackRequestCurrent(request, requestRef.current, requestedScope, scopeRef.current);
    setPlaybackError(null);
    try {
      const textHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text);
      if (!isCurrentRequest()) return;
      if (textHash !== track.textHash) {
        setPlaybackError('Bản đọc không khớp lời kể hiện tại nên chưa phát.');
        return;
      }
      player.loop = true;
      if (activeTrackId === id) {
        if (restart) {
          await restartAudioPlayer(player, () => request === requestRef.current && scopeRef.current === requestedScope);
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
        setPlaybackError('Không mở được bản đọc. Bạn vẫn có thể xem lời kể bằng chữ.');
      }
    }
  }, [activeTrackId, datasetRevision, mode, playback.playing, player, scope]);

  const replayTrack = useCallback(async (
    id: string,
    text: string,
    expectedKind: 'story' | 'answer',
    expectedNodeId: string,
  ) => {
    await playTrack(id, text, expectedKind, expectedNodeId, true);
  }, [playTrack]);

  useEffect(() => {
    const scopeChanged = shouldCancelVoiceOnScopeChange(previousScopeRef.current, scope);
    previousScopeRef.current = scope;
    if (!isFocused || scopeChanged) {
      cancel();
      void stopPlayback();
      if (scopeChanged) {
        setError(null);
        setPermissionBlocked(false);
        setPlaybackError(null);
        if (stageRef.current !== 'preparing' && stageRef.current !== 'stopping') changeStage('idle');
      }
    }
  }, [cancel, changeStage, isFocused, scope, stopPlayback]);

  useEffect(() => {
    return () => {
      cancel();
      requestRef.current += 1;
    };
  }, [cancel]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (shouldCancelVoiceOnAppStateChange(state, permissionPendingRef.current)) {
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
