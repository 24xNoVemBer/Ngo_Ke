# Phase 1 Native Shell Implementation Plan

> For agentic workers: use `executing-plans` to implement task-by-task in this session. User explicitly requested a brief plan and execution in the same turn; no delegation or additional phase approval is implied.

**Goal:** Build the Phase 1 Expo native shell and reviewable screen skeleton, reporting missing original fixture/core and device checks honestly.

**Architecture:** Expo blank TypeScript with React Navigation native-stack. App shell owns demo/live selection; screens render source status and navigate to clearly labeled future-phase placeholders. No product algorithms or replacement fixture.

**Tech Stack:** Expo template 57.0.28 (Expo ~57.0.26, React 19.2.3, RN 0.86.3), npm/Node 24; compatible screens/safe-area modules installed via Expo. Local React state, StyleSheet/system fonts; Node built-in tests for source-mode isolation.

**Spec:** `docs/TECH_DEMO_PLAN.md` Phase 1; `docs/PRO-NgoKe-MVP.md` R1.01–R1.03; `docs/TechDesign-NgoKe-MVP.md` Phase 1. User approved Phase 0 and Phase 1, then chose “Dựng khung trước” after being informed that original source is absent.

## Global Constraints

- One phase only; no Q&A/recommendation/device/API behavior from Phase 2–6.
- Original `data/demo.json`, `public/core.js`, backend and SQLite do not exist here. Do not invent or copy replacement data/core/API.
- Demo missing fixture is an explicit error; live unconfigured is empty and remains live. No network requests or fallback.
- Native Android/iOS configuration; no production deploy, prebuild/store artifacts or remote Git operations.
- Bundle success is not device runtime proof; G1 needs at least one real phone and original fixture.

## Review Focus

1. Demo/live selection must not retain old source status: source-mode tests + manual switch checklist.
2. Missing fixture must remain visible, never masquerade as offline demo success: error test + Home copy.
3. Placeholder navigation must not request camera/GPS or enable future features: native dependency/config review + device checklist.
4. Small screens/large font must remain scrollable with clear press state and safe area: native checklist; device evidence unavailable locally.
5. Native Back must return Home without changing mode: native-stack navigation, manual checklist; report as untested without phone.

## Tasks

### 1. Bootstrap and mode boundary

Files: `mobile/package.json`, lockfile, app/TS config, `mobile/src/data/sourceState.ts`, `mobile/tests/sourceState.test.ts`.

- [x] Run `npx create-expo-app@latest mobile --template blank-typescript@57 --no-install --no-agents-md --yes`; generated scaffold only. Install its locked npm dependencies.
- [x] Install `@react-navigation/native` and `@react-navigation/native-stack`; use `npx expo install react-native-screens react-native-safe-area-context` for compatible native versions.
- [x] Write Node tests importing `getSourceState(mode)` and assert `demo → {mode:'demo',status:'error'}`, `live → {mode:'live',status:'empty'}`, switching modes never yields ready or fixture data. Watch failure before implementing this boundary.
- [x] Implement the minimal typed `getSourceState(mode)` returning the explicit missing/unconfigured status, no dataset or request. Run `node --test tests/*.test.mjs` (Node24 strips TypeScript source; tests use JS/ESM).

### 2. Native screens and navigation

Files: `mobile/App.tsx`, `mobile/src/screens/HomeScreen.tsx`, `mobile/src/screens/PlaceholderScreen.tsx`, `mobile/src/navigation.ts`, `mobile/src/theme.ts`.

- [x] Add a typed native stack: `Home: undefined`, `Placeholder: { area: 'qa' | 'recommendations' | 'camera' | 'location' }`.
- [x] App shell owns mode (`demo` initially); Home receives mode/source status/setMode/navigation. Home renders explicit missing fixture or live empty, a demo/live selector and links to placeholder areas.
- [x] Placeholder renders phase/name/“chưa triển khai”, Home/back controls. No device permission, content generation, API or feature behavior.
- [x] Use native safe-area provider, scroll layouts, system font, readable neutral tokens, ≥48-unit press targets, press feedback and selected/accessibility semantics.
- [x] Add actual npm scripts for typecheck, lint, tests and Android/iOS Metro export. Final lint uses ESLint10/typescript-eslint; Expo lint config's React/import peers require deprecated ESLint9.

### 3. Verify and hand off

Files: `mobile/README.md`, `agent_docs/phase_1_review.md`, `agent_docs/testing.md`, `agent_docs/tech_stack.md`, `MEMORY.md`, `REVIEW-CHECKLIST.md`, `AGENTS.md`.

- [x] Run npm tests/typecheck/lint, Expo dependency check/config/doctor, Android and iOS JavaScript exports separately. Save command/cwd/output/exit evidence. Tests2/2, Doctor21/21; audit remains12 advisories and is not green.
- [x] Record device checks as “chưa kiểm tra” (no adb/emulator/xcrun/attached device identified); do not fabricate screenshots/native pass.
- [x] List Phase 0–7/voice progress against code/evidence. Mark fixture and actual core import blocked; no Metro-compatible claim for missing core.
- [x] Document `cd mobile; npm ci; npm start`, Expo Go steps and review flows for mode/placeholders/back/text size/offline shell.
- [x] Update G0 approval and Phase 1 partial delivery truthfully; preserve original source docs and stop before Phase 2.

## Self-review

R1.01 shell/navigation is covered by Task 2, bundling by Task 3; actual phone acceptance remains untested. R1.02 fixture is blocked by absent source and explicitly disclosed/accepted as shell-only by user; only mode state is implemented. R1.03 presentation is implemented, hardware/layout review remains manual. No Git repo existed initially; Expo CLI automatically created `mobile/.git`/initial scaffold commit. No feature commit, root repo, worktree or remote created. Execution ledger and rulings are in `agent_docs/phase_1_review.md`.
