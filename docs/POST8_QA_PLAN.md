# Post8 QA plan — VI/EN observable coverage (W4, no runs yet)

Task `task_aa2ef4d60e9e`. Baseline `91ddfbd`; spec `POST8_EXECUTION_SPEC.md`;
inventory `POST8_CONTENT_INVENTORY.md` (`39a3712`): **100 tracks** = 4 intro +
18 story + 18 caption + 60 answers (**66 new + 34 VI preserved**); 9 logical
nodes (6 fiction + 3 pilot), **30 QAs per locale**. Prompt:
`E:/Project/Ngo_Ke/ngoke/docs/CLAUDE_POST_PHASE8_STORY_EN_PROMPT.md` §7.
No product tests/e2e/voice run in this task — candidate SHA first.

## Q0. Entry gates (before any QA run)

- Candidate SHA named by coordinator; worktree clean at that SHA; no runs on
  superseded SHAs count as coverage.
- W2 early needs (blocking hooks/IDs): stable `accessibilityLabel`s for the
  locale switcher on Prologue + Home, per-locale content loading/error/empty
  states with testIDs, and a V2 parser/loader interface W3 can share — without
  these, native assertions stay screenshot-only.
- Missing test hooks to request: `locale`, `collectionId`, revision and error
  codes exposed in dumps/logs; an audio-missing sentinel UI string.

## Q1. First vertical: Bạch Mã VI/EN native (before bulk 66)

One real point end-to-end per locale: approved copy + player + synthetic STT +
native pass, then fix before bulk catalogue/audio. Covers node
`oldquarter-bach-ma`, QAs `bm-horse/guardian/observe`, intro/caption/answers.

## Q2. Parser/API/HTTP/security (V1 compat + V2)

- V1: `GET /api/dataset/health/ready`, 404/503/405 semantics, 512KiB + field
  caps, no-chat/no-LLM routes, error bodies without stacks — rerun Phase 8
  HTTP suite against the candidate.
- V2: `GET /api/v2/dataset?locale=` + `/ready`, required-locale 400s, one-locale
  200 with `Content-Language`, `Content-Language` match, canonical revision
  digest, nullable-geometry pair rule (both null or both valid; single null is
  shape error), `visitMinutes` editorial-only, no live fallback/persistence.

## Q3. Language lifecycle (native, both directions)

Cold-start EN, switch back VI, kill/restart persistence of manual choice;
locale switch during preparing/recording/stopping/transcribing/playing;
double-send, cancel, Back, node/mode/revision change, offline/timeout/quota/
unknown/audio-fail; stale-locale results never leak; text toggle never resets
playback; no VI audio/text fallback inside EN UI; error codes localized.

## Q4. UI/a11y/device matrix (all reachable screens, both locales)

Full UI + a11y labels/hints/errors/dialogs/player/dock/GPS/QR/source/topic/
time/confirmations; font 150–200% without ellipsis-hiding-buttons; keyboard;
screen reader; Reduce Motion; native permission purpose strings (OS/Expo Go
popups follow host OS — record limits, iPhone/Windows noted separately).

## Q5. Evidence layers (never substituted)

Synthetic ASR ≠ gateway live ≠ AVD mic ≠ physical phone ≠ human listening.
Require per layer: scripted Q+follow-up for **all 9 nodes** (fixture 6 + pilot
3, not per-locale double counting), full 30-QA lookup per locale, audio
format/duration/levels/hash + language match, 34-VI-hash regression intact.

## Q6. Pending by construction

EN TTS probes (≤2 presets), EN STT opening, on-site Bạch Mã geometry, 2026
freshness re-checks, physical-device/iPhone/Human-QC — each recorded per-point,
never waived by unit-test green.
