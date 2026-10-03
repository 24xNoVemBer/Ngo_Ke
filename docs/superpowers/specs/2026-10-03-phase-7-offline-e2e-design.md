# Spec — Phase 7: Offline, kiểm thử end-to-end và bàn giao demo

**Trạng thái:** người dùng đã duyệt Phase 6 (03/10/2026) và yêu cầu triển khai Phase 7. Báo cáo bàn giao: [`phase_7_review.md`](../../../agent_docs/phase_7_review.md). **Mã:** R7.01–R7.03.

## Mục tiêu

Đóng băng phạm vi core demo: chạy kịch bản demo trọn vẹn lặp lại, kiểm tra các fallback và khả năng thao tác, rồi bàn giao demo kèm danh sách rõ đã thử gì và chưa thử gì.

## Phạm vi

| Trong Phase 7 | Ngoài Phase 7 |
| --- | --- |
| Kịch bản `giới thiệu → hỏi → chủ đề → nhận điểm → xác nhận → lời kể → hỏi tiếp` chạy lặp lại | Tính năng mới |
| Offline: demo chạy khi thiết bị không có mạng | Backend thật (phase riêng, người dùng đã chốt phạm vi toàn cục) |
| Fallback camera/GPS/QR, Q&A, chuyển demo/live | Voice (phase riêng, chưa duyệt) |
| Bàn phím, cỡ chữ, cây accessibility | Chuẩn accessibility định lượng không có trong plan |
| Bàn giao: README demo, API/data/voice, ma trận thiết bị | Deploy, phát hành store |

## Cách chứng minh offline

Demo trong Expo Go cần Metro. Để **không phụ thuộc mạng**, em dùng `adb reverse tcp:8085 tcp:8085` để app tải bundle qua USB, rồi **bật chế độ máy bay**. Khi đó thiết bị không có Wi-Fi lẫn dữ liệu di động; nếu kịch bản vẫn chạy thì demo thật sự không cần mạng.

Nếu `adb reverse` không dùng được với Expo Go, em **không** ghi pass: sẽ ghi rõ giới hạn và chỉ chứng minh được mức “không cần internet, chỉ cần LAN với máy dev”, đồng thời nêu việc dựng bản build standalone để offline thật sự là quyết định của người dùng.

## Kịch bản lặp lại

`tools/e2e/demo-scenario.mjs` chạy trên emulator, mỗi lần ghi lại từng bước và kết quả:

1. Mở app ở chế độ Demo, đọc được “Đã nạp 6 điểm mô phỏng”.
2. Vào Q&A, nghe lời giới thiệu có tên điểm hiện tại.
3. Hỏi một câu mẫu, nhận đáp án **có nguồn**, bấm một câu hỏi tiếp.
4. Vào màn chọn trải nghiệm, chọn chủ đề và thời gian, nhận tối đa 3 điểm có lý do.
5. Xác nhận một điểm, vào màn camera để xem lời kể và caption.
6. Quay lại Q&A, hỏi tiếp tại điểm vừa xác nhận.

Chạy **3 lần**; kịch bản chỉ được tính là đạt khi cả 3 lần cho cùng kết quả. Lưu `agent_docs/evidence/phase-7/scenario-runs.json` và ảnh từng bước.

## Kiểm tra bổ sung

| Nhóm | Cách kiểm |
| --- | --- |
| Fallback | Từ chối quyền camera → chọn tay; từ chối quyền vị trí → chọn tay; QR sai định dạng → không đổi điểm |
| Q&A | Câu ngoài danh sách → “Chưa có dữ liệu”; đáp án luôn kèm nguồn |
| Chuyển mode | Live lỗi/rỗng **không** chuyển sang demo; demo vẫn chạy khi live lỗi |
| Bàn phím | Mở ô nhập, bàn phím không che nút gửi; dùng Enter để gửi |
| Cỡ chữ | `font_scale 1.3`: các màn vẫn cuộn được và bấm được nút chính; trả lại `1.0` |
| Accessibility | Mọi nút bấm trong cây accessibility có nhãn hoặc `content-desc` (kiểm cấu trúc, **không** đặt chuẩn điểm số) |

## Tài liệu bàn giao

| File | Nội dung |
| --- | --- |
| `docs/TEST_REPORT.md` | Ma trận thiết bị: đã thử / chưa thử, kết quả từng phase, phần chưa hoàn tất |
| `docs/HANDOFF_API.md` | Backend do dự án tự viết ở phase sau; hợp đồng endpoint, cách chạy, cách thay dữ liệu thật |
| `docs/HANDOFF_VOICE.md` | Phase voice chưa duyệt: ràng buộc (đáp án cố định, luôn có fallback chữ, connector do người dùng chọn) |
| `docs/HANDOFF_DATA.md` (cập nhật) | Dữ liệu MVP do dự án sinh và ghi nhãn mô phỏng; cách thay bằng data thật sau |
| `mobile/README.md` (cập nhật) | Cách mở demo, cấu hình live, giới hạn đã biết |

## Đóng băng scope

Ghi rõ trong báo cáo và `AGENTS.md`: sau Phase 7 không mở thêm tính năng vào core demo nếu chưa được duyệt phase mới. Backend và voice là hai phase riêng.

## Ranh giới

- Không ghi pass cho thiết bị/phần cứng chưa thử.
- Không thêm chuẩn accessibility định lượng.
- Lỗi tìm được chỉ sửa khi nằm trong phạm vi đã duyệt; lỗi ngoài phạm vi thì ghi ra và nêu ở “việc cần anh quyết”.
- Backend thật và voice không thuộc phase này.