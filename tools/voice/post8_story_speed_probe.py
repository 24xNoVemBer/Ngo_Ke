"""Reproduce only the provisional af_heart English story at Kokoro speed 0.8."""

from __future__ import annotations

import json
import hashlib
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TOOLS = ROOT / "tools" / "voice"
OUTPUT = TOOLS / ".cache" / "post8-firstpoint" / "af_heart-story-speed-08.mp3"
REPORT = OUTPUT.with_suffix(".json")
MANIFEST = ROOT / "mobile" / "assets" / "voice" / "post8" / "old-quarter-pilot" / "manifest.json"
CATALOG = ROOT / "mobile" / "src" / "voice" / "post8Catalog.ts"


def update_provisional_candidate(report: dict[str, object]) -> None:
    if hashlib.sha256(OUTPUT.read_bytes()).hexdigest() != report.get("audioSha256"):
        raise ValueError("The speed sample file does not match its recorded audio hash")
    if not MANIFEST.exists() and not CATALOG.exists():
        return
    if not MANIFEST.exists() or not CATALOG.exists():
        raise FileNotFoundError("The provisional firstpoint manifest and static catalogue must exist together")
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if manifest.get("status") != "provisional-native-firstpoint-candidate" or manifest.get("humanApproved") is not False:
        raise ValueError("Refusing to update a non-provisional or human-approved catalogue")
    entries = manifest["catalogues"]["en"]["entries"]
    matches = [entry for entry in entries if entry.get("id") == report["trackId"]]
    if len(matches) != 1 or matches[0].get("textHash") != report["textSha256"]:
        raise ValueError("The provisional English story does not match this speed sample")
    entry = matches[0]
    target = ROOT / entry["path"]
    shutil.copyfile(OUTPUT, target)
    entry.update({key: report[key] for key in (
        "spokenText", "spokenTextSha256", "audioSha256", "durationSeconds",
        "peakDbfs", "rmsDbfs", "clippedSamples",
        "leadingSilenceMsAtMinus50dB", "trailingSilenceMsAtMinus50dB",
    )})
    entry["format"].update({key: report[key] for key in (
        "codec", "sampleRateHz", "channels", "durationSeconds", "bitrateKbps",
    )})
    entry["tts"]["speed"] = report["speed"]

    temp_manifest = MANIFEST.with_suffix(".json.tmp")
    temp_manifest.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(temp_manifest, MANIFEST)
    catalog = CATALOG.read_text(encoding="utf-8")
    pattern = re.compile(r'("oldquarter-bach-ma-story": \{[^\n]*durationSeconds: )[\d.]+( \},)')
    catalog, count = pattern.subn(rf"\g<1>{report['durationSeconds']}\g<2>", catalog, count=1)
    if count != 1:
        raise ValueError("Expected one English story entry in the static Metro catalogue")
    CATALOG.write_text(catalog, encoding="utf-8")


def main() -> None:
    if OUTPUT.exists() and REPORT.exists():
        report = json.loads(REPORT.read_text(encoding="utf-8"))
        report.setdefault("bitrateKbps", 96)
        update_provisional_candidate(report)
        print(json.dumps(report, ensure_ascii=True, indent=2))
        return
    if OUTPUT.exists() or REPORT.exists():
        raise FileExistsError(f"Refusing to overwrite partial firstpoint speed sample: {OUTPUT}")
    sys.path.insert(0, str(TOOLS))
    from post8_probe import (
        DATASET, MODEL_ID, MODEL_REVISION, SAMPLE_RATE, _load_local_files,
        _probe_mp3, _write_wav, assert_no_unknown_phonemes, extract_tracks,
        sha256_file, sha256_text, to_spoken_text,
    )

    cache_root = TOOLS / ".cache" / "post8-hf"
    os.environ["HF_HOME"] = str(cache_root)
    os.environ["HF_HUB_CACHE"] = str(cache_root / "hub")
    os.environ["HF_HUB_OFFLINE"] = "1"
    os.environ["TRANSFORMERS_OFFLINE"] = "1"
    files = _load_local_files(cache_root)
    dataset = json.loads(DATASET.read_text(encoding="utf-8"))
    track_id = "oldquarter-bach-ma-story"
    text = dict(extract_tracks(dataset))[track_id]
    spoken_text = to_spoken_text(text)

    from kokoro import KModel, KPipeline

    config = json.loads(files["config"].read_text(encoding="utf-8"))
    model = KModel(repo_id=MODEL_ID, config=config, model=str(files["model"])).to("cpu").eval()
    pipeline = KPipeline(lang_code="a", repo_id=MODEL_ID, model=model, device="cpu")
    generated = list(pipeline(spoken_text, voice=str(files["af_heart"]), speed=0.8))
    audio_results = [result for result in generated if result.audio is not None]
    assert_no_unknown_phonemes("af_heart", track_id, [str(result.phonemes or "") for result in audio_results])
    if not audio_results:
        raise RuntimeError("Kokoro returned no speech for the selected story")
    import numpy as np

    audio = np.concatenate([result.audio.detach().cpu().numpy().reshape(-1) for result in audio_results])
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("ffmpeg is required to encode the measured candidate")
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix=".wav", dir=OUTPUT.parent, delete=False) as handle:
        wav_path = Path(handle.name)
    try:
        levels = _write_wav(wav_path, audio)
        subprocess.run(
            [ffmpeg, "-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-i", str(wav_path),
             "-codec:a", "libmp3lame", "-b:a", "96k", "-ar", str(SAMPLE_RATE), "-ac", "1", str(OUTPUT)],
            check=True, capture_output=True, text=True,
        )
    finally:
        wav_path.unlink(missing_ok=True)

    report = {
        "trackId": track_id, "locale": "en", "speed": 0.8,
        "model": MODEL_ID, "modelRevision": MODEL_REVISION,
        "library": "kokoro==0.9.4", "license": "Apache-2.0",
        "preset": "af_heart", "presetLocale": "en-US",
        "textSha256": sha256_text(text), "spokenText": spoken_text,
        "spokenTextSha256": sha256_text(spoken_text),
        "audioSha256": sha256_file(OUTPUT), "samplePath": str(OUTPUT.relative_to(ROOT)),
        "chunks": len(audio_results), "peakDbfs": round(levels[0], 2),
        "rmsDbfs": round(levels[1], 2), "clippedSamples": levels[2],
        "leadingSilenceMsAtMinus50dB": round(levels[3], 1),
        "trailingSilenceMsAtMinus50dB": round(levels[4], 1),
        "bitrateKbps": 96,
        **_probe_mp3(OUTPUT),
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    update_provisional_candidate(report)
    print(json.dumps(report, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()
