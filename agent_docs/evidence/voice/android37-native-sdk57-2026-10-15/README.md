# Android API 37 native UI/player smoke — 15/10/2026

- Installed APK and local `mobile/android/app/build/outputs/apk/release/app-release.apk` match byte-for-byte: package `com.valentino241.ngokedemo`, version `0.1.0`, 121,247,816 bytes, SHA-256 `B11555198EBF7CDCD78A8A241E1FFEF4EF5B35B5BB4A5701331055DF46B66083`.
- Flow: Home → “Chọn con ngõ để bắt đầu chuyến đi” → Cổng ngõ → suggested question “Đây là điểm nào?”. The displayed answer belongs to chapter 1 and is labeled as fictional story content.
- `chapter1-player-playing-text-collapsed.png` shows the answer text hidden while its player is running. `chapter1-player-playing-text-open-00-08.png` shows the exact answer revealed while the player is at `00:08 / 00:10`. `chapter1-player-playing-text-open-replay.png` shows the text still open as playback proceeds in the replay cycle at `00:07 / 00:10`.
- Android Back from Q&A returned to the six-point selector; a second Back returned Home. The app process remained present and no recent `AndroidRuntime`/`ReactNativeJS` fatal exception was found. Screenshots and UI hierarchy are `chapter1-back-alleyselect.*` and `home-after-back.*`; this does not reproduce or clear the earlier iOS native SafeArea crash.
- `uiautomator dump` returned `ERROR: could not get idle state` during the animated/player state. The attempted XML was stale and was removed; these screenshots are the usable evidence for this run.
- The AVD is configured without audio hardware. This proves the native UI route, answer visibility and real player timeline state only; it does not prove audible output, microphone input, STT or iPhone behavior. No user audio was recorded or sent.

## AlleySelect accessibility retest — 15/10/2026

- Rebuilt and installed API 37 SDK57 release APK: 121,247,928 bytes, SHA-256 `E7D5BD8D8D0B34A23F77BA97CA20A5A0D6A42D7D175FF50858D8C9874899F0F7`.
- `alleyselect-accessibility-after-fix.png` and its XML show the screen at default search/filter state. UIAutomator measured: back 48×48 dp; search 294×48 dp; “Mở ngõ demo Phất Lộc” 345×48 dp; visible filters 48 dp high. The final chip is horizontally clipped until scrolled into view, where “Ẩm thực” measures 72×48 dp.
- `alleyselect-search-clear-accessibility-after-fix.png` and XML show the 48×48 dp “Xóa từ khóa tìm kiếm” action. The typed query was “Phat”; tapping clear restored an empty query.
- `alleyselect-filter-selected-accessibility-after-fix.png` and XML show “Ẩm thực” with `selected=true` and the result count reduced from five to two. “Tất cả” was selected afterward to restore the default list.
- Source checks: `npm test` 168/168, typecheck, lint; native release `:app:assembleRelease` succeeded (377 Gradle tasks, 39 executed).
- This is API 37 AVD evidence only. The emulator has no audio hardware, so no TalkBack, mic/STT, audible playback, iPhone, or physical device interaction was tested.
- `android37-reduced-motion-navigation.png` and `.xml` capture the app after setting Android `transition_animation_scale=0` and tapping the Home “Khám phá các con ngõ Hà Nội” action. “Chọn Con Ngõ” was fully rendered within the 80 ms capture window. The animator, transition and window animation scales were all restored to `1` and checked afterward. This verifies the reduced-motion navigation path on AVD; it is not screen-reader proof.

## Plan and explicit QR/GPS actions — 15/10/2026

- APK: 121,247,924 bytes, SHA-256 `EEC6430CC94BC70CAD01B5A58C954DA4B1333ECC1F49FFDB1BE8BCF4C3D9E1CF`; installed on the API 37 AVD, package `com.valentino241.ngokedemo` 0.1.0. Release build succeeded with 377 Gradle tasks, 71 executed.
- Inspected the built APK ZIP: it contains 34 MP3 entries; SHA-256 multiset parity with the 34 source files under `mobile/assets/voice` is exact (no missing or extra clips).
- `plan-toggle-48dp.png/.xml`: Plan's “Nhập chủ đề hoặc thời gian khác…” target bounds are 126 px high at 420 dpi (48 dp). `plan-manual-entry.png/.xml`: the keyboard is open while the text field and “Dùng” button remain visible; both controls measure 48 dp.
- `plan-result.png/.xml`: text entry `am thuc` plus 30 minutes selected Ẩm thực and returned two fictional/simulated picks totaling 30 minutes. Tapping “Bếp đầu hè” opened its Q&A in the same chapter.
- `action-menu.png/.xml`: Plan, QR and GPS are separate explicit choices. `gps-explicit-read.png/.xml` shows the GPS start button; opening this screen did not request location. `qr-explicit-start.png/.xml` shows “Bật camera và quét QR”; opening the screen did not request camera. Source asks permission only from these explicit start buttons, and GPS/QR candidates require a separate confirmation.
- The AVD did not start its camera, read GPS, record audio, or perform speech recognition. These images/tree prove native UI and app-data flow only; they do not prove real hardware, spoken action commands, screen-reader, iPhone, or audio-route behavior.
