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
import type { RootStackParamList } from '../navigation';
import { ALLEY_LIST, HERO_PHOTO } from '../assets/photoMap';
import { useMotionState } from '../hooks/MotionPreferences';
import { AppIcon } from '../components/AppIcon';
import { NgoKeLogo } from '../components/NgoKeLogo';
import {
  useEntranceFadeSlide,
  usePressSpring,
} from '../hooks/useMotion';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'> & { nodeCount: number; mode?: Mode };

export function LandingScreen({ navigation, nodeCount, mode = 'demo' }: Props): ReactElement {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, fontScale } = useWindowDimensions();

  const [passportVisible, setPassportVisible] = useState(false);

  const topPadding = Math.max(insets.top, 28) + 12;
  const { reducedMotion } = useMotionState();
  const bottomPadding = Math.max(insets.bottom, 20) + 12;

  const headerEntrance = useEntranceFadeSlide({ delay: 60, duration: 420, offsetY: 18 });
  const quoteEntrance = useEntranceFadeSlide({ delay: 160, duration: 420, offsetY: 22 });
  const carouselEntrance = useEntranceFadeSlide({ delay: 320, duration: 420, offsetY: 22 });
  const teaserEntrance = useEntranceFadeSlide({ delay: 400, duration: 420, offsetY: 22 });

  const {
    scaleAnim: ctaPressScale,
    handlePressIn: handleCtaPressIn,
    handlePressOut: handleCtaPressOut,
  } = usePressSpring(0.96);

  return (
    <View style={styles.rootContainer}>
      {/* 1. NỀN ẢNH ĐIỆN ẢNH PHỐ CỔ TRÀN VIỀN */}
      <ImageBackground
        source={HERO_PHOTO}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        {/* Lớp phủ phim màu hoài niệm ấm áp theo thời gian trong ngày */}
        <View
          style={[
            styles.scrimOverlay,
          ]}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: topPadding, paddingBottom: 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* 2. THANH THƯƠNG HIỆU & ÂM THANH KHÔNG GIAN (SOUNDSCAPE) */}
          <Animated.View
            style={[
              styles.headerBar,
              {
                opacity: headerEntrance.opacity,
                transform: [{ translateY: headerEntrance.translateY }],
              },
            ]}
          >
            <NgoKeLogo size="md" variant="horizontal" theme="light" />

            {/* Nút bật/tắt âm thanh không gian ngõ */}
            <Animated.View
              style={[
                styles.soundscapePill,
              ]}
            >
              <Text style={styles.soundscapeIcon}>{mode === 'demo' ? 'DEMO' : 'LIVE'}</Text>
            </Animated.View>
          </Animated.View>

          {/* Banner thông báo âm thanh không gian khi bật */}
          <View style={styles.soundscapeBanner}>
            <Text style={styles.soundscapeBannerText}>
              Lời kể bằng chữ · nội dung mô phỏng · {mode === 'demo' ? 'Demo' : 'nguồn Live'}
            </Text>
          </View>

          {/* 3. KHỐI LỜI TỰ SỰ MỞ LỐI (HERO INTRO) */}
          <Animated.View
            style={[
              styles.heroQuoteCard,
              {
                opacity: quoteEntrance.opacity,
                transform: [{ translateY: quoteEntrance.translateY }],
              },
            ]}
          >
            <View style={styles.quoteDecorStrip} />
            <Text style={styles.quoteMark}>“</Text>
            <Text style={styles.quoteText}>
              Mở một trang sổ tay, chậm bước qua ngõ phố và khám phá những lời kể.
            </Text>
            <Text style={styles.quoteAuthor}>— Dự án Ngõ Kể · Giữ gìn hồn phố cổ</Text>

          </Animated.View>

          {/* 5. DANH MỤC CÁC CON NGÕ TIÊU BIỂU (CAROUSEL NẰM NGANG) */}
          <Animated.View
            style={{
              opacity: carouselEntrance.opacity,
              transform: [{ translateY: carouselEntrance.translateY }],
            }}
          >
            <View style={[styles.sectionHeaderRow, fontScale > 1.2 && styles.sectionHeaderStacked]}>
              <View>
                <Text style={styles.sectionPreTitle}>HÀNH TRÌNH NỔI BẬT</Text>
                <Text style={styles.sectionMainTitle}>Chọn một con ngõ</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Xem tất cả con ngõ"
                onPress={() => navigation.navigate('AlleySelect')}
                style={[styles.seeAllLink, fontScale > 1.2 && styles.seeAllLinkStacked]}
              >
                <Text style={styles.seeAllText}>Xem tất cả ›</Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalAlleyScroll}
            >
              {ALLEY_LIST.map((alley) => (
                <Pressable
                  key={alley.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Mở con ngõ ${alley.name}`}
                  onPress={() => navigation.navigate('Home', { alleyId: alley.id })}
                  style={({ pressed }) => [
                    styles.alleyPreviewCard,
                    { width: Math.min(260, screenWidth * 0.72) },
                    pressed && styles.pressed,
                  ]}
                >
                  <Image source={alley.coverPhoto} style={styles.alleyCardImage} />
                  <View style={styles.alleyCardScrim} />

                  {/* Badge chủ đề */}
                  <View style={styles.cardThemeTag}>
                    <Text style={styles.cardThemeTagText}>{alley.theme}</Text>
                  </View>

                  {/* Khoảng cách ước tính */}
                  <View style={styles.cardDistanceBadge}>
                    <Text style={styles.cardDistanceText}>DEMO</Text>
                  </View>

                  <View style={styles.alleyCardContent}>
                    <Text style={styles.alleyCardDistrict}>{alley.district}</Text>
                    <Text style={styles.alleyCardName}>{alley.name}</Text>
                    <Text style={styles.alleyCardTagline} numberOfLines={2}>
                      {alley.tagline}
                    </Text>

                    <View style={styles.alleyCardMetaRow}>
                      <Text style={styles.cardStoryCount}>
                        Bộ {nodeCount} điểm · {mode === 'demo' ? 'Demo' : 'Live'}
                      </Text>
                      <Text style={styles.cardDuration}>
                        Mô phỏng
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
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
              accessibilityLabel="Mở Hộ chiếu ngõ phố"
              onPress={() => setPassportVisible(true)}
              style={({ pressed }) => [styles.passportTeaserCard, pressed && styles.pressed]}
            >
              <View style={styles.passportIconCircle}>
                <AppIcon name="book" color={colors.terracotta} />
              </View>
              <View style={styles.passportTextGroup}>
                <Text style={styles.passportTitle}>Hộ chiếu ngõ phố</Text>
                <Text style={styles.passportDesc}>
                  Xem mẫu sổ tay · chưa lưu lịch sử ghé thăm
                </Text>
              </View>
              <Text style={styles.passportChevron}>›</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>

        {/* 7. THANH CTA CỐ ĐỊNH Ở ĐÁY: BƯỚC VÀO TRANG CHỌN VỊ TRÍ */}
        <View style={[styles.bottomCtaBar, { paddingBottom: bottomPadding }]}>
          <Animated.View style={{ transform: [{ scale: ctaPressScale }] }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Chọn con ngõ để bắt đầu chuyến đi"
              onPressIn={handleCtaPressIn}
              onPressOut={handleCtaPressOut}
              onPress={() => navigation.navigate('AlleySelect')}
              style={styles.primaryCtaButton}
            >
              <Text style={styles.primaryCtaText}>Khám phá các con ngõ Hà Nội</Text>
              <View style={styles.ctaArrowCircle}>
                <Text style={styles.ctaArrowText}>→</Text>
              </View>
            </Pressable>
          </Animated.View>
        </View>
      </ImageBackground>

      {/* 8. MODAL HỘ CHIẾU NGÕ PHỐ (STAMP PASSPORT MODAL) */}
      <Modal
        visible={passportVisible}
        animationType={reducedMotion ? 'none' : 'slide'}
        transparent
        onRequestClose={() => setPassportVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalDismissArea}
            onPress={() => setPassportVisible(false)}
            accessibilityLabel="Đóng hộ chiếu"
          />

          <View style={styles.passportSheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.passportHeader}>
              <View>
                <Text style={styles.passportSheetPhase}>BỘ SƯU TẬP DI SẢN</Text>
                <Text style={styles.passportSheetTitle}>Hộ Chiếu Ngõ Phố</Text>
              </View>
              <Pressable
                onPress={() => setPassportVisible(false)}
                style={styles.closePassportBtn}
              >
                <Text style={styles.closePassportText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.passportScrollContent}>
              <Text style={styles.passportGuideText}>
                Đây là mẫu trình bày sổ tay. Demo chưa lưu lịch sử ghé thăm; các trang bên dưới chưa có dấu xác nhận.
              </Text>

              <View style={styles.stampsGrid}>
                {ALLEY_LIST.map((alley) => (
                  <View key={alley.id} style={styles.stampCard}>
                    <View
                      style={[
                        styles.stampCircle,
                      ]}
                    >
                      <Text style={styles.stampIcon}>🏮</Text>
                      <Text
                        style={[
                          styles.stampCodeText,
                        ]}
                      >
                        MẪU
                      </Text>
                    </View>
                    <Text style={styles.stampAlleyName}>{alley.name}</Text>
                    <Text style={styles.stampThemeText}>{alley.theme}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'rgba(20, 22, 18, 0.45)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  soundscapePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 20, 16, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 245, 230, 0.25)',
    gap: 8,
  },
  soundscapeIcon: { color: '#FFFDF7', fontSize: 12, fontWeight: '700' },
  soundscapeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(235, 175, 75, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 0.8,
    borderColor: 'rgba(235, 175, 75, 0.45)',
    gap: 6,
    marginTop: -spacing.sm,
  },
  soundscapeBannerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFDF7',
    fontStyle: 'italic',
  },
  heroQuoteCard: {
    backgroundColor: 'rgba(255, 253, 247, 0.94)',
    borderRadius: 20,
    padding: spacing.lg,
    paddingTop: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    position: 'relative',
    overflow: 'hidden',
    gap: 6,
  },
  quoteDecorStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#C26747',
  },
  quoteMark: {
    fontSize: 36,
    color: '#C26747',
    fontWeight: '900',
    lineHeight: 38,
    marginBottom: -16,
  },
  quoteText: {
    fontSize: 14.5,
    lineHeight: 22,
    color: '#342922',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C5A40',
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionHeaderStacked: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  sectionPreTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFE29A',
    letterSpacing: 1,
  },
  sectionMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFDF7',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  seeAllLink: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  seeAllLinkStacked: {
    alignSelf: 'flex-end',
  },
  seeAllText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFE29A',
  },
  horizontalAlleyScroll: {
    gap: spacing.md,
    paddingRight: spacing.sm,
  },
  alleyPreviewCard: {
    height: 310,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#2A2018',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  alleyCardImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  alleyCardScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(18, 14, 10, 0.52)',
  },
  cardThemeTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(42, 111, 80, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  cardThemeTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  cardDistanceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(28, 20, 16, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 245, 230, 0.3)',
  },
  cardDistanceText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#FFE29A',
  },
  alleyCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    gap: 3,
    backgroundColor: 'rgba(20, 14, 10, 0.75)',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  alleyCardDistrict: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#E8D5BC',
    textTransform: 'uppercase',
  },
  alleyCardName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFDF7',
  },
  alleyCardTagline: {
    fontSize: 11,
    color: 'rgba(255, 253, 247, 0.85)',
    lineHeight: 15,
  },
  alleyCardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
    marginTop: 2,
    borderTopWidth: 0.6,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardStoryCount: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFE29A',
  },
  cardDuration: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFDF7',
  },
  passportTeaserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 253, 247, 0.94)',
    borderRadius: 18,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: '#EFE5D4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  passportIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5ECE0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#C26747',
  },
  passportIconText: {
    fontSize: 20,
  },
  passportTextGroup: {
    flex: 1,
    gap: 2,
  },
  passportTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.text,
  },
  passportDesc: {
    fontSize: 11,
    color: colors.muted,
    lineHeight: 15,
  },
  passportChevron: {
    fontSize: 22,
    fontWeight: '700',
    color: '#C26747',
  },
  bottomCtaBar: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: 'rgba(20, 16, 12, 0.82)',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 245, 230, 0.15)',
  },
  primaryCtaButton: {
    backgroundColor: '#1E6B4A',
    borderRadius: 26,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#1E6B4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryCtaText: {
    flex: 1,
    marginRight: 8,
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  ctaArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaArrowText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
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
    maxHeight: '80%',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + 12,
    borderTopWidth: 1,
    borderColor: '#EFE5D4',
  },
  sheetHandle: {
    width: 44,
    height: 4.5,
    backgroundColor: '#D6C9B4',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  passportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  passportSheetPhase: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#8C5A40',
    letterSpacing: 0.8,
  },
  passportSheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2C221E',
  },
  closePassportBtn: {
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
    gap: spacing.md,
  },
  passportGuideText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#5C483D',
  },
  stampsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  stampCard: {
    width: '47%',
    backgroundColor: '#F8F3E9',
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8DEC9',
    gap: 4,
  },
  stampCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: '#C26747',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(246, 234, 230, 0.6)',
  },
  stampIcon: {
    fontSize: 18,
  },
  stampCodeText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#C26747',
  },
  stampAlleyName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C221E',
    textAlign: 'center',
  },
  stampThemeText: {
    fontSize: 10,
    color: '#8C5A40',
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});
