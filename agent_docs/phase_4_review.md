# Phase 4 — Camera, QR và người kể 2D: bàn giao

**Ngày:** 03/10/2026. **Phạm vi:** R4.01–R4.05. **Trạng thái:** code trong phạm vi đã triển khai và kiểm tra trên Android emulator; **người dùng cần duyệt vị trí/kích thước người kể và caption (G4)**. Phase 5–7/voice chưa được phép.

## Quyền thực hiện

- Người dùng duyệt Phase 3 và yêu cầu triển khai Phase 4.
- Spec: [`2026-10-03-phase-4-camera-qa-design.md`](../docs/superpowers/specs/2026-10-03-phase-4-camera-qa-design.md).

## Thay đổi

| File | Nội dung |
| --- | --- |
| `mobile/package.json`, `package-lock.json` | Thêm **`expo-camera` 57.0.6** bằng `npx expo install` (dependency duy nhất của phase này). |
| `mobile/app.json` | Plugin `expo-camera` với câu xin quyền tiếng Việt; `android.permissions: ["android.permission.CAMERA"]`; `NSCameraUsageDescription` cho iOS. |
| `mobile/src/qr/parseQr.ts` (mới) | `parseQrNodeId`: chỉ nhận `ngo-ke://node/<id>` với id đúng dạng. |
| `mobile/src/qr/confirmPoint.ts` (mới) | `confirmByQr` (QR → node đã biết, không tự đổi điểm), `selectManually`. |
| `mobile/src/screens/CameraScreen.tsx` (mới) | Camera **tắt** khi mở màn; bấm nút mới xin quyền và bật; thẻ xác nhận sau khi quét; lớp người kể 2D tạm + caption trên preview; chọn tay luôn dùng được; nút tắt camera. |
| `mobile/src/data/sourceState.ts` | `DemoNode` nay có đủ trường schema (`summary`, `tags`, `visitMinutes`, `available`, `visited`, `story`, `caption`) và validator kiểm từng trường; `TOPICS`/`Topic` khai báo ở đây. |
| `mobile/src/recommendation/pick.ts` | Dùng `DemoNode`/`Topic` từ schema, bỏ khai báo trùng; `TOPIC_LABELS` xuất ra để tái dùng. |
| `mobile/src/screens/PlanScreen.tsx` | Bỏ ép kiểu `as unknown as PlanNode[]`. |
| `mobile/App.tsx`, `src/navigation.ts`, `src/screens/HomeScreen.tsx` | Route `Camera`; Home có nút mở màn camera; bỏ placeholder Phase 4; chữ Phase 1–4. |
| `data/demo.json` | Mỗi node thêm `story` và `caption` (mô phỏng). |
| `mobile/tests/cameraQr.test.mjs` (mới) | 6 ca: QR đúng mọi node, mã sai định dạng/sai scheme bị từ chối, node lạ **không** được xác nhận, chọn tay, fallback sau khi quét bị từ chối, mọi node có lời kể và caption ≤220 ký tự. |
| `mobile/tests/sourceState.test.mjs` | Bổ sung ca lỗi cho `story`/`caption` rỗng, chủ đề ngoài danh sách, `visitMinutes` ≤ 0. |

Không thêm mascot, không chọn/thu giọng, không gắn audio, không GPS, không backend live.

## Kiểm tra thật

Node **24.19.0**, npm **11.17.0**; cwd `mobile/`.

| Lệnh / thao tác | Kết quả |
| --- | --- |
| `npm test` | **69/69 đạt** (63 ca cũ + 6 ca Phase 4) |
| `npm run typecheck` | Exit 0 |
| `npm run lint` | Exit 0 |
| `npm run check:dependencies` | Exit 0 |
| `npx --yes expo-doctor` | Exit 0, **21/21 đạt** |
| `npm run build:android` | Exit 0 (xuất bundle; không phải runtime pass) |
| `npm run build:ios` | Exit 0 (không phải iOS runtime pass) |
| `npm audit --json` | Exit 1, **23 cảnh báo: 7 moderate, 16 high** (không đổi so với phase trước) |
| Android emulator Medium_Phone, Android 17/API 37, Expo Go 57.0.9 | **19/19 ca đạt** (xem bên dưới) |

### 19 ca trên emulator

1. Home tải được, có nút mở màn camera.
2. Mở màn camera **chưa** bật camera, đã có sẵn lựa chọn bằng tay.
3. Chỉ khi bấm nút mới hiện hộp thoại xin quyền của hệ thống.
4. **Từ chối** quyền → camera vẫn tắt, có câu giải thích và vẫn chọn điểm bằng tay được.
5. Chọn tay → đọc lời kể bằng chữ, màn hình nói rõ đang đọc bằng chữ.
6. Đã cấp quyền → mở màn vẫn phải tắt camera, bấm nút mới bật.
7. Camera bật vẫn chọn điểm bằng tay được.
8. Sau khi chọn điểm: lớp người kể 2D tạm + caption của điểm hiện trên preview, lời kể hiện kèm.
9. Rời màn bằng phím Back → về Home **và camera được trả về**.

Bằng chứng camera thật sự bật/đã trả: `dumpsys media.camera` cho thấy `Active Camera Clients` có `Camera ID: 10 … host.exp.exponent` khi màn camera đang mở và **rỗng** sau khi rời màn — xem [camera-release.txt](evidence/phase-4/camera-release.txt) và [camera-release-checks.json](evidence/phase-4/camera-release-checks.json).

Ảnh: [camera tắt](evidence/phase-4/camera-off.png) · [từ chối quyền](evidence/phase-4/camera-denied.png) · [camera bật](evidence/phase-4/camera-on.png) · [người kể + caption](evidence/phase-4/narrator-caption.png) · [đọc bằng chữ](evidence/phase-4/story-without-camera.png). Lệnh/exit: [checks.json](evidence/phase-4/checks.json), [interaction-checks.json](evidence/phase-4/interaction-checks.json).

## Chưa kiểm chứng được (quan trọng)

- **Quét QR thật chưa kiểm end-to-end trên emulator.** Máy ảo dùng cảnh camera ảo, không đưa được mã QR vào khung hình. Phần ánh xạ `payload → node` được kiểm bằng 6 ca test, nhưng chuỗi "camera nhìn thấy mã → callback → mở người kể" **chưa chạy thật lần nào**. Cần chạy trên điện thoại thật, in mã `ngo-ke://node/demo-03` để thử.
- **Chưa kiểm tra iPhone hay điện thoại thật** → R4.05 ghi "chưa kiểm tra".
- Chưa kiểm tra: offline cold start, screen reader, bàn phím thật, nhiều mã QR cùng lúc.

## Lỗi tìm được trong lúc làm

- Script kiểm tra của em tìm nhãn rồi mới cuộn → nút trôi khỏi màn hình và báo fail giả; và kiểm tra Home sau khi đã điều hướng. Đã sửa thứ tự kiểm tra, không sửa app.
- "Back về Home" báo fail một lần vì Home khôi phục vị trí cuộn cũ nên tiêu đề nằm trên vùng nhìn; đã cuộn lên kiểm lại và xác nhận về đúng Home.
- Lần đầu chạy báo fail vì app khởi động chậm, chưa đợi đủ; đã chờ theo trạng thái Home.
- Hộp thoại quyền không hiện lần thứ hai vì Android đã ghi nhớ "don't ask again" từ lần từ chối trước; phải `pm clear-permission-flags` trước mỗi lần kiểm.
- Kiểm tra "camera đã trả về" ban đầu dùng regex sai chỗ nên pass nhầm; đã đổi sang đọc thẳng `Active Camera Clients` và kiểm cả trường hợp camera **đang** bật để chứng minh phép đo có ý nghĩa.
- `DemoNode` trước đó chỉ khai báo `id`/`name` còn dữ liệu có 9 trường, nên `PlanScreen` phải ép kiểu. Đã khai báo đúng schema và cho validator kiểm từng trường.

## Ranh giới

- Lời kể và caption vẫn là **mô phỏng**, ghi rõ trên màn hình.
- Người kể 2D là **hình tạm** (hình tròn chữ “Kể”), chưa phải mascot; **vị trí và kích thước cần anh duyệt**.
- App **không tự đổi điểm**: quét trúng chỉ hiện thẻ xác nhận, người dùng bấm mới mở người kể.
- Mã QR **sinh từ `id`** theo công thức `ngo-ke://node/<id>`, không lưu trùng trong dataset; nhóm data in mã theo công thức này.
- **Chưa có:** GPS/khoảng cách (Phase 5), backend live (Phase 6), voice/TTS.
- Màn camera chưa có test giao diện tự động (chỉ kiểm thủ công trên emulator) vì chưa thêm thư viện render.
- Điểm đã xác nhận **chưa được lưu làm "điểm hiện tại"** của app; màn này chỉ hiển thị nội dung tại điểm đó. Việc lưu phiên và đổi node toàn cục thuộc phase sau.

## Nội dung cần anh review

1. **Vị trí và kích thước người kể 2D**: hiện là hình tròn 96px giữa cạnh dưới preview, caption nằm ngay dưới. Anh muốn dời sang góc, làm nhỏ hơn, hay đặt caption ở đỗ khác?
2. **Có nên hiện lời kể đầy đủ (`story`) dưới preview không**, hay chỉ giữ caption ngắn trên camera?
3. **Có nên giữ nút “Tắt camera”** trên màn không, hay chỉ tắt khi rời màn?
4. **Câu xin quyền** hiện là “Cho phép Ngõ Kể dùng camera để quét mã QR của điểm.” — anh duyệt câu này không?
5. **Định dạng mã QR `ngo-ke://node/<id>`** — anh duyệt để nhóm data in mã đúng công thức.

**Dừng ở Phase 4.** Chưa chốt G4, chưa bắt đầu Phase 5.