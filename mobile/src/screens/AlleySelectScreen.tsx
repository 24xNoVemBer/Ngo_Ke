import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState, type ReactElement } from 'react';
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Mode } from '../data/sourceState';
import type { RootStackParamList } from '../navigation';
import { ALLEY_LIST, type AlleyMeta } from '../assets/photoMap';
import { normalizeQuestion } from '../qa/match';
import { NgoKeLogo } from '../components/NgoKeLogo';
import {
  useEntranceFadeSlide,
  usePressSpring,
} from '../hooks/useMotion';
import { radius, spacing } from '../theme';

import { useLocale } from '../context/LocaleContext';

type Props = NativeStackScreenProps<RootStackParamList, 'AlleySelect'> & { nodeCount: number; mode?: Mode };

type LocationFilter = 'Tất cả' | 'Hàng Buồm' | 'Hàng Gai' | 'Đồng Xuân' | 'Ẩm thực';

interface AlleyCardItemProps {
  alley: AlleyMeta;
  index: number;
  nodeCount: number;
  mode: Mode;
  onSelect: () => void;
}

function AlleyCardItem({
  alley,
  index,
  nodeCount,
  mode,
  onSelect,
}: AlleyCardItemProps): ReactElement {
  const { t } = useLocale();
  const entrance = useEntranceFadeSlide({
    delay: Math.min(650, 220 + index * 75),
    duration: 380,
    offsetY: 26,
  });
  const { scaleAnim, handlePressIn, handlePressOut } = usePressSpring(0.975);

  return (
    <Animated.View
      style={{
        opacity: entrance.opacity,
        transform: [{ translateY: entrance.translateY }, { scale: scaleAnim }],
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('alley_select.open_label', { name: alley.name })}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onSelect}
        style={styles.cinematicCard}
      >
        {/* Ảnh bìa chụp thật khổ lớn */}
        <Image source={alley.coverPhoto} style={styles.cardCoverImage} resizeMode="cover" />

        {/* Lớp gradient tối mộc mạc làm nổi bật chữ */}
        <View style={styles.cardScrim} />

        {/* Huy hiệu góc trên: Gần nhất hoặc cự ly GPS */}
        <View style={styles.cardHeaderBadges}>
          <View style={styles.themeBadge}>
            <Text style={styles.themeBadgeText}>{alley.theme}</Text>
          </View>

          <View style={styles.distanceBadge}>
            <Text style={styles.distanceBadgeText}>DEMO</Text>
          </View>
        </View>

        {/* Thông tin cốt lõi ngắn gọn ở đáy thẻ */}
        <View style={styles.cardBottomBar}>
          <View style={styles.cardTextCol}>
            <Text style={styles.cardDistrictText}>{alley.district}</Text>
            <Text style={styles.cardNameText}>{alley.name}</Text>
            <Text style={styles.cardBriefMeta}>
              {t('alley_select.meta_info', { count: nodeCount, mode: mode === 'demo' ? t('common.demo') : t('common.live') })}
            </Text>
          </View>

          {/* Nút mũi tên chuyển tiếp sang bản đồ ngõ */}
          <View style={styles.cardForwardBtn}>
            <Text style={styles.cardForwardIcon}>→</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function AlleySelectScreen({ navigation, nodeCount, mode = 'demo' }: Props): ReactElement {
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<LocationFilter>('Tất cả');

  const topPadding = Math.max(insets.top, 28) + 8;
  const bottomPadding = Math.max(insets.bottom, 16) + 20;

  // Lọc danh sách con ngõ theo ô tìm kiếm địa chỉ và bộ lọc khu vực
  const filteredAlleys = ALLEY_LIST.filter((alley) => {
    const query = normalizeQuestion(searchQuery);
    const matchSearch =
      query.length === 0 ||
      normalizeQuestion(alley.name).includes(query) ||
      normalizeQuestion(alley.district).includes(query) ||
      normalizeQuestion(alley.tagline).includes(query) ||
      normalizeQuestion(alley.theme).includes(query);

    const matchFilter =
      selectedFilter === 'Tất cả' ||
      alley.district.includes(selectedFilter) ||
      alley.theme === selectedFilter;

    return matchSearch && matchFilter;
  });

  function handleSelectAlley(alleyId: string): void {
    navigation.navigate('Home', { alleyId });
  }

  const topBarEntrance = useEntranceFadeSlide({ delay: 30, duration: 360, offsetY: 14 });
  const gpsCardEntrance = useEntranceFadeSlide({ delay: 110, duration: 420, offsetY: 22 });
  const listHeaderEntrance = useEntranceFadeSlide({ delay: 190, duration: 400, offsetY: 20 });
  const radarScale = 1;
  const radarOpacity = 0.4;

  return (
    <View style={styles.rootContainer}>
      {/* 1. THANH TIÊU ĐỀ TRÊN CÙNG */}
      <Animated.View
        style={[
          styles.topBar,
          {
            paddingTop: topPadding,
            opacity: topBarEntrance.opacity,
            transform: [{ translateY: topBarEntrance.translateY }],
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <Text style={styles.backBtnIcon}>‹</Text>
        </Pressable>

        <View style={styles.topBarTitleCenter}>
          <NgoKeLogo size="sm" variant="iconOnly" />
          <Text style={styles.topBarMainTitle}>{t('alley_select.title')}</Text>
        </View>

        <View style={[styles.gpsHeaderBtn, fontScale > 1.2 && styles.gpsHeaderBtnLarge]}>
          <Text style={styles.gpsHeaderBtnIcon}>DEMO</Text>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 2. Ô ĐỊNH VỊ GPS TÌM ĐỊA CHỈ THÔNG MINH (GPS ADDRESS HUB) */}
        <Animated.View
          style={[
            styles.gpsAddressCard,
            {
              opacity: gpsCardEntrance.opacity,
              transform: [{ translateY: gpsCardEntrance.translateY }],
            },
          ]}
        >
          {/* Hàng 1: Trạng thái định vị GPS thực tế kèm hiệu ứng Radar tỏa tròn */}
          <View style={styles.gpsStatusRow}>
            <View style={styles.gpsPulseWrapper}>
              <Animated.View
                style={[
                  styles.gpsPulseRing,
                  {
                    transform: [{ scale: radarScale }],
                    opacity: radarOpacity,
                  },
                ]}
              />
              <View style={styles.gpsPulseDot} />
            </View>
            <View style={styles.gpsInfoTextGroup}>
              <Text style={styles.gpsStatusLabel}>{t('alley_select.demo_area')}</Text>
              <Text style={styles.gpsLocationName} numberOfLines={1}>
                {t('alley_select.demo_subtext')}
              </Text>
            </View>
          </View>

          {/* Hàng 2: Ô NHẬP TÌM ĐỊA CHỈ & TÊN NGÕ */}
          <View style={styles.addressSearchBox}>
            <Text style={styles.searchBoxIcon}>🔍</Text>
            <TextInput
              accessibilityLabel={t('alley_select.search_placeholder')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              multiline={false}
              numberOfLines={1}
              placeholder={t('alley_select.search_placeholder')}
              placeholderTextColor="#8C7D70"
              style={styles.addressInputField}
            />
            {searchQuery.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('alley_select.clear_search')}
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchButton}
              >
                <Text style={styles.clearSearchIcon}>✕</Text>
              </Pressable>
            )}
          </View>

          {/* Hàng 3: Gợi ý ngõ gần nhất theo GPS */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('alley_select.hint', { mode: mode === 'demo' ? t('common.demo') : t('common.live') })}
            onPress={() => handleSelectAlley('phat-loc')}
            style={({ pressed }) => [styles.nearestAlleyPill, pressed && styles.pressed]}
          >
            <Text style={styles.nearestSparkle}>✨</Text>
            <Text style={styles.nearestAlleyLabel}>
              {t('alley_select.hint', { mode: mode === 'demo' ? t('common.demo') : t('common.live') })}
            </Text>
            <Text style={styles.nearestChevron}>›</Text>
          </Pressable>

          {/* Hàng 4: Các chip lọc địa bàn & chủ đề nhanh */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsRow}
          >
            {(['Tất cả', 'Hàng Buồm', 'Hàng Gai', 'Đồng Xuân', 'Ẩm thực'] as const).map(
              (filter) => {
                const isSelected = selectedFilter === filter;
                return (
                  <Pressable
                    key={filter}
                    accessibilityRole="button"
                    accessibilityLabel={filter}
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setSelectedFilter(filter)}
                    style={[
                      styles.filterChip,
                      isSelected && styles.filterChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isSelected && styles.filterChipTextSelected,
                      ]}
                    >
                      {filter}
                    </Text>
                  </Pressable>
                );
              },
            )}
          </ScrollView>
        </Animated.View>

        {/* 3. DANH SÁCH CÁC CON NGÕ: THIẾT KẾ ĐIỆN ẢNH KHỔ LỚN, TINH GIẢN */}
        <Animated.View
          style={[
            styles.sectionHeader,
            {
              opacity: listHeaderEntrance.opacity,
              transform: [{ translateY: listHeaderEntrance.translateY }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>
            {t('alley_select.explore_count', { count: filteredAlleys.length })}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {t('alley_select.sample_list')}
          </Text>
        </Animated.View>

        {filteredAlleys.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateIcon}>🏮</Text>
            <Text style={styles.emptyStateTitle}>{t('alley_select.empty')}</Text>
            <Pressable
              onPress={() => {
                setSearchQuery('');
                setSelectedFilter('Tất cả');
              }}
            >
              <Text style={styles.emptyStateReset}>{t('alley_select.reset_filter')}</Text>
            </Pressable>
          </View>
        ) : (
          filteredAlleys.map((alley, index) => (
            <AlleyCardItem
              mode={mode}
              key={alley.id}
              alley={alley}
              index={index}
              nodeCount={nodeCount}
              onSelect={() => handleSelectAlley(alley.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#F5EFE6',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: '#FFFDF9',
    borderBottomWidth: 1,
    borderColor: '#EAE1CE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFE8DA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DFD2BD',
  },
  backBtnIcon: {
    fontSize: 26,
    lineHeight: 28,
    fontWeight: '300',
    color: '#342922',
    textAlign: 'center',
    marginTop: -2,
  },
  topBarTitleCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexShrink: 1,
  },
  topBarMainTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2C221E',
    flexShrink: 1,
  },
  gpsHeaderBtn: {
    minWidth: 48,
    minHeight: 48,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: '#EFE8DA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DFD2BD',
  },
  gpsHeaderBtnLarge: {
    minHeight: 56,
    paddingHorizontal: 12,
  },
  gpsHeaderBtnActive: {
    backgroundColor: '#1E6B4A',
    borderColor: '#1E6B4A',
  },
  gpsHeaderBtnIcon: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  gpsAddressCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E6DCC8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  gpsStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gpsPulseWrapper: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gpsPulseRing: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(30, 107, 74, 0.4)',
  },
  gpsPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E6B4A',
  },
  gpsInfoTextGroup: {
    flex: 1,
    gap: 1,
  },
  gpsStatusLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8C5A40',
    letterSpacing: 0.6,
  },
  gpsLocationName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C221E',
  },
  gpsScanBtn: {
    backgroundColor: '#EFE8DA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#DFD2BD',
  },
  gpsScanBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5C483D',
  },
  addressSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F1E7',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#DFD2BD',
    gap: 8,
  },
  searchBoxIcon: {
    fontSize: 14,
  },
  addressInputField: {
    flex: 1,
    minHeight: 48,
    fontSize: 12.5,
    color: '#2C221E',
    fontWeight: '500',
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  clearSearchButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearSearchIcon: {
    fontSize: 12,
    color: '#8C7D70',
    fontWeight: '700',
    padding: 4,
  },
  nearestAlleyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    backgroundColor: 'rgba(235, 175, 75, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(235, 175, 75, 0.4)',
    gap: 6,
  },
  nearestSparkle: {
    fontSize: 12,
  },
  nearestAlleyLabel: {
    flex: 1,
    fontSize: 11.5,
    color: '#5C483D',
  },
  nearestAlleyBold: {
    fontWeight: '800',
    color: '#2C221E',
  },
  nearestChevron: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8C5A40',
  },
  filterChipsRow: {
    gap: 8,
    paddingTop: 2,
  },
  filterChip: {
    backgroundColor: '#F5ECE0',
    paddingHorizontal: 12,
    minHeight: 48,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E2D5BE',
  },
  filterChipSelected: {
    backgroundColor: '#1E6B4A',
    borderColor: '#1E6B4A',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5C483D',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sectionHeader: {
    paddingHorizontal: 2,
    gap: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2C221E',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#7C6A5A',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl + 12,
    gap: spacing.sm,
  },
  emptyStateIcon: {
    fontSize: 32,
  },
  emptyStateTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#5C483D',
  },
  emptyStateReset: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E6B4A',
  },
  cinematicCard: {
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#2A2018',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  cardCoverImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  cardScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(18, 14, 10, 0.45)',
  },
  cardHeaderBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeBadge: {
    backgroundColor: 'rgba(30, 107, 74, 0.92)',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: radius.pill,
  },
  themeBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  distanceBadge: {
    backgroundColor: 'rgba(24, 18, 14, 0.75)',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: radius.pill,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 245, 230, 0.3)',
  },
  distanceBadgeNearest: {
    backgroundColor: '#C26747',
    borderColor: '#FFFDF7',
  },
  distanceBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#FFE29A',
  },
  distanceBadgeNearestText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  cardBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(18, 12, 8, 0.68)',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cardTextCol: {
    flex: 1,
    gap: 2,
  },
  cardDistrictText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#E8D5BC',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardNameText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFDF7',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardBriefMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 253, 247, 0.85)',
  },
  cardForwardBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E6B4A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  cardForwardIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: -2,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
});
