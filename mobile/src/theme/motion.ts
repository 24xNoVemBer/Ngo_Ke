/**
 * Thiết lập hệ thống chuyển động (Motion Tokens) cho Ngõ Kể.
 * Ưu tiên transform & opacity; hiệu năng cần đo trên thiết bị.
 */
import { Easing } from 'react-native';

export const motionDurations = {
  instant: 120,
  fast: 220,
  normal: 260,
  relaxed: 250,
  slow: 300,
  ambientPulse: 2400,
  radarPing: 1800,
  laserScan: 2000,
  staggerStep: 50,
};

export const motionSprings = {
  /** Nhún xúc giác khi bấm nút/thẻ */
  tactilePress: {
    tension: 260,
    friction: 18,
    useNativeDriver: true,
  },
  /** Bật nảy thẻ bài/popup */
  bouncyPop: {
    tension: 190,
    friction: 13,
    useNativeDriver: true,
  },
  /** Trượt êm đề mục */
  gentleSlide: {
    tension: 130,
    friction: 15,
    useNativeDriver: true,
  },
};

export const motionEasings = {
  /** Đường cong gia tốc êm ái tự nhiên */
  gentleOut: Easing.out(Easing.cubic),
  /** Nhịp thở hai chiều êm dịu */
  easeInOutQuad: Easing.inOut(Easing.quad),
  /** Thẳng đều cho tia quét lặp */
  linear: Easing.linear,
};

export const motionScales = {
  pressedButton: 0.97,
  pressedCard: 0.975,
  pulseHaloMin: 1.0,
  pulseHaloMax: 1.15,
  popInMin: 0.88,
  popInMax: 1.0,
};
