import * as Location from 'expo-location';
import { useState, type ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { DemoNode } from '../data/sourceState';
import { pickCandidate, type Candidate } from '../location/nearest';
import { colors } from '../theme';

const LIMITS = { maxAccuracyMeters: 50, maxDistanceMeters: 300 };

type Props = {
  nodes: DemoNode[];
  currentNodeId: string;
  onConfirmNode: (nodeId: string) => void;
};

const meters = (value: number): string =>
  value >= 1000 ? `${(value / 1000).toFixed(1)} km` : `${Math.round(value)} m`;

function explain(result: Candidate): string {
  switch (result.kind) {
    case 'poor-accuracy':
      return `Tín hiệu GPS yếu (chính xác khoảng ${meters(result.accuracy)}), nên mình không đoán điểm nào. Hãy thử lại ở nơi trống trời hoặc chọn điểm bằng tay.`;
    case 'outside-cluster':
      return `Bạn đang cách điểm gần nhất khoảng ${meters(result.distanceMeters)}, vượt khỏi khu vực demo. Hãy chọn điểm bằng tay.`;
    case 'no-coordinates':
      return 'Chưa có tọa độ khảo sát cho các điểm này. Hãy chọn điểm bằng tay.';
    case 'needs-position':
      return 'Chưa lấy được vị trí. Hãy bấm lại hoặc chọn điểm bằng tay.';
    case 'candidate':
      return '';
  }
}

export function LocationScreen({ nodes, currentNodeId, onConfirmNode }: Props): ReactElement {
  const [result, setResult] = useState<Candidate | undefined>();
  const [busy, setBusy] = useState(false);
  const current = nodes.find((node) => node.id === currentNodeId);

  // One reading, only after a tap; nothing runs in the background.
  async function readPosition(): Promise<void> {
    setBusy(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setResult({ kind: 'needs-position' });
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
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
      // A failed read is reported like a refusal: no point is guessed.
      setResult({ kind: 'needs-position' });
    } finally {
      setBusy(false);
    }
  }

  function confirm(node: DemoNode): void {
    onConfirmNode(node.id);
    setResult(undefined);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.phase}>Phase 5 · GPS và xác nhận điểm</Text>

        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Điểm hiện tại
          </Text>
          <Text style={styles.pointName}>{current?.name ?? currentNodeId}</Text>
          <Text style={styles.body}>
            GPS chỉ gợi ý một điểm, không tự đổi điểm của bạn. Chỉ khi bạn bấm xác nhận thì
            điểm hiện tại mới đổi.
          </Text>
        </View>

        <View style={styles.card} accessibilityLiveRegion="polite">
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Tìm điểm gần nhất
          </Text>
          <Text style={styles.body}>
            App chỉ lấy vị trí một lần khi bạn bấm nút, không theo dõi nền.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Lấy vị trí của tôi"
            onPress={() => void readPosition()}
            disabled={busy}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryText}>{busy ? 'Đang lấy vị trí…' : 'Lấy vị trí của tôi'}</Text>
          </Pressable>

          {result?.kind === 'candidate' && (
            <View style={styles.candidate}>
              <Text style={styles.candidateLabel}>Có thể là…</Text>
              <Text style={styles.pointName}>{result.node.name}</Text>
              <Text style={styles.body}>
                Cách khoảng {meters(result.distanceMeters)} · GPS chính xác khoảng{' '}
                {meters(result.accuracy)}
              </Text>
              <Text style={styles.body}>
                Đây chỉ là gợi ý. Điểm hiện tại vẫn là {current?.name ?? currentNodeId}.
              </Text>
              <View style={styles.row}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => confirm(result.node)}
                  style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                >
                  <Text style={styles.primaryText}>Xác nhận điểm này</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setResult(undefined)}
                  style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                >
                  <Text style={styles.secondaryText}>Bỏ qua, chọn tay</Text>
                </Pressable>
              </View>
            </View>
          )}

          {result !== undefined && result.kind !== 'candidate' && (
            <Text style={styles.hint}>{explain(result)}</Text>
          )}
        </View>

        {result?.kind === 'candidate' && (
          <View style={styles.card}>
            <Text style={styles.body}>
              Ở điểm mới, hãy quét QR trước; chọn tay trong demo chỉ là mô phỏng.
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Chọn điểm bằng tay
          </Text>
          <Text style={styles.body}>
            Luôn dùng được, kể cả khi từ chối quyền, GPS yếu hoặc đứng ngoài khu vực demo.
          </Text>
          {nodes.map((node) => (
            <Pressable
              key={node.id}
              accessibilityRole="button"
              accessibilityLabel={`Chọn điểm ${node.name} bằng tay, mô phỏng`}
              onPress={() => confirm(node)}
              style={({ pressed }) => [styles.pointButton, pressed && styles.pressed]}
            >
              <Text style={styles.pointName}>{node.name}</Text>
              <Text style={styles.pointMeta}>
                {node.id} · mô phỏng{node.id === currentNodeId ? ' · đang là điểm hiện tại' : ''}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.note}>
          Tọa độ trong bản demo là mô phỏng, không dùng để đi bộ ngoài thực địa. App không
          chỉ đường và không theo dõi vị trí nền.
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
  hint: { fontSize: 16, lineHeight: 24, color: colors.error },
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
  candidate: { gap: 8, padding: 16, borderRadius: 12, backgroundColor: colors.accentSoft },
  candidateLabel: { fontSize: 14, fontWeight: '600', color: colors.accent },
  pointButton: {
    minHeight: 64, paddingVertical: 12, gap: 4, justifyContent: 'center',
    borderBottomWidth: 1, borderColor: colors.border,
  },
  pointName: { fontSize: 17, fontWeight: '600', color: colors.text },
  pointMeta: { fontSize: 14, color: colors.muted },
  pressed: { opacity: 0.72 },
  note: { marginTop: 8, fontSize: 14, lineHeight: 22, color: colors.muted },
});