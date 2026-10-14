# Ngõ Kể voice — Android emulator evidence

## Microphone permission denial and retry recovery — 14/10/2026

- On the current source release APK, revoked `RECORD_AUDIO` and tapped the mic. Android showed its permission prompt; “Don’t allow” returned to the app with the typed fallback and a retry action.
- Retry reopened the OS prompt. After granting “While using the app”, the recorder showed `Đang thu · 00:02`; Cancel returned the dock to idle. Runtime permission was verified granted afterward and left granted.
- Screenshots: `android37-source-release-mic-permission-prompt-2026-10-14.png`, `android37-source-release-mic-denied-fallback-2026-10-14.png`, `android37-source-release-mic-permission-retry-prompt-2026-10-14.png`, `android37-source-release-mic-permission-recovery-active-2026-10-14.png`, `android37-source-release-mic-permission-recovery-cancelled-2026-10-14.png`.
- API 37 AVD runs with `-no-audio`; this proves Android permission/UI recovery and cleanup only. No speech, live meter, STT or hardware behavior was tested.

## APK hiện tại sau sửa phủ định trong ô Plan — 14/10/2026

- APK release: 121,246,512 byte, SHA-256 `BA973B5F23550367191A3A5ED004FD411CEF6D90ABB5C0FB5A132AA4897221D2`. Đã cài và chạy trên AVD API 37.
- Tái hiện bằng UI native: chọn chủ đề ẩm thực + 30 phút, nhập “Không đi ẩm thực trong 30 phút”, bấm Dùng. Draft bỏ topic cũ, giữ 30 phút; thẻ gợi ý cũ biến mất và hiển thị “Vui lòng chọn chủ đề”. Ảnh: `android37-release-negated-plan-result-2026-10-14.png`.
- Kiểm này dùng text entry trên AVD, không phải nhận dạng lời nói. AVD `-no-audio`, nên không xác nhận mic hoặc audio playback.

## Source release APK: player pause và recorder re-entry — 14/10/2026

- Cùng APK hiện tại (121,246,512 byte, SHA-256 `BA973B5F23550367191A3A5ED004FD411CEF6D90ABB5C0FB5A132AA4897221D2`): story player lên `00:02` với nút Pause; pause giữ vị trí. Bấm mic dừng player và vào `Đang thu`; Hủy đưa dock về idle. Nhấn mic lần hai cũng vào `Đang thu · 00:02`; Hủy lần nữa về `Nhấn để hỏi`.
- Ảnh: `android37-source-release-player-playing-2026-10-14.png`, `android37-source-release-recorder-second-start-2026-10-14.png`, `android37-source-release-recorder-second-cancel-2026-10-14.png`.
- AVD API 37 chạy `-no-audio`: recorder UI/timer/state hoạt động nhưng meter không có tín hiệu âm thanh; không gửi clip, không test STT/Q&A và không thay thế lượt hỏi thứ hai trên iPhone. Bundle Metro `:8081` mới vẫn chưa được reload trên iPhone theo yêu cầu để sau.

## Background cancellation on source release APK — 14/10/2026

- On the same APK, AppOps showed `RECORD_AUDIO` running during capture. Pressing Home moved the foreground activity to Android Launcher; AppOps then reported a completed 3.083-second recording operation. Reopening Ngõ Kể showed the idle `Nhấn để hỏi` dock; capture did not resume.
- Evidence: `android37-source-release-recorder-background-idle-appops-2026-10-14.png`.
- This is lifecycle evidence from the API 37 AVD running `-no-audio`, not a microphone signal, spoken turn, STT or physical-iPhone interruption test.

## Player background stop on source release APK — 14/10/2026

- Started the story player and captured `00:01` with Pause. After pressing Home and reopening the app, the player showed `Sẵn sàng · 00:23`, Play and 0% progress, so the old playback did not resume.
- Evidence: `android37-source-release-player-background-active-2026-10-14.png`, `android37-source-release-player-background-return-2026-10-14.png`.
- This is state/progress verification on API 37 AVD `-no-audio`; it does not prove audible playback or physical-device audio routing.

## APK V6 trước sửa phủ định trong ô nhập tay — 14/10/2026

- APK release: 121,246,156 byte, SHA-256 `301F0654052A537324A08240F02C1DA223D99EBACCD841A573A20C3375B0EE36`. Build và kiểm ZIP/Hermes xác nhận parser V6, URL gateway và đủ 34 MP3.
- APK đã cài/chạy trên AVD API 37. Đi tới Q&A điểm 01; kiểm reader open/close, player progress/pause/resume/replay/stop, drawer/bàn phím, typed answer đúng, unknown không giữ câu trả lời cũ, recorder state/timer và cleanup khi Back. Ảnh: `android37-v6-release-launch-2026-10-14.png`, `android37-v6-release-qa-reader-open-2026-10-14.png`, `android37-v6-release-{playing,paused,resumed,replay,stopped}-2026-10-14.png`, `android37-v6-release-{input-drawer,input-keyboard,typed-answer,typed-answer-text-open,unknown-question}-2026-10-14.png`.
- Mic UI tới giới hạn `00:19`, chuyển sang chờ Gửi; không gửi clip. Back ở lượt thu kế tiếp đưa về AlleySelect và dừng recorder. Kiểm nút Hủy trực tiếp: AppOps ghi duration `0.838s`, sau đó không còn lượt RECORD_AUDIO đang chạy; dock về idle. `android37-v6-release-{recorder-active,recorder-cancelled,recorder-limit-reached,recorder-pending-send,back-stops-recorder}-2026-10-14.png`.
- AVD chạy `-no-audio`: đây là kiểm UI/state/lifecycle, không xác nhận âm thanh phát được hay tín hiệu lời nói/STT. Không gán stress 20 vòng từ APK cũ cho build hiện tại.

## APK đã kiểm trên AVD trước sửa parser V6: audio-error fallback — 14/10/2026

- APK: 121,245,916 byte, SHA-256 `6D669446EE36B0224394DCC6F66B30A6EEF0639E004F0404F5398E7C08373FBE`.
- APK cài/mở trên AVD API 37; đi qua Landing → Home → chọn Ngõ Phất Lộc → Q&A điểm 01. Ảnh native: `android37-release-after-async-playback-error-fix-2026-10-14.png`, `android37-release-home-after-async-playback-error-fix-2026-10-14.png`, `android37-release-explore-after-audio-fix-2026-10-14.png`, `android37-release-alley-after-audio-fix-2026-10-14.png`, `android37-release-qa-after-audio-fix-2026-10-14.png`.
- Hermes bytecode trong APK chứa URL gateway `192.168.100.36:8788` và fallback mới cho lỗi load/phát audio. UI regression xác nhận thông báo được đọc bằng accessibility alert, không lộ native error/path.
- Không có `ReactNativeJS` error sau launch. AVD chạy `-no-audio`; lần này không kiểm mic/STT, âm thanh nghe được hay native audio-load failure. UI error được kiểm tự động, không giả làm test hardware.

## APK trước đó: recorder start/cancel và stress — 14/10/2026

- APK: 121,245,884 byte, SHA-256 `0F43437B6B29D5AF9A7C750E746D1FE731F45A1808778DD6AC8925972FDF53F9`; cài trên AVD API 37.
- Mic start hiển thị Đang thu · 00:02 và AppOps báo RECORD_AUDIO đang running. Bấm Hủy khoảng 0,8 giây sau: AppOps không còn running, duration 0,807 giây, accessibility tree trở lại nút mic idle.
- Bằng chứng: android37-current-release-mic-active-2026-10-14.png, android37-current-release-mic-explicit-cancel-2026-10-14.png.
- 20 vòng start/Hủy trên build này đều pass AppOps (20/20 start running, 20/20 đã dừng), cuối lượt idle; không gửi audio. Không fatal/ReactNativeJS error. PSS 168,357 KB trước, 182,101 KB ngay sau và 171,789 KB sau 12 giây idle; số này không chứng minh không có leak. Đây chỉ là emulator lifecycle check, không phải speech/STT test.

**Device:** AVD `Medium_Phone_API_37.0`, Android API 37, 1080 × 2400 capture.
**Build:** `mobile/android/app/build/outputs/apk/release/app-release.apk`, internal debug-signed release build.
**Gateway URL in the current LAN preview APK:** `http://<DEV_LAN_IP>:8788`.

These are screenshots of the native React Native app running on the emulator, not the SVG/PNG design comps. Playback duration/progress and recorder duration are native runtime values. The current mic lifecycle was tested, but no recorded audio was uploaded to the gateway.

## Previous build launch/player smoke — 14/10/2026

- APK: 121,235,376 bytes, SHA-256 `20154EE9B845396E43ED7F76AAD5AFD9C3639A870E017D23FF670E469E531773`.
- Installed on the API 37 AVD, opened to the Ngõ Kể landing screen, then navigated through Home and AlleySelect to point 01. Screenshots: `android37-latest-build-launch-2026-10-14.png`, `android37-latest-build-home-2026-10-14.png`, `android37-latest-build-alleyselect-2026-10-14.png`, `android37-latest-build-qa-2026-10-14.png`.
- Tapped the “Có ăn gì ở đây không?” suggestion; the answer player reached Ready (00:09) and did not autoplay. After explicitly pressing Play, the 9-second bundled clip looped to 00:00 while still playing; Stop returned it to Ready/00:09. Evidence: `android37-latest-build-suggested-answer-2026-10-14.png`, `android37-latest-build-auto-replay-2026-10-14.png`, `android37-latest-build-stop-2026-10-14.png`.
- No `FATAL EXCEPTION` or `ReactNativeJS` error marker appeared in the latest 800 logcat lines. This emulator check did not exercise microphone or network; the separate iPhone happy-path result is user-reported in `docs/VOICE_TEST_REPORT.md`.

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

- 14/10/2026 LAN revalidation: Wi-Fi host `192.168.100.36`; Metro `/status` and gateway `/health` are ready. Expo Go was restarted with `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL=http://192.168.100.36:8788`; iOS bundle (6,052,756 bytes) and Android bundle (5,512,748 bytes) both return HTTP 200 and contain the gateway URL and recorder/player stop fix.
- Current Expo Go preview loaded on the Android API 37 AVD. After playing the bundled answer, mic recording showed `00:03` with a visible meter; Cancel then a second mic start showed `00:02` with the meter again. The second turn was canceled, not submitted; no audio was uploaded and no recent JS fatal/load error appeared. This proves recorder re-entry after Cancel on this emulator only; it does not prove speech transcription, re-entry after an answered transcript, or iPhone behavior.

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

This evidence does not verify phone speakers/headphones, mic recording or codec, physical-device networking, iOS, TalkBack/VoiceOver, Dynamic Type on a phone, background/call routing, or release performance. Emulator fontScale 2.0 was checked on Landing (before/after scroll), the Home point trail and the point-01 typed-answer flow; the software IME was checked through typed Q&A. The local APK points to the current LAN gateway; a phone must use a verified Expo Go LAN preview described in `docs/VOICE_HANDOFF.md` for STT testing.

## Font scale 2.0 responsive Home — 14/10/2026

- At large font scale, Home switches from overlapping map labels to the existing vertical `AlleyTrailView`; point names and details wrap, the list scrolls, and the fixed story action remains usable.
- Evidence: `android-api37-font-scale-200-home-trail-2026-10-14.png`; Landing at top and scrolled: `android-api37-font-scale-200-landing-top-2026-10-14.png`, `android-api37-font-scale-200-landing-scrolled-2026-10-14.png`.
- Tested on Android API 37 AVD only. iPhone Dynamic Type, VoiceOver/TalkBack and the second-turn voice failure remain unverified on a physical device.

## Automatic replay — 14/10/2026

- `android37-auto-loop-after-one-pass-2026-10-14.png` shows the 23-second story looping to 00:04 while playback remains active after its first pass.
- `android37-auto-loop-stop-2026-10-14.png` shows Stop returning the player to Ready with progress reset; stopping disables auto replay.
- Tested on Android API 37 AVD only; physical-device audio routing and iOS remain unverified.

## Expo Go current bundle and recorder re-entry — 14/10/2026

- `android-api37-current-preview-2026-10-14.png` shows the current Expo Go Q&A screen with the answer player, follow-up and idle voice dock.
- `android-api37-second-recording-2026-10-14.png` shows an active second recording at `00:02` with the real recorder meter visible. The sequence played the existing answer, started recording, canceled, then started again and canceled; the clip was not sent to the gateway.
- The Expo Go Android bundle was fetched over LAN (HTTP 200, 5,512,748 bytes) and contains `http://192.168.100.36:8788` plus the awaited playback-stop code. The iOS bundle was also fetched (HTTP 200, 6,052,756 bytes). Neither export nor emulator run proves the physical iPhone second-turn case.

## Release player-to-mic re-entry — 14/10/2026

- Fresh release APK `mobile/android/app/build/outputs/apk/release/app-release.apk`: 121,244,960 bytes, SHA-256 `AC05A7E98F4A42B51021D2FFF554091764766FB5033ADABD901D5AE5BC4D7831`; build succeeded (377 tasks, 30 executed, 347 up-to-date) and was installed/launched on Android API 37 AVD.
- Native UI sequence on the explicitly verified package `com.valentino241.ngokedemo`: the story player reached `00:00` with Pause visible, then a mic tap stopped playback and entered `Đang thu · 00:01` with a live meter; Cancel returned the dock to idle. Evidence: `android37-com-player-playing-2026-10-14.png`, `android37-com-mic-recording-2026-10-14.png`, and `android37-com-mic-cancelled-2026-10-14.png`. No recording was submitted.
- This APK had no gateway URL configured, so this is only native Android player/recorder handoff evidence. It does not test spoken Vietnamese, STT, Q&A, the second submitted turn, or the user's iPhone issue. The latest logcat sample had no fatal/ReactNativeJS errors.
- With Android microphone permission revoked, the OS permission prompt appeared; choosing “Don’t allow” showed the app fallback “Ngõ Kể chưa được cấp quyền dùng micro. Bạn có thể gõ câu hỏi thay thế.” Granting the permission again through the emulator and tapping Retry started recording with a live meter; Cancel returned idle. No audio was submitted. The recovery screenshot is `android37-permission-recovery-2026-10-14.png`.

## Repeated player-to-mic re-entry — 14/10/2026

- On the same release APK and package, started the story player, tapped the mic, and verified the player stopped while the recorder entered `Đang thu · 00:01` with a non-zero native meter. Canceled, played the story again, and repeated the handoff; the second recording also reached `Đang thu` with the meter visible.
- Evidence: `android37-release-player-before-recorder-2026-10-14.png`, `android37-release-player-to-mic-first-active-2026-10-14.png`, and `android37-release-player-to-mic-second-active-2026-10-14.png`.
- Android microphone permission was granted. Neither clip was submitted, and no speech/STT or answer turn was exercised. This does not reproduce or clear the user's physical iPhone failure.

## Current source Android release — 14/10/2026

- Rebuilt from the current source: 121,245,024 bytes, SHA-256 `22039D2628A20AFBB5B7293AD7CA89828CA65A0A621C21AA2D0DED0D9580D80A`. Installed and launched on API 37 AVD.
- In Q&A point 01, played the bundled answer, tapped mic, and observed `Đang thu · 00:02` with a non-zero recorder meter; canceled. Started mic a second time and again saw the meter; canceled. AppOps reported `RECORD_AUDIO` running while recording and returned to idle after cancel. No audio was submitted.
- Screens: `android37-current-build-launch-2026-10-14.png`, `android37-current-build-home-2026-10-14.png`, `android37-current-build-alley-2026-10-14.png`, `android37-current-build-qa-2026-10-14.png`, `android37-current-build-answer-playing-2026-10-14.png`, `android37-current-build-meter-active-2026-10-14.png`, and `android37-current-build-second-meter-active-2026-10-14.png`.
- APK has no STT gateway URL; this is Android player/recorder regression evidence only. It does not verify speech recognition, second submitted answer, iPhone/iOS audio-session behavior, physical routes or performance.
