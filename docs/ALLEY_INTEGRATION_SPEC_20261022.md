# Spec — Tích hợp 2 ngõ phố cổ (Ngõ Gạch, Ngõ Trung Yên) vào app

Ngày 22/10/2026. Người giao: người dùng (quyết định ở chat ngày 22/10). Chủ sở hữu việc: Antigravity (FE). Coordinator tạm: Claude theo yêu cầu người dùng.

## Mục tiêu
Hai ngõ mới xuất hiện trong danh sách collection. Khi người dùng nhấn vào một ngõ, màn Home (màn "Phố Hàng Bút" có đường mòn gồm các pin đánh số và thẻ tên điểm) **vẽ đường mòn theo đúng hình dáng ngõ thật** và đặt các điểm đúng thứ tự dọc ngõ.

## Dữ liệu nguồn (đã có, đã duyệt hướng)
- `data/drafts/alleys-ngo-gach-trung-yen.draft.json`: 2 ngõ, mỗi ngõ 5 điểm; `polyline` (lat, lon) là hình dáng ngõ; mỗi điểm có `order`, `name`/`summary`/`story` VI+EN (`story` có thể `null`), `photo.file` (có thể `null`), `evidence`, `pendingCheck`.
- Ảnh: `mobile/assets/photos/alleys/` (4 ảnh: dinh-thanh-ha-1, chua-cau-dong-1, pho-suong-1, bun-ca-sam-cay-si-1). Ảnh lấy từ Google Maps cho demo; ghi `credit` trên UI theo trường `photo.credit`.
- Nghiên cứu và giới hạn: `docs/content/ALLEY_RESEARCH_NGO_GACH_TRUNG_YEN_20261022.md`.

## Việc cần làm
1. **Chuyển nháp thành dataset thật** theo schema hiện hành của `data/localized/*.json` (xem `old-quarter.vi.json`, `three-lenses.vi.json`): mỗi ngõ một collection, file VI và EN. Giữ `kind: reviewed`? **Không**: nội dung chưa duyệt, dùng `kind: simulated` hoặc nhãn tương đương đang có trong schema, và ghi rõ chưa duyệt trong `disclaimer`. Không tự đổi `reviewStatus` sang approved.
2. **Đăng ký collection**: mở rộng `CollectionId`, `AVAILABLE_COLLECTIONS`, `getBundledDataset`, `COLLECTION_REVISIONS` (tính lại hash đúng cách repo đang dùng), `isCollectionId`, khóa dịch trong `translator.ts` (tên, tagline, theme, district cho cả VI/EN), ảnh bìa lấy từ ảnh có sẵn.
3. **Hình dáng ngõ trên Home** (`mobile/src/screens/HomeScreen.tsx`): hiện đường mòn được vẽ từ `PIN_CONFIG` cố định cho 6 điểm. Thêm đường dẫn mới: nếu dataset có hình dáng ngõ (`polyline` + `alongAlleyMeters`/thứ tự), chuẩn hóa polyline vào khung canvas của màn (giữ tỉ lệ, đặt dọc theo chiều cao màn hình), vẽ `mainPath` từ polyline đã làm mượt, và đặt pin dọc đường theo thứ tự điểm. Điểm chưa có tọa độ (`alongAlleyMeters: null`) đặt theo `order` giữa hai điểm có tọa độ. Dataset cũ (không có hình dáng) **không đổi hành vi**. Giữ nhánh `AlleyTrailView` khi `fontScale > 1.3` hoặc nhiều hơn 6 điểm.
4. **Nhãn trung thực**: điểm `story: null` chỉ hiện `summary` và không có nút "Đọc lời kể" giả; điểm có `pendingCheck` không hiện thành khẳng định.
5. **Ảnh**: thêm vào `mobile/src/assets/photoMap.ts` theo cách repo đang dùng; điểm không có ảnh dùng ảnh thay thế hiện có, không để ô trống.

## Ràng buộc
- Không đổi dữ liệu/lời kể trong nháp ngoài việc chuyển schema. Nếu lời kể cần sửa, ghi vào báo cáo, không tự viết thêm sự kiện lịch sử.
- Không bịa chi tiết. Chỗ dữ liệu thiếu thì để trống hoặc dùng `summary`.
- Không thêm dependency. Không động vào backend, voice, Q&A engine, Metro 8082 (không restart). Không web/PWA preview.
- Không commit, không push.
- Q&A: hai ngõ mới chưa có Q&A. Nếu app yêu cầu `qa` tối thiểu thì để mảng rỗng và báo trạng thái "chưa có dữ liệu" đúng hành vi hiện tại; không bịa Q&A.
- Giữ nguyên WIP hiện có, đặc biệt NotebookDrawerModal, Landing, Prologue.

## Nghiệm thu (bằng chứng cần nộp)
- `npm test --prefix mobile`, `npm run typecheck --prefix mobile`, `npm run lint --prefix mobile`, `git diff --check`: số liệu thật.
- Test mới (không rỗng, không tautology): (a) hai collection đăng ký đúng và dataset VI/EN hợp lệ; (b) Home với dataset có `polyline` dựng đường và pin theo đúng thứ tự `order`, dataset cũ không đổi; (c) điểm không có `story` không có nút kể giả.
- Metro 8082 (chỉ đọc): bundle iOS/Android trả HTTP 200.
- Báo cáo ngắn tại `docs/reviews/2026-10-22-antigravity-alley-integration.md`: file đã sửa, cái gì chưa kiểm trên máy thật (hình dáng đường mòn trên màn hình thật, ảnh), và mọi chỗ phải chọn tạm.
