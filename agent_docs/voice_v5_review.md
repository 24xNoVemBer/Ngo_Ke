# Voice V5 — Q&A voice end-to-end

## Two voice-turn UI regression — 14/10/2026

- A two-callback UI regression sends the exact follow-up “Có chuyện xưa nào ở đây không?” after the first voice question and verifies that it selects and plays the matching `qa-05` answer track. This verifies Q&A routing across two transcript callbacks, not two native microphone submissions; physical follow-up remains pending.

## Unmatched transcript feedback — 14/10/2026

- Khi transcript không khớp Q&A, kết quả đã giữ `asked` nhưng bị ẩn nên người dùng chỉ thấy “Chưa có lời kể cho câu này”, không biết STT đã nghe gì. Thêm nút “Xem câu đã nhận dạng” cho voice và “Xem câu vừa hỏi” cho chữ; nội dung vẫn ẩn mặc định cho tới khi người dùng chạm theo spec.
- UI regression xác nhận transcript unknown vẫn ẩn trước thao tác, rồi hiện đúng sau khi người dùng mở. Không đổi exact matcher, không fuzzy match. Sau reload Expo Go, người dùng xác nhận meter và câu trả lời chạy trong một lượt voice iPhone; chưa có transcript nguyên văn/log để xác minh câu được nhận khớp entry nào.

## Revalidation — 13/10/2026

Bản thu từ recorder Android sau khi sửa đã tới STT worker thật. Vì AVD không có lời nói nên worker trả `NO_SPEECH`; app hiện **Thử lại bằng giọng nói** và không tạo câu trả lời từ audio rỗng. Sau đó người dùng xác nhận một lượt voice iPhone có meter và câu trả lời hoạt động; chưa có transcript/log để xác minh exact matching độc lập, nên full 6 chương/21 Q&A và các nhánh follow-up/unknown vẫn pending, GV5 còn mở.

## Regression follow-up — 13/10/2026

- Sửa hành vi khi transcript Voice khớp câu trả lời ở Live: không gọi player Demo và không lưu track Demo cho lệnh nghe lại. Hiện rõ rằng bản đọc Live chưa có; câu trả lời vẫn đóng mặc định và chỉ mở khi người dùng chạm “Xem lời kể bằng chữ”.
- Regression test xác nhận Demo phát đúng ID audio, Live không phát/replay audio Demo và giữ text disclosure đóng; toàn suite 135/135, typecheck/lint/`git diff --check` pass.
- APK hiện tại mở được trên Android API 37 AVD; Q&A và voice dock hiển thị, player ở trạng thái sẵn sàng, nội dung chữ chỉ xuất hiện sau thao tác mở. Ảnh kiểm UI: [Q&A](evidence/voice/android37-qa-screen-2026-10-13.png) và [reader mở](evidence/voice/android37-reader-open-2026-10-13.png).
- GV5 vẫn pending: chưa có mic thật đi qua gateway, matcher, answer và native playback end-to-end.

**Ngày:** 13/10/2026
**Trạng thái:** matcher/context/UI đã nối; emulator xác nhận chip mở đúng answer card/clip sẵn sàng và không autoplay; voice-to-answer từ transcript mic còn pending.
**Gate GV5:** chưa đóng vì chưa có transcript từ mic thật đi hết vòng rồi nghe đáp án native.

## Đã làm

- Transcript gốc được giữ để người dùng xem/sửa; normalize chỉ phục vụ tra cứu. Tra Q&A cố định trong node/chương hiện tại, không LLM, không fuzzy silently chọn câu ở chương khác.
- Match đúng entry ID để lấy answer và clip hash tương ứng. Answer chỉ tự phát sau khi người dùng vừa gửi câu bằng voice; chip hỏi tiếp không bất ngờ bật loa. Kết thúc audio không tự bật mic.
- Có đường unknown/retry/gõ chữ; câu chữ và answer ẩn mặc định, mở theo nút rõ ràng.
- Danh mục audio test phủ đủ 6 node/21 answer; UI-flow tests kiểm thay node/mode và trạng thái Live/Demo, chips, text disclosure, retry/context stale.

## Bằng chứng và giới hạn

- Source: `mobile/src/voice/` và `mobile/src/screens/QaScreen.tsx`.
- `mobile/tests/voiceCatalogue.test.mjs`, `mobile/tests/uiFlows.test.mjs`, matcher hiện có; toàn suite 126/126, typecheck/lint đạt.
- Android API 37 emulator: chạm câu hỏi gợi ý mở answer card của chương hiện tại; player hiển thị trạng thái “Sẵn sàng” và nút Play, không tự bật loa. Native transcript từ mic chưa kiểm vì không cấp quyền/thu âm.
- Chưa chạy câu nói từ điện thoại → upload → đúng transcript → đúng answer → phát clip trên thiết bị. Chưa kiểm alias bằng tiếng nói thực hoặc ASR ngoài phòng yên tĩnh.

**Còn lại:** chạy vòng voice nhiều lượt ở cả sáu chương trên thiết bị; thử unknown, câu hỏi ngoài bộ, sửa transcript, đổi điểm khi đang nhận dạng và hủy/back để chứng minh không có response/audio cũ.

## Regression Q&A cả sáu chương — 14/10/2026

- UI test gửi đủ 21 câu canonical; với mỗi câu, gửi thêm follow-up đầu tiên trong cùng node. Cả 42 callback chọn đúng answer ID/text và audio track của chương hiện tại.
- `node --test tests/uiFlows.test.mjs`: 23/23; `npm test`: 145/145; typecheck và lint đạt.
- Đây là regression ở lớp UI với transcript có kiểm soát, không phải bằng chứng mic/STT thật. GV5 vẫn mở cho kiểm tra voice end-to-end trên thiết bị, gồm lượt hai người dùng vừa báo lỗi.

## Regression follow-up — 13/10/2026

- Audit phát hiện đổi chương/chế độ/revision ngay trong Q&A có thể làm callback cũ bị bỏ nhưng stage vẫn kẹt; audio và lỗi của scope trước cũng có thể còn trên màn hình. Scope change giờ hủy lượt và request, dừng player, xóa lỗi cũ và đưa stage về idle. Mở/đóng sheet chữ không đổi scope.
- Thêm regression cho chuyển chương, Demo/Live, dataset revision và giữ nguyên scope. Bộ test hiện tại 126/126; typecheck, lint và Expo dependency check đều đạt.
- Chưa có thiết bị thật để chứng minh chuyển scope đúng lúc mic đang thu hoặc gateway đang nhận dạng; GV5 end-to-end vẫn pending.
