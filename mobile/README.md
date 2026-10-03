# Ngõ Kể — khung native Phase 1

**Bàn giao code Phase 1–6.** Phase 1 đã được người dùng duyệt. Phase 2 thêm giới thiệu và hỏi đáp cố định; Phase 3 thêm chọn chủ đề, quỹ thời gian và gợi ý tối đa ba điểm kèm lý do; Phase 4 thêm camera xin quyền đúng lúc, quét QR của điểm đã biết, lớp người kể 2D tạm + caption và chọn điểm bằng tay; Phase 5 thêm lấy vị trí **một lần** theo thao tác, gợi ý **một** candidate kèm khoảng cách/accuracy, và chỉ xác nhận của người dùng mới đổi điểm hiện tại. Phase 6 thêm chế độ live gọi `{base}/api/dataset` với timeout 8 giây và các trạng thái empty/error rõ ràng. Nội dung và tọa độ vẫn là **mô phỏng**; backend thật chưa có, máy chủ kiểm chứng cục bộ nằm ở `tools/mock-api/`.

## Mở demo nhanh

```bash
cd mobile
npm install
npm test            # 90 ca, không cần mạng
npm start           # rồi mở app bằng Expo Go
```

Demo đọc `data/demo.json` trong bundle: **không cần API, server hay API key**. Chế độ live thì cấu hình `EXPO_PUBLIC_NGOKE_API_BASE_URL=<url>`.

## Yêu cầu và mở app

- Node 24 (đã dùng 24.19.0), npm (đã dùng 11.17.0).
- Expo SDK 57, React 19.2.3, React Native 0.86.3. Đã mở trên Android emulator bằng Expo Go57.0.9; điện thoại thật/iOS chưa thử.
- Điện thoại và máy chạy Metro cùng mạng để mở bằng LAN; không cần account, backend hoặc API key cho khung hiện tại.

Từ thư mục dự án:

```bash
cd mobile
npm ci
npm start -- --go
```

Android: dùng Expo Go quét QR của Metro. iPhone: dùng camera mở QR vào Expo Go. Nếu máy phát triển và điện thoại không kết nối được LAN, kiểm tra mạng/firewall và IP của máy; chưa cấu hình tunnel hay deploy. Dừng Metro bằng `Ctrl+C`.

Khung Metro có thể chạy không gọi dịch vụ mạng Expo:

```bash
npm start -- --offline --port 8085 --go
```

Không ghép `--offline` với `--localhost`/`--lan`: Expo CLI không cho dùng đồng thời. Offline CLI không có nghĩa điện thoại nhận được bundle khi tách khỏi máy Metro, hoặc demo fixture đã chạy. Khởi chạy offline trên điện thoại **chưa kiểm tra**.

## Anh có thể review gì?

0. Chế độ live: `EXPO_PUBLIC_NGOKE_API_BASE_URL=<url> npm start` rồi bấm **Live**; không có URL thì hiện “Live chưa được cấu hình”.
1. Home mặc định **Demo**, báo “Đã nạp 6 điểm mô phỏng”; cuộn xem “Điểm demo 01–06”, nhãn “điểm khởi đầu” và disclaimer không phải địa điểm thật.
4. Bấm **Tìm điểm gần nhất bằng GPS và xác nhận**: bấm **Lấy vị trí của tôi** (chỉ xin quyền lúc này), xem “có thể là…” + khoảng cách + độ chính xác, rồi bấm **Xác nhận điểm này** hoặc chọn tay.
3. Bấm **Mở camera, quét QR và xem người kể**: camera **tắt** cho tới khi bấm nút xin quyền; quét mã `ngo-ke://node/<id>` để xác nhận điểm; xem người kể 2D tạm và caption; hoặc chọn điểm bằng tay.
2. Bấm **Chọn chủ đề và xem gợi ý điểm**: chọn ẩm thực/chuyện xưa/khám phá tự do, chọn hoặc gõ khoảng thời gian, xem tối đa 3 điểm kèm lý do và thời lượng.
1b. Bấm **Bắt đầu nghe giới thiệu và hỏi đáp**: xem lời giới thiệu + nguồn, chọn chip câu hỏi hoặc gõ câu hỏi của bạn, đọc đáp án kèm nguồn và 1–2 câu hỏi tiếp. Gõ câu ngoài danh sách sẽ báo “Chưa có dữ liệu”.
2. Chuyển **Live**: báo “Live chưa được cấu hình”, không nạp hoặc tự đổi sang demo.
3. Màn nào còn placeholder: không còn; Q&A, chọn trải nghiệm, camera/người kể và GPS đều đã có tính năng. Kiểm tra Home hiện “Điểm hiện tại”.
4. Dùng Back native hoặc “Về Home”; mode đã chọn phải được giữ trong phiên. Mở lại app sẽ trở về Demo (chưa có persistence).
5. Kiểm tra notch/safe areas, màn nhỏ, xoay ngang và tăng cỡ chữ hệ thống; nội dung phải cuộn được, nút có phản hồi và không che thao tác.

Ảnh/runtime fixture mới nhất tại [checks.json](../agent_docs/evidence/phase-1/fixture-completion/checks.json) và [bàn giao Phase1](../agent_docs/phase_1_completion.md). Đã thử12 thao tác,4 kiểm tra font/landscape,5 kiểm tra khi tắt Wi-Fi/data sau nạp bundle; chưa offline cold start. Sau khi thử trên điện thoại thật, gửi model/OS/Expo Go/kết quả/ảnh; iOS chưa kiểm tra.

## Android Studio Windows + Metro trong WSL — đã chạy

SDK Windows hiện ở `D:\Dev\Android\Sdk` (WSL: `/mnt/d/Dev/Android/Sdk`), AVD `Medium_Phone`, Android17/API37. Đã cài Expo Go57.0.9 từ CLI chính thức `npx expo-go download android 57` vào emulator.

Nếu AVD chưa mở, chạy trong WSL:

```bash
"/mnt/d/Dev/Android/Sdk/emulator/emulator.exe" -avd Medium_Phone -port 5554 -no-snapshot-save
```

Trong terminal WSL khác (cwd `mobile/`), chạy Metro:

```bash
npm start -- --offline --port 8085 --go
```

Trong terminal thứ ba:

```bash
"/mnt/d/Dev/Android/Sdk/platform-tools/adb.exe" -P 5038 devices -l
hostname -I
```

Lấy IPv4 WSL từ `hostname -I`, rồi mở URL, ví dụ IP đã dùng trong phiên:

```bash
"/mnt/d/Dev/Android/Sdk/platform-tools/adb.exe" -P 5038 -s emulator-5554 shell am start -a android.intent.action.VIEW -d exp://172.28.197.254:8085 host.exp.exponent
```

Cổng ADB mặc định5037 hiện do O+Connect giữ bằng key tài khoản hệ thống và báo `unauthorized`; cổng5038 dùng đúng SDK/key người dùng, kết nối đạt. Nếu `devices -l` cổng5038 không thấy AVD sau boot, khởi động lại **chỉ server riêng5038**, rồi kiểm tra lại:

```bash
"/mnt/d/Dev/Android/Sdk/platform-tools/adb.exe" -P 5038 kill-server
"/mnt/d/Dev/Android/Sdk/platform-tools/adb.exe" -P 5038 start-server
"/mnt/d/Dev/Android/Sdk/platform-tools/adb.exe" -P 5038 devices -l
```

IP WSL có thể đổi sau restart. Windows localhost chưa tới Metro WSL ở môi trường này; dùng IP WSL trực tiếp đã đạt, không cần đổi firewall/portproxy hoặc dừng O+Connect. Lần đầu Expo Go có developer-menu onboarding; bấm Continue rồi đóng menu.

Đã thử Home fixture/Demo/Live,4 placeholder/Back, giữ mode trong navigation, cuộn đủ6 điểm, font1.5 và landscape. Phase 2: 13/13 ca trên emulator gồm giới thiệu, chip, đáp án có nguồn, hỏi tiếp, gõ tay alias, câu ngoài danh sách và xoá ô nhập sau khi hỏi. Phase 3: 13/13 ca gồm chip chủ đề/thời gian, nhắc khi thiếu lựa chọn, tối đa 3 điểm có lý do và thời lượng. Phase 4: 19/19 ca gồm camera tắt khi mở màn, xin quyền khi bấm nút, từ chối quyền vẫn chọn tay được, người kể + caption trên preview, và camera được trả về khi rời màn. **Quét QR thật chưa kiểm được trên emulator** vì máy ảo không nhận mã QR vào khung hình. Sau nạp bundle, tắt Wi-Fi/data vẫn xem được fixture/chuyển mode. Đổi font có thể tái tạo Activity/reset state về Demo; state chỉ trong bộ nhớ. Mạng/font/rotation đã khôi phục. Emulator/Metro giữ mở lúc bàn giao; cần mở lại sau reboot. Chưa thử điện thoại thật/offline cold start.

## Lệnh kiểm tra thật (cwd: `mobile/`)

```bash
npm test
npm run typecheck
npm run lint
npm run check:dependencies
npx expo config --type public --json
npx expo-doctor
npm run build:android
npm run build:ios
npm audit
```

`build:android`/`build:ios` chỉ **xuất JavaScript/Hermes bundle bằng Metro**, không tạo APK/IPA, store build hoặc deploy. Artifact ở `dist/` (gitignored). Test dùng Node built-in, chỉ kiểm tra ranh giới nguồn, không render UI/thiết bị.

Kết quả/log mới nhất ở [bàn giao Phase 6](../agent_docs/phase_6_review.md). Tests90/90, typecheck/lint/dependency/Doctor21/21 và export Android/iOS đạt. Emulator đạt 27/27 ca cho sáu trạng thái live và demo khi tắt máy chủ. Ở Phase 5, **nhánh candidate/outside-cluster GPS không kiểm được** vì máy ảo không cấp fix GPS. Audit03/10 còn23 cảnh báo (7 moderate,16 high); không dùng `--force` để downgrade Expo/RN. Chi tiết/giới hạn ở gói review.

## Fixture ban đầu và logic phase sau

`../data/demo.json` là fixture kỹ thuật duy nhất được đồng ý tạo mới. [Schema](../data/README.md): version1/kind simulated/disclaimer/sáu node kèm chủ đề, thời lượng, lời kể, caption và tọa độ mô phỏng; evidence bắt buộc cho mỗi câu trả lời. `src/data/sourceState.ts` kiểm shape và trả demo-ready/error, live-empty hoặc live-error; demo và live dùng chung một validator. Xóa file tĩnh làm bundling fail; dữ liệu bundle sai shape làm Home báo lỗi.

Metro dùng `metro.config.cjs` theo dõi riêng `../data`, không chép file vào mobile. Không có source cũ/`public/core.js` để tái dùng; logic và backend Node24/SQLite sẽ viết mới ở phase được duyệt. Phase1 chưa triển khai API/Q&A/recommendation/device. Chờ điện thoại thật/review G1 trước Phase2.

## Cấu trúc hiện có

```text
App.tsx                         # Shell, mode trong React state, native-stack
index.ts                        # Expo root registration
src/navigation.ts               # Route types + mô tả placeholder
src/theme.ts                    # Token trình bày tạm, font hệ thống
src/qa/match.ts                 # Normalize câu hỏi + khớp exact/alias/unknown
src/recommendation/pick.ts      # Chủ đề, quỹ thời gian, chọn tối đa 3 điểm
src/qr/parseQr.ts                # Đọc payload `ngo-ke://node/<id>`
src/qr/confirmPoint.ts           # QR → node đã biết, chọn tay
src/location/nearest.ts          # Haversine + chọn một candidate
src/data/sourceState.ts         # Validate dataset (intro/qa/evidence) + câu chữ trạng thái
src/data/live.ts                 # Adapter live: URL theo môi trường, timeout 8s, empty/error
src/screens/HomeScreen.tsx      # Home, source status, mode selector, links
src/screens/PlaceholderScreen.tsx
metro.config.cjs                # Một fixture ngoài project root, không copy
src/screens/QaScreen.tsx       # Giới thiệu, chip, nhập, đáp án + nguồn, hỏi tiếp
src/screens/PlanScreen.tsx      # Chủ đề, thời gian, gợi ý điểm
src/screens/CameraScreen.tsx     # Xin quyền, quét QR, người kể 2D, chọn tay
src/screens/LocationScreen.tsx    # Một lần đọc vị trí, candidate, xác nhận/chọn tay
tests/sourceState.test.mjs      # Validate dataset/demo-live
tests/qa.test.mjs               # Khớp câu hỏi + hợp đồng nội dung
tests/qaRegressions.test.mjs     # Hồi quy lỗi đã tìm trong review
tests/recommendation.test.mjs    # Luật chọn điểm Phase 3
tests/cameraQr.test.mjs           # Luật QR và chọn tay Phase 4
tests/location.test.mjs           # Luật candidate GPS Phase 5
tests/live.test.mjs               # Luật live: cấu hình, timeout, shape, không fallback
```

Icon/asset app do Expo scaffold tạo, chưa phải bộ nhận diện được nhóm UI duyệt. Scaffold cũng tự tạo Git local ở `mobile/.git` với initial commit; chưa có remote, push hoặc commit tính năng của agent.
