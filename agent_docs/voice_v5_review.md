# Voice V5 — Q&A voice end-to-end

## Revalidation — 13/10/2026

Bản thu từ recorder Android sau khi sửa đã tới STT worker thật. Vì AVD không có lời nói nên worker trả `NO_SPEECH`; app hiện **Thử lại bằng giọng nói** và không tạo câu trả lời từ audio rỗng. Điều này chỉ xác nhận nhánh không nghe thấy tiếng nói; transcript thật → Q&A cố định → audio đáp án vẫn pending, nên GV5 còn mở.

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

## Regression follow-up — 13/10/2026

- Audit phát hiện đổi chương/chế độ/revision ngay trong Q&A có thể làm callback cũ bị bỏ nhưng stage vẫn kẹt; audio và lỗi của scope trước cũng có thể còn trên màn hình. Scope change giờ hủy lượt và request, dừng player, xóa lỗi cũ và đưa stage về idle. Mở/đóng sheet chữ không đổi scope.
- Thêm regression cho chuyển chương, Demo/Live, dataset revision và giữ nguyên scope. Bộ test hiện tại 126/126; typecheck, lint và Expo dependency check đều đạt.
- Chưa có thiết bị thật để chứng minh chuyển scope đúng lúc mic đang thu hoặc gateway đang nhận dạng; GV5 end-to-end vẫn pending.
