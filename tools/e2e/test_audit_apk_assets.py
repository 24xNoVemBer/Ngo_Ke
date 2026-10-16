#!/usr/bin/env python3
"""Synthetic unit tests for audit_apk_assets (stdlib only, no device)."""

import hashlib
import json
import tempfile
import unittest
import zipfile
from pathlib import Path

from audit_apk_assets import audit, expected_resource_name, md5


def make_apk(path: Path, manifest_entries, files: dict[str, bytes]) -> None:
    manifest = {"id": "test", "commitTime": "t", "assets": manifest_entries}
    with zipfile.ZipFile(path, "w", zipfile.ZIP_STORED) as archive:
        archive.writestr("assets/app.manifest", json.dumps(manifest))
        for name, data in files.items():
            archive.writestr("res/raw/" + name, data)


def entry_for(rel: str, data: bytes) -> dict:
    return {
        "name": Path(rel).stem,
        "type": "mp3",
        "packagerHash": md5(data),
        "resourcesFilename": expected_resource_name(rel),
        "resourcesFolder": "raw",
    }


class AuditApkAssetsTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root / "mobile" / "assets" / "voice").mkdir(parents=True)
        self.wav_a = b"RIFF" + b"a" * 3000
        self.wav_b = b"RIFF" + b"b" * 3000
        (self.root / "mobile" / "assets" / "voice" / "a.mp3").write_bytes(self.wav_a)
        (self.root / "mobile" / "assets" / "voice" / "b.mp3").write_bytes(self.wav_b)
        self.apk = self.root / "app.apk"

    def tearDown(self):
        self.tmp.cleanup()

    def test_complete_apk_passes(self):
        make_apk(self.apk, [
            entry_for("assets/voice/a.mp3", self.wav_a),
            entry_for("assets/voice/b.mp3", self.wav_b),
        ], {"a.mp3": self.wav_a, "b.mp3": self.wav_b})
        self.assertEqual(audit(self.apk, self.root / "mobile"), [])

    def test_missing_manifest_entry_fails(self):
        make_apk(self.apk, [
            entry_for("assets/voice/a.mp3", self.wav_a),
        ], {"a.mp3": self.wav_a, "b.mp3": self.wav_b})
        problems = audit(self.apk, self.root / "mobile")
        self.assertTrue(any("b.mp3" in p for p in problems), problems)

    def test_missing_zip_asset_fails(self):
        make_apk(self.apk, [
            entry_for("assets/voice/a.mp3", self.wav_a),
            entry_for("assets/voice/b.mp3", self.wav_b),
        ], {"a.mp3": self.wav_a})
        problems = audit(self.apk, self.root / "mobile")
        self.assertTrue(any("multiset" in p for p in problems), problems)

    def test_wrong_resources_filename_fails(self):
        bad = entry_for("assets/voice/a.mp3", self.wav_a)
        bad["resourcesFilename"] = "wrong_name"
        make_apk(self.apk, [
            bad,
            entry_for("assets/voice/b.mp3", self.wav_b),
        ], {"a.mp3": self.wav_a, "b.mp3": self.wav_b})
        problems = audit(self.apk, self.root / "mobile")
        self.assertTrue(any("resourcesFilename" in p for p in problems), problems)

    def test_wrong_resources_folder_fails(self):
        bad = entry_for("assets/voice/a.mp3", self.wav_a)
        bad["resourcesFolder"] = "drawable"
        make_apk(self.apk, [
            bad,
            entry_for("assets/voice/b.mp3", self.wav_b),
        ], {"a.mp3": self.wav_a, "b.mp3": self.wav_b})
        problems = audit(self.apk, self.root / "mobile")
        self.assertTrue(any("raw" in p for p in problems), problems)


if __name__ == "__main__":
    unittest.main()
