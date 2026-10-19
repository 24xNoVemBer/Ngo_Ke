# Ba lát cắt phố cổ — bản demo từ kịch bản người dùng

Ngày kiểm tra: 19/10/2026. Nội dung, âm thanh và app đã tích hợp; Demo LAN đang chạy. Kết quả dưới đây là kiểm kỹ thuật trong môi trường hiện có, chưa thay cho thử máy thật hoặc duyệt giọng bởi người nghe.

## Nội dung đã xây

Collection mới `old-quarter-three-lenses`, độc lập với hai collection cũ, dựa trên [Google Docs người dùng cung cấp](https://docs.google.com/document/d/1VwiCcG2BQKD8-t-Yu5VfgXxJ1qGcWayaaTd4upHu4OI/edit).

| Địa điểm thật | Chương kể | Q&A mỗi ngôn ngữ | Ảnh từ tài liệu |
| --- | ---: | ---: | ---: |
| Đền Bạch Mã | 1 | 3 | 1 |
| Nhà di sản 87 Mã Mây | 1 | 4 | 1 |
| Chợ Đồng Xuân | 3 | 9 | 3 |
| **Tổng** | **5** | **16** | **5** |

Ba chương Đồng Xuân là ba góc kể tại cùng một địa điểm, không tạo thêm điểm GPS. Có phần mở đầu, hai đoạn nối và đoạn kết. Người dùng cho phép thêm thắt: bản Việt và Anh đã thêm câu hỏi gợi tò mò, chi tiết quan sát, nhịp chuyển cảnh và lời dẫn. Không thêm nhân chứng, lời trích dẫn, nhân vật cư dân hoặc sự kiện lịch sử không có nguồn. [Đọc toàn bộ lời kể Việt](content/three-lenses/STORY_PREVIEW_VI.md).

Nội dung có nguồn tham khảo, chưa được đơn vị quản lý di tích duyệt chính thức. Phân biệt truyền thuyết ngựa trắng với sử liệu; giữ các mốc chưa xác định của nhà Mã Mây, đài phun nước và tuổi từng quán ăn. Bạch Mã chưa có tọa độ đủ bằng chứng nên để trống; hai tọa độ còn lại kế thừa dữ liệu OSM có ghi nguồn, không phải khảo sát thực địa mới. Không cung cấp dẫn đường.

Ảnh do người dùng cung cấp trong tài liệu để làm demo riêng; chưa kiểm chứng độc lập quyền sử dụng để phát hành rộng.

## Âm thanh

Đã sinh **56 MP3 mới**, 28 cho mỗi ngôn ngữ: mở đầu 1, chương kể 5, caption 3, đoạn nối 2, kết 1 và câu trả lời 16. Giữ nguyên engine, model và preset đã chốt: VieNeu3.7.1/Đoan Trang cho Việt, Kokoro0.9.4/af_heart cho Anh. Dùng catalogue tĩnh theo đúng collection, locale, revision và text hash.

W1 kiểm độc lập trên candidate:

- `three_lenses.py audit`: 56/56 file đạt kiểm hash, metadata và giải mã MP3 toàn bộ bằng FFmpeg.
- `python -B -m unittest test_three_lenses test_post8_probe test_post8_remaining`: 16/16 đạt.
- 100 MP3 cũ và `prologue_door.wav` khớp nguyên Git blob với baseline `5d1984e`.
- Intro dùng đúng loại track và vẫn gắn phạm vi điểm hiện tại; bộ kiểm lifecycle hook 9/9 đạt sau tích hợp.

Tổng các clip Việt 777.450 giây, Anh 804.401 giây, bao gồm cả 16 câu trả lời tùy chọn. Chỉ mở đầu, các chương, đoạn nối và kết là Việt 641.610 giây, Anh 646.050 giây. Đây là thời lượng file, không phải thời gian đi bộ hay cam kết hành trình 5–7 phút.

Manifest SHA256: `e9a7d38dffa5fc90c9e8b7cc2fdf9d7e91d4bd28657716170c2dfcab985c3d1e`. Xem [báo cáo render](../tools/voice/THREE_LENSES_VOICE_REPORT.md) tại candidate và manifest trong `mobile/assets/voice/three-lenses/manifest.json`. Chưa nghe duyệt bởi người thật, chưa đánh giá phát âm và độ lớn cảm nhận. `humanApproved=false`, audio provisional.

## Kiểm nội dung và ranh giới dữ liệu

Production parser chấp nhận cả hai bộ Việt/Anh. Canonical revision khớp companion, companion payload được ràng buộc bằng `scriptRevision`. Cả 16 Q&A được phân vào chương; chương đầu từng điểm khớp core story nguyên văn.

| Kiểm tra W1 chạy | Kết quả | Giới hạn |
| --- | --- | --- |
| Câu hỏi chuẩn và alias, hai ngôn ngữ | 96/96 trả đúng answer ID | Là matcher chữ, không phải độ chính xác mic |
| Đem câu hỏi chuẩn sang điểm khác | 32/32 unknown | Không suy diễn câu trả lời liên điểm |
| Follow-up và câu ngoài dữ liệu | Đúng phạm vi điểm; câu lạ unknown | Không có LLM sinh đáp án |
| Parser QR | Nhận 3 node ID thật; từ chối node chương giả | Chưa quét QR vật lý trên thiết bị |
| HTTP mic với gateway small-cpu | 2/2 request Việt/Anh qua transport/context đúng | Hai mẫu synthetic trả unknown; không phải bằng chứng nhận giọng đúng |

Companion chỉ được dùng trong Demo với đúng collection, locale, revision và core payload. Live không lấy companion bundle để bù dữ liệu thiếu. Các thay đổi không cần DB migration hoặc backend dataset mới.

## Kiểm app tích hợp

Candidate đã nhận các commit app được review: `753e215` → `f4af28b`, `5e618ee` → `676f2e9`, `1bedd38` → `2262fad`; checkpoint tài liệu `d93cba8` → `c2399be`. Hook intro và catalogue voice nằm trên cùng candidate. Kiểm `npm run typecheck` của W1 đã đạt; ba mục dịch `RECORDER_RECOVERY_PENDING` của bản tích hợp được giữ nguyên.

Các sửa đã kiểm qua source và kiểm thử của worker: companion chỉ hiện khi core/locale/revision đúng, đối chiếu payload thực với snapshot; đổi ba chương Đồng Xuân đổi text/ảnh/Q&A tại cùng node; chọn chương hủy cả audio đang chờ dù chưa phát; actual simulated kind luôn ưu tiên trước metadata collection; nguồn và credit ảnh hỗ trợ Việt/Anh. Các cast che lỗi API cũ đã được bỏ. Worker báo 268/268 test và lint đạt trên nhánh riêng; typecheck nhánh worker còn hai lỗi do API voice cũ, đã được giải quyết ở candidate có hook đúng.

Sửa cuối `2fb39ec` → `65478e7` xóa track cũ khi chọn chương/đoạn và thêm kiểm phát lại đúng chapter/text/node; `a40b40f` → `6109ae4` thay enum kỹ thuật bằng nhãn nguồn dễ hiểu. Production tree của các bundle bên dưới là `6109ae4`.

| W1 chạy trực tiếp trên candidate | Kết quả |
| --- | --- |
| Toàn bộ `mobile/tests/*.test.mjs`, Node TAP | **285/285 đạt**, 0 fail/cancelled/skipped |
| `npm run typecheck` | Đạt |
| `npm run lint` | Đạt sau sửa import Node `URL` trong test mới; không tắt rule hoặc đổi cấu hình lint |
| Bundle iOS qua Metro | HTTP200, 6,018,567 bytes |
| Bundle Android qua Metro | HTTP200, 6,019,181 bytes |
| 5 JPEG mới và 2 MP3 intro Việt/Anh qua HTTP asset | **7/7 HTTP200**, SHA256 khớp source nguyên bytes |

Cả hai bundle chứa collection mới, audio chương Đồng Xuân bổ sung, snapshot guard, reset track phát lại và nhãn nguồn mới. Đây là bằng chứng tạo bundle và phục vụ asset, không phải bằng chứng chạy native.

Import test sửa riêng bởi W3 `f2a761d` → candidate `79c28aa`; W1 chạy lại catalogue test **1/1** và toàn bộ lint đạt. Thay đổi này chỉ thêm một import trong test, không đổi production tree của hai bundle hoặc dữ liệu/audio; không chạy lặp lại toàn bộ suite khi không có thay đổi runtime mới. W2 và cả hai dispatch voice W3 đã hoàn tất, terminal worker được release; Metro và gateway thuộc W1 được giữ để demo.

## Mở demo hiện tại

Mở Expo Go trên điện thoại **cùng Wi-Fi** với máy tính, quét `C:/Users/LEGION/AppData/Local/Temp/ngoke-demo-qr.png` hoặc mở `exp://192.168.100.36:8081`. Reload nếu đang mở bản trước. Chọn **Demo → Ba lát cắt phố cổ**, rồi chọn điểm và ngôn ngữ; tại Đồng Xuân có ba tab chương. Dùng nút nghe ở từng phần hoặc câu hỏi, có thể đọc lời kể bằng chữ.

Metro terminal `term_f7d36695-fc79-47b8-af23-099bcd2ed28b`, gateway riêng `term_807f8164-67db-4155-bbe1-d63320150fe6`. Gateway `/health` trả200/ready, profile small-cpu, tại `http://192.168.100.36:18787`. Audio kể là asset tĩnh; mic cần gateway. API18886 chưa chạy và collection này chưa được nhập Live, nên dùng Demo. Không có APK mới hoặc update Expo.dev mới trong đợt này.

## Môi trường và giới hạn

- Windows, Node24.14.1; Python3.12.13 từ môi trường voice hiện có. Không thay model hoặc engine để làm dữ liệu mới.
- Không có thiết bị ADB kết nối trong lần kiểm mới. Lệnh khởi động giả lập ở phiên trước bị công cụ từ chối `blocked by policy`; không thử đi vòng bằng công cụ hoặc worker khác. Chưa có bằng chứng native mới, iPhone, GPS fix, quét QR thật, FPS hoặc human listening.
- OpenCode không có Muse theo cấu hình yêu cầu. Session mặc định thực tế là DeepSeek; không có lỗi hết quota để áp dụng quyền đổi model, nên worker dừng, không review hay sửa file. W1 thực hiện kiểm độc lập trong vai trò coordinator; không tuyên bố đã có QA Muse.
- Không merge, push, publish, store hoặc ghi workspace chính. Preview Expo.dev cũ chưa chứa collection mới.

## Việc cần người dùng quyết / tự làm

- **Cần quyết:** không có quyết định chặn triển khai demo đã giao. Chưa gắn phê duyệt nội dung/giọng chính thức thay người dùng.
- **Cần tự làm:** mở bản Demo trên điện thoại để thử cảm giác, nghe lời kể và báo đoạn phát âm chưa ổn; phần kiểm cảm nhận trên máy thật vẫn pending. Đây là phạm vi nội dung/voice mới **[ngoài plan core TECH_DEMO_PLAN]** đã được người dùng giao riêng, không tạo cửa xin duyệt lại.
- **Cần tự làm trước khi phát hành rộng:** xác nhận quyền dùng ảnh và tổ chức rà soát nội dung với người có trách nhiệm tại địa điểm. Nếu chưa làm, giữ trạng thái có nguồn tham khảo, chưa duyệt chính thức; bản demo riêng vẫn dùng được.
