# Voice V1 — Audio catalogue

## Current revision 8b318b validation — 15/10/2026

- Correct voice venv validation completed successfully: **34/34** entries; MP3 decode/format, source and text/audio hashes, duration, level, node and revision checks pass. Total duration 7.0 minutes, 5.04 MB. Manifest SHA-256 `34925f5d005fa7fb684c4f8fac19992865b581c6eeaa6bde0e9183431c9be05a`; source revision `8b318b4e9955e3b7affe72cb21ea08cf8123a616eeab2eb1420ab105c7b65e6b`.
- Highest measured synthetic ASR WER is `qa-flowers-answer` 23.1%, followed by `qa-cake-answer` 18.9% and `demo-01-caption` 17.6%. These scores flag passages for human review; they are not a pronunciation/naturalness assessment.
- Human listening of the full catalogue remains pending, so GV1 is only integrity/format/coverage-pass, not subjective audio-quality-pass.

## Earlier catalogue validation — revision 5a82b1 (superseded) — 15/10/2026

- The alias change updated only source metadata; no narration text or MP3 changed. Validator passes 34/34 entries for source/text/audio hashes, node/revision, MP3 decode/format/duration and level. Manifest file SHA-256: `e59696011be1501097b08f11091a903f8b9a88d30d2914fcc255d1c28db774ba`; dataset source SHA-256: `5a82b1d4fa223b2170fd9fa2c761a01479b4e3e159a81a6de72f65566a8d2568`.
- Human listening of all 34 clips remains pending; synthetic ASR WER cannot certify pronunciation or naturalness.

**Ngày:** 15/10/2026
**Trạng thái:** catalogue tự động đạt; nghe/QC chủ quan còn chờ người nghe thật.
**Gate GV1:** đạt phần integrity/format/độ phủ; chưa tuyên bố đã đạt chất lượng phát âm.

## Earlier catalogue validation before alias update — 15/10/2026

- Ran `tools/voice/.venv/Scripts/python.exe tools/voice/validate_catalogue_v1.py`: all 34 clips checked, 7.0 minutes / 5.04 MB; current manifest SHA-256 remains `90747665D049CC3B4AF018672EF0935805F324236986D8F2047DC79B440113E9`. Integrity, text/node/revision, MP3 format, duration and level checks reported no failures.
- Highest synthetic-ASR WER remains `qa-flowers-answer` 23.1%, `qa-cake-answer` 18.9%, `demo-01-caption` 17.6%, and `demo-04-caption`/`demo-05-caption` 14.3%. These are prioritization signals, not human pronunciation scores.
- All 34 listening checklist entries remain unchecked. Naturalness, names, pacing, pauses and phone-speaker/headphone loudness still require human listening; no audio was changed from ASR alone.

## Revalidation ASR của 34 clip — 14/10/2026

- Chạy lại `tools/voice/.venv/Scripts/python.exe tools/voice/validate_catalogue_v1.py` trên toàn bộ manifest hiện tại, exit code 0. Các hash/text/node/revision/codec/duration tiếp tục đạt; phần kiểm file không xác nhận độ tự nhiên.
- ASR gắn cờ cao nhất: `qa-flowers-answer` 23.1%, `qa-cake-answer` 18.9%, `demo-01-caption` 17.6%, `demo-04-caption` và `demo-05-caption` 14.3%. Transcript có thể phản ánh lỗi model hoặc phát âm, nên chỉ dùng để ưu tiên nghe, không tự tạo lại clip.
- Transcript cần người nghe đối chiếu gồm `bà Nhi`→“ba nhì”, `cái đĩa`→“cái điện”, `giàn`→“dàn”, `giữ`→“dữ”, `chiếc`→“chiều”. Checklist vẫn chưa có mục nào được đánh dấu nghe; các clip đã được ưu tiên trong [`voice_v1_listening_checklist.md`](voice_v1_listening_checklist.md).

## Đã làm

- Sinh đủ 34 clip canonical từ `data/demo.json`: 1 intro, 6 story, 6 caption và 21 answer; mỗi clip có ID ổn định, node khi phù hợp, text hash, revision/voice và duration đo trong manifest.
- Đóng gói MP3 48 kHz mono, 96 kbps; tổng 418.23 giây (6 phút 58.23 giây), 5,043,834 byte.
- Asset map dùng static `require` để Metro kiểm tra trước; file lỗi chỉ được thay sau khi clip mới qua kiểm tra.
- Kiểm toàn bộ text/hash/node/revision/path, decode MP3, codec, sample rate, số kênh và duration: 34/34 đạt.
- Đo mean level trong khoảng −21.0 đến −18.6 dBFS; peak −7.9 đến −3.4 dBFS, không có peak digital clipping.

## QC tự động và giới hạn

ASR tự động phát hiện một số sai khác đáng nghe lại: `qa-flowers-answer` WER 23.1%, `qa-cake-answer` 18.9%, `demo-01-caption` 17.6%, `demo-05-caption` 14.3% và `demo-04-caption` 14.3%. Đây là phép kiểm nội dung bằng model trên audio sạch, không phải đánh giá phát âm hay độ tự nhiên. Chưa có người nghe rà tiếng xì, ngắt câu, tên riêng, nhịp kể hoặc mức âm lượng trên tai nghe/loa điện thoại.

Re-run ngày 13/10/2026 bằng `tools/voice/.venv/Scripts/python.exe tools/voice/validate_catalogue_v1.py`: 34/34 clip decode/hash/text/node/revision/format/duration hợp lệ; 418.23 giây, 5,043,834 byte. Manifest SHA-256 `90747665D049CC3B4AF018672EF0935805F324236986D8F2047DC79B440113E9` trùng manifest hiện tại; WER cao nhất giữ nguyên như trên. Đây vẫn không thay QC nghe.

Revalidation ngày 14/10/2026 bằng cùng validator: **34/34** clip hợp lệ; 418.23 giây, 5,043,834 byte. Mean level −21.0 đến −18.6 dBFS, peak −7.9 đến −3.4 dBFS. WER cao nhất: `qa-flowers-answer` 23.1%, `qa-cake-answer` 18.9%, `demo-01-caption` 17.6%. Các transcript sai khác được giữ làm tín hiệu cần nghe lại, không tự sửa text hoặc gọi là lỗi phát âm. Bản report máy sinh nằm trong cache bị ignore.

## Bằng chứng

- Generator/QC: `tools/voice/generate_catalogue_v1.py`, `tools/voice/validate_catalogue_v1.py`.
- Manifest và mapping native: `mobile/assets/voice/manifest.json`, `mobile/src/voice/catalog.ts`.
- APK release hiện tại đóng đủ 34 tài nguyên MP3; SHA-256 của tập file bên trong trùng toàn bộ 34 file nguồn. Đây là bằng chứng packaging, không thay nghe QC.
- Fresh iOS/Android JS exports (`dist/ios`, `dist/android`) each list 34 MP3; SHA-256 sets match all source files exactly, and both bundles embed the current LAN gateway URL. They are not IPA/APK builds and do not prove playback on iPhone.
- Checklist nghe từng clip, có đường dẫn MP3 và tiêu chí ghi lỗi: [voice_v1_listening_checklist.md](voice_v1_listening_checklist.md). Tất cả đang để trống đến khi có người nghe thật.
- Test: `mobile/tests/voiceCatalogue.test.mjs` kiểm đúng 34 mục, ID, text hash, audio hash và static asset map; full suite mới nhất 167/167 pass.
- Raw report/model cache nằm trong `tools/voice/.cache/` và bị ignore; audio sản phẩm/license đi cùng `mobile/assets/voice/`.

**Còn lại:** nghe tay toàn bộ 34 clip và đánh dấu/re-tạo chính xác clip nghe lỗi; nếu giọng đọc tên riêng hoặc độ tự nhiên không đạt thì cần chọn lại preset và tái tạo catalogue. Không dùng transcript ASR để gọi nội dung là QC âm học hoàn tất.

## Revalidation after Q&A alias revision — 15/10/2026

- QA aliases changed the source dataset hash to `5a191de3080dd27f420210b60017abd29bc9eda6ea3168aa8b305f78cdc79971`; `mobile/assets/voice/manifest.json` now records that `sourceDataSha256`. The 34 story/caption/answer texts and audio files did not change.
- Re-ran `tools/voice/.venv/Scripts/python.exe tools/voice/validate_catalogue_v1.py`: **34/34** clips still pass source, text, node, hash, MP3 format, duration and level checks. New manifest SHA-256: `E62F27FC7432BAAA71601C12650186674358606FECCCE63DEC8A834C7AA77232`.
- Rebuilt APK contains 34/34 source-matching MP3 hashes. Human listening QC remains pending; ASR WER is not a listening-quality pass.

## Previous large-v3 alias snapshot — superseded by later aliases — 15/10/2026

- The two large-v3 transcript aliases advanced the dataset/catalogue revision to `1e49f3f7c5443091fcccf1b0ed39d3944f5bd79c5869f48640595b6958df25bf`; manifest file SHA-256 is `383BBD7C33DC8034C43AF46CE94D3514E27A04DC7FE36F7ABD123B2842553A3B`. No canonical story/caption/answer text or MP3 was changed by those aliases.
- Re-ran the catalogue validator against this revision: 34/34 clips, 7.0 minutes / 5.04 MB, no source/text/hash/MP3/duration/level failures. Highest synthetic ASR WER remains `qa-flowers-answer` 23.1%, followed by `qa-cake-answer` 18.9%; these are review priorities, not audio-quality verdicts.
- The current API 37 APK is `B171E9C88288097F15F0DCBB15036F7D808373ACCCA6D22D9030833AADFB85B2`; all 34 embedded audio hashes match their source assets. The existing listening checklist still has all 34 clips unmarked. Human listening remains the only open V1 gate; synthetic ASR and file validation cannot close it.

## Earlier final catalogue revision — 5a82b1 (superseded) — 15/10/2026

- Final dataset/catalogue revision and manifest `sourceDataSha256`: `5a82b1d4fa223b2170fd9fa2c761a01479b4e3e159a81a6de72f65566a8d2568`; manifest SHA-256: `e59696011be1501097b08f11091a903f8b9a88d30d2914fcc255d1c28db774ba`. It contains the exact small- and large-v3 transcript aliases; the 34 canonical narration strings and MP3 bytes are unchanged.
- Validator remains 34/34 for text/source/audio hashes, node/revision, decode, format, duration and level. This is integrity evidence only; all 34 listening checklist rows remain unmarked. GV1 stays open until a person listens and signs off.
