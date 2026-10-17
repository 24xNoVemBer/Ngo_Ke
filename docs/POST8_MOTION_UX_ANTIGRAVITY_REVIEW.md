# POST8 Motion & UX Antigravity Review — Ngõ Kể Native App

> **Audit & Redesign Implementation Report**  
> **Skill Standard:** `motion-design` (Archetype: **Premium**, Calm, Atmospheric)  
> **Target Brief:** `docs/POST8_MOTION_UX_REDESIGN_BRIEF.md`  
> **Workspace:** `C:\Users\LEGION\orca\workspaces\ngoke\test-antigravity`  
> **Branch:** `valentino/post8-ui`  
> **Date:** 17/10/2026  

---

## 1. Executive Summary

This review documents the end-to-end evaluation, motion redesign, and implementation across all native screens of **Ngõ Kể** in accordance with the `motion-design` skill and the coordinator brief.

The overarching design archetype selected for Ngõ Kể is **Premium**:
- **Pacing & Restraint:** Calm, grounded, non-jarring transitions respecting the quiet, historic atmosphere of Hanoi's narrow alleyways.
- **Duration Palette:** Strictly bounded hierarchy (120ms instant, 180ms fast, 240ms normal, 320ms relaxed, 380ms slow, 2400ms ambient pulse).
- **Easing Directionality:** Strict adherence to the **Enter > Exit** principle—entrances decelerate smoothly via `gentleOut` (`Easing.out(Easing.cubic)`), while exits are 30–40% swifter using `accelerate` (`Easing.in(Easing.cubic)`).
- **Spatial Consistency (1/3 Rule):** Content entrance offsets are strictly constrained to subtle shifts ($\le 24\text{dp}$), preventing jarring jump cuts and visual disorientation.
- **Accessibility & Safety:** Full compliance with reduced motion preference (`useMotionState().active`), 100% native driver usage (`useNativeDriver: true`), and rigorous lifecycle token guards protecting async callbacks.

All changes passed full native test validation (**253/253 unit tests pass**, 0 TypeScript errors, 0 ESLint errors).

---

## 2. Motion Design Token Architecture (`mobile/src/theme/motion.ts`)

### 2.1 Duration Scale Modernization

Previously, motion durations contained inverted intervals (`normal: 260` vs `relaxed: 250`) and lacked an ultra-swift tactile token. The token architecture has been unified:

| Token | Duration | Purpose | Premium Justification |
| :--- | :--- | :--- | :--- |
| `instant` | `120ms` | Micro-interactions, tactile press down/up, active badge | Immediate feedback without lag |
| `fast` | `180ms` | Secondary indicators, photo crossfade reveal | Crisp content swap without lingering |
| `normal` | `240ms` | Primary content updates (cards, Q&A answers, modal dismiss) | Balanced, natural tempo |
| `relaxed` | `320ms` | Staggered section cascades (top bar, headers, trail list) | Soft, organic landing |
| `slow` | `380ms` | Screen entrance reveals, modal drawer presentation | Deep, luxurious spatial transitions |
| `ambientPulse`| `2400ms` | Breathing halo around active pin | Calms the canvas; avoids distraction |
| `staggerStep` | `50ms` | Inter-element delay in cascades | Prevents domino chaos; stays within 500ms budget |

### 2.2 Directional Easing Curves

In accordance with Step 3 of the `motion-design` skill:
```typescript
export const motionEasings = {
  gentleOut: Easing.out(Easing.cubic),     // Entrance: swift initial movement, gentle landing
  accelerate: Easing.in(Easing.cubic),     // Exit: prompt disappearance without lingering
  easeInOutQuad: Easing.inOut(Easing.quad),// Ambient two-way loops
  linear: Easing.linear,                   // Scanning beam / continuous indicators
};
```

### 2.3 Spring Damping & Scaling Bounds

- **`tactilePress`**: High friction (`friction: 20`, `tension: 260`) eliminates overshoot and extraneous bouncing on cards and buttons.
- **`gentleSlide`**: Damped slide (`friction: 18`, `tension: 140`) for fluid vertical drawers.
- **`pulseHaloMax`**: Restrained from aggressive expansion down to `1.12` ($\le 12\%$ scale increase), keeping attention on the editorial content.

---

## 3. Core Hook Overhaul (`mobile/src/hooks/useMotion.ts`)

### 3.1 Unlocking Choreographed Cascades in `useEntranceFadeSlide`

**Issue Found:** `useEntranceFadeSlide` formerly clamped all caller delays to `Math.min(delay, 100)` and durations to `Math.min(duration, 250)`. This hard ceiling inadvertently collapsed multi-section choreography into a simultaneous start, causing visual clutter.

**Redesign Implementation:**
- Allowed caller delays up to the motion design budget: `boundedDelay = Math.max(0, Math.min(delay, 450))` ($\le 500\text{ms}$ overall choreography budget).
- Allowed caller durations up to `500ms`: `boundedDuration = Math.max(120, Math.min(duration, 500))`.
- Applied the **1/3 Distance Rule**: bounded `offsetY` to `Math.min(offsetY, 24)` dp, eliminating disruptive large leaps.
- Bound to `motionEasings.gentleOut` for natural deceleration.

---

## 4. Per-Screen Audit & Polish Matrix

| Screen / Component | Pre-Audit Issue | Redesign Implementation | Skill Principle Applied |
| :--- | :--- | :--- | :--- |
| **PrologueScreen** | Baseline verification | **Preserved 100%:** bilateral golden water ripples, 1.10s audio portal cue, attempt tokens, and unmount lifecycle guards. | Identity Anchor, Safe Async Tokenization |
| **LandingScreen** | All 4 cascade sections fired simultaneously due to hook clamping | Staggered cascade: Header (`40ms` delay / `14dp`), Quote (`130ms` / `16dp`), Carousel (`220ms` / `18dp`), Teaser (`310ms` / `18dp`). Total budget: `310 + 380 = 690ms`. | Hierarchy & Choreography, 1/3 Distance Rule |
| **AlleySelectScreen**| Compressed layout transitions & unreadable white status bar icons on light `#F5EFE6` header | Staggered entrance: Top bar (`30ms` / `12dp`), GPS card (`110ms` / `16dp`), List header (`190ms` / `16dp`). Tactile press feedback on filter chips. **Accessibility Fix:** Excluded `AlleySelect` from `lightStatusBar` in `mobile/App.tsx`, restoring high-contrast dark status bar icons over the light paper header. | Ordered Entrance, Visual Anchor, WCAG Contrast |
| **HomeScreen** | Hardcoded 1900ms pin pulse; un-eased 180ms card swap | Upgraded halo loop to `motionDurations.ambientPulse` (2400ms); card swap uses `240ms` + `gentleOut` + `8dp` slide. | Restraint, Smooth Content Transition |
| **CrossfadePhoto** | Abrupt linear crossfade | Added `motionDurations.fast` (180ms) + `gentleOut` curve. | Seamless Image Interpolation |
| **QaScreen** | Answer reveal had unaligned 180ms timing and 220ms scroll delay | Aligned answer reveal duration to `240ms` with `gentleOut` and synchronized scroll initiation. | Coherent Cause & Effect |
| **ExpandableInputDrawer** | Symmetrical 260/200ms animation without directional curve | **Enter > Exit Asymmetry:** Entrance `380ms` with `gentleOut`; Exit `240ms` (~37% faster) with `accelerate`. | Enter > Exit Principle (LottieFiles) |
| **PlanScreen** | Selection chip states | Preserved clean responsive typography; verified instant radio chip feedback. | High Accessibility Contrast |
| **Camera & Location**| Scanners / Radars | Bounded `radarPing` (1800ms) and `laserScan` (2000ms); clean unmount cleanup. Built-in light header retains dark status bar. | Continuous ambient restraint |

---

### 4.1 Native Emulator & Environment QA Agreement
Per coordinator message `msg_7c9248c42a07`, emulator startup and visual native screenshot QA are owned by the coordinator on `Medium_Phone_API_37.0` (emulator-5554) to eliminate redundant processes and port conflicts. Antigravity worker owns complete source implementation, design tokens, lifecycle guards, and automated test suite verification.

---

## 5. Verification Results

### 5.1 Unit & Integration Test Suite (`npm test`)
- Total test count: **253 passing** (0 failing, 0 skipped).
- Added comprehensive unit test in `mobile/tests/uiFlows.test.mjs`:
  - Verifies token duration ordering: `instant < fast < normal < relaxed < slow`.
  - Verifies ambient pulse duration: `2400ms`.
  - Verifies restrained halo scale ($\le 1.15$) and spring damping ($\text{friction} \ge 18$).
  - Verifies `useEntranceFadeSlide` bound constraints (delay $\le 450\text{ms}$, duration $\le 500\text{ms}$, translateY $\le 24\text{dp}$).

### 5.2 Static Code Analysis
- `npm run typecheck`: **Clean** (`tsc --noEmit` exited 0).
- `npm run lint`: **Clean** (`eslint .` exited 0).

---

## 6. Accessibility & Performance Review

1. **Reduced Motion (`prefers-reduced-motion`):**
   - When OS reduced motion is active, `useMotionState().active` evaluates to `false`.
   - All animated values immediately resolve to their terminal value (`opacity: 1`, `translateY: 0`) with `0ms` duration.
   - Prolonged looping animations (pin halo, scan lines) cease execution immediately upon `active === false`.

2. **Native Driver Offloading:**
   - 100% of transformed properties utilize `useNativeDriver: true` across `opacity`, `scale`, and `translateY`.
   - Prevents JavaScript bridge frame drops during heavy interactions or audio decoding.

3. **Spatial Predictability:**
   - No entrance translation exceeds 24dp, adhering to the 1/3 viewport rule and maintaining stable visual anchors for users with vestibular sensitivities.
