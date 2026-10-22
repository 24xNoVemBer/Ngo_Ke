"""Audit or generate resumable four-alley intro narration with ElevenLabs."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
COLLECTIONS = ("ngo-trung-yen", "ngo-tam-thuong", "ngo-cam-chi", "ngo-phat-loc")
ASSET_ROOT = ROOT / "mobile" / "assets" / "voice" / "alleys-intro"
CATALOG = ROOT / "mobile" / "src" / "voice" / "alleysCatalog.ts"
FORMAT = "mp3_44100_128"
RESERVE = 10_000
BUDGET = 80_000
VOICES = {
    "vi": {
        "voiceId": "6adFm46eyy74snVn6YrT",
        "voiceName": "Nhật Phong - Narrative & Compelling",
        "model": "eleven_v3",
        "languageCode": "vi",
    },
    "en": {
        "voiceId": "OZ0L6eISlOejga3XjDFt",
        "voiceName": "Talia",
        "model": "eleven_v4",
        "languageCode": "en",
        "voiceSettings": {"stability": 0.5, "similarity_boost": 0.75},
    },
}
SLOT_RE = re.compile(
    r"collectionId:\s*'([^']+)',\s*contentId:\s*'intro',\s*"
    r"datasetRevision:\s*'([0-9a-f]{64})',\s*textHash:\s*'([0-9a-f]{64})'",
)
NODE_HASH_SCRIPT = """
import { createHash } from 'node:crypto';
import { canonicalDatasetJson } from './mobile/src/data/canonicalJson.ts';
let input = '';
for await (const chunk of process.stdin) input += chunk;
const rows = JSON.parse(input);
console.log(JSON.stringify(rows.map(({ data, text }) => ({
  datasetRevision: createHash('sha256').update(canonicalDatasetJson(data)).digest('hex'),
  textHash: createHash('sha256').update(text, 'utf8').digest('hex'),
}))));
"""


def sha256(value: bytes | str) -> str:
    return hashlib.sha256(value if isinstance(value, bytes) else value.encode("utf-8", "strict")).hexdigest()


def atomic_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    partial = path.with_name(path.name + ".partial")
    partial.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    partial.replace(path)


def canonical_hashes(documents: list[dict], texts: list[str]) -> list[dict[str, str]]:
    payload = json.dumps(
        [{"data": data, "text": text} for data, text in zip(documents, texts, strict=True)],
        ensure_ascii=False,
        separators=(",", ":"),
    )
    result = subprocess.run(
        ["node", "--input-type=module", "-e", NODE_HASH_SCRIPT],
        cwd=ROOT,
        input=payload,
        text=True,
        encoding="utf-8",
        capture_output=True,
        check=True,
    )
    return json.loads(result.stdout)


def read_reservations() -> dict[str, dict[str, str]]:
    matches = SLOT_RE.findall(CATALOG.read_text(encoding="utf-8"))
    if [collection for collection, _, _ in matches] != list(COLLECTIONS):
        raise RuntimeError("VI intro reservations do not match the four approved collections")
    reservations = {
        collection: {"datasetRevision": revision, "textHash": text_hash}
        for collection, revision, text_hash in matches
    }
    return reservations


def read_rows(locale: str) -> list[dict]:
    documents = []
    texts = []
    raw_sources = []
    for collection in COLLECTIONS:
        source = ROOT / "data" / "localized" / f"{collection}.{locale}.json"
        raw = source.read_bytes()
        data = json.loads(raw.decode("utf-8", "strict"))
        text = data.get("intro", {}).get("text")
        if not isinstance(text, str) or not text.strip():
            raise RuntimeError(f"Missing {locale} intro.text for {collection}")
        text.encode("utf-8", "strict")
        documents.append(data)
        texts.append(text)
        raw_sources.append((source, raw))

    hashes = canonical_hashes(documents, texts)
    rows = []
    for collection, text, (source, raw), values in zip(COLLECTIONS, texts, raw_sources, hashes, strict=True):
        rows.append({
            "collectionId": collection,
            "contentId": "intro",
            "text": text,
            "characters": len(text),
            "utf8Bytes": len(text.encode("utf-8", "strict")),
            "source": source.relative_to(ROOT).as_posix(),
            "sourceDataSha256": sha256(raw),
            **values,
        })

    if locale == "vi":
        reservations = read_reservations()
        for row in rows:
            expected = reservations[row["collectionId"]]
            if row["datasetRevision"] != expected["datasetRevision"] or row["textHash"] != expected["textHash"]:
                raise RuntimeError(f"VI source or reservation changed for {row['collectionId']}; refusing generation")
    return rows


def request_body(row: dict, locale: str) -> bytes:
    config = VOICES[locale]
    payload = {"text": row["text"], "model_id": config["model"], "language_code": config["languageCode"]}
    if "voiceSettings" in config:
        payload["voice_settings"] = config["voiceSettings"]
    body = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8", "strict")
    if json.loads(body.decode("utf-8", "strict"))["text"] != row["text"]:
        raise RuntimeError(f"Encoded text changed for {row['collectionId']}")
    return body


def get_api_key() -> str:
    key = os.environ.get("ELEVENLABS_API_KEY")
    if key:
        return key
    path = ROOT / ".env.local"
    if path.is_file():
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.startswith("ELEVENLABS_API_KEY="):
                key = line.split("=", 1)[1].strip().strip("\"'")
                if key:
                    return key
    raise RuntimeError("ELEVENLABS_API_KEY unavailable for API use")


def api_json(url: str, key: str) -> object:
    request = urllib.request.Request(url, headers={"xi-api-key": key, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode("utf-8", "strict"))
    except urllib.error.HTTPError as error:
        try:
            body = json.loads(error.read().decode("utf-8", "strict"))
            detail = body.get("detail", {})
            detail = detail.get("message") or detail.get("status") if isinstance(detail, dict) else detail
        except (UnicodeDecodeError, json.JSONDecodeError):
            detail = None
        if not isinstance(detail, str):
            detail = "request rejected"
        if key:
            detail = detail.replace(key, "[redacted]")
        raise RuntimeError(f"ElevenLabs HTTP {error.code}: {detail}") from None


def api_error_status(error: Exception) -> int | None:
    return error.code if isinstance(error, urllib.error.HTTPError) else None


def validate_mp3(path: Path) -> dict:
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries",
         "stream=codec_name,sample_rate,channels", "-show_entries", "format=duration",
         "-of", "json", str(path)],
        capture_output=True,
        text=True,
        encoding="utf-8",
        check=True,
    )
    metadata = json.loads(probe.stdout)
    streams = metadata.get("streams", [])
    if not streams or streams[0].get("codec_name") != "mp3" or int(streams[0].get("sample_rate", 0)) != 44_100:
        raise RuntimeError(f"{path.name}: expected MP3 at 44.1 kHz")
    duration = float(metadata.get("format", {}).get("duration", 0))
    if duration <= 0:
        raise RuntimeError(f"{path.name}: invalid MP3 duration")
    subprocess.run(
        ["ffmpeg", "-nostdin", "-v", "error", "-i", str(path), "-f", "null", "-"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        check=True,
    )
    return {"durationSeconds": round(duration, 3), "sampleRate": 44_100, "channels": int(streams[0]["channels"])}


def progress_paths(locale: str) -> tuple[Path, Path, Path]:
    return (
        ASSET_ROOT / locale,
        ASSET_ROOT / f"manifest.{locale}.json",
        ASSET_ROOT / f"progress.{locale}.json",
    )


def load_progress(path: Path, rows: list[dict], locale: str) -> dict:
    if path.exists():
        progress = json.loads(path.read_text(encoding="utf-8"))
        if progress.get("locale") != locale:
            raise RuntimeError("Progress locale mismatch")
    else:
        progress = {"schemaVersion": 1, "locale": locale, "tracks": {}}
    for row in rows:
        prior = progress["tracks"].get(row["collectionId"], {})
        if prior.get("textHash") and prior["textHash"] != row["textHash"]:
            raise RuntimeError(f"Progress textHash changed for {row['collectionId']}; refusing to overwrite")
        status = prior.get("status")
        if status in {"requesting", "outcome_unknown", "api_error", "invalid_audio"}:
            raise RuntimeError(
                f"{row['collectionId']} has {status} paid-request state; reconcile API outcome before any retry"
            )
    return progress


def generation(locale: str, rows: list[dict]) -> dict:
    config = VOICES[locale]
    out, manifest_path, progress_path = progress_paths(locale)
    progress = load_progress(progress_path, rows, locale)
    if progress.get("voiceId") not in (None, config["voiceId"]) or progress.get("model") not in (None, config["model"]):
        raise RuntimeError("Progress voice/model differs from the requested configuration; refusing to switch")
    for row in rows:
        target = out / f"{row['collectionId']}-intro.mp3"
        prior = progress["tracks"].get(row["collectionId"], {})
        partial = target.with_name(target.name + ".partial")
        if target.exists() and prior.get("status") != "complete":
            raise RuntimeError(f"Untracked audio exists at {target.relative_to(ROOT)}; refusing to overwrite")
        if partial.exists() and prior.get("status") != "response_received":
            raise RuntimeError(f"Untracked partial audio exists at {partial.relative_to(ROOT)}; refusing to overwrite")
        if prior.get("status") == "complete":
            if not target.is_file() or sha256(target.read_bytes()) != prior.get("audioSha256"):
                raise RuntimeError(f"Completed audio changed for {row['collectionId']}; refusing to regenerate")
            validate_mp3(target)

    key = get_api_key()
    before = api_json("https://api.elevenlabs.io/v1/user/subscription", key)
    estimate = sum(row["characters"] for row in rows if progress["tracks"].get(row["collectionId"], {}).get("status") != "complete")
    remaining = int(before["character_limit"]) - int(before["character_count"])
    if remaining - estimate < RESERVE or estimate > BUDGET or before.get("can_extend_character_limit") is not False:
        raise RuntimeError("ElevenLabs credit safety check failed (reserve, budget, or extension guard)")
    voice = api_json(f"https://api.elevenlabs.io/v1/voices/{config['voiceId']}", key)
    models = api_json("https://api.elevenlabs.io/v1/models", key)
    if voice.get("voice_id") != config["voiceId"] or not any(
        model.get("model_id") == config["model"] and model.get("can_do_text_to_speech") for model in models
    ):
        raise RuntimeError(f"Requested voice/model unavailable: {config['voiceId']} / {config['model']}; no fallback attempted")

    progress.update({
        "voiceId": config["voiceId"],
        "model": config["model"],
        "outputFormat": FORMAT,
        "reserve": RESERVE,
        "budget": BUDGET,
        "canExtendCharacterLimit": False,
        "lastSubscriptionCharacterCountBefore": int(before["character_count"]),
        "subscriptionCharacterLimit": int(before["character_limit"]),
        "charactersPosted": int(progress.get("charactersPosted", 0)),
        "charactersAccepted": int(progress.get("charactersAccepted", 0)),
        "apiRequests": int(progress.get("apiRequests", 0)),
    })
    progress.setdefault("runStartedAt", datetime.now(timezone.utc).isoformat())
    progress.setdefault("subscriptionCharacterCountBefore", int(before["character_count"]))
    out.mkdir(parents=True, exist_ok=True)
    entries = []
    requests_this_run = 0
    characters_posted_this_run = 0
    for row in rows:
        collection = row["collectionId"]
        target = out / f"{collection}-intro.mp3"
        prior = progress["tracks"].get(collection, {})
        if prior.get("status") == "complete":
            audio = target.read_bytes()
            audio_meta = validate_mp3(target)
        else:
            partial = target.with_name(target.name + ".partial")
            if prior.get("status") == "response_received":
                if not partial.is_file():
                    raise RuntimeError(f"{collection}: API response was recorded but its partial audio is missing; no retry attempted")
                audio = partial.read_bytes()
                if sha256(audio) != prior.get("responseSha256"):
                    raise RuntimeError(f"{collection}: saved API response changed; no retry attempted")
            else:
                body = request_body(row, locale)
                progress["tracks"][collection] = {
                    **{key: row[key] for key in ("contentId", "datasetRevision", "textHash", "characters", "source", "sourceDataSha256")},
                    "status": "requesting",
                    "requestStartedAt": datetime.now(timezone.utc).isoformat(),
                    "httpStatus": None,
                }
                progress["charactersPosted"] += row["characters"]
                progress["apiRequests"] += 1
                requests_this_run += 1
                characters_posted_this_run += row["characters"]
                atomic_json(progress_path, progress)
                request = urllib.request.Request(
                    f"https://api.elevenlabs.io/v1/text-to-speech/{config['voiceId']}?output_format={FORMAT}",
                    data=body,
                    method="POST",
                    headers={"xi-api-key": key, "Accept": "audio/mpeg", "Content-Type": "application/json; charset=utf-8"},
                )
                try:
                    with urllib.request.urlopen(request, timeout=120) as response:
                        audio = response.read()
                        http_status = response.status
                except (urllib.error.URLError, TimeoutError, OSError) as error:
                    progress["tracks"][collection].update({
                        "status": "outcome_unknown",
                        "errorType": type(error).__name__,
                        "httpStatus": api_error_status(error),
                    })
                    atomic_json(progress_path, progress)
                    status = api_error_status(error)
                    detail = f"HTTP {status}" if status is not None else "transport outcome unknown"
                    raise RuntimeError(f"{collection}: {detail}; no retry attempted and progress blocks resend") from None
                progress["tracks"][collection].update({
                    "status": "response_received",
                    "httpStatus": http_status,
                    "responseBytes": len(audio),
                    "responseSha256": sha256(audio),
                })
                atomic_json(progress_path, progress)
                partial.write_bytes(audio)
            try:
                audio_meta = validate_mp3(partial)
            except (OSError, subprocess.SubprocessError, RuntimeError, ValueError, KeyError) as error:
                progress["tracks"][collection].update({
                    "status": "invalid_audio",
                    "validationError": type(error).__name__,
                })
                atomic_json(progress_path, progress)
                raise RuntimeError(f"{collection}: audio response failed MP3 validation; no retry attempted") from None
            partial.replace(target)
            progress["tracks"][collection].update({
                "status": "complete",
                "audioSha256": sha256(audio),
                "bytes": len(audio),
                **audio_meta,
            })
            progress["charactersAccepted"] += row["characters"]
            atomic_json(progress_path, progress)

        entries.append({
            **{key: row[key] for key in ("collectionId", "contentId", "source", "sourceDataSha256", "datasetRevision", "textHash", "characters", "utf8Bytes")},
            "path": target.relative_to(ROOT).as_posix(),
            "voiceId": config["voiceId"],
            "voiceName": config["voiceName"],
            "model": config["model"],
            "languageCode": config["languageCode"],
            "outputFormat": FORMAT,
            "audioSha256": sha256(audio),
            "bytes": len(audio),
            **audio_meta,
            "humanApproved": False,
            "listened": False,
            "selectedForShipping": False,
        })

    after = api_json("https://api.elevenlabs.io/v1/user/subscription", key)
    manifest = {
        "schemaVersion": 1,
        "scope": "four-alley intro narration",
        "locale": locale,
        "voiceId": config["voiceId"],
        "voiceName": config["voiceName"],
        "model": config["model"],
        "languageCode": config["languageCode"],
        "outputFormat": FORMAT,
        "sourceOnly": True,
        "humanApproved": False,
        "listened": False,
        "selectedForShipping": False,
        "charactersPosted": progress["charactersPosted"],
        "charactersAccepted": progress["charactersAccepted"],
        "apiRequests": progress["apiRequests"],
        "apiRequestsThisRun": requests_this_run,
        "charactersPostedThisRun": characters_posted_this_run,
        "subscriptionCharacterCountBefore": progress["subscriptionCharacterCountBefore"],
        "subscriptionCharacterCountAfter": int(after["character_count"]),
        "subscriptionCharacterCountDelta": int(after["character_count"]) - int(progress["subscriptionCharacterCountBefore"]),
        "entries": entries,
    }
    atomic_json(manifest_path, manifest)
    progress["status"] = "complete"
    progress["subscriptionCharacterCountAfter"] = int(after["character_count"])
    atomic_json(progress_path, progress)
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--locale", choices=tuple(VOICES), default="vi")
    parser.add_argument("--generate", action="store_true", help="Use ElevenLabs once for each missing track")
    args = parser.parse_args()
    rows = read_rows(args.locale)
    summary = {
        "locale": args.locale,
        "tracks": len(rows),
        "characters": sum(row["characters"] for row in rows),
        "sources": [{key: row[key] for key in ("collectionId", "characters", "datasetRevision", "textHash")} for row in rows],
        "mode": "generate" if args.generate else "offline-audit",
        "apiRequests": 0,
    }
    for row in rows:
        request_body(row, args.locale)
    if args.generate:
        manifest = generation(args.locale, rows)
        summary.update({
            "apiRequests": manifest["apiRequestsThisRun"],
            "totalApiRequests": manifest["apiRequests"],
            "charactersPostedThisRun": manifest["charactersPostedThisRun"],
            "charactersPosted": manifest["charactersPosted"],
            "charactersAccepted": manifest["charactersAccepted"],
            "subscriptionCharacterCountDelta": manifest["subscriptionCharacterCountDelta"],
            "audioBytes": sum(entry["bytes"] for entry in manifest["entries"]),
            "allHumanApproved": manifest["humanApproved"],
            "allListened": manifest["listened"],
        })
    print(json.dumps(summary, ensure_ascii=True))


if __name__ == "__main__":
    main()
