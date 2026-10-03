# Handoff cho nhóm UI — Ngõ Kể

**Nguyên tắc:** thay phần trình bày, **không** sửa logic lõi. Logic đã có test; UI chỉ nhận dữ liệu và hiển thị. Mọi thay đổi phải qua người dùng duyệt trước khi vào code (R6.04).

## Không được chạm vào

| File | Vai trò | Lý do |
| --- | --- | --- |
| `mobile/src/data/sourceState.ts` | `parseDataset` — quy tắc shape và nguồn | Dùng chung cho demo và live; sửa ở đây là nới lỏng ranh giới an toàn |
| `mobile/src/data/live.ts` | timeout 8 giây, phân loại `empty`/`error` | Quy tắc đã được người dùng chốt |
| `mobile/src/qa/match.ts` | normalize và khớp câu hỏi | Có test hồi quy cho lỗi đã tìm trong review |
| `mobile/src/recommendation/pick.ts` | luật chọn tối đa 3 điểm | Đã được người dùng duyệt ở G3 |
| `mobile/src/qr/parseQr.ts`, `mobile/src/qr/confirmPoint.ts` | chỉ nhận QR của node đã biết | Chống mã lạ đổi nhầm điểm |
| `mobile/src/location/nearest.ts` | Haversine, một candidate | Chống gợi ý sai |

Muốn đổi hành vi nào trong các file này thì đề xuất ở [`../REVIEW-CHECKLIST.md`](../REVIEW-CHECKLIST.md) và chờ duyệt phase.

## Được đổi

| File | Nội dung |
| --- | --- |
| `mobile/src/theme.ts` | Màu, khoảng cách, cỡ chữ dùng chung |
| `mobile/src/screens/*.tsx` | Bố cục, thứ tự hiển thị, nhãn, hình người kể 2D, caption, thẻ điểm |
| `mobile/App.tsx` | Chỉ phần trình bày và điều hướng; **không** đổi nơi quyết định `status` |

## Hợp đồng dữ liệu cho màn hình

- `source.status === 'ready'` mới mở được các màn; còn lại hiện `UnavailableScreen` với đúng lý do.
- `source.mode` là `demo` hoặc `live`. **Không** được đổi `mode` trong UI.
- `currentNodeId` chỉ đổi qua callback `onConfirmNode` do người dùng bấm; UI không được tự đặt.
- Màn nào cần biết điểm hiện tại thì nhận `currentNodeId`; không tự suy ra từ GPS hay camera.
- Nội dung mô phỏng phải ghi rõ trên màn hình, không chỉ trong tài liệu.

## Ràng buộc trình bày

- Vùng chạm ≥ 48 đơn vị; nút có phản hồi khi nhấn; nhãn accessibility cho icon và chip.
- Safe area, cuộn dọc, không che thao tác bằng bàn phím.
- Mọi thời lượng và khoảng cách hiện ra phải ghi là **mô phỏng**, không phải chỉ đường.
- Không thêm màn mới ngoài phase đã được duyệt; không tự gọi API.

## Trước khi gửi

- [ ] Không sửa file trong bảng “Không được chạm vào”.
- [ ] `cd mobile && npm test` vẫn đạt, `npm run typecheck` và `npm run lint` exit 0.
- [ ] Chạy app trên Android và iOS, chụp ảnh các màn đã đổi.
- [ ] Gửi người dùng duyệt trước khi ghép vào nhánh chính.