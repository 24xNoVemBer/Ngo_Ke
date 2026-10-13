# Handoff Voice — Ngõ Kể

> **Cập nhật sau sửa recorder (13/10/2026):** dùng APK/hash, gateway `<DEV_LAN_IP>:8788`, Expo Go `exp://<DEV_LAN_IP>:8087` và giới hạn kiểm thử tại [handoff hiện hành](VOICE_HANDOFF.md). Snapshot cũ ở dưới đã lỗi thời. Authorization V0–V7 vẫn hiệu lực; GV0–GV7 là quality gates nội bộ.

> **Trạng thái mới nhất 13/10/2026:** authorization V0–V7 vẫn có hiệu lực; GV0–GV7 là kiểm tra nội bộ. APK Android (121,233,212 byte; SHA-256 `159EE52016DCC4F5B5B5C9DC697AB4FD20B0294D99B13A64CC74B5DED38F6D98`) đã cài/chạy trên API 37 AVD. Đã sửa codec recorder; upload app→gateway qua được media probe, nhưng AVD không có lời nói nên STT trả `NO_SPEECH`, chưa sinh answer. Gateway local smoke STT tổng hợp pass. Metro/Gateway hiện phục vụ LAN riêng; xem [báo cáo kiểm thử](VOICE_TEST_REPORT.md) và [handoff dùng thử](VOICE_HANDOFF.md). Điện thoại thật/iOS mic-to-answer E2E, nghe tay 34 clip, accessibility/performance vẫn pending. Các ghi chú cũ dưới đây là snapshot lịch sử.

**Cập nhật 13/10/2026:** người dùng đã yêu cầu thiết kế voice/tương tác thật; chọn **nhấn để nói → nghe trả lời → hỏi tiếp**, **nữ miền Bắc ấm tự nhiên**, **STT trực tuyến**; đề xuất **VieNeu** để tránh/giảm phí. Đã có [spec UX](VOICE_INTERACTION_UX_SPEC.md), [storyboard](VOICE_UX_STORYBOARD.png) và [review VieNeu](VOICE_VIENEU_REVIEW.md).

**Nội dung mới:** theo yêu cầu thay copy demo bằng câu chuyện giả hấp dẫn, fixture hiện là **Bức thư cuối ngõ**, 6 chương/21 Q&A. [Kịch bản thu giọng](VOICE_FICTION_SCRIPT.md) lấy từ cùng nguồn `data/demo.json`; text đọc không chứa thông báo demo, còn UI/nguồn/disclaimer ghi hư cấu. Đã có nội dung trong app, chưa có file âm thanh/connector.

**Roadmap triển khai hiện hành:** [VOICE_PHASE_ROADMAP.md](VOICE_PHASE_ROADMAP.md) **V0–V7**. Authorization mới cho phép đi xuyên các gate; status thực tế và mốc V2/V5/V7 ở [báo cáo kiểm thử](VOICE_TEST_REPORT.md). Bộ audio core 34 mục đã tạo từ nguồn text hiện có; thiết bị thật còn pending.

**Trạng thái tại thời điểm ghi snapshot cũ:** thiết kế chưa có code/connector/audio. Trạng thái hiện tại xem phần mở đầu và tài liệu handoff mới; VieNeu v3 Turbo được dùng local, còn Studio/API trả phí không dùng.

## Quyết định sản phẩm đã có sẵn

- Voice là **phase riêng sau core demo**, không gộp vào bất kỳ phase nào đã duyệt.
- Quy tắc “chỉ bắt đầu sau khi duyệt riêng” đã được supersede bởi authorization 13/10/2026 cho V0–V7; các quyết định sản phẩm còn hiệu lực được giữ trong prompt triển khai và roadmap mới.
- Voice **không được** chặn việc review hoặc nghiệm thu core demo.
- Luôn giữ nhập và đọc bằng **chữ** làm fallback.

## Ràng buộc nội dung

1. TTS chỉ **đọc nguyên văn** câu trả lời đã có trong bộ Q&A được duyệt.
2. STT đưa lời nói về **cùng bộ câu hỏi/alias** đang dùng, không tạo câu hỏi mới.
3. **Không** gọi LLM, không sinh hội thoại tự do, không tự sửa câu trả lời.
4. Câu trả lời không có `evidence` vẫn không được đọc thành lời kể có vẻ có căn cứ.

## Phạm vi tối thiểu khi bắt đầu

| Việc | Ghi chú |
| --- | --- |
| Chọn connector và giọng | Người dùng quyết; có thể là dịch vụ TTS/STT hoặc giọng ghi sẵn |
| Đọc lời kể `story` trên camera | Dùng nội dung đã có ở Phase 4 |
| Đọc caption | Caption ngắn, hợp đọc ngoài trời |
| STT → ô nhập câu hỏi | Dùng đúng `normalizeQuestion` sẵn có |
| Nút bật/tắt giọng | Luôn nhìn thấy và tắt được |

## Phải kiểm trước khi chốt

- Không có mạng thì voice có fallback sang chữ không.
- Tắt quyền microphone thì app vẫn dùng được bằng chữ.
- Câu hỏi nói không khớp bộ Q&A vẫn ra “Chưa có dữ liệu”, không bịa.
- Không phát giọng khi người dùng chưa bấm.

## Việc cần người dùng quyết trước khi mở phase (snapshot cũ, đã supersede)

1. ASR engine cụ thể; VieNeu v3 local hay Studio/cloud cho TTS. Khóa dịch vụ phải ở server, không đặt trong app.
2. Voice ID sau nghe mẫu nữ Bắc; shortlist bản mở Ngọc Linh/Đoan Trang, tốc độ cần thử.
3. STT trực tuyến đã được chọn; TTS cloud nếu dùng và retention/chi phí còn cần chốt. Không coi việc chọn cloud là quyền lưu âm thanh/huấn luyện.
4. Chữ/chip offline giữ nguyên; nghe offline chỉ khi có audio bundle/cache. Mic cloud không được nhận là offline.
5. Pilot điểm 01 hay mở rộng nội dung/intent theo các đợt trong spec. Lệnh hành động mới phải được review, không tự mở chatbot LLM.

## Điều kiện bắt đầu tại snapshot cũ (đã supersede)

Đoạn này ghi điều kiện trước authorization mới. Hiện Voice đã được cho phép triển khai V0–V7; xem trạng thái/gate mới tại phần đầu file và trong `VOICE_TEST_REPORT.md`.
