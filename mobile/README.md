# Ngõ Kể — ứng dụng mobile

Ứng dụng Expo + React Native cho Android và iOS. Dữ liệu điểm, tọa độ và QR hiện là mô phỏng; **“Bức thư cuối ngõ”** là câu chuyện hư cấu, không phải tư liệu lịch sử.

## Chạy giao diện

```powershell
cd mobile
npm ci
npm start -- --go
```

Quét mã Metro bằng Expo Go trên thiết bị cùng mạng với máy phát triển. Lệnh trên chạy giao diện; để thử nhận dạng giọng nói, cần khởi động gateway theo mục dưới đây.

## Preview Voice trong mạng phát triển

Voice dùng recorder/player native và gateway STT chạy riêng bằng Node.js 24. Làm theo [hướng dẫn cài model và tạo audio](../tools/voice/README.md) trước lần chạy đầu.

Mở hai terminal:

```powershell
# Terminal 1 — tại thư mục gốc repo
node tools/voice/gateway/server.mjs
```

```powershell
# Terminal 2 — tại thư mục mobile, sau khi thêm/cập nhật đúng dòng này trong .env.local
# EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL=http://<DEV_LAN_IP>:8788
npm start -- --lan --port 8089 --go --max-workers 2
```

Thay `<DEV_LAN_IP>` bằng địa chỉ LAN hiện tại của máy chạy gateway, giữ các biến khác đang có trong `.env.local`. File này bị Git bỏ qua. Mỗi khi đổi URL, khởi động lại Metro để bundle nhận cấu hình mới. Điện thoại và máy phát triển phải ở cùng Wi‑Fi riêng tin cậy. Gateway preview dùng HTTP, không xác thực và không phù hợp để mở ra Internet hoặc Wi‑Fi công cộng. Xem [VOICE_HANDOFF.md](../docs/VOICE_HANDOFF.md) để biết cách mở APK/preview, kiểm tra gateway và các giới hạn.

Trong app, vào Demo, chọn chương, nhấn mic để thu, rồi nhấn **Gửi**; **Hủy** hoặc Back kết thúc lượt. Chip gợi ý không tự bật tiếng. Gateway và Metro phải đang chạy để thử STT; giao diện, dữ liệu demo và audio đóng gói vẫn có thể xem khi offline.

## Kiểm tra và build

Chạy từ thư mục `mobile/`:

```bash
npm test
npm run typecheck
npm run lint
npm run check:dependencies
```

`npm run build:android` và `npm run build:ios` chỉ xuất JavaScript/Hermes bundle; chúng không tạo APK/IPA hay phát hành ứng dụng. Build native bằng `npm run android` hoặc `npm run ios` trên môi trường tương ứng. iOS native cần macOS và hiện chưa được nghiệm thu.

## Trạng thái kiểm chứng mới nhất — 14/10/2026

- `npm test` 164/164, typecheck, lint, Expo dependency check và `git diff --check` đạt. Các JS exports không phải IPA/APK.
- Người dùng xác nhận lượt voice thứ hai liên tiếp trên iPhone có meter chạy, transcript, câu trả lời đúng và tiếng trả lời nghe được; đây là happy path thực trên build Expo Go đã thử, chưa có trace độc lập. Expo JS exports iOS/Android sau sửa V6 đều đạt, metadata có đủ 34 MP3 mỗi nền tảng. Metro iOS bundle `:8081` qua LAN trả HTTP 200/6.063.168 ký tự, có gateway và playback error handling, không có copy kết nối cũ. Gateway `:8788/health` ready. Người dùng để sau reload `exp://192.168.100.36:8081`; preview mới chưa kiểm trên iPhone.
- Validator audio chạy bằng `tools/voice/.venv`: 34/34 clip đạt hash/nội dung/codec/duration/level; manifest SHA-256 `90747665D049CC3B4AF018672EF0935805F324236986D8F2047DC79B440113E9`. Nghe duyệt bằng người thật vẫn pending.
- Android release APK mới nhất sau V6 đã build và kiểm bundle/Hermes: 121,246,156 byte, SHA-256 `301F0654052A537324A08240F02C1DA223D99EBACCD841A573A20C3375B0EE36`; APK này chưa cài/chạy trên AVD. Bản trước `6D669446...73FBE` đã cài/mở và tới Q&A điểm 01 trên AVD không có audio. Mic start/Hủy và 20/20 vòng stress AppOps thuộc APK cũ hơn `0F43437B...53F9`, không gửi lời nói. Còn six-chapter coverage, failure paths, human audio QC, iOS native, routes/accessibility và performance.

## Trạng thái kiểm chứng trước handoff settle guard — 14/10/2026

Android release APK mới đã cài/mở trên AVD API 37 dưới package `com.valentino241.ngokedemo`. Build 377 tasks thành công; APK 121,244,960 byte, SHA-256 `AC05A7E98F4A42B51021D2FFF554091764766FB5033ADABD901D5AE5BC4D7831`. Native smoke phát lời kể rồi chạm mic hai lần liên tiếp; cả hai lần player dừng, recorder hiện meter thật và Hủy trả dock về idle. Stress test 20 vòng start/cancel xác nhận AppOps thu/dừng, dock idle cuối lượt; PSS dao động 167,959–176,922 KB, chưa phải leak proof. Nhánh từ chối quyền hiển thị lối gõ, sau khi cấp lại quyền có thể Thử lại. Không gửi audio; APK smoke không có gateway URL, nên đây không phải STT/Q&A E2E. Ngày 14/10, bộ test đạt 156/156, typecheck/lint và iOS JS export đều đạt. UI regression phủ Q&A và race callback auto-play; transcript kiểm thử không thay thế STT/mic thật. Trước lần retest mới, người dùng từng báo lượt hai mất meter rồi lỗi; sau đó đã xác nhận lượt hai trên iPhone có meter, transcript, Q&A đúng và audio nghe được. Metro `:8089` từng chạy nhưng host probe chưa đối chiếu được URL gateway; gateway `8788` ready. Export không phải IPA; các luồng iOS, kiểm tra audio/accessibility, nghe duyệt thủ công 34 audio và performance vẫn mở. Xem [VOICE_TEST_REPORT.md](../docs/VOICE_TEST_REPORT.md) để biết kết quả mới nhất.

## Mã nguồn và tài liệu

- `src/screens/`: các màn hình ứng dụng; `src/components/`: thành phần giao diện.
- `src/voice/`: recorder, yêu cầu STT và quản lý vòng đời voice.
- `src/qa/`: chuẩn hóa câu hỏi và khớp Q&A cố định; không sinh câu trả lời bằng LLM.
- `../data/demo.json`: nguồn dữ liệu demo; cấu trúc và quy ước ở [data/README.md](../data/README.md).
- [APP_FLOW.md](../docs/APP_FLOW.md): luồng màn hình.
- [VOICE_PHASE_ROADMAP.md](../docs/VOICE_PHASE_ROADMAP.md): phạm vi và tiêu chí nghiệm thu Voice.
- [VOICE_API_CONTRACT.md](../docs/VOICE_API_CONTRACT.md): API gateway STT.
- [IMAGE_SOURCES.md](../docs/IMAGE_SOURCES.md) và [LICENSES.md](assets/voice/LICENSES.md): ghi công ảnh và license audio.
