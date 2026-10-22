import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState, type ReactElement } from 'react';
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
import { useEntranceFadeSlide } from '../hooks/useMotion';
import { useLocale } from '../context/LocaleContext';
import { getBundledDataset, getLocalizedCollections, isCollectionId } from '../data/collections';
import { radius, spacing } from '../theme';

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
  const { width: screenWidth, fontScale } = useWindowDimensions();
  const { locale, setLocale, collectionId, setCollectionId, t } = useLocale();
  const collections = getLocalizedCollections(locale);

  const [notebookVisible, setNotebookVisible] = useState(false);

  const topPadding = Math.max(insets.top, 28) + 12;

  const effectiveSource =
    source ??
    (mode === 'demo'
      ? getSourceState('demo', getBundledDataset(collectionId, locale), locale)
      : getSourceState('live', undefined, locale));

  const headerEntrance = useEntranceFadeSlide({ delay: 40, duration: 360, offsetY: 14 });
  const carouselEntrance = useEntranceFadeSlide({ delay: 130, duration: 380, offsetY: 16 });
  const quickActionsEntrance = useEntranceFadeSlide({ delay: 200, duration: 380, offsetY: 16 });

  return (
    <View style={styles.rootContainer}>
      {/* 1. NỀN ẢNH ĐIỆN ẢNH PHỐ CỔ LÀM MỜ VỚI SCRIM RÊU ĐỒNG NHẤT */}
      <ImageBackground
        source={HERO_PHOTO}
        blurRadius={14}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <View style={styles.scrimOverlay} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: topPadding, paddingBottom: Math.max(insets.bottom, 24) + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* 2. THANH THƯƠNG HIỆU: LOGO, NÚT NGÔN NGỮ PHÂN ĐOẠN VI|EN & NÚT SỔ TAY */}
          <Animated.View
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

              {/* Nút Sổ tay mở NotebookDrawerModal */}
              <Pressable
                testID="landing-header-notebook"
                accessibilityRole="button"
                accessibilityLabel={t('landing.header_notebook_label')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => setNotebookVisible(true)}
                style={styles.headerNotebookBtn}
              >
                <AppIcon name="book" size={16} color="#FFFDF7" />
                <Text style={styles.headerNotebookText}>{t('landing.header_notebook')}</Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Dòng trạng thái nội dung văn bản dưới header */}
          <View style={styles.statusLineContainer}>
            <Text style={styles.statusLineText}>
              {t('landing.mode_status', { mode: mode === 'demo' ? t('common.demo') : t('common.live') })}
            </Text>
          </View>

          {/* 3. DANH MỤC CÁC CON NGÕ TIÊU BIỂU (CAROUSEL NẰM NGANG) */}
          <Animated.View
            style={{
              opacity: carouselEntrance.opacity,
              transform: [{ translateY: carouselEntrance.translateY }],
            }}
          >
            <View style={[styles.sectionHeaderRow, fontScale > 1.2 && styles.sectionHeaderStacked]}>
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
                    accessibilityRole="button"
                    accessibilityLabel={`${t('landing.explore_alley_label')} ${col.name}`}
                    onPress={() => {
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
                    <Image source={col.coverPhoto} style={styles.alleyCardImage} />

                    {/* Badge chủ đề */}
                    <View style={styles.cardThemeTag}>
                      <Text style={styles.cardThemeTagText}>{col.theme}</Text>
                    </View>

                    {/* Dải đáy thẻ nền đặc chứa thông tin & chữ vàng */}
                    <View style={styles.alleyCardFooter}>
                      <Text style={styles.alleyCardDistrict}>{col.district}</Text>
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

          {/* 4. TIỆN ÍCH TRỰC TIẾP: VỊ TRÍ GPS & SỔ TAY HÀNH TRÌNH (CÙNG CHIỀU CAO VÀ GIỚI HẠN DÒNG) */}
          <Animated.View
            testID="landing-quick-actions-section"
            style={[
              styles.quickActionsSection,
              {
                opacity: quickActionsEntrance.opacity,
                transform: [{ translateY: quickActionsEntrance.translateY }],
              },
            ]}
          >
            <View style={[styles.sectionHeaderRow, fontScale > 1.2 && styles.sectionHeaderStacked]}>
              <Text style={styles.sectionMainTitle}>{t('landing.quick_section_title')}</Text>
            </View>

            <View
              style={[
                styles.quickActionsGrid,
                (fontScale > 1.2 || screenWidth < 360) && styles.quickActionsGridStacked,
              ]}
            >
              {/* Nút 1: Vị trí GPS */}
              <Pressable
                testID="landing-quick-gps"
                accessibilityRole="button"
                accessibilityLabel={t('landing.quick_gps_label')}
                onPress={() => navigation.navigate('Location')}
                style={({ pressed }) => [styles.quickActionCard, pressed && styles.pressed]}
              >
                <View style={styles.quickActionIconCircle}>
                  <AppIcon name="pin" size={20} color="#2D5748" />
                </View>
                <View style={styles.quickActionTextGroup}>
                  <Text style={styles.quickActionTitle} numberOfLines={1}>{t('landing.quick_gps_title')}</Text>
                  <Text style={styles.quickActionDesc} numberOfLines={2}>
                    {t('landing.quick_gps_desc')}
                  </Text>
                </View>
                <Text style={styles.quickActionChevron}>›</Text>
              </Pressable>

              {/* Nút 2: Sổ tay */}
              <Pressable
                testID="landing-quick-notebook"
                accessibilityRole="button"
                accessibilityLabel={t('landing.quick_notebook_label')}
                onPress={() => setNotebookVisible(true)}
                style={({ pressed }) => [styles.quickActionCard, pressed && styles.pressed]}
              >
                <View style={styles.quickActionIconCircle}>
                  <AppIcon name="write" size={20} color="#2D5748" />
                </View>
                <View style={styles.quickActionTextGroup}>
                  <Text style={styles.quickActionTitle} numberOfLines={1}>{t('landing.quick_notebook_title')}</Text>
                  <Text style={styles.quickActionDesc} numberOfLines={2}>
                    {t('landing.quick_notebook_desc')}
                  </Text>
                </View>
                <Text style={styles.quickActionChevron}>›</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </ImageBackground>

      {/* 5. MODAL SỔ TAY NGÕ PHỐ (CHỨA HÀNH TRÌNH, CÔNG CỤ, HỘ CHIẾU & DEMO/LIVE TOGGLE) */}
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
    paddingBottom: 40,
  },
  headerBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  headerBarStacked: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.sm,
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
  headerNotebookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(30, 32, 25, 0.70)',
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 247, 0.22)',
    gap: 6,
  },
  headerNotebookText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFDF7',
    letterSpacing: 0.2,
  },
  statusLineContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    marginTop: 2,
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
  },
  sectionHeaderStacked: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
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
    minHeight: 310,
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
  quickActionsSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'stretch',
  },
  quickActionsGridStacked: {
    flexDirection: 'column',
  },
  quickActionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF7',
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: '#E8DEC9',
    minHeight: 72,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    gap: spacing.sm,
  },
  quickActionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAE1D1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTextGroup: {
    flex: 1,
    gap: 2,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C221E',
  },
  quickActionDesc: {
    fontSize: 12,
    color: '#6E5D4F',
    lineHeight: 16,
  },
  quickActionChevron: {
    fontSize: 18,
    color: '#A89989',
    fontWeight: '600',
    marginRight: 2,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});
