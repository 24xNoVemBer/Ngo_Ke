# Ngõ Kể — PERF-01 Image Load Diagnostics Report

**Date:** 2026-10-24  
**Workspace:** `D:\ngo_ke`  
**Branch / HEAD:** `valentino/logic-fix-mobile-20261020` / `4af64c49a4ada47f952ddf76c35adfb90f826224`  
**Verdict:** `INSTRUMENTATION_READY_FOR_IPHONE_TRACE` — PERF-01 instrumentation and host regression are ready; actual iPhone performance has not been measured. Stop here pending trace review and separate PERF-02 approval.

## Baseline and scope

The branch and HEAD are unchanged from the current worktree baseline. The worktree already contained broad tracked modifications and untracked WIP, including edits to `HomeScreen.tsx`, `QaScreen.tsx`, `AlleySelectScreen.tsx`, mobile tests, and prior reports. Those changes were preserved. This task added only the PERF-01 diagnostic calls/helper, test-loader no-op shims needed by existing screen tests, one diagnostic test, and this report. No WIP was deleted or reset.

The source investigation in `NGO_KE_IMAGE_LOADING_PERFORMANCE_REPORT.md` found that the relevant images are bundled static `require()` assets, navigation does not await image work, Landing eagerly renders the collection cards in a horizontal `ScrollView`, and the full-screen Home/Qa images previously had no load callbacks. Those are source facts and plausible load pressure, not proof of the reported iPhone delay. This run did not establish a performance root cause.

## Instrumentation added

The helper [imagePerformanceDiagnostics.ts](../../mobile/src/utils/imagePerformanceDiagnostics.ts) emits local `console.info` JSON lines prefixed `[NGOKE_PERF01]`. Every event is gated by `__DEV__`; there is no network request, persistent storage, telemetry service, image URI, native error text, or secret in the event payload. It records JS callback timestamps using `performance.now()` when present, falling back to `Date.now()`.

| Event | Meaning / fields |
| --- | --- |
| `navigation_tap` | Tap handler before navigation; route names, monotonically increasing navigation ID, and the selected collection/node key where relevant. |
| `navigation_focus` | Destination route focus; includes `tap_to_focus_ms` when correlated with the most recent tap for that destination. |
| `first_layout` | First root `onLayout` callback per mounted screen instance; includes `tap_to_layout_ms` and/or `focus_to_layout_ms` when those timestamps are available. |
| `image_load_start` | React Native `onLoadStart` callback for a named image role; includes time since screen focus when available. |
| `image_load_error` | React Native `onError`; does not log the native error or image URI. |
| `image_load_end` | React Native `onLoadEnd`; includes elapsed `load_ms` and a success/error/unknown result when callbacks provide enough data. |

Instrumented image roles and transitions:

- Landing hero background plus all currently rendered Landing collection-cover cards (`landing.hero`, `landing.cover:<collectionId>`).
- Landing collection-card tap and AlleySelect collection-card tap → Home focus.
- Home cover background (`home.cover:<collectionId>`) and story CTA tap → Qa focus.
- Qa current-node background (`qa.background:<nodeId>`; `intro` if no current node ID).
- Landing, Home and Qa root first layout and focus.

The callbacks do not update React state, await image work, prefetch assets or delay navigation. The Home thumbnail handled by `CrossfadePhoto` and AlleySelect card image load callbacks are not timed in this scope; AlleySelect selection taps are timed because they enter Home. The tap marker is emitted from the JS `onPress` callback, not the physical finger-down timestamp.

### Measurement limitations

These are timestamps for JavaScript-visible React Native callbacks, not a native GPU/frame-presentation trace. `first_layout` means the first root `onLayout` callback for that mounted route instance; it is not proof that the frame was physically presented. It is emitted once per mount, so a retained route may not emit another `first_layout` on warm re-entry. Image timing measures the interval between JS delivery of `onLoadStart` and `onLoadEnd`; it does not separately measure network transfer, disk read, decode, compositing, or first visible pixel. A missing load callback on warm re-entry does not prove cache behavior.

Because logging is `__DEV__`-only, this instrumentation cannot provide production/release timings. Comparing Expo Go and an iOS release build requires separate measurement tooling/build approval; no such build or device trace was run here.

## Files changed for PERF-01

Application code:

- `mobile/src/utils/imagePerformanceDiagnostics.ts` — new development-only event helper.
- `mobile/src/screens/LandingScreen.tsx` — focus/layout, hero/card load events, and card navigation tap.
- `mobile/src/screens/AlleySelectScreen.tsx` — collection selection tap marker before Home navigation.
- `mobile/src/screens/HomeScreen.tsx` — focus/layout, cover image lifecycle, and story CTA tap.
- `mobile/src/screens/QaScreen.tsx` — focus/layout and current background image lifecycle.

Tests:

- `mobile/tests/imagePerformanceDiagnostics.test.mjs` — dev gate, event correlation, one-time first-layout callback, success/error duration and screen wiring checks.
- Updated screen-test import shims in `alleyIntegration.test.mjs`, `alleyStoryCard.test.mjs`, `homeIntroPlay.test.mjs`, `homePhaseB.test.mjs`, `landingQuickActions.test.mjs`, `landingRedesign.test.mjs`, `provenanceUiCleanup.test.mjs`, `qaNodeStoryVoice.test.mjs`, `remediationIntegration.test.mjs`, and `uiFlows.test.mjs`. These stubs keep existing host tests isolated from real native modules; they do not change app behavior.

No image files, image registry, rights data, localized JSON, voice/audio, navigation contracts, or UI-05B/UI-04A work were changed. No production behavior is enabled by these diagnostics.

## Regression results

Executed from `mobile/`:

| Command | Result |
| --- | --- |
| `node --test --test-reporter=spec tests/*.test.mjs` | **431 PASS / 0 FAIL / 0 SKIP** |
| `npm run typecheck` (`tsc --noEmit`) | **PASS** |
| `npm run lint -- --no-cache` | **PASS** |
| `git diff --check` | **PASS** |

The diagnostic helper test also confirms the `__DEV__ === false` path emits no additional log. Host tests validate event generation and source wiring only; they do not simulate native image performance.

## iPhone cold/warm trace collection

Use the current checkout and a trusted private Wi-Fi network. Do not use the older shared Expo update if the intent is to measure this instrumentation.

1. From `D:\ngo_ke\mobile`, start the development server with `npm start -- --go`; open the current Metro QR code in Expo Go on the iPhone. Keep Metro's terminal visible for the local logs. No gateway or API key is needed for this image test.
2. Record the iPhone model, iOS version, Expo Go version, locale, selected collection/node, network type, and whether this is the first app launch after force-quitting Expo Go. Do not clear/reinstall the app for this test unless separately desired; a force-quit is not guaranteed to clear Metro, disk, or decoded-image caches.
3. **Cold-like first pass:** force-quit Expo Go, reopen the current Metro project, then tap a collection card. Capture screen video and copy the `[NGOKE_PERF01]` lines from Metro. Continue Home → story/Qa and capture those events too. This is a repeatable first-navigation trial, not a guaranteed empty-cache test.
4. **Warm pass:** return to Landing (or back to Home as appropriate) and repeat the same collection and story path in the same app session. Note if the route was retained. Repeat each path five times if practical; do not infer cache state solely from missing callbacks.
5. Preserve the raw log lines, screen recording, and a small table per attempt: route/key, `tap_to_focus_ms`, `tap_to_layout_ms` (if present), `focus_to_layout_ms` (if present), image role, `load_ms`, result, and whether the photo was visibly present when the screen appeared. Redact unrelated Metro output before sharing. The marker lines contain no image URI or native error text.

Example line shapes (values shown schematically):

```text
[NGOKE_PERF01] {"event":"navigation_tap","at_ms":...,"navigation_id":1,"from":"landing","to":"home","key":"ngo-gach"}
[NGOKE_PERF01] {"event":"navigation_focus","at_ms":...,"screen":"home","navigation_id":1,"tap_to_focus_ms":...}
[NGOKE_PERF01] {"event":"first_layout","at_ms":...,"screen":"home","focus_to_layout_ms":...,"navigation_id":1,"tap_to_layout_ms":...}
[NGOKE_PERF01] {"event":"image_load_start","at_ms":...,"screen":"home","image":"cover:ngo-gach","focus_to_image_start_ms":...}
[NGOKE_PERF01] {"event":"image_load_end","at_ms":...,"screen":"home","image":"cover:ngo-gach","result":"success","load_ms":...}
```

Interpret the visible-photo observation alongside logs: the JS `onLoadEnd` time is not a measured display/presentation time. For a release comparison, capture a separate approved native iOS trace; these dev-only markers will not appear in release.

## iPhone/native status

No iPhone trace was collected in this execution environment. It is Windows (`D:\ngo_ke`); `xcodebuild` is unavailable here, and the repository README notes that native iOS build requires macOS. Expo Go testing remains a user/device step. Therefore **no cold/warm durations, image errors, perceived-image timing, Metro transfer time, decode cost, release behavior, or performance target result is reported**. Do not treat 431 host tests as an image performance pass.

## PERF-02 proposal — contingent on measurements and separate approval

No optimization is implemented or pre-approved here. After receiving the iPhone trace:

1. Compare tap→focus and focus→layout separately from image start→end. If navigation/layout dominates, investigate screen mount/render and transition timing rather than compressing photos.
2. If Landing cover loads are the long interval or compete with navigation, assess the eager horizontal `ScrollView` rendering on device; consider a scoped lazy/virtualized strategy only after checking visual order, accessibility, font scaling and scroll regressions.
3. If Home/Qa image callbacks begin promptly but end late and the photo appears late, inspect the specific asset dimensions/bytes and separately profile native decode/presentation. Any derivative/compression work must wait for image-rights approval and a before/after visual review.
4. If load errors occur, identify exact image role and route, then propose a truthful nonblocking fallback. Do not hide the player or block navigation while waiting for the image.
5. Repeat the measurement in an approved release-capable iOS environment if dev-only results do not represent the reported experience. Do not interpret a warm callback omission as cache proof.

The next decision should use the user-provided trace (including visibly-late but callback-fast cases), medians and spread across repeated trials, and a clearly chosen success target. Any lazy-load, resize/compression, cache/prefetch, placeholder or release-instrumentation change needs separate PERF-02 authorization. **PERF-02 has not started.**

## Handoff

PERF-01 implementation and host regressions are complete. The next action is user-run iPhone trace collection and review; no performance goal is claimed as achieved. Preserve this worktree and its WIP. Stop before implementation optimization and wait for separate PERF-02 approval.
