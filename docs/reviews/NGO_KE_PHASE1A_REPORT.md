# Ngõ Kể — Phase 1A Technical Foundation Report

Ngày: 23/10/2026 (Asia/Saigon)
Phạm vi: NK-001 và NK-013 theo backlog Phase 0.5
Trạng thái: **Phase 1A hoàn tất trong phạm vi host regression; đề xuất Phase 1B để người dùng xem xét.** Báo cáo này không mở quyền triển khai Phase 1B.

## 1. Baseline và worktree

- Branch trước và sau: `valentino/logic-fix-mobile-20261020`.
- HEAD trước và sau: `4af64c49a4ada47f952ddf76c35adfb90f826224`, trùng baseline được yêu cầu.
- Trước khi sửa, tracked worktree sạch. Các untracked đã tồn tại: `.agents/`, `docs/audits/`, `docs/plans/`, `mobile/.cache/`; không file nào bị xóa hoặc ghi đè.
- `core.autocrlf=true`; chưa có `.gitattributes`. Files được theo dõi có LF trong index và CRLF trong worktree, gồm các JSON localized liên quan. Báo cáo Phase 0 ghi cùng HEAD. Fingerprint SHA-256 của 10 source/test files mục tiêu cũng được kiểm lại trước khi sửa; không có source drift so với HEAD.
- Phase 0 audit và backlog được đọc để xác định giới hạn. NK-001 chỉ cho phép generator, test generator, catalogue test và policy tài liệu; NK-013 chỉ cho phép backend/API tests và HTTP E2E test, với backend source chỉ khi reproduction chứng minh lỗi hợp đồng. Không có backend source defect tái hiện được.

## 2. NK-001 — hash source ổn định qua LF/CRLF

### Root cause và reproduction

`mobile/tests/nodeStoryVoiceCatalogue.test.mjs:61` băm byte trực tiếp từ file source. Manifest được tạo từ source LF, còn Git checkout trên máy này tạo CRLF. Lần chạy đầu trước patch tái hiện lỗi ở assertion source hash: expected `2131350a…` nhưng checkout cho `cdba1e10…`. Assertion về spoken text và dataset revision trước đó vẫn đạt.

### Giải pháp

- `tools/voice/generate_node_stories.py:58` định nghĩa contract riêng: `sourceDataSha256` băm bytes sau khi đổi CRLF thành LF; `sourceDataRawSha256` băm nguyên bytes vừa đọc. Bare CR bị từ chối thay vì bị chuẩn hóa âm thầm.
- `read_rows()` và `manifest_value()` truyền cả hai trường vào manifest được tạo trong tương lai. Hash normalized giữ ổn định qua EOL; hash raw giữ provenance byte-level.
- `mobile/tests/nodeStoryVoiceCatalogue.test.mjs:43` kiểm tra LF và CRLF tương đương theo hash normalized, raw hash khác nhau, và đổi ký tự nội dung làm hash normalized thay đổi. Assertion manifest so với source dùng chính sách normalized, không xóa/bỏ qua assertion.
- `tools/voice/test_node_story_voice.py:34` kiểm tra contract, bare-CR rejection, 34 source rows và việc writer xuất cả hai hash. Test không gọi network/TTS.
- Không thêm `.gitattributes`, không renormalize repository, không sửa dataset hoặc manifest hiện tại. Manifest node-story hiện tại vẫn SHA-256 `0bf8a21a2b7995d67ba3088d130bde3a4f3da16f66e831da61359a07bd20b24b`; test đã kiểm tra đủ 34 textHash, 34 datasetRevision và 34 audio SHA-256.

Phân biệt hash sau thay đổi:

| Giá trị | Nội dung được băm | Vai trò |
| --- | --- | --- |
| `sourceDataRawSha256` | Byte source thực tế trong checkout | Provenance byte-level, nhạy với EOL |
| `sourceDataSha256` | Cùng source sau chuẩn hóa CRLF → LF | Fingerprint source ổn định giữa hệ điều hành |
| `textHash` | UTF-8 của riêng spoken story | Bảo vệ đúng câu chữ được đọc |
| `datasetRevision` | `canonicalDatasetJson(dataset)` | Pin toàn bộ dataset theo contract hiện hành |

Manifest đang lưu giữ nguyên không có trường raw provenance mới; generator sẽ ghi thêm trường đó khi một lần tạo manifest được cho phép trong tương lai. Không chạy generator tạo audio hoặc ghi manifest trong Phase 1A.

## 3. NK-013 — Backend/API regression có isolation

### Root cause và giải pháp

NK-013 là thiếu bằng chứng regression đầy đủ, không phải defect backend đã xác nhận. Backend và test hiện hành đã có coverage cho import, validation, pair replacement, rollback, backup, idempotency, digest mismatch, simulated opt-in, trạng thái ready/unavailable/error, giới hạn payload và V1/V2 response. Tôi chạy toàn bộ test backend cùng HTTP E2E trên dữ liệu tạm.

HTTP E2E tạo SQLite riêng dưới thư mục tạm của hệ điều hành, bind `127.0.0.1` với port `0`, và dùng fixture mô phỏng/reviewed cục bộ. Bổ sung `rmSync` ở teardown cho đúng hai thư mục do suite tự tạo để không để database tạm tồn lại. Backend test suite tự tạo và cleanup temp DB; localized contract test chạy real loopback với port tạm và database temp. Không dùng DB dự án, không mở rộng API/schema sang multi-collection.

Kết quả test bao gồm migration lặp an toàn; import pair VI/EN atomic; no-op khi nội dung không đổi; replacement cần opt-in; trigger mô phỏng lỗi giữa hai insert để xác nhận rollback giữ nguyên cặp cũ; backup/restore; digest mismatch/corrupt state fail-closed; locale headers; simulated data ẩn mặc định; health/ready và 404/503; GET-only, validation và body limit. Không cần sửa `backend/src`.

## 4. Files thay đổi

- `tools/voice/generate_node_stories.py` — hash source chuẩn hóa và raw provenance cho generator.
- `tools/voice/test_node_story_voice.py` — test hash contract và manifest fields.
- `mobile/tests/nodeStoryVoiceCatalogue.test.mjs` — EOL regression và assertion source hash ổn định.
- `tools/e2e/phase8-http.test.mjs` — cleanup chính xác temp DB directories do test tạo.
- `docs/reviews/NGO_KE_PHASE1A_REPORT.md` — báo cáo này.

Không sửa backend implementation, story, ảnh, GPS, Q&A, audio, voice catalogue, manifest, database dự án hoặc config môi trường.

## 5. Kiểm thử

| Lệnh | Kết quả thực tế |
| --- | --- |
| Trước sửa: `node --test mobile/tests/nodeStoryVoiceCatalogue.test.mjs` | **1 PASS, 1 FAIL**, tái hiện raw EOL mismatch tại dòng 61 |
| Sau sửa: `node --test mobile/tests/nodeStoryVoiceCatalogue.test.mjs` | **3 PASS, 0 FAIL, 0 SKIP** |
| `python -m unittest tools.voice.test_node_story_voice -v` | **7 PASS, 0 FAIL, 0 SKIP** |
| `npm test` trong `mobile/` | **391 PASS, 0 FAIL, 0 SKIP** |
| `npm test` trong `backend/` | **32 PASS, 0 FAIL, 0 SKIP** |
| `node --test tools/e2e/phase8-http.test.mjs` | **15 PASS, 0 FAIL, 0 SKIP** |
| `npm run typecheck` trong `mobile/` | Exit 0 (`tsc --noEmit`) |
| `npm run lint -- --no-cache` trong `mobile/` | Exit 0 |
| `git diff --check` | Exit 0 |

Một lần lint giữa chừng báo `TextDecoder` chưa import trong test mới; import tường minh từ `node:util` đã được thêm và lint chạy lại đạt. Tất cả lệnh cuối cùng đều chạy sau đó; không có test bị skip.

## 6. Failure, giới hạn và ảnh hưởng

- Không còn failure host regression trong phạm vi Phase 1A.
- Chưa chạy native device, nghe audio, iPhone, GPS hoặc QR vật lý. Đây không phải bằng chứng nghiệm thu thiết bị hay audio; không có audio nào được tạo/nghe và không gọi API trả phí.
- `sourceDataSha256` tiếp tục là trường tương thích cho hash source chuẩn LF; generator bổ sung `sourceDataRawSha256` ở lần ghi manifest tương lai. Manifest hiện tại không được ghi lại. Các consumer khác ngoài generator/test cần được rà soát nếu sau này bắt đầu đọc raw field.
- NK-013 kiểm chứng contract một publication pair VI/EN như thiết kế hiện tại. Không kiểm tra hoặc thêm multi-collection publication.
- Hash thay đổi nội dung vẫn fail; thay riêng EOL được chấp nhận. Spoken `textHash`, canonical dataset revision và hash audio vẫn được kiểm riêng, nên EOL normalization không hợp thức hóa clip có lời đọc cũ.
- `git diff --check` sạch; không đổi branch/HEAD, không commit/merge/push. Các untracked baseline vẫn còn nguyên.

## 7. Phase 1B

**Đánh giá: READY FOR USER REVIEW; chưa được mở để thực thi.** Hai ticket Phase 1A đạt exit criteria kỹ thuật và không phát hiện blocker mới. Phase 1B tiếp theo trong backlog là NK-002 (P0, notebook guide leakage giữa Demo/Live) và NK-003 (P1, Home intro playback sau blur); NK-004 là quick UX ticket tùy chọn, chưa nằm trong quyền Phase 1A hiện tại.

### Cần anh quyết

- Có mở Phase 1B cho NK-002 và NK-003 không? Đề xuất mở hai ticket này cùng phase theo dependency/file ownership hiện có. Nếu chưa mở, rủi ro Live hiển thị guide bundle ở trạng thái non-ready và race phát intro sau khi Home đã blur vẫn còn.
- NK-004 (`qa=[]` empty notice) có gom vào Phase 1B không? Đề xuất chỉ gom nếu muốn đóng quick UX item cùng đợt; nếu không, để backlog sau.

### Cần anh tự làm

- Không có việc bắt buộc người dùng tự làm để hoàn tất Phase 1A. Native device/listening evidence vẫn là gate riêng trước nghiệm thu thiết bị/audio ở phase phù hợp.

Không có claim về duyệt nội dung, quyền ảnh, audio hoặc thiết bị được thay đổi trong báo cáo này.
