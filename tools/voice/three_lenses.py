"""Generate, audit, and install the bounded Three Lenses voice collection."""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from post8_remaining import (
    EN_LIBRARY,
    EN_MODEL,
    EN_PRESET,
    EN_REVISION,
    ROOT,
    TOOLS,
    VI_CODEC,
    VI_CODEC_REVISION,
    VI_LIBRARY,
    VI_MODEL,
    VI_REVISION,
    VI_VOICE,
    _generate_english,
    _generate_vietnamese,
    encoded_metrics,
    file_hash,
    importlib_version,
    probe_mp3,
    sha256,
)

COLLECTION = "old-quarter-three-lenses"
LOCALES = ("en", "vi")
NODE_IDS = ("oldquarter-bach-ma", "oldquarter-ma-may", "oldquarter-dong-xuan")
CORE = {locale: ROOT / "data" / "localized" / f"three-lenses.{locale}.json" for locale in LOCALES}
JOURNEY = {locale: ROOT / "data" / "journeys" / f"three-lenses.{locale}.json" for locale in LOCALES}
CACHE = TOOLS / ".cache" / "three-lenses-20261019"
OUTPUT = ROOT / "mobile" / "assets" / "voice" / "three-lenses"
CATALOG = ROOT / "mobile" / "src" / "voice" / "threeLensesCatalog.ts"
CONTENT_ID = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]{0,127}\Z")


def _read_json(path: Path) -> tuple[bytes, dict[str, Any]]:
    raw = path.read_bytes()
    value = json.loads(raw)
    if not isinstance(value, dict):
        raise ValueError(f"Expected a JSON object: {path}")
    return raw, value


def _text(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value.strip() or value != value.strip():
        raise ValueError(f"Missing or whitespace-unstable text: {label}")
    return value


def asset_path(output_root: Path, locale: str, content_id: str) -> Path:
    if locale not in LOCALES or not CONTENT_ID.fullmatch(content_id):
        raise ValueError(f"Unsafe voice asset identity: {locale}/{content_id}")
    base = output_root.resolve()
    target = (output_root / locale / f"{content_id}.mp3").resolve()
    try:
        target.relative_to(base)
    except ValueError as error:
        raise ValueError(f"Voice asset path escapes its output root: {target}") from error
    return target


def _inside_root(path: Path) -> Path:
    resolved = path.resolve()
    try:
        resolved.relative_to(ROOT.resolve())
    except ValueError as error:
        raise ValueError(f"Voice output escapes the repository: {resolved}") from error
    return resolved


def safe_output_paths(rows: dict[str, list[tuple[str, Path, bytes, dict[str, str]]]]) -> None:
    _inside_root(CACHE)
    _inside_root(OUTPUT)
    _inside_root(CATALOG)
    for locale, locale_rows in rows.items():
        for collection, _, _, row in locale_rows:
            if collection != COLLECTION:
                raise ValueError(f"Unexpected collection in output inventory: {collection}")
            asset_path(OUTPUT, locale, row["id"])


def inventory() -> dict[str, list[tuple[str, Path, bytes, dict[str, str]]]]:
    """Return exactly the 28 core and companion identities for each locale."""
    result: dict[str, list[tuple[str, Path, bytes, dict[str, str]]]] = {}
    for locale in LOCALES:
        core_bytes, core = _read_json(CORE[locale])
        journey_bytes, journey = _read_json(JOURNEY[locale])
        if (core.get("schemaVersion") != 2 or core.get("collectionId") != COLLECTION
                or core.get("locale") != locale):
            raise ValueError(f"Unexpected core dataset scope for {locale}")
        if (journey.get("schemaVersion") != 1 or journey.get("collectionId") != COLLECTION
                or journey.get("locale") != locale or journey.get("officiallyApproved") is not False):
            raise ValueError(f"Unexpected companion scope for {locale}")
        nodes, answers = core.get("nodes"), core.get("qa")
        chapters, transitions = journey.get("chapters"), journey.get("transitions")
        if (not isinstance(nodes, list) or len(nodes) != 3 or not isinstance(answers, list) or len(answers) != 16
                or not isinstance(chapters, list) or len(chapters) != 5
                or not isinstance(transitions, list) or len(transitions) != 2
                or not isinstance(journey.get("closing"), dict)):
            raise ValueError(f"Expected 3 nodes, 16 answers, 5 chapters, 2 transitions, and a closing for {locale}")
        if tuple(node.get("id") for node in nodes) != NODE_IDS:
            raise ValueError(f"Unexpected physical node identities or order for {locale}")
        node_by_id = {node["id"]: node for node in nodes}
        if len(node_by_id) != 3 or any(node.get("reviewStatus") != "approved" for node in nodes):
            raise ValueError(f"Expected three internally reviewed physical nodes for {locale}")

        rows: list[dict[str, str]] = [{
            "id": "intro", "kind": "intro", "text": _text((core.get("intro") or {}).get("text"), f"{locale}/intro")
        }]
        chapter_counts = {node_id: 0 for node_id in NODE_IDS}
        for chapter in chapters:
            node_id = chapter.get("nodeId")
            content_id = chapter.get("voiceContentId")
            if node_id not in node_by_id:
                raise ValueError(f"Chapter references unknown physical node: {locale}/{node_id}")
            chapter_counts[node_id] += 1
            if not isinstance(content_id, str):
                raise ValueError(f"Chapter has no narrative voice identity: {locale}/{chapter.get('id')}")
            rows.append({"id": content_id, "kind": "story", "nodeId": node_id,
                         "text": _text(chapter.get("text"), f"{locale}/{chapter.get('id')}")})
        if chapter_counts != {NODE_IDS[0]: 1, NODE_IDS[1]: 1, NODE_IDS[2]: 3}:
            raise ValueError(f"Expected chapter distribution 1+1+3 for {locale}: {chapter_counts}")
        first_chapters = {node_id: next(row for row in chapters if row.get("nodeId") == node_id) for node_id in NODE_IDS}
        for node_id in NODE_IDS:
            first = first_chapters[node_id]
            if (first.get("voiceContentId") != f"{node_id}-story"
                    or first.get("text") != node_by_id[node_id].get("story")):
                raise ValueError(f"First full chapter must match the core story: {locale}/{node_id}")

        for node in nodes:
            node_id = node["id"]
            rows.append({"id": f"{node_id}-caption", "kind": "caption", "nodeId": node_id,
                         "text": _text(node.get("caption"), f"{locale}/{node_id}/caption")})
        for transition in transitions:
            node_id, content_id = transition.get("nodeId"), transition.get("voiceContentId")
            if node_id not in node_by_id or not isinstance(content_id, str):
                raise ValueError(f"Transition must bind to a known node and voice identity: {locale}")
            rows.append({"id": content_id, "kind": "story", "nodeId": node_id,
                         "text": _text(transition.get("text"), f"{locale}/{transition.get('id')}")})
        closing = journey["closing"]
        if closing.get("nodeId") not in node_by_id or not isinstance(closing.get("voiceContentId"), str):
            raise ValueError(f"Closing must bind to a known node and voice identity: {locale}")
        rows.append({"id": closing["voiceContentId"], "kind": "story", "nodeId": closing["nodeId"],
                     "text": _text(closing.get("text"), f"{locale}/closing")})

        if len({answer.get("id") for answer in answers}) != 16 or any(answer.get("nodeId") not in node_by_id for answer in answers):
            raise ValueError(f"Answer IDs must be unique and reference known physical nodes: {locale}")
        if any(answer.get("reviewStatus") != "approved" for answer in answers):
            raise ValueError(f"Expected 16 internally reviewed answers for {locale}")
        for answer in answers:
            rows.append({"id": f"{answer['id']}-answer", "kind": "answer", "nodeId": answer["nodeId"],
                         "text": _text(answer.get("answer"), f"{locale}/{answer.get('id')}/answer")})
        ids = [row["id"] for row in rows]
        if len(rows) != 28 or len(set(ids)) != 28:
            raise ValueError(f"Expected exactly 28 unique voice identities for {locale}, got {len(rows)}")
        if any(not CONTENT_ID.fullmatch(content_id) for content_id in ids):
            raise ValueError(f"Voice identity contains unsafe path characters: {locale}")

        source_for = {"intro": (CORE[locale], core_bytes)}
        for chapter in chapters:
            source_for[chapter["voiceContentId"]] = (JOURNEY[locale], journey_bytes)
        for node in nodes:
            source_for[f"{node['id']}-caption"] = (CORE[locale], core_bytes)
        for narrative in [*transitions, closing]:
            source_for[narrative["voiceContentId"]] = (JOURNEY[locale], journey_bytes)
        for answer in answers:
            source_for[f"{answer['id']}-answer"] = (CORE[locale], core_bytes)
        result[locale] = [(COLLECTION, *source_for[row["id"]], row) for row in rows]
    safe_output_paths(result)
    return result


def dataset_revisions() -> dict[str, str]:
    specs = {locale: str(CORE[locale]) for locale in LOCALES}
    script = f"""
      import {{ createHash }} from 'node:crypto';
      import {{ readFileSync }} from 'node:fs';
      const {{ parseDatasetV2, validateDatasetV2Pair }} = await import({json.dumps((ROOT / 'mobile/src/data/sourceState.ts').as_uri())});
      const {{ canonicalDatasetJson }} = await import({json.dumps((ROOT / 'mobile/src/data/canonicalJson.ts').as_uri())});
      const specs = {json.dumps(specs)};
      const journeys = {json.dumps({locale: str(JOURNEY[locale]) for locale in LOCALES})};
      const parsed = {{}};
      for (const [locale, filename] of Object.entries(specs)) {{
        const value = parseDatasetV2(JSON.parse(readFileSync(filename, 'utf8')), {{ mode: 'demo', expectedLocale: locale }});
        if (!value || value.collectionId !== '{COLLECTION}') throw new Error(`Shared parser rejected ${{locale}}`);
        parsed[locale] = value;
        const journey = JSON.parse(readFileSync(journeys[locale], 'utf8'));
        const {{scriptRevision, datasetRevision, ...script}} = journey;
        const scriptHash = createHash('sha256').update(canonicalDatasetJson(script), 'utf8').digest('hex');
        if (scriptRevision !== value.scriptRevision || journey.scriptRevision !== scriptHash)
          throw new Error(`Companion script revision mismatch for ${{locale}}`);
      }}
      const pair = validateDatasetV2Pair(parsed.vi, parsed.en);
      if (!pair.ok) throw new Error(pair.reason);
      const result = {{}};
      for (const [locale, value] of Object.entries(parsed)) result[locale] =
        createHash('sha256').update(canonicalDatasetJson(value), 'utf8').digest('hex');
      console.log(JSON.stringify(result));
    """
    result = subprocess.run(["node", "--input-type=module", "-e", script], cwd=ROOT,
                           check=True, capture_output=True, text=True)
    revisions = json.loads(result.stdout)
    for locale in LOCALES:
        _, journey = _read_json(JOURNEY[locale])
        if journey.get("datasetRevision") != revisions[locale]:
            raise ValueError(f"Companion/core revision mismatch for {locale}")
    return revisions


def _verify_runtime(locale: str) -> None:
    if shutil.which("ffmpeg") is None or shutil.which("ffprobe") is None:
        raise RuntimeError("Pinned voice generation requires the already-installed local ffmpeg and ffprobe")
    if locale == "en":
        if importlib_version("kokoro") != EN_LIBRARY.split("==", 1)[1]:
            raise RuntimeError(f"Expected {EN_LIBRARY}")
        snapshot = TOOLS / ".cache" / "post8-hf" / "hub" / "models--hexgrad--Kokoro-82M" / "snapshots" / EN_REVISION
        required = (snapshot / "config.json", snapshot / "kokoro-v1_0.pth", snapshot / "voices" / f"{EN_PRESET}.pt")
    else:
        if importlib_version("vieneu") != VI_LIBRARY.split("==", 1)[1]:
            raise RuntimeError(f"Expected {VI_LIBRARY}")
        from tts_local import CODEC_DIR, MODEL_DIR
        required = (MODEL_DIR / "onnx_update" / "vieneu_prefill.onnx",
                    CODEC_DIR / "moss_audio_tokenizer_decode_full.onnx")
    missing = [str(path) for path in required if not path.is_file()]
    if missing:
        raise RuntimeError("Pinned offline voice cache is incomplete: " + ", ".join(missing))


def generate(locale: str) -> None:
    if locale not in LOCALES:
        raise ValueError(f"Unsupported locale: {locale}")
    rows_by_locale = inventory()
    revisions = dataset_revisions()
    safe_output_paths(rows_by_locale)
    _verify_runtime(locale)
    if OUTPUT.exists() or CATALOG.exists():
        raise FileExistsError("Refusing to overwrite installed Three Lenses voice assets or catalogue")
    locale_cache = CACHE / locale
    if locale_cache.exists():
        raise FileExistsError(f"Refusing to overwrite generated {locale} cache: {locale_cache}")
    CACHE.mkdir(parents=True, exist_ok=True)
    os.environ["HF_HUB_OFFLINE"] = "1"
    os.environ["TRANSFORMERS_OFFLINE"] = "1"
    os.environ["HF_HOME"] = str((TOOLS / ".cache" / "huggingface").resolve())
    locale_rows = rows_by_locale[locale]
    print(f"Rendering {locale}: 0/28; collection={COLLECTION}; revision={revisions[locale]}", flush=True)
    def progress(completed: int, total: int, entry: dict[str, Any]) -> None:
        print(f"Progress {locale}: {completed}/{total} {entry['id']}", flush=True)

    with tempfile.TemporaryDirectory(prefix=f"three-lenses-{locale}-", dir=CACHE) as temporary:
        stage = Path(temporary)
        entries, _ = (_generate_english(stage, locale_rows, [], progress) if locale == "en"
                      else _generate_vietnamese(stage, locale_rows, [], progress))
        if len(entries) != 28:
            raise ValueError(f"Expected 28 rendered tracks for {locale}, got {len(entries)}")
        for entry in entries:
            entry.update({"datasetRevision": revisions[locale], "sourceOnly": True})
        result = {"schemaVersion": 1, "collectionId": COLLECTION, "locale": locale,
                  "datasetRevision": revisions[locale], "sourceStatus": "source-only",
                  "status": "provisional", "humanApproved": False, "selectedForShipping": False,
                  "tracks": entries}
        (stage / "results.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        stage.rename(locale_cache)
    print(f"Generated {len(entries)}/28 {locale} tracks into {locale_cache}", flush=True)


def _strict_decode(path: Path) -> None:
    subprocess.run([shutil.which("ffmpeg") or "ffmpeg", "-nostdin", "-v", "error", "-xerror",
                    "-i", str(path), "-f", "null", "-"], check=True, capture_output=True)


def _verified_entries(locale: str, expected: list[tuple[str, Path, bytes, dict[str, str]]],
                      revision: str) -> list[dict[str, Any]]:
    result = json.loads((CACHE / locale / "results.json").read_text(encoding="utf-8"))
    if (result.get("collectionId") != COLLECTION or result.get("locale") != locale
            or result.get("datasetRevision") != revision or result.get("sourceStatus") != "source-only"
            or result.get("humanApproved") is not False or result.get("selectedForShipping") is not False):
        raise ValueError(f"Generated manifest has invalid scope or approval metadata: {locale}")
    by_id = {row[3]["id"]: row for row in expected}
    entries = result.get("tracks", [])
    if len(entries) != 28:
        raise ValueError(f"Expected 28 cached manifest tracks for {locale}, got {len(entries)}")
    from post8_probe import to_spoken_text

    for entry in entries:
        source_row = by_id.pop(entry.get("id"), None)
        if source_row is None:
            raise ValueError(f"Unexpected or duplicate manifest identity: {locale}/{entry.get('id')}")
        collection, source, source_bytes, row = source_row
        spoken = to_spoken_text(row["text"]) if locale == "en" else row["text"]
        if (entry.get("collectionId") != collection or entry.get("datasetRevision") != revision
                or entry.get("locale") != locale or entry.get("kind") != row["kind"]
                or entry.get("nodeId") != row.get("nodeId") or entry.get("source") != source.relative_to(ROOT).as_posix()
                or entry.get("sourceDataSha256") != sha256(source_bytes)
                or entry.get("sourceTextSha256") != sha256(row["text"].encode("utf-8"))
                or entry.get("textHash") != sha256(row["text"].encode("utf-8"))
                or entry.get("spokenText") != spoken
                or entry.get("spokenTextSha256") != sha256(spoken.encode("utf-8"))
                or entry.get("humanApproved") is not False or entry.get("sourceOnly") is not True):
            raise ValueError(f"Generated source identity/hash mismatch: {locale}/{row['id']}")
        cached = CACHE / locale / COLLECTION / locale / f"{row['id']}.mp3"
        if not cached.is_file() or file_hash(cached) != entry.get("audioSha256"):
            raise ValueError(f"Generated MP3 hash mismatch: {locale}/{row['id']}")
        _strict_decode(cached)
        entry["fullDecode"] = True
        actual_format = probe_mp3(cached)
        actual_metrics = encoded_metrics(cached, actual_format["sampleRateHz"])
        if (entry.get("format") != actual_format or entry.get("durationSeconds") != actual_format["durationSeconds"]
                or any(entry.get(key) != value for key, value in actual_metrics.items())):
            raise ValueError(f"Generated MP3 decode/format/level audit failed: {locale}/{row['id']}")
        entry["path"] = f"mobile/assets/voice/three-lenses/{locale}/{row['id']}.mp3"
    if by_id:
        raise ValueError(f"Missing cached identities for {locale}: {sorted(by_id)}")
    return entries


def catalog_source(catalogues: dict[str, dict[str, Any]]) -> str:
    lines = [
        "/* eslint-disable @typescript-eslint/no-require-imports -- Metro needs statically analyzable asset requires. */",
        "import type { Locale } from '../data/locale';",
        "import type { VoiceTrack } from './catalog';",
        "",
        f"export const THREE_LENSES_VOICE_COLLECTION = {json.dumps(COLLECTION)};",
        "export const threeLensesVoiceCatalogues: Record<Locale, { datasetRevision: string; tracks: Record<string, VoiceTrack> }> = {",
    ]
    for locale in LOCALES:
        catalogue = catalogues[locale]
        lines.extend((f"  {locale}: {{", f"    datasetRevision: {json.dumps(catalogue['datasetRevision'])},", "    tracks: {"))
        for entry in catalogue["tracks"]:
            node = f", nodeId: {json.dumps(entry['nodeId'])}" if entry.get("nodeId") else ""
            source = f"../../assets/voice/three-lenses/{locale}/{entry['id']}.mp3"
            lines.append(f"      {json.dumps(entry['id'])}: {{ id: {json.dumps(entry['id'])}, kind: {json.dumps(entry['kind'])}{node}, "
                         f"source: require({json.dumps(source)}), textHash: {json.dumps(entry['textHash'])}, durationSeconds: {entry['durationSeconds']} }},")
        lines.extend(("    },", "  },"))
    lines.extend(("};", ""))
    return "\n".join(lines)


def install() -> None:
    rows = inventory()
    revisions = dataset_revisions()
    safe_output_paths(rows)
    if OUTPUT.exists() or CATALOG.exists():
        raise FileExistsError("Refusing to overwrite installed Three Lenses voice assets or catalogue")
    catalogues: dict[str, dict[str, Any]] = {}
    tracks_by_locale: dict[str, list[dict[str, Any]]] = {}
    for locale in LOCALES:
        entries = _verified_entries(locale, rows[locale], revisions[locale])
        tracks_by_locale[locale] = entries
        catalogues[locale] = {"datasetRevision": revisions[locale], "tracks": entries}
    total = sum(map(len, tracks_by_locale.values()))
    if {locale: len(tracks_by_locale[locale]) for locale in LOCALES} != {"en": 28, "vi": 28} or total != 56:
        raise ValueError(f"Expected exactly 56 tracks (28 per locale), got {total}")
    manifest = {"schemaVersion": 1, "scope": COLLECTION, "sourceStatus": "source-only",
                "status": "provisional", "humanApproved": False, "selectedForShipping": False,
                "counts": {"en": 28, "vi": 28, "total": 56}, "catalogues": catalogues}
    catalog_text = catalog_source(catalogues)
    with tempfile.TemporaryDirectory(prefix="three-lenses-install-", dir=CACHE) as temporary:
        stage = Path(temporary) / "three-lenses"
        for locale in LOCALES:
            for entry in tracks_by_locale[locale]:
                source = CACHE / locale / COLLECTION / locale / f"{entry['id']}.mp3"
                target = asset_path(stage, locale, entry["id"])
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(source, target)
        (stage / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        os.replace(stage, OUTPUT)
        try:
            with CATALOG.open("x", encoding="utf-8", newline="\n") as handle:
                handle.write(catalog_text)
        except Exception:
            shutil.rmtree(OUTPUT)
            raise
    print(f"Installed {total} provisional MP3s: EN 28, VI 28; humanApproved=false")


def audit() -> None:
    rows = inventory()
    revisions = dataset_revisions()
    if not OUTPUT.is_dir() or not CATALOG.is_file():
        raise FileNotFoundError("Three Lenses assets and static voice catalogue are not installed")
    manifest = json.loads((OUTPUT / "manifest.json").read_text(encoding="utf-8"))
    if (manifest.get("scope") != COLLECTION or manifest.get("sourceStatus") != "source-only"
            or manifest.get("humanApproved") is not False or manifest.get("selectedForShipping") is not False):
        raise ValueError("Installed manifest scope or approval status is invalid")
    catalogues = manifest.get("catalogues", {})
    for locale in LOCALES:
        catalogue = catalogues[locale]
        entries = _verified_entries_from_installed(locale, rows[locale], revisions[locale], catalogue)
        if len(entries) != 28:
            raise ValueError(f"Expected 28 installed tracks for {locale}")
    if manifest.get("counts") != {"en": 28, "vi": 28, "total": 56}:
        raise ValueError("Installed manifest counts are invalid")
    if CATALOG.read_text(encoding="utf-8") != catalog_source(catalogues):
        raise ValueError("Installed static catalogue differs from manifest")
    print("Audio audit passed: EN 28/28, VI 28/28, strict full MP3 decode and metadata/hash checks")


def _verified_entries_from_installed(locale: str, expected: list[tuple[str, Path, bytes, dict[str, str]]],
                                     revision: str, catalogue: dict[str, Any]) -> list[dict[str, Any]]:
    # Share all identity and audio checks with the cache installer by validating a temporary manifest view.
    if catalogue.get("datasetRevision") != revision or len(catalogue.get("tracks", [])) != 28:
        raise ValueError(f"Installed catalogue revision/count mismatch: {locale}")
    expected_by_id = {row[3]["id"]: row for row in expected}
    from post8_probe import to_spoken_text

    for entry in catalogue["tracks"]:
        source_row = expected_by_id.pop(entry.get("id"), None)
        if source_row is None:
            raise ValueError(f"Unexpected installed identity: {locale}/{entry.get('id')}")
        collection, source, source_bytes, row = source_row
        spoken = to_spoken_text(row["text"]) if locale == "en" else row["text"]
        if (entry.get("collectionId") != collection or entry.get("datasetRevision") != revision
                or entry.get("locale") != locale or entry.get("kind") != row["kind"]
                or entry.get("nodeId") != row.get("nodeId") or entry.get("source") != source.relative_to(ROOT).as_posix()
                or entry.get("sourceDataSha256") != sha256(source_bytes)
                or entry.get("sourceTextSha256") != sha256(row["text"].encode("utf-8"))
                or entry.get("textHash") != sha256(row["text"].encode("utf-8"))
                or entry.get("spokenText") != spoken
                or entry.get("spokenTextSha256") != sha256(spoken.encode("utf-8"))
                or entry.get("humanApproved") is not False or entry.get("sourceOnly") is not True):
            raise ValueError(f"Installed source identity/hash mismatch: {locale}/{row['id']}")
        path = asset_path(OUTPUT, locale, row["id"])
        if not path.is_file() or file_hash(path) != entry.get("audioSha256"):
            raise ValueError(f"Installed MP3 hash mismatch: {locale}/{row['id']}")
        _strict_decode(path)
        actual_format = probe_mp3(path)
        actual_metrics = encoded_metrics(path, actual_format["sampleRateHz"])
        if (entry.get("path") != path.relative_to(ROOT).as_posix()
                or entry.get("format") != actual_format or entry.get("durationSeconds") != actual_format["durationSeconds"]
                or entry.get("fullDecode") is not True
                or any(entry.get(key) != value for key, value in actual_metrics.items())):
            raise ValueError(f"Installed MP3 decode/format/level audit failed: {locale}/{row['id']}")
    if expected_by_id:
        raise ValueError(f"Missing installed identities for {locale}: {sorted(expected_by_id)}")
    return catalogue["tracks"]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("validate", "en", "vi", "install", "audit"))
    action = parser.parse_args().action
    if action == "validate":
        rows = inventory()
        revisions = dataset_revisions()
        print(json.dumps({locale: {"tracks": len(rows[locale]), "revision": revisions[locale],
                                   "identities": [row[3]["id"] for row in rows[locale]]}
                          for locale in LOCALES}, ensure_ascii=False, indent=2))
    elif action in LOCALES:
        generate(action)
    elif action == "install":
        install()
    else:
        audit()


if __name__ == "__main__":
    main()
