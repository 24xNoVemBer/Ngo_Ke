import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useState, type ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { DemoNode } from '../data/sourceState';
import { confirmByQr, selectManually } from '../qr/confirmPoint';
import { colors } from '../theme';

type Props = { nodes: DemoNode[]; onConfirmNode: (nodeId: string) => void };

export function CameraScreen({ nodes, onConfirmNode }: Props): ReactElement {
  const [permission, requestPermission] = useCameraPermissions();
  // The camera stays off until the user asks for it; opening the screen is not
  // consent to use the camera.
  const [cameraOn, setCameraOn] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanNote, setScanNote] = useState<string | undefined>();
  const [pending, setPending] = useState<DemoNode | undefined>();
  const [active, setActive] = useState<DemoNode | undefined>();

  async function enableCamera(): Promise<void> {
    setScanNote(undefined);
    const result = await requestPermission();
    if (result.granted) {
      setCameraOn(true);
      setScanning(true);
      return;
    }
    setCameraOn(false);
    setScanNote(
      result.canAskAgain
        ? 'Chưa được cấp quyền camera. Bạn vẫn có thể chọn điểm bằng tay bên dưới.'
        : 'Quyền camera đã bị từ chối trong cài đặt hệ thống. Hãy chọn điểm bằng tay bên dưới.',
    );
  }

  function turnCameraOff(): void {
    setCameraOn(false);
    setScanning(false);
    setPending(undefined);
  }

  function onBarcodeScanned(result: BarcodeScanningResult): void {
    const confirmation = confirmByQr(nodes, result.data);
    setScanning(false);
    if (confirmation.ok) {
      setScanNote(undefined);
      setPending(confirmation.node);
      return;
    }
    setPending(undefined);
    setScanNote('Không nhận mã này. Bạn có thể quét lại hoặc chọn điểm bằng tay.');
  }

  function scanAgain(): void {
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
    onConfirmNode(node.id);
    setScanNote(undefined);
    setActive(node);
  }

  function reset(): void {
    setActive(undefined);
    setPending(undefined);
    setScanNote(undefined);
    setScanning(cameraOn);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.phase}>Phase 4 · Camera, QR và người kể</Text>

        <View style={styles.card} accessibilityLiveRegion="polite">
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {cameraOn ? 'Đang mở camera' : 'Camera chưa bật'}
          </Text>
          <Text style={styles.body}>
            {cameraOn
              ? 'Đưa mã QR của điểm vào khung giữa để xác nhận điểm đó.'
              : 'App chỉ bật camera khi bạn bấm nút bên dưới, và xin quyền đúng lúc đó.'}
          </Text>
          {cameraOn ? (
            <Pressable
              accessibilityRole="button"
              onPress={turnCameraOff}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryText}>Tắt camera</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Bật camera và quét QR"
              onPress={() => void enableCamera()}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryText}>
                {permission?.granted ? 'Bật camera và quét QR' : 'Xin quyền và bật camera'}
              </Text>
            </Pressable>
          )}
          {scanNote !== undefined && <Text style={styles.hint}>{scanNote}</Text>}
        </View>

        {cameraOn && (
          <View style={styles.previewWrap}>
            <CameraView
              style={styles.preview}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={scanning ? onBarcodeScanned : undefined}
            />
            {active !== undefined && (
              <View style={styles.overlay} pointerEvents="none">
                <View style={styles.narrator} accessibilityLabel="Người kể 2D tạm">
                  <Text style={styles.narratorInitial}>Kể</Text>
                </View>
                <Text style={styles.caption}>{active.caption}</Text>
              </View>
            )}
          </View>
        )}

        {pending !== undefined && (
          <View style={styles.card} accessibilityLiveRegion="polite">
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Thấy mã của điểm này
            </Text>
            <Text style={styles.pointName}>{pending.name}</Text>
            <Text style={styles.body}>
              Mã QR chỉ xác nhận điểm, app không tự đổi điểm. Bạn xác nhận thì mới mở người kể.
            </Text>
            <View style={styles.row}>
              <Pressable
                accessibilityRole="button"
                onPress={confirmPending}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.primaryText}>Xác nhận điểm này</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={scanAgain}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.secondaryText}>Quét lại</Text>
              </Pressable>
            </View>
          </View>
        )}

        {active !== undefined ? (
          <View style={styles.card}>
            <Text style={styles.phase}>{active.id} · mô phỏng</Text>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              {active.name}
            </Text>
            <Text style={styles.story}>{active.story}</Text>
            {!cameraOn && (
              <Text style={styles.body}>
                Bạn đang đọc bằng chữ. Bật camera ở trên nếu muốn xem người kể trên nền camera.
              </Text>
            )}
            <Pressable
              accessibilityRole="button"
              onPress={reset}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryText}>Chọn điểm khác</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Chọn điểm bằng tay
            </Text>
            <Text style={styles.body}>
              Luôn dùng được, kể cả khi từ chối quyền camera hoặc gặp mã lạ.
            </Text>
            {nodes.map((node) => (
              <Pressable
                key={node.id}
                accessibilityRole="button"
                accessibilityLabel={`Chọn điểm ${node.name} bằng tay`}
                onPress={() => chooseManually(node.id)}
                style={({ pressed }) => [styles.pointButton, pressed && styles.pressed]}
              >
                <Text style={styles.pointName}>{node.name}</Text>
                <Text style={styles.pointMeta}>{node.id} · mô phỏng</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={styles.note}>
          Lời kể và caption trong bản demo là nội dung mô phỏng. Người kể 2D mới là hình tạm,
          chưa có giọng đọc; audio thuộc phase Voice riêng.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, gap: 16, maxWidth: 640, width: '100%', alignSelf: 'center' },
  phase: { fontSize: 14, color: colors.accent, fontWeight: '600' },
  card: { padding: 20, borderRadius: 12, gap: 12, backgroundColor: colors.surface },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: colors.text },
  body: { fontSize: 16, lineHeight: 24, color: colors.muted },
  story: { fontSize: 16, lineHeight: 26, color: colors.text },
  hint: { fontSize: 14, lineHeight: 20, color: colors.error },
  primaryButton: {
    minHeight: 52, paddingHorizontal: 18, borderRadius: 12, marginTop: 4,
    backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center',
  },
  primaryText: { fontSize: 16, fontWeight: '600', color: colors.surface },
  secondaryButton: {
    minHeight: 48, paddingVertical: 12, justifyContent: 'center', alignItems: 'center',
  },
  secondaryText: { fontSize: 16, fontWeight: '600', color: colors.accent },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' },
  previewWrap: { borderRadius: 12, overflow: 'hidden' },
  preview: { height: 320, backgroundColor: colors.border },
  overlay: { position: 'absolute', left: 16, right: 16, bottom: 16, gap: 8, alignItems: 'center' },
  narrator: {
    width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.accentSoft, borderWidth: 2, borderColor: colors.accent,
  },
  narratorInitial: { fontSize: 22, fontWeight: '700', color: colors.accent },
  caption: {
    padding: 12, borderRadius: 12, fontSize: 16, lineHeight: 22, color: colors.text,
    backgroundColor: colors.surface, textAlign: 'center',
  },
  pointButton: {
    minHeight: 64, paddingVertical: 12, gap: 4, justifyContent: 'center',
    borderBottomWidth: 1, borderColor: colors.border,
  },
  pointName: { fontSize: 17, fontWeight: '600', color: colors.text },
  pointMeta: { fontSize: 14, color: colors.muted },
  pressed: { opacity: 0.72 },
  note: { marginTop: 8, fontSize: 14, lineHeight: 22, color: colors.muted },
});