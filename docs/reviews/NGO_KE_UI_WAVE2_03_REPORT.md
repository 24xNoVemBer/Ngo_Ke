# Ngõ Kể — NK-UI-03 Implementation Report

**Verdict:** `READY_FOR_NATIVE_QA`  
**Workspace:** `D:\ngo_ke`  
**Branch / HEAD:** `valentino/logic-fix-mobile-20261020` / `4af64c49a4ada47f952ddf76c35adfb90f826224`

## Phạm vi và baseline

Đã triển khai duy nhất NK-UI-03 trong QaScreen. Worktree trước khi sửa đã có nhiều thay đổi chưa commit; không đổi branch, reset, stash, xóa hoặc ghi đè chúng. `QaScreen.tsx`, `translator.ts` và hai test file đã ở trạng thái modified từ trước. Cụ thể, diff QaScreen có sẵn đã gỡ empty notice cho node không có Q&A; thay đổi đó được giữ nguyên. Các bản dịch Plan đã có sẵn trong translator cũng được giữ.

## Hành vi có sẵn và được giữ

- Bottom microphone dock được render độc lập với số Q&A của node.
- Chip Q&A chỉ hiện khi danh sách thực tế có phần tử; ExpandableInputDrawer cũng tự ẩn vùng gợi ý khi danh sách rỗng.
- `listen`, `replay`, `stop`, `next`, `plan`, `open-qr` và `open-gps` tiếp tục đi qua intent/session handlers hiện hành.
- Story/answer playback, quyền microphone, stop/cancel, navigation, Demo/Live isolation và locale handling không bị thay đổi.

## Thay đổi NK-UI-03

| Trạng thái | Trước | Sau |
| --- | --- | --- |
| Node có Q&A | Dock và drawer dùng copy chung | Giữ nguyên copy và hành vi Q&A hiện tại |
| Node không có Q&A | Dock dùng nhãn hỏi Q&A; input ghi “nhập câu hỏi” | Dock ghi rõ “Điều khiển bằng giọng nói / Voice controls”, kèm ví dụ lệnh; placeholder yêu cầu nhập lệnh |
| Nội dung không có câu trả lời | Thông báo chung có thể nhắc các câu gợi ý không tồn tại | Tiêu đề và hướng dẫn ngắn theo story mode, gợi ý nghe lại, dừng hoặc chuyển trạm |

Các chuỗi mới đều được dịch tập trung trong `translator.ts`. Copy riêng chỉ được truyền khi `nodeQa.length === 0`; trạng thái ghi âm, đang gửi, lỗi và các node có Q&A vẫn dùng nội dung trạng thái hiện hành. Không sửa `useVoiceSession`, parser/intent, backend, audio hay navigation.

## Files thay đổi

- `mobile/src/screens/QaScreen.tsx` — gắn copy story mode theo `nodeQa`; hiển thị phản hồi unknown theo ngữ cảnh.
- `mobile/src/components/VoiceInteractionDock.tsx` — nhận tùy chọn idle title/subtitle; giữ nguyên mic/input actions và các trạng thái khác.
- `mobile/src/i18n/translator.ts` — thêm VI/EN keys cho dock, placeholder và unknown response.
- `mobile/tests/qaNodeStoryVoice.test.mjs` — kiểm tra story mode cả VI/EN, mic/input còn hoạt động, gợi ý rỗng không render và unknown typed/voice.
- `mobile/tests/uiFlows.test.mjs` — kiểm tra copy được render trên dock và callback mic/typed input còn hoạt động; cập nhật expectation cho fixture `qa=[]`.
- `docs/reviews/NGO_KE_UI_WAVE2_03_REPORT.md` — báo cáo này.

`ExpandableInputDrawer.tsx` không cần sửa: component đã ẩn phần gợi ý khi danh sách rỗng và nhận placeholder qua prop. Không sửa HomeScreen, image consumers, data, Q&A, audio/catalogue hoặc tests ngoài phạm vi liên quan.

## Regression

| Lệnh | Kết quả |
| --- | --- |
| `node --test --test-reporter=dot tests/qaNodeStoryVoice.test.mjs tests/voiceIntent.test.mjs tests/uiFlows.test.mjs` | PASS, 103 tests, 0 fail |
| `npm test` | PASS, 429 tests, 0 fail, 0 skipped |
| `npm run typecheck` | PASS (`tsc --noEmit`) |
| `npm run lint -- --no-cache` | PASS |
| `git diff --check` | PASS |

Test coverage xác nhận VI/EN, cả typed và voice unmatched trên node không có Q&A, dock thực tế hiển thị copy mới, và mic/type callbacks vẫn gọi được. Intent recognition, session lifecycle, playback và API không bị sửa; regression suite hiện hành tiếp tục đạt.

## Rủi ro còn lại và native acceptance

Đây là kiểm thử host với component/test harness; chưa xác nhận bố cục, focus, bàn phím iOS, quyền microphone hoặc VoiceOver trên thiết bị. Báo cáo native QA hiện có cũng ghi chưa có native session và mục QaScreen keyboard/dock đang `NATIVE_PENDING`.

Checklist cần xác minh trên iPhone thật:

1. Mở một node story-only bằng VI và EN; xác nhận nhãn dock và ví dụ lệnh dễ hiểu, mic và nút nhập vẫn hiện.
2. Mở drawer; xác nhận placeholder đúng locale, không có tiêu đề/vùng câu hỏi gợi ý rỗng; nhập lệnh rồi gửi, đóng bằng nút và Back.
3. Xác nhận bàn phím không che nội dung nhập/gửi và dock trở lại thao tác được sau khi đóng drawer.
4. Nhập/nói một yêu cầu không được hỗ trợ; xác nhận phản hồi ngắn, lịch sự, không tạo câu trả lời mới.
5. Thử lại các lệnh hợp lệ `listen`, `replay`, `stop`, `next`, `plan`, `open-qr`, `open-gps` trong bối cảnh tương ứng; kiểm tra không tự mở QR/GPS khi chưa có thao tác xác nhận cần thiết.
6. Mở node có Q&A để xác nhận chips, follow-up và placeholder hỏi nội dung giữ nguyên; đổi VI/EN khi màn hình đang mở.
7. Kiểm tra Demo và Live riêng biệt, trạng thái thiếu dữ liệu/lỗi Live không hiển thị dữ liệu Demo; xác nhận VoiceOver đọc được nhãn và trạng thái.

Native QA chưa chạy trong lượt này và không được đánh dấu PASS.

## NK-UI-04A

Ở mức source/host regression, NK-UI-03 không tạo dependency hoặc xung đột file với phạm vi UI-04A trong handoff (HomeScreen, AlleyStoryCard và component player mới). Có thể xem UI-04A là **sẵn sàng để xem xét cấp quyền riêng**. Đây không phải quyền bắt đầu UI-04A; ticket đó vẫn cần được người dùng mở rõ ràng. Không thực hiện audio presentation hoặc thay đổi lifecycle trong lượt này.

## Việc cần anh quyết / việc anh tự làm

- **Cần anh quyết:** Chưa cần quyết định thêm để nhận NK-UI-03. Nếu muốn triển khai NK-UI-04A, hãy mở ticket đó bằng yêu cầu riêng; quyền hiện tại chỉ bao gồm NK-UI-03.
- **Cần anh tự làm:** Chạy checklist native iPhone ở trên và ghi nhận nếu dock, bàn phím, mic hoặc VoiceOver có vấn đề. Native acceptance chưa có bằng chứng trong môi trường host.
