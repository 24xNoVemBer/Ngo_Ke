import type { ReactElement } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { DemoNode } from '../data/sourceState';
import { useLocale } from '../context/LocaleContext';
import { colors, radius, spacing, typography } from '../theme';

interface Props {
  nodes: DemoNode[];
  currentNodeId?: string;
  onSelectNode: (nodeId: string) => void;
}

export function AlleyTrailView({
  nodes,
  currentNodeId,
  onSelectNode,
}: Props): ReactElement {
  const { locale } = useLocale();
  const visitedCount = nodes.filter((n) => n.visited).length;

  return (
    <View style={styles.container}>
      {/* Tiến trình khám phá */}
      <View style={styles.progressHeader}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressTitle}>{locale === 'en' ? 'Alley Journey' : 'Hành trình ngõ phố'}</Text>
          <Text style={styles.progressSubtitle}>
            {locale === 'en' ? `Visited ${visitedCount}/${nodes.length} stops` : `Đã ghé ${visitedCount}/${nodes.length} điểm khám phá`}
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.max(10, (visitedCount / nodes.length) * 100)}%` },
            ]}
          />
        </View>
      </View>

      {/* Danh sách trạm điểm dọc theo đường mòn ngõ */}
      <View style={styles.trailList}>
        {nodes.map((node, index) => {
          const isCurrent = node.id === currentNodeId;
          const isVisited = node.visited;
          const isLast = index === nodes.length - 1;

          return (
            <View key={node.id} style={styles.stepRow}>
              {/* Cột mốc và đường nối */}
              <View style={styles.timelineColumn}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={locale === 'en' ? `Select stop ${node.name}${isCurrent ? ' · current' : ''}` : `Chọn trạm ${node.name}${isCurrent ? ' · đang đứng' : ''}`}
                  onPress={() => onSelectNode(node.id)}
                  style={({ pressed }) => [
                    styles.nodePin,
                    isCurrent && styles.nodePinCurrent,
                    isVisited && styles.nodePinVisited,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.nodePinText,
                      (isCurrent || isVisited) && styles.nodePinTextActive,
                    ]}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </Text>
                </Pressable>
                {!isLast && <View style={[styles.timelineTrack, isVisited && styles.trackVisited]} />}
              </View>

              {/* Thẻ nội dung trạm */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${node.name}, ${node.visitMinutes} ${locale === 'en' ? 'simulated min' : 'phút mô phỏng'}`}
                onPress={() => onSelectNode(node.id)}
                style={({ pressed }) => [
                  styles.nodeCard,
                  isCurrent && styles.nodeCardCurrent,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.nodeHeaderRow}>
                  <Text style={[styles.nodeName, isCurrent && styles.nodeNameCurrent]}>
                    {node.name}
                  </Text>
                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>{locale === 'en' ? 'Viewing' : 'Đang xem'}</Text>
                    </View>
                  )}
                  {isVisited && !isCurrent && (
                    <Text style={styles.visitedMark}>{locale === 'en' ? '✓ Visited' : '✓ Đã ghé'}</Text>
                  )}
                </View>

                <Text style={styles.nodeSummary}>
                  {node.summary}
                </Text>

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{node.visitMinutes} {locale === 'en' ? 'simulated min' : 'phút mô phỏng'}</Text>
                  <Text style={styles.dotSeparator}>·</Text>
                  <Text style={styles.metaText}>
                    {node.tags.includes('an thuc')
                      ? (locale === 'en' ? 'Food & Drink' : 'Ẩm thực')
                      : node.tags.includes('chuyen xua')
                        ? (locale === 'en' ? 'Old Stories' : 'Chuyện xưa')
                        : (locale === 'en' ? 'Free Exploration' : 'Tự do')}
                  </Text>
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  progressHeader: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  progressTitle: {
    ...typography.titleSmall,
    color: colors.text,
  },
  progressSubtitle: {
    ...typography.caption,
    color: colors.muted,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  trailList: {
    paddingVertical: spacing.xs,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.md,
  },
  timelineColumn: {
    alignItems: 'center',
    width: 48,
  },
  nodePin: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  nodePinCurrent: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  nodePinVisited: {
    borderColor: colors.terracotta,
    backgroundColor: colors.terracotta,
  },
  nodePinText: {
    ...typography.micro,
    color: colors.text,
  },
  nodePinTextActive: {
    color: colors.surface,
    fontWeight: '700',
  },
  timelineTrack: {
    width: 2,
    minHeight: 46,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  trackVisited: {
    backgroundColor: colors.terracotta,
  },
  nodeCard: {
    flex: 1,
    padding: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    gap: 4,
  },
  nodeCardCurrent: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
  },
  nodeHeaderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  nodeName: {
    ...typography.bodyMedium,
    flexShrink: 1,
    fontWeight: '600',
    color: colors.text,
  },
  nodeNameCurrent: {
    color: colors.accent,
    fontWeight: '700',
  },
  currentBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
  },
  currentBadgeText: {
    ...typography.micro,
    color: colors.accent,
    fontWeight: '600',
  },
  visitedMark: {
    ...typography.micro,
    color: colors.terracotta,
    fontWeight: '600',
  },
  nodeSummary: {
    ...typography.caption,
    color: colors.muted,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  metaText: {
    ...typography.micro,
    color: colors.muted,
  },
  dotSeparator: {
    ...typography.micro,
    color: colors.muted,
  },
  pressed: {
    opacity: 0.72,
  },
});
