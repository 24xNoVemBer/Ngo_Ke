# Spec — Phase 2: Giới thiệu và hỏi đáp cố định

**Trạng thái:** đã được người dùng duyệt phạm vi (cho phép bộ Q&A mô phỏng tối thiểu để review luồng, sau đó thay bằng dữ liệu thật theo [DATA_COLLECTION_GUIDE](../../../docs/DATA_COLLECTION_GUIDE.md)). Báo cáo bàn giao: [phase_2_review.md](../../../agent_docs/phase_2_review.md). **Ngày:** 03/10/2026. **Mã:** R2.01–R2.04.

## Mục tiêu

`mở → giới thiệu → chọn câu hỏi mẫu/tự nhập → đáp án nguyên văn có nguồn → 1–2 câu hỏi tiếp theo`. Không gọi LLM, không sinh đáp án, không hứa dữ liệu chưa có.

## Phạm vi và ngoài phạm vi

| Trong Phase 2 | Ngoài Phase 2 |
| --- | --- |
| Lời giới thiệu ngắn tại node đầu | Gợi ý điểm theo chủ đề/quỹ thời gian (Phase 3) |
| Chip câu hỏi mẫu + ô nhập chữ | Camera, QR, người kể 2D, caption (Phase 4) |
| Normalize + khớp câu hỏi/alias | GPS candidate/xác nhận (Phase 5) |
| Đáp án nguyên văn + nguồn demo | Backend/live (Phase 6) |
| 1–2 câu hỏi gợi ý tiếp theo | TTS/STT (phase Voice riêng, chưa duyệt) |
| Câu ngoài danh sách → "chưa có dữ liệu" | Chọn/xác nhận điểm, điều hướng giữa các node |

## Dữ liệu

Một nguồn duy nhất: `data/demo.json` (bản mô phỏng). Mở rộng schema phiên bản 1, **giữ nguyên** `schemaVersion`, `kind: simulated`, `disclaimer` và `nodes` đúng 6 điểm.

```jsonc
{
  "schemaVersion": 1,
  "kind": "simulated",
  "disclaimer": "…",
  "intro": { "text": "2–3 câu", "evidence": ["Nguồn"] },
  "startNodeId": "demo-01",
  "nodes": [{ "id": "demo-01", "name": "Điểm demo 01" }],
  "qa": [
    {
      "id": "qa-01",
      "question": "Câu hỏi hiển thị",
      "answer": "Câu trả lời nguyên văn.",
      "nodeId": "demo-01",
      "aliases": ["alias 1", "alias 2"],
      "evidence": ["Nguồn demo"],
      "followUps": ["qa-02"],
      "tags": ["gioi thieu"]
    }
  ]
}
```

Quy tắc validation (tại biên dữ liệu, không thêm thư viện):
- `intro.text` không trống; `intro.evidence` có ít nhất 1 mục không trống.
- `startNodeId` phải có trong `nodes`.
- `qa` có ít nhất 1 mục; `id` không trùng và không trống.
- `question`, `answer`, `nodeId` không trống; `nodeId` phải có trong `nodes`.
- `aliases`: 1–5 chuỗi không trống.
- `evidence`: ít nhất 1 chuỗi không trống — **thiếu thì cả dataset bị từ chối**.
- `followUps`: 0–2 mục, mỗi mục là `id` có thật trong `qa`.
- `tags`: chuỗi không trống.

Nội dung mô phỏng phải **không bịa lịch sử/nguồn thật**: nguồn ghi rõ là nội dung demo kỹ thuật, không gắn tên cơ quan/địa danh thật.

## Logic khớp câu hỏi

`mobile/src/qa/match.ts`, thuần và không phụ thuộc React:

- `normalizeQuestion(text)`: cắt khoảng trắng đầu/cuối, hạ chữ thường, bỏ dấu tiếng Việt, gộp khoảng trắng, bỏ dấu câu cuối (`? ! . , ; :`).
- `findAnswer(entries, text)`:
  1. Chuỗi rỗng/không có chữ → `unknown`.
  2. Khớp `question` đã normalize → `matched` với `matchedOn: 'question'`.
  3. Khớp bất kỳ `alias` đã normalize → `matched` với `matchedOn: 'alias'`.
  4. Không khớp → `unknown`.

Không dùng LLM, không so khớp gần đúng/fuzzy, không tự viết câu trả lời.

## Giao diện

`mobile/src/screens/QaScreen.tsx`, thay placeholder `qa` (giữ nguyên key `qa` trong `navigation.ts`):
1. Lời giới thiệu + nhãn nguồn.
2. Chip câu hỏi mẫu (tối đa 4 câu đầu trong bộ, theo thứ tự file).
3. `TextInput` + nút hỏi; Enter cũng gửi.
4. Kết quả: câu hỏi đã hỏi, đáp án nguyên văn, **nguồn** (`evidence`), nút quay lại bộ câu hỏi.
5. Câu ngoi bộ → thông báo **"Chưa có dữ liệu cho câu hỏi này"**, không hiện đáp án.
6. Sau đáp án: chip 1–2 câu hỏi tiếp theo; bấm chip → hỏi lại qua **cùng** `findAnswer`.
7. Ô nhập trống sau khi hỏi để tránh dính câu cũ.

Home: thêm dòng "Bắt đầu tại: <startNodeId>" và đổi nhãn liên kết `qa` thành mở Q&A thật thay vì placeholder.

Ràng buộc trình bày: safe area, cuộn dọc, nút ≥48 đơn vị, có phản hồi khi nhấn, nhãn accessibility; nội dung demo phải ghi rõ là mô phỏng.

## Kiểm tra

`npm test` (Node built-in) bằng dữ liệu thật từ `data/demo.json` và dữ liệu lỗi:
- normalize: dấu, hoa/thường, khoảng trắng, dấu câu cuối.
- exact match, alias match, unknown (kể cả chuỗi rỗng).
- dataset hợp lệ → ready; thiếu evidence/alias rỗng/followUp không tồn tại/nodeId lạ/trùng `id` → error.
- Nội dung: mọi câu trả lời có `evidence` không rỗng; mọi câu hỏi tiếp theo có `id` thật.

Sau đó: `npm run typecheck`, `npm run lint`, `npm run check:dependencies`, `expo-doctor`, export Android/iOS, và chạy trên Android emulator (Medium_Phone, Expo Go 57.0.9) với ảnh Home, Q&A, câu ngoài bộ, hỏi tiếp.

## Giới hạn đã biết

- Nội dung là **mô phỏng**, chưa phải nội dung thật; app ghi rõ nguồn demo.
- Không có chọn/xác nhận điểm, không gợi ý điểm, không camera/GPS — thuộc phase sau chưa duyệt.
- Điện thoại thật/iOS chưa kiểm tra ở mọi phase.
- Không kiểm tra offline cold start.