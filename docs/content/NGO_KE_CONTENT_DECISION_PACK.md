# Ngõ Kể — Content Decision Pack, Phase 2B

Ngày: 23/10/2026. Baseline: `4af64c49a4ada47f952ddf76c35adfb90f826224`, branch `valentino/logic-fix-mobile-20261020`, có WIP Phase 1A/1B/UI Wave 1. Đây là đề xuất editorial, không phải quyết định đã duyệt hay quyền tích hợp.

**Trạng thái toàn bộ D1–D7: `PENDING_HUMAN_APPROVAL`.** Bản chữ để duyệt: [Batch A VI/EN](NGO_KE_BATCH_A_VI_EN_DRAFT.md). Bằng chứng kỹ thuật và giới hạn: [báo cáo Phase 2B](../reviews/NGO_KE_PHASE2B_DRAFT_REPORT.md).

## 1. Bảy quyết định cần chọn

| ID | Cần quyết | Phương án đề xuất | Nếu chưa chốt |
| --- | --- | --- | --- |
| D1 | Đình/Đền Trung Yên; thuật ngữ VI/EN | Giữ tên thường dùng; giải thích tên pháp lý ở story/phần đọc; chưa dùng Thanh Cẩm/Ngự sử | Chưa tích hợp chữ mới cho node và các surface liên quan |
| D2 | Tiên Hạ, Nguyễn Siêu/1886, quê quán; bia Thanh Hà/1430 | Tạm không dùng claim tranh chấp; không đoán ngày thay thế; tách cộng đồng di cư khỏi nhân vật được thờ | Các claim đó vẫn bị chặn dù bản thảo không chứa chúng |
| D3 | Story hay waypoint ở năm node thiếu nguồn | Giữ ID/order, coi là waypoint về mặt biên tập; chỉ kể thêm khi có bằng chứng | Batch C chưa có quyền viết lịch sử/quảng bá quán |
| D4 | Cầu Đông, Hội Vũ, hai Vọng Tiên | Điểm liên quan ngoài ngõ, không phải lộ trình GPS; mỗi Vọng Tiên tự chứa | Không khẳng định cửa vào, đường nối, giờ mở cửa |
| D5 | Phục vụ, hàng đợi, ranking, menu/giờ cũ | Bỏ đánh giá dịch vụ/ranking khỏi lời kể; dữ liệu vận hành chỉ dùng khi có nguồn có ngày và caveat | Không coi danh bạ/bài báo cũ là hiện trạng |
| D6 | Cấu trúc Ngõ Gạch | Sửa intro.text đang có để bỏ niên đại chưa đủ nguồn; không thêm intro audio/alleyStory/guide vì đối xứng | Không phát sinh loại nội dung/asset mới |
| D7 | Duyệt chữ → tích hợp → voice | Duyệt exact fields VI/EN; mở NK-006 riêng; lead review delta NK-009; paid NK-010 có gate riêng | Không tích hợp, repin hay chi credits |

Mọi hàng trên là `PENDING_HUMAN_APPROVAL`, kể cả khi bằng chứng cho một fact đã rõ. Chọn hướng D1–D7 không đồng nghĩa duyệt mọi câu chữ, mọi claim hoặc toàn bộ collection.

## 2. Quy ước bằng chứng

Claim IDs và S01–S30 kế thừa nguyên nghĩa từ [Claim Ledger Phase 2A](NGO_KE_CLAIM_LEDGER.md). Phase 2B không sửa ledger, không nâng các trạng thái VERIFIED/PARTIALLY_SUPPORTED/CONFLICTING/UNVERIFIED/LEGEND. `SUPPORTED_FOR_DRAFT` chỉ cho biết cách dùng có giới hạn trong bản thảo, không phải historical approval. `PENDING_HUMAN_DECISION` dùng cho lựa chọn giữ/lược/thuật ngữ; `BLOCKED_CLAIM` dùng cho mệnh đề chưa được phép kể như fact.

Nguồn trực tiếp dùng cho Batch A, trang và phạm vi đã đối chiếu lại ngày 23/10/2026:

| Source ID | Nguồn, ngày công bố | Phạm vi sử dụng; giới hạn |
| --- | --- | --- |
| S01 | [QĐ 07/2008/QĐ-BVHTTDL, 26/02/2008](https://vanban.chinhphu.vn/default.aspx?docid=78382&pageid=27160) | Nguồn sơ cấp về tên pháp lý và xếp hạng; không phải hồ sơ đầy đủ về nhân vật thờ tự |
| S02 | [VOV2 — Lễ gắn biển công trình đình Trung Yên, 29/06/2023](https://vov2.vov.vn/van-hoa-giai-tri/le-gan-bien-cong-trinh-dinh-trung-yen-43075.vov2) | Nối tên thường gọi với cùng quyết định; mô tả địa điểm/công trình ở thời điểm bài viết, không chứng minh lịch tham quan hôm nay |
| S16 | [SGGP — Ngõ Phất Lộc, 13/08/2006](https://www.sggp.org.vn/ngo-phat-loc-dac-trung-ngo-ha-noi-post152339.html) | Có thật câu Nguyễn Siêu/1886 và số 48; giữ làm bằng chứng mâu thuẫn, không lấy uy tín tờ báo thay đối chiếu |
| S17 | [Bảo tàng Lịch sử Quốc gia — Nguyễn Siêu, 09/03/2015](https://baotanglichsuquocgia.vn/vi/Articles/3098/17777/nguyen-sieu-mot-danh-nhan-van-hoa-cua-thang-long-ha-noi-1799-1872.html) | Mốc đời 1799–1872; không cho biết ngày đúng của bia Tiên Hạ |
| S18 | [Đại biểu Nhân dân — Đền Tiên Hạ và danh nhân Nguyễn Trung Ngạn, 31/01/2008](https://daibieunhandan.vn/den-tien-ha-va-danh-nhan-nguyen-trung-ngan-10024624.html) | Tư liệu báo chí về nhân vật/thờ tự; địa chỉ 46 khác S16. Quê nhân vật được mô tả theo địa danh trong bài năm 2008, không tự cập nhật hành chính 2026 |
| S19 | [VietnamPlus — Nhâm nhi Hà Nội trong lòng ngõ Phất Lộc, 09/10/2024](https://mega.vietnamplus.vn/nham-nhi-ha-noi-trong-long-ngo-phat-loc-6637.html) | Lời dân ngõ được nhà báo ghi lại về cộng đồng/tên làng; không phải chứng thư lập ngõ |
| S22 | [Cổng du lịch Hoàn Kiếm — Đình Thanh Hà, không ghi ngày bài](https://hoankiem360.tourism.vn/chi_tiet_di_tich_lich_su/dinh-thanh-ha.html) | Nhận diện/thờ tự/lịch lễ theo trang giới thiệu; không xác nhận lễ hội sắp diễn ra hay người dùng vào được |
| S10 | [Hanoi Heritage Map — Đền Vọng Tiên, không ghi ngày bài](https://heritage-itineraries.com/di-tich/den-vong-tien) | Nguồn biên soạn di sản về thờ tự và truyền thuyết; phần địa chỉ chưa thống nhất. Không phải xác nhận lịch sử của cuộc gặp trong truyện |
| B2B-S01 | [Cục Di sản văn hóa — Đình Thanh Hà, không ghi ngày bài](https://dsvh.gov.vn/dinh-thanh-ha-thanh-pho-ha-noi-22263) | Nguồn bổ sung Phase 2B, ghi theo hồ sơ tư liệu của Cục; hỗ trợ nhận diện/lịch lễ và phân biệt bia khắc lại. Không tự sửa status G06/G08/G09 trong ledger |
| B2B-S02 | [Sở VHTT Hà Nội — Lễ dâng hương đình Thanh Hà](https://sovhtt.hanoi.gov.vn/le-dang-huong-ky-niem-ngay-hoa-duc-dai-vuong-tran-luu-tai-dinh-thanh-ha/) | Trang hiển thị 05/11/2025 và 06/01/2026; tường thuật sự kiện 04/11/2025, cuối bài dẫn Người Hà Nội. Hỗ trợ thờ tự/lịch lễ; không phải lịch mở cửa hiện tại hoặc nguồn độc lập hoàn toàn với bài gốc |

Không lấy ngày header của website làm ngày xuất bản. Nguồn nội bộ `FOUR_ALLEYS_SOURCE_20261022.md`, `FOUR_ALLEYS_EN_NARRATION_20261023.md` và `ALLEY_RESEARCH_NGO_GACH_TRUNG_YEN_20261022.md` là provenance biên soạn, không phải chứng cứ độc lập thứ hai. Review dịch EN trước đây không chứng minh facts hay chất lượng phát âm.

B2B-S01/S02 được mở và đọc thân bài trong Phase 2B, không chèn ngược vào ledger Phase 2A. Hai trang ghi ngày xếp hạng Thanh Hà khác nhau trong năm 1989; candidate không dùng chi tiết này, chưa giải mâu thuẫn bằng cách chọn một trang. B2B-S01 củng cố sự cần thiết tách bản khắc lại khỏi niên đại văn bản, không tự giải được claim 1430/cổ nhất.

## 3. D1 — Trung Yên

**Status: `PENDING_HUMAN_APPROVAL`.**

- **Cần quyết/evidence:** T03 VERIFIED cho tên thường gọi và xếp hạng; T04 CONFLICTING là mâu thuẫn certainty trong runtime, không phải quyết định năm 2008 sai. S01 gọi **Đền Trung Yên**; S02 dùng **đình Trung Yên** và dẫn cùng quyết định. T05 chỉ PARTIALLY_SUPPORTED; T06 alias/chức cụ thể còn UNVERIFIED.
- **Phương án:** A giữ common name, giải thích legal name; B đổi toàn bộ display name sang legal name sau duyệt; C chờ thêm hồ sơ rồi mới kể. **Đề xuất A**, không search-replace Đình→Đền.
- **VI/EN:** node vẫn “Đình Trung Yên” / “Trung Yên Communal House”; khi nói văn bản pháp lý dùng “Đền Trung Yên” / “Trung Yên Temple”, giữ rõ đây là tên trong quyết định của cùng di tích. Không coi hai cách gọi là hai địa điểm.
- **Fields:** `ngo-trung-yen`, node `trung-yen-dinh-trung-yen`: summary/story; đồng bộ `alleyStory.paragraphs[1]`, `guide.visit[0].notes`. Intro đang dùng common name và xếp hạng đúng hướng nên không cần đổi chỉ để nhắc thêm số quyết định. Caption hiện hành có thể giữ.
- **Risk:** gọi sai loại di tích hoặc tạo alias mới; đưa pháp lý dài vào audio. Chỉ giữ tên/năm ngắn trong story; số văn bản nằm ở phần đọc.
- **Audio:** story VI/EN dự kiến đổi. Chỉnh phần đọc vẫn đổi whole-dataset revision, cần kiểm cả intro và các story giữ nguyên chữ.
- **Còn pending:** Thanh Cẩm, chức Ngự sử, danh tính đầy đủ của vị được thờ, năm xây dựng và điều kiện tiếp cận. Nếu dùng mô tả quan/tiến sĩ thời Mạc, phải gắn S02 và không nâng thành chức Ngự sử.
- **Câu chọn:** “Tôi chọn D1-A: giữ tên thường dùng, phân biệt tên pháp lý như bản thảo; chưa dùng alias/chức danh thiếu nguồn.”

## 4. D2 — Niên đại và chủ thể tranh chấp

**Status: `PENDING_HUMAN_APPROVAL`.**

- **Cần quyết/evidence:** P03/P05/P06 CONFLICTING; G08 PARTIALLY_SUPPORTED. S16 và S17 tạo mâu thuẫn về thời điểm soạn bia; S22 phân biệt bản khắc lại với văn bản được truyền lại. Chưa có thác bản/hồ sơ gốc giải được cả hai trường hợp. P03 là ghép nhầm chủ thể khi đối chiếu S18 với S19.
- **Phương án:** A tạm không dùng các mệnh đề tranh chấp; B giữ tranh luận có attribution trong ghi chú nghiên cứu, không spoken; C chặn cả node đến khi có chuyên gia. **Đề xuất A cho candidate, B chỉ ở hồ sơ này**, không xóa dấu vết nguồn cũ.
- **Phạm vi tạm lược PROPOSED:** Nguyễn Siêu “soạn năm 1886”; bia Thanh Hà hiện còn “dựng 1430/cổ nhất”; “làng quê Nguyễn Trung Ngạn ở Thái Bình”; chọn chắc số 46/48; địa danh/quân số trong truyền thuyết G07 chưa mở đủ nguồn. Không thay bằng một năm hoặc tác giả đoán khác.
- **Fields:** story Tiên Hạ; story/summary/caption Thanh Hà và intro Gạch; `ngo-phat-loc.alleyStory.paragraphs[2]`; ghi chú bia trong `guide.visit[0].notes[1]`. Tên, ID, tọa độ không đổi.
- **Risk/trade-off:** câu chuyện ít chi tiết niên đại hơn nhưng không đưa một giả thuyết lên thành fact. Việc không dùng là lựa chọn biên tập, không phải tuyên bố nguồn đã bị bác bỏ toàn bộ.
- **Audio:** hai story × hai locale có khả năng cần audio mới nếu duyệt; intro Gạch chưa có track nên không tự tạo. Sửa display/evidence vẫn cần revision-delta review.
- **Còn pending:** tác giả/ngày soạn/ngày khắc lại/niên đại vật thể, danh hiệu “cổ nhất”, địa chỉ/cửa vào, hồ sơ định danh gốc. Bản Tiên Hạ dùng thờ tự có attribution và chuyện tên làng có attribution; không cần kể quê cá nhân để sửa nhầm lẫn.
- **Câu chọn:** “Tôi chọn D2-A/B: duyệt hướng không sử dụng các claim liệt kê trong candidate; giữ chúng pending ở hồ sơ, không sửa niên đại bằng suy đoán.”

## 5. D3 — Story vs waypoint

**Status: `PENDING_HUMAN_APPROVAL`.**

- **Cần quyết/evidence:** G02–G05/G10, T11 và P07/P08/P12 trong ledger/editorial review. Ba café thiếu chuyện có nguồn; Hương Trà chưa có bằng chứng đủ cho identity/menu/hours. Nhánh ngõ có nguồn mô tả đô thị nhưng quyền đi qua/lối nối chưa khảo sát.
- **Phương án:** A giữ các node, role editorial là waypoint với lời ngắn đúng evidence; B chờ nghiên cứu/field rồi viết story sâu; C bỏ node hoặc đổi schema. **Đề xuất A, B khi có evidence; không đề xuất C.**
- **Fields:** sau gate riêng chỉ name/summary/caption/story được duyệt của `ngo-gach-ca-phe-no1`, `ngo-gach-ta-ca-phe-4`, `ngo-gach-cafe-20`, `trung-yen-pho-ga-huong-tra`, `phat-loc-cac-nhanh-ngo`. “Waypoint” trong tài liệu không phải enum mới; giữ cả năm IDs, thứ tự, start node, geometry và controls.
- **Risk:** waypoint bị hiểu là chỉ dẫn đi bộ; hoặc cố làm dài audio bằng lịch sử/quảng bá bịa. Không tự ẩn player, xóa MP3, vô hiệu hóa voice commands vì qa=[], hay cắt node khỏi gợi ý.
- **Audio:** có thể đổi năm story VI/EN nhưng chưa có exact text, chưa tính số regenerate. Chưa có quyền thay hành vi audio cho waypoint.
- **Còn pending:** định danh/hoạt động café, Hương Trà; đường công cộng/cửa thông Phất Lộc. Nhãn từ map không chứng minh cửa đang mở.
- **Câu chọn:** “Tôi chọn D3-A: giữ năm node dưới role biên tập waypoint, không đổi schema/order và không bịa thêm chuyện; phần chưa đủ nguồn tiếp tục chờ.”

## 6. D4 — Địa điểm liên quan ngoài ngõ

**Status: `PENDING_HUMAN_APPROVAL`.**

- **Cần quyết/evidence:** G11–G12, A05–A07, C06–C08. S10 dùng được cho một bản kể truyền thuyết có nhãn, không xác minh đường vào. S24/S15 trong ledger là nguồn cho Cầu Đông/Hội Vũ, không phải khảo sát tuyến hiện tại.
- **Phương án:** A giữ supporting places ngoài ngõ, tự chứa và không hướng dẫn đường; B chỉ mở sau khảo sát; C hợp nhất/xóa hai node Vọng Tiên. **Đề xuất A cho chữ; B cho chỉ dẫn thực địa; không chọn C.**
- **Fields:** Cầu Đông trong `ngo-gach`; Hội Vũ và Vọng Tiên trong `ngo-cam-chi`; Vọng Tiên trong `ngo-tam-thuong`; summary/caption/story và guide liên quan. Candidate Batch A chỉ viết Vọng Tiên–Cấm Chỉ. Bản Tạm Thương có ticket Batch B, không tự sao chép hay viết lại ngoài scope.
- **Contract:** giữ `cam-chi-den-vong-tien` và `tam-thuong-den-vong-tien` riêng; cùng fact sheet về thờ tự/legend/caveat, không cần cùng nguyên văn. Không trộn legend Chúa Chổm vào lịch sử Vọng Tiên, không yêu cầu mở collection khác. Guide route chỉ là thứ tự chủ đề đề xuất, không polyline/ETA/chỉ dẫn “vài bước/rẽ”.
- **Risk:** người dùng hiểu địa điểm nằm trong ngõ hoặc cho rằng được vào tự do. Hạ độ chính xác địa chỉ chưa xác minh bằng câu ghi nguồn/caveat sau duyệt, không sửa GPS.
- **Audio:** Vọng Tiên–Cấm Chỉ VI/EN chắc chắn khác bản hiện tại nếu chọn candidate; các story Batch B chỉ xác định delta sau duyệt chữ. Không có audio route hay track mới.
- **Còn pending:** cửa vào, số nhà/địa danh hành chính của Vọng Tiên; public access, giờ/vé; lối đi Cầu Đông/Hội Vũ; mọi legend vẫn là legend.
- **Câu chọn:** “Tôi chọn D4-A/B: giữ điểm liên quan ngoài ngõ và hai bản Vọng Tiên độc lập; chưa cho phép dùng như tuyến đi thực địa.”

## 7. D5 — Quán ăn và thông tin thay đổi theo thời gian

**Status: `PENDING_HUMAN_APPROVAL`.**

- **Cần quyết/evidence:** T07–T12, A08–A10, C09–C10, P09–P11; nguồn báo/danh bạ trong ledger có ngày khác nhau, không có field check 2026. Attribution không biến đánh giá dịch vụ thành lời khuyên hiện hành của Ngõ Kể.
- **Phương án:** A bỏ ranking/hàng đợi/khen chê phục vụ khỏi narration, kể tên gọi/sinh kế có nguồn; B giữ trích dẫn có ngày ở phần đọc khi có giá trị rõ; C đọc nguyên danh bạ. **Đề xuất A; B phải duyệt từng câu, không C.**
- **Fields:** các node đồ ăn Trung Yên và `guide.eat` của bốn ngõ có guide. Không viết lại trọn 13 node ngoài Batch A trong đợt này. Hương Trà còn chờ D3, không suy từ tên món để xác nhận quán cụ thể.
- **Risk:** tổn hại uy tín quán, quảng cáo ngầm, khách đến giờ sai; bỏ giờ không có nghĩa quán đã đóng. Dùng “chưa xác minh” thay kết luận hoạt động/không hoạt động.
- **Audio:** chỉ story/intro thật sự đổi mới có spoken delta; guide hiện không là text được hai generator ngõ đọc. Dù vậy, thay guide làm revision thay đổi.
- **Còn pending:** menu/hours/prices/operation hiện tại; mọi service/ranking claim chưa được human chấp thuận. Không dùng “danh bạ hiện tại” khi không có ngày kiểm tra rõ.
- **Câu chọn:** “Tôi chọn D5-A: không đọc ranking, thời gian chờ hay đánh giá phục vụ như hiện trạng; thông tin vận hành chờ nguồn có ngày và duyệt riêng.”

## 8. D6 — Ngõ Gạch không cần đối xứng cấu trúc

**Status: `PENDING_HUMAN_APPROVAL`.**

- **Cần quyết/evidence:** G13 VERIFIED về cấu trúc: có `intro.text`, 5 node story mỗi locale; không có `alleyStory`, `guide` hoặc intro track. G08 còn rủi ro ngay trong intro hiện có. Không gọi là “thiếu toàn bộ intro”.
- **Phương án:** A sửa intro.text ngắn, không thêm cấu trúc/asset; B làm brief riêng cho intro audio/alleyStory/guide; C tự đồng bộ với các ngõ khác. **Đề xuất A; B là scope mới; không C.**
- **Fields:** chỉ candidate intro.text và node Thanh Hà trong Batch A. Không tạo field mới, không sửa start/order để bù ba café.
- **Risk:** thêm scope chỉ để UI đẹp, lặp câu chuyện, sinh chi phí voice. B cần mục đích người nghe, nguồn, độ dài/entry point, fields/schema/test ownership, paid/audio gate riêng.
- **Audio:** intro.text sửa vẫn chưa có MP3; không coi đây là clip cần regenerate. Chỉ Thanh Hà có spoken story delta dự kiến; cả 10 node-story slots của Gạch chịu revision review.
- **Còn pending:** D2 về bia; D3 café; D4 Cầu Đông. Không phê duyệt toàn Gạch bằng việc chọn D6-A.
- **Câu chọn:** “Tôi chọn D6-A: sửa intro đang có để tránh claim bia chưa đủ nguồn, không thêm intro audio/alleyStory/guide.”

## 9. D7 — Gate tích hợp và voice

**Status: `PENDING_HUMAN_APPROVAL`.**

- **Cần quyết/evidence:** NK-006/009/010 và `canonicalJson.ts`, `localizedCatalog.ts:42`, `useVoiceSession.ts:442–462`. Revision là canonical hash **toàn dataset**, không chỉ narration. Story và intro dùng exact textHash; field khác đổi vẫn có thể làm catalogue cũ không resolve.
- **Phương án:** A duyệt từng field VI/EN và rollout/delta trước mở integration; B chỉ duyệt hướng rồi để worker tự hoàn thiện chữ; C đổi guard để giữ audio. **Đề xuất A; không B/C.**
- **Exact text:** duyệt cả string cuối cùng, dấu câu, dấu tiếng Việt, khoảng trắng và paragraph breaks; không duyệt đoạn patch rồi mặc định toàn intro đã được duyệt. Name/summary/caption/phần đọc có disposition riêng. VI/EN phải cùng chủ thể, thời điểm, legend/uncertainty, không dịch “có nguồn” thành “đã xác minh”.
- **Fields/files tương lai:** đúng 5 cặp `data/localized/ngo-*.{vi,en}.json` nhưng chỉ fields được chọn; `collections.ts` chỉ revision trong allowlist NK-006. Nếu cần đổi source snapshot mà test đang pin, phải xin allowlist cụ thể, giữ provenance bản gốc. Catalogue/manifest không mặc nhiên thuộc NK-006.
- **Dependencies:** human disposition D1–D7 theo scope, exact approved fields, snapshot immutable fields, quyền triển khai NK-006 rõ ràng; candidate revision và delta được lead review theo NK-009 trước tích hợp thống nhất. Chưa mở NK-006/009/010 trong Phase 2B.
- **Risk:** trạng thái nửa tích hợp mất audio không đổi chữ; repin audio có text cũ; “approved direction” bị hiểu thành approved history. NK-006 không mở paid TTS NK-010. Có thể cần rollout text-only cho changed tracks nhưng phải được chọn rõ, không fallback clip khác.
- **Audio:** xem inventory mục 11; không xác nhận reuse/regenerate trước exact candidate/delta, không thay humanApproved/listened. Không đọc env để kiểm credits/Voice IDs.
- **Còn pending:** tất cả approval chữ, lịch sử, scope write, rollout và paid batch. 130.000 credits là thông tin bối cảnh, không số dư kiểm chứng hay quyền chi tiêu.
- **Câu chọn:** “Tôi chọn D7-A về quy trình; quyền triển khai NK-006 và mọi batch audio vẫn cần yêu cầu riêng sau khi duyệt exact VI/EN fields và delta.”

## 10. Backlog Batch B/C — 13 node còn lại

Current status dưới đây là assessment Phase 2A, không phải trạng thái approval. “Ready to draft” chỉ nói đủ cơ sở làm bản thảo giới hạn trong phase được cấp quyền sau này. Mọi ticket vẫn chưa dispatch.

| Batch / priority | Node ID | Current status | Source gap | Hướng làm và dependency | Readiness |
| --- | --- | --- | --- | --- | --- |
| B / P1 | `ngo-gach-chua-cau-dong` | MINOR_REVISION | S24 không chứng minh độ gần/lối nối; niên đại tượng là nhận định được dẫn | G11–G12: kể tượng với attribution, không “duy nhất”/chỉ đường; D4/D7 | Ready to draft có giới hạn; access pending |
| B / P2 | `trung-yen-pho-suong` | MINOR_REVISION | T07/T12: lịch sử tên từ lời kể báo chí; VI/EN dư câu khác nhau | Giữ mốc thời điểm nguồn, bỏ “ăn rồi đi tiếp”/xếp hạng; D5/D7 | Ready to draft |
| B / P1 | `trung-yen-bun-ca-sam-cay-si` | MINOR_REVISION | T08–T09: node evidence thiếu S07; chưa đủ cho chi tiết chuyển quán từ Hàng Bè | Bổ sung trace nguồn đúng, tách chuyện tên quán khỏi vận hành; D5/D7 | Ready to draft nếu lược claim chuyển địa điểm |
| B / P1 | `trung-yen-bun-ngan-nhan` | MINOR_REVISION | T10: ranking/queue/service cũ, chưa kiểm hiện trạng | Không giữ service narrative để tạo “cá tính”; không suy diễn chủ quán; D5/D7 | Ready to draft theo D5 |
| B / P2 | `tam-thuong-dinh-yen-thai` | MINOR_REVISION | A02–A04: alias Quán Linh Từ, số sắc phong và niên đại chưa đủ hồ sơ | Giữ thờ tự có nguồn, không chọn 7/10 sắc phong; story tự chứa; D7 | Ready to draft nếu lược chi tiết pending |
| B / P1 | `tam-thuong-den-vong-tien` | MINOR_REVISION | A05–A07: address/access, legend không phải sử kiện | Dùng cùng fact sheet Batch A, viết độc lập, không copy máy móc; D4/D7 | Ready to draft có caveat; field gate mở |
| B / P2 | `cam-chi-khong-gian-nghe-thuat` | MINOR_REVISION | C04–C05: nguồn Hà Nội Online qua bản mirror, không field check | Ghi mốc 2025 theo nguồn, cổng mới “lấy cảm hứng”, không cổng cổ; D7 | Ready to draft, không hứa hiện trạng |
| B / P2 | `cam-chi-ngo-hoi-vu` | MINOR_REVISION | C06–C07: Cô Tư Hồng là lời truyền miệng; chưa có hồ sơ bổ sung | Gắn attribution, tách ngoài ngõ, bỏ chuyển cảnh chỉ đường; D4/D7 | Ready to draft giới hạn |
| C / P2 | `ngo-gach-ca-phe-no1` | MISSING_CONTENT | G02–G03: map/nhãn, không nguồn chuyện/hoạt động | Identity check; waypoint ngắn, không bịa menu/lịch sử; D3/D6/D7 | BLOCKED cho story sâu; waypoint chờ D3 |
| C / P2 | `ngo-gach-ta-ca-phe-4` | MISSING_CONTENT | G04–G05: website hỗ trợ tên/4A, không số bước/chuyện di sản | Giữ đúng tên riêng; bỏ ước lượng bước khi duyệt; D3/D6/D7 | BLOCKED cho story sâu; waypoint chờ D3 |
| C / P2 | `ngo-gach-cafe-20` | MISSING_CONTENT | G10: chỉ map/nhãn | Xác minh identity/quyền ảnh/operation riêng; D3/D6/D7 | BLOCKED cho story sâu; waypoint chờ D3 |
| C / P1 | `trung-yen-pho-ga-huong-tra` | MISSING_CONTENT | T11: tên quán chưa đủ nguồn; summary/menu/giờ chắc hơn story | Không lấy phở gà chung để xác minh quán; identity/field trước; D3/D5/D7 | BLOCKED cho quảng bá/story; waypoint chờ D3 |
| C / P1 | `phat-loc-cac-nhanh-ngo` | MAJOR_REWRITE | P07/P08/P12: có mô tả ba nhánh trong báo 2018; public access/lối Mã Mây34 chưa rõ | Kể cấu trúc/ký ức đô thị có ngày, không rẽ/lối thông; D2/D3/D4/D7 | Ready nghiên cứu; waypoint chờ D3, chỉ dẫn BLOCKED |

Nguồn bổ sung theo source register Phase 2A: S07 VnExpress 11/03/2024, S15 VOV Giao thông 08/02/2025, S20 Thanh Niên 04/05/2018, S24 Báo Pháp Luật 06/10/2020, S25 website Ta Cà Phê. Các URL và giới hạn cụ thể ở ledger; không tuyên bố đã mở lại tất cả nguồn Batch B/C trong Phase 2B. Chưa viết full prose 13 node này.

## 11. Voice impact preview — không phải delta đã duyệt

Target do người dùng cung cấp: ElevenLabs; VI Nhật Phong, EN Talia. Không truy cập API key/Voice IDs/số dư. Không chạy generator, không tạo MP3, không sửa manifest/progress/catalogue/pins.

| Loại thay đổi | Điều cần kiểm khi gate được mở |
| --- | --- |
| 4 Batch A stories × VI/EN | 8 spoken strings khác bản hiện tại nếu duyệt candidate. Đây là 8 **ứng viên changed-text**, không phải lệnh tạo 8 MP3 |
| Gạch intro.text | Có candidate sửa nhưng chưa có intro audio hiện hành; không tự mở slot mới |
| Trung Yên/Phất Lộc/Cấm Chỉ intro.text | Batch A không đề xuất đổi. Vẫn phải kiểm exact strings khi toàn dataset/revision thay; Batch B/C/top-level research có thể tạo delta khác sau này |
| Summary/caption/name/alleyStory/guide/evidence | Hiện không được hai generator node-story/alleys-intro đọc thành track riêng. Screen reader có thể đọc; Qa có fallback summary khi thiếu story, nên không gọi chúng “không bao giờ spoken” cho toàn app/legacy |
| Dataset revision | Canonical whole JSON, giữ array order và exact string. Đổi display/evidence cũng làm pin cũ không resolve; không nới resolver |
| Reuse MP3 | Chỉ khi exact text, scope collection/locale/contentId/node/kind, voice/model/provenance và audio SHA256 đúng; revision mới cần allowlist/lead review NK-009. Text đổi không được dùng clip cũ bằng repin |
| Hash EOL | Node-story `sourceDataSha256` chuẩn hóa CRLF→LF ngoài file và lưu `sourceDataRawSha256`; bare CR bị reject. Intro generator hiện còn raw source hash. `textHash` là exact spoken string; không trim/Unicode-normalize để reuse. Revision là canonical parsed JSON, không raw file hash |

Inventory được đọc từ catalogues/manifests hiện hành: **34 node-story tracks + 8 intro tracks = 42 slots** trên năm ngõ. Không nhầm 34 này với 34 clip demo fiction legacy.

Nếu chỉ tích hợp các field Batch A đề xuất, bốn collection Gạch/Trung Yên/Cấm Chỉ/Phất Lộc đều đổi revision ở VI/EN: **30 story + 6 intro = 36 slots cần kiểm khả năng resolve**, không phải 36 clip cần tạo. Tạm Thương có 4 story + 2 intro, chỉ vào delta nếu candidate tương lai thật sự sửa dataset của nó. Toàn bộ 42 slots là regression perimeter cho năm ngõ; không mở rộng sang voice migration pilot.

NK-009 tương lai cần row old/new revision, exact textHash, source hash theo policy của pipeline, node/kind/locale/contentId, path/audio SHA, voice/model, reuse/changed/missing, rollout và human/listening status. Nếu manifest cần metadata mutation ngoài allowlist NK-009, xin plan/approval cụ thể trước. NK-010 chỉ mở khi người dùng duyệt batch exact text, model/rate đã xác minh, budget/reserve và quyền paid call; không suy ra estimate từ 130.000 credits. Không clip nào được nâng thành human-listened/approved bằng integrity check.

## 12. Việc cần anh quyết / việc anh tự làm

### Cần người dùng quyết

- Chọn D1–D7 bằng các câu ở từng mục; đề xuất các phương án A như bảng đầu. Nếu chưa chọn, không mở integration hoặc dùng proposed omissions như quyết định đã có.
- Duyệt hoặc sửa exact VI/EN fields trong Batch A, bao gồm nhãn legend, attribution và glossary. Có thể duyệt từng node/field; field chưa duyệt không được tích hợp. Duyệt hướng không thay duyệt chữ.
- Khi chữ đã chốt, quyết định rollout changed-text tracks: chờ audio được duyệt hay text-only tạm thời có thông báo rõ. Đề xuất chưa publish candidate nửa tích hợp làm mất audio không đổi chữ.

### Cần người dùng tự làm

- `[ngoài plan]` Cung cấp/chỉ định người chuyên môn hoặc đơn vị quản lý xác nhận hồ sơ bia Tiên Hạ/Thanh Hà, alias và chức danh Trung Yên. Đây là xác minh di sản ngoài tech demo plan; chưa làm thì các claim đó tiếp tục BLOCKED_CLAIM, nhưng có thể duyệt bản lược an toàn.
- `[ngoài plan]` Bố trí khảo sát có phép/ảnh biển địa chỉ và cửa vào cho Vọng Tiên, Tiên Hạ, các điểm ngoài ngõ và waypoint. Không phải kết quả GPS hiện có; chưa làm thì không dùng làm route/access guide thực địa.
- Đọc nghe thử bằng người VI/EN và góp ý tên riêng trước duyệt exact text; sau một batch audio được cho phép riêng, người nghe mới đánh dấu QC từng clip. Không yêu cầu anh cung cấp key hoặc chi credits trong Phase 2B.

**Dừng ở Human Content Review Gate. Không mở NK-006, NK-009 hoặc NK-010.**
