# Sổ cái Bản quyền Hình ảnh & Thẩm định Tư liệu Thị giác — Ngõ Kể
## (Node Visual Rights & Provenance Ledger)

**Mã tài liệu:** `NK-UI-05A`  
**Ngày lập:** 2026-10-24  
**Tác nhân thực hiện:** Antigravity (Visual Asset Auditor & Mobile UX QA Lead)  
**Tài liệu tham chiếu:**
- Mã nguồn registry: [`mobile/src/assets/photoMap.ts`](file:///d:/ngo_ke/mobile/src/assets/photoMap.ts)
- Danh mục nguồn gốc: [`docs/IMAGE_SOURCES.md`](file:///d:/ngo_ke/docs/IMAGE_SOURCES.md)
- Tập tin ảnh thực tế: Thư mục [`mobile/assets/photos/`](file:///d:/ngo_ke/mobile/assets/photos/) (gồm 24 tập tin)
- Tập dữ liệu 8 collections: `data/demo.json` và `data/localized/*.json`

---

## 1. Nguyên tắc Pháp lý & Tiêu chuẩn Phân loại Quyền

Để chuẩn bị cho sản phẩm văn hóa du lịch số phát hành tới công chúng, việc quản lý bản quyền hình ảnh tuân thủ nghiêm ngặt 5 nguyên tắc:

1. **Ghi nhận nguồn không đồng nghĩa với có quyền sử dụng (Attribution $\neq$ Permission):** Việc ghi nhãn "Google Maps contributor" hay tên tác giả là sự minh bạch về nguồn gốc (provenance), nhưng **không tạo ra quyền pháp lý để phân phối lại** nếu không có giấy phép CC phù hợp hoặc văn bản thỏa thuận của tác giả.
2. **Bản demo nội bộ không tự động hợp pháp:** Việc sử dụng ảnh chưa rõ bản quyền trong bản thử nghiệm nội bộ chỉ mang tính tạm thời trong giai đoạn nghiên cứu (fair study/internal research), **tuyệt đối không được giữ nguyên khi đưa ra thị trường hoặc đưa lên App Store / Google Play**.
3. **Bảo toàn nguồn gốc trong mã nguồn (Provenance Preservation):** Tuyệt đối không dùng lệnh tìm kiếm/thay thế (grep/sed) để xóa chuỗi credit nhằm che giấu nguồn gốc ảnh.
4. **Trung thực về kiến trúc di tích (Honest Depiction):** Không dùng ảnh của công trình A để gán nhãn cho công trình B. Đối với các điểm dừng thực địa chưa có ảnh tự chụp, sử dụng **Thẻ Ký Họa Di Sản Trung Lập (Heritage Sketch Placeholder)** kèm nhãn *"Đang cập nhật ảnh thực địa"*.
5. **Thang phân loại trạng thái bản quyền (Rights Status):**
   - **`VERIFIED_FREE_LICENSE`**: Đã xác minh có giấy phép tự do thương mại/phi thương mại (như Pexels License có ID gốc tra cứu được).
   - **`RIGHTS_UNVERIFIED`**: Chưa có văn bản cấp phép, ảnh do người dùng cung cấp hoặc khai thác từ nền tảng cộng đồng mà chưa có văn bản ủy quyền.
   - **`PERMISSION_MISSING`**: Ảnh có tác giả cụ thể trên mạng nhưng chưa có thỏa thuận cấp phép bản quyền.
   - **`ORPHANED_LEGACY`**: Ảnh hoặc bản ghi thuộc về cấu trúc dữ liệu cũ, không còn gắn với điểm dừng thực tế đang hoạt động.

---

## 2. Thống kê Tổng quan Tài sản Hình ảnh trong Repository

- **Tổng số tập tin ảnh vật lý trong `mobile/assets/photos/`:** **24 tập tin**
  - Thư mục gốc `mobile/assets/photos/`: 13 tập tin
  - Thư mục con `alleys/`: 6 tập tin (4 ảnh chụp + 4 ảnh bìa PNG ngõ)
  - Thư mục con `three-lenses/`: 5 tập tin
- **Tổng số điểm dừng đang hoạt động (Active Nodes):** **29 điểm**
  - 5 Ngõ mới: **17 điểm** (Ngõ Gạch: 5, Trung Yên: 5, Tạm Thương: 2, Phất Lộc: 2, Cấm Chỉ: 3)
  - Fiction Letter: **6 điểm** (`demo-01` đến `demo-06`)
  - Old Quarter Pilot: **3 điểm** (`dinh-kim-ngan`, `chua-ba-chua-kho`, `nha-co-87-ma-may`)
  - Ba lát cắt Phố cổ (Three Lenses): **3 điểm / 5 chương**
- **Thực trạng ánh xạ ảnh của 17 điểm dừng mới:**
  - **5 điểm** có ảnh chụp gán riêng: 4 ảnh Google Maps + 1 ảnh Pexels minh họa
  - **3 điểm** dùng chung một ảnh minh họa quán cà phê (`cafengotongduytan_04.jpg`)
  - **9 điểm THIẾU MAPPING RIÊNG** (đang bị fallback ngầm về ảnh cờ hoa `HERO_PHOTO`)
  - **2 bản ghi cũ (Legacy records)** không còn node tương ứng trong dữ liệu (`trung-yen-pho-vui`, `trung-yen-mien-tron-muc`)
- **Tập tin ảnh mồ côi (Unreferenced assets):** 3 tập tin không được bất kỳ mã nguồn nào gọi tới (`cuaso_hanoi_02.jpg`, `ngophatloc_01.jpg`, `ngophatloc_06.jpg`).

---

## 3. Sổ cái Chi tiết Từng Tập tin & Điểm dừng (Image Rights Ledger)

### Bảng 1: Nhóm 17 Điểm dừng Mới (5 Ngõ Văn hóa Phố cổ)

| Mã trạm (Node ID) | Tên điểm dừng thực tế | Con ngõ | Tập tin ảnh đang dùng | Đường dẫn tập tin | Nguồn & Tác giả ghi nhận | Trạng thái bản quyền | Khuyến nghị hành động | Ưu tiên chụp thực địa |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| `ngo-gach-ca-phe-no1` | Cà Phê No.1 | Ngõ Gạch | `cafengotongduytan_04.jpg` | `mobile/assets/photos/` | Thuan Pham (Pexels · ảnh minh họa) | `VERIFIED_FREE_LICENSE` (Ảnh minh họa, không đúng quán) | `PLACEHOLDER_CANDIDATE` (Dùng thẻ ký họa hoặc chụp đúng quán) | MEDIUM |
| `ngo-gach-ta-ca-phe-4` | Ta Cà Phê 4 | Ngõ Gạch | `cafengotongduytan_04.jpg` | `mobile/assets/photos/` | Thuan Pham (Pexels · ảnh minh họa) | `VERIFIED_FREE_LICENSE` (Ảnh minh họa, không đúng quán) | `PLACEHOLDER_CANDIDATE` | MEDIUM |
| `ngo-gach-dinh-thanh-ha` | Đình Thanh Hà | Ngõ Gạch | `dinh-thanh-ha-1.jpg` | `mobile/assets/photos/alleys/` | Google Maps contributor (name not recorded · demo) | `PERMISSION_MISSING` | **`REPLACE_WITH_OWN_PHOTO`** (Di tích cấp quốc gia, bắt buộc tự chụp) | **HIGH** |
| `ngo-gach-cafe-20` | Cafe 20 | Ngõ Gạch | `cafengotongduytan_04.jpg` | `mobile/assets/photos/` | Thuan Pham (Pexels · ảnh minh họa) | `VERIFIED_FREE_LICENSE` (Ảnh minh họa) | `PLACEHOLDER_CANDIDATE` | MEDIUM |
| `ngo-gach-chua-cau-dong` | Chùa Cầu Đông | Ngõ Gạch | `chua-cau-dong-1.jpg` | `mobile/assets/photos/alleys/` | Google Maps contributor (name not recorded · demo) | `PERMISSION_MISSING` | **`REPLACE_WITH_OWN_PHOTO`** (Di tích tôn giáo, bắt buộc tự chụp) | **HIGH** |
| `trung-yen-pho-suong` | Phở Sướng | Ngõ Trung Yên | `pho-suong-1.jpg` | `mobile/assets/photos/alleys/` | Google Maps contributor (name not recorded · demo) | `PERMISSION_MISSING` | `KEEP_PENDING_RIGHTS_REVIEW` (Demo) $\rightarrow$ Chụp lại biển hiệu quán | **HIGH** |
| `trung-yen-dinh-trung-yen` | Đình Trung Yên | Ngõ Trung Yên | *Không có mapping* (đang fallback `HERO_PHOTO`) | — | — | **`RIGHTS_UNVERIFIED`** (Thiếu ảnh) | **`PLACEHOLDER_CANDIDATE`** (Thẻ Ký Họa Di Sản Đình Trung Yên) | **HIGH** |
| `trung-yen-bun-ca-sam-cay-si` | Bún cá Sâm Cây Si | Ngõ Trung Yên | `bun-ca-sam-cay-si-1.jpg` | `mobile/assets/photos/alleys/` | Google Maps contributor (name not recorded · demo) | `PERMISSION_MISSING` | `KEEP_PENDING_RIGHTS_REVIEW` (Demo) $\rightarrow$ Chụp lại quán | **HIGH** |
| `trung-yen-bun-ngan-nhan` | Bún ngan Nhàn | Ngõ Trung Yên | `ngocamchi_03.jpg` | `mobile/assets/photos/` | Dang Hong (Pexels · ảnh minh họa) | `VERIFIED_FREE_LICENSE` (Ảnh minh họa ngõ Cấm Chỉ gán cho Trung Yên) | `PLACEHOLDER_CANDIDATE` | MEDIUM |
| `trung-yen-pho-ga-huong-tra` | Phở gà Hương Trà | Ngõ Trung Yên | *Không có mapping* (đang fallback `HERO_PHOTO`) | — | — | **`RIGHTS_UNVERIFIED`** (Thiếu ảnh) | **`PLACEHOLDER_CANDIDATE`** | MEDIUM |
| `tam-thuong-dinh-yen-thai` | Đình Yên Thái | Ngõ Tạm Thương | *Không có mapping* (đang fallback `HERO_PHOTO`) | — | — | **`RIGHTS_UNVERIFIED`** (Thiếu ảnh) | **`PLACEHOLDER_CANDIDATE`** (Thẻ Ký Họa Di Sản Đình Yên Thái) | **HIGH** |
| `tam-thuong-den-vong-tien` | Đền Vọng Tiên | Ngõ Tạm Thương | *Không có mapping* (đang fallback `HERO_PHOTO`) | — | — | **`RIGHTS_UNVERIFIED`** (Thiếu ảnh) | **`PLACEHOLDER_CANDIDATE`** (Thẻ Ký Họa Di Sản Đền Vọng Tiên) | **HIGH** |
| `phat-loc-den-tien-ha` | Đền Tiên Hạ | Ngõ Phất Lộc | *Không có mapping* (đang fallback `HERO_PHOTO`) | — | — | **`RIGHTS_UNVERIFIED`** (Thiếu ảnh) | **`PLACEHOLDER_CANDIDATE`** (Thẻ Ký Họa Di Sản Đền Tiên Hạ) | **HIGH** |
| `phat-loc-cac-nhanh-ngo` | Các nhánh ngõ rêu phong | Ngõ Phất Lộc | *Không có mapping* (đang fallback `HERO_PHOTO`) | — | — | **`RIGHTS_UNVERIFIED`** (Thiếu ảnh) | **`PLACEHOLDER_CANDIDATE`** | LOW |
| `cam-chi-khong-gian-nghe-thuat` | Không gian nghệ thuật | Ngõ Cấm Chỉ | *Không có mapping* (đang fallback `HERO_PHOTO`) | — | — | **`RIGHTS_UNVERIFIED`** (Thiếu ảnh) | **`PLACEHOLDER_CANDIDATE`** | MEDIUM |
| `cam-chi-ngo-hoi-vu` | Nhánh ngõ Hội Vũ | Ngõ Cấm Chỉ | *Không có mapping* (đang fallback `HERO_PHOTO`) | — | — | **`RIGHTS_UNVERIFIED`** (Thiếu ảnh) | **`PLACEHOLDER_CANDIDATE`** | LOW |
| `cam-chi-den-vong-tien` | Đền Cấm Chỉ | Ngõ Cấm Chỉ | *Không có mapping* (đang fallback `HERO_PHOTO`) | — | — | **`RIGHTS_UNVERIFIED`** (Thiếu ảnh) | **`PLACEHOLDER_CANDIDATE`** (Thẻ Ký Họa Di Sản Đền Cấm Chỉ) | **HIGH** |

---

### Bảng 2: Nhóm Điểm dừng Cũ (Fiction Letter & Three Lenses)

| Mã trạm (Node ID) | Tên điểm dừng / Chương | Tập tin ảnh | Đường dẫn tập tin | Nguồn & Tác giả | Trạng thái bản quyền | Khuyến nghị hành động |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `demo-01` | Điểm mở đầu ngõ cờ hoa | `pexels_demo_01.jpg` | `mobile/assets/photos/` | Thuan Pham (Pexels #34124512) | `VERIFIED_FREE_LICENSE` | Giữ nguyên cho bộ sưu tập mô phỏng |
| `demo-02` | Góc chuyện xưa áo dài | `pexels_demo_02.jpg` | `mobile/assets/photos/` | Dang Hong (Pexels #28916440) | `VERIFIED_FREE_LICENSE` | Giữ nguyên cho bộ sưu tập mô phỏng |
| `demo-03` | Xe hoa quả ban mai | `pexels_demo_03.jpg` | `mobile/assets/photos/` | HONG SON (Pexels #28170044) | `VERIFIED_FREE_LICENSE` | Giữ nguyên cho bộ sưu tập mô phỏng |
| `demo-04` | Quán nhỏ bình yên | `pexels_demo_04.jpg` | `mobile/assets/photos/` | Thuan Pham (Pexels #33767042) | `VERIFIED_FREE_LICENSE` | Giữ nguyên cho bộ sưu tập mô phỏng |
| `demo-05` | Ngõ lồng đèn tường vàng | `pexels_demo_05.jpg` | `mobile/assets/photos/` | meomupmofilm (Pexels #33161018) | `VERIFIED_FREE_LICENSE` | Giữ nguyên cho bộ sưu tập mô phỏng |
| `demo-06` | Chiều sâu lát gạch cổ | `pexels_demo_06.jpg` | `mobile/assets/photos/` | HONG SON (Pexels #28170047) | `VERIFIED_FREE_LICENSE` | Giữ nguyên (Ảnh Hero kiêm demo-06) |
| `oldquarter-bach-ma` | Đền Bạch Mã (Three Lenses) | `bach-ma.jpg` | `photos/three-lenses/` | Tư liệu người dùng cung cấp | `RIGHTS_UNVERIFIED` | `LICENSE_VERIFICATION_REQUIRED` (Cần người dùng xác nhận bản quyền) |
| `oldquarter-ma-may` | Nhà di sản 87 Mã Mây | `ma-may.jpg` | `photos/three-lenses/` | Tư liệu người dùng cung cấp | `RIGHTS_UNVERIFIED` | `LICENSE_VERIFICATION_REQUIRED` |
| `oldquarter-dong-xuan` | Chợ Đồng Xuân (3 chương ảnh) | `dong-xuan-timeline.jpg`, `dong-xuan-fire.jpg`, `dong-xuan-street.jpg` | `photos/three-lenses/` | Tư liệu người dùng cung cấp | `RIGHTS_UNVERIFIED` | `LICENSE_VERIFICATION_REQUIRED` |
| *(Pilot 3 nodes)* | Đình Kim Ngân, Chùa Bà Chúa Kho, 87 Mã Mây | *Không có mapping* (fallback `HERO_PHOTO`) | — | — | `RIGHTS_UNVERIFIED` | `PLACEHOLDER_CANDIDATE` |

---

### Bảng 3: Nhóm Ảnh Bìa Con Ngõ (Alley Covers in `ALLEY_LIST`)

| Mã ngõ (Alley ID) | Tên con ngõ | Tập tin ảnh bìa | Nguồn & Tác giả | Trạng thái bản quyền | Khuyến nghị hành động |
| :--- | :--- | :--- | :--- | :---: | :--- |
| `phat-loc` | Ngõ Phất Lộc | `cover_hero.jpg` | Nguyễn Văn Nam (Dự án Ngõ Kể film 35mm) | `VERIFIED_FREE_LICENSE` | Đạt chuẩn tư liệu gốc của dự án |
| `tam-thuong` | Ngõ Tạm Thương | `alleys/ngo-tam-thuong-cover.png` | Tư liệu người dùng cung cấp (quyền chưa kiểm chứng) | `RIGHTS_UNVERIFIED` | `LICENSE_VERIFICATION_REQUIRED` / Thay bằng ảnh chụp thật |
| `ngo-gach` | Ngõ Gạch | `alleys/ngo-gach-cover.png` | Tư liệu người dùng cung cấp (quyền chưa kiểm chứng) | `RIGHTS_UNVERIFIED` | `LICENSE_VERIFICATION_REQUIRED` / Thay bằng ảnh chụp thật |
| `ngo-trung-yen` | Ngõ Trung Yên | `alleys/ngo-trung-yen-cover.png` | Tư liệu người dùng cung cấp (quyền chưa kiểm chứng) | `RIGHTS_UNVERIFIED` | `LICENSE_VERIFICATION_REQUIRED` / Thay bằng ảnh chụp thật |
| `cam-chi` | Ngõ Cấm Chỉ | `alleys/ngo-cam-chi-cover.png` | Tư liệu người dùng cung cấp (quyền chưa kiểm chứng) | `RIGHTS_UNVERIFIED` | `LICENSE_VERIFICATION_REQUIRED` / Thay bằng ảnh chụp thật |
| `hang-chi` | Ngõ Hàng Chỉ (Archive) | `ngochieusau_05.jpg` | meomupmofilm (Pexels) | `VERIFIED_FREE_LICENSE` | `LEGACY_ONLY` (Lưu kho tư liệu cũ) |
| `old-quarter-three-lenses` | Ba lát cắt phố cổ | `three-lenses/bach-ma.jpg` | Tư liệu người dùng cung cấp | `RIGHTS_UNVERIFIED` | `LICENSE_VERIFICATION_REQUIRED` |
| `fiction-letter` | Ngõ Kể (Mô phỏng) | `pexels_demo_06.jpg` (`HERO_PHOTO`) | HONG SON (Pexels) | `VERIFIED_FREE_LICENSE` | Giữ nguyên cho bản demo |

---

### Bảng 4: Bản ghi Cũ & Tập tin Mồ côi (Legacy & Orphan Assets)

| Tên tập tin / Bản ghi | Vị trí hiện tại | Bản ghi liên quan | Lý do mồ côi / Trạng thái | Khuyến nghị xử lý |
| :--- | :--- | :--- | :--- | :--- |
| `trung-yen-pho-vui` | `NODE_PHOTO_MAP` | Điểm Phở Vui (cũ) | Node ID đã bị thay thế trong Phase 1B / Phase 2A bởi `trung-yen-dinh-trung-yen` | `LEGACY_ONLY` (Giữ trong mã để tránh gãy tham chiếu cũ, gắn cờ không active) |
| `trung-yen-mien-tron-muc` | `NODE_PHOTO_MAP` | Điểm Miến trộn mực (cũ) | Node ID đã bị thay thế bởi `trung-yen-pho-ga-huong-tra` | `LEGACY_ONLY` (Giữ nguyên trạng) |
| `cuaso_hanoi_02.jpg` | `mobile/assets/photos/` (239 KB) | *Không có* | Ảnh cửa sổ phố cổ, không có màn hình nào gọi tới | `KEEP_PENDING_RIGHTS_REVIEW` (Tạm giữ nguyên file, không xóa) |
| `ngophatloc_01.jpg` | `mobile/assets/photos/` (335 KB) | *Không có* | Ảnh ngõ Phất Lộc dự phòng đợt cũ | `KEEP_PENDING_RIGHTS_REVIEW` |
| `ngophatloc_06.jpg` | `mobile/assets/photos/` (324 KB) | *Không có* | Ảnh ngõ Phất Lộc dự phòng đợt cũ | `KEEP_PENDING_RIGHTS_REVIEW` |

---

## 4. Kế hoạch Hành động Khuyến nghị cho Đợt Khảo sát Thực địa (Field Survey)

Để đưa Ngõ Kể từ giai đoạn Tech Demo tiến tới Sản phẩm Thương mại phát hành rộng rãi, dự án cần thực hiện khảo sát chụp ảnh thay thế theo 3 đợt:

### Đợt 1: Thay thế Khẩn cấp 4 Ảnh có nguồn Google Maps (Tránh Rủi ro Pháp lý)
1. **Đình Thanh Hà (Ngõ Gạch):** Chụp chính diện cổng tam quan, mái ngói cổ và biển di tích.
2. **Chùa Cầu Đông (Hàng Đường/Ngõ Gạch):** Chụp cổng chùa, bia đá và không gian hiên chùa.
3. **Phở Sướng (Đầu Ngõ Trung Yên):** Chụp biển hiệu quán, không gian nồi nước dùng buổi sáng.
4. **Bún cá Sâm Cây Si (Ngõ Trung Yên):** Chụp cây si cổ thụ và góc quán bún cá.

### Đợt 2: Thu thập Ảnh cho 9 Điểm dừng Đang Thiếu (Hiện dùng Thẻ Ký Họa)
1. **Đình Trung Yên** (Ngõ Trung Yên)
2. **Phở gà Hương Trà** (Ngõ Trung Yên)
3. **Đình Yên Thái** (Ngõ Tạm Thương) — *Di tích thờ Thái hậu Ỷ Lan*
4. **Đền Vọng Tiên** (Ngõ Tạm Thương)
5. **Đền Tiên Hạ** (Ngõ Phất Lộc)
6. **Các ngách ngõ Phất Lộc** (Góc rêu phong, gạch ngói)
7. **Không gian nghệ thuật** (Ngõ Cấm Chỉ)
8. **Nhánh ngõ Hội Vũ** (Ngõ Cấm Chỉ)
9. **Đền Cấm Chỉ** (Ngõ Cấm Chỉ)

### Đợt 3: Chuẩn hóa Ảnh bìa 4 Ngõ (Thay thế file PNG nặng)
- Hiện tại 4 file `ngo-*-cover.png` có dung lượng rất lớn (từ 880 KB đến 4.1 MB mỗi ảnh, tổng cộng hơn 9 MB). Khi có ảnh chụp thực địa, sẽ xuất file chuẩn JPEG tối ưu ở mức 200–300 KB, giúp giảm đáng kể kích thước bộ cài ứng dụng.

---

## 5. Kết luận Thẩm định Bản quyền (Asset Verdict)

### Verdict: `RIGHTS_INVENTORY_COMPLETE`

**Lý do:**
- Đã lập danh mục chi tiết 100% tài sản hình ảnh hiện có trong repository: 24 file ảnh vật lý, 29 điểm dừng thực tế, 4 ảnh Google Maps contributor, 9 điểm dừng thiếu mapping, và các bản ghi legacy.
- Báo cáo phân định rạch ròi giữa ghi nhận credit và giấy phép sử dụng hợp pháp; không có tình trạng tự ý cấp phép thay người dùng.
- Cung cấp cơ sở dữ liệu vững chắc để triển khai ticket `NK-UI-05B` (Thẻ Ký Họa Di Sản Trung Lập) khi được cấp quyền.
