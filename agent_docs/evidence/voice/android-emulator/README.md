# Ngõ Kể voice — Android emulator evidence

**Device:** AVD `Medium_Phone_API_37.0`, Android API 37, 1080 × 2400 capture.
**Build:** `mobile/android/app/build/outputs/apk/release/app-release.apk`, internal debug-signed release build.
**Gateway URL in the current LAN preview APK:** `http://<DEV_LAN_IP>:8788`.

These are screenshots of the native React Native app running on the emulator, not the SVG/PNG design comps. Playback duration/progress and recorder duration are native runtime values. The current mic lifecycle was tested, but no recorded audio was uploaded to the gateway.

## Latest recorder regression — 13/10/2026

- Current APK: SHA-256 `0E86AC88AE758A587EED292D7C1EACDC26855A9C56125E2308CA54F49C13D9CE`, 121,231,324 bytes; Android API 37, AVD `Medium_Phone_API_37.0`.
- Verified the LAN URL is in `assets/index.android.bundle` of this APK; the repository `mobile/app.json` remains empty for `voiceApiBaseUrl`. Installed and launched the LAN build on the API 37 emulator without a fatal app error: `release-lan-apk-launch-2026-10-13.png`.
- `release-lan-reader-2026-10-13.png` shows the first story/Q&A point and idle native voice controls on the LAN APK.
- First-grant proof is from the immediately previous APK: after revoking `RECORD_AUDIO`, the user tapped mic, granted Android’s prompt, and recording began without a second tap. The current LAN APK only changes endpoint substitution; this permission flow was not repeated on it. Screenshot: `release-first-grant-recording-2026-10-13.png`.
- On the current LAN APK, the guard stopped recording at 19.5s (500ms margin below the gateway's 20s hard limit); AppOps measured 19.692s and the UI showed `00:19` with **Gửi** / **Hủy bản ghi**. It did not upload automatically: `release-lan-recording-cap-2026-10-13.png`.
- **Hủy bản ghi** returned the dock to idle: `release-lan-after-cancel-2026-10-13.png`.
- Started another recording and used Back. The app returned to AlleySelect and did not resume; AppOps measured microphone use for 1.814s: `release-lan-back-recording-2026-10-13.png`.
- No crash was found in the app log. No microphone clip was submitted to the gateway. First-permission-grant evidence is from the previous APK; the final change only fixes compile-time voice URL substitution and does not touch recorder lifecycle.
- The gateway smoke test accepted a synthetic 19.15-second clip, rejected a generated 21-second PCM WAV with `AUDIO_TOO_LONG`, and rejected an invalid format. Gateway health returned ready at `<DEV_LAN_IP>:8788`.
- A new Metro/Expo Go process on port 8086 was not started because the shell tool rejected the launch by policy. Standalone Android/iOS exports contain the configured endpoint, but Expo Go runtime and a physical phone remain unverified.

## Earlier player/keyboard regression — 13/10/2026

- Earlier APK SHA-256 `C7A5653490A6B3DDF4EC5DA80875CA0F479EE1E7AC69F17B43E6F9EFCADA5658` (121,218,612 bytes). App process launched on the API 37 emulator.
- From the landing screen, opened the first Q&A point, then advanced to points 02 and 03. The player returned to ready/00:00 for each new point; the app stayed open without a chapter-change crash.
- `android-emulator-voice-final-check-2026-10-13.png` captures point 03 after its 00:27 story reached 100%.
- The first point-04 retest on the pre-keyboard build relied on an accessibility snapshot while the animated screen had not settled; it showed ready/0% and was inconclusive. On the final rebuilt APK, a visual retest at Q&A point 01 confirmed real bundled-audio progress, then replay, pause, resume and stop. The earlier observation was not reproduced as a player failure.
- Earlier clean-APK captures (pre-keyboard-fix hash `9CF65B96B90D195D8C9F241F371C2428CA339405B8D00346EDC796AB9CB65946`): `clean-player-playing.png`, `clean-player-replay.png`, `clean-player-paused.png`, `clean-player-resumed.png`, `clean-player-stopped.png` and `clean-qa.png` document playback/progress controls before the final keyboard change.
- Final keyboard-fix APK: `keyboard-fix-focused.png` shows the text drawer held above the Android keyboard; `keyboard-fix-question.png` shows a typed normalized question; `keyboard-fix-answer.png` shows its point-01 answer ready without autoplay; `keyboard-fix-answer-view.png` shows the answer text after explicit reveal; `keyboard-fix-answer-playing.png` shows actual answer-audio progress. `keyboard-final-replay.png`, `keyboard-final-paused.png`, `keyboard-final-resumed.png` and `keyboard-final-stopped.png` confirm all player controls on the current APK.
- Reproduced the manual text path on the final APK with `day la diem nao`: it matched the approved question for point 01, closed the drawer, showed that point’s answer, kept answer audio ready until Play was tapped, then played the bundled answer clip. The drawer remained visible with the keyboard open after the Android keyboard-avoidance fix.
- At that earlier pass, microphone permission was not granted. Recorder checks are documented in the latest section above.
- LAN smoke check at that run: Metro `/status` and gateway `/health` both HTTP 200 at `<DEV_LAN_IP>`; the release APK remains configured for emulator-only `10.0.2.2:8787`. That Wi-Fi address has since changed; see the current check below.

## Large-text layout regression — 13/10/2026

- On the updated APK above, Android system font scale 2.0 exposed overlapping “Chọn một con ngõ” / “Xem tất cả” text on `font-scale-200-home.png`. The header now stacks at larger scales and the “Xem tất cả” hit area is at least 48dp; `font-scale-200-home-final.png` shows the fixed layout and the action opened AlleySelect.
- `font-scale-200-alley-final.png` confirms the DEMO status pill and single-line “Tìm phố hoặc ngõ” input remain readable. `font-scale-200-story-final.png` shows the story reader, actual player controls and voice dock at 200%.
- Font scale restored to 1.0 after capture. At that earlier run, the emulator's hardware-keyboard setting prevented the software IME from appearing; the follow-up below supersedes that limitation. No microphone permission was granted or audio recorded.

## Large-text input drawer follow-up — 13/10/2026

- On the current LAN APK (`0E86AC88AE758A587EED292D7C1EACDC26855A9C56125E2308CA54F49C13D9CE`), set Android font scale to 2.0 and enabled the emulator's software keyboard alongside its hardware keyboard.
- Opened the first point, expanded “Xem lời kể bằng chữ”, then opened “Gõ”. With the IME visible, the drawer kept its title, input, enabled “Gửi” button and suggested-question chips on screen.
- Typed `day la diem nao` and sent it. The app matched the fixed answer for point 01; the answer appeared with its bundled player ready and did not autoplay. Captures: `release-lan-fontscale-200-home-2026-10-13.png`, `release-lan-fontscale-200-alley-2026-10-13.png`, `release-lan-fontscale-200-reader-2026-10-13.png`, `release-lan-fontscale-200-expanded-2026-10-13.png`, `release-lan-fontscale-200-keyboard-2026-10-13.png`, `release-lan-fontscale-200-keyboard-filled-2026-10-13.png`, and `release-lan-fontscale-200-answer-2026-10-13.png`.
- The software IME and font scale were restored to the emulator defaults (font scale 1.0, hardware-keyboard IME display off). This verifies large-text text entry on this emulator only; it is not phone Dynamic Type/accessibility proof and does not cover mic→gateway.

- Latest LAN check: the host is now `<DEV_LAN_IP>`; Metro `/status` and gateway `/health` return HTTP 200. Fetching the Expo Android bundle remained pending for about one minute and was interrupted, so Expo Go at the new IP is not yet verified. Restart Metro with the current IP using `docs/VOICE_HANDOFF.md` before testing on a phone.

## Final binary checks

- `android-emulator-final-next-chapter.png` — began story playback on chapter 1, selected the next chapter, and confirmed chapter 2 is ready at 00:00 without carrying audio over.
- `android-emulator-final-mic-denied.png` — denied Android microphone permission; the app shows the reason and offers typing/retry.
- `android-emulator-final-replay-from-start.png` — replay returns the player to 00:00 and resumes playback.
- `android-emulator-offline-local-audio.png` — Wi-Fi/data disabled; bundled story still plays and progress advances.

## Other player/Q&A checks

- `android-emulator-fixed-player-paused.png` — pause preserves the current position.
- `android-emulator-fixed-player-stopped.png` — stop resets to the beginning and ready state.
- `android-emulator-fixed-text-still-playing.png` — opening the story transcript leaves playback running.
- `android-emulator-back-stops-player.png` — Back from Q&A returns to the trail.
- `android-emulator-return-qa-does-not-autoplay.png` — re-entering Q&A does not autoplay.
- `android-emulator-fixed-qa-answer-chip.png` — tapping a suggested question reveals its fixed answer; the answer player remains ready and does not autoplay.

## Limits

This evidence does not verify phone speakers/headphones, mic recording or codec, physical-device networking, iOS, TalkBack/VoiceOver, Dynamic Type on a phone, background/call routing, or release performance. Emulator fontScale 2.0 and the software IME were checked through the point-01 typed-answer flow only. The local APK points to the current LAN gateway; a phone must use a verified Expo Go LAN preview described in `docs/VOICE_HANDOFF.md` for STT testing.
