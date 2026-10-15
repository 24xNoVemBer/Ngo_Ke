# Bàn giao Voice V0–V7 — Ngõ Kể

## Latest verified build — revision 8b318b — 15/10/2026

- Expo Go preview: `exp://192.168.100.36:8081`. Latest host recheck returned HTTP 200 for Metro, the iOS manifest and its launch bundle; the bundle is 5,523,970 bytes and contains the current revision, `http://192.168.100.36:8788`, the “Phát lời kể” hint and `MIC_PERMISSION_BLOCKED`. A fresh check reconfirmed Metro `:8081/status` and gateway `:8788/health` are HTTP 200/ready on `large-v3-cuda` / faster-whisper 1.2.1; ADB lists only `emulator-5554`. Host delivery is verified; the user deferred reloading this bundle on iPhone.
- Current source/catalogue/manifest revision: `8b318b4e9955e3b7affe72cb21ea08cf8123a616eeab2eb1420ab105c7b65e6b`; manifest SHA-256 `34925f5d005fa7fb684c4f8fac19992865b581c6eeaa6bde0e9183431c9be05a`. Automated V1 integrity is 34/34; 7.0 minutes / 5.04 MB. Human listening is not done.
- Android SDK 57 release APK `com.valentino241.ngokedemo`: 121,249,588 bytes, SHA-256 `2f15c3c0992434a42b13cb4b09c363826542ddfa215eb8f3e9d5db03e22a1e0d`; installed base hash matches, revision is embedded, and all 34 MP3 hashes match source. Native typed chapter-4 alias/follow-up, chapter-1 answer/player/text, and two consecutive recorder start/cancel cycles passed as UI/AppOps state on API 37. Evidence: [`android37-native-release-final-2f15c3-2026-10-15`](../agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/README.md). The AVD has no usable audio signal.
- Current build recorder stress: AppOps started/stopped 20/20 cycles, PID unchanged; one AVD PSS sample rose 12,387 KB and is not a hardware memory/performance verdict.
- A later host-audio AVD probe opened `AudioRecord` but did not receive the local synthetic signal; the clip was discarded without upload and the emulator's original `-no-audio` configuration was restored. See [`android37-host-audio-route-attempt-2026-10-15`](../agent_docs/evidence/voice/android37-host-audio-route-attempt-2026-10-15/README.md); this does not replace phone mic/STT verification.
- Fresh mobile suite is 171/171; typecheck, lint, Expo dependency check, catalogue validator, gateway smoke and iOS export pass. Gateway smoke includes a tracked synthetic AAC/M4A fixture sent as `audio/mp4` and checks its transcript/context response, alongside WAV and failure-path cases. Regression coverage also includes normalized question/alias collisions and native player auto-repeat for manually started story playback. Current HBC export `index-34b34ad94926be47472ea9cee2796235.hbc` SHA-256: `d285830810720d64dbd0f5c0579bc6f0cb8b4c26185853795f2790b8333dc477` (Expo export, not IPA/device proof).
- Current synthetic 8-question ASR→matcher run: 5/8 exact, 0 wrong, 3 ambiguous unknown. Do not treat the separate cached 21/21 matcher replay as ASR accuracy; keep strict matching.
- **Pending:** human listening of all 34 clips; iPhone reload/current-bundle speech checks in all six chapters; physical audio paths/interruption and mic failure checks; screen-reader and hardware performance review. The previous iPhone two-turn success was reported on `:8089`, not this current `:8081` bundle.

## Earlier Q&A transcript snapshot — revision 5a82b1 (superseded) — 15/10/2026

- Dataset revision: `5a82b1d4fa223b2170fd9fa2c761a01479b4e3e159a81a6de72f65566a8d2568`. Four exact large-v3 transcript aliases were added; cached small/large-v3 transcript sets now replay through the strict matcher as 21/21 expected IDs with zero wrong/unknown. These are synthetic saved transcripts, not human speech accuracy.
- Current Android API 37 APK: `mobile/android/app/build/outputs/apk/release/app-release.apk`, 121,249,288 bytes, SHA-256 `A44C99FF04125D5C24DD45ADFEA8C74EB8675C53EA00B4C2B45CEFEF95538BBC`; installed base hash matches. Typed chapter-4 alias test and evidence are in `../agent_docs/evidence/voice/android37-native-release-asr-alias-2026-10-15/README.md`.
- The 34-clip catalogue validator passes with no audio changes; current manifest file SHA-256 is `e59696011be1501097b08f11091a903f8b9a88d30d2914fcc255d1c28db774ba`. Latest iOS export: `mobile/dist/ios/_expo/static/js/ios/index-0462bc7bf16834cfd89e7154fb994480.hbc`, SHA-256 `35D9DBA66BAC6ECD1D429DE99CC75019524740685C345943036B7D8AA0E07108`.
- Current Expo Go URL is `exp://192.168.100.36:8081`. LAN manifest and bundle return HTTP 200; bundle contains the new revision and alias. The iPhone has not reloaded this bundle yet. User-reported two-turn success was on `:8089`.
- Automated checks: 170/170 tests, typecheck, lint, Expo dependency check, catalogue validator and local synthetic gateway smoke pass. Human listening QC, current-bundle iPhone spoken six-chapter test, physical audio/accessibility/performance checks remain open; AVD has no usable audio.

## Previous preview snapshot before Q&A alias update — 15/10/2026

- Expo Go URL: `exp://192.168.100.36:8081`. Manifest lấy trực tiếp qua LAN có `hostUri`/debugger host `192.168.100.36:8081`; bundle ấm trả HTTP 200 trong 5.25 giây, 5,530,710 bytes, có revision hiện tại, gateway URL `http://192.168.100.36:8788`, V6 action phrases và dock hint, không chứa copy kết nối cũ.
- Android release before the Q&A alias update: 121,248,988 bytes, SHA-256 `F6CD6178BD99D303E2C714963B3F414314D7DE9B883098976648DA9A2CF20B49`; installed on API 37 AVD with matching hash. Native UI/player smoke and its limits are in `../agent_docs/evidence/voice/android37-native-release-v6-negation-2026-10-15/README.md`. The APK includes all 34 source-matching MP3s.
- iOS JavaScript export sau parser fix thành công: `mobile/dist/ios/_expo/static/js/ios/index-e44b07b146d3b8e5f8490498dfdad2b4.hbc` (SHA-256 `DB6FE8BE6FFA17E4B4B4E596440B84B34A89164DBAA429E1859037522824175F`). Đây chưa phải kiểm thử iPhone.
- Voice gateway hiện chạy trên LAN; `/health` trả `ready` với faster-whisper 1.2.1, profile `large-v3-cuda`, CUDA float16. Nếu process dừng, dùng mục “Khởi động lại gateway nếu tiến trình dừng” bên dưới; để khôi phục profile GPU cần đặt `NGOKE_VOICE_ASR_PROFILE=large-v3-cuda`.
- Các kiểm tra host hiện đạt: 170 tests, typecheck, lint, Expo dependency check, catalogue 34/34, gateway smoke và synthetic helper→gateway→matcher 21/21 sau alias chính xác. iPhone chưa reload URL mới theo yêu cầu “để sau”; kết quả host chưa chứng minh bản trên iPhone.
- Bằng chứng Android API 37 AVD mới nhất và giới hạn no-audio: `../agent_docs/evidence/voice/android37-native-release-current-2026-10-15/README.md`.

## AVD V6 snapshot — superseded by revision 8b318b above — 15/10/2026

- Current Expo SDK 57 Android release APK: `com.valentino241.ngokedemo`, version `0.1.0`, 121,248,988 bytes, SHA-256 `F6CD6178BD99D303E2C714963B3F414314D7DE9B883098976648DA9A2CF20B49`. It was freshly installed/launched on API 37 AVD; all 34 embedded MP3 hashes match source. See `../agent_docs/evidence/voice/android37-native-release-v6-negation-2026-10-15/README.md`.
- Current preview verification: Metro `:8081/status` returns HTTP 200; the LAN manifest advertises `192.168.100.36:8081`, and its warm iOS launch bundle returned HTTP 200 in 5.25 seconds (5,530,710 bytes) with current revision, gateway URL, action aliases and dock hint; stale disconnected copy is absent. Gateway `:8788/health` returns ready on Node 24.14.1/faster-whisper 1.2.1/large-v3 CUDA. Phone test URL: `exp://192.168.100.36:8081`; the user has deferred reloading it on iPhone.
- Re-ran current checks: `npm test` 170/170, typecheck, lint, `npx expo install --check`, and gateway smoke test with local synthetic clips all pass. No user audio was used.
- On chapter 1, the suggested “Đây là điểm nào?” produced the chapter-1 fictional answer. On the latest APK, opening its text while playback was active kept the player running at 00:02/00:10, and Back returned to Home. Screenshots: `../agent_docs/evidence/voice/android37-native-release-current-2026-10-15/latest-player-text-open.png` and `latest-back-home.png`. AVD has no audio hardware; this is not audible or speech-recognition evidence.
- Android Back from Q&A returned to the chapter selector and then Home, with the process still alive and no recent fatal RN/AndroidRuntime log entry. It does not verify the earlier iOS SafeArea crash.
- `uiautomator dump` could not get idle state during the active player animation. The stale XML was discarded; screenshots are the evidence for this run.

- Người dùng xác nhận lượt thứ hai trên iPhone có meter, transcript/Q&A đúng và nghe được câu trả lời; không có audio/log độc lập. Preview mới `exp://192.168.100.36:8081` được để sau.
- Metro `:8081` đã được restart sau khi `/status` còn trả 200 nhưng manifest/bundle bị treo. Hiện manifest và iOS launch asset đều HTTP 200; bundle chứa mã nhánh `canAskAgain=false` và gateway `192.168.100.36:8788`. Gateway health ready. URL thử hiện tại vẫn là `exp://192.168.100.36:8081`; iPhone chưa reload theo ý anh.
- Host recheck hiện tại tải trực tiếp iOS bundle tại `:8081`: HTTP 200, 6.072.199 bytes; có URL gateway và `MIC_PERMISSION_BLOCKED`, không có copy “Chưa kết nối máy nhận giọng nói”. Gateway `/health` HTTP 200/ready, Metro `/status` HTTP 200. Đây chỉ xác minh host/LAN, chưa chứng minh iPhone đã nạp bundle.
- Trên APK Android release API 37, đã kiểm đủ nhánh mic: từ chối quyền → fallback gõ → thử lại → cấp quyền → recorder vào `00:02` → Hủy về idle; quyền còn granted. Bằng chứng ở `agent_docs/evidence/voice/android-emulator/README.md`. AVD `-no-audio`, nên đây không phải kiểm lời nói/meter/STT.
- APK kiểm nhánh quyền mic bị chặn: 121.247.352 byte, SHA-256 `ED49FF5702BE20002184876F20FB34B828DF7BEFEA1F22A48FCE2F7944DC80E2`; APK chứa đủ 34 MP3 khớp source và bundle nhúng gateway URL. AVD xác nhận Mở Cài đặt → cấp quyền → recorder start/cancel. `npm test` hiện 168/168.
- APK Android QA UI/player gần nhất đã so sánh installed/local byte-for-byte: `com.valentino241.ngokedemo`, 121.247.808 byte, SHA-256 `D6BB16DCE259002D38D112DACA28E9DD91BF5D0681C005AEC9BB83025E8AB50D`. Chương 6 `qa-letter` mở đúng câu trả lời; mở/thu gọn chữ trong lúc player chạy không đưa progress về 0. AVD `-no-audio`, nên đây không phải bằng chứng âm thanh nghe được hay mic/STT. Ảnh: `../agent_docs/evidence/voice/android37-native-release-qa6-answer-text-playing-2026-10-14.png`, `../agent_docs/evidence/voice/android37-native-release-qa6-answer-text-collapsed-playing-2026-10-14.png`.
- Trên cùng APK, native UI sweep đã đi qua sáu chương, chọn một chip hỏi gợi ý ở mỗi chương: nguồn câu trả lời khớp đúng chương, player ở Ready, chip không tự phát audio, chữ câu trả lời đóng mặc định. Có screenshot và UIAutomator XML cho từng chương tại `../agent_docs/evidence/voice/android37-six-chapter-ui-2026-10-14/README.md`. Đây là UI routing trên AVD `-no-audio`, không phải STT/tiếng nói sáu chương.
- Kiểm thêm reader đủ sáu chương: Xem chữ hiện đúng nguyên văn đáp án trong `data/demo.json`; Thu gọn xóa đáp án khỏi UI tree và player vẫn Ready. Ảnh/cây accessibility mỗi trạng thái ở `../agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/README.md`. Không chứng minh playback nghe được hoặc voice/STT.
- Kiểm thêm trên APK này: sau Settings recovery, lượt thu thứ hai hiện `Đang thu · 00:00`; Hủy về idle. Runtime permission còn granted, không gửi clip; AVD `-no-audio`.
- Trên APK mới nhất đã cài ở AVD API 37 (`com.valentino241.ngokedemo`, 121.246.512 byte, SHA-256 `BA973B5F23550367191A3A5ED004FD411CEF6D90ABB5C0FB5A132AA4897221D2`), Plan không còn giữ topic/picks ẩm thực sau input “Không đi ẩm thực trong 30 phút”; thời lượng 30 phút được giữ và app yêu cầu chọn chủ đề. Ảnh: `agent_docs/evidence/voice/android-emulator/android37-release-negated-plan-result-2026-10-14.png`. Đây là text entry trên AVD `-no-audio`, không phải STT/audio test.
- Cùng APK mới: player tiến đến `00:02` rồi pause; mic thu rồi Hủy về idle, lần nhấn mic thứ hai cũng vào `Đang thu` và Hủy về idle. Ảnh và giới hạn AVD `-no-audio` ở `agent_docs/evidence/voice/android-emulator/README.md`; không xác nhận meter có tín hiệu hay lời nói/STT.
- Khi đưa recorder đang chạy xuống nền bằng Home, AppOps kết thúc lượt RECORD_AUDIO; mở lại app thì dock idle và không tự thu tiếp. Đây là kiểm lifecycle AVD, không phải kiểm cuộc gọi/audio-route trên iPhone.
- Story player cũng dừng khi Home và không tự phát lại sau khi mở app; player trở về Ready/0%. Đây là AVD state check, không xác nhận âm thanh thật.
- Re-run mobile hiện tại: `npm test` 168/168, typecheck, lint, Expo dependency check pass. Regression giữ 33 transcript ASR near-miss ở `unknown` đúng node; kiểm thêm Gửi trùng, Hủy khi native stop/ASR chờ và đổi node/revision giữa request; late response không được áp dụng. Đây là test client có dependency doubles. iOS/Android Hermes exports `index-9873bd6015e99b5d4350b5d75ac9316a.hbc` (2.455.227 byte) / `index-11ec7bf0812d650912b932ceb0b89a21.hbc` (2.455.453 byte) đóng đủ 34 MP3 mỗi platform, bytes khớp nguồn; đây không phải IPA. APK release đã build, cài và mở trên AVD.
- Latest plain JS exports were rerun from current source: iOS 1,073 modules and Android 1,068 modules; metadata includes 34 MP3 on each platform and SHA-256 sets match the source catalogue. Both bundles include the current gateway URL and mic permission recovery. They are not IPA/APK native builds.
- Host recheck sau sửa: Metro `:8081` manifest và iOS bundle HTTP 200; bundle 6.062.091 ký tự có gateway LAN, recorder và helper phủ định mới, không còn copy kết nối cũ. Gateway `/health` tại `192.168.100.36:8788` báo ready.
- Validator audio vừa chạy lại: 34/34 file đúng text/hash/node/revision/codec/duration/level; audio nghe QC vẫn pending. Không có clip nào được tick nghe.
- Năm POST warm liên tiếp trên cùng clip TTS tổng hợp 19,15 giây đều trả HTTP 200, transcript khác rỗng và echo metadata đúng. Gateway/STT qua LAN p50 7.536 giây, p95 nearest-rank 7.727 giây (7,536/7,727 ms); không tính thu âm, upload từ app, Q&A, playback hoặc hiệu năng trên iPhone.
- Gateway smoke live đạt bằng clip TTS tổng hợp local 19,15 giây: abort/retry, quota và các media guards pass. Mobile recheck `npm test` 166/166, typecheck, lint và Expo dependency check pass.
- Còn lại: voice thật qua sáu chương/21 Q&A và failure paths, QC nghe tay 34 clip, iOS native/audio route/interruption, VoiceOver/TalkBack, thiết bị thật p50/p95 và reload bundle mới trên iPhone (người dùng để sau). Gateway-only latency đã đo nhưng không thay các gate này. Đây chưa phải nghiệm thu V0–V7.

## Snapshot trước lần Metro timeout mới nhất — 14/10/2026 (đã supersede)

- Current checks after the accessibility status update: `npm test` 162/162, typecheck, lint, Expo dependency check and `git diff --check` pass. Current iOS/Android JS exports pass (1,073/1,068 modules; `index-0476f928e945a4013b39391ae68ad762.js` / `index-95b2dbb411a1c5b752c11c064bbce29b.js`) and embed `http://192.168.100.36:8788`. These are JavaScript exports, not native IPA/APK builds.
- Full catalogue revalidation: 34/34 clips pass source/text/node/revision/hash, MP3/48 kHz/mono, duration and level checks. Manifest SHA-256 `90747665D049CC3B4AF018672EF0935805F324236986D8F2047DC79B440113E9`; total 7.0 minutes / 5.04 MB. Human listening is still pending; highest synthetic ASR WER is 23.1% for `qa-flowers-answer`.
- Live local gateway `/health` is ready on faster-whisper 1.2.1. A non-personal generated 19.15-second Vietnamese TTS sample returned HTTP 200 and matching request context. Gateway smoke also aborts an active request, then verifies a new request succeeds with its own `turnId`; already-running Python inference finishes before deleting its temporary clip.
- User confirms the second consecutive iPhone voice turn displayed a transcript and the correct answer, the meter moved, and the answer was audible. This is user-reported real-device evidence for one follow-up STT→Q&A→playback path; no raw audio/log was collected.
- A previous host check found Metro `:8089` timing out while `:8081` served an iOS bundle with HTTP 200 and the gateway URL. That preview later stalled; see the newest section for the current timeout state. Gateway `/health` remains ready. The current Android release APK hash is 0F43437B6B29D5AF9A7C750E746D1FE731F45A1808778DD6AC8925972FDF53F9; see the latest section for mic start/cancel evidence. Full six-chapter, failure-path, human audio QC, iOS hardware/accessibility and performance checks remain open.

## Lịch sử kiểm tra lỗi lượt voice thứ hai — 14/10/2026

Người dùng báo lượt đầu trên iPhone trả lời, nhưng lượt hai mất meter và lỗi. Code hiện chờ player dừng trước khi chuyển audio mode và hủy callback auto-play cũ khi mở lượt mic mới; đây là race khả dĩ, chưa xác nhận là nguyên nhân trên iPhone. Trên APK release hiện tại, Android API 37 đã chạy hai lần liên tiếp theo luồng phát lời kể → mic → Hủy → phát lời kể → mic; cả hai lần hiện meter. Sau đó 20 vòng start/cancel đều báo AppOps thu/dừng đúng, dock kết thúc idle; PSS dao động 167,959–176,922 KB và logcat không có fatal. Không thu/gửi lời nói nên đây chưa phải STT/Q&A E2E và không thay thế iPhone.

Trạng thái Metro và APK trong ghi chú lịch sử này đã được thay bởi phần cập nhật đầu tài liệu.

**Build follow-up:** after the recorder-stop UI and regression test were included, the final count is 154/154. Android release APK is 121,244,632 byte, SHA-256 `E0680D8A78513442364687AC084AE8809F66BB69BD9A6631A8815A7DF5A0AB47`; it is installed/launched on the API 37 AVD. This remains emulator proof only.

The earlier status paragraph below records the previous pause implementation and is superseded by this update.

**Cập nhật:** 14/10/2026. Người dùng báo lượt đầu trên iPhone chạy, lượt hai lỗi và mất meter. Đường dừng answer loop nay chỉ tắt loop rồi pause; mic không chờ callback tua của player. Phát lại chủ động vẫn tua về đầu. `npm test` 152/152, typecheck/lint, iOS JS export và Android release build đạt. APK 121,243,192 byte (SHA-256 `C21ACE29D356F779A16219CCA8AEE75527B805B983F90B8B13A3C15A0751CA0C`) đã cài/mở trên Android API 37 AVD; không thấy fatal log. Gateway `8788` ready. Chưa retest lượt hai trên iPhone.

## Mở bản thử Android/iOS

- **Mở preview đã cấu hình hiện tại:** khi sẵn sàng, mở `exp://192.168.100.36:8081` trong Expo Go rồi Reload. Bundle cổng này đã được kiểm trực tiếp và có URL gateway. Không dùng `:8089` cho lượt này: `/status` còn trả running nhưng fetch bundle bị treo. Điện thoại và máy dev cần ở cùng Wi‑Fi riêng tin cậy.
- **Kiểm thử STT:** gateway hiện `ready` và synthetic TTS qua STT đã trả transcript thật. Sau khi reload, kiểm đủ hai lượt voice cho từng chương bằng câu chuẩn lấy từ `data/demo.json`:

| Chương | Hỏi bằng mic | Hỏi tiếp bằng mic | Kết quả |
| --- | --- | --- | --- |
| 1 · Cổng ngõ | Đây là điểm nào? | Con ngõ này có gì để xem? | ☐ lượt 1 · ☐ lượt 2 |
| 2 · Hiên đồng hồ | Vì sao chiếc đồng hồ không chạy nữa? | Bánh răng mẹ gửi có ý nghĩa gì? | ☐ lượt 1 · ☐ lượt 2 |
| 3 · Bếp đầu hè | Gói xôi của cô Hương có gì đặc biệt? | Sợi dây xanh nối những điều gì? | ☐ lượt 1 · ☐ lượt 2 |
| 4 · Sân hoa giấy | Ai trồng giàn hoa giấy trong sân? | Nút thắt trên giàn cây nhắc An điều gì? | ☐ lượt 1 · ☐ lượt 2 |
| 5 · Bậc thềm nắng | Chiếc chìa khóa mở được thứ gì? | Vì sao An đọc lá thư thật chậm? | ☐ lượt 1 · ☐ lượt 2 |
| 6 · Đèn cuối ngõ | Mẹ viết gì ở cuối lá thư? | Vì sao mẹ hẹn lúc đèn cuối ngõ sáng? | ☐ lượt 1 · ☐ lượt 2 |

Mỗi lượt cần có meter khi nói, transcript thật sau Gửi, answer thuộc đúng chương và phát được tiếng; đổi chương không được giữ transcript/answer/audio cũ. Ghi pass/fail theo từng cặp; một kết quả không khớp cần giữ là unknown, không gán alias gần nghĩa để làm test xanh.

- APK: [app-release.apk](../mobile/android/app/build/outputs/apk/release/app-release.apk)
- Kích thước: 121,247,352 byte. SHA-256: `ED49FF5702BE20002184876F20FB34B828DF7BEFEA1F22A48FCE2F7944DC80E2`.
- Gateway STT local đang chạy, bind riêng máy dev tại `http://<DEV_LAN_IP>:8788`; `/health` trả HTTP 200. Điện thoại và máy dev cần cùng Wi‑Fi riêng; giữ gateway chạy khi thử mic.
- APK mới đã cài/mở trên AVD API 37. Sau khi hiện answer, tap mic cho meter hoạt động; Hủy, tap mic lần nữa cho meter hoạt động; Hủy tiếp. Ảnh: [android37-current-build-second-meter-active-2026-10-14.png](../agent_docs/evidence/voice/android-emulator/android37-current-build-second-meter-active-2026-10-14.png). Không gửi audio; đây không thay cho iPhone hoặc STT.
- Snapshot lỗi trước đó (đã superseded): Metro cũ trên `8087` trả `/status` nhưng bundle treo, còn lượt hai từng mất meter. Người dùng đã xác nhận một lượt hỏi tiếp thành công trên `:8089`; để kiểm bundle cấu hình hiện hành, lần test tiếp theo dùng `:8081` sau khi người dùng sẵn sàng reload.
- Gateway và Metro chỉ dành cho mạng riêng tin cậy; không dùng Wi‑Fi công cộng, không port-forward/public expose.

Khởi động lại Metro nếu tiến trình dừng (PowerShell tại `<REPO_ROOT>\mobile`):

```powershell
npm start -- --clear --lan --port 8081 --go --max-workers 2
```

Gói iOS hiện là Expo Go preview, chưa phải IPA/native store build; bundle thiếu `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL` sẽ không gửi STT. Điện thoại và gateway cần ở cùng Wi‑Fi riêng; Expo Go cũng cần được cấp quyền Local Network nếu iOS hỏi.

Plugin native iOS chỉ bật `NSAllowsLocalNetworking` và `NSLocalNetworkUsageDescription` khi cấu hình private IPv4 HTTP gateway; [Apple xác nhận ngoại lệ này áp dụng cho IP nội bộ](https://developer.apple.com/documentation/bundleresources/information-property-list/nsapptransportsecurity/nsallowslocalnetworking) và [mọi kết nối trực tiếp tới host LAN cần mô tả quyền](https://developer.apple.com/documentation/bundleresources/information-property-list/nslocalnetworkusagedescription). Expo Go dùng Info.plist riêng, nên cần kiểm prompt quyền/local network trên iPhone thật.

Smoke test sau khi app mở: vào Demo → `Cổng ngõ` → nhấn mic, nói rõ **“Có ăn gì ở đây không?”**, nhấn Gửi. Khi câu nhận đúng, app hiện và tự phát câu trả lời `qa-03`; sau đó, trong khi câu trả lời đang lặp, nhấn mic, hỏi **“Có chuyện xưa nào ở đây không?”** rồi nhấn Gửi để kiểm `qa-05` và vòng thu thứ hai. Nếu vẫn mất meter hoặc hiện unknown, chạm **Xem câu đã nhận dạng** và ghi lại đúng transcript cùng thông báo lỗi; chỉ cần gửi lại phần chữ/ảnh lỗi, không cần gửi audio. Không dùng việc chạm chip làm bằng chứng auto-play; chip không tự bật tiếng.

Không ghép `--offline` với `--lan`; nếu cổng 8081 đã được dùng, chọn cổng Metro khác, cập nhật URL gateway trong `.env.local` khi cần, rồi mở đúng URL mới trong Expo Go.

Cài bằng USB sau khi bật USB debugging:

```powershell
& '<USER_HOME>\AppData\Local\Android\Sdk\platform-tools\adb.exe' install -r '<REPO_ROOT>\mobile\android\app\build\outputs\apk\release\app-release.apk'
```

Hoặc chép APK lên điện thoại Android và mở file để cài. Trong app, vào Demo → chọn chương → nhấn mic, nói câu hỏi trong các gợi ý rồi nhấn **Gửi**. **Hủy** hoặc Back phải kết thúc lượt hiện tại. Chạm chip câu hỏi không tự bật audio.

## Khởi động lại gateway nếu tiến trình dừng

Mở PowerShell tại `<REPO_ROOT>`:

```powershell
$env:NGOKE_VOICE_HOST = '<DEV_LAN_IP>'
$env:NGOKE_VOICE_PORT = '8788'
$env:NGOKE_VOICE_ASR_PROFILE = 'large-v3-cuda'
node tools/voice/gateway/server.mjs
```

The last setting keeps this Windows RTX host on the verified GPU profile. On a machine without the pinned CUDA/cuDNN runtime, set it to `small-cpu` instead.

Kiểm tra `http://<DEV_LAN_IP>:8788/health`. IP LAN có thể đổi; khi đổi cần cập nhật host và build APK mới với URL đó. Preview hiện dùng HTTP, không có auth và chỉ dành cho mạng thử riêng. Gateway không ghi audio/transcript vào log và không gửi audio lên cloud.

## Build lại Android khi đổi URL LAN

Trong PowerShell tại `<REPO_ROOT>\mobile\android`:

```powershell
$env:JAVA_HOME = '<USER_HOME>\.gradle\jdks\eclipse_adoptium-17-amd64-windows.2'
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
$env:ANDROID_HOME = '<USER_HOME>\AppData\Local\Android\Sdk'
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL = 'http://<DEV_LAN_IP>:8788'
.\gradlew.bat :app:createBundleReleaseJsAndAssets --offline --no-daemon --max-workers=1 --rerun-tasks
.\gradlew.bat :app:assembleRelease --offline --no-daemon --max-workers=1
```

`mobile/android` là thư mục native được Expo sinh và bị Git ignore. Bản build hiện tại đã thêm Gradle task input cho URL để tránh cache bundle sai trong workspace này; lệnh `--rerun-tasks` phía trên vẫn là cách build chắc chắn sau khi regenerate native project.

## Snapshot trước các kiểm thử thiết bị mới nhất — đã superseded

- APK ZIP có đủ 34 MP3, accessibility labels, và bundle trỏ đúng `<DEV_LAN_IP>:8788`. SHA-256 bundle bên trong APK khớp output bundle vừa build.
- Android và iOS JS exports chạy thành công với URL LAN mới; đây không phải IPA hay kiểm chứng iOS native.
- Gateway nhận clip TTS tổng hợp 19.15 giây (HTTP 200, metadata/turn context đúng). Rerun V0 trên 6 clip synthetic: preset Đoan Trang WER 7.9% (5.1% bỏ dấu), weighted ASR RTF 0.213; transcript vẫn có thay từ nên chưa đủ kết luận Q&A reliability. Gateway smoke xác nhận sai định dạng, quá ngắn, im lặng và quá dài được chặn; đây không phải mic E2E.
- Sửa timeout để bao phủ cả lúc đọc response body; unit test mô phỏng headers đến nhưng body treo. `npm test`: 134/134; typecheck, lint và dependency check pass. Gradle `:app:assembleRelease` pass sau fix (2m55s, 377 tasks; 30 executed/347 up-to-date); Android/iOS JS exports pass với URL mới và 34 MP3 mỗi export.
- Chưa kiểm app mic → gateway → Q&A/audio đầu-cuối, chưa cài APK mới lên phone/emulator, chưa có iPhone/iOS native, chưa nghe tay đủ 34 clip, và chưa đo route âm thanh/accessibility/performance trên thiết bị thật. Vì vậy GV5/GV7 còn mở; không coi luồng đã hoàn thiện.

Chi tiết theo gate, log kiểm và giới hạn: [VOICE_TEST_REPORT.md](VOICE_TEST_REPORT.md), [VOICE_PHASE_ROADMAP.md](VOICE_PHASE_ROADMAP.md), [VOICE_API_CONTRACT.md](VOICE_API_CONTRACT.md). Audio manifest và license: [tools/voice/README.md](../tools/voice/README.md), [LICENSES.md](../mobile/assets/voice/LICENSES.md).

## Lịch sử chẩn đoán lỗi lượt hai — đã cập nhật sau khi người dùng retest

Source Expo Audio 57.0.5 cho thấy iOS lên lịch tắt audio session 100 ms sau khi player pause; tác vụ trễ chỉ kiểm tra player, không kiểm tra recorder. Player voice đã bật `keepAudioSessionActive: true` để tránh tác vụ đó tắt mic trong lúc chuyển từ câu trả lời sang lượt thu tiếp theo. Đây là nguyên nhân phù hợp với triệu chứng, chưa được xác nhận trên iPhone.

Reload the current Expo Go bundle, complete one voice question and hear its answer, then tap the mic again and ask “Có chuyện xưa nào ở đây không?”. Check that the meter moves and the linked answer arrives. If it still fails, note whether the dock stayed at “Đang bật micro…”, entered “Đang thu” with a flat meter, or showed an error; if STT mismatches, share the text from “Xem câu đã nhận dạng” and a screenshot. Do not send the recording. At this check, Metro `:8089/status` returned HTTP 200 but the iOS bundle request timed out, so reload will not fetch the fix until that preview serves a bundle.

### Bundle :8089 ở snapshot cũ — 14/10/2026

Metro LAN `exp://192.168.100.36:8089` hiện trả iOS bundle HTTP 200 (6,062,119 ký tự) chứa guard chờ 125 ms sau khi player đang chạy dừng, recorder metering options, `keepAudioSessionActive` và playback-intent guard. Bundle chưa chứa URL gateway `192.168.100.36:8788`, nên chỉ kiểm tra được phát → mic → meter; chưa gửi được STT/câu trả lời. Gateway `/health` trả HTTP 200.

Để kiểm lỗi lượt hai, reload bundle hiện tại trong Expo Go, phát một lời kể/câu trả lời đến khi đang nghe, rồi nhấn mic và xác nhận bộ đếm cùng meter có chạy. Không cần gửi bản ghi. Nếu meter vẫn phẳng, ghi lại trạng thái dock (đang bật micro/đang thu/lỗi) và thông báo hiển thị. Kiểm tra STT đầy đủ cần Metro được mở lại với URL gateway; lần thử khởi động Metro có biến môi trường trước đó bị công cụ từ chối, không tìm cách lách.

### Chẩn đoán cũ “Chưa kết nối máy nhận giọng nói” trên :8089 — đã superseded

Nguyên nhân đã xác nhận: gateway đang `ready` tại `http://192.168.100.36:8788/health`, nhưng Metro `:8089` được khởi chạy khi chưa có `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL`. Vì vậy bundle báo chưa cấu hình và không gửi STT dù gateway chạy. Đã tạo `mobile/.env.local` (Git bỏ qua) với URL LAN hiện tại; địa chỉ này cũng được xác nhận là IP Wi‑Fi của máy phát triển.

Ở snapshot cũ, lệnh khởi động dùng `:8089` trước khi cấu hình `.env.local`, nên bundle bị thiếu URL gateway. Không chạy lại lệnh cũ này. Lệnh hiện hành và preview `:8081` đã xác minh nằm ở đầu mục **Mở bản thử Android/iOS**; người dùng đã để sau việc reload bundle mới trên iPhone.

### Snapshot preview sau khi thêm env, trước lần restart mới nhất — 14/10/2026

Sau khi thêm `.env.local`, `npm run build:ios -- --no-bytecode` và `npm run build:android -- --no-bytecode` đều thành công: iOS `index-51a74f280fc4c08fed13fd3e5186e001.js` (1.073 modules) và Android `index-d3b5a0453325e2f8ffc34b488b03870f.js` (1.068 modules) đều chứa URL gateway. Gateway `/health` vẫn `ready`. Metro `:8089` đang phục vụ bundle thiếu URL và manifest bị timeout; một Metro khác cùng dự án tại `:8081` có manifest iOS HTTP 200 và bundle 6,068,958 byte chứa URL, `keepAudioSessionActive`, `playbackIntent` cùng recorder metering. Dùng `exp://192.168.100.36:8081` cho lần thử Expo Go kế tiếp; cần reload trên iPhone để xác nhận STT thực tế.

### Kết quả thử lại voice trên iPhone — 14/10/2026

Người dùng đã mở `exp://192.168.100.36:8089` trong Expo Go, reload và xác nhận lượt voice thứ hai liên tiếp có meter chạy, hiện transcript cùng câu trả lời đúng, đồng thời nghe được tiếng câu trả lời. Đây là xác nhận thực tế từ iPhone cho luồng thu giọng → nhận dạng → ghép Q&A → phát audio trong một chuỗi hai lượt. Chưa có transcript/log để đối chiếu độc lập.

Kiểm tra tại `mobile/`: `npm test` **161/161**, typecheck, lint và dependency check đều đạt. Người dùng xác nhận meter lượt hai chạy; chưa có transcript nguyên văn/log để đối chiếu độc lập. Lượt thử trước dùng `:8089` chưa thể đối chiếu với bundle đang phục vụ; candidate `:8081` đã được xác minh từ host nhưng cần reload/kiểm trên iPhone.

Việc còn lại: nghe tay/QC 34 clip, thử thêm lỗi mạng/quyền/hủy và các audio route trên iPhone, accessibility/performance, thử mic thật đủ sáu chương và lưu trace độc lập. Chưa đánh dấu GV7 hoặc toàn bộ Voice hoàn tất.

### Android AlleySelect accessibility check — 15/10/2026

The API 37 release APK now gives the back button, search, clear-search, demo action, and filter chips at least 48 dp of touch height. Search/clear worked on the installed build, and the “Ẩm thực” filter exposed its selected state and reduced the list to two alleys. With Android `transition_animation_scale=0`, Home opened “Chọn Con Ngõ” and the full destination was present in the 80 ms capture; all system scales were restored to `1`. APK: 121,247,928 bytes, SHA-256 `E7D5BD8D8D0B34A23F77BA97CA20A5A0D6A42D7D175FF50858D8C9874899F0F7`. Screenshots and UIAutomator XML are recorded in [the native evidence folder](../agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/README.md). This does not cover TalkBack, VoiceOver, or iPhone behavior; those checks remain open.

### Ma trận hỏi giọng nói trên iPhone

Dùng Demo mode với preview candidate `exp://192.168.100.36:8081`, trên cùng Wi‑Fi với gateway. Ở mỗi điểm, nhấn mic, nói câu hỏi chính, nhấn **Gửi**, rồi dùng mic hỏi tiếp câu theo cột cuối. Mỗi lượt cần thấy meter chạy, câu trả lời đúng nội dung điểm và nghe được tiếng; transcript vẫn đóng mặc định, chỉ chạm **Xem câu đã nhận dạng** nếu cần kiểm chữ. Không cần gửi audio hay ảnh.

| Điểm | Câu hỏi chính → ID | Hỏi tiếp → ID |
| --- | --- | --- |
| 01 | “Đây là điểm nào?” → `qa-01` | “Con ngõ này có gì để xem?” → `qa-02` |
| 02 | “Vì sao chiếc đồng hồ không chạy nữa?” → `qa-clock` | “Bánh răng mẹ gửi có ý nghĩa gì?” → `qa-gear` |
| 03 | “Gói xôi của cô Hương có gì đặc biệt?” → `qa-xoi` | “Sợi dây xanh nối những điều gì?” → `qa-ribbon` |
| 04 | “Ai trồng giàn hoa giấy trong sân?” → `qa-flowers` | “Nút thắt trên giàn cây nhắc An điều gì?” → `qa-knot` |
| 05 | “Chiếc chìa khóa mở được thứ gì?” → `qa-box` | “Vì sao An đọc lá thư thật chậm?” → `qa-envelope` |
| 06 | “Mẹ viết gì ở cuối lá thư?” → `qa-letter` | “Vì sao mẹ hẹn lúc đèn cuối ngõ sáng?” → `qa-light` |

Sau coverage sáu điểm, kiểm riêng: **Hủy → thu lại ngay**; đổi điểm/Back khi đang thu → lượt cũ không trả lời muộn; tắt mạng khi gửi → lỗi rõ và có thể thử lại sau khi bật mạng; mic bị từ chối → lối Gõ/Thử lại sau khi cấp quyền. Nếu tiện, kiểm loa máy/tai nghe/Bluetooth, khóa màn hình, VoiceOver, chữ lớn và Reduce Motion. Ghi PASS/FAIL theo điểm và mã lỗi nhìn thấy; không cần cung cấp bản ghi âm.

QC nghe 34 clip có checklist riêng tại [voice_v1_listening_checklist.md](../agent_docs/voice_v1_listening_checklist.md). Hiện chưa clip nào được người nghe đánh dấu; ưu tiên `qa-flowers-answer`, `qa-cake-answer`, `demo-01-caption`, `demo-04-caption` và `demo-05-caption`, nhưng chỉ yêu cầu tạo lại khi tai nghe xác nhận lỗi.

Android font-scale QA hiện có ở [README evidence](../agent_docs/evidence/voice/android37-font-scale-2026-10-14/README.md): 1.5×/2.0× đã kiểm trên AVD API 37, gồm thao tác cuộn để mở các câu hỏi tiếp. Đây là kiểm layout; TalkBack/iPhone Dynamic Type và voice/audio trên thiết bị thật vẫn cần kiểm riêng.

### Plan and location action surfaces — 15/10/2026

The latest API 37 SDK57 release APK is 121,247,924 bytes (SHA-256 `EEC6430CC94BC70CAD01B5A58C954DA4B1333ECC1F49FFDB1BE8BCF4C3D9E1CF`). Plan's manual-input toggle now measures 48 dp; the keyboard, text fields and apply buttons remain usable. Typing the food topic and selecting 30 minutes produced two simulated picks totalling 30 minutes; tapping “Bếp đầu hè” opened the matching chapter. The separate GPS and QR screens show explicit start buttons, and source/tests require confirmation after a candidate result. No GPS or camera was started. Screenshots and UIAutomator trees are in [the latest Android evidence folder](../agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/README.md).

The built APK contains all 34 canonical MP3s; a fresh SHA-256 multiset comparison against `mobile/assets/voice` found 34/34 matches and no missing or extra entries.

The mobile test suite (168 tests), typecheck, lint, Expo dependency check, iOS JavaScript export and Android release build passed. The AVD has no audio and this run does not verify spoken action commands, real GPS/QR hardware, screen-reader output, iOS native behavior, or physical audio/performance. Keep GV7 open; the user deferred the iPhone reload on `exp://192.168.100.36:8081`.

### Android large-font regression retest — 15/10/2026

The latest release APK after the player-title wrapping fix is 121,247,924 bytes, SHA-256 `236072DF9F8E3C8B3952D0C4A4CA13F63A22C8844EDB7015A9BC917263FF4243`. At Android font scale 2.0, the player title wraps fully; after scrolling, all four suggested questions and the voice, typing and notebook controls remain exposed as enabled. See `agent_docs/evidence/voice/android37-native-release-current-2026-10-15/player-title-fix-reader-scrolled.png` and its UIAutomator XML. Font scale was restored to 1.0. This AVD has no audio, and the iPhone reload at `exp://192.168.100.36:8081`, screen readers, hardware voice/audio routes and performance checks remain pending.

### Exact STT alias and refreshed preview — 15/10/2026

The pinned small-model's nine previously unmatched synthetic Q&A transcripts now have explicit, chapter-local aliases. Replaying all 21 cached transcripts through the app's exact matcher yields 21/21 expected IDs with no unknown or wrong IDs; this is synthetic only. Demo dataset and catalogue revision: `5a191de3080dd27f420210b60017abd29bc9eda6ea3168aa8b305f78cdc79971`; manifest SHA-256: `E62F27FC7432BAAA71601C12650186674358606FECCCE63DEC8A834C7AA77232`.

The rebuilt Android API 37 APK is 121,248,588 bytes, SHA-256 `582E38AF52AA0A3B8C63FDB16CF9A9D029BD597414F59A5F111D088DC57726E8`. Its 34 bundled MP3 hashes match all source audio. A typed normalized transcript at point 2 resolved to `qa-lam`; opening the text showed its expected answer. See `agent_docs/evidence/voice/android37-native-release-current-2026-10-15/voice-alias-answer.png`.

The iOS JS export completed; Metro `:8081` currently serves the revision, action aliases, dock hint and gateway URL, and gateway `:8788` reports ready. The latest warm LAN bundle fetch returned HTTP 200 in 5.25 seconds (5,530,710 bytes). The user deferred reloading Expo Go, so current-device iPhone behavior is still pending. Human audio QC, actual spoken coverage across all six points, physical Android voice/audio, accessibility and performance also remain open.

### Large-v3 GPU gateway and chapter-4 native alias — 15/10/2026

The active LAN gateway `:8788` is running the explicit `large-v3-cuda` profile (faster-whisper 1.2.1, pinned large-v3 revision, CUDA float16). Its CUDA/cuDNN wheels are hash-pinned in ignored `tools/voice/.cache/cuda-runtime`; no mobile dependency or paid API was added. `small-cpu` remains the default profile. Check `/health` to verify the live profile before a test.

With two observed synthetic transcript variants added as exact aliases, the mobile helper → live gateway → chapter/revision matcher achieved 21/21 expected Q&A, 0 unknown/wrong/transport errors, and 570/634 ms host p50/p95. A local M4A helper request reached `qa-02` in 520 ms. This is synthetic PC evidence only. The Android API 37 release APK (`B171E9C88288097F15F0DCBB15036F7D808373ACCCA6D22D9030833AADFB85B2`) accepted the normalized `qa-flowers` alias at chapter 4 and showed the correct answer; chapter 1 correctly rejected the cross-chapter question. Screenshot: `agent_docs/evidence/voice/android37-native-release-current-2026-10-15/qa04-flowers-manual-alias-answer-2026-10-15.png`.

Current validation: 170 mobile tests, typecheck, lint, dependency check, 34/34 catalogue validation, gateway smoke checks, Android release build and APK audio-hash check pass. The emulator has no usable audio; it does not verify recording or playback. The iPhone `:8081` reload is deferred. Human listening, six-chapter spoken iPhone coverage, physical Android audio, device interruption/routes, screen readers and hardware performance remain open.

### Latest local native and V6 action verification — 15/10/2026

The current API 37 release APK is 121,248,752 bytes, SHA-256 `17BF0EF342B0E41E4A90972101B260BD1E75D9654F80FDC5BFA469464E6EF3D3`. It contains 34 MP3 entries whose hash multiset matches all 34 source audio files. On the AVD, the chapter-1 Q&A chip showed its expected answer; after starting playback, opening the answer text left the player active at 00:02/00:10. Back returned to Home. Captures are `agent_docs/evidence/voice/android37-native-release-current-2026-10-15/latest-player-text-open.png` and `latest-back-home.png`.

Two local VieNeu action clips passed through the production mobile helper, live `:8788` gateway and exact intent parser: `Bắt đầu nghe lời kể` → `listen`; `Mở máy quét mã QR` (recognized as `Mở máy quét mạ.`) → `open-qr`. This is synthetic-only coverage. The AVD has no audio; do not use it as proof of mic signal or audible sound. Metro `:8081/status` is running and gateway `/health` is ready, but the user has deferred loading the current bundle on iPhone. Human clip QC, six-chapter iPhone speech, real-device routing/interruption, screen readers and hardware performance remain pending.

On the latest APK, two sequential recorder starts each reached `Đang thu · 00:01`; Cancel returned to idle both times. Android AppOps showed no active mic after the final Cancel. Screenshots: `agent_docs/evidence/voice/android37-native-release-current-2026-10-15/latest-recorder-first.png`, `latest-recorder-second.png`, and `latest-recorder-after-cancel.png`. The emulator has no audio input, so this checks recorder state only, not meter signal or STT.

The same APK passed 20 sequential start/cancel cycles on the AVD: mic AppOps became active on 20/20 starts and stopped on 20/20 cancels, with the app PID unchanged. PSS changed from 188,050 KB to 194,054 KB (+6,004 KB) in this one emulator run; do not interpret that as a leak/performance result. Final idle screenshot: `agent_docs/evidence/voice/android37-native-release-current-2026-10-15/latest-recorder-stress-idle.png`.

During an active recording on this APK, answering a simulated GSM call stopped AppOps capture; after hangup, returning to Ngõ Kể showed the idle dock and did not resume recording. Changing from chapter 1 to chapter 2 during another recording also stopped capture and returned the dock to idle. These checks used an API 37 AVD without audio input. The incoming-call notification alone left the app foregrounded and recording, so real-device interruption behavior remains unverified. Screenshots and exact AppOps observations: `agent_docs/evidence/voice/android37-native-release-current-2026-10-15/README.md`.

### Earlier preview check — revision 5a82b1 (superseded) — 15/10/2026

The final demo/catalogue revision is `5a82b1d4fa223b2170fd9fa2c761a01479b4e3e159a81a6de72f65566a8d2568`; the matching manifest SHA-256 is `e59696011be1501097b08f11091a903f8b9a88d30d2914fcc255d1c28db774ba`. Metro `:8081` served the iOS manifest and bundle with HTTP 200. The bundle contains this revision, the latest exact transcript alias and the LAN gateway URL. Gateway `:8788/health` reports ready on `large-v3-cuda`. The current static iOS export is `mobile/dist/ios/_expo/static/js/ios/index-0462bc7bf16834cfd89e7154fb994480.hbc` (SHA-256 `35D9DBA66BAC6ECD1D429DE99CC75019524740685C345943036B7D8AA0E07108`); current Android APK SHA-256 is `A44C99FF04125D5C24DD45ADFEA8C74EB8675C53EA00B4C2B45CEFEF95538BBC`.

The user deferred reloading `exp://192.168.100.36:8081`; the host check does not prove that the iPhone is running this bundle. Keep the remaining phone checklist above open: speak across all six chapters, then check audio routes/interruption, accessibility and perceived latency. Do not send or request a recording; report only the visible transcript, answer and playback result.
