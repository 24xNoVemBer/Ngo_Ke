# Ngõ Kể — UI Wave 1 Implementation Report

**Ngày:** 2026-10-23  
**Phạm vi được ủy quyền:** NK-UI-01A → NK-UI-02 → NK-UI-06A, triển khai tuần tự.  
**Kết quả:** Host implementation và regression đạt; native visual verification còn pending.

**Model note:** Prompt chỉ định Codex Luna, nhưng runtime hiện tại không cho chuyển model; công việc được thực hiện bởi Codex runtime đang hoạt động, không tuyên bố là Luna.

## Baseline và worktree

- Branch: `valentino/logic-fix-mobile-20261020`
- HEAD đầu và cuối: `4af64c49a4ada47f952ddf76c35adfb90f826224` (không đổi)
- Trước khi sửa, worktree đã có 11 tracked files modified cùng các untracked `.agents/`, tài liệu audit/content/design/plan/review và `mobile/.cache/`. Các thay đổi này được giữ nguyên; những hunk mới chỉ được thêm trong các file nằm trong ticket scope. Không đổi branch, commit, push, reset, stash hoặc xóa untracked files.
- Baseline mobile suite trước sửa: **405 passed, 0 failed, 0 skipped**.

## NK-UI-01A — Token cộng dồn và paper surfaces

**Root cause:** Một số màu UI được viết trực tiếp trong consumer; mô tả công cụ trong Notebook có contrast thấp hơn chuẩn AA. Passport còn dùng bảng màu tối riêng, lệch khỏi bề mặt sổ giấy.

**Đã làm:** Bổ sung semantic colors, ba typography variants và `radius.xl` mà không thay hoặc xóa token cũ. AlleySelect root/top bar, Passport và Notebook dùng token được duyệt; Passport đổi sang paper surface; `toolGridDesc` dùng `colors.toolCardDesc`. Không đổi state, nội dung, mode control hoặc lifecycle của modal.

Test mới kiểm tra các key tương thích cũ, các cặp chữ/nền đạt contrast ≥4.5:1 và mapping token của ba consumer.

## NK-UI-02 — Schematic trail giữ node identity

**Root cause:** Khi dataset không có polyline, Home dùng tối đa sáu vị trí tĩnh; các collection 2/3 node và collection dài hơn có thể thiếu hoặc dồn pin.

**Đã làm:** Thêm `computeSchematicTrailLayout` chỉ cho fallback không có polyline: 0 node trả rỗng; 1 node ở giữa; từ 2 node phân bố Y 15–85%, X so le. Pin giữ đúng `node.id`; kích thước canvas không hợp lệ trả layout rỗng. Kết quả không chứa tọa độ địa lý, khoảng cách hoặc ETA. `fiction-letter` giữ nguyên sáu vị trí `PIN_CONFIG`; nhánh polyline hiện hữu và guard chọn node không đổi.

Test mới bao phủ n=0/1/2/3/5/6/8, thứ tự/ID, node unavailable, dimension không hợp lệ, pin Tạm Thương và vị trí legacy chính xác.

## NK-UI-06A — Empty state và recovery có điều kiện

**Root cause:** Plan dùng một thông báo chung cho trường hợp topic không có node, đã ghé hết, node không khả dụng hoặc budget quá ngắn.

**Đã làm:** `PlanScreen` phân loại từ tags, `available`, `visited` và `visitMinutes` hiện có; copy VI/EN nói đúng nguyên nhân. Chỉ hiện nút Chuyện xưa khi `pickPoints` xác nhận có node phù hợp và vừa budget hiện tại. Nút tăng thời lượng chỉ hiện khi có node chưa ghé thăm mà thời lượng tối thiểu vượt budget; thao tác chỉ đổi draft sau khi người dùng bấm và giữ nguyên topic. Nút đổi lựa chọn cũ vẫn còn.

Không sửa `pick.ts`, dataset, tags, visited flags, thứ tự điểm hoặc nội dung/evidence. Các lựa chọn recovery vẫn đi qua picker hiện tại, không tự fallback.

## Files được sửa trong scope này

- Application: `mobile/src/theme.ts`, `mobile/src/screens/AlleySelectScreen.tsx`, `mobile/src/components/AlleyPassportModal.tsx`, `mobile/src/components/NotebookDrawerModal.tsx`, `mobile/src/utils/alleyGeometry.ts`, `mobile/src/screens/HomeScreen.tsx`, `mobile/src/screens/PlanScreen.tsx`, `mobile/src/i18n/translator.ts`.
- Tests: thêm `mobile/tests/themeTokens.test.mjs`, `mobile/tests/alleyGeometry.test.mjs`, `mobile/tests/planScreenExperience.test.mjs`; mở rộng `mobile/tests/alleyIntegration.test.mjs`, `mobile/tests/recommendation.test.mjs`, `mobile/tests/uiFlows.test.mjs`.
- Handoff: `docs/reviews/NGO_KE_UI_WAVE1_REPORT.md`.
- Project memory handoff: `MEMORY.md`; chỉ ghi nhận phạm vi ủy quyền một lần, không thay ownership dài hạn.

`HomeScreen.tsx`, `NotebookDrawerModal.tsx` và `uiFlows.test.mjs` đã modified trước ticket này; phần WIP có sẵn được giữ, không thay ownership lâu dài trong `AGENTS.md`. Ngoài scope trên, không sửa Q&A, voice/audio, images, content datasets, GPS/QR hoặc backend.

## Kiểm thử

| Giai đoạn | Lệnh | Kết quả |
| --- | --- | --- |
| Baseline | `npm test` | 405/405 pass |
| 01A | `node --test tests/themeTokens.test.mjs tests/landingRedesign.test.mjs tests/landingQuickActions.test.mjs tests/uiFlows.test.mjs` | 94/94 pass |
| 02 | `node --test tests/alleyGeometry.test.mjs tests/alleyIntegration.test.mjs tests/homePhaseB.test.mjs` | 32/32 pass |
| 06A | `node --test tests/planScreenExperience.test.mjs tests/recommendation.test.mjs` | 18/18 pass |
| 06A | `node --test tests/uiFlows.test.mjs` | 80/80 pass |
| Final | `npm test` | **418 passed, 0 failed, 0 skipped** |
| Final | `npm run typecheck` | PASS (`tsc --noEmit`) |
| Final | `npm run lint -- --no-cache` | PASS, không lỗi/cảnh báo |
| Final | `git diff --check` | PASS |

Trong lần chạy đầu của test mới có một assertion cross-realm chưa phù hợp với harness và một lỗi lint do test chưa import `URL`; đã sửa test và chạy lại. Không còn failure host chưa xử lý.

## Giới hạn, rủi ro và việc cần người dùng

- `adb devices -l` không chạy được vì `adb` không có trong PATH; không có native emulator/device session để xác minh giao diện. Không khởi động emulator hay Metro. iOS native cũng chưa được kiểm tra trong môi trường này.
- **Pending native review:** Passport/AlleySelect trên safe area; focus/dismiss và modal reopen; font scale 1/1.3/2; pin hit boxes, nhãn/collision và scroll ở màn nhỏ; Plan empty state đọc được, recovery action focus/announcement và EN copy dài. Host harness không thay thế các kiểm tra này.
- Rủi ro chính: đổi Passport sang paper palette cần xem trên thiết bị; schematic trail là biểu diễn thứ tự, không phải tuyến GPS; recovery budget dùng `visitMinutes` hiện hành và không tính thời gian đi bộ.
- **Cần anh quyết:** Không có quyết định mới để hoàn tất phạm vi host. Trước khi tuyên bố nghiệm thu visual, cần quyết định chấp nhận native evidence trên Android/iOS nào; hiện chưa có bằng chứng native.
- **Cần anh tự làm:** Cung cấp hoặc mở một Android device/emulator có `adb` (và thiết bị iOS nếu cần duyệt iOS), rồi chạy các kiểm tra native pending ở trên. Nếu chưa làm, trạng thái chỉ là host-regression pass, chưa phải native visual acceptance.

## Handoff

Ba ticket được triển khai đúng thứ tự và host regression đạt. Chưa bắt đầu UI Wave 2, ticket khác hoặc thay đổi content. Đề nghị giữ trạng thái **implementation complete / native verification pending** cho đến khi có kiểm tra trực tiếp trên thiết bị.
