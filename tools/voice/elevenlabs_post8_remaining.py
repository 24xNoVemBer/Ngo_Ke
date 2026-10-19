"""Render the active fiction-letter and old-quarter-pilot ElevenLabs catalogues."""

from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.util
import json
import os
import re
import shutil
import sys
import tempfile
import time
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
TOOLS = ROOT / "tools" / "voice"
sys.path.insert(0, str(TOOLS))

import post8_firstpoint
import post8_remaining

_engine_spec = importlib.util.spec_from_file_location("_post8_elevenlabs_engine", TOOLS / "elevenlabs_three_lenses.py")
if _engine_spec is None or _engine_spec.loader is None:
    raise ImportError("Could not load the shared ElevenLabs renderer")
engine = importlib.util.module_from_spec(_engine_spec)
sys.modules[_engine_spec.name] = engine
_engine_spec.loader.exec_module(engine)

PROJECT_BUDGET = 30_000
PRIOR_PROJECT_SPEND = 9_909
BUDGET = PROJECT_BUDGET - PRIOR_PROJECT_SPEND
SCOPE = "fiction-letter+old-quarter-pilot"
OUTPUT = ROOT / "mobile" / "assets" / "voice" / "post8" / "remaining-elevenlabs"
CACHE = TOOLS / ".cache" / "post8-remaining-elevenlabs"
LEDGER = CACHE / "ledger.json"
SOURCES = {
    ("fiction-letter", "en"): post8_remaining.FICTION,
    ("fiction-letter", "vi"): post8_remaining.FICTION_VI,
    ("old-quarter-pilot", "en"): post8_remaining.PILOT["en"],
    ("old-quarter-pilot", "vi"): post8_remaining.PILOT["vi"],
}
EXISTING_56_SOURCES = (
    ROOT / "data" / "journeys" / "three-lenses.en.json",
    ROOT / "data" / "journeys" / "three-lenses.vi.json",
    ROOT / "data" / "localized" / "three-lenses.en.json",
    ROOT / "data" / "localized" / "three-lenses.vi.json",
)
CATALOGUES = {
    "catalog.ts": ROOT / "mobile" / "src" / "voice" / "catalog.ts",
    "post8Catalog.ts": ROOT / "mobile" / "src" / "voice" / "post8Catalog.ts",
    "post8RemainingCatalog.ts": ROOT / "mobile" / "src" / "voice" / "post8RemainingCatalog.ts",
}
UNCHANGED_CATALOGUES = {
    "threeLensesCatalog.ts": ROOT / "mobile" / "src" / "voice" / "threeLensesCatalog.ts",
}
W1_APPROVAL_REFERENCES: list[str] = []
RECOVERY_DECISION_ID = "msg_818b36961501"
RECOVERY_TRACK_KEY = "vi/fiction-letter--qa-huong-answer"
RECOVERY_TEXT_SHA256 = "40165ee16ebcb5b4295d9133a7ece5a458739f1be51b37ed5bdb15b372a017f7"
RECOVERY_ACCOUNT_OBSERVATIONS = [
    {"observedAtUnix": 1792397462.594, "characterCount": 17427, "characterLimit": 40000,
     "overageEnabled": False, "knownHeaderCost": 7518, "accountDeltaFromBaseline": 7518,
     "sourceMessageId": "msg_7f3456d43c09"},
    {"observedAtUnix": 1792397542.828, "characterCount": 17427, "characterLimit": 40000,
     "overageEnabled": False, "knownHeaderCost": 7518, "accountDeltaFromBaseline": 7518,
     "sourceMessageId": RECOVERY_DECISION_ID},
    {"observedAtUnix": 1792397929.344, "characterCount": 17427, "characterLimit": 40000,
     "overageEnabled": False, "knownHeaderCost": 7518, "accountDeltaFromBaseline": 7518,
     "sourceMessageId": "msg_f5f5507d5011"},
]
RECOVERY_HISTORY_EVIDENCE = {
    "observations": [
        {"sourceMessageId": "msg_7f3456d43c09", "method": "GET /v1/history", "pageSize": 100,
         "voiceId": "0ggMuQ1r9f9jqBu50nJn", "model": "eleven_v4", "source": "TTS",
         "itemCount": 100, "oldestUnix": 1792389734, "newestUnix": 1792397169,
         "hasMore": True, "attemptAtUtc": "2026-10-19T08:06:44Z",
         "matchingAvailability": "unavailable; provider history redacts text and voice_id",
         "exactTextVoiceModelMatches": None},
        {"sourceMessageId": "msg_f5f5507d5011", "method": "GET /v1/history (2 pages)", "pageSize": 100,
         "voiceId": "0ggMuQ1r9f9jqBu50nJn", "model": "eleven_v4", "source": "TTS",
         "itemCount": 131, "uniqueItemCount": 131, "oldestUnix": 1792387691,
         "newestUnix": 1792397169, "hasMore": False,
         "matchingAvailability": "unavailable; provider history redacts text and voice_id",
         "exactTextVoiceModelMatches": None,
         "itemsAccountedFor": {"accepted56": 56, "newTracks75": 75}},
    ],
    "fullRequestIdReconciliation": {
        "sourceMessageId": "msg_1cea921f9629", "historyItemCount": 156,
        "manifestRequestCount": 156, "requestIdSetMatches": True,
        "missingRequestIds": 0, "extraRequestIds": 0, "allRequestCostsFromToMatch": True,
        "model": "eleven_v4", "outputFormat": "mp3_44100_128", "matchedCostsSum": 20122,
        "recoveredRequest": {
            "requestId": "ZgNqTlY7m3jNCfV5TCgs", "historyItemId": "7O7zEADMwTa0TALHG5EY",
            "characterCountFrom": 17427, "characterCountTo": 17499, "characterCost": 72,
            "model": "eleven_v4", "outputFormat": "mp3_44100_128",
            "textAndVoiceAvailability": "unavailable; provider history redacts text and voice_id",
        },
    },
}
LICENSE_PROVENANCE = {
    "provider": "ElevenLabs",
    "service": "Text-to-Speech API",
    "model": "eleven_v4",
    "termsUrl": "https://elevenlabs.io/terms-of-use",
    "termsLastUpdated": "2026-10-09",
    "regionApplicability": "not independently verified",
    "observedAccountTier": "starter",
    "redistributionLicenseAsserted": False,
    "rightsClearance": "not independently verified",
    "noticePath": "mobile/assets/voice/post8/remaining-elevenlabs/LICENSES.md",
    "noticeSha256": "bdc1f2dcf9050d37b9bdf0cf967320b7dab8a41ad48bf9b8520783741849cf7b",
}


def _canonical_notice_sha256(text: str) -> str:
    normalized = text.replace("\r\n", "\n").replace("\r", "\n")
    return engine.sha256(normalized.encode("utf-8"))


def _file_hash(path: Path) -> str:
    return engine.sha256(path.read_bytes())


def _catalogue_hashes() -> dict[str, str]:
    return {name: _file_hash(path) for name, path in CATALOGUES.items()}


def _unchanged_catalogue_hashes() -> dict[str, str]:
    return {name: _file_hash(path) for name, path in UNCHANGED_CATALOGUES.items()}


def _protected_file_hashes() -> dict[str, str]:
    files: dict[str, str] = {}
    voice_root = ROOT / "mobile" / "assets" / "voice"
    for path in voice_root.rglob("*"):
        if path.is_file() and path != OUTPUT and OUTPUT not in path.parents:
            files[path.relative_to(ROOT).as_posix()] = _file_hash(path)
    for path in (*SOURCES.values(), *EXISTING_56_SOURCES):
        files[path.relative_to(ROOT).as_posix()] = _file_hash(path)
    return files


def _fiction_vi_rows(dataset: dict[str, Any]) -> list[dict[str, str]]:
    if dataset.get("schemaVersion") != 1 or len(dataset.get("nodes", [])) != 6 or len(dataset.get("qa", [])) != 21:
        raise ValueError("Expected the current Vietnamese fiction-letter source")
    rows = [{"id": "intro", "kind": "intro", "text": post8_remaining._checked_text(dataset.get("intro", {}).get("text"), "intro")}]
    node_ids = {node.get("id") for node in dataset["nodes"]}
    if len(node_ids) != 6 or None in node_ids:
        raise ValueError("Vietnamese fiction node IDs must be unique")
    for node in dataset["nodes"]:
        node_id = node["id"]
        rows.extend((
            {"id": f"{node_id}-story", "kind": "story", "nodeId": node_id,
             "text": post8_remaining._checked_text(node.get("story"), f"{node_id}/story")},
            {"id": f"{node_id}-caption", "kind": "caption", "nodeId": node_id,
             "text": post8_remaining._checked_text(node.get("caption"), f"{node_id}/caption")},
        ))
    for answer in dataset["qa"]:
        if answer.get("nodeId") not in node_ids:
            raise ValueError("Vietnamese fiction answer references an unknown node")
        rows.append({"id": f"{answer['id']}-answer", "kind": "answer", "nodeId": answer["nodeId"],
                     "text": post8_remaining._checked_text(answer.get("answer"), f"{answer.get('id')}/answer")})
    if len(rows) != 34 or len({row["id"] for row in rows}) != 34:
        raise ValueError("Expected 34 unique Vietnamese fiction-letter tracks")
    return rows


def track_specs() -> tuple[list[dict[str, Any]], dict[str, str]]:
    revisions = post8_remaining.dataset_revisions()
    tracks: list[dict[str, Any]] = []
    for locale in ("en", "vi"):
        fiction_path = SOURCES[("fiction-letter", locale)]
        fiction_bytes = fiction_path.read_bytes()
        fiction_data = json.loads(fiction_bytes)
        fiction_rows = (post8_remaining.fiction_rows(fiction_data) if locale == "en"
                        else _fiction_vi_rows(fiction_data))
        pilot_path = SOURCES[("old-quarter-pilot", locale)]
        pilot_bytes = pilot_path.read_bytes()
        pilot_data = json.loads(pilot_bytes)
        pilot_rows = post8_firstpoint.track_rows(pilot_data) + post8_remaining.remaining_pilot_rows(pilot_data)
        for collection, source, source_bytes, rows in (
            ("fiction-letter", fiction_path, fiction_bytes, fiction_rows),
            ("old-quarter-pilot", pilot_path, pilot_bytes, pilot_rows),
        ):
            revision = revisions[collection][locale]
            for source_row in rows:
                content_id = source_row["id"]
                text = source_row["text"]
                text_hash = engine.sha256(text.encode("utf-8"))
                tracks.append({
                    "collectionId": collection,
                    "locale": locale,
                    "id": f"{collection}--{content_id}",
                    "contentId": content_id,
                    "kind": source_row["kind"],
                    "nodeId": source_row.get("nodeId"),
                    "source": source.relative_to(ROOT).as_posix(),
                    "sourceDataSha256": engine.sha256(source_bytes),
                    "datasetRevision": revision,
                    "text": text,
                    "textSha256": text_hash,
                    "spokenTextSha256": text_hash,
                    "characters": len(text),
                    "voiceId": engine.VOICE_IDS[locale],
                })
    keys = {(row["collectionId"], row["locale"], row["contentId"]) for row in tracks}
    if len(tracks) != 100 or len(keys) != 100:
        raise ValueError("Expected exactly 100 unique active fiction-letter and pilot tracks")
    if Counter(row["locale"] for row in tracks) != {"en": 50, "vi": 50}:
        raise ValueError("Expected 50 active tracks per locale")
    if any(not row["text"].strip() or row["characters"] > engine.MAX_MODEL_CHARACTERS for row in tracks):
        raise ValueError("Source text is empty or exceeds the frozen model request limit")
    flat_revisions = {f"{collection}/{locale}": revision
                      for collection, locale_map in revisions.items() for locale, revision in locale_map.items()}
    return tracks, flat_revisions


def run_config(revisions: dict[str, str]) -> dict[str, Any]:
    return {
        "scope": SCOPE,
        "model": engine.MODEL,
        "outputFormat": engine.OUTPUT_FORMAT,
        "settings": engine.SETTINGS,
        "voices": engine.VOICE_IDS,
        "voiceRate": 1.0,
        "datasetRevisions": revisions,
        "projectBudgetCredits": PROJECT_BUDGET,
        "priorProjectSpendCredits": PRIOR_PROJECT_SPEND,
        "budgetCredits": BUDGET,
        "protectedFilesFingerprint": engine._fingerprint(_protected_file_hashes()),
        "catalogueHashesBeforeInstall": _catalogue_hashes(),
        "unchangedCatalogueHashes": _unchanged_catalogue_hashes(),
        "humanApproved": False,
        "sourceOnly": True,
    }


def _ledger_payload(tracks: list[dict[str, Any]], revisions: dict[str, str], preflight: dict[str, Any]) -> dict[str, Any]:
    payload = _original_ledger_payload(tracks, revisions, preflight)
    payload["protectedFiles"] = _protected_file_hashes()
    payload["catalogueHashesBeforeInstall"] = _catalogue_hashes()
    payload["unchangedCatalogueHashes"] = _unchanged_catalogue_hashes()
    payload["w1ApprovalReferences"] = list(W1_APPROVAL_REFERENCES)
    return payload


_original_ledger_payload = engine._ledger_payload
_original_engine_risk_credits = engine._risk_credits


def _risk_credits(ledger: dict[str, Any]) -> int:
    recovery = ledger.get("recoveryEvidence")
    retained_unknown = 0
    if isinstance(recovery, dict) and recovery.get("riskReserveStatus") == "pending_until_closing_reconciliation":
        retained_unknown = recovery.get("originalRiskReserveCredits", 0)
        if retained_unknown != 180:
            raise RuntimeError("Recovery history reserve differs from the original unknown attempt")
    return _original_engine_risk_credits(ledger) + retained_unknown


def _journal_recovery(ledger: dict[str, Any], row: dict[str, Any], approval: str) -> dict[str, Any]:
    key = f"{row['locale']}/{row['id']}"
    if (approval != RECOVERY_DECISION_ID or key != RECOVERY_TRACK_KEY
            or row.get("contentId") != "qa-huong-answer" or row.get("characters") != 180
            or row.get("textSha256") != RECOVERY_TEXT_SHA256
            or row.get("voiceId") != engine.VOICE_IDS["vi"]):
        raise ValueError("W1's one-time recovery authorization only covers the verified Vietnamese qa-huong-answer track")
    if ledger.get("recoveryEvidence") is not None:
        raise RuntimeError("The one-time authorized recovery has already been journaled; refusing another retry")
    original = ledger.get("tracks", {}).get(key)
    if (not isinstance(original, dict) or original.get("status") != "unknown"
            or original.get("reservedCredits") != 180 or original.get("characterCost") is not None
            or original.get("sourceTextSha256") != RECOVERY_TEXT_SHA256
            or original.get("spokenTextSha256") != RECOVERY_TEXT_SHA256
            or original.get("requestId") is not None or original.get("audioSha256") is not None):
        raise RuntimeError("The original unknown attempt no longer matches W1's recovery evidence")
    statuses = Counter(entry.get("status") for entry in ledger.get("tracks", {}).values())
    if len(ledger.get("tracks", {})) != 76 or statuses != Counter({"completed": 75, "unknown": 1}):
        raise RuntimeError("Recovery requires the verified 75 completed tracks and exactly one unknown attempt")
    evidence = {
        "decisionId": RECOVERY_DECISION_ID,
        "scope": "one explicit retry of vi/fiction-letter/qa-huong-answer",
        "sourceTextSha256": RECOVERY_TEXT_SHA256,
        "accountObservations": copy.deepcopy(RECOVERY_ACCOUNT_OBSERVATIONS),
        "historyEvidence": copy.deepcopy(RECOVERY_HISTORY_EVIDENCE),
        "originalUnknownAttempt": copy.deepcopy(original),
        "originalRiskReserveCredits": original["reservedCredits"],
        "riskReserveStatus": "pending_until_closing_reconciliation",
        "retry": {"ordinal": 1, "status": "authorized"},
    }
    ledger["recoveryEvidence"] = evidence
    del ledger["tracks"][key]
    refs = ledger.setdefault("w1ApprovalReferences", [])
    if RECOVERY_DECISION_ID not in refs:
        refs.append(RECOVERY_DECISION_ID)
    return evidence


def _validate_recovery_before_resume(ledger: dict[str, Any]) -> None:
    evidence = ledger.get("recoveryEvidence")
    if evidence is None:
        return
    key = RECOVERY_TRACK_KEY
    entry = ledger.get("tracks", {}).get(key, {})
    if (evidence.get("decisionId") != RECOVERY_DECISION_ID
            or evidence.get("retry", {}).get("ordinal") != 1
            or evidence.get("retry", {}).get("status") not in ("pending_cost_reconcile", "completed")
            or entry.get("status") not in ("pending_cost_reconcile", "completed")):
        raise RuntimeError("The single recovery attempt is unresolved; refusing further paid rendering")


def _resolve_recovery_at_close(ledger: dict[str, Any]) -> None:
    evidence = ledger.get("recoveryEvidence")
    if evidence is None:
        return
    entry = ledger.get("tracks", {}).get(RECOVERY_TRACK_KEY, {})
    closing = ledger.get("closingAccount", {})
    count = closing.get("characterCount")
    initial = ledger.get("initialCharacterCount")
    known_cost = engine._completed_cost(ledger)
    if (entry.get("status") != "completed" or evidence.get("riskReserveStatus") != "pending_until_closing_reconciliation"
            or not isinstance(count, int) or isinstance(count, bool) or count - initial != known_cost
            or known_cost != closing.get("characterCount", -1) - initial):
        raise RuntimeError("Recovery history reserve remains open until exact closing account reconciliation")
    evidence["retry"].update({
        "status": "completed", "requestId": entry.get("requestId"),
        "historyItemId": RECOVERY_HISTORY_EVIDENCE["fullRequestIdReconciliation"]["recoveredRequest"]["historyItemId"],
        "audioSha256": entry.get("audioSha256"), "characterCost": entry.get("characterCost"),
        "costDecision": entry.get("costDecision"),
    })
    evidence["riskReserveStatus"] = "resolved_no_charge"
    evidence["resolution"] = {
        "observedAtUtc": closing.get("observedAtUtc"),
        "accountCharacterCount": count,
        "accountDeltaFromBaseline": count - initial,
        "knownHeaderAndReconciledCosts": known_cost,
        "originalUnknownAttemptCost": 0,
    }
    engine._save_ledger(ledger)


def dry_run() -> dict[str, Any]:
    tracks, revisions = track_specs()
    counts = {collection: {locale: sum(row["collectionId"] == collection and row["locale"] == locale for row in tracks)
                           for locale in ("en", "vi")}
              for collection in ("fiction-letter", "old-quarter-pilot")}
    characters = {locale: sum(row["characters"] for row in tracks if row["locale"] == locale)
                  for locale in ("en", "vi")}
    raw_reserve = sum(row["characters"] for row in tracks)
    protected_assets = engine.protected_asset_hashes()
    protected_files = _protected_file_hashes()
    return {
        "mode": "dry-run; no network or paid calls",
        "scope": SCOPE,
        "model": engine.MODEL,
        "outputFormat": engine.OUTPUT_FORMAT,
        "settings": engine.SETTINGS,
        "voiceIds": engine.VOICE_IDS,
        "trackCounts": counts,
        "localeTrackCounts": {locale: sum(row["locale"] == locale for row in tracks) for locale in ("en", "vi")},
        "characters": characters,
        "totalTracks": len(tracks),
        "totalCharacters": raw_reserve,
        "reserveCreditsAtOneCreditPerCharacter": raw_reserve,
        "projectBudgetCredits": PROJECT_BUDGET,
        "priorProjectSpendCredits": PRIOR_PROJECT_SPEND,
        "budgetCredits": BUDGET,
        "budgetHeadroomAfterFullReserve": BUDGET - raw_reserve,
        "reserveDeficitCredits": max(0, raw_reserve - BUDGET),
        "fullReserveFitsProjectBudget": raw_reserve <= BUDGET,
        "datasetRevisions": revisions,
        "protectedAudioCount": len(protected_assets),
        "protectedMp3Count": sum(path.lower().endswith(".mp3") for path in protected_assets),
        "protectedAssetSetSha256": engine._fingerprint(protected_assets),
        "protectedAssetHashes": protected_assets,
        "protectedVoiceAndSourceFileCount": len(protected_files),
        "protectedFilesSetSha256": engine._fingerprint(protected_files),
        "protectedVoiceAndSourceFileHashes": protected_files,
        "catalogueHashesBeforeInstall": _catalogue_hashes(),
        "unchangedCatalogueHashes": _unchanged_catalogue_hashes(),
        "trackInventory": [{key: row[key] for key in (
            "collectionId", "locale", "contentId", "kind", "nodeId", "source", "sourceDataSha256",
            "datasetRevision", "textSha256", "characters", "voiceId")}
            for row in tracks],
    }


def read_only_preflight() -> dict[str, Any]:
    preflight = engine._preflight(engine._load_api_key())
    tracks, _ = track_specs()
    checkpoints = _checkpoint_tracks(tracks)
    checkpoint_reserve = sum(row["characters"] for row in checkpoints)
    remaining = preflight["remainingCredits"]
    return {
        "readOnly": True,
        "account": preflight,
        "projectBudgetCredits": PROJECT_BUDGET,
        "priorProjectSpendCredits": PRIOR_PROJECT_SPEND,
        "newRunBudgetCredits": BUDGET,
        "fullReserveCredits": sum(row["characters"] for row in tracks),
        "fullReserveFitsNewRunBudget": sum(row["characters"] for row in tracks) <= BUDGET,
        "checkpointReserveCredits": checkpoint_reserve,
        "accountCanCoverCheckpointReserve": remaining >= checkpoint_reserve,
        "noPaidPostPerformed": True,
    }


def _checkpoint_tracks(tracks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [row for row in tracks if row["kind"] == "caption" and row["nodeId"] == "oldquarter-bach-ma"]


def recover_unknown_once(approval: str, tracks: list[dict[str, Any]], revisions: dict[str, str],
                        preflight: dict[str, Any], api_key: str) -> None:
    if approval != RECOVERY_DECISION_ID:
        raise ValueError("Recovery requires W1's exact one-time authorization message ID")
    row = next((row for row in tracks if f"{row['locale']}/{row['id']}" == RECOVERY_TRACK_KEY), None)
    if row is None or OUTPUT.exists() or not LEDGER.is_file():
        raise RuntimeError("The authorized recovery track, output state, or ledger differs from the reviewed run")
    ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
    expected = _ledger_payload(tracks, revisions, ledger.get("preflight", preflight))
    if (ledger.get("runFingerprint") != expected["runFingerprint"] or ledger.get("config") != expected["config"]
            or ledger.get("initialCharacterCount") != 9909
            or ledger.get("protectedAssets") != expected["protectedAssets"]
            or ledger.get("protectedFiles") != expected["protectedFiles"]
            or ledger.get("catalogueHashesBeforeInstall") != _catalogue_hashes()
            or ledger.get("unchangedCatalogueHashes") != _unchanged_catalogue_hashes()
            or not ledger.get("checkpoint", {}).get("verified")):
        raise RuntimeError("Source, budget, protected files, or checkpoint changed; recovery is not safe")
    copied_tracks = copy.deepcopy(ledger["tracks"])
    copied_tracks.pop(RECOVERY_TRACK_KEY, None)
    known_cost = engine._known_cost_total({**ledger, "tracks": copied_tracks}, tracks)
    if known_cost != 7518 or preflight.get("characterCount") != 17427 or preflight.get("characterLimit") != 40000:
        raise RuntimeError("Account usage no longer matches W1's two no-charge observations")
    subscription = engine._read_subscription(api_key, time.monotonic() + engine.ACCOUNT_SETTLEMENT_TIMEOUT)
    count, limit, _ = engine._account_safety(subscription, row["characters"])
    if count != 17427 or limit != 40000 or count - ledger["initialCharacterCount"] != known_cost:
        raise RuntimeError("Fresh account evidence differs from W1's no-charge observations; recovery stopped")
    if _risk_credits(ledger) + row["characters"] > BUDGET:
        raise RuntimeError("The one-time recovery request would exceed the approved run budget")

    evidence = _journal_recovery(ledger, row, approval)
    engine._save_ledger(ledger)
    evidence["retry"].update({"status": "started", "startedAtUtc": datetime.now(timezone.utc).isoformat()})
    engine._save_ledger(ledger)
    try:
        engine._render_track(row, ledger, api_key, tracks)
    except Exception as error:
        attempt = ledger.get("tracks", {}).get(RECOVERY_TRACK_KEY, {})
        evidence["retry"].update({"status": attempt.get("status", "no_track_entry"),
                                  "errorType": type(error).__name__})
        engine._save_ledger(ledger)
        raise
    attempt = ledger["tracks"][RECOVERY_TRACK_KEY]
    if attempt.get("status") != "pending_cost_reconcile":
        raise RuntimeError("The single recovery request did not produce a cost-reconcilable track")
    evidence["retry"].update({
        "status": "pending_cost_reconcile", "requestId": attempt.get("requestId"),
        "audioSha256": attempt.get("audioSha256"), "characterCost": attempt.get("characterCost"),
        "reservedCredits": attempt.get("reservedCredits"),
    })
    engine._save_ledger(ledger)
    print("One W1-authorized recovery POST returned validated audio; original unknown and 180-credit risk remain journaled")


def _catalogue_for(row: dict[str, Any]) -> Path:
    if row["collectionId"] == "fiction-letter" and row["locale"] == "vi":
        return CATALOGUES["catalog.ts"]
    if row["collectionId"] == "old-quarter-pilot" and (row["kind"] == "intro" or row["nodeId"] == "oldquarter-bach-ma"):
        return CATALOGUES["post8Catalog.ts"]
    return CATALOGUES["post8RemainingCatalog.ts"]


def _old_audio_path(row: dict[str, Any], catalogue: Path) -> str:
    content_id = row["contentId"]
    if catalogue == CATALOGUES["catalog.ts"]:
        return f"../../assets/voice/{content_id}.mp3"
    if catalogue == CATALOGUES["post8Catalog.ts"]:
        return f"../../assets/voice/post8/old-quarter-pilot/{row['locale']}/{content_id}.mp3"
    return f"../../assets/voice/post8/remaining/{row['collectionId']}/{row['locale']}/{content_id}.mp3"


def _new_audio_path(row: dict[str, Any]) -> str:
    return f"../../assets/voice/post8/remaining-elevenlabs/{row['collectionId']}/{row['locale']}/{row['contentId']}.mp3"


def _patch_catalogue_text(text: str, filename: str, rows: list[dict[str, Any]], durations: dict[str, float]) -> str:
    output = text.splitlines(keepends=True)
    changed = 0
    for row in rows:
        catalogue = _catalogue_for(row)
        if catalogue.name != filename:
            continue
        content_id = row["contentId"]
        key = json.dumps(content_id, ensure_ascii=False) + ": { id: " + json.dumps(content_id, ensure_ascii=False)
        source_path = _old_audio_path(row, catalogue)
        source_pattern = re.compile(r"source: require\(([\"'])" + re.escape(source_path) + r"\1\)")
        found = [index for index, line in enumerate(output) if key in line and source_pattern.search(line)]
        if len(found) != 1:
            raise ValueError(f"Expected exactly one active {row['collectionId']}/{row['locale']}/{content_id} entry in {filename}")
        index = found[0]
        line = output[index]
        if f"textHash: {json.dumps(row['textSha256'])}" not in line or f"kind: {json.dumps(row['kind'])}" not in line:
            raise ValueError(f"Active catalogue source identity differs for {row['collectionId']}/{row['locale']}/{content_id}")
        if row.get("nodeId") and f"nodeId: {json.dumps(row['nodeId'])}" not in line:
            raise ValueError(f"Active catalogue node identity differs for {row['collectionId']}/{row['locale']}/{content_id}")
        source_match = source_pattern.search(line)
        assert source_match is not None
        quote = source_match.group(1)
        line = source_pattern.sub(f"source: require({quote}{_new_audio_path(row)}{quote})", line, count=1)
        duration_key = f"{row['locale']}/{row['id']}"
        line, count = re.subn(r"durationSeconds: \d+(?:\.\d+)?", f"durationSeconds: {durations[duration_key]}", line, count=1)
        if count != 1:
            raise ValueError(f"Expected one duration field for {row['collectionId']}/{row['locale']}/{content_id}")
        output[index] = line
        changed += 1
    expected = sum(_catalogue_for(row).name == filename for row in rows)
    if changed != expected:
        raise ValueError(f"Expected {expected} catalogue updates in {filename}, found {changed}")
    return "".join(output)


def _catalogue_updates(tracks: list[dict[str, Any]], durations: dict[str, float]) -> tuple[dict[Path, str], dict[str, str]]:
    before = _catalogue_hashes()
    texts = {}
    for path in CATALOGUES.values():
        with path.open("r", encoding="utf-8", newline="") as stream:
            texts[path] = stream.read()
    updated = {path: _patch_catalogue_text(text, path.name, tracks, durations) for path, text in texts.items()}
    after = {path.name: engine.sha256(updated[path].encode("utf-8")) for path in updated}
    return updated, after


def _manifest_tracks(tracks: list[dict[str, Any]], ledger: dict[str, Any]) -> tuple[list[dict[str, Any]], dict[str, float]]:
    entries: list[dict[str, Any]] = []
    durations: dict[str, float] = {}
    for row in tracks:
        key = f"{row['locale']}/{row['id']}"
        attempt = ledger["tracks"].get(key, {})
        audio = engine._cache_path(row["locale"], row["id"])
        if attempt.get("status") != "completed" or not audio.is_file() or engine.sha256(audio.read_bytes()) != attempt.get("audioSha256"):
            raise RuntimeError(f"Track is missing or failed hash verification: {key}")
        info = engine._audio_report(audio)
        durations[f"{row['locale']}/{row['id']}"] = info["durationSeconds"]
        entries.append({
            "collectionId": row["collectionId"], "locale": row["locale"], "id": row["contentId"],
            "internalId": row["id"], "kind": row["kind"], "nodeId": row["nodeId"],
            "source": row["source"], "sourceDataSha256": row["sourceDataSha256"],
            "datasetRevision": row["datasetRevision"], "sourceTextSha256": row["textSha256"],
            "spokenTextSha256": row["spokenTextSha256"], "textHash": row["textSha256"],
            "characters": row["characters"], "voiceId": row["voiceId"],
            "voiceName": "Thắm" if row["locale"] == "vi" else "Talia",
            "model": engine.MODEL, "settings": engine.SETTINGS, "voiceRate": 1.0,
            "outputFormat": engine.OUTPUT_FORMAT, "requestId": attempt.get("requestId"),
            "reservedCredits": attempt["reservedCredits"], "characterCost": attempt["characterCost"],
            "costDecision": attempt["costDecision"], "audioSha256": attempt["audioSha256"],
            "path": f"mobile/assets/voice/post8/remaining-elevenlabs/{row['collectionId']}/{row['locale']}/{row['contentId']}.mp3",
            "format": info, "durationSeconds": info["durationSeconds"],
            "fullDecode": True, "humanApproved": False, "sourceOnly": True,
        })
    return entries, durations


def _install_catalogues(updated: dict[Path, str], before: dict[str, str], after: dict[str, str]) -> None:
    temporary: dict[Path, Path] = {}
    old_bytes = {path: path.read_bytes() for path in updated}
    installed: list[Path] = []
    try:
        for path, text in updated.items():
            if _file_hash(path) != before[path.name]:
                raise RuntimeError(f"Active voice catalogue changed during render: {path.name}")
            temp = path.with_name(f".{path.name}.post8-elevenlabs.tmp")
            if temp.exists():
                raise FileExistsError(f"Refusing to overwrite existing staging file: {temp}")
            with temp.open("w", encoding="utf-8", newline="") as stream:
                stream.write(text)
            temporary[path] = temp
        for path, temp in temporary.items():
            if _file_hash(path) != before[path.name]:
                raise RuntimeError(f"Active voice catalogue changed before install: {path.name}")
            os.replace(temp, path)
            installed.append(path)
        if _catalogue_hashes() != after:
            raise RuntimeError("Installed active voice catalogues do not match the audited replacements")
    except Exception:
        for path in installed:
            if _file_hash(path) == after[path.name]:
                rollback = path.with_name(f".{path.name}.post8-elevenlabs-rollback.tmp")
                if rollback.exists():
                    continue
                rollback.write_bytes(old_bytes[path])
                os.replace(rollback, path)
        raise
    finally:
        for temp in temporary.values():
            if temp.exists():
                temp.unlink()


def finalize(tracks: list[dict[str, Any]], revisions: dict[str, str], ledger: dict[str, Any]) -> None:
    _resolve_recovery_at_close(ledger)
    ledger = engine._load_ledger(tracks, revisions, ledger["preflight"], create=False)
    if len(ledger.get("tracks", {})) != 100 or any(entry.get("status") != "completed" for entry in ledger["tracks"].values()):
        raise RuntimeError("Finalization requires all 100 fully audited tracks")
    if any(not entry.get("costDecision") or entry["characterCost"] > entry["reservedCredits"] for entry in ledger["tracks"].values()):
        raise RuntimeError("Finalization requires account-reconciled costs within each reservation")
    if not ledger.get("checkpoint", {}).get("verified") or not ledger.get("closingAccount"):
        raise RuntimeError("Finalization requires a verified caption checkpoint and closing account")
    if engine._risk_credits(ledger) > BUDGET or sum(row["characters"] for row in tracks) != 25_553:
        raise RuntimeError("Project reserve or frozen 100-track source inventory changed")
    if engine.protected_asset_hashes() != ledger["protectedAssets"] or _protected_file_hashes() != ledger.get("protectedFiles"):
        raise RuntimeError("Existing voice assets, cues, or source bytes changed during generation")
    if _catalogue_hashes() != ledger.get("catalogueHashesBeforeInstall"):
        raise RuntimeError("Active catalogue work changed during generation")
    if _unchanged_catalogue_hashes() != ledger.get("unchangedCatalogueHashes"):
        raise RuntimeError("The accepted 56-track catalogue changed during generation")
    entries, durations = _manifest_tracks(tracks, ledger)
    catalogue_updates, catalogue_hashes_after = _catalogue_updates(tracks, durations)
    asset_hashes = ledger["protectedAssets"]
    protected_files = ledger["protectedFiles"]
    counts = {collection: {locale: sum(row["collectionId"] == collection and row["locale"] == locale for row in tracks)
                           for locale in ("en", "vi")}
              for collection in ("fiction-letter", "old-quarter-pilot")}
    manifest = {
        "schemaVersion": 1, "scope": SCOPE, "sourceStatus": "source-only", "status": "provisional",
        "humanApproved": False, "selectedForShipping": False,
        "model": engine.MODEL, "settings": engine.SETTINGS, "voiceIds": engine.VOICE_IDS,
        "outputFormat": engine.OUTPUT_FORMAT, "projectBudgetCredits": PROJECT_BUDGET,
        "priorProjectSpendCredits": PRIOR_PROJECT_SPEND, "budgetCredits": BUDGET,
        "rawReserveAtOneCreditPerCharacter": sum(row["characters"] for row in tracks),
        "reserveDeficitCredits": max(0, sum(row["characters"] for row in tracks) - BUDGET),
        "observedCredits": engine._completed_cost(ledger),
        "initialAccountCharacterCount": ledger["initialCharacterCount"],
        "protectedAssetCount": len(asset_hashes), "protectedAssetSetSha256": engine._fingerprint(asset_hashes),
        "protectedAssetHashes": asset_hashes, "protectedFilesSetSha256": engine._fingerprint(protected_files),
        "protectedFileHashes": protected_files, "catalogueHashesBeforeInstall": ledger["catalogueHashesBeforeInstall"],
        "unchangedCatalogueHashes": ledger["unchangedCatalogueHashes"],
        "catalogueHashesAfterInstall": catalogue_hashes_after,
        "w1ApprovalReferences": ledger.get("w1ApprovalReferences", []),
        "recoveryEvidence": ledger.get("recoveryEvidence"),
        "licenseProvenance": LICENSE_PROVENANCE,
        "checkpoint": ledger["checkpoint"], "closingAccount": ledger["closingAccount"],
        "counts": {"en": 50, "vi": 50, "total": 100, "collections": counts},
        "tracks": entries,
    }
    if OUTPUT.exists():
        raise FileExistsError(f"Refusing to overwrite existing output: {OUTPUT}")
    stage = Path(tempfile.mkdtemp(prefix="post8-remaining-elevenlabs-", dir=CACHE))
    for entry in entries:
        row = next(item for item in tracks if item["collectionId"] == entry["collectionId"]
                   and item["locale"] == entry["locale"] and item["contentId"] == entry["id"])
        source = engine._cache_path(row["locale"], row["id"])
        target = stage / entry["collectionId"] / entry["locale"] / f"{entry['id']}.mp3"
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
    (stage / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    _verify_stage(entries, stage)
    if engine.protected_asset_hashes() != asset_hashes or _protected_file_hashes() != protected_files:
        raise RuntimeError("A protected asset, cue, or source changed during final staging")
    os.replace(stage, OUTPUT)
    _install_catalogues(catalogue_updates, ledger["catalogueHashesBeforeInstall"], catalogue_hashes_after)


def _verify_stage(entries: list[dict[str, Any]], stage: Path) -> None:
    for entry in entries:
        path = stage / entry["collectionId"] / entry["locale"] / f"{entry['id']}.mp3"
        if not path.is_file() or engine.sha256(path.read_bytes()) != entry["audioSha256"] or engine._audio_report(path) != entry["format"]:
            raise RuntimeError(f"Staged audio failed final hash/decode verification: {entry['collectionId']}/{entry['locale']}/{entry['id']}")


def _expected_catalogue_entry(row: dict[str, Any], text: str, duration_seconds: float) -> bool:
    catalogue = _catalogue_for(row)
    new_source = re.compile(r"source: require\(([\"'])" + re.escape(_new_audio_path(row)) + r"\1\)")
    key = json.dumps(row["contentId"], ensure_ascii=False) + ": { id: " + json.dumps(row["contentId"], ensure_ascii=False)
    lines = [line for line in text.splitlines() if key in line and new_source.search(line)]
    if len(lines) != 1:
        return False
    line = lines[0]
    duration = re.search(r"durationSeconds: (\d+(?:\.\d+)?)", line)
    return (f"textHash: {json.dumps(row['textSha256'])}" in line
            and f"kind: {json.dumps(row['kind'])}" in line
            and (not row.get("nodeId") or f"nodeId: {json.dumps(row['nodeId'])}" in line)
            and duration is not None and float(duration.group(1)) == duration_seconds)


def _validate_recovery_evidence(evidence: Any, actual: dict[tuple[str, str, str], dict[str, Any]],
                                closing: dict[str, Any], initial: int, total_cost: int,
                                approval_refs: Any) -> None:
    original = evidence.get("originalUnknownAttempt") if isinstance(evidence, dict) else None
    retry = evidence.get("retry") if isinstance(evidence, dict) else None
    resolution = evidence.get("resolution") if isinstance(evidence, dict) else None
    entry = actual.get(("fiction-letter", "vi", "qa-huong-answer"), {})
    history_evidence = evidence.get("historyEvidence") if isinstance(evidence, dict) else {}
    if not isinstance(history_evidence, dict):
        history_evidence = {}
    history_reconciliation = history_evidence.get("fullRequestIdReconciliation", {})
    if not isinstance(history_reconciliation, dict):
        history_reconciliation = {}
    recovered_history = history_reconciliation.get("recoveredRequest", {})
    if (not isinstance(evidence, dict) or evidence.get("decisionId") != RECOVERY_DECISION_ID
            or evidence.get("scope") != "one explicit retry of vi/fiction-letter/qa-huong-answer"
            or evidence.get("sourceTextSha256") != RECOVERY_TEXT_SHA256
            or evidence.get("accountObservations") != RECOVERY_ACCOUNT_OBSERVATIONS
            or evidence.get("historyEvidence") != RECOVERY_HISTORY_EVIDENCE
            or not isinstance(original, dict) or original.get("status") != "unknown"
            or original.get("reservedCredits") != 180 or original.get("characterCost") is not None
            or original.get("sourceTextSha256") != RECOVERY_TEXT_SHA256
            or original.get("spokenTextSha256") != RECOVERY_TEXT_SHA256
            or original.get("requestId") is not None or original.get("audioSha256") is not None
            or evidence.get("originalRiskReserveCredits") != 180
            or evidence.get("riskReserveStatus") != "resolved_no_charge"
            or not isinstance(retry, dict) or retry.get("ordinal") != 1 or retry.get("status") != "completed"
            or retry.get("requestId") != entry.get("requestId")
            or retry.get("historyItemId") != recovered_history.get("historyItemId")
            or retry.get("audioSha256") != entry.get("audioSha256")
            or retry.get("characterCost") != entry.get("characterCost")
            or retry.get("costDecision") != entry.get("costDecision")
            or not isinstance(resolution, dict)
            or history_reconciliation.get("sourceMessageId") != "msg_1cea921f9629"
            or history_reconciliation.get("historyItemCount") != 156
            or history_reconciliation.get("manifestRequestCount") != 156
            or history_reconciliation.get("requestIdSetMatches") is not True
            or history_reconciliation.get("missingRequestIds") != 0
            or history_reconciliation.get("extraRequestIds") != 0
            or history_reconciliation.get("allRequestCostsFromToMatch") is not True
            or history_reconciliation.get("matchedCostsSum") != closing.get("characterCount")
            or recovered_history.get("requestId") != entry.get("requestId")
            or recovered_history.get("characterCountFrom") != 17427
            or recovered_history.get("characterCountTo") != 17499
            or recovered_history.get("characterCost") != entry.get("characterCost")
            or recovered_history.get("model") != engine.MODEL
            or recovered_history.get("outputFormat") != engine.OUTPUT_FORMAT
            or any(row.get("exactTextVoiceModelMatches") is not None
                   for row in history_evidence.get("observations", []) if isinstance(row, dict))
            or resolution.get("accountCharacterCount") != closing.get("characterCount")
            or resolution.get("accountDeltaFromBaseline") != total_cost
            or resolution.get("knownHeaderAndReconciledCosts") != total_cost
            or resolution.get("originalUnknownAttemptCost") != 0
            or closing.get("characterCount", -1) - initial != total_cost
            or not isinstance(approval_refs, list) or RECOVERY_DECISION_ID not in approval_refs):
        raise ValueError("One-time recovery, preserved unknown, or closing no-charge evidence is incomplete")


def audit() -> None:
    tracks, revisions = track_specs()
    manifest_path = OUTPUT / "manifest.json"
    if not manifest_path.is_file():
        raise FileNotFoundError("The Post-8 ElevenLabs output manifest is not installed")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if (manifest.get("schemaVersion") != 1 or manifest.get("scope") != SCOPE
            or manifest.get("sourceStatus") != "source-only" or manifest.get("status") != "provisional"
            or manifest.get("humanApproved") is not False or manifest.get("selectedForShipping") is not False
            or manifest.get("model") != engine.MODEL or manifest.get("settings") != engine.SETTINGS
            or manifest.get("outputFormat") != engine.OUTPUT_FORMAT or manifest.get("budgetCredits") != BUDGET
            or manifest.get("projectBudgetCredits") != PROJECT_BUDGET
            or manifest.get("priorProjectSpendCredits") != PRIOR_PROJECT_SPEND
            or manifest.get("voiceIds") != engine.VOICE_IDS
            or manifest.get("licenseProvenance") != LICENSE_PROVENANCE
            or manifest.get("rawReserveAtOneCreditPerCharacter") != sum(row["characters"] for row in tracks)
            or manifest.get("reserveDeficitCredits") != max(0, sum(row["characters"] for row in tracks) - BUDGET)
            or manifest.get("counts") != {"en": 50, "vi": 50, "total": 100, "collections": {
                collection: {locale: sum(row['collectionId'] == collection and row['locale'] == locale for row in tracks)
                             for locale in ("en", "vi")}
                for collection in ("fiction-letter", "old-quarter-pilot")}}):
        raise ValueError("Installed Post-8 manifest has invalid scope, settings, or counts")
    license_notice = ROOT / LICENSE_PROVENANCE["noticePath"]
    if (not license_notice.is_file()
            or _canonical_notice_sha256(license_notice.read_text(encoding="utf-8")) != LICENSE_PROVENANCE["noticeSha256"]):
        raise ValueError("ElevenLabs license provenance notice is missing or changed")
    protected_assets = manifest.get("protectedAssetHashes")
    actual_assets = engine.protected_asset_hashes()
    if (not isinstance(protected_assets, dict) or protected_assets != actual_assets
            or manifest.get("protectedAssetCount") != len(actual_assets)
            or manifest.get("protectedAssetSetSha256") != engine._fingerprint(actual_assets)):
        raise ValueError("A protected pre-existing voice asset is missing or changed")
    protected_files = manifest.get("protectedFileHashes")
    if (not isinstance(protected_files, dict) or protected_files != _protected_file_hashes()
            or manifest.get("protectedFilesSetSha256") != engine._fingerprint(protected_files)):
        raise ValueError("A protected cue, manifest, or source-data file is missing or changed")
    if manifest.get("catalogueHashesAfterInstall") != _catalogue_hashes():
        raise ValueError("Installed active catalogue hashes differ from the final manifest")
    if manifest.get("unchangedCatalogueHashes") != _unchanged_catalogue_hashes():
        raise ValueError("The accepted 56-track catalogue changed")
    entries = manifest.get("tracks")
    if not isinstance(entries, list) or len(entries) != 100:
        raise ValueError("Manifest does not contain exactly 100 audio records")
    expected = {(row["collectionId"], row["locale"], row["contentId"]): row for row in tracks}
    actual = {(entry.get("collectionId"), entry.get("locale"), entry.get("id")): entry for entry in entries}
    if len(actual) != 100 or set(actual) != set(expected):
        raise ValueError("Manifest track identities differ from the current raw source inventory")
    total_cost = 0
    for key, row in expected.items():
        entry = actual[key]
        relpath = f"mobile/assets/voice/post8/remaining-elevenlabs/{row['collectionId']}/{row['locale']}/{row['contentId']}.mp3"
        audio_path = (ROOT / relpath).resolve()
        if OUTPUT.resolve() not in audio_path.parents:
            raise ValueError("Manifest output path escapes the dedicated audio directory")
        if (entry.get("datasetRevision") != row["datasetRevision"] or entry.get("source") != row["source"]
                or entry.get("sourceDataSha256") != row["sourceDataSha256"]
                or entry.get("sourceTextSha256") != row["textSha256"] or entry.get("spokenTextSha256") != row["textSha256"]
                or entry.get("textHash") != row["textSha256"] or entry.get("characters") != row["characters"]
                or entry.get("kind") != row["kind"] or entry.get("nodeId") != row["nodeId"]
                or entry.get("voiceId") != row["voiceId"] or entry.get("voiceName") != ("Thắm" if row["locale"] == "vi" else "Talia")
                or entry.get("model") != engine.MODEL or entry.get("settings") != engine.SETTINGS
                or entry.get("outputFormat") != engine.OUTPUT_FORMAT or entry.get("path") != relpath
                or entry.get("fullDecode") is not True or entry.get("humanApproved") is not False
                or entry.get("sourceOnly") is not True):
            raise ValueError(f"Installed source identity/hash mismatch: {key}")
        cost, reserved = entry.get("characterCost"), entry.get("reservedCredits")
        if (not isinstance(cost, int) or isinstance(cost, bool) or not isinstance(reserved, int)
                or isinstance(reserved, bool) or cost < 0 or cost > reserved or reserved != row["characters"]
                or not engine._valid_cost_decision(entry.get("costDecision"), cost, reserved,
                                                   manifest.get("initialAccountCharacterCount", -1))):
            raise ValueError(f"Installed cost evidence is invalid: {key}")
        if not audio_path.is_file() or engine.sha256(audio_path.read_bytes()) != entry.get("audioSha256"):
            raise ValueError(f"Installed audio hash mismatch: {key}")
        info = engine._audio_report(audio_path)
        if info != entry.get("format") or entry.get("durationSeconds") != info["durationSeconds"]:
            raise ValueError(f"Installed audio decode/format mismatch: {key}")
        catalogue = _catalogue_for(row)
        if not _expected_catalogue_entry(row, catalogue.read_text(encoding="utf-8"), info["durationSeconds"]):
            raise ValueError(f"Active static require or duration differs from audited audio: {key}")
        total_cost += cost
    closing = manifest.get("closingAccount", {})
    initial = manifest.get("initialAccountCharacterCount")
    closing_count = closing.get("characterCount")
    closing_limit = closing.get("characterLimit")
    checkpoint = manifest.get("checkpoint", {})
    checkpoint_decisions = checkpoint.get("costDecisions", {})
    checkpoint_rows = _checkpoint_tracks(tracks)
    expected_checkpoint_keys = {f"{row['locale']}/{row['id']}" for row in checkpoint_rows}
    checkpoint_entries = [actual[(row["collectionId"], row["locale"], row["contentId"])] for row in checkpoint_rows]
    checkpoint_cost = sum(entry["characterCost"] for entry in checkpoint_entries)
    checkpoint_reserve = sum(row["characters"] for row in checkpoint_rows)
    account_checkpoint = checkpoint.get("accountSnapshot", {})
    approval_refs = manifest.get("w1ApprovalReferences")
    if (closing.get("tier") != "starter" or closing.get("canExtendCharacterLimit") is not False
            or not isinstance(initial, int) or isinstance(initial, bool)
            or not isinstance(closing_count, int) or isinstance(closing_count, bool)
            or not isinstance(closing_limit, int) or isinstance(closing_limit, bool)
            or closing.get("remainingCredits") != closing_limit - closing_count
            or not closing.get("observedAtUtc")
            or closing_count - initial != total_cost or total_cost != manifest.get("observedCredits")
            or total_cost > BUDGET or not checkpoint.get("verified") or checkpoint.get("trackCount") != 2
            or set(checkpoint_decisions) != expected_checkpoint_keys
            or checkpoint.get("estimatedCredits") != checkpoint_reserve
            or checkpoint.get("observedCharacterCost") != checkpoint_cost
            or checkpoint.get("accountDelta") != checkpoint_cost
            or account_checkpoint.get("characterCount") != initial + checkpoint_cost
            or account_checkpoint.get("remainingCredits") != account_checkpoint.get("characterLimit", -1) - account_checkpoint.get("characterCount", -1)
            or account_checkpoint.get("canExtendCharacterLimit") is not False
            or not isinstance(approval_refs, list) or not approval_refs
            or any(not isinstance(ref, str) or not ref.startswith("msg_") for ref in approval_refs)):
        raise ValueError("Cost, account delta, checkpoint, or W1 approval evidence failed")
    _validate_recovery_evidence(manifest.get("recoveryEvidence"), actual, closing, initial, total_cost, approval_refs)
    for row, entry in zip(checkpoint_rows, checkpoint_entries):
        decision = checkpoint_decisions[f"{row['locale']}/{row['id']}"]
        if entry.get("costDecision") != decision or decision.get("observedCharacterCost") != entry.get("characterCost"):
            raise ValueError("Caption checkpoint cost evidence differs from its audio manifest entry")
    print(f"Audio audit passed: 100/100 MP3s decode; active catalogues and source hashes match; "
          f"account delta={total_cost}, remaining={closing.get('remainingCredits')}; humanApproved=false")


def _append_approval(reference: str) -> None:
    if not reference.strip() or reference.strip().lower() in {"yes", "approved", "true"}:
        raise ValueError("Use the coordinator's durable W1 approval message ID")
    if reference not in W1_APPROVAL_REFERENCES:
        W1_APPROVAL_REFERENCES.append(reference)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", nargs="?", choices=("dry-run", "preflight", "render-checkpoint", "recover-unknown-once", "render-remaining", "audit"), default="dry-run")
    parser.add_argument("--w1-approval", help="Durable coordinator reply message ID authorizing this paid stage")
    args = parser.parse_args()
    if args.action == "dry-run":
        print(json.dumps(dry_run(), ensure_ascii=False, indent=2))
        return
    if args.action == "audit":
        audit()
        return
    if args.action == "preflight":
        print(json.dumps(read_only_preflight(), ensure_ascii=False, indent=2))
        return
    if not args.w1_approval:
        parser.error("paid rendering requires --w1-approval with W1's durable reply message ID")
    if args.action == "recover-unknown-once" and args.w1_approval != RECOVERY_DECISION_ID:
        parser.error("recover-unknown-once accepts only W1's exact one-time authorization message ID")
    _append_approval(args.w1_approval)
    tracks, revisions = track_specs()
    api_key = engine._load_api_key()
    preflight = engine._preflight(api_key)
    if args.action == "render-checkpoint":
        engine._run_checkpoint(api_key, tracks, revisions, preflight)
        print("Verified exactly two in-inventory caption tracks against cost headers and account delta")
    elif args.action == "recover-unknown-once":
        recover_unknown_once(args.w1_approval, tracks, revisions, preflight, api_key)
    else:
        if not LEDGER.is_file():
            parser.error("render-remaining requires the verified caption checkpoint ledger")
        ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
        refs = ledger.setdefault("w1ApprovalReferences", [])
        if args.w1_approval not in refs:
            refs.append(args.w1_approval)
            engine._save_ledger(ledger)
        _validate_recovery_before_resume(ledger)
        engine._render_remaining(api_key, tracks, revisions, preflight)
        print("Rendered and audited the 100-track Post-8 collection; humanApproved=false")


engine.COLLECTION = SCOPE
engine.BUDGET = BUDGET
engine.CACHE = CACHE
engine.LEDGER = LEDGER
engine.OUTPUT = OUTPUT
engine.CATALOG = CATALOGUES["post8RemainingCatalog.ts"]
engine.track_specs = track_specs
engine.run_config = run_config
engine._ledger_payload = _ledger_payload
engine._risk_credits = _risk_credits
engine._checkpoint_tracks = _checkpoint_tracks
engine._finalize = finalize
engine.audit = audit


if __name__ == "__main__":
    main()
