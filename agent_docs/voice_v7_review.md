# Voice V7 — Nghiệm thu và preview

## Revalidation sau native start guard và chữ lớn — 14/10/2026

- `npm test` 152/152, typecheck/lint và iOS + Android JS exports đạt. Gateway `/health` và Metro `:8090/status` trả HTTP 200; Expo Go preview dùng `exp://192.168.100.36:8090`. Metro iOS bundle HTTP 200 (6,064,803 bytes) includes recorder and stale-playback guards.
- Recorder stage nay chờ tối đa 1 giây để xác nhận native `isRecording`; playback bị bỏ nếu đã lỗi thời khi đổi audio mode. Điều này chưa xác minh microphone metering hoặc STT ở lượt hai trên iPhone. AVD/APK evidence vẫn không thay cho kiểm thử trên iPhone thật.
- Android API 37 AVD tại fontScale 2.0 dùng danh sách điểm dọc có thể cuộn, nhãn wrap và dock còn thao tác được; ảnh `android-api37-font-scale-200-home-trail-2026-10-14.png`. Landing được kiểm ở đầu và sau cuộn: `android-api37-font-scale-200-landing-top-2026-10-14.png`, `android-api37-font-scale-200-landing-scrolled-2026-10-14.png`.
- APK đang lưu trong thư mục build có trước native-start guard; dùng Expo Go LAN preview để thử đúng source mới. Điện thoại iPhone chưa retest lỗi lượt hai; Expo JS export không thay cho iOS native/device proof. TalkBack/VoiceOver, Dynamic Type trên máy thật, audio routes và hiệu năng vẫn pending.

## Expo Go gateway configuration and recorder re-entry — 14/10/2026

- Detected that an initial Metro restart lacked `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL`, leaving the Expo Go preview without a usable STT endpoint. Restarted Metro with `http://192.168.100.36:8788`; `/status` and gateway `/health` are ready. iOS and Android bundles both return HTTP 200 and include the configured gateway URL and awaited player stop.
- Expo Go loaded on the Android API 37 AVD. Playing the answer then starting the recorder showed the meter; Cancel followed by another recorder start also showed the meter. Both clips were canceled and not submitted; no recent JS fatal/load error was found. Screenshots are in `agent_docs/evidence/voice/android-emulator/`.
- Latest checks: `npm test` 144/144; typecheck, lint, `git diff --check`, and iOS JS export pass. This verifies Expo Go bundle delivery and Android emulator recorder re-entry after Cancel only.
- **Still pending:** user-reported second-turn failure has not been retested on the physical iPhone; no spoken clip was submitted in this AVD run. Real iOS/Android speech→STT→exact follow-up→answer, routes/accessibility/performance, and human listening are not proven; GV5/GV7 remain open.

## Revalidation sau auto replay — 14/10/2026

- Android release APK hiện tại: 121,235,376 byte, SHA-256 `20154EE9B845396E43ED7F76AAD5AFD9C3639A870E017D23FF670E469E531773`; build thành công, cài và mở được trên Android API 37 AVD. Đã đi từ landing tới Q&A điểm 01, chọn chip hỏi và thấy answer player ở Ready, không tự phát; đã chủ động Play, quan sát audio 9 giây quay về 00:00 và tiếp tục phát, rồi Stop về Ready. Ảnh/chi tiết: `agent_docs/evidence/voice/android-emulator/README.md` và các file `android37-latest-build-*.png`. Không thấy marker fatal/ReactNativeJS error trong logcat 800 dòng gần nhất.
- Auto replay/Stop 23 giây đã được kiểm trước đó trên AVD; bằng chứng: `agent_docs/evidence/voice/android-emulator/android37-auto-loop-after-one-pass-2026-10-14.png`, `android37-auto-loop-stop-2026-10-14.png`. Trên APK mới ở trên cũng đã xác nhận answer 9 giây tự lặp rồi Stop về Ready.
- Sau sửa iOS/meter/transcript ngày 14/10: `npm test` 143/143, typecheck, lint, dependency check và Android/iOS JS exports pass. Gateway `/health` trả `ready`. Metro cổng 8089 hiện trả `/status`; iOS bundle tải thành công và có gateway LAN, thang meter mới và disclosure transcript. Đây là bằng chứng bundle local, chưa chứng minh iPhone đã tải hay gửi request.
- Kiểm tra tiếp ngày 14/10: Expo dependency check và iOS JS export pass; V1 validator đạt 34/34 clip; local gateway smoke test pass. Đây là kiểm tự động, không phải IPA, kiểm thử iPhone hoặc nghe tay.
- Sau khi reload Expo Go với bundle mới, người dùng xác nhận trên iPhone meter và câu trả lời đều chạy trong lần thử voice. Đây là happy path được người dùng báo lại; chưa có transcript nguyên văn, gateway log, OS/model iPhone hay video để đối chiếu độc lập. Audio route, accessibility trên iOS và performance vẫn pending; GV5/GV7 còn mở.

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
