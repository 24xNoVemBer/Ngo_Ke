# Ngõ Kể — ứng dụng mobile

Ứng dụng Expo + React Native cho Android và iOS. Dữ liệu điểm, tọa độ và QR hiện là mô phỏng; **“Bức thư cuối ngõ”** là câu chuyện hư cấu, không phải tư liệu lịch sử.

## Chạy giao diện

```powershell
cd mobile
npm ci
npm start -- --go
```

Quét mã Metro bằng Expo Go trên thiết bị cùng mạng với máy phát triển. Lệnh trên chạy giao diện; để thử nhận dạng giọng nói, cần khởi động gateway theo mục dưới đây.

## Chia sẻ bản mới qua Expo Go — 23/10/2026

- [iOS trên Expo.dev](https://expo.dev/accounts/valentino241s-team/projects/ngo-ke-demo/updates/1f8e5893-14fa-4061-9984-5c23648d186f) · [Mở trong Expo Go](exp://u.expo.dev/update/01a167b3-4aa1-7499-a4d9-c46da33e2c0a)
- [Android trên Expo.dev](https://expo.dev/accounts/valentino241s-team/projects/ngo-ke-demo/updates/c5374c8d-0785-4157-bbe0-853ff6143148) · [Mở trong Expo Go](exp://u.expo.dev/update/01a167b3-4aa1-702a-8987-724c5c68b295)

Hai update dùng source `4af64c4`, gồm 17 node stories VI/EN và 34 MP3 mới. Không cần cùng Wi-Fi với máy phát triển.

- [Tải APK Android preview](https://expo.dev/artifacts/eas/rJoo7PPcw2U1Th3hHzi_Qfb0aSuwJbKwKwtuAvLHWxo.apk) · [trang build EAS](https://expo.dev/accounts/valentino241s-team/projects/ngo-ke-demo/builds/afe6f352-3be5-4a0d-856f-381d1d4c8923). APK 204.312.512 byte, SHA-256 `01444cc0b444d2e9bd7db8c67041d7c8c83ad3e623648fda6fe4a0311171ad8b`; link EAS build nội bộ có hạn đến 06/11/2026. Channel `preview` trỏ tới nhánh update `ios-preview`.

Đây **không phải link công khai**. Project `ngo-ke-demo` đã được chuyển từ `valentino241` sang tổ chức `valentino241s-team` ngày 15/10/2026. Thành viên cần đăng nhập Expo Go bằng tài khoản thuộc tổ chức; quyền Viewer đủ để xem project qua Expo Go ([thông báo Expo](https://expo.dev/changelog/expo-go-loading-changes-may-2026), [loại tài khoản và quyền](https://docs.expo.dev/accounts/account-types/)). Không chia sẻ thông tin đăng nhập cá nhân. Biến môi trường cấp project đi theo project; biến và secret cấp account không đi theo, nên chỉ cần tạo lại trong team nếu cấu hình thực sự dùng chúng. Liên kết GitHub EAS chưa được kết nối; Git remote cục bộ không bị ảnh hưởng.

Cài Expo Go rồi mở link chỉ có tác dụng khi tài khoản có quyền truy cập project. Đây là JavaScript/asset preview chạy bên trong Expo Go, không phải IPA/TestFlight. Bản chia sẻ không nhúng gateway LAN: màn hình, dữ liệu mô phỏng và audio đóng gói dùng được, còn nhận dạng STT cần một gateway có thể truy cập từ thiết bị. Muốn phân phối cho người dùng iPhone ngoài tổ chức, cần bản iOS phân phối riêng như TestFlight. Để cập nhật preview, chạy từ `mobile/`:

```powershell
$env:CI = '1'
$env:EXPO_NO_DOTENV = '1'
npx eas-cli@latest update --branch ios-preview --platform all --environment preview --clear-cache --message "Mô tả thay đổi"
```

Giữ `EXPO_NO_DOTENV=1` khi publish để không đưa URL gateway riêng trong `.env.local` vào bundle.

## Preview Voice trong mạng phát triển

Voice dùng recorder/player native và gateway STT chạy riêng bằng Node.js 24. Làm theo [hướng dẫn cài model và tạo audio](../tools/voice/README.md) trước lần chạy đầu.

Mở hai terminal:

```powershell
# Terminal 1 — tại thư mục gốc repo
$env:NGOKE_VOICE_HOST = '<DEV_LAN_IP>'
$env:NGOKE_VOICE_PORT = '8788'
$env:NGOKE_VOICE_ASR_PROFILE = 'large-v3-cuda'
node tools/voice/gateway/server.mjs
```

```powershell
# Terminal 2 — tại thư mục mobile, sau khi thêm/cập nhật đúng dòng này trong .env.local
# EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL=http://<DEV_LAN_IP>:8788
npm start -- --lan --port 8081 --go --max-workers 2
```

Thay `<DEV_LAN_IP>` bằng địa chỉ LAN hiện tại của máy chạy gateway, giữ các biến khác đang có trong `.env.local`. File này bị Git bỏ qua. Lệnh giữ profile GPU đã xác minh trên máy dev RTX; trên máy không có runtime CUDA/cuDNN pinned, đổi `NGOKE_VOICE_ASR_PROFILE` thành `small-cpu`. Mỗi khi đổi URL, khởi động lại Metro để bundle nhận cấu hình mới. Gateway preview dùng HTTP, không xác thực và không phù hợp để mở ra Internet hoặc Wi‑Fi công cộng. Trên máy dev hiện tại, Windows đang đánh dấu Wi‑Fi là `Public` nên Metro và gateway LAN đang dừng; chỉ khởi động lại khi dùng Wi‑Fi riêng tin cậy. Xem [VOICE_HANDOFF.md](../docs/VOICE_HANDOFF.md) để biết cách mở APK/preview, kiểm tra gateway và các giới hạn.

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

## Trạng thái Voice mới nhất — revision 8b318b — 15/10/2026

- `data/demo.json`, voice catalogue và manifest cùng revision `8b318b4e9955e3b7affe72cb21ea08cf8123a616eeab2eb1420ab105c7b65e6b`. Manifest có 34 audio; hash file manifest `34925f5d005fa7fb684c4f8fac19992865b581c6eeaa6bde0e9183431c9be05a`.
- Test mobile 171/171, typecheck, lint, Expo dependency check, catalogue validator 34/34, gateway smoke và iOS Expo export đều đạt. Validator đo 7 phút / 5,04 MB; WER tổng hợp cao nhất là 23,1% ở `qa-flowers-answer`. Nghe QC bằng người thật vẫn pending.
- Lượt STT tổng hợp mới nhất qua helper app → gateway `large-v3-cuda` → matcher exact: 5/8 câu khớp chính xác, 0 câu trả sai, 3 câu chưa khớp. Câu mơ hồ vẫn hiện unknown; không bật fuzzy matching. Kết quả cached 21/21 chỉ kiểm matcher trên transcript đã lưu, không phải độ chính xác STT mới.
- Bản Android API 37 `com.valentino241.ngokedemo`: 121.249.588 byte, SHA-256 `2f15c3c0992434a42b13cb4b09c363826542ddfa215eb8f3e9d5db03e22a1e0d`; hash installed APK trùng. Bản này có revision hiện tại và đủ 34 MP3 đúng hash nguồn. Native typed Q&A/follow-up, player/text state và stress test thu/Hủy 20 chu kỳ được kiểm trên AVD: [bằng chứng Android hiện tại](../agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/README.md). AVD không có tín hiệu âm thanh hữu dụng.
- iOS Expo Go preview: EAS Update runtime `exposdk:57.0.0`, group `f102185d-c42c-4efc-9101-452655b5f2f3`. Link chia sẻ nằm ở đầu README. Đây không phải bản cài độc lập; gateway STT không được đưa vào bundle công khai.
- Còn mở: nghe duyệt 34 clip; kiểm giọng nói sáu chương trên iPhone bundle mới; đường loa/tai nghe/cuộc gọi/chạy nền trên thiết bị thật; TalkBack/VoiceOver và đo hiệu năng thiết bị. Đây là preview LAN, không phải IPA hay public release.

## Snapshot kiểm chứng trước revision 8b318b — 15/10/2026

- Lượt kiểm hiện tại: `npm test` 168/168, typecheck, lint và `npx expo install --check` đạt; gateway smoke test đạt trên clip TTS tổng hợp local, gồm abort/retry, quota, định dạng, thời lượng và im lặng. Không dùng audio riêng tư.
- Preview local/LAN đã xác minh: sau khi Metro `:8081` bị treo ở iOS launch asset, chỉ Metro được restart (không xóa transform cache; gateway tiếp tục chạy). Manifest và launch asset hiện HTTP 200; bundle 5.529.995 byte, request đầu 9,5 giây và request ấm 0,51 giây, có URL gateway và mã phục hồi quyền mic, không còn thông báo kết nối cũ. Gateway trên Node 24.14.1/faster-whisper 1.2.1 báo ready. Dùng địa chỉ LAN hiện tại của máy dev và cùng Wi‑Fi; iPhone chưa reload theo quyết định trước đó.
- APK Android SDK 57 trên AVD khớp file local: 121.247.816 byte, SHA-256 `B11555198EBF7CDCD78A8A241E1FFEF4EF5B35B5BB4A5701331055DF46B66083`. Chương 1 hiển thị Q&A đúng; mở lời đáp bằng chữ trong lúc player chạy không làm dừng chữ hoặc reset tiến trình. Ảnh và giới hạn: [`android37-native-sdk57-2026-10-15`](../agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/README.md). AVD không có audio, nên đây không chứng minh âm thanh nghe được hay mic/STT.
- Bản release sau chỉnh AlleySelect (trước Plan retest): 121.247.928 byte, SHA-256 `E7D5BD8D8D0B34A23F77BA97CA20A5A0D6A42D7D175FF50858D8C9874899F0F7`. Trên AVD, tìm/xóa từ khóa hoạt động; chip lọc có trạng thái đã chọn và vùng bấm cao tối thiểu 48 dp. Chi tiết: cùng [bộ bằng chứng native](../agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/README.md).
- APK release mới nhất sau chỉnh Plan: 121.247.924 byte, SHA-256 `EEC6430CC94BC70CAD01B5A58C954DA4B1333ECC1F49FFDB1BE8BCF4C3D9E1CF`. APK có đủ 34 MP3 với hash khớp nguồn. Plan control nhập tay 48 dp; keyboard và nút áp dụng còn nhìn thấy; nhập Ẩm thực + 30 phút trả hai gợi ý đúng và mở đúng “Bếp đầu hè”. GPS/QR screen chỉ bắt đầu sau nút riêng. AVD không audio; voice action thật và phần cứng vẫn pending. Xem [bộ bằng chứng native](../agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/README.md).
- Reduce Motion Android được kiểm trên APK đang chạy bằng `transition_animation_scale=0`: Home → “Chọn Con Ngõ” đã hiện đủ trong cửa sổ chụp 80 ms; các scale hệ thống đã khôi phục về `1`. Bằng chứng ở cùng thư mục; đây chưa phải kiểm TalkBack/VoiceOver.

- `npm test` 168/168, typecheck, lint, Expo dependency check và `git diff --check` đạt; `node tools/voice/gateway/smoke_test.mjs` pass trên clip TTS tổng hợp local. Regression kiểm Gửi trùng, Hủy khi dừng/nhận dạng và đổi scope trong lúc request chờ; dependency native/network là test doubles. Các JS exports không phải IPA/APK.
- Người dùng xác nhận lượt voice thứ hai liên tiếp trên iPhone có meter, transcript, câu trả lời đúng và audio nghe được; đây là happy path do người dùng báo trên Expo Go `:8089`, không có trace độc lập. Fresh iOS/Android JS exports (1.073/1.068 modules) gồm đủ 34 MP3 mỗi nền tảng, hash set khớp source và gateway URL được nhúng. Metro `:8081/status`, manifest iOS và launch bundle hiện trả HTTP 200; Gateway `/health` trả HTTP 200, Node 24.14.1/faster-whisper 1.2.1. Người dùng để sau reload địa chỉ Expo Go LAN hiện tại.
- Validator audio chạy bằng `tools/voice/.venv`: 34/34 clip đạt hash/nội dung/codec/duration/level; manifest SHA-256 `90747665D049CC3B4AF018672EF0935805F324236986D8F2047DC79B440113E9`. Nghe duyệt bằng người thật vẫn pending.
- APK permission-recovery trên Android (121,247,352 byte, SHA-256 `ED49FF5702BE20002184876F20FB34B828DF7BEFEA1F22A48FCE2F7944DC80E2`) đã kiểm denial → Settings → cấp lại → thu/Hủy trên AVD API 37; bundle có gateway URL và đủ 34 MP3 hash-match nguồn. AVD `-no-audio`, không chứng minh tiếng, meter có tín hiệu hay STT.
- APK QA UI/player trước đó (121,247,808 byte, SHA-256 `D6BB16DCE259002D38D112DACA28E9DD91BF5D0681C005AEC9BB83025E8AB50D`) đã kiểm chương 6 `qa-letter`; ảnh ở `agent_docs/evidence/voice/android37-native-release-qa6-answer-text-*.png`. Đây là bằng chứng của APK cũ, AVD `-no-audio`.
- Recheck native UI trên cùng APK đã chạm câu hỏi gợi ý ở cả sáu chương: nguồn câu trả lời đúng chương, player Ready, không autoplay và chữ đóng mặc định. Ảnh/XML: [`android37-six-chapter-ui-2026-10-14`](../agent_docs/evidence/voice/android37-six-chapter-ui-2026-10-14/README.md). AVD không có audio; STT/mic E2E trên iPhone và QC nghe vẫn pending.
- Đã mở/thu gọn nguyên văn đáp án trên cả sáu chương; nội dung khớp `data/demo.json`, biến mất khỏi UI tree sau khi thu gọn, player không đổi khỏi Ready. Ảnh/XML: [`android37-six-chapter-reader-2026-10-14`](../agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/README.md). Đây vẫn là test UI AVD `-no-audio`.

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

## Font lớn trên Android — 14/10/2026

Đã kiểm APK release trên AVD API 37 ở font scale 1.5 và 2.0. Ở 2.0, sau khi cuộn, các chip hỏi tiếp vẫn nằm trọn trên dock; đáp án tiếp tục đóng mặc định. Ảnh native và cây UI: [bằng chứng kiểm font lớn](../agent_docs/evidence/voice/android37-font-scale-2026-10-14/README.md). Đây chưa phải kiểm TalkBack/iPhone Dynamic Type hoặc âm thanh trên thiết bị thật.

## Q&A alias snapshot trước revision 8b318b — 15/10/2026

Demo dataset revision: `5a82b1d4fa223b2170fd9fa2c761a01479b4e3e159a81a6de72f65566a8d2568`. Four recorded large-v3 transcript variants now resolve as explicit aliases in their owning questions; `qa-home` was already covered. The bounded alias limit is six. Replaying the cached synthetic transcript sets against the current exact matcher returns 21/21 expected IDs for both small and large-v3, with zero wrong/unknown. This is matcher evidence on saved synthetic outputs, not a fresh ASR run or human-speech accuracy.

Latest tests: `npm test` 170/170; typecheck, lint, Expo dependency check and gateway synthetic failure-path smoke pass. The audio catalogue remains 34/34 valid without regenerated MP3s; current manifest file SHA-256 is `e59696011be1501097b08f11091a903f8b9a88d30d2914fcc255d1c28db774ba`. Human listening QC remains pending.

Current Android release APK: 121,249,288 bytes, SHA-256 `A44C99FF04125D5C24DD45ADFEA8C74EB8675C53EA00B4C2B45CEFEF95538BBC`; installed base hash matched. Current iOS HBC export: `index-0462bc7bf16834cfd89e7154fb994480.hbc`, SHA-256 `35D9DBA66BAC6ECD1D429DE99CC75019524740685C345943036B7D8AA0E07108`. Metro `:8081` serves the new revision and alias over LAN. The iPhone has not reloaded this URL; previous user-reported two-turn success was on `:8089`.

Native typed-input evidence for the new chapter-4 alias is in [`android37-native-release-asr-alias-2026-10-15`](../agent_docs/evidence/voice/android37-native-release-asr-alias-2026-10-15/README.md). The AVD has no usable audio, so this does not prove mic/STT or audible playback. Physical iPhone six-chapter speech, human audio QC, real-device audio routes, accessibility and performance remain pending.

## Previous Voice build — 15/10/2026

Demo dataset revision: `1e49f3f7c5443091fcccf1b0ed39d3944f5bd79c5869f48640595b6958df25bf`. Chín transcript small-model và hai biến thể large-v3 đã được thêm thành exact alias chỉ trong câu/chương tương ứng. Benchmark synthetic qua helper app → gateway large-v3 GPU → matcher trả 21/21 ID sau alias, p50/p95 570/634 ms; large-v3 ban đầu nhận dạng canonical 19/21. Đây không phải độ chính xác trên lời nói người thật.

Gateway LAN `:8788` hiện chạy profile `large-v3-cuda` (faster-whisper 1.2.1, pinned large-v3, CUDA float16); `small-cpu` vẫn là profile mặc định cho máy không có runtime GPU. Runtime CUDA/cuDNN hash-pinned nằm trong cache local và không được đưa vào mobile app.

APK Android API 37 mới nhất: 121,248,752 byte, SHA-256 `17BF0EF342B0E41E4A90972101B260BD1E75D9654F80FDC5BFA469464E6EF3D3`. APK chứa đủ 34 MP3; đối chiếu SHA-256 theo multiset khớp 34/34 clip nguồn. Trên AVD, chọn “Đây là điểm nào?” hiện đúng câu trả lời; mở lời kể bằng chữ khi player đang chạy vẫn giữ trạng thái `00:02/00:10`, Back quay lại Home. Ảnh native: [latest-player-text-open.png](../agent_docs/evidence/voice/android37-native-release-current-2026-10-15/latest-player-text-open.png), [latest-back-home.png](../agent_docs/evidence/voice/android37-native-release-current-2026-10-15/latest-back-home.png). Gateway `:8788` ready và Metro `:8081/status` đang chạy; việc người dùng reload iPhone và nói thử bản hiện tại còn chờ. AVD không có audio; nghe QC 34 clip, iPhone/Android audio thật, trợ năng bằng screen reader và hiệu năng phần cứng vẫn pending.

Trên chính APK này, thu → Hủy → thu lần hai → Hủy đều trở về đúng trạng thái; cả hai lượt hiển thị `Đang thu · 00:01`, AppOps không còn ghi âm sau lượt cuối. Ảnh: [latest-recorder-first.png](../agent_docs/evidence/voice/android37-native-release-current-2026-10-15/latest-recorder-first.png), [latest-recorder-second.png](../agent_docs/evidence/voice/android37-native-release-current-2026-10-15/latest-recorder-second.png), [latest-recorder-after-cancel.png](../agent_docs/evidence/voice/android37-native-release-current-2026-10-15/latest-recorder-after-cancel.png). AVD không có âm thanh đầu vào nên chưa kiểm được meter nhúc nhích hay nhận dạng giọng.

Stress 20 vòng thu/Hủy trên cùng APK: AppOps vào trạng thái ghi âm 20/20 lần và dừng 20/20 lần; PID giữ nguyên. PSS một lượt đo tăng 6.004 KB (188.050 → 194.054 KB), chưa đủ để kết luận leak hoặc hiệu năng. Ảnh trạng thái idle cuối: [latest-recorder-stress-idle.png](../agent_docs/evidence/voice/android37-native-release-current-2026-10-15/latest-recorder-stress-idle.png).
