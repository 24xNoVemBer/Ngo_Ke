# Handoff API — Ngõ Kể

**Quyết định 03/10/2026 của người dùng:** backend **do dự án tự viết** (Node 24 + JSON API + SQLite theo plan), không chờ đội ngoài. Dữ liệu MVP là **dữ liệu mô phỏng do dự án sinh**; khi nào có dữ liệu thật thì thay sau, không chặn MVP.

**Trạng thái:** backend thật **chưa được viết**. Phase 6 chỉ làm phía app (adapter live) và máy chủ kiểm chứng tạm. Phạm vi “toàn cục” của backend đã được người dùng chốt nguyên tắc; chi tiết endpoint sẽ trình trước khi code.

## Phía app đang chờ gì

| Mục | Giá trị hiện tại | Ghi chú |
| --- | --- | --- |
| Đường dẫn | `GET {base}/api/dataset` | Hằng số `DATASET_PATH` trong `mobile/src/data/live.ts` |
| URL theo môi trường | `EXPO_PUBLIC_NGOKE_API_BASE_URL`, dự phòng `app.json → expo.extra.apiBaseUrl` | Không có URL → `empty` |
| Timeout | **8 giây** | Quá giờ → `error` |
| Xác thực | **Chưa dùng** | Không có API key, không `Authorization` |
| Kiểm dữ liệu | `parseDataset` trong `mobile/src/data/sourceState.ts` | Demo và live dùng **chung** một quy tắc shape |

## Hợp đồng response

`200` với body đúng schema phiên bản 1 (giống `data/demo.json`): `schemaVersion`, `kind`, `disclaimer`, `intro`, `startNodeId`, `nodes[]`, `qa[]`.

Mọi câu trả lời phải có `evidence` không rỗng; app **từ chối hiển thị** payload thiếu nguồn hoặc sai shape.

| Mã | Khi nào | App hiện |
| --- | --- | --- |
| `200` hợp lệ | có dữ liệu | `LIVE · dữ liệu đã duyệt` |
| `200` rỗng / `404` | chưa có điểm | `Live chưa có dữ liệu` |
| `200` sai shape | thiếu nguồn, sai schema | `Dữ liệu live không đúng định dạng` |
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
| `/empty/api/dataset` | rỗng |
| `/broken/api/dataset` | mất nguồn ở một câu |
| `/server-error/api/dataset` | HTTP 500 |
| `/hang/api/dataset` | không phản hồi (kiểm timeout) |

Đây **không phải backend**; sẽ thay bằng backend thật ở phase sau.

## Cần chốt trước khi viết backend

1. **Phạm vi “toàn cục”** gồm những gì: chỉ đọc dataset, hay thêm ghi/duyệt bản ghi, thống kê, quản lý nội dung?
2. **Có xác thực không** (token/API key), và lưu ở đâu để không lọt vào repo.
3. **Có cần deploy** không, hay chỉ chạy nội bộ để demo.
4. **Có cần `updatedAt` / `reviewStatus`** trong payload để app biết bản ghi nào đã duyệt (hướng dẫn data đã nêu hai trường này).
5. **Cổng và địa chỉ** cho từng môi trường để điền vào `EXPO_PUBLIC_NGOKE_API_BASE_URL`.

## Khi có dữ liệu thật

- Thay nội dung trong `data/demo.json` hoặc đổi seed của backend; **không** sửa logic trong app.
- Giữ nguyên schema phiên bản 1 và quy tắc `evidence` bắt buộc.
- Chạy `npm test` trong `mobile/` và `node tools/e2e/demo-scenario.mjs --runs 1` trước khi bàn giao.
- Xem [`HANDOFF_DATA.md`](HANDOFF_DATA.md) và [`DATA_COLLECTION_GUIDE.md`](DATA_COLLECTION_GUIDE.md).