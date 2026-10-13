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
  distanceMeters: number;
  moodSound: string;
  isPopular?: boolean;
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
    storyCount: 6,
    estTimeMinutes: 40,
    coverPhoto: require('../../assets/photos/cuaso_hanoi_02.jpg'),
    photographer: 'HONG SON (Pexels)',
    theme: 'Di sản',
    distanceMeters: 550,
    moodSound: 'Tiếng chuông xe đạp cổ',
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
];

export function getNodePhoto(nodeId?: string): ImageSourcePropType {
  if (nodeId && NODE_PHOTO_MAP[nodeId]) {
    return NODE_PHOTO_MAP[nodeId].source;
  }
  return HERO_PHOTO;
}

export function getNodePhotographer(nodeId?: string): string {
  if (nodeId && NODE_PHOTO_MAP[nodeId]) {
    return NODE_PHOTO_MAP[nodeId].photographer;
  }
  return 'Dự án Ngõ Kể';
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
