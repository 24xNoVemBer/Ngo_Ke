# Backend support audit — 21/10/2026

**Task/runtime:** `task_c09d48465b89`; the active process command line identifies `gpt-6-luna` with `xhigh` effort.

## Kết luận

Không sửa `backend/` và không đổi hợp đồng API. Các điểm backend liên quan trong remediation spec/review đã có hành vi phù hợp; F4 (recovery khi Live không có dữ liệu) và F7 (hiển thị hơn sáu điểm) là vấn đề phía mobile theo đúng ownership của Anti.

## Đối chiếu hợp đồng

- **F4 — Live empty/error:** `GET /api/dataset` trả `404 NO_REVIEWED_DATA` khi không có dataset reviewed và simulated chưa được bật; `/api/ready` trả `503` cho cùng trạng thái. Simulated chỉ được phục vụ khi `SERVE_SIMULATED_DATA=true`. `mobile/src/data/live.ts` gọi V2 theo locale, coi `NO_REVIEWED_DATA` là trạng thái empty và không fallback sang fixture. Review chỉ ra thiếu retry/chuyển Demo ở các màn Unavailable và drawer; đây là hành vi UI, không cần sửa server.
- **VI/EN và reviewed/simulated:** V2 yêu cầu locale chính xác (`vi` hoặc `en`), trả `Content-Language` khớp locale, và chỉ hiện simulated khi bật opt-in. Import/đọc publication kiểm tra cặp VI/EN atomically, cùng collection/kind/định danh node và QA, payload canonical/hash; response thành công trả đúng dataset đã yêu cầu. Legacy V1 vẫn giữ nguyên.
- **Hơn sáu node:** parser live V1 và V2 chấp nhận 1–50 node. V1 đọc node theo `position` mà không giới hạn sáu; V2 dùng parser dùng chung. Giới hạn sáu pin mà review nêu nằm ở `HomeScreen` presentation, không nằm trong backend.
- **Health/ready và lỗi:** `/api/health` chỉ xác nhận kết nối SQLite; `/api/ready` kiểm tra khả năng phục vụ dataset. Lỗi dataset/database trả mã bounded (`DATASET_INVALID`, `DATABASE_UNAVAILABLE`) và không lộ SQL/stack/path. Các dạng này khớp adapter hiện tại.

## Kiểm tra

- Đã đọc `C:/Users/LEGION/orca/workspaces/ngoke/plan-architecture/docs/UI_UX_REMEDIATION_SPEC_20261021.md`, `docs/reviews/2026-10-21-claude-ui-ux-review.md`, backend routes/database/tests và các caller chỉ đọc `mobile/src/data/live.ts`, `mobile/src/data/sourceState.ts`.
- `npm test --prefix backend` — **32/32 pass**, 0 fail; chỉ có cảnh báo Node về `node:sqlite` experimental.
- Inline assert-based HTTP smoke dùng SQLite in-memory và thêm node mô phỏng thứ bảy vào `data/demo.json`: `/api/dataset` trả đủ 7 node; `/api/health` và `/api/ready` trả 200 khi simulated được opt-in.
- `git status` trước khi viết báo cáo xác nhận không có thay đổi backend; không sửa mobile hoặc `MEMORY.md`.

**Không kiểm tra:** UI tests, native render, GPS/QR, TalkBack/VoiceOver; chúng nằm ngoài ownership backend và cần bằng chứng Anti/OpenCode hoặc thiết bị. **Rủi ro còn lại:** F4/F7 chỉ được khép sau khi luồng UI tương ứng được kiểm; audit này không xác nhận trải nghiệm thiết bị.
