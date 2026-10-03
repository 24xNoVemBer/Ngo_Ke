# Project Brief — Ngõ Kể

> Nguồn: [plan](../docs/TECH_DEMO_PLAN.md), [PRD](../docs/PRO-NgoKe-MVP.md) mục 1–3, 6, 10–11. Phase 0 đã được người dùng duyệt; Phase 1 bàn giao khung, chưa đạt đủ G1. Trạng thái code: [phase_1_review.md](phase_1_review.md).

## Sản phẩm và người dùng

- **One-line vision:** Demo native khám phá con ngõ qua Q&A cố định, gợi ý điểm và người kể 2D/caption trên camera.
- **Mục tiêu:** review một luồng chức năng hoàn chỉnh bằng fixture offline; đây là phần Tech của người A, không phải kế hoạch phát hành thương mại.
- **Target users:** người muốn nghe giới thiệu về con ngõ, hỏi về nơi đó, chọn trải nghiệm ẩm thực/chuyện xưa/khám phá tự do và nhận gợi ý điểm theo quỹ thời gian.
- **Persona, nghiên cứu thị trường, doanh thu:** chưa xác định; không bổ sung giả định.

PRD không chọn một story duy nhất là “primary”. Story mở luồng được trích nguyên văn: **“Là người dùng demo, tôi muốn mở app trên điện thoại và dùng fixture local để trải nghiệm luồng demo.”** Các story còn lại ở [product_requirements.md](product_requirements.md).

## Phạm vi

**Must ship:** native Expo/RN Android+iOS; fixture offline/live tách biệt; giới thiệu và Q&A có nguồn/alias/hỏi tiếp; chủ đề/quỹ thời gian và tối đa ba điểm; QR/chọn tay; camera với người kể 2D + caption; GPS candidate cần xác nhận. Chỉ làm mục thuộc phase được duyệt.

**Not in v1:** LLM, dẫn đường/tracking nền, AR/3D/lip-sync/OCR, UI hi-fi, voice trong core, web/PWA thay native, API ghi từ mobile, tự push remote/deploy/store. Voice là phase riêng sau core, không phải nice-to-have nếu còn thời gian.

## Luồng demo

Giới thiệu → chọn/nhập câu hỏi → đáp án có nguồn và hỏi tiếp → chọn chủ đề/quỹ thời gian → tối đa ba điểm có lý do/ETA mô phỏng → xác nhận điểm → xem lời kể → hỏi tiếp.

QR hợp lệ xác nhận node đã biết. GPS chỉ đưa một gợi ý để xác nhận/chọn lại. Từ chối camera hoặc QR lạ vẫn dùng được chọn tay và chữ. Sơ đồ đầy đủ: PRD mục 3.

## Nguyên tắc thiết kế và hoàn tất

- UI **demo chức năng**, component native, safe areas, thao tác một tay; placeholder có chủ đích, nhóm UI có thể thay sau.
- Palette, font, mascot asset, layout chi tiết và chuẩn accessibility định lượng chưa xác định; không tự chốt hi-fi.
- Nội dung có evidence đã review; không bịa đáp án. Sáu node/ETA/tọa độ fixture là mô phỏng, không dùng đi thực địa.
- Báo Android/iOS và phần chưa thử riêng; web preview không nghiệm thu native. Thành công đo bằng hành vi + bằng chứng review, không tự thêm KPI kinh doanh.
- Timeline chỉ có thứ tự Phase 0–7; deadline/ngân sách chưa xác định. Một phase mỗi lần, báo cáo rồi dừng chờ duyệt.
