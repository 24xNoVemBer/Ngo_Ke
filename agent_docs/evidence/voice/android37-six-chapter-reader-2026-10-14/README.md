# Android API 37 — answer text open/collapse sweep

Captured 2026-10-14 on `emulator-5554` with release package `com.valentino241.ngokedemo` version `0.1.0`. Installed APK and local release artifact match: 121,247,808 bytes, SHA-256 `D6BB16DCE259002D38D112DACA28E9DD91BF5D0681C005AEC9BB83025E8AB50D`.

For the first canonical suggested question in each chapter, the check confirmed that the answer is absent from the native accessibility tree by default. Tapping **Xem câu trả lời bằng chữ** revealed text exactly equal to the approved answer in `data/demo.json`; the answer player stayed Ready. Tapping **Thu gọn câu trả lời** removed that exact text from the tree, restored the open-text action, and left the player Ready. Chip selection and text disclosure did not start playback.

| Chapter | Question | Evidence pair |
| --- | --- | --- |
| 1 — Cổng ngõ | Đây là điểm nào? | `chapter-01-open.*`, `chapter-01-collapsed.*` |
| 2 — Hiên đồng hồ | Vì sao chiếc đồng hồ không chạy nữa? | `chapter-02-open.*`, `chapter-02-collapsed.*` |
| 3 — Bếp đầu hè | Gói xôi của cô Hương có gì đặc biệt? | `chapter-03-open.*`, `chapter-03-collapsed.*` |
| 4 — Sân hoa giấy | Ai trồng giàn hoa giấy trong sân? | `chapter-04-open.*`, `chapter-04-collapsed.*` |
| 5 — Bậc thềm nắng | Chiếc chìa khóa mở được thứ gì? | `chapter-05-open.*`, `chapter-05-collapsed.*` |
| 6 — Đèn cuối ngõ | Mẹ viết gì ở cuối lá thư? | `chapter-06-open.*`, `chapter-06-collapsed.*` |

Each state has a PNG screenshot and UIAutomator XML dump. The AVD has no audio input/output, so this verifies native text disclosure and player state only—not audible playback, mic, STT, iPhone behavior, or speech E2E.
