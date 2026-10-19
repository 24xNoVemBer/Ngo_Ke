# Hoàn thiện audio ElevenLabs còn lại — 19/10/2026

Người dùng yêu cầu “hoàn thiện nốt đủ các bản ghi còn lại”. Sau bộ Ba lát cắt phố cổ đã đủ56/56, scope mới là100track đang active của fiction-letter và heritage-pilot, đủ VI/EN. Đây là quyền thay active catalogue của hai bộ cũ, supersedes giới hạn chỉ56 trong THREE_LENSES_ELEVENLABS_SPEC; vẫn bảo toàn bytes mọi audio đã có.

## Hợp đồng và giới hạn

**Đính chính bằng chứng history sau closing:** API LIST và GETdetail trảtext=null/voice_id=null; bộ lọc0matchtext+voice trước đó không chứng minh vắng bản ghi. Không dùng nó làm kết luận trong manifest/báo cáo. W1 đã phân trang đầy đủ156historyitems sau generation: requestIDset bằng chính xác56đãđạt+100mới,0thiếu/0thừa, phí từngrequest(from/to), model vàformat đều khớp; tổng20122. Bản phục hồi córequestID `ZgNqTlY7m3jNCfV5TCgs`, historyID `7O7zEADMwTa0TALHG5EY`, count17427→17499/phí72. Bằng chứng đúng làaccountsettled+historycount/window trước recovery và đối chiếu requestID/phí đầy đủ sauclosing. Metadata phải ghi rõ text/voice bịẩn; không đổi/tạo lại audio để sửa chú thích bằng chứng.

**Điều chỉnh W1 sau dry-run thực:**100track/25553ký tự, reserve toàn batch vượt phần còn20091 là5462. Cho chạy đúng2caption trong inventory (reserve158), đối chiếu header/accountdelta rồi tiếp tục tuần tự khi từng request kế vẫn reserve đủ1credit/ký tự dưới trần20091 tính theo phí đã biết. Không suy discount cho tương lai hoặc tăng cap; dừng trước request không đủ reserve. Quyền nội bộ `msg_e4df9e61c26b` chỉ có hiệu lực sau sửa collision duration theo locale và test regression. Không tạo sample ngoài100track.

**Phục hồi có bằng chứng — chỉ một lần:** request VI `qa-huong-answer` dừng URLError sau75file/7518credit; không có response/audio/requestID. W1 độc lập GET account+100historyitems tại UTC epoch1792397462.594 và1792397542.828 (cách80giây, sau lỗi nhiều phút): count17427/limit40000/overagefalse đều không đổi, delta7518khớp75file; history mới nhất1792397169, cũ nhất1792389734 bao phủ thời điểm lỗi, không có match rawtext+voice+model. W1 cho một lần gửi lại đúng track này sau khi lưu nguyên entryunknown, hai observation và quyết định vào recovery evidence; giữ reserve180 của attempt cũ trong báo cáo rủi ro cho đến closingreconcile. Không coi đây là quyền auto-retry mọi unknown. Cấm gửi lại75file đã hợp lệ; bộ24chưa thử tiếp tục theo guard cũ. Nếu xuất hiện phí/history không khớp thì dừng và dùng GET audio từ history trước; không bịa completion/chi phí. Manifest cuối phải giữ recovery evidence và accountdelta thực, audit/test phải kiểm điều này.

- Giữ Thắm `0ggMuQ1r9f9jqBu50nJn` / Talia `OZ0L6eISlOejga3XjDFt`, eleven_v4, stability0.5/similarity0.75, mp3_44100_128. Đọc nguyên văn text nguồn hiện hành; không áp phiên âm Kokoro.
- Kiểm inventory theo production catalogues và source/revision thực: fiction34/locale, pilot16/locale; tổng100. Không sinh lại56ElevenLabs đã đạt.
- Trần chi tổng vẫn30000credit, đã dùng9909, phần mới tối đa20091. Không tự nâng trần theo balance tài khoản; không overage/mua quota. Preflight read-only subscription/voice/model, dry-run số ký tự và kế hoạch chi trước paid call. Nếu reserve toàn bộ theo1credit/ký tự quá trần, báo W1; không tự suy giảm giá từ batch trước hoặc gọi trả phí thử ngoài inventory.
- Tái dùng renderer hiện có với thay đổi nhỏ nhất; ledger/cache/output riêng, portable manifest/auditor không cần key/cache/network. Reserve trước mỗi POST, không retry POST khi phí/kết quả chưa rõ, reconcile closing exact; giữ shadow-balance guard đã test. Chỉ resume file có source/config/hash/decode hợp lệ.
- Bảo toàn toàn bộ212MP3 hiện có và cue/data nguồn; output thư mục riêng. Chỉ đổi active static requires của100track sau audit đủ;56trackElevenLabs collection mới giữ nguyên. Không đổi UI/backend/ASR/matcher/DB/schema/nội dung.
- Không merge/push/publish/store hoặc ghi workspace chính. W3 commit cục bộ phần sở hữu; W1 review rồi cherry-pick từng commit vào post8-integration. Không đụng WIP ngoài scope.

## Ownership và nghiệm thu

W1 sở hữu spec/review/MEMORY. W3 Codex gpt-6-luna/xhigh sở hữu tools/voice renderer/tests/report, audio/manifests/catalogues và voice tests/provenance liên quan. Gửi blocking ask cho W1 kèm dryrun/diff/tests trước paid call; không tạo cửa xin lại người dùng. W1 kiểm độc lập ngân sách, hashes, portable audit và test app/type/lint, bundle/assetHTTP nếu dịch vụ sẵn.

Đủ100file decode/hash/source/locale/node/revision, chi phí header khớp accountdelta, catalogue production tổng156activeElevenLabs; byte comparison toàn bộ212MP3+cues cũ. Human listening/native/iPhone/GPS/QR thật vẫn pending cho đến có bằng chứng.

## Việc cần anh quyết / việc anh tự làm

- Cần quyết: chưa có quyết định chặn nếu đủ ngân sách cũ. Nếu không đủ, báo số thiếu và lựa chọn cụ thể trước khi chi vượt trần.
- Cần tự làm `[ngoài plan]`: nghe thử giọng trên điện thoại sau tích hợp, vì batch đổi giọng thuộc scope hậu core TECH_DEMO_PLAN đã giao; chưa nghe thì chưa có nghiệm thu phát âm/cảm nhận.
