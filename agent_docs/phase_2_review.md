# Phase 2 — Giới thiệu và hỏi đáp cố định: bàn giao

**Ngày:** 03/10/2026. **Phạm vi:** R2.01–R2.04. **Trạng thái:** code trong phạm vi đã triển khai và kiểm tra trên Android emulator; **người dùng cần duyệt nội dung Q&A trước khi đưa vào dữ liệu thật**. Phase 3–7/voice chưa được phép.

## Quyền thực hiện

- Người dùng duyệt Phase 1 và yêu cầu triển khai Phase 2.
- Người dùng chọn phương án: **bắt đầu với bộ Q&A mô phỏng tối thiểu để review luồng**, sau đó thay bằng dữ liệu thật theo [`DATA_COLLECTION_GUIDE.md`](../docs/DATA_COLLECTION_GUIDE.md).
- Cùng lượt, người dùng chốt: **bỏ hẳn web/PWA** (plan/PRD/TechDesign/AGENTS đã cập nhật), **giữ API**, **voice vẫn là phase riêng**. Không thêm TTS/STT vào Phase 2.

Spec đã dùng: [`2026-10-03-phase-2-intro-qa-design.md`](../docs/superpowers/specs/2026-10-03-phase-2-intro-qa-design.md).

## Thay đổi

| File | Nội dung |
| --- | --- |
| `data/demo.json` | Thêm `intro` (2–3 câu + evidence), `startNodeId`, và 6 câu Q&A mô phỏng có `evidence`, `aliases`, `followUps`, `tags`. Giữ nguyên `schemaVersion`/`kind`/`disclaimer`/`nodes`. |
| `mobile/src/qa/match.ts` (mới) | `normalizeQuestion` (bỏ dấu, `đ/Đ`, hoa/thường, khoảng trắng, dấu câu cuối) và `findAnswer` (exact → alias → unknown). Không LLM, không fuzzy. |
| `mobile/src/data/sourceState.ts` | Validate `intro`, `startNodeId`, `qa`: evidence bắt buộc, alias 1–5, followUp ≤2 và phải tồn tại, cấm trùng `id`, cấm hai câu chiếm cùng một câu hỏi đã chuẩn hóa, cấm followUp trùng/ tự trỏ về chính nó. |
| `mobile/src/screens/QaScreen.tsx` (mới) | Giới thiệu + nguồn, chip câu hỏi mẫu, ô nhập + nút Hỏi, đáp án nguyên văn kèm nguồn, 1–2 chip hỏi tiếp, thẻ “Chưa có dữ liệu” cho câu ngoài danh sách. |
| `mobile/src/screens/UnavailableScreen.tsx` (mới) | Khi nguồn không có dataset thì Q&A báo rõ thay vì trả nội dung rỗng. |
| `mobile/src/screens/HomeScreen.tsx` | Nút vào Q&A, nhãn “điểm khởi đầu”, bỏ placeholder Q&A khỏi danh sách màn hình, cập nhật chữ Phase 1–2. |
| `mobile/App.tsx`, `mobile/src/navigation.ts` | Route `Qa`; chỉ mở khi nguồn `ready`. |
| `mobile/tests/qa.test.mjs`, `mobile/tests/qaRegressions.test.mjs` (mới) | Ca exact/alias/unknown, tính toàn vẹn nội dung, và hồi quy cho lỗi review phát hiện. |
| `mobile/tsconfig.json` | Bật `allowImportingTsExtensions` để module dùng chung import được cả Metro, `tsc` và test runner. |

Không thêm dependency, không đổi lockfile, không mở API/camera/GPS/ranking/ETA.

## Kiểm tra thật

Môi trường Node **24.19.0**, npm **11.17.0**; cwd `mobile/`. Expo 57.0.26, RN 0.86.3, React 19.2.3.

| Lệnh / thao tác | Kết quả |
| --- | --- |
| `npm test` | **48/48 đạt** (gồm 14 ca dữ liệu lỗi, 4 ca hồi quy) |
| `npm run typecheck` | Exit 0 |
| `npm run lint` | Exit 0 |
| `npm run check:dependencies` | Exit 0 |
| `npx --yes expo-doctor` | Exit 0, **21/21 đạt** |
| `npm run build:android` | Exit 0 (Metro/Hermes export; không phải runtime pass) |
| `npm run build:ios` | Exit 0 (không phải iOS runtime pass) |
| `npm audit --json` | Exit 1, **23 cảnh báo: 7 moderate, 16 high** (không đổi so với 03/10 sáng) |
| Android emulator Medium_Phone, Android 17/API 37, Expo Go 57.0.9 | **13/13 đạt**: giới thiệu + nguồn, chip câu hỏi, đáp án nguyên văn + nguồn, chip hỏi tiếp dùng chung cơ chế, gõ tay alias được trả lời, gõ tay câu lạ báo “Chưa có dữ liệu” kèm câu đã hỏi và không lộ đáp án, ô nhập được xoá sau khi hỏi, một lần Back về Home, không có lỗi JS trong logcat gần nhất |

Ảnh: [giới thiệu](evidence/phase-2/qa-intro.png), [đáp án](evidence/phase-2/qa-answer.png), [hỏi tiếp](evidence/phase-2/qa-followup.png), [câu ngoài danh sách](evidence/phase-2/qa-unknown.png), [gõ tay được trả lời](evidence/phase-2/qa-typed-answer.png). Lệnh/exit/log: [checks.json](evidence/phase-2/checks.json), [interaction-checks.json](evidence/phase-2/interaction-checks.json).

## Lỗi tìm được và đã sửa

Review độc lập không có Critical, nhưng có 3 lỗi thật; em viết test hồi quy trước, xem fail, rồi sửa:

1. **Sau dấu câu có khoảng trắng thì không khớp** (`match.ts`). `normalizeQuestion('Hỏi gì tiếp?  ')` cho ra khóa khác `Hỏi gì tiếp` → câu đúng báo nhầm “chưa có dữ liệu”. UI hiện tại che được vì `ask()` trim trước, nhưng sẽ hỏng khi khớp bằng text gốc (live, voice). Đã sửa thứ tự: gộp khoảng trắng trước, bỏ dấu câu sau.
2. **Hai câu chiếm cùng một câu hỏi** (`sourceState.ts`). Thêm alias `có chuyện xưa không` vào `qa-01` khiến dataset vẫn hợp lệ và câu hỏi về chuyện xưa trả về đáp án về vị trí — sai nhưng vẫn có nguồn. Đã thêm kiểm tra trùng khóa đã chuẩn hóa cho cả câu hỏi và alias.
3. **FollowUp trùng hoặc tự trỏ về chính nó** (`sourceState.ts`). Tạo hai chip giống nhất (React cảnh báo trùng `key`) hoặc vòng lặp hỏi lại y hệt. Đã chặn cả hai.

Thêm từ review: thẻ “chưa có dữ liệu” hiện kèm câu hỏi đã hỏi (trước thiếu ngữ cảnh khi ô nhập đã bị xoá), gom `followUpEntries` gọi một lần, cập nhật chữ Home.

Trong quá trình kiểm tra trên emulator: lần đầu app chạy bundle cũ (phải `force-stop` Expo Go rồi mở lại để lấy bundle mới); bàn phím Gboard mở panel “Try out your stylus” nuốt mọi ký tự `adb input text` — tắt `stylus_handwriting_enabled` rồi nhập lại được. Một lần dừng Metro không dừng tiến trình con, phải dừng đúng PID giữ cổng 8085. **Một lần check Back báo fail chỉ vì Home còn cuộn**, đã xác minh lại bằng danh sách điểm hiện sau một lần Back.

## Ranh giới và giới hạn

- Nội dung là **mô phỏng**, ghi rõ trong app và trong `evidence`; chưa phải nội dung thật. Cần anh duyệt khi thay bằng dữ liệu thật.
- **Chưa có**: chọn/xác nhận điểm, gợi ý điểm theo chủ đề/quỹ thời gian, camera/QR/người kể 2D, GPS, backend live — đều thuộc phase sau chưa được phép.
- Không có offline cold start cho màn Q&A; kiểm tra offline của Phase 1 vẫn giữ nguyên phạm vi.
- **Chưa kiểm tra**: điện thoại thật, iOS runtime, screen reader, nhiều kích thước màn, bàn phím thật có che nút “Hỏi” hay không.
- Normalize chưa bỏ dấu ngoặc kép/ellipsis khi dán từ nguồn khác; chưa kiểm tra offline cold start; màn Q&A không có test tự động riêng (chỉ kiểm thủ công trên emulator) vì chưa thêm thư viện render.
- `npm audit` còn 23 cảnh báo; chưa áp dụng `--force`/downgrade.

## Nội dung cần anh review

1. Lời giới thiệu và câu trả lời có đúng **giọng văn** anh muốn không (ngắn, đúng chỗ, không hứa hẹn).
2. Bốn câu hỏi mẫu và 1–2 câu hỏi tiếp có hợp lý không.
3. Có giữ câu hỏi trả lời trực tiếp (QA-03, QA-05, QA-06 nói “chưa có dữ liệu”) hay muốn bỏ hẳn khỏi bộ mẫu.
4. Vị trí hiển thị nguồn và thẻ “Chưa có dữ liệu” có rõ không.
5. Có muốn giữ nút “Xem câu hỏi khác” hay bỏ.

**Dừng ở Phase 2.** Chưa chốt G2, chưa bắt đầu Phase 3.