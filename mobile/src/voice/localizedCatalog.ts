import { DEFAULT_LOCALE, type Locale } from '../data/locale.ts';
import { voiceCatalogueRevision, voiceTracks, type VoiceTrack } from './catalog.ts';
import { POST8_VOICE_COLLECTION, post8VoiceCatalogues } from './post8Catalog.ts';
import { post8RemainingCatalogues } from './post8RemainingCatalog.ts';
import { THREE_LENSES_VOICE_COLLECTION, threeLensesVoiceCatalogues } from './threeLensesCatalog.ts';

export const DEFAULT_VOICE_COLLECTION = 'fiction-letter';

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
  const catalogues: { datasetRevision: string; tracks: Record<string, VoiceTrack> }[] = [];
  if (collectionId === DEFAULT_VOICE_COLLECTION && locale === 'vi' && datasetRevision === voiceCatalogueRevision) {
    catalogues.push({ datasetRevision: voiceCatalogueRevision, tracks: voiceTracks });
  }
  if (collectionId === POST8_VOICE_COLLECTION) {
    const firstpoint = post8VoiceCatalogues[locale];
    if (firstpoint) catalogues.push(firstpoint);
  }
  const remaining = post8RemainingCatalogues[collectionId]?.[locale];
  if (remaining) catalogues.push(remaining);
  if (collectionId === THREE_LENSES_VOICE_COLLECTION) catalogues.push(threeLensesVoiceCatalogues[locale]);

  for (const catalogue of catalogues) {
    if (catalogue.datasetRevision !== datasetRevision) continue;
    const track = catalogue.tracks[contentId];
    if (track) return track;
  }
  return undefined;
}

export { voiceCatalogueRevision };
export type { VoiceTrack };
