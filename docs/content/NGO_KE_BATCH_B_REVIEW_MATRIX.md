# Ngõ Kể — Batch B Content Review Matrix

Ngày: **24/10/2026**. Baseline HEAD `4af64c49a4ada47f952ddf76c35adfb90f826224`. Review chỉ đọc runtime; không tích hợp chữ. Candidate B-v1 ở [VI/EN draft](NGO_KE_BATCH_B_VI_EN_DRAFT.md); source register và trace theo câu nằm tại đó. [Decision Pack D1–D7](NGO_KE_CONTENT_DECISION_PACK.md) và [Batch A](NGO_KE_BATCH_A_VI_EN_DRAFT.md) không bị sửa.

**Mọi candidate: `DRAFT_NOT_APPROVED`. Mọi D1–D7: `PENDING_HUMAN_APPROVAL`.** “Đủ” trong ma trận nghĩa là có bản kể tự chứa và trace để human xem, không phải facts, phát âm, native UI hoặc audio đã nghiệm thu.

## 1. Tám node × VI/EN

Read-aloud dưới đây là **review văn bản**, chưa có native/TTS/listening test. Historical risk được đánh giá trong phạm vi câu đã đề xuất, không phủ cho toàn dataset. “Duyệt exact” gồm field KEEP muốn đưa vào approval pack; không để agent tự sửa chữ sau một approval hướng chung.

| Node / locale | Story completeness | Source support | Certainty consistency | Narrative coherence | Read-aloud suitability | Repetition risk | Historical risk | D dependency | Approval required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ngo-gach-chua-cau-dong / VI | Đủ, mở độc lập | G11/G12, S24; PARTIALLY_SUPPORTED | Nhận diện qua báo, gốc tích để ngỏ; không niên đại mới | Tượng → câu hỏi ký ức | Một nguồn/năm, không danh mục nghiên cứu; tên cần đọc thử | Thấp, không lặp bia Thanh Hà | Trung bình: attribution không thay giám định | D4/D7; giữ ranh giới D6 | Exact story/caption, omission, summary KEEP |
| ngo-gach-chua-cau-dong / EN | Đủ, cùng trục VI | Cùng S24 | “identified as”, không assertion vật thể độc lập | Như VI | Review người EN đối với Trần Thủ Độ/Trần Thị Dung | Thấp | Như VI; name có dấu chỉ display | D4/D7, D6 boundary | Exact story/caption/name EN, summary KEEP |
| trung-yen-pho-suong / VI | Đủ, không cần node trước | T07, S06 + bản đăng lại 2021 | Ước mong được báo kể, không lời bảo đảm | Tâm ý trong tên | Ba câu, không đọc tuổi quán/danh sách | Vừa: motif tên cần phân biệt Sâm | Thấp–trung bình: ký ức người chủ | D5/D7 | Exact 3 fields, cách dùng năm nguồn, omission |
| trung-yen-pho-suong / EN | Đủ | Như VI, không hai corroborations | Hope, không taste guarantee | Wish behind name | Tên nguyên gốc, không dịch tên quán | Như VI, không chơi chữ Sướng/Nhàn | Như VI | D5/D7 | Exact 3 fields, semantic parity |
| trung-yen-bun-ca-sam-cay-si / VI | Đủ cho chuyện tên | T08, S07; T09 không dùng như menu | Lời người nhà, không xác minh toàn lịch sử | Tên người + dấu nhớ cây | Một attribution; caveat migration ở hồ sơ, không nhồi spoken | Vừa: cùng tên nhưng khác trục Phở | Trung bình: oral account qua báo | D5/D7 | Exact 3 fields, omission Hàng Bè/tên đùa, evidence append tương lai |
| trung-yen-bun-ca-sam-cay-si / EN | Đủ | Như VI | “family account”, không botanical species | Family memory | “si tree” cần người EN đọc hiểu; không respell | Như VI | Như VI; không đảo tên món | D5/D7 | Exact 3 fields, si tree và glossary |
| trung-yen-bun-ngan-nhan / VI | Đủ có chủ ý ngắn; chuyện sâu thiếu nguồn | Phần món/identity của S06, S05; T10 còn PARTIALLY_SUPPORTED | Mô tả có năm, bỏ service/ranking | Món ăn trong đời sống thường ngày | Ba câu, không kéo dài để đủ track | Thấp: không thêm motif tên quán thứ ba | Thấp trong bản giới hạn; cao nếu quay lại service narrative | D5/D7 | Bản ngắn hoặc nghiên cứu thêm; exact 3 fields/omissions |
| trung-yen-bun-ngan-nhan / EN | Đủ, không thêm biography | Như VI | Dated description, không current menu | Dish → everyday city memory | “Muscovy duck” cần đọc thử | Thấp | Như VI | D5/D7 | Exact 3 fields, tên món, không thêm quality promise |
| tam-thuong-dinh-yen-thai / VI | Đủ; giữ di tích chính | A02 VERIFIED, S08; không chọn 7/10 sắc | Worship có nguồn; reflection không phải chronology | Tưởng nhớ qua tín ngưỡng | Một địa chỉ/nhân danh, không list hiện vật | Thấp so intro tên kho; trùng thờ tự là identity cần thiết | Thấp trong bản giới hạn; alias/năm lập còn pending | D7; D5 cho guide consistency | Story exact, display KEEP cần human đọc, omission A03/A04 |
| tam-thuong-dinh-yen-thai / EN | Đủ | Như VI; S11 không độc lập | Không nâng Imperial Consort thành chức khác | Như VI | Tên Ỷ Lan cần reader VI/EN; chưa QC voice | Thấp | Như VI | D7; D5 liên quan guide | Story exact, glossary, display KEEP |
| tam-thuong-den-vong-tien / VI | Đủ, mở trực tiếp hiểu | A05/A07 PARTIALLY_SUPPORTED; A06 LEGEND, S10 | Legend gắn cả mạch; thờ tự attributed | Đối thơ → biến mất → phân biệt đền | Bốn câu; tên nguồn một lần + “cùng nguồn” | Có facts chung Batch A nhưng opening khác, không cross-prerequisite | Trung bình: lầu/đền và địa điểm cần tách | D4/D7 | Exact 3 fields, fact sheet chung, omissions/address |
| tam-thuong-den-vong-tien / EN | Đủ | Như VI | “In the tale”, “not verified”; Mother Goddess source-scoped | Như VI | Ngọc Hồ/Lê Thánh Tông cần đọc thử | Chung facts có chủ ý, không copy story | Như VI | D4/D7 | Exact 3 fields, legend/parity |
| cam-chi-khong-gian-nghe-thuat / VI | Đủ | C04 PARTIALLY_SUPPORTED, S14 mirror; gốc pending | Bản tin 2025, không cam kết hiện trạng 2026 | Ký ức → sáng tạo đô thị | Không lặp chuyện tên ngõ, không citation list | Thấp sau lược C05 ở node | Trung bình: mirror, không hồ sơ dự án | D7 | Exact 3 fields; inspiration/current-state boundary; omission C05 |
| cam-chi-khong-gian-nghe-thuat / EN | Đủ | Như VI | Contemporary, inspired, not original | Như VI | “Đại Hưng” cần đọc thử, không thêm niên đại | Thấp | Như VI | D7 | Exact 3 fields, không authentic reconstruction |
| cam-chi-ngo-hoi-vu / VI | Đủ | C06 PARTIALLY_SUPPORTED, C07 LEGEND; S15 | Cô Tư Hồng trong lời tương truyền, không deeds/biography | Kiến trúc qua bài báo + lớp lời kể | Dài hơn food nodes có lý do; cần đọc thử câu mở | Vừa: không nhắc lại toàn intro khu vực | Trung bình: oral account/property sensitivity | D4/D7 | Exact 3 fields; human chọn giữ/lược C07 |
| cam-chi-ngo-hoi-vu / EN | Đủ | Như VI | Local tradition có attribution; không historical ownership | Như VI | Tên phố nhiều; kiểm nhịp câu, không ép thời lượng | Như VI | Như VI | D4/D7 | Exact 3 fields, attribution và geographic scope |

## 2. Hai Vọng Tiên — chung fact sheet, không cùng bài kể

| Điểm đối chiếu | Batch A: cam-chi-den-vong-tien | Batch B: tam-thuong-den-vong-tien | Disposition |
| --- | --- | --- | --- |
| Identity | Vọng Tiên Temple, supporting place ngoài Cấm Chỉ | Cùng đền, supporting place ngoài Tạm Thương | Giữ hai IDs/node order; không deduplicate JSON/audio theo tên |
| Worship | Theo S10; A07/C08 PARTIALLY_SUPPORTED | Theo cùng S10 | Cùng attribution, không tự thẩm định nghi lễ |
| Legend | A06 LEGEND, mở bằng câu hỏi tên | Cùng A06, mở bằng đối thơ | Không mâu thuẫn; chi tiết đối thơ có trong S10; không copy máy móc |
| Ngọc Hồ | Batch A ghi chùa Ngọc Hồ | Batch B nói Ngọc Hồ ở cả VI/EN | Là địa điểm trong truyện; S10 thân bài gọi Ngọc Hồ. Duyệt cách gọi cuối cùng đồng bộ, không đổi Batch A trong phiên này |
| Người/vai trò | Lê Thánh Tông, người con gái, lầu | Cùng các vai trò | Không nhập Lê Trang Tông/Chúa Chổm; không đồng nhất lầu truyền thuyết với đền hiện tại |
| Address/access | Không lấy 120B làm chắc chắn; guide candidate hạ độ chính xác | Node B không dùng số nhà; guide hiện vẫn cần disposition | A05 chưa thống nhất Hàng Bông/Cửa Nam. Human/field gate trước hướng dẫn đường |
| Self-contained | Không “đã kể ở Tạm Thương” | Không “xem lại Cấm Chỉ” | Hai story đủ nhận diện/legend/thờ tự; không ép người nghe đổi collection |
| Approval/voice | DRAFT_NOT_APPROVED | DRAFT_NOT_APPROVED | Không approval chéo; mỗi exact string/scoped slot cần review riêng |

Fact sheet này xác nhận **tính nhất quán của đề xuất**, không nâng S10 thành hồ sơ lịch sử gốc. D4/D7 còn pending.

## 3. Trung Yên food stories — ba trục khác nhau

| Node | Trục được đề xuất | Chủ ý lược | Consistency ngoài node |
| --- | --- | --- | --- |
| Phở Sướng | Mong muốn của người bán gửi trong tên | Tuổi quán tính lại, ranking, lời mời ăn rồi đi tiếp | Intro/alleyStory chưa phải approval hoạt động quán hôm nay |
| Sâm Cây Si | Tên người + cây trong lời người nhà | Tên đùa thành tính cách; migration chưa đối chiếu; “đặc sản” như menu hiện hành | Append S07 tương lai; S05 có lời kể Hàng Bè nhưng không tự nâng T08 |
| Nhàn | Món ăn và đời sống thường ngày; bản ngắn | “Nhàn mà chẳng nhàn”, phục vụ, hàng đợi, biography tự tạo | `guide.eat[2].dishes` vẫn có nhận xét phục vụ; node-only approval không đủ chốt toàn collection |

**Unresolved — không sửa runtime:** `guide.eat[0..3].hours`, addresses/menu và lời khen/chê cần D5 cùng kiểm tra có ngày; không dùng chữ “tham khảo” để tự chứng thực giờ. `intro.text` đoạn cuối và `alleyStory.paragraphs[2..3]` có mô tả hiện tại/tương đối thời gian: đề xuất gắn thời điểm nguồn hoặc chuyển khung hồi cố ở gate sau, không viết lại intro trong Batch B. Alias/chức đình Trung Yên ở phần đọc/guide thuộc D1 và candidate Batch A, không giải bằng food stories. Hương Trà thuộc Batch C, chưa draft.

## 4. Tạm Thương — kiểm tra cả intro, guide và story

| Runtime field / claim | Kết quả kiểm chứng certainty | Hướng xử lý đề xuất, chưa sửa | Dependency / impact |
| --- | --- | --- | --- |
| `intro.text` đoạn kho thóc, A01 PARTIALLY_SUPPORTED | “Theo tư liệu lịch sử” rộng hơn chain S09 dẫn Giang Quân; sách gốc chưa đọc | Nêu đúng chain nguồn hoặc lược độ chắc khi có quyền chỉnh top-level; không gọi verified origin | D7; intro là spoken, chưa có exact replacement |
| `alleyStory.paragraphs[0]` VI/EN | Có attribution tốt hơn intro. EN “before it was moved” có thể khiến “it” là kho thay vì thóc | Cần human biên tập đại từ/chủ thể khi duyệt field; không dời kho bằng suy diễn | A01/D7; display nhưng đổi revision |
| `intro.text`, `alleyStory.paragraphs[1]`, node Yên Thái/`guide.visit[0].notes[0]` | A02 hỗ trợ thờ Ỷ Lan; không cần làm yếu fact chỉ để đồng đều caveat | Giữ vai trò di tích chính, không thêm alias/year/count; exact KEEP còn human review | D7; node story đổi, intro chưa đề xuất đổi |
| `guide.visit[0].notes[1..2]` | Có mô tả hiện vật/cây và giờ/vé; A10 UNVERIFIED dù có câu yêu cầu xác nhận | Không dựa “08:00–18:00/free” để tổ chức đi; kiểm ban quản lý/ảnh có phép trước nếu muốn giữ | D5/D7, field gate; không spoken track riêng |
| Node/`guide.visit[1].notes[0]` Vọng Tiên | Node B có attribution; guide hiện thờ tự như fact không quy nguồn | Sau duyệt phải đồng bộ certainty theo S10, giữ legend có nhãn | D4/D7; không coi node patch sẽ tự làm sạch guide |
| `guide.visit[1].address`, `notes[2]`, A05/A11 | Số nhà và giờ niêm yết không là entrance/operating confirmation | Hướng giống Batch A: hạ precision chữ theo nguồn, giữ chờ xác minh; không sửa GPS/đổi địa danh chắc chắn | D4/D7; display/revision |
| `guide.route` kết thúc Vọng Tiên | Là danh sách gợi ý, chưa surveyed route | Human chọn khung thứ tự chủ đề/điểm liên quan; không GPS trail, hướng rẽ/ETA | D4/D7; không đổi geometry |
| Intro/`alleyStory.paragraphs[2..3]`/`guide.eat` | Ký ức báo 2024 và nhận xét danh bạ không chứng minh kinh doanh/giá/giờ hôm nay | D5 chọn lược đánh giá/giờ hoặc ghi thời điểm, không tuyên bố quán đóng/đang mở | D5/D7; không viết thêm food node |

**Kết luận:** hai story Tạm Thương có thể human review độc lập, nhưng **top-level/guide chưa được chốt**. Không phát hành nhãn “Tạm Thương content approved” từ approval hai node.

## 5. Cấm Chỉ — giữ ba lớp riêng

| Lớp | Nguồn/status gốc | Kết quả và phần còn unresolved |
| --- | --- | --- |
| Tên ngõ/Chúa Chổm trong intro/alleyStory | C01 LEGEND; C02 PARTIALLY_SUPPORTED | Nhãn truyện có trong runtime; không lấy làm lịch sử xây cổng. Alternate explanation không tự thành fact |
| Nghệ thuật công cộng 2025 | C04 PARTIALLY_SUPPORTED, S14 mirror | Candidate chỉ mô tả bản tin. `guide.visit[0]` cần cùng source/date/inspiration; không hứa hiện trạng 2026. Original inaccessible còn PENDING_EXTERNAL_VERIFICATION |
| Hội Vũ/nhân vật | C06 PARTIALLY_SUPPORTED, C07 LEGEND, S15 | Candidate phân biệt quan sát báo với lời tương truyền. `guide.visit[1].notes[1]` phải có attribution tương xứng nếu giữ Cô Tư Hồng |
| Motif “ngăn cấm → đón khách” | C05 EDITORIAL_INTERPRETATION | Proposed omission ở node art để tránh lặp; intro giữ nguyên trong phiên, không phê duyệt một chuyển đổi chính sách lịch sử |
| Khu ẩm thực/giờ/món | C03 UNVERIFIED; C09/C10 theo ledger | `alleyStory.paragraphs[3]`, `guide.eat` và từ “danh bạ hiện tại” chưa chứng thực. D5 xử lý riêng, không dùng năm 2025 để xác nhận toàn quá trình từ 2000s |
| Hai địa điểm ngoài ngõ | D4 và A05/C06/C08 | Không tạo đường nối từ schematic, không quyền vào nhà riêng, không hạ caveat chỉ trong EN |

Nguồn S14 đúng mirror và link gốc khác URL hiện có trong evidence. Gate sau có thể **append** nguồn trực tiếp cùng chú thích, không xóa provenance cũ. Source/evidence changes cũng làm revision thay, không phải thao tác “chỉ thêm link nên audio không ảnh hưởng”.

## 6. Batch C readiness — không có candidate prose

Các câu hỏi dưới đây là backlog nghiên cứu/field, **không phải narrative draft**. Chưa bắt đầu Batch C. Không đổi/xóa node, schema, order, GPS, QR hoặc voice behavior vì gọi nó là waypoint trong hồ sơ.

| Node / current assessment | Identity/source gap | Waypoint hay nghiên cứu thêm? | D dependencies | Câu hỏi khảo sát cụ thể | Điều kiện trước drafting |
| --- | --- | --- | --- | --- | --- |
| ngo-gach-ca-phe-no1 / MISSING_CONTENT | G02/G03: map/nhãn không đủ nhận diện pháp/hiện trạng và chuyện quán | Có thể đề xuất waypoint ngắn, không lịch sử/marketing; story sâu NEEDS_MORE_EVIDENCE | D3 chính; D5 cho kinh doanh; D4 nếu mô tả liên kết; D6/D7 boundary | Biển tên chính xác còn ở đó? Số nhà/cửa nào? Có được chụp và dùng ảnh? Có nguồn công khai có ngày hoặc người có thẩm quyền đồng ý cung cấp chuyện? | Human chọn role D3; xác minh identity/provenance; quyền riêng mở drafting; không đoán quán đang mở |
| ngo-gach-ta-ca-phe-4 / MISSING_CONTENT | G04/G05: website S25 trong ledger hỗ trợ tên/4A, không khoảng bước/lịch sử; chưa mở lại trong B | Waypoint có nhãn đúng; nghiên cứu nếu muốn câu chuyện riêng | D3/D5; D4 cho đường nối; D6/D7 | Biển “Ta Cà Phê” và 4A có khớp cửa thực? Số 4 trong ID không là quyền đổi địa chỉ. Lối vào công cộng? Có consent ảnh/nguồn chính thức có ngày? | Đối chiếu website thực sự trước khi dùng, field identity; bỏ hứa “mấy bước”; duyệt role + scope |
| ngo-gach-cafe-20 / MISSING_CONTENT | G10: map/nhãn, thiếu provenance về quán và ảnh | Waypoint chờ D3; không bù lịch sử ngõ vào quán | D3/D5; D4 conditional; D6/D7 | Tên hiển thị và số 20 đúng là gì? Mặt tiền có hoạt động nào được chủ xác nhận? Quyền dùng ảnh/map marker? Không công khai dữ liệu cá nhân người trả lời nếu chưa có phép | Identity/evidence có ngày và phép sử dụng; human chọn waypoint/story; authorization drafting riêng |
| trung-yen-pho-ga-huong-tra / MISSING_CONTENT | T11/T12: không suy quán cụ thể từ món phở gà; menu/hours hiện yếu | Waypoint sau xác minh; quảng bá/story sâu BLOCKED đến có evidence | D3/D5 chính; D4 chỉ khi chỉ lối; D7 | Biển tên, cửa, chủ thể quán nào? Người có thẩm quyền xác nhận món/giờ ở ngày khảo sát nào? Có consent ghi lời/ảnh? Hương Trà trong nguồn có đúng cùng cơ sở? | Identity match, nguồn thực đọc/field consent, chọn D3/D5 và quyền drafting; không dùng giờ/món chung làm evidence |
| phat-loc-cac-nhanh-ngo / MAJOR_REWRITE | P07/P08/P12: S20 năm 2018 có mô tả đô thị; lối thông/cửa Mã Mây34 và quyền đi qua chưa rõ | Có thể nghiên cứu ký ức đô thị; waypoint chờ D3; hướng dẫn thực địa BLOCKED | D3/D4 chính; D5 chỉ nếu thêm hàng quán; D2/D7 liên quan | Những nhánh nào công cộng, nhánh nào tư gia/ngõ cụt/cổng đóng? Mã Mây34 là cửa/lối gì theo quản lý? Được phép chụp/đo? Có nguy cơ dẫn khách vào nhà dân? | Mở lại S20 trước khi dùng, D3 role, D4 không-route hoặc surveyed access được duyệt; không tự sửa polyline/coordinates |

Không yêu cầu thu secrets/key. Ảnh, giờ, lời nhân chứng đề xuất thu phải có ngày, provenance và consent; một map pin không thay khảo sát. Đây là câu hỏi cho phase sau/người dùng, không dispatch nhóm khảo sát trong phiên.

## 7. Voice/revision cross-check và approval gate

| Perimeter | Chữ mới dự kiến | Slot cần xem khi revision thay | Không được suy ra |
| --- | --- | --- | --- |
| Batch B tám node | 16 story VI/EN khác runtime; 27 display replacements | Bốn collection: 30 story + 6 intro = 36 slots | Không phải 36 MP3 mới; không tạo Gạch intro |
| Batch A + B | 24 candidate stories nếu cùng được chọn; chưa exact approved | Cả năm collection: 34 story + 8 intro = 42 slots | Không approval từ 24/42; không paid job count |
| Field khác story | Không intro replacement B; evidence additions mới là hướng | Canonical whole JSON vẫn đổi khi display/evidence đổi | Không bypass revision guard hoặc repin text cũ |
| Unchanged text | Có thể là reuse candidate | Exact scope, text, audio SHA/provenance, voice/model và revision phải được review | Không reading Voice IDs/budget hoặc đánh dấu human-listened |

Provider/voice dự kiến do người dùng nêu: ElevenLabs, VI Nhật Phong / EN Talia. Skill voice chỉ dùng ranh giới preview; không generator/API/MP3/catalogue mutation. Đọc thử của người VI/EN và nghe clip sau một quyền audio riêng vẫn pending. Không chấm native iOS QA của người dùng hoặc công việc Antigravity từ matrix này.

### Cần người dùng quyết

1. D4/D5/D7 và exact B-v1 fields/KEEP/omissions: đề xuất giữ supporting places không-route, bỏ service/ranking và duyệt từng field. Chưa chọn thì không integration/repin.
2. Giữ câu truyền miệng Cô Tư Hồng hay lược khỏi narration? Đề xuất giữ có attribution như candidate; nếu muốn coi là biography cần nguồn gốc khác, chưa được phép kể như fact.
3. Nhàn giữ story ngắn hay đợi nghiên cứu sâu? Đề xuất bản ngắn; chưa có bằng chứng thì không tăng thời lượng bằng chi tiết tự tạo.
4. Batch C: đề xuất role waypoint theo D3, không mở drafting cho tới có yêu cầu riêng và evidence/identity gate. Chưa quyết thì giữ nguyên runtime, không xóa node/ẩn player.

### Cần người dùng tự làm

- Người VI/EN đọc exact strings và góp ý tên riêng/nhịp; đây là human content review, không yêu cầu anh tạo audio. Chưa đọc thì chưa có approval chữ/phát âm.
- `[ngoài plan]` Chỉ định người/quản lý di tích/khảo sát có phép để xác nhận gốc tượng, alias/niên đại Yên Thái, Vọng Tiên entrance và Cô Tư Hồng nếu muốn dùng như lịch sử. Chưa có thì duyệt bản lược an toàn hoặc giữ claim pending.
- `[ngoài plan]` Thu identity/access/consent cho năm waypoint theo câu hỏi bảng C nếu muốn mở đợt đó. Không thuộc tech demo plan hay bằng chứng native; chưa thu thì không làm route/marketing.

**Điểm dừng: Human Content Review Gate. Không sửa runtime, không mở NK-006/NK-009/NK-010 hoặc UI Wave 2.**
