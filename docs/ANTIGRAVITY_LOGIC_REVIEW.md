# Ngõ Kể — Rà soát logic sau khi đổi UI

Ngày: 11/10/2026. Phạm vi: thay đổi chưa commit so với HEAD và các module được gọi từ UI.

> Cập nhật sau yêu cầu “fix đi”: các mục trong báo cáo đã được xử lý. Xem [bàn giao sửa logic](UI_LOGIC_FIX_HANDOFF.md) để biết hành vi hiện tại, kiểm tra và giới hạn. Phần dưới giữ nguyên kết quả review trước khi sửa.

**Thay đổi này làm gì:** Bản mới thêm Landing, chọn ngõ, sơ đồ điểm, hỏi đáp dạng lời kể và các thẻ gợi ý. Luồng trông đầy đủ hơn nhưng một số nút, trạng thái và dữ liệu chưa nối với nhau.

**Kết luận: chưa nên nghiệm thu luồng demo. Sửa nhóm 1–8 trước; xử lý 9–11 khi nghiệm thu gợi ý hành trình và Live.** Không cần xây lại UI hay thêm backend để sửa các lỗi này.

Theo yêu cầu mới của bạn, **demo được dùng ảnh chung**. Việc dùng chung ảnh không phải lỗi trong báo cáo này; không yêu cầu thay ảnh. Lượt này chỉ rà soát và đề xuất, chưa sửa mã ứng dụng.

## Cần sửa trước

### 1. GPS ở màn chọn ngõ bỏ qua tọa độ và luôn trả về Hà Nội — mới, P1

- **Hiện trạng:** [AlleySelectScreen.tsx](../mobile/src/screens/AlleySelectScreen.tsx#L35) tự xin quyền khi mở màn. Cả nhánh tự chạy và nút làm mới đều lấy vị trí nhưng không dùng tọa độ; nhánh làm mới gán “Phố cổ Hoàn Kiếm (GPS chính xác)” ở dòng 65. Ngõ gần nhất luôn là phần tử đầu.
- **Ca lỗi:** Người dùng ở ngoài Hà Nội cấp quyền rồi làm mới vẫn được báo ở Hoàn Kiếm. Từ chối/lỗi GPS vẫn giữ ngõ và khoảng cách mặc định. Danh sách ghi sắp xếp theo cự ly nhưng chỉ lọc, không sắp xếp; thứ tự khoảng cách tĩnh có 750 m trước 420 m.
- **Sửa nhỏ nhất:** Với demo, bỏ yêu cầu GPS tự động và bỏ tuyên bố vị trí chính xác ở màn này; dùng “Khu vực demo” và bỏ khoảng cách cá nhân hóa. Giữ định vị thật tại `LocationScreen`, nơi đã có `pickCandidate`, kiểm tra độ chính xác/phạm vi và bước xác nhận. Chưa có tọa độ từng ngõ thì chưa tính “ngõ gần bạn nhất”.
- **Nếu bỏ qua:** App đưa người dùng thông tin vị trí sai và xin quyền dù họ chỉ muốn xem danh sách.
- **Nghiệm thu:** Mở danh sách không hiện xin quyền; từ chối hoặc lỗi định vị không biến thành vị trí Hà Nội được xác nhận.

### 2. Điểm đang xem và điểm đã xác nhận lệch nhau — mới, P1

- **Hiện trạng:** [HomeScreen.tsx](../mobile/src/screens/HomeScreen.tsx#L100) chỉ khởi tạo `selectedIndex` từ `currentNodeId` một lần. GPS/QR sửa state ở App, còn Home vẫn giữ index cũ. Bấm khám phá lại gọi `onConfirmNode` với điểm đang giữ ở Home. Q&A cũng giữ một bản `activeId` riêng tại [QaScreen.tsx](../mobile/src/screens/QaScreen.tsx#L42).
- **Ca lỗi:** Ở Home chọn điểm 01 → mở GPS hoặc Camera → chọn tay điểm 03 → quay lại Home. Home vẫn hiện điểm 01; bấm khám phá còn ghi đè lựa chọn 03 về 01. Chuyển điểm trong Q&A rồi quay về Home cũng có thể gặp tình trạng tương tự.
- **Sửa nhỏ nhất:** Dùng ID thay vì index làm định danh; lấy điểm đã xác nhận từ state chung tại App. Nếu cần xem trước thì giữ riêng `previewNodeId`, đồng bộ khi điểm đã xác nhận đổi và không gọi `onConfirmNode` chỉ vì chạm pin/xem câu chuyện. Khi dataset đổi, kiểm tra ID còn tồn tại trước khi dùng.
- **Nếu bỏ qua:** Người dùng xác nhận đúng điểm nhưng app đưa họ về câu chuyện khác.
- **Nghiệm thu:** GPS, QR, chọn tay và chuyển điểm Q&A đều cho kết quả nhất quán khi quay lại; thao tác chỉ xem trước không âm thầm xác nhận vị trí.

### 3. Q&A trả lời sai điểm và giữ câu trả lời của điểm trước — cũ + mới, P1

- **Hiện trạng:** [QaScreen.tsx](../mobile/src/screens/QaScreen.tsx#L81) tìm đáp án trong toàn bộ `dataset.qa`; gợi ý/follow-up cũng dùng toàn bộ danh sách. Đây là lỗi có trước bản đổi UI. Bản mới thêm chuyển điểm nhưng [handler](../mobile/src/screens/QaScreen.tsx#L61) không xóa `asked`/`match`.
- **Ca lỗi:** Ở điểm 02 hỏi “Đây là điểm nào?” vẫn nhận “Bạn đang đứng ở Điểm demo 01”. Hoặc hỏi ở điểm 01 rồi bấm “Điểm kế tiếp”: tên và câu chuyện đã đổi nhưng đáp án cũ vẫn nằm bên dưới. Cả 6 Q&A hiện có đều thuộc `demo-01`.
- **Sửa nhỏ nhất:** Lọc `nodeQa` theo ID điểm đang xem, dùng cùng tập đó cho tìm đáp án, gợi ý và follow-up. Reset câu hỏi/đáp án khi đổi điểm hoặc dataset. Điểm chưa có Q&A hiển thị trạng thái thiếu nội dung, không lấy đáp án của điểm khác. Không tự sinh thêm nội dung lịch sử.
- **Nếu bỏ qua:** UI gắn câu trả lời đúng của một điểm sang điểm khác, khiến nội dung trở thành sai ngữ cảnh.
- **Nghiệm thu:** Điểm 02 không trả lời bằng Q&A của điểm 01; chuyển điểm xóa đáp án cũ; không tìm thấy có thông báo rõ.

### 4. Micro giả nhận giọng nói và vẫn gửi câu hỏi sau khi tắt — mới, P1

- **Hiện trạng:** [QaScreen.tsx](../mobile/src/screens/QaScreen.tsx#L93) bật nhãn “Đang lắng nghe” rồi dùng timer 1.400 ms để gọi câu hỏi đầu tiên trong dataset. Không có nhận dạng giọng nói. Timer không được hủy khi bấm tắt, đổi điểm hoặc rời màn.
- **Ca lỗi:** Bấm micro, không nói gì vẫn nhận câu trả lời; bấm micro lần hai để tắt trước 1,4 giây vẫn bị gửi câu hỏi mẫu. Gõ một câu khác trước khi timer chạy còn có thể bị đáp án mẫu ghi đè.
- **Sửa nhỏ nhất:** Bỏ timer và trạng thái nghe giả; giữ nhập chữ/câu hỏi gợi ý. Nếu cần trình diễn, đổi thành nút “Thử câu hỏi mẫu” và chạy ngay khi bấm, không giả nghe. Các nhãn âm thanh ở Landing và “0:28 · Giọng đọc ấm” trong Q&A cũng phải phản ánh khả năng thực tế hoặc ghi rõ minh họa.
- **Nếu bỏ qua:** App trình bày đầu vào tự tạo như câu hỏi của người dùng, khó kiểm thử và dễ gây hiểu nhầm.
- **Nghiệm thu:** Không có câu hỏi nào tự xuất hiện do timer; đóng màn/đổi điểm không phát sinh đáp án muộn. Không cần thêm STT/TTS cho đợt sửa này.

### 5. Các nút hành động không làm gì — mới, P1

- **Hiện trạng:** [PlanScreen.tsx](../mobile/src/screens/PlanScreen.tsx#L288) truyền `onSelect={() => {}}` vào nút “Khám phá”. Trong Q&A, [VoiceInteractionDock](../mobile/src/screens/QaScreen.tsx#L362) không nhận `onQuickAction` nhưng component vẫn hiện nút “Sổ tay” như một nút đang hoạt động.
- **Ca lỗi:** Chọn chủ đề và thời gian → bấm “Khám phá (… phút)” trên kết quả: không chuyển màn. Bấm “Sổ tay” ở dock Q&A: không có phản hồi.
- **Sửa nhỏ nhất:** Truyền callback từ App cho Plan để mở đúng điểm được chọn; dùng chung cách mở điểm với Home. Với Sổ tay, nối vào đích có sẵn hoặc không render nút khi không có callback.
- **Nếu bỏ qua:** Luồng chính kết thúc ở nút chết dù giao diện hứa cho khám phá tiếp.
- **Nghiệm thu:** Mỗi thẻ gợi ý mở đúng node; không còn nút có hình thức hoạt động nhưng thiếu handler.

### 6. Tiến độ và dấu “đã ghé” không theo hành động người dùng — mới, P1

- **Hiện trạng:** [HomeScreen.tsx](../mobile/src/screens/HomeScreen.tsx#L111) ép số đã mở tối thiểu thành 1; thanh tiến độ tối thiểu 16%. Dấu “ĐÃ GHÉ THĂM” luôn hiện ở dòng 396. [LandingScreen.tsx](../mobile/src/screens/LandingScreen.tsx#L307) đánh dấu ngõ đầu tiên bằng `index === 0`. Fixture có toàn bộ `visited: false`; callback xác nhận chỉ đổi ID, không cập nhật tiến độ.
- **Ca lỗi:** Mở app mới đã có 1/6 câu chuyện và một ngõ đã ghé. Đọc thêm nhiều điểm thì tiến độ không tăng. Home có dấu đã ghé nhưng Postcard của cùng điểm lại không có.
- **Sửa nhỏ nhất:** Đợt sửa tối thiểu nên bỏ hộ chiếu và dấu hoàn thành chưa có logic. Nếu giữ “đã đọc”, dùng một tập ID ở App, cập nhật khi mở/hoàn thành câu chuyện theo quy ước rõ ràng; mọi màn đọc cùng tập đó. Không đồng nhất “đã đọc” với “đã đến địa điểm”. Bắt đầu bằng 0, không ép tiến độ khác 0.
- **Nếu bỏ qua:** Người dùng không thể tin số đã đọc/đã ghé, và tính năng gợi ý cũng không biết tiến độ thật.
- **Nghiệm thu:** Mới mở là 0; đọc một điểm tăng đúng một lần; xem lại không tăng; các màn cùng hiển thị một kết quả. Lưu qua lần mở app là yêu cầu riêng, không cần thêm nếu demo chỉ theo phiên.

### 7. Live thiếu dữ liệu vẫn có pin; màn Q&A thiếu đường quay lại rõ ràng — mới, P1

- **Hiện trạng:** Home dùng `nodes=[]` khi nguồn chưa sẵn sàng nhưng vẫn render sáu `PIN_CONFIG` và nút khám phá ở dock. Số tiến độ thành `1/0`. [App.tsx](../mobile/App.tsx#L130) ẩn header Q&A cho cả nhánh `UnavailableScreen`, trong khi [màn đó](../mobile/src/screens/UnavailableScreen.tsx#L9) không có nút quay lại hoặc chuyển Demo.
- **Ca lỗi:** Home → Sổ tay → Live khi chưa cấu hình → đóng Sổ tay → bấm nút khám phá ở giữa. Người dùng vào màn thiếu dữ liệu được dặn chuyển Demo nhưng không có nút thực hiện. Android có thể dùng Back hệ thống; không được coi đó là đường thoát đủ cho mọi nền tảng và cách nhập liệu.
- **Sửa nhỏ nhất:** Rẽ nhánh ready/empty/error trước khi render sơ đồ; nguồn chưa sẵn sàng thì không hiện pin hay CTA cần dataset. Truyền `onBack` và/hoặc `onSwitchToDemo` cho màn unavailable. Dùng safe area trên cùng khi không có header.
- **Nếu bỏ qua:** Giao diện gợi ý có nội dung dù không có dữ liệu, rồi đưa người dùng vào màn khó thoát.
- **Nghiệm thu:** Live no-config/no-data/network-error không hiện tiến độ giả; có nút quay lại và chuyển Demo hoạt động ngay trên màn lỗi.

### 8. Nhãn pin không cùng nguồn với điểm được mở — mới, P2

- **Hiện trạng:** [HomeScreen.tsx](../mobile/src/screens/HomeScreen.tsx#L41) đặt tên riêng cho sáu pin nhưng [handler/render](../mobile/src/screens/HomeScreen.tsx#L274) ghép node theo vị trí mảng. `pinMeta.id` không được dùng để tìm node. Ví dụ pin thứ hai ghi “Quán cà phê vợt” nhưng mở `demo-02`, điểm có tag chuyện xưa.
- **Ca lỗi:** Chạm pin có tên quán cà phê → thẻ/Q&A hiện “Điểm demo 02” và nội dung khác tên vừa chọn. Nếu server trả cùng các node theo thứ tự khác thì pin tiếp tục gắn nhầm.
- **Sửa nhỏ nhất:** Render tên/icon/ngữ nghĩa từ node; cấu hình sơ đồ chỉ giữ tọa độ và tra bằng ID. Nếu muốn tên demo giàu hình ảnh, sửa nhất quán tại nguồn nội dung, không tạo một bộ tên riêng ở màn hình. Điểm `available:false` cần có trạng thái không mở được.
- **Nếu bỏ qua:** Người dùng không biết pin, thẻ và câu chuyện có phải cùng một điểm hay không.
- **Nghiệm thu:** Đảo thứ tự node vẫn mở đúng ID và tên; điểm unavailable không mở như điểm đang sẵn sàng.

## Lỗi có trước bản đổi UI nhưng còn ảnh hưởng trải nghiệm

### 9. Nút “Thử lại” Live có thể không tải lại — có trước, P1

- **Hiện trạng:** [App.tsx](../mobile/App.tsx#L64) gọi `setLiveBusy(true)` rồi `setLiveBusy(false)` trong cùng callback; effect tải phụ thuộc `mode, liveBusy`.
- **Ca lỗi:** Live tải thất bại, server hoạt động trở lại, bấm “Thử lại”. React gộp cập nhật và state cuối vẫn là false nên không có thay đổi dependency để tải lại. Nhánh tải cũng không tự đặt busy khi bắt đầu request.
- **Sửa nhỏ nhất:** Cho nút retry kích hoạt một lần tải thật: dùng hàm tải chung hoặc một bộ đếm retry cho effect; busy chỉ phản ánh request đang chạy. Giữ xử lý hủy/bỏ kết quả cũ khi đổi nguồn, không bỏ validation của adapter.
- **Nếu bỏ qua:** Nút khôi phục không khôi phục được sau lỗi mạng.
- **Nghiệm thu:** Một lần lỗi → một lần retry thành công; bấm khi đang tải không tạo request chồng; đổi về Demo không bị kết quả Live cũ ghi đè UI.

### 10. Chọn thời gian không giới hạn các điểm gợi ý — có trước, P1

- **Hiện trạng:** [pick.ts](../mobile/src/recommendation/pick.ts#L59) kiểm tra có `budgetMinutes`, nhưng chỉ lọc chủ đề, sắp theo thời lượng và lấy tối đa ba điểm.
- **Ca lỗi đã chạy trực tiếp:** Chủ đề ẩm thực, ngân sách 15 phút trả các điểm 10, 20 và 25 phút; đổi thành 60 phút vẫn cùng ba điểm. Màn mới gọi đó là “hành trình” nên người dùng càng dễ hiểu là đi được cả danh sách trong thời gian đã chọn.
- **Sửa nhỏ nhất:** Chốt nghĩa đầu ra. Đề xuất phù hợp nhãn hiện tại: một hành trình, tổng thời gian dừng không vượt ngân sách; duyệt danh sách đã sắp và chỉ thêm điểm còn vừa thời gian. Ghi rõ demo chưa tính thời gian đi bộ. Nếu chỉ là các lựa chọn độc lập thì lọc từng điểm theo ngân sách và ghi “chọn một điểm”.
- **Nếu bỏ qua:** Chức năng chọn thời gian không có tác dụng thực tế.
- **Nghiệm thu:** Ngân sách 15 phút không trả một hành trình 55 phút; quá ít thời gian có trạng thái trống rõ; điểm đã ghé/không khả dụng vẫn được loại như trước.

### 11. Nhập chủ đề và thời lượng hiểu sai tiếng Việt — có trước, P2

- **Hiện trạng:** [pick.ts](../mobile/src/recommendation/pick.ts#L28) so chuỗi đã bỏ dấu với nhãn còn dấu; khóa chủ đề là `an thuc`. Parser giờ ưu tiên số giờ trước khi xét “rưỡi” và regex có thể lấy số dương nằm trong chuỗi âm.
- **Ca lỗi đã chạy trực tiếp:** `ẩm thực` → không nhận; `1 tiếng rưỡi` → 60; `-5 phút` → 5.
- **Sửa nhỏ nhất:** Chuẩn hóa cả input lẫn nhãn chủ đề bằng helper hiện có. Parse thời lượng theo biểu thức có kiểm soát, xử lý phần rưỡi cùng số giờ và chỉ nhận giá trị dương hợp lệ; không lấy một mảnh số bất kỳ trong input sai.
- **Nếu bỏ qua:** Bấm chip được nhưng nhập cùng ý bằng chữ lại lỗi hoặc ra ngân sách sai.
- **Nghiệm thu:** `ẩm thực`/`am thuc` cùng ra chủ đề; `1 tiếng rưỡi` = 90; `2 tiếng rưỡi` = 150; số âm, số 0 và chuỗi vô nghĩa bị từ chối.

## Có thể cải thiện thêm sau khi sửa lỗi

1. **Giữ một đường hỏi bằng chữ rõ ràng.** Home đang có `ExpandableInputDrawer` nhưng không nơi nào gọi `setInputVisible(true)`; submit còn bỏ `typedQuestion`. Xóa phần không dùng và giữ nhập tại Q&A là cách sửa ít nhất; chỉ nối thêm Home nếu có yêu cầu cụ thể.
2. **Nguồn phải đi cùng đúng nội dung.** Q&A hiển thị `currentNode.story` nhưng phần “Nguồn kiểm chứng” lấy `intro.evidence` (dòng 253–256). Hiện fixture chỉ có chú thích mô phỏng; nên gọi đúng là “Ghi chú dữ liệu demo”, không trình bày như bằng chứng riêng của từng câu chuyện. Khi có dữ liệu thật mới nối evidence theo từng nội dung.
3. **Dùng nhãn ngắn cho nút đáy.** “GPS”, “Khám phá”, “Sổ tay” giúp người mới hiểu thao tác hơn ba biểu tượng đơn lẻ; đây là cải thiện khả năng khám phá chức năng, không cần thêm màn hình.
4. **Dọn phần không được gọi sau khi nối xong luồng.** `AlleyTrailView` chưa được màn nào dùng. Chọn một cách render sơ đồ, tránh duy trì hai bản logic tiến độ. Không cần thêm state library hay hệ thống component mới.
5. **Kiểm tra màn nhỏ và cỡ chữ lớn trên native.** Home tính tọa độ từ canvas tối thiểu 520 trong khi vùng chứa dùng flex; cần kiểm tra pin cuối/CTA khi không gian hiển thị ngắn. Đây là rủi ro layout cần chạy thiết bị, chưa kết luận là lỗi runtime đã quan sát.

## Thứ tự giao Antigravity sửa

| Đợt | Việc cần làm | Điều kiện hoàn thành |
| --- | --- | --- |
| 1 | Sửa 2, 3, 5, 8: ID điểm, Q&A theo điểm, nút mở đúng nội dung | Đi từ Home/Plan/GPS/QR sang Q&A nhất quán; quay lại không mất lựa chọn |
| 2 | Sửa 1, 4, 6, 7: bỏ phản hồi giả, tiến độ thật hoặc ẩn, trạng thái thiếu dữ liệu | Demo không giả GPS/giọng nói/đã ghé; tất cả màn lỗi có đường thoát |
| 3 | Sửa 9–11 và dọn code không dùng | Retry chạy thật; ngân sách tác động kết quả; parser có ca biên |
| 4 | Chạy native với các ca nghiệm thu ở từng mục | Có ảnh/clip của build hiện tại và ghi rõ thiết bị, không lấy bằng chứng phase cũ |

Không thay ảnh cho đợt fix này. Không viết lại giao diện. Không thêm STT/TTS, backend, hộ chiếu mới hoặc dependency chỉ để khắc phục các vấn đề trên.

## Đã kiểm tra và giới hạn

- Đọc diff, screen/callback liên quan, App/navigation, component mới, fixture, Q&A matcher, gợi ý hành trình và xử lý nguồn dữ liệu; đối chiếu với HEAD để phân biệt lỗi cũ/mới.
- **90/90 test hiện có đạt; TypeScript và ESLint đạt.** Các test hiện có chưa chứng minh các handler mới trên UI hoạt động đúng.
- Đã thực thi trực tiếp parser, `pickPoints` và matcher với fixture để xác nhận các giá trị nêu tại mục 3, 10, 11. Không sửa test hay code app trong lượt này.
- Chưa chạy kiểm thử tương tác native của build mới: không có thiết bị/emulator đang kết nối tại thời điểm rà soát (máy có cấu hình AVD). Chưa kiểm TalkBack/VoiceOver, bàn phím, font lớn và layout thực tế. Các ca thao tác trong báo cáo là đường tái hiện từ code, không được trình bày như đã bấm thử trên thiết bị.
- Phạm vi riêng tư/quyền chỉ kiểm đường gọi GPS/camera trong code, không phải kiểm toán bảo mật toàn hệ thống. Dùng chung ảnh demo đã được bạn chấp nhận và không là điều kiện chặn nghiệm thu logic.

**Verdict: sửa 1–8 trước khi nghiệm thu demo; sửa 9–11 trước khi coi Live và lập hành trình đã hoàn chỉnh.**
