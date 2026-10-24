# Ngõ Kể — Batch A VI/EN candidate

Ngày: 23/10/2026. Version tài liệu: **A-v1**. Toàn bộ chữ dưới đây: **`DRAFT_NOT_APPROVED`**. Chỉ là bản duyệt trong Markdown; chưa đưa vào runtime, chưa có voice delta được duyệt.

Đọc cùng [Decision Pack D1–D7](NGO_KE_CONTENT_DECISION_PACK.md), [Claim Ledger](NGO_KE_CLAIM_LEDGER.md) và [báo cáo Phase 2B](../reviews/NGO_KE_PHASE2B_DRAFT_REPORT.md). Source IDs liên kết trực tiếp ở mục 2 Decision Pack. Truy cập lại các nguồn Batch A ngày 23/10/2026. Không nguồn nào trong hồ sơ này là xác nhận đã khảo sát tại chỗ.

## 1. Cách duyệt

- Bốn cặp `story` là candidate hoàn chỉnh, có thể duyệt từng string VI/EN. Nhãn field, mã câu và ghi chú ngoài nội dung không phải chữ đọc.
- Chỉ đề xuất chữ mới ở field cần sửa. “KEEP” là không đề xuất thay trong Batch A, **không** có nghĩa đã human-approved toàn bộ nội dung hiện hành. Ngoài các mục ghi rõ, không thêm field/asset.
- `SUPPORTED_FOR_DRAFT`: có nguồn cho cách diễn đạt hạn chế hoặc là diễn giải editorial được đánh dấu; không nâng claim thành VERIFIED. `PENDING_HUMAN_DECISION`: chờ quyết định giữ/lược/cách gọi. `BLOCKED_CLAIM`: không dùng như fact trong candidate này. Các trạng thái Phase 2A giữ nguyên.
- Tất cả proposed omissions đều là `PENDING_HUMAN_DECISION`, chưa xóa gì khỏi runtime. Một claim bị chặn không tự động làm toàn node không thể kể: candidate chỉ dùng phần có căn cứ, vẫn chờ duyệt.
- Các field summary/caption cũng phải giữ độ chắc chắn của story. Giữ nguyên mọi ID, order, start, Q&A, coords, geometry, metadata trạng thái và media. `kind: simulated` hiện hành không đổi chỉ vì bản nháp có fact được hỗ trợ.

## 2. Tiên Hạ — `phat-loc-den-tien-ha`

### A. Identity và phạm vi

Collection `ngo-phat-loc`; node thứ 1/2, start node hiện hành. Assessment Phase 2A: MAJOR_REWRITE. Role hiện tại: node story về di tích; đề xuất: giữ role story, tách ký ức thờ tự và chuyện tên làng, không ghép hai chủ thể. Không đổi tên “Đền Tiên Hạ” / “Tiên Hạ Temple”.

Relevant claims: P01/P02/P03/P04/P05/P06/P07. Evidence chính: S18 cho thờ tự, S19 cho **lời dân ngõ được ghi lại**; S16/S17 là hồ sơ mâu thuẫn, không phải nền cho khẳng định tác giả–niên đại trong narration.

### B. Vietnamese — `DRAFT_NOT_APPROVED`

**Name:** KEEP.

**Summary — A-P-SUM-VI:**

Đền Tiên Hạ, nơi thờ Nguyễn Trung Ngạn theo tư liệu về di tích.

**Caption — A-P-CAP-VI:**

Đền Tiên Hạ — ký ức thờ tự và câu chuyện tên làng Phất Lộc.

**Story — A-P-STORY-VI:**

Đền Tiên Hạ gắn với Nguyễn Trung Ngạn, một vị quan thời Trần được thờ tại đây theo các bài viết về di tích. Nhưng ký ức Phất Lộc không chỉ có câu chuyện về một nhân vật. VietnamPlus ghi lại lời dân ngõ kể: những người từ làng Phất Lộc ở Thái Bình đến Thăng Long đã mang tên quê cũ đặt cho nơi ở mới. Một tên người được gìn giữ trong nơi thờ tự, một tên làng theo cư dân đến chốn ở mới. Đặt cạnh nhau, hai câu chuyện gợi một câu hỏi: khi rời quê, ta mang theo điều gì để nhớ?

### C. English — `DRAFT_NOT_APPROVED`

**Name:** KEEP.

**Summary — A-P-SUM-EN:**

Tiên Hạ Temple, where Nguyễn Trung Ngạn is worshipped according to accounts of the site.

**Caption — A-P-CAP-EN:**

Tiên Hạ Temple — remembrance through worship and the story of the Phất Lộc village name.

**Story — A-P-STORY-EN:**

Tiên Hạ Temple is associated with Nguyễn Trung Ngạn, a Trần-dynasty official worshipped here according to accounts of the site. But Phất Lộc holds more than one person's story. VietnamPlus records a local account: people who came to Thăng Long from Phất Lộc village in Thái Bình brought their old village name to their new home. One person's name is remembered in a place of worship; a village name travels with its residents. Together, these stories invite a question: when we leave home, what do we carry with us to remember it?

### D. Traceability

Mã câu là thứ tự câu trong story ở mỗi locale; dấu chấm phẩy không tách câu. Phần diễn giải không được dùng lại như bằng chứng lịch sử trong Q&A.

| Đơn vị chữ VI / EN | Claim → source | Evidence/status | Điều kiện sử dụng |
| --- | --- | --- | --- |
| Story câu 1; summary | P04 → [S18, Đại biểu Nhân dân](https://daibieunhandan.vn/den-tien-ha-va-danh-nhan-nguyen-trung-ngan-10024624.html), S16 đối chiếu | PARTIALLY_SUPPORTED → SUPPORTED_FOR_DRAFT với attribution | Không thêm chiến công, quê quán, niên đại dựng đền hoặc chức vụ từ suy đoán |
| Story câu 3 | P01/P02 → [S19, VietnamPlus](https://mega.vietnamplus.vn/nham-nhi-ha-noi-trong-long-ngo-phat-loc-6637.html) | PARTIALLY_SUPPORTED → SUPPORTED_FOR_DRAFT **dưới dạng lời kể được báo ghi** | Không dùng 1717 làm năm lập ngõ; không biến quê cư dân thành quê Nguyễn Trung Ngạn |
| Story câu 2, 4–5; caption chủ đề | Diễn giải editorial từ hai lớp tư liệu; không tạo claim lịch sử mới | SUPPORTED_FOR_DRAFT về biên tập, PENDING_HUMAN_DECISION về giọng kể | “Mang theo ký ức” là gợi mở của tác giả, không lời nhân chứng/khảo sát |
| Không có trong candidate | P03/P05/P06 → S16/S17/S18; quyết định D2 | BLOCKED_CLAIM; lược bỏ PROPOSED | Không “quê ông ở Thái Bình”, “Nguyễn Siêu soạn 1886” hoặc chắc số 48/46 |

### E. Surface liên quan, rationale và approval

Intro.text KEEP trong Batch A: chủ thể cư dân và nhân vật đã được tách, không có 1886. Cách attribution tổng quát và các claim khác của intro vẫn thuộc review top-level, không được tự duyệt nhờ node này.

**Proposed replacement toàn `alleyStory.paragraphs[2]`**, vì field này còn lặp claim 1886 và địa điểm hội tụ chưa đủ chắc:

- VI — A-P-READ-VI: “Đền Tiên Hạ trong ngõ được các bài viết về di tích giới thiệu là nơi thờ Nguyễn Trung Ngạn thời Trần. Chuyện thờ tự này cần phân biệt với lời kể về cộng đồng từ làng Phất Lộc đến lập nghiệp.”
- EN — A-P-READ-EN: “Accounts of the site describe Tiên Hạ Temple in the alley as a place of worship for the Trần-dynasty official Nguyễn Trung Ngạn. This account of worship should be distinguished from the local story of settlers from Phất Lộc village.”

Trace: P04/S18; P01/S19; câu phân biệt là editorial đối chiếu P03. Không thay paragraphs khác trong Batch A.

**Proposed replacement `guide.visit[0].notes[1]`**, thay câu đang nói kiến trúc/tư liệu trùng tu thế kỷ XIX quá rộng so với hồ sơ đã đối chiếu:

- VI — A-P-GUIDE-VI: “Niên đại xây dựng và thông tin bia trùng tu còn chờ đối chiếu hồ sơ gốc.”
- EN — A-P-GUIDE-EN: “The construction date and details of the restoration inscription await checks against original records.”

Đây là caveat biên tập từ P05, không một niên đại thay thế. Notes[0] KEEP; notes[2] KEEP nội dung bất định 46/48 và giờ chưa xác nhận, nhưng cần gắn **cả S16 lẫn S18** ở evidence tương ứng khi có quyền tích hợp. Không sửa địa chỉ/tọa độ để giải mâu thuẫn bằng kỹ thuật.

Bản cũ gắn “his home village/quê của ông” sai chủ thể và đọc một tác giả–niên đại đang mâu thuẫn. Candidate chuyển sang hai lớp ký ức có attribution, không kể tiểu sử mới. Chưa kết luận ai soạn bia, soạn/khắc lại khi nào, cửa số nào. Cần duyệt D2, wording P01/P04 có attribution và cả cặp story/summary/caption/phần đọc nói trên. Nếu anh muốn phục hồi claim bị chặn, cần bằng chứng mới và một vòng review khác.

### F. Audio impact

`story` VI/EN dự kiến đổi exact spoken text: hai ứng viên changed-text, chưa approved regenerate. Summary/caption và hai field đọc là display text trong pipeline ngõ hiện tại. Intro không đề xuất đổi; nhưng revision Phất Lộc đổi sẽ kéo cả 4 story + 2 intro slots vào kiểm delta. Không reuse audio story cũ bằng cách chỉ repin; clip nguyên chữ khác chỉ reuse sau kiểm đầy đủ NK-009.

## 3. Trung Yên — `trung-yen-dinh-trung-yen`

### A. Identity và phạm vi

Collection `ngo-trung-yen`; node thứ 2/5, không đổi start `trung-yen-pho-suong`. Assessment: REQUIRES_SOURCE_VERIFICATION ở Phase 2A, đã có nguồn sơ cấp cho phần tên pháp lý/xếp hạng nhưng không tự nâng toàn node. Role story về di tích giữ nguyên. Name KEEP: “Đình Trung Yên” / “Trung Yên Communal House”. Claims T03–T06, nguồn S01/S02; alias/chức Ngự sử vẫn pending.

### B. Vietnamese — `DRAFT_NOT_APPROVED`

**Name:** KEEP.

**Summary — A-T-SUM-VI:**

Đình Trung Yên là tên thường gọi; quyết định xếp hạng năm 2008 dùng tên Đền Trung Yên.

**Caption:** KEEP exact hiện hành: “Di tích kiến trúc nghệ thuật cấp quốc gia từ năm 2008.” Không có đề xuất đổi chỉ để lặp summary.

**Story — A-T-STORY-VI:**

Trung Yên không chỉ có những câu chuyện về hàng ăn. Một bài viết của VOV2 giới thiệu ngôi đình ở số mười, với mặt bằng dạng nhà ống — một cách hiện diện gọn trong không gian phố cổ. Tên thường gọi là đình Trung Yên; trong quyết định xếp hạng năm hai nghìn không trăm linh tám, di tích mang tên Đền Trung Yên. Hai cách gọi đưa ta đến cùng một nơi, không phải hai điểm dừng. Nhìn từ câu chuyện ấy, tên gọi cũng là một lớp ký ức: có cách người ta quen gọi, và có tên được lưu trong văn bản.

### C. English — `DRAFT_NOT_APPROVED`

**Name:** KEEP.

**Summary — A-T-SUM-EN:**

Commonly called Trung Yên Communal House, the site is named Trung Yên Temple in the 2008 heritage-listing decision.

**Caption:** KEEP exact hiện hành: “A national-level architectural and artistic monument since 2008.”

**Story — A-T-STORY-EN:**

Trung Yên has more than stories of food. A VOV2 report introduces the communal house at number ten, with a long, narrow floor plan that fits the compact spaces of the Old Quarter. It is commonly called Trung Yên Communal House; in the heritage-listing decision of two thousand and eight, the site is named Trung Yên Temple. These names refer to the same place, not two separate stops. They offer another way to think about memory: the name people use, alongside the name preserved in a written record.

### D. Traceability

| Đơn vị chữ VI / EN | Claim → source | Evidence/status | Điều kiện sử dụng |
| --- | --- | --- | --- |
| Story câu 1 | Bối cảnh food đã có trong T07/T12; chuyển ý editorial | SUPPORTED_FOR_DRAFT về chuyển ý | Không cam kết quán đang mở hoặc trải nghiệm đã quan sát |
| Story câu 2; common name ở câu 3 | T03/T05 → [S02, VOV2](https://vov2.vov.vn/van-hoa-giai-tri/le-gan-bien-cong-trinh-dinh-trung-yen-43075.vov2) | T03 VERIFIED, T05 PARTIALLY_SUPPORTED → SUPPORTED_FOR_DRAFT | Mặt bằng theo bài 2023; không hứa vào tầng hai; diễn giải không gian không phải khảo sát kiến trúc mới |
| Legal name/năm ở câu 3; summary; caption KEEP | T03 → [S01, QĐ 07/2008](https://vanban.chinhphu.vn/default.aspx?docid=78382&pageid=27160); S02 nối common name | SUPPORTED_FOR_DRAFT; T04 nội bộ vẫn CONFLICTING cho đến tích hợp | Năm xếp hạng, không năm xây; cách dịch EN là lựa chọn editorial, không tên EN pháp định |
| Story câu 4–5 | Đối chiếu S01/S02, suy luận editorial về cùng định danh | SUPPORTED_FOR_DRAFT, PENDING_HUMAN_DECISION D1 | Không đổi node ID hoặc tạo địa điểm thứ hai |
| Không có trong candidate | T06 → S03/S04 chưa đủ nội dung trực tiếp | BLOCKED_CLAIM | Thanh Cẩm, Ngự sử, tên đầy đủ vị được thờ không được đọc chắc chắn |

### E. Surface liên quan, rationale và approval

Intro.text KEEP: common name và năm xếp hạng không mâu thuẫn candidate; không thêm legal name khắp nơi. Những claim về hồ/chiều dài ngõ vẫn cần disposition top-level riêng, không thuộc việc xác minh T03.

**Proposed replacement toàn `alleyStory.paragraphs[1]`:**

- VI — A-T-READ-VI: “Đình Trung Yên là tên thường gọi của di tích tại số 10 ngõ Trung Yên. Quyết định số 07/2008/QĐ-BVHTTDL ngày 26/02/2008 xếp hạng di tích kiến trúc nghệ thuật quốc gia với tên Đền Trung Yên.”
- EN — A-T-READ-EN: “Trung Yên Communal House is the common name of the site at no. 10 Trung Yên Alley. Decision 07/2008/QĐ-BVHTTDL, dated 26 February 2008, lists it as a national architectural and artistic monument under the name Trung Yên Temple.”

Trace T03/S01/S02; proposed omission T06. Không đổi title hoặc paragraphs khác chỉ vì chúng dùng “đình”.

**Proposed replacements ở `guide.visit[0].notes`:**

| Field | Vietnamese candidate | English candidate |
| --- | --- | --- |
| notes[0] — A-T-GUIDE0 | Xếp hạng di tích kiến trúc nghệ thuật quốc gia theo Quyết định 07/2008/QĐ-BVHTTDL; tên trong quyết định là Đền Trung Yên. | Listed as a national architectural and artistic monument by Decision 07/2008/QĐ-BVHTTDL, under the name Trung Yên Temple. |
| notes[1] — A-T-GUIDE1 | Chức danh cụ thể và các tên gọi khác của nhân vật được thờ còn chờ hồ sơ xác nhận. | The worshipped figure's specific office and alternative names await documentary confirmation. |
| notes[2] — A-T-GUIDE2 | VOV2 có bài giới thiệu công trình sau tu bổ năm 2023; lịch mở cửa tham quan hiện tại chưa được xác minh. | VOV2 reported on the restored site in 2023; current public visiting hours have not been verified. |

Notes[0] dùng T03/S01; notes[1] là caveat T06, không phủ nhận mọi thông tin thờ tự; notes[2] dùng S02 nhưng không khẳng định access hiện nay. Guide name/address/route KEEP. Evidence bổ sung S01/S02 thay vì tiếp tục chỉ viện các trang chưa mở được.

Bản cũ nói chưa xác minh xếp hạng trong story trong khi caption/intro đã khẳng định; VI summary khác EN. Candidate không tiếp tục câu phủ định đã lỗi thời, không global rename. Cần duyệt D1, cách dịch common/legal và disposition T06; approval không bao phủ hồ sơ nhân vật hoặc năm dựng đình.

### F. Audio impact

Hai story có exact-text delta dự kiến. Caption/name KEEP; summary và phần đọc/guide dự kiến đổi nhưng không có track riêng trong catalogue ngõ. Intro KEEP; toàn Trung Yên 10 story + 2 intro slots phải kiểm revision tương lai, không tự tạo lại 12 clip.

## 4. Thanh Hà — `ngo-gach-dinh-thanh-ha`

### A. Identity và phạm vi

Collection `ngo-gach`; node thứ 3/5, start vẫn `ngo-gach-ca-phe-no1`. Assessment Phase 2A: REQUIRES_SOURCE_VERIFICATION. Giữ story về thờ tự và lịch lễ, không dùng “cổ nhất” làm hook. Relevant G06–G09/G13; S22 và nguồn mới B2B-S01/S02 hỗ trợ bản kể hạn chế, S23 chưa mở đủ để kết luận chi tiết bia/Vũ Ninh. Hai nguồn mới chỉ bổ sung ở hồ sơ Phase 2B, không sửa trạng thái ledger cũ.

### B. Vietnamese — `DRAFT_NOT_APPROVED`

**Name:** KEEP “Đình Thanh Hà”.

**Summary — A-G-SUM-VI:**

Đình Thanh Hà, nơi thờ Trần Lựu và gắn với lịch lễ theo âm lịch.

**Caption — A-G-CAP-VI:**

Đình Thanh Hà — Trần Lựu và ký ức ngày lễ.

**Story — A-G-STORY-VI:**

Có những nơi được nhớ không chỉ bằng địa chỉ, mà còn bằng ngày trong năm. Cục Di sản văn hóa giới thiệu đình Thanh Hà ở số mười Ngõ Gạch, thờ Trần Lựu, với các ngày lễ hội mùng bốn tháng Tư và rằm tháng Chín âm lịch. Lịch lễ ấy gợi một cách hiểu về ngôi đình: ký ức không chỉ gắn với một mốc niên đại, mà còn với thời gian tưởng nhớ. Tên người và ngày lễ trở thành hai đầu mối để ta bắt đầu tìm hiểu nơi thờ tự này.

### C. English — `DRAFT_NOT_APPROVED`

**Name — A-G-NAME-EN:** Thanh Hà Communal House

Đề xuất khôi phục dấu trong tên riêng so với “Thanh Ha Communal House”; chỉ display, không đổi ID/alias/voice spelling rule.

**Summary — A-G-SUM-EN:**

Thanh Hà Communal House, a place of worship for Trần Lựu with festival dates in the lunar calendar.

**Caption — A-G-CAP-EN:**

Thanh Hà Communal House — Trần Lựu and a calendar of remembrance.

**Story — A-G-STORY-EN:**

Some places are remembered not only by an address, but by dates in the year. The Department of Cultural Heritage describes Thanh Hà Communal House at number ten Gạch Alley as a place of worship for Trần Lựu, with festivals on the fourth day of the fourth lunar month and the fifteenth day of the ninth. That calendar suggests a way to understand the communal house: memory belongs not only to a date in the distant past, but also to times of remembrance. A person's name and festival dates give us two starting points for learning about this place of worship.

### D. Traceability

| Đơn vị chữ VI / EN | Claim → source | Evidence/status | Điều kiện sử dụng |
| --- | --- | --- | --- |
| Story câu 2, phần identity | G06 → [B2B-S01, Cục Di sản văn hóa](https://dsvh.gov.vn/dinh-thanh-ha-thanh-pho-ha-noi-22263); S22 đối chiếu | VERIFIED ở ledger cũ → SUPPORTED_FOR_DRAFT | Không suy ra mọi chiến công của thần tích là sử kiện |
| Story câu 2, ngày lễ | G09 → B2B-S01 | VERIFIED trong ledger về nội dung nguồn → SUPPORTED_FOR_DRAFT có attribution | Không xác nhận chương trình lễ năm 2026, giờ mở cửa hoặc quyền vào dự |
| Summary/caption chủ đề | G06/G09 → [B2B-S02, Sở VHTT Hà Nội](https://sovhtt.hanoi.gov.vn/le-dang-huong-ky-niem-ngay-hoa-duc-dai-vuong-tran-luu-tai-dinh-thanh-ha/) | SUPPORTED_FOR_DRAFT, không nâng status bằng nguồn bổ sung | Không lấy tường thuật năm 2025 làm hiện trạng/giờ mở cửa 2026 |
| Story câu 1, 3–4; caption “ký ức” | Diễn giải editorial, không claim lịch sử mới | SUPPORTED_FOR_DRAFT về biên tập; PENDING_HUMAN_DECISION | Không nói đã dự lễ/quan sát cộng đồng thực địa |
| Không có trong candidate | G07/G08 → S22, S23 pending; D2 | BLOCKED_CLAIM cho niên đại vật thể/cổ nhất; chi tiết legend chưa đủ nguồn | Lược PROPOSED cả 1430/cổ nhất và chi tiết Vũ Ninh; không tự đặt ngày khác |

### E. Surface liên quan, rationale và approval

**Proposed replacement toàn `intro.text` Gạch**, không phải thêm intro mới:

- VI — A-G-INTRO-VI: “Ngõ Gạch có một điểm kể về di sản: đình Thanh Hà, nơi thờ Trần Lựu theo cổng du lịch Hoàn Kiếm. Câu chuyện ở đây gợi cách tìm hiểu một nơi thờ tự qua tên người và ký ức ngày lễ.”
- EN — A-G-INTRO-EN: “Gạch Alley includes a heritage story at Thanh Hà Communal House, described by the Hoàn Kiếm tourism portal as a place of worship for Trần Lựu. Here, a name and a calendar of remembrance offer a way into the story.”

Trace G06/G09/S22; câu gợi mở là editorial. Không tái khẳng định 128m/nhà nghỉ/“giữa ngõ” khi không cần cho hook, không sửa lengthMeters. Việc lược các chi tiết khỏi intro là PROPOSED, không xóa evidence/map hoặc kết luận chúng sai.

`alleyStory` và `guide`: ABSENT, **không tạo**. Intro audio: ABSENT, **không đề xuất tạo**. Đề xuất bổ sung S22 cho `intro.evidence`, B2B-S01/S02 cho `node.evidence` khi được phép; giữ provenance nguồn cũ, không dùng S23 chưa mở làm bằng chứng duy nhất cho câu mới.

Bản cũ khẳng định niên đại vật thể và superlative ở cả intro/summary/caption/story. Candidate thay trục kể bằng thờ tự/lịch lễ được ghi nguồn, cùng độ chính xác ngày ở VI/EN. Chưa kết luận văn bản bia ra đời khi nào, vật thể còn lại khắc khi nào hoặc “cổ nhất” theo tiêu chí nào. Cần duyệt D2/D6, cách kể lịch lễ như tư liệu, không phải lời mời một sự kiện sắp diễn ra.

### F. Audio impact

Hai node stories đổi; intro.text candidate cũng đổi nhưng hiện không có intro track Gạch. Không coi đó là quyền tạo intro TTS. EN name/summary/caption chỉ display trong hai pipeline đang xét. Mười story slots Gạch phải kiểm theo revision mới nếu tích hợp; tám story còn nguyên chữ không được mất resolve ngoài rollout đã duyệt.

## 5. Vọng Tiên–Cấm Chỉ — `cam-chi-den-vong-tien`

### A. Identity và phạm vi

Collection `ngo-cam-chi`; node thứ 3/3, start giữ `cam-chi-khong-gian-nghe-thuat`. Assessment Phase 2A: MAJOR_REWRITE. Role đề xuất: supporting heritage story ngoài ngõ, đọc độc lập. Không đổi name “Đền Vọng Tiên” / “Vọng Tiên Temple”. Relevant C08/A05/A06/A07, nguồn S10. Không hợp nhất với `tam-thuong-den-vong-tien`.

### B. Vietnamese — `DRAFT_NOT_APPROVED`

**Name:** KEEP.

**Summary — A-C-SUM-VI:**

Điểm di sản liên quan ngoài ngõ Cấm Chỉ; tư liệu Hanoi Heritage Map giới thiệu việc thờ Mẫu và truyền thuyết Vọng Tiên.

**Caption — A-C-CAP-VI:**

Theo Hanoi Heritage Map: một nơi thờ Mẫu gắn với truyền thuyết Vọng Tiên.

**Story — A-C-STORY-VI:**

Tên Vọng Tiên gợi câu chuyện gì? Theo bản giới thiệu của Hanoi Heritage Map, đền Vọng Tiên là nơi thờ Mẫu. Trang này cũng ghi lại một truyền thuyết: vua Lê Thánh Tông gặp một người con gái ở chùa Ngọc Hồ; sau khi nàng biến mất, nhà vua cho dựng lầu Vọng Tiên. Ta có thể lắng nghe điều kỳ diệu trong câu chuyện, đồng thời giữ nó ở đúng chỗ: một truyền thuyết được lưu truyền, không phải sự kiện lịch sử đã được xác minh.

### C. English — `DRAFT_NOT_APPROVED`

**Name:** KEEP.

**Summary — A-C-SUM-EN:**

A related heritage site outside Cấm Chỉ Alley; Hanoi Heritage Map presents its Mother Goddess worship and the Vọng Tiên legend.

**Caption — A-C-CAP-EN:**

A Mother Goddess temple linked to the Vọng Tiên legend, according to Hanoi Heritage Map.

**Story — A-C-STORY-EN:**

What story does the name Vọng Tiên suggest? Hanoi Heritage Map describes the temple as a place of Mother Goddess worship. It also records a legend: King Lê Thánh Tông met a young woman at Ngọc Hồ Pagoda; after she vanished, he had Vọng Tiên Pavilion built. We can listen to the wonder in that story while keeping it in its proper place: a legend passed down, not a verified historical event.

### D. Traceability

| Đơn vị chữ VI / EN | Claim → source | Evidence/status | Điều kiện sử dụng |
| --- | --- | --- | --- |
| Story câu 2; summary/caption phần thờ tự | A07/C08 → [S10, Hanoi Heritage Map](https://heritage-itineraries.com/di-tich/den-vong-tien) | PARTIALLY_SUPPORTED → SUPPORTED_FOR_DRAFT **với attribution** | Không nâng thành hồ sơ ban quản lý, không suy diễn nghi lễ |
| Story câu 3; caption/summary nhãn truyện | A06 → S10 | LEGEND → SUPPORTED_FOR_DRAFT **chỉ như legend** | Ngọc Hồ là địa điểm trong truyện, không phải vị trí hiện tại của đền; không gắn cảnh gặp tiên với GPS |
| Story câu 1, 4 | Câu mở/diễn giải editorial, giới hạn certainty A06 | SUPPORTED_FOR_DRAFT về biên tập; PENDING_HUMAN_DECISION | Không lời nhân chứng, không kết luận truyện đã xảy ra hoặc đã được chứng minh là giả |
| Summary “ngoài ngõ” và guide dưới đây | A05/C08; định vị nguồn/khung supporting place D4 | SUPPORTED_FOR_DRAFT có giới hạn; field verification chưa có | Không chỉ lối, độ gần, giờ mở cửa, cửa vào hay số nhà chắc chắn |
| Không có trong candidate | C02 và lệ thuộc collection khác ở C08 | PENDING_HUMAN_DECISION về lược; không dùng làm fact của đền | Không Chúa Chổm/đường cấm ở story này, không “đã kể ở Tạm Thương” |

### E. Surface liên quan, rationale và approval

Intro/alleyStory Cấm Chỉ KEEP trong Batch A: kể legend tên ngõ với nhãn riêng; không trộn thành nguồn lịch sử Vọng Tiên. Không thêm đoạn Vọng Tiên vào intro chỉ để đồng bộ.

**Proposed replacements trong `guide.visit[2]`:**

| Field | Vietnamese candidate | English candidate |
| --- | --- | --- |
| address — A-C-ADDRESS | Khu vực Hàng Bông theo Hanoi Heritage Map; cửa vào chưa được khảo sát. | Hàng Bông area according to Hanoi Heritage Map; the entrance has not been surveyed. |
| notes[0] — A-C-GUIDE0 | Địa điểm liên quan ngoài ngõ Cấm Chỉ; phân biệt tư liệu thờ tự với truyền thuyết. | A related site outside Cấm Chỉ Alley; distinguish accounts of worship from folklore. |

Notes[1] KEEP giới hạn điều kiện tham quan theo đơn vị quản lý, không xác nhận giờ cụ thể. Address candidate là **đề xuất hạ độ chính xác của chữ hiển thị**, không sửa vị trí/GPS hay xác nhận tên hành chính hiện hành. S10 ghi Hàng Bông/Cửa Nam chưa nhất quán; việc không dùng số 120B trong candidate này vẫn chờ D4. Bổ sung S10 vào node/guide evidence, không xóa provenance hiện có.

Hai bản Vọng Tiên phải chung fact sheet nhưng mỗi bản tự chứa. `tam-thuong-den-vong-tien` đã có nhận diện/thờ tự/legend, vẫn cần Batch B chỉnh địa chỉ, attribution và phần guide; không viết lại node đó trong Phase 2B. Không dùng việc hoàn tất Cấm Chỉ để tự duyệt Tạm Thương hoặc tự sao chép text sang collection khác.

Bản cũ chỉ kể tên ngõ Cấm Chỉ rồi đẩy chuyện đền sang Tạm Thương. Candidate kể đúng chủ đề đền khi mở trực tiếp, nêu nguồn thờ tự và nhãn legend ở cả hai locale. Chưa kết luận niên đại lập/di chuyển đền, vị trí lầu trong truyện, cửa vào hay lịch tham quan. Cần duyệt D4, attribution S10 và exact legend wording; lịch sử còn pending không vì bản kể ấm áp mà thành VERIFIED.

### F. Audio impact

Hai story đổi exact text; không thể phát clip cũ cho candidate. Summary/caption/guide/address không có track riêng hiện hành. Intro Cấm Chỉ giữ chữ; cả 6 story + 2 intro slots chịu kiểm revision nếu tích hợp. Không thêm seek/miniplayer hoặc thay audio hook.

## 6. Content surface consistency matrix

Mọi đề xuất dưới đây: **`PENDING_HUMAN_APPROVAL`**. Spoken nghĩa là track trong hai catalogue ngõ hiện hành, không phủ nhận screen-reader/fallback ở app. Evidence additions là đề xuất cho gate sau, chưa sửa arrays thực.

| Collection / node | Field hiện tại cần xử lý | Disposition / field đề xuất | VI/EN parity | Claim IDs | Spoken / certainty |
| --- | --- | --- | --- | --- | --- |
| Phất Lộc / Tiên Hạ | story ghép quê nhân vật và 1886; summary/caption dài | A-P-STORY, SUM, CAP | Cùng chủ thể và attribution; không 46/48 | P01/P03–P06 | Story spoken; nguồn báo có giới hạn |
| Phất Lộc / top-level | intro.text không ghép quê ông/1886 | KEEP trong Batch A; không auto-approve các claim top-level | Giữ nguyên hai locale | P01/P02/P04 | Intro spoken, không changed-text đề xuất |
| Phất Lộc / top-level | alleyStory.paragraphs[2] còn 1886/hội tụ | A-P-READ thay toàn paragraph này | Cùng lược có chủ ý, không sửa các đoạn khác | P03/P04/P05/P07 | Display; lược PROPOSED |
| Phất Lộc / guide | visit[0].notes[1] trùng tu XIX; notes[2] 46/48 | A-P-GUIDE; notes[2] KEEP caveat, gắn cả hai nguồn | Không chọn địa chỉ ở riêng EN | P05/P06 | Display; chờ hồ sơ/field |
| Trung Yên / node đình | VI summary chưa rõ; story phủ định xếp hạng | A-T-SUM/STORY; caption và name KEEP | Common/legal khác chức năng, không đổi chủ thể | T03–T06 | Story spoken; legal có nguồn sơ cấp |
| Trung Yên / top-level | intro common name/xếp hạng; alleyStory có alias | Intro KEEP; A-T-READ cho paragraphs[1] | Không global rename, cùng bỏ alias pending | T03/T05/T06 | Intro giữ chữ; paragraph display |
| Trung Yên / guide | visit[0].notes khẳng định chức Ngự sử | A-T-GUIDE0/1/2; name/address/route KEEP | Cùng certainty; không hứa vào tầng hai | T03/T05/T06 | Display; chức cụ thể pending |
| Gạch / Thanh Hà | name EN mất dấu; summary/caption/story có 1430/cổ nhất | A-G-NAME-EN, SUM/CAP/STORY; name VI KEEP | Ngày lễ đầy đủ như nhau; không chọn niên đại bia | G06–G09 | Story spoken; facts nguồn và editorial tách |
| Gạch / top-level | intro.text có claim 1430 | A-G-INTRO thay toàn text; không thêm structure | Cùng bỏ claim rủi ro và số đo không cần kể | G06/G08/G09/G13 | Có text, **chưa có intro audio** |
| Gạch / structure | alleyStory/guide không tồn tại | ABSENT, không tạo | Không ép parity với collection khác | G13 | Không có spoken slot mới |
| Cấm Chỉ / Vọng Tiên | story phụ thuộc Tạm Thương, thiếu chuyện đền | A-C-SUM/CAP/STORY; name KEEP | Tự chứa; legend không thành historical fact | C08/A06/A07 | Story spoken; thờ tự attributed, legend labelled |
| Cấm Chỉ / top-level | intro/alleyStory về tên ngõ, không phải chuyện đền | KEEP, review phần khác qua backlog | Không dùng Chúa Chổm làm fact của đền | C01/C02/C08 | Intro giữ chữ; phần đọc giữ |
| Cấm Chỉ / guide | visit[2] địa chỉ chắc 120B | A-C-ADDRESS/GUIDE0, notes[1] KEEP caveat | Không hạ certainty chỉ ở một locale | A05/C08 | Display; field gate pending |
| Tạm Thương / Vọng Tiên | story tự chứa nhưng address/guide vẫn cần review | Chỉ audit + backlog Batch B, **không soạn candidate ngoài bốn node** | Chung fact sheet A05–A07, không prerequisite | A05–A07/C08 | Hiện spoken; không delta mới được đề xuất/duyệt ở đây |
| Cả bốn collection | Evidence arrays thiếu direct sources cho chữ mới | PROPOSED append: Phất Lộc S18 vào node/alleyStory/guide; Trung Yên S01/S02 vào node/alleyStory/guide; Gạch S22 vào intro, B2B-S01/S02 vào node; Cấm Chỉ S10 vào node/guide | Giữ URL/provenance gốc, cùng nguồn cho cùng fact | Theo các trace tables | Non-track; vẫn đổi canonical revision |
| 5 ngõ / ngoài scope A | guide.eat, route và 13 node còn lại | Backlog B/C D3–D5; không full rewrite | Không coi KEEP ngoài A là approval | Ledger Phase 2A | Không khẳng định toàn surface đã sạch |

**Giới hạn quan trọng:** consistency của các field Batch A đã được thiết kế; không tuyên bố cả năm dataset đã đạt content approval. Ví dụ route ở guide, giờ quán và aliases ở các node khác vẫn có backlog. Không release trạng thái “reviewed/live-ready” cho cả collection bằng một approval Batch A.

## 7. Glossary VI/EN để duyệt

Glossary là quy ước editorial đề xuất, không thay tên pháp định/alias matcher; toàn bộ `PENDING_HUMAN_APPROVAL`. Không respell tên riêng cho TTS.

| VI | EN đề xuất | Quy tắc |
| --- | --- | --- |
| Đình | Communal house | Dùng cho common name đã đối chiếu; không suy ra cùng chức năng ở mọi di tích |
| Đền | Temple | Không tự đổi mọi “đình” thành “đền”; legal/common được giải thích theo D1 |
| Đình Trung Yên / Đền Trung Yên | Trung Yên Communal House / Trung Yên Temple | Hai cách gọi trong hai ngữ cảnh của một di tích; bản dịch editorial, không khẳng định có bản EN pháp định |
| Đình Thanh Hà | Thanh Hà Communal House | Giữ dấu Thanh Hà, không tạo ID/alias mới |
| Đền Tiên Hạ; Đền Vọng Tiên | Tiên Hạ Temple; Vọng Tiên Temple | Không đồng nhất lầu trong legend với công trình hiện tại |
| Lầu Vọng Tiên | Vọng Tiên Pavilion | Chỉ trong legend có nhãn, không mốc navigation |
| Chùa Ngọc Hồ; chùa Cầu Đông | Ngọc Hồ Pagoda; Cầu Đông Pagoda | Không dịch thành lake khi nguồn nói chùa; không tự khẳng định khoảng cách |
| Nguyễn Trung Ngạn; Nguyễn Siêu; Trần Lựu | Giữ nguyên có dấu | Không đổi quê/chức/ngày bằng đại từ; Nguyễn Siêu không xuất hiện trong candidate spoken |
| Vua Lê Thánh Tông | King Lê Thánh Tông | Giữ tên, không nhập với Lê Trang Tông/Chúa Chổm |
| Nguyên phi Ỷ Lan | Imperial Consort Ỷ Lan | Backlog B, chưa viết thêm biography |
| Thái Bình; Thăng Long; Phất Lộc; Ngõ Gạch | Giữ tên có dấu; Thăng Long; Phất Lộc; Gạch Alley | Thái Bình theo địa danh trong nguồn, không xác nhận đơn vị hành chính 2026 |
| Truyền thuyết / tương truyền | Legend / according to legend | Không dùng “history shows”; giữ nhãn cả caption lẫn story |
| Giai thoại dân gian | Folk anecdote / folk tale | Không tự ghép vào tiểu sử hoặc chronology |
| Thờ Mẫu | Mother Goddess worship | Ghi nguồn; không tự gọi UNESCO status của riêng đền hoặc liệt kê nghi lễ chưa kiểm |
| Thành hoàng | Tutelary deity | Chỉ dùng khi nguồn đúng nơi; candidate dùng “thờ Trần Lựu” để dễ nghe, không suy thêm chức danh |
| Thần tích | Traditional account of a deity | Không tự dịch thành verified biography |
| Bia / văn bản bia / bản khắc lại | Stele / inscription text / recarving | Tách vật thể và văn bản; không chọn niên đại thay thế |
| Xếp hạng năm 2008 | Listed in 2008 | Không biến thành built in 2008 |
| Âm lịch; mùng 4 tháng 4; rằm tháng 9 | Lunar calendar; fourth day of the fourth lunar month; fifteenth day of the ninth | Không đổi sang ngày dương hoặc hứa lễ hội năm hiện tại |
| Điểm liên quan ngoài ngõ; waypoint | Related site outside the alley; editorial waypoint | Không enum mới, không chứng nhận route/public access |
| Phở bò; phở gà | Beef pho; chicken pho | Mô tả món chung không xác nhận menu quán cụ thể |
| Bún cá; bún ngan | Fish noodle soup; ngan noodle soup (Muscovy duck) | Giữ tên quán Bún cá Sâm Cây Si/Bún ngan Nhàn; không rút ngan thành thịt khác để tránh TTS |
| Bún đậu mắm tôm | Rice vermicelli and tofu with fermented shrimp paste | Giữ tên Việt khi dùng; không tự hứa thành phần/menu theo từng quán |
| Nem chua rán | Fried nem chua | Giải thích món nếu cần ở Batch B, không nhầm nem rán/spring rolls |
| Xôi; bánh cuốn; gà tần | Sticky rice; steamed rice rolls; herbal chicken stew | Tên món chung, không xác minh giờ/giá/hoạt động |

## 8. Human review checklist và điểm dừng

- [ ] Chọn D1–D7 trong Decision Pack, hoặc ghi lựa chọn khác rõ ràng.
- [ ] Duyệt từng cặp A-P/A-T/A-G/A-C story, summary/caption thay đổi và EN name Thanh Hà.
- [ ] Duyệt nguyên intro Gạch A-G-INTRO và các field đọc/guide liên quan, không chỉ story.
- [ ] Chấp thuận hoặc sửa việc lược PROPOSED P03/P05/P06/G07/G08/T06; không đổi status ledger bằng checklist này.
- [ ] Xác nhận attribution và nhãn legend/certainty VI/EN tương đương, không yêu cầu người nghe biết collection khác.
- [ ] Duyệt glossary; người VI/EN đọc thử thủ công, đánh dấu câu khó nghe/tên riêng cần hướng dẫn, không đổi chữ chỉ để TTS dễ đọc.
- [ ] Chỉ định field còn chờ nguồn và không được tích hợp; giữ tách khỏi việc chốt bản lược an toàn.

Sau checklist vẫn cần quyền mở NK-006 rõ ràng, allowlist cụ thể, source-of-truth cho tests, candidate revision/voice delta và lead review theo D7. **Chưa có điều kiện tự động bước sang integration hoặc paid TTS.**
