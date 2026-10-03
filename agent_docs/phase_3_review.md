# Phase 3 — Chủ đề, quỹ thời gian và gợi ý điểm: bàn giao

**Ngày:** 03/10/2026. **Phạm vi:** R3.01–R3.03. **Trạng thái:** code trong phạm vi đã triển khai và kiểm tra trên Android emulator; **người dùng cần duyệt quy tắc xếp hạng, cách hỏi và lý do gợi ý (G3)**. Phase 4–7/voice chưa được phép.

## Quyền thực hiện và quy tắc đã chốt

- Người dùng duyệt Phase 2 và yêu cầu triển khai Phase 3.
- Người dùng chốt: **lọc theo chủ đề, bỏ điểm đã ghé và điểm đóng, lấy tối đá 3 điểm theo thời lượng tăng dần**; **quỹ thời gian bằng chip 15/30/45/60 phút, vẫn gõ tay được**.
- Spec: [`2026-10-03-phase-3-recommendation-design.md`](../docs/superpowers/specs/2026-10-03-phase-3-recommendation-design.md).

## Thay đổi

| File | Nội dung |
| --- | --- |
| `data/demo.json` | Mỗi node thêm `summary`, `tags` (chủ đề), `visitMinutes`, `available`, `visited`. Nội dung vẫn là mô phỏng. |
| `mobile/src/recommendation/pick.ts` (mới) | `parseTopic`, `parseTimeBudget`, `pickPoints`. Hàm thuần, không React, không tọa độ/ETA. |
| `mobile/src/screens/PlanScreen.tsx` (mới) | Hỏi chủ đề và thời gian bằng chip hoặc gõ tay; hiện tối đá 3 thẻ điểm kèm lý do và thời lượng; các trạng thái thiếu lựa chọn / không có điểm phù hợp. Thẻ điểm **không** có hành vi điều hướng hay xác nhận. |
| `mobile/App.tsx`, `mobile/src/navigation.ts` | Thêm route `Plan`, chỉ mở khi nguồn `ready`. |
| `mobile/src/screens/HomeScreen.tsx` | Nút vào màn chọn trải nghiệm; bỏ placeholder “Chọn trải nghiệm”; cập nhật chữ Phase 1–3. |
| `mobile/tests/recommendation.test.mjs` (mới) | 11 ca: nhận diện chủ đề/thời gian, lọc và sắp xếp, loại điểm đã ghé/đóng, tối đa 3 điểm, trạng thái thiếu lựa chọn, không điểm phù hợp, ổn định thứ tự, không có tọa độ/đi bộ. |
| `mobile/tests/sourceState.test.mjs` | Cập nhật tập trường node theo schema mới. |

Không thêm dependency, không đổi lockfile, không mở chọn/xác nhận điểm, QR, camera, GPS, API hay voice.

## Kiểm tra thật

Node **24.19.0**, npm **11.17.0**; cwd `mobile/`.

| Lệnh / thao tác | Kết quả |
| --- | --- |
| `npm test` | **59/59 đạt** (48 ca cũ + 11 ca Phase 3) |
| `npm run typecheck` | Exit 0 |
| `npm run lint` | Exit 0 |
| `npm run check:dependencies` | Exit 0 |
| `npx --yes expo-doctor` | Exit 0, **21/21 đạt** |
| `npm run build:android` | Exit 0 (xuất bundle; không phải runtime pass) |
| `npm run build:ios` | Exit 0 (không phải iOS runtime pass) |
| `npm audit --json` | Exit 1, **23 cảnh báo: 7 moderate, 16 high** |
| Android emulator Medium_Phone, Android 17/API 37, Expo Go 57.0.9 | **13/13 ca đạt**: Home có nút mở màn, chip chủ đề và thời gian hiện đủ, chưa chọn thì không gợi ý, thiếu thời gian thì được nhắc, chọn xong ra gợi ý, tối đá 3 điểm, mỗi điểm có lý do và thời lượng, có câu “không phải đường đi”, đổi lựa chọn được |

Ảnh: [câu hỏi](evidence/phase-3/plan-questions.png), [nhắc thời gian](evidence/phase-3/plan-needs-budget.png), [gợi ý](evidence/phase-3/plan-suggestions.png). Lệnh/exit: [checks.json](evidence/phase-3/checks.json), [interaction-checks.json](evidence/phase-3/interaction-checks.json).

## Lỗi tìm được trong lúc làm

- Khoá đối tượng có khoảng trắng (`an thuc:`) là cú pháp không hợp lệ; Node không nạp được module → đã đặt khoá trong dấu nháy.
- Hàm `pickPoints` bỏ qua trường `visited` trong dữ liệu, nên điểm đã ghé vẫn có thể được gợi ý → đã sửa ở điều kiện lọc và có ca hồi quy.
- Test ban đầu viết sai hợp đồng trả về (quên bọc kết quả) → sửa test theo spec, không sửa spec để chiều code.
- Metro chạy ở chế độ CI nên không nhận thay đổi file: phải dừng đúng tiến trình giữ cổng 8085 rồi mở lại Expo Go, nếu không sẽ kiểm tra nhầm bundle cũ.
- Home chưa thêm nút và còn placeholder Phase 3 → đã sửa và kiểm lại.
- Hai kiểm tra “có lý do / có thời lượng” báo fail vì thẻ gợi ý chưa nằm trong vùng nhìn; đã cuộn xuống kiểm lại, cả hai đạt. Ghi rõ trong `interaction-checks.json`.

## Ranh giới và giới hạn

- Nội dung và thời lượng vẫn là **mô phỏng**, ghi rõ trên từng thẻ.
- **Chưa có:** chọn/xác nhận điểm, đổi node, QR, camera, người kể 2D, GPS, khoảng cách, backend live — đều thuộc phase sau chưa được phép. App không tự chọn điểm và không chỉ đường.
- Quy tắc xếp hạng tối giản, **cần anh duyệt**: có nên giới hạn tổng thời lượng theo quỹ thời gian không (hiện không giới hạn), ưu tiên điểm chưa ghé thế nào khi đã ghé hết, câu chữ lý do.
- **Chưa kiểm tra:** điện thoại thật, iOS, offline cold start, screen reader, bàn phím thật.
- `npm audit` còn 23 cảnh báo; chưa xử lý.
- Màn chọn trải nghiệm chưa có test tự động cho phần giao diện (chỉ kiểm thủ công trên emulator) vì chưa thêm thư viện render.

## Nội dung cần anh review

1. Câu hỏi “Bạn muốn trải nghiệm gì?” và “Bạn có bao nhiêu thời gian?” có đúng giọng không.
2. Cách nói lý do: “Hợp chủ đề ẩm thực · <mô tả điểm>”.
3. Có muốn dùng quỹ thời gian làm ràng buộc cứng (không hiện điểm vượt quỹ) hay giữ như hiện tại (chỉ gợi ý).
4. Thứ tự ưu tiên: hiện xếp theo thời lượng tăng dần, có đúng ý anh không.
5. Thiếu điểm thì có nên gợi ý chủ đề khác không (hiện chỉ cho nút đổi chủ đề).

**Dừng ở Phase 3.** Chưa chốt G3, chưa bắt đầu Phase 4.