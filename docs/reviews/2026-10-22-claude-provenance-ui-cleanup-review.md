# Claude — rereview độc lập: làm gọn UI provenance (22/10/2026)

Chỉ đọc; không sửa source/test/data/asset/config. Cây: `valentino/logic-fix-mobile-20261020`, HEAD `4bc7d26` + WIP. Theo chỉ thị mới nhất của người dùng, việc gỡ nhãn mô phỏng/nguồn/đã duyệt/evidence là chủ đích, **không** coi là hồi quy.

## 1. Lệnh đã chạy lại độc lập
| Lệnh | Kết quả |
| --- | --- |
| `npm test` (trong `mobile`) | exit 0 — tests 335, pass 335, fail 0 |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 |
| `git diff --check` (root) | exit 0 (chỉ cảnh báo LF→CRLF) |
Khớp báo cáo Anti. Không chạy lại Metro (đã kiểm ở vòng trước, không restart); không chạy thiết bị native. Digest 451 file do coordinator đưa **không tự tính lại** được vì tập file chính xác không được liệt kê; thay vào đó: `git diff` không có thay đổi nào ở `data/`, `mobile/assets`, `backend`, `voice`, `package*.json`; ba file WIP được bảo vệ (`PrologueScreen.tsx`, `photoMap.ts`, `IMAGE_SOURCES.md`) chỉ còn đúng 10 dòng thay đổi như vòng trước (2+4+4), không có thay đổi mới.

## 2. Kết luận
**CHƯA ĐẠT toàn phần theo chỉ thị "xóa hết"; ĐẠT từng phần.** P2-1 và P3-1 gốc đã giải quyết. Các bề mặt Landing/Qa/Camera/Home/Postcard/Trail/Plan/Location đã sạch. Nhưng **còn sót chữ nguồn/mô phỏng thật ở Notebook, AlleySelect và hai chuỗi Qa** (P2 bên dưới). Chức năng không mất. Không có P1.

## 3. Đối chiếu mục gốc
- **P2-1 (dòng trạng thái): ĐÃ GIẢI QUYẾT.** `landing.mode_status` = `Truyện chữ · {mode}` / `Text stories · {mode}`; `LandingScreen.tsx:150` truyền chế độ thật. Test `provenanceUiCleanup.test.mjs:249-362` mount thật `LandingScreen` với `mode:'live'` + bộ sưu tập `old-quarter-pilot` (reviewed) và `demo`, VI và EN, bằng `translator` thật, khẳng định `Truyện chữ · Live`/`Text stories · Live`/`· Demo` và vắng `mô phỏng`/`simulated`. Không rỗng. Hạn chế: `source` là đối tượng dựng tay (`title:'Máy chủ Hà Nội'`), không phải `getSourceState`/`live` thật — xem P2-1 bên dưới.
- **P3-1 (key cũ): ĐÃ GIẢI QUYẾT.** `landing.soundscape_banner`, `quote_*`, `featured_section_pre`, `quick_section_pre`, `passport_close_label` không còn trong `translator.ts` (kiểu `TranslationKey` + từ điển) hay `src`/`tests`. Vì `TranslationKey` là union kiểu, `tsc` xanh chứng minh không còn tham chiếu — không phải test "thiếu key mà vẫn pass".
- **Lỗi ở bản một phần trước (thiếu phản hồi GPS/chế độ, 4 test fail):** không còn. 335/335 pass. GPS: diff `LocationScreen.tsx` chỉ đổi nhãn a11y chọn tay, thời lượng và dòng giới hạn an toàn; logic quyền/ứng viên/nút Đổi điểm/nút cài đặt không bị đụng. Chế độ: `notebook-mode-demo/live` radio, `retry`, `busy` giữ nguyên (`NotebookDrawerModal.tsx`), test (d) vòng trước và `remediationIntegration` vẫn xanh.

## 4. Phát hiện

### P2-1 (source-proven): Sổ tay vẫn hiển thị `source.title`/`source.detail` thật, chứa chữ "mô phỏng"/"đã duyệt"/"Nguồn:"
- Bằng chứng: `NotebookDrawerModal.tsx` (khối `sourceTitle`/`sourceBody`) render `source.title` và (live) `source.detail`. Chuỗi thật:
  - Demo: `sourceState.ts:724-726` `Đã nạp N điểm mô phỏng` / `Loaded N simulated points` (và V2 `:765-768`). Phần detail demo bị thay bằng câu "Dữ liệu ngoại tuyến sẵn sàng…" (không còn "Nguồn:") nhưng **title vẫn là "mô phỏng"**.
  - Live ready: `live.ts:170-172` `Live · N điểm đã duyệt` / `Live · N điểm mô phỏng (chưa xác minh)`; detail `live.ts:179` `Nguồn: <origin>. Dữ liệu live không lưu trong app.` (hiện trọn ở sổ tay).
- Tác động: trái chỉ thị mới, thấy được ngay khi mở Sổ tay ở Landing/Home/Qa ở cả Demo và Live.
- Test không bắt: test Notebook (`provenanceUiCleanup.test.mjs:313-412`) dùng nguồn dựng tay đã làm sạch (`'Máy chủ Hà Nội'`, `'Dữ liệu trực tiếp'`, `'Demo'/'Sẵn sàng'`) → không dùng `getSourceState('demo', …)` hay đầu ra `live.ts` thật; assertion "truthful source detail preserved" thực chất kiểm chuỗi do chính test đặt (tautological đối với rủi ro này).
- Phần giữ lại hợp lý: các nhánh lỗi/empty của live (`liveTitles`, `live.reason.*` như "chưa có điểm đã duyệt", "thiếu nguồn") là thông báo vận hành — nên giữ theo chỉ thị.

### P2-2 (source-proven): `AlleySelectScreen` không được làm gọn
- `AlleySelectScreen.tsx` không có trong diff. Còn hiển thị: thẻ `alley_select.meta_info` = `Bìa minh họa · N điểm · Demo` / EN tương ứng (`:377`); gợi ý `alley_select.hint` = "…từ nguồn Demo/Live" (`:246`); live `alley_select.live_meta_info` `Nguồn máy chủ Live · N điểm` (`:376`); badge `live_source_badge` "Nguồn máy chủ Live" (`:205,301`); và fallback `liveSource?.title` (`:208`) mang chuỗi P2-1.
- Task nêu rõ AlleySelect là bề mặt cần kiểm; bề mặt này còn nguyên chữ nguồn/"minh họa". Chữ chế độ Demo/Live đơn thuần (`{mode}`) có thể coi là hợp lệ; "Bìa minh họa" và "Nguồn máy chủ" là clutter.

### P2-3 (source-proven): hai chuỗi Qa nói "mô phỏng"
- `qa.voice_plan_empty` "Chưa có điểm phù hợp trong **dữ liệu mô phỏng**…" (`translator.ts:645`, dùng tại `QaScreen.tsx:828`) và `qa.voice_gps_body` "…**Điểm mô phỏng** chưa xác nhận vị trí thật." (`:650`, dùng tại `QaScreen.tsx:847`; EN tương ứng). Đây là giải thích hành vi (GPS/empty), nhưng vẫn gắn nhãn mô phỏng; nếu người dùng muốn gỡ hết thì cần viết lại, vẫn giữ ý "chỉ đọc vị trí một lần" và "chưa có điểm phù hợp".

### P3
- **P3-a:** khoảng 25 key i18n provenance mồ côi (không còn caller): `common.simulated/reviewed/photo_disclaimer*/simulated_minutes`, `qa.disclaimer_*`, `qa.waveform_*`, `qa.minutes_simulated`, `qa.source_disclaimer`, `qa.answer_evidence*`, `qa.story_evidence_label`, `qa.verified_source_title`, `qa.tag_sourced_only`, `qa.disclaimer_three_lenses`, `camera.disclaimer_*`, `location.select_manual_simulated`, `alley_select.live_subtext`, `qa.photo_note`. Vô hại (không hiển thị); Anti chỉ dọn nhóm Landing/passport nên "dọn key không dùng" chưa hết. Thuộc phạm vi gọn mã, không phải UI.
- **P3-b:** thuộc tính `collectionKind` vẫn được truyền qua `App.tsx:372,396,417`, `HomeScreen.tsx:89-106`, `Location/Plan/Postcard/AlleyTrail/Camera` props nhưng nhiều nơi không còn dùng để hiển thị (lint/tsc không báo). Giữ được vì metadata; chỉ là code thừa.
- **P3-c:** `qa.photo_credit`/`home.photo_credit` = "Ảnh minh họa" đứng trước tên tác giả ảnh (`QaScreen.tsx:567`, `HomeScreen.tsx:493,538`). Tác quyền ảnh được giữ đúng yêu cầu; nhãn "Ảnh minh họa" có thể bị hiểu là nhãn provenance — để Codex/người dùng quyết.
- **P3-d:** bốn nhánh dùng `JSON.stringify(tree)` + `includes` (test Landing) khá thô: Landing mount kèm `NotebookDrawerModal` nên assertion "vắng `mô phỏng`" chỉ đúng vì nguồn test đã làm sạch (liên quan P2-1).

## 5. Bề mặt đã kiểm
| Bề mặt | Kết quả |
| --- | --- |
| Landing | Sạch: dòng trạng thái đúng; meta thẻ chỉ còn số điểm; không wrapper rỗng (`alleyCardMetaRow` còn 1 con, hợp lệ) |
| Notebook | **Còn sót** (P2-1); nút mode/retry/busy còn đủ; `sourceStateTag`/`disclaimerNote` đã gỡ |
| Home | Thời lượng sạch, tác quyền ảnh + `pendingCheck` giữ |
| AlleySelect | **Còn sót** (P2-2) |
| Qa | Waveform badge, `ClickableSources`, `verifiedTag` đã gỡ; còn 2 chuỗi (P2-3); lời kể/đáp án giữ |
| Camera | `disclaimerBadge`/`disclaimerBox` gỡ hẳn (cả style), credit giữ |
| Location | Nhãn chọn tay sạch; giới hạn vận hành ngắn giữ; GPS không đổi |
| Plan | Chú thích rút còn giới hạn vận hành, không còn tọa độ mô phỏng |
| Postcard / AlleyTrail | Badge và nhánh "phút mô phỏng"/"Có nguồn…" gỡ; thời lượng đồng nhất |

## 6. Dữ liệu bảo toàn
Không có thay đổi trong `data/`, fixture localized, `voice`, `backend`, `mobile/assets`, `package*.json`. Metadata (`kind`, `review`, `evidence`, `disclaimer`) và validation `sourceState.ts` không đổi (`git diff src/data` rỗng). Lưu ý: giữ `kind/disclaimer` trong dữ liệu là đúng; chỉ chuỗi hiển thị `title/detail` tạo ra ở `sourceState.ts`/`live.ts` là chỗ sót.

## 7. Chưa kiểm (pending)
Hiển thị native thực, blur iOS/Android, `fontScale` 1.3/2.0, tương phản đo thật, trình đọc màn hình, bố cục thực sau khi gỡ wrapper. Metro bundle không chạy lại vòng này. Digest 451 file chưa tự tính lại.

## 8. Việc cần quyết
- Có coi chữ chế độ "Demo/Live" (hint, tiêu đề nguồn) là hợp lệ không? Đề xuất: giữ chế độ, gỡ "Nguồn…", "mô phỏng", "Bìa minh họa".
- Sửa P2-1/2/3 là thay đổi code chuỗi hiển thị (`sourceState.ts`, `live.ts`, Notebook, AlleySelect, translator) — cần Codex giao; tôi không sửa. Khi sửa, test cần dùng `getSourceState('demo', fixture)` và đầu ra `live.ts` thật để không còn nguồn dựng tay.
