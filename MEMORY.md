# MEMORY.md — Ngõ Kể

## 2026-10-15 — Revalidation after remaining-effort estimate

- Re-ran current mobile checks against the dirty working tree: `npm test` 171/171, TypeScript, ESLint, Expo dependency compatibility, and `git diff --check` passed. The only diff-check output is existing LF/CRLF warnings.
- Revalidated all 34 catalogue items: integrity checks pass, 7.0 minutes / 5.04 MB; highest synthetic WER remains `qa-flowers-answer` 23.1%. This is automated transcript/format/hash validation, not human listening QC.
- Current LAN gateway smoke passed on faster-whisper 1.2.1 with the 19.15-second locally generated clip, including abort/retry, quota, invalid format, duration, and silence handling. No private audio was sent.
- Native-container probe passed with a local synthetic 23,886-byte AAC/M4A clip uploaded as `audio/mp4`: gateway returned HTTP 200, preserved turn/node/mode/revision, and transcribed “Con ngõ này có gì để xem?”. This does not verify audio recorded by Expo Go or a physical iPhone.
- Promoted that probe into a repeatable gateway smoke regression with tracked fixture `tools/voice/gateway/test-fixtures/ios-aac-smoke.m4a` (SHA-256 `67EB5DF56D2D856663C0E6971734EFA9B0CE176FD0FCB5341170945E854BAB23`). `node tools/voice/gateway/smoke_test.mjs` passed using WAV and AAC/M4A, abort/retry, quota, invalid-format, duration and silence cases.
- Updated the current V4 review and handoff with the M4A regression and fresh host/device status; relabeled the older API 37 V6 evidence heading as superseded so it cannot be mistaken for the current release snapshot.
- Expanded the current iPhone handoff from a single chapter-1 example to exact question/follow-up speech pairs for all six chapters, derived directly from `data/demo.json`; the on-device acceptance record remains pending.
- Metro `:8081` serves both loopback and LAN. Its current iOS dev bundle returns HTTP 200 (5,523,970 bytes) and contains revision `8b318b…`, gateway `192.168.100.36:8788`, the “Phát lời kể” hint, and `MIC_PERMISSION_BLOCKED`. Gateway health is ready on `large-v3-cuda` / CUDA float16. This remains host delivery evidence; the user has deferred reloading it on iPhone.
- Fresh continuation check: Metro `127.0.0.1:8081/status` returned HTTP 200; LAN gateway `192.168.100.36:8788/health` is ready on Node 24.14.1 / faster-whisper 1.2.1 / `large-v3-cuda` / CUDA float16. ADB lists only `emulator-5554`, no physical Android device.
- Tried advancing V3 on the API 37 AVD with audio enabled and `hostmicon`: native `AudioRecord` opened, but the 1.84-second local synthetic sample produced no metering signal. The clip was canceled without upload; AVD `-no-audio`, hostmic off, and animation scales `1` were restored. Evidence is explicitly inconclusive at `agent_docs/evidence/voice/android37-host-audio-route-attempt-2026-10-15/`.
- Dataset SHA-256, `voiceCatalogueRevision`, and manifest revision still agree at `8b318b4e9955e3b7affe72cb21ea08cf8123a616eeab2eb1420ab105c7b65e6b` (34 entries). Android release APK is still `2f15c3c0992434a42b13cb4b09c363826542ddfa215eb8f3e9d5db03e22a1e0d`.
- ASR tuning review found no safe decode change: the previously tested vocabulary `initial_prompt` reduced synthetic exact matches from 14/21 to 11/21; keep exact matching and the three known utterances unknown until measured evidence supports a bounded fix.
- Reviewed the current matcher/intent, gateway and voice UI diffs. The source validator already rejects normalized Q&A/alias collisions; a full demo audit found 21 questions and 82 aliases with zero collisions, and `qa.test.mjs` now has a regression case for a case/punctuation-normalized collision. This is dataset/validator evidence, not live-phone accuracy.
- Added a hook-level regression in `uiFlows.test.mjs` confirming manually started story playback sets the native player loop. The test mock now includes Expo Crypto's SHA-256 enum so it exercises the playback path; full suite passes at 171/171.
- Brought `VOICE_INTERACTION_UX_SPEC.md` up to date: its front matter now describes implemented native behavior and identifies the pre-implementation status and V0–V4 proposal as history. The current page documents the auto-repeat preference and links to the live components and V0–V7 evidence.
- Rechecked the live development hosts after the estimate: LAN Metro `:8081/status` returned HTTP 200 and `:8788/health` returned ready on Node 24.14.1 / faster-whisper 1.2.1 / large-v3 CUDA float16. This confirms host availability only.
- Open acceptance remains human listening QC, current-bundle iPhone spoken coverage across all six chapters, real-device audio/interruption and screen-reader checks, and hardware latency/performance. The AVD has no usable audio input/output. Do not mark the goal complete. No commit or push.

## 2026-10-15 — Current revision 8b318b native and catalogue recheck

- Current `data/demo.json`, `voiceCatalogueRevision`, and manifest `sourceDataSha256` agree at `8b318b4e9955e3b7affe72cb21ea08cf8123a616eeab2eb1420ab105c7b65e6b`; 34-entry manifest SHA-256 is `34925f5d005fa7fb684c4f8fac19992865b581c6eeaa6bde0e9183431c9be05a`.
- Fresh current checks: mobile **171/171**, typecheck, lint, Expo dependency check, V1 validator **34/34**, local gateway smoke and `git diff --check` pass. Validator reports 7.0 minutes / 5.04 MB; highest synthetic WER is `qa-flowers-answer` 23.1%. This does not replace human listening QC.
- A fresh 8-question synthetic helper → live `large-v3-cuda` gateway → strict production matcher run on revision `8b318b…` matched 5/8 exactly, with 0 wrong and 3 ambiguous transcripts intentionally left unknown: `Công lâm nhựa ăn ra sao?`, `Hai trùng giàn hoa giấy trong sân.`, and `Vì sao anh đọc lá thư thật chậm?`. Their unknown status is regression-tested; do not add broad/fuzzy aliases to inflate recall. Cached transcript replay at 21/21 remains matcher-only evidence.
- Current Android API 37 release APK is 121,249,588 bytes, SHA-256 `2f15c3c0992434a42b13cb4b09c363826542ddfa215eb8f3e9d5db03e22a1e0d`; installed base APK hash matches. Its embedded revision is current and all 34 MP3 hashes match source. Current native typed chapter-4 alias and follow-up flow plus chapter-1 answer/player/text state are captured in `agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/README.md`. The AVD has no audio hardware.
- On this APK, a 20-cycle recorder stress pass showed AppOps active/stopped 20/20, PID unchanged, PSS 192,569 → 204,956 KB (+12,387 KB) in one run. This is lifecycle evidence only, not a leak or hardware performance conclusion; AVD has no usable audio.
- Fresh iOS Expo export succeeded (1,073 modules): `mobile/dist/ios/_expo/static/js/ios/index-34b34ad94926be47472ea9cee2796235.hbc`, SHA-256 `d285830810720d64dbd0f5c0579bc6f0cb8b4c26185853795f2790b8333dc477`. Metro `:8081` status, iOS manifest and launch bundle return HTTP 200; current bundle is 5,531,244 bytes and includes revision `8b318b…`, gateway URL and `MIC_PERMISSION_BLOCKED`, without stale disconnected copy. Gateway `:8788/health` is ready on faster-whisper 1.2.1 / large-v3 CUDA. This is host/LAN evidence only.
- The user deferred reloading `exp://192.168.100.36:8081`; previous two-turn iPhone success was reported on `:8089`. Human listening QC, current-bundle iPhone spoken coverage, physical audio/interruption routes, screen readers and hardware performance remain open. No commit/push.

## 2026-10-15 — Earlier large-v3 alias snapshot (superseded by 8b318b)

- Added four exact aliases for saved large-v3 transcript variants in `qa-lam`, `qa-flowers`, `qa-knot`, and `qa-che`; the fifth transcript (`qa-home`) was already covered. Increased the bounded per-entry alias limit from 5 to 6 for the six-alias `qa-flowers` entry. `data/demo.json`, `mobile/src/voice/catalog.ts`, and `mobile/assets/voice/manifest.json` now share dataset revision `5a82b1d4fa223b2170fd9fa2c761a01479b4e3e159a81a6de72f65566a8d2568`.
- The cached 21-question synthetic transcript sets re-evaluated through the production exact matcher at **21/21** expected IDs for both small and large-v3, with zero unknown or wrong matches. This replays saved synthetic transcripts; it is not a new ASR run or a human-speech accuracy claim. `npm test` passes 170/170; typecheck, lint, Expo dependency check and `git diff --check` pass.
- Revalidated the audio catalogue: 34/34 entries pass; MP3 source/text/audio hashes, decode, format, duration and levels are unchanged. Updated manifest file SHA-256: `e59696011be1501097b08f11091a903f8b9a88d30d2914fcc255d1c28db774ba`. Human listening QC remains pending.
- Rebuilt and installed Android API 37 release APK: 121,249,288 bytes, SHA-256 `A44C99FF04125D5C24DD45ADFEA8C74EB8675C53EA00B4C2B45CEFEF95538BBC`; installed base APK hash matches. On the native app, entering `Hai chong gian hoa giay trong san` in chapter 4 returned the `qa-flowers` answer; see `agent_docs/evidence/voice/android37-native-release-asr-alias-2026-10-15/README.md`. The AVD has no usable audio, so this is not mic/STT or audible playback proof.
- `npm run build:ios` passed; HBC export is `index-0462bc7bf16834cfd89e7154fb994480.hbc`, SHA-256 `35D9DBA66BAC6ECD1D429DE99CC75019524740685C345943036B7D8AA0E07108`. Metro `:8081` serves a fresh HTTP 200 bundle (5,523,808 characters) containing the new revision and alias and no old revision; gateway smoke passed with local synthetic audio. The user has deferred reloading `exp://192.168.100.36:8081`; previous two-turn success was reported on `:8089`.
- Still open: human listening QC for all 34 clips; spoken six-chapter coverage and device failure/audio-route/interruption checks on the current iPhone bundle; physical-device accessibility and performance. Goal remains active; no commit or push.

## 2026-10-15 — V6 ASR correction and latest native release

- Local VieNeu TTS clips sent only to the local LAN gateway: “Đừng nghe.” → transcript “Đừng nghe.”; “Dừng nghe.” → “Dừng ngay!”. Parser now leaves the first as a question and maps the observed second transcript to exact `stop`; no user audio was used. Full mobile suite 170/170; typecheck, lint and `git diff --check` pass.
- Rebuilt/installed API 37 APK: 121,248,988 bytes, SHA-256 `F6CD6178BD99D303E2C714963B3F414314D7DE9B883098976648DA9A2CF20B49`; installed base APK hash matches. Native Landing → Home → alley → chapter-1 Q&A/answer → open story text flow passed; answer player remained at `00:04 / 00:10`. Evidence: `agent_docs/evidence/voice/android37-native-release-v6-negation-2026-10-15/README.md`.
- APK MP3 SHA-256 multiset matches all 34 source clips. `npm run build:ios` succeeded; exported HBC is `index-e44b07b146d3b8e5f8490498dfdad2b4.hbc`, SHA-256 `DB6FE8BE6FFA17E4B4B4E596440B84B34A89164DBAA429E1859037522824175F`. Metro `:8081/status` is HTTP 200 and gateway `:8788/health` is ready on `large-v3-cuda`.
- Still pending: human listening QC for 34 clips; iPhone reload of `exp://192.168.100.36:8081` and spoken coverage; physical-device mic/audio routes, interruption, screen-reader and performance. AVD has no audio and cannot close those gates.

## 2026-10-15 — Earlier native UI and V6 speech-intent verification

- Reinstalled/relaunched the current Android API 37 release APK (121,248,752 bytes; SHA-256 `17BF0EF342B0E41E4A90972101B260BD1E75D9654F80FDC5BFA469464E6EF3D3`). Fresh UI path reached Home → Q&A; tapping “Đây là điểm nào?” showed the correct chapter-1 answer without autoplay. Starting its answer player, then opening the answer text, kept playback active at 00:02/00:10; Back returned to Home. Native captures: `agent_docs/evidence/voice/android37-native-release-current-2026-10-15/latest-player-text-open.png` and `latest-back-home.png`.
- Current APK ZIP contains 34 MP3s; SHA-256 multiset comparison matched all 34 source files byte-for-byte (0 missing/extra). This checks packaged audio integrity only; the AVD has no usable audio output/input.
- Replayed two local VieNeu synthetic action clips through the app's actual `createVoiceRequestBody` / `transcribeVoiceRequest` helpers, live `:8788` large-v3 CUDA gateway, and production `parseVoiceIntent`: “Bắt đầu nghe lời kể” → `listen`; “Mở máy quét mã QR” → transcript “Mở máy quét mạ.” → `open-qr`. Exact normalization/aliases only; no fuzzy selection. Synthetic speech is not human accuracy evidence.
- Current validation: 170/170 mobile tests, typecheck, lint, Expo dependency check and `git diff --check` pass. Gateway health is ready (`large-v3-cuda`); Metro `:8081/status` is running. `uiautomator dump` intermittently returned the pre-transition tree while fresh screenshots showed the active Home/Q&A route, so route evidence was captured from the screen after transitions.
- V6 negation regression: “Đừng nghe” collided with normalized “Dừng nghe” and was interpreted as `stop`. The parser now checks an initial accented “đừng” before normalization; four negative examples stay non-actions while “Dừng nghe” remains `stop`. Full suite remains 170/170, typecheck/lint pass. This is transcript-level evidence only.
- Fetched the iOS launch manifest through LAN IP `192.168.100.36`: HTTP 200, `hostUri`/debugger host `192.168.100.36:8081`. Its warm launch-bundle fetch returned HTTP 200 in 5.25 seconds, 5,530,710 bytes, and includes the configured gateway URL, current revision, V6 phrase “Phát lời kể”, both exact action forms, and no stale disconnected copy. This proves host/LAN delivery; iPhone reload is still deferred.
- Repeated the mic state cycle on the same APK: start → Hủy → start → Hủy. Both starts displayed `Đang thu · 00:01`; the dock returned to idle after each cancel, no clip was sent, and `cmd appops get` showed no active recording after the final cancel. Evidence: `latest-recorder-first.png`, `latest-recorder-second.png`, `latest-recorder-after-cancel.png`. The AVD has no audio signal, so this still cannot verify moving meter or speech recognition.
- Stress-repeated that native cycle 20 times on APK `17BF…`: mic AppOps was running on 20/20 starts and stopped on 20/20 cancels; process PID stayed `18546`. AVD PSS changed from 188,050 KB to 194,054 KB (+6,004 KB) in one run, too small/short a sample to claim leak or performance. Final idle capture: `latest-recorder-stress-idle.png`.
- Still pending: listener QC for all 34 clips; reload/current spoken six-chapter tests on iPhone (deferred by user); physical audio routing/interruption; TalkBack/VoiceOver and hardware performance. Goal stays active; no commit/push.

## 2026-10-15 — Revalidate Voice preview and current release

- Metro `:8081` was healthy; gateway `:8788` had stopped between sessions. Restarted gateway on `0.0.0.0:8788`; LAN health is ready (Node 24.14.1, faster-whisper 1.2.1). iOS and Android Expo Go manifests and bundles both returned HTTP 200 with the gateway URL.
- Fresh checks: mobile 168/168; typecheck, lint, Expo dependency check, catalogue 34/34, gateway synthetic-audio smoke, and `git diff --check` pass.
- Installed current 121,247,924-byte Android release APK (SHA-256 `236072DF9F8E3C8B3952D0C4A4CA13F63A22C8844EDB7015A9BC917263FF4243`) on API 37 AVD. Font scale 2.0 surfaced player-title truncation; removed the shared component’s one-line cap, rebuilt, and verified the full title wraps. Home → chapter 1 reader, text/player interaction and recorder cancel also rechecked. Evidence: `agent_docs/evidence/voice/android37-native-release-current-2026-10-15/README.md`.
- At Android font scale 2.0 on this APK, all six chapter selectors and story/player/voice/text-input/notebook controls remained reachable; after scroll all four question suggestions and the voice dock were visible/enabled. Recorder start/cancel worked at large scale; restored font_scale to 1.0. TalkBack remains untested.
- AVD has no audio. Human listening of 34 clips, current-bundle iPhone reload/speech retest (user deferred), physical audio routes, full six-chapter speech/failure coverage, hardware screen-reader and performance remain pending. Goal remains active; no commit/push.

## 2026-10-15 — AlleySelect touch-target audit

- Audited and fixed AlleySelect native hit areas: back 48×48 dp; search and clear-search controls at least 48 dp high; demo action and filter chips at least 48 dp high. Filter chips now expose button role, label and selected state to accessibility services.
- Rebuilt/installed API 37 SDK57 APK: 121,247,928 bytes, SHA-256 `E7D5BD8D8D0B34A23F77BA97CA20A5A0D6A42D7D175FF50858D8C9874899F0F7`. UIAutomator confirmed search/clear and that “Ẩm thực” selects and changes the list count to two; “Tất cả” restores the default list.
- `npm test` 168/168, typecheck, lint and `:app:assembleRelease` pass. Native screenshots/XML are under `agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/`.
- AVD has no audio and this check did not exercise TalkBack/VoiceOver, microphone/STT, audible output or iPhone. These remain pending; no commit or push was made.

## 2026-10-15 — Android Reduce Motion integration check

- React Native 0.86.3 reads Android `Settings.Global.TRANSITION_ANIMATION_SCALE` for `AccessibilityInfo.isReduceMotionEnabled()` and observes changes while a React instance is active. The app's native stack switches transitions to `animation: 'none'` when the shared motion preference is reduced.
- On the running API 37 AVD, set only `transition_animation_scale=0`, tapped the Home “Khám phá các con ngõ Hà Nội” action, and captured the fully rendered “Chọn Con Ngõ” screen within 80 ms. All three animation settings were restored to `1`; verified by rereading them. Evidence: `agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/android37-reduced-motion-navigation.png` and `.xml`.
- This is reduced-motion navigation evidence on an emulator, not TalkBack/VoiceOver or iPhone accessibility proof. No source changes were needed.
- Rechecked host preview: Metro `:8081/status`, iOS bundle and gateway `:8788/health` return HTTP 200/ready. Bundle is 6,073,393 bytes, embeds `192.168.100.36:8788`, includes `MIC_PERMISSION_BLOCKED`, and omits the stale disconnected copy; cached fetch is 0.18 seconds. The first uncached probe timed out at 25 seconds before a later successful build response. iPhone reload remains user-deferred.

## 2026-10-14 — V5 regression covers all recorded synthetic ASR misses

- Compared the three cached synthetic ASR probe reports with the chapter-scoped Q&A tests: all 33 unique observed miss transcripts now have same-node `unknown` regressions. Corrected the `qa-che` case from `demo-05` to its actual owner, `demo-04`.
- A separate 21-question sweep scored 12/21 exact matches on baseline, 11/21 with the vocabulary prompt, and 12/21 with VAD disabled; an earlier separately generated sweep scored 14/21. Keep these as synthetic-only results; no alias or production STT parameter was changed because the errors are ambiguous and prompt/VAD tuning did not improve recall.
- Latest mobile run: 167/167 tests, typecheck, lint, Expo dependency check and `git diff --check` pass. Metro `:8081` iOS bundle and gateway health both return HTTP 200; user still deferred the iPhone reload. No commit/push under the active Voice goal.

## 2026-10-14 — Permanent microphone denial now routes to Android Settings

- Roadmap V3 required an Open Settings path for a permanently denied microphone; `useVoiceSession` previously always showed the same retry state. It now checks Expo permission `canAskAgain`, distinguishes blocked permission, and exposes an accessible `Mở Cài đặt` action through `Linking.openSettings()` while preserving the typed fallback.
- Regression + validation: `npm test` 167/167, typecheck, lint, dependency check pass. Android release `assembleRelease` built successfully with scoped JDK 17/Android SDK environment; 121,247,352 bytes, SHA-256 `ED49FF5702BE20002184876F20FB34B828DF7BEFEA1F22A48FCE2F7944DC80E2`. Installed on API 37 AVD.
- AVD permission denial → app blocked-state → Open Settings → allow while in use → return/retry entered recording → cancel to idle; `RECORD_AUDIO` remains granted. AVD is `-no-audio`; no speech/meter/STT claim. Screenshots in `agent_docs/evidence/voice/android-emulator/README.md`.
- Repeated two mic starts after Settings recovery on the current APK: second showed `Đang thu · 00:00`, then Cancel returned idle; AppOps operation ended and package permission remained granted. No recording submitted.
- Old Metro PID 34608 on `:8081` replied to `/status` but hung on manifest/bundle. Restarted the same project/port; current manifest and iOS launch asset return HTTP 200 (5,528,940 bytes), source inspection includes blocked-permission code and gateway and omits stale not-connected text. Gateway health is ready. User deferred reloading Expo Go; do not ask again now.
- iPhone reload of `exp://192.168.100.36:8081` remains deferred by user; do not ask again in this continuation.

## 2026-10-14 — Android microphone permission denial/retry verified

- On current Android release APK `BA973B5F23550367191A3A5ED004FD411CEF6D90ABB5C0FB5A132AA4897221D2` / API 37 AVD: revoke mic → OS prompt → deny → app shows typed fallback → retry opens prompt → grant → recorder reaches `00:02` → Cancel returns idle. `dumpsys package` confirmed `RECORD_AUDIO: granted=true` afterward; permission left granted.
- Evidence is linked in `agent_docs/evidence/voice/android-emulator/README.md` and documented in V3/V7/test report/handoff/roadmap. AVD uses `-no-audio`, so no speech, live meter, STT or physical-device permission behavior is claimed.
- User deferred testing the current iPhone preview `exp://192.168.100.36:8081`; continue independent work and do not ask again now. The earlier iPhone second-turn happy path remains user-reported for `:8089`, not verification of this latest bundle.
- The active Voice V0–V7 goal explicitly forbids commit/push. Keep these changes local unless a newer direct user instruction changes that scope; leave unrelated `.idea`, caches and evidence untouched.

## 2026-10-14 — Plan phủ định không còn giữ chủ đề cũ; kiểm APK native

- AVD API 37 tái hiện lỗi thật: sau khi chọn ẩm thực + 30 phút, nhập “Không đi ẩm thực trong 30 phút” ở Plan bị nhận thành ẩm thực và vẫn hiện picks cũ.
- Root cause là `parseTopic` tìm chuỗi chủ đề dương mà không xét phủ định. Thêm `hasTopicNegation` dùng chung giữa `parseTopic`, voice intent và ô nhập Plan; khi phủ định, Plan xóa topic cũ, giữ budget đã chọn và yêu cầu chọn chủ đề khác.
- Regression parser + PlanScreen UI mới; `npm test` 166/166, typecheck, lint và Expo dependency check pass. Cài APK mới lên AVD API 37 và lặp đúng luồng: kết quả đổi sang “Vui lòng chọn chủ đề”, không còn card ẩm thực. Ảnh: `agent_docs/evidence/voice/android-emulator/android37-release-negated-plan-result-2026-10-14.png`.
- Regression `qa.test.mjs` khóa 33 transcript near-miss quan sát được trong các probe ASR tổng hợp ở chế độ `unknown` đúng node; không dùng fuzzy hoặc chọn đáp án gần nhất. Không cải thiện độ nhận dạng, nhưng bảo vệ khỏi trả sai khi transcript bị lệch.
- Android release APK hiện tại: 121,246,512 bytes, SHA-256 `BA973B5F23550367191A3A5ED004FD411CEF6D90ABB5C0FB5A132AA4897221D2`; build thành công và cài/chạy trên AVD.
- Recheck cùng APK: player tiến đến `00:02` rồi pause; recorder vào thu, Hủy về idle, nhấn mic lần hai vẫn vào thu và Hủy lại về idle. Ảnh player/recorder ở `agent_docs/evidence/voice/android-emulator/README.md`. AVD `-no-audio`, nên meter phẳng và không có bằng chứng âm thanh/STT.
- Failure path trên cùng APK: AppOps xác nhận RECORD_AUDIO running; bấm Home đưa Launcher lên và kết thúc operation sau 3,083 ms. Mở lại app cho dock idle, không tự thu tiếp. Ảnh `android37-source-release-recorder-background-idle-appops-2026-10-14.png`; chỉ là AVD lifecycle check.
- Khi story đang phát ở `00:01`, Home rồi mở lại đưa player về Ready/0% và không resume; ảnh before/after trong README Android evidence. Đây chỉ là kiểm state trên AVD `-no-audio`.
- Re-export iOS/Android từ source mới: HBC `index-9873bd6015e99b5d4350b5d75ac9316a.hbc` (2,455,227 bytes) và `index-11ec7bf0812d650912b932ceb0b89a21.hbc` (2,455,453 bytes). Cả hai chứa marker phủ định/gateway và 34/34 audio hash-match nguồn.
- Fresh validator 34/34 clip pass; 7.0 phút/5.04 MB; WER cao nhất vẫn `qa-flowers-answer` 23.1%. Đây không phải QC nghe tay. Metro `:8081` bundle HTTP 200, 6,062,091 ký tự, có helper phủ định; gateway LAN ready.
- Vẫn pending: reload/test bundle mới trên iPhone (người dùng để sau), speech đủ 6 chương/21 Q&A, audio/iOS/accessibility/performance thật và nghe QC 34 clip. Người dùng đã yêu cầu tự động push sau mỗi phần việc hoàn tất; cần stage đúng các thay đổi Ngõ Kể, không kéo theo `.idea`, cache hoặc evidence ngoài phạm vi.

## 2026-10-14 — Guard phủ định Plan, exports và APK mới

- Sửa `parseVoiceIntent`: mọi tín hiệu phủ định trong lượt Plan làm mơ hồ slot chủ đề và xóa topic cũ; slot thời lượng vẫn giữ nếu nghe rõ độc lập. Ngoại lệ danh từ “không gian” tránh false positive. Regression phủ “không đi ẩm thực”, “không, 30 phút” và câu tích cực có “không gian”.
- Re-run trên workspace: 5/5 intent tests, `npm test` 164/164, typecheck, lint, Expo dependency check pass.
- iOS/Android Expo exports thật trong `mobile/dist`: HBC lần lượt 2.454.864/2.455.067 byte; metadata có 34 MP3 mỗi platform, 34/34 byte-identical với nguồn. Metro iOS bundle mới `:8081` trả HTTP 200, 6.061.640 ký tự, có gateway/parser và hai marker phủ định.
- Android release APK mới build thành công: `mobile/android/app/build/outputs/apk/release/app-release.apk`, 121.246.208 byte, SHA-256 `EBF2BD54A8036DF72149059C67AA99D0E8C29E4AD8AE2D0A1E9F850E9FD08404`. APK có parser fix, gateway URL, 34/34 audio byte-identical. Chưa cài vì `adb devices` hiện không thấy thiết bị/AVD.
- Gateway LAN `:8788` hiện ready. Năm lượt warm với cùng clip TTS 19,15 giây: p50 7.536 giây, p95 nearest-rank 7.727 giây (7,536/7,727 ms); đây chỉ là request-to-transcript qua LAN, không đo thu mic/app/thiết bị.
- Ghi chú tại thời điểm đó chưa có yêu cầu commit/push; sau đó người dùng đã yêu cầu tự động push mỗi phần việc hoàn tất. Còn: người dùng reload `:8081` trên iPhone (đã để sau), speech qua 6 chương/21 Q&A và failure paths, nghe tay 34 clip, audio routes/accessibility/performance thật.

## 2026-10-14 — Recheck Metro, gateway và độ trễ STT tổng hợp

- Metro `:8081` còn chạy; manifest và bundle iOS trả HTTP 200. Bundle hiện tại 6,061,583 ký tự, có gateway LAN `192.168.100.36:8788`, recorder và `parseVoiceIntent`, không còn copy “Chưa kết nối máy nhận giọng nói”. Gateway `/health` trên đúng IP LAN trả `ready` với faster-whisper-small.
- Gửi cùng clip TTS tổng hợp 19,15 giây qua gateway 5 lần liên tiếp: cả 5 HTTP 200, transcript khác rỗng, echo đủ `turnId/locale/mode/nodeId/datasetRevision`; warm p50 7.536 giây, p95 nearest-rank 7.727 giây (7,536/7,727 ms). Chỉ đo request-to-transcript gateway/STT qua LAN, không tính mic iPhone, upload từ app, Q&A hay phát audio.
- Mobile kiểm lại `npm test` 164/164, typecheck, lint và Expo dependency check pass. Người dùng chưa reload `:8081` trên iPhone theo yêu cầu để sau; không nâng kết quả user-reported ở `:8089` thành bằng chứng cho bundle này.

## 2026-10-14 — APK Android V6 retest và Metro :8081

- Người dùng xác nhận lượt voice thứ hai liên tiếp trên iPhone có meter, transcript, Q&A đúng và nghe được câu trả lời. Đây là happy path do người dùng báo; không có trace/audio để kiểm chứng độc lập. Việc reload bundle mới `exp://192.168.100.36:8081` được để sau.
- Local speech diagnostic: 21 canonical Q&A prompts synthesized by pinned VieNeu and transcribed by the current faster-whisper-small settings, then passed through app `findAnswer` chapter-scoped, yielded 14/21 exact, 7 unknown, 0 wrong-answer matches (per node 6/6, 1/3, 2/3, 1/3, 1/3, 3/3). A vocabulary `initial_prompt` on identical synthetic audio scored 11/21 and regressed three questions, so no gateway change was made. This is not real speech, microphone, app→gateway or iPhone evidence; temporary WAVs were removed and report stays in ignored `.cache`.
- APK mới nhất sau V6 (`com.valentino241.ngokedemo`), 121,246,156 byte, SHA-256 `301F0654052A537324A08240F02C1DA223D99EBACCD841A573A20C3375B0EE36`, đã cài và chạy trên AVD API 37. Đã kiểm Landing → Home → Ngõ Phất Lộc → Q&A điểm 01; mở/đóng lời kể chữ không đổi trạng thái player; player có progress/pause/resume/replay/stop; bàn phím và drawer nhập hiển thị. Ảnh thuộc `agent_docs/evidence/voice/android-emulator/android37-v6-release-*.png`.
- Nhập `Day la diem nao` trả lời đúng “Cổng ngõ”; chữ đáp án vẫn ẩn tới khi mở, không tự phát audio. `Who are you` trả unknown và xóa nội dung đáp án cũ. Đây là kiểm UI/logic gõ trên APK; chưa phải STT thật.
- Trên AVD `-no-audio`, recorder hiện trạng thái thu và timer, chạm giới hạn ở `00:19` rồi chờ Gửi; không gửi clip. Lượt Back quay về màn chọn ngõ và lượt Hủy riêng trên APK V6 dừng ở 0,838 giây; AppOps không còn lượt thu đang chạy, UI về idle. Không chứng minh tín hiệu mic thật.
- `npm test` 164/164, typecheck, lint, Expo dependency check và `git diff --check` đạt. Gateway `:8788/health` ready. Metro `:8081` được khởi động lại sạch; manifest và iOS bundle qua LAN HTTP 200, bundle 6,061,569 ký tự có gateway và `parseVoiceIntent`. Người dùng chưa reload bundle này trên iPhone theo yêu cầu để sau.
- Re-export hiện tại đạt trên iOS (1,073 modules) và Android (1,068 modules). Cả hai bundle chứa gateway LAN và `parseVoiceIntent`; Expo metadata có đủ 34 MP3/platform, toàn bộ exported bytes có SHA-256 khớp manifest. Đây là JS exports, không phải IPA/APK.
- Voice vẫn chưa hoàn tất: còn speech E2E đủ 6 chương/21 Q&A và failure paths, QC nghe tay 34 clip, iOS native/audio route/interruption, VoiceOver/TalkBack trên thiết bị, performance p50/p95 và kiểm bundle `:8081` trên iPhone. Không commit/push theo phạm vi goal hiện tại.
- Smoke gateway live đạt bằng clip TTS tổng hợp cục bộ 19,15 giây trên Node 24.14.1/faster-whisper 1.2.1; abort/retry, quota, format, duration và silence guards pass. POST trực tiếp tới gateway LAN hiện tại trả HTTP 200, transcript không rỗng và echo context/turnId; đây không phải upload từ app/mic.

## 2026-10-14 — V6 stale-slot regression

- `parseVoiceIntent` now prioritizes informational questions even while the Plan card is collecting slots. Ambiguous topic/budget slots clear their prior value independently; unrecognized plan speech clears stale picks and asks the user to choose again.
- Added regression coverage for an open Plan question, stale negated topic, stale multi-duration value, and both slots ambiguous. Full mobile suite 164/164, typecheck, lint and Expo dependency check pass.
- Hardware voice recognition of these phrases and user comprehension of the inline Plan card remain unverified; this does not close GV6/GV7.

## 2026-10-14 — Accessibility stage announcements and prior Expo bundle check

- Added stage-only VoiceOver/TalkBack announcements in `VoiceInteractionDock` for preparing, recording, ready, stopping and transcribing; timer ticks do not re-announce. Regression covers the full stage sequence and the no-repeat timer case.
- Current mobile checks: `npm test` 162/162, typecheck, lint, Expo dependency check and `git diff --check` pass. iOS JS export (1,073 modules, `index-0476f928e945a4013b39391ae68ad762.js`) and Android JS export (1,068 modules, `index-95b2dbb411a1c5b752c11c064bbce29b.js`) pass.
- At a previous host probe, Metro `:8081` served an HTTP 200 iOS bundle (6,062,657 characters) containing the gateway URL and stage announcement; gateway `/health` was ready. A later check showed the bundle route timing out; see the newest entry above for current status. The successful two-turn iPhone report was from `:8089` and is not tied to the latest `:8081` bundle.
- Still pending: confirm latest `:8081` on iPhone, VoiceOver/TalkBack, full 6-chapter physical speech coverage, device failure/audio-route checks, human listening QC for 34 clips and performance. Do not mark GV7/Voice complete; no commit/push.

## 2026-10-14 — iPhone lượt voice thứ hai: cập nhật mới nhất

- Người dùng xác nhận retest sau reload `exp://192.168.100.36:8089`: ở lượt voice thứ hai liên tiếp trên iPhone, meter chạy, transcript và Q&A đúng, audio trả lời nghe được. Ghi nhận là một happy path thực do người dùng xác nhận; chưa có transcript nguyên văn, model/OS, log hoặc trace server để kiểm tra độc lập.
- Expo Audio 57.0.5 iOS `AudioModule.pause` gọi `deactivateSession()` sau 100 ms nếu player không giữ audio session; tác vụ trễ không kiểm recorder. `useVoiceSession` bật `keepAudioSessionActive: true`; `QaScreen` generation guard hủy auto-play cũ khi mic lượt mới bắt đầu. Các race này đã được khóa ở source, chưa kết luận là root cause vật lý.
- Kiểm tra hiện tại: `npm test` 158/158, typecheck/lint và iOS JS export đạt. Metro `exp://192.168.100.36:8089` trả bundle iOS 200, 6,068,732 byte, có `keepAudioSessionActive` và `playbackIntent`; gateway `/health` 200. Bundle không chứa gateway URL nên chỉ kiểm meter/player, chưa STT. AVD Android cho thấy hai lần player→mic có meter nhưng không thay thế iPhone.
- Không cần lặp lại cùng happy path ngay; các ca lỗi và kiểm tra đa thiết bị vẫn mở. Metro full E2E cần khởi chạy với `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL` trên cổng mới `8091`; không mở/public gateway. Lần thử khởi chạy Metro từ agent bị tool review chặn, nên không thử đường vòng. Không commit/push theo goal Voice hiện hành.
- Re-run V1 validator hiện tại đạt 34/34 clip (7.0 phút, 5.04 MB); ASR WER ưu tiên nghe tay vẫn là flowers/cake/demo-01-caption. `node tools/voice/gateway/smoke_test.mjs` đạt với 19.15s TTS tổng hợp và các guard media; E2E từ mic thật chưa chứng minh.
- Revalidation hiện tại: `npm test` 161/161; typecheck, lint và Expo dependency check pass. iOS/Android JS export pass (1,073/1,068 modules), cả hai bundle có URL gateway. Current Metro `:8089` đang chạy nhưng manifest timeout và bundle 6,069,092 byte thiếu URL. Metro khác cùng dự án `:8081` trả iOS manifest HTTP 200, bundle 6,068,958 byte có URL, `keepAudioSessionActive`, `playbackIntent` và metering; đã ghi làm preview candidate `exp://192.168.100.36:8081`, chờ người dùng reload/kiểm STT thật. Gateway health/smoke pass.
- `docs/VOICE_HANDOFF.md` now has six canonical speech/follow-up pairs and a short cancel/change-point/network/mic-denied checklist for manual iPhone QA; record per-point PASS/FAIL, no audio upload.
- Android export lần đầu lỗi Node zone-allocation OOM khi Metro cũ `:8087` còn giữ ~1.4 GB; đã dừng đúng tiến trình cũ không phản hồi, giữ `:8081` và `:8089`, sau đó export Android pass. Không restart/lách review Metro; lần restart trước từ agent bị tool review từ chối, dùng hướng dẫn thủ công trong `docs/VOICE_HANDOFF.md` khi cần nạp `.env.local` vào Metro.

## 2026-10-14 — Kiểm tra lượt voice thứ hai

- Người dùng tiếp tục báo: lượt đầu voice trả lời, lượt hai lỗi và mất meter trên iPhone. Nguyên nhân vẫn chưa được tái hiện trực tiếp.
- `stopAudioPlayer()` đổi từ pause + seek sang tắt loop + pause; lượt Play mới vẫn thay track từ đầu. Mục tiêu là bỏ seek khỏi đường đổi AVAudioSession; xem là biện pháp giảm race, chưa phải xác nhận root cause iOS.
- Kiểm tra sau đổi: playback regression 6/6; `npm test` 158/158; typecheck, lint và iOS JS export đạt. Android release APK 121,245,016 byte, SHA-256 `1C0F0DCEBA8523EA871E9240D42E933ED644AEF83B3B14DC031A65DBEC717D46`; API 37 AVD dừng answer đang phát, thu có meter, Hủy, rồi thu lượt hai có meter. Cả hai clip hủy cục bộ, không gửi.
- Gateway `:8788/health` ready; Metro `:8089/status` không phản hồi; Android bundle không có gateway URL nên không kiểm STT. Cần người dùng retest iPhone; chưa có ảnh lỗi/transcript nguyên văn. Không commit/push theo prompt Goal Voice hiện hành.

## Current voice update — 2026-10-14

- User authorizes Voice V0–V7. The current goal explicitly prohibits commits and pushes; do not commit/push unless the user gives newer direct authorization. No paid service or public gateway.
- User again reports: first iPhone voice turn works; the second fails without the moving meter. Cause is not yet confirmed on device. Code review found another possible race: a delayed auto-answer callback in `QaScreen` could restart playback after a new mic turn had already begun. A playback-intent generation now cancels that stale callback on mic start, manual track actions, new questions, and screen blur. The earlier native-player stop acknowledgement and recorder-start/metering guards remain in place.
- Verification after this guard: UI flow 28/28; full `npm test` 156/156; typecheck and lint pass; iOS JS export succeeds (bundle `index-41c76f4c413cbc235bdc07e89fb7df20.hbc`). The API 37 Android APK build/install from the prior check still passes, but neither emulator nor export confirms iPhone audio behavior.
- Fresh V1 catalogue validation completed 2026-10-14: 34/34 clips, 7.0 minutes, 5.04 MB; manifest SHA-256 `90747665D049CC3B4AF018672EF0935805F324236986D8F2047DC79B440113E9`. Automatic ASR WER is highest for `qa-flowers-answer` (23.1%), `qa-cake-answer` (18.9%) and `demo-01-caption` (17.6%); this does not prove pronunciation errors. Full local report: `tools/voice/.cache/v1-qc/report.json`. Human listening/QC remains pending.
- Synthetic gateway contract smoke rerun passed on 2026-10-14: local 19.15s synthetic clip; transcript response, invalid-format, duration and silence guards. `/health` is ready; listener is bound to private interface `192.168.100.36:8788` (PID 42408), not all interfaces. No personal audio used.
- Fresh Android release build from current source succeeded (377 tasks; 30 executed, 347 up-to-date), APK 121,244,960 bytes, SHA-256 `AC05A7E98F4A42B51021D2FFF554091764766FB5033ADABD901D5AE5BC4D7831`; installed/launched as `com.valentino241.ngokedemo` on API 37 AVD. Player reached 00:00, mic start paused it and showed a live meter, and Cancel returned idle. Revoked mic permission → OS prompt → deny showed Vietnamese fallback; granting again and tapping Retry started recorder, then Cancel returned idle. Screenshots are in `agent_docs/evidence/voice/android-emulator/README.md`. No recording was submitted; APK had no gateway URL, so it does not prove STT/Q&A or iPhone second turn. Latest 2,000 logcat lines had zero fatal/ReactNativeJS errors.
- Gateway `192.168.100.36:8788/health` is ready; Metro `:8089` is not listening, so no current Expo Go preview is confirmed. Do not work around the tool policy that blocked a Metro restart; user can start it manually using `docs/VOICE_HANDOFF.md`.
- The iPhone second-turn retest remains necessary. Record whether the dock says “Đang bật micro…”, “Đang thu”, or an error; if STT returns unknown, share only the recognized text, never audio. GV3/GV5/GV7 remain open. No commit or push.

## 2026-10-14 — Bounded player handoff fix and push authorization

- User repeated the iPhone issue: voice turn 1 succeeds; turn 2 fails without the meter. Updated `stopAudioPlayer()` to turn off looping, pause, await native seek with a 1-second bound, then confirm playback is stopped before microphone startup. Failed or stalled seek may proceed only when playback is confirmed stopped; otherwise the mic remains blocked with an error. This addresses the handoff path but is not yet confirmed on iPhone.
- Added regression cases for awaited seek, seek rejection, seek timeout, and player that never pauses. Voice playback helper 7/7; full mobile suite **158/158**; TypeScript, ESLint, `git diff --check`, and Expo iOS JS export pass (1,073 modules).
- Current Metro `:8089` is running; gateway `192.168.100.36:8788/health` is ready. Metro lacks `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL`, so the current bundle cannot test STT. iPhone reload/retest remains pending; Android release evidence predates this JS change.
- User later explicitly requested “tự động push sau mỗi lần xong”, which supersedes the earlier no-push instruction in the Voice prompt. Push only the completed, scoped changes after validation; do not include unrelated workspace files without review.

## Historical status before playback-pause acknowledgement — 2026-10-14

- At that earlier snapshot, Voice V0–V7 authorization remained active and the note said not to commit or push. A later instruction temporarily authorized automatic push; the current goal explicitly prohibits commits/push again, so follow the current instruction.
- User confirms the first iPhone voice turn answered, but the second turn loses its meter and fails. No device log or raw meter value is available, so the cause is not proven.
- Recorder start now waits up to 1 second for Expo Audio's native `isRecording` state before showing “Đang thu”; cancellation stops a late-starting recorder, and a failed start is cleaned up. A late answer-playback callback is also discarded after its audio-mode await if a new mic turn invalidated it. These address delayed starts and a plausible audio-mode race; a native recorder that reports active while returning no microphone signal still needs iPhone diagnosis.
- Gateway `192.168.100.36:8788` is ready (Node 24.14.1, faster-whisper 1.2.1, pinned `Systran/faster-whisper-small`). Metro `:8087` status responds but iOS bundle fetch times out; `:8089` and `:8090` are stopped. No live Expo Go preview is confirmed.
- Current checks: `npm test` 152/152; typecheck/lint, iOS JS export and Android release build pass. APK 121,243,192 bytes, SHA-256 `C21ACE29D356F779A16219CCA8AEE75527B805B983F90B8B13A3C15A0751CA0C` is installed/launched on Android API 37 AVD. These are not physical iPhone validation or an iOS native build. GV3/GV5/GV7 remain open.
- Retest after reloading Expo Go. If “Đang thu” appears but the meter stays empty, report that separately from a start error; if STT fails, send the exact text in **Xem câu đã nhận dạng**. No audio upload is needed.

### Follow-up after the iPhone second-turn report — 14/10/2026

- The awaited-seek stop change did not resolve the user's report; stopping now disables looping and pauses without waiting on native seek. Explicit replay still rewinds. Stop regression passes.
- `npm test` 152/152, typecheck/lint, iOS JS export and Android release build pass. APK SHA-256 `C21ACE29D356F779A16219CCA8AEE75527B805B983F90B8B13A3C15A0751CA0C` is installed/launched on API 37 AVD; no real speech submitted.
- Gateway is ready. Metro `:8087` status responds but iOS bundle fetch times out; `:8089` and `:8090` are stopped. Tool rejected restarting Metro with “blocked by policy,” so no working Expo Go preview is confirmed. Manual start instructions are in `docs/VOICE_HANDOFF.md`. Physical iPhone retest and GV3/GV5/GV7 remain open.

## Latest Voice status — 2026-10-13

- User authorization remains active for implementation and internal GV0–GV7 checks across Voice V0–V7; proceed without per-phase approval. Scope still excludes LLM, AR, broad backend CRUD, paid subscriptions/resources, public deployment, and commit/push. No private audio was uploaded.
- Current Wi‑Fi gateway: `192.168.100.36:8788`, PID 42784, bound to the private Wi‑Fi interface; Node 24.14.1/faster-whisper 1.2.1 ready. Synthetic TTS smoke HTTP 200 with context echo; 21s audio rejected and invalid format rejected. Reprobe on six synthetic clips: selected Đoan Trang WER 7.9% exact (5.1% folded diacritics), weighted RTF 0.213; real mic accuracy needs testing.
- Current APK: 121,232,376 bytes, SHA-256 `C30FA2718E2A89E0818791015596AB3C41D21E1D0450B5F4ECD95A4C85D34A12`; bundle points to the current gateway, contains the timeout fix, and has 34 MP3s/accessibility labels. Android `assembleRelease` passed in 1m58s (377 tasks, 30 executed/347 up-to-date); APK installed/launched on Android API 37 AVD, but not on a physical phone.
- Added `transcribeVoiceRequest` so the 45s timeout covers response JSON body as well as headers. Fixed Live voice-answer/replay so it never attempts Demo audio; Live answer text remains collapsed and the screen explains how to open it. Tests cover timeout/network/malformed/stale responses plus Demo-vs-Live playback. Current checks: 135/135 tests, typecheck, lint, dependency check, and gateway integration smoke pass.
- Android/iOS JS exports passed with the current URL, but no native iOS build/device test. Gradle bundle task now tracks the URL in this generated `mobile/android` tree; verified task invalidation after changing and restoring it. That tree is Git-ignored, so the handoff keeps `--rerun-tasks` for reliable regeneration/builds.
- Metro preview was restarted with `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL=http://192.168.100.36:8788`; `/status` is live and iOS/Android dev bundles returned HTTP 200 with the Live fallback and gateway URL. No physical phone has opened it yet; AVD screenshots capture Q&A and explicit text opening.
- Still pending: phone app-mic → STT → fixed Q&A/audio E2E, human listening/QC of all 34 clips, real-device audio routes/accessibility/performance, and iOS native. GV5/GV7 remain open; goal is not complete.

## 2026-10-13 — Authorization triển khai Voice V0–V7

- Người dùng đã dán trực tiếp yêu cầu triển khai trong `docs/LUNA_6_XHIGH_VOICE_PROMPT.md` và yêu cầu bắt đầu bằng kiểm tra repo, sau đó làm V0–V7 đến mức có thể bàn giao. Đây là authorization mới nhất cho Voice; gate GV0–GV7 là kiểm tra chất lượng nội bộ, không dừng chờ duyệt phase kế tiếp. Mâu thuẫn với quy tắc phase cũ trong `AGENTS.md`/MEMORY/spec được giới hạn trong Voice theo prompt mới.
- Phạm vi vẫn native Expo/React Native Android+iOS, TTS local VieNeu v3 Turbo ưu tiên, STT tiếng Việt qua gateway, Q&A cố định; không mở LLM/AR/backend CRUD toàn cục, mua dịch vụ, phát hành công khai/store, clone giọng, upload audio riêng tư, commit hoặc push. Quy tắc hệ thống, sandbox, kiểm tra an toàn và xin quyền công cụ vẫn giữ nguyên.
- Trạng thái khởi động: nhánh `main` sạch theo Git index nhưng có nhiều sửa đổi UI/UX/Voice chưa commit; giữ nguyên tất cả. `mobile/package.json` chưa có audio/recorder; chỉ có thay đổi local `react-native-svg`. Tài liệu/kịch bản/hi-fi V0–V7 đã được kiểm tra. Máy dev: Windows 11, Python 3.11.9, NVIDIA RTX 5060 Laptop GPU 8 GB, RAM vật lý 16 GB, RAM trống lúc kiểm tra khoảng 2.3 GB. Chưa có bằng chứng TTS/STT/device audio thật.
- Nguồn VieNeu chính thức được đọc qua agent-reach/Jina ngày 13/10/2026: SDK `vieneu` chạy v3 Turbo local, API cloud tách riêng và cần grant/key; không lấy hai đường này làm một. Bắt đầu probe V0 trước khi cài hay tải model. Kết quả probe/service hiện hành và blockers sẽ được cập nhật tại các voice review theo phase.

## 2026-10-13 — Trạng thái triển khai Voice sau authorization

- Đã ghi nhận authorization mới nhất: làm V0–V7 xuyên gate; GV0–GV7 là quality checks nội bộ, tự ghi kết quả rồi tiếp tục. Phạm vi/giới hạn không đổi; không mua dịch vụ, phát hành public/store, mở LLM/AR/backend CRUD toàn cục, upload audio cá nhân, commit hoặc push.
- V0: VieNeu v3 Turbo local SDK 3.7.1, model `61b85e3d937fbbacb387714180e8182823512523`, chọn preset Đoan Trang trên ba clip tổng hợp so với Ngọc Linh theo ASR WER; độ ấm/tự nhiên chưa có nghe người thật xác nhận. ASR là faster-whisper-small revision `536b0662742c02347bc0e980a01041f333bce120` CPU int8 qua Node 24/Python local gateway; không gọi cloud.
- V1: 34/34 canonical clips qua hash/text/node/revision/format/duration checks; 418.23s/5,043,834 bytes; mean level −21.0…−18.6 dBFS, peak −7.9…−3.4 dBFS. ASR là phép dò nội dung, chưa nghe tay; một số answer/caption có WER cao cần nghe.
- V2–V6: native audio UI/recorder, gateway adapter, fixed Q&A và intent/action đã được nối; `npm test` hiện 131/131, typecheck/lint/dependency check đạt; Android/iOS JS export và Android release APK build đạt. Gateway smoke nhận synthetic 19.15s, từ chối invalid format và clip PCM 21s.
- V7 snapshot mới nhất: Android API 37 emulator xác nhận player, guard thu 19.5s (500ms trước hard limit gateway 20s), UI giữ file với thời lượng thật `00:19`, Hủy và Back dừng thu; không gửi mic clip. APK LAN preview internal debug-signed 121,231,324 bytes, SHA-256 `0E86AC88AE758A587EED292D7C1EACDC26855A9C56125E2308CA54F49C13D9CE`; bundle chứa endpoint `192.168.88.174:8788`, đã cài/chạy trên emulator. AppOps cap 19.692s; Back 1.814s. Gateway `/health` ready; Metro/Expo Go port 8086 chưa chạy vì tool từ chối process launch theo policy. Phone/iOS, mic→STT app E2E, accessibility và performance còn pending; GV7 mở.
- Fix Expo env substitution: `App.tsx` now reads `process.env.EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL` as a direct property so Metro inlines it. Android/iOS exports (1,064/1,069 modules) both contain the LAN endpoint; APK built with the same env, while `mobile/app.json` remains blank. Physical-device delivery is available through the debug-signed APK; the actual phone-to-gateway request is still pending.
- `npm audit` có 23 advisory (8 moderate, 15 high); không ép downgrade SDK 57. Tài liệu trạng thái: `docs/VOICE_TEST_REPORT.md`, `docs/VOICE_HANDOFF.md`, `agent_docs/voice_v0_review.md`…`voice_v7_review.md`; README mobile có đường vào preview. Các ghi chú lịch sử cũ phía dưới không thay trạng thái này.

## 2026-10-13 — Prompt triển khai và Goal cho Luna 6 xhigh

- Người dùng yêu cầu tạo prompt để “luna 6 xhigh hoàn thành từ đầu đến cuối” và prompt để set Goal. Đã tạo `docs/LUNA_6_XHIGH_VOICE_PROMPT.md` (thực thi V0–V7) và `docs/VOICE_GOAL_PROMPT.md` (objective + tiêu chí complete).
- Prompt được soạn như lời user khi dán: cho phép đi xuyên các phase/gate chất lượng, tự chọn routine tech/preset từ probe, giữ các quyết định voice/hi-fi/hư cấu; không tự mua/public deploy/store/upload private audio/clone giọng/commit-push và không bỏ quy tắc hệ thống/sandbox.
- Đây chỉ là tạo tài liệu prompt, **chưa gửi sang agent/chat khác, chưa đổi model, chưa tạo Goal hoặc triển khai Voice** trong chat hiện tại. Authorization triển khai trong prompt có hiệu lực khi người dùng dùng nó làm yêu cầu thực thi, không coi file mới là agent đã bắt đầu làm.
- Goal không có budget/deadline tự đặt; complete đòi proof audio/STT/native/devices/preview, pending không đổi thành pass. Còn quyền/credential/device thực sự thiếu thì hỏi cụ thể và tiếp tục phần độc lập.

## 2026-10-13 — Roadmap hoàn thiện Voice V0–V7

- Người dùng yêu cầu “lên plan chi tiết các phase tiếp theo đến khi hoàn thiện luồng voice này”. Đã viết `docs/VOICE_PHASE_ROADMAP.md`; đây là quyền lập plan, chưa triển khai/gate Voice.
- Roadmap mới thay V0–V4 sơ bộ: **V0** probe/chốt giọng-ASR-budget-contract; **V1** 34 audio/manifest; **V2** hi-fi native/player/text đóng; **V3** recorder real/cancel; **V4** Voice-only gateway/STT; **V5** end-to-end Q&A/hỏi tiếp; **V6** intent/slot/inline action; **V7** Android+iOS thật, release/performance/preview và bàn giao.
- Mỗi phase có yêu cầu mã Vx.yy, file/phụ thuộc, kiểm/đầu ra, gate GV0–GV7 và Việc cần anh quyết/tự làm. Mốc V2 nghe, V5 Q&A real, V7 toàn luồng; không coi mock/export là kiểm mic/giọng thật.
- Đếm từ fixture hiện hành: 1 intro + 6 story + 6 caption + 21 answer = **34 audio core**. Phase V1 tạo trước local VieNeu theo giọng/revision đã chọn, text hash/version không lệch; STT riêng có cost/retention/auth/host cần chốt V0.
- Giới hạn clip 20s ban đầu là đề xuất V0; sau probe đã chốt recorder/gateway hard limit 20s, user bấm Gửi sau khi thu/dừng, gateway request timeout 45s. Ước lượng roadmap 12–21 ngày công là lịch sử, không deadline.
- Giữ nghe–nói foreground theo hành động, chữ đóng/nhấn mở, không hot mic/LLM/clone voice/AR/dẫn đường hoặc backend CRUD toàn cục. Gateway Voice hẹp cần scope/gate, public auth/HTTPS/rate-limit; không key trong app, không lưu audio cá nhân vào Git.
- Spec/Handoff Voice đã trỏ roadmap mới và đánh dấu chia đợt cũ là lịch sử. Baseline 113 tests xanh là kết quả lượt nội dung trước, không chạy lại trong lượt tài liệu. Không cài/tải model/package, tạo/gửi âm thanh, dùng API tính phí, deploy/commit/push.
- **Việc cần anh quyết / việc anh tự làm:** bắt đầu bằng V0 nếu duyệt; nghe/chốt preset/ASR/chi phí/hosting; cấp config an toàn và test phone khi tới phase. Mua quota/host/build trả phí được đánh dấu ngoài cam kết core, store/public production và clone voice ngoài roadmap; không ngầm duyệt mua/publish.

## 2026-10-13 — Thay copy kỹ thuật bằng truyện hư cấu để thu voice

- **Yêu cầu/authorization:** người dùng nói “thay câu chữ demo bằng câu chuyện giả với lời kể hấp dẫn để thu voice chứ không dùng như kiểu đây là dữ liệu demo”. Đã triển khai thay nội dung fixture và nhãn Q&A liên quan; quyền này không tự mở connector/audio/cloud/LLM.
- Canonical `data/demo.json` hiện là **Bức thư cuối ngõ**: An trở về với chìa khóa mẹ gửi, lần theo đồng hồ/gói xôi/hoa giấy/hộp thư/ánh đèn. 6 chương: Cổng ngõ, Hiên đồng hồ, Bếp đầu hè, Sân hoa giấy, Bậc thềm nắng, Đèn cuối ngõ. Có **21 Q&A**, mỗi điểm ≥3 và follow-up đúng chương.
- `intro.text`, story/caption/answer là văn nói tự nhiên, không chứa lời giải thích demo/phase/chờ data. UI/nguồn/disclaimer ghi rõ **Truyện hư cấu**; không bịa evidence lịch sử. Q&A đổi nhãn “Đã duyệt/Nguồn kiểm chứng” thành lời kể trong truyện/nguồn nội dung để không nhận truyện là tư liệu thật.
- Giữ schema 1/kind simulated, node ID demo-01–06, tọa độ, tags, phút ghé điểm và trạng thái; không đổi luật QR/GPS/khớp Q&A. Chỉ thêm câu/alias có kiểm; danh sách câu hỏi vẫn exact/alias, unknown không tự bịa. Đổi tên node nên test chọn pin không còn hardcode nhãn kỹ thuật; test missing Q&A vẫn kiểm bằng dataset rỗng riêng.
- `docs/VOICE_FICTION_SCRIPT.md` chứa lời mở đầu, 6 đoạn kể/caption và 21 đáp án để thu; metadata không đọc vào audio. Hifi LISTEN/TEXT SVG/PNG và spec/Handoff Voice/data README đã cập nhật tên truyện/nguồn/lời đáp mới. Mẫu compact/bảng cũ vẫn là lịch sử.
- Final: **113/113 tests đạt**, typecheck/lint sạch, Android/iOS Expo export đạt, hi-fi render 360×800 không tràn chữ, diff check đạt. Export chưa phải APK/IPA và chưa thử lại runtime native/giọng trên máy thật trong lượt nội dung.
- **Việc cần anh quyết / việc anh tự làm:** review lời kể/sắc thái rồi nghe mẫu giọng khi bước thu audio; voice ID/connector vẫn chưa chốt. Không cài/tải model, tạo audio, gọi dịch vụ tính phí, deploy/commit/push trong lượt này.

## 2026-10-13 — Thiết kế voice/tương tác thật và đánh giá VieNeu

- Feedback mới nhất: mẫu compact “quá thô, chưa có điểm nhấn về hình ảnh và UX”. Đã làm cặp hi-fi `docs/VOICE_UX_HIFI_LISTEN.svg/png` và `VOICE_UX_HIFI_TEXT.svg/png`, vẫn 360×800. Ảnh thật + logo hiện có, hero/giấy nối liền; voice rail xanh đậm 66, mic vàng từ logo 56, action hỏi/chọn trải nghiệm/điểm tiếp có trọng lượng khác nhau; Xem chữ là sheet đọc giữ audio và dock. Đây là mẫu hiện hành; compact/bảng 3 màn giữ lịch sử.
- Hi-fi đã render/xem ảnh cả 2 trạng thái, kiểm text và vùng chạm khai báo trong SVG; token nút vàng chỉnh đạt 4.99:1, player/giấy >12:1; thêm scrim trái cho chữ trên ảnh. Đây không phải native QA hay proof voice. Không đổi runtime app, không cài package/model hoặc gọi service.
- Feedback kế tiếp “đang làm app mà sao giao diện to thế?”: đã giảm mật độ/khối lớn và làm mẫu chính riêng `docs/VOICE_UX_MOBILE_COMPACT.svg` + PNG **360×800**; bảng ba màn cũ chỉ tham khảo trạng thái. Lề 16, title 19, label 13–15, player 118, dock 52; vùng bấm vẫn ≥48. Chưa đổi runtime app.
- Feedback mới nhất: khi có voice, thu nhỏ/ẩn ô text ở giao diện chính, chỉ hiện khi bấm. Đã cập nhật spec/storyboard: **Xem chữ / Thu gọn** cho story/transcript/answer; **Gõ chữ** mở drawer input; toggle không dừng/reset audio; không đổi runtime app khi voice chưa triển khai.
- Người dùng yêu cầu có voice/tương tác thật và thiết kế lại trải nghiệm trực tiếp từ UI hiện tại; chưa có yêu cầu triển khai code của spec mới trong lượt này.
- Đã chốt qua trả lời: **nhấn để nói, nghe trả lời, hỏi tiếp**; **nữ miền Bắc, ấm tự nhiên**; **nhận dạng tiếng Việt trực tuyến**. Khóa cloud giữ ở server. Không suy quyền lưu audio/huấn luyện/thu nền từ lựa chọn này.
- Người dùng gửi `https://www.vieneu.io/#/studio`, đề xuất dùng nếu phương án ban đầu mất phí. Đã kiểm website/Studio/docs/repo/model card: cloud/Studio tính token, Starter công khai 99.000đ tại ngày kiểm; v4 độc quyền; v3 Turbo mở Apache-2.0 chạy PC không có phí API theo lượt. Không coi hai bản cùng giọng/chất lượng.
- Đề xuất **VieNeu v3 Turbo tạo trước audio** cho story/Q&A đã duyệt, bundle/cache và player thật; shortlist Ngọc Linh/Đoan Trang nữ Bắc sau nghe mẫu. STT online vẫn cần engine riêng/probe, chưa xác minh STT API của VieNeu từ docs đã đọc; không hứa toàn bộ voice miễn phí.
- Review source/ảnh native 12/10: UI thiên về đọc/chuyển màn, Sổ tay hai nghĩa; fixture 6 Q&A chỉ ở demo-01, điểm 02–06 chưa có Q&A. Matcher chính xác/alias nên cần alias nói được review, unknown không bịa. Story “đang đứng” cần review trước audio khi người dùng chỉ xem điểm.
- Đã tạo `docs/VOICE_INTERACTION_UX_SPEC.md`, `docs/VOICE_UX_STORYBOARD.svg` và PNG, `docs/VOICE_VIENEU_REVIEW.md`; cập nhật Handoff Voice. Trang kể đề xuất có transcript/nguồn/player/chip hỏi tiếp/thẻ hành động, dock mic/Gõ chữ và cancel; slot/intent giới hạn, không LLM.
- SVG đã render và kiểm thị giác, dùng ảnh thật từ app và text fixture; đây là thiết kế, không native runtime hoặc proof voice. Không xây web/PWA.
- Chưa cài/tải model/package, gọi STT/TTS, tạo/nghe mẫu audio, bấm thao tác tính phí, cấp mic website, clone giọng, deploy hoặc sửa runtime app. Không dùng thông tin tài khoản trình duyệt trong tài liệu.
- **Việc cần anh quyết / việc anh tự làm:** review bố cục/đợt V0–V4, chọn local v3 hay cloud có quota, nghe/chốt voice ID và chọn ASR engine/ngân sách/retention; thử iPhone/Android thật khi triển khai. Có spec cụ thể để review trước coding theo phạm vi Voice riêng; yêu cầu mới này không tự mở toàn bộ backend/LLM.

## 2026-10-12 — Triển khai phần còn lại của UX/motion

- **Authorization mới nhất:** người dùng nói “triển khai phần còn lại đi”; đã duyệt code A–D theo `docs/UI_UX_IMPROVEMENT_PLAN.md`. Thông tin “chưa duyệt plan” ở các mục cũ bên dưới là lịch sử, không còn chặn công việc này.
- Đã sửa Prologue replace/chống bấm lặp và stack Q&A/Plan; bỏ micro/waveform/timer giả. Home cuộn cả đường ngõ/thẻ điểm, dock trong bố cục; Q&A chữ rõ/nguồn riêng/empty nền giấy; Landing/Plan rút gọn, icon SVG và copy Demo/Live đúng nguồn.
- MotionProvider dùng focus/AppState/Reduce Motion; loop dừng/reset khi ẩn; drawer xử lý callback đóng cũ, focus sau Modal và hủy focus đang chờ; ảnh không đổi trước load; câu trả lời chỉ tự cuộn sau câu hỏi mới.
- GPS bỏ kết quả muộn sau Back/hủy/chọn tay; camera đóng background/blur, chỉ nhận QR đầu mỗi lượt. Không mở backend/Voice/hộ chiếu lưu lâu dài, không đổi fixture văn hóa, không thêm dependency.
- Final checks: **111/111 test đạt**, typecheck/lint sạch, Android và iOS Expo export đạt, `git diff --check` đạt. Không nhận Expo export là APK/IPA release.
- Android Expo Go kiểm luồng bìa→Landing→Home→Q&A; Q&A→Plan→chọn 05→Back Home; nhập chữ/bàn phím tự hiện; viewport 1800×1080 cuộn tới pin 5/6 và CTA thẻ mở đúng 01; font 1.5 Prologue/Home/Q&A; Reduce Motion tĩnh.
- D đã hoàn thiện code/QA emulator, **chưa nghiệm thu iOS runtime, thiết bị thật, TalkBack/VoiceOver, lens QR, GPS ngoài đường, release frame-time/jank/FPS**. Test quyền/kết quả muộn có mock; không gọi đó là E2E phần cứng.
- Bàn giao: `docs/UI_UX_IMPLEMENTATION_HANDOFF.md`; ảnh `agent_docs/evidence/ui-ux-implementation-2026-10-12/`. Ảnh 02/03/09/15 là kiểm trung gian, file 06/07/11 đã chụp lại kết quả cuối. Gear Tools là Expo Go.
- Chưa commit/push/publish/deploy lượt này. Metro 8085 và emulator do agent chạy để QA đã dừng khi bàn giao, thiết lập test được khôi phục; lần thử tiếp cần server native mà điện thoại truy cập được.
- **Việc cần anh quyết / việc anh tự làm:** không còn quyết định chặn code đã duyệt; review thị giác và thử iPhone/Android thật, QR/GPS, Back/bàn phím/Reduce Motion/chữ lớn; đo bản release trước khi nghiệm thu độ mượt. Checklist trong bàn giao.


> Bộ nhớ thuộc dự án. Cập nhật theo sự kiện đã xảy ra; không suy duyệt phase từ việc sửa tài liệu.

## Rà soát UI/UX mới và bỏ thống kê — 12/10/2026

- Người dùng yêu cầu kiểm kỹ logic/test và lập plan làm UX đẹp, hiệu ứng mượt. Mô tả lỗi: bấm màn đầu rồi Back bị lỗi; màn đầu chỉ cần bấm để vào, không cần quay lại.
- Đã tái hiện native Android: Prologue fade opacity về 0 nhưng dùng navigate, Back quay lại instance đã ẩn. Đề xuất replace Landing; chưa sửa lỗi này trong lượt lập plan.
- Tìm thêm Home cắt điểm/CTA ở cửa sổ thấp, micro giả/timer mở drawer muộn, stack Q&A/Sổ tay tích màn, motion không quản focus/AppState/Reduce Motion, drawer không có exit, notice khó đọc và copy Demo trên Live. Phân biệt lỗi đã tái hiện với probe và đề xuất trong báo cáo.
- Người dùng gửi ảnh và nói **“bỏ phần này đi, kh hợp lý lắm”**: đã bỏ hàng 5 bìa ngõ / 6 điểm / 100% ảnh ở Landing, hook animation và style chỉ dành cho hàng này. Đây là thay đổi source duy nhất của lượt; ảnh demo chung vẫn được phép.
- Baseline và chạy lại sau bỏ stats: **100/100 test đạt**; typecheck/lint đạt, diff check đạt. Android/iOS export đạt trước bỏ stats. Test mock hiện bỏ qua giá trị/callback hủy của animation và Prologue thật nên test xanh không phủ lỗi Back.
- Đã kiểm Android emulator Expo Go: Prologue/Back, Home/Q&A/câu trả lời, Plan ẩm thực 15 phút/điểm 05, Home cửa sổ thấp, Landing sau bỏ stats. Có probe timer/animation, StackRouter thật và nguồn Live kiểm soát. Không dùng XML cũ khi uiautomator không chụp được do motion.
- Báo cáo: [docs/UI_UX_AUDIT_2026-10-12.md](docs/UI_UX_AUDIT_2026-10-12.md). Plan chi tiết: [docs/UI_UX_IMPROVEMENT_PLAN.md](docs/UI_UX_IMPROVEMENT_PLAN.md). 11 ảnh PNG hợp lệ tại `agent_docs/evidence/ui-ux-review-2026-10-12/`.
- **Chưa duyệt triển khai phần plan còn lại**; thứ tự đề xuất A logic → B layout/copy → C motion → D polish/nghiệm thu. Không commit/push, không mở backend/Voice. Giữ toàn bộ thay đổi local của người dùng.
- Chưa kiểm iOS runtime/thiết bị thật/QR qua lens/GPS thực/screen reader, ma trận bàn phím đầy đủ hoặc FPS bản release. Export không thay nghiệm thu iPhone. **Việc người dùng cần quyết/tự làm:** review plan để duyệt đợt triển khai; thử điện thoại thật khi chốt phần cứng.
- Đã dừng Metro và emulator do mình khởi chạy riêng cho lượt audit sau khi lưu bằng chứng; chưa deploy preview mới cho điện thoại. URL LAN ở lịch sử 11/10 không được xác nhận còn dùng được.

## Sửa lỗi khi người dùng test iOS — 11/10/2026

- Người dùng mở preview Expo Go và gửi màn lỗi yêu cầu `UIViewControllerBasedStatusBarAppearance = YES`. Nguyên nhân là các tùy chọn `statusBarStyle` của native stack vừa thêm trong lượt fix trước; thư viện `react-native-screens` báo lỗi khi host iOS không bật cấu hình này.
- Đã bỏ điều khiển status bar từ native stack, dùng `StatusBar` của React Native theo route và trạng thái nguồn. Giữ chữ sáng trên ảnh, chữ tối trên trang nền sáng/thiếu dữ liệu; không đổi plist hoặc dependency.
- **100/100 test đạt**, typecheck và lint các file thay đổi đạt; diff check đạt. Metro trả bundle iOS mới HTTP200 tại `exp://172.25.54.39:8085`; server giữ chạy. Thêm ca chuyển route/Demo/Live kiểm style và không truyền native-stack overrides.
- Chưa xác minh lại trực tiếp trên iPhone. **Việc người dùng tự làm:** bấm Reload JS hoặc mở lại preview trên Expo Go để xác nhận hết màn đỏ; không có quyết định chặn sửa lỗi này.

## Yêu cầu mới nhất — 11/10/2026: sửa logic sau Antigravity

- Người dùng yêu cầu rà soát bản Antigravity, đưa cách fix/cải thiện; sau báo cáo `docs/ANTIGRAVITY_LOGIC_REVIEW.md`, người dùng nói **“ở demo dùng ảnh chung cũng được, check lỗi logic khác”**, rồi **“fix đi”**. Đây là quyền sửa các lỗi logic trong báo cáo; không mở phase backend/Voice.
- Đã sửa 11 mục: tách điểm xem/xác nhận, Q&A theo điểm và reset, nối CTA Plan/Sổ tay, bỏ GPS/voice/tiến độ giả, thêm đường thoát khi thiếu dữ liệu, pin theo ID thực, retry Live, tổng ngân sách và parser tiếng Việt. Tiến độ đã mở theo phiên; hộ chiếu ghi rõ là mẫu.
- Thêm kiểm tra camera focus/quyền đến muộn và QR/chọn tay từ chối điểm đóng. Không đổi ảnh hoặc thêm dependency.
- Kết quả: **99/99 test, typecheck, lint, diff check đạt**; export Android/iOS đạt. Android 17/API37 + Expo Go57.0.9 đã kiểm native các luồng chuyển điểm, Q&A/nhập chữ, xác nhận tay ở GPS, Plan15 phút/CTA, Live thiếu cấu hình/chuyển Demo và danh sách ngõ.
- Bàn giao: [docs/UI_LOGIC_FIX_HANDOFF.md](docs/UI_LOGIC_FIX_HANDOFF.md). Ảnh: `agent_docs/evidence/ui-logic-fix-2026-10-11/`. Test UI callback/state dùng native modules thay thế, không thay bằng chứng phần cứng.
- Chưa thử điện thoại thật/iOS runtime/QR qua ống kính/GPS thực/TalkBack/VoiceOver và ma trận layout đầy đủ. Backend production chưa có; retry thành công/response đến muộn kiểm bằng request có kiểm soát. Chưa commit/push.
- **Việc cần người dùng quyết/tự làm:** không có quyết định chặn lượt sửa; người dùng thử trên thiết bị thật/iOS khi muốn chốt nghiệm thu phần cứng. Tiến độ lưu lâu dài/Voice/backend vẫn riêng scope. Lịch sử cũ bên dưới không ghi đè yêu cầu fix mới này.

## Yêu cầu mới nhất — 11/10/2026: review trước khi xây lại UI

- Người dùng yêu cầu: “đọc UI và toàn bộ dự án, t muốn xây lại UI trước khi xây đưa đề xuất cải thiện UX nữa”. Đây là yêu cầu đọc/review/đề xuất, chưa duyệt triển khai UI mới hoặc mở phase backend.
- Đã chọn hướng thị giác: **“Sổ tay ngõ phố: ấm, giàu bản sắc”**. Chưa chốt font/palette cụ thể hoặc thay đổi logic.
- Theo yêu cầu “trước khi triển khai tiếp git pull bản mới nhất về đã”, đã chạy `git pull --ff-only`; `main` đã cập nhật với `origin/main`, HEAD `25c9e8c`. Giữ nguyên `.idea/` chưa được Git theo dõi.
- Bản review và đề xuất: [docs/UI_UX_REBUILD_PROPOSAL.md](docs/UI_UX_REBUILD_PROPOSAL.md). Khuyến nghị UI + nối luồng + sửa UX liên quan; cần chốt phạm vi và ý nghĩa quỹ thời gian trước khi code.
- Chạy lại 90/90 test đạt. Kiểm thêm xác nhận 15/60 phút cho cùng danh sách; parser chưa nhận “ẩm thực”, nhận “1 tiếng rưỡi” thành 60; Q&A hiện toàn bộ thuộc `demo-01`. Chưa sửa source hoặc lưu các ca này thành test hồi quy.
- Đã xem ảnh lưu Phase 2–6 và đối chiếu source; ảnh Phase 7 không mở được do chữ ký PNG sai. Chưa chạy build/native E2E mới, thiết bị thật/iOS hoặc typecheck/lint trong lượt review này.
- **Bước tiếp theo:** người dùng review đề xuất, chọn phạm vi; không suy việc chọn phong cách là quyền triển khai. Phần trạng thái phase và lịch sử cũ bên dưới được giữ nguyên, không dùng các dòng lỗi thời để ghi đè yêu cầu mới này.

## Trạng thái hiện tại

| Mục | Giá trị |
| --- | --- |
| Cập nhật | 03/10/2026 |
| Phase hiện tại | **7 — đã bàn giao, chờ G7; kế tiếp là phase backend** |
| Trạng thái | **Phase7 kiểm thử xong, chờ anh duyệt demo; backend là phase kế tiếp** |
| Native mobile | **Home fixture/khung đã chạy Android emulator và thử offline sau nạp bundle; điện thoại thật/iOS chưa kiểm tra** |
| Implementation approved | **Phase 7 (R7.01–R7.03)** |
| Công cụ đang dùng | OpenCode |
| Trình độ A/B/C | Chưa xác định; “người A” trong plan là vai trò, không phải trình độ |
| Gate G0 / quyền bắt đầu Phase 1 | Đã được người dùng duyệt rõ ràng; cho phép dựng khung trước khi có source |

## Nhiệm vụ hiện tại

Triển khai Phase2 (giới thiệu, Q&A cố định có nguồn, hỏi tiếp) theo `docs/TECH_DEMO_PLAN.md`. Trước coding cần chốt nội dung Q&A/nguồn demo vì nội dung là việc người dùng duyệt (G2). Không mở phase sau, không yêu cầu source cũ.

- [x] Đối chiếu repo/source và lập bảng tiến độ thực tế trong `agent_docs/phase_1_review.md`.
- [x] Dựng Expo shell/navigation/placeholders, demo error/live empty và source-state tests.
- [x] Chạy npm ci/test/typecheck/lint/dependency/config/doctor và hai Metro exports; dev shell smoke.
- [x] Review code độc lập; sửa nhãn header trung tính và cập nhật hướng dẫn/bằng chứng.
- [x] Sau khi anh nhắc Android Studio: tìm SDK Windows và chạy shell trên AVD Medium_Phone, Android17/API37, Expo Go57.0.9. Có ảnh Home/placeholder, kiểm tra mode/Back/cuộn/chữ lớn/xoay ngang.
- [x] Home đọc fixture mới từ bundle; JSON một nguồn, schema/label/sáu node được kiểm tra. Tests20/20 + hai Metro exports + emulator/offline sau nạp bundle đạt.
- [x] **Phase1 được người dùng duyệt (G1) 03/10/2026.**
- [x] Phase2 code: giới thiệu, chip, ô nhập, normalize+alias, nguồn, unknown, hỏi tiếp; tests48/48 + emulator13/13. Báo cáo `agent_docs/phase_2_review.md`.
- [x] **Phase2 được người dùng duyệt 03/10/2026.** Nội dung Q&A vẫn là mô phỏng; khi thay bằng dữ liệu thật vẫn cần duyệt lại nội dung.
- [x] Phase3 code: chủ đề/quỹ thời gian + tối đa 3 điểm có lý do; tests59/59 + emulator13/13. Báo cáo `agent_docs/phase_3_review.md`.
- [x] **Phase3 được người dùng duyệt 03/10/2026.**
- [x] **Phase3 được người dùng duyệt 03/10/2026.**
- [x] Phase4 code: xin quyền đúng lúc → QR node đã biết → người kể 2D + caption → chọn tay → camera dừng khi rời màn; thêm dependency `expo-camera` 57.0.6. Tests69/69 + emulator19/19. Báo cáo `agent_docs/phase_4_review.md`.
- [x] **Phase4 được người dùng duyệt 03/10/2026.**
- [x] **Phase4 được người dùng duyệt 03/10/2026.**
- [x] Phase5 code: lấy vị trí khi bấm nút → **một** candidate + accuracy + khoảng cách → microcopy “có thể là…” → chỉ xác nhận của người dùng mới đổi node → xử lý từ chối quyền/accuracy kém/ngoài cụm. Thêm dependency `expo-location`. Tests81/81; emulator 6/6 cho phần quyền bị từ chối + chọn tay. Báo cáo `agent_docs/phase_5_review.md`.
- [x] **Phase5 được người dùng duyệt 03/10/2026.**
- [x] **Phase5 được người dùng duyệt 03/10/2026.**
- [x] Phase6 code: adapter live (timeout 8s, URL theo môi trường), 6 trạng thái empty/error, demo không cần mạng, máy chủ kiểm chứng cục bộ, tài liệu handoff data/UI. Tests90/90 + emulator27/27. Báo cáo `agent_docs/phase_6_review.md`.
- [x] **Phase6 được người dùng duyệt 03/10/2026.**
- [x] ~~Cung cấp URL backend thật~~ — anh quyết định 03/10/2026: **dự án tự viết backend**, không phải việc của anh.
- [x] **Phase7:** kịch bản demo 45/45 bước × 3 lần; 17/17 kiểm tra fallback/mode/cỡ chữ/nhãn; bàn giao `docs/TEST_REPORT.md` + handoff API/data/voice/UI. **Offline thật không đạt** (Expo Go cần mạng để khởi động). Báo cáo `agent_docs/phase_7_review.md`.
- [ ] Phase7 (cũ): kịch bản `giới thiệu → hỏi → chủ đề → nhận điểm → xác nhận → lời kể → hỏi tiếp` chạy lặp lại bằng fixture offline + log; kiểm fallback camera/GPS/QR, Q&A, chuyển mode, bàn phím, cỡ chữ; bàn giao API/data/voice và danh sách thiết bị.
- [ ] Chạy quét QR thật trên điện thoại thật (emulator không đưa được mã QR vào khung hình camera).
- [ ] Điện thoại thật/iOS vẫn chưa kiểm tra ở bất kỳ phase nào; emulator không thay điều kiện đó.

## Bằng chứng duyệt

- 02/10/2026: người dùng nói **“Tôi duyệt phase 0. Hãy triển khai phase 1 theo TECH_DEMO_PLAN.md, kiểm tra và bàn giao để tôi review.”** G0 đã được duyệt; được phép dựng shell/cài dependency Phase1 và kiểm tra, rồi dừng.
- Khi được hỏi về source gốc chưa có, người dùng chọn **“Dựng khung trước”**: cho phép shell + báo blocked; không tạo fixture/core/backend thay thế.
- Đính chính tiếp theo: **“anh không có mã nguồn em phải viết mã nguồn từ con số 0 á đây là dự án mới”**. Xác nhận greenfield, thay giả định chờ source gốc. Không suy đây là duyệt Phase2–7 hoặc duyệt nội dung lịch sử/evidence; tạo fixture/schema sẽ chốt theo đề xuất mới trước coding.
- Người dùng đồng ý đề xuất sáu điểm mô phỏng: **“anh đồng ý hoàn thiện phase 1 đi”**. Cho phép tạo fixture/schema tối thiểu và hoàn thiện Home/kiểm tra trong Phase1 ngay ở phiên này. Không duyệt lịch sử/evidence thật hoặc Phase2.
- 03/10/2026: **“Tôi duyệt phase 1. Hãy triển khai phase 2 theo TECH_DEMO_PLAN.md, kiểm tra và bàn giao để tôi review.”** G1 được duyệt; cho phép Phase2 (giới thiệu, Q&A cố định có nguồn, hỏi tiếp), cập nhật MEMORY/checklist theo bằng chứng rồi dừng trước phase sau. Không kèm duyệt Phase3–7/voice hay duyệt sẵn nội dung lịch sử.
- 03/10/2026: **“Tôi duyệt phase [4]. Hãy triển khai phase 5 theo TECH_DEMO_PLAN.md, kiểm tra và bàn giao để tôi review.”** Cho phép Phase5; không kèm duyệt Phase6–7/voice.
- 03/10/2026: anh yêu cầu **thêm rule bắt buộc**: mỗi lần bàn giao phải note riêng (1) việc chỉ người dùng quyết được, (2) việc người dùng phải tự làm — đánh dấu `[ngoài plan]` nếu không có trong `TECH_DEMO_PLAN.md`, kèm hệ quả nếu chưa làm. Rule nằm ở `AGENTS.md` § “Việc cần người dùng quyết hoặc tự làm”.
- 03/10/2026: **“Tôi duyệt phase [5]. Hãy triển khai phase 6 theo TECH_DEMO_PLAN.md, kiểm tra và bàn giao để tôi review.”** Cho phép Phase6; không kèm duyệt Phase7/voice.
- 03/10/2026: anh quyết định: **backend do em tự viết luôn** (không có sẵn gì, tự làm từ FE đến backend) và **em sinh data để làm MVP**, ghi rõ là mô phỏng; khi nào có data thật thì anh cập nhật sau. Hệ quả: cần một phase riêng cho backend Node 24 + SQLite + seed data, có duyệt trước; `tools/mock-api/` chỉ là công cụ kiểm chứng.
- 03/10/2026: **“Tôi duyệt phase [6]. Hãy triển khai phase 7 theo TECH_DEMO_PLAN.md, kiểm tra và bàn giao để tôi review.”** Cho phép Phase7; voice vẫn chưa duyệt. Phase 7 đóng băng scope: chỉ kiểm thử, sửa lỗi trong phạm vi đã duyệt và bàn giao.
- 03/10/2026: anh chốt Phase6 = **timeout 8 giây**; **URL live từ biến môi trường `EXPO_PUBLIC_NGOKE_API_BASE_URL` + `app.json extra.apiBaseUrl`**; **adapter + máy chủ kiểm chứng cục bộ**, không dựng backend production và không sinh dữ liệu thật.
- 03/10/2026: anh chốt Phase5 = **accuracy > 50 m hoặc cách > 300 m thì không đưa candidate**, chỉ báo lý do + chọn tay; **thêm tọa độ mô phỏng** cho 6 điểm và ghi rõ là mô phỏng.
- 03/10/2026: emulator **không cấp được fix GPS** (`geo fix` trả OK nhưng mọi provider `last location=null`, app log `Current location is unavailable`) → nhánh candidate/outside-cluster chỉ kiểm bằng unit test; cần điện thoại thật.
- 03/10/2026: anh thêm `expo-camera` 57.0.6 bằng `npx expo install`; mã QR theo công thức `ngo-ke://node/<id>` sinh từ `id`, không lưu trùng trong dataset.
- 03/10/2026: **“Tôi duyệt phase [3]. Hãy triển khai phase 4 theo TECH_DEMO_PLAN.md, kiểm tra và bàn giao để tôi review.”** Cho phép Phase4; không kèm duyệt Phase5–7/voice.
- 03/10/2026: anh chốt quy tắc Phase3 = **lọc theo chủ đề, bỏ điểm đã ghé/đóng, tối đa 3 điểm theo thời lượng tăng dần**; **quỹ thời gian bằng chip 15/30/45/60 phút, vẫn gõ tay được**.
- 03/10/2026: **“Tôi duyệt phase [2]. Hãy triển khai phase 3 theo TECH_DEMO_PLAN.md, kiểm tra và bàn giao để tôi review.”** Cho phép Phase3; không kèm duyệt Phase4–7/voice.
- 03/10/2026: anh chọn **“1”** = dựng Phase 2 với bộ Q&A mô phỏng tối thiểu để anh review luồng, sau đó thay bằng dữ liệu thật.
- 03/10/2026: anh yêu cầu **“bỏ PWA và web trong plan, giữ lại API, thêm TTS STT”**. Agent báo xung đột với plan (voice phải duyệt riêng; STT cloud cần key/mạng); anh xác nhịn: **bỏ hẳn web/PWA, giữ API, voice vẫn là phase riêng (Phase2 làm text)**. Plan/PRD/TechDesign đã cập nhật X.07 và các dòng web/PWA. Đã tạo `docs/DATA_COLLECTION_GUIDE.md` để anh giao nhóm data.
- Phase 3–7 chưa bắt đầu và chưa được duyệt. Voice chưa được duyệt riêng; chưa chọn connector/giọng.

Khi có duyệt mới, ghi ngày, trích yêu cầu, phase được phép và phạm vi; không tự tạo bằng chứng duyệt.

## Quyết định giữ nguyên

- **Không web/PWA** (quyết định 03/10/2026): không xây web preview/`public/`/PWA; mọi nghiệm thu chạy trên app native.
- Expo/React Native native Android/iOS; Node 24 + JSON API + SQLite theo plan (giữ nguyên).
- Fixture offline và live tách biệt; không LLM, không dẫn đường; GPS cần xác nhận; người kể 2D + caption.
- `data/demo.json` đã tạo theo đồng ý sáu điểm kỹ thuật mô phỏng. Không có `public/core.js`/backend cũ; viết logic/backend mới ở phase tương ứng, không bắt buộc tạo web/core để khớp giả định lịch sử.
- Repo gốc: **https://github.com/Desithedev/ngoke.git** (private, nhánh `main`), đã đẩy thành công 03/10/2026 với commit `da312d4` (116 file). Người dùng đã cho phép tạo remote và push. Tổng quan phase + dữ liệu: `docs/MVP_ROADMAP.md`. Repo `mobile/.git` do Expo CLI tạo đã chuyển ra `/tmp/opencode/backup/mobile-git-scaffold` để dựng được một repo duy nhất.
- `mobile/` đã tạo sau duyệt Phase1. Không hook/pipeline, deploy hoặc store build; scaffold Expo tự tạo Git local trong mobile với initial commit, không remote/push/commit tính năng.
- Scaffold đã chọn SDK57/React19.2.3/RN0.86.3/TypeScript strict, React Navigation native-stack, React state và Node tests; xem `agent_docs/tech_stack.md`/`mobile/package-lock.json`.

## Bước tiếp theo và thông tin còn thiếu

**Bước tiếp theo:** anh review `agent_docs/phase_7_review.md` và xem demo; sau đó em trình **spec phase backend** (phạm vi toàn cục) để anh duyệt trước khi code. Dữ liệu thật và voice vẫn chờ; `tools/mock-api/` giữ làm công cụ kiểm chứng. **Bước trước đó:** triển khai Phase7 theo TDD (adapter live với timeout 8s, cấu hình URL theo môi trường, máy chủ kiểm chứng cục bộ, tài liệu handoff data/UI), kiểm tra và bàn giao kèm mục việc cần anh quyết/tự làm; dừng trước Phase7. Dữ liệu thật và backend thật vẫn chờ anh.

**Còn thiếu:** điện thoại thật/iOS runtime/offline cold start/screen reader chưa thử; G1 cần điện thoại thật và review. Audit còn23 cảnh báo. Fixture/Home và offline sau tải bundle đã thử. Logic/Q&A/backend thuộc phase sau chưa duyệt, không phải blocker Phase1 chờ source.

**Theo phase sau:** nội dung Q&A (2), ranking/time budget (3), QR/2D asset (4), GPS/tọa độ khảo sát (5), API/schema/dataset thật (6). Voice chỉ làm rõ ở phase riêng. Budget/deadline chưa xác định.

## Kết quả kiểm tra gần nhất

Phase1 fixture, cwd `mobile/`: `npm test` **20/20**, typecheck/lint/dependency check/Doctor21/21 và exportAndroid826/iOS831 modules đều exit0. Metro resolve JSON ngoài root ban đầu fail → thêm `../data` vào watchFolders, export/native runtime đọc thật đạt. Không đổi dependencies/lockfile. `npm ci`/public config đã đạt ở lượt shell trước.

`npm audit --json`03/10 còn **23 cảnh báo (7 moderate/16 high), exit1**; dry-run exit1, không ép downgrade Expo44/RN0.72 hoặc force/override. Kết quả cũ12 là snapshot02/10, đã được thay bằng audit mới. Chi tiết: `agent_docs/phase_1_completion.md`, `agent_docs/evidence/phase-1/fixture-completion/checks.json`.

Android emulator bản fixture: **12/12 thao tác**, **4/4 layout**, **5/5 offline sau nạp bundle** đạt. Sáu tên đã thấy bằng cuộn; live không có list. Wi-Fi/data tắt và routes rỗng vẫn chuyển mode/xem6 node được. SDK tại `/mnt/d/Dev/Android/Sdk`, AVD Medium_Phone Android17/API37, Expo Go57.0.9; SDK ADB5038 riêng với O+Connect5037. Nếu5038 chưa quét emulator sau boot, restart chỉ5038. URL hiện `exp://172.28.197.254:8085`; IP có thể đổi sau reboot. Mạng/font/rotation đã khôi phục. Activity recreate có thể reset mode-in-memory, không persistence.

Bằng chứng hiện hành: `agent_docs/evidence/phase-1/fixture-completion/`, code review độc lập không có finding; reviewer rerun tests exit0. Điện thoại thật/iOS runtime/offline cold start và các luồng Phase2–7 chưa kiểm tra/triển khai. **G1 chưa đạt đầy đủ; MVP chưa hoàn thành. Dừng trước Phase2.**

Lịch sử: Part4 có22/22 kiểm tra tài liệu; shell/emulator cũ trong `phase_1_review.md`. Plan gốc được cập nhật đính chính greenfield theo lời người dùng; không tiếp tục khẳng định hash plan giữ nguyên sau đính chính.

## 2026-10-13 — Voice Android emulator regression QA

- Authorization hiện hành là phần “Authorization triển khai Voice V0–V7” ở đầu file: user cho phép làm xuyên các gate GV0–GV7 trong phạm vi Voice, tự tiếp tục sau kiểm tra nội bộ; sandbox/review/quyền công cụ vẫn giữ nguyên. Không mua dịch vụ, không public deploy/store, không ghi âm/tải lên âm thanh riêng tư, không commit/push.
- Có Android SDK/ADB/AVD thật trên máy qua `D:\Android\Sdk` (API 37), trái với ghi nhận môi trường trước khi tìm đúng đường dẫn. Android Gradle `:app:assembleRelease` build thành công và cài/chạy được APK native. APK cấu hình gateway `10.0.2.2:8787`, chỉ dành emulator.
- Reproduce bug sau khi audio kết thúc rồi đổi điểm: `AudioPlayer.pause` gọi trên shared object đã release làm app crash. Sửa `useVoiceSession` để cleanup unmount không gọi player đã auto-release; Expo hook tự release player. Kiểm emulator lại: đổi điểm khi player đang phát và sau hết clip không crash; Back dừng, vào lại không autoplay; pause/resume/replay từ 00:00/stop và mở transcript khi phát đạt.
- Android mic permission prompt đã kiểm bằng native dialog, nhưng không cấp quyền/thu âm. Từ chối ban đầu làm mất thông báo do app-state transition trong lúc permission request; giữ pending permission result trong lúc system prompt hiện, hủy background/recording ngoài đoạn pending, đặt turn về null khi lỗi để error không bị xóa. Regression tests cho pending permission, background và inactive state.
- Trên emulator, từ chối mic hiện rõ lý do và Gõ chữ/Thử lại. Không chứng minh recorder, codec hoặc mic vật lý.
- Local STT gateway `/health` sẵn sàng với Node 24.14.1/faster-whisper 1.2.1/pinned small model; probe audio TTS fictional `demo-02-caption` 3.76s trả HTTP 200 trong ~3.83s, transcript đúng nội dung với sai biệt casing `An/an`, context echo đúng. Không phải app recorder E2E.
- AVD tắt Wi-Fi/data: story MP3 đóng gói tiếp tục phát với progress native; STT không được coi là offline.
- Hiện tại: 125 tests pass; typecheck/lint/dependency check pass; Android/iOS Expo exports pass; Android native release build pass; Metro + gateway LAN `/status`/`/health` HTTP 200 ở `192.168.100.36`. Evidence: `agent_docs/evidence/voice/android-emulator/`; báo cáo/handoff/phase reviews đã cập nhật.
- Còn mở GV2/GV3/GV5/GV7: loa/tai nghe và microphone thật; clip từ phone → gateway → transcript → fixed answer/audio; iOS; 34 clip nghe tay; font/screen-reader/Reduce Motion/background/call; latency p50/p95, jank, memory/listener 20 vòng. `npm audit` còn 23 advisory (8 moderate, 15 high); không chạy force downgrade.
## 2026-10-13 — Voice scope regression follow-up

- Trong Q&A, `scope` được tạo từ mode, dataset revision và node. Audit phát hiện khi scope đổi trong lượt đang thu/xử lý, callback cũ có guard bỏ transcript nhưng stage có thể kẹt và player/error cũ còn lại. Đã sửa `useVoiceSession` để đổi scope hủy lượt/request, dừng player, xóa lỗi và reset stage; mở/đóng text không làm đổi scope. Thêm test helper cho chuyển chương/mode/revision và cùng scope.
- Kiểm lại hiện tại: `npm test` **126/126**, TypeScript, ESLint, Expo dependency check và `git diff --check` đạt. V1 validator rerun bằng `tools/voice/.venv` đã ghim: 34 clip, 7.0 phút, 5.04 MB; transcript ASR vẫn có các clip WER cao nhất 23.1%, 18.9%, 17.6%; nghe tay còn pending. Chạy validator bằng Python hệ thống thiếu `faster_whisper`, đã chuyển sang virtualenv đúng và rerun thành công.
- Chưa xác minh lỗi scope trên mic/gateway đang chạy ở điện thoại thật; không có thiết bị iOS/Android thật trong môi trường. GV5/GV7 vẫn pending, không tuyên bố voice E2E đã nghiệm thu. Không commit/push.

## 2026-10-13 — Voice final emulator verification

- APK release hiện hành build thành công, 121,218,160 bytes, SHA-256 `9CF65B96B90D195D8C9F241F371C2428CA339405B8D00346EDC796AB9CB65946`; đã cài và chạy trên Android API 37 emulator. Mở app, vào Q&A, đổi điểm 01→02→03; không crash và player về ready/00:00 khi đổi điểm. Không cấp quyền mic hay thu âm.
- Kiểm lại LAN hiện tại: Metro `/status` và gateway `/health` HTTP 200 tại `192.168.100.36`. APK native dùng `10.0.2.2:8787` cho emulator; phone cần Expo Go preview LAN cùng mạng riêng tin cậy.
- Tài liệu V7/evidence/test report/handoff ghi kết quả mới và test count **126/126**. `git diff --check` đạt. Chưa hoàn tất phone mic→gateway→transcript→answer, iOS, nghe tay 34 clip, accessibility và perf; GV5/GV7 vẫn mở. Working tree còn nhiều thay đổi local; không reset/commit/push.
- Retest phát trên APK mới: accessibility snapshot đầu ở điểm 04 báo ready/0% nhưng không ổn định trong lúc UI chuyển động. Kiểm tra trực quan lại trên cùng APK sạch tại Q&A point 01 xác nhận play/progress 00:01/00:23, replay từ đầu, pause giữ 00:01, resume lên 00:02 và stop về ready. APK hash không đổi; log chẩn đoán tạm đã gỡ. Test native này không cấp quyền/thu âm, không kiểm phone/iOS hay mic→gateway→answer E2E; GV5/GV7 còn mở. Bằng chứng: `agent_docs/evidence/voice/android-emulator/README.md`.

## 2026-10-13 — Voice keyboard UX native regression

- Native retest tìm thấy Android keyboard che mất text drawer trong lúc nhập. Đặt `KeyboardAvoidingView` behavior thành `height` trên Android; thêm regression assertion. APK release build lại, cài API 37 và drawer giờ nằm phía trên keyboard, thấy ô nhập và nút Gửi.
- Trên APK cuối, nhập `day la diem nao` match câu hỏi point 01; drawer đóng, answer đúng node hiện ra, không autoplay; bấm Play mới phát audio. Kiểm lại player controls trên cùng APK: replay, pause, resume, stop và tiến độ hoạt động.
- Final APK: 121,218,164 bytes; SHA-256 `7F102173A0135E6A3891D395E7052E550AB3C69EBAAB6B433D636BA95680D00A`. `npm test` 126/126; typecheck, lint và Expo dependency check đạt.
- Chưa có phone/iOS evidence, mic thu thật → gateway → answer E2E, nghe người thật toàn bộ catalogue hoặc kiểm accessibility/performance thiết bị; GV5/GV7 vẫn mở. Không upload âm thanh cá nhân và không commit/push.

## 2026-10-13 — Voice catalogue transcript review

- Đọc report ignored `tools/voice/.cache/v1-qc/report.json`: 34/34 clip, 418.23 giây, 5,043,834 bytes; Faster-Whisper small CPU int8. Các exact-WER cao nhất: `qa-flowers-answer` 23.08% (12.82% bỏ dấu), `qa-cake-answer` 18.92%, `demo-01-caption` 17.65%, `demo-04-caption`/`demo-05-caption` 14.29%. Ví dụ ASR nghe “Mẹ An trồng giàn” thành “Mẹ an chồng dàn” và “đĩa bánh” thành “điện bánh”. Đây chỉ là ASR hypothesis, không đủ chứng minh lỗi phát âm; chưa nghe tay nên không tái tạo clip vội.
- `adb devices -l` hiện chỉ có `emulator-5554`, không có Android/iPhone thật. GV2/GV3/GV5/GV7 vẫn cần nghiệm thu trên thiết bị thật, đặc biệt microphone native → gateway → transcript → answer; GV1 cần nghe tay toàn bộ 34 clip.

## 2026-10-13 — Voice large-text QA and LAN address refresh

- Native Android API 37 emulator ở `fontScale=2.0` lộ lỗi Home header chồng chữ, nhãn DEMO và placeholder tìm kiếm bị cắt. Đã sửa Landing xếp header dọc với hit target 48dp, làm DEMO pill co giãn và giới hạn placeholder tìm kiếm một dòng. Release APK hiện hành SHA-256 `C7A5653490A6B3DDF4EC5DA80875CA0F479EE1E7AC69F17B43E6F9EFCADA5658`, 121,218,612 bytes. Screenshots: `font-scale-200-home.png`, `font-scale-200-home-final.png`, `font-scale-200-alley-final.png`, `font-scale-200-story-final.png` trong `agent_docs/evidence/voice/android-emulator/`.
- `npm test` 126/126, typecheck, lint, Expo dependency check và Android release build đã đạt sau thay đổi UI. Emulator font scale trả về 1.0; host keyboard khiến software IME ở 200% không xác minh được. Không cấp mic/thu âm. Chưa có máy Android/iPhone thật.
- Wi-Fi host đổi từ `192.168.100.36` sang `192.168.88.174`. Gateway `/health` và Metro `/status` trả HTTP 200 mới nhất, nhưng Expo Android bundle fetch còn treo sau khoảng một phút và bị ngắt; Expo Go preview chưa xác minh ở IP mới. Tool policy từ chối thao tác restart Metro; không thử lách. Handoff cập nhật lệnh restart chính xác và phải coi phone preview còn pending.
- Authorization tiếp tục theo yêu cầu user trong prompt triển khai Voice V0–V7; gate GV0–GV7 là kiểm tra nội bộ, không hỏi duyệt giữa phase. GV5/GV7 và hoàn tất đầu-cuối vẫn pending cho tới khi có mic/device evidence; không commit/push, không dùng dịch vụ trả phí/public deploy.

## 2026-10-13 — Voice V1 catalogue validation rerun

- Rerun `tools/voice/.venv/Scripts/python.exe tools/voice/validate_catalogue_v1.py` hoàn tất exit 0 trên asset hiện tại. Đối chiếu 34/34 clip, 418.23 giây, 5,043,834 bytes; MP3 decode/format/duration và source/text/audio hash đạt. Manifest SHA-256 `90747665D049CC3B4AF018672EF0935805F324236986D8F2047DC79B440113E9` đúng report/cache. Highest ASR WER vẫn `qa-flowers-answer` 23.1%, `qa-cake-answer` 18.9%, `demo-01-caption` 17.6%; đây không phải nghe QC. Human listen toàn bộ 34 còn pending.

## 2026-10-13 — Voice large-text keyboard follow-up

- Trên APK LAN mới nhất (SHA-256 `0E86AC88AE758A587EED292D7C1EACDC26855A9C56125E2308CA54F49C13D9CE`) và AVD Android API 37, đặt fontScale 2.0, bật software IME dù emulator hardware keyboard đang dùng; khôi phục fontScale 1.0 và tắt chế độ IME đó sau kiểm.
- Kiểm luồng native point 01: mở chữ, bật drawer “Gõ”, thấy title/input/Gửi/suggested chips khi IME mở, gửi `day la diem nao`, nhận đúng answer cố định; answer player ở trạng thái sẵn sàng, không autoplay. Bằng chứng/screenshot được ghi trong `agent_docs/evidence/voice/android-emulator/README.md` và `docs/VOICE_TEST_REPORT.md`. Đây chỉ là emulator text-entry proof, không phải mic→STT hoặc phone accessibility.
- Android/iOS thật, mic app→gateway→answer, nghe người thật 34 clip và các phép đo hardware vẫn pending; giữ GV5/GV7 mở, không tuyên bố hoàn thành E2E. Authorization xuyên GV0–GV7 của user vẫn đang áp dụng trong phạm vi Voice; không dùng dịch vụ trả phí, không public deploy, không commit/push.

## 2026-10-13 — Voice managed-session revalidation

- APK LAN còn nguyên: 121,231,324 bytes, SHA-256 `0E86AC88AE758A587EED292D7C1EACDC26855A9C56125E2308CA54F49C13D9CE`. ADB hiện không thấy emulator hoặc điện thoại. Không khởi chạy AVD vì môi trường ghi ngoài workspace bị giới hạn.
- Gateway cũ không trả `/health`. Thử khởi động đúng worker địa phương trên private NIC `192.168.88.174:8788`; Node không spawn được Python worker (`EPERM`) và process thoát. Không đổi cơ chế để né policy; gateway hiện chưa dùng được.
- `npm test` parallel runner cũng gặp `spawn EPERM`; chạy tuần tự từng file test bằng Node test API trực tiếp: **14 files, 131 pass, 0 fail**. Typecheck/lint pass. V1 validator hoàn tất sau thời gian dài: 34 clip, 418.23 giây, 5,043,834 bytes, manifest SHA `90747665...113E9`; ASR WER cao nhất 23.1%, 18.9%, 17.6%, cần người nghe.
- Chưa có thiết bị thật, mic E2E, human audio QC hoặc iOS/performance evidence; GV5/GV7 còn mở. Gate authorization của user tiếp tục có hiệu lực.
- Audit accessibility Q&A tìm thấy 6 Pressable thiếu label; đã thêm nhãn động cho lời kể/câu trả lời/hỏi tiếp/chip/nút đặt câu khác và assertion vào `uiFlows.test.mjs`. Sau sửa: 14 test files, **131 pass/0 fail**, typecheck/lint pass; static scan `QaScreen` 17/17 role+label.
- APK chưa build lại sau accessibility fix. Wrapper chạy được khi cache đặt trong `%TEMP%`, nhưng Gradle cần JDK 17; máy chỉ có JRE 8 và Android Studio JBR 25.0.3. Không cài/tải JDK trong sandbox. Binary cũ vẫn SHA-256 `0E86AC88AE758A587EED292D7C1EACDC26855A9C56125E2308CA54F49C13D9CE`.
- Current gateway `/health` không kết nối, Node spawn Python worker trả `EPERM`; ADB không liệt kê emulator/phone. Giữ các blocker này cùng mic E2E, nghe tay 34 clip, iOS và performance; goal vẫn active.

## 2026-10-13 — Voice export/native rebuild follow-up

- Tìm được JDK 17 sẵn có trong máy và chạy lại Android `:app:assembleRelease` với Gradle home trong `%TEMP%`, dependency cache chỉ đọc. Gradle/CMake tới bước kiểm tra ABI của Clang nhưng dừng ở link probe; sau khoảng 9 phút không có CPU/file tiến triển, đã dừng đúng các PID của build do mình khởi chạy. APK không đổi: 121,231,324 byte, SHA-256 `0E86AC88AE758A587EED292D7C1EACDC26855A9C56125E2308CA54F49C13D9CE`.
- Export mặc định lỗi `spawn EPERM` khi Metro tạo Hermes bytecode. Android/iOS exports chạy lại với `expo export --platform <platform> --no-bytecode --clear` và `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL=http://192.168.88.174:8788` đều exit 0; sau `--clear`, cả hai JS bundles có URL LAN, 34 MP3 và accessibility labels Q&A. Đây chỉ là JS/static asset exports, không thay native APK/IPA.
- ADB hiện không liệt kê thiết bị; `/health` gateway hiện không kết nối vì Node không spawn được Python worker (`EPERM`). Không gửi audio mic. Kết quả tests gần nhất sau sửa accessibility vẫn 14 files, 131 pass/0 fail; typecheck/lint pass. Native rebuild, phone mic→gateway→Q&A, nghe tay 34 clips, iOS device và performance vẫn pending; GV5/GV7 mở.

## 2026-10-13 — Voice native APK rebuilt

- Authorization user: triển khai V0–V7 xuyên GV0–GV7 trong scope Voice đã được ghi trước đây; gates là kiểm tra nội bộ, không dừng xin duyệt từng phase. Không mở scope LLM/AR/toàn cục, không mua dịch vụ, public deploy, hoặc commit/push.
- Android `:app:assembleRelease --offline --no-daemon --max-workers=1` hoàn tất `BUILD SUCCESSFUL` trong 11m09s với JDK 17; Gradle home `%TEMP%\g`, 377 tasks (47 executed, 330 up-to-date). Rút ngắn đường dẫn Gradle temp và làm mới ba CMake cache sinh tự động xử lý lỗi Ninja path.
- APK `mobile/android/app/build/outputs/apk/release/app-release.apk`: 121,231,544 bytes, SHA-256 `E8CE9A8DB3E875F287E8F0638FD00566039535AEFAF645057F205FA2437831E7`. ZIP đã kiểm: 34 MP3, URL gateway LAN `http://192.168.88.174:8788`, accessibility labels có trong bundle.
- ADB không có device nên chưa cài/xác minh APK mới trên emulator hoặc điện thoại. Gateway vẫn lỗi `spawn EPERM` khi tạo Python worker; không gửi clip mic. Mic→STT→Q&A trên app, nghe tay 34 clip, phone/iOS accessibility/audio routes/performance còn pending; GV5/GV7 mở, goal chưa hoàn tất.

## 2026-10-13 — Voice LAN preview and current-IP APK

- Gateway sandbox launch first failed with `spawn EPERM`; after tool review, started the Voice-only server hidden and bound specifically to the current Wi-Fi interface `172.25.45.50:8788` (not `0.0.0.0`). Node 24.14.1/faster-whisper 1.2.1 startup log says `ready`; process remains running as PID 26972. No firewall changes, public exposure or cloud use.
- Synthetic TTS audio sent to `/v1/transcribe`: HTTP 200, 18.81s, transcript returned, `turnId`/locale/mode/nodeId/datasetRevision echoed. Invalid media returned HTTP 415 `UNSUPPORTED_AUDIO_FORMAT`; 21s PCM WAV returned HTTP 400 `AUDIO_TOO_LONG`. Transcript had word errors; human quality review remains pending. No personal audio was sent.
- Found Gradle incremental build did not treat `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL` as an input: it reported success while preserving old URL. Forced `:app:createBundleReleaseJsAndAssets --rerun-tasks`, verified generated HBC has new URL and no old URL, then `:app:assembleRelease` succeeded (3m26s, 38 executed/339 up-to-date).
- Final APK `mobile/android/app/build/outputs/apk/release/app-release.apk`: 121,231,544 bytes, SHA-256 `1020E39520285521871741E2BCE198D14E018DDEFC06B5A82258BBEE24773362`. ZIP verified 34 MP3s, `http://172.25.45.50:8788`, no `192.168.88.174` URL, and accessibility labels. ADB still has no devices; app-to-gateway from native mic, physical-phone reachability, iOS, human listening and hardware performance remain unverified. Goal active; GV5/GV7 open.

## 2026-10-13 — Android recorder codec and LAN revalidation

- Voice V0–V7 authorization remains scoped to the native app; phase gates are internal. No paid service, public deployment, private user audio, LLM, global CRUD, commit or push was authorized.
- Found why the first recorder upload was rejected: `prepareToRecordAsync({ isMeteringEnabled: true })` replaced Expo’s full preset options, so Android recorded AMR-NB under a `.m4a` name. `mobile/src/voice/useVoiceSession.ts` now keeps `RecordingPresets.HIGH_QUALITY` plus metering at recorder construction and prepares without a partial override.
- Verification: `npm test` 138/138; typecheck/lint pass; Android `:app:assembleRelease` BUILD SUCCESSFUL; `node tools/voice/gateway/smoke_test.mjs` passed with local generated TTS and guard cases. Current APK is 121,233,212 bytes, SHA-256 `159EE52016DCC4F5B5B5C9DC697AB4FD20B0294D99B13A64CC74B5DED38F6D98`.
- Installed APK on Android API 37 AVD, recorded and submitted a real 19-second recorder file from Q&A point 01. Gateway accepted it and faster-whisper returned HTTP 422 `NO_SPEECH` in 1.134s; UI showed retry guidance. The emulator contained no intelligible speech, so this proves upload/codec/ASR no-speech handling, not spoken transcript, answer selection or playback. Evidence: `agent_docs/evidence/voice/android-avd-stt-no-speech-2026-10-13.png`.
- Gateway is running hidden and bound to current private Wi-Fi `192.168.100.36:8788` (PID 42408); `/health` is HTTP 200. Expo Go Metro is running on port 8087 (PID 44232); `/status` and Android/iOS bundle fetches are HTTP 200; both bundles contain the gateway URL. Expo Go link: `exp://192.168.100.36:8087`.
- Goal is not complete: real speech from a physical phone, mic→transcript→Q&A→audio, iOS native/device testing, manual listen/QC of all 34 clips, accessibility/audio-route/performance testing remain pending. Do not mark gates GV3/GV5/GV7 complete from AVD silence or synthetic TTS.

## 2026-10-14 — Push preference update

- The user explicitly requested automatic commit and push after each completed change. This supersedes the earlier no-commit/push instruction for future completed work. Push only the completed, relevant files; keep local-only memory/device details out of public commits.

## 2026-10-14 — Active Voice goal push scope

- The latest user-provided Voice V0–V7 goal says not to commit or push. This supersedes the previous automatic push preference for this active goal. Continue locally and keep reports/evidence current without committing or pushing unless a newer user instruction changes scope.

## 2026-10-14 — iPhone Voice smoke retest

- Sau reload Expo Go bằng bundle Metro cổng 8089, người dùng xác nhận meter và câu trả lời đều chạy trong một lượt thử voice trên iPhone. Ghi nhận đây là happy-path do người dùng báo, không phải log/quan sát độc lập; chưa có transcript nguyên văn hoặc model/OS thiết bị.
- Android APK mới 121,235,376 byte, SHA-256 `20154EE9B845396E43ED7F76AAD5AFD9C3639A870E017D23FF670E469E531773`, đã build/cài/mở trên API 37 AVD; tới Q&A điểm 01, chip không autoplay, answer 9 giây loop sau khi bấm Play và Stop về Ready. Evidence trong `agent_docs/evidence/voice/android-emulator/`.
- Giữ GV5/GV7 mở: cần kiểm thêm câu hỏi/chương, cancel/interruption, quyền/network failure, route loa/tai nghe/Bluetooth, accessibility và hiệu năng; iOS native/IPA và nghe tay toàn bộ audio cũng chưa nghiệm thu. Không có audio cá nhân được gửi hoặc lưu.

## 2026-10-14 — iPhone second-turn meter failure

- User reported: first iPhone voice turn succeeds; second turn loses the real meter and fails. No exact second-turn transcript, screenshot, or device log was received, so this remains a device-retest item.
- Likely race found in the code: mic start fired `player.seekTo(0)` without awaiting native completion, then changed the audio mode and prepared the recorder while the answer could be looping. Playback stop is now awaitable; recording waits for stop/seek, and voice-answer playback waits for stop completion.
- Added regression coverage for awaited pause/seek and adjusted the async UI-flow test. Current checks: `npm test` 144/144, typecheck, lint, `git diff --check`, and iOS JS export pass. Metro `exp://192.168.100.36:8089` is running; its iOS bundle HTTP 200 contains the fix. Gateway `192.168.100.36:8788/health` is ready.
- Physical iPhone two-turn retest remains necessary before treating the issue as confirmed fixed. No commit/push was made in this goal scope.

## 2026-10-14 — Expo Go config and Android recorder re-entry

- Revalidated current services: Metro `/status` and local gateway `/health` ready at Wi-Fi host `192.168.100.36` (`8089`/`8788`). The first Metro process was missing `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL`; restarted with the private gateway URL. iOS/Android bundle HTTP checks confirm both contain the endpoint and stop/seek fix.
- AVD API 37 loaded current Expo Go bundle. Played the existing answer, started recording with visible meter, canceled, then started recording again with the meter visible at `00:02`; canceled without sending either clip. No recent JS fatal/load errors. This proves recorder re-entry after Cancel on emulator, not after a successful STT answer and not on iPhone.
- Added UI regression for two sequential voice transcript callbacks; the second exact question “Có chuyện xưa nào ở đây không?” routes to `qa-05-answer`. Full suite 144/144, typecheck/lint, iOS export pass. Goal remains active: physical iPhone second-turn/STT test, human QC of 34 audio files, full hardware/accessibility/performance checks remain open.
- Current V1 rerun exited 0 for all 34 catalogue files (418.23s, 5,043,834 bytes); highest ASR WER remains 23.1% on `qa-flowers-answer`. Gateway synthetic smoke test exited 0 with invalid-format/duration/silence guards. ASR is not human listening QC.

## 2026-10-14 — Second iPhone turn still fails

- User retested and reported that the first voice turn works, but the second still fails and does not show the meter. No stage screenshot, transcript, or native error was provided.
- The earlier awaited-seek change could block microphone preparation on a native callback. Seek is unnecessary for stopping: the track is inactive after stop and the next Play replaces it from the beginning. `stopAudioPlayer` now only disables looping and pauses; its regression asserts this path never seeks.
- Full mobile suite 144/144, typecheck, lint, `git diff --check`, iOS JavaScript export, current Expo Go iOS bundle fetch, Metro `/status`, and LAN gateway `/health` pass. Preview remains `exp://192.168.100.36:8089`; gateway `http://192.168.100.36:8788` is ready.
- Physical iPhone must retest after reload. This software fix is not yet confirmed on device. No commit/push; the active Voice goal explicitly excludes both.

## 2026-10-14 — Voice Q&A route regression across chapters

- Expanded `mobile/tests/uiFlows.test.mjs` to run every one of the 21 canonical Q&A questions in its chapter and then the first linked follow-up. All 42 controlled transcript callbacks chose the exact answer ID/text and answer track.
- UI-flow file passes 23/23; full mobile suite 145/145; typecheck/lint pass. This is screen-routing evidence only, not mic/ASR/hardware proof.
- Updated the roadmap, V5 review, test report and mobile README. GV5 remains open for physical mic→STT→answer/playback coverage; the reported second iPhone turn failure also remains unconfirmed after the pause-only player stop change. No commit/push.

## 2026-10-14 — Voice intent question/command separation

- Added a QaScreen regression: “Chương kế là gì?” and “Điểm kế tiếp là điểm nào?” leave the selected chapter unchanged; “Mở chương kế” selects the next available one.
- UI-flow suite is 24/24, full suite 146/146, typecheck/lint pass. This validates dispatch using supplied transcript strings, not live ASR.
- Updated V6 review, roadmap, report and README. GV6 device speech checks and GV5 physical mic→STT→answer remain open; do not infer completion from UI tests.

## 2026-10-14 — iPhone second-turn recorder reinitialization

- User again reported that turn 1 works but turn 2 has no meter and fails. iPhone reproduction/log/transcript is still unavailable; treat the code-level cause as likely, not confirmed.
- In Expo Audio's iOS implementation, `prepareToRecordAsync(options)` constructs a new `AVAudioRecorder`; calling it without options reuses the stopped recorder. The app deletes each submitted recording file, so the next turn now prepares with the full `HIGH_QUALITY + isMeteringEnabled` options again. The helper passes these options on every turn; a regression verifies two sequential preparations retain metering.
- Full suite: **148/148**, typecheck, lint, `git diff --check` and `npm run build:ios` pass. Metro `exp://192.168.100.36:8089` serves HTTP 200 and its iOS bundle contains the new recorder options; gateway `http://192.168.100.36:8788/health` is ready. AVD fontScale restored from 2.0 to 1.0 after Home/Landing large-text checks.
- AVD fontScale 2.0 Home now uses the scrollable text-first point trail, with labels/details wrapping and the story dock usable. Landing top and scrolled states were inspected. Evidence: `agent_docs/evidence/voice/android-emulator/android-api37-font-scale-200-{home-trail,landing-top,landing-scrolled}-2026-10-14.png`.
- Need the user to reload Expo Go and verify after answer 1 loops: start mic again, confirm the real meter moves, then ask “Có chuyện xưa nào ở đây không?” and check the `qa-05` answer. No physical iPhone verification is claimed; GV3/GV5/GV7 remain open. No commit/push under the active Voice goal instructions.

## 2026-10-14 — Follow-up after iPhone second-turn report

- Awaited native seek did not resolve the user's report and could leave microphone startup waiting for an iOS callback. `stopAudioPlayer()` now disables loop and pauses without seeking; explicit replay retains its rewind.
- Regression, full suite 152/152, typecheck/lint, iOS JS export and Android release build pass. New APK SHA-256 `C21ACE29D356F779A16219CCA8AEE75527B805B983F90B8B13A3C15A0751CA0C` is installed/launched on API 37 AVD.
- Metro `:8087` status responds but iOS bundle fetch timed out; `:8089` and `:8090` are stopped. A restart attempt was rejected by tool policy. No iPhone retest or live preview is confirmed; GV3/GV5/GV7 stay open.

## 2026-10-14 — Repeated native Android player-to-mic check

- User again reports: iPhone voice turn 1 returns an answer; turn 2 loses the meter and fails. Android API 37 release package `com.valentino241.ngokedemo` with mic permission granted was tested as player → mic → cancel → player → mic. Both microphone starts entered `Đang thu` with non-zero meter; no recording was submitted and logcat had no fatal error. Evidence is in `agent_docs/evidence/voice/android-emulator/README.md`.
- No code change was justified by the Android result; this does not diagnose the iPhone. Metro `:8089` is currently running at `exp://192.168.100.36:8089` but without `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL`, so it only supports recorder/meter/player checks. Gateway `/health` at `192.168.100.36:8788` is ready. Physical iPhone retest and STT follow-up remain pending; do not claim this issue fixed.

## 2026-10-14 — V7 Android recorder stress

- On API 37 release package `com.valentino241.ngokedemo`, completed 20 consecutive start/cancel cycles. AppOps confirmed native `RECORD_AUDIO` running before each cancel and stopped afterward; final dock was idle and the last 2,000 logcat lines had zero fatal entries.
- PSS checkpoints: 167,959 KB before, 176,922 KB after 10, 170,762 KB before the final 10, and 176,475 KB after 20. This fluctuated and is not a formal leak proof. No speech was submitted.
- Reported in `docs/VOICE_TEST_REPORT.md`, `docs/VOICE_PHASE_ROADMAP.md` and `agent_docs/voice_v7_review.md`. Physical iPhone second turn, full STT→answer hardware run, route/accessibility/performance QA and human listening remain pending. Current Metro `:8089` still lacks the gateway URL; no commit/push.

## 2026-10-14 — iPhone second-turn audio-session race

- User again reported: first iPhone voice turn works; the second loses the meter and fails. Expo Audio 57.0.5 iOS source identifies a concrete handoff race: `AudioPlayer.pause()` schedules audio-session deactivation 100ms later by default; that delayed task checks active players but not active recorders. A new recorder can start before the pending deactivation runs, leaving its mic session disabled.
- `mobile/src/voice/useVoiceSession.ts` now creates the player with `keepAudioSessionActive: true`, preventing that pause/finish deactivation during the player→recorder handoff. This is a source-backed likely cause; no native iPhone retest has confirmed resolution.
- Current verification: `npm test` passed **158/158**; typecheck, lint and `npm run build:ios` passed. The iOS command is a JavaScript/Hermes export, not an IPA/device test. Metro `:8089/status` returns HTTP 200, but its iOS bundle request times out; gateway `/health` at `192.168.100.36:8788` returns HTTP 200. Android repeat tests from the prior check do not prove iPhone behavior.
- Retest after reloading Expo Go: complete one voice question, then tap mic while/after its answer plays; verify the second meter moves and “Có chuyện xưa nào ở đây không?” returns the linked answer. Keep GV3/GV5/GV7 open until a physical-device retest. No commit/push under the active Voice goal.

## 2026-10-14 — Second-turn iPhone report and follow-up

- User reports turn one voice works, but turn two fails without the meter. Expo Audio 57.0.5 source has a 100 ms delayed iOS audio-session deactivation after pause; the player already uses `keepAudioSessionActive: true`. Added a 125 ms settle after pausing active playback so a pending native deactivation completes before recorder preparation reactivates the session.
- Regression verifies the pause promise waits through the handoff window. `npm test` 159/159, typecheck/lint, and iOS JS export (1073 modules) pass. Current Metro 8089 iOS bundle (6,062,119 chars) contains the settle guard, metering options and session/playback guards; it does not contain gateway URL `192.168.100.36:8788`. The gateway health endpoint is ready.
- This does not prove the iPhone issue fixed. Current bundle can verify player→mic→meter only; speech E2E and physical iPhone retest remain open. Do not commit/push under the active Voice goal.

## 2026-10-14 — Gateway configuration diagnosis and Android rebuild

- User screenshot shows “Chưa kết nối máy nhận giọng nói”. Gateway health at `192.168.100.36:8788` is ready, but the live Metro `:8089` bundle does not contain its URL. The immediate cause is the missing `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL` in Metro’s environment; restart Metro with the documented variable and reload Expo Go. The in-session Metro restart attempt with that variable was rejected by tool review and was not retried or bypassed.
- Android release from the current source builds successfully (377 Gradle tasks; 29 executed, 348 up-to-date), 121,245,316 bytes, SHA-256 `F43B2BAD13E1C938F2B07D0AA4F3002B6D2695BE25E1C13275DB86CAE891138B`; installed/launched on API 37 AVD with mic permission. No speech was submitted. This does not verify iPhone.
- Updated the exact restart command in `docs/VOICE_HANDOFF.md` and current APK status in `mobile/README.md`. Physical iPhone second-turn and mic→gateway→Q&A E2E remain pending.

## 2026-10-14 — Current Metro bundle stalled; configuration error copy clarified

- Current source now maps `VOICE_NOT_CONFIGURED` to a preview-configuration message instead of a generic “not connected” message. Full suite 159/159, TypeScript, ESLint and `git diff --check` pass. iOS export succeeds for 1073 modules (`index-8c517405923ea701bf26f9964215f9b9.hbc`); Metro cache deserialization warned, recovered by full crawl, and export completed.
- Rechecked live state: Metro PID 50116 listens on `:8089` and `/status` says running; iOS bundle fetch timed out after 90 seconds. Gateway PID 42408 at `192.168.100.36:8788` remains ready. Last previously fetched bundle lacked the gateway URL; current source copy is not confirmed on iPhone.
- Android release `F43B2BAD13E1C938F2B07D0AA4F3002B6D2695BE25E1C13275DB86CAE891138B` is installed/launched on API 37 with mic permission; no speech submitted. Metro restart with environment URL remains blocked by tool review; no bypass. iPhone retest and mic→gateway→Q&A/audio remain open, so goal stays active.

## 2026-10-14 — Local gateway URL and full voice asset revalidation

- Added Git-ignored `mobile/.env.local` with the current Wi-Fi gateway URL `http://192.168.100.36:8788`. Android and iOS JS exports (`--no-bytecode`) both load the file and embed the URL. The already-running Metro `:8089` remains on its old environment: `/status` is running and its current 6,062,157-character iOS bundle still lacks the URL. Restart + Expo Go reload is necessary for phone STT.
- Gateway `/health` currently reports ready, faster-whisper 1.2.1. Sent only a locally generated non-personal 19.15-second TTS WAV to the gateway's private Wi-Fi IP; HTTP 200, transcript nonempty, turnId/locale/mode/nodeId/datasetRevision matched. Loopback `127.0.0.1` is not the gateway's bind address; use `192.168.100.36` on this host/LAN.
- Re-ran the project `.venv` validator: 34/34 audio entries pass source/text/node/revision/hash, MP3 codec/format/duration, and audio-level checks. Manifest SHA-256 `90747665D049CC3B4AF018672EF0935805F324236986D8F2047DC79B440113E9`; total about 7 minutes/5.04 MB. Highest local synthetic-ASR WER 23.1% (`qa-flowers-answer`), which still needs human listening.
- Current `npm test` 159/159, typecheck, lint, Expo dependency check and `git diff --check` pass. Real iPhone speech/turn-two, human QC, hardware audio/accessibility/performance remain pending. Goal stays active; no commit/push.

## 2026-10-14 — Gateway cancel/retry integration regression

- Extended `tools/voice/gateway/smoke_test.mjs` to wait 1.5 seconds after upload, abort the active synthetic transcription, require the server's `REQUEST_CANCELLED` log, then submit another request and assert HTTP 200 with the new `turnId` and nonempty transcript. `node tools/voice/gateway/smoke_test.mjs` passed on Node 24/faster-whisper 1.2.1; invalid format, duration, silence and abort/retry checks passed without personal audio.
- This proves response cancellation and turn isolation at the local gateway boundary. Python inference already running continues until completion, where its `finally` removes the temp file; it is not immediate compute cancellation. The test does not close iPhone cancel/network paths.
- The same smoke test exhausts the 12-request source-IP quota with malformed content-type requests and asserts HTTP 429 `RATE_LIMITED`; it adds no audio traffic.
- No mobile source changed in this check. Physical iPhone STT/follow-up, human listening QC, phone accessibility/audio-route/performance checks remain open; goal stays active and no commit/push.
- Remaining effort estimate: about 2–4 engineering days once iPhone/manual listening checks can be run; allow 4–6 if those checks uncover new native/device-specific fixes. This excludes waiting for device access or Metro restart.

## 2026-10-14 — Revalidation after Metro bundle timeout

- Re-ran current checks: mobile tests **159/159**, TypeScript, ESLint, and Expo dependency check pass. Gateway real-STT smoke passed on faster-whisper 1.2.1 using a local synthetic 19.15-second Vietnamese TTS clip; abort/retry/turn isolation, quota, invalid format, duration and silence checks pass.
- Re-ran V1 catalogue validator: **34/34** MP3s pass source/text/node/revision/hash, codec/sample rate/channel/duration/level checks; total 7.0 minutes / 5.04 MB. Synthetic ASR flags `qa-flowers-answer` 23.1% and `qa-cake-answer` 18.9% WER; no human has listened/ticked the existing checklist.
- APK trong snapshot Metro cũ là 121,245,400 bytes, SHA-256 `33A094762839B03904BDD9872C08EB1046B37E14C87C1091853B21535BBE6295`; direct ZIP inspection confirmed its gateway URL. APK mới nhất được ghi ở cập nhật đầu MEMORY.md.
- Live gateway `/health` is `ready`. Metro `:8089/status` responds, but iOS bundle fetch timed out at 90 seconds and again at 210 seconds. Last successfully inspected live bundle lacked the URL. The Metro restart attempt with the URL was rejected by tool review; no bypass was attempted. `mobile/.env.local` and static Expo exports contain the URL, but Expo Go/iPhone is not confirmed on current source.
- Goal remains active. Required pending evidence: physical iPhone second turn through real STT→correct Q&A/audio; human listen/QC of all 34 clips; iOS/native audio routes, accessibility and performance. Do not claim V7 or full Voice complete; no commit/push.
- Re-exported current iOS source with `npm run build:ios -- --no-bytecode`: 1,073 modules, 1,608,216-character JS bundle; direct content check confirms `http://192.168.100.36:8788` is embedded. This isolates the issue to the live Metro/Expo Go bundle path, not static iOS bundling; it is not an IPA or iPhone test.

## 2026-10-14 — iPhone second-turn report and full Q&A matcher regression

- User confirms the second consecutive iPhone voice turn displayed a transcript and the correct answer, the answer was audible, and the live meter moved. Record one real-device follow-up STT→Q&A→playback success by user report; no raw audio/log or exact transcript/node was supplied.
- Host-side Metro `:8089` iOS bundle returns HTTP 200 (6,062,147 characters), but the bundle and its manifest do not contain/expose the gateway URL. `mobile/.env.local` has the URL while `app.json` `extra.voiceApiBaseUrl` is empty. This host-side probe was not reconciled with the successful phone report; do not infer that the user used another device or that STT failed.
- Added matcher coverage for every canonical question and alias across all six nodes, plus UI-flow coverage that maps all 21 transcript questions to their node-specific answer audio and rejects other-chapter questions. `npm test` 161/161, typecheck and lint pass.
- Remaining: broaden physical iPhone coverage across all six chapters/failure paths; listen/QC all 34 clips; complete iOS audio routes/accessibility/performance. Goal remains active; no commit/push.

## 2026-10-14 — Refresh phase evidence after iPhone follow-up retest

- Re-read repo state on `main`; preserved all existing 91 changed paths. The user-reported second-turn result after reload of `exp://192.168.100.36:8089` is: meter moved, transcript and correct Q&A answer appeared, and answer audio was audible. No independent phone/server trace was captured.
- From `mobile/`, `npm test` 161/161, `npm run typecheck`, `npm run lint`, and `npm run check:dependencies` all exit 0. `git diff --check` passes.
- Latest host-side request for Metro `:8089/manifest` timed out; this supersedes only the ability to inspect the manifest now, not the user's phone result. Earlier bundle probe returned HTTP 200 but did not expose the gateway URL. Leave the discrepancy unresolved without restarting/bypassing tool review.
- The user also confirms the second-turn meter moved. Updated current V3/V4/V5/V7 review notes, the roadmap phase table, `docs/VOICE_TEST_REPORT.md`, `docs/VOICE_HANDOFF.md`, and `mobile/README.md` to record one user-reported STT→correct Q&A→playback success; human listening QC, iPhone route/interruption/accessibility/performance and full 6-chapter mic coverage remain pending. Goal active; no commit/push.
- Host check sau đó: Metro :8081 trả /status HTTP 200 nhưng bundle GET timeout; :8089 cũng timeout; gateway :8788/health ready. Lệnh restart riêng Metro :8081 bị execution policy từ chối với “blocked by policy”; không thử đường vòng. Chưa cho người dùng test bundle :8081.

## 2026-10-14 — Revalidation after Metro restart and iPhone confirmation

- Supersedes the earlier memory note saying the `:8081` Metro restart was blocked: the old half-alive process was restarted normally in the existing foreground session. Metro `:8081/status`, iOS manifest and launch bundle return HTTP 200 from the dev host; the bundle has the current LAN gateway URL and mic-permission recovery branch.
- Current LAN gateway `/health` returns HTTP 200/ready (Node 24.14.1, faster-whisper 1.2.1). This confirms host services only, not reachability from the iPhone.
- User confirms the second consecutive voice turn on iPhone had a moving meter, transcript, correct answer and audible playback in Expo Go `:8089`. User deferred reloading/testing candidate `exp://192.168.100.36:8081`; do not prompt again until appropriate.
- Revalidated docs now distinguish that user-reported happy path from independent phone/server traces and from six-chapter/device failure-path acceptance. Mobile suite 167/167, typecheck/lint/Expo dependency checks pass; Android API 37 permission recovery was tested on a no-audio AVD.
- Re-ran `node tools/voice/gateway/smoke_test.mjs`: pass on Node 24.14.1/faster-whisper 1.2.1 using only a local synthetic 19.15-second TTS clip; abort/retry, quota, invalid-format, duration, silence and transcript-context checks passed. Re-ran mobile tests 167/167, typecheck, lint and Expo dependency check; all pass.
- Confirmed the current release APK on API 37 AVD is byte-for-byte the local artifact by SHA-256 `ED49FF5702BE20002184876F20FB34B828DF7BEFEA1F22A48FCE2F7944DC80E2`. Added the latest Settings-recovery screenshots and limitations to `agent_docs/evidence/voice/android-emulator/README.md`; AVD has no audio, so this still is not voice/STT proof.
- Inspected the current APK ZIP: `assets/index.android.bundle` is 1,983,744 bytes and includes the LAN gateway URL, `MIC_PERMISSION_BLOCKED` recovery and catalogue revision. That confirms Android packaging/config only, not a real STT turn.
- The release APK contains exactly 34 `.mp3` entries under `res/`; SHA-256 hashes of all embedded audio match the 34 source catalogue files exactly, with zero missing or extra files.
- Reran current Expo JS exports: iOS 1,073 modules, Android 1,068 modules; both metadata files list 34 MP3s and hash-set comparison confirms exact source parity. Both bundles include gateway URL and mic permission recovery. Android’s first export emitted a Metro cache deserialize warning but fell back and exported; the retry exited 0 without the warning. Exports are not native binaries.
- Re-ran V1 catalogue validation: 34/34 files pass text/source/node/revision/hash, MP3 decode/format/duration/level checks, total 418.23 seconds / 5,043,834 bytes; manifest SHA-256 remains `90747665D049CC3B4AF018672EF0935805F324236986D8F2047DC79B440113E9`. ASR WER leaders remain flowers 23.1%, cake 18.9%, demo-01 caption 17.6%; the listening checklist remains entirely unchecked, so V1 human QC is still pending.
- Still open: reload `:8081` on phone, spoken coverage across six chapters and error paths, human QC for 34 clips, iOS-native and real-device audio/accessibility/performance checks. No commit/push.

## 2026-10-14 — Gateway rejected-audio logging regression

- Removed the unsupported-format diagnostic that included declared MIME, byte count, and audio header bytes. The API still returns HTTP 415 `UNSUPPORTED_AUDIO_FORMAT`; the smoke test now asserts status/code/timing logs do not contain the filename, MIME, or header marker.
- Restarted the LAN gateway with the updated code. `/health` returned ready and a synthetic invalid multipart upload returned 415 with the matching turnId. Live logs contained only `voice status`, `code`, and elapsed `ms`; no personal audio was sent.
- Final local checks: mobile tests 167/167, typecheck, lint, Expo dependency check, gateway smoke, Node syntax check, and `git diff --check` pass. iPhone reload of `:8081` remains deferred; full V0–V7 acceptance is still open.
- Continuation host check: Metro `/status`, iOS bundle and gateway `/health` return HTTP 200. Current iOS bundle is 6,072,199 bytes, contains the LAN gateway URL and mic blocked-permission recovery branch, and omits the stale “Chưa kết nối máy nhận giọng nói” copy. This does not prove the iPhone reloaded it.

## 2026-10-14 — Voice continuation after deferred iPhone reload

- User explicitly deferred reloading `exp://192.168.100.36:8081`; do not ask again now. The prior user-reported Expo Go `:8089` second turn had a moving meter, transcript, correct answer and audible playback. This is one successful user-reported follow-up, not proof that the new `:8081` bundle or six chapters have passed.
- Re-read `useVoiceSession`, playback helpers and installed expo-audio iOS source. `keepAudioSessionActive: true` prevents pause/completion from calling delayed session deactivation; mic startup waits for player stop and checks turn scope after each async boundary. No additional source race found; real-device routes/interruption still need testing.
- Evaluated local `Systran/faster-whisper-large-v3` revision `edaa852ec7e145841d8ffdb056a99866b5f0a478` without changing production. Snapshot (3,087,284,237 bytes) remains in ignored `tools/voice/.cache/huggingface/`; model construction worked but CUDA inference failed because `cublas64_12.dll` is absent. Host RAM was below 0.25 GiB free, so CPU fallback was skipped. Do not report candidate accuracy/latency.
- Updated `docs/VOICE_TEST_REPORT.md` and `agent_docs/voice_v5_review.md` with the candidate failure and current pending status. Benchmark Python syntax check passed; full app source is unchanged in this continuation. `git diff --check` has no whitespace errors (only existing LF→CRLF warnings). Goal active; no commit/push.
- Matcher audit: do not globally strip internal commas. Known negative transcript `Vì sao, chiếc động hồ không chạy nữa?` would normalize to canonical clock question after comma removal + diacritic folding, turning a required `unknown` into a silent match. Do not add ASR-only aliases from synthetic TTS; exact matcher remains intentional. Reason recorded in the V5 review.
- Verified `node --test tests/qa.test.mjs` 24/24 and the current full mobile suite 167/167, exit 0. The full suite, typecheck, lint, and Expo dependency check were run after the latest source state; this turn only added documentation after them.

## Android accessibility pass — 14/10/2026

- Android API 37 AVD ran the current release APK after enlarging small voice-screen controls, announcing the selected Home mood, and adding runtime-measured bottom scroll space for the fixed dock. UIAutomator bounds show visible controls at 48 dp minimum height; the final question chip is fully visible after scrolling.
- Native evidence: `agent_docs/evidence/voice/android37-native-release-a11y-qa-2026-10-14.png` and matching UI hierarchy XMLs. This is emulator bounds/tree evidence only, not a TalkBack/VoiceOver check.
- After source changes: mobile tests 167/167, typecheck, lint, and Android `assembleRelease` pass. iPhone reload/test on `exp://192.168.100.36:8081` remains deferred by user; do not ask again yet.

## Android chapter-6 answer/text playback recheck — 14/10/2026

- Re-read current repository status and preserved all untracked local items. No source changes were made in this continuation; no commit/push.
- Current installed Android API 37 APK and local `app-release.apk` match exactly: `com.valentino241.ngokedemo`, version 0.1.0, 121,247,808 bytes, SHA-256 `D6BB16DCE259002D38D112DACA28E9DD91BF5D0681C005AEC9BB83025E8AB50D`.
- On chapter 6, selected the canonical first question `qa-letter`; answer text remained hidden until Xem chữ, then the UI hierarchy showed the exact catalogue answer. While the answer player was running, opening/collapsing text left the player playing near the same end position rather than resetting to zero. Screenshots: `android37-native-release-qa6-answer-text-playing-2026-10-14.png` and `android37-native-release-qa6-answer-text-collapsed-playing-2026-10-14.png`.
- AVD uses `-no-audio`; this is a native UI/player-state check, not audible playback, mic/STT, or hardware speech proof. Prior six-chapter sweep searched for answer text that is intentionally hidden; mark that check invalid, not an app failure and not six-chapter proof. Only chapter 6 was verified in this continuation.
- Current host spot-check: Metro `http://192.168.100.36:8081/status` and gateway `/health` both return HTTP 200; gateway reports `ready`. `mobile/.env.local` exists and is not tracked. This confirms host readiness/config only, not that Expo Go on iPhone loaded the bundle.
- Still open: listen to all 34 clips; iPhone reload/test on deferred `:8081`; real mic→STT→Q&A across six chapters; device audio routes/interruption, screen-reader/accessibility, performance, and remaining failure paths. Goal remains active.

## Duplicate-submit and late-response regression — 14/10/2026

- Failure-path audit found the hook rejected duplicate Gửi by synchronously entering `stopping`, but there was no direct test proving repeated calls during `stopping`/`transcribing` or cancel of an in-flight transcription.
- Added a controlled-promise regression in `mobile/tests/uiFlows.test.mjs`: one stop and one ASR request despite duplicate calls; cancel during stop prevents upload, cancel/point-revision change during ASR aborts, and later resolved transcripts are discarded. Targeted suite 34/34; full suite 168/168; typecheck, lint and Expo dependency check pass. The live gateway smoke also passed against Node 24.14.1/faster-whisper 1.2.1 using only the local synthetic clip and its validation cases.
- Rechecked Metro `:8081/status` and gateway `/health`: both HTTP 200, gateway `ready`; `.env.local` is present and untracked. These host checks do not confirm Expo Go on iPhone has reloaded `:8081`.
- Do not treat controlled hook tests or no-audio AVDs as voice hardware proof. Real iPhone test is still deferred by the user, human listening of 34 assets is pending, and speech coverage across all six chapters is not established. Goal remains active; no commit/push.

## Android native six-chapter Q&A UI sweep — 14/10/2026

- Revalidated the installed API 37 APK against the local artifact by pulling `base.apk`: both are 121,247,808 bytes with SHA-256 `D6BB16DCE259002D38D112DACA28E9DD91BF5D0681C005AEC9BB83025E8AB50D`, version 0.1.0.
- Tapped one suggested-question chip in each chapter. All six displayed a chapter-matching answer source, a Ready answer player (no chip autoplay), and the collapsed answer-text action. Captured six native screenshots plus UIAutomator XML under `agent_docs/evidence/voice/android37-six-chapter-ui-2026-10-14/`; README records method and per-chapter question.
- The six-chapter sweep is native UI/routing evidence only: this AVD has no audio hardware and did not exercise mic, STT, audible output, or iPhone. The old sweep that expected text to be visible by default was invalid; this new check fixes that verification mistake.
- Re-ran mobile validation: `npm test` 168/168, typecheck, lint, Expo dependency check and `git diff --check` pass. Only docs/evidence changed during this sweep; no app source changed.
- No source code changed. User-deferred iPhone reload on `:8081`, human QC of 34 clips, physical audio/accessibility/performance checks remain pending. Goal stays active; no commit/push.

## Android six-chapter reader disclosure — 14/10/2026

- On the matching API 37 release APK, selected the first canonical suggested Q&A in each chapter. Before tapping Xem chữ, the exact answer was absent from UIAutomator; after tapping, it exactly matched the approved `data/demo.json` answer. Tapping Thu gọn removed it again. In all six chapters the answer player remained Ready and never autoplayed.
- Saved open/collapsed PNG and accessibility XML pairs under `agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/`; README records the questions, method, APK hash and limits.
- Rechecked mobile tests 168/168, typecheck, lint, Expo dependency check; docs/evidence only, no app source changes. AVD has no audio, so microphone/STT/audible playback and iPhone behavior remain unverified; user-deferred iPhone bundle reload and human QC of 34 clips remain pending. Goal active; no commit/push.

## Android font-scale QA — 14/10/2026

- On the installed API 37 release APK (SHA-256 `D6BB16DCE259002D38D112DACA28E9DD91BF5D0681C005AEC9BB83025E8AB50D`), checked Q&A at system font scales 1.5 and 2.0. At 2.0 the answer remained collapsed/Ready; after scrolling both follow-up chips fit above the fixed dock. Evidence: `agent_docs/evidence/voice/android37-font-scale-2026-10-14/README.md`.
- No app source changed. The AVD has no audio; TalkBack/iPhone Dynamic Type, real-device voice/audio routes, human listening QC and performance remain pending. Changing font scale while the app was open recreated the activity and reset navigation to Prologue during this test; changing scale while backgrounded was not checked. Goal active; no commit/push.

## Android SDK57 reader/player evidence — 15/10/2026

- Verified the API 37 AVD-installed APK against the local release artifact: `com.valentino241.ngokedemo` 0.1.0, 121,247,816 bytes, SHA-256 `B11555198EBF7CDCD78A8A241E1FFEF4EF5B35B5BB4A5701331055DF46B66083`.
- Reached chapter 1 from Home, selected “Đây là điểm nào?”, and opened answer text while the player advanced to `00:08 / 00:10` and continued through replay. Screenshots and limits are in `agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/README.md`.
- Android Back from Q&A → point selector → Home succeeded, process remained present, no recent fatal React Native/AndroidRuntime exception; no conclusion about iOS SafeArea.
- AVD has no audio hardware. `uiautomator dump` returned `could not get idle state`; discarded its stale XML. This does not prove audible playback, mic/STT, iPhone, or screen-reader behavior. iPhone reload of `exp://192.168.100.36:8081` remains user-deferred. Goal active; no commit/push.
- Restarted local Metro and gateway after observing both ports refused connections. Current `:8081` status/manifest/iOS bundle return HTTP 200; bundle is 5,529,479 bytes and includes the gateway URL and mic-permission recovery. Gateway `192.168.100.36:8788/health` is ready; gateway smoke passed using only local synthetic audio. Mobile checks pass 168/168, typecheck, lint and Expo dependency check. User has deferred iPhone reload; no commit/push.
- Revalidated the canonical V1 catalogue: 34/34 clips, 7.0 minutes / 5.04 MB, manifest SHA-256 `90747665D049CC3B4AF018672EF0935805F324236986D8F2047DC79B440113E9`; highest ASR WER remains 23.1% on `qa-flowers-answer`. No human listening checklist item has been completed.

## Android Plan and QR/GPS surface retest — 15/10/2026

- Fixed Plan's manual-input toggle to a 48 dp minimum. The latest API 37 release APK measures 126 px at 420 dpi; topic/time fields and apply buttons also measure 48 dp. Android keyboard remained usable. Entering `am thuc` + 30 minutes returned two simulated recommendations totaling 30 minutes; selecting “Bếp đầu hè” opened the matching chapter.
- Opened the separate action drawer, GPS screen and QR screen on the AVD. Both screens show an explicit start button; no location/camera permission is requested just by entering the screen. The source requires a separate confirmation after a candidate result. No GPS, camera, or mic was started.
- Latest APK: 121,247,924 bytes, SHA-256 `EEC6430CC94BC70CAD01B5A58C954DA4B1333ECC1F49FFDB1BE8BCF4C3D9E1CF`. Android release build passed (377 tasks; 71 executed); mobile suite 168/168, typecheck, lint, dependency check, iOS JS export and `git diff --check` passed. Evidence: `agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/README.md`.
- Opened the new APK ZIP and confirmed 34/34 bundled MP3 SHA-256 hashes match source assets; no audio file is missing or extra.
- AVD has no audio: no proof of voice command recognition, audible playback, physical camera/GPS, TalkBack/VoiceOver, iOS native behavior, or performance. iPhone reload of `exp://192.168.100.36:8081` remains deferred. Goal stays active; no commit/push.

## Metro Expo Go launch bundle restore — 15/10/2026

- Before restart, Metro `:8081/status` was HTTP 200 while the iOS launch asset timed out at 90s and 230s. Restarted only Metro in the foreground without `--clear`; it loaded `.env.local` and advertised `exp://192.168.100.36:8081`. Gateway `:8788` was left running.
- The current iOS manifest launch asset returned HTTP 200 in 9.5s (5,529,995 response bytes); a warm repeat returned in 0.51s. Its contents include `192.168.100.36:8788` and `MIC_PERMISSION_BLOCKED`, and exclude “Chưa kết nối máy nhận giọng nói”. Gateway health is ready on Node 24.14.1/faster-whisper 1.2.1.
- After recovery, reran mobile tests 168/168, typecheck, lint, Expo dependency compatibility, V1 catalogue validation, gateway synthetic-ASR smoke (abort/retry, quota and media guards), and `git diff --check`; all passed. No user audio was used.
- User has deferred reloading the refreshed bundle on iPhone. This proves host/LAN delivery only, not behavior on that device. Goal remains active; no commit/push.

## Paired local ASR model check — 15/10/2026

- Compared pinned `faster-whisper-small` and `Systran/faster-whisper-large-v3` on one identical set of 21 VieNeu-generated canonical Q&A WAVs using vi, beam 5, VAD and exact app matching. Small CPU/int8: 12/21, 9 unknown, 0 wrong, p50/p95 1.684/1.872s. Large-v3 CPU/int8: 16/21, 5 unknown, 0 wrong, p50/p95 7.722/8.370s, weighted RTF 3.863; per chapter 6/6, 2/3, 3/3, 0/3, 3/3, 2/3.
- Large-v3 model card license is MIT; model.bin 2.9 GiB. CTranslate2 detects CUDA but runtime inference fails on missing `cublas64_12.dll`. No CUDA install, gateway switch, personal audio or upload. Keep small model: CPU large-v3 adds 4 exact matches but is 4.6× slower and still leaves 5 unknown. Do not loosen exact matcher from synthetic-only errors.
- Full local metrics are ignored at `tools/voice/.cache/qa-asr-model-comparison.json`; temporary WAVs were removed. This does not validate human speech. Goal remains active; no commit/push.

## Android large-font player retest — 15/10/2026

- Rechecked current release APK `236072DF9F8E3C8B3952D0C4A4CA13F63A22C8844EDB7015A9BC917263FF4243` at Android font scale 2.0. The full player title wraps to two lines; all four question chips and voice/typing/notebook controls remain enabled after scrolling. Evidence: `agent_docs/evidence/voice/android37-native-release-current-2026-10-15/player-title-fix-reader-scrolled.png` and matching UIAutomator XML.
- Font scale restored to 1.0. Emulator-only layout evidence; audio, TalkBack, iOS Dynamic Type and physical-device behavior remain unverified. Goal remains active; no commit/push.

## Q&A transcript aliases and current native build — 15/10/2026

- Added nine unique, complete transcript variants observed from the pinned small STT model to their matching chapter-local Q&A aliases. This is exact allowlisting, not fuzzy matching. Replayed the cached 21 synthetic question transcripts through the app matcher: **21/21 expected IDs, 0 unknown, 0 wrong**. No user audio was used; this is not human-speech accuracy proof.
- Added regressions for all aliases, cross-chapter rejection and demo revision freshness. `npm test` 170/170; typecheck, lint, Expo dependency check, V1 validator and gateway smoke pass. Dataset hash / `voiceCatalogueRevision` / manifest `sourceDataSha256`: `5a191de3080dd27f420210b60017abd29bc9eda6ea3168aa8b305f78cdc79971`. Manifest file SHA-256: `E62F27FC7432BAAA71601C12650186674358606FECCCE63DEC8A834C7AA77232`.
- Rebuilt/installed Android API 37 APK: 121,248,588 bytes, SHA-256 `582E38AF52AA0A3B8C63FDB16CF9A9D029BD597414F59A5F111D088DC57726E8`; APK contains all 34 source-matching audio files. Typed chapter-2 alias resolves to expected `qa-lam` text. Evidence folder: `agent_docs/evidence/voice/android37-native-release-current-2026-10-15/`.
- iOS export and live Metro `:8081` bundle are current; the Metro bundle includes revision/alias/gateway and returns HTTP 200. Gateway `:8788` is ready. User deferred iPhone reload. Human audio QC, spoken six-chapter phone coverage, physical Android audio, accessibility and performance remain pending. Goal active; no commit/push.

## 2026-10-15 — GPU STT integration and chapter-local native alias

- Restarted the LAN gateway on `:8788` with the explicit `large-v3-cuda` profile: faster-whisper 1.2.1, pinned large-v3 revision, CUDA float16. CUDA/cuDNN runtime wheels are hash-pinned in ignored `tools/voice/.cache`; no system CUDA, mobile dependency, paid service, or personal audio was used. The `small-cpu` profile remains the no-GPU default; GPU startup fails clearly instead of silently falling back.
- On 21 locally synthesized canonical questions, large-v3 first recognized 19/21 with no wrong chapter answer. Added the two observed, full transcript variants as exact aliases to their own Q&A entries. The actual mobile request helpers → live GPU gateway → production chapter/revision matcher then returned 21/21 expected entries, 0 unknown, 0 wrong, 0 transport/context errors; p50/p95 570/634 ms. A real M4A request helper path mapped to `qa-02` in 520 ms. Gateway abort/retry, quota, format, duration and silence smoke checks passed. This is synthetic-only evidence, not human speech accuracy.
- Rebuilt Android API 37 release APK: 121,248,708 bytes, SHA-256 `B171E9C88288097F15F0DCBB15036F7D808373ACCCA6D22D9030833AADFB85B2`. At chapter 4, the packaged app accepted the normalized exact alias and showed the expected `qa-flowers` answer. The earlier unknown at chapter 1 was correct because cross-chapter matching is forbidden. Screenshot: `agent_docs/evidence/voice/android37-native-release-current-2026-10-15/qa04-flowers-manual-alias-answer-2026-10-15.png`.
- `npm test` 170/170, typecheck, lint, Expo dependency check, catalogue validator 34/34, and Android build pass. Gateway remains on `:8788`; Metro `:8081` bundle is current, but user deferred iPhone reload. Human listening QC, spoken six-chapter iPhone coverage, physical Android audio, hardware routes/interruption, screen readers and performance remain open. Voice goal remains active; no commit/push.

## 2026-10-15 — Historical small-CPU 21-question gateway-to-app baseline (superseded)

- Generated 21 canonical Vietnamese questions locally with VieNeu TTS and passed them through the actual mobile request-body/transcription helpers, local faster-whisper-small HTTP gateway, and production exact Q&A matcher with node/revision context. Result: 15/21 expected entries, 6 unknown (`qa-01`, `qa-flowers`, `qa-knot`, `qa-box`, `qa-envelope`, `qa-light`), 0 wrong, 0 transport/context errors; host E2E p50/p95 1.749/2.336 s.
- Repeated the six misses to inspect recognition; outputs varied by TTS take. A static story-vocabulary `initial_prompt` did not resolve them, so no aliases were added from that sample. This supersedes interpreting the cached 21/21 transcript replay as fresh speech-recognition accuracy; it remains matcher-only synthetic evidence.
- This was the initial small-CPU baseline and is superseded by the large-v3 GPU helper→gateway→matcher result recorded above. Human listening, current iPhone reload/spoken coverage, real-device routing/accessibility/performance remain open. User deferred the `:8081` reload; no commit/push.

## Current Voice status override — 15/10/2026

The large-v3 GPU integration and Android chapter-4 alias evidence above supersede the historical 15/21 small-CPU result immediately above. Current synthetic helper→gateway→matcher result is 21/21 after two exact local aliases; this does not establish human-speech accuracy or close device gates.

## 2026-10-15 — Current bundle and phase-review audit

- Rechecked Metro `/status` (HTTP 200) and gateway `/health` (ready, `large-v3-cuda`). A PowerShell `Invoke-WebRequest` bundle fetch timed out, but retrying the same LAN iOS bundle with `curl` returned HTTP 200 in 5.26 seconds / 6,073,980 bytes; content includes current revision `1e49f3f7c5443091fcccf1b0ed39d3944f5bd79c5869f48640595b6958df25bf`, a new alias and gateway URL, without stale disconnected copy. User still deferred reloading iPhone.
- Refreshed V1–V7 review notes, mobile README, and Voice handoff with latest manifest/APK/profile evidence and explicit remaining hardware/human QC limits. Startup instructions set `NGOKE_VOICE_ASR_PROFILE=large-v3-cuda` on this RTX host (use `small-cpu` without pinned CUDA/cuDNN). No source code changed in this continuation. Full catalogue validator completed after an earlier 100-second caller timeout: 34/34 clips, 7.0 minutes / 5.04 MB, no source/text/hash/format/duration/level failures; highest WER remains `qa-flowers-answer` 23.1% and `qa-cake-answer` 18.9%.
- Remaining gates: listener sign-off for 34 clips; current iPhone bundle spoken tests across six chapters; physical audio routes/interruption; screen readers and hardware performance. Do not mark goal complete. No commit/push.

## Android simulated-call interruption check — 15/10/2026

- Re-ran mobile tests (170/170), typecheck, lint, Expo dependency check and `git diff --check`; re-ran the catalogue validator (34/34). The installed API 37 APK byte-matches local `17BF0EF342B0E41E4A90972101B260BD1E75D9654F80FDC5BFA469464E6EF3D3`.
- Started a recorder turn, confirmed AppOps active, then answered an emulator GSM call. The dialer became top-resumed and Ngõ Kể AppOps stopped; after hangup, returning to the app showed idle `Nhấn để hỏi` and no mic auto-resume. An incoming-call notification alone did not interrupt while Ngõ Kể stayed foregrounded.
- Evidence: `agent_docs/evidence/voice/android37-native-release-current-2026-10-15/recorder-call-interrupt.png`, `recorder-call-answered.png`, `recorder-after-call-return.png`. No audio was sent. The AVD has no audio signal; physical call/routing, current iPhone `:8081` reload, spoken six-chapter coverage, 34-clip listening QC, screen-reader and hardware performance gates remain open. Goal active; no commit/push.
- During a separate active recording, tapping “Điểm kế tiếp” moved from chapter 1 to chapter 2 and stopped AppOps capture; the dock showed idle on chapter 2. Evidence: `agent_docs/evidence/voice/android37-native-release-current-2026-10-15/recorder-next-point.png`. No clip was sent; this closes only an AVD lifecycle case.
- TalkBack was available on the AVD, but ADB coordinate taps were not a valid touch-exploration/double-tap test and produced ambiguous navigation. No screen-reader pass is claimed; the service was restored disabled, Q&A returned idle, and AppOps showed no active recording. Real TalkBack/VoiceOver remains pending.

## 2026-10-15 — Final served bundle recheck after alias updates

- Verified the authoritative dataset SHA-256, `voiceCatalogueRevision`, and manifest `sourceDataSha256` all equal `5a82b1d4fa223b2170fd9fa2c761a01479b4e3e159a81a6de72f65566a8d2568`; the current 34-entry manifest SHA-256 is `e59696011be1501097b08f11091a903f8b9a88d30d2914fcc255d1c28db774ba`. This supersedes earlier same-day snapshots `5a191…` and `1e49…`.
- Fresh host checks returned HTTP 200 for Metro `:8081/status`, the iOS manifest and its launch bundle. The 5,523,808-character bundle contains the current revision, the `Cốc tre của bà Nhi gợi lại ký ức nào?` alias and gateway URL, and omits the stale revision. Gateway `:8788/health` is ready on `large-v3-cuda`.
- Rechecked `npm test` (**170/170, 0 failures**), typecheck, lint, Expo dependency check and `git diff --check`; all pass. Current iOS HBC SHA-256: `35D9DBA66BAC6ECD1D429DE99CC75019524740685C345943036B7D8AA0E07108`. Current Android release APK SHA-256: `A44C99FF04125D5C24DD45ADFEA8C74EB8675C53EA00B4C2B45CEFEF95538BBC`.
- Host preview availability is verified, but this does not prove the iPhone loaded it. The user deferred that reload. Human listening QC, six-chapter spoken iPhone coverage, real hardware audio routes/interruption, screen readers and device performance remain open; goal remains active and no commit/push was made.
