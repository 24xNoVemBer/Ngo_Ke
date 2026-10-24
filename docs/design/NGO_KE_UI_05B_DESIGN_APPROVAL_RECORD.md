# Ngõ Kể — Hồ Sơ Ghi Nhận Quyết Định Phê Duyệt Thiết Kế UI-05B
## (Design Decision & Reconciliation Record — UI-05B)

**Mã tài liệu:** `RECORD-UI-05B-APPROVAL-FINAL`  
**Ngày lập:** 2026-10-24  
**Tác nhân:** Antigravity (Senior Mobile UX/UI Designer & Visual Asset Auditor)  
**Trạng thái phê duyệt:** **`VISUAL_DESIGN_APPROVED`**  
**Chế độ thực thi:** Design Approval & Implementation Handoff (Chưa can thiệp mã nguồn)

---

## 1. Lịch Sử & Quyết Định Phê Duyệt Chính Thức Của Người Dùng

| Mốc thời gian | Sự kiện | Trạng thái | Nội dung chi tiết |
| :--- | :--- | :---: | :--- |
| 2026-10-24 (Đợt 1) | Trình duyệt định hướng thiết kế & chính sách ảnh | `APPROVED_WITH_CONDITIONS` | - Duyệt định hướng Thẻ Ký Họa Di Sản kèm điều kiện tạo mockup trực quan.<br>- Duyệt chính sách cách ly 100% 4 ảnh Google Maps sang placeholder.<br>- Duyệt khung 3 đợt khảo sát thực địa ảnh (P0: 5 trạm, P1: 6 trạm, P2: 6 trạm). |
| 2026-10-24 (Đợt 2) | Người dùng kiểm tra 4 tệp Mockup v1.0 | `APPROVED_WITH_REVISIONS` | - Mockup 1 & 4: Duyệt bố cục và cấu trúc.<br>- Mockup 2 & 3: Yêu cầu sửa lỗi Unicode, phông chữ tiếng Việt, làm dịu nền QaScreen, ưu tiên storytelling. |
| 2026-10-24 (Đợt 3) | Antigravity hoàn thiện bản hiệu đính v1.1 | `PENDING_RE_REVIEW` | - Sửa triệt để phông chữ bằng Times New Roman + Segoe UI (sạch 100% lỗi Unicode).<br>- Tối ưu layout compact `compactPreviewCard` chuẩn iPhone.<br>- Làm dịu hình nền, nâng Scrim lên 68%, mở rộng Story Sheet 75% trên QaScreen.<br>- Chuẩn hóa con dấu triện 2 dòng đầy đủ chữ. |
| **2026-10-24 (Đợt 4 — Hiện tại)** | **NGƯỜI DÙNG PHÊ DUYỆT CHÍNH THỨC** | **`VISUAL_DESIGN_APPROVED`** | **Phê duyệt toàn bộ 4 Mockup UI-05B v1.1:**<br>- Mockup 1 & 4: Giữ phê duyệt.<br>- Mockup 2: Đạt yêu cầu sau khi sửa Unicode và bố cục compact.<br>- Mockup 3: Đạt yêu cầu sau khi sửa Unicode và giảm độ nổi bật của nền.<br>- **Chốt phong cách Tactile Alley Journal và 3 nhóm motif (`relic`, `culinary`, `alley_space`).** |

---

## 2. Năm Điều Kiện Bắt Buộc Khi Bàn Giao Triển Khai (Handoff Invariants)

Khi bàn giao ticket `NK-UI-05B` cho worker triển khai mã nguồn (Codex Luna), năm điều kiện sau là bất biến:

1. **Tuyệt đối không đưa nội dung chưa xác minh vào runtime:**  
   Không đưa nội dung lịch sử, câu hỏi Q&A, tuyến đường hoặc thời lượng audio chưa được duyệt vào runtime source/datasets. Toàn bộ chuỗi hiển thị phải dùng dữ liệu chuẩn hiện hành hoặc nhãn trung tính.
2. **Không hiển thị thông tin nội bộ về Google Maps trên giao diện người dùng:**  
   Giao diện người dùng cuối (UI) tuyệt đối không hiển thị các thông tin đối soát kỹ thuật nội bộ như *"Thay thế ảnh Google Maps"* hay *"Rủi ro bản quyền"*.  
   Nhãn duy nhất được hiển thị trên UI là nhãn tiêu chuẩn:  
   `● Đang cập nhật ảnh thực địa` (VI) / `● Field photo update in progress` (EN).
3. **Tiếp tục cách ly nghiêm ngặt 4 ảnh Google Maps:**  
   Bốn trạm (`dinh-thanh-ha`, `chua-cau-dong`, `pho-suong`, `bun-ca-sam-cay-si`) tiếp tục được cách ly tại runtime thông qua resolver `resolveNodeVisual`, luôn trả về `HeritageSketchPlaceholder`. Giữ nguyên 4 tệp JPG gốc trên ổ đĩa để bảo tồn dữ liệu đối soát xuất xứ.
4. **Không thay đổi logic audio, voice hoặc nội dung ngoài phạm vi:**  
   Giữ nguyên toàn bộ logic âm thanh, hook voice, và các file ngoài phạm vi UI-05B.
5. **Duy trì tương thích 100% với NK-UI-03 hiện hành:**  
   Mọi cập nhật trên `QaScreen.tsx` phải bảo toàn toàn bộ microcopy và affordance voice đã được kiểm chứng của `NK-UI-03`.

---

## 3. Danh Mục Các Tệp Mockup Đã Phê Duyệt (`VISUAL_DESIGN_APPROVED`)

- [**`docs/design/mockups/mockup_1_postcard_relic.png`**](file:///d:/ngo_ke/docs/design/mockups/mockup_1_postcard_relic.png) — *PostcardCard 4:3 Hero (Đình Yên Thái • Motif Relic)*
- [**`docs/design/mockups/mockup_2_home_compact_culinary.png`**](file:///d:/ngo_ke/docs/design/mockups/mockup_2_home_compact_culinary.png) — *HomeScreen Compact Card (Phở Sướng • Motif Culinary)*
- [**`docs/design/mockups/mockup_3_qa_fullscreen_alley.png`**](file:///d:/ngo_ke/docs/design/mockups/mockup_3_qa_fullscreen_alley.png) — *QaScreen Full-Screen Story View (Ngõ Hội Vũ • Motif Alley Space)*
- [**`docs/design/mockups/mockup_4_matrix_overview.png`**](file:///d:/ngo_ke/docs/design/mockups/mockup_4_matrix_overview.png) — *Bảng Ma trận Đối soát 3 Motifs & Quy chuẩn Thiết kế*

---

## 4. Tài Liệu Kế Thừa & Bàn Giao

1. **Đặc tả kiểm tra Mockup:** [`docs/design/NGO_KE_UI_05B_MOCKUP_REVIEW.md`](file:///d:/ngo_ke/docs/design/NGO_KE_UI_05B_MOCKUP_REVIEW.md) (`VISUAL_DESIGN_APPROVED`)
2. **Hồ sơ bàn giao triển khai cho Worker:** [`docs/plans/NGO_KE_UI_05B_IMPLEMENTATION_HANDOFF.md`](file:///d:/ngo_ke/docs/plans/NGO_KE_UI_05B_IMPLEMENTATION_HANDOFF.md)
3. **Kế hoạch khảo sát thực địa ảnh 17 điểm dừng:** [`docs/plans/NGO_KE_VISUAL_ASSET_PRIORITY_V1_1.md`](file:///d:/ngo_ke/docs/plans/NGO_KE_VISUAL_ASSET_PRIORITY_V1_1.md)
