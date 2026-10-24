# NGÕ KỂ — UI DESIGN SYSTEM & COMPONENT SPECIFICATION
**Phiên bản:** 1.0 (Hậu Phase 1B)  
**Ngày ban hành:** 23/10/2026  
**Vai trò:** Senior Mobile Product Designer & Design System Lead  
**Tài liệu đi kèm:** `docs/design/NGO_KE_UX_AUDIT.md`  
**Mục tiêu triển khai:** Cung cấp quy chuẩn thiết kế chi tiết, token mã màu, phân cấp kiểu chữ và bộ component dùng chung để Codex Luna có thể hiện thực hóa mà không phá vỡ logic sẵn có.

---

## 1. TRIẾT LÝ THIẾT KẾ: "SỔ TAY NGÕ PHỐ" (DESIGN PHILOSOPHY)

Ngõ Kể không phải là một ứng dụng bản đồ hành trình phổ thông (như Google Maps), cũng không phải là một ứng dụng chatbot AI trả lời tự do. Ngõ Kể là **Sổ tay văn hóa sống động** dẫn dắt người dùng dạo bước qua các con ngõ cổ kính của Hà Nội qua những câu chuyện thật, giọng kể truyền cảm và những điểm dừng giàu ký ức.

### 1.1. Hệ thống Bề mặt Kép có Chủ đích (The Two-Surface Dual Model)
Để giải quyết triệt để sự xung đột màu sắc được chỉ ra trong Audit ([AUD-VIS-001]), giao diện Ngõ Kể được phân định rõ ràng thành hai bề mặt tương hỗ:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   HỆ THỐNG BỀ MẶT KÉP (DUAL-SURFACE)                   │
├───────────────────────────────────┬────────────────────────────────────┤
│ BỀ MẶT 1: KHÁM PHÁ KHÔNG GIAN     │ BỀ MẶT 2: SỔ TAY VĂN HÓA           │
│ (Spatial Exploration Canvas)      │ (Tactile Journal Surface)          │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Dành cho: Bản đồ ngõ, Camera QR,│ • Dành cho: Chọn ngõ, Đọc chuyện,  │
│   Ảnh nền địa điểm toàn màn hình. │   Cẩm nang ngõ, Lập kế hoạch,      │
│ • Cảm xúc: Trầm mặc, điện ảnh,     │   Hộ chiếu ngõ phố, Thẻ thông tin. │
│   mộc mạc như rêu phong phố cũ.   │ • Cảm xúc: Giấy thô ấm, mực nho,   │
│ • Tone chủ đạo: Xanh rêu cổ       │   dấu mộc son gạch nung.           │
│   (`#1B221B`), Đen khói ngõ       │ • Tone chủ đạo: Giấy kem ấm        │
│   (`#151815`), Vàng hổ phách      │   (`#F7F2E8`), Mặt thẻ giấy sáng   │
│   (`#E5A842`, `#F2C56B`).         │   (`#FFFDF7`), Mực xám đen         │
│                                   │   (`#2E3028`), Son gạch (`#9C4F36`).│
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 2. HỆ THỐNG TOKEN THIẾT KẾ (DESIGN TOKENS)

Mọi mã màu và giá trị kiểu dáng dưới đây phải được cập nhật tập trung tại `mobile/src/theme.ts`. Cấm triệt để việc viết mã màu hex tự do (hardcoded hex) trong các màn hình và component.

### 2.1. Bảng màu Ngữ nghĩa (Semantic Color Palette)

```ts
// mobile/src/theme.ts
export const colors = {
  // === BỀ MẶT 2: SỔ TAY VĂN HÓA (TACTILE JOURNAL) ===
  background: '#F7F2E8',          // Nền giấy thô ấm (warm laid paper)
  surface: '#FFFDF7',             // Mặt trang sổ / thẻ giấy chính (clean card)
  surfaceWarm: '#F1EAD8',         // Nền giấy đệm cho chip / card phụ
  surfaceSubtle: '#FAF6EE',       // Nền phụ siêu nhẹ cho danh sách

  // === CHỮ & MỰC IN (INK & TYPOGRAPHY) ===
  text: '#2E3028',                // Mực chính: Đen xám cổ điển (Contrast 11.99:1 trên background)
  textMuted: '#626559',           // Mực phụ: Chú thích, thời lượng (Contrast 5.2:1)
  textSubtle: '#8C8E82',          // Chữ mờ / placeholder tìm kiếm

  // === MÀU HÀNH ĐỘNG & ĐIỂM NHẤN (ACTION & BRAND ACCENTS) ===
  accent: '#2D5748',              // Xanh rêu di sản: Nút chính, trạng thái active
  accentHover: '#234438',         // Xanh rêu đậm khi nhấn (press state)
  accentSoft: '#E8EFEA',          // Nền xanh nhạt đệm cho nhãn / badge đã mở
  
  terracotta: '#9C4F36',          // Đỏ gạch nung: Dấu mộc đã ghé, điểm nhấn hiếm
  terracottaSoft: '#F6EAE6',      // Nền son gạch nhạt
  terracottaHover: '#823F2A',     // Son gạch đậm khi nhấn

  amber: '#E5A842',               // Vàng hổ phách: Đường mòn ngõ, pin đang chọn
  amberGlow: 'rgba(229,168,66,0.40)', // Ánh hào quang thở quanh pin
  amberSoft: '#FFF4E0',           // Nền vàng nhạt cho badge nổi bật

  // === ĐƯỜNG KẺ & VIỀN (BORDERS & DIVIDERS) ===
  border: '#E2DDD3',              // Viền trang sổ chuẩn
  borderStrong: '#C5BEAF',        // Viền đậm khi focus / hover
  borderSubtle: '#EDE8DE',        // Đường phân cách mỏng

  // === BỀ MẶT 1: KHÁM PHÁ KHÔNG GIAN (SPATIAL CANVAS - DARK MOSS) ===
  canvasBackground: '#1B221B',    // Nền tối điện ảnh rêu sẫm
  canvasSurface: '#243026',       // Nền dock / thẻ nổi trên bản đồ
  canvasBorder: 'rgba(255,253,247,0.18)', // Viền sáng mỏng trên nền tối
  canvasText: '#FFFDF7',          // Chữ trắng kem trên nền tối
  canvasTextMuted: '#D3D4C7',     // Chữ phụ xám xanh trên nền tối
  canvasScrim: 'rgba(20,24,19,0.58)', // Lớp mờ nền bản đồ và top header

  // === TRẠNG THÁI HỆ THỐNG (SYSTEM FEEDBACK) ===
  error: '#8B3D28',               // Báo lỗi / cảnh báo mất GPS
  errorSoft: '#F8ECE8',           // Nền cảnh báo lỗi
  success: '#2A6F50',             // Thành công / Điểm đã xác nhận
  successSoft: '#E8F5E9',         // Nền thành công
  overlay: 'rgba(20,24,19,0.68)', // Lớp phủ làm mờ backdrop modal
};
```

---

### 2.2. Phân cấp Kiểu chữ (Typography Scale & Hierarchy)

Áp dụng chuẩn Dynamic Type trên iOS và Font Scaling trên Android. Thiết lập trần mở rộng tối đa `maxFontSizeMultiplier: 1.6` trên các phần tử điều hướng để chống vỡ khung hình.

```ts
// mobile/src/theme.ts
export const typography = {
  // Tiêu đề trang trọng
  display: { fontSize: 32, lineHeight: 40, fontWeight: '800' as const, letterSpacing: -0.5 },
  titleLarge: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const, letterSpacing: -0.2 },
  titleMedium: { fontSize: 18, lineHeight: 26, fontWeight: '700' as const },
  titleSmall: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },

  // Văn bản nội dung (Story & Reading)
  bodyLarge: { fontSize: 17, lineHeight: 26, fontWeight: '400' as const },
  bodyMedium: { fontSize: 15, lineHeight: 23, fontWeight: '400' as const },
  bodySmall: { fontSize: 13, lineHeight: 19, fontWeight: '400' as const },

  // Nhãn nút & Trạng thái (UI Controls)
  labelLarge: { fontSize: 15, lineHeight: 20, fontWeight: '700' as const, letterSpacing: 0.3 },
  labelMedium: { fontSize: 13, lineHeight: 18, fontWeight: '700' as const, letterSpacing: 0.5 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const, letterSpacing: 0.2 },
  micro: { fontSize: 11, lineHeight: 14, fontWeight: '700' as const, letterSpacing: 0.8 },
};
```

---

### 2.3. Quy chuẩn Khoảng đệm & Bán kính bo góc (Spacing & Radius Scale)

```ts
// mobile/src/theme.ts
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  xs: 4,     // Tag trạng thái nhỏ
  sm: 8,     // Chip lọc, nút nhỏ
  md: 12,    // Thẻ preview điểm, ô nhập liệu
  lg: 18,    // Thẻ bưu thiếp PostcardCard, Floating Card
  xl: 24,    // Modal sheet góc trên
  pill: 999, // Nút hành động tròn, vạch tiến trình
};

export const elevation = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
  },
};
```

---

## 3. QUY CÁCH CÁC COMPONENT DÙNG CHUNG (COMPONENT SPECIFICATIONS)

---

### 3.1. Thanh điều hướng trên cùng (ScreenHeader)
Thay thế toàn bộ các thanh top bar viết rời rạc tại `Landing`, `AlleySelect`, `Home`, `Qa`.

- **Cấu trúc layout:** `flexDirection: 'row'`, `alignItems: 'center'`, `justifyContent: 'space-between'`.
- **Chiều cao & Padding:** `paddingTop = Math.max(insets.top, 20) + 8`, `paddingBottom: 10`, `paddingHorizontal: 16`.
- **Các biến thể chuẩn:**
  1. `variant="canvas"` (Dùng cho `HomeScreen`, `QaScreen`):
     - Nền: `colors.canvasScrim` (`rgba(20,24,19,0.58)`), viền đáy `1px solid rgba(255,253,247,0.08)`.
     - Nút Back: Tròn 44x44pt, nền `rgba(28,20,16,0.60)`, icon `‹` màu `#FFFDF7`.
     - Nhãn tiến trình ở giữa: Tiêu đề ngõ vàng kim (`#FFE29A`), vạch tiến độ dạng thanh mỏng hoặc phân đoạn story.
     - Nút Action bên phải: Nút chuyển ngôn ngữ `VI | EN` chạm nhanh 44x44pt.
  2. `variant="journal"` (Dùng cho `AlleySelectScreen`, `PlanScreen`):
     - Nền: `colors.surface` (`#FFFDF7`), viền đáy `1px solid colors.border`.
     - Nút Back: Tròn 44x44pt, nền `colors.surfaceWarm` (`#F1EAD8`), icon màu `colors.text` (`#2E3028`).
     - Tiêu đề ở giữa: Phông `typography.titleMedium`, chữ màu `colors.text`.

---

### 3.2. Thuật toán bố cục đường mòn ngõ thích ứng (Dynamic Map Trail Layout)
*Giải quyết trực tiếp lỗi [AUD-VIS-003].*

Khi dataset không có tọa độ Polyline thực địa, bản đồ chuyển sang chế độ tự động tính toán vị trí pin theo số lượng điểm dừng `nodeCount`:

```ts
// mobile/src/utils/alleyGeometry.ts
export function computeFallbackAlleyLayout(
  nodeCount: number,
  canvasWidth: number,
  canvasHeight: number
): { pins: TrailPinMeta[]; splinePoints: Array<{ x: number; y: number }> } {
  const pins: TrailPinMeta[] = [];
  
  // Phân bổ Y từ 15% đến 85% chiều cao canvas
  const startY = 0.15;
  const endY = 0.85;
  const stepY = nodeCount > 1 ? (endY - startY) / (nodeCount - 1) : 0.5;

  for (let i = 0; i < nodeCount; i++) {
    const yPct = startY + i * stepY;
    // So le nhịp nhàng: Chẵn lệch phải (58%), lẻ lệch trái (42%)
    const side = i % 2 === 0 ? 'right' : 'left';
    const xPct = side === 'right' ? 0.56 : 0.44;
    pins.push({ id: `fallback-${i}`, xPct, yPct, side });
  }

  // Điểm uốn spline tạo dải đường liên tục
  const splinePoints = [
    { x: canvasWidth * 0.50, y: 0 },
    ...pins.map(p => ({ x: canvasWidth * p.xPct, y: canvasHeight * p.yPct })),
    { x: canvasWidth * 0.50, y: canvasHeight },
  ];

  return { pins, splinePoints };
}
```

- **Quy tắc hiển thị Pin:**
  - Trạng thái bình thường: Đường kính 38pt, nền `colors.surfaceWarm` (`#EFE3D0`), viền trắng 2pt.
  - Trạng thái đã ghé (`isVisited`): Nền xanh di sản `colors.success` (`#2A6F50`), icon màu trắng.
  - Trạng thái đang chọn (`isSelected`): Đường kính 44pt, nền son gạch `colors.terracotta` (`#C26747`), có vòng hào quang vàng thở (Amber Pulsing Halo 56pt) bao quanh.

---

### 3.3. Bộ công cụ điều khiển âm thanh thống nhất (Ngõ Kể Audio Suite)
*Giải quyết lỗi [AUD-STY-002].*

Thay thế 3 kiểu nút audio rời rạc bằng bộ component âm thanh đồng nhất:

#### A. Mini Audio Bar (`CompactAudioPlayer`)
- **Vị trí áp dụng:** Trên bản đồ `HomeScreen` (cạnh nút "📖 Về con ngõ") và bên trong header của `AlleyStoryCard`.
- **Kích thước:** `minHeight: 44pt`, `borderRadius: radius.pill`.
- **Giao diện:**
  - Nền: Vàng hổ phách `#F2C56B`, viền `1px solid rgba(242,197,107,0.65)`.
  - Icon: Vector Play/Pause kích thước 18pt màu `#24392E`.
  - Nhãn: Chữ "Nghe giới thiệu" / "Tạm dừng" kèm chỉ số thời gian: `00:40`.
  - Phản hồi: Hiệu ứng co nhẹ khi nhấn (Spring Scale `0.96`).

#### B. Thanh phát âm thanh chi tiết (`VoicePlayerBar`)
- **Vị trí áp dụng:** `QaScreen` (dành cho câu chuyện điểm dừng và câu trả lời Q&A).
- **Quy cách cấu trúc:**
  - Thẻ nền bo góc: `backgroundColor: '#20372D'`, `borderRadius: radius.lg (18)`, viền `1px solid rgba(242,197,107,0.28)`.
  - Nút Play/Pause chính: Hình vuông bo tròn 48x48pt, nền vàng `#F2C56B`, icon vector màu đen rêu `#24392E`.
  - Khối thông tin:
    - Dòng 1: Tiêu đề bài nghe (ví dụ: `Câu chuyện · Đình Thanh Hà`).
    - Dòng 2: Thời gian hiện tại và tổng thời gian: `00:12 / 00:26` (dùng font số đều `fontVariant: ['tabular-nums']`).
  - Nút phụ: Replay (nghe lại từ đầu) và Stop kích thước 44x44pt nền rêu sáng `#31483A`.
  - Thanh tiến độ (Progress Track): Chiều cao 5pt, nền `#536255`, vạch nạp màu vàng `#F2C56B`. Cho phép chạm vào thanh để nhảy nhanh vị trí.

---

### 3.4. Thanh Dock tương tác thông minh (Adaptive Story Dock)
*Giải quyết lỗi nghiêm trọng [AUD-STY-001].*

Thanh Dock dưới đáy màn hình `QaScreen` phải tự động nhận diện ngữ cảnh dữ liệu của điểm dừng để chuyển đổi chế độ hiển thị:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ADAPTIVE STORY DOCK TRONG QASCREEN                   │
├─────────────────────────────────────────────────────────────────────────┤
│ KHI ĐIỂM DỪNG CÓ Q&A (Fiction, Three Lenses):                           │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │  [ 🎙️ MICRO NÓI ]      "Hỏi người kể chuyện..."        [ ⌨️ GÕ ] [ 📖 ] │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ KHI ĐIỂM DỪNG RỖNG Q&A (5 Ngõ mới):                                    │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │  [ ◀ ĐIỂM TRƯỚC ]      [ ▶ PHÁT CÂU CHUYỆN (00:24) ]   [ ĐIỂM SAU ▶ ]  │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│  (Ẩn hoàn toàn mic & ô gõ, hiển thị máy nghe chuyện di sản chuyên sâu) │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Quy cách Adaptive Story Dock (khi 0 Q&A):**
  - Chiều cao: 64pt + `safeAreaInsets.bottom`.
  - Nút trung tâm: Nút tròn 56pt nền vàng `#F2C56B`, icon vector Play/Pause to rõ, kèm nhãn thời lượng bài đọc.
  - Hai nút điều hướng: Nút `‹ Điểm trước` và `Điểm sau ›` chuẩn touch target 48x48pt.
  - Khi đang phát âm thanh, nút trung tâm hiển thị vạch sóng âm chuyển động nhẹ (3 vạch equalizer nhảy nhịp nhàng).

---

### 3.5. Thẻ Ký Họa Di Sản sạch (Heritage Architectural Sketch Placeholder)
*Giải quyết triệt để lỗi [AUD-IMG-001] và [AUD-IMG-002].*

Tuyệt đối cấm hiển thị ảnh sai ngõ hoặc ảnh Google Maps không phép. Với các điểm dừng đang chờ chụp ảnh thật, ứng dụng hiển thị `HeritageSketchCard`:

```tsx
// mobile/src/components/HeritageSketchPlaceholder.tsx
export function HeritageSketchPlaceholder({
  nodeName,
  alleyName,
  aspectRatio = 16 / 9,
}: Props): ReactElement {
  return (
    <View style={[styles.sketchContainer, { aspectRatio }]}>
      {/* Nền giấy cổ có vân ký họa vector */}
      <Svg style={StyleSheet.absoluteFill}>
        {/* Đường viền góc hoa văn phố cổ và nét vẽ ký họa mái ngói rêu */}
        <Path d="..." stroke="#D5CBB8" strokeWidth={1.5} fill="none" />
      </Svg>
      
      {/* Khung dấu mộc chìm trung thực */}
      <View style={styles.sketchStampBadge}>
        <Text style={styles.sketchAlleyTag}>{alleyName.toUpperCase()}</Text>
        <Text style={styles.sketchNodeTitle}>{nodeName}</Text>
        <View style={styles.sketchStatusRow}>
          <Text style={styles.sketchStatusDot}>📍</Text>
          <Text style={styles.sketchStatusText}>Đang cập nhật tư liệu ảnh thực địa</Text>
        </View>
      </View>
    </View>
  );
}
```

- **Tiêu chuẩn chất lượng:**
  - Định dạng vector SVG siêu nhẹ (< 3 KB).
  - Thể hiện sự tôn trọng người dùng và trung thực về nguồn gốc dữ liệu.
  - Có thể dùng thay thế ngay cho 4 điểm Google Maps và 7 điểm rỗng ảnh tại Ngõ Tạm Thương, Ngõ Cấm Chỉ, Ngõ Phất Lộc.

---

## 4. QUY CÁCH TỐI ƯU HÓA HÌNH ẢNH & TỆP TIN (ASSET STANDARDS)

1. **Định dạng & Nén:**
   - Cấm lưu trữ ảnh bìa dạng PNG không nén dung lượng > 1 MB.
   - Toàn bộ ảnh bìa ngõ (`ngo-tam-thuong-cover`, `ngo-trung-yen-cover`, `ngo-gach-cover`) phải được chuyển đổi sang định dạng `.jpg` hoặc `.webp` với mức nén chất lượng 85%.
   - Kích thước ảnh tối đa:
     - Ảnh bìa Hero (16:9): `1440 x 810 px`, dung lượng `< 200 KB`.
     - Ảnh thẻ bưu thiếp Postcard (4:3): `800 x 600 px`, dung lượng `< 120 KB`.
     - Ảnh thumbnail tròn/vuông (1:1): `240 x 240 px`, dung lượng `< 40 KB`.
2. **Quyền sở hữu & Ghi công tác giả:**
   - Thuộc tính `photographer` trong `photoMap.ts` chỉ được chấp nhận 2 trạng thái:
     - Tên tác giả + Giấy phép hợp lệ: ví dụ `Nguyễn Văn Nam (Ảnh khảo sát 2026)` hoặc `Thuan Pham (Pexels · Miễn phí thương mại)`.
     - Ghi nhận trạng thái tư liệu minh họa: `Tư liệu đang cập nhật thực địa`.
   - Xóa bỏ 100% các chuỗi tham chiếu đến `Google Maps contributor`.

---

## 5. HƯỚNG DẪN BÀN GIAO & DANH MỤC THỬ NGHIỆM (ENGINEERING HANDOFF)

### 5.1. Bảng phân quyền tệp theo Tickets của Codex Luna

| Ticket ID | Tên công việc | Danh mục tệp thay đổi | Lệnh kiểm thử bắt buộc |
| :--- | :--- | :--- | :--- |
| **NK-UI-01** | Chuẩn hóa Tokens & Dual-Surface Theme | `mobile/src/theme.ts`<br>`mobile/src/screens/AlleySelectScreen.tsx`<br>`mobile/src/components/AlleyPassportModal.tsx` | `npm test --prefix mobile`<br>`npm run lint --prefix mobile` |
| **NK-UI-02** | Bố cục đường mòn ngõ thích ứng | `mobile/src/utils/alleyGeometry.ts`<br>`mobile/src/screens/HomeScreen.tsx`<br>`mobile/tests/alleyGeometry.test.mjs` | `node --test mobile/tests/alleyGeometry.test.mjs` |
| **NK-UI-03** | Adaptive Story Dock cho QaScreen | `mobile/src/screens/QaScreen.tsx`<br>`mobile/src/components/VoiceInteractionDock.tsx`<br>`mobile/tests/qaStoryMode.test.mjs` | `node --test mobile/tests/qaStoryMode.test.mjs` |
| **NK-UI-04** | Đồng bộ Bộ điều khiển âm thanh | `mobile/src/components/VoicePlayerBar.tsx`<br>`mobile/src/screens/HomeScreen.tsx`<br>`mobile/src/components/AlleyStoryCard.tsx` | `node --test mobile/tests/homeIntroPlay.test.mjs` |
| **NK-UI-05** | Dọn dẹp ảnh Google Maps & Ký họa Vector | `mobile/src/assets/photoMap.ts`<br>`mobile/src/components/PostcardCard.tsx` | `node --test mobile/tests/photoMapping.test.mjs` |
| **NK-UI-06** | Sửa lỗi PlanScreen Dead-End & ID ngõ | `mobile/src/screens/PlanScreen.tsx`<br>`mobile/src/assets/photoMap.ts` | `node --test mobile/tests/planScreen.test.mjs` |

### 5.2. Các kịch bản cần kiểm chứng vật lý trên thiết bị thật (Native Verification Checklist)
Codex Luna và đội QA cần mang thiết bị Android và iOS thật để kiểm thử các mục sau:
1. **Kiểm tra dưới ánh sáng mặt trời tự nhiên:** Độ tương phản của chữ mực xám `#2E3028` trên nền giấy `#F7F2E8` có dễ đọc ngoài trời không.
2. **Kiểm tra bàn phím ảo (Soft Keyboard):** Khi mở ô gõ câu hỏi trong `QaScreen`, bàn phím có che mất câu trả lời hoặc nút gửi không.
3. **Thao tác một tay khi đi bộ:** Vị trí của ToolDock và Adaptive Story Dock có nằm trong tầm với ngón tay cái thuận tiện không.
4. **Trải nghiệm âm thanh ngoài phố:** Giọng đọc AI qua loa ngoài điện thoại có đủ âm lượng, độ trong và dễ nghe giữa tiếng ồn ngõ phố Hà Nội không.

---

*Tài liệu quy cách hoàn tất. Đã sẵn sàng bàn giao cho Codex Luna bắt đầu thực thi theo từng ticket độc lập.*
