# Voice catalogue attribution and license notes

The bundled MP3s are generated from the fictional Ngõ Kể dataset with the local VieNeu v3 Turbo model. They do not use VieNeu Studio or its hosted API, do not clone a named individual, and do not contain personal recordings.

- TTS package: [`vieneu==3.7.1`](https://pypi.org/project/vieneu/), Apache-2.0.
- TTS model: [`pnnbao-ump/VieNeu-TTS-v3-Turbo`](https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo), revision `61b85e3d937fbbacb387714180e8182823512523`, Apache-2.0. The model card describes the bundled preset voices and the use of generated audio; this catalogue uses the bundled **Đoan Trang** preset.
- Audio codec model: [`OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX`](https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX), revision `ceff0d0749bfb3fa2d61149794ec6feef0d1e1ae`, Apache-2.0.
- MP3 encoding: local FFmpeg `libmp3lame`; FFmpeg is a build-time tool and is not bundled in the app.

The pinned repository revisions and output hashes are recorded in `manifest.json`. Keep this notice when redistributing the generated catalogue. The model license does not describe unrelated VieNeu Studio/API voices or services.

## Three Lenses collection additions

- English TTS package: [`kokoro==0.9.4`](https://pypi.org/project/kokoro/), Apache-2.0; cached model [`hexgrad/Kokoro-82M`](https://huggingface.co/hexgrad/Kokoro-82M), revision `f3ff3571791e39611d31c381e3a41a3af07b4987`, Apache-2.0, preset **af_heart**.
- Vietnamese TTS uses the VieNeu package, model, codec, and **Đoan Trang** preset listed above.
- The 56 MP3s use the frozen, source-only `old-quarter-three-lenses` datasets. Their manifests mark `humanApproved=false`; this records provenance and does not claim human pronunciation review.

## Three Lenses ElevenLabs source-only collection

- Generated on 2026-10-19 with the ElevenLabs text-to-speech API, model `eleven_v4`, output `mp3_44100_128`, rate `1.0`, and settings `{stability: 0.5, similarity_boost: 0.75}`.
- Vietnamese voice: **Thắm** (`0ggMuQ1r9f9jqBu50nJn`). English voice: **Talia** (`OZ0L6eISlOejga3XjDFt`).
- The per-track source, voice, cost, and audio provenance is recorded in [`three-lenses-elevenlabs/manifest.json`](three-lenses-elevenlabs/manifest.json). The output remains provisional and source-only with `humanApproved=false`; this note records provenance and does not assert a redistribution license.
