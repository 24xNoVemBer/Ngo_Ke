# Storytelling & Alley-level Audio UX Audit

Ngày 24/10/2026. **READ-ONLY AUDIT** trên branch `valentino/logic-fix-mobile-20261020`, HEAD `4af64c49a4ada47f952ddf76c35adfb90f826224`, worktree có nhiều WIP Phase 1A/1B/UI Wave 1/UI-03/PERF-01. Không sửa chúng. Hai output chưa tồn tại lúc kiểm tra. Không cập nhật MEMORY/AGENTS, runtime, tests hay catalogue trong lượt này; không thực hiện PERF-02.

**Kết luận:** Ngõ Gạch không thiếu story audio của điểm dừng; nó có 5 track mỗi locale. Nó thiếu intro MP3 và không có `alleyStory` theo cấu trúc hiện hành/D6-A. Đồng thời có một coupling UI đã tái hiện: 3 collection cũ có intro audio hợp lệ nhưng Home giấu entry vì không có `alleyStory`. Sửa intro Gạch đơn độc không sửa những lời kể người dùng đang nghe.

## 1. Contract thực tế

Ba khái niệm khác nhau:

- `intro.text`: lời mở đầu cấp collection, khớp audio `contentId: intro` nếu catalogue có. Đây không phải `alleyStory.paragraphs`.
- `alleyStory`: optional text reader, được `readAlleyStory()` chấp nhận khi title/paragraphs/evidence hợp lệ; Home mở `AlleyStoryCard` đọc phần này. Audio trong modal vẫn phát **intro**, không đọc toàn bộ paragraphs.
- `nodes[].story`: nội dung từng điểm, Qa resolve `<nodeId>-story` hoặc chapter/segment ở Three Lenses. Đây là những đoạn đang nghe ở Gạch.

Luồng: Landing chọn collection và locale → App cung cấp bundled Demo hoặc source Live → Home hiển thị điểm → mở Qa → người dùng chọn play/command. Landing không phát intro. Home chỉ hiện nội dung ready nếu có ít nhất một node available. Bên trong nhánh đó, `HomeScreen.tsx:418` bọc cả thanh đọc/nghe bằng `alleyStory !== null`, rồi `:432` mới kiểm `introTrack`. Vì thế điều kiện hiện `home-intro-play` là:

`source ready + có node available + readAlleyStory(dataset) hợp lệ + lookup intro(collection, locale, revision) thành công`.

Reader và intro là optional, độc lập ở data contract (`mobile/src/data/alleyGuide.ts:44`); coupling nằm trong JSX, không phải hạn chế MP3. Qa dùng `hasIntro = isThreeLenses || Boolean(introTrack)` ở `QaScreen.tsx:438`, không phụ thuộc `alleyStory`. Vì thế intro của ba collection cũ vẫn nghe được qua nút “Mở đầu” trong Qa.

Resolver `mobile/src/voice/localizedCatalog.ts:19` kiểm collection/locale/contentId/revision. Qa còn kiểm kind/node/textHash trong `useVoiceSession.ts:443`. Home dùng player Expo riêng, coalesce Play đang chuẩn bị và generation/scope guards; blur/unmount/đổi locale/collection/mode/background dừng intro (`HomeScreen.tsx:150–213`). Catch lỗi Home là best-effort im lặng, chưa có visible error fallback; đây là khoảng trống error UX, chưa có bằng chứng thiết bị đang gặp lỗi đó.

Live không được dùng bảng bundled dưới đây như cam kết backend có 8 collection. Source ready/revision thực tế quyết định lookup; lỗi/thiếu source không được fallback Demo. Không nới resolver để có nút nghe.

## 2. Inventory đầy đủ — 8 collection, không phải 8 ngõ thực địa

Đọc registry thật và chạy `lookupVoiceTrack` đúng revision cho từng locale. “Có audio” dưới đây = file MP3 tồn tại và textHash khớp exact intro; không đồng nghĩa nội dung/human listening đã được duyệt. Tên Phố Hàng Bút thuộc trải nghiệm **hư cấu** `fiction-letter`.

| Collection ID / tên VI | Overview / alleyStory VI+EN | Intro text VI/EN | Intro MP3 VI/EN; giây theo catalogue | Nút nghe Home hiện tại VI/EN | Nguyên nhân / xử lý đề xuất |
| --- | --- | --- | --- | --- | --- |
| `ngo-trung-yen` — Ngõ Trung Yên (5 điểm) | Có intro + reader | Có/Có | Có/Có; 40.40 / 48.00 | Có/Có khi đủ ready/reader/revision | Hoạt động theo contract hiện tại; giữ audio, làm rõ đọc overview khác nghe intro |
| `ngo-gach` — Ngõ Gạch (5 điểm) | Có intro, **không reader/guide** | Có/Có | **Không/Không** | Không/Không | MISSING_DATA + INTENTIONAL theo D6-A; không lỗi mapping. Giữ node-led experience; duyệt sửa intro text và story, không tạo MP3 cho đối xứng |
| `ngo-tam-thuong` — Ngõ Tạm Thương (2 điểm) | Có intro + reader | Có/Có | Có/Có; 37.52 / 39.84 | Có/Có khi đủ điều kiện | Giữ; không coi audio đang có là exact historical approval |
| `ngo-cam-chi` — Ngõ Cấm Chỉ (3 điểm) | Có intro + reader | Có/Có | Có/Có; 38.40 / 44.96 | Có/Có khi đủ điều kiện | Giữ; phân biệt legend và thông tin hiện trạng |
| `ngo-phat-loc` — Ngõ Phất Lộc (2 điểm) | Có intro + reader | Có/Có | Có/Có; 37.28 / 41.12 | Có/Có khi đủ điều kiện | Giữ; D2 claims vẫn chưa được giải quyết bởi audio cũ |
| `old-quarter-three-lenses` — Ba lát cắt phố cổ (3 điểm) | Có intro + companion, không alleyStory | Có/Có | Có/Có; 63.033 / 63.28 | **Không/Không** | UI coupling che intro hợp lệ; nghe qua Qa Opening. Đề xuất tách audio entry khỏi reader sau duyệt contract |
| `old-quarter-pilot` — Thử nghiệm Phố Cổ (3 điểm) | Có intro, không alleyStory | Có/Có | Có/Có; 23.76 / 22.08 | **Không/Không** | Cùng coupling; không cần dữ liệu hay MP3 mới để mở entry Home |
| `fiction-letter` — Phố Hàng Bút (6 điểm, hư cấu) | Có intro, không alleyStory | Có/Có | Có/Có; 21.995 / 20.64 | **Không/Không** | Cùng coupling; giữ nhãn fiction, không trình bày như chuyện di sản thật |

Không tìm thấy intro track bị sai text/mất file trong 14 track đang resolve ở inventory này. Registry/revision đúng không chứng minh codec, âm lượng hoặc loa iPhone thực tế đã được kiểm lần này. Không suy số lượng track phải bằng nhau giữa collection.

## 3. Phát hiện và mức độ bằng chứng

| ID | Class / priority | Bằng chứng và root cause | Kết luận |
| --- | --- | --- | --- |
| SE-01 | BUG về coupling entry / UX_INCONSISTENCY, P1 | Home:418/432; 6 ca VI/EN bằng actual datasets + reader + resolver: track có nhưng nút absent | Có thể sửa nhỏ về JSX và tests sau duyệt entry contract. Spec V1.1:316 hiện đặt player cạnh reader; không gọi đây là regression đã được chứng minh từ một yêu cầu Home toàn bộ collection cũ |
| SE-02 | MISSING_DATA + INTENTIONAL, P2 | Gạch không alleyStory/guide, không entry intro trong alleys catalogue; ledger G13, D6-A | Không “sửa” bằng thêm audio/reader hay bỏ hash gate |
| SE-03 | CONTENT_QUALITY, P1 | G08 vẫn có trong intro, summary/story/caption Thanh Hà runtime; D2/D6 chỉ duyệt hướng bỏ, chưa tích hợp | Ưu tiên exact wording và field coverage; không đổi runtime tại audit |
| SE-04 | CONTENT_QUALITY, P1 | 3/5 café kể về giới hạn research/định hướng chưa khảo sát; Cầu Đông mở bằng báo và kết bằng không xác minh đường | Các meta notes đang chiếm chỗ chuyện văn hóa; chuyển sang lời waypoint ngắn và hồ sơ đối chiếu |
| SE-05 | UX_INCONSISTENCY, P2 | Reader là alleyStory nhưng nút audio đọc intro; Home chỉ ghi “Nghe/Listen” | Nhãn cần nói rõ “Nghe mở đầu/Listen to introduction”, không hứa đọc nguyên modal |
| SE-06 | BUG/test coverage, P1 | `homeIntroPlay.test.mjs:225–230` mock `readAlleyStory` từ mọi intro, thậm chí thiếu evidence; test Gạch:405 còn assert reader fallback tồn tại | Test không phản ánh actual Gạch/legacy data. Cần dùng reader thật + 8 collection khi triển khai; không sửa expected bằng fabricated reader |
| SE-07 | UX_INCONSISTENCY/error fallback gap, P2 | Home:167–174 catch im lặng; không visible error state | Chưa tái hiện native lỗi; kế hoạch simulate replace/play/audio-mode failures trước khi cấp scope xử lý. Không tự mở audio lifecycle refactor |

## 4. Ngõ Gạch thực sự đang kể gì?

Source: `data/localized/ngo-gach.vi.json` và `.en.json`. Cả hai `kind: simulated`, `qa: []`, cùng 5 IDs/order/start; không có alleyStory/guide. Intro nói khoảng 128 m và bia dựng 1430. **Intro này chưa được phát thành audio**, không hiện selector Opening trong Qa do không track, và Home không có reader. All node stories nonempty nên nhánh fallback sang intro cũng không dùng trong hành trình node bình thường. Không được giải thích phản hồi nghe của user chỉ bằng intro.

| Node theo thứ tự hiện hành | Nội dung runtime và điểm yếu | Duration VI/EN (catalogue) | Hướng editorial |
| --- | --- | --- | --- |
| `ngo-gach-ca-phe-no1` | Khởi đầu phía đông, chỉ có vị trí, tự thuật “chưa kể thêm”, bảo đi tới 4A; summary/caption khẳng định số nhà/hướng | 9.84 / 14.08 s | D3 waypoint, ưu tiên P5 đã có; bỏ chỉ đường chưa field-check |
| `ngo-gach-ta-ca-phe-4` | 4A, “ba chục bước”, thiếu nguồn riêng, đi tới đình; summary/caption cũng đếm bước | 14.00 / 18.32 s | G04 có nguồn thương mại cho identity, G05 chưa bằng chứng bước; không đánh đồng thiếu chuyện di sản với không có nguồn về quán |
| `ngo-gach-dinh-thanh-ha` | Thờ Trần Lựu, thần tích Vũ Ninh kèm disclaimer, bia 1430/cổ nhất, lịch lễ. Summary/caption vẫn nói bia chắc chắn | 21.92 / 27.20 s | Giữ G06/G09; bỏ G08 chưa đủ evidence và chi tiết G07 chưa đối chiếu; dùng candidate ngắn có trọng tâm |
| `ngo-gach-cafe-20` | Mốc phía tây; toàn đoạn sau giải thích không nguồn/history/menu/hours | 13.92 / 15.36 s | Waypoint ngắn, không bịa lịch sử/hoạt động quán |
| `ngo-gach-chua-cau-dong` | Báo đặt địa chỉ 38B; nhận diện tượng, ước định niên đại; kết không xác nhận gần đầu tây | 23.20 / 27.52 s | Tập trung hai pho tượng, giữ attribution nhận diện; địa điểm liên quan ngoài ngõ, bỏ giả route |

Tổng duration catalogue: **82.88 s VI / 102.48 s EN**. Ba café chiếm **37.76 / 47.76 s**, gần một nửa tổng thời lượng trong khi gần như không thêm câu chuyện văn hóa. Đây là phép cộng metadata, không phải timed listening hay đánh giá phát âm trên iPhone.

### Sáu tiêu chí

1. **Historical integrity: chưa qua hard gate.** G08 không được kể chắc vật thể hiện còn dựng 1430/cổ nhất. Trang [Hoàn Kiếm/S22](https://hoankiem360.tourism.vn/chi_tiet_di_tich_lich_su/dinh-thanh-ha.html) phân biệt bia khắc lại và lịch lễ; [Cục Di sản/B2B-S01](https://dsvh.gov.vn/dinh-thanh-ha-thanh-pho-ha-noi-22263) cũng mô tả bia khắc lại. Không suy ra năm thay thế; ledger vẫn PARTIALLY_SUPPORTED. G01 là geometry tham khảo, G05 đếm bước UNVERIFIED. D2-A/B đã chọn hướng omission, chưa duyệt exact strings.
2. **Hấp dẫn/tự nhiên: yếu ở lời tự thuật research.** No.1/Ta/Cafe20 giải thích tác vụ biên tập; Cầu Đông đọc cấu trúc bài báo. Độ chắc chắn được giữ bằng qualifier, nhưng chủ thể câu thường là dữ liệu/người nghiên cứu thay vì địa điểm/con người.
3. **Mở đầu → khám phá → kết nối: thiếu chủ đề.** Start là một waypoint ít evidence; câu “đi tiếp” tạo cảm giác route đã khảo sát, còn cuối ngõ lại là supporting place ngoài ngõ. Không có intro nghe được làm khung, nhưng giải pháp không nhất thiết là tạo intro MP3. Cần phân biệt điểm trong app với chỉ dẫn đi bộ thật.
4. **Trùng lặp: bia 1430 lặp intro và Thanh Hà story/summary/caption.** Đây là lặp claim yếu, không phải motif có chủ đích. Các café lặp “chưa có nguồn”. Không có overview audio để kết luận đang phát lặp hai clip intro/story Gạch.
5. **Nhịp/độ dài: ngắn nhưng tải thông tin không hợp lý.** Mỗi node 10–28 s không phải quá dài; filler và disclaimer đang chiếm thời gian. EN Thanh Hà nêu ngày cụ thể, VI chỉ tháng; parity chưa đồng mức. Chưa nghe audio nên chưa chấm nhịp nghỉ/phát âm/tốc độ thực.
6. **Giá trị văn hóa: tiềm năng nằm ở Thanh Hà và hai tượng Cầu Đông.** [S24/Pháp Luật Việt Nam, 06/10/2020](https://baophapluat.vn/bi-an-xung-quanh-hai-pho-tuong-trong-ngoi-chua-cau-dong-post365743.html) có mô tả gỗ/dáng thiền/trang phục và nhận diện nhân vật; đây là lời mô tả qua bài viết, không giám định hay quan sát mới của Ngõ Kể. Không thể kéo dài ba café thành heritage stories bằng creativity.

Runtime đang tồn tại không phải approval mới. Record 24/10 xác nhận D1–D7 và style APPROVED_WITH_CONDITIONS; **mọi exact VI/EN V2 vẫn DRAFT_NOT_APPROVED**, P3 còn PENDING_P3_EXACT_APPROVAL. Không nâng claim status, không tự tích hợp.

## 5. So sánh UX A/B/C

| Phương án | UX / nhất quán | Chi phí theo data hiện có | Rủi ro / đánh giá |
| --- | --- | --- | --- |
| A: intro hợp lệ có nút, còn lại node-led | Dễ hiểu nếu nhãn đúng; số nút khác nhau có lý do | Nhỏ: tách player khỏi reader để tận dụng 14 intro đã có | Không cần audio mới; phải giữ guard và xử lý state không track |
| B: mọi collection đều có tổng quan | Đồng dạng bề ngoài | Gạch thiếu MP3/reader; không phải task UI nhỏ | Xung đột D6-A nếu ép tạo nội dung/audio; cần duyệt định hướng và exact text riêng. Không đề xuất cho MVP |
| C: chuẩn hóa cách trình bày/giải thích khả năng | Người dùng hiểu nơi nào có nghe intro, nơi nào chỉ nghe điểm | Nhỏ-vừa: copy VI/EN, entry-state matrix, native review | Tốt nhất cho MVP; không hứa số lượng clip bằng nhau |

**Đề xuất C làm chuẩn trình bày, áp dụng A làm điều kiện audio:** independent read entry nếu có reader; independent listen entry nếu có intro hợp lệ; ngõ không track dùng copy node-led ngắn. Không disabled giả một chức năng, không phát story đầu thay intro, không fallback khác locale/collection. Muốn trưng text intro Gạch lên Home là thay đổi presentation riêng cần duyệt exact field/copy; không tạo alleyStory.

## 6. Kiểm chứng đã chạy và giới hạn

- Read-only inventory thực thi registry bằng TypeScript transpile, actual localized resolver; 16 collection/locale rows, 14 intro tracks tồn tại và hash exact text khớp, Gạch 2 rows không track.
- In-memory reproduction dùng `homeIntroPlay` harness với actual `readAlleyStory` và revision Three Lenses thật: 6/6 legacy rows có track nhưng không Home button. Không ghi test file. Harness chạy **14 PASS / 0 FAIL / 0 SKIP** (13 existing + 1 reproduction test loop 6 cases). PASS này xác nhận hiện trạng che nút, không coi UX đã sửa.
- `node --test mobile/tests/qaNodeStoryVoice.test.mjs mobile/tests/nodeStoryVoiceCatalogue.test.mjs`: **17 PASS / 0 FAIL / 0 SKIP** trong lượt chạy có thêm đường dẫn intro-test gõ sai; Node không chạy file thiếu đó. Đã khắc phục bằng lệnh đúng tiếp theo, không tuyên bố file thiếu đã chạy.
- `node --test mobile/tests/alleysVoiceCatalogue.test.mjs`: **2 PASS / 0 FAIL / 0 SKIP**, kiểm 4 VI+4 EN intro/source/manifest/audio.
- Không chạy full mobile suite/typecheck/lint lại cho audit Markdown; 431/431 thuộc báo cáo PERF-01, không là kết quả audit này. Không gọi TTS/paid API. Không native iPhone playback/listening/field route verification; source web mở lại đúng 3 trang nêu trên, không full project audit.

## 7. Handoff

Ticket/candidate cụ thể ở [Remediation Plan](../plans/NGO_KE_STORYTELLING_REMEDIATION_PLAN.md). **HUMAN CONTENT & IMPLEMENTATION APPROVAL GATE**.

**Cần anh quyết:** chọn C+A cho entry contract; duyệt từng field VI/EN Gạch và có muốn đưa intro text hiện có lên Home sau sửa chữ hay không. Đề xuất C+A và chỉ mở UI entry/copy/test trước; chưa chốt thì worker không tự mở tính năng hoặc tạo audio.

**Cần anh tự làm:** kiểm iPhone VI/EN theo checklist ticket, phân biệt nghe intro và nghe điểm; ghi đúng build/locale/collection. Nghe duyệt exact audio mới chỉ phát sinh sau quyền riêng, không nằm trong lượt audit này. Không thêm nghĩa vụ [ngoài plan] về survey/paid voice vào scope hiện hành; nếu muốn xác nhận route/café hoạt động phải giao khảo sát riêng trước khi dùng làm chỉ dẫn.
