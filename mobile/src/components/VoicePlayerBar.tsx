import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from './AppIcon';

type Props = {
  label: string;
  active: boolean;
  playing: boolean;
  currentTime: number;
  duration: number;
  measuredDuration: number;
  onPlay: () => void;
  onReplay: () => void;
  onStop: () => void;
};

function timeLabel(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

export function VoicePlayerBar({
  label, active, playing, currentTime, duration, measuredDuration, onPlay, onReplay, onStop,
}: Props): ReactElement {
  const total = duration > 0 ? duration : measuredDuration;
  const progress = active && total > 0 ? Math.min(1, currentTime / total) : 0;
  return (
    <View style={styles.card} accessibilityRole="toolbar" accessibilityLabel={label}>
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" accessibilityLabel={playing && active ? 'Tạm dừng lời kể' : `Phát ${label}`}
          onPress={onPlay} style={({ pressed }) => [styles.playButton, pressed && styles.pressed]}>
          <AppIcon name={playing && active ? 'pause' : 'play'} size={20} color="#24392E" />
        </Pressable>
        <View style={styles.trackInfo}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.time}>{active ? timeLabel(currentTime) : 'Sẵn sàng'} · {timeLabel(total)}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={`Nghe lại ${label}`} onPress={onReplay}
          style={({ pressed }) => [styles.smallButton, pressed && styles.pressed]}>
          <AppIcon name="replay" size={18} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Dừng ${label}`} onPress={onStop}
          style={({ pressed }) => [styles.smallButton, pressed && styles.pressed]}>
          <AppIcon name="stop" size={18} />
        </Pressable>
      </View>
      <View
        style={styles.progressTrack}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`Tiến trình phát ${Math.round(progress * 100)} phần trăm`}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
      >
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, borderRadius: 18, backgroundColor: '#20372D', borderWidth: 1, borderColor: 'rgba(242,197,107,0.28)' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  playButton: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2C56B' },
  trackInfo: { flex: 1, minWidth: 0, gap: 3 },
  label: { color: '#FFFDF7', fontSize: 14, fontWeight: '700' },
  time: { color: '#D3D4C7', fontSize: 12, fontVariant: ['tabular-nums'] },
  smallButton: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#31483A' },
  progressTrack: { height: 4, marginTop: 10, overflow: 'hidden', borderRadius: 4, backgroundColor: '#536255' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#F2C56B' },
  pressed: { opacity: 0.72 },
});
