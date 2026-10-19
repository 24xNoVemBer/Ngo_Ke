# Review bố cục màn mở đầu — 20/10/2026

Đã chỉnh, tích hợp và cập nhật preview iOS theo [brief](POST8_FIRST_SCREEN_LAYOUT.md). Phạm vi là Prologue có logo/nút bắt đầu, là màn mở đầu thật; câu hỏi làm rõ Landing/cả hai chưa có trả lời nên không mở rộng sang màn chọn ngõ.

## Bằng chứng trước thay đổi

- Candidate `31a7110`, W2 baseline `a40b40f`; PrologueScreen/LandingScreen/uiFlows.test.mjs byte-identical giữa hai nhánh. W1 xem app native Expo Go trên emulator-5554,375×812dp, fontScale1 và2, tiếng Anh. Ảnh trước thực: `C:/Users/LEGION/AppData/Local/Temp/ngoke-first-screen-before-en.png`; font2: `ngoke-first-screen-before-en-font2.png`. File `ngoke-first-screen-before.png` là lỗi Expo khi kết nối ban đầu, không dùng làm bằng chứng UI.
- Ảnh native xác nhận eyebrow tách xa logo, subtitle letterSpacing2 trải chữ và xuống dòng. Chỉnh theo grouping/spacing/typography và touch target từ UI/UX Pro Max, không thêm chức năng.
- Conservative contrast bound (pixel ảnh trắng hoàn toàn, công thức alpha composite và relative luminance): #E8D5BC trên scrim rgba(20,24,19,.67)=4.17:1; .72=4.99:1. Primary #FFFDF7 trên .72=7.01:1; CTA cream trên #2D5748=8.04:1. Đây là bound theo màu khai báo, không phải đo text antialias từng pixel của screenshot.
- Protected Git tree baseline: data `b439a314a50739b1e786259ecf433b453a539ebd`; mobile/assets/sounds `da6f8fbf8c4c028a78532616308460766ab07fa1`; mobile/assets/voice `b7fca704e03bd41707fc0724b8ee5f67fe6483de`; mobile/src/voice `49ac2fb38f4113b878ba4795ba1ab07d4c8919a1`.

## Tiến độ triển khai và kiểm cuối

W2 Antigravity actual Gemini3.8Flash/high, điều phối bằng [Orca orchestration](C:/Users/LEGION/.agents/skills/orchestration/SKILL.md). W1 review từng commit và cherry-pick vào candidate, không sửa source W2:

| Task / dispatch | Commit W2 → candidate | Kết quả |
| --- | --- | --- |
| task_ed3293a413f1 / ctx_3b9b7d477f61 | 781fdcf → e322e53 | Gom3vùng,48dp,wrap/width/safe area/contrast; thêm một regression hành vi đổi ngôn ngữ |
| task_fc3ae2886a7c / ctx_c1e88eea77a7 | b549222 → cd9ff28 | Sửa đúng một dòng StyleSheet về absoluteFill sau khi W1 tsc bắt API absoluteFillObject không còn trong RN0.86 |
| task_9b68d82b35a7 / ctx_ea512cc696cd | b37fa3b → 0874963 | Bỏ newline cưỡng bức chỉ ở render quote; giữ nguyên lời/dấu câu/nguồn dịch, sửa dòng đơn lẻ “giấc,” thấy trên ảnh VI375dp |

Source cuối `087496359309a1fb6390feaf602916256c5038c9`: W1 chạy **287/287 app tests, TypeScript và ESLint đạt**. Không sửa expected để che lỗi hoặc thêm mock cho API đã bị bỏ. Hai test chỉ soi style trong WIP đã bỏ khỏi commit theo nguyên tắc không dùng chúng thay native layout; giữ regression locale dùng translator thật thay literal bị lệch phiên bản. W2 báo269/269 test và lint trên nhánh riêng; kết quả candidate đầy đủ ở trên mới là căn cứ tích hợp.

Trước render, toàn bộ handlers/timer/animation config byte-identical sau chuẩn hóa newline so với baseline;4 protected Git tree bên trên giữ đúng hash sau tích hợp. Không đổi data, source dịch,312MP3 đang lưu, cue,156activevoice, matcher hoặc backend; không thêm dependency/font/ảnh/chức năng.

## Kiểm native trực quan

Expo Go trên Android emulator API37, emulator-5554. Cỡ dp được đặt bằng wm size/density; đã view screenshot thật và đọc UIAutomator, không dùng render test thay bằng chứng native.

| Cấu hình | Kết quả thực | Mốc |
| --- | --- | --- |
| 375×812dp, font1, VI/EN | Eyebrow sát cụm logo, phụ đề đọc rõ, vùng ngôn ngữ cao48dp, CTA cao56dp; đổi VI/EN cập nhật nội dung và selected state | cd9ff28; VI chụp lại cuối0874963 |
| 375×812dp, font2, VI | Đủ chữ; cuộn hiện nguyên CTA và hint, không tràn ngang | cd9ff28 trước sửa whitespace quote |
| 375×667dp, font2, EN | Đổi EN thật, selected=true; cuộn tới CTA/hint nằm trọn trong khung, không bị navbar che | cd9ff28 trước sửa whitespace quote |
| 812×375dp, font1, EN | Cuộn tới CTA/hint đầy đủ; bề rộng nội dung gọn giữa màn ngang | 0874963 |
| 768×1024dp, font1, EN | Cụm nội dung và CTA được giới hạn bề rộng, không giãn chữ toàn tablet; bấm CTA sang Landing “Choose an alley” | 0874963 |
| 375×812dp, font1, VI, animator_duration_scale=0 | Bấm CTA sang Landing “Chọn một con ngõ”; không đo FPS hoặc thời gian sóng bằng screenshot | 0874963 |

Ảnh cuối [VI375dp](C:/Users/LEGION/AppData/Local/Temp/ngoke-first-screen-final-vi.png); [landscape EN](C:/Users/LEGION/AppData/Local/Temp/ngoke-first-screen-landscape-en.png); [tablet EN](C:/Users/LEGION/AppData/Local/Temp/ngoke-first-screen-tablet-en.png). Ảnh font2 tại `ngoke-first-screen-after-font2-top.png`, `ngoke-first-screen-after-font2-bottom.png`, `ngoke-first-screen-short-en-font2.png` thuộc mốc cd9ff28; ảnh `ngoke-first-screen-after-vi-font2.png` là frame trắng chuyển cấu hình Expo Go, không dùng làm bằng chứng UI. Không tuyên bố hết flicker, đạt FPS hoặc đã nghe hiệu ứng: emulator chạy no-audio. Layout kiểm trong palette điện ảnh hiện có, không tạo theme mới. iPhone thật/VoiceOver/TalkBack chưa thử.

Đã khôi phục font1, animator1, rotation0, accelerometer1, physical size1080×2400/density420; bỏ đúng adb reverse8083 và tắt emulator do W1 mở. Worker cuối đã release, hai dispatch trước chuyển quyền cleanup sang follow-up cùng terminal; reclaimable0, final delivery đã ACK/mailbox rỗng. Metro QA8083 đã nhận Ctrl+C; không dừng server/user workspace khác.

## Cập nhật preview iOS

Tiếp tục preview cùng project/branch theo yêu cầu deploy rõ ràng đã có trong phiên; không tạo cửa xin duyệt lại. Export `mobile/dist/expo-first-screen-20261020`, EXPO_NO_DOTENV1/CI1/API và voice URL rỗng. **156/156 MP3 export SHA256 đúng manifest**, assetmap180entries; Hermes2757920bytes/SHA256 `4e2673b1d53b5e933d8db2c958fe0d2439deb6dfe4c0427c39e02742bd1eeb77`, không IP LAN hoặc tên biến API key. Candidate clean trước publish. Không có thêm TTS hoặc credit ElevenLabs.

**Đã Published17:40:04.526UTC19/10 (00:40 ngày20/10 local)**: cached EASCLI24.14.0 upload1bundle, không có asset mới (192iOSassets dùng lại). Group `02936a78-2e15-413b-b1da-5a37e3269a33`, update `01a1553f-c32e-7747-9653-e9bc732bc684`. W1 độc lập `eas update:view` xác nhận đúng source0874963/ios/ios-preview/exposdk:57.0.0; remoteassetmapHTTP200 bằng exportexact/156MP3. Dashboard và updateendpointHTTP200. Không publish Android/APK/IPA/TestFlight hoặc backend.

[Mở preview và QR](https://expo.dev/accounts/valentino241s-team/projects/ngo-ke-demo/updates/02936a78-2e15-413b-b1da-5a37e3269a33). Expo Go iOS: `exp://u.expo.dev/update/01a1553f-c32e-7747-9653-e9bc732bc684`; đăng nhập tài khoản trong team như preview trước. Không cần cùng Wi-Fi/Metro. Demo và156audio bundle có trong preview; Live và mic online chưa có public server.

## Việc cần anh quyết / việc anh tự làm

- Cần quyết: không có cửa duyệt bổ sung cho chỉnh bố cục đã giao.
- Cần tự làm: kiểm cảm nhận trên iPhone thật; hiện bằng chứng native chỉ từ emulator Android, chưa xác minh VoiceOver hay iPhone.
