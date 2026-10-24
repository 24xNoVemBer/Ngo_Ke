# NGÕ KỂ — UX/UI DEEP AUDIT REPORT
**Trạng thái:** Sau Phase 1B (Logic Remediation & Multi-Alley Expansion)  
**Ngày thực hiện:** 23/10/2026 (Asia/Saigon)  
**Vai trò:** Senior Mobile Product Designer & UX Auditor  
**Workspace:** `D:\ngo_ke` | **Branch:** `valentino/logic-fix-mobile-20261020`  
**Application Source State:** READ-ONLY (Không sửa mã nguồn ứng dụng, chỉ bàn giao tài liệu thiết kế)

---

## 1. TỔNG QUAN DỰ ÁN VÀ BỐI CẢNH AUDIT (EXECUTIVE SUMMARY)

### 1.1. Bối cảnh sau Phase 1B
Sau đợt khắc phục logic Phase 1B (giải quyết 3 tickets kỹ thuật: NK-002 cách ly dữ liệu Demo/Live trong Sổ tay, NK-003 kiểm soát lifecycle âm thanh Home Intro chống phát đè khi chuyển cảnh, NK-004 dọn dẹp empty notice wrapper cho 17 node Q&A mới), ứng dụng Ngõ Kể đã đạt 405/405 tests tự động vượt qua trong môi trường host.

Tuy nhiên, xét dưới lăng kính **Product Design & User Experience**, ứng dụng đang bộc lộ sự phân mảnh trải nghiệm sâu sắc do tốc độ phát triển tính năng nhanh qua nhiều phase:
1. **Thiếu nhất quán thị giác (Visual Discontinuity):** Ứng dụng tồn tại song song 3 ngôn ngữ giao diện không hòa nhập: Nền phim ảnh tối (Dark Cinematic) ở Landing/Home, Nền giấy sáng màu be (Light Beige Paper) ở AlleySelect/Plan/Notebook, và Nền ảnh toàn màn hình phối các thẻ nổi hỗn hợp ở QaScreen.
2. **Khoảng cách trải nghiệm giữa 5 ngõ mới và 3 bộ sưu tập cũ:**
   - 3 bộ sưu tập cũ (`fiction-letter`, `old-quarter-pilot`, `old-quarter-three-lenses`) có Q&A phong phú (9 đến 21 câu hỏi có bằng chứng) nhưng không có bài viết giới thiệu ngõ (`alleyStory`) hay sổ tay cẩm nang ẩm thực/di sản (`guide`).
   - 5 ngõ mới (`ngo-gach`, `ngo-trung-yen`, `ngo-tam-thuong`, `ngo-cam-chi`, `ngo-phat-loc`) có câu chuyện từng điểm và giọng đọc song ngữ VI/EN, nhưng **hoàn toàn rỗng Q&A** (`"qa": []`). Mặc dù vậy, giao diện QaScreen vẫn trưng bày thanh Dock "Hỏi bằng giọng nói" và nút "Gõ câu hỏi", tạo ra **kỳ vọng sai lệch (false affordance)** dẫn đến 100% phản hồi "Chưa có dữ liệu" khi người dùng tương tác.
3. **Trải nghiệm Audio-First chưa hoàn chỉnh:** Ứng dụng định vị là "khám phá di sản lấy âm thanh làm trung tâm" (audio-first cultural exploration), nhưng hệ thống điều khiển âm thanh bị phân mảnh thành 3 kiểu nút khác nhau trên 3 màn hình, thiếu thanh tua thời gian (scrubber), không hiển thị thời lượng bài nghe trên màn hình chính, và thiếu thanh phát nhạc thu nhỏ (mini-player) khi rời màn hình chi tiết.
4. **Vấn đề bản quyền và chất lượng hình ảnh:** Nhiều điểm dừng đang tái sử dụng 1 bức ảnh chụp cho 3 địa điểm khác nhau (ảnh Tống Duy Tân dùng cho 3 quán ở Ngõ Gạch; ảnh Cấm Chỉ dùng cho 3 quán ở Ngõ Trung Yên). Đặc biệt, tồn tại các tệp ảnh chụp ghi nguồn trực tiếp từ `Google Maps contributor`, vi phạm nguyên tắc đóng gói tư liệu sạch của dự án. File ảnh bìa PNG của Ngõ Tạm Thương nặng tới **4.13 MB**, gây rủi ro tràn bộ nhớ trên thiết bị di động tầm trung.

---

## 2. PHẠM VI AUDIT VÀ PHÂN ĐỊNH BẰNG CHỨNG (SCOPE & METHODOLOGY)

### 2.1. Phân định bằng chứng (Evidence Classification)
Để tuân thủ nghiêm ngặt quy tắc tại `AGENTS.md` và kỹ năng `mobile-ux-qa`:
- **Source-based Analysis (Phân tích dựa trên mã nguồn):** Đã đọc, đối chiếu cấu trúc JSX, StyleSheet, React Hooks, Luồng dữ liệu tĩnh trong `data/localized/`, metadata trong `photoMap.ts`, `collections.ts`, các test suite hiện hữu và tài liệu thiết kế trước đây.
- **Visual Verification Pending (Giới hạn cần kiểm chứng thực tế trên thiết bị):** Môi trường audit hiện tại không có Android Emulator hoạt động trực tiếp hoặc thiết bị iOS/Android vật lý cắm cáp. Mọi quan sát về độ trượt bàn phím (keyboard animation), độ mượt khung hình (60/120fps), hiển thị trên màn hình có "tai thỏ / Dynamic Island", hành vi âm thanh khi có cuộc gọi đến, và micro thực tế được ghi nhận trung thực là **Cần kiểm chứng trên thiết bị thật (Native Verification Required)**.

### 2.2. Ma trận đối chiếu 8 Bộ sưu tập (Cross-Collection Feature Matrix)

| Tiêu chí | Fiction Letter | Old Quarter Pilot | Three Lenses | Ngõ Gạch | Ngõ Trung Yên | Ngõ Tạm Thương | Ngõ Cấm Chỉ | Ngõ Phất Lộc |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Số điểm dừng (Nodes)** | 6 | 3 | 3 | 5 | 5 | 2 | 3 | 2 |
| **Độ dài đường ngõ (Polyline)** | ❌ (Config) | ❌ (Config) | ❌ (Config) | ✅ (128m) | ✅ (146m) | ❌ | ❌ | ❌ |
| **Tọa độ GPS điểm dừng** | 6/6 (Mô phỏng) | 2/3 | 2/3 | 5/5 | 2/5 (3 null) | 0/2 (2 null) | 0/3 (3 null) | 0/2 (2 null) |
| **Bài đọc con ngõ (`alleyStory`)** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Cẩm nang ngõ (`guide`)** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Audio mở đầu ngõ (`intro`)** | ✅ (VI) | ✅ (VI/EN) | ✅ (VI/EN) | ❌ | ✅ (VI/EN) | ✅ (VI/EN) | ✅ (VI/EN) | ✅ (VI/EN) |
| **Audio từng điểm (`story`)** | ✅ (6 VI) | ❌ | ✅ (5 chương) | ✅ (5 VI/EN) | ✅ (5 VI/EN) | ✅ (2 VI/EN) | ✅ (3 VI/EN) | ✅ (2 VI/EN) |
| **Số lượng Q&A** | 21 | 9 | 16 | **0** | **0** | **0** | **0** | **0** |
| **Ảnh đại diện riêng từng node** | 6 Pexels | 3 Di sản | 5 Di sản | 2 GMaps + 3 trùng | 2 GMaps + 3 trùng | 0 (Fallback) | 0 (Fallback) | 0 (Fallback) |

---

## 3. BẢNG ĐĂNG KÝ VẤN ĐỀ UX/UI (DETAILED ISSUE REGISTRY)

---

### NHÓM 1: TÍNH NHẤT QUÁN THỊ GIÁC & HỆ THỐNG THIẾT KẾ (VISUAL CONSISTENCY)

#### [AUD-VIS-001] Xung đột triệt để giữa Dark Theme và Light Paper Theme giữa các màn hình
- **Màn hình / Component:** `LandingScreen`, `HomeScreen`, `AlleySelectScreen`, `PlanScreen`, `NotebookDrawerModal`, `AlleyPassportModal`.
- **Mức độ nghiêm trọng:** HIGH
- **Bằng chứng & Hiện trạng (Evidence):**
  - `LandingScreen` & `HomeScreen`: Nền tối điện ảnh (`#1E2019`), lớp phủ mờ scrim tối (`rgba(22, 24, 18, 0.40)`), chữ màu vàng kim/kem (`#FFE29A`, `#FFFDF7`), thanh điều hướng tối.
  - `AlleySelectScreen`: Nền giấy sáng hoàn toàn (`#F5EFE6`), thanh top bar màu trắng kem (`#FFFDF9`), viền xám be (`#EAE1CE`), chữ nâu mực đậm (`#2C221E`).
  - `PlanScreen`: Dùng token `colors.background = '#F7F2E8'`, `colors.surface = '#FFFDF7'`.
  - `NotebookDrawerModal`: Nền modal màu kem giấy sáng (`#FFFDF7`).
  - `AlleyPassportModal`: Nền modal màu rêu tối sẫm (`#1E241D`), viền vàng (`#B9A589`).
- **Nguyên nhân gốc rễ (Root Cause):** Chưa có quy chuẩn phân tầng giao diện (Design System Hierarchy). Đội ngũ phát triển qua các phase đã áp dụng theme cục bộ theo từng màn hình thay vì tuân theo một hệ thống biến số ngữ nghĩa toàn cục.
- **Giải pháp đề xuất (Proposed Solution):**
  - Chuẩn hóa kiến trúc **"Dual-Surface System" (Hệ thống bề mặt kép có chủ đích)**:
    1. **Tầng Khám phá Không gian (Spatial Canvas - Dark Moss Film):** Dành riêng cho trải nghiệm ngắm bản đồ ngõ (`HomeScreen`) và quét camera ngoài trời (`CameraScreen`, `QaScreen` background). Sử dụng tone màu xanh rêu đậm ánh sương (`#1B221B`, `#243026`) để làm nổi bật đường mòn dạ quang và hình ảnh con ngõ.
    2. **Tầng Sổ tay Khám phá (Journal Surface - Warm Laid Paper):** Dành cho mọi thao tác đọc thông tin, chọn tuyến, xem cẩm nang, lập lịch trình (`AlleySelectScreen`, `PlanScreen`, `NotebookDrawerModal`, `AlleyPassportModal`, `AlleyStoryCard`). Dùng nền giấy ấm (`#F7F2E8`), mực đen xám cổ điển (`#2E3028`), viền chỉ trang sổ (`#E2DDD3`).
- **Quy cách Trước/Sau (Before/After):**
  - *Trước:* Mở `AlleyPassportModal` thì nền đen kịt; mở `NotebookDrawerModal` ngay cạnh lại biến thành nền trắng toát; bấm vào `AlleySelect` bị chói mắt vì nền trắng chuyển đột ngột từ `Landing` nền tối.
  - *Sau:* Cả `AlleyPassportModal` và `NotebookDrawerModal` đều dùng chung form dáng Sổ tay giấy (`#FFFDF7` trên nền giấy ấm `#F7F2E8`), viền da nâu đất (`#9C4F36`). `AlleySelect` chuyển tiếp mượt mà với tông màu giấy ấm thanh lịch.
- **Tệp bị ảnh hưởng:** `mobile/src/theme.ts`, `mobile/src/screens/AlleySelectScreen.tsx`, `mobile/src/components/AlleyPassportModal.tsx`.
- **Tiêu chí nghiệm thu (Acceptance Criteria):**
  - Chuyển đổi giữa Landing -> AlleySelect -> Home -> Notebook không gây cảm giác giật màu tương phản gắt.
  - Tỷ lệ tương phản văn bản đạt tối thiểu WCAG AA (>= 4.5:1 cho body, >= 3:1 cho tiêu đề lớn).
- **Rủi ro hồi quy (Regression Risks):** Snapshot tests kiểm tra màu sắc (nếu có) có thể cần cập nhật.
- **Yêu cầu kiểm chứng native:** Kiểm tra độ chói mắt khi chuyển cảnh trong phòng tối trên màn hình OLED.

---

#### [AUD-VIS-002] Phân mảnh kiểu dáng thanh điều hướng trên cùng (Top Header Inconsistency)
- **Màn hình / Component:** Header bar của `Landing`, `AlleySelect`, `Home`, `Qa`.
- **Mức độ nghiêm trọng:** MEDIUM
- **Bằng chứng & Hiện trạng:**
  - `HomeScreen`: Nút Back tròn 44x44pt, nền đen bán trong suốt `rgba(28,20,16,0.60)`, viền mỏng. Ở giữa là cụm tên ngõ + vạch tiến trình (ProgressBar) + số câu chuyện đã mở. Bên phải là nút chuyển đổi ngôn ngữ đơn lẻ `VI` hoặc `EN`.
  - `LandingScreen`: Nút Logo ở bên trái, bên phải là cụm Segmented Switch `VI | EN` (hai nút con) kèm nút biểu tượng Passport.
  - `AlleySelectScreen`: Nút Back tròn nền be xám (`#EFE8DA`), ở giữa là Logo icon + chữ "Chọn con ngõ", bên phải là khoảng trống giả lập (`topBarSpacer: 48x48`).
  - `QaScreen`: Nút Back tròn 48x48pt (`backButton`), ở giữa là cụm các thanh phân đoạn Story (`storySegmentRow`), không có nút đổi ngôn ngữ.
- **Nguyên nhân gốc rễ:** Mỗi màn hình được code bởi một kỹ sư/phase khác nhau mà không dùng chung component `AppHeader` tái sử dụng.
- **Giải pháp đề xuất:**
  - Xây dựng component dùng chung `ScreenHeader.tsx` hỗ trợ 3 biến thể chuẩn hóa:
    - `variant="exploration"` (Home / Qa): Nút Back chuẩn 44pt, tiêu đề chính + chỉ số tiến trình, nút phụ (Ngôn ngữ / Sổ tay).
    - `variant="editorial"` (AlleySelect / Plan): Nút Back chuẩn 44pt, tiêu đề trang trang nhã căn giữa, nút action bên phải (Lọc / Trợ giúp).
    - Chiều cao vùng an toàn (Safe Area Insets) tính toán đồng nhất bằng hook `useSafeAreaInsets()`.
- **Tệp bị ảnh hưởng:** `mobile/src/components/ScreenHeader.tsx` (mới), `mobile/src/screens/HomeScreen.tsx`, `mobile/src/screens/QaScreen.tsx`, `mobile/src/screens/AlleySelectScreen.tsx`.
- **Tiêu chí nghiệm thu:**
  - Tọa độ Y và chiều cao Header đồng nhất 100% khi chuyển giữa Home và Qa.
  - Nút Back luôn có touch target tối thiểu 44x44pt và phản hồi xúc giác nhẹ (press feedback).

---

#### [AUD-VIS-003] Tỷ lệ và bố cục đường mòn ngõ bị vỡ khi số điểm dừng nhỏ hơn 5
- **Màn hình / Component:** `mobile/src/screens/HomeScreen.tsx` (nhánh render không có polyline).
- **Mức độ nghiêm trọng:** HIGH
- **Bằng chứng & Hiện trạng:**
  - Với các ngõ không có polyline trong dataset như `ngo-tam-thuong` (2 điểm), `ngo-phat-loc` (2 điểm), `ngo-cam-chi` (3 điểm), hệ thống dùng mảng tọa độ cố định `PIN_CONFIG` (được thiết kế cứng cho 6 điểm):
    ```ts
    const PIN_CONFIG = [
      { id: 'demo-01', xPct: 0.55, yPct: 0.08, side: 'right' },
      { id: 'demo-02', xPct: 0.55, yPct: 0.23, side: 'right' },
      // demo-03 -> demo-06 trải dài tới yPct: 0.84
    ];
    ```
  - Chiều cao canvas bản đồ luôn là `Math.max(560, nodes.length * 90 * fontScale) = 560pt`.
  - Kết quả: Ở Ngõ Tạm Thương (2 điểm), điểm 1 nằm ở 8% (y=44.8pt), điểm 2 nằm ở 23% (y=128.8pt). Khoảng không gian từ y=129pt đến y=560pt (hơn 430pt, chiếm 77% màn hình) là **dải đường mòn trống trơn, cụt lửng**, không có bất kỳ nội dung nào!
- **Nguyên nhân gốc rễ:** Hàm tính toán layout bản đồ cũ giả định bộ sưu tập luôn có 6 điểm dừng như bản demo gốc.
- **Giải pháp đề xuất:**
  - Viết thuật toán phân bổ tỷ lệ động `computeFallbackAlleyLayout(nodeCount, canvasWidth, canvasHeight)`:
    - Tự động giãn đều khoảng cách các điểm dọc theo trục Y từ 15% đến 85% chiều cao canvas.
    - So le trái/phải (`side: index % 2 === 0 ? 'right' : 'left'`) để tạo nhịp điệu uốn lượn tự nhiên bất kể ngõ có 2, 3, 5 hay 6 điểm dừng.
- **Tệp bị ảnh hưởng:** `mobile/src/utils/alleyGeometry.ts`, `mobile/src/screens/HomeScreen.tsx`.
- **Tiêu chí nghiệm thu:**
  - Mở Ngõ Tạm Thương (2 điểm) hoặc Ngõ Cấm Chỉ (3 điểm), các điểm dừng phân bố cân đối, đẹp mắt trên toàn bộ màn hình bản đồ.
- **Rủi ro hồi quy:** Các test kiểm tra `PIN_CONFIG` của collection cũ `fiction-letter` phải được giữ nguyên bằng cờ điều kiện.

---

### NHÓM 2: TRẢI NGHIỆM KỂ CHUYỆN & AUDIO-FIRST (STORYTELLING UX)

#### [AUD-STY-001] "False Affordance" trong QaScreen đối với 5 ngõ mới (Giao diện gợi mở tính năng không tồn tại)
- **Màn hình / Component:** `mobile/src/screens/QaScreen.tsx`, `VoiceInteractionDock.tsx`, `ExpandableInputDrawer.tsx`.
- **Mức độ nghiêm trọng:** CRITICAL (Trực tiếp gây thất vọng cho người dùng)
- **Bằng chứng & Hiện trạng:**
  - 5 ngõ mới (`ngo-gach`, `ngo-trung-yen`, `ngo-tam-thuong`, `ngo-cam-chi`, `ngo-phat-loc`) có 17 điểm dừng. Tất cả đều có `"qa": []`.
  - Ở Phase 1B (NK-004), khối thông báo rỗng ("Chưa có câu hỏi cho điểm này") đã bị gỡ bỏ theo yêu cầu sản phẩm.
  - Tuy nhiên, thanh Dock dưới đáy màn hình vẫn hiển thị nổi bật: Nút Micro tròn to ("Hỏi bằng giọng nói") và nút "Gõ" (Type question).
  - Khi người dùng bấm vào "Gõ", modal bàn phím trượt lên hiển thị mục "Gợi ý câu hỏi" rỗng tuếch.
  - Khi người dùng nói bất kỳ câu gì vào micro hoặc gõ chữ, hệ thống luôn trả về: `"Không tìm thấy câu trả lời phù hợp trong dữ liệu đã duyệt"`.
- **Nguyên nhân gốc rễ:** QaScreen ban đầu được thiết kế làm "Màn hình hỏi đáp có người kể chuyện phụ trợ", chưa được chuyển dịch tư duy sang "Màn hình nghe câu chuyện di sản (Story-First Explorer)" khi nội dung Q&A chưa được thu thập.
- **Giải pháp đề xuất:**
  - Thiết kế trạng thái giao diện thích ứng thông minh (Adaptive Story Mode):
    - Khi `nodeQa.length === 0`: Tự động chuyển Bottom Dock thành **Thanh điều khiển nghe chuyện chuyên sâu (Audio Story Player Dock)**:
      - Nút chính giữa: Phát/Tạm dừng câu chuyện của điểm (Play/Pause Story Track) kèm thanh sóng âm động (Voice waveform / progress).
      - Nút bên trái: Chuyển điểm dừng trước (Previous Stop).
      - Nút bên phải: Chuyển điểm dừng tiếp theo (Next Stop).
      - Nút phụ: Nút "Đọc chữ / Thu gọn" và nút "Sổ tay ngõ".
    - Ẩn hoàn toàn tính năng Micro và Ô nhập chữ khi bộ dữ liệu chưa có Q&A đã duyệt.
    - Hiển thị badge tinh tế: `"Chế độ nghe chuyện di sản"` thay vì để người dùng đặt câu hỏi vô vọng.
- **Quy cách Trước/Sau (Before/After):**
  - *Trước:* Người dùng nhìn thấy mic -> hào hứng bấm nói -> "Không có câu trả lời" -> thất vọng, tưởng app bị lỗi nhận diện giọng nói.
  - *Sau:* Người dùng nhìn thấy máy nghe chuyện trang nhã -> bấm Play để thưởng thức giọng đọc truyền cảm về con ngõ -> trải nghiệm thư thái, trọn vẹn.
- **Tệp bị ảnh hưởng:** `mobile/src/screens/QaScreen.tsx`, tạo mới hoặc cập nhật `mobile/src/components/StoryPlayerDock.tsx`.
- **Tiêu chí nghiệm thu:**
  - Tại 5 ngõ mới, không có nút nhập câu hỏi vô nghĩa. Trải nghiệm nghe và đọc câu chuyện điểm dừng hoạt động liền mạch.
  - Tại các collection cũ có Q&A (`fiction-letter`, `three-lenses`), thanh Dock hỏi đáp giọng nói vẫn xuất hiện đầy đủ.

---

#### [AUD-STY-002] Phân mảnh bộ điều khiển âm thanh (Audio Controls Inconsistency)
- **Màn hình / Component:** `HomeScreen.tsx`, `AlleyStoryCard.tsx`, `QaScreen.tsx` (`VoicePlayerBar.tsx`).
- **Mức độ nghiêm trọng:** HIGH
- **Bằng chứng & Hiện trạng:**
  1. `HomeScreen`: Nút bấm dạng viên thuốc màu vàng hổ phách (`introPlayBtn`), bên trong có icon Play và chữ "Nghe". Không hiển thị thời lượng (ví dụ: `00:40`), không có vạch tiến độ nghe, không thể tua.
  2. `AlleyStoryCard`: Nút tròn 44pt nền vàng, icon là emoji chữ `▶` hoặc `⏸` thô sơ (`cardPlayButtonIcon`), không có nhãn chữ, không có thời gian.
  3. `QaScreen`: Dùng `VoicePlayerBar` nền xanh rêu đậm (`#20372D`), hiển thị nhãn bài hát, thời gian hiện tại/tổng thời gian (`00:14 · 00:26`), nút Replay, nút Stop, thanh tiến độ mỏng 4pt (nhưng không cho kéo tua).
- **Nguyên nhân gốc rễ:** Không có quy chuẩn component Audio Player dùng chung giữa các màn hình.
- **Giải pháp đề xuất:**
  - Chuẩn hóa thành hệ thống **3 kích cỡ Audio Player thống nhất (Ngõ Kể Audio Suite)**:
    - `CompactPlayerBar`: Dùng cho `HomeScreen` và `AlleyStoryCard` (thay thế nút bấm lẻ tẻ). Hiển thị: Icon Play/Pause, Tiêu đề bài nghe ("Giới thiệu Ngõ"), Vạch tiến trình thu nhỏ, Thời lượng còn lại.
    - `ExpandedPlayerBar`: Dùng cho `QaScreen` khi nghe câu chuyện chính và câu trả lời Q&A. Cho phép chạm để nhảy 5 giây tới/lui.
    - Màu sắc đồng bộ theo token thương hiệu: Nền rêu đậm `#20372D`, điểm nhấn vàng hổ phách `#F2C56B`, chữ trắng kem `#FFFDF7`.
- **Tệp bị ảnh hưởng:** `mobile/src/components/VoicePlayerBar.tsx`, `mobile/src/screens/HomeScreen.tsx`, `mobile/src/components/AlleyStoryCard.tsx`.
- **Tiêu chí nghiệm thu:**
  - Mọi nơi phát audio trong app đều có chỉ số thời gian trực quan (Current Time / Total Duration).
  - Trạng thái đang phát (Playing) thể hiện đồng bộ (icon Pause đồng nhất, vạch sóng chuyển động nhẹ).

---

#### [AUD-STY-003] Văn bản câu chuyện Three Lenses quá dài gây mỏi mắt trên thiết bị di động
- **Màn hình / Component:** `mobile/src/screens/QaScreen.tsx` khi xem `old-quarter-three-lenses`.
- **Mức độ nghiêm trọng:** MEDIUM
- **Bằng chứng & Hiện trạng:**
  - Tại trạm Đền Bạch Mã, văn bản câu chuyện dài **1.570 ký tự**.
  - Tại trạm Mã Mây, văn bản dài **1.776 ký tự**.
  - Tại trạm Chợ Đồng Xuân, văn bản dài **1.383 ký tự**.
  - Khi người dùng bấm "Đọc văn bản", một khối chữ dày đặc tràn ngập màn hình, khoảng cách dòng và kích thước chữ (`fontSize: 15, lineHeight: 24`) trên nền thẻ nổi tạo cảm giác ngột ngạt (text fatigue).
- **Nguyên nhân gốc rễ:** Nội dung Three Lenses được biên soạn cho kịch bản đọc phát thanh chuyên sâu, khi đưa lên màn hình di động chưa được phân đoạn thị giác (visual paragraph chunking).
- **Giải pháp đề xuất:**
  - Định dạng lại hiển thị văn bản dài trong `QaScreen`:
    - Tự động chia các đoạn văn bằng khoảng đệm `marginBottom: 16`.
    - Thêm chữ cái đầu đoạn nổi bật (Drop Cap) hoặc trích dẫn tiêu điểm (Pull Quote) màu gạch nung `#9C4F36`.
    - Hỗ trợ chế độ "Đọc tập trung" (Immersive Reading Mode) có thể cuộn toàn màn hình với độ tương phản dịu mắt.
- **Tệp bị ảnh hưởng:** `mobile/src/screens/QaScreen.tsx`.
- **Tiêu chí nghiệm thu:** Văn bản dài trên 1.000 ký tự có nhịp thở thị giác rõ ràng, người dùng có thể đọc lướt qua các ý chính dễ dàng.

---

### NHÓM 3: HÌNH ẢNH, BẢN QUYỀN & CHIẾN LƯỢC PLACEHOLDER (IMAGE PRESENTATION)

#### [AUD-IMG-001] Tái sử dụng hình ảnh cẩu thả và sai lệch ngữ cảnh địa lý
- **Màn hình / Component:** `mobile/src/assets/photoMap.ts`.
- **Mức độ nghiêm trọng:** HIGH (Ảnh hưởng trực tiếp đến tính chân thực của sản phẩm di sản)
- **Bằng chứng & Hiện trạng:**
  1. Trong Ngõ Gạch (`ngo-gach`):
     - `ngo-gach-ca-phe-no1` (Cà Phê No.1)
     - `ngo-gach-ta-ca-phe-4` (Ta Cà Phê 4)
     - `ngo-gach-cafe-20` (Cafe 20)
     -> Cả 3 quán cà phê khác nhau này đều trỏ chung vào 1 tệp ảnh: `cafengotongduytan_04.jpg` (ảnh quán cà phê ở phố Tống Duy Tân, hoàn toàn không phải Ngõ Gạch)!
  2. Trong Ngõ Trung Yên (`ngo-trung-yen`):
     - `trung-yen-pho-vui` (Phở Vui)
     - `trung-yen-bun-ngan-nhan` (Bún ngan Nhàn)
     - `trung-yen-mien-tron-muc` (Miến trộn mực)
     -> Cả 3 quán ăn đặc trưng này đều trỏ chung vào 1 tệp ảnh: `ngocamchi_03.jpg` (ảnh chụp ngõ Cấm Chỉ)!
  3. Trong Ngõ Tạm Thương, Ngõ Cấm Chỉ, Ngõ Phất Lộc:
     - Toàn bộ 7 điểm dừng không hề có trong `NODE_PHOTO_MAP`. Khi mở app, hàm `getNodePhoto` âm thầm trả về `HERO_PHOTO` (`pexels_demo_06.jpg` - ảnh ngõ cờ hoa lồng đèn)!
- **Nguyên nhân gốc rễ:** Thiếu tư liệu ảnh chụp thật khi đóng gói dữ liệu khảo sát, dẫn đến việc dùng ảnh "thế chân" một cách tùy tiện mà không có cảnh báo thị giác cho người dùng.
- **Giải pháp đề xuất:**
  - Áp dụng nguyên tắc **"Thà dùng đồ họa ký họa còn hơn dùng ảnh giả danh"**:
    - Ngừng gán ảnh ngõ khác cho địa điểm không liên quan.
    - Với các điểm chưa có ảnh thật đã kiểm chứng bản quyền, hiển thị **"Thẻ Ký Họa Di Sản" (Heritage Architectural Sketch Card)**: Một khung tranh đồ họa vector trang nhã mô phỏng nét vẽ chì/mực tàu góc phố Hà Nội, ở giữa có dấu mộc chìm: `"Đang cập nhật ảnh thực địa"` kèm tên điểm dừng.
- **Tệp bị ảnh hưởng:** `mobile/src/assets/photoMap.ts`, `mobile/src/components/CrossfadePhoto.tsx`, `mobile/src/components/PostcardCard.tsx`.
- **Tiêu chí nghiệm thu:**
  - Không còn tình trạng 3 quán ăn khác nhau hiển thị cùng một bức ảnh.
  - Người dùng luôn biết rõ bức ảnh mình đang xem là ảnh thật của điểm đó hay là ảnh minh họa ký họa tạm thời.

---

#### [AUD-IMG-002] Tồn tại tệp ảnh vi phạm bản quyền (Google Maps Contributor)
- **Màn hình / Component:** `mobile/src/assets/photoMap.ts`, các tệp trong `mobile/assets/photos/alleys/`.
- **Mức độ nghiêm trọng:** HIGH (Rủi ro pháp lý & vi phạm chỉ đạo dự án)
- **Bằng chứng & Hiện trạng:**
  - Trong `photoMap.ts` dòng 101, 111, 116, 126 ghi rõ:
    - Đình Thanh Hà: `photographer: 'Google Maps contributor (name not recorded · demo)'`
    - Chùa Cầu Đông: `photographer: 'Google Maps contributor (name not recorded · demo)'`
    - Phở Sướng: `photographer: 'Google Maps contributor (name not recorded · demo)'`
    - Bún cá Sâm Cây Si: `photographer: 'Google Maps contributor (name not recorded · demo)'`
  - Các tệp nhị phân đi kèm: `dinh-thanh-ha-1.jpg`, `chua-cau-dong-1.jpg`, `pho-suong-1.jpg`, `bun-ca-sam-cay-si-1.jpg`.
  - Ràng buộc dự án nêu rõ: *"Không tự lấy ảnh Google Maps để đóng gói; Không tự tải ảnh thiếu license"*.
- **Nguyên nhân gốc rễ:** Quá trình chuẩn bị demo ban đầu đã tải nhanh ảnh từ web công cộng để kiểm thử chức năng hiển thị.
- **Giải pháp đề xuất:**
  - Đưa 4 điểm dừng này vào danh sách áp dụng Thẻ Ký Họa Di Sản sạch (Clean Illustrated Vector Placeholder).
  - Lập ticket bàn giao cho đội Content/Nhiếp ảnh thu thập ảnh chụp thực tế có giấy phép tác quyền rõ ràng trước khi phát hành chính thức.
- **Tệp bị ảnh hưởng:** `mobile/src/assets/photoMap.ts`, tài liệu bàn giao `docs/HANDOFF_DATA.md`.

---

#### [AUD-IMG-003] Dung lượng tệp ảnh bìa quá lớn gây lãng phí bộ nhớ và giật lag (Asset Bloat)
- **Màn hình / Component:** `mobile/assets/photos/alleys/`.
- **Mức độ nghiêm trọng:** MEDIUM
- **Bằng chứng & Hiện trạng:**
  - `ngo-tam-thuong-cover.png`: **4.13 MB** (4.138.537 bytes)
  - `ngo-trung-yen-cover.png`: **2.73 MB** (2.734.316 bytes)
  - `ngo-gach-cover.png`: **1.40 MB** (1.398.380 bytes)
  - Tổng dung lượng 3 tệp PNG này đã chiếm tới hơn **8.2 MB** dung lượng bundle. Khi render qua `ImageBackground` với hiệu ứng `blurRadius={6}` trên màn hình Landing/Home, RAM của ứng dụng bị tăng vọt (spike) có thể dẫn tới giật khung hình (frame drop) trên máy cấu hình yếu.
- **Nguyên nhân gốc rễ:** Xuất ảnh PNG không nén (uncompressed RGBA PNG) thay vì tối ưu hóa sang định dạng JPG hoặc WebP chất lượng 85%.
- **Giải pháp đề xuất:**
  - Chuyển đổi toàn bộ ảnh bìa ngõ sang định dạng `.jpg` hoặc `.webp`, độ phân giải tối đa 1440x960px, dung lượng khống chế nghiêm ngặt **< 250 KB / ảnh** (giảm hơn 94% dung lượng).
- **Tệp bị ảnh hưởng:** `mobile/assets/photos/alleys/`, `mobile/src/data/collections.ts`.
- **Tiêu chí nghiệm thu:** Bundle assets giảm ít nhất 7 MB. Tốc độ nạp màn hình Landing và Home tức thì (< 50ms).

---

### NHÓM 4: KHẢ NĂNG SỬ DỤNG TRÊN THIẾT BỊ DI ĐỘNG (MOBILE USABILITY & ACCESSIBILITY)

#### [AUD-MOB-001] Chèn lấn giao diện khi bật phóng to chữ (Font Scaling > 1.3x) trên màn hình Home
- **Màn hình / Component:** `mobile/src/screens/HomeScreen.tsx` (`compactPreviewCard`, `topHeader`).
- **Mức độ nghiêm trọng:** MEDIUM
- **Bằng chứng & Hiện trạng:**
  - Trong `HomeScreen.tsx`, khi `fontScale > 1.3`:
    - `compactPreviewCard` chuyển sang layout dọc (`compactPreviewCardStacked`).
    - Nút CTA "Đọc câu chuyện" chuyển sang `width: '100%'`.
    - Chiều cao của Card preview tăng từ ~65pt lên ~170pt.
    - Cùng lúc đó, `ToolDock` ở đáy chiếm ~70pt, `topHeader` chiếm ~85pt.
    - Trên các dòng máy màn hình nhỏ (ví dụ iPhone SE 2022 có chiều cao khả dụng 667pt), không gian còn lại cho bản đồ thu hẹp chỉ còn dưới 340pt. Người dùng chỉ nhìn thấy 1 điểm dừng trên dải đường uốn lượn, buộc phải cuộn liên tục.
- **Nguyên nhân gốc rễ:** Card preview được đặt cố định trong luồng bố cục flexbox thay vì có cơ chế thu gọn thông minh khi không thao tác.
- **Giải pháp đề xuất:**
  - Thêm thao tác vuốt xuống nhẹ để thu nhỏ card thành thanh mỏng 1 dòng (Mini Floating Pill) khi người dùng muốn tập trung quan sát bản đồ ngõ.
  - Thiết lập cận trên cho `fontScale` tối đa là 1.6x trên các phần tử điều hướng bản đồ để tránh vỡ giao diện.
- **Tệp bị ảnh hưởng:** `mobile/src/screens/HomeScreen.tsx`.
- **Tiêu chí nghiệm thu:** Trên màn hình kích thước 375x667pt với cỡ chữ lớn nhất của hệ thống, bản đồ ngõ vẫn hiển thị được tối thiểu 2 điểm dừng và đường nối rõ ràng.

---

#### [AUD-MOB-002] Nút bấm lọc trong màn hình chọn ngõ không đảm bảo diện tích chạm chuẩn
- **Màn hình / Component:** `mobile/src/screens/AlleySelectScreen.tsx` (`filterChip`).
- **Mức độ nghiêm trọng:** LOW
- **Bằng chứng & Hiện trạng:**
  - Các chip lọc thể loại ("Tất cả", "Ẩm thực", "Di sản", "Chuyện xưa") trong `AlleySelectScreen`:
    - Chỉ có `paddingVertical: 6, paddingHorizontal: 12`.
    - Chiều cao thực tế đo được chỉ đạt ~32pt (dưới chuẩn tối thiểu 44pt theo khuyến nghị của Apple Human Interface Guidelines và Google Material Design).
    - Mặc dù nằm trên thanh cuộn ngang, các chip nằm sát nhau khiến ngón tay cái dễ chạm nhầm khi đi bộ ngoài phố.
- **Nguyên nhân gốc rễ:** Chưa khai báo thuộc tính `minHeight: 44` hoặc `hitSlop` cho thẻ `Pressable`.
- **Giải pháp đề xuất:**
  - Thêm `minHeight: 44`, `justifyContent: 'center'`, và bổ sung `hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}`.
- **Tệp bị ảnh hưởng:** `mobile/src/screens/AlleySelectScreen.tsx`.
- **Tiêu chí nghiệm thu:** Vùng chạm đạt chuẩn tối thiểu 44x44pt cho toàn bộ các nút bấm và chip lựa chọn.

---

#### [AUD-MOB-003] Đột biến độ tương phản và viền hộp Modal Sổ tay
- **Màn hình / Component:** `mobile/src/components/NotebookDrawerModal.tsx`.
- **Mức độ nghiêm trọng:** LOW
- **Bằng chứng & Hiện trạng:**
  - Khối chuyển đổi chế độ Demo / Live (`sourceBox`):
    - Đặt trong nền giấy kem `#F7F2E7` với viền `#E6DCC8`.
    - Khi ở trạng thái Live bận (`liveBusy`), chữ hiển thị xám nhạt khó đọc dưới trời nắng gắt ngoài phố (`color: '#8C7D70'`).
    - Nút đóng Sổ tay (`✕`) có nền `#F5ECE0` và chữ `#4A3B32`, độ tương phản màu đạt 3.8:1 (chưa đạt chuẩn WCAG AA 4.5:1 cho văn bản nhỏ).
- **Giải pháp đề xuất:**
  - Nâng màu chữ nút đóng lên `#2E3028` (mực đen xám) để đạt độ tương phản 8.2:1.
  - Bổ sung biểu tượng loading xoay tròn rõ ràng khi đang tải dữ liệu Live.
- **Tệp bị ảnh hưởng:** `mobile/src/components/NotebookDrawerModal.tsx`.

---

### NHÓM 5: TÍNH NHẤT QUÁN SẢN PHẨM & DỮ LIỆU (PRODUCT & DATA CONSISTENCY)

#### [AUD-PRD-001] Xung đột danh mục và nhãn chủ đề trong màn hình Lập kế hoạch (PlanScreen Topic Disconnect)
- **Màn hình / Component:** `mobile/src/screens/PlanScreen.tsx`, `data/localized/ngo-tam-thuong.vi.json`, `data/localized/ngo-cam-chi.vi.json`, `data/localized/ngo-phat-loc.vi.json`.
- **Mức độ nghiêm trọng:** HIGH (Lỗi trải nghiệm logic sản phẩm)
- **Bằng chứng & Hiện trạng:**
  - Trong `collections.ts` và `translator.ts`, 3 ngõ: **Ngõ Tạm Thương**, **Ngõ Cấm Chỉ**, **Ngõ Phất Lộc** đều được định vị chủ đề nổi bật là: **"Ẩm thực" (Culinary)**. Cụ thể:
    - Ngõ Tạm Thương: "Cái nôi nem chua rán", theme: "Ẩm thực".
    - Ngõ Cấm Chỉ: "Phố ẩm thực đêm đỏ lửa", theme: "Ẩm thực".
    - Ngõ Phất Lộc: "Nếp ngõ ẩm thực bún đậu mắm tôm", theme: "Ẩm thực".
  - TUY NHIÊN, khi người dùng mở `PlanScreen` trong 3 ngõ này và chọn chủ đề: **"1. Ăn thực" (Food)**:
    - Thuật toán `pickPoints` lọc theo tag `tags.includes('an thuc')`.
    - Kiểm tra dữ liệu JSON thực tế:
      - Ngõ Tạm Thương: Điểm 1 (Đình Yên Thái) có tags `['chuyen xua', 'kham pha tu do']`. Điểm 2 (Đền Vọng Tiên) có tags `['chuyen xua', 'kham pha tu do']`. KHÔNG CÓ ĐIỂM NÀO CÓ TAG `'an thuc'`!
      - Ngõ Cấm Chỉ: 3 điểm dừng đều mang tags `['chuyen xua', 'kham pha tu do']`. KHÔNG CÓ ĐIỂM NÀO CÓ TAG `'an thuc'`!
      - Ngõ Phất Lộc: 2 điểm dừng đều mang tags `['chuyen xua', 'kham pha tu do']`. KHÔNG CÓ ĐIỂM NÀO CÓ TAG `'an thuc'`!
    - **Hậu quả:** 100% người dùng chọn ngõ vì ẩm thực, khi vào tính năng Lập kế hoạch chọn "Ăn thực" đều nhận thông báo cụt hứng: `"Không có điểm nào phù hợp trong dữ liệu hiện tại"`!
- **Nguyên nhân gốc rễ:** Sự thiếu đồng bộ giữa nhóm biên tập metadata bộ sưu tập và nhóm biên soạn chi tiết các điểm dừng văn hóa/tín ngưỡng.
- **Giải pháp đề xuất:**
  - Cần có phương án xử lý UX thông minh tại `PlanScreen`:
    - Nếu bộ sưu tập đang chọn không có điểm nào thuộc chủ đề người dùng bấm, hiển thị thông điệp gợi mở văn hóa:
      *Ví dụ tại Ngõ Tạm Thương:* `"Các quán nem chua rán trứ danh nằm rải rác dọc ngõ. Trong ứng dụng, 2 điểm dừng khám phá văn hóa là Đình Yên Thái và Đền Vọng Tiên. Bạn có muốn ghé thăm không?"* kèm nút chuyển đổi gợi ý nhanh sang chủ đề "Chuyện xưa".
    - Phối hợp đề xuất cập nhật tag dữ liệu bổ sung trong Phase nội dung tiếp theo.
- **Tệp bị ảnh hưởng:** `mobile/src/screens/PlanScreen.tsx`.
- **Tiêu chí nghiệm thu:** Không bao giờ để người dùng rơi vào trạng thái "Dead End" (màn hình cụt không có lối ra) khi chọn chủ đề trùng với chủ đề chính của con ngõ.

---

#### [AUD-PRD-002] Lệch mã định danh Alley ID giữa `photoMap.ts` và `collections.ts`
- **Màn hình / Component:** `mobile/src/assets/photoMap.ts` (`ALLEY_LIST`) vs `mobile/src/data/collections.ts` (`AVAILABLE_COLLECTIONS`).
- **Mức độ nghiêm trọng:** MEDIUM
- **Bằng chứng & Hiện trạng:**
  - Trong `collections.ts`, ID chuẩn là:
    - `ngo-phat-loc`
    - `ngo-tam-thuong`
    - `ngo-cam-chi`
  - Trong `photoMap.ts`, mảng `ALLEY_LIST` lại định nghĩa:
    - `phat-loc`
    - `tam-thuong`
    - `cam-chi`
    - Và còn có cả `hang-chi` (Ngõ Hàng Chỉ - hoàn toàn không tồn tại trong danh mục 8 collection của app)!
  - Khi `HomeScreen` gọi `getAlleyMeta(route.params?.alleyId)` với ID `ngo-phat-loc`, hàm không tìm thấy kết quả và trả về phần tử mặc định `ALLEY_LIST[0]` (Phất Lộc với số liệu tĩnh cũ: 6 câu chuyện, 45 phút, trong khi thực tế dataset chỉ có 2 điểm dừng).
- **Nguyên nhân gốc rễ:** `photoMap.ts` lưu trữ dữ liệu mock cứng từ các phase đầu chưa được dọn dẹp sau khi chuẩn hóa `collections.ts`.
- **Giải pháp đề xuất:**
  - Đồng bộ hóa toàn bộ ID trong `ALLEY_LIST` khớp 100% với `CollectionId` trong `collections.ts`.
  - Loại bỏ các mục mồ côi (như `hang-chi`).
  - Các chỉ số `nodeCount`, `estTimeMinutes` phải được lấy động từ chính dataset thay vì fix cứng trong mock.
- **Tệp bị ảnh hưởng:** `mobile/src/assets/photoMap.ts`.
- **Tiêu chí nghiệm thu:** `getAlleyMeta` luôn trả về đúng metadata đồng nhất với dataset đang active.

---

#### [AUD-PRD-003] Thiếu tọa độ GPS ở 3 ngõ mới gây tê liệt tính năng "Vị trí GPS"
- **Màn hình / Component:** `mobile/src/screens/LocationScreen.tsx`, dữ liệu `ngo-tam-thuong.vi.json`, `ngo-cam-chi.vi.json`, `ngo-phat-loc.vi.json`.
- **Mức độ nghiêm trọng:** MEDIUM
- **Bằng chứng & Hiện trạng:**
  - Tại 3 ngõ mới (`ngo-tam-thuong`, `ngo-cam-chi`, `ngo-phat-loc`), 100% các điểm dừng đều có `latitude: null, longitude: null`.
  - Tại Ngõ Trung Yên, 3/5 điểm dừng có tọa độ `null`.
  - Khi người dùng bấm nút "Vị trí GPS" trên thanh ToolDock, màn hình `LocationScreen` mở ra. Khi bấm "Xác định vị trí hiện tại", thuật toán `pickCandidate` lập tức báo lỗi: `"Dữ liệu tuyến chưa có tọa độ để so khớp"` (`no-coordinates`).
- **Nguyên nhân gốc rễ:** Dữ liệu khảo sát thực địa chưa hoàn tất (đã được ghi nhận trung thực trong các báo cáo kỹ thuật trước).
- **Giải pháp đề xuất UX:**
  - Tại `HomeScreen` và `ToolDock`: Nếu toàn bộ điểm dừng của con ngõ chưa có tọa độ GPS, nút GPS trên ToolDock nên hiển thị trạng thái hỗ trợ chọn thủ công (Manual Selection Mode):
    - Khi bấm vào, thay vì báo lỗi kỹ thuật vô cảm, hiển thị giao diện thân thiện: `"Con ngõ này đang trong giai đoạn khảo sát tọa độ vệ tinh. Bạn có thể chọn điểm dừng bằng tay theo danh sách bên dưới."`
    - Ưu tiên hiển thị danh sách chọn tay trực quan với ảnh chụp và tên điểm.
- **Tệp bị ảnh hưởng:** `mobile/src/screens/LocationScreen.tsx`.
- **Tiêu chí nghiệm thu:** Người dùng không gặp thông báo lỗi kỹ thuật cụt lủn, luồng chọn điểm bằng tay diễn ra êm ái.

---

## 4. MA TRẬN ĐỐI CHIẾU TRẢI NGHIỆM NGƯỜI DÙNG (UX HEURISTICS SCORECARD)

Đánh giá ứng dụng Ngõ Kể theo 10 nguyên lý kinh điển của Nielsen Norman Group kết hợp tiêu chuẩn Mobile UX hiện đại:

| Tiêu chuẩn UX (Heuristic) | Điểm (1-5) | Thực trạng quan sát được | Hướng giải quyết |
| :--- | :---: | :--- | :--- |
| **1. Trạng thái hệ thống (Visibility of system status)** | 3.5/5 | Trạng thái Live/Demo rõ ràng, nhưng trạng thái âm thanh thiếu scrubber, không rõ đang nghe tới phút thứ mấy trên Home. | Thêm thanh mini-player và vạch thời gian cụ thể. |
| **2. Tương đồng thế giới thực (Match between system & real world)** | 4.2/5 | Ẩn dụ "Sổ tay ngõ phố", dấu mộc gạch nung, bưu thiếp, đường mòn rất thơ mộng và gần gũi với văn hóa Hà Nội. | Chuẩn hóa toàn bộ card theo ngôn ngữ trang sổ. |
| **3. Kiểm soát người dùng (User control & freedom)** | 4.0/5 | Điều hướng Back tốt, hỗ trợ chọn điểm bằng tay khi từ chối cấp quyền camera/vị trí. | Thêm khả năng thu nhỏ card preview và pause audio bất kỳ lúc nào. |
| **4. Nhất quán & Chuẩn mực (Consistency & standards)** | 2.5/5 | **Kém.** Xung đột màu gắt giữa các màn hình; 3 kiểu nút audio khác nhau; lệch ID dữ liệu. | Ban hành Design System và component dùng chung (`UI Spec`). |
| **5. Phòng ngừa lỗi (Error prevention)** | 3.8/5 | Các guard Phase 1B ngăn phát đè âm thanh và cách ly Demo/Live hoạt động rất tốt. | Chặn người dùng gửi câu hỏi rỗng vào Q&A khi dataset chưa có dữ liệu. |
| **6. Nhận biết thay vì nhớ lại (Recognition rather than recall)** | 3.0/5 | 5 ngõ mới không có gợi ý câu hỏi mẫu khiến người dùng không biết phải hỏi gì. | Chuyển sang Story Player Mode chuyên dụng khi ngõ chưa có Q&A. |
| **7. Linh hoạt & Hiệu quả (Flexibility & efficiency)** | 3.7/5 | Hỗ trợ chuyển đổi nhanh VI/EN ngay trên header; có phím tắt mở nhanh Sổ tay và Quét QR. | Giữ vững vị trí ToolDock đáy màn hình. |
| **8. Tối giản & Thẩm mỹ (Aesthetic & minimalist design)** | 3.2/5 | Bố cục đường mòn ngõ rất đẹp, nhưng text Three Lenses quá dài; ảnh PNG quá nặng. | Tối ưu kích thước tệp ảnh, phân đoạn lại văn bản dài. |
| **9. Phục hồi khi gặp lỗi (Help users recover from errors)** | 4.0/5 | Màn hình `UnavailableScreen` có nút Thử lại (Retry) và Chuyển về Demo rất tiện lợi. | Bổ sung câu giải thích văn hóa khi PlanScreen không tìm thấy điểm. |
| **10. Trợ giúp & Tài liệu (Help & documentation)** | 4.5/5 | Cẩm nang ngõ (`guide`) trong Sổ tay biên soạn rất chỉn chu (Quán nên thử, Nên ghé thăm). | Giữ nguyên và nhân rộng cấu trúc guide cho Ngõ Gạch. |

---

## 5. ĐỀ XUẤT CÁC TICKETS TRIỂN KHAI CHO CODEX LUNA (IMPLEMENTATION ROADMAP)

Để đảm bảo tính độc lập, an toàn và dễ dàng kiểm thử tự động mà không làm ảnh hưởng đến kiến trúc cốt lõi, đề xuất chia công việc cải tiến UX/UI thành **6 tickets kỹ thuật độc lập** giao cho Codex Luna:

```
┌─────────────────────────────────────────────────────────────────┐
│                    TIẾN TRÌNH THỰC HIỆN ĐỀ XUẤT                 │
├─────────────────┬───────────────────────────────┬───────────────┤
│ GIAI ĐOẠN 1     │ TICKET NK-UI-01               │ TICKET NK-UI-02│
│ Token & Layout  │ Đồng bộ Tokens & Theme Kép    │ Sửa lỗi bản đồ│
│                 │ (Colors, Radius, Elevation)   │ ngõ ít điểm   │
├─────────────────┼───────────────────────────────┼───────────────┤
│ GIAI ĐOẠN 2     │ TICKET NK-UI-03               │ TICKET NK-UI-04│
│ Trải nghiệm     │ Chuyển đổi Adaptive Story Dock│ Thống nhất    │
│ Âm thanh        │ cho 5 ngõ mới rỗng Q&A        │ Audio Player  │
├─────────────────┼───────────────────────────────┼───────────────┤
│ GIAI ĐOẠN 3     │ TICKET NK-UI-05               │ TICKET NK-UI-06│
│ Hình ảnh & Data │ Dọn dẹp ảnh GMaps & Thay thế  │ Đồng bộ Tag   │
│                 │ Ký họa Vector Placeholder     │ PlanScreen    │
└─────────────────┴───────────────────────────────┴───────────────┘
```

---

### [TICKET NK-UI-01]: Chuẩn hóa Hệ thống Semantic Tokens & Đồng bộ Theme Kép
- **Mục tiêu:** Đồng nhất màu sắc và phông chữ toàn app theo triết lý "Sổ tay ngõ phố", xóa bỏ sự chênh lệch gắt giữa Dark Cinematic và Light Paper.
- **Phạm vi tệp sở hữu (Ownership):**
  - `mobile/src/theme.ts`
  - `mobile/src/screens/AlleySelectScreen.tsx`
  - `mobile/src/components/AlleyPassportModal.tsx`
  - `mobile/src/components/NotebookDrawerModal.tsx`
- **Tiêu chuẩn kiểm thử (Test Criteria):**
  - Chạy `npm test --prefix mobile` pass 100%.
  - `npm run lint --prefix mobile` và `npm run typecheck --prefix mobile` không có lỗi.
  - Test mới: Kiểm tra các biến màu trong `AlleySelectScreen` và `AlleyPassportModal` đều tham chiếu từ `theme.ts`, không còn mã màu hex tự do (hardcoded `#1E241D` hay `#F5EFE6`).

---

### [TICKET NK-UI-02]: Thuật toán phân bổ điểm dừng động trên bản đồ ngõ (Dynamic Map Trail Layout)
- **Mục tiêu:** Khắc phục tình trạng 2 điểm dừng bị dồn cục ở 23% đầu bản đồ tại các ngõ ngắn (Ngõ Tạm Thương, Ngõ Phất Lộc, Ngõ Cấm Chỉ).
- **Phạm vi tệp sở hữu:**
  - `mobile/src/utils/alleyGeometry.ts`
  - `mobile/src/screens/HomeScreen.tsx`
  - `mobile/tests/alleyGeometry.test.mjs`
- **Tiêu chuẩn kiểm thử:**
  - Viết test unit kiểm tra: Với `nodeCount = 2`, khoảng cách Y giữa 2 pin tối thiểu 40% chiều cao canvas.
  - Đảm bảo `fiction-letter` (dataset cũ) giữ nguyên vị trí cố định chính xác 100% không làm lệch snapshot regression hiện có.

---

### [TICKET NK-UI-03]: Chế độ Adaptive Story Mode cho QaScreen (Xử lý 0 Q&A)
- **Mục tiêu:** Ẩn micro và ô gõ câu hỏi khi điểm dừng không có Q&A, chuyển thành thanh điều khiển nghe chuyện di sản chuyên nghiệp.
- **Phạm vi tệp sở hữu:**
  - `mobile/src/screens/QaScreen.tsx`
  - `mobile/src/components/VoiceInteractionDock.tsx`
  - `mobile/tests/qaStoryMode.test.mjs` (test mới)
- **Tiêu chuẩn kiểm thử:**
  - Khi `nodeQa.length === 0`: Không render nút Mic ghi âm và nút Gõ chữ. Render thanh công cụ phát câu chuyện điểm dừng với nút Play/Pause và Chuyển điểm.
  - Khi `nodeQa.length > 0` (Fiction letter, Three lenses): Render đầy đủ dock giọng nói và gợi ý câu hỏi như cũ.

---

### [TICKET NK-UI-04]: Thống nhất Bộ điều khiển Âm thanh (Ngõ Kể Audio Suite)
- **Mục tiêu:** Đồng bộ hóa cách hiển thị trạng thái phát âm thanh trên `HomeScreen`, `AlleyStoryCard` và `QaScreen`.
- **Phạm vi tệp sở hữu:**
  - `mobile/src/components/VoicePlayerBar.tsx`
  - `mobile/src/screens/HomeScreen.tsx`
  - `mobile/src/components/AlleyStoryCard.tsx`
  - `mobile/tests/voicePlayerBar.test.mjs`
- **Tiêu chuẩn kiểm thử:**
  - Mọi nơi phát audio đều hiển thị thời lượng chuẩn dạng `mm:ss`.
  - Icon Play/Pause đồng bộ dùng vector từ `AppIcon.tsx`, không dùng ký tự emoji thô sơ `▶` / `⏸`.

---

### [TICKET NK-UI-05]: Dọn dẹp tư liệu Google Maps & Kích hoạt Thẻ Ký Họa Di Sản
- **Mục tiêu:** Loại bỏ hoàn toàn các tệp ảnh và chuỗi ghi công `Google Maps contributor`, thay thế bằng ảnh ký họa vector bản quyền sạch; nén các file ảnh bìa > 1MB.
- **Phạm vi tệp sở hữu:**
  - `mobile/src/assets/photoMap.ts`
  - `mobile/src/components/PostcardCard.tsx`
  - `mobile/src/components/HeritageSketchPlaceholder.tsx` (mới)
- **Tiêu chuẩn kiểm thử:**
  - Quét toàn bộ mã nguồn không còn chuỗi `Google Maps contributor`.
  - Toàn bộ 17 điểm dừng mới đều có ảnh hợp lệ hoặc hiển thị component Ký Họa sạch sẽ, kèm credit trung thực.

---

### [TICKET NK-UI-06]: Đồng bộ hóa Nhãn Chủ Đề và Danh Mục Tuyến Ngõ
- **Mục tiêu:** Sửa lỗi "Dead End" trong `PlanScreen` khi người dùng chọn chủ đề "Ăn thực" tại các ngõ ẩm thực nổi tiếng; đồng bộ hóa ID ngõ trong `photoMap.ts`.
- **Phạm vi tệp sở hữu:**
  - `mobile/src/screens/PlanScreen.tsx`
  - `mobile/src/assets/photoMap.ts`
  - `mobile/tests/planScreenExperience.test.mjs`
- **Tiêu chuẩn kiểm thử:**
  - Khi `PlanScreen` không tìm thấy điểm khớp chủ đề, hiển thị lời khuyên văn hóa và nút gợi ý chuyển đổi chủ đề sang các điểm hiện có trong ngõ.
  - Hàm `getAlleyMeta` giải quyết chính xác 100% ID theo định dạng `ngo-*`.

---

*Báo cáo kết thúc phần UX Audit. Mời xem chi tiết quy cách thiết kế hệ thống tại tài liệu đi kèm: `docs/design/NGO_KE_UI_SPEC.md`.*
