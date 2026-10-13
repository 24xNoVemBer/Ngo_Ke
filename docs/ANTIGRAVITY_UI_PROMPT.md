# Prompt giao Antigravity — Ngõ Kể

Bạn là Art Director kiêm Senior React Native UI Designer. Hãy làm lại giao diện app **Ngõ Kể** theo hướng **“Sổ tay ngõ phố — ấm, giàu bản sắc, giàu hình ảnh thật”**.

Tôi muốn một ứng dụng có gu thị giác rõ ràng: cảm giác mở một cuốn sổ khám phá đời sống trong những con ngõ Việt Nam, với ảnh chụp đời thực và cách trình bày tinh tế. Giao diện phải đẹp ngay từ màn đầu, đồng thời đọc và thao tác tốt trên điện thoại. Đừng dừng ở việc thay màu cho các card cũ.

## 1. Bối cảnh và phạm vi

- Repo hiện tại: `E:/Project/Ngo_Ke/ngoke`. Đọc `AGENTS.md`, mục yêu cầu mới nhất trong `MEMORY.md`, `docs/UI_UX_REBUILD_PROPOSAL.md` và `docs/HANDOFF_UI.md` trước khi làm.
- Đây là **app native Expo + React Native cho Android/iOS**, không phải website. Giữ stack, cấu trúc dự án và React Navigation hiện có. Không chuyển sang React web, Next.js, HTML preview hoặc PWA.
- Đọc source và xem ảnh giao diện có sẵn; dùng source hiện tại làm chuẩn hành vi, vì ảnh cũ có thể khác build mới.
- Hướng thị giác đã chọn: **Sổ tay ngõ phố**. Không cần hỏi lại giữa các phong cách.
- Nhiệm vụ tập trung vào thiết kế thị giác và lớp trình bày. Các đề xuất đổi thuật toán, data schema hoặc hành vi nghiệp vụ trong bản review **chưa mặc nhiên được duyệt**. Tách rõ chúng để chốt nếu cần; không lén sửa cùng lúc làm đẹp UI.
- Thực hiện theo phạm vi được phép của repo. Trước khi sửa, nêu ngắn những file sẽ sửa/thêm; không xóa code hoặc viết lại toàn app.

## 2. Art direction — phải thể hiện bằng hình ảnh

**Ba từ khóa:** đời thường · giàu chất liệu · dễ khám phá.

Hãy nghĩ đến một tạp chí du ký đương đại về ngõ phố Việt Nam: ánh sáng tự nhiên trên bức tường, cửa gỗ cũ, chiều sâu của một con hẻm, quán nhỏ đang hoạt động, những chi tiết sinh hoạt bình dị. Có dấu vết thời gian nhưng không làm giả cổ quá mức. Có cảm xúc nhưng không rối.

- **Ảnh chụp là yếu tố thị giác chủ đạo.** Dành vị trí đủ lớn cho ảnh đẹp, crop có chủ đích, phối hợp nhịp nhàng với chữ và khoảng trắng.
- Nền giấy ấm, chữ mực trầm, xanh trầm làm màu hành động. Điểm nhấn gạch nung dùng rất ít.
- Tiêu đề có chất biên tập, nội dung và nút dễ đọc. Có thể phối serif đứng cho tiêu đề với sans cho body; tối đa hai họ font, phải kiểm đủ dấu tiếng Việt và giấy phép sử dụng.
- Tạo bản sắc bằng tỷ lệ ảnh/chữ, nhịp bố cục và chi tiết nhỏ. Không trang trí bằng hàng loạt nhãn viết hoa, số chương vô nghĩa hoặc icon đặt trong ô màu.
- Mỗi màn có bố cục phục vụ một việc: Home thiên về khám phá bằng ảnh, Plan gọn và rõ lựa chọn, câu chuyện có nhịp đọc, camera dành không gian cho preview. Không làm tất cả màn thành cùng một chồng card.

Palette khởi điểm, gom thành semantic tokens trong theme:

| Vai trò | Màu |
| --- | --- |
| Nền giấy | `#F7F2E8` |
| Mặt nội dung | `#FFFDF7` |
| Mực chính | `#2E3028` |
| Chữ phụ | `#626559` |
| Xanh hành động | `#2D5748` |
| Gạch nung | `#9C4F36` |

Có thể tinh chỉnh sắc độ khi xem ảnh thật và render native, nhưng giữ một hệ thống nhất quán. Không rải mã màu/cỡ chữ riêng trong từng component. Không cần dark mode trong lượt này.

## 3. Bắt buộc dùng ảnh chụp thật

**Bạn phải chủ động tìm, chọn và tích hợp ảnh chụp thật. Không chỉ viết tên ảnh, để khung trống hoặc bảo tôi tự tìm ảnh.**

1. Ưu tiên ảnh người dùng đã cung cấp trong repo. Nếu chưa đủ, tìm ảnh từ các thư viện ảnh có trang nguồn/tác giả và điều kiện sử dụng rõ ràng, hoặc kho tư liệu được phép sử dụng. Kết quả tìm kiếm chỉ là cách tìm nguồn, không phải bằng chứng về quyền dùng ảnh.
2. Chọn ảnh có nguồn gốc nhiếp ảnh rõ ràng. **Không dùng ảnh AI, hình minh họa thay ảnh, render 3D, ảnh có watermark, ảnh chụp lại màn hình, hoặc asset không xác minh được nguồn.** Nếu không đủ bằng chứng ảnh là ảnh chụp thật thì bỏ qua ảnh đó.
3. Chuẩn bị một bộ ảnh nhất quán gồm khoảng **1 ảnh mở đầu và 4–6 ảnh bổ trợ**: không gian ngõ, cửa/kiến trúc, quán nhỏ/ẩm thực, chi tiết đời sống. Có thể tái dùng ảnh hợp lý; không nhồi đủ số lượng bằng ảnh kém chất lượng.
4. Ưu tiên ngõ phố Việt Nam với bối cảnh xác định được từ nguồn. Không dùng ảnh Kyoto, phố cổ Trung Quốc hoặc địa điểm ở nước khác rồi trình bày như Việt Nam. Tránh ảnh landmark du lịch chỉ vì chúng nổi tiếng.
5. Chọn ánh sáng tự nhiên, chi tiết thật, màu trầm ấm vừa phải. Không phủ sepia/vàng nặng lên toàn bộ bộ ảnh; không kéo màu xanh đồng loạt làm ảnh mất tự nhiên.
6. **Dữ liệu app hiện gồm các điểm mô phỏng, chưa phải địa điểm thật.** Khi dùng ảnh chụp thật để minh họa cho điểm demo, phải ghi rõ gần ảnh: **“Ảnh minh họa · điểm mô phỏng”**. Ảnh thật không làm tên điểm, câu chuyện, tọa độ hoặc nguồn lịch sử trở thành thật.
7. Chỉ gọi ảnh là “ảnh tại điểm” nếu dữ liệu/source thực sự xác nhận đúng địa điểm đó. Không lấy ảnh đẹp rồi tự bịa địa danh, câu chuyện, tuổi công trình hay lời chứng của người dân.
8. Tải các asset được phép dùng vào thư mục như `mobile/assets/photos/`, kèm attribution đúng điều kiện nguồn. Resize/nén phù hợp kích thước hiển thị; giữ ảnh rõ trên màn hình mật độ cao. Không tải ảnh gốc nhiều MB không cần thiết, không hotlink URL ngẫu nhiên hoặc endpoint trả ảnh thay đổi.
9. Demo phải hiển thị được bộ ảnh từ bundle sau khi app được nạp; không phụ thuộc mạng để lấy ảnh mỗi lần mở màn. Nếu tên file/asset cần ánh xạ với điểm, đặt mapping ở lớp trình bày; chưa cần sửa schema dữ liệu.
10. Ghi `docs/IMAGE_SOURCES.md`: đường dẫn asset local, trang nguồn gốc, tác giả, giấy phép/điều kiện đã kiểm, credit cần hiển thị, vị trí dùng trong app và đó là ảnh đúng điểm hay ảnh minh họa. Không tự ghi “miễn phí bản quyền” khi chưa kiểm chứng.

Nếu mạng hoặc nguồn ảnh không truy cập được, báo đúng phần bị chặn. Dùng asset thật phù hợp đã có nếu có; không thay bằng AI hoặc giả vờ đã hoàn tất yêu cầu ảnh thật. Không đưa secret hoặc nội dung riêng của dự án vào truy vấn tìm ảnh.

## 4. Thiết kế từng màn

### Home — cảm giác muốn bắt đầu khám phá

- Header gọn: “Ngõ Kể”, trạng thái dữ liệu có thể đọc được nhưng không chiếm cả đầu màn.
- Một ảnh ngõ nổi bật có chiều sâu; tỷ lệ khoảng 4:3 hoặc crop ngang hợp bố cục. Ảnh lớn vừa đủ để tạo cảm xúc, không đẩy hành động bắt đầu xuống nhiều màn cuộn.
- Tên app không lặp lại thành nhiều tiêu đề. Có thể dùng câu mở ngắn **“Mỗi ngõ, một câu chuyện.”**; đây là copy dẫn nhập, không phải lời khẳng định lịch sử.
- Một CTA chính rõ: **“Bắt đầu khám phá”** hoặc **“Tiếp tục đọc”** nếu trạng thái hiện có cho phép. Hành động phụ: **“Chọn trải nghiệm”**.
- Danh sách điểm bên dưới có ảnh thật minh họa, tên điểm và thông tin ngắn từ dữ liệu hiện có. Trình bày như các mục trong sổ tay, không phải bảng quản trị.
- Bỏ “Phase”, “fixture”, đường dẫn file và mô tả triển khai khỏi nội dung chính. Giữ nhãn mô phỏng và đường xem thông tin nguồn; Demo/Live vẫn phải hiểu và điều khiển được.

### Chọn trải nghiệm — nhẹ, nhanh, rõ

- Hai nhóm dễ quét mắt: **“Bạn muốn khám phá gì?”** và **“Bạn có bao nhiêu thời gian?”**.
- Ba chủ đề có cá tính thị giác, có thể dùng ảnh crop nhỏ hoặc một hệ icon nhất quán. Không cần ba thẻ ảnh khổng lồ đẩy nhóm thời gian khỏi màn.
- Lựa chọn thời gian gọn, trạng thái chọn rõ bằng cả hình dạng/dấu chọn và màu. Phần nhập tự do là tùy chọn phụ nhưng vẫn tiếp cận được.
- Kết quả là các hàng/thẻ điểm có ảnh, tên, lý do và thời lượng. Một lớp chứa là đủ, không card trong card.
- Gợi ý tối đa ba điểm là các lựa chọn; không vẽ thành bản đồ/tuyến đi hoặc tự tính tổng hành trình khi core chưa hỗ trợ. Chưa được đổi bộ lọc thời gian thì không viết copy hứa kết quả đã nằm trong quỹ thời gian.

### Câu chuyện & hỏi đáp — nội dung đáng đọc

- Tên điểm là trọng tâm; ảnh mở đầu hỗ trợ bối cảnh, không che phần lời kể quá lâu.
- Văn bản có nhịp đọc thoáng, khoảng 16–18 đơn vị với line-height 24–28; tiêu đề có cá tính nhưng không dùng font viết tay khó đọc.
- Nguồn đặt gần nội dung, có thể mở chi tiết; thông tin mô phỏng không được giấu trong một màn khác.
- Câu hỏi gợi ý là các lựa chọn dễ chạm; đáp án mới phải dễ thấy. Ô nhập có label, không bị bàn phím che.
- Không dựng giao diện chatbot AI trả lời vô hạn; không thêm avatar AI lấp lánh, hiệu ứng đang suy nghĩ giả hoặc nguồn trích dẫn bịa.
- Chỉ dùng nội dung có sẵn đúng bối cảnh; thiếu nội dung thì thiết kế trạng thái trống tử tế. Giữ nguyên câu trả lời đã duyệt.

### Camera và người kể — sạch và có trọng tâm

- Preview là vùng chính lúc quét; hướng dẫn ngắn, khung quét nếu cần, lối “Chọn bằng tay” luôn rõ.
- Khi nhận mã, tên điểm và hành động xác nhận phải nổi bật. Đừng dùng overlay ảnh trang trí thay preview camera thật.
- Caption trên nền đủ tương phản, người kể không che chi tiết quan sát hoặc nút thao tác. Nếu chưa có asset nhân vật phù hợp, giữ biểu tượng tạm trung thực và trình bày đẹp; không dùng ảnh người bất kỳ như người kể có thật của địa điểm.
- Biến thể đọc chữ phải được chăm chút ngang với camera. Không có nút play/micro khi voice chưa được triển khai.

### GPS và các trạng thái phụ — nhất quán với toàn app

- Một candidate dễ đọc: tên điểm, khoảng cách/độ chính xác có dữ liệu, nhãn mô phỏng nếu phù hợp, xác nhận hoặc chọn tay.
- Empty, loading, lỗi mạng, thiếu cấu hình, QR lạ và từ chối quyền đều có bố cục và câu chữ đúng ngữ cảnh. Không dùng một màn đỏ báo lỗi cho mọi trường hợp.
- Với Live, phân biệt lấy từ máy chủ với nội dung thật/mô phỏng; không tự gắn huy hiệu “đã xác thực” chỉ vì request thành công.

## 5. Những lựa chọn thị giác cần tránh

- Không biến app thành landing page có hero → ba feature cards → CTA → footer.
- Không neon, tím gradient, glassmorphism, bóng đổ nặng hoặc bề mặt bo viên thuốc ở mọi nơi.
- Không nền texture nhiễu dưới đoạn chữ dài; không dùng font trang trí cho body/nút.
- Không bọc mọi nội dung vào card trắng giống nhau; không xếp hàng loạt nút xanh ngang cấp.
- Không dùng emoji làm icon chính; không trộn nhiều nét icon.
- Không phóng lớn chữ đến mức tên điểm/nút bị cắt. Cho nội dung thích ứng với chữ lớn, không khóa font scaling để bảo vệ layout.
- Không dùng cùng một ảnh cho mọi điểm, ảnh lỗi crop mặt người hoặc kéo giãn ảnh.
- Không dựng thanh trình duyệt, khung điện thoại giả hay notch giả trong màn app.
- Không thêm đăng nhập, tài khoản, điểm thưởng, yêu thích, thanh tab hoặc tính năng mới chỉ để bố cục trông đầy hơn.

## 6. Chất lượng thực thi và nghiệm thu

- Tái dùng token/component sẵn có; tạo component chung khi có lặp thực sự. Không cài UI framework lớn cho vài nút/thẻ ảnh.
- Giữ các hành vi đã có: Demo/Live tách biệt; Q&A có nguồn; QR chỉ nhận điểm đã biết; GPS không tự xác nhận; từ chối quyền vẫn chọn tay/đọc chữ được.
- Không để công việc trang trí gây gọi API thừa, bật quyền ngay lúc mở app hoặc giữ camera chạy khi rời màn.
- Nút chính tối thiểu 48 đơn vị, trạng thái pressed/selected/disabled/loading nhìn rõ, accessibility label/state phù hợp. Cảnh báo không dựa riêng vào màu.
- Ảnh có kích thước vùng hiển thị xác định để tránh layout nhảy; có nền dự phòng khi lỗi asset và mô tả truy cập khi ảnh mang thông tin. Crop theo từng ảnh, không áp một vị trí crop bất kể nội dung.
- Kiểm trên native ở màn nhỏ/lớn, chữ phóng lớn, hướng ngang ở màn liên quan, bàn phím mềm và safe area. Kiểm caption với preview sáng/tối.
- Chạy test, typecheck, lint và các kiểm tra native phù hợp với phần đã đổi. Nêu riêng phần không có thiết bị để kiểm. Không coi screenshot mockup hoặc xuất bundle là đã chạy thật trên iPhone.

## 7. Cách làm và bàn giao

1. Đọc repo, xác nhận phạm vi được phép và chọn ảnh thật trước khi hoàn thiện bố cục. Giải thích ngắn art direction và bộ ảnh bằng quyết định cụ thể, không một bài lý thuyết dài.
2. Dựng ba màn đại diện trước: **Home, Chọn trải nghiệm và Câu chuyện/Q&A**. Kiểm bằng render native để khóa chữ, crop ảnh và khoảng trắng; sau đó áp dụng nhất quán lên các màn còn lại trong phạm vi được phép.
3. Tự review: nếu che tên app đi mà giao diện vẫn giống một mẫu app chung chung, hãy chỉnh lại cách dùng ảnh, typography và nhịp nội dung. Bản sắc phải nằm ở thiết kế, không chỉ ở logo.
4. Bàn giao code đã nối vào app, screenshot native thực tế, danh sách file đổi, `docs/IMAGE_SOURCES.md`, kết quả kiểm tra và các vấn đề hành vi nằm ngoài scope. Nếu chưa thể chạy native, ghi rõ và không dùng ảnh thiết kế giả làm bằng chứng chạy app.

**Kết quả tôi muốn:** mở Ngõ Kể lên là thấy một cuốn sổ khám phá ngõ phố Việt Nam giàu cảm xúc, có ảnh chụp thật đẹp và đúng nguồn; biết ngay thao tác tiếp theo; đọc chuyện thoải mái. Hãy dành công sức cho lựa chọn ảnh, bố cục, typography và chi tiết tương tác — không chỉ đổi màu giao diện cũ.
