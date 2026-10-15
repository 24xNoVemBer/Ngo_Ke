# Ngõ Kể — Trải nghiệm trò chuyện với người kể

**Cập nhật trạng thái: 15/10/2026.** Tài liệu bắt đầu là thiết kế trước triển khai ngày 13/10. Voice hiện đã chạy trong app native; các câu “chưa triển khai/chưa chọn” bên dưới là snapshot lịch sử, không phải trạng thái repo. Roadmap và báo cáo V0–V7 là nguồn chuẩn cho gate và tiến độ.

Hành vi hiện đã triển khai: nhấn mic để thu, bấm Gửi hoặc Hủy; nhập chữ chỉ mở khi bấm Gõ; transcript, lời kể và đáp án ẩn mặc định. Play bắt đầu theo thao tác người dùng và tự lặp qua native player; Stop, mic handoff, đổi scope hoặc background dừng vòng lặp. Chip Q&A không tự phát tiếng. Mở/đóng chữ không reset audio. Các chi tiết nằm trong [VoiceInteractionDock](../mobile/src/components/VoiceInteractionDock.tsx), [VoicePlayerBar](../mobile/src/components/VoicePlayerBar.tsx), [useVoiceSession](../mobile/src/voice/useVoiceSession.ts) và [QaScreen](../mobile/src/screens/QaScreen.tsx).

Catalogue hiện có 34 audio canonical: intro, sáu story, sáu caption và 21 answer; được tạo bằng VieNeu v3 Turbo / Đoan Trang. Gateway STT đang chạy cục bộ trên LAN với faster-whisper large-v3 CUDA; matcher giữ nguyên phạm vi câu hỏi từng chương và trả unknown khi không khớp chắc chắn. Kiểm tra tự động hiện 171/171, nhưng nghe QC 34 clip và nghiệm thu audio trên thiết bị thật vẫn pending. Xem [báo cáo kiểm thử](VOICE_TEST_REPORT.md), [handoff](VOICE_HANDOFF.md) và [roadmap](VOICE_PHASE_ROADMAP.md).

## 1. Những gì đã chốt

- Hướng thị giác giữ **sổ tay ngõ phố: ấm, giàu bản sắc**, dùng ảnh thật hiện có; Demo được dùng ảnh chung có nguồn.
- Người dùng chọn **nhấn để nói → nghe trả lời → hỏi tiếp**. Mặc định nhấn một lần để bắt đầu, nhấn “Gửi câu nói” để dừng và gửi; không bắt buộc giữ ngón tay.
- **Feedback mới 13/10:** khi voice là chính, chữ thu gọn/ẩn mặc định; chỉ hiện câu đã nhận/lời kể/đáp án khi người dùng bấm **Xem chữ**. **Gõ chữ** mở ô nhập theo thao tác, không chiếm giao diện nghe mặc định.
- **Feedback về kích thước:** bố cục phải có mật độ của app mobile, không dùng tiêu đề/khối lớn kiểu trang giới thiệu. Mẫu chính được chỉnh thành **360×800 đơn vị layout**, lề 16, tiêu đề điểm 19sp, nhãn 13–15sp, dock 52dp và vùng chạm tối thiểu 48dp. Không lấy kích thước bảng trình bày nhiều màn làm kích thước UI.
- **Feedback thị giác/UX kế tiếp:** mẫu gọn vẫn quá thô và các khối ngang nhau. Đã thay mẫu chính bằng cặp **hi-fi nghe / mở chữ**: ảnh thật tích hợp vào đầu màn, màu logo làm điểm nhấn, giấy/voice rail/hành động có phân cấp khác nhau. Vẫn 360×800 và text đóng mặc định; các số đo của bản compact phía trên là lịch sử, tham số hiện hành ở mục 6.
- **Nội dung thu giọng đã thay 13/10:** theo yêu cầu mới, `data/demo.json` dùng truyện hư cấu **Bức thư cuối ngõ**, 6 chương và 21 Q&A. Lời đọc tự nhiên, không dùng copy “đây là dữ liệu demo”; nguồn/nhãn UI vẫn ghi Truyện hư cấu. Xem [kịch bản thu giọng](VOICE_FICTION_SCRIPT.md). Đây là thay đổi nội dung đã làm trong app, không có nghĩa connector/audio voice đã triển khai.
- Người kể: **nữ miền Bắc, ấm và tự nhiên**; chưa chọn voice ID hoặc nhà cung cấp vì chưa nghe mẫu.
- Người dùng đề xuất **VieNeu** nếu phương án khác mất phí. Sau kiểm tài liệu, ưu tiên đánh giá **v3 Turbo tạo audio trên PC**; Studio/API v4 có token và không miễn phí vô hạn. Xem [review VieNeu](VOICE_VIENEU_REVIEW.md).
- Nhận dạng tiếng Việt: **trực tuyến**. Người dùng đồng ý hướng gửi câu vừa ghi ra ngoài máy; khóa dịch vụ ở máy chủ. Đây không phải quyền lưu âm thanh dài hạn, dùng để huấn luyện hoặc thu nền.
- Trong lượt này chỉ làm thiết kế. Backend/connector cụ thể, cấu hình credential, giới hạn chi phí và code voice chưa được triển khai. Các quyết định cũ “Voice chưa có hướng người dùng chọn” đã được cập nhật một phần, không còn là lý do bỏ qua yêu cầu thiết kế này.

## 2. Nhìn lại giao diện và khả năng hiện có

Đã đọc source App/Home/Q&A/Plan/Camera, dock, matcher, recommendation, dữ liệu và handoff Voice. Đã xem ảnh Android native của lượt 12/10. Đây là review source và bằng chứng trước đó, không phải một lượt chạy native mới ngày 13/10.

| Hiện tại | Hạn chế với tương tác trực tiếp | Đề xuất |
| --- | --- | --- |
| Home: đường ngõ dài, thẻ điểm phía dưới, GPS/đọc/Sổ tay | Cần chuyển màn mới đọc/hỏi; hai CTA cùng mở Q&A; ngữ cảnh điểm xa vùng thao tác | Pin mở preview ngắn; một CTA “Mở lời kể”; trên trang kể đặt cả nghe, hỏi và hành động |
| Q&A: story dài trước câu hỏi; câu trả lời và follow-up ở dưới | Người dùng đọc nhiều trước khi trao đổi; chưa có cảm giác đến lượt mình nói | Trang trò chuyện gắn điểm, player/mic nổi bật; story/transcript/đáp án chỉ mở khi nhấn Xem chữ |
| `VoiceInteractionDock` chỉ có Hỏi bằng chữ/Sổ tay | Tên file có voice nhưng thực tế không thu/phát | Dock 1 nút chính “Nhấn để nói”, 1 đường “Gõ chữ”; điều khiển nghe nằm ở câu trả lời |
| Home gọi menu công cụ là Sổ tay, Q&A gọi Plan là Sổ tay | Cùng tên nhưng hai nội dung khác nhau | “Chọn trải nghiệm” dành cho Plan; “Công cụ” dành cho QR/GPS/nguồn; “Lời kể” dành cho nội dung |
| Plan: chủ đề/quỹ thời gian trong form riêng | Cắt mạch cuộc trò chuyện | Cho nhập bằng giọng hoặc chọn chip ngay trong trang kể; Plan là chế độ chỉnh đầy đủ, dùng chung state |
| Camera: QR, chọn tay và kể bằng chữ | Hai luồng kể riêng, có nguy cơ camera vẫn chạy khi mở mic | Sau xác nhận, “Mở lời kể” dùng cùng trang trò chuyện; tắt camera trước chuyển màn, không xin mic trong live preview |
| Baseline trước sửa chỉ điểm 01 có 6 Q&A | Không đủ trao đổi ở các điểm còn lại | **Đã thay:** điểm 01 có 6, điểm 02–06 mỗi điểm 3 Q&A trong cùng truyện hư cấu; vẫn cần nghe/review bản audio |
| Matcher khớp chính xác câu hỏi/alias sau normalize | Câu tự nhiên như “bạn kể xem ở đây có gì thú vị” sẽ không tự khớp | Alias nói được review; nếu chưa khớp, đưa lựa chọn có thật để người dùng xác nhận, không đoán đáp án |
| App chưa có package thu/phát/TTS và backend thật | Chỉ thêm icon mic vẫn không tạo voice thật | Thực hiện pipeline thu âm → STT → chọn đáp án/hành động → audio player, sau review plan |

`readNodeIds` hiện là **đã mở lời kể**, không có nghĩa đã nghe hết hoặc đã ghé địa điểm. Giữ nhãn này, không lấy nó làm thành tích nghe/đến nơi. Copy “Bạn đang đứng…” đã được thay bằng lời kể về nhân vật An trong câu chuyện; header vẫn nói “Đang xem”, không tự nhận vị trí GPS. Nhãn hư cấu thuộc UI/nguồn, không đọc vào mỗi đoạn audio.

## 3. Trải nghiệm chủ đạo

Một **trang trò chuyện với người kể**, gắn với điểm đang xem. Các chức năng đều quay về một vòng ngắn:

**Chọn điểm → nghe hoặc hỏi → thấy câu nhận dạng → nhận đáp án có nguồn → hỏi tiếp/chọn hành động.**

Không biến trang này thành chat cuộn vô hạn. Giữ lượt hiện tại và tối đa vài lượt gần nhất trong phiên; “Xem trao đổi trước” mở khi cần. Đổi điểm đóng lượt hiện tại, cập nhật tên điểm rõ ràng, không mang câu hỏi điểm cũ sang điểm mới.

### Cấu trúc trang

1. **Header ngữ cảnh:** Back, “Đang xem · Điểm 01/06”, tên điểm; ảnh thật nằm trong vùng đầu ngắn, không làm nền trực tiếp cho toàn bộ transcript. Trạng thái xác nhận địa điểm tách riêng, chỉ hiện nếu đã xác nhận.
2. **Vùng nghe trên nền giấy:** tên người kể/giọng, CTA “Nghe lời kể” hoặc player thật; không mở sẵn khối transcript/đáp án dài. Một nút thấp “Xem chữ” mở câu đã nhận, lời kể/đáp án nguyên văn và nguồn. Chữ khi mở vẫn 17sp/26, không giảm font để thu nhỏ.
3. **Câu hỏi tiếp:** tối đa 2–3 chip từ `followUps` đúng điểm, nhãn ngắn nhưng dùng question ID gốc. Không tạo chip cho điểm chưa có dữ liệu.
4. **Hành động liên quan:** thẻ kết quả có nút thực hiện, ví dụ “Xem điểm tiếp theo”, “Chọn trải nghiệm”, “Xem nguồn”. Không ghim toàn bộ công cụ ở mọi lượt.
5. **Dock ở vùng một tay:** nút chính cao ít nhất 56dp “Nhấn để nói” / “Gửi câu nói” / “Hỏi tiếp”; nút Gõ chữ có nhãn, vùng chạm ít nhất 48dp. Trạng thái và Hủy nhìn thấy khi thu/xử lý.

**Mẫu hiện hành:** [màn nghe](VOICE_UX_HIFI_LISTEN.png) · [mở phần chữ](VOICE_UX_HIFI_TEXT.png) · [SVG nghe](VOICE_UX_HIFI_LISTEN.svg) · [SVG chữ](VOICE_UX_HIFI_TEXT.svg). Hai trạng thái cùng khung 360×800, ảnh/brand từ app và đáp án thật của fixture. Đây là thiết kế thị giác, chưa phải native runtime hay proof voice. [Mẫu compact](VOICE_UX_MOBILE_COMPACT.png) và [bảng ba trạng thái](VOICE_UX_STORYBOARD.png) giữ làm lịch sử, không còn là chuẩn thiết kế.

### Chữ chỉ hiện khi người dùng mở

- Mặc định trang nghe có ảnh/ngữ cảnh điểm, trạng thái voice, player, câu hỏi tiếp/thẻ hành động và nút Xem chữ; không có textarea hoặc khối story/answer dài chiếm màn.
- **Xem chữ** mở một panel đọc có câu đã nhận, nội dung nguyên văn và nguồn; nút đổi thành **Thu gọn**. Nội dung dài cuộn bên trong vùng đọc, dock voice vẫn truy cập được. Việc mở/đóng không reset turn, tua lại hoặc dừng audio.
- **Gõ chữ** mở drawer nhập và bàn phím. Đường **Sửa câu** trong panel đọc mở đúng transcript đang có; không tạo input riêng luôn hiện ở màn chính.
- Đáp án từ lượt voice mới không tự bật panel đọc. Khi đổi điểm, panel trở về thu gọn; nếu người dùng chủ động đang đọc trong cùng điểm, nhận lượt mới cập nhật nội dung nhưng giữ trạng thái mở.
- Từ chối mic/mất mạng/không có audio hiện thông báo ngắn và nút **Gõ chữ / Xem chữ**, không tự bung khối dài. Khi đã chọn đường chữ, nội dung còn dùng được đầy đủ; không bỏ fallback.
- Nút Xem chữ có trạng thái expanded và nhãn trợ năng. Nội dung đóng không chen vào thứ tự focus hoặc tự đọc qua live region; nguồn vẫn truy cập được từ panel. Không dựng panel đã đóng bằng opacity 0 mà vẫn chiếm layout.

### Một lượt hỏi cụ thể

| Thao tác | Người dùng thấy/nghe | Việc thực sự phải xảy ra |
| --- | --- | --- |
| Nhấn “Nhấn để nói” | Xin quyền ở lần đầu; khi sẵn sàng mới hiện “Đang nghe” | Cấp quyền, chuẩn bị recorder, xác nhận recording active; không hiện waveform khi chưa thu |
| Nói “Con ngõ này có gì để xem?” | Mức âm thanh và thời gian thu thật; nút Gửi/Hủy | Thu một clip, không gửi các clip cũ hoặc upload nền |
| Nhấn “Gửi câu nói” | “Đang nhận câu nói…” và Hủy | Đóng recorder, gửi clip lên dịch vụ STT qua gateway |
| STT trả text | Trạng thái “Đã nhận câu hỏi”; Xem chữ mở transcript và Sửa câu | Giữ transcript gốc; normalize để tra Q&A, không thay câu máy nghe ra bằng câu mẫu mà không giải thích |
| Q&A khớp | Player hiện khi audio sẵn sàng; Xem chữ mở đáp án nguyên văn/nguồn | Chọn entry đúng `nodeId`, đọc đúng nội dung có evidence; phát vì lượt voice vừa do người dùng khởi tạo |
| Đang phát mà nhấn mic | Audio dừng/tạm dừng, rồi mới “Đang nghe” | Không thu âm lời kể từ loa; chỉ một lượt thu hoặc phát hoạt động |
| Hết đáp án | “Bạn muốn hỏi tiếp điều gì?” bằng UI, chip thật và thẻ hành động | Đưa follow-up theo ID; không tự thu câu sau, không tự phát tiếp chuỗi vô hạn |

Nếu chưa có STT streaming, không giả lập transcript chạy theo từng từ trong lúc nói. Mức âm lượng thật đủ để cho biết mic đang thu; transcript có sau nhận dạng và chỉ trình bày khi người dùng mở đường chữ.

## 4. Làm gì để tương tác phong phú hơn

| Tương tác | Kết quả trực tiếp | Ranh giới |
| --- | --- | --- |
| Nhấn chip câu hỏi | Đáp án sẵn sàng ngay; Nghe / Xem chữ để chọn cách tiếp nhận | Không tự mở khối chữ hoặc bất ngờ bật loa chỉ vì chạm chip |
| Hỏi qua mic | Hiện text và phát đáp án nếu audio sẵn sàng | Voice mode là hành động người dùng vừa bật; nhớ bật/tắt nghe trong phiên |
| “Nghe lại” / “Dừng lời kể” | Player seek đầu / stop ngay | Chỉ nhận khi người dùng bật mic; không nghe wake word nền |
| “Xem điểm tiếp theo” | Chọn điểm mở kế tiếp, cập nhật trang | Xem điểm không có nghĩa đến nơi; không tạo chỉ đường từng bước |
| “Mình muốn ẩm thực, có 15 phút” | Chip “Ẩm thực / 15 phút” và tối đa 3 thẻ từ `pickPoints` | Cần bộ intent/slot có kiểm tra; không đưa cả câu vào `parseTimeBudget` đang chỉ nhận chuỗi thời lượng |
| Chỉ nói “ẩm thực” | Hỏi lại bằng UI “Bạn có bao nhiêu phút?” với chip và mic | Giữ slot chủ đề trong phiên; không hỏi lại câu đã biết |
| Nói “mười lăm phút” khi đang chờ thời gian | Điền 15 và đưa kết quả | Chuyển số tiếng Việt theo bộ hỗ trợ có test; phủ định/2 thời lượng không được tự chọn một |
| “Xác định điểm của mình” | Thẻ “Dùng GPS” hoặc “Quét QR” | Người dùng bấm bắt đầu, xin quyền đúng lúc; candidate cần xác nhận riêng |
| Chọn thẻ kết quả | Mở điểm được chọn ngay trong trang kể | Không tự đánh dấu đã ghé/đã xác nhận vị trí; không tự bật loa sau đổi điểm |
| Bấm nguồn/ảnh | Drawer nguồn đúng câu/ảnh đang xem | Không trộn nguồn ảnh minh họa thành evidence của lời kể |

Các lệnh điều khiển là phạm vi mở rộng đề xuất cho Voice, phải được đưa vào plan duyệt; chưa có trong core. Ưu tiên làm nghe/hỏi/hỏi tiếp trước; chỉ thêm lệnh giúp hoàn tất một hành động có sẵn.

### Xử lý câu nói tự nhiên mà không sinh đáp án

- Bộ intent nhỏ: `ask`, `play-story`, `replay`, `stop`, `show-next`, `plan`, `locate`.
- Q&A vẫn dùng câu hỏi/alias được review, đúng điểm. Không biến STT thành chatbot LLM hoặc lấy đáp án gần nghĩa ở điểm khác.
- Alias tương đương như “ở đây có gì để xem” có thể thêm vào data sau review. Câu hỏi khác nghĩa không được tự coi là tương đương.
- Khi không khớp, copy: “Mình chưa có lời kể cho câu này. Bạn có thể thử một câu dưới đây.” Kèm 2–3 câu có thật, Sửa câu, Nói lại; nếu điểm không có Q&A thì chỉ có nghe story/đổi điểm.
- Câu mơ hồ, hai chủ đề, hai thời lượng hoặc phủ định cần chọn lại slot; không dùng substring hiện tại để suy ý. Ví dụ “không muốn ẩm thực” không được chọn Ẩm thực.
- Lệnh phụ thuộc lượt như “câu đầu tiên” chỉ dùng khi đang có danh sách lựa chọn và vẫn trỏ đúng ID/revision; ngoài ngữ cảnh thì hỏi lại.

## 5. Trạng thái và phục hồi

| Trạng thái | Nhãn/nút chính | Phản hồi và lối thoát |
| --- | --- | --- |
| Sẵn sàng | Nhấn để nói | Không có pulse “đang nghe”; Gõ chữ luôn sẵn |
| Chuẩn bị mic | Đang mở micro… | Busy thật; hủy được; quyền được hỏi tại thao tác này |
| Đang thu | Gửi câu nói | Mức âm lượng thật, thời gian thu, Hủy; giới hạn clip sẽ chốt theo connector |
| Đang nhận dạng | Đang nhận câu nói… | Progress theo request, Hủy; không làm full-screen loading |
| Cần chọn lại | Chọn ý bạn muốn hỏi | Transcript giữ nguyên trong panel Xem chữ, chip có thật và đường Xem/sửa câu |
| Đáp án đã có, audio chưa có | Xem chữ / Thử lại âm thanh | Chữ sẵn sàng khi bấm mở; không bắt chờ TTS để đọc hoặc tự bung panel |
| Đang phát | Tạm dừng / Dừng | Player progress theo thời gian thực, Hỏi tiếp dừng phát trước |
| Tạm dừng | Nghe tiếp / Nghe lại | Giữ vị trí player; không chạy timer giả |
| Thu im lặng hoặc rất ngắn | Nói lại / Gõ chữ | Không gửi clip trống; ngưỡng phải hiệu chỉnh tiếng Việt trên máy thật |
| Không nhận được câu | Nói lại / Sửa câu | Chỉ cảnh báo ồn khi có tín hiệu đo được; không đoán là tiếng ồn cho mọi lỗi |
| Từ chối mic | Gõ chữ / Mở cài đặt | Không xin quyền lặp mỗi lần chạm; Nghe lời kể vẫn hoạt động |
| Mất mạng/STT timeout | Thử lại / Gõ chữ | Giữ câu nhập; retry chỉ khi người dùng bấm, không upload lại ngầm |
| Hết quota/provider lỗi | Gõ chữ, thử lại khi dịch vụ sẵn sàng | Không trả lời giả/đổi sang câu mẫu rồi nhận là đã nghe đúng |
| Back/đổi điểm/Demo–Live/background | Dừng lượt hiện tại | Dừng recorder/player, hủy request hoặc bỏ kết quả cũ; quay lại không tự phát/thu |

Một `turnId` gắn `nodeId + datasetRevision + mode`. Kết quả quyền/STT/TTS/audio cũ không được làm thay đổi lượt mới. Chỉ một recorder/player active; tránh queue TTS chồng nhau. Audio ngắt vì cuộc gọi hoặc rút tai nghe không tự bật loa lại.

**Offline:** chỉ cam kết nhập/đọc/chip local. Nghe offline chỉ có với audio đã bundle/tải thành công; mic cloud không nhận dạng offline. Để trạng thái nghe phản ánh audio thật đang có, không hứa offline theo icon.

## 6. Thị giác và motion

- Giữ nền giấy `#F7F2E8`, mực `#2E3028`, hành động xanh `#2D5748`; gạch nung `#9C4F36` chỉ cho thu giọng/nhấn hiếm. Trạng thái luôn có chữ và icon, không dựa riêng vào màu.
- Ảnh đầu trang ngắn, chữ hội thoại nằm trên giấy đặc. Giảm nền ảnh full-screen và card lồng card; trang kể mới ưu tiên đối thoại thay cho khối giới thiệu dài.
- Mẫu hi-fi 360×800 giữ **lề 24**, header điểm **22sp**, label 13–16sp, player **66dp**, dock hỏi **56dp**; icon nhỏ trong vùng chạm ≥48dp. Body khi mở chữ vẫn 17sp/26; không dùng headline 25–32sp cho lời nhắc thường xuyên.
- **Điểm nhấn hình ảnh:** ảnh đầu kéo đến khoảng y330, scrim ở nơi đặt chữ, lớp giấy phía dưới nối mềm vào ảnh. Dùng logo đã có làm dấu người kể và một bookmark nhỏ màu vàng; không dựng avatar người thật hoặc nhân vật lip-sync giả. Mẫu chữ dùng sheet từ khoảng y210 để ưu tiên đọc.
- **Phân cấp hành động:** voice rail xanh đậm = điều khiển lời đang nghe; nút vàng từ màu logo = bắt đầu câu hỏi mới; Gõ chữ là icon/nhãn phụ. Các lựa chọn phụ không chia thành những card cùng trọng lượng. Tone vàng `#D8B576` / mực vàng `#574022` là token bổ sung của mẫu, không đổi toàn bộ palette app.
- **Nhịp tương tác:** Nhấn mic khi đang nghe dừng player rồi chuyển chính vùng voice rail sang trạng thái thu, dock chuyển thành Gửi/Hủy; không mở màn mới hoặc làm nội dung nhảy. Xem chữ mở trang giấy, audio tiếp tục và điều khiển nghe thu thành một hàng; đóng chữ trả focus về nút đã mở.
- **Gợi ý có ngữ cảnh:** câu hỏi kế dùng ID follow-up, action Chọn trải nghiệm trình bày khác chip hỏi; Điểm kế tiếp là một hàng có số điểm để nhận biết kết quả trước khi chạm. Không biến toàn bộ công cụ thành lưới nút thường trực.
- **Hoàn thiện trạng thái:** loading giữ bố cục/nhãn và Hủy, lỗi có Nói lại/Gõ chữ, denied không chặn player, pressed chỉ thay một thuộc tính nhẹ. Các trạng thái này đã có hợp đồng trong mục 5, chưa được coi là code chạy chỉ vì có mẫu PNG.
- **Kiểm mẫu hi-fi:** đã render từng trạng thái 360×800 và xem ảnh; text không vượt khung, các vùng chạm khai báo của trạng thái hiện hành ≥48 và trong màn. Tương phản token nút vàng 4.99:1, player 12.61:1, chữ trên giấy 13.15:1. Đây là kiểm artwork/tokens, không thay native accessibility, font scale, audio hay FPS; chữ trên ảnh đã kiểm thị giác và thêm scrim trái.
- Tên nguồn 13sp, transcript/answer 17sp. Khi chữ 150–200%, dock và header tăng cao theo nội dung, body cuộn; không ép chip/nút một dòng bằng giảm cỡ chữ.
- Press 100–160ms, card/answer fade+translate 160–220ms, sheet 220–280ms: mục tiêu thiết kế, không dùng duration làm thời gian chờ xử lý.
- Waveform chỉ từ recorder metering. Player hiển thị progress thật; chưa có dữ liệu âm lượng phát thì không dựng equalizer giả “đang nói”. Không làm nhân vật lip-sync khi không có dữ liệu.
- Haptic ngắn có thể dùng ở thời điểm recorder **thực sự** bắt đầu/kết thúc nếu bổ sung module và thiết bị hỗ trợ; không cần rung mọi chip.
- Reduce Motion dùng provider đã có: trạng thái vẫn đổi, không pulse/zoom/di chuyển lớn; vẫn cập nhật progress cần thiết. Accessibility không đọc liên tục số giây hoặc từng bar waveform.
- Screen reader có nhãn “Bắt đầu thu câu hỏi”, “Dừng và gửi câu hỏi”, “Hủy câu nói”, busy/disabled đúng. Không bắt giữ/drag để dùng mic; không để screen reader đọc đáp án đồng thời với TTS.

## 7. Thiết kế kỹ thuật ban đầu (snapshot trước V0)

### Phương án đề xuất

**Thu bằng `expo-audio` → gateway Node 24 → dịch vụ STT tiếng Việt → matcher/intent giới hạn → đáp án text đã duyệt → audio VieNeu tạo trước → player `expo-audio`.**

Đây là đề xuất, chưa cài package/chọn connector/code. App hiện Expo `~57.0.26`; tài liệu Expo hiện hành ghi Audio `~57.0.5` và Speech `~57.0.3`. Khi triển khai dùng `expo install` để chọn bản tương thích, rồi kiểm lockfile/native thật; chưa coi đọc docs là compatibility test.

| Lựa chọn | Đánh giá |
| --- | --- |
| Audio được tạo trước bằng VieNeu v3 Turbo trên PC, phát bằng player | **Ưu tiên đánh giá** để giảm phí TTS theo lượt, giữ giọng nữ Bắc nhất quán và player thật; vẫn cần nghe mẫu/thiết lập máy |
| Audio xuất từ VieNeu Studio/API v4 hoặc TTS cloud khác | Lựa chọn nếu chất lượng bản mở chưa đủ và người dùng chốt quota/ngân sách; không miễn phí vô hạn |
| TTS hệ thống `expo-speech` | Nhẹ để thử, nhưng pause/resume không có trên Android và iPhone silent mode có thể không phát; không đáp ứng nguyên trạng UX player đồng nhất |
| Hội thoại sinh bằng LLM/realtime | Không cần cho luồng đã chọn; mở loại dữ liệu/hành vi mới ngoài scope hiện tại, chưa được đề xuất đưa vào đợt đầu |

Ưu tiên nghe thử preset **Ngọc Linh** (storytelling) và **Đoan Trang** (natural) của VieNeu v3 Turbo vì model card ghi nữ miền Bắc. Pin SDK/model revision, kiểm preset thật đang cài và nghe cùng một đoạn; chưa kết luận giọng nào ấm/tự nhiên hơn. Không cần nhân bản giọng cá nhân để đạt mục tiêu này.

Studio/API v4 tính token; bản v3 Turbo mở chạy trên máy riêng không có phí API theo từng lượt phát. Repo/model card xác nhận Apache-2.0 và quyền audio từ preset đi kèm, nhưng cần giữ notices và đúng bộ artifact/revision. Không hứa chất lượng bản v3 giống Studio v4. ASR trực tuyến vẫn là một lựa chọn riêng có thể phát sinh phí; không nói toàn bộ voice miễn phí. TTS cloud, nếu chọn sau, vẫn cần chốt quota và quyền gửi text ra dịch vụ.

FPT TTS trả URL bất đồng bộ, docs mô tả file có thể chưa sẵn ngay và thời gian tạo phụ thuộc text. Vì vậy nếu dùng FPT: tạo trước sau review text, kiểm file sẵn/phát được, rồi phát từ cache/asset. Không gửi TTS trong mỗi lượt hỏi rồi treo UI chờ. STT provider chưa chọn/benchmark, không coi endpoint TTS là endpoint STT.

### Hợp đồng bổ sung để review

- Gateway thu hẹp cho Voice, không kéo toàn bộ CRUD/SQLite phase backend vào lượt này. Credential server-only, không đặt trong biến `EXPO_PUBLIC_*` hoặc gói app.
- Upload một clip vừa gửi kèm `turnId` và locale; giới hạn duration/file size/MIME và timeout theo connector thật. Trả transcript hoặc lỗi có thể phục hồi; confidence chỉ dùng nếu provider thực sự cung cấp.
- Audio manifest phụ trợ: content ID, node ID, text hash/revision, voice ID, audio asset/URL, duration nếu có. Nội dung đổi thì audio cũ không được đọc cho text mới; thiếu audio vẫn đọc chữ.
- Không sửa schema dữ liệu core chỉ để gắn một URL tạm; proposal manifest tách riêng cần validation. Evidence đến từ Q&A/core, không lấy transcript hoặc TTS response làm nguồn.
- Recorder/player qua adapter và controller; screen chỉ trình bày trạng thái và gửi thao tác. Reuse `findAnswer`, `normalizeQuestion`, `pickPoints`, callbacks select/confirm đã có; intent/slot mới bổ sung test tại một chỗ.
- File âm thanh thô chỉ dùng xử lý lượt hiện tại; xóa file tạm theo lifecycle, không lưu lịch sử audio/DB mặc định. Retention phía nhà cung cấp, quyền dùng nội dung và quota cần kiểm trước chọn connector, không hứa “không lưu” thay nhà cung cấp.
- Chưa có dịch vụ/credential/backend thật trong repo; không gọi `tools/mock-api` là voice thật. Nếu dùng native STT ngoài bộ module Expo Go, cần development build theo tài liệu Expo; phương án ghi clip + HTTP này không mặc định yêu cầu module STT native.

## 8. Thứ tự triển khai ban đầu — bảng V0–V4 là lịch sử

**Roadmap hiện hành:** [VOICE_PHASE_ROADMAP.md](VOICE_PHASE_ROADMAP.md), chi tiết **V0–V7**, có nhiệm vụ/file/kiểm thử/gate từng phase. Bảng V0–V4 dưới đây là chia đợt sơ bộ từ lượt thiết kế trước, chỉ giữ để truy vết; không dùng mã đợt này để duyệt triển khai nữa. Theo roadmap mới: V0 probe/chốt, V1 audio, V2 UI/nghe, V3 thu, V4 STT, V5 Q&A end-to-end, V6 hành động và V7 nghiệm thu.

| Đợt | Việc làm | Điều kiện xong |
| --- | --- | --- |
| V0 — Mẫu giọng/connector | Nghe cùng text với Ngọc Linh/Đoan Trang trên VieNeu v3 Turbo; so với Studio chỉ khi có quota được cho phép; probe STT tiếng Việt, chốt chi phí/retention/config và giới hạn clip | Chọn giọng/provider bằng mẫu nghe và transcript thực; không chọn chỉ theo tên |
| V1 — Nghe và trang kể | Trang giấy/ngữ cảnh/player, audio của story và Q&A điểm 01, Gõ chữ | Audio đúng text, play/pause/replay/stop, đổi điểm/Back/background không phát cũ; thiếu audio không mất text |
| V2 — Hỏi bằng giọng | Mic permission/record/send/cancel, gateway STT, transcript/sửa, Q&A đúng điểm | Một clip thật ra đúng transcript và đáp án; denied/network/unknown/out-of-order có lối thoát; không waveform giả |
| V3 — Hỏi tiếp và hành động | followUps/inline cards, shared Plan draft, intent/slot cho hành động có sẵn | Không reset chủ đề/thời gian khi mở Plan; không nhầm phủ định/số; không tự xác nhận GPS hoặc đánh dấu ghé |
| V4 — Phủ nội dung/nghiệm thu | Review 21 Q&A/alias hư cấu đã viết, nghe và hiệu chỉnh, manifest audio, điện thoại thật | Nội dung/evidence hợp lệ; tiếng Việt ngoài đường, tai nghe/silent mode/font lớn/Reduce Motion/screen reader đạt; báo latency thật |

V1–V4 là thứ tự thực hiện, không cấp quyền vượt gate. Không đưa một nút chưa nối service vào bản bàn giao rồi báo voice đã xong. Nếu chỉ có pilot điểm 01, phải ghi rõ phạm vi và trạng thái thiếu Q&A ở 02–06.

Ảnh hưởng chính: `App.tsx`, `QaScreen.tsx`, `HomeScreen.tsx`, `PlanScreen.tsx`, `CameraScreen.tsx`, dock/drawer/icon; thêm controller/adapter Voice và audio manifest; `package.json`/lockfile/app config cho audio/quyền; gateway mới và tests. Data/alias chỉ đổi sau review; không xóa schema validation/logic xác nhận vị trí. Thêm package theo nhu cầu recorder/player, không thêm state/animation library chỉ để làm mới UI.

## 9. Ca nghiệm thu phải có

1. Mic thu thật trên iPhone/Android, waveform theo mức âm thanh, gửi đúng một clip. Bấm nhanh trong prepare/stop không tạo 2 recorder/upload.
2. STT trả “Con ngõ này có gì để xem?” → đúng `qa-02/demo-01`; text và audio cùng revision, đủ source; không phát đáp án điểm 01 ở điểm 05.
3. Nhấn mic khi đang phát → audio dừng rồi thu, không echo lời kể. Hủy/Back/background/đổi mode/đổi điểm → kết quả cũ bị bỏ.
4. Thu im lặng, từ chối quyền, không có giọng, TTS/audio lỗi hoặc hết quota → chữ và chip vẫn hoạt động; không hứa đã nghe/đã phát.
5. Nói sai/ASR sai → Xem chữ mở đúng transcript nhận được, sửa hoặc chọn câu; ngoài dữ liệu → unknown, không bịa hoặc silently khớp gần nhất. Khối chữ không tự hiện sau lượt voice; toggle không ngắt/reset audio, Gõ chữ chỉ mở input khi bấm.
6. Hỏi tiếp sử dụng ID hợp lệ đúng điểm; đổi điểm làm hết hiệu lực “câu đầu tiên” của điểm cũ.
7. “Ẩm thực / mười lăm phút” đủ slot; “không muốn ẩm thực”, hai thời lượng, số sai hoặc điểm đóng cần chọn lại, không đi sai luồng.
8. Player seek/pause/resume/stop thực; progress theo status, không timer giả; nhiều lần nghe không chồng queue và listener không tăng.
9. Tai nghe Bluetooth/rút tai nghe/cuộc gọi/silent mode/volume nhỏ; không tự bật loa hoặc thu lại khi trở về app.
10. Font 150–200%, viewport thấp, keyboard mở, TalkBack/VoiceOver và Reduce Motion; controls còn chạm/đọc được.
11. Đo riêng stop-record→transcript và transcript→audio bắt đầu, p50/p95 trên cùng thiết bị/mạng/corpus. Ghi cả lỗi; chưa đặt SLA hứa hẹn trước probe connector.
12. Regression core 111 ca hiện có, thêm controller/request-token/intent/manifest/native integration tests; Expo export không thay kiểm voice phần cứng.

## 10. Checklist review ban đầu — đã được thay thế

Các câu hỏi review dưới đây thuộc plan 13/10. Prompt người dùng ngày 15/10 đã khóa quyết định sản phẩm và cho phép tiếp tục xuyên suốt V0–V7; chỉ các kiểm tra con người/thiết bị còn pending trong phần trạng thái ở đầu tài liệu cần hoàn tất.

### Cần anh quyết

- **Review bố cục:** đề xuất trang trò chuyện gắn điểm và dock Nhấn để nói/Gõ chữ. Nếu chưa chốt, giữ app hiện tại và chỉ sửa thiết kế.
- **Connector và giọng cụ thể:** đã chốt nữ Bắc/cloud STT và ưu tiên đánh giá VieNeu; còn chọn ASR engine và voice ID sau mẫu nghe/probe. Đề xuất Ngọc Linh/Đoan Trang cùng text; chưa mua/chọn cloud provider mặc định.
- **TTS tạo trước:** đề xuất VieNeu v3 Turbo trên PC rồi đóng gói/cache audio; dùng Studio/API v4 chỉ khi chất lượng bản mở chưa đủ và đã chốt quota. Đây là quyết định chọn cách tạo audio, không cần TTS chạy liên tục trên điện thoại.
- **Phạm vi đợt đầu:** đề xuất V0 trong [roadmap V0–V7 hiện hành](VOICE_PHASE_ROADMAP.md). Sau chọn giọng tạo audio đủ 6 chương, nghe/UI rồi thu/STT/Q&A và hành động; không tự mở chatbot LLM hoặc dẫn đường. Review plan là bước trước coding theo phạm vi Voice riêng.

### Cần anh tự làm

- Chọn tài khoản/credential và ngân sách/quota cho STT online hoặc TTS cloud nếu dùng; đường TTS v3 local không cần tài khoản cloud chỉ để tạo file. Đây là phần chuẩn bị connector đã nằm trong plan Voice; không gửi secret vào chat hoặc commit.
- Nghe mẫu trên tai nghe/điện thoại và chốt giọng; “nữ miền Bắc” không đủ để đánh giá độ ấm tự nhiên. Nếu chưa nghe, style giọng vẫn là mục tiêu thiết kế.
- Thử mic/audio/ASR trên iPhone và Android thật, ở môi trường yên tĩnh lẫn ngoài đường. Emulator chỉ kiểm state, không chứng minh chất lượng tiếng Việt/voice.
- Nội dung văn hóa thật vẫn cần nguồn/review như plan data. Pilot mô phỏng đủ để kiểm voice; không cần bịa lịch sử để demo giàu tương tác.

## 11. Nguồn kỹ thuật và giới hạn xác minh

- [Expo Audio](https://docs.expo.dev/versions/latest/sdk/audio/): ghi/phát, permission, recorder state/metering và player; API không tự thực hiện STT.
- [Expo Speech](https://docs.expo.dev/versions/latest/sdk/speech/): TTS hệ thống, pause/resume không hỗ trợ Android và giới hạn iPhone silent mode.
- [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/): dùng native library/config riêng; không hứa mọi module STT chạy trong Expo Go.
- [FPT TTS API](https://docs.fpt.ai/docs/en/speech/api/text-to-speech.html): `banmai`/`thuminh` là nữ Bắc, đầu ra audio bất đồng bộ. Chưa gọi tài khoản dịch vụ, nghe mẫu hoặc đo latency thực trong lượt này.
- [Review VieNeu và nguồn chính thức](VOICE_VIENEU_REVIEW.md): ưu tiên v3 Turbo tạo audio trước, tách khỏi Studio/API v4 trả phí; STT chưa xác minh.
- [Handoff Voice hiện có](HANDOFF_VOICE.md), `mobile/src/qa/match.ts`, `mobile/src/recommendation/pick.ts`, `data/demo.json`: căn cứ nội dung/luồng thật của repo.
- Guidance local `ui-ux-pro-max`: error recovery/loading feedback và accessibilityLabel phù hợp RN đã tra được. Query audio/mic lifecycle không có match chuyên biệt; phần audio lấy từ docs Expo và phân tích sản phẩm, không nhận là benchmark của skill.

Lượt thiết kế không nối/cài/call dịch vụ voice hoặc deploy. Theo yêu cầu nội dung kế tiếp, đã thay fixture thành truyện hư cấu và chỉnh nhãn Q&A để không nhận truyện là tư liệu kiểm chứng. Không báo voice hoạt động, chất lượng nhận dạng hoặc FPS đạt khi chưa thử.
