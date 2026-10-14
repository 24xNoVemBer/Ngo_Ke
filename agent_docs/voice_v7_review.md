# Voice V7 — Nghiệm thu và preview

## Bằng chứng mới — 14/10/2026

- Người dùng xác nhận lượt voice thứ hai liên tiếp trên iPhone có meter chạy, transcript và Q&A đúng, audio trả lời nghe được. Lỗi mất meter không tái hiện trong retest này; đây là một happy path người dùng báo, chưa có trace độc lập.
- APK đã cài/chạy trên AVD API 37 trước sửa phủ định (`com.valentino241.ngokedemo`, 121.246.156 byte, SHA-256 `301F0654052A537324A08240F02C1DA223D99EBACCD841A573A20C3375B0EE36`). Đã điều hướng Landing → Home → Ngõ Phất Lộc → Q&A điểm 01; kiểm reader/player, typed answer/unknown, drawer/bàn phím và recorder. Đây là UI logic trên APK cũ, không phải kiểm bản sửa intent mới.
- Android release APK mới sau sửa phủ định ở cả voice và Plan: 121.246.512 byte, SHA-256 `BA973B5F23550367191A3A5ED004FD411CEF6D90ABB5C0FB5A132AA4897221D2`. Build thành công, cài và mở trên AVD API 37.
- Trên APK mới, đã chọn ẩm thực + 30 phút, nhập “Không đi ẩm thực trong 30 phút”, rồi bấm Dùng. AVD xác nhận topic cũ bị xóa, thời lượng 30 phút còn nguyên, card picks biến mất và app yêu cầu chọn chủ đề; không có kết quả ẩm thực stale.
- Ảnh mới: `agent_docs/evidence/voice/android-emulator/android37-release-negated-plan-result-2026-10-14.png`. Đây là kiểm Plan bằng text entry trên emulator, không phải STT hoặc audio thật.
- Recheck cùng APK: story player tiến đến `00:02` rồi pause; mic start→Hủy→start lần hai→Hủy và dock trở lại `Nhấn để hỏi`. Ảnh `android37-source-release-player-playing-2026-10-14.png`, `android37-source-release-recorder-second-start-2026-10-14.png`, `android37-source-release-recorder-second-cancel-2026-10-14.png`. AVD `-no-audio`, nên thanh meter phẳng không chứng minh có tín hiệu; không gửi clip hoặc chạy STT.
- Background failure path trên cùng APK: trong lúc AppOps xác nhận RECORD_AUDIO đang chạy, bấm Home đưa Launcher lên và kết thúc operation sau 3,083 ms; mở app lại thấy dock idle, không tự thu tiếp. Ảnh `android37-source-release-recorder-background-idle-appops-2026-10-14.png`; đây là lifecycle test AVD `-no-audio`, không kiểm call/audio route hay iOS.
- Background player trên cùng APK: từ `00:01`/Pause bấm Home rồi mở lại; player ở `Sẵn sàng · 00:23`, Play và 0%, không resume. Ảnh `android37-source-release-player-background-active-2026-10-14.png` và `android37-source-release-player-background-return-2026-10-14.png`. Không có audio hardware trong AVD.
- Recorder vào trạng thái thu, chạm giới hạn `00:19`, Back/Hủy cleanup và ảnh player/Q&A thuộc APK ngay trước đó (`301F0654...5B0EE36`). AVD chạy `-no-audio`, nên không xác nhận tín hiệu mic thật hoặc playback có tiếng.
- `npm test` 166/166, typecheck, lint, Expo dependency check pass. iOS/Android exports hiện tại là `index-9873bd6015e99b5d4350b5d75ac9316a.hbc` (2.455.227 byte) và `index-11ec7bf0812d650912b932ceb0b89a21.hbc` (2.455.453 byte); 34/34 catalogue audio hashes khớp nguồn ở mỗi platform. Đây không phải IPA.
- Recheck Metro `:8081`: manifest và iOS bundle HTTP 200, bundle 6.062.091 ký tự có helper phủ định và gateway URL; `/health` trên `192.168.100.36:8788` ready. Người dùng để sau việc reload `exp://192.168.100.36:8081` trên iPhone.
- Mic start/Hủy và stress 20 vòng thuộc APK trước đó `0F43437B...53F9`: AppOps xác nhận 20/20 start và 20/20 dừng; không gửi clip. PSS 168,357 KB trước, 182,101 KB ngay sau, 171,789 KB sau 12 giây idle; không chứng minh leak-free.
- Regression xác nhận Q&A không bị nuốt khi Plan mở, slot mơ hồ không dùng lại giá trị cũ, và ô nhập tay không giữ chủ đề bị phủ định.
- Gateway smoke chạy lại đạt với Node 24.14.1/faster-whisper 1.2.1 và clip TTS tổng hợp local 19,15 giây; abort/retry, quota và media guards pass.
- Expo exports ở các snapshot cũ hơn đã được supersede bởi hai HBC export nêu trên; cả hai chỉ là JS assets, không phải IPA.
- Năm POST warm cùng clip TTS tổng hợp 19,15 giây tới gateway đều thành công, p50 7,536 ms/p95 nearest-rank 7,727 ms; đây chỉ là server/LAN đo warm, không phải latency mic→transcript→answer trên thiết bị.
- Vẫn mở: speech E2E trên đủ sáu chương và failure paths, VoiceOver/TalkBack thật, audio routes/interruption, QC nghe tay 34 clip, hiệu năng trên thiết bị và xác nhận bundle iPhone mới. Người dùng đã xác nhận happy path lượt thứ hai trên iPhone ở lần test trước; bundle `:8081` mới chưa được reload theo yêu cầu để sau. Không đánh dấu GV7 hoàn tất.

## Snapshot sau retest lượt hai, trước playback fallback mới — 14/10/2026 (đã supersede)

- Người dùng xác nhận sau khi reload Expo Go tại `exp://192.168.100.36:8089`, lượt voice thứ hai có meter chạy, transcript, câu trả lời đúng và phát tiếng. Đây là bằng chứng trên iPhone do người dùng báo; không có raw audio, server log, model/OS hay node cụ thể để đối chiếu.
- Dock voice gọi `AccessibilityInfo.announceForAccessibility` theo thay đổi stage (bật mic, thu, đã thu, lưu, xử lý). Timer không nằm trong dependency nên không đọc lại mỗi giây; UI regression kiểm sequence và xác nhận timer tick không phát announcement mới.
- `npm test` 162/162, typecheck, lint, Expo dependency check và `git diff --check` pass. iOS export `index-0476f928e945a4013b39391ae68ad762.js` (1,073 modules) và Android export `index-95b2dbb411a1c5b752c11c064bbce29b.js` (1,068 modules) pass. Metro `:8081` iOS bundle HTTP 200, 6,062,657 chars, có gateway URL và stage announcement; Metro `:8089` hiện timeout từ host. Gateway `/health` ready.
- Chưa kiểm trên iPhone sau khi mở `:8081`; chưa thử VoiceOver/TalkBack thật, audio routes/interruption, mic trên đủ sáu chương, nghe tay/QC 34 clip hoặc đo hiệu năng. Kết quả Expo Go trước đó không đóng GV7; native iOS build cũng chưa có.

## Revalidation hiện trạng — 14/10/2026

- User confirms the second consecutive iPhone voice turn had a moving meter, showed the transcript and correct Q&A answer, and played audible answer audio. This is one manual real-device STT→Q&A→playback success; no log/raw audio was captured.
- Latest mobile revalidation: `npm test` 161/161, typecheck, lint and Expo dependency check pass. iOS/Android JS exports also pass (1,073/1,068 modules); both generated bundles contain the gateway URL. They are exports, not native builds.
- Current Metro `:8089` reports running, but its manifest times out and the iOS bundle is 6,069,092 bytes without the gateway URL. A separate existing Metro for this app on `:8081` serves the iOS manifest with HTTP 200; its 6,068,958-byte bundle contains the gateway URL and recorder/player guards. Candidate preview `exp://192.168.100.36:8081` still needs a physical iPhone reload/STT check.
- Android JS export initially hit Node zone-allocation OOM while stale Metro `:8087` consumed memory. Stopped only that unresponsive Metro process; the retry completed. `:8081` and `:8089` were left running.
- Full mobile suite covers all 21 questions/aliases in their owning chapter, cross-chapter unknown results, and transcript→answer-audio UI routing. iOS/Android physical audio paths, six-chapter speech coverage, and device performance remain open.

- Chạy lại `npm test`: **159/159**; `npm run typecheck`, `npm run lint`, `npx expo install --check` đều đạt.
- `npm run build:ios -- --no-bytecode` vừa xuất thành công bundle iOS 1.6 MB / 1,073 modules tại `mobile/dist/ios/_expo/static/js/ios/index-51a74f280fc4c08fed13fd3e5186e001.js`; bundle chứa gateway URL. Đây là JS/Hermes export, không phải IPA hoặc bundle Metro đang phục vụ.
- Gateway smoke qua faster-whisper 1.2.1 với clip TTS tổng hợp cục bộ 19.15 giây: transcript thật được trả; abort/retry với turnId mới, quota 429, format, duration và silence guards đều pass. Không dùng ghi âm cá nhân.
- V1 validator kiểm lại **34/34** clip (7.0 phút, 5.04 MB); hash/text/node/revision, MP3 48 kHz mono, duration và level đạt. Đây không phải QC nghe: các mục trong `voice_v1_listening_checklist.md` vẫn chưa được người nghe đánh dấu.
- APK trong snapshot cũ có SHA-256 `33A094762839B03904BDD9872C08EB1046B37E14C87C1091853B21535BBE6295`. Bằng chứng APK mới nhất và kiểm tra recorder start/cancel được cập nhật ở đầu tài liệu; không gửi lời nói và không tuyên bố STT/Q&A Android E2E.
- Gateway `/health` trả `ready`. Metro `:8089/status` phản hồi nhưng bundle iOS timeout sau 90 giây và lần thử lại 210 giây; bundle gần nhất từng đọc được không có URL gateway. Restart Metro với URL bị tool review từ chối và không được bypass. Cần người dùng khởi động lại Metro, reload Expo Go rồi mới kiểm được iPhone.
- **GV3/GV5/GV7 còn mở:** một lượt iPhone thứ hai→transcript→đúng Q&A được người dùng xác nhận; chưa ghi nhận phát audio câu trả lời đó, coverage sáu chương, các failure paths, nghe duyệt 34 clip, iOS/native audio routes/accessibility và performance thật.

## Latest Android second-turn smoke — 14/10/2026

- Built and installed APK `mobile/android/app/build/outputs/apk/release/app-release.apk`, 121,245,016 bytes, SHA-256 `1C0F0DCEBA8523EA871E9240D42E933ED644AEF83B3B14DC031A65DBEC717D46`.
- On the API 37 AVD, the answer player showed 00:04/00:10 with Pause visible. Tapping the mic stopped it and showed a live recording meter. After Cancel, a second mic start also showed the recording meter. Both clips were canceled locally; neither was uploaded.
- Android release bundle has no gateway URL; Metro `:8089/status` did not respond. This does not verify STT, Q&A, or the physical iPhone report. GV3/GV5/GV7 remain open.

## Fresh Android release and native player-to-mic smoke — 14/10/2026

- Android release build succeeded (377 tasks; 30 executed, 347 up-to-date). APK 121,244,960 bytes, SHA-256 `AC05A7E98F4A42B51021D2FFF554091764766FB5033ADABD901D5AE5BC4D7831`; installed and launched on API 37 AVD.
- On explicitly verified package `com.valentino241.ngokedemo`, the story player showed `00:00` with Pause; mic start paused playback and showed a live recorder meter. Cancel returned to idle. Screenshots: [playing](evidence/voice/android-emulator/android37-com-player-playing-2026-10-14.png), [recording](evidence/voice/android-emulator/android37-com-mic-recording-2026-10-14.png), [canceled](evidence/voice/android-emulator/android37-com-mic-cancelled-2026-10-14.png). No recording was sent; APK had no gateway URL, so no STT or Q&A was tested.
- On the same package, denying Android mic permission showed the app fallback; after permission was granted again through the emulator, Retry started recording and Cancel returned idle. Recovery screenshot: [recorder after permission grant](evidence/voice/android-emulator/android37-permission-recovery-2026-10-14.png). No recording was submitted.
- No fatal/ReactNativeJS errors appeared after the latest native Android checks. The iPhone second-turn case remains unverified; Metro `:8089` now responds but has no STT base URL, and GV3/GV5/GV7 remain open.

## 20-cycle Android recorder stress — 14/10/2026

- On the current release APK/package `com.valentino241.ngokedemo` (Android API 37 AVD), ran 20 start/cancel cycles. `cmd appops get ... RECORD_AUDIO` reported `(running)` before every cancel and no active recording after each stop; final dock state was idle.
- Process PSS: 167,959 KB before, 176,922 KB after cycle 10, 170,762 KB before cycle 11, and 176,475 KB after cycle 20. This fluctuates rather than rising monotonically, but is not a formal memory-leak or listener-count proof. No speech was submitted; logcat had zero fatal lines.
- This supports Android lifecycle stability only. Physical iPhone meter, real speech→STT→answer, audio routes and V7 hardware performance remain pending.

## Second-turn pending auto-play race guard — 14/10/2026

- A stale callback could start automatic answer playback after the user had already tapped the mic for the next turn. `QaScreen` now invalidates pending auto-play when a newer voice or playback intent starts.
- UI flow 28/28; full `npm test` 156/156; typecheck/lint and iOS JavaScript export pass. Export bundle: `index-41c76f4c413cbc235bdc07e89fb7df20.hbc`. `git diff --check` is clean.
- Gateway `/health` is ready. Metro `:8089` is not listening, so there is no live Expo Go bundle for the iPhone retest. Android AVD tests from the prior check do not prove mic-to-answer on iPhone. The guard is a plausible fix, not a device-confirmed root cause; GV3/GV5/GV7 remain open.

## Second-turn pause acknowledgement fix — 14/10/2026

- A likely race was fixed: pause returned before native playback confirmed it had stopped, while the next mic turn changed audio mode and prepared a recorder. The helper now waits up to one second for `player.playing` to become false; on timeout mic start is blocked with retry guidance. Answer auto-play also waits for stop confirmation.
- `npm test` 154/154; typecheck/lint and iOS JS export (1,073 modules) pass. Export is not an IPA or iPhone test. Metro `:8087` `/status` times out; `:8089`/`:8090` are stopped. Gateway `/health` is ready.
- Android release build succeeded (377 tasks; 26 executed, 351 up-to-date), APK 121,244,632 bytes, SHA-256 `E0680D8A78513442364687AC084AE8809F66BB69BD9A6631A8815A7DF5A0AB47`; installed/launched on API 37 AVD. The AVD check did not submit speech and is not iPhone evidence. Retest using `docs/VOICE_HANDOFF.md`; GV3/GV5/GV7 remain open. Audio routes, accessibility, human listening and performance are incomplete.

## Revalidation after second-turn pause fix — 14/10/2026

- Android release build completed successfully (377 tasks; 30 executed, 347 up-to-date), APK 121,243,192 bytes, SHA-256 `C21ACE29D356F779A16219CCA8AEE75527B805B983F90B8B13A3C15A0751CA0C`; installed and launched on API 37 AVD with no fatal log. [Launch screenshot](evidence/voice/android-emulator/android37-native-release-second-turn-fix-2026-10-14.png).
- `npm test` 152/152, typecheck/lint and iOS JS export passed. The export is not an IPA or an iPhone test. The iOS Metro bundle request timed out; no live Expo Go preview is verified. Gateway `/health` is ready.
- Retest after starting Metro using `docs/VOICE_HANDOFF.md`, then repeat answer → mic → follow-up on iPhone. GV3/GV5/GV7 remain open; audio routes, accessibility, human listening and performance are incomplete.

## Revalidation sau native start guard và chữ lớn — 14/10/2026

- `npm test` 152/152, typecheck/lint và iOS + Android JS exports đạt. Gateway `/health` và Metro `:8090/status` trả HTTP 200; Expo Go preview dùng `exp://192.168.100.36:8090`. Metro iOS bundle HTTP 200 (6,064,803 bytes) includes recorder and stale-playback guards.
- Recorder stage nay chờ tối đa 1 giây để xác nhận native `isRecording`; playback bị bỏ nếu đã lỗi thời khi đổi audio mode. Điều này chưa xác minh microphone metering hoặc STT ở lượt hai trên iPhone. AVD/APK evidence vẫn không thay cho kiểm thử trên iPhone thật.
- Android API 37 AVD tại fontScale 2.0 dùng danh sách điểm dọc có thể cuộn, nhãn wrap và dock còn thao tác được; ảnh `android-api37-font-scale-200-home-trail-2026-10-14.png`. Landing được kiểm ở đầu và sau cuộn: `android-api37-font-scale-200-landing-top-2026-10-14.png`, `android-api37-font-scale-200-landing-scrolled-2026-10-14.png`.
- APK đang lưu trong thư mục build có trước native-start guard; dùng Expo Go LAN preview để thử đúng source mới. Điện thoại iPhone chưa retest lỗi lượt hai; Expo JS export không thay cho iOS native/device proof. TalkBack/VoiceOver, Dynamic Type trên máy thật, audio routes và hiệu năng vẫn pending.

## Expo Go gateway configuration and recorder re-entry — 14/10/2026

- Detected that an initial Metro restart lacked `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL`, leaving the Expo Go preview without a usable STT endpoint. Restarted Metro with `http://192.168.100.36:8788`; `/status` and gateway `/health` are ready. iOS and Android bundles both return HTTP 200 and include the configured gateway URL and awaited player stop.
- Expo Go loaded on the Android API 37 AVD. Playing the answer then starting the recorder showed the meter; Cancel followed by another recorder start also showed the meter. Both clips were canceled and not submitted; no recent JS fatal/load error was found. Screenshots are in `agent_docs/evidence/voice/android-emulator/`.
- Latest checks: `npm test` 144/144; typecheck, lint, `git diff --check`, and iOS JS export pass. This verifies Expo Go bundle delivery and Android emulator recorder re-entry after Cancel only.
- **Still pending:** user-reported second-turn failure has not been retested on the physical iPhone; no spoken clip was submitted in this AVD run. Real iOS/Android speech→STT→exact follow-up→answer, routes/accessibility/performance, and human listening are not proven; GV5/GV7 remain open.

## Revalidation sau auto replay — 14/10/2026

- Android release APK hiện tại: 121,235,376 byte, SHA-256 `20154EE9B845396E43ED7F76AAD5AFD9C3639A870E017D23FF670E469E531773`; build thành công, cài và mở được trên Android API 37 AVD. Đã đi từ landing tới Q&A điểm 01, chọn chip hỏi và thấy answer player ở Ready, không tự phát; đã chủ động Play, quan sát audio 9 giây quay về 00:00 và tiếp tục phát, rồi Stop về Ready. Ảnh/chi tiết: `agent_docs/evidence/voice/android-emulator/README.md` và các file `android37-latest-build-*.png`. Không thấy marker fatal/ReactNativeJS error trong logcat 800 dòng gần nhất.
- Auto replay/Stop 23 giây đã được kiểm trước đó trên AVD; bằng chứng: `agent_docs/evidence/voice/android-emulator/android37-auto-loop-after-one-pass-2026-10-14.png`, `android37-auto-loop-stop-2026-10-14.png`. Trên APK mới ở trên cũng đã xác nhận answer 9 giây tự lặp rồi Stop về Ready.
- Sau sửa iOS/meter/transcript ngày 14/10: `npm test` 143/143, typecheck, lint, dependency check và Android/iOS JS exports pass. Gateway `/health` trả `ready`. Metro cổng 8089 hiện trả `/status`; iOS bundle tải thành công và có gateway LAN, thang meter mới và disclosure transcript. Đây là bằng chứng bundle local, chưa chứng minh iPhone đã tải hay gửi request.
- Kiểm tra tiếp ngày 14/10: Expo dependency check và iOS JS export pass; V1 validator đạt 34/34 clip; local gateway smoke test pass. Đây là kiểm tự động, không phải IPA, kiểm thử iPhone hoặc nghe tay.
- Sau khi reload Expo Go với bundle mới, người dùng xác nhận trên iPhone meter và câu trả lời đều chạy trong lần thử voice. Đây là happy path được người dùng báo lại; chưa có transcript nguyên văn, gateway log, OS/model iPhone hay video để đối chiếu độc lập. Audio route, accessibility trên iOS và performance vẫn pending; GV5/GV7 còn mở.

## Revalidation after Android codec fix — 13/10/2026

- Current APK: 121,233,212 bytes, SHA-256 `159EE52016DCC4F5B5B5C9DC697AB4FD20B0294D99B13A64CC74B5DED38F6D98`; release build `BUILD SUCCESSFUL` (377 tasks; 26 executed, 351 up-to-date). It was installed on API 37 AVD and exercised through real recorder submit.
- Found and fixed recorder configuration falling back to AMR-NB. After the fix, the uploaded clip passed gateway media validation; the actual AVD had no intelligible speech, so faster-whisper correctly returned `NO_SPEECH` and the UI showed retry guidance. [Screenshot](evidence/voice/android-avd-stt-no-speech-2026-10-13.png).
- Full gateway smoke test passed with local synthetic TTS audio; `npm test` 138/138, typecheck and lint passed. Expo Go Metro is now serving on `exp://<DEV_LAN_IP>:8087`; `/status` is HTTP 200 and iOS/Android bundles (6,048,798 / 6,050,971 bytes) include `http://<DEV_LAN_IP>:8788`. Gateway `/health` is HTTP 200 on that private interface.
- The emulator's silence is not proof of spoken STT, Q&A answer playback or physical microphone quality. Phone/iOS hardware, audio routes, accessibility audit and performance measurements remain pending; GV5/GV7 stay open.

## Snapshot trước khi kiểm codec recorder — 13/10/2026 (đã supersede)

- APK LAN-preview: 121,232,376 byte; SHA-256 `C30FA2718E2A89E0818791015596AB3C41D21E1D0450B5F4ECD95A4C85D34A12`. ZIP xác nhận bundle trỏ tới `http://<DEV_LAN_IP>:8788`, có accessibility labels, timeout fix và đủ 34 MP3; bundle hash trong APK khớp output bundle vừa build.
- Android/iOS JS exports chạy thành công với IP mới. Gradle build `:app:assembleRelease --offline --no-daemon --max-workers=1` **BUILD SUCCESSFUL**; thay URL được thêm làm task input và đã xác minh task bundle chạy lại khi đổi/khôi phục URL.
- Metro LAN preview đã được khởi động lại với gateway URL hiện tại; `/status` running, iOS/Android bundles trả HTTP 200 và nhúng gateway URL cùng Live fallback. Expo Go: `exp://<DEV_LAN_IP>:8086`; chưa mở trên điện thoại thật.
- `npm test` 135/135; typecheck/lint/dependency check pass. Gateway smoke pass cho malformed, short, silence và too-long; timeout test bao phủ body response. APK release build pass trong 1m58s, 377 tasks (30 executed, 347 up-to-date).
- Gateway chạy tại `<DEV_LAN_IP>:8788`, PID 42784. APK cài/mở được trên AVD `Medium_Phone_API_37.0`; ảnh [Q&A](evidence/voice/android37-qa-screen-2026-10-13.png) và [text reader mở](evidence/voice/android37-reader-open-2026-10-13.png) ghi trạng thái native. Chưa thử mic → gateway/answer/audio; AVD dùng `-no-audio`, không gửi clip mic. Điện thoại thật/iOS, nghe tay 34 clip và kiểm audio route/accessibility/performance vẫn pending; GV7 còn mở.

Các IP cũ và hash cũ trong snapshot phía dưới đã được supersede.

**Ngày:** 13/10/2026
**Trạng thái:** APK Android LAN-preview mới (121,231,544 byte; SHA-256 `1020E39520285521871741E2BCE198D14E018DDEFC06B5A82258BBEE24773362`) đã được xác minh có URL `<DEV_LAN_IP>:8788`, accessibility labels và 34 MP3. Gateway process chạy và smoke synthetic STT/guard đã đạt. ADB không thấy thiết bị nên chưa cài APK mới; điện thoại thật/iOS chưa nghiệm thu.
**Gate GV7:** còn mở. Không đánh dấu luồng hoàn thiện từ đầu đến cuối.

## Revalidation mới nhất — 13/10/2026

- Android/iOS Expo exports exit 0 với `--no-bytecode --clear` và URL `<DEV_LAN_IP>:8788`; mỗi lần export bundle riêng, không phải native binary.
- Gradle không invalidates native JS bundle theo biến URL môi trường; lần assemble incremental giữ IP cũ. Buộc `:app:createBundleReleaseJsAndAssets --rerun-tasks` (2 phút 40 giây), xác nhận bundle SHA `D24154D75031FC2ABF428DC1BF687C6C16820E88508C15E92E0A3DC05B725A73`, rồi assemble thành công 3 phút 26 giây (377 tasks, 38 executed, 339 up-to-date).
- APK cuối 121,231,544 byte, SHA-256 `1020E39520285521871741E2BCE198D14E018DDEFC06B5A82258BBEE24773362`; ZIP chứa 34 MP3, `http://<DEV_LAN_IP>:8788`, không có URL cũ, và `accessibilityLabel`. `adb devices -l` rỗng nên chưa cài APK mới.
- Gateway Node 24.14.1/faster-whisper 1.2.1 bind riêng `<DEV_LAN_IP>:8788`; synthetic clip 18.81s trả transcript HTTP 200/context echo đúng, invalid format trả 415, clip 21s trả 400 `AUDIO_TOO_LONG`. Transcript còn lỗi từ; phone/app mic E2E chưa chạy.

## Bằng chứng đạt được

- `npm test`: 131/131; typecheck, lint và Expo dependency check exit 0. Android/iOS JS exports pass (1,064/1,069 modules) và đều nhúng URL LAN khi build với biến môi trường.
- APK LAN cũ đã cài/chạy trên API 37 emulator; emulator evidence bên dưới thuộc binary đó. APK build cuối hiện có hash/endpoint ở phần Revalidation mới nhất phía trên và chưa được cài vì ADB rỗng.
- Native emulator screenshots và nhãn thiết bị/state: `agent_docs/evidence/voice/android-emulator/README.md`. Trên APK LAN đã chạy ở lần kiểm trước, guard dừng ở 19.5s trước hard limit 20s, UI giữ `00:19` và chờ Gửi/Hủy; Hủy đưa dock về idle; Back khi đang thu rời màn và AppOps ghi 1.814 giây. Không gửi clip mic. Bằng chứng này thuộc binary trước APK mới; first-permission-grant screenshot cũng từ build liền trước.
- Gateway smoke hiện tại: clip TTS tổng hợp 18.81s được nhận; clip PCM 21s trả HTTP 400 `AUDIO_TOO_LONG`; invalid-format trả 415. Không dùng audio cá nhân.
- Metro preview không được khởi động: thao tác chạy `npx expo start --lan --port 8086 --go` bị công cụ từ chối theo policy. Expo Android export xác nhận URL env trong bundle; native APK LAN preview đã cài/chạy thay thế Expo Go cho bước thử Android. Phone và app-to-gateway từ mic vẫn pending. Cách mở APK/khởi động Metro thủ công ở `docs/VOICE_HANDOFF.md`.
- Trên APK vừa cài, mở app và chuyển từ màn đầu đến Q&A, đổi điểm; player reset và app không crash. Kiểm tra trực quan trên point 01: player controls phát thật; text drawer còn nhìn thấy cùng keyboard; câu gõ không dấu match câu hỏi đã duyệt của point 01; answer đúng hiện ra, không tự phát cho tới khi bấm Play.
- UI logic cho cancel, stale context, exact Q&A, fallback, Plan/QR/GPS và hidden text có unit/UI tests; đây không phải native device proof.
- Accessibility audit: thêm labels cho sáu Pressable thiếu nhãn trong `QaScreen`; 17/17 Pressable hiện có role/label. `uiFlows.test.mjs` assertions, 131 tests tổng, typecheck và lint đều đạt. APK mới chứa các label theo kiểm tra bundle; kiểm tra native/TalkBack trên thiết bị vẫn pending.

## Chưa kiểm được

- Android SDK/ADB/emulator đã dùng được qua `<USER_HOME>\AppData\Local\Android\Sdk`; không truy cập được iPhone hoặc điện thoại Android vật lý từ môi trường này.
- Emulator đã kiểm fontScale 2.0 trên Landing, AlleySelect, story screen và point-01 typed-answer flow; text drawer, Gửi và gợi ý vẫn hiển thị khi software IME mở. Đã phát hiện rồi sửa hàng tiêu đề Home chồng chữ, nhãn DEMO và placeholder tìm kiếm bị cắt. Bằng chứng trước/sau ở `agent_docs/evidence/voice/android-emulator/README.md`. Chưa kiểm Dynamic Type trên phone, TalkBack/VoiceOver, Reduce Motion, cửa sổ thấp hoặc nghe tay 34 clip.
- Chưa kiểm lời nói rõ/codec của clip thu, mic trên phone, loa/tai nghe/Bluetooth/silent mode/call/lock/background trên phone. Keyboard large-text đạt trên emulator trong luồng gõ Q&A; chưa xác minh trên thiết bị thật.
- Chưa đo release→transcript, transcript→audio start, stop/cancel responsiveness, p50/p95, frame time/jank, memory/listeners qua 20 vòng. Không suy ra hiệu năng thiết bị từ Expo export hay máy dev.
- APK V6 mới nhất (SHA-256 `301F0654052A537324A08240F02C1DA223D99EBACCD841A573A20C3375B0EE36`) đã cài/chạy trên API 37 AVD; bundle chứa accessibility labels. TalkBack/VoiceOver trên thiết bị và xác nhận labels bằng screen reader vẫn pending. JDK 17 release build pass sau khi làm mới CMake cache sinh tự động.
- `npm audit` báo 23 advisory (8 moderate, 15 high) trong dependency tree. Đề xuất tự động của npm gồm downgrade Expo/RN nhiều major; không chạy `audit fix --force` vì sẽ phá tương thích SDK 57. Cần rà dependency/security riêng trước khi public release.
- Có screenshot native emulator ở `agent_docs/evidence/voice/android-emulator/`; chúng là bằng chứng emulator, không thay proof điện thoại thật hoặc iOS.

**Bước đóng GV7:** khi người dùng sẵn sàng, reload Expo Go tại `exp://192.168.100.36:8081` trên cùng Wi-Fi rồi kiểm voice tiếp. Status vẫn là *emulator UI/lifecycle pass; latest iPhone bundle check, full speech coverage, iOS/audio, accessibility, listening QC và performance pending*.

## Bundle và giới hạn kiểm tra mới nhất — 14/10/2026

- Metro LAN `exp://192.168.100.36:8089` phục vụ iOS bundle HTTP 200 (6,068,742 byte) có guard mới; gateway `/health` cũng trả HTTP 200. Bundle thiếu gateway URL nên chỉ đủ kiểm player/recorder/meter, chưa đủ gửi STT.
- iPhone retest, 6-chapter speech E2E, audio routes/accessibility trên điện thoại và latency/performance p50/p95 vẫn pending. Không coi iOS JS export, bundle HTTP hay AVD là proof phần cứng.

## Bổ sung sau khi sửa handoff mic — 14/10/2026

- `npm test` 159/159, typecheck, lint và iOS JS export đạt; export là Hermes bundle 1073 modules, không phải IPA. Bundle Metro LAN 8089 tải được và có guard settle mới, nhưng thiếu gateway URL nên không kiểm được STT/câu trả lời trong lượt hai.
- Người dùng báo lượt đầu chạy, lượt hai thiếu meter và lỗi. Android stress 20 start/cancel cùng player→mic checks không tái hiện; chưa có iPhone native log hay retest sau bản sửa. GV7 chưa nghiệm thu.

## Kiểm tra export và preview hiện tại — 14/10/2026

- Bộ test mới nhất: `npm test` 159/159, typecheck, lint, Expo dependency check và `git diff --check` pass. Android/iOS JS exports từ `.env.local` thành công (1068/1073 modules) và nhúng URL gateway; không tạo IPA/APK trong lượt này.
- Metro `:8089/status` trả `running` và bundle iOS hiện trả HTTP 200 (6,062,157 ký tự) nhưng thiếu URL gateway. Export mới không tự cập nhật Metro đang chạy; cần restart/reload Expo Go. Gateway `/health` ready; lỗi lượt hai trên iPhone chưa retest.
- Android APK `F43B2BAD13E1C938F2B07D0AA4F3002B6D2695BE25E1C13275DB86CAE891138B` cài/mở được trên AVD API 37 và mic được cấp quyền; lượt nói không được gửi. iOS thật, real STT/Q&A, audio routes, human listening, accessibility/performance trên thiết bị vẫn pending; GV7 chưa đóng.

## iPhone Expo Go follow-up retest — 14/10/2026

- Người dùng thử `exp://192.168.100.36:8089` sau reload và xác nhận chuỗi hai lượt voice trên iPhone: lượt thứ hai có meter chạy, hiện transcript, đúng câu trả lời và nghe được tiếng. Đây là user-reported device evidence; chưa có model/OS/build hoặc server trace.
- `npm test` 161/161, typecheck, lint và Expo dependency check pass. Metro manifest request từ host timeout nên chưa đối chiếu được bundle/config đang phục vụ với kết quả thiết bị.
- GV7 vẫn mở: chưa kiểm iPhone audio routes, silent/Bluetooth/call/background, screen reader/Reduce Motion, độ trễ/performance p50/p95, nghe tay 34 audio, hoặc Android máy thật; chưa có iOS native binary. AVD stress/lifecycle không thay cho các kiểm tra này.
