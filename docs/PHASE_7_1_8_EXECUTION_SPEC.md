# Spec thực hiện Phase 7.1 và Phase 8 — 16/10/2026

## Quyền và baseline

Người dùng yêu cầu “chạy end-to-end đi, hiện tại ch cần t duyệt”; G1/G2 đã resolve, chưa phải nghiệm thu. Coordinator là Codex/W1, không phải Claude. Baseline `9a3931848b13f283155056128bd3ce5aee71a90a`; audit cũ tại `25c9e8c`. Nhánh `origin/feat/mvp-backend` tại `6e0c5bfee9afe175fa5519dafefffe26e5a68ec1` chỉ là nguồn tuyển file/hunk, không merge/cherry-pick nguyên nhánh.

Các mô tả Phase 0/7 đang chờ duyệt trong tài liệu cũ là lịch sử; quyền hiện hành ở đầu AGENTS.md. Đã sửa ở baseline: retry liveRevision, camera focus/foreground và parseTimeBudget. Không làm lại, không đổi voice engine/audio/matcher, không thay data/demo.json hoặc catalogue/hash voice.

## Hợp đồng live cuối cho đợt này

- Giữ `GET {base}/api/dataset`, timeout **8 giây tổng**, không retry/probe ngầm, không fallback demo hoặc persistence live. Demo vẫn schemaVersion 1, kind simulated, đúng 6 node.
- Live schemaVersion 1, kind simulated hoặc reviewed; 1..50 node, 0..200 QA. Đây là mở hợp đồng cũ cần nâng app trước server; unknown version bị từ chối. Giữ field envelope `disclaimer`, `intro`, `startNodeId`, `nodes`, `qa` và mọi kiểm tra ID/reference/evidence hiện có.
- Giữ API parser `parseDataset(value, { mode: 'live' })` cho backend dùng chung; mặc định không options vẫn là demo. Không nhân bản thuật toán/schema sang backend. Có thể thêm export/type tối thiểu khi cần, không đổi matcher/ranking.
- Simulated luôn ghi rõ mô phỏng/chưa xác minh, không gọi là dữ liệu thật đã duyệt. Reviewed chỉ hợp lệ khi **intro, mỗi node và mỗi QA** có `reviewStatus: 'approved'`, `updatedAt` là timestamp UTC hợp lệ; evidence bắt buộc không rỗng. Thiếu metadata là shape error, không suy duyệt từ kind/shape đơn thuần. Metadata chỉ là khai báo của quy trình import, không chứng minh lịch sử thực.
- Evidence bắt buộc ở intro/QA theo shape hiện có; không tự thêm node evidence hoặc sửa fixture/audio/hash. Fixture khóa hiện6node/21QA, max story481/answer206/intro339 ký tự, tương thích các trần trên.
- Canonical empty là **404 NO_REVIEWED_DATA**; thiếu URL cũng empty. **200 chỉ ready với dataset đầy đủ, không rỗng**; chỉ có nodes:[], envelope thiếu/sai hoặc reference/evidence lỗi đều error. Siết quy tắc 200 rỗng cũ được bao gồm trong quyền triển khai hiện tại. Không tạo một envelope empty thứ hai.
- Trần UTF-8 body 512 KiB, caption 220 ký tự, story/answer 2000, intro.text 4000, disclaimer 2000; ID 128, name/summary/question/alias/tag 500, từng evidence 2000 và tối đa 20 evidence/record; giữ aliases 1..7, followUps 0..2, tags tối đa 20. Không cắt nội dung để che lỗi. Demo fixture không bị đổi để vừa limit; xác minh fixture tương thích trước bàn giao.
- URL chỉ HTTP(S), không credentials/query/fragment; giữ path prefix. UI hiện origin an toàn, không lộ full URL. Abort khi mode/revision/unmount thay đổi; bỏ kết quả cũ, không hiển thị lỗi hủy vào màn mới. Timeout vẫn bao gồm đọc body. Kiểm Content-Length và actual body; nếu RN thiếu stream API và chỉ giới hạn sau đọc, ghi đúng giới hạn bộ nhớ đó trong QA, không nhận là chặn transport cứng.
- Backend read-only JSON HTTP, không auth/key cho demo nội bộ; default loopback, mở LAN tường minh. Dataset 404 khi chưa có nội dung công bố; DB/schema hỏng 503; method khác GET trả405 với Allow:GET; unknown route404 NOT_FOUND. Health/ready chỉ tình trạng DB/dataset, không LLM/voice/config/secret.

## W2 — Antigravity / task_e1798fd985fb

Sở hữu `mobile/App.tsx`, `mobile/src/data/**`, app UI/navigation và `mobile/tests/**`. Đọc AGENTS/MEMORY/spec trước coding; ghi model **thực tế** khi bắt đầu, không suy từ phiên audit. Không sửa backend/tools hoặc tài liệu của W1.

Ưu tiên đầu: triển khai shared parser/type + live adapter theo hợp đồng trên, giữ default demo; test sourceState/live, UI retry và late results. Commit riêng **parser/adapter/test** sớm rồi gửi coordinator SHA để W3 dùng; không chờ toàn bộ UI mới báo. Hợp đồng không rõ thì hỏi coordinator bằng ask; không hỏi lại người dùng các quyết định đã được giao.

Sau đó sửa nhãn/UI liên quan và assertion location yếu; giữ retry/camera/parser giờ đã đúng. Không refactor toàn app, không đổi visited/GPS accuracy/ranking/navigation scope. Có thể đọc thiết kế mới ở workspace chính, nhưng **không copy WIP metrics/useVoiceSession, không lấy nguyên QaScreen/LandingScreen hoặc tự triển khai GPS discovery** trong đợt này; presentation/story-world thuộc đợt hậu Phase8 đã có yêu cầu riêng. Không sửa workspace chính.

Được `npm ci` theo lockfile trong worktree mình. Chạy test/typecheck/lint phù hợp và Expo export Android/iOS nếu công cụ có; iOS export không phải iPhone runtime. Test mới: reviewed thiếu metadata, đúng/không đúng node count, invalid-empty, URL redaction, oversized/chunked hoặc headerless body, abort/deadline và retry một request, không fallback. Không thay expected để che bug. Không gọi server production.

Commit đúng file sở hữu vào `valentino/test-antigravity`; báo SHA, test thật/pending và giới hạn. Không merge main/push. Tool e2e/mock/voice không chạy trong W2; W4 phụ trách kiểm tích hợp.

## W3 — Codex gpt-6-luna xhigh / task_61b0b1b144ab

Sở hữu `backend/**` và tests backend trên `valentino/backend-luna`. Tuyển nền DB/migration/CLI/config/tests từ `6e0c5bf` bằng đọc git show; **không checkout nguyên nhánh, không cherry-pick commit có mobile/docs**. Không viết lại nền đang đúng chỉ để khác cấu trúc. Không sửa mobile/docs/voice.

Phạm vi: Node24 + built-in node:http/node:sqlite, không npm dependencies. Chỉ GET dataset/health/ready; CLI migrate/setup/seed/import. Giữ STRICT/FK/prepared statements/WAL/transactions; seed không đè dữ liệu; explicit replace tạo backup trước, invalid import/constraint rollback; migration không chạy ngầm lúc server start. Thêm reviewStatus/updatedAt theo hợp đồng; thiết kế migration/backup trước khi dùng DB có giá trị. Chỉ test trên temp DB, không đụng DB người dùng.

Mặc định không công bố simulated; opt-in SERVE_SIMULATED_DATA=true phục vụ nguyên mẫu và nhãn mô phỏng. Không tự chuyển fixture thành reviewed. Reviewed import cần xác nhận rõ và metadata đầy đủ.

**Không tuyển** chat.mjs/llm.mjs/chat tests/LLM config/test routes/conversation/gateway/mobile local DB/voice. Không endpoint QA/recommendations trong phase tối thiểu này, để matcher phía app giữ semantics node hiện tại. Không outbound API hay đọc/in secrets.

Backend dùng parser live chung W2. Có thể chuẩn bị backend độc lập song song, nhưng không sửa/copy parser để làm test xanh: chờ SHA parser W2, hỏi coordinator để đưa commit đó vào worktree riêng. Sau đó chạy Node tests backend + adapter actual HTTP (temp loopback server được phép), kiểm empty/error/405/limits, migration 2 lần, reopen, backup+restore, rollback/SQL injection. Ghi bằng chứng không chạy nếu còn thiếu parser; tiếp tục phần độc lập.

Commit file backend sở hữu, báo SHA + test thật + pending; không main/push/deploy. Heartbeat mỗi5 phút và check follow-up tại checkpoint theo preamble.

## W4 — OpenCode Muse / task_d82ac6443e6d

Model đã chốt `opencode/muse-spark-1.3-contributor-free`; không effort giả, xác minh requested/effective. Sau W3 có SHA, coordinator cung cấp đúng commit backend và app parser. Sở hữu `tools/e2e/**`, công cụ mock kiểm thử nếu cần, test tích hợp/bảo mật và QA report trên `valentino/review-backend`; không sửa worktree W2/W3.

Sửa guard parseRuns: hữu hạn, nguyên>=1; thiếu/NaN/0/âm/thập phân không báo đạt. Zero checks fail; output mặc định thư mục mới gitignored, không đè evidence đã commit. SDK/adb/device/port portable và có kiểm chọn thiết bị. Test guard thuần trong tools/e2e, không tranh mobile/tests với W2. Có quyền chạy E2E/mock-api phù hợp task; **không chạy tools/voice** trong Phase7.1/8.

Kiểm HTTP thật: dataset/404/no-config/500→retry→OK/shape/thiếu nguồn/review/body lớn/method405/timeout/hủy/không fallback; route chat/llm không tồn tại, không key/stack/outbound. Kiểm npm test/typecheck/lint, native journeys/QR/camera/GPS/offline cold start khi emulator có. Kiểm thiết bị sẵn có trước, không tự dừng/khởi động lại emulator hoặc service người khác. Báo pending thật nếu không có fix/QR/iPhone, không lấy screenshot/export làm proof runtime. Ghi SHA/build/device/command/runCount và pass/fail/pending. Lỗi source gửi owner sửa, không tự sửa backend/app.

## Coordinator/W1 và hoàn tất

W1 chỉ tài liệu/hợp đồng/MEMORY/checklist và Git integration được phép trên nhánh local, không source sản phẩm. Tách commit docs/parser/backend/tests, tự kiểm diff/SHA/test trước nhận worker_done. Không merge main/push, không ghi workspace chính hoặc dọn evidence/cache của người khác. Workers dùng orchestration, không native collaboration thay thế Orca.

W4 chạy sau backend; có thể review parser/app sau khi đã có SHA. T4 tích hợp local trên nhánh riêng, có review/test với SHA cụ thể. Chỉ coi Phase8 đạt khi pipeline backend+adapter và QA bắt buộc có bằng chứng, không chỉ worker_done. Thiếu thiết bị ghi giới hạn cụ thể, không tự nhận test chưa chạy.

Sau Phase8 đạt: task `task_29530ca62743` theo `E:/Project/Ngo_Ke/ngoke/docs/CLAUDE_POST_PHASE8_STORY_EN_PROMPT.md`, Codex làm coordinator, W4 vẫn Muse. Được tự chủ checkpoint nội bộ theo yêu cầu đó, không xin duyệt từng task; chỉ hỏi quyền/ngân sách/credential/quyết định thực sự chặn. Đây là scope riêng VI/EN UI+content+audio+STT, không được mở sớm trong code Phase8.
