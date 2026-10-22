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
import { getThreeLensesDatasetRevision, THREE_LENSES_COLLECTION_ID } from './threeLensesCompanion.ts';

export type CollectionId =
  | 'fiction-letter'
  | 'old-quarter-pilot'
  | 'old-quarter-three-lenses'
  | 'ngo-gach'
  | 'ngo-trung-yen';

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
    vi: '0b8d32ff1a4fac3867995d7be7c4394be4ef9080425c5217ebb65d7df5e90aa3',
    en: '2458be77514edfa0e4fb194f46e7f0191e5d655ccfd7e6c96b8f044f5179df59',
  },
  'ngo-trung-yen': {
    vi: 'b8fa25cb6fbe31a5bd5806d0af8af231a59d9fa1279508671df9f624135cb889',
    en: '8aa4d4c20413cc372f525bc111df575d5c8de60215ce11254d66b2452b5b75b1',
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
] as const;

export function isCollectionId(value: unknown): value is CollectionId {
  return (
    value === 'fiction-letter' ||
    value === 'old-quarter-pilot' ||
    value === THREE_LENSES_COLLECTION_ID ||
    value === 'ngo-gach' ||
    value === 'ngo-trung-yen'
  );
}

/**
 * Returns the bundled dataset for a given collection and locale.
 */
export function getBundledDataset(
  collectionId: string = DEFAULT_COLLECTION_ID,
  locale: Locale = 'vi',
): AnyDemoDataset {
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
