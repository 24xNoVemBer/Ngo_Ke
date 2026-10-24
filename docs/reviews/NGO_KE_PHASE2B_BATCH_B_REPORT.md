# Ngõ Kể — Phase 2B Extension: Batch B Draft Report

Ngày: **24/10/2026** (Asia/Saigon). Phạm vi: **documentation only**, tám node Batch B; không integration, không Batch C drafting.

**Verdict: `READY_FOR_HUMAN_CONTENT_REVIEW`.** Tám cặp bản kể có thể đọc và chọn theo giới hạn nguồn; chưa có historical/content/audio approval. D1–D7 vẫn **`PENDING_HUMAN_APPROVAL`**. Các phần thiếu evidence được tách ở mục 5; không dùng verdict này để mở NK-006/NK-009/NK-010 hoặc UI Wave 2.

## 1. Baseline và file ownership

- Branch kiểm tra đầu/cuối: `valentino/logic-fix-mobile-20261020`.
- HEAD kiểm tra đầu/cuối: `4af64c49a4ada47f952ddf76c35adfb90f826224`; không đổi so với baseline remediation/Phase 2B. **HEAD giống không có nghĩa source sạch**: có 20 tracked modified paths cùng untracked WIP từ trước.
- Giữ nguyên patch Phase 1A/1B/UI Wave 1/remediation, MEMORY.md và các untracked skills/docs/cache/tests. Không reset/stash/checkout/commit/push/merge/pull, không xóa file.
- Chỉ tạo ba output, cả ba được kiểm tra **chưa tồn tại** lúc baseline và ngay trước lần ghi đầu; không ghi đè công việc người khác.
- Người dùng đang kiểm iOS; Antigravity đang làm Native QA Evidence Review/Wave 2 Readiness. Không sửa UI/design/Antigravity docs, không dispatch agent, không kết luận hộ native acceptance. Trạng thái trong yêu cầu: native iOS đang chạy, acceptance chưa hoàn tất.
- **426/426 mobile, typecheck/lint/diff PASS là kết quả của lượt remediation trước**, không phải fresh runtime regression trong lượt biên tập này.

### Exact files created

| File | Nội dung / ownership phiên này |
| --- | --- |
| [NGO_KE_BATCH_B_VI_EN_DRAFT.md](../content/NGO_KE_BATCH_B_VI_EN_DRAFT.md) | B-v1: 8 node đủ A–G, 16 stories và proposed fields, trace, glossary, approval/voice boundary |
| [NGO_KE_BATCH_B_REVIEW_MATRIX.md](../content/NGO_KE_BATCH_B_REVIEW_MATRIX.md) | 16 hàng VI/EN, cross-surface consistency, Batch C readiness/questions, human gates |
| [NGO_KE_PHASE2B_BATCH_B_REPORT.md](NGO_KE_PHASE2B_BATCH_B_REPORT.md) | Báo cáo baseline, phạm vi, evidence, kiểm tra và handoff |

Không sửa application/tests, 10 localized JSON, registry, source snapshots, evidence arrays, Q&A, assets, GPS/QR, audio/catalogue/pipeline, revision/textHash, AGENTS.md/MEMORY.md hoặc Batch A/Phase 2A.

### Fingerprints bảo toàn

SHA256 tổng hợp theo **sorted unique path + NUL + raw bytes + NUL**; count không phải số file được đọc biên tập. Loại các basename bắt đầu `.env` khỏi nhóm tracked; không mở/log secrets hoặc Voice IDs. Ba new tests Wave 1 được đưa vào snapshot dù đang untracked. Output mới được loại khỏi nhóm content docs. Không đóng băng toàn bộ UI docs đang có công việc song song.

| Nhóm | Count | SHA256 đầu/cuối |
| --- | --- | --- |
| Tracked files, trừ `.env*`, cộng 3 new tests | 1405 | `a19ff9eed0a6452d79f20953802ce1cc47022c47be82601af07064206374d9c2` |
| Tracked `mobile/data/backend/tools`, trừ `.env*`, cộng 3 tests | 648 | `6d2f6524cc46f101ad18d0e6b8721bfffa639a172b3005b499aed7e172fcbce2` |
| Content docs có sẵn, không tính output B | 18 | `a5bd0d577b88a78e6f6f4273e597bca54ff8cd4742846df6839d19c67557a71e` |
| 6 anchors: Phase 2A report, rewrite plan, Phase 2B report, UI remediation report, MEMORY, AGENTS | 6 | `64bc11be1b7de8c92389af43f92fa34cedbaef175c687a9851326e73a00afd00` |

Các hash nhóm trùng baseline, không dùng hash để tự chứng thực lịch sử hoặc listening. Quyền ghi chỉ ba tài liệu trên, không cập nhật MEMORY theo hướng dẫn lịch sử vì yêu cầu lượt này cấm rõ.

## 2. Inputs và current runtime inventory

Đã đối chiếu AGENTS.md, Phase 2A report, claim ledger, editorial review, rewrite plan, Decision Pack, Batch A VI/EN, Phase 2B report, UI remediation report, actual registry và fields liên quan trong 10 localized datasets. Không chạy lại Full Project Audit.

Skills dùng đúng phạm vi: **heritage-fact-check** giữ phân biệt fact/legend/editorial và trace; **content-management** bảo toàn IDs/order/provenance, nhưng không chạy mutation workflow; **voice-tts-quality** chỉ xem text/revision impact, không synthesis. Các đường CMS cũ (`docs/CONTENT_MANAGEMENT.md`, `content/alleys/catalog.json`) trong skill không tồn tại ở workspace này; dùng `data/localized` và registry thực tế, không tạo cấu trúc thay thế. Không cần key, credits hoặc Voice IDs.

### 17 IDs/order và start hiện hành

Mỗi cặp VI/EN cùng thứ tự; **start là ID đầu** trong mỗi hàng. Gạch/Trung Yên là **5/5 node**, không sửa dataset để khớp số 6/4 trong Visual QA cũ.

| Collection | Ordered node IDs |
| --- | --- |
| ngo-gach | ngo-gach-ca-phe-no1 → ngo-gach-ta-ca-phe-4 → ngo-gach-dinh-thanh-ha → ngo-gach-cafe-20 → ngo-gach-chua-cau-dong |
| ngo-trung-yen | trung-yen-pho-suong → trung-yen-dinh-trung-yen → trung-yen-bun-ca-sam-cay-si → trung-yen-bun-ngan-nhan → trung-yen-pho-ga-huong-tra |
| ngo-tam-thuong | tam-thuong-dinh-yen-thai → tam-thuong-den-vong-tien |
| ngo-cam-chi | cam-chi-khong-gian-nghe-thuat → cam-chi-ngo-hoi-vu → cam-chi-den-vong-tien |
| ngo-phat-loc | phat-loc-den-tien-ha → phat-loc-cac-nhanh-ngo |

Cả 10 JSON giữ `kind=simulated`, `qa=[]`; không nâng review/live status. Không đổi Demo/Live hoặc voice commands vì Q&A trống.

### Revisions tính lại từ canonical serializer hiện hành

Đây là **revision baseline**, không phải candidate revision mới. Tính bằng `mobile/src/data/canonicalJson.ts`; array order và exact strings được giữ. Đối chiếu revision registry, không repin.

| Collection | VI | EN |
| --- | --- | --- |
| ngo-gach | `60c242b80557356b8c6f8302f16e937447e0fc48c09b8c84453965631028d19b` | `0f02ac35e6f3eaba103190a7e366d1dae11d6966609d296e175e29185cb79051` |
| ngo-trung-yen | `59e84df99d75369d5cfb53df901c8c3e748d0d528e5f4334acfc07b20029d7c9` | `50ecf581900181a2589571b820d3b43710a7f19daa0d947fe7bab9d9c3100741` |
| ngo-tam-thuong | `41e95b6510f06fbabb9d0a776cb1fec7f204e2f21244ebd57161724e9efb7271` | `0afc9ed695fac834fb53010893d855a7aabfc87ec61bf9ac8a74eddf0c176efd` |
| ngo-cam-chi | `f658ad9a1ab8c52fe4fe4daaaf7d87b59553da9617b424702ba8f64dc619a4a4` | `2f75572bb84552fcd6ba0602e9682170a00b614bc1aa2a1a7ac6aa36fb60c877` |
| ngo-phat-loc | `c2a2b2afc53b52b2a0770ba1d23a80c2dfe08507e5ece19a2c4edff703e33d6a` | `5ac2c7c70a755c416baf4538598cac45e9a56eb102cf101fa7b670c36ab0692f` |

## 3. Eight-node coverage và candidate completeness

Tất cả current assessment **MINOR_REVISION**, không đổi assessment gốc. “Ready for review” không tự chuyển thành APPROVED.

| Node | Story VI/EN | Proposed display fields | Biên tập chính / giới hạn |
| --- | --- | --- | --- |
| ngo-gach-chua-cau-dong | Đủ / đủ | Caption VI/EN, name EN; summary KEEP | Tượng và câu hỏi ký ức; không niên đại chắc chắn/route |
| trung-yen-pho-suong | Đủ / đủ | Summary/caption VI/EN | Tâm ý trong tên; không ranking/tuổi quán hiện tại |
| trung-yen-bun-ca-sam-cay-si | Đủ / đủ | Summary/caption VI/EN | Tên người/cây; migration lược có chủ ý |
| trung-yen-bun-ngan-nhan | Đủ, ngắn / đủ, ngắn | Summary/caption VI/EN | Món ăn/đời sống; không service/queue story |
| tam-thuong-dinh-yen-thai | Đủ / đủ | Node display KEEP | Thờ tự, không alias/count/năm xây/đẩy sang node khác |
| tam-thuong-den-vong-tien | Đủ / đủ | Summary/caption VI/EN | Legend tự chứa, cùng fact sheet Batch A |
| cam-chi-khong-gian-nghe-thuat | Đủ / đủ | Summary/caption VI/EN | Đương đại theo bản tin 2025, không cổng cổ nguyên gốc |
| cam-chi-ngo-hoi-vu | Đủ / đủ | Summary/caption VI/EN | Lớp báo chí/lời truyền miệng tách nhau; không sở hữu như fact |

Có **43 proposed replacement strings = 16 stories + 12 summaries + 14 captions + 1 name EN**. Không tạo field mới, không nhắc lại replacement cho field KEEP. Không ép độ dài đồng đều, không tính thời lượng hoặc giá paid batch từ chữ chưa duyệt. Mỗi node có A Identity, B weaknesses/keep/change, C VI, D EN, E trace, F dependencies/pending, G voice preview; trace gắn cả các câu suy ngẫm với loại editorial, không mạo nhận chúng là lịch sử có nguồn.

## 4. Source quality và điều đã xác minh thêm

Source register có URL/ngày/phạm vi trong [draft mục 1](../content/NGO_KE_BATCH_B_VI_EN_DRAFT.md). Các nguồn sử dụng đã thực sự mở thân bài trong phiên; không lấy search snippet làm bằng chứng.

- S24 và S15: báo chí có ngày, không thay hồ sơ giám định/tiểu sử/sở hữu. Candidate dùng attribution và không tạo tình tiết field survey.
- S06 và B2B-B-S01: cùng bài dẫn Dân Trí, **không hai corroborations độc lập**. Bản Thanh Hóa có mốc 25/03/2021; không tự gán đó là ngày gốc VietNamNet. Chỉ dùng phần cần thiết, không kế thừa review dịch vụ trong cùng bài.
- S07 hỗ trợ lời người nhà cho T08. **Phát hiện đối chiếu:** [S05](https://mega.vietnamplus.vn/triet-ly-am-thuc-ngo-trung-yen-6633.html) thực sự có câu chuyện Hàng Bè; nhận định “không có nguồn viết” sẽ sai. Đây mới là xác nhận bài có viết, chưa là xác minh hành trình quán. Giữ status T08 và proposed omission, không sửa ledger/Decision Pack cũ.
- S08 là nguồn địa phương cho A02; S11 không được tính độc lập. Không mở quyết định gốc về xếp hạng hoặc hồ sơ alias.
- S10 có thân bài cho A06/A07; địa chỉ nội bộ vẫn khác nhau. Không tải/đọc tài liệu Hán Nôm được liên kết, không tuyên bố đã kiểm hồ sơ gốc.
- S14 đọc được mirror ngày 14/01/2025. [Bản gốc được mirror liên kết](https://hanoionline.vn/video/hoan-kiem-co-them-khong-gian-nghe-thuat-cong-cong-295840.htm) không truy cập được: **PENDING_EXTERNAL_VERIFICATION**. URL này khác URL runtime. Không tự sửa nguồn cũ, không chứng thực dự án/hiện trạng bằng mirror.

Không nâng status ledger và không tự duyệt historical claims. Phase 2A vẫn có 62 rows theo phân loại cũ; bản B không phát sinh một ledger cạnh tranh.

## 5. Unresolved claims và proposed omissions

| Nhóm | Còn thiếu / disposition | Có chặn safe draft không? |
| --- | --- | --- |
| G11/G12 | Gốc/giám định/niên đại tượng, access Cầu Đông; niên đại và superlative không dùng | Không chặn bản quy nguồn, không-route; chặn khẳng định vật thể/route mới |
| T07/T12 | Niên hạn/operations hôm nay; bỏ tuổi tính lại/ranking/giờ | Không chặn câu chuyện tên có năm |
| T08/T09 | Migration chưa đối chiếu đầy đủ; tên đùa/đặc sản không thành current menu | Không chặn chuyện người/cây; mở rộng migration NEEDS_MORE_EVIDENCE |
| T10 | Ranking/queue/service nhạy cảm; story sâu cần tư liệu khác | Bản ngắn đủ để duyệt; sâu hơn NEEDS_MORE_EVIDENCE |
| A03/A04 | Alias, năm khởi dựng, số sắc 7/10, quyết định xếp hạng gốc | Không chặn A02; các chi tiết này proposed omission, chưa human chọn |
| A05–A07/A11 | Legend không sử kiện; địa chỉ/cửa/giờ/niên đại đền chưa xác nhận | Không chặn bản legend có nhãn; chặn route/access/biography như fact |
| C04/C05 | Original S14/hiện trạng; motif intro không thành lịch sử | Candidate mirror-attributed đủ xem; không đủ current-state/project authentication |
| C06/C07 | Oral tradition/tiểu sử/sở hữu/từ thiện như lịch sử; quyền tiếp cận tư gia | Bản có nhãn để human chọn; kể như fact NEEDS_MORE_EVIDENCE |
| Top-level/guide | Giờ/giá/menu, nguồn kho thóc gián tiếp, certainty/route | Không chặn review từng node; chưa đủ approval whole collection |

Omission là **đề xuất**, không xóa provenance hoặc phủ định toàn bài nguồn. Không có node bị bỏ trống chỉ để né vấn đề; cả tám đều có safe candidate giới hạn. Phần thiếu evidence không được che bằng câu “human sẽ tự xác minh” trong lời kể.

## 6. D1–D7 và content consistency

| Decision | Trạng thái hiện hành | Liên hệ với lượt này |
| --- | --- | --- |
| D1 | PENDING_HUMAN_APPROVAL | Không đổi tên/chức đình Trung Yên; giải pháp Batch A chưa tự trở thành quyết định |
| D2 | PENDING_HUMAN_APPROVAL | Không thêm các claim tranh chấp của Batch A; không dùng lượt B để duyệt A |
| D3 | PENDING_HUMAN_APPROVAL | Batch C chỉ readiness/waypoint questions, chưa draft |
| D4 | PENDING_HUMAN_APPROVAL | Cầu Đông/Hội Vũ/hai Vọng Tiên là supporting places, không route/access |
| D5 | PENDING_HUMAN_APPROVAL | Ba food stories, omission service/ranking; guide operations vẫn chờ |
| D6 | PENDING_HUMAN_APPROVAL | Gạch giữ cấu trúc đang có, không thêm intro audio/guide/alleyStory |
| D7 | PENDING_HUMAN_APPROVAL | Exact text → quyền integration riêng → delta/rollout → quyền paid riêng, chưa mở ticket |

Kết quả reconciliation chi tiết trong matrix:

1. Hai Vọng Tiên không mâu thuẫn về fact sheet/legend/thờ tự; opening khác nhau và không phụ thuộc collection kia. Sự khác biệt “chùa Ngọc Hồ” ở Batch A so với “Ngọc Hồ” trong S10/B phải được human chốt cách gọi cuối cùng; không sửa Batch A ở đây.
2. Ba food stories tách **mong muốn / ký ức gia đình / món ăn đời thường**, không lặp chuỗi chơi chữ tên quán. Nhàn rút ngắn có lý do nguồn.
3. Yên Thái giữ di tích chính. Intro Tạm Thương dùng nguồn kho gián tiếp với độ chắc rộng; EN có đại từ có thể hiểu nhầm chủ thể chuyển kho/thóc. Guide vẫn có giờ/vé/address cần disposition. Chưa có exact intro replacement, không tự tạo spoken delta mới ở đó.
4. Cấm Chỉ tách legend tên ngõ, nghệ thuật đương đại và oral memory Hội Vũ. Không dùng cổng mới xác nhận lịch sử Chúa Chổm, không biến Hội Vũ thành đoạn GPS trail.

## 7. Batch C readiness — không drafting

Matrix mục 6 có đủ năm IDs, claim/source gaps, D3/D4/D5 và field questions cụ thể. Tóm tắt disposition:

- Ba café Gạch: identity/provenance/access/consent trước; waypoint chờ D3, story sâu cần thêm evidence. Không lấy số trong ID làm địa chỉ đã khảo sát.
- Hương Trà: identity/nguồn đúng cơ sở trước, không suy từ phở gà nói chung; chưa marketing/story sâu.
- Các nhánh Phất Lộc: có nguồn báo đô thị, chưa quyền đi qua/lối thông; nghiên cứu có thể tiếp, chỉ dẫn thực địa chưa đủ điều kiện. Không mở route geometry.

Điều kiện mở drafting: user yêu cầu riêng cho Batch C, disposition role D3 và dependencies liên quan, evidence thực đọc/identity được đối chiếu, attribution/field consent phù hợp. Không đủ điều kiện thì giữ pending, không xóa node hay ẩn player.

## 8. Expected voice impact — preview, không paid batch

- **16 Batch B story strings** khác runtime ở VI/EN. Nếu human chọn đúng B-v1, chúng không được phát bằng clip cũ. Đây là candidates, không 16 synthesis jobs đã duyệt.
- **27 display replacements**, không có intro replacement B. Hai generator ngõ chỉ đọc node story/intro; screen reader hoặc Qa fallback có thể đọc field khác. Không coi display/evidence thay đổi là không ảnh hưởng audio resolver.
- Batch B chạm Gạch/Trung Yên/Tạm Thương/Cấm Chỉ: **30 story + 6 intro = 36 slots** revision perimeter. Phất Lộc chưa có chữ B; A+B chạm cả năm, perimeter **34 story + 8 intro = 42 slots**. Không nhầm với 34 fiction demo clips legacy hoặc số MP3 cần tạo.
- Revision canonical whole JSON khác raw source hash; textHash là exact spoken string. Source EOL policy của node-story khác intro pipeline. Không normalize/trim exact text để reuse, không bỏ revision guard.
- Các string không đổi chỉ là reuse candidates. Scope/contentId/locale/kind/node/text, audio SHA/provenance, voice/model và revision phải được review khi gate riêng mở; không kiểm Voice IDs/budget trong phiên này. Target do user nêu: VI Nhật Phong / EN Talia, ElevenLabs; không gọi provider/generator.
- Không hash candidate text/revision, sửa manifest/progress/catalogue/pins, tạo MP3 hoặc đánh dấu humanApproved/listened. Listening/đọc thử người VI/EN chưa diễn ra trong lượt này.

## 9. Kiểm tra đã thực hiện và giới hạn

Các kiểm tra là read-only Node assertions in-memory qua PowerShell, đối chiếu docs/registry/canonical serializer và SHA256 snapshot; không tạo script/log trong repo. Lệnh Git chỉ đọc gồm `git branch --show-current`, `git rev-parse HEAD`, `git status --porcelain=v1`, `git ls-files -z`, `git diff --check`.

| Kiểm tra | Kết quả / giới hạn |
| --- | --- |
| Documentation/inventory assertions | **37 PASS / 0 FAIL / 0 SKIP** ở lượt kiểm hoàn tất; không phải runtime/content approval tests |
| IDs/order/start, revisions, kind/QA | Đã tính/đọc lại, không sửa; kiểm cùng registry hiện hành |
| Sources | Mở thân bài các nguồn được dùng; original S14 không truy cập được, đã đánh dấu; không paid calls |
| Git diff check + explicit checks cho 3 untracked docs | **PASS**; relative links, Markdown table columns, trailing whitespace và UTF-8 đều đạt; không nhầm `git diff` tự bao phủ untracked |
| Full mobile/backend/typecheck/lint/native/listening | **Không chạy trong scope docs-only**; 426/426 là bằng chứng remediation trước, không fresh PASS của lượt này |

Filesystem sandbox helper ban đầu lỗi setup refresh; các đọc/check filesystem dùng quyền tool được xét duyệt cho scope này, không mở thêm quyền nội dung. Không có runtime test bắt buộc của lượt B bị bỏ qua hoặc che thành PASS. Các gates cần evidence ngoài vẫn ở mục 5/10, không đánh dấu native FAIL/PASS giả.

Lượt self-check đầu dừng sau 28 assertions đạt vì phép dò câu “Không tạo track intro mới” phân biệt chữ hoa/thường không cần thiết. Đã sửa phép dò in-memory thành case-insensitive, không đổi source, expected facts hoặc candidate để che lỗi; rerun toàn bộ đạt 37/37. Kiểm tra bao gồm 10 datasets với canonical revisions/registry, 17 IDs/order/start, 8 sections A–G, 43 field blocks, 16 changed stories, claim references, 16 matrix rows, năm readiness rows không draft Batch C, pending decisions, links/tables/whitespace, bốn nhóm fingerprints và Git. Các check hình thức không chứng minh historical truth hoặc chất lượng nghe; đánh giá đó giữ ở review người/nguồn.

## 10. Conditions for Human Content Review và việc cần anh

### Cần người dùng quyết

1. Duyệt/sửa exact B-v1 VI/EN từng field cùng glossary/KEEP và proposed omissions; ưu tiên quyết D4/D5/D7. **Đề xuất:** supporting places không-route, bỏ service/ranking, duyệt từng field. Chưa chốt thì không tích hợp.
2. Nhàn: giữ bản ngắn hay chờ nghiên cứu sâu? **Đề xuất giữ ngắn**; không có evidence mới thì không bù chữ bằng lịch sử giả.
3. Hội Vũ: giữ câu truyền miệng Cô Tư Hồng hay bỏ khỏi spoken? **Đề xuất giữ với nhãn rõ như B-v1**; nếu muốn như lịch sử, tiếp tục NEEDS_MORE_EVIDENCE.
4. Disposition intro/guide unresolved và wording Ngọc Hồ giữa hai Vọng Tiên trước khi duyệt toàn collection. Đề xuất chưa gắn nhãn whole-collection approved; approval node không bao phủ field khác.
5. Batch C chỉ mở bằng yêu cầu riêng sau role/evidence gates; không tự suy D3 đã được chọn. D1/D2/D6 và Batch A vẫn chờ đúng người dùng, không cần quyết hộ trong phiên B.

### Cần người dùng tự làm

- Đọc thử với người VI/EN, đặc biệt tên riêng/“si tree”/“Muscovy duck”, góp ý exact strings trước approval. Đây là content review, không yêu cầu chạy TTS hoặc trả phí; chưa làm thì phát âm/listening chưa đạt.
- `[ngoài plan]` Nếu muốn giữ claims đang lược hoặc chuyển oral account thành lịch sử, chỉ định người chuyên môn/đơn vị quản lý cung cấp hồ sơ có provenance. Việc này ngoài tech demo plan; chưa có thì tiếp tục lược an toàn/pending, không tự chứng nhận.
- `[ngoài plan]` Nếu muốn triển khai route/access/waypoints, bố trí field check có ngày và phép dùng ảnh/lời kể theo matrix. Không thay bằng native iOS QA; chưa có thì không dẫn người dùng đi vào lối/tư gia chưa rõ.

**Dừng tại Human Content Review Gate — `READY_FOR_HUMAN_CONTENT_REVIEW`. Không mở NK-006/NK-009/NK-010, không tạo audio và không bắt đầu UI Wave 2.**
