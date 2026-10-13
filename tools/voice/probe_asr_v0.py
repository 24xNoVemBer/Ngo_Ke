"""Compare local Vietnamese ASR on the synthetic VieNeu V0 samples."""

from __future__ import annotations

import json
import os
import re
import sys
import time
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / "tools" / "voice" / ".cache"
os.environ.setdefault("HF_HOME", str(CACHE / "huggingface"))

from asr_model import WHISPER_MODEL, WHISPER_REVISION, load_model


def normalize(text: str, *, fold_diacritics: bool = False) -> str:
    text = unicodedata.normalize("NFD" if fold_diacritics else "NFC", text.casefold())
    if fold_diacritics:
        text = "".join(char for char in text if unicodedata.category(char) != "Mn")
    return re.sub(r"[^\wđ]+", " ", text, flags=re.UNICODE).replace("_", " ").strip()


def edit_distance(left: list[str], right: list[str]) -> int:
    previous = list(range(len(right) + 1))
    for row, first in enumerate(left, 1):
        current = [row]
        for column, second in enumerate(right, 1):
            current.append(min(
                current[-1] + 1,
                previous[column] + 1,
                previous[column - 1] + (first != second),
            ))
        previous = current
    return previous[-1]


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    probe_dir = CACHE / "v0-probe"
    tts_report = json.loads((probe_dir / "report.json").read_text(encoding="utf-8"))
    dataset = json.loads((ROOT / "data" / "demo.json").read_text(encoding="utf-8"))
    node = next(item for item in dataset["nodes"] if item["id"] == "demo-02")
    answer = next(item for item in dataset["qa"] if item["nodeId"] == "demo-02")
    reference = {"intro": dataset["intro"]["text"], "story": node["story"], "answer": answer["answer"]}
    model_dir = CACHE / "whisper"
    model_dir.mkdir(parents=True, exist_ok=True)
    model = load_model(model_dir)

    results = []
    for voice, clips in tts_report["voices"].items():
        for sample_id, clip in clips.items():
            started = time.perf_counter()
            segments, info = model.transcribe(
                str(probe_dir / clip["file"]), language="vi", beam_size=5, vad_filter=True
            )
            text = " ".join(segment.text.strip() for segment in segments).strip()
            elapsed = time.perf_counter() - started
            expected_words = normalize(reference[sample_id]).split()
            actual_words = normalize(text).split()
            folded_expected = normalize(reference[sample_id], fold_diacritics=True).split()
            folded_actual = normalize(text, fold_diacritics=True).split()
            errors = edit_distance(expected_words, actual_words)
            results.append({
                "voice": voice,
                "sample": sample_id,
                "language": info.language,
                "durationSeconds": round(info.duration, 3),
                "recognitionSeconds": round(elapsed, 3),
                "rtf": round(elapsed / info.duration, 3) if info.duration else None,
                "wer": round(errors / max(len(expected_words), 1), 4),
                "werIgnoringDiacritics": round(edit_distance(folded_expected, folded_actual) / max(len(folded_expected), 1), 4),
                "expectedWords": len(expected_words),
                "recognizedWords": len(actual_words),
                "transcript": text,
            })

    report = {
        "engine": "faster-whisper==1.2.1",
        "model": WHISPER_MODEL,
        "modelRevision": WHISPER_REVISION,
        "device": "cpu",
        "computeType": "int8",
        "language": "vi",
        "input": "synthetic VieNeu samples from data/demo.json; no user recording uploaded",
        "results": results,
    }
    (probe_dir / "asr-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
