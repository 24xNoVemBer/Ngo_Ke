# Hướng dẫn thu dữ liệu cho Ngõ Kể

**Ngày:** 03/10/2026. **Dành cho:** nhóm data (người B) và bất kỳ ai được giao thu thập nội dung.
**Mục đích:** mô tả app cần **những gì** và **cách thu** đúng chuẩn, để nội dung sau khi thu được đưa vào app mà không phải sửa lại logic.

> App là tech demo. Dữ liệu thật chưa có; hiện app dùng `data/demo.json` với **6 điểm mô phỏng**. Tài liệu này nói cách thay bằng nội dung thật.

## 1. Nguyên tắc bắt buộc

| # | Nguyên tắc | Vì sao |
| --- | --- | --- |
| 1 | **Mỗi câu trả lời phải có nguồn/evidence** | App chỉ hiện nội dung có nguồn; không có nguồn thì không được đưa vào. |
| 2 | **Không tự viết lịch sử, sự tích, con số hay trích dẫn** | Nội dung phải lấy từ nguồn thật hoặc ghi rõ là diễn giải của người kể. |
| 3 | **Không dùng dữ liệu mô phỏng như dữ liệu thật** | Tọa độ/ETA giả chỉ để demo kỹ thuật, không dùng để đi bộ thực địa. |
| 4 | **Người dùng duyệt nội dung trước khi vào app** | Nội dung là quyết định của người dùng, không phải quyết định kỹ thuật. |
| 5 | **Tách dữ liệu khỏi logic** | Cùng một logic chạy với dữ liệu demo và dữ liệu thật; chỉ thay nội dung, không sửa thuật toán. |
| 6 | **Ghi nguồn ngay khi thu** | Không bổ sung nguồn sau; câu không có nguồn sẽ bị loại khi duyệt. |

## 2. App cần những gì

### 2.1 Danh sách điểm (node)

Mỗi điểm trong con ngõ là một "node" mà app điều hướng tới.

| Trường | Bắt buộc | Quy tắc |
| --- | --- | --- |
| `id` | Có | Mã duy nhất, viết thường không dấu, ví dụ `diem-01`. Không đổi sau khi dùng. |
| `name` | Có | Tên hiển thị, tối đa khoảng 40 ký tự. |
| `summary` | Có | 1–2 câu mô tả ngắn nơi này. |
| `story` | Có | Lời người kể 2–4 câu, viết như người kể đứng tại chỗ. |
| `evidence` | Có | Danh sách nguồn cho `story`. |
| `latitude` / `longitude` | Có | Tọa độ **đã khảo sát thực tế**, độ chính xác ≥5 m. Ghi thời điểm khảo sát. |
| `qrPayload` | Nếu dùng QR | Chuỗi mã định danh node, ví dụ `ngo-ke://node/diem-01`. Mỗi node một mã. |
| `visitMinutes` | Nếu dùng gợi ý | Số phút ước tính để xem tại điểm, là **ước tính trải nghiệm**, không phải thời gian đi bộ. |

**Điểm đầu tiên** trong danh sách là nơi app bắt đầu. App cần biết rõ node khởi đầu; hiện chưa chốt trong PRD, cần người dùng xác nhận.

### 2.2 Bộ câu hỏi và câu trả lời (Q&A)

Đây là phần lõi của app. App **không** sinh câu trả lời; nó chỉ tìm câu khớp và hiện nguyên văn đã soạn.

| Trường | Bắt buộc | Quy tắc |
| --- | --- | --- |
| `id` | Có | Mã duy nhất, ví dụ `qa-01`. |
| `question` | Có | Câu hỏi chuẩn, ngắn gọn, dùng làm nút mẫu. |
| `answer` | Có | Câu trả lời hoàn chỉnh, 1–4 câu. Không có lời hứa giá/thời gian. |
| `nodeId` | Có | Câu này nói về điểm nào. |
| `aliases` | Có | 2–5 cách người dùng có thể hỏi, không ký tự đặc biệt, không dấu câu thừa. |
| `evidence` | Có | Nguồn cho câu trả lời. **Bắt buộc**; thiếu thì câu bị loại. |
| `followUps` | Nên có | 1–2 `id` câu hỏi tiếp theo để app gợi ý. |
| `tags` | Nên có | Nhóm nội dung để sau này lọc: `an thuc`, `chuyen xua`, `huong dan`, `ve ngoi`. |

**Số lượng khuyến nghị cho demo:** 12–20 câu, phủ cả ba nhóm chủ đề và có câu cho điểm đầu tiên.

### 2.3 Đoạn giới thiệu

| Trường | Quy tắc |
| --- | --- |
| `intro` | 2–3 câu chào, nói rõ đang ở đâu và app làm gì. Không hứa dữ liệu chưa có. |
| `introEvidence` | Nguồn cho các chi tiết địa danh/nhân vật được nhắc. |

### 2.4 Lời người kể hiện trên camera

| Trường | Quy tắc |
| --- | --- |
| `caption` | 1–2 câu hiển thị trên nền camera, đọc nhanh được khi đứng ngoài trời. |
| `captionEvidence` | Nguồn. |

### 2.5 Dữ liệu cho chế độ live

Cùng cấu trúc với fixture nhưng do backend phục vụ. Mỗi bản ghi phải kèm `updatedAt` và `reviewStatus: approved` trước khi app dùng.

## 3. Cách thu

### 3.1 Quy trình

1. **Thu thập thô** (giấy tờ, ảnh chụp, file ghi âm, bản nháp) — không viết lại ngay.
2. **Đối chiếu nguồn** — mỗi nội dung phải chỉ được nguồn cụ thể, có thể mở lại được (URL, số trang sách, ảnh).
3. **Chuyển thành dữ liệu** theo mẫu ở mục 4.
4. **Nộp duyệt** — người dùng duyệt nội dung trước khi vào app.
5. **Đưa vào app** — thay nội dung, không sửa logic.

### 3.1.1 Thu nội dung chữ

- Ưu tiên nguồn chính thức của địa phương: trang giới thiệu của quận/phường, bảo tàng, thư viện, bài báo có tên tác giả, sách có xuất bản.
- **Ghi lại**: tên nguồn, ngày xuất bản, đường dẫn hoặc số trang, ngày truy cập.
- **Không dùng** nguồn không ghi tác giả/ngày, diễn đàn không kiểm chứng, hoặc nội dung AI tạo ra rồi coi như thật.
- Khi không tìm được nguồn cho một ý, **bỏ ý đó** thay vì viết mơ hồ.

### 3.2 Thu câu hỏi và alias

- Chính câu hỏi hiển thị cho nút mẫu — viết ngắn, dễ hiểu khi đang đứng ngoài trời.
- **Alias là cách người thật nói**, không phải biến thể chính tả. Ví dụ với "quán ăn gần đây": `an ăn`, `ăn gì`, `co an`, `quan an`, `mon an`.
- Viết alias không dấu, không phân biệt hoa thường. App tự bỏ dấu và khoảng trắng thừa khi so khớp.
- Mỗi câu nên có **2–5 alias**; quá nhiều alias dễ khớp nhầm câu khác.
- Sau khi app chạy, **ngoài danh sách câu hỏi cần anh ghi lại** để bổ sung alias — đây là nguồn alias tốt nhất.

### 3.3 Thu lời người kể

- Viết ở ngôi "tôi" hoặc "chúng ta", như người đang ở đó nói.
- **Không** bịa người thật, không gán nội dung cho cá nhân cụ thể nếu không có nguồn.
- **Không** nhắc giá, giờ mở cửa, sự kiện sắp tới — dữ liệu đó thay đổi nhanh và dễ sai.
- Caption trên camera phải **đọc trong 5 giây**.

### 3.4 Thu tọa độ

- Dùng GPS điện thoại tại đúng vị trí đứng, chụp màn hình **nhiều lần**, lấy giá trị ổn định.
- Mỗi node ghi: tọa độ, độ chính xác (accuracy), **ngày khảo sát**, ảnh chụp màn hình có thời gian.
- Node nằm trong khu vực đi bộ được cần đủ chính xác để người dùng đứng đúng chỗ.
- **Không** lấy tọa độ từ bản đồ online rồi điền thủ công.
- Nếu chưa khảo sát tọa độ thật, để trống và ghi rõ — app sẽ không dùng tọa độ giả để gợi ý.

### 3.5 Thu mã QR

- Mỗi node một mã riêng, định dạng `ngo-ke://node/<id>`.
- **Phải quét thử lại sau khi dán** để chắc chắn đúng node.
- Lưu danh sách mã đã cấp, không dùng lại mã cũ.

### 3.6 Thu hình ảnh (nếu cần)

- Chụp tại chỗ, ảnh ngang hoặc dọc đều được, không có mặt người chưa được phép.
- Ảnh minh hoạ nội dung chứ không trang trí; không gắn watermark app lên ảnh của người khác.

## 4. Mẫu trình bày dữ liệu

Anh có thể gửi bằng file JSON, bảng tính hoặc Google Sheet — em sẽ chuyển sang đúng định dạng app dùng. Cấu trúc bắt buộc:

```json
{
  "node": {
    "id": "diem-01",
    "name": "Tên điểm",
    "summary": "Mô tả ngắn 1–2 câu.",
    "story": "Lời người kể 2–4 câu.",
    "evidence": ["Nguồn 1", "Nguồn 2"],
    "latitude": 0.0,
    "longitude": 0.0,
    "surveyedAt": "2026-10-10",
    "visitMinutes": 5
  },
  "qa": {
    "id": "qa-01",
    "question": "Câu hỏi hiển thị",
    "answer": "Câu trả lời đã soạn.",
    "nodeId": "diem-01",
    "aliases": ["alias 1", "alias 2"],
    "evidence": ["Nguồn"],
    "followUps": ["qa-02"],
    "tags": ["an thuc"]
  },
  "intro": "2–3 câu chào, nói rõ đang ở đâu."
}
```

Quy ước:
- `latitude`/`longitude`: **để `0.0` nghĩa là chưa khảo sát**, không phải tọa độ tại ghế 0.
- `evidence`: mỗi mục là **một nguồn cụ thể** có thể mở lại.
- `followUps`: chỉ dùng `id` có thật trong danh sách câu hỏi.

## 5. Cách nhập vào app

1. Gửi dữ liệu theo mẫu ở mục 4 (anh có thể gửi từng điểm/câu, không cần đủ một lần).
2. Em kiểm tra: đủ trường bắt buộc, `evidence` có thật, `id` không trùng, alias không khớp nhầm câu khác.
3. Anh duyệt nội dung trên app/emulator.
4. Chỉ sau đó em mới nối vào app và kiểm tra lại luồng.

**Nguyên tắc:** nếu một câu hoặc một điểm thiếu nguồn, em sẽ **không** đưa vào app và báo lại danh sách thiếu, thay vì tự viết nội dung thay.

## 6. Trạng thái hiện tại

| Phần | Trạng thái |
| --- | --- |
| Fixture kỹ thuật 6 điểm mô phỏng | Đã có (`data/demo.json`), chỉ để kiểm tra giao diện |
| Nội dung thật | Chưa có; đang chờ thu theo tài liệu này |
| Chế độ live + backend Node/SQLite | Chưa có |
| Voice TTS/STT | Phase riêng, chưa bắt đầu |

Nguồn kỹ thuật: [plan](TECH_DEMO_PLAN.md), [PRD](PRO-NgoKe-MVP.md), [schema fixture hiện tại](../data/README.md).