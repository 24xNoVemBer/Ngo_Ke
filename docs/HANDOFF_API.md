# Handoff API — Ngõ Kể

> **Hợp đồng thực hiện 16/10/2026:** [spec Phase7.1/8](PHASE_7_1_8_EXECUTION_SPEC.md#hợp-đồng-live-cuối-cho-đợt-này) thay các quy tắc lịch sử bên dưới về parser dùng chung demo/live, nhãn “đã duyệt”, node count và 200 rỗng. Giữ GET dataset và deadline8s; live mở 1..50 node với simulated/reviewed, reviewed cần metadata approved/updatedAt từng record; empty canonical404, 200 rỗng/sai envelope là error. Quyền thực hiện được người dùng chốt; kết quả kiểm thử/giới hạn nghiệm thu ghi bên dưới. Không API chat/LLM hoặc fallback demo.

**Quyết định 03/10/2026 của người dùng:** backend **do dự án tự viết** (Node 24 + JSON API + SQLite theo plan), không chờ đội ngoài. Dữ liệu MVP là **dữ liệu mô phỏng do dự án sinh**; khi nào có dữ liệu thật thì thay sau, không chặn MVP.

**Trạng thái16/10/2026:** Phase8 tích hợp e3acedf đạt201 app/19 backend/33 guard/15 HTTP độc lập; Muse native19/19 + APK F4FF95 offline/live/retry/denial/restore đạt. [QA report](PHASE_8_QA_REPORT.md) ghi SHA và giới hạn GPS fix/QR thật/iPhone. Backend không npm dependencies hoặc route chat/LLM. Đợt Việt/Anh được mở theo yêu cầu đã có; hợp đồng locale sẽ được chốt riêng trước coding, chưa suy thêm endpoint/schema từ tài liệu này. Phase6/mock server là lịch sử kiểm adapter.

## Kết nối phía app

| Mục | Giá trị hiện tại | Ghi chú |
| --- | --- | --- |
| Đường dẫn | `GET {base}/api/dataset` | Hằng số `DATASET_PATH` trong `mobile/src/data/live.ts` |
| URL theo môi trường | `EXPO_PUBLIC_NGOKE_API_BASE_URL`, dự phòng `app.json → expo.extra.apiBaseUrl` | Không có URL → `empty` |
| Timeout | **8 giây** | Quá giờ → `error` |
| Xác thực | **Chưa dùng** | Không có API key, không `Authorization` |
| Kiểm dữ liệu | `parseDataset(value, { mode: 'live' })` trong `mobile/src/data/sourceState.ts` | Chung kiểm field/reference; demo đúng6/simulated, live1..50/simulated hoặc reviewed |

Native build dùng plugin `mobile/plugins/withVoiceGatewayNetworkSecurity.cjs` (bản sửa `0ad83c1`): HTTP API ở localhost/private IPv4, gồm `10.0.2.2` cho Android emulator, được cấu hình độc lập voice. HTTPS hoặc không cấu hình không mở ngoại lệ cleartext; HTTP host công khai bị từ chối khi build. Đây là cấu hình native nên cần prebuild/build lại APK; đổi biến Metro không chứng minh APK đã nhận cấu hình. Không đặt URL voice giả để mở API. Build APK mới và nghiệm thu mạng/offline đang chờ W2/W4, chưa phải bằng chứng runtime.

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

Đây là công cụ tạo tình huống kiểm adapter; backend thật đã có trong nhánh tích hợp Phase8, không dùng mock làm bằng chứng nghiệm thu backend.

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
