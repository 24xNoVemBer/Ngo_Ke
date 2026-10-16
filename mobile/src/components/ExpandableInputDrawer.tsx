import { useEffect, useRef, useState, type ReactElement } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMotionState } from '../hooks/MotionPreferences';
import { AppIcon } from './AppIcon';
import { colors, radius, spacing, typography } from '../theme';

import { useLocale } from '../context/LocaleContext';

interface Props {
  visible: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  suggestedQuestions?: string[];
  onSelectSuggestion?: (question: string) => void;
  placeholder?: string;
  title?: string;
}

export function ExpandableInputDrawer({
  visible,
  value,
  onChangeText,
  onSubmit,
  onClose,
  suggestedQuestions = [],
  onSelectSuggestion,
  placeholder,
  title,
}: Props): ReactElement {
  const { t } = useLocale();
  const resolvedPlaceholder = placeholder ?? t('drawer.placeholder');
  const resolvedTitle = title ?? t('drawer.title');
  const { active } = useMotionState();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [presented, setPresented] = useState(visible);
  const [height, setHeight] = useState(windowHeight);
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const request = useRef(0);
  const input = useRef<TextInput>(null);

  useEffect(() => {
    const id = ++request.current;
    if (visible) setPresented(true);
    else Keyboard.dismiss();
    progress.stopAnimation();
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0, duration: active ? (visible ? 260 : 200) : 0, useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished && id === request.current && !visible) setPresented(false);
    });
    return () => { request.current += 1; animation.stop(); };
  }, [visible, active, progress]);

  if (!presented) return <View />;

  return (
    <Modal
      transparent
      visible={presented}
      animationType="none"
      onShow={() => {
        const id = request.current;
        requestAnimationFrame(() => { if (visible && id === request.current) input.current?.focus(); });
      }}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.backdrop}
      >
        <Pressable
          style={styles.dimmedArea}
          onPress={onClose}
          accessibilityLabel={t('drawer.close_backdrop')}
          accessibilityRole="button"
        />

        <Animated.View
          onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
          style={[
            styles.drawer,
            { maxHeight: windowHeight * 0.85, paddingBottom: Math.max(insets.bottom, 16),
              transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }) }] },
          ]}
        >
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: spacing.md }}>
          {/* Header */}
          <View style={styles.handleBar} />
          <View style={styles.headerRow}>
            <Text style={styles.drawerTitle} accessibilityRole="header">
              {resolvedTitle}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('drawer.collapse')}
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <AppIcon name="close" color={colors.muted} />
            </Pressable>
          </View>

          {/* Ô nhập chữ */}
          <View style={styles.inputRow}>
            <TextInput
              ref={input}
              style={styles.input}
              value={value}
              onChangeText={onChangeText}
              placeholder={resolvedPlaceholder}
              placeholderTextColor={colors.muted}
              returnKeyType="send"
              onSubmitEditing={onSubmit}
              accessibilityLabel={resolvedTitle}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('drawer.send')}
              disabled={value.trim().length === 0}
              onPress={onSubmit}
              style={({ pressed }) => [
                styles.sendButton,
                value.trim().length === 0 && styles.sendButtonDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.sendButtonText}>{t('drawer.btn_send')}</Text>
            </Pressable>
          </View>

          {/* Gợi ý câu hỏi chạm nhanh */}
          {suggestedQuestions.length > 0 && (
            <View style={styles.suggestionsWrapper}>
              <Text style={styles.suggestionTitle}>{t('drawer.suggestions_title')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionsRow}
              >
                {suggestedQuestions.map((q, idx) => (
                  <Pressable
                    key={idx}
                    accessibilityRole="button"
                    accessibilityLabel={t('drawer.select_suggestion', { question: q })}
                    onPress={() => onSelectSuggestion?.(q)}
                    style={({ pressed }) => [
                      styles.suggestionChip,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.suggestionText}>{q}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(46, 48, 40, 0.45)',
  },
  dimmedArea: {
    flex: 1,
  },
  drawer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
  },
  handleBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
    marginBottom: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drawerTitle: {
    ...typography.titleSmall,
    flex: 1,
    color: colors.text,
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  closeIcon: {
    fontSize: 18,
    color: colors.muted,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    ...typography.bodyMedium,
  },
  sendButton: {
    minHeight: 52,
    minWidth: 64,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.borderStrong,
    opacity: 0.6,
  },
  sendButtonText: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.surface,
  },
  suggestionsWrapper: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  suggestionTitle: {
    ...typography.caption,
    color: colors.muted,
  },
  suggestionsRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  suggestionChip: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionText: {
    ...typography.caption,
    color: colors.text,
  },
  pressed: {
    opacity: 0.72,
  },
});
