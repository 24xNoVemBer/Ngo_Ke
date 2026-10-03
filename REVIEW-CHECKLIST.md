# Review Checklist — Ngõ Kể

> Checklist dự án dựa trên template Part 4 trong yêu cầu và gate của [plan](docs/TECH_DEMO_PLAN.md). Không có bản `/templates/REVIEW-CHECKLIST.md` để copy nguyên văn; nguồn và giới hạn ghi ở [setup_review.md](agent_docs/setup_review.md).

Chỉ dùng các mục thuộc phase đang review; không đánh dấu phase tương lai. Checkbox là tiêu chí, không phải lịch sử duyệt. Bằng chứng người dùng duyệt ghi trong `MEMORY.md`.

## 1. Trước thực hiện

- [x] Đã đọc `AGENTS.md`, `MEMORY.md` và tài liệu liên quan.
- [x] Người dùng duyệt G0/Phase1 rõ ràng, yêu cầu plan ngắn và thực hiện cùng lượt.
- [x] Đã nêu cách làm; người dùng đính chính greenfield và đồng ý tạo fixture sáu điểm mô phỏng để hoàn thiện Phase1.
- [x] Điểm lệch đường dẫn/trạng thái nguồn đã báo; giữ source hiện có, không mở phase sau.

## 2. Gói bàn giao — cuối phase báo rồi dừng

- [x] Nêu Phase1/R1.01–R1.03 và mức bàn giao khung; G1 chưa đạt đầy đủ.
- [x] Liệt kê file/hành vi hiện hành trong `agent_docs/phase_1_completion.md`; report shell cũ là lịch sử.
- [x] Có cách mở tại `mobile/README.md`, ảnh Home/placeholder Android emulator; **điện thoại thật/iOS chưa kiểm tra**.
- [x] Có command/cwd/version/exit/log tại `agent_docs/evidence/phase-1/`; native exports không gọi runtime pass.
- [x] Đã ghi điện thoại thật/iOS/cold start chưa thử; fixture không còn blocked. Audit mới23 cảnh báo chưa khắc phục hết.
- [x] Nêu nội dung review và cập nhật `MEMORY.md`.
- [x] Bàn giao khung và **dừng trước Phase2**; chờ review, chỉ sửa Phase1 khi được yêu cầu.

## Bằng chứng gate hiện tại — 03/10/2026

- [x] **G0:** người dùng duyệt rõ Phase0 và cho phép Phase1 trong tin nhắn hiện tại.
- [x] **R1.01 phần code/tooling:** Expo native shell/skeleton/navigation và dependency/config/doctor/Metro export đã có bằng chứng.
- [ ] **R1.01 phần thiết bị:** ≥1 điện thoại Expo Go + thao tác/ảnh — chưa kiểm tra.
- [x] **R1.01 bằng chứng emulator bổ sung:** AVD Medium_Phone Android17/API37 + Expo Go57.0.9; Home/4 placeholder/mode/Back đã thử, có ảnh/XML. Không thay nghiệm thu điện thoại thật.
- [x] **R1.02 phần mode:** demo-ready/error với input hợp lệ/sai; live empty không dataset/fallback; tests20/20.
- [x] **R1.02 fixture Home:** người dùng đồng ý6 điểm mô phỏng; một JSON bundled qua Metro, Android runtime thấy đủ6 node; tắt Wi-Fi/data sau nạp bundle vẫn dùng được. Cold start offline chưa thử.
- [x] **R1.03 phần code:** safe-area/scroll, màu/font/press/accessibility semantics đã có.
- [x] **R1.03 emulator cơ bản:** cuộn, chữ hệ thống1.5, xoay ngang và Back đã thử; settings đã khôi phục.
- [ ] **R1.03 review điện thoại thật và G1:** chưa thử trên điện thoại thật và chưa được người dùng chốt.
- [x] **R2.01:** Home → giới thiệu ngắn + nguồn, chip câu hỏi mẫu, ô nhập chữ; kiểm tra emulator đạt.
- [x] **R2.02:** exact/alias khớp sau khi bỏ dấu; không LLM. Unit + emulator đạt.
- [x] **R2.03:** đáp án kèm nguồn; câu ngoài danh sách báo “Chưa có dữ liệu”; dataset thiếu evidence bị từ chối. Đạt.
- [x] **R2.04:** 1–2 câu hỏi tiếp dùng chính cơ chế Q&A; chặn followUp trùng/tự trỏ. Đạt.
- [ ] **G2:** người dùng duyệt nội dung Q&A mô phỏng; chưa có nội dung thật.
- [x] **R3.01:** hỏi chủ đề (chip + gõ) và quỹ thời gian (chip + gõ); thiếu lựa chọn thì yêu cầu chọn. Đạt.
- [x] **R3.02:** tối đa 3 điểm, mỗi điểm có lý do và thời lượng mô phỏng; nêu rõ không phải đường đi. Đạt.
- [x] **R3.03:** loại điểm đã ghé/đóng, báo khi không còn điểm phù hợp; ca kiểm thử interest/time/visited/available/empty/thứ tự ổn định. Đạt.
- [ ] **G3:** người dùng duyệt luật xếp hạng, câu hỏi và câu lý do; dữ liệu vẫn mô phỏng.
- [x] **R4.01:** camera tắt khi mở màn; bấm nút mới xin quyền và bật; `dumpsys media.camera` xác nhận camera được trả khi rời màn. Đạt.
- [x] **R4.02:** chỉ nhận `ngo-ke://node/<id>` với node đã biết; QR lạ không được nhận. **Chưa kiểm end-to-end trên emulator.**
- [x] **R4.03:** lớp người kể 2D tạm + caption của điểm trên preview, lời kể lấy từ dữ liệu Phase 2; không mascot hi-fi, không audio. Đạt, vị trí/kích thước chờ duyệt.
- [x] **R4.04:** từ chối quyền hoặc QR lạ vẫn chọn điểm bằng tay và đọc nội dung bằng chữ. Đạt.
- [ ] **R4.05:** chưa kiểm trên iPhone hay điện thoại thật.
- [ ] **G4:** người dùng duyệt vị trí/kích thước người kể, câu xin quyền, định dạng QR.
- [x] **R5.01:** chỉ lấy vị trí khi bấm nút, đọc một lần, không watch; candidate kèm khoảng cách và accuracy, microcopy “có thể là…”. Đạt.
- [x] **R5.02:** candidate không tự đổi node; `currentNodeId` chỉ đổi khi người dùng xác nhận (test chặn trạng thái “confirmed”); sau khi xác nhận có microcopy ưu tiên QR; chọn tay ghi rõ là mô phỏng. Đạt.
- [x] **R5.03:** xử lý từ chối quyền, không có vị trí, không có tọa độ, accuracy kém, ngoài cụm; không nhánh nào tự xác nhận; luôn có chọn tay. Đạt.
- [ ] **R5.05:** người dùng review microcopy và quy trình trước khi thử ngoài thực địa; **chưa kiểm trên iPhone hay điện thoại thật**.
- [ ] **G5:** người dùng duyệt microcopy/quy trình; tọa độ vẫn mô phỏng.
- [x] **R6.01:** live gọi `{base}/api/dataset` với URL từ biến môi trường, dự phòng `app.json extra`; kiểm shape và nguồn bằng validator chung với demo. Đạt.
- [x] **R6.02:** thiếu cấu hình → empty; rỗng/404 → empty; sai shape/mất nguồn, HTTP lỗi, lỗi mạng, quá 8 giây → error; có nút “Thử lại”; không bao giờ nạp `data/demo.json`. Đạt, kiểm chứng từng trạng thái trên emulator.
- [x] **R6.03:** demo đọc fixture trong bundle, không cần API/server/key; đã tắt máy chủ rồi kiểm lại demo vẫn chạy. Đạt.
- [x] **R6.04:** `docs/HANDOFF_DATA.md` và `docs/HANDOFF_UI.md` có quy tắc, danh sách file không được sửa và checklist trước khi gửi. Đạt.
- [ ] **G6:** người dùng duyệt câu chữ trạng thái, đường dẫn endpoint và cách cấu hình URL; **chưa có backend thật**.
- [x] **R7.01:** kịch bản `giới thiệu → hỏi → chủ đề → nhận điểm → xác nhận → lời kể → hỏi tiếp` chạy **3 lần**, 45/45 bước, có log `scenario-runs.json`. Đạt.
- [ ] **R7.01 (offline thật):** **không đạt** — Expo Go cần mạng để khởi động (`Failed to download remote update`); đã ghi bằng chứng `offline-limitation.txt`. Cần bản build standalone, là quyết định của người dùng.
- [x] **R7.02:** fallback camera/vị trí, Q&A ngoài danh sách, chuyển demo/live, nhãn accessibility, cỡ chữ 1.3 — 17/17 đạt; live lỗi không chuyển thành demo. **Bàn phím mềm chưa kiểm được** (emulator không bật IME). Đạt, có giới hạn.
- [x] **R7.03:** `docs/TEST_REPORT.md` (ma trận thiết bị, phần chưa thử), README mở demo, handoff API/data/voice/UI. Đạt; người dùng xem demo trước khi chốt tech demo.
- [ ] **G7:** người dùng duyệt demo và mức độ hoàn tất.
- [ ] **GV:** phase voice chưa mở, chưa có code.

Gói Phase 7: `agent_docs/phase_7_review.md`; tests90/90, typecheck/lint/dependency/Doctor21/21 và hai export đạt; kịch bản 45/45 bước × 3 lần; 17/17 kiểm tra bổ sung; offline thật **không đạt**; audit còn23 cảnh báo (7 moderate/16 high).

Gói Phase 6: `agent_docs/phase_6_review.md`; tests90/90, typecheck/lint/dependency/Doctor21/21 và hai export đạt; emulator27/27 với máy chủ kiểm chứng cục bộ; audit còn23 cảnh báo (7 moderate/16 high).

Gói Phase 5: `agent_docs/phase_5_review.md`; tests81/81, typecheck/lint/dependency/Doctor21/21 và hai export đạt; emulator6/6 cho nhánh quyền bị từ chối; **nhánh candidate/outside-cluster không kiểm được trên emulator** (máy ảo không cấp fix GPS, xem `agent_docs/evidence/phase-5/emulator-gps-limitation.txt`); audit còn23 cảnh báo (7 moderate/16 high).

Gói Phase 4: `agent_docs/phase_4_review.md`; tests69/69, typecheck/lint/dependency/Doctor21/21 và hai export đạt; emulator19/19; audit còn23 cảnh báo (7 moderate/16 high).

Gói Phase 3: `agent_docs/phase_3_review.md`; tests59/59, typecheck/lint/dependency/Doctor21/21 và hai export đạt; emulator13/13; audit còn23 cảnh báo (7 moderate/16 high).

Gói Phase 2: `agent_docs/phase_2_review.md`; tests48/48, typecheck/lint/Doctor21/21 và hai export đạt; emulator13/13; audit03/10 còn23 cảnh báo (7 moderate/16 high).

Gói mới nhất: `agent_docs/phase_1_completion.md`, `agent_docs/evidence/phase-1/fixture-completion/checks.json`. Emulator bản fixture12/12 thao tác,4/4 layout,5/5 offline sau nạp bundle; audit03/10 còn23 cảnh báo (7 moderate/16 high). Điện thoại thật và reviewG1 vẫn chưa tick.

Các dấu tick ở đây ghi phần cụ thể có bằng chứng, không chuyển thành “Phase1 hoàn thành”.

## 3. Điều kiện gate theo phase

| Gate / yêu cầu | Điều kiện review |
| --- | --- |
| G0 — R0.01–R0.03 | Plan/PRD/Tech Design/sơ đồ, ranh giới và phần chưa xác minh được review; chưa tạo native project; chưa tự ghi pass |
| G1 — R1.01–R1.03 | Home/skeleton, fixture/mode, dependency check/lệnh/ảnh; ≥1 điện thoại Expo Go; duyệt cấu trúc/trình bày |
| G2 — R2.01–R2.04 | Intro/Q&A/alias/evidence/follow-up được duyệt; exact/alias/unknown/nguồn có bằng chứng; không LLM |
| G3 — R3.01–R3.03 | Chuyện xưa/ẩm thực, thiếu điểm/thời gian, interest/budget/visited/unavailable/unreachable; ≤3 điểm có lý do/ETA; review câu hỏi/thứ tự/giải thích |
| G4 — R4.01–R4.05 | Known QR đúng node, unknown/denied manual/chữ, camera theo thao tác/dừng khi rời màn; review 2D/caption, báo Android/iPhone nếu có |
| G5 — R5.01–R5.03 | Candidate không tự xác nhận; denied/kém/ngoài cụm/nhầm; “có thể là…”; review flow trước thực địa; tọa độ khảo sát trước Ao Sen |
| G6 — R6.01–R6.04 | Contract/API/record đã review; empty/error giữ live; demo độc lập mạng/key/server; review trước gắn data thật/hi-fi; handoff B/C |
| G7 — R7.01–R7.03 | End-to-end lặp lại/log, fallback/mode/Q&A/bàn phím/chữ; ma trận thiết bị, README/handoff A/B/C; người dùng xem/chốt demo |
| GV — RV.01–RV.03 | Sau core và duyệt riêng + connector/giọng; TTS/STT vẫn Q&A cố định, fallback chữ; báo engine/thiết bị/mạng/dữ liệu thật |

## 4. Ranh giới và tính trung thực

- [x] Không tự thêm LLM/chatbot, AR/3D/lip-sync/OCR, voice trong core, dẫn đường/tracking nền hoặc UI hi-fi.
- [x] Không fixture gắn nhãn live, không fallback demo; không nhân bản thuật toán/fixture.
- [x] Không API ghi từ mobile, schema/migration hoặc xóa source hiện có.
- [x] Không push remote/deploy/store hoặc bypass test/hook. Git local do CLI tự tạo đã ghi rõ.
- [x] Không ghi pass cho source/device/phần cứng chưa thử; không dùng web/mock thay nghiệm thu native.
- [x] Có tests/TS/lint/bundle phù hợp khung; các giới hạn runtime/audit chưa đạt được ghi riêng.
