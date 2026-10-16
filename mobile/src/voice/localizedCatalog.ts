import { DEFAULT_LOCALE, type Locale } from '../data/locale.ts';
import { voiceCatalogueRevision, voiceTracks, type VoiceTrack } from './catalog.ts';
import { POST8_VOICE_COLLECTION, post8VoiceCatalogues } from './post8Catalog.ts';

export const DEFAULT_VOICE_COLLECTION = 'fiction-letter';

export type VoiceTrackQuery = {
  collectionId?: string;
  locale?: Locale;
  contentId: string;
  datasetRevision: string;
};

/** Resolve a clip only when its locale, collection, and text revision match. */
export function lookupVoiceTrack({
  collectionId = DEFAULT_VOICE_COLLECTION,
  locale = DEFAULT_LOCALE,
  contentId,
  datasetRevision,
}: VoiceTrackQuery): VoiceTrack | undefined {
  if (collectionId === POST8_VOICE_COLLECTION) {
    const catalogue = post8VoiceCatalogues[locale];
    return catalogue?.datasetRevision === datasetRevision ? catalogue.tracks[contentId] : undefined;
  }
  if (collectionId !== DEFAULT_VOICE_COLLECTION || locale !== 'vi'
      || datasetRevision !== voiceCatalogueRevision) return undefined;
  return voiceTracks[contentId];
}

export { voiceCatalogueRevision };
export type { VoiceTrack };
