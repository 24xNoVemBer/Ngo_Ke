# Voice V2 — Native listening UI

**Ngày:** 15/10/2026
**Trạng thái:** Android API 37 emulator phát clip catalogue, điều khiển player và tự lặp clip đạt; lượt hai trên Expo Go `:8089` được người dùng xác nhận có meter, transcript, đáp án đúng và tiếng trả lời. Bản mới `:8081` vẫn chờ người dùng reload/test. Mic start chỉ pause player, không chờ native seek.
**Gate GV2:** còn mở vì chưa kiểm độc lập playback, route loa/tai nghe/Bluetooth và interruption trên iPhone.

## Android SDK 57 Q&A reader/player recheck — 15/10/2026

- Rebuilt/installed release APK `com.valentino241.ngokedemo` version `0.1.0`; installed APK matches the local 121,247,816-byte artifact, SHA-256 `B11555198EBF7CDCD78A8A241E1FFEF4EF5B35B5BB4A5701331055DF46B66083`.
- On chapter 1, selected “Đây là điểm nào?” and opened the answer text while the answer player was running. The answer stayed visible while the player advanced through `00:08 / 00:10` and into its replay cycle; evidence and limits are in [`android37-native-sdk57-2026-10-15`](evidence/voice/android37-native-sdk57-2026-10-15/README.md).
- This is UI and player-timeline evidence on a no-audio AVD, not audible playback, mic/STT, audio-route, or iPhone proof. `uiautomator dump` could not reach idle state during the player animation, so no XML from that attempt is used.

## Đã làm

- Dùng `expo-audio` tương thích Expo SDK 57 với một player native; có play/pause/resume/replay/stop và progress từ playback status thật.
- Ghép voice rail, player, mic/interaction dock, chữ ẩn mặc định, drawer nhập/xem chữ và các trạng thái bận/lỗi/disabled vào màn Q&A native. Không tự phát khi vào app, đổi điểm hay bấm chip.
- Android text drawer dùng `KeyboardAvoidingView` với behavior `height`; drawer và nút Gửi tiếp tục nhìn thấy khi bàn phím bật.
- Ràng audio bằng node/content ID, text hash và catalogue revision. Live không mượn audio Demo; đổi điểm/chương/mode, route hoặc app background dừng lượt cũ.
- Cấu hình microphone permission bằng plugin, tắt background recording/playback. Expo Doctor 21/21, dependency check, typecheck/lint và Android/iOS JS export đều đạt.

## Bằng chứng và giới hạn

- On the current source APK (SHA-256 `BA973B5F23550367191A3A5ED004FD411CEF6D90ABB5C0FB5A132AA4897221D2`), started the story player (`00:01` with Pause), pressed Home, then reopened the app. The player showed `Sẵn sàng · 00:23` with Play and 0% progress; it did not resume. Screenshots: `android37-source-release-player-background-active-2026-10-14.png` and `android37-source-release-player-background-return-2026-10-14.png` in the Android evidence folder.
- This is background-state verification on API 37 AVD `-no-audio`; it does not test speaker output, headphones or iPhone audio-session behavior.
- Source: `mobile/src/voice/useVoiceSession.ts`, `mobile/src/components/VoicePlayerBar.tsx`, `mobile/src/components/VoiceInteractionDock.tsx`, `mobile/src/screens/QaScreen.tsx`, `mobile/app.json`.
- `npm test`: 126/126; `npm run typecheck`, `npm run lint`, `npm run check:dependencies`: đạt. Android và iOS Expo JS exports đều thành công.
- Android `:app:assembleRelease` build thành công; APK internal debug-signed chạy trên Android API 37 emulator. Bản APK mới nhất được kiểm lại trực tiếp: player có progress thật và play/pause/resume/replay/stop đạt. Mở text drawer khi bật keyboard vẫn thấy ô nhập/nút Gửi; câu gõ không dấu `day la diem nao` match Q&A point 01, drawer đóng, answer đúng node hiện ra nhưng không autoplay; bấm Play mới phát answer. Mở chữ, Back, đổi điểm, vào lại và offline audio cũng đã kiểm.
- Revalidation 14/10: `player.loop` bật cho track đã qua các guard; Stop tắt loop và reset. Story 23 giây tự quay từ `00:22` về `00:04` khi vẫn phát; Stop trả player về Ready. Bằng chứng: `agent_docs/evidence/voice/android-emulator/android37-auto-loop-after-one-pass-2026-10-14.png` và `android37-auto-loop-stop-2026-10-14.png`. APK SHA-256 `7B39F4A7E14CF9F80D26F207E6E6150C9F0A8E8DCD744A939A7ACCB9151AF5D5`.
- Ảnh iPhone ban đầu ngày 14/10 cho thấy meter trống và Q&A unknown; sau reload Expo Go, người dùng xác nhận meter và câu trả lời đều chạy. Đây là happy path người dùng báo, không có capture/log để xác minh tiếng answer hoặc audio route trên iOS.
- Tắt Wi-Fi/data trên emulator nhưng story MP3 bundle vẫn phát và progress chạy; STT vẫn cần mạng/gateway.
- Bằng chứng native emulator: `agent_docs/evidence/voice/android-emulator/README.md`. Ảnh là từ app binary đang chạy, không phải SVG/mockup; không chứng minh âm thanh loa/tai nghe ngoài đời.
- Metro Expo Go đang phục vụ iOS bundle HTTP 200 qua LAN; gateway đã sẵn sàng. Dừng lời đọc tắt loop và pause, không chờ seek native; lần phát tiếp theo nạp track từ đầu. Recorder trên Android AVD vẫn mở lại được sau Hủy, nhưng chưa chứng minh lượt iPhone sau khi nhận đáp án. Kiểm tra loa/tai nghe/Bluetooth, silent mode, lock/background/cuộc gọi, Reduce Motion, VoiceOver/TalkBack, độ mượt và playback trên iPhone vẫn còn chờ.

**Còn lại:** trên điện thoại thật nghe intro/story/answer và lặp lại player/back/đổi điểm; xác nhận route loa/tai nghe và kiểm iOS nếu có. Không gọi emulator là nghiệm thu phần nghe ngoài đời.

## Recheck bundle iOS hiện tại — 14/10/2026

- Expo Go LAN `:8089/status` và iOS bundle đều trả HTTP 200; bundle 6,068,742 byte có guard `keepAudioSessionActive` và playback intent mới.
- Bundle này không chứa URL gateway, nên chỉ có thể kiểm player/mic/meter; playback route và lượt hỏi tiếp trên iPhone vẫn pending.

## Current bundle and APK follow-up — 15/10/2026

- The latest iOS bundle served from `:8081` returned HTTP 200 over LAN in 5.26 seconds (6,073,980 bytes) and includes the current dataset revision, exact aliases and gateway URL. Gateway `/health` is ready on `large-v3-cuda`. The user has deferred reloading Expo Go, so this verifies host delivery only.
- Current Android API 37 APK `B171E9C88288097F15F0DCBB15036F7D808373ACCCA6D22D9030833AADFB85B2` launched and rendered chapter 4's answer text correctly. The AVD has no usable audio; it does not close playback, mic, route, interruption, iOS or Dynamic Type checks.
