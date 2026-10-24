# NGÕ KỂ — UX/UI DESIGN REVISION V1.1 TECHNICAL HANDOFF

**Phiên bản:** 1.1  
**Ngày bàn giao:** 23/10/2026  
**Vai trò:** Senior Mobile Product Designer & Visual Design Lead  
**Đơn vị tiếp nhận:** Lead Coordinator, Codex Sol (Technical Reviewer), Codex Luna (FE Implementation Worker)  
**Tài liệu quy cách đi kèm:** [NGO_KE_UI_SPEC_V1_1.md](NGO_KE_UI_SPEC_V1_1.md)  
**Tài liệu nền tảng:**
- `docs/plans/NGO_KE_UI_IMPLEMENTATION_REVIEW.md` (Codex Sol Review Baseline)
- `docs/plans/NGO_KE_UI_APPROVED_TICKETS.md` (Codex Sol Scoping Baseline)
- `docs/design/NGO_KE_UX_AUDIT.md` (v1.0 Audit Baseline)

---

## 1. TỔNG QUAN HIỆU CHỈNH & ĐỐI CHIẾU SO VỚI BẢN V1.0

Bản bàn giao V1.1 là kết quả của quá trình tiếp thu và phản biện kỹ thuật sâu sắc giữa thiết kế sản phẩm (Antigravity) và đánh giá kỹ thuật mã nguồn (Codex Sol). Toàn bộ các đề xuất lý thuyết không tương thích hoặc có nguy cơ gây hồi quy chức năng (regression) trong bản v1.0 đã được điều chỉnh hoặc bóc tách thành các giai đoạn riêng biệt.

### 1.1. Bảng Phân loại & Hiệu chỉnh Toàn bộ Findings từ UX Audit v1.0

| Issue ID | Phân loại Kỹ thuật | Trạng thái trong v1.0 | Hiệu chỉnh chuẩn xác trong v1.1 | Quyết định Handoff |
| :--- | :--- | :--- | :--- | :--- |
| **AUD-VIS-001** | **DESIGN_PREFERENCE** | Nhận định xung đột màu gắt gây chói mắt trên thiết bị. | Chưa có bằng chứng đo đạc trên thiết bị thật. Giữ nguyên hướng tiếp cận Bề mặt Kép (Dual-Surface) nhưng chuyển sang giải pháp **Additive Tokens**, giữ nguyên 100% token cũ trong `theme.ts`. | **SẴN SÀNG TRIỂN KHAI (Scope NK-UI-01A)** |
| **AUD-VIS-002** | **DESIGN_PREFERENCE** | Đề xuất tạo component `ScreenHeader` mới gộp mọi màn hình, yêu cầu tọa độ Y đồng nhất 100%. | Header các màn hình khác nhau vì phục vụ tác vụ khác nhau. Yêu cầu Y bằng nhau 100% không phù hợp với safe area và fontScale đa dạng. Hoãn tạo component `ScreenHeader` mới để không phình to scope ticket. | **HOÃN (DEFERRED)** |
| **AUD-VIS-003** | **CONFIRMED_BY_SOURCE** | Chỉ ra 2 điểm dừng bị dồn cục ở 23% đầu bản đồ do dùng mảng tĩnh `PIN_CONFIG`. | Xác nhận chính xác qua mã nguồn `HomeScreen.tsx:237–250`. Đã sửa thuật toán: nhận `node.id` thực tế thay vì sinh `fallback-*`, bảo toàn tuyệt đối vị trí cũ của `fiction-letter`. | **SẴN SÀNG TRIỂN KHAI (Scope NK-UI-02)** |
| **AUD-STY-001** | **INACCURATE** | Cho rằng mọi voice input đều thất bại 100% khi `qa=[]`, đề xuất ẩn hoàn toàn Micro và ô gõ chữ. | **Nhận định sai lầm.** `intent.ts` và `QaScreen.tsx` xử lý các lệnh điều hướng giọng nói (`listen`, `replay`, `stop`, `next`, `plan`, `open-qr`, `open-gps`) hoàn toàn độc lập với Q&A. Ẩn mic sẽ phá hủy tính năng điều khiển rảnh tay. Đã sửa thành: Giữ mic, đổi nhãn sang "Điều khiển bằng giọng nói", chỉ ẩn chip gợi ý rỗng. | **SẴN SÀNG TRIỂN KHAI (Scope NK-UI-03 đã sửa)** |
| **AUD-STY-002** | **CONFIRMED_BY_SOURCE** | Phân mảnh 3 kiểu nút audio trên Home, AlleyStoryCard và Qa; thiếu thời lượng `mm:ss` trên Home. | Xác nhận chính xác qua mã nguồn. Tách thành **UI-04A** (đồng bộ icon, nhãn, thời lượng hiển thị) sẵn sàng làm; hoãn **UI-04B** (tua âm thanh, mini-player toàn app) do rủi ro lifecycle. | **SẴN SÀNG TRIỂN KHAI (Scope NK-UI-04A)** |
| **AUD-STY-003** | **CONFIRMED_BY_SOURCE** | Văn bản Three Lenses dài 1380-1776 ký tự gây ngợp chữ. | Xác nhận độ dài văn bản. Tuy nhiên QaScreen đã có cơ chế phân tách 5 companion chapters. Các đề xuất Drop cap / Pull quote / Immersive reading là tính năng nâng cao, tách khỏi đợt này. | **HOÃN (DEFERRED)** |
| **AUD-IMG-001** | **CONFIRMED_BY_SOURCE** | Tái sử dụng ảnh Tống Duy Tân cho Ngõ Gạch, ảnh Cấm Chỉ cho Ngõ Trung Yên; thiếu mapping ảnh cho 3 ngõ cuối. | Xác nhận chính xác. Đã đính chính số liệu: `trung-yen-pho-vui` và `trung-yen-mien-tron-muc` là legacy entries không active; tổng số node thiếu ảnh riêng thực tế là **9/17**, không phải 7/17. | **SẴN SÀNG TRIỂN KHAI (Scope NK-UI-05A/05B)** |
| **AUD-IMG-002** | **CONFIRMED_BY_SOURCE** | 4 điểm dừng ghi nguồn `Google Maps contributor`. | Xác nhận sự tồn tại của 4 chuỗi và tệp ảnh trong repo. Tuy nhiên không được tùy tiện xóa chuỗi provenance để "qua mặt" kiểm thử. Cần lập ledger thẩm định quyền (NK-007) trước khi thay thế renderer. | **SẴN SÀNG LÀM TÀI LIỆU (Scope NK-UI-05A)** |
| **AUD-IMG-003** | **NEEDS_NATIVE_VERIFICATION** | Tệp PNG nặng 8.2MB (Tạm Thương 4.1MB, Trung Yên 2.7MB), đưa ra kết luận gây giật lag / OOM. | Dung lượng byte là có thật. Tuy nhiên kết luận giật lag / OOM / <50ms chưa được đo lường thực tế trên thiết bị. Việc nén ảnh tách thành task tài sản riêng sau khi có bằng chứng hiệu năng native. | **HOÃN ĐO LƯỜNG NATIVE (Scope NK-UI-05C)** |
| **AUD-MOB-001** | **NEEDS_NATIVE_VERIFICATION** | Cảnh báo chèn lấn giao diện khi `fontScale > 1.3x` trên màn hình Home. | Kiểm tra mã nguồn cho thấy: Khi `fontScale > 1.3`, `HomeScreen.tsx:431` **tự động chuyển sang danh sách hỗ trợ tiếp cận `AlleyTrailView`**, không tiếp tục vẽ bản đồ spline. Bác bỏ đề xuất áp trần `fontScale = 1.6` toàn ứng dụng. | **THEO DÕI NATIVE (Không đổi code)** |
| **AUD-MOB-002** | **INACCURATE** | Cho rằng chip lọc trong `AlleySelectScreen` chỉ cao ~32pt, không đạt chuẩn tối thiểu 44pt. | **Nhận định sai lầm.** `AlleySelectScreen.tsx:597` đã khai báo rõ ràng `minHeight: 48` và `justifyContent: 'center'`. Bác bỏ đề xuất thêm hitSlop chồng lấn. | **BÁC BỎ ĐỀ XUẤT SỬA** |
| **AUD-MOB-003** | **INACCURATE** | Cho rằng nút đóng Sổ tay (`✕`) có độ tương phản 3.8:1 không đạt chuẩn WCAG AA. | **Nhận định sai lầm.** Màu chữ `#4A3B32` trên nền `#F5ECE0` đạt độ tương phản **9.15:1** (vượt xa chuẩn 4.5:1). Điểm thực sự có tương phản thấp là chữ mô tả công cụ `toolGridDesc` (`#8C7D70` trên `#F7F2E7` đạt 3.56:1). Đã sửa đúng đối tượng trong Spec v1.1. | **ĐÃ HIỆU CHỈNH ĐỐI TƯỢNG (Scope NK-UI-01A)** |
| **AUD-PRD-001** | **CONFIRMED_BY_TEST** | Chọn chủ đề "Ăn thực" tại Ngõ Tạm Thương, Cấm Chỉ, Phất Lộc trả về kết quả rỗng dù ngõ định vị ẩm thực. | Xác nhận qua probe thực tế. Tuy nhiên PlanScreen đã có nút "Đổi lựa chọn" nên không phải "dead-end". Sửa thành: Cung cấp giải thích ngữ cảnh trung thực và nút chuyển đổi chủ đề sang "Chuyện xưa" khi người dùng chủ động bấm. | **SẴN SÀNG TRIỂN KHAI (Scope NK-UI-06A)** |
| **AUD-PRD-002** | **CONFIRMED_BY_SOURCE** | Lệch ID giữa `photoMap.ts` (`phat-loc`, `tam-thuong`) và `collections.ts` (`ngo-phat-loc`, `ngo-tam-thuong`). | Xác nhận sự tồn tại của mock cũ. Tuy nhiên `HomeScreen` hiện đã ưu tiên đọc từ `collections.ts` registry. Tách việc viết adapter chuẩn hóa ID thành scope riêng (06B) không chặn 06A. | **SẴN SÀNG TRIỂN KHAI (Scope NK-UI-06A)** |
| **AUD-PRD-003** | **CONFIRMED_BY_SOURCE** | 10/17 điểm dừng mới thiếu tọa độ GPS (null coordinates). | Xác nhận dữ liệu thực địa chưa hoàn tất. Tuy nhiên `LocationScreen` luôn có danh sách chọn điểm thủ công, không bị tê liệt hoàn toàn. | **THEO DÕI NATIVE (Thuộc scope NK-016)** |

---

## 2. QUYẾT ĐỊNH THIẾT KẾ: ACCEPTED, REJECTED & DEFERRED

```
┌────────────────────────────────────────────────────────────────────────┐
│               PHÂN LOẠI CÁC KHUYẾN NGHỊ THIẾT KẾ V1.1                  │
├──────────────────────────┬───────────────────────┬─────────────────────┤
│ ACCEPTED (Chấp thuận)    │ REJECTED (Bác bỏ)     │ DEFERRED (Hoãn lại) │
├──────────────────────────┼───────────────────────┼─────────────────────┤
│ • Additive tokens        │ • Ẩn Micro/Gõ khi     │ • Tua âm thanh /    │
│   (không xóa token cũ)   │   qa=[] (phá voice    │   Interactive seek  │
│ • Sơ đồ ngõ động         │   commands)           │ • Mini-player nổi   │
│   (bảo toàn node.id)     │ • Sửa kích thước chip │   toàn ứng dụng     │
│ • Story-First mode       │   lọc (đã có minH 48) │ • Gộp ScreenHeader  │
│   (giữ voice commands)   │ • Sửa tương phản nút  │   dùng chung        │
│ • Đồng bộ hóa icon &     │   đóng Sổ tay (đã     │ • Nén tệp ảnh bìa   │
│   thời lượng âm thanh    │   đạt 9.15:1)         │   (cần đo native)   │
│ • Visual Resolver &      │ • Áp trần fontScale   │ • Drop cap /        │
│   Thẻ Ký Họa Di Sản sạch │   1.6x toàn ứng dụng  │   Immersive reading │
│ • Phục hồi ngữ cảnh      │ • Gán tag 'an thuc'   │ • Tự động chuyển    │
│   PlanScreen trung thực  │   giả vào di tích     │   chủ đề ngầm       │
└──────────────────────────┴───────────────────────┴─────────────────────┘
```

---

## 3. PHẠM VI CHI TIẾT CỦA CÁC TICKETS DÀNH CHO CODEX LUNA

Toàn bộ các tickets dưới đây được xây dựng tuân thủ nghiêm ngặt nguyên tắc: **Một người viết (single writer) trên mỗi tệp tin dùng chung**; bảo toàn toàn bộ 405 tests hiện có; không vi phạm logic Phase 1A và Phase 1B.

---

### [TICKET NK-UI-01A]: Additive Semantic Tokens & Designated Surfaces
- **Mục tiêu:** Bổ sung các biến màu ngữ nghĩa mới vào `theme.ts` mà không làm thay đổi giá trị của bất kỳ token cũ nào; chuyển đổi màu sắc cục bộ tại 3 màn hình/modal được chỉ định để khởi tạo hệ thống Bề mặt Kép (Dual-Surface).
- **Trạng thái:** `READY_FOR_TECHNICAL_REVIEW` (Sẵn sàng trình duyệt triển khai).
- **Phạm vi tệp sở hữu (Allowlist):**
  - Sửa: `mobile/src/theme.ts`
  - Sửa: `mobile/src/screens/AlleySelectScreen.tsx`
  - Sửa: `mobile/src/components/AlleyPassportModal.tsx`
  - Sửa: `mobile/src/components/NotebookDrawerModal.tsx` (chỉ sửa màu `toolGridDesc` tại dòng 309 sang `colors.toolCardDesc`).
  - Tạo mới test: `mobile/tests/themeTokens.test.mjs` (kiểm tra tính tương thích của public tokens và độ tương phản của các cặp màu mới).
- **Những điều tuyệt đối cấm (Forbidden):**
  - Không xóa các key cũ: `colors.muted`, `typography.label`.
  - Không đổi kích thước font của `typography.titleLarge` (phải giữ 32pt).
  - Không áp dụng lệnh cấm mã màu hex (blanket ban) lên toàn bộ repository.
  - Không tạo component `ScreenHeader` mới trong ticket này.
- **Tiêu chuẩn kiểm thử:**
  - `npm test --prefix mobile` đạt 405/405 tests pass.
  - `npm run lint --prefix mobile` và `npm run typecheck --prefix mobile` đạt 100%.

---

### [TICKET NK-UI-02]: Schematic Trail Fallback Bảo Toàn Định Danh Node
- **Mục tiêu:** Khắc phục khoảng trống 77% màn hình trên bản đồ của các ngõ ít điểm dừng (`ngo-tam-thuong`, `ngo-phat-loc`, `ngo-cam-chi`) bằng thuật toán phân bổ tỷ lệ động dọc trục Y (15% đến 85%), bảo toàn tuyệt đối `node.id` thực tế.
- **Trạng thái:** `READY_FOR_TECHNICAL_REVIEW`.
- **Phạm vi tệp sở hữu:**
  - Sửa: `mobile/src/utils/alleyGeometry.ts` (thêm hàm `computeSchematicTrailLayout`).
  - Sửa: `mobile/src/screens/HomeScreen.tsx` (thay thế khối tính toán fallback tại dòng 237-251).
  - Tạo mới test: `mobile/tests/alleyGeometry.test.mjs`.
- **Hợp đồng kỹ thuật (Contract Enforcement):**
  - Hàm nhận `nodes: readonly { id: string }[]`.
  - Output `pins` phải mang chính `node.id` thực tế để khớp với câu lệnh `nodes.find((item) => item.id === pinMeta.id)` tại `HomeScreen.tsx:491`.
  - `n = 0` $\rightarrow$ trả về mảng rỗng.
  - `n = 1` $\rightarrow$ pin nằm chính giữa màn hình (Y = 50%).
  - `n >= 2` $\rightarrow$ phân bổ đều trục Y từ 15% đến 85%, so le trái/phải.
  - Bộ sưu tập cũ `fiction-letter` tiếp tục dùng nguyên vẹn `PIN_CONFIG` tĩnh 6 điểm hiện có.
- **Tiêu chuẩn kiểm thử:**
  - Test unit mới xác nhận với 2 điểm dừng (Tạm Thương, Phất Lộc), khoảng cách Y giữa 2 pin giãn đều tối thiểu 65% chiều cao canvas.
  - Chạm vào pin trên bản đồ vẫn kích hoạt đúng trạm và mở đúng câu chuyện.

---

### [TICKET NK-UI-03]: Adaptive Story Mode cho QaScreen (Bảo toàn Voice Commands)
- **Mục tiêu:** Tối ưu hóa giao diện `QaScreen` khi điểm dừng không có Q&A (`qa=[]`), ẩn danh sách câu hỏi gợi ý rỗng nhưng bảo toàn 100% khả năng ra lệnh bằng giọng nói và gõ phím.
- **Trạng thái:** `READY_FOR_TECHNICAL_REVIEW` (Đã sửa đổi toàn diện so với v1.0).
- **Phạm vi tệp sở hữu:**
  - Sửa: `mobile/src/screens/QaScreen.tsx`
  - Sửa: `mobile/src/components/VoiceInteractionDock.tsx`
  - Sửa: `mobile/src/components/ExpandableInputDrawer.tsx`
  - Sửa: `mobile/src/i18n/translator.ts` (bổ sung key thông điệp điều khiển giọng nói).
  - Tạo mới test: `mobile/tests/qaStoryMode.test.mjs`.
- **Hành vi bắt buộc (Behavior Requirements):**
  - Khi `nodeQa.length === 0`:
    - Ẩn hoàn toàn khối JSX danh sách câu hỏi gợi ý (không hiển thị khung trống).
    - Giữ nguyên nút Micro và nút Gõ phím trên Bottom Dock.
    - Nhãn dock hiển thị: *"Điều khiển bằng giọng nói"* / *"Voice controls"*.
    - Hỗ trợ đầy đủ các lệnh: `listen`, `replay`, `stop`, `next`, `plan`, `open-qr`, `open-gps`.
    - Khi người dùng hỏi câu hỏi nội dung mà điểm dừng chưa có dữ liệu, hiển thị thẻ thông báo nhẹ nhàng hướng dẫn ra lệnh điều hướng.
  - Khi `nodeQa.length > 0`: Giữ nguyên 100% giao diện và hành vi Q&A cũ.
- **Tiêu chuẩn kiểm thử:**
  - Suite kiểm thử 17 node mới tiếp tục pass toàn bộ; không làm mất tính năng ra lệnh giọng nói; các test Phase 1B (NK-004) tiếp tục đạt.

---

### [TICKET NK-UI-04A]: Chuẩn hóa Giao diện Bộ công cụ Âm thanh (Presentation Only)
- **Mục tiêu:** Thống nhất hình thức hiển thị trạng thái phát âm thanh trên `HomeScreen` và `AlleyStoryCard` bằng component chuẩn; hiển thị thời lượng thực tế `mm:ss`.
- **Trạng thái:** `READY_FOR_TECHNICAL_REVIEW`.
- **Phạm vi tệp sở hữu:**
  - Tạo mới: `mobile/src/components/CompactAudioPlayer.tsx`.
  - Sửa: `mobile/src/screens/HomeScreen.tsx` (thay thế nút `introPlayBtn` bằng `CompactAudioPlayer`).
  - Sửa: `mobile/src/components/AlleyStoryCard.tsx` (thay thế nút emoji `▶`/`⏸` bằng `CompactAudioPlayer`).
  - Sửa: `mobile/src/components/VoicePlayerBar.tsx` (chuẩn hóa hiển thị thời lượng và a11y labels).
  - Tạo mới test: `mobile/tests/voicePlayerBar.test.mjs`.
- **Phạm vi hoãn lại (UI-04B - BLOCKED):**
  - Tính năng chạm tua thanh tiến độ (seek/scrub) và mini-player toàn app bị khóa lại, không triển khai trong đợt này.
- **Tiêu chuẩn kiểm thử:**
  - Không tạo ra player hook mới trong modal; tái sử dụng đúng `introPlayer` hiện có của HomeScreen.
  - Tuân thủ nghiêm ngặt quy tắc Phase 1B (NK-003): Blur màn hình hoặc unmount phải dừng âm thanh tức thì, không tự động phát tiếp khi quay lại.

---

### [TICKET NK-UI-05A/05B]: Quản lý Bản quyền Hình ảnh & Thẻ Ký Họa Di Sản
- **Mục tiêu:** 
  - **05A (Tài liệu):** Lập bảng kiểm kê quyền tác giả cho 17 điểm dừng mới, bảo toàn nguyên vẹn 4 ghi nhận Google Maps và 9 điểm dừng thiếu ảnh riêng trong repository.
  - **05B (Giao diện):** Xây dựng component `HeritageSketchPlaceholder.tsx` hiển thị ký họa sạch sẽ cho các điểm chưa có ảnh thực địa, thay thế cho việc âm thầm hiển thị ảnh ngõ chung chung (`HERO_PHOTO`).
- **Trạng thái:** `05A READY_FOR_TECHNICAL_REVIEW`; `05B BLOCKED` (Chờ người dùng duyệt danh mục quyền và component ký họa).
- **Phạm vi tệp sở hữu:**
  - Tài liệu 05A: `docs/content/NGO_KE_NODE_VISUAL_RIGHTS_LEDGER.md` (mới).
  - Giao diện 05B: `mobile/src/assets/nodeVisual.ts` (mới), `mobile/src/components/HeritageSketchPlaceholder.tsx` (mới), `mobile/src/assets/photoMap.ts`.
  - Các màn hình tích hợp 05B: `HomeScreen.tsx`, `QaScreen.tsx`, `PostcardCard.tsx`, `CameraScreen.tsx`, `LocationScreen.tsx`.
- **Tiêu chuẩn kiểm thử:**
  - Tuyệt đối không xóa chuỗi provenance `Google Maps contributor` để vượt qua kiểm tra văn bản.
  - Toàn bộ 9 điểm dừng thiếu ảnh riêng hiển thị thẻ ký họa trang nhã kèm thông điệp trung thực: *"📍 Đang cập nhật tư liệu ảnh thực địa"*.

---

### [TICKET NK-UI-06A]: Phục hồi Ngữ cảnh Thông minh trong PlanScreen
- **Mục tiêu:** Loại bỏ sự bối rối của người dùng khi chọn chủ đề "Ăn thực" tại 3 ngõ thiếu tag ẩm thực (`ngo-tam-thuong`, `ngo-cam-chi`, `ngo-phat-loc`) bằng thông điệp giải thích trung thực và nút chuyển đổi chủ đề sang "Chuyện xưa".
- **Trạng thái:** `READY_FOR_TECHNICAL_REVIEW`.
- **Phạm vi tệp sở hữu:**
  - Sửa: `mobile/src/screens/PlanScreen.tsx`
  - Sửa: `mobile/src/i18n/translator.ts` (thêm bản dịch ngữ cảnh).
  - Tạo mới test: `mobile/tests/planScreenExperience.test.mjs`.
- **Quy tắc bảo toàn dữ liệu:**
  - Tuyệt đối không tự ý gán tag `'an thuc'` vào di tích lịch sử để ép thuật toán ra kết quả.
  - Chỉ cập nhật `draft.topic = 'chuyen xua'` khi người dùng bấm trực tiếp vào nút gợi ý, không tự động chuyển ngầm.
  - Giữ nguyên thời lượng `budgetMinutes` đã chọn khi chuyển đổi.
- **Tiêu chuẩn kiểm thử:**
  - Test unit mới xác nhận tại 3 ngõ ẩm thực, khi chọn "Ăn thực", màn hình hiển thị lời giải thích rõ ràng và nút bấm chuyển sang chủ đề khả dụng.

---

## 4. THỨ TỰ VÀ QUY TẮC TRIỂN KHAI CHO CODEX LUNA (EXECUTION ORDER)

Để ngăn ngừa tối đa tình trạng xung đột mã nguồn (merge conflict) trên các tệp tin dùng chung (`HomeScreen.tsx`, `QaScreen.tsx`, `theme.ts`), đề xuất thứ tự thực hiện tuần tự như sau:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   LỘ TRÌNH TRIỂN KHAI ĐỀ XUẤT (LUNA)                   │
├────────────────────────────────────────────────────────────────────────┤
│ BƯỚC 1: TICKET NK-UI-01A (Nền tảng Token)                              │
│ • Bổ sung tokens mới vào `theme.ts` & cập nhật AlleySelect, Passport.  │
│ • Chạy kiểm thử: `npm test --prefix mobile` (Đảm bảo 405/405 pass).    │
├────────────────────────────────────────────────────────────────────────┤
│ BƯỚC 2: TICKET NK-UI-02 (Sơ đồ Ngõ Động)                              │
│ • Viết hàm `computeSchematicTrailLayout` & tích hợp vào `HomeScreen`.   │
│ • Chạy kiểm thử: `node --test mobile/tests/alleyGeometry.test.mjs`.    │
├────────────────────────────────────────────────────────────────────────┤
│ BƯỚC 3: TICKET NK-UI-06A (Phục hồi Ngữ cảnh PlanScreen)                │
│ • Cập nhật thông điệp ngữ cảnh và nút gợi ý trong `PlanScreen.tsx`.    │
│ • Chạy kiểm thử: `node --test mobile/tests/planScreenExperience.test.mjs`│
├────────────────────────────────────────────────────────────────────────┤
│ BƯỚC 4: TICKET NK-UI-04A (Đồng bộ Bộ công cụ Âm thanh)                │
│ • Tạo `CompactAudioPlayer` & tích hợp vào `HomeScreen`, `AlleyStory`.  │
│ • Chạy kiểm thử: `node --test mobile/tests/voicePlayerBar.test.mjs`.   │
├────────────────────────────────────────────────────────────────────────┤
│ BƯỚC 5: TICKET NK-UI-03 (Adaptive Story Mode trong QaScreen)          │
│ • Ẩn gợi ý rỗng, giữ nguyên mic/lệnh điều hướng trong `QaScreen.tsx`.  │
│ • Chạy kiểm thử: `node --test mobile/tests/qaStoryMode.test.mjs`.      │
├────────────────────────────────────────────────────────────────────────┤
│ BƯỚC 6: TICKET NK-UI-05A / 05B (Tài liệu Quyền ảnh & Thẻ Ký Họa)       │
│ • Lập ledger quyền ảnh 05A; triển khai Thẻ Ký Họa Di Sản 05B sau duyệt.│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. DANH MỤC KIỂM TRA TRÊN THIẾT BỊ VẬT LÝ (NATIVE QA CHECKLIST)

Các kỹ sư QA và kiểm thử viên cần thực hiện kiểm tra trực tiếp trên điện thoại thật (Android và iPhone) trước khi nghiệm thu:
- [ ] **Khả năng đọc dưới ánh nắng mặt trời:** Chữ mực xám `#2E3028` trên nền giấy `#F7F2E8` có rõ nét khi đứng trong ngõ phố ngoài trời không?
- [ ] **Bố cục sơ đồ ngõ 2 điểm dừng:** Mở Ngõ Tạm Thương và Ngõ Phất Lộc trên điện thoại màn hình nhỏ (chiều rộng 360dp) và màn hình lớn, 2 điểm dừng có phân bố cân đối, đẹp mắt không?
- [ ] **Ra lệnh giọng nói tại ngõ mới:** Đứng tại điểm 1 Ngõ Gạch hoặc Ngõ Trung Yên, bấm Micro và nói *"nghe lại"*, *"điểm tiếp theo"*, *"dừng lại"*, ứng dụng có thực thi chính xác không?
- [ ] **Không che khuất bởi bàn phím ảo:** Mở ô gõ lệnh trong `QaScreen`, bàn phím trượt lên có che mất nội dung câu chuyện đang đọc hay không?
- [ ] **Vùng an toàn (Safe Areas):** Mở `AlleyPassportModal` và `NotebookDrawerModal` trên iPhone có Dynamic Island và điện thoại Android có thanh điều hướng 3 nút, các nút đóng và nội dung có bị chèn lấn mép màn hình không?

---

*Tài liệu bàn giao kỹ thuật V1.1 kết thúc tại đây. Toàn bộ thiết kế đã đạt trạng thái sẵn sàng để Lead và Người dùng phê duyệt mở các ticket độc lập.*
