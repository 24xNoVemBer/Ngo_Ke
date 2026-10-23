import type { ReactElement } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from './AppIcon';
import { useLocale } from '../context/LocaleContext';

export interface ToolDockProps {
  onPressGps: () => void;
  onPressQr: () => void;
  onPressNotebook: () => void;
  testIDPrefix?: 'landing' | 'home';
}

export function ToolDock({
  onPressGps,
  onPressQr,
  onPressNotebook,
  testIDPrefix,
}: ToolDockProps): ReactElement {
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const { locale, t } = useLocale();

  const gpsLabel = locale === 'en' ? 'Location' : 'Vị trí';
  const qrLabel = locale === 'en' ? 'Scan QR' : 'Quét QR';
  const notebookLabel = locale === 'en' ? 'Notebook' : 'Sổ tay';

  const gpsA11y = locale === 'en' ? 'GPS Location' : 'Vị trí GPS';
  const qrA11y = locale === 'en' ? 'Scan QR Code' : 'Quét mã QR';
  const notebookA11y = t('home.notebook_label') || (locale === 'en' ? 'Open Notebook' : 'Mở Sổ tay');

  const bottomInset = Math.max(insets.bottom, 12);

  const prefix = testIDPrefix ?? 'dock';

  return (
    <View
      testID={`${prefix}-tool-dock`}
      style={[styles.dockWrapper, { paddingBottom: bottomInset }]}
      pointerEvents="box-none"
    >
      <View testID="tool-dock" style={styles.dockBar}>
        {/* Item 1 (Trái): Vị trí GPS */}
        <Pressable
          testID={`${prefix}-dock-gps`}
          accessibilityRole="button"
          accessibilityLabel={gpsA11y}
          onPress={onPressGps}
          style={({ pressed }) => [styles.dockItem, pressed && styles.pressed]}
        >
          <View style={styles.iconContainer}>
            <AppIcon name="pin" size={24} color="#FFFDF7" />
          </View>
          <Text
            style={styles.dockItemText}
            numberOfLines={fontScale > 1.3 ? 2 : 1}
          >
            {gpsLabel}
          </Text>
        </Pressable>

        {/* Item 2 (Giữa): Quét QR nổi bật */}
        <Pressable
          testID={`${prefix}-dock-qr`}
          accessibilityRole="button"
          accessibilityLabel={qrA11y}
          onPress={onPressQr}
          style={({ pressed }) => [
            styles.dockItem,
            styles.dockItemCenter,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.centerIconBadge}>
            <AppIcon name="qr" size={24} color="#FFFDF7" />
          </View>
          <Text
            style={[styles.dockItemText, styles.dockItemCenterText]}
            numberOfLines={fontScale > 1.3 ? 2 : 1}
          >
            {qrLabel}
          </Text>
        </Pressable>

        {/* Item 3 (Phải): Sổ tay */}
        <Pressable
          testID={`${prefix}-notebook`}
          accessibilityRole="button"
          accessibilityLabel={notebookA11y}
          onPress={onPressNotebook}
          style={({ pressed }) => [styles.dockItem, pressed && styles.pressed]}
        >
          <View style={styles.iconContainer}>
            <AppIcon name="write" size={24} color="#FFFDF7" />
          </View>
          <Text
            style={styles.dockItemText}
            numberOfLines={fontScale > 1.3 ? 2 : 1}
          >
            {notebookLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dockWrapper: {
    paddingHorizontal: 16,
    paddingTop: 6,
    zIndex: 20,
  },
  dockBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(26, 18, 14, 0.86)',
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(255, 235, 205, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    minHeight: 56,
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  dockItem: {
    flex: 1,
    minHeight: 48,
    minWidth: 44,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dockItemCenter: {
    flex: 1.15,
    minHeight: 60,
    backgroundColor: 'rgba(42, 111, 80, 0.82)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 253, 247, 0.30)',
    paddingVertical: 5,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerIconBadge: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockItemText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFDF7',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  dockItemCenterText: {
    color: '#FFFDF7',
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
});
