# Spec — Phase 3: Chủ đề, quỹ thời gian và gợi ý điểm

**Trạng thái:** người dùng đã duyệt Phase 2 và chốt hai quy tắc ngày 03/10/2026. Báo cáo bàn giao: [`phase_3_review.md`](../../../agent_docs/phase_3_review.md). **Mã:** R3.01–R3.03.

## Mục tiêu

Sau phần hỏi đáp, app hỏi người dùng muốn trải nghiệm gì và có bao nhiêu thời gian, rồi gợi ý **tối đa ba điểm** kèm lý do và thời lượng mô phỏng. Không chỉ đường, không tự xác nhận điểm.

## Quy tắc đã chốt

**Chủ đề:** lọc theo chủ đề người dùng chọn; bỏ điểm đã ghé thăm và điểm không còn mở; lấy tối đá 3 điểm còn lại, sắp theo thời lượng tăng dần.

**Quỹ thời gian:** chip 15/30/45/60 phút, đồng thời vẫn gõ tự nhiên được (ví dụ “khoảng 30 phút”).

## Phạm vi

| Trong Phase 3 | Ngoài Phase 3 |
| --- | --- |
| Chọn chủ đề: ẩm thực / chuyện xưa / khám phá tự do | Chọn hoặc xác nhận điểm, đổi node (Phase 4–5) |
| Chọn quỹ thời gian bằng chip hoặc gõ | QR, camera, người kể 2D, caption (Phase 4) |
| Gợi ý tối đa 3 điểm + lý do + thời lượng | GPS, khoảng cách, tọa độ thật (Phase 5) |
| Trạng thái thiếu điểm / thiếu thời gian | Backend live (Phase 6) |
| Gợi ý thay đổi chủ đề hoặc thời gian | TTS/STT (phase Voice riêng) |

## Dữ liệu

Bổ sung vào `data/demo.json` (mở rộng schema phiên bản 1, giữ nguyên phần đã có):

```jsonc
// mỗi node thêm
"summary": "…",                       // 1–2 câu, dùng làm lý do
"tags": ["an thuc"],                  // chủ đề của điểm
"visitMinutes": 20,                   // số phút ước tính xem tại điểm
"available": true,                    // false = điểm đang đóng
"visited": false                      // sẽ đổi khi người dùng đã ghé (Phase 4+)
```

Chủ đề hợp lệ: `an thuc`, `chuyen xua`, `kham pha tu do`. Điểm có thể mang nhiều chủ đề. `visitMinutes` là **ước tính trải nghiệm**, tuyệt đối không dùng làm thời gian đi bộ hay chỉ đường.

Dữ liệu vẫn là **mô phỏng**, ghi rõ trong app.

## Logic

`mobile/src/recommendation/pick.ts`, hàm thuần, không phụ thuộc React:

- `parseTopic(text)` → `Topic | undefined`: bỏ dấu/thường như Q&A; khớp “an thuc”/“am thuc”, “chuyen xua”, “kham pha tu do”.
- `parseTimeBudget(text)` → số phút | undefined: hiểu số trong chuỗi và các từ “phút”, “tiếng”; bỏ qua số không phải thời gian.
- `pickPoints(nodes, { topic, budgetMinutes, visited })`:
  1. Bỏ điểm `available === false` và điểm đã ghé.
  2. Nếu có chủ đề, chỉ giữ điểm có chủ đề đó.
  3. Sắp theo `visitMinutes` tăng dần, lấy tối đá 3.
  4. Không dùng tọa độ/ETA; không trộn thứ tự ngẫu nhiên.

`explainPick(node, topic)` → câu lý do ngắn, ví dụ “Hợp chủ đề ẩm thực · ước tính 20 phút”.

## Giao diện

`mobile/src/screens/PlanScreen.tsx`, mở từ Home (thay placeholder Phase 3):

1. Câu hỏi dẫn chủ đề: ba chip ẩm thực / chuyện xưa / khám phá tự do; gõ tay cũng hiểu.
2. Câu hỏi quỹ thời gian: bốn chip 15/30/45/60 phút và ô nhập; gõ “khoảng 30 phút” được.
3. Kết quả: tối đa 3 thẻ điểm, mỗi thẻ có tên, lý do, thời lượng. Thẻ **không** có hành vi điều hướng/xác nhận.
4. Trạng thái thiếu: chưa chọn chủ đề → nhắc chọn; chưa chọn thời gian → nhắc chọn; không còn điểm phù hợp → nói rõ không có điểm nào khớp, kèm nút đổi chủ đề.
5. Nút “Đổi lựa chọn” quay lại bước chọn, giữ dữ liệu đã chọn.

Ràng buộc: safe area, cuộn dọc, nút ≥48 đơn vị, có phản hồi khi nhấn, nhãn accessibility; mọi lý do/thời lượng ghi rõ là mô phỏng.

## Kiểm tra

`npm test` (Node built-in) với dữ liệu thật từ `data/demo.json`:
- `parseTopic`: đúng ba chủ đề, không dấu/hoa thường, câu lạ → undefined.
- `parseTimeBudget`: “30”, “khoảng 45 phút”, “1 tiếng”, câu không phải thời gian → undefined.
- `pickPoints`: lọc chủ đề, loại điểm đã ghé, loại điểm đóng, sắp theo thời lượng, **không quá 3**, lý do khớp chủ đề.
- Thiếu chủ đề/thời gian → yêu cầu chọn, không gợi ý.
- Không còn điểm → trạng thái rỗng, không gợi ý bừa.
- Không dùng tọa độ/ETA; không nhân bản thuật toán ra UI.

Sau đó: typecheck, lint, dependency check, Expo Doctor, export Android/iOS, và chạy thật trên Android emulator có ảnh.

## Ranh giới

- Nội dung mô phỏng; mỗi điểm ghi rõ.
- Không chọn/xác nhận điểm, không QR/camera/GPS/API — thuộc phase sau chưa được phép.
- Quy tắc xếp hạng là đề xuất tối giản, **cần người dùng duyệt** ở G3; thứ tự chủ đề/thời lượng và cách nói lý do cũng cần review.
- Chưa kiểm tra trên điện thoại thật, iOS, offline cold start, screen reader.