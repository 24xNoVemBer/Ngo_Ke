import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { NotebookDrawerModal } from '../components/NotebookDrawerModal';
import { getSourceState, type SourceState } from '../data/sourceState';
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
import { TOPICS, type AnyDemoDataset, type Mode, type Topic } from '../data/sourceState';
import { findAnswer, type QaEntry, type QaMatch } from '../qa/match';
import { pickPoints, type PlanDraft } from '../recommendation/pick';
import { HERO_PHOTO, getNodePhoto } from '../assets/photoMap';
import { VoiceInteractionDock } from '../components/VoiceInteractionDock';
import { VoicePlayerBar } from '../components/VoicePlayerBar';
import { AppIcon } from '../components/AppIcon';
import { ExpandableInputDrawer } from '../components/ExpandableInputDrawer';
import { useMotionState } from '../hooks/MotionPreferences';
import { useVoiceSession, type VoiceTurnContext } from '../voice/useVoiceSession';
import { recordVoicePerformance, voicePerformanceNow } from '../voice/performance';
import { parseVoiceIntent, resolveFirstOptionReference, type VoiceOptionContext } from '../voice/intent';
import { lookupVoiceTrack } from '../voice/localizedCatalog';
import { useLocale } from '../context/LocaleContext';
import type { TranslationKey } from '../i18n/translator';
import { getScopedCompanion, THREE_LENSES_COLLECTION_ID } from '../data/threeLensesCompanion';
import { colors, radius, spacing, typography } from '../theme';
import { motionDurations, motionEasings } from '../theme/motion';

const CHIP_COUNT = 4;

type Props = {
  mode?: Mode;
  source?: SourceState;
  onModeChange?: (mode: Mode) => void;
  liveBusy?: boolean;
  onRetryLive?: () => void;
  dataset: AnyDemoDataset;
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
  | { kind: 'plan'; draft: PlanDraft; message?: string; missingSlot?: 'topic' | 'budget' | 'both' }
  | { kind: 'qr' | 'gps' }
  | { kind: 'reference'; message: string }
  | { kind: 'mixed'; message: string; questionText: string; actionText: string; action: 'next' | 'plan' | 'open-qr' | 'open-gps'; context: VoiceTurnContext }
  | { kind: 'notice'; message: string };

function followUpEntries(entry: QaEntry, all: readonly QaEntry[]): QaEntry[] {
  return entry.followUps
    .map((id) => all.find((item) => item.id === id))
    .filter((item): item is QaEntry => item !== undefined);
}

function getTopicLabel(topic: Topic, tFunc: (k: TranslationKey) => string): string {
  switch (topic) {
    case 'an thuc': return tFunc('plan.topic_food');
    case 'chuyen xua': return tFunc('plan.topic_history');
    case 'kham pha tu do': return tFunc('plan.topic_explore');
  }
}

export function QaScreen({
  mode = 'demo',
  source,
  onModeChange,
  liveBusy = false,
  onRetryLive,
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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [notebookVisible, setNotebookVisible] = useState(false);
  const { locale, collectionId, t } = useLocale();
  const effectiveCollectionId = collectionId;
  const effectiveSource = source ?? getSourceState(mode, dataset, locale);

  const [asked, setAsked] = useState<string | null>(null);
  const [askedSource, setAskedSource] = useState<'voice' | 'text' | 'chip' | null>(null);
  const [match, setMatch] = useState<QaMatch | null>(null);
  const [isInputDrawerVisible, setIsInputDrawerVisible] = useState(false);
  const [drawerText, setDrawerText] = useState('');
  const [isTextVisible, setIsTextVisible] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<'chapter' | 'intro' | 'transition' | 'closing'>('chapter');
  const [dockHeight, setDockHeight] = useState(0);
  const [voiceActionCard, setVoiceActionCard] = useState<VoiceActionCard | null>(null);
  const motion = useMotionState();
  const scroll = useRef<ScrollView>(null);
  const answerY = useRef(0);
  const revealAnswer = useRef(false);
  const voiceOptionContext = useRef<VoiceOptionContext | null>(null);
  const lastTrack = useRef<{ id: string; text: string; kind: 'intro' | 'story' | 'answer'; nodeId: string; revision: string } | null>(null);
  const playbackIntent = useRef(0);
  const pendingVoicePlayback = useRef<{ turnId: string; trackId: string; startedAt: number } | null>(null);

  useEffect(() => {
    setAsked(null);
    setAskedSource(null);
    setMatch(null);
    setDrawerText('');
    setIsInputDrawerVisible(false);
    setIsTextVisible(false);
    setSelectedSegment('chapter');
    setSelectedChapterId(null);
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
    const animation = Animated.timing(answerAnim, {
      toValue: 1,
      duration: motion.active ? motionDurations.normal : 0,
      easing: motionEasings.gentleOut,
      useNativeDriver: true,
    });
    if (motion.active) animation.start();
    const timer = setTimeout(() => {
      if (isFocused && revealAnswer.current) {
        revealAnswer.current = false;
        scroll.current?.scrollTo({ y: Math.max(0, answerY.current - 12), animated: motion.active });
      }
    }, motion.active ? motionDurations.normal : 0);
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

  const actualCollectionId = ('collectionId' in dataset && typeof dataset.collectionId === 'string' && dataset.collectionId)
    ? dataset.collectionId
    : (collectionId ?? 'fiction-letter');
  const isReviewedContent = 'kind' in dataset && dataset.kind === 'reviewed';
  const isThreeLenses = actualCollectionId === THREE_LENSES_COLLECTION_ID && isReviewedContent;
  const intro = dataset.intro;

  const companion = getScopedCompanion({
    mode,
    collectionId: actualCollectionId,
    locale,
    datasetRevision,
    dataset,
  });

  const nodeChapters = companion
    ? companion.chapters.filter((c) => c.nodeId === currentNode?.id)
    : [];

  const activeChapter = (companion && nodeChapters.length > 0)
    ? (nodeChapters.find((c) => c.id === selectedChapterId) ?? nodeChapters[0])
    : null;

  const nodeTransition = companion?.transitions.find((t) => t.nodeId === currentNode?.id);
  const nodeClosing = currentNode?.id === 'oldquarter-dong-xuan' ? companion?.closing : undefined;

  const currentSegmentData = (() => {
    if (selectedSegment === 'intro') {
      return {
        title: isThreeLenses
          ? (locale === 'en' ? 'Opening — Three lenses on the Old Quarter' : 'Phần mở đầu — Ba lát cắt phố cổ')
          : (locale === 'en' ? 'Opening introduction' : 'Phần mở đầu'),
        text: intro.text,
        voiceContentId: 'intro',
        evidence: intro.evidence,
        nodeId: currentNode?.id ?? 'intro',
        isStory: false,
        kind: 'intro' as const,
      };
    }
    if (selectedSegment === 'transition' && nodeTransition) {
      return {
        title: nodeTransition.title,
        text: nodeTransition.text,
        voiceContentId: nodeTransition.voiceContentId,
        evidence: nodeTransition.evidence,
        nodeId: currentNode?.id ?? 'intro',
        isStory: false,
        kind: 'story' as const,
      };
    }
    if (selectedSegment === 'closing' && nodeClosing) {
      return {
        title: nodeClosing.title,
        text: nodeClosing.text,
        voiceContentId: nodeClosing.voiceContentId,
        evidence: nodeClosing.evidence,
        nodeId: currentNode?.id ?? 'intro',
        isStory: false,
        kind: 'story' as const,
      };
    }
    return {
      title: activeChapter ? activeChapter.title : (currentNode ? currentNode.name : t('qa.opening_stop')),
      text: activeChapter ? activeChapter.text : (currentNode ? (currentNode.story ?? currentNode.summary ?? intro.text) : intro.text),
      voiceContentId: activeChapter ? activeChapter.voiceContentId : (currentNode ? `${currentNode.id}-story` : 'intro'),
      evidence: activeChapter ? activeChapter.evidence : (currentNode?.evidence ?? intro.evidence),
      nodeId: currentNode?.id ?? 'intro',
      isStory: true,
      kind: (activeChapter || currentNode) ? ('story' as const) : ('intro' as const),
    };
  })();

  const currentPhoto = activeChapter
    ? getNodePhoto(currentNode?.id, activeChapter.photoKey)
    : (currentNode ? getNodePhoto(currentNode.id) : HERO_PHOTO);

  const chapterQa = (activeChapter && activeChapter.qaIds && activeChapter.qaIds.length > 0)
    ? nodeQa.filter((q) => activeChapter.qaIds.includes(q.id))
    : nodeQa;
  const displayedQa = chapterQa.length > 0 ? chapterQa : nodeQa;

  function handleSelectNode(index: number): void {
    const target = dataset.nodes[index];
    if (target?.available) {
      if (voiceSession.playback.playing) {
        void voiceSession.stopPlayback();
      }
      setSelectedSegment('chapter');
      setSelectedChapterId(null);
      setAsked(null);
      setAskedSource(null);
      setMatch(null);
      setDrawerText('');
      setIsInputDrawerVisible(false);
      onSelectNode(target.id);
    }
  }

  function handleSelectChapter(chapterId: string): void {
    playbackIntent.current += 1;
    pendingVoicePlayback.current = null;
    lastTrack.current = null;
    void voiceSession.stopPlayback();
    setAsked(null);
    setAskedSource(null);
    setMatch(null);
    setVoiceActionCard(null);
    setSelectedSegment('chapter');
    setSelectedChapterId(chapterId);
    setIsTextVisible(true);
  }

  function handleSelectSegment(segment: 'chapter' | 'intro' | 'transition' | 'closing'): void {
    playbackIntent.current += 1;
    pendingVoicePlayback.current = null;
    lastTrack.current = null;
    void voiceSession.stopPlayback();
    setAsked(null);
    setAskedSource(null);
    setMatch(null);
    setVoiceActionCard(null);
    setSelectedSegment(segment);
    setIsTextVisible(true);
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
    const actualCollectionId = ('collectionId' in dataset && typeof dataset.collectionId === 'string' && dataset.collectionId)
      ? dataset.collectionId
      : (collectionId ?? 'fiction-letter');
    if (source === 'voice' && nextMatch.status === 'matched' && currentNode) {
      const id = `${nextMatch.entry.id}-answer`;
      const matchedTrack = lookupVoiceTrack({
        collectionId: actualCollectionId,
        locale,
        contentId: id,
        datasetRevision,
      });
      if (matchedTrack) {
        if (context) pendingVoicePlayback.current = { turnId: context.turnId, trackId: id, startedAt: voicePerformanceNow() };
        lastTrack.current = { id, text: nextMatch.entry.answer, kind: 'answer', nodeId: currentNode.id, revision: datasetRevision };
        void playbackStopped.then((stopped) => {
          if (currentPlaybackIntent !== playbackIntent.current) return;
          if (stopped !== false) return voiceSession.playTrack(id, nextMatch.entry.answer, 'answer', currentNode.id);
          if (context && pendingVoicePlayback.current?.turnId === context.turnId) pendingVoicePlayback.current = null;
          setVoiceActionCard({ kind: 'notice', message: t('voice.notice.stop_pending') });
        });
      } else {
        pendingVoicePlayback.current = null;
        lastTrack.current = null;
        setVoiceActionCard({
          kind: 'notice',
          message: mode === 'demo' ? t('voice.notice.audio_unavailable') : t('voice.notice.answer_matched_read_text'),
        });
      }
    }
  }

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
    locale,
    collectionId: actualCollectionId,
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
      ? t('voice.notice.audio_unavailable')
      : null
  );
  const storyTrackId = currentSegmentData.voiceContentId;
  const storyTrack = lookupVoiceTrack({
    collectionId: actualCollectionId,
    locale,
    contentId: storyTrackId,
    datasetRevision,
  });
  const introTrack = storyTrackId === 'intro'
    ? storyTrack
    : lookupVoiceTrack({
        collectionId: actualCollectionId,
        locale,
        contentId: 'intro',
        datasetRevision,
      });
  const hasIntro = isThreeLenses || Boolean(introTrack);
  const answerTrackId = entry ? `${entry.id}-answer` : '';
  const answerTrack = entry
    ? lookupVoiceTrack({
        collectionId: actualCollectionId,
        locale,
        contentId: answerTrackId,
        datasetRevision,
      })
    : undefined;
  const actionPlanResult = voiceActionCard?.kind === 'plan' && voiceActionCard.draft.topic && voiceActionCard.draft.budgetMinutes
    ? pickPoints(dataset.nodes, voiceActionCard.draft)
    : undefined;

  function requestTrack(id: string, text: string, kind: 'intro' | 'story' | 'answer', nodeId: string, replay = false): void {
    playbackIntent.current += 1;
    lastTrack.current = { id, text, kind, nodeId, revision: datasetRevision };
    if (replay) void voiceSession.replayTrack(id, text, kind, nodeId);
    else void voiceSession.playTrack(id, text, kind, nodeId);
  }

  function showPlanCard(draft: PlanDraft, message?: string): void {
    onPlanDraftChange(draft);
    const missingSlot: 'topic' | 'budget' | 'both' | undefined =
      !draft.topic && !draft.budgetMinutes
        ? 'both'
        : !draft.topic
        ? 'topic'
        : !draft.budgetMinutes
        ? 'budget'
        : undefined;
    setVoiceActionCard({ kind: 'plan', draft, message, missingSlot });
  }

  function executeAction(action: 'next' | 'plan' | 'open-qr' | 'open-gps', actionText: string): void {
    if (action === 'next') {
      if (nextIndex < 0) setVoiceActionCard({ kind: 'notice', message: t('voice.notice.last_chapter') });
      else handleNext();
      return;
    }
    if (action === 'plan') {
      const result = parseVoiceIntent(actionText, false, planDraft, locale);
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
      setVoiceActionCard({ kind: 'reference', message: t('voice.notice.reference_missing') });
      return;
    }
    if (reference.type === 'resolved') {
      const option = nodeQa.find((item) => item.id === reference.value);
      if (option) ask(option.question, 'voice', context);
      else setVoiceActionCard({ kind: 'reference', message: t('voice.notice.reference_changed') });
      return;
    }

    const intent = parseVoiceIntent(transcript, voiceActionCard?.kind === 'plan', planDraft, locale);
    if (intent.type !== 'question') voiceOptionContext.current = null;
    if (intent.type === 'question') {
      setVoiceActionCard(null);
      ask(transcript, 'voice', context);
    } else if (intent.type === 'plan') {
      showPlanCard(intent.draft, intent.ambiguous);
    } else if (intent.type === 'clarify') {
      setVoiceActionCard({ kind: 'mixed', message: intent.message, questionText: intent.questionText, actionText: intent.actionText, action: intent.action, context });
    } else if (intent.type === 'listen') {
      if (!storyTrack || !currentNode) {
        setVoiceActionCard({ kind: 'notice', message: mode === 'live' ? t('voice.notice.live_no_audio') : t('voice.notice.audio_unavailable') });
      } else requestTrack(currentSegmentData.voiceContentId, currentSegmentData.text, currentSegmentData.kind, currentSegmentData.nodeId);
    } else if (intent.type === 'replay') {
      const last = lastTrack.current;
      if (last && last.nodeId === currentNode?.id && last.revision === datasetRevision) {
        requestTrack(last.id, last.text, last.kind, last.nodeId, true);
      } else if (entry && currentNode && answerTrack) {
        requestTrack(answerTrackId, entry.answer, 'answer', currentNode.id, true);
      } else if (currentNode && storyTrack) {
        requestTrack(currentSegmentData.voiceContentId, currentSegmentData.text, currentSegmentData.kind, currentSegmentData.nodeId, true);
      } else {
        setVoiceActionCard({ kind: 'notice', message: mode === 'live' ? t('voice.notice.live_answer_no_audio') : t('voice.notice.audio_unavailable') });
      }
    } else if (intent.type === 'stop') {
      void voiceSession.stopPlayback().then((stopped) => {
        setVoiceActionCard({ kind: 'notice', message: stopped !== false ? t('voice.notice.playback_stopped') : t('voice.notice.stop_pending') });
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
            accessibilityLabel={t('common.back')}
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
                  accessibilityLabel={t('home.open_story', { name: node.name })}
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
              {t('home.stop_prefix')} {String(activeIndex + 1).padStart(2, '0')}/{dataset.nodes.length}:{' '}
              {currentNode ? currentNode.name : t('qa.explore_alley')}
            </Text>
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
                  <Text style={styles.narratorIconText}>{t('qa.narrator_badge')}</Text>
                </View>
                <View style={styles.narratorHeaderText}>
                  <Text style={styles.phaseTag}>{t('qa.narrator_header')}</Text>
                  <Text accessibilityRole="header" style={styles.nodeMainName}>
                    {currentSegmentData.title}
                  </Text>
                </View>
              </View>

              {/* ĐIỀU HƯỚNG CÁC CHƯƠNG KỂ CHUYỆN (MULTI-CHAPTER SELECTOR) */}
              {nodeChapters.length > 1 && (
                <View
                  style={styles.chapterSelectorRow}
                  accessibilityRole="tablist"
                  accessibilityLabel={t('qa.chapter_selector_label')}
                >
                  {nodeChapters.map((ch, idx) => {
                    const isSelected = selectedSegment === 'chapter' && (activeChapter?.id === ch.id);
                    return (
                      <Pressable
                        key={ch.id}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: isSelected }}
                        accessibilityLabel={ch.title}
                        onPress={() => handleSelectChapter(ch.id)}
                        style={({ pressed }) => [
                          styles.chapterTabButton,
                          isSelected && styles.chapterTabButtonActive,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={[styles.chapterTabText, isSelected && styles.chapterTabTextActive]}>
                          {`${idx + 1}. ${ch.title}`}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {/* NÚT CHUYỂN ĐOẠN / KẾT THÚC / QUAY LẠI CÂU CHUYỆN */}
              {(nodeTransition || nodeClosing || selectedSegment !== 'chapter' || hasIntro) && (
                <View style={styles.journeySegmentControls}>
                  {selectedSegment !== 'chapter' && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={locale === 'en' ? 'Back to chapter story' : 'Quay lại câu chuyện chính'}
                      onPress={() => handleSelectSegment('chapter')}
                      style={({ pressed }) => [styles.journeySegmentBtn, styles.journeySegmentBtnActive, pressed && styles.pressed]}
                    >
                      <Text style={[styles.journeySegmentText, styles.journeySegmentTextActive]}>
                        ← {locale === 'en' ? 'Back to story' : 'Quay lại điểm dừng'}
                      </Text>
                    </Pressable>
                  )}
                  {hasIntro && selectedSegment !== 'intro' && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={locale === 'en' ? 'Opening narration' : 'Phần mở đầu'}
                      onPress={() => handleSelectSegment('intro')}
                      style={({ pressed }) => [styles.journeySegmentBtn, pressed && styles.pressed]}
                    >
                      <Text style={styles.journeySegmentText}>
                        🎙️ {locale === 'en' ? 'Opening' : 'Mở đầu'}
                      </Text>
                    </Pressable>
                  )}
                  {nodeTransition && selectedSegment !== 'transition' && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={nodeTransition.title}
                      onPress={() => handleSelectSegment('transition')}
                      style={({ pressed }) => [styles.journeySegmentBtn, pressed && styles.pressed]}
                    >
                      <Text style={styles.journeySegmentText}>
                        🛤️ {nodeTransition.title}
                      </Text>
                    </Pressable>
                  )}
                  {nodeClosing && selectedSegment !== 'closing' && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={nodeClosing.title}
                      onPress={() => handleSelectSegment('closing')}
                      style={({ pressed }) => [styles.journeySegmentBtn, pressed && styles.pressed]}
                    >
                      <Text style={styles.journeySegmentText}>
                        🏁 {nodeClosing.title}
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}

              {storyTrack && (
                <VoicePlayerBar
                  label={`${t('qa.story_label')} · ${currentSegmentData.title}`}
                  active={voiceSession.activeTrackId === currentSegmentData.voiceContentId}
                  playing={voiceSession.playback.playing}
                  currentTime={voiceSession.playback.currentTime}
                  duration={voiceSession.activeTrackId === currentSegmentData.voiceContentId ? voiceSession.playback.duration : 0}
                  measuredDuration={storyTrack.durationSeconds}
                  onPlay={() => requestTrack(currentSegmentData.voiceContentId, currentSegmentData.text, currentSegmentData.kind, currentSegmentData.nodeId)}
                  onReplay={() => requestTrack(currentSegmentData.voiceContentId, currentSegmentData.text, currentSegmentData.kind, currentSegmentData.nodeId, true)}
                  onStop={voiceSession.stopPlayback}
                />
              )}
              {mode === 'live' && !storyTrack && <Text style={styles.noDataBody}>{t('voice.notice.live_no_audio')}</Text>}
              {playbackError && <Text accessibilityRole="alert" style={styles.playbackError}>{playbackError}</Text>}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isTextVisible ? t('qa.collapse_text') : t('qa.read_text')}
                accessibilityState={{ expanded: isTextVisible }}
                onPress={() => setIsTextVisible((visible) => !visible)}
                style={({ pressed }) => [styles.readerToggle, pressed && styles.pressed]}
              >
                <AppIcon name="text" size={18} color="#2D5748" />
                <Text style={styles.readerToggleText}>{isTextVisible ? t('qa.collapse_text') : t('qa.read_text')}</Text>
              </Pressable>
              {isTextVisible && (
                <Text style={styles.storyText}>{currentSegmentData.text}</Text>
              )}

              {/* Bộ điều hướng chuyển điểm trước/sau trong ngõ */}
              <View style={styles.stepNavigationRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('qa.prev_stop_label')}
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
                    {t('qa.prev_stop')}
                  </Text>
                </Pressable>

                <View style={styles.stepIndicatorBadge}>
                  <Text style={styles.stepIndicatorText}>
                    {activeIndex + 1} / {dataset.nodes.length}
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('qa.next_stop_label')}
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
                    {t('qa.next_stop')}
                  </Text>
                </Pressable>
              </View>

            </View>

            {voiceActionCard && (
              <View style={styles.voiceActionCard} accessibilityLiveRegion="polite">
                {voiceActionCard.kind === 'plan' ? (
                  <>
                    <Text accessibilityRole="header" style={styles.voiceActionTitle}>{t('qa.voice_plan_title')}</Text>
                    <Text style={styles.voiceActionBody}>
                      {voiceActionCard.message ?? t('qa.voice_plan_body')}
                    </Text>
                    {voiceActionCard.draft.topic && (
                      <Text style={styles.voiceActionMeta}>
                        {getTopicLabel(voiceActionCard.draft.topic, t)}
                        {voiceActionCard.draft.budgetMinutes ? ` · ${voiceActionCard.draft.budgetMinutes} ${t('qa.minutes')}` : ''}
                      </Text>
                    )}
                    {(!voiceActionCard.draft.topic || voiceActionCard.missingSlot === 'topic' || voiceActionCard.missingSlot === 'both') && (
                      <View style={styles.voiceActionChoices}>
                        {TOPICS.map((topic) => (
                          <Pressable
                            key={topic}
                            accessibilityRole="button"
                            accessibilityLabel={`${t('plan.topic_header')}: ${getTopicLabel(topic, t)}`}
                            onPress={() => showPlanCard({ ...voiceActionCard.draft, topic })}
                            style={({ pressed }) => [styles.voiceActionChip, pressed && styles.pressed]}
                          >
                            <Text style={styles.voiceActionChipText}>{getTopicLabel(topic, t)}</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                    {(!voiceActionCard.draft.budgetMinutes || voiceActionCard.missingSlot === 'budget' || voiceActionCard.missingSlot === 'both') && (
                      <View style={styles.voiceActionChoices}>
                        {[15, 30, 45, 60].map((minutes) => (
                          <Pressable
                            key={minutes}
                            accessibilityRole="button"
                            accessibilityLabel={`${minutes} ${t('qa.minutes')}`}
                            onPress={() => showPlanCard({ ...voiceActionCard.draft, budgetMinutes: minutes })}
                            style={({ pressed }) => [styles.voiceActionChip, pressed && styles.pressed]}
                          >
                            <Text style={styles.voiceActionChipText}>{minutes} {t('qa.minutes')}</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                    {actionPlanResult?.kind === 'ok' && actionPlanResult.picks.map((pick) => (
                      <Pressable
                        key={pick.node.id}
                        accessibilityRole="button"
                        accessibilityLabel={`${t('qa.open_chapter')} ${pick.node.name}`}
                        onPress={() => handleSelectNode(dataset.nodes.findIndex((node) => node.id === pick.node.id))}
                        style={({ pressed }) => [styles.voicePickRow, pressed && styles.pressed]}
                      >
                        <View style={styles.voicePickCopy}>
                          <Text style={styles.voicePickTitle}>{pick.node.name}</Text>
                          <Text style={styles.voicePickReason}>
                            {locale === 'en' && voiceActionCard.draft.topic
                              ? t('plan.pick_reason', {
                                  topic: getTopicLabel(voiceActionCard.draft.topic, t),
                                  summary: pick.node.summary,
                                })
                              : pick.reason}
                          </Text>
                        </View>
                        <Text style={styles.voicePickDuration}>{pick.visitMinutes}′</Text>
                      </Pressable>
                    ))}
                    {actionPlanResult?.kind === 'empty' && (
                      <Text style={styles.voiceActionBody}>{t('qa.voice_plan_empty')}</Text>
                    )}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t('qa.voice_plan_open')}
                      onPress={() => onOpenNotebook(voiceActionCard.draft)}
                      style={({ pressed }) => [styles.voiceActionPrimary, pressed && styles.pressed]}
                    >
                      <Text style={styles.voiceActionPrimaryText}>{t('qa.voice_plan_open')}</Text>
                    </Pressable>
                  </>
                ) : voiceActionCard.kind === 'qr' || voiceActionCard.kind === 'gps' ? (
                  <>
                    <Text accessibilityRole="header" style={styles.voiceActionTitle}>
                      {voiceActionCard.kind === 'qr' ? t('qa.voice_qr_title') : t('qa.voice_gps_title')}
                    </Text>
                    <Text style={styles.voiceActionBody}>
                      {voiceActionCard.kind === 'qr'
                        ? t('qa.voice_qr_body')
                        : t('qa.voice_gps_body')}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={voiceActionCard.kind === 'qr' ? t('qa.voice_qr_btn') : t('qa.voice_gps_btn')}
                      onPress={voiceActionCard.kind === 'qr' ? onOpenCamera : onOpenLocation}
                      style={({ pressed }) => [styles.voiceActionPrimary, pressed && styles.pressed]}
                    >
                      <Text style={styles.voiceActionPrimaryText}>{voiceActionCard.kind === 'qr' ? t('qa.voice_qr_btn') : t('qa.voice_gps_btn')}</Text>
                    </Pressable>
                  </>
                ) : voiceActionCard.kind === 'mixed' ? (
                  <>
                    <Text accessibilityRole="header" style={styles.voiceActionTitle}>{voiceActionCard.message}</Text>
                    <View style={styles.voiceActionChoices}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t('qa.listen_answer')}
                        onPress={() => ask(voiceActionCard.questionText, 'voice', voiceActionCard.context)}
                        style={({ pressed }) => [styles.voiceActionChip, pressed && styles.pressed]}
                      >
                        <Text style={styles.voiceActionChipText}>{t('qa.listen_answer')}</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t('qa.execute_action')}
                        onPress={() => executeAction(voiceActionCard.action, voiceActionCard.actionText)}
                        style={({ pressed }) => [styles.voiceActionPrimary, pressed && styles.pressed]}
                      >
                        <Text style={styles.voiceActionPrimaryText}>{t('qa.execute_action')}</Text>
                      </Pressable>
                    </View>
                  </>
                ) : voiceActionCard.kind === 'reference' ? (
                  <>
                    <Text accessibilityRole="header" style={styles.voiceActionTitle}>{t('qa.choose_question')}</Text>
                    <Text style={styles.voiceActionBody}>{voiceActionCard.message}</Text>
                    {nodeQa.slice(0, CHIP_COUNT).map((item) => (
                      <Pressable
                        key={item.id}
                        accessibilityRole="button"
                        accessibilityLabel={`${t('qa.ask_prefix')} ${item.question}`}
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

            {nodeQa.length === 0 && (
              <View style={styles.emptyNotice}>
                <Text style={styles.noDataTitle}>{t('qa.no_questions_for_node')}</Text>
                <Text style={styles.noDataBody}>{t('qa.can_read_or_choose')}</Text>
              </View>
            )}

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
                  <Text style={styles.askedPrefix}>{t('qa.asked_prefix')}</Text>
                  <Text style={styles.askedQuestion}>“{asked}”</Text>
                    </>}
                </View>

                {entry === null ? (
                  <View style={styles.noDataBox}>
                    <Text style={styles.noDataTitle}>
                      {askedSource === 'voice' ? t('qa.unmatched_question_title') : t('qa.no_match_title')}
                    </Text>
                    <Text style={styles.noDataBody}>
                      {askedSource === 'voice'
                        ? t('qa.unmatched_question_body')
                        : t('qa.no_match_body')}
                    </Text>
                    {asked && !isTextVisible && (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={askedSource === 'voice' ? t('qa.view_recognized_question') : t('qa.view_asked_question')}
                        onPress={() => setIsTextVisible(true)}
                        style={({ pressed }) => [styles.readerToggle, pressed && styles.pressed]}
                      >
                        <AppIcon name="text" size={18} color="#2D5748" />
                        <Text style={styles.readerToggleText}>
                          {askedSource === 'voice' ? t('qa.view_recognized_question') : t('qa.view_asked_question')}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                ) : (
                  <View style={styles.verifiedBox}>
                    {isTextVisible && <Text style={styles.answerText}>{entry.answer}</Text>}
                    {answerTrack && currentNode && (
                      <VoicePlayerBar
                        label={t('qa.answer_label')}
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
                      accessibilityLabel={isTextVisible ? t('qa.collapse_answer') : t('qa.read_answer_text')}
                      accessibilityState={{ expanded: isTextVisible }}
                      onPress={() => setIsTextVisible((visible) => !visible)}
                      style={({ pressed }) => [styles.readerToggle, pressed && styles.pressed]}
                    >
                      <AppIcon name="text" size={18} color="#2D5748" />
                      <Text style={styles.readerToggleText}>{isTextVisible ? t('qa.collapse_answer_btn') : t('qa.read_answer_btn')}</Text>
                    </Pressable>
                    </View>
                )}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('qa.ask_another')}
                  onPress={() => {
                    playbackIntent.current += 1;
                    void voiceSession.stopPlayback().then((stopped) => {
                      if (stopped === false) setVoiceActionCard({ kind: 'notice', message: t('voice.notice.stop_pending') });
                    });
                    setMatch(null);
                    setAsked(null);
                    setAskedSource(null);
                  }}
                  hitSlop={8}
                  style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
                >
                  <Text style={styles.resetButtonText}>← {t('qa.ask_another')}</Text>
                </Pressable>
              </Animated.View>
            )}

            {/* CÂU HỎI TIẾP THEO (FOLLOW-UPS) */}
            {entry !== null && followUps.length > 0 && (
              <View style={styles.chipsSection}>
                <Text style={styles.chipsSectionTitle}>{t('qa.follow_ups_title')}</Text>
                <View style={styles.chipsContainer}>
                  {followUps.map((item) => (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${t('qa.follow_up_prefix')} ${item.question}`}
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
            {entry === null && displayedQa.length > 0 && (
              <View style={styles.chipsSection}>
                <Text style={styles.chipsSectionTitle}>{t('qa.suggested_questions_title')}</Text>
                <View style={styles.chipsContainer}>
                  {displayedQa.slice(0, CHIP_COUNT).map((item) => (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${t('qa.ask_prefix')} ${item.question}`}
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
            onQuickAction={() => setNotebookVisible(true)}
            quickActionLabel={t('home.notebook_label')}
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
        placeholder={t('drawer.placeholder')}
        title={t('qa.ask_placeholder', { name: currentNode ? currentNode.name : t('qa.this_point') })}
        suggestedQuestions={quickQuestions}
        onSelectSuggestion={(q) => ask(q)}
      />

      {/* Shared Notebook Drawer Modal (F2) */}
      <NotebookDrawerModal
        visible={notebookVisible}
        onClose={() => setNotebookVisible(false)}
        navigation={navigation}
        mode={mode}
        onModeChange={(next) => {
          if (onModeChange) onModeChange(next);
        }}
        source={effectiveSource}
        collectionId={effectiveCollectionId}
        liveBusy={liveBusy}
        onRetryLive={onRetryLive}
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
  readerToggle: {
    alignSelf: 'flex-start',
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 13,
    borderRadius: radius.pill,
    backgroundColor: '#F7EFE1',
    borderWidth: 1,
    borderColor: '#DFD1BD',
  },
  readerToggleText: { color: '#2C221E', fontSize: 14, fontWeight: '700' },
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
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  resetButtonText: {
    fontSize: 13,
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
    backgroundColor: 'rgba(255, 253, 247, 0.94)',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(224, 214, 196, 0.85)',
    gap: 6,
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
  chapterSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: spacing.xs,
  },
  chapterTabButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(45, 87, 72, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(45, 87, 72, 0.2)',
  },
  chapterTabButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chapterTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  chapterTabTextActive: {
    color: '#FFFDF7',
  },
  journeySegmentControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.xs,
  },
  journeySegmentBtn: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(196, 92, 59, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(196, 92, 59, 0.3)',
  },
  journeySegmentBtnActive: {
    backgroundColor: colors.terracotta,
    borderColor: colors.terracotta,
  },
  journeySegmentText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.terracotta,
  },
  journeySegmentTextActive: {
    color: '#FFFDF7',
  },
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
