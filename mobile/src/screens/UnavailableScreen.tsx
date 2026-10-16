import type { ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../theme';
import { useLocale } from '../context/LocaleContext';

type Props = { detail: string; onBack?: () => void; onSwitchToDemo?: () => void; onRetry?: () => void; busy?: boolean };

/** Shown when the active source has no dataset, so Q&A cannot be offered. */
export function UnavailableScreen({ detail, onBack, onSwitchToDemo, onRetry, busy = false }: Props): ReactElement {
  const { t } = useLocale();
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.phase}>{t('unavailable.phase')}</Text>
          <Text accessibilityRole="header" style={styles.title}>
            {t('unavailable.title')}
          </Text>
          <Text style={styles.body}>{detail}</Text>
          <View style={styles.disclaimerBox}>
            <Text style={styles.note}>{t('unavailable.note')}</Text>
          </View>
          {onBack && <Pressable accessibilityRole="button" onPress={onBack} style={styles.action}><Text style={styles.body}>{t('common.back')}</Text></Pressable>}
          {onRetry && <Pressable accessibilityRole="button" disabled={busy} onPress={onRetry} style={styles.action}><Text style={styles.body}>{busy ? t('common.loading') : t('common.retry')}</Text></Pressable>}
          {onSwitchToDemo && <Pressable accessibilityRole="button" onPress={onSwitchToDemo} style={styles.action}><Text style={styles.body}>{t('common.switch_to_demo')}</Text></Pressable>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  action: { minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing.md, backgroundColor: colors.surfaceWarm, borderRadius: radius.md },
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
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
  phase: {
    ...typography.label,
    color: colors.terracotta,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.titleLarge,
    color: colors.text,
  },
  body: {
    ...typography.bodyMedium,
    color: colors.muted,
    lineHeight: 22,
  },
  disclaimerBox: {
    backgroundColor: colors.surfaceWarm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    marginTop: spacing.xs,
  },
  note: {
    ...typography.bodySmall,
    color: colors.muted,
    lineHeight: 20,
  },
});
