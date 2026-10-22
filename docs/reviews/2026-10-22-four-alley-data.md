# Bốn ngõ — dữ liệu và slot voice

Ngày 22/10/2026. Codex/W1 thực hiện theo các quyết định D1–D6 đã chốt, ghi ở đầu plan. Baseline Landing/cleanup được chốt cục bộ ở `a93a002`, sau cherry-pick Nhật Phong `cf2168c`; không push.

## Nội dung

- Nguồn được tải trực tiếp từ bản export Google Doc và lưu tại `docs/content/FOUR_ALLEYS_SOURCE_20261022.md`. Bản chụp giữ chữ gốc, APA và dấu bình luận; chỉ chuẩn hóa LF/BOM/khoảng trắng cuối dòng. Trạng thái bình luận chưa được kiểm lại qua API.
- Phần 1 thành `alleyStory`; phần 2 thành `intro.text`; phần 3 và 4 thành `guide`. Dấu `[a]`, `[b]`, `[c]` là marker bình luận, không được đọc/hiển thị. Dòng “Nguồn biên soạn” và APA là evidence metadata, không phải nội dung spoken intro. Lời rào đón thật trong chính văn vẫn giữ nguyên.
- Bốn file VI: Trung Yên, Tạm Thương, Cấm Chỉ, Phất Lộc. Số mục ăn lần lượt 4/4/4/3, hành trình 4/5/5/5 bước. Giờ có dữ liệu giữ nguyên giá trị và mang tiền tố “Giờ tham khảo”; giờ chưa xác minh là null cùng lời giải thích gốc trong note. Giữ ý kiến người viết, giá năm 2020 không phải giá hiện hành, địa chỉ 46 hoặc 48 và giới hạn không vào nhà dân.
- Trung Yên có 5 điểm: Phở Sướng, Đình Trung Yên, Bún cá Sâm Cây Si, Bún ngan Nhàn, Phở gà Hương Trà. Bỏ Phở Vui/Miến trộn mực. Giữ geometry/tọa độ của các điểm còn lại; điểm mới không có tọa độ. Polyline OSM vẫn dài 146 m, khác mô tả khoảng 200 m trong tài liệu; chưa có khảo sát mới để thống nhất hai con số.
- Tạm Thương/Cấm Chỉ/Phất Lộc có 2/3/2 điểm từ các mục ghé thăm, không polyline, không tọa độ hoặc story giả. Thời lượng mỗi điểm là tham số demo 10 phút, không phải thông tin từ nguồn hoặc thời gian thực địa, đã ghi trong disclaimer. Không sinh Q&A, không gắn reviewed/approved.
- D3: ba ngõ mới không có EN; FE phải ẩn ở EN và không fallback VI. Trung Yên EN chỉ giữ cấu trúc cùng IDs, đồng bộ tối thiểu hai điểm mới và intro trung tính; không tạo alleyStory/guide EN.

## Schema và backend

`alleyGuide.ts` cung cấp typed readers trả null khi thiếu/sai dạng; `sourceState.ts` kiểm hai trường tùy chọn ở V2 mà không sửa dữ liệu/revision legacy. Kiểm thử bảo vệ nội dung canonical của fiction và các dataset cũ.

Backend CLI migrate/import-localized đã chấp nhận cặp Trung Yên có các trường mới trên SQLite tạm trong TEMP. Kiểm đọc bản backup xác nhận story/guide còn nguyên sau vòng ghi/đọc. Sau đó import cặp Ngõ Gạch cũ với replace trên chính DB tạm cũng thành công. Không sửa backend, schema DB hay DB chính. Ba ngõ VI-only chưa thể import bằng CLI pair VI/EN hiện có; scope tích hợp của chúng là bundle demo.

## Voice chỉ chừa chỗ

Bốn reservation intro VI giữ textHash/revision của chính `intro.text`, giọng Nhật Phong `6adFm46eyy74snVn6YrT`, model `eleven_v3`. Catalogue có `tracks: {}`, không asset source hoặc audio giả. Tổng phần Việt: 2.432 ký tự, đếm offline. Không đọc key, không gọi API, không tạo MP3 hoặc script generation. Hướng dẫn sinh sau ở `docs/VOICE_GUIDE_FOUR_ALLEYS_20261022.md` đã ghi rõ quyết định mới đè lên đề xuất 8 track cũ.

Lookup voice chỉ nhận own entry của catalogue, tránh coi các thuộc tính kế thừa như `__proto__`/`toString` là audio khi catalogue rỗng. Test kiểm cả slot thiếu, revision khác và ID sai.

## Kiểm tra tại checkpoint dữ liệu

- 9/9 test mới về schema, đối chiếu nguyên văn source, uncertainty, D1/D3 và voice slot đạt.
- TypeScript/lint đạt tại checkpoint tích hợp; toàn suite 349 có 346 pass và 3 fail ở kỳ vọng revision/ID Trung Yên cũ, đã giao Antigravity xử lý cùng registry và FE, chưa coi là nghiệm thu cuối.
- Không commit file voice mới hoặc audio mới, không push. Nghiệm thu cuối và giới hạn thiết bị nằm trong báo cáo tích hợp sau khi FE bàn giao.
