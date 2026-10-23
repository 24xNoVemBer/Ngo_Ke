import type { Locale } from '../data/locale.ts';
import type { VoiceTrack } from './catalog.ts';

/* eslint-disable @typescript-eslint/no-require-imports -- Metro needs statically analyzable asset requires. */
export const ALLEY_INTRO_VOICE = {
  voiceId: '6adFm46eyy74snVn6YrT',
  modelId: 'eleven_v3',
  locale: 'vi',
} as const;

// Reservations pin source text; only locale catalogue entries below are playable.
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

const vietnameseIntroTracks: Record<string, VoiceTrack> = {
  'ngo-trung-yen': {
    id: 'intro', kind: 'intro', source: require('../../assets/voice/alleys-intro/vi/ngo-trung-yen-intro.mp3'), textHash: '05cd6a7070c4fc90e8f148d9ff6719c70bf72e318acee918b916476e068e143c', durationSeconds: 40.4,
  },
  'ngo-tam-thuong': {
    id: 'intro', kind: 'intro', source: require('../../assets/voice/alleys-intro/vi/ngo-tam-thuong-intro.mp3'), textHash: '846bf31e046012f7f1526a3b5d6328ef218807f9efc30ce6cde792f6f42ef8bc', durationSeconds: 37.52,
  },
  'ngo-cam-chi': {
    id: 'intro', kind: 'intro', source: require('../../assets/voice/alleys-intro/vi/ngo-cam-chi-intro.mp3'), textHash: '3b45c4d9b90e0d69ddd09a2d47e93de2de1eb3ad00dea199b7cd3e73ec5a9a92', durationSeconds: 38.4,
  },
  'ngo-phat-loc': {
    id: 'intro', kind: 'intro', source: require('../../assets/voice/alleys-intro/vi/ngo-phat-loc-intro.mp3'), textHash: 'd6a9cbbc66c17a3c6c6ae20074887c542fb5d716d28ffdcb598b6e429a48d401', durationSeconds: 37.28,
  },
};

const englishIntroCatalogues: Record<string, { datasetRevision: string; track: VoiceTrack }> = {
  'ngo-trung-yen': {
    datasetRevision: 'f5cfa76eda2d5d577b14ac73eaddc5a0ede0b89bc769b2eabb7b05006a95dc9f',
    track: { id: 'intro', kind: 'intro', source: require('../../assets/voice/alleys-intro/en/ngo-trung-yen-intro.mp3'), textHash: '9c0a84abce90dc423564b1a937b5f82d382684eeb03a237b0e0e60a5132edcdb', durationSeconds: 48 },
  },
  'ngo-tam-thuong': {
    datasetRevision: 'e7f831942c2de61c7da2e1e3666800cbccbe13b39be0c7c29f25548be2299769',
    track: { id: 'intro', kind: 'intro', source: require('../../assets/voice/alleys-intro/en/ngo-tam-thuong-intro.mp3'), textHash: '6f322a8fcd0379102bc4d7c5929b8b008bdaa8623294ee4e72cf640a3aec4c51', durationSeconds: 39.84 },
  },
  'ngo-cam-chi': {
    datasetRevision: 'a2914b4a7eb324c369ddab77d977de93179e6be8e1012d8c5277443d95391072',
    track: { id: 'intro', kind: 'intro', source: require('../../assets/voice/alleys-intro/en/ngo-cam-chi-intro.mp3'), textHash: '385e1095fef7bec6b1db92f60bbcd445d6a2ba76d30ec0352b85c37a510ba17c', durationSeconds: 44.96 },
  },
  'ngo-phat-loc': {
    datasetRevision: '05dd3b4c79953eb4afa3418078714177bc8bf0a6b5944267733da66e1334d448',
    track: { id: 'intro', kind: 'intro', source: require('../../assets/voice/alleys-intro/en/ngo-phat-loc-intro.mp3'), textHash: '8f005d60452a42a74eb7bad2e8978b238893e21c0673b3157ab3234dec099af9', durationSeconds: 41.12 },
  },
};

export const alleysVoiceCatalogues: Record<string, Partial<Record<Locale, {
  datasetRevision: string;
  tracks: Record<string, VoiceTrack>;
}>>> = Object.fromEntries(pendingAlleyIntroSlots.map((slot) => {
  const vietnameseIntro = vietnameseIntroTracks[slot.collectionId];
  const english = englishIntroCatalogues[slot.collectionId];
  return [slot.collectionId, {
    vi: { datasetRevision: slot.datasetRevision, tracks: { intro: vietnameseIntro } },
    en: { datasetRevision: english.datasetRevision, tracks: { intro: english.track } },
  }];
}));
