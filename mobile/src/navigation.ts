export type Area = 'qa' | 'recommendations' | 'camera' | 'location';

export type RootStackParamList = {
  Home: undefined;
  Qa: undefined;
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
    detail: 'Chủ đề, quỹ thời gian và gợi ý điểm sẽ được làm sau khi Phase 3 được duyệt. Không có dẫn đường.',
  },
  camera: {
    title: 'Camera và người kể',
    phase: 4,
    detail: 'QR, người kể 2D và caption sẽ được làm sau khi Phase 4 được duyệt. Màn này không bật camera hay xin quyền.',
  },
  location: {
    title: 'Xác nhận điểm GPS',
    phase: 5,
    detail: 'GPS chỉ gợi ý để người dùng xác nhận ở Phase 5. Màn này không lấy vị trí hay xin quyền.',
  },
};
