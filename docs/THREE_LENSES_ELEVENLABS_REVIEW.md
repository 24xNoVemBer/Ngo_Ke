# Kiểm tra thay giọng Thắm / Talia — 19/10/2026

Trạng thái: đang triển khai, chưa phải báo cáo hoàn thành.

Chỉ thay bộ56track của `old-quarter-three-lenses`, giữ nguyên nội dung và156MP3 hiện có cùng cue. Giọng Việt Thắm `0ggMuQ1r9f9jqBu50nJn`, giọng Anh Talia `OZ0L6eISlOejga3XjDFt`; model/thông số/ngân sách theo [spec](THREE_LENSES_ELEVENLABS_SPEC.md).

| Bằng chứng | Trạng thái |
| --- | --- |
| API key local và quyền truy cập subscription/voices/models | W1 kiểm trực tiếp:200, không xuất secret |
| Số dư trước generation | 40000, count0, overage=false |
| Voice ID/rate | Cả2giọng đúng ID, đã ở MyVoices, rate1 |
| Dự toán raw source | VI12511 + EN12257 =24768;56track; trần30000 |
| W3 triển khai | `task_37ebdfcfb588` / `ctx_cf8244bea077`, actual Luna xhigh được kiểm từ terminal |
| Code/budget review trước paid call | Pending |
| Hai caption kiểm chi phí | Pending |
|56file hash/decode/format/source/revision/lookup | Pending |
|156MP3 cũ + cue không đổi | Baseline157file đã đếm; so bytes sau thay đổi pending |
| Mobile test/typecheck/lint sau tích hợp | Pending |
| Bundle native và asset HTTP sau tích hợp | Pending |
| Nghe bởi con người / thiết bị thật | Pending; không suy từ API200 hay bundle |

Metro `exp://192.168.100.36:8081` và gateway LAN18787 còn healthy khi W1 kiểm đầu đợt. Bản demo hiện tại tiếp tục dùng audio cũ tới lúc đủ kiểm chứng bộ mới. Không publish/store/push/merge.

## Việc cần người dùng quyết / tự làm

- Cần quyết: hiện không có lựa chọn chặn triển khai; hai giọng đã được xác nhận.
- Cần tự làm: nghe thử giọng và cách phát âm trên thiết bị khi bàn giao bản mới; đây là kiểm trải nghiệm chưa thể suy ra từ kiểm kỹ thuật. Quyền ảnh/nội dung chính thức vẫn theo báo cáo collection trước, chưa được coi là duyệt từ việc thay giọng.
