# Điều chỉnh bố cục màn mở đầu — 20/10/2026

Người dùng yêu cầu xem lại skill thiết kế và chỉnh bố cục màn đầu; đã cho quyền triển khai không hỏi lại. Phạm vi mặc định là `PrologueScreen` (logo và nút BẮT ĐẦU DẠO NGÕ), là màn mở đầu thật. Câu hỏi làm rõ màn chọn ngõ đã gửi bất đồng bộ; nếu có trả lời mới thì điều chỉnh đúng phạm vi đó. W1 sở hữu brief/review; W2 Antigravity giữ quyền sửa app/test app, không đổi model đã cấu hình.

## Nhận xét và hướng chỉnh

- Hiện `page.justifyContent = space-between` phân phối bốn khối ngôn ngữ/eyebrow/brand/action riêng: khoảng trống giữa các khối thay đổi theo chiều cao, làm dòng dẫn rời thương hiệu. Gom thành ba vùng rõ: điều khiển ngôn ngữ ở trên, lời dẫn + logo + tên + mô tả trong một cụm giữa, CTA và hướng dẫn ở dưới.
- Dùng nhịp cách 8/16/24/32dp, giới hạn bề rộng nội dung trên tablet; giữ ảnh nền, màu thương hiệu và logo thật hiện có. Tên ứng dụng là điểm nhấn chính, câu dẫn hỗ trợ, CTA có vùng thoáng riêng. Không thêm nội dung/ảnh/font/dependency hoặc tính năng.
- Giữ min touch target48dp cho hai lựa chọn ngôn ngữ, khoảng cách tối thiểu8dp, selected semantics và phản hồi nhấn. CTA minHeight56, chữ được xuống dòng và vẫn có đủ khoảng cho sóng ngoài nút. Text scaling không bị tắt hoặc cắt bằng fixed height/numberOfLines.
- Layout có safe area, tự cuộn khi màn thấp/landscape hoặc fontScale2; không absolute-position nội dung, không đoán chiều cao chữ. Màn cao có khoảng thở cân đối, màn thấp giảm khoảng trống trước khi phải cuộn. Ảnh nền và scrim phải giữ chữ rõ.

## Skill đã rà

Đã đọc `C:/Users/LEGION/.codex/skills/ui-ux-pro-max/SKILL.md`, `references/pro-rules.md`, `C:/Users/LEGION/.codex/skills/frontend-checklist-global/SKILL.md`, `motion-design` và `ponytail`. Áp dụng UI/UX Pro Max theo React Native hiện có. Query đầu về hierarchy/safe area trả nhiều kết quả Web/Form không khớp nên không dùng làm căn cứ; retry `mobile touch target --domain ux` trả đúng Touch Target Size/Touch Spacing Mobile, `useWindowDimensions --stack react-native` trả đúng responsive dimensions. Nguyên tắc hierarchy/spacing/safe area dùng bảng ưu tiên và pro-rules của skill. Front-End Checklist thiên HTML/SEO nên không áp quy tắc DOM vào màn native; chỉ giữ stance kiểm chứng và finding cụ thể. Không cài skill mới. Motion-design dùng để kiểm việc chỉnh bố cục không làm mất reduced-motion và hiệu ứng đã có.

## Hợp đồng và nghiệm thu

W2 chỉ sửa PrologueScreen và test liên quan, thêm report ngắn nếu cần. LandingScreen chỉ mở khi user làm rõ yêu cầu; không sửa audio/catalogue/data/backend/QR/GPS. Bảo toàn logic start/reentry/blur/background/async seek/620ms/fade/cancel/reduced-motion, asset cue và toàn narration byte-exact. W2 commit cục bộ gọn, không merge/push/publish/store, không đụng main workspace. Candidate chỉ nhận cherry-pick đã review. Coordinator tiếp tục vòng cập nhật preview iOS cùng project/branch theo yêu cầu deploy rõ ràng trước đó của user, sau review/test/native/export đạt; quyền này không mở store, public backend hoặc nhánh phát hành khác. Đính chính câu hạn chế publish ở bản brief đầu: không tự tạo thêm cửa duyệt khi quyền deploy preview đã có trong phiên.

Kiểm app tests/tsc/lint; test có ý nghĩa cho locale switch, CTA navigation và sizing lớn, không chỉ snapshot style. Coordinator kiểm native nếu thiết bị/emulator khả dụng: màn nhỏ375dp và màn thường, fontScale1 và2, VI/EN, portrait/landscape, CTA và ngôn ngữ không chồng/cắt, cuộn tới CTA được. Không gọi render test hoặc bundle là bằng chứng native. Ghi rõ phần chưa kiểm.

## Việc cần anh quyết / việc anh tự làm

- Cần quyết: không có cửa duyệt triển khai thêm; câu làm rõ phạm vi là tùy chọn, mặc định màn logo đầu tiên.
- Cần tự làm: xem bố cục trên iPhone thật để đánh giá cảm nhận khi có bản preview; không coi là đã kiểm trong môi trường Windows.
