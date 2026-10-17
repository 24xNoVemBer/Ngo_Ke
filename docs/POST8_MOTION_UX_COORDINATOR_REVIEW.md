# Đánh giá UI/UX và motion Ngõ Kể — coordinator

Ngày: 17/10/2026. Yêu cầu: đánh giá toàn bộ UI/UX bằng `motion-design`, giao Antigravity thiết kế/điều chỉnh theo mục tiêu app và tự đánh giá.

## Kết luận và hướng thiết kế

Giữ cảm giác **sổ tay khám phá ngõ phố, ấm và gợi tò mò**. Trọng tâm là chọn ngõ → chọn điểm → nghe/đọc câu chuyện → hỏi tiếp có nguồn. Ảnh, màu giấy, xanh và vàng đang phù hợp; không có bằng chứng cần thay toàn bộ nhận diện hoặc dựng lại các màn đang rõ ràng. Dùng chuyển động editorial tiết chế, phản hồi nhấn nhanh, nội dung ổn định để đọc/nghe; một reveal có chủ đích ở màn đầu không trở thành nhịp chờ chung cho mọi thao tác.

Skill `C:/Users/LEGION/.agents/skills/motion-design/SKILL.md` đã được cài trước yêu cầu; W1 và W2 đã đọc và áp dụng, bao gồm `director/context-adaptation.md` và `reference/quality-checklist.md`. Không cài trùng, không thêm thư viện. W2 vẫn dùng Antigravity Gemini3.8Flash/high. Brief và audit ban đầu: `docs/POST8_MOTION_UX_REDESIGN_BRIEF.md`; audit/tự đánh giá của W2: `docs/POST8_MOTION_UX_ANTIGRAVITY_REVIEW.md` ở candidate.

## Phát hiện, hành động và phần đề xuất tiếp

| Ưu tiên | Phát hiện | Kết quả / đề xuất |
| --- | --- | --- |
| P1 | `useEntranceFadeSlide` chặn delay ở 100ms, khiến ba khối sau của Landing cùng bắt đầu ở 100ms, dù caller yêu cầu khác nhau; header ở 60ms | Đã sửa giới hạn và caller, có nhịp header/quote/carousel/teaser 40/130/220/310ms. Các vùng vẫn có thể thao tác, không khóa cả màn chờ animation. |
| P1 | Ảnh native xác nhận clock/network trắng trên nền sáng AlleySelect | Đã sửa lựa chọn status bar theo route; ảnh sau sửa xác nhận icon tối đọc được. Màn ảnh nền vẫn dùng icon sáng, Location/Plan giữ icon tối. |
| P2 | Token fast/normal/relaxed không theo thứ tự; chuyển trạng thái dùng nhiều nhịp rời rạc | Đã thống nhất nhịp có thứ tự, curve vào/ra rõ, điều chỉnh câu trả lời/postcard/photo/drawer và giảm nhún. Không coi việc thêm native driver/easing là bằng chứng đã đo FPS. |
| P2 | Nhiều khối trang trí có thể cạnh tranh hành động chính | Native Home vẫn có trạng thái điểm và CTA đọc chuyện rõ; Q&A có vùng câu chuyện/nguồn ổn định. Giữ bố cục hiện tại, không tự bỏ nội dung. Chưa có usability study để khẳng định một layout mới tốt hơn. |
| P2 | Bảng công cụ có copy thiên về API/server/key | Đề xuất tiếp: trình bày gọn trạng thái Demo dùng offline/Live khả dụng, giảm trọng lượng phần kỹ thuật, giữ đầy đủ nguồn và ranh giới hư cấu. Chưa đổi copy trong đợt chỉnh motion này. |
| P2 | Font 200%: placeholder dài của ô hỏi bị cắt | Đã kiểm chữ nhập “Where are we?” và nút Send vẫn rõ, gửi ra câu trả lời có nguồn. Đề xuất tiếp: placeholder ngắn hơn hoặc bố trí ô nhập tốt hơn, giữ accessible label. Không tuyên bố màn này hoàn hảo ở mọi cỡ chữ. |
| Giữ | Prologue: sóng vàng nhỏ, bán nguyệt hai bên sườn và cue 1.1s | Không đổi geometry/audio hoặc guard seek/cancel. Không tái mở thiết kế đã được chốt. |
| Giữ | Plan, Location, Camera, Unavailable và Placeholder | Audit W2 ghi rõ giữ/đã sửa/pending theo màn. Không thêm motion chỉ để đủ số hiệu ứng; camera/GPS giữ quyền, chọn tay và xác nhận điểm. Camera/lỗi không có bằng chứng native mới trong đợt này. |

Đây là **đánh giá toàn bộ màn và đợt tinh chỉnh UI/motion có chọn lọc**, không phải tuyên bố mọi màn đã được vẽ lại hay mọi vấn đề UX đã được giải quyết.

## Bằng chứng coordinator

- Bản nguồn tích hợp `c83b5ee` nhận cherry-pick riêng W2 `5099429`; bản đính chính báo cáo `d3e9842` nhận W2 `5aa940d`. Không merge cả nhánh W2 vì candidate có dữ liệu/audio và test tích hợp riêng.
- Cuối đợt: candidate `c909643` (W2 test/doc `95b438c`) đạt **268/268 app tests**; TypeScript và ESLint exit0 trên cùng product source `c83b5ee`. W2 cuối đạt **254/254 Node tests**; khác biệt do candidate có thêm14 kiểm tra tích hợp. Test mount hook thật xác nhận delay40/130/220/310 và duration380 được giữ; clamp100/250 cũ sẽ fail. Không gọi Node tests là nghiệm thu giao diện native.
- Git diff từ `7a47c82` không đổi `mobile/assets/`, data, backend hoặc voice logic; đủ 100 MP3 narration, cue giữ nguyên. Không thay EAS config/runtime, không publish bản redesign.
- Native Expo Go Android, AVD `Medium_Phone_API_37.0`, emulator5554, Metro candidate8081. Trước/sau font1.0: Prologue, Landing, AlleySelect, Home, Q&A và câu trả lời. Kiểm mở drawer/bàn phím, nhập/gửi câu hỏi; kiểm Prologue/Landing VI và EN. Không dùng web preview thay thế native.
- Font200: Prologue/Landing còn CTA dùng được; AlleySelect đọc được; Home chuyển sang danh sách lớn có trạng thái Viewing và CTA; Q&A/drawer nhập chữ và gửi câu hỏi được. Riêng placeholder dài bị cắt được ghi P2 ở trên.
- Reduced motion thực: đọc `AccessibilityInfoModule.kt` của RN đang cài, xác nhận Android lấy `Settings.Global.TRANSITION_ANIMATION_SCALE`. Đặt transition0 để kiểm AlleySelect/Home/Q&A/drawer; animator0 riêng lẻ không đủ chứng minh RN đã bật reduced motion. Các ảnh Prologue/Landing font200 đầu tiên chỉ là bằng chứng font, dù tên file có chữ “reduced”.
- PNG tại `C:/Users/LEGION/AppData/Local/Temp/ngoke-motion-*.png`. Nhóm đã xem: `before/after-alley-select-en`, `before/after-home-en`, `before/after-qa-en`, `after-qa-answer-en`, `after-question-drawer-en`, `after-home-font200-reduced-en`, `after-drawer-font200-typed-en`, `after-qa-font200-typed-answer-en`, `after-landing-vi`. Ảnh tĩnh không chứng minh FPS hoặc không flicker.
- `uiautomator dump` đôi lúc không idle khi Home đang pulse. Helper đã chuyển sang file XML mới mỗi lần và không tap khi không có dump hợp lệ; screenshot lấy trực tiếp bằng screencap. Không dùng XML cũ để kết luận màn mới. Một lần stdout Python lỗi Unicode sau tap VI, không gửi tap lặp; ảnh xác nhận locale đã đổi.
- Đã khôi phục font1.0, animator/transition/window1, a11y0 và locale app English; config AVD SHA256 vẫn `0ce6d3d57792feacf6dc747ef6706423856844197660e4a8d7de3c3339dc0375`. Emu kill thành công; kiểm độc lập ADB rỗng và không có emulator/qemu process. Metro8081 giữ chạy.
- Làm rõ thuật ngữ trong báo cáo W2: curve mặc định của `Animated.timing` trên RN đang cài là `Easing.inOut(Easing.ease)`, không phải “in-out quad”; drawer cũ260/200ms vốn đã có thời lượng vào/ra khác nhau, thay đổi mới là nhịp380/240 và directional easing rõ. Token radar1800 không tự chứng minh Location có radar đang chạy; camera/GPS cần kiểm trạng thái thực, không suy từ token.

## Giới hạn và việc cần người dùng

- Chưa kiểm iPhone/điện thoại thật, TalkBack/VoiceOver toàn bộ luồng, mọi màn ở font200, camera/QR/GPS thật, FPS hoặc chất lượng nghe của người dùng trong đợt này. Không suy từ Android Metro sang EAS iOS.
- Cần người dùng quyết: không có quyết định chặn việc audit/thiết kế đã giao; nghiệm thu cảm nhận cuối chưa được thay người dùng quyết.
- Cần người dùng tự làm: chưa có bước chặn; khi thử trên thiết bị thật, cảm nhận độ mượt/âm thanh vẫn là bằng chứng cần bổ sung. Expo.dev hiện vẫn là bản publish trước đợt này, không tự coi local candidate là bản team đã nhận.
