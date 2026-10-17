import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useMotionState } from './MotionPreferences';
import { motionDurations, motionEasings, motionScales, motionSprings } from '../theme/motion';

export function usePulseLoop(options?: {
  minScale?: number; maxScale?: number; minOpacity?: number; maxOpacity?: number;
  duration?: number; active?: boolean;
}): {
  scaleAnim: Animated.AnimatedInterpolation<number>;
  opacityAnim: Animated.AnimatedInterpolation<number>;
} {
  const { active: motionActive } = useMotionState();
  const active = motionActive && (options?.active ?? true);
  const duration = options?.duration ?? motionDurations.ambientPulse;
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active) { progress.setValue(0); return; }
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(progress, { toValue: 1, duration: duration / 2, easing: motionEasings.easeInOutQuad, useNativeDriver: true, isInteraction: false }),
      Animated.timing(progress, { toValue: 0, duration: duration / 2, easing: motionEasings.easeInOutQuad, useNativeDriver: true, isInteraction: false }),
    ]));
    animation.start();
    return () => { animation.stop(); progress.setValue(0); };
  }, [active, duration, progress]);
  return {
    scaleAnim: progress.interpolate({ inputRange: [0, 1], outputRange: [options?.minScale ?? 1, options?.maxScale ?? motionScales.pulseHaloMax] }),
    opacityAnim: progress.interpolate({ inputRange: [0, 1], outputRange: [options?.maxOpacity ?? 0.5, options?.minOpacity ?? 0.15] }),
  };
}

export function usePressSpring(pressedScale = motionScales.pressedButton): {
  scaleAnim: Animated.Value; handlePressIn: () => void; handlePressOut: () => void;
} {
  const { active } = useMotionState();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!active) { scaleAnim.stopAnimation(); scaleAnim.setValue(1); }
    return () => scaleAnim.stopAnimation();
  }, [active, scaleAnim]);
  function press(toValue: number): void {
    scaleAnim.stopAnimation();
    if (!active) { scaleAnim.setValue(1); return; }
    Animated.spring(scaleAnim, { toValue, ...motionSprings.tactilePress, useNativeDriver: true }).start();
  }
  return { scaleAnim, handlePressIn: () => press(pressedScale), handlePressOut: () => press(1) };
}

export function useEntranceFadeSlide(options?: {
  delay?: number; duration?: number; offsetY?: number;
}): { opacity: Animated.Value; translateY: Animated.AnimatedInterpolation<number> } {
  const { active } = useMotionState();
  const progress = useRef(new Animated.Value(1)).current;
  const entered = useRef(false);
  const delay = Math.max(0, Math.min(options?.delay ?? 0, 450));
  const duration = Math.max(100, Math.min(options?.duration ?? motionDurations.normal, 500));
  const offsetY = Math.max(0, Math.min(options?.offsetY ?? 14, 24));

  useEffect(() => {
    if (entered.current || !active) {
      progress.setValue(1);
      entered.current = true;
      return;
    }
    entered.current = true;
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      delay,
      duration,
      easing: motionEasings.gentleOut,
      useNativeDriver: true,
    });
    animation.start();
    return () => {
      animation.stop();
      progress.setValue(1);
    };
  }, [active, delay, duration, progress]);

  return {
    opacity: progress,
    translateY: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [offsetY, 0],
    }),
  };
}

export function useLaserScanner(duration = motionDurations.laserScan, scanning = false): {
  scanProgress: Animated.Value;
  translateYPct: Animated.AnimatedInterpolation<number>;
  beamOpacity: Animated.AnimatedInterpolation<number>;
} {
  const { active: motionActive } = useMotionState();
  const active = motionActive && scanning;
  const scanProgress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active) { scanProgress.setValue(0.5); return; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(scanProgress, { toValue: 1, duration, easing: motionEasings.linear, useNativeDriver: true, isInteraction: false }),
      Animated.timing(scanProgress, { toValue: 0, duration, easing: motionEasings.linear, useNativeDriver: true, isInteraction: false }),
    ]));
    loop.start();
    return () => { loop.stop(); scanProgress.setValue(0.5); };
  }, [active, duration, scanProgress]);
  return {
    scanProgress,
    translateYPct: scanProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
    beamOpacity: scanProgress.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0.3, 0.95, 0.95, 0.3] }),
  };
}
