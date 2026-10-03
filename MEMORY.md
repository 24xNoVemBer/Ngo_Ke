# MEMORY.md — Ngõ Kể

> Bộ nhớ thuộc dự án. Cập nhật theo sự kiện đã xảy ra; không suy duyệt phase từ việc sửa tài liệu.

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
