# Ngõ Kể — Batch B VI/EN Editorial Draft B-v1

Ngày: **24/10/2026** (Asia/Saigon). Baseline: `4af64c49a4ada47f952ddf76c35adfb90f826224`, branch `valentino/logic-fix-mobile-20261020`, có WIP Phase 1A/1B/UI Wave 1/remediation.

**Toàn bộ candidate: `DRAFT_NOT_APPROVED`. D1–D7: `PENDING_HUMAN_APPROVAL`.** Đây là bản chữ để duyệt, không sửa runtime, không phê duyệt lịch sử hoặc mở NK-006/NK-009/NK-010. Xem [review matrix](NGO_KE_BATCH_B_REVIEW_MATRIX.md), [báo cáo](../reviews/NGO_KE_PHASE2B_BATCH_B_REPORT.md), [decision pack](NGO_KE_CONTENT_DECISION_PACK.md), [Batch A](NGO_KE_BATCH_A_VI_EN_DRAFT.md) và [claim ledger](NGO_KE_CLAIM_LEDGER.md).

## 1. Quy ước duyệt và nguồn

- Các mã B-G/B-TS/B-TC/B-TN/B-AY/B-AV/B-CA/B-CH là nhãn review trong tài liệu, **không phải fields/schema/content IDs mới**. Số câu trong trace tính từ đầu từng story, không đưa vào spoken text.
- Chỉ field cần thay có proposed replacement. **KEEP** nghĩa là không đề xuất patch trong Batch B, không phải đã được human duyệt. Summary/caption KEEP của Yên Thái vẫn cần đọc cùng toàn field khi duyệt node.
- `SUPPORTED_FOR_DRAFT` là disposition biên tập có điều kiện, không thay status gốc. Mọi omission/diễn giải/thuật ngữ cũng chờ human. Không đưa claim UNVERIFIED/CONFLICTING vào story bằng cách bỏ nhãn.
- VI/EN giữ cùng chủ thể, thời điểm nguồn, legend và giới hạn. Năm viết bằng chữ trong story để đọc tự nhiên; các tên riêng giữ dấu, không respell cho TTS. Không có lời dẫn kiểu “đi tiếp/rẽ/vài bước”, lời nhân chứng tự tạo hay mô tả như đã có field survey.

Các thân bài dưới đây đã mở và đối chiếu **24/10/2026**. Source IDs cũ giữ nguyên; không sửa ledger Phase 2A.

| ID | Nguồn đã đọc | Phạm vi / giới hạn dùng |
| --- | --- | --- |
| S24 | [Báo Pháp Luật — Hai pho tượng chùa Cầu Đông, 06/10/2020](https://baophapluat.vn/bi-an-xung-quanh-hai-pho-tuong-trong-ngoi-chua-cau-dong-post365743.html) | Nhận diện qua báo; không phải hồ sơ giám định tượng |
| S06 | [VietNamNet — Ngõ ẩm thực Sướng/Nhàn/Sâm](https://vietnamnet.vn/la-lung-con-ngo-am-thuc-du-suong-nhan-vui-san-si-o-ha-noi-722230.html) | Bài dẫn Dân Trí; câu chuyện có thời điểm, không mô tả kinh doanh 2026 |
| B2B-B-S01 | [Truyền hình Thanh Hóa — bản đăng lại cùng bài, 25/03/2021](https://truyenhinhthanhhoa.vn/la-lung-con-ngo-am-thuc-du-quotsuongquot-quotnhanquot-quotvuiquot-quotsan-siquot-o-ha-noi-1808336452.htm) | Bổ sung mốc năm cho source family S06; ghi Toàn Vũ/Dân Trí. Không là chứng cứ độc lập thứ hai; không suy ngày gốc VietNamNet từ ngày đăng lại |
| S07 | [VnExpress — Bún cá dưới gốc cây si, 11/03/2024](https://vnexpress.net/quan-bun-ca-duoi-goc-cay-si-hon-20-nam-hut-khach-4720089.html) | Lời người nhà giải thích tên; không tự xác nhận toàn lịch sử quán |
| S05 | [VietnamPlus — Triết lý ẩm thực Trung Yên, 09/10/2024](https://mega.vietnamplus.vn/triet-ly-am-thuc-ngo-trung-yen-6633.html) | Có nhắc Nhàn và chuyện chuyển quán của Sâm; không xác minh hiện trạng/danh tiếng |
| S08 | [Cổng du lịch Hoàn Kiếm — Đình Yên Thái, không ghi ngày bài](https://hoankiem360.tourism.vn/chi_tiet_di_tich_lich_su/dinh-yen-thai.html) | Nguồn địa phương cho nhận diện/thờ tự; không lấy đồng hồ trang làm ngày bài |
| S10 | [Hanoi Heritage Map — Đền Vọng Tiên, không ghi ngày bài](https://heritage-itineraries.com/di-tich/den-vong-tien) | Nguồn biên soạn cho thờ tự và legend; địa chỉ nội bộ chưa nhất quán; chưa đọc tài liệu Hán Nôm được trang liên kết |
| S14 | [Báo Mới đăng lại Hà Nội TV — Không gian nghệ thuật công cộng, 14/01/2025](https://baomoi.com/hoan-kiem-co-them-khong-gian-nghe-thuat-cong-cong-c51239564.epi) | Đã đọc mirror; [bản gốc được liên kết](https://hanoionline.vn/video/hoan-kiem-co-them-khong-gian-nghe-thuat-cong-cong-295840.htm) không truy cập được: `PENDING_EXTERNAL_VERIFICATION`. Không coi mirror là khảo sát 2026 |
| S15 | [VOV Giao thông — Ngõ Hội Vũ, 08/02/2025](https://vovgiaothong.vn/newsaudio/ngo-hoi-vu--mot-phan-cua-ky-uc-ha-noi-d43196.html) | Mô tả báo chí có ngày; đoạn Cô Tư Hồng mang lời tương truyền, không hồ sơ sở hữu/tiểu sử gốc |

## 2. Chùa Cầu Đông — `ngo-gach-chua-cau-dong`

### A. Identity

Collection `ngo-gach`; node **5/5**, start/order KEEP. Current editorial classification: **MINOR_REVISION**. Claims **G11–G12**, nguồn **S24**. Điểm di sản liên quan **ngoài chính ngõ**, không route. Scope tương lai chỉ `nodes[id=ngo-gach-chua-cau-dong]` trong cặp VI/EN, chưa có quyền ghi JSON.

### B. Current weaknesses

Story hiện tại đã có attribution nhưng nặng tường thuật nghiên cứu và niên đại ước định; caption nhắc “đầu tây” như một bài toán định tuyến. Không cần sửa summary vốn nhận diện đúng hướng. **KEEP:** name VI, summary VI/EN, ID/order/GPS/QR/evidence gốc. **Đề xuất đổi:** name EN để khớp dấu tiếng Việt/glossary Batch A, caption và story VI/EN. Không thêm intro audio/guide/alleyStory cho Gạch.

### C. Vietnamese candidate — `DRAFT_NOT_APPROVED`

Name, summary: **KEEP**.

**B-G-CAP-VI — caption**

> Chùa Cầu Đông trên phố Hàng Đường — địa điểm di sản liên quan ngoài ngõ Gạch.

**B-G-STORY-VI — story**

> Một pho tượng có thể mở ra câu hỏi về cách người xưa được nhớ đến. Tại chùa Cầu Đông trên phố Hàng Đường, bài viết của Báo Pháp Luật năm hai nghìn không trăm hai mươi ghi nhận hai pho tượng gỗ được nhận diện là Trần Thủ Độ và Trần Thị Dung. Bài viết chưa giải đáp được gốc tích của cặp tượng. Giữ lại câu hỏi ấy cũng là một cách trân trọng di sản, thay vì lấp khoảng trống bằng một lời giải đoán thêm.

### D. English candidate — `DRAFT_NOT_APPROVED`

Summary: **KEEP**.

**B-G-NAME-EN — name**

> Cầu Đông Pagoda

**B-G-CAP-EN — caption**

> Cầu Đông Pagoda on Hàng Đường Street — a related heritage site outside Gạch Alley.

**B-G-STORY-EN — story**

> A statue can invite us to ask how people from the past are remembered. At Cầu Đông Pagoda on Hàng Đường Street, a Báo Pháp Luật article from twenty twenty describes two wooden statues identified as Trần Thủ Độ and Trần Thị Dung. The article leaves their origins unresolved. Leaving that question open can itself be a way of respecting heritage, rather than filling the gap with a guess.

### E. Fact traceability

| Candidate sentence/field | Claim → source | Original status | Usage condition / disposition |
| --- | --- | --- | --- |
| Story câu 2 VI/EN; caption; name EN | G11/G12 → S24 | PARTIALLY_SUPPORTED | SUPPORTED_FOR_DRAFT qua nhận diện báo chí; không biến thành kết luận giám định |
| Story câu 3 VI/EN | G12 → S24 | PARTIALLY_SUPPORTED | Chỉ nói giới hạn bài 2020, không tuyên bố vĩnh viễn không có hồ sơ |
| Story câu 1, 4 VI/EN | Diễn giải biên tập mới, không claim lịch sử mới | EDITORIAL_INTERPRETATION, không thêm row ledger | PENDING_HUMAN_DECISION; không giải thích ai đặt tượng/vì sao |
| Caption “ngoài ngõ” | G11 → S24; khung D4 | PARTIALLY_SUPPORTED | Không chứng nhận tuyến/cửa vào/khoảng cách |
| Omission: niên đại tượng, “duy nhất”, độ gần/38B trong lời kể | G11/G12 → S24 | PARTIALLY_SUPPORTED | Proposed omission; không phủ nhận địa chỉ trong nguồn, không chọn niên đại chính xác |

### F. Approval dependency

**D4/D7**, liên quan D6 về không mở cấu trúc Gạch. Cần duyệt caption supporting place, tên EN có dấu, exact story và omission niên đại. Gốc tích/niên đại vật thể, cửa vào/quyền tiếp cận còn pending; không cần đoán để có bản kể giới hạn. Summary KEEP vẫn là attribution ở cấp hồ sơ, chưa thành VERIFIED.

### G. Voice impact preview

Story VI/EN đổi: **2 changed-text candidates**, không dùng clip cũ cho chữ mới. Name EN/caption là display trong hai pipeline ngõ; summary KEEP. Bốn story Gạch còn lại/locale giữ chữ trong Batch B nên chỉ **ứng viên reuse**, còn phụ thuộc revision và preflight D7. Không tạo track intro mới.

## 3. Phở Sướng — `trung-yen-pho-suong`

### A. Identity

Collection `ngo-trung-yen`; node **1/5**, start KEEP. **MINOR_REVISION**. Claims **T07/T12**, nguồn S06/B2B-B-S01, S05 hỗ trợ bối cảnh. Không coi mốc tuổi quán trong bài cũ là tuổi tính tới hôm nay.

### B. Current weaknesses

Summary/caption dùng “lâu năm”, vị trí đầu ngõ và sự công nhận của khách như hiện trạng. Story có câu phủ định ranking rồi hướng người nghe đi tiếp, làm đứt trục tên gọi. **KEEP:** name VI/EN và dữ liệu bất biến. **Đổi:** summary/caption/story VI/EN; không sửa guide trong phiên này.

### C. Vietnamese candidate — `DRAFT_NOT_APPROVED`

Name: **KEEP**.

**B-TS-SUM-VI — summary**

> Chuyện tên Phở Sướng và mong muốn gửi gắm trong tên gọi, theo bài báo được đăng lại năm 2021.

**B-TS-CAP-VI — caption**

> Phở Sướng — câu chuyện tên gọi qua ghi chép báo chí năm 2021.

**B-TS-STORY-VI — story**

> Chữ Sướng trong tên một hàng phở gửi gắm điều gì? Bài báo được đăng lại năm hai nghìn không trăm hai mươi mốt kể rằng người chủ chọn tên ấy với mong muốn thực khách thấy vui và thỏa lòng sau bát phở. Một ước mong giản dị đặt ngay trong tên quán, để câu chuyện về bát phở bắt đầu từ tâm ý người bán.

### D. English candidate — `DRAFT_NOT_APPROVED`

Name: **KEEP**.

**B-TS-SUM-EN — summary**

> The wish behind the name Phở Sướng, as told in a newspaper story republished in 2021.

**B-TS-CAP-EN — caption**

> Phở Sướng — a name story recorded in the press in 2021.

**B-TS-STORY-EN — story**

> What wish might a pho shop carry in its name? A newspaper story republished in twenty twenty-one says the owner chose Sướng to express the hope that diners would feel happy and satisfied after a bowl of pho. That simple wish, held in a name, lets the story of a bowl of pho begin with its maker's hopes.

### E. Fact traceability

| Candidate sentence/field | Claim → source | Original status | Usage condition / disposition |
| --- | --- | --- | --- |
| Story câu 2 VI/EN; summary/caption | T07 → S06/B2B-B-S01 | PARTIALLY_SUPPORTED | SUPPORTED_FOR_DRAFT theo lời kể báo chí; mốc năm là bản đăng lại, không chứng thư lập quán |
| Story câu 1, 3 VI/EN | Diễn giải từ câu chuyện T07 | EDITORIAL_INTERPRETATION mới, không đổi ledger | PENDING_HUMAN_DECISION; “tâm ý/hopes” là cách đọc mong muốn, không review món |
| Omission: khoảng ba mươi năm, ranking, khách quen, vị trí cửa ngõ/giờ/đi tiếp | T07/T12 → S06 và nguồn vận hành trong ledger | PARTIALLY_SUPPORTED / UNVERIFIED | Proposed omission; không cộng thêm năm hoặc bảo đảm quán đang mở |

### F. Approval dependency

**D5/D7**. Duyệt cách kể tên với mốc 2021 và câu kết không quảng cáo; không dùng tên như bảo đảm chất lượng. Menu, giờ bán, địa chỉ/cửa thực tế thuộc T12 còn pending; chưa xác nhận hiện trạng. Không cần D1 để viết chuyện này, nhưng consistency collection vẫn có D1 từ Batch A.

### G. Voice impact preview

Story VI/EN: **2 changed-text candidates**. Summary/caption đổi display, name KEEP; không có clip riêng cho các field display này trong hai pipeline ngõ. Story/intro Trung Yên không đổi chữ vẫn cần kiểm revision khi gate mở, không tự repin hoặc thay guard.

## 4. Bún cá Sâm Cây Si — `trung-yen-bun-ca-sam-cay-si`

### A. Identity

Collection `ngo-trung-yen`; node **3/5**. **MINOR_REVISION**. Claims **T08/T09/T12**. S07 là nguồn trực tiếp qua phỏng vấn cho tên; S05/S06 có các lời kể khác, không gộp thành bằng chứng độc lập cho toàn hành trình quán.

### B. Current weaknesses

Story ghép tên người/cây, chuyển địa điểm, món đặc sản và tên đùa thành đoạn báo cáo dài. Node evidence chưa có S07 dù đây là nguồn đúng cho trục tên. **KEEP:** name VI/EN, IDs và provenance cũ. **Đổi:** summary/caption/story VI/EN. Đề xuất append S07 ở gate tương lai, không thay array thực hoặc xóa nguồn cũ.

### C. Vietnamese candidate — `DRAFT_NOT_APPROVED`

Name: **KEEP**.

**B-TC-SUM-VI — summary**

> Tên bà Sâm và một cây si trong ký ức gia đình về hàng bún cá, theo lời kể trên VnExpress năm 2024.

**B-TC-CAP-VI — caption**

> Bún cá Sâm Cây Si — chuyện tên quán qua lời người nhà được ghi lại năm 2024.

**B-TC-STORY-VI — story**

> Trong tên Bún cá Sâm Cây Si có cả tên một người lẫn dấu nhớ về một cái cây. Qua lời người nhà được VnExpress ghi lại năm hai nghìn không trăm hai mươi bốn, bà Sâm từng mở hàng gần một cây si; tên gọi giúp khách nhận ra hàng bún của bà. Tên người và dấu mốc quen thuộc đi cùng nhau. Một tên gọi giản dị có thể mang theo ký ức gia đình mỗi lần được nhắc lên.

### D. English candidate — `DRAFT_NOT_APPROVED`

Name: **KEEP**.

**B-TC-SUM-EN — summary**

> Sâm and a si tree in a family's memory of its fish-noodle shop, as recounted to VnExpress in 2024.

**B-TC-CAP-EN — caption**

> Bún cá Sâm Cây Si — a family account of the shop's name recorded in 2024.

**B-TC-STORY-EN — story**

> The name Bún cá Sâm Cây Si holds both a person's name and the memory of a tree. In a family account recorded by VnExpress in twenty twenty-four, Sâm once sold her fish noodle soup near a si tree, which helped customers recognize her stall. A name and a familiar landmark belong together here. A simple name can carry a family's memory each time it is spoken.

### E. Fact traceability

| Candidate sentence/field | Claim → source | Original status | Usage condition / disposition |
| --- | --- | --- | --- |
| Story câu 1–2 VI/EN; summary/caption | T08 → S07 | PARTIALLY_SUPPORTED | SUPPORTED_FOR_DRAFT như lời người nhà trên báo; “si tree” giữ tên cây, không xác định loài thực vật |
| Story câu 3–4 VI/EN | Cách diễn giải motif tên từ T08 | EDITORIAL_INTERPRETATION mới | PENDING_HUMAN_DECISION; không tạo ký ức/quote nhân chứng mới |
| Omission: chuyển từ chợ Hàng Bè | T08 → S05 có câu kể này, S07 không đủ cho toàn hành trình | PARTIALLY_SUPPORTED, **giữ nguyên ledger** | Có bài viết không đồng nghĩa đã đối chiếu lịch sử gia đình; proposed omission, không nói “không có nguồn viết” |
| Omission: tên đùa/“đặc sản” như menu hôm nay | T09/T12 → S06 | PARTIALLY_SUPPORTED / UNVERIFIED | Không phủ nhận món cá cuốn thịt được báo nhắc; chưa dùng lời quảng bá/vận hành hiện tại |

### F. Approval dependency

**D5/D7**. Duyệt trục ký ức gia đình, từ “si tree”, cách attribution và omission. S05 mới được xác nhận có câu chuyển địa điểm; không cập nhật status T08 bằng phiên drafting này. **Sâu hơn về migration: NEEDS_MORE_EVIDENCE**; bản tên gọi giới hạn vẫn đủ để duyệt. Caveat hành trình nằm ở hồ sơ review, không cần đọc trong story khi claim đã được lược.

### G. Voice impact preview

Story VI/EN: **2 changed-text candidates**. Summary/caption và proposed evidence append không có track riêng nhưng đổi whole-dataset revision nếu sau này tích hợp. Không dùng audio đang có làm chứng cứ tên/nguồn đã được duyệt. Unchanged stories chỉ là ứng viên reuse sau preflight.

## 5. Bún ngan Nhàn — `trung-yen-bun-ngan-nhan`

### A. Identity

Collection `ngo-trung-yen`; node **4/5**. **MINOR_REVISION**. Claims **T10/T12**, nguồn S06/B2B-B-S01, S05. T10 vẫn là đánh giá danh tiếng có thời điểm, không đổi thành VERIFIED. Phần nhận diện món trong nguồn là phạm vi dùng giới hạn dưới cùng hồ sơ, không đặt claim ID giả.

### B. Current weaknesses

Summary/caption khẳng định hàng đợi, vị trí cạnh quán khác và nước dùng; story dựng trục “Nhàn mà chẳng nhàn” từ nhận xét phục vụ. Việc nhắc lại rồi phủ định vẫn khuếch đại đánh giá cá nhân. **KEEP:** name VI/EN. **Đổi:** summary/caption/story VI/EN. Chọn **story ngắn** vì ít facts bền vững; không bịa lịch sử gia đình để làm dài.

### C. Vietnamese candidate — `DRAFT_NOT_APPROVED`

Name: **KEEP**.

**B-TN-SUM-VI — summary**

> Một nét đời sống ẩm thực Trung Yên qua bún ngan Nhàn trong ghi chép báo chí năm 2021 và 2024.

**B-TN-CAP-VI — caption**

> Bún ngan Nhàn trong ghi chép ẩm thực Trung Yên năm 2024.

**B-TN-STORY-VI — story**

> Bún ngan Nhàn góp một món ăn vào câu chuyện Trung Yên: bún, thịt ngan và nước dùng, như bài báo được đăng lại năm hai nghìn không trăm hai mươi mốt từng ghi nhận. Ta có thể bắt đầu từ bát bún giản dị ấy để nghĩ về đời sống thường ngày giữa phố cổ. Một món ăn cũng có chỗ trong ký ức đô thị, không chỉ những công trình lớn.

### D. English candidate — `DRAFT_NOT_APPROVED`

Name: **KEEP**.

**B-TN-SUM-EN — summary**

> A glimpse of Trung Yên's food life through Bún ngan Nhàn, as recorded in press accounts from 2021 and 2024.

**B-TN-CAP-EN — caption**

> Bún ngan Nhàn in a 2024 account of food in Trung Yên.

**B-TN-STORY-EN — story**

> Bún ngan Nhàn adds a dish to the story of Trung Yên: rice noodles, Muscovy duck and broth, as described in a newspaper story republished in twenty twenty-one. That simple bowl can be a starting point for thinking about everyday life in the Old Quarter. Food, as well as grand buildings, can have a place in a city's memory.

### E. Fact traceability

| Candidate sentence/field | Claim → source | Original status | Usage condition / disposition |
| --- | --- | --- | --- |
| Story câu 1 VI/EN; summary phần 2021 | T10, phần nhận diện món của hồ sơ nguồn → S06/B2B-B-S01 | PARTIALLY_SUPPORTED | SUPPORTED_FOR_DRAFT chỉ ở mô tả có ngày; không kéo theo service/ranking trong cùng bài |
| Summary/caption phần 2024 | T10, nhận diện trong source family bổ sung S05 | PARTIALLY_SUPPORTED; không bổ sung VERIFIED | Chỉ nói báo có ghi nhận tên, không chứng minh quán đang hoạt động |
| Story câu 2–3 VI/EN | Suy ngẫm biên tập mới | EDITORIAL_INTERPRETATION, không thêm claim lịch sử | PENDING_HUMAN_DECISION; không ký ức của người cụ thể, không lời khen chất lượng |
| Omission: queue, tính cách, ranking, giờ bán, chuyển cảnh Hương Trà | T10/T12 | PARTIALLY_SUPPORTED / UNVERIFIED | Proposed omission theo D5; không kết luận các trải nghiệm đã được chứng minh sai |

### F. Approval dependency

**D5/D7**. Human chọn bản ngắn này hoặc yêu cầu nghiên cứu thêm, không yêu cầu bù độ dài. **Story sâu hơn/tiểu sử người bán: NEEDS_MORE_EVIDENCE**. Menu/hours/access hiện tại chưa xác nhận. Không biến thông tin đầu bếp/công thức/món khác từ suy đoán thành fact để tăng hấp dẫn.

### G. Voice impact preview

Story VI/EN: **2 changed-text candidates**, có chủ ý ngắn hơn, không quy đổi thành paid duration/batch. Summary/caption đổi display. Các clip không đổi chữ trong collection chỉ có thể reuse sau khi giữ exact text và được review scope/revision/audio provenance.

## 6. Đình Yên Thái — `tam-thuong-dinh-yen-thai`

### A. Identity

Collection `ngo-tam-thuong`; node **1/2**, start KEEP; di tích chính của trải nghiệm. **MINOR_REVISION**. Claims **A02/A03/A04**; S08, S11 trong ledger. S08 đã mở lại; S11 không tính là corroboration độc lập và không tuyên bố mở lại trong phiên này.

### B. Current weaknesses

Name/summary/caption đã giữ đúng trục thờ tự, không cần thay cho đẹp. Story đưa alias, xếp hạng và khoảng niên đại hiện vật thành danh sách, rồi chuyển sang Vọng Tiên. **KEEP:** name/summary/caption VI/EN. **Chỉ đổi story VI/EN**; giảm list không có nghĩa xóa artifacts khỏi provenance.

### C. Vietnamese candidate — `DRAFT_NOT_APPROVED`

Name, summary, caption: **KEEP**.

**B-AY-STORY-VI — story**

> Trong câu chuyện về ngõ Tạm Thương, đình Yên Thái mở ra một mạch ký ức khác: sự tưởng nhớ qua thờ tự. Cổng du lịch Hoàn Kiếm giới thiệu đình ở số tám ngõ Tạm Thương là nơi thờ Nguyên phi Ỷ Lan. Từ một tên ngõ sang tên người được thờ, ta có thể nghĩ về di sản không chỉ qua những gì đã đổi thay, mà còn qua điều được gìn giữ trong tín ngưỡng cộng đồng.

### D. English candidate — `DRAFT_NOT_APPROVED`

Name, summary, caption: **KEEP**.

**B-AY-STORY-EN — story**

> Within the story of Tạm Thương Alley, Yên Thái Communal House opens another strand of memory: remembrance through worship. Hoàn Kiếm's tourism portal identifies the site at number eight Tạm Thương Alley as a place honoring Imperial Consort Ỷ Lan. From an alley's name to the name of someone honored there, we can think about heritage through more than change alone, and consider what is preserved in a community's beliefs.

### E. Fact traceability

| Candidate sentence/field | Claim → source | Original status | Usage condition / disposition |
| --- | --- | --- | --- |
| Story câu 2 VI/EN; name/summary/caption KEEP | A02 → S08/S11 | VERIFIED trong ledger | SUPPORTED_FOR_DRAFT; thờ tự không là xác nhận biography, năm xây hay access |
| Story câu 1, 3 VI/EN | Diễn giải biên tập dựa A02 | EDITORIAL_INTERPRETATION mới | PENDING_HUMAN_DECISION; không suy ra thực hành liên tục từ triều Lý tới nay |
| Omission: alias Quán Linh Từ | A03 → S30, chưa hồ sơ gốc | UNVERIFIED | Proposed omission; không tự tạo alias tiếng Anh |
| Omission: 1995, số sắc/niên đại vật thể | A04 → S08/S09 trong ledger | PARTIALLY_SUPPORTED | Chưa quyết định gốc, số 7/10 còn khác; không chọn một số hoặc coi 1995 là năm xây |

### F. Approval dependency

**D7** cho exact text; **D5** chỉ liên quan consistency giờ/vé ở guide, không dependency nội dung thờ tự A02. Duyệt câu diễn giải cộng đồng và glossary “Imperial Consort”. Alias/năm khởi dựng/số sắc vẫn pending; không biến bản ngắn thành approval cả hồ sơ. Yên Thái vẫn là di tích chính; Vọng Tiên không thay vai trò này.

### G. Voice impact preview

Story VI/EN: **2 changed-text candidates**; display node KEEP. Intro Tạm Thương chưa có exact replacement trong Batch B; nếu giữ exact text chỉ là ứng viên reuse, dù revision thay do story. Phần intro/guide unresolved được tách ở matrix, không sửa audio hay tự coi toàn intro đã duyệt.

## 7. Đền Vọng Tiên — `tam-thuong-den-vong-tien`

### A. Identity

Collection `ngo-tam-thuong`; node **2/2**. **MINOR_REVISION**. Claims **A05/A06/A07**, đối chiếu **C08** của Batch A; S10. Supporting place ngoài chính ngõ. Giữ node riêng, không hợp nhất/đổi ID với `cam-chi-den-vong-tien`.

### B. Current weaknesses

Story đã tự chứa nhưng còn địa chỉ chắc chắn và giọng “nguồn đang kiểm”; summary/caption cần attribution thờ tự. Guide cũng chưa phân biệt độ chắc giữa địa chỉ/legend/access. **KEEP:** name VI/EN. **Đổi:** summary/caption/story VI/EN. Chỉ nêu hướng xử lý guide ở matrix, không tự viết lại toàn guide.

### C. Vietnamese candidate — `DRAFT_NOT_APPROVED`

Name: **KEEP**.

**B-AV-SUM-VI — summary**

> Điểm di sản liên quan ngoài ngõ Tạm Thương; Hanoi Heritage Map giới thiệu việc thờ Mẫu và truyền thuyết Vọng Tiên.

**B-AV-CAP-VI — caption**

> Theo Hanoi Heritage Map: nơi thờ Mẫu gắn với truyền thuyết Vọng Tiên, ngoài chính ngõ Tạm Thương.

**B-AV-STORY-VI — story**

> Một cuộc gặp qua thơ mở đầu truyền thuyết Vọng Tiên mà Hanoi Heritage Map ghi lại. Trong truyện, vua Lê Thánh Tông gặp một người con gái ở Ngọc Hồ và cùng nàng đối đáp thơ; sau khi nàng biến mất, nhà vua cho dựng lầu Vọng Tiên. Đó là mạch chuyện dân gian, không phải sự kiện lịch sử đã được xác minh. Còn đền Vọng Tiên, được giới thiệu ở đây như một điểm liên quan ngoài ngõ Tạm Thương, là nơi thờ Mẫu theo cùng nguồn tư liệu.

### D. English candidate — `DRAFT_NOT_APPROVED`

Name: **KEEP**.

**B-AV-SUM-EN — summary**

> A related heritage site outside Tạm Thương Alley; Hanoi Heritage Map presents its Mother Goddess worship and the Vọng Tiên legend.

**B-AV-CAP-EN — caption**

> A place of Mother Goddess worship linked to the Vọng Tiên legend, outside Tạm Thương Alley, according to Hanoi Heritage Map.

**B-AV-STORY-EN — story**

> An encounter through poetry begins the Vọng Tiên legend recorded by Hanoi Heritage Map. In the tale, King Lê Thánh Tông meets a young woman at Ngọc Hồ and exchanges verses with her; after she vanishes, he has Vọng Tiên Pavilion built. This is folklore, not a verified historical event. Vọng Tiên Temple, presented here as a related site outside Tạm Thương Alley, is described by the same source as a place of Mother Goddess worship.

### E. Fact traceability

| Candidate sentence/field | Claim → source | Original status | Usage condition / disposition |
| --- | --- | --- | --- |
| Story câu 1–3 VI/EN; nhãn legend trong display | A06 → S10 | LEGEND | SUPPORTED_FOR_DRAFT chỉ như truyện; mở trực tiếp vẫn hiểu; không suy niên đại xây công trình hiện tại |
| Story câu 4 phần thờ tự; summary/caption | A07/C08 → S10 | PARTIALLY_SUPPORTED | Có attribution ở cả hai locale; không suy nghi lễ/di sản UNESCO của riêng đền |
| Story câu 4 phần ngoài ngõ; summary/caption | A05 → S10; D4 | PARTIALLY_SUPPORTED | Supporting place, không route/GPS/access; Ngọc Hồ trong legend không là địa chỉ đền hiện nay |
| Omission: 120B và lịch di chuyển/trùng tu/giờ mở cửa | A05/A11 → S10 | PARTIALLY_SUPPORTED | Proposed omission; nguồn ghi Hàng Bông/Cửa Nam chưa thống nhất, không chọn tên địa chỉ thay thế |

### F. Approval dependency

**D4/D7**. Human duyệt mở đầu đối thơ, nhãn legend, attribution thờ tự, ngoài ngõ và fact sheet chung Batch A. Chưa có bằng chứng phê duyệt bản Cấm Chỉ; cả hai cùng pending. Exact address/entrance/access/niên đại đền/lầu còn pending. Không cần nghe/mở collection kia để hiểu bản này; không trộn vua/legend Chúa Chổm.

### G. Voice impact preview

Story VI/EN: **2 changed-text candidates**, không dùng lại story Cấm Chỉ làm cùng một clip theo ID khác. Name KEEP, summary/caption đổi display. Unchanged text của bất kỳ slot nào cần exact scope/text/provenance/revision review, không mặc định reuse do cùng tên đền.

## 8. Không gian nghệ thuật — `cam-chi-khong-gian-nghe-thuat`

### A. Identity

Collection `ngo-cam-chi`; node **1/3**, start KEEP. **MINOR_REVISION**. Claims **C04/C05**. S14 mirror đã đọc; bản gốc `PENDING_EXTERNAL_VERIFICATION`. Tên node đang là Không gian nghệ thuật công cộng Tống Duy Tân / Tống Duy Tân Public Art Space, không đổi thành tên một di tích cổ.

### B. Current weaknesses

Summary/caption dạng mệnh lệnh “quan sát” không có mốc thời gian. Story lặp motif ngăn cấm/đón khách từ intro; dễ hòa hiện trạng đương đại vào legend. **KEEP:** name VI/EN. **Đổi:** summary/caption/story VI/EN, giữ đây là dự án được báo giới thiệu năm 2025. URL Hà Nội Online trong runtime khác URL bản gốc được mirror liên kết; không âm thầm xóa provenance hoặc coi URL cũ đã xác minh.

### C. Vietnamese candidate — `DRAFT_NOT_APPROVED`

Name: **KEEP**.

**B-CA-SUM-VI — summary**

> Không gian nghệ thuật công cộng tại khu vực Tống Duy Tân được Hà Nội TV giới thiệu trong bản tin đăng lại tháng 1/2025.

**B-CA-CAP-VI — caption**

> Cổng nghệ thuật lấy cảm hứng từ cửa Đại Hưng, theo bản tin đăng lại tháng 1/2025; không phải cổng thành cổ nguyên gốc.

**B-CA-STORY-VI — story**

> Ký ức đô thị cũng có thể được kể bằng một sáng tạo mới. Bản tin Hà Nội TV được đăng lại tháng một năm hai nghìn không trăm hai mươi lăm giới thiệu không gian nghệ thuật công cộng Tống Duy Tân, với cổng lấy cảm hứng từ cửa Đại Hưng và tượng người gánh phở. Một hình ảnh gợi thành xưa, một hình ảnh gợi nghề ăn uống: đặt cạnh nhau, chúng mời ta nghĩ về cách thành phố kể lại mình. Đây là sáng tạo đương đại được bản tin giới thiệu, không phải cổng thành cổ còn nguyên.

### D. English candidate — `DRAFT_NOT_APPROVED`

Name: **KEEP**.

**B-CA-SUM-EN — summary**

> A public art space in the Tống Duy Tân area, featured in a Hanoi TV report republished in January 2025.

**B-CA-CAP-EN — caption**

> An art gateway inspired by Đại Hưng Gate, in a report republished in January 2025; not an original surviving city gate.

**B-CA-STORY-EN — story**

> Urban memory can also be told through something newly created. A Hanoi TV report republished in January twenty twenty-five introduces the Tống Duy Tân public art space, with a gateway inspired by Đại Hưng Gate and a statue of a pho vendor. One image evokes the old city, the other its food trades; together, they invite us to consider how a city tells its own story. These are contemporary creations described in that report, not an original surviving city gate.

### E. Fact traceability

| Candidate sentence/field | Claim → source | Original status | Usage condition / disposition |
| --- | --- | --- | --- |
| Story câu 2, 4 VI/EN; summary/caption | C04 → S14 mirror | PARTIALLY_SUPPORTED | SUPPORTED_FOR_DRAFT với mốc bài; không khẳng định hiện trạng 2026, ngày bản gốc hay phục dựng xác thực |
| Story câu 1, 3 VI/EN | Diễn giải editorial mới từ C04 | EDITORIAL_INTERPRETATION mới | PENDING_HUMAN_DECISION; không phải lời nghệ sĩ/ý đồ thiết kế đã phỏng vấn |
| Omission motif “ngăn cấm → mở lòng” | C05 (runtime) | EDITORIAL_INTERPRETATION | Proposed omission để tránh lặp intro; không biến ẩn dụ thành chính sách lịch sử |
| Không đưa vào candidate | C01/C02/C03 | LEGEND / PARTIALLY_SUPPORTED / UNVERIFIED | Không dùng legend để giải niên đại công trình; không xác nhận khu ẩm thực mở từ đầu 2000s |

### F. Approval dependency

**D7**; D5 chỉ cho mặt guide kinh doanh ngoài scope, không dependency của cổng nghệ thuật. Duyệt phân biệt sáng tạo/di tích, mốc bản đăng lại, câu suy ngẫm không mạo nhận ý đồ tác giả. Bản gốc/hồ sơ dự án và hiện trạng còn pending; mirror đủ cho candidate được quy nguồn, không đủ xác nhận bảo tồn/tiếp cận hôm nay.

### G. Voice impact preview

Story VI/EN: **2 changed-text candidates**. Summary/caption đổi display, name KEEP. Intro Cấm Chỉ KEEP chữ trong Batch B; không sửa hook/audio để khắc phục revision mismatch. D7 phải xem lại toàn perimeter catalogue của collection khi có quyền tích hợp.

## 9. Ngõ Hội Vũ — `cam-chi-ngo-hoi-vu`

### A. Identity

Collection `ngo-cam-chi`; node **2/3**, supporting place ngoài ngõ Cấm Chỉ. **MINOR_REVISION**. Claims **C06/C07**; S15. Không đồng nhất nhãn map/schematic với quyền đi qua hoặc vào nhà riêng.

### B. Current weaknesses

Summary/caption không gắn mô tả với thời điểm nguồn. Story dài, chuyển cảnh về Cấm Chỉ và nói thiếu nguồn viết trong khi chính S15 là nguồn viết cho lời tương truyền. **KEEP:** name VI/EN. **Đổi:** summary/caption/story VI/EN. Không chuyển lời báo thành quan sát trực tiếp, không thêm biography/quyền sở hữu.

### C. Vietnamese candidate — `DRAFT_NOT_APPROVED`

Name: **KEEP**.

**B-CH-SUM-VI — summary**

> Hội Vũ, điểm liên quan ngoài ngõ Cấm Chỉ, qua ghi chép ký ức đô thị của VOV Giao thông tháng 2/2025.

**B-CH-CAP-VI — caption**

> Hội Vũ qua ghi chép VOV Giao thông năm 2025 — một lớp ký ức đô thị ngoài ngõ Cấm Chỉ.

**B-CH-STORY-VI — story**

> Trong ghi chép tháng hai năm hai nghìn không trăm hai mươi lăm, VOV Giao thông kể về Hội Vũ, con ngõ nối Hàng Bông, Quán Sứ và Tràng Thi, với những ngôi nhà cũ xen kiến trúc mới. Bài viết còn nhắc Cô Tư Hồng qua lời tương truyền, trong đó có chuyện bà giúp người gặp thiên tai. Đó là một lớp lời kể được báo ghi lại, không phải hồ sơ xác nhận tiểu sử hay quyền sở hữu nhà. Hội Vũ vì thế có thể được lắng nghe như ký ức đô thị nhiều lớp: có không gian được mô tả, có câu chuyện còn cần đối chiếu.

### D. English candidate — `DRAFT_NOT_APPROVED`

Name: **KEEP**.

**B-CH-SUM-EN — summary**

> Hội Vũ, a related site outside Cấm Chỉ Alley, through VOV Giao thông's account of urban memory from February 2025.

**B-CH-CAP-EN — caption**

> Hội Vũ in VOV Giao thông's 2025 account — a layer of urban memory beyond Cấm Chỉ Alley.

**B-CH-STORY-EN — story**

> In a February twenty twenty-five account, VOV Giao thông describes Hội Vũ as an alley linking Hàng Bông, Quán Sứ and Tràng Thi, where older houses stand among newer buildings. The article also recounts local tradition about Cô Tư Hồng, including a story of helping people facing natural disasters. This is an account recorded in the press, not documentary proof of biography or property ownership. We can listen to Hội Vũ as layered urban memory: a described setting alongside stories still open to further checking.

### E. Fact traceability

| Candidate sentence/field | Claim → source | Original status | Usage condition / disposition |
| --- | --- | --- | --- |
| Story câu 1 VI/EN; summary/caption phần nguồn | C06 → S15 | PARTIALLY_SUPPORTED | SUPPORTED_FOR_DRAFT theo bài 2025, không xác nhận lối hiện mở hoặc mọi nhà là biệt thự |
| Story câu 2–3 VI/EN | C07 → S15 | LEGEND | Có attribution lời tương truyền; chưa hồ sơ gốc, không kể chuyện từ thiện như fact đã kiểm |
| Story câu 4 VI/EN | Diễn giải biên tập từ ranh giới C06/C07 | EDITORIAL_INTERPRETATION mới | PENDING_HUMAN_DECISION, không quote/ghi nhớ người dân tự tạo |
| Summary/caption phần ngoài ngõ | C06 + khung D4 | PARTIALLY_SUPPORTED | Không chỉ đường hoặc bảo đảm quyền vào tư gia |
| Omission: sở hữu nhà, danh hiệu, lời dân/độ yên tĩnh như hiện trạng | C06/C07 → S15 | PARTIALLY_SUPPORTED / LEGEND | Proposed omission; không phủ nhận bài có viết, không hợp thức hóa bằng disclaimer chung |

### F. Approval dependency

**D4/D7**. Cần human chọn giữ hay lược cả câu truyền miệng Cô Tư Hồng; đề xuất giữ ngắn với nhãn rõ, nhưng chưa duyệt. Biography/sở hữu/từ thiện như lịch sử trực tiếp: **NEEDS_MORE_EVIDENCE**. Khảo sát lối công cộng/quyền ảnh/cửa vào tư gia là gate riêng; không cần để duyệt bản không chỉ đường này.

### G. Voice impact preview

Story VI/EN: **2 changed-text candidates**. Summary/caption đổi display. Nếu human bỏ câu Cô Tư Hồng, phải chốt lại exact VI/EN trước preflight; không ghép clip cũ, không dùng integrity test thay listening/content approval.

## 10. Glossary bổ sung để human duyệt

Kế thừa glossary Batch A, không sửa tài liệu đó. Toàn bộ **PENDING_HUMAN_APPROVAL**.

| VI | EN đề xuất | Ranh giới |
| --- | --- | --- |
| Cầu Đông; Trần Thủ Độ; Trần Thị Dung | Giữ dấu tên riêng; Cầu Đông Pagoda | Đổi display EN không đổi ID/alias/command matcher |
| Phở Sướng | Giữ tên; a wish for happiness/satisfaction khi giải thích | Không chuyển thành nhãn chất lượng hoặc dịch tên quán |
| Bún cá Sâm Cây Si; cây si | Giữ tên quán; fish noodle soup; a si tree | Không định danh loài thực vật hoặc tự respell tên |
| Cá cuốn thịt | Fish wrapped around a meat filling | Nếu sau này dùng phải gắn source/date; không gọi spring roll/meat wrapped around fish; không khẳng định đang bán. Candidate hiện không đưa món này vào story |
| Bún ngan Nhàn; ngan | Giữ tên quán; rice noodles with Muscovy duck; Muscovy duck | Theo glossary Batch A, không đổi thành chicken hoặc cá; bản này không thêm công thức |
| Nguyên phi Ỷ Lan | Imperial Consort Ỷ Lan | Không thêm biography/chức vị khác |
| Lầu Vọng Tiên / Đền Vọng Tiên | Vọng Tiên Pavilion / Vọng Tiên Temple | Lầu trong legend không đồng nhất công trình đền ngày nay; “Ngọc Hồ” không là địa chỉ hiện tại |
| Cổng lấy cảm hứng từ cửa Đại Hưng | Gateway inspired by Đại Hưng Gate | Không ancient gate/original/reconstruction proven authentic |
| Tượng người gánh phở | Statue of a pho vendor | Không bịa tên người mẫu/nghệ sĩ/ý đồ thiết kế |
| Cô Tư Hồng; lời tương truyền | Giữ tên; local tradition/an account passed down | Không documentary record/property deed/verified biography |

## 11. Review gate và voice boundary chung

**43 proposed replacement strings:** 16 story + 12 summary + 14 caption + 1 name EN. Các field KEEP không có replacement lặp lại. Đây là count biên tập, không patch runtime hoặc số job audio.

**16/16 stories dự kiến khác exact runtime text**, chưa có string nào approved. Không có intro replacement trong Batch B. Summary/caption/name/evidence không có track riêng trong hai generator ngõ; screen reader có thể đọc, Qa có summary fallback khi thiếu story nên không gọi display là “không bao giờ spoken”.

Theo contract hiện hành, revision là hash canonical **toàn JSON**; textHash là exact spoken string, không được trim/normalize để reuse. Node-story source hash chuẩn hóa CRLF→LF theo policy NK-001 và có raw hash riêng; intro pipeline còn raw source hash. Không tính revision/textHash mới trong đợt này. Resolver yêu cầu exact collection/locale/revision/content scope; không nới guard để giữ clip cũ.

Nếu chỉ tích hợp Batch B tương lai, bốn collection Gạch/Trung Yên/Tạm Thương/Cấm Chỉ có **30 node-story + 6 intro = 36 slots** chịu revision review, không phải 36 MP3 cần tạo. Phất Lộc chưa đổi bởi B; A+B hợp lại chạm cả năm ngõ, nên regression/delta perimeter là **34 story + 8 intro = 42 slots**. Story chữ giữ nguyên chỉ là ứng viên reuse khi exact text/scope/voice/model/provenance/audio SHA và revision được review riêng; không đọc Voice IDs hoặc kiểm tra paid budget ở đây.

- [ ] Human chọn disposition D4/D5/D7 liên quan và phần D3/D6 nếu mở công việc tiếp; D1/D2 vẫn pending ở Batch A.
- [ ] Duyệt từng exact field VI/EN, gồm cả nhãn nguồn/legend, glossary, proposed omissions và các field KEEP muốn đưa vào gói được duyệt.
- [ ] Đọc thử bằng người VI/EN; chọn giữ/lược câu truyền miệng Hội Vũ, kiểm tên cây và tên riêng, không coi biên tập viên đã nghe native/TTS.
- [ ] Giải quyết hướng intro/guide còn unresolved trong matrix trước khi tuyên bố cả collection sẵn sàng; không auto-approve surfaces ngoài tám node.
- [ ] Chỉ sau human review và quyền riêng mới xét integration/delta/audio. Không đọc keys/Voice IDs, gọi ElevenLabs/generator, đổi audio/catalogue/pins hoặc mở NK-006/NK-009/NK-010.

**Dừng ở Human Content Review Gate. Không draft Batch C hoặc bắt đầu UI Wave 2.**
