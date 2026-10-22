# Review UI/UX màn Home (từng ngõ) và luồng — Claude, 23/10/2026

Phạm vi: đọc code `HomeScreen.tsx` (1158 dòng), `LandingScreen.tsx`, điều hướng; đo độ tương phản bằng tính toán trên ảnh thật trong repo. **Chưa xem trên máy thật.** Claude chỉ review, không sửa code.

## 1. Đo độ tương phản (tính trên ảnh bìa thật, ước lượng)

Cách đo: cắt ảnh theo `cover` ở khung 390×844, phủ scrim đúng giá trị trong code, tính tỷ lệ WCAG của vùng chữ so với từng điểm ảnh. Giới hạn: vùng header cố định y=50–110 pt; chưa tính hiệu ứng blur native (dùng Gaussian gần đúng); chưa phải ảnh chụp thiết bị. Ngưỡng WCAG AA chữ nhỏ: 4,5.

**Home hiện tại (ảnh nét, scrim 0,40), chữ vàng #FFE29A tên ngõ / chữ trắng tiến độ, trực tiếp trên ảnh:**

| Ngõ (ảnh bìa) | Tên ngõ: tệ nhất / trung vị | Tiến độ: tệ nhất / trung vị | Điểm ảnh dưới 4,5 (tên ngõ) |
| --- | --- | --- | --- |
| Trung Yên | 2,42 / 4,80 | 3,02 / 5,97 | 38% |
| Tạm Thương | 2,01 / 2,33 | 2,50 / 2,90 | 96% |
| Cấm Chỉ | 2,01 / 5,38 | 2,50 / 6,70 | 37% |
| Phất Lộc | 2,01 / 3,14 | 2,50 / 3,91 | 68% |
| Ngõ Gạch | 2,01 / 2,01 | 2,50 / 2,50 | 91% |

→ Header Home **không đạt AA ở cả 5 ngõ**. Nhãn điểm có chip nền tối: tệ nhất 12,99, đạt rất rộng.

**Landing (blur + scrim rêu rgba(18,30,23,α)), chữ trắng:** α=0,68: tệ nhất 5,9 (kể cả không blur: 5,8) → blur không đóng góp vào tương phản, chỉ scrim. α=0,62: 4,9; α=0,60: 4,6 (blur 14) / 4,5 (blur 6); α=0,58: 4,3 (rớt); α=0,55: 3,9.

**Đề xuất đo được:**
- Landing: giữ α ≥ 0,62; giảm blur xuống ~6 để ảnh rõ hơn; đừng giảm α dưới 0,60.
- Home: giữ ảnh nét và scrim 0,40; thêm một dải tối rgba(20,24,19,0,55–0,60) chỉ sau vùng header, tên ngõ vàng ≥ 5,8–6,5, tiến độ trắng ≥ 7,3–8,1. Không làm tối cả ảnh.

## 2. Phát hiện và quyết định của người dùng

| # | Phát hiện | Quyết định người dùng (23/10) |
| --- | --- | --- |
| H1 | Nút EN trên Home dẫn vào ngõ cụt với 3 ngõ mới chỉ có tiếng Việt (HomeScreen L89, L217) | Làm tiếng Anh cho cả 4 ngõ, sinh voice VI (Nhật Phong) và EN (Talia). Đảo D3 và D6 trước đó. |
| H2 | Header nhồi 4 thứ; "Câu chuyện ngõ" (L330) lạc loài; hai nút gần tên nhau (L591) | Theo đề xuất, có xét luồng ứng dụng |
| H3 | Thẻ xem trước và dock chiếm ~200 pt đáy; dock 2 nút trùng Landing | Theo đề xuất |
| H4 | Chạm ghim chỉ để chọn, đọc cần chạm lần hai | Theo đề xuất |
| H5 | Nền Home 0,40 không nhất quán với Landing | Landing giảm bớt độ mờ; Home vẫn ảnh nét để thấy con ngõ |
| H6 | Chữ dưới 12 px (L863, L1071, L1087, L1092) | Sửa |
| H7 | Cảnh báo pendingCheck thô (L564) | Sửa theo đề xuất |
| H8 | Chữ "Demo/Live" trong tiến độ (L283) và mọi ghi nguồn/giả định/demo | Bỏ hết (xem mục 3, cần chốt) |
| H9 | Hai bố cục Home theo số điểm / fontScale | Theo đề xuất |
| H10 | Dòng trạng thái "Truyện chữ · Demo" | Thay bằng một câu ngắn (đề xuất ở mục 4) |
| H11 | Mã style chết (polaroid, scrapbook, handwriting, exploreCta, dockCenterCircle, PIN_CONFIG emoji) | Dọn |

Về luồng: thẻ carousel Landing đi thẳng `Home` (L230), `AlleySelect` chỉ qua "See all" (L167), nên tầng chọn ngõ không dư. Luồng thực tế là Landing → Home → Qa. Việc bỏ nút ngôn ngữ khỏi Home chỉ ổn nếu đổi ngôn ngữ vẫn có ở Landing và ở Sổ tay (Home và Qa cũng phải đọc được ngay ngôn ngữ đã chọn).

## 3. Cần người dùng chốt trước khi giao

1. **Bỏ hết ghi nguồn/mô phỏng/demo mâu thuẫn với quy tắc đang có.** AGENTS.md: "phải ghi rõ nguồn của mọi câu trả lời", "không bịa lịch sử/nguồn", dữ liệu mô phỏng "ghi rõ là mô phỏng". Đề xuất giữ phần này: bỏ nhãn trang trí (Demo/Live, "mô phỏng", "Nguồn:" trong chrome, banner) nhưng giữ (a) chip nguồn trong câu trả lời Q&A (`ClickableSources`), (b) một mục "Về nội dung và nguồn" trong Sổ tay, (c) câu rào cho dữ kiện chưa xác minh như giờ mở cửa. Fiction Letter và Old Quarter Pilot là nội dung hư cấu/mô phỏng thật, bỏ hết nhãn nghĩa là người dùng cuối không còn biết. Anh xác nhận đúng ý "bỏ hết" hay theo đề xuất giữ ba điểm trên.
2. **Tiếng Anh là nội dung mới, không phải chuyển ngữ máy móc.** Doc nguồn chỉ có tiếng Việt. Bản EN cho 3 ngõ mới và `alleyStory`/`guide` cần dịch trung thành, giữ nguyên câu rào, không thêm sự kiện; anh duyệt bản EN trước khi sinh voice EN.
3. **Sinh voice thật.**
   - Cần `ELEVENLABS_API_KEY` do anh giữ; không ai commit, in hay ghi log khóa. Anh phải tự chạy lệnh sinh hoặc cấp khóa vào môi trường bằng cách riêng (gợi ý dùng `! <lệnh>` trong terminal).
   - Số ký tự VI đếm offline: 2.432 (4 intro). EN chưa có nên chưa đếm; chi phí chưa kiểm. Giữ RESERVE 30000 / BUDGET 80000, `can_extend_character_limit=false`, chạy `dry-run` và chờ anh duyệt chi phí trước khi `generate`.
   - Script `tools/voice/generate_alleys_intro.py` chưa tồn tại; phải làm từ mẫu Nhật Phong; Talia EN dùng `eleven_v4`, `{"stability":0.5,"similarity_boost":0.75}`.
   - Sau sinh: nghe thử thật (tên Cấm Chỉ, Chúa Chổm, Tạm Thương, Yên Thái, Ỷ Lan, Tiên Hạ, Phất Lộc, Thái Bình...) vì chưa ai nghe. `humanApproved` giữ false cho tới khi anh nghe và duyệt.
4. **Thứ tự dọn bỏ nhãn và tách việc.** Gộp "bỏ nhãn nguồn" với "redesign Home" thành một đợt dễ lẫn. Đề xuất tách: (A) nội dung + EN + voice, (B) Home UI/UX + đổi nền Landing, (C) dọn nhãn. Đợt nào xong thì Claude review đợt đó khi anh gọi.
5. **Cây làm việc.** Commit `1b7827f` đã có Landing + bốn ngõ; trước khi giao tiếp, Codex chốt trạng thái commit và không đẩy nếu anh chưa yêu cầu.

## 4. Câu thay "Truyện chữ · Demo"

- VI: **"Chọn một con ngõ để bắt đầu câu chuyện."**
- EN: **"Choose an alley to begin its story."**

Không nói "nghe" vì ngõ chưa có voice vẫn có thể được mở. Đổi chế độ Demo/Live nằm trong Sổ tay; các thẻ loading/error/empty trên Landing giữ nguyên.

## 5. Chưa kiểm

Máy thật (độ tương phản thực, blur iOS/Android, fontScale 1,3 và 2,0), ghim đè nhãn với tên dài ("Khu vực chợ Hàng Bè và phố Gia Ngư"), nghe voice, backend nhận trường mới (`alleyStory`, `guide`), AlleySelect và Qa chưa rà lần này.

## 6. Quyết định chốt của người dùng (23/10, lượt 2) — thay thế mục 3

1. **Bỏ hết nhãn nguồn/demo/mô phỏng/giả định** trong UI, kể cả chip nguồn trong Q&A và mục "Về nội dung và nguồn"; người dùng sẽ thêm chính sách sau, **hiện tại không làm**. Đây là quyết định của chủ dự án, thay cho đề xuất giữ ba thứ ở mục 3; lệch với câu "ghi rõ nguồn" trong AGENTS.md, Codex ghi chú lại nhưng không tự thêm lại nhãn. Rủi ro đã được nêu: nội dung hư cấu/mô phỏng không còn nhãn cho tới khi có policy.
2. **Thứ tự ngõ trên Landing và AlleySelect:** ngõ có dữ liệu thật lên đầu, ưu tiên Ngõ Trung Yên đầu tiên; `fiction-letter` và `old-quarter-pilot` (hai bộ mô phỏng) đẩy về cuối.
3. **Tiếng Anh cho cả 4 ngõ:** đồng ý (trả lời "ok"). Dịch trung thành, giữ nguyên dữ kiện và câu rào.
4. **Voice:** khóa ElevenLabs đã có sẵn trong môi trường của người dùng; **không cần dry-run, chạy thẳng, chi phí không phải lo**. Vẫn giữ: không in/commit khóa, giữ RESERVE/BUDGET và `can_extend_character_limit=false` của script, ghi file tạm rồi đổi tên, không tự gọi lại yêu cầu trả phí bị lỗi khi chưa biết kết quả, `humanApproved:false` tới khi người dùng nghe. VI = Nhật Phong, EN = Talia. Văn bản đọc đúng `intro.text`, không LLM.
5. **Tách ba đợt A/B/C:** chốt.
6. **Hai điểm bất hợp lý người dùng nêu thêm:** (a) có hai nút Sổ tay trên Landing; (b) giao diện nhảy khi đổi VI→EN. Xem mục 7.

## 7. Hai lỗi UX bổ sung (đọc code, chưa thấy trên máy)

**(a) Hai nút Sổ tay trên Landing** — `LandingScreen.tsx` có `landing-header-notebook` (L134) và ô công cụ `landing-quick-notebook` (L309), cùng mở `NotebookDrawerModal`. Lỗi này do spec Landing của Claude (`docs/LANDING_REDESIGN_SPEC_20261022.md` mục 3 và 6 yêu cầu cả hai); Claude nhận lỗi. Đề xuất: giữ nút ở header, ô công cụ thứ hai đổi thành thao tác khác (ví dụ chỉ còn GPS, hoặc "Tiếp tục đọc") hoặc bỏ ô. Home cũng có "Sổ tay" ở dock; khi làm đợt B chỉ giữ một lối vào Sổ tay mỗi màn.

**(b) Giao diện nhảy khi đổi VI→EN** — nguyên nhân khả dĩ theo code, chưa tái hiện:
- Landing: `getLocalizedCollections('en')` lọc bỏ các ngõ trong `VI_ONLY_COLLECTION_IDS` (collections.ts L242), nên carousel mất thẻ và đổi thứ tự khi đổi ngôn ngữ.
- Home: ngõ chỉ-Việt khi sang EN thay cả màn bằng `UnavailableScreen` (HomeScreen L217).
- Chuỗi EN dài/ngắn khác VI làm header, tagline và thẻ đổi chiều cao khi không có chiều cao cố định.
- Sau khi cả 4 ngõ có EN và bỏ `VI_ONLY_COLLECTION_IDS`, hai nguyên nhân đầu mất. Nguyên nhân thứ ba cần chiều cao cố định cho header/thẻ (đợt B). Ngõ Gạch và Trung Yên VI/EN hiện cùng số node và cùng id nên không phải nguyên nhân.
- Cần người dùng nói màn nào nhảy (Landing, Home hay Qa) để xác nhận.
