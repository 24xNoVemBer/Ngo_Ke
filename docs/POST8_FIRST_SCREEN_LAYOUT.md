# Điều chỉnh bố cục màn mở đầu — 20/10/2026

Người dùng yêu cầu xem lại skill thiết kế và chỉnh bố cục màn đầu; đã cho quyền triển khai không hỏi lại. Phạm vi mặc định là `PrologueScreen` (logo và nút BẮT ĐẦU DẠO NGÕ), là màn mở đầu thật. Câu hỏi làm rõ màn chọn ngõ đã gửi bất đồng bộ; nếu có trả lời mới thì điều chỉnh đúng phạm vi đó. W1 sở hữu brief/review; W2 Antigravity giữ quyền sửa app/test app, không đổi model đã cấu hình.

## Nhận xét và hướng chỉnh

- Hiện `page.justifyContent = space-between` phân phối bốn khối ngôn ngữ/eyebrow/brand/action riêng: khoảng trống giữa các khối thay đổi theo chiều cao, làm dòng dẫn rời thương hiệu. Gom thành ba vùng rõ: điều khiển ngôn ngữ ở trên, lời dẫn + logo + tên + mô tả trong một cụm giữa, CTA và hướng dẫn ở dưới.
- Dùng nhịp cách 8/16/24/32dp, giới hạn bề rộng nội dung trên tablet; giữ ảnh nền, màu thương hiệu và logo thật hiện có. Tên ứng dụng là điểm nhấn chính, câu dẫn hỗ trợ, CTA có vùng thoáng riêng. Không thêm nội dung/ảnh/font/dependency hoặc tính năng.
- Thiết kế lại bộ chọn ngôn ngữ: thay vì đặt ở góc trên phải và dùng hộp thoại native Alert (bị phản hồi xấu và thô), chuyển thành một nút viên thuốc kính mờ (glassmorphism pill) tinh tế, cân đối ở trục giữa trên cùng (top-center). Khi bấm, mở bảng chọn ngôn ngữ in-app (Bottom Sheet / Modal Dialog) đồng điệu với thẩm mỹ "Sổ tay ngõ phố" (nền sẫm #1E241D, viền vàng đồng #B9A589, có tay cầm kéo, nút đóng 44x44, hai thẻ chọn minHeight 58dp với huy hiệu dấu tích SVG vàng nổi bật, không phụ thuộc màu sắc đơn thuần). Tách bạch thứ bậc thị giác: bộ chọn ngôn ngữ là tiện ích thứ cấp, không cạnh tranh thị giác với nút CTA chính "BẮT ĐẦU DẠO NGÕ" (xanh ngọc trầm #2D5748, minHeight 56dp). Đảm bảo touch target >=48dp, safe area, Dynamic Type không bị cắt chữ.
- Cập nhật âm thanh nút bắt đầu: thay thế âm thanh tiếng mở cửa gỗ cũ bằng tiếng MỘT giọt nước rơi từ trên cao xuống mặt nước trong không gian tĩnh lặng. Trích xuất đúng âm rơi đầu tiên từ bản thu Pixabay "water drop" của freesound_community theo yêu cầu người dùng (asset PCM WAV `mobile/assets/sounds/prologue_waterdrop.wav`, 45.9 KB, 520ms, 44.1 kHz 16-bit mono), có âm tõm/plop trong trẻo, hơi trầm, dư vang tự nhiên êm dịu, đồng điệu với hiệu ứng gợn sóng nước kim loại (water ripple waves) và nhịp điệu mở đầu hành trình. Thời lượng 520ms hoàn toàn nằm trọn trong 620ms delay điều hướng, không bị ngắt cụt đuôi vang.
- Layout có safe area, tự cuộn khi màn thấp/landscape hoặc fontScale2; không absolute-position nội dung, không đoán chiều cao chữ. Màn cao có khoảng thở cân đối, màn thấp giảm khoảng trống trước khi phải cuộn. Ảnh nền và scrim phải giữ chữ rõ.

## Skill đã rà

Đã đọc `C:/Users/LEGION/.codex/skills/ui-ux-pro-max/SKILL.md`, `references/pro-rules.md`, `C:/Users/LEGION/.codex/skills/frontend-checklist-global/SKILL.md`, `motion-design` và `ponytail`. Áp dụng UI/UX Pro Max theo React Native hiện có. Query đầu về hierarchy/safe area trả nhiều kết quả Web/Form không khớp nên không dùng làm căn cứ; retry `mobile touch target --domain ux` trả đúng Touch Target Size/Touch Spacing Mobile, `useWindowDimensions --stack react-native` trả đúng responsive dimensions. Nguyên tắc hierarchy/spacing/safe area dùng bảng ưu tiên và pro-rules của skill. Front-End Checklist thiên HTML/SEO nên không áp quy tắc DOM vào màn native; chỉ giữ stance kiểm chứng và finding cụ thể. Không cài skill mới. Motion-design dùng để kiểm việc chỉnh bố cục không làm mất reduced-motion và hiệu ứng đã có.

## Hợp đồng và nghiệm thu

W2 chỉ sửa PrologueScreen và test liên quan, thêm report ngắn nếu cần. LandingScreen chỉ mở khi user làm rõ yêu cầu; không sửa audio/catalogue/data/backend/QR/GPS. Bảo toàn logic start/reentry/blur/background/async seek/620ms/fade/cancel/reduced-motion, asset cue và toàn narration byte-exact. W2 commit cục bộ gọn, không merge/push/publish/store, không đụng main workspace. Candidate chỉ nhận cherry-pick đã review. Coordinator tiếp tục vòng cập nhật preview iOS cùng project/branch theo yêu cầu deploy rõ ràng trước đó của user, sau review/test/native/export đạt; quyền này không mở store, public backend hoặc nhánh phát hành khác. Đính chính câu hạn chế publish ở bản brief đầu: không tự tạo thêm cửa duyệt khi quyền deploy preview đã có trong phiên.

Kiểm app tests/tsc/lint; test có ý nghĩa cho locale switch, CTA navigation và sizing lớn, không chỉ snapshot style. Coordinator kiểm native nếu thiết bị/emulator khả dụng: màn nhỏ375dp và màn thường, fontScale1 và2, VI/EN, portrait/landscape, CTA và ngôn ngữ không chồng/cắt, cuộn tới CTA được. Không gọi render test hoặc bundle là bằng chứng native. Ghi rõ phần chưa kiểm.

## Việc cần anh quyết / việc anh tự làm

- Cần quyết: không có cửa duyệt triển khai thêm; câu làm rõ phạm vi là tùy chọn, mặc định màn logo đầu tiên.
- Cần tự làm: xem bố cục trên iPhone thật để đánh giá cảm nhận khi có bản preview; không coi là đã kiểm trong môi trường Windows.
