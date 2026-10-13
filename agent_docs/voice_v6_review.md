# Voice V6 — Intent và hành động theo ngữ cảnh

**Ngày:** 13/10/2026
**Trạng thái:** parser/actions/UI đã triển khai và test; nhận dạng các cách nói thật còn pending.
**Gate GV6:** logic tự động đạt; chưa đóng nghiệm thu giọng nói trên máy.

## Đã làm

- Thêm tập intent nhỏ: nghe/replay/stop, mở chương kế, mở Plan, hiển thị lựa chọn QR/GPS. Phân biệt câu hỏi thông tin với lệnh; câu trộn hỏi + lệnh yêu cầu người dùng chọn.
- Dùng chung `parseTopic`, `parseTimeBudget`, `pickPoints` và callbacks hiện có; Plan draft sống ở App qua navigation. Lựa chọn QR/GPS cần bấm CTA riêng trước khi mở luồng tương ứng.
- Hỗ trợ số Arabic/số tiếng Việt và slot giữ qua lượt; phủ phủ định, nhiều chủ đề, nhiều thời lượng, ngoài khoảng và tham chiếu “câu đầu tiên” chỉ khi option context/node/revision còn đúng.
- Thẻ action cho biết kết quả mô phỏng, không tuyên bố người dùng đã tới/ghé điểm. Nội dung hư cấu/điểm GPS mô phỏng vẫn giữ nhãn.

## Bằng chứng và giới hạn

- Source: `mobile/src/voice/intent.ts`, `mobile/src/recommendation/pick.ts`, `mobile/src/screens/QaScreen.tsx`, `mobile/App.tsx`.
- `mobile/tests/voiceIntent.test.mjs`, `mobile/tests/uiFlows.test.mjs`, `mobile/tests/recommendation.test.mjs`; toàn suite 122/122 đạt, typecheck/lint đạt.
- Đây là kiểm parser/UI với chuỗi test, không chứng minh ASR nhận tiếng Việt ngoài thực địa hay người dùng hiểu rõ thẻ hành động.

**Còn lại:** thử câu hỏi và lệnh bằng giọng trên thiết bị, nhất là phủ định/“chương kế là gì?”/“mở chương kế”/hai slot/số tiếng Việt; rà các trường hợp mơ hồ và cách người dùng hiểu CTA QR/GPS.
