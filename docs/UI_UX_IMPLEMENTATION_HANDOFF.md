# Ngõ Kể — Bàn giao cải thiện UX và motion

Ngày: 12/10/2026. Người dùng đã duyệt triển khai bằng câu “triển khai phần còn lại đi”. Áp dụng cho app native Expo; căn cứ [plan](UI_UX_IMPROVEMENT_PLAN.md) và [audit trước sửa](UI_UX_AUDIT_2026-10-12.md).

## Kết quả

Đã triển khai phần code của A–D, giữ hướng **sổ tay ngõ phố: ấm, giàu bản sắc**. A/B/C đã qua kiểm tự động và các luồng Android nêu dưới. D đã hoàn thiện giao diện và QA trên emulator; **chưa hoàn tất nghiệm thu iOS, thiết bị thật và đo release**. Không ghi FPS đạt khi chưa đo.

| Đợt | Thay đổi đã làm |
| --- | --- |
| A — Logic | Prologue mở Landing bằng `replace`, chặn bấm lặp; bỏ micro/waveform và thời gian nghe giả; Q&A → Sổ tay → chọn điểm trở về Q&A hiện hữu, Back về Home; Previous/Next bỏ qua điểm đóng; GPS bỏ kết quả đến muộn; QR chỉ nhận callback đầu mỗi lượt quét |
| B — Bố cục | Home cuộn được đường ngõ và thẻ điểm, dock trong luồng bố cục; CTA Landing cố định trong bố cục; tăng độ rõ chữ trên ảnh và chữ nội dung; header/nguồn ảnh Q&A không đè nhau; trạng thái thiếu Q&A có nền giấy; copy phân biệt Demo/Live đúng nguồn |
| C — Motion | Trạng thái focus/AppState/Reduce Motion dùng chung; dừng và reset loop khi ẩn/background; entrance ngắn, không chặn thao tác; drawer giữ mount khi đóng và bỏ callback đóng cũ; focus sau cửa sổ native mở, hủy focus đang chờ nếu đóng; câu trả lời chỉ tự cuộn khi vừa hỏi |
| D — Hoàn thiện | Icon SVG dùng thư viện đã có; rút các lớp giấy/đổ bóng và pulse không cần thiết; ảnh đổi sau khi load, bỏ callback ảnh cũ; thẻ chọn phản hồi nhẹ bằng opacity/translate; giữ ảnh thật hiện có và nguồn ảnh, không nhận ảnh minh họa là chứng cứ đúng điểm |

Không thêm dependency, backend, Voice hoặc lưu hộ chiếu lâu dài. Phần thống kê “5 / 6 / 100%” vẫn đã bỏ theo yêu cầu. Chưa commit/push; các thay đổi có trước của người dùng được giữ lại.

## Hành vi cần biết

- Màn bìa chỉ xuất hiện khi khởi động phiên mới; vào Landing rồi Back không trở lại một màn bìa đã bị fade trắng/đen.
- Sổ tay mở từ Home thay chính route Plan bằng Q&A khi chọn điểm. Mở từ Q&A quay về route Q&A có sẵn; không tạo chuỗi Q&A/Plan dài dần.
- Xem/đọc điểm không tự xác nhận vị trí. GPS và QR vẫn cần bước xác nhận; chọn tay vẫn dùng được khi quyền bị từ chối.
- “Dừng chờ GPS” bỏ hiệu lực request cũ. Promise vị trí của hệ điều hành có thể vẫn hoàn tất, nhưng không được ghi đè lựa chọn mới.
- Camera đóng khi màn mất focus hoặc app vào background. Lượt quét mới mở lại khả năng nhận QR.
- Reduce Motion tắt chuyển động trang trí, đổi màn và drawer vẫn hoàn tất. Không có thời gian chờ giả để khớp animation.
- Dữ liệu Live hiện vẫn chứa điểm mô phỏng theo schema đang dùng; UI không tự nhận đó là nội dung văn hóa đã thu thập thật.

## Kiểm chứng

| Kiểm tra | Kết quả / giới hạn |
| --- | --- |
| `npm test` | **111/111 đạt**, gồm 11 regression mới so với lượt audit 100 test |
| `npm run typecheck` | Đạt |
| `npm run lint` | Đạt, không lỗi/cảnh báo ESLint |
| `npm run build:android` | Expo export đạt, `mobile/dist/android`; chưa phải APK release |
| `npm run build:ios` | Expo export đạt, `mobile/dist/ios`; chưa phải bản iOS chạy trên máy |
| `git diff --check` | Đạt cho diff tracked; phần UI/tests mới có nhiều file untracked từ trước |
| Android native Expo Go | Prologue → Landing → Home → Q&A; hỏi bằng chữ; Q&A → Plan → điểm 05 → Back về Home đạt |
| Home thấp | Đổi viewport emulator thành 1800×1080; cuộn tới điểm 5/6 và cuối thẻ, nút khám phá mở đúng điểm 01 |
| Chữ lớn | Font scale 1.5 trên Prologue/Home/Q&A: nội dung đọc được, dock dùng được, phần dưới cuộn được |
| Bàn phím | Ô nhập/nút đóng/gửi không bị IME che; lần mở mới bàn phím tự hiện sau Modal; kiểm thêm chữ 1.5 với IME bằng thao tác vào ô |
| Reduce Motion | Kiểm preference Android và đường UI tĩnh; test lifecycle/stop/reset/listener đạt |
| Camera/GPS | Ca quyền/kết quả muộn, hủy, background và quét lặp được kiểm bằng regression có mock; chưa quét QR qua ống kính hoặc GPS ngoài đường |
| iOS runtime, TalkBack/VoiceOver | Chưa kiểm trên thiết bị |
| Frame-time/jank/60–120fps release | Chưa đo; Expo Go/emulator không dùng để xác nhận chỉ tiêu này |

Test navigation dùng `StackRouter` đang cài để kiểm 5 vòng chọn điểm mà stack không phình. Test drawer cố ý gọi callback đóng cũ sau khi mở lại và focus chờ sau khi đóng. Test GPS trả kết quả sau Back/hủy; test QR phát 2 mã khác nhau liên tiếp và xác nhận đúng mã đầu. Đây là regression logic, không thay cho E2E phần cứng.

## File chính

- `mobile/App.tsx`, `src/navigation.ts`: route và provider motion.
- `mobile/src/hooks/MotionPreferences.tsx`, `useMotion.ts`, `src/theme/motion.ts`: preference, lifecycle và thời lượng.
- `mobile/src/components/ExpandableInputDrawer.tsx`, `VoiceInteractionDock.tsx`, `CrossfadePhoto.tsx`, `AppIcon.tsx`: nhập chữ, action thực, chuyển ảnh, icon.
- `mobile/src/screens/PrologueScreen.tsx`, `LandingScreen.tsx`, `AlleySelectScreen.tsx`, `HomeScreen.tsx`, `QaScreen.tsx`, `PlanScreen.tsx`: bố cục và nội dung.
- `mobile/src/screens/CameraScreen.tsx`, `LocationScreen.tsx`: hủy request/kết quả cũ, camera background và quét lặp.
- `mobile/tests/uiFlows.test.mjs`: regression hành vi/lifecycle và stack thực.

## Bằng chứng giao diện

Ảnh native nằm ở `agent_docs/evidence/ui-ux-implementation-2026-10-12/`. Gear/Tools ở góc phải là overlay Expo Go, không thuộc app.

| Ảnh | Nội dung |
| --- | --- |
| [01-prologue.png](../agent_docs/evidence/ui-ux-implementation-2026-10-12/01-prologue.png) | Bìa rút gọn, CTA hiện ngay |
| [04-qa.png](../agent_docs/evidence/ui-ux-implementation-2026-10-12/04-qa.png) | Lời kể và dock nhập chữ |
| [05-qa-answer.png](../agent_docs/evidence/ui-ux-implementation-2026-10-12/05-qa-answer.png) | Trả lời đúng điểm và đưa đáp án vào vùng đọc |
| [06-input-keyboard.png](../agent_docs/evidence/ui-ux-implementation-2026-10-12/06-input-keyboard.png) | Bàn phím tự mở, drawer nằm phía trên |
| [07-plan.png](../agent_docs/evidence/ui-ux-implementation-2026-10-12/07-plan.png) | Sổ tay, icon và phân cấp gọn |
| [08-qa-empty.png](../agent_docs/evidence/ui-ux-implementation-2026-10-12/08-qa-empty.png) | Điểm chưa có Q&A |
| [10-home-short-window-end.png](../agent_docs/evidence/ui-ux-implementation-2026-10-12/10-home-short-window-end.png) | Điểm 5/6 truy cập được khi màn thấp |
| [11-home-short-window-card.png](../agent_docs/evidence/ui-ux-implementation-2026-10-12/11-home-short-window-card.png) | CTA cuối thẻ không bị dock che |
| [12-large-font.png](../agent_docs/evidence/ui-ux-implementation-2026-10-12/12-large-font.png) | Bìa với chữ 150% |
| [13-home-large-font.png](../agent_docs/evidence/ui-ux-implementation-2026-10-12/13-home-large-font.png) | Home chữ 150% |
| [14-qa-large-font.png](../agent_docs/evidence/ui-ux-implementation-2026-10-12/14-qa-large-font.png) | Lời kể chữ 150% |

Ảnh 02/03/09/15 trong cùng thư mục là các bước kiểm trung gian, không dùng để khẳng định trạng thái final. Ảnh audit trước sửa ở thư mục riêng được giữ để so sánh.

## Việc cần anh quyết / việc anh tự làm

Không còn quyết định chặn triển khai code của plan đã duyệt. Anh review cảm giác đọc/chuyển màn theo hướng sổ tay đã chọn và thử các ca dưới trên điện thoại thật:

1. iPhone: mở app → bắt đầu → vào ngõ → đọc → Sổ tay → chọn điểm → Back; xác nhận không còn lỗi status bar và không quay về bìa trống.
2. Mở/đóng ô nhập nhanh, gõ/gửi khi bàn phím mở; bật Reduce Motion và tăng cỡ chữ rồi lặp lại.
3. GPS: hủy hoặc Back lúc đang chờ, chọn tay; kết quả đến muộn không đổi điểm. Từ chối quyền vẫn đọc bằng chữ được.
4. Camera: QR thật, đưa 2 mã nhanh, background/resume và Back; camera phải dừng, chỉ một lựa chọn được đưa ra mỗi lượt.
5. Đo frame-time/jank trên Android và iOS bản release cùng dữ liệu, ghi median/p95 trước khi nghiệm thu “mượt”. Nếu có điểm giật, tối ưu theo trace ở màn đó; không tăng hiệu ứng đồng loạt.

Bundle được xuất local; chưa publish/deploy bản mới trong lượt này. Metro và emulator dùng để audit được dừng sau kiểm tra; các thiết lập cỡ chữ, viewport, animation và bàn phím được khôi phục. Muốn thử qua Expo Go cần khởi động lại server native trên mạng mà điện thoại truy cập được.
