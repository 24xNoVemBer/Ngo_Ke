# Setup Review — Ngõ Kể

**Ngày:** 02/10/2026. **Phạm vi:** chuẩn hóa thiết lập agent Part 4. **Phase:** 0 — chờ review; implementation approved: false.

> **Snapshot lịch sử của lượt thiết lập tài liệu.** Sau đó người dùng đã duyệt G0/Phase 1 và cho phép dựng khung trước khi có source. Trạng thái hiện hành ở `MEMORY.md` và [phase_1_review.md](phase_1_review.md); các câu “chưa bắt đầu” dưới đây mô tả thời điểm snapshot, không thu hồi quyền Phase 1.

## Nguồn và mức độ áp dụng template

- Đã đọc ba nguồn: [TECH_DEMO_PLAN.md](../docs/TECH_DEMO_PLAN.md), [PRO-NgoKe-MVP.md](../docs/PRO-NgoKe-MVP.md), [TechDesign-NgoKe-MVP.md](../docs/TechDesign-NgoKe-MVP.md).
- Workspace không có `/templates/`, context pack hoặc output do CLI đã cài. Template Part 4 trong yêu cầu có các mẫu default `agent_docs/`; dùng các mục đó và nội dung nguồn để chuẩn hóa bản hiện có.
- `AGENTS.md`/`MEMORY.md` là bản hướng dẫn dự án theo yêu cầu, **không phải bản copy template gốc đã xác minh**. `REVIEW-CHECKLIST.md` là checklist theo gate của plan, không khẳng định copy “as-is”. Muốn đối chiếu nguyên văn workflow template cần cung cấp nguồn template/context pack; không chạy `npx vibeworkflow init` để tự cài skills/dependency.
- Tám file thiết lập đã có được chỉnh tại chỗ; thêm file review này. Không đổi tên hoặc ghi đè ba tài liệu `docs/`; hướng dẫn toàn cục và `.opencode/` được giữ nguyên.

## Điểm lệch và cách xử lý

| Điểm | Bằng chứng | Xử lý trong bộ thiết lập |
| --- | --- | --- |
| Tên PRD khác đường dẫn được nguồn nhắc | File thực là `docs/PRO-NgoKe-MVP.md`; Tech Design mục Sources/References/Handoff nhắc `PRD-NgoKe-MVP.md` | Link dùng tên thực. Ghi nhận sai khác; không tự rename hoặc sửa nguồn |
| Chỉ dẫn không cấu hình agent của lượt trước | Tech Design Development Workflow/Next allowed action nói chưa tạo config agent hoặc tự chuyển Part 4 | Yêu cầu mới của người dùng cho phép thiết lập/sửa hướng dẫn Part 4 trong Phase 0; không cấp quyền mobile hoặc CI |
| Công cụ coding còn chưa xác định trong nguồn | PRD/Tech Design Handoff và MEMORY cũ | Ghi OpenCode theo phiên đang dùng; trình độ A/B/C vẫn chưa xác định, không suy từ “người A” |
| Duyệt Phase 0 và quyền coding dễ bị trộn | AGENTS cũ ghi “duyệt plan, chưa phải duyệt code” nhưng roadmap dẫn sang Phase 1 | Làm rõ cần cho phép Phase 1 tường minh; một lần duyệt không mở mọi phase. Gate hiện vẫn chờ review |
| Kiến trúc/ví dụ bị diễn đạt như code đã có | Code Patterns cũ có hàm `requireDataset`/`coreBridge.matchQuestion` chưa xác minh | Ranh giới được ghi là đề xuất; thay ví dụ bằng pseudocode có chú thích, không bịa export/schema |
| Tóm tắt yêu cầu mất chi tiết | Bản cũ diễn đạt lại story, chỉ có bốn success signals | Khôi phục nguyên văn năm story, danh sách must-have, X.01–X.09 và đủ sáu chỉ dấu PRD; thêm mã truy vết |

Đây là các lệch tên, trạng thái và cách diễn đạt; không phát hiện khác biệt scope cốt lõi Expo/RN, Q&A cố định, GPS cần xác nhận, fixture/live hoặc phase-gate giữa ba nguồn. Nếu có mâu thuẫn mới với hướng dẫn toàn cục, báo và dừng phần bị ảnh hưởng, không tự sửa nguồn hoặc vô hiệu hóa quy tắc toàn cục.

## OpenCode — hướng dẫn áp dụng

- `AGENTS.md` root là cấu hình hướng dẫn đang hoạt động cho công cụ này; nó đã được harness nạp trong phiên. Đọc `MEMORY.md` và chỉ mở các `agent_docs/` cần cho nhiệm vụ.
- Tra tài liệu OpenCode V2 ngày 02/10/2026 qua Context7, library `/websites/opencode_ai_v2`: [Instructions](https://opencode.ai/v2/docs/instructions), [Config](https://opencode.ai/v2/docs/config). Tài liệu mô tả `AGENTS.md` global/project được kết hợp, không tự giải quyết mâu thuẫn.
- Theo tài liệu V2 đó, `instructions` array chưa resolve file/glob/URL; không dựa vào `opencode.json` để tự nạp MEMORY/docs. Không tạo file cấu hình rỗng hoặc cấu hình model/provider/permission ngoài yêu cầu.
- Truy cập HTTP trực tiếp các trang docs bị 403; dữ liệu vendor dùng kết quả Context7, không tuyên bố đã thử mọi tính năng runtime. Không xác minh plugin/skill/hook toàn cục hoặc thay đổi chúng trong lượt tài liệu này.
- Prompt review đề xuất: “Đọc AGENTS.md, MEMORY.md và agent_docs/setup_review.md. Rà Phase 0 và nêu điểm cần chốt; chưa tạo mobile/ hoặc bắt đầu Phase 1.”

## Kết quả kiểm tra thiết lập

Lệnh kiểm tra theo [testing.md](testing.md): `python3 /tmp/opencode/verify_ngoke_docs.py`.

- Cwd: `/home/desi/Project/TuanAnh/Ngo`; ngày 02/10/2026; **22/22 kiểm tra đạt, exit 0**.
- Tám file hướng dẫn được chỉnh tại chỗ; chỉ thêm file review này; không xóa file. Ba nguồn `docs/` giữ nguyên SHA-256; `.opencode/` không đổi; không tạo `mobile/` hoặc file dependency/code sản phẩm.
- 19 link Markdown nội bộ và các đường dẫn tài liệu trong `AGENTS.md` hợp lệ; code fence cân bằng, không còn biến template dạng ngoặc vuông.
- Đối chiếu nguyên văn năm user stories, năm must-have, chín ranh giới ngoài scope; đủ sáu nhãn success metrics và toàn bộ mã R/RV qua các range tóm tắt. JSON metadata nguồn hợp lệ, trạng thái chưa duyệt và lệnh chưa xác định giữ nguyên.
- Đã rà thủ công ranh giới, cách diễn đạt đề xuất/chưa xác minh và cửa duyệt. Các kiểm tra này chứng minh tính nhất quán tài liệu, không chứng minh sản phẩm chạy được hoặc G0 đã được người dùng duyệt.

Báo cáo: `/tmp/opencode/ngoke-docs-verification.json`; script dùng một lần ở `/tmp/opencode/verify_ngoke_docs.py`, không thêm test framework hoặc script vào dự án. Hiện vật `/tmp/opencode/` là bằng chứng của phiên, có thể không đi cùng repository.

**Chưa kiểm tra:** app native, Metro/core/fixture, backend/SQLite/API, Android/iOS/camera/GPS, voice, lint/typecheck/test/build sản phẩm. Chưa có source/toolchain/thiết bị và chưa được duyệt triển khai; không ghi pass.

## Nội dung người dùng cần review

1. Bộ hướng dẫn và cách ghi quyền thực hiện từng phase; G0/Phase 1 chưa được duyệt.
2. Sai khác tên PRD và các chỉ dẫn lịch sử trong Tech Design; bộ thiết lập dùng đường dẫn thật và yêu cầu mới, nguồn gốc được giữ nguyên.
3. Nếu cần khớp nguyên văn workflow template, cung cấp bản `/templates/` hoặc context pack. Nếu chuẩn bị duyệt triển khai sau này, xác định repo/source gốc và thiết bị thử; chưa cần chốt tất cả câu hỏi phase sau.

Kết thúc bàn giao tài liệu thì **dừng chờ review**; không bắt đầu coding loop chỉ vì bộ thiết lập đã chuẩn hóa.
