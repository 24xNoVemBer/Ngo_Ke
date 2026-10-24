# Ngõ Kể — Phase 0.5: Targeted Audit & Execution Backlog

Ngày lập: 23/10/2026, Asia/Saigon. Trạng thái: **READY_FOR_PHASE1_APPROVAL** — kế hoạch có thể review; **chưa được phép chạy Phase 1**.

## 1. Baseline và phạm vi quyết định

- Workspace: D:/ngo_ke.
- Branch kiểm lại thực tế: **valentino/logic-fix-mobile-20261020**.
- HEAD kiểm lại: **4af64c49a4ada47f952ddf76c35adfb90f826224**. Trùng Phase 0 sau khi chạy lệnh, không suy từ báo cáo cũ.
- git status trước Phase 0.5: chỉ có untracked **.agents/**, **docs/audits/**, **mobile/.cache/**; tracked files sạch.
- git diff --quiet HEAD -- mobile backend data tools: exit 0 tại thời điểm chốt evidence.
- Báo cáo gốc: [Phase 0](../audits/NGO_KE_FULL_PROJECT_AUDIT_20261023.md), SHA256 byte checkout **3745915b83873ce59d94ed711d3c74ab26949bcf0cd5f0416aaedd3b7a041c29**. Giữ nguyên báo cáo đó.
- Đã đọc AGENTS.md, phần mới nhất MEMORY.md, phần thân báo cáo Phase 0 và đối chiếu code hiện có. Không đọc lại inventory binary/historical screenshots không liên quan.

Tài liệu này vừa là báo cáo bổ sung Phase 0.5, vừa là backlog. Đây là file duy nhất thêm trong lượt này. Không sửa code/data/audio/config, không xóa untracked, không đổi branch/push, không gọi provider trả phí hoặc đọc secret. Có chạy host tests và probe API trên SQLite **:memory:** mới; không mở DB thật hoặc tạo SQLite file.

“Phase 1/2/3” trong tài liệu này là **các đợt khắc phục sau audit**, không phải Phase 1 Expo scaffold hay Phase 8 lịch sử của AGENTS. Trạng thái thực thi của toàn bộ ticket dưới đây là **NOT_STARTED**; kết quả audit không tự đóng ticket sửa lỗi.

Model Luna/Sol là **đề xuất cho ticket**, không phải dispatch hay quyền đổi ownership/model đã ghi trong AGENTS. W1/W2/W3/W4 và owner FE Antigravity vẫn giữ quy tắc hiện có cho tới khi coordinator/người dùng chốt cách triển khai đợt mới; không tự thay Antigravity/Muse bằng model khác.

## 2. Targeted audit đã bổ sung

Skill mobile-ux-qa được dùng để tách source/host evidence khỏi device evidence, xác nhận manual fallback và giữ Demo/Live isolation. Không mở rộng thiết kế UX hoặc khởi động native harness sinh artifacts.

| Module | Phần đã kiểm thêm | Kết luận current HEAD |
| --- | --- | --- |
| mobile/App.tsx:1–442; src/navigation.ts:1–36 | Đọc toàn bộ entry/state/stack/wiring | Mode/collection reset; locale giữ node logic; Live có abort + stale guards. Không xác nhận vị trí chỉ vì mở story |
| screens/HomeScreen.tsx:1–1075 | Đọc toàn bộ logic, render, styles | Non-ready trả Unavailable trước render story/drawer. Intro async có race sau blur; handlers nuốt player errors |
| screens/QaScreen.tsx | Đối chiếu logic với Phase 0, đọc render/controls và toàn bộ styles:1112–1530 | nodeQa lọc theo node, emptyNotice chủ ý render, player phụ thuộc scoped track; chapter filter fallback cần ca tái hiện riêng |
| components/NotebookDrawerModal.tsx:1–391 | Đọc toàn bộ render/style + probe thực chạy | Live empty/error vẫn lấy guide bundle khi có collectionId; xác nhận 4 ca VI/EN |
| components/VoicePlayerBar.tsx:1–73; ToolDock.tsx:1–185 | Đọc controls/styles | Touch targets là khai báo code; chưa đo layout/native. Dock ở Home normal flex sibling |
| data/collections.ts:1–242 | Đọc toàn bộ registry/revision/locale selection | 8 collection; unknown ID fallback fiction là helper behavior, không dùng làm Live fallback |
| data/sourceState.ts:251–310,463–708; live.ts:234–528 | Đọc validator V2/pair và toàn bộ active loader V2, đối chiếu helper đã kiểm ở Phase 0 | Nullable coords hợp lệ; pair structural không chứng minh semantic parity; loader giới hạn deadline/body/digest |
| voice/useVoiceSession.ts:1–570 | Đọc toàn bộ hook | Recorder/turn/scope/locale guards, cancel/recovery, textHash/kind/node checks khác Home intro |
| voice/playback.ts, appState.ts, recorderPreparation.ts | Đọc toàn bộ helper | Pause timeout, seek guard, permission/app-state và recorder cancellation có cơ chế bảo vệ |
| voice/localizedCatalog.ts:1–51 và các catalogue được import | Đọc resolver; kiểm tuple/hash qua query và suite | Priority/exact revision guard hoạt động; kiểm đủ thêm 28 hash Three Lenses |
| assets/photoMap.ts:1–278 | Đọc toàn bộ mapping/fallback/legacy metadata | 9/17 node mới rơi HERO; không có bằng chứng hình đó là ảnh đúng node |
| backend/src/app.mjs:1–109; migration 002; database shared parser | Đọc lại API/schema, kiểm các nhánh import/read bằng fresh memory DB | GET-only, một publication pair; simulated default hidden; corrupt pair fail-closed |
| tools/voice/gateway/server.mjs:1–302; stt_worker.py:1–118 | Đọc toàn bộ | Private service không auth; giới hạn size/duration/quota; cancel ở Node không hủy việc ASR trong worker Python |
| Tests liên quan | Đọc assertions cụ thể Home lifecycle, QA empty, provenance, raw hash; đối chiếu backend localized test structure | Mock không đo Yoga/native; có assertion giữ emptyNotice cũ cần đổi cùng yêu cầu UX |

Không tuyên bố đọc 100% mọi source/test của repository: không cần quét lại dependency, lịch sử evidence, script voice cũ không liên quan. Translator và các screen ngoài phạm vi chỉ được đọc tại nhánh/call site liên quan; PRD/TechDesign toàn văn không được audit lại ở Phase 0.5. Các giới hạn nghe/thiết bị/giấy phép là công việc có ticket và cửa nghiệm thu riêng, không chặn việc hoàn thành **targeted planning**.

### 2.1 Các khoảng trống Phase 0 đã đóng

1. App/navigation và Home styles/lifecycle đã được đọc trọn.
2. Sổ tay Live fallback được tái hiện bằng component code thật trong mock VM, thay vì chỉ suy từ conditional.
3. Đã kiểm 28 entry Three Lenses Nhật Phong trước đây thiếu path: nối id → catalogue.vi.tracks[id].source, kiểm audio SHA256 và textHash, **28/28 đạt**.
4. API/adapter được kiểm trên fresh SQLite :memory: qua loopback, **8/8 scenarios đạt**; không còn chỉ dựa vào backend README.
5. Phát hiện và tái hiện Home async play-after-blur; bổ sung ticket NK-003.
6. Xác định test cần cập nhật khi thay UX no-QA: qaNodeStoryVoice.test.mjs:531–551 đang yêu cầu thông báo xuất hiện.

### 2.2 Các điều được sửa cách hiểu so với Phase 0

- HomeScreen có getBundledDataset ở :106–110 nhưng **return Unavailable ở :284–300** ngăn hiển thị nhánh đó khi nguồn không ready. Không coi Home đang leak guide giống Notebook.
- Missing 28 audio hash checks là **khoảng trống audit đã đóng**, không phải 28 file audio bị thiếu.
- 184 MP3 không được active catalogue reference là archive inventory, không đủ căn cứ xóa.
- Single-pair backend, exact revision guard, sample Passport là giới hạn/thiết kế hiện hành, không tự tạo ticket xây multi-collection server, nới hash, hay thêm persistence.
- Không coi câu hỏi “chốt giọng nào” là việc chưa quyết: target đã biết VI Nhật Phong / EN Talia. Điều còn cần duyệt là phạm vi batch thay 16 pilot clips và chi phí khi thực sự mở TTS.
- Vẫn thiếu native/listening evidence; không chuyển label thành “đã hoạt động trên điện thoại” từ host pass.

## 3. Verification log của Phase 0.5

Môi trường Node v24.18.0; Windows/PowerShell. Sandbox lỗi setup refresh; lệnh đọc/chạy host được cho phép qua quyền thực thi bổ sung. Không có auto-review rejection.

| Kiểm tra thực chạy | Kết quả | Ý nghĩa và giới hạn |
| --- | --- | --- |
| Branch/HEAD/status; source tracked diff | HEAD ở trên; diff exit 0 | Không giả định source của báo cáo cũ còn nguyên |
| Mobile suite: node --test --test-reporter=tap mobile/tests/*.test.mjs | **390 tests: 389 pass, 1 fail, 0 skip; exit 1** | Failure raw sourceDataSha256 tại nodeStoryVoiceCatalogue.test.mjs:61 |
| Backend config + pure harness guards | **35/35 pass; exit 0** | 2 config + 33 guards; không phải full backend suite |
| In-memory component probes | **7 scenario assertions pass** | 4 Live guide leak reproductions + 2 controls + 1 Home blur race |
| Fresh SQLite :memory: API + mobile adapter | **8/8 scenarios pass** | Health, empty, hidden simulated, VI, EN, bad query, POST, corrupt pair |
| Three Lenses Nhật Phong pathless manifest → active paths | **28/28 audio hashes + textHashes match** | Đóng gap Phase 0; không decode/nghe |
| TypeScript noEmit, incremental=false | **exit 0** | Không build |
| ESLint src App.tsx tests --no-cache | **exit 0** | Chỉ lint targeted, không claim lint lại mọi file cấu hình |

Mobile failure thực tế:

~~~text
mobile/tests/nodeStoryVoiceCatalogue.test.mjs:61
manifest sourceDataSha256:
cdba1e1090c5b21be52a3f4c44d882f9840d03d391db28c316d3f79ad3700718
raw checkout source SHA256:
2131350a1df03f9178db7717982555c9038bcf19fd10c4f5758ac1eb4b162dff
git ls-files --eol: i/lf w/crlf
git config core.autocrlf: true
~~~

Phase 0 đã chứng minh 34 raw source hash mismatch và 34 LF-normalized match; fresh suite lặp lại đúng failure đó. Điều cần sửa là contract hashing/checkouts, **không phải tự bỏ hash check hoặc tạo lại MP3**.

### 3.1 Probe tái hiện: Notebook

Dùng phần helper createTestMount trước các test trong homeIntroPlay.test.mjs, nạp qua data URL trong bộ nhớ; rewrite import paths theo URL file gốc. Override **chỉ các native dependencies**, dùng readAlleyGuide thật và bundled dataset thật. Không sửa helper/file trên đĩa.

- Props: mode=live; collectionId=ngo-trung-yen; source.status lần lượt empty/error; locale lần lượt vi/en; visible=true.
- Actual: cả 4 ca tree đều có một AlleyGuideSection với eat items từ bundle.
- Control: Demo ready có guide → có section; Live ready dataset không guide → không section.
- Các bước native đề nghị: Demo Trung Yên → Sổ tay → Live không URL hoặc lỗi server → quan sát guide cũ còn hiện.
- Root cause: NotebookDrawerModal.tsx:49–53 dùng bundle khi source không ready, không kiểm mode; :203 render guide độc lập với nguồn.

### 3.2 Probe tái hiện: Home pending play

Dùng HomeScreen thật qua helper trên; source Demo Trung Yên thật; player mock; setAudioModeAsync trả deferred promise.

~~~text
render Home → press home-intro-play
→ audioMode promise pending
→ invoke registered navigation blur callback
→ resolve promise
Actual events: pause, pause, replace, PLAY_AFTER_BLUR
~~~

Root cause HomeScreen.tsx:131–150: sau await :142 không kiểm request generation, focus, collection/locale hoặc unmount. Blur :164–171 chỉ pause hiện tại; callback còn chờ tiếp tục phát. Đây là **confirmed host race**, còn tiếng thật sau Back/QR/GPS cần native verification. useVoiceSession.ts:449–479 có guard tương ứng; không được suy Home đã có bảo vệ đó.

### 3.3 In-memory API scenarios

Dùng openDatabase(':memory:') → migrate → createApp.listen(0,127.0.0.1) → fetch/loadLiveSourceV2, đóng server và db trong finally. Import cặp simulated Trung Yên vào DB mới trong RAM.

8 scenario: health 200; no publication 404; simulated hidden khi opt-in false; VI 200 + Content-Language + adapter ready; EN tương tự; query thừa collectionId → 400; POST → 405; sửa SHA trong RAM làm cả pair invalid → EN request 503 DATASET_INVALID. Không có xác nhận publication/availability của DB thật.

Không chạy gateway model, smoke STT, build, Metro, native harness, CLI import thật, tests tạo filesystem fixture hoặc paid API. ffprobe/listening gap từ Phase 0 còn mở và chuyển NK-012; không cài công cụ trong lượt này.

## 4. Issue disposition — đối chiếu toàn bộ risk/UX register Phase 0

Quy ước:

- **Confirmed**: có code/metadata hoặc host reproduction trên snapshot này. Không tự có nghĩa lỗi nghe/native được chứng minh.
- **Needs reproduction**: giả thuyết hoặc tác động chưa chứng minh; ticket trước hết thu evidence, chưa mặc định sửa production.
- **Requires human verification**: cần content/rights/field/listening/device sign-off.
- **Obsolete**: không còn là vấn đề hiện hành hoặc gap đã được đóng; không xóa lịch sử.

Priority P0 = chặn baseline kỹ thuật để bàn giao đợt sửa; P1 = cần trước nghiệm thu nội dung/luồng quan trọng; P2 = cải thiện có điều kiện hoặc sau baseline. P0 ở đây không tuyên bố đã có lỗ hổng public nghiêm trọng.

### 4.1 Toàn bộ R01–R20

| Phase 0 ID | Disposition | File:line, nguyên nhân / phạm vi xác nhận | Priority | Phương án / regression / ticket |
| --- | --- | --- | --- | --- |
| R01 Phất Lộc | Requires human verification | data/localized/ngo-phat-loc.vi.json:113 và cặp EN, node phat-loc-den-tien-ha; câu quê quán/1886 có trong source, kết luận lịch sử cần review | P1 | Claim ledger → đồng bộ spoken/story/guide; source/semantic tests; NK-005/006 |
| R02 Live isolation | Confirmed | NotebookDrawerModal.tsx:49–53,203; 4 probe leak | P0 | Mode-aware dataset; Live empty/error/loading tests VI/EN; NK-002 |
| R03 ảnh/quyền | Requires human verification | photoMap.ts:75–138, covers collections.ts:88–137; credit không phải consent/license | P1 | Rights ledger, owner approval; mapping tests sau xác minh; NK-007/008 |
| R04 voice target | Confirmed | remaining-elevenlabs/manifest.json tracks pilot/vi; 16 clip dùng ID 0ggMuQ1r9f9jqBu50nJn | P1 | Không chọn lại target; batch delta sau approved text; tuple/resolver tests; NK-009/010 |
| R05 raw hash | Confirmed | nodeStoryVoiceCatalogue.test.mjs:61; i/lf w/crlf, fresh suite fail | P0 | Hash policy + LF/CRLF tests; không đổi audio; NK-001 |
| R06 Trung Yên | Confirmed | ngo-trung-yen.vi.json:8,89,174,221 so với node đình story:87; certainty không thống nhất | P1 | Kiểm đúng định danh rồi cùng facts VI/EN; source tests; NK-005/006 |
| R07 report drift | Confirmed | reviews/2026-10-23-antigravity-qa-node-stories.md:37–42 vs 17 current node IDs | P2 | Handoff matrix current IDs/revision, không coi mocked pass là device; NK-014 |
| R08 story nghèo nội dung | Requires human verification | Các story café/Hương Trà/Hội Vũ trong 5 cặp dataset mới; chủ yếu meta research | P1 | Editorial rubric và quyết định waypoint/story; NK-005/006 |
| R09 ảnh generic | Confirmed | photoMap.ts:44–140,244–255; 9 node mới không map; café reuse | P2 | Per-node approved assets; old fiction unaffected; NK-008 |
| R10 GPS/field | Requires human verification | location/nearest.ts:55–75; datasets 10/17 tọa độ null, số liệu xác nhận nhưng vị trí thật chưa kiểm | P2 | Giữ manual; field evidence trước coords; NK-016 |
| R11 single publication | Confirmed, design limitation | backend/migrations/002_publication_v2.sql:2; app.mjs:45–48 | P2 | Document/test current contract; không thêm multi-collection; NK-013/014 |
| R12 shared TS coupling | Confirmed, debt | backend/src/database.mjs:5–6 import mobile validation/canonicalizer | P2 | Dependency map/guard; tách package chỉ khi có scope riêng; NK-015 |
| R13 archive MP3 | Confirmed inventory, không phải defect | Catalogue static requires 198 so với physical 382 của Phase 0; không có asset changes | P2 | Active/archive ledger; không xóa; NK-015 |
| R14 native gap | Requires human verification | QA current HEAD không có device/listening trace mới | P1 | Matrix current SHA Android/iPhone; NK-012 |
| R15 empty state | Confirmed | QaScreen.tsx:186,908–913; qa=[] ở 17 node | P2 | Ẩn notice intentional no-QA; giữ error/unknown; NK-004 |
| R16 private HTTP | Confirmed, accepted local limitation | gateway/server.mjs:22,260–282; no auth/TLS | P2 | Private-LAN guard/runbook; không tự public-host hoặc auth project; NK-018 |
| R17 exact revision coupling | Confirmed, integrity behavior | localizedCatalog.ts:42; useVoiceSession.ts:459–462 | P1 | Repin unchanged text có kiểm hash, không nới lookup; NK-009 |
| R18 duplicate registries | Confirmed, debt | collections.ts:88–169 vs photoMap.ts:142–236 | P2 | Document one source of truth/consumer map; NK-015 |
| R19 Passport | Confirmed, intentional sample | AlleyPassportModal.tsx:73–94, label badge_sample | P2 | Document sample, không thêm persistence; NK-014 |
| R20 Home error feedback | Needs reproduction | HomeScreen.tsx:139–148 catch empty, không feedback | P2 | Inject mode/replace/play/status errors trước fix; NK-011 |

### 4.2 Toàn bộ UX01–UX12

| Phase 0 ID | Disposition | File:line / nguyên nhân | Priority | Phương án / regression / ticket |
| --- | --- | --- | --- | --- |
| UX01 no-QA notice | Confirmed | QaScreen.tsx:908–913; qaNodeStoryVoice.test:551 còn assert text đó | P2 | Empty only ẩn, player/text còn; unknown+old QA vẫn đúng; NK-004 |
| UX02 Trung Yên | Confirmed | Dataset intro/caption/guide vs story như R06 | P1 | Đồng bộ sau source decision; NK-005/006 |
| UX03 Phất Lộc | Requires human verification | Cùng claim Tiên Hạ như R01, không tự sửa năm | P1 | Claim approval/semantic regression; NK-005/006 |
| UX04 ảnh | Confirmed | getNodePhoto:244–255 fallback | P2 | Rights trước mapping; NK-007/008 |
| UX05 Sổ tay Live | Confirmed | 4 host probes như mục 3.1 | P0 | Source-mode matrix; NK-002 |
| UX06 giọng pilot | Confirmed metadata | 16 pilot VI ID khác Nhật Phong; chưa nghe | P1 | Voice plan/delta sau content; NK-009/010 |
| UX07 Passport | Confirmed intentional sample | AlleyPassportModal:73–94 không có progress props | P2 | Không nhầm sample với feature lưu; NK-014 |
| UX08 Home player lỗi | Needs reproduction | HomeScreen:131–149 không feedback | P2 | Controlled failure → error/retry behavior; NK-011 |
| UX09 tham chiếu collection khác | Confirmed | ngo-cam-chi.vi/en.json, cam-chi-den-vong-tien story nhắc Tạm Thương | P1 | Story self-contained, không ép thứ tự ngoài scope; NK-006 |
| UX10 Live “Authentic” | Confirmed wording; impact human review | LandingScreen.tsx:226 dùng wording chân thực cho cả simulated opt-in | P2 | Chốt copy theo kind; không phục hồi mọi badge đã bỏ; NK-014 |
| UX11 large fonts/a11y | Requires human verification | uiFlows.test:45+ VM; styles chưa là Yoga/device result | P1 | Font/keyboard/reader current native; NK-012/017 |
| UX12 GPS expectation | Confirmed copy mismatch | LocationScreen.tsx:140–141 nói gần nhất “ngõ”, thực tế pickCandidate(nodes) trong collection | P2 | Sửa copy scoped node, giữ thuật toán; NK-016 |

Không có R/UX nào thành Obsolete do code đã sửa: tracked source vẫn cùng baseline. Các kết luận có điều kiện được giữ nguyên mức chứng cứ thay vì nâng thành bug confirmed.

### 4.3 Findings mới và các vấn đề không có ID ở Phase 0

| Ref | Disposition | Evidence | Priority / xử lý |
| --- | --- | --- | --- |
| NEW-01 Home play sau blur | Confirmed host | HomeScreen.tsx:131–150,164–176; probe mục 3.2 | P1, NK-003 |
| NEW-02 hàng node hẹp | Needs reproduction | QaScreen.tsx:548–568,1170: minWidth 44 mỗi node, row không wrap/scroll | P2, NK-017. Với 6 node cần >=264px riêng row; còn Back/margins/padding, dễ thiếu ở 320px; chưa coi là native screenshot proof |
| GAP-01 28 hash chưa kiểm | Obsolete, audit gap đã đóng | 28/28 Nhật Phong entries match catalogue path/audio SHA/textHash | Không tạo ticket regenerate hoặc “bổ sung file thiếu” |
| GAP-02 chapter không QA fallback về nodeQa | Needs reproduction | QaScreen.tsx:268–271 không giữ intentional empty chapter selection | P2, NK-019; kiểm companion valid scope và fixture chapter qaIds=[] trước quyết behavior |
| GAP-03 cover PNG lớn | Needs reproduction | Phase 0 sizes 0,88–4,14MB; loading/decode native chưa đo | P2, gộp NK-017; không tự giảm chất lượng ảnh |
| GAP-04 Gạch thiếu intro audio/alleyStory/guide | Confirmed data limitation | collections.ts + ngo-gach.vi/en; vẫn có 5 story audio/locale | NK-006 ghi content decision; không tự tạo 3 loại asset để “đủ” |
| GAP-05 content skill catalog/tool absent | Confirmed docs mismatch | Không có content/alleys/catalog.json hoặc tools/content.mjs trên branch này | P2, NK-014; dùng registry thật, không xây thêm CMS |

Các đánh giá KEEP/MINOR_REVISION/MAJOR_REWRITE/MISSING_CONTENT/REQUIRES_SOURCE_VERIFICATION tại phần 10 Phase 0 được gom NK-005/006, không đổi approval. Các lỗ hổng đọc lịch sử/evidence không liên quan được loại khỏi điều kiện bắt đầu Phase 1 theo phạm vi targeted user mới, không coi toàn bộ tài liệu đó đã đọc.

## 5. Execution backlog

Mỗi allowlist dưới đây chỉ có hiệu lực **khi ticket được mở sau duyệt**. Paths không nêu trong allowlist phải được lead review trước khi thêm; không dùng glob để ghi đè cả dataset/catalogue ngoài scope. Tất cả ticket cấm thay secret, xóa untracked, push/merge/deploy và nâng approval giả.

### NK-001 — P0 — Chốt hashing LF/CRLF có thể kiểm lại

- **Vấn đề/root cause:** fresh suite fail do sourceDataSha256 theo raw bytes, Git chuyển LF thành CRLF; khác với textHash/canonical revision.
- **Evidence:** mobile/tests/nodeStoryVoiceCatalogue.test.mjs:61; tools/voice/generate_node_stories.py:125–145,193; core.autocrlf=true.
- **Files được phép sửa:** .gitattributes nếu chọn hướng EOL; mobile/tests/nodeStoryVoiceCatalogue.test.mjs; tools/voice/generate_node_stories.py và tools/voice/test_node_story_voice.py nếu chốt đổi contract; tài liệu chính sách hash trong docs/plans/. Không sửa MP3 hoặc spoken datasets; không sửa hash manifest hàng loạt cho khớp checkout.
- **Dependencies:** duyệt Phase 1. Lead chốt policy kỹ thuật nhất quán trước patch: raw-source LF bằng attributes hẹp hoặc normalized source hash có version/validator/generator rõ. Attributes đơn lẻ không tự sửa CRLF đã có trong worktree; không bắt người dùng reset/checkout hay renormalize cả repo để chữa test. Nếu normalize phải giữ raw provenance riêng, không chỉ sửa expected.
- **Acceptance criteria:** case LF/CRLF tái hiện được; text change thật vẫn fail; suite current baseline hết lỗi do newline; audio SHA unchanged; không skip assertion hoặc chỉ thay expected.
- **Regression:** nodeStoryVoiceCatalogue, alleyContent, alleysVoiceCatalogue; Python generator tests trong môi trường tạm được phép; test raw-text alteration negative.
- **Risk đối với ngõ đang hoạt động:** đổi hashing bừa có thể làm generator retry/đòi regen; không renormalize toàn repo hoặc đổi revision nội dung.
- **Model đề xuất:** Luna. Đầu ra là patch hẹp + rationale, Sol review contract nếu cần.

### NK-002 — P0 — Chặn guide bundle trong Live non-ready

- **Vấn đề/root cause:** Notebook fallback bundle không xét mode; reproducer mục 3.1.
- **Files được phép sửa:** mobile/src/components/NotebookDrawerModal.tsx; mobile/tests/alleyGuideSection.test.mjs; remediationIntegration.test.mjs hoặc uiFlows.test.mjs chỉ tại cases Notebook/source.
- **Dependencies:** duyệt Phase 1; không phụ thuộc content/ảnh/TTS.
- **Acceptance criteria:** Live no-config/loading/error/no-data không render guide bundle; Live ready chỉ dùng guide server; Demo giữ guide đúng collection/locale; Retry/mode toggle/manual tools hoạt động, không giấu error.
- **Regression:** matrix vi/en × Demo/Live × ready/empty/error; đổi mode khi drawer mở; server guide khác bundle; pending retry, late result.
- **Risk đối với ngõ đang hoạt động:** 4 ngõ có guide có thể mất section trong Demo nếu condition quá rộng; old collections không guide vẫn không có wrapper rỗng.
- **Model đề xuất:** Sol; giữ owner FE theo assignment đã chốt, không tự dispatch thay người.

### NK-003 — P1 — Hủy Home intro play đang chờ khi rời scope

- **Vấn đề/root cause:** async callback tiếp tục sau blur; Home không có generation/focus guard sau await như useVoiceSession.
- **Files được phép sửa:** mobile/src/screens/HomeScreen.tsx; mobile/tests/homeIntroPlay.test.mjs; homePhaseB.test.mjs khi cần assertions lifecycle. Không refactor cả voice hook.
- **Dependencies:** duyệt Phase 1; serial với NK-011 vì cùng Home.
- **Acceptance criteria:** blur/unmount/đổi collection/locale/mode trong lúc audio mode pending không được replace/play track cũ; play hợp lệ vẫn hoạt động; listener cleanup đúng; tắt app foreground/background phải có policy rõ không tự resume.
- **Regression:** deferred setAudioModeAsync rồi blur như mục 3.2; unmount; VI→EN; collection swap; double tap; mode switch; reenter rồi user bấm Play mới.
- **Risk đối với ngõ đang hoạt động:** guard sai khiến intro không phát lại hoặc dừng phiên mới; giữ 4 intro x2 và Qa playback.
- **Model đề xuất:** Sol.

### NK-004 — P2 — Ẩn khối Q&A không có dữ liệu chủ ý

- **Vấn đề/root cause:** QaScreen:908–913 render notice cho nodeQa=[]; test :551 giữ UX trước yêu cầu mới.
- **Files được phép sửa:** mobile/src/screens/QaScreen.tsx; mobile/tests/qaNodeStoryVoice.test.mjs; qaRegressions.test.mjs/uiFlows.test.mjs ở cases liên quan. Translator chỉ sửa key thật cần thiết; không xóa key dùng nơi khác để lint đẹp.
- **Dependencies:** duyệt Phase 1; không đợi viết thêm QA hoặc TTS; serial với NK-017/019 nếu cùng Qa.
- **Acceptance criteria:** 17 node mới × VI/EN không có emptyNotice/empty wrapper; story player/reader/prev-next giữ; người dùng hỏi câu lạ vẫn có unknown feedback; source load fail vẫn Unavailable/retry; 46 QA/locale cũ không bị đổi đáp án/follow-up.
- **Regression:** thay assertion cũ vì requirement đổi, đồng thời thêm positive/negative cases: no-QA, QA hợp lệ, unmatched typed/voice, missing source, locale swap.
- **Risk đối với ngõ đang hoạt động:** ẩn cả answer/error card thay vì chỉ emptyNotice; không thay matcher hoặc dataset để vượt tests.
- **Model đề xuất:** Sol.

### NK-005 — P1 — Claim ledger và quyết định nội dung 5 ngõ

- **Vấn đề/root cause:** certainty/định danh Trung Yên không đồng nhất; Tiên Hạ có claim cần kiểm; nhiều node chỉ là waypoint.
- **Files được phép sửa:** chỉ docs/content/ và một báo cáo review mới trong docs/reviews/. data/localized/*.json là input đọc, chưa được ghi.
- **Dependencies:** không phụ thuộc fix FE; cần reviewer nội dung/nguồn và quyết định người dùng tại mục 8; không tự gọi Claude.
- **Acceptance criteria:** từng claim có source/location/date/class fact/legend/editorial/unknown; xử lý rõ Trung Yên Đền/Đình, Nguyễn Trung Ngạn/Thái Bình, Nguyễn Siêu/1886; ghi role café/Hương Trà/branches; giữ distinction “chưa biết” và “sai”.
- **Regression:** đối chiếu source snapshot với current node IDs; checklist VI/EN cùng mức chắc chắn; không lấy giấy xếp hạng của công trình khác hoặc trả lời bằng suy đoán.
- **Risk đối với ngõ đang hoạt động:** đồng nhất tên/niên đại sai hoặc xóa caveat để câu chuyện hấp dẫn; không nâng reviewStatus.
- **Model đề xuất:** Sol cho reasoning/source reconciliation; kết luận văn hóa/approval cần người có thẩm quyền.

### NK-006 — P1 — Biên tập VI/EN sau claim approval

- **Vấn đề/root cause:** phần meta research lặp, cross-collection reference, locale precision lệch; content structure các ngõ khác nhau.
- **Files được phép sửa:** 5 cặp data/localized/ngo-{gach,trung-yen,tam-thuong,cam-chi,phat-loc}.{vi,en}.json ở field đã duyệt; collections.ts chỉ revision pins; docs/handoffs/ cho delta; mobile/tests/alleyContent.test.mjs và fourAlleyDatasets.test.mjs.
- **Dependencies:** NK-005 + approve nội dung; NK-001 policy hash; lead review revision/voice impact NK-009 trước tích hợp candidate.
- **Acceptance criteria:** story tự chứa, không ép người dùng từng đi Tạm Thương; facts/legend/translation thống nhất intro/story/caption/alleyStory/guide; không tự thêm QA, node, tọa độ hoặc intro audio Gạch; thay vai trò waypoint cần quyết định cụ thể.
- **Regression:** stable node IDs/order/QA structure; V2 pair; exact unknown matcher; text delta so với baseline; chỉ các revision đúng collection thay.
- **Risk đối với ngõ đang hoạt động:** đổi guide cũng đổi revision, có thể làm toàn audio locale không resolve; thay text và audio pins phải cùng review candidate, không xuất trạng thái nửa tích hợp.
- **Model đề xuất:** Sol cho editorial VI/EN; data mechanics có thể giao Luna trong file partition đã chốt, không hai writer cùng file.

### NK-007 — P1 — Ledger quyền ảnh và định danh node

- **Vấn đề/root cause:** 4 ảnh Google Maps và ảnh user-supplied chưa có chứng cứ quyền, cover không thay ảnh node.
- **Files được phép sửa:** docs/IMAGE_SOURCES.md; docs/content/ ledger ảnh mới. Không tải ảnh, thêm assets hoặc đổi photoMap ở ticket này.
- **Dependencies:** có thể chạy cùng NK-005; phụ thuộc cung cấp consent/license khi không có nguồn hợp lệ.
- **Acceptance criteria:** từng asset/path/node/owner/source/license/consent/status được ghi; trạng thái unknown giữ unknown; chọn hướng tự chụp/xin phép/thư viện có giấy phép; không đồng nhất public URL với quyền tái phân phối.
- **Regression:** kiểm mọi photoMap require/cover hiện hành có ledger row, kể cả Three Lenses/fiction; không thay attribution bằng tên đoán.
- **Risk đối với ngõ đang hoạt động:** đánh dấu VERIFIED giả; phạm vi này chỉ tài liệu nên không ảnh hưởng runtime.
- **Model đề xuất:** Luna; người dùng/rightsholder xác nhận quyền.

### NK-008 — P2 — Mapping ảnh theo node sau quyền

- **Vấn đề/root cause:** 9/17 node rơi HERO, ba café dùng cùng ảnh; còn entry Phở Vui/Miến cũ.
- **Files được phép sửa:** mobile/src/assets/photoMap.ts; mobile/assets/photos/ chỉ asset cụ thể được chốt từ NK-007; tests/alleyIntegration.test.mjs và provenanceUiCleanup.test.mjs phần ảnh. Không xóa legacy asset.
- **Dependencies:** NK-007; NK-005 nếu định danh node còn đổi; serial với NK-015 nếu đụng map.
- **Acceptance criteria:** map đúng 17 node mới theo quyết định; không có ảnh giả làm ảnh đúng điểm; credit phù hợp locale; 6 ảnh fiction và Three Lenses photoKey priority giữ; fallback còn dùng cho unknown node.
- **Regression:** getNodePhoto từng node/photoKey/collection; getNodePhotographer VI/EN; Home/Qa/Camera/Location/Postcard; kiểm source files tồn tại.
- **Risk đối với ngõ đang hoạt động:** sửa global HERO gây đổi mọi collection; nhầm cover với node; không thay toàn fallback để chữa vài điểm.
- **Model đề xuất:** Luna.

### NK-009 — P1 — Voice delta/repin inventory không tạo audio

- **Vấn đề/root cause:** exact datasetRevision làm đổi guide tác động lookup; 16 pilot VI vẫn voice khác target; metadata voiceName cũ không theo ID.
- **Files được phép sửa:** docs/handoffs/voice delta mới; mobile/src/voice/alleysCatalog.ts,nodeStoriesCatalog.ts,post8RemainingCatalog.ts,threeLensesCatalog.ts,catalog.ts chỉ pins/metadata thật liên quan; collections.ts chỉ revision đã duyệt; catalogue tests. Các manifest/progress chỉ được đọc ở bước plan; sửa metadata manifest cần plan riêng có provenance.
- **Dependencies:** NK-001; NK-006 cho delta mới. Không chặn audit inventory pilot đang tồn tại. Same files/collection chỉ một writer.
- **Acceptance criteria:** row collection/locale/contentId/old-new textHash/revision/audio path/SHA/voice ID/model/reuse-or-regenerate; unchanged text dùng lại bytes có kiểm; changed text không phát audio cũ; không nới revision/textHash/kind/node guard; target Nhật Phong/Talia giữ nguyên.
- **Regression:** lookup success đúng tuple và reject sai locale/revision/kind/node/text; check 198 baseline references, 34 node tracks và 8 intros; 28 Three Lenses hash gap không tái mở.
- **Risk đối với ngõ đang hoạt động:** repin sai biến stale audio thành hợp lệ; không chỉ đổi revision cho mọi clip bất kể text.
- **Model đề xuất:** Luna.

### NK-010 — P2 — Batch TTS tương lai, gated riêng

- **Vấn đề/root cause:** chỉ sau content approval mới biết clip nào đổi; pilot voice migration có chi phí.
- **Files được phép sửa khi gate mở:** generator tương ứng trong tools/voice/ + tests của nó; manifest/progress/catalogue và **đường dẫn audio output phiên bản mới được batch manifest liệt kê**. Không overwrite/delete MP3 baseline hoặc sửa engine/model/reserve ngoài duyệt.
- **Dependencies:** NK-005/006/009; duyệt danh sách clip/voice/model, budget/reserve và quyền paid API cho batch cụ thể. **Không nằm trong quyền Phase 0.5 hoặc mặc nhiên của Phase 1.**
- **Acceptance criteria:** chỉ clip cần đổi được gửi; preserve checkpoints; uncertain outcome không tự resend; hash/decode; humanApproved/listened không tự true; user nghe trước acceptance.
- **Regression:** offline generator mocks cho no-paid-call, uncertain recovery, stale source, quota; sau generate kiểm catalogue + native playback NK-012.
- **Risk đối với ngõ đang hoạt động:** tiêu phí không cần thiết, sửa provenance, đổi giọng hoặc làm mất archive; giữ baseline rollback.
- **Model đề xuất:** Luna; ticket trạng thái BLOCKED_BY_FUTURE_APPROVAL, không dispatch hiện tại.

### NK-011 — P2 — Home intro feedback và retry sau lỗi

- **Vấn đề/root cause:** catch rỗng ở Home:139–148; tác động/native failure chưa tái hiện.
- **Files được phép sửa:** HomeScreen.tsx, homeIntroPlay.test.mjs; translator.ts chỉ keys lỗi mới nếu thật cần. Không thay Qa hook/player cho tiện.
- **Dependencies:** NK-003 hoàn tất trước; đầu ticket bắt đầu bằng error injection/reproduction, không tự redesign.
- **Acceptance criteria:** mô tả error mode/replace/play/status cụ thể, thông báo dễ hiểu và text fallback; retry cùng track không bỏ replace sai; không lộ path/native exception.
- **Regression:** throws/rejected audio mode; failed replace/play; native status error; retry; locale/blur khi error đang chờ.
- **Risk đối với ngõ đang hoạt động:** retry vô hạn hoặc kích hoạt stale play; phải giữ guards NK-003.
- **Model đề xuất:** Sol.

### NK-012 — P1 — Native/listening acceptance matrix

- **Vấn đề/root cause:** host VM không đo layout, mic, silent route, cold offline hoặc quyền thật.
- **Files được phép sửa:** docs/reviews/ báo cáo mới + evidence mới ở thư mục riêng được chốt; tools/e2e/native-flow.mjs/tests chỉ khi harness hiện tại không khớp UI và đã review. Không sửa app để bypass QA hoặc overwrite evidence cũ.
- **Dependencies:** candidate kỹ thuật đã chốt; content/media/audio tương ứng khi kiểm acceptance cuối. Có thể chuẩn bị matrix trước, chạy nghiệm thu sau. Cần thiết bị/chủ sở hữu; không tự restart Metro đang dùng.
- **Acceptance criteria:** Android/iPhone ghi device/build/HEAD/config; VI/EN, 8 collections, offline text/local audio, permissions/manual fallback, QR/GPS thật, fontScale1.3/2.0, keyboard, screen reader, blur/background/calls/audio routes, consecutive mic turns; pass/fail/pending rõ; restore settings.
- **Regression:** chạy targeted cases NK-002/003/004/008/011/016/017; dùng source/hash đúng candidate; synthetic ASR khác human speech.
- **Risk đối với ngõ đang hoạt động:** snapshot lệch HEAD, mute/no-audio AVD bị ghi là listening pass, test để lại permissions/settings; không coi device unavailable là PASS.
- **Model đề xuất:** Sol cho QA design/triage; W4 và người kiểm thiết bị theo assignment thực tế, không tự thay model.

### NK-013 — P1 — Backend/API regression mở rộng có isolation

- **Vấn đề/root cause:** 8 memory scenarios không thay full CLI/backup/atomic replacement tests; Live chỉ một pair là contract đã xác nhận.
- **Files được phép sửa:** backend/tests/api.test.mjs,localized.test.mjs,cli.test.mjs,database.test.mjs; tools/e2e/phase8-http.test.mjs; backend/src chỉ khi reproduction phát hiện bug nằm trong contract đã duyệt, phải lead review cụ thể trước sửa.
- **Dependencies:** mở quyền test fixture/temp DB trong Phase 1; không phụ thuộc viết content mới. Không dùng DB_PATH thật, không .env secret.
- **Acceptance criteria:** full backend/HTTP commands với temp fixtures độc lập đạt hoặc có failure triage; readonly GET contract, pair atomic/no-op/rollback/backup, locale headers/limits, simulated opt-in, corruption fail-closed; không thêm multi-collection schema.
- **Regression:** existing backend suites + mobile live/post8SharedContract; fresh custom pair và bad UTF8/oversize; luôn xác nhận target temp trước cleanup.
- **Risk đối với ngõ đang hoạt động:** test gọi nhầm DB chính hoặc xóa đường dẫn rộng; giữ default DB không bị mở.
- **Model đề xuất:** Luna.

### NK-014 — P2 — Handoff/docs đúng snapshot và copy boundaries

- **Vấn đề/root cause:** README/test counts/source-management skills/node matrix cũ; sample Passport có thể bị hiểu là lưu thật; Live copy “Authentic” bất kể kind.
- **Files được phép sửa:** README.md,mobile/README.md,agent_docs/testing.md,docs/IMAGE_SOURCES.md; báo cáo/handoff mới trong docs/reviews/ hoặc docs/handoffs/; MEMORY.md để ghi bàn giao sau khi phase được duyệt. Không sửa mất lịch sử báo cáo Phase 0/P4. LandingScreen.tsx/translator.ts chỉ nếu user duyệt copy wording và có tests.
- **Dependencies:** NK-001/002/003 outcomes cho trạng thái mới; content/media facts từ NK-005/007. Copy change độc lập sau chốt wording.
- **Acceptance criteria:** matrix 17 current IDs, 8 collections, active/archive distinctions, private gateway và single Live pair; sample Passport ghi đúng; không hỏi lại giọng đã chốt; không phục hồi hàng loạt badge đã được yêu cầu bỏ.
- **Regression:** link/path checks; list IDs compare registry/data; provenanceUiCleanup cases phù hợp copy mới; không gọi historical test số ca là current.
- **Risk đối với ngõ đang hoạt động:** sửa docs thành approval giả hoặc text Live phóng đại simulated; copy phải review scope riêng.
- **Model đề xuất:** Luna.

### NK-015 — P2 — Dependency/asset ownership map, chưa refactor

- **Vấn đề/root cause:** backend import mobile TS, metadata nhiều nguồn, active/archive audio khó quản lý.
- **Files được phép sửa:** docs/plans/ hoặc docs/handoffs/ map mới; chỉ thêm focused inventory test ở mobile/tests/ nếu được review. Không package migration, no asset deletion.
- **Dependencies:** có thể làm song song Phase 1 nếu không sửa catalogue/data đang chạy NK-006/009.
- **Acceptance criteria:** chỉ rõ consumer ALLEY_LIST vs AVAILABLE_COLLECTIONS, Node24/shared TS requirements, 198 active/184 archive paths và provenance, flags preview/shipping. Đề xuất refactor nếu có phải là scope tương lai, không điều kiện cứu demo.
- **Regression:** inventory query không ghi bytes; xác nhận known IDs/legacy consumers; không default tên ngõ khác khi unknown.
- **Risk đối với ngõ đang hoạt động:** “dọn rác” làm mất rollback hoặc đổi Metro requires; tài liệu không cấp quyền làm vậy.
- **Model đề xuất:** Sol.

### NK-016 — P2 — GPS copy scoped stop và field-readiness

- **Vấn đề/root cause:** copy “ngõ gần nhất” trong màn chỉ nhận nodes collection; 10/17 node thiếu coords là intentional unverified state.
- **Files được phép sửa:** LocationScreen.tsx/translator.ts chỉ copy; mobile/tests/location.test.mjs,uiFlows.test.mjs phần GPS; docs/data field checklist. Không sửa tọa độ/null/QR payload trong ticket này.
- **Dependencies:** duyệt copy + Phase 1/2 scope; field-data task riêng nếu sau này có survey evidence.
- **Acceptance criteria:** nói đúng gợi ý điểm trong collection, GPS một lần, confirm mới đổi; thiếu coords/denied/poor accuracy/outside vẫn chọn tay; không thêm auto-GPS hoặc tìm mọi ngõ.
- **Regression:** candidate/manual/late-result/back/permission denied và VI/EN copy; node nonlocated không gợi tọa độ đoán.
- **Risk đối với ngõ đang hoạt động:** copy kéo theo đổi thuật toán nearest; cấm tự đổi thresholds/coordinates.
- **Model đề xuất:** Luna.

### NK-017 — P2 — Reproduction layout hẹp/large fonts và ảnh lớn

- **Vấn đề/root cause:** Qa top row min widths, Home fixed progress width, cover decode lớn có nguy cơ; mock không đo clipping/memory.
- **Files được phép sửa:** trước hết docs/reviews/ evidence; chỉ sau reproduction được duyệt mới sửa styles trong QaScreen/HomeScreen/VoicePlayerBar/ToolDock hoặc test tương ứng. Không thay theme tổng thể, dependencies hay nén ảnh chưa có quyền.
- **Dependencies:** native environment NK-012; serial với mọi ticket cùng Qa/Home. Performance chỉ đo trên candidate cố định.
- **Acceptance criteria:** test width320/360 và phone thực, VI/EN/fontScale1/1.3/2; back/title/node segments/player/dock còn truy cập; đo memory/decode trước kết luận ảnh lớn là bug; ghi không tái hiện nếu vậy.
- **Regression:** không giảm touch target để vừa màn, không cắt mất title/hide critical action; normal font/6-node fiction và >6 synthetic dataset.
- **Risk đối với ngõ đang hoạt động:** đổi top row phá navigation/progress, thay ảnh giảm chất lượng không cần; chỉ fix measured issue.
- **Model đề xuất:** Sol.

### NK-018 — P2 — Gateway cancellation/availability probe, private scope

- **Vấn đề/root cause:** worker.cancel server.mjs:83–88 chỉ xóa pending Map; Python loop :72–112 vẫn xử lý request tuần tự, chưa có cancel protocol. Tác động queue/timeout cần reproduction.
- **Files được phép sửa:** docs/reviews/ probe report; tools/voice/gateway/smoke_test.mjs hoặc test mới chỉ nếu được mở môi trường offline fixture; gateway/server.mjs/stt_worker.py chỉ khi có confirmed defect + fix spec được lead duyệt.
- **Dependencies:** environment có local ASR/ffprobe phù hợp và private LAN được xác nhận. Không tự bật service, tải model, public-host hoặc thu giọng người khác.
- **Acceptance criteria:** bounded abort→retry→busy/timeout; health readiness sau worker exit; temp audio cleanup; không gọi paid STT; ghi rõ nếu accepted local limitation.
- **Regression:** fake worker deterministic trước live local-model smoke; abort before/after inspectAudio; rapid cancel sequence; không raw private-audio logs.
- **Risk đối với ngõ đang hoạt động:** hủy ASR nhầm lượt mới, tăng queue vô hạn hoặc làm mất language pin; không tự thêm service/auth stack.
- **Model đề xuất:** Luna.

### NK-019 — P2 — Chốt behavior chapter có Q&A rỗng

- **Vấn đề/root cause:** QaScreen:268–271 fallback về nodeQa khi chapterQa rỗng, có thể phá ý nghĩa qaIds=[].
- **Files được phép sửa:** trước hết mobile/tests/threeLensesIntegration.test.mjs hoặc uiFlows.test.mjs với fixture hợp lệ; QaScreen.tsx chỉ sau khi requirement/reproduction được chốt; không đổi companion data để ép test pass.
- **Dependencies:** companion valid scope/revision/integrity; duyệt behavior “QA node-wide” hay “QA chapter-scoped”; serial với NK-004/017.
- **Acceptance criteria:** chứng minh current fixture có/không xảy ra; case activeChapter.qaIds=[] không kéo QA sai chapter nếu scoped behavior được chọn; unknown và fixed answers giữ nguyên.
- **Regression:** 3 node/5 chapters/16QA Three Lenses, intro/transition/closing, live companion guard và locale swap; old fiction không bị giới hạn giả.
- **Risk đối với ngõ đang hoạt động:** làm biến mất QA hợp lệ trong Three Lenses hoặc sinh fallback chưa duyệt; nếu không có yêu cầu scoped, giữ limitation documented thay sửa tùy ý.
- **Model đề xuất:** Sol.

## 6. Ưu tiên và execution waves

| Wave | Tickets | Điều kiện mở / exit |
| --- | --- | --- |
| Phase 1 — kỹ thuật, không tạo content/audio | NK-001,002,003; NK-004 nếu gom quick UX fix; NK-013 | User duyệt scope/owner. Exit: hash suite green, Live guide leak hết, async Home race hết, API regression đạt; không chờ full content hay paid voice |
| Phase 2A — nguồn và biên tập | NK-005 → NK-006; chuẩn bị NK-009 | User chốt claim/role; không tích hợp dataset revision làm mất active audio. Exit: văn bản/translation đã review, delta rõ |
| Phase 2B — quyền ảnh | NK-007 → NK-008 | Rights verified trước asset integration; node identity đã chốt. Có thể song song 2A |
| Phase 2C — hỗ trợ/triage có điều kiện | NK-011,014,015,016,017,018,019 | Theo owner/file locks và reproduction; optional refactor/persistence/multi-live không mở |
| Phase 3 — voice integration và nghiệm thu | NK-009 → nếu cần NK-010 → NK-012 | Content approval + batch approval riêng, nghe và native evidence current SHA |

Priority không đồng nghĩa wave: NK-012 là P1 cho acceptance nhưng chạy sau khi candidate sẵn sàng. Không gọi Phase 0.5 “chưa xong” chỉ vì chưa nghe hoặc chưa sửa một ticket mà user cấm triển khai.

### 6.1 Có thể song song sau khi được duyệt

- NK-001 (hash contract) và NK-002 (Notebook) và NK-013 (backend tests) có file sets tách nhau; nếu cùng chạm uiFlows.test.mjs thì lấy lượt, không cùng writer.
- NK-003 (Home) có thể cùng NK-002, nhưng không cùng NK-011 hoặc phần Home của NK-017.
- NK-005 research và NK-007 rights ledger có thể cùng kỹ thuật; không cùng sửa docs ledger/file nguồn.
- NK-006 content và NK-008 images có thể song song sau chốt IDs; collections.ts nếu phải sửa thì **một writer**.
- NK-006 tạo candidate text đã duyệt và tính revision trước; NK-009 nhận chính candidate đó để lập delta/repin, sau đó lead review tích hợp thống nhất. Đây là hai bước bàn giao tuần tự, không phải vòng phụ thuộc phải “merge code xong mới xem audio”. Không chạy NK-006 và repin/generate cùng collection cùng lúc. Clip có spoken text đổi có thể tạm thiếu audio theo quyết định rollout rõ ràng; tuyệt đối không repin clip cũ thành hợp lệ. Clip nguyên text phải tiếp tục resolve; không chấp nhận mất audio ngoài danh sách delta.
- NK-004/NK-017/NK-019 đều chạm QaScreen: tuần tự hoặc một owner gom patch, không ba writer song song.

Đây là kế hoạch concurrency; không spawn/gọi Claude/Antigravity/Luna/Sol/Muse trong Phase 0.5.

### 6.2 Dependency map

~~~mermaid
flowchart TD
  A[Người dùng duyệt Phase 1 và ownership] --> H[NK-001 hash]
  A --> L[NK-002 Live guide]
  A --> P[NK-003 Home race]
  A --> Q[NK-004 no-QA UX]
  A --> B[NK-013 backend regression]
  C[NK-005 sources/role] --> E[NK-006 VI/EN content]
  I[NK-007 image rights] --> M[NK-008 mapping]
  E --> V[NK-009 voice delta/repin]
  H --> V
  V --> T{Cần audio mới và được duyệt batch?}
  T -->|Có| G[NK-010 TTS]
  T -->|Không| N[NK-012 native/listening]
  G --> N
  M --> N
  L --> N
  P --> N
  Q --> N
~~~

## 7. Regression contract bảo vệ các ngõ đã hoạt động

Mọi patch phải ghi baseline parent HEAD và changed files; nếu worktree khác source fingerprint hoặc có WIP overlap thì re-audit đúng phần trước sửa, không reset/stash/overwrite.

- Fixture fiction-letter: 6 node, 21 Q&A/locale, exact matcher + unknown + follow-ups không thay; QR/GPS manual và 34 audio gốc protected giữ bytes.
- Pilot/Three Lenses: 3 node mỗi collection; 9/16 Q&A, 5 chapter, 3 transition, closing; tuple/revision và companion guard không nới.
- Năm ngõ mới: 17 node x2 locale, intro x8 hiện hành; no-QA không bị hiểu là parse error; không tự thêm câu trả lời.
- Không nâng simulated/reviewStatus/humanApproved/listened/selectedForShipping bằng test hoặc generator.
- Đổi metadata không đổi spoken text không cho phép paid TTS; đổi spoken text không cho phép phát audio cũ chỉ vì contentId giống.
- Live chưa config/rỗng/lỗi giữ state thực; không hiển thị bundle guide/đáp án giả để app trông đủ dữ liệu.
- Giữ nguồn và provenance trong data kể cả UI đã bỏ badge; không trộn cleanup copy với xóa evidence.

Gate kỹ thuật Phase 1: full mobile suite phải PASS, no unexpected skip; typecheck/lint; backend/HTTP suites theo phạm vi test được mở; focused regressions của NK-001/002/003/004. Nếu test count đổi, báo count và lý do, không chỉ nhắc số 390 như cố định vĩnh viễn.

## 8. Việc cần người dùng quyết / tự làm

### Cần người dùng quyết

| Decision | Câu hỏi cụ thể và đề xuất | Nếu chưa chốt |
| --- | --- | --- |
| D1 — Phase 1 | Có mở đợt khắc phục NK-001/002/003/013 và gom NK-004 không? Đề xuất gom NK-004 vì yêu cầu ẩn no-QA đã rõ | Không có code ticket nào bắt đầu |
| D2 — Owner/model | Mặc định giữ owner FE Antigravity và W3 Luna theo AGENTS; chỉ cần quyết nếu muốn đổi assignment. Sol/Luna ở ticket là recommendation | Không có duyệt đổi thì tiếp tục ownership hiện hành; không tự thay worker |
| D3 — Story roles | Café/Hương Trà/branches giữ waypoint hay cần story đủ chiều sâu? Đề xuất waypoint khi nguồn chưa đủ, không bịa để đủ số | NK-006 ở các node đó pending |
| D4 — Content sign-off | Ai phê duyệt claim Trung Yên/Tiên Hạ và VI/EN trước sửa spoken text? Đề xuất ghi nhận người chịu trách nhiệm + nguồn | Không sửa facts/regen audio đoạn đó |
| D5 — Rights | Chọn tự chụp/xin phép/ảnh có license cho từng node? Đề xuất ảnh đúng điểm có chứng cứ quyền | Không tích hợp ảnh thay thế hoặc gọi verified |
| D6 — Voice batch, về sau | Sau text approval, có mở migration 16 pilot VI và các clip changed-text theo budget manifest không? Target Nhật Phong/Talia đã chốt, không hỏi lại | Không paid API/audio generation |
| D7 — Acceptance scope | Thiết bị Android/iPhone nào sẵn sàng; chấp nhận pending platform nào nếu thiếu? Đề xuất QA hai platform trước tuyên bố native hoàn tất | Không đánh dấu platform thiếu là pass |

Không yêu cầu duyệt lại từng thao tác đọc/test đã được giao cho Phase 0.5. D1 chỉ là gate triển khai mới do user nói rõ **không tự chạy Phase 1**.

### Cần người dùng tự làm

- Cung cấp consent/license hoặc kết nối người sở hữu ảnh khi dữ liệu quyền không có: **[ngoài plan]** core TECH_DEMO_PLAN chưa bao gồm licensing ảnh thật các ngõ mở rộng; thiếu thì rights gate còn mở.
- Cung cấp khảo sát/đầu mối thực địa nếu muốn verified coordinates/hours: **[ngoài plan]** cho các ngõ thật mở rộng; thiếu thì giữ null/OSM-reference/manual, không suy dữ liệu thật.
- Nghe và xác nhận pronunciation/story/voice, thao tác native mic/audio routes/QR/GPS khi đến NK-012: thuộc scope QA/voice hiện có, chỉ chủ thiết bị có thể cung cấp evidence tương ứng; thiếu thì ghi pending.
- Không cần tự sửa CRLF, mua quota, đổi key hoặc tạo thêm content để bắt đầu Phase 1 kỹ thuật.

## 9. Điều kiện bắt đầu và kết thúc Phase 1

### Entry gate — để bắt đầu

1. Người dùng duyệt **đợt khắc phục Phase 1** và ticket scope cụ thể; Phase 0.5 hoàn tất không tự cấp quyền.
2. Chốt assignment và một writer cho mỗi file; không đổi model/owner âm thầm.
3. Worker kiểm lại branch, HEAD, status và file deltas; nếu khác baseline này, đối chiếu thay đổi trước coding. Không đòi nhánh mới/push.
4. Nhận rõ baseline đang fail 1 test vì newline; cho phép NK-001 sửa nguyên nhân. **Không yêu cầu suite đã xanh trước khi bắt đầu chính ticket sửa failure.**
5. Nếu mở NK-013, xác nhận môi trường test temp/memory/ports riêng, không dùng DB thật; nếu cần quyền sandbox thì dùng cơ chế approval của công cụ.
6. Tất cả Phase 1 tickets giữ no paid API, no audio generation, no branch/push/deploy, no untracked deletion. Content/image/voice human gates không chặn sửa isolation/hash/Home race.

### Exit gate — để nghiệm thu

- NK-001/002/003 và các ticket thêm vào scope có test cho trigger/negative cases; full technical suite đạt với count thực.
- Không còn reproduction Live guide hoặc play-after-blur; CI/host pass chưa thay native behavior check.
- Source/audio/data changes khớp allowlist; có diff review và old-collection regressions.
- Native smoke các luồng kỹ thuật đã sửa nếu thiết bị sẵn; nếu chưa có thì không nói native acceptance đạt.
- Lead bàn giao thay đổi/test/pending + việc người dùng; dừng ở gate phase tiếp theo, không tự sang content/TTS.

## 10. Handoff và trạng thái cuối

Phase 0.5 đã hoàn thành **targeted audit và execution planning**; đề xuất 19 tickets với allowlists, dependencies, acceptance criteria, regression, old-alley risk và model. Hai P0 technical blockers là NK-001/NK-002; Home race NK-003 là finding mới P1. Các R/UX từ Phase 0 đều có disposition, không bỏ mất issue vì trùng ticket.

READY_FOR_PHASE1_APPROVAL khác READY_FOR_RELEASE. Code chưa được sửa; 1 test baseline vẫn fail; native/listening/rights/content sign-off còn có gate riêng. Không khởi chạy Phase 1.

Xác nhận kiểm tra cuối: typecheck **exit 0**, targeted lint **exit 0**; tracked diff toàn repo **exit 0**; HEAD vẫn **4af64c49a4ada47f952ddf76c35adfb90f826224**; báo cáo Phase 0 giữ nguyên SHA256 nêu ở mục 1. Thay đổi duy nhất của lượt này là thêm tài liệu backlog; các untracked có sẵn được giữ nguyên.

## Phụ lục — Source fingerprints của snapshot

Hashes là byte checkout Windows (có thể CRLF), không thay canonical dataset revision. Worker có thể so bằng Git diff cùng HEAD để phân biệt biến đổi xuống dòng với thay code.

| File | SHA256 |
| --- | --- |
| mobile/src/screens/QaScreen.tsx | 850dd07b0f7f23c250faf7e52890f36a03b6525c1b3d4d1f571deed5b4fa4251 |
| mobile/src/screens/HomeScreen.tsx | c09b8fd4106a4b6f73aee1e4e8b7bf73971de5cf3cad6b41eaad2e5b00531fc6 |
| mobile/src/components/NotebookDrawerModal.tsx | fcde6a9daef23e46d7206c42b8e613b5f52e45a9a6ff58c6835f5c0a44111707 |
| mobile/src/data/sourceState.ts | 05a5b0ca75d1fa2a04b5106409473778be8772a52d7b5738673c6a423d7c0fc6 |
| mobile/src/data/collections.ts | b524bf717af2d4899db4b7d6c5b9d529677a1d1ec7009e5a0f2b55114de619f8 |
| mobile/src/voice/useVoiceSession.ts | 2269ac959366c486fd34a702b169e06f2aaad6cb8d2fc6a010225fd770e6e0eb |
| mobile/src/voice/localizedCatalog.ts | cb258e8d6addd2d084a012c392adf78cc0cf72bbba6044a141cb8759bd1eda3d |
| mobile/src/assets/photoMap.ts | 5e538541248f267cc3d33fefbfefe252b1c7ed109acecb5e9eb2a3f42ae2b09b |
| tools/voice/gateway/server.mjs | 83997da46eca84b55ebbb498ae139428fc549ab293ee40a15259e37c7d5bb8ea |
| tools/voice/gateway/stt_worker.py | 5cb1d704637bc0ad064678bccde3737ab3decca682a8e26ad163a6d9cb5bc399 |

