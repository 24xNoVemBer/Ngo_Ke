# Báo cáo Triển khai Redesign màn Landing (Antigravity)

**Ngày thực hiện:** 22/10/2026
**Chủ sở hữu:** Antigravity (Frontend Worker)
**Tài liệu căn cứ:**
- `docs/LANDING_REDESIGN_SPEC_20261022.md`
- `docs/reviews/2026-10-22-claude-landing-design-is.md` (Đánh giá theo 10 nguyên tắc Dieter Rams: 15/30)

---

## 1. Tóm tắt điều hành (Executive Summary)

1. **Những việc đã làm:** Đã hoàn thành toàn bộ 9 hạng mục đặc tả và 7 nhóm tiêu chí nghiệm thu của màn Landing theo triết lý Dieter Rams ("Càng ít càng tốt"). Nền dùng ảnh `HERO_PHOTO` (Pexels 28170047 / HONG SON) với `blurRadius={14}` và scrim rêu đồng nhất `rgba(18, 30, 23, 0.68)`. Header được tinh gọn với cụm phân đoạn `VI | EN` và nút Sổ tay (bỏ pill DEMO dạng nút); dòng trạng thái nội dung văn bản thường thay thế banner xanh; bỏ khối quote; chuyển Hộ chiếu ngõ phố (Alley Passport) vào trong `NotebookDrawerModal` dưới dạng một subview liền mạch không xếp chồng modal (tránh lỗi xung đột modal iOS); thẻ ngõ dùng dải đáy nền đặc `rgba(20, 22, 16, 0.78)` giữ ảnh nét riêng từng ngõ và tập trung chữ vàng bên trong thẻ; hai ô công cụ GPS và Sổ tay có cùng `minHeight: 72`, tiêu đề 1 dòng, mô tả 2 dòng đã rút gọn; tất cả nút chạm đều đạt chuẩn tối thiểu 44 pt và cỡ chữ văn bản đạt sàn 12 px (nhãn viết hoa 11 px).
2. **Kết quả kiểm thử & tích hợp:** Toàn bộ 328 test đều vượt qua (`328 passed, 0 failed` gồm 321 test nền tảng + 7 test nghiệm thu mới tại `mobile/tests/landingRedesign.test.mjs`), `npm run typecheck` đạt 0 lỗi, `npm run lint` đạt 0 cảnh báo, `git diff --check` không phát hiện lỗi khoảng trắng, và Metro 8082 (chế độ chỉ đọc) trả HTTP 200 cho cả bundle iOS và Android.
3. **Phần còn lại & Bàn giao:** Không sửa code ngoài phạm vi sở hữu (không động vào `HomeScreen.tsx`, `QaScreen.tsx`, `PrologueScreen.tsx`, backend hay voice); sẵn sàng chuyển giao kết quả để Codex triệu hồi Claude review độc lập (read-only).

---

## 2. Các lựa chọn mặc định tự chọn (Chưa được người dùng duyệt rõ ràng)

Theo chỉ dẫn tại spec và điều phối, do người dùng chưa phản hồi 3 câu hỏi thiết kế trong báo cáo đánh giá, Antigravity đã áp dụng các lựa chọn đề xuất làm mặc định. Xin ghi nhận rõ ràng: **đây là các mặc định thiết kế theo khuyến nghị chuyên môn, chưa phải là các quyết định được người dùng phê duyệt rõ ràng**:
1. **DEMO / LIVE là nhãn trạng thái:** Trên LandingScreen, chế độ chỉ hiển thị dưới dạng văn bản thường minh bạch (ví dụ: `Truyện chữ · nội dung mô phỏng · Demo`), bỏ nút bấm DEMO giả ở header. Việc chuyển đổi qua lại giữa chế độ Demo và Live nằm tập trung bên trong modal Sổ tay (`NotebookDrawerModal`).
2. **Bỏ khối quote khỏi Landing; chuyển Hộ chiếu ngõ phố vào Sổ tay:** Khối quote mang tính khẩu hiệu ("Giữ gìn hồn phố cổ") đã được gỡ bỏ khỏi Landing để nhường không gian cho nội dung chính. Alley Passport được tích hợp thành tính năng con bên trong modal Sổ tay với subview mượt mà, loại bỏ teaser thẻ và modal passport riêng biệt trên Landing.
3. **Nền ảnh mờ điện ảnh:** Sử dụng `ImageBackground` với `blurRadius={14}` kết hợp lớp phủ rêu `rgba(18, 30, 23, 0.68)` thay vì nền màu đặc phẳng không ảnh.
4. **Nút bánh răng xanh ở ảnh chụp:** Qua rà soát mã nguồn toàn bộ `mobile/src/`, không có thành phần nào định nghĩa nút tròn màu xanh có biểu tượng bánh răng. Đây là lớp phủ công cụ phát triển (developer overlay) của Expo Go trên thiết bị thử nghiệm, không thuộc mã nguồn ứng dụng thương mại.

---

## 3. Chi tiết thực hiện 9 Hạng mục Đặc tả

| # | Hạng mục | Trạng thái | Chi tiết triển khai |
|---|----------|------------|---------------------|
| 1 | **Nền** | Hoàn thành | `HERO_PHOTO` (pexels_demo_06) với `blurRadius={14}`, lớp phủ scrim rêu đồng nhất `rgba(18, 30, 23, 0.68)` (`LandingScreen.tsx`). Không thêm bất kỳ thư viện ngoài nào. |
| 2 | **Thẻ ngõ** | Hoàn thành | Bỏ scrim `0.45` phủ toàn thẻ. Mỗi thẻ dùng `col.coverPhoto` sắc nét riêng. Dải đáy thẻ nền đặc `rgba(20, 22, 16, 0.78)` chứa quận (vàng `#D4AF37`), tên ngõ (trắng 18px bold), tagline (trắng 85%) và dòng meta. Chữ vàng chỉ xuất hiện trong dải đáy này; các chữ bên ngoài thẻ (như link "Xem tất cả") dùng màu trắng 90% (`rgba(255, 253, 247, 0.90)`). Bỏ `· Demo` ở meta thẻ. |
| 3 | **Header** | Hoàn thành | Giữ nguyên logo `NgoKeLogo` (`flexShrink: 1`). Nút ngôn ngữ phân đoạn `VI \| EN` với `testID="locale-switch"`, `testID="locale-option-vi"` và `testID="locale-option-en"`, hiển thị nổi bật ngôn ngữ đang chọn, gắn kèm nhãn đọc màn hình và `accessibilityState.selected`. Nút "Sổ tay" (`testID="landing-header-notebook"`) gồm icon sách và chữ mở trực tiếp `NotebookDrawerModal`. Bỏ hoàn toàn pill DEMO dạng nút. |
| 4 | **Trạng thái** | Hoàn thành | Một dòng chữ thường tinh gọn `styles.statusLineText` (12px, trắng 85%) nằm dưới header: `landing.mode_status` (`Truyện chữ · nội dung mô phỏng · {mode}`). Bỏ hoàn toàn banner xanh bo tròn `soundscapeBanner`. Đổi tên khóa i18n từ `landing.soundscape_banner` sang `landing.mode_status` (đồng thời giữ alias tương thích ngược). |
| 5 | **Bớt khối** | Hoàn thành | Bỏ khối quote khỏi Landing. Bỏ teaser thẻ Passport và bỏ RN `<Modal visible={passportVisible}>` trên Landing. Chuyển toàn bộ nội dung Alley Passport vào `NotebookDrawerModal` dưới dạng subview nội bộ. Bỏ pretitle "FEATURED JOURNEYS" và pretitle "TIỆN ÍCH"; mỗi mục chỉ dùng 1 tiêu đề chính rõ ràng. |
| 6 | **Hai ô công cụ** | Hoàn thành | Khung lưới `quickActionsGrid` dùng `alignItems: 'stretch'`. Hai thẻ `landing-quick-gps` và `landing-quick-notebook` cùng đạt `minHeight: 72`, tiêu đề `numberOfLines={1}`, mô tả `numberOfLines={2}`. Đã rút gọn chuỗi dịch VI (`Biết mình đang ở điểm nào`, `Hành trình, tem hộ chiếu và đổi chế độ`) và EN (`Find your current alley stop`, `Alley passport, tools and mode switch`). |
| 7 | **Vùng chạm 44 pt** | Hoàn thành | Link "Xem tất cả" (`seeAllLink`) đạt `minHeight: 44`. Các nút phân đoạn `VI` và `EN` đạt `minHeight: 44, minWidth: 44`. Nút header Sổ tay đạt `minHeight: 44, minWidth: 44`. Nút đóng Sổ tay và nút đóng/quay lại Passport trong `NotebookDrawerModal` đều đạt `44x44 pt`. Thẻ công cụ đạt `minHeight: 72`. |
| 8 | **Chữ** | Hoàn thành | Sàn cỡ chữ văn bản đạt tối thiểu 12 px (mô tả công cụ 12px, quận 12px, đếm điểm dừng 12px, thời lượng 12px, hướng dẫn passport 12px, nhãn tem 12px). Các nhãn viết hoa đạt tối thiểu 11 px (theme tag 11px, badge sample 11px, phase 11px). Không còn cỡ chữ 9, 9.5 hay 10 px. |
| 9 | **Bảo toàn** | Hoàn thành | Bảo toàn thẻ trạng thái Live (`liveStateCard`: loading, error, empty, retry, switch to demo). Bảo toàn điều hướng (`AlleySelect`, `Home`, `Location`). Bảo toàn luồng dữ liệu `getLocalizedCollections` và `getBundledDataset`. Bảo toàn hành vi co giãn xếp chồng khi `fontScale > 1.2` và `> 1.3`. Bảo toàn logo và hiệu ứng `useEntranceFadeSlide`. |

---

## 4. Tương thích Modal & Sổ tay (`NotebookDrawerModal.tsx`)

Nhằm khắc phục triệt để nguy cơ lỗi xếp chồng modal trên iOS (khi mở modal này đè lên modal khác gây treo hoặc màn hình đen), `NotebookDrawerModal.tsx` đã được thiết kế lại theo mô hình **Single Presentation / Internal Subview**:
- **Trạng thái nội bộ:** `const [activeView, setActiveView] = useState<'menu' | 'passport'>('menu');`.
- **View chính (`menu`):** Chứa lưới công cụ (`Plan`, `Camera`, `GPS`, `Passport` `testID="notebook-tool-passport"`) và khối nguồn dữ liệu (`Demo/Live toggle`, `retry live`).
- **Subview Hộ chiếu (`passport`):** Khi chạm vào thẻ Hộ chiếu, nội dung sheet chuyển đổi sang giao diện Passport với nút quay lại (`testID="notebook-passport-back-btn"`), tiêu đề hộ chiếu, nút đóng (`testID="notebook-passport-close-btn"`), hướng dẫn và danh sách các con ngõ kèm tem di sản.
- **Tương thích ngược 100%:** Giữ nguyên toàn bộ `NotebookDrawerModalProps`. Các màn hình gọi chung như `HomeScreen.tsx` và `QaScreen.tsx` hoàn toàn tương thích, không cần sửa đổi bất kỳ dòng code nào.

---

## 5. Danh sách Tệp đã Sửa đổi & Tạo mới

1. **`mobile/src/screens/LandingScreen.tsx`** (Sửa đổi):
   - Áp dụng nền mờ `blurRadius={14}` và scrim rêu `rgba(18, 30, 23, 0.68)`.
   - Bố cục lại header với logo, segmented control `VI | EN` (`testID="locale-switch"`), nút Sổ tay (`testID="landing-header-notebook"`).
   - Thêm dòng trạng thái văn bản thường `landing.mode_status`.
   - Cập nhật thẻ ngõ với dải đáy nền đặc `rgba(20, 22, 16, 0.78)`, loại bỏ scrim toàn thẻ, chữ vàng nằm trong thẻ.
   - Chuẩn hóa hai ô công cụ `minHeight: 72`, `numberOfLines={1}` cho tiêu đề, `numberOfLines={2}` cho mô tả.
   - Gỡ bỏ khối quote, teaser passport và modal passport riêng.
2. **`mobile/src/components/NotebookDrawerModal.tsx`** (Sửa đổi):
   - Thêm subview Alley Passport và nút công cụ `notebook-tool-passport`.
   - Bổ sung nút quay lại (`notebook-passport-back-btn`), nút đóng (`notebook-passport-close-btn`), danh sách tem 6 điểm.
   - Nâng cấp toàn bộ vùng chạm lên tối thiểu 44 pt và cỡ chữ lên tối thiểu 12 px (nhãn viết hoa 11 px).
3. **`mobile/src/i18n/translator.ts`** (Sửa đổi):
   - Thêm khóa `landing.mode_status`, `landing.header_notebook`, `landing.header_notebook_label`.
   - Cập nhật chuỗi rút gọn cho `landing.quick_gps_desc` và `landing.quick_notebook_desc` cả VI và EN.
   - Giữ alias `landing.soundscape_banner` để bảo toàn tương thích.
4. **`mobile/tests/landingRedesign.test.mjs`** (Tạo mới):
   - Bộ kiểm thử độc lập bao quát đầy đủ 7 nhóm tiêu chí nghiệm thu (a) đến (g).
5. **`mobile/tests/landingQuickActions.test.mjs`** (Sửa đổi):
   - Cập nhật kiểm chứng việc bỏ pretitle ở mục công cụ theo spec Dieter Rams #10 (thay vì mong đợi pretitle xuất hiện).
6. **`mobile/tests/uiFlows.test.mjs`** (Sửa đổi):
   - Cập nhật kiểm chứng việc bỏ khối quote trên LandingScreen theo spec Dieter Rams #10 (thay vì mong đợi quote mark xuất hiện).

---

## 6. Bằng chứng Kiểm chứng & Nghiệm thu Kỹ thuật

### A. Kiểm thử tự động (`npm test --prefix mobile`)
```
ℹ tests 328
ℹ suites 0
ℹ pass 328
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5093.2424
```
- **321 test gốc:** Đều pass 100%. Các test cũ kiểm tra quote và pretitle được cập nhật trung thực để khẳng định việc loại bỏ theo thiết kế mới, không hạ thấp hay bỏ qua tiêu chuẩn.
- **7 test mới (`landingRedesign.test.mjs`):**
  - `(a)` LandingScreen loại bỏ hoàn toàn quote card, green banner và nút bấm DEMO;
  - `(b)` Header kết hợp segmented VI|EN control và nút Sổ tay mở modal;
  - `(c)` Hộ chiếu ngõ phố mở và tương tác được trong Sổ tay dưới dạng subview, không lồng Modal;
  - `(d)` Công tắc Demo/Live trong Sổ tay hoạt động chính xác;
  - `(e)` Hai ô công cụ đồng nhất `minHeight: 72`, `numberOfLines={1}` cho tiêu đề và `{2}` cho mô tả;
  - `(f)` Tất cả nút điều hướng, phân đoạn, đóng modal đều đạt tối thiểu 44 pt;
  - `(g)` Chuyển đổi ngôn ngữ VI và EN hiển thị đúng toàn bộ chuỗi giao diện.

### B. Kiểm tra kiểu tĩnh (`npm run typecheck --prefix mobile`)
```
> ngoke-mobile@0.1.0 typecheck
> tsc --noEmit
(Hoàn thành với mã thoát 0, không có bất kỳ lỗi kiểu TypeScript nào)
```

### C. Linter (`npm run lint --prefix mobile`)
```
> ngoke-mobile@0.1.0 lint
> eslint .
(Hoàn thành với mã thoát 0, sạch 100% không warning/error)
```

### D. Kiểm tra định dạng Git (`git diff --check`)
```
(Hoàn thành với mã thoát 0, không có trailing whitespace hay conflict markers)
```

### E. Kiểm tra Bundle Metro 8082 (Chỉ đọc)
- **iOS Bundle:** `curl.exe -s -I "http://localhost:8082/index.bundle?platform=ios&dev=true"` -> `HTTP/1.1 200 OK` (Content-Length: 6,662,724 bytes).
- **Android Bundle:** `curl.exe -s -I "http://localhost:8082/index.bundle?platform=android&dev=true"` -> `HTTP/1.1 200 OK` (Content-Length: 6,665,358 bytes).
- Metro được duy trì liên tục trên cổng 8082, không khởi động lại (no restart).

---

## 7. Báo cáo Giới hạn Thiết bị & Phần Chưa Kiểm Tra trên Máy Thật

Theo đúng nguyên tắc minh bạch kỹ thuật của dự án:
1. **Độ tương phản thực tế (Real Contrast Ratio):** Hiện tại môi trường không có thiết bị thật gắn qua `adb` hoặc iOS real device để trích xuất điểm ảnh vật lý. Tỷ lệ tương phản ~6.5:1 (trên nền mờ + scrim 0.68) và >7:1 (chữ vàng trên nền đặc `rgba(20, 22, 16, 0.78)`) là **tính toán lý thuyết trên giá trị kênh màu alpha**. Chưa đo đạc bằng dụng cụ đo quang học hoặc colorimeter trên màn hình OLED/LCD thực tế.
2. **Kích thước chữ lớn (`fontScale` 1.3 và 2.0):** Logic hiển thị xếp chồng theo cột (`headerBarStacked`, `quickActionsGridStacked`, `sectionHeaderStacked`) đã được kiểm chứng tự động qua unit test giả lập `useWindowDimensions`. Tuy nhiên, cảm nhận thẩm mỹ và việc ngắt dòng tiếng Việt thực tế ở mức phóng đại 200% cần người dùng quan sát trên điện thoại thật.
3. **Hiệu năng hiển thị mờ (`blurRadius`):** Thuộc tính `blurRadius={14}` được thực thi qua React Native Image nền tảng. Hiệu năng render thực tế trên các dòng máy Android cấp thấp (không có hỗ trợ GPU blur phần cứng) cần được kiểm tra khi chạy thực địa.
4. **Nút bánh răng màu xanh:** Đã xác nhận không tồn tại trong mã nguồn ứng dụng, chỉ xuất hiện trong môi trường Expo Go client. Khi đóng gói bản build độc lập (standalone APK/IPA), nút này sẽ không xuất hiện.
