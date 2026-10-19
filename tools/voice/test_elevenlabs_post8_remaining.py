import contextlib
import io
import json
import re
import sys
import tempfile
import unittest
from collections import Counter
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))

import elevenlabs_post8_remaining as renderer
import elevenlabs_three_lenses as prior_renderer


def _legacy_catalogue_text(path, tracks):
    with path.open("r", encoding="utf-8", newline="") as stream:
        text = stream.read()
    for row in tracks:
        catalogue = renderer._catalogue_for(row)
        if catalogue == path:
            text = text.replace(renderer._new_audio_path(row), renderer._old_audio_path(row, catalogue), 1)
    return text


class ElevenLabsPost8RemainingTests(unittest.TestCase):
    def test_notice_hash_uses_canonical_utf8_lf_line_endings(self):
        notice = "Terms\nAttribution\n"
        self.assertEqual(
            renderer._canonical_notice_sha256(notice),
            renderer._canonical_notice_sha256(notice.replace("\n", "\r\n")),
        )

    def test_inventory_is_100_raw_source_tracks_and_reports_full_reserve_deficit(self):
        tracks, revisions = renderer.track_specs()
        self.assertEqual(Counter((row["collectionId"], row["locale"]) for row in tracks), {
            ("fiction-letter", "en"): 34, ("fiction-letter", "vi"): 34,
            ("old-quarter-pilot", "en"): 16, ("old-quarter-pilot", "vi"): 16,
        })
        self.assertEqual(sum(row["characters"] for row in tracks), 25_553)
        self.assertEqual(sum(row["characters"] for row in tracks if row["locale"] == "en"), 13_456)
        self.assertEqual(sum(row["characters"] for row in tracks if row["locale"] == "vi"), 12_097)
        self.assertEqual(len({(row["collectionId"], row["locale"], row["contentId"]) for row in tracks}), 100)
        for row in tracks:
            self.assertEqual(row["textSha256"], renderer.engine.sha256(row["text"].encode("utf-8")))
            self.assertEqual(row["spokenTextSha256"], row["textSha256"])
            source = renderer.ROOT / row["source"]
            self.assertEqual(row["sourceDataSha256"], renderer.engine.sha256(source.read_bytes()))
            self.assertEqual(row["datasetRevision"], revisions[f"{row['collectionId']}/{row['locale']}"])
        dry_run = renderer.dry_run()
        self.assertEqual(dry_run["reserveCreditsAtOneCreditPerCharacter"], 25_553)
        self.assertEqual(dry_run["budgetCredits"], 20_091)
        self.assertEqual(dry_run["reserveDeficitCredits"], 5_462)
        self.assertFalse(dry_run["fullReserveFitsProjectBudget"])
        self.assertEqual(dry_run["protectedMp3Count"], 212)
        self.assertEqual(dry_run["protectedAudioCount"], 213)
        self.assertEqual(len(dry_run["protectedAssetHashes"]), dry_run["protectedAudioCount"])
        self.assertEqual(len(dry_run["protectedVoiceAndSourceFileHashes"]), dry_run["protectedVoiceAndSourceFileCount"])
        self.assertEqual(dry_run["unchangedCatalogueHashes"], renderer._unchanged_catalogue_hashes())

    def test_protected_audio_inventory_ignores_generated_build_copies(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            voice = root / "mobile" / "assets" / "voice"
            output = voice / "post8" / "remaining-elevenlabs"
            fixture = root / "tools" / "voice" / "gateway" / "test-fixtures" / "ios-aac-smoke.m4a"
            cue = root / "mobile" / "assets" / "sounds" / "prologue_door.wav"
            source = voice / "intro.mp3"
            generated = output / "en" / "generated.mp3"
            source.parent.mkdir(parents=True)
            output.mkdir(parents=True)
            fixture.parent.mkdir(parents=True)
            cue.parent.mkdir(parents=True)
            source.write_bytes(b"protected source audio")
            fixture.write_bytes(b"permitted AAC fixture")
            cue.write_bytes(b"app sound cue")
            generated.parent.mkdir(parents=True)
            generated.write_bytes(b"current generator output")

            with patch.object(renderer.engine, "ROOT", root), patch.object(renderer.engine, "OUTPUT", output):
                expected = renderer.engine.protected_asset_hashes()

                build = root / "mobile" / "android" / "app" / "build" / "generated" / "res" / "raw"
                build.mkdir(parents=True)
                for index in range(200):
                    (build / f"copy-{index}.mp3").write_bytes(source.read_bytes())

                self.assertEqual(renderer.engine.protected_asset_hashes(), expected)
                self.assertIn("mobile/assets/voice/intro.mp3", expected)
                self.assertIn("tools/voice/gateway/test-fixtures/ios-aac-smoke.m4a", expected)
                self.assertNotIn("mobile/assets/sounds/prologue_door.wav", expected)
                self.assertNotIn("mobile/assets/voice/post8/remaining-elevenlabs/en/generated.mp3", expected)
                self.assertEqual(cue.read_bytes(), b"app sound cue")

    def test_dry_run_is_network_free_and_keeps_the_previous_renderer_isolated(self):
        output = io.StringIO()
        with patch.object(sys, "argv", ["elevenlabs_post8_remaining.py"]), \
             patch.object(renderer.engine, "_request", side_effect=AssertionError("dry-run cannot call the network")), \
             patch.object(renderer.engine, "_load_api_key", side_effect=AssertionError("dry-run cannot read a key")), \
             contextlib.redirect_stdout(output):
            renderer.main()
        result = json.loads(output.getvalue())
        self.assertEqual(result["totalTracks"], 100)
        self.assertIn("no network", result["mode"])
        self.assertEqual(prior_renderer.BUDGET, 30_000)
        self.assertEqual(len(prior_renderer.track_specs()[0]), 56)

    def test_paid_cli_requires_durable_w1_reply_before_preflight_or_post(self):
        with patch.object(sys, "argv", ["elevenlabs_post8_remaining.py", "render-checkpoint"]), \
             patch.object(renderer.engine, "_load_api_key") as load_key, \
             patch.object(renderer.engine, "_preflight") as preflight, \
             patch.object(renderer.engine, "_run_checkpoint") as checkpoint:
            with self.assertRaises(SystemExit):
                renderer.main()
        load_key.assert_not_called()
        preflight.assert_not_called()
        checkpoint.assert_not_called()

    def test_account_preflight_is_read_only_and_reports_checkpoint_reserve(self):
        account = {"tier": "starter", "characterCount": 9_909, "characterLimit": 40_000,
                   "remainingCredits": 30_091, "canExtendCharacterLimit": False}
        with patch.object(renderer.engine, "_load_api_key", return_value="local-test-key"), \
             patch.object(renderer.engine, "_preflight", return_value=account) as preflight, \
             patch.object(renderer.engine, "_render_request", side_effect=AssertionError("preflight cannot POST")):
            result = renderer.read_only_preflight()
        preflight.assert_called_once_with("local-test-key")
        self.assertTrue(result["readOnly"])
        self.assertTrue(result["noPaidPostPerformed"])
        self.assertEqual(result["checkpointReserveCredits"], 158)
        self.assertFalse(result["fullReserveFitsNewRunBudget"])

    def test_catalogue_plan_updates_exactly_the_100_active_lines_without_writing(self):
        tracks, _ = renderer.track_specs()
        before = renderer._catalogue_hashes()
        protected_before = renderer._unchanged_catalogue_hashes()
        manifest = json.loads((renderer.OUTPUT / "manifest.json").read_text(encoding="utf-8"))
        durations = {f"{entry['locale']}/{entry['internalId']}": entry["durationSeconds"] for entry in manifest["tracks"]}
        legacy = {path: _legacy_catalogue_text(path, tracks) for path in renderer.CATALOGUES.values()}
        updated = {path: renderer._patch_catalogue_text(legacy[path], path.name, tracks, durations)
                   for path in renderer.CATALOGUES.values()}
        changed = {path.name: sum(a != b for a, b in zip(legacy[path].splitlines(), text.splitlines()))
                   for path, text in updated.items()}
        after = {path.name: renderer.engine.sha256(text.encode("utf-8")) for path, text in updated.items()}
        self.assertEqual(changed, {"catalog.ts": 34, "post8Catalog.ts": 12, "post8RemainingCatalog.ts": 54})
        self.assertEqual(renderer._catalogue_hashes(), before)
        self.assertEqual(after, before)
        self.assertEqual(renderer._unchanged_catalogue_hashes(), protected_before)

    def test_catalogue_durations_are_keyed_by_locale_and_internal_id(self):
        tracks, _ = renderer.track_specs()
        by_content = {
            locale: {row["contentId"]: row for row in tracks
                     if row["collectionId"] == "fiction-letter" and row["locale"] == locale}
            for locale in ("en", "vi")
        }
        content_id = next(iter(by_content["en"].keys() & by_content["vi"].keys()))
        english = by_content["en"][content_id]
        vietnamese = by_content["vi"][content_id]
        durations = {f"{row['locale']}/{row['id']}": 1.0 for row in tracks}
        durations[f"en/{english['id']}"] = 1.25
        durations[f"vi/{vietnamese['id']}"] = 2.75

        updated = {path: renderer._patch_catalogue_text(_legacy_catalogue_text(path, tracks), path.name, tracks, durations)
                   for path in renderer.CATALOGUES.values()}

        def installed_duration(row):
            path = renderer._catalogue_for(row)
            audio_path = renderer._new_audio_path(row)
            line = next(line for line in updated[path].splitlines() if audio_path in line)
            return re.search(r"durationSeconds: ([0-9.]+)", line).group(1)

        self.assertEqual(installed_duration(english), "1.25")
        self.assertEqual(installed_duration(vietnamese), "2.75")
        english_catalogue = updated[renderer._catalogue_for(english)]
        self.assertTrue(renderer._expected_catalogue_entry(english, english_catalogue, 1.25))
        self.assertFalse(renderer._expected_catalogue_entry(english, english_catalogue, 2.75))
        vietnamese_catalogue = updated[renderer._catalogue_for(vietnamese)]
        self.assertTrue(renderer._expected_catalogue_entry(vietnamese, vietnamese_catalogue, 2.75))

    def test_recovery_journals_unknown_once_and_preserves_its_budget_risk(self):
        tracks, _ = renderer.track_specs()
        row = next(row for row in tracks if f"{row['locale']}/{row['id']}" == renderer.RECOVERY_TRACK_KEY)
        completed = [{"status": "completed", "reservedCredits": 200, "characterCost": 100}
                     for _ in range(74)]
        completed.append({"status": "completed", "reservedCredits": 118, "characterCost": 118})
        unknown = {"status": "unknown", "reservedCredits": 180, "characterCost": None,
                   "sourceTextSha256": renderer.RECOVERY_TEXT_SHA256,
                   "spokenTextSha256": renderer.RECOVERY_TEXT_SHA256, "errorType": "RuntimeError"}
        ledger = {"tracks": {f"test/{index}": entry for index, entry in enumerate(completed)}
                            | {renderer.RECOVERY_TRACK_KEY: unknown}}
        self.assertEqual(renderer._risk_credits(ledger), 7_698)

        evidence = renderer._journal_recovery(ledger, row, renderer.RECOVERY_DECISION_ID)

        self.assertEqual(evidence["originalUnknownAttempt"], unknown)
        self.assertEqual(evidence["originalRiskReserveCredits"], 180)
        self.assertEqual(evidence["riskReserveStatus"], "pending_until_closing_reconciliation")
        self.assertEqual(evidence["accountObservations"], renderer.RECOVERY_ACCOUNT_OBSERVATIONS)
        self.assertEqual(evidence["historyEvidence"], renderer.RECOVERY_HISTORY_EVIDENCE)
        self.assertIsNone(evidence["historyEvidence"]["observations"][0]["exactTextVoiceModelMatches"])
        self.assertEqual(evidence["historyEvidence"]["fullRequestIdReconciliation"]["historyItemCount"], 156)
        self.assertNotIn(renderer.RECOVERY_TRACK_KEY, ledger["tracks"])
        self.assertEqual(renderer._risk_credits(ledger), 7_698)
        with self.assertRaisesRegex(RuntimeError, "already been journaled"):
            renderer._journal_recovery(ledger, row, renderer.RECOVERY_DECISION_ID)
        self.assertEqual(evidence["retry"]["ordinal"], 1)

    def test_portable_audit_does_not_read_cache_key_or_network(self):
        with patch.object(renderer, "track_specs", return_value=([], {})), \
             patch.object(renderer, "OUTPUT", Path("missing-portable-output")), \
             patch.object(renderer.engine, "_load_api_key", side_effect=AssertionError("audit must not read a key")), \
             patch.object(renderer.engine, "_request", side_effect=AssertionError("audit must not use network")), \
             patch.object(renderer.engine, "_cache_path", side_effect=AssertionError("audit must not use cache")):
            with self.assertRaises(FileNotFoundError):
                renderer.audit()


if __name__ == "__main__":
    unittest.main()
