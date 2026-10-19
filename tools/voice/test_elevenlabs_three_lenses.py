import contextlib
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))

import elevenlabs_three_lenses as renderer


class ElevenLabsThreeLensesTests(unittest.TestCase):
    def test_default_action_is_network_free_56_track_dry_run(self):
        output = io.StringIO()
        with patch.object(sys, "argv", ["elevenlabs_three_lenses.py"]), \
             patch.object(renderer, "_request", side_effect=AssertionError("dry run must not call the API")), \
             contextlib.redirect_stdout(output):
            renderer.main()
        result = json.loads(output.getvalue())
        self.assertEqual(result["trackCounts"], {"en": 28, "vi": 28})
        self.assertEqual(result["characters"], {"en": 12_257, "vi": 12_511})
        self.assertEqual(result["totalTracks"], 56)
        self.assertEqual(result["totalCharacters"], 24_768)
        self.assertEqual(result["estimatedCredits"], 24_768)
        self.assertEqual(result["budgetHeadroomCredits"], 5_232)
        self.assertEqual(len(result["checkpointTracks"]), 2)
        self.assertIn("no network", result["mode"])

    def test_audit_action_does_not_require_api_key_or_network(self):
        with patch.object(sys, "argv", ["elevenlabs_three_lenses.py", "audit"]), \
             patch.object(renderer, "audit") as audit, \
             patch.object(renderer, "_load_api_key", side_effect=AssertionError("audit is local")), \
             patch.object(renderer, "_preflight", side_effect=AssertionError("audit is offline")):
            renderer.main()
        audit.assert_called_once_with()

    def test_installed_audit_needs_manifest_assets_but_no_cache_or_ledger(self):
        output = io.StringIO()
        with patch.object(renderer, "LEDGER", Path("missing-ledger.json")), \
             patch.object(renderer, "CACHE", Path("missing-cache")), \
             patch.object(renderer, "_load_api_key", side_effect=AssertionError("audit is local")), \
             patch.object(renderer, "_preflight", side_effect=AssertionError("audit is offline")), \
             contextlib.redirect_stdout(output):
            renderer.audit()
        self.assertIn("Audio audit passed: 56/56", output.getvalue())

    def test_finalization_checks_copied_assets_before_install(self):
        audio = b"verified staged audio"
        info = {"container": "mp3", "codec": "mp3", "sampleRateHz": 44_100,
                "channels": 1, "bitrateKbps": 128, "durationSeconds": 1.0}
        catalogue = {"en": {"tracks": [{"id": "caption", "audioSha256": renderer.sha256(audio), "format": info}]},
                     "vi": {"tracks": []}}
        with tempfile.TemporaryDirectory() as directory:
            stage = Path(directory)
            path = stage / "en" / "caption.mp3"
            path.parent.mkdir()
            path.write_bytes(audio)
            with patch.object(renderer, "_audio_report", return_value=info):
                renderer._verify_staged_audio(catalogue, stage)
                path.write_bytes(b"changed")
                with self.assertRaisesRegex(RuntimeError, "final hash/decode"):
                    renderer._verify_staged_audio(catalogue, stage)

    def test_paid_request_uses_exact_source_and_frozen_settings(self):
        class Response:
            headers = {"content-type": "audio/mpeg", "character-cost": "5", "request-id": "req-test"}

            def __enter__(self):
                return self

            def __exit__(self, *args):
                return False

            def read(self):
                return b"mp3 bytes"

        row = {"text": "Ngõ Kể — original text", "voiceId": renderer.VOICE_IDS["vi"]}
        with patch.object(renderer, "build_opener") as build:
            build.return_value.open.return_value = Response()
            audio, cost, request_id = renderer._render_request(row, "local-test-key")
        request = build.return_value.open.call_args.args[0]
        payload = json.loads(request.data.decode("utf-8"))
        self.assertEqual(audio, b"mp3 bytes")
        self.assertEqual(cost, 5)
        self.assertEqual(request_id, "req-test")
        self.assertEqual(payload, {
            "text": row["text"], "model_id": "eleven_v4", "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
        })
        self.assertIn("output_format=mp3_44100_128", request.full_url)
        self.assertEqual({key.lower(): value for key, value in request.header_items()}["xi-api-key"], "local-test-key")

    def test_reservation_is_durable_before_request_and_unknown_attempt_cannot_retry(self):
        tracks, revisions = renderer.track_specs()
        row = next(item for item in tracks if item["locale"] == "en" and item["kind"] == "caption")
        preflight = {"tier": "starter", "characterCount": 0, "characterLimit": 40_000}
        subscription = {"tier": "starter", "character_count": 0, "character_limit": 40_000,
                        "can_extend_character_limit": False, "max_credit_limit_extension": 0}
        with tempfile.TemporaryDirectory() as directory:
            cache = Path(directory)
            ledger_path = cache / "ledger.json"
            ledger = renderer._ledger_payload(tracks, revisions, preflight)
            with patch.object(renderer, "CACHE", cache), patch.object(renderer, "LEDGER", ledger_path):
                renderer._save_ledger(ledger)

                def timeout_after_reservation(*args):
                    current = json.loads(ledger_path.read_text(encoding="utf-8"))
                    self.assertEqual(current["tracks"]["en/" + row["id"]]["status"], "reserved")
                    raise RuntimeError("simulated timeout")

                with patch.object(renderer, "_request_json", return_value=subscription) as get, \
                     patch.object(renderer, "_render_request", side_effect=timeout_after_reservation) as render:
                    with self.assertRaisesRegex(RuntimeError, "simulated timeout"):
                        renderer._render_track(row, ledger, "local-test-key")
                    with self.assertRaisesRegex(RuntimeError, "unresolved"):
                        renderer._render_track(row, ledger, "local-test-key")
                self.assertEqual(render.call_count, 1)
                self.assertEqual(get.call_count, 1)
                self.assertEqual(renderer._risk_credits(ledger), row["characters"])
                self.assertEqual(ledger["tracks"]["en/" + row["id"]]["status"], "unknown")

    def test_preflight_checks_nested_model_rates_and_each_voice_sharing_rate(self):
        models = [{
            "model_id": "eleven_v4", "languages": [{"language_id": "vi"}, {"language_id": "en"}],
            "token_cost_factor": 1, "model_rates": {"character_cost_multiplier": 1, "cost_discount_multiplier": 1},
        }]
        responses = [
            {"tier": "starter", "character_count": 0, "character_limit": 40_000,
             "can_extend_character_limit": False, "max_credit_limit_extension": 0},
            models,
            {"voice_id": renderer.VOICE_IDS["vi"], "category": "professional", "sharing": {"rate": 1}},
            {"voice_id": renderer.VOICE_IDS["en"], "category": "professional", "sharing": {"rate": 1}},
        ]
        with patch.object(renderer, "_request_json", side_effect=responses) as request:
            result = renderer._preflight("local-test-key")
        self.assertEqual(result["remainingCredits"], 40_000)
        self.assertEqual(result["voices"]["vi"]["rate"], 1.0)
        self.assertEqual(result["voices"]["en"]["rate"], 1.0)
        self.assertEqual(request.call_count, 4)

    def test_discounted_english_caption_reconciles_without_reposting_before_vietnamese(self):
        tracks, revisions = renderer.track_specs()
        en = next(row for row in tracks if row["locale"] == "en" and row["kind"] == "caption")
        vi = next(row for row in tracks if row["locale"] == "vi" and row["kind"] == "caption")
        audio_format = {"container": "mp3", "codec": "mp3", "sampleRateHz": 44_100,
                        "channels": 1, "bitrateKbps": 128, "durationSeconds": 1.0}
        first_audio = b"previously-paid-en-audio"
        initial = {"tier": "starter", "characterCount": 0, "characterLimit": 40_000}
        current = {"tier": "starter", "character_count": 26, "character_limit": 40_000,
                   "can_extend_character_limit": False, "max_credit_limit_extension": 0}
        after_vi = {**current, "character_count": 56}
        preflight = {"tier": "starter", "characterCount": 26, "characterLimit": 40_000}

        with tempfile.TemporaryDirectory() as directory:
            cache = Path(directory)
            en_path = cache / "en" / f"{en['id']}.mp3"
            en_path.parent.mkdir(parents=True)
            en_path.write_bytes(first_audio)
            ledger = renderer._ledger_payload(tracks, revisions, initial)
            ledger["tracks"][f"en/{en['id']}"] = {
                "status": "cost_mismatch", "reservedCredits": en["characters"], "characterCost": 26,
                "requestId": "previous-en-request", "audioSha256": renderer.sha256(first_audio),
                "format": audio_format, "durationSeconds": 1.0,
                "sourceTextSha256": en["textSha256"], "spokenTextSha256": en["spokenTextSha256"],
            }
            with patch.object(renderer, "CACHE", cache), patch.object(renderer, "LEDGER", cache / "ledger.json"), \
                 patch.object(renderer, "_audio_report", return_value=audio_format), \
                 patch.object(renderer, "_request_json", side_effect=[current, current, after_vi, after_vi]) as account_get, \
                 patch.object(renderer, "_render_request", return_value=(b"new-vi-audio", 30, "new-vi-request")) as render:
                renderer._save_ledger(ledger)
                renderer._run_checkpoint("local-test-key", tracks, revisions, preflight)
                renderer._run_checkpoint("local-test-key", tracks, revisions, preflight)
                saved = json.loads((cache / "ledger.json").read_text(encoding="utf-8"))

        en_result = saved["tracks"][f"en/{en['id']}"]
        self.assertEqual(render.call_count, 1)
        self.assertEqual(render.call_args.args[0]["locale"], "vi")
        self.assertEqual(en_result["status"], "completed")
        self.assertEqual(en_result["costDecision"]["priorStatus"], "cost_mismatch")
        self.assertEqual(en_result["costDecision"]["disposition"], "accepted_discount")
        self.assertEqual(en_result["characterCost"], 26)
        vi_result = saved["tracks"][f"vi/{vi['id']}"]
        self.assertEqual(vi_result["costDecision"]["disposition"], "accepted_discount")
        self.assertEqual(vi_result["characterCost"], 30)
        self.assertTrue(saved["checkpoint"]["verified"])
        self.assertEqual(saved["checkpoint"]["estimatedCredits"], en["characters"] + vi["characters"])
        self.assertEqual(saved["checkpoint"]["accountDelta"], 56)
        self.assertEqual(account_get.call_count, 4)
        self.assertEqual(render.call_count, 1)

    def test_balance_poll_waits_for_settlement_with_read_only_gets(self):
        stale = {"tier": "starter", "character_count": 0, "character_limit": 40_000,
                 "can_extend_character_limit": False, "max_credit_limit_extension": 0}
        settled = {**stale, "character_count": 26}
        ledger = {"initialCharacterCount": 0, "tracks": {"en/caption": {"status": "pending_cost_reconcile", "characterCost": 26}}}
        with patch.object(renderer, "_request_json", side_effect=[stale, settled]) as get, \
             patch.object(renderer.time, "monotonic", side_effect=[0.0, 1.0]), \
             patch.object(renderer.time, "sleep") as sleep:
            result = renderer._wait_for_account_delta(ledger, "local-test-key")
        self.assertEqual(result["character_count"], 26)
        self.assertEqual(get.call_count, 2)
        sleep.assert_called_once_with(1.0)

    def test_balance_poll_stops_after_bounded_read_only_wait(self):
        stale = {"tier": "starter", "character_count": 0, "character_limit": 40_000,
                 "can_extend_character_limit": False, "max_credit_limit_extension": 0}
        ledger = {"initialCharacterCount": 0, "tracks": {"en/caption": {"status": "pending_cost_reconcile", "characterCost": 26}}}
        with patch.object(renderer, "_request_json", return_value=stale) as get, \
             patch.object(renderer.time, "monotonic", side_effect=[0.0, 59.0, 60.0]), \
             patch.object(renderer.time, "sleep") as sleep:
            with self.assertRaisesRegex(RuntimeError, "within 60 seconds"):
                renderer._wait_for_account_delta(ledger, "local-test-key")
        self.assertEqual(get.call_count, 2)
        sleep.assert_called_once_with(1.0)

    def test_balance_poll_retries_throttled_get_only_with_bounded_backoff(self):
        settled = {"tier": "starter", "character_count": 26, "character_limit": 40_000,
                   "can_extend_character_limit": False, "max_credit_limit_extension": 0}
        ledger = {"initialCharacterCount": 0, "tracks": {"en/caption": {"status": "pending_cost_reconcile", "characterCost": 26}}}
        with patch.object(renderer, "_request_json", side_effect=[RuntimeError("ElevenLabs GET request failed with HTTP 429"), settled]) as get, \
             patch.object(renderer.time, "monotonic", side_effect=[100.0, 101.0]), \
             patch.object(renderer.time, "sleep") as sleep:
            result = renderer._wait_for_account_delta(ledger, "local-test-key")
        self.assertEqual(result["character_count"], 26)
        self.assertEqual(get.call_args_list[0].args, ("user/subscription", "local-test-key"))
        self.assertEqual(get.call_count, 2)
        sleep.assert_called_once_with(1.0)

    def test_shadow_balance_allows_stale_count_only_for_valid_known_audio(self):
        tracks, revisions = renderer.track_specs()
        prior = next(row for row in tracks if row["locale"] == "en" and row["id"] == "oldquarter-bach-ma-caption")
        preflight = {"tier": "starter", "characterCount": 0, "characterLimit": 40_000}
        audio = b"known validated audio"
        info = {"container": "mp3", "codec": "mp3", "sampleRateHz": 44_100,
                "channels": 1, "bitrateKbps": 128, "durationSeconds": 1.0}
        stale = {"tier": "starter", "character_count": 0, "character_limit": 40_000,
                 "can_extend_character_limit": False, "max_credit_limit_extension": 0}
        with tempfile.TemporaryDirectory() as directory:
            cache = Path(directory)
            path = cache / prior["locale"] / f"{prior['id']}.mp3"
            path.parent.mkdir()
            path.write_bytes(audio)
            ledger = renderer._ledger_payload(tracks, revisions, preflight)
            ledger["tracks"][f"en/{prior['id']}"] = {
                "status": "pending_cost_reconcile", "reservedCredits": prior["characters"], "characterCost": 26,
                "sourceTextSha256": prior["textSha256"], "spokenTextSha256": prior["spokenTextSha256"],
                "audioSha256": renderer.sha256(audio), "format": info,
            }
            with patch.object(renderer, "CACHE", cache), patch.object(renderer, "_request_json", return_value=stale) as get:
                renderer._shadow_balance_guard(ledger, tracks, "local-test-key", 1_000)
                self.assertEqual(get.call_count, 1)

    def test_shadow_balance_stops_unexpected_usage_and_project_cap_before_paid_request(self):
        ledger = {"initialCharacterCount": 0, "tracks": {}}
        unexpected = {"tier": "starter", "character_count": 1, "character_limit": 40_000,
                      "can_extend_character_limit": False, "max_credit_limit_extension": 0}
        with patch.object(renderer, "_request_json", return_value=unexpected):
            with self.assertRaisesRegex(RuntimeError, "higher than the known request costs"):
                renderer._shadow_balance_guard(ledger, [], "local-test-key", 1_000)
        with patch.object(renderer, "_request_json") as get:
            with self.assertRaisesRegex(RuntimeError, "30,000-credit"):
                renderer._shadow_balance_guard(ledger, [], "local-test-key", renderer.BUDGET + 1)
        get.assert_not_called()

    def test_valid_invalid_attempt_recovers_for_cost_reconciliation_without_repost(self):
        tracks, revisions = renderer.track_specs()
        row = next(item for item in tracks if item["locale"] == "en" and item["id"] == "oldquarter-ma-may-transition-story")
        info = {"container": "mp3", "codec": "mp3", "sampleRateHz": 44_100,
                "channels": 1, "bitrateKbps": 128, "durationSeconds": 24.24}
        audio = b"previously paid and locally decoded audio"
        preflight = {"tier": "starter", "characterCount": 0, "characterLimit": 40_000}
        with tempfile.TemporaryDirectory() as directory:
            cache = Path(directory)
            path = cache / row["locale"] / f"{row['id']}.mp3"
            path.parent.mkdir()
            path.write_bytes(audio)
            ledger = renderer._ledger_payload(tracks, revisions, preflight)
            ledger["tracks"][f"en/{row['id']}"] = {
                "status": "invalid", "reservedCredits": row["characters"], "characterCost": 147,
                "requestId": "already-paid", "audioSha256": renderer.sha256(audio),
                "sourceTextSha256": row["textSha256"], "spokenTextSha256": row["spokenTextSha256"],
            }
            with patch.object(renderer, "CACHE", cache), patch.object(renderer, "LEDGER", cache / "ledger.json"), \
                 patch.object(renderer, "_audio_report", return_value=info), \
                 patch.object(renderer, "_render_request") as render:
                renderer._recover_validated_invalid(ledger, tracks)
                renderer._reconcile_account_costs(ledger, {"tier": "starter", "character_count": 147,
                    "character_limit": 40_000, "can_extend_character_limit": False,
                    "max_credit_limit_extension": 0})
                saved = json.loads((cache / "ledger.json").read_text(encoding="utf-8"))
        result = saved["tracks"][f"en/{row['id']}"]
        self.assertEqual(result["status"], "completed")
        self.assertEqual(result["recoveredFromStatus"], "invalid")
        self.assertEqual(result["costDecision"]["priorStatus"], "invalid")
        self.assertEqual(result["costDecision"]["observedCharacterCost"], 147)
        render.assert_not_called()

    def test_unrecorded_staged_audio_blocks_a_new_paid_request(self):
        tracks, _ = renderer.track_specs()
        row = next(item for item in tracks if item["locale"] == "en" and item["kind"] == "caption")
        with tempfile.TemporaryDirectory() as directory:
            cache = Path(directory)
            path = cache / row["locale"] / f"{row['id']}.mp3"
            path.parent.mkdir(parents=True)
            path.write_bytes(b"leftover audio")
            with patch.object(renderer, "CACHE", cache), \
                 patch.object(renderer, "_request_json") as get, \
                 patch.object(renderer, "_render_request") as render:
                with self.assertRaisesRegex(RuntimeError, "Unrecorded staged audio"):
                    renderer._render_track(row, {"tracks": {}}, "local-test-key")
            get.assert_not_called()
            render.assert_not_called()

    def test_budget_risk_counts_completed_cost_and_unresolved_reservations(self):
        ledger = {"tracks": {
            "en/done": {"status": "completed", "reservedCredits": 80, "characterCost": 75},
            "vi/unknown": {"status": "unknown", "reservedCredits": 130, "characterCost": None},
        }}
        self.assertEqual(renderer._risk_credits(ledger), 205)

    def test_transport_errors_do_not_echo_secret_or_raw_exception(self):
        from urllib.error import URLError

        with patch.object(renderer, "build_opener") as build:
            build.return_value.open.side_effect = URLError("credential-value-should-not-appear")
            with self.assertRaises(RuntimeError) as caught:
                renderer._request("user/subscription", "credential-value-should-not-appear")
        self.assertNotIn("credential-value-should-not-appear", str(caught.exception))


if __name__ == "__main__":
    unittest.main()
