# Android API 37 — current 8b318b Voice build

This evidence uses the freshly installed SDK 57 release APK `com.valentino241.ngokedemo` on the API 37 AVD. Local APK and installed `base.apk` both hash to `2f15c3c0992434a42b13cb4b09c363826542ddfa215eb8f3e9d5db03e22a1e0d` (121,249,588 bytes). Its bundled JS contains dataset revision `8b318b4e9955e3b7affe72cb21ea08cf8123a616eeab2eb1420ab105c7b65e6b`; all 34 packaged MP3 SHA-256 hashes match the source catalogue.

- `launch.png`, `home.png`, `alley.png`, `chapter-1-reader.png`: fresh install launch through Home, Ngõ Phất Lộc and chapter 1.
- `chapter-1-answer.png`: the suggested “Đây là điểm nào?” displays the chapter-1 answer.
- `chapter-1-player-text-open.png`: answer text is visible while the player shows about 00:08/00:10 and the pause control. This confirms UI/player state only; the AVD has no audio output.
- `chapter-4-reader.png`, `chapter-4-input-open.png`, `chapter-4-alias-entered.png`: chapter 4 and the native input drawer; the unaccented `Ai trong ran hoa giay trong san` was submitted.
- `chapter-4-alias-answer.png`: the matching answer becomes ready and the next suggestions are chapter-local (`Nút thắt…`, `Cốc chè…`).
- `chapter-4-followup-answer.png`: selecting the `Nút thắt…` follow-up advances the turn and leaves the next `Cốc chè…` suggestion.
- `recorder-stress-20-start.png` and `recorder-stress-20-idle.png`: 20 consecutive start/cancel cycles on this APK. AppOps showed recording active on 20/20 starts and stopped after 20/20 cancels; process PID stayed `26924`. PSS changed from 192,569 KB to 204,956 KB (+12,387 KB) in this single emulator run, which is not enough to infer a leak or phone performance.
- `recorder-cycle-1.png` / `recorder-cycle-2.png` and their `-idle.png` captures are individual cycle screenshots from the initial smoke.
- Matching UIAutomator XML captures are provided for the navigation, reader, input and answer states.

The APK passed the current mobile suite, typecheck, lint, Expo dependency check and catalogue validation. These captures verify native navigation, typed Q&A/follow-up and recorder lifecycle state. The AVD has no usable audio signal; they do not verify meter response, STT from speech, audible playback, human listening quality, TalkBack/VoiceOver, or physical-device audio routes.
