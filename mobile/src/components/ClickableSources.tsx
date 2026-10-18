import type { ReactElement } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocale } from '../context/LocaleContext';
import type { Locale } from '../data/locale';
import { colors, spacing, typography } from '../theme';

import { parseEvidenceItem, type ParsedEvidence } from './evidenceParser.ts';

interface Props {
  evidence: string[];
  label?: string;
  isThreeLenses?: boolean;
  locale?: Locale;
}

export { parseEvidenceItem, type ParsedEvidence };

export function ClickableSources({ evidence, label, isThreeLenses, locale: propLocale }: Props): ReactElement {
  const { locale: ctxLocale } = useLocale();
  const effectiveLocale = propLocale ?? ctxLocale;
  const isEn = effectiveLocale === 'en';

  if (!evidence || evidence.length === 0) {
    return <></>;
  }

  const handleOpen = (url: string) => {
    void Linking.openURL(url).catch(() => {});
  };

  const openLabelPrefix = isEn ? 'Open source: ' : 'Mở nguồn: ';
  const disclaimerText = isEn
    ? 'Sourced · not officially approved · Content references cited sources and does not represent official heritage management approval.'
    : 'Có nguồn · chưa duyệt chính thức · Nội dung trích dẫn nguồn tham khảo, không đại diện phê duyệt chính thức từ ban quản lý di tích.';

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}:</Text>}
      <View style={styles.list}>
        {evidence.map((item, idx) => {
          const { label: text, url } = parseEvidenceItem(item);
          return (
            <View key={idx} style={styles.itemRow}>
              {url ? (
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={`${openLabelPrefix}${text}`}
                  onPress={() => handleOpen(url)}
                  style={({ pressed }) => [styles.linkPressable, pressed && styles.pressed]}
                >
                  <Text style={styles.linkText} numberOfLines={2}>
                    🔗 {text}
                  </Text>
                </Pressable>
              ) : (
                <Text style={styles.plainText}>• {text}</Text>
              )}
            </View>
          );
        })}
      </View>
      {isThreeLenses && (
        <View style={styles.sourcedOnlyDisclaimer}>
          <Text style={styles.sourcedOnlyDisclaimerText}>
            {disclaimerText}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.accent,
    fontWeight: '700',
  },
  list: {
    gap: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkPressable: {
    minHeight: 36,
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(45, 87, 72, 0.08)',
    borderRadius: 6,
  },
  linkText: {
    ...typography.caption,
    color: colors.accent,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  plainText: {
    ...typography.caption,
    color: colors.muted,
  },
  pressed: {
    opacity: 0.6,
  },
  sourcedOnlyDisclaimer: {
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(196, 92, 59, 0.08)',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.terracotta,
  },
  sourcedOnlyDisclaimerText: {
    fontSize: 11,
    color: colors.terracotta,
    fontWeight: '600',
    lineHeight: 15,
  },
});
