# Bố cục và sóng vàng — bàn giao triển khai

Ngày 17/10/2026. Scope được người dùng duyệt bằng “triển khai đi”; brief `POST8_LAYOUT_WAVES_IMPLEMENTATION.md`. W2 Antigravity dùng motion-design, giữ Gemini3.8Flash/high; W1 review và tích hợp từng commit.

## Kết quả

- **Prologue:** một câu dẫn ngắn VI/EN; hai cung bán nguyệt mỗi sườn, đối xứng theo nút, halo nhẹ và đầu cung mờ. Khung sườn28dp có clip nên transform/halo không vẽ tràn xa; nhịp signature620ms, native fade chuyển màn240ms hiện có. Asset cue1.1s nguyênbytes nhưng phần phát được fade trong khoảng460–600ms rồi dừng khi chuyển, không chờ phát đủ file.
- **Landing:** lựa chọn ngõ lên trước, lời dẫn nhỏ sau carousel, bỏ footer khám phá lặp chức năng. “Xem tất cả”, tap ngõ và passport mẫu vẫn có đường vào riêng rõ.
- **Home:** preview điểm chọn nằm ngoài vùng cuộn, ngay trên hai thao tác phụ GPS/Công cụ. Chỉ một CTA mở chuyện; tên được xuống dòng, ảnh có credit, thời lượng mô phỏng được ghi rõ. Font lớn chuyển preview thành cột, bỏ thumbnail/thông tin phụ khi cần; title và CTA giữ được ưu tiên. Đây là xác nhận cấu trúc source, không phải ảnh native mới.
- **Q&A:** giữ player làm trọng tâm, mic idle xanh dịu, nút đọc/chip hỏi nhẹ hơn; icon trên nền giấy có tương phản nhất quán. Ô nhập dùng hint ngắn, tiêu đề mang tên điểm làm contextual accessibility label. Nguồn/fiction boundary, ghi âm/lỗi và câu trả lời cố định giữ nguyên.
- **Công cụ:** copy nguồn ngắn theo offline/Live, giữ disclaimer và error/retry. Plan/Camera/Location/Unavailable giữ cấu trúc/quyền/lifecycle hiện có, không thêm hiệu ứng trang trí.

## Commit và kiểm tra độc lập

| W2 | Candidate | Nội dung |
| --- | --- | --- |
| `3df2df3` | `8d9d81d` | Bố cục, copy và sóng mới |
| `93f73c9` | `e8d7516` | Sửa review: sở hữu interval, clip, đọc chữ/nguồn |
| `edd851c` | `4d98f3b` | Cột font lớn thực, icon đọc chữ, báo cáo trung thực |
| `236a09d` | `843daf3` | Fake-timer test cho hủy A → chạy B → callback A cũ và seek/fade |
| `cc0fabf` | `76ac81a` | Bổ sung assertions fontScale2.0, icon và làm rõ số test toàn mobile |

- Candidate `76ac81a`: **274/274 app Node tests**,0 fail/cancel/skip; ESLint exit0. TypeScript exit0 tại `4d98f3b`, cùng product source với `76ac81a` (hai commit cuối chỉ test/docs). W2 có260 tests vì candidate có thêm14 kiểm tra tích hợp. Assertions chữ lớn/icon thêm vào test hiện có nên không tăng số test. Không gọi Node tests là native UI acceptance.
- Ca mới thực sự tạo interval A, hủy/background, tạo B, gọi callback A cũ và kiểm B còn sống; kiểm seek B trong fade không reset volume, seek cũ sau navigation không phát, và unmount không rò timer. Test cũ chỉ tên nói “stale interval” đã được đổi tên đúng phạm vi.
- Trước khi cherry-pick nhóm commit phụ thuộc nhau đã dừng Metro; chỉ bật lại sau khi source cuối và checks đạt, tránh phục vụ phiên bản giữa chừng. Demo giữ terminal `term_f0bc65ee-88d7-4ebf-bb1a-48bc4a1a7d6b`, port8081.
- iOS bundle HTTP200, **5,822,638 bytes**; Android HTTP200, **5,822,784 bytes**. Đã kiểm trong cả hai: selected preview mới, duration620, flank28, không có wave thứ ba. Bundle compile không chứng minh layout/runtime/âm thanh trên máy thật.
- So sánh git tree với baseline `1ec615d`: `mobile/assets`, `data`, `backend`, `mobile/src/voice` giữ nguyên. Đủ100 MP3 narration, cueWAV không đổi; không thêm dependency hoặc đổi EAS config. Ba dòng key `RECORDER_RECOVERY_PENDING` riêng của candidate được giữ sau auto-merge translator.
- Không merge/push main, không ghi workspace chính, không publish EAS/store/backend. W2 self-review: `docs/POST8_LAYOUT_WAVES_ANTIGRAVITY_REVIEW.md` ở candidate.

## Giới hạn thật và cách mở

Native mới chưa kiểm: công cụ đã **từ chối khởi động emulator** với thông báo `blocked by policy`, không có giải thích chi tiết hơn. Không retry bằng shell/tool/worker khác. Ảnh native đợt trước chỉ là baseline trước sửa: W1 xác minh source/assets `c83b5ee..1ec615d` giống nhau, không dùng ảnh cũ làm ảnh sau sửa. Chưa đo FPS, chưa nghe/đánh giá cảm giác trên điện thoại thật hoặc iPhone, chưa nghiệm thu mọi màn/font/keyboard bằng renderer native.

Demo local: `exp://192.168.100.36:8081`, cùng Wi-Fi với máy chạy Metro, Expo Go. QR `C:/Users/LEGION/AppData/Local/Temp/ngoke-demo-qr.png`; reload để nhận bố cục mới. Expo.dev vẫn là bản publish trước, không tự coi team đã nhận bản này.

## Việc cần người dùng quyết / tự làm

- Cần người dùng quyết: không có quyết định chặn phần triển khai đã yêu cầu; chưa thay người dùng nghiệm thu thẩm mỹ.
- Cần người dùng tự làm: thử cảm nhận độ mượt/âm thanh trên điện thoại thật khi nghiệm thu. Native mới còn thiếu bằng chứng do lệnh khởi động giả lập bị công cụ chặn; không tạo cửa xin duyệt lại hoặc giữ demo không hoạt động vì phần đó.
