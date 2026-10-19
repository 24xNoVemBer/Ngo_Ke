/* eslint-disable @typescript-eslint/no-require-imports -- Metro needs statically analyzable asset requires. */
import type { Locale } from '../data/locale';
import type { VoiceTrack } from './catalog';

export const POST8_VOICE_COLLECTION = "old-quarter-pilot";
export const post8VoiceCatalogues: Record<Locale, { datasetRevision: string; tracks: Record<string, VoiceTrack> }> = {
  en: {
    datasetRevision: "d75fcc183863f7ea2ec3b24bba1c4664b762c6332f0eb768a3493d9e74089b83",
    tracks: {
      "intro": { id: "intro", kind: "intro", source: require("../../assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/en/intro.mp3"), textHash: "2eaef8c606b145adb829122ecac5d131daa6bc5f71e1f86024894bdec5fd2bc7", durationSeconds: 22.08 },
      "oldquarter-bach-ma-story": { id: "oldquarter-bach-ma-story", kind: "story", nodeId: "oldquarter-bach-ma", source: require("../../assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/en/oldquarter-bach-ma-story.mp3"), textHash: "42afea2a073e26fabb13cae2a0f475cb13a4ee87c2391d2cf4dfb0663f4363be", durationSeconds: 50.16 },
      "oldquarter-bach-ma-caption": { id: "oldquarter-bach-ma-caption", kind: "caption", nodeId: "oldquarter-bach-ma", source: require("../../assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/en/oldquarter-bach-ma-caption.mp3"), textHash: "b04c2038b3ac65996be69e5a404a2e46020e63acf98634c5c5f733daeb904937", durationSeconds: 5.68 },
      "bm-guardian-answer": { id: "bm-guardian-answer", kind: "answer", nodeId: "oldquarter-bach-ma", source: require("../../assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/en/bm-guardian-answer.mp3"), textHash: "8bcd776ac9b558e5c283ebca29c15901871058f207115cf5a66c9142ac2132c9", durationSeconds: 12.4 },
      "bm-horse-answer": { id: "bm-horse-answer", kind: "answer", nodeId: "oldquarter-bach-ma", source: require("../../assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/en/bm-horse-answer.mp3"), textHash: "1102222215f752d53558613cd1d3d07b43ef7a5fe1ec9e15512228fbfa3ad1aa", durationSeconds: 15.04 },
      "bm-observe-answer": { id: "bm-observe-answer", kind: "answer", nodeId: "oldquarter-bach-ma", source: require("../../assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/en/bm-observe-answer.mp3"), textHash: "2b8ec05c6f58f8d15109aff9cc23cf33ab43b7d48851acd657088b38fc2ba70e", durationSeconds: 15.28 },
    },
  },
  vi: {
    datasetRevision: "358209bc5bf8f14e47a3598b93644d168219d919dcb66d9eb1f7cbb7dbd2c94a",
    tracks: {
      "intro": { id: "intro", kind: "intro", source: require("../../assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/vi/intro.mp3"), textHash: "d068452c872f13e4f125f7a326986928fddc3d42c9eaa88ae2a426c7f26b1e5b", durationSeconds: 23.76 },
      "oldquarter-bach-ma-story": { id: "oldquarter-bach-ma-story", kind: "story", nodeId: "oldquarter-bach-ma", source: require("../../assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/vi/oldquarter-bach-ma-story.mp3"), textHash: "d98216f5feaf1682261e9b3b01b7cbc13b2822fdf2f1eb0e220848c87fb7a5b0", durationSeconds: 54.24 },
      "oldquarter-bach-ma-caption": { id: "oldquarter-bach-ma-caption", kind: "caption", nodeId: "oldquarter-bach-ma", source: require("../../assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/vi/oldquarter-bach-ma-caption.mp3"), textHash: "d8e61b8540069307dae429fc25bd795a10935dcf621a3cf5f5a9f868027840e4", durationSeconds: 5.84 },
      "bm-guardian-answer": { id: "bm-guardian-answer", kind: "answer", nodeId: "oldquarter-bach-ma", source: require("../../assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/vi/bm-guardian-answer.mp3"), textHash: "358c57d387758d89d825410016cc8c1beb730fe259f43950f06d68b741c70d3e", durationSeconds: 12.4 },
      "bm-horse-answer": { id: "bm-horse-answer", kind: "answer", nodeId: "oldquarter-bach-ma", source: require("../../assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/vi/bm-horse-answer.mp3"), textHash: "b5db1888117c52887a8092d8006862ab815c247738927dea785ebf5a158870e7", durationSeconds: 16.72 },
      "bm-observe-answer": { id: "bm-observe-answer", kind: "answer", nodeId: "oldquarter-bach-ma", source: require("../../assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/vi/bm-observe-answer.mp3"), textHash: "513eecf4451de695cab022e1b122bd045143c9a1833e6f73670ffad6925c256d", durationSeconds: 15.04 },
    },
  },
};
