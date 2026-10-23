import type { ImageSourcePropType } from 'react-native';
import type { Locale } from './locale';
import type { AnyDemoDataset, DemoDatasetV2 } from './sourceState';
import { HERO_PHOTO } from '../assets/photoMap';
import { t, type TranslationKey } from '../i18n/translator';

import demoDataVi from '../../../data/demo.json';
import fictionEnData from '../../../data/localized/fiction.en.json';
import oldQuarterViData from '../../../data/localized/old-quarter.vi.json';
import oldQuarterEnData from '../../../data/localized/old-quarter.en.json';
import threeLensesViData from '../../../data/localized/three-lenses.vi.json';
import threeLensesEnData from '../../../data/localized/three-lenses.en.json';
import ngoGachViData from '../../../data/localized/ngo-gach.vi.json';
import ngoGachEnData from '../../../data/localized/ngo-gach.en.json';
import ngoTrungYenViData from '../../../data/localized/ngo-trung-yen.vi.json';
import ngoTrungYenEnData from '../../../data/localized/ngo-trung-yen.en.json';
import ngoTamThuongViData from '../../../data/localized/ngo-tam-thuong.vi.json';
import ngoTamThuongEnData from '../../../data/localized/ngo-tam-thuong.en.json';
import ngoCamChiViData from '../../../data/localized/ngo-cam-chi.vi.json';
import ngoCamChiEnData from '../../../data/localized/ngo-cam-chi.en.json';
import ngoPhatLocViData from '../../../data/localized/ngo-phat-loc.vi.json';
import ngoPhatLocEnData from '../../../data/localized/ngo-phat-loc.en.json';
import { getThreeLensesDatasetRevision, THREE_LENSES_COLLECTION_ID } from './threeLensesCompanion.ts';

export type CollectionId =
  | 'fiction-letter'
  | 'old-quarter-pilot'
  | 'old-quarter-three-lenses'
  | 'ngo-gach'
  | 'ngo-trung-yen'
  | 'ngo-tam-thuong'
  | 'ngo-cam-chi'
  | 'ngo-phat-loc';

export const DEFAULT_COLLECTION_ID: CollectionId = 'fiction-letter';

export const COLLECTION_REVISIONS: Record<CollectionId, Record<Locale, string>> = {
  'fiction-letter': {
    vi: '8b318b4e9955e3b7affe72cb21ea08cf8123a616eeab2eb1420ab105c7b65e6b',
    en: '746e0d0bfd48fb0a247dd2180dfc266e174dbea0225dabab31bddd38a8ff351b',
  },
  'old-quarter-pilot': {
    vi: '358209bc5bf8f14e47a3598b93644d168219d919dcb66d9eb1f7cbb7dbd2c94a',
    en: 'd75fcc183863f7ea2ec3b24bba1c4664b762c6332f0eb768a3493d9e74089b83',
  },
  'old-quarter-three-lenses': {
    get vi() {
      return getThreeLensesDatasetRevision('vi');
    },
    get en() {
      return getThreeLensesDatasetRevision('en');
    },
  },
  'ngo-gach': {
    vi: '60c242b80557356b8c6f8302f16e937447e0fc48c09b8c84453965631028d19b',
    en: '0f02ac35e6f3eaba103190a7e366d1dae11d6966609d296e175e29185cb79051',
  },
  'ngo-trung-yen': {
    vi: '59e84df99d75369d5cfb53df901c8c3e748d0d528e5f4334acfc07b20029d7c9',
    en: '50ecf581900181a2589571b820d3b43710a7f19daa0d947fe7bab9d9c3100741',
  },
  'ngo-tam-thuong': {
    vi: '41e95b6510f06fbabb9d0a776cb1fec7f204e2f21244ebd57161724e9efb7271',
    en: '0afc9ed695fac834fb53010893d855a7aabfc87ec61bf9ac8a74eddf0c176efd',
  },
  'ngo-cam-chi': {
    vi: 'f658ad9a1ab8c52fe4fe4daaaf7d87b59553da9617b424702ba8f64dc619a4a4',
    en: '2f75572bb84552fcd6ba0602e9682170a00b614bc1aa2a1a7ac6aa36fb60c877',
  },
  'ngo-phat-loc': {
    vi: 'c2a2b2afc53b52b2a0770ba1d23a80c2dfe08507e5ece19a2c4edff703e33d6a',
    en: '5ac2c7c70a755c416baf4538598cac45e9a56eb102cf101fa7b670c36ab0692f',
  },
};

export interface CollectionMeta {
  id: CollectionId;
  nameKey: TranslationKey;
  taglineKey: TranslationKey;
  themeKey: TranslationKey;
  districtKey: TranslationKey;
  nodeCount: number;
  coverPhoto: ImageSourcePropType;
  kind: 'simulated' | 'reviewed';
}

/* eslint-disable @typescript-eslint/no-require-imports */
export const AVAILABLE_COLLECTIONS: readonly CollectionMeta[] = [
  {
    id: 'ngo-trung-yen',
    nameKey: 'collection.ngo_trung_yen.name',
    taglineKey: 'collection.ngo_trung_yen.tagline',
    themeKey: 'collection.ngo_trung_yen.theme',
    districtKey: 'collection.ngo_trung_yen.district',
    nodeCount: 5,
    coverPhoto: require('../../assets/photos/alleys/ngo-trung-yen-cover.png'),
    kind: 'simulated',
  },
  {
    id: 'ngo-gach',
    nameKey: 'collection.ngo_gach.name',
    taglineKey: 'collection.ngo_gach.tagline',
    themeKey: 'collection.ngo_gach.theme',
    districtKey: 'collection.ngo_gach.district',
    nodeCount: 5,
    coverPhoto: require('../../assets/photos/alleys/ngo-gach-cover.png'),
    kind: 'simulated',
  },
  {
    id: 'ngo-tam-thuong',
    nameKey: 'collection.ngo_tam_thuong.name',
    taglineKey: 'collection.ngo_tam_thuong.tagline',
    themeKey: 'collection.ngo_tam_thuong.theme',
    districtKey: 'collection.ngo_tam_thuong.district',
    nodeCount: 2,
    coverPhoto: require('../../assets/photos/alleys/ngo-tam-thuong-cover.png'),
    kind: 'simulated',
  },
  {
    id: 'ngo-cam-chi',
    nameKey: 'collection.ngo_cam_chi.name',
    taglineKey: 'collection.ngo_cam_chi.tagline',
    themeKey: 'collection.ngo_cam_chi.theme',
    districtKey: 'collection.ngo_cam_chi.district',
    nodeCount: 3,
    coverPhoto: require('../../assets/photos/alleys/ngo-cam-chi-cover.png'),
    kind: 'simulated',
  },
  {
    id: 'ngo-phat-loc',
    nameKey: 'collection.ngo_phat_loc.name',
    taglineKey: 'collection.ngo_phat_loc.tagline',
    themeKey: 'collection.ngo_phat_loc.theme',
    districtKey: 'collection.ngo_phat_loc.district',
    nodeCount: 2,
    coverPhoto: require('../../assets/photos/ngophatloc_01.jpg'),
    kind: 'simulated',
  },
  {
    id: 'old-quarter-three-lenses',
    nameKey: 'collection.old_quarter_three_lenses.name',
    taglineKey: 'collection.old_quarter_three_lenses.tagline',
    themeKey: 'collection.old_quarter_three_lenses.theme',
    districtKey: 'collection.old_quarter_three_lenses.district',
    nodeCount: 3,
    coverPhoto: require('../../assets/photos/three-lenses/bach-ma.jpg'),
    kind: 'reviewed',
  },
  {
    id: 'old-quarter-pilot',
    nameKey: 'collection.old_quarter_pilot.name',
    taglineKey: 'collection.old_quarter_pilot.tagline',
    themeKey: 'collection.old_quarter_pilot.theme',
    districtKey: 'collection.old_quarter_pilot.district',
    nodeCount: 3,
    coverPhoto: require('../../assets/photos/ngophatloc_01.jpg'),
    kind: 'reviewed',
  },
  {
    id: 'fiction-letter',
    nameKey: 'collection.fiction_letter.name',
    taglineKey: 'collection.fiction_letter.tagline',
    themeKey: 'collection.fiction_letter.theme',
    districtKey: 'collection.fiction_letter.district',
    nodeCount: 6,
    coverPhoto: HERO_PHOTO,
    kind: 'simulated',
  },
] as const;

export function isCollectionId(value: unknown): value is CollectionId {
  return (
    value === 'fiction-letter' ||
    value === 'old-quarter-pilot' ||
    value === THREE_LENSES_COLLECTION_ID ||
    value === 'ngo-gach' ||
    value === 'ngo-trung-yen' ||
    value === 'ngo-tam-thuong' ||
    value === 'ngo-cam-chi' ||
    value === 'ngo-phat-loc'
  );
}

/**
 * Returns the bundled dataset for a given collection and locale.
 */
export function getBundledDataset(
  collectionId: string = DEFAULT_COLLECTION_ID,
  locale: Locale = 'vi',
): AnyDemoDataset | undefined {
  if (collectionId === THREE_LENSES_COLLECTION_ID) {
    return (locale === 'en' ? threeLensesEnData : threeLensesViData) as unknown as DemoDatasetV2;
  }
  if (collectionId === 'old-quarter-pilot') {
    return (locale === 'en' ? oldQuarterEnData : oldQuarterViData) as unknown as DemoDatasetV2;
  }
  if (collectionId === 'ngo-gach') {
    return (locale === 'en' ? ngoGachEnData : ngoGachViData) as unknown as DemoDatasetV2;
  }
  if (collectionId === 'ngo-trung-yen') {
    return (locale === 'en' ? ngoTrungYenEnData : ngoTrungYenViData) as unknown as DemoDatasetV2;
  }
  if (collectionId === 'ngo-tam-thuong') {
    return (locale === 'en' ? ngoTamThuongEnData : ngoTamThuongViData) as unknown as DemoDatasetV2;
  }
  if (collectionId === 'ngo-cam-chi') {
    return (locale === 'en' ? ngoCamChiEnData : ngoCamChiViData) as unknown as DemoDatasetV2;
  }
  if (collectionId === 'ngo-phat-loc') {
    return (locale === 'en' ? ngoPhatLocEnData : ngoPhatLocViData) as unknown as DemoDatasetV2;
  }
  return (locale === 'en' ? fictionEnData : demoDataVi) as unknown as AnyDemoDataset;
}

/**
 * Returns the dataset revision for a given collection and locale.
 */
export function getCollectionRevision(
  collectionId: string = DEFAULT_COLLECTION_ID,
  locale: Locale = 'vi',
): string {
  if (isCollectionId(collectionId)) {
    return COLLECTION_REVISIONS[collectionId][locale];
  }
  return COLLECTION_REVISIONS['fiction-letter'][locale];
}

/**
 * Formats collection list items with localized strings for UI rendering.
 */
export function getLocalizedCollections(locale: Locale) {
  return AVAILABLE_COLLECTIONS.map((c) => ({
    id: c.id,
    name: t(locale, c.nameKey),
    tagline: t(locale, c.taglineKey),
    theme: t(locale, c.themeKey),
    district: t(locale, c.districtKey),
    nodeCount: c.nodeCount,
    coverPhoto: c.coverPhoto,
    kind: c.kind,
  }));
}
