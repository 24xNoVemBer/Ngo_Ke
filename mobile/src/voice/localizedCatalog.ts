import { DEFAULT_LOCALE, type Locale } from '../data/locale.ts';
import type { VoiceTrack } from './catalog';
import { demoVoiceMigrationV1Catalogues } from './demoVoiceMigrationV1Catalog.ts';

export const DEFAULT_VOICE_COLLECTION = 'fiction-letter';
export const voiceCatalogueRevision = '8b318b4e9955e3b7affe72cb21ea08cf8123a616eeab2eb1420ab105c7b65e6b';

export type VoiceTrackQuery = {
  collectionId?: string;
  locale?: Locale;
  contentId: string;
  datasetRevision: string;
};

/** Resolve whether the scoped catalogue has a clip for this content ID. */
export function lookupVoiceTrack({
  collectionId = DEFAULT_VOICE_COLLECTION,
  locale = DEFAULT_LOCALE,
  contentId,
  datasetRevision,
}: VoiceTrackQuery): VoiceTrack | undefined {
  const catalogue = demoVoiceMigrationV1Catalogues[collectionId]?.[locale];
  if (!catalogue || catalogue.datasetRevision !== datasetRevision
    || !Object.prototype.hasOwnProperty.call(catalogue.tracks, contentId)) return undefined;
  return catalogue.tracks[contentId];
}

export type { VoiceTrack };
