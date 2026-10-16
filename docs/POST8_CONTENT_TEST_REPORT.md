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

## T3c independent review of W2 604dd2f + W3 672eedb (2026-10-16, read-only)

Method: `git show` / isolated Temp extraction of the exact commits (never
checked out); behavioral repros executed from Temp, not committed as tests
(W2 owns incoming tests — no mirrors). Content-47 suite still green,
unchanged, 34 audio SHAs intact.

- Dictionary parity at 604dd2f: VI 160 keys / EN 160 keys, zero missing either
  side. `translate()` falls back to VI on missing keys by design — recommend a
  W2 parity unit test so future keys cannot silently leak VI into EN UI.
- F1 (concrete): the 8 `voice.intent.*` keys added in 604dd2f exist ONLY in
  `translator.ts` (zero references repo-wide); `intent.ts` hardcodes VI
  clarify/ambiguous strings and `parseVoiceIntent` takes no locale — EN voice
  cards speak Vietnamese. Owner: W2.
- F2 (concrete, repro): EN action verbs unparsed — `parseVoiceIntent("stop")`,
  `"read the story"`, `"next chapter"`, `"open the QR scanner"`, `"open GPS"`,
  `"choose an experience"` all → `{"type":"question"}` (VI `"dung nghe"`→stop,
  `"mo qr"`→open-qr work). Plan slot parsing itself is already EN-capable
  (`food`→an thuc, `not food`→negation, `about 45 minutes`→45 — verified live).
  Owner: W2 (prompt §6 requires real EN commands incl. negation).
- F3 (concrete): at 604dd2f the voice session is VI-only end to end
  (`useVoiceSession.ts` hardcodes transcript `locale: 'vi'`, VI-only
  `messageForError`; no `localizedCatalog.ts` on this line). The locale-aware
  hook + `lookupVoiceTrack` exist only on the unmerged 672eedb line, whose own
  ref/cancel/error-locale handling reviewed clean. Integration must thread
  QaScreen locale+collectionId through — until then, no EN/pilot voice turn can
  resolve correctly. Owner: W1/W2 integration.
- F4 (concrete): `App.tsx` live `datasetRevision` falls back to synthetic
  `` `live-${liveRevision}` `` — a counter, not a content digest. Acceptable
  interim only; must become canonical-digest-checked (cf. verified fiction-EN
  `746e0d…`) before the native vertical. Owner: W2 with backend V2 revision.
- Observation (not a defect): on the 672eedb line, turn errors use
  `context.locale` while playback errors use render `locale` — suggest one rule.
- No additional V2-loader boundary defects beyond the 3 known W2-owned bugs
  (header-required, canonical-404, late-body); V1 loader behavior unchanged.
  213-test green recorded as regression signal only.

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
