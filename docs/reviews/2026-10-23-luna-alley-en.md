# W3 A1 — English alley data contract

**Status:** A1 data work and verification complete in the shared working tree. The four English alley datasets are registered alongside the existing collections; no commit, push, merge, or deployment was made.

## Changes

- Added `data/localized/ngo-tam-thuong.en.json`, `data/localized/ngo-cam-chi.en.json`, and `data/localized/ngo-phat-loc.en.json`.
- Completed `data/localized/ngo-trung-yen.en.json`, including the full `alleyStory` and `guide` translations.
- Updated `mobile/src/data/collections.ts`: imported the three new datasets, removed `VI_ONLY_COLLECTION_IDS`, registered canonical EN revisions, and exposed the four alleys in EN.
- Removed the corresponding VI-only unavailable branch from `mobile/src/screens/HomeScreen.tsx`. This file also contains concurrent Home UI work; only its collection availability branch belongs to A1.
- Updated `mobile/tests/alleyGuideSection.test.mjs`, `mobile/tests/alleyIntegration.test.mjs`, `mobile/tests/fourAlleyDatasets.test.mjs`, and `mobile/tests/uiFlows.test.mjs` for EN availability, localization, revisions, and language switching.
- Updated `MEMORY.md` with A1 status and evidence.

## Revision and intro text digests

Revisions below are SHA-256 over `canonicalDatasetJson(dataset)`. Intro hashes are SHA-256 over each dataset's UTF-8 `intro.text` bytes.

| Collection | Nodes | Canonical EN revision | EN intro text SHA-256 |
| --- | ---: | --- | --- |
| `ngo-trung-yen` | 5 | `f5cfa76eda2d5d577b14ac73eaddc5a0ede0b89bc769b2eabb7b05006a95dc9f` | `9c0a84abce90dc423564b1a937b5f82d382684eeb03a237b0e0e60a5132edcdb` |
| `ngo-tam-thuong` | 2 | `e7f831942c2de61c7da2e1e3666800cbccbe13b39be0c7c29f25548be2299769` | `6f322a8fcd0379102bc4d7c5929b8b008bdaa8623294ee4e72cf640a3aec4c51` |
| `ngo-cam-chi` | 3 | `a2914b4a7eb324c369ddab77d977de93179e6be8e1012d8c5277443d95391072` | `385e1095fef7bec6b1db92f60bbcd445d6a2ba76d30ec0352b85c37a510ba17c` |
| `ngo-phat-loc` | 2 | `05dd3b4c79953eb4afa3418078714177bc8bf0a6b5944267733da66e1334d448` | `8f005d60452a42a74eb7bad2e8978b238893e21c0673b3157ab3234dec099af9` |

The four `intro.text` values match the corresponding paragraphs in `docs/content/FOUR_ALLEYS_EN_NARRATION_20261023.md` exactly after normalizing CRLF/LF. Node IDs, order, count, and evidence match VI for all four pairs. `alleyStory` paragraph counts and evidence, plus `guide` section counts and evidence, also match the corresponding VI datasets. The translated caveats preserve uncertainty about unverified dates, folklore, locations, hours, and business details.

## Proposed short `pendingCheck` copy

Suggested neutral copy for the UI: **“Some details have not been confirmed.”** This repeats the existing notice wording (“not confirmed” / “not checked”) without warning symbols, source labels, or a new factual claim. Keep the detailed dataset notices as their individual evidence-backed fields; this is a copy proposal for the FE owner, not a UI change in A1.

## Verification

- `npm test --prefix mobile` — 360 passed, 0 failed, 0 cancelled, 0 skipped.
- `npm run typecheck --prefix mobile` — passed.
- `npm run lint --prefix mobile` — passed.
- `git diff --check` — passed; Git emitted only its LF-to-CRLF working-copy notices.
- Backend import/readback — each of the four VI/EN pairs was imported through `backend/src/cli.mjs import-localized` into an isolated temporary SQLite database. The backend readback validated each pair and returned matching locale, collection ID, node counts, and canonical hashes. All temp database and backup artifacts were removed.

Backend scope was verification only: no backend code or schema changes. This checks the existing localized importer and pair validator; it does not claim live API/device coverage or production database behavior.

## Pending

- Coordinator correction: Claude approved EN narration under the user's delegation, so there is no remaining EN approval gate. A1 did not read a key or call audio APIs. A4 can generate Talia after the finalized EN datasets; keep humanApproved:false until listening is confirmed.
- VI voice generation is a separate next dispatch. This report does not approve narration pronunciation or real-device playback.
- No real-device, live API, or content fact re-verification was performed in this A1 dispatch.
