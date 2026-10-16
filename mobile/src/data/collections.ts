import type { ImageSourcePropType } from 'react-native';
import type { Locale } from './locale';
import type { AnyDemoDataset, DemoDatasetV2 } from './sourceState';
import { HERO_PHOTO } from '../assets/photoMap';
import { t, type TranslationKey } from '../i18n/translator';

import demoDataVi from '../../../data/demo.json';
import fictionEnData from '../../../data/localized/fiction.en.json';
import oldQuarterViData from '../../../data/localized/old-quarter.vi.json';
import oldQuarterEnData from '../../../data/localized/old-quarter.en.json';

export type CollectionId = 'fiction-letter' | 'old-quarter-pilot';

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
] as const;

export function isCollectionId(value: unknown): value is CollectionId {
  return value === 'fiction-letter' || value === 'old-quarter-pilot';
}

/**
 * Returns the bundled dataset for a given collection and locale.
 */
export function getBundledDataset(
  collectionId: string = DEFAULT_COLLECTION_ID,
  locale: Locale = 'vi',
): AnyDemoDataset {
  if (collectionId === 'old-quarter-pilot') {
    return (locale === 'en' ? oldQuarterEnData : oldQuarterViData) as unknown as DemoDatasetV2;
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
