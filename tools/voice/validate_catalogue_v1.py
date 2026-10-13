"""Check every generated clip against its source, MP3 container, and local ASR."""

from __future__ import annotations

import argparse
import json
import math
import re
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / "tools" / "voice" / ".cache"
sys.path.insert(0, str(Path(__file__).parent))

from generate_catalogue_v1 import MODEL_REVISION, clip_rows, sha256
from probe_asr_v0 import edit_distance, normalize
from asr_model import WHISPER_MODEL, WHISPER_REVISION, load_model


def run(*args: str) -> str:
    return subprocess.run(args, check=True, capture_output=True, text=True).stdout


def volume_metrics(path: Path) -> tuple[float, float]:
    result = subprocess.run(
        ["ffmpeg", "-nostdin", "-hide_banner", "-i", str(path), "-af", "volumedetect", "-f", "null", "-"],
        check=True, capture_output=True, text=True,
    )
    values = []
    for name in ("mean_volume", "max_volume"):
        match = re.search(rf"{name}:\s*(-?\d+(?:\.\d+)?)\s*dB", result.stderr)
        if not match:
            raise RuntimeError(f"Could not measure {name}: {path.name}")
        values.append(float(match.group(1)))
    if not all(math.isfinite(value) for value in values):
        raise RuntimeError(f"Silent or invalid audio level: {path.name}")
    return values[0], values[1]


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser()
    parser.add_argument("--ids", nargs="+", help="Only re-check selected clip IDs and print their transcripts")
    args = parser.parse_args()

    dataset_path = ROOT / "data" / "demo.json"
    dataset_bytes = dataset_path.read_bytes()
    dataset = json.loads(dataset_bytes)
    expected = clip_rows(dataset)
    assets = ROOT / "mobile" / "assets" / "voice"
    manifest = json.loads((assets / "manifest.json").read_text(encoding="utf-8"))
    if manifest["sourceDataSha256"] != sha256(dataset_bytes):
        raise RuntimeError("Voice manifest is stale relative to data/demo.json")
    if manifest["tts"]["modelRevision"] != MODEL_REVISION:
        raise RuntimeError("Voice model revision differs from the pinned V0 model")
    if [item["id"] for item in expected] != [item["id"] for item in manifest["entries"]]:
        raise RuntimeError("Voice manifest IDs/order differ from the canonical catalogue")

    model_dir = CACHE / "whisper"
    model_dir.mkdir(parents=True, exist_ok=True)
    model = load_model(model_dir)
    results = []
    total_bytes = 0
    total_duration = 0.0

    for source, entry in zip(expected, manifest["entries"], strict=True):
        if args.ids and entry["id"] not in args.ids:
            continue
        path = ROOT / entry["path"]
        if entry["textSha256"] != sha256(source["text"].encode("utf-8")):
            raise RuntimeError(f"Text hash differs for {entry['id']}")
        if entry.get("nodeId") != source.get("nodeId"):
            raise RuntimeError(f"Node ID differs for {entry['id']}")
        audio_bytes = path.read_bytes()
        if len(audio_bytes) <= 2048 or sha256(audio_bytes) != entry["audioSha256"]:
            raise RuntimeError(f"Missing, tiny, or modified clip: {entry['id']}")
        probe = json.loads(run(
            "ffprobe", "-v", "error", "-select_streams", "a:0",
            "-show_entries", "stream=codec_name,sample_rate,channels",
            "-show_entries", "format=duration", "-of", "json", str(path),
        ))
        stream = probe["streams"][0]
        duration = float(probe["format"]["duration"])
        if (stream["codec_name"] != "mp3" or int(stream["sample_rate"]) != 48_000
                or int(stream["channels"]) != 1 or duration <= 0
                or abs(duration - entry["durationSeconds"]) > 0.05):
            raise RuntimeError(f"Codec, format, or measured duration mismatch: {entry['id']}")
        run("ffmpeg", "-nostdin", "-v", "error", "-i", str(path), "-f", "null", "-")
        mean_volume_db, peak_db = volume_metrics(path)

        started = time.perf_counter()
        segments, info = model.transcribe(str(path), language="vi", beam_size=5, vad_filter=True)
        transcript = " ".join(segment.text.strip() for segment in segments).strip()
        elapsed = time.perf_counter() - started
        expected_words = normalize(source["text"]).split()
        actual_words = normalize(transcript).split()
        folded_expected = normalize(source["text"], fold_diacritics=True).split()
        folded_actual = normalize(transcript, fold_diacritics=True).split()
        results.append({
            "id": entry["id"],
            "nodeId": entry.get("nodeId"),
            "durationSeconds": round(duration, 3),
            "meanVolumeDb": round(mean_volume_db, 2),
            "peakDb": round(peak_db, 2),
            "recognitionSeconds": round(elapsed, 3),
            "detectedLanguage": info.language,
            "wer": round(edit_distance(expected_words, actual_words) / max(len(expected_words), 1), 4),
            "werIgnoringDiacritics": round(edit_distance(folded_expected, folded_actual) / max(len(folded_expected), 1), 4),
            "recognizedWords": len(actual_words),
            "expectedWords": len(expected_words),
            "reference": source["text"],
            "transcript": transcript,
        })
        total_bytes += len(audio_bytes)
        total_duration += duration
        print(f"{entry['id']} {duration:.2f}s WER={results[-1]['wer']:.1%} mean={mean_volume_db:.1f}dB peak={peak_db:.1f}dB {len(audio_bytes)} bytes")

    reports = CACHE / "v1-qc"
    reports.mkdir(parents=True, exist_ok=True)
    report = {
        "input": "locally generated fiction from data/demo.json; no user recordings",
        "engine": f"faster-whisper==1.2.1 / {WHISPER_MODEL}@{WHISPER_REVISION} / CPU int8",
        "manifestSha256": sha256((assets / "manifest.json").read_bytes()),
        "clipCount": len(results),
        "totalDurationSeconds": round(total_duration, 3),
        "totalAudioBytes": total_bytes,
        "volumeRangeDb": {
            "meanMin": round(min(item["meanVolumeDb"] for item in results), 2),
            "meanMax": round(max(item["meanVolumeDb"] for item in results), 2),
            "peakMin": round(min(item["peakDb"] for item in results), 2),
            "peakMax": round(max(item["peakDb"] for item in results), 2),
        },
        "results": results,
        "limits": ["ASR is an automated word-content check, not a human pronunciation or naturalness review.",
                   "No street-noise, device, speaker, clipping-by-ear, or listening QC was performed."],
    }
    report_name = "inspect-report.json" if args.ids else "report.json"
    (reports / report_name).write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    by_error = sorted(results, key=lambda item: item["wer"], reverse=True)
    print(f"Checked {len(results)} clips, {total_duration / 60:.1f} minutes, {total_bytes / 1_000_000:.2f} MB.")
    print("Highest ASR WER:", ", ".join(f"{item['id']} {item['wer']:.1%}" for item in by_error[:5]))
    if args.ids:
        for item in results:
            print(f"\n{item['id']} reference: {item['reference']}\ntranscript: {item['transcript']}")


if __name__ == "__main__":
    main()
