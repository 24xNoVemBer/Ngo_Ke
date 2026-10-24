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
import { AppIcon } from './AppIcon';
import { useLocale } from '../context/LocaleContext';
import { useMotionState } from '../hooks/MotionPreferences';
import { getBundledDataset, type CollectionId } from '../data/collections';
import { readAlleyGuide } from '../data/alleyGuide';
import { AlleyGuideSection } from './AlleyGuideSection';
import type { Mode, SourceState } from '../data/sourceState';
import { colors, radius, spacing } from '../theme';

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

  const activeDataset =
    mode === 'demo'
      ? (collectionId ? getBundledDataset(collectionId, locale)
        : source.mode === 'demo' && source.status === 'ready' ? source.dataset : undefined)
      : source.mode === 'live' && source.status === 'ready'
        ? source.dataset : undefined;
  const guide = activeDataset ? readAlleyGuide(activeDataset) : null;

  return (
    <Modal
      visible={visible}
      animationType={motion.reducedMotion ? 'none' : 'slide'}
      transparent
      onRequestClose={onClose}
      testID="notebook-drawer-modal"
      accessibilityViewIsModal
    >
      <View style={styles.modalBackdrop}>
        <Pressable
          testID="notebook-drawer-backdrop"
          accessibilityRole="button"
          style={styles.modalDismissArea}
          onPress={onClose}
          accessibilityLabel={t('home.close_notebook')}
        />

        <View style={styles.journalDrawerSheet}>
          <View style={[styles.drawerHeaderRow, fontScale > 1.3 && styles.drawerHeaderRowStacked]}>
            <View style={styles.drawerTitleGroup}>
              <Text style={styles.drawerPhase}>{t('home.notebook_phase')}</Text>
              <Text accessibilityRole="header" style={styles.drawerTitle} numberOfLines={2}>
                {t('home.notebook_title')}
              </Text>
            </View>
            <Pressable
              testID="notebook-drawer-close-btn"
              onPress={onClose}
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
                  onClose();
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
                  onClose();
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
                  onClose();
                  navigation.navigate('Location');
                }}
                style={({ pressed }) => [styles.toolGridCard, pressed && styles.pressed]}
              >
                <AppIcon name="pin" color="#2D5748" />
                <Text style={styles.toolGridTitle}>{t('home.tool_gps_title')}</Text>
                <Text style={styles.toolGridDesc}>{t('home.tool_gps_desc')}</Text>
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

            {/* Mục Khám phá thêm trong Sổ tay: Quán nên thử, Nên ghé thăm, Hành trình đề xuất */}
            {guide !== null && <AlleyGuideSection guide={guide} />}
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
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '85%',
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
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
    borderBottomColor: colors.journalDivider,
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
  drawerPhase: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C5A40',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C221E',
    letterSpacing: 0.3,
  },
  closeDrawerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5ECE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeDrawerText: {
    color: '#4A3B32',
    fontSize: 16,
    fontWeight: '700',
  },
  drawerScrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  toolsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  toolGridCard: {
    flex: 1,
    backgroundColor: colors.toolCardBg,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.toolCardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 76,
  },
  toolGridTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2C221E',
    textAlign: 'center',
  },
  toolGridDesc: {
    fontSize: 10,
    color: colors.toolCardDesc,
    textAlign: 'center',
    lineHeight: 12,
  },
  sourceBox: {
    backgroundColor: '#F5ECE0',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: '#E6D7C2',
  },
  sourceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceHeaderRowStacked: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  sourceSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A3B32',
  },
  modeToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#EAE1D1',
    borderRadius: radius.pill,
    padding: 2,
    borderWidth: 1,
    borderColor: '#D4C5B0',
  },
  modeOption: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeOptionActive: {
    backgroundColor: '#2A6F50',
  },
  modeOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6E5D4F',
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
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});
