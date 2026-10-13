import { createContext, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo, AppState } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

const MotionContext = createContext({ reducedMotion: true, foreground: true });
export const MotionProvider = MotionContext.Provider;

// The OS preference is read once by App; screens share the same listeners.
export function useMotionPreferences(): { reducedMotion: boolean; foreground: boolean } {
  const [reducedMotion, setReducedMotion] = useState(true);
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  useEffect(() => {
    let mounted = true;
    let preferenceChanged = false;
    const preference = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      preferenceChanged = true;
      setReducedMotion(value);
    });
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted && !preferenceChanged) setReducedMotion(value);
    }).catch(() => { /* Keep motion reduced if the OS cannot provide its preference. */ });
    const appState = AppState.addEventListener('change', (state) => setForeground(state === 'active'));
    return () => { mounted = false; preference.remove(); appState.remove(); };
  }, []);
  return { reducedMotion, foreground };
}

export function useMotionState(): { reducedMotion: boolean; foreground: boolean; active: boolean } {
  const { reducedMotion, foreground } = useContext(MotionContext);
  const focused = useIsFocused();
  return { reducedMotion, foreground, active: focused && foreground && !reducedMotion };
}
