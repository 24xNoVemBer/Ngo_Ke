# Post-Phase-8 T0 — Inventory data, backend và voice (W3)

**Trạng thái:** chỉ đọc source và metadata có sẵn; đây là inventory cùng phương án để W1 xem xét, chưa phải hợp đồng hoặc quyết định triển khai. Baseline worktree `valentino/post8-backend` là `91ddfbd1d7e8a63870dc10dc8f20baca886532e0`; trước khi tạo báo cáo, worktree sạch. Không sửa app, backend, shared data, test hoặc audio; không chạy test/build/server/TTS/STT, không tải model/package, không gửi HTTP ra ngoài và không chạm gateway, Metro hay service đang chạy.

## 1. Quyền và bằng chứng Phase 8

AGENTS và MEMORY hiện hành xác nhận Phase 8 đã đạt trên môi trường sẵn có và mở riêng phạm vi Việt/Anh; W1 chốt inventory/hợp đồng trước khi W2/W3 code. Báo cáo này chỉ thực hiện T0 của W3 theo giao việc; goal Voice V0–V7 vẫn tạm dừng, không tự mở lại. Prompt hậu Phase 8 cho phép đúng những thay đổi voice/data cần cho VI/EN; giữ nguyên 34 clip Việt và mức bằng chứng listening QC do người dùng báo, không nâng thành kết quả nghe kiểm định độc lập. (AGENTS.md:3–16; MEMORY.md:3–9; prompt `E:/Project/Ngo_Ke/ngoke/docs/CLAUDE_POST_PHASE8_STORY_EN_PROMPT.md`:8–18, 36–47, 112–128.)

QA ghi 201/201 app tests, 19/19 backend, 33/33 guard, 15/15 HTTP và 19/19 native; APK release hash `F4FF952226F614F37E6F33BE30375628F38DD1D290021D7C65DAA96204FD2F0E` đã kiểm offline/live/retry, từ chối quyền rồi chọn tay, khôi phục setting. Phase 8 không chạy `tools/voice`. GPS có fix, quét QR thật, thiết bị thật và iPhone vẫn pending; không có bằng chứng nào trong inventory này mở rộng các kết luận đó. (docs/PHASE_8_QA_REPORT.md:20–34, 70–90, 126–132; docs/PHASE_8_ANDROID_BUILD.md:1–18, 42–43.)

## 2. Dataset và quan hệ ngõ–điểm–nội dung

`data/demo.json` là fixture mô phỏng, schema v1, SHA-256 `8b318b4e9955e3b7affe72cb21ea08cf8123a616eeab2eb1420ab105c7b65e6b`. Dữ liệu có 6 node và 21 QA; intro dài 339 ký tự. Sáu node và số câu hỏi theo node:

| Node ID | Tên chương | Story | Caption | QA |
| --- | --- | ---: | ---: | ---: |
| `demo-01` | Cổng ngõ | 397 | 73 | 6 |
| `demo-02` | Hiên đồng hồ | 433 | 63 | 3 |
| `demo-03` | Bếp đầu hè | 468 | 73 | 3 |
| `demo-04` | Sân hoa giấy | 437 | 57 | 3 |
| `demo-05` | Bậc thềm nắng | 393 | 62 | 3 |
| `demo-06` | Đèn cuối ngõ | 481 | 71 | 3 |

Số trong hai cột là ký tự hiện tại, không phải giới hạn. Nội dung fixture được ghi rõ là truyện hư cấu “Bức thư cuối ngõ”, sáu chương/điểm mô phỏng; không được gắn nó thành lịch sử thật hay mặc định là nội dung riêng của một ngõ thật. (data/README.md:5–9, 11–23; mobile/src/data/sourceState.ts:55–65, 304–369.)

`mobile/src/assets/photoMap.ts:12–25, 27–58` ánh xạ ảnh theo sáu node ID; `ALLEY_LIST` lại có năm metadata tĩnh với ID `phat-loc`, `tam-thuong`, `ngo-gach`, `cam-chi`, `hang-chi` (60–128). Chọn một card chỉ điều hướng `Home` với `alleyId`; `App.tsx` vẫn truyền cùng một dataset và cùng `nodeCount`, còn nguồn dùng `currentNodeId/startNodeId` để chọn node (mobile/src/screens/AlleySelectScreen.tsx:132–134, 319–327; mobile/App.tsx:94–104, 172–178, 207–220). Không có `alleyId` trong schema dataset v1 hoặc ràng buộc node↔ngõ. Vì vậy hiện chưa có quan hệ dữ liệu đáng tin cậy để biến năm card thành năm bộ truyện; W1 cần chốt phạm vi pilot/association trước khi localization hay API chọn nội dung theo ngõ.

## 3. Catalogue tiếng Việt — chỉ bảo toàn, không tạo lại

`mobile/assets/voice/manifest.json` SHA-256 `34925f5d005fa7fb684c4f8fac19992865b581c6eeaa6bde0e9183431c9be05a`; `sourceDataSha256` khớp đúng hash fixture ở trên. Manifest có 34 entry: 1 intro, 6 story, 6 caption, 21 answer. Kiểm tra đọc trong bộ nhớ cho kết quả 34/34 file audio hiện diện và khớp `audioSha256`; 34/34 chuỗi nguồn theo ID khớp `textSha256`. `mobile/src/voice/catalog.ts:2–40` dùng revision bằng SHA của fixture, các asset được require tĩnh theo ID; đây là catalog VI duy nhất hiện có. Không chạy generator/validator và không ghi đè, đổi hash hay tạo lại bất kỳ file VI nào.

Metadata hiện tại: preset `Đoan Trang`; `vieneu==3.7.1`; model `pnnbao-ump/VieNeu-TTS-v3-Turbo` revision `61b85e3d937fbbacb387714180e8182823512523`; codec `OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX` revision `ceff0d0749bfb3fa2d61149794ec6feef0d1e1ae`. `mobile/assets/voice/LICENSES.md:3–10` ghi package/model/codec Apache-2.0 và encoding MP3 bằng FFmpeg `libmp3lame`; model card/giọng dịch vụ không được suy ra từ giấy phép các file local. Generator lấy đúng intro/story/caption/answer, tạo hash văn bản/audio và duration; khi khớp revision/text/hash thì tái dùng clip cũ (`tools/voice/generate_catalogue_v1.py:33–47, 73–101, 132–158`).

## 4. Luồng locale hiện tại và các điểm khóa VI

| Tầng | Hiện trạng source và bằng chứng | Hệ quả khi thêm EN |
| --- | --- | --- |
| Chọn dữ liệu/turn | `QaScreen` tạo scope `mode:datasetRevision:nodeId`; truyền node, mode, revision cho hook (`mobile/src/screens/QaScreen.tsx:224–233`). App revision demo là `voiceCatalogueRevision`, live là `live-${liveRevision}` và key màn theo mode/revision/node (`mobile/App.tsx:207–215`). | Locale chưa nằm trong scope, key hay revision. Thêm locale vào ngữ cảnh hiện hành nhưng giữ selected node/chương. |
| Ghi âm/lifecycle | `VoiceTurnContext` có `turnId,scope,nodeId,mode,datasetRevision`, chưa có locale (`mobile/src/voice/useVoiceSession.ts:18–24`). Hook abort request khi cancel; đổi scope hoặc mất focus sẽ cancel turn và stop playback; unmount cũng invalidates playback request (`useVoiceSession.ts:106–140, 385–415`). | Có nền tảng hủy đang dùng; locale switch phải đổi scope, abort recorder/request, stop player, bỏ transcript/track cũ. Không tự mở mic hoặc phát file mới. |
| Request/response trên app | `VoiceTranscriptContext.locale` là literal `'vi'`; multipart gửi `turnId,locale,nodeId,mode,datasetRevision`; gọi `POST /v1/transcribe`. Client kiểm mọi trường context và text response không rỗng (`mobile/src/voice/transcribe.ts:1–19, 22–59`). `useVoiceSession` đóng cứng locale `vi` khi dựng request (`useVoiceSession.ts:270–295`). | Dùng union `vi|en`, nhưng phải cho locale đi xuyên context → multipart → worker → response và so khớp tất cả identity trước khi dùng transcript. |
| Intent và lookup | `parseVoiceIntent` dùng lệnh/từ phủ định/chủ đề tiếng Việt (`mobile/src/voice/intent.ts:11–16, 73–110`). `findAnswer` chuẩn hóa bỏ dấu/case/khoảng trắng và so khớp nguyên văn question rồi alias; không fuzzy (`mobile/src/qa/match.ts:16–53`). Q&A giới hạn theo `nodeQa`; follow-up dùng ID (`QaScreen.tsx:179–183, 284–303`). | Dữ liệu/câu alias phải chọn đúng locale và node trước exact lookup. Cần bảng command tiếng Anh cho các intent hiện có nếu tiếp tục cung cấp voice action; không dịch transcript ngầm, không dò chéo locale/fuzzy, không thêm intent mới. |
| Gateway | Node gateway chỉ nhận `POST /v1/transcribe`. Validate locale đúng `'vi'`, response gán literal `'vi'`; multipart có turn/locale/mode/node/revision (`tools/voice/gateway/server.mjs:210–252, 269–275`). | Cập nhật whitelist và validation đồng bộ; locale unsupported hoặc model không sẵn phải trả mã lỗi rõ. Không trả transcript VI khi yêu cầu EN. |
| ASR/provider | Worker đòi `faster-whisper==1.2.1`; profile mặc định `small-cpu` dùng `Systran/faster-whisper-small` rev `536b0662742c02347bc0e980a01041f333bce120`; profile tuỳ chọn Windows `large-v3-cuda` dùng `Systran/faster-whisper-large-v3` rev `edaa852ec7e145841d8ffdb056a99866b5f0a478` (`stt_worker.py:21–47, 57–63`; pin tại `asr_model.py:1–14`). Worker hiện gọi `model.transcribe(..., language="vi")` (`stt_worker.py:80–95`). | Cần tham số locale tới hàm decode, map whitelist cứng `vi→vi`, `en→en`; cấu hình profile/model/license vẫn phải xác minh. Chưa có bằng chứng chất lượng English ASR trong task inventory. |
| Audio playback | Catalog không có locale; lookup track dùng ID/kind/node, chỉ phát khi `mode==='demo'`, revision khớp fixture và hash text hiện tại bằng `track.textHash` (`mobile/src/voice/useVoiceSession.ts:329–374`). | Định danh track tách `locale + contentId`; hash text/revision sai hoặc thiếu EN thì lỗi rõ, tuyệt đối không lấy file VI làm fallback. |

## 5. Backend, parser và SQLite hiện tại

- Shared source of truth là `mobile/src/data/sourceState.ts`: `parseDataset` kiểm schema 1, kind demo/live, fields, references, evidence, timestamp/review metadata. Các giới hạn hiện tại gồm body 512 KiB, intro 4000, story/answer 2000, caption 220, evidence item 2000/tối đa 20, alias 1–7, follow-up 0–2, ID 128 (`sourceState.ts:10–24, 196–220, 304–374`). `parseDataset` không tự đếm UTF-8 body; app live adapter đo Content-Length và bytes thực trước parse (`mobile/src/data/live.ts:129–161`). Backend serialize-dataset UTF-8 đo `MAX_BODY_BYTES` trước import và read (`backend/src/database.mjs:47–51, 53–90, 93–99`).
- Backend là GET-only: `/api/health`, `/api/ready`, `/api/dataset`; hiện từ chối mọi query param, bare `/api/dataset` trả dataset nguyên dạng, lỗi database/shape là 503 (`backend/src/app.mjs:18–69`). Live adapter gọi `GET /api/dataset`, timeout 8 giây, không persistence/fallback fixture (`mobile/src/data/live.ts:9–10, 72–76, 120–173`). Không có locale trong query, body hay schema v1.
- SQLite migration 001 lưu một row `dataset`, `nodes` và `qa` bằng text columns đơn ngôn ngữ; node và QA ID là khóa, QA có FK về node (`backend/migrations/001_initial.sql:1–49`). Server chỉ xác thực migration, không chạy migration lúc start (`database.mjs:13–37`, `server.mjs:8–12`). CLI `import --replace` tạo SQLite backup trước mutation nếu DB có data; import thay dữ liệu trong transaction (`cli.mjs:44–54`; `database.mjs:93–126`). Migration mới nên là explicit versioned migration; hiện chưa thấy backup-before-migrate trong CLI, nên backup/restore rehearsal phải thành bước riêng trước DB có giá trị. Không drop/reseed hoặc đụng DB thật trong inventory.

## 6. Phương án tối thiểu để W1 chốt (chưa phải quyết định)

1. **Một ID, locale tách riêng:** giữ node ID và QA ID xuyên VI/EN; mọi record localized có `locale`, `contentRevision` và text hash. Trả một locale mỗi lần để áp cùng giới hạn 512 KiB cho body. W1 chốt có cần dịch disclaimer/evidence/tags/topic labels ngoài intro, node text/caption và mọi question/answer/alias/follow-up hay không.
2. **Giữ đường cũ:** `GET /api/dataset` không query tiếp tục là payload VI schema v1 không đổi. Phương án nhỏ là cho phép query `?locale=vi|en` như opt-in, với locale/revision tường minh trong response; W1 có thể chọn route v2 thay vì additive query nếu cần version semantics rõ hơn. `backend/src/app.mjs:38–40` hiện chặn query nên việc mở allowlist phải được chỉ rõ trong contract; không nhận query tùy ý. Shared parser mở rộng đúng một nguồn và được backend/mobile cùng gọi, không copy parser/schema. Legacy bare GET vẫn đọc được VI cũ.
3. **SQLite không phá dữ liệu:** đề xuất migration v2 thêm bảng translation theo locale cho dataset/intro, node text và QA text/aliases/evidence/follow-ups; node, QA, order, FK và logical tags ổn định. Migration sao chép text v1 hiện tại thành locale `vi`, giữ nguyên cột v1 để rollback/compatibility trong lần này; chỉ sau W1 review mới xét cleanup. Trước migration DB có giá trị: SQLite backup có timestamp, kiểm checksum/row counts, chạy migration trên bản sao, xác minh restore; migration phải idempotent/transaction-safe và server startup không tự migrate. Không thay nội dung fixture hay tái sinh 34 audio VI.
4. **Voice guard xuyên suốt:** chọn locale ở tầng app; đưa nó vào `VoiceTranscriptContext`, `VoiceTurnContext`, scope và dataset/audio revision. Khi locale đổi, giữ node/chương, clear sheet theo quyết định UX, abort request/recorder cũ, stop player và loại mọi callback/response cũ nếu locale, turnId, mode, nodeId hoặc revision không khớp. Chỉ response cùng đủ bộ identity mới tới locale-aware exact matcher/intent. Không tự phát audio/mở mic sau switch.
5. **Không fallback âm thầm:** bare legacy GET VI là mặc định tương thích có chủ đích; explicit `locale=en` không có dataset/bản dịch/audio phải trả `LOCALE_UNAVAILABLE`/`AUDIO_UNAVAILABLE`, không mượn VI. Locale ngoài allowlist trả `UNSUPPORTED_LOCALE` 400; lỗi dataset/storage giữ server error (corrupt DB 503), không trả partial English. Gateway nên phân biệt `UNSUPPORTED_LOCALE` (400), `ASR_UNAVAILABLE` (503), timeout (504), no speech (422) bằng error code; app map mã sang localized UI, không hiện stack/secret.
6. **Giữ budget và validation:** dùng lại field limits/shared parser cùng ID/reference/evidence checks; body UTF-8 tối đa 512 KiB cho mỗi response locale, không nâng trần. English dataset phải đầy đủ nội dung được chọn (nếu giữ trọn story set: 6 node, 21 QA, intro, 6 caption, tương ứng 34 audio); không trả partial rồi bù VI. Unique normalized question/alias kiểm theo cặp `(locale,nodeId)` để exact lookup không va chéo ngôn ngữ. Error cho record locale thiếu phải khác `unknown question` để không che thiếu coverage.

## 7. Runtime/model/license inventory và shortlist điều kiện

Tracked metadata ghi TTS `vieneu==3.7.1`, model/codec Apache-2.0; ASR source pin faster-whisper/version/model revisions như mục 4. Tuy nhiên trong worktree này không có `tools/voice/.venv/Lib/site-packages` hay `tools/voice/.cache` model directory để đọc metadata cài đặt; không thể khẳng định runtime/model nào đã cài ở máy khác. `Get-Command` chỉ xác nhận `ffmpeg.exe` và `ffprobe.exe` có trong PATH; không chạy chúng. Không thấy `piper`, `espeak-ng`/`espeak` trong PATH. Không đọc env/auth và không kiểm tra service/port.

Hai lead miễn phí để W1 cân nhắc xác minh sau, không phải lựa chọn đã duyệt:

| Candidate | Preset | License hiện biết / điểm phải xác minh | Ghi chú |
| --- | --- | --- | --- |
| eSpeak NG | `en-us` built-in voice | Engine GPL-3.0; kiểm license của đúng binary/package và cách phân phối trước khi dùng. | Không cần tải voice model riêng; khả năng tự nhiên/“ấm” có thể không đạt tiêu chí prompt. Binary không có trong PATH ở worktree này. |
| Piper | `en_US-lessac-medium` | Piper engine GPL-3.0; **license file của voice/model riêng chưa có tại chỗ và bắt buộc xác minh ở revision được chọn** trước tải/dùng. | Candidate neural English gọn để probe nếu license cho phép; hiện không có binary/model cache ở worktree. |

Không có phương án nào được probe. Prompt yêu cầu tối đa hai phương án không trả phí và thử sample tên riêng, món ăn, câu dài sau khi W1 chốt contract; TTS tiếng Anh không thay thế kiểm chứng STT tiếng Anh. STT model pin hiện tại không chứng minh license/độ chính xác cho English, và tracked license note mới liệt kê TTS/codec. Cần W1 kiểm model card/license/preset chính xác trước khi tải; không dùng API trả phí hay clone giọng. (Prompt:99–110; `tools/voice/README.md:7–22`; `tools/voice/asr_model.py:1–14`; `mobile/assets/voice/LICENSES.md:3–10`.)

## 8. Acceptance proposal và phần còn thiếu

- **Data/parser/backend:** giữ hash/response v1 bare VI; kiểm v1 và EN lookup theo cùng IDs; exact coverage 6 node/21 QA/intro/caption/evidence; reject locale sai, thiếu translation, collision alias, reference/evidence/date sai và UTF-8 body >512 KiB. Import/replace lỗi không mất prior data; backup trước migrate, kiểm migration/rollback/restore; DB corruption trả 503, không 200 partial.
- **Voice end-to-end:** từng locale đi app→multipart→gateway→provider→response→matcher/playback; response echo đúng locale/turn/mode/node/revision; test invalid locale/audio, timeout/quota/no speech/offline, unknown question và audio missing; không mock transcript. Test switch ở preparing/recording/stopping/ready/transcribing/playing, gửi 2 lượt, cancel/back, đổi node/mode/revision và network late response; lượt cũ không thể tác động locale mới, node/chương không đổi.
- **VI preservation:** so hash và manifest 34/34 trước/sau, kiểm VI regression, không regenerate clip. Tách automated hash/ASR checks khỏi nghe người và thiết bị thật.
- **Thiết bị/evidence:** Phase8 hiện có emulator APK evidence; iPhone và thiết bị thật chưa có trong QA. Voice report cũ ghi physical/iPhone mic/STT/audio pending; hiện inventory không xác minh mic/audio route. English naturalness, English ASR, cách phát âm tên/món, codec/level và real-device lifecycle cần evidence riêng sau contract/model selection.

## 9. Evidence map

| Hạng mục | File và line chính |
| --- | --- |
| Quyền scope, Phase8 QA và giới hạn | `AGENTS.md:3–16`; `MEMORY.md:3–9`; `docs/PHASE_8_QA_REPORT.md:20–34, 82–90, 126–132`; `docs/PHASE_8_ANDROID_BUILD.md:13–18, 42–43` |
| Prompt VI/EN, ownership và chuyển locale | `E:/Project/Ngo_Ke/ngoke/docs/CLAUDE_POST_PHASE8_STORY_EN_PROMPT.md:14–18, 36–47, 92–110, 112–128` |
| Fixture + giới hạn schema/parser/body | `data/README.md:5–27`; `mobile/src/data/sourceState.ts:10–24, 55–65, 304–374`; `mobile/src/data/live.ts:120–173`; `backend/src/database.mjs:47–90, 93–126` |
| Data–alley relation | `mobile/src/assets/photoMap.ts:12–25, 27–58, 60–152`; `mobile/src/screens/AlleySelectScreen.tsx:132–134, 319–327`; `mobile/App.tsx:94–104, 172–178, 207–220` |
| VI audio/hash | `mobile/assets/voice/manifest.json`; `mobile/assets/voice/LICENSES.md:3–10`; `mobile/src/voice/catalog.ts:2–40`; `tools/voice/generate_catalogue_v1.py:33–47, 73–101, 132–170` |
| Locale, intent, turn/lifecycle, playback | `mobile/src/screens/QaScreen.tsx:179–183, 220–233, 280–310`; `mobile/src/voice/useVoiceSession.ts:18–24, 106–140, 270–327, 329–415`; `mobile/src/voice/transcribe.ts:1–59`; `mobile/src/voice/intent.ts:5–16, 73–110, 136–147`; `mobile/src/qa/match.ts:16–53` |
| Gateway/provider errors and pins | `tools/voice/gateway/server.mjs:25–33, 163–177, 210–279`; `tools/voice/gateway/stt_worker.py:21–63, 80–95`; `tools/voice/asr_model.py:1–14` |
| Backend API/SQLite/backup | `backend/src/app.mjs:18–70`; `backend/migrations/001_initial.sql:1–49`; `backend/src/database.mjs:13–37, 47–126`; `backend/src/cli.mjs:44–54` |

**Giới hạn inventory:** đọc source và file metadata trong worktree, không chạy test/build/engine/server, không xác minh model cache ngoài worktree, không probe âm thanh hay thiết bị. Các route/field/table/error trong mục 6 là đề xuất kỹ thuật để W1 chốt, không phải hợp đồng cuối hoặc quyền tự mở T1–T4.
