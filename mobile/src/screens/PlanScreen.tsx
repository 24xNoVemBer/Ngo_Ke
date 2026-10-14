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
import type { DemoNode, Mode } from '../data/sourceState';
import {
  pickPoints,
  hasTopicNegation,
  parseTimeBudget,
  parseTopic,
  TOPIC_LABELS,
} from '../recommendation/pick';
import type { Topic } from '../data/sourceState';
import type { PlanDraft } from '../recommendation/pick';
import { AppIcon } from '../components/AppIcon';
import { PostcardCard } from '../components/PostcardCard';
import { colors, radius, spacing, typography } from '../theme';

const TOPIC_CHOICES: { topic: Topic; label: string; icon: 'food' | 'book' | 'compass' }[] = [
  { topic: 'an thuc', label: 'Ẩm thực ngõ', icon: 'food' },
  { topic: 'chuyen xua', label: 'Chuyện xưa hoài niệm', icon: 'book' },
  { topic: 'kham pha tu do', label: 'Khám phá tự do', icon: 'compass' },
];

const TIME_CHOICES = [15, 30, 45, 60];

type Props = {
  mode?: Mode;
  nodes: DemoNode[];
  draft?: PlanDraft;
  onDraftChange?: (draft: PlanDraft) => void;
  onSelectNode: (nodeId: string) => void;
};

export function PlanScreen({ mode = 'demo', nodes, draft = {}, onDraftChange = () => {}, onSelectNode }: Props): ReactElement {
  const [topicInput, setTopicInput] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const topic = draft.topic;
  const budgetMinutes = draft.budgetMinutes;
  const [showResult, setShowResult] = useState(Boolean(topic || budgetMinutes));
  const [showManualInput, setShowManualInput] = useState(false);

  function chooseTopic(value: Topic): void {
    onDraftChange({ ...draft, topic: value });
    setTopicInput('');
    setShowResult(true);
  }

  function applyTopicText(): void {
    if (hasTopicNegation(topicInput)) {
      onDraftChange({ ...draft, topic: undefined });
      setShowResult(true);
      return;
    }
    const parsed = parseTopic(topicInput);
    if (parsed !== undefined) {
      onDraftChange({ ...draft, topic: parsed });
      setTopicInput('');
      setShowResult(true);
    }
  }

  function chooseTime(minutes: number): void {
    onDraftChange({ ...draft, budgetMinutes: minutes });
    setTimeInput('');
    setShowResult(true);
  }

  function applyTimeText(): void {
    const parsed = parseTimeBudget(timeInput);
    if (parsed !== undefined) {
      onDraftChange({ ...draft, budgetMinutes: parsed });
      setTimeInput('');
      setShowResult(true);
    }
  }

  const result = pickPoints(nodes, { topic, budgetMinutes });
  const typedTopicUnknown = topicInput.trim().length > 0
    && !hasTopicNegation(topicInput)
    && parseTopic(topicInput) === undefined;
  const typedTimeUnknown = timeInput.trim().length > 0 && parseTimeBudget(timeInput) === undefined;

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
          {/* Header sổ tay hành trình */}
          <View style={styles.headerBox}>
            <Text style={styles.phase}>Hành trình ngõ phố · Chọn trải nghiệm</Text>
            <Text accessibilityRole="header" style={styles.mainTitle}>
              Một hành trình vừa ý
            </Text>
            <Text style={styles.subtitle}>
              Lựa chọn gu trải nghiệm và quỹ thời gian để nhận gợi ý những góc ngõ đậm chất
              nhất.
            </Text>
          </View>

          {/* Chọn chủ đề */}
          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              1. Bạn muốn khám phá gì?
            </Text>
            <View style={styles.chips}>
              {TOPIC_CHOICES.map((choice) => (
                <Pressable
                  key={choice.topic}
                  accessibilityRole="radio"
                  accessibilityLabel={`Chủ đề ${choice.label}`}
                  accessibilityState={{ checked: topic === choice.topic }}
                  onPress={() => chooseTopic(choice.topic)}
                  style={({ pressed }) => [
                    styles.topicChip,
                    topic === choice.topic && styles.topicChipSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <AppIcon name={choice.icon} color={topic === choice.topic ? colors.surface : colors.accent} />
                  <Text
                    style={[
                      styles.topicChipText,
                      topic === choice.topic && styles.topicChipTextSelected,
                    ]}
                  >
                    {choice.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Nút bật nhập tay hoặc ô nhập */}
            {!showManualInput ? (
              <Pressable
                onPress={() => setShowManualInput(true)}
                style={styles.toggleInputButton}
              >
                <Text style={styles.toggleInputText}>⌨ Nhập chủ đề hoặc thời gian khác...</Text>
              </Pressable>
            ) : (
              <View style={styles.manualInputGroup}>
                <View style={styles.inputRow}>
                  <TextInput
                    value={topicInput}
                    onChangeText={setTopicInput}
                    onSubmitEditing={applyTopicText}
                    placeholder="Tự gõ: ăn thực, chuyện xưa..."
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
                    Chưa nhận ra chủ đề này. Hãy thử “ẩm thực”, “chuyện xưa” hoặc “khám phá tự do”.
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Chọn thời lượng */}
          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              2. Bạn có bao nhiêu thời gian?
            </Text>
            <View style={styles.timeChips}>
              {TIME_CHOICES.map((minutes) => (
                <Pressable
                  key={minutes}
                  accessibilityRole="radio"
                  accessibilityLabel={`${minutes} phút`}
                  accessibilityState={{ checked: budgetMinutes === minutes }}
                  onPress={() => chooseTime(minutes)}
                  style={({ pressed }) => [
                    styles.timeChip,
                    budgetMinutes === minutes && styles.timeChipSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      budgetMinutes === minutes && styles.timeChipTextSelected,
                    ]}
                  >
                    {minutes} phút
                  </Text>
                </Pressable>
              ))}
            </View>

            {showManualInput && (
              <View style={styles.manualInputGroup}>
                <View style={styles.inputRow}>
                  <TextInput
                    value={timeInput}
                    onChangeText={setTimeInput}
                    onSubmitEditing={applyTimeText}
                    placeholder="Ví dụ: khoảng 30 phút, 1 tiếng..."
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
            )}
          </View>

          {/* Kết quả gợi ý: Danh thiếp / Bưu thiếp ngõ trực quan */}
          {showResult && result.kind === 'needs-topic' && (
            <View style={styles.resultNotice} accessibilityLiveRegion="polite">
              <Text style={styles.resultNoticeTitle}>Vui lòng chọn chủ đề</Text>
              <Text style={styles.body}>
                Hãy chọn ăn thực, chuyện xưa hoặc khám phá tự do ở bước 1 để app tìm điểm
                phù hợp.
              </Text>
            </View>
          )}

          {showResult && result.kind === 'needs-budget' && (
            <View style={styles.resultNotice} accessibilityLiveRegion="polite">
              <Text style={styles.resultNoticeTitle}>Vui lòng chọn thời gian</Text>
              <Text style={styles.body}>
                Hãy chọn khoảng thời gian bạn có ở bước 2 để app sắp xếp điểm ngõ vừa vặn.
              </Text>
            </View>
          )}

          {showResult && result.kind === 'empty' && (
            <View style={styles.resultNotice} accessibilityLiveRegion="polite">
              <Text style={styles.resultNoticeTitle}>Chưa có điểm ngõ phù hợp</Text>
              <Text style={styles.body}>
                Trong nguồn hiện tại chưa có điểm mở phù hợp với lựa chọn này. Bạn có thể đổi
                chủ đề hoặc chọn khoảng thời gian khác.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  onDraftChange({ budgetMinutes });
                  setShowResult(false);
                }}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.secondaryText}>Đổi lựa chọn</Text>
              </Pressable>
            </View>
          )}

          {showResult && result.kind === 'ok' && (
            <View style={styles.resultSection} accessibilityLiveRegion="polite">
              <View style={styles.resultHeader}>
                <Text style={styles.phase}>Hành trình gợi ý dành cho bạn</Text>
                <Text accessibilityRole="header" style={styles.resultMainTitle}>
                  Chủ đề {TOPIC_LABELS[result.topic]} · {result.budgetMinutes} phút
                </Text>
                <Text style={styles.resultSubtitle}>
                  Dưới đây là {result.picks.length} điểm ngõ giàu hình ảnh và câu chuyện được
                  chọn lọc cho hành trình của bạn:
                </Text>
              </View>

              {/* Danh sách các Postcard ảnh chân thực */}
              <View style={styles.postcardList}>
                {result.picks.map((pick) => (
                  <PostcardCard
                    key={pick.node.id}
                    node={pick.node}
                    subReason={pick.reason}
                    actionLabel={`Khám phá (${pick.visitMinutes} phút)`}
                    onSelect={() => onSelectNode(pick.node.id)}
                  />
                ))}
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setShowResult(false);
                  onDraftChange({});
                }}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.secondaryText}>↻ Thiết kế lại hành trình khác</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.disclaimerBox}>
            <Text style={styles.note}>
              {mode === 'demo' ? 'Điểm gợi ý và thời lượng trong bản demo là dữ liệu mô phỏng để review luồng.' : 'Nguồn Live từ máy chủ hiện dùng dữ liệu mô phỏng; không dùng thời lượng này để đi thực tế.'}
              {' '}Tổng thời gian dừng không vượt quỹ đã chọn; chưa tính thời gian đi bộ.
              App chưa chỉ đường từng bước.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
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
    paddingTop: spacing.xs,
  },
  phase: {
    ...typography.label,
    color: colors.terracotta,
    textTransform: 'uppercase',
  },
  mainTitle: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.muted,
    lineHeight: 22,
  },
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.sm,
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
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    ...typography.bodyMedium,
    color: colors.muted,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.terracotta,
    marginTop: 4,
  },
  chips: {
    gap: spacing.sm,
  },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceWarm,
    gap: spacing.md,
  },
  topicChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  topicIcon: {
    fontSize: 20,
  },
  topicChipText: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  topicChipTextSelected: {
    color: colors.surface,
  },
  timeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeChip: {
    flex: 1,
    minWidth: 70,
    minHeight: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceWarm,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  timeChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  timeChipText: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '500',
  },
  timeChipTextSelected: {
    color: colors.surface,
    fontWeight: '700',
  },
  toggleInputButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  toggleInputText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
  },
  manualInputGroup: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceWarm,
    ...typography.bodyMedium,
    color: colors.text,
  },
  smallButton: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  smallButtonText: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.accent,
  },
  resultNotice: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultNoticeTitle: {
    ...typography.titleMedium,
    color: colors.terracotta,
  },
  resultSection: {
    gap: spacing.md,
  },
  resultHeader: {
    gap: spacing.xs,
  },
  resultMainTitle: {
    ...typography.titleLarge,
    color: colors.text,
  },
  resultSubtitle: {
    ...typography.bodyMedium,
    color: colors.muted,
  },
  postcardList: {
    gap: spacing.md,
  },
  secondaryButton: {
    minHeight: 48,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceWarm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  secondaryText: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.accent,
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
