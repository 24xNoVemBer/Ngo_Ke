import { useEffect, type ReactElement } from 'react';
import { AccessibilityInfo, ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from './AppIcon';
import type { VoiceStage } from '../voice/useVoiceSession';
import { meteringToLevel } from '../voice/metering';
import { useLocale } from '../context/LocaleContext';

interface Props {
  stage: VoiceStage;
  error: string | null;
  recordingDurationMs: number;
  metering?: number;
  onStartRecording: () => void;
  onSubmitRecording: () => void;
  onCancel: () => void;
  onOpenInput: () => void;
  onOpenSettings?: () => void;
  onQuickAction?: () => void;
  quickActionLabel?: string;
}

function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function VoiceInteractionDock({
  stage, error, recordingDurationMs, metering, onStartRecording, onSubmitRecording,
  onCancel, onOpenInput, onOpenSettings, onQuickAction, quickActionLabel = 'Sổ tay',
}: Props): ReactElement {
  const { t, locale } = useLocale();
  const level = meteringToLevel(metering);
  const busy = stage === 'preparing' || stage === 'stopping' || stage === 'transcribing';

  useEffect(() => {
    const announcement = stage === 'preparing' ? t('voice.stage.preparing')
      : stage === 'recording' ? t('voice.stage.recording')
        : stage === 'ready' ? t('voice.stage.ready')
          : stage === 'stopping' ? t('voice.stage.stopping')
            : stage === 'transcribing' ? t('voice.stage.transcribing') : null;
    if (announcement) AccessibilityInfo.announceForAccessibility(announcement);
  }, [stage]);

  return (
    <View style={styles.dock} accessibilityRole="toolbar" accessibilityLabel={t('voice.dock.toolbar')}>
      <View style={styles.mainRow}>
        {stage === 'recording' || stage === 'ready' ? (
          <View style={styles.stateIcon}>
            {stage === 'recording' ? <View style={styles.recordDot} /> : <Text style={styles.readyMark}>✓</Text>}
          </View>
        ) : busy ? (
          <View style={styles.stateIcon}><ActivityIndicator color="#F2C56B" /></View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={stage === 'error' ? t('voice.dock.retry_recording') : t('voice.dock.start_recording')}
            onPress={onStartRecording}
            style={({ pressed }) => [styles.micButton, pressed && styles.pressed]}
          >
            <AppIcon name="mic" size={25} color="#24392E" />
          </Pressable>
        )}

        <View style={styles.statusBlock}>
          {stage === 'recording' ? (
            <>
              <Text style={styles.title}>{t('voice.dock.recording', { duration: formatDuration(recordingDurationMs) })}</Text>
              <View
                style={styles.meterTrack}
                accessible
                accessibilityRole="progressbar"
                accessibilityLabel={t('voice.dock.meter_label')}
                accessibilityValue={{ min: 0, max: 100, now: Math.round(level * 100) }}
              >
                <View style={[styles.meterFill, { width: `${Math.round(level * 100)}%` }]} />
              </View>
            </>
          ) : stage === 'ready' ? (
            <>
              <Text style={styles.title}>{t('voice.dock.ready', { duration: formatDuration(recordingDurationMs) })}</Text>
              <Text style={styles.subtitle}>{t('voice.dock.ready_subtitle')}</Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>
                {stage === 'preparing' ? t('voice.dock.preparing')
                  : stage === 'stopping' ? t('voice.dock.stopping')
                    : stage === 'transcribing' ? t('voice.dock.transcribing')
                      : stage === 'error' ? t('voice.dock.error_title') : t('voice.dock.idle_title')}
              </Text>
              <Text style={styles.subtitle}>
                {busy ? t('voice.dock.busy_subtitle') : t('voice.dock.idle_subtitle')}
              </Text>
            </>
          )}
        </View>

        {busy || stage === 'recording' || stage === 'ready' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={stage === 'recording' || stage === 'ready' ? t('voice.dock.submit') : t('voice.dock.cancel')}
            onPress={stage === 'recording' || stage === 'ready' ? onSubmitRecording : onCancel}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
          >
            <Text style={styles.actionText}>{stage === 'recording' || stage === 'ready' ? t('voice.dock.btn_submit') : t('voice.dock.btn_cancel')}</Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('voice.dock.type_question')}
            onPress={onOpenInput}
            style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}
          >
            <AppIcon name="text" size={19} />
            <Text style={styles.textButtonLabel}>{locale === 'en' ? 'Type' : 'Gõ'}</Text>
          </Pressable>
        )}

        {onQuickAction && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={quickActionLabel}
            onPress={onQuickAction}
            style={({ pressed }) => [styles.quickButton, pressed && styles.pressed]}
          >
            <AppIcon name="book" size={20} />
          </Pressable>
        )}
      </View>
      {(stage === 'recording' || stage === 'ready') && (
        <Pressable accessibilityRole="button" accessibilityLabel={locale === 'en' ? 'Cancel recording' : 'Hủy bản ghi'} onPress={onCancel} style={styles.cancelLink}>
          <Text style={styles.cancelText}>{locale === 'en' ? 'Cancel recording' : 'Hủy bản ghi'}</Text>
        </Pressable>
      )}
      {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
      {onOpenSettings && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={locale === 'en' ? 'Open Settings' : 'Mở cài đặt quyền micro'}
          onPress={onOpenSettings}
          style={styles.settingsLink}
        >
          <Text style={styles.settingsText}>{t('voice.dock.open_settings')}</Text>
        </Pressable>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  dock: { marginHorizontal: 16, padding: 9, backgroundColor: '#252D26', borderRadius: 22,
    borderWidth: 1, borderColor: 'rgba(255,253,247,0.22)' },
  mainRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  micButton: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2C56B' },
  stateIcon: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#31483A' },
  recordDot: { width: 13, height: 13, borderRadius: 7, backgroundColor: '#F2C56B' },
  readyMark: { color: '#F2C56B', fontSize: 25, fontWeight: '700' },
  statusBlock: { flex: 1, minWidth: 0, justifyContent: 'center', gap: 3 },
  title: { color: '#FFFDF7', fontSize: 15, fontWeight: '700' },
  subtitle: { color: '#D3D4C7', fontSize: 12 },
  meterTrack: { height: 5, marginTop: 3, overflow: 'hidden', borderRadius: 4, backgroundColor: '#526052' },
  meterFill: { height: '100%', borderRadius: 4, backgroundColor: '#F2C56B' },
  actionButton: { minWidth: 58, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingHorizontal: 12, backgroundColor: '#F2C56B' },
  actionText: { color: '#24392E', fontSize: 15, fontWeight: '700' },
  textButton: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center', gap: 1, borderRadius: 14, paddingHorizontal: 6 },
  textButtonLabel: { color: '#FFFDF7', fontSize: 11, fontWeight: '600' },
  quickButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#31483A' },
  cancelLink: { alignSelf: 'flex-end', minHeight: 48, justifyContent: 'center', paddingHorizontal: 10 },
  cancelText: { color: '#E8DCC0', fontSize: 13, fontWeight: '600' },
  error: { color: '#F3D4BF', fontSize: 13, lineHeight: 18, paddingHorizontal: 6, paddingTop: 6 },
  settingsLink: { alignSelf: 'flex-start', minHeight: 48, justifyContent: 'center', paddingHorizontal: 6 },
  settingsText: { color: '#F2C56B', fontSize: 13, fontWeight: '700' },
  pressed: { opacity: 0.7 },
});
