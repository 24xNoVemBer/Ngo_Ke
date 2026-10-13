# Voice V1 — Audio catalogue

**Ngày:** 13/10/2026
**Trạng thái:** catalogue tự động đạt; nghe/QC chủ quan còn chờ người nghe thật.
**Gate GV1:** đạt phần integrity/format/độ phủ; chưa tuyên bố đã đạt chất lượng phát âm.

## Đã làm

- Sinh đủ 34 clip canonical từ `data/demo.json`: 1 intro, 6 story, 6 caption và 21 answer; mỗi clip có ID ổn định, node khi phù hợp, text hash, revision/voice và duration đo trong manifest.
- Đóng gói MP3 48 kHz mono, 96 kbps; tổng 418.23 giây (6 phút 58.23 giây), 5,043,834 byte.
- Asset map dùng static `require` để Metro kiểm tra trước; file lỗi chỉ được thay sau khi clip mới qua kiểm tra.
- Kiểm toàn bộ text/hash/node/revision/path, decode MP3, codec, sample rate, số kênh và duration: 34/34 đạt.
- Đo mean level trong khoảng −21.0 đến −18.6 dBFS; peak −7.9 đến −3.4 dBFS, không có peak digital clipping.

## QC tự động và giới hạn

ASR tự động phát hiện một số sai khác đáng nghe lại: `qa-flowers-answer` WER 23.1%, `qa-cake-answer` 18.9%, `demo-01-caption` 17.6%, `demo-05-caption` 14.3% và `demo-04-caption` 14.3%. Đây là phép kiểm nội dung bằng model trên audio sạch, không phải đánh giá phát âm hay độ tự nhiên. Chưa có người nghe rà tiếng xì, ngắt câu, tên riêng, nhịp kể hoặc mức âm lượng trên tai nghe/loa điện thoại.

Re-run ngày 13/10/2026 bằng `tools/voice/.venv/Scripts/python.exe tools/voice/validate_catalogue_v1.py`: 34/34 clip decode/hash/text/node/revision/format/duration hợp lệ; 418.23 giây, 5,043,834 byte. Manifest SHA-256 `90747665D049CC3B4AF018672EF0935805F324236986D8F2047DC79B440113E9` trùng manifest hiện tại; WER cao nhất giữ nguyên như trên. Đây vẫn không thay QC nghe.

## Bằng chứng

- Generator/QC: `tools/voice/generate_catalogue_v1.py`, `tools/voice/validate_catalogue_v1.py`.
- Manifest và mapping native: `mobile/assets/voice/manifest.json`, `mobile/src/voice/catalog.ts`.
- Checklist nghe từng clip, có đường dẫn MP3 và tiêu chí ghi lỗi: [voice_v1_listening_checklist.md](voice_v1_listening_checklist.md). Tất cả đang để trống đến khi có người nghe thật.
- Test: `mobile/tests/voiceCatalogue.test.mjs` kiểm đúng 34 mục, ID, text hash, audio hash và static asset map; nằm trong kết quả mới nhất 131/131 test.
- Raw report/model cache nằm trong `tools/voice/.cache/` và bị ignore; audio sản phẩm/license đi cùng `mobile/assets/voice/`.

**Còn lại:** nghe tay toàn bộ 34 clip và đánh dấu/re-tạo chính xác clip nghe lỗi; nếu giọng đọc tên riêng hoặc độ tự nhiên không đạt thì cần chọn lại preset và tái tạo catalogue. Không dùng transcript ASR để gọi nội dung là QC âm học hoàn tất.
