"""Create the fixed, offline speech catalogue from data/demo.json."""

from __future__ import annotations

import hashlib
import importlib.metadata
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / "tools" / "voice" / ".cache"
from tts_local import CODEC_REPOSITORY, CODEC_REVISION, MODEL_REPOSITORY, MODEL_REVISION, load_tts

VOICE = "Đoan Trang"
SDK_VERSION = "3.7.1"
SAMPLE_RATE = 48_000
OUTPUT = ROOT / "mobile" / "assets" / "voice"
WAV_DIR = CACHE / "v1-wav"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def run(*args: str) -> str:
    return subprocess.run(args, check=True, capture_output=True, text=True).stdout.strip()


def clip_rows(dataset: dict[str, object]) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = [{"id": "intro", "kind": "intro", "text": dataset["intro"]["text"]}]
    for node in dataset["nodes"]:
        rows.extend((
            {"id": f"{node['id']}-story", "kind": "story", "nodeId": node["id"], "text": node["story"]},
            {"id": f"{node['id']}-caption", "kind": "caption", "nodeId": node["id"], "text": node["caption"]},
        ))
    rows.extend(
        {"id": f"{item['id']}-answer", "kind": "answer", "nodeId": item["nodeId"], "text": item["answer"]}
        for item in dataset["qa"]
    )
    ids = [row["id"] for row in rows]
    assert len(rows) == 34 and len(set(ids)) == 34, "Expected 1 intro, 6 stories, 6 captions and 21 answers"
    assert all(row.get("text", "").strip() for row in rows), "Audio text must not be blank"
    return rows


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if importlib.metadata.version("vieneu") != SDK_VERSION:
        raise RuntimeError(f"Expected vieneu=={SDK_VERSION}")
    ffmpeg = shutil.which("ffmpeg")
    ffprobe = shutil.which("ffprobe")
    if not ffmpeg or not ffprobe:
        raise RuntimeError("ffmpeg and ffprobe are required to create and measure MP3 assets")

    source_path = ROOT / "data" / "demo.json"
    source_bytes = source_path.read_bytes()
    dataset = json.loads(source_bytes)
    rows = clip_rows(dataset)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    WAV_DIR.mkdir(parents=True, exist_ok=True)
    manifest_path = OUTPUT / "manifest.json"
    old_manifest = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    old_tts = old_manifest.get("tts", {})
    old_entries = {item.get("id"): item for item in old_manifest.get("entries", [])}
    tts = load_tts()
    entries = []

    for row in rows:
        audio_path = OUTPUT / f"{row['id']}.mp3"
        text_hash = sha256(row["text"].encode("utf-8"))
        prior = old_entries.get(row["id"], {})
        compatible_model = (
            old_manifest.get("voice") == VOICE
            and old_tts.get("sdk") == f"vieneu=={SDK_VERSION}"
            and old_tts.get("modelRevision") == MODEL_REVISION
            and old_tts.get("codecRevision") == CODEC_REVISION
        )
        audio_hash = sha256(audio_path.read_bytes()) if audio_path.is_file() else ""
        reusable = (
            compatible_model and prior.get("textSha256") == text_hash
            and prior.get("audioSha256") == audio_hash and bool(audio_hash)
        )
        if reusable:
            probe = json.loads(run(
                ffprobe, "-v", "error", "-select_streams", "a:0",
                "-show_entries", "stream=codec_name,sample_rate,channels",
                "-show_entries", "format=duration", "-of", "json", str(audio_path),
            ))
            stream = probe.get("streams", [{}])[0]
            duration = float(probe.get("format", {}).get("duration", 0))
            reusable = (
                stream.get("codec_name") == "mp3"
                and int(stream.get("sample_rate", 0)) == SAMPLE_RATE
                and int(stream.get("channels", 0)) == 1
                and duration > 0
            )

        if not reusable:
            wav_path = WAV_DIR / f"{row['id']}.wav"
            temp_audio_path = audio_path.with_name(f"{audio_path.stem}.tmp.mp3")
            tts.save(tts.infer(row["text"], voice=VOICE), str(wav_path))
            try:
                subprocess.run(
                    [ffmpeg, "-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-i", str(wav_path),
                     "-vn", "-ac", "1", "-ar", str(SAMPLE_RATE), "-codec:a", "libmp3lame", "-b:a", "96k", str(temp_audio_path)],
                    check=True, capture_output=True,
                )
                probe = json.loads(run(
                    ffprobe, "-v", "error", "-select_streams", "a:0",
                    "-show_entries", "stream=codec_name,sample_rate,channels",
                    "-show_entries", "format=duration", "-of", "json", str(temp_audio_path),
                ))
                stream = probe.get("streams", [{}])[0]
                duration = float(probe.get("format", {}).get("duration", 0))
                if (duration <= 0 or temp_audio_path.stat().st_size <= 2048
                        or stream.get("codec_name") != "mp3"
                        or int(stream.get("sample_rate", 0)) != SAMPLE_RATE
                        or int(stream.get("channels", 0)) != 1):
                    raise RuntimeError(f"Invalid generated audio: {row['id']}")
                os.replace(temp_audio_path, audio_path)
            finally:
                wav_path.unlink(missing_ok=True)
                temp_audio_path.unlink(missing_ok=True)
        else:
            print(f"Reused verified {row['id']}")

        entries.append({
            **{key: row[key] for key in ("id", "kind", "nodeId") if key in row},
            "textSha256": text_hash,
            "path": audio_path.relative_to(ROOT).as_posix(),
            "durationSeconds": round(duration, 3),
            "audioSha256": sha256(audio_path.read_bytes()),
        })
        print(f"{row['id']} {duration:.2f}s {audio_path.stat().st_size} bytes")

    manifest = {
        "schemaVersion": 1,
        "source": "data/demo.json",
        "sourceDataSha256": sha256(source_bytes),
        "voice": VOICE,
        "tts": {
            "sdk": f"vieneu=={SDK_VERSION}",
            "backend": "onnx/cpu",
            "model": MODEL_REPOSITORY,
            "modelRevision": MODEL_REVISION,
            "codec": CODEC_REPOSITORY,
            "codecRevision": CODEC_REVISION,
            "license": "See mobile/assets/voice/LICENSES.md",
        },
        "format": {"container": "mp3", "codec": "mp3", "sampleRateHz": SAMPLE_RATE, "channels": 1, "bitrateKbps": 96},
        "entries": entries,
    }
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    imports = [
        "/* eslint-disable @typescript-eslint/no-require-imports -- Metro needs statically analyzable asset requires. */",
        f"export const voiceCatalogueRevision = {json.dumps(sha256(source_bytes))};",
        "export type VoiceClipKind = 'intro' | 'story' | 'caption' | 'answer';",
        "export interface VoiceTrack { id: string; kind: VoiceClipKind; nodeId?: string; source: number; textHash: string; durationSeconds: number }",
        "export const voiceTracks: Record<string, VoiceTrack> = {",
    ]
    for entry in entries:
        imports.append(
            f"  {json.dumps(entry['id'], ensure_ascii=False)}: {{ id: {json.dumps(entry['id'], ensure_ascii=False)}, "
            f"kind: {json.dumps(entry['kind'])}, "
            + (f"nodeId: {json.dumps(entry['nodeId'])}, " if "nodeId" in entry else "")
            + f"source: require('../../assets/voice/{entry['id']}.mp3'), "
            + f"textHash: {json.dumps(entry['textSha256'])}, durationSeconds: {entry['durationSeconds']} }},"
        )
    imports.extend(("};", ""))
    catalog_path = ROOT / "mobile" / "src" / "voice" / "catalog.ts"
    catalog_path.parent.mkdir(parents=True, exist_ok=True)
    catalog_path.write_text("\n".join(imports), encoding="utf-8")
    print(f"Generated {len(entries)} clips; manifest: {OUTPUT / 'manifest.json'}")


if __name__ == "__main__":
    main()
