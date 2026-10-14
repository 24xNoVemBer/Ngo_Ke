# Bàn giao Voice V0–V7 — Ngõ Kể

## Bằng chứng mới nhất — 14/10/2026

- Người dùng xác nhận lượt thứ hai trên iPhone có meter, transcript/Q&A đúng và nghe được câu trả lời; không có audio/log độc lập. Preview mới `exp://192.168.100.36:8081` được để sau.
- Trên APK mới nhất đã cài ở AVD API 37 (`com.valentino241.ngokedemo`, 121.246.512 byte, SHA-256 `BA973B5F23550367191A3A5ED004FD411CEF6D90ABB5C0FB5A132AA4897221D2`), Plan không còn giữ topic/picks ẩm thực sau input “Không đi ẩm thực trong 30 phút”; thời lượng 30 phút được giữ và app yêu cầu chọn chủ đề. Ảnh: `agent_docs/evidence/voice/android-emulator/android37-release-negated-plan-result-2026-10-14.png`. Đây là text entry trên AVD `-no-audio`, không phải STT/audio test.
- Cùng APK mới: player tiến đến `00:02` rồi pause; mic thu rồi Hủy về idle, lần nhấn mic thứ hai cũng vào `Đang thu` và Hủy về idle. Ảnh và giới hạn AVD `-no-audio` ở `agent_docs/evidence/voice/android-emulator/README.md`; không xác nhận meter có tín hiệu hay lời nói/STT.
- Re-run mobile sau sửa: `npm test` 165/165, typecheck, lint, Expo dependency check pass. iOS/Android Hermes exports hiện tại `index-9873bd6015e99b5d4350b5d75ac9316a.hbc` (2.455.227 byte) / `index-11ec7bf0812d650912b932ceb0b89a21.hbc` (2.455.453 byte) đóng đủ 34 MP3 mỗi platform, bytes khớp nguồn; đây không phải IPA. APK release đã build, cài và mở trên AVD.
- Host recheck sau sửa: Metro `:8081` manifest và iOS bundle HTTP 200; bundle 6.062.091 ký tự có gateway LAN, recorder và helper phủ định mới, không còn copy kết nối cũ. Gateway `/health` tại `192.168.100.36:8788` báo ready.
- Validator audio vừa chạy lại: 34/34 file đúng text/hash/node/revision/codec/duration/level; audio nghe QC vẫn pending. Không có clip nào được tick nghe.
- Năm POST warm liên tiếp trên cùng clip TTS tổng hợp 19,15 giây đều trả HTTP 200, transcript khác rỗng và echo metadata đúng. Gateway-only p50 7,536 ms, p95 nearest-rank 7,727 ms; không tính thời gian xử lý trên iPhone.
- Gateway smoke live đạt bằng clip TTS tổng hợp local 19,15 giây: abort/retry, quota và các media guards pass. Mobile recheck `npm test` 165/165, typecheck, lint và Expo dependency check pass.
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
- **Kiểm thử STT:** gateway hiện `ready` và synthetic TTS qua STT đã trả transcript thật. Sau khi reload, trên iPhone hỏi “Có ăn gì ở đây không?”, rồi hỏi tiếp “Có chuyện xưa nào ở đây không?”; ghi nhận transcript hiển thị và answer, không cần gửi audio.

- APK: [app-release.apk](../mobile/android/app/build/outputs/apk/release/app-release.apk)
- Kích thước: 121,245,884 byte. SHA-256: `0F43437B6B29D5AF9A7C750E746D1FE731F45A1808778DD6AC8925972FDF53F9`.
- Gateway STT local đang chạy, bind riêng máy dev tại `http://<DEV_LAN_IP>:8788`; `/health` trả HTTP 200. Điện thoại và máy dev cần cùng Wi‑Fi riêng; giữ gateway chạy khi thử mic.
- APK mới đã cài/mở trên AVD API 37. Sau khi hiện answer, tap mic cho meter hoạt động; Hủy, tap mic lần nữa cho meter hoạt động; Hủy tiếp. Ảnh: [android37-current-build-second-meter-active-2026-10-14.png](../agent_docs/evidence/voice/android-emulator/android37-current-build-second-meter-active-2026-10-14.png). Không gửi audio; đây không thay cho iPhone hoặc STT.
- Người dùng xác nhận lượt đầu trên iPhone hoạt động nhưng báo lượt hai lỗi. Metro cũ trên `8087` báo `/status` running nhưng bundle iOS không trả trong 60 giây; `8089` và `8090` đã dừng. Khởi động preview theo lệnh dưới đây rồi retest cả hai lượt trên iPhone cùng Wi‑Fi.
- Gateway và Metro chỉ dành cho mạng riêng tin cậy; không dùng Wi‑Fi công cộng, không port-forward/public expose.

Khởi động lại Metro nếu tiến trình dừng (PowerShell tại `<REPO_ROOT>\mobile`):

```powershell
npm start -- --clear --lan --port 8089 --go --max-workers 2
```

Gói iOS hiện là Expo Go preview, chưa phải IPA/native store build; bundle thiếu `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL` sẽ không gửi STT. Điện thoại và gateway cần ở cùng Wi‑Fi riêng; Expo Go cũng cần được cấp quyền Local Network nếu iOS hỏi.

Plugin native iOS chỉ bật `NSAllowsLocalNetworking` và `NSLocalNetworkUsageDescription` khi cấu hình private IPv4 HTTP gateway; [Apple xác nhận ngoại lệ này áp dụng cho IP nội bộ](https://developer.apple.com/documentation/bundleresources/information-property-list/nsapptransportsecurity/nsallowslocalnetworking) và [mọi kết nối trực tiếp tới host LAN cần mô tả quyền](https://developer.apple.com/documentation/bundleresources/information-property-list/nslocalnetworkusagedescription). Expo Go dùng Info.plist riêng, nên cần kiểm prompt quyền/local network trên iPhone thật.

Smoke test sau khi app mở: vào Demo → `Cổng ngõ` → nhấn mic, nói rõ **“Có ăn gì ở đây không?”**, nhấn Gửi. Khi câu nhận đúng, app hiện và tự phát câu trả lời `qa-03`; sau đó, trong khi câu trả lời đang lặp, nhấn mic, hỏi **“Có chuyện xưa nào ở đây không?”** rồi nhấn Gửi để kiểm `qa-05` và vòng thu thứ hai. Nếu vẫn mất meter hoặc hiện unknown, chạm **Xem câu đã nhận dạng** và ghi lại đúng transcript cùng thông báo lỗi; chỉ cần gửi lại phần chữ/ảnh lỗi, không cần gửi audio. Không dùng việc chạm chip làm bằng chứng auto-play; chip không tự bật tiếng.

Không ghép `--offline` với `--lan`; nếu cổng 8089 đã được dùng, chọn cổng Metro khác và mở URL mới trong Expo Go.

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
node tools/voice/gateway/server.mjs
```

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

## Đã kiểm và còn chờ

- APK ZIP có đủ 34 MP3, accessibility labels, và bundle trỏ đúng `<DEV_LAN_IP>:8788`. SHA-256 bundle bên trong APK khớp output bundle vừa build.
- Android và iOS JS exports chạy thành công với URL LAN mới; đây không phải IPA hay kiểm chứng iOS native.
- Gateway nhận clip TTS tổng hợp 19.15 giây (HTTP 200, metadata/turn context đúng). Rerun V0 trên 6 clip synthetic: preset Đoan Trang WER 7.9% (5.1% bỏ dấu), weighted ASR RTF 0.213; transcript vẫn có thay từ nên chưa đủ kết luận Q&A reliability. Gateway smoke xác nhận sai định dạng, quá ngắn, im lặng và quá dài được chặn; đây không phải mic E2E.
- Sửa timeout để bao phủ cả lúc đọc response body; unit test mô phỏng headers đến nhưng body treo. `npm test`: 134/134; typecheck, lint và dependency check pass. Gradle `:app:assembleRelease` pass sau fix (2m55s, 377 tasks; 30 executed/347 up-to-date); Android/iOS JS exports pass với URL mới và 34 MP3 mỗi export.
- Chưa kiểm app mic → gateway → Q&A/audio đầu-cuối, chưa cài APK mới lên phone/emulator, chưa có iPhone/iOS native, chưa nghe tay đủ 34 clip, và chưa đo route âm thanh/accessibility/performance trên thiết bị thật. Vì vậy GV5/GV7 còn mở; không coi luồng đã hoàn thiện.

Chi tiết theo gate, log kiểm và giới hạn: [VOICE_TEST_REPORT.md](VOICE_TEST_REPORT.md), [VOICE_PHASE_ROADMAP.md](VOICE_PHASE_ROADMAP.md), [VOICE_API_CONTRACT.md](VOICE_API_CONTRACT.md). Audio manifest và license: [tools/voice/README.md](../tools/voice/README.md), [LICENSES.md](../mobile/assets/voice/LICENSES.md).

## Kiểm lại lỗi mất meter ở lượt thứ hai — 14/10/2026

Source Expo Audio 57.0.5 cho thấy iOS lên lịch tắt audio session 100 ms sau khi player pause; tác vụ trễ chỉ kiểm tra player, không kiểm tra recorder. Player voice đã bật `keepAudioSessionActive: true` để tránh tác vụ đó tắt mic trong lúc chuyển từ câu trả lời sang lượt thu tiếp theo. Đây là nguyên nhân phù hợp với triệu chứng, chưa được xác nhận trên iPhone.

Reload the current Expo Go bundle, complete one voice question and hear its answer, then tap the mic again and ask “Có chuyện xưa nào ở đây không?”. Check that the meter moves and the linked answer arrives. If it still fails, note whether the dock stayed at “Đang bật micro…”, entered “Đang thu” with a flat meter, or showed an error; if STT mismatches, share the text from “Xem câu đã nhận dạng” and a screenshot. Do not send the recording. At this check, Metro `:8089/status` returned HTTP 200 but the iOS bundle request timed out, so reload will not fetch the fix until that preview serves a bundle.

### Bản bundle iPhone mới nhất — 14/10/2026

Metro LAN `exp://192.168.100.36:8089` hiện trả iOS bundle HTTP 200 (6,062,119 ký tự) chứa guard chờ 125 ms sau khi player đang chạy dừng, recorder metering options, `keepAudioSessionActive` và playback-intent guard. Bundle chưa chứa URL gateway `192.168.100.36:8788`, nên chỉ kiểm tra được phát → mic → meter; chưa gửi được STT/câu trả lời. Gateway `/health` trả HTTP 200.

Để kiểm lỗi lượt hai, reload bundle hiện tại trong Expo Go, phát một lời kể/câu trả lời đến khi đang nghe, rồi nhấn mic và xác nhận bộ đếm cùng meter có chạy. Không cần gửi bản ghi. Nếu meter vẫn phẳng, ghi lại trạng thái dock (đang bật micro/đang thu/lỗi) và thông báo hiển thị. Kiểm tra STT đầy đủ cần Metro được mở lại với URL gateway; lần thử khởi động Metro có biến môi trường trước đó bị công cụ từ chối, không tìm cách lách.

### Sửa trạng thái “Chưa kết nối máy nhận giọng nói” — 14/10/2026

Nguyên nhân đã xác nhận: gateway đang `ready` tại `http://192.168.100.36:8788/health`, nhưng Metro `:8089` được khởi chạy khi chưa có `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL`. Vì vậy bundle báo chưa cấu hình và không gửi STT dù gateway chạy. Đã tạo `mobile/.env.local` (Git bỏ qua) với URL LAN hiện tại; địa chỉ này cũng được xác nhận là IP Wi‑Fi của máy phát triển.

Trong terminal đang chạy Metro, nhấn `Ctrl+C`; từ thư mục `mobile`, chạy:

```powershell
npm start -- --clear --lan --port 8089 --go --max-workers 2
```

Expo tự nạp `.env.local` khi Metro khởi động. Sau đó mở lại `exp://192.168.100.36:8089` trong Expo Go và Reload. iPhone và máy phát triển phải ở cùng Wi‑Fi riêng tin cậy. Không cần khởi động lại gateway khi `/health` vẫn trả `ready`. Không dùng địa chỉ này trên mạng công cộng.

### Kiểm tra lại preview — 14/10/2026

Sau khi thêm `.env.local`, `npm run build:ios -- --no-bytecode` và `npm run build:android -- --no-bytecode` đều thành công: iOS `index-51a74f280fc4c08fed13fd3e5186e001.js` (1.073 modules) và Android `index-d3b5a0453325e2f8ffc34b488b03870f.js` (1.068 modules) đều chứa URL gateway. Gateway `/health` vẫn `ready`. Metro `:8089` đang phục vụ bundle thiếu URL và manifest bị timeout; một Metro khác cùng dự án tại `:8081` có manifest iOS HTTP 200 và bundle 6,068,958 byte chứa URL, `keepAudioSessionActive`, `playbackIntent` cùng recorder metering. Dùng `exp://192.168.100.36:8081` cho lần thử Expo Go kế tiếp; cần reload trên iPhone để xác nhận STT thực tế.

### Kết quả thử lại voice trên iPhone — 14/10/2026

Người dùng đã mở `exp://192.168.100.36:8089` trong Expo Go, reload và xác nhận lượt voice thứ hai liên tiếp có meter chạy, hiện transcript cùng câu trả lời đúng, đồng thời nghe được tiếng câu trả lời. Đây là xác nhận thực tế từ iPhone cho luồng thu giọng → nhận dạng → ghép Q&A → phát audio trong một chuỗi hai lượt. Chưa có transcript/log để đối chiếu độc lập.

Kiểm tra tại `mobile/`: `npm test` **161/161**, typecheck, lint và dependency check đều đạt. Người dùng xác nhận meter lượt hai chạy; chưa có transcript nguyên văn/log để đối chiếu độc lập. Lượt thử trước dùng `:8089` chưa thể đối chiếu với bundle đang phục vụ; candidate `:8081` đã được xác minh từ host nhưng cần reload/kiểm trên iPhone.

Việc còn lại: nghe tay/QC 34 clip, thử thêm lỗi mạng/quyền/hủy và các audio route trên iPhone, accessibility/performance, thử mic thật đủ sáu chương và lưu trace độc lập. Chưa đánh dấu GV7 hoặc toàn bộ Voice hoàn tất.

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
