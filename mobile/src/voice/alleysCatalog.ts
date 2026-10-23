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
    datasetRevision: '59e84df99d75369d5cfb53df901c8c3e748d0d528e5f4334acfc07b20029d7c9',
    textHash: '05cd6a7070c4fc90e8f148d9ff6719c70bf72e318acee918b916476e068e143c',
  },
  {
    collectionId: 'ngo-tam-thuong', contentId: 'intro',
    datasetRevision: '41e95b6510f06fbabb9d0a776cb1fec7f204e2f21244ebd57161724e9efb7271',
    textHash: '846bf31e046012f7f1526a3b5d6328ef218807f9efc30ce6cde792f6f42ef8bc',
  },
  {
    collectionId: 'ngo-cam-chi', contentId: 'intro',
    datasetRevision: 'f658ad9a1ab8c52fe4fe4daaaf7d87b59553da9617b424702ba8f64dc619a4a4',
    textHash: '3b45c4d9b90e0d69ddd09a2d47e93de2de1eb3ad00dea199b7cd3e73ec5a9a92',
  },
  {
    collectionId: 'ngo-phat-loc', contentId: 'intro',
    datasetRevision: 'c2a2b2afc53b52b2a0770ba1d23a80c2dfe08507e5ece19a2c4edff703e33d6a',
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
    datasetRevision: '50ecf581900181a2589571b820d3b43710a7f19daa0d947fe7bab9d9c3100741',
    track: { id: 'intro', kind: 'intro', source: require('../../assets/voice/alleys-intro/en/ngo-trung-yen-intro.mp3'), textHash: '9c0a84abce90dc423564b1a937b5f82d382684eeb03a237b0e0e60a5132edcdb', durationSeconds: 48 },
  },
  'ngo-tam-thuong': {
    datasetRevision: '0afc9ed695fac834fb53010893d855a7aabfc87ec61bf9ac8a74eddf0c176efd',
    track: { id: 'intro', kind: 'intro', source: require('../../assets/voice/alleys-intro/en/ngo-tam-thuong-intro.mp3'), textHash: '6f322a8fcd0379102bc4d7c5929b8b008bdaa8623294ee4e72cf640a3aec4c51', durationSeconds: 39.84 },
  },
  'ngo-cam-chi': {
    datasetRevision: '2f75572bb84552fcd6ba0602e9682170a00b614bc1aa2a1a7ac6aa36fb60c877',
    track: { id: 'intro', kind: 'intro', source: require('../../assets/voice/alleys-intro/en/ngo-cam-chi-intro.mp3'), textHash: '385e1095fef7bec6b1db92f60bbcd445d6a2ba76d30ec0352b85c37a510ba17c', durationSeconds: 44.96 },
  },
  'ngo-phat-loc': {
    datasetRevision: '5ac2c7c70a755c416baf4538598cac45e9a56eb102cf101fa7b670c36ab0692f',
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
