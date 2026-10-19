# ElevenLabs — Thắm / Talia

## Quyết định thực thi mới nhất — API preflight 19/10/2026

Người dùng đã điền key và nhắn “xong”. Key local hợp lệ, GET subscription trả Starter, character_count=0, character_limit=40000, can_extend_character_limit=false. Giới hạn đợt này vẫn 30000. Hai giọng đã thêm vào My Voices bằng API, giữ đúng ID ở bảng dưới; GET từng voice trả200, professional, rate=1. Không ghi key vào log/Git/mobile.

Đóng băng model `eleven_v4`, settings `{stability:0.5, similarity_boost:0.75}`, output `mp3_44100_128`, HTTP TTS (không WebSocket). GET models xác nhận vi/en, token_cost_factor=1, character_cost_multiplier=1, cost_discount_multiplier=1. Dùng nguyên text nguồn, không SSML/tag/phiên âm. Dự toán 24768 credit cho56track. Các đoạn lịch sử bên dưới nói chưa có key/model đã được thay thế bởi quyết định này.

W3 triển khai renderer stdlib tối thiểu `tools/voice/elevenlabs_three_lenses.py` cùng test, dry-run và audit. Trước paid call đầu tiên gửi coordinator câu hỏi kèm diff/test/dự toán để kiểm tra nội bộ; không hỏi lại người dùng. Sau coordinator cho chạy, tạo trước đúng2caption thực (mỗi locale1) rồi kiểm account delta/character-cost header; tái dùng chính2file này, không tạo sample ngoài inventory. Nếu đúng rate và ngân sách thì chạy54file còn lại tuần tự. Trước mỗi call reserve vào ledger, kiểm balance, tính cả mọi lần thử/thất bại chưa rõ; không retry tự động paid call khi timeout/kết quả chưa rõ. Nếu không chứng minh được chi phí hoặc vượt trần thì dừng báo coordinator. Resume chỉ khi source/config/hash/decode khớp.

Output mới `mobile/assets/voice/three-lenses-elevenlabs/{vi,en}/` và manifest riêng. Giữ nguyên bytes toàn bộ156MP3 hiện có (100legacy+56VieNeu/Kokoro), cue, data nguồn; không xóa/ghi đè audio. Chỉ chuyển static requires trong `mobile/src/voice/threeLensesCatalog.ts` sang bộ mới khi56/56audit đạt; giữ contract lookup/revision/node, cập nhật test voice sở hữu. Renderer/manifest ghi voice/model/settings/source+spoken hash/request ID nếu có/asset hash/duration/format/chi phí quan sát, humanApproved=false, source-only. Không thay UI/backend/matcher/ASR/DB. Báo cáo `tools/voice/THREE_LENSES_ELEVENLABS_REPORT.md`, bổ sung provenance LICENSES hiện có. W3 chỉ commit phần sở hữu sau audit; W1 review/cherry-pick hẹp vào candidate.

Ngày19/10/2026. Người dùng đã xác nhận hai voice ID; không hỏi lại chọn giọng.

| Locale | Voice | ID |
| --- | --- | --- |
| vi | Thắm — Giọng Nữ Miền Bắc | `0ggMuQ1r9f9jqBu50nJn` |
| en | Talia | `OZ0L6eISlOejga3XjDFt` |

## Phạm vi

Chỉ tạo lại56track của `old-quarter-three-lenses`: mỗi locale mở đầu1, chương5, caption3, chuyển đoạn2, kết1, câu trả lời16. Không đổi nội dung, Q&A/matcher, schema DB, backend, UI, hai collection cũ hoặc100MP3/cue được bảo vệ. Giữ bản audio hiện hành dùng được đến khi bộ thay thế vượt kiểm kỹ thuật. Không publish/merge/push/store.

Nguồn là `data/localized/three-lenses.{vi,en}.json` và `data/journeys/three-lenses.{vi,en}.json` đã đóng băng. Dùng nguyên văn text nguồn, không áp cách viết phiên âm dành riêng cho Kokoro sang ElevenLabs. ID nội dung/locale/node và revision giữ đúng hợp đồng hiện có; intro không có node trong catalogue, nhưng request UI vẫn gắn phạm vi điểm vật lý hiện tại.

## Kết nối và ngân sách

- Có phiên ElevenLabs đăng nhập sẵn trong Brave. W1 đọc UI Balance: Total40.000credits, Remaining40.000, góiStarter. Đây là quan sát19/10, phải đọc lại ngay trước chạy.
- Hạn mức chi cho đợt này vẫn **tối đa30.000credit**, theo ngân sách người dùng nêu; không tự nâng theo số dư40.000, không mua thêm/overage.
- Raw source: VI12.511ký tự, EN12.257; tổng24.768. Đây là ước tính base1credit/ký tự; phải kiểm voice multiplier/model cost thực tế trước batch. Không mặc định giảm nửa giá cho website.
- Dùng browser UI hiện tại không cần API key. API thuận tiện cho batch56file và audit/resume; phiên này chưa có API key hoặc connector ElevenLabs. Tra plugin catalogue không thấy plugin ElevenLabs; không tự cài connector hoặc tạo key/account settings.
- Nếu dùng API, lấy key từ biến môi trường local `ELEVENLABS_API_KEY` do người dùng cấu hình. Không in key, ghi vào Git, dán vào chat hoặc trích cookie/token của browser. Kiểm balance/voice access/model/credit multiplier bằng read-only trước generation. Chưa có key thì không dựng response giả.
- Ưu tiên model biểu cảm hỗ trợ Việt/Anh; xác minh model khả dụng trong chính tài khoản và chi phí trước khi render. Chưa đóng băng model hay thông số khi chưa kiểm preflight.

## Bàn giao cho worker voice khi có đường thực thi

W1 sở hữu spec/nội dung/review; W3 Codex gpt-6-luna/xhigh sở hữu renderer, staging audio, catalogue/manifest và test voice cần thiết. Chuẩn bị dry-run inventory từ dữ liệu hiện hành trước paid call. Không ghi đè WIP hoặc audio cũ; output mới phải có source text hash, spoken text hash, voice/model/settings, request ID nếu có, asset hash, duration/format và chi phí quan sát được.

Resume chỉ những track đã giải mã/hash đạt; không retry paid call một cách mù khi timeout không rõ đã bị trừ credit. Tổng chi gồm thử/tạo lại không vượt hạn mức. Kiểm đầy đủ MP3, mapping56track, revision/text/node/locale, catalogue lookup, source hashes và byte-preservation trước đổi catalogue. Human listening vẫn phải ghi pending nếu chưa có người nghe; không gắn human/shipping approval từ việc API trả200.

## Trạng thái

Đã chốt giọng, kiểm tài khoản web và ngân sách. **Chưa tạo audio ElevenLabs, chưa trừ credit, chưa thay catalogue.** Cần chọn đường thực thi web hiện có hoặc cấu hình API key cho batch; đây là kết nối tài khoản còn thiếu cho phương án tự động, không phải cửa xin duyệt lại giọng.
