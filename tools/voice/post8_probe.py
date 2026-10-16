"""Generate only the Post-8 English Bạch Mã pilot tracks into the ignored cache."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import tempfile
import wave
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
DATASET = ROOT / "data" / "localized" / "old-quarter.en.json"
MODEL_ID = "hexgrad/Kokoro-82M"
MODEL_REVISION = "f3ff3571791e39611d31c381e3a41a3af07b4987"
SAMPLE_RATE = 24_000
POINT_ID = "oldquarter-bach-ma"
PRONUNCIATION_MAP = (
    ("Hà Nội", "Hah Noy"),
    ("Bạch Mã", "Bahk Mah"),
    ("Long Đỗ", "Long Doe"),
    ("Mã Mây", "Mah May"),
    ("Đồng Xuân", "Zohng Swun"),
    ("Hàng Buồm", "Hahng Boom"),
    ("Thăng Long", "Tahng Long"),
    ("bún chả", "boon chah"),
    ("bún ốc", "boon awk"),
    ("bún đậu", "boon doh"),
    ("bánh đậu xanh", "bahn doh sahn"),
    ("cô", "Koh"),
    ("bà", "Bah"),
    ("chè", "cheh"),
    ("nộm", "nohm"),
    ("bún", "boon"),
    ("bánh", "bahn"),
    ("đậu", "doh"),
    ("bánh tôm", "bahn tom"),
    ("An", "Ahn"),
    ("Lâm", "Lahm"),
    ("Hương", "Hwung"),
    ("Nhi", "Nee"),
)
VOICES = (("af_heart", "a"), ("bf_emma", "b"))
PRONUNCIATION_CHECK = (
    "On a cool, golden evening in Hà Nội, after a long day exploring Bạch Mã Temple, "
    "the story of Long Đỗ, 87 Mã Mây, and the busy paths around Đồng Xuân Market, "
    "An, Lâm, Hương, and Nhi found a small table, shared steaming bowls of bún chả "
    "and bún ốc with crisp bánh tôm, and promised to meet again whenever they wanted "
    "to trade stories, laugh about the day, and make the old streets feel a little more like home."
)


def extract_tracks(dataset: dict[str, Any]) -> list[tuple[str, str]]:
    if dataset.get("schemaVersion") != 2 or dataset.get("locale") != "en":
        raise ValueError("Expected the reviewed English schema-v2 pilot")
    if dataset.get("collectionId") != "old-quarter-pilot":
        raise ValueError("Unexpected dataset collection")

    nodes = [row for row in dataset.get("nodes", []) if row.get("id") == POINT_ID]
    if len(nodes) != 1 or nodes[0].get("reviewStatus") != "approved":
        raise ValueError("Expected exactly one approved Bạch Mã point")
    node = nodes[0]
    intro = dataset.get("intro")
    if not isinstance(intro, dict) or intro.get("reviewStatus") != "approved":
        raise ValueError("Expected an approved introduction")

    tracks = [
        ("intro", intro.get("text")),
        (f"{POINT_ID}-story", node.get("story")),
        (f"{POINT_ID}-caption", node.get("caption")),
    ]
    answers = sorted(
        (row for row in dataset.get("qa", []) if row.get("nodeId") == POINT_ID),
        key=lambda row: row.get("id", ""),
    )
    if len(answers) != 3 or any(row.get("reviewStatus") != "approved" for row in answers):
        raise ValueError("Expected exactly three approved Bạch Mã answers")
    tracks.extend((f"{row['id']}-answer", row.get("answer")) for row in answers)
    if any(not isinstance(text, str) or not text.strip() for _, text in tracks):
        raise ValueError("Every pilot track must have reviewed text")
    return [(track_id, text.strip()) for track_id, text in tracks]


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def to_spoken_text(text: str) -> str:
    for source, spoken in sorted(PRONUNCIATION_MAP, key=lambda pair: len(pair[0]), reverse=True):
        # Boundaries keep the capitalized name An out of ordinary English words.
        flags = 0 if source == "An" else re.IGNORECASE
        pattern = re.compile(rf"(?<!\w){re.escape(source)}(?!\w)", flags)
        text = pattern.sub(spoken, text)
    return text


def assert_no_unknown_phonemes(voice: str, track_id: str, phonemes: list[str]) -> None:
    if any("❓" in value for value in phonemes):
        raise RuntimeError(f"Unknown G2P token for {voice}/{track_id}")


def _write_wav(path: Path, samples: Any) -> tuple[float, float, int, float, float]:
    import numpy as np

    audio = np.asarray(samples, dtype=np.float32).reshape(-1)
    if audio.size == 0 or not np.isfinite(audio).all():
        raise ValueError("Kokoro returned empty or non-finite audio")
    peak = float(np.max(np.abs(audio)))
    rms = float(np.sqrt(np.mean(np.square(audio), dtype=np.float64)))
    clipped = int(np.count_nonzero(np.abs(audio) >= 0.999))
    audible = np.flatnonzero(np.abs(audio) >= 10 ** (-50 / 20))
    leading_ms = float(audible[0] * 1000 / SAMPLE_RATE) if audible.size else float("inf")
    trailing_ms = float((audio.size - 1 - audible[-1]) * 1000 / SAMPLE_RATE) if audible.size else float("inf")
    pcm = np.clip(audio, -1, 1)
    pcm = np.round(pcm * 32767).astype("<i2", copy=False)
    with wave.open(str(path), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(SAMPLE_RATE)
        handle.writeframes(pcm.tobytes())
    peak_dbfs = 20 * __import__("math").log10(max(peak, 1e-12))
    rms_dbfs = 20 * __import__("math").log10(max(rms, 1e-12))
    return peak_dbfs, rms_dbfs, clipped, leading_ms, trailing_ms


def _probe_mp3(path: Path) -> dict[str, Any]:
    result = subprocess.run(
        [
            "ffprobe", "-v", "error", "-show_entries",
            "format=duration:stream=codec_name,sample_rate,channels",
            "-of", "json", str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    report = json.loads(result.stdout)
    stream = report["streams"][0]
    return {
        "codec": stream["codec_name"],
        "sampleRateHz": int(stream["sample_rate"]),
        "channels": int(stream["channels"]),
        "durationSeconds": round(float(report["format"]["duration"]), 3),
    }


def _load_local_files(cache_root: Path) -> dict[str, Path]:
    os.environ["HF_HOME"] = str(cache_root)
    os.environ["HF_HUB_CACHE"] = str(cache_root / "hub")
    os.environ["HF_HUB_OFFLINE"] = "1"
    os.environ["TRANSFORMERS_OFFLINE"] = "1"
    from huggingface_hub import hf_hub_download

    names = {
        "config": "config.json",
        "model": "kokoro-v1_0.pth",
        "af_heart": "voices/af_heart.pt",
        "bf_emma": "voices/bf_emma.pt",
    }
    return {
        key: Path(
            hf_hub_download(
                repo_id=MODEL_ID,
                filename=name,
                revision=MODEL_REVISION,
                local_files_only=True,
                token=False,
            )
        )
        for key, name in names.items()
    }


def generate(output_dir: Path) -> dict[str, Any]:
    cache_root = ROOT / "tools" / "voice" / ".cache" / "post8-hf"
    os.environ["HF_HOME"] = str(cache_root)
    os.environ["HF_HUB_CACHE"] = str(cache_root / "hub")
    os.environ["HF_HUB_OFFLINE"] = "1"
    os.environ["TRANSFORMERS_OFFLINE"] = "1"
    import numpy as np
    import torch
    from kokoro import KModel, KPipeline

    ffmpeg = shutil.which("ffmpeg")
    ffprobe = shutil.which("ffprobe")
    if not ffmpeg or not ffprobe:
        raise RuntimeError("ffmpeg and ffprobe are required for reproducible MP3 samples")

    files = _load_local_files(cache_root)
    dataset = json.loads(DATASET.read_text(encoding="utf-8"))
    tracks = extract_tracks(dataset)
    config = json.loads(files["config"].read_text(encoding="utf-8"))
    model = KModel(repo_id=MODEL_ID, config=config, model=str(files["model"])).to("cpu").eval()

    if output_dir.exists() and any(output_dir.iterdir()):
        raise FileExistsError(f"Refusing to overwrite existing probe output: {output_dir}")
    output_dir.mkdir(parents=True, exist_ok=True)
    samples: list[dict[str, Any]] = []
    for voice, lang_code in VOICES:
        pipeline = KPipeline(lang_code=lang_code, repo_id=MODEL_ID, model=model, device="cpu")
        for track_id, text in [*tracks, ("synthetic-pronunciation-check", PRONUNCIATION_CHECK)]:
            spoken_text = to_spoken_text(text)
            generated = list(pipeline(spoken_text, voice=str(files[voice]), speed=1))
            audio_results = [result for result in generated if result.audio is not None]
            assert_no_unknown_phonemes(voice, track_id, [str(result.phonemes or "") for result in audio_results])
            chunks = [result.audio.detach().cpu().numpy().reshape(-1) for result in audio_results]
            if not chunks:
                raise RuntimeError(f"Kokoro returned no audio for {voice}/{track_id}")
            audio = np.concatenate(chunks)
            sample_dir = output_dir / voice
            sample_dir.mkdir(parents=True, exist_ok=True)
            mp3_path = sample_dir / f"{track_id}.mp3"
            with tempfile.NamedTemporaryFile(suffix=".wav", dir=sample_dir, delete=False) as handle:
                wav_path = Path(handle.name)
            try:
                level = _write_wav(wav_path, audio)
                subprocess.run(
                    [ffmpeg, "-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-i", str(wav_path),
                     "-codec:a", "libmp3lame", "-b:a", "96k", "-ar", str(SAMPLE_RATE), "-ac", "1", str(mp3_path)],
                    check=True,
                    capture_output=True,
                    text=True,
                )
            finally:
                wav_path.unlink(missing_ok=True)

            details = _probe_mp3(mp3_path)
            samples.append({
                "voice": voice,
                "trackId": track_id,
                "speed": 1.0,
                "textSha256": sha256_text(text),
                "spokenText": spoken_text,
                "spokenTextSha256": sha256_text(spoken_text),
                "audioSha256": sha256_file(mp3_path),
                "samplePath": str(mp3_path.relative_to(ROOT)),
                "chunks": len(chunks),
                "peakDbfs": round(level[0], 2),
                "rmsDbfs": round(level[1], 2),
                "clippedSamples": level[2],
                "leadingSilenceMsAtMinus50dB": round(level[3], 1),
                "trailingSilenceMsAtMinus50dB": round(level[4], 1),
                "bitrateKbps": 96,
                **details,
            })

    result = {
        "model": MODEL_ID,
        "revision": MODEL_REVISION,
        "dataset": str(DATASET.relative_to(ROOT)),
        "datasetLocale": dataset["locale"],
        "pointId": POINT_ID,
        "pilotTrackCount": len(tracks),
        "voiceCount": len(VOICES),
        "syntheticCheck": PRONUNCIATION_CHECK,
        "samples": samples,
    }
    result_path = output_dir / "results.json"
    result_path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        type=Path,
        default=ROOT / "tools" / "voice" / ".cache" / "post8-probe-spoken-v1",
        help="ignored local sample directory (defaults under tools/voice/.cache)",
    )
    args = parser.parse_args()
    report = generate(args.output.resolve())
    print(f"generated {len(report['samples'])} MP3 samples at {args.output.resolve()}")
    for sample in report["samples"]:
        print(
            f"{sample['voice']} {sample['trackId']}: {sample['durationSeconds']:.2f}s "
            f"{sample['codec']} {sample['sampleRateHz']}Hz peak={sample['peakDbfs']}dBFS "
            f"sha256={sample['audioSha256']} path={sample['samplePath']}"
        )


if __name__ == "__main__":
    main()
