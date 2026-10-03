# Testing — Ngõ Kể

> Nguồn: [PRD](../docs/PRO-NgoKe-MVP.md) mục 4/10/11 và [Tech Design](../docs/TechDesign-NgoKe-MVP.md) mục Testing Strategy & Commands. Bản này mô tả kiểm tra cần làm, không khẳng định đã chạy.

## Lệnh và công cụ — Phase 1, cwd `mobile/`

- **All tests:** `npm test` → Node built-in20/20 gồm14 subtest dữ liệu lỗi; RED→GREEN có log. Kiểm tra file fixture thật/ready/error/live isolation; UI/runtime riêng.
- **Typecheck:** `npm run typecheck` → `tsc --noEmit`, exit0.
- **Lint:** `npm run lint` → ESLint10/typescript-eslint, exit0. Chưa chọn formatter.
- **Build/Metro:** `npm run build:android`, `npm run build:ios` → shell export đạt, không APK/IPA/store hoặc runtime pass.
- **Dependency/config check:** `npm run check:dependencies`, `npx expo config --type public --json`, `npx expo-doctor` → đạt, Doctor21/21.
- **Dev smoke:** `npm start -- --offline --port 8085 --go` → local packager/manifest/dev bundle đạt. Không ghép offline/localhost flags.
- **Dependency audit:** `npm audit --json`03/10 → exit1,7 moderate/16 high,23 total. Dry-run exit1; không force/downgrade Expo/RN.
- **Browser/device check:** Medium_Phone Android17/API37 +Expo Go57.0.9 bản fixture:12/12 thao tác,4/4 font/landscape,5/5 offline sau tải bundle đạt; settings restored. Điện thoại thật/iOS/cold start/screen reader **chưa kiểm tra**. SDK/ADB5038/WSL URL theo README.
- **AI eval:** không áp dụng cho core vì không LLM. Kiểm tra voice theo bộ Q&A chỉ sau GV; không cài pipeline eval AI.

Kết quả/exit/log hiện hành: [Phase1 completion](phase_1_completion.md)/[checks.json](evidence/phase-1/fixture-completion/checks.json). Fixture kỹ thuật đã tạo mới theo người dùng duyệt, không chờ source cũ. Test thiếu input là biên adapter; thiếu hẳn file static JSON làm Metro fail. API/device thật/phase sau chưa triển khai hoặc chưa thử; command/emulator đạt không tự đủG1. Không thêm runner/coverage không cần.

## Kiểm tra tài liệu ở Phase 0

1. Đối chiếu tên nguồn, user stories, scope, mã yêu cầu và sáu chỉ dấu thành công với ba tài liệu `docs/`.
2. Kiểm tra các link nội bộ, code fence Markdown và JSON metadata nguồn; giữ nguyên `implementationApproved: false` và lệnh chưa xác định.
3. Kiểm tra trạng thái Phase 0/chờ review/native chưa bắt đầu; không có bằng chứng duyệt giả.
4. So sánh hash nguồn trước/sau, xác nhận chỉ thay file hướng dẫn/tài liệu; không có `mobile/`, dependency hoặc code tính năng mới.
5. Rà các điểm lệch và nguồn template tại [setup_review.md](setup_review.md). Kiểm tra cấu trúc tài liệu không thay thế việc người dùng duyệt G0.

## Ma trận kiểm tra theo phase

| Phase / mã | Ca cần kiểm tra | Bằng chứng / điều kiện |
| --- | --- | --- |
| 1 — R1.01–R1.03 | Expo config/dependencies; Home fixture bundle; navigation, mode, safe areas/one-hand; live chưa cấu hình → empty | Ít nhất một Android hoặc iPhone mở/thao tác bằng Expo Go; ảnh, SDK/OS/thiết bị/lệnh |
| Gate core — T.03 | Đọc exports/dependencies/side effects; resolve file gốc + fixture; bundle; runtime expected output; restart/cold bundle | Sau duyệt; trước dùng core ở 2–6. Ghi platform riêng; Node/web/bundle đơn thuần chưa chứng minh RN runtime |
| 2 — R2.01–R2.04 | Intro/chip/input; exact/alias → nguyên đáp án; unknown/thiếu evidence; attribution; 1–2 follow-up hợp lệ; lỗi dataset tách riêng | Corpus/evidence/follow-up được review, expected từ source thật; không LLM |
| 3 — R3.01–R3.03 | Chuyện xưa/ẩm thực; input ngắn/chủ đề/quỹ thời gian; interest, budget, visited, unavailable, unreachable; thiếu điểm/thời gian; ≤3 điểm + lý do/ETA | Expected ranking/ETA từ core/data đã review, không tự viết oracle mới; không dẫn đường |
| 4 — R4.01–R4.05 | Chỉ thao tác mới xin quyền/bật camera; known QR đúng node; unknown/denied → tay/chữ; caption dùng lại Phase 2; rời màn dừng camera; QR lặp | Android và iPhone nếu có; thiếu thiết bị ghi chưa kiểm tra. Microcopy/overlay được review; policy chống QR lặp còn chưa xác định |
| 5 — R5.01–R5.03 | Bấm GPS → một candidate; accuracy/khoảng cách khi có; “có thể là…”; xác nhận/chọn lại; denied/kém/ngoài cụm/nhầm; không commit từ callback/tracking nền | Threshold review trước thử; phân biệt mock/thực địa, chỉ test Ao Sen sau khảo sát tọa độ; manual demo ghi mô phỏng |
| 6 — R6.01–R6.04 | API/shape/reference/nguồn; live thiếu URL/dataset/rỗng → empty; network/API/timeout/parse/shape lỗi → error; đổi mode/node, response cũ; demo không API/key/server/mạng | Contract thực tế + record đã review. Live chưa sẵn sàng ghi chưa kiểm tra với data thật; không fallback fixture/cache live |
| 7 — R7.01–R7.03 | Lặp `giới thiệu → hỏi → chọn chủ đề → nhận điểm → xác nhận → xem lời kể → hỏi tiếp`; hồi quy Q&A/mode/camera/QR/GPS; bàn phím/chữ; README/handoff | Log từng lần và ma trận thiết bị; đóng băng scope; người dùng chốt demo |
| Voice riêng — RV.01–RV.03 | TTS đọc text cố định; STT về alias/Q&A; lỗi/không hỗ trợ/chưa chọn giữ chữ | Chỉ sau core/GV, connector/giọng được chọn; báo engine/quyền/mạng/retention/hỗ trợ thật |

**Offline:** tách điều kiện tải/khởi chạy bundle Expo Go khỏi luồng fixture không mạng sau khi mở. Không hứa first launch hoàn toàn offline nếu chưa thử. Mock camera/GPS không chứng minh phần cứng; browser không thay Android/iOS.

## Báo cáo và xử lý lỗi

Mỗi ca ghi: phase/mã PRD; input/context/mode; expected đã review; actual; **đạt / không đạt / chưa kiểm tra**; lệnh + cwd + version hoặc thao tác; log/ảnh; giới hạn. Có thể ghi không áp dụng với lý do thật, không dùng để che phần chưa thử.

Thiết bị ghi platform/model/OS/Expo SDK thực tế và ca đã thử. Không tự điền version/device. Tránh log raw GPS/câu nhập/ảnh camera hoặc bí mật khi không cần và chưa có quyết định dữ liệu.

Kiểm tra fail → giữ expected đã review, thu bằng chứng, sửa nguyên nhân trong phase và chạy lại ca liên quan. Không bypass hook/test hoặc đổi expected để biến sai thành pass. Khi chỉ sửa tài liệu, dùng kiểm tra tài liệu phù hợp, không dựng app/test runner mới. Cuối phase báo giới hạn rồi dừng theo [REVIEW-CHECKLIST.md](../REVIEW-CHECKLIST.md).
