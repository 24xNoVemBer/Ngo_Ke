/* eslint-disable @typescript-eslint/no-require-imports */
import type { ImageSourcePropType } from 'react-native';

export const HERO_PHOTO: ImageSourcePropType = require('../../assets/photos/cover_hero.jpg');

export interface NodePhotoMeta {
  source: ImageSourcePropType;
  photographer: string;
  locationNote: string;
}

export interface AlleyMeta {
  id: string;
  name: string;
  tagline: string;
  district: string;
  storyCount: number;
  estTimeMinutes: number;
  coverPhoto: ImageSourcePropType;
  photographer: string;
  theme: 'Ẩm thực' | 'Di sản' | 'Bình yên' | 'Chuyện xưa';
  distanceMeters?: number;
  moodSound?: string;
  isPopular?: boolean;
  isFeatured?: boolean;
  structureLabel?: string;
}

export const THREE_LENSES_PHOTOS = {
  'bach-ma': require('../../assets/photos/three-lenses/bach-ma.jpg'),
  'ma-may': require('../../assets/photos/three-lenses/ma-may.jpg'),
  'dong-xuan-timeline': require('../../assets/photos/three-lenses/dong-xuan-timeline.jpg'),
  'dong-xuan-fire': require('../../assets/photos/three-lenses/dong-xuan-fire.jpg'),
  'dong-xuan-street': require('../../assets/photos/three-lenses/dong-xuan-street.jpg'),
} as const;

export function getThreeLensesPhoto(photoKey?: string): ImageSourcePropType | undefined {
  if (photoKey && photoKey in THREE_LENSES_PHOTOS) {
    return THREE_LENSES_PHOTOS[photoKey as keyof typeof THREE_LENSES_PHOTOS];
  }
  return undefined;
}

export const NODE_PHOTO_MAP: Record<string, NodePhotoMeta> = {
  'demo-01': {
    source: require('../../assets/photos/pexels_demo_01.jpg'),
    photographer: 'Thuan Pham (Pexels)',
    locationNote: 'Gánh hàng rong trong ngõ rợp cờ đỏ',
  },
  'demo-02': {
    source: require('../../assets/photos/pexels_demo_02.jpg'),
    photographer: 'Dang Hong (Pexels)',
    locationNote: 'Bóng nắng chiếu qua bậc thềm ngõ cũ',
  },
  'demo-03': {
    source: require('../../assets/photos/pexels_demo_03.jpg'),
    photographer: 'HONG SON (Pexels)',
    locationNote: 'Xe hoa quả qua ngõ nắng sớm',
  },
  'demo-04': {
    source: require('../../assets/photos/pexels_demo_04.jpg'),
    photographer: 'Thuan Pham (Pexels)',
    locationNote: 'Quán nhỏ bình yên đón ban mai',
  },
  'demo-05': {
    source: require('../../assets/photos/pexels_demo_05.jpg'),
    photographer: 'meomupmofilm (Pexels)',
    locationNote: 'Góc ngõ tường vàng và lồng đèn',
  },
  'demo-06': {
    source: require('../../assets/photos/pexels_demo_06.jpg'),
    photographer: 'HONG SON (Pexels)',
    locationNote: 'Chiều sâu con ngõ lát gạch cờ hoa',
  },
  'oldquarter-bach-ma': {
    source: require('../../assets/photos/three-lenses/bach-ma.jpg'),
    photographer: 'Tài liệu người dùng cung cấp (quyền chưa kiểm chứng)',
    locationNote: 'Đền Bạch Mã — Hàng Buồm',
  },
  'oldquarter-ma-may': {
    source: require('../../assets/photos/three-lenses/ma-may.jpg'),
    photographer: 'Tài liệu người dùng cung cấp (quyền chưa kiểm chứng)',
    locationNote: 'Nhà di sản 87 Mã Mây',
  },
  'oldquarter-dong-xuan': {
    source: require('../../assets/photos/three-lenses/dong-xuan-timeline.jpg'),
    photographer: 'Tài liệu người dùng cung cấp (quyền chưa kiểm chứng)',
    locationNote: 'Chợ Đồng Xuân — Băng-rôn năm 2026',
  },  'ngo-gach-ca-phe-no1': {
    source: require('../../assets/photos/cafengotongduytan_04.jpg'),
    photographer: 'Thuan Pham (Pexels · ảnh minh họa)',
    locationNote: 'Cà Phê No.1 — 1 Ngõ Gạch',
  },
  'ngo-gach-ta-ca-phe-4': {
    source: require('../../assets/photos/cafengotongduytan_04.jpg'),
    photographer: 'Thuan Pham (Pexels · ảnh minh họa)',
    locationNote: 'Ta Cà Phê 4 — 4A Ngõ Gạch',
  },
  'ngo-gach-dinh-thanh-ha': {
    source: require('../../assets/photos/alleys/dinh-thanh-ha-1.jpg'),
    photographer: 'Google Maps contributor (name not recorded · demo)',
    locationNote: 'Đình Thanh Hà — 10 Ngõ Gạch',
  },
  'ngo-gach-cafe-20': {
    source: require('../../assets/photos/cafengotongduytan_04.jpg'),
    photographer: 'Thuan Pham (Pexels · ảnh minh họa)',
    locationNote: 'Cafe 20 — 20 Ngõ Gạch',
  },
  'ngo-gach-chua-cau-dong': {
    source: require('../../assets/photos/alleys/chua-cau-dong-1.jpg'),
    photographer: 'Google Maps contributor (name not recorded · demo)',
    locationNote: 'Chùa Cầu Đông — 38B Hàng Đường',
  },
  'trung-yen-pho-suong': {
    source: require('../../assets/photos/alleys/pho-suong-1.jpg'),
    photographer: 'Google Maps contributor (name not recorded · demo)',
    locationNote: 'Phở Sướng — đầu Ngõ Trung Yên',
  },
  'trung-yen-pho-vui': {
    source: require('../../assets/photos/ngocamchi_03.jpg'),
    photographer: 'Dang Hong (Pexels · ảnh minh họa)',
    locationNote: 'Phở Vui — Ngõ Trung Yên',
  },
  'trung-yen-bun-ca-sam-cay-si': {
    source: require('../../assets/photos/alleys/bun-ca-sam-cay-si-1.jpg'),
    photographer: 'Google Maps contributor (name not recorded · demo)',
    locationNote: 'Bún cá Sâm Cây Si — Ngõ Trung Yên',
  },
  'trung-yen-bun-ngan-nhan': {
    source: require('../../assets/photos/ngocamchi_03.jpg'),
    photographer: 'Dang Hong (Pexels · ảnh minh họa)',
    locationNote: 'Bún ngan Nhàn — Ngõ Trung Yên',
  },
  'trung-yen-mien-tron-muc': {
    source: require('../../assets/photos/ngocamchi_03.jpg'),
    photographer: 'Dang Hong (Pexels · ảnh minh họa)',
    locationNote: 'Miến trộn mực — Ngõ Trung Yên',
  },
};

export const ALLEY_LIST: AlleyMeta[] = [
  {
    id: 'phat-loc',
    name: 'Ngõ Phất Lộc',
    tagline: 'Cái nôi bún đậu mắm tôm & chuyện cụ đồ xưa',
    district: 'Hàng Buồm, Hoàn Kiếm',
    storyCount: 6,
    estTimeMinutes: 45,
    coverPhoto: require('../../assets/photos/cover_hero.jpg'),
    photographer: 'Nguyễn Văn Nam (35mm)',
    theme: 'Ẩm thực',
    distanceMeters: 120,
    moodSound: 'Tiếng rao bánh & chén bát sứ',
    isPopular: true,
  },
  {
    id: 'tam-thuong',
    name: 'Ngõ Tạm Thương',
    tagline: 'Ngõ nem chua rán & bóng tịch dương rêu phong',
    district: 'Hàng Gai, Hoàn Kiếm',
    storyCount: 5,
    estTimeMinutes: 35,
    coverPhoto: require('../../assets/photos/ngocamchi_03.jpg'),
    photographer: 'Dang Hong (Pexels)',
    theme: 'Ẩm thực',
    distanceMeters: 380,
    moodSound: 'Tiếng xèo chảo & chuyện trò râm ran',
    isPopular: true,
  },
  {
    id: 'ngo-gach',
    name: 'Ngõ Gạch',
    tagline: 'Mái ngói rêu, ô cửa sổ chàm và tích xưa phố chợ',
    district: 'Đồng Xuân, Hoàn Kiếm',
    storyCount: 5,
    estTimeMinutes: 25,
    coverPhoto: require('../../assets/photos/alleys/dinh-thanh-ha-1.jpg'),
    photographer: 'Google Maps contributor (name not recorded · demo)',
    theme: 'Di sản',
    distanceMeters: 128,
    moodSound: 'Tiếng chuông xe đạp cổ',
  },
  {
    id: 'ngo-trung-yen',
    name: 'Ngõ Trung Yên',
    tagline: 'Thiên đường ẩm thực trứ danh giữa lòng phố cổ',
    district: 'Hàng Bạc, Hoàn Kiếm',
    storyCount: 5,
    estTimeMinutes: 30,
    coverPhoto: require('../../assets/photos/alleys/pho-suong-1.jpg'),
    photographer: 'Google Maps contributor (name not recorded · demo)',
    theme: 'Ẩm thực',
    distanceMeters: 146,
    moodSound: 'Tiếng xèo chảo & chuyện trò râm ran',
  },
  {
    id: 'cam-chi',
    name: 'Ngõ Cấm Chỉ',
    tagline: 'Khu phố ẩm thực đêm đỏ lửa không ngủ giữa lòng phố cổ',
    district: 'Hàng Bông, Hoàn Kiếm',
    storyCount: 5,
    estTimeMinutes: 50,
    coverPhoto: require('../../assets/photos/cafengotongduytan_04.jpg'),
    photographer: 'Thuan Pham (Pexels)',
    theme: 'Chuyện xưa',
    distanceMeters: 750,
    moodSound: 'Tiếng còi tàu vọng đêm',
  },
  {
    id: 'hang-chi',
    name: 'Ngõ Hàng Chỉ',
    tagline: 'Ngõ hẹp hun hút với những bậc thềm trăm năm trầm mặc',
    district: 'Hàng Gai, Hoàn Kiếm',
    storyCount: 4,
    estTimeMinutes: 30,
    coverPhoto: require('../../assets/photos/ngochieusau_05.jpg'),
    photographer: 'meomupmofilm (Pexels)',
    theme: 'Bình yên',
    distanceMeters: 420,
    moodSound: 'Tiếng chim hót trên hiên',
  },
  {
    id: 'old-quarter-three-lenses',
    name: 'Ba lát cắt phố cổ',
    tagline: 'Từ tín ngưỡng, nếp nhà đến nhịp chợ',
    district: 'Hoàn Kiếm, Hà Nội',
    storyCount: 3,
    estTimeMinutes: 50,
    coverPhoto: require('../../assets/photos/three-lenses/bach-ma.jpg'),
    photographer: 'Tài liệu người dùng cung cấp (quyền chưa kiểm chứng)',
    theme: 'Chuyện xưa',
    isFeatured: true,
    structureLabel: '3 điểm · 5 chương',
  },
];

export const THREE_LENSES_NODE_FIRST_CHAPTER_PHOTO_KEY: Record<string, string> = {
  'oldquarter-bach-ma': 'bach-ma',
  'oldquarter-ma-may': 'ma-may',
  'oldquarter-dong-xuan': 'dong-xuan-timeline',
};

export function getNodePhoto(nodeId?: string, photoKey?: string, collectionId?: string): ImageSourcePropType {
  if (photoKey && photoKey in THREE_LENSES_PHOTOS) {
    return THREE_LENSES_PHOTOS[photoKey as keyof typeof THREE_LENSES_PHOTOS];
  }
  if (collectionId === 'old-quarter-three-lenses' && nodeId && nodeId in THREE_LENSES_NODE_FIRST_CHAPTER_PHOTO_KEY) {
    const key = THREE_LENSES_NODE_FIRST_CHAPTER_PHOTO_KEY[nodeId];
    return THREE_LENSES_PHOTOS[key as keyof typeof THREE_LENSES_PHOTOS];
  }
  if (nodeId && NODE_PHOTO_MAP[nodeId]) {
    return NODE_PHOTO_MAP[nodeId].source;
  }
  return HERO_PHOTO;
}

export function getNodePhotographer(nodeId?: string, photoKey?: string, collectionId?: string, locale?: string): string {
  if ((photoKey && photoKey in THREE_LENSES_PHOTOS) || (collectionId === 'old-quarter-three-lenses' && nodeId && nodeId in THREE_LENSES_NODE_FIRST_CHAPTER_PHOTO_KEY)) {
    return locale === 'en'
      ? 'User-supplied material (rights unverified)'
      : 'Tài liệu người dùng cung cấp (quyền chưa kiểm chứng)';
  }
  if (nodeId && NODE_PHOTO_MAP[nodeId]) {
    return NODE_PHOTO_MAP[nodeId].photographer;
  }
  return locale === 'en' ? 'Ngõ Kể Project' : 'Dự án Ngõ Kể';
}

export function getAlleyMeta(alleyId?: string): AlleyMeta {
  if (alleyId) {
    const found = ALLEY_LIST.find((a) => a.id === alleyId);
    if (found) {
      return found;
    }
  }
  return ALLEY_LIST[0] as AlleyMeta;
}
