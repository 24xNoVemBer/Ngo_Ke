# Ngõ Gạch — Storytelling V2: exact text review

Ngày lập và cập nhật editorial: 24/10/2026. **APPROVED_WITH_MINOR_REVISIONS — REVISIONS_APPLIED** theo yêu cầu trực tiếp “FINAL STORYTELLING V2 EDITORIAL REVIEW” của người dùng.

**26/32 exact values đã được người dùng duyệt về biên tập và được giữ nguyên từng ký tự. Sáu story VI/EN còn lại đã thay đúng nguyên văn người dùng chỉ định.** Bộ chữ hiện hành đã chốt theo quyết định kèm sửa đổi này; không yêu cầu duyệt lại 26 giá trị hoặc tự biên tập thêm sáu giá trị. Quyền tích hợp runtime và gọi TTS vẫn cần được giao riêng. Điểm dừng hiện tại: **READY_FOR_LUNA_HANDOFF — AWAITING_IMPLEMENTATION_AND_PAID_TTS_AUTHORIZATION**.

Đây là bộ kịch bản và handoff đã cập nhật disposition theo từng trường, chưa phải nội dung đã tích hợp. Người dùng đã xác nhận nghiệm thu giọng Nhật Phong/Talia của Voice Migration V1; audio mới theo bộ chữ này vẫn cần nghe nghiệm thu sau generation. Không sửa bản Narrative V2 trước, Batch A/B, ledger hoặc quyết định gốc. Trạng thái pending trong các tài liệu lịch sử không phủ định quyết định mới ghi tại đây; cũng không coi các tài liệu/ngõ khác đã được duyệt theo.

## 1. Baseline và nội dung thực sự đang dùng

- Branch `valentino/logic-fix-mobile-20261020`, HEAD `4af64c49a4ada47f952ddf76c35adfb90f826224`; worktree có WIP của các đợt trước. Lượt biên tập chỉ tạo/cập nhật tài liệu này.
- `mobile/src/data/collections.ts` import trực tiếp `data/localized/ngo-gach.vi.json` và `data/localized/ngo-gach.en.json`. Đây là nội dung bundled Demo, vẫn `kind: simulated`; không lấy draft Markdown làm runtime hoặc suy rộng sang dữ liệu Live.
- Collection `ngo-gach` có **5 node** theo đúng thứ tự bảng dưới; `startNodeId = ngo-gach-ca-phe-no1`, `qa = []`. Có `intro.text`; không có `alleyStory`, `guide`, chapters hoặc intro audio của collection.
- `QaScreen.tsx` dùng `currentNode.story`, rồi mới fallback `summary`/`intro.text`; content ID của story là `<nodeId>-story`. `localizedCatalog.ts` hiện resolve từ `demoVoiceMigrationV1Catalog.ts`, theo collection + locale + revision. `HomeScreen.tsx` tìm track `intro`; Ngõ Gạch không có track đó. Không suy ra intro chữ hiện đang được nghe từ Home.
- Generator migration lấy transcript từ chính `nodes[].story`, không có transcript thay thế trong bản thảo. Trong lượt này, đối chiếu UTF-8 SHA-256: **10/10 spoken textHash khớp**, **10/10 MP3 tồn tại và audioSha256 khớp manifest**. Đây là đối chiếu script/asset, không phải ASR hoặc nghe lại nội dung MP3.
- Revision hiện hành: VI `60c242b80557356b8c6f8302f16e937447e0fc48c09b8c84453965631028d19b`; EN `0f02ac35e6f3eaba103190a7e366d1dae11d6966609d296e175e29185cb79051`.

| Thứ tự | Node ID | Duration MP3 hiện tại VI / EN | Vai trò biên tập |
| --- | --- | --- | --- |
| 1 | `ngo-gach-ca-phe-no1` | 9.92 / 14.00 s | Waypoint mở đầu trong app |
| 2 | `ngo-gach-ta-ca-phe-4` | 14.00 / 18.56 s | Waypoint có nguồn nhận diện 4A |
| 3 | `ngo-gach-dinh-thanh-ha` | 22.72 / 28.96 s | Câu chuyện di sản |
| 4 | `ngo-gach-cafe-20` | 13.68 / 14.24 s | Waypoint trong danh sách điểm |
| 5 | `ngo-gach-chua-cau-dong` | 23.36 / 27.76 s | Câu chuyện di sản liên quan ngoài ngõ |

Duration lấy từ manifest migration hiện hành, không dùng số của catalogue trước migration. Không dùng duration cũ để hứa độ dài clip mới.

### Các đoạn cần thay

Các trích đoạn sau là từ hai JSON runtime, không phải từ bản nháp Narrative V2.

| Vị trí | Dấu hiệu VI hiện tại | Đối ứng EN hiện tại | Vấn đề / thay đổi đề xuất |
| --- | --- | --- | --- |
| `intro.text` | “một trăm hai mươi tám mét”; “tấm bia dựng từ năm 1430” | “128 metres”; “a stele dated 1430” | Mở bằng số đo/map và claim niên đại chưa đủ chắc; thay bằng chủ đề hai điểm di sản, không đổi lengthMeters |
| No.1 `story` | “Dữ liệu hiện có chỉ ghi vị trí, nên mình chưa kể thêm về quán” | “The available route data gives its location only, so I will not add a story…” | Nhật ký biên tập; bỏ lời tự thuật research và lời đi tiếp đến 4A |
| Ta `story` | “được dữ liệu tuyến ghi”; “chưa có nguồn độc lập về quán” | “listed in the route data”; “I found no independent source…” | Có website đơn vị cho nhận diện; thiếu chuyện di sản không đồng nghĩa không có nguồn. Bỏ đếm bước và chỉ dẫn tuyến |
| Thanh Hà `story` | “không phải sự kiện mình xác minh được”; “bia… dựng năm… ba mươi”; “Nguồn ghi…” | “rather than an event I can verify”; “erected… fourteen thirty”; “Sources list…” | Disclaimer không cứu được claim bia khẳng định tiếp sau. Thay trục bia/kiểm chứng bằng kiến trúc nhỏ và thờ tự/lịch lễ |
| Cafe 20 `story` | “Mình chưa tìm được nguồn riêng”; “Không có lịch sử, món uống hay giờ bán nào được xác nhận…” | “I found no source specific…”; “does not confirm its history, menu, or opening hours” | Cả đoạn giải thích giới hạn tư liệu; rút thành lời nhận diện waypoint |
| Cầu Đông `story` | “được một bài báo đặt”; “Bài viết ghi”; “Nhiều nhà nghiên cứu được dẫn lời”; “Bài báo xác nhận…” | “A newspaper places”; “It reports”; “Researchers quoted”; “The report confirms…” | Bốn lần nhắc cơ chế nguồn; chủ thể là bài báo thay vì hiện vật. Chọn dáng tượng, bỏ niên đại/gốc tích và khoảng nối chưa biết |
| `summary` / `caption` của các node | No.1/Cafe20 khẳng định vị trí/hiện trạng; Ta đếm bước; Thanh Hà khẳng định bia; Cầu Đông đưa tình trạng khảo sát vào caption | Các claim tương ứng vẫn có trong EN | Thay các trường này để chữ ngắn không phủ định bản story đã sửa |

Intro và story Thanh Hà đang lặp cùng claim bia yếu; ba café lặp “thiếu nguồn”; Cầu Đông kết bằng một thông báo khảo sát. Vấn đề không phải thiếu thời lượng: phần nghe đang dành chỗ cho công việc nghiên cứu thay vì chi tiết của địa điểm.

### Quyết định đã áp dụng, đúng phạm vi

Đọc cùng [Human Decision Record](NGO_KE_HUMAN_DECISION_RECORD_20261024.md), [Decision Pack](NGO_KE_CONTENT_DECISION_PACK.md), [Style Guide V1](NGO_KE_NARRATIVE_STYLE_GUIDE_V1.md) và [Narrative V2 trước](NGO_KE_NARRATIVE_V2_REVIEW_PACK.md).

- D2-A/B: lược claim bia 1430/cổ nhất và chi tiết thần tích chưa đủ đối chiếu, không đoán mốc thay thế.
- D3-A: giữ cả ba café dưới vai trò waypoint, đủ ngắn để nghe; giữ IDs/order/start/controls. Quyền viết lại Ngõ Gạch lần này bao gồm cả Ta và Cafe20, trước đây chưa được draft đầy đủ trong Batch C.
- D4-A/B: Cầu Đông là điểm liên quan ngoài ngõ; không biến thứ tự node thành đường đi đã khảo sát.
- D6-A: sửa intro chữ hiện có; không thêm intro MP3, alleyStory hoặc guide.
- D7-A và điều kiện P3: 26 giá trị được duyệt, sáu stories sửa đúng nguyên văn người dùng, gồm P3/Cầu Đông. Phần editorial của P3 đã được xử lý bằng bản chỉ định dưới đây; claim G12 vẫn PARTIALLY_SUPPORTED. Không tích hợp hoặc phát sinh TTS từ tài liệu này.

## 2. Kịch bản exact text hiện hành

Mỗi blockquote là **toàn bộ giá trị thay thế** của field được ghi, không gồm tiêu đề, mã duyệt hoặc ghi chú. Mỗi field là một đoạn đơn; dấu câu và tên riêng thuộc exact text. Các mã NG2-* chỉ dùng trong tài liệu, không là ID/schema mới. Name hiện hành giữ nguyên trong lượt này để tránh đổi ngoài nhu cầu.

### NG2-I — `intro.text` hiện có

VI:

> Khám phá Ngõ Gạch qua hai câu chuyện di sản: đình Thanh Hà với những ngày tưởng nhớ Trần Lựu, và chùa Cầu Đông với hai pho tượng ngồi thiền. Chùa nằm trên phố Hàng Đường, ngoài ngõ; đó là một điểm liên quan trong trải nghiệm này.

EN:

> Explore Gạch Alley through two heritage stories: Thanh Hà Communal House and its dates of remembrance for Trần Lựu, and the two seated figures at Cầu Đông Pagoda. The pagoda stands on Hàng Đường Street, outside the alley, and is included here as a related stop.

Chức năng: mở chủ đề, không tiết lộ hết hai stories hoặc hứa đã có overview audio. Hai câu không thay startNodeId; “khám phá” là trải nghiệm nội dung, không lời mời đi theo GPS. Chỉ dùng intro chữ; không tạo clip mới.

### NG2-01 — `ngo-gach-ca-phe-no1`

**story VI:**

> Cà Phê No.1 là điểm mở đầu của trải nghiệm Ngõ Gạch. Hành trình kể chuyện bắt đầu từ đây.

**story EN:**

> Cà Phê No.1 marks the beginning of the Gạch Alley experience. Our storytelling journey starts here.

**summary VI:**

> Cà Phê No.1 — điểm mở đầu trong trải nghiệm Ngõ Gạch.

**summary EN:**

> Cà Phê No.1 — the starting marker for the Gạch Alley experience.

**caption VI:**

> Cà Phê No.1 — mốc mở đầu.

**caption EN:**

> Cà Phê No.1 — starting marker.

So với runtime cũ: lời dẫn mở đầu thay cho “không có dữ liệu”; không gọi đây là lịch sử của quán. So với draft trước: bỏ phần giới thiệu lại hai di tích theo yêu cầu người dùng. “Hành trình kể chuyện / storytelling journey” là trải nghiệm nội dung, không đường đi. Bỏ số nhà/phía đông/đi tới 4A vì identity thực địa còn hạn chế. Đây vẫn là waypoint, không full heritage story.

### NG2-02 — `ngo-gach-ta-ca-phe-4`

**story VI:**

> Ta Cà Phê 4, tại số bốn A Ngõ Gạch, là một mốc trong hành trình nội dung này. Điểm kể chuyện tiếp theo là đình Thanh Hà, nơi thờ Trần Lựu.

**story EN:**

> Ta Cà Phê 4, at number four A Gạch Alley, is a marker in this experience. The next story takes us to Thanh Hà Communal House, dedicated to Trần Lựu.

**summary VI:**

> Ta Cà Phê 4 — điểm dừng mang địa chỉ 4A Ngõ Gạch.

**summary EN:**

> Ta Cà Phê 4 — a stop listed at 4A Gạch Alley.

**caption VI:**

> Ta Cà Phê 4 — 4A Ngõ Gạch.

**caption EN:**

> Ta Cà Phê 4 — 4A Gạch Alley.

So với cũ: nhận diện có nguồn và một cầu nối theo thứ tự node thay cho giải thích thiếu tư liệu. “Tiếp theo” là node số 3 trong app, không khẳng định đình ở phía trước khi đứng thực địa. Không thêm lịch sử quán, nhận xét đồ uống, lời mời mua, giờ mở cửa hoặc câu hứa có thể vào quán.

### NG2-03 — `ngo-gach-dinh-thanh-ha`

**story VI:**

> Ở số mười Ngõ Gạch, cổng đình Thanh Hà có ba lối vào, rộng hẹp khác nhau. Sau cổng là một khoảng sân nhỏ, rồi đến những nếp nhà thờ tự. Giữa phố cổ, ngôi đình vẫn mang dáng dấp của một đình làng. Nơi đây thờ Trần Lựu, vị thành hoàng của cộng đồng Thanh Hà. Sự tưởng nhớ ấy còn gắn với hai ngày trong lịch âm: mùng bốn tháng Tư và rằm tháng Chín.

**story EN:**

> At number ten Gạch Alley, Thanh Hà Communal House has a gateway with three entrances of different widths. Beyond it, a small courtyard leads to the worship halls. Set within the Old Quarter, the building takes the form of a traditional village communal house. It honors Trần Lựu as the community's tutelary deity. Two dates in the lunar calendar also mark that remembrance: the fourth day of the fourth month, and the fifteenth day of the ninth.

**summary VI:**

> Đình Thanh Hà thờ Trần Lựu, gắn với những ngày tưởng nhớ trong năm âm lịch.

**summary EN:**

> Thanh Hà Communal House honors Trần Lựu, with dates of remembrance in the lunar year.

**caption VI:**

> Đình Thanh Hà — nơi thờ Trần Lựu.

**caption EN:**

> Thanh Hà Communal House — honoring Trần Lựu.

So với cũ: bắt đầu bằng chi tiết kiến trúc cụ thể, chuyển sang người được thờ và khép ở hai ngày tưởng nhớ. Không tóm tắt nghiên cứu, không kết bằng một bài học chung. Đây là mô tả dựa trên hồ sơ, không ghi nhận rằng đã vào đình hoặc công trình hiện không tu bổ; không thêm mệnh lệnh đi vào.

Chi tiết cổng/sân/hình thức đình làng là chất liệu được chọn lại từ nguồn hiện có, chưa có trong candidate V2-03 cũ; người dùng đã duyệt rõ phần kiến trúc này trong quyết định mới nhất. Không tự gắn VERIFIED mới vào ledger. Hai ngày âm lịch là lịch lễ được nguồn ghi, không lịch sự kiện sắp tới hay bảo đảm tổ chức trong năm hiện tại.

### NG2-04 — `ngo-gach-cafe-20`

**story VI:**

> Cafe 20 là một điểm dừng trong trải nghiệm Ngõ Gạch. Câu chuyện tiếp theo nói về chùa Cầu Đông trên phố Hàng Đường — một di tích liên quan nằm ngoài ngõ.

**story EN:**

> Cafe 20 is a stop in the Gạch Alley experience. The next story introduces Cầu Đông Pagoda on Hàng Đường Street, a related heritage site outside the alley.

**summary VI:**

> Cafe 20 — một mốc trong trải nghiệm Ngõ Gạch.

**summary EN:**

> Cafe 20 — a marker in the Gạch Alley experience.

**caption VI:**

> Cafe 20 — điểm dừng trong trải nghiệm.

**caption EN:**

> Cafe 20 — a stop in this experience.

So với cũ: bỏ đoạn phủ định history/menu/hours; dùng waypoint để báo sự chuyển chủ đề ra địa điểm ngoài ngõ. Không xác nhận số nhà 20, vị trí cuối phía tây, quán đang hoạt động hoặc lối nối tới chùa. Giữ đúng tên node làm nhãn, không xác minh cơ sở kinh doanh bằng việc lặp tên.

### NG2-05 — `ngo-gach-chua-cau-dong`

**story VI:**

> Ở chùa Cầu Đông trên phố Hàng Đường, có hai pho tượng gỗ được giới thiệu là Trần Thủ Độ và Trần Thị Dung. Cả hai cùng ngồi thiền, trong trang phục giản dị. Riêng pho tượng được nhận diện là Trần Thủ Độ có đôi mắt hướng xuống, gợi một vẻ trầm ngâm.

**story EN:**

> At Cầu Đông Pagoda on Hàng Đường Street, two wooden figures are identified as Trần Thủ Độ and Trần Thị Dung. Both are seated in meditation, dressed simply. The figure identified as Trần Thủ Độ has a downward gaze, giving it a contemplative expression.

**summary VI:**

> Chùa Cầu Đông trên phố Hàng Đường, ngoài Ngõ Gạch — câu chuyện về hai pho tượng được giới thiệu là Trần Thủ Độ và Trần Thị Dung.

**summary EN:**

> Cầu Đông Pagoda on Hàng Đường Street, outside Gạch Alley — two figures identified as Trần Thủ Độ and Trần Thị Dung.

**caption VI:**

> Chùa Cầu Đông — điểm di sản liên quan ngoài ngõ.

**caption EN:**

> Cầu Đông Pagoda — a related heritage stop outside the alley.

So với runtime cũ: hai tượng là trọng tâm; kết ở chi tiết ánh mắt và vẻ biểu hiện của tượng, không thêm nguồn gốc hay bài học triết lý. Không đọc tên báo, năm đăng, tranh luận định niên đại hoặc kết luận “chưa rõ” kéo dài. So với draft trước: đã dùng đúng ba câu VI/EN do người dùng chỉ định; phần editorial của **P3 đã chốt theo sửa đổi này**.

“Được giới thiệu / được nhận diện” và “are identified as / identified as” giữ giới hạn nhận diện qua nguồn. Theo sửa đổi cụ thể của người dùng, mô tả dáng ngồi/trang phục được kể liền mạch, không nhắc việc đọc tài liệu trong spoken text; nguồn S24 lưu tại hồ sơ này. Đây vẫn là mô tả qua nguồn viết, không quan sát thực địa hoặc giám định mới. Nét ánh mắt được nguồn ghi riêng ở tượng Trần Thủ Độ, không kết luận về ánh mắt tượng còn lại. “Gợi một vẻ trầm ngâm / giving it a contemplative expression” nói về vẻ biểu hiện của pho tượng, phù hợp đoạn nguồn mô tả vẻ suy tư; không gán tâm trạng thật cho nhân vật lịch sử, ý đồ người tạc hoặc lý do lập tượng. Không đổi trạng thái G12.

## 3. Nguồn, claim và phần lược bỏ

Các nguồn web dưới đây được mở lại khi lập bản review ngày 24/10/2026; S24 được mở lại thêm trong lượt final editorial review này để đối chiếu bản người dùng chỉ định. Ngày header của website không được coi là ngày xuất bản bài. Chỉ dùng đúng đoạn hỗ trợ, không lấy toàn bộ bài làm chứng nhận mọi chi tiết. Ledger cũ giữ nguyên trạng thái.

| Nguồn | Nội dung dùng / giới hạn |
| --- | --- |
| S22 — [Hoàn Kiếm 360: Đình Thanh Hà](https://hoankiem360.tourism.vn/chi_tiet_di_tich_lich_su/dinh-thanh-ha.html), không xác định ngày bài, mở lại 24/10/2026 | Các đoạn cổng ba lối, sân hẹp, hình thức đình làng; thờ tự và ngày lễ. Không dùng thần tích như sử kiện, niên đại khởi dựng, giờ hiển thị trên trang hoặc trạng thái mở cửa |
| B2B-S01 — [Cục Di sản văn hóa: Đình Thanh Hà](https://dsvh.gov.vn/dinh-thanh-ha-thanh-pho-ha-noi-22263), không xác định ngày bài, mở lại 24/10/2026 | Đối chiếu số 10, tam quan/sân/các nếp nhà, thờ tự; phân biệt bản khắc lại và bia gốc. Không chọn thêm năm xây/chuyển đình |
| S24 — [Pháp Luật Việt Nam: hai pho tượng Cầu Đông](https://baophapluat.vn/bi-an-xung-quanh-hai-pho-tuong-trong-ngoi-chua-cau-dong-post365743.html), Tiểu Vũ, 06/10/2020, mở lại 24/10/2026 | Dùng đoạn mô tả hiện vật, không phần suy đoán/biography; một nguồn báo chí, chưa hồ sơ giám định. Không dùng chữ “duy nhất” hoặc tự suy ra nguyên nhân lập tượng |
| S25 — [Website Ta Cà Phê](https://www.tacaphe.vn/), không xác định ngày bài, mở lại 24/10/2026 | Mục chi nhánh Ta Cà Phê 4 ghi 4A Ngõ Gạch. Nguồn đơn vị hỗ trợ nhận diện, không lịch sử/di sản hoặc bảo đảm vận hành hôm nay |
| S29 — [Nghiên cứu repository ngày 22/10](ALLEY_RESEARCH_NGO_GACH_TRUNG_YEN_20261022.md), cùng `ALLEY_GEOMETRY_20261022.json` | Chỉ dấu vết biên soạn/map; không nguồn độc lập cho quán hoặc khảo sát tuyến. Vai trò thứ tự/start xác nhận riêng từ JSON runtime |

### Truy vết từng nhóm câu

| Candidate | Claim gốc / trạng thái trong ledger | Ranh giới sử dụng |
| --- | --- | --- |
| NG2-I | G06/G09 VERIFIED; G11/G12 PARTIALLY_SUPPORTED | Giới thiệu chủ đề, không thêm facts ngoài hai stories. Nói địa điểm liên quan ngoài ngõ, không lối đi |
| NG2-01 | G02 PARTIALLY_SUPPORTED; G03 EDITORIAL_INTERPRETATION | Hai câu chỉ vai trò start thực tế và lời chào mở trải nghiệm, không fact về lịch sử hoặc hoạt động quán |
| NG2-02 | G04 VERIFIED / S25; G06 VERIFIED / S22 | Nhận diện chi nhánh; câu sau phản ánh node tiếp theo trong registry. Không suy từ địa chỉ thành heritage story |
| NG2-03 câu 1–3 | Chi tiết kiến trúc từ S22/B2B-S01, được chọn bổ sung trong bản duyệt này | Cổng/sân/hình thức có mô tả nguồn; chưa tạo claim ID hoặc đổi trạng thái ledger; không giả quan sát tại chỗ |
| NG2-03 câu 4–5 | G06/G09 VERIFIED / S22; đối chiếu B2B-S01 cho thờ tự | Phân biệt thờ tự với chiến công sử học; lịch âm trong cả VI/EN, không lịch sự kiện hiện hành |
| NG2-04 | G10 PARTIALLY_SUPPORTED; order runtime | Chỉ nhãn điểm và chuyển câu chuyện trong app; không bảo chứng identity thương mại/location/đường nối |
| NG2-05 | G12 PARTIALLY_SUPPORTED / S24; G11 PARTIALLY_SUPPORTED ở story/summary | Câu 1: địa điểm, chất liệu và nhận diện có qualifier; câu 2: tư thế/trang phục; câu 3: ánh mắt và vẻ biểu hiện của tượng. Không suy ra provenance, niên đại hoặc tâm trạng lịch sử |

Các summary/caption chỉ rút từ cùng phạm vi từng node, không bổ sung claim. Tên trong spoken có dấu là cách viết lời kể, không global rename các name runtime.

### Proposed omissions — áp dụng cho cả VI và EN

- G01: bỏ số đo 128 m khỏi intro; không sửa `lengthMeters` hoặc geometry.
- G02/G10: bỏ số nhà/hướng đầu-cuối và suy đoán quán đang mở khỏi lời kể/display; giữ nhãn và vai trò điểm trong app.
- G05: bỏ “ba chục bước” trên cả story/summary/caption.
- G07: không kể trận đánh Vũ Ninh/quân số/hiển hóa khi chưa đối chiếu đủ; không biến omission thành kết luận truyền thuyết sai.
- G08: không “bia dựng 1430”, không “cổ nhất”; không đề xuất niên đại thay thế. Claim tiếp tục PARTIALLY_SUPPORTED/PENDING_EXTERNAL_VERIFICATION theo hồ sơ cũ.
- G11/G12: bỏ số nhà 38B khỏi kịch bản để không phải chen quy nguồn địa chỉ; bỏ định niên đại tượng, gốc tích/ý nghĩa chưa biết, lý do lập tượng, khoảng cách từ đầu tây, câu hứa vào chùa và mô tả hiện trạng hoạt động.
- Bỏ các câu kể việc người biên tập tìm/chưa tìm nguồn. Thông tin hạn chế vẫn nằm tại ghi chú này và các pendingCheck/disclaimer hiện hành; không tự xóa hồ sơ provenance, metadata hoặc caveat vận hành.

## 4. Audio IDs và fields bàn giao cho Luna sau phê duyệt riêng

Bộ chữ đã chốt gồm năm stories VI/EN khác runtime; khi có quyền triển khai riêng, thay **tối đa 10 MP3 story hiện hữu**, không thêm audio ID. Trường hợp cả mười spoken strings vẫn khác runtime tại baseline triển khai thì delta là 10 clip. Mỗi ID dưới có hai locale; đường dẫn đang active theo mẫu `mobile/assets/voice/demo-migration-v1/ngo-gach/{locale}/{audioId}.mp3`.

| Node | Audio ID trong allowlist delta | Locale |
| --- | --- | --- |
| No.1 | `ngo-gach-ca-phe-no1-story` | VI, EN |
| Ta | `ngo-gach-ta-ca-phe-4-story` | VI, EN |
| Thanh Hà | `ngo-gach-dinh-thanh-ha-story` | VI, EN |
| Cafe 20 | `ngo-gach-cafe-20-story` | VI, EN |
| Cầu Đông | `ngo-gach-chua-cau-dong-story` | VI, EN |

Không có `ngo-gach/intro` clip để tạo lại; không tạo mới từ candidate intro. Summary/caption không có track riêng của collection này trong catalogue active. Không gọi lại migration toàn bộ 198 clips cho delta Ngõ Gạch. Bảo toàn giọng đã nghiệm thu: Nhật Phong VI / Talia EN; không coi việc duyệt kịch bản là quyền gọi API tính phí.

### Danh mục exact fields

Chỉ hai runtime content files tương lai: `data/localized/ngo-gach.vi.json`, `data/localized/ngo-gach.en.json`. Chọn node bằng **ID**, không dựa duy nhất vào index. `APPROVED_EDITORIAL` ghi nhận 26 giá trị được duyệt nguyên bản; `USER_SPECIFIED_REVISION_APPLIED` ghi nhận sáu stories đã sửa đúng nguyên văn yêu cầu mới nhất, không phải agent tự phê duyệt.

| Mã | Selector trong mỗi JSON | Exact replacements ở mục 2 | Quyết định human |
| --- | --- | --- | --- |
| NG2-I | `intro.text` | intro VI / EN | 2 giá trị APPROVED_EDITORIAL |
| NG2-01 | `nodes[id=ngo-gach-ca-phe-no1].story / summary / caption` | Ba fields VI / EN của No.1 | 4 summary/caption APPROVED_EDITORIAL; 2 story USER_SPECIFIED_REVISION_APPLIED |
| NG2-02 | `nodes[id=ngo-gach-ta-ca-phe-4].story / summary / caption` | Ba fields VI / EN của Ta | 6 giá trị APPROVED_EDITORIAL |
| NG2-03 | `nodes[id=ngo-gach-dinh-thanh-ha].story / summary / caption` | Ba fields VI / EN của Thanh Hà | 6 giá trị APPROVED_EDITORIAL, gồm phần kiến trúc |
| NG2-04 | `nodes[id=ngo-gach-cafe-20].story / summary / caption` | Ba fields VI / EN của Cafe20 | 4 summary/caption APPROVED_EDITORIAL; 2 story USER_SPECIFIED_REVISION_APPLIED |
| NG2-05 | `nodes[id=ngo-gach-chua-cau-dong].story / summary / caption` | Ba fields VI / EN của Cầu Đông | 4 summary/caption APPROVED_EDITORIAL; 2 story USER_SPECIFIED_REVISION_APPLIED, gồm P3 |

Tổng **32 exact values đã xử lý quyết định editorial**: 2 intro + 10 story + 10 summary + 10 caption = 26 giữ nguyên đã duyệt + 6 sửa theo chỉ định. Không còn yêu cầu sửa chữ mở trong phạm vi này. Không xem những field không đề xuất sửa là đã được duyệt lại; không nâng historical verification theo approval biên tập.

Nguồn evidence hiện tại của Thanh Hà/intro chưa đủ phản ánh phần chữ mới. Khi giao integration, cần duyệt bổ sung URL S22/B2B-S01 vào evidence hiện hữu của Thanh Hà, S22 vào intro; không tự thêm schema/evidence UI. Cầu Đông giữ S24. Ta có S25 trong hồ sơ; việc thêm `evidence` vào node Ta phải theo contract validator hiện hành và được giao rõ trong scope integration, không tự coi đã có field mới được duyệt. No.1/Cafe20 không được gắn nguồn của đình/chùa thành chứng cứ lịch sử của quán.

Thay display hoặc evidence cũng làm whole-dataset revision đổi. Lượt integration phải tính revision và re-pin đúng hai locale Ngõ Gạch, đồng bộ transcript/textHash/manifest/static mapping với audio mới; không nới resolver, không gắn MP3 cũ vào chữ khác. Chỉ đây là impact/handoff, chưa phải thay các giá trị đó trong lượt này. Không cần sửa UI, Q&A, order, GPS, ảnh, voice commands hoặc audio lifecycle để áp dụng các lời kể này.

### Handoff triển khai giới hạn cho Luna — chỉ dùng sau khi được giao thực thi

1. **Baseline:** kiểm branch/HEAD/WIP mới nhất, so sánh 32 exact strings mục 2 với runtime. Giữ nguyên năm IDs/order/start, `qa=[]`, names, geometry, GPS, ảnh, pendingCheck/disclaimer và WIP ngoài scope. Không xem snapshot cũ là HEAD mặc định.
2. **Content:** chỉ thay `intro.text` và `story/summary/caption` ở đúng năm IDs trong hai JSON Ngõ Gạch. Không biên tập lại chữ, dấu câu, dấu tên hoặc dấu gạch ngang dài trong story Cafe20. Mọi xung đột mới với dữ liệu/người đang sửa phải được báo trước khi ghi đè.
3. **Evidence:** giữ nguồn cũ; đề xuất append S22/B2B-S01 cho Thanh Hà, S22 cho intro và S25 cho Ta theo schema hiện hành. Nêu rõ phần bổ sung evidence trong scope triển khai; không xóa provenance, không nâng claim/classification. Approval 32 exact values không tự bao gồm sửa metadata khác.
4. **Delta audio:** lập dry-run inventory chỉ `collectionId=ngo-gach`, `locale ∈ {vi,en}`, `kind=story` và đúng năm audio IDs trong bảng. Loại mọi `intro`, `caption`, `answer` và collection khác. Tối đa 10 output story; bỏ qua output mới đã hoàn tất và hợp lệ nếu resume. Bảo quản nguyên bytes audio cũ và manifest/mapping cũ trong bản rollback trước khi thay active references.
5. **Giọng/model:** giữ Nhật Phong VI (`6adFm46eyy74snVn6YrT`), Talia EN (`OZ0L6eISlOejga3XjDFt`), `eleven_v3`, `mp3_44100_128`. Sau quyền paid TTS riêng, preflight credit/voice và chốt estimate trước request; không đọc/in key ra log, không tự tăng ngân sách hoặc tạo thêm biến thể/thử giọng. Lượt này không gọi API.
6. **Tooling:** không chạy generator toàn bộ migration 198 clip hoặc generator node-stories 17 node chỉ vì có tùy chọn locale. `generate_node_stories.py` hiện chỉ có `--locale`, không bộ lọc node/collection an toàn cho batch này. Trước paid execution, công cụ delta phải chứng minh allowlist ở bước 4, dùng journal/output riêng, dừng khi request không rõ kết quả thay vì trả phí lặp. Nếu cần thêm script delta, ghi tên file và diff vào scope triển khai; không sửa runner toàn dự án để tiện chạy batch.
7. **Derived mapping:** scope tương lai phải cho phép cập nhật hai revision `ngo-gach` trong `mobile/src/data/collections.ts`, hai catalogue entries Ngõ Gạch trong `mobile/src/voice/demoVoiceMigrationV1Catalog.ts`, và mười entries tương ứng trong manifest delta/active tại `mobile/assets/voice/demo-migration-v1/manifest.json` theo cơ chế version/rollback được chọn. Những file dùng chung này chỉ được đổi phần Ngõ Gạch. Không sửa resolver/session/UI hoặc các track khác. Chỉ sửa hai JSON và MP3 mà bỏ mapping/revision sẽ không tích hợp đầy đủ.
8. **Verification/handoff:** xác minh 32 strings exact, 10 textHash, MP3 decode/format/duration/audio SHA-256, registry revisions và mọi asset reference. So sánh hash các track ngoài delta để chứng minh không thay 188 clip còn lại. Chạy focused catalogue/Home/Qa/voice tests, full mobile suite, `npm run typecheck`, `npm run lint -- --no-cache`, `git diff --check`; báo số thực tế và cập nhật assertion thời lượng/đường dẫn chỉ khi contract thực sự đổi. Cuối cùng nghe trên iPhone VI/EN: Play/Replay/Stop/Next, đổi locale/node, caption khớp, không clip cũ/chồng âm; giữ Ngõ Gạch không có intro audio. Tests host không thay cho native listening.

Runtime rollout phải đồng bộ text và audio; không ship story mới cùng MP3 cũ. Giữ nguồn duyệt là 32 blockquotes mục 2 và quyết định người dùng ở đầu tài liệu, không lấy đoạn trích runtime mục 1 làm transcript mới. Không dispatch Luna trong lượt editorial này.

## 5. Kiểm tra editorial và cửa duyệt

- Đã đối chiếu phạm vi 5 node, 2 locale; mạch mở đầu và các waypoint nối **chủ đề**, không mô tả tuyến đi thực địa.
- VI/EN giữ cùng nội dung và certainty; “mùng bốn tháng Tư / rằm tháng Chín” tương ứng ngày thứ tư của tháng thứ tư / ngày thứ mười lăm của tháng thứ chín âm lịch. Không dùng tháng April/September dương lịch.
- Ba café ngắn có chủ ý; chất liệu di sản tập trung ở hai điểm có nguồn. Không kéo dài bằng menu, lịch sử quán hoặc quan sát tưởng tượng.
- Cầu Đông còn qualifier ngắn để giữ ranh giới bằng chứng; thư mục, năm báo, bất đồng và tình trạng kiểm chứng đặt ngoài spoken text. Kết bằng chi tiết hiện vật thay cho triết lý chung.
- Chưa gọi TTS, chưa nghe thử lời mới và chưa đo duration mới. Không tự chấm bản thảo đạt audio QC bằng việc đọc chữ.
- Hash transcript/audio hiện hành 10/10 là kiểm tra khi lập bản review; lượt final editorial này kiểm tra bảo toàn hash dữ liệu/mapping/manifest và diff tracked, đối chiếu 32 blockquotes. Không chạy full mobile regression cho thay đổi Markdown duy nhất. Tài liệu `docs/CONTENT_MANAGEMENT.md` và thư mục `content/alleys/` mà skill nhắc tới không có ở checkout này; đối chiếu theo registry/JSON thực tế, không tạo content pack giả hoặc thay contract.

### Đối chiếu sáu giá trị sửa theo chỉ định

| Cặp VI/EN | Kết quả đối chiếu | Evidence / giới hạn |
| --- | --- | --- |
| NG2-01 story | Cùng vai trò điểm mở đầu và hành trình kể chuyện; EN “Our” là lựa chọn ngôi kể của người dùng, không thêm fact | `startNodeId` runtime; không thêm history/location/operation |
| NG2-04 story | Cùng điểm dừng, câu chuyện kế tiếp, Hàng Đường và site liên quan ngoài ngõ; dấu “—” VI giữ nguyên | Order node 4→5, G11/S24; không route, khoảng cách hoặc quyền vào |
| NG2-05 story | Cùng địa điểm, gỗ, nhận diện hai người, dáng thiền, trang phục và ánh mắt; cả hai dùng qualifier nhận diện | G11/G12, [S24](https://baophapluat.vn/bi-an-xung-quanh-hai-pho-tuong-trong-ngoi-chua-cau-dong-post365743.html), đoạn sau tiêu đề “Câu hỏi lớn chưa có lời giải”: chất liệu/nhân vật ở đoạn đầu về ban thờ, mô tả tượng ở đoạn tiếp theo. Nguồn có vẻ suy tư cùng hướng nhìn xuống; “trầm ngâm / contemplative expression” chỉ vẻ của tượng, không biography hoặc kết quả giám định |

Kiểm tra so sánh trước/sau: đúng 32 blockquotes; chỉ sáu story blocks NG2-01/04/05 VI/EN thay đổi và khớp nguyên văn người dùng; 26 blocks còn lại giữ nguyên từng ký tự. SHA-256 diff tracked và hash hai JSON, resolver, catalogue migration, manifest đều không đổi. `git diff --check` đạt; không chạy lại test mobile cho lượt cập nhật Markdown. Ledger không đổi trạng thái. Nội dung đã chốt về biên tập trong phạm vi này; quyền production/integration và paid generation chưa được mở bởi lượt final editorial.

**Cần anh quyết trước khi Luna thực thi:** giao riêng scope tích hợp 32 values, evidence append nếu chọn, các derived entries Ngõ Gạch và tối đa 10 story MP3 với ngân sách paid TTS. Đây là quyền còn thiếu để thực thi, không phải yêu cầu duyệt lại chữ đã chốt. Nếu chưa giao, runtime/audio hiện tại tiếp tục giữ nguyên.

**Cần anh tự làm sau rollout:** nghe nghiệm thu tối đa 10 clip mới trên iPhone. Giọng V1 đã đạt yêu cầu, nhưng phát âm/nhịp và đúng kịch bản của clip mới chưa thể nghiệm thu trước khi có clip. Chưa có thao tác thiết bị nào bắt buộc trong lượt editorial này; không bổ sung khảo sát ngoài scope.

**READY_FOR_LUNA_HANDOFF — EDITORIAL_REVISIONS_APPLIED; IMPLEMENTATION/PAID_TTS_AUTHORIZATION_PENDING.**
