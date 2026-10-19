# Kiểm tra thay giọng Thắm / Talia — 19/10/2026

Trạng thái: đã tích hợp và đạt kiểm kỹ thuật trong môi trường hiện có. Worker commit `70620bc` được review/cherry-pick hẹp thành candidate `5e9ad87`; không merge/push/publish/store.

Chỉ thay bộ56track của `old-quarter-three-lenses`, giữ nguyên nội dung và156MP3 hiện có cùng cue. Giọng Việt Thắm `0ggMuQ1r9f9jqBu50nJn`, giọng Anh Talia `OZ0L6eISlOejga3XjDFt`; model/thông số/ngân sách theo [spec](THREE_LENSES_ELEVENLABS_SPEC.md).

| Bằng chứng | Trạng thái |
| --- | --- |
| API key local và quyền truy cập subscription/voices/models | W1 kiểm trực tiếp:200, không xuất secret |
| Số dư trước / sau generation | 40000/count0 → 30091/count9909; overage=false |
| Voice ID/rate | Cả2giọng đúng ID, đã ở MyVoices, rate1 |
| Dự toán raw source | VI12511 + EN12257 =24768;56track; trần30000 |
| W3 triển khai | `task_37ebdfcfb588` / `ctx_cf8244bea077`, actual Luna xhigh được kiểm từ terminal |
| Code/budget review trước paid call | W1 độc lập7new unit PASS, dryrun56/24768; reserve/no-retry/rate được review |
| Hai caption kiểm chi phí | Đạt: EN65ký tự/cost26, VI75/cost30; tổng56/accountdelta56 khớp. Giữ file, không resend. Spec dùng reserve bảo thủ và actual≤reserve có đối chiếu |
|56file hash/decode/format/source/revision/lookup | W1 thực chạy audit56/56PASS; manifest ghi đúng2voice/model/settings và source hashes; lookup app sau tích hợp pending |
| Kiểm toán offline thật | W1 trỏ LEDGER sang path không tồn tại, mock key/network thành lỗi; audit56/56 vẫnPASS, không cần key/cache/API |
| Kiểm thử renderer | W1 độc lập22/22Python focusedPASS:17renderer +5legacy, có reserve/no-retry/unknown/discount/shadow balance/recovery/offline audit |
|156MP3 cũ + cue không đổi | W1 so đủ157file candidate với Git blob baseline8b2fa8c,0sai khác |
| Mobile test/typecheck/lint sau tích hợp | W1 chạy candidate:285/285PASS, typecheck0, lint0 |
| Bundle Android / iOS qua Metro | HTTP200;6021158 /6020544bytes; mỗi bundle168reference bộ mới,0reference archive three-lenses/vi hoặc en; không có biến ELEVENLABS_API_KEY |
| Asset HTTP sau tích hợp |56/56HTTP200 qua192.168.100.36:8081, SHA256 khớp manifest;26574974bytes |
| Nghe bởi con người / thiết bị thật | Pending; không suy từ API200 hay bundle |

Kết quả generation: đúng56TTSrequest, tổng phí theo header/accountdelta **9909credit**, dư tài khoản **30091**, thấp hơn trần30000 của đợt này. Không tạo sample ngoài inventory hoặc repost file. Số dư đóng lúc2026-10-19T06:06:39Z trong manifest; đây là bằng chứng thời điểm kết thúc batch, không cam kết số dư tài khoản không đổi sau đó.

API trả phí captionEN26/VI30 thấp hơn reserve65/75 và có độ trễ subscription, từng trả429. Công cụ giữ reserve bảo thủ, đối chiếu số dư theo ledger, chặn unknown/header vượt reserve, backoff chỉ GET; exactreconcile tối đa8request và trước finalize. Một file bị gián đoạn bước decode được revalidate hash/source/full decode rồi khôi phục, không POST lại. W1 bắt lỗi audit checkpoint/đòi ledger local trước tích hợp; W3 sửa metadata/auditor, W1 chạy lại audit offline thật đạt. Báo cáo không coi việc từng kiểm sai là PASS trước sửa.

Legacy `three_lenses.py audit` kiểm catalogue VieNeu/Kokoro cũ, nên sẽ báo mismatch sau chuyển active catalogue. Bằng chứng bảo toàn là đối chiếu bytes/hash, không sửa auditor cũ để che khác biệt.

Metro `exp://192.168.100.36:8081` hiện phục vụ catalogue mới. QR: `C:/Users/LEGION/AppData/Local/Temp/ngoke-demo-qr.png`. Mở Expo Go cùng LAN, Reload nếu đang giữ bundle cũ. Audio đã bundle dưới dạng static requires, không gọi ElevenLabs khi nghe trong app.100tracklegacy vẫn active,56VieNeu/Kokoro của collection này được lưu nguyên như archive nhưng không còn referenced trong bundle;56fileElevenLabs thay phần đó.156activeMP3,212MP3 được giữ trên đĩa.

Các kiểm tra trên do W1 tự chạy, tách khỏi báo cáo W3 tại `tools/voice/THREE_LENSES_ELEVENLABS_REPORT.md`. HTTP bundle/asset không phải bằng chứng đã chạy native trên điện thoại hoặc đã nghe/duyệt phát âm. Không thử lại emulator từng bị policy chặn; không có nghiệm thu iPhone/GPS/QR vật lý mới. W3đãrelease đúng ownedterminal, worker_done được kiểm đúng Task/Dispatch và ACK.

## Việc cần người dùng quyết / tự làm

- Cần quyết: hiện không có lựa chọn chặn triển khai; hai giọng đã được xác nhận.
- Cần tự làm: nghe thử giọng và cách phát âm trên thiết bị khi bàn giao bản mới; đây là kiểm trải nghiệm chưa thể suy ra từ kiểm kỹ thuật. Quyền ảnh/nội dung chính thức vẫn theo báo cáo collection trước, chưa được coi là duyệt từ việc thay giọng.
