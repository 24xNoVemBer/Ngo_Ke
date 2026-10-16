"""Generate and install only the 54 missing provisional Post-8 voice tracks."""

from __future__ import annotations

import argparse
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
CACHE = TOOLS / ".cache" / "post8-remaining-20261016"
FICTION = ROOT / "data" / "localized" / "fiction.en.json"
PILOT = {"en": ROOT / "data" / "localized" / "old-quarter.en.json",
         "vi": ROOT / "data" / "localized" / "old-quarter.vi.json"}
OUTPUT = ROOT / "mobile" / "assets" / "voice" / "post8" / "remaining"
CATALOG = ROOT / "mobile" / "src" / "voice" / "post8RemainingCatalog.ts"
COLLECTION = "old-quarter-pilot"
FIRST_POINT = "oldquarter-bach-ma"
EN_MODEL = "hexgrad/Kokoro-82M"
EN_REVISION = "f3ff3571791e39611d31c381e3a41a3af07b4987"
EN_LIBRARY = "kokoro==0.9.4"
EN_PRESET = "af_heart"
VI_MODEL = "pnnbao-ump/VieNeu-TTS-v3-Turbo"
VI_REVISION = "61b85e3d937fbbacb387714180e8182823512523"
VI_LIBRARY = "vieneu==3.7.1"
VI_CODEC = "OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX"
VI_CODEC_REVISION = "ceff0d0749bfb3fa2d61149794ec6feef0d1e1ae"
VI_VOICE = "Đoan Trang"
SAMPLE_RATE = 24_000


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def file_hash(path: Path) -> str:
    return sha256(path.read_bytes())


def _checked_text(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value.strip() or value != value.strip():
        raise ValueError(f"Missing or whitespace-unstable source text: {label}")
    return value


def fiction_rows(dataset: dict[str, Any]) -> list[dict[str, str]]:
    if dataset.get("schemaVersion") != 2 or dataset.get("locale") != "en" or dataset.get("collectionId") != "fiction-letter":
        raise ValueError("Expected the English fiction-letter schema-v2 dataset")
    nodes, answers = dataset.get("nodes"), dataset.get("qa")
    intro = dataset.get("intro")
    if not isinstance(nodes, list) or len(nodes) != 6 or not isinstance(answers, list) or len(answers) != 21:
        raise ValueError("Expected six fiction nodes and 21 English answers")
    rows = [{"id": "intro", "kind": "intro", "text": _checked_text(intro.get("text") if isinstance(intro, dict) else None, "intro")}]
    node_ids = {row.get("id") for row in nodes}
    if len(node_ids) != 6 or None in node_ids:
        raise ValueError("Fiction node IDs must be unique")
    for node in nodes:
        node_id = node["id"]
        rows.extend((
            {"id": f"{node_id}-story", "kind": "story", "nodeId": node_id, "text": _checked_text(node.get("story"), f"{node_id}/story")},
            {"id": f"{node_id}-caption", "kind": "caption", "nodeId": node_id, "text": _checked_text(node.get("caption"), f"{node_id}/caption")},
        ))
    if any(row.get("nodeId") not in node_ids for row in answers):
        raise ValueError("Fiction answer references an unknown node")
    rows.extend({"id": f"{row['id']}-answer", "kind": "answer", "nodeId": row["nodeId"],
                 "text": _checked_text(row.get("answer"), f"{row.get('id')}/answer")} for row in answers)
    if len({row["id"] for row in rows}) != 34:
        raise ValueError("Expected 34 unique fiction English tracks")
    return rows


def remaining_pilot_rows(dataset: dict[str, Any]) -> list[dict[str, str]]:
    locale = dataset.get("locale")
    if dataset.get("schemaVersion") != 2 or locale not in ("en", "vi") or dataset.get("collectionId") != COLLECTION:
        raise ValueError("Expected a localized old-quarter-pilot schema-v2 dataset")
    nodes = [row for row in dataset.get("nodes", []) if row.get("id") != FIRST_POINT]
    first_point = [row for row in dataset.get("nodes", []) if row.get("id") == FIRST_POINT]
    if (len(first_point) != 1 or first_point[0].get("reviewStatus") != "approved"
            or len(nodes) != 2 or any(row.get("reviewStatus") != "approved" for row in nodes)):
        raise ValueError("Expected two approved non-firstpoint pilot nodes")
    rows: list[dict[str, str]] = []
    for node in nodes:
        node_id = node["id"]
        rows.extend((
            {"id": f"{node_id}-story", "kind": "story", "nodeId": node_id, "text": _checked_text(node.get("story"), f"{node_id}/story")},
            {"id": f"{node_id}-caption", "kind": "caption", "nodeId": node_id, "text": _checked_text(node.get("caption"), f"{node_id}/caption")},
        ))
        answers = sorted((row for row in dataset.get("qa", []) if row.get("nodeId") == node_id), key=lambda row: row.get("id", ""))
        if len(answers) != 3 or any(row.get("reviewStatus") != "approved" for row in answers):
            raise ValueError(f"Expected three approved answers for {node_id}")
        rows.extend({"id": f"{row['id']}-answer", "kind": "answer", "nodeId": node_id,
                     "text": _checked_text(row.get("answer"), f"{row.get('id')}/answer")} for row in answers)
    if len({row["id"] for row in rows}) != 10:
        raise ValueError("Expected ten unique remaining pilot tracks per locale")
    return rows


def inventory() -> dict[str, list[tuple[str, Path, bytes, dict[str, str]]]]:
    fiction_bytes = FICTION.read_bytes()
    fiction = json.loads(fiction_bytes)
    result: dict[str, list[tuple[str, Path, bytes, dict[str, str]]]] = {"en": [], "vi": []}
    result["en"].extend(("fiction-letter", FICTION, fiction_bytes, row) for row in fiction_rows(fiction))
    for locale, path in PILOT.items():
        source_bytes = path.read_bytes()
        dataset = json.loads(source_bytes)
        result[locale].extend((COLLECTION, path, source_bytes, row) for row in remaining_pilot_rows(dataset))
    if len(result["en"]) != 44 or len(result["vi"]) != 10:
        raise ValueError("Remaining inventory must be exactly 44 EN and 10 VI tracks")
    return result


def dataset_revisions() -> dict[str, dict[str, str]]:
    specs = {"fiction-letter": {"en": str(FICTION)}, COLLECTION: {locale: str(path) for locale, path in PILOT.items()}}
    script = f"""
      import {{ createHash }} from 'node:crypto';
      import {{ readFileSync }} from 'node:fs';
      const {{ parseDatasetV2, validateDatasetV2Pair }} = await import({json.dumps((ROOT / 'mobile/src/data/sourceState.ts').as_uri())});
      const {{ canonicalDatasetJson }} = await import({json.dumps((ROOT / 'mobile/src/data/canonicalJson.ts').as_uri())});
      const specs = {json.dumps(specs)};
      const parsed = {{}};
      for (const [collection, locales] of Object.entries(specs)) {{
        parsed[collection] = {{}};
        for (const [locale, filename] of Object.entries(locales)) {{
          const raw = JSON.parse(readFileSync(filename, 'utf8'));
          parsed[collection][locale] = parseDatasetV2(raw, {{ mode: 'demo', expectedLocale: locale }});
          if (!parsed[collection][locale]) throw new Error(`Shared parser rejected ${{collection}}/${{locale}}`);
        }}
      }}
      const pair = validateDatasetV2Pair(parsed['{COLLECTION}'].vi, parsed['{COLLECTION}'].en);
      if (!pair.ok) throw new Error(pair.reason);
      const result = {{}};
      for (const [collection, locales] of Object.entries(parsed)) {{
        result[collection] = {{}};
        for (const [locale, value] of Object.entries(locales)) result[collection][locale] =
          createHash('sha256').update(canonicalDatasetJson(value), 'utf8').digest('hex');
      }}
      console.log(JSON.stringify(result));
    """
    result = subprocess.run(["node", "--input-type=module", "-e", script], cwd=ROOT, check=True, capture_output=True, text=True)
    return json.loads(result.stdout)


def probe_mp3(path: Path) -> dict[str, Any]:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "stream=codec_name,sample_rate,channels,bit_rate:format=duration,format_name",
         "-of", "json", str(path)], check=True, capture_output=True, text=True,
    )
    report = json.loads(result.stdout)
    stream = report["streams"][0]
    return {"container": "mp3", "codec": stream["codec_name"], "sampleRateHz": int(stream["sample_rate"]),
            "channels": int(stream["channels"]), "bitrateKbps": round(int(stream.get("bit_rate", 0)) / 1000),
            "durationSeconds": round(float(report["format"]["duration"]), 3)}


def encoded_metrics(path: Path, sample_rate: int) -> dict[str, float | int]:
    result = subprocess.run([shutil.which("ffmpeg") or "ffmpeg", "-nostdin", "-v", "error", "-i", str(path),
                             "-f", "s16le", "-acodec", "pcm_s16le", "-ac", "1", "-ar", str(sample_rate), "pipe:1"],
                            check=True, capture_output=True)
    import numpy as np

    samples = np.frombuffer(result.stdout, dtype="<i2").astype(np.float32) / 32768
    if not samples.size:
        raise ValueError(f"Encoded MP3 decoded to empty audio: {path}")
    peak = float(np.max(np.abs(samples)))
    rms = float(np.sqrt(np.mean(np.square(samples), dtype=np.float64)))
    audible = np.flatnonzero(np.abs(samples) >= 10 ** (-50 / 20))
    return {
        "peakDbfs": round(20 * __import__("math").log10(max(peak, 1e-12)), 2),
        "rmsDbfs": round(20 * __import__("math").log10(max(rms, 1e-12)), 2),
        "clippedSamples": int(np.count_nonzero(np.abs(samples) >= 0.999)),
        "leadingSilenceMsAtMinus50dB": round(float(audible[0] * 1000 / sample_rate), 1) if audible.size else -1,
        "trailingSilenceMsAtMinus50dB": round(float((samples.size - 1 - audible[-1]) * 1000 / sample_rate), 1) if audible.size else -1,
    }


def _entry(collection: str, locale: str, source: Path, source_bytes: bytes, row: dict[str, str],
           target: Path, spoken_text: str, tts: dict[str, Any], preset: dict[str, Any], voice: str) -> dict[str, Any]:
    format_info = probe_mp3(target)
    metrics = encoded_metrics(target, format_info["sampleRateHz"])
    if (format_info["codec"] != "mp3" or format_info["channels"] != 1 or format_info["durationSeconds"] <= 0
            or format_info["bitrateKbps"] < 90 or metrics["clippedSamples"] != 0):
        raise RuntimeError(f"Audio QC failed for {locale}/{row['id']}")
    text_hash = sha256(row["text"].encode("utf-8"))
    spoken_hash = sha256(spoken_text.encode("utf-8"))
    relative = target.relative_to(ROOT).as_posix()
    return {"id": row["id"], "contentId": row["id"], "kind": row["kind"],
            **({"nodeId": row["nodeId"]} if row.get("nodeId") else {}),
            "locale": locale, "collectionId": collection,
            "source": source.relative_to(ROOT).as_posix(), "sourceDataSha256": sha256(source_bytes),
            "sourceTextSha256": text_hash, "textHash": text_hash, "spokenText": spoken_text,
            "spokenTextSha256": spoken_hash, "path": relative, "audioSha256": file_hash(target),
            "durationSeconds": format_info["durationSeconds"], "format": format_info, **metrics,
            "tts": tts, "preset": preset, "voice": voice, "humanApproved": False}


def _generate_english(stage: Path, rows: list[tuple[str, Path, bytes, dict[str, str]]]) -> list[dict[str, Any]]:
    from post8_probe import assert_no_unknown_phonemes, to_spoken_text
    import numpy as np
    import torch
    from kokoro import KModel, KPipeline
    from post8_probe import _write_wav

    torch.set_num_threads(2)
    torch.set_num_interop_threads(1)
    cache_root = TOOLS / ".cache" / "post8-hf"
    snapshot = cache_root / "hub" / "models--hexgrad--Kokoro-82M" / "snapshots" / EN_REVISION
    files = {"config": snapshot / "config.json", "model": snapshot / "kokoro-v1_0.pth",
             EN_PRESET: snapshot / "voices" / f"{EN_PRESET}.pt"}
    if any(not path.is_file() for path in files.values()):
        raise RuntimeError(f"Pinned local Kokoro snapshot is incomplete: {snapshot}")
    os.environ["HF_HOME"] = str(cache_root)
    os.environ["HF_HUB_CACHE"] = str(cache_root / "hub")
    os.environ["HF_HUB_OFFLINE"] = "1"
    os.environ["TRANSFORMERS_OFFLINE"] = "1"
    config = json.loads(files["config"].read_text(encoding="utf-8"))
    model = KModel(repo_id=EN_MODEL, config=config, model=str(files["model"])).to("cpu").eval()
    pipeline = KPipeline(lang_code="a", repo_id=EN_MODEL, model=model, device="cpu")
    entries: list[dict[str, Any]] = []
    for collection, source, source_bytes, row in rows:
        spoken = to_spoken_text(row["text"])
        generated = list(pipeline(spoken, voice=str(files[EN_PRESET]), speed=1))
        chunks = [result.audio.detach().cpu().numpy().reshape(-1) for result in generated if result.audio is not None]
        phonemes = [str(result.phonemes or "") for result in generated if result.audio is not None]
        if not chunks:
            raise RuntimeError(f"Kokoro returned no audio for {collection}/{row['id']}")
        assert_no_unknown_phonemes(EN_PRESET, row["id"], phonemes)
        samples = np.concatenate(chunks)
        target = stage / collection / "en" / f"{row['id']}.mp3"
        target.parent.mkdir(parents=True, exist_ok=True)
        wav_path = target.with_suffix(".wav")
        _write_wav(wav_path, samples)
        subprocess.run([shutil.which("ffmpeg") or "ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y",
                        "-i", str(wav_path), "-vn", "-ac", "1", "-ar", str(SAMPLE_RATE), "-codec:a", "libmp3lame",
                        "-b:a", "96k", str(target)], check=True, capture_output=True)
        wav_path.unlink()
        entries.append(_entry(collection, "en", source, source_bytes, row, target, spoken,
                              {"library": EN_LIBRARY, "model": EN_MODEL, "modelRevision": EN_REVISION,
                               "license": "Apache-2.0", "speed": 1.0},
                              {"id": EN_PRESET, "locale": "en-US", "provisional": True}, EN_PRESET))
        print(f"en/{collection}/{row['id']} {entries[-1]['durationSeconds']:.3f}s {entries[-1]['audioSha256']}", flush=True)
    return entries


def _generate_vietnamese(stage: Path, rows: list[tuple[str, Path, bytes, dict[str, str]]]) -> list[dict[str, Any]]:
    from post8_firstpoint import write_wav
    from tts_local import load_tts

    if importlib_version("vieneu") != VI_LIBRARY.split("==", 1)[1]:
        raise RuntimeError(f"Expected {VI_LIBRARY} in the isolated environment")
    tts = load_tts()
    entries: list[dict[str, Any]] = []
    for collection, source, source_bytes, row in rows:
        target = stage / collection / "vi" / f"{row['id']}.mp3"
        target.parent.mkdir(parents=True, exist_ok=True)
        wav_path = target.with_suffix(".wav")
        write_wav(wav_path, tts.infer(row["text"], voice=VI_VOICE))
        subprocess.run([shutil.which("ffmpeg") or "ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y",
                        "-i", str(wav_path), "-vn", "-ac", "1", "-ar", "48000", "-codec:a", "libmp3lame",
                        "-b:a", "96k", str(target)], check=True, capture_output=True)
        wav_path.unlink()
        entries.append(_entry(collection, "vi", source, source_bytes, row, target, row["text"],
                              {"library": VI_LIBRARY, "model": VI_MODEL, "modelRevision": VI_REVISION,
                               "codec": VI_CODEC, "codecRevision": VI_CODEC_REVISION,
                               "license": "See mobile/assets/voice/LICENSES.md"},
                              {"id": VI_VOICE, "locale": "vi-VN", "provisional": True}, VI_VOICE))
        print(f"vi/{collection}/{row['id']} {entries[-1]['durationSeconds']:.3f}s {entries[-1]['audioSha256']}", flush=True)
    return entries


def importlib_version(package: str) -> str:
    import importlib.metadata
    return importlib.metadata.version(package)


def generate(locale: str) -> None:
    if locale not in ("en", "vi"):
        raise ValueError("Only the inventory English and Vietnamese locales are supported")
    if importlib_version("kokoro" if locale == "en" else "vieneu") != (EN_LIBRARY if locale == "en" else VI_LIBRARY).split("==", 1)[1]:
        raise RuntimeError("The expected isolated TTS package version is unavailable")
    cache_locale = CACHE / locale
    if cache_locale.exists():
        raise FileExistsError(f"Refusing to overwrite cached generated {locale} inventory: {cache_locale}")
    CACHE.mkdir(parents=True, exist_ok=True)
    revisions = dataset_revisions()
    rows = inventory()[locale]
    with tempfile.TemporaryDirectory(prefix=f"post8-remaining-{locale}-", dir=CACHE) as temporary:
        stage = Path(temporary)
        entries = _generate_english(stage, rows) if locale == "en" else _generate_vietnamese(stage, rows)
        for entry in entries:
            entry["datasetRevision"] = revisions[entry["collectionId"]][locale]
        by_collection: dict[str, dict[str, Any]] = {}
        for collection, source, source_bytes, row in rows:
            if collection not in by_collection:
                by_collection[collection] = {"datasetRevision": revisions[collection][locale], "entries": []}
        for entry in entries:
            by_collection[entry["collectionId"]]["entries"].append(entry)
        result = {"locale": locale, "catalogues": by_collection}
        (stage / "results.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        stage.rename(cache_locale)
    print(f"Generated {len(entries)} {locale.upper()} missing tracks into {cache_locale}")


def _catalogue_source(catalogues: dict[str, dict[str, Any]]) -> str:
    lines = [
        "/* eslint-disable @typescript-eslint/no-require-imports -- Metro needs statically analyzable asset requires. */",
        "import type { Locale } from '../data/locale';",
        "import type { VoiceTrack } from './catalog';",
        "",
        "export const post8RemainingCatalogues: Record<string, Partial<Record<Locale, { datasetRevision: string; tracks: Record<string, VoiceTrack> }>>> = {",
    ]
    for collection, locales in catalogues.items():
        lines.append(f"  {json.dumps(collection)}: {{")
        for locale, catalogue in locales.items():
            lines.extend((f"    {locale}: {{", f"      datasetRevision: {json.dumps(catalogue['datasetRevision'])},", "      tracks: {"))
            for entry in catalogue["entries"]:
                node = f", nodeId: {json.dumps(entry['nodeId'])}" if entry.get("nodeId") else ""
                source = f"../../assets/voice/post8/remaining/{collection}/{locale}/{entry['id']}.mp3"
                lines.append(f"        {json.dumps(entry['id'])}: {{ id: {json.dumps(entry['id'])}, kind: {json.dumps(entry['kind'])}{node}, "
                             f"source: require({json.dumps(source)}), textHash: {json.dumps(entry['textHash'])}, durationSeconds: {entry['durationSeconds']} }},")
            lines.extend(("      },", "    },"))
        lines.append("  },")
    lines.extend(("};", ""))
    return "\n".join(lines)


def install() -> None:
    if OUTPUT.exists() or CATALOG.exists():
        raise FileExistsError("Refusing to overwrite installed remaining Post-8 audio or catalogue")
    results = {locale: json.loads((CACHE / locale / "results.json").read_text(encoding="utf-8")) for locale in ("en", "vi")}
    expected = inventory()
    revisions = dataset_revisions()
    from post8_probe import to_spoken_text
    all_catalogues: dict[str, dict[str, Any]] = {}
    total = 0
    for locale, data in results.items():
        rows = expected[locale]
        entries = [entry for catalogue in data["catalogues"].values() for entry in catalogue["entries"]]
        if len(entries) != len(rows):
            raise ValueError(f"Cached {locale} manifest does not match the current source inventory")
        expected_by_key = {(collection, row["id"]): (source, source_bytes, row) for collection, source, source_bytes, row in rows}
        for entry in entries:
            key = (entry["collectionId"], entry["id"])
            source, source_bytes, row = expected_by_key.pop(key)
            expected_text_hash = sha256(row["text"].encode("utf-8"))
            expected_spoken = to_spoken_text(row["text"]) if locale == "en" else row["text"]
            if (entry["locale"] != locale or entry["kind"] != row["kind"] or entry.get("nodeId") != row.get("nodeId")
                    or entry["source"] != source.relative_to(ROOT).as_posix()
                    or entry["sourceTextSha256"] != expected_text_hash or entry["textHash"] != expected_text_hash
                    or entry["sourceDataSha256"] != sha256(source_bytes)
                    or entry["datasetRevision"] != revisions[key[0]][locale]
                    or entry["spokenText"] != expected_spoken
                    or entry["spokenTextSha256"] != sha256(entry["spokenText"].encode("utf-8"))):
                raise ValueError(f"Cached source identity/hash changed: {locale}/{key}")
            cached = CACHE / locale / key[0] / locale / f"{entry['id']}.mp3"
            if not cached.is_file() or file_hash(cached) != entry["audioSha256"]:
                raise ValueError(f"Cached audio hash mismatch: {locale}/{key}")
            actual_format = probe_mp3(cached)
            actual_metrics = encoded_metrics(cached, actual_format["sampleRateHz"])
            if (entry["format"] != actual_format or entry["durationSeconds"] != actual_format["durationSeconds"]
                    or any(entry[name] != value for name, value in actual_metrics.items())):
                raise ValueError(f"Cached format, duration, level or cut metrics changed: {locale}/{key}")
            entry["datasetRevision"] = revisions[key[0]][locale]
            entry["path"] = f"mobile/assets/voice/post8/remaining/{key[0]}/{locale}/{entry['id']}.mp3"
            all_catalogues.setdefault(key[0], {}).setdefault(locale, {"datasetRevision": revisions[key[0]][locale], "entries": []})["entries"].append(entry)
            total += 1
        if expected_by_key:
            raise ValueError(f"Missing cached inventory rows for {locale}: {sorted(expected_by_key)}")
    if total != 54 or len(all_catalogues["fiction-letter"]["en"]["entries"]) != 34:
        raise ValueError(f"Expected 54 new tracks (34 fiction EN + 10 pilot per locale), got {total}")
    manifest = {"schemaVersion": 1, "scope": "post8-remaining", "status": "provisional", "humanApproved": False,
                "selectedForShipping": False, "catalogues": all_catalogues}
    with tempfile.TemporaryDirectory(prefix="post8-remaining-install-", dir=CACHE) as temporary:
        stage = Path(temporary) / "remaining"
        for collection, locales in all_catalogues.items():
            for locale, catalogue in locales.items():
                for entry in catalogue["entries"]:
                    source = CACHE / locale / collection / locale / f"{entry['id']}.mp3"
                    target = stage / collection / locale / f"{entry['id']}.mp3"
                    target.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copyfile(source, target)
        (stage / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        catalog_source = _catalogue_source(all_catalogues)
        staged_catalog = Path(temporary) / "post8RemainingCatalog.ts"
        staged_catalog.write_text(catalog_source, encoding="utf-8")
        os.replace(stage, OUTPUT)
        try:
            with CATALOG.open("x", encoding="utf-8", newline="\n") as handle:
                handle.write(catalog_source)
        except Exception:
            shutil.rmtree(OUTPUT)
            raise
    print(f"Installed {total} new provisional tracks; fiction EN 34, pilot EN/VI 10 each")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("en", "vi", "install"), help="generate one locale (sequentially) or install both checked caches")
    action = parser.parse_args().action
    if action == "install":
        install()
    else:
        generate(action)


if __name__ == "__main__":
    main()
