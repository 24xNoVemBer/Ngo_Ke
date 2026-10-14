# Voice V5 — Q&A voice end-to-end

## Local synthetic question ASR sweep — 14/10/2026

- Dùng VieNeu v3 Turbo local để tạo audio tổng hợp từ 21 câu hỏi canonical, rồi chạy trực tiếp faster-whisper-small đã pin (`language=vi`, `beam_size=5`, `vad_filter=true`) và đối chiếu transcript bằng `findAnswer` thật của app trong đúng node.
- Kết quả trên một lượt sinh: **14/21** transcript ghép chính xác; 7 câu trả `unknown`, không có câu nào ghép nhầm sang answer khác. Theo chương: `demo-01` 6/6, `demo-02` 1/3, `demo-03` 2/3, `demo-04` 1/3, `demo-05` 1/3, `demo-06` 3/3.
- Thử vocabulary `initial_prompt` trên cùng 21 audio còn **11/21**, không cứu câu nào và làm trượt `qa-lam`, `qa-ribbon`, `qa-cake`; không đưa prompt vào gateway. Exact matcher được giữ để ASR sai không tự trả lời sai.
- Regression mới khóa 16 transcript near-miss từ hai probe ASR tổng hợp ở trạng thái `unknown` trong đúng node. Đây giữ hành vi an toàn, không làm tăng độ nhận dạng và không thay lời nói thật.
- Đây là probe offline bằng giọng tổng hợp, gọi cùng model/tham số nhưng không qua app→gateway, không phải lời nói của người dùng hoặc kiểm tra mic/điện thoại. Report tạm và audio nằm trong `tools/voice/.cache/qa-asr-smoke/`; WAV được xóa sau decode.
- Kết quả này chỉ cho thấy unknown fallback cần tiếp tục được dùng; GV5 vẫn chờ speech E2E thật trên đủ sáu chương. Không đổi source hoặc alias theo lỗi phát âm tổng hợp.

## iPhone follow-up retest — 14/10/2026

- User confirms the second consecutive iPhone voice turn had a moving meter, displayed a transcript and the correct answer, and played audible answer audio. Record this as one user-reported physical-device STT→Q&A→playback success; no raw audio/log, exact transcript, or node ID was supplied.
- A later host-side probe of the iOS bundle on Metro `:8081` returned HTTP 200 and included the configured gateway URL; the user has not yet reloaded this bundle on iPhone. Metro `:8089` `/status` responds and its Node listener is live, but fetching its iOS bundle timed out after 180 seconds. The successful user-reported turn was on `:8089`, so it does not verify the current `:8081` bundle configuration.
- Added data-driven matcher coverage for every canonical question and alias, plus UI-flow coverage that routes each of the 21 transcript questions to the correct chapter answer audio and rejects another chapter's question. Full suite 161/161, typecheck and lint pass. Six-chapter device coverage and failure paths remain open.

## Second-turn stale auto-play guard — 14/10/2026

- User again reports the first iPhone voice turn works but the second fails without the moving meter. Review found a pending auto-answer callback could run after a newer mic tap and re-enable playback during recorder startup. `QaScreen` now invalidates that callback when a new mic turn, manual playback action, question, or blur occurs.
- Added a deferred-stop regression: deliver a matched voice question, start the next mic turn before the old stop promise resolves, then verify the old answer does not start playing. UI flow tests 28/28; full mobile suite 156/156; typecheck, lint, and iOS JS export pass.
- This closes the code-level race only; it is not yet confirmed as the iPhone root cause. Metro `:8089` is not listening, so a fresh Expo Go reload and physical second-turn retest remain pending. GV5 stays open.

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

## Trạng thái app-to-Q&A mới nhất — 14/10/2026

- Regression UI hiện có kiểm đủ 21 câu canonical và 21 follow-up đầu tiên, cùng stale scope/revision; full `npm test` hiện tại đạt 158/158.
- Bundle iOS mới ở Metro `:8089` có code guard nhưng không chứa URL gateway. Vì vậy mic→STT→đúng answer/audio và hỏi tiếp bằng giọng nói trên cả sáu chương vẫn pending; test UI với transcript cố định không thay thế E2E.

## Retest hai lượt trên iPhone — 14/10/2026

- Sau khi reload Expo Go `exp://192.168.100.36:8089`, người dùng xác nhận lượt thứ hai liên tiếp hiện transcript và câu trả lời đúng. Đây chứng minh một follow-up Q&A voice trên iPhone theo báo cáo người dùng, nhưng chưa xác nhận âm thanh answer lượt hai.
- Bộ test hiện tại 161/161; UI-flow ánh xạ đủ 21 câu canonical sang answer/audio đúng node và từ chối câu thuộc chương khác. Đây là regression code-level, không thay thế thiết bị thật cho cả sáu chương.
- GV5 vẫn mở cho 6-chapter mic E2E, unknown/sửa câu, đổi scope trong lúc request và playback; lần kiểm manifest Metro từ host bị timeout.
