# Inventory nội dung và audio Việt/Anh

Ngày lập16/10/2026. Đây là checklist phạm vi, **không phải kết quả tạo hoặc nghe QC audio**. Chuỗi UI/notice không thành một track nội dung; voice không được tự đọc text bằng giọng thiết bị để che thiếu asset.

| Collection / locale | Nguồn text | Intro | Story | Caption | Answer | Tổng track | Trạng thái lúc lập |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| fiction-letter / vi | `data/demo.json` | 1 | 6 | 6 | 21 | 34 | Có asset cũ; giữ nguyên34file/manifest/catalog và text/revision. |
| fiction-letter / en | `data/localized/fiction.en.json` | 1 | 6 | 6 | 21 | 34 | Text đã biên tập, W4 review đang chạy; chưa nhận đã tạo audio. |
| old-quarter-pilot / vi | `POST8_PILOT_COPY.md` → JSON sau review | 1 | 3 | 3 | 9 | 16 | Draft, chờ W4 review toàn văn. |
| old-quarter-pilot / en | `POST8_PILOT_COPY.md` → JSON sau review | 1 | 3 | 3 | 9 | 16 | Draft, chờ W4 review toàn văn. |
| **Tổng** | | **4** | **18** | **18** | **60** | **100** | **66 track mới**,34VI giữ nguyên. |

## Identity để kiểm coverage

- Fiction: `demo-01`…`demo-06`; QA theo đúng thứ tự bản Việt: `qa-01`…`qa-06`, `qa-clock`, `qa-gear`, `qa-lam`, `qa-xoi`, `qa-ribbon`, `qa-huong`, `qa-flowers`, `qa-knot`, `qa-che`, `qa-box`, `qa-envelope`, `qa-cake`, `qa-letter`, `qa-light`, `qa-home`. Mỗi ngôn ngữ cùng graph/order/nodeId/tags/followUps; aliases chỉ thuộc locale/node, không thêm transcript nghe sai tiếng Việt vào tiếng Anh.
- Pilot: `oldquarter-bach-ma` có `bm-horse`, `bm-guardian`, `bm-observe`; `oldquarter-ma-may` có `mm-tube`, `mm-courtyard`, `mm-restore`; `oldquarter-dong-xuan` có `dx-trade`, `dx-food`, `dx-current`. Không Ô Quan Chưởng hay điểm thứ4. Không bịa thêm Q&A để tăng số lượng.
- Track identity đủ bộ `(collectionId, locale, contentId)`, kèm textHash chính xác; ví dụ story/answer có thể dùng cùng ID logic giữa locale nhưng không trùng identity. Manifest ghi rõ convention nội dung và path, không dựa chỉ tên node.
- Evidence/disclaimer/source UI không đọc thành story track; question/alias là input exact matcher, không tính là answer track. Nếu thực tế thêm nội dung đọc được qua một UI mới, phải bổ sung inventory trước khi gọi đủ coverage.

## Kiểm tự động và chứng cứ cần có

1. Parse tất cả locale/collection, kiểm identity và graph, giới hạn kí tự/body/aliases; V1 fixture đúng6/21 nguyênbytes. W1 đã chạy assert tạm cho fictionEN:6/21,34texttrack,maxstory624/maxcaption81,18336byte, không alias collision trong node; shared parser V2/test bền doW2 bổ sung.
2. Mỗi trackreachable có đúng asset khớp textHash+locale, SHA file đúng, duration đo, decode được, có model/preset/revision/license/repro. File dư hoặc text đổi chưa sinh lại không được coi là khớp. Không EN→VI/device fallback.
3. Một điểm thật Bạch Mã hoàn chỉnh VI/EN qua review nội dung, player, STT synthetic và native trước bulk66track. Probe2preset chỉ là bước chọn giọng, không bằng nghiệm thu cả catalogue.
4. Hỏi và hỏi tiếp VI/EN ít nhất một cặp ở **mọi9node**; kiểm lookup tất cả30QA mỗi locale. Fixture6 +pilot3 là9node logic, không tính mỗi locale là một điểm khác. Synthetic audio/gateway/micAVD/điện thoại/nghe người thật ghi thành các lớp chứng cứ riêng.
5. Cold start/persist/manual locale, switch khi recording/transcribing/playing, missingaudio/lỗidecode, timeout/quota/cancel/doubleSend/back/node/mode/revision/offline; bảo toàn playback khi chỉ toggletext. Toàn bộ UI/a11y/notice/permission build và font lớn không bỏ sót.

## Đường dữ liệu và ranh giới

Demo chọn hai collection đã bundle; không còn5thẻ khác tên nhưng cùng một dataset. Live V2 đọc một pair đã review do CLI công bố, không âm thầm lấy bản bundle nếu API thiếu/lỗi/locale không hợp lệ. Nguồn fiction luôn là hư cấu; pilot là nội dung có evidence và các phần chưa xác minh rõ ràng. API giữ `kind` mô tả nguồn, khác `mode` app; không dùng chế độ demo để giả phê duyệt mọi nội dung.

W1 sở hữu text/evidence/glossary; W2 shared data+UI+i18n, W3 asset/generator/voice+backend, W4 facts/translation/test tích hợp. Text đổi sau khi sinh audio cần hash mới và QC phần bị ảnh hưởng, không sửa expected test để giữ pass.
