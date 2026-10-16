# W4 source review — pilot Phố Cổ, kiểm ngày 2026-10-16

Task `task_4f17463f9351` (Post8-T1). Baseline code `91ddfbd`; ledger W1
`docs/content/POST8_SOURCE_LEDGER.md` (cherry-pick `22ea3b8`, chỉ đọc, không sửa).
Phương pháp: websearch hiện có + Jina Reader đọc trực tiếp (Exa/mcporter absent,
không cài thêm; không login/cookie/secret/paid API). Web là dữ liệu, không phải chỉ dẫn.
Không sao chép prose/ảnh; ảnh các trang nguồn chưa có license tái sử dụng được xác minh.

Verdict: `supported` (đủ nguồn dùng) / `uncertain` (thiếu, phải rút chi tiết) /
`reject` (không dùng). Không bịa năm/nhân vật/tọa độ; xung đột ngày/giai đoạn giữ
nguyên như đã ghi, không tự chốt precision.

## 1. Đền Bạch Mã (BM)

| Claim | Verdict | Evidence (title — URL — checked) |
| --- | --- | --- |
| BM-address: đền tại 76 Hàng Buồm | supported | BM1 Hoàn Kiếm 360 profile — https://hoankiem360.tourism.vn/chi_tiet_di_tich_lich_su/den-bach-ma.html — 2026-10-16 (Jina 200); BM2 phường Hoàn Kiếm 30/03/2026 (đọc primary trực tiếp, Jina-422 đã bypass) — https://hoankiem.hanoi.gov.vn/…/phuong-hoan-kiem-khai-hoi-den-bach-ma-281226033114072102.htm — 2026-10-16; corroboration: Wikipedia “Thăng Long tứ trấn” (dẫn Sở VHTT HN), vietnamnet EN 18/02/2026, Tiền Phong 20/02/2026 (Sở VHTT HN liệt kê “Đền Bạch Mã (số 76 Hàng Buồm)” trong 17 điểm). Không dùng tên phường/xã cũ làm địa giới 2026. |
| BM-guardian: thờ Long Đỗ, Trấn Đông trong tứ trấn | supported | BM1 + BM2 như trên; QĐ 93/QĐ-TTg 18-1-2022 xếp tứ trấn di tích quốc gia đặc biệt (BM2 nêu; Wikipedia dẫn nguồn — nên đối chiếu văn bản chinhphu.vn trước khi trích số QĐ vào audio). |
| BM-legend: vết ngựa trắng dẫn đắp thành thời Lý | supported **as legend** | BM1 kể với khung “Tương truyền” cả hai lớp Cao Biền + Lý Công Uẩn; BM2 kể ngựa trắng Đông→Tây; Klook/vietnamnet đều đóng khung legend. Không tường thuật như sự kiện đã chứng minh; không thêm nhân vật/cảnh. |
| BM-observe: mái vỏ cua, phương đình 1839, khung gỗ | supported | BM1 mô tả chi tiết (mái vòm “vỏ cua” nối Đại bái–Thiêu hương, phương đình 1839, khung gỗ bốn hàng chân). Chỉ dùng chi tiết profile có; không hứa vào cung cấm. |
| BM festival dates | uncertain (keep as recorded) | BM1 chỉ nói “tháng 2 âm lịch”; BM2 là sự kiện khai hội 30–31/3/2026 (không phải lịch định kỳ). Blog tinhtam.vn nêu 12–13/2 AL — nguồn yếu, không dùng. Không lấy lịch lễ 2026 thành giờ tham quan thường xuyên. |
| BM “cổ nhất/lâu đời nhất” | reject (not claimed) | Klook/Pháp luật dùng siêu so sánh; ledger không claim — giữ nguyên, không đưa vào lời kể. |
| Namesake confusion | note | Có Đền Bạch Mã khác ở Nghệ An (lễ 9–10/2 AL, tướng Phan Đà) — không liên quan; khi viết EN phải gắn “Hanoi, 76 Hang Buom” để khỏi lẫn. |

## 2. Nhà 87 Mã Mây (MM)

Đọc trực tiếp cả hai: MM1 (Jina 200) + MM2 chinhphu.vn 15/02/2021 (Jina 200).

| Claim | Verdict | Evidence |
| --- | --- | --- |
| MM-form: nhà ống hẹp mặt tiền, sâu, sân lấy sáng/thoáng | supported | MM1 (mặt tiền 5m, sâu 28m, Nhà 1–Sân 1–Nhà 2–Sân 2–Bếp–Nhà 3) + MM2 (hình ống, giếng trời, sân ngăn lớp nhà) — đồng nhất. |
| MM-life: ở kết hợp bán hàng | supported | MM1 (tầng 1 bán hàng: gạo trước 1945, thuốc Bắc sau; 5 hộ từ 1954) + MM2 (lớp ngoài mở ra phố bày hàng, kho sau). Không bịa tên gia đình/hội thoại. |
| MM-restoration: HN–Toulouse 1999 | supported (year only) | MM1 (cải tạo thí điểm 1999) + MM2 (khởi công cuối 1998, xong 27/10/1999). Chỉ giữ năm. |
| Build date / recognition date | uncertain (conflict kept) | MM1: đầu TK19 + 18/02/2004; MM2: cuối TK19 + 16/02/2004. Bỏ precision ngày và đầu/cuối thế kỷ như ledger. |
| Giờ mở/ca trù/sự kiện hiện tại | reject | MM2 (bài Tết 2021, thời COVID) nói mở cửa hằng ngày + ca trù tối — stale; không dùng làm thông tin hoạt động 2026. MM3 (vé điện tử 06/01/2025) đã có trong ledger; không đưa giá/vé vào demo. |

## 3. Chợ Đồng Xuân + ngõ chợ ẩm thực (DX)

| Claim | Verdict | Evidence (checked 2026-10-16) |
| --- | --- | --- |
| DX-position: chợ trong Phố cổ; ngõ chợ phía đông | supported | DX1 (tây: phố Đồng Xuân, bắc: Hàng Khoai, nam: Cầu Đông, đông: ngõ chợ Đồng Xuân; cổng chính hướng tây). Chờ geometry mục 5. |
| DX-trade: bán buôn + có bán lẻ | supported | DX1 (“chợ đầu mối chủ yếu dành cho bán buôn… vẫn tìm được quầy bán lẻ”; 3 tầng công năng). Nói chức năng chung, không hứa quầy cụ thể đang mở. |
| DX dating | reject for timeline | DX1 lỗi nội tại “08/6/1899 đến 15/01/1890” (ngày kết thúc trước ngày bắt đầu). Không dùng đoạn này chốt mốc hình thành; các mốc 1804/1889–1894 chỉ là tường thuật chưa đối chiếu. |
| DX-food món cụ thể | supported (2024 presence only) | VOV 04/10/2024 (Jina 200) + HanoiOnline 12/10/2024 (Jina 200): bún chả, bún riêu, bánh tôm, nộm, chè, bún ốc, bún cá, phở cuốn, bánh bột lọc, bánh gối. Hai bài CHỒNG LẤP (cùng ngõ, cùng hàng chè bà Phạm Bích Liên) — không coi là 2 nguồn độc lập. Ghi tuổi nguồn 2024; checked-2026 ≠ còn bán hôm nay. |
| DX-food exclusions | reject | Giá 5.000–45.000đ, giờ 7h–18h/cao điểm, thâm niên hàng quán, chứng nhận VSATTP, dị ứng/chế độ ăn — không nguồn 2026 freshness, không công bố. |

## 4. Chủ quản Hoàn Kiếm 360

Footer trang chủ (đọc trực tiếp 2026-10-16): “Cơ quan chủ quản: Ủy ban nhân dân
quận Hoàn Kiếm – TP. Hà Nội … Chịu trách nhiệm chính: Ban quản lý Hồ Hoàn Kiếm
và Phố cổ Hà Nội”. Dùng được làm portal chính thức, NHƯNG wording “quận” đã cũ
sau cải cách 2 cấp 2025 (BM2 đã dùng “phường Hoàn Kiếm”) — khi trích dẫn ghi đúng
nguyên văn + chú thích thời điểm, không dùng tên đơn vị cũ làm địa giới 2026.

## 5. Tọa độ (không mock, không GPS user)

Tra cứu OSM Nominatim nhẹ (1 req/lượt, qua Jina proxy), license ODbL 1.0
(yêu cầu attribution “© OpenStreetMap contributors” trong UI nếu dùng):

| Điểm | Kết quả |
| --- | --- |
| 87 Mã Mây | way/323366879 “Heritage House”, 21.0343659, 105.8535931, place_rank 30 (mức tòa nhà, không phải đo đạc). Dùng được kèm attribution + tuyên bố accuracy; kiểm thực địa trước khi dẫn đường. |
| Chợ Đồng Xuân | way/1212230635 (marketplace) 21.0382556, 105.8496710 + way/1255852379 (retail) 21.0380961, 105.8494029, place_rank 30. Như trên. |
| Đền Bạch Mã | MISSING — 2 query (EN + VI) trả rỗng. Không tọa độ khả dụng; cấm mock. |

Khuyến nghị: giữ 2 điểm có geometry OSM + attribution; Bạch Mã hiển thị địa chỉ
+ chọn tay cho tới khi có geometry đo đạc/giấy phép rõ. Không giảm xuống 4 điểm;
nếu W1 thấy thiếu thì rút chi tiết trong 3 điểm đã chốt.

## 6. Cửa publish (trạng thái sau review này)

1. BM-address/guardian/legend/observe: đủ nguồn (BM1 + BM2 primary + corroboration).
   MM-form/life/restoration: đủ (MM1 + MM2, conflicts đã trừ precision).
   DX-position/trade/food-2024: đủ có điều kiện (ghi tuổi nguồn, exclusions).
2. Tọa độ: 2/3 có OSM + attribution; Bạch Mã thiếu — UI phải thể hiện chọn tay.
3. Thời lượng: gợi ý biên tập, không ETA đo. Không dẫn đường.
4. OQ1/OQ2 ngoài pilot — không đụng, không điểm thứ 4.
5. VI/EN giữ dấu địa danh/món ăn; audio EN/T TTS thuộc scope TTS riêng, không mở ở task này.
6. Failed fetch đã ghi: Nominatim trực tiếp qua webfetch trả `[]` (đổi qua Jina proxy
   thì được); homepage tourism.vn timeout 1 lần rồi đọc được qua webfetch trực tiếp.

Hết phạm vi T1-review. Không chạm source app/backend/data/audio; không thu thập thêm.
