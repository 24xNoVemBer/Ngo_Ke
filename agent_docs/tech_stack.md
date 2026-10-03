# Tech Stack — Ngõ Kể

> Nguồn: [Tech Design](../docs/TechDesign-NgoKe-MVP.md) mục Tech Stack Decision, Project Structure, Data/API Contracts, Testing Strategy & Commands. Phân biệt quyết định theo plan, đề xuất để review và phần chưa xác minh.

**Cập nhật03/10 Phase1:** greenfield được xác nhận; fixture6 điểm mô phỏng đã được đồng ý và Home bundled/native emulator/offline sau nạp bundle đã thử. Không có source cũ phải cung cấp. Chi tiết: [phase_1_completion.md](phase_1_completion.md).

## Stack và trạng thái

| Thành phần | Theo nguồn | Chưa xác định / điều kiện |
| --- | --- | --- |
| Frontend | Expo57.0.26, React19.2.3, React Native0.86.3; TypeScript6.0.3 strict; npm lockfile | Node24.19.0/npm11.17.0; emulator Android17/API37 +Expo Go57.0.9 đã thử; điện thoại thật/iOS chưa thử |
| Navigation/UI/state | React Navigation native7.5.0/native-stack7.20.0; React state, StyleSheet, font hệ thống, safe-area5.7.0/screens4.26.2 | State trong phiên, không persistence; native layout/Back cần điện thoại |
| Backend | Node24 +JSON API sẽ viết mới ở Phase6 | Phase6 chưa duyệt; chưa chốt route/schema/framework |
| Database | SQLite phía backend | File/bảng/cột/index/ORM/migration chưa xác minh; không đặt schema hoặc API ghi mobile |
| Shared core | Logic mới cho phase cần dùng, một nguồn thuật toán | Không có core cũ; chốt module khi duyệt phase2/3/5, không dựngweb preview để khớp đường dẫn |
| Demo | `data/demo.json` mới: schemaVersion1/kind simulated/disclaimer/6 nodeID+tên; bundled | Type guard/tests/Android runtime/hai export đã thử; Metro watchFolders chỉ `../data`; không evidence/tọa độ/ETA |
| Live | API hiện có, URL theo môi trường, record thật đã review | Method/path/auth/payload/timeout và dataset thật chưa biết |
| Camera/GPS | `expo-camera`, `expo-location` theo thao tác | Tương thích SDK/quyền/thiết bị cần kiểm chứng ở Phase 4–5 |
| Deployment | Deliverable là demo native qua Expo Go | Host backend, tunnel, store/provisioning chưa xác định; deploy cần yêu cầu riêng |
| Coding assistant | OpenCode trong phiên hiện tại | Không thay cấu hình model/provider toàn cục; trình độ người dùng chưa xác định |
| Product AI | Không LLM/agent trong core | Không có API key/provider/eval LLM cần setup; voice là phase riêng |

**Ngân sách/deadline:** chưa xác định. Không tự chọn dịch vụ trả phí hoặc chi phí vận hành. Voice provider/cost ceiling/mạng/microphone/retention/thiết bị hỗ trợ chờ lựa chọn và review riêng; luôn giữ chữ.

## Lệnh chính xác — Phase 1, cwd `mobile/`

| Mục | Command / cwd | Khi xác minh |
| --- | --- | --- |
| Setup | `npm ci` | Đã chạy từ lockfile; audit còn cảnh báo |
| Dev | `npm start -- --go`; smoke `npm start -- --offline --port 8085 --go` | Smoke Metro/manifest/dev bundle đã chạy; chưa điện thoại |
| Expo dependency/config check | `npm run check:dependencies`; `npx expo config --type public --json`; `npx expo-doctor` | Đạt; Doctor21/21 |
| Lint/format | `npm run lint`; chưa chọn formatter | ESLint10/typescript-eslint đạt; không cài Expo lint config peer9 |
| Typecheck | `npm run typecheck` | `tsc --noEmit` đạt |
| Test | `npm test` | Node built-in,20 checks đạt,14 input lỗi; runtime emulator riêng |
| Build/Metro từng platform | `npm run build:android`; `npm run build:ios` | Shell export đạt; **core/fixture thật chưa kiểm tra** |
| Native runtime/device | Emulator Windows: `adb.exe -P 5038 -s emulator-5554 shell am start -a android.intent.action.VIEW -d exp://<WSL-IP>:8085 host.exp.exponent` | Emulator Android shell đạt; SDK `/mnt/d/Dev/Android/Sdk`; điện thoại thật/iOS chưa kiểm tra |
| Browser | Chưa xác định; preview chỉ đối chiếu | Khi có preview thật, không thay native check |
| AI eval | Không áp dụng cho core | Voice kiểm tra hành vi sau GV |

Các command theo package/README/testing. Build chỉ Metro/Hermes, không APK/IPA/deploy. Audit03/10 còn23 cảnh báo7 moderate/16 high, không downgrade/override. Bản fixture emulator12 thao tác/4 layout/5 offline đã đạt; điện thoại thật/iOS/cold start chưa thử.

## Cấu trúc đích theo Tech Design

Đây là layout đích, không phải yêu cầu tạo đồng loạt. Phase 1 hiện chỉ có App/index, screens, source-state, navigation/theme và tests; tree thực tế ở README. Controllers/core/device/config của phase sau chưa tạo.

```text
mobile/                  # Phase 1 sau duyệt rõ ràng
├── src/
│   ├── screens/         # Skeleton 1; hành vi 2–6
│   ├── components/      # UI demo dùng lại, 1–6
│   ├── state/           # Session/transitions, 1–6
│   ├── controllers/     # Điều phối Q&A/gợi ý/xác nhận, 2–6
│   ├── data/            # Demo adapter 1; live adapter 6, không bản sao fixture
│   ├── core/            # Bridge trước lần dùng 2–6, sau gate kiểm chứng
│   ├── device/          # Camera/QR/GPS, 4–5
│   └── config/          # Mode/backend, 1/6; không secrets server
├── assets/              # Placeholder 2D, 4
├── tests/               # Logic/adapter/controller, 2–7; runner chưa chọn
└── README.md            # Lệnh mở 1; hoàn thiện 7
```

`data/demo.json` đã có mới, được người dùng duyệt mô phỏng. Core/backend/SQLite không có source cũ, viết mới theo phase; Phase1 không tạo server/DB/endpoint/thuật toán phase sau.

## Hợp đồng và gate kỹ thuật

- **Demo/live:** source riêng; live thiếu URL/dataset/rỗng hợp lệ → empty; network/API/timeout/parse/shape lỗi → error. Mode giữ live; đổi sang demo chỉ do thao tác chủ động. Lỗi fixture là lỗi demo, không tải API để che.
- **Core:** sau duyệt, đọc exports/dependencies/side effects, kiểm tra path/SDK/Metro, resolve file gốc, bundle và chạy exports thực trên RN với expected result đã review. So sánh platform riêng; Node import/web pass không đủ. Thất bại → báo bằng chứng và review phương án tối thiểu, không chép thuật toán.
- **Data/API:** schema và field thật chưa biết; adapter ánh xạ/validate tại biên. Đọc route/query/schema thật ở Phase 6, ghi method/path/input/output/empty/error/timeout/nguồn; chỉ tích hợp record đã review.
- **QR/GPS:** QR chỉ resolve node đã biết trong dataset đang dùng; QR lạ không mở URL. GPS candidate khác confirmed node; ngưỡng accuracy/khoảng cách chưa xác định. Manual demo phải ghi mô phỏng; tọa độ phải khảo sát trước thực địa.
- **Handoff:** Phase 6 hướng dẫn B/C thay data/UI không đổi logic; Phase 7 README và seam API/data/voice cho A/B/C. UI hi-fi hoặc dữ liệu thật phải review trước đưa vào code.

Các phương án navigation/context/store/extract core trong Tech Design là lựa chọn để review, không phải dependencies đã chọn. Các nguồn Expo được Tech Design dẫn ngày 02/10/2026; ở phase triển khai tra lại tài liệu đúng SDK và kiểm chứng project, không suy tương thích từ bản thiết lập này.
