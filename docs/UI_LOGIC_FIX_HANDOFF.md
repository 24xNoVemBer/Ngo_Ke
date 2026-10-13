# Ngõ Kể — Bàn giao sửa logic UI

Ngày 11/10/2026. Người dùng đã yêu cầu “fix đi” sau báo cáo [ANTIGRAVITY_LOGIC_REVIEW.md](ANTIGRAVITY_LOGIC_REVIEW.md), đồng thời chấp nhận dùng ảnh chung cho demo.

Đã sửa 11 mục trong báo cáo. Giữ hướng giao diện Antigravity; dùng state React, các module và dependency hiện có. Ảnh demo tiếp tục được dùng chung.

## Cập nhật sau khi test iOS — 11/10/2026

Người dùng gặp màn đỏ `UIViewControllerBasedStatusBarAppearance` trên Expo Go iOS. Các tùy chọn `statusBarStyle` vừa thêm vào native stack gây lỗi với cấu hình native của host. Đã chuyển sang `StatusBar` của React Native theo route và trạng thái dữ liệu, bỏ các tùy chọn native stack liên quan; không yêu cầu rebuild/cài lại app.

Sau sửa: **100/100 test đạt**, typecheck/lint file thay đổi/diff check đạt; Metro tải bundle iOS mới HTTP200. Chưa xác nhận lại trực tiếp trên iPhone. Người dùng cần bấm **Reload JS** hoặc mở lại preview để kiểm hết màn đỏ; không có quyết định chặn.

## Hành vi sau khi sửa

| Mục review | Kết quả |
| --- | --- |
| 1 — GPS giả ở chọn ngõ | Bỏ đọc GPS/xin quyền tự động. Danh sách ghi khu vực và nội dung demo, bỏ khoảng cách cá nhân hóa và nhãn gần nhất. GPS thật vẫn nằm ở màn xác nhận, chỉ chạy khi bấm nút. Tìm tên ngõ nhận cả chữ có dấu và không dấu. |
| 2 — Điểm lệch giữa màn | App giữ điểm đang xem và điểm đã xác nhận riêng. Home/Q&A/Plan cùng dùng ID đang xem; GPS/QR xác nhận cập nhật cả hai. Xem pin/câu chuyện không xác nhận vị trí. ID không có hoặc điểm đóng không được chọn. |
| 3 — Q&A sai điểm | Đáp án, gợi ý và follow-up chỉ lấy trong điểm đang xem. Đổi điểm hoặc dataset xóa câu hỏi/đáp án cũ. Điểm chưa có Q&A hiện thiếu dữ liệu; không mượn đáp án của điểm 01. |
| 4 — Giọng nói giả | Bỏ timer tự gửi câu mẫu và trạng thái nghe giả. Không render micro khi không có chức năng. Landing/Q&A ghi lời kể bằng chữ. |
| 5 — Nút chết | Thẻ gợi ý mở đúng điểm trong Q&A. Sổ tay ở Q&A mở màn chọn trải nghiệm. Component dock chỉ hiện hành động có callback. |
| 6 — Tiến độ giả | “Đã mở” bắt đầu bằng 0; dùng tập ID những lời kể thực sự mở ở Q&A, không đếm lặp. Dấu trên Home là “ĐÃ MỞ LỜI KỂ”, tách khỏi đã ghé. Hộ chiếu được ghi rõ là mẫu, bỏ dấu đã ghé mặc định. |
| 7 — Thiếu dữ liệu | Home rẽ sang thông báo trước khi render sơ đồ, không còn sáu pin giả hoặc 1/0. Màn thiếu dữ liệu có quay lại/chuyển Demo, và Home Live có retry. Safe area/header/status bar theo màn. |
| 8 — Pin gắn sai node | Tên lấy từ dataset, callback truyền ID. Vị trí sơ đồ được gán ổn định theo ID, không phụ thuộc thứ tự mảng hoặc bắt buộc ID `demo-*`. Điểm đóng không mở được. |
| 9 — Retry Live | Mỗi retry kích hoạt request mới, busy phản ánh request thật và khóa nút trong lúc tải. Bỏ kết quả đến muộn khi đổi mode; vào Live lại không lấy snapshot cũ làm dữ liệu mới. |
| 10 — Ngân sách | Danh sách là một hành trình tối đa ba điểm, tổng thời gian dừng không vượt ngân sách. Giữ thứ tự thời lượng tăng dần và bỏ điểm đã ghé/đóng. Demo ghi rõ chưa tính đi bộ. |
| 11 — Parser | Nhận `ẩm thực`/`am thuc`; `1 tiếng rưỡi` = 90, `2 tiếng rưỡi` = 150, `1 giờ 30 phút` = 90. Từ chối số âm, 0, số không an toàn và chuỗi không phải thời lượng. |

Đã bỏ khung nhập Home không có đường mở; nhập chữ vẫn ở Q&A. Ghi chú nguồn cho lời kể demo không còn được gọi là bằng chứng riêng của từng điểm. Số điểm ở Landing/danh sách lấy từ nguồn đang dùng thay cho tổng metadata cố định 26.

Camera chỉ render khi màn được focus, tắt và xóa trạng thái cũ khi rời màn. Kết quả xin quyền đến sau khi rời màn không được mở lại camera. QR và chọn tay từ chối điểm đóng.

## Kiểm tra

| Kiểm tra | Kết quả |
| --- | --- |
| Node test runner (`node --test tests/*.test.mjs`) | **99/99 đạt**; thêm 9 ca hồi quy so với 90 ca ban đầu |
| TypeScript (`tsc --noEmit`) | Đạt |
| ESLint | Đạt |
| `git diff --check` | Đạt |
| Expo export Android | Đạt, không phải APK/store build |
| Expo export iOS | Đạt, không chứng minh runtime iOS |

Test hồi quy mới bao gồm parser/budget, QR điểm đóng, chuyển điểm/xác nhận/đã mở, retry và response đến muộn, Q&A theo điểm và dataset mới, pin khi đảo thứ tự/đổi ID, camera rời màn và quyền đến muộn. Test `uiFlows.test.mjs` thực thi callback và state với native modules được thay thế; không kiểm layout hay phần cứng.

### Kiểm tra native Android đã thực hiện

Thiết bị: `emulator-5554`, AVD `Medium_Phone_API_37.0`, Android 17/API 37, Expo Go 57.0.9. Metro mở bằng `expo start --offline --port 8085 --go`; bundle Android đã chạy thật trên Expo Go. Không dựng web preview.

| Ca thao tác | Kết quả quan sát |
| --- | --- |
| Mở Home trước khi đọc | 0/6, chưa có dấu đã mở |
| Câu hỏi gợi ý tại điểm 01 | Trả đúng nguyên đáp án trong fixture |
| Điểm 01 → điểm 02 sau khi hỏi | Xóa đáp án trước, hiện chưa có Q&A cho điểm 02 |
| Quay về Home từ Q&A | Giữ điểm 02, tiến độ 2/6 |
| Màn GPS → chọn tay điểm 03 → quay về | Home chọn điểm 03; chỉ xác nhận chưa tăng số lời kể đã mở |
| Chủ đề ẩm thực + 15 phút | Một gợi ý điểm 05, 10 phút |
| Bấm “Khám phá (10 phút)” | Mở đúng Q&A điểm 05 |
| Nhập `day la diem nao` rồi gửi | Drawer đóng, trả đáp án đúng điểm 01 |
| Bấm Sổ tay tại Q&A | Mở chọn trải nghiệm |
| Live không cấu hình | Không có sơ đồ/pin; hiện quay lại, retry, chuyển Demo |
| Chuyển Demo từ màn Live thiếu dữ liệu | Khôi phục Home demo, tiến độ phiên nguồn mới bắt đầu 0 |
| Mở danh sách chọn ngõ | Nhãn khu vực demo, không có nút/kết quả GPS giả hoặc khoảng cách từ người dùng |

Ảnh của các ca kiểm tra nằm tại [evidence/ui-logic-fix-2026-10-11](../agent_docs/evidence/ui-logic-fix-2026-10-11/): `home.png`, `qa-node-02.png`, `home-after-confirm-node-03.png`, `plan-15-minutes.png`, `typed-question.png`, `live-empty.png`, `alley-select-demo.png`.

## Giới hạn còn lại

- Tiến độ “đã mở” chỉ theo phiên và được reset khi đổi nguồn hoặc tải dataset Live mới; chưa lưu qua lần khởi động. Hộ chiếu là mẫu, chưa là tính năng ghi nhận đã ghé.
- Sơ đồ/ảnh/nội dung/tọa độ vẫn mô phỏng. Ngân sách tính thời gian dừng, không tính đi bộ và không phải chỉ đường.
- Retry lỗi → thành công và response đến muộn đã kiểm bằng request có kiểm soát trong test; native lần này chỉ chạy Live thiếu cấu hình, chưa dùng backend production.
- Camera focus/quyền đến muộn đã kiểm bằng test callback/state. Chưa quét QR thật qua ống kính hoặc kiểm camera/GPS trên điện thoại thật. Chưa chạy runtime iOS, TalkBack/VoiceOver hoặc ma trận màn nhỏ/font lớn đầy đủ.
- Giữ file `AlleyTrailView` chưa được gọi; chưa xóa file của Antigravity. Không thêm dependency, backend hoặc STT/TTS trong lượt sửa này.

## Việc cần người dùng quyết / tự làm

- **Cần quyết:** Không có quyết định đang chặn các sửa lỗi được giao. Backend/Voice và việc lưu tiến độ lâu dài vẫn là phạm vi riêng, chưa được mở bởi lượt fix này.
- **Cần tự làm:** Nếu chốt nghiệm thu trên điện thoại thật/iOS, chạy các ca chuyển điểm, nhập chữ, quyền camera/GPS và quay lại ở bảng trên trên thiết bị của bạn. Workspace hiện không kết nối thiết bị thật; nếu chưa thử thì giữ giới hạn nghiệm thu emulator, không coi iOS/QR/GPS phần cứng đã đạt.

Các thay đổi vẫn nằm trong working tree để review; chưa commit/push.
