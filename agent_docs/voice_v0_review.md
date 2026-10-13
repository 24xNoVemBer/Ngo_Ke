# Voice V0 — probe TTS/STT

## Reprobe — 13/10/2026

Reran `probe_asr_v0.py` on all six local synthetic clips with the pinned small model. Selected Đoan Trang clips: 17/216 exact Vietnamese word errors (WER 7.9%), diacritic-folded WER 5.1%, weighted ASR RTF 0.213. The live LAN gateway also transcribed the 19.15s synthetic intro and echoed turn/context correctly; visible substitutions confirm this clean-synthetic score does not establish reliable mic Q&A. No real-person audio was used; field accuracy remains pending.

**Date:** 2026-10-13
**Gate:** GV0 internal quality check; proceed with the selected local stack.
**Authorization:** user pasted the V0–V7 implementation prompt on 2026-10-13; the old per-phase approval rule is superseded for Voice only.

## Result

- TTS: VieNeu SDK `3.7.1`, v3 Turbo ONNX/CPU, model snapshot `61b85e3d937fbbacb387714180e8182823512523`, preset **Đoan Trang**. The six local samples use the same intro, `demo-02` story, and its answer for both tested voices. No Studio token, purchase, or personal recording was used.
- ASR choice: self-hosted `faster-whisper 1.2.1`, `Systran/faster-whisper-small` revision `536b0662742c02347bc0e980a01041f333bce120`, CPU `int8`, language `vi`. The app will call the Node voice gateway over the local network; the gateway calls a child Python ASR worker. Audio stays on the development host/LAN. No LLM or external fallback.
- V0 limit decision: short outdoor Q&A recordings stop at 20 seconds; the app keeps the capped clip for explicit Gửi/Hủy, and the gateway independently rejects actual media longer than 20 seconds. The client/gateway request timeout remains 45 seconds as headroom for CPU model startup, LAN and device latency; those end-to-end phone p95 values were not measured.
- FPT.AI was the second candidate. Its documented endpoint requires a Console API key. The official pricing page surfaced a trial and old package prices, but the page is stale (the search index dates it 1.6 years old), so no free quota or current price is assumed. No account or key is available, so it was not used.
- Preset choice is based on this machine's synthetic-speech measurements: Đoan Trang had lower exact Vietnamese WER (17/216 words, 7.9%) than Ngọc Linh (28/216, 13.0%) and lower duration-weighted ASR RTF (0.212 vs 0.227). Its TTS generation RTF was slightly slower (median 0.672 vs 0.640), while both presets generated faster than real time. These metrics show word recognition and compute speed only; **human judgement of warmth/naturalness is still unverified**.

## Measurements

Host: Windows 11 Home, Python 3.11.9, RTX 5060 Laptop GPU 8,151 MiB, NVIDIA driver 581.15, 16 GiB RAM (about 2.3 GiB free at first inventory), 132.8 GB free on E:. The system Python has CPU-only Torch 2.11.0, so the probe deliberately used ONNX CPU. VieNeu's first run cached about 609 MB of model files; the model ran without CUDA.

| Preset | Sample | Audio duration | TTS time | TTS RTF | ASR time | ASR WER |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Ngọc Linh | intro | 18.81 s | 11.69 s | 0.621 | 4.30 s | 17.11% |
| Ngọc Linh | story | 25.12 s | 16.89 s | 0.673 | 5.07 s | 8.91% |
| Ngọc Linh | answer | 8.80 s | 5.63 s | 0.640 | 2.58 s | 15.38% |
| Đoan Trang | intro | 19.15 s | 12.88 s | 0.672 | 3.99 s | 7.89% |
| Đoan Trang | story | 26.13 s | 18.05 s | 0.691 | 5.05 s | 6.93% |
| Đoan Trang | answer | 10.00 s | 6.66 s | 0.666 | 2.70 s | 10.26% |

TTS RTF = generation time ÷ audio duration; smaller is faster. ASR RTF = recognition time ÷ audio duration. WER preserves Vietnamese diacritics; the local JSON also records a diacritic-folded WER for diagnosis. Values are from one warm local run and synthetic clean audio, not a field or phone benchmark. Duration-weighted aggregate ASR RTF was 0.212 for Đoan Trang and 0.227 for Ngọc Linh; the per-clip measurements above are the primary evidence.

## Compared ASR options

| Option | Cost/data/effort | Probe status | Decision |
| --- | --- | --- | --- |
| `faster-whisper-small` local worker | No per-call API charge; one model download and local CPU; clips remain on host/LAN; Node gateway plus Python child worker to operate | Three synthetic clips for the selected voice; median recognition 3.985 s, max 5.049 s, exact Vietnamese WER 17/216 words (7.9%); diacritic-folded WER 11/216 words (5.1%) | Chosen for the no-credential/no-paid-service path; real mic, noise, and phone/LAN latency remain pending |
| FPT.AI Speech-to-Text cloud | Sends audio to provider; requires API key; paid quotas documented but current pricing/trial could not be verified from the stale page | Docs only; no account, key, audio upload, or latency measurement | Not selected; can be evaluated later with an authorized key and current quote |

## Evidence and limits

- Probe scripts: `tools/voice/probe_v0.py`, `tools/voice/probe_asr_v0.py`; pinned packages: `tools/voice/requirements-tts.txt`, `tools/voice/requirements-stt.txt`.
- Generated files and raw JSON reports are in the ignored local directory `tools/voice/.cache/v0-probe/` so model/sample artifacts do not enter Git accidentally.
- Tests used only text from `data/demo.json` synthesized locally. Nothing was sent to VieNeu Cloud, FPT, or another STT service.
- The command that first generated the files exited non-zero only while printing Vietnamese JSON to a Windows CP1252 console; the WAVs and JSON were written successfully. The probe script now sets UTF-8 output. Re-run after that fix is not needed to validate the already-created files.
- The selected preset remains subject to listening for emotional quality; recognition scores cannot establish “warm and natural”. No real microphone, street noise, Android/iOS audio session, or public gateway has been tested in V0.
