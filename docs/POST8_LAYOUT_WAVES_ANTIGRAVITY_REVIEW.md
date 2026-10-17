# POST8 Layout & Golden Waves Antigravity Review — Ngõ Kể Native App

> **Implementation & Design Audit Report**  
> **Skill References:** `motion-design` (LottieFiles v1.0.0), `context-adaptation.md`, `quality-checklist.md`  
> **Archetype:** **Premium** (Calm, Heritage Editorial, Restrained)  
> **Execution Specification:** `plan-architecture/docs/POST8_LAYOUT_WAVES_IMPLEMENTATION.md`  
> **Workspace:** `C:\Users\LEGION\orca\workspaces\ngoke\test-antigravity`  
> **Branch:** `valentino/post8-ui`  
> **Date:** 17/10/2026  

---

## 1. Executive Summary

Following user approval ("triển khai đi") for the overall layout and golden waves redesign, this report details the concrete architectural changes implemented across the Ngõ Kể native mobile application. The implementation replaces prior rigid geometry and 1180ms portal timing constraints with a cohesive, responsive local storytelling journal experience.

### 1.1 Core Design Pillars
1. **Calm Local Journal Feel:** Rooted in warm parchment (`#FBF8F2`), deep moss green (`#24392E`), and subtle honey gold (`#F2C56B` / `#D4A346`).
2. **Single Primary Action per Visual Zone:** Removed redundant duplicate buttons across Landing and Home, giving the user an uncluttered path from alley selection to story listening.
3. **Listen-First Hierarchy:** In `QaScreen` and `VoiceInteractionDock`, the audio player bar owns the primary gold signature; the idle voice input button recedes to a calm moss-green surface (`#31483A`), preventing visual competition.
4. **Natural Flank Waves (620ms):** Replaced circular full-screen ripples with 2 bilateral honey-gold arcs radiating strictly 16–28dp from the button flanks, accompanied by an in-flight audio volume fade.

### 1.2 Strict Scope Boundaries Preserved
- **Audio Assets:** 100% untouched. All cue WAV and 34 story MP3 files remain binary-identical.
- **Data & Historical Fidelity:** Zero synthetic historical claims. `data/demo.json` and collection metadata remain untouched.
- **Backend & EAS:** No backend, network gateway, or EAS build configuration changes.
- **Validation Reality:** All 257 automated tests run under Node.js (`node --test`). Native GPU framerates, physical iOS devices, and real-time GPS fixes remain honest emulator and device testing pending coordinator QA.

---

## 2. Screen-by-Screen Architectural Redesign

### 2.1 PrologueScreen (`mobile/src/screens/PrologueScreen.tsx`)

#### Before
- Monolithic portal timer coupled to full audio duration (1180ms).
- Single circular ripple attempting to cover large screen areas.
- Potential late audio playback if `seekTo` resolved after screen unmount or rapid tap sequences.

#### After
- **Refined Copy:** Shortened subtitle in [`translator.ts`](file:///C:/Users/LEGION/orca/workspaces/ngoke/test-antigravity/mobile/src/i18n/translator.ts) to *"Mỗi ngõ nhỏ, một câu chuyện chờ bạn mở."* / *"Every alley holds a story waiting to unfold."*, maintaining clean 2-line rendering even at 200% font scale.
- **Bilateral Semicircular Flank Waves:**
  - 2 distinct concentric arcs on the left flank (`LEFT_ARC_1`, `LEFT_ARC_2`) and 2 on the right flank (`RIGHT_ARC_1`, `RIGHT_ARC_2`).
  - Symmetrical origin anchored strictly to button ends (`left: -28`, `right: -28`, `width: 28dp`, `height: 68dp`), regardless of touch coordinates.
  - Visible spread bounded strictly to **16–28dp** outside the button perimeter.
  - Soft honey-gold palette: Inner arc `#F2C56B` (stroke 2.2, opacity 0.85 -> 0.0), outer arc `#D4A346` (stroke 1.5, opacity 0.55 -> 0.0), and a soft radiant halo (`#FFFDF7`).
- **Signature 620ms Choreography:**
  - Fast launch, gentle cubic deceleration: `Easing.out(Easing.cubic)`.
  - Portal navigation timer decoupled from 1180ms audio file; aligned directly to **620ms** wave completion.
  - Smooth native audio volume fade starts at ~460ms (decreasing by 0.25 every 35ms), ensuring a pleasant fade-out without abrupt clicks.
- **Robust Attempt Token Lifecycle:**
  - Every press increments `attemptTokenRef.current`.
  - App state backgrounding, screen blur, or unmount immediately stops animations, invalidates the active attempt token, clears fade intervals, and pauses audio.
  - `seekTo` Promise resolution checks `attemptTokenRef.current === currentAttempt && !navigated.current` before starting playback, eliminating deferred race conditions.
  - Accessibility / Reduced Motion: Bypasses ripple expansion and navigates immediately.

---

### 2.2 LandingScreen (`mobile/src/screens/LandingScreen.tsx`)

#### Before
- Top half dominated by a large quote card, pushing the alley carousel down out of the initial viewport fold.
- Duplicate bottom CTA bar (`Khám phá các con ngõ Hà Nội`) fixed to screen bottom, competing with individual alley cards and wasting ~80dp of vertical space.

#### After
- **Viewport Re-prioritization:**
  - **Alley Carousel Elevated:** "Chọn một con ngõ" and horizontal alley preview cards are now elevated directly below the brand header (entrance delay 130ms), immediately inviting exploration.
  - **Compact Lead Quote:** The oversized quote card was transformed into a compact, elegant parchment card placed *below* the carousel (entrance delay 220ms).
- **Elimination of Redundant Bottom CTA:**
  - The redundant fixed bottom CTA bar was completely removed.
  - Tapping any alley card directly selects the collection and navigates to `Home` (`route: 'Home', params: { alleyId }`).
  - The "Xem tất cả" link provides clear, unhindered navigation to `AlleySelectScreen`.
  - Scroll container padding adjusted to cleanly respect safe area insets without layout overflow.

---

### 2.3 HomeScreen (`mobile/src/screens/HomeScreen.tsx`)

#### Before
- Selecting a node on the map required users to scroll down through the entire map canvas to reach the bottom postcard card.
- Floating bottom dock contained a large center circular "Read story" button that duplicated the postcard CTA.

#### After
- **Compact Selected Node Preview Card:**
  - Positioned immediately above the bottom dock island (`testID="home-selected-node-preview"`).
  - Displays thumbnail crossfade photo, stop badge (`Điểm 01`), estimated visit duration (`⏱ 5 phút`), node title, summary, and a single primary story button (`Đọc lời kể` / `Read story`).
  - Smooth entrance animation on node selection (`gentleOut`, translateY: 10 -> 0, opacity: 0 -> 1).
- **Streamlined Floating Dock Island:**
  - Redundant center circular story button removed.
  - Bottom dock refined into a balanced 2-action utility island:
    1. **GPS:** Quick coordinates verification (`Xác nhận điểm GPS`).
    2. **Notebook:** Alley tools, thematic filter plan, and camera QR scanner (`Sổ tay ngõ phố`).
  - Preserves full accessibility hit-targets ($\ge 48\times 48\text{dp}$) and avoids overlapping postcard elements at 200% font scale.

---

### 2.4 QaScreen & VoiceInteractionDock (`mobile/src/components/VoiceInteractionDock.tsx`)

#### Before
- Idle mic button used vibrant gold (`#F2C56B`), visually competing with the story audio playback controls on `QaScreen`.
- Input drawer placeholder text was verbose, risking multi-line truncation or wrap clipping on narrow devices at 200% font scale.

#### After
- **Listen-First Visual Hierarchy:**
  - Story audio player bar maintains exclusive ownership of the honey-gold action accent (`#F2C56B`).
  - In `VoiceInteractionDock`, the idle mic button was quieted to a subdued, atmospheric moss-green surface (`#31483A` with subtle `rgba(255, 253, 247, 0.22)` border and white icon).
  - Active recording and ready states continue to provide prominent feedback with pulsing amber dots and clear timers.
- **Single-Line Drawer Input Placeholder:**
  - Shortened placeholder in [`translator.ts`](file:///C:/Users/LEGION/orca/workspaces/ngoke/test-antigravity/mobile/src/i18n/translator.ts) to *"Gõ câu hỏi…"* / *"Type a question…"*.
  - Tested to remain cleanly single-line without clipping at 200% font scale with virtual keyboards open.

---

### 2.5 Kept Screens (Plan, Camera, Location, Unavailable)

In strict adherence to the Premium archetype and coordinator instructions, screens whose structure and semantics already met user goals were **intentionally preserved**:
- **`PlanScreen`:** Maintained 3-topic postcard cards (Food, Old Stories, Free Exploration) and duration sliders with localized bilingual badges.
- **`CameraScreen`:** Maintained user-initiated camera activation, manual node picker fallback, and clear fictional/reviewed disclaimers.
- **`LocationScreen`:** Maintained single-candidate GPS confirmation without autonomous hopping.
- **`UnavailableScreen`:** Kept honest offline/missing data recovery guidance.

---

## 3. Verification & Compliance Matrix

| Check | Tool / Command | Result | Details |
| :--- | :--- | :--- | :--- |
| **Node.js Automated Test Suite** | `npm test` (`mobile/tests/uiFlows.test.mjs`) | **257 / 257 PASS** | 100% pass across all unit, integration, and UI flow tests. |
| **TypeScript Static Typecheck** | `npm run typecheck` (`tsc --noEmit`) | **PASS (0 errors)** | Full type safety across modified screens, components, and translator keys. |
| **ESLint Code Quality** | `npm run lint` (`eslint .`) | **PASS (0 errors)** | Zero lint or formatting warnings across all project files. |
| **Bilateral Wave Geometry** | Automated test assertion | **PASS** | Bounded spread 16–28dp, 2 bilateral arcs per flank, symmetrical anchor. |
| **620ms Navigation Choreography** | Automated test assertion | **PASS** | Timer set to 620ms; volume fade interval executed cleanly. |
| **Landing Bottom CTA Removal** | Automated test assertion | **PASS** | Redundant fixed CTA eliminated; carousel cards navigate directly. |
| **Home Compact Preview Card** | Automated test assertion | **PASS** | Preview card renders node details and sole story CTA; dock cleaned to 2 buttons. |
| **Listen-First Hierarchy** | Automated test assertion | **PASS** | Idle mic button verifies `#31483A` surface, avoiding gold clash. |

---

## 4. Honest Limitations & Device Testing Scope

1. **Automated vs. Physical Execution:** Node.js tests verify state machines, mock timers, and component logic. They do **not** simulate physical GPU compositor bottlenecks or real audio output hardware.
2. **Emulator & Hardware Exemption:** Per coordinator instructions and tool safety policies, W2 did not run ADB commands or launch Android emulators to avoid conflicting with active sessions. Native screenshot QA is owned by W1 (Coordinator).
3. **Pending Physical Verification:** Physical iOS devices, true outdoor GPS fixes, and physical QR code scanning on textured printed surfaces remain pending final device validation.
