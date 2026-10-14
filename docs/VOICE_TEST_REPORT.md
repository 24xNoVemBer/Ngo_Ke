# Voice V0–V7 — Báo cáo kiểm thử

## Kiểm chứng mới nhất — 14/10/2026

- Người dùng xác nhận lượt voice thứ hai liên tiếp trên iPhone có meter chạy, transcript, câu trả lời đúng và phát tiếng. Lỗi meter không tái hiện trong retest này; không có raw audio/server trace để xác minh độc lập.
- APK Android mới nhất sau V6 đã build và kiểm bundle/Hermes: 121,246,156 byte, SHA-256 `301F0654052A537324A08240F02C1DA223D99EBACCD841A573A20C3375B0EE36`; có 34 MP3 cùng parser V6 mới, nhưng chưa cài/chạy trên AVD. Bản trước `6D669446...73FBE` đã cài/mở trên AVD API 37 và đi qua Landing → Home → Ngõ Phất Lộc → Q&A điểm 01; AVD `-no-audio` nên không xác nhận phát/thu tiếng.
- Mic start/Hủy thủ công và 20 vòng AppOps thuộc APK trước đó `0F43437B...53F9`, không phải APK hiện tại. 20/20 lượt bắt đầu/dừng; không gửi audio. PSS 168,357 KB trước, 182,101 KB sau run, 171,789 KB sau 12 giây idle; không phải leak proof.
- Re-run: `npm test` 164/164; typecheck, lint, Expo dependency check và `git diff --check` pass. Regression V6 mới kiểm câu hỏi khi Plan mở và loại slot cũ khi transcript mơ hồ; UI cũng xác nhận lỗi bất đồng bộ từ Expo Audio hiện thông báo fallback accessibility alert, không lộ native error/path.
- Gateway smoke live đạt bằng clip TTS tổng hợp local 19,15 giây trên Node 24.14.1/faster-whisper 1.2.1: abort/retry, quota, invalid format, duration và silence guards pass; không dùng audio cá nhân.
- Latest iOS/Android JS exports sau V6 fix đều thành công; metadata mỗi platform có 34/34 MP3 và không thiếu file. Metro iOS bundle `:8081` qua LAN trả HTTP 200/6,063,168 ký tự, có gateway và playback error handling, không có copy kết nối cũ. Gateway ready; người dùng để sau việc reload/test `exp://192.168.100.36:8081` trên iPhone.
- Còn mở: sáu chương/21 Q&A bằng speech trên iPhone, failure paths, audio interruptions/routes, screen reader thật, nghe QC 34 clip và performance.

## Snapshot trước lần Metro timeout mới nhất — 14/10/2026 (đã supersede)

- Expo Audio 57.0.5 iOS gọi `deactivateSession()` sau pause (trễ 100 ms) nếu player không bật `keepAudioSessionActive`; delayed task không kiểm tra recorder. Player voice đã bật tùy chọn đó. `QaScreen` có generation guard để callback auto-play câu trả lời cũ không chạy chồng lượt mic mới. Cả hai là race đã khóa ở source, chưa chứng minh nguyên nhân iPhone.
- Recheck after the accessibility status update: `npm test` **162/162**, typecheck, lint, Expo dependency check and `git diff --check` pass. Current iOS and Android JS exports pass (1,073 / 1,068 modules; `index-0476f928e945a4013b39391ae68ad762.js` / `index-95b2dbb411a1c5b752c11c064bbce29b.js`) and contain the gateway URL. These are Expo JS exports, not native IPA/APK builds.
- The later Android release APK is 121,245,884 bytes, SHA-256 `0F43437B6B29D5AF9A7C750E746D1FE731F45A1808778DD6AC8925972FDF53F9`; see the top recheck for its recorder start/cancel evidence. Earlier APK checks below remain historical snapshots.
- Gateway `http://192.168.100.36:8788/health` trả `ready`. User confirms the second consecutive iPhone voice turn had a moving meter, displayed the transcript and correct answer, and played audible answer audio. This is one user-reported physical-device STT→Q&A→playback success; no raw audio/log was captured. Keep broader GV3/GV5/GV7 checks open, including six-chapter coverage, failures, accessibility and performance.
- Re-run hiện tại: V1 validator kiểm 34/34 clip, tổng 7.0 phút/5.04 MB; WER cao nhất giữ nguyên ở `qa-flowers-answer` 23.1%, `qa-cake-answer` 18.9%, `demo-01-caption` 17.6%. Chưa clip nào được đánh dấu nghe tay.
- `node tools/voice/gateway/smoke_test.mjs` pass bằng clip TTS tổng hợp cục bộ 19.15 giây. Bài test đợi 1.5 giây sau khi gửi, hủy POST và cần thấy server log `REQUEST_CANCELLED` (xác nhận request đã vào nhánh ASR), rồi gửi lượt tiếp theo và kiểm HTTP 200/`turnId` mới; gửi tới ngưỡng 12 request/phút và xác nhận request kế tiếp bị `429 RATE_LIMITED`; invalid-format/AUDIO_TOO_LONG/AUDIO_TOO_SHORT/NO_SPEECH cũng pass. Không dùng ghi âm người dùng. Worker Python vẫn hoàn tất inference đã bắt đầu trước khi dọn file; bài test không khẳng định compute bị dừng tức thời.
- Current host probe: Metro `:8089` times out. Metro `:8081` serves the latest iOS bundle with HTTP 200 (6,062,657 characters); it includes the gateway URL and the new accessibility stage announcement. Gateway `/health` is ready. Use `exp://192.168.100.36:8081` for another Expo Go check. The user's successful `:8089` device report remains valid for that test time, but is not tied to the currently inspected `:8081` bundle.
- Voice dock now announces preparing, recording, ready, saving and transcribing transitions to VoiceOver/TalkBack. The recording timer is excluded from the effect dependency, and a UI regression confirms timer ticks do not repeat announcements. Actual screen-reader operation remains unverified on hardware.
- Android export first failed with `Zone Allocation failed - process out of memory` while an unresponsive old Metro `:8087` was consuming memory. Stopped only that stale process (kept `:8081` and `:8089` running); the Android export then completed. No app source was changed for this resource issue.

## Lượt voice thứ hai trên iPhone mất meter — cập nhật 14/10/2026

- Người dùng xác nhận lượt đầu có trả lời, lượt hai mất meter và lỗi. Chưa có native log hoặc giá trị meter; nguyên nhân chưa được tái hiện trên iPhone.
- Code hiện đã chờ native player dừng trước khi bật recorder và có generation guard hủy callback auto-play cũ khi bắt đầu lượt mic mới. Đây là các race đã được khóa trong code, chưa chứng minh nguyên nhân vật lý của lỗi iPhone.
- Trên APK release hiện tại (`com.valentino241.ngokedemo`, Android API 37), mình phát lời kể rồi thu, Hủy, phát lại rồi thu lần hai. Cả hai lượt vào trạng thái `Đang thu` và hiện meter; không gửi clip. Ảnh: `android37-release-player-before-recorder-2026-10-14.png`, `android37-release-player-to-mic-first-active-2026-10-14.png`, `android37-release-player-to-mic-second-active-2026-10-14.png` trong `agent_docs/evidence/voice/android-emulator/`. Đây chỉ là kiểm tra recorder re-entry trên Android, chưa phải iPhone hoặc STT proof.
- V7 Android stress: chạy **20 vòng start/cancel** liên tiếp. Mỗi vòng AppOps xác nhận `RECORD_AUDIO` đang chạy trước khi Hủy và đã dừng sau Hủy; cuối lượt dock idle, không còn AppOps active, `fatal=0`. PSS 167,959 KB lúc đầu, 176,922 KB sau 10 vòng, 170,762 KB trước 10 vòng cuối và 176,475 KB khi kết thúc (dao động, không tăng đều; đây không phải leak proof). Không gửi clip. Kết quả chỉ áp dụng AVD API 37.
- Full `npm test` gần nhất 156/156; typecheck/lint và iOS JS export pass (bundle `index-41c76f4c413cbc235bdc07e89fb7df20.hbc`). Không có thay đổi code trong lượt kiểm tra này.
- Metro `:8089` hiện trả `/status` running tại `exp://192.168.100.36:8089`; gateway `/health` trả `ready`. Metro đang chạy không có `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL`, nên bundle này chỉ kiểm được thu âm/meter/player, không gửi được STT. iPhone chưa được retest. GV3/GV5/GV7 vẫn mở.
- Rebuild Android release APK từ source hiện tại và cài trên API 37 AVD: 377 tasks thành công, APK 121,244,960 byte, SHA-256 `AC05A7E98F4A42B51021D2FFF554091764766FB5033ADABD901D5AE5BC4D7831`. Player hiện icon Pause ở `00:00`; chạm mic dừng player, recorder vào `Đang thu · 00:01` với meter thật, Hủy về trạng thái idle. Không gửi recording; APK không cấu hình gateway nên chưa test STT/Q&A. Ảnh và giới hạn: `agent_docs/evidence/voice/android-emulator/README.md`.
- Nhánh quyền mic trên cùng package: sau khi revoke, Android prompt hiện; chọn “Don’t allow” thì app báo chưa có quyền dùng mic và đưa lối Gõ. Cấp lại quyền trong emulator rồi bấm Thử lại làm recorder hoạt động và Hủy về idle. Đây chỉ là kiểm tra Android API 37, không phải iOS; không gửi audio.
- Rerun V1 validator ngày 14/10: **34/34** clip, 7.0 phút, 5.04 MB; manifest SHA-256 `90747665D049CC3B4AF018672EF0935805F324236986D8F2047DC79B440113E9`. ASR WER cao nhất: `qa-flowers-answer` 23.1%, `qa-cake-answer` 18.9%, `demo-01-caption` 17.6%; đây là sàng lọc máy, không phải đánh giá phát âm bằng tai. Human listening/QC vẫn pending. Báo cáo đầy đủ được sinh tại `tools/voice/.cache/v1-qc/report.json` (cache local, không phải artifact bàn giao).
- Kiểm tra hiện tại: gateway trả `ready`; Metro `:8089` trả `packager-status:running` nhưng app config URL STT đang rỗng. Dùng preview này chỉ cho kiểm meter/player, không dùng để kết luận STT. Không commit/push theo chỉ thị trong goal hiện tại.
- Synthetic gateway smoke rerun cùng ngày: clip tổng hợp local 19.15 giây được nhận; transcript/metadata contract, guard sai định dạng, giới hạn thời lượng và silence đều pass. Listener đang bind private IP `192.168.100.36:8788`; không dùng ghi âm cá nhân.

## Revalidation sau lần ước tính — 14/10/2026

- Re-run trên working tree hiện tại: `npm test` **159/159**, `npm run typecheck`, `npm run lint` và `npx expo install --check` đều pass.
- Gateway smoke test thật qua faster-whisper 1.2.1 nhận clip TTS tiếng Việt tổng hợp 19.15 giây và trả transcript; kiểm abort request đang xử lý rồi retry với turnId mới, 429 quota, invalid format, duration và silence đều pass.
- Catalogue validator: **34/34** clip, tổng 7.0 phút / 5.04 MB; text/hash/node/revision, định dạng MP3 48 kHz mono, duration và mức âm thanh đạt. ASR WER cao nhất vẫn ở `qa-flowers-answer` 23.1%; chưa có nghe duyệt bằng người thật.
- APK dùng trong snapshot cũ này là 121,245,400 byte, SHA-256 `33A094762839B03904BDD9872C08EB1046B37E14C87C1091853B21535BBE6295`; kiểm trực tiếp `assets/index.android.bundle` xác nhận gateway URL được nhúng. Snapshot này không đại diện APK mới nhất và không chứng minh Android đã gửi lời nói hoặc iPhone đã tải bundle.
- `npm run build:ios -- --no-bytecode` vừa xuất 1,073 modules thành công; bundle 1,608,216 ký tự tại `mobile/dist/ios/_expo/static/js/ios/index-51a74f280fc4c08fed13fd3e5186e001.js` có gateway URL. Đây là static JS export, không phải IPA và không thay Metro/Expo Go.
- Gateway `/health` trả `ready`; Metro `/status` phản hồi nhưng lấy iOS bundle timeout hai lần, ở 90 và 210 giây. Metro restart có cấu hình gateway bị tool review từ chối nên không được thử đường vòng. iPhone turn-two/STT→Q&A/audio, QC nghe 34 file, iOS routes/accessibility/performance vẫn pending.

## Snapshot trước khi xác nhận pause native — 14/10/2026 (đã supersede)

- Người dùng xác nhận lượt đầu có trả lời, nhưng lượt hai mất meter và lỗi. Chưa có log native, giá trị meter hoặc transcript của lượt lỗi nên nguyên nhân chưa được chứng minh.
- Recorder startup hiện chờ tối đa 1 giây để xác nhận native `isRecording`; nếu bị hủy thì dừng recorder, nếu không khởi động thì dọn và báo lỗi. Một câu trả lời phát lỗi thời cũng bị hủy sau khi audio-mode await nếu mic lượt mới đã bắt đầu. Đây là guard cho start trễ và một race hợp lý, chưa chứng minh nguyên nhân người dùng gặp; guard chưa thể sửa trường hợp iOS báo đang thu nhưng không trả mẫu tiếng.
- `voiceRecorderPreparation` 8/8, focused playback/recorder tests 12/12; toàn bộ test 152/152, typecheck/lint và iOS + Android JS exports đạt. Metro `exp://192.168.100.36:8090` cùng gateway `:8788` đang sẵn sàng; iOS Metro bundle HTTP 200 (6,064,803 bytes) có cả hai guard.
- Chưa có retest iPhone sau guard. Reload Expo Go, chạy xong câu đầu, chạm mic lần nữa và hỏi “Có chuyện xưa nào ở đây không?”. Nếu hiện “Đang thu” mà meter rỗng, ghi rõ trạng thái đó; nếu STT trả unknown, mở **Xem câu đã nhận dạng** và gửi lại chữ. GV3/GV5/GV7 vẫn mở.

## Retest sau lỗi meter/transcript và kiểm tra preview — 14/10/2026

- Meter dùng thang dBFS xuống −80 dB; transcript không khớp vẫn ẩn mặc định nhưng có nút **Xem câu đã nhận dạng**. Plugin iOS chỉ thêm policy local-network cho gateway HTTP private; không bật ATS toàn cục.
- `npm test` hiện 148/148; typecheck, lint và iOS JS export pass. Gateway `/health` trả `ready` (Node 24.14.1, faster-whisper 1.2.1, model `Systran/faster-whisper-small`).
- Metro `:8089` là preview cũ, đã được thay bằng `:8090` sau khi endpoint cũ bị treo; xem mục mới nhất phía trên để mở bundle hiện tại. Người dùng từng xác nhận lượt đầu có meter và câu trả lời; lượt hai sau đó mất meter như ghi ở mục trên.
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
| V3 recorder | Permission-on-tap, cấp lần đầu, safety guard 19.5s, Hủy và Back kiểm trên emulator; user confirms live meter on the second iPhone turn | Emulator giữ thời lượng thật `00:19`, chờ Gửi/Hủy; Hủy về idle; Back dừng recorder. Gateway hard limit vẫn 20s. iPhone result is user-reported; no native trace. |
| V4 gateway/STT | Local faster-whisper nhận dạng clip tổng hợp; người dùng báo iPhone hiển thị transcript ở lượt hai | Smoke 19.15s đạt; PCM silence 21s trả 400 `AUDIO_TOO_LONG`; invalid format trả 415. User-reported app-to-STT path is one success; no raw audio/log or independent trace. |
| V5 fixed Q&A | Matcher and all 21 answers have unit tests; người dùng xác nhận lượt iPhone thứ hai hiện đúng answer và phát tiếng | Chạm chip không tự phát loa; UI tests map transcript questions to chapter-specific audio. Physical-device coverage remains one reported chapter/follow-up. |
| V6 actions | Parser/actions/UI logic đã test | Câu hỏi khác lệnh; ambiguous actions yêu cầu tap; QR/GPS cần CTA. Nhận dạng cách nói trên thiết bị còn pending. |
| V7 nghiệm thu | Android release/AVD checks and current iOS/Android JS exports pass; user reports one successful two-turn iPhone voice flow | Physical iPhone success is user-reported at `:8089`; current source bundle at `:8081` has not been confirmed on phone. Full six-chapter, failure paths, screen reader, audio routes, 34-clip listening QC and performance remain open; GV7 remains open. |

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

## iPhone turn-two delayed audio-session deactivation — 14/10/2026

- Source review of the installed Expo Audio 57.0.5 iOS module found that player pause schedules `AVAudioSession` deactivation after 100 ms when `keepAudioSessionActive` is false. The delayed deactivation only checks whether a player is still active, not whether a recorder has started. This matches the user's sequence: first voice answer plays, then the next mic turn quickly starts and loses input/meter.
- The voice player now sets `keepAudioSessionActive: true`, preventing the delayed pause/finish deactivation during the player-to-recorder handoff. This is a source-backed likely root cause, not yet a confirmed iPhone fix.
- After the change, `npm test` passed **158/158**, `npm run typecheck`, `npm run lint`, and `npm run build:ios` passed. The latter is JS/Hermes export only. Metro `:8089/status` returns HTTP 200 but the iOS bundle request times out; gateway `/health` at `192.168.100.36:8788` returns HTTP 200. No physical iPhone retest was performed; GV3/GV5/GV7 remain open.

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

## iPhone second-turn native start check — 14/10/2026

- Expo Audio's iOS `record()` path does not check the Boolean result from `AVAudioRecorder.record()`. The app previously advanced to its recording UI even if the native recorder had not actually started. It now verifies `recorder.isRecording` before showing the active recording state; a failed start restores playback mode and offers a retry instead of sending a silent clip.
- Added a regression for native start failure. `npm test`, typecheck, and lint pass. The new iOS Metro bundle returns HTTP 200 (6,063,401 bytes) and contains the start guard; the local faster-whisper gateway health check is ready.
- Metro on port 8089 was listening but not responding. A fresh LAN preview is now running at `exp://192.168.100.36:8090`; open that URL in Expo Go to load this change.
- This guard makes a native start failure visible; it does not establish that this was the physical iPhone's root cause. Repeat the first-answer → second-mic test on iPhone. GV3/GV5/GV7 remain open until that and the other device checks pass.

## Await native player stop before the next iPhone recording — 14/10/2026

- The previous `stopAudioPlayer()` only dispatched `pause()` and returned synchronously, so awaiting the wrapper did not wait for the native player. When an answer was looping, the next microphone turn could begin its audio-session switch while the player command was still in flight.
- Playback stop now disables looping, pauses, then awaits `seekTo(0)`. The mic-start path already awaits this stop before recorder preparation. A deferred-seek regression confirms the stop promise stays pending until the native seek resolves.
- Focused playback tests: 4/4; full mobile suite: 152/152; typecheck, lint, `git diff --check`, and iOS JavaScript export pass. Expo Go LAN bundle `exp://192.168.100.36:8090` returns HTTP 200 (6,065,043 bytes) and contains the native rewind.
- Physical iPhone verification remains pending. Reload the LAN preview, complete one voice answer, start a second recording, and verify the meter moves and the follow-up answer arrives. This code-level race is a likely cause, not a confirmed device diagnosis; GV3/GV5/GV7 remain open.

## Follow-up after the iPhone second-turn failure remained — 14/10/2026

- The awaited-seek stop path did not resolve the user-reported second-turn failure and could leave mic startup waiting for an iOS seek callback. Stopping now disables looping and pauses immediately without seeking; explicit replay still rewinds before playing. The regression makes `seekTo` fail if the stop helper calls it.
- Verification: `npm test` 152/152; typecheck and lint pass; iOS JS export completed (1073 modules). Android `:app:assembleRelease` succeeded (377 tasks; 30 executed, 347 up-to-date); APK 121,243,192 bytes, SHA-256 `C21ACE29D356F779A16219CCA8AEE75527B805B983F90B8B13A3C15A0751CA0C`, installed/launched on API 37 AVD. No emulator speech was submitted.
- Gateway `http://192.168.100.36:8788/health` is ready. Old Metro process `:8087` reports status but its iOS bundle request timed out at 60 seconds; `:8089` and `:8090` are stopped. A local attempt to restart Metro was rejected by tool policy, so there is no verified live Expo Go bundle yet. Run the command in `docs/VOICE_HANDOFF.md` and reload Expo Go to test on iPhone.
- The physical iPhone must still confirm turn 2 meter, transcript and answer. No iOS native build, real microphone log or human listening was performed; GV3/GV5/GV7 remain open.

## Second-turn iPhone report and audio-session settle guard — 14/10/2026

- The user reports that voice turn one works, but turn two fails and the live meter is absent. This remains an iPhone-only report; the failure has not been independently captured from native logs.
- Expo Audio 57.0.5 has a 100 ms delayed iOS session-deactivation path after player pause when the host does not honor `keepAudioSessionActive`. Playback stop now waits 125 ms after an active player has paused before handing focus to the recorder. This lets a pending deactivation finish before recorder preparation reactivates audio; it supplements the existing keep-session flag.
- Added a regression that verifies the stop promise stays pending through the delayed deactivation window. Verification: `npm test` **159/159**, typecheck, lint, and iOS JavaScript export (1073 modules) pass. The latest Metro iOS bundle at `exp://192.168.100.36:8089` returns HTTP 200 (6,062,119 characters) and includes the settle guard, recorder metering options, keep-session flag, and playback-intent guard.
- The current Metro bundle does not include the LAN gateway URL `192.168.100.36:8788`; it can test playback/mic/meter, but not speech recognition or answer delivery. Gateway `/health` is HTTP 200. Android AVD checks do not verify iPhone routing. Physical iPhone retest remains required before claiming the issue fixed; GV3/GV5/GV7 remain open.

## Android release rebuild and “not connected” preview diagnosis — 14/10/2026

- Rebuilt the Android release APK from the source containing the 125 ms audio-session settle guard: Gradle `:app:assembleRelease` succeeded (377 tasks; 29 executed, 348 up-to-date). APK size 121,245,316 bytes; SHA-256 `F43B2BAD13E1C938F2B07D0AA4F3002B6D2695BE25E1C13275DB86CAE891138B`.
- Installed and launched package `com.valentino241.ngokedemo` on the API 37 AVD and granted `RECORD_AUDIO`. This is install/launch evidence only; no speech was submitted and it is not iPhone verification.
- On the current preview, gateway `http://192.168.100.36:8788/health` returns `ready`, while Metro `:8089` serves a bundle without that gateway URL. The screenshot’s “Chưa kết nối máy nhận giọng nói” is therefore explained by missing Expo bundle configuration; the current bundle cannot send STT requests. Restart Metro with `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL=http://192.168.100.36:8788` and reload Expo Go. Keep phone, Metro, and gateway on the same trusted Wi-Fi.
- Physical iPhone second-turn, real mic→gateway→Q&A/audio E2E and other GV3/GV5/GV7 checks remain open.

## Current preview recheck and actionable configuration error — 14/10/2026

- `VOICE_NOT_CONFIGURED` now tells the user that the preview lacks voice-server configuration and to reopen Expo Go using the setup instructions; this avoids presenting a missing URL as a generic network outage.
- Current checks: `npm test` 159/159; typecheck, lint, and `git diff --check` pass. `npm run build:ios` exports the current JS bundle (`index-8c517405923ea701bf26f9964215f9b9.hbc`, 1073 modules); this is not an IPA or device test. Metro reported a cache deserialization warning and recovered with a full crawl.
- Current Metro `:8089/status` responds, but fetching the iOS bundle timed out after 90 seconds. The last successfully inspected bundle lacked `192.168.100.36:8788`; the current source copy cannot be assumed to have reached Expo Go. Gateway `/health` is still `ready`.
- Metro restart with the gateway environment variable was rejected by tool review and was not bypassed. Physical iPhone retest, real mic→STT→Q&A/audio, and GV3/GV5/GV7 hardware checks remain pending.

## Recheck local gateway config, catalogue, and synthetic STT — 14/10/2026

- Added `mobile/.env.local` (Git-ignored) with the current trusted-LAN gateway URL `http://192.168.100.36:8788`. Both `npm run build:ios -- --no-bytecode` and `npm run build:android -- --no-bytecode` loaded `.env.local`; the plain JS bundles contained the URL (1073 and 1068 modules). This verifies export-time config injection only, not a native APK/IPA or live Metro restart.
- Rechecked live Metro: `:8089/status` is `running`; the current iOS bundle responds HTTP 200 (6,062,157 characters) but still does **not** contain the URL. Metro must restart and Expo Go must reload before phone STT can work.
- Rechecked the live gateway: `/health` is `ready` on faster-whisper 1.2.1. A locally generated, non-personal 19.15-second Vietnamese TTS WAV returned HTTP 200 with nonempty transcript and matching `turnId`, locale, mode, node ID, and dataset revision. No recorded personal speech was sent.
- Re-ran the full catalogue validator using `tools/voice/.venv`: **34/34** clips pass source/text/node/revision/hash, MP3 decode/48 kHz/mono, duration and level checks. Manifest SHA-256: `90747665D049CC3B4AF018672EF0935805F324236986D8F2047DC79B440113E9`; 7.0 minutes / 5.04 MB. Local synthetic ASR's highest WER is 23.1% (`qa-flowers-answer`), followed by 18.9% (`qa-cake-answer`); human listening is still required.
- Current mobile checks: `npm test` **159/159**, `npm run typecheck`, `npm run lint`, `npm run check:dependencies`, and `git diff --check` pass. These do not close phone-microphone E2E, iPhone audio/session routes, or GV3/GV5/GV7 hardware gates.

## iPhone follow-up retest — 14/10/2026

- Expo Go preview used by the user: `exp://192.168.100.36:8089`. After reloading, the user confirms the second consecutive voice turn displayed a transcript and the correct answer. This is user-reported real-device evidence for a two-turn mic→STT→Q&A path.
- The user also confirms the live meter moved on that second turn. The exact transcript/node and a native/server trace were not captured, so this remains user-reported happy-path evidence without an independent trace.
- Rechecked from `mobile/`: `npm test` **161/161**, typecheck, lint, and Expo dependency check pass. The added matcher/UI-flow regressions cover all 21 canonical Q&A questions across six nodes and reject cross-chapter matches.
- A fresh host-side request for the `:8089` manifest timed out during this check, so the served bundle configuration could not be independently reconciled with the successful phone report. This does not override the user's device result.
- Still pending: human listening QC for all 34 clips, broader iPhone failure/audio-route/accessibility/performance checks, six-chapter spoken coverage, and independent request/device traces. Voice V7/full completion remains open.
