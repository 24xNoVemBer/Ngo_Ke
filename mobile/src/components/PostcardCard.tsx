import type { ReactElement } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { DemoNode } from '../data/sourceState';
import { getNodePhoto, getNodePhotographer } from '../assets/photoMap';
import { colors, radius, spacing, typography } from '../theme';
import { useLocale } from '../context/LocaleContext';

interface Props {
  node: DemoNode;
  isActive?: boolean;
  onSelect?: () => void;
  actionLabel?: string;
  subReason?: string;
}

export function PostcardCard({
  node,
  isActive = false,
  onSelect,
  actionLabel,
  subReason,
}: Props): ReactElement {
  const { t } = useLocale();
  const resolvedActionLabel = actionLabel ?? t('common.explore_this_point');
  const photo = getNodePhoto(node.id);
  const credit = getNodePhotographer(node.id);

  return (
    <View style={[styles.card, isActive && styles.cardActive]}>
      {/* Khung ảnh chụp chân thực */}
      <View style={styles.imageContainer}>
        <Image source={photo} style={styles.image} resizeMode="cover" />
        {/* Nhãn minh bạch */}
        <View style={styles.disclaimerBadge}>
          <Text style={styles.disclaimerText}>{t('common.photo_disclaimer')}</Text>
        </View>

        {/* Dấu mộc son gạch nung */}
        {node.visited && (
          <View style={styles.visitedStamp}>
            <Text style={styles.stampText}>{t('common.visited_stamp')}</Text>
          </View>
        )}
      </View>

      {/* Thông tin thẻ sổ tay */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} accessibilityRole="header">
            {node.name}
          </Text>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{t('common.simulated_minutes', { minutes: node.visitMinutes })}</Text>
          </View>
        </View>

        <Text style={styles.summary} numberOfLines={2}>
          {subReason ?? node.summary}
        </Text>

        <Text style={styles.creditText}>{t('common.photo_author', { author: credit })}</Text>

        {onSelect && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${resolvedActionLabel} · ${node.name}`}
            onPress={onSelect}
            style={({ pressed }) => [
              styles.actionButton,
              isActive && styles.actionButtonActive,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.actionButtonText}>{resolvedActionLabel}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardActive: {
    borderColor: colors.accent,
    borderWidth: 1.5,
  },
  imageContainer: {
    width: '100%',
    height: 190,
    backgroundColor: colors.background,
    position: 'relative',
  },
  image: {
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
  visitedStamp: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    borderWidth: 2,
    borderColor: colors.terracotta,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 253, 247, 0.92)',
    transform: [{ rotate: '-6deg' }],
  },
  stampText: {
    ...typography.micro,
    fontWeight: '700',
    color: colors.terracotta,
    letterSpacing: 0.8,
  },
  content: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    ...typography.titleSmall,
    color: colors.text,
    flex: 1,
  },
  durationBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationText: {
    ...typography.micro,
    color: colors.muted,
  },
  summary: {
    ...typography.bodyMedium,
    color: colors.muted,
    lineHeight: 20,
    marginTop: 2,
  },
  creditText: {
    ...typography.micro,
    color: colors.muted,
    fontStyle: 'italic',
    marginTop: 2,
  },
  actionButton: {
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  actionButtonActive: {
    backgroundColor: colors.accentHover,
  },
  actionButtonText: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.surface,
  },
  pressed: {
    opacity: 0.72,
  },
});
