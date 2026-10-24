# Ngõ Kể — Báo Cáo Thẩm Định Thiết Kế & Visual Mockups UI-05B
## (Visual Mockup Conformance & Inspection Report — UI-05B)

**Mã tài liệu:** `REVIEW-UI-05B-MOCKUPS-FINAL`  
**Ngày lập:** 2026-10-24  
**Tác nhân:** Antigravity (Senior Mobile UX/UI Designer & Visual Asset Auditor)  
**Trạng thái phê duyệt:** **`VISUAL_DESIGN_APPROVED`** (Người dùng đã chính thức phê duyệt toàn bộ 4 mockup v1.1)  
**Tài liệu tham chiếu:**  
- Quyết định phê duyệt: [`docs/design/NGO_KE_UI_05B_DESIGN_APPROVAL_RECORD.md`](file:///d:/ngo_ke/docs/design/NGO_KE_UI_05B_DESIGN_APPROVAL_RECORD.md)  
- Đặc tả kỹ thuật: [`docs/design/NGO_KE_UI_05B_VISUAL_FALLBACK_SPEC.md`](file:///d:/ngo_ke/docs/design/NGO_KE_UI_05B_VISUAL_FALLBACK_SPEC.md)  
- Kế hoạch bàn giao triển khai: [`docs/plans/NGO_KE_UI_05B_IMPLEMENTATION_HANDOFF.md`](file:///d:/ngo_ke/docs/plans/NGO_KE_UI_05B_IMPLEMENTATION_HANDOFF.md)

---

## 1. Trạng Thái Phê Duyệt Chính Thức Của Toàn Bộ 4 Mockups

Người dùng đã thẩm định bộ 4 mockup phiên bản v1.1 trên môi trường thực tế và ban hành quyết định **`VISUAL_DESIGN_APPROVED`**:

| STT | Tệp Mockup v1.1 | Thành phần UI đại diện | Điểm dừng minh họa | Nhóm Motif | Trạng thái phê duyệt | Liên kết mở tệp |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| **1** | [**`mockup_1_postcard_relic.png`**](file:///d:/ngo_ke/docs/design/mockups/mockup_1_postcard_relic.png) | `PostcardCard` (PlanScreen) | **Đình Yên Thái** (Ngõ Tạm Thương • P0) | `relic` (Di tích) | **`VISUAL_DESIGN_APPROVED`** | [Mở ảnh](file:///d:/ngo_ke/docs/design/mockups/mockup_1_postcard_relic.png) |
| **2** | [**`mockup_2_home_compact_culinary.png`**](file:///d:/ngo_ke/docs/design/mockups/mockup_2_home_compact_culinary.png) | `compactPreviewCard` (HomeScreen) | **Phở Sướng** (Ngõ Trung Yên • P0 Quarantined) | `culinary` (Ẩm thực) | **`VISUAL_DESIGN_APPROVED`** | [Mở ảnh](file:///d:/ngo_ke/docs/design/mockups/mockup_2_home_compact_culinary.png) |
| **3** | [**`mockup_3_qa_fullscreen_alley.png`**](file:///d:/ngo_ke/docs/design/mockups/mockup_3_qa_fullscreen_alley.png) | `fullBleedBackground` (QaScreen) | **Ngõ Hội Vũ** (Ngõ Cấm Chỉ • P2) | `alley_space` (Không gian) | **`VISUAL_DESIGN_APPROVED`** | [Mở ảnh](file:///d:/ngo_ke/docs/design/mockups/mockup_3_qa_fullscreen_alley.png) |
| **4** | [**`mockup_4_matrix_overview.png`**](file:///d:/ngo_ke/docs/design/mockups/mockup_4_matrix_overview.png) | **Bảng Ma Trận & Quy Chuẩn UI** | Đối chiếu cả 3 Motifs trên các thành phần UI | Đa tỉ lệ (4:3, 1:1, Full) | **`VISUAL_DESIGN_APPROVED`** | [Mở ảnh](file:///d:/ngo_ke/docs/design/mockups/mockup_4_matrix_overview.png) |

---

## 2. Các Điểm Thiết Kế Cốt Lõi Đã Được Chốt

1. **Phong cách Art Direction: "Tactile Alley Journal" (Sổ tay con ngõ):**  
   - Tông màu nền giấy dó ấm (`#F7F4EE`), viền mảnh màu giấy mộc (`#E2DDD3`).
   - Mực than đen ghi (`#2E3028`), đạt độ tương phản 11.99:1 vượt chuẩn WCAG AAA.
   - Hạt noise vi mô và con dấu triện gốm sứ bo góc.
2. **Ba Nhóm Motif Ước Lệ:**  
   - `relic`: Đầu đao uốn cong, mái ngói âm dương đối xứng, cột gỗ lim, triện son đỏ đất `#9C4F36` (`DI` / `TÍCH`).
   - `culinary`: Bát sứ mộc, làn khói nước dùng mềm mại, triện xanh rêu đậm `#2D5748` (`ẨM` / `THỰC`).
   - `alley_space`: Phối cảnh chiều sâu hẻm nhỏ, vòm cổng gạch cổ, triện vàng hổ phách `#D49B35` (`KHÔNG` / `GIAN`).
3. **Quy chuẩn Nhãn Giao diện Người dùng (User-facing Badge):**  
   - Nhãn duy nhất hiển thị cho placeholder là:  
     `● Đang cập nhật ảnh thực địa` (tiếng Việt) / `● Field photo update in progress` (tiếng Anh).
   - Tuyệt đối không hiển thị các thông tin nội bộ (như "Google Maps contributor" hay "rủi ro bản quyền") trên giao diện người dùng cuối.
4. **Quy tắc hiển thị Storytelling trên QaScreen:**  
   - Nền ký họa làm dịu ở mức hậu cảnh (mực nhạt, scrim overlay tối 68%).
   - Bảng Story Sheet chiếm 75% màn hình để ưu tiên tuyệt đối nội dung đọc câu chuyện văn hóa.

---

## 3. Tiêu Chí Nghiệm Thu Cho Worker Triển Khai (Codex Luna)

Xem chi tiết đầy đủ tại hồ sơ bàn giao kỹ thuật:  
[**`docs/plans/NGO_KE_UI_05B_IMPLEMENTATION_HANDOFF.md`**](file:///d:/ngo_ke/docs/plans/NGO_KE_UI_05B_IMPLEMENTATION_HANDOFF.md)
