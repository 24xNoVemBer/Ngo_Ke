"""Dry-run and safely render the provisional Three Lenses ElevenLabs collection."""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import HTTPRedirectHandler, Request, build_opener

from three_lenses import (
    COLLECTION,
    LOCALES,
    ROOT,
    _strict_decode,
    dataset_revisions,
    inventory,
    sha256,
)
from post8_remaining import probe_mp3

TOOLS = ROOT / "tools" / "voice"
ASSET_ROOT = ROOT / "mobile" / "assets" / "voice"
CACHE = TOOLS / ".cache" / "three-lenses-elevenlabs"
LEDGER = CACHE / "ledger.json"
OUTPUT = ASSET_ROOT / "three-lenses-elevenlabs"
CATALOG = ROOT / "mobile" / "src" / "voice" / "threeLensesCatalog.ts"
API = "https://api.elevenlabs.io/v1"
MODEL = "eleven_v4"
OUTPUT_FORMAT = "mp3_44100_128"
SETTINGS = {"stability": 0.5, "similarity_boost": 0.75}
VOICE_IDS = {"vi": "0ggMuQ1r9f9jqBu50nJn", "en": "OZ0L6eISlOejga3XjDFt"}
BUDGET = 30_000
TIMEOUT = 90
ACCOUNT_SETTLEMENT_TIMEOUT = 60
MAX_MODEL_CHARACTERS = 10_000
AUDIO_SUFFIXES = {".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac", ".caf", ".aiff", ".aif", ".opus", ".wma"}
IGNORED_AUDIO_DIRS = {".git", "node_modules", ".cache", ".venv", "__pycache__", ".runs"}


class _NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req: Request, fp: Any, code: int, msg: str, headers: Any, newurl: str) -> None:
        return None


def _fingerprint(value: Any) -> str:
    return sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8"))


def track_specs() -> tuple[list[dict[str, Any]], dict[str, str]]:
    rows_by_locale = inventory()
    revisions = dataset_revisions()
    tracks = []
    for locale in ("en", "vi"):
        for collection, source, source_bytes, row in rows_by_locale[locale]:
            text_bytes = row["text"].encode("utf-8")
            tracks.append({
                "collectionId": collection,
                "locale": locale,
                "id": row["id"],
                "kind": row["kind"],
                "nodeId": row.get("nodeId"),
                "source": source.relative_to(ROOT).as_posix(),
                "sourceDataSha256": sha256(source_bytes),
                "datasetRevision": revisions[locale],
                "text": row["text"],
                "textSha256": sha256(text_bytes),
                "spokenTextSha256": sha256(text_bytes),
                "characters": len(row["text"]),
                "voiceId": VOICE_IDS[locale],
            })
    if len(tracks) != 56 or len({(row["locale"], row["id"]) for row in tracks}) != 56:
        raise ValueError("Expected exactly 56 unique Three Lenses tracks")
    if any(not row["text"].strip() or row["characters"] > MAX_MODEL_CHARACTERS for row in tracks):
        raise ValueError("Source text is empty or exceeds the frozen model request limit")
    return tracks, revisions


def run_config(revisions: dict[str, str]) -> dict[str, Any]:
    return {
        "scope": COLLECTION,
        "model": MODEL,
        "outputFormat": OUTPUT_FORMAT,
        "settings": SETTINGS,
        "voices": VOICE_IDS,
        "voiceRate": 1.0,
        "datasetRevisions": revisions,
        "budgetCredits": BUDGET,
        "humanApproved": False,
        "sourceOnly": True,
    }


def protected_asset_hashes() -> dict[str, str]:
    protected = {}
    for directory, subdirectories, filenames in os.walk(ROOT):
        subdirectories[:] = [name for name in subdirectories if name not in IGNORED_AUDIO_DIRS]
        for filename in filenames:
            path = Path(directory) / filename
            if path.suffix.lower() not in AUDIO_SUFFIXES or OUTPUT in path.parents:
                continue
            protected[path.relative_to(ROOT).as_posix()] = sha256(path.read_bytes())
    if not protected:
        raise FileNotFoundError("No existing audio assets were found to protect")
    return protected


def dry_run() -> dict[str, Any]:
    tracks, revisions = track_specs()
    by_locale = {locale: [row for row in tracks if row["locale"] == locale] for locale in LOCALES}
    protected = protected_asset_hashes()
    return {
        "mode": "dry-run; no network or paid calls",
        "scope": COLLECTION,
        "model": MODEL,
        "outputFormat": OUTPUT_FORMAT,
        "settings": SETTINGS,
        "voiceIds": VOICE_IDS,
        "trackCounts": {locale: len(by_locale[locale]) for locale in LOCALES},
        "characters": {locale: sum(row["characters"] for row in by_locale[locale]) for locale in LOCALES},
        "totalTracks": len(tracks),
        "totalCharacters": sum(row["characters"] for row in tracks),
        "estimatedCredits": sum(row["characters"] for row in tracks),
        "budgetCredits": BUDGET,
        "budgetHeadroomCredits": BUDGET - sum(row["characters"] for row in tracks),
        "checkpointTracks": [row["locale"] + "/" + row["id"] for row in tracks if row["kind"] == "caption" and row["nodeId"] == "oldquarter-bach-ma"],
        "datasetRevisions": revisions,
        "protectedAssetCount": len(protected),
        "protectedAssetSetSha256": _fingerprint(protected),
    }


def _load_api_key() -> str:
    key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if key:
        return key
    env_file = TOOLS / ".env.local"
    if env_file.is_file():
        for line in env_file.read_text(encoding="utf-8-sig").splitlines():
            name, separator, value = line.partition("=")
            if separator and name.strip() == "ELEVENLABS_API_KEY":
                value = value.strip()
                if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
                    value = value[1:-1]
                if value:
                    return value
    raise RuntimeError("ELEVENLABS_API_KEY is missing; set it locally in tools/voice/.env.local")


def _request(path: str, api_key: str, *, body: bytes | None = None, accept: str = "application/json") -> tuple[bytes, Any]:
    method = "POST" if body is not None else "GET"
    headers = {"xi-api-key": api_key, "Accept": accept}
    if body is not None:
        headers["Content-Type"] = "application/json"
    request = Request(f"{API}/{path}", data=body, headers=headers, method=method)
    try:
        with build_opener(_NoRedirect).open(request, timeout=TIMEOUT) as response:
            return response.read(), response.headers
    except HTTPError as error:
        raise RuntimeError(f"ElevenLabs {method} request failed with HTTP {error.code}") from None
    except (URLError, TimeoutError, OSError) as error:
        raise RuntimeError(f"ElevenLabs {method} request failed ({type(error).__name__})") from None


def _request_json(path: str, api_key: str) -> dict[str, Any] | list[Any]:
    payload, _ = _request(path, api_key)
    try:
        value = json.loads(payload)
    except (UnicodeDecodeError, json.JSONDecodeError):
        raise RuntimeError(f"ElevenLabs returned invalid JSON for {path}") from None
    if not isinstance(value, (dict, list)):
        raise RuntimeError(f"ElevenLabs returned an unexpected response for {path}")
    return value


def _integer(value: Any, label: str) -> int:
    if isinstance(value, bool):
        raise RuntimeError(f"ElevenLabs {label} was not an integer")
    try:
        result = int(value)
    except (TypeError, ValueError):
        raise RuntimeError(f"ElevenLabs {label} was not an integer") from None
    if str(value).strip() != str(result) or result < 0:
        raise RuntimeError(f"ElevenLabs {label} was not a non-negative integer")
    return result


def _account_safety(subscription: dict[str, Any], minimum_balance: int = 0) -> tuple[int, int, int]:
    count = _integer(subscription.get("character_count"), "character_count")
    limit = _integer(subscription.get("character_limit"), "character_limit")
    if subscription.get("can_extend_character_limit") is not False:
        raise RuntimeError("ElevenLabs overage is enabled or cannot be confirmed disabled")
    extension = subscription.get("max_credit_limit_extension")
    if extension not in (None, 0, "0"):
        raise RuntimeError("ElevenLabs credit-limit extension is enabled")
    remaining = limit - count
    if remaining < minimum_balance:
        raise RuntimeError("ElevenLabs remaining balance is below the next reserved request")
    if subscription.get("tier") != "starter":
        raise RuntimeError("ElevenLabs plan changed since the frozen preflight")
    return count, limit, remaining


def _account_snapshot(subscription: dict[str, Any]) -> dict[str, Any]:
    count, limit, remaining = _account_safety(subscription)
    return {"tier": subscription["tier"], "characterCount": count, "characterLimit": limit,
            "remainingCredits": remaining, "canExtendCharacterLimit": False}


def _preflight(api_key: str) -> dict[str, Any]:
    subscription = _request_json("user/subscription", api_key)
    if not isinstance(subscription, dict):
        raise RuntimeError("ElevenLabs subscription response was not an object")
    count, limit, remaining = _account_safety(subscription)
    models = _request_json("models", api_key)
    if not isinstance(models, list):
        raise RuntimeError("ElevenLabs models response was not a list")
    model = next((row for row in models if isinstance(row, dict) and row.get("model_id") == MODEL), None)
    if not model:
        raise RuntimeError("Frozen ElevenLabs model is unavailable")
    languages = {row.get("language_id") for row in model.get("languages", []) if isinstance(row, dict)}
    if not {"vi", "en"}.issubset(languages):
        raise RuntimeError("Frozen ElevenLabs model does not report both required languages")
    rates = model.get("model_rates")
    if not isinstance(rates, dict):
        raise RuntimeError("ElevenLabs model cost rates were not reported")
    multipliers = (model.get("token_cost_factor"), rates.get("character_cost_multiplier"), rates.get("cost_discount_multiplier"))
    if any(value is None or float(value) != 1.0 for value in multipliers):
        raise RuntimeError("ElevenLabs model cost multipliers changed from the frozen 1-credit rate")
    voice_checks = {}
    for locale, voice_id in VOICE_IDS.items():
        voice = _request_json(f"voices/{voice_id}", api_key)
        sharing = voice.get("sharing") if isinstance(voice, dict) else None
        if (not isinstance(voice, dict) or voice.get("voice_id") != voice_id or voice.get("category") != "professional"
                or not isinstance(sharing, dict) or float(sharing.get("rate", -1)) != 1.0):
            raise RuntimeError(f"Frozen {locale} ElevenLabs voice is unavailable or changed")
        voice_checks[locale] = {"voiceId": voice_id, "category": "professional", "rate": 1.0}
    return {
        "tier": subscription["tier"], "characterCount": count, "characterLimit": limit,
        "remainingCredits": remaining, "canExtendCharacterLimit": False,
        "model": MODEL, "languages": ["vi", "en"], "costMultipliers": [1.0, 1.0, 1.0],
        "voices": voice_checks,
    }


def _ledger_payload(tracks: list[dict[str, Any]], revisions: dict[str, str], preflight: dict[str, Any]) -> dict[str, Any]:
    config = run_config(revisions)
    identities = [{key: row[key] for key in ("locale", "id", "kind", "nodeId", "source", "sourceDataSha256", "datasetRevision", "textSha256", "spokenTextSha256", "characters", "voiceId")} for row in tracks]
    return {
        "schemaVersion": 1,
        "scope": COLLECTION,
        "runFingerprint": _fingerprint({"config": config, "tracks": identities}),
        "config": config,
        "preflight": preflight,
        "initialCharacterCount": preflight["characterCount"],
        "protectedAssets": protected_asset_hashes(),
        "checkpoint": None,
        "tracks": {},
    }


def _save_ledger(ledger: dict[str, Any]) -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    temporary = LEDGER.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(ledger, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(temporary, LEDGER)


def _load_ledger(tracks: list[dict[str, Any]], revisions: dict[str, str], preflight: dict[str, Any], *, create: bool,
                 allow_cost_reconcile: bool = False) -> dict[str, Any]:
    if not LEDGER.exists():
        if not create:
            raise RuntimeError("No ElevenLabs ledger exists; run the two-caption checkpoint first")
        ledger = _ledger_payload(tracks, revisions, preflight)
        if OUTPUT.exists():
            raise FileExistsError("Refusing to start over installed voice output")
        _save_ledger(ledger)
        return ledger
    try:
        ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        raise RuntimeError("ElevenLabs ledger is unreadable; refusing to repeat any paid request") from None
    expected = _ledger_payload(tracks, revisions, ledger.get("preflight", preflight))
    if ledger.get("runFingerprint") != expected["runFingerprint"] or ledger.get("config") != expected["config"]:
        raise RuntimeError("Source or frozen ElevenLabs configuration changed; refusing resume")
    if ledger.get("initialCharacterCount") != ledger.get("preflight", {}).get("characterCount"):
        raise RuntimeError("Ledger account baseline is inconsistent; refusing resume")
    if ledger.get("protectedAssets") != expected["protectedAssets"]:
        raise RuntimeError("A protected existing voice asset changed; refusing to continue")
    current = {f"{row['locale']}/{row['id']}": row for row in tracks}
    for key, entry in ledger.get("tracks", {}).items():
        row = current.get(key)
        if (not row or entry.get("sourceTextSha256") != row["textSha256"]
                or entry.get("spokenTextSha256") != row["spokenTextSha256"]):
            raise RuntimeError("Ledger track source hashes do not match; refusing resume")
    _recover_validated_invalid(ledger, tracks)
    _reconcile_received(ledger, tracks)
    allowed = {"completed"}
    if allow_cost_reconcile:
        allowed.update(("cost_mismatch", "pending_cost_reconcile"))
    for key, entry in ledger.get("tracks", {}).items():
        if entry.get("status") not in allowed:
            continue
        row = current[key]
        path = _cache_path(row["locale"], row["id"])
        if not path.is_file() or sha256(path.read_bytes()) != entry.get("audioSha256"):
            raise RuntimeError(f"Completed staged audio failed hash verification: {key}")
        try:
            info = _audio_report(path)
        except Exception:
            raise RuntimeError(f"Completed staged audio failed decode/format verification: {key}") from None
        cost = entry.get("characterCost")
        if (info != entry.get("format") or not isinstance(cost, int) or isinstance(cost, bool)
                or cost < 0 or cost > entry.get("reservedCredits", -1)
                or entry.get("reservedCredits") != row["characters"]):
            raise RuntimeError(f"Completed staged audio metadata differs from source/config: {key}")
    unresolved = [key for key, value in ledger.get("tracks", {}).items() if value.get("status") not in allowed]
    if unresolved:
        raise RuntimeError("Unresolved paid attempt blocks resume; reconcile its usage before continuing")
    return ledger


def _cache_path(locale: str, content_id: str) -> Path:
    if locale not in LOCALES or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{0,127}", content_id):
        raise ValueError("Unsafe voice track identity")
    path = (CACHE / locale / f"{content_id}.mp3").resolve()
    try:
        path.relative_to(CACHE.resolve())
    except ValueError:
        raise ValueError("Voice cache path escapes its root") from None
    return path


def _audio_report(path: Path) -> dict[str, Any]:
    _strict_decode(path)
    info = probe_mp3(path)
    if (info.get("container") != "mp3" or info.get("codec") != "mp3"
            or info.get("sampleRateHz") != 44_100 or info.get("bitrateKbps") != 128
            or info.get("durationSeconds", 0) <= 0):
        raise ValueError("Generated audio did not match the frozen MP3 format")
    return info


def _reconcile_received(ledger: dict[str, Any], tracks: list[dict[str, Any]]) -> None:
    by_key = {f"{row['locale']}/{row['id']}": row for row in tracks}
    for key, entry in ledger.get("tracks", {}).items():
        if entry.get("status") == "received":
            row = by_key.get(key)
            path = _cache_path(row["locale"], row["id"]) if row else None
            if not row or not path or not path.is_file() or sha256(path.read_bytes()) != entry.get("audioSha256"):
                entry["status"] = "unresolved"
            else:
                try:
                    info = _audio_report(path)
                except Exception:
                    entry["status"] = "invalid"
                else:
                    entry["format"] = info
                    entry["durationSeconds"] = info["durationSeconds"]
                    cost = entry.get("characterCost")
                    if cost is None:
                        entry["status"] = "unknown_cost"
                    elif isinstance(cost, int) and not isinstance(cost, bool) and 0 <= cost <= entry.get("reservedCredits", -1):
                        entry["status"] = "pending_cost_reconcile"
                        if cost != entry.get("reservedCredits"):
                            entry["observedCostStatus"] = "cost_mismatch"
                    else:
                        entry["status"] = "cost_mismatch"
    if any(entry.get("status") != "completed" for entry in ledger.get("tracks", {}).values()):
        _save_ledger(ledger)


def _recover_validated_invalid(ledger: dict[str, Any], tracks: list[dict[str, Any]]) -> None:
    by_key = {f"{row['locale']}/{row['id']}": row for row in tracks}
    changed = False
    for key, entry in ledger.get("tracks", {}).items():
        if entry.get("status") != "invalid":
            continue
        row = by_key.get(key)
        path = _cache_path(row["locale"], row["id"]) if row else None
        cost = entry.get("characterCost")
        if (not row or not path or not path.is_file() or not entry.get("requestId")
                or entry.get("sourceTextSha256") != row["textSha256"]
                or entry.get("spokenTextSha256") != row["spokenTextSha256"]
                or entry.get("reservedCredits") != row["characters"]
                or not isinstance(cost, int) or isinstance(cost, bool) or cost < 0 or cost > row["characters"]
                or sha256(path.read_bytes()) != entry.get("audioSha256")):
            continue
        try:
            info = _audio_report(path)
        except Exception:
            continue
        entry.update({"status": "pending_cost_reconcile", "recoveredFromStatus": "invalid",
                      "observedCostStatus": "invalid", "format": info,
                      "durationSeconds": info["durationSeconds"]})
        changed = True
    if changed:
        _save_ledger(ledger)


def _actual_cost(headers: Any) -> int | None:
    value = headers.get("character-cost")
    if value is None:
        return None
    try:
        return _integer(value, "character-cost")
    except RuntimeError:
        return None


def _render_request(row: dict[str, Any], api_key: str) -> tuple[bytes, int | None, str | None]:
    body = json.dumps({"text": row["text"], "model_id": MODEL, "voice_settings": SETTINGS}, ensure_ascii=False).encode("utf-8")
    payload, headers = _request(
        f"text-to-speech/{row['voiceId']}?output_format={OUTPUT_FORMAT}", api_key,
        body=body, accept="audio/mpeg",
    )
    content_type = headers.get("content-type", "").split(";", 1)[0].strip().lower()
    if not content_type.startswith("audio/"):
        raise RuntimeError("ElevenLabs returned a non-audio response")
    return payload, _actual_cost(headers), headers.get("request-id")


def _risk_credits(ledger: dict[str, Any]) -> int:
    return sum(
        entry.get("characterCost") if entry.get("characterCost") is not None else entry["reservedCredits"]
        for entry in ledger.get("tracks", {}).values()
    )


def _completed_cost(ledger: dict[str, Any]) -> int:
    return sum(cost for entry in ledger.get("tracks", {}).values()
               if isinstance((cost := entry.get("characterCost")), int) and not isinstance(cost, bool) and cost >= 0)


def _assert_account_delta(ledger: dict[str, Any], subscription: dict[str, Any]) -> None:
    count, _, _ = _account_safety(subscription)
    if count - ledger["initialCharacterCount"] != _completed_cost(ledger):
        raise RuntimeError("ElevenLabs account usage does not match the ledger; no more paid calls are allowed")


def _read_subscription(api_key: str, deadline: float) -> dict[str, Any]:
    backoff = 1.0
    while True:
        try:
            subscription = _request_json("user/subscription", api_key)
        except RuntimeError as error:
            if "HTTP 429" not in str(error):
                raise
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                raise RuntimeError("ElevenLabs account usage remained throttled; no further paid calls are allowed") from None
            time.sleep(min(backoff, remaining))
            backoff = min(backoff * 2, 5.0)
            continue
        if not isinstance(subscription, dict):
            raise RuntimeError("ElevenLabs subscription response was not an object")
        return subscription


def _wait_for_account_delta(ledger: dict[str, Any], api_key: str, minimum_balance: int = 0) -> dict[str, Any]:
    deadline = time.monotonic() + ACCOUNT_SETTLEMENT_TIMEOUT
    while True:
        subscription = _read_subscription(api_key, deadline)
        count, _, _ = _account_safety(subscription, minimum_balance)
        if count - ledger["initialCharacterCount"] == _completed_cost(ledger):
            return subscription
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            raise RuntimeError(f"ElevenLabs account usage did not settle to the ledger within {ACCOUNT_SETTLEMENT_TIMEOUT} seconds")
        time.sleep(min(1.0, remaining))


def _known_cost_total(ledger: dict[str, Any], tracks: list[dict[str, Any]]) -> int:
    by_key = {f"{row['locale']}/{row['id']}": row for row in tracks}
    total = 0
    for key, entry in ledger.get("tracks", {}).items():
        row = by_key.get(key)
        cost = entry.get("characterCost")
        path = _cache_path(row["locale"], row["id"]) if row else None
        if (not row or entry.get("status") not in ("completed", "pending_cost_reconcile")
                or not isinstance(cost, int) or isinstance(cost, bool) or cost < 0
                or cost > row["characters"] or entry.get("reservedCredits") != row["characters"]
                or entry.get("sourceTextSha256") != row["textSha256"]
                or entry.get("spokenTextSha256") != row["spokenTextSha256"]
                or not path or not path.is_file() or sha256(path.read_bytes()) != entry.get("audioSha256")
                or not entry.get("format")):
            raise RuntimeError("A prior paid attempt is not fully validated; no further paid call is allowed")
        total += cost
    return total


def _shadow_balance_guard(ledger: dict[str, Any], tracks: list[dict[str, Any]], api_key: str,
                          minimum_balance: int) -> None:
    if _risk_credits(ledger) + minimum_balance > BUDGET:
        raise RuntimeError("The next request would exceed the 30,000-credit project budget")
    known_cost = _known_cost_total(ledger, tracks)
    subscription = _read_subscription(api_key, time.monotonic() + ACCOUNT_SETTLEMENT_TIMEOUT)
    count, limit, _ = _account_safety(subscription)
    expected_count = ledger["initialCharacterCount"] + known_cost
    if count > expected_count:
        raise RuntimeError("ElevenLabs account usage is higher than the known request costs; no more paid calls are allowed")
    available = limit - max(count, expected_count)
    if available < minimum_balance:
        raise RuntimeError("ElevenLabs shadow balance is below the next reserved request")


def _reconcile_account_costs(ledger: dict[str, Any], subscription: dict[str, Any]) -> None:
    count, _, _ = _account_safety(subscription)
    delta = count - ledger["initialCharacterCount"]
    if delta != _completed_cost(ledger) or _risk_credits(ledger) > BUDGET:
        raise RuntimeError("ElevenLabs account delta or reserved project budget does not reconcile")
    for entry in ledger.get("tracks", {}).values():
        if entry.get("status") not in ("cost_mismatch", "pending_cost_reconcile"):
            continue
        cost = entry.get("characterCost")
        if not isinstance(cost, int) or isinstance(cost, bool) or cost < 0 or cost > entry["reservedCredits"]:
            raise RuntimeError("A paid request has no safe non-negative cost within its reservation")
        prior_status = entry.get("observedCostStatus", entry["status"])
        entry["costDecision"] = {
            "priorStatus": prior_status,
            "disposition": "accepted_discount" if cost < entry["reservedCredits"] else "exact",
            "reservedCredits": entry["reservedCredits"],
            "observedCharacterCost": cost,
            "accountCharacterCount": count,
            "accountDeltaFromBaseline": delta,
        }
        entry["status"] = "completed"
    _save_ledger(ledger)


def _render_track(row: dict[str, Any], ledger: dict[str, Any], api_key: str,
                  all_tracks: list[dict[str, Any]] | None = None) -> None:
    key = f"{row['locale']}/{row['id']}"
    if key in ledger["tracks"]:
        entry = ledger["tracks"][key]
        path = _cache_path(row["locale"], row["id"])
        if entry.get("status") != "completed" or not path.is_file() or sha256(path.read_bytes()) != entry.get("audioSha256"):
            raise RuntimeError(f"Existing paid attempt is unresolved or its audio changed: {key}")
        _audio_report(path)
        return
    path = _cache_path(row["locale"], row["id"])
    if path.exists():
        raise RuntimeError(f"Unrecorded staged audio blocks a paid request: {key}")
    estimate = row["characters"]
    if _risk_credits(ledger) + estimate > BUDGET:
        raise RuntimeError("The next request would exceed the 30,000-credit project budget")
    if all_tracks is None:
        _wait_for_account_delta(ledger, api_key, estimate)
    else:
        _shadow_balance_guard(ledger, all_tracks, api_key, estimate)
    entry = {"status": "reserved", "reservedCredits": estimate, "characterCost": None,
             "sourceTextSha256": row["textSha256"], "spokenTextSha256": row["spokenTextSha256"]}
    ledger["tracks"][key] = entry
    _save_ledger(ledger)
    try:
        audio, cost, request_id = _render_request(row, api_key)
    except Exception as error:
        entry["status"] = "unknown"
        entry["errorType"] = type(error).__name__
        _save_ledger(ledger)
        if isinstance(error, RuntimeError):
            raise
        raise RuntimeError(f"ElevenLabs request outcome is unknown ({type(error).__name__}); do not retry") from None
    path = _cache_path(row["locale"], row["id"])
    if path.exists():
        entry["status"] = "unresolved"
        _save_ledger(ledger)
        raise RuntimeError(f"A staged asset already exists for an unrecorded paid attempt: {key}")
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(".mp3.tmp")
    temporary.write_bytes(audio)
    os.replace(temporary, path)
    entry.update({"status": "received", "characterCost": cost, "requestId": request_id,
                  "audioSha256": sha256(audio)})
    _save_ledger(ledger)
    try:
        info = _audio_report(path)
    except Exception:
        entry["status"] = "invalid"
        _save_ledger(ledger)
        raise RuntimeError(f"Generated audio failed decode/format audit: {key}") from None
    entry.update({"status": "pending_cost_reconcile" if cost is not None and 0 <= cost <= estimate else "cost_mismatch",
                  "format": info, "durationSeconds": info["durationSeconds"]})
    if cost is not None and cost < estimate:
        entry["observedCostStatus"] = "cost_mismatch"
    _save_ledger(ledger)
    if cost is None:
        entry["status"] = "unknown_cost"
        _save_ledger(ledger)
        raise RuntimeError(f"ElevenLabs did not report character cost for {key}; no retry is allowed")
    if cost > estimate:
        raise RuntimeError(f"ElevenLabs character cost exceeded its reservation for {key}")


def _checkpoint_tracks(tracks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [row for row in tracks if row["kind"] == "caption" and row["nodeId"] == "oldquarter-bach-ma"]


def _run_checkpoint(api_key: str, tracks: list[dict[str, Any]], revisions: dict[str, str], preflight: dict[str, Any]) -> None:
    ledger = _load_ledger(tracks, revisions, preflight, create=True, allow_cost_reconcile=True)
    checkpoint = _checkpoint_tracks(tracks)
    if len(checkpoint) != 2 or {row["locale"] for row in checkpoint} != {"en", "vi"}:
        raise RuntimeError("Checkpoint must be exactly one caption per locale")
    if not set(ledger["tracks"]).issubset({f"{row['locale']}/{row['id']}" for row in checkpoint}):
        raise RuntimeError("Checkpoint ledger contains a track outside the two approved captions")
    if any(entry.get("status") in ("cost_mismatch", "pending_cost_reconcile") for entry in ledger["tracks"].values()):
        before = _wait_for_account_delta(ledger, api_key)
        _reconcile_account_costs(ledger, before)
    for row in checkpoint:
        _render_track(row, ledger, api_key)
    after = _wait_for_account_delta(ledger, api_key)
    costs = [ledger["tracks"][f"{row['locale']}/{row['id']}"]["characterCost"] for row in checkpoint]
    if any(not isinstance(cost, int) or isinstance(cost, bool) or cost < 0 for cost in costs):
        raise RuntimeError("A caption checkpoint is missing an integer character-cost header")
    actual = sum(costs)
    expected = sum(row["characters"] for row in checkpoint)
    verified = all(cost <= ledger["tracks"][f"{row['locale']}/{row['id']}"]["reservedCredits"]
                   for row, cost in zip(checkpoint, costs)) and actual <= BUDGET
    verified = verified and after["character_count"] - ledger["initialCharacterCount"] == actual
    if verified:
        _reconcile_account_costs(ledger, after)
    ledger["checkpoint"] = {
        "trackCount": 2, "estimatedCredits": expected, "observedCharacterCost": actual,
        "accountDelta": after["character_count"] - ledger["initialCharacterCount"],
        "accountSnapshot": _account_snapshot(after),
        "budgetHeadroomCredits": BUDGET - _risk_credits(ledger),
        "costDecisions": {f"{row['locale']}/{row['id']}": ledger["tracks"][f"{row['locale']}/{row['id']}"]["costDecision"] for row in checkpoint},
        "verified": verified,
    }
    _save_ledger(ledger)
    if not verified:
        raise RuntimeError("Caption checkpoint cost or account delta did not reconcile within its reservation")


def _catalog_source(catalogues: dict[str, dict[str, Any]]) -> str:
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
            source = f"../../assets/voice/three-lenses-elevenlabs/{locale}/{entry['id']}.mp3"
            lines.append(f"      {json.dumps(entry['id'])}: {{ id: {json.dumps(entry['id'])}, kind: {json.dumps(entry['kind'])}{node}, "
                         f"source: require({json.dumps(source)}), textHash: {json.dumps(entry['textHash'])}, durationSeconds: {entry['durationSeconds']} }},")
        lines.extend(("    },", "  },"))
    lines.extend(("};", ""))
    return "\n".join(lines)


def _manifest_entries(locale: str, tracks: list[dict[str, Any]], ledger: dict[str, Any], revision: str) -> list[dict[str, Any]]:
    entries = []
    for row in (item for item in tracks if item["locale"] == locale):
        key = f"{locale}/{row['id']}"
        attempt = ledger["tracks"].get(key, {})
        path = _cache_path(locale, row["id"])
        if attempt.get("status") != "completed" or not path.is_file() or sha256(path.read_bytes()) != attempt.get("audioSha256"):
            raise RuntimeError(f"Track is missing or failed hash verification: {key}")
        info = _audio_report(path)
        entries.append({
            "collectionId": COLLECTION, "datasetRevision": revision, "locale": locale,
            "id": row["id"], "kind": row["kind"], "nodeId": row["nodeId"],
            "source": row["source"], "sourceDataSha256": row["sourceDataSha256"],
            "sourceTextSha256": row["textSha256"], "spokenTextSha256": row["spokenTextSha256"],
            "textHash": row["textSha256"], "characters": row["characters"],
            "voiceId": row["voiceId"], "voiceName": "Thắm" if locale == "vi" else "Talia",
            "model": MODEL, "settings": SETTINGS, "voiceRate": 1.0,
            "outputFormat": OUTPUT_FORMAT, "requestId": attempt.get("requestId"),
            "characterCost": attempt["characterCost"], "audioSha256": attempt["audioSha256"],
            "costDecision": attempt["costDecision"],
            "path": f"mobile/assets/voice/three-lenses-elevenlabs/{locale}/{row['id']}.mp3",
            "format": info, "durationSeconds": info["durationSeconds"],
            "fullDecode": True, "humanApproved": False, "sourceOnly": True,
        })
    if len(entries) != 28:
        raise RuntimeError(f"Expected 28 audited {locale} tracks")
    return entries


def _verify_staged_audio(catalogues: dict[str, dict[str, Any]], stage: Path) -> None:
    for locale in LOCALES:
        for entry in catalogues[locale]["tracks"]:
            path = stage / locale / f"{entry['id']}.mp3"
            if not path.is_file() or sha256(path.read_bytes()) != entry["audioSha256"] or _audio_report(path) != entry["format"]:
                raise RuntimeError(f"Staged audio failed final hash/decode verification: {locale}/{entry['id']}")


def _finalize(tracks: list[dict[str, Any]], revisions: dict[str, str], ledger: dict[str, Any]) -> None:
    ledger = _load_ledger(tracks, revisions, ledger["preflight"], create=False)
    if len(ledger.get("tracks", {})) != 56 or any(entry.get("status") != "completed" for entry in ledger["tracks"].values()):
        raise RuntimeError("Finalization requires all 56 fully audited tracks")
    if any(not entry.get("costDecision") or entry["characterCost"] > entry["reservedCredits"] for entry in ledger["tracks"].values()):
        raise RuntimeError("Finalization requires account-reconciled costs within each reservation")
    if not ledger.get("checkpoint", {}).get("verified"):
        raise RuntimeError("Finalization requires a verified two-caption billing checkpoint")
    if not ledger.get("closingAccount"):
        raise RuntimeError("Finalization requires a reconciled closing account balance")
    if _risk_credits(ledger) > BUDGET or sum(entry["characters"] for entry in tracks) != 24_768:
        raise RuntimeError("Final project character budget did not match the frozen inventory")
    if protected_asset_hashes() != ledger["protectedAssets"]:
        raise RuntimeError("Existing voice assets changed during generation")
    catalogues = {locale: {"datasetRevision": revisions[locale], "tracks": _manifest_entries(locale, tracks, ledger, revisions[locale])} for locale in LOCALES}
    if OUTPUT.exists():
        raise FileExistsError(f"Refusing to overwrite existing output: {OUTPUT}")
    manifest = {
        "schemaVersion": 1, "scope": COLLECTION, "sourceStatus": "source-only",
        "status": "provisional", "humanApproved": False, "selectedForShipping": False,
        "settings": SETTINGS, "model": MODEL, "outputFormat": OUTPUT_FORMAT,
        "budgetCredits": BUDGET, "observedCredits": _completed_cost(ledger),
        "initialAccountCharacterCount": ledger["initialCharacterCount"],
        "protectedAssetCount": len(ledger["protectedAssets"]),
        "protectedAssetSetSha256": _fingerprint(ledger["protectedAssets"]),
        "protectedAssetHashes": ledger["protectedAssets"],
        "checkpoint": ledger["checkpoint"], "closingAccount": ledger["closingAccount"],
        "counts": {"en": 28, "vi": 28, "total": 56}, "catalogues": catalogues,
    }
    stage = Path(tempfile.mkdtemp(prefix="three-lenses-elevenlabs-", dir=ASSET_ROOT))
    try:
        for locale in LOCALES:
            for entry in catalogues[locale]["tracks"]:
                source = _cache_path(locale, entry["id"])
                target = stage / locale / f"{entry['id']}.mp3"
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(source, target)
        _verify_staged_audio(catalogues, stage)
        (stage / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        catalog_text = _catalog_source(catalogues)
        temporary_catalog = CATALOG.with_suffix(".ts.tmp")
        temporary_catalog.write_text(catalog_text, encoding="utf-8", newline="\n")
        os.replace(stage, OUTPUT)
        os.replace(temporary_catalog, CATALOG)
    except Exception:
        if stage.exists():
            shutil.rmtree(stage)
        raise


def _render_remaining(api_key: str, tracks: list[dict[str, Any]], revisions: dict[str, str], preflight: dict[str, Any]) -> None:
    ledger = _load_ledger(tracks, revisions, preflight, create=False, allow_cost_reconcile=True)
    if not ledger.get("checkpoint", {}).get("verified"):
        raise RuntimeError("The two-caption billing checkpoint has not been verified")
    _reconcile_account_costs(ledger, _wait_for_account_delta(ledger, api_key))
    since_reconcile = 0
    for row in tracks:
        if row not in _checkpoint_tracks(tracks):
            key = f"{row['locale']}/{row['id']}"
            new_request = key not in ledger["tracks"]
            _render_track(row, ledger, api_key, tracks)
            if new_request:
                since_reconcile += 1
                if since_reconcile == 8:
                    _reconcile_account_costs(ledger, _wait_for_account_delta(ledger, api_key))
                    since_reconcile = 0
    after = _wait_for_account_delta(ledger, api_key)
    _reconcile_account_costs(ledger, after)
    ledger["closingAccount"] = {**_account_snapshot(after), "observedAtUtc": datetime.now(timezone.utc).isoformat()}
    _save_ledger(ledger)
    _finalize(tracks, revisions, ledger)


def _valid_cost_decision(decision: Any, cost: int, reserved: int, initial_count: int) -> bool:
    if not isinstance(decision, dict):
        return False
    account_count = decision.get("accountCharacterCount")
    account_delta = decision.get("accountDeltaFromBaseline")
    return (decision.get("priorStatus") in ("pending_cost_reconcile", "cost_mismatch", "invalid")
            and decision.get("disposition") == ("accepted_discount" if cost < reserved else "exact")
            and decision.get("reservedCredits") == reserved
            and decision.get("observedCharacterCost") == cost
            and isinstance(account_count, int) and not isinstance(account_count, bool)
            and isinstance(account_delta, int) and not isinstance(account_delta, bool)
            and account_count - initial_count == account_delta)


def audit() -> None:
    tracks, revisions = track_specs()
    if not OUTPUT.is_dir() or not (OUTPUT / "manifest.json").is_file():
        raise FileNotFoundError("The ElevenLabs output collection is not installed")
    manifest = json.loads((OUTPUT / "manifest.json").read_text(encoding="utf-8"))
    if (manifest.get("schemaVersion") != 1 or manifest.get("scope") != COLLECTION
            or manifest.get("sourceStatus") != "source-only" or manifest.get("status") != "provisional"
            or manifest.get("humanApproved") is not False or manifest.get("selectedForShipping") is not False
            or manifest.get("settings") != SETTINGS or manifest.get("model") != MODEL
            or manifest.get("outputFormat") != OUTPUT_FORMAT or manifest.get("budgetCredits") != BUDGET
            or manifest.get("counts") != {"en": 28, "vi": 28, "total": 56}):
        raise ValueError("Installed ElevenLabs manifest has invalid scope or counts")
    protected = manifest.get("protectedAssetHashes")
    actual_protected = protected_asset_hashes()
    if (not isinstance(protected, dict) or len(protected) != manifest.get("protectedAssetCount")
            or manifest.get("protectedAssetSetSha256") != _fingerprint(protected)
            or any(actual_protected.get(path) != digest for path, digest in protected.items())):
        raise ValueError("A protected pre-existing voice asset is missing or changed")
    checkpoint = manifest.get("checkpoint", {})
    closing = manifest.get("closingAccount", {})
    initial_count = manifest.get("initialAccountCharacterCount")
    closing_count = closing.get("characterCount")
    closing_limit = closing.get("characterLimit")
    if (not isinstance(initial_count, int) or isinstance(initial_count, bool) or initial_count < 0
            or not closing.get("observedAtUtc")
            or closing.get("tier") != "starter" or closing.get("canExtendCharacterLimit") is not False
            or not isinstance(closing_count, int) or isinstance(closing_count, bool)
            or not isinstance(closing_limit, int) or isinstance(closing_limit, bool)
            or closing.get("remainingCredits") != closing_limit - closing_count
            or not checkpoint.get("verified") or checkpoint.get("trackCount") != 2
            or not isinstance(checkpoint.get("costDecisions"), dict)
            or set(checkpoint["costDecisions"]) != {"en/oldquarter-bach-ma-caption", "vi/oldquarter-bach-ma-caption"}):
        raise ValueError("Installed account or two-caption checkpoint evidence is incomplete")
    expected_catalog = _catalog_source(manifest["catalogues"])
    if CATALOG.read_text(encoding="utf-8") != expected_catalog:
        raise ValueError("Installed static voice catalogue differs from the manifest")
    count = 0
    total_cost = 0
    manifest_entries = {}
    by_key = {f"{row['locale']}/{row['id']}": row for row in tracks}
    for locale in LOCALES:
        entries = manifest["catalogues"][locale]["tracks"]
        if len(entries) != 28 or manifest["catalogues"][locale].get("datasetRevision") != revisions[locale]:
            raise ValueError(f"Installed {locale} catalogue revision/count mismatch")
        by_id = {row["id"]: row for row in tracks if row["locale"] == locale}
        for entry in entries:
            row = by_id.pop(entry.get("id"), None)
            expected_path = f"mobile/assets/voice/three-lenses-elevenlabs/{locale}/{row['id']}.mp3" if row else None
            expected_name = "Thắm" if locale == "vi" else "Talia"
            if (not row or entry.get("sourceTextSha256") != row["textSha256"]
                    or entry.get("spokenTextSha256") != row["spokenTextSha256"]
                    or entry.get("sourceDataSha256") != row["sourceDataSha256"]
                    or entry.get("collectionId") != COLLECTION or entry.get("locale") != locale
                    or entry.get("source") != row["source"] or entry.get("textHash") != row["textSha256"]
                    or entry.get("datasetRevision") != row["datasetRevision"]
                    or entry.get("kind") != row["kind"] or entry.get("nodeId") != row["nodeId"]
                    or entry.get("characters") != row["characters"] or not isinstance(entry.get("characterCost"), int)
                    or isinstance(entry.get("characterCost"), bool)
                    or entry["characterCost"] < 0 or entry["characterCost"] > row["characters"]
                    or entry.get("voiceId") != row["voiceId"] or entry.get("model") != MODEL
                    or entry.get("voiceName") != expected_name
                    or entry.get("settings") != SETTINGS or entry.get("voiceRate") != 1.0
                    or entry.get("outputFormat") != OUTPUT_FORMAT
                    or (entry.get("requestId") is not None and not isinstance(entry.get("requestId"), str))
                    or entry.get("path") != expected_path or entry.get("fullDecode") is not True
                    or entry.get("humanApproved") is not False or entry.get("sourceOnly") is not True
                    or not _valid_cost_decision(entry.get("costDecision"), entry["characterCost"], row["characters"], initial_count)):
                raise ValueError(f"Installed source identity/hash mismatch: {locale}/{entry.get('id')}")
            path = OUTPUT / locale / f"{row['id']}.mp3"
            if not path.is_file() or sha256(path.read_bytes()) != entry.get("audioSha256"):
                raise ValueError(f"Installed audio hash mismatch: {locale}/{row['id']}")
            info = _audio_report(path)
            if (info != entry.get("format") or entry.get("durationSeconds") != info["durationSeconds"]
                    or info.get("container") != "mp3" or info.get("sampleRateHz") != 44_100
                    or info.get("bitrateKbps") != 128):
                raise ValueError(f"Installed audio decode/format mismatch: {locale}/{row['id']}")
            total_cost += entry["characterCost"]
            manifest_entries[f"{locale}/{row['id']}"] = entry
            count += 1
        if by_id:
            raise ValueError(f"Missing installed {locale} track identities")
    checkpoint_estimate = 0
    checkpoint_cost = 0
    for key, decision in checkpoint["costDecisions"].items():
        entry = manifest_entries.get(key)
        row = by_key.get(key)
        cost = decision.get("observedCharacterCost") if isinstance(decision, dict) else None
        if (not entry or not row or entry.get("costDecision") != decision
                or not isinstance(cost, int) or isinstance(cost, bool)
                or not _valid_cost_decision(decision, cost, row["characters"], initial_count)):
            raise ValueError("Installed caption checkpoint account evidence is inconsistent")
        checkpoint_estimate += row["characters"]
        checkpoint_cost += cost
    if (checkpoint.get("estimatedCredits") != checkpoint_estimate
            or checkpoint.get("observedCharacterCost") != checkpoint_cost
            or checkpoint.get("accountDelta") != checkpoint_cost
            or closing_count - initial_count != total_cost
            or total_cost != manifest.get("observedCredits") or total_cost > BUDGET):
        raise ValueError("Installed total cost or closing account delta failed")
    print(f"Audio audit passed: {count}/56 MP3s decode, source hashes and catalogue match; "
          f"account delta={total_cost}, remaining={closing['remainingCredits']}; humanApproved=false")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", nargs="?", choices=("dry-run", "render-checkpoint", "render-remaining", "audit"), default="dry-run")
    action = parser.parse_args().action
    if action == "dry-run":
        print(json.dumps(dry_run(), ensure_ascii=False, indent=2))
        return
    if action == "audit":
        audit()
        return
    tracks, revisions = track_specs()
    api_key = _load_api_key()
    preflight = _preflight(api_key)
    if action == "render-checkpoint":
        _run_checkpoint(api_key, tracks, revisions, preflight)
        print("Verified exactly two paid caption tracks; checkpoint matches account delta and character-cost headers")
    elif action == "render-remaining":
        _render_remaining(api_key, tracks, revisions, preflight)
        print("Rendered and audited the 56-track provisional ElevenLabs collection; humanApproved=false")


if __name__ == "__main__":
    main()
