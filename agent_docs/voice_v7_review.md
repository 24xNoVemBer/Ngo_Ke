# Voice V7 — Nghiệm thu và preview

## Revalidation after Android codec fix — 13/10/2026

- Current APK: 121,233,212 bytes, SHA-256 `159EE52016DCC4F5B5B5C9DC697AB4FD20B0294D99B13A64CC74B5DED38F6D98`; release build `BUILD SUCCESSFUL` (377 tasks; 26 executed, 351 up-to-date). It was installed on API 37 AVD and exercised through real recorder submit.
- Found and fixed recorder configuration falling back to AMR-NB. After the fix, the uploaded clip passed gateway media validation; the actual AVD had no intelligible speech, so faster-whisper correctly returned `NO_SPEECH` and the UI showed retry guidance. [Screenshot](evidence/voice/android-avd-stt-no-speech-2026-10-13.png).
- Full gateway smoke test passed with local synthetic TTS audio; `npm test` 138/138, typecheck and lint passed. Expo Go Metro is now serving on `exp://<DEV_LAN_IP>:8087`; `/status` is HTTP 200 and iOS/Android bundles (6,048,798 / 6,050,971 bytes) include `http://<DEV_LAN_IP>:8788`. Gateway `/health` is HTTP 200 on that private interface.
- The emulator's silence is not proof of spoken STT, Q&A answer playback or physical microphone quality. Phone/iOS hardware, audio routes, accessibility audit and performance measurements remain pending; GV5/GV7 stay open.

## Snapshot trước khi kiểm codec recorder — 13/10/2026 (đã supersede)

- APK LAN-preview: 121,232,376 byte; SHA-256 `C30FA2718E2A89E0818791015596AB3C41D21E1D0450B5F4ECD95A4C85D34A12`. ZIP xác nhận bundle trỏ tới `http://<DEV_LAN_IP>:8788`, có accessibility labels, timeout fix và đủ 34 MP3; bundle hash trong APK khớp output bundle vừa build.
- Android/iOS JS exports chạy thành công với IP mới. Gradle build `:app:assembleRelease --offline --no-daemon --max-workers=1` **BUILD SUCCESSFUL**; thay URL được thêm làm task input và đã xác minh task bundle chạy lại khi đổi/khôi phục URL.
- Metro LAN preview đã được khởi động lại với gateway URL hiện tại; `/status` running, iOS/Android bundles trả HTTP 200 và nhúng gateway URL cùng Live fallback. Expo Go: `exp://<DEV_LAN_IP>:8086`; chưa mở trên điện thoại thật.
- `npm test` 135/135; typecheck/lint/dependency check pass. Gateway smoke pass cho malformed, short, silence và too-long; timeout test bao phủ body response. APK release build pass trong 1m58s, 377 tasks (30 executed, 347 up-to-date).
- Gateway chạy tại `<DEV_LAN_IP>:8788`, PID 42784. APK cài/mở được trên AVD `Medium_Phone_API_37.0`; ảnh [Q&A](evidence/voice/android37-qa-screen-2026-10-13.png) và [text reader mở](evidence/voice/android37-reader-open-2026-10-13.png) ghi trạng thái native. Chưa thử mic → gateway/answer/audio; AVD dùng `-no-audio`, không gửi clip mic. Điện thoại thật/iOS, nghe tay 34 clip và kiểm audio route/accessibility/performance vẫn pending; GV7 còn mở.

Các IP cũ và hash cũ trong snapshot phía dưới đã được supersede.

**Ngày:** 13/10/2026
**Trạng thái:** APK Android LAN-preview mới (121,231,544 byte; SHA-256 `1020E39520285521871741E2BCE198D14E018DDEFC06B5A82258BBEE24773362`) đã được xác minh có URL `<DEV_LAN_IP>:8788`, accessibility labels và 34 MP3. Gateway process chạy và smoke synthetic STT/guard đã đạt. ADB không thấy thiết bị nên chưa cài APK mới; điện thoại thật/iOS chưa nghiệm thu.
**Gate GV7:** còn mở. Không đánh dấu luồng hoàn thiện từ đầu đến cuối.

## Revalidation mới nhất — 13/10/2026

- Android/iOS Expo exports exit 0 với `--no-bytecode --clear` và URL `<DEV_LAN_IP>:8788`; mỗi lần export bundle riêng, không phải native binary.
- Gradle không invalidates native JS bundle theo biến URL môi trường; lần assemble incremental giữ IP cũ. Buộc `:app:createBundleReleaseJsAndAssets --rerun-tasks` (2 phút 40 giây), xác nhận bundle SHA `D24154D75031FC2ABF428DC1BF687C6C16820E88508C15E92E0A3DC05B725A73`, rồi assemble thành công 3 phút 26 giây (377 tasks, 38 executed, 339 up-to-date).
- APK cuối 121,231,544 byte, SHA-256 `1020E39520285521871741E2BCE198D14E018DDEFC06B5A82258BBEE24773362`; ZIP chứa 34 MP3, `http://<DEV_LAN_IP>:8788`, không có URL cũ, và `accessibilityLabel`. `adb devices -l` rỗng nên chưa cài APK mới.
- Gateway Node 24.14.1/faster-whisper 1.2.1 bind riêng `<DEV_LAN_IP>:8788`; synthetic clip 18.81s trả transcript HTTP 200/context echo đúng, invalid format trả 415, clip 21s trả 400 `AUDIO_TOO_LONG`. Transcript còn lỗi từ; phone/app mic E2E chưa chạy.

## Bằng chứng đạt được

- `npm test`: 131/131; typecheck, lint và Expo dependency check exit 0. Android/iOS JS exports pass (1,064/1,069 modules) và đều nhúng URL LAN khi build với biến môi trường.
- APK LAN cũ đã cài/chạy trên API 37 emulator; emulator evidence bên dưới thuộc binary đó. APK build cuối hiện có hash/endpoint ở phần Revalidation mới nhất phía trên và chưa được cài vì ADB rỗng.
- Native emulator screenshots và nhãn thiết bị/state: `agent_docs/evidence/voice/android-emulator/README.md`. Trên APK LAN đã chạy ở lần kiểm trước, guard dừng ở 19.5s trước hard limit 20s, UI giữ `00:19` và chờ Gửi/Hủy; Hủy đưa dock về idle; Back khi đang thu rời màn và AppOps ghi 1.814 giây. Không gửi clip mic. Bằng chứng này thuộc binary trước APK mới; first-permission-grant screenshot cũng từ build liền trước.
- Gateway smoke hiện tại: clip TTS tổng hợp 18.81s được nhận; clip PCM 21s trả HTTP 400 `AUDIO_TOO_LONG`; invalid-format trả 415. Không dùng audio cá nhân.
- Metro preview không được khởi động: thao tác chạy `npx expo start --lan --port 8086 --go` bị công cụ từ chối theo policy. Expo Android export xác nhận URL env trong bundle; native APK LAN preview đã cài/chạy thay thế Expo Go cho bước thử Android. Phone và app-to-gateway từ mic vẫn pending. Cách mở APK/khởi động Metro thủ công ở `docs/VOICE_HANDOFF.md`.
- Trên APK vừa cài, mở app và chuyển từ màn đầu đến Q&A, đổi điểm; player reset và app không crash. Kiểm tra trực quan trên point 01: player controls phát thật; text drawer còn nhìn thấy cùng keyboard; câu gõ không dấu match câu hỏi đã duyệt của point 01; answer đúng hiện ra, không tự phát cho tới khi bấm Play.
- UI logic cho cancel, stale context, exact Q&A, fallback, Plan/QR/GPS và hidden text có unit/UI tests; đây không phải native device proof.
- Accessibility audit: thêm labels cho sáu Pressable thiếu nhãn trong `QaScreen`; 17/17 Pressable hiện có role/label. `uiFlows.test.mjs` assertions, 131 tests tổng, typecheck và lint đều đạt. APK mới chứa các label theo kiểm tra bundle; kiểm tra native/TalkBack trên thiết bị vẫn pending.

## Chưa kiểm được

- Android SDK/ADB/emulator đã dùng được qua `<USER_HOME>\AppData\Local\Android\Sdk`; không truy cập được iPhone hoặc điện thoại Android vật lý từ môi trường này.
- Emulator đã kiểm fontScale 2.0 trên Landing, AlleySelect, story screen và point-01 typed-answer flow; text drawer, Gửi và gợi ý vẫn hiển thị khi software IME mở. Đã phát hiện rồi sửa hàng tiêu đề Home chồng chữ, nhãn DEMO và placeholder tìm kiếm bị cắt. Bằng chứng trước/sau ở `agent_docs/evidence/voice/android-emulator/README.md`. Chưa kiểm Dynamic Type trên phone, TalkBack/VoiceOver, Reduce Motion, cửa sổ thấp hoặc nghe tay 34 clip.
- Chưa kiểm lời nói rõ/codec của clip thu, mic trên phone, loa/tai nghe/Bluetooth/silent mode/call/lock/background trên phone. Keyboard large-text đạt trên emulator trong luồng gõ Q&A; chưa xác minh trên thiết bị thật.
- Chưa đo release→transcript, transcript→audio start, stop/cancel responsiveness, p50/p95, frame time/jank, memory/listeners qua 20 vòng. Không suy ra hiệu năng thiết bị từ Expo export hay máy dev.
- APK mới đã build sau snapshot emulator (SHA-256 `1020E39520285521871741E2BCE198D14E018DDEFC06B5A82258BBEE24773362`) và chứa accessibility labels theo bundle check. ADB hiện rỗng nên chưa cài để xác nhận labels native; JDK 17 build đã pass sau khi làm mới CMake cache sinh tự động.
- `npm audit` báo 23 advisory (8 moderate, 15 high) trong dependency tree. Đề xuất tự động của npm gồm downgrade Expo/RN nhiều major; không chạy `audit fix --force` vì sẽ phá tương thích SDK 57. Cần rà dependency/security riêng trước khi public release.
- Có screenshot native emulator ở `agent_docs/evidence/voice/android-emulator/`; chúng là bằng chứng emulator, không thay proof điện thoại thật hoặc iOS.

**Bước đóng GV7:** khởi động Metro theo `docs/VOICE_HANDOFF.md`, mở Expo Go trên điện thoại cùng Wi-Fi, rồi chủ động gửi câu hỏi và nghe đúng answer. Status vẫn là *emulator lifecycle pass; phone/iOS và app-to-gateway voice E2E pending*.
