# Ngõ Kể — Phase 2A / NK-005 handoff

Ngày: 23/10/2026. Owner phiên: Codex Sol, heritage/content review. Quyền: research + read-only application source + bốn tài liệu được chỉ định. **Verdict: NEEDS_MORE_EVIDENCE.** Research/editorial handoff đã hoàn tất; chưa đủ để phê duyệt toàn bộ nội dung lịch sử hoặc bắt đầu NK-006/TTS.

## 1. Baseline đã kiểm trực tiếp

- Workspace `D:\ngo_ke`; branch `valentino/logic-fix-mobile-20261020`.
- HEAD `4af64c49a4ada47f952ddf76c35adfb90f826224`, không đổi trong phiên. Không coi HEAD thuần là candidate Phase 1A/1B: các fix hiện nằm trong dirty worktree.
- 11 tracked modifications có sẵn: `mobile/src/components/NotebookDrawerModal.tsx`; `mobile/src/screens/{HomeScreen,QaScreen}.tsx`; `mobile/tests/{alleyGuideSection,homeIntroPlay,nodeStoryVoiceCatalogue,qaNodeStoryVoice,uiFlows}.test.mjs`; `tools/e2e/phase8-http.test.mjs`; `tools/voice/{generate_node_stories.py,test_node_story_voice.py}`. Đã giữ nguyên; không stash/reset/checkout/commit.
- Untracked có sẵn: `.agents/`, `docs/audits/`, `docs/design/`, `docs/plans/`, báo cáo Phase 1A/1B trong `docs/reviews/`, `mobile/.cache/`. Không xóa hoặc ghi đè. Tài liệu kế hoạch/UI của Antigravity không bị sửa.
- Registry có 8 active collection IDs theo thứ tự `AVAILABLE_COLLECTIONS`: `ngo-trung-yen`, `ngo-gach`, `ngo-tam-thuong`, `ngo-cam-chi`, `ngo-phat-loc`, `old-quarter-three-lenses`, `old-quarter-pilot`, `fiction-letter`. Phạm vi nội dung chỉ 5 ngõ đầu; không đồng nhất `simulated` với hư cấu mọi claim hoặc `reviewed` với field verified.

Đã tính SHA256 canonical trực tiếp bằng `canonicalDatasetJson(JSON.parse(file))`; 10/10 trùng pins trong `mobile/src/data/collections.ts`. Raw SHA dưới đây là bytes của source tại snapshot Windows, khác khái niệm dataset revision hoặc spoken textHash.

| Dataset (`data/localized/`) | Canonical dataset revision | Raw source SHA256 |
| --- | --- | --- |
| ngo-gach.vi.json | `60c242b80557356b8c6f8302f16e937447e0fc48c09b8c84453965631028d19b` | `808f06c37b811fdc261c444434c876193ba65a0c19e1a034d6da1ca066e14aab` |
| ngo-gach.en.json | `0f02ac35e6f3eaba103190a7e366d1dae11d6966609d296e175e29185cb79051` | `291dfa22711422846f2f305a6608e2f627bc0a02f9da8b363e51267361dd38ba` |
| ngo-trung-yen.vi.json | `59e84df99d75369d5cfb53df901c8c3e748d0d528e5f4334acfc07b20029d7c9` | `2131350a1df03f9178db7717982555c9038bcf19fd10c4f5758ac1eb4b162dff` |
| ngo-trung-yen.en.json | `50ecf581900181a2589571b820d3b43710a7f19daa0d947fe7bab9d9c3100741` | `46259dab2569f041fa572b0b51fcd91f57ad5f5a5bd4d4f5e216e688a7b3097a` |
| ngo-tam-thuong.vi.json | `41e95b6510f06fbabb9d0a776cb1fec7f204e2f21244ebd57161724e9efb7271` | `2c9c9f26e2f904abaa43ac73b651bc1f8df7795ef1d568c8b7478712c879cdff` |
| ngo-tam-thuong.en.json | `0afc9ed695fac834fb53010893d855a7aabfc87ec61bf9ac8a74eddf0c176efd` | `6a4a48945f2af9404ee15e68afcd7ad6da01af62fb2c4ae0f648fb2d759123ab` |
| ngo-cam-chi.vi.json | `f658ad9a1ab8c52fe4fe4daaaf7d87b59553da9617b424702ba8f64dc619a4a4` | `2bb1d04197c395583c0d102a879bceada47771a4cbc2ebf196dd1b8cbab2fe54` |
| ngo-cam-chi.en.json | `2f75572bb84552fcd6ba0602e9682170a00b614bc1aa2a1a7ac6aa36fb60c877` | `efa0c0622e25ae77605b140cc840c31a34af82877502943894f4e438d16a2d71` |
| ngo-phat-loc.vi.json | `c2a2b2afc53b52b2a0770ba1d23a80c2dfe08507e5ece19a2c4edff703e33d6a` | `a7eaae5638dd39621db86170371b089cec8958bf3777f87fa51a0aba412c76b7` |
| ngo-phat-loc.en.json | `5ac2c7c70a755c416baf4538598cac45e9a56eb102cf101fa7b670c36ab0692f` | `c5f606a276561e1c795df92d51e99fd815e5ca7853f89f51ce7c7642bd3727ea` |

Đúng 17 IDs, VI/EN cùng thứ tự/order 1..N; startNodeId là node đầu của từng nhóm ở mục 3. Cả 10 dataset có `qa: []`; không tạo đáp án hoặc thay Q&A để phục vụ biên tập.

## 2. Research coverage và giới hạn

Đã đọc/đối chiếu AGENTS.md, MEMORY hiện hành, backlog NK-005/006 và dependencies, báo cáo Phase 0/1B, 10 dataset, tài liệu biên soạn bốn ngõ và bản EN, research Ngõ Gạch/Trung Yên, source ledgers liên quan, registry, canonical serializer, catalogue/resolver/tests liên quan. Dùng skill `heritage-fact-check` để phân facts/legend/editorial/field, và `voice-tts-quality` để tách integrity khỏi listening/native. Tài liệu voice cũ mô tả pipeline fictional V1 không thay thế generator/catalogue localized hiện tại.

Không tìm thấy `ngo_ke(2).docx`; không đoán nội dung. Đường `content/alleys/` trong skill không có trên branch; dùng `data/localized` và registry thật. Không phụ thuộc file handoff lịch sử đang thiếu để tự suy ra facts. Không khảo cứu node_modules/historical evidence không liên quan hoặc đọc env secrets; với binary/media chỉ kiểm fingerprint bytes, không decode/nghe.

Coverage: 17 node × VI/EN, cả name/summary/story/caption; 5 intro text; 4 alleyStory và 4 guide (Gạch không có hai field này). Kiểm claim ở cấp ngõ, di tích, quán, hiện vật, alias, chronology, nguồn câu chuyện, parity và self-contained. Không field survey, liên hệ đơn vị quản lý, kiểm giấy phép ảnh hoặc nghe MP3. Không xác minh opening hours hiện tại từ bài cũ.

Ledger có **62 claim/family rows**; các hàng guide liệt kê rõ thuộc tính gom chung, không phải 62 câu đơn nguyên tử hay chứng nhận mọi fact. Source register 30 entries: 21 entries có thân bài đã đối chiếu (gồm bản đăng lại và nguồn trùng, không phải 21 nguồn độc lập), 6 URL không truy xuất được đầy đủ, 1 nguồn thư mục chưa mở lại, 2 nhóm nguồn nội bộ. Search result/PDF không tải được không dùng để nâng VERIFIED. Các nguồn không mở được ghi PENDING_EXTERNAL_VERIFICATION ở cấp access.

Phân bố 62 hàng đã kiểm đếm: 6 VERIFIED, 29 PARTIALLY_SUPPORTED, 8 CONFLICTING, 10 UNVERIFIED, 4 LEGEND, 5 EDITORIAL_INTERPRETATION. Đây là trạng thái từng family trong phạm vi bằng chứng ghi ở ledger, không tỷ lệ chính xác của toàn bộ câu chữ hay xếp hạng mức tin cậy cả collection.

## 3. Ma trận 17 node — coverage VI/EN

| Collection / order | Node ID | Verification trọng tâm | Editorial status | Role đề xuất, chưa duyệt |
| --- | --- | --- | --- | --- |
| ngo-gach / 1 | ngo-gach-ca-phe-no1 | G02–03; vị trí hạn chế, thiếu chuyện riêng | MISSING_CONTENT | waypoint |
| ngo-gach / 2 | ngo-gach-ta-ca-phe-4 | G04 verified identity qua đơn vị; bước chân chưa kiểm | MISSING_CONTENT | waypoint |
| ngo-gach / 3 | ngo-gach-dinh-thanh-ha | G06/G09 có nguồn; G08 niên đại vật thể chưa đủ | REQUIRES_SOURCE_VERIFICATION | story |
| ngo-gach / 4 | ngo-gach-cafe-20 | G10 bản đồ, chưa field identity | MISSING_CONTENT | waypoint |
| ngo-gach / 5 | ngo-gach-chua-cau-dong | G11–12 báo chí/ước niên đại, ngoài ngõ | MINOR_REVISION | supporting place có story |
| ngo-trung-yen / 1 | trung-yen-pho-suong | T07 lời kể 2021, không operation hiện tại | MINOR_REVISION | supporting place có story |
| ngo-trung-yen / 2 | trung-yen-dinh-trung-yen | T03 verified ranking; T04 certainty conflict; T06 alias pending | MAJOR_REWRITE | story |
| ngo-trung-yen / 3 | trung-yen-bun-ca-sam-cay-si | T08–09 tên/món có nguồn, chuyển chợ chưa đủ | MINOR_REVISION | supporting place có story |
| ngo-trung-yen / 4 | trung-yen-bun-ngan-nhan | T10 review cũ, nhạy cảm danh tiếng | MINOR_REVISION | supporting place |
| ngo-trung-yen / 5 | trung-yen-pho-ga-huong-tra | T11 contradiction giữa unknown và menu khẳng định | MISSING_CONTENT | waypoint/demo label pending identity |
| ngo-tam-thuong / 1 | tam-thuong-dinh-yen-thai | A02 verified nhận diện; A03 alias pending | MINOR_REVISION | story |
| ngo-tam-thuong / 2 | tam-thuong-den-vong-tien | A05–07 location partial, legend không sử kiện | MINOR_REVISION | supporting place có story |
| ngo-cam-chi / 1 | cam-chi-khong-gian-nghe-thuat | C04 nguồn đăng lại 2025; cổng lấy cảm hứng | MINOR_REVISION | story văn hóa đương đại |
| ngo-cam-chi / 2 | cam-chi-ngo-hoi-vu | C06 press description, C07 lời truyền | MINOR_REVISION | supporting place |
| ngo-cam-chi / 3 | cam-chi-den-vong-tien | C08 có identity nhưng narrative phụ thuộc collection khác | MAJOR_REWRITE | supporting place có story tự chứa |
| ngo-phat-loc / 1 | phat-loc-den-tien-ha | P03/P05/P06 conflicts chủ thể–niên đại–địa chỉ | REQUIRES_SOURCE_VERIFICATION | story chưa duyệt |
| ngo-phat-loc / 2 | phat-loc-cac-nhanh-ngo | P07 có báo chí mô tả; P08 chưa survey lối nối | MAJOR_REWRITE | supporting waypoint |

Tổng: 8 MINOR_REVISION, 3 MAJOR_REWRITE, 4 MISSING_CONTENT, 2 REQUIRES_SOURCE_VERIFICATION, 0 KEEP toàn bản. Các đoạn/facts đúng được giữ theo editorial review, không kết luận mọi node đều sai.

## 4. Findings quan trọng và đối chiếu audit cũ

### P1 — Nội dung cần quyết định trước exact draft

1. **Tiên Hạ nhầm chủ thể quê quán:** `data/localized/ngo-phat-loc.vi.json:113` và EN N.story gắn quê Thái Bình với Nguyễn Trung Ngạn. [Đại biểu Nhân dân](https://daibieunhandan.vn/den-tien-ha-va-danh-nhan-nguyen-trung-ngan-10024624.html) ghi quê Thổ Hoàng/Hưng Yên; [VietnamPlus](https://mega.vietnamplus.vn/nham-nhi-ha-noi-trong-long-ngo-phat-loc-6637.html) kể cộng đồng khác/người họ Bùi. CONFLICTING; đề xuất tách hai chủ thể, không thay bằng suy đoán.
2. **Nguyễn Siêu/1886:** story tại line 113 và alleyStory tại line 23 VI cùng EN lấy đúng câu trong [SGGP 2006](https://www.sggp.org.vn/ngo-phat-loc-dac-trung-ngo-ha-noi-post152339.html), nhưng [Bảo tàng Lịch sử quốc gia](https://baotanglichsuquocgia.vn/vi/Articles/3098/17777/nguyen-sieu-mot-danh-nhan-van-hoa-cua-thang-long-ha-noi-1799-1872.html) ghi ông mất 1872. Suy luận có conflict tác giả–ngày soạn; chưa biết là khắc lại/gán nhầm/năm sai. Cần hồ sơ bia, không tự sửa con số.
3. **Trung Yên:** [QĐ 07/2008](https://vanban.chinhphu.vn/default.aspx?docid=78382&pageid=27160) dùng tên Đền; [VOV2 2023](https://vov2.vov.vn/van-hoa-giai-tri/le-gan-bien-cong-trinh-dinh-trung-yen-43075.vov2) nối với tên đình số 10 và cùng quyết định. Audit nghi certainty là đúng; không còn lý do coi ranking hoàn toàn không có chứng cứ. Story phủ nhận xác minh trong khi intro/caption/guide khẳng định phải hòa giải, không đổi tên toàn cục. Alias Thanh Cẩm/chức Ngự sử chưa đủ nguồn mở được.
4. **Thanh Hà:** field “bia dựng 1430” trong `ngo-gach.vi.json:67` và intro/caption/EN chưa được xác nhận đủ về **vật thể hiện còn**. [Cổng địa phương](https://hoankiem360.tourism.vn/chi_tiet_di_tich_lich_su/dinh-thanh-ha.html) mô tả bản khắc lại bia Lê; URL “oldest stele” cũ không mở được. Không suy ra claim false hoặc đồng nhất năm văn bản với năm dựng đình.
5. **Self-contained và content gap:** `cam-chi-den-vong-tien` vẫn giao câu chuyện cho Tạm Thương, không đạt mở độc lập. Ba café/Hương Trà phần lớn là lời báo thiếu research; Hương Trà summary/guide lại chắc hơn story. Cần role approval, không bịa chuyện cho đủ 17 story.

### P2 — Attribution, parity và guide

Đếm bước từ geometry, số mét 146/200, giờ/địa chỉ/menu từ nguồn cũ, certainty nhạy cảm quán Nhàn, alias Yên Thái, caveat Cô Tư Hồng và ngày lễ Thanh Hà VI/EN cần chỉnh. Không gọi số mét khác nhau là lỗi chắc chắn khi chưa biết ranh giới đo. Không gọi di tích ngoài ngõ thành nằm trong ngõ.

Đính chính giới hạn audit trước: [phóng sự Thanh Niên 2018](https://thanhnien.vn/lang-thang-ngo-ngach-ha-noi-ky-2-phat-loc-doi-doi-nho-sat-ho-guom-185753321.htm) thực sự mô tả nhánh hội tụ ở đền; không thể kết luận không có nguồn nào. Tuy nhiên điều đó không nghiệm thu lối đi/Mã Mây/GPS năm 2026. [Website Ta Cà Phê](https://www.tacaphe.vn/) bổ sung chứng cứ chi nhánh 4A, không tự cấp heritage story. Ngõ Gạch thiếu alleyStory/guide/intro audio là quyết định/gap sản phẩm cần chốt, không lỗi buộc sinh nội dung cho bằng các collection khác.

## 5. Kiểm tra thực tế trong Phase 2A

| Kiểm tra/lệnh | Kết quả thực tế | Không chứng minh |
| --- | --- | --- |
| `git branch --show-current`, `git rev-parse HEAD`, `git status --short`, `git diff --numstat` | Baseline/11 WIP đã nhận diện, giữ nguyên | Không phải worktree sạch |
| Node read-only import `canonicalDatasetJson`, SHA256 10 JSON | 10/10 revisions khớp pins; IDs/order/start và QA đã đối chiếu | Không xác minh lịch sử hay field |
| `node --test mobile/tests/alleyContent.test.mjs mobile/tests/fourAlleyDatasets.test.mjs mobile/tests/nodeStoryVoiceCatalogue.test.mjs` | **12 PASS, 0 FAIL, 0 SKIP, 0 cancelled**; 34 story entries resolve, source/text/revision/audio manifest assertions đạt | Test có tên “source-checked” chỉ kiểm contract/khớp source cũ, không thay historical review/human listening |
| `git diff --check` | PASS, exit 0 | Git không kiểm whitespace file untracked; bốn tài liệu mới được kiểm riêng |
| Node read-only Markdown checks: UTF-8, trailing whitespace, final newline, table columns, relative links, unique claim IDs/status và 17-node coverage | **4/4 tài liệu PASS**, 62 IDs duy nhất, cả bốn file có đủ 17 node IDs | Không thay thế reviewer nội dung hoặc kiểm chứng mọi URL ngoài |
| Fresh full mobile/backend/HTTP/native/listening | Không chạy lại trong doc-only research này | 405/32/15 là kết quả được báo cáo ở Phase 1B, không đổi thành fresh evidence |

Trước ghi deliverables đã lấy aggregate SHA256 của 646 tracked files hiện có dưới `mobile`, `data`, `backend`, `tools`, theo tên file sorted + NUL + bytes. Sau tạo tài liệu kiểm lại bằng cùng thuật toán: `b9d7657180a9fb6cc7181dd7351f322b1559f69ff1ef737b369d509cfe70fea3`, bằng snapshot trước. Phạm vi này bao gồm tracked app/data/media/tools, không phải fingerprint mọi ignored/untracked file. Không đọc env hoặc xóa cache để kiểm. Diff numstat của 11 WIP không thay đổi.

## 6. Voice impact, không thực thi

Hiện có 34 node-story và 8 intro tracks liên quan, không intro track Gạch. Tất cả là inventory để so delta, **không phải 42 clip cần regenerate**. Spoken text đổi → textHash đổi → không phát clip cũ. Chỉ guide/evidence đổi cũng đổi whole-dataset revision và có thể khiến mọi clip locale không resolve; NK-009 phải kiểm reusable bytes và repin candidate theo guard, không nới assertion.

Kế hoạch giữ ElevenLabs / VI Nhật Phong / EN Talia theo người dùng, không đọc key/Voice ID trong env, không chạy generator/provider, không sửa manifest/catalogue hoặc audio. Khoảng credit do người dùng nêu không được kiểm lại và không lập cost estimate. Không thay `humanApproved`, `listened`, content classification/review hay field status. Chưa có exact approved wording nên chưa có số clip thay đổi hoặc quyền paid TTS.

## 7. Việc cần anh quyết / việc anh tự làm

**Cần người dùng quyết:** D1–D7 chi tiết và hệ quả ở [rewrite plan, mục 4](../plans/NGO_KE_CONTENT_REWRITE_PLAN.md#4-việc-cần-anh-quyết--việc-anh-tự-làm). Quyết định ưu tiên: tên thường gọi/pháp lý Trung Yên; chờ hồ sơ hay tạm không dùng hai niên đại bia tranh chấp; duyệt 5 waypoint/supporting-waypoint; giữ điểm liên quan ngoài ngõ và hai story Vọng Tiên tự chứa; xử lý review quán/giờ tham khảo; Gạch có cần thêm loại nội dung; phạm vi Phase 2C/NK-006. Chưa chốt thì từng field/node tương ứng pending, không tự bỏ qua gate.

**Cần người dùng tự làm/ủy quyền:** xin hồ sơ/thác bản từ bên quản lý hoặc người có chuyên môn; chọn reviewer nội dung/song ngữ; xác nhận địa chỉ/giờ/tiếp cận nếu muốn guide hiện hành. Chưa có thì giữ unknown hoặc duyệt không dùng claim, không gắn verified. **[ngoài plan]** thuê chuyên gia/nghiên cứu Hán Nôm trả phí chỉ khi anh muốn mở scope và duyệt chi phí; chưa làm không tạo nghĩa vụ chi tiền ở Phase 2A. Không cần gửi API key/mua credit.

Các quyết định còn mở được ghi ngay trong bốn deliverables này; không cập nhật MEMORY/AGENTS vì yêu cầu hiện hành chỉ cho ghi bốn tài liệu content/handoff, không ghi đè trạng thái của đợt song song hoặc tự nâng gate.

## 8. Files created và Phase 2C entry criteria

Chỉ tạo bốn file:

1. [NGO_KE_CLAIM_LEDGER.md](../content/NGO_KE_CLAIM_LEDGER.md) — source register, 62 claim families, date/status/conflict/handling/approval.
2. [NGO_KE_EDITORIAL_REVIEW.md](../content/NGO_KE_EDITORIAL_REVIEW.md) — 17 node, tám chiều, vai trò đề xuất và gaps cấp ngõ.
3. [NGO_KE_CONTENT_REWRITE_PLAN.md](../plans/NGO_KE_CONTENT_REWRITE_PLAN.md) — 17-node batches, D1–D7, approval chain, revision/voice delta, regression/NK-006 criteria.
4. [NGO_KE_PHASE2A_REPORT.md](NGO_KE_PHASE2A_REPORT.md) — báo cáo này.

Không sửa ứng dụng/JSON/Q&A/IDs/order/revision/ảnh/GPS/audio/UI design; không paid APIs, không dispatch Claude/Luna/Antigravity, không git mutation/deploy, không xóa untracked.

Để mở Phase 2C (nếu anh xác nhận là NK-006): có disposition từng claim rủi ro cần dùng, nguồn bổ sung hoặc phương án không dùng được duyệt; role/glossary/ngoài-ngõ chốt; exact candidate VI/EN được human review; allowlist content/tests/handoff và owner được xác nhận; snapshot immutable fields và candidate revision→voice delta được lead review trước tích hợp. Paid TTS/listening/native có gate riêng. **Chưa tự bắt đầu NK-006 hoặc phase voice.**
