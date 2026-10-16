# Post-8 T2a English voice probe

**Status: bounded English TTS/ASR probe completed; native and human pronunciation QA pending.** The initial two-preset run failed English pronunciation QC because unknown Vietnamese tokens became Unicode spelling codes. A coordinator-reviewed, provisional TTS-only map was then probed locally; it removed the G2P unknown markers and English ASR codeword patterns on the synthetic check. Neither preset is selected, no sample is in the product catalog, and no sample is approved narration pending native playback and human pronunciation QA.

## Scope and result

- Probed only Kokoro-82M revision `f3ff3571791e39611d31c381e3a41a3af07b4987` with `af_heart` (US English) and `bf_emma` (British English).
- For each preset, generated the six approved English Bạch Mã pilot tracks (intro, story, caption, and three answers) plus one explicitly synthetic pronunciation check. Total: 14 MP3 files, seven per preset.
- The initial 14 failed-QC samples and metrics remain in ignored tools/voice/.cache/post8-probe/; the 14 remapped local-only samples and metrics are in tools/voice/.cache/post8-probe-spoken-v1/. No audio asset, manifest, or production English catalog was added to product paths. The synthetic sentence is a pronunciation test, not product copy or local history.
- The original 14 files remain preserved as failed-QC evidence. The remapped run is still provisional: do not bulk-generate the remaining 66 tracks, choose a preset, or ship samples before one-point native playback and human pronunciation QA.

## Runtime and licenses verified

Windows x64, Python 3.12.13, CPU-only Torch 2.5.1+cpu, and FFmpeg 8.1.2. The ignored environment is `tools/voice/.venv`; the Hugging Face cache is `tools/voice/.cache/post8-hf`; package download cache is `tools/voice/.cache/post8-uv`.

| Component | Installed version | License evidence / note |
| --- | --- | --- |
| Kokoro | 0.9.4 | Apache-2.0 on [PyPI](https://pypi.org/project/kokoro/0.9.4/) and [upstream source](https://github.com/hexgrad/kokoro). |
| Misaki English G2P | 0.9.4 | Apache-2.0 on [PyPI](https://pypi.org/project/misaki/0.9.4/). |
| Kokoro model and `af_heart` / `bf_emma` preset files | pinned revision `f3ff3571791e39611d31c381e3a41a3af07b4987` | Repository declares Apache-2.0; preset names are documented in the revision-pinned [VOICES.md](https://huggingface.co/hexgrad/Kokoro-82M/blob/f3ff3571791e39611d31c381e3a41a3af07b4987/VOICES.md). |
| PyTorch | 2.5.1+cpu | BSD-3-Clause wheel from the [official CPU index](https://download.pytorch.org/whl/cpu). |
| Transformers / Hugging Face Hub | 4.51.3 / 0.30.2 | Apache-2.0; these pins keep the selected PyTorch runtime enabled. |
| spaCy / `en_core_web_sm` | 3.8.7 / 3.8.0 | MIT; model metadata: [en_core_web_sm 3.8.0](https://github.com/explosion/spacy-models/blob/master/meta/en_core_web_sm-3.8.0.json). |
| `phonemizer-fork` | 3.3.2 | GPL-3.0-or-later per [PyPI metadata](https://pypi.org/project/phonemizer-fork/3.3.2/). |
| `espeakng-loader` / bundled eSpeak NG | 0.2.4 | Loader wheel metadata did not declare a license; upstream repository is MIT, while its bundled eSpeak NG runtime/data is GPL-3.0. See [loader source](https://github.com/thewh1teagle/espeakng-loader) and [eSpeak NG COPYING](https://github.com/espeak-ng/espeak-ng/blob/master/COPYING). |
| ASR engine | faster-whisper 1.2.1 / CTranslate2 4.8.2 | Reused the existing local multilingual `Systran/faster-whisper-small` snapshot read-only; no model download. |

The temporary G2P environment contains GPL components and was used only for local probing; none is bundled or shipped. Initial dependency resolution selected Transformers 5.20.0, which disables Torch 2.5.1 because it requires Torch >=2.6. Pinning Transformers 4.51.3 and Hugging Face Hub 0.30.2 restored the CPU backend. The model and two voice files were fetched with `token=False` at the pinned revision; inference ran with Hugging Face offline flags.

## Pinned model-file evidence

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `config.json` | 2,351 | `5abb01e2403b072bf03d04fde160443e209d7a0dad49a423be15196b9b43c17f` |
| `kokoro-v1_0.pth` | 327,212,226 | `496dba118d1a58f5f3db2efc88dbdc216e0483fc89fe6e47ee1f2c53f18ad1e4` |
| `voices/af_heart.pt` | 523,425 | `0ab5709b8ffab19bfd849cd11d98f75b60af7733253ad0d67b12382a102cb4ff` |
| `voices/bf_emma.pt` | 523,420 | `d0a423deabf4a52b4f49318c51742c54e21bb89bbbe9a12141e7758ddb5da701` |

## Generated-file measurements (initial failed-QC run)

Kokoro emits 24 kHz audio; the probe encoded mono MP3 at 96 kbps without upsampling. The source story durations are 52.45 seconds (`af_heart`) and 48.80 seconds (`bf_emma`); both are shorter than a 60–90 second narration target, but no wording or speed was padded to lengthen them. Peaks range from -9.16 to -3.40 dBFS (`af_heart`) and -7.03 to -4.00 dBFS (`bf_emma`); RMS is -26.41 to -25.70 and -24.65 to -24.35 dBFS respectively. Every generated WAV had zero samples at or above -0.009 dBFS before encoding; the measured leading silence at -50 dBFS is 296–344 ms and trailing silence is 463–767 ms. This boundary metric does not replace listening: no human cut-off, warmth, or pronunciation review has passed.

Audio SHA-256 and duration for each MP3:

| Preset | Track | Duration | SHA-256 |
| --- | --- | ---: | --- |
| `af_heart` | `intro` | 25.625 s | `d253539ad96d8308dd779119379805f1cb5f0e6cdd837107191a47f8d0f397b8` |
| `af_heart` | `oldquarter-bach-ma-story` | 52.450 s | `00924ea5d3ec002313617410a4c9af42120a7ff54fe937781f940f2911e4750f` |
| `af_heart` | `oldquarter-bach-ma-caption` | 8.300 s | `59a97e95cd08c0ffd5d5c77e47e7963876a01a81e4a49308e9563a64f4ad2c3e` |
| `af_heart` | `bm-guardian-answer` | 15.725 s | `107864f5bd11d4e423971db0b6768889b2356f24399bbfa10720e5125606ef3c` |
| `af_heart` | `bm-horse-answer` | 16.750 s | `ec404d36170fd53cd4b66688dc638f20b80f1c56da804c15ff9fcc1a345208cd` |
| `af_heart` | `bm-observe-answer` | 16.900 s | `7f66a4b93c766da8dfba05f1b66167bba5a8b16d1d18bc532ebc6e626a641cde` |
| `af_heart` | `synthetic-pronunciation-check` | 32.850 s | `8006adf029cd5af8c151b24a52ec74afacca4a3bd37c557e5670c6599b76070d` |
| `bf_emma` | `intro` | 23.575 s | `e8b9d1eb1dd7b2b0be87c2b365f5680d72aae22343da8dc125cce7a60ef99f34` |
| `bf_emma` | `oldquarter-bach-ma-story` | 48.800 s | `59e298379228ce4c0be9e95cc0c20efe695b3d8ce557d4c41b5504ab391d6a67` |
| `bf_emma` | `oldquarter-bach-ma-caption` | 7.950 s | `a605a96a9fe7681fc1ac4249b90d9dbe61225095ce3bfdea59346e8029298f85` |
| `bf_emma` | `bm-guardian-answer` | 14.925 s | `20c2d62843820dbab2621e99ed5334109476ed839cbdeddc12f0acbae43278b5` |
| `bf_emma` | `bm-horse-answer` | 15.275 s | `3d8d9698acba2561d9655bbd18788060ed656f59b04817e98396971dd0062ebb` |
| `bf_emma` | `bm-observe-answer` | 15.950 s | `0704e009b00855e6999060e74119cd62c970010794543f37df6ae81f9cf33df8` |
| `bf_emma` | `synthetic-pronunciation-check` | 32.325 s | `1863b584040aa703cd76c44f7783f8341fdb2241cf9ae7612e2f01541fd6ea80` |

Text SHA-256 is identical across the two presets for each track:

| Track | Text SHA-256 |
| --- | --- |
| `intro` | `2eaef8c606b145adb829122ecac5d131daa6bc5f71e1f86024894bdec5fd2bc7` |
| `oldquarter-bach-ma-story` | `42afea2a073e26fabb13cae2a0f475cb13a4ee87c2391d2cf4dfb0663f4363be` |
| `oldquarter-bach-ma-caption` | `b04c2038b3ac65996be69e5a404a2e46020e63acf98634c5c5f733daeb904937` |
| `bm-guardian-answer` | `8bcd776ac9b558e5c283ebca29c15901871058f207115cf5a66c9142ac2132c9` |
| `bm-horse-answer` | `1102222215f752d53558613cd1d3d07b43ef7a5fe1ec9e15512228fbfa3ad1aa` |
| `bm-observe-answer` | `2b8ec05c6f58f8d15109aff9cc23cf33ab43b7d48851acd657088b38fc2ba70e` |
| synthetic pronunciation check | `63192695ca6548299966793cb904b73c0bc27cea8f49657ad5de2505f533be91` |

## English pronunciation and ASR outcome (initial failed-QC run)

The synthetic-only sentence included Bạch Mã, Long Đỗ, 87 Mã Mây, Đồng Xuân, bún chả, bún ốc, bánh tôm, and fictional An, Lâm, Hương, and Nhi in one warm English sentence. The actual English TTS audio was then transcribed with the local multilingual small model using explicit `language="en"` and `language="vi"`; both forced decodes returned probability 1.0, which is not an independent language-classification result. The English decode retained the final warm clause but spelled several Vietnamese tokens as letter sequences (for example, “B Letter 1 E A 1 C H Ma” and “Long Distro Letter 1 ED7”), and only 4 of 11 exact normalized place/food/name checks appeared intact. The Vietnamese forced decode on this English clip was not intelligible.

For a Vietnamese regression, the same ASR engine decoded the existing bundled `mobile/assets/voice/intro.mp3` with `language="vi"`: 76 recognized words, 8 word edits against `data/demo.json` intro text (WER 0.105). The intro audio SHA-256 before and after was `769a6846696db4d187bf561b81c162f4054ad6997ecc91d2f63b28d80cb274e0`, matching the manifest; all 34 legacy catalogue checks passed. No Vietnamese clip, manifest, or catalog was modified.

## Reproduction

The dedicated generator is `tools/voice/post8_probe.py`; it validates schema-v2 approved Bạch Mã data, contains a hard limit of the two reviewed presets, reads only pinned local model files in offline mode, and writes samples plus `results.json` to ignored cache. The separate `tools/voice/post8_asr_probe.py` requires an explicit local audio and ASR model path and writes JSON under the same ignored probe cache.

```powershell
$env:UV_CACHE_DIR = Join-Path (Get-Location) 'tools/voice/.cache/post8-uv'
uv venv --python 3.12 tools/voice/.venv
uv pip install --python tools/voice/.venv/Scripts/python.exe --index-url https://download.pytorch.org/whl/cpu torch==2.5.1
uv pip install --python tools/voice/.venv/Scripts/python.exe 'kokoro==0.9.4' 'misaki[en]==0.9.4' 'espeakng-loader==0.2.4' 'spacy==3.8.7'
uv pip install --python tools/voice/.venv/Scripts/python.exe 'transformers==4.51.3' 'huggingface-hub==0.30.2' 'numpy==1.26.4'
uv pip install --python tools/voice/.venv/Scripts/python.exe https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl
```

Download only these files from the exact revision with `hf_hub_download(..., revision=MODEL_REVISION, token=False)`: `config.json`, `kokoro-v1_0.pth`, `voices/af_heart.pt`, and `voices/bf_emma.pt`. Then run the generator with `HF_HOME=tools/voice/.cache/post8-hf`, `HF_HUB_OFFLINE=1`, and `TRANSFORMERS_OFFLINE=1`:

```powershell
tools/voice/.venv/Scripts/python.exe -B -X utf8 tools/voice/post8_probe.py --output tools/voice/.cache/post8-probe-spoken-v1
```

ASR used the pre-existing local snapshot `E:\Project\Ngo_Ke\ngoke\tools\voice\.cache\whisper\models--Systran--faster-whisper-small\snapshots\536b0662742c02347bc0e980a01041f333bce120`, with `HF_HUB_OFFLINE=1` and `TRANSFORMERS_OFFLINE=1`; the main workspace was read-only. The corresponding English pronunciation and Vietnamese regression reports are in `tools/voice/.cache/post8-probe/`.

## Initial code checkpoint and remaining checks

- `b2625e7` routes gateway locale through the worker to `model.transcribe(language=...)`; its three locale helper tests pass. The ASR output proves both explicit locale paths execute, but the English pronunciation QC is still failed.
- `672eedb` adds the additive `lookupVoiceTrack({ collectionId?, locale?, contentId, datasetRevision })` API and locale correlation/cancellation in the voice hook. The legacy default is `fiction-letter`/`vi`; unknown English/collection/revision returns missing, never a Vietnamese fallback. English assets are not yet registered.
- Verified: 8 mobile voice transcription/catalog tests, 3 probe extraction tests, 3 gateway locale tests, and `git diff --check` pass. Mobile TypeScript typecheck could not start because this worktree has no `mobile/node_modules` (`tsc` not recognized); no dependency was installed for that check.
- Not verified: human pronunciation/warmth, exact spoken Vietnamese names, app/device playback, native first-point QA, long-session interruption, and G2P override behavior. W4's pronunciation review is pending. No screen/App/shared-data/dictionary code changed; no server, device, or user service was run.
- Two generated `__pycache__` directories from a syntax check remain uncommitted; the tool policy rejected their deletion commands. They are unrelated `.pyc` outputs and are not part of any commit.

## Remapped local-only run (2026-10-16)

The coordinator approved a provisional respelling pass for local probing only. The mapping changes only the string sent to Kokoro: the approved dataset, UI text, QA matching, and source text hash remain untouched. ?An? is case-sensitive and word-bounded, so lowercase ?an,? ?plan,? and ?ancient? remain intact. The actual one-point source text required two additional local-only entries, H?ng Bu?m and Th?ng Long; 87 remains numeric.

| Source spelling | TTS-only provisional respelling |
| --- | --- |
| Hà Nội | Hah Noy |
| Bạch Mã | Bahk Mah |
| Long Đỗ | Long Doe |
| Mã Mây | Mah May |
| Đồng Xuân | Zohng Swun |
| Hàng Buồm | Hahng Boom |
| Thăng Long | Tahng Long |
| bún chả | boon chah |
| bún ốc | boon awk |
| bánh tôm | bahn tom |
| An | Ahn |
| Lâm | Lahm |
| Hương | Hwung |
| Nhi | Nee |

The source and spoken text hashes are recorded separately in results.json. The seven track hashes are shared across both presets:

| Track | Original text SHA-256 | Spoken text SHA-256 |
| --- | --- | --- |
| intro | 2eaef8c606b145adb829122ecac5d131daa6bc5f71e1f86024894bdec5fd2bc7 | 03d211e5ff60b73deb1165179a662539d5a25c8059d8b102691abf233dbcfc13 |
| oldquarter-bach-ma-story | 42afea2a073e26fabb13cae2a0f475cb13a4ee87c2391d2cf4dfb0663f4363be | 58546ca363bd83094bc21e7f2f9c749a053d07c3c0c6e1882e9c4e355299b1cb |
| oldquarter-bach-ma-caption | b04c2038b3ac65996be69e5a404a2e46020e63acf98634c5c5f733daeb904937 | 1181054835f36e113f63a31d6858ef6b800689c33bb97708c785e2b941c072c8 |
| bm-guardian-answer | 8bcd776ac9b558e5c283ebca29c15901871058f207115cf5a66c9142ac2132c9 | 4e334d5464ada30eccde6866e22211d4630d32d495eef958c1cc9483650d0952 |
| bm-horse-answer | 1102222215f752d53558613cd1d3d07b43ef7a5fe1ec9e15512228fbfa3ad1aa | ebe2bd6e3143de3e592607b48b5dde2611ba6f20cdf1a03a2f23b399120c5a61 |
| bm-observe-answer | 2b8ec05c6f58f8d15109aff9cc23cf33ab43b7d48851acd657088b38fc2ba70e | 2b8ec05c6f58f8d15109aff9cc23cf33ab43b7d48851acd657088b38fc2ba70e |
| synthetic-pronunciation-check | 63192695ca6548299966793cb904b73c0bc27cea8f49657ad5de2505f533be91 | 505a4b5dd100750d95c287d5b0040a7a2bd7969cafd6125ddbef7f168268734f |

The generator raised on any Misaki unknown phoneme marker before writing that track. No unknown marker appeared across either preset. Output is MP3, mono, 24 kHz, 96 kbps. Peak and RMS are measured on the PCM before encoding; clippedSamples counts PCM samples at or above 0.999. Leading/trailing silence are measured at -50 dBFS and were not trimmed.

| Preset | Track | Duration (s) | Peak / RMS (dBFS) | Clipped samples | Leading / trailing silence (ms) | Audio SHA-256 | Sample |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| af_heart | intro | 22.000 | -6.51 / -25.73 | 0 | 336.5 / 468.0 | eb85b84669ec627e05589326d804fc997886c3903932576b8172442a2d35cd26 | tools/voice/.cache/post8-probe-spoken-v1/af_heart/intro.mp3 |
| af_heart | oldquarter-bach-ma-story | 48.675 | -4.75 / -25.85 | 0 | 328.3 / 494.3 | a845eadb6cf6701a30cce9ab2beb10c49b7abc34d767f3a78699417ef22808b4 | tools/voice/.cache/post8-probe-spoken-v1/af_heart/oldquarter-bach-ma-story.mp3 |
| af_heart | oldquarter-bach-ma-caption | 5.375 | -8.27 / -26.48 | 0 | 342.7 / 456.9 | 38cbd324b2ca33c6fd75b9ac49f60b0e89ae72a4cc85ed7c6144128e98a76a8f | tools/voice/.cache/post8-probe-spoken-v1/af_heart/oldquarter-bach-ma-caption.mp3 |
| af_heart | bm-guardian-answer | 14.275 | -8.54 / -25.71 | 0 | 296.4 / 538.0 | 30e993909f3e636238dcdaad90e05b826f8effbf2b4d3fed78bf2ddf9dad03f4 | tools/voice/.cache/post8-probe-spoken-v1/af_heart/bm-guardian-answer.mp3 |
| af_heart | bm-horse-answer | 15.375 | -8.15 / -25.82 | 0 | 335.0 / 534.6 | 325339d189a95b1af24c8e47a7093e006a5ff2986b5a4d4045a9de1d1e9c2439 | tools/voice/.cache/post8-probe-spoken-v1/af_heart/bm-horse-answer.mp3 |
| af_heart | bm-observe-answer | 16.900 | -7.22 / -25.69 | 0 | 318.7 / 463.4 | 845d456a5d0567f0ce0f4f45606b8c77225b313f1f929875d9d738eec9ed8169 | tools/voice/.cache/post8-probe-spoken-v1/af_heart/bm-observe-answer.mp3 |
| af_heart | synthetic-pronunciation-check | 25.075 | -3.90 / -26.14 | 0 | 337.4 / 543.0 | 0c09528f27ac2cbe72bcbc55298b0d4d815243a838162272ba7618253b4dccd1 | tools/voice/.cache/post8-probe-spoken-v1/af_heart/synthetic-pronunciation-check.mp3 |
| bf_emma | intro | 20.025 | -6.18 / -24.41 | 0 | 321.1 / 716.2 | 5947ecb1d4dbcf52b3a404965364d973ee1e689717c46353427f929c71b7adb2 | tools/voice/.cache/post8-probe-spoken-v1/bf_emma/intro.mp3 |
| bf_emma | oldquarter-bach-ma-story | 46.150 | -3.37 / -24.50 | 0 | 322.3 / 738.5 | 6d7aacfe8e9a9d9add835cf61fd2d91bce555c1b1a1828ece877d2e0170d7a2d | tools/voice/.cache/post8-probe-spoken-v1/bf_emma/oldquarter-bach-ma-story.mp3 |
| bf_emma | oldquarter-bach-ma-caption | 5.550 | -7.34 / -24.46 | 0 | 310.8 / 738.4 | 2bff2fd5e968a11e0ba6eee8be4b6b4590922f9f91c9d1c4473442abc4ecdcf0 | tools/voice/.cache/post8-probe-spoken-v1/bf_emma/oldquarter-bach-ma-caption.mp3 |
| bf_emma | bm-guardian-answer | 13.400 | -7.49 / -24.49 | 0 | 296.5 / 752.6 | 178ae9b297e550350544963bc72fdfefbbefe4c8c96a410fb3b3e967343f1b05 | tools/voice/.cache/post8-probe-spoken-v1/bf_emma/bm-guardian-answer.mp3 |
| bf_emma | bm-horse-answer | 14.250 | -5.31 / -24.28 | 0 | 318.1 / 725.6 | 732abd979c1a7d1b3cd738232aaf588a213ca73dd3766e3db4a4bd5327704835 | tools/voice/.cache/post8-probe-spoken-v1/bf_emma/bm-horse-answer.mp3 |
| bf_emma | bm-observe-answer | 15.950 | -4.42 / -24.36 | 0 | 310.2 / 741.4 | 4550a06224caa31dd541959c99b16f0c7b9d6ca58137c2e02d0a55abcfd0799e | tools/voice/.cache/post8-probe-spoken-v1/bf_emma/bm-observe-answer.mp3 |
| bf_emma | synthetic-pronunciation-check | 23.950 | -5.91 / -24.91 | 0 | 321.2 / 770.6 | dd2a04e9ea7ee16f091946b691019c8a3052c8617a6f6945ad7f80649542e843 | tools/voice/.cache/post8-probe-spoken-v1/bf_emma/synthetic-pronunciation-check.mp3 |

All 14 new outputs have zero clipped samples. The B?ch M? story lasts 48.675 s with af_heart and 46.150 s with bf_emma. These are synthetic measurements and do not decide warmth, naturalness, or correct Vietnamese tones.

### Actual ASR check

The locally cached faster-whisper-small engine decoded the af_heart synthetic sample twice, with explicit language=en and language=vi. It returned the requested locale each time; probability 1.0 is forced-decode metadata, not independent language detection. The English codeword scan found no Unicode spelling pattern. The English text retained the complete warm closing clause, but the names are phonetic approximations and ASR is not human pronunciation review.

| Requested language | Reported language | Probability | Transcript words | Unicode codeword patterns |
| --- | --- | ---: | ---: | --- |
| en | en | 1.0000 | 73 | none |
| vi | vi | 1.0000 | 83 | none |

Forced English transcript:

> On a cool, golden evening in Hanoi, after a long day exploring Bakma Temple, the story of Longdo, 87 Mamei, and the busy paths around Zongsuan Market, An, Lam, Hwang, and Ni found a small table, shared steaming bowls of Booncha and Boonok with crisp bon tom, and promised to meet again whenever they wanted to trade stories. Laugh about the day, and make the old streets feel a little more like home.

The forced Vietnamese transcript was not intelligible English/STT evidence. This verifies that the actual decoder received both locale values; it does not establish natural speech recognition accuracy in either language.

The original synthetic source string and the preserved first-run results.json contain valid, identical UTF-8 text, SHA-256 63192695ca6548299966793cb904b73c0bc27cea8f49657ad5de2505f533be91. Apparent mojibake from PowerShell display was a console decoding artifact.

### Reproduction of the remapped run

Use an empty ignored output path; the generator refuses to overwrite a non-empty directory. The pinned model files are loaded from the local f3ff3571791e39611d31c381e3a41a3af07b4987 snapshot and Hugging Face offline mode is enabled before importing the runtime.

    $env:HF_HUB_OFFLINE = "1"
    $env:TRANSFORMERS_OFFLINE = "1"
    $env:PYTHONDONTWRITEBYTECODE = "1"
    .\tools\voice\.venv\Scripts\python.exe -B -X utf8 .\tools\voice\post8_probe.py --output .\tools\voice\.cache\post8-probe-spoken-v1

ASR used the pre-existing multilingual model snapshot in the main workspace with offline flags; only the JSON report was written under the worker cache:

    $env:HF_HUB_OFFLINE = "1"
    $env:TRANSFORMERS_OFFLINE = "1"
    $env:PYTHONDONTWRITEBYTECODE = "1"
    E:/Project/Ngo_Ke/ngoke/tools/voice/.venv/Scripts/python.exe -B -X utf8 tools/voice/post8_asr_probe.py --audio tools/voice/.cache/post8-probe-spoken-v1/af_heart/synthetic-pronunciation-check.mp3 --model-path E:/Project/Ngo_Ke/ngoke/tools/voice/.cache/whisper/models--Systran--faster-whisper-small/snapshots/536b0662742c02347bc0e980a01041f333bce120 --language en --language vi

### Focused code checks

The updated Python probe suite passed 6/6 tests with the isolated Python 3.12 environment:

    Push-Location tools/voice
    .venv/Scripts/python.exe -B -X utf8 -m unittest -v test_post8_probe
    Pop-Location

The actual 14-file offline Kokoro generation and the actual cached faster-whisper decode also completed successfully. No device, app, backend, server, gateway, or native playback test was run.

### Product gate

These files are probe samples only. No preset was selected and no production manifest, new asset, or mobile voice catalog entry was added. The existing voice lookup still fails closed for the English collection. Native first-point playback, human review of all proposed approximations, and approval of a preset remain open. No app/device/server test was run.

## Current W3 first-point follow-through (2026-10-16)

This section supersedes the earlier code-checkpoint and product-gate statements above. It records the later, deliberately limited first-point candidate. The catalog still marks every clip `humanApproved: false`, and its top-level flags remain `humanApproved: false` and `selectedForShipping: false`; this is a provisional engineering candidate, not a voice selection or human/native approval.

### Runtime and license verification

Windows runtime used Node `v24.14.1` and Python `3.12.13`. The English TTS was generated with isolated `kokoro==0.9.4` CPU packages and the pinned `hexgrad/Kokoro-82M` snapshot at `f3ff3571791e39611d31c381e3a41a3af07b4987`; the model repository and Kokoro package identify Apache-2.0. Preset `af_heart` is the only preset in this candidate (`en-US`). `bf_emma` (`en-GB`) was the second and final T2a comparison preset; it was not selected for this candidate. The voice files have no separate license record, so their stated license follows the pinned model repository's Apache-2.0 terms.

The Vietnamese candidate reused the isolated Windows ONNX path: `vieneu==3.7.1`, `pnnbao-ump/VieNeu-TTS-v3-Turbo@61b85e3d937fbbacb387714180e8182823512523`, codec `OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX@ceff0d0749bfb3fa2d61149794ec6feef0d1e1ae`, preset `Đoan Trang` (`vi-VN`). Package/model/codec license notes are in [the existing voice license record](../mobile/assets/voice/LICENSES.md). Only isolated ignored environments and caches were used; no global package install or SDK/registry setup was performed, and the main `E:/Project/Ngo_Ke/ngoke` workspace was read-only.

Primary license/version references: [Kokoro 0.9.4 on PyPI](https://pypi.org/project/kokoro/0.9.4/), [pinned Kokoro model revision](https://huggingface.co/hexgrad/Kokoro-82M/tree/f3ff3571791e39611d31c381e3a41a3af07b4987), [VieNeu 3.7.1 on PyPI](https://pypi.org/project/vieneu/3.7.1/), [pinned VieNeu model revision](https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo/tree/61b85e3d937fbbacb387714180e8182823512523), and [pinned ONNX codec revision](https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX/tree/ceff0d0749bfb3fa2d61149794ec6feef0d1e1ae). The model metadata and README, package metadata, and model-card license statements were checked through the required agent-reach route before download/use.

### Provisional bilingual first-point assets

The separate first-point generator writes only `mobile/assets/voice/post8/old-quarter-pilot/` and `mobile/src/voice/post8Catalog.ts`; it refuses to overwrite an existing candidate and never targets the original 34-clip generator/catalog. It emits six Bạch Mã tracks per locale: intro, story, caption, and three matching QA answers. Revisions are EN `d75fcc183863f7ea2ec3b24bba1c4664b762c6332f0eb768a3493d9e74089b83` and VI `358209bc5bf8f14e47a3598b93644d168219d919dcb66d9eb1f7cbb7dbd2c94a`; source-data SHA-256 values are EN `bec3ff515868acd0462f0b918dff6b4f1bb43d36f98ef063c6da4a44b13730e1` and VI `58791331dc736764f71f73f5e656f2cc7c20f300b3e21656f7ac7077943eea93`.

English TTS-only respelling leaves display text, matching text, and source-text hashes unchanged. Misaki returned no unknown-phoneme markers. The story was generated separately at speed `0.8` to reach the requested 60–90 second narration range: `61.200 s`, mono MP3, 24 kHz, 96 kbps; PCM peak `-1.88 dBFS`, RMS `-25.77 dBFS`, clipped samples `0`, leading/trailing silence at -50 dBFS `396.2/607.6 ms`. Its source-text SHA remains `42afea2a073e26fabb13cae2a0f475cb13a4ee87c2391d2cf4dfb0663f4363be`, spoken-text SHA is `58546ca363bd83094bc21e7f2f9c749a053d07c3c0c6e1882e9c4e355299b1cb`, and audio SHA is `ee55b19e52f87e1259bf1c1723d8568508f9790eee05825e21c1a8ef9b6cbd93`. It is a measured synthetic output, not a listening or warmth result.

All files are mono MP3 at 96 kbps. English samples are 24 kHz; Vietnamese samples are 48 kHz. The table records exact source/spoken/audio hashes and measured duration, peak/RMS, clipping, and untrimmed -50 dBFS cuts. The manifest also records the model, revision, library, locale, voice/preset, dataset revision, codec, and source path for every track. Sample path is `mobile/assets/voice/post8/old-quarter-pilot/{locale}/{track}.mp3`.

| Locale / voice | Track | Seconds | Source text SHA-256 | Spoken text SHA-256 | Audio SHA-256 | Peak / RMS dBFS | Clipped | Leading / trailing ms |
| --- | --- | ---: | --- | --- | --- | ---: | ---: | ---: |
| en / af_heart | intro | 22.000 | `2eaef8c606b145adb829122ecac5d131daa6bc5f71e1f86024894bdec5fd2bc7` | `03d211e5ff60b73deb1165179a662539d5a25c8059d8b102691abf233dbcfc13` | `eb85b84669ec627e05589326d804fc997886c3903932576b8172442a2d35cd26` | -6.51 / -25.73 | 0 | 336.5 / 468.0 |
| en / af_heart | oldquarter-bach-ma-story | 61.200 | `42afea2a073e26fabb13cae2a0f475cb13a4ee87c2391d2cf4dfb0663f4363be` | `58546ca363bd83094bc21e7f2f9c749a053d07c3c0c6e1882e9c4e355299b1cb` | `ee55b19e52f87e1259bf1c1723d8568508f9790eee05825e21c1a8ef9b6cbd93` | -1.88 / -25.77 | 0 | 396.2 / 607.6 |
| en / af_heart | oldquarter-bach-ma-caption | 5.375 | `b04c2038b3ac65996be69e5a404a2e46020e63acf98634c5c5f733daeb904937` | `1181054835f36e113f63a31d6858ef6b800689c33bb97708c785e2b941c072c8` | `38cbd324b2ca33c6fd75b9ac49f60b0e89ae72a4cc85ed7c6144128e98a76a8f` | -8.27 / -26.48 | 0 | 342.7 / 456.9 |
| en / af_heart | bm-guardian-answer | 14.275 | `8bcd776ac9b558e5c283ebca29c15901871058f207115cf5a66c9142ac2132c9` | `4e334d5464ada30eccde6866e22211d4630d32d495eef958c1cc9483650d0952` | `30e993909f3e636238dcdaad90e05b826f8effbf2b4d3fed78bf2ddf9dad03f4` | -8.54 / -25.71 | 0 | 296.4 / 538.0 |
| en / af_heart | bm-horse-answer | 15.375 | `1102222215f752d53558613cd1d3d07b43ef7a5fe1ec9e15512228fbfa3ad1aa` | `ebe2bd6e3143de3e592607b48b5dde2611ba6f20cdf1a03a2f23b399120c5a61` | `325339d189a95b1af24c8e47a7093e006a5ff2986b5a4d4045a9de1d1e9c2439` | -8.15 / -25.82 | 0 | 335.0 / 534.6 |
| en / af_heart | bm-observe-answer | 16.900 | `2b8ec05c6f58f8d15109aff9cc23cf33ab43b7d48851acd657088b38fc2ba70e` | `2b8ec05c6f58f8d15109aff9cc23cf33ab43b7d48851acd657088b38fc2ba70e` | `845d456a5d0567f0ce0f4f45606b8c77225b313f1f929875d9d738eec9ed8169` | -7.22 / -25.69 | 0 | 318.7 / 463.4 |
| vi / Đoan Trang | intro | 19.870 | `d068452c872f13e4f125f7a326986928fddc3d42c9eaa88ae2a426c7f26b1e5b` | `d068452c872f13e4f125f7a326986928fddc3d42c9eaa88ae2a426c7f26b1e5b` | `e76028d6bc4f39a79e7148d9afb510c05050627a0df0a353238498d473a37d5f` | -4.64 / -19.22 | 0 | 117.85 / 149.46 |
| vi / Đoan Trang | oldquarter-bach-ma-story | 46.680 | `d98216f5feaf1682261e9b3b01b7cbc13b2822fdf2f1eb0e220848c87fb7a5b0` | `d98216f5feaf1682261e9b3b01b7cbc13b2822fdf2f1eb0e220848c87fb7a5b0` | `90e8e13f983d9f49d6e3f7f5ec51e63079475c26e74a8928a5f06176c469dec8` | -3.99 / -19.70 | 0 | 112.94 / 153.15 |
| vi / Đoan Trang | oldquarter-bach-ma-caption | 5.040 | `d8e61b8540069307dae429fc25bd795a10935dcf621a3cf5f5a9f868027840e4` | `d8e61b8540069307dae429fc25bd795a10935dcf621a3cf5f5a9f868027840e4` | `7e64c9ebdcafd487772f91cf45aaade3bb9697c449f3e60a592c8ed35e7e440a` | -5.84 / -19.99 | 0 | 102.48 / 170.02 |
| vi / Đoan Trang | bm-guardian-answer | 11.280 | `358c57d387758d89d825410016cc8c1beb730fe259f43950f06d68b741c70d3e` | `358c57d387758d89d825410016cc8c1beb730fe259f43950f06d68b741c70d3e` | `187054715ff4cba74fe9c2aa64eb0f6f582b06cbe6cb6cc17c1b43787796781f` | -4.15 / -19.16 | 0 | 100.58 / 196.83 |
| vi / Đoan Trang | bm-horse-answer | 15.440 | `b5db1888117c52887a8092d8006862ab815c247738927dea785ebf5a158870e7` | `b5db1888117c52887a8092d8006862ab815c247738927dea785ebf5a158870e7` | `a1dd5f8392ec5721dada8895a2b6ad3b7830a60455dd41e99c4ebf15bc118356` | -3.64 / -19.57 | 0 | 97.92 / 331.56 |
| vi / Đoan Trang | bm-observe-answer | 14.160 | `513eecf4451de695cab022e1b122bd045143c9a1833e6f73670ffad6925c256d` | `513eecf4451de695cab022e1b122bd045143c9a1833e6f73670ffad6925c256d` | `6b8d1a383c7c26b8009b070cabd75fee64a11ebf5b8d9c4fd742919e0659e0ad` | -4.12 / -19.98 | 0 | 57.75 / 149.10 |

### Actual English and Vietnamese decoder checks

English TTS is not English STT evidence by itself. The actual gateway was run on controlled loopback `127.0.0.1:18787`, using Node `v24.14.1`, `faster-whisper==1.2.1`, and cached `Systran/faster-whisper-small@536b0662742c02347bc0e980a01041f333bce120` on CPU/int8. For each request, the worker received the requested language and returned `info.language`; the gateway now rejects a language mismatch and echoes only that observed value as `decoderLanguage`. The mobile response validator requires `decoderLanguage: "en"` for English and rejects any reported locale mismatch; legacy VI responses may omit this additive field.

| Sample | Requested / returned language | Audio duration | Actual result |
| --- | --- | ---: | --- |
| `tools/voice/.cache/post8-http-probe/english-horse-answer.wav` (af_heart) | `en` / `en` | 15.375 s | HTTP 200; returned the spoken Bạch Mã meaning, horse-track legend, divine-protection belief, and source limitation. |
| `tools/voice/.cache/post8-http-probe/firstpoint-vietnamese-horse.wav` (Đoan Trang) | `vi` / `vi` | 15.440 s | HTTP 200; actual transcript contained recognition errors and is only language-routing evidence, not accuracy/QC evidence. |

Both requests were run through `tools/voice/gateway/post8_http_probe.mjs`, which sends a local WAV and asserts the full turn context and actual decoder language. The loopback gateway used Node PID `30292` and Python worker PID `42696`; it was sent SIGTERM, both processes exited, and the listener on port `18787` was gone. Ports `8788` and `8081` were not touched. The longer all-name/food English pronunciation sentence remains the explicit-language local ASR probe recorded above; it was not sent through the gateway because that gateway's intentional audio-duration cap is 20 seconds.

### Voice intent, lifecycle, and verification

`parseVoiceIntent(input, collectingPlan = false, currentDraft = {}, locale = 'vi')` preserves all old Vietnamese call signatures and defaults. English has a small exact command table; Vietnamese commands do not trigger in English. Negative, unknown, multi-action, or mixed English action requests do not execute automatically. Clarify, multiple-slot, and negation notices use the shared translator. `lookupVoiceTrack({ collectionId, locale, contentId, datasetRevision })` resolves the Post-8 candidate only on exact collection/locale/revision; missing content or mismatches return no audio and never fall back to VI.

The hook now returns from a hung stop to a localized recovery-error state after one second, while retaining a native-recovery lock until the original native completion succeeds. Rejection or an unresolved operation keeps the microphone locked; a delayed prepare that resolves after cancel is stopped/discarded before the lock releases. Voice-owned controlled-hook tests cover hung prepare, stalled stop, ready cancellation, a delayed ASR response, a delayed stale playback hash, cleanup, and absence of automatic playback/new recording during recovery.

Verification on this worktree: focused voice/catalogue suite `30/30`; Python probe unit tests `6/6`; first-point English hash preflight passed; `npm run typecheck` and `npm run lint` passed. The full current mobile suite reported `224/225`, with its sole failure in the W2-owned stale `mobile/tests/uiFlows.test.mjs` harness (`Unexpected import: ../data/locale`); that harness is not modified here. Coordinator reported W2's separately reviewed `dbb1fc7` / `ae2f4c3` integration candidate passes `227/227`, typecheck, and lint. The original 34 Vietnamese MP3s remain the only 34 files at the legacy catalogue path; they and `mobile/assets/voice/manifest.json` are unchanged. The manifest's SHA-256 remains `34925f5d005fa7fb684c4f8fac19992865b581c6eeaa6bde0e9183431c9be05a`, `git diff --exit-code` for its 34 tracked MP3s and manifest returned 0, and the original catalogue regression test passes.

### Reproduction and remaining review

Use the already documented isolated Python 3.12 environment and pinned-cache Kokoro command for the 14-track T2a two-preset comparison. The additional single-story speed pass is:

```powershell
$env:HF_HUB_OFFLINE = "1"
$env:TRANSFORMERS_OFFLINE = "1"
$env:PYTHONDONTWRITEBYTECODE = "1"
.\tools\voice\.venv\Scripts\python.exe -B -X utf8 .\tools\voice\post8_story_speed_probe.py
```

The final first-point pair/candidate generator is `tools/voice/post8_firstpoint.py`; it validates the shared V2 parser, paired locale revisions, pinned English samples, exact VI preset version, MP3 properties, source/spoken/audio hashes, and refuses to overwrite the candidate. Its six-clip/locale output is already present in the paths above; do not run it against a populated target. The actual ASR command is:

```powershell
node tools/voice/gateway/post8_http_probe.mjs en tools/voice/.cache/post8-http-probe/english-horse-answer.wav
node tools/voice/gateway/post8_http_probe.mjs vi tools/voice/.cache/post8-http-probe/firstpoint-vietnamese-horse.wav
```

Still pending are W4 technical review of the native first point, human listening/pronunciation/naturalness approval for both locales, W2 product wiring/integration of the candidate, and device playback checks. The other five nodes / full 66-asset catalog, any preset shipping selection, and Android/iOS microphone/playback QA remain deliberately ungenerated/unclaimed.
