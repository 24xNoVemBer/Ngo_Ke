# Ngõ Kể — Demo Voice Migration V1 Report

**Trạng thái:** `READY_FOR_IPHONE_AUDIO_ACCEPTANCE` — kỹ thuật đã tích hợp; chưa có human listening approval và chưa xác nhận trên iPhone.

## Baseline và bảo toàn WIP

- Branch: `valentino/logic-fix-mobile-20261020`
- HEAD: `4af64c49a4ada47f952ddf76c35adfb90f826224`
- Worktree đã dirty trước lượt này, gồm UI/Wave 1, NK-UI-03, PERF-01, nội dung và nhiều test/document chưa commit. Các thay đổi đó được giữ nguyên; không đổi branch, commit, push, reset hay stash.
- Audio cũ vẫn còn đủ 198/198 file. Đọc lại inventory cũ không phát hiện audio hash mismatch.

## Kết quả migration

- Đã tích hợp **198/198** track: 99 VI và 99 EN, tổng 68.523 ký tự spoken text, khoảng 4.316 giây audio.
- Model: `eleven_v3`, MP3 `mp3_44100_128`.
- VI route: Nhật Phong, voice ID `6adFm46eyy74snVn6YrT`.
- EN route: Talia, voice ID `OZ0L6eISlOejga3XjDFt`.
- Resolver tĩnh hiện dùng `mobile/assets/voice/demo-migration-v1/{collection}/{locale}/{id}.mp3`. Các luồng playback hiện hữu tiếp tục đi qua `lookupVoiceTrack`/`useVoiceSession`; không đổi hook, session logic hay nội dung.
- Spoken `textHash` được xác minh cho inventory hiện hành; không sửa story, Q&A, caption hay localized dataset. Có 8 source-data file hash cũ trong các manifest nguồn không khớp byte-level với file hiện tại, nhưng các spoken-text hash của inventory vẫn khớp. File nguồn và manifest cũ không bị sửa.
- Manifest mới giữ `humanApproved=false`, `listened=false`, `selectedForShipping=false`; đây chưa phải phê duyệt phát hành.

### Tính toàn vẹn audio

- Kiểm tra hiện tại: 198 file tồn tại, 198/198 SHA-256 và byte size khớp journal hoàn tất; không thiếu hoặc lệch hash. Locale/voice ID trong journal khớp VI/EN như trên. Các file hiện tại byte-identical với file đã được giải mã thành công trong lượt generate; journal lưu MP3, 44.1 kHz, 128 kbps, duration và channel count cho từng track.
- Trong lượt resume, tôi thử giải mã lại bằng Edge headless nhưng browser không tạo được page (`Headless browser page is unavailable`). Vì vậy **không tuyên bố đã re-decode độc lập lần nữa trong lượt này**. Bằng chứng hợp lệ hiện có là decode thành công lúc generate cộng với SHA-256 hiện tại khớp chính xác bytes đã decode. Không có file nào được tạo lại.
- Audio ID không được mã hóa trong MP3; voice ID được xác lập bởi preflight voice identity, mapping locale trong journal và endpoint routing của generator. Manifest lưu identity theo locale; API history chưa cho phép kiểm tra độc lập từng request.

## Billing — chưa đối soát

- Snapshot ban đầu: 16.473 ký tự; snapshot cuối được lưu: 46.463; subscription net change: **29.990 credits**.
- Tổng `character-cost` từ response headers: **30.151 credits**. Chênh lệch chưa giải thích: **161 credits**.
- History API đã trả HTTP 401 ở lượt trước nên không có đối soát theo từng request. Manifest cố ý ghi `billingReconciled=false`, trạng thái `source-only-billing-delta-mismatch`; không được xem hai số trên là đã reconciled.
- Snapshot hiện có cho thấy 84.537 credits còn lại, overage/credit extension tắt. Lệnh finalize trong lượt resume chỉ đọc journal/files và không gọi API. **Không có yêu cầu TTS hoặc thao tác tính phí nào được gửi trong lượt resume.**

## Files thuộc migration

- `mobile/src/voice/localizedCatalog.ts` — resolver chuyển sang catalogue migration; giữ dataset revision/API query contract.
- `mobile/src/voice/demoVoiceMigrationV1Catalog.ts` — static Metro asset map mới.
- `mobile/assets/voice/demo-migration-v1/manifest.json` và 198 MP3 dưới `mobile/assets/voice/demo-migration-v1/`.
- `tools/voice/migrate_demo_voice_v1.mjs` — thêm finalization offline, không phát TTS/API request.
- Tests: `mobile/tests/demoVoiceMigrationV1.test.mjs`, `alleysVoiceCatalogue.test.mjs`, `homeIntroPlay.test.mjs`, `nodeStoryVoiceCatalogue.test.mjs`, `post8VoiceCatalogue.test.mjs`, `qaNodeStoryVoice.test.mjs`.
- Tạo báo cáo này.

Không sửa audio gốc, các catalogue cũ, nội dung, revision, Q&A, UI, audio lifecycle hoặc NK-UI-03. Các audio/catalogue cũ được giữ làm rollback source.

## Regression

- Focused catalogue suite: **13/13 PASS**.
- Home/QA voice UI suite: **27/27 PASS**.
- Full mobile suite: **433/433 PASS**, 0 FAIL, 0 SKIP.
- `npm run typecheck`: PASS.
- `npm run lint -- --no-cache`: PASS.
- `git diff --check`: PASS.

Các test bao phủ resolver cho VI/EN, đúng ID/revision, Home intro, story/Q&A lookup, locale switch, next-point flow, replay/stop và voice session lifecycle. Đây là host test/app harness, không phải bằng chứng phát âm nghe được trên thiết bị thật.

## Rollback

Để quay lại audio cũ, chỉ khôi phục `mobile/src/voice/localizedCatalog.ts` về resolver trước migration (file này sạch trước lượt migration, nên có thể lấy riêng từ HEAD), rồi chạy lại test catalogue và mobile suite. Không khôi phục toàn bộ worktree hoặc dùng reset/checkout toàn repo. Giữ `mobile/assets/voice/demo-migration-v1/` và manifest lại để có thể phục hồi; audio cũ không bị xóa nên không cần tái tạo.

## Nghe thử trên iPhone — bước người dùng

1. Chạy/reload app từ checkout hiện tại trong Expo Go sau khi xác nhận Metro đang phục vụ đúng workspace.
2. Chọn VI, mở một ngõ có intro và kiểm tra Play → Replay → Stop. Lặp lại bằng EN; xác nhận voice VI/EN đúng, không còn clip cũ hoặc nhầm locale.
3. Mở một điểm, nghe story và một câu trả lời Q&A; thử replay/stop, chuyển điểm bằng “next”, rồi đổi VI/EN khi cùng một điểm đang được chọn.
4. Ghi nhận riêng: lỗi phát, clip thiếu/sai, phát chồng, giọng/nhịp/phát âm không chấp nhận được, và hành vi tai nghe/loa hoặc interruption nếu gặp. Không cần gửi recording.

Chưa thực hiện human listening, chưa chạy native iPhone test trong lượt này, và không đánh dấu audio/native QA PASS. Dừng tại **iPhone Audio Acceptance Gate**; chỉ sau khi nghe và chấp nhận mới xét bước shipping/voice-content approval.

