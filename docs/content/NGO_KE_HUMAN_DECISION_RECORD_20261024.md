# Ngõ Kể — Human Decision Record 24/10/2026

Ngày approval: **24/10/2026**. Nguồn quyền: yêu cầu trực tiếp của người dùng “POST-APPROVAL EDITORIAL CONSOLIDATION” trong phiên làm việc này. Đây là record quyết định mới; [Decision Pack gốc](NGO_KE_CONTENT_DECISION_PACK.md), Batch A/B và Style Guide giữ nguyên lịch sử pending tại thời điểm lập.

Baseline ghi nhận: branch `valentino/logic-fix-mobile-20261020`, HEAD `4af64c49a4ada47f952ddf76c35adfb90f826224`, có WIP chưa commit. Record này không xác nhận runtime đã thay đổi.

## 1. Các phương án được duyệt

| Quyết định | Human disposition | Phạm vi đúng theo Decision Pack | Giới hạn vẫn còn |
| --- | --- | --- | --- |
| D1 | APPROVED: D1-A | Giữ tên thường dùng Đình Trung Yên / Trung Yên Communal House; giải thích Đền Trung Yên / Trung Yên Temple là tên trong quyết định xếp hạng của cùng di tích | Không global rename; không dùng alias Thanh Cẩm/chức Ngự sử/danh tính đầy đủ thiếu hồ sơ; bản dịch EN chưa là tên pháp định |
| D2 | APPROVED: D2-A/B | Không dùng claim tranh chấp trong candidate; lưu tranh luận có attribution trong ghi chú nghiên cứu, không spoken; tách cộng đồng di cư khỏi Nguyễn Trung Ngạn | Không đoán năm/tác giả thay thế, không chọn chắc 46/48, không biến lược claim thành giải được conflict |
| D3 | APPROVED: D3-A | Giữ năm IDs/order/start/geometry/controls; role editorial là waypoint, chỉ kể sâu khi có bằng chứng | Không enum mới, không xóa node/MP3, ẩn player, disable commands vì qa=[] hoặc cắt node khỏi recommendation; identity/access chưa xác nhận |
| D4 | APPROVED: D4-A/B | Giữ supporting places ngoài ngõ; hai Vọng Tiên tự chứa và giữ riêng; chỉ dẫn thực địa phải chờ khảo sát | Không GPS route/ETA/hướng rẽ/giờ/vé/cửa vào hoặc public access chưa xác minh; không gộp hai nodes/legend |
| D5 | APPROVED: D5-A | Bỏ ranking/hàng đợi/khen chê phục vụ khỏi narration; dùng chuyện tên/sinh kế có nguồn; vận hành phải có ngày và caveat | Không coi báo/danh bạ cũ là hoạt động hiện tại; không tự duyệt nhận xét dịch vụ trong phần đọc |
| D6 | APPROVED: D6-A | Chỉnh intro.text Gạch hiện có để tránh niên đại chưa đủ nguồn | Không thêm intro audio/alleyStory/guide vì đối xứng; không đổi cấu trúc/start/order |
| D7 | APPROVED: D7-A | Quy trình duyệt exact fields VI/EN rồi xét integration, delta/rollout; paid voice có quyền riêng | Không cấp NK-006/NK-009/NK-010, không nới resolver/reuse clip khác chữ; approval hướng không thay exact text |

Năm IDs D3: `ngo-gach-ca-phe-no1`, `ngo-gach-ta-ca-phe-4`, `ngo-gach-cafe-20`, `trung-yen-pho-ga-huong-tra`, `phat-loc-cac-nhanh-ngo`. Lượt này chỉ soạn waypoint No.1; D3 không mở drafting bốn node C còn lại.

## 2. Narrative Style Guide V1

**APPROVED_WITH_CONDITIONS** cho [Style Guide V1](NGO_KE_NARRATIVE_STYLE_GUIDE_V1.md):

1. P3 Chùa Cầu Đông cần cải thiện storytelling; hai options mới và option đề xuất phải được human xem lại.
2. P5 Cà Phê No.1 chỉ là waypoint, không full heritage story.
3. Exact VI/EN strings **chưa được phê duyệt**, gồm cả P1/P2/P4 đã được chọn làm candidate ưu tiên.
4. Không có quyền tích hợp runtime hoặc tạo audio.

Quyền trong lượt này: viết ba tài liệu record/review pack/report, biên tập tổng 12 node A+B và P5 riêng. Không sửa các tài liệu gốc để xóa trạng thái pending lịch sử.

## 3. Claims tiếp tục bị chặn hoặc có điều kiện

| Claims / nhóm | Disposition hiện hành |
| --- | --- |
| P03/P05/P06 | Không kể quê Nguyễn Trung Ngạn là làng di cư Thái Bình; không Nguyễn Siêu soạn 1886; không chọn chắc 46/48. CONFLICTING giữ nguyên |
| G07/G08 | Không vật thể bia “dựng 1430/cổ nhất”, không mở rộng quân số/địa danh thần tích chưa đọc đủ. Không tự nâng PARTIALLY_SUPPORTED |
| T06 | Thanh Cẩm/Ngự sử/tên đầy đủ chưa hồ sơ: không kể chắc |
| G12 | Nhận diện tượng qua nguồn viết, chưa hồ sơ giám định/gốc tích/niên đại chính xác; chi tiết dáng tượng nếu dùng phải quy nguồn |
| T08/T09/T12 | Migration/operation chưa đối chiếu; tên đùa không là tính cách; báo cũ không là current menu/hours |
| A03/A04/A05/A10/A11 | Alias/năm khởi dựng/số sắc, địa chỉ Vọng Tiên và access/giờ/vé vẫn chưa được human xác nhận là facts |
| A06/C07 | Legend/oral account giữ loại lời kể; không thành historical biography/sở hữu đã kiểm |
| C03/C04/C09–C12 | Mốc tổ chức khu ẩm thực, original dự án/hiện trạng, các thuộc tính kinh doanh chưa được giải bằng approval hướng |
| Batch C identity/access | Waypoint role đã chọn, nhưng identity/đường thông/quyền vào nhà/ảnh không tự verified |

Không thay đổi bất kỳ claim status trong ledger. Duyệt phương án bỏ một claim không phải kết luận claim đã sai toàn bộ hoặc đã được giải quyết bằng nguồn mới.

## 4. Exact fields và quyền còn chờ

**Tất cả exact strings vẫn DRAFT_NOT_APPROVED:** story VI/EN của 12 node; hai option P3 (PENDING_P3_EXACT_APPROVAL); waypoint P5 VI/EN; proposed name/summary/caption/intro/alleyStory/guide và glossary; mọi field KEEP muốn đưa vào gói content approval cũng phải được disposition cụ thể.

Gói duyệt hiện hành: [Narrative V2 Review Pack](NGO_KE_NARRATIVE_V2_REVIEW_PACK.md). Không kế thừa exact approval từ tên “approved tickets”, kết quả host tests, audio cũ, hoặc style approval. User có thể chọn từng field/locale, yêu cầu sửa hoặc để pending.

**Chưa cấp quyền:** NK-006 integration, NK-009 voice delta execution/repin, NK-010 audio generation, ElevenLabs hoặc mọi paid call; không đổi audio/catalogue/manifest/revision/textHash. Quy trình D7 được duyệt không tự mở các ticket này. Cũng chưa có human-listened approval cho candidate hoặc quyền chỉnh UI/player.

**Điểm dừng:** Human Exact Content Approval Gate. Dùng record này làm bổ sung trạng thái mới nhất khi đọc cùng các tài liệu pending cũ.
