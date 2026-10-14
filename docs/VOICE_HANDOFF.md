# Bàn giao Voice V0–V7 — Ngõ Kể

## Trạng thái mới nhất — lỗi lượt voice thứ hai, 14/10/2026

Lượt đầu trên iPhone trả lời nhưng lượt hai mất meter. Code review cho thấy `stopPlayback()` chờ một hàm pause trả ngay, tạo khả năng race giữa playback đang lặp và audio mode ghi âm. App hiện chờ trạng thái native `player.playing === false` tối đa 1 giây trước khi mở recorder; nếu không dừng được thì không thu và hiện hướng dẫn thử lại. Auto-play câu trả lời đợi xác nhận dừng. `npm test` 153/153, typecheck/lint và iOS JS export đạt. Chưa retest trên iPhone; bản export không phải IPA.

Gateway `http://192.168.100.36:8788/health` đang ready. Metro `:8087` không trả `/status`, `:8089` và `:8090` đã dừng; chưa có Expo Go preview mới. Android release đã build thành công lại (377 tasks; 26 executed/351 up-to-date). APK [app-release.apk](../mobile/android/app/build/outputs/apk/release/app-release.apk) 121,244,432 byte, SHA-256 `8C41CFF27756C014244BE47A74440CB18A3CECE982AE39CAFC4045901F0292D0`, cài/mở trên AVD API 37; log gần nhất không có fatal/ReactNativeJS error. AVD không thu/gửi lời nói và không thay cho iPhone test.

**Build follow-up:** after the recorder-stop UI and regression test were included, the final count is 154/154. Android release APK is 121,244,632 byte, SHA-256 `E0680D8A78513442364687AC084AE8809F66BB69BD9A6631A8815A7DF5A0AB47`; it is installed/launched on the API 37 AVD. This remains emulator proof only.

The earlier status paragraph below records the previous pause implementation and is superseded by this update.

**Cập nhật:** 14/10/2026. Người dùng báo lượt đầu trên iPhone chạy, lượt hai lỗi và mất meter. Đường dừng answer loop nay chỉ tắt loop rồi pause; mic không chờ callback tua của player. Phát lại chủ động vẫn tua về đầu. `npm test` 152/152, typecheck/lint, iOS JS export và Android release build đạt. APK 121,243,192 byte (SHA-256 `C21ACE29D356F779A16219CCA8AEE75527B805B983F90B8B13A3C15A0751CA0C`) đã cài/mở trên Android API 37 AVD; không thấy fatal log. Gateway `8788` ready. Chưa retest lượt hai trên iPhone.

## Mở bản thử Android/iOS

- Để chạy preview mới trên iPhone, mở PowerShell tại `mobile` và chạy lệnh bên dưới; URL dự kiến là `exp://192.168.100.36:8089`. Metro cũ báo `/status` đang chạy nhưng không giao bundle iOS trong 60–90 giây, nên chưa xác nhận link nào đang phục vụ JS mới. Gateway `http://192.168.100.36:8788/health` hiện ready.

- APK: [app-release.apk](../mobile/android/app/build/outputs/apk/release/app-release.apk)
- Kích thước: 121,243,192 byte. SHA-256: `C21ACE29D356F779A16219CCA8AEE75527B805B983F90B8B13A3C15A0751CA0C`.
- Gateway STT local đang chạy, bind riêng máy dev tại `http://<DEV_LAN_IP>:8788`; `/health` trả HTTP 200. Điện thoại và máy dev cần cùng Wi‑Fi riêng; giữ gateway chạy khi thử mic.
- APK mới đã cài/mở trên AVD `Medium_Phone_API_37.0`; build này chỉ được xác nhận khởi chạy, chưa gửi câu nói từ AVD. Ảnh màn mở app: [android37-native-release-second-turn-fix-2026-10-14.png](../agent_docs/evidence/voice/android-emulator/android37-native-release-second-turn-fix-2026-10-14.png). Kiểm thử không thay cho lời nói từ điện thoại thật.
- Người dùng xác nhận lượt đầu trên iPhone hoạt động nhưng báo lượt hai lỗi. Metro cũ trên `8087` báo `/status` running nhưng bundle iOS không trả trong 60 giây; `8089` và `8090` đã dừng. Khởi động preview theo lệnh dưới đây rồi retest cả hai lượt trên iPhone cùng Wi‑Fi.
- Gateway và Metro chỉ dành cho mạng riêng tin cậy; không dùng Wi‑Fi công cộng, không port-forward/public expose.

Khởi động lại Metro nếu tiến trình dừng (PowerShell tại `<REPO_ROOT>\mobile`):

```powershell
$env:EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL = 'http://<DEV_LAN_IP>:8788'
npm start -- --lan --port 8089 --go --max-workers 2
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

Gateway `http://192.168.100.36:8788/health` đang ready. Để nạp code mới, chạy lệnh Metro ở trên tại `mobile`, mở `exp://192.168.100.36:8089` trong Expo Go, rồi reload. iOS export thành công nhưng Metro cũ không giao bundle; chưa có preview live được xác minh.

Mở URL mới trong Expo Go, hoàn thành một câu hỏi để nghe trả lời, rồi chạm mic lần hai. Khi thấy đang thu, nói “Có chuyện xưa nào ở đây không?” và kiểm tra meter có nhúc nhích, câu trả lời có đúng không. Nếu native start thất bại, app sẽ báo micro chưa thu được để thử lại thay vì tiếp tục với clip rỗng. Nếu vẫn lỗi, gửi ảnh trạng thái và nội dung trong “Xem câu đã nhận dạng”; không gửi file ghi âm.
