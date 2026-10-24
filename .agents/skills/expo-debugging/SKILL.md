---
name: expo-debugging
description: Diagnose Ngõ Kể Expo and React Native failures on Android or iOS, including Metro/export, module resolution, runtime lifecycle, permissions, and device-specific regressions. Use when an observed app failure needs reproduction or triage.
---

# Expo debugging

Start with an observed symptom and identify its environment: platform/device or emulator, Expo Go versus native build, app mode/alley, network state, and the exact action sequence. A successful JavaScript export is not proof of native runtime behavior.

## Triage

1. Read `mobile/README.md`, `agent_docs/testing.md`, and the relevant recent report (`docs/TEST_REPORT.md` or `docs/VOICE_TEST_REPORT.md`). Keep previously untested paths untested until actually run.
2. Separate failures into Metro/module/config, JavaScript runtime/state, native permission or device lifecycle, and LAN gateway/network. Preserve logs/screenshots without printing secrets, raw location, recordings, or unnecessary transcript data.
3. Use the existing commands from `mobile/`: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build:android`, and `npm run build:ios`. Run only checks relevant to the diagnosis before proposing a change.
4. For a reproduction, record expected versus actual outcome, command/device details, and whether it reproduces after reload/cold start or foreground/background where relevant.

## Project-specific boundaries

- Demo and Live must remain separate: Live error, timeout, or empty data must not silently fall back to Demo.
- QR and GPS are action-driven; unknown QR, denied permissions, and outside-cluster GPS retain manual selection. A candidate never confirms a node by itself.
- `mobile/src/data/generatedContentRegistry.ts` needs static imports for Metro. Regenerate it through `tools/content.mjs` rather than adding dynamic content imports.
- Mark a fix as device-verified only after the same native path runs successfully on that device class; bundle success alone is insufficient.
