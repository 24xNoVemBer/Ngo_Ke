# Product Requirements — Ngõ Kể

> Bản build-facing của [PRD](../docs/PRO-NgoKe-MVP.md); [plan](../docs/TECH_DEMO_PLAN.md) là nguồn chuẩn. Nội dung tóm tắt không thay tiêu chí nghiệm thu đầy đủ. G0 đã được người dùng duyệt; Phase 1 được phép dựng khung trước nhưng G1 chưa đạt đầy đủ. Phase 2 trở đi chưa được duyệt. Bằng chứng code: [phase_1_review.md](phase_1_review.md).

## User stories — nguyên văn PRD mục 2

PRD chưa chỉ định primary story. Giữ đủ năm story, không tự chọn thứ tự ưu tiên mới.

| Nhóm tính năng bắt buộc | User story | Phase / mã |
| --- | --- | --- |
| App native và nguồn demo/live | Là người dùng demo, tôi muốn mở app trên điện thoại và dùng fixture local để trải nghiệm luồng demo. | 1, 6, 7; R1.01–R1.03, R6.01–R6.04, R7.01–R7.03 |
| Giới thiệu và Q&A cố định | Tôi muốn chọn hoặc nhập câu hỏi để nhận câu trả lời đã soạn, có nguồn và câu hỏi tiếp theo. | 2; R2.01–R2.04 |
| Chủ đề, thời gian và gợi ý điểm | Tôi muốn chọn sở thích/quỹ thời gian để xem tối đa ba điểm cùng lý do và thời lượng mô phỏng. | 3; R3.01–R3.03 |
| QR, camera và người kể | Tôi muốn xác nhận điểm bằng QR hoặc chọn tay rồi xem lời kể qua người kể 2D và caption. | 4; R4.01–R4.05 |
| GPS có xác nhận | Tôi muốn xem điểm GPS gợi ý và tự xác nhận hoặc chọn lại trước khi app đổi điểm. | 5; R5.01–R5.03 |

**Must-have — nguyên văn danh sách JSON của PRD:**

1. Native Expo/RN Android+iOS; fixture offline và live tách biệt
2. Giới thiệu và Q&A cố định có nguồn, alias và hỏi tiếp
3. Chủ đề/quỹ thời gian; tối đa ba điểm với lý do và ETA mô phỏng
4. QR/chọn tay; người kể 2D placeholder và caption trên camera
5. GPS chỉ gợi ý; người dùng xác nhận điểm

**Nice-to-have:** danh sách rỗng. Không tự bổ sung; voice có gate riêng sau core.

## Truy vết triển khai và cửa review

| Phase | Yêu cầu | Hành vi / nghiệm thu tóm tắt | Gate |
| --- | --- | --- | --- |
| 0 | R0.01–R0.03 | Chốt luồng, ranh giới, hợp đồng mobile/API/data; duyệt trước tạo native project. Chưa viết app. | G0 |
| 1 | R1.01–R1.03 | Expo Android/iOS; navigation/screen skeleton, Home fixture, mode demo/live, safe areas/one-hand. Chạy trên ít nhất một điện thoại; có dependency check và ảnh để review cấu trúc. | G1 |
| 2 | R2.01–R2.04 | Intro node đầu, chip/nhập chữ, normalization/alias, nguyên đáp án + nguồn, 1–2 follow-up. Unknown/thiếu evidence báo chưa có dữ liệu; review nội dung/nhánh trước recommendation. | G2 |
| 3 | R3.01–R3.03 | Ẩm thực/chuyện xưa/khám phá tự do + quỹ thời gian/input ngắn; logic hiện có → tối đa ba điểm + lý do/ETA. Thiếu điểm/thời gian có trạng thái; test interest, budget, visited, unavailable, unreachable. | G3 |
| 4 | R4.01–R4.05 | Camera theo thao tác và dừng khi rời màn; QR node đã biết; 2D/caption dùng lại text Phase 2; denied/QR lạ → tay/chữ. Thử Android và iPhone nếu có; review overlay. | G4 |
| 5 | R5.01–R5.03 | Bấm GPS → một candidate/accuracy/khoảng cách khi có; “có thể là…”, xác nhận/chọn lại. Denied/kém/ngoài cụm/nhầm không tự đổi node. Review trước thực địa; nhóm data khảo sát tọa độ Ao Sen. | G5 |
| 6 | R6.01–R6.04 | Endpoint hiện có + URL môi trường, shape/nguồn, empty/error/timeout; live không fixture fallback. Demo độc lập API/key/server; handoff B/C; review trước gắn data thật/hi-fi. | G6 |
| 7 | R7.01–R7.03 | Đóng băng scope, lặp luồng fixture offline, hồi quy fallback/mode/Q&A/bàn phím/chữ; log/ma trận thiết bị, README/handoff A/B/C; người dùng chốt demo. | G7 |
| Voice riêng | RV.01–RV.03 | Sau core và duyệt riêng + chọn connector/giọng. TTS/STT vẫn dùng Q&A cố định, fallback chữ; báo engine/thiết bị/giới hạn. | GV |

Hợp đồng T.01–T.07: native Expo/RN; Node 24/API/SQLite; core dùng chung có gate Metro/runtime; fixture bundle; live đã review; camera/GPS theo thao tác; chỗ thay data/UI và nối voice sau gate. Chi tiết: PRD mục 7 và [tech_stack.md](tech_stack.md).

## Không nằm trong MVP — nguyên văn ranh giới PRD mục Out of Scope

| Mã | Ranh giới |
| --- | --- |
| X.01 | Chatbot sinh câu trả lời, LLM, tự bịa chuyện. |
| X.02 | Chỉ đường rẽ theo rẽ, theo dõi nền, chỉ dẫn GPS thời gian thực. |
| X.03 | AR neo vật thể, model 3D, animation khuôn miệng, nhận diện công trình, thiết kế mascot sâu. |
| X.04 | Nhận dạng biển hiệu tự do/OCR. |
| X.05 | Hoàn thiện UI hi-fi. |
| X.06 | Voice tích hợp sớm. |
| X.07 | Dùng web/PWA làm deliverable mobile. |
| X.08 | API ghi data từ điện thoại. |
| X.09 | Tự tạo/push remote, deploy hoặc phát hành store build. |

Không mặc định đưa mục ngoài scope vào v2. Voice sau core vẫn cần duyệt riêng; AR/3D chưa có phase.

## Success metrics — đủ sáu chỉ dấu PRD mục 10

| Chỉ dấu | Phase | Mục tiêu / bằng chứng |
| --- | --- | --- |
| Native chạy được | 1; tổng hợp 7 | Ít nhất một Android hoặc iPhone thao tác bằng Expo Go; lệnh/check/ảnh và trạng thái từng platform. |
| Q&A đúng phạm vi | 2; hồi quy 7 | Exact/alias đúng nguyên đáp án, unknown/thiếu evidence không bịa, nguồn demo rõ, 1–2 follow-up hợp lệ; ca R2.02–R2.04. |
| Gợi ý có giải thích | 3; hồi quy 7 | Tối đa ba điểm có lý do/thời lượng mô phỏng; hoàn tất chuyện xưa/ẩm thực; ca R3.01–R3.03. |
| Xác nhận đúng và có fallback | 4–5; hồi quy 7 | QR đúng node; GPS không tự xác nhận; camera/GPS/QR lỗi vẫn manual; log ca denied/lạ/kém/ngoài cụm/nhầm. |
| Offline và ranh giới live | 6–7 | Demo Q&A/gợi ý không mạng/key/server; live rỗng/lỗi không đổi demo; ca R6.02–R6.03. |
| Core demo end-to-end | 7 | Lặp đầy đủ R7.01; log/ma trận thiết bị và người dùng review; báo phần chưa kiểm chứng. |

## UX, timeline và thông tin chưa xác định

UI demo chức năng, native, safe areas, thao tác một tay; 2D placeholder/caption được review. Palette/font/layout chi tiết/chuẩn accessibility định lượng chưa xác định. Không thêm welcome/account/profile hoặc KPI thương mại.

Budget/deadline/owner chi tiết chưa xác định. Timeline là thứ tự Phase 0–7 và voice riêng; câu hỏi Q.01–Q.11 của PRD/TD-Q01–TD-Q13 của Tech Design giải quyết ở phase cần tới, không tự lấp bằng giả định.
