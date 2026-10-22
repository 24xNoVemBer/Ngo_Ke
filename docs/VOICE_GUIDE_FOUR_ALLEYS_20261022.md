# Hướng dẫn tạo voice cho bốn ngõ

Ngày 22/10/2026. Theo D3/D6 của [plan](superpowers/plans/2026-10-22-four-alley-content.md): **chỉ chừa slot; chưa sinh audio**. Không đọc khóa hay gọi ElevenLabs trong đợt này. App hiển thị chữ khi không có track.

## Slot hiện có

`mobile/src/voice/alleysCatalog.ts` chứa bốn reservation trong `pendingAlleyIntroSlots` và các catalogue VI có `tracks: {}`. Reservation lưu collectionId, contentId, datasetRevision và textHash; không có asset giả.

| Ngõ | collectionId | Nội dung | Số ký tự |
| --- | --- | --- | --- |
| Trung Yên | `ngo-trung-yen` | `vi/intro` | 626 |
| Tạm Thương | `ngo-tam-thuong` | `vi/intro` | 581 |
| Cấm Chỉ | `ngo-cam-chi` | `vi/intro` | 611 |
| Phất Lộc | `ngo-phat-loc` | `vi/intro` | 614 |

Tổng 2.432 ký tự đếm offline, chưa kiểm số dư hoặc chi phí. Không có slot EN mới. Ba ngõ mới không có dataset EN; Trung Yên EN chỉ đồng bộ nội dung tối thiểu.

## Cấu hình cho đợt sinh sau

- Giọng VI: Nhật Phong, voice ID `6adFm46eyy74snVn6YrT`, model `eleven_v3`, `language_code: "vi"`, định dạng `mp3_44100_128`.
- Tham khảo script có sẵn `tools/voice/generate_nhat_phong_three_lenses.py`; script này không gửi `voice_settings`.
- Văn bản phải đúng `intro.text` trong `data/localized/<collectionId>.vi.json`, là phần 2 của doc. Không đọc phần nguồn biên soạn, không thêm thẻ cảm xúc hay đổi chữ để đánh vần.
- `tools/voice/generate_alleys_intro.py` **chưa tồn tại**. Chưa có lệnh generate/audit cho riêng bốn ngõ để chạy ngay.
- Khóa chỉ lấy từ cấu hình riêng khi đợt sinh được người dùng yêu cầu; không commit, in log hoặc ghi vào báo cáo. Lượt hiện tại không cần người dùng cung cấp khóa.

## Quy trình khi người dùng yêu cầu sinh

1. Đọc lại dataset và tính datasetRevision/textHash theo helper hiện có; cập nhật reservation nếu nội dung đã đổi.
2. Chuẩn bị script từ mẫu hiện có, có chế độ kiểm tra văn bản offline, kiểm chi phí riêng trước khi sinh, lưu tiến độ để tiếp tục, ghi file tạm rồi đổi tên. Không tự gọi lại yêu cầu trả phí bị lỗi khi chưa biết kết quả.
3. Xác nhận cấu hình/chi phí trong phạm vi yêu cầu mới, rồi sinh đúng bốn intro VI. Không sinh EN hoặc ghi đè audio cũ.
4. Kiểm giải mã MP3, định dạng, SHA-256 và textHash; gắn đúng collection/locale/revision vào catalogue. Không lấy audio ngõ khác làm chỗ giữ chỗ.
5. Chạy test mobile, typecheck, lint; kiểm phát/dừng và fallback chữ khi thiếu track. Sao lưu catalogue trước khi sửa. Giữ trạng thái chưa được người dùng nghe duyệt cho tới khi có xác nhận thật.

## Nghe thử sau khi đã sinh

Nghe đủ bốn track bằng tai nghe và loa, chú ý Cấm Chỉ, Chúa Chổm, Tạm Thương, Yên Thái, Ỷ Lan, Tiên Hạ, Nguyễn Trung Ngạn, Phất Lộc, Thái Bình, Trung Yên. Nếu phát âm sai, báo lại để chọn cách xử lý; không đổi `intro.text` chỉ để đánh vần.

Kiểm trên thiết bị việc bấm nghe, dừng, rời màn, tắt mạng và chế độ im lặng. Không phát giọng tự động trước thao tác nghe.

## Audio có sẵn trước đợt này

Commit `2208f59` trên nhánh `feat/nhat-phong-tts` đã được cherry-pick thành `cf2168c` trước khi triển khai bốn ngõ: 62 MP3 Nhật Phong cho Fiction Letter, Post8 và Three Lenses. Đây là audio cũ của baseline, không phải audio được sinh trong đợt này. Kết quả nghe trên thiết bị chưa được xác nhận.
