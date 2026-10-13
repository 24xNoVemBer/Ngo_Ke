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
npm start -- --lan --port 8087 --go
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

Android đã được build và mở trên emulator API 37; upload clip tới gateway và các kiểm tra hợp đồng/định dạng đã chạy. Emulator không cung cấp lời nói nên chưa xác nhận được toàn luồng giọng nói thật → transcript → Q&A. iOS native, thử trên điện thoại thật và nghe duyệt thủ công toàn bộ audio còn mở. Xem [VOICE_TEST_REPORT.md](../docs/VOICE_TEST_REPORT.md) để biết kết quả mới nhất và phần chưa kiểm.

## Mã nguồn và tài liệu

- `src/screens/`: các màn hình ứng dụng; `src/components/`: thành phần giao diện.
- `src/voice/`: recorder, yêu cầu STT và quản lý vòng đời voice.
- `src/qa/`: chuẩn hóa câu hỏi và khớp Q&A cố định; không sinh câu trả lời bằng LLM.
- `../data/demo.json`: nguồn dữ liệu demo; cấu trúc và quy ước ở [data/README.md](../data/README.md).
- [APP_FLOW.md](../docs/APP_FLOW.md): luồng màn hình.
- [VOICE_PHASE_ROADMAP.md](../docs/VOICE_PHASE_ROADMAP.md): phạm vi và tiêu chí nghiệm thu Voice.
- [VOICE_API_CONTRACT.md](../docs/VOICE_API_CONTRACT.md): API gateway STT.
- [IMAGE_SOURCES.md](../docs/IMAGE_SOURCES.md) và [LICENSES.md](assets/voice/LICENSES.md): ghi công ảnh và license audio.
