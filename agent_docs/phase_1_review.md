# Phase 1 Review — khung native Ngõ Kể

> **Báo cáo lịch sử của shell trước fixture.** Từ03/10/2026, người dùng đã chốt greenfield và sáu điểm mô phỏng; fixture/Home đã triển khai. Trạng thái/bằng chứng mới nhất: [phase_1_completion.md](phase_1_completion.md). Các mục “thiếu source/fixture” dưới đây mô tả lần bàn giao cũ, không yêu cầu người dùng tìm source.

**Ngày:** 02/10/2026. **Phase được phép:** 1, R1.01–R1.03. **Trạng thái bàn giao:** khung đã triển khai; **G1 chưa đạt đầy đủ**, chờ source/thiết bị và review. Chưa được phép Phase 2.

## Quyền thực hiện và điểm lệch bối cảnh

- Người dùng: “Tôi duyệt phase 0. Hãy triển khai phase 1 theo TECH_DEMO_PLAN.md, kiểm tra và bàn giao để tôi review.” Đồng thời yêu cầu kế hoạch ngắn rồi làm trong cùng lượt.
- Sau khi được báo thiếu source, người dùng chọn **“Dựng khung trước”**; chỉ cho phép khung + báo chặn, không tạo dữ liệu thay thế.
- PRD thực nằm tại `docs/PRO-NgoKe-MVP.md`, không phải đường dẫn `docs/PRD-NgoKe-MVP.md` trong yêu cầu. Dùng file tương ứng, không tự rename.
- Trạng thái Phase 0/chưa được code trong các bản nguồn là snapshot trước duyệt. Cập nhật AGENTS/MEMORY theo yêu cầu mới; giữ nguyên ba nguồn `docs/` bằng SHA-256. Không thay scope/thứ tự của plan.
- Source backend/SQLite, `public/core.js` và `data/demo.json` không có trong workspace hoặc thư mục `/home/desi/Project/TuanAnh` đã tìm. Không thể tái dùng hoặc khẳng định compatibility; chưa tạo backend/fixture/core giả.

## Bảng tiến độ đối chiếu code và bằng chứng

| Phase | Yêu cầu | Đã có trong code | Bằng chứng kiểm tra | Phần còn thiếu |
| --- | --- | --- | --- | --- |
| 0 | R0.01–R0.03; plan/luồng/kiến trúc | Không có code sản phẩm trước lượt này; tài liệu đã có | Người dùng duyệt rõ Phase 0; kiểm tra tài liệu lượt trước, nguồn giữ nguyên | Không còn blocker duyệt G0; source thực vẫn thiếu |
| 1 | R1.01–R1.03; shell/fixture/mode/native UI | `mobile/`, Expo Android/iOS, native-stack Home + 4 placeholder, safe-area/scroll/press semantics; mode demo/live | Test2/2, lint/TS/Doctor21/21, native exports; **Android emulator** Expo Go57.0.9:19/19 thao tác +5/5 layout cơ bản, có ảnh/XML | Fixture gốc và ≥1 điện thoại thật chưa thử, người dùng chưa chốt G1. **G1 chưa đạt** |
| 2 | R2.01–R2.04; intro/Q&A cố định | Chỉ tên/màn placeholder, không phải tính năng | Chưa kiểm tra; chưa duyệt | Nội dung/corpus/evidence/core và toàn bộ hành vi |
| 3 | R3.01–R3.03; chủ đề/thời gian/gợi ý | Chỉ placeholder | Chưa kiểm tra; chưa duyệt | Logic/source/expected result và toàn bộ hành vi |
| 4 | R4.01–R4.05; camera/QR/2D/caption | Chỉ placeholder, không camera dependency/quyền | Chưa kiểm tra; chưa duyệt | Registry/asset/device và toàn bộ hành vi |
| 5 | R5.01–R5.03; GPS/xác nhận | Chỉ placeholder, không location dependency/quyền | Chưa kiểm tra; chưa duyệt | Threshold/source khảo sát/device và toàn bộ hành vi |
| 6 | R6.01–R6.04; live API/dataset/handoff | Chỉ empty state của live chưa cấu hình, không adapter API | Chưa kiểm tra API; chưa duyệt | Backend/SQLite/endpoint/schema/dataset thật và toàn bộ tích hợp |
| 7 | R7.01–R7.03; fixture offline/E2E/handoff | Chưa có hành vi E2E | Chưa kiểm tra; chưa duyệt | Các phase core, thiết bị, log kịch bản đầy đủ |
| Voice riêng | RV.01–RV.03 | Không có | Chưa kiểm tra; chưa duyệt | Gate/connector/giọng và tích hợp riêng sau core |

## Thay đổi chính

- Tạo Expo blank TypeScript SDK57; React Navigation native-stack, safe-area/screen modules phiên bản Expo-compatible. Dùng React state/StyleSheet/font hệ thống; không thêm store/UI library.
- App hiển thị missing fixture ở demo và empty ở live, không có fetch hoặc chuyển mode khi lỗi. Chưa có ready dataset; không tuyên bố demo offline đã hoạt động.
- Màn placeholder điều hướng được nhưng không Q&A/recommendation/QR/camera/GPS/voice. Không thêm request permission hoặc API/backend.
- Thêm test source-state, lint/typecheck/export scripts, npm lockfile và README. Giữ mọi source/hướng dẫn cũ, chỉ cập nhật trạng thái vận hành ở tài liệu agent.
- Expo CLI tự tạo `mobile/.git`, initial commit `2a6376e`; không có remote/push/commit tính năng. Không tạo Git repo ở root hoặc worktree.

## Các lệnh và bằng chứng

Môi trường Linux, Node **24.19.0**, npm **11.17.0**. Cwd mọi lệnh bên dưới: `mobile/`. SDK/runtime dependencies thực: Expo57.0.26, React19.2.3, RN0.86.3, safe-area5.7.0, screens4.26.2.

| Lệnh | Kết quả |
| --- | --- |
| `npm ci` | Exit0, cài đúng lockfile; còn cảnh báo audit/uuid transitive |
| `npm test` | Exit0, 2/2 đạt; đã chạy RED trước GREEN, log giữ lại |
| `npm run typecheck` | Exit0 (`tsc --noEmit`) |
| `npm run lint` | Exit0 (`eslint .`) |
| `npm run check:dependencies` | Exit0, Dependencies are up to date |
| `npx expo config --type public --json` | Exit0, platform Android/iOS, SDK57, Android permissions `[]` |
| `npx --yes expo-doctor` | Exit0, 21/21 checks passed |
| `npm run build:android` | Exit0, Metro/Hermes export, 825 modules; **không phải Android runtime pass** |
| `npm run build:ios` | Exit0, Metro/Hermes export, 830 modules; **không phải iOS runtime pass** |
| `npm start -- --offline --port 8085 --go` | Local smoke: packager running, nhận manifest Android và dev JS bundle4,578,505 bytes; server đã dừng; chưa mở bằng điện thoại |
| `npm ls --depth=0` | Exit0, dependency tree hợp lệ |
| `npm audit` | Exit1, **12 cảnh báo: 8 moderate, 4 high**; chưa khắc phục hết |
| `npm audit fix --dry-run --json` | Exit1; không có đường sửa toàn bộ tương thích SDK57; không áp dụng force/downgrade |

Log đầy đủ và exit codes: [checks.json](evidence/phase-1/checks.json), thư mục `agent_docs/evidence/phase-1/`. Các log build có cảnh báo NO_COLOR/FORCE_COLOR từ môi trường harness, không làm build fail. Không gọi các log này là kiểm tra thiết bị.

### Lỗi tooling đã xử lý và giới hạn còn lại

- `eslint-config-expo` đưa vào plugin peer chỉ hỗ trợ ESLint9, bản9 báo deprecated; dùng ESLint10 + typescript-eslint flat config tối thiểu. Đã kiểm tra lại peer tree, lint và typecheck, không dùng peer override/force ở cấu hình cuối.
- Lệnh thử `--offline --localhost` bị CLI từ chối do hai host flags; sửa thành chỉ `--offline`, smoke test đạt. Log lần lỗi giữ để đối chiếu; hướng dẫn mở dùng lệnh đã xác minh.
- Audit còn chuỗi Expo CLI/config/node-forge/uuid/xcode; báo cáo gợi ý major downgrade về Expo44.0.6, không phù hợp scaffold57. Không tự ép override transitive hoặc downgrade SDK; cần xử lý tương thích upstream trước bất kỳ bàn giao production nào. Bản này chỉ khung local, không có deploy.

## Chưa kiểm tra / chưa triển khai

- Điện thoại Android thật/iPhone, screen reader, nhiều kích thước/notch: **chưa kiểm tra**. Android emulator hiện đã thử Expo Go/navigation/Back/cuộn/font1.5/xoay ngang, có ảnh; xem bổ sung bên dưới.
- Import thật `public/core.js` bằng Metro/RN runtime: **bị chặn, chưa kiểm tra**. Bundle shell không chứng minh core dùng được.
- Bundling `data/demo.json`, khởi chạy Home bằng fixture và demo không mạng trên điện thoại: **bị chặn, chưa kiểm tra**.
- Luồng chọn/xác nhận điểm → câu chuyện/caption → Q&A; quyền camera/GPS bị từ chối; live API lỗi/rỗng/sai shape: **chưa triển khai, thuộc phase sau chưa được duyệt**. Live empty hiện tại không chứng minh error/timeout/shape handling Phase6.
- Backend/query SQLite/secret backend: source không có và không thay đổi backend; **chưa kiểm tra**. Không giả định schema/endpoint hoặc thêm credential.

## Cách mở và review

Làm theo [mobile/README.md](../mobile/README.md): `cd mobile`, `npm ci`, `npm start -- --go`, mở Expo Go/QR. Review mode, placeholder/back, safe areas/touch/font và gửi thiết bị/kết quả/ảnh.

**Để hoàn tất G1:** cung cấp source gốc (fixture/core/backend), hoàn thiện fixture Home và kiểm chứng file thật trong Phase1; thử ít nhất một Android hoặc iPhone và review cấu trúc/trình bày. Chưa bắt đầu Phase2; chưa kết luận MVP hoàn thành.

## Ledger thực hiện

- Task1: scaffold + source boundary thực hiện; RED2/2 fail vì chưa có implementation → GREEN2/2. Fixture thật vẫn blocked.
- Task2: native shell/navigation/safe areas thực hiện; lint/typecheck và hai native bundles đạt. Bổ sung runtime Android emulator sau khi người dùng nhắc môi trường Windows; điện thoại thật/iOS chưa thử.
- Task3: kiểm tra/handoff đã ghi bằng chứng; gate chưa đạt đủ vì fixture và thiết bị thiếu. Test2/2, lint/typecheck và hai native bundle được chạy lại sau sửa header.
- Ruling: dựng shell không fixture theo lựa chọn rõ ràng của người dùng; không dựng dataset giả. Chi phí nếu tiếp tục thiếu source: G1 không thể nghiệm thu và Phase2 vẫn dừng.
- Ruling: dùng lint config tối thiểu để giữ ESLint10 và tránh Expo config peer9 deprecated. Chi phí: chưa có React-specific lint rules; lint/TS/runtime-device checklist vẫn phải theo dõi.
- Ruling: giữ Git local do CLI tự tạo; không xóa metadata hoặc push. Chi phí: người dùng cần chọn tổ chức repo root/mobile khi chuẩn bị version control toàn dự án.
- Review độc lập code: không có Critical/Important; tìm thấy một nhãn header “Demo” cố định khi đang Live. Đã đổi header thành “Ngõ Kể” trung tính; selector và trạng thái nguồn giữ nhãn mode thực tế. Đây là sửa copy nhỏ, không thêm test dò chuỗi UI; lint/typecheck/test/bundle sau chỉnh đều đạt. Không có finding code còn mở; giới hạn source/thiết bị và audit vẫn giữ nguyên.

## Bổ sung sau phản hồi “anh có môi trường android studio”

Lượt đầu chỉ tìm `adb`/`emulator` Linux trên PATH nên bỏ sót SDK Windows. Đã xác minh và chạy lại bằng WSL interop; không sửa code sản phẩm hoặc mở phase mới.

- **SDK:** `D:\Dev\Android\Sdk`; **AVD:** Medium_Phone, model sdk_gphone16k_x86_64, Android17/API37, màn1080×2400/density420; **Expo Go:**57.0.9.
- Khởi động AVD bằng `emulator.exe -avd Medium_Phone -port 5554 -no-snapshot-save`; boot hoàn tất.
- ADB mặc định bị O+Connect chiếm, key systemprofile → unauthorized. `adb.exe -P 5038` khởi động server SDK với key người dùng → emulator-5554 **device**. Không dừng O+Connect hoặc đổi key.
- `npx expo-go download android 57` tải APK chính thức; `adb.exe -P 5038 -s emulator-5554 install <APK>` → Success.
- Metro WSL `npm start -- --offline --port 8085 --go`; Windows localhost không tới được WSL nên lần mở `exp://127.0.0.1:8085` báo Failed to download remote update. Mở bằng **`exp://172.28.197.254:8085`** → app chạy. IP phiên hiện tại, không hardcode trong app.
- **19/19 kiểm tra thao tác đạt:** Home thiếu fixture, Live empty/selected, mở 4 placeholder, rõ nhãn chưa triển khai, quay Home bằng Back hoặc nút, giữ Live sau navigation.
- **5/5 kiểm tra layout cơ bản đạt:** font scale1.5 có controls/status và cuộn tới placeholder; landscape có controls và cuộn tới placeholder. Đã xem ảnh Home; đây là smoke test một cấu hình emulator, không phải audit accessibility toàn diện.
- Khi đổi font hệ thống Activity tái tạo, mode reset về Demo đúng giới hạn state-in-memory; chọn Live lại để thử. Lượt capture đầu rơi vào splash, đã chờ Home sẵn sàng và kiểm tra lại. Font/rotation đã khôi phục.
- Không thấy FATAL EXCEPTION/ReactNativeJS Error/TypeError trong1500 dòng logcat gần nhất lúc lấy mẫu; không coi đó là bảo đảm toàn phiên không có lỗi.
- Emulator và Metro được giữ mở để anh review. ADB reverse8085 dùng ở lần thử localhost đã gỡ; app dùng IP WSL trực tiếp.

Bằng chứng: [runtime-summary.json](evidence/phase-1/android-emulator/runtime-summary.json), [Home Demo](evidence/phase-1/android-emulator/home-demo.png), [Home Live](evidence/phase-1/android-emulator/home-live.png), [Camera placeholder](evidence/phase-1/android-emulator/placeholder-camera.png), XML + interaction/layout checks cùng thư mục. Hướng dẫn mở Windows/WSL cập nhật trong README. **G1 vẫn thiếu fixture, điện thoại thật và duyệt người dùng; emulator không thay điều kiện điện thoại của plan.**
