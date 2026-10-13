# Voice V3 — Microphone recorder

## Revalidation after recorder codec fix — 13/10/2026

- Root cause found in the first app-to-gateway attempt: `prepareToRecordAsync({ isMeteringEnabled: true })` replaced the preset options, so Android fell back to AMR-NB despite the `.m4a` extension. The gateway correctly rejected that codec. The recorder now keeps `RecordingPresets.HIGH_QUALITY` plus metering at construction and prepares with no partial override.
- Rebuilt APK SHA-256 `159EE52016DCC4F5B5B5C9DC697AB4FD20B0294D99B13A64CC74B5DED38F6D98`, 121,233,212 bytes. On API 37 AVD, the app recorded to its real 19-second safety cap; after **Gửi**, the request passed gateway media validation and returned `NO_SPEECH` from faster-whisper. The app showed its retry guidance. Evidence: [native no-speech state](evidence/voice/android-avd-stt-no-speech-2026-10-13.png).
- This confirms supported recorder codec, multipart upload, server media probing and ASR handling on the emulator. The emulator supplied no intelligible speech, so this does not prove transcript accuracy, answer selection or a physical microphone. No personal audio was used.
- Current checks: `npm test` 138/138; typecheck and lint pass; Android release build `BUILD SUCCESSFUL`. Full local gateway smoke test also passes.

**Gate GV3 remains open:** test actual spoken audio, metering response, file cleanup, interruption routes and lifecycle on a physical phone. iOS hardware remains unavailable.

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
