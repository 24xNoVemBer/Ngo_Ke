# Ngõ Kể — Kế hoạch biên tập VI/EN sau Phase 2A

Ngày: 23/10/2026. Input: [claim ledger](../content/NGO_KE_CLAIM_LEDGER.md), [editorial review](../content/NGO_KE_EDITORIAL_REVIEW.md), [backlog NK-005/006/009/010](NGO_KE_EXECUTION_BACKLOG.md).

Trạng thái: **PROPOSED — NOT AUTHORIZED FOR INTEGRATION OR TTS**. Phase 2A chỉ mở NK-005 và bốn tài liệu. Tên “Phase 2C” trong yêu cầu handoff được hiểu là gate biên tập/tích hợp tương lai; backlog chưa định nghĩa một Phase 2C riêng. Cần người dùng xác nhận mapping/scope trước mở việc; không dùng tên phase để mở rộng quyền.

## 1. Hợp đồng không đổi

Giữ 5 collection, 17 node IDs, `order`, `startNodeId`, Q&A rỗng, source isolation Demo/Live, geometry/coordinates/visitMinutes, images/provenance, voice provider/IDs và approval metadata. Không thay role bằng schema mới, không đổi matcher, recommendation, navigation hoặc UI. Waypoint ở tài liệu này là vai trò biên tập đề xuất, không phải enum được quyền thêm.

Không search-replace Đình→Đền toàn bộ dữ liệu; không tự sửa năm 1886 thành năm phỏng đoán; không đồng nhất quê Nguyễn Trung Ngạn với làng người di cư. Không sửa nguồn gốc chỉ để khớp đoạn audio đã có. Không tạo Q&A hoặc dùng generated answer để lấp thiếu story.

## 2. Danh sách tác nghiệp 17 node

Mỗi hàng áp dụng cả VI/EN và các surface liên quan được ledger chỉ ra. “Giữ” là giữ fact/trục có nguồn, không nghĩa đã duyệt nguyên văn.

| Thứ tự thực tế / node ID | Giữ | Chỉnh nhỏ / viết lại / thiếu nguồn | Gate, batch ưu tiên |
| --- | --- | --- | --- |
| G1 `ngo-gach-ca-phe-no1` | Label/mốc số 1 có caveat | MISSING_CONTENT; đề xuất text waypoint, không lịch sử quán | D3, field identity; batch C |
| G2 `ngo-gach-ta-ca-phe-4` | Ta Cà Phê 4 tại 4A theo S25 | MISSING_CONTENT cho story; bỏ đếm bước chưa khảo sát; không tuyên bố hoàn toàn thiếu nguồn | D3, G04–G05; C |
| G3 `ngo-gach-dinh-thanh-ha` | Số 10, thờ tự, truyền thuyết có nhãn | REQUIRES_SOURCE_VERIFICATION: văn bản bia/khắc lại/1430/superlative; đồng mức ngày lễ | D2, G06–G09; A |
| G4 `ngo-gach-cafe-20` | Label/mốc vị trí có caveat | MISSING_CONTENT; đề xuất waypoint, không tự gán lịch sử/thực đơn | D3, field identity; C |
| G5 `ngo-gach-chua-cau-dong` | Nhận diện/tượng/nguyên nhân chưa rõ theo báo | MINOR_REVISION: attribution niên đại, điểm liên quan ngoài ngõ, giảm meta research | D4, G11–G12; B |
| T1 `trung-yen-pho-suong` | Lời giải tên có mốc bài 2021 | MINOR_REVISION: giảm ranking/chuyển chặng, không hứa quán đang mở | D5, T07/T12; B |
| T2 `trung-yen-dinh-trung-yen` | Liên hệ đúng quyết định 2008; số 10 theo S02 | MAJOR_REWRITE: bỏ phủ nhận thiếu xác minh đã lỗi thời; alias/chức cụ thể pending | D1, T03–T06; A |
| T3 `trung-yen-bun-ca-sam-cay-si` | Sâm/cây si và mô tả món có attribution | MINOR_REVISION: chưa dùng chuyện chuyển từ chợ khi thiếu nguồn; gắn nguồn S07 đúng claim | T08–T09, D5; B |
| T4 `trung-yen-bun-ngan-nhan` | Nhận diện và văn hóa ẩm thực | MINOR_REVISION: duyệt bỏ review phục vụ/queue khỏi narration, đồng bộ caption | D5, T10; B |
| T5 `trung-yen-pho-ga-huong-tra` | ID/label kỹ thuật, chưa bảo chứng identity | MISSING_CONTENT: không gán phở gà chung cho quán; thống nhất unknown menu/giờ | D3/D5, T11; C |
| A1 `tam-thuong-dinh-yen-thai` | Thờ Ỷ Lan/số 8/nguồn địa phương | MINOR_REVISION: alias pending, không thêm năm lập/số sắc; rút liệt kê | A02–A04; B |
| A2 `tam-thuong-den-vong-tien` | Legend có nhãn/thờ Mẫu ở mức nguồn | MINOR_REVISION: supporting place ngoài ngõ; location pending; tự chứa | D4, A05–A07; B |
| C1 `cam-chi-khong-gian-nghe-thuat` | Dự án văn hóa đương đại/cổng lấy cảm hứng | MINOR_REVISION: không cổng cổ; đúng source gốc/mirror, tránh lặp intro | C04–C05; B |
| C2 `cam-chi-ngo-hoi-vu` | Ký ức địa phương và ba phố theo bài báo | MINOR_REVISION: Cô Tư Hồng có nhãn lời truyền; không “không có nguồn viết” tuyệt đối | C06–C07, D4; B |
| C3 `cam-chi-den-vong-tien` | Fact sheet cùng physical temple với A2 | MAJOR_REWRITE: không yêu cầu nghe Tạm Thương; bỏ etymology lạc trọng tâm | D4, C08; A |
| P1 `phat-loc-den-tien-ha` | Thờ Nguyễn Trung Ngạn/danh thần Trần có nguồn | REQUIRES_SOURCE_VERIFICATION: tách quê quán; 1886/tác giả; địa chỉ 46/48 | D2, P03–P06; A đầu tiên |
| P2 `phat-loc-cac-nhanh-ngo` | Mô tả đời sống từ phóng sự 2018 | MAJOR_REWRITE: cập nhật phạm vi nguồn về hội tụ, không chỉ lối riêng Mã Mây | D3/D4, P07–P08; C |

Batch A xử lý rủi ro facts/cross-collection trước; B giữ chất liệu và chỉnh attribution; C phụ thuộc role/identity. Đây là thứ tự xử lý, không phải đổi thứ tự node. Các surface cấp ngõ phải cùng fact sheet: Trung Yên certainty/tên, Phất Lộc migration/bia, Tạm Thương đối tượng thóc chuyển kho trong EN, Cấm Chỉ legend/2000s, Ngõ Gạch 1430/độ dài và quyết định cấu trúc.

## 3. Quy trình và artefact gate

1. **Fact-check:** chốt từng claim ở ledger; bổ sung hồ sơ/thác bản/nguồn mở được, giữ ngày/attribution. Nguồn pending không tự chuyển VERIFIED nếu agent chỉ xem title. Owner đề xuất Sol; reviewer chuyên môn do người dùng chọn, không tự dispatch.
2. **Approval:** H1 chọn giữ, quy nguồn/legend, tạm không dùng, hoặc chờ thêm nguồn cho mỗi claim nhạy cảm; ký role và ranh giới ngoài ngõ. Hồ sơ unresolved có thể không chặn toàn bộ nháp nếu H1 duyệt rõ việc không sử dụng claim đó; không âm thầm bỏ.
3. **VI Draft:** viết tài liệu candidate riêng theo batch, một trục/đoạn; facts đã duyệt, câu đọc tự nhiên. Không ghi JSON. Owner đề xuất Sol; không giao máy tự bổ sung facts.
4. **EN Adaptation:** chuyển cùng fact sheet và mức chắc chắn, không chỉ dịch nguyên lỗi; kiểm glossary tên riêng/di tích/món/ngôi kể. Có reviewer song ngữ; không đổi spelling để ép phát âm khi chưa duyệt.
5. **Human Review:** duyệt cặp VI/EN cùng intro/story/summary/caption/alleyStory/guide, đọc thành tiếng và chốt exact spoken text. Approval nội dung không đồng nghĩa listened audio.
6. **Data Integration — NK-006 khi được mở:** Luna có thể nhập đúng prose đã duyệt trong phân vùng file; Sol review diff/revision, một writer mỗi file. Tạo candidate + old/new revision và voice delta để lead review **trước** tích hợp thống nhất, không ship JSON mới với pins cũ.
7. **Voice Delta — NK-009, paid generation NK-010 riêng:** xác định reusable/changed/missing, kiểm nguyên bytes/voice/kind/node/locale. Chỉ khi được duyệt batch TTS cụ thể mới được tạo audio. Không tự khởi động phase voice vì content đã được duyệt.

Tư liệu/batch riêng có thể nghiên cứu song song; VI→EN và candidate→voice-delta là bàn giao tuần tự. Không cùng sửa dataset/catalogue/revision trong hai worker. UI Design Revision của Antigravity độc lập; chỉ trao đổi terminology/role đã duyệt, không thay tài liệu thiết kế của họ.

## 4. Việc cần anh quyết / việc anh tự làm

| Gate | Cần người dùng quyết — câu hỏi và đề xuất | Nếu chưa chốt |
| --- | --- | --- |
| D1 | Dùng tên thường gọi “Đình Trung Yên”, kèm chú thích tên pháp lý “Đền Trung Yên”/QĐ 07/2008 trong đọc thêm? Đề xuất có, giữ ID hiện hành; chưa dùng Thanh Cẩm/Ngự sử khi thiếu nguồn | Chưa chốt wording/glossary của mọi surface VI/EN Trung Yên |
| D2 | Với 1886/tác giả và bia Thanh Hà 1430, chờ hồ sơ hay duyệt tạm không dùng niên đại tranh chấp trong bản tương lai? Đề xuất tạm không dùng claim chắc chắn, vẫn lưu conflict trong ledger; tách quê Nguyễn Trung Ngạn khỏi tên làng di cư | Tiên Hạ/Thanh Hà không thể duyệt exact spoken text |
| D3 | Cho ba café, Hương Trà và nhánh Phất Lộc vai trò waypoint/supporting waypoint hay bắt buộc story có research mới? Đề xuất waypoint với nhận diện đúng mức evidence; không xóa ID | Năm node đó pending biên tập; không tự downgrade role trong schema |
| D4 | Giữ Cầu Đông/Vọng Tiên/Hội Vũ là điểm liên quan ngoài ngõ và cho hai bản Vọng Tiên tự chứa? Đề xuất giữ, nêu ranh giới rõ, không dẫn đường | Chưa chốt trục kể và quan hệ collection |
| D5 | Cho bỏ nhận xét phục vụ/queue/xếp hạng khỏi narration; các giờ quán chuyển thành thông tin chờ xác minh thay lời hứa? Đề xuất có, giữ hồ sơ nguồn cũ trong ledger | Chưa duyệt nội dung danh tiếng/guide thực dụng |
| D6 | Ngõ Gạch có cần thêm alleyStory/guide/intro audio không? Đề xuất chưa bổ sung ở NK-006 chỉ để đủ cấu trúc; nếu muốn, duyệt scope/source/voice riêng | Không tạo ba loại nội dung/asset ngoài scope |
| D7 | “Phase 2C” có phải đợt mở NK-006 theo candidate/delta gate này? Đề xuất xác nhận scope trước khi giao, quyền audio vẫn tách NK-010 | Không tự bắt đầu tích hợp hoặc TTS |

Cần người dùng tự làm/ủy quyền người có thẩm quyền:

- Cung cấp hoặc xin thác bản/bản dịch có xuất xứ của bia Tiên Hạ, phân rõ soạn/khắc/trùng tu; hồ sơ bia Thanh Hà. Nếu chưa có, đi theo phương án loại claim đã được H1 chốt, không tự “sửa năm”. Đây là bổ sung evidence phục vụ nội dung, không phải yêu cầu người dùng tự viết bản thảo.
- Xác nhận tại di tích: tên/biển/số nhà, điều kiện tiếp cận; tại quán: nhận diện, menu/giờ/ngày xác nhận nếu muốn guide hiện hành. GPS/QR/photo intake nếu sau này có phải qua field workflow riêng, không tự nhập vào NK-006. Chưa khảo sát thì giữ field-unverified, không chặn nháp có caveat đã duyệt.
- Chọn người duyệt chuyên môn và người đọc song ngữ; trực tiếp duyệt exact content khi có candidate. Nếu không duyệt, chỉ tồn tại bản nháp.
- **[ngoài plan]** Nếu muốn mở rộng thành nghiên cứu Hán Nôm chuyên sâu/thuê chuyên gia trả phí, liên hệ/lấy phép và duyệt ngân sách riêng. Phase 2A không cấp quyền chi tiền; chưa làm thì để conflict mở hoặc không dùng claim.

Không cần cung cấp API key, Voice IDs hay mua credit để hoàn tất Phase 2A. Không yêu cầu nghe lại audio chưa được tạo; listening sẽ là gate của batch tương lai nếu được mở.

## 5. Tiêu chí biên tập VI/EN

- Fact sheet một nguồn chuẩn cho mọi surface. Caption ngắn không được làm mất “tương truyền/chưa rõ” khiến certainty mạnh hơn story.
- Địa danh/nhân vật không đổi chủ thể khi dùng đại từ: quê dân làng ≠ quê thần được thờ; “it was moved” phải rõ thóc chuyển kho.
- Legend bắt đầu bằng nhãn tự nhiên và giữ nhãn trong EN; không gắn năm/chiến công vua từ suy đoán. Giả thuyết tên ngõ không thành nguyên nhân duy nhất.
- Không đọc danh sách URL, tình trạng nghiên cứu lặp hoặc caveat dài như báo cáo. Giữ caveat ngắn cần thiết, đưa provenance chi tiết vào surface đọc phù hợp theo schema sẵn có.
- Không kể như đã có mặt/ngửi/nghe một cảnh thực tế khi chỉ đọc báo; tránh “đang mở”, “hãy rẽ”, số bước, giờ/giá hoặc hứa tiếp cận.
- Mỗi node hiểu được khi mở trực tiếp/voice command; không cần collection khác hay node trước. Hai Vọng Tiên chung facts nhưng mỗi đoạn đủ nhận diện.
- Không đặt mục tiêu số chữ/giây đồng đều buộc thêm filler. Chọn độ dài sau duyệt role, thử đọc thủ công; không dùng TTS trả phí để thử nhiều bản nháp.
- Summary/caption/guide thực dụng không chứa menu/giờ chắc chắn hơn nguồn. Mọi claim được giữ phải có source→field và ngày, không chỉ bibliography toàn collection.

## 6. Hash/revision/voice impact contract

Source hiện hành: `mobile/src/data/canonicalJson.ts`; `mobile/src/voice/localizedCatalog.ts:38`; `mobile/src/voice/useVoiceSession.ts:461`; `tools/voice/generate_node_stories.py:58`; `tools/voice/generate_alleys_intro.py:48`.

| Thay đổi dự kiến | Source hashes / dataset revision | Spoken textHash / audio |
| --- | --- | --- |
| Chỉ bốn tài liệu Phase 2A | Không đổi bất kỳ runtime hash/revision nào | Không đổi catalogue/MP3 |
| Checkout CRLF↔LF, JSON ngoài string không đổi | Raw bytes hash có thể khác; node-story sourceDataSha256 chuẩn hóa CRLF→LF không đổi. Canonical parsed JSON revision không đổi | Exact spoken string không đổi; không regenerate |
| Sửa guide/summary/caption/evidence hoặc metadata trong dataset | Canonical whole-dataset revision đổi dù không phải field đọc; normalized source hash cũng có thể đổi | Với catalogue năm ngõ đang xét, node-story đọc `N.story`, intro đọc `intro.text`: nếu hai field này không đổi thì textHash giữ. Cần kiểm scope cụ thể, không áp dụng mù cho catalogue legacy có caption/answer tracks |
| Sửa `N.story` hoặc `intro.text` kể cả dấu/case/khoảng trắng trong string | Revision/source hashes đổi | SHA256 UTF-8 exact string đổi; audio cũ không còn hợp lệ cho text mới, không repin chỉ vì ID giống |
| Đổi field khác nhưng story giữ nguyên | Revision mới làm lookup catalogue cũ không resolve vì revision guard | NK-009 có thể chuẩn bị reuse **đúng MP3 bytes** sau kiểm textHash/kind/node/voice/audio SHA và candidate revision; không phát sinh paid TTS chỉ để đổi revision |

Không Unicode-normalize/trim nội dung spoken để “tái dùng” clip; serializer canonical không tự normalize string. Bare CR ở source bị node-story pipeline từ chối. Chính sách raw vs normalized của NK-001 không tự áp cho mọi generator: intro generator hiện vẫn có raw sourceDataSha256, phải kiểm preflight riêng, không chạy để thử trong Phase 2A.

Inventory liên quan: 34 node-story tracks (17×2) và 8 intro tracks (bốn ngõ×2); Ngõ Gạch chưa có intro track. Đó là phạm vi **kiểm delta**, không phải số clip sẽ tạo lại. Chưa có exact approved text nên chưa thể kết luận bao nhiêu clip đổi. Sửa một guide có thể ảnh hưởng khả năng resolve cả locale, kể cả clip không đổi chữ.

Nhật Phong (VI), Talia (EN), ElevenLabs giữ theo người dùng; không đọc env/đổi Voice ID. Khoảng 130.000 credit chỉ là bối cảnh người dùng cung cấp, không phải số dư đã kiểm hay quyền sử dụng. Không dự toán tiền/credit khi chưa biết model/rate/batch đã duyệt. Text types có thể cần TTS delta: node story và intro thay exact spoken text; không mặc nhiên tạo audio cho alleyStory/guide/caption/waypoint.

Candidate NK-009 cần mỗi hàng: collection/locale/contentId/node/kind, old/new textHash, old/new revision, source hashes theo đúng policy, path/SHA audio cũ, voice/model, reuse/regenerate/missing, lý do, rollout nếu chưa có audio, và human/listening status thực. Changed text không phát clip cũ; unchanged text không mất audio ngoài delta đã được duyệt. Không sửa guard để đạt âm thanh.

## 7. Regression bắt buộc trước nghiệm thu NK-006

| Nhóm | Kiểm tra cần có | Bằng chứng/negative case |
| --- | --- | --- |
| Identity/structure | Đúng 5 collection, 17 nodes; IDs/order/start/QA/coords/geometry/tags/visitMinutes và ba collection cũ không đổi ngoài scope cụ thể | Snapshot/protected-field diff; cặp V2 VI/EN pass, không thêm Q&A vì thiếu nội dung |
| Facts/certainty | Source-to-field map được duyệt; Trung Yên legal/common name; quê Nguyễn Trung Ngạn; không “soạn 1886” khi chưa resolve; bia Thanh Hà phân biệt lớp niên đại | Semantic review/assertion cho forbidden incorrect claims; không sửa expected chỉ để giữ bản cũ sai |
| Locales | Cùng chủ thể, niên đại, nhãn legend/caveat, menu identity; hai Vọng Tiên self-contained | Đọc độc lập EN/VI; không cross-collection prerequisite hoặc alias drift |
| Revisions | Tính canonical hash bằng serializer hiện hành; chỉ pins của dataset thay được cập nhật | Đổi một ký tự thật phải đổi hash; LF/CRLF tương đương ngoài string đúng NK-001 |
| Voice | Tất cả 34 story/8 intro slots được phân delta; changed spoken text fail closed, unchanged clips reuse đúng bytes | Wrong node/kind/locale/revision/textHash rejected; audio SHA so baseline; không clip Demo/collection khác thế chỗ |
| UI/data boundary | Home intro/story/guide, direct node open, collection/locale/source switching; voice commands vẫn chạy khi qa=[] | Regression Phase 1B/old alleys; không đưa dataset Demo vào Live; không autoplay sai scope |
| Human/native | Đọc chữ lớn, caption/legend không mất caveat; nghe clip có thay đổi sau batch được phép; phát/đổi màn/dừng/Back trên native | Host green không thay Android/iOS hoặc human pronunciation/QC; ghi pending riêng |

Các lệnh host hiện có để chạy trong scope tương lai (không generator):

```powershell
node --test mobile/tests/alleyContent.test.mjs mobile/tests/fourAlleyDatasets.test.mjs mobile/tests/nodeStoryVoiceCatalogue.test.mjs
npm test --prefix mobile
npm run typecheck --prefix mobile
npm run lint --prefix mobile -- --no-cache
git diff --check
```

Cập nhật content tests/handoff phải theo approval mới, không nới schema/guards hay xóa assertion. `fourAlleyDatasets.test.mjs` đang so với bản biên soạn cũ: nếu nguồn biên soạn được duyệt thay, cần quyết định source-of-truth và allowlist tài liệu/handoff trước, không sửa kỳ vọng âm thầm. Backlog NK-006 chưa cho sửa catalogue; NK-009/allowlist riêng phải được mở nếu repin. Không tự mở rộng allowlist vì tests cần cập nhật.

## 8. Acceptance criteria và entry gate tương lai

NK-006 chỉ bắt đầu sau quyền triển khai rõ ràng, D1–D7 được disposition theo phạm vi cần dùng, claim conflict có nguồn giải hoặc quyết định không dùng/ghi nhãn cụ thể. Phải có exact candidate VI/EN human-approved; role/range ngoài ngõ rõ; immutable fields snapshot và old/new revision–voice delta được lead review. Nếu còn claim chờ nguồn trong draft, phải chỉ ra field không được tích hợp, không gắn nhãn “đã xác minh” cả collection.

Exit NK-006: mọi field thay thuộc allowlist và approval; stories tự chứa; facts/legend/certainty nhất quán các surface; không IDs/order/Q&A/physical metadata drift; pair validation/full host regression đúng số thực; reusable audio tiếp tục resolve trong candidate đã tích hợp thống nhất, changed-text audio fail closed theo rollout được duyệt. Report riêng phần host/native/listening/rights chưa làm. Không tự cấp content/live approval hoặc humanApproved/listened.

Hoàn tất NK-006 không mở paid TTS. NK-010 vẫn cần danh sách clip, exact text, voice/model, preflight/reserve/rate, ngân sách và quyền gọi API riêng. Dừng ở handoff được duyệt, không tự sang phase voice.
