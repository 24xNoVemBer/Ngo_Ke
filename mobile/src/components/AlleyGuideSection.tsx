import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AlleyGuide } from '../data/alleyGuide';
import { useLocale } from '../context/LocaleContext';
import { colors, radius, spacing } from '../theme';

export interface AlleyGuideSectionProps {
  guide: AlleyGuide;
}

export function AlleyGuideSection({ guide }: AlleyGuideSectionProps): ReactElement {
  const { t } = useLocale();

  return (
    <View testID="alley-guide-section" style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionEyebrow}>SỔ TAY KHÁM PHÁ</Text>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {t('notebook.explore_more')}
        </Text>
      </View>

      {/* 1. Quán nên thử */}
      {guide.eat.length > 0 && (
        <View testID="alley-guide-eat-group" style={styles.groupContainer}>
          <View style={styles.groupHeaderRow}>
            <Text style={styles.groupIcon}>🍜</Text>
            <Text accessibilityRole="header" style={styles.groupTitle}>
              {t('notebook.explore_eat')}
            </Text>
          </View>
          <View style={styles.cardsStack}>
            {guide.eat.map((item, index) => (
              <View
                key={index}
                testID={`alley-guide-eat-item-${index}`}
                style={styles.eatCard}
              >
                <Text style={styles.cardItemName}>{item.name}</Text>
                {item.address ? (
                  <Text style={styles.cardItemAddress}>📍 {item.address}</Text>
                ) : null}
                <Text style={styles.cardItemDishes}>{item.dishes}</Text>
                <View style={styles.hoursBadge}>
                  <Text style={styles.cardItemHours}>
                    ⏱ {item.hours ? item.hours : t('notebook.explore_hours_unverified')}
                  </Text>
                </View>
                {item.note ? (
                  <Text style={styles.cardItemNote}>💡 {item.note}</Text>
                ) : null}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 2. Nên ghé thăm */}
      {guide.visit.length > 0 && (
        <View testID="alley-guide-visit-group" style={styles.groupContainer}>
          <View style={styles.groupHeaderRow}>
            <Text style={styles.groupIcon}>🏛️</Text>
            <Text accessibilityRole="header" style={styles.groupTitle}>
              {t('notebook.explore_visit')}
            </Text>
          </View>
          <View style={styles.cardsStack}>
            {guide.visit.map((item, index) => (
              <View
                key={index}
                testID={`alley-guide-visit-item-${index}`}
                style={styles.visitCard}
              >
                <Text style={styles.cardItemName}>{item.name}</Text>
                {item.address ? (
                  <Text style={styles.cardItemAddress}>📍 {item.address}</Text>
                ) : null}
                <View style={styles.notesList}>
                  {item.notes.map((note, noteIdx) => (
                    <Text key={noteIdx} style={styles.cardItemNoteText}>
                      • {note}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 3. Hành trình đề xuất */}
      {guide.route.length > 0 && (
        <View testID="alley-guide-route-group" style={styles.groupContainer}>
          <View style={styles.groupHeaderRow}>
            <Text style={styles.groupIcon}>🗺️</Text>
            <Text accessibilityRole="header" style={styles.groupTitle}>
              {t('notebook.explore_route')}
            </Text>
          </View>
          <View style={styles.routeContainer}>
            {guide.route.map((step, index) => (
              <View key={index} style={styles.routeStepRow}>
                <View style={styles.routeStepBadge}>
                  <Text style={styles.routeStepNumber}>{index + 1}</Text>
                </View>
                <View style={styles.routeStepTextWrap}>
                  <Text style={styles.routeStepText}>{step}</Text>
                  {index < guide.route.length - 1 ? (
                    <Text style={styles.routeArrow}>↓</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 4. Lưu ý trải nghiệm (Caveats) */}
      {guide.caveats.length > 0 && (
        <View testID="alley-guide-caveats-group" style={styles.caveatsContainer}>
          <Text accessibilityRole="header" style={styles.caveatsTitle}>
            ⚠️ {t('notebook.explore_caveats')}
          </Text>
          {guide.caveats.map((caveat, index) => (
            <Text key={index} style={styles.caveatText}>
              • {caveat}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  sectionHeaderRow: {
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.accent,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  groupContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  groupIcon: {
    fontSize: 16,
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  cardsStack: {
    gap: spacing.sm,
  },
  eatCard: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  visitCard: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardItemName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  cardItemAddress: {
    fontSize: 13,
    color: colors.muted,
  },
  cardItemDishes: {
    fontSize: 13.5,
    lineHeight: 19,
    color: colors.text,
  },
  hoursBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardItemHours: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
  cardItemNote: {
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.muted,
    fontStyle: 'italic',
    marginTop: 2,
  },
  notesList: {
    gap: 3,
    marginTop: 2,
  },
  cardItemNoteText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
  routeContainer: {
    gap: spacing.xs,
    paddingLeft: spacing.xs,
  },
  routeStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  routeStepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  routeStepNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFDF7',
  },
  routeStepTextWrap: {
    flex: 1,
  },
  routeStepText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: colors.text,
  },
  routeArrow: {
    fontSize: 13,
    color: colors.muted,
    marginVertical: 2,
  },
  caveatsContainer: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.md,
    gap: spacing.xs,
  },
  caveatsTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.terracotta,
    marginBottom: 2,
  },
  caveatText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.text,
  },
});
