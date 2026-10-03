# Spec — Phase 4: Camera, QR và người kể 2D

**Trạng thái:** người dùng đã duyệt Phase 3 và yêu cầu triển khai Phase 4. Báo cáo bàn giao: [`phase_4_review.md`](../../../agent_docs/phase_4_review.md). **Mã:** R4.01–R4.05.

## Mục tiêu

Người dùng chủ động mở chức năng camera, quét QR của một điểm đã biết để xác nhận điểm đó, rồi xem lớp người kể 2D tạm và caption trên nền camera. Nếu từ chối quyền hoặc gặp QR lạ thì vẫn chọn điểm bằng tay và đọc nội dung bằng chữ.

## Phạm vi

| Trong Phase 4 | Ngoài Phase 4 |
| --- | --- |
| Bật camera **chỉ** sau thao tác người dùng, xin quyền đúng lúc | GPS, khoảng cách, tọa độ thật (Phase 5) |
| Quét QR của node đã biết để xác nhận điểm | Backend live (Phase 6) |
| Lớp người kể 2D tạm + caption trên preview | Thiết kế mascot hi-fi, chọn/thu giọng, gắn audio (phase Voice riêng) |
| Chọn điểm bằng tay khi từ chối quyền hoặc QR lạ | OCR, nhận dạng biển hiệu, mở URL từ QR |
| Camera dừng khi rời màn | Nhân bản nội dung Q&A vào lớp người kể |

## Dữ liệu

Mỗi node trong `data/demo.json` thêm:

```jsonc
"story": "2–4 câu, giọng người kể tại chỗ",   // lời kể dùng cho caption
"caption": "1–2 câu, đọc được trong 5 giây"     // caption trên camera
```

Nội dung vẫn là **mô phỏng**, ghi rõ trong app. Không gắn nguồn lịch sử thật.

## Mã QR

Định dạng: `ngo-ke://node/<id>`, ví dụ `ngo-ke://node/demo-03`.

`mobile/src/qr/parseQr.ts`, hàm thuần:

- `parseQrNodeId(payload)` → `string | undefined`: chỉ nhận đúng scheme `ngo-ke://node/`, phần id phải là một node **đang có trong dataset**. QR lạ, sai scheme, rỗng → `undefined`.
- Không bao giờ trả `id` để app tự chọn điểm khi QR không hợp lệ.

Vì `id` đã là duy nhất trong dataset, app **không lưu mã QR riêng cho từng node**: mã sinh ra từ `id`, tránh dữ liệu trùng lệch. Nhóm data vẫn in mã theo công thức này khi dán tại điểm thật.

## Logic chọn điểm

`mobile/src/qr/confirmPoint.ts`:

- `confirmByQr(nodes, payload)` → `{ ok: true; node }` khi QR hợp lệ, `{ ok: false; reason: 'unknown' }` khi không.
- `selectManually(nodes, id)` → node có id đó, không phải `undefined`.
- **Không** tự đổi node hiện tại: màn hình chỉ nhận kết quả và để người dùng xác nhận bằng thao tác.

## Giao diện

`mobile/src/screens/CameraScreen.tsx`:

1. Màn mở lúc **không** bật camera; hiện nút “Bật camera” cùng lựa chọn chọn tay.
2. Bấm “Bật camera” → xin quyền. Được quyền mới mở preview và quét.
3. Từ chối quyền → hiện lý do ngắn + danh sách chọn tay; không mở camera.
4. Quét trúng QR hợp lệ → hiện thẻ xác nhận tên điểm; người dùng bấm xác nhận thì mới đổi điểm.
5. QR lạ → báo không nhận mã này, tiếp tục quét hoặc chọn tay.
6. Sau xác nhận → preview có lớp người kể 2D tạm + caption của điểm, và nút quay lại danh sách/chọn điểm khác.
7. Rời màn → preview được unmount, camera dừng.

Người kể 2D tạm: một hình tròn/nhân vật chữ ở giữa cạnh dưới preview, **không** phải mascot hoàn chỉnh; vị trí và kích thước để người dùng duyệt ở G4.

## Kiểm tra

`npm test` (Node built-in):
- `parseQrNodeId`: mã đúng, sai scheme, mã lạ, rỗng, có khoảng trắng thừa.
- `confirmByQr`: node hợp lệ; QR lạ không được nhận thành node; không tự chọn node.
- `selectManually`: id hợp lệ/không tồn tại.
- Nội dung: mọi node có `story` và `caption` không rỗng.
- Không có URL/asset ngoài app; không có mã chạy tự truy cập mạng.

Sau đó: typecheck, lint, dependency check, Expo Doctor, export Android/iOS, và chạy thật trên Android emulator: xin quyền, preview, chọn tay, lớp người kể + caption, rời màn thì camera dừng.

## Ranh giới

- Nội dung mô phỏng; caption ghi rõ là mô phỏng.
- **Chưa có:** GPS, khoảng cách, backend live, voice, mascot hi-fi.
- Quét QR **chưa kiểm chứng end-to-end trên emulator** (máy ảo không đưa được mã QR vào khung hình camera); phần ánh xạ mã được kiểm bằng test. Phải ghi rõ giới hạn này.
- Chưa kiểm tra iPhone/thiết bị thật; R4.05 ghi “chưa kiểm tra”.