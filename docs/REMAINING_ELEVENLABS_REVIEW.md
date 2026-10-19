# Kiểm tra100 bản ElevenLabs còn lại

Ngày19/10/2026. Theo [spec](REMAINING_ELEVENLABS_SPEC.md). **Đã tạo đủ100 bản và tích hợp local; tổng156 bản ElevenLabs đang được catalogue sử dụng.** Phần audio hoàn tất; tiện ích audit trên candidate còn lỗi tính di động được ghi rõ bên dưới.

Phạm vi100track: fiction-letter34VI+34EN, old-quarter-pilot16VI+16EN. Giữ bộ56ElevenLabs đã đạt; tổng mục tiêu156activeElevenLabs. Không đổi nội dung hoặc matcher/UI/backend.

## Bằng chứng coordinator

- Worker W3 Task `task_38fbf903f878`, authoritative dispatch `ctx_82d244d10d6e`, actual GPT-6-Luna/xhigh. Firstattempt hookreview failed trước chạy task đãcleanup; khôngduplicate generation.
- Dry-run100/25553ký tự, trần tổng30000đãchi9909, phần mới20091. Không coi dư tài khoản là quyền tăng ngân sách. W1 cho checkpoint và guarded continuation bằng `msg_e4df9e61c26b`, chặn từng POST theo rawcharacters/knowncost/shadowbalance, reconcile định kỳ, khôngretry POST chưa rõ kết quả.
- W1 phát hiện map duration thiếu locale làm VI overrideEN; W3 sửa key locale/internalID và thêm regression1.25sEN/2.75sVI. Auditor cũng kiểm catalogue duration bằng thời lượng file decode. W1 rerun24renderer tests PASS.
- W1 đối chiếu217audio/manifest/cue files worker với candidate baseline `98a9824`:0sai khác trước generation.
- Hai checkpoint dùng đúng caption trong100inventory, không thêm sample: EN SHA256 `7a415539779de35ed202aeb0b96fbbc880b25e16126f9066f69441f345d6d710`, VI `45af4672861d459e43ff7b63cbea6f5048fb73b28588536eb5163e1c2b08661a`. W1 hash vàffmpeg full decode2/2PASS. ENcost32/reserve81; VIcost31/reserve77. Accountcount9909→9972,delta63khớp,remaining30028,overagefalse. Tái dùng2file trongbatch.
- W1 kiểm độc lập100/100MP3 mới: SHA256khớp manifest. So212MP3 cũ với Gitblob baseline98a9824:0sai khác. So226protectedFileHashes(audio/manifest/cue/source):0sai khác. Đủ50VI+50EN, fiction34/locale vàpilot16/locale.
- Closing account thực08:28:50UTC: count20122/limit40000/remaining19878/overagefalse. Phần mới10213credit, bằng đúng delta20122−9909; tổnghaiđợt20122/trần30000, dưtrần9878. W1 tựGET subscription sau generation xác nhận lại đúng20122/40000/19878/false. AttemptURLError không ghi nhận phí ở closing; recovery72được tính trong10213, originalreserve180đãresolved_no_charge sau reconcile.
- Candidate nhận từng commit đã review: `532436a` → `c4b339b`, sửa hash notice LF/CRLF `173609b` → `3f78dc9`. W1 kiểm đầy đủ trên candidate `3f78dc9`: **286/286 app tests, TypeScript và lint đạt**. Chỉ hash notice mới được chuẩn hóa UTF-8/LF; audio/source giữ byte-exact.
- W1 chạy nguyên auditor trong W3 với ledger trỏ đường không tồn tại, các hàm key/network/cache đều bị thay bằng hàm ném lỗi: **100/100 giải mã toàn bộ, catalogue/source/account audit đạt**, không dùng key/cache/network. Python26/26 đạt tại W3. Candidate có cùng100 audio hash và226 protectedFileHashes,0sai khác; catalogue56 cũ bằng Git baseline98a9824 khi chuẩn hóa newline.
- Qua Metro LAN hiện tại `192.168.12.116`: bundle Android HTTP200/6581396bytes, iOS HTTP200/6579223bytes; mỗi bundle có200 tham chiếu tới100file mới và112 tới56file trước, URL gateway/API đúng IP mới, không còn gateway IP cũ hoặc biến `ELEVENLABS_API_KEY`. **156/156 asset HTTP200 và SHA256 khớp**, tổng53886596bytes. Đây là bằng chứng bundle/tải asset, không phải bằng chứng nghe trên điện thoại.

## Giới hạn công cụ audit trên candidate

Lệnh Python test nguyên trạng trên candidate đạt25/26: một test inventory đếm412MP3 thay vì212 vì helper kế thừa quét cả bản sao trong Android build. Auditor nguyên trạng cũng bị cùng phạm vi quét; sau thử giới hạn source roots trong bộ nhớ, nó còn phát hiện hash raw catalogue56 khác do LF/CRLF. Đối chiếu độc lập xác nhận catalogue56 không đổi nội dung, toàn100MP3 mới và226file được bảo vệ vẫn khớp byte-exact; không sửa expected hash, xóa build hay bỏ test để ghi pass. Không tuyên bố portable audit nguyên trạng trên candidate đã đạt.

Task sửa helper `task_5722a54614fd`/dispatch `ctx_650f80197ed2` bị chặn bởi quota Codex Luna thực tế (terminal báo usage limit, thử lại18:27 local). Coordinator đã stop/fence dispatch, giữ model/ownership, không đổi model hoặc chỉnh source của W3. Chưa có commit sửa helper; WIP comment duy nhất tại `mobile/tests/post8VoiceCatalogue.test.mjs` được giữ ở W3, không cherry-pick. Các commit giao audio và bản sửa notice đã được tích hợp, không phụ thuộc task helper này để phát audio. Mailbox cũ đã ACK và rỗng. Không có thêm paid synthesis.

Mở bản local theo [hướng dẫn demo](POST8_DEMO_GUIDE.md). QR hiện tại: `C:/Users/LEGION/AppData/Local/Temp/ngoke-demo-qr-current-lan.svg`, URI `exp://192.168.12.116:8081`; cần cùng Wi-Fi và reload Expo Go. Metro8081 và gateway18787 được giữ chạy; API Live18886 chưa bật. Không build APK mới, merge/push/publish/store hoặc ghi workspace chính.

## Lỗi kết nối và quyết định phục hồi

Sau75file/7518credit, POST VI `fiction-letter/qa-huong-answer` gặp URLError, không nhận response/cost/requestID/audio. Renderer giữ trạng tháiunknown, reserve180 và dừng; chưa thay catalogue. W1 cho kiểm read-only lịch sử theo [API history chính thức](https://elevenlabs.io/docs/api-reference/history/list), với đường tải [audio đã tạo](https://elevenlabs.io/docs/api-reference/history/get-audio) nếu có kết quả khớp.

W1 tựGET account+history tạiUTCepoch1792397462.594 và1792397542.828(cách80.234giây, sau lỗi nhiều phút): count17427/limit40000/overagefalse đều không đổi; delta7518khớp75file.100mục mới nhất có timestamp1792389734đến1792397169. Mục mới nhất xuất hiện trước thời điểm lỗi08:06:44UTC. W1 tiếp tục phân trang đến hết tại1792397929.344:2trang/131mụcduynhất/has_more=false; count vẫn17427.131mục đúng56cũ+75mới. Không tải/in key hoặc rawtext của các historyitem khác vào chat.

**Đính chính:** bộlọctext+voice+model lúcđầu trả0nhưng không có giá trị loại trừ bản ghi: LIST và GETdetail thực tế trảtext=null/voice_id=null. W1 không dùng kết quả đó làm nghiệm thu. Sau generation, W1 phân trang đủ156mục/156requestIDduynhất: tậpID bằng chính xác56manifestcũ+100mới,0thiếu/0thừa; phí từngrequest(from/to), eleven_v4 vàmp3_44100_128 đều khớp; tổngphíhistory20122. Requestphụchồi `ZgNqTlY7m3jNCfV5TCgs` cóhistoryID `7O7zEADMwTa0TALHG5EY`, count17427→17499/phí72. Source/voice vẫn kiểm bằng payload/hash/cấu hìnhlocal; không tuyên bố đã đọc được chúng từ history bịẩn.

Quyết định `msg_818b36961501`: chỉ cho một lần gửi lại track lỗi sau lưu nguyên entryunknown cùng hai observation và quyết định vào recovery evidence; không mở auto-retry chung. Giữreserve180trong báo cáo rủi ro đến closingreconcile; không gửi lại75file hợp lệ.24trackchưa thử vẫn theo guard cũ. Chưa coi retry, generation100 hoặc tích hợp là hoàn tất khi chỉ có quyết định này.

## Việc cần anh quyết / việc anh tự làm

- Cần quyết: không có quyết định mới để sử dụng156 bản đã tích hợp; không cần duyệt lại hoặc tăng ngân sách.
- Cần tự làm `[ngoài plan]`: nghe trên điện thoại sau tích hợp để đánh giá phát âm/cảm nhận. Scope đổi giọng hậu core TECH_DEMO_PLAN đã giao. Chưa có bằng chứng nghe/native/iPhone/GPSfix/QRthật; chưa coi là nghiệm thu những phần này.
