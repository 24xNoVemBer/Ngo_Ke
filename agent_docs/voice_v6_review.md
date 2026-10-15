# Voice V6 — Intent và hành động theo ngữ cảnh

## Recheck phủ định, slot mơ hồ và câu hỏi khi Plan đang mở — 14/10/2026

- Câu hỏi như “Chương kế là gì?” giờ vẫn đi vào Q&A khi đang thu thập Plan.
- Parser dùng chung `hasTopicNegation` để bắt phủ định đã chuẩn hóa (`không`, bỏ qua, tránh, loại trừ, đừng chọn), kể cả “không đi ẩm thực” và “không, 30 phút”; “không gian” vẫn là danh từ dương.
- AVD API 37 tái hiện thêm lỗi ở ô nhập tay Plan: câu “Không đi ẩm thực trong 30 phút” bị `parseTopic` nhận thành ẩm thực và giữ picks cũ. `parseTopic` giờ từ chối chủ đề bị phủ định; Plan xóa topic cũ, giữ thời lượng và yêu cầu chọn lại. AVD chạy APK release mới cho cùng thao tác không còn hiện picks ẩm thực; draft còn `budgetMinutes: 30`.
- Nhiều chủ đề/thời lượng, giá trị ngoài khoảng và câu không nhận ra slot nào tiếp tục xóa các giá trị cũ liên quan để tránh picks lỗi thời.
- Regression mới ở `recommendation.test.mjs`, `uiFlows.test.mjs` và `qa.test.mjs`; toàn suite 166/166, typecheck/lint/Expo dependency check đạt. Thêm 16 transcript ASR tổng hợp gần đúng nhưng bắt buộc ở `unknown` trong đúng node, không fuzzy match.
- Screenshot AVD: `agent_docs/evidence/voice/android-emulator/android37-release-negated-plan-result-2026-10-14.png`. Đây là kiểm nhập chữ/UI logic trên emulator, không phải speech, âm thanh hay microphone hardware.
- Đây vẫn là kiểm logic bằng transcript điều khiển; cách nói thật qua mic và mức dễ hiểu của thẻ Plan còn chờ kiểm trên thiết bị.

**Ngày:** 13/10/2026
**Trạng thái:** parser/actions/UI đã triển khai và test; nhận dạng các cách nói thật còn pending.
**Gate GV6:** logic tự động đạt; chưa đóng nghiệm thu giọng nói trên máy.

## Đã làm

- Thêm tập intent nhỏ: nghe/replay/stop, mở chương kế, mở Plan, hiển thị lựa chọn QR/GPS. Phân biệt câu hỏi thông tin với lệnh; câu trộn hỏi + lệnh yêu cầu người dùng chọn.
- Dùng chung `parseTopic`, `parseTimeBudget`, `pickPoints` và callbacks hiện có; Plan draft sống ở App qua navigation. Lựa chọn QR/GPS cần bấm CTA riêng trước khi mở luồng tương ứng.
- Hỗ trợ số Arabic/số tiếng Việt và slot giữ qua lượt; phủ phủ định, nhiều chủ đề, nhiều thời lượng, ngoài khoảng và tham chiếu “câu đầu tiên” chỉ khi option context/node/revision còn đúng.
- Thẻ action cho biết kết quả mô phỏng, không tuyên bố người dùng đã tới/ghé điểm. Nội dung hư cấu/điểm GPS mô phỏng vẫn giữ nhãn.

## Bằng chứng và giới hạn

- Source: `mobile/src/voice/intent.ts`, `mobile/src/recommendation/pick.ts`, `mobile/src/screens/QaScreen.tsx`, `mobile/App.tsx`.
- `mobile/tests/voiceIntent.test.mjs`, `mobile/tests/uiFlows.test.mjs`, `mobile/tests/recommendation.test.mjs`; toàn suite 122/122 đạt, typecheck/lint đạt.
- Đây là kiểm parser/UI với chuỗi test, không chứng minh ASR nhận tiếng Việt ngoài thực địa hay người dùng hiểu rõ thẻ hành động.

**Còn lại:** thử câu hỏi và lệnh bằng giọng trên thiết bị, nhất là phủ định/“chương kế là gì?”/“mở chương kế”/hai slot/số tiếng Việt; rà các trường hợp mơ hồ và cách người dùng hiểu CTA QR/GPS.

## Screen regression question vs command — 14/10/2026

- QaScreen test confirms “Chương kế là gì?” and “Điểm kế tiếp là điểm nào?” do not change chapter; explicit “Mở chương kế” selects the next available chapter.
- UI-flow tests pass 24/24; full suite passes 146/146; typecheck and lint pass. Transcript input is controlled, so actual Vietnamese speech recognition and user comprehension still need device testing.

## Android API 37 action surfaces — 15/10/2026

- The latest SDK57 release APK measured the Plan manual-input control at 48 dp high on the API 37 AVD (126 px at 420 dpi). With the keyboard open, the topic field and “Dùng” button remained visible; topic/time entry selected Ẩm thực and 30 minutes, produced the expected two simulated picks (10 + 20 minutes), and opening “Bếp đầu hè” reached that chapter's Q&A.
- The action drawer exposed distinct Plan, QR and GPS choices. Opening GPS showed an explicit “Lấy vị trí của tôi” button and no location prompt; the source only requests foreground permission from that button, and candidate selection has a separate confirmation. The QR screen likewise showed an explicit “Bật camera và quét QR” button; permission is requested only when it is tapped, and an accepted QR result still needs confirmation. Camera/location were not started on the emulator.
- Evidence: `agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/README.md`. The AVD has no audio; these checks do not test voice recognition of action commands or real GPS/QR hardware. Real Vietnamese voice intent recognition remains pending on a phone.
- Mobile tests 168/168, typecheck, lint, dependency check, iOS JavaScript export and Android `assembleRelease` passed. Latest APK: 121,247,924 bytes, SHA-256 `EEC6430CC94BC70CAD01B5A58C954DA4B1333ECC1F49FFDB1BE8BCF4C3D9E1CF`.

## Regression câu phủ định — 15/10/2026

- `normalizeQuestion` làm “đừng nghe” trùng chuỗi với lệnh “dừng nghe”. Parser giờ nhận diện phủ định có dấu ở đầu câu trước khi chuẩn hóa; “Đừng nghe”, “Đừng mở QR/chương kế” và “Không cần mở GPS” không kích hoạt hành động, còn “Dừng nghe” vẫn dừng phát.
- TTS tổng hợp cục bộ “Đừng nghe.” và “Dừng nghe.” bằng VieNeu Đoan Trang, rồi gửi qua gateway large-v3 CUDA đang chạy. ASR trả lần lượt “Đừng nghe.” và “Dừng ngay!”; parser giữ câu phủ định ở `question` và nhận “Dừng ngay!” là `stop` bằng alias chính xác. Không dùng audio người dùng.
- Thêm hồi quy trong `mobile/tests/voiceIntent.test.mjs`. Toàn suite 170/170, typecheck, lint và `git diff --check` đạt. Probe này là synthetic TTS→STT, chưa xác nhận cách người dùng thật phát âm.
- Rebuild/cài APK API 37 sau alias: 121,248,988 bytes, SHA-256 `F6CD6178BD99D303E2C714963B3F414314D7DE9B883098976648DA9A2CF20B49`; installed `base.apk` khớp hash. Native flow Landing → Home → chapter 1 → answer → mở text khi player chạy đạt; xem `agent_docs/evidence/voice/android37-native-release-v6-negation-2026-10-15/README.md`.

## Current APK and integration follow-up — 15/10/2026

- APK used for this chapter-isolation check was `B171E9C88288097F15F0DCBB15036F7D808373ACCCA6D22D9030833AADFB85B2`. Chapter-4 typed alias resolved to the expected answer; chapter 1 correctly kept that chapter-4 question unknown. See `agent_docs/evidence/voice/android37-native-release-current-2026-10-15/qa04-flowers-manual-alias-answer-2026-10-15.png`.
- Synthetic mobile helper → large-v3 gateway → production matcher coverage is 21/21 after two exact aliases (0 wrong/unknown/context errors, host p50/p95 570/634 ms). This does not prove real speech recognition or spoken action recognition. The broad parser/Plan/QR/GPS code and UI checks above remain covered by unit/UI tests; real voice action comprehension and physical camera/GPS use remain pending.
- Current validation is 170/170 mobile tests, typecheck, lint, Expo dependency check and the 34/34 audio catalogue validator. The AVD has no audio; the iPhone `:8081` retest remains deferred.

## Spoken action probe through the current helper and gateway — 15/10/2026

- Replayed locally generated VieNeu clips through the production mobile multipart helpers, current LAN gateway and `parseVoiceIntent`. “Bắt đầu nghe lời kể” was transcribed exactly and resolved to `listen`; “Mở máy quét mã QR” was transcribed as “Mở máy quét mạ.” and resolved to `open-qr` through the existing accent/punctuation normalization and exact command table.
- Added exact aliases for those action forms and changed the idle dock hint to the proven phrase “Phát lời kể”; direct parser regressions pass. No fuzzy intent mapping was added. The synthetic clips do not establish real-world recognition or comprehension.
- The earlier spoken-action probe used APK `17BF0EF342B0E41E4A90972101B260BD1E75D9654F80FDC5BFA469464E6EF3D3`. The latest APK after V6 fixes is `F6CD6178BD99D303E2C714963B3F414314D7DE9B883098976648DA9A2CF20B49`; all 34 packaged MP3 hashes match source. Real spoken action coverage on iPhone, and physical QR/GPS use, remain pending.
