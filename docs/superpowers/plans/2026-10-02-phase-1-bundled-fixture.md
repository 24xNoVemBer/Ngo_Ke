# Phase 1 Bundled Fixture Implementation Plan

> **For agentic workers:** Use `executing-plans` to implement inline. User approved six simulated points and explicitly requested completion of Phase1 in this turn. Preserve this execution method; no separate approval for the same scope. Track progress with checkboxes.

**Goal:** Complete Phase1 code by bundling six clearly simulated points on Home and verify source isolation/native runtime.

**Architecture:** One fixture at root `data/demo.json`, statically imported by App. Existing pure source-state adapter validates `unknown` and returns a discriminated ready/error/empty state. Home renders approved simulated nodes only for demo-ready. Keep current navigation/UI tokens.

**Tech Stack:** Existing Expo57/React Native0.86/TypeScript6/React state/Node24 tests, ESLint10. No dependencies added.

**Spec:** `docs/superpowers/specs/2026-10-02-greenfield-phase-1-proposal.md`; `docs/TECH_DEMO_PLAN.md` Phase1, PRD R1.01–R1.03.

## Global Constraints

- Phase1 only; no Q&A, node confirmation, recommendation, API/backend, camera/GPS or voice behavior.
- Six `{id,name}` simulated points, labeled as fictitious; no history/evidence/coordinate/ETA fields.
- Demo uses bundled JSON; no file copy, HTTP or fallback. Live unconfigured remains empty, never reveals demo nodes.
- No `public/core.js` dependency or web preview: there is no legacy source to import.
- Emulator evidence is separate from physical-phone and iOS runtime acceptance; do not mark G1 approved automatically.
- Do not delete user work or modify package/lockfile without need; no feature commit/push/deploy.

## Review Focus

1. Live must hide demo dataset after mode switch: adapter tests + emulator hide check.
2. Corrupt fixture/duplicate IDs must produce error without partial ready data: invalid-input table tests.
3. Missing simulation label must not pass as genuine content: reject kind/version/disclaimer + real-file metadata test.
4. Out-of-root JSON must actually bundle/read in native runtime: Android/iOS exports + emulator six-name assertions. Configure only the data watch folder if default resolution fails.
5. Six-node list must remain usable with font1.5/rotation: emulator scroll/Back checks; state reset on activity recreation documented.

### Task 1 — Fixture/source boundary

Files: create `data/demo.json`; modify `mobile/src/data/sourceState.ts`, `mobile/tests/sourceState.test.mjs`.

Interface: `getSourceState(mode: Mode, demoData?: unknown): SourceState`; ready has `mode:'demo',status:'ready',dataset:DemoDataset,title,detail`; demo error/live empty have no dataset. `DemoDataset` has literal schemaVersion1/kind simulated, disclaimer string, nodes array; `DemoNode` has id/name strings.

- [x] Write tests first using six in-memory nodes. Prior adapter ready assertion failed before implementation.

```js
const source = getSourceState('demo', validFixture);
assert.equal(source.status, 'ready');
assert.equal(source.dataset.nodes.length, 6);
```

- [x] Run `npm test`, save RED log. Retain missing-input error test; strengthen live test to pass valid fixture and still assert no dataset. Invalid input cases: null, string, array, wrong version/kind, blank disclaimer, nodes missing/empty/five, null node, blank/name-type/id-type, duplicate IDs.
- [x] Implement type guard/nonempty strings/six nodes/Set unique IDs; live branch first, no network.
- [x] Create fixture exactly once with disclaimer “Dữ liệu mô phỏng để kiểm tra giao diện. Các điểm không phải địa điểm thật.” and six IDs/names already approved. No additional fields.
- [x] Real-file integration check added; GREEN20/20 and typecheck exit0.

### Task 2 — Home integration and Metro

Files: modify `mobile/App.tsx`, `mobile/src/screens/HomeScreen.tsx`; add `mobile/metro.config.cjs` only if a real resolve failure requires it.

- [x] App imports `../data/demo.json` and calls `getSourceState(mode, demoData)`.
- [x] Home shows ready/count/disclaimer/6 static rows; error/live labels; no node actions. Old missing-fixture footnote removed, placeholders retained.
- [x] Tests/TS/lint/Expo check/Doctor/two exports pass. Actual external-JSON resolve failed first; used Expo default config plus only `../data` in watchFolders:

```js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');
const config = getDefaultConfig(__dirname);
config.watchFolders.push(path.resolve(__dirname, '../data'));
module.exports = config;
```

If CJS config needs Node globals for lint, use targeted CJS ESLint globals, no lint disabling.

### Task 3 — Runtime/handoff

Files: `agent_docs/evidence/phase-1/fixture-completion/*`, `mobile/README.md`, `MEMORY.md`, `REVIEW-CHECKLIST.md`, `AGENTS.md`, relevant agent docs.

- [x] Metro/AVD restarted after interruption. SDK5038 restarted after emulator boot for scanning;12 interaction checks passed with screenshots/XML.
- [x] Disclaimer/count/all6 names confirmed at font1.5/landscape;4 checks passed and settings restored.
- [x] Network disabled after bundle load;5 checks passed, Wi-Fi/data restored. Cold start offline not tested.
- [x] Logs/commands/errors captured; audit03/10=23 advisories, no force/downgrade.
- [x] Greenfield/schema/Home/tests recorded; Phase1 code handed off, G1 pending physical phone/user review. Stop before Phase2.

## Self-review and rulings

Schema/types and data flow match the approved minimal-fixture scope. All five review conditions have tests/runtime steps above. No backend or future-phase fields are introduced. User's latest “anh đồng ý hoàn thiện phase 1 đi” approves the in-chat scope and continuation; use inline execution without looping the user through redundant approval of the same feature. Written records detail the accepted scope. Physical-phone gate cannot be claimed from emulator evidence.
