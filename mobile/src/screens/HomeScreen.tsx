import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Mode, SourceState } from '../data/sourceState';
import { areas, type Area, type RootStackParamList } from '../navigation';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'> & {
  mode: Mode;
  source: SourceState;
  onModeChange: (mode: Mode) => void;
};

const areaOrder: Area[] = ['qa', 'recommendations', 'camera', 'location'];

export function HomeScreen({ mode, source, onModeChange, navigation }: Props): ReactElement {
  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.phase}>Phase 1–2 · Khung app và hỏi đáp</Text>
        <Text accessibilityRole="header" style={styles.title}>Ngõ Kể</Text>
        <Text style={styles.body}>
          Khung trải nghiệm khám phá con ngõ. Chọn chế độ, xem cấu trúc màn hình và thử phần hỏi đáp.
        </Text>

        <Text style={styles.label}>Nguồn dữ liệu</Text>
        <View style={styles.modeGroup}>
          {(['demo', 'live'] as const).map((value) => (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityLabel={value === 'demo' ? 'Chế độ demo' : 'Chế độ live'}
              accessibilityState={{ checked: mode === value }}
              onPress={() => onModeChange(value)}
              style={({ pressed }) => [
                styles.modeButton,
                mode === value && styles.selected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.modeText, mode === value && styles.selectedText]}>
                {value === 'demo' ? 'Demo' : 'Live'}{mode === value ? ' · đang chọn' : ''}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.source} accessibilityLiveRegion="polite">
          <Text style={styles.sourceMeta}>
            {source.mode === 'live' ? 'LIVE · trống' : source.status === 'ready' ? 'DEMO · fixture mô phỏng' : 'DEMO · lỗi fixture'}
          </Text>
          <Text style={[styles.sourceTitle, source.status === 'error' && styles.errorText]}>
            {source.title}
          </Text>
          <Text style={styles.body}>{source.detail}</Text>
        </View>

        {source.status === 'ready' && (
          <View style={styles.demoList}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>Điểm demo · {source.dataset.nodes.length} điểm</Text>
            <Text style={styles.body}>{source.dataset.disclaimer}</Text>
            {source.dataset.nodes.map((node) => (
              <View key={node.id} style={styles.demoRow}>
                <Text style={styles.areaTitle}>{node.name}</Text>
                <Text style={styles.areaPhase}>
                  {node.id} · mô phỏng{node.id === source.dataset.startNodeId ? ' · điểm khởi đầu' : ''}
                </Text>
              </View>
            ))}
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('Qa')}
              style={({ pressed }) => [styles.qaButton, pressed && styles.pressed]}
            >
              <Text style={styles.qaButtonText}>Bắt đầu nghe giới thiệu và hỏi đáp</Text>
            </Pressable>
            <Text style={styles.note}>Danh sách để review Home. Chưa có câu chuyện, hỏi đáp hoặc hành vi xác nhận điểm ngoài màn Q&A Phase 2.</Text>
          </View>
        )}

        <Text accessibilityRole="header" style={styles.sectionTitle}>Cấu trúc màn hình</Text>
        <Text style={styles.body}>Các màn dưới đây chỉ là placeholder, chưa có tính năng.</Text>
        <View style={styles.areaList}>
          {areaOrder
            .filter((area) => area !== 'qa')
            .map((area) => (
              <Pressable
                key={area}
                accessibilityRole="button"
                accessibilityLabel={`Xem placeholder ${areas[area].title}, Phase ${areas[area].phase}`}
                onPress={() => navigation.navigate('Placeholder', { area })}
                style={({ pressed }) => [styles.areaButton, pressed && styles.pressed]}
              >
                <Text style={styles.areaTitle}>{areas[area].title}</Text>
                <Text style={styles.areaPhase}>Phase {areas[area].phase} · chưa triển khai</Text>
              </Pressable>
            ))}
        </View>
        <Text style={styles.note}>
          Đây là bản demo chức năng. Hỏi đáp dùng bộ câu trả lời mô phỏng; gợi ý điểm, camera và GPS sẽ làm ở các phase sau khi được duyệt.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, gap: 16, maxWidth: 640, width: '100%', alignSelf: 'center' },
  phase: { fontSize: 14, color: colors.accent, fontWeight: '600' },
  title: { fontSize: 36, fontWeight: '700', color: colors.text },
  body: { fontSize: 16, lineHeight: 24, color: colors.muted },
  label: { marginTop: 8, fontSize: 16, color: colors.text, fontWeight: '600' },
  modeGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modeButton: {
    flexGrow: 1, flexBasis: 140, minHeight: 52, padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  selected: { backgroundColor: colors.accent, borderColor: colors.accent },
  modeText: { fontSize: 16, fontWeight: '600', color: colors.text },
  selectedText: { color: colors.surface },
  pressed: { opacity: 0.72 },
  source: { padding: 20, borderRadius: 12, gap: 12, backgroundColor: colors.surface },
  sourceMeta: { fontSize: 13, fontWeight: '600', color: colors.muted },
  sourceTitle: { fontSize: 20, fontWeight: '600', color: colors.text },
  demoList: { gap: 12 },
  demoRow: { paddingVertical: 12, gap: 6, borderBottomWidth: 1, borderColor: colors.border },
  qaButton: {
    minHeight: 56, padding: 16, borderRadius: 12, marginTop: 8,
    backgroundColor: colors.accent, justifyContent: 'center',
  },
  qaButtonText: { fontSize: 17, fontWeight: '600', color: colors.surface },
  errorText: { color: colors.error },
  sectionTitle: { marginTop: 16, fontSize: 22, fontWeight: '600', color: colors.text },
  areaList: { borderTopWidth: 1, borderColor: colors.border },
  areaButton: { minHeight: 72, paddingVertical: 16, gap: 6, borderBottomWidth: 1, borderColor: colors.border },
  areaTitle: { fontSize: 17, fontWeight: '600', color: colors.text },
  areaPhase: { fontSize: 14, color: colors.muted },
  note: { marginTop: 8, fontSize: 14, lineHeight: 22, color: colors.muted },
});
