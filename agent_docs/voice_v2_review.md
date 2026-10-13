# Voice V2 — Native listening UI

**Ngày:** 13/10/2026
**Trạng thái:** Android API 37 emulator phát clip catalogue và điều khiển player đạt; kiểm nghe trên điện thoại thật/iPhone còn pending.
**Gate GV2:** có native emulator evidence; chưa đóng vì chưa xác nhận âm thanh/route trên thiết bị thật và iOS.

## Đã làm

- Dùng `expo-audio` tương thích Expo SDK 57 với một player native; có play/pause/resume/replay/stop và progress từ playback status thật.
- Ghép voice rail, player, mic/interaction dock, chữ ẩn mặc định, drawer nhập/xem chữ và các trạng thái bận/lỗi/disabled vào màn Q&A native. Không tự phát khi vào app, đổi điểm hay bấm chip.
- Android text drawer dùng `KeyboardAvoidingView` với behavior `height`; drawer và nút Gửi tiếp tục nhìn thấy khi bàn phím bật.
- Ràng audio bằng node/content ID, text hash và catalogue revision. Live không mượn audio Demo; đổi điểm/chương/mode, route hoặc app background dừng lượt cũ.
- Cấu hình microphone permission bằng plugin, tắt background recording/playback. Expo Doctor 21/21, dependency check, typecheck/lint và Android/iOS JS export đều đạt.

## Bằng chứng và giới hạn

- Source: `mobile/src/voice/useVoiceSession.ts`, `mobile/src/components/VoicePlayerBar.tsx`, `mobile/src/components/VoiceInteractionDock.tsx`, `mobile/src/screens/QaScreen.tsx`, `mobile/app.json`.
- `npm test`: 126/126; `npm run typecheck`, `npm run lint`, `npm run check:dependencies`: đạt. Android và iOS Expo JS exports đều thành công.
- Android `:app:assembleRelease` build thành công; APK internal debug-signed chạy trên Android API 37 emulator. Bản APK mới nhất được kiểm lại trực tiếp: player có progress thật và play/pause/resume/replay/stop đạt. Mở text drawer khi bật keyboard vẫn thấy ô nhập/nút Gửi; câu gõ không dấu `day la diem nao` match Q&A point 01, drawer đóng, answer đúng node hiện ra nhưng không autoplay; bấm Play mới phát answer. Mở chữ, Back, đổi điểm, vào lại và offline audio cũng đã kiểm.
- Tắt Wi-Fi/data trên emulator nhưng story MP3 bundle vẫn phát và progress chạy; STT vẫn cần mạng/gateway.
- Bằng chứng native emulator: `agent_docs/evidence/voice/android-emulator/README.md`. Ảnh là từ app binary đang chạy, không phải SVG/mockup; không chứng minh âm thanh loa/tai nghe ngoài đời.
- Chưa kiểm loa/tai nghe/Bluetooth, silent mode, lock/background/call, Reduce Motion, font 150–200%, VoiceOver/TalkBack, jank hoặc playback trên máy iOS/thật.

**Còn lại:** trên điện thoại thật nghe intro/story/answer và lặp lại player/back/đổi điểm; xác nhận route loa/tai nghe và kiểm iOS nếu có. Không gọi emulator là nghiệm thu phần nghe ngoài đời.
