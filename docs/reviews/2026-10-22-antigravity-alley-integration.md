# Báo Cáo Tích Hợp 2 Ngõ Phố Cổ & Vẽ Đường Mòn Home Theo Polyline Thực Tế

- **Thời gian thực hiện:** 2026-10-22
- **Người thực hiện:** W2 (Antigravity Worker)
- **Coordinator:** Codex (`term_211f244d-47b9-46bd-8efa-ca17ceaabe44 generation3`)
- **Tài liệu tham chiếu:** `docs/ALLEY_INTEGRATION_SPEC_20261022.md`
- **Phạm vi sở hữu:** `mobile/src`, `mobile/tests`, `data/localized`, `mobile/assets/photos/alleys`

---

## 1. Tóm Tắt Thực Hiện

### a. Bộ Dữ Liệu V2 Mô Phỏng (Simulated Collections)
- **Tạo 4 tệp dữ liệu V2 song ngữ:**
  - `data/localized/ngo-gach.vi.json` & `data/localized/ngo-gach.en.json` (5 trạm, polyline 8 điểm tọa độ, chiều dài 128m).
  - `data/localized/ngo-trung-yen.vi.json` & `data/localized/ngo-trung-yen.en.json` (5 trạm, polyline 8 điểm tọa độ, chiều dài 146m).
- **Trạng thái minh bạch:** Cả hai collection được đánh dấu `kind: "simulated"`, `qa: []`, không gán `reviewStatus: "approved"`, disclaimer nhấn mạnh dữ liệu nghiên cứu demo chưa qua khảo sát thực địa.
- **SHA-256 Revisions (qua canonicalDatasetJson):**
  - `ngo-gach.vi`: `0b8d32ff1a4fac3867995d7be7c4394be4ef9080425c5217ebb65d7df5e90aa3`
  - `ngo-gach.en`: `2458be77514edfa0e4fb194f46e7f0191e5d655ccfd7e6c96b8f044f5179df59`
  - `ngo-trung-yen.vi`: `b8fa25cb6fbe31a5bd5806d0af8af231a59d9fa1279508671df9f624135cb889`
  - `ngo-trung-yen.en`: `8aa4d4c20413cc372f525bc111df575d5c8de60215ce11254d66b2452b5b75b1`

### b. Kiểm Tra Ranh Giới Schema & Regression
- **`mobile/src/data/sourceState.ts`:**
  - `isDemoNode`: Cho phép `story: null` cho simulated V2; Schema 1 và reviewed V2 tuyệt đối từ chối `story: null`.
  - Kiểm tra `order` (nguyên dương >= 1), `alongAlleyMeters` (số hữu hạn >= 0 hoặc null), `pendingCheck` (chuỗi có độ dài <= 500 ký tự hoặc null).
  - `isDatasetV2`: Kiểm tra `polyline` (mảng tọa độ hữu hạn hợp lệ, vĩ độ [-90, 90], kinh độ [-180, 180], từ 2 đến 500 điểm) và `lengthMeters` (số hữu hạn dương).
  - Schema 1 `isDataset` giữ nguyên vẹn ranh giới cũ không bị nới lỏng.

### c. Đăng Ký Collection & Ngôn Ngữ (i18n)
- **`mobile/src/data/collections.ts`:**
  - Thêm `'ngo-gach'` và `'ngo-trung-yen'` vào `CollectionId`, `AVAILABLE_COLLECTIONS`, `COLLECTION_REVISIONS`, `getBundledDataset`, và `isCollectionId`.
- **`mobile/src/i18n/translator.ts`:**
  - Bổ sung translation keys cho tên, chủ đề, quận, tagline song ngữ cho cả hai ngõ.

### d. Ánh Xạ Hình Ảnh & Credit Bản Quyền Trung Thực
- **`mobile/src/assets/photoMap.ts`:**
  - Ánh xạ đầy đủ 10 điểm trong `NODE_PHOTO_MAP` (4 ảnh demo thực tế tại `mobile/assets/photos/alleys/`: Đình Thanh Hà, Chùa Cầu Đông, Phở Sướng, Bún cá Sâm Cây Si; 6 điểm dùng ảnh minh họa Pexels).
  - Ghi nhận quyền ảnh chính xác theo bản nháp: `Google Maps contributor (name not recorded · demo)` cho 4 ảnh demo và ghi chú `(Pexels · ảnh minh họa)` cho ảnh mô phỏng.
  - Cập nhật `ALLEY_LIST` cho cả `ngo-gach` (5 trạm, Di sản, 128m) và `ngo-trung-yen` (5 trạm, Ẩm thực, 146m).

### e. Hình Học Ngõ & Dải Đường Mòn Home (Shared Utility & Wiring)
- **`mobile/src/utils/alleyGeometry.ts`:**
  - `computeAlleyLayout`:
    - Chiếu polyline tọa độ (lat, lon) ngõ thật vào canvas màn hình, bảo toàn tỉ lệ (aspect ratio).
    - Xoay ngõ để trục chuyển dịch trải dọc từ trên xuống dưới (monotonically increasing Y).
    - Định vị các trạm dọc theo ngõ theo mét thực tế (`alongAlleyMeters`), nội suy tuyến tính giữa các mốc tọa độ đã biết cho các điểm chưa có tọa độ thật (`alongAlleyMeters: null`).
  - `buildSmoothPath`:
    - Tạo đường cong Bezier Catmull-Rom mượt mà liên tục từ đầu đến cuối ngõ.
- **`mobile/src/screens/HomeScreen.tsx`:**
  - Import và sử dụng trực tiếp shared utility `computeAlleyLayout` và `buildSmoothPath` từ `../utils/alleyGeometry`.
  - Fallback nguyên vẹn cấu hình `PIN_CONFIG` cho các dataset cũ không có polyline (`fiction-letter`).
  - Nhãn trung thực: Điểm có `story: null` chỉ hiển thị `summary`, ẩn hoàn toàn nút CTA "Đọc lời kể", nhãn a11y của trạm là tên điểm trung thực (không hứa hẹn "Xem lời kể").
  - Hiển thị nổi bật cảnh báo `⚠️ pendingCheck` khi điểm đang chờ kiểm tra thực địa.
  - Hỗ trợ trợ năng khi phóng to chữ (`fontScale > 1.3`): bổ sung summary chỉ áp dụng cho bộ dữ liệu có polyline / summary-only; bộ dữ liệu cũ giữ nguyên hành vi thu gọn (ẩn summary và credit text để giữ không gian cuộn); credit ảnh vẫn truy cập được qua `accessibilityHint`.
  - Không thêm default export vào production code.

---

## 2. Kết Quả Kiểm Tra Chất Lượng (Quality Gate)

1. **Unit & Integration Test Suite (`node --test tests/*.test.mjs`):**
   - **Kết quả:** `321 / 321 pass` (100%), thời gian chạy ~6.2s.
   - Bao gồm 14 ca kiểm thử mới chuyên biệt trong `mobile/tests/alleyIntegration.test.mjs`:
     - (a) Đăng ký collection và metadata đầy đủ cho `ngo-gach`, `ngo-trung-yen`.
     - (a) Kiểm tra V2 schema và pair validation song ngữ VI/EN.
     - (a) Ánh xạ ảnh và credit ảnh Google Maps contributor.
     - (a.2) Kiểm tra từ chối dữ liệu V2 sai định dạng (polyline, lengthMeters, order, alongAlleyMeters, pendingCheck, và Schema 1 / reviewed V2 từ chối `story: null`).
     - (b) Hình học ngõ Ngõ Gạch trải dọc màn hình, tọa độ Y tăng dần.
     - (b) Nội suy tọa độ cho các trạm chưa có mốc tại Ngõ Trung Yên.
     - (b) Mounted Home wiring Ngõ Gạch: kiểm tra SVG main Path.d khớp chuẩn `buildSmoothPath(computeAlleyLayout(...).splinePoints)` và tọa độ pins thực tế rendered khớp hình học với thứ tự tăng dần.
     - (b) Mounted Home wiring Ngõ Trung Yên: kiểm tra SVG main Path.d và pins rendered khớp hình học.
     - (b) Dataset cũ (`fiction-letter`) giữ nguyên 6 pins từ `PIN_CONFIG`.
     - (c) Nhãn trung thực: Điểm `story: null` hiển thị summary, nhãn pin trung thực không hứa hẹn "Xem lời kể", và không hiển thị nút "Đọc lời kể".
     - (c) Điểm có lời kể nháp sẵn sàng hiển thị nút "Đọc lời kể" và nhãn a11y `Xem {name}`.
     - (c) Điểm có `pendingCheck` hiển thị cảnh báo `⚠️`.
     - (c) Trợ năng: fontScale > 1.3 hiển thị summary và pendingCheck cho dataset polyline; dataset cũ ẩn summary và credit text bảo toàn hành vi body room; credit ảnh qua accessibilityHint.
2. **Typecheck (`npm run typecheck --prefix mobile`):**
   - **Kết quả:** `0 errors` (`tsc --noEmit` hoàn tất không có lỗi).
3. **Linter (`npm run lint --prefix mobile`):**
   - **Kết quả:** `0 errors`, `0 warnings` (ESLint sạch hoàn toàn).
4. **Git Diff Check (`git diff --check`):**
   - **Kết quả:** Mã thoát 0, không có trailing whitespace hay lỗi định dạng dòng.
5. **Metro Dev Server Probe (Port 8082):**
   - **Thao tác:** Read-only HTTP GET probe tới `http://localhost:8082/status`.
   - **Kết quả:** HTTP 200 `packager-status:running`, không restart tiến trình.

---

## 3. Hiệu Chỉnh Hẹp Đợt Cuối (Narrow Final Corrections)

1. **Mounted Home Wiring Verification:**
   - Thay vì chỉ kiểm tra utility độc lập, đã bổ sung 2 ca kiểm thử mounted thực tế trên `HomeScreen` cho cả Ngõ Gạch và Ngõ Trung Yên, xác nhận thuộc tính `d` của thẻ SVG `Path` khớp từng ký tự với đầu ra của `buildSmoothPath(layout.splinePoints)`, và vị trí `left`/`top` của các nút trạm rendered khớp vị trí pixel tính toán từ hình học.
2. **Nhãn Trợ Năng Trạm Trung Thực (`story: null`):**
   - Nút trạm có `story: null` (như Cà Phê No.1, Phở Vui) không còn dùng chuỗi `home.open_story` ("Xem {name}"); nhãn trợ năng được chuyển sang tên trạm trực tiếp (`node.name`).
3. **Phạm Vi Large-Font Summary Phù Hợp:**
   - Ở `fontScale > 1.3`, `previewSummary` chỉ hiển thị thêm cho bộ dữ liệu có polyline hoặc trạm chỉ có tóm tắt (`Boolean(datasetPolyline || !currentNode.story)`). Đối với bộ dữ liệu cũ (`fiction-letter`), tóm tắt và credit text được ẩn để nhường không gian cuộn cho màn hình, bảo toàn nguyên vẹn assertion kiểm thử kế thừa.
4. **Khôi Phục Stale Dead Chip EN:**
   - Trong `mobile/tests/uiFlows.test.mjs`, đã khôi phục kỳ vọng loại trừ `'Ẩm thực'` cho danh sách tiếng Anh (`loc === 'en'`), chỉ bỏ qua trên tiếng Việt vì Ngõ Trung Yên có chủ đề tiếng Việt là `'Ẩm thực'`.

---

## 4. Giới Hạn Đã Ghi Nhận & Lưu Ý Đợt Sau

1. **Bản Quyền Hình Ảnh:**
   - 4 ảnh tại `mobile/assets/photos/alleys/` được thu thập từ nguồn cộng tác viên Google Maps cho mục đích công nghệ demo; quyền sử dụng thương mại chính thức chưa được cấp phép.
   - Các điểm còn lại dùng ảnh đại diện minh họa từ Pexels (`Thuan Pham`, `Dang Hong`) kèm nhãn `ảnh minh họa`.
2. **Tọa Độ & Khảo Sát Thực Địa:**
   - Polyline và tọa độ địa lý được trích xuất từ OpenStreetMap (ODbL) với 8 điểm cho Ngõ Gạch và 8 điểm cho Ngõ Trung Yên. Một số trạm ẩm thực (Phở Vui, Bún ngan Nhàn) được định vị theo nội suy hình học tương đối giữa các trạm đã biết, cần khảo sát thực địa bằng GPS máy thật khi triển khai giai đoạn thương mại.
3. **Nội Dung Lời Kể & Chờ Kiểm Tra (`pendingCheck`):**
   - Lời kể của các trạm là bản nháp nghiên cứu (draft/available), không khẳng định là dữ liệu lịch sử đã thẩm định (verified).
   - Thông tin tu bổ Đình Thanh Hà (tháng 3/2024) được giữ nguyên theo bản nháp tiếng Việt; phiên bản tiếng Anh lưu giữ nguyên trạng ghi chú này do chưa có văn bản thẩm định lịch sử được duyệt chính thức.
4. **Kỷ Luật Thực Hiện:**
   - Không commit, không push git, không restart Metro dev server. Toàn bộ WIP hiện tại được bảo toàn nguyên vẹn.
