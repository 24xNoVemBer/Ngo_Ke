"""Generate the same story samples with the two approved Northern voices."""

from __future__ import annotations

import hashlib
import json
import os
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = ROOT / "data" / "demo.json"
OUT_DIR = ROOT / "tools" / "voice" / ".cache" / "v0-probe"
VOICES = ("Ngọc Linh", "Đoan Trang")
os.environ.setdefault("HF_HOME", str(ROOT / "tools" / "voice" / ".cache" / "huggingface"))
from tts_local import CODEC_REPOSITORY, CODEC_REVISION, MODEL_REPOSITORY, MODEL_REVISION, load_tts


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    dataset = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    node = next((item for item in dataset["nodes"] if item["id"] == "demo-02"), None)
    answer = next(
        (item for item in dataset["qa"] if item["nodeId"] == "demo-02"), None
    )
    assert node and answer, "V0 canonical node/answer is missing"
    samples = {
        "intro": dataset["intro"]["text"],
        "story": node["story"],
        "answer": answer["answer"],
    }
    assert len(samples) == 3 and all(samples.values())

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    tts = load_tts()
    voice_results: dict[str, dict[str, object]] = {}
    report: dict[str, object] = {
        "sdk": "vieneu==3.7.1",
        "backend": "onnx/cpu",
        "model": MODEL_REPOSITORY,
        "modelRevision": MODEL_REVISION,
        "codec": CODEC_REPOSITORY,
        "codecRevision": CODEC_REVISION,
        "sampleRateHz": 48000,
        "source": "data/demo.json",
        "nodeId": node["id"],
        "answerId": answer["id"],
        "textSha256": {
            key: hashlib.sha256(text.encode("utf-8")).hexdigest()
            for key, text in samples.items()
        },
        "voices": voice_results,
    }

    for voice in VOICES:
        voice_report: dict[str, object] = {}
        for sample_id, text in samples.items():
            started = time.perf_counter()
            audio = tts.infer(text, voice=voice)
            elapsed = time.perf_counter() - started
            duration = len(audio) / 48000
            filename = f"{sample_id}-{voice.lower().replace(' ', '-')}.wav"
            tts.save(audio, str(OUT_DIR / filename))
            voice_report[sample_id] = {
                "file": filename,
                "durationSeconds": round(duration, 3),
                "generationSeconds": round(elapsed, 3),
                "rtf": round(elapsed / duration, 3) if duration else None,
            }
        voice_results[voice] = voice_report

    (OUT_DIR / "report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
