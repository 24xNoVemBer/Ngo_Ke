# Ngõ Kể — UI Wave 1 Remediation Backlog

**Ngày lập:** 2026-10-23  
**Tác nhân lập:** Antigravity (Senior Mobile UX/UI QA Lead)  
**Tài liệu mẹ:** [NGO_KE_UI_WAVE1_VISUAL_QA.md](file:///d:/ngo_ke/docs/design/NGO_KE_UI_WAVE1_VISUAL_QA.md)  
**Mục đích:** Đặc tả các hạng mục khắc phục, tinh chỉnh trực quan và kiểm chứng thiết bị sau đợt triển khai UI Wave 1.  

---

## 1. Nguyên tắc Xử lý Backlog

1. **Bảo toàn ranh giới:** Không mở rộng scope để triển khai sớm các tính năng của UI Wave 2 (Audio Player, Voice Dock, Image Resolver).
2. **Tuân thủ quy tắc Single-writer:** Các file mã nguồn dùng chung (`HomeScreen.tsx`, `theme.ts`, `translator.ts`) phải được giao cho đúng một worker trong từng đợt thực thi.
3. **Phân định rõ mức độ ưu tiên:** Chỉ các lỗi làm hỏng tương tác hoặc hiển thị sai nghiêm trọng mới xếp mức `FIX_NOW`. Các cải tiến nhỏ về code style được gom hoặc hoãn phù hợp.

---

## 2. Danh mục Remediation Tickets

### Ticket 1: NK-UI-W1-FIX-01 — Giới hạn động độ rộng nhãn trạm bên trái trên HomeScreen

- **Ticket ID:** `NK-UI-W1-FIX-01`
- **Ticket gốc liên quan:** `NK-UI-02` (Schematic Alley Trail Layout)
- **Phân loại xử lý:** `FIX_NOW` (hoặc xử lý ngay đầu Wave 2 khi chạm `HomeScreen.tsx`)
- **Phân loại bằng chứng:** `SOURCE_VERIFIED`
- **Vấn đề:** Trên màn hình hẹp có chiều rộng 320pt (như iPhone SE 1st gen, màn hình Android cỡ nhỏ), nhãn trạm trỏ sang trái (`pinMeta.side === 'left'`) có thể tràn qua mép trái màn hình 14.2pt do sử dụng độ rộng cố định `width: 130` mà không có giới hạn động theo tọa độ trạm.
- **Hiện trạng mã nguồn:**
  Tại [`mobile/src/screens/HomeScreen.tsx:580–585`](file:///d:/ngo_ke/mobile/src/screens/HomeScreen.tsx#L580-L585):
  ```tsx
  style={[
    styles.labelLeftContainer, // width: 130 cố định
    {
      right: canvasWidth - px + 25,
      top: py - 18,
    },
  ]}
  ```
  Khi $canvasWidth = 320$, $px = 320 \times 0.44 = 140.8$. Mép phải nhãn $= 140.8 - 25 = 115.8$. Với $width = 130$, mép trái $= 115.8 - 130 = -14.2\text{ pt}$ (tràn lề trái).
- **Hành vi kỳ vọng:**
  Độ rộng của nhãn trái phải được giới hạn động để không bao giờ vượt qua mép trái màn hình (đảm bảo cách mép trái tối thiểu 10pt):
  $$width = \min(130, px - 35)$$
  hoặc gán trực tiếp `maxWidth: Math.max(80, px - 35)`.
- **Mức độ nghiêm trọng:** **P2** (Responsive layout consistency).
- **Nguyên nhân gốc:** Khi viết code cho `labelRightContainer`, lập trình viên đã thêm inline override `width: canvasWidth - px - 40` (dòng 560), nhưng lại bỏ quên việc thêm override tương ứng cho `labelLeftContainer`.
- **File đề xuất:** [`mobile/src/screens/HomeScreen.tsx`](file:///d:/ngo_ke/mobile/src/screens/HomeScreen.tsx)
- **Ranh giới scope:** Chỉ sửa inline style của `labelLeftContainer` trong vòng lặp render pins. Tuyệt đối không thay đổi tọa độ pin, spline, hay touch target.
- **Tiêu chí nghiệm thu (Acceptance Criteria):**
  1. Với `canvasWidth = 320` và `px = 140.8`, mép trái của nhãn trạm bên trái nằm hoàn toàn trong màn hình ($\ge 10\text{ pt}$).
  2. Với `canvasWidth \ge 360`, nhãn vẫn giữ độ rộng tối đa 130pt như thiết kế ban đầu.
  3. Tiêu đề và tên trạm bên trong nhãn tự động xuống dòng gọn gàng, không bị cắt cụt chữ.
- **Ca kiểm thử hồi quy (Regression Cases):**
  - Kiểm tra 8 collections trên các độ rộng 320, 360, 375, 430.
  - Kiểm tra nhánh polyline (`ngo-gach`, `ngo-trung-yen`) và nhánh fiction (`fiction-letter`).
- **Phụ thuộc Native QA:** Xác minh trực quan trên máy ảo hoặc thiết bị có độ rộng 320dp / 375dp.
- **Worker đề xuất:** Codex Luna.

---

### Ticket 2: NK-UI-W1-FIX-02 — Chuẩn hóa Translation Key cho nút "Đổi lựa chọn" trong PlanScreen

- **Ticket ID:** `NK-UI-W1-FIX-02`
- **Ticket gốc liên quan:** `NK-UI-06A` (Plan Screen Contextual Recovery)
- **Phân loại xử lý:** `FIX_NOW`
- **Phân loại bằng chứng:** `SOURCE_VERIFIED`
- **Vấn đề:** Nút "Đổi lựa chọn" trong phần kết quả rỗng đang sử dụng chuỗi tam nguyên inline `{locale === 'en' ? 'Change selection' : 'Đổi lựa chọn'}` thay vì gọi hàm `t()` từ từ điển dịch thuật tập trung.
- **Hiện trạng mã nguồn:**
  Tại [`mobile/src/screens/PlanScreen.tsx:380`](file:///d:/ngo_ke/mobile/src/screens/PlanScreen.tsx#L380):
  ```tsx
  <Text style={styles.secondaryText}>{locale === 'en' ? 'Change selection' : 'Đổi lựa chọn'}</Text>
  ```
- **Hành vi kỳ vọng:**
  Đưa chuỗi vào `translator.ts` với key `plan.empty.change_selection`:
  - VI: `'Đổi lựa chọn'`
  - EN: `'Change selection'`
  Tại `PlanScreen.tsx`: gọi `<Text style={styles.secondaryText}>{t('plan.empty.change_selection')}</Text>`.
- **Mức độ nghiêm trọng:** **P3** (Code hygiene & i18n architectural consistency).
- **Nguyên nhân gốc:** Sơ suất nhỏ trong quá trình hoàn thiện các translation keys cho NK-UI-06A.
- **File đề xuất:**
  - [`mobile/src/i18n/translator.ts`](file:///d:/ngo_ke/mobile/src/i18n/translator.ts)
  - [`mobile/src/screens/PlanScreen.tsx`](file:///d:/ngo_ke/mobile/src/screens/PlanScreen.tsx)
- **Ranh giới scope:** Chỉ thêm key dịch thuật và thay thế chuỗi tại dòng 380. Không sửa logic `onDraftChange` hay state của `PlanScreen`.
- **Tiêu chí nghiệm thu (Acceptance Criteria):**
  1. `translator.ts` có đầy đủ key `plan.empty.change_selection` trong kiểu `TranslationKey` và hai từ điển `vi`, `en`.
  2. `PlanScreen.tsx` gọi `t('plan.empty.change_selection')`.
  3. Chạy `npm test` pass toàn bộ các bài test liên quan (`planScreenExperience.test.mjs`, `recommendation.test.mjs`).
- **Ca kiểm thử hồi quy:** Chuyển đổi ngôn ngữ VI $\leftrightarrow$ EN trên màn hình Kế hoạch, nút hiển thị chính xác tương ứng.
- **Phụ thuộc Native QA:** Không.
- **Worker đề xuất:** Codex Luna.

---

### Ticket 3: NK-UI-W1-FIX-03 — Bổ sung Safe Area Insets cho đáy Modal Sổ tay và Hộ chiếu

- **Ticket ID:** `NK-UI-W1-FIX-03`
- **Ticket gốc liên quan:** `NK-UI-01A` (Design Tokens & Dual-Surface Migration)
- **Phân loại xử lý:** `NEEDS_NATIVE_CONFIRMATION`
- **Phân loại bằng chứng:** `NEEDS_NATIVE_CONFIRMATION` (Source identified risk)
- **Vấn đề:** `AlleyPassportModal` và `NotebookDrawerModal` đều dùng `paddingBottom: 24` cố định cho sheet trượt từ dưới lên (`journalDrawerSheet`), không tích hợp khoảng đệm an toàn từ `useSafeAreaInsets()`. Trên các dòng máy iOS có Home Indicator (inset đáy 34pt), phần đáy nội dung có thể nằm sát hoặc bị thanh điều hướng che một phần khi cuộn hết trang.
- **Hiện trạng mã nguồn:**
  - `AlleyPassportModal.tsx:120`: `paddingBottom: 24`
  - `NotebookDrawerModal.tsx:227`: `paddingBottom: 24`
- **Hành vi kỳ vọng:**
  Sử dụng `useSafeAreaInsets()` từ `react-native-safe-area-context`:
  `paddingBottom: Math.max(24, insets.bottom + spacing.sm)` để đảm bảo luôn có khoảng cách an toàn tối thiểu với thanh Home Indicator trên iOS.
- **Mức độ nghiêm trọng:** **P2** (Native iOS interaction polish).
- **File đề xuất:**
  - [`mobile/src/components/AlleyPassportModal.tsx`](file:///d:/ngo_ke/mobile/src/components/AlleyPassportModal.tsx)
  - [`mobile/src/components/NotebookDrawerModal.tsx`](file:///d:/ngo_ke/mobile/src/components/NotebookDrawerModal.tsx)
- **Ranh giới scope:** Chỉ điều chỉnh đệm đáy của sheet. Không thay đổi cấu trúc cuộn, danh sách trạm, hay header.
- **Tiêu chí nghiệm thu:**
  1. Khi mở modal trên iPhone có Home Indicator, mục cuối cùng cuộn cách thanh Home Indicator ít nhất 12pt.
  2. Trên thiết bị Android không có tai thỏ/thanh cử chỉ đáy, đệm đáy vẫn giữ 24pt chuẩn.
- **Ca kiểm thử hồi quy:** Mở và đóng modal, cuộn hết danh sách, kiểm tra không bị giật layout.
- **Phụ thuộc Native QA:** Bắt buộc kiểm tra trên thiết bị iOS thật hoặc iOS Simulator.
- **Worker đề xuất:** Codex Luna (thực hiện sau khi có bằng chứng từ thiết bị iOS).

---

### Ticket 4: NK-UI-W1-FIX-04 — Thay thế các giá trị Hex còn sót lại trong HomeScreen bằng Token ngữ nghĩa

- **Ticket ID:** `NK-UI-W1-FIX-04`
- **Ticket gốc liên quan:** `NK-UI-01A` (Design Tokens)
- **Phân loại xử lý:** `DEFER_TO_WAVE2`
- **Phân loại bằng chứng:** `DESIGN_PREFERENCE` / Scope Boundary Conformance
- **Vấn đề:** Các thuộc tính hiển thị tại `HomeScreen.tsx` như nút nghe intro (`#F2C56B`, `#24392E`), vòng hào quang thở trạm (`rgba(229,168,66,0.40)`), và vòng tròn trạm đang chọn (`#C26747`) vẫn đang dùng mã hex tự do thay vì các token ngữ nghĩa mới được bổ sung tại `theme.ts` (`colors.amberAction`, `colors.amberGlow`, `colors.terracotta`).
- **Lý do hoãn:** Trong Wave 1, `HomeScreen.tsx` chỉ thuộc allowlist của ticket `NK-UI-02` (xử lý layout schematic). Việc người làm trước không tiện tay sửa đổi màu sắc ở màn hình này là hoàn toàn đúng nguyên tắc tuân thủ ranh giới ticket (không sửa style khi scope là layout).
- **Thời điểm thực hiện đề xuất:** Gộp vào **UI Wave 2** (khi đụng vào `HomeScreen.tsx` trong ticket `NK-UI-04A` - Audio Presentation).
- **Mức độ nghiêm trọng:** **P3** (Design system consistency).
- **Worker đề xuất:** Codex Luna.

---

## 3. Tổng hợp Bảng Phân loại Xử lý

| Ticket ID | Tên hạng mục | Mức độ nghiêm trọng | Phân loại xử lý | File tác động | Đề xuất triển khai |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **`NK-UI-W1-FIX-01`** | Giới hạn động độ rộng nhãn trái HomeScreen | **P2** | `FIX_NOW` | `HomeScreen.tsx` | Có thể fix ngay hoặc fix ở đầu Wave 2 |
| **`NK-UI-W1-FIX-02`** | Translation Key nút Đổi lựa chọn PlanScreen | **P3** | `FIX_NOW` | `PlanScreen.tsx`, `translator.ts` | Fix ngay (rất nhanh và an toàn) |
| **`NK-UI-W1-FIX-03`** | Safe Area Inset đáy modal Hộ chiếu & Sổ tay | **P2** | `NEEDS_NATIVE_CONFIRMATION` | `AlleyPassportModal.tsx`, `NotebookDrawerModal.tsx` | Chờ test trên iOS thật xác nhận |
| **`NK-UI-W1-FIX-04`** | Migrate hex tokens còn lại trong HomeScreen | **P3** | `DEFER_TO_WAVE2` | `HomeScreen.tsx` | Chuyển sang Wave 2 (NK-UI-04A) |

---

## 4. Kế hoạch Triển khai Đề xuất cho Codex Luna

Nếu Người dùng phê duyệt xử lý nhanh 2 ticket thuộc nhóm `FIX_NOW`, thứ tự thực hiện tuần tự như sau:

```
[Remediation Đợt 1 — Triển khai nhanh]
├── Bước 1: NK-UI-W1-FIX-02 (translator.ts, PlanScreen.tsx) ──> ~5 phút, 0 rủi ro
└── Bước 2: NK-UI-W1-FIX-01 (HomeScreen.tsx) ──> Giới hạn maxWidth nhãn trái

[Kiểm thử sau Remediation]
└── Chạy `npm test --prefix mobile` (Bảo đảm giữ vững 418/418 PASS)
```

---

## 5. Mục Bắt buộc: Việc cần anh quyết / Việc anh tự làm

### A. Việc cần anh quyết (User Decisions Required)

1. **Phê duyệt Kết luận Thẩm định (Verdict) của UI Wave 1:**
   - *Câu hỏi cụ thể:* Anh có đồng ý với kết luận **`READY_FOR_NATIVE_QA`** cho UI Wave 1 không?
   - *Lựa chọn đề xuất:* **Duyệt READY_FOR_NATIVE_QA**. Codebase ở trạng thái host hoàn toàn ổn định (418/418 tests pass, TypeScript và Linter sạch 100%), không có lỗi chặn (P0/P1).
   - *Hệ quả nếu chưa chốt:* Giữ nguyên trạng thái chờ duyệt.

2. **Quyết định về Remediation Backlog:**
   - *Lựa chọn 1 (Khuyến nghị):* Cho phép Codex Luna sửa nhanh **`NK-UI-W1-FIX-02`** (Translation key) và **`NK-UI-W1-FIX-01`** (Độ rộng nhãn trái) trước khi mở UI Wave 2. Việc này chỉ mất khoảng 10 phút và giải quyết triệt để rủi ro trên màn hình 320pt.
   - *Lựa chọn 2:* Bỏ qua remediation host, mở thẳng **UI Wave 2** (`NK-UI-03` Adaptive Story Mode và `NK-UI-04A` Compact Audio Player) và gộp việc sửa nhãn vào Wave 2 khi Luna đụng vào `HomeScreen.tsx`.

---

### B. Việc anh tự làm (User Manual Actions)

1. **Thực hiện kiểm thử thực tế trên thiết bị di động (Native Device Verification) `[ngoài plan]`:**
   - *Vì sao cần làm:* Môi trường dòng lệnh hiện tại không có Android Emulator hay máy Mac nối iOS (`adb` không có trong PATH). Chỉ có anh mới có thể mở ứng dụng trên điện thoại thật để:
     - Quan sát trực quan đường vẽ ngõ và độ nổi bật của các điểm trạm dưới ánh sáng ngoài trời.
     - Cảm nhận độ nhạy cảm ứng khi bấm vào các nút trạm nhỏ trên bản đồ.
     - Kiểm tra khoảng cách đáy của Modal Hộ chiếu và Sổ tay với thanh Home Indicator trên iPhone.
   - *Hậu quả nếu chưa làm:* Ứng dụng chỉ mới đạt chuẩn "Host-regression PASS", chưa có chứng chỉ nghiệm thu visual cuối cùng trên thiết bị người dùng.
