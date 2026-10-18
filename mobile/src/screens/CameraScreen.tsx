import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { DemoNode } from '../data/sourceState';
import { confirmByQr, selectManually } from '../qr/confirmPoint';
import { getNodePhoto, getNodePhotographer } from '../assets/photoMap';
import { useMotionState } from '../hooks/MotionPreferences';
import { useLaserScanner, usePulseLoop } from '../hooks/useMotion';
import { colors, radius, spacing, typography } from '../theme';
import { useLocale } from '../context/LocaleContext';

type Props = {
  nodes: DemoNode[];
  onConfirmNode: (nodeId: string) => void;
  collectionKind?: 'simulated' | 'reviewed';
  collectionId?: string;
};

export function CameraScreen({ nodes, onConfirmNode, collectionKind, collectionId }: Props): ReactElement {
  const { t, locale, collectionId: ctxCollectionId } = useLocale();
  const effectiveCollectionId = collectionId ?? ctxCollectionId;
  const isReviewed = collectionKind === 'reviewed';
  const isThreeLenses = effectiveCollectionId === 'old-quarter-three-lenses' && isReviewed;
  const { foreground } = useMotionState();
  const isFocused = useIsFocused() && foreground;
  const cameraRequest = useRef(0);
  const scanAccepted = useRef(false);
  const [, requestPermission] = useCameraPermissions();
  const [cameraOn, setCameraOn] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanNote, setScanNote] = useState<string | undefined>();
  const [pending, setPending] = useState<DemoNode | undefined>();
  const [active, setActive] = useState<DemoNode | undefined>();
  useEffect(() => {
    if (!isFocused) {
      cameraRequest.current += 1;
      setCameraOn(false);
      setScanning(false);
      setPending(undefined);
      setActive(undefined);
      scanAccepted.current = true;
    }
    return () => { cameraRequest.current += 1; scanAccepted.current = true; };
  }, [isFocused]);

  async function enableCamera(): Promise<void> {
    const request = ++cameraRequest.current;
    setScanNote(undefined);
    const result = await requestPermission();
    if (request !== cameraRequest.current) return;
    if (result.granted) {
      scanAccepted.current = false;
      setCameraOn(true);
      setScanning(true);
      return;
    }
    setCameraOn(false);
    setScanNote(
      result.canAskAgain
        ? t('camera.permission_denied')
        : t('camera.permission_blocked'),
    );
  }

  function turnCameraOff(): void {
    cameraRequest.current += 1;
    scanAccepted.current = true;
    setCameraOn(false);
    setScanning(false);
    setPending(undefined);
  }

  function onBarcodeScanned(result: BarcodeScanningResult): void {
    if (!isFocused || !cameraOn || !scanning || scanAccepted.current) return;
    scanAccepted.current = true;
    const confirmation = confirmByQr(nodes, result.data);
    setScanning(false);
    if (confirmation.ok) {
      setScanNote(undefined);
      setPending(confirmation.node);
      return;
    }
    setPending(undefined);
    setScanNote(t('camera.unrecognized_qr'));
  }

  function scanAgain(): void {
    scanAccepted.current = false;
    setPending(undefined);
    setScanNote(undefined);
    setScanning(true);
  }

  function confirmPending(): void {
    if (pending === undefined) {
      return;
    }
    onConfirmNode(pending.id);
    setActive(pending);
    setPending(undefined);
  }

  function chooseManually(id: string): void {
    const node = selectManually(nodes, id);
    if (node === undefined) {
      return;
    }
    scanAccepted.current = true;
    setScanning(false);
    setPending(undefined);
    onConfirmNode(node.id);
    setScanNote(undefined);
    setActive(node);
  }

  function reset(): void {
    scanAccepted.current = false;
    setActive(undefined);
    setPending(undefined);
    setScanNote(undefined);
    setScanning(cameraOn);
  }

  const { translateYPct, beamOpacity: laserBeamOpacity } = useLaserScanner(2000, cameraOn && scanning && !pending);
  const laserTranslateY = translateYPct.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 196],
  });
  const { scaleAnim: reticlePulseScale } = usePulseLoop({
    minScale: 0.985,
    maxScale: 1.025,
    duration: 1800,
    active: cameraOn && scanning && !pending,
  });

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerBox}>
          <Text style={styles.phase}>{t('camera.phase')}</Text>
          <Text accessibilityRole="header" style={styles.mainTitle}>
            {t('camera.main_title')}
          </Text>
          <Text style={styles.subtitle}>
            {t('camera.subtitle')}
          </Text>
        </View>

        {/* Trạng thái Camera */}
        <View style={styles.card} accessibilityLiveRegion="polite">
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {cameraOn ? t('camera.camera_on') : t('camera.camera_off')}
          </Text>
          <Text style={styles.body}>
            {cameraOn
              ? t('camera.camera_on_hint')
              : t('camera.camera_off_hint')}
          </Text>
          {cameraOn ? (
            <Pressable
              accessibilityRole="button"
              onPress={turnCameraOff}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryText}>{t('camera.turn_off_button')}</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('camera.enable_button')}
              onPress={() => void enableCamera()}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryText}>
                {t('camera.enable_button')}
              </Text>
            </Pressable>
          )}
          {scanNote !== undefined && <Text style={styles.hint}>{scanNote}</Text>}
        </View>

        {/* Preview khung ngắm camera */}
        {cameraOn && isFocused && (
          <View style={styles.previewWrap}>
            <CameraView
              style={styles.preview}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={scanning ? onBarcodeScanned : undefined}
            />

            {/* Khung ngắm quét mã QR với vệt laser tuần hoàn */}
            {scanning && active === undefined && (
              <View style={styles.viewfinderOverlay} pointerEvents="none">
                <Animated.View
                  style={[
                    styles.viewfinderReticle,
                    { transform: [{ scale: reticlePulseScale }] },
                  ]}
                >
                  {/* 4 góc định vị reticle */}
                  <View style={[styles.reticleCorner, styles.cornerTL]} />
                  <View style={[styles.reticleCorner, styles.cornerTR]} />
                  <View style={[styles.reticleCorner, styles.cornerBL]} />
                  <View style={[styles.reticleCorner, styles.cornerBR]} />

                  {/* Vệt laser quét di động */}
                  <Animated.View
                    style={[
                      styles.laserBeam,
                      {
                        transform: [{ translateY: laserTranslateY }],
                        opacity: laserBeamOpacity,
                      },
                    ]}
                  />
                </Animated.View>
                <Text style={styles.viewfinderInstruction}>
                  {t('camera.viewfinder_instruction')}
                </Text>
              </View>
            )}

            {active !== undefined && (
              <View style={styles.overlay} pointerEvents="none">
                <View style={styles.narrator} accessibilityLabel={t('common.narrator_label')}>
                  <Text style={styles.narratorInitial}>Kể</Text>
                </View>
                <Text style={styles.caption}>{active.caption}</Text>
              </View>
            )}
          </View>
        )}

        {/* Thông báo tìm thấy mã */}
        {pending !== undefined && (
          <View style={styles.card} accessibilityLiveRegion="polite">
            <View style={styles.pendingTag}>
              <Text style={styles.pendingTagText}>{t('camera.identified_qr')}</Text>
            </View>
            <Text accessibilityRole="header" style={styles.pointName}>
              {pending.name}
            </Text>
            <Text style={styles.body}>
              {t('camera.pending_body')}
            </Text>
            <View style={styles.buttonRow}>
              <Pressable
                accessibilityRole="button"
                onPress={confirmPending}
                style={({ pressed }) => [styles.primaryButton, styles.flex1, pressed && styles.pressed]}
              >
                <Text style={styles.primaryText}>{t('camera.confirm_point')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={scanAgain}
                style={({ pressed }) => [styles.secondaryButton, styles.flex1, pressed && styles.pressed]}
              >
                <Text style={styles.secondaryText}>{t('camera.scan_again')}</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Điểm đang kích hoạt */}
        {active !== undefined ? (
          <View style={styles.activeCard}>
            {/* Ảnh điểm ngõ đã kích hoạt */}
            <View style={[styles.activeImageWrapper, isThreeLenses && { backgroundColor: '#1E1E1E' }]}>
              <Image
                source={getNodePhoto(active.id, undefined, isThreeLenses ? 'old-quarter-three-lenses' : undefined)}
                style={styles.activeImage}
                resizeMode={isThreeLenses ? 'contain' : 'cover'}
              />
              <View style={styles.disclaimerBadge}>
                <Text style={styles.disclaimerText}>
                  {isThreeLenses
                    ? (locale === 'en' ? 'Supplied photo (Sourced · not officially approved) · unverified rights' : 'Ảnh người dùng cung cấp (Có nguồn · chưa duyệt chính thức) · chưa kiểm chứng bản quyền')
                    : t(isReviewed ? 'common.photo_disclaimer_reviewed' : 'common.photo_disclaimer')}
                </Text>
              </View>
              <View style={styles.creditBadge}>
                <Text style={styles.creditText}>{t('common.photo_author', { author: getNodePhotographer(active.id, undefined, isThreeLenses ? 'old-quarter-three-lenses' : undefined, locale) })}</Text>
              </View>
            </View>

            <View style={styles.activeContent}>
              <View style={styles.activeTagRow}>
                <Text style={styles.phase}>{active.id} · {locale === 'en' ? 'CONFIRMED STOP' : 'ĐIỂM ĐÃ XÁC NHẬN'}</Text>
              </View>
              <Text accessibilityRole="header" style={styles.activeTitle}>
                {active.name}
              </Text>
              <Text style={styles.story}>{active.story}</Text>
              {!cameraOn && (
                <Text style={styles.bodyMuted}>
                  {locale === 'en'
                    ? 'Viewing in passport reading mode. Enable camera above to experience the storyteller in physical space.'
                    : 'Bạn đang xem chế độ sổ tay đọc chữ. Bật camera ở trên nếu muốn trải nghiệm người kể trên nền không gian thực.'}
                </Text>
              )}
              <Pressable
                accessibilityRole="button"
                onPress={reset}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.secondaryText}>{t('camera.choose_another_stop')}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              {t('camera.manual_selection')}
            </Text>
            <Text style={styles.body}>
              {t('camera.manual_hint')}
            </Text>

            <View style={styles.manualList}>
              {nodes.map((node) => (
                <Pressable
                  key={node.id}
                  accessibilityRole="button"
                  accessibilityLabel={t('camera.choose_manual', { name: node.name })}
                  disabled={!node.available}
                  onPress={() => chooseManually(node.id)}
                  style={({ pressed }) => [styles.pointRow, pressed && styles.pressed]}
                >
                  <Image
                    source={getNodePhoto(node.id, undefined, isThreeLenses ? 'old-quarter-three-lenses' : undefined)}
                    style={[styles.thumbnail, isThreeLenses && { backgroundColor: '#1E1E1E' }]}
                    resizeMode={isThreeLenses ? 'contain' : 'cover'}
                  />
                  <View style={styles.pointInfo}>
                    <Text style={styles.pointName}>{node.name}</Text>
                    <Text style={styles.pointMeta}>
                      {t(isReviewed ? 'location.suggested_visit_minutes' : 'common.simulated_minutes', {
                        minutes: node.visitMinutes,
                      })}{' '}
                      · {getNodePhotographer(node.id, undefined, isThreeLenses ? 'old-quarter-three-lenses' : undefined, locale)}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>{node.available ? '→' : (locale === 'en' ? 'Locked' : 'Chưa mở')}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={styles.disclaimerBox}>
          <Text style={styles.note}>
            {isThreeLenses
              ? (locale === 'en'
                  ? 'DEMO · Sourced reference only (SOURCED_ONLY) · Not officially approved by site managers · Supplied photos have unverified rights'
                  : 'DEMO · Có nguồn tham khảo (SOURCED_ONLY) · Chưa được đơn vị di tích duyệt chính thức · Ảnh người dùng chưa kiểm chứng bản quyền')
              : (isReviewed ? t('camera.disclaimer_reviewed') : t('camera.disclaimer_simulated'))}
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
  bodyMuted: {
    ...typography.bodySmall,
    color: colors.muted,
    fontStyle: 'italic',
  },
  story: {
    ...typography.bodyLarge,
    lineHeight: 26,
    color: colors.text,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.terracotta,
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
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  previewWrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  preview: {
    height: 320,
    backgroundColor: colors.border,
  },
  overlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    gap: 8,
    alignItems: 'center',
  },
  narrator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 253, 247, 0.95)',
    borderWidth: 2,
    borderColor: colors.accent,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  narratorInitial: {
    ...typography.titleMedium,
    fontWeight: '700',
    color: colors.accent,
  },
  caption: {
    padding: spacing.md,
    borderRadius: radius.md,
    ...typography.bodyMedium,
    color: colors.text,
    backgroundColor: 'rgba(255, 253, 247, 0.95)',
    textAlign: 'center',
  },
  pendingTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.terracotta,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  pendingTagText: {
    ...typography.micro,
    color: colors.surface,
    fontWeight: '700',
  },
  activeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.accent,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  activeImageWrapper: {
    width: '100%',
    height: 200,
    position: 'relative',
    backgroundColor: colors.border,
  },
  activeImage: {
    width: '100%',
    height: '100%',
  },
  disclaimerBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(46, 48, 40, 0.75)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  disclaimerText: {
    ...typography.micro,
    color: colors.surface,
  },
  creditBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(46, 48, 40, 0.65)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  creditText: {
    ...typography.micro,
    color: colors.surface,
    fontStyle: 'italic',
  },
  activeContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  activeTagRow: {
    flexDirection: 'row',
  },
  activeTitle: {
    ...typography.titleLarge,
    color: colors.text,
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
  chevron: {
    ...typography.titleSmall,
    color: colors.accent,
    paddingRight: spacing.xs,
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
  viewfinderOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
  viewfinderReticle: {
    width: 210,
    height: 210,
    position: 'relative',
    overflow: 'hidden',
  },
  reticleCorner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#E5A842',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 10,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 10,
  },
  laserBeam: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 2.5,
    backgroundColor: '#FFE29A',
    shadowColor: '#E5A842',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  viewfinderInstruction: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFDF7',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  pressed: {
    opacity: 0.72,
  },
});
