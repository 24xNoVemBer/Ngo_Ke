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
import ngoCamChiViData from '../../../data/localized/ngo-cam-chi.vi.json';
import ngoPhatLocViData from '../../../data/localized/ngo-phat-loc.vi.json';
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

export const VI_ONLY_COLLECTION_IDS: readonly CollectionId[] = [
  'ngo-tam-thuong',
  'ngo-cam-chi',
  'ngo-phat-loc',
] as const;

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
    vi: '0b8d32ff1a4fac3867995d7be7c4394be4ef9080425c5217ebb65d7df5e90aa3',
    en: '2458be77514edfa0e4fb194f46e7f0191e5d655ccfd7e6c96b8f044f5179df59',
  },
  'ngo-trung-yen': {
    vi: '1291ae869a7d66b684d3bd764f87fe99817d250d19c544da0938e30f8ec5ae19',
    en: 'ca2ff890877c351d3b9d82da3b9178afb5b38a09c2ff51a4d264af75874a6c27',
  },
  'ngo-tam-thuong': {
    vi: '3086e80f2dda45e2354289882cb89a6526574fa98b5cfe4f2f17f02d092745e9',
    en: 'unavailable',
  },
  'ngo-cam-chi': {
    vi: 'b7898f698efc6b8db0a137d151bfc622fef52082bdfc2f8d97c44b1b2e08b48c',
    en: 'unavailable',
  },
  'ngo-phat-loc': {
    vi: 'd6e9fc6d93f4f0961dd20bdd0128df35229f33e0e89caf2071dccc9f46aff195',
    en: 'unavailable',
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
    id: 'fiction-letter',
    nameKey: 'collection.fiction_letter.name',
    taglineKey: 'collection.fiction_letter.tagline',
    themeKey: 'collection.fiction_letter.theme',
    districtKey: 'collection.fiction_letter.district',
    nodeCount: 6,
    coverPhoto: HERO_PHOTO,
    kind: 'simulated',
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
    id: 'ngo-gach',
    nameKey: 'collection.ngo_gach.name',
    taglineKey: 'collection.ngo_gach.tagline',
    themeKey: 'collection.ngo_gach.theme',
    districtKey: 'collection.ngo_gach.district',
    nodeCount: 5,
    coverPhoto: require('../../assets/photos/alleys/dinh-thanh-ha-1.jpg'),
    kind: 'simulated',
  },
  {
    id: 'ngo-trung-yen',
    nameKey: 'collection.ngo_trung_yen.name',
    taglineKey: 'collection.ngo_trung_yen.tagline',
    themeKey: 'collection.ngo_trung_yen.theme',
    districtKey: 'collection.ngo_trung_yen.district',
    nodeCount: 5,
    coverPhoto: require('../../assets/photos/alleys/pho-suong-1.jpg'),
    kind: 'simulated',
  },
  {
    id: 'ngo-tam-thuong',
    nameKey: 'collection.ngo_tam_thuong.name',
    taglineKey: 'collection.ngo_tam_thuong.tagline',
    themeKey: 'collection.ngo_tam_thuong.theme',
    districtKey: 'collection.ngo_tam_thuong.district',
    nodeCount: 2,
    coverPhoto: require('../../assets/photos/ngochieusau_05.jpg'),
    kind: 'simulated',
  },
  {
    id: 'ngo-cam-chi',
    nameKey: 'collection.ngo_cam_chi.name',
    taglineKey: 'collection.ngo_cam_chi.tagline',
    themeKey: 'collection.ngo_cam_chi.theme',
    districtKey: 'collection.ngo_cam_chi.district',
    nodeCount: 3,
    coverPhoto: require('../../assets/photos/ngocamchi_03.jpg'),
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
 * Returns undefined when a collection is unavailable in the requested locale
 * (e.g. Vietnamese-only collections requested in English).
 */
export function getBundledDataset(
  collectionId: string = DEFAULT_COLLECTION_ID,
  locale: Locale = 'vi',
): AnyDemoDataset | undefined {
  if (locale === 'en' && VI_ONLY_COLLECTION_IDS.includes(collectionId as CollectionId)) {
    return undefined;
  }
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
    return locale === 'en' ? undefined : (ngoTamThuongViData as unknown as DemoDatasetV2);
  }
  if (collectionId === 'ngo-cam-chi') {
    return locale === 'en' ? undefined : (ngoCamChiViData as unknown as DemoDatasetV2);
  }
  if (collectionId === 'ngo-phat-loc') {
    return locale === 'en' ? undefined : (ngoPhatLocViData as unknown as DemoDatasetV2);
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
  const visible =
    locale === 'en'
      ? AVAILABLE_COLLECTIONS.filter((c) => !VI_ONLY_COLLECTION_IDS.includes(c.id))
      : AVAILABLE_COLLECTIONS;
  return visible.map((c) => ({
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
