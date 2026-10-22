# Lời kể tiếng Anh cho voice bốn ngõ (Talia) — bản dịch của Claude, 23/10/2026

Nguồn: `intro.text` tiếng Việt trong `data/localized/ngo-{trung-yen,tam-thuong,cam-chi,phat-loc}.vi.json` (phần 2 của doc nguồn). Bản này dịch **trung thành**: không thêm sự kiện, giữ nguyên các câu rào ("theo tư liệu", "chưa được xác minh", "tương truyền"). Tên riêng giữ dấu tiếng Việt. Người dùng đã đồng ý hướng EN (23/10); bản dịch đã được Claude duyệt theo ủy quyền của người dùng (xem cuối file).

Khi duyệt xong, mỗi khối dưới đây là `intro.text` của dataset `.en.json` tương ứng và là văn bản đọc nguyên văn cho Talia (`eleven_v4`, `{"stability":0.5,"similarity_boost":0.75}`). Không đổi chữ để ép cách phát âm; nếu Talia đọc sai tên riêng thì báo lại để chọn cách xử lý.

## 1. ngo-trung-yen (EN)

Did you know that today's Trung Yên Alley was once linked to an ancient lake in Hanoi?

According to historical sources, this place preserves traces of the old Chung Yên village. The areas of Đinh Liệt and Gia Ngư once belonged to Thái Cực Lake, part of the network of waters around Hoàn Kiếm Lake. Over time, the lake was gradually filled in, and streets took shape.

Deeper inside the alley, you will come across Trung Yên Communal House, a monument with the tube-house architecture typical of the Old Quarter, ranked as a national monument in 2008.

Today, the smell of beef pho and fish noodles, and the calls of vendors taking orders, have become part of everyday life. Among the crowded eateries, Trung Yên Alley still keeps the story of a land that has changed across many generations.

## 2. ngo-tam-thuong (EN)

Have you ever wondered why a small alley off Hàng Bông Street is called Tạm Thương?

According to historical sources, the name comes from a temporary storehouse for tax rice in the early nineteenth century. The old granary is long gone, but the name has been kept through many generations.

Deeper inside the alley, you can find Yên Thái Communal House, which honors Imperial Consort Ỷ Lan, a prominent figure of the Lý dynasty.

Today, in place of the granary, there are stalls frying nem chua, the sound of conversation, and the snacking rhythm of Hanoi life.

In Tạm Thương, the name of an alley alone can open the story of many layers of urban life.

## 3. ngo-cam-chi (EN)

In the heart of Hanoi, there is an alley with a very special name: Cấm Chỉ.

Folk tales say the name is linked to Chúa Chổm, who later became King Lê Trang Tông. In his humble early days, he often ate on credit at food stalls. When he was welcomed back to become king, many of his old creditors came, pointing and demanding payment.

Legend has it that an order of prohibition was issued, and from then on people called this place Cấm Chỉ.

It is an anecdote that has not been verified as a historical event, but it remains an engaging story tied to the name of the alley.

Today, Cấm Chỉ no longer suggests prohibition. On the contrary, it welcomes diners with eateries, lights, and the rhythm of food life in the Old Quarter.

## 4. ngo-phat-loc (EN)

In the Old Quarter of Hanoi, there is an alley named after a village in Thái Bình: Phất Lộc.

According to sources on local history, residents who left their home village to make a living in Thăng Long brought the old village name with them to name their new home.

Over many generations, Phất Lộc became a place to live and trade. The Tiên Hạ Temple in the alley is associated with the noted official Nguyễn Trung Ngạn of the Trần dynasty, while the bún đậu stalls and simple eateries carry on the story of the people's livelihoods.

Phất Lộc is therefore more than the name of an alley. It is the mark of people who carried the memory of their homeland to build a new life in the heart of Thăng Long, Hanoi.

## Điểm dịch cần người duyệt chú ý

- "đình Trung Yên" dịch "Trung Yên Communal House"; "đình Yên Thái" dịch "Yên Thái Communal House"; "Đền Tiên Hạ" dịch "Tiên Hạ Temple". Nếu muốn giữ nguyên tên Việt, đổi đồng loạt và báo để nhất quán với các màn EN khác.
- "Nguyên phi Ỷ Lan" dịch "Imperial Consort Ỷ Lan".
- "nem chua rán" dịch "stalls frying nem chua" (giữ ý "rán" bằng động từ).
- Câu "cấp quốc gia năm 2008" giữ "national monument in 2008" như doc nguồn; chưa ai kiểm lại nguồn chính thức ngoài danh sách tham khảo của doc.
- Các nguồn tham khảo (`intro.evidence`) giữ nguyên bản tiếng Việt/nguồn gốc, không dịch.

## Kết quả duyệt (Claude, 23/10/2026, theo ủy quyền "m đọc rồi đánh giá, tự duyệt nếu hợp lý")

Đã đối chiếu từng câu với `intro.text` VI của bốn dataset: **đạt, dùng được**. Kiểm: không thêm sự kiện, tên riêng, số liệu hay địa điểm ngoài bản VI; giữ đủ các câu rào ("According to historical sources", "Legend has it", "has not been verified as a historical event", "Folk tales say"); năm/thế kỷ/triều đại khớp (2008, đầu thế kỷ XIX, Lý, Trần, Lê Trang Tông); tên ngõ, phố, đình, đền giữ dấu. Chữ đọc được liền mạch cho TTS, không có số hay ký hiệu khó đọc.

Giới hạn: đây là duyệt độ trung thành và độ phù hợp với dự án, **không phải duyệt phát âm** (Talia đọc tên Việt chưa nghe) và không kiểm lại dữ kiện lịch sử ngoài doc nguồn (ví dụ "national monument in 2008" lấy từ doc). Chỗ đã chốt lại: "Imperial Consort Ỷ Lan", "Communal House", "Temple" giữ như trên. Nếu sau khi nghe Talia đọc sai tên riêng, báo Claude để chọn cách xử lý, không tự đổi chữ.
