/* eslint-disable @typescript-eslint/no-require-imports -- Metro statically analyzable sound asset */
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import {
  Animated,
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
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';
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
const RIPPLE_DURATION_MS = 620;
const FLANK_WIDTH = 28;
const FLANK_HEIGHT = 68;

// Precise mathematical arcs for semicircular water ripples ((( button )))
// Two bilateral arcs per flank, max visible spread strictly bounded to 16–28dp outside button edge
// Left arcs curve like ( bulging outward to the left (toward -X)
const LEFT_ARC_1 = 'M 24 18 A 14 16 0 0 0 24 50';
const LEFT_ARC_2 = 'M 26 10 A 22 24 0 0 0 26 58';

// Right arcs curve like ) bulging outward to the right (toward +X)
const RIGHT_ARC_1 = 'M 4 18 A 14 16 0 0 1 4 50';
const RIGHT_ARC_2 = 'M 2 10 A 22 24 0 0 1 2 58';

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
  const starting = useRef(false);
  const navigated = useRef(false);
  const attemptToken = useRef(0);
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const buttonLayout = useRef({ width: 240, height: 56 });

  const [buttonSize, setButtonSize] = useState({ width: 240, height: 56 });
  const [rippleActive, setRippleActive] = useState(false);
  const rippleProgress = useRef(new Animated.Value(0)).current;

  const { locale, setLocale, t } = useLocale();

  function clearAllTimers(): void {
    if (navigationTimer.current) {
      clearTimeout(navigationTimer.current);
      navigationTimer.current = null;
    }
    if (fadeTimer.current) {
      clearTimeout(fadeTimer.current);
      fadeTimer.current = null;
    }
    if (fadeInterval.current) {
      clearInterval(fadeInterval.current);
      fadeInterval.current = null;
    }
  }

  // Clean up timers, animations, and sound playback on unmount
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      attemptToken.current += 1; // Invalidate any in-flight attempt before stopAnimation
      clearAllTimers();
      rippleProgress.stopAnimation();
      try {
        player.pause();
        if (typeof player.seekTo === 'function') {
          const seekRes = player.seekTo(0);
          if (seekRes && typeof (seekRes as Promise<void>).catch === 'function') {
            (seekRes as Promise<void>).catch(() => {});
          }
        }
      } catch {
        // Safe disposal
      }
    };
  }, [player, rippleProgress]);

  // Cancel in-flight ripple, timer, and pause audio when blurred or backgrounded so foreground can retry
  useEffect(() => {
    if (!isFocused || !motion.foreground) {
      attemptToken.current += 1; // Invalidate any in-flight attempt before stopAnimation
      clearAllTimers();
      rippleProgress.stopAnimation();
      starting.current = false;
      setRippleActive(false);
      try {
        player.pause();
        if (typeof player.seekTo === 'function') {
          const seekRes = player.seekTo(0);
          if (seekRes && typeof (seekRes as Promise<void>).catch === 'function') {
            (seekRes as Promise<void>).catch(() => {});
          }
        }
      } catch {
        // Safe disposal
      }
    }
  }, [isFocused, motion.foreground, player, rippleProgress]);

  function navigateOnce(token?: number): void {
    if (navigated.current || !mounted.current || !starting.current) return;
    if (token !== undefined && attemptToken.current !== token) return;
    navigated.current = true;
    clearAllTimers();
    navigation.replace('Landing');
  }

  function handleStartJourney(): void {
    // Early return press if already starting or if screen is hidden/blurred/backgrounded
    if (starting.current || !isFocused || !motion.foreground) return;
    starting.current = true;
    attemptToken.current += 1;
    const currentToken = attemptToken.current;
    clearAllTimers();

    // Reset volume to full on every new valid attempt
    try {
      if (typeof (player as { volume?: number }).volume === 'number') {
        (player as { volume?: number }).volume = 1;
      }
    } catch {
      // Volume reset guard
    }

    const playSafe = (): void => {
      if (
        !navigated.current &&
        mounted.current &&
        starting.current &&
        isFocused &&
        motion.foreground &&
        attemptToken.current === currentToken
      ) {
        try {
          player.play();
        } catch {
          // Audio playback failure must never block navigation.
        }
      }
    };

    // 1. Play gentle door to discovery sound effect with async seek reset guarded by attempt token
    if (typeof player.seekTo === 'function') {
      try {
        const seekRes = player.seekTo(0);
        if (seekRes && typeof (seekRes as Promise<void>).then === 'function') {
          (seekRes as Promise<void>)
            .then(() => {
              playSafe();
            })
            .catch(() => {
              playSafe();
            });
        } else {
          playSafe();
        }
      } catch {
        playSafe();
      }
    } else {
      playSafe();
    }

    // 2. If reduced motion or inactive, avoid expanding waves and navigate promptly
    if (motion.reducedMotion || !motion.active) {
      navigateOnce(currentToken);
      return;
    }

    // 3. Trigger outward semicircular golden water ripple waves ((( button )))
    setRippleActive(true);
    rippleProgress.setValue(0);

    Animated.timing(rippleProgress, {
      toValue: 1,
      duration: RIPPLE_DURATION_MS,
      easing: motionEasings.gentleOut,
      useNativeDriver: true,
    }).start((result) => {
      if (
        result?.finished &&
        mounted.current &&
        starting.current &&
        attemptToken.current === currentToken
      ) {
        navigateOnce(currentToken);
      }
    });

    // Smooth volume fade initiated toward the conclusion of the 620ms signature wave (~460ms-620ms)
    const ownFadeTimer = setTimeout(() => {
      if (fadeTimer.current === ownFadeTimer) {
        fadeTimer.current = null;
      }
      if (
        mounted.current &&
        starting.current &&
        !navigated.current &&
        attemptToken.current === currentToken
      ) {
        let currentVol = 1.0;
        const ownInterval = setInterval(() => {
          if (attemptToken.current !== currentToken || !mounted.current || !starting.current || navigated.current) {
            clearInterval(ownInterval);
            if (fadeInterval.current === ownInterval) {
              fadeInterval.current = null;
            }
            return;
          }
          currentVol = Math.max(0, currentVol - 0.25);
          try {
            if (typeof (player as { volume?: number }).volume === 'number') {
              (player as { volume?: number }).volume = currentVol;
            }
          } catch {
            // Guard
          }
          if (currentVol <= 0) {
            clearInterval(ownInterval);
            if (fadeInterval.current === ownInterval) {
              fadeInterval.current = null;
            }
          }
        }, 35);
        fadeInterval.current = ownInterval;
      }
    }, 460);
    fadeTimer.current = ownFadeTimer;

    const ownNavTimer = setTimeout(() => {
      if (navigationTimer.current === ownNavTimer) {
        navigationTimer.current = null;
      }
      if (
        mounted.current &&
        starting.current &&
        attemptToken.current === currentToken
      ) {
        navigateOnce(currentToken);
      }
    }, RIPPLE_DURATION_MS);
    navigationTimer.current = ownNavTimer;
  }

  // Semicircular water wave ripple interpolations (staggered outward propagation across two arcs per flank)
  const leftWave1TranslateX = rippleProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [2, -2],
  });
  const leftWave2TranslateX = rippleProgress.interpolate({
    inputRange: [0, 0.15, 1],
    outputRange: [2, 2, -4],
  });

  const rightWave1TranslateX = rippleProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-2, 2],
  });
  const rightWave2TranslateX = rippleProgress.interpolate({
    inputRange: [0, 0.15, 1],
    outputRange: [-2, -2, 4],
  });

  const wave1Scale = rippleProgress.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.9, 1.02, 1.08],
  });
  const wave1Opacity = rippleProgress.interpolate({
    inputRange: [0, 0.15, 0.6, 1],
    outputRange: [0.3, 0.85, 0.35, 0],
  });

  const wave2Scale = rippleProgress.interpolate({
    inputRange: [0, 0.15, 0.6, 1],
    outputRange: [0.85, 0.92, 1.04, 1.12],
  });
  const wave2Opacity = rippleProgress.interpolate({
    inputRange: [0, 0.15, 0.35, 0.75, 1],
    outputRange: [0, 0.25, 0.75, 0.25, 0],
  });

  return (
    <ImageBackground source={HERO_PHOTO} style={styles.root} resizeMode="cover">
      <View style={styles.scrim} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            minHeight: height,
            paddingTop: Math.max(insets.top, 16) + 8,
            paddingBottom: Math.max(insets.bottom, 24) + 16,
            paddingLeft: Math.max(insets.left, spacing.md),
            paddingRight: Math.max(insets.right, spacing.md),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerContainer}>
          {/* 1. Header Region: Language controls with >=48dp touch target and responsive wrap */}
          <View style={styles.headerRegion}>
            <View style={styles.langSelectorRow}>
              <Pressable
                testID="locale-switch"
                accessibilityRole="button"
                accessibilityLabel="Chọn Tiếng Việt"
                accessibilityState={{ selected: locale === 'vi' }}
                onPress={() => setLocale('vi')}
                style={({ pressed }) => [
                  styles.langPill,
                  locale === 'vi' && styles.langPillActive,
                  pressed && styles.langPillPressed,
                ]}
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
                style={({ pressed }) => [
                  styles.langPill,
                  locale === 'en' && styles.langPillActive,
                  pressed && styles.langPillPressed,
                ]}
              >
                <Text style={[styles.langPillText, locale === 'en' && styles.langPillTextActive]}>
                  English
                </Text>
              </Pressable>
            </View>
          </View>

          {/* 2. Brand Region: Eyebrow, Logo, Title, Subtitle, Divider, and Quote as a coherent cluster */}
          <Animated.View
            style={[
              styles.brandCluster,
              { opacity: entering.opacity, transform: [{ translateY: entering.translateY }] },
            ]}
          >
            <Text style={styles.eyebrow}>{t('prologue.eyebrow')}</Text>
            <NgoKeLogo size="hero" variant="iconOnly" />
            <Text accessibilityRole="header" style={styles.title}>
              {t('prologue.title')}
            </Text>
            <Text style={styles.subtitle}>{t('prologue.subtitle')}</Text>
            <View style={styles.rule} />
            <Text style={styles.quote}>{t('prologue.quote')}</Text>
          </Animated.View>

          {/* 3. Action Region: CTA and hint with ample breathing room and 28dp flank clearance */}
          <View style={styles.actionRegion}>
            <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: press.scaleAnim }] }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('prologue.start_label')}
                onPressIn={press.handlePressIn}
                onPressOut={press.handlePressOut}
                onPress={handleStartJourney}
                onLayout={(e) => {
                  const { width, height: btnHeight } = e.nativeEvent.layout;
                  buttonLayout.current = { width, height: btnHeight };
                  setButtonSize({ width, height: btnHeight });
                }}
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              >
                <Text style={styles.buttonText}>{t('prologue.start_button')}</Text>
                <AppIcon name="arrow" />
              </Pressable>

              {/* Semicircular golden water ripple arcs radiating outside each button flank ((( button ))) */}
              {rippleActive && (
                <View
                  testID="prologue-ripple-overlay"
                  pointerEvents="none"
                  accessible={false}
                  importantForAccessibility="no"
                  aria-hidden={true}
                  style={[
                    styles.rippleOverlay,
                    {
                      width: buttonSize.width,
                      height: buttonSize.height,
                    },
                  ]}
                >
                  {/* Left flank ripple waves ((( */}
                  <View testID="prologue-ripple-left-flank" style={styles.leftFlank}>
                    <Animated.View
                      testID="prologue-ripple-wave-left-1"
                      style={[
                        styles.waveContainer,
                        {
                          transform: [{ translateX: leftWave1TranslateX }, { scale: wave1Scale }],
                          opacity: wave1Opacity,
                        },
                      ]}
                    >
                      <Svg width={FLANK_WIDTH} height={FLANK_HEIGHT} viewBox={`0 0 ${FLANK_WIDTH} ${FLANK_HEIGHT}`}>
                        <Defs>
                          <LinearGradient id="glow-l1" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="#E8BA5A" stopOpacity="0" />
                            <Stop offset="0.25" stopColor="#E8BA5A" stopOpacity="0.25" />
                            <Stop offset="0.5" stopColor="#E8BA5A" stopOpacity="0.30" />
                            <Stop offset="0.75" stopColor="#E8BA5A" stopOpacity="0.25" />
                            <Stop offset="1" stopColor="#E8BA5A" stopOpacity="0" />
                          </LinearGradient>
                          <LinearGradient id="core-l1" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="#F4D086" stopOpacity="0" />
                            <Stop offset="0.25" stopColor="#F4D086" stopOpacity="0.85" />
                            <Stop offset="0.5" stopColor="#F4D086" stopOpacity="1" />
                            <Stop offset="0.75" stopColor="#F4D086" stopOpacity="0.85" />
                            <Stop offset="1" stopColor="#F4D086" stopOpacity="0" />
                          </LinearGradient>
                        </Defs>
                        <Path d={LEFT_ARC_1} stroke="url(#glow-l1)" strokeWidth={3.4} strokeLinecap="round" fill="none" />
                        <Path d={LEFT_ARC_1} stroke="url(#core-l1)" strokeWidth={1.6} strokeLinecap="round" fill="none" />
                      </Svg>
                    </Animated.View>
                    <Animated.View
                      testID="prologue-ripple-wave-left-2"
                      style={[
                        styles.waveContainer,
                        {
                          transform: [{ translateX: leftWave2TranslateX }, { scale: wave2Scale }],
                          opacity: wave2Opacity,
                        },
                      ]}
                    >
                      <Svg width={FLANK_WIDTH} height={FLANK_HEIGHT} viewBox={`0 0 ${FLANK_WIDTH} ${FLANK_HEIGHT}`}>
                        <Defs>
                          <LinearGradient id="glow-l2" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="#E8BA5A" stopOpacity="0" />
                            <Stop offset="0.25" stopColor="#E8BA5A" stopOpacity="0.20" />
                            <Stop offset="0.5" stopColor="#E8BA5A" stopOpacity="0.25" />
                            <Stop offset="0.75" stopColor="#E8BA5A" stopOpacity="0.20" />
                            <Stop offset="1" stopColor="#E8BA5A" stopOpacity="0" />
                          </LinearGradient>
                          <LinearGradient id="core-l2" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="#F4D086" stopOpacity="0" />
                            <Stop offset="0.25" stopColor="#F4D086" stopOpacity="0.75" />
                            <Stop offset="0.5" stopColor="#F4D086" stopOpacity="0.9" />
                            <Stop offset="0.75" stopColor="#F4D086" stopOpacity="0.75" />
                            <Stop offset="1" stopColor="#F4D086" stopOpacity="0" />
                          </LinearGradient>
                        </Defs>
                        <Path d={LEFT_ARC_2} stroke="url(#glow-l2)" strokeWidth={2.8} strokeLinecap="round" fill="none" />
                        <Path d={LEFT_ARC_2} stroke="url(#core-l2)" strokeWidth={1.2} strokeLinecap="round" fill="none" />
                      </Svg>
                    </Animated.View>
                  </View>

                  {/* Right flank ripple waves ))) */}
                  <View testID="prologue-ripple-right-flank" style={styles.rightFlank}>
                    <Animated.View
                      testID="prologue-ripple-wave-right-1"
                      style={[
                        styles.waveContainer,
                        {
                          transform: [{ translateX: rightWave1TranslateX }, { scale: wave1Scale }],
                          opacity: wave1Opacity,
                        },
                      ]}
                    >
                      <Svg width={FLANK_WIDTH} height={FLANK_HEIGHT} viewBox={`0 0 ${FLANK_WIDTH} ${FLANK_HEIGHT}`}>
                        <Defs>
                          <LinearGradient id="glow-r1" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="#E8BA5A" stopOpacity="0" />
                            <Stop offset="0.25" stopColor="#E8BA5A" stopOpacity="0.25" />
                            <Stop offset="0.5" stopColor="#E8BA5A" stopOpacity="0.30" />
                            <Stop offset="0.75" stopColor="#E8BA5A" stopOpacity="0.25" />
                            <Stop offset="1" stopColor="#E8BA5A" stopOpacity="0" />
                          </LinearGradient>
                          <LinearGradient id="core-r1" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="#F4D086" stopOpacity="0" />
                            <Stop offset="0.25" stopColor="#F4D086" stopOpacity="0.85" />
                            <Stop offset="0.5" stopColor="#F4D086" stopOpacity="1" />
                            <Stop offset="0.75" stopColor="#F4D086" stopOpacity="0.85" />
                            <Stop offset="1" stopColor="#F4D086" stopOpacity="0" />
                          </LinearGradient>
                        </Defs>
                        <Path d={RIGHT_ARC_1} stroke="url(#glow-r1)" strokeWidth={3.4} strokeLinecap="round" fill="none" />
                        <Path d={RIGHT_ARC_1} stroke="url(#core-r1)" strokeWidth={1.6} strokeLinecap="round" fill="none" />
                      </Svg>
                    </Animated.View>
                    <Animated.View
                      testID="prologue-ripple-wave-right-2"
                      style={[
                        styles.waveContainer,
                        {
                          transform: [{ translateX: rightWave2TranslateX }, { scale: wave2Scale }],
                          opacity: wave2Opacity,
                        },
                      ]}
                    >
                      <Svg width={FLANK_WIDTH} height={FLANK_HEIGHT} viewBox={`0 0 ${FLANK_WIDTH} ${FLANK_HEIGHT}`}>
                        <Defs>
                          <LinearGradient id="glow-r2" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="#E8BA5A" stopOpacity="0" />
                            <Stop offset="0.25" stopColor="#E8BA5A" stopOpacity="0.20" />
                            <Stop offset="0.5" stopColor="#E8BA5A" stopOpacity="0.25" />
                            <Stop offset="0.75" stopColor="#E8BA5A" stopOpacity="0.20" />
                            <Stop offset="1" stopColor="#E8BA5A" stopOpacity="0" />
                          </LinearGradient>
                          <LinearGradient id="core-r2" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="#F4D086" stopOpacity="0" />
                            <Stop offset="0.25" stopColor="#F4D086" stopOpacity="0.75" />
                            <Stop offset="0.5" stopColor="#F4D086" stopOpacity="0.9" />
                            <Stop offset="0.75" stopColor="#F4D086" stopOpacity="0.75" />
                            <Stop offset="1" stopColor="#F4D086" stopOpacity="0" />
                          </LinearGradient>
                        </Defs>
                        <Path d={RIGHT_ARC_2} stroke="url(#glow-r2)" strokeWidth={2.8} strokeLinecap="round" fill="none" />
                        <Path d={RIGHT_ARC_2} stroke="url(#core-r2)" strokeWidth={1.2} strokeLinecap="round" fill="none" />
                      </Svg>
                    </Animated.View>
                  </View>
                </View>
              )}
            </Animated.View>
            <Text style={styles.hint}>{t('prologue.hint')}</Text>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#161814',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 24, 19, 0.72)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContainer: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    flexGrow: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRegion: {
    width: '100%',
    alignItems: 'center',
  },
  langSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'center',
    maxWidth: '100%',
  },
  langPill: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(28, 20, 16, 0.70)',
    borderWidth: 1,
    borderColor: 'rgba(255, 245, 230, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  langPillActive: {
    backgroundColor: '#2D5748',
    borderColor: '#B9A589',
  },
  langPillPressed: {
    opacity: 0.8,
  },
  langPillText: {
    color: '#E8D5BC',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  langPillTextActive: {
    color: '#FFFDF7',
    fontWeight: '700',
  },
  brandCluster: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 16,
    marginVertical: 16,
    gap: 8,
  },
  eyebrow: {
    color: '#E8D5BC',
    fontSize: 12,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFDF7',
    letterSpacing: 3,
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#E8D5BC',
    letterSpacing: 0.5,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 380,
    marginTop: 4,
  },
  rule: {
    height: 1,
    width: 80,
    backgroundColor: '#B9A589',
    marginVertical: 12,
  },
  quote: {
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
    color: '#FFF8EB',
    textAlign: 'center',
    maxWidth: 400,
  },
  actionRegion: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    paddingTop: 16,
    paddingHorizontal: 32, // Guarantees >= 28dp bilateral flank clearance from screen edges
  },
  buttonWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    maxWidth: '100%',
  },
  button: {
    minHeight: 56,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 28,
    backgroundColor: '#2D5748',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#B9A589',
    overflow: 'hidden',
    position: 'relative',
    maxWidth: '100%',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    flexShrink: 1,
    color: '#FFFDF7',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
  hint: {
    color: '#E8D5BC',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 360,
  },
  rippleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'visible',
  },
  leftFlank: {
    position: 'absolute',
    left: -FLANK_WIDTH,
    top: '50%',
    marginTop: -FLANK_HEIGHT / 2,
    width: FLANK_WIDTH,
    height: FLANK_HEIGHT,
    overflow: 'hidden',
  },
  rightFlank: {
    position: 'absolute',
    right: -FLANK_WIDTH,
    top: '50%',
    marginTop: -FLANK_HEIGHT / 2,
    width: FLANK_WIDTH,
    height: FLANK_HEIGHT,
    overflow: 'hidden',
  },
  waveContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: FLANK_WIDTH,
    height: FLANK_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
