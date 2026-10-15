# Android API 37 — six-chapter Q&A UI sweep

Captured 2026-10-14 on `emulator-5554` with release package `com.valentino241.ngokedemo` version `0.1.0`. Installed APK and local `app-release.apk` were pulled/hashed during this check and match exactly: 121,247,808 bytes, SHA-256 `D6BB16DCE259002D38D112DACA28E9DD91BF5D0681C005AEC9BB83025E8AB50D`.

For each chapter, the test tapped its progress segment, tapped the first accessible suggested-question chip, then inspected the native accessibility hierarchy. Every answer player reached Ready, the source stayed within the selected chapter, chip selection did not autoplay, and answer text remained collapsed by default.

| Chapter | Suggested question | Answer source |
| --- | --- | --- |
| 1 — Cổng ngõ | Đây là điểm nào? | Chương 1 |
| 2 — Hiên đồng hồ | Vì sao chiếc đồng hồ không chạy nữa? | Chương 2 |
| 3 — Bếp đầu hè | Gói xôi của cô Hương có gì đặc biệt? | Chương 3 |
| 4 — Sân hoa giấy | Ai trồng giàn hoa giấy trong sân? | Chương 4 |
| 5 — Bậc thềm nắng | Chiếc chìa khóa mở được thứ gì? | Chương 5 |
| 6 — Đèn cuối ngõ | Mẹ viết gì ở cuối lá thư? | Chương 6 |

Each `chapter-XX.png` is the native screen after selection; `chapter-XX.xml` is its UIAutomator accessibility dump. The exact-answer/audio-ID matcher is also covered by the mobile unit tests.

The AVD has no audio input/output. These files prove chapter selection, chapter-scoped answer UI, player-ready state, no chip autoplay, and collapsed answer text only. They do **not** prove microphone signal, metering, speech recognition, audible playback, iPhone behavior, or six-chapter speech E2E.
