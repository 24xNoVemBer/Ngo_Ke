import type { ReactElement } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { DemoNode } from '../data/sourceState';
import { resolveNodeVisual } from '../assets/nodeVisual';
import { NodeVisualImage, NodeVisualCredit } from './HeritageSketchPlaceholder';
import { colors, radius, spacing, typography } from '../theme';
import { useLocale } from '../context/LocaleContext';

interface Props {
  node: DemoNode;
  isActive?: boolean;
  onSelect?: () => void;
  actionLabel?: string;
  subReason?: string;
  collectionKind?: 'simulated' | 'reviewed';
}

export function PostcardCard({
  node,
  isActive = false,
  onSelect,
  actionLabel,
  subReason,
  collectionKind = 'simulated',
}: Props): ReactElement {
  const { t, locale, collectionId } = useLocale();
  const { fontScale } = useWindowDimensions();
  const isReviewed = collectionKind === 'reviewed';
  const isThreeLenses = collectionId === 'old-quarter-three-lenses' && isReviewed;
  const resolvedActionLabel = actionLabel ?? t('common.explore_this_point');
  const visual = resolveNodeVisual(node.id, undefined, collectionId, locale);

  return (
    <View style={[styles.card, isActive && styles.cardActive]}>
      {/* Khung ảnh chụp chân thực */}
      <View style={[styles.imageContainer, isThreeLenses && { backgroundColor: '#1E1E1E' }]}>
        <NodeVisualImage visual={visual} locale={locale} siteName={node.name} ratio="4:3" style={styles.image} resizeMode={isThreeLenses ? 'contain' : 'cover'} />

        {/* Dấu mộc son gạch nung */}
        {node.visited && (
          <View style={styles.visitedStamp}>
            <Text style={styles.stampText}>{t('common.visited_stamp')}</Text>
          </View>
        )}
      </View>

      {/* Thông tin thẻ sổ tay */}
      <View style={styles.content}>
        <View style={[styles.headerRow, fontScale > 1.3 && styles.headerRowStacked]}>
          <Text style={[styles.title, fontScale > 1.3 && styles.titleStacked]} accessibilityRole="header">
            {node.name}
          </Text>
          <View style={[styles.durationBadge, fontScale > 1.3 && styles.durationBadgeStacked]}>
            <Text style={styles.durationText}>
              {t('location.suggested_visit_minutes', {
                minutes: node.visitMinutes,
              })}
            </Text>
          </View>
        </View>

        <Text style={styles.summary} numberOfLines={2}>
          {subReason ?? node.summary}
        </Text>

        <NodeVisualCredit visual={visual} locale={locale} style={styles.creditText} />

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
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  headerRowStacked: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  title: {
    ...typography.titleSmall,
    color: colors.text,
    flexShrink: 1,
  },
  titleStacked: {
    width: '100%',
  },
  durationBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
  },
  durationBadgeStacked: {
    alignSelf: 'flex-start',
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
