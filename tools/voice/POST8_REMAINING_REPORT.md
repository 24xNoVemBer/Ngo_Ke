# Post-8 remaining voice assets — W3 report

## Inventory and preservation

The catalog now covers **100 tracks**: the preserved 34 Vietnamese demo tracks, the preserved 12 firstpoint candidate tracks (6 VI + 6 EN), and 54 remaining tracks (34 fiction EN + 10 pilot EN + 10 pilot VI). The 54 new tracks live in separate collection/locale paths under `mobile/assets/voice/post8/remaining/`; the Metro catalogue uses static `require()` entries. Availability lookup keeps the existing four-field contract (collection, locale, content ID, dataset revision); `useVoiceSession` still rejects kind, node, and source-text-hash mismatches before playback.

The existing 34+12 audio files, manifests, catalog helper, and `data/demo.json` were not edited. The original 34-track manifest SHA-256 remains `34925f5d005fa7fb684c4f8fac19992865b581c6eeaa6bde0e9183431c9be05a`; the firstpoint manifest SHA-256 is `e8c59255e9ef8eb2e19a9723a06f704ab385510402c5ca311e815bfb54988d31`. The prior firstpoint raw 3/6 and mapped EN 1/3 evidence remains unchanged.

The W1 finite pronunciation additions from `docs/content/POST8_GLOSSARY.md` at `d8d6361` are applied in the existing longest-phrase-first mapper. It retains Unicode word boundaries and the exact-case `An` guard; the approved Vietnamese terms match either letter case. Source/display text is unchanged. The corrected spoken text changed 15 EN assets and one EN canonical probe; those alone were rerendered. The other 39 remaining installed audio files kept their original bytes. The remaining manifest SHA-256 is `7756f1c2451fb5784abbb337a2823a8a1de816fc3903baaa90db1ee8a2858f7bc`; the generated Metro catalogue SHA-256 is `66f3a906c6afb1bf5c6aa79e3d7891cbc6dcb252fcf63f8c78d55780126221e3`.

## TTS provenance

| Locale | Runtime, model, revision | Voice / codec | License and encoding |
| --- | --- | --- | --- |
| EN | `kokoro==0.9.4`, `hexgrad/Kokoro-82M`, `f3ff3571791e39611d31c381e3a41a3af07b4987` | `af_heart` | Apache-2.0; mono MP3, 24 kHz, 96 kbps. Fiction uses speed 1.0; pilot stories use the recorded speed 0.75. |
| VI | `vieneu==3.7.1`, `pnnbao-ump/VieNeu-TTS-v3-Turbo`, `61b85e3d937fbbacb387714180e8182823512523` | bundled `Đoan Trang`; `OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX`, `ceff0d0749bfb3fa2d61149794ec6feef0d1e1ae` | Apache-2.0 for package, model, and codec model; mono MP3, 48 kHz, 96 kbps; no speed change. See `mobile/assets/voice/LICENSES.md`. |

Generation used the pinned local models offline, CPU inference, and local FFmpeg `libmp3lame`. No dependency, service, model, weight, or preset was added or changed. New assets remain `humanApproved: false` and `selectedForShipping: false`.

## Hash, format, decode, and signal audit

A cross-manifest audit matched all 100 track identities and source hashes to their real source rows, checked spoken hashes (stored separately for 66 modern entries; the legacy 34 VI clips speak their unchanged source text), matched all 100 audio hashes, durations, and MP3 format metadata, and measured decoded level/cut values for all 100. FFmpeg `-xerror` fully decoded all 54 remaining MP3s. Every measured clip had zero clipped samples; all 54 remaining entries' stored post-encode level/cut metrics match a fresh MP3 decode.

| Group | Count | Sample rate / bitrate | Duration seconds | Peak dBFS | RMS dBFS | Leading / trailing silence at -50 dB, ms |
| --- | ---: | --- | --- | --- | --- | --- |
| Existing VI | 34 | 48 kHz / 96 kbps | 3.60–28.61 | -7.93 to -3.39 | -20.99 to -18.59 | 22.2–200.8 / 0–371.0 |
| Firstpoint EN | 6 | 24 kHz / 96 kbps | 5.375–61.20 | -8.98 to -2.30 | -26.94 to -26.15 | 296.4–396.3 / 458.9–607.6 |
| Firstpoint VI | 6 | 48 kHz / 96 kbps | 5.04–46.68 | -6.29 to -4.09 | -20.43 to -19.60 | 57.8–117.9 / 149.1–331.6 |
| Remaining EN | 44 | 24 kHz / 96 kbps | 4.15–69.825 | -9.64 to -1.25 | -27.10 to -25.84 | 282.4–404.5 / 431.8–638.0 |
| Remaining VI | 10 | 48 kHz / 96 kbps | 4.88–48.49 | -5.98 to -3.12 | -20.51 to -19.40 | 60.8–122.7 / 134.2–241.9 |

There are two limits in the preserved baseline metadata. The original 34-track manifest has no per-entry level/cut fields; decoded measurements are reported above without rewriting it. The firstpoint manifest records pre-encode PCM levels/cuts, as its generator does, so 41 stored fields across its 12 tracks differ slightly from the decoded MP3 measurements (mostly about 0.4–0.5 dB in peak/RMS, plus small silence-boundary shifts). Those assets and fields remain byte-for-byte unchanged; the table reports decoded MP3 values.

## Synthetic loopback ASR and production matcher

The real `transcribeVoiceRequest` helper called the owned loopback gateway at `127.0.0.1:18787`, then used production `findAnswer`. The gateway reported `faster-whisper==1.2.1`, `Systran/faster-whisper-small` revision `536b0662742c02347bc0e980a01041f333bce120`, CPU `int8`. Locale was forced by each request; independent language classification was **not run**.

All 36 synthetic clips were submitted: canonical + approved follow-up for each of 9 logical nodes in each locale. Results: **18 expected matches, 18 unknown, 0 wrong matches, 0 decoder-locale mismatches, 18 approved graph follow-ups, and 9 follow-ups after an expected canonical match**. Unknown stayed unknown. The 18 unmatched samples were:

| Locale | Node / role | Expected ID | ASR transcript |
| --- | --- | --- | --- |
| EN | demo-03 canonical | `qa-xoi` | “What is special about Co-H Wang's sticky rice?” |
| EN | demo-04 follow-up | `qa-knot` | “What does the knot remind on of?” |
| EN | oldquarter-bach-ma canonical | `bm-horse` | “Why is the temple called Bhakma?” |
| EN | oldquarter-bach-ma follow-up | `bm-guardian` | “Who is honored here, and what does Eastern Guardian mean?” |
| EN | oldquarter-dong-xuan canonical | `dx-trade` | “What kind of trade is Zong Suan known for?” |
| VI | demo-01 canonical | `qa-01` | “Đây là điểm now.” |
| VI | demo-01 follow-up | `qa-02` | “Còn ngọn này có gì để xem?” |
| VI | demo-02 canonical | `qa-clock` | “Vì sao chích đồng hồ không chạy nữa?” |
| VI | demo-03 canonical | `qa-xoi` | “Gói xôi của cô Hương, có gì đặc biệt?” |
| VI | demo-03 follow-up | `qa-ribbon` | “Sợi dây xanh lối những điều gì?” |
| VI | demo-04 canonical | `qa-flowers` | “Ai trồng dàn hoa giấy trong sân?” |
| VI | demo-04 follow-up | `qa-knot` | “Nút thắt chiên dàn cái nhắc an biểu gì.” |
| VI | demo-05 canonical | `qa-box` | “Chiếc chiều khóa mở được cứ gì?” |
| VI | demo-05 follow-up | `qa-envelope` | “vì sao ăn đọc lá thư thật trận.” |
| VI | demo-06 follow-up | `qa-light` | “Vì sao mẹ hẹn lúc đèn cuối ngọt sáng?” |
| VI | oldquarter-bach-ma follow-up | `bm-guardian` | “Đên thừa ai và trấn đông nghĩa là gì?” |
| VI | oldquarter-dong-xuan canonical | `dx-trade` | “Chợ Đồng Xuân có đặc điểm 4 bám gì?” |
| VI | oldquarter-dong-xuan follow-up | `dx-food` | “ngõ trợ được nhắc đến với những món nào.” |

No aliases, matcher logic, or ASR model were changed to improve these results. This is synthetic audio evidence only; it does not establish human-speech accuracy or phone performance. The raw per-sample report is `tools/voice/.cache/post8-remaining-20261016/qa-http-results.json` (SHA-256 `4c531c50ce444f3321dc96721282ada62df887dad605fdac9f367be03397262c`). The locally started gateway was stopped and port 18787 is closed; ports 8081 and 8788 were not touched.

## Verification and reproduction

- Python voice tests: 11/11 passed (`test_post8_probe`, `test_post8_remaining`) plus 3/3 passed for `gateway/test_stt_language.py` from its own directory.
- Mobile tests: 229/229 passed, including the four-field lookup caller, strict playback kind/node/hash guards, and 100-track source/audio hash regression.
- `npm run typecheck`: passed; `npm run lint`: passed.
- Android and iOS Expo exports: passed; each produced one approximately 2.5 MB Hermes JS bundle.
- Full asset audit: 100/100 identities, source/spoken hashes, audio hashes, durations, and codec metadata; 54/54 new MP3s decoded; 54/54 stored new-track level/cut metrics matched decoded audio.

On a fresh ignored cache/output, run from `tools/voice` sequentially: `..\\..\\tools\\voice\\.venv\\Scripts\\python.exe -B post8_remaining.py en`, then `vi`, then `install`. For synthetic ASR, start `tools/voice/gateway/server.mjs` on loopback with port 18787 and the default `small-cpu` profile, then run `node tools/voice/post8_synthetic_qa.mjs` from the repository root. The generated catalogue and ASR report remain provisional.
