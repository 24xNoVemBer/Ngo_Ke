# Đánh giá thiết kế màn Landing — theo 10 nguyên tắc Dieter Rams

Ngày 22/10/2026. Người yêu cầu: người dùng (gọi trực tiếp Claude). Chỉ review, không sửa code. Chưa commit.

## Phạm vi và giới hạn (viết thẳng)
- Đối tượng: `mobile/src/screens/LandingScreen.tsx` + ảnh chụp iPhone ngày 22/10 (13:07).
- Người dùng chính: khách đi bộ phố cổ, mở app để chọn một con ngõ. Tác vụ chính: chọn ngõ rồi vào Home.
- Lệch so với skill `design-is`: không chạy subagent và không tạo thư mục `DESIGN-IS-*`. Tôi tự đọc code và ảnh chụp, gộp 5 tệp vào một tệp này vì chỉ có một màn.
- Chưa đo: kích thước JS, thời gian tương tác, độ tương phản bằng công cụ đo trên máy. Các số tương phản dưới đây là **ƯỚC TÍNH** từ giá trị scrim trong code, tính cho điểm ảnh sáng nhất (trường hợp xấu nhất).

## Bằng chứng chính
| # | Quan sát | Nguồn |
|---|----------|-------|
| E1 | Ảnh nền phố cổ tràn viền, nhiều chi tiết (cờ đỏ, dây điện). Scrim chỉ 44%. Chữ đặt thẳng lên ảnh. | `LandingScreen.tsx:72-78, 524-527` |
| E2 | Chữ trắng trên điểm sáng nhất sau scrim 0,44: nền ≈ xám 151, tương phản ≈ 2,9:1 (ước tính, dưới 4,5:1). Chữ vàng `#D4AF37` trên cùng nền ≈ 1,4:1. | `:526, 607, 630, 701` |
| E3 | Thẻ ngõ dùng chính ảnh phố cổ làm cover, scrim 45%. Thẻ nhìn gần giống nền nên thẻ không tách khỏi nền. Chữ "Hoan Kiem, Hanoi" (vàng 11 px) khó đọc trong ảnh chụp. Nguồn `coverPhoto` của từng thẻ chưa kiểm. | `:217-218, 655-658, 697-702`; ảnh chụp |
| E4 | Nút "DEMO" ở header mở modal Sổ tay, không đổi chế độ. Nhãn mô tả trạng thái, hành vi là mở menu. | `:112-120` |
| E5 | Chữ "Demo/mô phỏng" xuất hiện 4 lần trên một màn: nút DEMO, banner xanh, `· Demo` ở meta thẻ, nhãn `Simulated`. Khóa dịch của banner vẫn tên `soundscape_banner` dù nội dung là "Text stories". | `:119, 125-129, 234-239` |
| E6 | Sổ tay mở được từ 2 chỗ (nút DEMO và thẻ Notebook). "Notebook", "Alley Passport" và "Journey & Tools" là ba tên cho nhóm tính năng chồng nhau. | `:116, 298, 347` |
| E7 | Hai thẻ tiện ích không cùng chiều cao: "GPS Location" xuống dòng 5 dòng, "Notebook" 2 dòng. Không giới hạn số dòng. | `:285-289, 745-762`; ảnh chụp |
| E8 | Ba khối kem xếp liền (2 tiện ích, quote, passport) cùng trọng lượng thị giác. Quote không là tác vụ nào, chỉ là khẩu hiệu "Preserving Old Quarter Soul". | `:316-361, 791-872` |
| E9 | Cỡ chữ 9, 9.5, 10, 11, 11.5, 12 px rải khắp. Chữ đoạn văn 11-12 px. | `:671, 725, 781, 824, 866, 955, 993` |
| E10 | Vùng chạm nhỏ: "See all" cao khoảng 25 pt (padding 4, không `hitSlop`); nút đóng Passport 32×32. | `:618-622, 909-916` |
| E11 | Nút tròn xanh có biểu tượng bánh răng ở góc trên phải **không có trong mã nguồn** (đã tìm `settings/gear/cog`). Nhiều khả năng là lớp nổi của Expo Go. Chưa xác minh. | grep `mobile/src`; ảnh chụp |
| E12 | Nút ngôn ngữ ghi ngôn ngữ **hiện tại** ("EN" khi đang là tiếng Anh); người đọc dễ hiểu là nút "chuyển sang EN". Nhãn đọc của trình đọc màn hình thì đúng. | `:101-111` |
| E13 | Có sẵn trạng thái live: loading, error, empty, retry, disabled. | `:153-183` |
| E14 | 5 hiệu ứng vào màn xếp tầng (không lặp khi nghỉ). Việc có tôn trọng "reduce motion" hay không chưa kiểm. | `:63-67` |

## Bảng điểm (0–3, tiêu chí điểm theo skill, nguyên tắc lấy điểm thấp khi phân vân)
| # | Nguyên tắc | Điểm | Lý do ngắn |
|---|-----------|------|-----------|
| 1 | Đổi mới | 1 | Banner + carousel thẻ + lưới công cụ là mẫu quen; cái riêng nằm ở Home (đường mòn), không ở Landing. |
| 2 | Hữu ích | 2 | Chọn ngõ làm được ngay, nhưng 3 khối phụ chen giữa và "See all" quá nhỏ (E8, E10). |
| 3 | Thẩm mỹ | 1 | Ảnh nền ồn, kính tối + kem + vàng + xanh lá cùng lúc; một vi phạm chói là chữ trên ảnh (E1-E3). |
| 4 | Dễ hiểu | 1 | Nút DEMO, nút EN, tên Notebook/Passport và nút bánh răng đều mơ hồ (E4, E6, E11, E12). |
| 5 | Kín đáo | 1 | Nền và quote cạnh tranh với nội dung chính; thẻ không nổi khỏi nền (E3, E8). |
| 6 | Trung thực | 2 | Công khai "mô phỏng" tốt, nhưng nhãn DEMO sai hành vi (E4) và khẩu hiệu thổi phồng nhẹ (E8). |
| 7 | Bền | 2 | Kính mờ trên ảnh + viền vàng là dấu vết kiểu thời thượng. |
| 8 | Chu đáo | 2 | Có trạng thái loading/error/empty (E13); thiếu đều tay ở vùng chạm, giới hạn dòng, tương phản (E7, E9, E10). |
| 9 | Tiết kiệm | 2 (tạm) | Chưa đo JS; chưa kiểm reduce-motion (E14). Điểm tạm, không phải kết quả đo. |
| 10 | Càng ít càng tốt | 1 | Bỏ được: banner, pretitle ×2, quote, nút DEMO trùng, thẻ Passport/Notebook trùng, ít nhất 5 phần tử (E5, E6, E8). |

**Tổng 15/30.** Theo quy tắc cơ học của skill (dưới 20), kết luận là **REDESIGN, phạm vi chỉ màn Landing**. Hạ tầng bên dưới giữ nguyên: dữ liệu bộ sưu tập, trạng thái live, i18n, điều hướng, logo, màu thương hiệu. Đây là bố cục lại một màn, không phải làm lại ứng dụng.

## Phản hồi theo yêu cầu: các phần chưa ổn
1. **Hình nền và độ tương phản.** Ảnh phố cổ chi tiết dày chạy sau toàn bộ chữ; scrim 44% không đủ. Ước tính trường hợp xấu nhất: chữ trắng ≈ 2,9:1, chữ vàng ≈ 1,4:1. Ảnh nền lại trùng với ảnh cover của thẻ nên thẻ chìm vào nền.
2. **Navigator chưa gọn.** Điều hướng rải ở 6 chỗ: pill EN, pill DEMO (thực chất mở Sổ tay), "See all", thẻ GPS, thẻ Notebook, thẻ Passport. Hai chỗ mở cùng một modal. Ba tên gọi chồng nhau. Banner "Demo" nằm ngay dưới nút DEMO.
3. **Phân cấp yếu.** Không có một điểm nhấn chính. Cuộn xuống là ba khối kem cùng vai, trong đó quote không phục vụ tác vụ nào.
4. **Chi tiết.** Thẻ tiện ích lệch chiều cao; chữ 9-11 px quá nhiều; "See all" và nút đóng dưới 44 pt; nút bánh răng xanh lạc tông (nếu là của Expo Go thì chỉ là nhiễu khi demo).
5. **Trải nghiệm.** Người dùng phải cuộn mới thấy công cụ; 2 thẻ ngõ chiếm gần nửa màn nhưng cover gần giống nhau nên khó phân biệt ngõ nào là ngõ nào trong nháy mắt.

## Đề xuất sửa (theo ưu tiên, mỗi mục gắn nguyên tắc và bằng chứng)
1. **Nền: làm mờ + tối đều, để thẻ là điểm nhấn** (#3, #5; E1-E3). Ảnh nền dùng `blurRadius` ~14 và scrim đồng nhất ~0,68. Ước tính trường hợp xấu nhất khi đó: chữ trắng ≈ 6,5:1. Ảnh nét chỉ nằm trong thẻ ngõ, mỗi ngõ một ảnh riêng. Không thêm dependency (RN `Image` có `blurRadius`).
2. **Chữ trên ảnh: bỏ vàng ở nền, dùng khung đặc** (#3, #8; E2, E3). Chữ vàng chuyển vào dải đáy thẻ có nền đặc `rgba(20,22,16,0.78)` thay vì scrim 0,45 phủ toàn thẻ; ngoài thẻ dùng trắng 90%. Chữ nhỏ nhất 12 px (nhãn viết hoa 11 px cho phép).
3. **Header gọn hơn: một nút ngôn ngữ, một nút menu** (#4, #10; E4, E5, E6, E12).
   - Ngôn ngữ: nút phân đoạn `VI | EN`, ngôn ngữ đang chọn được tô sáng.
   - Menu: một nút "Sổ tay" (biểu tượng + chữ) mở modal hiện tại. Bỏ pill DEMO dạng nút. Chế độ Demo/Live chỉ là nhãn trạng thái, đổi chế độ nằm trong modal Sổ tay.
4. **Gộp trạng thái "mô phỏng" về một chỗ** (#6, #10; E5). Một dòng chữ thường dưới header: "Truyện chữ · nội dung mô phỏng". Bỏ banner xanh, bỏ `· Demo` ở meta thẻ (thẻ đã có nhãn `Simulated`). Đổi khóa i18n `landing.soundscape_banner` thành tên đúng nghĩa.
5. **Bớt khối, gộp tên gọi** (#10, #4; E6, E8).
   - Bỏ khối quote khỏi Landing (chuyển vào màn giới thiệu hoặc phần "Về Ngõ Kể").
   - Đưa Alley Passport vào trong modal Sổ tay (là tính năng con của Sổ tay).
   - Landing còn: header, dòng trạng thái, carousel ngõ, hai ô công cụ (GPS, Sổ tay). Mọi thứ nhìn thấy không cần cuộn trên iPhone cỡ thường.
6. **Hai ô công cụ đều nhau** (#8; E7). `alignItems: 'stretch'`, `minHeight` 72, tiêu đề 1 dòng, mô tả `numberOfLines={2}`, rút gọn chuỗi dịch ("Biết mình đang ở điểm nào").
7. **Vùng chạm tối thiểu 44 pt** (#8; E10). "See all" và nút đóng Passport/Notebook: `minHeight: 44`, `hitSlop`.
8. **Nút bánh răng xanh** (E11): xác minh có phải lớp nổi của Expo Go không (chạy bản build không dùng Expo Go, hoặc tắt menu nhà phát triển). Nếu có trong bản phát hành, bỏ nó.
9. **Làm rõ từng thẻ ngõ** (#4; E3). Mỗi ngõ một ảnh cover riêng (Ngõ Gạch và Ngõ Trung Yên đã có ảnh trong `mobile/assets/photos/alleys/`); đặt tên ngõ làm chữ lớn nhất trong thẻ.

### Việc cần người dùng quyết
- Nút DEMO/LIVE: giữ như nhãn trạng thái (đề xuất) hay cho đổi chế độ ngay trên Landing? Nếu chưa chốt: em làm theo đề xuất, đổi chế độ trong Sổ tay.
- Có bỏ khối quote và đưa Passport vào Sổ tay không? Đề xuất: có. Nếu chưa chốt: giữ nguyên hai khối, mọi sửa khác vẫn làm được.
- Nền mờ (đề xuất) hay nền màu đặc không ảnh?

### Việc cần người dùng tự làm
- Chụp màn Landing trên máy thật sau khi sửa, ở chữ cỡ lớn (fontScale 1.3 và 2.0) và chế độ sáng/tối; hiện chưa có bằng chứng ở các cỡ chữ đó.
- Xác nhận nút bánh răng xanh có xuất hiện khi chạy ngoài Expo Go không.

## Prompt `/make-plan` (REDESIGN, phạm vi Landing)
```
/make-plan Redesign the Landing screen of Ngõ Kể (mobile/src/screens/LandingScreen.tsx). Current design failed a Dieter Rams audit at 15/30 with critical gaps in principles #3 aesthetic, #4 understandable, #5 unobtrusive, #10 as little design as possible.

Verdict: the Landing screen scores 15/30 (below 20), so redesign the single screen from purpose (pick an alley fast); keep the data/live-state/i18n/navigation layers.

Why redesign and not refine: total is below 20 and #4 understandable scored 1 because the DEMO pill opens a menu, the EN pill shows current rather than target language, and Notebook/Passport/"Journey & Tools" overlap.

Preserve: brand tokens in src/theme and logo (NgoKeLogo); live-state card with retry/switch (LandingScreen.tsx:153-183); collection data and carousel pipeline (getLocalizedCollections, getBundledDataset); navigation targets (AlleySelect, Home, Location); NotebookDrawerModal.

Discard:
- Full-bleed sharp photo behind text with 44% scrim. Evidence: :72-78, :524-527. Failed #3/#5 (est. white 2.9:1, gold 1.4:1 worst case).
- DEMO pill as a button that opens the Notebook. Evidence: :112-120. Failed #4/#6.
- Green "Text stories" banner and "· Demo" in card meta (Demo/simulated shown 4 times). Evidence: :125-129, :234-239. Failed #10.
- Quote card and separate Passport teaser on Landing. Evidence: :316-361. Failed #10.

Top moves:
1. #3/#5: Blur the background (Image blurRadius ~14) with uniform scrim ~0.68; sharp photos only inside cards, one cover per alley (use mobile/assets/photos/alleys/ for Ngõ Gạch and Ngõ Trung Yên). Evidence: :72-78, :217-218.
2. #4/#10: Header = logo + VI|EN segmented control + one "Sổ tay/Notebook" menu button; mode shown as status text only, switching lives in the Notebook modal. Evidence: :101-121.
3. #10: Landing = header, one status line ("Text stories · simulated content"), alley carousel, two equal-height tool tiles (GPS, Notebook). Move Passport into the Notebook modal; drop the quote. Evidence: :125-129, :316-361.
4. #8: Min touch target 44pt for "See all" and modal close; equal tile heights with numberOfLines; min body text 12px. Evidence: :618-622, :909-916, :285-289.
5. #3: Move gold text off the photo into a solid card footer (rgba(20,22,16,0.78)); no gold on the background. Evidence: :630, :701.

Out of scope: Home trail screen, Qa, Camera, Location, backend, voice, new dependencies, restarting Metro 8082, commits/pushes.

Deliverables for the plan:
- New Landing wireframe vs current, side by side
- Token changes in one place (scrim, blur, font floor, touch target)
- i18n key changes (rename landing.soundscape_banner, shorten tile descriptions VI/EN)
- Tests: tile equal height/numberOfLines, 44pt targets, Passport reachable via Notebook, mode switch reachable via Notebook, VI/EN labels
- Device checks: fontScale 1.3/2.0, screenshot contrast sample, gear-button check outside Expo Go

Anti-patterns to avoid:
- Porting the old structure under new styling
- Keeping both layouts behind a flag
- Restyling for a trend rather than the audit
```

## Giới hạn của đợt review này
- Chưa chạy lại ứng dụng; dựa vào một ảnh chụp và một tệp nguồn.
- Độ tương phản chỉ là ước tính từ giá trị scrim, chưa đo trên điểm ảnh thật.
- Điểm #9 là tạm: chưa đo kích thước JS và chưa kiểm reduce-motion.
- Chưa mở `NotebookDrawerModal`, `HERO_PHOTO` và nguồn `coverPhoto` của các thẻ.
