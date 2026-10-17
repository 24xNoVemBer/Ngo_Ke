/* eslint-disable @typescript-eslint/no-require-imports -- Metro statically analyzable sound asset */
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import {
  Animated,
  type GestureResponderEvent,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudioPlayer } from 'expo-audio';
import type { RootStackParamList } from '../navigation';
import { HERO_PHOTO } from '../assets/photoMap';
import { NgoKeLogo } from '../components/NgoKeLogo';
import { AppIcon } from '../components/AppIcon';
import { useEntranceFadeSlide, usePressSpring } from '../hooks/useMotion';
import { useMotionState } from '../hooks/MotionPreferences';
import { useLocale } from '../context/LocaleContext';
import { spacing } from '../theme';
import { motionEasings } from '../theme/motion';

const PROLOGUE_DOOR_SOUND = require('../../assets/sounds/prologue_door.wav');
const RIPPLE_SIZE = 80;
const RIPPLE_DURATION_MS = 520;

type Props = NativeStackScreenProps<RootStackParamList, 'Prologue'>;

export function PrologueScreen({ navigation }: Props): ReactElement {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const entering = useEntranceFadeSlide({ duration: 220, offsetY: 10 });
  const press = usePressSpring();
  const motion = useMotionState();
  const isFocused = useIsFocused();
  const player = useAudioPlayer(PROLOGUE_DOOR_SOUND);

  const mounted = useRef(true);
  const cancelled = useRef(false);
  const starting = useRef(false);
  const navigated = useRef(false);
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttonLayout = useRef({ width: 240, height: 56 });

  const [rippleActive, setRippleActive] = useState(false);
  const [rippleCenter, setRippleCenter] = useState({ x: 120, y: 28 });
  const rippleProgress = useRef(new Animated.Value(0)).current;

  const { locale, setLocale, t } = useLocale();

  // Clean up timers, animations, and sound playback on unmount
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancelled.current = true;
      if (navigationTimer.current) {
        clearTimeout(navigationTimer.current);
        navigationTimer.current = null;
      }
      rippleProgress.stopAnimation();
      try {
        player.pause();
      } catch {
        // Safe disposal
      }
    };
  }, [player, rippleProgress]);

  // Cancel in-flight ripple, timer, and pause audio when blurred or backgrounded so foreground can retry
  useEffect(() => {
    if (!isFocused || !motion.foreground) {
      cancelled.current = true;
      if (navigationTimer.current) {
        clearTimeout(navigationTimer.current);
        navigationTimer.current = null;
      }
      rippleProgress.stopAnimation();
      starting.current = false;
      setRippleActive(false);
      try {
        player.pause();
      } catch {
        // Safe disposal
      }
    }
  }, [isFocused, motion.foreground, player, rippleProgress]);

  function navigateOnce(): void {
    if (navigated.current || !mounted.current || cancelled.current) return;
    navigated.current = true;
    if (navigationTimer.current) {
      clearTimeout(navigationTimer.current);
      navigationTimer.current = null;
    }
    navigation.replace('Landing');
  }

  function handleStartJourney(event?: GestureResponderEvent): void {
    if (starting.current) return;
    starting.current = true;
    cancelled.current = false;

    // 1. Resolve tap coordinates (or fallback to button center for accessibility activation)
    const locX = event?.nativeEvent?.locationX;
    const locY = event?.nativeEvent?.locationY;
    const centerX =
      typeof locX === 'number' && Number.isFinite(locX) && locX >= 0
        ? locX
        : buttonLayout.current.width / 2;
    const centerY =
      typeof locY === 'number' && Number.isFinite(locY) && locY >= 0
        ? locY
        : buttonLayout.current.height / 2;

    setRippleCenter({ x: centerX, y: centerY });

    // 2. Play gentle door to discovery sound effect (failure must never block navigation)
    try {
      player.play();
    } catch {
      // Audio playback failure must never block navigation.
    }

    // 3. If reduced motion or inactive, avoid expanding waves and navigate promptly
    if (motion.reducedMotion || !motion.active) {
      navigateOnce();
      return;
    }

    // 4. Trigger expanding golden water ripple ("sóng nước màu vàng")
    setRippleActive(true);
    rippleProgress.setValue(0);

    Animated.timing(rippleProgress, {
      toValue: 1,
      duration: RIPPLE_DURATION_MS,
      easing: motionEasings.gentleOut,
      useNativeDriver: true,
    }).start((result) => {
      if (result?.finished && mounted.current && !cancelled.current) {
        navigateOnce();
      }
    });

    navigationTimer.current = setTimeout(() => {
      if (mounted.current && !cancelled.current) {
        navigateOnce();
      }
    }, RIPPLE_DURATION_MS + 40);
  }

  // Concentric water wave ripple interpolations
  const wave1Scale = rippleProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 4.2],
  });
  const wave1Opacity = rippleProgress.interpolate({
    inputRange: [0, 0.25, 0.7, 1],
    outputRange: [0.85, 0.75, 0.35, 0],
  });

  const wave2Scale = rippleProgress.interpolate({
    inputRange: [0, 0.15, 1],
    outputRange: [0.1, 0.1, 3.2],
  });
  const wave2Opacity = rippleProgress.interpolate({
    inputRange: [0, 0.15, 0.35, 0.8, 1],
    outputRange: [0, 0.8, 0.65, 0.25, 0],
  });

  const wave3Scale = rippleProgress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.1, 0.1, 2.2],
  });
  const wave3Opacity = rippleProgress.interpolate({
    inputRange: [0, 0.3, 0.5, 0.9, 1],
    outputRange: [0, 0.7, 0.5, 0.15, 0],
  });

  const crestScale = rippleProgress.interpolate({
    inputRange: [0, 0.2, 0.5],
    outputRange: [0.4, 1.2, 1.8],
    extrapolate: 'clamp',
  });
  const crestOpacity = rippleProgress.interpolate({
    inputRange: [0, 0.15, 0.45],
    outputRange: [0.9, 0.7, 0],
    extrapolate: 'clamp',
  });

  return (
    <ImageBackground source={HERO_PHOTO} style={styles.root} resizeMode="cover">
      <View style={styles.scrim} />
      <ScrollView
        contentContainerStyle={[
          styles.page,
          {
            minHeight: height,
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        {/* Language switch on first page */}
        <View style={styles.langSelectorRow}>
          <Pressable
            testID="locale-switch"
            accessibilityRole="button"
            accessibilityLabel="Chọn Tiếng Việt"
            accessibilityState={{ selected: locale === 'vi' }}
            onPress={() => setLocale('vi')}
            style={[styles.langPill, locale === 'vi' && styles.langPillActive]}
          >
            <Text style={[styles.langPillText, locale === 'vi' && styles.langPillTextActive]}>
              Tiếng Việt
            </Text>
          </Pressable>
          <Pressable
            testID="locale-switch"
            accessibilityRole="button"
            accessibilityLabel="Select English"
            accessibilityState={{ selected: locale === 'en' }}
            onPress={() => setLocale('en')}
            style={[styles.langPill, locale === 'en' && styles.langPillActive]}
          >
            <Text style={[styles.langPillText, locale === 'en' && styles.langPillTextActive]}>
              English
            </Text>
          </Pressable>
        </View>

        <Text style={styles.eyebrow}>{t('prologue.eyebrow')}</Text>

        <Animated.View
          style={[
            styles.brand,
            { opacity: entering.opacity, transform: [{ translateY: entering.translateY }] },
          ]}
        >
          <NgoKeLogo size="hero" variant="iconOnly" />
          <Text accessibilityRole="header" style={styles.title}>
            {t('prologue.title')}
          </Text>
          <Text style={styles.subtitle}>{t('prologue.subtitle')}</Text>
          <View style={styles.rule} />
          <Text style={styles.quote}>{t('prologue.quote')}</Text>
        </Animated.View>

        <View style={styles.action}>
          <Animated.View style={{ transform: [{ scale: press.scaleAnim }] }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('prologue.start_label')}
              onPressIn={press.handlePressIn}
              onPressOut={press.handlePressOut}
              onPress={handleStartJourney}
              onLayout={(e) => {
                const { width, height } = e.nativeEvent.layout;
                buttonLayout.current = { width, height };
              }}
              style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.buttonText}>{t('prologue.start_button')}</Text>
              <AppIcon name="arrow" />

              {/* Polished golden/yellow water ripple ("sóng nước màu vàng") */}
              {rippleActive && (
                <View
                  testID="prologue-ripple-overlay"
                  pointerEvents="none"
                  accessible={false}
                  importantForAccessibility="no"
                  aria-hidden={true}
                  style={styles.rippleOverlay}
                >
                  <Animated.View
                    testID="prologue-ripple-wave-1"
                    style={[
                      styles.rippleWave,
                      {
                        left: rippleCenter.x - RIPPLE_SIZE / 2,
                        top: rippleCenter.y - RIPPLE_SIZE / 2,
                        transform: [{ scale: wave1Scale }],
                        opacity: wave1Opacity,
                      },
                    ]}
                  />
                  <Animated.View
                    testID="prologue-ripple-wave-2"
                    style={[
                      styles.rippleWave,
                      styles.rippleWave2,
                      {
                        left: rippleCenter.x - RIPPLE_SIZE / 2,
                        top: rippleCenter.y - RIPPLE_SIZE / 2,
                        transform: [{ scale: wave2Scale }],
                        opacity: wave2Opacity,
                      },
                    ]}
                  />
                  <Animated.View
                    testID="prologue-ripple-wave-3"
                    style={[
                      styles.rippleWave,
                      styles.rippleWave3,
                      {
                        left: rippleCenter.x - RIPPLE_SIZE / 2,
                        top: rippleCenter.y - RIPPLE_SIZE / 2,
                        transform: [{ scale: wave3Scale }],
                        opacity: wave3Opacity,
                      },
                    ]}
                  />
                  <Animated.View
                    testID="prologue-ripple-crest"
                    style={[
                      styles.rippleCrest,
                      {
                        left: rippleCenter.x - 12,
                        top: rippleCenter.y - 12,
                        transform: [{ scale: crestScale }],
                        opacity: crestOpacity,
                      },
                    ]}
                  />
                </View>
              )}
            </Pressable>
          </Animated.View>
          <Text style={styles.hint}>{t('prologue.hint')}</Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#161814' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20,24,19,0.67)' },
  page: { flexGrow: 1, justifyContent: 'space-between', paddingHorizontal: spacing.lg, gap: 20 },
  langSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    alignSelf: 'center',
  },
  langPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(28, 20, 16, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 245, 230, 0.25)',
  },
  langPillActive: {
    backgroundColor: '#2D5748',
    borderColor: '#B9A589',
  },
  langPillText: {
    color: '#E8D5BC',
    fontSize: 13,
    fontWeight: '600',
  },
  langPillTextActive: {
    color: '#FFFDF7',
    fontWeight: '700',
  },
  eyebrow: { color: '#E8D5BC', fontSize: 12, letterSpacing: 1.5, textAlign: 'center' },
  brand: { alignItems: 'center', gap: 12, paddingVertical: 16 },
  title: { fontSize: 42, fontWeight: '900', color: '#FFFDF7', letterSpacing: 3, textAlign: 'center' },
  subtitle: { fontSize: 13, fontWeight: '600', color: '#E8D5BC', letterSpacing: 2, textAlign: 'center' },
  rule: { height: 1, width: 100, backgroundColor: '#B9A589', marginVertical: 12 },
  quote: { fontSize: 16, lineHeight: 26, fontStyle: 'italic', color: '#FFF8EB', textAlign: 'center', maxWidth: 420 },
  action: { alignItems: 'center', gap: 14 },
  button: {
    minHeight: 56,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 28,
    backgroundColor: '#2D5748',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#B9A589',
    overflow: 'hidden',
    position: 'relative',
  },
  buttonText: { flexShrink: 1, color: '#FFFDF7', fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  hint: { color: '#E8D5BC', fontSize: 13, textAlign: 'center' },
  rippleOverlay: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    borderRadius: 28,
  },
  rippleWave: {
    position: 'absolute',
    width: RIPPLE_SIZE,
    height: RIPPLE_SIZE,
    borderRadius: RIPPLE_SIZE / 2,
    borderWidth: 2,
    borderColor: '#F2C56B',
    backgroundColor: 'rgba(242, 197, 107, 0.16)',
  },
  rippleWave2: {
    borderWidth: 1.5,
    borderColor: '#F5D78E',
    backgroundColor: 'rgba(245, 215, 142, 0.09)',
  },
  rippleWave3: {
    borderWidth: 1,
    borderColor: '#FFF4D4',
    backgroundColor: 'rgba(255, 244, 212, 0.14)',
  },
  rippleCrest: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(242, 197, 107, 0.65)',
  },
});
