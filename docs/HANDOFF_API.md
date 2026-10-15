# Handoff API — Ngõ Kể

> **Hợp đồng thực hiện 16/10/2026:** [spec Phase7.1/8](PHASE_7_1_8_EXECUTION_SPEC.md#hợp-đồng-live-cuối-cho-đợt-này) thay các quy tắc lịch sử bên dưới về parser dùng chung demo/live, nhãn “đã duyệt”, node count và 200 rỗng. Giữ GET dataset và deadline8s; live mở 1..50 node với simulated/reviewed, reviewed cần metadata approved/updatedAt từng record; empty canonical404, 200 rỗng/sai envelope là error. Phase8 được người dùng cho phép chạy xuyên suốt, backend đang được triển khai, chưa phải đã nghiệm thu. Không API chat/LLM hoặc fallback demo.

**Quyết định 03/10/2026 của người dùng:** backend **do dự án tự viết** (Node 24 + JSON API + SQLite theo plan), không chờ đội ngoài. Dữ liệu MVP là **dữ liệu mô phỏng do dự án sinh**; khi nào có dữ liệu thật thì thay sau, không chặn MVP.

**Trạng thái16/10/2026:** backend đã triển khai ở `valentino/backend-luna` (backend commit2963fb8, shared parser tích hợp tại c1b65fc); nhánh tích hợp d49b550 có app/backend/guard. Coordinator đã kiểm197 app/17 backend/33 guard tests đạt; W4 đang review/HTTP/native E2E, **chưa tuyên bố nghiệm thu**. Backend không npm dependencies hoặc route chat/LLM. Phase6/mock server là lịch sử kiểm adapter.

## Kết nối phía app

| Mục | Giá trị hiện tại | Ghi chú |
| --- | --- | --- |
| Đường dẫn | `GET {base}/api/dataset` | Hằng số `DATASET_PATH` trong `mobile/src/data/live.ts` |
| URL theo môi trường | `EXPO_PUBLIC_NGOKE_API_BASE_URL`, dự phòng `app.json → expo.extra.apiBaseUrl` | Không có URL → `empty` |
| Timeout | **8 giây** | Quá giờ → `error` |
| Xác thực | **Chưa dùng** | Không có API key, không `Authorization` |
| Kiểm dữ liệu | `parseDataset(value, { mode: 'live' })` trong `mobile/src/data/sourceState.ts` | Chung kiểm field/reference; demo đúng6/simulated, live1..50/simulated hoặc reviewed |

## Hợp đồng response

`200` với envelope schemaVersion1: `kind`, `disclaimer`, `intro`, `startNodeId`, `nodes[]`, `qa[]`. Live không rỗng, tối đa50 node/200QA; body UTF-8 tối đa512KiB. Các trần field và deadline/cancellation tại spec hiện hành. Reviewed yêu cầu metadata approved/updatedAt hợp lệ trên intro/mỗi node/mỗi QA; simulated luôn được ghi là mô phỏng/chưa xác minh, không suy duyệt từ shape.

Mọi câu trả lời phải có `evidence` không rỗng; app **từ chối hiển thị** payload thiếu nguồn hoặc sai shape.

| Mã | Khi nào | App hiện |
| --- | --- | --- |
| `200` hợp lệ | có dữ liệu | Nhãn theo simulated/reviewed đã được validator kiểm |
| `404` | chưa có dataset công bố | `Live chưa có dữ liệu` |
| `200` rỗng/sai shape | nodes:[], thiếu nguồn/metadata hoặc sai schema/reference | `Dữ liệu live không đúng định dạng` |
| `5xx` | máy chủ lỗi | `Máy chủ live trả lỗi` |

Live **không bao giờ** fallback sang `data/demo.json`. Đây là ranh giới an toàn, có test chặn.

## Máy chủ kiểm chứng tạm

`tools/mock-api/server.mjs` phục vụ kiểm tra từng trạng thái:

```bash
node tools/mock-api/server.mjs 8086
EXPO_PUBLIC_NGOKE_API_BASE_URL=http://<ip>:8086 npm start --prefix mobile
```

| Endpoint | Trạng thái |
| --- | --- |
| `/api/dataset` | có dữ liệu hợp lệ |
| `/empty/api/dataset` | Fixture200nodes[] lịch sử, thiếu envelope nên adapter hiện hành phải báo shape error; empty hợp lệ dùng404 |
| `/broken/api/dataset` | mất nguồn ở một câu |
| `/server-error/api/dataset` | HTTP 500 |
| `/hang/api/dataset` | không phản hồi (kiểm timeout) |

Đây **không phải backend**; sẽ thay bằng backend thật ở phase sau.

## Quyết định cho Phase8 đang thực hiện

1. Ba GET routes: dataset/health/ready; CLI migrate/setup/seed/import, không CRUD/admin/QA/recommendations/chat/LLM endpoints.
2. Không auth/key trong demo nội bộ; default loopback, LAN cấu hình tường minh. Không deploy/public hosting/store.
3. Reviewed metadata được lưu trong SQLite; import review explicit, replace bắt cờ và backup trước, invalid data rollback; không dùng DB người dùng để test.
4. Server chỉ phục vụ sample khi opt-in SERVE_SIMULATED_DATA=true, không tự chuyển sample thành reviewed; không live cache/fallback bundle.
5. User đã yêu cầu chạy xuyên suốt, không còn pending phê duyệt nội bộ cho scope này; QA có quyền trả lỗi về owner và phải ghi pending thiết bị thật rõ.

## Khi có dữ liệu thật

- Thay nội dung trong `data/demo.json` hoặc đổi seed của backend; **không** sửa logic trong app.
- Giữ nguyên schema phiên bản 1 và quy tắc `evidence` bắt buộc.
- Chạy `npm test` trong `mobile/` và `node tools/e2e/demo-scenario.mjs --runs 1` trước khi bàn giao.
- Xem [`HANDOFF_DATA.md`](HANDOFF_DATA.md) và [`DATA_COLLECTION_GUIDE.md`](DATA_COLLECTION_GUIDE.md).
