import { type ReactElement } from 'react';
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
import { getLocalizedCollections, type CollectionId } from '../data/collections';
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
  const { locale, collectionId: contextCollectionId, t } = useLocale();
  const motion = useMotionState();
  const { fontScale } = useWindowDimensions();

  const effectiveCollectionId = collectionId ?? contextCollectionId;
  const collections = getLocalizedCollections(locale);
  const activeCollection = collections.find((c) => c.id === effectiveCollectionId) ?? collections[0];
  const collectionKind =
    source.status === 'ready'
      ? ('kind' in source.dataset && source.dataset.kind === 'reviewed' ? 'reviewed' : 'simulated')
      : activeCollection?.kind === 'reviewed'
        ? 'reviewed'
        : 'simulated';

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

              <Text style={styles.sourceStateTag}>
                {source.mode === 'live'
                  ? liveBusy
                    ? (locale === 'en' ? 'LIVE · loading…' : 'LIVE · đang tải…')
                    : source.status === 'ready'
                      ? source.dataset.kind === 'reviewed'
                        ? (locale === 'en' ? 'LIVE · reviewed data' : 'LIVE · dữ liệu đã duyệt')
                        : (locale === 'en' ? 'LIVE · simulated data (unverified)' : 'LIVE · dữ liệu mô phỏng (chưa xác minh)')
                      : (locale === 'en' ? 'LIVE · no data' : 'LIVE · chưa có dữ liệu')
                  : collectionKind === 'reviewed'
                    ? (activeCollection?.id === 'old-quarter-three-lenses'
                        ? (locale === 'en' ? 'DEMO · Sourced · not officially approved' : 'DEMO · Có nguồn · chưa duyệt chính thức')
                        : (locale === 'en' ? 'DEMO · reviewed heritage' : 'DEMO · di sản đã duyệt'))
                    : (locale === 'en' ? 'DEMO · simulated content' : 'DEMO · nội dung mô phỏng')}
              </Text>
              <Text style={styles.sourceTitle}>
                {liveBusy ? (locale === 'en' ? 'Fetching live data…' : 'Đang lấy dữ liệu live…') : source.title}
              </Text>
              <Text style={styles.sourceBody}>
                {liveBusy
                  ? (locale === 'en' ? 'Connecting for live content…' : 'Đang kết nối để tải dữ liệu trực tiếp…')
                  : source.mode === 'demo'
                    ? (locale === 'en' ? 'Offline demo content is ready to explore.' : 'Dữ liệu ngoại tuyến sẵn sàng để khám phá.')
                    : source.detail}
              </Text>

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

              {source.status === 'ready' && (
                <Text style={styles.disclaimerNote}>{source.dataset.disclaimer}</Text>
              )}
            </View>
          </ScrollView>
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
  closeDrawerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    minHeight: 52,
  },
  toolGridTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C221E',
  },
  toolGridDesc: {
    fontSize: 11.5,
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
    fontSize: 11,
    fontWeight: '700',
    color: '#5C483D',
  },
  modeOptionTextActive: {
    color: '#FFFFFF',
  },
  sourceStateTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8C5A40',
    letterSpacing: 0.5,
  },
  sourceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C221E',
  },
  sourceBody: {
    fontSize: 11,
    color: '#6E5D4F',
    lineHeight: 15,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#2A6F50',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.sm,
    marginTop: 4,
    minHeight: 40,
    justifyContent: 'center',
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  disclaimerNote: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5C483D',
    lineHeight: 18,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});
