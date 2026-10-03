# Handoff cho nhóm data — Ngõ Kể

**Đọc trước khi gửi dữ liệu.** App không tự sinh nội dung và không hiện bản ghi chưa được duyệt. Mọi thay đổi ở đây đều cần người dùng duyệt trước khi nối vào app.

## App cần gì

| Nhóm dữ liệu | Bắt buộc cho | Nguồn ở đâu |
| --- | --- | --- |
| Điểm (node) | Home, gợi ý, camera, GPS | `data/demo.json` → `nodes[]` |
| Câu hỏi + đáp án + nguồn | Q&A | `data/demo.json` → `qa[]` |
| Lời kể và caption | Camera, người kể 2D | `data/demo.json` → `story`, `caption` |
| Tọa độ khảo sát | GPS candidate | `data/demo.json` → `latitude`, `longitude` |

Bản mẫu đầy đủ: [`../data/README.md`](../data/README.md). Yêu cầu thu thập chi tiết: [`DATA_COLLECTION_GUIDE.md`](DATA_COLLECTION_GUIDE.md).

## Hai chế độ, hai nguồn dữ liệu

- **Demo** đọc `data/demo.json` nằm trong bundle. Không cần mạng, server hay API key. Đây là nguồn duy nhất của chế độ demo.
- **Live** gọi `GET {EXPO_PUBLIC_NGOKE_API_BASE_URL}/api/dataset`. Không có URL → hiện `empty`. Lỗi mạng, HTTP lỗi, quá **8 giây** hoặc sai định dạng → hiện `error`.
- **Live không bao giờ lấy dữ liệu demo.** Đây là ranh giới an toàn, có test chặn.

## Quy tắc bắt buộc của dữ liệu

1. `schemaVersion: 1`, `kind: "simulated"` khi nội dung còn là mô phỏng.
2. `disclaimer` nói rõ dữ liệu có phải địa điểm thật hay không.
3. **Đúng 6 node** trong `nodes` (giữ nguyên số lượng để không phá màn hình đã duyệt; cần nhiều hơn thì báo người dùng để mở phạm vi).
4. Mỗi `node` cần: `id` (thường, không dấu, duy nhất), `name`, `summary`, `tags`, `visitMinutes`, `available`, `visited`, `story`, `caption`, `latitude`, `longitude`.
5. `tags` chỉ nhận `an thuc`, `chuyen xua`, `kham pha tu do`.
6. `caption` tối đa khoảng 220 ký tự — đọc được khi đứng ngoài trời.
7. Mỗi `qa` cần `evidence` **không rỗng**. App từ chối hiện câu trả lời không có nguồn.
8. `followUps` tối đa 2, không trùng `id` của chính nó.
9. Không có hai `qa` nào trả lời cùng một câu hỏi đã chuẩn hóa.
10. Tọa độ phải là **khảo sát thật** khi đã thu thập; fixture hiện để mô phỏng và màn hình ghi rõ điều đó.

Validator nằm ở [`../mobile/src/data/sourceState.ts`](../mobile/src/data/sourceState.ts) (`parseDataset`) và được dùng **chung** cho demo lẫn live, nên dữ liệu sai bị chặn ngay ở biên chứ không phải ở màn hình.

## Máy chủ kiểm chứng cục bộ

Khi backend thật chưa có, dùng máy chủ kiểm chứng để kiểm tra từng trạng thái của live:

```bash
node tools/mock-api/server.mjs 8086
EXPO_PUBLIC_NGOKE_API_BASE_URL=http://<ip-máy>:8086 npm start
```

| Endpoint | Dùng để kiểm | App hiện |
| --- | --- | --- |
| `/api/dataset` | có dữ liệu hợp lệ | `LIVE · dữ liệu đã duyệt` |
| `/api/empty` | máy chủ rỗng | `Live chưa có dữ liệu` |
| `/api/broken` | mất nguồn ở một câu | `Dữ liệu live không đúng định dạng` |
| `/api/server-error` | HTTP 500 | `Máy chủ live trả lỗi` |
| `/api/hang` | không phản hồi | `Máy chủ live phản hồi quá chậm` (8 giây) |

Máy chủ này chỉ phục vụ kiểm chứng, **không** phải backend và dùng dữ liệu mô phỏng.

## Trước khi gửi

- [ ] Mọi `qa` có `evidence` là nguồn thật, người dùng đã đọc.
- [ ] Tọa độ là khảo sát thật, ghi rõ thời điểm và độ chính xác.
- [ ] `disclaimer` mô tả đúng tình trạng dữ liệu.
- [ ] Chạy `npm test` trong `mobile/` sau khi thay fixture; test sẽ bắt lỗi shape và câu hỏi trùng.
- [ ] Gửi người dùng duyệt **trước khi** nối vào app hoặc thay fixture trong bundle.