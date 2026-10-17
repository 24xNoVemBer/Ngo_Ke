/**
 * Thiết lập hệ thống chuyển động (Motion Tokens) cho Ngõ Kể.
 * Tuân thủ nguyên lý Motion Design (LottieFiles) theo phong cách Premium:
 * - Điềm tĩnh, tự nhiên, nhịp nhàng, có độ hãm êm ái (deceleration)
 * - Tôn trọng nhịp thở không gian ngõ phố cổ, không nảy lố (overshoot <= 3%)
 * - Ưu tiên transform & opacity với useNativeDriver: true
 */
import { Easing } from 'react-native';

export const motionDurations = {
  /** Phản hồi xúc giác tức thời (press, release, active state): 120ms */
  instant: 120,
  /** Chuyển trạng thái thứ cấp nhanh (chip select, indicator sliding): 180ms */
  fast: 180,
  /** Nhịp chuẩn cho nội dung (thẻ bài, đổi điểm trạm, hiện câu trả lời): 240ms */
  normal: 240,
  /** Hạ cánh êm cho các phân đoạn giao diện (header, section cascade): 320ms */
  relaxed: 320,
  /** Chuyển ngữ cảnh lớn (modal drawer, screen entrance, hero reveal): 380ms */
  slow: 380,
  /** Nhịp thở quầng sáng môi trường: 2400ms */
  ambientPulse: 2400,
  radarPing: 1800,
  laserScan: 2000,
  staggerStep: 50,
};

export const motionSprings = {
  /** Nhún xúc giác có giảm chấn cao khi bấm nút/thẻ (không rung lắc dư thừa) */
  tactilePress: {
    tension: 260,
    friction: 20,
    useNativeDriver: true,
  },
  /** Trượt êm đề mục / modal panel */
  gentleSlide: {
    tension: 140,
    friction: 18,
    useNativeDriver: true,
  },
};

export const motionEasings = {
  /** Entrance: gia tốc nhanh ban đầu rồi hãm đà êm ái khi tiếp đất (decelerate) */
  gentleOut: Easing.out(Easing.cubic),
  /** Exit: rời màn hình dứt khoát tăng tốc dần (accelerate) */
  accelerate: Easing.in(Easing.cubic),
  /** Nhịp thở hai chiều êm dịu (ambient loops, pulse) */
  easeInOutQuad: Easing.inOut(Easing.quad),
  /** Thẳng đều cho tia quét lặp / scanner */
  linear: Easing.linear,
};

export const motionScales = {
  pressedButton: 0.97,
  pressedCard: 0.975,
  pulseHaloMin: 1.0,
  pulseHaloMax: 1.12,
  popInMin: 0.92,
  popInMax: 1.0,
};

