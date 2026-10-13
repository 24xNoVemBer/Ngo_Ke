# MEMORY.md — Ngõ Kể

## Latest Voice status — 2026-10-14

- User authorization remains active for Voice V0–V7; internal gates do not pause implementation. Keep scope voice-only; do not buy services, expose a public gateway, commit or push.
- User confirms the first iPhone voice turn answered, but the second turn loses its meter and fails. No device log or raw meter value is available, so the cause is not proven.
- Recorder start now waits up to 1 second for Expo Audio's native `isRecording` state before showing “Đang thu”; cancellation stops a late-starting recorder, and a failed start is cleaned up. A late answer-playback callback is also discarded after its audio-mode await if a new mic turn invalidated it. These address delayed starts and a plausible audio-mode race; a native recorder that reports active while returning no microphone signal still needs iPhone diagnosis.
- Gateway `192.168.100.36:8788` is ready (Node 24.14.1, faster-whisper 1.2.1, pinned `Systran/faster-whisper-small`). Metro `:8090` and `/status` are running; Expo Go URL is `exp://192.168.100.36:8090`.
- Current checks: `npm test` 152/152; typecheck, lint, iOS and Android JS exports pass. Metro iOS bundle HTTP 200 (6,064,803 bytes) contains the new guards and private gateway URL. These are not physical iPhone validation or an iOS native build. No second-turn iPhone retest after the guards; GV3/GV5/GV7 remain open.
- Retest after reloading Expo Go. If “Đang thu” appears but the meter stays empty, report that separately from a start error; if STT fails, send the exact text in **Xem câu đã nhận dạng**. No audio upload is needed.

## Latest Voice status — 2026-10-13

- User authorization remains active for implementation and internal GV0–GV7 checks across Voice V0–V7; proceed without per-phase approval. Scope still excludes LLM, AR, broad backend CRUD, paid subscriptions/resources, public deployment, and commit/push. No private audio was uploaded.
- Current Wi‑Fi gateway: `192.168.100.36:8788`, PID 42784, bound to the private Wi‑Fi interface; Node 24.14.1/faster-whisper 1.2.1 ready. Synthetic TTS smoke HTTP 200 with context echo; 21s audio rejected and invalid format rejected. Reprobe on six synthetic clips: selected Đoan Trang WER 7.9% exact (5.1% folded diacritics), weighted RTF 0.213; real mic accuracy needs testing.
- Current APK: 121,232,376 bytes, SHA-256 `C30FA2718E2A89E0818791015596AB3C41D21E1D0450B5F4ECD95A4C85D34A12`; bundle points to the current gateway, contains the timeout fix, and has 34 MP3s/accessibility labels. Android `assembleRelease` passed in 1m58s (377 tasks, 30 executed/347 up-to-date); APK installed/launched on Android API 37 AVD, but not on a physical phone.
- Added `transcribeVoiceRequest` so the 45s timeout covers response JSON body as well as headers. Fixed Live voice-answer/replay so it never attempts Demo audio; Live answer text remains collapsed and the screen explains how to open it. Tests cover timeout/network/malformed/stale responses plus Demo-vs-Live playback. Current checks: 135/135 tests, typecheck, lint, dependency check, and gateway integration smoke pass.
- Android/iOS JS exports passed with the current URL, but no native iOS build/device test. Gradle bundle task now tracks the URL in this generated `mobile/android` tree; verified task invalidation after changing and restoring it. That tree is Git-ignored, so the handoff keeps `--rerun-tasks` for reliable regeneration/builds.
- Metro preview was restarted with `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL=http://192.168.100.36:8788`; `/status` is live and iOS/Android dev bundles returned HTTP 200 with the Live fallback and gateway URL. No physical phone has opened it yet; AVD screenshots capture Q&A and explicit text opening.
- Still pending: phone app-mic → STT → fixed Q&A/audio E2E, human listening/QC of all 34 clips, real-device audio routes/accessibility/performance, and iOS native. GV5/GV7 remain open; goal is not complete.

## 2026-10-13 — Authorization triển khai Voice V0–V7

- Người dùng đã dán trực tiếp yêu cầu triển khai trong `docs/LUNA_6_XHIGH_VOICE_PROMPT.md` và yêu cầu bắt đầu bằng kiểm tra repo, sau đó làm V0–V7 đến mức có thể bàn giao. Đây là authorization mới nhất cho Voice; gate GV0–GV7 là kiểm tra chất lượng nội bộ, không dừng chờ duyệt phase kế tiếp. Mâu thuẫn với quy tắc phase cũ trong `AGENTS.md`/MEMORY/spec được giới hạn trong Voice theo prompt mới.
- Phạm vi vẫn native Expo/React Native Android+iOS, TTS local VieNeu v3 Turbo ưu tiên, STT tiếng Việt qua gateway, Q&A cố định; không mở LLM/AR/backend CRUD toàn cục, mua dịch vụ, phát hành công khai/store, clone giọng, upload audio riêng tư, commit hoặc push. Quy tắc hệ thống, sandbox, kiểm tra an toàn và xin quyền công cụ vẫn giữ nguyên.
- Trạng thái khởi động: nhánh `main` sạch theo Git index nhưng có nhiều sửa đổi UI/UX/Voice chưa commit; giữ nguyên tất cả. `mobile/package.json` chưa có audio/recorder; chỉ có thay đổi local `react-native-svg`. Tài liệu/kịch bản/hi-fi V0–V7 đã được kiểm tra. Máy dev: Windows 11, Python 3.11.9, NVIDIA RTX 5060 Laptop GPU 8 GB, RAM vật lý 16 GB, RAM trống lúc kiểm tra khoảng 2.3 GB. Chưa có bằng chứng TTS/STT/device audio thật.
- Nguồn VieNeu chính thức được đọc qua agent-reach/Jina ngày 13/10/2026: SDK `vieneu` chạy v3 Turbo local, API cloud tách riêng và cần grant/key; không lấy hai đường này làm một. Bắt đầu probe V0 trước khi cài hay tải model. Kết quả probe/service hiện hành và blockers sẽ được cập nhật tại các voice review theo phase.

## 2026-10-13 — Trạng thái triển khai Voice sau authorization

- Đã ghi nhận authorization mới nhất: làm V0–V7 xuyên gate; GV0–GV7 là quality checks nội bộ, tự ghi kết quả rồi tiếp tục. Phạm vi/giới hạn không đổi; không mua dịch vụ, phát hành public/store, mở LLM/AR/backend CRUD toàn cục, upload audio cá nhân, commit hoặc push.
- V0: VieNeu v3 Turbo local SDK 3.7.1, model `61b85e3d937fbbacb387714180e8182823512523`, chọn preset Đoan Trang trên ba clip tổng hợp so với Ngọc Linh theo ASR WER; độ ấm/tự nhiên chưa có nghe người thật xác nhận. ASR là faster-whisper-small revision `536b0662742c02347bc0e980a01041f333bce120` CPU int8 qua Node 24/Python local gateway; không gọi cloud.
- V1: 34/34 canonical clips qua hash/text/node/revision/format/duration checks; 418.23s/5,043,834 bytes; mean level −21.0…−18.6 dBFS, peak −7.9…−3.4 dBFS. ASR là phép dò nội dung, chưa nghe tay; một số answer/caption có WER cao cần nghe.
- V2–V6: native audio UI/recorder, gateway adapter, fixed Q&A và intent/action đã được nối; `npm test` hiện 131/131, typecheck/lint/dependency check đạt; Android/iOS JS export và Android release APK build đạt. Gateway smoke nhận synthetic 19.15s, từ chối invalid format và clip PCM 21s.
- V7 snapshot mới nhất: Android API 37 emulator xác nhận player, guard thu 19.5s (500ms trước hard limit gateway 20s), UI giữ file với thời lượng thật `00:19`, Hủy và Back dừng thu; không gửi mic clip. APK LAN preview internal debug-signed 121,231,324 bytes, SHA-256 `0E86AC88AE758A587EED292D7C1EACDC26855A9C56125E2308CA54F49C13D9CE`; bundle chứa endpoint `192.168.88.174:8788`, đã cài/chạy trên emulator. AppOps cap 19.692s; Back 1.814s. Gateway `/health` ready; Metro/Expo Go port 8086 chưa chạy vì tool từ chối process launch theo policy. Phone/iOS, mic→STT app E2E, accessibility và performance còn pending; GV7 mở.
- Fix Expo env substitution: `App.tsx` now reads `process.env.EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL` as a direct property so Metro inlines it. Android/iOS exports (1,064/1,069 modules) both contain the LAN endpoint; APK built with the same env, while `mobile/app.json` remains blank. Physical-device delivery is available through the debug-signed APK; the actual phone-to-gateway request is still pending.
- `npm audit` có 23 advisory (8 moderate, 15 high); không ép downgrade SDK 57. Tài liệu trạng thái: `docs/VOICE_TEST_REPORT.md`, `docs/VOICE_HANDOFF.md`, `agent_docs/voice_v0_review.md`…`voice_v7_review.md`; README mobile có đường vào preview. Các ghi chú lịch sử cũ phía dưới không thay trạng thái này.

## 2026-10-13 — Prompt triển khai và Goal cho Luna 6 xhigh

- Người dùng yêu cầu tạo prompt để “luna 6 xhigh hoàn thành từ đầu đến cuối” và prompt để set Goal. Đã tạo `docs/LUNA_6_XHIGH_VOICE_PROMPT.md` (thực thi V0–V7) và `docs/VOICE_GOAL_PROMPT.md` (objective + tiêu chí complete).
- Prompt được soạn như lời user khi dán: cho phép đi xuyên các phase/gate chất lượng, tự chọn routine tech/preset từ probe, giữ các quyết định voice/hi-fi/hư cấu; không tự mua/public deploy/store/upload private audio/clone giọng/commit-push và không bỏ quy tắc hệ thống/sandbox.
- Đây chỉ là tạo tài liệu prompt, **chưa gửi sang agent/chat khác, chưa đổi model, chưa tạo Goal hoặc triển khai Voice** trong chat hiện tại. Authorization triển khai trong prompt có hiệu lực khi người dùng dùng nó làm yêu cầu thực thi, không coi file mới là agent đã bắt đầu làm.
- Goal không có budget/deadline tự đặt; complete đòi proof audio/STT/native/devices/preview, pending không đổi thành pass. Còn quyền/credential/device thực sự thiếu thì hỏi cụ thể và tiếp tục phần độc lập.

## 2026-10-13 — Roadmap hoàn thiện Voice V0–V7

- Người dùng yêu cầu “lên plan chi tiết các phase tiếp theo đến khi hoàn thiện luồng voice này”. Đã viết `docs/VOICE_PHASE_ROADMAP.md`; đây là quyền lập plan, chưa triển khai/gate Voice.
- Roadmap mới thay V0–V4 sơ bộ: **V0** probe/chốt giọng-ASR-budget-contract; **V1** 34 audio/manifest; **V2** hi-fi native/player/text đóng; **V3** recorder real/cancel; **V4** Voice-only gateway/STT; **V5** end-to-end Q&A/hỏi tiếp; **V6** intent/slot/inline action; **V7** Android+iOS thật, release/performance/preview và bàn giao.
- Mỗi phase có yêu cầu mã Vx.yy, file/phụ thuộc, kiểm/đầu ra, gate GV0–GV7 và Việc cần anh quyết/tự làm. Mốc V2 nghe, V5 Q&A real, V7 toàn luồng; không coi mock/export là kiểm mic/giọng thật.
- Đếm từ fixture hiện hành: 1 intro + 6 story + 6 caption + 21 answer = **34 audio core**. Phase V1 tạo trước local VieNeu theo giọng/revision đã chọn, text hash/version không lệch; STT riêng có cost/retention/auth/host cần chốt V0.
- Giới hạn clip 20s ban đầu là đề xuất V0; sau probe đã chốt recorder/gateway hard limit 20s, user bấm Gửi sau khi thu/dừng, gateway request timeout 45s. Ước lượng roadmap 12–21 ngày công là lịch sử, không deadline.
- Giữ nghe–nói foreground theo hành động, chữ đóng/nhấn mở, không hot mic/LLM/clone voice/AR/dẫn đường hoặc backend CRUD toàn cục. Gateway Voice hẹp cần scope/gate, public auth/HTTPS/rate-limit; không key trong app, không lưu audio cá nhân vào Git.
- Spec/Handoff Voice đã trỏ roadmap mới và đánh dấu chia đợt cũ là lịch sử. Baseline 113 tests xanh là kết quả lượt nội dung trước, không chạy lại trong lượt tài liệu. Không cài/tải model/package, tạo/gửi âm thanh, dùng API tính phí, deploy/commit/push.
- **Việc cần anh quyết / việc anh tự làm:** bắt đầu bằng V0 nếu duyệt; nghe/chốt preset/ASR/chi phí/hosting; cấp config an toàn và test phone khi tới phase. Mua quota/host/build trả phí được đánh dấu ngoài cam kết core, store/public production và clone voice ngoài roadmap; không ngầm duyệt mua/publish.

## 2026-10-13 — Thay copy kỹ thuật bằng truyện hư cấu để thu voice

- **Yêu cầu/authorization:** người dùng nói “thay câu chữ demo bằng câu chuyện giả với lời kể hấp dẫn để thu voice chứ không dùng như kiểu đây là dữ liệu demo”. Đã triển khai thay nội dung fixture và nhãn Q&A liên quan; quyền này không tự mở connector/audio/cloud/LLM.
- Canonical `data/demo.json` hiện là **Bức thư cuối ngõ**: An trở về với chìa khóa mẹ gửi, lần theo đồng hồ/gói xôi/hoa giấy/hộp thư/ánh đèn. 6 chương: Cổng ngõ, Hiên đồng hồ, Bếp đầu hè, Sân hoa giấy, Bậc thềm nắng, Đèn cuối ngõ. Có **21 Q&A**, mỗi điểm ≥3 và follow-up đúng chương.
- `intro.text`, story/caption/answer là văn nói tự nhiên, không chứa lời giải thích demo/phase/chờ data. UI/nguồn/disclaimer ghi rõ **Truyện hư cấu**; không bịa evidence lịch sử. Q&A đổi nhãn “Đã duyệt/Nguồn kiểm chứng” thành lời kể trong truyện/nguồn nội dung để không nhận truyện là tư liệu thật.
- Giữ schema 1/kind simulated, node ID demo-01–06, tọa độ, tags, phút ghé điểm và trạng thái; không đổi luật QR/GPS/khớp Q&A. Chỉ thêm câu/alias có kiểm; danh sách câu hỏi vẫn exact/alias, unknown không tự bịa. Đổi tên node nên test chọn pin không còn hardcode nhãn kỹ thuật; test missing Q&A vẫn kiểm bằng dataset rỗng riêng.
- `docs/VOICE_FICTION_SCRIPT.md` chứa lời mở đầu, 6 đoạn kể/caption và 21 đáp án để thu; metadata không đọc vào audio. Hifi LISTEN/TEXT SVG/PNG và spec/Handoff Voice/data README đã cập nhật tên truyện/nguồn/lời đáp mới. Mẫu compact/bảng cũ vẫn là lịch sử.
- Final: **113/113 tests đạt**, typecheck/lint sạch, Android/iOS Expo export đạt, hi-fi render 360×800 không tràn chữ, diff check đạt. Export chưa phải APK/IPA và chưa thử lại runtime native/giọng trên máy thật trong lượt nội dung.
- **Việc cần anh quyết / việc anh tự làm:** review lời kể/sắc thái rồi nghe mẫu giọng khi bước thu audio; voice ID/connector vẫn chưa chốt. Không cài/tải model, tạo audio, gọi dịch vụ tính phí, deploy/commit/push trong lượt này.

## 2026-10-13 — Thiết kế voice/tương tác thật và đánh giá VieNeu

- Feedback mới nhất: mẫu compact “quá thô, chưa có điểm nhấn về hình ảnh và UX”. Đã làm cặp hi-fi `docs/VOICE_UX_HIFI_LISTEN.svg/png` và `VOICE_UX_HIFI_TEXT.svg/png`, vẫn 360×800. Ảnh thật + logo hiện có, hero/giấy nối liền; voice rail xanh đậm 66, mic vàng từ logo 56, action hỏi/chọn trải nghiệm/điểm tiếp có trọng lượng khác nhau; Xem chữ là sheet đọc giữ audio và dock. Đây là mẫu hiện hành; compact/bảng 3 màn giữ lịch sử.
- Hi-fi đã render/xem ảnh cả 2 trạng thái, kiểm text và vùng chạm khai báo trong SVG; token nút vàng chỉnh đạt 4.99:1, player/giấy >12:1; thêm scrim trái cho chữ trên ảnh. Đây không phải native QA hay proof voice. Không đổi runtime app, không cài package/model hoặc gọi service.
- Feedback kế tiếp “đang làm app mà sao giao diện to thế?”: đã giảm mật độ/khối lớn và làm mẫu chính riêng `docs/VOICE_UX_MOBILE_COMPACT.svg` + PNG **360×800**; bảng ba màn cũ chỉ tham khảo trạng thái. Lề 16, title 19, label 13–15, player 118, dock 52; vùng bấm vẫn ≥48. Chưa đổi runtime app.
- Feedback mới nhất: khi có voice, thu nhỏ/ẩn ô text ở giao diện chính, chỉ hiện khi bấm. Đã cập nhật spec/storyboard: **Xem chữ / Thu gọn** cho story/transcript/answer; **Gõ chữ** mở drawer input; toggle không dừng/reset audio; không đổi runtime app khi voice chưa triển khai.
- Người dùng yêu cầu có voice/tương tác thật và thiết kế lại trải nghiệm trực tiếp từ UI hiện tại; chưa có yêu cầu triển khai code của spec mới trong lượt này.
- Đã chốt qua trả lời: **nhấn để nói, nghe trả lời, hỏi tiếp**; **nữ miền Bắc, ấm tự nhiên**; **nhận dạng tiếng Việt trực tuyến**. Khóa cloud giữ ở server. Không suy quyền lưu audio/huấn luyện/thu nền từ lựa chọn này.
- Người dùng gửi `https://www.vieneu.io/#/studio`, đề xuất dùng nếu phương án ban đầu mất phí. Đã kiểm website/Studio/docs/repo/model card: cloud/Studio tính token, Starter công khai 99.000đ tại ngày kiểm; v4 độc quyền; v3 Turbo mở Apache-2.0 chạy PC không có phí API theo lượt. Không coi hai bản cùng giọng/chất lượng.
- Đề xuất **VieNeu v3 Turbo tạo trước audio** cho story/Q&A đã duyệt, bundle/cache và player thật; shortlist Ngọc Linh/Đoan Trang nữ Bắc sau nghe mẫu. STT online vẫn cần engine riêng/probe, chưa xác minh STT API của VieNeu từ docs đã đọc; không hứa toàn bộ voice miễn phí.
- Review source/ảnh native 12/10: UI thiên về đọc/chuyển màn, Sổ tay hai nghĩa; fixture 6 Q&A chỉ ở demo-01, điểm 02–06 chưa có Q&A. Matcher chính xác/alias nên cần alias nói được review, unknown không bịa. Story “đang đứng” cần review trước audio khi người dùng chỉ xem điểm.
- Đã tạo `docs/VOICE_INTERACTION_UX_SPEC.md`, `docs/VOICE_UX_STORYBOARD.svg` và PNG, `docs/VOICE_VIENEU_REVIEW.md`; cập nhật Handoff Voice. Trang kể đề xuất có transcript/nguồn/player/chip hỏi tiếp/thẻ hành động, dock mic/Gõ chữ và cancel; slot/intent giới hạn, không LLM.
- SVG đã render và kiểm thị giác, dùng ảnh thật từ app và text fixture; đây là thiết kế, không native runtime hoặc proof voice. Không xây web/PWA.
- Chưa cài/tải model/package, gọi STT/TTS, tạo/nghe mẫu audio, bấm thao tác tính phí, cấp mic website, clone giọng, deploy hoặc sửa runtime app. Không dùng thông tin tài khoản trình duyệt trong tài liệu.
- **Việc cần anh quyết / việc anh tự làm:** review bố cục/đợt V0–V4, chọn local v3 hay cloud có quota, nghe/chốt voice ID và chọn ASR engine/ngân sách/retention; thử iPhone/Android thật khi triển khai. Có spec cụ thể để review trước coding theo phạm vi Voice riêng; yêu cầu mới này không tự mở toàn bộ backend/LLM.

## 2026-10-12 — Triển khai phần còn lại của UX/motion

- **Authorization mới nhất:** người dùng nói “triển khai phần còn lại đi”; đã duyệt code A–D theo `docs/UI_UX_IMPROVEMENT_PLAN.md`. Thông tin “chưa duyệt plan” ở các mục cũ bên dưới là lịch sử, không còn chặn công việc này.
- Đã sửa Prologue replace/chống bấm lặp và stack Q&A/Plan; bỏ micro/waveform/timer giả. Home cuộn cả đường ngõ/thẻ điểm, dock trong bố cục; Q&A chữ rõ/nguồn riêng/empty nền giấy; Landing/Plan rút gọn, icon SVG và copy Demo/Live đúng nguồn.
- MotionProvider dùng focus/AppState/Reduce Motion; loop dừng/reset khi ẩn; drawer xử lý callback đóng cũ, focus sau Modal và hủy focus đang chờ; ảnh không đổi trước load; câu trả lời chỉ tự cuộn sau câu hỏi mới.
- GPS bỏ kết quả muộn sau Back/hủy/chọn tay; camera đóng background/blur, chỉ nhận QR đầu mỗi lượt. Không mở backend/Voice/hộ chiếu lưu lâu dài, không đổi fixture văn hóa, không thêm dependency.
- Final checks: **111/111 test đạt**, typecheck/lint sạch, Android và iOS Expo export đạt, `git diff --check` đạt. Không nhận Expo export là APK/IPA release.
- Android Expo Go kiểm luồng bìa→Landing→Home→Q&A; Q&A→Plan→chọn 05→Back Home; nhập chữ/bàn phím tự hiện; viewport 1800×1080 cuộn tới pin 5/6 và CTA thẻ mở đúng 01; font 1.5 Prologue/Home/Q&A; Reduce Motion tĩnh.
- D đã hoàn thiện code/QA emulator, **chưa nghiệm thu iOS runtime, thiết bị thật, TalkBack/VoiceOver, lens QR, GPS ngoài đường, release frame-time/jank/FPS**. Test quyền/kết quả muộn có mock; không gọi đó là E2E phần cứng.
- Bàn giao: `docs/UI_UX_IMPLEMENTATION_HANDOFF.md`; ảnh `agent_docs/evidence/ui-ux-implementation-2026-10-12/`. Ảnh 02/03/09/15 là kiểm trung gian, file 06/07/11 đã chụp lại kết quả cuối. Gear Tools là Expo Go.
- Chưa commit/push/publish/deploy lượt này. Metro 8085 và emulator do agent chạy để QA đã dừng khi bàn giao, thiết lập test được khôi phục; lần thử tiếp cần server native mà điện thoại truy cập được.
- **Việc cần anh quyết / việc anh tự làm:** không còn quyết định chặn code đã duyệt; review thị giác và thử iPhone/Android thật, QR/GPS, Back/bàn phím/Reduce Motion/chữ lớn; đo bản release trước khi nghiệm thu độ mượt. Checklist trong bàn giao.


> Bộ nhớ thuộc dự án. Cập nhật theo sự kiện đã xảy ra; không suy duyệt phase từ việc sửa tài liệu.

## Rà soát UI/UX mới và bỏ thống kê — 12/10/2026

- Người dùng yêu cầu kiểm kỹ logic/test và lập plan làm UX đẹp, hiệu ứng mượt. Mô tả lỗi: bấm màn đầu rồi Back bị lỗi; màn đầu chỉ cần bấm để vào, không cần quay lại.
- Đã tái hiện native Android: Prologue fade opacity về 0 nhưng dùng navigate, Back quay lại instance đã ẩn. Đề xuất replace Landing; chưa sửa lỗi này trong lượt lập plan.
- Tìm thêm Home cắt điểm/CTA ở cửa sổ thấp, micro giả/timer mở drawer muộn, stack Q&A/Sổ tay tích màn, motion không quản focus/AppState/Reduce Motion, drawer không có exit, notice khó đọc và copy Demo trên Live. Phân biệt lỗi đã tái hiện với probe và đề xuất trong báo cáo.
- Người dùng gửi ảnh và nói **“bỏ phần này đi, kh hợp lý lắm”**: đã bỏ hàng 5 bìa ngõ / 6 điểm / 100% ảnh ở Landing, hook animation và style chỉ dành cho hàng này. Đây là thay đổi source duy nhất của lượt; ảnh demo chung vẫn được phép.
- Baseline và chạy lại sau bỏ stats: **100/100 test đạt**; typecheck/lint đạt, diff check đạt. Android/iOS export đạt trước bỏ stats. Test mock hiện bỏ qua giá trị/callback hủy của animation và Prologue thật nên test xanh không phủ lỗi Back.
- Đã kiểm Android emulator Expo Go: Prologue/Back, Home/Q&A/câu trả lời, Plan ẩm thực 15 phút/điểm 05, Home cửa sổ thấp, Landing sau bỏ stats. Có probe timer/animation, StackRouter thật và nguồn Live kiểm soát. Không dùng XML cũ khi uiautomator không chụp được do motion.
- Báo cáo: [docs/UI_UX_AUDIT_2026-10-12.md](docs/UI_UX_AUDIT_2026-10-12.md). Plan chi tiết: [docs/UI_UX_IMPROVEMENT_PLAN.md](docs/UI_UX_IMPROVEMENT_PLAN.md). 11 ảnh PNG hợp lệ tại `agent_docs/evidence/ui-ux-review-2026-10-12/`.
- **Chưa duyệt triển khai phần plan còn lại**; thứ tự đề xuất A logic → B layout/copy → C motion → D polish/nghiệm thu. Không commit/push, không mở backend/Voice. Giữ toàn bộ thay đổi local của người dùng.
- Chưa kiểm iOS runtime/thiết bị thật/QR qua lens/GPS thực/screen reader, ma trận bàn phím đầy đủ hoặc FPS bản release. Export không thay nghiệm thu iPhone. **Việc người dùng cần quyết/tự làm:** review plan để duyệt đợt triển khai; thử điện thoại thật khi chốt phần cứng.
- Đã dừng Metro và emulator do mình khởi chạy riêng cho lượt audit sau khi lưu bằng chứng; chưa deploy preview mới cho điện thoại. URL LAN ở lịch sử 11/10 không được xác nhận còn dùng được.

## Sửa lỗi khi người dùng test iOS — 11/10/2026

- Người dùng mở preview Expo Go và gửi màn lỗi yêu cầu `UIViewControllerBasedStatusBarAppearance = YES`. Nguyên nhân là các tùy chọn `statusBarStyle` của native stack vừa thêm trong lượt fix trước; thư viện `react-native-screens` báo lỗi khi host iOS không bật cấu hình này.
- Đã bỏ điều khiển status bar từ native stack, dùng `StatusBar` của React Native theo route và trạng thái nguồn. Giữ chữ sáng trên ảnh, chữ tối trên trang nền sáng/thiếu dữ liệu; không đổi plist hoặc dependency.
- **100/100 test đạt**, typecheck và lint các file thay đổi đạt; diff check đạt. Metro trả bundle iOS mới HTTP200 tại `exp://172.25.54.39:8085`; server giữ chạy. Thêm ca chuyển route/Demo/Live kiểm style và không truyền native-stack overrides.
- Chưa xác minh lại trực tiếp trên iPhone. **Việc người dùng tự làm:** bấm Reload JS hoặc mở lại preview trên Expo Go để xác nhận hết màn đỏ; không có quyết định chặn sửa lỗi này.

## Yêu cầu mới nhất — 11/10/2026: sửa logic sau Antigravity

- Người dùng yêu cầu rà soát bản Antigravity, đưa cách fix/cải thiện; sau báo cáo `docs/ANTIGRAVITY_LOGIC_REVIEW.md`, người dùng nói **“ở demo dùng ảnh chung cũng được, check lỗi logic khác”**, rồi **“fix đi”**. Đây là quyền sửa các lỗi logic trong báo cáo; không mở phase backend/Voice.
- Đã sửa 11 mục: tách điểm xem/xác nhận, Q&A theo điểm và reset, nối CTA Plan/Sổ tay, bỏ GPS/voice/tiến độ giả, thêm đường thoát khi thiếu dữ liệu, pin theo ID thực, retry Live, tổng ngân sách và parser tiếng Việt. Tiến độ đã mở theo phiên; hộ chiếu ghi rõ là mẫu.
- Thêm kiểm tra camera focus/quyền đến muộn và QR/chọn tay từ chối điểm đóng. Không đổi ảnh hoặc thêm dependency.
- Kết quả: **99/99 test, typecheck, lint, diff check đạt**; export Android/iOS đạt. Android 17/API37 + Expo Go57.0.9 đã kiểm native các luồng chuyển điểm, Q&A/nhập chữ, xác nhận tay ở GPS, Plan15 phút/CTA, Live thiếu cấu hình/chuyển Demo và danh sách ngõ.
- Bàn giao: [docs/UI_LOGIC_FIX_HANDOFF.md](docs/UI_LOGIC_FIX_HANDOFF.md). Ảnh: `agent_docs/evidence/ui-logic-fix-2026-10-11/`. Test UI callback/state dùng native modules thay thế, không thay bằng chứng phần cứng.
- Chưa thử điện thoại thật/iOS runtime/QR qua ống kính/GPS thực/TalkBack/VoiceOver và ma trận layout đầy đủ. Backend production chưa có; retry thành công/response đến muộn kiểm bằng request có kiểm soát. Chưa commit/push.
- **Việc cần người dùng quyết/tự làm:** không có quyết định chặn lượt sửa; người dùng thử trên thiết bị thật/iOS khi muốn chốt nghiệm thu phần cứng. Tiến độ lưu lâu dài/Voice/backend vẫn riêng scope. Lịch sử cũ bên dưới không ghi đè yêu cầu fix mới này.

## Yêu cầu mới nhất — 11/10/2026: review trước khi xây lại UI

- Người dùng yêu cầu: “đọc UI và toàn bộ dự án, t muốn xây lại UI trước khi xây đưa đề xuất cải thiện UX nữa”. Đây là yêu cầu đọc/review/đề xuất, chưa duyệt triển khai UI mới hoặc mở phase backend.
- Đã chọn hướng thị giác: **“Sổ tay ngõ phố: ấm, giàu bản sắc”**. Chưa chốt font/palette cụ thể hoặc thay đổi logic.
- Theo yêu cầu “trước khi triển khai tiếp git pull bản mới nhất về đã”, đã chạy `git pull --ff-only`; `main` đã cập nhật với `origin/main`, HEAD `25c9e8c`. Giữ nguyên `.idea/` chưa được Git theo dõi.
- Bản review và đề xuất: [docs/UI_UX_REBUILD_PROPOSAL.md](docs/UI_UX_REBUILD_PROPOSAL.md). Khuyến nghị UI + nối luồng + sửa UX liên quan; cần chốt phạm vi và ý nghĩa quỹ thời gian trước khi code.
- Chạy lại 90/90 test đạt. Kiểm thêm xác nhận 15/60 phút cho cùng danh sách; parser chưa nhận “ẩm thực”, nhận “1 tiếng rưỡi” thành 60; Q&A hiện toàn bộ thuộc `demo-01`. Chưa sửa source hoặc lưu các ca này thành test hồi quy.
- Đã xem ảnh lưu Phase 2–6 và đối chiếu source; ảnh Phase 7 không mở được do chữ ký PNG sai. Chưa chạy build/native E2E mới, thiết bị thật/iOS hoặc typecheck/lint trong lượt review này.
- **Bước tiếp theo:** người dùng review đề xuất, chọn phạm vi; không suy việc chọn phong cách là quyền triển khai. Phần trạng thái phase và lịch sử cũ bên dưới được giữ nguyên, không dùng các dòng lỗi thời để ghi đè yêu cầu mới này.

## Trạng thái hiện tại

| Mục | Giá trị |
| --- | --- |
| Cập nhật | 03/10/2026 |
| Phase hiện tại | **7 — đã bàn giao, chờ G7; kế tiếp là phase backend** |
| Trạng thái | **Phase7 kiểm thử xong, chờ anh duyệt demo; backend là phase kế tiếp** |
| Native mobile | **Home fixture/khung đã chạy Android emulator và thử offline sau nạp bundle; điện thoại thật/iOS chưa kiểm tra** |
| Implementation approved | **Phase 7 (R7.01–R7.03)** |
| Công cụ đang dùng | OpenCode |
| Trình độ A/B/C | Chưa xác định; “người A” trong plan là vai trò, không phải trình độ |
| Gate G0 / quyền bắt đầu Phase 1 | Đã được người dùng duyệt rõ ràng; cho phép dựng khung trước khi có source |

## Nhiệm vụ hiện tại

Triển khai Phase2 (giới thiệu, Q&A cố định có nguồn, hỏi tiếp) theo `docs/TECH_DEMO_PLAN.md`. Trước coding cần chốt nội dung Q&A/nguồn demo vì nội dung là việc người dùng duyệt (G2). Không mở phase sau, không yêu cầu source cũ.

- [x] Đối chiếu repo/source và lập bảng tiến độ thực tế trong `agent_docs/phase_1_review.md`.
- [x] Dựng Expo shell/navigation/placeholders, demo error/live empty và source-state tests.
- [x] Chạy npm ci/test/typecheck/lint/dependency/config/doctor và hai Metro exports; dev shell smoke.
- [x] Review code độc lập; sửa nhãn header trung tính và cập nhật hướng dẫn/bằng chứng.
- [x] Sau khi anh nhắc Android Studio: tìm SDK Windows và chạy shell trên AVD Medium_Phone, Android17/API37, Expo Go57.0.9. Có ảnh Home/placeholder, kiểm tra mode/Back/cuộn/chữ lớn/xoay ngang.
- [x] Home đọc fixture mới từ bundle; JSON một nguồn, schema/label/sáu node được kiểm tra. Tests20/20 + hai Metro exports + emulator/offline sau nạp bundle đạt.
- [x] **Phase1 được người dùng duyệt (G1) 03/10/2026.**
- [x] Phase2 code: giới thiệu, chip, ô nhập, normalize+alias, nguồn, unknown, hỏi tiếp; tests48/48 + emulator13/13. Báo cáo `agent_docs/phase_2_review.md`.
- [x] **Phase2 được người dùng duyệt 03/10/2026.** Nội dung Q&A vẫn là mô phỏng; khi thay bằng dữ liệu thật vẫn cần duyệt lại nội dung.
- [x] Phase3 code: chủ đề/quỹ thời gian + tối đa 3 điểm có lý do; tests59/59 + emulator13/13. Báo cáo `agent_docs/phase_3_review.md`.
- [x] **Phase3 được người dùng duyệt 03/10/2026.**
- [x] **Phase3 được người dùng duyệt 03/10/2026.**
- [x] Phase4 code: xin quyền đúng lúc → QR node đã biết → người kể 2D + caption → chọn tay → camera dừng khi rời màn; thêm dependency `expo-camera` 57.0.6. Tests69/69 + emulator19/19. Báo cáo `agent_docs/phase_4_review.md`.
- [x] **Phase4 được người dùng duyệt 03/10/2026.**
- [x] **Phase4 được người dùng duyệt 03/10/2026.**
- [x] Phase5 code: lấy vị trí khi bấm nút → **một** candidate + accuracy + khoảng cách → microcopy “có thể là…” → chỉ xác nhận của người dùng mới đổi node → xử lý từ chối quyền/accuracy kém/ngoài cụm. Thêm dependency `expo-location`. Tests81/81; emulator 6/6 cho phần quyền bị từ chối + chọn tay. Báo cáo `agent_docs/phase_5_review.md`.
- [x] **Phase5 được người dùng duyệt 03/10/2026.**
- [x] **Phase5 được người dùng duyệt 03/10/2026.**
- [x] Phase6 code: adapter live (timeout 8s, URL theo môi trường), 6 trạng thái empty/error, demo không cần mạng, máy chủ kiểm chứng cục bộ, tài liệu handoff data/UI. Tests90/90 + emulator27/27. Báo cáo `agent_docs/phase_6_review.md`.
- [x] **Phase6 được người dùng duyệt 03/10/2026.**
- [x] ~~Cung cấp URL backend thật~~ — anh quyết định 03/10/2026: **dự án tự viết backend**, không phải việc của anh.
- [x] **Phase7:** kịch bản demo 45/45 bước × 3 lần; 17/17 kiểm tra fallback/mode/cỡ chữ/nhãn; bàn giao `docs/TEST_REPORT.md` + handoff API/data/voice/UI. **Offline thật không đạt** (Expo Go cần mạng để khởi động). Báo cáo `agent_docs/phase_7_review.md`.
- [ ] Phase7 (cũ): kịch bản `giới thiệu → hỏi → chủ đề → nhận điểm → xác nhận → lời kể → hỏi tiếp` chạy lặp lại bằng fixture offline + log; kiểm fallback camera/GPS/QR, Q&A, chuyển mode, bàn phím, cỡ chữ; bàn giao API/data/voice và danh sách thiết bị.
- [ ] Chạy quét QR thật trên điện thoại thật (emulator không đưa được mã QR vào khung hình camera).
- [ ] Điện thoại thật/iOS vẫn chưa kiểm tra ở bất kỳ phase nào; emulator không thay điều kiện đó.

## Bằng chứng duyệt

- 02/10/2026: người dùng nói **“Tôi duyệt phase 0. Hãy triển khai phase 1 theo TECH_DEMO_PLAN.md, kiểm tra và bàn giao để tôi review.”** G0 đã được duyệt; được phép dựng shell/cài dependency Phase1 và kiểm tra, rồi dừng.
- Khi được hỏi về source gốc chưa có, người dùng chọn **“Dựng khung trước”**: cho phép shell + báo blocked; không tạo fixture/core/backend thay thế.
- Đính chính tiếp theo: **“anh không có mã nguồn em phải viết mã nguồn từ con số 0 á đây là dự án mới”**. Xác nhận greenfield, thay giả định chờ source gốc. Không suy đây là duyệt Phase2–7 hoặc duyệt nội dung lịch sử/evidence; tạo fixture/schema sẽ chốt theo đề xuất mới trước coding.
- Người dùng đồng ý đề xuất sáu điểm mô phỏng: **“anh đồng ý hoàn thiện phase 1 đi”**. Cho phép tạo fixture/schema tối thiểu và hoàn thiện Home/kiểm tra trong Phase1 ngay ở phiên này. Không duyệt lịch sử/evidence thật hoặc Phase2.
- 03/10/2026: **“Tôi duyệt phase 1. Hãy triển khai phase 2 theo TECH_DEMO_PLAN.md, kiểm tra và bàn giao để tôi review.”** G1 được duyệt; cho phép Phase2 (giới thiệu, Q&A cố định có nguồn, hỏi tiếp), cập nhật MEMORY/checklist theo bằng chứng rồi dừng trước phase sau. Không kèm duyệt Phase3–7/voice hay duyệt sẵn nội dung lịch sử.
- 03/10/2026: **“Tôi duyệt phase [4]. Hãy triển khai phase 5 theo TECH_DEMO_PLAN.md, kiểm tra và bàn giao để tôi review.”** Cho phép Phase5; không kèm duyệt Phase6–7/voice.
- 03/10/2026: anh yêu cầu **thêm rule bắt buộc**: mỗi lần bàn giao phải note riêng (1) việc chỉ người dùng quyết được, (2) việc người dùng phải tự làm — đánh dấu `[ngoài plan]` nếu không có trong `TECH_DEMO_PLAN.md`, kèm hệ quả nếu chưa làm. Rule nằm ở `AGENTS.md` § “Việc cần người dùng quyết hoặc tự làm”.
- 03/10/2026: **“Tôi duyệt phase [5]. Hãy triển khai phase 6 theo TECH_DEMO_PLAN.md, kiểm tra và bàn giao để tôi review.”** Cho phép Phase6; không kèm duyệt Phase7/voice.
- 03/10/2026: anh quyết định: **backend do em tự viết luôn** (không có sẵn gì, tự làm từ FE đến backend) và **em sinh data để làm MVP**, ghi rõ là mô phỏng; khi nào có data thật thì anh cập nhật sau. Hệ quả: cần một phase riêng cho backend Node 24 + SQLite + seed data, có duyệt trước; `tools/mock-api/` chỉ là công cụ kiểm chứng.
- 03/10/2026: **“Tôi duyệt phase [6]. Hãy triển khai phase 7 theo TECH_DEMO_PLAN.md, kiểm tra và bàn giao để tôi review.”** Cho phép Phase7; voice vẫn chưa duyệt. Phase 7 đóng băng scope: chỉ kiểm thử, sửa lỗi trong phạm vi đã duyệt và bàn giao.
- 03/10/2026: anh chốt Phase6 = **timeout 8 giây**; **URL live từ biến môi trường `EXPO_PUBLIC_NGOKE_API_BASE_URL` + `app.json extra.apiBaseUrl`**; **adapter + máy chủ kiểm chứng cục bộ**, không dựng backend production và không sinh dữ liệu thật.
- 03/10/2026: anh chốt Phase5 = **accuracy > 50 m hoặc cách > 300 m thì không đưa candidate**, chỉ báo lý do + chọn tay; **thêm tọa độ mô phỏng** cho 6 điểm và ghi rõ là mô phỏng.
- 03/10/2026: emulator **không cấp được fix GPS** (`geo fix` trả OK nhưng mọi provider `last location=null`, app log `Current location is unavailable`) → nhánh candidate/outside-cluster chỉ kiểm bằng unit test; cần điện thoại thật.
- 03/10/2026: anh thêm `expo-camera` 57.0.6 bằng `npx expo install`; mã QR theo công thức `ngo-ke://node/<id>` sinh từ `id`, không lưu trùng trong dataset.
- 03/10/2026: **“Tôi duyệt phase [3]. Hãy triển khai phase 4 theo TECH_DEMO_PLAN.md, kiểm tra và bàn giao để tôi review.”** Cho phép Phase4; không kèm duyệt Phase5–7/voice.
- 03/10/2026: anh chốt quy tắc Phase3 = **lọc theo chủ đề, bỏ điểm đã ghé/đóng, tối đa 3 điểm theo thời lượng tăng dần**; **quỹ thời gian bằng chip 15/30/45/60 phút, vẫn gõ tay được**.
- 03/10/2026: **“Tôi duyệt phase [2]. Hãy triển khai phase 3 theo TECH_DEMO_PLAN.md, kiểm tra và bàn giao để tôi review.”** Cho phép Phase3; không kèm duyệt Phase4–7/voice.
- 03/10/2026: anh chọn **“1”** = dựng Phase 2 với bộ Q&A mô phỏng tối thiểu để anh review luồng, sau đó thay bằng dữ liệu thật.
- 03/10/2026: anh yêu cầu **“bỏ PWA và web trong plan, giữ lại API, thêm TTS STT”**. Agent báo xung đột với plan (voice phải duyệt riêng; STT cloud cần key/mạng); anh xác nhịn: **bỏ hẳn web/PWA, giữ API, voice vẫn là phase riêng (Phase2 làm text)**. Plan/PRD/TechDesign đã cập nhật X.07 và các dòng web/PWA. Đã tạo `docs/DATA_COLLECTION_GUIDE.md` để anh giao nhóm data.
- Phase 3–7 chưa bắt đầu và chưa được duyệt. Voice chưa được duyệt riêng; chưa chọn connector/giọng.

Khi có duyệt mới, ghi ngày, trích yêu cầu, phase được phép và phạm vi; không tự tạo bằng chứng duyệt.

## Quyết định giữ nguyên

- **Không web/PWA** (quyết định 03/10/2026): không xây web preview/`public/`/PWA; mọi nghiệm thu chạy trên app native.
- Expo/React Native native Android/iOS; Node 24 + JSON API + SQLite theo plan (giữ nguyên).
- Fixture offline và live tách biệt; không LLM, không dẫn đường; GPS cần xác nhận; người kể 2D + caption.
- `data/demo.json` đã tạo theo đồng ý sáu điểm kỹ thuật mô phỏng. Không có `public/core.js`/backend cũ; viết logic/backend mới ở phase tương ứng, không bắt buộc tạo web/core để khớp giả định lịch sử.
- Repo gốc: **https://github.com/Desithedev/ngoke.git** (private, nhánh `main`), đã đẩy thành công 03/10/2026 với commit `da312d4` (116 file). Người dùng đã cho phép tạo remote và push. Tổng quan phase + dữ liệu: `docs/MVP_ROADMAP.md`. Repo `mobile/.git` do Expo CLI tạo đã chuyển ra `/tmp/opencode/backup/mobile-git-scaffold` để dựng được một repo duy nhất.
- `mobile/` đã tạo sau duyệt Phase1. Không hook/pipeline, deploy hoặc store build; scaffold Expo tự tạo Git local trong mobile với initial commit, không remote/push/commit tính năng.
- Scaffold đã chọn SDK57/React19.2.3/RN0.86.3/TypeScript strict, React Navigation native-stack, React state và Node tests; xem `agent_docs/tech_stack.md`/`mobile/package-lock.json`.

## Bước tiếp theo và thông tin còn thiếu

**Bước tiếp theo:** anh review `agent_docs/phase_7_review.md` và xem demo; sau đó em trình **spec phase backend** (phạm vi toàn cục) để anh duyệt trước khi code. Dữ liệu thật và voice vẫn chờ; `tools/mock-api/` giữ làm công cụ kiểm chứng. **Bước trước đó:** triển khai Phase7 theo TDD (adapter live với timeout 8s, cấu hình URL theo môi trường, máy chủ kiểm chứng cục bộ, tài liệu handoff data/UI), kiểm tra và bàn giao kèm mục việc cần anh quyết/tự làm; dừng trước Phase7. Dữ liệu thật và backend thật vẫn chờ anh.

**Còn thiếu:** điện thoại thật/iOS runtime/offline cold start/screen reader chưa thử; G1 cần điện thoại thật và review. Audit còn23 cảnh báo. Fixture/Home và offline sau tải bundle đã thử. Logic/Q&A/backend thuộc phase sau chưa duyệt, không phải blocker Phase1 chờ source.

**Theo phase sau:** nội dung Q&A (2), ranking/time budget (3), QR/2D asset (4), GPS/tọa độ khảo sát (5), API/schema/dataset thật (6). Voice chỉ làm rõ ở phase riêng. Budget/deadline chưa xác định.

## Kết quả kiểm tra gần nhất

Phase1 fixture, cwd `mobile/`: `npm test` **20/20**, typecheck/lint/dependency check/Doctor21/21 và exportAndroid826/iOS831 modules đều exit0. Metro resolve JSON ngoài root ban đầu fail → thêm `../data` vào watchFolders, export/native runtime đọc thật đạt. Không đổi dependencies/lockfile. `npm ci`/public config đã đạt ở lượt shell trước.

`npm audit --json`03/10 còn **23 cảnh báo (7 moderate/16 high), exit1**; dry-run exit1, không ép downgrade Expo44/RN0.72 hoặc force/override. Kết quả cũ12 là snapshot02/10, đã được thay bằng audit mới. Chi tiết: `agent_docs/phase_1_completion.md`, `agent_docs/evidence/phase-1/fixture-completion/checks.json`.

Android emulator bản fixture: **12/12 thao tác**, **4/4 layout**, **5/5 offline sau nạp bundle** đạt. Sáu tên đã thấy bằng cuộn; live không có list. Wi-Fi/data tắt và routes rỗng vẫn chuyển mode/xem6 node được. SDK tại `/mnt/d/Dev/Android/Sdk`, AVD Medium_Phone Android17/API37, Expo Go57.0.9; SDK ADB5038 riêng với O+Connect5037. Nếu5038 chưa quét emulator sau boot, restart chỉ5038. URL hiện `exp://172.28.197.254:8085`; IP có thể đổi sau reboot. Mạng/font/rotation đã khôi phục. Activity recreate có thể reset mode-in-memory, không persistence.

Bằng chứng hiện hành: `agent_docs/evidence/phase-1/fixture-completion/`, code review độc lập không có finding; reviewer rerun tests exit0. Điện thoại thật/iOS runtime/offline cold start và các luồng Phase2–7 chưa kiểm tra/triển khai. **G1 chưa đạt đầy đủ; MVP chưa hoàn thành. Dừng trước Phase2.**

Lịch sử: Part4 có22/22 kiểm tra tài liệu; shell/emulator cũ trong `phase_1_review.md`. Plan gốc được cập nhật đính chính greenfield theo lời người dùng; không tiếp tục khẳng định hash plan giữ nguyên sau đính chính.

## 2026-10-13 — Voice Android emulator regression QA

- Authorization hiện hành là phần “Authorization triển khai Voice V0–V7” ở đầu file: user cho phép làm xuyên các gate GV0–GV7 trong phạm vi Voice, tự tiếp tục sau kiểm tra nội bộ; sandbox/review/quyền công cụ vẫn giữ nguyên. Không mua dịch vụ, không public deploy/store, không ghi âm/tải lên âm thanh riêng tư, không commit/push.
- Có Android SDK/ADB/AVD thật trên máy qua `D:\Android\Sdk` (API 37), trái với ghi nhận môi trường trước khi tìm đúng đường dẫn. Android Gradle `:app:assembleRelease` build thành công và cài/chạy được APK native. APK cấu hình gateway `10.0.2.2:8787`, chỉ dành emulator.
- Reproduce bug sau khi audio kết thúc rồi đổi điểm: `AudioPlayer.pause` gọi trên shared object đã release làm app crash. Sửa `useVoiceSession` để cleanup unmount không gọi player đã auto-release; Expo hook tự release player. Kiểm emulator lại: đổi điểm khi player đang phát và sau hết clip không crash; Back dừng, vào lại không autoplay; pause/resume/replay từ 00:00/stop và mở transcript khi phát đạt.
- Android mic permission prompt đã kiểm bằng native dialog, nhưng không cấp quyền/thu âm. Từ chối ban đầu làm mất thông báo do app-state transition trong lúc permission request; giữ pending permission result trong lúc system prompt hiện, hủy background/recording ngoài đoạn pending, đặt turn về null khi lỗi để error không bị xóa. Regression tests cho pending permission, background và inactive state.
- Trên emulator, từ chối mic hiện rõ lý do và Gõ chữ/Thử lại. Không chứng minh recorder, codec hoặc mic vật lý.
- Local STT gateway `/health` sẵn sàng với Node 24.14.1/faster-whisper 1.2.1/pinned small model; probe audio TTS fictional `demo-02-caption` 3.76s trả HTTP 200 trong ~3.83s, transcript đúng nội dung với sai biệt casing `An/an`, context echo đúng. Không phải app recorder E2E.
- AVD tắt Wi-Fi/data: story MP3 đóng gói tiếp tục phát với progress native; STT không được coi là offline.
- Hiện tại: 125 tests pass; typecheck/lint/dependency check pass; Android/iOS Expo exports pass; Android native release build pass; Metro + gateway LAN `/status`/`/health` HTTP 200 ở `192.168.100.36`. Evidence: `agent_docs/evidence/voice/android-emulator/`; báo cáo/handoff/phase reviews đã cập nhật.
- Còn mở GV2/GV3/GV5/GV7: loa/tai nghe và microphone thật; clip từ phone → gateway → transcript → fixed answer/audio; iOS; 34 clip nghe tay; font/screen-reader/Reduce Motion/background/call; latency p50/p95, jank, memory/listener 20 vòng. `npm audit` còn 23 advisory (8 moderate, 15 high); không chạy force downgrade.
## 2026-10-13 — Voice scope regression follow-up

- Trong Q&A, `scope` được tạo từ mode, dataset revision và node. Audit phát hiện khi scope đổi trong lượt đang thu/xử lý, callback cũ có guard bỏ transcript nhưng stage có thể kẹt và player/error cũ còn lại. Đã sửa `useVoiceSession` để đổi scope hủy lượt/request, dừng player, xóa lỗi và reset stage; mở/đóng text không làm đổi scope. Thêm test helper cho chuyển chương/mode/revision và cùng scope.
- Kiểm lại hiện tại: `npm test` **126/126**, TypeScript, ESLint, Expo dependency check và `git diff --check` đạt. V1 validator rerun bằng `tools/voice/.venv` đã ghim: 34 clip, 7.0 phút, 5.04 MB; transcript ASR vẫn có các clip WER cao nhất 23.1%, 18.9%, 17.6%; nghe tay còn pending. Chạy validator bằng Python hệ thống thiếu `faster_whisper`, đã chuyển sang virtualenv đúng và rerun thành công.
- Chưa xác minh lỗi scope trên mic/gateway đang chạy ở điện thoại thật; không có thiết bị iOS/Android thật trong môi trường. GV5/GV7 vẫn pending, không tuyên bố voice E2E đã nghiệm thu. Không commit/push.

## 2026-10-13 — Voice final emulator verification

- APK release hiện hành build thành công, 121,218,160 bytes, SHA-256 `9CF65B96B90D195D8C9F241F371C2428CA339405B8D00346EDC796AB9CB65946`; đã cài và chạy trên Android API 37 emulator. Mở app, vào Q&A, đổi điểm 01→02→03; không crash và player về ready/00:00 khi đổi điểm. Không cấp quyền mic hay thu âm.
- Kiểm lại LAN hiện tại: Metro `/status` và gateway `/health` HTTP 200 tại `192.168.100.36`. APK native dùng `10.0.2.2:8787` cho emulator; phone cần Expo Go preview LAN cùng mạng riêng tin cậy.
- Tài liệu V7/evidence/test report/handoff ghi kết quả mới và test count **126/126**. `git diff --check` đạt. Chưa hoàn tất phone mic→gateway→transcript→answer, iOS, nghe tay 34 clip, accessibility và perf; GV5/GV7 vẫn mở. Working tree còn nhiều thay đổi local; không reset/commit/push.
- Retest phát trên APK mới: accessibility snapshot đầu ở điểm 04 báo ready/0% nhưng không ổn định trong lúc UI chuyển động. Kiểm tra trực quan lại trên cùng APK sạch tại Q&A point 01 xác nhận play/progress 00:01/00:23, replay từ đầu, pause giữ 00:01, resume lên 00:02 và stop về ready. APK hash không đổi; log chẩn đoán tạm đã gỡ. Test native này không cấp quyền/thu âm, không kiểm phone/iOS hay mic→gateway→answer E2E; GV5/GV7 còn mở. Bằng chứng: `agent_docs/evidence/voice/android-emulator/README.md`.

## 2026-10-13 — Voice keyboard UX native regression

- Native retest tìm thấy Android keyboard che mất text drawer trong lúc nhập. Đặt `KeyboardAvoidingView` behavior thành `height` trên Android; thêm regression assertion. APK release build lại, cài API 37 và drawer giờ nằm phía trên keyboard, thấy ô nhập và nút Gửi.
- Trên APK cuối, nhập `day la diem nao` match câu hỏi point 01; drawer đóng, answer đúng node hiện ra, không autoplay; bấm Play mới phát audio. Kiểm lại player controls trên cùng APK: replay, pause, resume, stop và tiến độ hoạt động.
- Final APK: 121,218,164 bytes; SHA-256 `7F102173A0135E6A3891D395E7052E550AB3C69EBAAB6B433D636BA95680D00A`. `npm test` 126/126; typecheck, lint và Expo dependency check đạt.
- Chưa có phone/iOS evidence, mic thu thật → gateway → answer E2E, nghe người thật toàn bộ catalogue hoặc kiểm accessibility/performance thiết bị; GV5/GV7 vẫn mở. Không upload âm thanh cá nhân và không commit/push.

## 2026-10-13 — Voice catalogue transcript review

- Đọc report ignored `tools/voice/.cache/v1-qc/report.json`: 34/34 clip, 418.23 giây, 5,043,834 bytes; Faster-Whisper small CPU int8. Các exact-WER cao nhất: `qa-flowers-answer` 23.08% (12.82% bỏ dấu), `qa-cake-answer` 18.92%, `demo-01-caption` 17.65%, `demo-04-caption`/`demo-05-caption` 14.29%. Ví dụ ASR nghe “Mẹ An trồng giàn” thành “Mẹ an chồng dàn” và “đĩa bánh” thành “điện bánh”. Đây chỉ là ASR hypothesis, không đủ chứng minh lỗi phát âm; chưa nghe tay nên không tái tạo clip vội.
- `adb devices -l` hiện chỉ có `emulator-5554`, không có Android/iPhone thật. GV2/GV3/GV5/GV7 vẫn cần nghiệm thu trên thiết bị thật, đặc biệt microphone native → gateway → transcript → answer; GV1 cần nghe tay toàn bộ 34 clip.

## 2026-10-13 — Voice large-text QA and LAN address refresh

- Native Android API 37 emulator ở `fontScale=2.0` lộ lỗi Home header chồng chữ, nhãn DEMO và placeholder tìm kiếm bị cắt. Đã sửa Landing xếp header dọc với hit target 48dp, làm DEMO pill co giãn và giới hạn placeholder tìm kiếm một dòng. Release APK hiện hành SHA-256 `C7A5653490A6B3DDF4EC5DA80875CA0F479EE1E7AC69F17B43E6F9EFCADA5658`, 121,218,612 bytes. Screenshots: `font-scale-200-home.png`, `font-scale-200-home-final.png`, `font-scale-200-alley-final.png`, `font-scale-200-story-final.png` trong `agent_docs/evidence/voice/android-emulator/`.
- `npm test` 126/126, typecheck, lint, Expo dependency check và Android release build đã đạt sau thay đổi UI. Emulator font scale trả về 1.0; host keyboard khiến software IME ở 200% không xác minh được. Không cấp mic/thu âm. Chưa có máy Android/iPhone thật.
- Wi-Fi host đổi từ `192.168.100.36` sang `192.168.88.174`. Gateway `/health` và Metro `/status` trả HTTP 200 mới nhất, nhưng Expo Android bundle fetch còn treo sau khoảng một phút và bị ngắt; Expo Go preview chưa xác minh ở IP mới. Tool policy từ chối thao tác restart Metro; không thử lách. Handoff cập nhật lệnh restart chính xác và phải coi phone preview còn pending.
- Authorization tiếp tục theo yêu cầu user trong prompt triển khai Voice V0–V7; gate GV0–GV7 là kiểm tra nội bộ, không hỏi duyệt giữa phase. GV5/GV7 và hoàn tất đầu-cuối vẫn pending cho tới khi có mic/device evidence; không commit/push, không dùng dịch vụ trả phí/public deploy.

## 2026-10-13 — Voice V1 catalogue validation rerun

- Rerun `tools/voice/.venv/Scripts/python.exe tools/voice/validate_catalogue_v1.py` hoàn tất exit 0 trên asset hiện tại. Đối chiếu 34/34 clip, 418.23 giây, 5,043,834 bytes; MP3 decode/format/duration và source/text/audio hash đạt. Manifest SHA-256 `90747665D049CC3B4AF018672EF0935805F324236986D8F2047DC79B440113E9` đúng report/cache. Highest ASR WER vẫn `qa-flowers-answer` 23.1%, `qa-cake-answer` 18.9%, `demo-01-caption` 17.6%; đây không phải nghe QC. Human listen toàn bộ 34 còn pending.

## 2026-10-13 — Voice large-text keyboard follow-up

- Trên APK LAN mới nhất (SHA-256 `0E86AC88AE758A587EED292D7C1EACDC26855A9C56125E2308CA54F49C13D9CE`) và AVD Android API 37, đặt fontScale 2.0, bật software IME dù emulator hardware keyboard đang dùng; khôi phục fontScale 1.0 và tắt chế độ IME đó sau kiểm.
- Kiểm luồng native point 01: mở chữ, bật drawer “Gõ”, thấy title/input/Gửi/suggested chips khi IME mở, gửi `day la diem nao`, nhận đúng answer cố định; answer player ở trạng thái sẵn sàng, không autoplay. Bằng chứng/screenshot được ghi trong `agent_docs/evidence/voice/android-emulator/README.md` và `docs/VOICE_TEST_REPORT.md`. Đây chỉ là emulator text-entry proof, không phải mic→STT hoặc phone accessibility.
- Android/iOS thật, mic app→gateway→answer, nghe người thật 34 clip và các phép đo hardware vẫn pending; giữ GV5/GV7 mở, không tuyên bố hoàn thành E2E. Authorization xuyên GV0–GV7 của user vẫn đang áp dụng trong phạm vi Voice; không dùng dịch vụ trả phí, không public deploy, không commit/push.

## 2026-10-13 — Voice managed-session revalidation

- APK LAN còn nguyên: 121,231,324 bytes, SHA-256 `0E86AC88AE758A587EED292D7C1EACDC26855A9C56125E2308CA54F49C13D9CE`. ADB hiện không thấy emulator hoặc điện thoại. Không khởi chạy AVD vì môi trường ghi ngoài workspace bị giới hạn.
- Gateway cũ không trả `/health`. Thử khởi động đúng worker địa phương trên private NIC `192.168.88.174:8788`; Node không spawn được Python worker (`EPERM`) và process thoát. Không đổi cơ chế để né policy; gateway hiện chưa dùng được.
- `npm test` parallel runner cũng gặp `spawn EPERM`; chạy tuần tự từng file test bằng Node test API trực tiếp: **14 files, 131 pass, 0 fail**. Typecheck/lint pass. V1 validator hoàn tất sau thời gian dài: 34 clip, 418.23 giây, 5,043,834 bytes, manifest SHA `90747665...113E9`; ASR WER cao nhất 23.1%, 18.9%, 17.6%, cần người nghe.
- Chưa có thiết bị thật, mic E2E, human audio QC hoặc iOS/performance evidence; GV5/GV7 còn mở. Gate authorization của user tiếp tục có hiệu lực.
- Audit accessibility Q&A tìm thấy 6 Pressable thiếu label; đã thêm nhãn động cho lời kể/câu trả lời/hỏi tiếp/chip/nút đặt câu khác và assertion vào `uiFlows.test.mjs`. Sau sửa: 14 test files, **131 pass/0 fail**, typecheck/lint pass; static scan `QaScreen` 17/17 role+label.
- APK chưa build lại sau accessibility fix. Wrapper chạy được khi cache đặt trong `%TEMP%`, nhưng Gradle cần JDK 17; máy chỉ có JRE 8 và Android Studio JBR 25.0.3. Không cài/tải JDK trong sandbox. Binary cũ vẫn SHA-256 `0E86AC88AE758A587EED292D7C1EACDC26855A9C56125E2308CA54F49C13D9CE`.
- Current gateway `/health` không kết nối, Node spawn Python worker trả `EPERM`; ADB không liệt kê emulator/phone. Giữ các blocker này cùng mic E2E, nghe tay 34 clip, iOS và performance; goal vẫn active.

## 2026-10-13 — Voice export/native rebuild follow-up

- Tìm được JDK 17 sẵn có trong máy và chạy lại Android `:app:assembleRelease` với Gradle home trong `%TEMP%`, dependency cache chỉ đọc. Gradle/CMake tới bước kiểm tra ABI của Clang nhưng dừng ở link probe; sau khoảng 9 phút không có CPU/file tiến triển, đã dừng đúng các PID của build do mình khởi chạy. APK không đổi: 121,231,324 byte, SHA-256 `0E86AC88AE758A587EED292D7C1EACDC26855A9C56125E2308CA54F49C13D9CE`.
- Export mặc định lỗi `spawn EPERM` khi Metro tạo Hermes bytecode. Android/iOS exports chạy lại với `expo export --platform <platform> --no-bytecode --clear` và `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL=http://192.168.88.174:8788` đều exit 0; sau `--clear`, cả hai JS bundles có URL LAN, 34 MP3 và accessibility labels Q&A. Đây chỉ là JS/static asset exports, không thay native APK/IPA.
- ADB hiện không liệt kê thiết bị; `/health` gateway hiện không kết nối vì Node không spawn được Python worker (`EPERM`). Không gửi audio mic. Kết quả tests gần nhất sau sửa accessibility vẫn 14 files, 131 pass/0 fail; typecheck/lint pass. Native rebuild, phone mic→gateway→Q&A, nghe tay 34 clips, iOS device và performance vẫn pending; GV5/GV7 mở.

## 2026-10-13 — Voice native APK rebuilt

- Authorization user: triển khai V0–V7 xuyên GV0–GV7 trong scope Voice đã được ghi trước đây; gates là kiểm tra nội bộ, không dừng xin duyệt từng phase. Không mở scope LLM/AR/toàn cục, không mua dịch vụ, public deploy, hoặc commit/push.
- Android `:app:assembleRelease --offline --no-daemon --max-workers=1` hoàn tất `BUILD SUCCESSFUL` trong 11m09s với JDK 17; Gradle home `%TEMP%\g`, 377 tasks (47 executed, 330 up-to-date). Rút ngắn đường dẫn Gradle temp và làm mới ba CMake cache sinh tự động xử lý lỗi Ninja path.
- APK `mobile/android/app/build/outputs/apk/release/app-release.apk`: 121,231,544 bytes, SHA-256 `E8CE9A8DB3E875F287E8F0638FD00566039535AEFAF645057F205FA2437831E7`. ZIP đã kiểm: 34 MP3, URL gateway LAN `http://192.168.88.174:8788`, accessibility labels có trong bundle.
- ADB không có device nên chưa cài/xác minh APK mới trên emulator hoặc điện thoại. Gateway vẫn lỗi `spawn EPERM` khi tạo Python worker; không gửi clip mic. Mic→STT→Q&A trên app, nghe tay 34 clip, phone/iOS accessibility/audio routes/performance còn pending; GV5/GV7 mở, goal chưa hoàn tất.

## 2026-10-13 — Voice LAN preview and current-IP APK

- Gateway sandbox launch first failed with `spawn EPERM`; after tool review, started the Voice-only server hidden and bound specifically to the current Wi-Fi interface `172.25.45.50:8788` (not `0.0.0.0`). Node 24.14.1/faster-whisper 1.2.1 startup log says `ready`; process remains running as PID 26972. No firewall changes, public exposure or cloud use.
- Synthetic TTS audio sent to `/v1/transcribe`: HTTP 200, 18.81s, transcript returned, `turnId`/locale/mode/nodeId/datasetRevision echoed. Invalid media returned HTTP 415 `UNSUPPORTED_AUDIO_FORMAT`; 21s PCM WAV returned HTTP 400 `AUDIO_TOO_LONG`. Transcript had word errors; human quality review remains pending. No personal audio was sent.
- Found Gradle incremental build did not treat `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL` as an input: it reported success while preserving old URL. Forced `:app:createBundleReleaseJsAndAssets --rerun-tasks`, verified generated HBC has new URL and no old URL, then `:app:assembleRelease` succeeded (3m26s, 38 executed/339 up-to-date).
- Final APK `mobile/android/app/build/outputs/apk/release/app-release.apk`: 121,231,544 bytes, SHA-256 `1020E39520285521871741E2BCE198D14E018DDEFC06B5A82258BBEE24773362`. ZIP verified 34 MP3s, `http://172.25.45.50:8788`, no `192.168.88.174` URL, and accessibility labels. ADB still has no devices; app-to-gateway from native mic, physical-phone reachability, iOS, human listening and hardware performance remain unverified. Goal active; GV5/GV7 open.

## 2026-10-13 — Android recorder codec and LAN revalidation

- Voice V0–V7 authorization remains scoped to the native app; phase gates are internal. No paid service, public deployment, private user audio, LLM, global CRUD, commit or push was authorized.
- Found why the first recorder upload was rejected: `prepareToRecordAsync({ isMeteringEnabled: true })` replaced Expo’s full preset options, so Android recorded AMR-NB under a `.m4a` name. `mobile/src/voice/useVoiceSession.ts` now keeps `RecordingPresets.HIGH_QUALITY` plus metering at recorder construction and prepares without a partial override.
- Verification: `npm test` 138/138; typecheck/lint pass; Android `:app:assembleRelease` BUILD SUCCESSFUL; `node tools/voice/gateway/smoke_test.mjs` passed with local generated TTS and guard cases. Current APK is 121,233,212 bytes, SHA-256 `159EE52016DCC4F5B5B5C9DC697AB4FD20B0294D99B13A64CC74B5DED38F6D98`.
- Installed APK on Android API 37 AVD, recorded and submitted a real 19-second recorder file from Q&A point 01. Gateway accepted it and faster-whisper returned HTTP 422 `NO_SPEECH` in 1.134s; UI showed retry guidance. The emulator contained no intelligible speech, so this proves upload/codec/ASR no-speech handling, not spoken transcript, answer selection or playback. Evidence: `agent_docs/evidence/voice/android-avd-stt-no-speech-2026-10-13.png`.
- Gateway is running hidden and bound to current private Wi-Fi `192.168.100.36:8788` (PID 42408); `/health` is HTTP 200. Expo Go Metro is running on port 8087 (PID 44232); `/status` and Android/iOS bundle fetches are HTTP 200; both bundles contain the gateway URL. Expo Go link: `exp://192.168.100.36:8087`.
- Goal is not complete: real speech from a physical phone, mic→transcript→Q&A→audio, iOS native/device testing, manual listen/QC of all 34 clips, accessibility/audio-route/performance testing remain pending. Do not mark gates GV3/GV5/GV7 complete from AVD silence or synthetic TTS.

## 2026-10-14 — Push preference update

- The user explicitly requested automatic commit and push after each completed change. This supersedes the earlier no-commit/push instruction for future completed work. Push only the completed, relevant files; keep local-only memory/device details out of public commits.

## 2026-10-14 — Active Voice goal push scope

- The latest user-provided Voice V0–V7 goal says not to commit or push. This supersedes the previous automatic push preference for this active goal. Continue locally and keep reports/evidence current without committing or pushing unless a newer user instruction changes scope.

## 2026-10-14 — iPhone Voice smoke retest

- Sau reload Expo Go bằng bundle Metro cổng 8089, người dùng xác nhận meter và câu trả lời đều chạy trong một lượt thử voice trên iPhone. Ghi nhận đây là happy-path do người dùng báo, không phải log/quan sát độc lập; chưa có transcript nguyên văn hoặc model/OS thiết bị.
- Android APK mới 121,235,376 byte, SHA-256 `20154EE9B845396E43ED7F76AAD5AFD9C3639A870E017D23FF670E469E531773`, đã build/cài/mở trên API 37 AVD; tới Q&A điểm 01, chip không autoplay, answer 9 giây loop sau khi bấm Play và Stop về Ready. Evidence trong `agent_docs/evidence/voice/android-emulator/`.
- Giữ GV5/GV7 mở: cần kiểm thêm câu hỏi/chương, cancel/interruption, quyền/network failure, route loa/tai nghe/Bluetooth, accessibility và hiệu năng; iOS native/IPA và nghe tay toàn bộ audio cũng chưa nghiệm thu. Không có audio cá nhân được gửi hoặc lưu.

## 2026-10-14 — iPhone second-turn meter failure

- User reported: first iPhone voice turn succeeds; second turn loses the real meter and fails. No exact second-turn transcript, screenshot, or device log was received, so this remains a device-retest item.
- Likely race found in the code: mic start fired `player.seekTo(0)` without awaiting native completion, then changed the audio mode and prepared the recorder while the answer could be looping. Playback stop is now awaitable; recording waits for stop/seek, and voice-answer playback waits for stop completion.
- Added regression coverage for awaited pause/seek and adjusted the async UI-flow test. Current checks: `npm test` 144/144, typecheck, lint, `git diff --check`, and iOS JS export pass. Metro `exp://192.168.100.36:8089` is running; its iOS bundle HTTP 200 contains the fix. Gateway `192.168.100.36:8788/health` is ready.
- Physical iPhone two-turn retest remains necessary before treating the issue as confirmed fixed. No commit/push was made in this goal scope.

## 2026-10-14 — Expo Go config and Android recorder re-entry

- Revalidated current services: Metro `/status` and local gateway `/health` ready at Wi-Fi host `192.168.100.36` (`8089`/`8788`). The first Metro process was missing `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL`; restarted with the private gateway URL. iOS/Android bundle HTTP checks confirm both contain the endpoint and stop/seek fix.
- AVD API 37 loaded current Expo Go bundle. Played the existing answer, started recording with visible meter, canceled, then started recording again with the meter visible at `00:02`; canceled without sending either clip. No recent JS fatal/load errors. This proves recorder re-entry after Cancel on emulator, not after a successful STT answer and not on iPhone.
- Added UI regression for two sequential voice transcript callbacks; the second exact question “Có chuyện xưa nào ở đây không?” routes to `qa-05-answer`. Full suite 144/144, typecheck/lint, iOS export pass. Goal remains active: physical iPhone second-turn/STT test, human QC of 34 audio files, full hardware/accessibility/performance checks remain open.
- Current V1 rerun exited 0 for all 34 catalogue files (418.23s, 5,043,834 bytes); highest ASR WER remains 23.1% on `qa-flowers-answer`. Gateway synthetic smoke test exited 0 with invalid-format/duration/silence guards. ASR is not human listening QC.

## 2026-10-14 — Second iPhone turn still fails

- User retested and reported that the first voice turn works, but the second still fails and does not show the meter. No stage screenshot, transcript, or native error was provided.
- The earlier awaited-seek change could block microphone preparation on a native callback. Seek is unnecessary for stopping: the track is inactive after stop and the next Play replaces it from the beginning. `stopAudioPlayer` now only disables looping and pauses; its regression asserts this path never seeks.
- Full mobile suite 144/144, typecheck, lint, `git diff --check`, iOS JavaScript export, current Expo Go iOS bundle fetch, Metro `/status`, and LAN gateway `/health` pass. Preview remains `exp://192.168.100.36:8089`; gateway `http://192.168.100.36:8788` is ready.
- Physical iPhone must retest after reload. This software fix is not yet confirmed on device. No commit/push; the active Voice goal explicitly excludes both.

## 2026-10-14 — Voice Q&A route regression across chapters

- Expanded `mobile/tests/uiFlows.test.mjs` to run every one of the 21 canonical Q&A questions in its chapter and then the first linked follow-up. All 42 controlled transcript callbacks chose the exact answer ID/text and answer track.
- UI-flow file passes 23/23; full mobile suite 145/145; typecheck/lint pass. This is screen-routing evidence only, not mic/ASR/hardware proof.
- Updated the roadmap, V5 review, test report and mobile README. GV5 remains open for physical mic→STT→answer/playback coverage; the reported second iPhone turn failure also remains unconfirmed after the pause-only player stop change. No commit/push.

## 2026-10-14 — Voice intent question/command separation

- Added a QaScreen regression: “Chương kế là gì?” and “Điểm kế tiếp là điểm nào?” leave the selected chapter unchanged; “Mở chương kế” selects the next available one.
- UI-flow suite is 24/24, full suite 146/146, typecheck/lint pass. This validates dispatch using supplied transcript strings, not live ASR.
- Updated V6 review, roadmap, report and README. GV6 device speech checks and GV5 physical mic→STT→answer remain open; do not infer completion from UI tests.

## 2026-10-14 — iPhone second-turn recorder reinitialization

- User again reported that turn 1 works but turn 2 has no meter and fails. iPhone reproduction/log/transcript is still unavailable; treat the code-level cause as likely, not confirmed.
- In Expo Audio's iOS implementation, `prepareToRecordAsync(options)` constructs a new `AVAudioRecorder`; calling it without options reuses the stopped recorder. The app deletes each submitted recording file, so the next turn now prepares with the full `HIGH_QUALITY + isMeteringEnabled` options again. The helper passes these options on every turn; a regression verifies two sequential preparations retain metering.
- Full suite: **148/148**, typecheck, lint, `git diff --check` and `npm run build:ios` pass. Metro `exp://192.168.100.36:8089` serves HTTP 200 and its iOS bundle contains the new recorder options; gateway `http://192.168.100.36:8788/health` is ready. AVD fontScale restored from 2.0 to 1.0 after Home/Landing large-text checks.
- AVD fontScale 2.0 Home now uses the scrollable text-first point trail, with labels/details wrapping and the story dock usable. Landing top and scrolled states were inspected. Evidence: `agent_docs/evidence/voice/android-emulator/android-api37-font-scale-200-{home-trail,landing-top,landing-scrolled}-2026-10-14.png`.
- Need the user to reload Expo Go and verify after answer 1 loops: start mic again, confirm the real meter moves, then ask “Có chuyện xưa nào ở đây không?” and check the `qa-05` answer. No physical iPhone verification is claimed; GV3/GV5/GV7 remain open. No commit/push under the active Voice goal instructions.

## 2026-10-14 — Await playback stop before second mic turn

- Found that `stopPlayback()` awaited a helper that only called native `pause()` synchronously; it did not wait for the player to settle. A still-looping answer could race the next iOS audio-session switch and recorder preparation.
- `stopAudioPlayer()` now disables loop, pauses, and awaits native `seekTo(0)`; the mic path awaits the full stop before preparing the recorder. A deferred-seek regression proves this ordering.
- Focused playback tests 4/4; full suite 152/152; typecheck/lint, `git diff --check`, and iOS JavaScript export pass. Expo Go preview at `exp://192.168.100.36:8090` returns HTTP 200 and contains the new rewind path.
- This is a likely race fix, not physical-device confirmation. User must reload Expo Go and verify meter plus follow-up answer on voice turn 2; keep GV3/GV5/GV7 open until then.
