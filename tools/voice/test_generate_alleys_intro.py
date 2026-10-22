import contextlib
import io
import json
import tempfile
import unittest
import urllib.error
from io import BytesIO
from pathlib import Path
from unittest.mock import patch

import generate_alleys_intro as generator


class AlleyIntroGeneratorTests(unittest.TestCase):
    def setUp(self):
        self.rows = generator.read_rows("vi")

    def test_offline_audit_matches_exact_four_reserved_texts(self):
        self.assertEqual([row["collectionId"] for row in self.rows], list(generator.COLLECTIONS))
        self.assertEqual(sum(row["characters"] for row in self.rows), 2432)
        self.assertEqual(generator.RESERVE, 10_000)
        self.assertEqual(generator.BUDGET, 80_000)
        for row in self.rows:
            payload = json.loads(generator.request_body(row, "vi"))
            self.assertEqual(payload, {
                "text": row["text"],
                "model_id": "eleven_v3",
                "language_code": "vi",
            })

    def test_english_audit_keeps_finalized_text_and_talia_configuration(self):
        rows = generator.read_rows("en")
        self.assertEqual([row["collectionId"] for row in rows], list(generator.COLLECTIONS))
        self.assertEqual([row["characters"] for row in rows], [792, 653, 727, 709])
        self.assertEqual(sum(row["characters"] for row in rows), 2881)
        for row in rows:
            self.assertEqual(json.loads(generator.request_body(row, "en")), {
                "text": row["text"],
                "model_id": "eleven_v4",
                "language_code": "en",
                "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
            })

    def test_default_audit_never_reads_a_key_or_calls_the_api(self):
        stdout = io.StringIO()
        with patch("sys.argv", ["generate_alleys_intro.py", "--locale", "vi"]), \
             patch.object(generator, "get_api_key", side_effect=AssertionError("offline audit read a key")), \
             patch.object(generator.urllib.request, "urlopen", side_effect=AssertionError("offline audit used the API")), \
             contextlib.redirect_stdout(stdout):
            generator.main()
        self.assertEqual(json.loads(stdout.getvalue())["apiRequests"], 0)

    def test_uncertain_paid_request_state_blocks_automatic_resume(self):
        with tempfile.TemporaryDirectory() as temp:
            progress_path = Path(temp) / "progress.json"
            row = self.rows[0]
            progress_path.write_text(json.dumps({
                "schemaVersion": 1,
                "locale": "vi",
                "tracks": {row["collectionId"]: {"status": "requesting", "textHash": row["textHash"]}},
            }), encoding="utf-8")
            with self.assertRaisesRegex(RuntimeError, "reconcile API outcome"):
                generator.load_progress(progress_path, self.rows, "vi")

    def test_known_response_resumes_partial_audio_without_another_paid_request(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            out = root / "vi"
            out.mkdir()
            row = self.rows[0]
            target = out / f"{row['collectionId']}-intro.mp3"
            partial = target.with_name(target.name + ".partial")
            audio = b"already-received-audio"
            partial.write_bytes(audio)
            progress_path = root / "progress.json"
            progress_path.write_text(json.dumps({
                "schemaVersion": 1,
                "locale": "vi",
                "voiceId": generator.VOICES["vi"]["voiceId"],
                "model": generator.VOICES["vi"]["model"],
                "charactersPosted": row["characters"],
                "charactersAccepted": 0,
                "apiRequests": 1,
                "tracks": {row["collectionId"]: {
                    "status": "response_received",
                    "textHash": row["textHash"],
                    "responseSha256": generator.sha256(audio),
                }},
            }), encoding="utf-8")
            before = {"character_limit": 100_000, "character_count": 0, "can_extend_character_limit": False}
            with patch.object(generator, "ROOT", root), \
                 patch.object(generator, "progress_paths", return_value=(out, root / "manifest.json", progress_path)), \
                 patch.object(generator, "get_api_key", return_value="test-key"), \
                 patch.object(generator, "api_json", side_effect=[
                     before,
                     {"voice_id": generator.VOICES["vi"]["voiceId"]},
                     [{"model_id": generator.VOICES["vi"]["model"], "can_do_text_to_speech": True}],
                     before,
                 ]), \
                 patch.object(generator, "validate_mp3", return_value={"durationSeconds": 1.0, "sampleRate": 44_100, "channels": 1}), \
                 patch.object(generator.urllib.request, "urlopen") as api:
                manifest = generator.generation("vi", [row])

            api.assert_not_called()
            self.assertTrue(target.is_file())
            self.assertFalse(partial.exists())
            self.assertEqual(manifest["apiRequestsThisRun"], 0)
            self.assertEqual(manifest["charactersPostedThisRun"], 0)
            self.assertFalse(manifest["humanApproved"])
            self.assertFalse(manifest["listened"])

    def test_missing_key_stops_before_any_api_request(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            with patch.object(generator, "progress_paths", return_value=(root / "vi", root / "manifest.json", root / "progress.json")), \
                 patch.object(generator, "get_api_key", side_effect=RuntimeError("missing test key")), \
                 patch.object(generator.urllib.request, "urlopen") as api:
                with self.assertRaisesRegex(RuntimeError, "missing test key"):
                    generator.generation("vi", self.rows)
                api.assert_not_called()
            self.assertFalse((root / "vi").exists())

    def test_api_error_detail_is_reported_without_echoing_the_key(self):
        response = BytesIO(b'{"detail":{"status":"invalid_voice","message":"bad test-key"}}')
        error = urllib.error.HTTPError("https://example.invalid", 400, "Bad Request", {}, response)
        with patch.object(generator.urllib.request, "urlopen", side_effect=error):
            with self.assertRaisesRegex(RuntimeError, r"HTTP 400: bad \[redacted\]") as raised:
                generator.api_json("https://example.invalid", "test-key")
        self.assertNotIn("test-key", str(raised.exception))


if __name__ == "__main__":
    unittest.main()
