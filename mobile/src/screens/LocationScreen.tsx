import { useIsFocused } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { DemoNode } from '../data/sourceState';
import { pickCandidate, type Candidate } from '../location/nearest';
import { getNodePhoto, getNodePhotographer } from '../assets/photoMap';
import { colors, radius, spacing, typography } from '../theme';
import { useLocale } from '../context/LocaleContext';
import type { TranslationKey } from '../i18n/translator';

const LIMITS = { maxAccuracyMeters: 50, maxDistanceMeters: 300 };

type Props = {
  nodes: DemoNode[];
  currentNodeId?: string;
  onConfirmNode: (nodeId: string) => void;
};

const meters = (value: number): string =>
  value >= 1000 ? `${(value / 1000).toFixed(1)} km` : `${Math.round(value)} m`;

function explain(result: Candidate, t: (key: TranslationKey, params?: Record<string, string | number>) => string): string {
  switch (result.kind) {
    case 'poor-accuracy':
      return t('location.err_poor_accuracy', { meters: meters(result.accuracy) });
    case 'outside-cluster':
      return t('location.err_outside', { meters: meters(result.distanceMeters) });
    case 'no-coordinates':
      return t('location.err_no_coords');
    case 'needs-position':
      return t('location.err_needs_position');
    case 'candidate':
      return '';
  }
}

export function LocationScreen({ nodes, currentNodeId, onConfirmNode }: Props): ReactElement {
  const { t, locale } = useLocale();
  const focused = useIsFocused();
  const request = useRef(0);
  const waiting = useRef(false);
  useEffect(() => {
    request.current += 1;
    waiting.current = false;
    setBusy(false);
    setResult(undefined);
    return () => { request.current += 1; waiting.current = false; };
  }, [focused, nodes]);
  const [result, setResult] = useState<Candidate | undefined>();
  const [busy, setBusy] = useState(false);
  const current = nodes.find((node) => node.id === currentNodeId);

  async function readPosition(): Promise<void> {
    if (!focused || waiting.current) return;
    const id = ++request.current;
    waiting.current = true;
    setBusy(true);
    setResult(undefined);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (id !== request.current) return;
      if (!permission.granted) {
        setResult({ kind: 'needs-position' });
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (id !== request.current) return;
      setResult(
        pickCandidate(
          nodes,
          {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy ?? undefined,
          },
          LIMITS,
        ),
      );
    } catch {
      if (id === request.current) setResult({ kind: 'needs-position' });
    } finally {
      if (id === request.current) { waiting.current = false; setBusy(false); }
    }
  }

  function stopWaiting(): void {
    request.current += 1;
    waiting.current = false;
    setBusy(false);
    setResult(undefined);
  }

  function confirm(node: DemoNode): void {
    if (!node.available) return;
    stopWaiting();
    onConfirmNode(node.id);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerBox}>
          <Text style={styles.phase}>
            {locale === 'en' ? 'Alley Positioning · GPS Suggestion' : 'Định vị ngõ phố · Gợi ý GPS'}
          </Text>
          <Text accessibilityRole="header" style={styles.mainTitle}>
            {locale === 'en' ? 'Confirm Touchpoint' : 'Xác nhận điểm chạm'}
          </Text>
          <Text style={styles.subtitle}>
            {locale === 'en'
              ? 'App reads GPS once upon button tap to estimate nearest alley, with no background tracking.'
              : 'App chỉ đọc GPS một lần khi bạn chạm nút để ước lượng con ngõ gần nhất, hoàn toàn không theo dõi vị trí nền.'}
          </Text>
        </View>

        {/* Thẻ điểm hiện tại */}
        <View style={styles.currentCard}>
          <View style={styles.currentRow}>
            <Image
              source={getNodePhoto(currentNodeId ?? '')}
              style={styles.currentThumb}
              resizeMode="cover"
            />
            <View style={styles.currentInfo}>
              <Text style={styles.currentLabel}>
                {locale === 'en' ? 'Current passport stop:' : 'Điểm hiện tại trên sổ tay:'}
              </Text>
              <Text accessibilityRole="header" style={styles.currentName}>
                {current?.name ?? (locale === 'en' ? 'Unconfirmed stop' : 'Chưa xác nhận điểm')}
              </Text>
              <Text style={styles.currentPhotographer}>
                {t('common.photo_author', { author: getNodePhotographer(currentNodeId ?? '') })}
              </Text>
            </View>
          </View>
          <Text style={styles.currentNote}>
            {locale === 'en'
              ? 'GPS only suggests adjacent stops, never changes stop automatically without confirmation.'
              : 'GPS chỉ gợi ý điểm kế cận, không bao giờ tự động chuyển điểm nếu không có sự xác nhận của bạn.'}
          </Text>
        </View>

        {/* Hộp quét GPS */}
        <View style={styles.card} accessibilityLiveRegion="polite">
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {t('location.title')}
          </Text>
          <Text style={styles.body}>
            {locale === 'en'
              ? 'Tap button below to get coordinates once and suggest matching stop:'
              : 'Chạm nút dưới đây để app lấy tọa độ một lần và gợi ý điểm ngõ tương ứng:'}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={locale === 'en' ? 'Get my location' : 'Lấy vị trí của tôi'}
            onPress={() => void readPosition()}
            disabled={busy}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryText}>
              {busy ? t('location.waiting') : ('📍 ' + t('location.find_button'))}
            </Text>
          </Pressable>

          {busy && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={locale === 'en' ? 'Stop searching' : 'Dừng chờ GPS'}
              onPress={stopWaiting}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryText}>{t('location.stop_waiting')}</Text>
            </Pressable>
          )}

          {/* Ứng viên tìm thấy */}
          {result?.kind === 'candidate' && (
            <View style={styles.candidateCard}>
              <View style={styles.candidateTag}>
                <Text style={styles.candidateTagText}>{t('location.nearest_candidate')}</Text>
              </View>

              <View style={styles.candidatePreviewRow}>
                <Image
                  source={getNodePhoto(result.node.id)}
                  style={styles.candidateImage}
                  resizeMode="cover"
                />
                <View style={styles.candidateDetails}>
                  <Text style={styles.candidateTitle}>{result.node.name}</Text>
                  <Text style={styles.candidateDistance}>
                    {t('location.distance_hint', { meters: meters(result.distanceMeters) })}
                  </Text>
                  <Text style={styles.candidateAccuracy}>
                    {locale === 'en' ? `GPS accuracy: ±${meters(result.accuracy)}` : `Độ chính xác GPS: ±${meters(result.accuracy)}`}
                  </Text>
                </View>
              </View>

              <Text style={styles.candidateNotice}>
                {locale === 'en'
                  ? 'This is only a suggestion. Current stop remains until you confirm.'
                  : 'Đây chỉ là đề xuất. Điểm hiện tại vẫn giữ nguyên cho tới khi bạn bấm xác nhận.'}
              </Text>

              <View style={styles.buttonRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => confirm(result.node)}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    styles.flex1,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.primaryText}>{t('location.confirm_button')}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setResult(undefined)}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    styles.flex1,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.secondaryText}>{t('common.cancel')}</Text>
                </Pressable>
              </View>
            </View>
          )}

          {result !== undefined && result.kind !== 'candidate' && (
            <View style={styles.hintBox}>
              <Text style={styles.hint}>{explain(result, t)}</Text>
            </View>
          )}
        </View>

        {/* Chọn bằng tay */}
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {locale === 'en' ? 'Or select manually' : 'Hoặc chọn điểm bằng tay'}
          </Text>
          <Text style={styles.body}>
            {locale === 'en'
              ? 'Always functions smoothly whether device GPS is enabled or not:'
              : 'Luôn luôn hoạt động trơn tru bất kể thiết bị có mở GPS hay không:'}
          </Text>

          <View style={styles.manualList}>
            {nodes.map((node) => {
              const isCurrent = node.id === currentNodeId;
              return (
                <Pressable
                  key={node.id}
                  accessibilityRole="button"
                  accessibilityLabel={
                    locale === 'en'
                      ? `Select ${node.name} manually, simulated`
                      : `Chọn điểm ${node.name} bằng tay, mô phỏng`
                  }
                  disabled={!node.available}
                  onPress={() => confirm(node)}
                  style={({ pressed }) => [
                    styles.pointRow,
                    isCurrent && styles.pointRowActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Image
                    source={getNodePhoto(node.id)}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.pointInfo}>
                    <Text style={styles.pointName}>{node.name}</Text>
                    <Text style={styles.pointMeta}>
                      {t('common.simulated_minutes', { minutes: node.visitMinutes })}
                      {isCurrent ? (locale === 'en' ? ' · Currently selected' : ' · Đang là điểm hiện tại') : ''}
                    </Text>
                  </View>
                  <Text style={[styles.selectAction, isCurrent && styles.selectActionActive]}>
                    {!node.available
                      ? (locale === 'en' ? 'Locked' : 'Chưa mở')
                      : isCurrent
                        ? (locale === 'en' ? 'Current' : 'Hiện tại')
                        : (locale === 'en' ? 'Select →' : 'Chọn →')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.disclaimerBox}>
          <Text style={styles.note}>
            {locale === 'en'
              ? 'Coordinates in demo are simulated, not for outdoor navigation. App does not provide turn-by-turn routing or track background location.'
              : 'Tọa độ trong bản demo là mô phỏng, không dùng để đi bộ ngoài thực địa. App không chỉ đường và không theo dõi vị trí nền.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 60,
  },
  headerBox: {
    gap: spacing.xs,
  },
  phase: {
    ...typography.label,
    color: colors.terracotta,
    textTransform: 'uppercase',
  },
  mainTitle: {
    ...typography.titleLarge,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.muted,
  },
  currentCard: {
    backgroundColor: colors.surfaceWarm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  currentThumb: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  currentInfo: {
    flex: 1,
    gap: 2,
  },
  currentLabel: {
    ...typography.micro,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  currentName: {
    ...typography.titleSmall,
    color: colors.text,
  },
  currentPhotographer: {
    ...typography.micro,
    color: colors.muted,
    fontStyle: 'italic',
  },
  currentNote: {
    ...typography.bodySmall,
    color: colors.muted,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    ...typography.titleMedium,
    color: colors.text,
  },
  body: {
    ...typography.bodyMedium,
    color: colors.muted,
    lineHeight: 22,
  },
  primaryButton: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryText: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.surface,
  },
  secondaryButton: {
    minHeight: 48,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceWarm,
  },
  secondaryText: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.accent,
  },
  candidateCard: {
    backgroundColor: colors.surfaceWarm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.accent,
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  candidateTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  candidateTagText: {
    ...typography.micro,
    color: colors.surface,
    fontWeight: '700',
  },
  candidatePreviewRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  candidateImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  candidateDetails: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  candidateTitle: {
    ...typography.titleSmall,
    color: colors.text,
  },
  candidateDistance: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
  },
  candidateAccuracy: {
    ...typography.micro,
    color: colors.muted,
  },
  candidateNotice: {
    ...typography.micro,
    color: colors.muted,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  hintBox: {
    backgroundColor: colors.surfaceWarm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.terracotta,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.terracotta,
    lineHeight: 20,
  },
  manualList: {
    gap: spacing.xs,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pointRowActive: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  },
  pointInfo: {
    flex: 1,
    gap: 2,
  },
  pointName: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.text,
  },
  pointMeta: {
    ...typography.micro,
    color: colors.muted,
  },
  selectAction: {
    ...typography.micro,
    fontWeight: '600',
    color: colors.accent,
    paddingRight: spacing.xs,
  },
  selectActionActive: {
    color: colors.terracotta,
  },
  disclaimerBox: {
    backgroundColor: colors.surfaceWarm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  note: {
    ...typography.bodySmall,
    color: colors.muted,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.72,
  },
});
