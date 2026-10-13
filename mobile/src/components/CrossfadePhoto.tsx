import { useEffect, useRef, useState, type ReactElement } from 'react';
import { Animated, Image, StyleSheet, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { useMotionState } from '../hooks/MotionPreferences';

export function CrossfadePhoto({ source, style }: { source: ImageSourcePropType; style: StyleProp<ViewStyle> }): ReactElement {
  const { active } = useMotionState();
  const [previous, setPrevious] = useState(source);
  const opacity = useRef(new Animated.Value(1)).current;
  const current = useRef(source);
  current.current = source;
  useEffect(() => {
    opacity.stopAnimation();
    opacity.setValue(previous === source ? 1 : 0);
    return () => opacity.stopAnimation();
  }, [source, previous, opacity]);
  function reveal(): void {
    if (current.current !== source) return;
    const animation = Animated.timing(opacity, { toValue: 1, duration: active ? 180 : 0, useNativeDriver: true });
    animation.start(({ finished }) => {
      if (finished && current.current === source) setPrevious(source);
    });
  }
  return <View style={style}>
    <Image source={previous} style={StyleSheet.absoluteFill} resizeMode="cover" accessible={false} />
    <Animated.Image source={source} onLoad={reveal} onError={() => {
      if (current.current === source) opacity.setValue(0);
    }} style={[StyleSheet.absoluteFill, { opacity }]} resizeMode="cover" accessible={false} />
  </View>;
}
