# Fixture kỹ thuật Phase 1

## Nội dung hiện hành — 13/10/2026

Người dùng yêu cầu thay lời kể kỹ thuật bằng truyện giả hấp dẫn để thu voice. `demo.json` hiện chứa **truyện hư cấu “Bức thư cuối ngõ”**, 6 chương/điểm và 21 Q&A, có nhân vật và tình tiết liên kết. Nhãn/evidence/disclaimer ghi hư cấu trên UI; `intro.text`, `story`, `caption`, `answer` là lời đọc tự nhiên, không đọc thông báo “đây là dữ liệu demo”. Xem [kịch bản thu giọng](../docs/VOICE_FICTION_SCRIPT.md).

Giữ `kind: simulated`, schema 1, ID `demo-01`–`demo-06`, tọa độ, trạng thái và phút ghé điểm; không biến câu chuyện thành lịch sử/địa điểm thật. Tên điểm hiện là Cổng ngõ, Hiên đồng hồ, Bếp đầu hè, Sân hoa giấy, Bậc thềm nắng, Đèn cuối ngõ. Phút ghé điểm không phải thời lượng audio.

`demo.json` là **bản dữ liệu ban đầu của dự án mới**, được người dùng đồng ý tạo để review Home. Một nguồn duy nhất; `mobile/App.tsx` static import và Metro theo dõi `../data`.

## Schema phiên bản 1

- `schemaVersion`: số1.
- `kind`: `"simulated"`.
- `disclaimer`: chuỗi không trống, ghi rõ các điểm không phải địa điểm thật.
- `nodes`: đúng6 record, ID duy nhất, ID/tên không trống. Mỗi node có `summary`, `tags` (chủ đề: `an thuc`, `chuyen xua`, `kham pha tu do`), `visitMinutes` (ước tính xem tại điểm), `available`, `visited`, `story` (lời kể), `caption` (≤220 ký tự), `latitude`/`longitude` (**mô phỏng**, thay bằng tọa độ khảo sát thật khi nhóm data gửi).
- `intro`: `{ text, evidence }` — evidence ít nhất1 mục.
- `startNodeId`: phải có trong `nodes`.
- `qa`: ít nhất1 câu `{ id, question, answer, nodeId, aliases, evidence, followUps, tags }`; evidence bắt buộc, alias 1–5, followUps 0–2 và phải là id có thật. Hai câu không được chiếm cùng một câu hỏi sau khi bỏ dấu; followUp không trùng và không tự trỏ về chính nó.

Chi tiết Phase 2 và các ca kiểm tra: [bàn giao Phase 2](../agent_docs/phase_2_review.md).

ID hiện tại `demo-01`–`demo-06`; tên kỹ thuật “Điểm demo 01”–“Điểm demo 06” đã được thay bằng tên chương theo yêu cầu ngày 13/10/2026. Không tự thêm lịch sử/nguồn thật hoặc thay tọa độ/ETA. Các record này không dùng cho thực địa.

Adapter `mobile/src/data/sourceState.ts` kiểm tra shape bằng type guard, không thư viện validation. Live không nhận fixture này kể cả khi App đã import; node rows chỉ render khi demo-ready. Test dùng file thật, kiểm tra toàn bộ6 tên và field set.

Xóa file tĩnh làm Metro không bundle được; sai nội dung/schema khi file vẫn được bundle làm Home báo lỗi dữ liệu demo. Không nạp API hoặc dữ liệu khác để che lỗi.

Sau khi bundle đã nạp, emulator đã thử tắt Wi-Fi/data và vẫn đọc/chuyển mode/cuộn đủ6 điểm; offline cold start chưa kiểm tra. [Bằng chứng](../agent_docs/phase_1_completion.md).
