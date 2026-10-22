# W3 A4 — English alley intro voice

**Date:** 23/10/2026  
**Outcome:** Four EN intro tracks generated and registered. No paid request has an uncertain outcome.

## Generation

The offline audit read the finalized EN `intro.text` values byte-for-byte from the A1 datasets and matched the approved narration and A1 revision/text digests. Direct generation used Talia (`OZ0L6eISlOejga3XjDFt`), `eleven_v4`, `language_code: en`, voice settings `stability: 0.5` and `similarity_boost: 0.75`, and `mp3_44100_128`. Each TTS request returned HTTP 200; all four tracks were decoded, validated, and recorded complete.

| Collection | Characters | Duration (s) | Bytes | Dataset revision | EN text SHA-256 | Audio SHA-256 |
| --- | ---: | ---: | ---: | --- | --- | --- |
| `ngo-trung-yen` | 792 | 48.000 | 769,087 | `f5cfa76eda2d5d577b14ac73eaddc5a0ede0b89bc769b2eabb7b05006a95dc9f` | `9c0a84abce90dc423564b1a937b5f82d382684eeb03a237b0e0e60a5132edcdb` | `e9fa758101c2eb165ae1cd9c813c1db88aacb83180bdc39d85e6aeb6b1f8f238` |
| `ngo-tam-thuong` | 653 | 39.840 | 638,684 | `e7f831942c2de61c7da2e1e3666800cbccbe13b39be0c7c29f25548be2299769` | `6f322a8fcd0379102bc4d7c5929b8b008bdaa8623294ee4e72cf640a3aec4c51` | `efd794ba6829081b4641aa4ae6ce51cf279c9c3bfeefc247214269bdefa71b04` |
| `ngo-cam-chi` | 727 | 44.960 | 720,604 | `a2914b4a7eb324c369ddab77d977de93179e6be8e1012d8c5277443d95391072` | `385e1095fef7bec6b1db92f60bbcd445d6a2ba76d30ec0352b85c37a510ba17c` | `45ec91a452acab1406fc50fa3f2dd0ba9501389ba9c5065dea4f736d1d49f783` |
| `ngo-phat-loc` | 709 | 41.120 | 659,164 | `05dd3b4c79953eb4afa3418078714177bc8bf0a6b5944267733da66e1334d448` | `8f005d60452a42a74eb7bad2e8978b238893e21c0673b3157ab3234dec099af9` | `e7463b673699772539237664fe878163e0a9a030bae88c01a391a5cfaaa060ca` |

**Total:** 2,881 characters sent in 4 TTS POSTs; the API returned and the generator accepted all 2,881 characters. The immediate before/after subscription read recorded delta 0; a later read-only check from the same run baseline reported **+1,153**. The usage counter had not caught up to the accepted character total at that follow-up, so this report records the observed meter delta without interpreting it as final billing or zero cost.

## Catalogue and status

- Registered four static EN asset requires in `mobile/src/voice/alleysCatalog.ts`; each entry uses the current EN dataset revision, exact text hash, and manifest duration.
- The manifest and progress are `mobile/assets/voice/alleys-intro/manifest.en.json` and `progress.en.json`. The four MP3s are under `mobile/assets/voice/alleys-intro/en/`.
- All four audio files decode as MP3, mono, 44.1 kHz; their file SHA-256 values match the manifest. The catalogue test resolves each real asset path and verifies the audio hash and current source revision/text hash.
- All entries remain `humanApproved: false`, `listened: false`, and `selectedForShipping: false`. The tracks have not been auditioned.
- VI reservations remain empty and text fallback remains active. A3 is still blocked because the exact pinned Nhật Phong voice is unavailable to the configured account; this dispatch created no VI audio. Full eight-track VI+EN coverage is pending A3.
- No EN/VI dataset JSON, collection registry, screen, or FE files were changed by this dispatch. No previous audio bytes were modified.

## Checks

- `python tools/voice/generate_alleys_intro.py --locale en` — four finalized texts, 2,881 characters; canonical revisions and text hashes match the A1 EN report; 0 API requests.
- `python tools/voice/generate_alleys_intro.py --locale en --generate` — 4 TTS POSTs, all HTTP 200, 2,881 characters posted and accepted; all progress states `complete`; approval/listened flags remain false.
- `python tools/voice/test_generate_alleys_intro.py` — 7/7 passed.
- `node --test mobile/tests/alleysVoiceCatalogue.test.mjs` — 2/2 passed.
- `npm --prefix mobile run typecheck` — passed.
- `npm --prefix mobile run lint` — passed.
- `git diff --check` — passed; Git reported only line-ending conversion notices on shared worktree files.
- The full mobile suite was not rerun in this dispatch because FE files are changing concurrently; the previous shared snapshot in the VI report was 347/360, with 13 failures in concurrent FE tests and both alley voice catalogue tests passing.

## Pending

- Listen to all four EN tracks before changing any approval, listened, or shipping metadata; pronunciation has not been reviewed.
- Resume A3 only after the configured account can access the exact pinned Nhật Phong voice. Do not substitute another voice or model.
- The provider usage counter reported +1,153 after accepting 2,881 characters; the final account meter has not been reconciled beyond that follow-up read.
