# Three Lenses voice render report

## Scope and provenance

- Collection: `old-quarter-three-lenses`; frozen v2 revisions: English `8c996ce9c61225bc442b603c700238d2dc169666742d37152fafb637eb0e8120`, Vietnamese `32e1553d86fa0ab109c75a161ce90a39c61a244fe441f5eab0d4f298f7b9197d`.
- Source data SHA-256: English `data/localized/three-lenses.en.json` `5977b3385d4900a832d43163a84ec39d635b6910a515d70633832fc172694c5d`; companion `data/journeys/three-lenses.en.json` `436659753e05026d7cf52fcae2f8d6164605aefe3c4b11111ddc304549a839e5`. Vietnamese core `data/localized/three-lenses.vi.json` `3c0b92419f7098b0432bdf53393ad0044892140c8dbdc1f51878f4f22cd4801e`; companion `data/journeys/three-lenses.vi.json` `30d54dd1052e1455f8bcf688ce211de8dd499dd10979eeb57cecd0b92942d3ca`.
- Rendered exactly 28 tracks per locale (56 total): 1 intro, 8 story/chapter/transition/closing, 3 captions, and 16 QA answers. QA clip IDs use `<qa-id>-answer`.
- The manifest is source-only, provisional, `humanApproved=false`, and `selectedForShipping=false`. Each track records source-data/text hashes, spoken-text hash, audio SHA-256, TTS metadata, measured MP3 metadata, level metrics, and `fullDecode=true`.

## Engines, format, and measurements

| Locale | Pinned TTS | Tracks | Total audio | MP3 format | Peak range | RMS range | Decode |
| --- | --- | ---: | ---: | --- | --- | --- | --- |
| English | `kokoro==0.9.4`, `hexgrad/Kokoro-82M` `f3ff3571791e39611d31c381e3a41a3af07b4987`, `af_heart` | 28 | 804.401 s | 24 kHz, mono, 96 kbps | -9.590 to -0.570 dBFS | -26.770 to -26.070 dBFS | 28/28 full decodes |
| Vietnamese | `vieneu==3.7.1`, VieNeu v3 Turbo `61b85e3d937fbbacb387714180e8182823512523`, `Đoan Trang`; MOSS tokenizer `ceff0d0749bfb3fa2d61149794ec6feef0d1e1ae` | 28 | 777.450 s | 48 kHz, mono, 96 kbps | -7.230 to -2.460 dBFS | -20.910 to -19.120 dBFS | 28/28 full decodes |

No clipped samples were reported. Per-clip durations and format fields come from the generated MP3s; full decode used FFmpeg with `-xerror`. The complete per-track measurements and hashes are in [manifest.json](../../mobile/assets/voice/three-lenses/manifest.json).

## Hashes and render latency

- Manifest SHA-256: `e9a7d38dffa5fc90c9e8b7cc2fdf9d7e91d4bd28657716170c2dfcab985c3d1e`.
- Per-locale audio inventory SHA-256, computed over sorted `track-id:audioSha256` lines: English `e031e79545c656d296fe844853c2060804bc38c6cfc88742ecb1b8909c2bbecd`; Vietnamese `45c59ba19e77d54857aaccdcf00a382b68775d0bc9ed60459b9052f568cf145d`.
- English completed 0/28→28/28; its cache-stage creation to `results.json` write timestamp span was 626.316 s. The EN command was not wrapped by a wall-clock timer, so this is the observed file-timestamp span, not a process stopwatch measurement.
- Vietnamese completed 0/28→28/28; the render command stopwatch measured 530.8 s (the corresponding cache-stage-to-results timestamp span was 529.716 s).

## Verification

- `.venv\Scripts\python.exe -B three_lenses.py audit` — passed 56/56 MP3 hash, metadata, and strict full-decode checks.
- `.venv\Scripts\python.exe -B -m unittest test_three_lenses test_post8_probe test_post8_remaining` — 16/16 passed.
- `node --test tests/threeLensesVoiceCatalogue.test.mjs tests/voiceSessionLifecycle.test.mjs tests/post8VoiceCatalogue.test.mjs tests/voiceCatalogue.test.mjs` — 16/16 passed.
- `npm run typecheck` — passed.

The static catalogue resolves only the exact collection, locale, and dataset revision. Existing 100 MP3s and cue assets were not edited. No synthetic ASR or human pronunciation review was performed, and this report makes no human accuracy claim; the audio remains provisional pending content/voice approval.
