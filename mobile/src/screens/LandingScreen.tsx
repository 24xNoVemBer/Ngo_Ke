import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Mode } from '../data/sourceState';
import { getSourceState, type SourceState } from '../data/sourceState';
import type { RootStackParamList } from '../navigation';
import { HERO_PHOTO } from '../assets/photoMap';
import { AppIcon } from '../components/AppIcon';
import { NgoKeLogo } from '../components/NgoKeLogo';
import { NotebookDrawerModal } from '../components/NotebookDrawerModal';
import { AlleyPassportModal } from '../components/AlleyPassportModal';
import { ToolDock } from '../components/ToolDock';
import { useEntranceFadeSlide } from '../hooks/useMotion';
import { useLocale } from '../context/LocaleContext';
import { getBundledDataset, getLocalizedCollections, isCollectionId } from '../data/collections';
import { radius, spacing } from '../theme';
import {
  createImagePerfFirstLayoutReporter,
  recordImagePerfLoadEnd,
  recordImagePerfLoadError,
  recordImagePerfLoadStart,
  recordImagePerfLoadSuccess,
  recordImagePerfNavigationTap,
  recordImagePerfScreenFocus,
} from '../utils/imagePerformanceDiagnostics';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'> & {
  nodeCount: number;
  mode?: Mode;
  source?: SourceState;
  onModeChange?: (mode: Mode) => void;
  liveBusy?: boolean;
  onRetryLive?: () => void;
};

export function LandingScreen({
  navigation,
  mode = 'demo',
  source,
  onModeChange,
  liveBusy,
  onRetryLive,
}: Props): ReactElement {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const reportFirstLayout = useRef(createImagePerfFirstLayoutReporter('landing')).current;
  const { width: screenWidth, fontScale } = useWindowDimensions();
  const { locale, setLocale, collectionId, setCollectionId, t } = useLocale();
  const collections = getLocalizedCollections(locale);

  const [notebookVisible, setNotebookVisible] = useState(false);
  const [passportVisible, setPassportVisible] = useState(false);

  const topPadding = Math.max(insets.top, 28) + 12;

  const effectiveSource =
    source ??
    (mode === 'demo'
      ? getSourceState('demo', getBundledDataset(collectionId, locale), locale)
      : getSourceState('live', undefined, locale));

  const headerEntrance = useEntranceFadeSlide({ delay: 40, duration: 360, offsetY: 14 });
  const carouselEntrance = useEntranceFadeSlide({ delay: 130, duration: 380, offsetY: 16 });

  useEffect(() => {
    if (isFocused) recordImagePerfScreenFocus('landing');
  }, [isFocused]);

  return (
    <View style={styles.rootContainer} onLayout={reportFirstLayout}>
      {/* 1. NỀN ẢNH ĐIỆN ẢNH PHỐ CỔ LÀM MỜ VỚI SCRIM RÊU ĐỒNG NHẤT (B1: blur~6, scrim a >= 0.62) */}
      <ImageBackground
        source={HERO_PHOTO}
        blurRadius={6}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        onLoadStart={() => recordImagePerfLoadStart('landing', 'hero')}
        onLoad={() => recordImagePerfLoadSuccess('landing', 'hero')}
        onLoadEnd={() => recordImagePerfLoadEnd('landing', 'hero')}
        onError={() => recordImagePerfLoadError('landing', 'hero')}
      >
        <View style={styles.scrimOverlay} />
      </ImageBackground>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: topPadding, paddingBottom: spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
          {/* 2. THANH THƯƠNG HIỆU: LOGO, NÚT NGÔN NGỮ VI|EN & NÚT HỘ CHIẾU CHỈ BIỂU TƯỢNG */}
          <Animated.View
            testID="landing-header-bar"
            style={[
              styles.headerBar,
              fontScale > 1.3 && styles.headerBarStacked,
              {
                opacity: headerEntrance.opacity,
                transform: [{ translateY: headerEntrance.translateY }],
              },
            ]}
          >
            <NgoKeLogo size="md" variant="horizontal" theme="light" style={styles.logoWrapper} />

            <View style={styles.headerControls}>
              {/* Nút ngôn ngữ phân đoạn VI | EN */}
              <View
                testID="locale-switch"
                accessibilityRole="radiogroup"
                accessibilityLabel={locale === 'vi' ? 'Ngôn ngữ: Tiếng Việt' : 'Language: English'}
                style={styles.segmentedControl}
              >
                <Pressable
                  testID="locale-option-vi"
                  accessibilityRole="button"
                  accessibilityState={{ selected: locale === 'vi' }}
                  accessibilityLabel={locale === 'vi' ? 'Tiếng Việt, đang chọn' : 'Chọn Tiếng Việt'}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
                  onPress={() => setLocale('vi')}
                  style={[styles.segmentBtn, locale === 'vi' && styles.segmentBtnActive]}
                >
                  <Text style={[styles.segmentBtnText, locale === 'vi' && styles.segmentBtnTextActive]}>
                    VI
                  </Text>
                </Pressable>
                <View style={styles.segmentDivider} />
                <Pressable
                  testID="locale-option-en"
                  accessibilityRole="button"
                  accessibilityState={{ selected: locale === 'en' }}
                  accessibilityLabel={locale === 'en' ? 'English, currently selected' : 'Select English'}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                  onPress={() => setLocale('en')}
                  style={[styles.segmentBtn, locale === 'en' && styles.segmentBtnActive]}
                >
                  <Text style={[styles.segmentBtnText, locale === 'en' && styles.segmentBtnTextActive]}>
                    EN
                  </Text>
                </Pressable>
              </View>

              {/* Nút Hộ chiếu chỉ biểu tượng, vùng chạm >= 44, bắt buộc localized a11y label & role=button */}
              <Pressable
                testID="landing-header-passport"
                accessibilityRole="button"
                accessibilityLabel={locale === 'en' ? 'Alley Passport' : 'Hộ chiếu ngõ phố'}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => setPassportVisible(true)}
                style={styles.headerPassportBtn}
              >
                <AppIcon name="passport" size={22} color="#FFFDF7" />
              </Pressable>
            </View>
          </Animated.View>

          {/* Dòng trạng thái nội dung văn bản dưới header (B7: câu tĩnh, chiều cao ổn định) */}
          <View
            testID="landing-status-line"
            style={[styles.statusLineContainer, fontScale > 1.3 && styles.statusLineContainerStacked]}
          >
            <Text style={styles.statusLineText}>
              {t('landing.mode_status')}
            </Text>
          </View>

          {/* 3. DANH MỤC CÁC CON NGÕ TIÊU BIỂU (CAROUSEL NẰM NGANG - B6: cố định chiều cao & thứ tự) */}
          <Animated.View
            style={{
              opacity: carouselEntrance.opacity,
              transform: [{ translateY: carouselEntrance.translateY }],
            }}
          >
            <View
              testID="landing-section-header"
              style={[styles.sectionHeaderRow, fontScale > 1.2 && styles.sectionHeaderStacked]}
            >
              <Text style={styles.sectionMainTitle}>{t('landing.featured_section_title')}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('landing.see_all_label')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => navigation.navigate('AlleySelect')}
                style={[styles.seeAllLink, fontScale > 1.2 && styles.seeAllLinkStacked]}
              >
                <Text style={styles.seeAllText}>{t('landing.see_all')}</Text>
              </Pressable>
            </View>

            {mode === 'live' && effectiveSource.status !== 'ready' ? (
              <View style={styles.liveStateCard}>
                <Text style={styles.liveStateIcon}>{liveBusy ? '⏳' : effectiveSource.status === 'error' ? '⚠️' : '🏮'}</Text>
                <Text style={styles.liveStateTitle}>
                  {liveBusy ? t('alley_select.live_loading') : effectiveSource.title || (effectiveSource.status === 'error' ? t('alley_select.live_error') : t('alley_select.live_empty'))}
                </Text>
                {effectiveSource.detail && !liveBusy ? (
                  <Text style={styles.liveStateDetail}>{effectiveSource.detail}</Text>
                ) : null}
                <View style={styles.liveActionRow}>
                  {onRetryLive && (
                    <Pressable
                      accessibilityRole="button"
                      disabled={liveBusy}
                      onPress={onRetryLive}
                      style={[styles.liveRetryBtn, liveBusy && styles.liveDisabled]}
                    >
                      <Text style={styles.liveRetryBtnText}>{liveBusy ? t('common.loading') : t('common.retry')}</Text>
                    </Pressable>
                  )}
                  {onModeChange && (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => onModeChange('demo')}
                      style={styles.liveSwitchBtn}
                    >
                      <Text style={styles.liveSwitchBtnText}>{t('common.switch_to_demo')}</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalAlleyScroll}
              >
                {(mode === 'live' && effectiveSource.status === 'ready'
                  ? [{
                      id: ('collectionId' in effectiveSource.dataset && typeof effectiveSource.dataset.collectionId === 'string' ? effectiveSource.dataset.collectionId : 'live-journey'),
                      name: ('name' in effectiveSource.dataset && typeof (effectiveSource.dataset as { name?: string }).name === 'string' ? (effectiveSource.dataset as { name: string }).name : (locale === 'en' ? 'Live Journey' : 'Hành trình Live')),
                      district: ('collectionId' in effectiveSource.dataset && typeof effectiveSource.dataset.collectionId === 'string' ? effectiveSource.dataset.collectionId : (locale === 'en' ? 'Server dataset' : 'Dữ liệu máy chủ')),
                      theme: locale === 'en' ? 'Live Heritage' : 'Di sản trực tiếp',
                      tagline: locale === 'en' ? 'Authentic server-provided alley exploration' : 'Khám phá con ngõ chân thực cung cấp từ máy chủ',
                      nodeCount: effectiveSource.dataset.nodes.length,
                      coverPhoto: collections[0].coverPhoto,
                      kind: 'kind' in effectiveSource.dataset && effectiveSource.dataset.kind === 'reviewed' ? 'reviewed' : 'simulated',
                    }]
                  : collections
                ).map((col) => (
                  <Pressable
                    key={col.id}
                    testID={`landing-alley-card-${col.id}`}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('landing.explore_alley_label')} ${col.name}`}
                    onPress={() => {
                      recordImagePerfNavigationTap('landing', 'home', col.id);
                      if (isCollectionId(col.id)) setCollectionId(col.id);
                      navigation.navigate('Home', { alleyId: col.id });
                    }}
                    style={({ pressed }) => [
                      styles.alleyPreviewCard,
                      { width: Math.min(260, screenWidth * 0.72) },
                      pressed && styles.pressed,
                    ]}
                  >
                    {/* Ảnh nét riêng của con ngõ, không phủ scrim toàn thẻ */}
                    <Image
                      source={col.coverPhoto}
                      style={styles.alleyCardImage}
                      onLoadStart={() => recordImagePerfLoadStart('landing', `cover:${col.id}`)}
                      onLoad={() => recordImagePerfLoadSuccess('landing', `cover:${col.id}`)}
                      onLoadEnd={() => recordImagePerfLoadEnd('landing', `cover:${col.id}`)}
                      onError={() => recordImagePerfLoadError('landing', `cover:${col.id}`)}
                    />

                    {/* Badge chủ đề */}
                    <View style={styles.cardThemeTag}>
                      <Text style={styles.cardThemeTagText}>{col.theme}</Text>
                    </View>

                    {/* Dải đáy thẻ nền đặc chứa thông tin & chữ vàng với chiều cao tối thiểu ổn định */}
                    <View style={styles.alleyCardFooter}>
                      <Text style={styles.alleyCardDistrict} numberOfLines={1}>{col.district}</Text>
                      <Text style={styles.alleyCardName} numberOfLines={1}>{col.name}</Text>
                      <Text style={styles.alleyCardTagline} numberOfLines={2}>
                        {col.tagline}
                      </Text>

                      <View style={styles.alleyCardMetaRow}>
                        <Text style={styles.cardStoryCount}>
                          {t('common.stop_count', { count: col.nodeCount })}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </Animated.View>
        </ScrollView>

      {/* 4. THANH CÔNG CỤ DÙNG CHUNG Ở ĐÁY (B3: ToolDock 3 mục GPS, QR nổi bật, Sổ tay) */}
      <ToolDock
        testIDPrefix="landing"
        onPressGps={() => navigation.navigate('Location')}
        onPressQr={() => navigation.navigate('Camera')}
        onPressNotebook={() => setNotebookVisible(true)}
      />

      {/* 5. MODAL SỔ TAY NGÕ PHỐ (CHỨA HÀNH TRÌNH, CÔNG CỤ & DEMO/LIVE TOGGLE) */}
      <NotebookDrawerModal
        visible={notebookVisible}
        onClose={() => setNotebookVisible(false)}
        navigation={navigation}
        mode={mode}
        onModeChange={(next) => {
          if (onModeChange) onModeChange(next);
        }}
        source={effectiveSource}
        collectionId={collectionId}
        liveBusy={liveBusy}
        onRetryLive={onRetryLive}
      />

      {/* 6. MODAL HỘ CHIẾU NGÕ PHỐ MỞ TỪ HEADER */}
      <AlleyPassportModal
        visible={passportVisible}
        onClose={() => setPassportVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  liveStateCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 253, 247, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(235, 175, 75, 0.25)',
    alignItems: 'center',
    gap: spacing.sm,
  },
  liveStateIcon: {
    fontSize: 28,
  },
  liveStateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFDF7',
    textAlign: 'center',
  },
  liveStateDetail: {
    fontSize: 13,
    color: 'rgba(255, 253, 247, 0.75)',
    textAlign: 'center',
    lineHeight: 18,
  },
  liveActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  liveRetryBtn: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2A6F50',
    borderRadius: radius.md,
  },
  liveRetryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFDF7',
  },
  liveSwitchBtn: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 253, 247, 0.15)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 247, 0.25)',
  },
  liveSwitchBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFDF7',
  },
  liveDisabled: {
    opacity: 0.5,
  },
  rootContainer: {
    flex: 1,
    backgroundColor: '#1E2019',
  },
  scrimOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(18, 30, 23, 0.68)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
    minHeight: 48,
  },
  headerBarStacked: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.sm,
    minHeight: 88,
  },
  logoWrapper: {
    transform: [{ scale: 0.95 }],
    flexShrink: 1,
  },
  headerControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 32, 25, 0.70)',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 247, 0.22)',
    padding: 2,
  },
  segmentBtn: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  segmentBtnActive: {
    backgroundColor: '#2A6F50',
  },
  segmentBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 253, 247, 0.65)',
    letterSpacing: 0.5,
  },
  segmentBtnTextActive: {
    color: '#FFFDF7',
  },
  segmentDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255, 253, 247, 0.20)',
  },
  headerPassportBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    minHeight: 44,
    minWidth: 44,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(30, 32, 25, 0.70)',
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 247, 0.22)',
  },
  statusLineContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    marginTop: 2,
    minHeight: 28,
    justifyContent: 'center',
  },
  statusLineContainerStacked: {
    minHeight: 48,
  },
  statusLineText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 253, 247, 0.85)',
    letterSpacing: 0.2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    minHeight: 36,
  },
  sectionHeaderStacked: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    minHeight: 56,
  },
  sectionMainTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFDF7',
    letterSpacing: 0.3,
  },
  seeAllLink: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
  },
  seeAllLinkStacked: {
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 253, 247, 0.90)',
  },
  horizontalAlleyScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingVertical: 4,
  },
  alleyPreviewCard: {
    height: 330,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#2A2D24',
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 247, 0.15)',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  alleyCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardThemeTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(20, 22, 16, 0.70)',
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 247, 0.2)',
  },
  cardThemeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFDF7',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  alleyCardFooter: {
    marginTop: 'auto',
    backgroundColor: 'rgba(20, 22, 16, 0.78)',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 253, 247, 0.12)',
    gap: 4,
    minHeight: 148,
  },
  alleyCardDistrict: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
  alleyCardName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFDF7',
    letterSpacing: 0.2,
  },
  alleyCardTagline: {
    fontSize: 12,
    color: 'rgba(255, 253, 247, 0.85)',
    lineHeight: 16,
  },
  alleyCardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 253, 247, 0.12)',
  },
  cardStoryCount: {
    fontSize: 12,
    color: 'rgba(255, 253, 247, 0.75)',
  },
  cardDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E8F5E9',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});
