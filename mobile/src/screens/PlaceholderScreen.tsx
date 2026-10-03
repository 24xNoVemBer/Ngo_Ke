import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { areas, type RootStackParamList } from '../navigation';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Placeholder'>;

export function PlaceholderScreen({ route, navigation }: Props): ReactElement {
  const area = areas[route.params.area];
  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.phase}>Phase {area.phase} · Chưa được triển khai</Text>
        <Text accessibilityRole="header" style={styles.title}>{area.title}</Text>
        <Text style={styles.body}>{area.detail}</Text>
        <Text style={styles.body}>
          Đây là màn khung để review navigation trong Phase 1. Chỉ làm hành vi sau khi phase tương ứng được duyệt.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.popToTop()}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Về Home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, gap: 24, maxWidth: 640, width: '100%', alignSelf: 'center' },
  phase: { fontSize: 14, color: colors.accent, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  body: { fontSize: 17, lineHeight: 26, color: colors.muted },
  button: { minHeight: 52, backgroundColor: colors.accent, borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 17, fontWeight: '600', color: colors.surface },
  pressed: { opacity: 0.72 },
});
