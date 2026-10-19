# Post-8 ElevenLabs recordings

## Outcome — 2026-10-19

All 100 raw-source tracks are generated, decoded, hash-verified, installed into the active catalogues, and covered by the portable audit. The package remains provisional/source-only with `humanApproved=false`; no merge, push, publish, or device listening was performed.

## Inventory, budget, and account

- Inventory: 34 `fiction-letter` and 16 `old-quarter-pilot` tracks per locale, 100 total. Raw source contains EN 13,456 characters, VI 12,097, total 25,553.
- Frozen config: ElevenLabs `eleven_v4`; Thắm (`0ggMuQ1r9f9jqBu50nJn`) for VI and Talia (`OZ0L6eISlOejga3XjDFt`) for EN; stability 0.5, similarity 0.75, `mp3_44100_128`.
- The pre-paid dry run recorded 9,909 initial account characters, a 40,000 limit, overage disabled, and a 20,091 new-run cap (30,000 project cap less 9,909 prior spend). The full one-credit-per-character reserve is 25,553, 5,462 above the run cap; requests were guarded against measured account usage and committed cost.
- The two-caption checkpoint cost 63 credits. The remaining 100-track run cost 10,213 credits in total, including the single authorized recovery retry at 72 credits. Closing account count is 20,122/40,000, remaining 19,878, overage disabled; the 10,213 account delta exactly matches all reconciled new-track costs. Total project spend is 20,122, within the 30,000 cap.
- The dry run and active manifest preserve hashes for 212 existing MP3s, one AAC smoke fixture, and 226 voice/cue/manifest/source files. W1 independently verified all 100 new MP3 hashes, the 212 old MP3 Git blobs, all 226 protected-file hashes, and the final account snapshot.

## Unknown-attempt recovery and history evidence

The original `vi/fiction-letter/qa-huong-answer` attempt remains preserved as `unknown`, including its 180-credit reservation and error record. W1's one-time decision `msg_818b36961501` authorized exactly one retry after stable no-charge account observations; the retry returned request `ZgNqTlY7m3jNCfV5TCgs`, header cost 72/180, audio SHA-256 `943a346b4f50f39fc86eddc04534fb72a356c4a4fe3df2bb37d9340c702daf16`, and decoded mono 44.1 kHz, 128 kbps MP3, 13.04 seconds. The original 180-credit risk was retained through final account reconciliation, then resolved as no charge; no further paid calls were made.

W1 corrected the interpretation of the provider history responses: list/detail records redact text and voice ID, so raw-text/voice matching is unavailable, not a verified zero-match result. The independent full-history reconciliation instead matched all 156 request IDs and per-request cost ranges against the 56 accepted plus 100 new manifests, with no missing or extra IDs; all model/format fields matched and the combined costs sum to 20,122. The retry maps to history item `7O7zEADMwTa0TALHG5EY`, with account characters 17,427 to 17,499 (+72); text and voice are redacted there as well. Both the earlier pagination observations and the corrected interpretation are retained in the recovery manifest evidence.

## Provenance and license status

The output manifest and [LICENSES.md](../../mobile/assets/voice/post8/remaining-elevenlabs/LICENSES.md) record provider, model, voice IDs, settings, source hashes, request/cost evidence, and the applicable Terms reference. `noticeSha256` is SHA-256 of UTF-8 notice text normalized to LF line endings; audio, source, and catalogue hashes remain byte-exact. The [ElevenLabs Terms of Service](https://elevenlabs.io/terms-of-use) page showed last updated 2026-10-09 when checked; the observed API tier was `starter`, which does not independently establish the applicable regional agreement or paid-subscription status. No redistribution license is asserted; confirm the account agreement, rights to source text, and any attribution terms before distribution.

## Verification

- Portable audit: 100/100 MP3s decode; all active catalogue entries and source hashes match; account delta and cost evidence reconcile; `humanApproved=false`.
- Renderer tests: 25/25 pass, including the duration-collision audit and one-time recovery journal regression.
- Catalogue regressions: 6/6 pass. They preserve archived audio hashes, validate active manifest/source/voice/revision/duration mappings, exercise production lookup for all 100 new tracks and the unchanged 56 Three Lenses tracks, and count 156 active static requires.
- Full mobile tests: `npm test` passes 233/233; `npm run typecheck` passes; `npm run lint` reports no issues; `git diff --check` passes.
- Human pronunciation/listening and device playback checks remain unperformed. The audio is not human-approved.

## Local commit

Prepared for local commit on `valentino/post8-backend`; no push or merge is included.
