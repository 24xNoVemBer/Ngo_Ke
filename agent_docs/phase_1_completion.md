# Phase 1 — bàn giao Home fixture và khung native

**Cập nhật:** 03/10/2026. **Trạng thái:** code Phase1 trong phạm vi đã duyệt đã triển khai và kiểm tra trên Android emulator; **G1 chờ điện thoại thật và người dùng review**. Không bắt đầu Phase2.

## Phạm vi và bằng chứng duyệt

Người dùng xác nhận dự án mới từ đầu, đồng ý sáu điểm mô phỏng và yêu cầu “anh đồng ý hoàn thiện phase 1 đi”, sau đó “tiếp tục”. Không chờ source cũ. Giữ Expo/React Native và stack Node24/JSON API/SQLite cho phase backend; không xây backend/core thuật toán của phase sau trong lượt này.

## Thay đổi

- `data/demo.json`: fixture ban đầu duy nhất; sáu “Điểm demo 01–06”, ID duy nhất, nhãn mô phỏng. Không chuyện lịch sử/Q&A/evidence/tọa độ/ETA.
- `mobile/src/data/sourceState.ts`: nhận `unknown`, kiểm tra version/kind/disclaimer/số lượng/node/ID trùng. Demo hợp lệ → ready; đầu vào thiếu/sai → error không dataset. Live chưa cấu hình → empty không dataset, không request/fallback.
- `mobile/App.tsx`: static import JSON ngoài root mobile. `HomeScreen.tsx`: thông báo nguồn/count/disclaimer và sáu dòng điểm **chỉ khi demo-ready**; không hành vi chọn/xác nhận điểm.
- `mobile/metro.config.cjs`: thêm đúng thư mục `../data` vào watchFolders sau lỗi resolve thực. Không chép fixture/thuật toán.
- `mobile/eslint.config.mjs`: lint CJS config với Node globals; không tắt rule để che lỗi.
- Tests, README, MEMORY/AGENTS/checklist/spec/plan cập nhật theo greenfield. Không đổi dependency/lockfile hoặc thêm API/device/voice behavior.

## Kiểm tra thật

Môi trường Node24.19.0/npm11.17.0; cwd `mobile/`. Expo57.0.26, RN0.86.3, React19.2.3.

| Lệnh / thao tác | Kết quả |
| --- | --- |
| `npm test` | **20/20 đạt** (6 test cấp trên và14 ca dữ liệu lỗi); RED trước GREEN được lưu |
| `npm run typecheck` | Exit0 |
| `npm run lint` | Exit0, gồm CJS Metro config |
| `npm run check:dependencies` | Exit0 |
| `npx --yes expo-doctor` | Exit0, **21/21 đạt** |
| `npm run build:android` | Exit0, Metro/Hermes export826 modules; không APK/runtime proof |
| `npm run build:ios` | Exit0, Metro/Hermes export831 modules; không IPA/iOS runtime proof |
| Emulator Medium_Phone, Android17/API37, Expo Go57.0.9 | **12/12 thao tác đạt:** thấy đủ6 tên bằng cuộn, nhãn/count, live không point rows, mở4 placeholder và Back/“Về Home” giữ live, quay demo nạp lại |
| Tắt Wi-Fi/data emulator sau khi tải bundle | **5/5 đạt**: Wi-Fi disabled/routes rỗng, Home vẫn ready, chuyển live không demo, quay demo và thấy6 điểm. **Không chứng minh offline cold start** |
| Font1.5 và landscape | **4/4 đạt**: count và đủ6 tên có thể cuộn tới. Settings mạng/font/rotation đều khôi phục |
| `npm audit --json` | Exit1, **23 cảnh báo:7 moderate/16 high**, chưa khắc phục hết |
| `npm audit fix --dry-run --json` | Exit1; không áp dụng downgrade Expo44/RN0.72 hoặc force/override |

Code review độc lập không có Critical/Important/Minor; reviewer chạy lại `npm test` exit0. [checks.json](evidence/phase-1/fixture-completion/checks.json) chứa log/exit/runtime details; [Home](evidence/phase-1/fixture-completion/home-demo.png), [Live](evidence/phase-1/fixture-completion/home-live.png), [chữ lớn](evidence/phase-1/fixture-completion/font15-list.png), [offline](evidence/phase-1/fixture-completion/offline-home.png).

## Lỗi gặp và đã xử lý

- Test RED2 lỗi dự kiến: adapter cũ chưa có ready, fixture chưa tạo. Tests ranh giới lỗi còn giữ nguyên; mở rộng đúng hành vi được duyệt.
- Lint test báo `URL` chưa khai báo → import `URL` từ `node:url`.
- Metro không resolve JSON ngoài project root → watchFolders riêng `data/`; hai export + native runtime đọc thật đã đạt.
- Sau gián đoạn qua ngày, Metro/emulator cũ đã dừng. Khởi động lại AVD và chỉ server ADB5038 của SDK **sau khi emulator mở** để quét lại thiết bị. Không dừng ADB5037/O+Connect.
- Lượt tự động đầu kiểm tra Home lúc đang cuộn và fast swipe bỏ qua điểm01; chỉnh thao tác chờ/scroll-to-top/slow swipe rồi xác nhận đủ6. Không sửa code/expected để che lỗi.

## Giới hạn và review

- **Chưa kiểm tra:** điện thoại Android thật/iPhone, iOS runtime, offline khởi chạy từ đóng app, screen reader/multiple devices. Simulator/emulator không tự thay điều kiện ≥1 điện thoại trong G1.
- Thiếu hoàn thiện audit dependency; không gọi audit xanh. Package/lockfile không đổi nên số23 phản ánh kết quả audit mới nhất, không phải23 lỗi sản phẩm đã được chứng minh.
- Fixture tĩnh bị xóa hoàn toàn → bundling thất bại, không phải runtime fallback; test thiếu input kiểm tra ranh giới adapter. Fixture được bundle nhưng sai shape → demo error.
- Phase2–7/voice chưa được duyệt/triển khai. Core mới/API/SQLite sẽ thiết kế khi đến phase cần; không có `public/core.js` cũ để tái dùng.

**Anh review:** sáu điểm mô phỏng/count/nguồn có rõ, demo/live tách biệt, cấu trúc navigation và chữ/nút/cuộn phù hợp. [Cách mở](../mobile/README.md) có Windows/WSL/emulator steps. Emulator/Metro giữ mở tại thời điểm bàn giao; không bảo đảm process tồn tại sau reboot.

**Dừng ở Phase1.** G1 chưa được tự ghi đạt; cần bằng chứng điện thoại thật và người dùng duyệt trước Phase2. [Báo cáo shell trước fixture](phase_1_review.md) là lịch sử, không phải trạng thái hiện hành.
