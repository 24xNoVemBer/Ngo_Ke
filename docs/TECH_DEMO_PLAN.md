# Ngõ Kể — kế hoạch app mobile demo theo từng phase

Ngày cập nhật: 02/10/2026  
Phạm vi: phần Tech của người A  
Trạng thái: **đang chờ người dùng review kế hoạch; chưa bắt đầu phase native mobile**.

> **Đính chính hiện hành 03/10/2026:** người dùng xác nhận dự án mới từ đầu, duyệt Phase0/Phase1 và đồng ý sáu điểm mô phỏng để hoàn thiện Home. [Spec điều chỉnh](superpowers/specs/2026-10-02-greenfield-phase-1-proposal.md) đã được chốt phạm vi; [bàn giao Phase1](../agent_docs/phase_1_completion.md) ghi fixture bundled/Android emulator/offline sau tải bundle đã thử. G1 còn điện thoại thật và review. Các mô tả “web demo/backend/core/fixture hiện có” bên dưới là giả định lịch sử, không phải source cũ phải cung cấp. Giữ stack/thứ tự phase; viết mới từng phần khi phase được duyệt, chưa tự mở Phase2.

## Quy tắc làm việc

Thực hiện **một phase mỗi lần**. Kết thúc phase thì dừng để người dùng xem app, nội dung, thay đổi và kết quả kiểm tra. Chỉ bắt đầu phase kế tiếp sau khi người dùng duyệt rõ ràng. Nếu chưa đạt, sửa trong phase hiện tại rồi gửi lại review. Không gom nhiều phase vào một lần bàn giao.

**Quyết định 03/10/2026 — không làm web/PWA.** Theo yêu cầu người dùng, web/PWA bị gỡ khỏi phạm vi plan. Không xây web preview, không dựng `public/` hay bản PWA, không dùng web để nghiệm thu thay native. Deliverable duy nhất là app native Expo/React Native Android+iOS cùng backend Node/SQLite đọc cho chế độ live.

Hướng app là Expo/React Native cho Android và iOS, dùng backend Node/SQLite và fixture hiện có. Theo tài liệu Expo hiện hành, một codebase Expo chạy Android/iOS, và camera/location có trong Expo Go để thử trên điện thoại: [tạo dự án Expo](https://docs.expo.dev/get-started/create-a-project/), [Camera](https://docs.expo.dev/versions/latest/sdk/camera/), [Location](https://docs.expo.dev/versions/latest/sdk/location/).

## Trải nghiệm cần xây

1. Mở app và nhận một lời giới thiệu ngắn về nơi đang đứng.
2. Người kể hỏi tiếp: “Bạn muốn trải nghiệm ẩm thực, tìm hiểu chuyện xưa, hay muốn hỏi thêm về con ngõ này?”
3. Người dùng chọn một câu hỏi mẫu hoặc nhập câu hỏi. Demo chỉ dùng bộ câu hỏi/câu trả lời viết sẵn; câu nào khớp alias thì trả đúng câu đã duyệt và gợi ý hỏi tiếp, ngoài bộ câu hỏi thì báo chưa có câu trả lời.
4. Người dùng chọn chủ đề và quỹ thời gian; app gợi ý điểm kế tiếp cùng lý do và thời lượng ước tính.
5. Ở điểm dừng, app hiện người kể trên nền camera và caption nội dung. Người dùng có thể hỏi tiếp.
6. Khi đi sang điểm mới, QR tại điểm được dùng để xác nhận. Chọn tay vẫn có để chạy demo.

### Ranh giới của MVP

- GPS chỉ đưa ra **một điểm gợi ý** kèm độ chính xác/khoảng cách khi có. Người dùng phải xác nhận; app không tự kết luận họ đang đứng ở đó.
- Không có chỉ đường rẽ theo rẽ, theo dõi vị trí nền hay chỉ dẫn dựa trên GPS thời gian thực. Điểm đến và số phút chỉ là gợi ý, không phải dẫn đường an toàn.
- Bản demo trên camera dùng một người kể 2D tạm và caption nổi. Chưa thiết kế mascot sâu, làm AR neo vật thể, model 3D, animation khuôn miệng hay nhận diện công trình.
- Demo hỏi đáp dùng bộ câu hỏi/câu trả lời cố định, không phải chatbot sinh câu trả lời. Giai đoạn nối voice sẽ đọc câu trả lời qua TTS và nhận câu hỏi qua STT trên cùng bộ Q&A cố định; luôn giữ nhập/đọc bằng chữ làm fallback. Phần voice đợi người dùng nối ở phase riêng sau khi đã duyệt luồng text.
- QR demo chỉ nhận mã của node đã biết. Không nhận dạng biển hiệu tự do/OCR trong app mobile giai đoạn đầu.
- Sáu node hiện có là dữ liệu giả lập. Tọa độ và ETA không được dùng để đi bộ ngoài thực địa.
- Câu trả lời Q&A phải lấy từ evidence đã duyệt. Không đủ evidence thì nói rõ chưa có dữ liệu; không tự bịa chuyện.

## Stack và hợp đồng

- **Mobile:** Expo + React Native, ưu tiên component native và layout thao tác một tay. Giữ phần trình bày ở mức demo chức năng để nhóm UI có thể thay sau; không hoàn thiện hi-fi trong các phase này.
- **Server:** Node 24 + JSON API + SQLite đang có. Chỉ mở thêm API khi phase cần; không mở API ghi data cho điện thoại.
- **Logic dùng chung:** `public/core.js` giữ normalization, intent, gợi ý, vị trí và retrieval nếu Metro import được ổn định. Tránh chép cùng một thuật toán sang app mobile.
- **Demo:** app đọc `data/demo.json` trực tiếp từ bundle, nên thử Q&A và gợi ý demo không cần API key hoặc server.
- **Live:** dùng API và chỉ lấy record thật đã review. Nếu chưa cấu hình server/dataset, hiện empty state; tuyệt đối không âm thầm đổi sang fixture demo.
- **Camera/GPS:** `expo-camera` chỉ bật sau thao tác của người dùng; `expo-location` chỉ lấy vị trí khi được yêu cầu. Không giữ theo dõi nền.
- **Voice:** mỗi câu thoại demo là text cố định, có thể nối TTS để đọc đáp án và STT để nhận câu hỏi ở phase riêng. Trước khi người dùng nối voice, app vẫn dùng input/output text; không thêm AI hội thoại tự do.
- **Web/PWA:** đã gỡ khỏi phạm vi theo quyết định 03/10/2026. Không xây web preview/PWA; mọi nghiệm thu đều chạy trên app native.

## Các phase và cửa review

| Phase                                                        | Làm trong phase                                                                                                                                                                                                                                                                          | Đầu ra để review                                                                                                                                                   | Điều kiện qua phase                                                                                                                                                    |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0 — Chốt hành vi và kiến trúc**                            | Đồng bộ luồng ở trên; chốt Expo/React Native, xác nhận avatar 2D + caption, cách QR xác nhận, GPS chỉ gợi ý, bộ Q&A cố định và voice TTS/STT là phase riêng. Ghi hợp đồng mobile/API/data và việc cắm data/UI sau.                                                                       | Plan này được người dùng review; sơ đồ luồng màn hình và ranh giới không làm.                                                                                      | Người dùng duyệt plan trước khi tạo native project. **Chưa viết app ở phase 0.**                                                                                       |
| **1 — Khung app native**                                     | Tạo `mobile/`; cấu hình Expo cho Android+iOS; dựng navigation/screen skeleton, safe areas, trạng thái demo/live, màu/chữ/touch targets mức demo; dùng fixture local để khởi chạy Home.                                                                                                   | App mở được bằng Expo Go; ảnh Home và các screen placeholder; danh sách lệnh chạy; kết quả Expo dependency check.                                                  | Mở và thao tác được trên ít nhất một điện thoại Android hoặc iPhone có Expo Go. Người dùng review cấu trúc và hướng trình bày trước khi làm hội thoại.                 |
| **2 — Giới thiệu và hỏi đáp cố định**                        | Mở demo tại node đầu; hiện lời giới thiệu ngắn; chip các câu hỏi viết sẵn; nhập câu hỏi; normalize/so khớp với danh sách alias; trả nguyên câu trả lời đã chuẩn bị và nguồn demo; gợi ý 1–2 câu tiếp theo trong danh sách. Câu ngoài danh sách trả lời “chưa có dữ liệu”, không gọi LLM. | Flow `mở → giới thiệu → câu hỏi mẫu/tự nhập → câu trả lời đã soạn → hỏi tiếp`; test exact/alias match, unknown question, attribution nguồn demo.                   | Người dùng duyệt bộ câu hỏi/đáp, giới thiệu và nhánh hội thoại trước khi recommendation được làm. Phần này ưu tiên chữ; không yêu cầu thiết kế UI sâu.                 |
| **3 — Hội thoại dẫn tới lựa chọn**                           | Sau phần giới thiệu/Q&A, hỏi người dùng muốn ẩm thực, lịch sử hay khám phá tự do; cho chọn thời gian; hiểu input ngắn; gọi logic recommendation; hiện tối đa ba điểm với lý do và thời lượng mô phỏng.                                                                                   | Có thể hoàn tất nhánh “chuyện xưa” và “ẩm thực”; trạng thái thiếu điểm/thiếu thời gian; test interest, time budget, visited, unavailable và unreachable.           | Người dùng review câu hỏi gợi ý, thứ tự màn hình và cách giải thích vì sao đề xuất điểm. Chưa có chỉ đường trực tiếp.                                                  |
| **4 — Camera, QR và người kể**                               | Xin quyền camera đúng lúc; scan QR node đã biết; sau scan hiện người kể 2D placeholder với caption trên preview; dùng lại các câu thoại đã có ở phase 2; fallback chọn điểm bằng tay khi từ chối quyền hoặc QR lạ; dừng camera khi rời màn.                                              | Demo quét QR mở đúng node và lớp người kể; fallback manual đầy đủ; kiểm tra ít nhất một thiết bị Android và một iPhone nếu có thiết bị.                            | Người dùng review vị trí/kích thước placeholder và caption; chưa cần thiết kế mascot hi-fi. Gắn audio ở phase voice riêng, không tự chọn/thu giọng.                    |
| **5 — GPS thận trọng và xác nhận điểm**                      | Khi người dùng bấm GPS, nhận candidate gần nhất và accuracy; hiển thị “có thể là…” cùng nút xác nhận/chọn lại; không tự đổi node; lúc đi tới điểm tiếp theo ưu tiên QR và cho xác nhận tay rõ là mô phỏng.                                                                               | Test quyền GPS bị từ chối, accuracy kém, đứng ngoài cụm, GPS gợi ý nhầm node; UI không gọi nhầm candidate là vị trí chắc chắn.                                     | Người dùng review microcopy và quy trình xác nhận trước khi thử đi ngoài thực địa. Dữ liệu tọa độ phải được nhóm data khảo sát trước khi test ở Ao Sen.                |
| **6 — Cắm API và dataset thật**                              | Mobile gọi endpoint đang có cho `live`; thiết lập URL backend theo môi trường; kiểm tra shape data, nguồn, error/timeout; tách hẳn demo/live; viết hướng dẫn để nhóm data thay dataset và nhóm UI thay giao diện mà không đổi logic lõi.                                                 | Demo local không mạng; live có dữ liệu đã review khi backend có; live rỗng/lỗi vẫn hiển thị đúng empty/error state; checklist handoff cho B/C.                     | Người dùng review trước khi gắn dữ liệu thật hoặc gửi giao diện hi-fi vào code. Chưa tự import dữ liệu chưa được duyệt.                                                |
| **7 — Offline và kiểm thử demo end-to-end**                  | Đóng băng scope; kiểm tra app shell và fixture local, các fallback camera/GPS/QR, Q&A, chuyển mode, truy cập bàn phím/kích thước chữ; chạy kịch bản demo lặp lại; sửa lỗi trong phạm vi đã duyệt.                                                                                        | Kịch bản `giới thiệu → hỏi → chọn chủ đề → nhận điểm → xác nhận → xem lời kể → hỏi tiếp`; log test; danh sách rõ Android/iOS/thiết bị nào đã thử và việc nào chưa. | Người dùng xem bản demo mobile hoàn chỉnh trước khi chốt tech demo. Không ghi pass cho thiết bị/phần cứng chưa thử.                                                    |
| **Sau core demo — nối voice (riêng, do người dùng dẫn dắt)** | Nối TTS để đọc câu trả lời cố định và STT để đưa câu người dùng nói về đúng danh sách câu hỏi/alias. Dùng connector/giọng do người dùng chọn; nếu chưa có, giữ luồng chữ. Không thêm hội thoại sinh tự do.                                                                               | Voice hoạt động trên tập Q&A đã được review; báo rõ engine/thiết bị hỗ trợ và fallback.                                                                            | Chỉ bắt đầu sau khi người dùng duyệt riêng phase voice và chỉ rõ connector/giọng muốn dùng. Không chặn việc review hỏi đáp bằng chữ. AR/3D cũng là scope/review riêng. |

## Cách review sau mỗi phase

Sau mỗi phase, dừng code và gửi một gói ngắn gồm: phase hoàn tất; file/hành vi đổi; link mở app hoặc ảnh chụp trên thiết bị; lệnh và kết quả check; giới hạn còn lại; nội dung cần người dùng quyết định. Chờ người dùng review. Chỉ xử lý feedback của phase hiện tại; không tự đi tiếp. Nếu thay đổi làm nảy sinh scope mới, sửa plan rồi xin review trước khi code phần đó.

## Tiêu chí hoàn tất toàn bộ tech demo

- App native chạy trong Expo Go trên thiết bị; Android và iOS được báo trạng thái kiểm tra riêng.
- Flow giới thiệu, Q&A có nguồn, câu hỏi gợi ý tiếp theo, lựa chọn chủ đề/thời gian, đề xuất node, QR xác nhận và người kể caption hoạt động bằng fixture.
- GPS không tự xác nhận vị trí; không có hướng rẽ theo rẽ hoặc theo dõi nền.
- Mọi phần chưa có dữ liệu thật, voice hoặc thiết bị kiểm thử được ghi là chưa hoàn tất.
- README chỉ cách mở demo mobile; handoff mô tả API/data/voice seam cho người A/B/C.
- Không tạo/push remote, không deploy, không phát hành store build nếu chưa có yêu cầu riêng.

## Nguồn triển khai

- [Expo: tạo app React Native cho Android và iOS](https://docs.expo.dev/get-started/create-a-project/)
- [Expo Camera: camera và barcode/QR scan](https://docs.expo.dev/versions/latest/sdk/camera/)
- [Expo Location: lấy vị trí thiết bị](https://docs.expo.dev/versions/latest/sdk/location/)
