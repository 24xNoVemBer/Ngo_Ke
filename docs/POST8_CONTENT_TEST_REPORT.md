# Post8 content-test report (W4 T3a)

Task `task_480bda5473f3`. Baseline `2da4c62` + cherry-picks `3e6dbe2`,
`cde7d22`, `d3e1e15` (docs + `data/localized/*.json` only, no merge).
Original VI raw (`8b318b`) and 34-track manifest (`34925f`) verified untouched
(zero diff on `data/demo.json`, manifest, catalog).

## Command

`node --test tools/e2e/post8-content.test.mjs` (cwd repo root, Node 24
builtins only; real matcher `normalizeQuestion`/`findAnswer` imported from
`mobile/src/qa/match.ts`; no installs/servers/emulator/voice).

## Result: 46/46 pass, 0 fail, 0 skipped

- Inventory: fiction VI 6/21 (V1 implicit locale), fiction EN 6/21
  (`fiction-letter`), pilot VI/EN 3/9 reviewed (`old-quarter-pilot`); 30 QAs
  per locale with shared logical IDs across locales and disjoint collection
  namespaces.
- Pair parity: node IDs/order/meta/geometry/tags and QA IDs/order/nodeId/
  followUps identical EN↔VI; reviewed metadata on intro + every node + every QA.
- Graph: unique IDs, resolvable refs, globally unique normalized Q+alias keys
  per dataset (the cross-node isolation basis).
- Matcher: all questions + aliases resolve within node; unknown/empty stay
  unknown; cross-node and cross-locale wording stays unknown (full sweeps).
- Limits: all 4 raw bodies ≤512KiB; story/answer ≤2000, caption ≤220,
  intro ≤4000, aliases 1..7, followUps ≤2, evidence 1..20.
- Semantics: BM legend framing both locales; DX food dated 2024 + current-stall
  and allergy refusal; Bạch Mã null/null with no mock; MM/DX coords finite and
  locale-equal; OSM attribution in both disclaimers.
- Manifest: `sourceDataSha256` matches `data/demo.json` bytes; 34 entries in
  canonical order with recomputed text hashes, 64-hex audio hashes, durations;
  every MP3 file on disk re-hashed against its `audioSha256` (>2KB each);
  manifest bytes pinned to git source `91ddfbd` byte-for-byte.
- Shared V2 parser/pair: real `parseDatasetV2` + `validateDatasetV2Pair` accept
  the pilot pair, reject wrong-locale/wrong-schema/dangling-ref inputs, and the
  pair gate reports node-count and locale mismatches with reasons. The earlier
  own-helper pair test and the name-absence asset test were removed as
  non-proving; no second validator was built (W2 owns parser tests).
- One test-side fix during development: the membership assertion first wrongly
  required 60 globally-unique QA IDs; locales share logical IDs by contract,
  so the test was corrected (data untouched).
- Provenance corrected 2026-10-16 (root-verified in all 4 worktrees): raw
  working-tree manifest bytes (13112 B, CRLF checkout) hash to the historical
  `34925f…` anchor; LF-normalized (12783 B) hashes to `92e277…`, exactly the git
  blob at `91ddfbd`. The 329-byte gap is Git EOL normalization, not a gap and
  not a source change — both anchors are now asserted (raw Buffer reads only),
  and no file/EOL/source rewrite was made. MP3 byte hashes are unaffected.

## Limits (not covered here)

100-audio coverage is NOT claimed: only the 100-track text inventory plus the
34 original VI assets exist; 66 new tracks pending. Audio bytes/format,
native vertical, TTS/STT, devices and 2026 freshness belong to later passes
per `docs/POST8_QA_PLAN.md`. W2 owns V2 parser tests (not duplicated);
W3 TTS in progress.

## Shared-parser readonly review (beyond the 3 known V2-loader bugs)

Reviewed `canonicalJson.ts`, `isDatasetV2`/nullable-geometry pair rule,
`validateDatasetV2Pair` and `loadLiveSourceV2` against
`POST8_COORDINATOR_REVIEW.md` §Shared stage 1 (header-required, canonical-404,
late-body — all W2-owned, fixes in progress). No additional concrete bad
acceptance found: locale is strict-matched, single-null geometry rejected,
503 maps to error (never ready), canonical serialization is deterministic
(key sort, order-preserving arrays, no normalization), and the V1 loader keeps
its Phase 8 behavior. Existing 213 mobile tests passing is recorded as
regression signal only, not proof of no further bugs.
