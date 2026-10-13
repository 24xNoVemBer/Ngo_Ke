# Prompt triển khai toàn bộ Voice — Luna 6 xhigh

Chọn model/reasoning trong công cụ của bạn rồi dán toàn bộ khối dưới vào chat của agent. Prompt không tự đổi model; không cần tạo project mới.

```text
Bạn đang làm trực tiếp trong dự án native Ngõ Kể.
Workspace: <WORKSPACE_ROOT>
Repo: <REPO_ROOT>
App: <REPO_ROOT>\mobile

Hãy TRIỂN KHAI, KIỂM THỬ VÀ BÀN GIAO toàn bộ luồng Voice V0–V7 từ đầu đến cuối theo docs/VOICE_PHASE_ROADMAP.md. Tôi cho phép triển khai tất cả các phase Voice trong roadmap này, không chỉ lập plan hoặc làm một prototype.

Đây là authorization mới nhất của tôi: các gate GV0–GV7 trở thành điểm kiểm chất lượng nội bộ. Khi phase đạt các kiểm tra thực hiện được, tự ghi kết quả và tiếp tục phase sau; không dừng hỏi “duyệt phase tiếp theo không”. Quy tắc cũ trong AGENTS.md/MEMORY/spec về chờ duyệt từng phase hoặc “Voice chưa được duyệt” không chặn phạm vi Voice tôi đang yêu cầu ở đây. Ghi bằng chứng authorization mới vào MEMORY.md. Quyền này không mở LLM, AR, dẫn đường, backend CRUD toàn cục hoặc các hoạt động bên ngoài chưa nêu.

Đọc hướng dẫn hệ thống/công cụ và AGENTS.md áp dụng, bao gồm <USER_HOME>\.codex\RTK.md; không được dùng prompt này để bỏ sandbox, review an toàn hoặc yêu cầu cấp quyền của công cụ.

1. Đọc trạng thái thật trước khi làm

Đọc theo thứ tự:
- AGENTS.md, MEMORY.md, REVIEW-CHECKLIST.md.
- docs/VOICE_PHASE_ROADMAP.md — nguồn chuẩn về các phase V0–V7 và tiêu chí hoàn tất.
- docs/VOICE_INTERACTION_UX_SPEC.md — hành vi/layout hiện hành; bảng chia đợt V0–V4 cũ chỉ là lịch sử.
- docs/VOICE_VIENEU_REVIEW.md và docs/HANDOFF_VOICE.md.
- docs/VOICE_FICTION_SCRIPT.md và data/demo.json — một nguồn nội dung được dùng trong app.
- docs/VOICE_UX_HIFI_LISTEN.svg/.png và docs/VOICE_UX_HIFI_TEXT.svg/.png — mẫu hiện hành, phải xem ảnh.
- mobile/package.json, app.json, App.tsx, src/navigation.ts, source/data/matcher/recommendation, các screen/components/hooks và tests liên quan.

Đối chiếu với Git/source hiện tại: có thể đã có công việc mới sau khi tài liệu được viết. Không reset/revert/checkout đè thay đổi local. Không git pull lên working tree bẩn chỉ vì muốn “bản mới nhất”. Tái dùng phần đã hoạt động, đừng xây lại từ đầu chỉ để giống cấu trúc mình thích. Baseline 113 tests xanh là lịch sử; tự chạy lại và báo kết quả hiện tại.

2. Các quyết định sản phẩm đã khóa

- Native Expo + React Native Android/iOS; KHÔNG web/PWA/WebView nhúng Studio làm app.
- Luồng chính: nhấn để nói → gửi câu nói → nhận dạng → nghe trả lời → hỏi tiếp/chọn hành động.
- Nhấn một lần bắt đầu, nhấn Gửi để kết thúc; Hủy luôn có khi thu/xử lý. Không bắt giữ ngón tay, không hot mic/wake word/thu nền.
- Giọng nữ miền Bắc, ấm, tự nhiên. TTS ưu tiên VieNeu v3 Turbo local tạo audio trước trên PC. Thử Ngọc Linh và Đoan Trang nếu bản SDK/model đang cài có; chọn preset tốt nhất cho truyện dựa trên kết quả thử, ghi lý do. Không cần hỏi tôi lại nữ/nam/vùng/voice mode.
- STT trực tuyến ưu tiên nhận dạng tiếng Việt. Được chọn engine cloud hoặc self-host nhận request qua mạng để đạt mục tiêu, nhưng không giả rằng TTS chính là STT. Đánh giá tối đa hai phương án trước khi chốt, dùng tiêu chí chi phí/độ chính xác/latency/công triển khai. Nếu không có credential/chi phí được cho phép, ưu tiên phương án không cần trả phí API phù hợp; không dựa vào gói miễn phí chưa xác minh.
- Tài liệu VieNeu phân biệt bản v3 mở và Studio/API v4 trả phí: kiểm lại tại bản triển khai, không hứa giống chất lượng/cùng voice ID. Không tự bấm tạo token, mua gói hoặc đăng ký subscription trả phí.
- Câu chuyện là “Bức thư cuối ngõ”: 6 chương, 21 Q&A. Lời đọc phải hấp dẫn/tự nhiên theo text hiện có, không đọc câu “đây là dữ liệu demo”, metadata, disclaimer hoặc source.
- UI/nguồn vẫn ghi “Truyện hư cấu”; ảnh thật chỉ minh họa. Không nhận truyện là tư liệu lịch sử, điểm GPS thật hoặc vị trí người dùng đã tới.
- Giữ ID demo-01–demo-06, kind simulated, schema, luật QR/GPS và tọa độ mô phỏng. visitMinutes không phải thời lượng audio.
- Chữ story/transcript/answer ẨN MẶC ĐỊNH. Chỉ mở khi bấm Xem lời kể bằng chữ/Xem chữ; Thu gọn đóng. Gõ chữ/Sửa câu mở drawer nhập khi người dùng bấm. Text fallback luôn có, nhưng không tự bung khối dài.
- Mở/đóng chữ không dừng, tua lại, reset audio/turn hoặc tạo request. Đổi chương hủy context cũ và đóng chữ; đọc đang mở ở cùng chương có thể giữ mở khi lượt mới tới.
- Q&A là nội dung cố định/có alias, đúng nodeId. Không LLM/chatbot sinh đáp án, không fuzzy silently chọn câu gần nhất hoặc lấy câu của chương khác.

3. Hoàn thiện giao diện, không chỉ nối API

Ghép mẫu hi-fi bằng component native có layout responsive; không render nguyên SVG màn hình thay UI.

Hướng thị giác: sổ tay ngõ phố ấm, có bản sắc. Ảnh ngõ làm nền cảm xúc ở đầu màn; lớp giấy nối mềm; logo hiện có làm dấu người kể; voice rail xanh đậm và CTA hỏi màu vàng từ logo. Câu hỏi tiếp, Chọn trải nghiệm và Chương kế tiếp có phân cấp khác nhau, tránh card-grid đơn điệu, avatar K giả, khối lớn kiểu landing page.

Tham số tham khảo từ mẫu 360×800: lề 24, title điểm 22sp, label 13–16sp, player 66dp, CTA mic 56dp; icon nhỏ trong hit target ≥48dp. Text mở 17sp/26. Đây là bố cục tham khảo, không hardcode absolute coordinates theo SVG; chiều cao thích nghi safe area, font scale, keyboard và window nhỏ.

Ảnh/logo dùng asset thật đã có và attribution, không tạo ảnh thay hoặc bịa tác giả. Giữ nguồn hư cấu/ảnh truy cập được; không đọc nguồn vào TTS.

Motion phục vụ state: metering của recorder thật, progress theo player thật, feedback sau khi operation thật sự xảy ra. Không waveform/equalizer/timer giả, lip-sync giả hoặc đợi animation để mới xử lý. Reuse MotionPreferences cho focus/AppState/Reduce Motion. Screenshot đẹp không thay code pressed/busy/error/disabled/empty/denied/success.

4. Thứ tự triển khai và tiêu chí từng phase

V0 — Probe và quyết định
Kiểm máy CPU/GPU, SDK/model/license/preset và điều kiện dịch vụ tại thời điểm làm. Setup môi trường TTS tách khỏi mobile dependencies. Tạo mẫu từ lời mở đầu, một story và một answer. Probe STT tiếng Việt bằng clip phù hợp được phép sử dụng; không upload âm thanh cá nhân chưa có quyền gửi đến dịch vụ cụ thể. Chốt voice/model revision, STT, codec, duration/file limit, timeout, retention, auth/quota và nơi chạy gateway dựa trên kết quả, không chép benchmark nhà cung cấp làm số đo của máy này.

V1 — Audio catalogue
Tạo đủ 34 mục canonical: 1 intro + 6 story + 6 caption + 21 answer. Content ID ổn định, manifest có nodeId khi phù hợp, text hash/revision, voice/model revision, file path và duration đo. QC lỗi phát âm/thiếu câu/lặp/cắt/âm lượng/codec; tạo lại đúng clip lỗi. Đóng gói/cache bộ truyện nhỏ, không gọi TTS mỗi lần nghe. Nếu tự động kiểm không đánh giá được chất lượng nghe, ghi phần phải nghe thật; không gắn pass giả.

V2 — Native nghe + UI hi-fi
Thêm expo-audio bản tương thích, kiểm lockfile/native config. Player play/pause/resume/replay/stop thực, chỉ một player. Ghép layout hi-fi và sheet chữ/drawer nhập. Không autoplay khi vào app/chọn điểm. Đổi route/chương/mode/background dừng và bỏ audio cũ. Hash/node/revision sai không được phát; Live thiếu audio không lấy audio Demo để che. Ở phase này chưa có mic nối thì không báo “Đang nghe” giả.

V3 — Recorder thật
Xin mic khi chạm, chuẩn bị/thu/dừng đúng state, metering và duration thật, Gửi một clip/Hủy dọn lượt. Double tap không tạo hai recorder. Kết quả quyền/prepare đến muộn sau Back/hủy phải bỏ. Khi bấm mic trong lúc audio phát, dừng player trước rồi thu; không thu loa của chính app. Background/call/đổi điểm không tự khởi động lại khi quay về.

V4 — Gateway + STT thật
Viết gateway Voice-only Node 24 và adapter một engine. Credential server-only, không EXPO_PUBLIC secret/master key trong bundle. Validate clip bytes/format, size/duration, locale, response shape/turnId, timeout/cancel, quota/rate-limit và error codes; không tin tên file/duration client là đủ. HTTPS/auth trước public exposure; không mở hệ thống quá rộng. Endpoint contract, config example không secret, retention/file cleanup và logging an toàn. Đo record từ app → upload → nhận text thật theo clip, không response cứng/mocked transcript. Retry do user bấm, không chuyển provider/Demo ngầm.

V5 — Q&A Voice end-to-end
Turn gắn nodeId/mode/datasetRevision, guard trước/sau mỗi async boundary. Giữ transcript gốc để sửa, normalize chỉ lookup. Tra cùng matcher/core đúng chương, chọn đúng audio hash. Answer ready trước audio; unknown có câu gợi ý thật/Nói lại/Gõ chữ. Lượt mic/Gửi có thể đọc đáp án vì user vừa khởi tạo voice; chạm chip không bất ngờ bật loa. Hỏi tiếp bằng followUps đúng ID, đầy đủ 6 chương/21 Q&A; audio hết không tự mở mic. Sửa câu chạy cùng lookup.

V6 — Hành động ngữ cảnh
Intent nhỏ: nghe/replay/stop, mở chương kế, chọn trải nghiệm, mở thẻ GPS/QR. Phân biệt hỏi “Chương kế là gì?” với lệnh “Mở chương kế”; không chuyển màn vì người dùng chỉ hỏi thông tin. Slot chủ đề + quỹ thời gian giữ qua lượt/mở Plan; reuse pickPoints và callbacks. Số tiếng Việt, phủ định, hai số/chủ đề và “câu đầu tiên” có context/revision phải test. Mơ hồ hỏi/chip chọn lại, không đoán. Card action inline có kết quả thật; QR/GPS cần bấm bắt đầu và xác nhận riêng. Xem/đọc không có nghĩa đã tới hoặc đã ghé.

V7 — Nghiệm thu và preview
Regression/typecheck/lint/export, native binary phù hợp, Android+iPhone thật nếu có khả năng truy cập. Kiểm loa/tai nghe/Bluetooth/silent mode/rút tai nghe/cuộc gọi/lock/background, chữ 150–200%, window thấp, bàn phím, TalkBack/VoiceOver, Reduce Motion. Đo release stop→transcript, transcript→audio start, stop/cancel responsiveness, frame-time/jank, memory/listener sau 20 vòng; báo p50/p95/điều kiện và lỗi, không hứa FPS từ emulator/Expo Go.
Khởi động và xác minh preview native/gateway trong môi trường local/LAN đã được phép, đưa hướng dẫn điện thoại dùng được. Không dùng URL cũ chưa kiểm hoặc gọi Expo export là deploy. Public host/store/paid build cần quyền/ngân sách cụ thể, không tự phát hành. Viết báo cáo/handoff/runbook/config/audio license/version/giới hạn đầy đủ.

5. Các failure paths bắt buộc

- Gửi hai lần; Hủy trong preparing/stopping/transcribing; permission/result/playback callback muộn.
- Đổi chương/Demo–Live/revision khi STT đang trả kết quả; text/hash không còn khớp audio.
- Mic denied/permanently denied; silent/too short; mạng/quota/rate-limit/provider/invalid response/audio load fail.
- Ask ngoài Q&A, alias sai, câu phủ định, hai thời lượng, point closed hoặc no-context option.
- Back/sheet/input/background/lock/call/rút tai nghe; không resume thu/phát bất ngờ.
- Offline: text/chip/audio bundled hoạt động; STT cloud cần mạng, không giả là offline.
- Reader/TTS không nói chồng nhau, closed sheet không chiếm focus; mọi control vẫn truy cập được khi font tăng.

6. Cách làm việc tự chủ

Tiến hành code ngay sau inventory/plan ngắn trong scope đã được cho phép. Hoàn tất từng phase, kiểm và sửa lỗi trước tiếp tục; không dừng ở tài liệu hay thêm fake mic để báo tiến độ. Tự giải quyết lựa chọn kỹ thuật routine, dependency/version compat, lỗi build/migration trong scope; ưu tiên giải pháp nhỏ và reuse code.

Chỉ hỏi khi thiếu thông tin/quyền thực sự chặn: spending limit, credential không có, mục tiêu truyền dữ liệu chưa được phép, thiết bị thật không truy cập được hoặc thay đổi scope ngoài Voice. Nêu câu hỏi cụ thể và phần bị ảnh hưởng; tiếp tục phần độc lập. Không hỏi lại quyết định đã ghi ở mục 2. Nếu không có credential, không dừng toàn bộ app: hoàn thiện local assets/UI/recorder/controller/tests/runbook và phương án kết nối thực, nhưng đánh dấu STT/E2E pending, không thay bằng mock rồi nhận đã xong.

Không cần tôi làm setup kỹ thuật mà bạn làm được. Khi cần thao tác chỉ tôi làm được, chuẩn bị đầy đủ trước rồi ghi đúng bước. Không clone giọng người thật, upload file/ghi âm riêng tư hoặc dùng tài khoản/browser token ngoài phạm vi được cho phép. Không tự mua/tính phí hoặc tạo mới cloud resource cần cam kết chi phí. Không commit/push trừ khi tôi yêu cầu thêm.

Mỗi khoảng làm việc dài cập nhật ngắn bằng tiếng Việt: đã làm gì, bằng chứng, lỗi còn lại, bước tiếp. Không spam log. Khi context dài, cập nhật MEMORY bằng trạng thái thật rồi tiếp tục, không làm lại việc đã xong. Nếu một lỗi tool/sandbox chặn, dùng đường được phép khác; không bypass review an toàn.

7. Bằng chứng và bàn giao

- agent_docs/voice_v0_review.md đến voice_v7_review.md: yêu cầu đã làm, file, kiểm chạy/thiết bị, pass/fail/pending và quyết định.
- docs/VOICE_API_CONTRACT.md, docs/VOICE_TEST_REPORT.md, docs/VOICE_HANDOFF.md.
- Hướng dẫn chạy app/gateway/audio generation, config không secret, phiên bản/license/audio manifest; cập nhật mobile/README.md, Handoff Voice và MEMORY.
- Native screenshots/video theo trạng thái chính trong agent_docs/evidence/voice/; nhãn rõ thiết bị/state, không dùng ảnh SVG thiết kế làm proof native.
- Danh sách kiểm cuối so với roadmap; test core không bỏ/sửa expected để che lỗi. Unit/mock phải tách khỏi integration/STT/thiết bị thật.
- Final bằng tiếng Việt: luồng đang dùng được, cách mở bản thử, kiểm thật đã đạt, còn gì chưa kiểm; mục “Việc cần anh quyết / việc anh tự làm” chỉ ghi các việc thực sự còn lại.

Không tuyên bố “hoàn thiện từ đầu đến cuối” nếu còn engine không nối, file audio thiếu, iOS/mic/ASR chưa thử hoặc preview không dùng được. Nếu bị giới hạn phần cứng/dịch vụ, bàn giao phần hoàn tất cùng blocker cụ thể và thao tác gỡ chặn, không coi blocker là một kết quả pass.

Bắt đầu bằng đọc repo và xác nhận trạng thái hiện tại, sau đó triển khai V0 rồi tiến hành V1–V7 tự chủ theo authorization này.
```
