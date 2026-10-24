# Ngõ Kể — Editorial readiness, 17 node VI/EN

Ngày: 23/10/2026. Phase 2A / NK-005, chỉ review. Claim IDs và nguồn: [claim ledger](NGO_KE_CLAIM_LEDGER.md). Baseline và fingerprints: [báo cáo](../reviews/NGO_KE_PHASE2A_REPORT.md).

## 1. Rubric và kết quả

Đánh giá riêng tám chiều, không lấy tổng điểm để che lỗi lịch sử: historical accuracy; storytelling appeal; audio narration suitability; local cultural relevance; self-contained narrative; VI/EN semantic consistency; repetition/filler; node role. “Audio suitability” chỉ là đánh giá văn bản để đọc, không phải nghe TTS hay chứng nhận phát âm/âm thanh.

Một nhãn chính mỗi node: KEEP = có thể giữ cả bản hiện tại; MINOR_REVISION = giữ trục kể, chỉnh attribution/certainty/nhịp; MAJOR_REWRITE = đổi cấu trúc kể nhưng không tự đổi facts/ID; MISSING_CONTENT = có text nhưng thiếu chất liệu cho vai trò story; REQUIRES_SOURCE_VERIFICATION = nguồn quyết định chưa đủ để duyệt bản kể. Một node có thể đồng thời cần research và chỉnh văn; nhãn chính không xóa các gate phụ.

Kết quả: 0 KEEP; 8 MINOR_REVISION; 3 MAJOR_REWRITE; 4 MISSING_CONTENT; 2 REQUIRES_SOURCE_VERIFICATION. Không phải 17/17 sai lịch sử; nhiều nhận diện, caveat và ý chính nên giữ. Không viết lại JSON hoặc phê duyệt spoken text trong phase này.

## 2. Review từng node, đúng thứ tự trong collection

### Ngõ Gạch

#### 01. `ngo-gach-ca-phe-no1` — MISSING_CONTENT

- Historical accuracy: tên/số 1 mới ở mức bản đồ, không có lịch sử quán được kiểm độc lập (G02–G03).
- Storytelling appeal: mốc mở chặng rõ nhưng không có xung đột, hình ảnh văn hóa hoặc câu chuyện riêng; nói “dữ liệu chỉ ghi” không tạo giá trị nghe.
- Audio: câu ngắn dễ đọc, nhưng đang đọc quy trình nghiên cứu thay trải nghiệm; chưa nghe clip.
- Local relevance: hỗ trợ nhịp cà phê/đời sống ngõ, không tự là di sản được công nhận.
- Self-contained: nhận diện được điểm; câu tiếp theo tới 4A chỉ là chuyển chặng, không nên là thông tin cốt lõi.
- VI/EN: cùng giới hạn thông tin; không được nâng EN thành khẳng định quán lâu đời/đang mở.
- Repetition/filler: lặp công thức “chỉ có vị trí/chưa có nguồn” của hai café sau.
- Role đề xuất cần H1 duyệt: **waypoint**, giữ ID/order; nếu muốn story phải có phỏng vấn/nguồn riêng, không bịa chủ quán/năm mở.

#### 02. `ngo-gach-ta-ca-phe-4` — MISSING_CONTENT

- Historical accuracy: mới có nguồn trực tiếp của đơn vị xác nhận Ta Cà Phê 4 ở 4A (G04), không phải hoàn toàn không có nguồn về quán. “Ba chục bước” chưa được đo (G05).
- Storytelling appeal: địa chỉ và lời chuyển đến đình chưa thành story; có thể khai thác hoạt động cà phê sau khi có tư liệu và duyệt, không mặc nhiên coi quảng cáo là lịch sử.
- Audio: tránh đọc độ đếm bước chưa xác minh; không cần thêm lời xin lỗi vì thiếu research.
- Local relevance: nét thương mại đương đại; phải tách khỏi giá trị di tích Thanh Hà.
- Self-contained: nêu đúng tên/số là đủ cho waypoint; không cần nghe No.1 trước.
- VI/EN: cùng giới hạn; giữ 4A và số thứ tự tên chi nhánh, không diễn giải “4” là địa chỉ số 4.
- Repetition/filler: trùng Gạch café 1/20 về “chưa có nguồn, đi tiếp”.
- Role đề xuất cần H1 duyệt: **waypoint**; có thể nâng supporting place nếu được duyệt chất liệu quán, không tự sinh heritage story.

#### 03. `ngo-gach-dinh-thanh-ha` — REQUIRES_SOURCE_VERIFICATION

- Historical accuracy: số 10/thờ Trần Lựu/lịch lễ có nguồn địa phương; mốc “bia dựng 1430” và “cổ nhất” còn cần phân biệt văn bản gốc/bản khắc lại (G06–G09).
- Storytelling appeal: di tích và ký ức thần tích là trục kể mạnh; không cần tăng kịch tính bằng chiến công/quân số chưa kiểm.
- Audio: tên bia và số năm dài tạo tải nghe; chỉ chọn chi tiết được duyệt, caveat ngắn tự nhiên thay diễn giải nghiên cứu dài.
- Local relevance: story di sản chính của ngõ, cần tôn trọng thờ tự.
- Self-contained: đã tự chứa nhận diện và legend; không bắt buộc qua café trước.
- VI/EN: EN ngày lễ chi tiết hơn VI; nguồn mới hỗ trợ ngày âm lịch nhưng cần cùng độ chính xác ở hai bản. Không gộp niên đại bia thành năm lập đình.
- Repetition/filler: đang lặp thông tin bia ở intro/summary/caption/story; caption nên nhận diện, story mới giải thích sâu.
- Role đề xuất: **story**, giữ; H2 xác minh bia trước duyệt lời kể chứa niên đại/superlative. Không tự bỏ caveat để câu hay hơn.

#### 04. `ngo-gach-cafe-20` — MISSING_CONTENT

- Historical accuracy: tên/số 20 và mốc phía tây dựa trên dữ liệu bản đồ, chưa chứng minh hiện trạng quán (G10).
- Storytelling appeal: hiện chỉ chốt chặng, thiếu chất liệu riêng.
- Audio: ngắn nhưng nói thiếu menu/giờ/lịch sử là nhật ký research, không phải chuyện cần nghe.
- Local relevance: điểm nghỉ thương mại, không tự nhận là quán truyền thống.
- Self-contained: đủ tên mốc; câu nối sang chùa không chứng minh quan hệ địa lý/lối đi.
- VI/EN: cùng ý hạn chế; tránh EN tự thêm khoảng cách đi bộ.
- Repetition/filler: lặp hai café đầu; không kéo dài ba story giống nhau để đủ số.
- Role đề xuất cần H1 duyệt: **waypoint**; không xóa node/audio ở NK-005.

#### 05. `ngo-gach-chua-cau-dong` — MINOR_REVISION

- Historical accuracy: nguồn báo có địa chỉ 38B Hàng Đường và hai tượng, nhưng ước niên đại phải quy nguồn; nguồn gốc tượng chưa rõ (G11–G12).
- Storytelling appeal: hai nhân vật được thờ là chi tiết có sức gợi; giữ sự chưa biết thay giải thích huyền đoán.
- Audio: có thể giữ trục kể, bỏ câu báo cáo “bài không xác nhận khoảng cách” khỏi phần kể chính và chuyển giới hạn vị trí sang metadata/đọc thêm nếu được duyệt.
- Local relevance: story tín ngưỡng lân cận, không nằm trên chính phố Ngõ Gạch.
- Self-contained: hiện đủ nhận diện; phải nói là điểm liên quan ngoài ngõ, không hướng dẫn nối tuyến chưa khảo sát.
- VI/EN: giữ chung “được ước định/theo giới nghiên cứu” và unknown nguồn gốc.
- Repetition/filler: không đọc lại địa chỉ và lời thiếu nguồn nhiều lần; không thêm lịch sử toàn bộ chùa từ suy luận hai tượng.
- Role đề xuất: **supporting place có story**; H1 duyệt ranh giới collection, H3 cho mọi hướng dẫn tiếp cận.

### Ngõ Trung Yên

#### 06. `trung-yen-pho-suong` — MINOR_REVISION

- Historical accuracy: lời giải tên/tuổi tên quán là bài báo thời 2021, không tuổi quán tính lại hôm nay; thông tin menu/hours phải tách (T07/T12).
- Storytelling appeal: tên “Sướng” và mong muốn người bán đủ chất liệu một mẩu chuyện đời sống, không cần ranking.
- Audio: rút giới thiệu nguồn xuống một attribution; tránh mời ăn như quán chắc chắn đang mở.
- Local relevance: có vai trò cửa vào văn hóa ẩm thực ngõ; không gọi là di sản chỉ vì lâu năm.
- Self-contained: đủ, câu “bắt đầu tại đây” không được buộc người dùng nghe đúng thứ tự.
- VI/EN: giữ cùng mốc 2021 và tính lời kể; không dịch tên quán thành mức hài lòng được bảo đảm.
- Repetition/filler: cắt ý “không xếp hạng” lặp sau khi đã bỏ superlative.
- Role đề xuất: **supporting place có story ẩm thực**, H1 duyệt, không tự đổi recommendation logic.

#### 07. `trung-yen-dinh-trung-yen` — MAJOR_REWRITE

- Historical accuracy: quyết định S01 và VOV2 S02 giải được phần lớn nghi vấn xếp hạng/địa chỉ; alias/chức Ngự sử chưa đủ. Story hiện phủ nhận khả năng xác minh trong khi field khác khẳng định (T03–T06).
- Storytelling appeal: một công trình tín ngưỡng giữa không gian nhà ống có trục kể tốt; hiện bị thay bằng báo cáo research.
- Audio: phải viết lại theo fact sheet duyệt, không đọc một đoạn tuyên bố chưa xác minh đã lỗi thời.
- Local relevance: story di sản cốt lõi của Trung Yên, không chỉ khoảng đệm giữa các quán.
- Self-contained: nhận diện tên thường dùng/tên pháp lý ngắn rõ; không cần kể cả bộ quyết định trong audio.
- VI/EN: glossary duyệt trước: tên thường dùng “đình/Communal House”, tên pháp lý “Đền Trung Yên”; không search-replace mọi tên thành temple từ một quyết định.
- Repetition/filler: bỏ công thức “câu chuyện dừng ở đây”, đồng bộ summary/caption/intro/alleyStory/guide.
- Role đề xuất: **story**. H1/H2 duyệt cách trình bày hai tên; H3 kiểm điều kiện vào, không cam kết lịch mở.

#### 08. `trung-yen-bun-ca-sam-cay-si` — MINOR_REVISION

- Historical accuracy: S07 hỗ trợ tên Sâm/cây si; chưa đủ cho lịch sử chuyển từ chợ Hàng Bè. S06 hỗ trợ cách gọi đùa/món được mô tả tại thời điểm bài (T08–T09).
- Storytelling appeal: tên người/tên cây/cách gọi món đủ sức gợi, không cần thêm hành trình di cư quán chưa chứng minh.
- Audio: một cảnh kể tập trung tốt hơn liệt kê hai báo rồi kết luận chúng khác nhau.
- Local relevance: món ăn và ký ức người bán phù hợp, không biến cách chơi chữ thành nhận xét tính cách.
- Self-contained: giữ nhận diện; bỏ phụ thuộc “Nhàn ở bên” làm kết chuyện nếu không cần.
- VI/EN: giữ tên riêng và nghĩa có attribution; không tự thay ngan/duck hoặc fish roll thành món khác.
- Repetition/filler: tránh lặp “báo ghi, mỗi người tự đánh giá, hai báo khác nhau”.
- Role đề xuất: **supporting place có story**, H1 duyệt; mọi giờ/menu hiện hành vẫn H3.

#### 09. `trung-yen-bun-ngan-nhan` — MINOR_REVISION

- Historical accuracy: hàng đợi và phục vụ là nhận xét trong bài cũ; summary/caption hiện làm mờ thời điểm (T10).
- Storytelling appeal: chưa nên dùng tranh cãi phục vụ như “đặc sản văn hóa”; cần chọn một góc kể đời sống trung tính đã có nguồn.
- Audio: bỏ ranking và mô tả chê người bán là đề xuất cần duyệt, không phải đã sửa. Không bảo đảm sẽ xếp hàng bao lâu.
- Local relevance: ẩm thực ngõ có liên quan, nhưng danh tiếng cá nhân cần duyệt nhạy cảm.
- Self-contained: đủ nhận diện; “điểm phở gà kế tiếp” không là cốt truyện.
- VI/EN: cùng cách quy nguồn và giới hạn thời gian; không biến “có thể” thành “luôn”.
- Repetition/filler: nhiều câu caveat cho một review cũ; có thể rút cả review thay đọc dài phần phòng vệ.
- Role đề xuất: **supporting place**; H1 quyết giữ/loại nội dung danh tiếng, H3 xác nhận quán nếu muốn guide hiện hành.

#### 10. `trung-yen-pho-ga-huong-tra` — MISSING_CONTENT

- Historical accuracy: chưa có nguồn gắn riêng với quán; summary/caption/guide khẳng định menu/giờ trong khi story nói chưa biết (T11–T12).
- Storytelling appeal: chỉ là tên dừng và tuyên bố thiếu nguồn; không đủ story.
- Audio: không nên kéo dài lời “mình chưa tìm được” để che thiếu tư liệu, cũng không thêm mô tả mùi vị tưởng tượng.
- Local relevance: chưa rõ vì sao chọn quán này thay các quán có nguồn, nhưng không tự thay node trong phase này.
- Self-contained: độc lập về label, chưa độc lập về thông tin thực tế.
- VI/EN: cùng thiếu nguồn, không lấy đoạn phở gà nói chung để xác minh Hương Trà.
- Repetition/filler: trùng cấu trúc các café Gạch.
- Role đề xuất cần H1 duyệt: **waypoint/demo label pending identity**, hoặc giữ story chờ nghiên cứu; không xóa/thay node tự động.

### Ngõ Tạm Thương

#### 11. `tam-thuong-dinh-yen-thai` — MINOR_REVISION

- Historical accuracy: số 8/thờ Ỷ Lan/xếp hạng 1995/hiện vật có nguồn cổng địa phương; alias Quán Linh Từ chưa đủ (A02–A04). Không thêm ngày lập đình hoặc số sắc phong đang bất nhất.
- Storytelling appeal: vai trò cộng đồng tín ngưỡng mạnh; cần chuyển từ liệt kê tư liệu sang một trục kể ngắn mà không bịa cảnh quan sát.
- Audio: giảm dày tên/niên đại, vẫn giữ “chưa rõ năm khởi dựng” nếu cần ngăn hiểu nhầm.
- Local relevance: story di sản chính trong ngõ, không gộp với truyền thuyết Vọng Tiên.
- Self-contained: đủ; câu chuyển tới Vọng Tiên là tùy chọn, không buộc nghe tiếp.
- VI/EN: cùng cách gọi Ỷ Lan và mức certainty; không dịch sắc phong thành ngày xây dựng.
- Repetition/filler: summary/caption có thể giữ trục nhận diện, story tránh đọc lại toàn bộ artifacts của alleyStory.
- Role đề xuất: **story**, H1 duyệt; H2 bổ sung alias, H3 về giờ/tiếp cận nội điện.

#### 12. `tam-thuong-den-vong-tien` — MINOR_REVISION

- Historical accuracy: legend đã được gắn nhãn; nguồn vị trí có bất nhất Hàng Bông/Cửa Nam, chưa field check (A05–A07).
- Storytelling appeal: gặp gỡ/biến mất/tưởng nhớ là một mạch ngắn rõ, nên giữ là truyện dân gian.
- Audio: tránh mở “main story for this leg” gây hiểu là điểm chính của chính ngõ; không đọc dài phần “nguồn tôi đã kiểm”.
- Local relevance: điểm tín ngưỡng liên quan ngoài ngõ, không biến mọi điểm lân cận thành di tích trong Tạm Thương.
- Self-contained: tốt hơn bản Cấm Chỉ, không cần nghe collection khác.
- VI/EN: giữ ranh giới truyền thuyết và thờ Mẫu; không khẳng định vua thật sự có cuộc gặp.
- Repetition/filler: cùng physical temple với node Cấm Chỉ; có thể dùng chung fact sheet, không phải xóa một node.
- Role đề xuất: **supporting place có story truyền thuyết**; H1 duyệt phạm vi, H3 xác nhận vị trí/lối vào.

### Ngõ Cấm Chỉ

#### 13. `cam-chi-khong-gian-nghe-thuat` — MINOR_REVISION

- Historical accuracy: bản đăng lại Hà Nội TV hỗ trợ dự án đầu 2025, tượng và cổng lấy cảm hứng Đại Hưng; chưa thân bài nguồn gốc/hiện trạng (C04).
- Storytelling appeal: đối chiếu truyện tên ngõ với nghệ thuật đương đại có ích; không gọi cổng mới là di tích cổng cổ.
- Audio: dễ đọc nếu tập trung vào một hình ảnh, không lặp toàn bộ Chúa Chổm đã có ở intro.
- Local relevance: là lớp văn hóa đương đại, không được nâng thành chứng cứ xác thực truyền thuyết.
- Self-contained: nêu vị trí khu Cấm Chỉ–Tống Duy Tân đủ để hiểu, không cần định tuyến đến cổng.
- VI/EN: cả hai phải giữ “inspired by/lấy cảm hứng”, không “original/reconstructed ancient gate” khi chưa nguồn.
- Repetition/filler: ẩn dụ cấm/đón khách chỉ nên xuất hiện một lần (C05).
- Role đề xuất: **story về không gian văn hóa đương đại**; H1 duyệt, H3 cho tình trạng tiếp cận hiện nay.

#### 14. `cam-chi-ngo-hoi-vu` — MINOR_REVISION

- Historical accuracy: ba phố kết nối có nguồn báo; Cô Tư Hồng ở mức lời truyền, guide cần cùng caveat (C06–C07).
- Storytelling appeal: ký ức cư dân có giá trị nhưng không đủ căn cứ để kể tiểu sử sở hữu/từ thiện như fact.
- Audio: bỏ kết luận tự thuật “không tìm nguồn gốc”; giữ một attribution tự nhiên, không nói tuyệt đối không có tư liệu nào.
- Local relevance: supporting place ngoài tuyến ngõ chính; cần giải thích quan hệ khu vực ngắn.
- Self-contained: không phụ thuộc ngõ khác; không cần mời vào nhà/villa riêng.
- VI/EN: cùng “tương truyền/the account recalls”, không biến legend thành tiểu sử chắc chắn.
- Repetition/filler: “bài báo chỉ ghi/chưa có hồ sơ” đang chiếm phần đáng kể đoạn kết.
- Role đề xuất: **supporting place**, chưa cần ép thành heritage story dài; H1/H2 duyệt cách kể nhân vật.

#### 15. `cam-chi-den-vong-tien` — MAJOR_REWRITE

- Historical accuracy: nhận diện cơ bản dựa S10; phần lớn story lại giải thích tên Cấm Chỉ rồi chuyển câu chuyện đền sang Tạm Thương (C08).
- Storytelling appeal: node tên đền nhưng người nghe không nhận được câu chuyện đền, trọng tâm sai.
- Audio: phải nghe riêng vẫn hiểu nơi thờ Mẫu và truyện liên quan có nhãn; không dùng “đã kể ở chặng Tạm Thương”.
- Local relevance: supporting place Hàng Bông, không di tích nằm trong Cấm Chỉ.
- Self-contained: **không đạt** hiện tại; sửa prose, không đổi navigation/order.
- VI/EN: lỗi phụ thuộc có ở cả hai, cần cùng sửa chứ không chỉ dịch lại một bản.
- Repetition/filler: etymology Cấm Chỉ trùng intro/alleyStory; thay bằng fact sheet Vọng Tiên được duyệt, không chép nguyên một story rồi coi đã biên tập.
- Role đề xuất: **supporting place có story tự chứa**. H1 duyệt góc kể cho hai collection; giữ hai ID khác nhau.

### Ngõ Phất Lộc

#### 16. `phat-loc-den-tien-ha` — REQUIRES_SOURCE_VERIFICATION

- Historical accuracy: nhầm quê người thờ với cộng đồng di cư (P03), tác giả–năm 1886 xung đột (P05), số 46/48 chưa chốt (P06). Đây là gate nội dung, không chỉ lỗi văn phong.
- Storytelling appeal: nhân vật/thờ tự và ký ức cộng đồng là hai trục có thể kể, phải phân chủ thể, không dùng quan hệ quê quán tưởng tượng để nối chúng.
- Audio: hiện có hai claim rủi ro đã được đọc thành lời; chưa được phép tạo lại hay repin để che lỗi. Chờ H1 quyết phương án tạm không dùng claim nhạy cảm ở bản tương lai.
- Local relevance: story di sản chính Phất Lộc, cần reviewer chuyên môn cho bia.
- Self-contained: đủ cấu trúc nhưng sai liên kết facts làm toàn đoạn chưa duyệt được.
- VI/EN: lỗi quê quán và 1886 có ở cả hai; không coi EN trung thành là chính xác lịch sử.
- Repetition/filler: bia/làng lặp trong alleyStory; cần cùng một fact sheet thay sửa cục bộ story.
- Role đề xuất: **story**, chưa duyệt lời kể. H2 cần hồ sơ bia, H3 địa chỉ, H1 quyết loại/giữ claim khi chờ nguồn; tuyệt đối không đoán năm thay thế.

#### 17. `phat-loc-cac-nhanh-ngo` — MAJOR_REWRITE

- Historical accuracy: S20 có mô tả ba nhánh hội tụ, nên không thể nói hoàn toàn thiếu nguồn; lối Mã Mây gần 34 vẫn chưa được xác nhận công cộng (P07–P08).
- Storytelling appeal: không gian ở–buôn bán có ý nghĩa hơn liệt kê ba đường và nhật ký thiếu nguồn.
- Audio: bỏ chỉ dẫn có thể đưa người nghe vào lối riêng; nhấn đây là mô tả không gian trong phóng sự có thời điểm, không GPS guide.
- Local relevance: sinh kế/cấu trúc cư trú là chủ đề đúng, nhưng chưa có phỏng vấn mới để kể hộ một gia đình cụ thể.
- Self-contained: có thể độc lập bằng một đoạn quan sát có nguồn; không cần dựa vào Tiên Hạ để hoàn tất câu chuyện.
- VI/EN: cùng thời điểm/giới hạn, tránh EN nâng “nhánh” thành đường đi bộ an toàn đã xác minh.
- Repetition/filler: dày câu “không khẳng định/đợi khảo sát”; rút vào note sau khi chốt role.
- Role đề xuất cần H1 duyệt: **supporting waypoint**, hoặc story đời sống ngõ sau nghiên cứu bổ sung; không tự đổi tags/schema, không tạo route mới.

## 3. Các surface cấp ngõ phải biên tập cùng node

| Collection | Giữ trục | Chỉnh/để pending | Ranh giới |
| --- | --- | --- | --- |
| ngo-gach | Đình Thanh Hà và đời sống quán nhỏ; thừa nhận Cầu Đông là điểm liên quan | G08; G01/G05; ba café thiếu chất liệu | Không tự bổ sung intro audio/alleyStory/guide để đủ cấu trúc |
| ngo-trung-yen | Ký ức làng/hồ và tín ngưỡng–ẩm thực | T02–T06; mọi surface Hương Trà; review quán có ngày | Không đổi 146 m thành 200 m chỉ vì văn bản ghi vậy |
| ngo-tam-thuong | Tên kho tạm–Ỷ Lan–biến đổi đời sống | EN “it was moved” làm rõ đối tượng; alias; guide giờ | Không nói địa điểm quán hiện nay chính xác trên nền kho cũ khi chưa bản đồ |
| ngo-cam-chi | Legend có nhãn + nghệ thuật đương đại | Mốc 2000s pending; Vọng Tiên tự chứa; Cô Tư Hồng caveat | Cổng nghệ thuật không phải GPS/cửa thành cổ đã xác nhận |
| ngo-phat-loc | Cộng đồng mang tên làng và sinh kế có nguồn thời điểm | P03/P05/P06; không chốt năm lập ngõ; cập nhật caveat nhánh | Không biến lời người họ Bùi thành quê Nguyễn Trung Ngạn |

Intro tạo cảm xúc, alleyStory chứa chi tiết/attribution, node story có một trục độc lập, caption nhận diện + caveat thiết yếu, guide chứa thông tin thực dụng có nguồn/ngày. Đây là đề xuất phân vai biên tập, không quyền sửa UI hay thêm field.

## 4. Quyết định sản phẩm và human gate

Đề xuất giữ nguyên cả 17 IDs/order, không xóa café/Hương Trà/nhánh ngõ. Chuyển **vai trò biên tập** 5 node (ba café, Hương Trà, nhánh Phất Lộc) sang waypoint/supporting waypoint chỉ sau H1; nhãn này chưa tồn tại như enum mới trong runtime và không được tự thêm schema. Muốn mọi node đều có story dài cần nguồn riêng, không copy câu chuyện di tích lân cận sang quán.

Hai node Vọng Tiên cùng một địa điểm nhưng là hai content IDs theo collection. Dùng chung fact sheet/terminology, mỗi đoạn phải tự chứa; không merge ID hoặc ép người dùng chuyển collection. Điểm ngoài ngõ (Vọng Tiên, Hội Vũ, Cầu Đông) cần lời giới thiệu đúng ranh giới, không tuyến đường dẫn bộ chưa khảo sát.

Không có listening/native verification trong Phase 2A. Các clip hiện hữu không được đánh dấu listened/humanApproved; sau biên tập, human review chữ VI/EN đi trước mọi voice delta và nghe lại. Review này không phê duyệt nội dung của bản biên soạn cũ hoặc quyền triển khai NK-006.
