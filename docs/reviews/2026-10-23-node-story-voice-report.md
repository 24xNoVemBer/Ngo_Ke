# Node-story voice P3 report — 23 October 2026

## Result

Generated and registered all 17 Vietnamese and 17 English node-story tracks. The source text, canonical dataset revisions, pinned voices/models, and every output MP3 were verified; `humanApproved` and `listened` remain `false`.

The original 10,000-character reserve would have left only 4,864 characters and was not used. The user then chose a 4,000-character reserve for this P3 batch; that instruction superseded the earlier reserve. No quota extension was enabled and no voice or model fallback was used.

## ElevenLabs usage

| Locale | Voice | Model | Requests | Characters posted | Characters accepted |
| --- | --- | --- | ---: | ---: | ---: |
| VI | Nhật Phong (`6adFm46eyy74snVn6YrT`) | `eleven_v3` | 17 | 6,075 | 6,075 |
| EN | Talia (`OZ0L6eISlOejga3XjDFt`) | `eleven_v4` | 17 | 6,814 | 6,814 |
| **Total** |  |  | **34** | **12,889** | **12,889** |

All requests returned HTTP 200. No timeout, unknown outcome, failed request, or retry occurred. Requests used the existing voice settings and `mp3_44100_128` output format. The API key, raw response bodies, and account identifiers were not logged.

The read-only preflight reported 22,247 used of 40,000 characters, with 17,753 available. The estimate was 12,889; after reserving 4,000, 864 characters remained above the reserve. The subscription counter was 24,228 after VI and 25,016 after both locales, for a total counter increase of **2,769** (VI interval +1,981; EN interval +788). The reported counter delta is recorded separately from the 12,889 text characters accepted in successful TTS responses.

## Assets and hashes

The final manifest contains 34 complete entries with source `textHash`, `datasetRevision`, raw source-file hash, locale, pinned voice/model, request status, audio SHA-256/bytes, and approval/listening flags. Tests verified every entry against the current dataset and audio bytes; all 34 MP3s passed ffprobe checks and full FFmpeg decode.

- Manifest SHA-256: `6d3360ff2ba082abe2d3805b94b4e0d7131f1a22c89a0831a70b33d894ef74ec`
- Handoff SHA-256: `c058c225e6be168c5cca20645a99f27c8ea5a30d9cc90e1e4efd5d7aac4ac901`
- Registered catalogue SHA-256: `c6c9bc0bf48a3d56405f441764f896fea0d41824cd30d2eedd9d58c513925621`
- Existing alley-intro audio inventory SHA-256: `e52d25b8d467196579356010b751a0137a174835fabbecd0d14105a60c487b68`; all 8 VI/EN intro MP3s still match their existing manifest hashes.

## Changes

- Added `tools/voice/generate_node_stories.py` with source-hash guards, quota/voice/model preflight, per-request atomic progress, safe recovery from saved responses, and no retry for uncertain requests.
- Added `mobile/assets/voice/node-stories/` with 34 MP3s, `manifest.json`, and `progress.json`.
- Added `mobile/src/voice/nodeStoriesCatalog.ts` and connected it through `mobile/src/voice/localizedCatalog.ts`; the existing intro catalogue remains in place.
- Added `tools/voice/test_node_story_voice.py` and `mobile/tests/nodeStoryVoiceCatalogue.test.mjs` for source, progress recovery, manifest, catalogue lookup, and audio integrity.
- Added this report. No dataset text, dataset revisions, UI, cover assets, `.env.local`, or intro audio files were changed. No commit was made.

## Verification

- `npm test` — 382 passed, 0 failed, 0 skipped.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `python -m unittest tools.voice.test_node_story_voice` — 4 passed; no network calls.
- `python tools/voice/generate_node_stories.py` — source audit verified all 34 handoff text hashes and dataset revisions; 12,889 characters total.
- `git diff --check` — passed.

The pre-existing worktree edits in `docs/VOICE_GUIDE_FOUR_ALLEYS_20261022.md`, `docs/reviews/2026-10-23-codex-coordination.md`, `docs/superpowers/plans/2026-10-23-home-uiux-en-voice-handoff.md`, and the existing untracked quota handoff, Phase 1 spec, Antigravity review notes, and coordinator interim note were left untouched.

## Remaining review

Human listening and pronunciation review are still pending. This report and the manifest do not claim voice approval.
