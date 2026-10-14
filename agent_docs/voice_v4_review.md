# Voice V4 — Voice gateway và STT

## iPhone happy path sau reload — 14/10/2026

- Sau khi reload Expo Go `exp://192.168.100.36:8089`, người dùng xác nhận lượt voice thứ hai liên tiếp có meter chạy, hiện transcript, câu trả lời đúng và nghe được tiếng. Đây là báo cáo thành công của một request voice follow-up; chưa có gateway log/audio để xác minh độc lập.
- Giữ lại giới hạn: Expo Go là preview; iOS native build/IPA, retry/quota/network failures và cancel khi request đang chạy chưa được kiểm trên iPhone.

## Smoke gateway contract rerun — 14/10/2026

- `node tools/voice/gateway/smoke_test.mjs` pass: local synthetic clip 19.15 giây, transcript response, invalid-format, duration và silence guards.
- Bổ sung regression: smoke đợi 1.5 giây sau khi gửi clip, abort POST và chờ server log `REQUEST_CANCELLED` để xác nhận request đã vào ASR; sau đó gửi lượt mới và kiểm HTTP 200, transcript có nội dung, `turnId` mới đúng. Python inference đã bắt đầu vẫn chạy tới khi hoàn tất và tự dọn file; đây là kiểm tra hủy response/turn isolation, không chứng minh dừng compute tức thời hay client iPhone abort.
- Smoke test gửi request sai content type tới ngưỡng source-IP 12/phút và xác nhận request thứ 13 trả `429 RATE_LIMITED`; không tải thêm audio.
- `/health` trả `ready`; TCP listener được xác nhận chỉ bind private Wi‑Fi `192.168.100.36:8788` (PID 42408). Không gửi audio cá nhân, không public expose.
- Đây là gateway contract proof, không thay cho trace/log độc lập hoặc đo mic-to-answer latency trên thiết bị. Báo cáo iPhone thành công của người dùng đã ghi nhận ở trên; audio và gateway log chưa có để xác minh độc lập, nên GV4 device-round-trip evidence còn thiếu.

## iOS local gateway policy — 14/10/2026

- Config plugin bổ sung `NSAllowsLocalNetworking` và `NSLocalNetworkUsageDescription` chỉ khi app được cấu hình private IPv4 HTTP gateway; không bật `NSAllowsArbitraryLoads`.
- Apple ghi rõ iOS 17+ hạn chế HTTP tới IP nếu chưa khai báo local networking, và app gọi host trong LAN cần giải thích quyền mạng nội bộ. Plugin helper regression đạt; iPhone Expo Go có một happy path do người dùng xác nhận; native iOS/IPA chưa kiểm.

## Revalidation sau sửa codec recorder — 13/10/2026

- Local gateway hiện chạy ở `<DEV_LAN_IP>:8788`, bind riêng giao diện Wi-Fi; `/health` trả HTTP 200 với Node 24.14.1, faster-whisper 1.2.1 và model revision đã ghim. Metro preview chạy ở cổng 8087.
- AVD gửi bản ghi thực từ app sau khi sửa recorder; media probe chấp nhận codec và worker trả HTTP 422 `NO_SPEECH` sau 1.134 giây. App hiển thị hướng dẫn thử lại. Đây là kết quả đúng cho AVD không có lời nói; chưa có transcript mic để kiểm Q&A.
- `node tools/voice/gateway/smoke_test.mjs` pass: clip TTS tổng hợp 19.15 giây trả transcript HTTP 200 và echo context; sai format 415; clip quá ngắn/quá dài và silence nhận đúng guard. Không gửi âm thanh cá nhân.
- Giữ gateway Voice-only, không log audio/transcript, không cloud, không public exposure. Expo Go bundles iOS/Android đều HTTP 200 và nhúng gateway URL `<DEV_LAN_IP>:8788`.

**Gate GV4:** media transport, codec validation, worker và guard đã được kiểm cả bằng app trên AVD lẫn smoke clip tổng hợp. Chất lượng lời nói thật, latency mic-to-transcript trên phone và HTTPS/auth nếu public vẫn pending; không tuyên bố STT E2E hoàn tất.

## Snapshot trước kiểm thử codec recorder — 13/10/2026 (đã supersede)

Gateway hiện bind riêng Wi‑Fi `<DEV_LAN_IP>:8788`, PID 42784; `/health` báo Node 24.14.1/faster-whisper 1.2.1 ready. Clip TTS tổng hợp 19.15s trả HTTP 200 và metadata/context echo đúng; transcript có nhiều lỗi từ. Smoke integration kiểm sai format 415, dưới 0.5s `AUDIO_TOO_SHORT`, silence `NO_SPEECH`, và 21s `AUDIO_TOO_LONG`. Không gửi audio cá nhân. Đây chưa phải upload từ recorder của app, nên GV4 chỉ đạt kiểm endpoint/guard, chưa đạt mic E2E/chất lượng STT.

Thông tin `<DEV_LAN_IP>` và `<DEV_LAN_IP>` trong ghi chú cũ là IP Wi‑Fi trước đó; địa chỉ hiện tại được ghi trong [handoff](../docs/VOICE_HANDOFF.md).

**Ngày:** 13/10/2026
**Trạng thái tại snapshot cũ:** gateway Voice-only chạy trên Wi‑Fi riêng `<DEV_LAN_IP>:8788`; app-to-gateway clip recorder chưa kiểm.
**Gate GV4:** local endpoint/worker đạt; chưa nghiệm thu upload từ recorder native. Public hosting không nằm trong scope.

## Đã làm

- Voice-only Node 24 gateway: `GET /health` và `POST /v1/transcribe`; worker Python 3.11 gọi `faster-whisper-small` tiếng Việt.
- Server kiểm tra multipart, bytes/format thực, duration từ media probe (0.5–20 giây), sample rate/kênh, kích thước, timeout, concurrency/rate limits, shape/locale/context response và dọn file tạm. Log không ghi transcript/audio.
- Credential không cần thiết cho engine self-host local; không có secret trong `EXPO_PUBLIC_*`. Không gửi audio ra dịch vụ cloud, không tự chuyển provider.
- Smoke test nhận clip tổng hợp 19.15 giây; test hard cap từ chối PCM WAV 21 giây với `AUDIO_TOO_LONG`, clip sai format bị từ chối.
- Probe bổ sung gửi `demo-02-caption.mp3` (fictional TTS asset, không phải ghi âm cá nhân), đổi sang WAV PCM 16 kHz mono; server đo duration 3.76 giây, trả HTTP 200 sau 3.83 giây. Transcript khớp câu nguồn, chỉ khác viết hoa tên “An/an”; turnId, locale, mode, nodeId và datasetRevision echo khớp.

## Bằng chứng và giới hạn

- Source/contract: `tools/voice/gateway/server.mjs`, `tools/voice/gateway/stt_worker.py`, `tools/voice/gateway/smoke_test.mjs`, `docs/VOICE_API_CONTRACT.md`.
- Kết quả: Node 24.14.1 / faster-whisper 1.2.1; 19.15s synthetic clip nhận được, 21s PCM clip và invalid format bị từ chối.
- `GET /health` trả ready trên Node 24.14.1, faster-whisper 1.2.1, pinned `Systran/faster-whisper-small` revision.
- Revalidation qua server đang chạy trên `<DEV_LAN_IP>:8788`: clip tổng hợp 18.81 giây được nhận dạng HTTP 200; turnId/locale/mode/nodeId/datasetRevision echo đúng. Clip 21 giây trả `400 AUDIO_TOO_LONG`, sai format trả `415 UNSUPPORTED_AUDIO_FORMAT`. Transcript sinh ra còn lỗi từ; chỉ xác nhận endpoint/contract, chưa được chấp nhận chất lượng STT.
- Preview hiện chỉ bind trên máy dev/LAN tin cậy qua HTTP; chưa bật HTTPS/auth. Không được port-forward hay public expose gateway. Bất kỳ client trong cùng mạng tin cậy cũng có thể gọi endpoint, dù có rate limit.
- Chưa xác minh điện thoại gửi file recorder thật, timeout/cancel xuyên suốt app, request khi mất Wi-Fi, hay latency từ bấm Gửi đến transcript trên thiết bị.

**Còn lại:** thu trace độc lập cho app recorder → gateway → worker, kiểm các nhánh lỗi và đo latency đầu-cuối trên điện thoại. Public host cần auth/HTTPS, retention và review riêng; chưa được cấp phạm vi đó.

## Smoke test lại gateway — 14/10/2026

- `node tools/voice/gateway/smoke_test.mjs` exit 0: Node 24.14.1, faster-whisper 1.2.1; clip TTS tổng hợp 19.15 giây trả transcript và turn context đúng; invalid-format, 21 giây, dưới 0.5 giây và silence bị từ chối đúng guard.
- Snapshot tại thời điểm đó: smoke dùng gateway localhost và audio TTS tổng hợp. Metro Expo Go `:8089` chưa nhúng URL gateway; kiểm tra sau này trên `:8081` đã thấy URL, nhưng bundle mới đó chưa được reload trên iPhone.

## Kiểm tra preview và cấu hình STT — 14/10/2026 (snapshot trước bundle `:8081` mới nhất)

- Gateway tại `192.168.100.36:8788` trả `ready`. Gửi clip WAV TTS tổng hợp 19.15s trực tiếp tới endpoint live trả HTTP 200, transcript có nội dung, context echo khớp. Không dùng audio cá nhân.
- Git-ignored `mobile/.env.local` đã được thêm. Ở snapshot này Metro `:8089` cấp bundle cũ (HTTP 200, 6,062,157 ký tự) nhưng không có URL; lần kiểm tra mới hơn xác nhận bundle iOS trên `:8081` có URL, còn request bundle `:8089` timeout sau 180 giây dù `/status` trả 200. Người dùng báo một lượt thành công trên iPhone qua `:8089`, nhưng chưa reload bundle `:8081`.
- Snapshot tests: `npm test` 159/159, typecheck, lint và Expo dependency check pass. Báo cáo iPhone và kết quả hiện hành nằm ở các mục mới nhất đầu file; independent device trace, failure paths và latency vẫn pending.

## Kết quả voice thật do người dùng báo — 14/10/2026

- Sau reload Expo Go tại `exp://192.168.100.36:8089`, người dùng xác nhận lượt voice thứ hai hiển thị transcript, ghép đúng câu trả lời và nghe được answer. Ghi nhận một lượt STT→Q&A→playback thật trên iPhone theo báo cáo người dùng; không có raw audio/log/request trace để đối chiếu độc lập.
- Mobile suite hiện đạt 161/161; typecheck, lint và dependency check đều đạt. Gateway local vẫn dùng faster-whisper 1.2.1.
- Request lấy manifest Metro từ host timeout trong lần kiểm gần nhất. GV4 còn mở cho trace thiết bị, lỗi mạng/quota/retry, và xác minh preview/config trên lần chạy thực.
