# Kế hoạch giao việc 23/10/2026 — Home/Landing UI-UX, tiếng Anh bốn ngõ, voice

Người lập: Claude (theo yêu cầu người dùng). **Codex chỉ điều phối**: giao việc cho các agent dưới đây, theo dõi, rồi tổng hợp báo cáo gửi Claude review. Codex không tự làm các đầu việc lớn. Căn cứ: `docs/reviews/2026-10-23-claude-home-uiux-review.md` (số đo tương phản, quyết định người dùng mục 6–7), `docs/content/FOUR_ALLEYS_EN_NARRATION_20261023.md` (lời kể EN), `docs/VOICE_GUIDE_FOUR_ALLEYS_20261022.md`, plan bốn ngõ `2026-10-22-four-alley-content.md`.

## Quyết định người dùng (chốt, không hỏi lại)

1. Bỏ **hết** nhãn nguồn/demo/mô phỏng/giả định trong UI, kể cả chip nguồn Q&A. Chính sách sẽ thêm sau; **không thêm lại** nhãn nào. (Lệch AGENTS.md "ghi rõ nguồn"; ghi chú vào MEMORY, không tự khôi phục.)
2. Thứ tự ngõ: dữ liệu thật lên đầu, **Ngõ Trung Yên đầu tiên**; `fiction-letter` và `old-quarter-pilot` về cuối. Đề xuất thứ tự: trung-yen, ngo-gach, tam-thuong, cam-chi, phat-loc, old-quarter-three-lenses, old-quarter-pilot, fiction-letter (vị trí three-lenses là giả định của Claude; người dùng chưa nói).
3. Làm **tiếng Anh cho cả 4 ngõ** (đảo D3 cũ) → gỡ `VI_ONLY_COLLECTION_IDS`. Nút ngôn ngữ trên Home **giữ**.
4. Voice: Việt = Nhật Phong (`6adFm46eyy74snVn6YrT`, `eleven_v3`, `language_code: vi`), Anh = Talia (`OZ0L6eISlOejga3XjDFt`, `eleven_v4`, `{"stability":0.5,"similarity_boost":0.75}`). **Khóa ElevenLabs đã có trong môi trường của người dùng; người dùng cho phép sinh thẳng, không dry-run, không giới hạn lo chi phí.** Đảo D6 cũ. Vẫn giữ: không in/commit/log khóa; RESERVE/BUDGET và `can_extend_character_limit=false` trong script mẫu; ghi file tạm rồi đổi tên; không tự gọi lại yêu cầu trả phí bị lỗi khi chưa biết kết quả; `humanApproved:false` tới khi người dùng nghe.
5. Chia ba đợt: **A** nội dung + EN + voice, **B** UI/UX Home + Landing, **C** dọn nhãn. Mỗi đợt xong gửi Claude review khi người dùng gọi; yêu cầu "xong thì Codex tổng hợp gửi Claude rv" của người dùng ngày 23/10 là lệnh gọi review cho đợt này.

## Phân công (Codex giao, không tự làm)

| Agent | Vai | Việc |
| --- | --- | --- |
| Antigravity (W2) | App/FE | Đợt B và C |
| Codex Luna `gpt-6-luna` (W3) | Dữ liệu, voice, backend | Đợt A: dataset EN, script voice, sinh voice, đăng ký catalogue, kiểm backend nhận trường mới |
| OpenCode Muse (W4) | QA/E2E | Test hồi quy, kiểm nhảy giao diện khi đổi ngôn ngữ, báo cáo |
| Codex (W1) | Điều phối | Giao việc, chốt WIP trước khi bắt đầu, gom báo cáo, gửi Claude |

Trước khi bắt đầu: nhánh `valentino/logic-fix-mobile-20261020` đang ở `1b7827f`; chốt/commit WIP của các agent trước khi giao, không push, không merge main, không web/PWA, không restart Metro đang chạy của người dùng.

## Đợt A — nội dung, tiếng Anh, voice (Luna)

- A1. Dataset EN cho `ngo-tam-thuong`, `ngo-cam-chi`, `ngo-phat-loc`; cập nhật đầy đủ `ngo-trung-yen.en.json` (kể cả `alleyStory`, `guide`) cho khớp VI. `intro.text` EN lấy **nguyên văn** từ `docs/content/FOUR_ALLEYS_EN_NARRATION_20261023.md`. Dịch `alleyStory`/`guide` trung thành, giữ câu rào và dữ kiện, không thêm sự kiện; cùng id node/số điểm/evidence như VI. Cập nhật `collections.ts` (gỡ VI-only), `COLLECTION_REVISIONS`, import backend nếu cần. Test: mỗi collection có đủ VI/EN, id node khớp nhau, `getLocalizedCollections('en')` trả đủ 8 ngõ.
- A2. Script `tools/voice/generate_alleys_intro.py` từ mẫu `generate_nhat_phong_three_lenses.py`: chế độ kiểm văn bản offline, giữ RESERVE/BUDGET, resume bằng progress, ghi tạm rồi đổi tên.
- A3. **Sinh voice VI ngay** (4 track, Nhật Phong, đọc đúng `intro.text` VI), kiểm giải mã MP3/định dạng/SHA-256/textHash, đăng ký vào `alleysCatalog.ts` thay slot rỗng, giữ fallback chữ. Đọc khóa chỉ từ `ELEVENLABS_API_KEY`/`.env.local`.
- A4. **Sinh voice EN (Talia)**: bản dịch lời kể đã được Claude đọc đối chiếu và duyệt theo ủy quyền của người dùng (23/10, xem cuối `FOUR_ALLEYS_EN_NARRATION_20261023.md`), nên **không còn chờ người dùng**. Sinh sau khi A1 xong và `intro.text` EN trong dataset đúng nguyên văn bản đã duyệt. Phát âm chưa ai nghe: `humanApproved:false`.
- Kiểm: `npm test`, typecheck, lint, `git diff --check`; báo số liệu thật, số ký tự thật đã gửi, giữ chưa nghe/chưa duyệt.

## Đợt B — UI/UX (Antigravity)

Chỉ làm sau khi A1 gỡ VI-only (tránh làm hai lần). Đo độ tương phản: Claude đã đo (mục 1 review), số là **ước lượng** từ ảnh, cần đo lại trên máy.

- B1. **Landing nền:** giảm blur `HERO_PHOTO` xuống ~6, scrim `rgba(18,30,23,α)` **α ≥ 0,62** (không dưới 0,60: đo 4,5–4,6 là sát ngưỡng).
- B2. **Home nền:** giữ ảnh nét, giữ scrim 0,40; thêm **dải tối chỉ sau header** `rgba(20,24,19,0,55–0,60)` để tên ngõ vàng ≥5,8 và tiến độ ≥7,3 (hiện 2,0–3,0, rớt AA ở cả 5 ngõ). Không làm tối cả ảnh.
- B3. **Thanh công cụ dùng chung ở đáy (thumb zone), thay hai Sổ tay và ô công cụ** (người dùng chốt 23/10: giữa là QR, hai bên là GPS và Sổ tay; Hộ chiếu lên header). Component `ToolDock` dùng cho Landing và Home, **3 mục luôn có chữ**: trái **Vị trí (GPS)**, giữa **Quét QR (Camera)**, phải **Sổ tay**.
  - Mục giữa nổi bật hơn hai bên (nền màu nhấn, rộng/cao hơn, ví dụ khối 64 pt), nhưng nằm trong thanh, **không đè lên nội dung** carousel hay thẻ xem trước. Hai bên cùng kích thước. Mỗi mục có vùng chạm ≥44, thanh `minHeight` 56 (mục giữa ≥60), biểu tượng 24 + nhãn ≥12 px (nhãn viết hoa ≥11), khoảng cách ≥8, nằm trên safe area, nền `rgba(26,18,14,0,86)` cho chữ trắng ≥4,5 (trên Home, đo lại sau khi có dải tối B2).
  - fontScale >1,3: nhãn tối đa 2 dòng, thanh cao theo nội dung; fontScale 2,0: không cắt chữ, không tràn ngang. Không cuộn ngang vì chỉ có 3 mục.
  - **Hộ chiếu ngõ lên header Landing**: nút ≥44 pt, biểu tượng + nhãn ngắn ("Hộ chiếu") khi fontScale ≤1,3, chỉ biểu tượng có `accessibilityLabel` khi lớn hơn; header Landing còn logo, VI|EN, Hộ chiếu, và phải vừa chiều ngang 360 pt không xuống dòng ở fontScale 1,0. Mặc định Claude: Hộ chiếu **chỉ có trên header Landing**; Home đã đủ chỗ (Quay lại, tên ngõ + tiến độ, ngôn ngữ) nên vào Hộ chiếu bằng cách quay về Landing. Bỏ mục Hộ chiếu khỏi Sổ tay để mỗi chức năng chỉ có một lối vào (Sổ tay còn Plan, đổi Demo/Live, ngôn ngữ).
  - Bỏ nút Sổ tay ở header Landing, bỏ hai ô công cụ giữa trang, bỏ dock hai nút cũ trên Home. Test: một `testID` Sổ tay mỗi màn, `ToolDock` có đúng 3 mục theo thứ tự GPS, QR, Sổ tay.
- B4. **Home header gọn:** Quay lại (≥44), tên ngõ + tiến độ, nút ngôn ngữ giữ. Chuyển nút sắc thái ánh sáng (🌅) vào Sổ tay hoặc bỏ. Thẻ "Câu chuyện ngõ" thành thẻ mở đầu ngay trên bản đồ, đặt tên khác nút "Đọc câu chuyện" của điểm (ví dụ "Về con ngõ" so với "Đọc chuyện điểm này").
- B5. **Chạm ghim:** chạm ghim đã chọn mở thẳng truyện; thẻ xem trước dưới bản đồ gọn lại (giảm ~200 pt xuống mức còn đủ chỗ cho bản đồ, kể cả fontScale 1,3).
- B6. **Landing thứ tự và ổn định:** áp thứ tự ngõ ở trên; thẻ carousel có chiều cao cố định (không giãn theo chuỗi VI/EN); **Người dùng xác nhận 23/10: nhảy xảy ra ở Landing, trước khi vào ngõ.** Nguyên nhân theo code (chưa tái hiện): carousel EN mất 3 thẻ VI-only (collections.ts:242); chân thẻ `alleyCardFooter` không có chiều cao tối thiểu, `tagline` `numberOfLines={2}` nên 1 dòng so với 2 dòng làm thẻ co giãn; `theme`, `district`, tên ngõ đổi độ dài giữa VI/EN. Sửa: đặt `minHeight` cho chân thẻ đủ chứa tagline 2 dòng + meta, thẻ có chiều cao cố định, bỏ lọc VI-only. Muse kiểm lại trước/sau khi đổi ngôn ngữ ở Landing. đổi VI↔EN không đổi số thẻ, thứ tự hay chiều cao thẻ, header và dòng trạng thái; test kiểm bằng cách so kích thước layout hai ngôn ngữ.
- B7. **Dòng trạng thái:** thay "Truyện chữ · …" bằng câu tĩnh: VI "Chọn một con ngõ để bắt đầu câu chuyện." / EN "Choose an alley to begin its story." Giữ thẻ loading/error/empty/retry/switch-to-demo; đổi Demo/Live chỉ ở Sổ tay.
- B8. **Cỡ chữ ≥12 px** (nhãn viết hoa ≥11) cho `pinLabelTitle`, `previewVisitedText`, `previewCreditText`, `previewPendingNotice`. Viết lại `pendingCheck` thành câu ngắn cho người đọc, bỏ ⚠️ (nội dung câu do chủ nội dung quyết định, FE không tự đặt).
- B9. **Dọn mã chết** trong `HomeScreen.tsx`: polaroid/scrapbook/handwriting/exploreCtaButton/dockCenterCircle/`PIN_CONFIG` emoji, nếu không còn chỗ dùng (kiểm bằng tìm kiếm trước khi xóa, báo danh sách).
- B10. Thống nhất hai bố cục (bản đồ so với danh sách khi fontScale >1,3 hoặc >6 điểm): ghi rõ điều kiện chuyển và để người dùng biết vì sao (nhãn/ghi chú chữ lớn); không bắt buộc đồng nhất hoàn toàn.

## Đợt C — dọn nhãn (Antigravity, sau B)

Bỏ mọi chuỗi và thành phần hiển thị: "Demo/Live" trong tiến độ và dòng trạng thái, "mô phỏng", "giả định", `disclaimer`, `ClickableSources`/chip nguồn trong Q&A, "Nguồn:", photo credit trong Home và Q&A, mục "Về nội dung và nguồn". Giữ dữ liệu `evidence` trong dataset (không xóa dữ liệu). Cập nhật các test đang kiểm các nhãn này và ghi rõ test nào đổi, vì sao. Không thêm lại nhãn thay thế.

## Nghiệm thu và bàn giao review

- Mỗi đợt: số liệu thật `npm test --prefix mobile`, typecheck, lint, `git diff --check`; Metro chỉ đọc (bundle iOS/Android HTTP 200); báo cáo ngắn từng agent trong `docs/reviews/`.
- Nêu rõ chưa kiểm: máy thật (tương phản thực, blur iOS/Android, fontScale 1,3 và 2,0, `ToolDock` ở chữ lớn), nghe voice, nhãn dài trên ghim ("Khu vực chợ Hàng Bè và phố Gia Ngư"), backend nhận `alleyStory`/`guide`.
- Codex tổng hợp một báo cáo gộp rồi gửi Claude review; Claude kiểm độc lập, không sửa code.

## Việc cần người dùng

- (Tùy chọn) đọc lại bản dịch lời kể EN; Claude đã duyệt thay, người dùng vẫn có thể sửa cách dịch (Communal House/Temple/Imperial Consort...) trước khi sinh nếu muốn.
- Nghe voice sau khi sinh, báo phát âm sai.
- Kiểm trên điện thoại: tương phản, chữ lớn, `ToolDock`, nhảy khi đổi ngôn ngữ.
- Chọn ảnh cho Tạm Thương, Cấm Chỉ; kiểm thực địa giờ mở cửa và địa chỉ (đình Trung Yên, đền Tiên Hạ 46/48, Xôi Hồng, Bún đậu Trung Hương).
- Viết policy nguồn/demo khi muốn khôi phục thông tin này.
