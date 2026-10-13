# Voice V0–V7 — Báo cáo kiểm thử

## Lỗi mất meter ở lượt iPhone thứ hai — cập nhật 14/10/2026

- Người dùng xác nhận lượt đầu có meter và trả lời; lượt hai mất meter rồi lỗi. Chưa có log native/transcript nên nguyên nhân dưới đây vẫn là giả thuyết cần retest trên iPhone.
- Mỗi lần thu giờ truyền lại đầy đủ `RecordingPresets.HIGH_QUALITY` và `isMeteringEnabled: true` vào `prepareToRecordAsync`. Expo Audio iOS tạo recorder mới khi có options; gọi không options có thể dùng lại recorder đã dừng. Test kiểm tra hai lượt chuẩn bị đều giữ options/meter.
- `npm test` 148/148, typecheck, lint, `git diff --check` và iOS JS export đạt. Metro `exp://192.168.100.36:8089` trả iOS bundle HTTP 200 (6,056,186 byte), chứa options recorder mới và Home fallback cho cỡ chữ lớn; gateway `/health` sẵn sàng.
- Đây chưa phải xác nhận iPhone đã sửa. Reload Expo Go, chạy xong câu đầu, chạm mic lần nữa và kiểm meter; hỏi “Có chuyện xưa nào ở đây không?” để xác nhận câu trả lời tiếp theo. GV3/GV5/GV7 vẫn mở.

## Retest sau lỗi meter/transcript và kiểm tra preview — 14/10/2026

- Meter dùng thang dBFS xuống −80 dB; transcript không khớp vẫn ẩn mặc định nhưng có nút **Xem câu đã nhận dạng**. Plugin iOS chỉ thêm policy local-network cho gateway HTTP private; không bật ATS toàn cục.
- `npm test` hiện 148/148; typecheck, lint và iOS JS export pass. Gateway `/health` trả `ready` (Node 24.14.1, faster-whisper 1.2.1, model `Systran/faster-whisper-small`).
- Metro `:8089` trả running; iOS bundle tải thành công và chứa gateway URL hiện tại, cấu hình recorder từng lượt và disclosure transcript. Người dùng từng xác nhận lượt đầu có meter và câu trả lời; lần retest sau đó mới phát hiện lượt hai lỗi như ghi ở mục trên.
- Đây là happy path do người dùng xác nhận, chưa có transcript nguyên văn, server log hay model/OS iPhone để đối chiếu độc lập. Chưa bao phủ các chương/câu hỏi khác, lỗi mạng/quyền, cancel/interruption, audio route, accessibility hoặc hiệu năng. Nếu gặp unknown, mở **Xem câu đã nhận dạng** và gửi phần chữ; không cần gửi audio.
- Android release build hoàn tất lại sau đó: APK 121,235,376 byte, SHA-256 `20154EE9B845396E43ED7F76AAD5AFD9C3639A870E017D23FF670E469E531773`. Đã cài/mở trên Android API 37 AVD, điều hướng tới Q&A điểm 01; chip hỏi không autoplay, answer 9 giây phát/lặp, Stop về Ready. Không có marker fatal/ReactNativeJS error trong 800 dòng logcat gần nhất. Không thu mic/gửi network trong lượt kiểm APK này.

## Revalidation mới nhất sau sửa codec recorder — 13/10/2026

- Tìm ra nguyên nhân app-to-gateway bị `INVALID_AUDIO`: `prepareToRecordAsync({ isMeteringEnabled: true })` làm mất cấu hình preset AAC; Android ghi AMR-NB dù tên file là `.m4a`. Đã giữ nguyên preset `HIGH_QUALITY` + metering khi tạo recorder và gọi prepare không tham số.
- APK mới `mobile/android/app/build/outputs/apk/release/app-release.apk`: 121,233,212 byte; SHA-256 `159EE52016DCC4F5B5B5C9DC697AB4FD20B0294D99B13A64CC74B5DED38F6D98`. Đã cài/chạy trên `Medium_Phone_API_37.0`; gửi bản thu 19 giây từ màn Q&A điểm 01. Gateway nhận media và ASR trả `422 NO_SPEECH` sau 1.134s; UI hiển thị hướng dẫn thu lại. Ảnh: [native AVD no-speech](../agent_docs/evidence/voice/android-avd-stt-no-speech-2026-10-13.png). AVD không có lời nói, nên chưa có transcript thật, chưa chạy answer/audio qua app.
- `npm test`: 138/138; `npm run typecheck`, `npm run lint` và `:app:assembleRelease` pass. `node tools/voice/gateway/smoke_test.mjs` pass với synthetic TTS 19.15s (HTTP 200, transcript/context), invalid format, too short, silence và too long.
- Gateway hiện chạy bind riêng `<DEV_LAN_IP>:8788`; `/health` HTTP 200, Node 24.14.1/faster-whisper 1.2.1. Metro Expo Go LAN chạy tại `exp://<DEV_LAN_IP>:8087`; `/status` HTTP 200, Android bundle 6,050,971 byte và iOS 6,048,798 byte; cả hai nhúng gateway URL. Đây là JS preview, không phải native iOS build.
- **Chưa hoàn tất goal:** chưa thử lời nói dễ nghe từ điện thoại thật, chưa có mic→transcript→Q&A→audio qua app, chưa kiểm iOS phần cứng, nghe tay 34 clip, accessibility/audio routes/performance. GV3/GV5/GV7 còn mở.

## Snapshot trước kiểm thử codec — 13/10/2026 (đã supersede)

- Gateway Voice-only đang chạy trên `<DEV_LAN_IP>:8788` (PID 42784), bind riêng Wi‑Fi; `/health` báo Node 24.14.1/faster-whisper 1.2.1 ready. Synthetic TTS 19.15s trả HTTP 200 và echo context. Transcript có nhiều lỗi từ; chưa xác nhận chất lượng bằng nghe người thật. Guard sai format 415 và WAV 21s `AUDIO_TOO_LONG` đã được xác nhận ở lần smoke trước trên cùng code.
- APK mới `mobile/android/app/build/outputs/apk/release/app-release.apk`: 121,232,376 byte, SHA-256 `C30FA2718E2A89E0818791015596AB3C41D21E1D0450B5F4ECD95A4C85D34A12`. ZIP có 34 MP3 và accessibility labels; bundle nhúng `http://<DEV_LAN_IP>:8788` và khớp bundle Gradle hiện tại.
- Sửa Gradle bundle task để theo dõi `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL`; đổi sang URL cũ làm task chạy lại, khôi phục URL hiện tại cũng chạy lại và APK cuối chứa đúng bundle mới. Thay đổi nằm trong `mobile/android` được Git ignore; runbook vẫn dùng `--rerun-tasks` để build chắc chắn sau khi regenerate native project.
- Android/iOS JS exports chạy với URL mới và đủ 34 MP3; đây không phải native iOS build. APK đã cài và mở trên AVD `Medium_Phone_API_37.0`; Q&A chương 1 render, voice dock idle, player ở “Sẵn sàng · 00:23”, và lời kể chỉ mở sau khi chạm. Ảnh: [Q&A](../agent_docs/evidence/voice/android37-qa-screen-2026-10-13.png), [chữ mở](../agent_docs/evidence/voice/android37-reader-open-2026-10-13.png). Điện thoại thật/iOS chưa kết nối; mic → STT → Q&A/audio vẫn pending, không gửi audio mic.
- Metro LAN preview đã được khởi động lại với gateway hiện tại: `/status` trả `packager-status:running`; iOS bundle HTTP 200 (5,507,697 byte), Android bundle HTTP 200 (5,508,311 byte), cả hai chứa gateway URL và Live text fallback. Expo Go link: `exp://<DEV_LAN_IP>:8086`. Chưa mở app trên điện thoại thật.
- Sau timeout và Live fallback fixes: `npm test` 135/135; typecheck, lint và `git diff --check` pass. Gateway smoke integration pass trên Node 24/faster-whisper 1.2.1: clip synthetic 19.15s, malformed format 415, dưới 0.5s `AUDIO_TOO_SHORT`, silence `NO_SPEECH`, quá 20s `AUDIO_TOO_LONG`. Android release build pass trong 1m58s (377 tasks; 30 executed, 347 up-to-date).
- Timeout upload giờ còn hiệu lực đến khi đọc xong response JSON; test xác nhận body bị treo sau headers trả `ASR_TIMEOUT`, cùng test network failure/malformed/stale context.
- Reran V0 ASR probe on six local synthetic clips: selected Đoan Trang preset produced 17/216 exact-word errors (7.9% WER), 5.1% after folding diacritics, weighted ASR RTF 0.213. This is clean TTS, not outdoor microphone accuracy; the direct gateway transcript has visible substitutions, so fixed-Q&A recognition still requires device testing and may need engine/model retuning.

Các địa chỉ `<DEV_LAN_IP>`/`<DEV_LAN_IP>` và APK hash cũ ở snapshot bên dưới đã bị supersede; dùng trạng thái và artifact trong mục này.

**Cập nhật:** 13/10/2026
**Kết luận:** 135 unit/UI tests, Android API 37 emulator run, local gateway probe, native recorder lifecycle và Android release build đạt trong phạm vi ghi dưới đây. Chưa nghiệm thu app-to-gateway từ mic, điện thoại thật/iOS; đây chưa phải release hoàn chỉnh.

> Snapshot trước đó (đã supersede): APK 121,231,544 byte, SHA-256 `1020E39520285521871741E2BCE198D14E018DDEFC06B5A82258BBEE24773362`, gateway `<DEV_LAN_IP>:8788`. ADB khi đó rỗng; phone/iOS mic-to-answer và GV5/GV7 vẫn mở.

## Kết quả

| Phạm vi | Kết quả hiện tại | Bằng chứng / giới hạn |
| --- | --- | --- |
| V0 TTS/STT probe | Đã chọn stack local-only | VieNeu v3 Turbo local; preset Đoan Trang thắng trên 3 clip tổng hợp so với Ngọc Linh theo ASR WER; độ ấm/tự nhiên chưa nghe người thật xác nhận. faster-whisper-small tiếng Việt qua gateway trên LAN; không dùng cloud hoặc credential. |
| V1 audio catalogue | 34/34 integrity/format checks đạt | 6:58.23 audio, 5,043,834 byte; ASR tự động bắt sai khác ở vài clip; nghe tay còn pending. |
| V2 native player/UI | APK trước đó trên API 37 xác nhận phát asset thật, đủ controls và text-input drawer; APK mới đã build và chứa accessibility labels | Progress/pause/resume/replay/stop đạt. Ở fontScale 2.0, drawer giữ tiêu đề, ô nhập, Gửi và câu hỏi gợi ý trên IME; `day la diem nao` match Q&A point 01, answer đúng hiện nhưng không autoplay. APK mới chưa cài lại vì ADB rỗng; chưa kiểm route âm thanh trên điện thoại thật. |
| V3 recorder | Permission-on-tap, cấp lần đầu, safety guard 19.5s, Hủy và Back kiểm trên emulator | Cho phép lần đầu bắt đầu thu ngay; ở 19.5s tự dừng, giữ thời lượng thật `00:19`, chờ Gửi/Hủy; Hủy về idle; Back dừng recorder. Hard limit gateway vẫn 20s. Chưa gửi clip mic. |
| V4 gateway/STT | Local faster-whisper nhận dạng clip tổng hợp; hard limit 20s kiểm độc lập | Smoke 19.15s đạt; PCM silence 21s trả 400 `AUDIO_TOO_LONG`; invalid format trả 415. Probe caption trước đó 3.76s trả transcript đúng nội dung, echo context đủ. Chưa gửi clip mic từ app. |
| V5 fixed Q&A | Q&A chip trên emulator mở đúng answer card và audio sẵn sàng | Chạm chip không tự phát loa; matcher/21 answer có unit tests. Transcript thật từ mic chưa được nối kiểm đầu-cuối. |
| V6 actions | Parser/actions/UI logic đã test | Câu hỏi khác lệnh; ambiguous actions yêu cầu tap; QR/GPS cần CTA. Nhận dạng cách nói trên thiết bị còn pending. |
| V7 nghiệm thu | Android release APK mới build thành công, đã xác minh URL/accessibility labels/34 MP3; emulator cũ đã pass UI/recorder; gateway process chạy, ADB rỗng | Chưa cài APK mới lên emulator/phone. Phone/iOS, app mic → STT E2E, screen reader trên phone, nghe tay và performance pending; GV7 mở. |

## Lệnh và kết quả

- `cd mobile; npm test` — **131 passed, 0 failed** (bao gồm scope-change, permission prompt và safety guard thu 19.5 giây).
- `npm run typecheck -- --pretty false` — pass.
- `npm run lint` — pass.
- `npm run check:dependencies` — pass.
- Expo Doctor — **21/21**.
- Android/iOS Expo JS exports mới nhất exit 0 với `expo export --platform <platform> --no-bytecode --clear` và biến `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL`; mỗi bundle có endpoint LAN và 34 MP3. Export mặc định gặp `spawn EPERM` khi tạo Hermes bytecode. `--no-bytecode` chỉ kiểm bundler/assets, không phải native binary.
- Force `:app:createBundleReleaseJsAndAssets --rerun-tasks` để inject URL mới; bundle mang SHA `D24154D75031FC2ABF428DC1BF687C6C16820E88508C15E92E0A3DC05B725A73`, có `http://<DEV_LAN_IP>:8788` và không còn URL cũ. Sau đó Android `:app:assembleRelease --offline --no-daemon --max-workers=1` — **BUILD SUCCESSFUL**, 3 phút 26 giây, 377 tasks (38 executed, 339 up-to-date). APK: 121,231,544 byte, SHA-256 `1020E39520285521871741E2BCE198D14E018DDEFC06B5A82258BBEE24773362`; ZIP có 34 MP3, URL mới và accessibility labels. ADB rỗng nên chưa cài build cuối lên emulator.
- Emulator UI/recorder: player progress/pause/resume/replay/stop, hidden text, exact Q&A/manual input và no-autoplay đạt. Trên APK LAN hiện tại guard 19.5 giây (500ms margin dưới hard limit 20 giây) dừng thật, UI hiển thị `Đã thu xong · 00:19`; AppOps đo 19.692s; Hủy xóa lượt về idle. Back khi đang thu rời màn và AppOps ghi 1.814s; không tự tiếp tục. First-grant đã được kiểm ở build trước cùng recorder code; build LAN chỉ đổi cách inject endpoint.
- Tắt Wi-Fi và data trên emulator: story MP3 đã bundle vẫn load/phát, player progress tiếp tục; mạng/gateway cần cho STT.
- `node tools/voice/gateway/smoke_test.mjs` — pass trên Node 24.14.1 / faster-whisper 1.2.1: synthetic local clip 19.15 giây được nhận; clip PCM silence 21 giây bị từ chối `AUDIO_TOO_LONG`; invalid-format guard pass.
- Probe bổ sung qua `POST /v1/transcribe`: audio caption TTS đã đóng gói `demo-02-caption.mp3` (không phải ghi âm cá nhân), sau chuyển PCM WAV 16 kHz mono: HTTP 200, audio duration 3.76 s, wall latency 3.83 s, text “Chiếc đồng hồ ngừng chạy, nhưng ông Lâm vẫn giữ lời hứa cho an.”; turnId/locale/mode/nodeId/datasetRevision echo hợp lệ.
- Gateway Node 24.14.1/faster-whisper 1.2.1 đã được chạy bind riêng vào Wi-Fi `<DEV_LAN_IP>:8788`; log startup `ready`. POST synthetic TTS 18.81s trả HTTP 200 và echo đúng turn/context; transcript có lỗi từ ngữ. Invalid format trả 415, WAV PCM 21s trả 400 `AUDIO_TOO_LONG`. Chưa mở Metro/Expo Go, chưa gọi endpoint từ app/điện thoại; gateway process vẫn ở máy dev.
- Regression trên APK LAN mới: mở app, giữ thu đến safety guard 19.5 giây rồi Hủy; sau đó thu lại và Back. App không crash, recording dừng và không tự khởi động lại. Không bấm Gửi, không upload clip mic.
- Build này có sửa Android keyboard avoidance trong `ExpandableInputDrawer`; test native với text entry và answer playback trên final APK đã chạy. Lần quan sát point 04 ban đầu dựa snapshot accessibility không ổn định, không tái hiện lỗi player.
- Kiểm fontScale 2.0 trên APK mới phát hiện tiêu đề “Chọn một con ngõ” đè “Xem tất cả”, nhãn DEMO bị cắt và placeholder tìm ngõ bị xuống dòng/cắt. Đã sửa Landing header xếp dọc, mở hit target “Xem tất cả” lên 48dp, chuyển nhãn DEMO thành pill theo nội dung, và rút gọn/giữ một dòng placeholder. `font-scale-200-home-final.png` và `font-scale-200-alley-final.png` chứng minh bố cục sau sửa; `font-scale-200-story-final.png` ghi nhận dock/player/story còn hiển thị ở cỡ chữ này.
- V1 validator freshly rerun against current files — **34/34** source/text/audio hash, node/revision/path, MP3 decode/format/duration pass. Manifest SHA-256 `90747665D049CC3B4AF018672EF0935805F324236986D8F2047DC79B440113E9`; total 418.23 seconds / 5,043,834 bytes. Mean level −21.0…−18.6 dBFS; peak −7.9…−3.4 dBFS. Human listening remains pending.
- `git diff --check` — kiểm lại sau khi cập nhật tài liệu.

## Những gì test chưa chứng minh

Emulator chứng minh native UI, mic permission, actual recorder start/stop, cap/cancel/Back trên API 37; không thay cho điện thoại thật. Chưa thử ASR từ clip mic của app → transcript → đúng answer/audio (không gửi audio mic), codec M4A qua app, silent/too-short error từ app, call/lock/rút tai nghe, offline trên điện thoại, Dynamic Type trên phone, TalkBack/VoiceOver, Reduce Motion, 20 vòng lifecycle, p50/p95, frame time, memory hoặc listener leak. FontScale 2.0 + software IME đã kiểm được trên emulator ở luồng nhập/gửi text Q&A point 01; đây không phải xác nhận accessibility trên phone. Chưa nghe tay toàn bộ 34 clip; chất giọng/codec/loa thật chưa được người nghe xác nhận.

Preview LAN dùng HTTP và gateway không có auth vì chỉ bind trong mạng local thử nghiệm; không mở port ra Internet, không dùng Wi-Fi công cộng. Khi public exposure cần HTTPS/auth và một review bảo mật riêng.

## Dependency audit

`npm audit` hiện báo **23 advisory: 8 moderate, 15 high**. npm đề xuất một số sửa tự động bằng downgrade nhiều major (gồm Expo/RN), không áp dụng vì không tương thích stack SDK 57. Đây là rủi ro trước khi phát hành công khai; chưa có thay đổi dependency audit trong lượt này.

Chi tiết theo gate: [V0](../agent_docs/voice_v0_review.md), [V1](../agent_docs/voice_v1_review.md), [V2](../agent_docs/voice_v2_review.md), [V3](../agent_docs/voice_v3_review.md), [V4](../agent_docs/voice_v4_review.md), [V5](../agent_docs/voice_v5_review.md), [V6](../agent_docs/voice_v6_review.md), [V7](../agent_docs/voice_v7_review.md).

## Regression audit bổ sung — 13/10/2026

- Sửa lifecycle khi đổi chương, Demo/Live hoặc dataset revision trong màn Q&A: hủy lượt/request cũ, dừng audio, xóa error cũ và reset stage. Text disclosure không tác động đến scope.
- Sau sửa trước đó: `npm test` **126/126**, typecheck, lint, `expo install --check` và `git diff --check` đạt. Bổ sung lần này: `npm test` **131/131**, typecheck/lint/dependency check, Android/iOS exports và Android release build đạt.
- Chạy lại V1 bằng virtualenv đã ghim: **34/34 clip** được decode/đối chiếu; tổng 7.0 phút, 5.04 MB. WER tự động cao nhất: `qa-flowers-answer` 23.1%, `qa-cake-answer` 18.9%, `demo-01-caption` 17.6%; cần người nghe rà lại, chưa gắn pass chất lượng phát âm.
- Thử đổi scope trong lúc mic/gateway đang bận trên điện thoại thật, mic-to-answer end-to-end, iOS và nghe tay 34 clip vẫn chưa làm được trong môi trường hiện tại.

## Revalidation trong managed session — 13/10/2026 (snapshot trước APK native mới)

- Test runner mặc định `npm test` không thể tạo worker con trong môi trường hiện tại (`spawn EPERM`). Chạy trực tiếp đủ 14 file test bằng Node, tuần tự: **131 passed, 0 failed**. TypeScript và ESLint đều exit 0.
- Audit screen-reader labels tìm thấy sáu nút Q&A thiếu `accessibilityLabel`; đã thêm tên động cho toggle chữ, câu hỏi tham khảo/gợi ý, hỏi tiếp và nút đặt câu khác. `uiFlows.test.mjs` xác nhận các nhãn chính; kiểm tĩnh hiện tại: 17/17 Pressable trong `QaScreen` có role và label. Cả bộ 131 test, typecheck và lint pass sau sửa.
- Tại thời điểm snapshot này chưa tạo được APK mới cho accessibility fix: wrapper dừng do toolchain Java 17 chưa cấu hình. Trạng thái này được cập nhật ở phần Revalidation mới nhất phía trên; APK hiện tại đã build thành công với JDK 17.
- V1 catalogue validator hoàn tất: **34/34**, 418.23 giây, 5,043,834 byte; manifest SHA-256 `90747665D049CC3B4AF018672EF0935805F324236986D8F2047DC79B440113E9`. WER tự động cao nhất vẫn 23.1%, 18.9%, 17.6%; human listening chưa làm.
- Tại snapshot trước khi gateway được khởi động qua tool review, ADB không liệt kê thiết bị/emulator và Node gateway không spawn được Python worker (`spawn EPERM`). Trạng thái gateway sau đó đã được khôi phục cho synthetic smoke; app mic → STT → answer vẫn chưa kiểm được.

## Auto replay — 14/10/2026

- The active bundled track now loops automatically. Stop disables looping and resets the player; starting playback again enables it for the new active track.
- Verification: `npm test` **140/140**, typecheck, lint, Android release bundle and APK build pass. On the Android API 37 AVD, a 23-second story advanced from `00:22/00:23` to `00:04/00:23` still playing, then Stop returned it to Ready/00:23. Captures are listed in `agent_docs/evidence/voice/android-emulator/README.md`.
- APK: 121,234,260 bytes, SHA-256 `7B39F4A7E14CF9F80D26F207E6E6150C9F0A8E8DCD744A939A7ACCB9151AF5D5`.
- This verifies playback behavior in the emulator only; speaker/headphone routing and iOS are not tested.

## Revalidation — 14/10/2026

- Catalogue validator: **34/34** audio clips pass hash/text/node/revision, MP3 decode/format, duration and level checks; 418.23 seconds / 5,043,834 bytes. Local faster-whisper ran on all bundled clips. Highest WER: `qa-flowers-answer` 23.1%, `qa-cake-answer` 18.9%, `demo-01-caption` 17.6%. These synthetic-TTS transcripts are an automated content signal only; they do not prove or disprove pronunciation quality. Human listening remains open.
- Mobile checks before the latest bugfix: `npm test` **140/140**, `npm run typecheck`, `npm run lint`, `npm run check:dependencies`, and `npm run build:ios` all pass. The iOS command produced a JavaScript/Hermes export only, not an IPA or native iOS test.
- Gateway `/health` returned `ready`; `node tools/voice/gateway/smoke_test.mjs` passed on Node 24.14.1 / faster-whisper 1.2.1 with a 19.15-second local synthetic clip and invalid-format, duration, and silence guards.
- Expo Go iPhone happy path đã được người dùng xác nhận sau reload: meter và câu trả lời chạy trong một lượt thử. Chưa có transcript nguyên văn/server log để đối chiếu độc lập; các câu hỏi/chương khác, lỗi, audio route và iOS native vẫn pending. Hướng dẫn retest ở [VOICE_HANDOFF.md](VOICE_HANDOFF.md).

## iPhone recorder report and fixes — 14/10/2026

- The user supplied an iPhone screenshot showing `Đang thu · 00:02`, a visually empty audio meter, and an unmatched Q&A result. The actual recognized phrase and gateway response were hidden/not provided, so this does not identify whether the audio input was silent, ASR mistranscribed, or the exact matcher rejected the phrase.
- Meter review found `isMeteringEnabled: true`, but the UI mapped −60 dB to zero. The display now maps real dBFS from −80 dB to 0 dB; no animated or simulated waveform was added. A regression covers silence, quiet speech, louder values, missing data and invalid numbers.
- Unknown Q&A still hides the recognized text by default; a new explicit “Xem câu đã nhận dạng” control opens it for diagnosis. Exact matcher behavior is unchanged.
- Native iOS plugin now adds `NSAllowsLocalNetworking` and `NSLocalNetworkUsageDescription` only when the configured endpoint is a private IPv4 HTTP gateway. No broad arbitrary-load exception is added. Expo Go uses its own native Info.plist, so the plugin change does not prove that Expo Go will reach the local gateway.
- After these changes: `npm test` **143/143**, typecheck, lint, Expo dependency check, Android export and iOS export pass. iPhone retest is required to verify real metering, speech transcript, Q&A match and answer playback.

## iPhone consecutive-turn report — 14/10/2026

- User confirmed the first iPhone voice turn worked, but the second turn showed no meter and failed. The exact screenshot/transcript/native error was not available, so the cause is not independently reproduced on iPhone.
- Initial fix awaited the looping answer player's native seek before recorder preparation. The user then reported that the second turn still failed. Review found the seek is not needed to stop audio: the next Play replaces the track from its beginning. `stopAudioPlayer` now only disables looping and pauses, so microphone startup does not wait on a native seek callback.
- Regression: playback-stop test verifies loop-off → pause and no seek. Full `npm test` **144/144**, typecheck, lint, `git diff --check`, and `npm run build:ios` pass. The iOS export bundles successfully; it is not an IPA or device test.
- Metro is serving the fresh iOS bundle at `exp://192.168.100.36:8089`; `/status` is running and the current iOS bundle responds HTTP 200 (6,052,516 bytes). Gateway `/health` is ready at `192.168.100.36:8788`.
- Retest on iPhone is still required: after the first answer appears/loops, tap mic, ask **“Có chuyện xưa nào ở đây không?”**, then Gửi. This change addresses a likely iOS audio-session race but is not yet confirmed on the physical device.
- A Metro restart initially omitted the gateway environment variable; that left the preview unable to transcribe. It was restarted with `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL=http://192.168.100.36:8788`; current iOS and Android bundles both return HTTP 200 and contain the gateway URL plus the stop/seek fix.
- Expo Go on Android API 37 loaded the current bundle. After playing the bundled answer, recording started with a visible nonzero meter; Cancel then start again showed `00:02` and the meter again. The second recording was canceled without submission; no audio was sent and no recent JS fatal/load error appeared. This verifies Android recorder re-entry after cancel, not speech recognition or a post-transcription turn.
- A UI regression now sends two transcript callbacks in sequence and verifies the second question **“Có chuyện xưa nào ở đây không?”** selects and plays the exact `qa-05` answer track. It does not replace the physical iPhone voice test.
- Current reruns: `tools/voice/.venv/Scripts/python.exe tools/voice/validate_catalogue_v1.py` exited 0 after checking all **34 clips** (418.23 seconds / 5,043,834 bytes); local ASR highest WER remains `qa-flowers-answer` 23.1%, `qa-cake-answer` 18.9%, and `demo-01-caption` 17.6%. `node tools/voice/gateway/smoke_test.mjs` exited 0 on Node 24.14.1/faster-whisper 1.2.1 for the local synthetic clip and invalid-format/duration/silence guards. Neither result replaces human listening or phone speech testing.

## iPhone second-turn follow-up — 14/10/2026

- After the first awaited-seek patch, the user reported that the second voice turn still failed and the meter was absent. This narrows the defect to the physical iPhone flow, but no stage screenshot, transcript, or native error has been captured.
- Removed the unnecessary native seek from the stop path. Stopping now pauses immediately and leaves the track inactive; the next playback loads from the beginning. This avoids gating microphone preparation on a seek callback and keeps replay behavior intact.
- Regression, full suite **144/144**, typecheck, lint, iOS JS export and live Expo Go bundle fetch pass. Metro `exp://192.168.100.36:8089` and gateway `http://192.168.100.36:8788/health` are ready.
- Physical iPhone retest is still required to confirm that the second recording starts, the live meter moves, and the follow-up reaches the matching answer.

## UI route regression across all chapters — 14/10/2026

- Expanded the Q&A screen regression to send each of the 21 canonical questions and then the first linked follow-up for that entry. All 42 transcript callbacks select the exact answer ID/text and chapter audio track; `node --test tests/uiFlows.test.mjs` passes 23/23 and full `npm test` passes 145/145. Typecheck and lint pass.
- This verifies screen-level routing with a controlled transcript callback. It does not prove ASR accuracy, native recording, or a real microphone-to-audio conversation in any chapter; GV5 remains open until device tests cover those paths.

## V6 question-versus-command screen regression — 14/10/2026

- Added a screen-flow test proving “Chương kế là gì?” and “Điểm kế tiếp là điểm nào?” stay on the current chapter, while the explicit “Mở chương kế” command selects the next available chapter.
- `node --test tests/uiFlows.test.mjs`: 24/24; full mobile suite: 146/146; typecheck and lint pass. This proves parser-to-screen behavior with supplied transcript text, not spoken intent recognition; GV6 remains open for device speech checks.

## iPhone second-turn recorder reinitialization — 14/10/2026

- Latest user report: first iPhone voice turn works, but the second fails without the live meter. The issue has not yet been reproduced or independently observed on the physical phone.
- Expo Audio's iOS source replaces its underlying `AVAudioRecorder` when `prepareToRecordAsync` receives options. The app now passes the complete high-quality recording options, including `isMeteringEnabled: true`, on every turn so a stopped recorder is not reused after its submitted file is deleted.
- Added a regression that runs two successful recorder preparations and checks both receive metering-enabled options. Full suite **147/147**, typecheck, lint, `git diff --check`, and `npm run build:ios` pass. Latest Metro iOS bundle at `exp://192.168.100.36:8089` returns HTTP 200 and includes the updated options; LAN gateway health is HTTP 200.
- This is a targeted code fix, not proof that the iPhone issue is resolved. Reload Expo Go and test a second recording after the first answer: the meter should move and “Có chuyện xưa nào ở đây không?” should reach the linked answer. If it still fails, capture the visible error/transcript text; do not send audio. GV3/GV5/GV7 remain open.
