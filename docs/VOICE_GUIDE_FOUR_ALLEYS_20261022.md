# Hướng dẫn tạo voice cho bốn ngõ

Ngày 22/10/2026. Theo D3/D6 của [plan](superpowers/plans/2026-10-22-four-alley-content.md): **chỉ chừa slot; chưa sinh audio**. Không đọc khóa hay gọi ElevenLabs trong đợt này. App hiển thị chữ khi không có track.

**Cập nhật 23/10/2026 — A2/A3:** `tools/voice/generate_alleys_intro.py` kiểm offline đủ bốn `intro.text`, `datasetRevision` và `textHash`, tổng 2.432 ký tự. Quyền hiện hành giữ `RESERVE = 10.000`, `BUDGET = 80.000`, `can_extend_character_limit = false`; guard subscription đạt. Tuy vậy, danh sách voice của tài khoản trả HTTP 200 nhưng không có Nhật Phong hoặc ID đã chốt `6adFm46eyy74snVn6YrT`; GET ID này trả HTTP 400 “voice not found”. Không gửi TTS POST, không gửi ký tự, không tạo audio/manifest/progress; không đổi sang voice khác. Catalogue giữ bốn slot rỗng nên fallback chữ vẫn hoạt động. A1 đã chốt dataset EN; không sinh EN trong A3, để dispatch A4.

## Slot hiện có

`mobile/src/voice/alleysCatalog.ts` chứa bốn reservation trong `pendingAlleyIntroSlots` và các catalogue VI có `tracks: {}`. Reservation lưu collectionId, contentId, datasetRevision và textHash; không có asset giả.

| Ngõ | collectionId | Nội dung | Số ký tự |
| --- | --- | --- | --- |
| Trung Yên | `ngo-trung-yen` | `vi/intro` | 626 |
| Tạm Thương | `ngo-tam-thuong` | `vi/intro` | 581 |
| Cấm Chỉ | `ngo-cam-chi` | `vi/intro` | 611 |
| Phất Lộc | `ngo-phat-loc` | `vi/intro` | 614 |

Tổng 2.432 ký tự theo audit. Quota guard hiện đạt nhưng voice VI đã chốt chưa truy cập được từ tài khoản API; A3 chờ đúng voice này, không tự thay thế. A1 đã hoàn tất dataset EN cho cả bốn ngõ; A4 sẽ dùng nội dung đã chốt.

## Cấu hình cho đợt sinh sau

- Giọng VI: Nhật Phong, voice ID `6adFm46eyy74snVn6YrT`, model `eleven_v3`, `language_code: "vi"`, định dạng `mp3_44100_128`.
- Tham khảo script có sẵn `tools/voice/generate_nhat_phong_three_lenses.py`; script này không gửi `voice_settings`.
- Văn bản phải đúng `intro.text` trong `data/localized/<collectionId>.vi.json`, là phần 2 của doc. Không đọc phần nguồn biên soạn, không thêm thẻ cảm xúc hay đổi chữ để đánh vần.
- `tools/voice/generate_alleys_intro.py` dùng `.vi.json`/`.en.json`, voice/model cấu hình cố định theo locale, `mp3_44100_128`, RESERVE 10.000, BUDGET 80.000 và chặn nếu `can_extend_character_limit` không phải `false`. Mặc định chỉ audit offline; `--generate` mới đọc khóa và gọi API. Progress ghi trạng thái trước mỗi POST; nếu kết quả chưa xác định hoặc audio lỗi, lần chạy sau dừng để tránh tự gửi lại yêu cầu trả phí. Nếu đã lưu phản hồi rõ ràng cùng partial audio, lần chạy sau chỉ xác minh và hoàn tất file đó, không POST lại.
- Khóa chỉ được đọc từ biến `ELEVENLABS_API_KEY` hoặc `.env.local` khi `--generate` cần gọi API; không commit, in log hoặc ghi vào báo cáo. Không gửi lại POST nếu chưa biết kết quả của lần gọi trước.

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

## A4 update — 23/10/2026 (English)

- Generated exactly four `en/intro` tracks from the finalized dataset `intro.text` values with Talia (`OZ0L6eISlOejga3XjDFt`), `eleven_v4`, `language_code: en`, and `mp3_44100_128`: 792, 653, 727, and 709 characters (2,881 total). All four requests returned audio; progress records all four tracks complete.
- The manifest records the immediate subscription-counter delta as 0; a later read-only check from the same run baseline showed +1,153 while all 2,881 characters were accepted by the TTS API. The usage meter had not caught up to accepted characters at the time of the follow-up read; no billing interpretation is inferred.
- Each MP3 decoded as mono 44.1 kHz audio; its file SHA-256 matches the manifest. EN catalogue entries use the current dataset revision and exact text hash. Every track remains `humanApproved: false`, `listened: false`, and `selectedForShipping: false`.
- The four new VI slots remain empty and use text fallback. A3 is still blocked until the exact pinned Nhật Phong voice is available to the configured account; total eight-track VI+EN coverage remains incomplete.
