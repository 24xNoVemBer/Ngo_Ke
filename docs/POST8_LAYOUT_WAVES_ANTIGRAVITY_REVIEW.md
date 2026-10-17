# POST8 Layout & Golden Waves Antigravity Review — Ngõ Kể Native App

> **Implementation & Design Audit Report (Final Revision)**  
> **Skill References:** `motion-design` (LottieFiles v1.0.0), `context-adaptation.md`, `quality-checklist.md`  
> **Archetype:** **Premium** (Calm, Heritage Editorial, Restrained)  
> **Execution Specification:** `plan-architecture/docs/POST8_LAYOUT_WAVES_IMPLEMENTATION.md`  
> **Workspace:** `C:\Users\LEGION\orca\workspaces\ngoke\test-antigravity`  
> **Branch:** `valentino/post8-ui`  
> **Date:** 17/10/2026  

---

## 1. Executive Summary

Following user approval ("triển khai đi") for the overall layout and golden waves redesign, this report details the concrete architectural changes implemented across the Ngõ Kể native mobile application. The implementation replaces prior rigid geometry and 1180ms portal timing constraints with a cohesive, responsive local storytelling journal experience, incorporating all coordinator review checkpoints.

### 1.1 Core Design Pillars
1. **Calm Local Journal Feel:** Rooted in warm parchment (`#FBF8F2`), deep moss green (`#24392E`), and subtle honey gold (`#F2C56B` / `#D4A346`).
2. **Single Primary Action per Visual Zone:** Removed redundant duplicate buttons across Landing and Home, giving the user an uncluttered path from alley selection to story listening.
3. **Listen-First Hierarchy & Lightened Accessories:**
   - Audio player bar owns the primary gold signature (`#F2C56B`).
   - `VoiceInteractionDock` idle mic button recedes to a calm moss-green surface (`#31483A`).
   - `QaScreen` text reader toggles (`readerToggle`) are lightened to warm parchment (`#F7EFE1`) with deep forest green icons (`#2D5748`) across all three instances (story drawer toggle, recognized question toggle, and answer text toggle), completely eliminating low-contrast gold on cream.
   - Question suggestion chips are softened to a light editorial surface (`rgba(255, 253, 247, 0.94)`, border, radius 14) without heavy pill shadows.
4. **Natural Flank Waves (620ms) & Strict 28dp Clipping:**
   - 2 bilateral honey-gold arcs radiating from button flanks.
   - Flank containers explicitly enforce `overflow: 'hidden'`, strictly bounding visible extent to 28dp regardless of scale or translate.
   - Smooth in-flight audio volume fade starts at ~460ms with isolated interval ownership.
5. **Readable Home Preview & Contextual Drawer Hint:**
   - Home selected node preview card features full wrapping title (no `numberOfLines={1}` truncation), readable typography (title 16, summary 13, meta 12, CTA 14, minHeight 44).
   - Enforces true column/stretch layout at `fontScale > 1.3` (`flexDirection: 'column'`, `alignItems: 'stretch'`, `flex: 0, width: '100%'`, full-width CTA) so the CTA button does not horizontally squeeze the title.
   - Secondary summary and photo credit are omitted at `fontScale > 1.3` to leave ample body scroll room.
   - Duration badge reuses `t('common.simulated')`.
   - `QaScreen` drawer uses short single-line placeholder (`Gõ câu hỏi…` / `Type a question…`) while preserving full contextual stop title in accessible attributes.
   - Tool drawer source copy simplified to friendly user-facing offline/live descriptions rather than technical server/URL internals.

### 1.2 Strict Scope Boundaries Preserved
- **Audio Assets:** 100% untouched. All cue WAV and 34 story MP3 files remain binary-identical.
- **Data & Historical Fidelity:** Zero synthetic historical claims. `data/demo.json` and collection metadata remain untouched.
- **Backend & EAS:** No backend, network gateway, or EAS build configuration changes.
- **Validation Reality:** All 260 automated tests run under Node.js (`node --test`). Verification is code/prop/test-based. Native GPU framerates, physical iOS devices, physical keyboard layout, and on-device font200 rendering are explicitly not claimed as verified on device; emulator startup was rejected/blocked by policy, and native QA is owned by the coordinator.

---

## 2. Screen-by-Screen Architectural Redesign

### 2.1 PrologueScreen (`mobile/src/screens/PrologueScreen.tsx`)

#### Before
- Monolithic portal timer coupled to full audio duration (1180ms).
- Flank containers overflowed visibly, risking overshoot beyond 28dp under scale/translate transforms.
- Potential race conditions in fade interval ownership and volume jump on delayed `seekTo` resolution.

#### After
- **Refined Copy:** Shortened subtitle in [`translator.ts`](file:///C:/Users/LEGION/orca/workspaces/ngoke/test-antigravity/mobile/src/i18n/translator.ts) to *"Mỗi ngõ nhỏ, một câu chuyện chờ bạn mở."* / *"Every alley holds a story waiting to unfold."*, maintaining clean 2-line rendering even at 200% font scale.
- **Bilateral Semicircular Flank Waves & Strict 28dp Clip:**
  - 2 distinct concentric arcs on the left flank (`LEFT_ARC_1`, `LEFT_ARC_2`) and 2 on the right flank (`RIGHT_ARC_1`, `RIGHT_ARC_2`).
  - Symmetrical origin anchored strictly to button ends (`left: -28`, `right: -28`, `width: 28dp`, `height: 68dp`), regardless of touch coordinates.
  - Flank containers enforce `overflow: 'hidden'`, guaranteeing zero rendering beyond **28dp** outside the button perimeter.
  - Soft honey-gold palette: Inner arc `#F2C56B` (stroke 2.2, opacity 0.85 -> 0.0), outer arc `#D4A346` (stroke 1.5, opacity 0.55 -> 0.0), and a soft radiant halo (`#FFFDF7`).
- **Signature 620ms Choreography & Safe Audio Lifecycle:**
  - Fast launch, gentle cubic deceleration: `Easing.out(Easing.cubic)`.
  - Portal navigation timer decoupled from 1180ms audio file; aligned directly to **620ms** wave completion.
  - **Volume Jump Elimination:** Volume is reset to 1.0 strictly once at valid attempt start. Delayed `seekTo` resolution preserves the in-flight fade envelope and never resets volume back to 1.0.
  - **Interval Handle Ownership:** Fade and navigation timer callbacks capture their own timer/interval handles (`ownInterval`, `ownFadeTimer`, `ownNavTimer`). Old callbacks from cancelled attempts clear only their own handle and never null out active handles belonging to a newer attempt.
  - **Late Seek Guard:** `playSafe` checks `!navigated.current` and attempt token matching before calling `player.play()`, preventing audio from playing after navigation has occurred.
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
- Technical source state copy mentioned server URLs and backend keys in user-facing drawer.

#### After
- **Compact Selected Node Preview Card:**
  - Positioned immediately above the bottom dock island (`testID="home-selected-node-preview"`).
  - **Wrapping Title:** `previewTitle` has no `numberOfLines={1}` constraint, allowing long Vietnamese and English stop names to wrap naturally without clipping.
  - **Readability Typography:** Standardized to comfortable typography hierarchy: title `16dp` (lineHeight 22), summary `13dp` (lineHeight 18), metadata `12dp`, CTA `14dp` with `minHeight: 44dp`.
  - **True Column Stacking & Scroll Room:** At `fontScale > 1.3`, the preview card switches to a true column/stretch layout (`compactPreviewCardStacked: { flexDirection: 'column', alignItems: 'stretch' }`, `previewInfoStacked: { flex: 0, width: '100%' }`, `compactPreviewCtaWrapper: { width: '100%' }`, `previewCtaButtonStacked: { width: '100%' }`). This guarantees the CTA button sits below the text and never horizontally squeezes the title.
  - **Omission of Secondary Metadata:** At `fontScale > 1.3`, the photo thumbnail, summary text, and photo credit are omitted, leaving ample vertical room for the main screen body to scroll comfortably.
  - **Attribution & Truthful Duration:** Retains photo credit (`Ảnh minh họa: <photographer>`) and visibly qualifies simulated durations (`⏱ 5 phút · mô phỏng` / `⏱ 5 min · simulated`) using the shared `t('common.simulated')` string.
  - Single primary story button (`Đọc lời kể` / `Read story`) with subtle pressed feedback.
- **Streamlined Floating Dock Island:**
  - Redundant center circular story button removed.
  - Bottom dock refined into a balanced 2-action utility island:
    1. **GPS:** Quick coordinates verification (`Xác nhận điểm GPS`).
    2. **Notebook:** Alley tools, thematic filter plan, and camera QR scanner (`Sổ tay ngõ phố`).
  - Preserves full accessibility hit-targets ($\ge 48\times 48\text{dp}$) and avoids overlapping postcard elements at 200% font scale.
- **Friendly Source Copy:**
  - Replaced server URL strings in drawer with clear, non-technical user benefits:
    - Demo: *"Dữ liệu ngoại tuyến sẵn sàng để khám phá."* / *"Offline demo content is ready to explore."*
    - Live loading: *"Đang kết nối để tải dữ liệu trực tiếp…"* / *"Connecting for live content…"*.

---

### 2.4 QaScreen & VoiceInteractionDock (`mobile/src/screens/QaScreen.tsx`, `mobile/src/components/VoiceInteractionDock.tsx`)

#### Before
- Idle mic button used vibrant gold (`#F2C56B`), visually competing with the story audio playback controls.
- Text reader toggle was a heavy, dark solid block (`#294336`).
- Question suggestion chips used heavy pill shadows and elevated containers.
- Dynamic stop name in drawer placeholder caused text truncation/wrapping on narrow devices at 200% font scale.

#### After
- **Listen-First Visual Hierarchy:**
  - Story audio player bar maintains exclusive ownership of the honey-gold action accent (`#F2C56B`).
  - In `VoiceInteractionDock`, the idle mic button was quieted to a subdued, atmospheric moss-green surface (`#31483A` with subtle `rgba(255, 253, 247, 0.22)` border and white icon).
- **Lightened Reader Toggles & Suggestion Chips:**
  - `readerToggle`: Soft parchment surface (`#F7EFE1`, border `#DFD1BD`, text `#2C221E`, icon `#2D5748`) replacing solid dark block.
  - **Unified Contrast across All Three Reader Toggles:** Applied the readable deep forest green icon (`#2D5748`) to all three controls sharing the `#F7EFE1` reader toggle style:
    1. Story text drawer toggle (`readerToggle` at line 484)
    2. Recognized question toggle (`readerToggle` at line 743)
    3. Answer text toggle (`readerToggle` at line 779)
    This completely eliminates illegible gold-on-cream across the entire screen.
  - Question chips: Softened radius (14dp), light parchment background (`rgba(255, 253, 247, 0.94)`), subtle border (`#E0D6C4`), and reduced elevation, ensuring high readability without visual heaviness.
- **Compact Single-Line Drawer Input Placeholder:**
  - `QaScreen` passes short `t('drawer.placeholder')` (`"Gõ câu hỏi…"` / `"Type a question…"`) to `placeholder`.
  - Full contextual stop name (`"Hỏi về {name}…"`) is passed to `title`, ensuring screen readers announce the full context while the visual placeholder remains comfortably single-line at fontScale 200%.

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
| **Node.js Automated Test Suite** | `npm test` (`mobile/tests/uiFlows.test.mjs`) | **260 / 260 PASS** | 100% pass across all unit, integration, and UI flow tests. |
| **TypeScript Static Typecheck** | `npm run typecheck` (`tsc --noEmit`) | **PASS (0 errors)** | Full type safety across modified screens, components, and translator keys. |
| **ESLint Code Quality** | `npm run lint` (`eslint .`) | **PASS (0 errors)** | Zero lint or formatting warnings across all project files. |
| **Flank 28dp Clip** | Automated test assertion | **PASS** | Flank containers verify `overflow: 'hidden'` and `width: 28dp`. |
| **Interval Handle Isolation** | Automated test assertion | **PASS** | Stale attempt callbacks do not clear or corrupt active attempt intervals. |
| **Late Seek Guard** | Automated test assertion | **PASS** | Delayed `seekTo` resolving after navigation never triggers `player.play()`. |
| **Home Preview Title Wrapping** | Automated test assertion | **PASS** | `previewTitle` verifies no `numberOfLines={1}` restriction; wraps at font200. |
| **Home Column Stacking & Simulation** | Automated test assertion | **PASS** | Verifies column/stretch stacking at font200, photo credit, and `common.simulated` reuse. |
| **Qa Drawer Contextual Title** | Automated test assertion | **PASS** | Verifies short single-line placeholder with contextual stop name accessibility title. |
| **Lightened Reader Toggles (All 3)** | Automated test assertion | **PASS** | Verifies `#F7EFE1` parchment surface and `#2D5748` deep green icon across all 3 toggles. |
| **Lightened Question Chips** | Automated test assertion | **PASS** | Verifies radius 14, light surface, and border without heavy pill shadows. |

---

## 4. Honest Limitations & Device Testing Scope

1. **Automated vs. Physical Execution:** Node.js tests verify state machines, mock timers, style calculations, and component logic. They do **not** simulate physical GPU compositor bottlenecks, 60fps rendering, or physical keyboard layout.
2. **No On-Device font200 or Keyboard Claims:** Large font wrapping, stacking behavior, and input drawer layouts are verified through component style logic and deterministic Node test assertions; no physical on-device font200 or soft-keyboard rendering is claimed as verified.
3. **Emulator Startup Blocked & Physical Device Ownership:** In strict compliance with tool policy, emulator startup was blocked/rejected and no ADB commands were run. W2 did not touch or launch emulator sessions. All native screenshot and physical device QA (iOS devices, true outdoor GPS fixes, physical QR code scanning) is owned by W1 (Coordinator).
