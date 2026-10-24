# Ngõ Kể — Native QA Evidence Report

**Ngày lập:** 2026-10-24  
**Tác nhân:** Antigravity (Mobile UX QA Lead)  
**Workspace:** `D:\ngo_ke` — Branch `valentino/logic-fix-mobile-20261020` · HEAD `4af64c49`  
**Phạm vi:** UI Wave 1 (NK-UI-01A, NK-UI-02, NK-UI-06A) + Remediation FIX-01/FIX-02  
**Kết quả host:** 426/426 PASS · TypeScript PASS · ESLint PASS · diff --check PASS  

---

## 1. Xác minh Baseline

### 1.1. Trạng thái worktree
- Branch: `valentino/logic-fix-mobile-20261020` (không thay đổi)
- HEAD: `4af64c49a4ada47f952ddf76c35adfb90f826224` (không thay đổi)
- Modified tracked files: 20 files (Phase 1A/1B + Wave 1 + FIX-01/02 — tất cả còn uncommitted, đúng như quy định không push/commit)
- Untracked docs: Thêm `NGO_KE_UI_WAVE1_REMEDIATION_REPORT.md` và tài liệu Phase 2B từ Codex Sol

### 1.2. Xác minh node count theo datasets thực tế
| Collection | Node Count | Nguồn xác minh | Ghi chú |
|:---|:---:|:---|:---|
| `ngo-gach` | **5** | `data/localized/ngo-gach.vi.json` | Đúng với báo cáo Remediation |
| `ngo-trung-yen` | **5** | `data/localized/ngo-trung-yen.vi.json` | Đúng với báo cáo Remediation |
| `ngo-tam-thuong` | **2** | `data/localized/ngo-tam-thuong.vi.json` | Schematic layout: 2 pins Y=15%/85% |
| `ngo-phat-loc` | **2** | `data/localized/ngo-phat-loc.vi.json` | Schematic layout: 2 pins Y=15%/85% |
| `ngo-cam-chi` | **3** | `data/localized/ngo-cam-chi.vi.json` | Schematic layout: 3 pins Y=15%/50%/85% |

> [!NOTE] Trong Visual QA trước, báo cáo ghi nhầm Ngõ Gạch 6 node và Trung Yên 4 node. Số thực tế là 5 và 5. Correction này đã được Remediation Report xác nhận.

---

## 2. Inventory Môi trường Native

### 2.1. Kết quả kiểm tra môi trường
- **`adb`:** Không có trong PATH — không thể kết nối Android device/emulator
- **iOS Simulator / Xcode:** Môi trường Windows, không hỗ trợ iOS Simulator native
- **Metro Bundler:** Không khởi chạy (hard constraint: không sửa config hoặc app source để build)
- **Screenshot device:** Không có file screenshot nào từ user cung cấp tại thời điểm này
- **Expo Go / APK:** Chưa có session đang chạy

**Kết luận môi trường:** Không có native environment khả dụng trong phiên này.

Toàn bộ bằng chứng tại Section 3–5 là `SOURCE_VERIFIED` hoặc `NATIVE_PENDING`.

---

## 3. Source-Verified QA — Wave 1 Items

### 3.1. NK-UI-01A — Design Tokens & Dual-Surface

| Hạng mục kiểm tra | Kết quả | Bằng chứng |
|:---|:---:|:---|
| 15 legacy color tokens còn nguyên | ✅ PASS | `theme.ts:2–18`, `themeTokens.test.mjs:37–53` |
| `colors.muted = '#626559'` bất biến | ✅ PASS | `theme.ts:8`, test:51 |
| `typography.titleLarge.fontSize = 32` bất biến | ✅ PASS | `theme.ts:52`, test:53 |
| Thêm `radius.xl = 24` | ✅ PASS | `theme.ts:74`, test:54 |
| 9 spatial canvas tokens | ✅ PASS | `theme.ts:20–29` |
| 4 amber tokens | ✅ PASS | `theme.ts:31–34` |
| 7 journal/visited tokens | ✅ PASS | `theme.ts:36–44` |
| 3 typography variants mới | ✅ PASS | `theme.ts:57–59` |
| `AlleySelect` rootContainer → `colors.background` | ✅ PASS | `AlleySelectScreen.tsx:386` |
| `AlleySelect` topBar → `colors.surface`, `colors.border` | ✅ PASS | `AlleySelectScreen.tsx:394,396` |
| `AlleyPassport` sheet: `#1E241D` → `colors.surface` | ✅ PASS | `AlleyPassportModal.tsx:114`, test:81–83 |
| `AlleyPassport` sheet: `#B9A589` → `colors.border` | ✅ PASS | `AlleyPassportModal.tsx:118`, test:82 |
| `Notebook` toolGridDesc: `#8C7D70` → `colors.toolCardDesc` | ✅ PASS | `NotebookDrawerModal.tsx:306`, test:85 |
| `toolCardDesc` (#75685C) contrast ≥ 4.5:1 trên #F7F2E7 | ✅ PASS (4.71:1) | `themeTokens.test.mjs:61–73`, tính toán WCAG |
| Hộ chiếu Passport mở/đóng không bị regression | ✅ PASS | `uiFlows.test.mjs` — 80/80 pass |
| Notebook Demo/Live isolation không bị regression | ✅ PASS | `alleyGuideSection.test.mjs` — full pass |

**Kết luận NK-UI-01A:** `SOURCE_VERIFIED` — Đạt hoàn toàn theo spec. **Cần `NATIVE_PENDING`** cho: palette trên thiết bị thật (OLED transition, ảnh bìa scrim, safe area).

---

### 3.2. NK-UI-02 — Schematic Trail Layout

| Hạng mục kiểm tra | Kết quả | Bằng chứng |
|:---|:---:|:---|
| `computeSchematicTrailLayout([])` → `{pins:[],splinePoints:[]}` | ✅ PASS | `alleyGeometry.test.mjs:10–22` |
| Canvas `width=0`, `NaN`, `Infinity` → empty | ✅ PASS | `alleyGeometry.test.mjs:13–22` |
| 1 node → center (0.5, 0.5, side='right') | ✅ PASS | `alleyGeometry.test.mjs:25–33` |
| N=2: Y tách 70% (0.15 và 0.85) | ✅ PASS | `alleyGeometry.test.mjs:59–61` |
| N=3: Y=15%/50%/85% | ✅ PASS | `alleyGeometry.test.mjs:36–57` |
| N=5,6,8: phân bố 15%→85% | ✅ PASS | `alleyGeometry.test.mjs:36–57` |
| Pin IDs = node IDs thật, không có `fallback-*` | ✅ PASS | `alleyGeometry.test.mjs:63–74` |
| `fiction-letter` giữ 6 PIN_CONFIG cũ | ✅ PASS | `alleyIntegration.test.mjs` — PIN_CONFIG case |
| `ngo-gach` (5 nodes polyline) dùng `computeAlleyLayout` | ✅ PASS | `alleyIntegration.test.mjs` — mounted Home test |
| `ngo-trung-yen` (5 nodes polyline) giữ tuyến | ✅ PASS | `alleyIntegration.test.mjs` — mounted Home test |
| Schematic non-fiction không dùng synthetic IDs | ✅ PASS | `alleyIntegration.test.mjs:non-fiction case` |
| HomeScreen:495 lookup `pin.id === node.id` | ✅ PASS | Source verified |
| FIX-01: nhãn trái viewport 320 → mép trái = 10pt | ✅ PASS | `alleyIntegration.test.mjs:FIX-01 tests` |
| FIX-01: nhãn trái viewport 360 → width = 123.4pt | ✅ PASS | `alleyIntegration.test.mjs:FIX-01 tests` |
| FIX-01: nhãn trái viewport 375 → width = 130pt | ✅ PASS | `alleyIntegration.test.mjs:FIX-01 tests` |
| FIX-01: nhãn trái viewport 430 → width = 130pt | ✅ PASS | `alleyIntegration.test.mjs:FIX-01 tests` |
| FIX-01: canvas cực nhỏ (1–96pt) không có width âm | ✅ PASS | `alleyIntegration.test.mjs:FIX-01 tiny canvas` |
| Pin touch target: base 38pt + hitSlop 6 → 50×50pt | ✅ PASS | `HomeScreen.tsx:531, 894–898` |
| Selected pin: 44pt diameter + hitSlop → 56×56pt | ✅ PASS | `HomeScreen.tsx:912–917` |
| `fontScale > 1.3` → chuyển sang AlleyTrailView list | ✅ PASS | `HomeScreen.tsx:435` |
| `nodes.length > 6` → chuyển sang AlleyTrailView list | ✅ PASS | `HomeScreen.tsx:435` |

**Kết luận NK-UI-02:** `SOURCE_VERIFIED` — Đạt hoàn toàn. **Cần `NATIVE_PENDING`** cho: collision nhãn + pin trực quan, hit box thực tế, wrap tên dài, cuộn màn hình nhỏ.

---

### 3.3. NK-UI-06A — Plan Screen Contextual Recovery + FIX-02

| Hạng mục kiểm tra | Kết quả | Bằng chứng |
|:---|:---:|:---|
| State A (thiếu topic tag): thông báo đúng VI/EN | ✅ PASS | `planScreenExperience.test.mjs:106–133` |
| State A → nút "Khám phá Chuyện xưa" hiện khi đủ điều kiện | ✅ PASS | `planScreenExperience.test.mjs:123–131` |
| State A → nút Chuyện xưa ẩn khi không đủ budget | ✅ PASS | `planScreenExperience.test.mjs:199–209` |
| State B (unavailable): thông báo riêng, không có nút thay thế | ✅ PASS | `planScreenExperience.test.mjs:144–165` |
| State C (all-visited): thông báo riêng | ✅ PASS | `planScreenExperience.test.mjs:138–143` |
| State D (budget ngắn): thông báo + nút tăng thời lượng | ✅ PASS | `planScreenExperience.test.mjs:167–196` |
| Tap "Chuyện xưa" → đổi topic, giữ budget | ✅ PASS | `planScreenExperience.test.mjs:127–131` |
| Tap "Tăng thời lượng" → đổi budget, giữ topic | ✅ PASS | `planScreenExperience.test.mjs:181–183` |
| Topic không tự thay đổi trước khi tap | ✅ PASS | `planScreenExperience.test.mjs:125` |
| FIX-02: `plan.empty.change_selection` trong TranslationKey | ✅ PASS | `translator.ts:366` |
| FIX-02: VI "Đổi lựa chọn", EN "Change selection" | ✅ PASS | `translator.ts:790, 1213` |
| FIX-02: PlanScreen gọi `t('plan.empty.change_selection')` | ✅ PASS | `PlanScreen.tsx:380`, test spy |
| `pickPoints` algorithm không bị sửa đổi | ✅ PASS | SHA fingerprint kiểm trong Remediation Report |
| Không tự thêm food tag cho đình/đền | ✅ PASS | Datasets không thay đổi |
| QaScreen chips: chỉ hiện khi `displayedQa.length > 0` | ✅ PASS | `QaScreen.tsx:1023` — guard `displayedQa.length > 0` |
| Microphone dock luôn hiển thị (không ẩn khi qa=[]) | ✅ PASS | `QaScreen.tsx:1055–1070` — unconditional render |

**Kết luận NK-UI-06A + FIX-02:** `SOURCE_VERIFIED` — Đạt hoàn toàn. **Cần `NATIVE_PENDING`** cho: keyboard focus, live-region announcement, copy EN dài trên màn nhỏ.

---

## 4. Phân loại Issues

### 4.1. Issues Đã Xác nhận Nguồn — Không có vấn đề mới

Sau remediation FIX-01 và FIX-02, không phát hiện issue `SOURCE_CONFIRMED` nào còn tồn đọng trong phạm vi Wave 1.

### 4.2. Hypothesis Cần Xác minh Native (NATIVE_PENDING)

| ID | Component | Nội dung | Evidence type | Điều kiện cần |
|:---|:---|:---|:---:|:---|
| NQ-01 | `AlleyPassportModal`, `NotebookDrawerModal` | Đáy modal có thể chạm Home Indicator trên iPhone (FIX-03) | `NATIVE_PENDING` | iPhone thật, cuộn hết danh sách |
| NQ-02 | `HomeScreen` canvas trail | Nhãn trái width 123.4pt tại 360dp — có thực sự wrap gọn hay bị cắt chữ | `NATIVE_PENDING` | Android 360dp, tên dài |
| NQ-03 | `HomeScreen` canvas trail | Collision giữa nhãn trạm liền kề khi 5–6 nodes, fontScale 1.3 | `NATIVE_PENDING` | Android/iOS, fontScale 1.3 |
| NQ-04 | `HomeScreen` cover scrim | Độ rõ chữ header trên ảnh bìa sáng ngoài trời | `NATIVE_PENDING` | Thiết bị thật ngoài trời |
| NQ-05 | `AlleySelectScreen` | Thẻ collection dưới bright sunlight | `NATIVE_PENDING` | Thiết bị thật ngoài trời |
| NQ-06 | `PlanScreen` recovery | VoiceOver/TalkBack đọc đúng live-region khi kết quả thay đổi | `NATIVE_PENDING` | Bật screen reader |
| NQ-07 | `AlleyPassportModal` | Transition OLED dark→light khi mở từ Home không nhấp nháy | `NATIVE_PENDING` | OLED device |
| NQ-08 | `QaScreen` | Dock microphone không bị bàn phím che khi input open | `NATIVE_PENDING` | Android/iOS keyboard |

### 4.3. Phân loại cuối

| Phân loại | Số lượng | Ghi chú |
|:---|:---:|:---|
| `SOURCE_CONFIRMED` (đạt) | 35+ | Toàn bộ Wave 1 + FIX-01/02 kiểm ra PASS |
| `NATIVE_CONFIRMED` | 0 | Chưa có native session |
| `NEEDS_MORE_EVIDENCE` | 8 (NQ-01 đến NQ-08) | Yêu cầu thiết bị thật |
| `DESIGN_PREFERENCE` | 0 | Không có phát hiện mới loại này |

---

## 5. Checklist Native QA để Người dùng Tự thực hiện

### 5.1. Môi trường cần chuẩn bị
- Android device/emulator với `adb` trong PATH, hoặc Expo Go đã cài
- iPhone (optional — để kiểm FIX-03 và OLED transitions)
- Đang chạy đúng build từ branch `valentino/logic-fix-mobile-20261020`

### 5.2. Test cases ưu tiên cao

**HOME SCREEN — Schematic Trail (NK-UI-02 + FIX-01)**

| Case | Thu thập gì |
|:---|:---|
| Mở Ngõ Tạm Thương (2 nodes) | Chụp screenshot toàn màn, kiểm 2 pin tách rõ, nhãn không tràn lề |
| Mở Ngõ Cấm Chi (3 nodes) | Chụp screenshot, kiểm 3 pin cân đối |
| Mở Ngõ Gạch (5 nodes polyline) | Chụp screenshot, kiểm đường polyline thực địa |
| Trên màn 360dp, fontScale 1.0 — kiểm nhãn trái | Zoom vào nhãn trạm index 1 (left side), kiểm mép trái cách màn ≥10pt |
| fontScale 2.0 — Ngõ Tạm Thương | Kiểm list fallback xuất hiện thay canvas |

**MODAL PASSPORT & NOTEBOOK (NK-UI-01A)**

| Case | Thu thập gì |
|:---|:---|
| Mở Hộ chiếu từ Landing | Chụp screenshot — kiểm palette giấy ấm, không còn nền đen |
| Cuộn Hộ chiếu đến cuối trên iPhone | Kiểm khoảng cách đáy vs Home Indicator (NQ-01) |
| Mở Notebook Demo mode | Chụp screenshot — kiểm thẻ công cụ, màu mô tả sáng hơn |
| Cuộn Notebook đến cuối trên iPhone | Kiểm khoảng cách đáy vs Home Indicator (NQ-01) |

**PLAN SCREEN (NK-UI-06A + FIX-02)**

| Case | Thu thập gì |
|:---|:---|
| Chọn "Ẩm thực" tại Ngõ Tạm Thương (không có food tag) | Chụp thông báo VI/EN, kiểm nội dung đúng lý do |
| Bấm "Khám phá Chuyện xưa" | Kiểm topic thay đổi, budget giữ nguyên |
| Nút "Đổi lựa chọn" EN — kiểm nhãn | Kiểm hiển thị "Change selection" (FIX-02) |
| Bật bàn phím, kiểm Plan input không bị che | Kiểm `KeyboardAvoidingView` hoạt động |

---

## 6. Verdict Native QA Evidence

### Verdict: `NATIVE_QA_INCOMPLETE`

**Lý do:**
- Môi trường native (adb, iOS Simulator) không khả dụng trong phiên này.
- Không có screenshot hay session thiết bị được người dùng cung cấp.
- Toàn bộ 426 host tests đạt, TypeScript + ESLint sạch, FIX-01/02 triển khai và kiểm chứng đầy đủ từ mã nguồn.
- 8 hypothesis (NQ-01 đến NQ-08) yêu cầu bằng chứng native trước khi có thể kết luận.

**Điều này không phủ nhận Wave 1:** Theo đúng định nghĩa được thống nhất trước, `READY_FOR_NATIVE_QA` (verdict hiện tại của Wave 1) là trạng thái source-level review không có vấn đề chặn rõ ràng. Verdict `NATIVE_QA_INCOMPLETE` phản ánh đúng thực tế là native acceptance chưa được hoàn tất bởi vì không có thiết bị — không phải vì phát hiện lỗi mới.
