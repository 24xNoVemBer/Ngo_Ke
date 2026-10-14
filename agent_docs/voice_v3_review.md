# Voice V3 — Microphone recorder

## Permission denied → retry recovery on the current release APK — 14/10/2026

- Revoked `RECORD_AUDIO`, tapped the mic, and confirmed Android's permission prompt. Choosing “Don’t allow” returned to the app's retry state with the typed-question fallback; it did not crash or leave a recording active.
- Tapped “Thử lại bằng giọng nói”, granted “While using the app”, and confirmed the runtime permission is granted. Retry entered `Đang thu · 00:02`; pressing Hủy returned the dock to idle. The permission remains granted after the test.
- Evidence: `android37-source-release-mic-permission-prompt-2026-10-14.png`, `android37-source-release-mic-denied-fallback-2026-10-14.png`, `android37-source-release-mic-permission-retry-prompt-2026-10-14.png`, `android37-source-release-mic-permission-recovery-active-2026-10-14.png`, and `android37-source-release-mic-permission-recovery-cancelled-2026-10-14.png` in `agent_docs/evidence/voice/android-emulator/`.
- This is Android API 37 permission/state coverage on an AVD running `-no-audio`; it does not verify speech, meter response, STT or iPhone permission behavior.

## Background cancellation on the latest source APK — 14/10/2026

- On the current release APK (`com.valentino241.ngokedemo`, SHA-256 `BA973B5F23550367191A3A5ED004FD411CEF6D90ABB5C0FB5A132AA4897221D2`), started recording and confirmed AppOps showed `RECORD_AUDIO ... (running)`. Pressed Home; the launcher became the resumed activity and AppOps changed to a completed 3.083-second use. Returning to Ngõ Kể showed `Nhấn để hỏi`; the recorder did not resume.
- Evidence: `agent_docs/evidence/voice/android-emulator/android37-source-release-recorder-background-idle-appops-2026-10-14.png`.
- AVD API 37 runs with `-no-audio`: this confirms Android background/lifecycle cleanup only. No mic signal, speech, STT or iPhone interruption behavior was tested.

## Kiểm tra lại trên APK Android release mới nhất — 14/10/2026

- APK 121,245,884 byte, SHA-256 0F43437B6B29D5AF9A7C750E746D1FE731F45A1808778DD6AC8925972FDF53F9 đã cài trên AVD API 37.
- Chạm mic mở phiên ghi thật; AppOps báo RECORD_AUDIO đang running và ảnh chụp hiển thị Đang thu · 00:02. Chạm Hủy sau khoảng 0,8 giây: AppOps dừng với duration 0,807 giây, mic trở lại trạng thái chờ trong accessibility tree. Không gửi bản ghi.
- Bằng chứng: android37-current-release-mic-active-2026-10-14.png và android37-current-release-mic-explicit-cancel-2026-10-14.png trong agent_docs/evidence/voice/android-emulator/.
- Đây là kiểm tra recorder start/cancel trên emulator, không kiểm tiếng nói/STT trên Android thật; iPhone happy path lượt hai được ghi trong Voice V7/report.
- Stress 20 vòng trên APK mới với 800 ms cho recorder khởi tạo: 20/20 AppOps start running, 20/20 Hủy dừng, idle cuối lượt, không crash. Không gửi clip. PSS 168,357 KB trước, 182,101 KB ngay sau, 171,789 KB sau 12 giây nghỉ; chưa đủ kết luận memory leak.

## iPhone retest — 14/10/2026

- Người dùng xác nhận ở lượt voice thứ hai liên tiếp trên iPhone: meter chạy, transcript và Q&A đúng, audio trả lời nghe được. Đây là báo cáo happy path thật từ thiết bị, chưa có log/server trace để xác minh độc lập; hủy/interruption, quyền và các input route vẫn cần kiểm tra.

## Cập nhật player→mic sau khi người dùng báo lỗi lượt hai — 14/10/2026

- `stopAudioPlayer()` hiện tắt loop rồi pause mà không seek trong lúc bàn giao AVAudioSession sang recorder. Phát lại vẫn bắt đầu từ đầu khi player thay track.
- Android API 37 release build mới xác nhận đang phát câu trả lời → mic dừng player và hiện meter; Hủy → mic lượt kế tiếp cũng hiện meter. Cả hai lượt đều được hủy; không có clip được gửi.
- Regression helper 6/6; full mobile suite 158/158, typecheck/lint/iOS JS export pass. Metro `:8089` hiện không phản hồi; gateway `:8788` ready nhưng APK/bundle không có URL STT. Lỗi trên iPhone thật chưa được kiểm lại; GV3 còn mở.

## Native Android player-to-mic handoff — 14/10/2026

- Fresh release build succeeded (377 Gradle tasks; 30 executed, 347 up-to-date), APK 121,244,960 bytes, SHA-256 `AC05A7E98F4A42B51021D2FFF554091764766FB5033ADABD901D5AE5BC4D7831`. Installed/launched on Android API 37 AVD as package `com.valentino241.ngokedemo`.
- The story player visibly showed the active Pause control at `00:00`; tapping mic stopped playback and started the native recorder. The screen showed `Đang thu · 00:01` and a live meter; Cancel returned the dock to idle. Screenshots and limits are recorded in `agent_docs/evidence/voice/android-emulator/README.md`. No recording was submitted, and the APK had no gateway URL configured.
- This verifies one Android player→recorder transition and Cancel only. It does not cover submitted speech/STT, a second submitted Q&A turn, or iPhone audio-session behavior. Metro `:8089` is stopped; GV3 remains open pending the physical iPhone retest.
- Permission path on the same APK: mic prompt appeared after revoke; denying it displayed the Vietnamese fallback, and granting it again in the emulator allowed Retry to start recording. No audio was submitted. The tested fallback/recovery remains an emulator result, not an iOS permission test.

## Second-turn iPhone meter failure and playback pause acknowledgement — 14/10/2026

- User confirms the first iPhone turn returned an answer; the second turn lost its meter and failed. No native log or meter value is available, so this is not reproduced on-device.
- Code review found that `stopPlayback()` awaited a `stopAudioPlayer()` that returned immediately. The next turn could switch audio mode and prepare the microphone before native answer playback had paused. It now waits for Expo Audio's live `player.playing` value to become false (up to one second); timeout prevents recorder start and shows retry guidance. Answer auto-play is gated on a confirmed stop.
- Recorder startup still waits up to one second for native `isRecording`. Full mobile tests pass 154/154; typecheck/lint and iOS JS export (1,073 modules) pass. Android release APK SHA-256 `E0680D8A78513442364687AC084AE8809F66BB69BD9A6631A8815A7DF5A0AB47` was installed/launched on API 37 AVD with no fatal/ReactNativeJS error in recent logs. AVD supplied no intelligible speech; no iPhone run was made after this change.
- Gateway `/health` is ready. Metro `:8087` `/status` times out; `:8089`/`:8090` are stopped. Start Expo Go using `docs/VOICE_HANDOFF.md`, then retest answer → mic → follow-up on iPhone. GV3 remains open.

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
- This awaited-seek attempt was superseded after the user reported the same failure: stopping now disables loop and pauses without waiting for `seekTo(0)`; explicit replay still seeks before playback.
- Stop-path regression, full mobile suite 152/152, typecheck/lint, iOS JS export and Android release build pass. APK SHA-256 `C21ACE29D356F779A16219CCA8AEE75527B805B983F90B8B13A3C15A0751CA0C` was installed/launched on the API 37 AVD; no physical mic was submitted.
- Physical iPhone retest remains pending. Old Metro status responds while bundle requests time out; restart using `docs/VOICE_HANDOFF.md`. This is a targeted fix, not confirmation that the device issue is resolved. GV3/GV5/GV7 remain open.

## Handoff player→recorder trên iPhone — 14/10/2026

- Expo Audio 57.0.5 iOS code schedules session deactivation 100ms after player pause by default and checks active playables, not recorders. That can disable a recorder started immediately after the answer player is paused.
- The voice player now uses `keepAudioSessionActive: true` so its pause does not schedule that deactivation. Typecheck/lint/tests and iOS JS export pass; no iPhone native retest yet. Keep GV3 open until the user confirms a second turn has a moving meter and sends speech successfully.

## Follow-up sau báo lỗi lượt hai — 14/10/2026

- Sau khi user báo lỗi vẫn còn, đường stop được đổi thành tắt loop + pause đồng bộ, không chờ native `seekTo`; thao tác replay chủ động vẫn seek trước khi phát.
- Stop-path regression, full suite 152/152, typecheck/lint, iOS JS export và Android release build đạt. APK SHA-256 `C21ACE29D356F779A16219CCA8AEE75527B805B983F90B8B13A3C15A0751CA0C` đã cài/mở trên AVD; không gửi giọng nói emulator.
- Retest iPhone vẫn pending. Metro cũ báo status running nhưng bundle timeout; khởi động lại theo `docs/VOICE_HANDOFF.md`. Đây chưa phải xác nhận lỗi thiết bị đã hết; GV3/GV5/GV7 vẫn mở.

## Bundle kiểm tra mới nhất — 14/10/2026

- Lần host probe Metro LAN `exp://192.168.100.36:8089` trả iOS bundle HTTP 200 (6,068,742 byte) có `keepAudioSessionActive` và `playbackIntent` nhưng không thấy gateway URL; request manifest mới nhất timeout. Chưa đối chiếu được bundle host với lần STT thành công do người dùng báo.
- Người dùng vẫn báo lượt đầu chạy nhưng lượt hai mất meter/lỗi. Chưa có retest iPhone xác nhận bản mới; chỉ AVD Android đã chứng minh được hai lần player→mic có meter.

## Guard bổ sung cho session iOS đang chờ tắt — 14/10/2026

- Khi player thực sự đang phát, `stopAudioPlayer` nay chờ thêm 125 ms sau khi pause để tác vụ deactivation trễ 100 ms của Expo Audio có thời gian kết thúc trước recorder handoff. Nếu player vốn không phát thì không thêm độ trễ.
- Regression stop-settle và toàn bộ suite hiện 161/161 pass; typecheck, lint, iOS JS export 1073 modules pass. Người dùng sau đó xác nhận lượt voice thứ hai liên tiếp trên iPhone hiện transcript và đúng câu trả lời. Chưa xác nhận meter riêng lượt hai, hủy/interruption và audio routes; GV3 vẫn mở.

## Báo cáo retest iPhone sau reload — 14/10/2026

- Người dùng mở `exp://192.168.100.36:8089` trong Expo Go sau reload và xác nhận lượt voice thứ hai liên tiếp hiện transcript, câu trả lời đúng và nghe được audio. Đây là bằng chứng người dùng báo cho một lần ghi âm/nhận dạng thực; meter ở chính lượt hai và native log chưa được xác nhận.
- `npm test` 161/161, typecheck, lint và Expo dependency check đạt.
- GV3 vẫn mở cho kiểm tra hủy/interruption/quyền/input route và trạng thái meter trên iPhone; không coi AVD là bằng chứng mic iOS.
