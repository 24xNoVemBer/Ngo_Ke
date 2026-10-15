# Voice V7 — Nghiệm thu và preview

## Current revision 8b318b acceptance recheck — 15/10/2026

- Mobile tests 171/171, typecheck, lint, Expo dependency check, catalogue 34/34 and gateway synthetic smoke pass. Fresh iOS Expo export succeeded (1,073 modules); current HBC `index-34b34ad94926be47472ea9cee2796235.hbc`, SHA-256 `d285830810720d64dbd0f5c0579bc6f0cb8b4c26185853795f2790b8333dc477`.
- Added regressions for normalized question/alias collisions and for native auto-repeat on manually started story playback; the current dataset has 21 questions and 82 aliases with no normalized collisions.
- Current Android release APK is 121,249,588 bytes, SHA-256 `2f15c3c0992434a42b13cb4b09c363826542ddfa215eb8f3e9d5db03e22a1e0d`; installed base hash matches. It embeds dataset revision `8b318b4e9955e3b7affe72cb21ea08cf8123a616eeab2eb1420ab105c7b65e6b` and all 34 MP3 hashes match the source catalogue. Native typed Q&A/follow-up/player UI evidence: [`android37-native-release-final-2f15c3-2026-10-15`](evidence/voice/android37-native-release-final-2f15c3-2026-10-15/README.md).
- On this APK, 20 recorder start/cancel cycles showed AppOps active/stopped 20/20, with process PID stable. One emulator PSS sample rose 12,387 KB; it is insufficient to infer a leak or phone performance.
- Metro status, iOS manifest and launch bundle return HTTP 200 over LAN; the served bundle includes current revision, gateway URL and mic-permission recovery copy, and excludes stale disconnected copy. Gateway `/health` is ready. The iPhone has not reloaded this bundle.
- **Open:** human listening, iPhone current-bundle spoken six-chapter coverage, physical mic/audio route and interruption checks, TalkBack/VoiceOver, and hardware performance. AVD has no audio. Host/export and AVD UI evidence do not close these device gates.

## Fresh host and Android release recheck — 15/10/2026

- Metro `:8081` was live, while the gateway had stopped between sessions. Restarted the gateway bound to `0.0.0.0:8788`; LAN health reports ready on Node 24.14.1 / faster-whisper 1.2.1.
- Expo Go iOS and Android manifests plus launch bundles both returned HTTP 200 over LAN. Bundles include the configured gateway URL; iOS also includes `MIC_PERMISSION_BLOCKED` recovery and neither includes the stale “Chưa kết nối máy nhận giọng nói” text. This verifies bundle delivery/configuration, not an iPhone reload.
- Current mobile verification is 170/170 tests, typecheck, lint, Expo dependency compatibility, 34/34 catalogue validation, gateway synthetic-audio smoke, and `git diff --check` pass.
- Latest Android release APK after the V6 ASR-alias fix is 121,248,988 bytes (`F6CD6178BD99D303E2C714963B3F414314D7DE9B883098976648DA9A2CF20B49`). It installed on API 37 and the installed base APK hash matched. Home → alley → chapter 1 → answer worked; on this build, the answer player advanced to 00:04/00:10 and stayed active when the story text opened. Evidence: `evidence/voice/android37-native-release-v6-negation-2026-10-15/README.md`.
- The rebuilt APK contains 34 MP3s whose SHA-256 multiset matches source exactly. `npm run build:ios` also passed after the parser change; exported Hermes bundle `index-e44b07b146d3b8e5f8490498dfdad2b4.hbc` hashes to `DB6FE8BE6FFA17E4B4B4E596440B84B34A89164DBAA429E1859037522824175F`. This is an export, not an iPhone installation.
- At Android font scale 2.0, all six chapter selectors, player/text controls, mic/text-input/notebook controls, and four scrolled question suggestions remained reachable; the mic start/cancel interaction also remained usable. Font scale was restored to 1.0. This does not test TalkBack or audio input.
- The 200% screenshot showed the player’s story title truncated; `VoicePlayerBar` no longer forces one line. The rebuilt APK now wraps “Lời kể · Cổng ngõ” fully over two lines with playback controls aligned.
- **Still open:** human listening of all 34 clips; current `:8081` reload and speech retest on iPhone (user deferred); physical audio/mic routes and interruptions; live speech coverage across all six chapters and failure paths; hardware screen-reader and performance checks. The API 37 AVD has no audio and cannot close those gates.

## Restore Metro Expo Go launch bundle — 15/10/2026

- Metro `:8081/status` still answered while the iOS launch asset timed out twice (90s and 230s). Restarted only Metro in the foreground without clearing its transform cache; it loaded `.env.local` and advertised `exp://192.168.100.36:8081`. The gateway process on `:8788` was left running.
- The iOS manifest launch asset then returned HTTP 200 in 9.5s (5,529,995 response bytes); a warm repeat returned HTTP 200 in 0.51s. Bundle content has `192.168.100.36:8788` and `MIC_PERMISSION_BLOCKED`, and does not contain the stale “Chưa kết nối máy nhận giọng nói” message. Gateway health is `ready` on Node 24.14.1/faster-whisper 1.2.1.
- This proves the dev host can serve the current Expo Go bundle; the user has deferred reloading it on iPhone, so device behavior on this bundle is still pending.

## Android SDK 57 Q&A reader/player smoke — 15/10/2026

- Installed release APK matches the local artifact: `com.valentino241.ngokedemo` `0.1.0`, 121,247,816 bytes, SHA-256 `B11555198EBF7CDCD78A8A241E1FFEF4EF5B35B5BB4A5701331055DF46B66083`.
- Home → chapter 1 → “Đây là điểm nào?” displayed the chapter-1 answer. Opening the answer text while its player was active left the text visible as progress advanced through `00:08 / 00:10` and into a replay cycle at `00:07 / 00:10`. Screenshots and method: [`android37-native-sdk57-2026-10-15`](evidence/voice/android37-native-sdk57-2026-10-15/README.md).
- Android Back from Q&A → chapter selector → Home completed on this APK; the process remained present and recent logs contained no fatal RN exception. This is an Android navigation smoke, not iOS evidence for the reported native SafeArea crash.
- AVD has no audio hardware; this does not verify audible playback, mic/STT, iPhone, TalkBack/VoiceOver, or performance. UIAutomator returned `could not get idle state` during animation; its stale XML was discarded.

## Native six-chapter UI sweep — 14/10/2026

- Rechecked the installed API 37 release APK against the local artifact: package `com.valentino241.ngokedemo`, version `0.1.0`, 121,247,808 bytes, installed/local SHA-256 both `D6BB16DCE259002D38D112DACA28E9DD91BF5D0681C005AEC9BB83025E8AB50D`.
- Selected one suggested question in each of the six chapters. The answer source stayed in the selected chapter, the answer player remained Ready without chip autoplay, and answer text remained collapsed. Native screenshots and UIAutomator XML for all six are in [`evidence/voice/android37-six-chapter-ui-2026-10-14`](evidence/voice/android37-six-chapter-ui-2026-10-14/README.md).
- Follow-up UI check opened and collapsed answer text in all six chapters. Each revealed string exactly matched `data/demo.json`; collapse removed it from the UI tree, and the player stayed Ready throughout. Evidence pairs are in [`evidence/voice/android37-six-chapter-reader-2026-10-14`](evidence/voice/android37-six-chapter-reader-2026-10-14/README.md).
- This closes a six-chapter **UI routing** check only. The AVD has no audio hardware; it does not prove microphone signal, STT, audible playback, iPhone behavior, or six-chapter speech E2E. The earlier sweep that expected hidden answer text by default was invalid and is superseded by this correct UI check.

## Android Q&A text/player follow-through — 14/10/2026

- Latest source regression checks after the new duplicate-submit case: full mobile suite 168/168, typecheck, lint and Expo dependency check pass. The change is test-only, so the installed APK remains the unchanged release artifact below.
- Rechecked the installed Android release APK against the local artifact: package `com.valentino241.ngokedemo`, version `0.1.0`, 121,247,808 bytes, installed/local SHA-256 both `D6BB16DCE259002D38D112DACA28E9DD91BF5D0681C005AEC9BB83025E8AB50D`.
- On chapter 6, the first canonical question `qa-letter` opens the exact catalogue answer after tapping the text control. The answer is hidden before the tap. While the answer player was running, opening and collapsing the text kept it in the playing state and did not return progress to zero. Evidence: [text open while playing](evidence/voice/android37-native-release-qa6-answer-text-playing-2026-10-14.png), [text collapsed while playing](evidence/voice/android37-native-release-qa6-answer-text-collapsed-playing-2026-10-14.png).
- The AVD has no audio output. This proves chapter-6 UI selection/text and native player state only; it does not prove audible playback, microphone/STT, all-six-chapter voice coverage, or iPhone behavior. The previous six-chapter visibility sweep was invalid because it asserted hidden-by-default answer text should already be visible.

## Bằng chứng mới — 14/10/2026

- V3 permanent-denial failure path trên APK mới `ED49FF5702BE20002184876F20FB34B828DF7BEFEA1F22A48FCE2F7944DC80E2` (121.247.352 bytes): Android `canAskAgain=false` hiện thông báo riêng + Mở Cài đặt; nút đưa tới trang quyền app. Sau khi cho phép mic trong Settings, retry vào `Đang thu · 00:01`; một lượt tới giới hạn 00:19, Hủy dọn về idle, lượt thu tiếp theo vào `Đang thu · 00:00` rồi Hủy về idle. Runtime permission còn granted. Build `assembleRelease` pass; `npm test` 167/167, typecheck/lint/dependency check pass. AVD `-no-audio`, nên không khẳng định meter/speech/STT.
- Metro `:8081` được khởi động lại sau khi chỉ `/status` phản hồi; hiện manifest và iOS launch asset trả HTTP 200. Source inspection xác nhận `MIC_PERMISSION_BLOCKED`, gateway URL và không còn copy “Chưa kết nối máy nhận giọng nói”. User đã để sau việc reload bundle này trên iPhone.
- Người dùng xác nhận lượt voice thứ hai liên tiếp trên iPhone có meter chạy, transcript và Q&A đúng, audio trả lời nghe được. Lỗi mất meter không tái hiện trong retest này; đây là một happy path người dùng báo, chưa có trace độc lập.
- APK đã cài/chạy trên AVD API 37 trước sửa phủ định (`com.valentino241.ngokedemo`, 121.246.156 byte, SHA-256 `301F0654052A537324A08240F02C1DA223D99EBACCD841A573A20C3375B0EE36`). Đã điều hướng Landing → Home → Ngõ Phất Lộc → Q&A điểm 01; kiểm reader/player, typed answer/unknown, drawer/bàn phím và recorder. Đây là UI logic trên APK cũ, không phải kiểm bản sửa intent mới.
- Android release APK mới sau sửa phủ định ở cả voice và Plan: 121.246.512 byte, SHA-256 `BA973B5F23550367191A3A5ED004FD411CEF6D90ABB5C0FB5A132AA4897221D2`. Build thành công, cài và mở trên AVD API 37.
- Trên APK mới, đã chọn ẩm thực + 30 phút, nhập “Không đi ẩm thực trong 30 phút”, rồi bấm Dùng. AVD xác nhận topic cũ bị xóa, thời lượng 30 phút còn nguyên, card picks biến mất và app yêu cầu chọn chủ đề; không có kết quả ẩm thực stale.
- Ảnh mới: `agent_docs/evidence/voice/android-emulator/android37-release-negated-plan-result-2026-10-14.png`. Đây là kiểm Plan bằng text entry trên emulator, không phải STT hoặc audio thật.
- Recheck cùng APK: story player tiến đến `00:02` rồi pause; mic start→Hủy→start lần hai→Hủy và dock trở lại `Nhấn để hỏi`. Ảnh `android37-source-release-player-playing-2026-10-14.png`, `android37-source-release-recorder-second-start-2026-10-14.png`, `android37-source-release-recorder-second-cancel-2026-10-14.png`. AVD `-no-audio`, nên thanh meter phẳng không chứng minh có tín hiệu; không gửi clip hoặc chạy STT.
- Background failure path trên cùng APK: trong lúc AppOps xác nhận RECORD_AUDIO đang chạy, bấm Home đưa Launcher lên và kết thúc operation sau 3,083 ms; mở app lại thấy dock idle, không tự thu tiếp. Ảnh `android37-source-release-recorder-background-idle-appops-2026-10-14.png`; đây là lifecycle test AVD `-no-audio`, không kiểm call/audio route hay iOS.
- Background player trên cùng APK: từ `00:01`/Pause bấm Home rồi mở lại; player ở `Sẵn sàng · 00:23`, Play và 0%, không resume. Ảnh `android37-source-release-player-background-active-2026-10-14.png` và `android37-source-release-player-background-return-2026-10-14.png`. Không có audio hardware trong AVD.
- Permission failure/recovery trên cùng APK: revoke `RECORD_AUDIO` → OS prompt → “Don’t allow” hiện fallback gõ → “Thử lại bằng giọng nói” mở prompt lại → cấp quyền → recorder hiện `Đang thu · 00:02` → Hủy về idle. Permission được để ở trạng thái granted. Ảnh chi tiết trong `agent_docs/evidence/voice/android-emulator/README.md`; đây là kiểm tra quyền/state trên AVD `-no-audio`, không phải speech hoặc meter proof.
- Recorder vào trạng thái thu, chạm giới hạn `00:19`, Back/Hủy cleanup và ảnh player/Q&A thuộc APK ngay trước đó (`301F0654...5B0EE36`). AVD chạy `-no-audio`, nên không xác nhận tín hiệu mic thật hoặc playback có tiếng.
- Snapshot export/mobile test bên dưới là trước permanent-denial update; latest `npm test` is 167/167 with typecheck/lint/dependency check pass. iOS/Android exports listed there are JS assets, not an IPA.
- Recheck Metro `:8081`: manifest và iOS bundle HTTP 200, bundle 6.062.091 ký tự có helper phủ định và gateway URL; `/health` trên `192.168.100.36:8788` ready. Người dùng để sau việc reload `exp://192.168.100.36:8081` trên iPhone.
- Mic start/Hủy và stress 20 vòng thuộc APK trước đó `0F43437B...53F9`: AppOps xác nhận 20/20 start và 20/20 dừng; không gửi clip. PSS 168,357 KB trước, 182,101 KB ngay sau, 171,789 KB sau 12 giây idle; không chứng minh leak-free.
- Regression xác nhận Q&A không bị nuốt khi Plan mở, slot mơ hồ không dùng lại giá trị cũ, và ô nhập tay không giữ chủ đề bị phủ định.
- Gateway smoke chạy lại đạt với Node 24.14.1/faster-whisper 1.2.1 và clip TTS tổng hợp local 19,15 giây; abort/retry, quota và media guards pass.
- Expo exports ở các snapshot cũ hơn đã được supersede bởi hai HBC export nêu trên; cả hai chỉ là JS assets, không phải IPA.
- Năm POST warm cùng clip TTS tổng hợp 19,15 giây tới gateway đều thành công, p50 7.536 giây/p95 nearest-rank 7.727 giây; đây chỉ là request-to-transcript server/LAN đo warm, không phải latency mic→transcript→answer trên thiết bị.
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

## Trạng thái preview sau khi restart Metro — 14/10/2026

- Gateway LAN `192.168.100.36:8788/health` trả HTTP 200/ready với Node 24.14.1 và faster-whisper 1.2.1. Metro `:8081/status`, manifest iOS và launch bundle đều trả HTTP 200 từ máy dev; bundle chứa URL gateway và nhánh phục hồi quyền mic.
- Người dùng xác nhận happy path hai lượt trên iPhone qua Expo Go `:8089`: meter lượt hai chạy, transcript và answer đúng, tiếng answer nghe được. Người dùng để sau reload preview mới `exp://192.168.100.36:8081`, nên chưa có xác nhận thiết bị đã tải bundle hiện tại.
- Re-run khi tiếp tục goal: mobile tests 167/167, typecheck/lint/dependency check pass và gateway synthetic smoke test pass; Android release permission recovery và repeated start/cancel chạy trên API 37 AVD. Hash APK đang cài trùng artifact local `ED49FF...4DC80E2`; APK bundle có gateway URL, catalogue revision và đủ 34 MP3 với hash set trùng source. AVD `-no-audio` không chứng minh audio thật.
- Fresh iOS/Android JS exports also pass at 1,073/1,068 modules with all 34 MP3 hashes matching source and the LAN gateway configured. Android retry exited 0; neither export creates a native binary or proves iOS/phone runtime.
- GV7 vẫn mở cho xác nhận iPhone trên bundle mới, iOS native build, thiết bị Android thật, audio route/interruption, VoiceOver/TalkBack/Reduce Motion, font lớn, performance p50/p95 và nghe QC 34 clip.

## Android accessibility recheck — 14/10/2026

- Tăng nút quay lại, chip câu hỏi, nút trước/sau, nút đổi sắc thái và các hit area chương lên tối thiểu 48 dp theo chiều cao; tiến trình chương giữ tối thiểu 44 dp chiều ngang để vừa màn điện thoại hẹp. Nút sắc thái đọc thêm trạng thái hiện tại.
- Dock giọng nói phủ lên vùng cuộn. Đo chiều cao dock bằng `onLayout` và cộng vào khoảng đệm cuối danh sách để chip cuối cuộn hoàn toàn lên trên dock, kể cả khi safe area thay đổi.
- APK release dựng thành công và cài trên Android API 37 AVD. Sau khi cuộn xuống cuối màn hỏi đáp, UIAutomator ghi lại: quay lại 48×48 dp; sáu vùng chương cao 48 dp và rộng khoảng 51 dp; nút chuyển điểm cao 48 dp; bốn chip cao 48 dp; dock mic 56×56 dp. Nút chủ đề ở Home 48×48 dp, content description gồm trạng thái “Buổi sáng”.
- Ảnh và cây UI native: `agent_docs/evidence/voice/android37-native-release-a11y-qa-2026-10-14.png`, `android37-native-release-a11y-2026-10-14.xml`, `android37-native-release-a11y-home-2026-10-14.xml`. `npm test` 167/167, typecheck và lint pass sau chỉnh sửa.
- Đây là bounds/accessibility tree trên AVD; chưa bật TalkBack/VoiceOver, chưa kiểm font lớn/Reduce Motion hoặc thiết bị thật. VoiceOver, iPhone reload `:8081`, audio route và performance vẫn pending.

## Android AlleySelect accessibility recheck — 15/10/2026

- Rebuilt and installed the current API 37 release APK: 121,247,928 bytes, SHA-256 `E7D5BD8D8D0B34A23F77BA97CA20A5A0D6A42D7D175FF50858D8C9874899F0F7`.
- UIAutomator measured the back button at 48×48 dp, search field at 294×48 dp, clear-search button at 48×48 dp, demo action at 345×48 dp, and filter chips at 48 dp high. The horizontally clipped “Ẩm thực” chip measured 72×48 dp after scrolling into view.
- On the installed build, clearing search and selecting “Ẩm thực” exposed `selected=true` and changed the visible count to two alleys; “Tất cả” restored the default list. Evidence and exact XML are in `agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/README.md`.
- `npm test` 168/168, typecheck, lint, and `:app:assembleRelease` pass. The AVD has no audio hardware; this does not test TalkBack, microphone/STT, audible output, or iPhone behavior. Those checks remain open.
- Reduce Motion was enabled on the running API 37 AVD by setting Android `transition_animation_scale=0`; tapping the Home “Khám phá các con ngõ Hà Nội” action reached the fully rendered “Chọn Con Ngõ” screen within the 80 ms capture window. The native React Native observer listens to this setting and the app stack maps `reducedMotion` to `animation: 'none'`. All three system animation scales were restored to `1`. Evidence: `android37-reduced-motion-navigation.png` and `.xml` in the same folder. This does not test TalkBack/VoiceOver.

## Android font-scale follow-up — 14/10/2026

- Installed release APK on API 37 was checked at font scale 1.5 and 2.0. At 2.0, the answer stayed collapsed and Ready; after scrolling, both follow-up chips fit fully above the fixed voice dock. Screenshot/XML and bounds are recorded in `agent_docs/evidence/voice/android37-font-scale-2026-10-14/README.md`.
- This is layout/accessibility-tree evidence only. TalkBack/VoiceOver, iPhone Dynamic Type, audio, speech and performance remain unchecked; no app source changed in this check.

## Android Plan, QR and GPS controls — 15/10/2026

- Fixed the Plan “Nhập chủ đề hoặc thời gian khác…” touch target from 44 to 48 dp. On the API 37 AVD at 420 dpi, UIAutomator measured 126 px (48 dp); topic/time fields and their “Dùng” buttons also measured 48 dp. The open keyboard left the topic field and apply button visible.
- On the installed SDK57 release APK, entering “am thuc” then 30 minutes selected Ẩm thực and returned two simulated recommendations totalling 30 minutes. Tapping “Bếp đầu hè” opened that chapter's Q&A. This is native UI/data-flow evidence, not speech recognition.
- The trail action sheet opened separate Plan/GPS/QR surfaces. The GPS screen displayed “Lấy vị trí của tôi” without requesting location on entry; the camera screen displayed “Bật camera và quét QR” without requesting camera on entry. Source flow requests each permission only after that explicit tap; GPS candidate and QR result each have a separate confirmation step. The emulator was not asked to read GPS or start its camera.
- Evidence: `plan-toggle-48dp.png/.xml`, `plan-manual-entry.png/.xml`, `plan-result.png/.xml`, `action-menu.png/.xml`, `gps-explicit-read.png/.xml`, and `qr-explicit-start.png/.xml` in `agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/`.
- Latest APK installed on the AVD is 121,247,924 bytes, SHA-256 `EEC6430CC94BC70CAD01B5A58C954DA4B1333ECC1F49FFDB1BE8BCF4C3D9E1CF`. Build succeeded (377 Gradle tasks; 71 executed). Mobile suite 168/168, typecheck, lint, Expo dependency check, iOS JS export and `git diff --check` passed.
- Reopened the built APK as a ZIP and compared SHA-256 multisets: all 34 source MP3s are packaged, with 34/34 hashes matching and no missing/extra clips.
- GV7 stays open: this AVD has no audio. It does not verify TalkBack/VoiceOver, actual camera/GPS, phone voice command recognition, iOS native behavior, physical audio routes, or performance. The iPhone reload at `:8081` remains deferred by the user.

## Android large-font retest after player-title fix — 15/10/2026

- Rechecked the current release APK (`236072DF9F8E3C8B3952D0C4A4CA13F63A22C8844EDB7015A9BC917263FF4243`) at font scale 2.0. The complete player title wraps to two lines, and after scrolling all four suggested-question chips plus voice, typing and notebook controls remain available in the UI tree.
- Evidence: `agent_docs/evidence/voice/android37-native-release-current-2026-10-15/player-title-fix-reader-scrolled.png` and `player-title-fix-reader-scrolled-ui.xml`. Font scale was restored to 1.0.
- This remains emulator layout evidence only. TalkBack/VoiceOver, iPhone Dynamic Type, speech, audible playback and physical audio routes are unverified; GV7 stays open.

## Rebuilt native artifact after Q&A revision — 15/10/2026

- Android release build succeeded and was installed/launched on API 37 AVD. Current artifact: 121,248,588 bytes, SHA-256 `582E38AF52AA0A3B8C63FDB16CF9A9D029BD597414F59A5F111D088DC57726E8`.
- The APK contains all 34 MP3s; a byte-level SHA-256 multiset comparison found 34/34 exact source matches. On chapter 2, typed normalized transcript `Ong Lam nhua an ra sao?` resolved to the expected `qa-lam` answer and the expanded text matched. Evidence: `voice-alias-build-launch.png`, `voice-alias-current.png`, and `voice-alias-answer.png` in `agent_docs/evidence/voice/android37-native-release-current-2026-10-15/`.
- iOS export completed. The current Metro launch bundle and gateway health endpoint both respond from the dev host with the updated revision/config. The user deferred iPhone reload; this is not iPhone E2E evidence. The AVD has no audio and cannot verify actual STT, microphone meter or playback.
- GV7 remains open for iPhone reload and spoken six-chapter coverage, real Android hardware/audio, screen readers, audio routing/interruption and performance measurement.

## Current bundle, gateway and release artifact — 15/10/2026

- Metro `:8081` served the current iOS bundle over LAN with HTTP 200 in 5.25 seconds warm (5,530,710 bytes); the LAN manifest advertises `192.168.100.36:8081`. The bundle includes current revision, gateway URL, exact action aliases and dock hint, and excludes stale disconnected copy. Gateway `/health` is ready on `large-v3-cuda`. Current Android API 37 APK hash is `17BF0EF342B0E41E4A90972101B260BD1E75D9654F80FDC5BFA469464E6EF3D3`, with all 34 packaged MP3 hashes matching source.
- Local tests: 170/170, typecheck, lint, dependency check, catalogue validation 34/34, gateway smoke, release build and bundle checks pass. Synthetic gateway E2E is 21/21 after exact aliases (p50/p95 570/634 ms on this PC); this is not device performance or human speech evidence.
- Still pending: human listen/QC of all 34 clips; reload and spoken six-chapter coverage on iPhone; physical Android audio if a device is available; speaker/headphone/Bluetooth/call/lock/background behavior; VoiceOver/TalkBack and hardware performance. The user has deferred the iPhone retest.

## Latest API 37 native reader and action-intent check — 15/10/2026

- Reinstalled and freshly launched APK `17BF0EF342B0E41E4A90972101B260BD1E75D9654F80FDC5BFA469464E6EF3D3` (121,248,752 bytes). From the entry screen, opened an alley and its Q&A, selected “Đây là điểm nào?”, saw the expected answer, started the bundled 10-second answer player, and opened the answer text. The screenshot shows playback still active at 00:02/00:10; tapping Back returned to the alley map. Evidence: `latest-player-text-open.png` and `latest-back-home.png` in `agent_docs/evidence/voice/android37-native-release-current-2026-10-15/`.
- The APK contains 34 MP3 entries and the SHA-256 multiset matches all 34 source files exactly. Current source checks pass: 170/170 tests, typecheck, lint, Expo dependency check and `git diff --check`.
- The AVD has no audio, so it does not prove audible playback or mic level/STT. GV7 remains open for human listening, iPhone spoken coverage, real-device audio routes/interruption, screen readers and hardware performance; iPhone reload is still deferred.
- On the same APK, mic start → Cancel → second start → Cancel returned to `Đang thu · 00:01` on both turns and idle after each cancellation. AppOps showed no active recording afterward; no audio was submitted. Captures: `latest-recorder-first.png`, `latest-recorder-second.png`, `latest-recorder-after-cancel.png`. The AVD has no input signal, so meter movement/recognition remain unverified.
- Repeated that start/cancel cycle 20 times. AppOps confirmed running/stopped on 20/20 starts/cancels and the app PID remained 18546. PSS rose 6,004 KB (188,050 → 194,054 KB) in a single AVD run; this is not enough to characterize a leak or performance. Final idle screen: `latest-recorder-stress-idle.png`.
- On the same installed API 37 APK, answered a simulated GSM call during an active recording. AppOps stopped recording when the dialer took foreground; after ending the call, Ngõ Kể returned to `Nhấn để hỏi` and did not resume recording. The incoming notification alone did not interrupt while Ngõ Kể stayed foregrounded. See the three call-state screenshots in the current-release evidence folder. This closes only the AVD lifecycle case; physical audio routes/call behavior, microphone audio, screen readers and hardware latency remain open.
- A separate active-recording run changed chapter 1 → 2. AppOps stopped and the dock returned idle on chapter 2; evidence: `recorder-next-point.png` in the same folder. This is AVD lifecycle coverage only.
- TalkBack was installed and bound on the API 37 AVD, but ADB coordinate injection did not provide a valid touch-exploration/double-tap test and caused ambiguous route changes. No screen-reader pass is claimed; the AVD has no usable spoken audio output. The service was disabled again, app returned to Q&A idle, and AppOps showed no active recording.

## Earlier host preview check — revision 5a82b1 (superseded) — 15/10/2026

- Fresh checks: Metro `:8081/status`, iOS manifest and launch bundle all HTTP 200. The 5,523,808-character bundle contains the final catalogue revision `5a82b1d4fa223b2170fd9fa2c761a01479b4e3e159a81a6de72f65566a8d2568`, matching manifest SHA-256 `e59696011be1501097b08f11091a903f8b9a88d30d2914fcc255d1c28db774ba`, the latest exact alias and the LAN gateway URL; the previous revision is absent. Gateway `:8788/health` is ready on `large-v3-cuda`.
- Local quality checks pass: 170/170 tests, typecheck, lint, dependency check and `git diff --check`. Static iOS export SHA-256: `35D9DBA66BAC6ECD1D429DE99CC75019524740685C345943036B7D8AA0E07108`. Android release APK SHA-256: `A44C99FF04125D5C24DD45ADFEA8C74EB8675C53EA00B4C2B45CEFEF95538BBC`.
- No iPhone reload is claimed; it remains deferred. GV7 is not closed: 34-clip human listening QC, current-bundle spoken checks on iPhone across six chapters, physical audio routes/interruption, screen readers and hardware latency/jank/memory evidence are pending.
