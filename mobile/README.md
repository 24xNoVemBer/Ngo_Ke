# Ngõ Kể — ứng dụng mobile

Ứng dụng Expo + React Native cho Android và iOS. Dữ liệu điểm, tọa độ và QR hiện là mô phỏng; **“Bức thư cuối ngõ”** là câu chuyện hư cấu, không phải tư liệu lịch sử.

## Chạy giao diện

```powershell
cd mobile
npm ci
npm start -- --go
```

Quét mã Metro bằng Expo Go trên thiết bị cùng mạng với máy phát triển. Lệnh trên chạy giao diện; để thử nhận dạng giọng nói, cần khởi động gateway theo mục dưới đây.

## Preview Voice trong mạng phát triển

Voice dùng recorder/player native và gateway STT chạy riêng bằng Node.js 24. Làm theo [hướng dẫn cài model và tạo audio](../tools/voice/README.md) trước lần chạy đầu.

Mở hai terminal:

```powershell
# Terminal 1 — tại thư mục gốc repo
node tools/voice/gateway/server.mjs
```

```powershell
# Terminal 2 — tại thư mục mobile
$env:EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL = 'http://<DEV_LAN_IP>:8788'
npm start -- --lan --port 8089 --go --max-workers 2
```

Thay `<DEV_LAN_IP>` bằng địa chỉ LAN hiện tại của máy chạy gateway. Điện thoại và máy phát triển phải ở cùng Wi‑Fi riêng tin cậy. Gateway preview dùng HTTP, không xác thực và không phù hợp để mở ra Internet hoặc Wi‑Fi công cộng. Xem [VOICE_HANDOFF.md](../docs/VOICE_HANDOFF.md) để biết cách mở APK/preview, kiểm tra gateway và các giới hạn.

Trong app, vào Demo, chọn chương, nhấn mic để thu, rồi nhấn **Gửi**; **Hủy** hoặc Back kết thúc lượt. Chip gợi ý không tự bật tiếng. Gateway và Metro phải đang chạy để thử STT; giao diện, dữ liệu demo và audio đóng gói vẫn có thể xem khi offline.

## Kiểm tra và build

Chạy từ thư mục `mobile/`:

```bash
npm test
npm run typecheck
npm run lint
npm run check:dependencies
```

`npm run build:android` và `npm run build:ios` chỉ xuất JavaScript/Hermes bundle; chúng không tạo APK/IPA hay phát hành ứng dụng. Build native bằng `npm run android` hoặc `npm run ios` trên môi trường tương ứng. iOS native cần macOS và hiện chưa được nghiệm thu.

## Trạng thái kiểm chứng

Android đã được build và mở trên emulator API 37; lượt mic nói thật trên iPhone vẫn cần retest. Ngày 14/10, bộ test đạt 152/152, typecheck/lint, iOS JS export và Android release build đều đạt. UI regression phủ 21 Q&A cùng một follow-up mỗi câu; transcript kiểm thử không thay thế STT/mic thật. Người dùng báo lượt đầu trên iPhone chạy nhưng lượt hai mất meter rồi lỗi. Player giờ tắt loop và pause trước khi chuẩn bị mic, không chờ native seek; phát lại chủ động vẫn tua trước khi chạy. APK mới mở được trên AVD, SHA-256 `C21ACE29D356F779A16219CCA8AEE75527B805B983F90B8B13A3C15A0751CA0C`. Metro cần được khởi động lại thủ công theo lệnh trên; gateway `8788` ready. Chưa retest hai lượt trên iPhone; export không phải IPA, các luồng iOS còn lại, kiểm tra audio/accessibility và nghe duyệt thủ công toàn bộ audio vẫn mở. Xem [VOICE_TEST_REPORT.md](../docs/VOICE_TEST_REPORT.md) để biết kết quả mới nhất và phần chưa kiểm.

## Mã nguồn và tài liệu

- `src/screens/`: các màn hình ứng dụng; `src/components/`: thành phần giao diện.
- `src/voice/`: recorder, yêu cầu STT và quản lý vòng đời voice.
- `src/qa/`: chuẩn hóa câu hỏi và khớp Q&A cố định; không sinh câu trả lời bằng LLM.
- `../data/demo.json`: nguồn dữ liệu demo; cấu trúc và quy ước ở [data/README.md](../data/README.md).
- [APP_FLOW.md](../docs/APP_FLOW.md): luồng màn hình.
- [VOICE_PHASE_ROADMAP.md](../docs/VOICE_PHASE_ROADMAP.md): phạm vi và tiêu chí nghiệm thu Voice.
- [VOICE_API_CONTRACT.md](../docs/VOICE_API_CONTRACT.md): API gateway STT.
- [IMAGE_SOURCES.md](../docs/IMAGE_SOURCES.md) và [LICENSES.md](assets/voice/LICENSES.md): ghi công ảnh và license audio.
