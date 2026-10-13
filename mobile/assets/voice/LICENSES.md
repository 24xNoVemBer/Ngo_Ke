# Voice catalogue attribution and license notes

The bundled MP3s are generated from the fictional Ngõ Kể dataset with the local VieNeu v3 Turbo model. They do not use VieNeu Studio or its hosted API, do not clone a named individual, and do not contain personal recordings.

- TTS package: [`vieneu==3.7.1`](https://pypi.org/project/vieneu/), Apache-2.0.
- TTS model: [`pnnbao-ump/VieNeu-TTS-v3-Turbo`](https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo), revision `61b85e3d937fbbacb387714180e8182823512523`, Apache-2.0. The model card describes the bundled preset voices and the use of generated audio; this catalogue uses the bundled **Đoan Trang** preset.
- Audio codec model: [`OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX`](https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX), revision `ceff0d0749bfb3fa2d61149794ec6feef0d1e1ae`, Apache-2.0.
- MP3 encoding: local FFmpeg `libmp3lame`; FFmpeg is a build-time tool and is not bundled in the app.

The pinned repository revisions and output hashes are recorded in `manifest.json`. Keep this notice when redistributing the generated catalogue. The model license does not describe unrelated VieNeu Studio/API voices or services.
