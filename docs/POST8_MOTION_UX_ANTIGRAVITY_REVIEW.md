# POST8 Motion & UX Antigravity Review — Ngõ Kể Native App

> **Audit & Redesign Implementation Report (Revised)**  
> **Skill References:** `motion-design` (LottieFiles v1.0.0), `context-adaptation.md`, `quality-checklist.md`  
> **Archetype:** **Premium** (Calm, Atmospheric, Restrained)  
> **Coordinator Brief:** `docs/POST8_MOTION_UX_REDESIGN_BRIEF.md`  
> **Workspace:** `C:\Users\LEGION\orca\workspaces\ngoke\test-antigravity`  
> **Branch:** `valentino/post8-ui`  
> **Implementation Commit:** `5099429`  
> **Date:** 17/10/2026  

---

## 1. Executive Summary

This report presents the revised motion and UX review for the native mobile application of **Ngõ Kể**, following baseline candidate evaluation (`9fdfad9` / `7a47c82` / `8ef2a7a`) and coordinator native evidence from Android emulator (`Medium_Phone_API_37.0`).

### 1.1 Product Identity & Scope
Ngõ Kể is a local storytelling and heritage discovery companion. In alignment with the `motion-design` skill's **Premium** archetype for editorial content (`context-adaptation.md:64`), the design philosophy prioritizes:
- **Calmness over flashiness:** Motion serves visual hierarchy and orientation; it does not turn the app into a tech showcase or video game.
- **Directional Easing (Enter > Exit):** Smooth cubic deceleration (`gentleOut`) for incoming elements; swifter cubic acceleration (`accelerate`) for exiting elements.
- **Spatial Restraint (1/3 Rule):** Content entrance shifts are bounded to subtle displacements ($\le 24\text{dp}$), preventing vestibular disruption.
- **Preservation of Proven Layouts:** Where existing screen structure already serves user goals effectively (e.g., Prologue, Plan, Location, Camera, Unavailable, Placeholder), layouts were intentionally **kept** rather than subject to cosmetic churn.

### 1.2 Honest Scope & Validation Boundaries
- **Node.js Automated Tests vs. Native Validation:** All reported test suites run under the Node.js test runner (`node --test`). While they rigorously exercise TypeScript contracts, timing calculations, lifecycle guards, and state transitions in simulated environments, **they do not constitute physical native UI, GPU frame rate, or human usability validation**.
- **No Unmeasured Claims:** We do not claim "100% accessibility compliance", "guaranteed 60fps", or "zero overshoot". Actual frame rendering depends on device CPU/GPU conditions.
- **Pending Native Scope:** Physical iPhone testing, real-device on-screen keyboard interactions, and visual layout at 200% font scale across Vietnamese and English remain **pending coordinator native emulator and device QA**.

---

## 2. Motion Token Architecture (`mobile/src/theme/motion.ts`)

### 2.1 Baseline State vs. Refined Hierarchy

| Token | Baseline Value | Refined Value | Status | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `instant` | `120ms` | `120ms` | **Preserved** | Baseline *already* possessed `instant: 120` for tactile press down/up feedback. Kept as-is. |
| `fast` | `220ms` | `180ms` | **Refined** | Reduced from 220ms to 180ms to provide a distinct, responsive secondary transition tier. |
| `normal` | `260ms` | `240ms` | **Refined** | Standardized to 240ms for primary content swaps (cards, Q&A answers). |
| `relaxed` | `250ms` | `320ms` | **Refined** | Fixed inversion where baseline `relaxed` (250ms) was shorter than `normal` (260ms). |
| `slow` | `300ms` | `380ms` | **Refined** | Dedicated to large contextual entrances (modal drawer slide, major screen reveals). |
| `ambientPulse` | `1900ms` (hardcoded) | `2400ms` | **Refined** | Replaced hardcoded intervals with an ambient token providing calm, non-distracting pin halo breathing. |
| `staggerStep` | `50ms` | `50ms` | **Preserved** | Consistent stagger step maintaining cascades well within the 500ms budget. |

### 2.2 Directional Easing Curves

Baseline React Native `Animated.timing` calls without explicit easing default to `Easing.inOut(Easing.quad)`. To comply with the LottieFiles Enter > Exit guidelines:
```typescript
export const motionEasings = {
  /** Entrance: swift start with gentle cubic deceleration */
  gentleOut: Easing.out(Easing.cubic),
  /** Exit: crisp cubic acceleration out of view (30-40% faster than entrance) */
  accelerate: Easing.in(Easing.cubic),
  /** Ambient two-way breathing loops */
  easeInOutQuad: Easing.inOut(Easing.quad),
  /** Continuous linear scan indicators */
  linear: Easing.linear,
};
```

### 2.3 Spring Physics & Scale Limits
- **`tactilePress`**: Damped spring (`friction: 20`, `tension: 260`) for button and card presses.
- **`gentleSlide`**: Damped vertical translation (`friction: 18`, `tension: 140`) for drawers.
- **`pulseHaloMax`**: Constrained to `1.12` ($\le 12\%$ scale expansion), keeping emphasis on alley editorial content.

---

## 3. Core Hook Overhaul (`mobile/src/hooks/useMotion.ts`)

### 3.1 Unlocking Choreographed Cascades in `useEntranceFadeSlide`

- **File / Lines:** `mobile/src/hooks/useMotion.ts:50–79`
- **Baseline Issue:** `useEntranceFadeSlide` previously clamped caller delays with `Math.min(delay, 100)` and durations with `Math.min(duration, 250)`. In `LandingScreen`, where sections specified delays of `60ms, 160ms, 320ms, 400ms`, the header ran at 60ms while the latter three sections all collapsed to 100ms, defeating the intended sequential entrance.
- **Refactored Contract:**
  - `delay = Math.max(0, Math.min(options?.delay ?? 0, 450))`: Allows choreographed delays within the 500ms stagger budget (`quality-checklist.md:19`).
  - `duration = Math.max(100, Math.min(options?.duration ?? motionDurations.normal, 500))`: Enforces a 100ms floor and a 500ms ceiling.
  - `offsetY = Math.max(0, Math.min(options?.offsetY ?? 14, 24))`: Strictly enforces the **1/3 Distance Rule** ($\le 24\text{dp}$ vertical shift).
  - Explicitly binds `easing: motionEasings.gentleOut`.

### 3.2 Choreography Timeline Clarification (LandingScreen)
- **Stagger Delay Span:** `310ms` (Section 1 starts at 40ms; Section 4 starts at 310ms; total delay spread $= 310 - 40 = 270\text{ms} \le 500\text{ms}$).
- **Final Entrance Completion:** `690ms` ($310\text{ms start} + 380\text{ms duration} = 690\text{ms}$).

---

## 4. Per-Screen Audit & Polish Matrix

| Screen / Component | Priority | Status | Source Location | Audit Findings & Actions Taken |
| :--- | :--- | :--- | :--- | :--- |
| **PrologueScreen** | P1 | **Kept** | `PrologueScreen.tsx:180–210` | **Preserved 100%:** Bilateral golden water ripples from button flanks, 1.10s audio portal cue, attempt tokens, and unmount cancellation guards. Identity anchor of the app. Physical acoustic/touch feeling pending user device review. |
| **LandingScreen** | P1 | **Resolved** | `LandingScreen.tsx:44–55` | **Observation:** Screenshot `before-landing-en.png` shows quote card and banner above carousel. Kept editorial layout intact. Corrected collapsed delays to staggered cascade (40ms header, 130ms quote, 220ms carousel, 310ms teaser; 380ms duration). Visual flow on device pending coordinator emulator check. |
| **AlleySelectScreen** | P1 | **Resolved** | `AlleySelectScreen.tsx:125–130`<br/>`App.tsx:212` | **Critical A11y Fix:** Screenshot `before-alley-select-en.png` revealed white status bar clock/icons against `#F5EFE6` cream header. Excluded `AlleySelect` from `lightStatusBar` in `App.tsx`, restoring high-contrast dark status bar icons. Unlocked staggered section entrance (30ms top bar, 110ms GPS card, 190ms list header). |
| **HomeScreen** | P2 | **Resolved** | `HomeScreen.tsx:184–205` | **Observation:** Screenshot `before-home-en.png` shows clear stop numbers, trail spline, and "Read story" CTA. Calmed halo pulse to 2400ms (`ambientPulse`) with $\le 1.12$ scale; card swap updated to 240ms with `gentleOut`. Preserved tools sheet layout (`before-home-tools-en.png`) and disclaimer integrity. |
| **CrossfadePhoto** | P2 | **Resolved** | `CrossfadePhoto.tsx:18–22` | **Observation:** Baseline duration was already 180ms. Adopted explicit `motionEasings.gentleOut` curve instead of default in-out quad for smooth photo crossfading. |
| **QaScreen** | P2 | **Resolved** | `QaScreen.tsx:130–150` | **Observation:** Screenshot `before-qa-en.png` confirms stable story card, narrator audio player, and voice dock. Aligned answer reveal duration and scroll trigger to 240ms (`normal`) with `gentleOut`. Kept story text and source controls stable. |
| **ExpandableInputDrawer** | P2 | **Resolved** | `ExpandableInputDrawer.tsx:60–70` | **Observation:** Replaced symmetric 260/200ms timing with directional Enter > Exit asymmetry: entrance `380ms` (`slow`) with `gentleOut`; exit `240ms` (`normal`, ~37% faster) with `accelerate`. |
| **PlanScreen** | P2 | **Kept** | `PlanScreen.tsx:135–220` | **Observation:** Screenshot `before-plan-en.png` verified clean responsive typography, clear topic radio chips, and time budget buttons. Dark status bar icons already functional. No motion changes needed. |
| **LocationScreen** | P2 | **Kept** | `LocationScreen.tsx:60–120` | **Observation:** Screenshot `before-location-en.png` verified high-contrast dark status bar, clear unconfirmed passport card, single GPS trigger, and manual list. Continuous radar ping bounded (1800ms). No layout churn needed. |
| **CameraScreen** | P2 | **Kept** | `CameraScreen.tsx:50–110` | **Observation:** Bounded laser scanner (2000ms), clear reticle, and prompt manual fallback. Camera permission denial and background state correctly pause camera. No cosmetic redesign needed. |
| **UnavailableScreen** | P2 | **Kept** | `UnavailableScreen.tsx:1–60` | **Observation:** Single clear recovery action (Retry live / Switch to demo / Go back); truthful error messages; no dead ends; loading indicator during busy states. |
| **PlaceholderScreen** | P3 | **Kept** | `PlaceholderScreen.tsx:1–40` | **Observation:** Minimal fallback screen; retains consistent header typography and safe back navigation. |

---

## 5. Verification Results & Test Evidence

### 5.1 Test Suite Breakdown
Tests were executed using Node.js v24 built-in test runner across all repository modules:

```sh
# 1. Mobile Test Suite (tests/*.test.mjs)
npm test --prefix mobile
# Output: 201 top-level TAP tests (1..201), 253 total leaf assertions passing (0 failed, 0 skipped)

# 2. Mobile Static Analysis
npm run typecheck --prefix mobile   # tsc --noEmit (0 errors)
npm run lint --prefix mobile        # eslint . (0 errors)

# 3. Backend Test Suite (tests/*.test.mjs)
npm test --prefix backend
# Output: 19 tests passing (0 failed, 0 skipped)

# 4. End-to-End Contracts & HTTP Guards (tools/e2e/*.test.mjs)
node --test tools/e2e/*.test.mjs
# Output: 48 tests passing (33 guards + 15 HTTP contracts, 0 failed, 0 skipped)
```
- **Aggregate Test Count:** $253\text{ (mobile)} + 19\text{ (backend)} + 48\text{ (e2e)} = 320\text{ test cases passing}$.
- **Dedicated Motion Unit Tests Added (`uiFlows.test.mjs`):**
  - Token duration monotonicity: `instant (120) < fast (180) < normal (240) < relaxed (320) < slow (380)`.
  - Ambient pulse timing: `2400ms`.
  - Spring damping and halo scale restraint: `friction >= 18`, `pulseHaloMax <= 1.15`.
  - `useEntranceFadeSlide` bound enforcement: `delay <= 450ms`, `duration <= 500ms`, `offsetY <= 24dp`.
  - `AlleySelect` status bar style assertion: confirms `dark-content` on light header.

---

## 6. Accessibility & Performance Review

1. **Reduced Motion (`prefers-reduced-motion`):**
   - Controlled via `useMotionState().active`. When reduced motion is detected, `active` is `false`.
   - All animated values resolve immediately to terminal values (`opacity: 1`, `translateY: 0`) with `0ms` duration.
   - Spatial loops (pin halo pulse, laser beam) cease execution immediately upon `active === false`.

2. **Native Driver Offloading:**
   - 100% of spatial and opacity animations use `useNativeDriver: true`. No layout-triggering properties (`width`, `height`, `top`, `margin`) are animated.

3. **Pending Verification Scope:**
   - Visual inspection under 200% font scale across English and Vietnamese.
   - Physical keyboard appearance and focus scrolling behavior on real Android/iOS devices.
   - Native GPU frame rendering measurements.
   - These items are deferred to coordinator emulator verification (`Medium_Phone_API_37.0`) and downstream device QA.
