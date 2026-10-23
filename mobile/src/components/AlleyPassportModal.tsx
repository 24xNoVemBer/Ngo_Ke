import type { ReactElement } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useLocale } from '../context/LocaleContext';
import { useMotionState } from '../hooks/MotionPreferences';
import { getLocalizedCollections } from '../data/collections';
import { radius, spacing } from '../theme';

export type AlleyPassportModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function AlleyPassportModal({
  visible,
  onClose,
}: AlleyPassportModalProps): ReactElement {
  const { locale, t } = useLocale();
  const motion = useMotionState();
  const { fontScale } = useWindowDimensions();
  const collections = getLocalizedCollections(locale);

  return (
    <Modal
      visible={visible}
      animationType={motion.reducedMotion ? 'none' : 'slide'}
      transparent
      onRequestClose={onClose}
      testID="alley-passport-modal"
      accessibilityViewIsModal
    >
      <View style={styles.modalBackdrop}>
        <Pressable
          testID="passport-modal-backdrop"
          accessibilityRole="button"
          style={styles.modalDismissArea}
          onPress={onClose}
          accessibilityLabel={t('common.close')}
        />

        <View style={styles.journalDrawerSheet}>
          <View style={[styles.drawerHeaderRow, fontScale > 1.3 && styles.drawerHeaderRowStacked]}>
            <View style={styles.drawerTitleGroup}>
              <Text style={styles.passportPhase}>{t('landing.passport_phase')}</Text>
              <Text accessibilityRole="header" style={styles.drawerTitle} numberOfLines={2}>
                {t('landing.passport_title')}
              </Text>
            </View>
            <Pressable
              testID="passport-modal-close-btn"
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.closeDrawerButton}
            >
              <Text style={styles.closeDrawerText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.drawerScrollContent}>
            <Text style={styles.passportGuideText}>
              {t('landing.passport_guide')}
            </Text>

            {collections.map((col) => (
              <View key={col.id} style={styles.passportAlleySection}>
                <View style={styles.passportAlleyHeader}>
                  <Text style={styles.passportAlleyName}>{col.name}</Text>
                  <View style={styles.badgeSamplePill}>
                    <Text style={styles.badgeSampleText}>{t('landing.badge_sample')}</Text>
                  </View>
                </View>
                <Text style={styles.passportAlleyDistrict}>{col.district}</Text>

                <View style={styles.passportStopsRow}>
                  {Array.from({ length: Math.min(col.nodeCount, 6) }).map((_, i) => (
                    <View key={i} style={styles.passportStampSlot}>
                      <View style={styles.stampDottedCircle}>
                        <Text style={styles.stampNumberText}>{i + 1}</Text>
                      </View>
                      <Text style={styles.stampSlotLabel}>
                        {`${t('home.stop_prefix')} ${i + 1}`}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(12, 14, 18, 0.65)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  journalDrawerSheet: {
    backgroundColor: '#1E241D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#B9A589',
    maxHeight: '85%',
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 16,
  },
  drawerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 253, 247, 0.12)',
  },
  drawerHeaderRowStacked: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  drawerTitleGroup: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    gap: 2,
  },
  passportPhase: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFDF7',
    letterSpacing: 0.3,
  },
  closeDrawerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 253, 247, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeDrawerText: {
    color: '#FFFDF7',
    fontSize: 16,
    fontWeight: '700',
  },
  drawerScrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  passportGuideText: {
    fontSize: 13,
    color: 'rgba(255, 253, 247, 0.78)',
    lineHeight: 18,
  },
  passportAlleySection: {
    backgroundColor: 'rgba(255, 253, 247, 0.05)',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 247, 0.10)',
    gap: 6,
  },
  passportAlleyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passportAlleyName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFDF7',
  },
  passportAlleyDistrict: {
    fontSize: 12,
    color: '#D4AF37',
  },
  badgeSamplePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(212, 175, 55, 0.20)',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  badgeSampleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4AF37',
    textTransform: 'uppercase',
  },
  passportStopsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  passportStampSlot: {
    alignItems: 'center',
    gap: 4,
  },
  stampDottedCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 253, 247, 0.40)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 253, 247, 0.04)',
  },
  stampNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 253, 247, 0.75)',
  },
  stampSlotLabel: {
    fontSize: 10,
    color: 'rgba(255, 253, 247, 0.60)',
  },
});
