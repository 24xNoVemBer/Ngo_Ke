# Handoff Voice — Ngõ Kể

**Trạng thái:** phase Voice **chưa được duyệt và chưa có code**. Tài liệu này chỉ ghi ràng buộc để khi nào người dùng dẫn dắt thì không phải đoán lại từ đầu.

## Quyết định đã có sẵn

- Voice là **phase riêng sau core demo**, không gộp vào bất kỳ phase nào đã duyệt.
- **Chỉ bắt đầu khi người dùng dẫn dắt và duyệt riêng** (gate GV), kèm connector và giọng do người dùng chọn.
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

## Việc cần người dùng quyết trước khi mở phase

1. Dịch vụ nào cho TTS/STT, và có được phép đưa khóa vào app không.
2. Giọng: giọng Việt nào, nữ hay nam, tốc độ.
3. Có cho phép gửi nội dung câu trả lời ra ngoài máy (dịch vụ đám mây) không — đây là quyết định về dữ liệu người dùng.
4. Voice có cần chạy offline không.
5. Có làm cho cả nhóm dữ liệu, hay chỉ đọc lời kể/caption.

## Điều kiện bắt đầu

Phase Voice chỉ mở khi: core demo đã được người dùng xem và chốt, connector/giọng đã chọn, và người dùng nói rõ cho phép triển khai. Tới lúc đó em sẽ viết spec riêng và xin duyệt trước khi code.