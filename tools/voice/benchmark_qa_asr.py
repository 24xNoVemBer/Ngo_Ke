"""Compare the pinned small STT with local large-v3 on the same synthetic Q&A clips."""

from __future__ import annotations

import gc
import hashlib
import json
import math
import os
import re
import statistics
import sys
import tempfile
import time
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / "tools" / "voice" / ".cache"
OUTPUT = CACHE / "qa-asr-model-comparison.json"
LARGE_MODEL = "Systran/faster-whisper-large-v3"
LARGE_REVISION = "edaa852ec7e145841d8ffdb056a99866b5f0a478"
sys.path.insert(0, str(ROOT / "tools" / "voice"))
os.environ.setdefault("HF_HOME", str(CACHE / "huggingface"))

from asr_model import WHISPER_MODEL, WHISPER_REVISION, load_model
from faster_whisper import WhisperModel
import ctranslate2
from huggingface_hub import snapshot_download
from tts_local import load_tts


TRAILING_PUNCTUATION = re.compile(r"[?!.,;:]+$")


def normalize_question(text: str) -> str:
    text = " ".join(text.strip().split())
    text = unicodedata.normalize("NFD", text)
    text = "".join(char for char in text if unicodedata.category(char) != "Mn")
    text = re.sub("đ", "d", text, flags=re.IGNORECASE).lower().strip()
    return TRAILING_PUNCTUATION.sub("", text).strip()


def exact_match(entries: list[dict[str, object]], transcript: str) -> str | None:
    asked = normalize_question(transcript)
    for entry in entries:
        if entry["question"] and normalize_question(entry["question"]) == asked:
            return str(entry["id"])
    for entry in entries:
        if any(normalize_question(alias) == asked for alias in entry["aliases"]):
            return str(entry["id"])
    return None


def evaluate(model, model_id: str, entries: list[dict[str, object]], clips: list[dict[str, object]]) -> dict[str, object]:
    rows = []
    for entry, clip in zip(entries, clips, strict=True):
        started = time.perf_counter()
        segments, info = model.transcribe(
            str(clip["path"]), language="vi", beam_size=5, vad_filter=True
        )
        transcript = " ".join(segment.text.strip() for segment in segments).strip()
        elapsed = time.perf_counter() - started
        matched_id = exact_match(entries, transcript)
        rows.append({
            "id": entry["id"],
            "nodeId": entry["nodeId"],
            "transcript": transcript,
            "matchedId": matched_id,
            "exactExpected": matched_id == entry["id"],
            "durationSeconds": round(float(info.duration), 3),
            "recognitionSeconds": round(elapsed, 3),
        })

    times = [row["recognitionSeconds"] for row in rows]
    durations = [row["durationSeconds"] for row in rows]
    p95_index = max(0, math.ceil(len(times) * 0.95) - 1)
    return {
        "model": model_id,
        "exactMatches": sum(row["exactExpected"] for row in rows),
        "total": len(rows),
        "unknown": sum(row["matchedId"] is None for row in rows),
        "wrongAnswers": sum(row["matchedId"] not in (None, row["id"]) for row in rows),
        "recognitionP50Seconds": round(statistics.median(times), 3),
        "recognitionP95Seconds": round(sorted(times)[p95_index], 3),
        "weightedRtf": round(sum(times) / sum(durations), 3),
        "results": rows,
    }


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    dataset = json.loads((ROOT / "data" / "demo.json").read_text(encoding="utf-8"))
    entries = dataset["qa"]
    assert len(entries) == 21, "Expected all 21 canonical Q&A entries"
    CACHE.mkdir(parents=True, exist_ok=True)
    large_model_path = snapshot_download(
        LARGE_MODEL,
        revision=LARGE_REVISION,
        cache_dir=str(CACHE / "huggingface"),
    )

    with tempfile.TemporaryDirectory(prefix="qa-asr-model-", dir=CACHE) as temp:
        tts = load_tts()
        clips = []
        for entry in entries:
            audio = tts.infer(entry["question"], voice="Đoan Trang")
            path = Path(temp) / f"{entry['id']}.wav"
            tts.save(audio, str(path))
            clips.append({
                "path": path,
                "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                "durationSeconds": round(len(audio) / 48_000, 3),
            })
        del tts
        gc.collect()
        assert "int8" in ctranslate2.get_supported_compute_types("cpu")

        small = load_model(CACHE / "whisper")
        small_report = evaluate(small, f"{WHISPER_MODEL}@{WHISPER_REVISION};cpu;int8", entries, clips)
        del small
        gc.collect()

        large = WhisperModel(
            large_model_path,
            device="cpu",
            compute_type="int8",
        )
        large_report = evaluate(large, f"{LARGE_MODEL}@{LARGE_REVISION};cpu;int8", entries, clips)
        del large
        gc.collect()

    report = {
        "input": "21 canonical questions synthesized locally with VieNeu v3 Turbo / Đoan Trang; no personal audio or upload",
        "language": "vi",
        "beamSize": 5,
        "vadFilter": True,
        "audioSha256": {entry["id"]: clip["sha256"] for entry, clip in zip(entries, clips, strict=True)},
        "small": small_report,
        "largeV3": large_report,
    }
    OUTPUT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "output": str(OUTPUT.relative_to(ROOT)),
        "small": {key: value for key, value in small_report.items() if key != "results"},
        "largeV3": {key: value for key, value in large_report.items() if key != "results"},
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
