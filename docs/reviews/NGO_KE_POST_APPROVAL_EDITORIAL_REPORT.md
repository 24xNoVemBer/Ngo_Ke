# Ngõ Kể — Post-Approval Editorial Consolidation

Ngày **24/10/2026**, Asia/Saigon. **Verdict: READY_FOR_EXACT_CONTENT_REVIEW.** Bộ chữ có thể duyệt theo node/field; chưa có exact-content approval hoặc quyền triển khai. P3 tiếp tục **PENDING_P3_EXACT_APPROVAL**; P5 là waypoint.

## 1. Quyết định đã ghi nhận

Nguồn approval là yêu cầu trực tiếp của người dùng ngày 24/10/2026. Đã đọc đầy đủ chi tiết phương án trong Decision Pack trước khi ghi:

- D1-A; D2-A/B; D3-A; D4-A/B; D5-A; D6-A; D7-A: **APPROVED trong đúng phạm vi từng phương án**.
- Narrative Style Guide V1: **APPROVED_WITH_CONDITIONS** — cải thiện P3, P5 chỉ waypoint, exact VI/EN chưa duyệt, chưa runtime/audio permission.
- Các claim statuses không đổi. Phần tranh chấp/thiếu nguồn vẫn bị chặn như fact chắc chắn; hướng omission được chọn không giải quyết provenance/chronology.

[Human Decision Record](../content/NGO_KE_HUMAN_DECISION_RECORD_20261024.md) là nguồn bổ sung trạng thái mới nhất. Không sửa tài liệu gốc để xóa lịch sử pending. D3 chốt role năm waypoint nhưng chỉ P5 được giao exact drafting trong lượt này; bốn node C còn lại chưa viết.

## 2. Baseline và ownership

Branch đầu/cuối: `valentino/logic-fix-mobile-20261020`; HEAD `4af64c49a4ada47f952ddf76c35adfb90f826224`. Có 20 tracked modified paths và untracked WIP từ trước. Giữ nguyên Phase 1A/1B/UI Wave 1/remediation, source/tests, data, audio, AGENTS/MEMORY và original A/B/Style Guide/Pilot. Không Git mutation/xóa untracked/dispatch agent; không sửa tài liệu Antigravity/Luna. Có thêm rights ledger của công việc song song trong worktree; không đọc sửa hoặc dùng nó để tự nghiệm thu quyền ảnh.

Ba output mới được kiểm tra chưa tồn tại trước lần ghi:

1. [Human Decision Record 20261024](../content/NGO_KE_HUMAN_DECISION_RECORD_20261024.md).
2. [Narrative V2 Review Pack](../content/NGO_KE_NARRATIVE_V2_REVIEW_PACK.md).
3. [Báo cáo này](NGO_KE_POST_APPROVAL_EDITORIAL_REPORT.md).

Snapshot bảo vệ gồm **1416 paths**: tracked files trừ basename `.env*`, các inputs editorial/AGENTS/MEMORY và ba untracked tests Wave 1, deduplicated; SHA256 sorted path + NUL + raw bytes + NUL: `c3d027f394a6f8b40646baa4282e4d433a22ba45e63bb3f35af54c9188274edd`. Ba output mới không thuộc snapshot; không mở/log keys/secrets/Voice IDs. Kiểm riêng đúng ba tên mới xác nhận đều absent trước ghi; không có conflict mới bị ghi đè.

Skills đã dùng trong chuỗi công việc: heritage-fact-check cho status/trace, content-management cho identity/provenance và voice-tts-quality cho consumer/delta boundaries. Approval hiện tại cho phép editorial consolidation nên không tạo thêm cửa xin duyệt nội bộ. Các đường CMS legacy không tồn tại không được tạo lại; dùng localized datasets thực. Không chạy content generator hoặc TTS.

## 3. Style V1 được áp dụng

Phần kể tập trung vào chi tiết của từng điểm: lời chúc trong tên Phở Sướng, tên người/cây của Sâm, dáng tượng Cầu Đông, common/legal name Trung Yên, lịch lễ Thanh Hà, thờ tự Yên Thái, hai cách dẫn legend Vọng Tiên, art đương đại và oral account Hội Vũ. Không ép mọi story có hook hỏi hoặc kết bằng bài học.

Bibliography được giữ ở trace; trong spoken vẫn có qualifier cần thiết: account tên quán, lời người nhà/lời dân, “được giới thiệu/được mô tả”, nhãn legend. VERIFIED trong đúng phạm vi có thể kể trực tiếp; PARTIALLY_SUPPORTED không được đổi thành lời giám định. Nhàn được rút rất ngắn vì ít facts ổn định, không thêm biography hoặc ý kiến phục vụ để tăng thời lượng.

P1/P2/P4 giữ nguyên exact pilot ưu tiên sau kiểm lại claims. Mọi exact field vẫn DRAFT_NOT_APPROVED, kể cả câu không thay pilot. V2 không tự trở thành text được runtime đọc.

## 4. P3 và P5

**P3:** hai phương án đủ VI/EN nằm đầu Review Pack. A mở bằng cặp tượng cùng dáng thiền/trang phục giản dị, kết bằng hai tên được nhận diện; B lần lượt từ ánh mắt tượng Trần Thủ Độ sang tượng Trần Thị Dung. **Đề xuất A**, ngắn và cân bằng cả hai tượng, ít qualifier lặp hơn B. Dáng tượng/trang phục/ánh mắt đều được đối chiếu lại thân bài S24 ngày 24/10/2026; chúng vẫn là mô tả của nguồn viết, không quan sát/giám định mới. Không niên đại/gốc tích/lý do lập tượng hoặc kết triết lý chung. A được đưa vào V2-05 với PENDING_P3_EXACT_APPROVAL; không tự đóng điều kiện P3.

**P5:** áp dụng D3-A, giữ exact waypoint candidate app-only VI/EN từ pilot. Nó chỉ nhận diện mốc mở đầu trong trải nghiệm Gạch, không xác nhận quán đang hoạt động/số nhà đã khảo sát. Không heritage story giả; không xóa MP3/ẩn player/đổi fallback/commands. Hai label strings cần human duyệt riêng; không tính P5 thành node thứ 13 của A+B.

## 5. Coverage 12 node A+B

| Nhãn | Batch | Node | Disposition |
| --- | --- | --- | --- |
| V2-01 | A | phat-loc-den-tien-ha | P4 ưu tiên; tách quê cư dân khỏi người thờ |
| V2-02 | A | trung-yen-dinh-trung-yen | Common/legal cùng nơi; không alias/chức thiếu nguồn |
| V2-03 | A | ngo-gach-dinh-thanh-ha | Thờ tự/lịch lễ; không 1430/cổ nhất |
| V2-04 | A | cam-chi-den-vong-tien | Legend tự chứa, qualified worship, ngoài ngõ |
| V2-05 | B | ngo-gach-chua-cau-dong | P3-A đề xuất; exact approval còn mở |
| V2-06 | B | trung-yen-pho-suong | P1 ưu tiên; không tuổi/quality promise |
| V2-07 | B | trung-yen-bun-ca-sam-cay-si | P2 ưu tiên; lời người nhà, không migration |
| V2-08 | B | trung-yen-bun-ngan-nhan | Bản rất ngắn; không ranking/queue/service |
| V2-09 | B | tam-thuong-dinh-yen-thai | Thờ Ỷ Lan; không alias/số sắc/năm lập |
| V2-10 | B | tam-thuong-den-vong-tien | Đối thơ trong legend; fact sheet chung V2-04 |
| V2-11 | B | cam-chi-khong-gian-nghe-thuat | Art contemporary theo nguồn 2025; không cổng cổ |
| V2-12 | B | cam-chi-ngo-hoi-vu | C06 qualified, C07 oral/legend; không ownership fact |

Có **24 exact story strings**. Mỗi node có story VI/EN, display replacements hoặc KEEP_UNAPPROVED có lý do, omissions, trace theo câu, risks/status và expected voice impact. P3-B là phương án thay thế, không clip/story thứ 13 cần tạo. P5 thêm hai label strings riêng.

## 6. Surfaces và evidence còn thiếu

Review Pack có **14 cặp full-field replacements cấp ngõ** S-G1…S-C3 (intro/paragraph/guide), chỉ khi có lý do và bằng chứng/giới hạn rõ; mọi string vẫn chờ duyệt. Các display replacements ở node cũng phải duyệt theo field. Không thay KEEP thành approved mặc định.

Mục U trong pack liệt kê: intro/alleyStory relative/current claims và guide.eat/hours/menu/reputation ở Trung Yên; kho thóc/đại từ EN và giờ/vé Tạm Thương; C03/guide art hiện trạng và business conflicts Cấm Chỉ; địa chỉ/bia/guide Phất Lộc; field identity Batch C và routes chưa khảo sát. Không viết full replacements thiếu evidence để giả hoàn tất toàn collection.

Claims còn mở: T06; G07/G08/G12; P03/P05/P06; T08 migration/T12; A03/A04/A05/A10/A11; C03/C04 original/C07 biography và business C09–C12. Source register giữ nguồn/ngày/loại; không bổ sung historical approval. Đã mở lại S24/S10/Cục Di sản phục vụ lựa chọn cần thiết; không tuyên bố reread toàn Internet/source register. Các nguồn Phase 2B/Pilot đã đọc vẫn được dẫn đúng giới hạn, original S14 tiếp tục PENDING_EXTERNAL_VERIFICATION.

Hai Vọng Tiên dùng Ngọc Hồ ở cùng độ chính xác, legend A06 và worship A07 với qualifier, giữ hai IDs. Nhãn legend và vế giới thiệu đền tách nhau; không suy location hiện tại từ lầu trong truyện. Không nhập Chúa Chổm vào story đền.

## 7. Cần human approval gì và điều kiện trước NK-006

- Chọn P3-A hay B và duyệt exact VI/EN; P3 còn là điều kiện chưa đóng.
- Duyệt từng story V2-01…12, từng display field/locale và 14 cặp S; có thể yêu cầu sửa/reject/để pending. Duyệt cả full field, không chỉ một đoạn trong đó.
- Duyệt P5 waypoint VI/EN riêng, giữ role D3 đã chọn; chưa quyết thay đổi playback/track behavior.
- Disposition fields U nếu muốn duyệt cả collection; nếu chỉ duyệt node thì U vẫn pending và phải được xử lý trong rollout/scope review, không tuyên bố collection approved.

Trước NK-006: quyền triển khai rõ ràng từ user, exact approved inventory có version/field/locale; P3 condition resolved theo lựa chọn người dùng; protected-field snapshot/allowlist/source-of-truth và regressions phù hợp; lead review candidate revision/voice delta và rollout để clip nguyên chữ không mất resolve hoặc clip cũ phát chữ mới. D7-A mới phê duyệt quy trình, **NK-006/NK-009/NK-010/ElevenLabs vẫn chưa được cấp**. Không tự tiến hành các bước này.

## 8. Voice/revision preview

24 story candidates khác runtime nếu chọn toàn A+B; P5 thêm hai short strings tùy duyệt. Đây không là số paid jobs. Gạch intro.text có replacement nhưng chưa có intro track, không tạo slot mới. Intro các ngõ khác chưa có exact replacement ở pack; giữ chữ không nghĩa audio mặc định resolve khi revision thay.

Đổi display/guide/evidence vẫn đổi canonical whole JSON. Cả năm ngõ: **34 story + 8 intro = 42 slots** cần review scope/text/revision/rollout ở gate tương lai; số regenerate chỉ xác định sau exact approval và preflight riêng. Không trim/normalize exact spoken string, nới revision guard hoặc repin clip khác chữ. Raw/normalized source hash khác textHash; không tính candidate pins trong lượt này. Không paid call, manifest/catalogue mutation hay human-listened status update.

## 9. Kiểm tra và giới hạn

Kiểm tra cuối là đọc docs/JSON và fingerprint bằng Node in-memory, cùng Git read-only: coverage 12 IDs thuộc 4A+8B, P5 riêng, 24 full stories, 2 P3 options song ngữ, 14 S rows, trace references, pending exact strings, prior pilots, links/tables/whitespace, preserved snapshot/HEAD/branch. Không thêm application tests hoặc chạy full runtime regression trong lượt docs-only. 426/426 mobile là kết quả remediation trước được báo cáo, không fresh PASS.

**18 documentation/inventory checks PASS, 0 FAIL, 0 SKIP**, cộng fingerprint bảo vệ 1416 paths khớp đầu/cuối: **19 checks PASS**. Lượt đầu phát hiện trailing spaces trong metadata docs mới; đã sửa các dòng đó bằng patch rồi chạy lại đầy đủ, không đổi expected hoặc source để qua kiểm tra. Relative links, table columns, explicit whitespace cho untracked docs và `git diff --check` đều đạt. Đây không là app regression tests hoặc fact approval tự động.

Human read-aloud/listening/narrative acceptance vẫn pending; native iOS smoke user đã báo không đồng nghĩa pilot/V2 content/audio approved. Không kiểm hoặc thay evidence image rights của Antigravity.

## 10. Việc cần anh quyết / việc anh tự làm

### Cần người dùng quyết

1. **P3:** đề xuất A vì có nét riêng của cả cặp tượng và ít ngắt nhịp; nếu chưa chọn, V2-05 tiếp tục PENDING_P3_EXACT_APPROVAL.
2. **Exact review:** chọn từng V2 story/display/S field và P5 theo danh mục pack; đề xuất duyệt theo node/locale, để U pending có ghi rõ. Chưa duyệt thì chỉ có bản nháp, không runtime/audio integration.
3. Nếu muốn whole-collection approval, chọn scope xử lý U trước; các D đã duyệt không cần xin chọn lại, chỉ cần disposition exact fields/evidence còn mở.

### Cần người dùng tự làm

- Đọc thử VI/EN hoặc chỉ định người đọc, ưu tiên P3, tên riêng, legend và si tree; đánh dấu exact câu cần sửa. Chưa làm thì đây vẫn là agent text review, không human listening/QC.
- `[ngoài plan]` Nếu muốn phục hồi niên đại bia/gốc tượng/biography đang lược, cung cấp hoặc chỉ định chuyên môn/đơn vị quản lý đối chiếu hồ sơ gốc. Chưa có thì tiếp tục bản lược hoặc qualified, không tự xác nhận lịch sử.
- `[ngoài plan]` Chỉ khi muốn mở route/operation thực địa, thu xác nhận có ngày/consent về lối vào/quyền đi qua/menu/giờ/identity waypoint. Không yêu cầu bước này để anh đọc duyệt safe draft hiện tại.

**Dừng tại Human Exact Content Approval Gate — READY_FOR_EXACT_CONTENT_REVIEW.**
