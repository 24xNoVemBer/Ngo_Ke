# Local Voice tools

This folder generates and checks the native demo's bundled voice catalogue. It does not add TTS/STT packages to the mobile app or send recorded audio to a provider.

Requirements: Python 3.11, uv, and ffmpeg/ffprobe on PATH. The tested environment is Windows 11 + Python 3.11.9. Run commands from the repository root:

    $env:UV_CACHE_DIR = "$PWD/tools/voice/.cache/uv"
    uv venv --python 3.11 tools/voice/.venv
    uv pip install --python tools/voice/.venv/Scripts/python.exe -r tools/voice/requirements-tts.txt
    uv pip install --python tools/voice/.venv/Scripts/python.exe -r tools/voice/requirements-stt.txt
    $env:HF_HOME = "$PWD/tools/voice/.cache/huggingface"
    tools/voice/.venv/Scripts/python.exe tools/voice/prepare_models.py
    tools/voice/.venv/Scripts/python.exe tools/voice/probe_v0.py
    tools/voice/.venv/Scripts/python.exe tools/voice/probe_asr_v0.py
    tools/voice/.venv/Scripts/python.exe tools/voice/generate_catalogue_v1.py
    tools/voice/.venv/Scripts/python.exe tools/voice/validate_catalogue_v1.py

The TTS model and codec are pinned to the tested Hugging Face commits. `asr_model.py` pins the local Whisper revision used by probes and the gateway. `prepare_models.py` downloads the exact TTS revisions. Synthesis and ASR stay local; no text/audio is sent to a hosted endpoint. Generated WAVs, probe reports, model files, and the virtual environment stay under ignored `tools/voice/.cache/` and `tools/voice/.venv/`; only the MP3 catalogue, manifest, and static native asset map are product files.

The optional Windows GPU gateway profile is `NGOKE_VOICE_ASR_PROFILE=large-v3-cuda`. It uses the pinned large-v3 model and hash-pinned NVIDIA CUDA/cuDNN packages in the ignored cache; setup and launch instructions are in `gateway/README.md`. The default remains the small CPU model.

The generator reads only spoken fields in data/demo.json: intro, each story, each caption, and each approved answer. It does not speak evidence/disclaimer metadata. It reuses a clip only when the previous manifest, text hash, pinned revisions, and audio hash all match; new MP3 files are validated before atomically replacing an old file. `validate_catalogue_v1.py` checks every source/text/audio hash, MP3 decode, format, duration, and local Vietnamese ASR word error. Its ASR score is not a substitute for a person listening. Attribution and license scope are in `mobile/assets/voice/LICENSES.md`.
