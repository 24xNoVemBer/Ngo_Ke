# Voice V6 — Intent và hành động theo ngữ cảnh

## Recheck phủ định, slot mơ hồ và câu hỏi khi Plan đang mở — 14/10/2026

- Câu hỏi như “Chương kế là gì?” giờ vẫn đi vào Q&A khi đang thu thập Plan.
- Parser dùng chung `hasTopicNegation` để bắt phủ định đã chuẩn hóa (`không`, bỏ qua, tránh, loại trừ, đừng chọn), kể cả “không đi ẩm thực” và “không, 30 phút”; “không gian” vẫn là danh từ dương.
- AVD API 37 tái hiện thêm lỗi ở ô nhập tay Plan: câu “Không đi ẩm thực trong 30 phút” bị `parseTopic` nhận thành ẩm thực và giữ picks cũ. `parseTopic` giờ từ chối chủ đề bị phủ định; Plan xóa topic cũ, giữ thời lượng và yêu cầu chọn lại. AVD chạy APK release mới cho cùng thao tác không còn hiện picks ẩm thực; draft còn `budgetMinutes: 30`.
- Nhiều chủ đề/thời lượng, giá trị ngoài khoảng và câu không nhận ra slot nào tiếp tục xóa các giá trị cũ liên quan để tránh picks lỗi thời.
- Regression mới ở `recommendation.test.mjs` và `uiFlows.test.mjs`, cùng voice intent tests; toàn suite 165/165, typecheck/lint/Expo dependency check đạt.
- Screenshot AVD: `agent_docs/evidence/voice/android-emulator/android37-release-negated-plan-result-2026-10-14.png`. Đây là kiểm nhập chữ/UI logic trên emulator, không phải speech, âm thanh hay microphone hardware.
- Đây vẫn là kiểm logic bằng transcript điều khiển; cách nói thật qua mic và mức dễ hiểu của thẻ Plan còn chờ kiểm trên thiết bị.

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

## Screen regression question vs command — 14/10/2026

- QaScreen test confirms “Chương kế là gì?” and “Điểm kế tiếp là điểm nào?” do not change chapter; explicit “Mở chương kế” selects the next available chapter.
- UI-flow tests pass 24/24; full suite passes 146/146; typecheck and lint pass. Transcript input is controlled, so actual Vietnamese speech recognition and user comprehension still need device testing.
