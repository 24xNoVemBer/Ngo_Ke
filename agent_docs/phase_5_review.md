# Phase 5 — GPS thận trọng và xác nhận điểm: bàn giao

**Ngày:** 03/10/2026. **Phạm vi:** R5.01–R5.03. **Trạng thái:** code trong phạm vi đã triển khai; nhánh GPS đọc được vị trí **chưa kiểm được trên emulator** (xem “Chưa kiểm chứng được”); **người dùng cần duyệt microcopy và quy trình xác nhận (G5)**. Phase 6–7/voice chưa được phép.

## Quyền thực hiện và quy tắc đã chốt

- Người dùng duyệt Phase 4 và yêu cầu triển khai Phase 5.
- Người dùng chốt: **accuracy > 50 m hoặc cách > 300 m thì không đưa candidate**, chỉ báo lý do + mời chọn tay; **thêm tọa độ mô phỏng** cho 6 điểm và ghi rõ là mô phỏng.
- Spec: [`2026-10-03-phase-5-location-design.md`](../docs/superpowers/specs/2026-10-03-phase-5-location-design.md).

## Thay đổi

| File | Nội dung |
| --- | --- |
| `mobile/package.json`, `package-lock.json` | Thêm **`expo-location`** bằng `npx expo install` (dependency duy pha này). Không bật quyền nền. |
| `mobile/app.json` | Plugin `expo-location` với câu xin quyền tiếng Việt; `ACCESS_COARSE_LOCATION` + `ACCESS_FINE_LOCATION`; `NSLocationWhenInUseUsageDescription`. |
| `mobile/src/location/nearest.ts` (mới) | `distanceMeters` (Haversine) và `pickCandidate` — hàm thuần, trả **một** candidate, **không** có trạng thái “đã xác nhận”. |
| `mobile/src/screens/LocationScreen.tsx` (mới) | Nút “Lấy vị trí của tôi”, xin quyền khi bấm, đọc **một** lần (`Accuracy.Balanced`, không watch), thẻ “Có thể là…”, nút xác nhận / bỏ qua, luôn có chọn tay. |
| `mobile/App.tsx` | Thêm `currentNodeId` + `confirmNode`; chỉ người dùng xác nhận mới đổi điểm. |
| `mobile/src/screens/CameraScreen.tsx` | Xác nhận QR hoặc chọn tay cũng đổi điểm hiện tại (QR được ưu tiên). |
| `mobile/src/screens/HomeScreen.tsx` | Nút mở màn GPS, hiện “Điểm hiện tại”, bỏ khối placeholder (không còn màn nào chưa làm). |
| `mobile/src/screens/QaScreen.tsx` | Hiện “Bạn đang ở: …” theo điểm hiện tại; **không** đổi logic khớp câu hỏi. |
| `mobile/src/data/sourceState.ts` | `DemoNode` thêm `latitude`/`longitude`; validator kiểm tra khoảng hợp lệ. |
| `data/demo.json` | Thêm tọa độ **mô phỏng** cho 6 điểm; disclaimer ghi rõ không dùng ngoài thực địa. |
| `mobile/tests/location.test.mjs` (mới) | 8 ca: khoảng cách, candidate gần nhất, accuracy kém, ngoài cụm, không có vị trí, không có tọa độ, điểm đóng không được gợi ý, không kết quả nào mang nghĩa “đã xác nhận”. |
| `mobile/tests/sourceState.test.mjs` | Thêm ca lỗi cho lat/lng ngoài khoảng và thiếu tọa độ. |
| `mobile/tests/recommendation.test.mjs` | Ca “không có khoảng cách/chỉ đường” của Phase 3 viết lại cho khớp schema mới, giữ nguyên ý nghĩa. |

## Kiểm tra thật

Node **24.19.0**, npm **11.17.0**; cwd `mobile/`.

| Lệnh / thao tác | Kết quả |
| --- | --- |
| `npm test` | **81/81 đạt** (73 ca cũ + 8 ca Phase 5) |
| `npm run typecheck` | Exit 0 |
| `npm run lint` | Exit 0 |
| `npm run check:dependencies` | Exit 0 |
| `npx --yes expo-doctor` | Exit 0, **21/21 đạt** |
| `npm run build:android` / `build:ios` | Exit 0 (xuất bundle, không phải runtime pass) |
| `npm audit --json` | Exit 1, **23 cảnh báo: 7 moderate, 16 high** (không đổi) |
| Android emulator Medium_Phone, Android 17/API 37, Expo Go 57.0.9 | **6/6 ca đạt** cho phần quyền bị từ chối + chọn tay; **nhánh đọc vị trí không kiểm được** |

### 6 ca đạt trên emulator

1. Mở màn **không** hỏi vị trí, hiện điểm hiện tại.
2. Chỉ khi bấm nút mới hiện hộp thoại xin quyền của hệ thống.
3. Từ chối → báo “Chưa lấy được vị trí. Hãy bấm lại hoặc chọn điểm bằng tay”, **không** đoán điểm, không nói “chắc chắn”.
4. Chọn tay vẫn dùng được sau khi từ chối.
5. Chọn tay `demo-05` → điểm hiện tại đổi sang `demo-05`.
6. Danh sách chọn tay luôn có mặt.

Ảnh: [màn mở](evidence/phase-5/location-start.png) · [từ chối quyền](evidence/phase-5/location-denied.png) · [đổi điểm bằng tay](evidence/phase-5/location-current-changed.png). Lệnh/exit: [checks.json](evidence/phase-5/checks.json), [interaction-checks-deny.json](evidence/phase-5/interaction-checks-deny.json).

## Chưa kiểm chứng được — quan trọng

**Emulator này không cấp được fix GPS.** `dumpsys location` cho thấy mọi provider đều `last location=null`; lệnh console `geo fix` trả `OK` nhưng vị trí không tới provider; app log đúng lý do:

```
Error: Current location is unavailable. Make sure that location services are enabled
```

Ảnh chụp màn hình lúc đó (có cả toast lỗi của app): [location-read-failed-emulator.png](evidence/phase-5/location-read-failed-emulator.png).

Vì vậy **hai nhánh sau chưa chạy thật lần nào**:

- `candidate`: đứng gần điểm → thẻ “Có thể là…”, khoảng cách, accuracy, xác nhận đổi điểm, microcopy “ưu tiên QR”.
- `outside-cluster`: đứng xa → báo khoảng cách, không đưa candidate.

Cả hai được kiểm bằng **unit test** (`mobile/tests/location.test.mjs`), nhưng giao diện và hộp thoại của hai nhánh đó **chưa được nhìn thấy trên thiết bị**. Bằng chứng giới hạn: [emulator-gps-limitation.txt](evidence/phase-5/emulator-gps-limitation.txt).

Ngoài ra **chưa kiểm**: iPhone, điện thoại thật có GPS, ngoài trời thực địa, offline cold start, screen reader.

## Lỗi tìm được trong lúc làm

- Lần đầu `getCurrentPositionAsync` đổi điểm “đã ghé thăm” không có: thêm `!node.visited` vào điều kiện lọc của `pickCandidate` + ca hồi quy.
- Test Phase 3 chặn “gợi ý có tọa độ” trở nên sai khi node có tọa độ hợp lệ; sửa test theo đúng ý nghĩa (gợi ý không được mang khoảng cách hay câu chỉ đường), **không** nới lỏng để cho test xanh.
- `sourceState.ts` chỉ khai báo `DemoNode` với `id`/`name`; đã khai báo đủ trường và cho validator kiểm từng trường thay vì ép kiểu.
- Script kiểm tra của em báo fail giả nhiều lần do: tìm nhãn rồi mới cuộn, hộp thoại hệ thống tới trễ, và emulator bị restart giữa chừng. Đã sửa script, không sửa app.
- Đã dùng `console.warn` tạm để lấy đúng lỗi thay vì đoán, rồi **gỡ bỏ** sau khi tìm ra nguyên nhân.

## Ranh giới

- Tọa độ **mô phỏng**; màn hình ghi rõ không dùng để đi bộ ngoài thực địa.
- Không có bản đồ, chỉ đường, ETA, theo dõi nền, geofence.
- Không có nhánh nào tự đổi điểm; `pickCandidate` không có trạng thái “confirmed” và có test chặn.
- **Chưa đánh dấu “đã ghé thăm” theo phiên**: `pickPoints` của Phase 3 vẫn đọc `visited` trong dataset (luôn `false`), nên điểm đã xác nhận vẫn có thể được gợi ý lại.

---

## Việc cần anh quyết

1. **Ngưỡng 50 m / 300 m** anh đã chốt để dựng phase này. Cần duyệt lại khi có tọa độ thật: 300 m có hợp với cụm điểm thật ở Ao Sen không, hay nên theo chiều dài con ngõ?
2. **Câu “Điểm hiện tại vẫn là …”** khi có candidate — có cần rút gọn không? Đây là câu chốt an toàn nên em giữ.
3. **Có gắn “đã ghé thăm” theo phiên vào Phase 5 không** (để Phase 3 không gợi ý lại điểm đã xác nhận), hay để Phase 6/7?
4. **Có giữ nút “Bỏ qua, chọn tay”** cạnh nút xác nhận, hay chỉ cần danh sách chọn tay bên dưới?
5. **Câu xin quyền**: “Cho phép Ngõ Kể đọc vị trí một lần để gợi ý điểm gần nhất. App không theo dõi vị trí nền.” — anh duyệt câu này không?

## Việc anh tự làm

1. **Khảo sát tọa độ thật** cho từng điểm rồi thay vào `data/demo.json` (`latitude`/`longitude`). `[ngoài plan]` — plan chỉ ghi “nhóm data khảo sát tọa độ trước khi test ở Ao Sen”, không ghi việc thay fixture; hệ quả nếu chưa làm: mọi khoảng cách và candidate trên demo là số ảo, đúng như ghi chú nhưng không dùng để dạy hoặc đo đạc thực địa.
2. **Thử GPS thật ngoài trời** trên điện thoại Android và một iPhone. `[ngoài plan]` — R5.05 yêu cầu kiểm chứng thiết bị nhưng không có bước thử ngoài trời cụ thể; hệ quả nếu chưa làm: hai nhánh candidate/outside-cluster vẫn chỉ được tin qua unit test, chưa từng chạy thật.
3. **In mã QR `ngo-ke://node/<id>`** dán thử ở điểm thật để kiểm chứng Phase 4 cùng lúc. `[ngoài plan]`; hệ quả nếu chưa làm: nhánh quét QR vẫn chưa end-to-end như đã ghi ở Phase 4.