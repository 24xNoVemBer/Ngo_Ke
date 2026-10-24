# Ngõ Kể — Kế hoạch Ưu tiên Thu thập & Sản xuất Tư liệu Thị giác
## (Visual Asset Prioritization & Field Survey Roadmap — 17 New Nodes)

**Mã tài liệu:** `PLAN-UI-05B`  
**Ngày lập:** 2026-10-24  
**Tác nhân:** Antigravity (Senior Mobile UX/UI Designer & Visual Asset Auditor)  
**Tài liệu tham chiếu:**
- Sổ cái bản quyền ảnh: [`docs/content/NGO_KE_NODE_VISUAL_RIGHTS_LEDGER.md`](file:///d:/ngo_ke/docs/content/NGO_KE_NODE_VISUAL_RIGHTS_LEDGER.md)
- Đặc tả kỹ thuật Thẻ Ký Họa: [`docs/design/NGO_KE_UI_05B_VISUAL_FALLBACK_SPEC.md`](file:///d:/ngo_ke/docs/design/NGO_KE_UI_05B_VISUAL_FALLBACK_SPEC.md)
- Hướng dẫn khảo sát thực địa: `docs/DATA_COLLECTION_GUIDE.md`

---

## 1. Mục tiêu & Ma trận Phân nhóm Ưu tiên (Prioritization Matrix)

Để đưa Ngõ Kể từ phiên bản Tech Demo sang sản phẩm phát hành thương mại minh bạch về pháp lý và chuẩn xác về di sản, danh mục 17 điểm dừng mới thuộc 5 con ngõ được phân loại theo 3 mức độ ưu tiên:

| Mức độ | Định nghĩa & Tiêu chí phân loại | Số lượng trạm | Mục tiêu hành động |
| :---: | :--- | :---: | :--- |
| **P0** | **Khẩn cấp — Rủi ro Pháp lý & Di tích Quốc gia:**<br>- Điểm dừng đang dùng ảnh có nguồn Google Maps contributor chưa rõ quyền.<br>- Di tích lịch sử cấp quốc gia, tuyệt đối không được dùng ảnh minh họa sai lệch. | **5 trạm** | **Đợt khảo sát 1:** Đi thực địa chụp ảnh tự sở hữu ngay lập tức để thay thế ảnh Google Maps và trạm di tích thiếu ảnh. |
| **P1** | **Quan trọng — Biểu tượng Văn hóa & Quán ăn Trứ danh:**<br>- Các đền, đình cổ kính gắn liền với tích xưa của ngõ phố.<br>- Các quán ăn di sản tạo nên thương hiệu của con ngõ ẩm thực. | **6 trạm** | **Đợt khảo sát 2:** Chụp ảnh đúng điểm, làm việc với chủ quán xin phép ghi hình không gian. |
| **P2** | **Bổ trợ — Không gian Ngõ & Góc Quán Hiện đại:**<br>- Các không gian cà phê trẻ, nhánh ngõ nghệ thuật, nếp sống thường nhật.<br>- Hiện có thể tạm dùng ảnh minh họa phong cách (kèm nhãn rõ ràng). | **6 trạm** | **Đợt khảo sát 3:** Bổ sung ảnh chất lượng cao để hoàn thiện trọn vẹn bộ sưu tập. |

---

## 2. Bảng Phân loại Chi tiết 17 Điểm dừng Mới

### 2.1. Nhóm P0: Ưu tiên Khẩn cấp (5 Điểm dừng)

#### 1. `ngo-gach-dinh-thanh-ha` — Đình Thanh Hà (10 Ngõ Gạch)
- **Tình trạng hiện tại:** Đang dùng ảnh `alleys/dinh-thanh-ha-1.jpg` (Google Maps contributor, quyền chưa xác minh).
- **Chủ thể cần chụp (Desired Visual):** Cổng đình tam quan mái ngói cong cổ kính, biển di tích lịch sử quốc gia, cây bàng hoặc khoảng sân trước cửa đình.
- **Biến thể Thẻ Ký Họa tạm thời:** `category="relic"` (Dấu mộc son gạch di tích `ĐÌNH THANH HÀ`).
- **Yêu cầu chụp thực địa:**
  - *Góc máy:* Góc đứng chính diện từ đối diện ngõ (khoảng cách hẹp, cần ống kính góc rộng 24mm hoặc 28mm), máy thẳng đứng tránh méo kiến trúc.
  - *Ánh sáng:* Buổi sáng 8:00 – 10:00 khi ánh nắng xiên rọi qua vòm cổng đình.
  - *Quy định tại chỗ:* Xin phép ban quản lý đình/tổ dân phố khi chụp bên trong gian thờ; chụp ngoại quan cổng đình không cần xin phép.
- **Ràng buộc bản quyền:** Bắt buộc thay thế trước khi phát hành public store.

#### 2. `ngo-gach-chua-cau-dong` — Chùa Cầu Đông (38B Hàng Đường / Ngõ Gạch)
- **Tình trạng hiện tại:** Đang dùng ảnh `alleys/chua-cau-dong-1.jpg` (Google Maps contributor, quyền chưa xác minh).
- **Chủ thể cần chụp:** Cổng chùa cổ kính mở ra mặt phố Hàng Đường / ngách Ngõ Gạch, tấm biển chữ Hán "Đông Môn Tự", mái chùa cổ kính thâm nghiêm.
- **Biến thể Thẻ Ký Họa tạm thời:** `category="relic"` (Dấu mộc son gạch `CHÙA CẦU ĐÔNG`).
- **Yêu cầu chụp thực địa:**
  - *Góc máy:* Chụp góc nghiêng $45^\circ$ tôn vinh chiều sâu của bậc thềm chùa và biển di tích.
  - *Ánh sáng:* Ban ngày, tránh giờ tan tầm ùn tắc phố Hàng Đường.
  - *Quy định tại chỗ:* Tôn trọng không gian thanh tịnh chốn thờ tự, tắt âm thanh chụp ảnh.
- **Ràng buộc bản quyền:** Bắt buộc thay thế trước khi phát hành public store.

#### 3. `tam-thuong-dinh-yen-thai` — Đình Yên Thái (Ngõ Tạm Thương)
- **Tình trạng hiện tại:** **Thiếu ảnh** (đang bị fallback âm thầm về ảnh cờ hoa `HERO_PHOTO`).
- **Chủ thể cần chụp:** Ngôi đình cổ linh thiêng thờ Nguyên phi Ỷ Lan nằm sâu trong ngõ hẹp, cổng đình cổ kính, lư hương đá và bia đá di tích.
- **Biến thể Thẻ Ký Họa tạm thời:** `category="relic"` (Dấu mộc son gạch `ĐÌNH YÊN THÁI`).
- **Yêu cầu chụp thực địa:**
  - *Góc máy:* Góc máy dọc bám sát ngõ hẹp, lấy được cả bức tường rêu phong và cửa đình gỗ lim.
  - *Ánh sáng:* Ánh sáng dịu buổi chiều (15:00 – 16:30) khi nắng vàng hắt lên bức tường vôi cũ.
- **Ràng buộc bản quyền:** Cần tư liệu ảnh tự chụp thuộc sở hữu 100% của dự án.

#### 4. `phat-loc-den-tien-ha` — Đền Tiên Hạ (Ngõ Phất Lộc)
- **Tình trạng hiện tại:** **Thiếu ảnh** (đang bị fallback âm thầm về ảnh cờ hoa `HERO_PHOTO`).
- **Chủ thể cần chụp:** Cổng đền Tiên Hạ trầm mặc trong ngõ ngoằn ngoèo, bậc thềm đá cổ, câu đối chữ Hán hai bên cột đồng trụ.
- **Biến thể Thẻ Ký Họa tạm thời:** `category="relic"` (Dấu mộc son gạch `ĐỀN TIÊN HẠ`).
- **Yêu cầu chụp thực địa:**
  - *Góc máy:* Khung hình dọc tôn chiều cao cổng đền giữa lòng ngõ hẹp.
  - *Ánh sáng:* Ban mai sớm hoặc chiều tà khi ngõ thưa người qua lại.
- **Ràng buộc bản quyền:** Dự án tự chụp thực địa.

#### 5. `trung-yen-pho-suong` — Phở Sướng (Đầu Ngõ Trung Yên)
- **Tình trạng hiện tại:** Đang dùng ảnh `alleys/pho-suong-1.jpg` (Google Maps contributor, quyền chưa xác minh).
- **Chủ thể cần chụp:** Biển hiệu cổ điển "Phở Sướng" thân thương, quầy chế biến bốc khói nghi ngút, nồi nước dùng sôi lăn tăn và khách ngồi ăn sáng nhộn nhịp.
- **Biến thể Thẻ Ký Họa tạm thời:** `category="culinary"` (Dấu mộc ẩm thực `PHỞ SƯỚNG`).
- **Yêu cầu chụp thực địa:**
  - *Góc máy:* Góc trung cảnh chụp ngang, lấy được thần thái người thái thịt thoăn thoắt và làn khói thơm.
  - *Ánh sáng:* Sáng sớm (6:30 – 8:00) đón nắng mai vàng hắt vào gian quán.
  - *Quy định tại chỗ:* Xin phép chủ quán và khách hàng trước khi bấm máy, tránh làm phiền thực khách.
- **Ràng buộc bản quyền:** Bắt buộc thay thế ảnh Google Maps.

---

### 2.2. Nhóm P1: Ưu tiên Cao (6 Điểm dừng)

#### 6. `trung-yen-bun-ca-sam-cay-si` — Bún cá Sâm Cây Si (Ngõ Trung Yên)
- **Tình trạng hiện tại:** Đang dùng ảnh `alleys/bun-ca-sam-cay-si-1.jpg` (Google Maps contributor).
- **Chủ thể cần chụp:** Gốc cây si cổ thụ sum suê bao bọc góc quán, khay chả cá vàng ươm, bát bún cá nóng hổi trứ danh.
- **Biến thể Thẻ Ký Họa:** `category="culinary"`.
- **Yêu cầu chụp:** Giờ trưa (11:00 – 12:30), lấy được ánh sáng xuyên qua kẽ lá cây si rọi xuống bàn ăn.

#### 7. `trung-yen-dinh-trung-yen` — Đình Trung Yên (Ngõ Trung Yên)
- **Tình trạng hiện tại:** **Thiếu ảnh** (đang fallback `HERO_PHOTO`).
- **Chủ thể cần chụp:** Gian thờ đình nhỏ nép mình giữa lòng ngõ ẩm thực náo nhiệt, sự đối lập bình yên giữa nhịp sống ăn uống.
- **Biến thể Thẻ Ký Họa:** `category="relic"`.
- **Yêu cầu chụp:** Chụp góc cận cảnh cổng hoặc hiên đình lim cổ kính.

#### 8. `tam-thuong-den-vong-tien` — Đền Vọng Tiên (Ngõ Tạm Thương)
- **Tình trạng hiện tại:** **Thiếu ảnh** (đang fallback `HERO_PHOTO`).
- **Chủ thể cần chụp:** Ngôi đền nhỏ thờ Thánh Mẫu Liễu Hạnh, cửa sơn son thiếp vàng, nét văn hóa tín ngưỡng độc đáo trong ngõ cụt.
- **Biến thể Thẻ Ký Họa:** `category="relic"`.
- **Yêu cầu chụp:** Khung hình dọc ấm áp, bắt được sắc son gỗ và ánh đèn dầu leo lét.

#### 9. `cam-chi-den-vong-tien` — Đền Cấm Chỉ (Ngõ Cấm Chỉ)
- **Tình trạng hiện tại:** **Thiếu ảnh** (đang fallback `HERO_PHOTO`).
- **Chủ thể cần chụp:** Ngôi đền gắn liền với tên gọi "Cấm Chỉ" và tích vua chúa xưa, cổng đền cổ kính nhìn ra đoạn phố ẩm thực đỏ lửa.
- **Biến thể Thẻ Ký Họa:** `category="relic"`.
- **Yêu cầu chụp:** Chụp lúc hoàng hôn hoặc chập tối khi đèn lồng trước đền vừa thắp sáng.

#### 10. `trung-yen-bun-ngan-nhan` — Bún ngan Nhàn (Ngõ Trung Yên)
- **Tình trạng hiện tại:** Đang dùng ảnh `ngocamchi_03.jpg` (ảnh minh họa ngõ Cấm Chỉ, sai vị trí).
- **Chủ thể cần chụp:** Góc quán bún ngan trứ danh nườm nượp khách xếp hàng, đĩa thịt ngan luộc óng ánh chấm nước mắm gừng ớt.
- **Biến thể Thẻ Ký Họa:** `category="culinary"`.
- **Yêu cầu chụp:** Giờ mở bán buổi trưa, chụp cận cảnh bàn ăn đời sống.

#### 11. `trung-yen-pho-ga-huong-tra` — Phở gà Hương Trà (Ngõ Trung Yên)
- **Tình trạng hiện tại:** **Thiếu ảnh** (đang fallback `HERO_PHOTO`).
- **Chủ thể cần chụp:** Quán phở gà ta truyền thống đầu ngõ, đĩa gà luộc lá chanh da vàng giòn, bát nước dùng trong veo thơm mùi gừng nướng.
- **Biến thể Thẻ Ký Họa:** `category="culinary"`.
- **Yêu cầu chụp:** Sáng sớm từ 7:00 – 8:30.

---

### 2.3. Nhóm P2: Ưu tiên Bổ trợ (6 Điểm dừng)

#### 12. `ngo-gach-ca-phe-no1` — Cà Phê No.1 (1 Ngõ Gạch)
- **Tình trạng hiện tại:** Đang dùng ảnh `cafengotongduytan_04.jpg` (ảnh minh họa Pexels).
- **Chủ thể cần chụp:** Biển số 1 Ngõ Gạch, quầy pha chế phong cách mộc nhìn ra dòng người qua lại đầu ngõ.
- **Biến thể Thẻ Ký Họa:** `category="culinary"`.

#### 13. `ngo-gach-ta-ca-phe-4` — Ta Cà Phê 4 (4A Ngõ Gạch)
- **Tình trạng hiện tại:** Đang dùng chung ảnh `cafengotongduytan_04.jpg`.
- **Chủ thể cần chụp:** Không gian quán cà phê ấm cúng, bàn ghế gỗ mộc nép dưới hiên ngõ cổ.
- **Biến thể Thẻ Ký Họa:** `category="culinary"`.

#### 14. `ngo-gach-cafe-20` — Cafe 20 (20 Ngõ Gạch)
- **Tình trạng hiện tại:** Đang dùng chung ảnh `cafengotongduytan_04.jpg`.
- **Chủ thể cần chụp:** Đoạn cuối ngõ Gạch gần chợ Đồng Xuân, góc quán cà phê bình dân của người dân phố cổ.
- **Biến thể Thẻ Ký Họa:** `category="culinary"`.

#### 15. `phat-loc-cac-nhanh-ngo` — Các nhánh ngõ rêu phong (Ngõ Phất Lộc)
- **Tình trạng hiện tại:** **Thiếu ảnh** (đang fallback `HERO_PHOTO`).
- **Chủ thể cần chụp:** Chiều sâu ngoằn ngoèo hun hút như mê cung của Phất Lộc, ngã ba hẹp lát gạch, bờ tường rêu xanh mướt mát ban mai.
- **Biến thể Thẻ Ký Họa:** `category="alley_space"`.

#### 16. `cam-chi-khong-gian-nghe-thuat` — Không gian nghệ thuật (Ngõ Cấm Chỉ)
- **Tình trạng hiện tại:** **Thiếu ảnh** (đang fallback `HERO_PHOTO`).
- **Chủ thể cần chụp:** Mảng tường bích họa hoặc sắp đặt nghệ thuật sáng tạo của các bạn trẻ giữa con ngõ ẩm thực trăm năm.
- **Biến thể Thẻ Ký Họa:** `category="alley_space"`.

#### 17. `cam-chi-ngo-hoi-vu` — Nhánh ngõ Hội Vũ (Ngõ Cấm Chỉ)
- **Tình trạng hiện tại:** **Thiếu ảnh** (đang fallback `HERO_PHOTO`).
- **Chủ thể cần chụp:** Con ngách nhỏ nối thông Cấm Chỉ sang phố Hội Vũ, ban công biệt thự Pháp cổ thấp thoáng giàn hoa giấy.
- **Biến thể Thẻ Ký Họa:** `category="alley_space"`.

---

## 3. Lộ trình Thực hiện Khảo sát Chụp ảnh Thực địa (3-Phase Survey Roadmap)

```
[LỘ TRÌNH KHẢO SÁT CHỤP ẢNH THỰC ĐỊA NGÕ KỂ]

  GIAI ĐOẠN 1: KHẨN CẤP PHÁP LÝ & DI TÍCH (Tuần 1)
  ├── Mục tiêu: Xóa bỏ 100% sự phụ thuộc vào 4 ảnh Google Maps + 2 Di tích Quốc gia
  ├── Địa bàn: Ngõ Gạch (Đình Thanh Hà, Chùa Cầu Đông) & Ngõ Trung Yên (Phở Sướng, Bún cá)
  ├── Bổ sung: Đình Yên Thái (Tạm Thương) & Đền Tiên Hạ (Phất Lộc)
  └── Kết quả: 5 bức ảnh tự chụp chất lượng cao, có giấy phép dự án 100%

  GIAI ĐOẠN 2: DI TÍCH CỐT LÕI & ẨM THỰC TRỨ DANH (Tuần 2)
  ├── Mục tiêu: Phủ ảnh cho 6 trạm P1 quan trọng nhất
  ├── Địa bàn: Ngõ Tạm Thương (Đền Vọng Tiên), Cấm Chỉ (Đền Cấm Chỉ), Trung Yên (Bún ngan Nhàn, Phở gà Hương Trà)
  └── Kết quả: 6 bức ảnh chuẩn mực, thay thế Thẻ Ký Họa cho các trạm linh hồn của ngõ

  GIAI ĐOẠN 3: HOÀN THIỆN KHÔNG GIAN & ẢNH BÌA NGÕ (Tuần 3)
  ├── Mục tiêu: Chụp 6 trạm P2 còn lại + Chụp lại 4 ảnh bìa ngõ JPEG chuẩn (thay thế PNG nặng)
  ├── Địa bàn: Toàn bộ 5 ngõ
  └── Kết quả: Đạt 100% 17 trạm có ảnh thực địa độc quyền, tối ưu dung lượng app (<3MB)
```

---

## 4. Tiêu chuẩn Thẩm mỹ Nhiếp ảnh cho Đội ngũ Khảo sát (Field Photo Standards)

Khi đi chụp ảnh thực địa, đội ngũ khảo sát phải tuân thủ hướng dẫn kỹ thuật sau:
1. **Thiết bị:** Máy ảnh mirrorless/DSLR cảm biến Full-frame hoặc máy ảnh film 35mm chuyên nghiệp. Hạn chế dùng điện thoại nếu góc máy bị méo hoặc khử nhiễu bệt màu.
2. **Tiêu cự:** Ưu tiên ống kính 28mm hoặc 35mm để lấy được tỷ lệ người và ngõ chân thực nhất. Không dùng ống mắt cá (fish-eye) làm biến dạng di tích.
3. **Màu sắc & Tone mood:** Tôn trọng màu sắc tự nhiên của Hà Nội — vôi vàng cũ, rêu phong ẩm, gạch thẻ mộc, cửa gỗ xanh lá hoặc chàm. Không áp filter màu lạnh hoặc tương phản gắt kỹ thuật số.
4. **Định dạng bàn giao:** File gốc RAW + File xuất bản JPEG sRGB, tỷ lệ 4:3 và 16:9, độ phân giải tối thiểu 2048px cạnh dài, dung lượng nén tối ưu $\le 350\text{ KB}$/ảnh.

---

## 5. Mục Bắt buộc: Việc Cần Anh Quyết / Việc Anh Tự Làm

### A. Việc cần anh quyết (User Decisions Required)

1. **Phê duyệt Bảng Phân hạng Ưu tiên Tư liệu (P0 / P1 / P2):**
   - *Câu hỏi:* Anh có đồng ý với danh mục phân hạng ưu tiên chụp ảnh thực địa trên không? (Tập trung Giai đoạn 1 vào 5 điểm nhạy cảm bản quyền và di tích quốc gia).
   - *Lựa chọn:* Duyệt lộ trình 3 giai đoạn để chuẩn bị nhân sự/thiết bị đi khảo sát.

2. **Chính sách hiển thị tạm thời cho 4 ảnh Google Maps trong lúc chờ chụp thực địa:**
   - *Phương án A (Khuyến nghị cho Demo):* Tiếp tục giữ hiển thị 4 bức ảnh này trong bản build nội bộ, nhưng bổ sung nhãn disclaimer minh bạch: *"Ảnh khảo sát nội bộ — Đang chờ thay thế ảnh thực địa"*.
   - *Phương án B (Nghiêm ngặt):* Chuyển ngay 4 điểm này sang dùng `HeritageSketchPlaceholder` cùng đợt với 9 trạm thiếu ảnh.

---

### B. Việc anh tự làm (User Manual Actions)

1. **Bố trí thời gian hoặc nhân sự thực hiện Đợt Khảo sát 1 `[ngoài plan]`:**
   - Cần một buổi sáng (khoảng 2–3 tiếng từ 7:30 đến 10:30) đi bộ qua Ngõ Gạch, Ngõ Trung Yên, Ngõ Tạm Thương và Ngõ Phất Lộc để bấm máy 5 điểm P0 theo đúng góc máy đã hướng dẫn ở Mục 2.1.
   - *Hậu quả nếu chưa làm:* Ứng dụng tiếp tục phải dùng Thẻ Ký Họa hoặc ảnh Google Maps chưa có bản quyền, chưa thể nghiệm thu phát hành công chúng.
