# Android API 37 current release recheck — 15/10/2026

- Device: `emulator-5554`, `sdk_gphone64_x86_64`, API 37. The emulator has no usable audio input/output.
- Installed current release APK `com.valentino241.ngokedemo` with `adb install -r`; the app launched as `MainActivity`.
- Latest APK after the player title reflow: 121,247,924 bytes, SHA-256 `236072DF9F8E3C8B3952D0C4A4CA13F63A22C8844EDB7015A9BC917263FF4243`. It was installed with `adb install -r` and launched successfully.

Screenshots:

- `launch.png`: native landing screen after installing this artifact.
- `after-start.png`: Home after tapping “Bắt đầu dạo ngõ”.
- `point-open.png`: selected Ngõ Phất Lộc route and chapter list.
- `reader.png`: chapter 1 reader with its bundled story player and suggested questions.
- `player-playing.png` and `player-text-open.png`: the real native player progressed while the story text was opened; the clip reached its replay cycle without the text sheet resetting playback.
- `recorder-start.png` and `recorder-cancel.png`: the native recorder entered `Đang thu · 00:02`; tapping “Hủy bản ghi” returned it to ready. No clip was submitted.
- At Android font scale 2.0, the app remained navigable from landing through Home, chapter selection and the story reader. UIAutomator found all six chapter selectors, player/text controls, and the voice, typing and notebook controls. After scrolling, all four suggested questions and the voice dock remained on-screen and enabled; see `font-2_0-reader.png`, `font-2_0-reader-scrolled.png`, and the matching UI XML files.
- The first 200% run exposed the story-player title being cut to one line. After removing that limit and rebuilding, `player-title-fix-reader.png` shows the complete “Lời kể · Cổng ngõ” label wrapped over two lines, with the player buttons still aligned and usable. `player-title-fix-launch.png`, `player-title-fix-home.png`, and `player-title-fix-point.png` are also from this rebuilt APK.
- The mic control also entered `Đang thu · 00:01` at 2.0 scale and was canceled without upload; see `font-2_0-recorder.png` and `font-2_0-cancel.png`. The emulator font scale was restored to 1.0 after testing.
- Rechecked the rebuilt APK at 200% after the player-title fix. The complete title wraps over two lines; after scrolling, UIAutomator still reports all four suggested-question chips and the voice, typing and notebook controls. See `player-title-fix-reader-scrolled.png` and `player-title-fix-reader-scrolled-ui.xml`.

This verifies the current release artifact launches and exercises Android UI, player state, text-sheet interaction, recorder start/cancel, and large-font reachability. The no-audio emulator cannot verify audible playback, microphone signal/meter response, speech recognition, screen-reader use, or physical-device audio routes. It is not Android speech-to-answer E2E evidence.

- Current API 37 APK SHA-256 is `17BF0EF342B0E41E4A90972101B260BD1E75D9654F80FDC5BFA469464E6EF3D3` (121,248,752 bytes). It launched on the API 37 AVD and contains the current demo revision; a SHA-256 multiset comparison confirms all 34 embedded MP3s match the 34 source files byte-for-byte.
- At chapter 2, typing `Ong Lam nhua an ra sao?` resolved to the new exact alias for `qa-lam`; opening the answer text showed the expected answer. Screenshots `voice-alias-build-launch.png`, `voice-alias-current.png`, and `voice-alias-answer.png` capture the installed build and interaction. This is typed UI/data-flow evidence, not microphone/STT/audio proof.
- At chapter 4, typing normalized `Ai trong ran hoa giay trong san?` showed the expected `qa-flowers` answer. The same query at chapter 1 correctly returned unknown because the matcher is chapter-local. Screenshot: `qa04-flowers-manual-alias-answer-2026-10-15.png`. This is typed-input evidence on a no-audio AVD, not microphone/STT/audio proof.
- On the latest APK, a fresh run opened the chapter-1 Q&A from Home, tapped “Đây là điểm nào?” and showed its answer without autoplay. After starting the bundled answer player, opening the text kept playback active at 00:02/00:10; Back returned to Home. Screenshots: `latest-player-text-open.png` and `latest-back-home.png`. This verifies native screen/player state only; the emulator has no audio output.
- Two locally generated VieNeu action clips were re-sent through the production mobile request helpers and live gateway: “Bắt đầu nghe lời kể” → `listen`; “Mở máy quét mã QR” was recognized as “Mở máy quét mạ.” → `open-qr`. Synthetic speech only; actual phone microphone and human speech remain unverified.
- A fresh two-turn recorder check on this APK reached `Đang thu · 00:01`, Cancel returned to idle, and the second start reached the same recording state; the second Cancel returned idle again. AppOps reported no active recording after cancellation; no audio was submitted. See `latest-recorder-first.png`, `latest-recorder-second.png`, and `latest-recorder-after-cancel.png`. The AVD has no input audio, so this does not test meter movement or recognition.
- Repeated the recorder start/cancel cycle 20 times: AppOps confirmed 20/20 active starts and 20/20 stopped cancels; process PID stayed `18546`. PSS was 188,050 KB before and 194,054 KB after (+6,004 KB) in this single emulator run. The final idle state is `latest-recorder-stress-idle.png`. This is lifecycle evidence only; the AVD has no input sound and one PSS sample cannot establish memory/performance behavior.

## Simulated Android call interruption — 15/10/2026

- Verified the installed package matched the local APK byte-for-byte (121,248,752 bytes, SHA-256 `17BF0EF342B0E41E4A90972101B260BD1E75D9654F80FDC5BFA469464E6EF3D3`). Started the recorder and confirmed Android AppOps showed `RECORD_AUDIO (running)`.
- An incoming-call notification alone left Ngõ Kể foregrounded and recording. After answering the emulator's simulated call, `InCallActivity` became foreground and Ngõ Kể's AppOps recording stopped. After ending the call and returning to the app, the Q&A dock showed `Nhấn để hỏi`; AppOps remained stopped, with no automatic restart.
- Evidence: `recorder-call-interrupt.png` (incoming call overlay), `recorder-call-answered.png` (simulated active call), and `recorder-after-call-return.png` (idle after return).
- This verifies the answered-call/background lifecycle on an API 37 AVD only. The AVD has no usable audio; the notification-only ringing state did not interrupt capture, and a physical-device call/audio-route test remains pending. No audio was submitted.

## Change chapter during recording — 15/10/2026

- Started recording at chapter 1, then tapped “Điểm kế tiếp”. The UI moved to chapter 2 (“Hiên đồng hồ”), the voice dock returned to `Nhấn để hỏi`, and Android AppOps no longer showed an active recording.
- Screenshot: `recorder-next-point.png`. The AVD has no audio input; no clip was submitted. This confirms chapter-change cancellation/lifecycle on API 37 only, not speech capture or physical-device behavior.
