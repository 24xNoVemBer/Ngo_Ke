import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState, type ReactElement } from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  Modal,
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
import { useMotionState } from '../hooks/MotionPreferences';
import { AppIcon } from '../components/AppIcon';
import { NgoKeLogo } from '../components/NgoKeLogo';
import { NotebookDrawerModal } from '../components/NotebookDrawerModal';
import { useEntranceFadeSlide } from '../hooks/useMotion';
import { useLocale } from '../context/LocaleContext';
import { getBundledDataset, getLocalizedCollections, isCollectionId } from '../data/collections';
import { colors, radius, spacing } from '../theme';

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

  const motion = useMotionState();
  const [passportVisible, setPassportVisible] = useState(false);
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
  const quoteEntrance = useEntranceFadeSlide({ delay: 280, duration: 380, offsetY: 18 });
  const teaserEntrance = useEntranceFadeSlide({ delay: 350, duration: 380, offsetY: 18 });

  return (
    <View style={styles.rootContainer}>
      {/* 1. NỀN ẢNH ĐIỆN ẢNH PHỐ CỔ TRÀN VIỀN */}
      <ImageBackground
        source={HERO_PHOTO}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        {/* Lớp phủ phim màu hoài niệm ấm áp theo thời gian trong ngày */}
        <View style={styles.scrimOverlay} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: topPadding, paddingBottom: Math.max(insets.bottom, 24) + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* 2. THANH THƯƠNG HIỆU & ÂM THANH KHÔNG GIAN (SOUNDSCAPE) */}
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
              <Pressable
                testID="locale-switch"
                accessibilityRole="button"
                accessibilityLabel={locale === 'vi' ? 'Ngôn ngữ: Tiếng Việt. Chạm để đổi sang English' : 'Language: English. Tap to switch to Tiếng Việt'}
                hitSlop={8}
                onPress={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
                style={styles.soundscapePill}
              >
                <Text style={styles.soundscapeIcon}>{locale.toUpperCase()}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={mode === 'demo' ? t('home.mode_demo') : t('home.mode_live')}
                hitSlop={8}
                onPress={() => setNotebookVisible(true)}
                style={styles.soundscapePill}
              >
                <Text style={styles.soundscapeIcon}>{mode.toUpperCase()}</Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Banner thông báo âm thanh không gian khi bật */}
          <View style={styles.soundscapeBanner}>
            <Text style={styles.soundscapeBannerText}>
              {t('landing.soundscape_banner', { mode: mode === 'demo' ? t('common.demo') : t('common.live') })}
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
              <View>
                <Text style={styles.sectionPreTitle}>{t('landing.featured_section_pre')}</Text>
                <Text style={styles.sectionMainTitle}>{t('landing.featured_section_title')}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('landing.see_all_label')}
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
                    <Image source={col.coverPhoto} style={styles.alleyCardImage} />
                    <View style={styles.alleyCardScrim} />

                    {/* Badge chủ đề */}
                    <View style={styles.cardThemeTag}>
                      <Text style={styles.cardThemeTagText}>{col.theme}</Text>
                    </View>

                    <View style={styles.alleyCardContent}>
                      <Text style={styles.alleyCardDistrict}>{col.district}</Text>
                      <Text style={styles.alleyCardName}>{col.name}</Text>
                      <Text style={styles.alleyCardTagline}>
                        {col.tagline}
                      </Text>

                      <View style={styles.alleyCardMetaRow}>
                        <Text style={styles.cardStoryCount}>
                          {t('common.stop_count', { count: col.nodeCount })} · {mode === 'demo' ? t('common.demo') : t('common.live')}
                        </Text>
                        <Text style={styles.cardDuration}>
                          {col.id === 'old-quarter-three-lenses'
                            ? (locale === 'en' ? 'Sourced · not officially approved' : 'Có nguồn · chưa duyệt chính thức')
                            : (col.kind === 'reviewed' ? t('common.reviewed') : t('common.simulated'))}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </Animated.View>

          {/* 4. TIỆN ÍCH TRỰC TIẾP: VỊ TRÍ GPS & SỔ TAY HÀNH TRÌNH */}
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
              <View>
                <Text style={styles.sectionPreTitle}>{t('landing.quick_section_pre')}</Text>
                <Text style={styles.sectionMainTitle}>{t('landing.quick_section_title')}</Text>
              </View>
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
                  <Text style={styles.quickActionTitle}>{t('landing.quick_gps_title')}</Text>
                  <Text style={styles.quickActionDesc}>
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
                  <Text style={styles.quickActionTitle}>{t('landing.quick_notebook_title')}</Text>
                  <Text style={styles.quickActionDesc}>
                    {t('landing.quick_notebook_desc')}
                  </Text>
                </View>
                <Text style={styles.quickActionChevron}>›</Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* 5. KHỐI LỜI DẪN TỰ SỰ GỌN (COMPACT LEAD QUOTE) */}
          <Animated.View
            style={[
              styles.compactQuoteCard,
              {
                opacity: quoteEntrance.opacity,
                transform: [{ translateY: quoteEntrance.translateY }],
              },
            ]}
          >
            <View style={styles.quoteDecorStrip} />
            <View style={styles.compactQuoteRow}>
              <Text style={styles.compactQuoteMark}>“</Text>
              <View style={styles.compactQuoteTextGroup}>
                <Text style={styles.compactQuoteText}>
                  {t('landing.quote_text')}
                </Text>
                <Text style={styles.compactQuoteAuthor}>{t('landing.quote_author')}</Text>
              </View>
            </View>
          </Animated.View>

          {/* 6. LỐI TẮT HỘ CHIẾU NGÕ PHỐ (ALLEY PASSPORT) */}
          <Animated.View
            style={{
              opacity: teaserEntrance.opacity,
              transform: [{ translateY: teaserEntrance.translateY }],
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('landing.passport_open_label')}
              onPress={() => setPassportVisible(true)}
              style={({ pressed }) => [styles.passportTeaserCard, pressed && styles.pressed]}
            >
              <View style={styles.passportIconCircle}>
                <AppIcon name="book" color={colors.terracotta} />
              </View>
              <View style={styles.passportTextGroup}>
                <Text style={styles.passportTitle}>{t('landing.passport_title')}</Text>
                <Text style={styles.passportDesc}>
                  {t('landing.passport_desc')}
                </Text>
              </View>
              <Text style={styles.passportChevron}>›</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </ImageBackground>

      {/* 7. MODAL SỔ TAY NGÕ PHỐ (HÀNH TRÌNH & CÔNG CỤ: PLAN, CAMERA, GPS, DEMO/LIVE) */}
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

      {/* 8. MODAL HỘ CHIẾU NGÕ PHỐ (STAMP PASSPORT MODAL) */}
      <Modal
        visible={passportVisible}
        animationType={motion.reducedMotion ? 'none' : 'slide'}
        transparent
        onRequestClose={() => setPassportVisible(false)}
        accessibilityViewIsModal
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            accessibilityRole="button"
            style={styles.modalDismissArea}
            onPress={() => setPassportVisible(false)}
            accessibilityLabel={t('common.close')}
          />

          <View style={styles.passportSheet}>

            <View style={styles.passportHeaderRow}>
              <View>
                <Text style={styles.passportPhase}>{t('landing.passport_phase')}</Text>
                <Text accessibilityRole="header" style={styles.passportModalTitle}>
                  {t('landing.passport_title')}
                </Text>
              </View>
              <Pressable
                onPress={() => setPassportVisible(false)}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                style={styles.closePassportButton}
              >
                <Text style={styles.closePassportText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.passportScrollContent}>
              <Text style={styles.passportGuideText}>
                {t('landing.passport_guide')}
              </Text>

              {collections.map((col) => (
                <View key={col.id} style={styles.passportAlleySection}>
                  <View style={styles.passportAlleyHeader}>
                    <Text style={styles.passportAlleyName}>{col.name}</Text>
                    <View style={styles.badgeSamplePill}>
                      <Text style={styles.badgeSampleText}>{t('landing.badge_sample')}</Text>
                    </View>
                  </View>
                  <Text style={styles.passportAlleyDistrict}>{col.district}</Text>

                  <View style={styles.passportStopsRow}>
                    {Array.from({ length: Math.min(col.nodeCount, 6) }).map((_, i) => (
                      <View key={i} style={styles.passportStampSlot}>
                        <View style={styles.stampDottedCircle}>
                          <Text style={styles.stampNumberText}>{i + 1}</Text>
                        </View>
                        <Text style={styles.stampSlotLabel}>
                          {`${t('home.stop_prefix')} ${i + 1}`}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'rgba(22, 24, 18, 0.40)',
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
    paddingBottom: spacing.sm,
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
  soundscapePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(30, 32, 25, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 247, 0.22)',
  },
  soundscapeIcon: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFDF7',
    letterSpacing: 0.5,
  },
  soundscapeBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(42, 111, 80, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(42, 111, 80, 0.65)',
    alignSelf: 'flex-start',
  },
  soundscapeBannerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E8F5E9',
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
  sectionPreTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 253, 247, 0.70)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sectionMainTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFDF7',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  seeAllLink: {
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
    color: '#D4AF37',
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
  alleyCardScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(20, 22, 16, 0.45)',
  },
  cardThemeTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(20, 22, 16, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 247, 0.2)',
  },
  cardThemeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFDF7',
    letterSpacing: 0.4,
  },
  cardDistanceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(42, 111, 80, 0.75)',
  },
  cardDistanceText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFDF7',
    letterSpacing: 0.6,
  },
  alleyCardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
    gap: 4,
  },
  alleyCardDistrict: {
    fontSize: 11,
    fontWeight: '600',
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
    borderTopColor: 'rgba(255, 253, 247, 0.15)',
  },
  cardStoryCount: {
    fontSize: 11,
    color: 'rgba(255, 253, 247, 0.7)',
  },
  cardDuration: {
    fontSize: 11,
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
    minHeight: 56,
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
    fontSize: 11.5,
    color: '#6E5D4F',
    lineHeight: 15,
  },
  quickActionChevron: {
    fontSize: 18,
    color: '#A89989',
    fontWeight: '600',
    marginRight: 2,
  },
  compactQuoteCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: 'rgba(255, 253, 247, 0.92)',
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 247, 0.35)',
  },
  quoteDecorStrip: {
    width: 3,
    backgroundColor: '#8C5A40',
    borderRadius: 1.5,
  },
  compactQuoteRow: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  compactQuoteMark: {
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '800',
    color: '#8C5A40',
    fontFamily: 'serif',
  },
  compactQuoteTextGroup: {
    flex: 1,
    gap: 4,
  },
  compactQuoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#4A3B32',
    lineHeight: 18,
  },
  compactQuoteAuthor: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C5A40',
    letterSpacing: 0.4,
  },
  passportTeaserCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 253, 247, 0.92)',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 247, 0.4)',
  },
  passportIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5ECE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passportTextGroup: {
    flex: 1,
    gap: 2,
  },
  passportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C221E',
  },
  passportDesc: {
    fontSize: 11,
    color: '#6E5D4F',
  },
  passportChevron: {
    fontSize: 16,
    color: '#8C5A40',
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 12, 10, 0.72)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  passportSheet: {
    backgroundColor: '#FFFDF8',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '82%',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + 12,
    borderTopWidth: 1,
    borderColor: '#EFE5D4',
  },
  passportHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  passportPhase: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C5A40',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  passportModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2C221E',
  },
  closePassportButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFE8DA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closePassportText: {
    fontSize: 14,
    color: '#4A3B32',
    fontWeight: '700',
  },
  passportScrollContent: {
    gap: spacing.lg,
  },
  passportGuideText: {
    fontSize: 12,
    color: '#6E5D4F',
    lineHeight: 18,
    backgroundColor: '#F5ECE0',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E6D7C2',
  },
  passportAlleySection: {
    gap: spacing.xs,
  },
  passportAlleyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passportAlleyName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C221E',
  },
  badgeSamplePill: {
    backgroundColor: '#8C5A40',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeSampleText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFDF7',
    letterSpacing: 0.5,
  },
  passportAlleyDistrict: {
    fontSize: 11,
    color: '#8C7D70',
  },
  passportStopsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 6,
  },
  passportStampSlot: {
    width: 48,
    alignItems: 'center',
    gap: 4,
  },
  stampDottedCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#C4B5A0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDFBF7',
  },
  stampNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A0907C',
  },
  stampSlotLabel: {
    fontSize: 9.5,
    color: '#8C7D70',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});
