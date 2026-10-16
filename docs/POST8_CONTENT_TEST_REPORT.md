# Post8 content-test report (W4 T3a)

Task `task_480bda5473f3`. Baseline `2da4c62` + cherry-picks `3e6dbe2`,
`cde7d22`, `d3e1e15` (docs + `data/localized/*.json` only, no merge).
Original VI raw (`8b318b`) and 34-track manifest (`34925f`) verified untouched
(zero diff on `data/demo.json`, manifest, catalog).

## Command

`node --test tools/e2e/post8-content.test.mjs` (cwd repo root, Node 24
builtins only; real matcher `normalizeQuestion`/`findAnswer` imported from
`mobile/src/qa/match.ts`; no installs/servers/emulator/voice).

## Result: 47/47 pass, 0 fail, 0 skipped

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

## Spoken-v1 artifact verification (2026-10-16, read-only)

Source: `backend-luna/tools/voice/.cache/post8-probe-spoken-v1/` — 14 MP3
(6 product + 1 synthetic per voice, af_heart + bf_emma, Kokoro-82M
`f3ff3571…`), all bytes re-hashed MATCHING `audioSha256`; all 12 product
text hashes match approved EN source across both voices; spokenText hashes
self-consistent; ffprobe spot-checks mp3/24kHz/mono with durations matching
records (story 48.675s af / 46.15s bf); clipping 0. Failed 14-sample set
retained; no bulk/native until integrated first point.

ASR evidence is ENGINE probe only: `post8_asr_probe.py` calls direct
Whisper `model.transcribe(language=locale)` — requested vs reported language
are genuinely passed/compared (not echo-only), but forced-language
probability 1.0 is supplied-language metadata, NOT language identification,
and this path is NOT app→multipart→HTTP-gateway→worker→matcher evidence.
No EN HTTP gateway smoke done yet. Latest af_heart transcript shows NO
codewords (lexicon working) with remaining approximations (Bakma, Longdo,
Mamei, Zongsuan, Hwang, Booncha/Boonok); bf_emma has no ASR file yet.
Synthetic ASR ≠ mic/phone/human listening or naturalness QC.

## QC readiness table

| Check | State | Evidence |
| --- | --- | --- |
| Text inventory 100 tracks + matcher/pair/limits | PASS (47/47) | this suite |
| 34 VI assets + manifest hashes | PASS | this suite |
| Spoken-v1 14 MP3 hash/source/spoken | PASS (artifact) | above |
| EN codeword regression | PASS (artifact) | af_heart transcript |
| EN HTTP gateway smoke | MISSING | none yet |
| Native first-point VI/EN | MISSING | candidate pending |
| Human listening/naturalness | MISSING | — |
| Physical device/iPhone | MISSING | — |

Remaining concrete defects: EN intent verbs unparsed + VI-only voice session
(T3c, W3 logic / W2 wiring); live-`N` revision placeholder (root-covered);
34925f/CRLF provenance clarified in-suite; bf_emma ASR file absent.

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
  cards speak Vietnamese. Intent English logic: W3; locale passing + UI strings: W2.
- F2 (concrete, repro): EN action verbs unparsed — `parseVoiceIntent("stop")`,
  `"read the story"`, `"next chapter"`, `"open the QR scanner"`, `"open GPS"`,
  `"choose an experience"` all → `{"type":"question"}` (VI `"dung nghe"`→stop,
  `"mo qr"`→open-qr work). Plan slot parsing itself is already EN-capable
  (`food`→an thuc, `not food`→negation, `about 45 minutes`→45 — verified live).
  Intent logic: W3; wiring: W2 (prompt §6 requires real EN commands incl. negation).
  Repro ran the exact 604dd2f `intent.ts` (`git diff 604dd2f -- intent.ts` empty).
- F3 (concrete): at 604dd2f the voice session is VI-only end to end
  (`useVoiceSession.ts` hardcodes transcript `locale: 'vi'`, VI-only
  `messageForError`; no `localizedCatalog.ts` on this line). The locale-aware
  hook + `lookupVoiceTrack` exist only on the unmerged 672eedb line, whose own
  ref/cancel/error-locale handling reviewed clean. Integration must thread
  QaScreen locale+collectionId through — until then, no EN/pilot voice turn can
  resolve correctly. Owner: W1/W2 integration (hook line: W3).
  (Root already covers node reset, V1 fallback, live-N hash, persistence late
  read and old-locale source/full UI — not duplicated here.)
- F4 (concrete): `App.tsx` live `datasetRevision` falls back to synthetic
  `` `live-${liveRevision}` `` — a counter, not a content digest. Acceptable
  interim only; must become canonical-digest-checked (cf. verified fiction-EN
  `746e0d…`) before the native vertical. Owner: W2 with backend V2 revision.
- Observation (not a defect): on the 672eedb line, turn errors use
  `context.locale` while playback errors use render `locale` — suggest one rule.
- No additional V2-loader boundary defects beyond the 3 known W2-owned bugs
  (header-required, canonical-404, late-body); V1 loader behavior unchanged.
  Update 2026-10-16: those 3 fixes are closed (`7b7fc7a`, root 7 asserts green);
  the earlier candidate `78de2ab` 213-pass is superseded by scaffold `7b55d90`,
  where type passes but the UI VM harness fails a locale import (W2 fixing).
  213-test green recorded as regression signal only. Content suite below stays
  47/47 green and untouched by these lines.
- Cancel-claim qualification (2026-10-16): root's 672-hook replay proved a
  newer-turn clobber (VI ASR1 pending → render EN same scope/node/rev with
  cancel idle → EN start/submit ASR2 pending → OLD1 resolves → NEW stage idle
  instead of transcribing). The earlier “reviewed clean” note is WITHDRAWN as
  a broad guarantee; W3 voice fix + W2 regression assigned, evidence in root
  `POST8_COORDINATOR_REVIEW.md` (`5b23ddb`). No hook implementation here.

## T3e pre-firstpoint review: W2 20bd562 + W3 voice/backend lines (read-only)

Method: `git show` per commit (+ Temp-isolated hash/ffprobe/dictionary probes;
never checked out, nothing mutated). Prior T3c findings disposition: F1/F2
(EN intent unwired at 604dd2f) SUPERSEDED on the W3 line by `4e288ed`
(locale-dispatched intent, EN commands, translator-wired clarify/ambiguous) —
integration must merge both lines; F3 (VI-only session) addressed by 672eedb
hook + 20bd562 QaScreen locale/collectionId threading (verified present);
F4 live-`N` root-covered, W2 tasked.

- 12 BM tracks (`75e19e2`, provisional/not-shipping flags honest): all audio
  bytes, spokenText, source-text (vs approved `d3e1e15` copy) and textHash
  values verify; ffprobe spot-checks decode (EN story 61.2s/24kHz,
  VI horse 15.44s/48kHz, mp3/mono) matching manifest durations.
- Original 34 VI identity: zero diff `91ddfbd`→`75e19e2` on manifest, clips
  and demo fixture.
- Dictionary parity at `20bd562`: VI 321 / EN 321 keys, zero missing either
  side (so the VI-fallback path cannot leak today; parity test still advised).
- Removed W2 pure-logic regression tests were replaced by stronger mounted-App
  tests (late-locale persistence, node preservation, collection select,
  session locale wiring) — upgrade, no coverage loss.
- `7a32fcc` compact budgets (`1h30m`) range-checked downstream; no finding.
- CARRIED D1 revised 2026-10-16: reproduced on the W2 `20bd562` line (bare
  `recorder.stop()`, no `stopping` branch in `cancel()`), but the integrated
  candidate `d3ca196` already carries the timeout + recovery-lock fix with a
  dedicated stalled-stop lifecycle test (verified in-tree). Forward-carry
  WITHDRAWN; history kept above.
- CONFIRMED DUPLICATE closed: CLI `import-localized` V1-seeding verified fixed
  at `d3ca196` (one-line exclusion from the shared block; root repro shows all
  tables 0 + exit 1 on invalid import).
- NEW F5 (concrete, reachable flow traced, no guessing): `QaScreen.tsx`
  (`d3ca196`:739, :456, :546) branches verified-tag/waveform/disclaimer on
  `mode === 'demo'` alone, so the reviewed pilot bundle opened in demo mode
  gets “LỜI KỂ TRONG TRUYỆN”/“STORY PASSAGE” + fiction waveform/disclaimer
  instead of the sourced labels. Reachable: `App.tsx` demo source is
  `getBundledDataset(collectionId, locale)` and `old-quarter-pilot` is a
  selectable bundled collection. Fix direction: branch on dataset
  kind/collection (reviewed → sourced labels) in addition to mode. Owner: W2.
- Backend V2 (`7a6b61b`): strict single-locale query, canonical-digest pinning,
  atomic pair publish with pre-mutation validation, idempotent same-content,
  replace-gated backup, 404/503 split, `content-language` — contract-clean on
  read; runtime behavior awaits W3's backend tests + native vertical.

## T3d voice-hook behavior probe, candidate 8464054 (ignored probe, real hook)

Method: real candidate `useVoiceSession.ts` + `appState.ts` + `locale.ts` +
translator via VM transpile; only runtime adapters mocked with controlled
deferreds (probe lives in gitignored `tools/e2e/.runs/hook-probe/`, uncommitted
by design — W2 owns hook tests). 16/16 observed behaviors pass.

- Cancel sticks: late permission after cancel releases to idle with no
  recording (canCleanUpVoiceTurn guard works); slow permission without cancel
  completes to recording normally.
- Locale switch mid-transcribe cancels + runs native cleanup, stale resolve
  delivers nothing and never clobbers, new EN turn records afterwards.
- Playing switch stops old playback with no autoplay.
- D1 (concrete): `stopAtRecordingLimit` awaits native `recorder.stop()` with no
  deadline — a never-settling stop leaves stage `stopping` forever, and
  `cancel()` has no path out of `stopping`. Owner: W3.
- D2 (concrete): cancel during `preparing` keeps the stage until the pending
  permission/prepare settles; a hung native promise sticks `preparing` forever.
  Owner: W3 (deadline or cancel-release needed).
- D3/D4 (defensive, unreachable via UI today due to stage gating — no repro
  possible, reported as hardening debt): stale `stopAtLimit` completion
  force-idles without the candidate's own `canCleanUpVoiceTurn` check; `start`
  finally clears `permissionPendingRef` even if a newer turn set it.

## Native final-100 (2026-10-16, release 13b27f on emulator-5554 via mobile-mcp)

Build: candidate `5eae095`, APK SHA-256
`13b27ffd1c0494b7fa55f246ec8c64a0362e5f615188c444e940cc1542e05bfb`
(96,636,130 bytes, installed hash identical). Prior f2d0 findings (MM/DX
silent playback failure) were root-caused to a stale Expo asset manifest
(46-MP3 manifest vs 100-MP3 ZIP); this build carries the regenerated
132-entry/100-MP3 manifest and is a different artifact — old evidence below
is kept historical, new evidence governs.

PASS (all via mobile-mcp element refs on the project emulator, never the
listed iPhone): cold EN OS fallback; EN BM story 00:11/01:01 + answer
00:12/00:15 with stop; VI switch preserving point; MM EN story 00:24/01:09;
MM VI story 00:31/00:48; DX VI story 00:38/00:46; fiction EN story
00:09/00:24; VI BM answer with source + follow-ups; navigation-stop +
locale switch with no autoplay; QR denial (camera off + manual); GPS denial
via real OS dialog + manual confirm; unknown-Q refusal; mic permission
dialog → native recording → ready → cancel → idle; font 200 clean on
Prologue/Home/drawer/Qa/Location EN except the Home dock “Notebook” tab
wraps to two lines (“Noteboo/k”) — minor, routed to W2; full session
operable with reduce-motion on; all settings/permissions restored exactly.
PENDING (honest): in-place locale switch during active playback/recording
(no in-Qa toggle exists; hook-level covered separately); human listening and
mic audibility (AVD has no audio); real GPS fix; QR scan; physical
device/iPhone; bulk-54 human QC beyond synthetic evidence.
New guard `tools/e2e/audit_apk_assets.py` (+5 stdlib unittests, all pass):
FAILS stale f2d0 with exactly the 54 missing manifest entries, PASSES fixed
13b2 (100/100 multiset + per-file MD5/entry/name/raw-folder checks, including
a wrong-folder negative case).

## Limits (not covered here) — HISTORICAL d68223e section (superseded above)

Build: candidate `d68223e`, APK SHA-256
`d1ee78850c77c4e8595c53421e699402a4feefec1b0419d9b2295e405bfdcb6f`
(61,357,774 bytes, installed hash identical), backend `10.0.2.2:18886`
reviewed pilot live. Evidence: `tools/e2e/.runs/fp/` (binary PNG + fresh XML).

PASS: cold EN OS fallback (en-US device); EN BM Q&A sourced + 2 follow-ups;
EN answer play 00:10/00:14 + stop; VI switch preserving point; VI BM Q&A +
follow-ups; VI answer play 00:07/00:15 + stop; VI story play 00:08/00:46;
EN story play 00:07/01:01; manual VI persistence across force-stop relaunch;
MM missing-audio text fallback with no player; live reviewed drawer
(source/count/origin) + 3-node live map; live error/retry/no-fallback (Expo
build); QR denial (camera off + manual); GPS denial via real OS dialog +
manual confirm setting the point; unknown-Q refusal both locales; mic
permission dialog → 19s native recorder capture on the no-audio AVD (state
proof only, not human/physical mic proof) → ready → cancel → idle; font 150
renders cleanly (restored 1.0), font 200 explicitly pending (150 proves
nothing at 200); full session operable with reduce-motion on
(restored 1); settings/permissions restored exactly (CAMERA ignore,
locations foreground, airplane off); emulator stopped after evidence to
release RAM for TTS.
PENDING (honest): in-place locale-during-active-playback (path was
Back-navigation stop + switch; hook-level covered separately); human
listening/naturalness and mic audibility (AVD has no audio); real-GPS fix;
QR scan; physical device/iPhone; bulk-54 assets (12/66 present).
NOTE for W2 (routed, no source edit): EN answer toggle reads “Read story
text” on an answer card; Location manual rows append “simulated” next to
reviewed content and “10 min” editorial estimates — keep source-kind wording
distinct. Font200: Home/Qa/Location/drawer EN all readable with no truncation
except the Home dock “Notebook” tab wrapping to two lines — minor, routed.
No new app defects blocking feasibility beyond these.

## Limits (not covered here)

100-track text inventory verified; all 100 audio assets exist with hashes but
bulk-54 human listening/naturalness is NOT claimed (synthetic evidence only);
native vertical firstpoint done on BM + new-asset spots (MM/DX/fiction EN
stories); full six-node spoken coverage, TTS/STT engine detail, devices and
2026 freshness belong to later passes per `docs/POST8_QA_PLAN.md`. W2 owns V2
parser tests (not duplicated); W3 TTS in progress.

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

## Correction 2026-10-16 (font200 scope, see POST8_FINAL100_QA_REPORT.md §6)

The native final-100 paragraph above overclaimed font200 Home evidence: font200-home-en.png and font200-pilothome-en.png are AlleySelect screens, not Home, and are struck from Home evidence. AlleySelect at 200 keeps the VI filter row and an ellipsized area qualifier. Pilot Home font200-home2-en.png additionally shows reviewed trail cards worded with simulated minutes (wrong per reviewed/editorial/unmeasured contract; AlleyTrailView was not covered by the Location fix) plus the dock Notebook wrap and the Story-circle Sto clipping already routed to W2.
