import type { ReactElement } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from './AppIcon';
import type { VoiceStage } from '../voice/useVoiceSession';
import { meteringToLevel } from '../voice/metering';

interface Props {
  stage: VoiceStage;
  error: string | null;
  recordingDurationMs: number;
  metering?: number;
  onStartRecording: () => void;
  onSubmitRecording: () => void;
  onCancel: () => void;
  onOpenInput: () => void;
  onQuickAction?: () => void;
  quickActionLabel?: string;
}

function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function VoiceInteractionDock({
  stage, error, recordingDurationMs, metering, onStartRecording, onSubmitRecording,
  onCancel, onOpenInput, onQuickAction, quickActionLabel = 'Sổ tay',
}: Props): ReactElement {
  const level = meteringToLevel(metering);
  const busy = stage === 'preparing' || stage === 'stopping' || stage === 'transcribing';

  return (
    <View style={styles.dock} accessibilityRole="toolbar" accessibilityLabel="Hỏi người kể">
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
            accessibilityLabel={stage === 'error' ? 'Thu lại câu hỏi bằng giọng nói' : 'Bắt đầu hỏi bằng giọng nói'}
            onPress={onStartRecording}
            style={({ pressed }) => [styles.micButton, pressed && styles.pressed]}
          >
            <AppIcon name="mic" size={25} color="#24392E" />
          </Pressable>
        )}

        <View style={styles.statusBlock}>
          {stage === 'recording' ? (
            <>
              <Text style={styles.title}>Đang thu · {formatDuration(recordingDurationMs)}</Text>
              <View
                style={styles.meterTrack}
                accessible
                accessibilityRole="progressbar"
                accessibilityLabel="Mức âm thanh đang thu"
                accessibilityValue={{ min: 0, max: 100, now: Math.round(level * 100) }}
              >
                <View style={[styles.meterFill, { width: `${Math.round(level * 100)}%` }]} />
              </View>
            </>
          ) : stage === 'ready' ? (
            <>
              <Text style={styles.title}>Đã thu xong · {formatDuration(recordingDurationMs)}</Text>
              <Text style={styles.subtitle}>Chạm Gửi để hỏi tiếp</Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>
                {stage === 'preparing' ? 'Đang bật micro…'
                  : stage === 'stopping' ? 'Đang lưu câu nói…'
                    : stage === 'transcribing' ? 'Đang nghe câu hỏi…'
                      : stage === 'error' ? 'Thử lại bằng giọng nói' : 'Nhấn để hỏi'}
              </Text>
              <Text style={styles.subtitle}>
                {busy ? 'Bạn có thể hủy bất cứ lúc nào' : 'Nghe lời kể rồi hỏi tiếp'}
              </Text>
            </>
          )}
        </View>

        {busy || stage === 'recording' || stage === 'ready' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={stage === 'recording' || stage === 'ready' ? 'Gửi câu hỏi' : 'Hủy lượt hỏi'}
            onPress={stage === 'recording' || stage === 'ready' ? onSubmitRecording : onCancel}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
          >
            <Text style={styles.actionText}>{stage === 'recording' || stage === 'ready' ? 'Gửi' : 'Hủy'}</Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mở ô gõ câu hỏi"
            onPress={onOpenInput}
            style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}
          >
            <AppIcon name="text" size={19} />
            <Text style={styles.textButtonLabel}>Gõ</Text>
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
        <Pressable accessibilityRole="button" accessibilityLabel="Hủy bản ghi" onPress={onCancel} style={styles.cancelLink}>
          <Text style={styles.cancelText}>Hủy bản ghi</Text>
        </Pressable>
      )}
      {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
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
  cancelLink: { alignSelf: 'flex-end', minHeight: 40, justifyContent: 'center', paddingHorizontal: 10 },
  cancelText: { color: '#E8DCC0', fontSize: 13, fontWeight: '600' },
  error: { color: '#F3D4BF', fontSize: 13, lineHeight: 18, paddingHorizontal: 6, paddingTop: 6 },
  pressed: { opacity: 0.7 },
});
