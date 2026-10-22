# Điều phối Home UI/UX, EN và voice — 23/10/2026

Codex chỉ điều phối, kiểm bằng chứng và tổng hợp; không tự triển khai các đầu việc lớn. Nguồn chuẩn là `docs/superpowers/plans/2026-10-23-home-uiux-en-voice-handoff.md` cùng các cập nhật trực tiếp của người dùng.

## Quyền và ranh giới hiện hành

- Đủ tiếng Anh cho bốn ngõ; giữ dữ kiện/câu rào/evidence, không đổi VI hoặc tạo lịch sử mới.
- Sinh bốn intro VI Nhật Phong và bốn intro EN Talia. Claude đã duyệt bản dịch EN theo ủy quyền người dùng, không còn gate chờ duyệt EN. Giữ `humanApproved:false` cho tới khi có nghe kiểm thực tế. Được sinh thẳng không dry-run; không in/commit khóa, không tự gọi lại paid request có kết quả chưa rõ. Giữ giới hạn bảo vệ của script mẫu theo plan.
- ToolDock đúng ba mục: GPS trái, QR nổi bật giữa, Sổ tay phải. Hộ chiếu chỉ trên header Landing và bỏ khỏi Sổ tay; nút chỉ biểu tượng, không chữ ở mọi fontScale, vùng chạm ≥44 pt, bắt buộc accessibilityLabel VI/EN và accessibilityRole="button". B6 sửa nhảy trên Landing trước khi vào ngõ, không đánh tráo thành chỉ kiểm Home.
- Người dùng yêu cầu bỏ mọi nhãn nguồn/demo/mô phỏng/giả định/chip nguồn/photo credit trong UI. Quyết định này thay quy tắc hiển thị nguồn cũ trong AGENTS; giữ evidence trong dữ liệu, không tự thêm policy hoặc nhãn khác.
- Không push, merge main, web/PWA, deploy hay restart Metro. Không in/đưa khóa vào báo cáo. Giữ WIP của các agent; Codex không sửa source FE/data/voice thay worker.
- Người dùng gọi Claude review cho đợt này: sau triển khai và QA, Codex tổng hợp rồi giao Claude kiểm độc lập, không sửa source và không nhận quyền điều phối.

## Baseline và run

- Baseline triển khai `1b7827f` (358 test của đợt trước). Chốt ba tài liệu Claude thành `921f255`, cập nhật quyền/layout/narration thành `45dea12`; đều commit cục bộ, chưa push.
- Run `run_56e095e0d983`, coordinator `term_9316c469-3aad-4c4b-9c6b-6b3bf6782fce`, generation 1.

## Phân công và bằng chứng hiện có

| Phần | Chủ sở hữu | Trạng thái |
| --- | --- | --- |
| A1 — EN JSON, registry/revisions, kiểm backend tạm | Luna `gpt-6-luna/xhigh` | `task_0526fd35cc0f` / retry `ctx_c5146f7dd062` hoàn tất: 360/360 test, typecheck/lint/diff sạch, bốn pair import/readback DB tạm đạt |
| A2/A3 — script, sinh VI, catalogue | Luna voice `gpt-6-luna/xhigh` | A2 script + 4 test offline hoàn tất; A3 lần đầu dừng vì thiếu key, 0 API. User đã lưu key, đang retry cùng task_1f4f52988446 để sinh VI |
| A4 — sinh EN theo dataset cuối | Luna voice | EN đã được phép sinh; giao sau A1 để bảo đảm đúng textHash/revision |
| B — Home/Landing/ToolDock/ổn định VI↔EN | Antigravity | Chờ A1 xong để chuyển ownership registry; dùng B3/B6 mới nhất |
| C — bỏ nhãn trong UI | Antigravity | Sau B, giữ dữ liệu và cơ chế error/loading/recovery |
| QA/E2E | Muse theo plan | Chưa khởi chạy thành công, xem bên dưới |
| Review cuối | Claude | Đã được người dùng gọi cho đợt này; chỉ giao sau triển khai và QA |

Muse của OpenCode không có trong danh sách `opencode models` hiện tại. Agent Muse riêng của Orca cũng không đạt `agent_readiness` trước timeout: `task_2ae1c34d4ede` / `ctx_f3141b246f4a`; receipt xác nhận terminal chưa nhận Task và cho phép release. Đã release đúng dispatch, archive captured, không tự retry hay đổi sang model khác. Đây không phải bằng chứng lỗi quota. Đã hỏi người dùng muốn dùng OpenCode `opencode/big-pickle` hiện có cho QA hoặc cấu hình Muse; chờ trả lời, không chặn các phần khác.

### A1 recovery — chỉ hoàn tất phần còn lại

Lần đầu đã tạo ba EN JSON mới và đầy đủ Trung Yên EN, registry/revisions, bỏ VI-only Home và cập nhật regression tests. Worker tự báo targeted 103/103, nhưng chưa chạy full suite/typecheck/lint, kiểm SQLite tạm, viết review report/copy đề xuất pendingCheck. Không ghi pass cho các việc đó.

Worker dùng sai handle bị ghép với suffix coordinator khi check mailbox, rồi thử nhánh coordinator `check --run`, nhận consumer_fenced và kết thúc turn không gửi worker_done. Root đã đọc receipt/log để xác nhận lỗi ID và final turn, stop đúng dispatch và release; WIP được giữ nguyên. Retry phải giữ các thay đổi hiện có, kiểm lại độ trung thành/intro exact/canonical revisions và hoàn tất các bước còn thiếu, không làm lại từ đầu, không sửa voice worker WIP. Luôn COPY NGUYÊN handle trong preamble hiện tại, không ghép ID, không dùng `check --run` ở worker.

## Kiểm chứng và phần còn chờ

Chưa nhận kết quả triển khai A/B/C hoặc QA của đợt mới; không kế thừa 358 test cũ làm kết quả mới. Mỗi agent phải báo source/test thực, lệnh và giới hạn. Không gọi bundle HTTP 200 hoặc kiểm cấu trúc fontScale là nghiệm thu trên thiết bị.

Voice worker lần đầu chưa sinh audio vì thiếu key; chỉ hoàn thiện A2 offline và báo đúng 0 API. Sau đó người dùng đã lưu key vào `.env.local` của worktree. Codex chỉ kiểm boolean xác nhận có giá trị không rỗng/không phải placeholder, không in giá trị. File đã được Git ignore. A3 được retry, chưa coi là có audio cho tới khi nhận báo cáo generation/audit.

Chưa kiểm thiết bị thật, tương phản thực, blur iOS/Android, fontScale 1.3/2.0, ToolDock ở chữ lớn, nhãn ghim dài và nghe voice. Backend chỉ được kiểm trên DB tạm, không ghi DB chính khi chưa có chỉ dẫn riêng.

## Việc người dùng

- Cần quyết: lựa chọn QA thay Muse hoặc cấu hình Muse hoạt động lại. Gate duyệt EN cũ đã được gỡ theo cập nhật trực tiếp, không hỏi lại.
- Cấu hình khóa thiếu ban đầu **[ngoài plan]** đã được người dùng xử lý bằng `.env.local`, không còn chặn generation. Không gửi giá trị trong chat hoặc báo cáo.
- Cần tự làm trong plan: nghe audio khi đã sinh; thử điện thoại về bố cục/đổi ngôn ngữ/chữ lớn; chọn ảnh và khảo sát địa chỉ/giờ mở cửa khi có điều kiện. Những việc này chưa được coi là hoàn tất.
