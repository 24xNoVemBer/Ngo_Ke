import { useState, type ReactElement } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { DemoDataset } from '../data/sourceState';
import { findAnswer, type QaEntry, type QaMatch } from '../qa/match';
import { colors } from '../theme';

const CHIP_COUNT = 4;

type Props = {
  dataset: DemoDataset;
};

function followUpEntries(entry: QaEntry, all: readonly QaEntry[]): QaEntry[] {
  return entry.followUps
    .map((id) => all.find((item) => item.id === id))
    .filter((item): item is QaEntry => item !== undefined);
}

export function QaScreen({ dataset }: Props): ReactElement {
  const [input, setInput] = useState('');
  const [asked, setAsked] = useState<string | null>(null);
  const [match, setMatch] = useState<QaMatch | null>(null);

  function ask(question: string): void {
    const trimmed = question.trim();
    if (trimmed.length === 0) {
      return;
    }
    setAsked(trimmed);
    setMatch(findAnswer(dataset.qa, trimmed));
    setInput('');
  }

  const intro = dataset.intro;
  const startNode = dataset.nodes.find((node) => node.id === dataset.startNodeId);
  const entry = match?.status === 'matched' ? match.entry : null;
  const followUps = entry === null ? [] : followUpEntries(entry, dataset.qa);

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.phase}>Phase 2 · Giới thiệu và hỏi đáp</Text>

          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.cardTitle}>
              Người kể
            </Text>
            <Text style={styles.body}>{intro.text}</Text>
            {startNode !== undefined && (
              <Text style={styles.meta}>Bắt đầu tại: {startNode.name}</Text>
            )}
            <Text style={styles.source}>Nguồn: {intro.evidence.join(' · ')}</Text>
          </View>

          {entry === null && (
            <View style={styles.section}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>
                Câu hỏi mẫu
              </Text>
              <Text style={styles.body}>
                Chọn một câu, hoặc tự gõ câu hỏi của bạn.
              </Text>
              <View style={styles.chips}>
                {dataset.qa.slice(0, CHIP_COUNT).map((item) => (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    onPress={() => ask(item.question)}
                    style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
                  >
                    <Text style={styles.chipText}>{item.question}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => ask(input)}
              placeholder="Nhập câu hỏi của bạn"
              placeholderTextColor={colors.muted}
              returnKeyType="send"
              accessibilityLabel="Ô nhập câu hỏi"
              style={styles.input}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Gửi câu hỏi"
              onPress={() => ask(input)}
              style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]}
            >
              <Text style={styles.sendText}>Hỏi</Text>
            </Pressable>
          </View>

          {match !== null && (
            <View style={styles.card} accessibilityLiveRegion="polite">
              {entry === null ? (
                <>
                  <Text style={styles.answerLabel}>Bạn hỏi: {asked}</Text>
                  <Text style={styles.noDataTitle}>Chưa có dữ liệu</Text>
                  <Text style={styles.body}>
                    Chưa có dữ liệu cho câu hỏi này trong bộ câu hỏi demo. Bạn có thể chọn
                    câu hỏi mẫu bên trên.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.answerLabel}>Bạn hỏi: {asked}</Text>
                  <Text style={styles.answer}>{entry.answer}</Text>
                  <Text style={styles.source}>Nguồn: {entry.evidence.join(' · ')}</Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setMatch(null);
                      setAsked(null);
                    }}
                    style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.backText}>Xem câu hỏi khác</Text>
                  </Pressable>
                </>
              )}
            </View>
          )}

          {entry !== null && followUps.length > 0 && (
            <View style={styles.section}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>
                Bạn có thể hỏi tiếp
              </Text>
              <View style={styles.chips}>
                {followUps.map((item) => (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    onPress={() => ask(item.question)}
                    style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
                  >
                    <Text style={styles.chipText}>{item.question}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <Text style={styles.note}>
            Nội dung trong màn này là dữ liệu mô phỏng để review luồng, chưa phải nội
            dung thật của con ngõ. App chỉ trả lời theo danh sách đã soạn.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: 24, gap: 16, maxWidth: 640, width: '100%', alignSelf: 'center' },
  phase: { fontSize: 14, color: colors.accent, fontWeight: '600' },
  card: { padding: 20, borderRadius: 12, gap: 12, backgroundColor: colors.surface },
  cardTitle: { fontSize: 20, fontWeight: '600', color: colors.text },
  body: { fontSize: 16, lineHeight: 24, color: colors.muted },
  meta: { fontSize: 15, fontWeight: '600', color: colors.accent },
  source: { fontSize: 13, lineHeight: 18, color: colors.muted },
  section: { gap: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: colors.text },
  chips: { gap: 8 },
  chip: {
    minHeight: 52, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  chipText: { fontSize: 16, color: colors.text },
  inputRow: { flexDirection: 'row', gap: 8, alignItems: 'stretch' },
  input: {
    flex: 1, minHeight: 52, paddingHorizontal: 16, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
    fontSize: 16, color: colors.text,
  },
  sendButton: {
    minHeight: 52, paddingHorizontal: 20, borderRadius: 12,
    backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center',
  },
  sendText: { fontSize: 16, fontWeight: '600', color: colors.surface },
  answerLabel: { fontSize: 15, fontWeight: '600', color: colors.accent },
  noDataTitle: { fontSize: 20, fontWeight: '600', color: colors.error },
  answer: { fontSize: 17, lineHeight: 26, color: colors.text },
  backButton: { minHeight: 48, paddingVertical: 12, justifyContent: 'center' },
  backText: { fontSize: 16, fontWeight: '600', color: colors.accent },
  pressed: { opacity: 0.72 },
  note: { marginTop: 8, fontSize: 14, lineHeight: 22, color: colors.muted },
});