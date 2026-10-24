"""Audit and safely generate the 34 pinned VI/EN node-story voice tracks."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
COLLECTIONS = ("ngo-trung-yen", "ngo-gach", "ngo-tam-thuong", "ngo-cam-chi", "ngo-phat-loc")
HANDOFF = ROOT / "docs" / "handoffs" / "2026-10-23-node-story-voice-handoff.json"
ASSET_ROOT = ROOT / "mobile" / "assets" / "voice" / "node-stories"
PROGRESS = ASSET_ROOT / "progress.json"
MANIFEST = ASSET_ROOT / "manifest.json"
CATALOGUE = ROOT / "mobile" / "src" / "voice" / "nodeStoriesCatalog.ts"
FORMAT = "mp3_44100_128"
RESERVE = 4_000
BUDGET = 80_000
VOICES = {
    "vi": {
        "voiceId": "6adFm46eyy74snVn6YrT",
        "voiceName": "Nhật Phong",
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
NODE_HASH_SCRIPT = """
import { createHash } from 'node:crypto';
import { canonicalDatasetJson } from './mobile/src/data/canonicalJson.ts';
let input = '';
for await (const chunk of process.stdin) input += chunk;
const rows = JSON.parse(input);
console.log(JSON.stringify(rows.map(({ data }) =>
  createHash('sha256').update(canonicalDatasetJson(data)).digest('hex'))));
"""
BLOCKING_STATUSES = {"requesting", "receiving_response", "outcome_unknown", "api_error", "invalid_audio"}
CATALOGUE_MARKER = "// Generated from node-stories/manifest.json; do not edit by hand."


def sha256(value: bytes | str) -> str:
    return hashlib.sha256(value if isinstance(value, bytes) else value.encode("utf-8", "strict")).hexdigest()


def source_data_hashes(raw: bytes) -> dict[str, str]:
    """Keep repository content identity stable across checkout EOLs and retain raw provenance."""
    normalized = raw.replace(b"\r\n", b"\n")
    if b"\r" in normalized:
        raise ValueError("Localized source contains a bare carriage return")
    return {
        "sourceDataSha256": sha256(normalized),
        "sourceDataRawSha256": sha256(raw),
    }


def atomic_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    partial = path.with_name(path.name + ".partial")
    if partial.exists():
        raise RuntimeError(f"Unresolved partial state at {partial.relative_to(ROOT)}")
    with partial.open("x", encoding="utf-8", newline="\n") as stream:
        stream.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
        stream.flush()
        os.fsync(stream.fileno())
    partial.replace(path)


def atomic_bytes(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("xb") as stream:
        stream.write(data)
        stream.flush()
        os.fsync(stream.fileno())


def canonical_revisions(documents: list[dict]) -> list[str]:
    payload = json.dumps([{"data": data} for data in documents], ensure_ascii=False, separators=(",", ":"))
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


def read_rows() -> list[dict]:
    handoff = json.loads(HANDOFF.read_text(encoding="utf-8"))
    records = handoff.get("records")
    if not isinstance(records, list) or len(records) != 34:
        raise RuntimeError("Node-story handoff must contain exactly 34 records")
    if {row.get("locale") for row in records} != set(VOICES):
        raise RuntimeError("Node-story handoff locale inventory changed")

    documents: dict[tuple[str, str], tuple[Path, bytes, dict]] = {}
    for row in records:
        collection, locale = row.get("collectionId"), row.get("locale")
        if collection not in COLLECTIONS or locale not in VOICES:
            raise RuntimeError("Node-story handoff contains an unsupported collection or locale")
        key = (collection, locale)
        if key not in documents:
            source = ROOT / "data" / "localized" / f"{collection}.{locale}.json"
            raw = source.read_bytes()
            documents[key] = (source, raw, json.loads(raw.decode("utf-8", "strict")))

    keys = list(documents)
    revisions = canonical_revisions([documents[key][2] for key in keys])
    revision_by_key = dict(zip(keys, revisions, strict=True))
    result = []
    seen = set()
    for record in records:
        collection = record["collectionId"]
        locale = record["locale"]
        node_id = record.get("nodeId")
        content_id = record.get("contentId")
        key = (locale, content_id)
        if not isinstance(node_id, str) or content_id != f"{node_id}-story" or key in seen:
            raise RuntimeError("Node-story handoff IDs are malformed or duplicated")
        seen.add(key)
        source, raw, data = documents[(collection, locale)]
        node = next((item for item in data.get("nodes", []) if item.get("id") == node_id), None)
        text = node.get("story") if isinstance(node, dict) else None
        if not isinstance(text, str) or not text.strip():
            raise RuntimeError(f"Missing source story for {collection}/{locale}/{node_id}")
        revision = revision_by_key[(collection, locale)]
        text_hash = sha256(text)
        if record.get("datasetRevision") != revision or record.get("textHash") != text_hash:
            raise RuntimeError(f"Source hash mismatch for {collection}/{locale}/{node_id}; no paid request sent")
        result.append({
            "collectionId": collection,
            "nodeId": node_id,
            "contentId": content_id,
            "locale": locale,
            "text": text,
            "characters": len(text),
            "utf8Bytes": len(text.encode("utf-8", "strict")),
            "textHash": text_hash,
            "datasetRevision": revision,
            "source": source.relative_to(ROOT).as_posix(),
            **source_data_hashes(raw),
            "voiceId": VOICES[locale]["voiceId"],
        })
    counts = {locale: sum(row["locale"] == locale for row in result) for locale in VOICES}
    if counts != {"vi": 17, "en": 17} or len(seen) != 34:
        raise RuntimeError("Expected exactly 17 unique story tracks for each locale")
    return result


def track_key(row: dict) -> str:
    return f"{row['locale']}:{row['contentId']}"


def audio_path(row: dict) -> Path:
    return ASSET_ROOT / row["locale"] / f"{row['contentId']}.mp3"


def partial_audio_path(row: dict) -> Path:
    return audio_path(row).with_name(f"{row['contentId']}.mp3.partial")


def load_progress(rows: list[dict]) -> dict:
    if PROGRESS.with_name(PROGRESS.name + ".partial").exists():
        raise RuntimeError("Unresolved progress partial; no paid request attempted")
    if PROGRESS.exists():
        progress = json.loads(PROGRESS.read_text(encoding="utf-8"))
        if progress.get("scope") != "node-story voice P3" or progress.get("schemaVersion") != 1:
            raise RuntimeError("Existing progress file belongs to a different scope")
    else:
        progress = {
            "schemaVersion": 1,
            "scope": "node-story voice P3",
            "status": "prepared",
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "budgetCharacters": BUDGET,
            "reserveCharacters": RESERVE,
            "canExtendCharacterLimit": False,
            "outputFormat": FORMAT,
            "charactersPosted": 0,
            "charactersAccepted": 0,
            "apiRequests": 0,
            "tracks": {},
        }
    expected_keys = {track_key(row) for row in rows}
    if set(progress.get("tracks", {})) - expected_keys:
        raise RuntimeError("Progress contains records outside this P3 scope")
    for row in rows:
        key = track_key(row)
        expected = {name: row[name] for name in ("collectionId", "nodeId", "contentId", "locale", "textHash", "datasetRevision", "sourceDataSha256", "characters")}
        state = progress.setdefault("tracks", {}).get(key)
        if state is None:
            progress["tracks"][key] = {**expected, "status": "pending"}
            state = progress["tracks"][key]
        if any(state.get(name) != value for name, value in expected.items()):
            raise RuntimeError(f"Progress source changed for {key}; refusing to overwrite")
        status = state.get("status")
        if status in BLOCKING_STATUSES:
            raise RuntimeError(f"{key} has {status} paid-request state; reconcile before any retry")
        if status not in {"pending", "response_received", "complete"}:
            raise RuntimeError(f"Unrecognized request state for {key}; refusing to generate")
        target, partial = audio_path(row), partial_audio_path(row)
        if status == "complete":
            if not target.is_file() or sha256(target.read_bytes()) != state.get("audioSha256"):
                raise RuntimeError(f"Completed audio changed or is missing for {key}; no retry attempted")
            if partial.exists():
                raise RuntimeError(f"Unexpected partial audio for completed track {key}")
        elif status == "response_received":
            if target.exists() or not partial.is_file() or sha256(partial.read_bytes()) != state.get("responseSha256"):
                raise RuntimeError(f"Saved response is missing or changed for {key}; no retry attempted")
        elif target.exists() or partial.exists():
            raise RuntimeError(f"Untracked audio exists for {key}; refusing to overwrite")
    if progress.get("voiceIds") not in (None, {locale: VOICES[locale]["voiceId"] for locale in VOICES}):
        raise RuntimeError("Progress voice IDs differ from the pinned configuration")
    if progress.get("models") not in (None, {locale: VOICES[locale]["model"] for locale in VOICES}):
        raise RuntimeError("Progress models differ from the pinned configuration")
    progress["voiceIds"] = {locale: VOICES[locale]["voiceId"] for locale in VOICES}
    progress["models"] = {locale: VOICES[locale]["model"] for locale in VOICES}
    return progress


def save_progress(progress: dict) -> None:
    progress["updatedAt"] = datetime.now(timezone.utc).isoformat()
    atomic_json(PROGRESS, progress)


def request_body(row: dict) -> bytes:
    config = VOICES[row["locale"]]
    payload = {"text": row["text"], "model_id": config["model"], "language_code": config["languageCode"]}
    if "voiceSettings" in config:
        payload["voice_settings"] = config["voiceSettings"]
    body = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8", "strict")
    if json.loads(body.decode("utf-8", "strict"))["text"] != row["text"]:
        raise RuntimeError(f"Encoded story changed for {track_key(row)}")
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
    raise RuntimeError("ELEVENLABS_API_KEY unavailable")


def api_json(url: str, key: str) -> object:
    request = urllib.request.Request(url, headers={"xi-api-key": key, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode("utf-8", "strict"))
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"ElevenLabs preflight failed (HTTP {error.code})") from None
    except Exception:
        raise RuntimeError("ElevenLabs preflight failed; response details suppressed") from None


def preflight(rows: list[dict], progress: dict, key: str) -> dict:
    subscription = api_json("https://api.elevenlabs.io/v1/user/subscription", key)
    if not isinstance(subscription, dict):
        raise RuntimeError("ElevenLabs subscription response was invalid")
    try:
        character_count = int(subscription["character_count"])
        character_limit = int(subscription["character_limit"])
    except (KeyError, TypeError, ValueError):
        raise RuntimeError("ElevenLabs subscription response was incomplete") from None
    can_extend = subscription.get("can_extend_character_limit")
    remaining_rows = [row for row in rows if progress["tracks"][track_key(row)]["status"] == "pending"]
    estimate = sum(row["characters"] for row in remaining_rows)
    remaining = character_limit - character_count
    reserve_met = remaining - estimate >= RESERVE
    budget_met = int(progress.get("charactersPosted", 0)) + estimate <= BUDGET

    models = api_json("https://api.elevenlabs.io/v1/models", key)
    if not isinstance(models, list):
        raise RuntimeError("ElevenLabs model availability response was invalid")
    availability = {}
    for locale, config in VOICES.items():
        voice = api_json(f"https://api.elevenlabs.io/v1/voices/{config['voiceId']}", key)
        voice_ok = isinstance(voice, dict) and voice.get("voice_id") == config["voiceId"]
        model_ok = any(
            isinstance(model, dict)
            and model.get("model_id") == config["model"]
            and model.get("can_do_text_to_speech") is True
            for model in models
        )
        availability[locale] = {"voiceAvailable": voice_ok, "modelAvailable": model_ok}
        if not voice_ok or not model_ok:
            raise RuntimeError(f"Pinned {locale} voice/model unavailable; no fallback attempted")
    return {
        "characterCount": character_count,
        "characterLimit": character_limit,
        "availableCharacters": remaining,
        "estimatedOutstandingCharacters": estimate,
        "reserveCharacters": RESERVE,
        "budgetCharacters": BUDGET,
        "canExtendCharacterLimit": can_extend,
        "reserveMet": reserve_met,
        "budgetMet": budget_met,
        "voiceModelAvailability": availability,
        "eligibleForPost": can_extend is False and reserve_met and budget_met and all(
            item["voiceAvailable"] and item["modelAvailable"] for item in availability.values()
        ),
    }


def validate_mp3(path: Path) -> dict:
    if not path.is_file() or path.stat().st_size < 128:
        raise RuntimeError(f"{path.name}: empty or truncated audio")
    ffprobe = shutil.which("ffprobe")
    if not ffprobe:
        raise RuntimeError("ffprobe is unavailable; MP3 validation cannot complete")
    probe = subprocess.run(
        [ffprobe, "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=codec_name,sample_rate",
         "-show_entries", "format=duration", "-of", "json", str(path)],
        capture_output=True,
        text=True,
        encoding="utf-8",
        check=False,
    )
    if probe.returncode != 0:
        raise RuntimeError(f"{path.name}: ffprobe could not validate the MP3")
    try:
        metadata = json.loads(probe.stdout)
        stream = metadata["streams"][0]
        duration = float(metadata["format"]["duration"])
    except (KeyError, IndexError, TypeError, ValueError, json.JSONDecodeError):
        raise RuntimeError(f"{path.name}: ffprobe returned incomplete MP3 metadata") from None
    if stream.get("codec_name") != "mp3" or int(stream.get("sample_rate", 0)) != 44_100 or duration <= 0:
        raise RuntimeError(f"{path.name}: expected nonempty MP3 audio at 44.1 kHz")
    ffmpeg = shutil.which("ffmpeg")
    if ffmpeg:
        decoded = subprocess.run(
            [ffmpeg, "-v", "error", "-i", str(path), "-f", "null", "-"],
            capture_output=True,
            check=False,
        )
        if decoded.returncode != 0:
            raise RuntimeError(f"{path.name}: ffmpeg could not decode the MP3")
    return {"codec": "mp3", "sampleRateHz": 44_100, "durationSeconds": round(duration, 3), "decodedWithFfmpeg": bool(ffmpeg)}


def manifest_value(rows: list[dict], progress: dict) -> dict:
    entries = []
    for row in rows:
        state = progress["tracks"][track_key(row)]
        config = VOICES[row["locale"]]
        entry = {
            **{name: row[name] for name in ("collectionId", "nodeId", "contentId", "locale", "source", "sourceDataSha256", "sourceDataRawSha256", "datasetRevision", "textHash", "characters", "utf8Bytes")},
            "path": audio_path(row).relative_to(ROOT).as_posix(),
            "voiceId": config["voiceId"],
            "voiceName": config["voiceName"],
            "model": config["model"],
            "languageCode": config["languageCode"],
            "voiceSettings": config.get("voiceSettings", "provider defaults"),
            "outputFormat": FORMAT,
            "requestStatus": state["status"],
            "httpStatus": state.get("httpStatus"),
            "charactersPosted": state.get("charactersPosted", 0),
            "charactersAccepted": state.get("charactersAccepted", 0),
            "humanApproved": False,
            "listened": False,
        }
        if state["status"] == "complete":
            entry.update({
                "audioSha256": state["audioSha256"],
                "bytes": state["bytes"],
                **state["audioMetadata"],
            })
        entries.append(entry)
    return {
        "schemaVersion": 1,
        "scope": "17 node stories, Vietnamese and English",
        "provider": "ElevenLabs",
        "outputFormat": FORMAT,
        "budgetCharacters": BUDGET,
        "reserveCharacters": RESERVE,
        "canExtendCharacterLimit": False,
        "humanApproved": False,
        "listened": False,
        "status": progress.get("status", "in_progress"),
        "apiRequests": progress.get("apiRequests", 0),
        "charactersPosted": progress.get("charactersPosted", 0),
        "charactersAccepted": progress.get("charactersAccepted", 0),
        "subscriptionCharacterCountBefore": progress.get("subscriptionCharacterCountBefore"),
        "subscriptionCharacterCountAfter": progress.get("subscriptionCharacterCountAfter"),
        "subscriptionCharacterCountDelta": progress.get("subscriptionCharacterCountDelta"),
        "entries": entries,
    }


def render_catalogue(manifest: dict) -> str:
    rows = [row for row in manifest["entries"] if row.get("requestStatus") == "complete"]
    if len(rows) != 34:
        raise RuntimeError("Catalogue registration requires all 34 validated audio tracks")
    lines = [
        "import type { Locale } from '../data/locale.ts';",
        "import type { VoiceTrack } from './catalog.ts';",
        "",
        "/* eslint-disable @typescript-eslint/no-require-imports -- Metro needs static asset requires. */",
        CATALOGUE_MARKER,
        "export const nodeStoryVoiceCatalogues: Record<string, Partial<Record<Locale, { datasetRevision: string; tracks: Record<string, VoiceTrack> }>>> = {",
    ]
    for collection in COLLECTIONS:
        lines.append(f"  {json.dumps(collection)}: {{")
        for locale in VOICES:
            selected = [row for row in rows if row["collectionId"] == collection and row["locale"] == locale]
            if not selected:
                continue
            lines.extend((f"    {locale}: {{", f"      datasetRevision: {json.dumps(selected[0]['datasetRevision'])},", "      tracks: {"))
            for row in selected:
                track_id = row["contentId"]
                relative = Path("../../assets/voice/node-stories") / locale / f"{track_id}.mp3"
                lines.extend((
                    f"        {json.dumps(track_id)}: {{",
                    f"          id: {json.dumps(track_id)}, kind: 'story', nodeId: {json.dumps(row['nodeId'])},",
                    f"          source: require({json.dumps(relative.as_posix())}),",
                    f"          textHash: {json.dumps(row['textHash'])}, durationSeconds: {row['durationSeconds']},",
                    "        },",
                ))
            lines.extend(("      },", "    },"))
        lines.append("  },")
    lines.extend(("};", ""))
    return "\n".join(lines)


def atomic_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    partial = path.with_name(path.name + ".partial")
    if partial.exists():
        raise RuntimeError(f"Unresolved partial state at {partial.relative_to(ROOT)}")
    with partial.open("x", encoding="utf-8", newline="\n") as stream:
        stream.write(content)
        stream.flush()
        os.fsync(stream.fileno())
    partial.replace(path)


def generate(locale: str, rows: list[dict], progress: dict) -> dict:
    if CATALOGUE.exists() and CATALOGUE_MARKER not in CATALOGUE.read_text(encoding="utf-8"):
        raise RuntimeError("nodeStoriesCatalog.ts exists outside this generator's ownership")
    if CATALOGUE.with_name(CATALOGUE.name + ".partial").exists():
        raise RuntimeError("Unresolved catalogue partial; no paid request attempted")
    if MANIFEST.with_name(MANIFEST.name + ".partial").exists():
        raise RuntimeError("Unresolved manifest partial; no paid request attempted")
    if MANIFEST.exists() and json.loads(MANIFEST.read_text(encoding="utf-8")).get("scope") != "17 node stories, Vietnamese and English":
        raise RuntimeError("Existing node-story manifest belongs to a different scope")
    if locale == "en" and any(progress["tracks"][track_key(row)]["status"] != "complete" for row in rows if row["locale"] == "vi"):
        raise RuntimeError("Generate all Vietnamese stories before English")
    key = get_api_key()
    quota = preflight(rows, progress, key)
    if not quota["eligibleForPost"]:
        raise RuntimeError(
            "Preflight rejected paid generation: "
            f"canExtendCharacterLimit={quota['canExtendCharacterLimit']}, "
            f"reserveMet={quota['reserveMet']}, budgetMet={quota['budgetMet']}, "
            f"voiceModelAvailability={quota['voiceModelAvailability']}"
        )
    progress["voiceIds"] = {language: VOICES[language]["voiceId"] for language in VOICES}
    progress["models"] = {language: VOICES[language]["model"] for language in VOICES}
    progress["outputFormat"] = FORMAT
    progress["budgetCharacters"] = BUDGET
    progress["reserveCharacters"] = RESERVE
    progress["canExtendCharacterLimit"] = False
    progress.setdefault("subscriptionCharacterCountBefore", quota["characterCount"])
    progress["lastSubscriptionCharacterCountBefore"] = quota["characterCount"]
    progress["status"] = "in_progress"
    save_progress(progress)

    requests_this_run = 0
    posted_this_run = 0
    accepted_this_run = 0
    for row in (item for item in rows if item["locale"] == locale):
        key_name = track_key(row)
        state = progress["tracks"][key_name]
        target, partial = audio_path(row), partial_audio_path(row)
        if state["status"] == "complete":
            validate_mp3(target)
            continue
        if state["status"] == "response_received":
            audio = partial.read_bytes()
        else:
            body = request_body(row)
            state.update({"status": "requesting", "requestStartedAt": datetime.now(timezone.utc).isoformat(), "charactersPosted": row["characters"]})
            progress["charactersPosted"] = int(progress.get("charactersPosted", 0)) + row["characters"]
            progress["apiRequests"] = int(progress.get("apiRequests", 0)) + 1
            requests_this_run += 1
            posted_this_run += row["characters"]
            save_progress(progress)
            request = urllib.request.Request(
                f"https://api.elevenlabs.io/v1/text-to-speech/{VOICES[locale]['voiceId']}?output_format={FORMAT}",
                data=body,
                method="POST",
                headers={"xi-api-key": key, "Accept": "audio/mpeg", "Content-Type": "application/json; charset=utf-8"},
            )
            try:
                with urllib.request.urlopen(request, timeout=120) as response:
                    state["httpStatus"] = response.status
                    if response.status != 200:
                        state["status"] = "api_error"
                        save_progress(progress)
                        raise RuntimeError(f"{key_name}: unexpected TTS HTTP {response.status}; no retry attempted")
                    state["status"] = "receiving_response"
                    state["charactersAccepted"] = row["characters"]
                    progress["charactersAccepted"] = int(progress.get("charactersAccepted", 0)) + row["characters"]
                    accepted_this_run += row["characters"]
                    save_progress(progress)
                    audio = response.read()
            except urllib.error.HTTPError as error:
                state.update({"status": "api_error", "httpStatus": error.code})
                save_progress(progress)
                raise RuntimeError(f"{key_name}: TTS HTTP {error.code}; no retry attempted") from None
            except RuntimeError:
                raise
            except Exception:
                state["status"] = "outcome_unknown"
                save_progress(progress)
                raise RuntimeError(f"{key_name}: TTS result is uncertain; no retry attempted") from None
            if not audio:
                state["status"] = "invalid_audio"
                save_progress(progress)
                raise RuntimeError(f"{key_name}: TTS returned empty audio; no retry attempted")
            atomic_bytes(partial, audio)
            state.update({"status": "response_received", "responseSha256": sha256(audio), "responseBytes": len(audio)})
            save_progress(progress)

        try:
            metadata = validate_mp3(partial)
        except Exception:
            state["status"] = "invalid_audio"
            save_progress(progress)
            raise RuntimeError(f"{key_name}: received audio failed MP3 validation; no retry attempted") from None
        if target.exists():
            raise RuntimeError(f"Refusing to overwrite existing audio for {key_name}")
        partial.replace(target)
        state.update({
            "status": "complete",
            "audioSha256": sha256(audio),
            "bytes": len(audio),
            "audioMetadata": metadata,
            "completedAt": datetime.now(timezone.utc).isoformat(),
        })
        save_progress(progress)

    after = api_json("https://api.elevenlabs.io/v1/user/subscription", key)
    try:
        count_after = int(after["character_count"])
    except (TypeError, KeyError, ValueError):
        raise RuntimeError("Post-generation quota response was incomplete; no further POST attempted") from None
    progress["subscriptionCharacterCountAfter"] = count_after
    progress["subscriptionCharacterCountDelta"] = count_after - int(progress["subscriptionCharacterCountBefore"])
    all_complete = all(progress["tracks"][track_key(row)]["status"] == "complete" for row in rows)
    progress["status"] = "complete" if all_complete else "in_progress"
    save_progress(progress)
    if all_complete:
        manifest = manifest_value(rows, progress)
        if MANIFEST.exists() and json.loads(MANIFEST.read_text(encoding="utf-8")).get("scope") != manifest["scope"]:
            raise RuntimeError("Existing node-story manifest belongs to a different scope")
        atomic_json(MANIFEST, manifest)
        atomic_text(CATALOGUE, render_catalogue(manifest))
    return {
        "locale": locale,
        "apiRequestsThisRun": requests_this_run,
        "charactersPostedThisRun": posted_this_run,
        "charactersAcceptedThisRun": accepted_this_run,
        "totalApiRequests": progress["apiRequests"],
        "totalCharactersPosted": progress["charactersPosted"],
        "totalCharactersAccepted": progress["charactersAccepted"],
        "subscriptionCharacterCountBefore": progress["subscriptionCharacterCountBefore"],
        "subscriptionCharacterCountAfter": count_after,
        "subscriptionCharacterCountDelta": progress["subscriptionCharacterCountDelta"],
        "status": progress["status"],
    }


def summary(rows: list[dict], progress: dict) -> dict:
    return {
        "mode": "offline-audit",
        "totalTracks": len(rows),
        "tracksByLocale": {locale: sum(row["locale"] == locale for row in rows) for locale in VOICES},
        "charactersByLocale": {locale: sum(row["characters"] for row in rows if row["locale"] == locale) for locale in VOICES},
        "totalCharacters": sum(row["characters"] for row in rows),
        "budgetCharacters": BUDGET,
        "reserveCharacters": RESERVE,
        "priorApiRequests": progress.get("apiRequests", 0),
        "sourceHashesVerified": True,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--preflight", action="store_true", help="Check quota and pinned availability; no TTS POST")
    mode.add_argument("--generate", action="store_true", help="Generate one locale after the guarded preflight")
    parser.add_argument("--locale", choices=tuple(VOICES), default="vi")
    args = parser.parse_args()
    rows = read_rows()
    progress = load_progress(rows)
    if args.preflight:
        quota = preflight(rows, progress, get_api_key())
        print(json.dumps({**summary(rows, progress), "mode": "read-only-preflight", "quota": quota}, ensure_ascii=True))
    elif args.generate:
        print(json.dumps(generate(args.locale, rows, progress), ensure_ascii=True))
    else:
        print(json.dumps(summary(rows, progress), ensure_ascii=True))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        sys.exit(str(error))
