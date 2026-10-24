# NGÕ KỂ — UI DESIGN SYSTEM & COMPONENT SPECIFICATION V1.1

**Phiên bản:** 1.1 (Hiệu chỉnh toàn diện sau Technical Review của Codex Sol)  
**Ngày ban hành:** 23/10/2026  
**Vai trò:** Senior Mobile Product Designer, UX Architect & Visual Design Lead  
**Tài liệu tham chiếu:**
- `docs/plans/NGO_KE_UI_IMPLEMENTATION_REVIEW.md`
- `docs/plans/NGO_KE_UI_APPROVED_TICKETS.md`
- `docs/design/NGO_KE_UX_AUDIT.md` (v1.0 Baseline)
- `docs/design/NGO_KE_UI_SPEC.md` (v1.0 Baseline)
- `mobile/src/theme.ts`

---

## 1. TỔNG QUAN HIỆU CHỈNH THIẾT KẾ (REVISED DESIGN PHILOSOPHY)

Phiên bản UI Spec v1.1 giữ vững tầm nhìn cốt lõi của Ngõ Kể: **Một ứng dụng khám phá văn hóa, di sản lấy âm thanh làm trung tâm (Audio-First Cultural Exploration)** kết hợp với phong cách thẩm mỹ **"Sổ tay ngõ phố" (Tactile Alley Journal)**.

### 1.1. Các hiệu chỉnh nguyên tắc từ bản Technical Review
So với bản v1.0, bản v1.1 giải quyết dứt điểm các điểm nghẽn kỹ thuật và rủi ro hồi quy (regression risks):
1. **Bảo tồn toàn diện tính tương thích Tokens:** Không thay thế toàn bộ object `colors` hay `typography` trong `theme.ts`. Giữ nguyên 100% các token hiện hữu (`colors.muted`, `typography.label`, `typography.titleLarge` ở 32pt) để đảm bảo không phá vỡ bất kỳ component nào chưa nằm trong diện chuyển đổi. Các token mới được bổ sung theo nguyên tắc **cộng dồn có chủ đích (additive tokens)**.
2. **Bảo toàn khả năng điều khiển bằng giọng nói (Voice Commands Preservation):** Xóa bỏ đề xuất sai lầm trong v1.0 về việc "ẩn hoàn toàn micro và bàn phím khi `qa=[]`". Việc thiếu câu trả lời cố định (Fixed Q&A) không đồng nghĩa với việc vô hiệu hóa hệ thống nhận diện giọng nói. Giao diện v1.1 định nghĩa rõ hai trạng thái: **Trạng thái có Q&A** và **Trạng thái thuần Kể chuyện (Story-First Mode)**, nhưng vẫn duy trì đầy đủ micro, bàn phím và bộ lệnh điều hướng giọng nói (`nghe lời kể`, `nghe lại`, `dừng`, `điểm kế tiếp`, `mở qr`, `mở gps`, `chọn trải nghiệm`).
3. **Thuật toán sơ đồ ngõ bảo toàn định danh điểm dừng (Schematic Trail ID Integrity):** Thuật toán bố cục đường mòn động nhận danh sách `node.id` thực tế, tuyệt đối không sinh ID giả (`fallback-*`), đảm bảo sự kiện chạm vào pin luôn mở đúng dữ liệu trạm trên bản đồ.
4. **Tách biệt rõ ràng Trình diễn Âm thanh (Presentation) và Logic Vận hành (Lifecycle):** Tách phạm vi chuẩn hóa giao diện âm thanh thành **UI-04A** (đồng bộ icon, nhãn, thời lượng `mm:ss`, vạch tiến độ hiển thị) và hoãn (Deferred/Blocked) **UI-04B** (tua âm thanh tương tác, mini-player toàn app) cho đến khi có kiến trúc quản lý audio lifecycle xuyên màn hình.
5. **Chiến lược Hiển thị Hình ảnh Trung thực (Honest Visual Resolver):** Phân định ranh giới giữa 17 điểm dừng mới (trong đó có 9 điểm thiếu mapping ảnh riêng và 4 điểm ghi nhận nguồn Google Maps cần thẩm định). Không xóa chuỗi provenance để "làm đẹp" mã nguồn, sử dụng mô hình dữ liệu phân nhánh (discriminated union) để hiển thị **Thẻ Ký Họa Di Sản sạch** cho các điểm chưa có ảnh thực địa.

---

## 2. HỆ THỐNG TOKEN THIẾT KẾ V1.1 (ADDITIVE SEMANTIC TOKENS)

### 2.1. Bảng màu Ngữ nghĩa (Semantic Color Palette)
Tệp đích: `mobile/src/theme.ts`.  
*Nguyên tắc:* Giữ nguyên các key hiện hữu; bổ sung các key mới phục vụ phân tầng Bề mặt Kép (Dual-Surface).

```ts
// mobile/src/theme.ts - Additive Semantic Palette v1.1
export const colors = {
  // === 1. TOKENS HIỆN HỮU (GIỮ NGUYÊN 100% ĐỂ BẢO TRÌ TƯƠNG THÍCH) ===
  background: '#F7F2E8',      // Nền giấy ấm
  surface: '#FFFDF7',         // Mặt nội dung sổ tay / thẻ giấy
  surfaceWarm: '#F1EAD8',     // Mặt giấy tối hơn một chút cho card phụ/chip
  text: '#2E3028',            // Mực chính (tương phản 11.99:1 trên nền giấy)
  muted: '#626559',           // [BẮT BUỘC GIỮ] Chữ phụ / chú thích
  accent: '#2D5748',          // Xanh hành động trầm (nút chính, trạng thái chọn)
  accentHover: '#234438',     // Xanh nhấn khi bấm
  accentSoft: '#E8EFEA',      // Nền xanh nhạt đệm cho nhãn/badge
  terracotta: '#9C4F36',      // Gạch nung (dấu mộc, điểm nhấn hiếm)
  terracottaSoft: '#F6EAE6',  // Nền son gạch nhạt
  border: '#E2DDD3',          // Đường kẻ trang sổ / viền thẻ
  borderStrong: '#C5BEAF',    // Viền đậm hơn khi active
  error: '#8B3D28',           // Màu báo lỗi
  errorSoft: '#F8ECE8',       // Nền cảnh báo lỗi
  overlay: 'rgba(46, 48, 40, 0.55)', // Lớp phủ làm mờ nền

  // === 2. BỔ SUNG: BỀ MẶT KHÁM PHÁ KHÔNG GIAN (SPATIAL CANVAS TOKENS) ===
  canvasBackground: '#1E2019',       // Nền rêu tối điện ảnh (Home, Landing, Qa full-bleed)
  canvasSurface: '#252D26',          // Nền thanh dock nổi, thanh điều khiển trên Canvas
  canvasSurfaceSubtle: '#31483A',    // Nền nút bấm phụ trên nền Canvas (AppIcon containers)
  canvasBorder: 'rgba(255, 253, 247, 0.22)', // Viền mỏng bán trong suốt trên nền Canvas
  canvasBorderGlow: 'rgba(242, 197, 107, 0.38)', // Viền ánh vàng hổ phách trên nền Canvas
  canvasText: '#FFFDF7',             // Chữ trắng kem sáng trên nền Canvas
  canvasTextMuted: '#D3D4C7',        // Chữ phụ xám xanh sáng trên nền Canvas
  canvasTextDim: 'rgba(255, 253, 247, 0.75)', // Chữ mờ ghi chú trên nền Canvas
  canvasScrim: 'rgba(20, 24, 19, 0.58)',      // Lớp phủ mờ bảo vệ độ đọc phía sau top header

  // === 3. BỔ SUNG: ĐIỂM NHẤN VÀNG HỔ PHÁCH & ÂM THANH (AMBER & AUDIO SUITE) ===
  amberHighlight: '#FFE29A',         // Vàng kem: Tiêu đề ngõ, nhãn nổi bật
  amberAction: '#F2C56B',            // Vàng hổ phách: Nút Play audio, vạch tiến trình
  amberActionHover: '#E5A842',       // Vàng hổ phách sẫm khi bấm
  amberGlow: 'rgba(229, 168, 66, 0.40)', // Vầng hào quang thở quanh điểm dừng đang chọn

  // === 4. BỔ SUNG: TRẠNG THÁI TIẾN TRÌNH & THẺ SỔ TAY ===
  visitedGreen: '#2A6F50',           // Xanh lá đậm: Điểm dừng đã ghé thăm
  visitedGreenSoft: '#E8F2EC',       // Nền badge "Đã mở"
  visitedGreenText: '#1E6B4A',       // Chữ badge "Đã mở"
  journalDivider: '#EDE5D8',         // Đường phân cách trang sổ trong Modal
  toolCardBg: '#F7F2E7',             // Nền thẻ công cụ trong Sổ tay
  toolCardBorder: '#E6DCC8',         // Viền thẻ công cụ trong Sổ tay
  toolCardDesc: '#75685C',           // Chữ mô tả công cụ (Độ tương phản 4.85:1 trên #F7F2E7, đạt chuẩn WCAG AA)
};
```

### 2.2. Bảng phân cấp Typography tương thích (Typography Scale)
*Nguyên tắc:* Giữ nguyên toàn bộ 9 key hiện tại. Chỉ bổ sung các biến thể mới nếu thực sự cần thiết, không chỉnh sửa kích thước của các key gốc.

```ts
// mobile/src/theme.ts - Typography Hierarchy v1.1
export const typography = {
  // === TOKENS HIỆN HỮU (GIỮ NGUYÊN 100%) ===
  titleLarge: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  titleMedium: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
  titleSmall: { fontSize: 18, lineHeight: 26, fontWeight: '600' as const },
  bodyLarge: { fontSize: 17, lineHeight: 26, fontWeight: '400' as const },
  bodyMedium: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  bodySmall: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '700' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  micro: { fontSize: 11, lineHeight: 14, fontWeight: '600' as const },

  // === BỔ SUNG: ĐẶC TẢ TIÊU ĐỀ NGÕ & ĐIỀU HƯỚNG BẢN ĐỒ ===
  alleyHeaderTitle: { fontSize: 15, lineHeight: 20, fontWeight: '800' as const, letterSpacing: 0.5 },
  storyReaderText: { fontSize: 17, lineHeight: 26, fontWeight: '400' as const }, // Khớp với QaScreen.tsx:1248 (17/26)
  audioTimerText: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const, fontVariant: ['tabular-nums' as const] },
};
```

### 2.3. Quy chuẩn Bán kính bo góc & Khoảng đệm
```ts
// mobile/src/theme.ts - Spacing & Radius v1.1
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,    // Dùng cho mép trên Modal Sổ tay và Hộ chiếu
  pill: 999, // Dùng cho nút tròn, chip lọc, thanh tiến trình
};
```

### 2.4. Bản đồ Chuyển dịch Token (Token Migration Map)

| Thành phần giao diện | Mã màu cũ / Tự do | Token chuẩn v1.1 | Mục đích & Ngữ cảnh sử dụng |
| :--- | :--- | :--- | :--- |
| `AlleySelectScreen` root | `#F5EFE6` | `colors.background` (`#F7F2E8`) | Đồng bộ màu giấy ấm trang sổ |
| `AlleySelectScreen` topBar | `#FFFDF9`, `#EAE1CE` | `colors.surface`, `colors.border` | Viền và nền thanh tiêu đề trang |
| `AlleyPassportModal` sheet | `#1E241D`, `#B9A589` | `colors.surface`, `colors.border` | Chuyển Hộ chiếu về phong cách trang sổ giấy |
| `AlleyPassportModal` title | `#D4AF37`, `#FFFDF7` | `colors.terracotta`, `colors.text` | Đổi từ chữ vàng trên nền đen sang son gạch trên nền giấy |
| `NotebookDrawerModal` toolDesc | `#8C7D70` (Contrast 3.56:1) | `colors.toolCardDesc` (`#75685C`) | Nâng độ tương phản chữ mô tả đạt chuẩn WCAG AA (> 4.5:1) |
| `HomeScreen` introPlayBtn | `#F2C56B`, `#24392E` | `colors.amberAction`, `colors.accentHover` | Chuẩn hóa nút nghe mở đầu ngõ |
| `HomeScreen` pinHaloRing | `rgba(229,168,66,0.40)` | `colors.amberGlow` | Vầng hào quang thở của điểm đang chọn |
| `HomeScreen` pinCircleSelected | `#C26747` | `colors.terracotta` | Dấu son gạch của trạm đang chọn |
| `QaScreen` VoicePlayerBar | `#20372D`, `#F2C56B` | `colors.canvasSurface`, `colors.amberAction` | Khung nghe câu chuyện và câu trả lời |

---

## 3. QUY CÁCH BỐ CỤC ĐƯỜNG MÒN ĐỘNG (NK-UI-02 SCHEMATIC TRAIL SPEC)

*Trạng thái kỹ thuật:* **READY_FOR_TECHNICAL_REVIEW** (Sau khi chuẩn hóa hợp đồng dữ liệu).

### 3.1. Hợp đồng Hàm tính toán (Function Contract)
Tệp đích: `mobile/src/utils/alleyGeometry.ts`.  
*Yêu cầu bắt buộc:* Hàm nhận mảng `DemoNode[]` hoặc danh sách `id: string` thực tế, tuyệt đối không dùng ID giả (`fallback-*`).

```ts
export interface TrailPinMeta {
  id: string;
  xPct: number;
  yPct: number;
  side: 'left' | 'right';
}

export function computeSchematicTrailLayout(
  nodes: readonly { id: string }[],
  canvasWidth: number,
  canvasHeight: number,
): { pins: TrailPinMeta[]; splinePoints: Array<{ x: number; y: number }> } {
  // 1. Tiền điều kiện an toàn kích thước
  if (!canvasWidth || canvasWidth <= 0 || !canvasHeight || canvasHeight <= 0 || !nodes || nodes.length === 0) {
    return { pins: [], splinePoints: [] };
  }

  const n = nodes.length;

  // 2. Trường hợp đặc biệt: 1 điểm duy nhất -> Đặt chính giữa màn hình
  if (n === 1) {
    const pin: TrailPinMeta = { id: nodes[0].id, xPct: 0.50, yPct: 0.50, side: 'right' };
    const splinePoints = [
      { x: canvasWidth * 0.50, y: 0 },
      { x: canvasWidth * 0.50, y: canvasHeight * 0.50 },
      { x: canvasWidth * 0.50, y: canvasHeight },
    ];
    return { pins: [pin], splinePoints };
  }

  // 3. Trường hợp 2 điểm trở lên: Giãn đều trục Y từ 15% đến 85% chiều cao canvas
  const startY = 0.15;
  const endY = 0.85;
  const stepY = (endY - startY) / (n - 1);

  const pins: TrailPinMeta[] = nodes.map((node, index) => {
    const yPct = startY + index * stepY;
    // So le nhịp nhàng: Chẵn lệch phải (56%), lẻ lệch trái (44%)
    const side: 'left' | 'right' = index % 2 === 0 ? 'right' : 'left';
    const xPct = side === 'right' ? 0.56 : 0.44;
    return {
      id: node.id, // BẢO TOÀN DANH TÍNH NODE THẬT ĐỂ MATCH VỚI HOME:491
      xPct,
      yPct,
      side,
    };
  });

  // 4. Tạo các điểm neo Spline để vẽ đường cong tự nhiên
  const splinePoints = [
    { x: canvasWidth * 0.50, y: 0 },
    ...pins.map((p) => ({ x: canvasWidth * p.xPct, y: canvasHeight * p.yPct })),
    { x: canvasWidth * 0.50, y: canvasHeight },
  ];

  return { pins, splinePoints };
}
```

### 3.2. Wireframes Bố cục Sơ đồ (ASCII Diagrams)

```
2 NODES (Tạm Thương, Phất Lộc)     3 NODES (Cấm Chỉ, Pilot)        5 NODES (Không polyline)
Y: 0%  [ Cổng vào ngõ ]             Y: 0%  [ Cổng vào ngõ ]         Y: 0%  [ Cổng vào ngõ ]
       │                                   │                               │
       │                                   │                        15%    └── (1) Node A [Phải]
15%    └── (1) Node 1 [Phải]        15%    └── (1) Node 1 [Phải]           │
       │                                   │                        32.5%  (2) Node B ──┘ [Trái]
       │ (Khoảng cách 70% Y                │                               │
       │  không bị dồn cục)         50%    (2) Node 2 ──┘ [Trái]    50%    └── (3) Node C [Phải]
       │                                   │                               │
       │                            85%    └── (3) Node 3 [Phải]    67.5%  (4) Node D ──┘ [Trái]
85%    (2) Node 2 ──┘ [Trái]               │                               │
       │                                   │                        85%    └── (5) Node E [Phải]
Y: 100%[ Cuối ngõ ]                 Y: 100%[ Cuối ngõ ]             Y: 100%[ Cuối ngõ ]
```

### 3.3. Ranh giới Triển khai tại `HomeScreen.tsx`
- Giữ nguyên luồng xử lý ưu tiên cho Ngõ Gạch và Ngõ Trung Yên có `datasetPolyline`: Tiếp tục gọi `computeAlleyLayout` dựa trên hình học thực tế.
- Bộ sưu tập giả lập `fiction-letter`: Tiếp tục giữ nguyên `PIN_CONFIG` tĩnh 6 điểm hiện có để đảm bảo 100% không ảnh hưởng tới kết quả hồi quy kiểm thử cũ.
- Khi `fontScale > 1.3` hoặc `nodes.length > 6`: Tiếp tục hiển thị `AlleyTrailView` (danh sách dọc hỗ trợ tiếp cận) theo đúng logic tại dòng 431 của `HomeScreen.tsx`.

---

## 4. QUY CÁCH TRẢI NGHIỆM ADAPTIVE STORY (NK-UI-03 STORY MODE SPEC)

*Trạng thái kỹ thuật:* **READY_FOR_TECHNICAL_REVIEW** (Sau khi sửa lỗi mất voice commands).

### 4.1. Phân định Hai Trạng thái Màn hình QaScreen

```
┌────────────────────────────────────────────────────────────────────────┐
│ TRẠNG THÁI A: ĐIỂM DỪNG CÓ BỘ CÂU HỎI Q&A (Fiction Letter, Three Lenses)│
├────────────────────────────────────────────────────────────────────────┤
│ 1. Header: Vạch tiến trình phân đoạn trạm + Nút Back.                  │
│ 2. Floating Story Card:                                                │
│    - Tiêu đề trạm / Chương truyện + Người kể chuyện.                   │
│    - Bộ chuyển chương (Multi-chapter selector nếu có).                 │
│    - Thanh VoicePlayerBar nghe câu chuyện điểm dừng.                   │
│    - Nút "Đọc văn bản / Thu gọn" + Nội dung văn bản.                   │
│    - Cụm phím chuyển trạm: "‹ Điểm trước" và "Điểm sau ›".            │
│ 3. Answer Card (nếu đã hỏi): Hiển thị câu trả lời đã kiểm chứng.       │
│ 4. Quick Suggestions: Danh sách chip câu hỏi gợi ý (`nodeQa.slice`).   │
│ 5. Bottom Dock:                                                        │
│    - Nút Mic: Nhận diện câu hỏi tự do hoặc lệnh điều khiển.            │
│    - Nhãn giữa: "Hỏi câu hỏi về điểm dừng này..."                      │
│    - Nút Gõ chữ: Mở ExpandableInputDrawer có sẵn danh sách câu hỏi mẫu.│
│    - Nút Sổ tay: Mở nhanh NotebookDrawerModal.                         │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ TRẠNG THÁI B: ĐIỂM DỪNG THUẦN KỂ CHUYỆN (5 Ngõ mới: Gạch, Trung Yên,...)│
├────────────────────────────────────────────────────────────────────────┤
│ 1. Header: Vạch tiến trình phân đoạn trạm + Nút Back.                  │
│ 2. Floating Story Card:                                                │
│    - Tiêu đề điểm dừng + Nhãn "Người kể chuyện ngõ phố".               │
│    - Thanh VoicePlayerBar nghe câu chuyện điểm dừng.                   │
│    - Nút "Đọc văn bản / Thu gọn" + Nội dung văn bản.                   │
│    - Cụm phím chuyển trạm: "‹ Điểm trước" và "Điểm sau ›".            │
│ 3. Quick Suggestions: ẨN HOÀN TOÀN (Tuyệt đối không render section rỗng│
│    hoặc khung trống gây bối rối cho người dùng).                       │
│ 4. Bottom Dock (Story Control Mode):                                   │
│    - Nút Mic: GIỮ NGUYÊN (Hỗ trợ 100% các lệnh điều hướng giọng nói).  │
│    - Nhãn giữa: "Điều khiển bằng giọng nói" / "Voice controls"         │
│      Gợi ý chạy chữ nhẹ: "Nói: 'nghe lại', 'tiếp theo', 'mở sổ tay'..."│
│    - Nút Gõ lệnh (Keyboard Icon): GIỮ NGUYÊN (Dự phòng khi ở nơi ồn ào)│
│      Mở drawer nhập lệnh: "Gõ lệnh điều khiển hoặc câu hỏi..."         │
│    - Nút Sổ tay: Mở nhanh NotebookDrawerModal.                         │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.2. Đặc tả Tương tác Trạng thái B (Không có Q&A)
1. **Khi người dùng bấm vào Mic và ra lệnh:**
   - Người dùng nói *"Nghe lại"* / *"Phát lại"* $\rightarrow$ Gọi lệnh `replay` $\rightarrow$ Phát lại story audio.
   - Người dùng nói *"Dừng lại"* / *"Dừng phát"* $\rightarrow$ Gọi lệnh `stop` $\rightarrow$ Tạm dừng âm thanh.
   - Người dùng nói *"Điểm tiếp theo"* / *"Mở chương kế"* $\rightarrow$ Gọi lệnh `next` $\rightarrow$ Chuyển sang điểm dừng kế tiếp.
   - Người dùng nói *"Mở mã QR"* / *"Mở vị trí"* $\rightarrow$ Gọi lệnh `open-qr` / `open-gps` $\rightarrow$ Mở camera/GPS.
   - Người dùng nói *"Chọn trải nghiệm"* / *"Lập hành trình"* $\rightarrow$ Gọi lệnh `plan` $\rightarrow$ Mở thẻ lập kế hoạch.
2. **Khi người dùng hỏi câu hỏi nội dung mà điểm dừng chưa có dữ liệu:**
   - Hệ thống phản hồi qua thẻ thông báo nhã nhặn (Unknown Notice Card):
     - Tiếng Việt: *"Điểm dừng này hiện tập trung vào câu chuyện di sản kể trên. Bạn có thể dùng giọng nói để ra lệnh phát/dừng hoặc chuyển trạm."*
     - Tiếng Anh: *"This stop focuses on the narrative story above. You can use voice commands to play, pause, or navigate."*
3. **Khi người dùng mở ô gõ chữ (ExpandableInputDrawer):**
   - Không hiển thị mục "Gợi ý câu hỏi" rỗng.
   - Placeholder hiển thị: *"Gõ lệnh điều khiển (nghe, dừng, kế tiếp)..."*

---

## 5. QUY CÁCH BỘ CÔNG CỤ ÂM THANH (NK-UI-04 AUDIO SUITE SPEC)

### 5.1. Phân kỳ Triển khai: UI-04A và UI-04B
- **UI-04A (ĐÃ SẴN SÀNG TRIỂN KHAI - Presentation Only):**
  - Đồng bộ hóa hình ảnh nút Play/Pause trên `HomeScreen`, `AlleyStoryCard` và `QaScreen` sử dụng vector `AppIcon`.
  - Hiển thị thời lượng chuẩn dạng `mm:ss` lấy từ runtime player hoặc manifest đã đo đạc.
  - Vạch tiến độ hiển thị trực quan (read-only progress bar).
  - Khả năng tiếp cận: Thông báo nhãn trợ thính `accessibilityLabel` đầy đủ cho các trạng thái Playing / Paused / Ready.
  - Tương thích chế độ giảm chuyển động (`reducedMotion`).
- **UI-04B (HOÃN - DEFERRED / BLOCKED):**
  - Tính năng tua âm thanh bằng chạm (Tap-to-seek) hoặc kéo thanh trượt (Interactive scrub).
  - Thanh phát âm thanh thu nhỏ nổi toàn ứng dụng (Persistent mini-player xuyên màn hình).
  - *Lý do hoãn:* Cần xây dựng hợp đồng kiến trúc quản lý Audio Session toàn cục giữa Navigation và Audio Hook; tránh vi phạm quy tắc đóng băng âm thanh khi chuyển cảnh đã được giải quyết ở Phase 1B (NK-003).

### 5.2. Đặc tả Kỹ thuật `CompactAudioPlayer.tsx` (UI-04A)
Tệp mới: `mobile/src/components/CompactAudioPlayer.tsx`.  
Sử dụng trên: `HomeScreen.tsx` (cạnh nút đọc chuyện ngõ) và `AlleyStoryCard.tsx` (trên thanh header).

```tsx
interface CompactAudioPlayerProps {
  label: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime?: number;
  duration?: number;
  measuredDuration?: number;
  disabled?: boolean;
}
```

- **Quy chuẩn bố cục & Kiểu dáng:**
  - Khung bao: `minHeight: 44pt`, `borderRadius: radius.pill`, `paddingHorizontal: 16`, `flexDirection: 'row'`, `alignItems: 'center'`, `gap: 8`.
  - Nền: `colors.amberAction` (`#F2C56B`), viền `1px solid rgba(242,197,107,0.65)`.
  - Biểu tượng: Vector `AppIcon` (`name={isPlaying ? 'pause' : 'play'}`, `size={18}`, `color="#24392E"`).
  - Nhãn hiển thị:
    - Nếu đang phát hoặc đã nạp thời lượng: `label` + ` · ` + `mm:ss` (ví dụ: *"Nghe giới thiệu · 00:40"*).
    - Nếu thời lượng chưa xác định hoặc lỗi nạp: hiển thị nhãn ngắn gọn *"Nghe giới thiệu ngõ"*, tuyệt đối không bịa số liệu.
  - Phản hồi xúc giác: Hiệu ứng Spring nhẹ (`transform: [{ scale: 0.96 }]`) khi chạm.

---

## 6. QUY CÁCH HIỂN THỊ HÌNH ẢNH & THẺ KÝ HỌA (NK-UI-05 SPEC)

*Trạng thái kỹ thuật:* **05A (Ledger tài liệu) READY; 05B (Renderer) BLOCKED chờ duyệt quyền.**

### 6.1. Hợp đồng Bộ phân giải Hình ảnh (Visual Resolver Contract)
Tệp mới đề xuất: `mobile/src/assets/nodeVisual.ts`.  
*Nguyên tắc:* Tách biệt kết quả trả về thành mô hình kiểu phân nhánh (Discriminated Union), tương thích với cả Image Source thông thường và Thẻ Ký Họa Placeholder.

```ts
export type NodeVisual =
  | {
      kind: 'photo';
      source: ImageSourcePropType;
      credit: string;
      caption?: string;
      status: 'verified' | 'simulated' | 'unverified_rights';
    }
  | {
      kind: 'placeholder';
      reason: 'pending_survey' | 'rights_review';
      nodeName: string;
      alleyName: string;
      labelKey: 'placeholder.pending_survey' | 'placeholder.rights_review';
    };

export function resolveNodeVisual(
  nodeId?: string,
  photoKey?: string,
  collectionId?: string,
  locale: 'vi' | 'en' = 'vi',
): NodeVisual {
  // 1. Ưu tiên hàng đầu: PhotoKey của Three Lenses
  if (photoKey && photoKey in THREE_LENSES_PHOTOS) {
    return {
      kind: 'photo',
      source: THREE_LENSES_PHOTOS[photoKey as keyof typeof THREE_LENSES_PHOTOS],
      credit: locale === 'en' ? 'User-supplied archive' : 'Tài liệu người dùng cung cấp',
      status: 'verified',
    };
  }

  // 2. Kiểm tra ảnh trong NODE_PHOTO_MAP
  if (nodeId && NODE_PHOTO_MAP[nodeId]) {
    const meta = NODE_PHOTO_MAP[nodeId];
    // Nếu là ảnh Google Maps đang chờ thẩm định quyền
    if (meta.photographer.includes('Google Maps contributor')) {
      return {
        kind: 'photo',
        source: meta.source,
        credit: meta.photographer, // BẢO TOÀN NGUYÊN VẸN NGUỒN TRONG MÃ NGUỒN
        caption: meta.locationNote,
        status: 'unverified_rights',
      };
    }
    return {
      kind: 'photo',
      source: meta.source,
      credit: meta.photographer,
      caption: meta.locationNote,
      status: 'simulated',
    };
  }

  // 3. Fallback trung thực: Thẻ Ký Họa Di Sản cho 9 điểm dừng thiếu mapping
  return {
    kind: 'placeholder',
    reason: 'pending_survey',
    nodeName: nodeId ?? 'Điểm dừng ngõ phố',
    alleyName: collectionId ?? 'Hà Nội',
    labelKey: 'placeholder.pending_survey',
  };
}
```

### 6.2. Đặc tả Component Thẻ Ký Họa Di Sản (`HeritageSketchPlaceholder.tsx`)
Tệp mới: `mobile/src/components/HeritageSketchPlaceholder.tsx`.

- **Mục đích:** Thay thế cho việc âm thầm hiển thị ảnh ngõ cờ hoa chung chung (`HERO_PHOTO`) hoặc hiển thị ảnh của ngõ khác cho 9 điểm dừng thiếu tư liệu.
- **Bố cục & Chi tiết hiển thị:**
  - Nền: Giấy vân cổ màu be nhạt (`#F5EFE6`).
  - Họa tiết nền: Đường nét vector SVG mô phỏng mái ngói âm dương và vòm cổng ngõ Hà Nội thanh mảnh màu xám ấm (`#DCD3C4`).
  - Khung dấu mộc trung tâm:
    - Viền hoa văn góc phố cổ màu mực nho mờ.
    - Tên con ngõ (viết hoa, cách chữ rộng): e.g. `NGÕ TẠM THƯƠNG`.
    - Tên điểm dừng: e.g. `Đình Yên Thái`.
    - Dòng trạng thái trung thực có icon ghim định vị:
      - Tiếng Việt: *"📍 Đang cập nhật tư liệu ảnh thực địa"*
      - Tiếng Anh: *"📍 Field survey photo in progress"*
- **Tương thích giao diện:** Hỗ trợ các tỷ lệ khung hình: `16:9` (Bìa/Home preview), `4:3` (Thẻ PostcardCard), `1:1` (Thumbnail tròn).

---

## 7. QUY CÁCH PHỤC HỒI NGỮ CẢNH TRONG PLAN SCREEN (NK-UI-06A SPEC)

*Trạng thái kỹ thuật:* **READY_FOR_TECHNICAL_REVIEW**.

### 7.1. Phân loại 4 Tình huống Không có Kết quả (Empty Classification)
Khi người dùng chọn chủ đề và thời gian trong `PlanScreen.tsx`, nếu kết quả trả về `result.kind === 'empty'`, giao diện phân tích ngữ cảnh để đưa ra lời giải thích trung thực:

1. **Tình huống 1: Ngõ không có điểm dừng nào thuộc chủ đề đã chọn (Missing Topic POI)**
   - *Ví dụ:* Chọn chủ đề "Ăn thực" tại Ngõ Tạm Thương, Ngõ Cấm Chỉ hoặc Ngõ Phất Lộc.
   - *Thông điệp Tiếng Việt:* *"Trong dữ liệu ngõ này chưa có điểm dừng mang chủ đề [Tên chủ đề]. Bạn có thể chọn chủ đề [Chủ đề thay thế khả dụng] để khám phá."*
   - *Thông điệp Tiếng Anh:* *"This alley dataset currently does not have stops under [Topic]. You can explore [Alternative topic] instead."*
   - *Nút hành động:* Nút bấm rõ ràng `[ Khám phá Chuyện xưa ]` $\rightarrow$ Khi người dùng bấm, hệ thống cập nhật `draft.topic = 'chuyen xua'`, giữ nguyên thời lượng đã chọn, và hiển thị ngay các điểm di tích lịch sử.
2. **Tình huống 2: Có điểm thuộc chủ đề nhưng đã ghé thăm hết (All Visited)**
   - *Thông điệp:* *"Bạn đã ghé thăm toàn bộ điểm dừng thuộc chủ đề này. Bạn có muốn thiết kế lại hành trình để ghé thăm lại không?"*
   - *Nút hành động:* `[ Thiết kế lại hành trình ]`.
3. **Tình huống 3: Quỹ thời gian quá ngắn so với thời lượng điểm dừng (Insufficient Budget)**
   - *Ví dụ:* Chọn thời gian 15 phút nhưng các điểm dừng yêu cầu tối thiểu 20-25 phút.
   - *Thông điệp:* *"Quỹ thời gian 15 phút chưa đủ cho các điểm dừng trong chủ đề này (cần tối thiểu [X] phút)."*
   - *Nút hành động:* `[ Tăng thời lượng lên 30 phút ]`.
4. **Tình huống 4: Không có điểm mở cửa / khả dụng (All Unavailable)**
   - *Thông điệp:* *"Hiện chưa có điểm dừng nào đang mở cửa thuộc lựa chọn này trong dữ liệu máy chủ."*

### 7.2. Nguyên tắc An toàn Dữ liệu
- Tuyệt đối không tự ý gán nhãn `'an thuc'` vào di tích đền/đình để ép thuật toán ra kết quả.
- Tuyệt đối không tự động chuyển đổi chủ đề ngầm nếu người dùng chưa bấm nút xác nhận.
- Bảo toàn thời lượng `budgetMinutes` của người dùng khi chuyển đổi chủ đề.

---

## 8. TIÊU CHÍ NGHIỆM THU CHI TIẾT THEO TICKETS (ACCEPTANCE CRITERIA)

### [TICKET NK-UI-01A]: Additive Tokens & Khởi tạo Dual-Surface
- [ ] Bổ sung đầy đủ các token mới vào `mobile/src/theme.ts` mà không xóa hay thay đổi giá trị của bất kỳ token cũ nào.
- [ ] Chuyển đổi màu sắc tại `AlleySelectScreen.tsx` từ mã hex tự do sang `colors.background`, `colors.surface`, `colors.border`.
- [ ] Chuyển đổi `AlleyPassportModal.tsx` từ nền đen sang phong cách trang sổ giấy đồng nhất với `NotebookDrawerModal.tsx`.
- [ ] Sửa màu chữ `toolGridDesc` tại `NotebookDrawerModal.tsx` từ `#8C7D70` sang `colors.toolCardDesc` (`#75685C`) để đạt độ tương phản chuẩn WCAG AA (> 4.5:1).
- [ ] Chạy `npm test --prefix mobile` đạt 100% (405/405 tests pass).
- [ ] Chạy `npm run lint --prefix mobile` và `npm run typecheck --prefix mobile` không có lỗi.

### [TICKET NK-UI-02]: Schematic Trail Layout bảo toàn định danh Pin
- [ ] Thêm hàm `computeSchematicTrailLayout` vào `mobile/src/utils/alleyGeometry.ts` theo đúng hợp đồng mục 3.1.
- [ ] Kết quả pins trả về mang chính danh `node.id` thực tế, không dùng chuỗi `fallback-*`.
- [ ] Với 2 điểm dừng (Tạm Thương, Phất Lộc), khoảng cách Y giữa 2 pin giãn đều tối thiểu 65% chiều cao canvas.
- [ ] Điểm dừng đơn lẻ (1 trạm) nằm chính giữa canvas (Y = 50%).
- [ ] Giữ nguyên 100% vị trí `PIN_CONFIG` tĩnh cho bộ sưu tập cũ `fiction-letter`.
- [ ] Chạm vào pin bất kỳ trên sơ đồ đều mở đúng thông tin và câu chuyện của điểm đó.
- [ ] Viết bộ test unit mới trong `mobile/tests/alleyGeometry.test.mjs` kiểm chứng đầy đủ các trường hợp `n = 0, 1, 2, 3, 5, 6`.

### [TICKET NK-UI-03]: Adaptive Story Mode cho QaScreen
- [ ] Nhận diện tự động `nodeQa.length === 0`:
  - Ẩn hoàn toàn khu vực danh sách chip câu hỏi gợi ý.
  - Chuyển đổi văn bản nhãn Bottom Dock sang "Điều khiển bằng giọng nói" / "Voice controls".
  - Giữ nguyên nút Micro và nút Gõ lệnh; hỗ trợ đầy đủ các lệnh giọng nói: `listen`, `replay`, `stop`, `next`, `plan`, `open-qr`, `open-gps`.
  - Khi người dùng hỏi câu hỏi nội dung chưa có trong dữ liệu, hiển thị thẻ thông báo nhẹ nhàng hướng dẫn ra lệnh điều hướng.
- [ ] Khi `nodeQa.length > 0`: Giữ nguyên 100% giao diện và hành vi hỏi đáp Q&A như hiện hành.
- [ ] Viết test mới `mobile/tests/qaStoryMode.test.mjs` kiểm tra cả 2 nhánh có Q&A và rỗng Q&A.

### [TICKET NK-UI-04A]: Chuẩn hóa Giao diện Bộ công cụ Âm thanh (Presentation Only)
- [ ] Tạo mới component `CompactAudioPlayer.tsx` tại `mobile/src/components/CompactAudioPlayer.tsx`.
- [ ] Thay thế nút bấm lẻ tẻ trên `HomeScreen.tsx` và nút emoji `▶`/`⏸` trên `AlleyStoryCard.tsx` bằng `CompactAudioPlayer`.
- [ ] Hiển thị thời lượng chuẩn `mm:ss` khi có dữ liệu đo đạc thực tế; hiển thị nhãn văn bản thanh lịch khi chưa có dữ liệu thời gian.
- [ ] Đồng bộ hóa việc dùng icon vector từ `AppIcon.tsx` (play/pause), không dùng ký tự emoji.
- [ ] Giữ nguyên logic lifecycle âm thanh (NK-003): Dừng phát khi blur màn hình hoặc chuyển ứng dụng xuống nền, không tự động phát tiếp.
- [ ] Viết test mới `mobile/tests/voicePlayerBar.test.mjs` kiểm tra hiển thị component.

### [TICKET NK-UI-05A/05B]: Visual Resolver & Thẻ Ký Họa Di Sản
- [ ] **05A (Tài liệu):** Lập bảng kiểm kê quyền sử dụng hình ảnh tại `docs/content/NGO_KE_NODE_VISUAL_RIGHTS_LEDGER.md`, ghi nhận trung thực 4 ảnh Google Maps và 9 điểm dừng thiếu mapping.
- [ ] **05B (Renderer sau khi duyệt):** Tạo component `HeritageSketchPlaceholder.tsx` hiển thị đồ họa vector ký họa và nhãn trung thực *"Đang cập nhật ảnh thực địa"*.
- [ ] Tích hợp `resolveNodeVisual` vào các component hiển thị (`HomeScreen`, `QaScreen`, `PostcardCard`, `CameraScreen`, `LocationScreen`).
- [ ] Bảo toàn nguyên vẹn 100% các chuỗi credit và ghi nhận nguồn gốc hiện có trong repository.

### [TICKET NK-UI-06A]: Phục hồi Ngữ cảnh Thông minh trong PlanScreen
- [ ] Bổ sung logic phân loại 4 tình huống không có kết quả vào `PlanScreen.tsx`.
- [ ] Khi chọn chủ đề ẩm thực tại 3 ngõ thiếu tag ẩm thực, giải thích trung thực và cung cấp nút bấm trực quan `[ Khám phá Chuyện xưa ]`.
- [ ] Chỉ cập nhật `draft.topic` khi người dùng bấm trực tiếp vào nút hành động, không tự ý chuyển ngầm.
- [ ] Giữ nguyên thời lượng `budgetMinutes` đã chọn khi chuyển đổi chủ đề.
- [ ] Bổ sung các bản dịch đa ngữ VI/EN tương ứng vào `mobile/src/i18n/translator.ts`.
- [ ] Viết test mới `mobile/tests/planScreenExperience.test.mjs` kiểm tra phản hồi ngữ cảnh.

---

*Quy cách thiết kế V1.1 kết thúc tại đây. Mời xem chi tiết kế hoạch bàn giao kỹ thuật tại tài liệu đi kèm: `docs/design/NGO_KE_UI_V1_1_HANDOFF.md`.*
