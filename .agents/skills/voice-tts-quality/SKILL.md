---
name: voice-tts-quality
description: Review, generate, validate, or debug Ngõ Kể’s local voice catalogue and STT recording/playback lifecycle when a request involves TTS, audio assets, microphone turns, or the private development gateway. Do not use for unrelated sound design.
---

# Voice and TTS quality

Read `docs/VOICE_TEST_REPORT.md`, `docs/VOICE_HANDOFF.md`, and `tools/voice/README.md` before acting. Keep technical validation distinct from human listening and physical-device evidence.

## Catalogue and content integrity

- The local pipeline reads spoken fields from `data/demo.json`; it does not make source evidence or disclaimers spoken content. Follow the pinned scripts and prerequisites documented in `tools/voice/README.md`.
- Validate a generated catalogue with `tools/voice/validate_catalogue_v1.py`. Its hash, decode, duration, and local-ASR checks do not replace human listening QC.
- Never reuse Demo MP3s for an alley that lacks separately approved audio. Treat `audio.status: missing` as a text/Q&A fallback, not as permission to synthesize or substitute a clip.

## Recorder, player, and STT triage

1. Identify whether the failure occurs while requesting permission, preparing/starting recording, metering, stopping/uploading, receiving the gateway response, matching fixed Q&A, or playback.
2. Test consecutive turns, cancel/Back, an answer that is playing, and app lifecycle as applicable. Record recognized text and error state when needed; do not request or retain raw private audio.
3. The development gateway is private-LAN only and configured by `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL`. Follow the handoff instructions; do not expose it publicly, add a hosted provider, or assume an iOS export verifies native iPhone audio.
4. Report technical checks, human listening checks, and Android/iOS device checks separately.
