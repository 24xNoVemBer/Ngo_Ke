# VieNeu cho voice Ngõ Kể

Kiểm ngày 13/10/2026, theo đề xuất của người dùng dùng `https://www.vieneu.io/#/studio` nếu phương án ban đầu mất phí. Đây là nghiên cứu và điều chỉnh plan, chưa cài engine, mua gói hoặc tạo audio.

## Kết luận dùng vào đâu

VieNeu là ứng viên phù hợp cho **tạo giọng đọc TTS**, đặc biệt theo phương án tạo file trước cho story/Q&A cố định. Cần phân biệt **Studio/Cloud API tính phí** với **SDK/model mã nguồn mở chạy trên máy riêng**. Dùng tên VieNeu không có nghĩa mọi cách dùng đều miễn phí hoặc cùng chất lượng.

Người dùng đã chọn nhấn để nói, nữ miền Bắc ấm tự nhiên và STT trực tuyến. Đề xuất VieNeu được ghi là ưu tiên đánh giá TTS để tiết kiệm, chưa phải lựa chọn voice ID hoặc mua gói. Phần nhận dạng câu nói STT vẫn cần engine riêng được xác minh.

## Điều đã kiểm được

| Cách dùng | Bằng chứng hiện tại | Hệ quả cho Ngõ Kể |
| --- | --- | --- |
| VieNeu Studio/Cloud | Trang công bố gói Starter 99.000đ / 400.000 token, tài liệu cloud yêu cầu tài khoản/token và tính theo ký tự | Có dùng thử nhưng không phải miễn phí vô hạn; không mặc định bấm tạo/stream khi chưa có ngân sách |
| VieNeu-TTS v3 Turbo tự chạy | Repo chính thức và model card ghi mã nguồn mở, Apache-2.0; SDK có đường chạy CPU/ONNX và GPU | Có thể tạo audio trên máy riêng, không tốn phí API theo từng lần người dùng nghe; vẫn có chi phí máy, thiết lập và vận hành |
| VieNeu v4 trên website | README chính thức ghi v4 độc quyền, chỉ có trên API/website; v3 Turbo là bản mở hiện tại | Không hứa chất lượng/giọng Studio v4 giống bản v3 tự chạy |
| STT | Tiêu đề website có STT nhưng Cloud API overview/SDK vừa kiểm xác nhận TTS; chưa xác minh API transcription | Không thay STT bằng TTS hoặc coi đã có nhận dạng lời nói; cần probe engine STT riêng |
| Giọng cụ thể | Model card ghi Ngọc Linh là nữ Bắc/storytelling, Đoan Trang là nữ Bắc/natural; chưa nghe trên máy thật | Shortlist để nghe cùng text, không chọn chỉ vì tên hoặc lấy giọng Studio bất kỳ làm preset local |

Giá là thông tin tại thời điểm kiểm, không phải cam kết giá hoặc quyền sử dụng lâu dài. Không lấy số dư/gói của phiên đăng nhập trình duyệt làm bảng giá chung; không lưu thông tin tài khoản cá nhân vào tài liệu.

## Phương án đề xuất để tiết kiệm

1. **Tạo trước audio bằng VieNeu v3 Turbo trên PC**: thử vài đoạn cùng text/preset nữ Bắc, nghe lại tên tiếng Việt/dấu câu/tốc độ. Chưa cần server TTS chạy liên tục.
2. Sau khi chốt giọng, tạo story/Q&A và các câu hướng dẫn cố định có review; giữ text nguyên văn, không thêm tag cười/cảm xúc làm thay đổi nội dung nếu chưa duyệt.
3. Đóng gói hoặc cache audio cùng manifest `contentId + textHash/revision + voiceId`. App React Native phát bằng player thật: nghe/tạm dừng/nghe tiếp/phát lại/dừng.
4. **Mỗi lượt hỏi chỉ cần STT trực tuyến** để lấy transcript, rồi tra đáp án đã có và phát file tương ứng. Không gọi TTS trả phí lại mỗi lần nghe.
5. Nội dung thay đổi thì tạo lại đúng file bị đổi. Không nhúng mô hình Python/ONNX vào điện thoại trong đợt đầu chỉ để đọc các câu cố định.

Đây là đề xuất giảm chi phí TTS theo lượt. **Không hứa toàn bộ voice miễn phí:** STT online, hosting/bandwidth và nội dung thay đổi có thể phát sinh chi phí. Nếu mục tiêu là không trả phí API cả STT, cần đánh giá ASR tự host như một quyết định triển khai riêng; tự host vẫn dùng tài nguyên máy.

### Khi nào dùng Studio người dùng gửi

Studio thuận tiện để nghe/chọn giọng và xuất file nếu quota/quyền sử dụng cho phép. Có thể dùng audio xuất từ Studio với cùng manifest/player; cần kiểm quyền đóng gói/redistribute audio và giọng trước khi đưa vào app phát hành. Không tự đăng ký/mua gói, không nhúng Studio bằng WebView hoặc tự động hóa website làm backend của app.

## Checklist trước triển khai

- Chọn bản **v3 Turbo local** hay **Studio v4/cloud có quota**; không nhầm catalogue/preset giữa hai bản.
- Pin SDK/model revision và giữ license notices. Model card v3 Turbo xác nhận quyền dùng thương mại audio từ preset đi kèm; giữ đúng phạm vi artifact này và notices của thành phần khác, không suy sang mọi giọng Studio v4.
- Nghe mẫu nữ Bắc với cùng text đã duyệt; chọn voice ID thật và lưu cấu hình. Chưa cần nhân bản giọng cá nhân; nếu muốn giọng riêng thì đó là quyết định khác và cần mẫu được phép sử dụng.
- Probe CPU/GPU trên PC trước cài theo cấu hình phù hợp; không lấy benchmark tác giả làm kết quả máy của người dùng.
- Chọn/đo STT tiếng Việt online riêng: câu mẫu/alias, tiếng ồn, câu ngắn, phủ định, số phút; đo transcript và latency.
- Quota/credential chỉ cần với đường cloud có xác thực; giữ ở gateway, không trong app. Không chia sẻ API key qua chat hoặc bundle.

## Nguồn chính thức

- [VieNeu Studio và bảng gói công khai](https://www.vieneu.io/): token/gói, API và xuất audio. Trang Studio đã được đọc bằng trình duyệt, không bấm nút tạo hoặc nghe có tính phí.
- [VieNeu docs — Cloud so với SDK](https://docs.vieneu.io/): cloud tính theo ký tự, SDK chạy trên phần cứng của mình.
- [Cloud API overview](https://docs.vieneu.io/docs/cloud-api/overview/): đường tích hợp TTS HTTP, tách khỏi SDK.
- [SDK overview](https://docs.vieneu.io/docs/sdk/overview/): phương án chạy model local.
- [Repo VieNeu-TTS](https://github.com/pnnbao97/VieNeu-TTS): v4 độc quyền so với v3 Turbo mã nguồn mở, đường CPU/GPU và license repo.
- [Model card v3 Turbo](https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo): license model Apache-2.0, preset và giới hạn.

Liên quan: [thiết kế UX/plan voice](VOICE_INTERACTION_UX_SPEC.md), [storyboard](VOICE_UX_STORYBOARD.png). Chưa tạo audio, nghe mẫu, tải model, cài dependency, probe ASR, đổi runtime app hoặc deploy trong lượt này.
