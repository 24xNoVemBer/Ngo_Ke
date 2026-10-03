# Ngõ Kể — Khung UI: 8 màn hình và 2 bảng phụ

**Phiên bản:** 0.1 · **Ngày:** 03/10/2026 · **Trạng thái:** Bản nháp gửi nhóm design review.

**Mục đích:** Chốt cấu trúc màn hình, phân cấp nội dung, hành động và các trạng thái trước khi dựng giao diện chi tiết. Nhóm design có thể ghi góp ý trực tiếp vào mục 9 của file này.

**Nền tảng:** App native Android/iOS, Expo + React Native.

## 1. Bối cảnh và nguồn chuẩn

- [TECH_DEMO_PLAN.md](TECH_DEMO_PLAN.md): hành vi sản phẩm và phạm vi theo phase.
- [PRO-NgoKe-MVP.md](PRO-NgoKe-MVP.md): yêu cầu, user journey và tiêu chí chấp nhận.
- [TechDesign-NgoKe-MVP.md](TechDesign-NgoKe-MVP.md): bối cảnh điểm, nguồn dữ liệu và fallback.
- [MVP_ROADMAP.md](MVP_ROADMAP.md): roadmap và dữ liệu cần có.
- [APP_FLOW.md](APP_FLOW.md): đối chiếu luồng dự kiến với source; phần trạng thái trong tài liệu đó là ảnh chụp trước lần duyệt Phase 2 mới nhất.
- [MEMORY.md](../MEMORY.md): trạng thái và bằng chứng duyệt hiện hành.
- [Spec Phase 3](superpowers/specs/2026-10-03-phase-3-recommendation-design.md): quy tắc gợi ý và cách nhập quỹ thời gian đã chốt.

**Trạng thái khi viết:** Phase 1–2 đã được người dùng duyệt; nội dung vẫn mô phỏng. Phase 3 được phép triển khai, quy tắc gợi ý đã chốt ngày 03/10/2026. Phase 4–7/voice chưa được duyệt. Home và Q&A đã có code; các màn trong file là khung thiết kế để review, không phải xác nhận toàn bộ chức năng đã có trong build.

Tài liệu này là đề xuất thiết kế tổng thể. Review khung UI không tự cấp quyền triển khai phase tiếp theo. Các tên dưới đây là tên thiết kế, chưa khóa route/file trong code.

### Nguyên tắc sản phẩm cần giữ

1. Q&A trả nguyên nội dung đã chuẩn bị có nguồn; câu lạ/thiếu evidence báo chưa có dữ liệu.
2. Demo ghi rõ mô phỏng. Tọa độ/thời lượng demo không dùng đi bộ thực địa.
3. Live chỉ dùng dữ liệu thật đã review; lỗi hoặc thiếu dữ liệu không tự chuyển sang Demo.
4. Điểm được gợi ý/được chọn chưa phải điểm đã xác nhận. GPS chỉ đưa candidate, cần người dùng xác nhận.
5. Camera/GPS chỉ dùng sau thao tác; rời màn camera dừng preview. Chọn tay và đọc chữ luôn có đường dùng.
6. Core hiện là trải nghiệm bằng chữ. TTS/STT thuộc phase riêng; không đặt nút micro/phát giọng trong bộ khung này.

## 2. Danh mục 8 màn hình và 2 bảng phụ

| Mã | Tên | Vai trò | Phase chức năng |
| --- | --- | --- | --- |
| UI-01 | Trang chủ | Chọn nguồn, xem trạng thái, bắt đầu khám phá | 1–2; Live thật ở 6 |
| UI-02 | Giới thiệu & hỏi đáp | Intro, câu hỏi mẫu/nhập chữ, đáp án có nguồn, hỏi tiếp | 2; lối sang trải nghiệm ở 3 |
| UI-03 | Chọn trải nghiệm | Chọn chủ đề và quỹ thời gian | 3 |
| UI-04 | Điểm được gợi ý | Tối đa ba điểm có lý do/thời lượng; chọn điểm muốn khám phá | 3; lối xác nhận ở 4–5 |
| UI-05 | Quét QR xác nhận điểm | Quét QR của node đã biết | 4 |
| UI-06 | Chọn điểm bằng tay | Chọn điểm và xác nhận rõ ràng | 4 |
| UI-07 | Người kể tại điểm | Camera + người kể 2D + caption; biến thể đọc chữ | 4 |
| UI-08 | Xác nhận gợi ý GPS | Một candidate, độ chính xác/khoảng cách khi có, xác nhận/chọn lại | 5 |
| BP-01 | Nguồn nội dung | Xem nguồn của đúng intro/đáp án/lời kể đang mở | 2/4; dữ liệu thật ở 6 |
| BP-02 | Trạng thái dữ liệu | Giải thích nguồn, offline, empty/error và hành động xử lý | 1–2; API ở 6–7 |

**Cách dùng bảng phụ đề xuất:** Bottom sheet native có nút Đóng, hỗ trợ cuộn và mở rộng khi chữ lớn/nội dung dài. Nội dung nguồn và lỗi quan trọng vẫn phải có dấu hiệu trên màn chính; không bắt người dùng mở bảng mới biết đang dùng Demo hoặc gặp lỗi.

## 3. Luồng điều hướng

```text
UI-01 Trang chủ
  → UI-02 Giới thiệu & hỏi đáp
      ├─ Chọn/nhập câu hỏi → đáp án + nguồn → hỏi tiếp tại UI-02
      └─ Chọn trải nghiệm → UI-03
          → UI-04 Điểm được gợi ý
              ├─ Quét QR → UI-05
              ├─ Chọn tay → UI-06
              └─ Yêu cầu GPS → UI-08
                  ↓
              Điểm được xác nhận
                  ↓
              UI-07 Người kể tại điểm / đọc chữ
                  ├─ Hỏi tiếp → UI-02 với bối cảnh điểm đã xác nhận
                  └─ Chọn trải nghiệm tiếp → UI-03

UI-05: QR lạ/từ chối camera → UI-06
UI-08: chọn lại → UI-04 hoặc UI-06, giữ nguyên điểm hiện tại
BP-01: mở từ nội dung có nguồn; đóng về đúng màn gọi
BP-02: mở từ trạng thái dữ liệu; đóng về đúng màn gọi
```

Người dùng có thể chuyển sang trải nghiệm sau intro, không bắt buộc phải gửi câu hỏi trước. Các đường sang điểm mới/Q&A nhiều điểm là hành vi dự kiến, chưa có trong code Phase 2.

**Quay lại:** Dùng Back native/nút Quay lại. Đóng bảng phụ trước khi rời màn bên dưới. Back khỏi bước chọn/gợi ý/GPS chưa xác nhận không làm đổi điểm hiện tại. Từ UI-07 quay về bước xác nhận phải dừng camera; xử lý stack sau QR thành công cần nhóm design và dev chốt để không tự quét lại khi Back.

## 4. Chi tiết từng màn hình

Các khối `[Tên điểm]`, `[Nội dung]` trong wireframe là vị trí dữ liệu, không phải nội dung lịch sử được tự tạo. Wireframe mô tả thứ tự nội dung; màn thực tế được cuộn/adapt theo thiết bị.

### UI-01 — Trang chủ

**Mục tiêu:** Biết app dùng nguồn nào và bắt đầu được trải nghiệm.

```text
Ngõ Kể
Nguồn dữ liệu: [Demo] [Live]
[Nhãn nguồn + trạng thái + Xem chi tiết]
[Tên điểm khởi đầu / mô phỏng trong Demo]
[Mô tả ngắn cách trải nghiệm]
[Bắt đầu khám phá]
Các điểm trong demo: [danh sách tên điểm]
```

- CTA chính: **Bắt đầu khám phá** → UI-02 khi dataset dùng được.
- Chọn Demo/Live ngay tại màn; **Xem chi tiết** → BP-02.
- Danh sách điểm chỉ giới thiệu tập dữ liệu, không ngầm xác nhận vị trí.
- Trạng thái cần vẽ: Demo ready, Demo fixture error, Live empty; loading/ready/error Live khi có API.
- Khi không có dữ liệu dùng được, không trình bày CTA bắt đầu như một hành động có thể thành công.
- **Design cần review:** Nhãn nguồn đủ nổi bật nhưng không lấn át CTA; vị trí danh sách điểm sau phần bắt đầu.

### UI-02 — Giới thiệu & hỏi đáp

**Mục tiêu:** Đọc giới thiệu, hỏi và hiểu nguồn của câu trả lời.

```text
‹ [Tên điểm]                         [Demo/Live]
[Giới thiệu ngắn + Nguồn]
Bạn muốn hỏi gì? [Các câu hỏi mẫu]
Câu hỏi của bạn: [Ô nhập] [Hỏi]
[Câu hỏi đã gửi → nguyên đáp án / chưa có dữ liệu]
[Nguồn nội dung]
Hỏi tiếp: [1–2 câu hỏi liên quan]
[Xem câu hỏi khác]       [Chọn trải nghiệm]
```

- Chọn chip, nút **Hỏi** hoặc Enter dùng cùng luồng Q&A. Câu mẫu dài được xuống dòng.
- Đáp án luôn đi cùng nguồn; bấm nguồn mở BP-01 của đúng nội dung.
- **Hỏi tiếp** cập nhật đáp án trên cùng màn. **Xem câu hỏi khác** trở lại bộ câu hỏi mẫu.
- **Chọn trải nghiệm** → UI-03, thuộc Phase 3. Không biểu đạt màn này như chatbot sinh tự do.
- Trạng thái cần vẽ: intro ban đầu, nhập chữ/bàn phím, matched + follow-up, unknown/thiếu evidence, nguồn dữ liệu unavailable.
- **Design cần review:** Có nên giảm intro sau khi đã hỏi; vị trí nguồn; ô nhập không bị bàn phím che; thứ tự CTA khi chưa có đáp án.

### UI-03 — Chọn trải nghiệm

**Mục tiêu:** Cung cấp chủ đề và thời gian để app gợi ý điểm.

```text
‹ Chọn trải nghiệm
Bạn quan tâm điều gì?
[Ẩm thực] [Chuyện xưa] [Khám phá tự do]
Bạn có bao nhiêu thời gian?
[15 phút] [30 phút] [45 phút] [60 phút]
[Ô nhập thời gian, ví dụ: khoảng 30 phút]
[Thông báo thiếu/không hiểu lựa chọn nếu có]
[Xem gợi ý]
```

- CTA chính: **Xem gợi ý** → UI-04 khi input đầy đủ/hợp lệ.
- Hiện rõ lựa chọn đã chọn bằng cả hình dạng/dấu chọn và màu.
- Trạng thái: chưa chọn, chọn đủ, thiếu chủ đề/thời gian, input thời gian không hiểu.
- **Design cần review:** Cách chọn một chủ đề; dùng chip/radio cho thời gian; cách nhắc bổ sung.
- **Đã chốt trong spec Phase 3:** Chip 15/30/45/60 phút và nhập ngắn như “khoảng 30 phút”. Gợi ý lọc chủ đề, loại điểm đã ghé/không còn mở, sắp theo thời lượng tăng dần và lấy tối đa ba điểm. Phút là thời lượng trải nghiệm mô phỏng, không phải thời gian đi bộ.

### UI-04 — Điểm được gợi ý

**Mục tiêu:** Hiểu vì sao điểm phù hợp và chọn điểm muốn khám phá.

```text
‹ Gợi ý cho bạn
[Chủ đề] · [Quỹ thời gian]       [Đổi lựa chọn]
1. [Tên điểm] · [Lý do] · [Thời lượng]
   [Chọn điểm]
2–3. [Cấu trúc tương tự nếu có kết quả]
[Điểm đang chọn]
[Quét QR] [Chọn tay] [Gợi ý GPS]
```

- Tối đa ba điểm, mỗi điểm có lý do/thời lượng và nhãn mô phỏng trong Demo.
- Chọn điểm chỉ chọn mục tiêu; không đổi điểm hiện tại/không tự ghi đã ghé.
- Lối xác nhận sau chọn điểm: QR → UI-05; tay → UI-06; GPS → UI-08. Ưu tiên thị giác cho QR. Các lối này chỉ hoạt động khi phase tương ứng được triển khai.
- **Đổi lựa chọn** → UI-03.
- Trạng thái: 1/2/3 kết quả, đang chọn, không có điểm phù hợp, không đủ thời gian, dữ liệu không dùng được.
- **Design cần review:** Thứ bậc chọn điểm và xác nhận; không tạo cảm giác đây là bản đồ dẫn đường.

### UI-05 — Quét QR xác nhận điểm

**Mục tiêu:** Xác nhận đúng một node đã biết từ QR.

```text
‹ Quét QR
[Camera preview + khung quét]
Đưa mã QR của điểm vào khung
[Trạng thái quét / mã không được hỗ trợ]
[Chọn điểm bằng tay]
```

- Vào chức năng theo thao tác rồi xin quyền camera; không xin ngay khi mở app.
- QR thuộc node đã biết → xác nhận node đó → UI-07. Hiện tên node thực sự nhận được, không lấy tên mục tiêu đã chọn thay thế.
- QR lạ/từ chối quyền → thông báo và lối UI-06. Không đổi điểm khi QR không hợp lệ.
- Trạng thái: trước cấp quyền, đang quét, QR hợp lệ/chuyển tiếp, QR lạ, từ chối quyền, camera không dùng được.
- **Design cần review:** Khung quét, thông báo thành công/lỗi và CTA chọn tay; không che phần quét bằng nhiều chữ.

### UI-06 — Chọn điểm bằng tay

**Mục tiêu:** Chọn và xác nhận điểm khi dùng demo hoặc đường thay thế.

```text
‹ Chọn điểm bằng tay
[Giải thích ngắn; Demo ghi rõ mô phỏng]
[Danh sách điểm đã biết + trạng thái chọn]
Điểm đang chọn: [Tên điểm]
[Xác nhận điểm]
```

- Chọn dòng chưa đổi điểm hiện tại. CTA **Xác nhận điểm** mới xác nhận và sang UI-07.
- Trong Demo ghi rõ đây là lựa chọn mô phỏng, không phải định vị thực tế.
- Trạng thái: chưa chọn, đã chọn, danh sách rỗng/không dùng được.
- **Design cần review:** Dấu chọn dễ nhận biết, CTA không bị list che, giữ nhãn mô phỏng gần hành động xác nhận.

### UI-07 — Người kể tại điểm

**Mục tiêu:** Đọc lời kể theo điểm đã xác nhận, có thể hỏi tiếp.

```text
‹ [Tên điểm đã xác nhận]             [Demo/Live]
[Camera preview]
[Người kể 2D placeholder]
[Caption có nền tương phản + Nguồn]
[Đọc bằng chữ]
[Hỏi tiếp]                   [Chọn trải nghiệm]
```

- Caption/lời kể dùng nội dung đã chuẩn bị; nguồn mở BP-01.
- **Hỏi tiếp** → UI-02 với bối cảnh điểm đã xác nhận. **Chọn trải nghiệm** → UI-03.
- **Đọc bằng chữ** là biến thể của UI-07, không thêm màn thứ chín. Khi camera bị từ chối/không dùng được, vẫn có lời kể bằng chữ và các hành động tiếp tục.
- Trạng thái: camera hoạt động, caption dài, bản đọc chữ, từ chối quyền/camera lỗi, chưa có nội dung tại điểm.
- Camera dừng khi rời màn; người kể tạm không cần AR/3D/lip-sync.
- **Design cần review:** Người kể không che caption/điểm quan sát; caption dễ đọc trên nền sáng/tối; vị trí đọc chữ và hỏi tiếp.

### UI-08 — Xác nhận gợi ý GPS

**Mục tiêu:** Người dùng quyết định có chấp nhận candidate hay chọn lại.

```text
‹ Gợi ý điểm từ GPS
[Đang lấy vị trí / trạng thái quyền]
Bạn có thể đang ở: [Tên candidate]
[Độ chính xác và khoảng cách khi có]
[Nhãn mô phỏng nếu dùng dữ liệu Demo]
[Xác nhận điểm này]
[Chọn lại]                 [Chọn bằng tay]
```

- Chỉ lấy vị trí sau yêu cầu GPS; hiện một candidate, không tự xác nhận.
- **Xác nhận điểm này** → đổi điểm hiện tại → UI-07.
- **Chọn lại** → UI-04; **Chọn bằng tay** → UI-06. Cả hai giữ nguyên điểm hiện tại cho đến xác nhận mới.
- Trạng thái: yêu cầu quyền, đang lấy vị trí, có candidate, accuracy kém, ngoài cụm, từ chối quyền/lỗi vị trí.
- Không hiện số accuracy/khoảng cách khi chưa có dữ liệu. Ngưỡng và việc cho xác nhận ở trạng thái accuracy kém cần chốt trong Phase 5.
- **Design cần review:** Phân biệt gợi ý với vị trí chắc chắn; tên điểm, độ chính xác và nút chọn lại phải đọc được ngay.

## 5. Chi tiết hai bảng phụ

### BP-01 — Nguồn nội dung

**Mở từ:** Nguồn ở UI-02 hoặc UI-07.

**Thứ tự nội dung:**

1. Tiêu đề **Nguồn nội dung** và nút Đóng.
2. Tên điểm và loại nội dung đang xem: giới thiệu/đáp án/lời kể.
3. Nhãn Demo mô phỏng hoặc Live đúng nguồn.
4. Danh sách evidence đã duyệt. Với Demo, hiện nguyên nhãn nguồn mô phỏng.
5. Thông tin tài liệu/đường dẫn nếu record thực sự có; không tự tạo người kể, ngày khảo sát, trích dẫn hay URL.

**Trạng thái:** Một/nhiều nguồn, tên nguồn dài, nội dung mô phỏng. Nội dung thiếu evidence phải được xử lý là chưa có dữ liệu ở màn chính, không vẽ như một đáp án đã có nguồn.

**Design cần review:** Nguồn dễ tìm nhưng không lấn đáp án; chữ dài/chữ lớn cuộn được; đóng trở lại đúng nội dung.

### BP-02 — Trạng thái dữ liệu

**Mở từ:** Khối trạng thái nguồn ở UI-01; thông báo dữ liệu không dùng được trên màn liên quan.

**Thứ tự nội dung:**

1. Tiêu đề trạng thái và nút Đóng.
2. Nguồn đang chọn: Demo hoặc Live.
3. Giải thích ngắn tình trạng và ảnh hưởng đến chức năng.
4. Hành động phù hợp theo từng biến thể.

| Biến thể | Nội dung/hành động |
| --- | --- |
| Demo ready | Dữ liệu mô phỏng có sẵn trong app; Đóng/Tiếp tục |
| Demo offline | Cho biết nội dung demo dùng dữ liệu bundled; không biến mất mạng thành lỗi Q&A |
| Demo fixture error | Báo dữ liệu demo không dùng được; Đóng/Quay về Home, không giả vờ có thể tiếp tục |
| Live loading | Đang lấy dữ liệu; thông báo trạng thái, không hiển thị đáp án từ Demo |
| Live empty | Chưa có cấu hình/dataset hoặc chưa có dữ liệu; Đóng/Quay về Home để tự chọn nguồn |
| Live error/timeout | Không lấy được dữ liệu; Thử lại khi API đã triển khai, hoặc Quay về Home |
| Live ready | Dữ liệu thật đã review đang dùng; Đóng/Tiếp tục |

**Design cần review:** Phân biệt empty/error/offline bằng câu chữ, không chỉ màu. BP-02 không chứa secret, log thô hay tự chuyển nguồn. Loading/ready/error Live là thiết kế cho phase API; hiện Live chỉ có empty.

## 6. Bộ component và hướng thị giác

### Component dùng chung

- Header: Back, tên màn/điểm, nhãn nguồn.
- Primary/secondary button: normal, pressed, disabled; trạng thái loading khi thao tác thực sự bất đồng bộ.
- Question chip, selection chip/radio, ô nhập có label.
- Answer block + Source link; Point item + lý do/thời lượng.
- Status block: ready/loading/empty/error/unknown, mỗi loại có câu chữ đúng ngữ cảnh.
- Caption panel và bottom sheet có nút đóng.

### Hướng đề xuất để design góp ý

- Nội dung làm trọng tâm; một cột trên điện thoại, chữ dễ đọc, chuyển động nhẹ phục vụ phản hồi.
- Tham chiếu palette hiện có tại `mobile/src/theme.ts`: nền `#F6F7F5`, mặt nội dung `#FFFFFF`, chữ `#1C2923`, màu nhấn `#246449`. Đây là điểm xuất phát, chưa khóa brand.
- Font hệ thống native là phương án hiện tại; font khác cần hỗ trợ đầy đủ tiếng Việt và được review trước khi tích hợp.
- Body tham khảo 16–18 đơn vị layout; spacing theo nhịp 4/8, lề 20–24. Kích thước cuối cần kiểm chứng khi có thiết kế/render thật.
- Không dùng emoji thay icon điều hướng; icon nhất quán và có nhãn truy cập.

## 7. Trạng thái và khả năng sử dụng phải review

- [ ] Phân biệt rõ điểm khởi đầu mô phỏng, điểm gợi ý, điểm đang chọn và điểm đã xác nhận.
- [ ] Mọi intro/đáp án/lời kể có nguồn đúng nội dung; nhãn Demo/Live dễ thấy.
- [ ] Unknown Q&A khác lỗi dữ liệu; empty Live khác lỗi mạng và offline Demo.
- [ ] Camera bị từ chối/QR lạ/GPS lỗi vẫn có đường chọn tay và chữ.
- [ ] Vùng chạm ít nhất 44pt iOS / 48dp Android; khoảng cách giữa các nút đủ rộng.
- [ ] Nội dung/nút cố định tôn trọng safe area; không bị bàn phím hoặc thanh hệ thống che.
- [ ] Câu hỏi dài, đáp án dài, caption dài và cỡ chữ lớn không bị cắt mất nội dung.
- [ ] Thứ tự đọc của screen reader tương ứng bố cục; nút/chip có label và trạng thái chọn/disabled.
- [ ] Text thường đạt tương phản tối thiểu 4.5:1; control/icon có ý nghĩa đạt 3:1; caption kiểm tra trên camera sáng và tối.
- [ ] Màu không phải tín hiệu duy nhất; phản hồi nhấn không làm layout nhảy; reduced motion được tính đến.
- [ ] Có artboard điện thoại nhỏ/lớn và hướng ngang cho màn dễ gặp vấn đề, nhất là Q&A/camera/bảng phụ.

Checklist trên là mục cần review/kiểm chứng, chưa phải kết quả pass. Theme tối hoặc đổi palette toàn app cần chốt với design trước; không mặc định đã có trong build.

## 8. Những quyết định cần chốt

| Mã | Quyết định | Bên cần góp ý |
| --- | --- | --- |
| D-01 | Có giữ cách tách đúng 8 màn + 2 bảng phụ hay đề nghị ghép? Nếu ghép, chỉ rõ các mã liên quan | Design + chủ sản phẩm |
| D-02 | Vị trí CTA Chọn trải nghiệm trong UI-02; có thu gọn intro sau khi hỏi không | Design |
| D-03 | Bố cục chọn chủ đề, chip 15/30/45/60 phút và ô nhập; cách trình bày lý do theo rule Phase 3 đã chốt | Design + chủ sản phẩm/Phase 3 |
| D-04 | Cách hiện lối QR/tay/GPS sau khi chọn điểm; xử lý Back sau xác nhận thành công | Design + dev |
| D-05 | Vị trí/kích thước người kể tạm, caption và biến thể đọc chữ | Design/Phase 4 |
| D-06 | Microcopy GPS, ngưỡng accuracy và trạng thái candidate không đáng tin cậy | Chủ sản phẩm + design/Phase 5 |
| D-07 | Palette/font/radius, icon family và phạm vi theme | Design + chủ sản phẩm |
| D-08 | Policy điểm đã ghé/thời gian còn lại và điểm khởi đầu Live | Chủ sản phẩm + dev, chốt theo phase |

## 9. Khu vực nhóm design ghi góp ý

### 9.1 Thông tin lần review

| Mục | Nhóm review điền |
| --- | --- |
| Người review | |
| Ngày review | |
| Link Figma/tài liệu tham chiếu nếu có | |
| Kết luận: Đồng ý / Đồng ý sau chỉnh sửa / Cần đổi cấu trúc | |

### 9.2 Góp ý theo màn hình/bảng phụ

Đánh giá dùng **Giữ / Sửa / Ghép / Cần làm rõ**. Ưu tiên dùng **P0** (chặn luồng/hiểu sai), **P1** (ảnh hưởng thao tác), **P2** (tinh chỉnh thị giác). Có thể thêm dòng nếu một màn có nhiều góp ý.

| Mã | Đánh giá | Góp ý cụ thể | Đề xuất chỉnh sửa | Ưu tiên |
| --- | --- | --- | --- | --- |
| UI-01 | | | | |
| UI-02 | | | | |
| UI-03 | | | | |
| UI-04 | | | | |
| UI-05 | | | | |
| UI-06 | | | | |
| UI-07 | | | | |
| UI-08 | | | | |
| BP-01 | | | | |
| BP-02 | | | | |

### 9.3 Góp ý chung và quyết định sau review

| Chủ đề | Góp ý / quyết định |
| --- | --- |
| Luồng và số lượng màn hình | |
| Thứ bậc CTA và điều hướng Back | |
| Palette / typography / icon | |
| Bàn phím / safe area / chữ lớn | |
| Camera / caption / bản đọc chữ | |
| Nguồn / Demo–Live / empty–error | |
| Quyết định cần chủ sản phẩm xác nhận | |

### 9.4 Theo dõi xử lý góp ý

| ID góp ý | Màn/decision liên quan | Thay đổi được thống nhất | Người xác nhận | Trạng thái |
| --- | --- | --- | --- | --- |
| | | | | |

Trạng thái đề nghị: **Mới / Đang làm rõ / Đã thống nhất / Đã cập nhật / Không áp dụng**. Ghi rõ người xác nhận khi chốt thay đổi; không coi ô review trống là đã duyệt.
