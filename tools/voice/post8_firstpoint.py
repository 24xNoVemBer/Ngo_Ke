"""Build the six-track provisional bilingual Post-8 point, never the old catalogue."""

from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import wave
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
TOOLS = ROOT / "tools" / "voice"
CACHE = TOOLS / ".cache"
EN_DATA = ROOT / "data" / "localized" / "old-quarter.en.json"
VI_DATA = ROOT / "data" / "localized" / "old-quarter.vi.json"
EN_SAMPLES = CACHE / "post8-probe-spoken-v1" / "af_heart"
EN_RESULTS = EN_SAMPLES.parent / "results.json"
EN_STORY_OVERRIDE = CACHE / "post8-firstpoint" / "af_heart-story-speed-08.json"
OUTPUT = ROOT / "mobile" / "assets" / "voice" / "post8" / "old-quarter-pilot"
CATALOG = ROOT / "mobile" / "src" / "voice" / "post8Catalog.ts"
COLLECTION = "old-quarter-pilot"
POINT_ID = "oldquarter-bach-ma"
EN_PRESET = "af_heart"
VI_VOICE = "Đoan Trang"
EN_MODEL = "hexgrad/Kokoro-82M"
EN_REVISION = "f3ff3571791e39611d31c381e3a41a3af07b4987"
EN_LIBRARY = "kokoro==0.9.4"
VI_LIBRARY = "vieneu==3.7.1"
VI_MODEL = "pnnbao-ump/VieNeu-TTS-v3-Turbo"
VI_REVISION = "61b85e3d937fbbacb387714180e8182823512523"
VI_CODEC = "OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX"
VI_CODEC_REVISION = "ceff0d0749bfb3fa2d61149794ec6feef0d1e1ae"
SAMPLE_RATE = 48_000


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def file_hash(path: Path) -> str:
    return sha256(path.read_bytes())


def track_rows(dataset: dict[str, Any]) -> list[dict[str, str]]:
    if dataset.get("schemaVersion") != 2 or dataset.get("collectionId") != COLLECTION:
        raise ValueError("Expected a Post-8 localized schema-v2 pilot")
    if dataset.get("intro", {}).get("reviewStatus") != "approved":
        raise ValueError("Expected approved pilot intro")
    nodes = [row for row in dataset.get("nodes", []) if row.get("id") == POINT_ID]
    if len(nodes) != 1 or nodes[0].get("reviewStatus") != "approved":
        raise ValueError("Expected exactly one approved Bạch Mã node")
    node = nodes[0]
    rows = [
        {"id": "intro", "kind": "intro", "text": dataset["intro"]["text"]},
        {"id": f"{POINT_ID}-story", "kind": "story", "nodeId": POINT_ID, "text": node["story"]},
        {"id": f"{POINT_ID}-caption", "kind": "caption", "nodeId": POINT_ID, "text": node["caption"]},
    ]
    answers = sorted(
        (row for row in dataset.get("qa", []) if row.get("nodeId") == POINT_ID),
        key=lambda row: row.get("id", ""),
    )
    if len(answers) != 3 or any(row.get("reviewStatus") != "approved" for row in answers):
        raise ValueError("Expected exactly three approved Bạch Mã answers")
    rows.extend({"id": f"{row['id']}-answer", "kind": "answer", "nodeId": POINT_ID, "text": row["answer"]} for row in answers)
    if len({row["id"] for row in rows}) != 6 or any(not row["text"].strip() or row["text"] != row["text"].strip() for row in rows):
        raise ValueError("Expected six nonblank, whitespace-stable pilot tracks")
    return rows


def dataset_revisions() -> dict[str, str]:
    source_state = (ROOT / "mobile" / "src" / "data" / "sourceState.ts").as_uri()
    canonical = (ROOT / "mobile" / "src" / "data" / "canonicalJson.ts").as_uri()
    vi_path = json.dumps(str(VI_DATA))
    en_path = json.dumps(str(EN_DATA))
    script = f"""
      import {{ createHash }} from 'node:crypto';
      import {{ readFileSync }} from 'node:fs';
      const {{ parseDatasetV2, validateDatasetV2Pair }} = await import({json.dumps(source_state)});
      const {{ canonicalDatasetJson }} = await import({json.dumps(canonical)});
      const viRaw = JSON.parse(readFileSync({vi_path}, 'utf8'));
      const enRaw = JSON.parse(readFileSync({en_path}, 'utf8'));
      const vi = parseDatasetV2(viRaw, {{ mode: 'demo', expectedLocale: 'vi' }});
      const en = parseDatasetV2(enRaw, {{ mode: 'demo', expectedLocale: 'en' }});
      if (!vi || !en) throw new Error('Shared V2 parser rejected the pilot pair');
      const pair = validateDatasetV2Pair(vi, en);
      if (!pair.ok) throw new Error(pair.reason);
      const revision = (value) => createHash('sha256').update(canonicalDatasetJson(value), 'utf8').digest('hex');
      console.log(JSON.stringify({{ vi: revision(vi), en: revision(en) }}));
    """
    result = subprocess.run(["node", "--input-type=module", "-e", script], cwd=ROOT, check=True, capture_output=True, text=True)
    return json.loads(result.stdout)


def probe_mp3(path: Path) -> dict[str, Any]:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "stream=codec_name,sample_rate,channels,bit_rate:format=duration,format_name",
         "-of", "json", str(path)],
        check=True, capture_output=True, text=True,
    )
    report = json.loads(result.stdout)
    stream = report["streams"][0]
    return {
        "container": "mp3", "codec": stream["codec_name"],
        "sampleRateHz": int(stream["sample_rate"]), "channels": int(stream["channels"]),
        "bitrateKbps": round(int(stream.get("bit_rate", 0)) / 1000),
        "durationSeconds": round(float(report["format"]["duration"]), 3),
    }


def write_wav(path: Path, audio: Any) -> dict[str, float | int]:
    import numpy as np

    samples = np.asarray(audio, dtype=np.float32).reshape(-1)
    if not samples.size or not np.isfinite(samples).all():
        raise ValueError("VieNeu returned empty or non-finite audio")
    peak = float(np.max(np.abs(samples)))
    rms = float(np.sqrt(np.mean(np.square(samples), dtype=np.float64)))
    clipped = int(np.count_nonzero(np.abs(samples) >= 0.999))
    audible = np.flatnonzero(np.abs(samples) >= 10 ** (-50 / 20))
    metrics = {
        "peakDbfs": 20 * __import__("math").log10(max(peak, 1e-12)),
        "rmsDbfs": 20 * __import__("math").log10(max(rms, 1e-12)),
        "clippedSamples": clipped,
        "leadingSilenceMsAtMinus50dB": round(float(audible[0] * 1000 / SAMPLE_RATE), 2) if audible.size else -1,
        "trailingSilenceMsAtMinus50dB": round(float((samples.size - 1 - audible[-1]) * 1000 / SAMPLE_RATE), 2) if audible.size else -1,
    }
    pcm = np.round(np.clip(samples, -1, 1) * 32767).astype("<i2", copy=False)
    with wave.open(str(path), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(SAMPLE_RATE)
        handle.writeframes(pcm.tobytes())
    return metrics


def verify_english_samples(rows: list[dict[str, str]]) -> dict[str, dict[str, Any]]:
    results = json.loads(EN_RESULTS.read_text(encoding="utf-8"))
    if results.get("model") != EN_MODEL or results.get("revision") != EN_REVISION:
        raise ValueError("English TTS probe model revision does not match the pinned model")
    expected = {row["id"] for row in rows}
    samples = {row["trackId"]: row for row in results.get("samples", [])
               if row.get("voice") == EN_PRESET and row.get("trackId") in expected}
    if set(samples) != expected:
        raise ValueError("Selected English preset does not contain exactly the six pilot tracks")
    story_override = json.loads(EN_STORY_OVERRIDE.read_text(encoding="utf-8"))
    if (story_override.get("trackId") != f"{POINT_ID}-story" or story_override.get("speed") != 0.8
            or story_override.get("model") != EN_MODEL or story_override.get("modelRevision") != EN_REVISION
            or story_override.get("preset") != EN_PRESET):
        raise ValueError("English firstpoint story speed sample does not match the pinned model and preset")
    samples[story_override["trackId"]] = story_override
    for row in rows:
        sample = samples[row["id"]]
        path = ROOT / Path(sample["samplePath"])
        if not path.is_file() or file_hash(path) != sample.get("audioSha256"):
            raise ValueError(f"English probe clip is missing or changed: {row['id']}")
        if sample.get("textSha256") != sha256(row["text"].encode("utf-8")):
            raise ValueError(f"English probe source text does not match: {row['id']}")
        if sample.get("spokenTextSha256") != sha256(sample.get("spokenText", "").encode("utf-8")):
            raise ValueError(f"English probe spoken text hash does not match: {row['id']}")
        if sample.get("codec") != "mp3" or sample.get("channels") != 1 or sample.get("clippedSamples") != 0:
            raise ValueError(f"English probe audio failed format or clipping check: {row['id']}")
    return samples


def build_catalogue(catalogues: dict[str, dict[str, Any]]) -> str:
    lines = [
        "/* eslint-disable @typescript-eslint/no-require-imports -- Metro needs statically analyzable asset requires. */",
        "import type { Locale } from '../data/locale';",
        "import type { VoiceTrack } from './catalog';",
        "",
        f"export const POST8_VOICE_COLLECTION = {json.dumps(COLLECTION)};",
        "export const post8VoiceCatalogues: Record<Locale, { datasetRevision: string; tracks: Record<string, VoiceTrack> }> = {",
    ]
    for locale in ("en", "vi"):
        catalogue = catalogues[locale]
        lines.extend((f"  {locale}: {{", f"    datasetRevision: {json.dumps(catalogue['datasetRevision'])},", "    tracks: {"))
        for entry in catalogue["entries"]:
            node = f", nodeId: {json.dumps(entry['nodeId'])}" if entry.get("nodeId") else ""
            source = f"../../assets/voice/post8/{COLLECTION}/{locale}/{entry['id']}.mp3"
            lines.append(
                f"      {json.dumps(entry['id'])}: {{ id: {json.dumps(entry['id'])}, kind: {json.dumps(entry['kind'])}{node}, "
                f"source: require({json.dumps(source)}), textHash: {json.dumps(entry['textHash'])}, durationSeconds: {entry['durationSeconds']} }},"
            )
        lines.extend(("    },", "  },"))
    lines.extend(("};", ""))
    return "\n".join(lines)


def main() -> None:
    if OUTPUT.exists() or CATALOG.exists():
        raise FileExistsError("Refusing to overwrite a Post-8 candidate or catalogue")
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        raise RuntimeError("ffmpeg and ffprobe are required for the firstpoint audio check")

    vi_bytes, en_bytes = VI_DATA.read_bytes(), EN_DATA.read_bytes()
    vi_data, en_data = json.loads(vi_bytes), json.loads(en_bytes)
    if vi_data.get("locale") != "vi" or en_data.get("locale") != "en":
        raise ValueError("Pilot locale labels are invalid")
    vi_rows, en_rows = track_rows(vi_data), track_rows(en_data)
    if [row["id"] for row in vi_rows] != [row["id"] for row in en_rows]:
        raise ValueError("VI and EN firstpoint IDs do not match")
    revisions = dataset_revisions()
    en_samples = verify_english_samples(en_rows)
    if importlib_version(VI_LIBRARY.split("==", 1)[1]) != VI_LIBRARY.split("==", 1)[1]:
        raise RuntimeError(f"Expected {VI_LIBRARY} in the isolated environment")

    CACHE.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="post8-firstpoint-", dir=CACHE) as temporary:
        stage = Path(temporary)
        en_entries: list[dict[str, Any]] = []
        vi_entries: list[dict[str, Any]] = []
        vi_tts = None

        for locale, rows, source_bytes, dataset_revision, entries in (
            ("en", en_rows, en_bytes, revisions["en"], en_entries),
            ("vi", vi_rows, vi_bytes, revisions["vi"], vi_entries),
        ):
            (stage / locale).mkdir()
            for row in rows:
                text_hash = sha256(row["text"].encode("utf-8"))
                if locale == "en":
                    probe = en_samples[row["id"]]
                    source = ROOT / Path(probe["samplePath"])
                    target = stage / locale / f"{row['id']}.mp3"
                    shutil.copyfile(source, target)
                    audio_metrics = probe_mp3(target)
                    metrics = {key: probe[key] for key in (
                        "peakDbfs", "rmsDbfs", "clippedSamples", "leadingSilenceMsAtMinus50dB", "trailingSilenceMsAtMinus50dB",
                    )}
                    spoken_text = probe["spokenText"]
                    tts = {"library": EN_LIBRARY, "model": EN_MODEL, "modelRevision": EN_REVISION,
                           "license": "Apache-2.0", "speed": probe.get("speed", 1.0)}
                    voice = EN_PRESET
                    preset = {"id": EN_PRESET, "locale": "en-US", "provisional": True}
                else:
                    target = stage / locale / f"{row['id']}.mp3"
                    wav_path = stage / locale / f"{row['id']}.wav"
                    if vi_tts is None:
                        sys.path.insert(0, str(TOOLS))
                        from tts_local import load_tts
                        vi_tts = load_tts()
                    metrics = write_wav(wav_path, vi_tts.infer(row["text"], voice=VI_VOICE))
                    subprocess.run(
                        ["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-i", str(wav_path),
                         "-vn", "-ac", "1", "-ar", str(SAMPLE_RATE), "-codec:a", "libmp3lame", "-b:a", "96k", str(target)],
                        check=True, capture_output=True,
                    )
                    wav_path.unlink()
                    audio_metrics = probe_mp3(target)
                    spoken_text = row["text"]
                    tts = {"library": VI_LIBRARY, "model": VI_MODEL, "modelRevision": VI_REVISION,
                           "codec": VI_CODEC, "codecRevision": VI_CODEC_REVISION,
                           "license": "See mobile/assets/voice/LICENSES.md"}
                    voice = VI_VOICE
                    preset = {"id": VI_VOICE, "locale": "vi-VN", "provisional": True}
                if (audio_metrics["codec"] != "mp3" or audio_metrics["channels"] != 1
                        or audio_metrics["durationSeconds"] <= 0 or audio_metrics["bitrateKbps"] < 90
                        or metrics["clippedSamples"] != 0):
                    raise RuntimeError(f"Audio QC failed for {locale}/{row['id']}")
                entry = {
                    "id": row["id"], "contentId": row["id"], "kind": row["kind"],
                    **({"nodeId": row["nodeId"]} if row.get("nodeId") else {}),
                    "locale": locale, "collectionId": COLLECTION, "datasetRevision": dataset_revision,
                    "source": f"data/localized/old-quarter.{locale}.json",
                    "sourceDataSha256": sha256(source_bytes), "sourceTextSha256": text_hash,
                    "textHash": text_hash, "spokenText": spoken_text,
                    "spokenTextSha256": sha256(spoken_text.encode("utf-8")),
                    "path": f"mobile/assets/voice/post8/{COLLECTION}/{locale}/{row['id']}.mp3",
                    "audioSha256": file_hash(target), "durationSeconds": audio_metrics["durationSeconds"],
                    "format": audio_metrics, **metrics, "tts": tts, "preset": preset, "voice": voice,
                    "humanApproved": False,
                }
                entries.append(entry)

        catalogues = {
            "en": {"datasetRevision": revisions["en"], "entries": en_entries},
            "vi": {"datasetRevision": revisions["vi"], "entries": vi_entries},
        }
        manifest = {
            "schemaVersion": 1, "collectionId": COLLECTION,
            "status": "provisional-native-firstpoint-candidate",
            "humanApproved": False, "selectedForShipping": False,
            "catalogues": catalogues,
        }
        (stage / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        catalogue_source = build_catalogue(catalogues)
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", suffix=".ts", dir=CACHE, delete=False) as handle:
            handle.write(catalogue_source)
            staged_catalog = Path(handle.name)
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        os.replace(stage, OUTPUT)
        try:
            os.replace(staged_catalog, CATALOG)
        except Exception:
            staged_catalog.unlink(missing_ok=True)
            raise
        for locale, entries in (("en", en_entries), ("vi", vi_entries)):
            for entry in entries:
                print(f"{locale}/{entry['id']} {entry['durationSeconds']:.3f}s {entry['audioSha256']}")
        print(f"Generated {len(en_entries)} EN and {len(vi_entries)} VI provisional tracks at {OUTPUT}")


def importlib_version(expected: str) -> str:
    import importlib.metadata

    return importlib.metadata.version("vieneu")


if __name__ == "__main__":
    main()
