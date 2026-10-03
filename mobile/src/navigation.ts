export type Area = 'qa' | 'recommendations' | 'camera' | 'location';

export type RootStackParamList = {
  Home: undefined;
  Qa: undefined;
  Plan: undefined;
  Camera: undefined;
  Location: undefined;
  Placeholder: { area: Area };
};

export const areas: Record<Area, { title: string; phase: number; detail: string }> = {
  qa: {
    title: 'Giới thiệu và hỏi đáp',
    phase: 2,
    detail: 'Câu hỏi mẫu, nhập chữ và đáp án cố định có nguồn đã có trong Phase 2.',
  },
  recommendations: {
    title: 'Chọn trải nghiệm',
    phase: 3,
    detail: 'Chủ đề, quỹ thời gian và gợi ý điểm đã có trong Phase 3.',
  },
  camera: {
    title: 'Camera và người kể',
    phase: 4,
    detail: 'Màn này đã có trong Phase 4: xin quyền đúng lúc, quét QR của điểm đã biết, lớp người kể 2D tạm kèm caption và chọn điểm bằng tay.',
  },
  location: {
    title: 'Xác nhận điểm GPS',
    phase: 5,
    detail: 'Đã có trong Phase 5: lấy vị trí một lần khi bấm nút, gợi ý một candidate, người dùng xác nhận mới đổi điểm.',
  },
};
