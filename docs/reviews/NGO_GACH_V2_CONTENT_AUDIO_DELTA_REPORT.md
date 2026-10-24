# Ngõ Gạch V2 — Content & Audio Delta Report

**Trạng thái:** `HUMAN_IPHONE_AUDIO_QA` — tích hợp và host regression hoàn tất; chưa nghiệm thu nghe trên iPhone.

## 1. Baseline và phạm vi

- Branch: `valentino/logic-fix-mobile-20261020`
- HEAD tại lúc bắt đầu: `4af64c49a4ada47f952ddf76c35adfb90f826224`
- Worktree đã dirty trước khi bắt đầu, gồm WIP UI Wave 1/2, voice migration và tài liệu. Không đổi branch, reset, stash, commit hoặc push; không xóa hay ghi đè WIP ngoài các trường được giao.
- Chỉ tích hợp bộ chữ đã chốt trong `docs/content/NGO_GACH_STORYTELLING_V2_REVIEW.md` cho collection `ngo-gach`; không đổi ID, thứ tự, Q&A, geometry, GPS, ảnh, nội dung ngõ khác hoặc trạng thái duyệt claim.

## 2. Nội dung và evidence

- Đã thay đúng **32/32 giá trị VI/EN** đã chốt: 2 intro, 10 story, 10 summary và 10 caption. Test so sánh từng giá trị runtime với các exact-text block trong review.
- Evidence hiện hành được giữ và bổ sung: S22 vào intro VI/EN; S22 và B2B-S01 vào Thanh Hà VI/EN; S25 vào Ta Cà Phê VI/EN. Các nguồn cũ vẫn được giữ. Không thay đổi mức xác minh historical claim.
- Node IDs, order, `startNodeId`, Q&A rỗng, geometry, GPS, `pendingCheck`, tên hiển thị và disclaimer giữ nguyên.
- Revision canonical mới: VI `8c52c3d6bc910fbae34da641741023bce240e2c1ea9ba6e39a029aeb9b7c8986`; EN `62e4edfbd7492cf173171b5d01997063a561fd4b4d9bdab2eac8f6b39bf38203`.

## 3. TTS preflight và delta

Preflight ElevenLabs chỉ đọc được xác nhận trước khi generation:

- Gói Creator; balance khả dụng lúc preflight: **83.909 credits**.
- Estimate cho 10 story: **2.069 credits**; còn 81.840 theo estimate, cao hơn reserve 10.000.
- Overage/credit extension được xác nhận tắt; model `eleven_v3` hỗ trợ VI/EN; voice IDs khớp Nhật Phong (VI) và Talia (EN).
- Đã gửi đúng **10 yêu cầu TTS**: năm story VI và năm story EN; không có request cho intro hay ngõ khác. Response `character-cost` cộng lại là **911 credits**. Không mua thêm credit hoặc bật overage.
- Không lấy balance snapshot sau generation. Chênh lệch **161 credits** từ migration trước vẫn chưa được đối soát; manifest tiếp tục ghi `billingReconciled: false`. Tổng 911 là tổng charge từ response headers của delta này, không phải kết quả reconcile lịch sử.

Audio mới nằm ở `mobile/assets/voice/demo-migration-v1/ngo-gach-v2/{vi,en}/`. Mười file cũ không bị ghi đè. Manifest ghi source hash, dataset revision, spoken-text hash, audio SHA-256, byte size, duration frame-based, voice/model/format, request ID, chi phí từng clip và đường dẫn/hash rollback.

Các 10 MP3 đã được quét toàn bộ MPEG frame: MPEG-1 Layer III, 44.1 kHz, 128 kbps, mono; frame boundaries và file length hợp lệ. SHA-256 và byte size khớp manifest cho 10/10 file. Thời lượng trong catalogue là từ frame count, làm tròn 0,01 giây.

**Giới hạn decode:** full decode bằng Edge headless không chạy được trong host này. Chẩn đoán Edge kết thúc với mã `3221225477` (`0xC0000005`); DevTools endpoint nội bộ trả `EACCES`/không có page. Vì vậy các entry delta ghi rõ `fullDecode: false`, `frameScanValidated: true`; không tuyên bố full decode hoặc nghe thử đã đạt. Native iPhone audio QA vẫn bắt buộc.

## 4. Catalogue, rollback và bảo toàn

- Đã cập nhật revision `ngo-gach` VI/EN trong `mobile/src/data/collections.ts`, cùng hai catalogue locale và đúng 10 static asset `require()` trong `mobile/src/voice/demoVoiceMigrationV1Catalog.ts`.
- Đã cập nhật đúng 10 entry Ngõ Gạch trong manifest; tổng track vẫn 198. Mỗi entry mới trỏ tới thư mục `ngo-gach-v2`, còn `previousActiveAudioPath` và `previousActiveAudioSha256` giữ mapping V1 cũ.
- Mười MP3 cũ đều hash-match giá trị rollback trong manifest.
- **188 track ngoài delta không đổi byte:** fingerprint trước/sau đều là `8abd7a04a396f467c9219264d71fdcbd523c84709ebfc36bbe7709c54a55f2bd`.
- Rollback riêng Ngõ Gạch: khôi phục đúng các trường của hai JSON từ baseline `4af64c49a4ada47f952ddf76c35adfb90f826224`; trả hai revision collection và 10 catalogue entries về giá trị trước V2; với 10 entry manifest dùng `previousDatasetRevision`, `previousTextHash`, `previousActiveAudioPath` và `previousActiveAudioSha256` để phục hồi mapping V1. Giữ nguyên các file V2 mới cho đến khi xác nhận rollback hoàn tất; không cần đụng tới 188 track khác.

## 5. Files thay đổi trong scope

- `data/localized/ngo-gach.vi.json`
- `data/localized/ngo-gach.en.json`
- `mobile/src/data/collections.ts`
- `mobile/src/voice/demoVoiceMigrationV1Catalog.ts`
- `mobile/assets/voice/demo-migration-v1/manifest.json`
- `mobile/assets/voice/demo-migration-v1/ngo-gach-v2/` — 10 MP3 story
- `tools/voice/generate_ngo_gach_v2_audio_delta.mjs`
- `tools/voice/.cache/ngo-gach-v2-audio-delta/progress.json` — generation journal, để ngăn gửi lại request đã hoàn tất
- Tests: `mobile/tests/demoVoiceMigrationV1.test.mjs`, `mobile/tests/nodeStoryVoiceCatalogue.test.mjs`, `mobile/tests/alleyContent.test.mjs`, và hai expected strings đã duyệt trong `mobile/tests/alleyIntegration.test.mjs`.
- Báo cáo này.

## 6. Kiểm thử

Tất cả lệnh dưới chạy mới trên worktree hiện hành:

| Lệnh | Kết quả |
| --- | --- |
| `node tools/voice/generate_ngo_gach_v2_audio_delta.mjs --verify-only` | PASS — 10/10 hash, byte size và toàn bộ frame/format; full decode chưa được xác nhận |
| `node --test tests/demoVoiceMigrationV1.test.mjs tests/alleyContent.test.mjs tests/nodeStoryVoiceCatalogue.test.mjs` | PASS — 11/11 |
| `npm test` | PASS — 435/435, 0 fail, 0 skip |
| `npm run typecheck` | PASS |
| `npm run lint -- --no-cache` | PASS |
| `git diff --check` | PASS |

## 7. Nghe nghiệm thu trên iPhone

1. Mở app qua Expo Go từ checkout này để Metro bundle các static `require()` mới; không dùng bản bundle cũ/cache cũ để nghiệm thu.
2. Chọn Ngõ Gạch, phát lần lượt 5 điểm bằng tiếng Việt; thử replay, stop và chuyển điểm khi đang/đã phát.
3. Đổi locale sang English, phát lại đủ 5 điểm. Xác nhận VI là Nhật Phong, EN là Talia; caption/story đúng locale, không phát nhầm V1 hoặc audio điểm khác, không chồng tiếng.
4. Kiểm tra cả play lần đầu và replay, sau khi rời rồi mở lại điểm. Ngõ Gạch không có intro MP3 mới trong delta này.
5. Ghi nhận node ID, locale, thao tác, kết quả phát/stop/replay và lỗi nghe thấy. Chỉ sau bước này mới coi audio V2 được nghiệm thu trên thiết bị.

Chưa có native iPhone playback/listening trong lượt triển khai này. Host tests chứng minh manifest và catalogue resolve đúng; chúng không thay thế kiểm tra Expo Go thật.

**Điểm dừng:** implementation đã tích hợp; chờ `HUMAN IPHONE AUDIO QA`. Không tự mở scope tiếp theo.
