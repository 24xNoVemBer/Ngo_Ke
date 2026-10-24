from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
import generate_node_stories as generator


class NodeStoryVoiceGeneratorTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.rows = generator.read_rows()

    def fresh_progress(self) -> dict:
        fields = ("collectionId", "nodeId", "contentId", "locale", "textHash", "datasetRevision", "sourceDataSha256", "characters")
        return {
            "schemaVersion": 1,
            "scope": "node-story voice P3",
            "tracks": {
                generator.track_key(row): {**{name: row[name] for name in fields}, "status": "pending"}
                for row in self.rows
            },
        }

    def test_handoff_matches_all_34_sources_before_network(self) -> None:
        self.assertEqual(len(self.rows), 34)
        self.assertEqual({locale: sum(row["locale"] == locale for row in self.rows) for locale in generator.VOICES}, {"vi": 17, "en": 17})

    def test_source_hashes_are_eol_stable_and_keep_raw_provenance(self) -> None:
        lf = "ngõ kể\nsecond line\n".encode("utf-8")
        crlf = lf.replace(b"\n", b"\r\n")
        lf_hashes = generator.source_data_hashes(lf)
        crlf_hashes = generator.source_data_hashes(crlf)
        self.assertEqual(lf_hashes["sourceDataSha256"], crlf_hashes["sourceDataSha256"])
        self.assertNotEqual(lf_hashes["sourceDataRawSha256"], crlf_hashes["sourceDataRawSha256"])
        changed = crlf.replace("kể".encode("utf-8"), "kể!".encode("utf-8"))
        self.assertNotEqual(lf_hashes["sourceDataSha256"], generator.source_data_hashes(changed)["sourceDataSha256"])
        with self.assertRaisesRegex(ValueError, "bare carriage return"):
            generator.source_data_hashes(b"first\rsecond")

    def test_current_handoff_rows_keep_raw_and_normalized_hashes(self) -> None:
        for row in self.rows:
            raw = (generator.ROOT / row["source"]).read_bytes()
            hashes = generator.source_data_hashes(raw)
            self.assertEqual(row["sourceDataSha256"], hashes["sourceDataSha256"])
            self.assertEqual(row["sourceDataRawSha256"], hashes["sourceDataRawSha256"])

    def test_manifest_records_both_normalized_and_raw_source_hashes(self) -> None:
        row = self.rows[0]
        value = generator.manifest_value(
            [row], {"tracks": {generator.track_key(row): {"status": "pending"}}}
        )
        entry = value["entries"][0]
        self.assertEqual(entry["sourceDataSha256"], row["sourceDataSha256"])
        self.assertEqual(entry["sourceDataRawSha256"], row["sourceDataRawSha256"])

    def test_request_body_uses_pinned_locale_model_and_settings(self) -> None:
        for locale, expected in generator.VOICES.items():
            row = next(row for row in self.rows if row["locale"] == locale)
            payload = json.loads(generator.request_body(row))
            self.assertEqual(payload["model_id"], expected["model"])
            self.assertEqual(payload["language_code"], expected["languageCode"])
            self.assertEqual(payload["text"], row["text"])
            if "voiceSettings" in expected:
                self.assertEqual(payload["voice_settings"], expected["voiceSettings"])
            else:
                self.assertNotIn("voice_settings", payload)

    def test_uncertain_or_failed_paid_states_block_retry(self) -> None:
        for status in generator.BLOCKING_STATUSES:
            with self.subTest(status=status), tempfile.TemporaryDirectory() as temp:
                path = Path(temp) / "progress.json"
                progress = self.fresh_progress()
                progress["tracks"][generator.track_key(self.rows[0])]["status"] = status
                path.write_text(json.dumps(progress), encoding="utf-8")
                with patch.object(generator, "PROGRESS", path), self.assertRaisesRegex(RuntimeError, "reconcile before any retry"):
                    generator.load_progress(self.rows)

    def test_saved_200_audio_can_resume_without_a_new_post(self) -> None:
        row = self.rows[0]
        audio = b"saved response bytes for recovery"
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            progress_path = root / "progress.json"
            target = root / row["locale"] / f"{row['contentId']}.mp3"
            partial = target.with_name(target.name + ".partial")
            partial.parent.mkdir(parents=True)
            partial.write_bytes(audio)
            progress = self.fresh_progress()
            state = progress["tracks"][generator.track_key(row)]
            state.update({"status": "response_received", "responseSha256": generator.sha256(audio)})
            progress_path.write_text(json.dumps(progress), encoding="utf-8")
            with patch.object(generator, "PROGRESS", progress_path), \
                    patch.object(generator, "audio_path", side_effect=lambda item: root / item["locale"] / f"{item['contentId']}.mp3"), \
                    patch.object(generator, "partial_audio_path", side_effect=lambda item: (root / item["locale"] / f"{item['contentId']}.mp3").with_name(f"{item['contentId']}.mp3.partial")):
                resumed = generator.load_progress(self.rows)
            self.assertEqual(resumed["tracks"][generator.track_key(row)]["status"], "response_received")


if __name__ == "__main__":
    unittest.main()
