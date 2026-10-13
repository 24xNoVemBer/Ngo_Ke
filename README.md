# Ngõ Kể

Ngõ Kể là ứng dụng native Android/iOS (Expo + React Native) để khám phá những câu chuyện trong ngõ qua lời kể, hỏi đáp và gợi ý trải nghiệm.

## Trải nghiệm hiện có

- Sáu điểm mô phỏng và câu chuyện hư cấu **“Bức thư cuối ngõ”**, gồm sáu chương và các câu hỏi, câu trả lời được biên soạn sẵn.
- Gợi ý điểm theo chủ đề và quỹ thời gian; luồng QR/GPS yêu cầu người dùng chủ động xác nhận.
- Voice theo kiểu nhấn để nói, nghe lời kể và hỏi tiếp; nội dung chữ có thể mở khi cần.

Các điểm, tọa độ và dữ liệu QR trong bản demo là mô phỏng. Câu chuyện là hư cấu, không phải tư liệu lịch sử. Ảnh chỉ dùng để minh họa.

## Chạy ứng dụng

```bash
cd mobile
npm ci
npm start -- --go
```

Quét mã Metro bằng Expo Go. Hướng dẫn chạy app, gateway voice và các lệnh kiểm tra nằm trong [mobile/README.md](mobile/README.md).

## Trạng thái Voice

Ứng dụng đã có giao diện voice native, recorder/player, catalogue audio và gateway STT dùng trong mạng phát triển. Luồng ghi âm → nhận dạng → trả lời chưa được nghiệm thu bằng lời nói trên điện thoại thật; kiểm thử iOS native và nghe duyệt thủ công toàn bộ clip cũng còn mở. Gateway preview hiện dùng HTTP không xác thực, chỉ dùng trên Wi‑Fi riêng tin cậy và không được mở ra Internet. Chi tiết và bằng chứng ở [báo cáo kiểm thử](docs/VOICE_TEST_REPORT.md) và [bàn giao](docs/VOICE_HANDOFF.md).

## Kiểm tra

```bash
cd mobile
npm test
npm run typecheck
npm run lint
npm run check:dependencies
```

## Tài liệu

| Tài liệu | Nội dung |
| --- | --- |
| [APP_FLOW.md](docs/APP_FLOW.md) | Luồng màn hình và điều hướng |
| [VOICE_PHASE_ROADMAP.md](docs/VOICE_PHASE_ROADMAP.md) | Phạm vi và tiêu chí nghiệm thu Voice |
| [VOICE_API_CONTRACT.md](docs/VOICE_API_CONTRACT.md) | Hợp đồng gateway STT |
| [VOICE_TEST_REPORT.md](docs/VOICE_TEST_REPORT.md) | Kết quả kiểm thử và phần còn mở |
| [VOICE_HANDOFF.md](docs/VOICE_HANDOFF.md) | Hướng dẫn mở bản preview |
| [mobile/README.md](mobile/README.md) | Cài đặt, chạy và kiểm tra ứng dụng |
| [tools/voice/README.md](tools/voice/README.md) | Tạo và kiểm tra catalogue audio |
| [IMAGE_SOURCES.md](docs/IMAGE_SOURCES.md) | Nguồn ảnh và ghi công |
