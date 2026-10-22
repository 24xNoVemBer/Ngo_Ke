import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState, type ReactElement } from 'react';
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
import type { DemoNode, Mode, SourceState } from '../data/sourceState';
import type { RootStackParamList } from '../navigation';
import { getNodePhoto, getNodePhotographer, getAlleyMeta } from '../assets/photoMap';
import { AVAILABLE_COLLECTIONS, DEFAULT_COLLECTION_ID, getBundledDataset, getLocalizedCollections, isCollectionId, type CollectionId } from '../data/collections';
import { readAlleyStory } from '../data/alleyGuide';
import { UnavailableScreen } from './UnavailableScreen';
import { useMotionState } from '../hooks/MotionPreferences';
import { CrossfadePhoto } from '../components/CrossfadePhoto';
import { AlleyTrailView } from '../components/AlleyTrailView';
import { AppIcon } from '../components/AppIcon';
import { NotebookDrawerModal } from '../components/NotebookDrawerModal';
import { AlleyStoryCard } from '../components/AlleyStoryCard';
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
  icon: string;
  xPct: number;
  yPct: number;
  side: 'left' | 'right';
}

const PIN_CONFIG: TrailPinMeta[] = [
  { id: 'demo-01', icon: '🚪', xPct: 0.55, yPct: 0.08, side: 'right' },
  { id: 'demo-02', icon: '📜', xPct: 0.55, yPct: 0.23, side: 'right' },
  { id: 'demo-03', icon: '🍲', xPct: 0.45, yPct: 0.39, side: 'left' },
  { id: 'demo-04', icon: '📜', xPct: 0.45, yPct: 0.53, side: 'left' },
  { id: 'demo-05', icon: '🏮', xPct: 0.45, yPct: 0.68, side: 'left' },
  { id: 'demo-06', icon: '🚩', xPct: 0.55, yPct: 0.84, side: 'right' },
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
  const [mood, setMood] = useState<'morning' | 'dusk' | 'night'>('morning');

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

  const currentNode: DemoNode | undefined = nodes[selectedIndex] ?? nodes[0];
  const visitedCount = nodes.filter((n) => readNodeIds.has(n.id)).length;
  const collectionCover = activeCollection?.coverPhoto ?? knownMeta?.coverPhoto ?? alleyMeta.coverPhoto;
  const isReviewed = collectionKind === 'reviewed';
  const isThreeLenses = activeCollectionId === 'old-quarter-three-lenses' && isReviewed;
  const currentPhoto = currentNode ? getNodePhoto(currentNode.id, undefined, isThreeLenses ? 'old-quarter-three-lenses' : undefined) : collectionCover;
  const currentPhotographer = currentNode ? getNodePhotographer(currentNode.id, undefined, isThreeLenses ? 'old-quarter-three-lenses' : undefined, locale) : alleyMeta.photographer;

  // Tính toán vùng canvas của dải đường mòn tránh thanh trạng thái và đáy
  const topHeaderPadding = Math.max(insets.top, 28) + 8;
  const bottomDockPadding = Math.max(insets.bottom, 16) + 10;
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
    if (target?.available) {
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
      {/* 1. NỀN ẢNH CHỤP THẬT TRÀN TOÀN BỘ MÀN HÌNH */}
      <ImageBackground
        source={collectionCover}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        {/* Lớp scrim tối mộc mạc biến chuyển theo sắc thái ánh sáng */}
        <View
          style={[
            styles.scrimOverlay,
            mood === 'dusk' && styles.scrimDusk,
            mood === 'night' && styles.scrimNight,
          ]}
        />

        {/* 2. THANH TIÊU ĐỀ TRÊN CÙNG: CĂN CHỈNH AN TOÀN TRÁNH STATUS BAR */}
        <View style={[styles.topHeader, { paddingTop: topHeaderPadding }]}>
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
                mode: mode === 'demo' ? 'Demo' : 'Live',
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

          {/* Nút đổi sắc thái ánh sáng ngõ */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.change_mood')}
            accessibilityValue={{
              text: mood === 'morning' ? t('home.mood_morning') : mood === 'dusk' ? t('home.mood_dusk') : t('home.mood_night'),
            }}
            onPress={() =>
              setMood((prev) =>
                prev === 'morning' ? 'dusk' : prev === 'dusk' ? 'night' : 'morning',
              )
            }
            style={({ pressed }) => [styles.moodHeaderButton, pressed && styles.pressed]}
          >
            <Text style={styles.moodHeaderIcon}>
              {mood === 'morning' ? '🌅' : mood === 'dusk' ? '🌇' : '🏮'}
            </Text>
          </Pressable>

          {/* Nút đổi ngôn ngữ */}
          <Pressable
            testID="locale-switch"
            accessibilityRole="button"
            accessibilityLabel={locale === 'vi' ? 'Ngôn ngữ: Tiếng Việt. Chạm để đổi sang English' : 'Language: English. Tap to switch to Tiếng Việt'}
            hitSlop={8}
            onPress={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
            style={({ pressed }) => [styles.moodHeaderButton, pressed && styles.pressed, { marginLeft: 6 }]}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFDF7' }}>
              {locale.toUpperCase()}
            </Text>
          </Pressable>
        </View>

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
          </View>
        )}

        {/* 3. KHÔNG GIAN BẢN ĐỒ NGÕ: DẢI ĐƯỜNG MÒN PHÁT SÁNG & THẺ BƯU ẢNH SỔ TAY */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {fontScale > 1.3 || nodes.length > 6 ? (
          <AlleyTrailView
            nodes={nodes}
            currentNodeId={currentNode?.id}
            onSelectNode={handleSelectPin}
            collectionKind={collectionKind}
          />
        ) : (
          <>
        <View style={[styles.mapCanvas, { height: canvasHeight, width: canvasWidth }]}>
          {/* Lớp SVG đường mòn uốn lượn liên tục */}
          <Svg
            width={canvasWidth}
            height={canvasHeight}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          >
            {/* Quầng sáng ấm tỏa ra xung quanh dải đường */}
            <Path
              d={mainPath}
              stroke="rgba(235, 175, 75, 0.32)"
              strokeWidth={24}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Thân dải ribbon màu cát vàng ấm */}
            <Path
              d={mainPath}
              stroke="rgba(242, 220, 185, 0.72)"
              strokeWidth={10}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Vạch phấn phát sáng chính giữa */}
            <Path
              d={mainPath}
              stroke="#FFFDF6"
              strokeWidth={2.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Hai đường chỉ phấn song song phong cách vẽ tay */}
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
          </>
        )}
        </ScrollView>

        {/* 4. THANH PREVIEW ĐIỂM ĐANG CHỌN (GỌN GÀNG, NHÌN THẤY NGAY TRÊN VÙNG THAO TÁC) */}
        {currentNode !== undefined && (
          <Animated.View
            testID="home-selected-node-preview"
            accessibilityHint={`${t('home.photo_credit')}: ${currentPhotographer}`}
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
                <Text style={styles.previewSummary} numberOfLines={fontScale > 1.3 ? 4 : 2}>
                  {currentNode.summary ?? t('home.unopened')}
                </Text>
              )}
              {Boolean(currentNode.pendingCheck) && (
                <Text style={styles.previewPendingNotice} numberOfLines={fontScale > 1.3 ? 4 : 2}>
                  ⚠️ {currentNode.pendingCheck}
                </Text>
              )}
              {fontScale <= 1.3 && (
                <Text style={styles.previewCreditText} numberOfLines={1}>
                  {t('home.photo_credit')}: {currentPhotographer}
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

        {/* 5. THANH ĐIỀU HƯỚNG ĐÁY: 2 THAO TÁC PHỤ TRÊN ĐẢO NỔI (ĐÃ BỎ NÚT READ STORY TRÙNG LẶP) */}
        <View style={[styles.bottomDockContainer, { paddingBottom: bottomDockPadding }]}>
          <View style={styles.floatingDockIsland}>
            {/* Nút La bàn / GPS xác nhận tọa độ */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('home.gps_dock_label')}
              onPress={() => navigation.navigate('Location')}
              style={({ pressed }) => [styles.dockSideCircle, pressed && styles.pressed]}
            >
              <AppIcon name="pin" />
              <Text style={styles.dockLabel}>GPS</Text>
            </Pressable>

            {/* Nút Sổ tay & Công cụ ngõ phố */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('home.notebook_label')}
              onPress={() => setDrawerVisible(true)}
              style={({ pressed }) => [styles.dockSideCircle, pressed && styles.pressed]}
            >
              <AppIcon name="write" />
              <Text style={styles.dockLabel}>{t('home.notebook_btn')}</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>

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
  scrimDusk: {
    backgroundColor: 'rgba(46, 26, 16, 0.52)',
  },
  scrimNight: {
    backgroundColor: 'rgba(12, 14, 18, 0.65)',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  alleyStoryBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    alignItems: 'center',
    zIndex: 9,
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
    width: 38,
    height: 38,
    borderRadius: 19,
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
    fontSize: 11.5,
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
  moodHeaderButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(28, 20, 16, 0.60)',
    borderWidth: 1,
    borderColor: 'rgba(255, 245, 230, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodHeaderIcon: {
    fontSize: 16,
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
    fontSize: 11,
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
  scrapbookCardWrapper: {
    alignSelf: 'center',
    marginTop: 16,
  },
  mainPolaroidCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 15,
    padding: 16,
    paddingTop: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.38,
    shadowRadius: 18,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#ECE4D4',
    gap: 7,
  },
  washiTapeStrip: {
    position: 'absolute',
    top: -7,
    alignSelf: 'center',
    width: 60,
    height: 14,
    backgroundColor: 'rgba(238, 222, 190, 0.92)',
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(200, 180, 140, 0.5)',
    zIndex: 12,
  },
  polaroidFrame: {
    width: '100%',
    height: 180,
    backgroundColor: '#FFFFFF',
    padding: 4,
    paddingBottom: 6,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  polaroidPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  handwritingNoteBox: {
    paddingHorizontal: 2,
  },
  handwritingCursive: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#7C6A5A',
    lineHeight: 24,
  },
  cardMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationPill: {
    backgroundColor: '#F5ECE0',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E6D7C2',
  },
  durationPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#4A3B32',
  },
  terracottaStamp: {
    borderWidth: 1.5,
    borderColor: '#9C4F36',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(246, 234, 230, 0.9)',
    alignItems: 'center',
    transform: [{ rotate: '-6deg' }],
  },
  stampHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9C4F36',
    letterSpacing: 0.3,
  },
  creditText: {
    fontSize: 7.5,
    fontStyle: 'italic',
    color: '#8C7D70',
    marginTop: -2,
  },
  exploreCtaButton: {
    backgroundColor: '#1E6B4A',
    borderRadius: 22,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E6B4A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
    marginTop: 2,
  },
  compactPreviewCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 10,
    backgroundColor: 'rgba(255, 253, 247, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(235, 222, 200, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  compactPreviewCardStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 8,
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
    width: 48,
    height: 48,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#2A2018',
  },
  previewThumb: {
    width: 48,
    height: 48,
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
    fontSize: 10,
    fontWeight: '700',
    color: '#1E6B4A',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C221E',
    lineHeight: 22,
  },
  previewSummary: {
    fontSize: 13,
    color: '#6E5D52',
    lineHeight: 18,
  },
  previewCreditText: {
    fontSize: 11,
    color: '#8C7D70',
    fontStyle: 'italic',
  },
  previewPendingNotice: {
    fontSize: 11,
    color: '#A05A2C',
    fontStyle: 'italic',
    lineHeight: 15,
  },
  previewCtaButton: {
    backgroundColor: '#2D5748',
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
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
  bottomDockContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 10,
  },
  floatingDockIsland: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 18, 14, 0.78)',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 235, 205, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  dockLabel: { fontSize: 13, fontWeight: '600', color: '#FFFDF7', textAlign: 'center' },
  dockSideCircle: {
    flex: 1, minHeight: 54, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 6,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  dockCenterCircle: {
    flex: 1, minHeight: 54, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 6,
    backgroundColor: '#F5ECE0',
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});
