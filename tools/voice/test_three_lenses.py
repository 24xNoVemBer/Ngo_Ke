import json
import tempfile
import unittest
from pathlib import Path

from three_lenses import (
    COLLECTION,
    CORE,
    JOURNEY,
    LOCALES,
    NODE_IDS,
    asset_path,
    catalog_source,
    dataset_revisions,
    inventory,
)


class ThreeLensesVoiceInventoryTests(unittest.TestCase):
    def test_exact_28_track_identities_per_locale(self):
        rows = inventory()
        self.assertEqual({locale: len(rows[locale]) for locale in LOCALES}, {"en": 28, "vi": 28})
        for locale in LOCALES:
            tracks = [row[3] for row in rows[locale]]
            self.assertEqual([row["kind"] for row in tracks].count("intro"), 1)
            self.assertEqual([row["kind"] for row in tracks].count("story"), 8)
            self.assertEqual([row["kind"] for row in tracks].count("caption"), 3)
            self.assertEqual([row["kind"] for row in tracks].count("answer"), 16)
            self.assertEqual(len({row["id"] for row in tracks}), 28)
            self.assertEqual({row["id"] for row in tracks if row["kind"] == "answer"},
                             {f"{qa['id']}-answer" for qa in json.loads(CORE[locale].read_text(encoding="utf-8"))["qa"]})
            self.assertEqual({row["nodeId"] for row in tracks if row.get("nodeId")}, set(NODE_IDS))

    def test_full_chapters_match_the_core_first_story_without_splitting_nodes(self):
        for locale in LOCALES:
            core = json.loads(CORE[locale].read_text(encoding="utf-8"))
            journey = json.loads(JOURNEY[locale].read_text(encoding="utf-8"))
            self.assertEqual(len(journey["chapters"]), 5)
            self.assertEqual([sum(chapter["nodeId"] == node_id for chapter in journey["chapters"])
                              for node_id in NODE_IDS], [1, 1, 3])
            for node in core["nodes"]:
                first = next(chapter for chapter in journey["chapters"] if chapter["nodeId"] == node["id"])
                self.assertEqual(first["voiceContentId"], f"{node['id']}-story")
                self.assertEqual(first["text"], node["story"])

    def test_revision_pair_and_companion_hashes_are_valid(self):
        revisions = dataset_revisions()
        self.assertEqual(set(revisions), set(LOCALES))
        for locale, revision in revisions.items():
            journey = json.loads(JOURNEY[locale].read_text(encoding="utf-8"))
            self.assertEqual(journey["datasetRevision"], revision)

    def test_asset_path_rejects_traversal_and_keeps_valid_paths_under_root(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory) / "three-lenses"
            valid = asset_path(root, "vi", "qa-example-answer")
            self.assertEqual(valid, (root / "vi" / "qa-example-answer.mp3").resolve())
            for locale, content_id in (("fr", "intro"), ("en", "../escape"), ("en", "x/escape")):
                with self.subTest(locale=locale, content_id=content_id):
                    with self.assertRaises(ValueError):
                        asset_path(root, locale, content_id)

    def test_catalog_source_uses_literal_requires_and_exact_locale_revision(self):
        catalogues = {
            locale: {"datasetRevision": f"{locale}-revision", "tracks": [{
                "id": "intro", "kind": "intro", "textHash": "a" * 64, "durationSeconds": 1.25,
            }]} for locale in LOCALES
        }
        source = catalog_source(catalogues)
        self.assertIn(f'THREE_LENSES_VOICE_COLLECTION = "{COLLECTION}"', source)
        self.assertIn('datasetRevision: "en-revision"', source)
        self.assertIn('datasetRevision: "vi-revision"', source)
        self.assertIn('require("../../assets/voice/three-lenses/en/intro.mp3")', source)
        self.assertIn('require("../../assets/voice/three-lenses/vi/intro.mp3")', source)


if __name__ == "__main__":
    unittest.main()
