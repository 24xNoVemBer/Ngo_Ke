# Code Patterns — Ngõ Kể

> Nguồn: [Tech Design](../docs/TechDesign-NgoKe-MVP.md), Component Design và Demo/Live State. Phase 1 đã chọn TypeScript strict, React state/StyleSheet, React Navigation native-stack, Node tests và ESLint10/typescript-eslint. Ranh giới controller/core/data/device phía dưới vẫn là **đề xuất cho phase tương ứng**, chưa phải các module đã triển khai.

## Phân trách nhiệm

| Vai trò đề xuất | Trách nhiệm | Ranh giới |
| --- | --- | --- |
| Screen/component | Render, nhận dữ liệu, phát thao tác tới điều phối | Không chứa normalization/ranking/retrieval hoặc truy cập DB/API trực tiếp |
| Controller | Điều phối state, source, core và xác nhận | Không sao chép thuật toán; lỗi kỹ thuật không giả làm Q&A unknown |
| CoreBridge | Ánh xạ tới export thật của core sau gate | Không tạo matcher/ranking thay thế hoặc giả định signature |
| DataSource | Nạp/validate nguồn đúng mode, ready/empty/error | Không xác nhận node, không trả fixture cho live |
| Device adapter | Quyền, thao tác, lifecycle camera/QR/GPS | Không background tracking hoặc giữ camera khi rời màn |
| Narrator view | 2D placeholder + caption từ text đã duyệt | Không AR/3D/lip-sync/audio trong core |

Không tạo đủ mọi module trước khi phase cần chúng; tên vai trò không phải tên hàm hoặc export có sẵn.

## Invariant dữ liệu và trạng thái

- Giữ một nguồn thuật toán và một fixture gốc. Không chép core/fixture để né Metro.
- State session trong bộ nhớ và bỏ response cũ theo context là đề xuất; chi tiết reset/visited cần review. Invariant bắt buộc: không lẫn mode/source hoặc tự xác nhận GPS.
- Dataset lỗi khác câu hỏi chưa có đáp án. Response sai shape/reference → error kỹ thuật; câu ngoài bộ/thiếu evidence → chưa có dữ liệu.
- QR lạ không commit hoặc mở URL; GPS callback chỉ cung cấp candidate, không đổi confirmed node. QR hợp lệ hoặc thao tác xác nhận GPS/manual mới đổi điểm.

## Ví dụ minh họa — không phải code/API của dự án

Pseudocode dưới đây chỉ diễn đạt ranh giới source selection đã có trong plan. Tên hàm/status là ký hiệu minh họa, không được chép thành contract khi chưa đọc source.

```text
source_for(mode, configuration):
    if mode is demo:
        return validate(read bundled original fixture)
        # Fixture lỗi phải báo lỗi demo; không lấy API để bù.
    if live configuration is missing:
        return empty while retaining live mode
    return validate(read existing live API)
    # Rỗng hợp lệ → empty; network/timeout/shape lỗi → error.
    # Không có nhánh catch → demo: tránh dữ liệu giả bị gắn nhãn thật.
```

## Quy ước có điều kiện

- Code mới dùng TypeScript strict: tránh `any`, dùng `unknown` + type guard ở biên; ghi rõ kiểu tham số/đầu ra. Không cài Zod trước khi đọc schema/validation thật. Node24 chạy test `.mjs` import module `.ts` không JSX; không dùng phép này để kiểm tra React Native runtime.
- Theo package/lockfile và convention source thực tế; ưu tiên native API, không thêm library vì ví dụ template có dùng.
- Không sửa backend/schema/migration hoặc chọn matcher mới ngoài phạm vi được duyệt. Nếu cần thay đổi kiến trúc, báo bằng chứng, trade-off và chờ review.
