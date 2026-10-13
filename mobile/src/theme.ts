// Semantic tokens for 'Sổ tay ngõ phố' design system
export const colors = {
  // Palette chính theo art direction "Sổ tay ngõ phố"
  background: '#F7F2E8',      // Nền giấy ấm
  surface: '#FFFDF7',         // Mặt nội dung sổ tay / thẻ giấy
  surfaceWarm: '#F1EAD8',     // Mặt giấy tối hơn một chút cho card phụ/chip
  text: '#2E3028',            // Mực chính (tương phản 11.99:1 trên nền giấy)
  muted: '#626559',           // Chữ phụ / chú thích
  accent: '#2D5748',          // Xanh hành động trầm (nút chính, trạng thái chọn)
  accentHover: '#234438',     // Xanh nhấn khi bấm
  accentSoft: '#E8EFEA',      // Nền xanh nhạt đệm cho nhãn/badge
  terracotta: '#9C4F36',      // Gạch nung (dấu mộc, điểm nhấn hiếm)
  terracottaSoft: '#F6EAE6',  // Nền son gạch nhạt
  border: '#E2DDD3',          // Đường kẻ trang sổ / viền thẻ
  borderStrong: '#C5BEAF',    // Viền đậm hơn khi active
  error: '#8B3D28',           // Màu báo lỗi
  errorSoft: '#F8ECE8',       // Nền cảnh báo lỗi
  overlay: 'rgba(46, 48, 40, 0.55)', // Lớp phủ làm mờ nền
};

export const typography = {
  titleLarge: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  titleMedium: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
  titleSmall: { fontSize: 18, lineHeight: 26, fontWeight: '600' as const },
  bodyLarge: { fontSize: 17, lineHeight: 26, fontWeight: '400' as const },
  bodyMedium: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  bodySmall: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '700' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  micro: { fontSize: 11, lineHeight: 14, fontWeight: '600' as const },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 18,
  pill: 999,
};
