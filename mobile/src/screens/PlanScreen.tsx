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
import type { DemoNode } from '../data/sourceState';
import {
  pickPoints,
  parseTimeBudget,
  parseTopic,
  TOPIC_LABELS,
} from '../recommendation/pick';
import type { Topic } from '../data/sourceState';
import { colors } from '../theme';

const TOPIC_CHOICES: { topic: Topic; label: string }[] = [
  { topic: 'an thuc', label: 'Ăn thực' },
  { topic: 'chuyen xua', label: 'Chuyện xưa' },
  { topic: 'kham pha tu do', label: 'Khám phá tự do' },
];

const TIME_CHOICES = [15, 30, 45, 60];

type Props = { nodes: DemoNode[] };

export function PlanScreen({ nodes }: Props): ReactElement {
  const [topicInput, setTopicInput] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [topic, setTopic] = useState<Topic | undefined>();
  const [budgetMinutes, setBudgetMinutes] = useState<number | undefined>();
  const [showResult, setShowResult] = useState(false);

  function chooseTopic(value: Topic): void {
    setTopic(value);
    setTopicInput('');
    setShowResult(true);
  }

  function applyTopicText(): void {
    const parsed = parseTopic(topicInput);
    if (parsed !== undefined) {
      setTopic(parsed);
      setTopicInput('');
      setShowResult(true);
    }
  }

  function chooseTime(minutes: number): void {
    setBudgetMinutes(minutes);
    setTimeInput('');
    setShowResult(true);
  }

  function applyTimeText(): void {
    const parsed = parseTimeBudget(timeInput);
    if (parsed !== undefined) {
      setBudgetMinutes(parsed);
      setTimeInput('');
      setShowResult(true);
    }
  }

  const result = pickPoints(nodes, { topic, budgetMinutes });
  const typedTopicUnknown = topicInput.trim().length > 0 && parseTopic(topicInput) === undefined;
  const typedTimeUnknown = timeInput.trim().length > 0 && parseTimeBudget(timeInput) === undefined;

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.phase}>Phase 3 · Chọn trải nghiệm</Text>

          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Bạn muốn trải nghiệm gì?
            </Text>
            <Text style={styles.body}>Chọn một chủ đề, hoặc tự gõ.</Text>
            <View style={styles.chips}>
              {TOPIC_CHOICES.map((choice) => (
                <Pressable
                  key={choice.topic}
                  accessibilityRole="radio"
                  accessibilityLabel={`Chủ đề ${choice.label}`}
                  accessibilityState={{ checked: topic === choice.topic }}
                  onPress={() => chooseTopic(choice.topic)}
                  style={({ pressed }) => [
                    styles.chip,
                    topic === choice.topic && styles.chipSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[styles.chipText, topic === choice.topic && styles.chipTextSelected]}
                  >
                    {choice.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.inputRow}>
              <TextInput
                value={topicInput}
                onChangeText={setTopicInput}
                onSubmitEditing={applyTopicText}
                placeholder="Ví dụ: ăn thực"
                placeholderTextColor={colors.muted}
                accessibilityLabel="Ô gõ chủ đề"
                style={styles.input}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Dùng chủ đề đã gõ"
                onPress={applyTopicText}
                style={({ pressed }) => [styles.smallButton, pressed && styles.pressed]}
              >
                <Text style={styles.smallButtonText}>Dùng</Text>
              </Pressable>
            </View>
            {typedTopicUnknown && (
              <Text style={styles.hint}>
                Chưa nhận ra chủ đề này. Hãy thử ăn thực, chuyện xưa hoặc khám phá tự do.
              </Text>
            )}
          </View>

          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Bạn có bao nhiêu thời gian?
            </Text>
            <Text style={styles.body}>Chọn một khoảng, hoặc tự gõ.</Text>
            <View style={styles.chips}>
              {TIME_CHOICES.map((minutes) => (
                <Pressable
                  key={minutes}
                  accessibilityRole="radio"
                  accessibilityLabel={`${minutes} phút`}
                  accessibilityState={{ checked: budgetMinutes === minutes }}
                  onPress={() => chooseTime(minutes)}
                  style={({ pressed }) => [
                    styles.chip,
                    budgetMinutes === minutes && styles.chipSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      budgetMinutes === minutes && styles.chipTextSelected,
                    ]}
                  >
                    {minutes} phút
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.inputRow}>
              <TextInput
                value={timeInput}
                onChangeText={setTimeInput}
                onSubmitEditing={applyTimeText}
                placeholder="Ví dụ: khoảng 30 phút"
                placeholderTextColor={colors.muted}
                accessibilityLabel="Ô gõ thời gian"
                style={styles.input}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Dùng thời gian đã gõ"
                onPress={applyTimeText}
                style={({ pressed }) => [styles.smallButton, pressed && styles.pressed]}
              >
                <Text style={styles.smallButtonText}>Dùng</Text>
              </Pressable>
            </View>
            {typedTimeUnknown && (
              <Text style={styles.hint}>
                Chưa nhận ra khoảng thời gian này. Hãy thử 30 phút hoặc 1 tiếng.
              </Text>
            )}
          </View>

          {showResult && result.kind === 'needs-topic' && (
            <View style={styles.result} accessibilityLiveRegion="polite">
              <Text style={styles.resultTitle}>Chọn chủ đề trước nhé</Text>
              <Text style={styles.body}>
                Mình cần biết bạn muốn ăn thực, chuyện xưa hay khám phá tự do để gợi ý điểm.
              </Text>
            </View>
          )}

          {showResult && result.kind === 'needs-budget' && (
            <View style={styles.result} accessibilityLiveRegion="polite">
              <Text style={styles.resultTitle}>Cho mình biết thời gian nhé</Text>
              <Text style={styles.body}>
                Mình sẽ sắp xếp các điểm theo khoảng thời gian bạn có.
              </Text>
            </View>
          )}

          {showResult && result.kind === 'empty' && (
            <View style={styles.result} accessibilityLiveRegion="polite">
              <Text style={styles.resultTitle}>Chưa có điểm phù hợp</Text>
              <Text style={styles.body}>
                Trong dữ liệu demo hiện chưa còn điểm nào cho chủ đề này. Bạn có thể đổi
                chủ đề hoặc chọn khoảng thời gian khác.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setTopic(undefined);
                  setShowResult(false);
                }}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.secondaryText}>Đổi chủ đề</Text>
              </Pressable>
            </View>
          )}

          {showResult && result.kind === 'ok' && (
            <View style={styles.result} accessibilityLiveRegion="polite">
              <Text accessibilityRole="header" style={styles.resultTitle}>
                Gợi ý cho chủ đề {TOPIC_LABELS[result.topic]}
              </Text>
              <Text style={styles.body}>
                Khoảng thời gian bạn chọn: {result.budgetMinutes} phút. Đây là gợi ý trải
                nghiệm, không phải đường đi.
              </Text>
              {result.picks.map((pick) => (
                <View key={pick.node.id} style={styles.pickCard}>
                  <Text style={styles.pickTitle}>{pick.node.name}</Text>
                  <Text style={styles.body}>{pick.reason}</Text>
                  <Text style={styles.pickMeta}>
                    Ước tính {pick.visitMinutes} phút · mô phỏng
                  </Text>
                </View>
              ))}
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setShowResult(false);
                  setTopic(undefined);
                  setBudgetMinutes(undefined);
                }}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.secondaryText}>Đổi lựa chọn</Text>
              </Pressable>
            </View>
          )}

          <Text style={styles.note}>
            Điểm gợi ý và thời lượng trong bản demo là dữ liệu mô phỏng để review luồng.
            App chưa chọn điểm giúp bạn và chưa chỉ đường.
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
  sectionTitle: { fontSize: 20, fontWeight: '600', color: colors.text },
  body: { fontSize: 16, lineHeight: 24, color: colors.muted },
  hint: { fontSize: 14, lineHeight: 20, color: colors.error },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexGrow: 1, flexBasis: 120, minHeight: 52, padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  chipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 16, color: colors.text },
  chipTextSelected: { color: colors.surface, fontWeight: '600' },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, minHeight: 52, paddingHorizontal: 16, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
    fontSize: 16, color: colors.text,
  },
  smallButton: {
    minHeight: 52, paddingHorizontal: 18, borderRadius: 12,
    backgroundColor: colors.accentSoft, justifyContent: 'center', alignItems: 'center',
  },
  smallButtonText: { fontSize: 16, fontWeight: '600', color: colors.accent },
  result: { padding: 20, borderRadius: 12, gap: 12, backgroundColor: colors.surface },
  resultTitle: { fontSize: 20, fontWeight: '600', color: colors.text },
  pickCard: { padding: 16, borderRadius: 12, gap: 8, backgroundColor: colors.accentSoft },
  pickTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  pickMeta: { fontSize: 14, color: colors.muted },
  secondaryButton: { minHeight: 48, paddingVertical: 12, justifyContent: 'center' },
  secondaryText: { fontSize: 16, fontWeight: '600', color: colors.accent },
  pressed: { opacity: 0.72 },
  note: { marginTop: 8, fontSize: 14, lineHeight: 22, color: colors.muted },
});