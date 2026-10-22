# Bốn ngõ — nghiệm thu tích hợp 22/10/2026

Trạng thái: kiểm tra source tích hợp đạt, đang chốt Git. Codex điều phối/dữ liệu/kiểm độc lập; Antigravity làm FE. Không gọi Claude trong đợt này.

## Phạm vi đã thực hiện

- Chụp nguồn Google Doc vào `docs/content/FOUR_ALLEYS_SOURCE_20261022.md`. Phần 1 thành `alleyStory`, phần 2 thành `intro.text`; phần 3+4 thành `guide` cho Sổ tay. Giữ lời rào đón về giai thoại, trải nghiệm món ăn, giá cũ và địa chỉ chưa chắc chắn. Không hiển thị markers comment hoặc đọc nguồn biên soạn thành lời kể.
- Trung Yên cập nhật năm điểm dừng: Phở Sướng, Đình Trung Yên, Bún cá Sâm Cây Si, Bún ngan Nhàn, Phở gà Hương Trà. Khu vực chợ Hàng Bè/Gia Ngư vẫn nằm trong hướng dẫn khám phá. Bỏ Phở Vui/Miến trộn mực. Giữ hình dáng OSM cũ 146 m, không coi mô tả khoảng 200 m trong doc là kết quả đo mới.
- Thêm Tạm Thương, Cấm Chỉ, Phất Lộc chỉ tiếng Việt; không tạo dataset EN hoặc tự dịch. Trung Yên EN chỉ đồng bộ tối thiểu điểm dừng/intro, không có story/guide EN. Các ngõ chỉ có VI được ẩn khỏi danh sách EN.
- Home có nút “Câu chuyện ngõ” mở thẻ đọc cuộn; Sổ tay có “Khám phá thêm” với quán, điểm ghé, hành trình và lưu ý. Dataset cũ thiếu trường mới không hiện khung trống.
- Chỉ bốn reservation intro VI và catalogue `tracks: {}`. Không sinh audio, không đọc khóa, không gọi API trả phí; không đổi byte audio của baseline `cf2168c`. Hướng dẫn sinh sau nằm trong `docs/VOICE_GUIDE_FOUR_ALLEYS_20261022.md`.
- Task 8 là tùy chọn và không triển khai: ba ngõ mới chưa có polyline/tọa độ đã kiểm. Ước lượng 10 phút/điểm là cấu hình demo, không phải thời gian đo thực địa.

## Kiểm chứng

- Checkpoint dữ liệu: 9 test mới về schema, chữ nguồn, VI/EN, dữ liệu bất định và slot voice đạt. Backend CLI đã migrate/import cặp Trung Yên vào SQLite tạm, import thay thế rồi đọc backup xác nhận story/guide được lưu; không ghi DB chính. Ba ngõ VI-only dùng bundle, chưa nhập live qua CLI yêu cầu cặp VI/EN.
- Checkpoint FE đầu: 357 test có 1 lỗi revision Trung Yên sau khi Codex sửa tag Phở gà thành ẩm thực; typecheck/lint sạch. Anti đang xử lý revision và luồng đổi EN tại App/Home. Đây chưa phải kết quả nghiệm thu cuối.
- Codex chạy độc lập `npm test` đạt exit 0, rồi xác minh rõ bằng `node --test --test-reporter=tap tests/*.test.mjs`: **358/358 đạt, 0 fail, 0 skip, 0 cancelled**. Typecheck và lint đều exit 0 sau khi Anti sửa lỗi assignment trong test mới. Test App thực gọi setter locale/collection và kiểm source lỗi khi EN không được hỗ trợ, phục hồi VI, ngõ có EN hoạt động và lựa chọn VI-only khi locale EN được khôi phục. Home unavailable được kiểm source; không coi test này là phép đo hiển thị trên điện thoại.
- Export native riêng iOS/Android đều exit 0 bằng Expo CLI đã cài, `EXPO_NO_DOTENV=1`, `--no-bytecode --max-workers 2`. Output tạm `C:/Users/LEGION/AppData/Local/Temp/ngoke-four-alleys-final-20261022-1436/{ios,android}`. Metadata chỉ có platform tương ứng; cả hai bundle chứa ba collection mới, không export web. iOS 1.238 module, Android 1.233 module. SHA-256 tập source/data/assets/config trước, sau export và sau bàn giao cuối giống nhau: `67f5da43c1981b166a6f5fcfccffadf814bd966ac0b200ae49a58b1553ed1b0b`. Export JS không phải IPA/APK hoặc kiểm trên thiết bị.

## Giới hạn và việc người dùng tự kiểm

- Cần người dùng quyết: không còn quyết định chặn D1–D6.
- Cần người dùng tự làm trong plan: kiểm trên điện thoại Home → đọc truyện → Sổ tay → đổi VI/EN, phông chữ 2.0, thao tác đóng/cuộn và trình đọc màn hình. Test cấu trúc không chứng minh bố cục không bị cắt trên thiết bị.
- Cần người dùng tự làm trong plan: chọn ảnh thật cho Tạm Thương/Cấm Chỉ và kiểm địa chỉ, giờ mở cửa, vị trí điểm dừng. Hiện dùng ảnh thay thế và ghi giờ chưa xác minh khi nguồn thiếu. Không coi dữ liệu demo là dẫn đường thực địa.
- GPS fix, QR thật, nghe audio và chế độ im lặng vẫn chưa có bằng chứng thiết bị của đợt này. Không có yêu cầu sinh voice mới để người dùng phải cung cấp khóa lúc này.
- Metro 8082 không có listener khi kiểm đọc; không khởi động lại server. Export native sẽ được kiểm riêng, không thay thế Expo Go trên thiết bị.

## Git và điều phối

- Baseline nhận việc `cf2168c`. WIP Landing/cleanup cũ đã chốt thành `a93a002` trước FE, không tạo audio mới.
- Run `run_bab01db56ade`. Anti FE đầu `ctx_8d68f2eff8d1` và follow-up `ctx_be1e0b73f803` đã hoàn thành, release và capture archive; ACK `delivery_923020832c15`. Lần reuse terminal bị preflight `agent_unconfigured`, đã kiểm request/worker-list trước khi mở follow-up, không có editor trùng. Không còn worker triển khai của đợt này.
- Theo yêu cầu mới “xong all thì push lên github”, sau kiểm tra Codex sẽ commit/push source tới `ngoke-public` = `https://github.com/24xNoVemBer/Ngo_Ke.git`, nhánh `valentino/logic-fix-mobile-20261020`. Không push nhầm remote `origin`.
