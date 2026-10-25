import type { ImageSourcePropType } from 'react-native';
import { ALLEY_LIST, HERO_PHOTO, NODE_PHOTO_MAP, THREE_LENSES_PHOTOS, getNodePhoto, getNodePhotographer } from './photoMap';
import { AVAILABLE_COLLECTIONS, getBundledDataset } from '../data/collections';
import { t } from '../i18n/translator';

declare const __DEV__: boolean;

// Expo's build flag is the boundary: restore existing assets for internal Metro
// development, without treating this as permission for public distribution.
function showExistingDevelopmentPhotos(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

export type VisualMotif = 'relic' | 'culinary' | 'alley_space';
export type NodeVisual =
  | { kind: 'photo'; source: ImageSourcePropType; photographer: string; isIllustrative?: boolean }
  | { kind: 'placeholder'; motif: VisualMotif; siteName: string; badgeLabel: string; alleyName?: string };

// Provenance and original files stay in photoMap/the rights ledger, not on the UI.
export const QUARANTINED_GOOGLE_MAPS_NODES: ReadonlySet<string> = new Set([
  'ngo-gach-dinh-thanh-ha', 'ngo-gach-chua-cau-dong',
  'trung-yen-pho-suong', 'trung-yen-bun-ca-sam-cay-si',
]);

export const NODE_MOTIF_MAP: Readonly<Record<string, VisualMotif>> = {
  'ngo-gach-dinh-thanh-ha': 'relic',
  'ngo-gach-chua-cau-dong': 'relic',
  'trung-yen-dinh-trung-yen': 'relic',
  'tam-thuong-dinh-yen-thai': 'relic',
  'tam-thuong-den-vong-tien': 'relic',
  'cam-chi-den-vong-tien': 'relic',
  'phat-loc-den-tien-ha': 'relic',
  'trung-yen-pho-suong': 'culinary',
  'trung-yen-bun-ca-sam-cay-si': 'culinary',
  'trung-yen-bun-ngan-nhan': 'culinary',
  'trung-yen-pho-ga-huong-tra': 'culinary',
  'ngo-gach-ca-phe-no1': 'alley_space',
  'ngo-gach-ta-ca-phe-4': 'alley_space',
  'ngo-gach-cafe-20': 'alley_space',
  'phat-loc-cac-nhanh-ngo': 'alley_space',
  'cam-chi-khong-gian-nghe-thuat': 'alley_space',
  'cam-chi-ngo-hoi-vu': 'alley_space',
};

function placeholder(nodeId: string | undefined, collectionId: string | undefined, locale: string): Extract<NodeVisual, { kind: 'placeholder' }> {
  const language = locale === 'en' ? 'en' : 'vi';
  const collection = AVAILABLE_COLLECTIONS.find((item) => item.id === collectionId);
  const node = collection && getBundledDataset(collection.id, language)?.nodes.find((item) => item.id === nodeId);
  return {
    kind: 'placeholder',
    motif: (node && nodeId && NODE_MOTIF_MAP[nodeId]) || 'alley_space',
    siteName: node?.name ?? t(language, 'qa.this_point'),
    alleyName: collection ? t(language, collection.nameKey) : undefined,
    badgeLabel: t(language, 'common.photo_updating'),
  };
}

/** Internal development reuses the pre-UI05B mapping and its fixed illustrative
 * HERO fallback. Unknown collections/nodes cannot borrow another scope's image.
 * Non-development builds retain the existing rights policy below.
 */
export function resolveNodeVisual(nodeId?: string, photoKey?: string, collectionId?: string, locale = 'vi'): NodeVisual {
  if (showExistingDevelopmentPhotos()) {
    const collection = AVAILABLE_COLLECTIONS.find((item) => item.id === collectionId);
    const node = collection && getBundledDataset(collection.id, locale === 'en' ? 'en' : 'vi')?.nodes.find((item) => item.id === nodeId);
    if (node) {
      const chapterPhotoKey = collectionId === 'old-quarter-three-lenses' && photoKey && Object.hasOwn(THREE_LENSES_PHOTOS, photoKey)
        ? photoKey : undefined;
      const source = getNodePhoto(node.id, chapterPhotoKey, collectionId);
      if (source) {
        const photographer = getNodePhotographer(node.id, chapterPhotoKey, collectionId, locale);
        return { kind: 'photo', source, photographer,
          isIllustrative: collectionId === 'fiction-letter' || source === HERO_PHOTO || photographer.includes('ảnh minh họa') };
      }
    }
    return placeholder(nodeId, collectionId, locale);
  }
  if (QUARANTINED_GOOGLE_MAPS_NODES.has(nodeId ?? '')) return placeholder(nodeId, collectionId, locale);
  if (collectionId === 'fiction-letter' && nodeId && /^demo-0[1-6]$/.test(nodeId)) {
    const photo = NODE_PHOTO_MAP[nodeId];
    if (photo) return { kind: 'photo', source: photo.source, photographer: photo.photographer, isIllustrative: true };
  }
  return placeholder(nodeId, collectionId, locale);
}

/** Covers have their own permission boundary; never reuse a cover as a node photo. */
export function resolveCollectionVisual(collectionId?: string, locale = 'vi'): NodeVisual {
  if (showExistingDevelopmentPhotos()) {
    const cover = AVAILABLE_COLLECTIONS.find((item) => item.id === collectionId);
    if (cover?.coverPhoto) {
      const originalMeta = ALLEY_LIST.find((item) => item.coverPhoto === cover.coverPhoto);
      return { kind: 'photo', source: cover.coverPhoto, isIllustrative: true,
        photographer: originalMeta?.photographer ?? (locale === 'en'
          ? 'Existing collection cover (rights unverified)' : 'Ảnh bìa hiện có (quyền chưa kiểm chứng)') };
    }
  }
  if (collectionId === 'fiction-letter') {
    const cover = AVAILABLE_COLLECTIONS.find((item) => item.id === collectionId);
    if (cover) return { kind: 'photo', source: cover.coverPhoto, photographer: 'HONG SON (Pexels)', isIllustrative: true };
  }
  const visual = placeholder(undefined, collectionId, locale);
  return { ...visual, siteName: visual.alleyName ?? visual.siteName };
}
