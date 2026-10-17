# Ngõ Kể — triển khai bố cục và sóng vàng đã được người dùng duyệt

Ngày 17/10/2026. Yêu cầu mới nhất: “triển khai đi” sau đề xuất bố cục tổng thể/sóng vàng. Quyền này mở việc sửa bố cục thực, không chỉ retune token; thay thế giới hạn giữ nguyên geometry/1180ms của đợt trước. Không xin duyệt lại từng task.

W1 coordinator sở hữu brief/review; W2 Antigravity sở hữu mobile/UI tests/copy giao diện và báo cáo thiết kế. Giữ model/effort Antigravity hiện hành. Candidate `valentino/post8-integration` baseline `1ec615d` có268 app tests; W2 `95b438c` có254 tests do không có14 kiểm tra tích hợp riêng. Chỉ cherry-pick từng commit review; không merge/push/main workspace/store/publish hoặc deploy backend.

## Mục đích và nguyên tắc

Hành trình: mở cửa vào ngõ → chọn ngõ → chọn điểm → nghe/đọc chuyện → hỏi tiếp có nguồn. Cảm giác sổ tay địa phương ấm và gợi tò mò. Giữ giấy/xanh/vàng/ảnh ngõ, tập trung một hành động chính mỗi vùng, giảm trọng lượng điều khiển phụ.

W2 đọc `C:/Users/LEGION/.agents/skills/motion-design/SKILL.md`, `director/context-adaptation.md`, `reference/quality-checklist.md`. Tái sử dụng React Native Animated/SVG/hook hiện có; không GSAP/Three.js/web/AR/thư viện mới. Native opacity/transform, touch feedback thấy ngay, giảm motion bỏ lan sóng, blur/background/unmount cancel an toàn. Không dùng skill để bắt mọi màn có ambient loop.

## Thay đổi phải triển khai

### 1. Prologue

- Logo/tên app là điểm nhìn, một câu dẫn ngắn; nút bắt đầu ở vùng thấp dễ chạm, ngôn ngữ gọn phía trên. Giữ safe area, font200 và khả năng scroll khi màn nhỏ.
- Có thể rút câu dẫn UI thành “Mỗi ngõ nhỏ, một câu chuyện chờ bạn mở.” / “Every alley holds a story waiting to unfold.”; đây là copy giao diện, không thay nội dung kể chuyện hoặc dữ liệu lịch sử.
- Sóng: **hai cung chính mỗi bên** + halo mờ, bán nguyệt mềm từ giữa hai sườn; đối xứng dù bấm đâu, không vòng tròn toàn màn/không ripple theo ngón tay/không sine ribbon. Nét mảnh dần, đầu cung fade, vàng mật ong dịu. Giới hạn phần lan nhìn thấy khoảng16–28dp ngoài mép nút; tính cả transform, không chỉ bán kính ban đầu.
- Phản hồi nhấn ngay. Toàn bộ sóng signature khoảng500–650ms (chọn620ms nếu phù hợp), nhanh đầu/chậm lúc tan; chuyển màn êm khoảng200–240ms bằng cơ chế native hiện có. Không cộng thêm một timer chờ âm thanh hết1180ms. Navigation chỉ một lần, hủy khi blur/background, reduced-motion giữ đường vào ngay.
- Giữ nguyên bytes cue WAV1.1s. Khi chuyển sớm, fade cue êm bằng volume/player lifecycle hiện có trước khi release nếu cần; không đổi voice engine hoặc dựng sound service toàn app. Không làm âm thanh quyết định thời gian chờ. Guard deferred seek/rejection/re-entry/cancel/unmount phải còn; guard callback cũ không được ảnh hưởng lượt mới. Báo rõ nếu chỉ phát đoạn cue đã fade, không nói phát đủ1.1s khi thực tế không đủ.

### 2. Landing / chọn ngõ

- Đưa tiêu đề **Chọn một con ngõ** và thẻ ngõ lên sớm hơn trong viewport. Thu quote lớn thành lời dẫn nhỏ, hoặc đặt sau lựa chọn chính. Không giữ nguyên quote card lớn rồi chỉ đổi delay.
- Giữ một lối “Xem tất cả” vào AlleySelect. **Bỏ footer CTA lớn khám phá trùng chức năng**, giải phóng chỗ xem thẻ. Giữ tap thẻ mở đúng bộ ngõ, labels và phân biệt demo/live/nguồn.
- Không thêm “gần bạn”, tracking, khoảng cách thật hoặc “tiếp tục” giả khi chưa có tính năng/state đó. Passport sample nếu giữ phải rõ là mẫu, ưu tiên thấp sau thẻ; không làm nó cạnh tranh chọn ngõ.

### 3. Home / hành trình trong ngõ

- Điểm đang chọn nổi bật, các điểm còn lại nhẹ hơn; không đổi tọa độ/data hoặc biến sơ đồ thành dẫn đường thật.
- **Có preview gọn của điểm đang chọn nhìn thấy ngay trên vùng thao tác, không phải cuộn hết sáu điểm mới tới postcard.** Tên, mô tả ngắn và một CTA mở câu chuyện. Có thể dùng ảnh thumbnail nhỏ; không nhét ảnh postcard lớn trong dock.
- Chỉ một CTA chính mở chuyện. Nếu preview có CTA thì bỏ nút Read story trùng ở hàng dưới, giữ GPS/Công cụ làm thao tác phụ với chức năng cũ. Không xóa handler/route/tính năng gợi ý/QR/chọn tay.
- Ưu tiên bố trí flow flex (scroll region + preview + secondary actions), hoặc đo chiều cao footer nếu overlay; không paddingBottom magic number gây che thẻ ở font200. Giữ fallback danh sách của font lớn/Reduce Motion đã có.

### 4. Qa / nghe và đọc chuyện

- Player/câu chuyện là trọng tâm. Play/pause chính có độ nổi bật; replay/stop, đọc chữ, nguồn và thao tác khác nhẹ hơn nhưng hit targets/accessible labels vẫn đủ.
- Câu hỏi gợi ý dưới phần chuyện; bố trí bớt pill nặng, không giảm khả năng đọc/tap. Dock hỏi/gõ vẫn luôn dùng được; không cho nút mic ở trạng thái idle tranh màu vàng với nút nghe chính. Recording/processing/error/play state phải trung thực.
- Nguồn, ranh giới hư cấu/lịch sử, manual text path và câu trả lời cố định giữ đầy đủ. Không autoplay narration từ việc vào màn nếu trước đây yêu cầu thao tác.
- Bảng công cụ: mô tả nguồn gọn theo lợi ích người dùng (Demo dùng offline, trạng thái Live), giảm trọng lượng API/server/key; giữ nguồn/fiction disclaimer và lỗi/retry. Được sửa UI copy VI/EN, không sửa story/QA/fixture/evidence.

### 5. Plan, Camera, Location, Unavailable/Placeholder và shared input

- Rà tính nhất quán header/spacing/CTA/trạng thái với hệ giấy/xanh/vàng; mỗi trạng thái một bước phục hồi/chọn tay/xác nhận rõ. Màn đang đạt giữ + ghi lý do, không thêm hiệu ứng trang trí.
- Giữ semantic permission/lifecycle: GPS chỉ đề xuất candidate; camera chỉ dùng khi người dùng bật; unknown QR chọn tay; Live không fallback demo.
- Xử lý placeholder ô nhập dài ở font200 bằng copy ngắn hoặc bố trí single-line dễ đọc, giữ accessible label và text input value/font scaling. Kiểm Send khi bàn phím mở; không tắt font scaling để che lỗi.

## Bằng chứng và bàn giao

1. Đọc connected source/callers và kiểm WIP trước sửa. Viết tóm tắt lựa chọn layout/motion trong `docs/POST8_LAYOUT_WAVES_ANTIGRAVITY_REVIEW.md`, có trước/sau và những phần giữ nguyên. Không tự dừng chỉ ở plan; thực hiện cả source và self-review.
2. Chỉ thay presentation/UI copy/tests và báo cáo của W2. Giữ nguyên100 narrationMP3, cueWAV, data/story/evidence, matcher, controllers/voice engine/backend/EAS config; không thêm deps. Worker audio/data cũ khác candidate: không copy toàn branch qua candidate.
3. Test hành vi quan trọng: chỉ một đường chính tương ứng, các route còn truy cập được; bỏ footer Landing nhưng Xem tất cả/tap thẻ vẫn đúng; selected preview đổi theo node; waves đúng hai bên/hai cung, timer500–650, navigation/cancel/seek-safe/reduced motion; âm thanh fade/cancel đúng nếu thêm logic. Không chỉ snapshot số trùng implementation. Update expected cho hành vi được user đổi, không bỏ test an toàn cũ.
4. Chạy toàn bộ mobile tests, tsc, eslint; W1 chạy candidate suite sau tích hợp. W2 self-review theo emotional intent/narrative/craft, hierarchy, duration/easing/choreography, a11y/VIEN/font200/keyboard/lifecycle, ghi pass/kept/pending với file:line.
5. **W1 sở hữu emulator/native screenshot QA**, W2 không tự launch/tắt emulator hoặc điều khiển ADB để tránh đụng phiên. W1 sẽ lấy ảnh trước baseline và sau candidate; W2 đọc được PNG để tự đánh giá. Metro demo8081 giữ phục vụ candidate và tự reload khi tích hợp; không sửa nguồn main.
6. Báo commit SHA, files, commands/counts thật, rủi ro. Ảnh tĩnh/Node tests không thành bằng chứng60fps/iPhone/nghe thật. Không nói toàn bộ app đã redesign nếu chỉ đổi một vài màn.

## Việc cần người dùng quyết / tự làm

- Không có quyết định chặn triển khai đã được yêu cầu.
- Không có bước người dùng phải làm trước khi triển khai. Cảm nhận và thử iPhone/điện thoại thật vẫn pending khi chưa có bằng chứng; không coi kiểm giả lập là thay nghiệm thu của người dùng.
