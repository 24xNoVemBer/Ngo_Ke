# Đề xuất điều chỉnh Phase 1 — dự án mới từ đầu

**Trạng thái:** phạm vi fixture kỹ thuật/hoàn thiện Phase1 được người dùng duyệt bằng “anh đồng ý hoàn thiện phase 1 đi”, sau đề xuất sáu điểm mô phỏng. **Ngày:** 02/10/2026. Thực hiện ngay trong phiên theo yêu cầu; không thêm cửa duyệt cho cùng phạm vi đã chốt.

## Bối cảnh đã xác nhận

Người dùng xác nhận Ngõ Kể là dự án mới, không có source cũ; agent phải viết mã nguồn từ đầu. Shell Expo/React Native và bằng chứng Android emulator hiện có được giữ lại. Phase0/Phase1 đã được phép, Phase2–7/voice chưa được phép. Không yêu cầu người dùng tìm `public/core.js`, backend hoặc fixture gốc nữa.

Giả định sai nằm tại `TECH_DEMO_PLAN.md` phần bối cảnh/Stack, PRD T.02–T.04 và TechDesign phần hiện trạng/core/fixture/backend. Stack Expo + Node24/JSON API/SQLite, ranh giới demo/live và các cửa review vẫn giữ. Bổ sung này đề xuất cách xây mới, không thay nội dung/tiêu chí chưa được duyệt.

## Việc đề xuất làm tiếp trong Phase 1

1. Tạo **fixture ban đầu** tại `data/demo.json`, một nguồn duy nhất được bundle vào mobile.
2. Schema tối thiểu: `schemaVersion: 1`, `kind: "simulated"`, `disclaimer` là chuỗi không trống, `nodes` có đúng sáu `{id, name}` không trống, ID duy nhất. ID `demo-01`–`demo-06`; tên “Điểm demo 01”–“Điểm demo 06”. Không thêm dữ liệu cho thuật toán chưa được thiết kế.
3. Home đọc fixture qua adapter có kiểm tra shape, hiển thị danh sách điểm và trạng thái ready/error của demo. Live chưa cấu hình vẫn empty, không fallback.
4. Kiểm tra import JSON ngoài root mobile bằng Metro, export Android/iOS và runtime emulator. Thử thiếu/sai shape, chuyển mode và hoạt động từ bundle không gọi API. Ghi riêng điều kiện Expo Go cần tải bundle và thử điện thoại thật còn thiếu.
5. Bàn giao Phase1, cập nhật bằng chứng và dừng trước Phase2.

## Quyết định đã chốt

**Đã được người dùng đồng ý:** tạo sáu điểm kỹ thuật mô phỏng, tên trung tính “Điểm demo 01”–“Điểm demo 06”, ghi rõ không phải địa điểm thật. Chỉ dữ liệu đủ để review Home/schema; không câu chuyện, Q&A, tọa độ, ETA hoặc evidence giả.

Home chỉ hiển thị danh sách, chưa chọn/xác nhận điểm hoặc mở nội dung Q&A. Demo hợp lệ → ready; thiếu/sai schema/ID trùng → error không dataset. Live chưa cấu hình → empty không dataset kể cả khi được truyền fixture; không request/fallback. Data adapter nhận `unknown`; validation không thêm dependency. Nạp JSON bằng static import, không fetch.

## Các phase tiếp theo

- Phase2: viết mới normalization/alias/Q&A cố định; nội dung/evidence phải review, không LLM hoặc bịa chuyện lịch sử.
- Phase3: thiết kế và viết mới recommendation tối đa ba điểm theo rule được chốt.
- Phase4/5: camera/QR/2D/caption và GPS candidate/xác nhận theo plan.
- Phase6: tạo backend Node24 + JSON API + SQLite mới và nối live; schema/API cần thiết kế/review ở phase đó. Không triển khai backend trong Phase1 chỉ để lấp giả định cũ.
- Logic giữ một nguồn; không bắt buộc tạo `public/core.js`/web preview không có consumer. Chốt module dùng chung khi đến phase cần logic.

## Checklist quy trình điều chỉnh

- [x] Rà bối cảnh/source và nhận đính chính greenfield.
- [x] Ghi vị trí giả định cũ và giới hạn phase.
- [x] Đề xuất cách xây fixture kỹ thuật và lựa chọn dữ liệu thật.
- [x] Người dùng chốt fixture mô phỏng/schema tối thiểu trong đề xuất và yêu cầu hoàn thiện Phase1.
- [x] Ghi field/validation/expected checks cụ thể ở đây, nằm trong schema tối thiểu đã chốt.
- [x] Lập plan phần còn lại của Phase1; thực hiện inline theo yêu cầu hoàn thiện hiện tại và cách làm đã chọn trong phiên.
- [x] Coding/kiểm tra/bàn giao03/10: fixture/Home/tests20/20/native exports/emulator/offline sau nạp bundle đạt. G1 còn điện thoại thật/review; không tự mở phase sau. Báo cáo `agent_docs/phase_1_completion.md`.
