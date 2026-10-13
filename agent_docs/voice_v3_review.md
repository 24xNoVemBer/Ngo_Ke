# Voice V3 — Microphone recorder

## Latest second-turn iPhone report and native start guard — 14/10/2026

- User confirms the first iPhone turn returned an answer; the second turn lost the meter and failed. No native log or meter value is available, so the failure is not reproduced or diagnosed on-device.
- Recorder startup now polls Expo Audio's native `isRecording` state for up to 1 second before showing the recording stage. If the turn is canceled during that wait, the recorder is stopped; a persistent start failure is stopped and reported. A stale answer-playback request is also dropped after its audio-mode await when a new mic turn invalidates it. These cover delayed start and a plausible audio-mode race, but cannot restore microphone samples if iOS reports recording while the meter stays silent.
- `voiceRecorderPreparation` tests pass 8/8 and focused playback/recorder tests pass 12/12; the full mobile suite passes 152/152, plus typecheck/lint and iOS/Android JS exports. Metro iOS bundle HTTP 200 (6,064,803 bytes) contains both guards and the gateway URL; gateway `/health` and Metro `:8090/status` return HTTP 200.
- Android API 37 evidence only verifies re-entry after Cancel; it does not cover the iPhone submit→STT→answer→second-mic route. The user must retest the updated Expo Go bundle before GV3 closes.

## Báo lỗi iPhone và sửa hiển thị metering — 14/10/2026

- Screenshot người dùng gửi cho thấy trạng thái recording 00:02 nhưng thanh mức âm không có fill; lượt trước trả Q&A unknown. Recorder đã cấu hình `isMeteringEnabled: true`, nhưng UI chỉ map từ −60 dB trở lên nên có thể giấu giọng nhỏ. Đổi dải hiển thị xuống −80 dB, vẫn chỉ dựa trên metering thật và không dựng waveform.
- Thêm test cho các mức −160/−80/−60/−40/−10/0 dB cùng dữ liệu thiếu/NaN. Sau reload Expo Go, người dùng xác nhận meter và câu trả lời chạy trên iPhone trong một lượt thử. Chưa có giá trị metering/clip/log để xác nhận độc lập codec, mức tín hiệu hay file cleanup; lifecycle/error routes còn mở.

## Revalidation after recorder codec fix — 13/10/2026

- Root cause found in the first app-to-gateway attempt: `prepareToRecordAsync({ isMeteringEnabled: true })` replaced the preset options, so Android fell back to AMR-NB despite the `.m4a` extension. The gateway correctly rejected that codec. The recorder now keeps `RecordingPresets.HIGH_QUALITY` plus metering at construction and prepares with no partial override.
- Rebuilt APK SHA-256 `159EE52016DCC4F5B5B5C9DC697AB4FD20B0294D99B13A64CC74B5DED38F6D98`, 121,233,212 bytes. On API 37 AVD, the app recorded to its real 19-second safety cap; after **Gửi**, the request passed gateway media validation and returned `NO_SPEECH` from faster-whisper. The app showed its retry guidance. Evidence: [native no-speech state](evidence/voice/android-avd-stt-no-speech-2026-10-13.png).
- This confirms supported recorder codec, multipart upload, server media probing and ASR handling on the emulator. The emulator supplied no intelligible speech, so this does not prove transcript accuracy, answer selection or a physical microphone. No personal audio was used.
- Current checks: `npm test` 138/138; typecheck and lint pass; Android release build `BUILD SUCCESSFUL`. Full local gateway smoke test also passes.

**Gate GV3 remains open:** user reported one successful iPhone voice sample with active meter and an answer; test record/send/cancel cleanup, interruption, permissions and routes over repeated device runs.

**Ngày:** 13/10/2026
**Trạng thái:** recorder thật đã kiểm trên Android API 37 emulator: cấp quyền lần đầu bắt đầu thu ngay, tự dừng ở 19.5 giây để chừa 500ms trước hard limit gateway 20 giây, giữ thời lượng đo thật (`00:19`); Hủy và Back dừng thu. Chưa thử trên điện thoại thật.
**Gate GV3:** chưa đóng vì chưa xác nhận ghi âm/codec/metering/file cleanup trên microphone thiết bị thật.

## Đã làm

- Chỉ xin quyền microphone khi người dùng chạm; flow có preparing → recording → clip ready, dừng tự động ở 19.5 giây (500ms margin) và chờ người dùng bấm Gửi hoặc Hủy. Hủy luôn hiện khi thu/xử lý/đã thu.
- Dùng recorder một chủ sở hữu; duration/meter lấy từ recorder status thật, không dựng waveform/timer giả. Bấm mic khi player đang chạy sẽ stop playback trước.
- Có guard cho double tap và kết quả permission/prepare/stop đến muộn sau Back, đổi điểm hoặc hủy. Background/inactive dừng và bỏ context, không tự thu/phát lại khi foreground.
- Audio tạm do recorder tạo được dọn khi hủy/gửi; app không giữ lịch sử ghi âm.

## Bằng chứng và giới hạn

- Source: `mobile/src/voice/useVoiceSession.ts`, `mobile/src/components/VoiceInteractionDock.tsx`.
- `npm test` 131/131; typecheck, lint, dependency check đạt. Test kiểm mốc guard 19.5 giây và hard limit gateway là 20 giây.
- Android API 37: prompt quyền chỉ hiện sau chạm; cấp quyền lần đầu bắt đầu ghi ngay, không cần chạm mic lần hai. Screenshot `release-first-grant-recording-2026-10-13.png` là build liền trước; build LAN mới chỉ đổi cách bundle URL voice.
- Trên APK LAN hiện tại, sau guard 19.5 giây recorder dừng và UI giữ thời lượng thật `00:19`, chờ Gửi/Hủy; AppOps đo 19.692 giây; không gửi audio. `release-lan-recording-cap-2026-10-13.png`.
- Hủy bản ghi trở về idle. Back trong lúc ghi rời màn; AppOps ghi duration thu 1.814 giây, không có FATAL exception. `release-lan-after-cancel-2026-10-13.png` và `release-lan-back-recording-2026-10-13.png`.
- Trước lần revalidation phía trên, chưa gửi clip mic vào gateway. Call, rút tai nghe, lock/background, metering với lời nói, hoặc 20 vòng lifecycle trên điện thoại thật vẫn pending.

**Còn lại:** kiểm mic, codec, metering, file cleanup và các route âm thanh trên điện thoại thật; gửi clip chỉ sau khi người thử chủ động bấm Gửi. Chưa đóng GV3.

## Lỗi meter ở lượt iPhone thứ hai — cập nhật 14/10/2026

- Người dùng tiếp tục báo lượt đầu hoạt động nhưng lượt hai không có meter và thất bại. Chưa có log, transcript hay tái hiện độc lập trên iPhone.
- Mỗi lượt giờ truyền lại đủ `RecordingPresets.HIGH_QUALITY` cùng `isMeteringEnabled: true` vào `prepareToRecordAsync`. Trong Expo Audio iOS, có options sẽ tạo `AVAudioRecorder` mới thay vì dùng lại recorder đã stop; unit regression kiểm tra hai lượt đều nhận options này.
- Full suite **148/148**, typecheck, lint, `git diff --check` và iOS JS export đạt. Metro đang chứa sửa đổi mới. Đây chưa phải kiểm thử native iOS; cần xác nhận trên iPhone trước khi đóng GV3.

## Kiểm tra native start cho lượt iPhone thứ hai — 14/10/2026

- Expo Audio iOS không kiểm tra giá trị trả về từ `AVAudioRecorder.record()`. App trước đây chuyển UI sang “Đang thu” ngay cả khi native recorder chưa thực sự chạy. Giờ app xác nhận `recorder.isRecording` trước khi vào trạng thái thu; nếu chưa chạy, app đóng audio mode thu và báo để người dùng thử lại thay vì gửi clip im lặng.
- Regression test cho cả nhánh start thất bại và thành công; `npm test`, typecheck, lint đều đạt. iOS Metro bundle mới trả HTTP 200 và có guard này.
- Cổng 8089 còn listener nhưng server không trả HTTP. Preview LAN mới chạy tại `exp://192.168.100.36:8090`; đây là bundle cần nạp lại trong Expo Go.
- Đây là guard phát hiện lỗi và tránh state giả, chưa xác nhận nguyên nhân cuối trên iPhone. Chờ test lặp lại: lượt đầu trả lời → chạm mic lần hai → meter nhúc nhích → câu hỏi follow-up trả lời đúng. GV3 vẫn mở.

## Chờ player dừng hẳn trước khi thu lượt tiếp — 14/10/2026

- Trước đó `stopPlayback()` có `await`, nhưng helper bên dưới chỉ gọi `pause()` đồng bộ rồi trả về. Khi câu trả lời đang tự lặp, lượt mic kế có thể đổi audio session/chuẩn bị recorder trước khi native player hoàn tất lệnh dừng.
- `stopAudioPlayer()` giờ tắt loop, pause và chờ `seekTo(0)` hoàn tất; `startRecording()` chờ thao tác này trước khi xin quyền/đổi audio session/prepare recorder. Regression test giữ seek ở trạng thái pending để xác nhận promise dừng chỉ hoàn tất sau native seek.
- Playback test 4/4; full mobile suite 152/152; typecheck, lint, `git diff --check`, iOS JS export đều đạt. Bundle LAN `exp://192.168.100.36:8090` trả HTTP 200, 6,065,043 byte, có `seekTo(0)`.
- Chưa kiểm lại trên iPhone; coi đây là sửa một race có khả năng gây lỗi, chưa kết luận đã hết lỗi thiết bị. GV3/GV5/GV7 vẫn mở cho đến khi lượt hai có meter và trả lời đúng trên máy thật.
