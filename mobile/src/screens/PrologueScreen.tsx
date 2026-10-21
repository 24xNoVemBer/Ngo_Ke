/* eslint-disable @typescript-eslint/no-require-imports -- Metro statically analyzable sound asset */
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import {
  Animated,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setAudioModeAsync, useAudioPlayer, type AudioPlayer } from 'expo-audio';
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

const PROLOGUE_WATERDROP_SOUND = require('../../assets/sounds/prologue_waterdrop.wav');
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

function GlobeIcon({ size = 16, color = '#E8D5BC' }: { size?: number; color?: string }): ReactElement {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      <Path
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronDownIcon({ size = 10, color = '#E8D5BC' }: { size?: number; color?: string }): ReactElement {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      <Path
        d="M6 9l6 6 6-6"
        fill="none"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckIcon({ size = 12, color = '#F4D086' }: { size?: number; color?: string }): ReactElement {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      <Path
        d="M20 6L9 17l-5-5"
        fill="none"
        stroke={color}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

type Props = NativeStackScreenProps<RootStackParamList, 'Prologue'> & {
  player?: AudioPlayer;
};

export function PrologueScreen({ navigation, player: passedPlayer }: Props): ReactElement {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const entering = useEntranceFadeSlide({ duration: 220, offsetY: 10 });
  const press = usePressSpring();
  const motion = useMotionState();
  const isFocused = useIsFocused();
  const fallbackPlayer = useAudioPlayer(PROLOGUE_WATERDROP_SOUND, { downloadFirst: true });
  const player = passedPlayer ?? fallbackPlayer;

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
  const [isPickerOpen, setPickerOpen] = useState(false);
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

  // Configure audio session to play in silent mode on iOS and Android
  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  // Clean up timers, animations, and sound playback on unmount
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      attemptToken.current += 1; // Invalidate any in-flight attempt before stopAnimation
      clearAllTimers();
      rippleProgress.stopAnimation();
      if (!navigated.current) {
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
    };
  }, [player, rippleProgress]);

  // Cancel in-flight ripple, timer, and pause audio when blurred or backgrounded so foreground can retry
  useEffect(() => {
    if ((!isFocused || !motion.foreground) && !navigated.current) {
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
    void setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});

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

    // 1. Play gentle water drop sound effect with async seek reset guarded by attempt token
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

    // 2. If reduced motion or inactive, avoid expanding waves and navigate promptly (F11)
    if (motion.reducedMotion || !motion.active) {
      playSafe();
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
          {/* 1. Header Region: one refined, centered language selector */}
          <View style={styles.headerRegion}>
            <Pressable
              testID="locale-switch"
              accessibilityRole="button"
              accessibilityLabel={`${t('common.change_language')}: ${locale === 'vi' ? 'Tiếng Việt' : 'English'}`}
              accessibilityHint={locale === 'vi' ? 'Nhấn để mở danh sách chọn ngôn ngữ' : 'Tap to open language choices'}
              onPress={() => setPickerOpen(true)}
              style={({ pressed }) => [
                styles.langTrigger,
                pressed && styles.langTriggerPressed,
              ]}
            >
              <GlobeIcon size={16} color="#E8D5BC" />
              <Text style={styles.langTriggerText}>
                {locale === 'vi' ? 'Tiếng Việt' : 'English'}
              </Text>
              <ChevronDownIcon size={10} color="#E8D5BC" />
            </Pressable>
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
            <Text style={styles.quote}>{t('prologue.quote').replace(/\n/g, ' ')}</Text>
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

      {/* 4. In-App Language Selection Modal */}
      <Modal
        testID="language-picker-modal"
        visible={isPickerOpen}
        transparent={true}
        animationType={motion.reducedMotion ? 'none' : 'fade'}
        onRequestClose={() => setPickerOpen(false)}
        accessibilityViewIsModal={true}
      >
        {isPickerOpen ? (
          <View style={styles.modalOverlay}>
            <Pressable
              testID="locale-modal-backdrop"
              style={styles.modalBackdrop}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              onPress={() => setPickerOpen(false)}
            />
            <View
              style={[
                styles.modalSheet,
                { paddingBottom: Math.max(insets.bottom, 20) + 12 },
              ]}
            >

              <View style={styles.modalHeader}>
                <View style={styles.modalTitleGroup}>
                  <GlobeIcon size={18} color="#B9A589" />
                  <Text style={styles.modalTitle}>{t('common.change_language')}</Text>
                </View>
                <Pressable
                  testID="locale-modal-close"
                  accessibilityRole="button"
                  accessibilityLabel={t('common.close')}
                  onPress={() => setPickerOpen(false)}
                  style={({ pressed }) => [styles.closeBtn, pressed && styles.btnPressed]}
                  hitSlop={8}
                >
                  <AppIcon name="close" size={18} color="#E8D5BC" />
                </Pressable>
              </View>

              <View style={styles.optionsList}>
                {/* Option: Tiếng Việt */}
                <Pressable
                  testID="locale-option-vi"
                  accessibilityRole="button"
                  accessibilityState={{ selected: locale === 'vi' }}
                  accessibilityLabel={`Tiếng Việt, Vietnamese${locale === 'vi' ? ', đang chọn' : ''}`}
                  onPress={() => {
                    setLocale('vi');
                    setPickerOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.optionCard,
                    locale === 'vi' && styles.optionCardActive,
                    pressed && styles.btnPressed,
                  ]}
                >
                  <View style={styles.optionTextCol}>
                    <Text style={[styles.optionTitle, locale === 'vi' && styles.optionTitleActive]}>
                      Tiếng Việt
                    </Text>
                    <Text style={styles.optionSubtitle}>Vietnamese</Text>
                  </View>
                  <View style={[styles.checkBadge, locale === 'vi' && styles.checkBadgeActive]}>
                    {locale === 'vi' && <CheckIcon size={12} color="#F4D086" />}
                  </View>
                </Pressable>

                {/* Option: English */}
                <Pressable
                  testID="locale-option-en"
                  accessibilityRole="button"
                  accessibilityState={{ selected: locale === 'en' }}
                  accessibilityLabel={`English, Tiếng Anh${locale === 'en' ? ', currently selected' : ''}`}
                  onPress={() => {
                    setLocale('en');
                    setPickerOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.optionCard,
                    locale === 'en' && styles.optionCardActive,
                    pressed && styles.btnPressed,
                  ]}
                >
                  <View style={styles.optionTextCol}>
                    <Text style={[styles.optionTitle, locale === 'en' && styles.optionTitleActive]}>
                      English
                    </Text>
                    <Text style={styles.optionSubtitle}>Tiếng Anh</Text>
                  </View>
                  <View style={[styles.checkBadge, locale === 'en' && styles.checkBadgeActive]}>
                    {locale === 'en' && <CheckIcon size={12} color="#F4D086" />}
                  </View>
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#161814',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
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
    paddingTop: 4,
  },
  langTrigger: {
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(28, 32, 25, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(232, 213, 188, 0.35)',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langTriggerPressed: {
    backgroundColor: 'rgba(45, 52, 42, 0.85)',
    borderColor: '#B9A589',
    opacity: 0.9,
  },
  langTriggerText: {
    color: '#FFFDF7',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  brandCluster: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 16,
    marginVertical: 12,
    gap: 8,
  },
  eyebrow: {
    color: '#E8D5BC',
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFDF7',
    letterSpacing: 2.5,
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
    width: 64,
    backgroundColor: 'rgba(185, 165, 137, 0.6)',
    marginVertical: 12,
  },
  quote: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
    color: '#FFF8EB',
    textAlign: 'center',
    maxWidth: 400,
    opacity: 0.92,
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
    borderWidth: 1.2,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(14, 18, 14, 0.72)',
  },
  modalSheet: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: '#1E241D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#B9A589',
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  modalTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    color: '#FFFDF7',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 253, 247, 0.08)',
  },
  optionsList: {
    gap: 12,
    marginBottom: 8,
  },
  optionCard: {
    minHeight: 58,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 253, 247, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(232, 213, 188, 0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionCardActive: {
    backgroundColor: 'rgba(45, 87, 72, 0.35)',
    borderColor: '#B9A589',
    borderWidth: 1.5,
  },
  btnPressed: {
    opacity: 0.82,
  },
  optionTextCol: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    color: '#E8D5BC',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  optionTitleActive: {
    color: '#FFFDF7',
    fontWeight: '700',
  },
  optionSubtitle: {
    color: 'rgba(232, 213, 188, 0.65)',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(232, 213, 188, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  checkBadgeActive: {
    backgroundColor: '#2D5748',
    borderColor: '#B9A589',
  },
});
