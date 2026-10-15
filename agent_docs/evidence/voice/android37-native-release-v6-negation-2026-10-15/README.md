# Android API 37 release after V6 STT alias correction — 15/10/2026

- Device: `emulator-5554`, `sdk_gphone64_x86_64`, API 37. The emulator has no usable audio input or output.
- Built with `mobile/android/gradlew.bat :app:assembleRelease`, using Android Studio JBR 25.0.3 and `ANDROID_HOME` set for that process. No project Java/SDK path was changed.
- APK: `mobile/android/app/build/outputs/apk/release/app-release.apk`, 121,248,988 bytes, SHA-256 `F6CD6178BD99D303E2C714963B3F414314D7DE9B883098976648DA9A2CF20B49`. Installed with `adb install -r`; the installed `base.apk` SHA-256 matched exactly.
- Replayed the native path: Landing → Home → Ngõ Phất Lộc → chapter 1 reader → “Đây là điểm nào?” showed the chapter-1 answer. The bundled answer player advanced to `00:04 / 00:10`; opening the story text kept that player running. The answer card stayed visible and did not autoplay before the user started it.
- The APK contains 34 MP3 entries. Comparing SHA-256 multisets against the 34 source clips produced 0 missing or extra hashes.
- `npm test`: 170/170; typecheck, lint and `git diff --check` pass. `npm run build:ios` also succeeded; iOS Hermes export is `index-e44b07b146d3b8e5f8490498dfdad2b4.hbc` (SHA-256 `DB6FE8BE6FFA17E4B4B4E596440B84B34A89164DBAA429E1859037522824175F`). This is a JavaScript export, not a physical iOS build or device test.

Screenshots:

- `launch.png`: fresh launch of this APK.
- `home.png`, `alley.png`, and `qa.png`: Home, six-point alley map, and chapter reader before asking.
- `answer.png`: answer ready; no automatic playback.
- `player-playing.png` and `player-text-open.png`: answer player started; story text opened while the answer player continued at `00:04 / 00:10`.

The AVD cannot verify audible output, microphone meter/input, STT from a real speaker, Android screen-reader use, or real-device audio routes. The synthetic local TTS → GPU gateway STT probe is recorded in `agent_docs/voice_v6_review.md`; it is not human speech accuracy evidence.
