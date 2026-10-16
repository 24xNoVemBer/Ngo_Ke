"""Persistent, loopback-only faster-whisper adapter for the Node voice gateway."""

from __future__ import annotations

import base64
import importlib.metadata
import json
import os
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CACHE = ROOT / "tools" / "voice" / ".cache"
sys.path.insert(0, str(ROOT / "tools" / "voice"))
from asr_model import LARGE_V3_MODEL, LARGE_V3_REVISION, WHISPER_MODEL, WHISPER_REVISION, load_model

CUDA_DLL_HANDLES = []
SUPPORTED_LOCALES = frozenset({"vi", "en"})


def language_for_locale(locale: object) -> str:
    if not isinstance(locale, str) or locale not in SUPPORTED_LOCALES:
        raise ValueError("Unsupported ASR locale")
    return locale


def load_selected_model():
    profile = os.environ.get("NGOKE_VOICE_ASR_PROFILE", "small-cpu")
    if profile == "small-cpu":
        model_id, revision, device, compute_type = WHISPER_MODEL, WHISPER_REVISION, "cpu", "int8"
        cache_dir = CACHE / "whisper"
    elif profile == "large-v3-cuda":
        if os.name != "nt":
            raise RuntimeError("large-v3-cuda profile currently requires Windows CUDA runtime files")
        runtime = CACHE / "cuda-runtime" / "nvidia"
        for directory in (runtime / "cublas" / "bin", runtime / "cudnn" / "bin"):
            if not directory.is_dir():
                raise RuntimeError(f"CUDA runtime directory missing: {directory}")
            CUDA_DLL_HANDLES.append(os.add_dll_directory(str(directory)))
        model_id, revision, device, compute_type = LARGE_V3_MODEL, LARGE_V3_REVISION, "cuda", "float16"
        cache_dir = CACHE / "huggingface"
    else:
        raise RuntimeError(f"Unsupported NGOKE_VOICE_ASR_PROFILE: {profile}")

    model = load_model(cache_dir, model_id, revision, device, compute_type)
    return model, {
        "profile": profile,
        "engine": "faster-whisper==1.2.1",
        "model": model_id,
        "revision": revision,
        "device": device,
        "computeType": compute_type,
    }


def send(value: dict[str, object]) -> None:
    print(json.dumps(value, ensure_ascii=False, separators=(",", ":")), flush=True)


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)
    if importlib.metadata.version("faster-whisper") != "1.2.1":
        raise RuntimeError("Expected faster-whisper==1.2.1")
    os.environ["HF_HUB_OFFLINE"] = "1"
    os.environ.setdefault("HF_HOME", str(CACHE / "huggingface"))

    model, engine = load_selected_model()
    send({"type": "ready", **engine})

    for line in sys.stdin:
        try:
            request = json.loads(line)
            request_id = request.get("requestId")
            encoded = request.get("audioBase64")
            suffix = request.get("suffix")
            try:
                language = language_for_locale(request.get("locale", "vi"))
            except ValueError:
                send({"requestId": request_id, "code": "INVALID_REQUEST"})
                continue
            if (not isinstance(request_id, str) or not isinstance(encoded, str)
                    or suffix not in {".m4a", ".wav"}):
                send({"requestId": request_id, "code": "INVALID_REQUEST"})
                continue
            audio = base64.b64decode(encoded, validate=True)
            if not audio or len(audio) > 12 * 1024 * 1024:
                send({"requestId": request_id, "code": "INVALID_AUDIO"})
                continue

            temp_path: Path | None = None
            try:
                with tempfile.NamedTemporaryFile(delete=False, suffix=suffix, dir=CACHE) as handle:
                    handle.write(audio)
                    temp_path = Path(handle.name)
                segments, info = model.transcribe(str(temp_path), language=language, beam_size=5, vad_filter=True)
                text = " ".join(segment.text.strip() for segment in segments).strip()
                if not text:
                    send({"requestId": request_id, "code": "NO_SPEECH"})
                    continue
                send({
                    "requestId": request_id,
                    "text": text,
                    "language": info.language,
                    "durationSeconds": round(float(info.duration), 3),
                })
            except Exception:
                send({"requestId": request_id, "code": "ASR_UNAVAILABLE"})
            finally:
                if temp_path is not None:
                    temp_path.unlink(missing_ok=True)
        except (ValueError, json.JSONDecodeError):
            send({"requestId": None, "code": "INVALID_REQUEST"})


if __name__ == "__main__":
    main()
