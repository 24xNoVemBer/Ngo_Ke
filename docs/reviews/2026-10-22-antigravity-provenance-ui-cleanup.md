# Báo cáo: Làm gọn UI & Loại bỏ Nhãn Mô phỏng / Provenance theo Yêu cầu Người dùng

- **Thời gian thực hiện:** 22/10/2026
- **Worker:** Antigravity (W2)
- **Dispatch ID:** `ctx_b900acd85ddd`
- **Task ID:** `task_9cca57200656`
- **Baseline Git HEAD:** `4bc7d26`
- **Chỉ thị trực tiếp từ người dùng:** *"xoa bo het cac dong kieu noi dung mo phong hay nguon, kh can ghi cho gon"*

---

## 1. Tóm tắt nội dung thực hiện (Executive Summary)

Theo chỉ thị trực tiếp từ người dùng ghi đè thiết kế hiển thị provenance cũ, nhóm frontend mobile đã rà soát và loại bỏ toàn bộ các nhãn mô phỏng, huy hiệu nguồn/kiểm duyệt (`ClickableSources`, thẻ `verifiedTag`, thẻ `disclaimerPill`, nhãn `sourceStateTag`), các đoạn chú thích/cảnh báo nguồn rườm rà trên toàn bộ màn hình native và component dùng chung ở cả hai ngôn ngữ tiếng Việt (VI) và tiếng Anh (EN). Các khoảng trống (empty wrappers/gaps) phát sinh do việc loại bỏ component cũng được dọn dẹp triệt để.

### Các nguyên tắc cốt lõi được tuân thủ nghiêm ngặt:
1. **Làm biến mất hoàn toàn nhãn provenance thuần túy:** Không thay thế nhãn provenance này bằng nhãn provenance khác. Các thẻ như "TRUYỆN HƯ CẤU · NGHE NGƯỜI KỂ", "DEMO · DI SẢN ĐÃ DUYỆT", "Ảnh minh họa · điểm mô phỏng" đã được gỡ bỏ hoàn toàn khỏi UI hiển thị.
2. **Bảo tồn nội dung và tính năng nghiệp vụ:** Giữ nguyên vẹn toàn bộ lời kể (narrative/stories), câu hỏi & câu trả lời (Q&A/answers), thanh điều hướng, nút chuyển đổi Demo/Live (`notebook-mode-demo`, `notebook-mode-live`), giá trị thời lượng tham quan, quyền & luồng xác nhận GPS, cũng như các phản hồi trạng thái hợp lý (loading, retry, empty, live no audio).
3. **Bảo tồn tính toàn vẹn của dữ liệu và hạ tầng:** Giữ nguyên các trường `kind`, `review`, `evidence`, URLs, backend validation và nội dung trong `data/demo.json`, `data/localized/*.json`. Không gán nhãn lại dữ liệu mô phỏng thành đã duyệt trong code/data.
4. **Bảo tồn thuộc tính hình ảnh và WIP:** Giữ nguyên metadata và tài liệu tác quyền ảnh (`docs/IMAGE_SOURCES.md`, `mobile/src/assets/photoMap.ts`, Prologue hero-moss WIP).
5. **Thông tin giới hạn an toàn vị trí ngắn gọn:** Giữ lại câu giới hạn vận hành ngắn gọn ("App không chỉ đường từng bước và không theo dõi vị trí nền" / "App does not provide turn-by-turn directions or track background location") mà không đi kèm các tuyên bố gây nhiễu về tọa độ mô phỏng.
6. **Mục P2-1:** `landing.mode_status` chỉ hiển thị định dạng và chế độ thực tế: `"Truyện chữ · {mode}"` (VI) và `"Text stories · {mode}"` (EN), loại bỏ hoàn toàn chữ `mô phỏng` / `simulated`.
7. **Mục P3-1:** Dọn dẹp các khóa translator thực sự không còn sử dụng (`landing.soundscape_banner`, `landing.passport_close_label`, `quote_*`, `landing.featured_section_pre`, `landing.quick_section_pre`). Không xóa trắng khóa dịch toàn cục nếu UI còn gọi.

---

## 2. Chi tiết các bề mặt UI & Component được làm gọn

| Bề mặt / Component | File | Nội dung đã loại bỏ / điều chỉnh | Nội dung được bảo tồn |
| :--- | :--- | :--- | :--- |
| **LandingScreen** | `mobile/src/screens/LandingScreen.tsx` | - Khóa `landing.mode_status` chuyển thành `Truyện chữ · {mode}` (VI) và `Text stories · {mode}` (EN).<br>- Loại bỏ các thẻ dẫn nhập `featured_section_pre`, `quick_section_pre`. | Header VI/EN, nút Sổ tay, Carousel ngõ, Quick Actions (GPS & Sổ tay). |
| **NotebookDrawerModal** | `mobile/src/components/NotebookDrawerModal.tsx` | - Gỡ bỏ nhãn `sourceStateTag` (thẻ `LIVE · dữ liệu đã duyệt`, `DEMO · nội dung mô phỏng`...).<br>- Gỡ bỏ khối ghi chú `disclaimerNote` và `disclaimerBox`. | Bộ chọn radio Demo / Live, tiêu đề và chi tiết nguồn thực tế, nút Thử lại (Retry), danh sách tiện ích Sổ tay, Hộ chiếu Ngõ. |
| **HomeScreen** | `mobile/src/screens/HomeScreen.tsx` | - Duration trong thẻ preview điểm đang chọn hiển thị `⏱ {currentNode.visitMinutes} {t('home.min')}` gọn gàng, không kèm chữ `mô phỏng`. | Tên điểm dừng, tóm tắt, cảnh báo kiểm tra (`pendingCheck`), tác giả ảnh chụp (`photo_credit`), nhãn Đã mở (`opened`), nút Đọc lời kể. |
| **AlleyTrailView** | `mobile/src/components/AlleyTrailView.tsx` | - Cột mốc thời gian hiển thị `t('location.suggested_visit_minutes')` đồng nhất, loại bỏ nhánh hiển thị `phút mô phỏng` hoặc `Có nguồn · chưa duyệt chính thức`. | SVG Trail, các điểm dừng (stops), trạng thái mở/đóng, tương tác chọn điểm. |
| **PostcardCard** | `mobile/src/components/PostcardCard.tsx` | - Gỡ bỏ `disclaimerBadge` ("Ảnh minh họa · điểm đã duyệt" / "Ảnh minh họa · điểm mô phỏng") và styles tương ứng.<br>- Thời lượng tham quan dùng `location.suggested_visit_minutes`. | Tác quyền ảnh (`common.photo_author`), dấu mộc đã đến (`visited_stamp`), tiêu đề, tóm tắt, nút Khám phá điểm này. |
| **CameraScreen** | `mobile/src/screens/CameraScreen.tsx` | - Gỡ bỏ thẻ `disclaimerBadge` trên ảnh chụp.<br>- Gỡ bỏ hộp chú thích `disclaimerBox` ("Đây là nội dung mô phỏng...") ở chân màn hình.<br>- Thời lượng trong danh sách chọn tay dùng `location.suggested_visit_minutes`. | Khung quét viewfinder, hiệu ứng laser, thẻ tác quyền ảnh (`creditBadge`), danh sách chọn điểm thủ công, luồng xác nhận mã QR. |
| **LocationScreen** | `mobile/src/screens/LocationScreen.tsx` | - Accessibility label của nút chọn tay là `Chọn điểm {node.name} bằng tay` (`location.select_manual`) không còn gắn đuôi `mô phỏng`.<br>- Thời lượng tham quan hiển thị chuẩn `location.suggested_visit_minutes`.<br>- Chú thích an toàn rút gọn thành giới hạn vận hành súc tích. | Tọa độ/khoảng cách điểm ứng viên, nút Đổi điểm, danh sách điểm dừng thủ công, thông báo quyền vị trí và nút cài đặt khi bị từ chối vĩnh viễn. |
| **PlanScreen** | `mobile/src/screens/PlanScreen.tsx` | - Hộp chú thích chân trang rút gọn còn: *"Tổng thời gian dừng không vượt quỹ đã chọn; chưa tính thời gian đi bộ. App không chỉ đường từng bước."* (loại bỏ câu khẳng định tọa độ mô phỏng).<br>- Gỡ bỏ `mode` không dùng khỏi destructuring props. | Lựa chọn 3 chủ đề hành trình, thanh chọn quỹ thời gian (30m - 180m), danh sách gợi ý bưu thiếp, chuyển đổi chọn tay. |
| **QaScreen** | `mobile/src/screens/QaScreen.tsx` | - Gỡ bỏ huy hiệu `waveformDuration` ("TRUYỆN HƯ CẤU · NGHE NGƯỜI KỂ", "DEMO · DI SẢN ĐÃ DUYỆT", "LIVE · NỘI DUNG MÔ PHỎNG", "LIVE · DI SẢN ĐÃ DUYỆT").<br>- Gỡ bỏ `ClickableSources` và `disclaimerPill` ở phần lời kể.<br>- Gỡ bỏ `verifiedTag` ("NỘI DUNG CÓ NGUỒN" / "LỜI KỂ TRONG TRUYỆN") và `ClickableSources` ở phần câu trả lời.<br>- Dọn dẹp các styles và import không sử dụng. | Trình phát âm thanh `VoicePlayerBar`, tiêu đề đoạn kể, gợi ý câu hỏi, nội dung câu trả lời, nút mở/thu gọn đọc chữ, dock tương tác giọng nói, thông báo Live không có audio. |
| **Translator** | `mobile/src/i18n/translator.ts` | - Cập nhật `landing.mode_status`: `"Truyện chữ · {mode}"` / `"Text stories · {mode}"`.<br>- Dọn dẹp các khóa không dùng: `landing.soundscape_banner`, `landing.passport_close_label`, `quote_*`, `landing.featured_section_pre`, `landing.quick_section_pre`. | Toàn bộ từ điển dịch thuật nghiệp vụ của app cho tiếng Việt và tiếng Anh. |

---

## 3. Bằng chứng kiểm thử tự động (Test Evidence)

### 3.1. File kiểm thử hồi quy mới: `mobile/tests/provenanceUiCleanup.test.mjs`
File kiểm thử hồi quy mới gồm 7 ca kiểm thử chuyên biệt xác minh giao diện Live + bộ sưu tập đã duyệt (`old-quarter-pilot`) và Demo trên cả hai ngôn ngữ VI & EN:
1. `LandingScreen P2-1: mode_status renders truthful format + mode without simulated label (Live + reviewed collection, VI and EN)`: Đạt.
2. `NotebookDrawerModal removes sourceStateTag and disclaimerNote while preserving mode radio controls`: Đạt.
3. `PostcardCard removes photo disclaimer badge while preserving photo credit and unmeasured duration`: Đạt.
4. `CameraScreen removes bottom disclaimerBox and photo disclaimer badge while preserving credit and stop title`: Đạt.
5. `LocationScreen manual accessibility label has no simulated clutter and safety notice is concise`: Đạt.
6. `PlanScreen retains concise operational limitation without coordinate clutter`: Đạt.
7. `QaScreen removes waveform provenance badge, source pill, and verified tag while keeping story and QA`: Đạt.

### 3.2. Cập nhật các bài kiểm tra hiện có phù hợp với chỉ thị mới
- `mobile/tests/landingQuickActions.test.mjs`: Chuyển đổi kiểm tra vắng mặt câu trích dẫn và tiền tố thành kiểm tra cấu trúc/chuỗi thực tế.
- `mobile/tests/remediationIntegration.test.mjs`: Cập nhật kiểm tra trạng thái Live radio và xác nhận loại bỏ dòng disclaimer thừa.
- `mobile/tests/uiFlows.test.mjs`:
  - Cập nhật mock `NotebookDrawerModal` loại bỏ `notebook-drawer-tag` và `notebook-drawer-disclaimer`.
  - Cập nhật 3 ca kiểm thử liên quan (`QaScreen and CameraScreen branch semantic content labels`, `LocationScreen branches manual accessibility label`, `AlleyTrailView and PostcardCard branch visit time`) để kiểm tra vắng mặt nhãn provenance/simulated và kiểm tra có mặt của lời kể, câu trả lời, thời lượng tham quan và tác quyền ảnh (`common.photo_author`).

### 3.3. Kết quả các lệnh kiểm tra

```sh
# 1. Toàn bộ test suite native app
npm test --prefix mobile
# Kết quả: 335 tests passed, 0 failed, duration: ~7.5s

# 2. Typecheck TypeScript
npm run typecheck --prefix mobile
# Kết quả: tsc --noEmit exited 0, không có lỗi kiểu dữ liệu

# 3. Linter ESLint
npm run lint --prefix mobile
# Kết quả: eslint . exited 0, 0 errors, 0 warnings

# 4. Kiểm tra khoảng trắng Git
git diff --check
# Kết quả: Clean, 0 whitespace errors

# 5. Kiểm tra Metro Bundler (port 8082, không restart)
curl.exe -s http://localhost:8082/status
# Kết quả: packager-status:running

curl.exe -s -o NUL -w "%{http_code}" "http://localhost:8082/index.bundle?platform=android&dev=true"
# Kết quả: HTTP 200

curl.exe -s -o NUL -w "%{http_code}" "http://localhost:8082/index.bundle?platform=ios&dev=true"
# Kết quả: HTTP 200
```

---

## 4. Giới hạn kiểm chứng trực quan trên thiết bị thực tế (Native Visual Limitations)

- Toàn bộ các thay đổi giao diện và luồng tương tác đã được kiểm chứng tự động ở cấp độ component mount và Metro bundle compilation (Android và iOS bundle trả về HTTP 200).
- Hiển thị trực quan và kích thước tương tác thực tế (touch target) trên màn hình thiết bị vật lý thật (Android/iOS) cần được chạy kiểm thử native tiếp theo trên thiết bị cầm tay.
- Toàn bộ WIP chưa commit (`HEAD 4bc7d26`), các file `docs/IMAGE_SOURCES.md`, `mobile/src/assets/photoMap.ts`, `mobile/src/screens/PrologueScreen.tsx` đều được bảo toàn nguyên vẹn. Không có bất kỳ thay đổi nào tác động vào backend, voice, data fixtures, workspace `E:`, hay môi trường web/PWA.
