# Spec — Phase 6: Live gọi API, tách demo/live và handoff

**Trạng thái:** người dùng đã duyệt Phase 5 (03/10/2026) và chốt ba quy tắc ngày 03/10/2026. Báo cáo bàn giao: [`phase_6_review.md`](../../../agent_docs/phase_6_review.md). **Mã:** R6.01–R6.04.

## Mục tiêu

Chế độ **live** gọi API thật khi được cấu hình, kiểm tra shape và nguồn của dữ liệu trả về, và hiện đúng `empty` / `error` khi thiếu cấu hình, rỗng, lỗi hoặc quá thời gian. Chế độ **demo** tiếp tục đọc `data/demo.json` trong bundle, không cần mạng.

## Quy tắc đã chốt

- **Timeout: 8 giây.** Quá thời gian → trạng thái lỗi, có nút thử lại.
- **URL theo môi trường:** `EXPO_PUBLIC_NGOKE_API_BASE_URL`, dự phòng từ `app.json` → `expo.extra.apiBaseUrl`. Không có URL → `empty`.
- **Adapter + máy chủ kiểm chứng cục bộ.** Không dựng backend production, không sinh dữ liệu thật.

## Phạm vi

| Trong Phase 6 | Ngoài Phase 6 |
| --- | --- |
| Adapter live: timeout, shape, nguồn, empty/error | Backend production, deploy, API key thật |
| Cấu hình URL theo môi trường | Offline cache hoặc queue (Phase 7) |
| Demo đọc fixture trong bundle, không mạng | Voice, AR, chỉ đường |
| Tài liệu handoff cho nhóm data và nhóm UI | Nhập dữ liệu chưa được duyệt |

## Logic

`mobile/src/data/live.ts`, hàm thuần, **không** import React:

- `readLiveConfig(env, extra)` → `string | undefined`: URL đã cắt khoảng trắng và dấu `/` cuối; ưu tiên biến môi trường.
- `loadLiveSource({ baseUrl, timeoutMs, fetchImpl })` → `Promise<SourceState>`:
  1. Không `baseUrl` → `{ mode: 'live', status: 'empty', reason: 'no-config' }`.
  2. `fetch` với `AbortController` đếm ngược `timeoutMs` (mặc định **8000**).
  3. Hết giờ → `{ status: 'error', reason: 'timeout' }`; lỗi mạng → `reason: 'network'`; HTTP ≠ 2xx → `reason: 'http'`.
  4. `404` hoặc body rỗng/không có `nodes` → `{ status: 'empty', reason: 'no-data' }`.
  5. Body sai shape hoặc `evidence` rỗng → `{ status: 'error', reason: 'shape' }`.
  6. Hợp lệ → `{ mode: 'live', status: 'ready', dataset }`.

Ranh giới bất di bất dịch: **không nhánh nào trả về `data/demo.json`**, và không có đường dẫn nào đổi `mode` khỏi `live`.

Validator được tách ra khỏi `getSourceState` thành `parseDataset(value)` để demo và live dùng **cùng một** quy tắc shape; `getSourceState` gọi lại hàm này nên hành vi demo không đổi.

## Giao diện

- Home: nút `Live` báo trạng thái thật (`Đang tải…` / `empty` / `error`) kèm lý do; có **“Thử lại”** khi lỗi.
- Các màn Q&A, chọn trải nghiệm, camera, GPS chỉ mở khi `status === 'ready'`; nếu không thì `UnavailableScreen` với đúng lý do (giữ nguyên hành vi hiện tại).
- `currentNodeId` sống ở `App.tsx`; khi đổi sang live và tải lại được thì vẫn giữ, nếu không còn trong dataset thì về `startNodeId`.

## Máy chủ kiểm chứng cục bộ

`tools/mock-api/server.mjs` — chỉ để kiểm chứng, **không** nằm trong app và **không** phải backend production:

- `GET /api/dataset` → payload cùng shape schema v1, `kind: "simulated"`, `evidence` ghi rõ là dữ liệu demo kỹ thuật.
- `GET /api/empty` → `{ "nodes": [] }` để kiểm tra trạng thái rỗng.
- `GET /api/broken` → node thiếu `evidence` để kiểm tra lỗi shape.
- `GET /api/hang` → không bao giờ phản hồi, để kiểm tra timeout.

Chạy: `node tools/mock-api/server.mjs 8086`. Chỉ dùng khi kiểm tra, không có trong `npm start`.

## Kiểm tra

`npm test` với `fetchImpl` giả lập — không gọi mạng:

- Không có URL → `empty` + `no-config`; URL từ biến môi trường thắng `extra`; cắt `/` cuối.
- Payload hợp lệ → `ready` và `dataset` đúng.
- `nodes: []` → `empty` + `no-data`; `404` → `empty`.
- Thiếu `evidence` → `error` + `shape`; HTTP 500 → `error` + `http`.
- Hết giờ → `error` + `timeout`, và `AbortController` thật sự ngắt request.
- Mọi lỗi: `mode` vẫn là `live`, **không** có `dataset`, không đọc fixture.
- Demo không đổi hành vi: `getSourceState('demo', fixture)` vẫn `ready` không cần mạng.

Trên emulator: bốn ca — live không cấu hình → `empty`; trỏ URL tới `/api/empty` → `empty` có dữ liệu rỗng; `/api/broken` → `error`; `/api/hang` → `error` timeout; `/api/dataset` → `ready` và các màn mở được; demo vẫn chạy khi tắt server.

## Ranh giới

- Dữ liệu live trong máy chủ kiểm chứng là **mô phỏng**; không có bản ghi thật nào trong repo.
- Không deploy, không API key, không ghi log nội dung người dùng.
- Không nới `AGENTS.md` ranh giới: live không bao giờ fallback sang demo.
- Chưa kiểm trên iOS/thiết bị thật; offline cache thuộc Phase 7.