# Ngõ Kể — MVP roadmap: từng phase và dữ liệu cần có

**Ngày:** 03/10/2026. **Mục đích:** một trang nhìn tổng thể để biết app demo MVP gồm những gì, mỗi phase làm gì, và cần thu dữ liệu gì để chạy được demo end-to-end.

Nguồn: [plan](TECH_DEMO_PLAN.md) (chuẩn về phạm vi/thứ tự), [PRD](PRO-NgoKe-MVP.md), [hướng dẫn thu dữ liệu](DATA_COLLECTION_GUIDE.md).

## 1. App MVP là gì

App native Android/iOS (Expo + React Native) để khám phá con ngõ: nghe giới thiệu, hỏi đáp cố định có nguồn, chọn chủ đề/quỹ thời gian, nhận gợi ý tối đa ba điểm, xác nhận điểm, xem lời người kể trên camera rồi hỏi tiếp.

**Kịch bản demo MVP** (Phase 7 chạy lặp lại kịch bản này):

```text
mở app → lời giới thiệu → chọn câu hỏi mẫu hoặc tự gõ
→ nhận đáp án có nguồn → hỏi tiếp
→ chọn chủ đề ẩm thực/chuyện xưa/tự do → chọn quỹ thời gian
→ nhận tối đa 3 điểm kèm lý do và thời lượng
→ quét QR (hoặc chọn tay) để xác nhận điểm
→ xem lời kể + caption trên camera → hỏi tiếp
```

Chạy được kịch bản **không cần mạng** bằng dữ liệu trong app; chế độ live dùng dữ liệu thật qua API.

## 2. Các phase và dữ liệu từng phase

| Phase | Làm gì | Dữ liệu cần | Trạng thái |
| --- | --- | --- | --- |
| **0 — Chốt hành vi, kiến trúc** | Chốt hành vi, luồng, sơ đồ màn hình, hợp đồng data/API | Không cần dữ liệu | Xong, đã duyệt |
| **1 — Khung app native** | Expo Android/iOS, navigation, Home đọc dữ liệu từ bundle, chế độ demo/live | Fixture ban đầu: ≥1 điểm để app mở được | Xong, đã duyệt (6 điểm **mô phỏng**) |
| **2 — Giới thiệu và hỏi đáp cố định** | Lời giới thiệu tại điểm đầu, chip câu hỏi, ô nhập chữ, khớp câu hỏi/alias, đáp án nguyên văn + nguồn, 1–2 câu hỏi tiếp, câu lạ báo “chưa có dữ liệu” | **Lời giới thiệu**; **bộ câu hỏi/đáp án** mỗi câu có câu hỏi, đáp án, **nguồn**, 2–5 cách hỏi khác (alias), 1–2 câu hỏi tiếp, nhóm chủ đề | Code xong, nội dung đang **mô phỏng**, chờ duyệt |
| **3 — Chủ đề, quỹ thời gian, gợi ý điểm** | Hỏi muốn ẩm thực/chuyện xưa/tự do, hỏi quỹ thời gian, hiện **tối đa 3 điểm** kèm lý do và thời lượng | Thêm: **chủ đề** của mỗi điểm; **thời lượng xem** tại điểm | Đã được người dùng duyệt 03/10/2026 |
| **4 — Camera, QR, người kể 2D** | Xin quyền camera đúng lúc, quét QR của điểm đã biết, hiện người kể 2D + caption trên camera, chọn tay khi từ chối quyền hoặc QR lạ | Thêm: **lời kể** ngắn cho camera; **caption** 1–2 câu; mã QR theo công thức `ngo-ke://node/<id>`; hình người kể 2D tạm (hiện là hình tròn chữ, chưa phải mascot) | Code xong; vị trí/kích thước người kể và câu xin quyền chờ anh duyệt (G4). Quét QR thật chưa kiểm end-to-end |
| **5 — GPS và xác nhận điểm** | Khi bấm GPS, đưa **một** điểm gợi ý kèm độ chính xác/khoảng cách, người dùng xác nhận hoặc chọn lại; không tự đổi điểm | Thêm: **tọa độ thật đã khảo sát** cho từng điểm; ngưỡng độ chính xác/khoảng cách | Chưa làm |
| **6 — Nối API và dữ liệu thật** | Chế độ live đọc API thật; thiếu cấu hình thì trống, lỗi/hết thời gian thì báo lỗi; **không** tự lùi về dữ liệu demo | Thêm: **bản ghi thật** trên API (nội dung đã duyệt), quy tắc kiểm tra dữ liệu, nguồn của từng bản ghi; **backend Node 24 + SQLite** sẽ xây mới | Chưa làm |
| **7 — Offline và kiểm thử end-to-end** | Chốt phạm vi, chạy lặp kịch bản demo bằng dữ liệu trong app, kiểm tra các đường thay thế khi từ chối quyền, bàn phím/cỡ chữ, bàn giao | Không cần dữ liệu mới; cần **ma trận thiết bị** và log chạy thử | Chưa làm |
| **Voice (sau core, duyệt riêng)** | Đọc đáp án bằng giọng nói (TTS) và nhận câu hỏi bằng giọng nói (STT) trên cùng bộ Q&A; luôn giữ nhập bằng chữ | Không cần dữ liệu mới; anh chọn dịch vụ/giọng và duyệt riêng | Chưa được duyệt |

## 3. Danh sách dữ liệu tối thiểu để demo được MVP

Tất cả nằm trong một nguồn dữ liệu của app (`data/demo.json`), tách riêng khỏi dữ liệu live.

### 3.1 Bắt buộc cho Phase 1–2 (app chạy được, người dùng dùng được)

| Nhóm | Trường | Ghi chú |
| --- | --- | --- |
| Điểm | `id`, `name` | Ít nhất 1 điểm để app mở được; nên có 5–6 điểm để demo đa dạng |
| Lời giới thiệu | `intro.text`, `intro.evidence` | 2–3 câu, có nguồn |
| Điểm khởi đầu | `startNodeId` | Nơi app bắt đầu |
| Câu hỏi | `qa[].question` | Câu hiển thị trên nút mẫu |
| Câu trả lời | `qa[].answer` | 1–4 câu, viết như người kể |
| Nguồn | `qa[].evidence` | **Bắt buộc.** Thiếu nguồn thì câu đó không được dùng |
| Cách hỏi khác | `qa[].aliases` | 2–5 cách người thật hay nói, không dấu |
| Câu hỏi tiếp | `qa[].followUps` | 1–2 câu, phải là câu có thật trong danh sách |

### 3.2 Cần cho Phase 3–5 (demo đầy đủ luồng)

| Nhóm | Trường | Ghi chú |
| --- | --- | --- |
| Mô tả điểm | `summary` | 1–2 câu |
| Lời kể | `story` | 2–4 câu, dùng cho Phase 4 |
| Chủ đề | `tags` | `an thuc`, `chuyen xua`, `kham pha tu do` |
| Thời lượng | `visitMinutes` | Số phút ước tính xem tại điểm, **không phải** thời gian đi bộ |
| Mã QR | `qrPayload` | `ngo-ke://node/<id>`, một mã riêng mỗi điểm |
| Caption | `caption` | 1–2 câu, đọc trong 5 giây khi đứng ngoài trời |
| Tọa độ | `latitude`, `longitude` | **Phải khảo sát thật**, có ngày khảo sát và ảnh màn hình |

### 3.3 Cần cho Phase 6 (dữ liệu thật qua API)

- Backend Node 24 + SQLite xây mới, chỉ cho phép đọc.
- Bản ghi thật cho từng điểm/câu hỏi đã được duyệt, kèm nguồn và ngày cập nhật.
- Quy tắc: thiếu cấu hình → trống; rỗng hợp lệ → trống; lỗi/hết thời gian → báo lỗi; **không** tự lùi về dữ liệu demo.

## 4. Nguyên tắc khi thu dữ liệu

1. **Có nguồn mới dùng.** Không có nguồn thì bỏ ý, không viết mơ hồ.
2. **Không bịa lịch sử, sự tích, con số, giá hoặc giờ mở cửa.** Dữ liệu mô phỏng phải ghi rõ là mô phỏng.
3. **Tọa độ phải khảo sát thật**; chưa khảo sát thì để trống, tuyệt đối không điền số bịa.
4. **Một nguồn dữ liệu, nhiều chế độ.** Dùng dữ liệu thật thì logic không phải sửa.
5. **Người dùng duyệt nội dung trước khi vào app.**

Chi tiết cách thu: [DATA_COLLECTION_GUIDE.md](DATA_COLLECTION_GUIDE.md).

## 5. Còn thiếu để demo được MVP

| Việc | Ai | Trạng thái |
| --- | --- | --- |
| Duyệt nội dung Q&A mô phỏng của Phase 2 | Người dùng | Chờ |
| Câu hỏi/đáp án/alias/nguồn thật | Nhóm data | Chưa có |
| Mô tả, lời kể, chủ đề, thời lượng, caption | Nhóm data | Chưa có |
| Tọa độ khảo sát thật | Nhóm data | Chưa có |
| Mã QR cho từng điểm | Nhóm data | Chưa có |
| Hình người kể 2D | Nhóm UI | Chưa có |
| Quy tắc xếp hạng gợi ý điểm | Người dùng duyệt | Đã có bản tối giản, chờ duyệt ở G3 |
| Backend API + SQLite | Phase 6 | Chưa làm |
| Chọn dịch vụ/giọng cho voice | Người dùng | Phase riêng, chưa duyệt |
| Kiểm thử trên điện thoại thật và iPhone | Người dùng | Chưa có bằng chứng |

## 6. Kết quả kiểm tra hiện tại (03/10/2026)

- `npm test` 81/81 đạt; typecheck, lint, dependency check, Expo Doctor 21/21 và xuất bundle Android/iOS đều đạt. Phase 4 thêm `expo-camera`, Phase 5 thêm `expo-location`.
- Trên máy ảo Android (Medium_Phone, Android 17/API 37, Expo Go 57.0.9): 13/13 ca Phase 2, 13/13 ca Phase 3, 19/19 ca Phase 4 và 6/6 ca Phase 5 đạt; có ảnh trong `agent_docs/evidence/phase-2/` đến `phase-5/`.
- **Giới hạn môi trường:** máy ảo này không cấp được fix GPS (`geo fix` trả OK nhưng provider không nhận), nên hai nhánh candidate/outside-cluster của Phase 5 chỉ kiểm bằng unit test, chưa chạy thật trên thiết bị.
- **Chưa kiểm tra:** điện thoại thật, iOS, offline khởi chạy từ trạng thái đã đóng, screen reader.
- Báo cáo chi tiết: [Phase 1](../agent_docs/phase_1_completion.md), [Phase 2](../agent_docs/phase_2_review.md), [Phase 3](../agent_docs/phase_3_review.md), [Phase 4](../agent_docs/phase_4_review.md), [Phase 5](../agent_docs/phase_5_review.md).