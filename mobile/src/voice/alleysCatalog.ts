import type { Locale } from '../data/locale.ts';
import type { VoiceTrack } from './catalog.ts';

export const ALLEY_INTRO_VOICE = {
  voiceId: '6adFm46eyy74snVn6YrT',
  modelId: 'eleven_v3',
  locale: 'vi',
} as const;

// Pending slots describe text only; they must never be treated as playable clips.
export const pendingAlleyIntroSlots = [
  {
    collectionId: 'ngo-trung-yen', contentId: 'intro',
    datasetRevision: '1291ae869a7d66b684d3bd764f87fe99817d250d19c544da0938e30f8ec5ae19',
    textHash: '05cd6a7070c4fc90e8f148d9ff6719c70bf72e318acee918b916476e068e143c',
  },
  {
    collectionId: 'ngo-tam-thuong', contentId: 'intro',
    datasetRevision: '3086e80f2dda45e2354289882cb89a6526574fa98b5cfe4f2f17f02d092745e9',
    textHash: '846bf31e046012f7f1526a3b5d6328ef218807f9efc30ce6cde792f6f42ef8bc',
  },
  {
    collectionId: 'ngo-cam-chi', contentId: 'intro',
    datasetRevision: 'b7898f698efc6b8db0a137d151bfc622fef52082bdfc2f8d97c44b1b2e08b48c',
    textHash: '3b45c4d9b90e0d69ddd09a2d47e93de2de1eb3ad00dea199b7cd3e73ec5a9a92',
  },
  {
    collectionId: 'ngo-phat-loc', contentId: 'intro',
    datasetRevision: 'd6e9fc6d93f4f0961dd20bdd0128df35229f33e0e89caf2071dccc9f46aff195',
    textHash: 'd6a9cbbc66c17a3c6c6ae20074887c542fb5d716d28ffdcb598b6e429a48d401',
  },
] as const;

export const alleysVoiceCatalogues: Record<string, Partial<Record<Locale, {
  datasetRevision: string;
  tracks: Record<string, VoiceTrack>;
}>>> = Object.fromEntries(pendingAlleyIntroSlots.map((slot) => [slot.collectionId, {
  vi: { datasetRevision: slot.datasetRevision, tracks: {} },
}]));
