# Ngõ Kể — Quy chuẩn Thiết kế Thẻ Ký Họa Di Sản & Cơ chế Fallback Hình ảnh
## (Heritage Sketch Placeholder & Visual Fallback Specification — NK-UI-05B)

**Phiên bản:** 1.0 (Visual Design Preparation)  
**Ngày ban hành:** 2026-10-24  
**Tác nhân:** Antigravity (Senior Mobile UX/UI Designer)  
**Tài liệu tham chiếu:**
- Sổ cái bản quyền ảnh: [`docs/content/NGO_KE_NODE_VISUAL_RIGHTS_LEDGER.md`](file:///d:/ngo_ke/docs/content/NGO_KE_NODE_VISUAL_RIGHTS_LEDGER.md)
- Đặc tả thiết kế v1.1: [`docs/design/NGO_KE_UI_SPEC_V1_1.md`](file:///d:/ngo_ke/docs/design/NGO_KE_UI_SPEC_V1_1.md)
- Kế hoạch chuyển giao Wave 2: [`docs/design/NGO_KE_UI_WAVE2_SCOPE_HANDOFF.md`](file:///d:/ngo_ke/docs/design/NGO_KE_UI_WAVE2_SCOPE_HANDOFF.md)
- Bảng màu & tokens: [`mobile/src/theme.ts`](file:///d:/ngo_ke/mobile/src/theme.ts)

> [!IMPORTANT]
> **Trạng thái phê duyệt:** **DESIGN SPECIFICATION ONLY**  
> Tài liệu này chuẩn bị thiết kế hoàn chỉnh cho `NK-UI-05B`. Chưa có bất kỳ dòng mã nguồn nào được sửa đổi. Việc triển khai code thực tế chỉ được bắt đầu sau khi Người dùng phê duyệt tại Human Design Approval Gate.

---

## 1. Phân tích Hiện trạng Trải nghiệm Thị giác (Visual Experience Analysis)

### 1.1. Các vị trí Fallback âm thầm trong mã nguồn hiện tại
Hiện nay, toàn bộ 5 màn hình hiển thị ảnh trong ứng dụng đều sử dụng hàm `getNodePhoto()` tại [`mobile/src/assets/photoMap.ts`](file:///d:/ngo_ke/mobile/src/assets/photoMap.ts):
```ts
export function getNodePhoto(nodeId?: string, photoKey?: string, collectionId?: string): ImageSourcePropType {
  // ...
  if (nodeId && NODE_PHOTO_MAP[nodeId]) {
    return NODE_PHOTO_MAP[nodeId].source;
  }
  return HERO_PHOTO; // <-- FALLBACK ÂM THẦM VỀ ẢNH CỜ HOA PEXELS_DEMO_06
}
```
Và hàm `getNodePhotographer()`:
```ts
export function getNodePhotographer(nodeId?: string, ...): string {
  // ...
  if (nodeId && NODE_PHOTO_MAP[nodeId]) {
    return NODE_PHOTO_MAP[nodeId].photographer;
  }
  return 'HONG SON (Pexels)'; // <-- GÁN CREDIT TỰ ĐỘNG CHO HỒNG SƠN
}
```

### 1.2. Hậu quả gây mất đồng nhất giao diện và sai lệch thông tin
1. **Sai lệch di tích lịch sử nghiêm trọng:** Khi người dùng mở các điểm dừng di tích tâm linh quốc gia như **Đình Yên Thái** (Ngõ Tạm Thương), **Đền Tiên Hạ** (Ngõ Phất Lộc), **Đền Cấm Chỉ** (Ngõ Cấm Chỉ), màn hình hiển thị ảnh chụp một con ngõ cờ hoa chung chung (`pexels_demo_06.jpg`) và kèm dòng credit *"Ảnh: HONG SON (Pexels)"*. Điều này gây nhầm lẫn thị giác nghiêm trọng giữa di tích tín ngưỡng và ngõ phố thông thường.
2. **Trùng lặp nhàm chán (Visual Fatigue):** 9 trên tổng số 17 trạm mới đều hiển thị chung một bức ảnh `HERO_PHOTO`, khiến hành trình khám phá qua các ngõ phố bị mất đi tính đặc trưng riêng biệt của từng địa danh.
3. **Mâu thuẫn ảnh ẩm thực:** Điểm dừng Bún ngan Nhàn (Ngõ Trung Yên) đang hiển thị bức ảnh `ngocamchi_03.jpg` (ảnh chụp ngõ Cấm Chỉ) làm ảnh minh họa. 3 quán cà phê khác nhau ở Ngõ Gạch đều dùng chung 1 bức ảnh tách cà phê ở ngõ Tống Duy Tân.
4. **Rủi ro bản quyền chưa xử lý:** 4 di tích/quán ăn hiển thị ảnh tải từ Google Maps contributor mà chưa có giấy phép phân phối thương mại.

---

## 2. Mô hình Phân tầng Hiển thị Thị giác 4 Cấp độ (4-Tier Visual Display Model)

Để giải quyết dứt điểm các bất cập trên, ứng dụng thiết lập quy tắc phân tầng thị giác minh bạch:

```
┌────────────────────────────────────────────────────────────────────────┐
│ TIER 1: ẢNH ĐÃ KIỂM CHỨNG BẢN QUYỀN (VERIFIED PHOTO)                   │
│ - Điều kiện: Ảnh film 35mm dự án tự chụp hoặc ảnh Pexels CC0 có ID gốc.│
│ - Hiển thị: Ảnh chụp sắc nét + Credit tác giả chuẩn mực.               │
└────────────────────────────────────────────────────────────────────────┘
                                   │
┌────────────────────────────────────────────────────────────────────────┐
│ TIER 2: ẢNH CHƯA XÁC MINH QUYỀN (UNVERIFIED RIGHTS PHOTO)              │
│ - Điều kiện: 4 ảnh Google Maps contributor & ảnh tài liệu Three Lenses. │
│ - Demo nội bộ: Hiển thị ảnh + Huy hiệu cảnh báo "Tư liệu khảo sát".    │
│ - Bản phát hành: Cách ly (quarantine) chuyển sang Thẻ Ký Họa Di Sản.   │
└────────────────────────────────────────────────────────────────────────┘
                                   │
┌────────────────────────────────────────────────────────────────────────┐
│ TIER 3: ĐIỂM DỪNG THIẾU ẢNH (MISSING PHOTO NODE — 9 ĐIỂM MỚI)          │
│ - Điều kiện: Chưa có ảnh trong kho dữ liệu.                            │
│ - Hiển thị: THẺ KÝ HỌA DI SẢN (HERITAGE SKETCH PLACEHOLDER).           │
│ - Tuyệt đối KHÔNG fallback âm thầm về HERO_PHOTO cờ hoa.               │
└────────────────────────────────────────────────────────────────────────┘
                                   │
┌────────────────────────────────────────────────────────────────────────┐
│ TIER 4: ẢNH MINH HỌA CHUNG (GENERIC ILLUSTRATION PHOTO)                │
│ - Điều kiện: Ảnh chụp không gian chung (cà phê, ẩm thực ngõ phố).      │
│ - Hiển thị: Ảnh chụp + Nhãn bắt buộc: "Ảnh minh họa không gian".       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Đặc tả Thiết kế Thẻ Ký Họa Di Sản (`HeritageSketchPlaceholder`)

### 3.1. Triết lý Thiết kế: "Tactile Alley Journal" (Trang Sổ Tay Ký Họa)
Thay vì dùng các icon placeholder kỹ thuật số khô cứng (hình camera gạch chéo màu xám), `HeritageSketchPlaceholder` được thiết kế như **một trang ký họa nét mực tao nhã trên giấy điệp/giấy dó truyền thống**, tạo cảm giác du khách đang lật mở một cuốn sổ tay du khảo cổ kính.

> [!CAUTION]
> **Quy tắc đạo đức thị giác (Visual Integrity Rule):**  
> Tuyệt đối **không tạo hình vẽ minh họa cụ thể giả danh di tích thật** (ví dụ: vẽ một ngôi chùa tưởng tượng rồi ghi chú "Chùa Cầu Đông"). Họa tiết ký họa phải là **hoa văn kỷ hà, mái ngói âm dương, hoặc khung vòm ngõ phố trung lập mang tính ước lệ nghệ thuật**.

---

### 3.2. Ba Biến thể Họa tiết Ước lệ theo Thể loại Điểm dừng (Category Motifs)

#### A. Thể loại Di tích / Tôn giáo (`category="relic"`)
- **Đối tượng áp dụng:** Đình Thanh Hà, Chùa Cầu Đông, Đình Trung Yên, Đình Yên Thái, Đền Vọng Tiên, Đền Tiên Hạ, Đền Cấm Chỉ.
- **Họa tiết ước lệ (Vector Motif):**
  - Đường nét kỷ hà đầu đao cong thanh thoát vút lên góc trên.
  - Hàng ngói âm dương xô nghiêng nhịp nhàng màu nâu trầm (`colors.terracotta` mờ $15\%$).
  - Biểu tượng trung tâm: Dấu mộc vuông di sản mang chữ `DI TÍCH PHỐ CỔ` màu son gạch nung (`colors.terracotta` `#9C4F36`).

#### B. Thể loại Ngõ phố / Không gian sống (`category="alley_space"`)
- **Đối tượng áp dụng:** Các ngách ngõ Phất Lộc, Không gian nghệ thuật Cấm Chỉ, Nhánh ngõ Hội Vũ.
- **Họa tiết ước lệ (Vector Motif):**
  - Phối cảnh hút sâu (leading lines) ước lệ của hai bờ tường ngõ rêu phong.
  - Vòm cổng gạch cuốn cổ kính phía trên.
  - Biểu tượng trung tâm: Dấu mộc tròn mang hình chiếc đèn lồng ngõ cổ màu vàng hổ phách trầm (`colors.amberAction` `#F2C56B`).

#### C. Thể loại Ẩm thực / Đời sống (`category="culinary"`)
- **Đối tượng áp dụng:** Cà phê No.1, Ta Cà Phê, Phở Sướng, Bún cá Sâm Cây Si, Bún ngan Nhàn, Phở gà Hương Trà.
- **Họa tiết ước lệ (Vector Motif):**
  - Đường nét cách điệu làn khói nước dùng uốn lượn mềm mại trên hiên ngõ.
  - Bàn ghế gỗ mộc ngõ phố chấm phá đơn sơ.
  - Biểu tượng trung tâm: Dấu mộc hình hoa thị ngõ phố ẩm thực màu xanh trầm (`colors.accent` `#2D5748`).

---

### 3.3. Quy chuẩn Bố cục & Màu sắc (Tokens & Layout Specs)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        HERITAGE SKETCH PLACEHOLDER                     │
│                                                                        │
│  [Mái ngói âm dương / Vòm ngõ nét chì mờ: #DCD3C4 trên nền #F7F2E8]   │
│                                                                        │
│               ┌──────────────────────────────────────┐                 │
│               │      NGÕ TẠM THƯƠNG · HOÀN KIẾM      │ <-- Micro text   │
│               │                                      │                 │
│               │           ĐÌNH YÊN THÁI              │ <-- TitleLarge   │
│               │                                      │                 │
│               │     [ 🏛️ Dấu mộc di tích son gạch ]   │                 │
│               └──────────────────────────────────────┘                 │
│                                                                        │
│       ┌────────────────────────────────────────────────────────┐       │
│       │  📍 ĐANG CẬP NHẬT TƯ LIỆU ẢNH THỰC ĐỊA                 │       │
│       │  Heritage photo survey in progress · Bản quyền độc lập │       │
│       └────────────────────────────────────────────────────────┘       │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

- **Màu nền (Background):** `colors.background` (`#F7F2E8`) hoặc `colors.surfaceWarm` (`#F1EAD8`) — vân giấy ấm tự nhiên.
- **Đường viền trang sổ (Border):** `1.5px solid colors.border` (`#E2DDD3`), bo góc theo ngữ cảnh (`radius.md: 12` hoặc `radius.lg: 18`).
- **Khung dấu mộc (Seal Frame):**
  - Nền mộc: `colors.surface` (`#FFFDF7`).
  - Viền mộc: Đứt đoạn nét kép (double border / stamp outline) màu `colors.borderStrong` (`#C5BEAF`).
- **Phân cấp Chữ (Typography Hierarchy):**
  - **Tên ngõ (Alley Context):** `typography.micro` (fontSize: 11, fontWeight: '700', letterSpacing: 1.5, uppercase), màu `colors.muted` (`#626559`).
  - **Tên điểm dừng (Node Title):** `typography.titleMedium` hoặc `typography.titleSmall` (fontSize: 18–20, fontWeight: '800'), màu mực chính `colors.text` (`#2E3028`).
  - **Huy hiệu trạng thái (Status Pill):**
    - Nền: `colors.surface` viền `1px solid colors.borderStrong`.
    - Dòng chữ: `typography.caption` (fontSize: 12, fontWeight: '600'), màu `colors.terracotta` (`#9C4F36`).
    - Icon ghim: `📍` hoặc AppIcon tương ứng.

---

### 3.4. Ma trận Thích ứng Đa Tỷ lệ Khung hình (Responsive Aspect Ratios)

Thẻ ký họa được thiết kế để hiển thị hoàn hảo trên cả 5 vị trí consumer của ứng dụng:

| Tỷ lệ khung hình | Vị trí áp dụng trong App | Kích thước hiển thị | Quy cách bố cục Thẻ Ký Họa |
| :--- | :--- | :--- | :--- |
| **`4:3` (Card Hero)** | Thẻ gợi ý `PostcardCard.tsx` trên màn Kế hoạch (`PlanScreen`) | Chiều rộng: tràn thẻ, chiều cao: ~160pt | Hiển thị đầy đủ: Nét ngói ước lệ + Khung mộc + Tên ngõ + Tên trạm + Huy hiệu *"Đang cập nhật ảnh thực địa"*. |
| **`16:9` (Wide Banner)** | Thẻ kích hoạt ảnh trên màn Camera (`CameraScreen.tsx`) | Chiều rộng: tràn thẻ, chiều cao: ~180pt | Bố cục ngang: Họa tiết bên trái, thông tin trạm và huy hiệu khảo sát bên phải. |
| **`1:1` (Square Thumbnail)** | - Thumbnail xem trước `compactPreviewCard` trên `HomeScreen`<br>- Thumbnail trạm hiện tại trên `LocationScreen` | 64 $\times$ 64 pt hoặc 80 $\times$ 80 pt | Bố cục tối giản (Compact): Nền giấy ấm + Icon thể loại di tích/ngõ/ẩm thực (24pt) + Tên viết tắt. Ẩn chữ dài. |
| **`full` (Full-bleed Background)** | Nền màn hình Kể chuyện (`QaScreen.tsx`) | Tràn toàn bộ màn hình (full viewport) | Nền giấy ấm sẫm màu kết hợp họa tiết chìm mờ ($8\%$ opacity) + Lớp phủ `canvasScrim` bảo vệ độ đọc văn bản. |

---

### 3.5. Khả năng Tiếp cận & Trợ năng (Accessibility & Localization)

1. **Nhãn trợ năng (VoiceOver / TalkBack):**
   - Thay vì đọc dòng chữ vô nghĩa "Image", thẻ được gán `accessibilityRole="image"` và:
     - Tiếng Việt: `accessibilityLabel="Bản ký họa minh họa điểm dừng ${nodeName}, thuộc con ngõ ${alleyName}. Đang cập nhật tư liệu ảnh thực địa."`
     - Tiếng Anh: `accessibilityLabel="Illustration sketch of ${nodeName}, in ${alleyName}. Field survey photo in progress."`
2. **Độ tương phản màu sắc (Contrast Ratio):**
   - Chữ `colors.text` (`#2E3028`) trên nền giấy `colors.background` (`#F7F2E8`) đạt tỷ lệ tương phản **11.99:1** (vượt chuẩn WCAG AAA 7.0:1).
   - Nhãn son gạch `colors.terracotta` (`#9C4F36`) trên nền trắng thẻ đạt **5.95:1** (đạt chuẩn WCAG AA).
3. **Đa ngôn ngữ (Localization):**
   - Toàn bộ nhãn trạng thái và microcopy được đưa vào từ điển `mobile/src/i18n/translator.ts`.

---

## 4. Hợp đồng Kỹ thuật Bộ Phân giải Hình ảnh (`nodeVisual.ts`)

Khi được phép triển khai, bộ phân giải hình ảnh sẽ thay thế hàm `getNodePhoto` đơn giản bằng một hợp đồng kiểu phân nhánh chặt chẽ (Discriminated Union):

```ts
// mobile/src/assets/nodeVisual.ts
export type NodeVisual =
  | {
      kind: 'photo';
      source: ImageSourcePropType;
      credit: string;
      caption?: string;
      tier: 'verified' | 'unverified_rights' | 'generic_illustration';
      disclaimer?: string;
    }
  | {
      kind: 'placeholder';
      nodeId: string;
      nodeName: string;
      alleyName: string;
      category: 'relic' | 'alley_space' | 'culinary';
      reason: 'missing_photo' | 'rights_quarantined';
      labelKey: string;
    };
```

### Quy tắc Phân giải (Resolution Rules):
1. **Three Lenses:** Nếu có `photoKey` hợp lệ trong `THREE_LENSES_PHOTOS`, trả về `kind: 'photo'`, `tier: 'unverified_rights'`.
2. **Node có ảnh riêng trong `NODE_PHOTO_MAP`:**
   - Nếu là ảnh Google Maps: trả về `kind: 'photo'`, `tier: 'unverified_rights'` (hoặc chuyển sang `kind: 'placeholder'` nếu người dùng chọn phương án cách ly bản quyền).
   - Nếu là ảnh Pexels minh họa: trả về `kind: 'photo'`, `tier: 'generic_illustration'`.
3. **9 Node mới chưa có ảnh:** Tuyệt đối không trả về `HERO_PHOTO`, trả về ngay `kind: 'placeholder'` kèm thể loại tương ứng (`relic`, `culinary`, hoặc `alley_space`).

---

## 5. Kế hoạch Chuyển giao Kỹ thuật cho Codex Luna (Implementation Handoff)

### 5.1. Danh mục Tệp đề xuất (Allowlist Files)
- **Tệp mới:**
  - `mobile/src/assets/nodeVisual.ts` (Hàm logic phân giải hình ảnh `resolveNodeVisual`)
  - `mobile/src/components/HeritageSketchPlaceholder.tsx` (Component hiển thị ký họa)
  - `mobile/tests/nodeVisualResolver.test.mjs` (Kiểm thử đơn vị hợp đồng dữ liệu)
  - `mobile/tests/heritagePlaceholder.test.mjs` (Kiểm thử render component, accessibility và tỷ lệ khung hình)
- **Tệp sửa đổi (Chỉ thay đổi cách gọi renderer, giữ nguyên layout bao ngoài):**
  - `mobile/src/components/PostcardCard.tsx`
  - `mobile/src/screens/HomeScreen.tsx`
  - `mobile/src/screens/QaScreen.tsx`
  - `mobile/src/screens/CameraScreen.tsx`
  - `mobile/src/screens/LocationScreen.tsx`
  - `mobile/src/i18n/translator.ts` (Thêm các key thông báo placeholder)

### 5.2. Tiêu chí Nghiệm thu Kỹ thuật (Acceptance Criteria)
1. 100% 9 trạm thiếu ảnh hiển thị đúng `HeritageSketchPlaceholder` với thể loại phù hợp, không còn trạm nào hiển thị ảnh cờ hoa `HERO_PHOTO` sai lệch.
2. Nút bấm, thanh cuộn và bố cục thẻ tại `PostcardCard`, `CameraScreen`, `LocationScreen` không bị vỡ hoặc giật khung hình khi chuyển đổi giữa ảnh chụp và thẻ ký họa.
3. Không xóa bỏ bất kỳ dòng credit nào trong `NODE_PHOTO_MAP` hoặc `photoMap.ts`.
4. Toàn bộ 426 tests hiện hữu tiếp tục PASS 100% kèm các test mới bổ sung.
