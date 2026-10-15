# Phase 8 QA Report (T3) — 2026-10-16

Scope: review + HTTP integration + native E2E for the Phase 8 integration line.
Task: `task_d82ac6443e6d` · Run `run_a728dba15869` · Worker W4 (OpenCode Muse).

## SHAs under test

| Layer | SHA | Content |
| --- | --- | --- |
| Integration base (HEAD at start) | `d49b550a0dc57acffce16ab5dae82983f16b2af4` | merge W2 parser + W3 backend + W4a guards |
| W2 app parser/adapter | `c16b662` + `0422ed5` | shared `parseDataset` live contract, live adapter, abort/timeout |
| W2 live-env fix (cherry-picked, no hand edit) | `4b7ffcb` → local `1de3364` | explicit `process.env.EXPO_PUBLIC_…` for bundler inlining (dev bundles evaluated `process.env` at runtime, so Expo-Go live passed; production Babel inlines statically, so the release APK needed this) |
| W3 backend | `2963fb8` + `c1b65fc` | Node24 + node:http/node:sqlite read-only JSON API |
| W3 boundary fix (cherry-picked, no hand edit) | `0399821` → local `7179193` | 512KiB aggregate budget on import/read |
| Voice netsec plugin (cherry-picked, separate integration) | `0ad83c1` → local `94b4653` | private-HTTP API allowlist, API-only, no journey impact |
| W4 harness + this report | uncommitted → commit below | `tools/e2e/*`, `agent_docs/testing.md`, this file |

No app/backend source was hand-edited by W4. No merge to main, no push, no deploy.

## Commands and results (all PASS)

| Command (cwd repo root unless noted) | Result |
| --- | --- |
| `npm test` (mobile/) | 197/197 |
| `npm run typecheck` + `npm run lint` (mobile/) | exit 0 / exit 0 |
| `node --test backend/tests/*.test.mjs` | 19/19 (incl. W3 aggregate-budget cases) |
| `node --test tools/e2e/guards.test.mjs` | 33/33 |
| `node --test tools/e2e/phase8-http.test.mjs` | 15/15 (real loopback backend on temp DB + live-adapter transport faults; aggregate repro now asserts import rejection pre-mutate) |
| `node tools/e2e/native-flow.mjs --runs 1` (env: `ANDROID_SERIAL=emulator-5554`, `NGOKE_DEV_HOST=10.0.2.2`, `NGOKE_EXPO_PORT=8085`) | **19/19** |

Evidence: `tools/e2e/.runs/<stamp>/` (gitignored): `native-flow.json`, `*.xml` dumps,
binary-safe `*.png` (PNG signature verified before write). Manual fault-injection shots:
`tools/e2e/.runs/live-error-manual/`.

## Native coverage (19/19 scripted + manual fault injection)

Device: `emulator-5554` (Medium_Phone_API_37.0, API 37), Expo Go 57, Metro bundle built
from the source tree (6,083,121 chars, live label + API URL verified in bundle).
Backend: temp DB (6 nodes / 21 QA simulated), `0.0.0.0:8086` + `SERVE_SIMULATED_DATA=true`.

- Entry Prologue → Landing → alley card → Home; Home lists all six fixture nodes + Demo label.
- Q&A: fixture chip → sourced answer (`Nguồn nội dung:`) → expand shows asked question →
  follow-up re-answers with source → reset returns chips → typed unknown refused
  (`Chưa có dữ liệu`), never invented.
- Plan (`Chủ đề Ẩm thực ngõ` + 45 phút) → header `Chủ đề ẩm thực · 45 phút`, picks within 1..3.
- Camera manual choice → `ĐIỂM ĐÃ XÁC NHẬN`; Location manual confirm works; emulator GPS
  yields no candidate and never auto-switches the point.
- Live switch → drawer shows source/count/origin (`http://10.0.2.2:8086`) and the live map
  renders all six fixture nodes; back to demo works.
- Manual fault injection (own server stopped/restarted): backend down → `Chưa có dữ liệu
  hỏi đáp` + `Thử lại`, stays live, no demo fallback; retry-while-down still errors;
  restart + retry → live ready with 6 nodes.
- Release APK (`app-release.apk`, 125,227,724 bytes,
  SHA-256 `F4FF952226F614F37E6F33BE30375628F38DD1D290021D7C65DAA96204FD2F0E`,
  app source `4b7ffcb`, installed as `com.valentino241.ngokedemo` with byte-identical
  on-device hash): offline cold start (airplane mode) renders Prologue → Home with all
  six fixture nodes in demo; live switch loads the LAN backend (drawer source/count/
  origin + live map `Đã mở 0/6 câu chuyện · Live`); airplane-mode retry → error state
  with no fallback. Old `BA6D9F` APK is superseded and was never used as proof.

## Pending / not covered (honest)

- Permission-denial branches (camera/location): script pre-grants deterministically;
  denial UI covered only by unit tests, needs a manual deny pass.
- GPS candidate/confirm with a real fix: emulator has no GPS fix (known limit).
- QR scan of a real code: manual-choice path proven; scan path needs a camera-visible code.
- Physical device / iPhone: emulator-only in this task.
- Offline cold start against the release APK: blocked on the W2 APK build (prebuild/
  assemble in progress); Expo-bundle cold start was exercised via force-stop + relaunch.
  → CLOSED: verified on the `F4FF95` release build (see above).
- `tools/voice`: never run in Phase 7.1/8 per scope.

## Findings for owners (no W4 source edits made)

1. Home map runs an infinite pin-halo pulse loop (`usePulseLoop`); uiautomator never
   reaches idle there, so scripted dumps are impossible. The harness sets the OS
   reduce-motion switch (app-supported) during runs and restores it after. W2 may want
   a test hook or idle-friendly motion; behavior itself is not judged here.
2. Expo Go large-bundle download over `10.0.2.2` flaked persistently (redbox
   `Failed to download remote update` while Metro served the same 6MB bundle in 0.2s
   to the host and ping was clean); the LAN-IP route worked. Environment flake, kept
   as evidence; sanctioned route stays `10.0.2.2` (never `10.0.0.2` — that typo was in
   W4's own guard test and is fixed).
3. `adb shell input tap` with fractional coordinates is silently dropped on this build;
   the harness rounds to integers (also fixed in the legacy scripts).
4. PowerShell `>` redirection mangles binary PNGs (UTF-16); all captures are now
   Node `spawnSync` buffers with signature checks. One invalid PNG was discarded,
   never used as evidence.
5. W2 mapping deltas found against source truth: pick action preposition is `tại`,
   not `tới` (`PostcardCard.tsx:69`); typed-input label on screen is `Hỏi về … Đặt câu
   hỏi cho người kể`, not `Ô nhập câu hỏi tự do`; result header uses lowercase
   `Chủ đề ẩm thực · 45 phút` (`PlanScreen.tsx:290`).
6. Aggregate-size gap (review): field-legal payloads could exceed 512KiB with the
   parser accepting; fixed at the backend boundary by W3 `0399821` (import rejects
   pre-mutate, persisted oversize → 503); covered by backend 19/19 + HTTP 15/15.

## Harness state

- `tools/e2e/native-flow.mjs` is the current native entry point (preflight, runtime
  `git HEAD`/device provenance in `native-flow.json`, `exitCode` + exact animation
  restore, no always-true fallbacks).
- `tools/e2e/demo-scenario.mjs` + `tools/e2e/phase7-checks.mjs` are marked HISTORICAL
  (pre-rebuild labels); guards inside them maintained, not for Phase 8 QA.
- `agent_docs/testing.md` gained a Phase 8 entry pointing at the current commands.
