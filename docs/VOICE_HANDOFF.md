# Bàn giao Voice V0–V7 — Ngõ Kể

**Cập nhật:** 13/10/2026. APK đã build/cài/kiểm trên Android API 37 AVD; hash và endpoint dưới đây là trạng thái hiện tại.

## Mở bản thử Android/iOS

- APK: [app-release.apk](../mobile/android/app/build/outputs/apk/release/app-release.apk)
- Kích thước: 121,233,212 byte. SHA-256: `159EE52016DCC4F5B5B5C9DC697AB4FD20B0294D99B13A64CC74B5DED38F6D98`.
- Gateway STT local đang chạy, bind riêng máy dev tại `http://<DEV_LAN_IP>:8788`; `/health` trả HTTP 200. Điện thoại và máy dev cần cùng Wi‑Fi riêng; giữ gateway chạy khi thử mic.
- APK đã cài/mở trên AVD `Medium_Phone_API_37.0`. Submit qua recorder tới gateway; AVD không có lời nói nên nhận `NO_SPEECH`, không tạo câu trả lời. Ảnh [native no-speech state](../agent_docs/evidence/voice/android-avd-stt-no-speech-2026-10-13.png). Kiểm thử không thay cho lời nói từ điện thoại thật.
- Expo Go preview hiện chạy tại `exp://<DEV_LAN_IP>:8087`; Metro `/status` HTTP 200, iOS/Android bundles HTTP 200 (6,048,798 / 6,050,971 byte), có URL gateway. Mở Expo Go trên điện thoại cùng Wi‑Fi riêng rồi nhập URL này. Đây là JS preview, chưa phải native iOS build.
- Gateway và Metro chỉ dành cho mạng riêng tin cậy; không dùng Wi‑Fi công cộng, không port-forward/public expose.

Khởi động lại Metro nếu tiến trình dừng (PowerShell tại `<REPO_ROOT>\mobile`):

```powershell
$env:EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL = 'http://<DEV_LAN_IP>:8788'
npm start -- --lan --port 8087 --go
```

Không ghép `--offline` với `--lan`; nếu cổng 8087 đã được dùng, chọn cổng Metro khác và mở URL mới trong Expo Go.

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
