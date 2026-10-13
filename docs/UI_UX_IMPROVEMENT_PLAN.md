# Ngõ Kể — Plan cải thiện UX và motion

Ngày: 12/10/2026. Áp dụng cho bản native Expo hiện tại. Căn cứ: [báo cáo kiểm thử và bằng chứng](UI_UX_AUDIT_2026-10-12.md).

## 1. Mục tiêu và phạm vi

Giữ hướng **“Sổ tay ngõ phố: ấm, giàu bản sắc”**. Ảnh tạo không khí; giấy, chữ và phân cấp giúp đọc nhanh ngoài đường. Hiệu ứng phải phản hồi thao tác, chỉ dẫn chuyển trạng thái và không gây chậm thao tác.

- Người dùng đã yêu cầu bỏ thống kê “5 bìa ngõ / 6 điểm / 100% ảnh”: **đã bỏ**, gồm motion và style riêng. 100/100 test chạy lại đạt.
- Màn mở đầu bấm để vào; Back không cần quay lại màn mở đầu. Lỗi màn trống đã tái hiện trên Android.
- Demo được dùng ảnh chung. Không tự nhận ảnh là bằng chứng đúng điểm; giữ nguồn ảnh và thông tin mô phỏng ở nơi thích hợp.
- **Đã được duyệt và triển khai phần code A–D** bằng yêu cầu “triển khai phần còn lại đi”. A/B/C đã kiểm tự động và các luồng Android; D còn nghiệm thu iOS/phần cứng và đo release. Xem [bàn giao triển khai](UI_UX_IMPLEMENTATION_HANDOFF.md). Không mở backend, Voice, lưu hộ chiếu lâu dài hoặc đổi dữ liệu văn hóa; không tạo web/PWA.
- Giữ thay đổi UI của người dùng; sửa theo từng đợt để có thể so sánh và hoàn tác riêng. Chưa commit/push.

## 2. Thứ tự triển khai

| Đợt | Việc làm | Điều kiện hoàn thành |
| --- | --- | --- |
| A — Logic | Prologue/Back, ngăn bấm lặp, bỏ micro giả và timer, sửa lịch sử Q&A ↔ Sổ tay; bổ sung regression | Các ca từng tái hiện lỗi chạy đúng; test không che lỗi bằng mock animation |
| B — Bố cục và nội dung | Home thấp/ngang, chữ trên ảnh, trạng thái rỗng, copy Demo/Live; phân cấp lại từng màn | Mọi điểm mở và CTA đều truy cập được; đọc được khi tăng chữ và mở bàn phím |
| C — Motion | Focus/AppState, Reduce Motion, drawer đóng/mở bị ngắt, thống nhất thời lượng | Không còn loop trên màn ẩn; mọi thao tác vẫn hoàn tất khi giảm chuyển động hoặc animation bị hủy |
| D — Hoàn thiện và nghiệm thu | Ảnh, phản hồi chọn điểm, icon, khoảng cách; QA native và đo bản release | Không lùi logic; có bằng chứng Android/iOS và kết quả đo trên thiết bị thực |

Chốt A trước khi tăng hiệu ứng. B và C dùng cùng cấu trúc màn đã ổn định; D không thêm chức năng để làm đẹp.

## 3. Navigation và trạng thái

### Màn mở đầu

- Dùng `replace('Landing')` sau CTA, tạo Landing làm gốc của hành trình. Không để Prologue opacity 0 nằm trong lịch sử Back.
- Chọn một transition của native stack. Bỏ chuỗi fade thủ công rồi mới chạy fade của navigator, đang kéo dài thời gian vào app.
- Khóa thao tác trong lần chuyển; callback bị hủy không được tự điều hướng. CTA phải sử dụng được ngay, không đợi toàn bộ trang xuất hiện.
- Nghiệm thu: vào → Back không hiện màn trống; bấm nhanh 10 lần chỉ chuyển một lần; reload khởi tạo hợp lệ. Nếu giữ exit animation, kiểm cả `{ finished: false }`.

### Q&A và Sổ tay

Lịch sử mong muốn:

| Đi từ | Chọn điểm trong Sổ tay | Back tiếp theo |
| --- | --- | --- |
| Home → Q&A → Sổ tay | Quay về Q&A đang có, đổi điểm | Home |
| Home → Sổ tay | Thay Sổ tay bằng Q&A của điểm chọn | Home |

- Dùng hành động stack phù hợp của phiên bản đang cài, như `popTo`/`replace`, theo nơi mở Sổ tay. Không gọi `navigate('Qa')` lặp vô điều kiện.
- Giữ trạng thái điểm đang xem, điểm được xác nhận và điểm đã đọc tách biệt. Chọn trên bản đồ chỉ đổi điểm đang xem; không tự xác nhận hay ghi tiến độ.
- Q&A phải reset theo nguồn/revision/ID điểm, tránh câu trả lời của điểm cũ. Luồng này đang có bảo vệ, cần giữ khi sửa navigation.
- Nghiệm thu: lặp Q&A → Sổ tay → chọn điểm 5 lần không tích thêm cặp màn; Back có ý nghĩa cố định. Chuyển Demo/Live không giữ câu trả lời cũ.

### Micro và hành động thực

- Bỏ giả lập `isListening` và timer tự mở drawer. Chưa có STT nên giao diện không hiển thị đang nghe hay trả lời bằng giọng nói.
- Đổi CTA Home thành hành động thật như “Đọc lời kể” hoặc “Hỏi về điểm này”; Q&A giữ nhập chữ và câu gợi ý.
- Không thêm quyền micro hoặc thư viện Voice để cứu một hiệu ứng. Voice là scope riêng.
- Nghiệm thu: không có timer bật drawer sau khi đóng/chuyển điểm/Back; nhãn và accessibility label mô tả đúng thao tác.

## 4. Thiết kế theo màn

### Prologue — một trang bìa gọn

- Một ảnh, logo/tên, một câu dẫn và CTA. Giảm chi tiết chạy liên tục; waveform không có âm thanh thật thì bỏ.
- Chữ chính nằm trên vùng ảnh có lớp che đủ ổn định. Với màn thấp/chữ lớn, nội dung cuộn được và CTA không bị cắt.
- Entrance nhẹ một lần; không zoom/pulse vô hạn. Trải nghiệm vào app nằm ở tốc độ phản hồi của CTA.

### Landing — chọn hành trình rõ ràng

- Giữ ảnh bìa giàu không khí; chỉ một hành động chính để bắt đầu và một đường phụ xem các ngõ.
- Hàng thống kê đã bỏ. Thu gọn đoạn quote/mood nếu chiếm hết màn đầu; thông tin phụ đưa xuống sau hành động chính.
- Card ngõ có tên, một câu gợi không khí, thông tin hữu ích hiện có trong dữ liệu. Không tự tạo thời lượng hay đánh giá “đáng đi”.
- Nếu mood không làm thay đổi nội dung/hành động có ích, ưu tiên bỏ hoặc giảm nổi bật; không đặt ngang CTA chính.
- Nguồn ảnh và nhãn demo gọn ở vùng thông tin; không dùng tuyên bố “100% ảnh thật” như chỉ số thành tích.
- Nghiệm thu: nhìn màn đầu hiểu bấm gì; card/CTA vẫn dùng được với chữ lớn. Không xuất hiện khoảng trống từ stats đã bỏ.

### Home — đường ngõ là trung tâm, thao tác không bị che

- Chia ba vùng: header, đường ngõ, hành động cuối. Không ép canvas tối thiểu 520 vào cửa sổ thấp rồi cắt phần dưới.
- Phương án mặc định: đường ngõ cuộn được khi chiều cao thiếu; vùng CTA nằm ngoài canvas với safe area. Card điểm chọn nằm dưới đường ngõ, tránh che pin hoặc tên điểm.
- Màn ngang có thể dùng hai vùng đường ngõ/thông tin nếu đơn giản; fallback cuộn vẫn bắt buộc. Không khóa dọc để che lỗi.
- Mỗi pin có số/nhãn đọc được, trạng thái chọn/đóng rõ. Giữ sáu điểm theo schema hiện tại; không mở rộng schema trong việc sửa bố cục.
- Chọn điểm: đổi nội dung tức thì, sau đó fade/translate nhẹ; giữ kích thước card ổn định. Tránh scale từ 0.75 gây giật và nhảy lớn.
- Ô tiến độ nói rõ đang xem/đã đọc theo trạng thái thật; nhãn Demo/Live lấy từ nguồn, không hardcode Demo.
- Nghiệm thu: điểm 01–06 và CTA truy cập được ở portrait, cửa sổ thấp/ngang; card không che nhãn pin; bấm nhiều điểm nhanh thì điểm cuối được chọn đúng.

### Q&A — đọc thoải mái, hỏi đúng điểm

- Header ưu tiên tên điểm. Credit/loại nguồn chuyển sang dòng phụ, tránh tranh chỗ với tiêu đề dài.
- Lời kể, câu trả lời, thông báo không có Q&A đều nằm trên nền giấy hoặc surface đủ tương phản; không để chữ xám nhỏ trôi trực tiếp trên ảnh.
- Gợi ý câu hỏi là đường vào nhanh; nhập chữ là hành động rõ ràng. Không gợi khả năng Voice chưa có.
- Điểm không có Q&A: nói ngắn gọn, cho chọn điểm khác hoặc quay về lời kể. Phân biệt “không có câu hỏi” với “câu hỏi chưa khớp”.
- Trả lời có bằng chứng hiện có; copy Demo/Live theo mode/provenance. Không tự nhận dữ liệu live đã được kiểm chứng ngoài dữ liệu cung cấp.
- Sau chọn câu hỏi, đưa phần trả lời vào vùng nhìn được khi màn thấp/bàn phím mở; không cưỡng ép cuộn nếu người dùng đang đọc phần khác.
- Segment chuyển điểm giữ hình vạch nhỏ nhưng có vùng chạm khoảng 44dp. Previous/Next nên tìm điểm mở gần nhất, thay vì bị chặn bởi một hàng xóm đóng; cần regression cho đầu/cuối và tất cả đóng.
- Nghiệm thu: đọc được notice tại điểm 05, trả lời đúng điểm 01, không lộ đáp án cũ sau chuyển điểm; drawer không che kết quả hoặc nút đóng.

### Sổ tay/Plan — chọn một lượt rồi đi

- Nhóm chủ đề và quỹ thời gian theo một dòng quyết định rõ; giảm lớp card lồng nhau và khoảng trắng chỉ để trang trí.
- Hiện lựa chọn hiện tại, kết quả có lý do/tổng thời gian đã tính và một CTA đến điểm đầu. Không tự xác nhận đã đến điểm.
- Không có kết quả: giải thích vì sao, cho sửa chủ đề/thời gian. Không ép chọn điểm đóng.
- Nhãn demo dùng theo nguồn. Hộ chiếu mẫu phải giữ ý nghĩa mẫu, không giả lưu tiến độ lâu dài.
- Nghiệm thu: chủ đề ẩm thực + 15 phút vẫn chọn đúng điểm 05 theo fixture; mọi CTA dùng được khi tăng font; chọn kết quả quay về đúng lịch sử ở mục 3.

### Chọn ngõ, Camera, GPS và thiếu nguồn

- Danh sách ngõ: tên/ảnh/CTA rõ, không cần nhiều pulse. Ảnh demo dùng chung được nhưng không làm người dùng hiểu là đúng từng điểm.
- Camera: quét chỉ hoạt động khi màn có focus và quyền hợp lệ; laser chỉ khi thực sự scanning. Xác nhận mã rồi mới cập nhật điểm; không nhân đôi callback.
- GPS: chỉ xin vị trí sau thao tác rõ; candidate phải được xác nhận. Chọn tay không giả khoảng cách GPS. Hiển thị pending/lỗi và đường thử lại.
- Thiếu Live: giữ thử lại và chuyển Demo; request đến muộn không ghi đè nguồn mới. Thông báo đủ đọc trên nền giấy.
- Nghiệm thu: QR sai/đóng, quyền từ chối/đến muộn, Back khi pending, đổi mode giữa request đều không làm sai điểm hoặc nguồn.

## 5. Hệ thị giác

| Thành phần | Hướng đề xuất |
| --- | --- |
| Màu | Giữ nền giấy ấm và xanh ngõ hiện có; accent đất nung chỉ cho điểm nhấn/hành động cần phân biệt. Đo tương phản trước chốt màu |
| Chữ | Heading có cá tính, body ưu tiên font đang hỗ trợ tiếng Việt. Body khoảng 16–17sp/line-height 24–26; nhãn phụ khoảng 13sp. Cho phép font scale |
| Ảnh | Một ảnh nổi bật mỗi vùng; overlay ổn định cho text. Thông tin dài đưa lên giấy; không áp nhiều lớp glow/blur |
| Surface | Giấy chính, một cấp thông tin phụ; giảm card trong card. Border/shadow nhẹ, dùng nhất quán |
| Icon | Thống nhất nét và kích thước bằng thành phần SVG hiện có. Giảm emoji không đồng bộ; không thêm icon package chỉ cho vài nút |
| Điều khiển | Vùng chạm tối thiểu đề xuất khoảng 44dp, trạng thái focus/disabled/selected không chỉ dựa vào màu |

Các con số là mục tiêu thiết kế để thử, không phải kết quả đã đo. Kiểm chữ tiếng Việt dài và tương phản trên chính ảnh đang dùng; không dùng ảnh minh họa đẹp để bỏ qua trường hợp xấu.

## 6. Quy tắc motion

Tận dụng `Animated` và native-stack đang cài. Dùng opacity/transform với native driver khi phù hợp. Không animate width/height/shadow/blur liên tục; tránh đổi layout để tạo chuyển động.

| Tương tác | Mức đề xuất | Khi bật Reduce Motion |
| --- | --- | --- |
| Bấm nút/card | 100–160ms, scale khoảng 0.97 và trở lại; phản hồi ngay | Thay đổi màu/opacity, giữ nguyên vị trí |
| Chuyển màn | Một transition 200–280ms, không ghép thêm exit dài | Fade ngắn 80–120ms hoặc tức thì |
| Chọn pin/đổi nội dung | 160–220ms fade + translate 8–12dp, không scale lớn | Đổi nội dung trực tiếp |
| Drawer | Mở 240–300ms, đóng 180–220ms; chiều cao/offset đo thực tế | Hiện/ẩn hoặc fade ngắn |
| Câu trả lời | 160–220ms xuất hiện nhẹ; không trì hoãn dữ liệu | Hiện trực tiếp |
| Entrance trang | Tối đa 2–3 nhóm, stagger 40–60ms; hoàn tất khoảng 350ms, CTA dùng được ngay | Tất cả ở trạng thái cuối |
| Ảnh đổi điểm | Giữ ảnh cũ đến khi ảnh mới sẵn, crossfade ngắn | Đổi trực tiếp khi tải xong |

- Đọc `AccessibilityInfo.isReduceMotionEnabled`, theo dõi thay đổi và dọn listener. Không giữ opacity 0 khi bỏ animation.
- Loop chỉ chạy khi màn **focused + app foreground + có trạng thái cần thể hiện**. Khi blur/background, stop và reset về trạng thái tĩnh có nghĩa.
- Laser gắn với camera đang mở, scanning và chưa có xác nhận pending. Không cho loop chạy từ lúc mount màn đóng.
- Waveform chỉ tồn tại nếu có trạng thái âm thanh thật. Trang trí dùng nhịp tĩnh, không mô phỏng đang nghe.
- Drawer giữ mounted đến khi animation đóng hoàn tất; xử lý đóng/mở liên tiếp, callback bị hủy, safe area và bàn phím. `visible=false` không được tháo Modal trước khi exit xuất hiện.
- Animation bị ngắt phải tôn trọng thao tác mới nhất. Callback kiểm `finished`; không để callback cũ điều hướng hoặc mở drawer.
- Hero zoom nhẹ một lần là tùy chọn cuối, sau đo hiệu năng; không thêm parallax/loop toàn màn mặc định.

**Không thêm Reanimated/Gesture Handler trong đợt này.** Chỉ cân nhắc nếu sau này cần kéo sheet/map theo ngón tay và đo cho thấy giải pháp sẵn có không đáp ứng; đó là thay đổi phạm vi cần chốt riêng.

## 7. File cần chạm và kiểm liên quan

| Cụm | Source/callers | Regression |
| --- | --- | --- |
| Navigation | `App.tsx`, `navigation.ts`, Prologue/Plan/Qa | StackRouter thật, Back, double press, reset theo điểm |
| Voice giả | Qa/Home, `VoiceInteractionDock` | Không timer, nhãn đúng hành động, drawer thủ công |
| Layout | Home/Qa/Landing/Plan/AlleySelect, thành phần giấy/card/dock hiện có | Màn thấp, font lớn, tên dài, empty state |
| Motion | `useMotion.ts`, motion tokens và mọi caller, `ExpandableInputDrawer` | Focus/AppState/Reduce Motion/interruption |
| Provenance | App truyền mode cho screen/component dùng copy | Demo, Live ready/empty/loading/error, đổi mode |
| Camera/GPS | Camera/Location và guard đang có | Giữ các ca cameraQr/source hiện có; kiểm native và phần cứng |

Không đổi fixture chỉ để UI luôn có Q&A hoặc luôn có điểm mở. Dữ liệu rỗng/đóng phải là ca kiểm của thiết kế.

## 8. Kế hoạch kiểm thử và nghiệm thu

### Regression tự động

1. Sửa harness animation: `setValue` thực sự đổi giá trị, callback mang `{finished}`; test hủy riêng. Mount Prologue thật cho ca Back/CTA, không chỉ mock tên screen.
2. Dùng StackRouter đang cài để kiểm lịch sử lặp Q&A/Sổ tay và Back về Home. Không viết mock `navigate` tự giả rằng route luôn được tái sử dụng.
3. Test hành động hỏi bằng chữ, reset theo điểm/source, không có delayed drawer sau chuyển màn. Không giữ assertion chỉ xác nhận “có hàm micro”.
4. Kiểm chọn điểm mở gần nhất, tất cả đóng, đầu/cuối; giữ validator sáu điểm và từ chối QR/chọn tay điểm đóng.
5. Kiểm motion policy qua focus/background/Reduce Motion; drawer close → reopen và callback hủy. Không thêm hàng chục snapshot style thay cho hành vi.
6. Giữ toàn bộ test parser, budget, source retry/cancellation, confirmation đang có. Chạy `test`, `typecheck`, `lint`, `git diff --check` sau từng đợt; export hai platform khi source ổn định.

### Kiểm native

| Ca | Điều phải quan sát |
| --- | --- |
| Prologue → Landing → Back | Không màn tối/trống, không button vô hình còn nhận tap |
| Home, cửa sổ thấp/ngang | Tất cả điểm mở và CTA tới được; không bị dock/card che |
| Font 1.0 / 1.3 / 1.5, tên dài | Không cắt nội dung quan trọng; cuộn khi cần |
| Q&A điểm 01 và 05 | Trả lời đúng điểm, empty state rõ, không giả voice |
| Drawer + bàn phím, đóng/mở nhanh | Không nhảy, không mắc Modal, focus nhập hợp lý |
| Q&A ↔ Plan lặp 5 lần | Back ngắn và nhất quán; không nhân đôi màn |
| Background/resume, Reduce Motion | Không loop thừa, không opacity sai, hành động vẫn hoàn tất |
| Live thiếu config/lỗi/ready; chuyển Demo | Copy đúng nguồn; response cũ không ghi đè nguồn mới |
| QR/GPS trên điện thoại thật | Quyền, lens/vị trí thực, hủy/Back, xác nhận đúng ID |
| TalkBack/VoiceOver | Tên hành động, thứ tự đọc, selected/disabled, focus drawer |

Expo export iOS chỉ chứng minh bundle build được; nghiệm thu iPhone cần chạy thực tế. Android emulator chỉ chứng minh những ca đã quan sát, không thay thế GPS/ống kính hoặc hiệu năng máy thật.

### Đo mượt và thời gian phản hồi

- Đo cùng thiết bị, cùng dữ liệu/ảnh, trên bản release; ghi baseline trước C/D. Không lấy độ mượt của Expo Go hoặc emulator làm số đo cuối.
- Ghi frame-time/jank trong chuyển màn, đổi điểm liên tục, mở drawer với bàn phím và background/resume. Báo median/p95 và đoạn bị giật nếu công cụ hỗ trợ.
- Mục tiêu thiết kế theo refresh rate thực tế: khoảng 16.7ms/frame ở 60Hz, 8.3ms ở 120Hz trên thiết bị hỗ trợ. Không cam kết mọi thiết bị đạt 120fps.
- Kiểm loop đang chạy khi màn ẩn bằng instrumentation/profiler; đếm listener/timer sau lặp 20 lần. Không tăng theo số lần mở màn.
- Bấm 10 điểm/nút nhanh: dữ liệu cuối đúng, không mất thao tác, không điều hướng kép. Nội dung đã có hiển thị ngay; motion không tạo thời gian chờ giả.
- Nếu chưa có thiết bị/profiler phù hợp, ghi **chưa đo**, không ghi “mượt 60fps” chỉ vì build/test đạt.

## 9. Trạng thái bàn giao và quyết định tiếp theo

- Người dùng đã duyệt phần còn lại; không cần duyệt lại quyền triển khai A–D. Các mục thiết kế phía trên là căn cứ đã dùng, không còn là đề xuất đang chờ.
- Phần code A–D đã triển khai. **111/111 test**, typecheck, lint, Android/iOS Expo export và diff tracked check đạt sau chỉnh sửa cuối.
- Có bằng chứng Android native cho Prologue/Back, Q&A/Plan/chọn điểm, bàn phím, Home thấp và chữ 150%; [bàn giao](UI_UX_IMPLEMENTATION_HANDOFF.md) phân biệt kiểm thật trên emulator với regression có mock.
- **D chưa hoàn tất nghiệm thu phần cứng:** chưa đo release frame-time/jank, chưa chạy iOS runtime, TalkBack/VoiceOver hoặc GPS/QR trên điện thoại thật.
- Không commit/push/publish trong lượt triển khai. Thay đổi có trước được giữ lại.

Nguồn kỹ thuật: [React Native Animated](https://reactnative.dev/docs/animated), [AccessibilityInfo](https://reactnative.dev/docs/accessibilityinfo), [navigation lifecycle](https://reactnavigation.org/docs/navigation-lifecycle/), [stack actions](https://reactnavigation.org/docs/stack-actions/). Hành vi navigation đã được đối chiếu thêm với router cài trong dự án.
