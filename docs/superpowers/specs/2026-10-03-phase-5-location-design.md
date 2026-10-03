# Spec — Phase 5: GPS thận trọng và xác nhận điểm

**Trạng thái:** người dùng đã duyệt Phase 4 (03/10/2026) và chốt hai quy tắc ngày 03/10/2026. Báo cáo bàn giao: [`phase_5_review.md`](../../../agent_docs/phase_5_review.md). **Mã:** R5.01–R5.03.

## Mục tiêu

Người dùng bấm nút thì app lấy **một** vị trí, tìm điểm gần nhất và hiện như **candidate** kèm khoảng cách và độ chính xác. Người dùng bấm xác nhận thì mới đổi điểm hiện tại. Không tự kết luận người dùng đang ở đâu.

## Quy tắc đã chốt

- **Ngưỡng:** `accuracy > 50 m` hoặc cách điểm gần nhất `> 300 m` → **không đưa candidate**, chỉ nói lý do và mời chọn tay.
- **Tọa độ:** thêm `latitude`/`longitude` **mô phỏng** cho 6 điểm, ghi rõ mô phỏng ngay trên màn hình và trong báo cáo; nhóm data thay bằng tọa độ khảo sát thật sau.

## Phạm vi

| Trong Phase 5 | Ngoài Phase 5 |
| --- | --- |
| Lấy vị trí **một lần** khi người dùng bấm nút | Theo dõi nền, geofence, watch position (không bao giờ) |
| Một candidate + khoảng cách + accuracy + microcopy “có thể là…” | Bản đồ, chỉ đường, ETA, dẫn rẽ theo rẽ |
| Xác nhận / chọn lại / chọn tay trước khi đổi node | Backend live (Phase 6), offline (Phase 7) |
| Xử lý từ chối quyền, accuracy kém, ngoài cụm | Đánh dấu “đã ghé thăm” theo phiên (xem phần giới hạn) |

## Dữ liệu

`data/demo.json`, mỗi node thêm:

```jsonc
"latitude": 10.760000,   // mô phỏng
"longitude": 106.680000  // mô phỏng
```

Tọa độ **mô phỏng**, xếp quanh một tâm trong khoảng 100–250 m để có điểm gần và điểm xa. Validator (`sourceState.ts`) kiểm tra lat trong `[-90, 90]`, lng trong `[-180, 180]`. Màn hình và báo cáo ghi rõ **không dùng ngoài thực địa**.

## Logic

`mobile/src/location/nearest.ts`, hàm thuần, không phụ thuộc React hay Expo:

- `distanceMeters(a, b)` — Haversine, trả mét.
- `pickCandidate(nodes, position, limits)` với `position = { latitude, longitude, accuracy }`, `limits = { maxAccuracyMeters, maxDistanceMeters }`:

| Kết quả | Điều kiện |
| --- | --- |
| `needs-position` | Không có vị trí |
| `poor-accuracy` | `accuracy > maxAccuracyMeters` |
| `no-coordinates` | Không node nào có tọa độ |
| `outside-cluster` | Điểm gần nhất xa hơn `maxDistanceMeters` |
| `candidate` | Còn lại; **luôn** kèm `node`, `distanceMeters`, `accuracy` |

Hàm **không bao giờ** trả trạng thái “đã xác nhận”: kết quả tên `candidate` để nhấn mạnh đây chỉ là gợi ý. Node `available === false` bị loại. Không trả khoảng cách cho node thiếu tọa độ.

## Giao diện

`mobile/src/screens/LocationScreen.tsx`:

1. Mở màn **không** lấy vị trí. Hiện nút “Lấy vị trí của tôi”.
2. Bấm nút → `requestForegroundPermissionsAsync` → được quyền mới `getCurrentPositionAsync({ accuracy: Balanced })`, **một** lần, không watch.
3. Từ chối quyền → nói rõ lý do, mời chọn tay; không lấy vị trí.
4. `candidate` → thẻ “Có thể là …” + khoảng cách + accuracy + **điểm hiện tại không đổi**; nút “Xác nhận điểm này” và “Chọn lại”.
5. `poor-accuracy` / `outside-cluster` → nói lý do, không đưa candidate, mời chọn tay.
6. Xác nhận → đổi `currentNodeId` của app; hiện microcopy “ưu tiên quét QR ở điểm này”.
7. Luôn có danh sách chọn tay; chọn tay được ghi rõ là mô phỏng trong demo.

`currentNodeId` sống ở `App.tsx` (React state), khởi tạo bằng `startNodeId`. `CameraScreen` cũng dùng chung setter khi xác nhận QR, để QR luôn được ưu tiên. Home hiện điểm hiện tại.

## Kiểm tra

`npm test` (Node built-in):
- `distanceMeters`: 0 khi trùng chỗ; ~111 m cho 0.001° vĩ độ; đối xứng.
- `pickCandidate`: không có vị trí → `needs-position`; accuracy 80 m (ngưỡng 50) → `poor-accuracy`; cách 1 km → `outside-cluster`; còn lại → `candidate` có `distanceMeters` và `accuracy`.
- Node `available === false` không bao giờ thành candidate.
- **Không có** kết quả nào mang tên/khả năng “confirmed”; candidate luôn là gợi ý.
- Dataset: mọi node có tọa độ trong khoảng hợp lệ.

Sau đó: typecheck, lint, dependency check, Expo Doctor, export Android/iOS, và chạy thật trên emulator (xin quyền, từ chối quyền, được quyền, ngoài cụm, chọn tay, đổi điểm).

## Ranh giới

- Tọa độ mô phỏng; không dùng để đi bộ ngoài thực địa.
- Không có bản đồ, chỉ đường, ETA.
- **Chưa đánh dấu “đã ghé thăm” theo phiên**: `pickPoints` của Phase 3 vẫn đọc `visited` trong dataset (luôn `false`), nên điểm đã xác nhận vẫn có thể được gợi ý lại. Cần người dùng chốt có gắn vào Phase 5 hay để Phase 6/7.
- Chưa kiểm iPhone/thiết bị thật; R5.03 yêu cầu người dùng review microcopy trước khi thử ngoài thực địa.