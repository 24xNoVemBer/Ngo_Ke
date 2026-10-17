# Mở demo Việt/Anh — bản tích hợp local

## Bản bố cục và sóng vàng mới — 17/10/2026

- Candidate product source `4d98f3b`, test/docs cuối `76ac81a`: Landing ưu tiên chọn ngõ, bỏ footer lặp; Home có preview điểm chọn và một CTA; Q&A/công cụ nhẹ hơn; Prologue hai cung mỗi sườn, khung28dp, hiệu ứng620ms. Cue asset giữ bytes, đoạn phát fade trước chuyển màn.
- **274/274 app tests**, tsc/lint đạt; bundle iOS/Android HTTP200. Native sau thay đổi chưa xác minh vì công cụ chặn khởi động emulator (`blocked by policy`); không lấy ảnh cũ làm bằng chứng mới.
- Mở Expo Go với `exp://192.168.100.36:8081`, cùng Wi-Fi, reload nếu đang mở bản cũ. QR: `C:/Users/LEGION/AppData/Local/Temp/ngoke-demo-qr.png`. Metro terminal `term_f0bc65ee-88d7-4ebf-bb1a-48bc4a1a7d6b` đang phục vụ source mới.
- Báo cáo: `docs/POST8_LAYOUT_WAVES_COORDINATOR_REVIEW.md`. Cần người dùng quyết: không có bước chặn. Cần người dùng tự làm: kiểm cảm nhận trên máy thật khi nghiệm thu; chưa publish đợt này lên Expo.dev, link team bên dưới vẫn là bản trước.

## Preview Expo.dev cho team — 17/10/2026

- [Mở trang preview và QR](https://expo.dev/accounts/valentino241s-team/projects/ngo-ke-demo/updates/861bab90-e6cf-428b-8a21-f5a31e15c72a).
- iPhone: cài Expo Go tương thích SDK57, đăng nhập tài khoản thuộc tổ chức `valentino241s-team`, mở `exp://u.expo.dev/update/01a14871-90b6-706d-a015-22e56964f56f` hoặc quét QR `C:/Users/LEGION/AppData/Local/Temp/ngoke-expo-team-qr.png`. Không cần cùng Wi-Fi hoặc máy Metro chạy.
- Bản này gồm sóng vàng mượt ở hai sườn nút và âm khám phá mới; source `9fdfad9`, branch `ios-preview`. Service publish/readback đã xác nhận; chưa xác minh mở trên iPhone thật hoặc tài khoản tester.
- Chỉ upload iOS, chưa có bản EAS Android mới. Demo/Q&A/100 audio VI/EN có trong bundle; Live và nhận giọng nói từ mạng ngoài chưa có backend/gateway được triển khai.
- Việc cần người dùng quyết: không có quyết định chặn preview iOS. Việc cần người dùng tự làm: thêm tài khoản tester vào tổ chức với quyền Viewer rồi tester đăng nhập Expo Go. Điều kiện thành viên theo [quy định Expo Go hiện hành](https://expo.dev/changelog/expo-go-loading-changes-may-2026); không gửi mật khẩu cá nhân.

## Demo QR hiện đang chạy — hiệu ứng mở đầu 17/10/2026

Mở Expo Go cùng Wi-Fi với máy tính bằng `exp://192.168.100.36:8081`; QR tại `C:/Users/LEGION/AppData/Local/Temp/ngoke-demo-qr.png`. Reload để quay về màn mở đầu, bấm **BẮT ĐẦU DẠO NGÕ**: các cung sóng vàng nửa vòng tròn lan ngắn từ **hai sườn nút**, nét và hai đầu mờ mềm, từng lớp lệch pha rồi tan trong1180ms. Âm mới1100ms có đoạn dâng, mở rộng và đuôi ngân, hoàn tất trước chuyển trang. Giảm chuyển động bỏ sóng lan và vào trang ngay. Âm dùng chế độ audio hiện hành; lỗi seek/play không chặn chuyển trang. Rời app/màn hủy hiệu ứng đang chờ, callback âm cũ không phát sau hủy.

Source hiện hành `0d1dff75e03479ff36ee50eb562f2392c20f7369` (product5e12f3b + asyncseek tests). Root266app, typecheck/lint và bundle Metro iOS/Android đạt; WAV48554bytes được phục vụ đúng SHA25623d6711964f5f320ffce7e6604e8e49dab4e719e80697c580ed79fa96faa4a9e. Ảnh native trực tiếp VI/EN xác nhận cung sóng ngoài nút; MP4 debug có khung trắng trong đoạn chuyển nên chưa dùng để kết luận không flicker/FPS. Chưa đánh giá cảm giác/âm trên máy thật. **APK66c bên dưới chưa được build lại với hiệu ứng này.** Backend Live/gateway mic chưa bật trong phiên QR; Q&A/gợi ý/audio bundle vẫn dùng được.

## Artifact cụ thể

**Bản demo đã kiểm trong môi trường hiện có:** các sửa UI Việt/Anh/font200 đã được kiểm lại trên APK dưới đây. Report phân biệt bằng chứng native hiện hành, ca không đổi của bản trước và phần chưa kiểm; không nhận human QC/máy thật đã đạt. APK `f2d0b7ab…` cũ đã bị rút do manifest chỉ có46mapping dù ZIP có100file; bản hiện hành kiểm đủ100mapping.

- Source build: `66c5fc4278aa5585a02dfc2be60c3d472bb16e44`, nhánh `valentino/post8-integration`; gồm sửa Landing/Postcard font200, dịch chủ đề/lý do gợi ý ở Plan và Q&A, nhãn reviewed/simulated trong sổ tay, nhãn accessibility của nút sổ tay.
- APK: `../post8-integration/mobile/android/app/build/outputs/apk/release/app-release.apk`.
- SHA256 sau build exit0, kiểm lặp: `6c0623d6f226b9c5f307444789fafe011e441346741f566e3bbf1b7e38c677be`; 96,638,626 bytes. Bản đóng băng để QA: `C:/Users/LEGION/AppData/Local/Temp/ngoke-post8-66c5-6c0623d6f226-final.apk`.
- Hai ABI: `arm64-v8a` và `x86_64`. Có ABI điện thoại không phải bằng chứng đã thử điện thoại thật.
- APK có100MP3; root so hash toàn bộ file đóng gói khớp source. 34VI cũ và12firstpoint giữ nguyên bytes.
- Embedded `assets/app.manifest` có132asset/100MP3;100sourceMD5 khớp `packagerHash` và đúng `raw/resourcesFilename`, không thiếu54track mới.

Khi build lại, buộc Gradle tạo lại bảng asset bằng `:app:createReleaseUpdatesResources --rerun :app:assembleRelease`. SDK hiện có chỉ khai báo đường dẫn entryFile dạng String làm input task nên có thể báo UP-TO-DATE sau khi thêm asset. Đợi tiến trình trả exit0, rồi kiểm cả mapping trong `app.manifest` và bytes ZIP; đếm MP3 đơn thuần không bắt được lỗi này. Chạy guard `tools/e2e/audit_apk_assets.py <apk> <mobile-root>`;5unitcase đã đạt, fixtureAPK lỗi cũ phải fail54mapping.

Khi đổi URL build, dùng đúng `EXPO_PUBLIC_NGOKE_API_BASE_URL` và `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL`, đồng thời buộc `:app:createBundleReleaseJsAndAssets --rerun` trước task bảng asset. Bản6c0623 kiểm trực tiếp Hermes trong APK có hai URL emulator dưới đây; build2m50s/597tasks/exit0, root257app/type/lint đạt. iOS JS export cùngsource đã đạt (`index-c4b815e26d7343b700f1166b2d0c374b.hbc`), chưa phải kiểm iPhone.

Nếu cài bằng ADB, chọn đúng thiết bị trước, rồi `adb -s <device-id> install -r <apk-path>`. Không cần xóa dữ liệu app. Ngõ Kể dùng package `com.valentino241.ngokedemo`.

## Luồng demo offline

1. Mở Ngõ Kể, dùng mode **Demo** và chọn collection có nội dung.
2. Trên Home chọn **English** hoặc **Tiếng Việt**. Lựa chọn được lưu; đổi locale giữ điểm/chương logic và không tự bật audio mới.
3. `fiction-letter`: một truyện hư cấu6chương,21Q&A mỗi ngôn ngữ. Các thẻ ngõ khác không được coi là những truyện độc lập nếu chưa có dataset.
4. `old-quarter-pilot`: Bạch Mã, nhà87Mã Mây và Đồng Xuân;3Q&A mỗi điểm/mỗi locale, có nguồn và phân biệt truyền thuyết. Chọn điểm thủ công khi chưa có tọa độ nguồn.
5. Mở câu hỏi cố định hoặc follow-up, đọc nguồn, dùng player để nghe/dừng/phát lại. Nút xem chữ câu trả lời chỉ mở/ẩn chữ; không bật mic hoặc reset player.

UI/text/audio bundle của hai collection dùng offline. Cả100track bao gồm34VI cũ và66track mới;66mới vẫn provisional, chưa human listening/shipping approval. English dùng Kokoro `af_heart` US; pilotVI dùng VieNeu Đoan Trang.

## Mic và Live

Mic/STT cần gateway local; không phải chức năng nhận giọng offline trong APK. Bản QA này trỏ voice tới `http://10.0.2.2:18787`, data tới `http://10.0.2.2:18886` để emulator truy cập máy host. Hai URL đó không phải địa chỉ dùng trực tiếp trên điện thoại thật. Cài APK trên Android ARM64 để nghe audio bundle được; kiểm mic/Live trên điện thoại cần cấu hình đường kết nối và build phù hợp riêng.

Backend/gateway không được để chạy ngầm chỉ để che thiếu cấu hình. Xem `../post8-integration/backend/README.md` và `../post8-integration/tools/voice/gateway/README.md` cho lệnh local hiện có. Live thiếu dataset/cấu hình phải hiện empty/error, không lấy bundle Demo thay thế. Gateway không sẵn sàng thì dùng Q&A chữ/chip, không giả transcript thành công.

Actual HTTP ASR36mẫu synthetic:18expected,18unknown,0wrong; decoderlocale36/36. Đây là hạn chế nhận dạng cần giữ trong báo cáo, không phải điểm giọng người thật. Không đổi alias/matcher để che các câu unknown.

## Việc cần anh quyết / việc anh tự làm

- **Cần anh quyết:** nghe mẫu và chốt giọng EN/cách đọc tên Việt. Đề xuất giữ `af_heart` provisional hiện tại. Chưa chốt thì không gắn human/shipping approval.
- **Cần anh tự làm:** nghe66audio mới trên thiết bị thật và phản hồi tên/câu có vấn đề; không cần nghe lại34VI nguyên bytes chỉ vì lần tích hợp này. Phần này là yêu cầu VI/EN hậu Phase8 **[ngoài plan core TECH_DEMO_PLAN]** đã mở riêng. Chưa nghe thì chất lượng cảm nhận vẫn pending.
- **Cần anh tự làm:** khi kiểm bản iOS native, cung cấp môi trường build/ký/cài phù hợp; Windows hiện có chỉ export JavaScript. MCP liệt kê một iPhone online không chứng minh bản app này đã được cài/chạy trên đó. Chưa có bản native thì iPhone vẫn pending; không thay bằng kết quả Android.

Native QA và giới hạn cụ thể ở `POST8_FINAL100_QA_REPORT.md`, kết luận coordinator ở `POST8_COORDINATOR_REVIEW.md`. IME đã kiểm là panel emoji nổi; chưa kiểm QWERTY/docked keyboard, TalkBack đọc/focusorder hoặc timinganimation. Không suy nghiệm thu human/máy thật từ việc cài được APK hay có đủ file.
