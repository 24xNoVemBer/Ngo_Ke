import { useState, type ReactElement } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { AppIcon } from './AppIcon';
import { useLocale } from '../context/LocaleContext';
import { useMotionState } from '../hooks/MotionPreferences';
import { getLocalizedCollections, getBundledDataset, type CollectionId } from '../data/collections';
import { readAlleyGuide } from '../data/alleyGuide';
import { AlleyGuideSection } from './AlleyGuideSection';
import type { Mode, SourceState } from '../data/sourceState';
import { radius, spacing } from '../theme';

export type NotebookDrawerModalProps = {
  visible: boolean;
  onClose: () => void;
  navigation: {
    navigate: (screen: 'Plan' | 'Camera' | 'Location') => void;
  };
  mode: Mode;
  onModeChange: (next: Mode) => void;
  source: SourceState;
  collectionId?: CollectionId;
  liveBusy?: boolean;
  onRetryLive?: () => void;
};

export function NotebookDrawerModal({
  visible,
  onClose,
  navigation,
  mode,
  onModeChange,
  source,
  collectionId,
  liveBusy,
  onRetryLive,
}: NotebookDrawerModalProps): ReactElement {
  const { locale, t } = useLocale();
  const motion = useMotionState();
  const { fontScale } = useWindowDimensions();
  const [activeView, setActiveView] = useState<'menu' | 'passport'>('menu');

  const collections = getLocalizedCollections(locale);
  const activeDataset =
    source?.status === 'ready'
      ? source.dataset
      : (collectionId ? getBundledDataset(collectionId, locale) : undefined);
  const guide = activeDataset ? readAlleyGuide(activeDataset) : null;

  const handleClose = () => {
    setActiveView('menu');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType={motion.reducedMotion ? 'none' : 'slide'}
      transparent
      onRequestClose={handleClose}
      testID="notebook-drawer-modal"
      accessibilityViewIsModal
    >
      <View style={styles.modalBackdrop}>
        <Pressable
          testID="notebook-drawer-backdrop"
          accessibilityRole="button"
          style={styles.modalDismissArea}
          onPress={handleClose}
          accessibilityLabel={t('home.close_notebook')}
        />

        <View style={styles.journalDrawerSheet}>
          {activeView === 'passport' ? (
            /* BỘ SƯU TẬP HỘ CHIẾU NGÕ PHỐ (ALLEY PASSPORT SUBVIEW) */
            <>
              <View style={[styles.drawerHeaderRow, fontScale > 1.3 && styles.drawerHeaderRowStacked]}>
                <Pressable
                  testID="notebook-passport-back-btn"
                  onPress={() => setActiveView('menu')}
                  accessibilityRole="button"
                  accessibilityLabel={locale === 'en' ? 'Back to Notebook' : 'Quay lại Sổ tay'}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.backDrawerButton}
                >
                  <Text style={styles.backDrawerText}>‹</Text>
                </Pressable>
                <View style={styles.drawerTitleGroup}>
                  <Text style={styles.passportPhase}>{t('landing.passport_phase')}</Text>
                  <Text accessibilityRole="header" style={styles.drawerTitle} numberOfLines={2}>
                    {t('landing.passport_title')}
                  </Text>
                </View>
                <Pressable
                  testID="notebook-passport-close-btn"
                  onPress={handleClose}
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
            </>
          ) : (
            /* MENU SỔ TAY CHÍNH: CÔNG CỤ & QUẢN LÝ NGUỒN DỮ LIỆU */
            <>
              <View style={[styles.drawerHeaderRow, fontScale > 1.3 && styles.drawerHeaderRowStacked]}>
                <View style={styles.drawerTitleGroup}>
                  <Text style={styles.drawerPhase}>{t('home.notebook_phase')}</Text>
                  <Text accessibilityRole="header" style={styles.drawerTitle} numberOfLines={2}>
                    {t('home.notebook_title')}
                  </Text>
                </View>
                <Pressable
                  testID="notebook-drawer-close-btn"
                  onPress={handleClose}
                  accessibilityRole="button"
                  accessibilityLabel={t('home.close_notebook')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.closeDrawerButton}
                >
                  <Text style={styles.closeDrawerText}>✕</Text>
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={styles.drawerScrollContent}>
                {/* Lối tắt các tính năng chính */}
                <View style={styles.toolsGrid}>
                  <Pressable
                    testID="notebook-tool-plan"
                    accessibilityRole="button"
                    accessibilityLabel={t('home.tool_plan_label')}
                    onPress={() => {
                      handleClose();
                      navigation.navigate('Plan');
                    }}
                    style={({ pressed }) => [styles.toolGridCard, pressed && styles.pressed]}
                  >
                    <AppIcon name="compass" color="#2D5748" />
                    <Text style={styles.toolGridTitle}>{t('home.tool_plan_title')}</Text>
                    <Text style={styles.toolGridDesc}>{t('home.tool_plan_desc')}</Text>
                  </Pressable>

                  <Pressable
                    testID="notebook-tool-camera"
                    accessibilityRole="button"
                    accessibilityLabel={t('home.tool_qr_label')}
                    onPress={() => {
                      handleClose();
                      navigation.navigate('Camera');
                    }}
                    style={({ pressed }) => [styles.toolGridCard, pressed && styles.pressed]}
                  >
                    <AppIcon name="qr" color="#2D5748" />
                    <Text style={styles.toolGridTitle}>{t('home.tool_qr_title')}</Text>
                    <Text style={styles.toolGridDesc}>{t('home.tool_qr_desc')}</Text>
                  </Pressable>

                  <Pressable
                    testID="notebook-tool-gps"
                    accessibilityRole="button"
                    accessibilityLabel={t('home.tool_gps_label')}
                    onPress={() => {
                      handleClose();
                      navigation.navigate('Location');
                    }}
                    style={({ pressed }) => [styles.toolGridCard, pressed && styles.pressed]}
                  >
                    <AppIcon name="pin" color="#2D5748" />
                    <Text style={styles.toolGridTitle}>{t('home.tool_gps_title')}</Text>
                    <Text style={styles.toolGridDesc}>{t('home.tool_gps_desc')}</Text>
                  </Pressable>

                  <Pressable
                    testID="notebook-tool-passport"
                    accessibilityRole="button"
                    accessibilityLabel={t('landing.passport_open_label')}
                    onPress={() => setActiveView('passport')}
                    style={({ pressed }) => [styles.toolGridCard, pressed && styles.pressed]}
                  >
                    <AppIcon name="book" color="#2D5748" />
                    <Text style={styles.toolGridTitle}>{t('landing.passport_title')}</Text>
                    <Text style={styles.toolGridDesc}>{t('landing.passport_desc')}</Text>
                  </Pressable>
                </View>

                {/* Quản lý nguồn dữ liệu Demo / Live */}
                <View style={styles.sourceBox} accessibilityLiveRegion="polite">
                  <View style={[styles.sourceHeaderRow, fontScale > 1.3 && styles.sourceHeaderRowStacked]}>
                    <Text style={styles.sourceSectionTitle}>{t('home.data_source')}</Text>
                    <View style={styles.modeToggleGroup}>
                      {(['demo', 'live'] as const).map((val) => (
                        <Pressable
                          key={val}
                          testID={`notebook-mode-${val}`}
                          accessibilityRole="radio"
                          accessibilityLabel={val === 'demo' ? t('home.mode_demo') : t('home.mode_live')}
                          accessibilityState={{ checked: mode === val }}
                          onPress={() => onModeChange(val)}
                          style={({ pressed }) => [
                            styles.modeOption,
                            mode === val && styles.modeOptionActive,
                            pressed && styles.pressed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.modeOptionText,
                              mode === val && styles.modeOptionTextActive,
                            ]}
                          >
                            {val === 'demo' ? 'Demo' : 'Live'}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {(liveBusy || source.status !== 'ready') && (
                    <>
                      <Text style={styles.sourceTitle}>
                        {liveBusy ? (locale === 'en' ? 'Fetching live data…' : 'Đang lấy dữ liệu live…') : source.title}
                      </Text>
                      <Text style={styles.sourceBody}>
                        {liveBusy
                          ? (locale === 'en' ? 'Connecting for live content…' : 'Đang kết nối để tải dữ liệu trực tiếp…')
                          : source.detail}
                      </Text>
                    </>
                  )}

                  {source.mode === 'live' && onRetryLive !== undefined && (
                    <Pressable
                      testID="notebook-retry-live-btn"
                      accessibilityRole="button"
                      accessibilityLabel={t('home.retry_live_label')}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      onPress={onRetryLive}
                      disabled={liveBusy}
                      style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}
                    >
                      <Text style={styles.retryBtnText}>{t('home.retry_live')}</Text>
                    </Pressable>
                  )}
                </View>

                {guide !== null && <AlleyGuideSection guide={guide} />}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 12, 10, 0.72)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  journalDrawerSheet: {
    backgroundColor: '#FFFDF8',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '82%',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + 12,
    borderTopWidth: 1,
    borderColor: '#EFE5D4',
  },
  drawerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  drawerHeaderRowStacked: {
    alignItems: 'flex-start',
  },
  drawerTitleGroup: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    marginRight: spacing.sm,
  },
  drawerPhase: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C5A40',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2C221E',
  },
  backDrawerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFE8DA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  backDrawerText: {
    fontSize: 24,
    lineHeight: 26,
    color: '#4A3B32',
    fontWeight: '700',
  },
  closeDrawerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFE8DA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeDrawerText: {
    fontSize: 14,
    color: '#4A3B32',
    fontWeight: '700',
  },
  drawerScrollContent: {
    gap: spacing.md,
  },
  toolsGrid: {
    gap: spacing.sm,
  },
  toolGridCard: {
    backgroundColor: '#F8F3E9',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E8DEC9',
    gap: 3,
    minHeight: 56,
  },
  toolGridTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C221E',
  },
  toolGridDesc: {
    fontSize: 12,
    color: '#6E5D4F',
    lineHeight: 16,
  },
  sourceBox: {
    backgroundColor: '#F5ECE0',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E6D7C2',
    gap: 6,
  },
  sourceHeaderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sourceHeaderRowStacked: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  sourceSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5C483D',
  },
  modeToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#EADBC8',
    borderRadius: radius.pill,
    padding: 2,
    alignItems: 'center',
  },
  modeOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    minHeight: 48,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeOptionActive: {
    backgroundColor: '#2A6F50',
  },
  modeOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5C483D',
  },
  modeOptionTextActive: {
    color: '#FFFFFF',
  },
  sourceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C221E',
  },
  sourceBody: {
    fontSize: 12,
    color: '#6E5D4F',
    lineHeight: 16,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#2A6F50',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.sm,
    marginTop: 4,
    minHeight: 44,
    justifyContent: 'center',
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  passportPhase: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C5A40',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  passportGuideText: {
    fontSize: 12,
    color: '#6E5D4F',
    lineHeight: 18,
    backgroundColor: '#F5ECE0',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E6D7C2',
  },
  passportAlleySection: {
    gap: spacing.xs,
  },
  passportAlleyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passportAlleyName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C221E',
  },
  badgeSamplePill: {
    backgroundColor: '#8C5A40',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  badgeSampleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFDF7',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  passportAlleyDistrict: {
    fontSize: 12,
    color: '#8C7D70',
  },
  passportStopsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 6,
  },
  passportStampSlot: {
    width: 52,
    alignItems: 'center',
    gap: 4,
  },
  stampDottedCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#C4B5A0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDFBF7',
  },
  stampNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A0907C',
  },
  stampSlotLabel: {
    fontSize: 12,
    color: '#8C7D70',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});
