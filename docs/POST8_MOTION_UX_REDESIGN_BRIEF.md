# Ngõ Kể — đánh giá và thiết kế lại UI/UX bằng motion-design

Ngày: 17/10/2026. Coordinator W1; thực hiện và tự đánh giá: W2 Antigravity.

## Quyền và mục tiêu

Yêu cầu người dùng: “cài skill motion design xong dùng skill motion design đánh giá lại toàn bộ UI/UX hiện tại sau đó đề xuất cho antigravity làm theo đúng mục đích mà app hướng tới, bảo antigravity dùng motion design để thiết kế lại và đánh giá luôn”. Đây là quyền đánh giá, thiết kế và triển khai cải thiện UI/UX trong app hiện có; không cần xin duyệt lại từng task. Không tự publish bản thiết kế mới, đổi backend/data/voice engine hoặc mở thêm tính năng sản phẩm.

Skill đã cài tại `C:/Users/LEGION/.agents/skills/motion-design/SKILL.md` (LottieFiles, v1.0.0). W2 phải đọc file thực và các reference phù hợp, ghi rõ đã áp dụng nguyên tắc nào; không chỉ nói “đã dùng skill”. Không thêm GSAP/Three.js/Lottie hoặc DOM/web vào app React Native chỉ vì có skill.

Mục tiêu sản phẩm theo `agent_docs/project_brief.md`: giúp người dùng khám phá một con ngõ, nghe/đọc câu chuyện có nguồn, hỏi đáp cố định và chọn tối đa ba điểm theo sở thích/quỹ thời gian. Camera/QR và GPS giúp xác nhận điểm. Demo chạy offline; VI/EN có cùng khả năng sử dụng. Hành trình phải dễ hiểu, bình tĩnh và gợi tò mò, có cảm giác một cuốn sổ khám phá địa phương; không biến thành dashboard công nghệ, game, bản đồ dẫn đường hay chatbot tự do. Không bịa persona hoặc lịch sử/nguồn thật.

Baseline đánh giá: candidate `9fdfad9` (đã publish preview iOS, bổ sung docs tại `7a47c82`), app W2 `8ef2a7a`. 266 tests trước đợt này đạt; đó không phải chứng cứ chất lượng UX hoặc bằng chứng các thay đổi mới đã đạt. Giữ WIP và kiểm tra SHA thực trước làm.

## Đánh giá ban đầu của coordinator

Đây là review source và bằng chứng native gần nhất, chưa phải usability study hay kiểm toàn bộ màn hình trên iPhone thật. Các đề xuất phân cấp/khả năng đọc cần W2 đối chiếu ảnh native trước/sau; không tự gán điểm UX số học.

1. **Có nền cần giữ:** palette ấm, hình ngõ, nhãn mô phỏng/nguồn, lựa chọn VI/EN, trạng thái chọn điểm rõ, reduced motion/lifecycle guard, app offline, Q&A có evidence, đường chọn tay khi camera/GPS không dùng được. Các hook motion/native-driver đã tồn tại, tái sử dụng thay vì dựng hệ thống mới.
2. **Choreography đang lệch hợp đồng, xác nhận được trong code:** `LandingScreen.tsx:44–47` yêu cầu delay 60/160/320/400ms và duration 420ms; `useEntranceFadeSlide` trong `hooks/useMotion.ts` lại chặn delay ở 100ms, duration 250ms, offset 12. Ba khối sau bắt đầu gần như cùng lúc, không thực hiện thứ tự như màn hình mô tả. `AlleySelectScreen.tsx:125–127` có cùng kiểu gọi. Cần thống nhất token/caller/hook; không bỏ giới hạn tùy tiện khiến nội dung chờ lâu.
3. **Motion identity thiếu nhất quán, xác nhận được ở token:** `theme/motion.ts` đặt fast=220, normal=260, relaxed=250, slow=300; tên không phản ánh thứ tự và có nhiều nhịp gần nhau. Có cả bouncyPop, gentleSlide, halo 1.15. Cần xem từng caller trước đổi, thống nhất phản hồi nhanh + chuyển ngữ cảnh êm, không thêm bounce mọi nơi.
4. **Cần giảm cạnh tranh thị giác, phải kiểm hình:** Landing có quote/banner/carousel/teaser; Home có bản đồ sơ đồ, halo, postcard, nút đổi mood và các lối vào; Q&A có narrator/waveform/player/dock/drawer. Đánh giá xem hành động “chọn ngõ → chọn điểm → nghe/đọc/hỏi” có nổi bật hơn trang trí và điều khiển phụ không. Không kết luận mọi khối đều dư khi chưa xem.
5. **Phân biệt chuyển động trạng thái và trang trí:** Camera có laser + reticle, Home có pin halo, Q&A có waveform. Chỉ hoạt động khi trạng thái thật tương ứng; waveform không được làm người dùng hiểu nhầm đang thu/đang nghe khi không có phiên đó. Không thêm vòng lặp trên văn bản đang đọc hoặc làm người dùng tưởng GPS đang dẫn đường.
6. **Màn tiện ích cần cùng ngôn ngữ:** Plan, Location, Camera, Unavailable/Placeholder cần kiểu header/spacing/CTA/trạng thái nhất quán với hành trình kể chuyện. Đây là điểm cần kiểm trực quan, không mặc định phải thêm animation.
7. **Khả năng tiếp cận và trạng thái lỗi là tiêu chí đầu tiên:** font 200%, VI/EN dài, bàn phím, dock/player/safe area, hit target, VoiceOver/TalkBack, reduced motion, blur/background, empty/error/retry/offline. Giữ nhãn trạng thái/nguồn dễ đọc và không ẩn lỗi để làm giao diện đẹp.
8. **Giữ yêu cầu đã chốt:** nút Prologue phát sóng vàng nhỏ, hai bên là các nửa vòng tròn mềm từ giữa sườn; không đổi thành vòng tròn toàn màn, ripple theo điểm chạm, sóng dọc hoặc lan quá rộng. Giữ cue 1.1s và seek/cancel guard. Signature reveal 1180ms là ngoại lệ có chủ đích, không áp nhịp đó cho các nút thường. Chưa có bằng chứng nghe người thật/FPS native để gọi là hoàn hảo.

## Hướng thiết kế giao cho Antigravity

Chọn một motion personality: **Premium theo nghĩa điềm tĩnh, mượt và tiết chế**, giữ sự gần gũi của ngõ phố. Emotional intent = tò mò an tâm; visual narrative = mở cửa → chọn hành trình → tập trung một câu chuyện → tiếp tục khám phá; motion craft = chuyển động ngắn, hạ cánh nhẹ, không nhún mạnh. Ba lớp primary/secondary/ambient chỉ thêm khi có vai trò, không bắt buộc mọi màn có cả ba.

- Phản hồi nhấn phải thấy ngay, mục tiêu khoảng 120–150ms; nội dung/CTA không chờ animation mới dùng được.
- Chọn tối đa ba nhịp dùng chung phù hợp native, ví dụ quick 120ms / standard 240ms / context 400–420ms; chọn cuối sau xem caller, không đổi bằng tìm-thay mù. Entrance decelerate; exit accelerate; chuyển trạng thái ngắn; không overshoot mặc định.
- Choreography ưu tiên hero/hành động chính trước, nội dung phụ sau rất nhẹ; tổng stagger dưới 500ms, không làm toàn bộ màn bay lên đồng loạt. Với màn dài chỉ animate khối thực sự cần, không bắt người dùng đợi cả danh sách.
- Navigation giữ hướng không gian dễ đoán; back nhanh và không phát lại intro/sound. Không thay stack/route/controller hoặc state machine chỉ để làm chuyển cảnh.
- Nội dung nghe/đọc được dành vùng ổn định. Player/dock không che nội dung, bàn phím và safe area. Không nhấp nháy, rung lắc hoặc tự phát sound trang trí mới.
- Ưu tiên opacity/transform native driver, motion dừng khi blur/background/unmount; giảm motion hiện nội dung ổn định và giữ mọi hành động sử dụng được. Không tuyên bố 60fps nếu chưa đo.

## Ma trận thiết kế và đánh giá bắt buộc

W2 rà đủ từng màn; ghi rõ “giữ nguyên + lý do” nếu không cần sửa.

| Màn/khối | Công việc người dùng | Điểm cần thiết kế/kiểm |
| --- | --- | --- |
| Prologue | Hiểu Ngõ Kể, chọn ngôn ngữ, bắt đầu | Giữ signature sóng/cue; hierarchy đọc được; thao tác nhanh, cancel/reduce an toàn |
| Landing | Chọn ngõ để khám phá | Một tiêu điểm chính, thông tin phụ nhẹ; sửa lệch choreography; thấy rõ lối xem tất cả |
| AlleySelect | Tìm/lọc/chọn ngõ | Search/filter/empty/reset dễ hiểu, thẻ và CTA nhất quán; live không mượn demo |
| Home + AlleyTrailView/PostcardCard | Biết đang ở đâu, chọn điểm và mở chuyện | Current/selected/visited khác nhau bằng nhiều tín hiệu; bản đồ mô phỏng rõ, ít cạnh tranh halo/mood/CTA |
| Qa + dock/drawer/player | Nghe/đọc, hỏi câu có sẵn, xem nguồn | Thứ bậc câu chuyện/câu hỏi, trạng thái thu-xử lý-phát, lỗi/retry/cancel, không giả waveform thật |
| Plan | Chọn chủ đề/quỹ thời gian và tối đa ba điểm | Radio/input/result rõ, không delay submit, không khiến ETA mô phỏng thành dẫn đường thật |
| Camera | Quét/xác nhận/chọn tay | Quyền camera/off/unknown QR, pending confirm/cancel, scan indicator đúng trạng thái, không AR thật |
| Location | Xin vị trí và xác nhận candidate | Chờ/dừng/thử lại/chọn tay rõ, không tự đổi node, không cho cảm giác tracking nền |
| Unavailable/Placeholder + shared headers/buttons | Hiểu thiếu dữ liệu và thoát được | Một hành động phục hồi rõ, không dead end; nội dung giữ trung thực |

## Deliverables và giới hạn triển khai

1. Trước sửa, W2 đọc skill, source connected callers, kiểm WIP; viết audit riêng `docs/POST8_MOTION_UX_ANTIGRAVITY_REVIEW.md` gồm bằng chứng file:line, ưu tiên P1/P2/P3, design rationale và ma trận trên. Phân biệt lỗi xác nhận được / nhận định cần xem native / chưa thử. Không copy audit coordinator rồi gọi là review độc lập.
2. Thiết kế lại và triển khai phần UI cần thiết để đạt mục tiêu, giữ identity và luồng đã hoạt động; không rewrite toàn app hoặc thêm tính năng. Được đổi presentation/spacing/typography/feedback/transitions trong mobile và test liên quan. Không sửa dữ liệu, QA matcher, backend, catalogue, 100 MP3/cue, schema, permission semantics hoặc project EAS runtime/config. Không tự publish, không push/merge/main workspace.
3. Tự đánh giá sau sửa **bằng cùng motion-design**: emotional intent/narrative/craft, duration/easing/choreography, a11y và trạng thái thật; mỗi finding có resolved/kept/pending cùng bằng chứng. Đưa ảnh native trước/sau các màn đổi; nếu không mở native được ghi thẳng thiếu đó, không dựng web preview thay thế.
4. Chạy lint/typecheck và app tests phù hợp; thay hook/token dùng chung thì chạy toàn bộ app tests. Test phải kiểm hành vi timing/cancel/reduced-motion thật, không chỉ snapshot giá trị trùng implementation. Không sửa expected để giấu regression. Kiểm số audio/hash trước/sau.
5. Commit cục bộ phần W2 và báo SHA, files, commands/kết quả, ảnh, giới hạn thiết bị. Coordinator review rồi mới cherry-pick candidate từng commit. Không tự dừng xin người dùng duyệt giữa task; vướng scope/ownership hỏi coordinator qua Orca.

## Việc cần người dùng quyết / tự làm

- Cần người dùng quyết: không có quyết định chặn audit/thiết kế đã được yêu cầu. Không tự tuyên bố người dùng đã nghiệm thu thiết kế.
- Cần người dùng tự làm: chưa có bước nào chặn triển khai; cảm nhận thẩm mỹ/âm thanh và kiểm iPhone/thiết bị thật chỉ đánh dấu pending khi chưa có bằng chứng, không coi kiểm giả lập là đã thay thế.
