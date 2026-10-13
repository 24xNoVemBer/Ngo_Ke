# Bàn giao Voice V0–V7 — Ngõ Kể

**Cập nhật:** 14/10/2026. Người dùng xác nhận lượt voice đầu trên iPhone có câu trả lời; lượt hai mất meter và lỗi. Native recorder start hiện đợi tối đa 1 giây để xác nhận trạng thái thật; answer playback cũ cũng bị bỏ khi mic lượt mới đã bắt đầu. Lượt retest sau sửa vẫn cần thực hiện trên iPhone. `npm test` 152/152, typecheck/lint và iOS + Android JS exports đạt; iOS Metro bundle trả HTTP 200 với cả hai guard. Metro `8090` và gateway `8788` đang chạy tại `192.168.100.36`. APK lưu trong thư mục build (SHA-256 `20154EE9B845396E43ED7F76AAD5AFD9C3639A870E017D23FF670E469E531773`) có trước thay đổi JS mới; dùng Expo Go preview bên dưới để thử bản mới.

## Mở bản thử Android/iOS

- Preview LAN hiện tại: `exp://192.168.100.36:8090`. Metro đã được mở với `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL=http://192.168.100.36:8788`; iOS và Android exports mới đều thành công. Nếu IP đổi, khởi động lại Metro và cập nhật biến môi trường theo lệnh bên dưới.

- APK: [app-release.apk](../mobile/android/app/build/outputs/apk/release/app-release.apk)
- Kích thước: 121,235,376 byte. SHA-256: `20154EE9B845396E43ED7F76AAD5AFD9C3639A870E017D23FF670E469E531773`.
- Gateway STT local đang chạy, bind riêng máy dev tại `http://<DEV_LAN_IP>:8788`; `/health` trả HTTP 200. Điện thoại và máy dev cần cùng Wi‑Fi riêng; giữ gateway chạy khi thử mic.
- APK đã cài/mở trên AVD `Medium_Phone_API_37.0`. Submit qua recorder tới gateway; AVD không có lời nói nên nhận `NO_SPEECH`, không tạo câu trả lời. Ảnh [native no-speech state](../agent_docs/evidence/voice/android-avd-stt-no-speech-2026-10-13.png). Kiểm thử không thay cho lời nói từ điện thoại thật.
- Preview đang phục vụ tại `exp://<DEV_LAN_IP>:8090`; `/status` là running và gateway URL trỏ tới `:8788`. Người dùng đã xác nhận lượt đầu hoạt động nhưng báo lượt thứ hai lỗi; cần reload preview và retest cả hai lượt trên iPhone cùng Wi‑Fi. Nếu Metro dừng, khởi động lại theo lệnh dưới đây, thay `<DEV_LAN_IP>` bằng IP LAN hiện tại của máy dev:
- Gateway và Metro chỉ dành cho mạng riêng tin cậy; không dùng Wi‑Fi công cộng, không port-forward/public expose.

Khởi động lại Metro nếu tiến trình dừng (PowerShell tại `<REPO_ROOT>\mobile`):

```powershell
$env:EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL = 'http://<DEV_LAN_IP>:8788'
npm start -- --lan --port 8090 --go --max-workers 2
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

Preview LAN mới: `exp://192.168.100.36:8090` (cổng 8089 đang treo). Gateway `http://192.168.100.36:8788/health` đang ready. Bundle iOS đã xác nhận HTTP 200 và có code kiểm tra `recorder.isRecording` ngay sau lệnh native start.

Mở URL mới trong Expo Go, hoàn thành một câu hỏi để nghe trả lời, rồi chạm mic lần hai. Khi thấy đang thu, nói “Có chuyện xưa nào ở đây không?” và kiểm tra meter có nhúc nhích, câu trả lời có đúng không. Nếu native start thất bại, app sẽ báo micro chưa thu được để thử lại thay vì tiếp tục với clip rỗng. Nếu vẫn lỗi, gửi ảnh trạng thái và nội dung trong “Xem câu đã nhận dạng”; không gửi file ghi âm.
