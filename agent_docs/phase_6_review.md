# Phase 6 — Live gọi API, tách demo/live và handoff: bàn giao

**Ngày:** 03/10/2026. **Phạm vi:** R6.01–R6.04. **Trạng thái:** code trong phạm vi đã triển khai và kiểm chứng trên emulator với máy chủ kiểm chứng cục bộ; **người dùng cần duyệt câu chữ trạng thái và cách cấu hình URL trước khi gắn backend thật (G6)**. Phase 7/voice chưa được phép.

## Quyền thực hiện và quy tắc đã chốt

- Người dùng duyệt Phase 5 và yêu cầu triển khai Phase 6.
- Người dùng chốt: **timeout 8 giây**; **URL live từ `EXPO_PUBLIC_NGOKE_API_BASE_URL`, dự phòng `app.json → expo.extra.apiBaseUrl`**; **adapter + máy chủ kiểm chứng cục bộ**, không dựng backend production.
- Spec: [`2026-10-03-phase-6-live-api-design.md`](../docs/superpowers/specs/2026-10-03-phase-6-live-api-design.md).

## Thay đổi

| File | Nội dung |
| --- | --- |
| `mobile/src/data/live.ts` (mới) | `readLiveConfig` và `loadLiveSource`: timeout 8 giây bằng `AbortController`, phân loại `no-config` / `no-data` / `shape` / `http` / `network` / `timeout`. Không có đường dẫn nào fallback sang fixture. |
| `mobile/src/data/sourceState.ts` | Tách `parseDataset` để **demo và live dùng chung một quy tắc shape**; thêm `liveEmpty` / `liveError` và bảng câu chữ trạng thái. |
| `mobile/App.tsx` | `useEffect` nạp live khi `mode === 'live'`; nút “Thử lại”; URL đọc từ biến môi trường, dự phòng `app.json`. |
| `mobile/src/screens/HomeScreen.tsx` | Nhãn trạng thái live thật (`đang tải` / `trống` / `lỗi` / `dữ liệu đã duyệt`) và nút “Thử lại”. |
| `mobile/app.json`, `mobile/tsconfig.json` | `expo.extra.apiBaseUrl`; bật `resolveJsonModule` để đọc cấu hình mà không thêm dependency. |
| `tools/mock-api/server.mjs` (mới) | Máy chủ kiểm chứng cục bộ, chọn ca bằng tiền tố URL: `/api/dataset`, `/empty/api/dataset`, `/broken/api/dataset`, `/server-error/api/dataset`, `/hang/api/dataset`. **Không phải backend.** |
| `mobile/tests/live.test.mjs` (mới) | 9 ca: thứ tự cấu hình, payload hợp lệ, không cấu hình, rỗng/404, sai shape/mất nguồn, HTTP 500, lỗi mạng, timeout có abort thật, timeout mặc định 8000, demo không cần mạng. |
| `docs/HANDOFF_DATA.md`, `docs/HANDOFF_UI.md` (mới) | Handoff cho nhóm data và nhóm UI, kèm danh sách file **không được sửa** và checklist trước khi gửi. |

Không thêm dependency, không có API key, không deploy, không nhập dữ liệu chưa được duyệt.

## Kiểm tra thật

Node **24.19.0**, npm **11.17.0**; cwd `mobile/`.

| Lệnh / thao tác | Kết quả |
| --- | --- |
| `npm test` | **90/90 đạt** (81 ca cũ + 9 ca Phase 6) |
| `npm run typecheck` | Exit 0 |
| `npm run lint` | Exit 0 |
| `npm run check:dependencies` | Exit 0 |
| `npx --yes expo-doctor` | Exit 0, **21/21 đạt** |
| `npm run build:android` / `build:ios` | Exit 0 (xuất bundle, không phải runtime pass) |
| `npm audit --json` | Exit 1, **23 cảnh báo: 7 moderate, 16 high** (không đổi) |
| Android emulator Medium_Phone, Android 17/API 37, Expo Go 57.0.9 | **27/27 ca đạt** |

### 27 ca trên emulator

| Tình huống | Kết quả hiện |
| --- | --- |
| Live, **không có URL** | `Live chưa được cấu hình` (empty), không hiện điểm demo |
| Live, máy chủ trả **rỗng** | `Live chưa có dữ liệu` (empty) |
| Live, **mất nguồn** ở một câu | `Dữ liệu live không đúng định dạng` (error) + nút “Thử lại” |
| Live, **HTTP 500** | `Máy chủ live trả lỗi` (error) |
| Live, máy chủ **không phản hồi** | `Máy chủ live phản hồi quá chậm` sau ~8 giây (error) |
| Live, payload hợp lệ | `LIVE · dữ liệu đã duyệt`, `6 điểm`, mở được màn Q&A |
| **Tắt máy chủ**, chuyển Demo | Demo vẫn nạp 6 điểm từ bundle và mở được Q&A |

Mọi ca live đều xác nhận `mode` vẫn là live và **không** xuất hiện điểm demo.

Ảnh: [không cấu hình](evidence/phase-6/live-no-config.png) · [rỗng](evidence/phase-6/live-empty.png) · [sai định dạng](evidence/phase-6/live-broken.png) · [HTTP lỗi](evidence/phase-6/live-server-error.png) · [timeout](evidence/phase-6/live-hang.png) · [có dữ liệu](evidence/phase-6/live-ready.png) · [Q&A với live](evidence/phase-6/live-ready-qa.png) · [demo tắt server](evidence/phase-6/demo-without-server.png). Lệnh/exit: [checks.json](evidence/phase-6/checks.json), [interaction-checks.json](evidence/phase-6/interaction-checks.json).

## Lỗi tìm được trong lúc làm

- Adapter báo `network` khi body không phải JSON — sai lý do; đã tách phần đọc JSON để báo `shape`.
- Timeout nhận diện bằng tên lỗi (`AbortError`) nên dễ trượt; đã nhận diện bằng trạng thái `signal.aborted` của chính mình, đáng tin hơn tên lỗi.
- Máy chủ kiểm chứng ban đầu dùng path khác nhau, trong khi adapter luôn gọi `{base}/api/dataset`; đã đổi sang chọn ca bằng tiền tố URL.
- Script kiểm tra bấm nút Home khi node chưa nằm trọn trong vùng nhìn (bounds đảo) nên báo fail giả; và khi node không có trong cây accessibility thì vòng lặp không cuộn. Đã sửa script, cuộn đúng hướng và kiểm lại — **không sửa app**.
- Cần import `app.json` trong app nhưng TypeScript không tự cho: bật `resolveJsonModule` thay vì thêm dependency chỉ để đọc cấu hình.

## Ranh giới

- **Không có backend thật trong repo.** Máy chủ kiểm chứng dùng dữ liệu mô phỏng, không phải bản ghi thật.
- Live chỉ đọc `GET {base}/api/dataset`; không có endpoint khác, không có đăng nhập, không có API key.
- Không có offline cache hay queue thuộc Phase 7.
- Chưa kiểm trên iOS hay điện thoại thật.

---

## Việc cần anh quyết

1. **Câu chữ 6 trạng thái live** — anh duyệt để gửi nhóm data và đội backend, đặc biệt `Máy chủ live phản hồi quá chậm` và `Dữ liệu live không đúng định dạng`.
2. **Đường dẫn cố định `/api/dataset`** — có đúng với backend dự kiến không, hay nhóm backend sẽ đặt tên khác (đổi được ở `DATASET_PATH` trong `mobile/src/data/live.ts`).
3. **Có nên thêm header hay token khi live không?** Hiện adapter gửi request trần; nếu backend cần `Authorization` thì cần anh quyết cách lưu và không ghi vào repo.
4. **Số lượng 6 điểm** — validator đang **bắt buộc đúng 6** (giữ nguyên từ Phase 1). Nếu dữ liệu thật nhiều hơn, cần mở phạm vi và duyệt lại màn hình.
5. **`expo.extra.apiBaseUrl` đang để rỗng** trong `app.json` để live mặc định là `empty`. Anh muốn điền sẵn URL môi trường phát triển vào file, hay chỉ dùng biến môi trường?

## Việc anh tự làm

1. **Cung cấp URL backend thật** (hoặc URL của đội backend) để chạy live với dữ liệu đã duyệt. `[ngoài plan]` — plan viết “endpoint đang có” nhưng workspace không có backend; hệ quả nếu chưa làm: nhánh `ready` mới chỉ được kiểm với máy chủ kiểm chứng, dữ liệu thật chưa từng chạy trong app.
2. **Gửi `docs/HANDOFF_DATA.md` cho nhóm data** và duyệt dữ liệu trước khi nhập. `[ngoài plan]` — R6.04 yêu cầu handoff nhưng không chỉ định người nhận; hệ quả nếu chưa làm: nhóm thay dữ liệu mà không có bộ quy tắc shape/nguồn, app sẽ từ chối dữ liệu sai hoặc hiện nội dung thiếu nguồn.
3. **Gửi `docs/HANDOFF_UI.md` cho nhóm UI** để thay giao diện mà không đụng logic lõi. `[ngoài plan]`; hệ quả nếu chưa làm: UI hi-fi có thể sửa nhầm logic đã có test, làm hỏng ranh giới demo/live.
4. **Xác nhận ngưỡng 8 giây** khi biết độ trễ thật của backend. `[ngoài plan]` — ngưỡng đã chốt để dựng phase này, không nằm trong plan; hệ quả nếu không xác nhận: có thể giữ ngưỡng không phù hợp với backend thật.