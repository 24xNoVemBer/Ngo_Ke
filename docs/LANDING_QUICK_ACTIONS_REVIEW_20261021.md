# Đánh giá Bàn giao: Tiện ích trực tiếp GPS và Sổ tay trên Trang chủ Landing (21/10/2026)

## 1. Tóm tắt phạm vi và kết quả thực hiện

- **Yêu cầu đính chính của Người dùng & Brief chuẩn:** Người dùng yêu cầu đưa hai mục GPS và Sổ tay ra ngoài Trang chủ (`LandingScreen` ngay sau `PrologueScreen`) để dễ dàng thao tác trực tiếp, thay thế cho hướng tự động lấy GPS và xếp hạng danh sách nearby trước đó.
- **Giải pháp triển khai:**
  1. **Khối Tiện ích Trực tiếp trên LandingScreen (`testID="landing-quick-actions-section"`):**
     - Đặt ngay vùng dưới danh mục carousel con ngõ, tận dụng không gian trống phía dưới.
     - Hai mục / thẻ rõ ràng:
       - **Vị trí GPS (`testID="landing-quick-gps"`):** Bấm trực tiếp mở màn hình định vị / xác nhận tọa độ `LocationScreen`. Không tự ý kích hoạt GPS hay xin quyền khi mount Landing.
       - **Sổ tay (`testID="landing-quick-notebook"`):** Bấm một lần mở ngay modal Sổ tay ngõ phố "Hành trình & Công cụ" (`testID="notebook-drawer-modal"`).
     - Thiết kế giao diện theo art direction "Sổ tay ngõ phố" (thẻ giấy bo góc `radius.lg`, viền trang nhã `#E8DEC9`, bóng mờ êm dịu, icon chuẩn `AppIcon`).
     - Bố cục responsive: Màn hình chuẩn hiển thị 2 cột song song (`flexDirection: 'row'`); màn hình hẹp (<360dp) hoặc Dynamic Type / font lớn (`fontScale > 1.2`) tự động xếp dọc (`flexDirection: 'column'`) và cuộn mượt mà trong ScrollView.
     - Vùng chạm tối thiểu đạt chuẩn tiếp cận: thẻ cao 56dp (vượt mức 48dp Android / 44pt iOS), có `accessibilityRole="button"`, `accessibilityLabel` đầy đủ cho cả VI và EN.
  2. **Trích xuất Component Dùng Chung `NotebookDrawerModal`:**
     - Đặt tại [`mobile/src/components/NotebookDrawerModal.tsx`](file:///C:/Users/LEGION/orca/workspaces/ngoke/logic-fix-mobile-20261020/mobile/src/components/NotebookDrawerModal.tsx).
     - Tái sử dụng trọn vẹn luồng và giao diện Sổ tay hiện có ("Hành trình & Công cụ" từ `HomeScreen`), tránh sao chép lặp code.
     - Tích hợp các công cụ:
       - Chọn trải nghiệm (`PlanScreen`): Đóng drawer trước khi điều hướng `navigation.navigate('Plan')`.
       - Quét mã QR & Điểm trạm (`CameraScreen`): Đóng drawer trước khi điều hướng `navigation.navigate('Camera')`.
       - Xác nhận vị trí GPS (`LocationScreen`): Đóng drawer trước khi điều hướng `navigation.navigate('Location')`.
       - Đổi nguồn dữ liệu Demo / Live: Hỗ trợ chuyển đổi chế độ với tính cô lập nguồn dữ liệu (Live không fallback sang bundle), hỗ trợ hiển thị cả trạng thái unready/empty và trạng thái lỗi (error state) cùng nút thử lại.
       - Nút đóng (`✕`) và nền mờ (Backdrop): Đóng drawer và giữ người dùng ở lại `LandingScreen`.
     - Đáp ứng phản biện review của Coordinator (`msg_a29a782aecad`, `msg_96e281e22ef1`, `msg_e3f7c7abd09a`):
       - Dùng `useMotionState` từ provider để đồng bộ trạng thái motion mượt mà.
       - Nhóm tiêu đề header có `flex: 1, flexShrink: 1, minWidth: 0` để fontScale 2x không đẩy nút đóng khỏi màn hình.
       - Hàng quản lý nguồn dữ liệu `sourceHeaderRow` hỗ trợ `flexWrap: 'wrap'` và stack khi font lớn.
       - Nút tùy chọn chế độ `modeOption` đạt `minHeight: 48, minWidth: 48` không dùng hitSlop ngang để triệt tiêu hoàn toàn nguy cơ overlap giữa 2 tab kề nhau; nút thử lại Live đạt `minHeight: 40` kèm hitSlop đủ 48dp; nút đóng đạt 36dp kèm hitSlop 8dp.
  3. **Tháo bỏ Runtime và Sao lưu WIP auto-GPS cũ:**
     - Các file helper tạm `useLandingLocation.ts` và `nearby.ts` đã được sao lưu an toàn ra ngoài production source tại `C:\Users\LEGION\AppData\Local\Temp\ngoke_autogps_backup\`.
     - Tháo các import, prop và hook auto-GPS khỏi `LandingScreen.tsx` và `App.tsx`.
     - Toàn bộ WIP trước đó của `PrologueScreen` (bộ chọn ngôn ngữ in-app modal, âm thanh giọt nước tĩnh lặng `prologue_waterdrop.wav`) được bảo toàn 100%.

## 2. Kết quả kiểm tra xác minh

- **Unit & Regression Test Suites:**
  - File kiểm thử mới: [`mobile/tests/landingQuickActions.test.mjs`](file:///C:/Users/LEGION/orca/workspaces/ngoke/logic-fix-mobile-20261020/mobile/tests/landingQuickActions.test.mjs) (5/5 tests PASS, kiểm tra behavior/accessibility/shared component thật, không mirror style, kiểm tra cả Live empty và Live error).
  - Toàn bộ test suite dự án: `npm test --prefix mobile` đạt **296/296 tests PASS** (0 fail, 0 errors).
- **TypeScript Typecheck:**
  - `npm run typecheck --prefix mobile` (`tsc --noEmit`): **0 errors**, exit code 0.
- **ESLint:**
  - `npm run lint --prefix mobile`: **0 errors**, exit code 0.
- **Git Diff & Whitespace Check:**
  - `git diff --check`: Đạt, không có trailing whitespace hay conflict markers.
- **Metro Bundler (Port 8082):**
  - Android bundle (`/index.bundle?platform=android&dev=true`): **HTTP 200 OK**, kích thước ~6.6MB, chứa markers `landing-quick-gps` và `landing-quick-notebook`.
  - iOS bundle (`/index.bundle?platform=ios&dev=true`): **HTTP 200 OK**, kích thước ~6.6MB, chứa markers `landing-quick-gps` và `landing-quick-notebook`.

## 3. Các tệp tin sửa đổi và tạo mới

- `mobile/src/components/NotebookDrawerModal.tsx`: Component Sổ tay ngõ phố dùng chung ("Hành trình & Công cụ"), bảo đảm độ ưu tiên `dataset.kind` khi `source.status === 'ready'`.
- `mobile/src/screens/HomeScreen.tsx`: Thay thế khối modal inline bằng component dùng chung `NotebookDrawerModal`, dọn sạch các style drawer cũ, chuẩn hóa kiểu `CollectionId`.
- `mobile/src/screens/LandingScreen.tsx`: Bổ sung 2 lối tắt GPS và Sổ tay, tích hợp `NotebookDrawerModal`, loại bỏ auto-GPS.
- `mobile/App.tsx`: Cung cấp `source`, `onModeChange`, `liveBusy`, `onRetryLive` cho LandingScreen; dọn dẹp logic thừa.
- `mobile/src/i18n/translator.ts`: Bổ sung 8 translation keys cho quick actions với tỷ lệ khớp 100% giữa VI và EN.
- `mobile/tests/landingQuickActions.test.mjs`: Test suite kiểm thử mounted flow Landing, điều hướng GPS/Sổ tay, hành vi drawer, mode toggle (empty & error), và đa ngôn ngữ.
- `mobile/tests/uiFlows.test.mjs`: Cập nhật ranh giới test Home drawer sang mount component dùng chung `NotebookDrawerModal` với props nối từ Home, giữ nguyên 100% kiểm tra độ ưu tiên source-kind và đa ngôn ngữ.
- `MEMORY.md`: Cập nhật tiến độ và bằng chứng kiểm thử thực tế.

## 4. Giới hạn và lưu ý môi trường thiết bị

- Việc kiểm thử phần cứng GPS thực tế và cảm ứng vật lý cần thực hiện trên điện thoại thật qua Expo Go kết nối tới Metro port 8082.
- Quyền vị trí GPS chỉ được hệ điều hành yêu cầu khi người dùng chủ động nhấn vào mục GPS hoặc công cụ GPS trong Sổ tay, không bị hỏi ngầm khi vừa vào app.
