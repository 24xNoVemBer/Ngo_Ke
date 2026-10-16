#!/usr/bin/env python3
"""Post-build embedded-asset guard: every source MP3 must be embedded.

Given a release APK and the mobile source tree, asserts:
1. The SHA-256 multiset of all source MP3 bytes equals the multiset of all
   MP3 entries inside the APK ZIP (catches silently dropped assets, even
   when filenames are obfuscated by the packager).
2. Every source MP3 has a matching `assets/app.manifest` entry with
   `type == "mp3"`, a `packagerHash` equal to the MD5 of the source bytes,
   and a correct non-empty `resourcesFilename` derived from the
   mobile-relative asset path (lowercase, separators to underscores,
   illegal characters stripped).

MD5 comparison uses the actual file digest only after the known-good entry
is confirmed (never bare filenames of obfuscated ZIP entries).

Usage:
  python tools/e2e/audit_apk_assets.py <apk> <mobile-root>

Standard library only. Exit 0 when the APK is complete, 1 with reasons
otherwise. Known behavior: the stale f2d0 build fails (54 remaining tracks
missing from its manifest); the fixed 13b2 build passes.
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def md5(data: bytes) -> str:
    return hashlib.md5(data).hexdigest()


def expected_resource_name(mobile_relative: str) -> str:
    name = mobile_relative.lower().replace("/", "_").replace("\\", "_")
    name = re.sub(r"[^a-z0-9_]", "", name.rsplit(".", 1)[0])
    return name


def source_mp3s(mobile_root: Path) -> dict[str, bytes]:
    """Map mobile-relative asset path -> bytes for MP3s under assets/voice."""
    out: dict[str, bytes] = {}
    voice = mobile_root / "assets" / "voice"
    for path in sorted(voice.rglob("*.mp3")):
        rel = path.relative_to(mobile_root).as_posix()
        out[rel] = path.read_bytes()
    return out


def zip_mp3_hashes(apk: Path) -> list[str]:
    with zipfile.ZipFile(apk) as archive:
        return [
            sha256(archive.read(name))
            for name in archive.namelist()
            if name.lower().endswith(".mp3")
        ]


def manifest_mp3_entries(apk: Path) -> list[dict]:
    with zipfile.ZipFile(apk) as archive:
        manifest = json.loads(archive.read("assets/app.manifest").decode("utf-8"))
    return [e for e in manifest.get("assets", []) if e.get("type") == "mp3"]


def audit(apk: Path, mobile_root: Path) -> list[str]:
    problems: list[str] = []
    sources = source_mp3s(mobile_root)
    if not sources:
        return ["no source MP3 files found under assets/voice"]
    zipped = zip_mp3_hashes(apk)
    expected = sorted(sha256(data) for data in sources.values())
    if sorted(zipped) != expected:
        missing = len(expected) - len(zipped)
        problems.append(
            f"MP3 multiset mismatch: {len(sources)} source files vs "
            f"{len(zipped)} ZIP entries ({missing:+d} difference)"
        )
    entries = manifest_mp3_entries(apk)
    by_hash = {}
    for entry in entries:
        by_hash.setdefault(entry.get("packagerHash"), []).append(entry)
    for rel, data in sorted(sources.items()):
        digest = md5(data)
        cands = by_hash.get(digest, [])
        if not cands:
            problems.append(f"no app.manifest mp3 entry with packagerHash for {rel}")
            continue
        want = expected_resource_name(rel)
        good = [e for e in cands
                if e.get("resourcesFilename") == want and e.get("resourcesFolder") == "raw"]
        if not good:
            got = sorted({(str(e.get("resourcesFilename")), str(e.get("resourcesFolder"))) for e in cands})
            problems.append(
                f"wrong resourcesFilename/Folder for {rel}: want ({want!r}, 'raw'), manifest has {got}"
            )
        if not all(e.get("resourcesFilename") for e in cands):
            problems.append(f"empty resourcesFilename for {rel}")
    return problems


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print(__doc__.strip().splitlines()[-7])
        print("usage: audit_apk_assets.py <apk> <mobile-root>")
        return 2
    problems = audit(Path(argv[1]), Path(argv[2]))
    if problems:
        print(f"APK ASSET GUARD FAILED ({len(problems)}):")
        for problem in problems:
            print(" - " + problem)
        return 1
    print("APK ASSET GUARD PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
