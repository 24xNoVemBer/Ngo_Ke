import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import {
  Animated,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync, type AudioSource } from 'expo-audio';
import type { DemoNode, Mode, SourceState } from '../data/sourceState';
import type { RootStackParamList } from '../navigation';
import { getNodePhoto, getAlleyMeta } from '../assets/photoMap';
import { AVAILABLE_COLLECTIONS, DEFAULT_COLLECTION_ID, getBundledDataset, getCollectionRevision, getLocalizedCollections, isCollectionId, type CollectionId } from '../data/collections';
import { lookupVoiceTrack } from '../voice/localizedCatalog';
import { readAlleyStory } from '../data/alleyGuide';
import { UnavailableScreen } from './UnavailableScreen';
import { useMotionState } from '../hooks/MotionPreferences';
import { CrossfadePhoto } from '../components/CrossfadePhoto';
import { AlleyTrailView } from '../components/AlleyTrailView';
import { AppIcon } from '../components/AppIcon';
import { NotebookDrawerModal } from '../components/NotebookDrawerModal';
import { AlleyStoryCard } from '../components/AlleyStoryCard';
import { ToolDock } from '../components/ToolDock';
import { usePressSpring, usePulseLoop } from '../hooks/useMotion';
import { useLocale } from '../context/LocaleContext';
import { radius, spacing } from '../theme';
import { motionDurations, motionEasings } from '../theme/motion';
import { buildSmoothPath, computeAlleyLayout } from '../utils/alleyGeometry';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'> & {
  mode: Mode;
  source: SourceState;
  onModeChange: (mode: Mode) => void;
  currentNodeId?: string;
  onSelectNode: (nodeId: string) => void;
  readNodeIds: ReadonlySet<string>;
  liveBusy?: boolean;
  onRetryLive?: () => void;
};

interface TrailPinMeta {
  id: string;
  xPct: number;
  yPct: number;
  side: 'left' | 'right';
}

const PIN_CONFIG: TrailPinMeta[] = [
  { id: 'demo-01', xPct: 0.55, yPct: 0.08, side: 'right' },
  { id: 'demo-02', xPct: 0.55, yPct: 0.23, side: 'right' },
  { id: 'demo-03', xPct: 0.45, yPct: 0.39, side: 'left' },
  { id: 'demo-04', xPct: 0.45, yPct: 0.53, side: 'left' },
  { id: 'demo-05', xPct: 0.45, yPct: 0.68, side: 'left' },
  { id: 'demo-06', xPct: 0.55, yPct: 0.84, side: 'right' },
];

export function HomeScreen({
  mode,
  source,
  onModeChange,
  currentNodeId,
  onSelectNode,
  readNodeIds,
  liveBusy = false,
  onRetryLive,
  navigation,
  route,
}: Props): ReactElement {
  const { width: screenWidth, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const motion = useMotionState();
  const { locale, setLocale, t } = useLocale();
  const collections = getLocalizedCollections(locale);
  const rawCollectionId = mode === 'live'
    ? (source.status === 'ready' && 'collectionId' in source.dataset && typeof source.dataset.collectionId === 'string'
        ? source.dataset.collectionId
        : DEFAULT_COLLECTION_ID)
    : (route.params?.alleyId
        || (source.status === 'ready' && 'collectionId' in source.dataset && typeof source.dataset.collectionId === 'string'
            ? source.dataset.collectionId
            : DEFAULT_COLLECTION_ID));
  const activeCollectionId: CollectionId = isCollectionId(rawCollectionId) ? rawCollectionId : DEFAULT_COLLECTION_ID;
  const activeCollection = collections.find((c) => c.id === activeCollectionId) ?? collections[0];
  const knownMeta = AVAILABLE_COLLECTIONS.find((c) => c.id === activeCollectionId);
  const collectionKind: 'simulated' | 'reviewed' =
    source.status === 'ready'
      ? ('kind' in source.dataset && source.dataset.kind === 'reviewed' ? 'reviewed' : 'simulated')
      : (activeCollection ? (activeCollection.kind === 'reviewed' ? 'reviewed' : 'simulated') : 'simulated');
  const alleyMeta = getAlleyMeta(route.params?.alleyId);

  const nodes = source.status === 'ready' ? source.dataset.nodes : [];
  const selectedIndex = currentNodeId
    ? Math.max(0, nodes.findIndex((n) => n.id === currentNodeId))
    : 0;

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [storyModalVisible, setStoryModalVisible] = useState(false);

  const activeDataset =
    source.status === 'ready'
      ? source.dataset
      : getBundledDataset(activeCollectionId, locale);
  const alleyStory = activeDataset ? readAlleyStory(activeDataset) : null;

  const datasetRevision =
    source.status === 'ready' && 'revision' in source && typeof source.revision === 'string'
      ? source.revision
      : typeof getCollectionRevision === 'function'
      ? getCollectionRevision(activeCollectionId, locale)
      : '';

  const introTrack = lookupVoiceTrack({
    collectionId: activeCollectionId,
    locale,
    contentId: 'intro',
    datasetRevision,
  });

  const introPlayer = useAudioPlayer(null, { updateInterval: 200, keepAudioSessionActive: true });
  const introPlayback = useAudioPlayerStatus(introPlayer);
  const isIntroPlaying = Boolean(introPlayback?.playing);
  const lastPlayedTrackRef = useRef<string | null>(null);

  const handleTogglePlayIntro = useCallback(async () => {
    if (!introTrack) return;
    if (isIntroPlaying) {
      try {
        introPlayer?.pause?.();
      } catch { /* best effort */ }
    } else {
      const trackKey = `${activeCollectionId}:${locale}:${introTrack.id}`;
      try {
        if (lastPlayedTrackRef.current !== trackKey) {
          try {
            await setAudioModeAsync?.({ allowsRecording: false, playsInSilentMode: true });
          } catch { /* best effort */ }
          introPlayer?.replace?.(introTrack.source as AudioSource);
          lastPlayedTrackRef.current = trackKey;
        }
        introPlayer?.play?.();
      } catch { /* best effort */ }
    }
  }, [introTrack, isIntroPlaying, introPlayer, activeCollectionId, locale]);

  const handleStopIntro = useCallback(() => {
    try {
      introPlayer?.pause?.();
    } catch { /* best effort */ }
  }, [introPlayer]);

  useEffect(() => {
    return () => {
      handleStopIntro();
    };
  }, [handleStopIntro]);

  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('blur', () => {
      handleStopIntro();
    });
    return () => {
      unsubscribe?.();
    };
  }, [navigation, handleStopIntro]);

  useEffect(() => {
    handleStopIntro();
    lastPlayedTrackRef.current = null;
  }, [activeCollectionId, locale, handleStopIntro]);

  const currentNode: DemoNode | undefined = nodes[selectedIndex] ?? nodes[0];
  const visitedCount = nodes.filter((n) => readNodeIds.has(n.id)).length;
  const collectionCover = activeCollection?.coverPhoto ?? knownMeta?.coverPhoto ?? alleyMeta.coverPhoto;
  const isReviewed = collectionKind === 'reviewed';
  const isThreeLenses = activeCollectionId === 'old-quarter-three-lenses' && isReviewed;
  const currentPhoto = currentNode ? getNodePhoto(currentNode.id, undefined, isThreeLenses ? 'old-quarter-three-lenses' : undefined) : collectionCover;

  const topHeaderPadding = Math.max(insets.top, 28) + 8;
  const canvasHeight = Math.max(560, nodes.length * 90 * fontScale);
  const canvasWidth = Math.min(screenWidth, 540);

  const datasetPolyline =
    source.status === 'ready' && 'polyline' in source.dataset && Array.isArray(source.dataset.polyline)
      ? (source.dataset.polyline as [number, number][])
      : undefined;
  const datasetLengthMeters =
    source.status === 'ready' && 'lengthMeters' in source.dataset && typeof source.dataset.lengthMeters === 'number'
      ? source.dataset.lengthMeters
      : undefined;

  let pins: TrailPinMeta[];
  let splinePoints: Array<{ x: number; y: number }>;

  if (datasetPolyline && datasetPolyline.length >= 2) {
    const layout = computeAlleyLayout(
      datasetPolyline,
      nodes,
      canvasWidth,
      canvasHeight,
      datasetLengthMeters,
    );
    pins = layout.pins;
    splinePoints = layout.splinePoints;
  } else {
    // Dataset cũ không có hình dáng ngõ (không đổi hành vi)
    pins = nodes.flatMap((node, index) => {
      const layout = PIN_CONFIG[index];
      return layout ? [{ ...layout, id: node.id }] : [];
    });
    splinePoints = [
      { x: canvasWidth * 0.53, y: 0 },
      ...pins.map((pin) => ({
        x: canvasWidth * pin.xPct,
        y: canvasHeight * pin.yPct,
      })),
      { x: canvasWidth * 0.49, y: canvasHeight },
    ];
  }

  const mainPath = buildSmoothPath(splinePoints);
  const leftPath = buildSmoothPath(
    splinePoints.map((p) => ({ x: p.x - 3.5, y: p.y })),
  );
  const rightPath = buildSmoothPath(
    splinePoints.map((p) => ({ x: p.x + 3.5, y: p.y })),
  );

  function handleSelectPin(nodeId: string): void {
    const target = nodes.find((node) => node.id === nodeId);
    if (!target?.available) return;

    if (target.id === currentNode?.id && Boolean(target.story)) {
      // B5: Chạm ghim đã chọn mở thẳng câu chuyện điểm này
      handleExploreCurrent();
    } else {
      onSelectNode(target.id);
    }
  }

  function handleExploreCurrent(): void {
    if (!currentNode?.available) return;
    onSelectNode(currentNode.id);
    navigation.navigate('Qa');
  }

  const { scaleAnim: pinHaloScale, opacityAnim: pinHaloOpacity } = usePulseLoop({
    active: source.status === 'ready' && currentNode?.available === true,
    minScale: 1.0,
    maxScale: 1.12,
    minOpacity: 0.1,
    maxOpacity: 0.45,
    duration: motionDurations.ambientPulse,
  });

  const cardAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    cardAnim.stopAnimation();
    cardAnim.setValue(motion.active ? 0 : 1);
    const animation = Animated.timing(cardAnim, {
      toValue: 1,
      duration: motion.active ? motionDurations.normal : 0,
      easing: motionEasings.gentleOut,
      useNativeDriver: true,
    });
    if (motion.active) animation.start();
    return () => { animation.stop(); cardAnim.setValue(1); };
  }, [currentNode?.id, cardAnim, motion.active]);
  const cardOpacity = cardAnim;
  const cardTranslate = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });

  const {
    scaleAnim: explorePressScale,
    handlePressIn: handleExplorePressIn,
    handlePressOut: handleExplorePressOut,
  } = usePressSpring(0.96);

  if (source.status !== 'ready' || !nodes.some((node) => node.available)) {
    const unavailableDetail = liveBusy
      ? t('common.loading')
      : source.status === 'ready'
        ? (locale === 'en' ? 'No open points in this dataset.' : 'Chưa có điểm đang mở trong dữ liệu này.')
        : source.detail;

    return (
      <UnavailableScreen
        detail={unavailableDetail}
        onBack={() => navigation.goBack()}
        onSwitchToDemo={() => onModeChange('demo')}
        onRetry={mode === 'live' ? onRetryLive : undefined}
        busy={liveBusy}
      />
    );
  }

  return (
    <View style={styles.rootContainer}>
      {/* 1. NỀN ẢNH CHỤP THẬT TRÀN TOÀN BỘ MÀN HÌNH (B2: scrim 0.40 mộc mạc) */}
      <ImageBackground
        source={collectionCover}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <View style={styles.scrimOverlay} />
      </ImageBackground>

      {/* 2. THANH TIÊU ĐỀ TRÊN CÙNG: LOCAL BACKDROP (B2: rgba(20,24,19,0.58)), B4: Back 44, Title/Progress, Lang */}
      <View testID="home-header-bar" style={[styles.topHeader, { paddingTop: topHeaderPadding }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backArrowButton, pressed && styles.pressed]}
          >
            <Text style={styles.backArrowText}>‹</Text>
          </Pressable>

          <View style={styles.progressHeaderGroup}>
            <Text style={styles.alleyNameHeader}>
              {mode === 'demo'
                ? (activeCollection?.name ?? alleyMeta.name)
                : (source.status === 'ready' && 'collectionId' in source.dataset && typeof source.dataset.collectionId === 'string'
                    ? (knownMeta ? t(knownMeta.nameKey) : source.dataset.collectionId)
                    : (locale === 'en' ? 'Server journey' : 'Hành trình từ máy chủ'))}
            </Text>
            <Text style={styles.progressTitle}>
              {t('home.stories_opened', {
                opened: visitedCount,
                total: nodes.length,
              })}
            </Text>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${(visitedCount / (nodes.length || 1)) * 100}%` },
                ]}
              />
            </View>
          </View>

          {/* Nút đổi ngôn ngữ VI | EN (touch target >= 44) */}
          <Pressable
            testID="locale-switch"
            accessibilityRole="button"
            accessibilityLabel={locale === 'vi' ? 'Ngôn ngữ: Tiếng Việt. Chạm để đổi sang English' : 'Language: English. Tap to switch to Tiếng Việt'}
            hitSlop={8}
            onPress={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
            style={({ pressed }) => [styles.langHeaderButton, pressed && styles.pressed]}
          >
            <Text style={styles.langHeaderText}>
              {locale.toUpperCase()}
            </Text>
          </Pressable>
        </View>

        {/* 3. KHÔNG GIAN BẢN ĐỒ NGÕ: THẺ MỞ ĐẦU VỀ CON NGÕ & DẢI ĐƯỜNG MÒN */}
        <ScrollView style={styles.scrollCanvas} contentContainerStyle={styles.scrollCanvasContent}>
          {/* B4: Thẻ mở đầu "Về con ngõ" ngay trên bản đồ, phân biệt với câu chuyện từng điểm */}
          {alleyStory !== null && (
            <View style={styles.alleyStoryBar}>
              <Pressable
                testID="home-alley-story"
                accessibilityRole="button"
                accessibilityLabel={t('home.alley_story_btn')}
                onPress={() => setStoryModalVisible(true)}
                style={({ pressed }) => [styles.alleyStoryBtn, pressed && styles.pressed]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.alleyStoryBtnIcon}>📖</Text>
                <Text style={styles.alleyStoryBtnText}>{t('home.alley_story_btn')}</Text>
              </Pressable>

              {introTrack && (
                <Pressable
                  testID="home-intro-play"
                  accessibilityRole="button"
                  accessibilityLabel={
                    isIntroPlaying
                      ? (locale === 'en' ? 'Pause alley intro' : 'Tạm dừng giới thiệu ngõ')
                      : (locale === 'en' ? 'Play alley intro' : 'Nghe giới thiệu ngõ')
                  }
                  onPress={handleTogglePlayIntro}
                  style={({ pressed }) => [styles.introPlayBtn, pressed && styles.pressed]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <AppIcon name={isIntroPlaying ? 'pause' : 'play'} size={18} color="#24392E" />
                  <Text style={styles.introPlayBtnText}>
                    {isIntroPlaying
                      ? (locale === 'en' ? 'Pause' : 'Tạm dừng')
                      : (locale === 'en' ? 'Listen' : 'Nghe')}
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {fontScale > 1.3 || nodes.length > 6 ? (
            <AlleyTrailView
              nodes={nodes}
              currentNodeId={currentNode?.id}
              onSelectNode={handleSelectPin}
              collectionKind={collectionKind}
            />
          ) : (
            <View style={[styles.mapCanvas, { height: canvasHeight, width: canvasWidth }]}>
              {/* Lớp SVG đường mòn uốn lượn liên tục */}
              <Svg
                width={canvasWidth}
                height={canvasHeight}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              >
                <Path
                  d={mainPath}
                  stroke="rgba(235, 175, 75, 0.32)"
                  strokeWidth={24}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <Path
                  d={mainPath}
                  stroke="rgba(242, 220, 185, 0.72)"
                  strokeWidth={10}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <Path
                  d={mainPath}
                  stroke="#FFFDF6"
                  strokeWidth={2.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <Path
                  d={leftPath}
                  stroke="rgba(255, 248, 235, 0.55)"
                  strokeWidth={1.2}
                  strokeDasharray="6,4"
                  strokeLinecap="round"
                  fill="none"
                />
                <Path
                  d={rightPath}
                  stroke="rgba(255, 248, 235, 0.55)"
                  strokeWidth={1.2}
                  strokeDasharray="6,4"
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>

              {/* CÁC NÚT TRẠM (PINS) TỌA ĐỘ CHÍNH XÁC DỌC THEO ĐƯỜNG MÒN */}
              {pins.map((pinMeta) => {
                const node = nodes.find((item) => item.id === pinMeta.id);
                if (!node) return null;
                const index = nodes.indexOf(node);
                const isSelected = node.id === currentNode?.id;
                const isVisited = readNodeIds.has(node.id);
                const px = canvasWidth * pinMeta.xPct;
                const py = canvasHeight * pinMeta.yPct;

                return (
                  <View key={pinMeta.id} style={StyleSheet.absoluteFill} pointerEvents="box-none">
                    {/* Vòng hào quang thở màu vàng hổ phách xung quanh trạm đang chọn */}
                    {isSelected && (
                      <Animated.View
                        pointerEvents="none"
                        style={[
                          styles.pinHaloRing,
                          {
                            left: px - 28,
                            top: py - 28,
                            transform: [{ scale: pinHaloScale }],
                            opacity: pinHaloOpacity,
                          },
                        ]}
                      />
                    )}

                    {/* Nút trạm tròn phát sáng nằm chính xác trên dải đường */}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={
                        node.story
                          ? `${t('home.open_story', { name: node.name })}${node.available ? '' : ` · ${t('home.locked')}`}`
                          : `${node.name}${node.available ? '' : ` · ${t('home.locked')}`}`
                      }
                      accessibilityState={{ selected: isSelected, disabled: !node.available }}
                      disabled={!node.available}
                      hitSlop={6}
                      onPress={() => handleSelectPin(node.id)}
                      style={({ pressed }) => [
                        styles.pinCircleBase,
                        {
                          left: px - (isSelected ? 22 : 19),
                          top: py - (isSelected ? 22 : 19),
                        },
                        isSelected && styles.pinCircleSelected,
                        isVisited && !isSelected && styles.pinCircleVisited,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.pinIconText, isVisited && { color: '#FFFDF7' }, isSelected && styles.pinIconSelected]}>
                        {index + 1}
                      </Text>
                    </Pressable>

                    {/* Nhãn tên điểm bên phải */}
                    {pinMeta.side === 'right' && (
                      <Pressable
                        accessible={false}
                        disabled={!node.available}
                        onPress={() => handleSelectPin(node.id)}
                        style={[
                          styles.labelRightContainer,
                          {
                            left: px + 25,
                            top: py - 22,
                            width: canvasWidth - px - 40,
                          },
                        ]}
                      >
                        <Text style={[styles.pinLabelTitle, isSelected && styles.pinLabelTitleActive]}>
                          {t('home.stop_prefix')} {String(index + 1).padStart(2, '0')}:
                        </Text>
                        <Text style={[styles.pinLabelName, isSelected && styles.pinLabelNameActive]}>
                          {node.name}{node.available ? '' : ` · ${t('home.locked')}`}
                        </Text>
                      </Pressable>
                    )}

                    {/* Nhãn tên điểm bên trái */}
                    {pinMeta.side === 'left' && (
                      <Pressable
                        accessible={false}
                        disabled={!node.available}
                        onPress={() => handleSelectPin(node.id)}
                        style={[
                          styles.labelLeftContainer,
                          {
                            right: canvasWidth - px + 25,
                            top: py - 18,
                          },
                        ]}
                      >
                        <Text style={[styles.pinLabelTitle, isSelected && styles.pinLabelTitleActive]}>
                          {t('home.stop_prefix')} {String(index + 1).padStart(2, '0')}:
                        </Text>
                        <Text style={[styles.pinLabelName, isSelected && styles.pinLabelNameActive]}>
                          {node.name}{node.available ? '' : ` · ${t('home.locked')}`}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* 4. THANH PREVIEW ĐIỂM ĐANG CHỌN (B5: gọn gàng, chừa không gian bản đồ; B8: font floor 12) */}
        {currentNode !== undefined && (
          <Animated.View
            testID="home-selected-node-preview"
            style={[
              styles.compactPreviewCard,
              fontScale > 1.3 && styles.compactPreviewCardStacked,
              {
                opacity: cardOpacity,
                transform: [{ translateY: cardTranslate }],
              },
            ]}
          >
            {fontScale <= 1.3 && (
              <View style={styles.previewThumbWrapper}>
                <CrossfadePhoto source={currentPhoto} style={styles.previewThumb} />
              </View>
            )}

            <View style={[styles.previewInfo, fontScale > 1.3 && styles.previewInfoStacked]}>
              <View style={styles.previewMetaRow}>
                <Text style={styles.previewStopPrefix}>
                  {t('home.stop_prefix')} {String(selectedIndex + 1).padStart(2, '0')}
                </Text>
                <Text style={styles.previewDuration}>
                  ⏱ {currentNode.visitMinutes} {t('home.min')}
                </Text>
                {readNodeIds.has(currentNode.id) && (
                  <View style={styles.previewVisitedTag}>
                    <Text style={styles.previewVisitedText}>{t('home.opened')}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.previewTitle}>
                {currentNode.name}
              </Text>
              {(fontScale <= 1.3 || Boolean(datasetPolyline || !currentNode.story)) && (
                <Text style={styles.previewSummary} numberOfLines={fontScale > 1.3 ? 2 : 1}>
                  {currentNode.summary ?? t('home.unopened')}
                </Text>
              )}
              {Boolean(currentNode.pendingCheck) && (
                <Text style={styles.previewPendingNotice} numberOfLines={fontScale > 1.3 ? 2 : 1}>
                  {t('home.pending_notice_short')}
                </Text>
              )}
            </View>

            {/* Single Primary Story CTA */}
            {Boolean(currentNode.story) && (
              <Animated.View style={[{ transform: [{ scale: explorePressScale }] }, fontScale > 1.3 && styles.compactPreviewCtaWrapper]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('home.read_story_label')}
                  onPressIn={handleExplorePressIn}
                  onPressOut={handleExplorePressOut}
                  onPress={handleExploreCurrent}
                  style={({ pressed }) => [
                    styles.previewCtaButton,
                    fontScale > 1.3 && styles.previewCtaButtonStacked,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.previewCtaText}>{t('home.read_story_btn')}</Text>
                  <AppIcon name="arrow" size={14} color="#FFFDF7" />
                </Pressable>
              </Animated.View>
            )}
          </Animated.View>
        )}

        {/* 5. THANH CÔNG CỤ DÙNG CHUNG Ở ĐÁY (B3: ToolDock 3 mục GPS, QR nổi bật, Sổ tay) */}
        <ToolDock
          testIDPrefix="home"
          onPressGps={() => navigation.navigate('Location')}
          onPressQr={() => navigation.navigate('Camera')}
          onPressNotebook={() => setDrawerVisible(true)}
        />

      {/* 6. MODAL SỔ TAY NGÕ PHỐ (PLAN, CAMERA, GPS, DEMO/LIVE) */}
      <NotebookDrawerModal
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        navigation={navigation}
        mode={mode}
        onModeChange={onModeChange}
        source={source}
        collectionId={activeCollectionId}
        liveBusy={liveBusy}
        onRetryLive={onRetryLive}
      />

      {alleyStory !== null && (
        <AlleyStoryCard
          story={alleyStory}
          visible={storyModalVisible}
          onClose={() => setStoryModalVisible(false)}
          hasIntroTrack={Boolean(introTrack)}
          isPlayingIntro={isIntroPlaying}
          onTogglePlayIntro={handleTogglePlayIntro}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#1E2019',
  },
  scrimOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(22, 24, 18, 0.40)',
  },
  scrollCanvas: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: 'rgba(20, 24, 19, 0.58)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 253, 247, 0.08)',
    zIndex: 10,
  },
  scrollCanvasContent: {
    paddingBottom: 16,
  },
  alleyStoryBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    zIndex: 9,
  },
  introPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2C56B',
    borderWidth: 1,
    borderColor: 'rgba(242, 197, 107, 0.65)',
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    minWidth: 44,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  introPlayBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#24392E',
    letterSpacing: 0.3,
  },
  alleyStoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(28, 20, 16, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 226, 154, 0.38)',
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    minWidth: 44,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  alleyStoryBtnIcon: {
    fontSize: 15,
  },
  alleyStoryBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFE29A',
    letterSpacing: 0.3,
  },
  backArrowButton: {
    width: 44,
    height: 44,
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
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
  backArrowText: {
    color: '#FFFDF7',
    fontSize: 26,
    lineHeight: 28,
    fontWeight: '300',
    textAlign: 'center',
    marginTop: -2,
  },
  progressHeaderGroup: {
    flex: 1,
    marginHorizontal: 10,
    alignItems: 'center',
    gap: 3,
  },
  alleyNameHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFE29A',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  progressTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 253, 247, 0.9)',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  progressBarTrack: {
    width: 170,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.26)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#E5A842',
    borderRadius: 2.5,
    shadowColor: '#E5A842',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  langHeaderButton: {
    width: 44,
    height: 44,
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(28, 20, 16, 0.60)',
    borderWidth: 1,
    borderColor: 'rgba(255, 245, 230, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFDF7',
  },
  mapCanvas: {
    alignSelf: 'center',
    position: 'relative',
    marginVertical: spacing.xs,
  },
  pinHaloRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(229, 168, 66, 0.40)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 253, 246, 0.88)',
    zIndex: 5,
  },
  pinCircleBase: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFE3D0',
    borderWidth: 2,
    borderColor: '#FFFDF7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E6A842',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 6,
  },
  pinCircleSelected: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#C26747',
    borderColor: '#FFFDF7',
    borderWidth: 2.5,
    shadowColor: '#C26747',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 9,
    zIndex: 8,
  },
  pinCircleVisited: {
    backgroundColor: '#2A6F50',
    borderColor: '#E8F5E9',
  },
  pinIconText: {
    color: '#2D5748',
    fontWeight: '700',
    fontSize: 16,
  },
  pinIconSelected: {
    color: '#FFFDF7',
    fontSize: 18,
  },
  labelRightContainer: {
    position: 'absolute',
    minHeight: 44,
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(20,24,19,0.82)',
    width: 130,
    alignItems: 'flex-start',
    zIndex: 5,
  },
  labelLeftContainer: {
    position: 'absolute',
    minHeight: 44,
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(20,24,19,0.82)',
    width: 130,
    alignItems: 'flex-end',
    zIndex: 5,
  },
  pinLabelTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F3E0C8',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  pinLabelTitleActive: {
    color: '#FFE29A',
  },
  pinLabelName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFDF7',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  pinLabelNameActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  compactPreviewCard: {
    marginHorizontal: 16,
    marginBottom: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 253, 247, 0.96)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(235, 222, 200, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 10,
  },
  compactPreviewCardStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 6,
  },
  previewInfoStacked: {
    flex: 0,
    width: '100%',
  },
  compactPreviewCtaWrapper: {
    width: '100%',
    alignItems: 'stretch',
  },
  previewThumbWrapper: {
    width: 42,
    height: 42,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#2A2018',
  },
  previewThumb: {
    width: 42,
    height: 42,
  },
  previewInfo: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: 2,
  },
  previewMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  previewStopPrefix: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C26747',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  previewDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7D6F63',
  },
  previewVisitedTag: {
    backgroundColor: '#E8F2EC',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  previewVisitedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E6B4A',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C221E',
    lineHeight: 20,
  },
  previewSummary: {
    fontSize: 13,
    color: '#6E5D52',
    lineHeight: 17,
  },
  previewPendingNotice: {
    fontSize: 12,
    color: '#A05A2C',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  previewCtaButton: {
    backgroundColor: '#2D5748',
    minHeight: 44,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#2D5748',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  previewCtaButtonStacked: {
    width: '100%',
    justifyContent: 'center',
  },
  previewCtaText: {
    color: '#FFFDF7',
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});
