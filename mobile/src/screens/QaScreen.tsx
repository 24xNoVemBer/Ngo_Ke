import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useIsFocused } from '@react-navigation/native';
import {
  Animated,
  ImageBackground,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TOPICS, type DemoDataset, type Mode } from '../data/sourceState';
import { findAnswer, type QaEntry, type QaMatch } from '../qa/match';
import { pickPoints, TOPIC_LABELS, type PlanDraft } from '../recommendation/pick';
import { HERO_PHOTO, getNodePhoto, getNodePhotographer } from '../assets/photoMap';
import { VoiceInteractionDock } from '../components/VoiceInteractionDock';
import { VoicePlayerBar } from '../components/VoicePlayerBar';
import { AppIcon } from '../components/AppIcon';
import { ExpandableInputDrawer } from '../components/ExpandableInputDrawer';
import { useMotionState } from '../hooks/MotionPreferences';
import { useVoiceSession, type VoiceTurnContext } from '../voice/useVoiceSession';
import { recordVoicePerformance, voicePerformanceNow } from '../voice/performance';
import { parseVoiceIntent, resolveFirstOptionReference, type VoiceOptionContext } from '../voice/intent';
import { voiceTracks } from '../voice/catalog';
import { colors, radius, spacing, typography } from '../theme';

const CHIP_COUNT = 4;

type Props = {
  mode?: Mode;
  dataset: DemoDataset;
  datasetRevision: string;
  voiceApiBaseUrl?: string;
  currentNodeId?: string;
  onSelectNode: (nodeId: string) => void;
  onReadNode: (nodeId: string) => void;
  readNodeIds: ReadonlySet<string>;
  planDraft?: PlanDraft;
  onPlanDraftChange?: (draft: PlanDraft) => void;
  onOpenNotebook: (draft?: PlanDraft) => void;
  onOpenCamera?: () => void;
  onOpenLocation?: () => void;
  onBack?: () => void;
};

type VoiceActionCard =
  | { kind: 'plan'; draft: PlanDraft; message?: string }
  | { kind: 'qr' | 'gps' }
  | { kind: 'reference'; message: string }
  | { kind: 'mixed'; message: string; questionText: string; actionText: string; action: 'next' | 'plan' | 'open-qr' | 'open-gps'; context: VoiceTurnContext }
  | { kind: 'notice'; message: string };

function followUpEntries(entry: QaEntry, all: readonly QaEntry[]): QaEntry[] {
  return entry.followUps
    .map((id) => all.find((item) => item.id === id))
    .filter((item): item is QaEntry => item !== undefined);
}

export function QaScreen({
  mode = 'demo',
  dataset,
  datasetRevision,
  voiceApiBaseUrl,
  currentNodeId,
  onSelectNode,
  onReadNode,
  readNodeIds,
  planDraft = {},
  onPlanDraftChange = () => {},
  onOpenNotebook,
  onOpenCamera = () => {},
  onOpenLocation = () => {},
  onBack,
}: Props): ReactElement {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [asked, setAsked] = useState<string | null>(null);
  const [askedSource, setAskedSource] = useState<'voice' | 'text' | 'chip' | null>(null);
  const [match, setMatch] = useState<QaMatch | null>(null);
  const [isInputDrawerVisible, setIsInputDrawerVisible] = useState(false);
  const [drawerText, setDrawerText] = useState('');
  const [isTextVisible, setIsTextVisible] = useState(false);
  const [dockHeight, setDockHeight] = useState(0);
  const [voiceActionCard, setVoiceActionCard] = useState<VoiceActionCard | null>(null);
  const motion = useMotionState();
  const scroll = useRef<ScrollView>(null);
  const answerY = useRef(0);
  const revealAnswer = useRef(false);
  const voiceOptionContext = useRef<VoiceOptionContext | null>(null);
  const lastTrack = useRef<{ id: string; text: string; kind: 'story' | 'answer'; nodeId: string; revision: string } | null>(null);
  const playbackIntent = useRef(0);
  const pendingVoicePlayback = useRef<{ turnId: string; trackId: string; startedAt: number } | null>(null);

  useEffect(() => {
    setAsked(null);
    setAskedSource(null);
    setMatch(null);
    setDrawerText('');
    setIsInputDrawerVisible(false);
    setIsTextVisible(false);
    setVoiceActionCard(null);
    voiceOptionContext.current = null;
    lastTrack.current = null;
  }, [dataset, currentNodeId, datasetRevision]);

  useEffect(() => {
    if (!isFocused) {
      playbackIntent.current += 1;
      setIsInputDrawerVisible(false);
      setIsTextVisible(false);
      revealAnswer.current = false;
    }
  }, [isFocused]);

  const answerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (match === null) return;
    answerAnim.stopAnimation();
    answerAnim.setValue(motion.active ? 0 : 1);
    const animation = Animated.timing(answerAnim, { toValue: 1, duration: 180, useNativeDriver: true });
    if (motion.active) animation.start();
    const timer = setTimeout(() => {
      if (isFocused && revealAnswer.current) {
        revealAnswer.current = false;
        scroll.current?.scrollTo({ y: Math.max(0, answerY.current - 12), animated: motion.active });
      }
    }, motion.active ? 220 : 0);
    return () => { clearTimeout(timer); animation.stop(); answerAnim.setValue(1); };
  }, [match, answerAnim, motion.active, isFocused]);

  const answerTranslateY = answerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });
  const answerOpacity = answerAnim;

  const activeIndex = Math.max(
    0,
    dataset.nodes.findIndex((n) => n.id === currentNodeId),
  );
  const currentNode = dataset.nodes[activeIndex] ?? dataset.nodes[0];
  const nodeQa = dataset.qa.filter((item) => item.nodeId === currentNode?.id);
  useEffect(() => {
    if (isFocused && currentNode?.available) onReadNode(currentNode.id);
  }, [isFocused, currentNode, onReadNode]);
  const currentPhoto = currentNode ? getNodePhoto(currentNode.id) : HERO_PHOTO;
  const currentPhotographer = currentNode
    ? getNodePhotographer(currentNode.id)
    : 'Dự án Ngõ Kể';

  function handleSelectNode(index: number): void {
    const target = dataset.nodes[index];
    if (target?.available) {
      setAsked(null);
      setAskedSource(null);
      setMatch(null);
      setDrawerText('');
      setIsInputDrawerVisible(false);
      onSelectNode(target.id);
    }
  }

  const previousIndex = dataset.nodes.slice(0, activeIndex).findLastIndex((node) => node.available);
  const nextIndex = dataset.nodes.findIndex((node, index) => index > activeIndex && node.available);
  function handlePrev(): void { if (previousIndex >= 0) handleSelectNode(previousIndex); }
  function handleNext(): void { if (nextIndex >= 0) handleSelectNode(nextIndex); }

  function ask(question: string, source: 'voice' | 'text' | 'chip' = 'text', context?: VoiceTurnContext): void {
    const trimmed = question.trim();
    if (trimmed.length === 0) {
      return;
    }
    revealAnswer.current = true;
    setAsked(trimmed);
    setAskedSource(source);
    const nextMatch = findAnswer(nodeQa, trimmed);
    setMatch(nextMatch);
    setDrawerText('');
    setIsInputDrawerVisible(false);
    setVoiceActionCard(null);
    if (source === 'voice' && context) {
      const options = nextMatch.status === 'matched'
        ? followUpEntries(nextMatch.entry, nodeQa).map((item) => item.id)
        : [];
      voiceOptionContext.current = {
        turnId: context.turnId,
        scope: context.scope,
        datasetRevision: context.datasetRevision,
        nodeId: context.nodeId,
        options: options.length ? options : nodeQa.slice(0, CHIP_COUNT).map((item) => item.id),
      };
    } else {
      voiceOptionContext.current = null;
    }
    pendingVoicePlayback.current = null;
    const currentPlaybackIntent = ++playbackIntent.current;
    const playbackStopped = Promise.resolve(voiceSession.stopPlayback());
    if (source === 'voice' && nextMatch.status === 'matched' && currentNode && mode === 'demo') {
      const id = `${nextMatch.entry.id}-answer`;
      if (context) pendingVoicePlayback.current = { turnId: context.turnId, trackId: id, startedAt: voicePerformanceNow() };
      lastTrack.current = { id, text: nextMatch.entry.answer, kind: 'answer', nodeId: currentNode.id, revision: datasetRevision };
      void playbackStopped.then((stopped) => {
        if (currentPlaybackIntent !== playbackIntent.current) return;
        if (stopped !== false) return voiceSession.playTrack(id, nextMatch.entry.answer, 'answer', currentNode.id);
        if (context && pendingVoicePlayback.current?.turnId === context.turnId) pendingVoicePlayback.current = null;
        setVoiceActionCard({ kind: 'notice', message: 'Lời kể chưa dừng hẳn. Hãy thử phát lại sau một chút.' });
      });
    } else if (source === 'voice' && nextMatch.status === 'matched') {
      pendingVoicePlayback.current = null;
      lastTrack.current = null;
      setVoiceActionCard({ kind: 'notice', message: 'Câu trả lời đã khớp. Bản đọc chưa có trong chế độ Live; chạm “Xem lời kể bằng chữ” để mở nội dung.' });
    }
  }

  const intro = dataset.intro;
  const entry = match?.status === 'matched' && match.entry.nodeId === currentNode?.id ? match.entry : null;
  const followUps = entry === null ? [] : followUpEntries(entry, nodeQa);
  const quickQuestions = nodeQa.map((q) => q.question);
  const voiceScope = `${mode}:${datasetRevision}:${currentNode?.id ?? 'intro'}`;
  const voiceSession = useVoiceSession({
    apiBaseUrl: voiceApiBaseUrl,
    scope: voiceScope,
    nodeId: currentNode?.id ?? 'intro',
    mode,
    datasetRevision,
    isFocused,
    onTranscript: handleVoiceTranscript,
  });
  const { activeTrackId, playback } = voiceSession;
  useEffect(() => {
    const pending = pendingVoicePlayback.current;
    if (!pending || activeTrackId !== pending.trackId || !playback.playing) return;
    pendingVoicePlayback.current = null;
    recordVoicePerformance('transcript-to-audio', voicePerformanceNow() - pending.startedAt);
  }, [activeTrackId, playback.playing]);
  const playbackError = voiceSession.playbackError ?? (
    voiceSession.activeTrackId !== null && voiceSession.playback.error
      ? 'Không mở được bản đọc. Bạn vẫn có thể xem lời kể bằng chữ.'
      : null
  );
  const storyTrackId = currentNode ? `${currentNode.id}-story` : 'intro';
  const storyTrack = mode === 'demo' ? voiceTracks[storyTrackId] : undefined;
  const answerTrackId = entry ? `${entry.id}-answer` : '';
  const answerTrack = mode === 'demo' && entry ? voiceTracks[answerTrackId] : undefined;
  const actionPlanResult = voiceActionCard?.kind === 'plan' && voiceActionCard.draft.topic && voiceActionCard.draft.budgetMinutes
    ? pickPoints(dataset.nodes, voiceActionCard.draft)
    : undefined;

  function requestTrack(id: string, text: string, kind: 'story' | 'answer', nodeId: string, replay = false): void {
    playbackIntent.current += 1;
    lastTrack.current = { id, text, kind, nodeId, revision: datasetRevision };
    if (replay) void voiceSession.replayTrack(id, text, kind, nodeId);
    else void voiceSession.playTrack(id, text, kind, nodeId);
  }

  function showPlanCard(draft: PlanDraft, message?: string): void {
    onPlanDraftChange(draft);
    setVoiceActionCard({ kind: 'plan', draft, message });
  }

  function executeAction(action: 'next' | 'plan' | 'open-qr' | 'open-gps', actionText: string): void {
    if (action === 'next') {
      if (nextIndex < 0) setVoiceActionCard({ kind: 'notice', message: 'Đây là chương cuối đang mở.' });
      else handleNext();
      return;
    }
    if (action === 'plan') {
      const result = parseVoiceIntent(actionText, false, planDraft);
      showPlanCard(result.type === 'plan' ? result.draft : planDraft, result.type === 'plan' ? result.ambiguous : undefined);
      return;
    }
    setVoiceActionCard({ kind: action === 'open-qr' ? 'qr' : 'gps' });
  }

  function handleVoiceTranscript(transcript: string, context: VoiceTurnContext): void {
    if (context.scope !== voiceScope || context.nodeId !== currentNode?.id
        || context.mode !== mode || context.datasetRevision !== datasetRevision) return;

    const reference = resolveFirstOptionReference(transcript, voiceOptionContext.current, {
      scope: voiceScope, datasetRevision, nodeId: currentNode?.id ?? 'intro',
    });
    if (reference.type === 'missing') {
      setVoiceActionCard({ kind: 'reference', message: 'Mình chưa có danh sách câu hỏi của lượt trước để biết “câu đầu tiên” là câu nào. Chọn một câu bên dưới nhé.' });
      return;
    }
    if (reference.type === 'resolved') {
      const option = nodeQa.find((item) => item.id === reference.value);
      if (option) ask(option.question, 'voice', context);
      else setVoiceActionCard({ kind: 'reference', message: 'Danh sách câu hỏi vừa thay đổi. Chọn lại một câu bên dưới nhé.' });
      return;
    }

    const intent = parseVoiceIntent(transcript, voiceActionCard?.kind === 'plan', planDraft);
    if (intent.type !== 'question') voiceOptionContext.current = null;
    if (intent.type === 'question') {
      setVoiceActionCard(null);
      ask(transcript, 'voice', context);
    } else if (intent.type === 'plan') {
      showPlanCard(intent.draft, intent.ambiguous);
    } else if (intent.type === 'clarify') {
      setVoiceActionCard({ kind: 'mixed', message: intent.message, questionText: intent.questionText, actionText: intent.actionText, action: intent.action, context });
    } else if (intent.type === 'listen') {
      if (mode !== 'demo' || !currentNode) {
        setVoiceActionCard({ kind: 'notice', message: 'Lời kể Live chưa có bản đọc. Bạn có thể mở chữ hoặc chọn một câu hỏi gợi ý.' });
      } else requestTrack(storyTrackId, currentNode.story, 'story', currentNode.id);
    } else if (intent.type === 'replay') {
      if (mode !== 'demo') {
        setVoiceActionCard({ kind: 'notice', message: 'Chế độ Live chưa có bản đọc. Chạm “Xem lời kể bằng chữ” để đọc câu trả lời.' });
        return;
      }
      const last = lastTrack.current;
      if (last && last.nodeId === currentNode?.id && last.revision === datasetRevision) {
        requestTrack(last.id, last.text, last.kind, last.nodeId, true);
      } else if (entry && currentNode) {
        requestTrack(answerTrackId, entry.answer, 'answer', currentNode.id, true);
      } else if (currentNode) {
        requestTrack(storyTrackId, currentNode.story, 'story', currentNode.id, true);
      }
    } else if (intent.type === 'stop') {
      void voiceSession.stopPlayback().then((stopped) => {
        setVoiceActionCard({ kind: 'notice', message: stopped !== false ? 'Đã dừng lời kể.' : 'Lời kể chưa dừng hẳn. Hãy thử lại sau một chút.' });
      });
    } else {
      executeAction(intent.type, transcript);
    }
  }

  const topInset = Math.max(insets.top, 24) + 6;
  const bottomInset = Math.max(insets.bottom, 16);

  return (
    <View style={styles.rootContainer}>
      {/* ẢNH NỀN FULL TOÀN MÀN HÌNH CỦA ĐIỂM ĐANG KHÁM PHÁ */}
      <ImageBackground
        source={currentPhoto}
        style={styles.fullBleedBackground}
        resizeMode="cover"
      >
        <View style={styles.scrimOverlay} />

        {/* TOP BAR: NÚT QUAY LẠI BẢN ĐỒ NGÕ & VẠCH TIẾN TRÌNH 6 ĐIỂM */}
        <View style={[styles.topBar, { paddingTop: topInset }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>

          <View style={styles.topBarCenterGroup}>
            {/* Vạch tiến trình dạng 6 phân đoạn story */}
            <View style={styles.storySegmentRow}>
              {dataset.nodes.map((node, i) => (
                <Pressable
                  key={node.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Xem ${node.name}`}
                  disabled={!node.available}
                  onPress={() => handleSelectNode(i)}
                  accessibilityState={{ selected: i === activeIndex, disabled: !node.available }}
                  style={styles.storySegmentTouch}
                >
                  <View style={[
                    styles.storySegment,
                    i === activeIndex && styles.storySegmentActive,
                    readNodeIds.has(node.id) && i !== activeIndex && styles.storySegmentVisited,
                  ]} />
                </Pressable>
              ))}
            </View>

            <Text style={styles.screenTitle}>
              Điểm {String(activeIndex + 1).padStart(2, '0')}/{dataset.nodes.length}:{' '}
              {currentNode ? currentNode.name : 'Khám phá ngõ'}
            </Text>
            <Text style={styles.creditPillText}>Ảnh minh họa: {currentPhotographer}</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            ref={scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: dockHeight + spacing.md }]}
            keyboardShouldPersistTaps="handled"
          >
            {/* THẺ NGƯỜI KỂ CHUYỆN NỔI (FLOATING STORYTELLER CARD) */}
            <View style={styles.floatingStoryCard}>
              <View style={styles.storyCardHeader}>
                <View style={styles.narratorIconCircle}>
                  <Text style={styles.narratorIconText}>Kể</Text>
                </View>
                <View style={styles.narratorHeaderText}>
                  <Text style={styles.phaseTag}>LỜI NGƯỜI KỂ CHUYỆN NGÕ PHỐ</Text>
                  <Text accessibilityRole="header" style={styles.nodeMainName}>
                    {currentNode ? currentNode.name : 'Điểm mở đầu'}
                  </Text>
                </View>
              </View>

              <Text style={styles.waveformDuration}>{mode === 'demo' ? 'TRUYỆN HƯ CẤU · NGHE NGƯỜI KỂ' : 'LIVE · LỜI KỂ BẰNG CHỮ'}</Text>
              {storyTrack && currentNode && (
                <VoicePlayerBar
                  label={`Lời kể · ${currentNode.name}`}
                  active={voiceSession.activeTrackId === storyTrackId}
                  playing={voiceSession.playback.playing}
                  currentTime={voiceSession.playback.currentTime}
                  duration={voiceSession.activeTrackId === storyTrackId ? voiceSession.playback.duration : 0}
                  measuredDuration={storyTrack.durationSeconds}
                  onPlay={() => requestTrack(storyTrackId, currentNode.story, 'story', currentNode.id)}
                  onReplay={() => requestTrack(storyTrackId, currentNode.story, 'story', currentNode.id, true)}
                  onStop={voiceSession.stopPlayback}
                />
              )}
              {mode === 'live' && <Text style={styles.noDataBody}>Lời kể Live chưa có bản đọc. Bạn vẫn có thể xem nội dung bằng chữ.</Text>}
              {playbackError && <Text accessibilityRole="alert" style={styles.playbackError}>{playbackError}</Text>}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isTextVisible ? 'Thu gọn lời kể' : 'Xem lời kể bằng chữ'}
                accessibilityState={{ expanded: isTextVisible }}
                onPress={() => setIsTextVisible((visible) => !visible)}
                style={({ pressed }) => [styles.readerToggle, pressed && styles.pressed]}
              >
                <AppIcon name="text" size={18} color="#F2C56B" />
                <Text style={styles.readerToggleText}>{isTextVisible ? 'Thu gọn lời kể' : 'Xem lời kể bằng chữ'}</Text>
              </Pressable>
              {isTextVisible && (
                <Text style={styles.storyText}>{currentNode ? currentNode.story : intro.text}</Text>
              )}

              {/* Bộ điều hướng chuyển điểm trước/sau trong ngõ */}
              <View style={styles.stepNavigationRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Điểm trước đó"
                  disabled={previousIndex < 0}
                  onPress={handlePrev}
                  style={({ pressed }) => [
                    styles.stepNavButton,
                    previousIndex < 0 && styles.stepNavButtonDisabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNavText,
                      previousIndex < 0 && styles.stepNavTextDisabled,
                    ]}
                  >
                    ‹ Điểm trước
                  </Text>
                </Pressable>

                <View style={styles.stepIndicatorBadge}>
                  <Text style={styles.stepIndicatorText}>
                    {activeIndex + 1} / {dataset.nodes.length}
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Điểm tiếp theo"
                  disabled={nextIndex < 0}
                  onPress={handleNext}
                  style={({ pressed }) => [
                    styles.stepNavButton,
                    nextIndex < 0 && styles.stepNavButtonDisabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNavText,
                      nextIndex < 0 && styles.stepNavTextDisabled,
                    ]}
                  >
                    Điểm kế tiếp ›
                  </Text>
                </Pressable>
              </View>

              <View style={styles.evidenceRow}>
                <Text style={styles.evidenceLabel}>Nguồn lời kể:</Text>
                <Text style={styles.evidenceValue}>
                  {intro.evidence.join(' · ')}
                </Text>
              </View>

              <View style={styles.disclaimerPill}>
                <Text style={styles.disclaimerPillText}>Ảnh minh họa · {mode === 'demo' ? 'Truyện hư cấu' : 'điểm mô phỏng · nguồn Live'}</Text>
              </View>
            </View>

            {voiceActionCard && (
              <View style={styles.voiceActionCard} accessibilityLiveRegion="polite">
                {voiceActionCard.kind === 'plan' ? (
                  <>
                    <Text accessibilityRole="header" style={styles.voiceActionTitle}>Một lối đi vừa ý</Text>
                    <Text style={styles.voiceActionBody}>
                      {voiceActionCard.message ?? 'Gợi ý dựa trên quỹ thời gian và chủ đề anh vừa nói.'}
                    </Text>
                    {voiceActionCard.draft.topic && (
                      <Text style={styles.voiceActionMeta}>
                        {TOPIC_LABELS[voiceActionCard.draft.topic]}
                        {voiceActionCard.draft.budgetMinutes ? ` · ${voiceActionCard.draft.budgetMinutes} phút mô phỏng` : ''}
                      </Text>
                    )}
                    {(!voiceActionCard.draft.topic || voiceActionCard.message?.includes('chủ đề')) && (
                      <View style={styles.voiceActionChoices}>
                        {TOPICS.map((topic) => (
                          <Pressable
                            key={topic}
                            accessibilityRole="button"
                            accessibilityLabel={`Chọn chủ đề ${TOPIC_LABELS[topic]}`}
                            onPress={() => showPlanCard({ ...voiceActionCard.draft, topic })}
                            style={({ pressed }) => [styles.voiceActionChip, pressed && styles.pressed]}
                          >
                            <Text style={styles.voiceActionChipText}>{TOPIC_LABELS[topic]}</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                    {(!voiceActionCard.draft.budgetMinutes || voiceActionCard.message?.includes('thời lượng') || voiceActionCard.message?.includes('khoảng thời gian')) && (
                      <View style={styles.voiceActionChoices}>
                        {[15, 30, 45, 60].map((minutes) => (
                          <Pressable
                            key={minutes}
                            accessibilityRole="button"
                            accessibilityLabel={`Chọn ${minutes} phút`}
                            onPress={() => showPlanCard({ ...voiceActionCard.draft, budgetMinutes: minutes })}
                            style={({ pressed }) => [styles.voiceActionChip, pressed && styles.pressed]}
                          >
                            <Text style={styles.voiceActionChipText}>{minutes} phút</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                    {actionPlanResult?.kind === 'ok' && actionPlanResult.picks.map((pick) => (
                      <Pressable
                        key={pick.node.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Mở chương ${pick.node.name}`}
                        onPress={() => handleSelectNode(dataset.nodes.findIndex((node) => node.id === pick.node.id))}
                        style={({ pressed }) => [styles.voicePickRow, pressed && styles.pressed]}
                      >
                        <View style={styles.voicePickCopy}>
                          <Text style={styles.voicePickTitle}>{pick.node.name}</Text>
                          <Text style={styles.voicePickReason}>{pick.reason}</Text>
                        </View>
                        <Text style={styles.voicePickDuration}>{pick.visitMinutes}′</Text>
                      </Pressable>
                    ))}
                    {actionPlanResult?.kind === 'empty' && (
                      <Text style={styles.voiceActionBody}>Chưa có điểm phù hợp trong dữ liệu mô phỏng. Anh có thể đổi chủ đề hoặc thời gian.</Text>
                    )}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Mở bảng chọn trải nghiệm"
                      onPress={() => onOpenNotebook(voiceActionCard.draft)}
                      style={({ pressed }) => [styles.voiceActionPrimary, pressed && styles.pressed]}
                    >
                      <Text style={styles.voiceActionPrimaryText}>Mở bảng chọn trải nghiệm</Text>
                    </Pressable>
                  </>
                ) : voiceActionCard.kind === 'qr' || voiceActionCard.kind === 'gps' ? (
                  <>
                    <Text accessibilityRole="header" style={styles.voiceActionTitle}>
                      {voiceActionCard.kind === 'qr' ? 'Xác định điểm bằng mã QR' : 'Xác định điểm bằng GPS'}
                    </Text>
                    <Text style={styles.voiceActionBody}>
                      {voiceActionCard.kind === 'qr'
                        ? 'Máy ảnh chỉ mở sau khi anh chạm nút. Nếu chưa quét được, vẫn có thể chọn điểm bằng tay.'
                        : 'Vị trí chỉ được đọc một lần sau khi anh chạm nút Dùng GPS. Điểm mô phỏng chưa xác nhận vị trí thật.'}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={voiceActionCard.kind === 'qr' ? 'Mở thẻ quét QR' : 'Mở thẻ GPS'}
                      onPress={voiceActionCard.kind === 'qr' ? onOpenCamera : onOpenLocation}
                      style={({ pressed }) => [styles.voiceActionPrimary, pressed && styles.pressed]}
                    >
                      <Text style={styles.voiceActionPrimaryText}>{voiceActionCard.kind === 'qr' ? 'Mở thẻ quét QR' : 'Mở thẻ GPS'}</Text>
                    </Pressable>
                  </>
                ) : voiceActionCard.kind === 'mixed' ? (
                  <>
                    <Text accessibilityRole="header" style={styles.voiceActionTitle}>{voiceActionCard.message}</Text>
                    <View style={styles.voiceActionChoices}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Nghe câu trả lời"
                        onPress={() => ask(voiceActionCard.questionText, 'voice', voiceActionCard.context)}
                        style={({ pressed }) => [styles.voiceActionChip, pressed && styles.pressed]}
                      >
                        <Text style={styles.voiceActionChipText}>Nghe câu trả lời</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Thực hiện thao tác"
                        onPress={() => executeAction(voiceActionCard.action, voiceActionCard.actionText)}
                        style={({ pressed }) => [styles.voiceActionPrimary, pressed && styles.pressed]}
                      >
                        <Text style={styles.voiceActionPrimaryText}>Thực hiện</Text>
                      </Pressable>
                    </View>
                  </>
                ) : voiceActionCard.kind === 'reference' ? (
                  <>
                    <Text accessibilityRole="header" style={styles.voiceActionTitle}>Chọn câu muốn hỏi</Text>
                    <Text style={styles.voiceActionBody}>{voiceActionCard.message}</Text>
                    {nodeQa.slice(0, CHIP_COUNT).map((item) => (
                      <Pressable
                        key={item.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Hỏi: ${item.question}`}
                        onPress={() => ask(item.question, 'chip')}
                        style={({ pressed }) => [styles.voiceReferenceRow, pressed && styles.pressed]}
                      >
                        <Text style={styles.voiceReferenceText}>{item.question}</Text>
                      </Pressable>
                    ))}
                  </>
                ) : voiceActionCard.kind === 'notice' ? (
                  <Text style={styles.voiceActionBody}>{voiceActionCard.message}</Text>
                ) : null}
              </View>
            )}

            {nodeQa.length === 0 && <View style={styles.emptyNotice}><Text style={styles.noDataTitle}>Chưa có câu hỏi cho điểm này</Text><Text style={styles.noDataBody}>Bạn vẫn có thể đọc lời kể hoặc chọn điểm khác ở phía trên.</Text></View>}

            {/* THẺ KẾT QUẢ CÂU TRẢ LỜI ĐÃ KIỂM CHỨNG */}
            {match !== null && (
              <Animated.View
                onLayout={(event) => { answerY.current = event.nativeEvent.layout.y; }}
                style={[
                  styles.answerCard,
                  {
                    transform: [{ translateY: answerTranslateY }],
                    opacity: answerOpacity,
                  },
                ]}
                accessibilityLiveRegion="polite"
              >
                <View style={styles.askedRow}>
                    {isTextVisible && <>
                  <Text style={styles.askedPrefix}>Bạn vừa hỏi:</Text>
                  <Text style={styles.askedQuestion}>“{asked}”</Text>
                    </>}
                </View>

                {entry === null ? (
                  <View style={styles.noDataBox}>
                    <Text style={styles.noDataTitle}>
                      {askedSource === 'voice' ? 'Câu hỏi chưa khớp' : 'Chưa có lời kể cho câu này'}
                    </Text>
                    <Text style={styles.noDataBody}>
                      {askedSource === 'voice'
                        ? 'Người kể nhận được lời nói nhưng chưa khớp câu hỏi mẫu ở điểm này. Xem câu đã nhận dạng để kiểm tra, thử lại bằng mic hoặc chọn câu gợi ý bên dưới.'
                        : 'Chưa có dữ liệu cho câu hỏi này trong nguồn hiện tại. Bạn có thể chọn các câu hỏi mẫu bên dưới.'}
                    </Text>
                    {asked && !isTextVisible && (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={askedSource === 'voice' ? 'Xem câu đã nhận dạng' : 'Xem câu vừa hỏi'}
                        onPress={() => setIsTextVisible(true)}
                        style={({ pressed }) => [styles.readerToggle, pressed && styles.pressed]}
                      >
                        <AppIcon name="text" size={18} color="#F2C56B" />
                        <Text style={styles.readerToggleText}>
                          {askedSource === 'voice' ? 'Xem câu đã nhận dạng' : 'Xem câu vừa hỏi'}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                ) : (
                  <View style={styles.verifiedBox}>
                    <View style={styles.verifiedTag}>
                      <Text style={styles.verifiedTagText}>{mode === 'demo' ? 'LỜI KỂ TRONG TRUYỆN' : 'NỘI DUNG CÓ NGUỒN'}</Text>
                    </View>
                    {isTextVisible && <Text style={styles.answerText}>{entry.answer}</Text>}
                    {answerTrack && currentNode && (
                      <VoicePlayerBar
                        label="Câu trả lời"
                        active={voiceSession.activeTrackId === answerTrackId}
                        playing={voiceSession.playback.playing}
                        currentTime={voiceSession.playback.currentTime}
                        duration={voiceSession.activeTrackId === answerTrackId ? voiceSession.playback.duration : 0}
                        measuredDuration={answerTrack.durationSeconds}
                        onPlay={() => requestTrack(answerTrackId, entry.answer, 'answer', currentNode.id)}
                        onReplay={() => requestTrack(answerTrackId, entry.answer, 'answer', currentNode.id, true)}
                        onStop={voiceSession.stopPlayback}
                      />
                    )}
                    {playbackError && <Text accessibilityRole="alert" style={styles.playbackError}>{playbackError}</Text>}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={isTextVisible ? 'Thu gọn câu trả lời' : 'Xem câu trả lời bằng chữ'}
                      accessibilityState={{ expanded: isTextVisible }}
                      onPress={() => setIsTextVisible((visible) => !visible)}
                      style={({ pressed }) => [styles.readerToggle, pressed && styles.pressed]}
                    >
                      <AppIcon name="text" size={18} color="#F2C56B" />
                      <Text style={styles.readerToggleText}>{isTextVisible ? 'Thu gọn chữ' : 'Xem lời kể bằng chữ'}</Text>
                    </Pressable>
                    <View style={styles.evidenceRow}>
                      <Text style={styles.evidenceLabel}>Nguồn nội dung:</Text>
                      <Text style={styles.evidenceValue}>{entry.evidence.join(' · ')}</Text>
                    </View>
                  </View>
                )}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Đặt câu hỏi khác"
                  onPress={() => {
                    playbackIntent.current += 1;
                    void voiceSession.stopPlayback().then((stopped) => {
                      if (stopped === false) setVoiceActionCard({ kind: 'notice', message: 'Lời kể chưa dừng hẳn. Hãy thử lại sau một chút.' });
                    });
                    setMatch(null);
                    setAsked(null);
                    setAskedSource(null);
                  }}
                  style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
                >
                  <Text style={styles.resetButtonText}>← Đặt câu hỏi khác</Text>
                </Pressable>
              </Animated.View>
            )}

            {/* CÂU HỎI TIẾP THEO (FOLLOW-UPS) */}
            {entry !== null && followUps.length > 0 && (
              <View style={styles.chipsSection}>
                <Text style={styles.chipsSectionTitle}>Bạn có thể muốn biết thêm</Text>
                <View style={styles.chipsContainer}>
                  {followUps.map((item) => (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Hỏi tiếp: ${item.question}`}
                      onPress={() => ask(item.question, 'chip')}
                      style={({ pressed }) => [styles.chipPill, pressed && styles.pressed]}
                    >
                      <Text style={styles.chipText}>{item.question}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* CÁC CÂU HỎI GỢI Ý CHẠM NHANH BAN ĐẦU */}
            {entry === null && nodeQa.length > 0 && (
              <View style={styles.chipsSection}>
                <Text style={styles.chipsSectionTitle}>Câu hỏi gợi ý ngõ phố:</Text>
                <View style={styles.chipsContainer}>
                  {nodeQa.slice(0, CHIP_COUNT).map((item) => (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Hỏi: ${item.question}`}
                      onPress={() => ask(item.question)}
                      style={({ pressed }) => [styles.chipPill, pressed && styles.pressed]}
                    >
                      <Text style={styles.chipIcon}>💬</Text>
                      <Text style={styles.chipText}>{item.question}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.spacer} />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* THANH DOCK TƯƠNG TÁC GIỌNG NÓI & NHẬP CHỮ DƯỚI ĐÁY */}
        <View
          style={[styles.dockWrapper, { paddingBottom: bottomInset }]}
          onLayout={({ nativeEvent }) => {
            const height = nativeEvent.layout.height;
            setDockHeight((currentHeight) => currentHeight === height ? currentHeight : height);
          }}
        >
          <VoiceInteractionDock
            stage={voiceSession.stage}
            error={voiceSession.error}
            recordingDurationMs={voiceSession.recordingDurationMs}
            metering={voiceSession.metering}
            onStartRecording={() => {
              playbackIntent.current += 1;
              void voiceSession.startRecording();
            }}
            onSubmitRecording={() => void voiceSession.submitRecording()}
            onCancel={voiceSession.cancel}
            onOpenInput={() => setIsInputDrawerVisible(true)}
            onOpenSettings={voiceSession.permissionBlocked ? () => { void Linking.openSettings().catch(() => undefined); } : undefined}
            onQuickAction={onOpenNotebook}
          />
        </View>
      </ImageBackground>

      {/* DRAWER BÀN PHÍM THU GỌN */}
      <ExpandableInputDrawer
        visible={isInputDrawerVisible}
        value={drawerText}
        onChangeText={setDrawerText}
        onSubmit={() => ask(drawerText)}
        onClose={() => setIsInputDrawerVisible(false)}
        placeholder={`Hỏi về ${currentNode ? currentNode.name : 'điểm này'}...`}
        suggestedQuestions={quickQuestions}
        onSelectSuggestion={(q) => ask(q)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#1E2019',
  },
  fullBleedBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrimOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(20, 22, 18, 0.46)',
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    zIndex: 10,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(28, 20, 16, 0.60)',
    borderWidth: 1,
    borderColor: 'rgba(255, 245, 230, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 26,
    lineHeight: 28,
    fontWeight: '300',
    color: '#FFFDF7',
    textAlign: 'center',
    marginTop: -2,
  },
  topBarCenterGroup: {
    flex: 1,
    marginLeft: 12,
    gap: 5,
  },
  storySegmentRow: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
  },
  storySegmentTouch: { flex: 1, minWidth: 44, minHeight: 48, justifyContent: 'center', paddingHorizontal: 3 },
  storySegment: {
    width: '100%',
    height: 3.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  storySegmentActive: {
    backgroundColor: '#E5A842',
  },
  storySegmentVisited: {
    backgroundColor: '#FFFDF7',
  },
  screenTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFDF7',
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  creditPill: {
    backgroundColor: 'rgba(28, 20, 16, 0.60)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 245, 230, 0.15)',
  },
  creditPillText: {
    fontSize: 12,
    color: '#E8D5BC',
    fontStyle: 'italic',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  floatingStoryCard: {
    backgroundColor: 'rgba(255, 253, 247, 0.94)',
    borderRadius: 20,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    gap: spacing.md,
  },
  storyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  narratorIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2A6F50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  narratorIconText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  narratorHeaderText: {
    flex: 1,
  },
  phaseTag: {
    ...typography.micro,
    color: '#8C5A40',
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  nodeMainName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  waveformDuration: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#5C483D',
  },
  readerToggle: {
    alignSelf: 'flex-start',
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: '#294336',
  },
  readerToggleText: { color: '#FFFDF7', fontSize: 14, fontWeight: '700' },
  playbackError: { color: '#9D3B32', fontSize: 13, lineHeight: 18 },
  storyText: {
    fontSize: 17,
    lineHeight: 26,
    color: '#382D26',
    fontWeight: '400',
  },
  stepNavigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderColor: '#EFE5D4',
  },
  stepNavButton: {
    backgroundColor: '#F3E9DA',
    paddingHorizontal: 12,
    minHeight: 48,
    justifyContent: 'center',
    flexShrink: 1,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E4D5BE',
  },
  stepNavButtonDisabled: {
    opacity: 0.35,
  },
  stepNavText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A3B32',
  },
  stepNavTextDisabled: {
    color: '#A8998C',
  },
  stepIndicatorBadge: {
    paddingHorizontal: 8,
  },
  stepIndicatorText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#8C5A40',
  },
  evidenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    paddingTop: 2,
  },
  evidenceLabel: {
    ...typography.micro,
    color: colors.muted,
    fontWeight: '700',
  },
  evidenceValue: {
    ...typography.micro,
    color: colors.text,
    flex: 1,
  },
  disclaimerPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFE8DA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  disclaimerPillText: {
    fontSize: 9.5,
    fontStyle: 'italic',
    color: '#7C6A5A',
  },
  answerCard: {
    backgroundColor: 'rgba(255, 253, 247, 0.95)',
    borderRadius: 18,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#EAE1CE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    gap: spacing.sm,
  },
  askedRow: {
    gap: 2,
  },
  askedPrefix: {
    ...typography.micro,
    color: colors.muted,
  },
  askedQuestion: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  verifiedBox: {
    gap: 6,
    paddingVertical: 4,
  },
  verifiedTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#2A6F50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  answerText: {
    fontSize: 17,
    lineHeight: 26,
    color: colors.text,
  },
  emptyNotice: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, gap: 8 },
  noDataBox: {
    gap: 4,
    paddingVertical: 4,
  },
  noDataTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A83226',
  },
  noDataBody: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  resetButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2A6F50',
  },
  chipsSection: {
    gap: spacing.xs,
  },
  chipsSectionTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: 'rgba(255, 253, 247, 0.9)',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    backgroundColor: 'rgba(255, 253, 247, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  chipIcon: {
    fontSize: 12,
  },
  chipText: {
    fontSize: 15,
    flexShrink: 1,
    fontWeight: '600',
    color: colors.text,
  },
  voiceActionCard: {
    backgroundColor: '#F6F0E4',
    borderColor: '#D9C9AA',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 9,
  },
  voiceActionTitle: { color: '#24392E', fontSize: 17, fontWeight: '800' },
  voiceActionBody: { color: '#514A3F', fontSize: 14, lineHeight: 20 },
  voiceActionMeta: { color: '#2E644B', fontSize: 13, fontWeight: '700' },
  voiceActionChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  voiceActionChip: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 13,
    borderRadius: radius.pill,
    backgroundColor: '#E9DEC8',
    borderWidth: 1,
    borderColor: '#D6C7A9',
  },
  voiceActionChipText: { color: '#34483B', fontSize: 13, fontWeight: '700' },
  voiceActionPrimary: {
    minHeight: 48,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: '#26483A',
  },
  voiceActionPrimaryText: { color: '#F9D37C', fontSize: 13, fontWeight: '800' },
  voicePickRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomColor: '#DED2BE',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  voicePickCopy: { flex: 1, gap: 2 },
  voicePickTitle: { color: '#2F4539', fontSize: 15, fontWeight: '800' },
  voicePickReason: { color: '#625A4E', fontSize: 12, lineHeight: 17 },
  voicePickDuration: { color: '#8C5A40', fontSize: 13, fontWeight: '800' },
  voiceReferenceRow: { minHeight: 48, justifyContent: 'center', paddingVertical: 7, borderBottomColor: '#DED2BE', borderBottomWidth: StyleSheet.hairlineWidth },
  voiceReferenceText: { color: '#34483B', fontSize: 14, fontWeight: '600', lineHeight: 20 },
  spacer: {
    height: 40,
  },
  dockWrapper: {
    zIndex: 10,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
