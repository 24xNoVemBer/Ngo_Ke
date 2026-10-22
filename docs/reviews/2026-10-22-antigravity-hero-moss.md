# Báo cáo Cập nhật Ảnh Nền Hero Pexels & Phục hồi Phong cách Rêu Phố Cổ — Antigravity (W2)
**Ngày thực hiện:** 22/10/2026
**Nhiệm vụ:** Task `task_7dee31761114` / Dispatch `ctx_c363c7da395b`
**Yêu cầu người dùng:** Thay ảnh nền Ngõ Kể bằng ảnh Pexels 28170047 và khôi phục phong cách màu xanh rêu (moss-green color style).
**Quyền sở hữu:** Antigravity (W2) sở hữu toàn bộ triển khai FE; Codex điều phối/review.
**Môi trường:** Worktree `logic-fix-mobile-20261020`, Metro port 8082 đang phục vụ cả Android và iOS.

---

## 1. Tóm tắt kết quả (Executive Summary)

1. **Khảo sát & Lai lịch ảnh (Photo Provenance):**
   - Bức ảnh được người dùng yêu cầu: Pexels ID `28170047` — *Vietnamese alleyway decorated with flags* bởi tác giả **HONG SON** (`@hson`), URL: `https://www.pexels.com/vi-vn/anh/con-h-m-vi-t-nam-d-c-trang-tri-b-ng-c-28170047/`.
   - Đối chiếu tài liệu và chỉ đạo điều phối (`docs/IMAGE_SOURCES.md` dòng 31 và message `msg_3bf1133b5a85`), ảnh này đã được tuyển chọn và đóng gói sẵn tại `mobile/assets/photos/pexels_demo_06.jpg` (kích thước 1000×1500, JPEG). Thay vì tạo thêm tệp ảnh trùng lặp làm phình bundle, hệ thống tái sử dụng trực tiếp asset đóng gói sẵn này, đồng thời bảo toàn nguyên vẹn tệp gốc `cover_hero.jpg` (dùng cho bìa Ngõ Phất Lộc trong `ALLEY_LIST` và lưu trữ lịch sử).
   - Tuyệt đối không can thiệp pixel bằng bộ lọc Python hay sinh ảnh giả mạo.

2. **Cập nhật Ánh xạ & Bản quyền (`photoMap.ts` & `IMAGE_SOURCES.md`):**
   - Đã cập nhật `HERO_PHOTO` trỏ về `require('../../assets/photos/pexels_demo_06.jpg')`.
   - Cập nhật hàm `getNodePhotographer()` fallback về `'HONG SON (Pexels)'`, không gán nhầm tên tác giả cũ cho ảnh hero mới.
   - Cập nhật tài liệu `docs/IMAGE_SOURCES.md` ghi nhận đầy đủ vai trò của `pexels_demo_06.jpg` là **Header Cover Hero** (`HERO_PHOTO`) trên `PrologueScreen` & `LandingScreen`, URL Pexels, ID 28170047 và tác giả HONG SON.

3. **Cân chỉnh Sắc diện Rêu Olive (`PrologueScreen` & `LandingScreen`):**
   - **`PrologueScreen.tsx`:** Điều chỉnh lớp phủ `scrim` sang sắc rêu olive sẫm `rgba(18, 30, 23, 0.70)` (thay cho `rgba(20, 24, 19, 0.72)`), nhằm làm dịu vùng ảnh sáng và giữ chữ kem (`#FFFDF7`, `#E8D5BC`) dễ đọc. **Hiệu chỉnh của coordinator:** chưa đo tỷ lệ tương phản trên ảnh sau compositing và chưa xem render native; không có bằng chứng để khẳng định tỷ lệ >7:1 hoặc chất lượng màu trên màn hình thật.
   - **`LandingScreen.tsx`:** Điều chỉnh lớp phủ `scrimOverlay` sang `rgba(18, 30, 23, 0.44)` (thay cho `rgba(22, 24, 18, 0.40)`), tạo sự đồng điệu nhẹ nhàng với bảng màu rêu phố cổ, giữ cho nền ảnh hiển thị trong trẻo dưới các thẻ nội dung.
   - Giữ nguyên vẹn 100% bố cục màn hình, bộ chọn ngôn ngữ, phím tắt nhanh GPS/Sổ tay, vòng đời âm thanh/chuyển động và toàn bộ dữ liệu VI/EN.

---

## 2. Bảng thông số màu sắc & Cân chỉnh UI (Atmosphere & Tint Palette)

| Vị trí / Thành phần | Giá trị cũ | Giá trị mới (Rêu / Moss-Green) | Hiệu ứng thị giác & Mục đích |
|---|---|---|---|
| **`photoMap.ts`** `HERO_PHOTO` | `cover_hero.jpg` | `pexels_demo_06.jpg` | Ảnh Pexels 28170047 (HONG SON): con ngõ rợp cờ đỏ sao vàng, chiều sâu hun hút. |
| **`photoMap.ts`** Hero Credit | `'Ngõ Kể Project'` | `'HONG SON (Pexels)'` | Ghi nhận tác quyền minh bạch, chính xác cho tác giả Pexels. |
| **`PrologueScreen.tsx`** `styles.scrim` | `rgba(20, 24, 19, 0.72)` | `rgba(18, 30, 23, 0.70)` | Lớp phủ rêu olive sẫm (R=18, G=30, B=23). Dịu ánh sáng vòm trời, giữ cờ đỏ thắm và độ sâu ngõ, chữ kem nổi bật. |
| **`LandingScreen.tsx`** `styles.scrimOverlay` | `rgba(22, 24, 18, 0.40)` | `rgba(18, 30, 23, 0.44)` | Lớp phủ rêu mỏng điện ảnh, liên kết không gian đồng điệu với màn Prologue mà không che khuất thẻ card. |
| **Màu chữ & Nhấn (giữ nguyên)** | `#FFFDF7`, `#E8D5BC`, `#2D5748`, `#B9A589` | Giữ nguyên | Giữ bảng màu hiện có; độ đọc và tương phản trên ảnh nền cần kiểm trên render native. |

---

## 3. Danh sách tệp chỉnh sửa (Files Modified)

1. `mobile/src/assets/photoMap.ts`: Chuyển `HERO_PHOTO` sang `pexels_demo_06.jpg` và cập nhật fallback tác giả HONG SON.
2. `mobile/src/screens/PrologueScreen.tsx`: Tinh chỉnh `styles.scrim` sang lớp phủ rêu olive `rgba(18, 30, 23, 0.70)`.
3. `mobile/src/screens/LandingScreen.tsx`: Tinh chỉnh `styles.scrimOverlay` sang lớp phủ rêu `rgba(18, 30, 23, 0.44)`.
4. `docs/IMAGE_SOURCES.md`: Ghi nhận `cover_hero.jpg` là tư liệu lịch sử / bìa Phất Lộc; ghi nhận `pexels_demo_06.jpg` là Header Cover Hero với credit tác giả HONG SON, URL Pexels 28170047.
5. `docs/reviews/2026-10-22-antigravity-hero-moss.md`: Báo cáo chi tiết này.

---

## 4. Bằng chứng kiểm thử kỹ thuật (Verification Evidence)

1. **Bộ kiểm thử Node.js Test Runner:**
   - Lệnh: `npm test --prefix mobile` (`node --test tests/*.test.mjs`)
   - Kết quả: **321/321 tests passed (100% pass, 0 fail, 0 skipped)**.
   - Thời gian thực thi: ~5.2 giây.
2. **Kiểm tra kiểu dữ liệu TypeScript:**
   - Lệnh: `npm run typecheck --prefix mobile` (`tsc --noEmit`)
   - Kết quả: **0 lỗi**.
3. **Kiểm tra quy ước mã nguồn ESLint:**
   - Lệnh: `npm run lint --prefix mobile` (`eslint .`)
   - Kết quả: **0 lỗi, 0 cảnh báo**.
4. **Kiểm tra định dạng Git Diff:**
   - Lệnh: `git diff --check`
   - Kết quả: **0 lỗi (sạch sẽ, không có trailing whitespace hay conflict markers)**.
5. **Kiểm tra Metro 8082 Bundler:**
   - `curl http://localhost:8082/index.bundle?platform=android&dev=true` -> **HTTP 200**
   - `curl http://localhost:8082/index.bundle?platform=ios&dev=true` -> **HTTP 200**
   - Metro 8082 vẫn đang hoạt động liên tục, không bị khởi động lại.

---

## 5. Giới hạn môi trường & Phần chưa kiểm tra trên thiết bị thật (Limitations)

- **Môi trường cục bộ:** Môi trường hiện tại không có công cụ `adb` hoặc thiết bị/máy giả lập Android/iOS được kết nối.
- **Đánh giá thị giác native thực địa:** Độ hòa sắc thực tế trên tấm nền màn hình điện thoại (OLED/LCD) dưới ánh sáng ban ngày ngoài trời được ghi nhận ở trạng thái **pending kiểm chứng thiết bị thực**. Không tự tiện tuyên bố nghiệm thu thị giác native chỉ từ kết quả kiểm thử hay mã phản hồi HTTP 200 của Metro bundle.
