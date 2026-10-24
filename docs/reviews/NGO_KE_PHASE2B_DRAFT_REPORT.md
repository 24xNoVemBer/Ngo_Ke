# Ngõ Kể — Phase 2B Draft Report

Ngày bắt đầu/baseline: 23/10/2026. Scope: Content Decision Pack & Batch A Draft, chỉ ghi ba tài liệu. **Verdict: `READY_FOR_HUMAN_CONTENT_REVIEW`.** Đây là sẵn sàng để người duyệt đọc/chọn, không phải content approval, quyền triển khai NK-006 hoặc nghiệm thu voice/native.

## 1. Kết quả bàn giao

1. [Content Decision Pack](../content/NGO_KE_CONTENT_DECISION_PACK.md): D1–D7, options/recommendation/risk/field/audio impact và câu chọn; tất cả `PENDING_HUMAN_APPROVAL`. Có backlog B 8 node / C 5 node.
2. [Batch A VI/EN Draft A-v1](../content/NGO_KE_BATCH_A_VI_EN_DRAFT.md): bốn node đủ identity, summary/caption/story VI/EN, field liên quan, traceability theo câu/chùm ý, rationale, audio preview, consistency matrix và glossary. Tất cả `DRAFT_NOT_APPROVED`.
3. Báo cáo này: baseline, bằng chứng bảo toàn WIP, kiểm tra thực thi và gate tiếp theo.

Không ghi application source, runtime JSON, tests, audio, catalogue, revision/textHash, image/provenance, design docs, MEMORY.md hoặc AGENTS.md. Không gọi paid API, không đọc env/key, không chạy generator, không dispatch agent khác, không thao tác git mutation.

## 2. Baseline thực tế và WIP

- Branch: `valentino/logic-fix-mobile-20261020`.
- HEAD: `4af64c49a4ada47f952ddf76c35adfb90f826224`, khớp baseline Phase 1A/1B/UI Wave 1; không mặc định worktree sạch chỉ vì HEAD giữ nguyên.
- Trước sửa: **20 tracked files modified**, không có staged change được ghi nhận. MEMORY.md và các thay đổi Phase 1A/1B/UI Wave 1 được giữ nguyên.
- WIP source: AlleyPassportModal, NotebookDrawerModal, translator, AlleySelectScreen, HomeScreen, PlanScreen, QaScreen, theme, alleyGeometry. WIP tests: alleyGuideSection, alleyIntegration, homeIntroPlay, nodeStoryVoiceCatalogue, qaNodeStoryVoice, recommendation, uiFlows; cùng `tools/e2e/phase8-http.test.mjs`, `tools/voice/generate_node_stories.py`, `tools/voice/test_node_story_voice.py`.
- Untracked baseline gồm `.agents/`, audit/content/design/plans/reports từ các phase trước, `mobile/.cache/` và ba tests mới `alleyGeometry.test.mjs`, `planScreenExperience.test.mjs`, `themeTokens.test.mjs`. Không xóa/chỉnh các file này.
- Ba output Phase 2B chưa tồn tại trước khi tạo, không ghi đè nội dung worker khác.
- Trong khi phiên đang chạy, hai file **ngoài tác giả Phase 2B** xuất hiện: `docs/design/NGO_KE_UI_WAVE1_VISUAL_QA.md` và `docs/design/NGO_KE_UI_WAVE1_FIX_BACKLOG.md`. Chỉ ghi nhận tên/timestamp qua inventory; không sửa, không nhận chúng là deliverables của phiên này, không suy ra native QA đã PASS. Worktree cuối có thể nhiều hơn ba untracked additions do phiên song song đó.

### Fingerprints bảo toàn

Thuật toán: sort đường dẫn, SHA256 của từng chuỗi `path + NUL + file bytes + NUL` nối tiếp. Không normalize nội dung. Tập source lấy `git ls-files` dưới mobile/data/backend/tools và thêm đúng ba tests UI Wave 1 untracked nêu trên; không quét node_modules, build/cache hoặc env.

| Tập kiểm | Số file | SHA256 trước = sau |
| --- | --- | --- |
| Tracked application/data/backend/tools/media + 3 tests mới | 649 | `e34f2c65e95793e0debe802869b72f2707409bedaa2ba4bb15a191dbd69c7aef` |
| Docs/agent_docs có sẵn + MEMORY.md + AGENTS.md | 769 | `6feb965c22e765d095af82e5d05e4f9a1436a5716e7f64a49dc22e297bfbb7b6` |

Tập thứ hai loại ba output của phiên và hai design docs mới của phiên khác. Khi chưa loại hai file mới, inventory tăng và hash khác; sau đối chiếu membership, **769 file baseline khớp byte-for-byte**. Đây không phải bỏ qua một file baseline đã đổi. Không dùng fingerprint này để tuyên bố đã review semantic toàn bộ 769 tài liệu hoặc mọi ignored/untracked binary.

## 3. Inputs đã đối chiếu

- Governance/backlog: AGENTS.md, các hợp đồng NK-005/006/009/010 và gate trong execution backlog; MEMORY chỉ đọc, không cập nhật theo ràng buộc mới nhất.
- Technical baseline: Phase 1B report, UI Wave 1 report. **418/418 mobile, typecheck/lint/diff PASS là kết quả được báo cáo trong UI Wave 1**, không gắn thành fresh test run của Phase 2B. Native visual QA của baseline đó vẫn PENDING trong phạm vi báo cáo đã đọc.
- Phase 2A: report, claim ledger, editorial review, rewrite plan; giữ distribution **62 = 6 VERIFIED + 29 PARTIALLY_SUPPORTED + 8 CONFLICTING + 10 UNVERIFIED + 4 LEGEND + 5 EDITORIAL_INTERPRETATION**. Assessment 17 node: 8 minor / 3 major / 4 missing / 2 requires-source / 0 keep. Không sửa các trạng thái này.
- Đọc text surfaces cả 10 localized datasets, registry thực tế `mobile/src/data/collections.ts`, canonical serializer, alleyGuide parser, Home/Qa/Camera consumers và localized voice resolver/generators/catalogues/manifests liên quan. `summary` là display/fallback ở Qa khi thiếu story, caption dùng ở Camera; không gọi mọi field ngoài story là “không bao giờ spoken”.
- Nguồn nội bộ: FOUR_ALLEYS_SOURCE, FOUR_ALLEYS_EN_NARRATION, nghiên cứu Gạch/Trung Yên; không coi prior translation review là historical approval. Data collection guide và ba skill heritage-fact-check, content-management, voice-tts-quality dùng để giữ source/approval/voice gates. Một số đường dẫn CMS cũ trong skill không có tại workspace (`content/alleys/`, `docs/CONTENT_MANAGEMENT.md`); không dựng lại CMS, dùng localized datasets/registry thực có cho docs-only scope.
- Voice references: VOICE_TEST_REPORT, VOICE_HANDOFF và tools/voice/README được đọc để phân biệt integrity/listening/native. Đây chủ yếu là hồ sơ legacy; inventory mới lấy từ catalogue/manifests hiện hành, không lấy 34 clip legacy làm 34 node-story clips.

### Tài liệu Phase 2A có đổi sau báo cáo không?

Bốn input đang untracked nên không có lịch sử commit để chứng minh tính bất biến từ lúc tạo. LastWriteTime ngày 23/10: ledger 21:06:56, editorial 21:10:13, rewrite plan 21:14:34, report 21:19:28. Không phát hiện timestamp input muộn hơn report; nội dung/count/IDs khớp báo cáo. **Timestamp không phải bằng chứng tuyệt đối chưa từng chỉnh sửa.** SHA hiện tại ghi ở đây và so lại cuối phiên, không giả làm fingerprint gốc Phase 2A vốn không có trong report.

| Input | SHA256 tại Phase 2B, giữ nguyên cuối phiên |
| --- | --- |
| NGO_KE_CLAIM_LEDGER.md | `0055a6d08e91731454703deab71f3a2138292b9d65461be5cf778945ca8b25fc` |
| NGO_KE_EDITORIAL_REVIEW.md | `cf66b6c3f53700c5784d1f03b9258ec576a90cdedbd18103bcc593537c2141fe` |
| NGO_KE_CONTENT_REWRITE_PLAN.md | `610cf36a5c3240067a802de62ad3e03df3fc033f8eabfc7f988d639a144adbee` |
| NGO_KE_PHASE2A_REPORT.md | `34ab0e882337a1ecd92270c6975f4f2e8faf6df5364a5342281ac8ef4d162fca` |

### Dataset revisions xác minh lại bằng canonical serializer hiện hành

| Collection | VI | EN |
| --- | --- | --- |
| ngo-gach | `60c242b80557356b8c6f8302f16e937447e0fc48c09b8c84453965631028d19b` | `0f02ac35e6f3eaba103190a7e366d1dae11d6966609d296e175e29185cb79051` |
| ngo-trung-yen | `59e84df99d75369d5cfb53df901c8c3e748d0d528e5f4334acfc07b20029d7c9` | `50ecf581900181a2589571b820d3b43710a7f19daa0d947fe7bab9d9c3100741` |
| ngo-tam-thuong | `41e95b6510f06fbabb9d0a776cb1fec7f204e2f21244ebd57161724e9efb7271` | `0afc9ed695fac834fb53010893d855a7aabfc87ec61bf9ac8a74eddf0c176efd` |
| ngo-cam-chi | `f658ad9a1ab8c52fe4fe4daaaf7d87b59553da9617b424702ba8f64dc619a4a4` | `2f75572bb84552fcd6ba0602e9682170a00b614bc1aa2a1a7ac6aa36fb60c877` |
| ngo-phat-loc | `c2a2b2afc53b52b2a0770ba1d23a80c2dfe08507e5ece19a2c4edff703e33d6a` | `5ac2c7c70a755c416baf4538598cac45e9a56eb102cf101fa7b670c36ab0692f` |

17 IDs và thứ tự đã đọc ở runtime; cặp VI/EN cùng order/start, lần lượt 5 Gạch / 5 Trung Yên / 2 Tạm Thương / 3 Cấm Chỉ / 2 Phất Lộc; qa=[] trong cả 10 file. Thứ tự ID đầy đủ được đối chiếu bằng kiểm tra inline nêu mục 7, không tạo node ID mới. Không đổi dataset kind/collection review status hay Demo/Live contract.

## 4. Batch A completeness và certainty

| Node | Candidate VI/EN | Chọn trục kể | Proposed omissions / unresolved |
| --- | --- | --- | --- |
| phat-loc-den-tien-ha | Đủ story/summary/caption; name KEEP; có phần đọc/guide cần đổi | Thờ tự và chuyện tên làng là hai lớp khác chủ thể | P03/P05/P06: quê “ông” ở Thái Bình, Nguyễn Siêu/1886, chắc 46/48 |
| trung-yen-dinh-trung-yen | Đủ story/summary; caption/name KEEP; đọc/guide đồng bộ | Tên thường dùng vs tên pháp lý, không tiếp tục phủ định xếp hạng | T06: Thanh Cẩm/Ngự sử/danh tính đầy đủ; năm xây/access chưa rõ |
| ngo-gach-dinh-thanh-ha | Đủ story/summary/caption, EN name có dấu; intro.text candidate hoàn chỉnh | Thờ tự và lịch lễ theo nguồn, không superlative | G08/G07: niên đại vật thể/cổ nhất và chi tiết Vũ Ninh; không tạo field/intro audio |
| cam-chi-den-vong-tien | Đủ story/summary/caption; name KEEP; guide có candidate | Tự chứa về thờ tự và legend được ghi nhãn | C08/A05: bỏ lệ thuộc Tạm Thương; chưa chốt address/access, lịch lập/di chuyển đền |

VI/EN cùng người/chủ thể, nhãn nguồn và certainty; legend không mạnh lên ở caption/EN. Editorial reflections được đánh dấu trong trace, không là lời nhân chứng. Không tạo cảnh ngửi/nghe/đã bước vào, không số bước/turn-by-turn, không thêm lịch sử để kéo dài audio. Đây là review editorial của phiên, **chưa là human/native listening approval**.

Source-to-claim register nằm trong Decision Pack; từng cụm câu và phần đọc/guide có mapping trong Batch A. Ngoài nguồn Phase 2A, đã mở thân bài [Cục Di sản văn hóa về Thanh Hà](https://dsvh.gov.vn/dinh-thanh-ha-thanh-pho-ha-noi-22263) và [bài Sở VHTT Hà Nội về lễ năm 2025](https://sovhtt.hanoi.gov.vn/le-dang-huong-ky-niem-ngay-hoa-duc-dai-vuong-tran-luu-tai-dinh-thanh-ha/) dưới IDs **B2B-S01/S02**. Dùng hỗ trợ nhận diện/lịch lễ trong draft, không nâng ledger cũ, không lấy sự kiện cũ làm giờ mở cửa hiện tại. Chi tiết ngày xếp hạng Thanh Hà giữa hai trang chưa thống nhất, không đưa vào candidate.

Claim statuses `SUPPORTED_FOR_DRAFT`, `PENDING_HUMAN_DECISION`, `BLOCKED_CLAIM` trong draft là usage dispositions, không thay phân loại evidence Phase 2A. G08 chưa được giải chỉ vì đã có thêm mô tả bia khắc lại. Việc lược P03/P05/G08 v.v. vẫn PROPOSED, chờ D2. Các claims cần thêm hồ sơ không biến mất khỏi hồ sơ nghiên cứu.

## 5. Field scope và backlog còn lại

Proposed text changes, **không phải đã sửa runtime**:

- Bốn story × VI/EN; bốn summary × VI/EN; caption Tiên Hạ/Thanh Hà/Vọng Tiên × VI/EN; EN name Thanh Hà.
- Gạch intro.text × VI/EN. Không có intro audio/alleyStory/guide Gạch được tạo mới.
- Phất Lộc alleyStory.paragraphs[2], guide.visit[0].notes[1] × VI/EN.
- Trung Yên alleyStory.paragraphs[1], guide.visit[0].notes[0..2] × VI/EN.
- Cấm Chỉ guide.visit[2].address và notes[0] × VI/EN.
- Evidence additions được liệt kê theo field trong matrix; giữ provenance cũ. Việc này cũng cần allowlist/approval trước tích hợp.

Intro Trung Yên/Phất Lộc/Cấm Chỉ và các field KEEP khác không được coi là đã duyệt. Guide.eat/route, surface top-level và các claim ngoài A còn backlog; không tuyên bố cả collection sạch. Backlog **13/13 node** có status/source gap/approach/D dependencies/priority/readiness ở mục 10 Decision Pack. Batch B ưu tiên certainty/attribution/self-containment; Batch C cần D3/identity/field cho waypoint, không xóa node hoặc tự thêm schema.

## 6. Voice impact và ranh giới tích hợp

- Có **8 candidate story strings thay đổi**, chưa có approved delta hay lệnh regenerate. Intro Gạch cũng đổi chữ nhưng **không có track hiện hành**; không biến nó thành yêu cầu audio mới.
- 34 node-story entries và hai intro manifests 4+4 entries; tất cả đọc được `humanApproved: false`, `listened: false`. Không nghe và không nâng status. Không nhầm inventory này với 34 fiction tracks legacy.
- Bốn collection Batch A đổi revision nếu các field được tích hợp: **36 slots cần kiểm resolver** (30 story + 6 intro). Toàn năm ngõ 42 slots là regression perimeter; không phải 42 hoặc 36 MP3 cần tạo. Tạm Thương chỉ vào changed revision khi có patch dataset thật của nó.
- Canonical revision là whole dataset; exact textHash là string story/intro; raw/normalized source hashes là provenance khác nhau. Node-story generator đã có LF normalization + raw hash; intro generator vẫn raw source hash, không tự áp policy NK-001 sang mọi pipeline.
- Clip nguyên text có thể reuse bytes sau tuple/voice/model/hash/provenance/revision review theo NK-009. Changed text không được dùng audio cũ bằng repin. Không nới resolver, không sửa text để khớp audio cũ, không thay hook/player.
- Target ElevenLabs, Nhật Phong/Talia là bối cảnh được giao, không quyền gọi API. Không kiểm Voice IDs/keys/credits, không ước tính tiền/credit khi chưa có rate/model được duyệt. NK-010 phải có paid batch approval riêng.

## 7. Kiểm tra đã chạy / không chạy

| Kiểm tra | Lệnh/phương pháp thực tế | Kết quả |
| --- | --- | --- |
| Baseline | `git branch --show-current`, `git rev-parse HEAD`, `git status --short`/`--porcelain=v1 -uall`, `git diff --numstat` | Đã ghi nhận WIP, không mutation |
| Inventory ban đầu | Inline Node qua PowerShell here-string → `node --input-type=module`, import canonicalDatasetJson | **25 assertions PASS, 0 FAIL**: 10 revisions, 10 empty-QA checks, 5 locale-ID-order pair checks |
| Source/docs preservation | Inline Node SHA256 + `git ls-files -z`, `rg --files docs agent_docs` | 649 protected + 769 baseline docs khớp; hai design docs mới được phân biệt membership |
| Final docs/data checks | Inline `node --input-type=module`, `node:test`/strict assertions, không tạo script/test file | **26 PASS, 0 FAIL, 0 SKIP**, exit 0; đây là 26 kiểm tra docs/inventory, không phải mobile suite |
| Whitespace | `git diff --check`; kiểm trailing whitespace riêng cho 3 file untracked | PASS; không dùng diff-check một mình để bỏ qua docs untracked |
| Full mobile/backend/typecheck/lint | **Không chạy lại** | Docs-only; không thay executable/runtime/tests. Không tái sử dụng 418 làm kết quả mới. Các lệnh này cần chạy khi có integration thật |
| Native visual/audio/listening | **Không thực hiện** | Không thiết bị/audio approval trong Phase 2B; pending, không FAIL giả và không PASS từ host |
| Generator/gateway/paid service | **Không chạy/gọi** | Ngoài quyền; không test bằng cách chi credits hoặc upload audio |

Các đọc filesystem read-only ban đầu gặp lỗi Windows sandbox setup, nên được thực hiện qua quyền chạy công cụ đã được xét duyệt; không truy cập secrets hay mở rộng quyền ghi. Không có bài kiểm tra runtime bắt buộc của Phase 2B bị che thành PASS. Link research bổ sung về hành trình Vọng Tiên trên Sở VHTT trả 502; không dùng nội dung search snippet làm evidence cho candidate. Các nguồn được dùng thực sự được mở thân bài; không coi mọi link Batch B/C đã được xác minh lại.

Final verification: **26/26 PASS, 0 FAIL, 0 SKIP**. Bao gồm exact IDs/order/start của 17 node trong cả 10 datasets, revisions/QA/kind; bảy pending decisions đủ các chiều review; bốn cặp story khác baseline và đủ trace sections; blocked claims không nằm trong candidate stories; Vọng Tiên tự chứa; backlog đủ 13 IDs còn lại; local links/tables/whitespace; fingerprints, bốn Phase 2A SHA, HEAD/branch, 42 manifest entries và 20 tracked WIP paths. Đây không phải fact approval tự động hay audio decode/listening test.

Lần đầu checker inline đạt 14, fail 12: PowerShell pipe làm hỏng các literal Unicode của checker, và parser ban đầu tách nhầm heading `###` như `##`. Đã sửa **harness trong bộ nhớ** bằng Unicode escapes/heading parser đúng, chạy lại đủ 26 checks đạt; không sửa ứng dụng hoặc dữ liệu/kỳ vọng nội dung để che fail. Không có test/script mới được ghi vào repository.

## 8. Điều kiện để mở NK-006 — hiện chưa mở

1. Người dùng disposition D1–D7 theo scope cần tích hợp, chấp thuận các lược bỏ/caveat hoặc cung cấp bằng chứng mới; claim bị chặn không được len vào field khác.
2. Human approval exact final strings VI/EN theo field/node, gồm summary/caption/intro/phần đọc và glossary có liên quan, không chỉ “hướng viết ổn”. Đoạn giữ nguyên trong một field ghép cũng cần được review nếu cả field được duyệt để tích hợp.
3. Yêu cầu triển khai NK-006 rõ ràng, allowlist cuối cùng, người giữ nguồn chuẩn và test source snapshot. Nếu test pin bản biên soạn cũ, không sửa expected hoặc sửa source snapshot ngoài allowlist để làm xanh.
4. Snapshot IDs/order/start/Q&A/coords/geometry/media/kind/ba collection cũ; candidate patch không vượt field approvals.
5. Lead review old/new canonical revisions và NK-009 delta trên chính candidate; scope repin/manifest khác cần quyền riêng. Không để unchanged audio mất resolve ngoài delta/rollout được duyệt.
6. Chọn rõ behavior khi changed text chưa có audio: chờ batch được duyệt hoặc text-only tạm thời được phê duyệt, không phát clip cũ/fallback collection khác. Paid NK-010 tách riêng dù NK-006 hoàn thành.
7. Kế hoạch regression host + native/listening phù hợp candidate; QA pending vẫn được ghi riêng, không tự nâng live/content/audio approval.

## 9. Việc cần anh quyết / việc anh tự làm

### Cần người dùng quyết

- Chọn D1–D7 theo các câu trong Decision Pack; đề xuất A và các giới hạn A/B nêu ở D2/D4. Chưa chốt thì các scope đó không được tích hợp.
- Duyệt/sửa bốn cặp A-v1 và các field liên quan, đề xuất duyệt từng node/field, chấp thuận lược claims tranh chấp. Chưa duyệt thì mọi chữ vẫn DRAFT_NOT_APPROVED.
- Sau duyệt chữ, quyết định có mở NK-006 với allowlist/delta/rollout cụ thể không. **Không có yêu cầu tự chạy bước này trong Phase 2B.**

### Cần người dùng tự làm

- `[ngoài plan]` Bố trí chuyên gia/hồ sơ gốc hoặc xác nhận đơn vị quản lý cho bia Tiên Hạ/Thanh Hà, aliases/chức danh Trung Yên. Ngoài tech demo plan; chưa có thì chỉ dùng candidate đã lược được duyệt, các claims gốc tiếp tục chờ.
- `[ngoài plan]` Bố trí khảo sát địa chỉ/cửa vào/public access/waypoint có phép nếu muốn dùng cho đi bộ thực địa. Ngoài baseline dữ liệu mô phỏng; chưa làm thì giữ giới hạn schematic/supporting place, không hứa route.
- Người đọc VI/EN duyệt sự tự nhiên và tên riêng; nghe QC các clip chỉ sau batch được cấp quyền riêng. Host tests, ASR hay manifest integrity không làm thay bước người nghe.

**Phase 2B dừng tại Human Content Review Gate. Verdict `READY_FOR_HUMAN_CONTENT_REVIEW`; không tự mở NK-006/NK-009/NK-010 hoặc bất kỳ UI/content/audio implementation nào.**
