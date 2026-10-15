# Voice V4 — Voice gateway và STT

## Current gateway smoke — revision 8b318b — 15/10/2026

- Gateway `/health` is ready on Node 24.14.1, faster-whisper 1.2.1 and pinned `large-v3-cuda` / CUDA float16.
- The current voice dataset revision is `8b318b4e9955e3b7affe72cb21ea08cf8123a616eeab2eb1420ab105c7b65e6b`.
- Ran `node tools/voice/gateway/smoke_test.mjs` against a local 19.15-second synthetic WAV and a tracked 23,886-byte AAC/M4A fixture uploaded as `audio/mp4`. Both returned non-empty transcripts with matching turn metadata; abort/retry, quota, invalid-format, duration and silence guards passed. Fixture SHA-256: `67EB5DF56D2D856663C0E6971734EFA9B0CE176FD0FCB5341170945E854BAB23`. No personal audio was used.
- The fresh 8-question speech run on the current revision returned 5/8 exact matches, 0 wrong and 3 unknown. This gateway smoke does not upgrade that speech result or establish iPhone end-to-end accuracy; the user deferred reloading current `:8081`.

## Client cancel/double-send race regression — 14/10/2026

- A new mobile hook test holds the native stop promise, calls Gửi again, then holds ASR while trying Gửi once more. The same recorded turn invokes one stop and one transcription request only; cancel during native stop prevents upload.
- Cancel during ASR or a node/revision scope change aborts the active request; resolving its mocked response afterward does not deliver a transcript to the old or new point. `npm test` 168/168, typecheck/lint/dependency check pass. Gateway smoke separately passes against the live local worker with synthetic audio; the hook regression does not claim phone upload/audio proof.

## Current host and warm-latency recheck — 14/10/2026

- Metro `:8081` manifest and iOS bundle returned HTTP 200. The latest 6,062,091-character bundle contains the configured LAN gateway, recorder and shared negation helper, and no stale “Chưa kết nối máy nhận giọng nói” UI copy. Gateway health at `192.168.100.36:8788` reports ready with Node 24.14.1 and the pinned faster-whisper-small worker.
- Five sequential warm requests with the same local synthetic 19.15-second VieNeu clip all returned HTTP 200, non-empty transcript and exact `turnId/locale/mode/nodeId/datasetRevision` echo. Warm LAN request-to-transcript latency: p50 7.536 seconds; nearest-rank p95 7.727 seconds (7,536/7,727 ms).
- This measurement excludes phone capture, app upload, matcher, response playback and device audio routes. The iPhone has not reloaded the current `:8081` bundle; this is not mobile E2E or hardware p95 evidence.
- After the Plan negation fix, iOS/Android exports contain the new intent code and all 34 catalogue MP3s byte-for-byte; `npm test` is 166/166 with typecheck/lint passing. The current Android release APK (121,246,512 bytes, SHA-256 `BA973B5F23550367191A3A5ED004FD411CEF6D90ABB5C0FB5A132AA4897221D2`) is installed on API 37 AVD; this confirms typed Plan behavior only, not mic/STT.

## iPhone happy path sau reload — 14/10/2026

- Sau khi reload Expo Go `exp://192.168.100.36:8089`, người dùng xác nhận lượt voice thứ hai liên tiếp có meter chạy, hiện transcript, câu trả lời đúng và nghe được tiếng. Đây là báo cáo thành công của một request voice follow-up; chưa có gateway log/audio để xác minh độc lập.
- Giữ lại giới hạn: Expo Go là preview; iOS native build/IPA, retry/quota/network failures và cancel khi request đang chạy chưa được kiểm trên iPhone.

## Smoke gateway contract rerun — 14/10/2026

- `node tools/voice/gateway/smoke_test.mjs` pass: local synthetic clip 19.15 giây, transcript response, invalid-format, duration và silence guards.
- Sau đó POST trực tiếp một clip mở đầu tổng hợp cục bộ lên gateway LAN đang chạy `192.168.100.36:8788`; HTTP 200, `locale=vi`, `nodeId=demo-02`, duration 19.15s, transcript không rỗng và `turnId` được echo đúng. Không dùng audio cá nhân. Đây là smoke của endpoint live hiện tại, không phải upload từ app/mic.
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

## Cập nhật gateway và lượt iPhone — 14/10/2026

- Người dùng xác nhận lượt voice thứ hai trên iPhone có meter, transcript, đúng câu trả lời và audio nghe được trên preview `:8089`; đây là báo cáo happy path STT→Q&A→playback, chưa có request/server trace để đối chiếu cấu hình bundle.
- Preview mới `:8081` đã restart; manifest và iOS launch bundle HTTP 200, có URL gateway LAN. Gateway `/health` HTTP 200, faster-whisper 1.2.1. Người dùng để sau reload Expo Go `:8081`, do đó chưa chứng minh iPhone dùng bundle/cấu hình mới này.
- Re-run `node tools/voice/gateway/smoke_test.mjs` pass trên Node 24.14.1/faster-whisper 1.2.1 bằng clip TTS tổng hợp local; transcript/context, abort/retry, quota và validation audio guards đạt. Không dùng audio cá nhân; smoke test không thay cho phone/network latency.
- GV4 còn mở cho đo latency từ điện thoại, lỗi kết nối/quota/timeout/retry thật trên thiết bị, xác minh request trace và triển khai public HTTPS/auth trước bất kỳ public exposure nào.

## Explicit large-v3 CUDA profile and latest local integration — 15/10/2026

- Added a Windows-only, opt-in `large-v3-cuda` profile using faster-whisper 1.2.1, the pinned large-v3 revision, CUDA float16, and hash-pinned local cuBLAS/cuDNN runtime wheels. The live LAN gateway on `:8788` now uses this profile. `small-cpu` remains the default; an unavailable requested CUDA runtime fails startup, with no silent downgrade.
- Actual app request helpers → gateway → production matcher checks passed for 21/21 expected Q&A after adding two exact aliases for observed synthetic transcript forms; 0 unknown/wrong/transport errors, host p50/p95 570/634 ms. A locally generated M4A reached the expected `qa-02` in 520 ms. Abort/retry, quota and audio-format/duration/silence guards passed gateway smoke tests.
- These checks used synthetic local audio and do not cover phone Wi-Fi latency, user speech, gateway auth/HTTPS before public exposure, or retention behavior under a deployed service. iPhone reload remains deferred; GV4 stays open for device/network checks and public-exposure requirements.

## Rejected-audio log privacy regression — 2026-10-14

- Removed the log of declared MIME, byte count and audio header on unsupported formats; the 415 error contract is unchanged. Smoke regression checks the response and ensures filename/MIME/header do not appear in captured logs.
- Restarted the current LAN gateway and sent only a synthetic invalid multipart payload: health ready, response 415 `UNSUPPORTED_AUDIO_FORMAT`, and live process log limited to status/code/elapsed time.
- Smoke, 167 mobile tests, typecheck, lint, Expo dependency check, Node syntax and whitespace checks pass. Phone verification on the current `:8081` bundle remains deferred; no personal audio was used.
