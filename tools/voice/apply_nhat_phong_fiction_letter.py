"""Activate the reviewed-fiction Vietnamese ElevenLabs batch without touching source-only packs."""
from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'data' / 'demo.json'
STAGED = ROOT / 'mobile' / 'assets' / 'voice-elevenlabs'
ACTIVE = ROOT / 'mobile' / 'assets' / 'voice' / 'post8' / 'remaining-elevenlabs'
ACTIVE_MANIFEST = ACTIVE / 'manifest.json'
CATALOG = ROOT / 'mobile' / 'src' / 'voice' / 'catalog.ts'
BACKUPS = ROOT / 'mobile' / 'assets' / 'voice' / 'backups'
VOICE_ID = '6adFm46eyy74snVn6YrT'
MODEL = 'eleven_v3'
FORMAT = 'mp3_44100_128'


def sha256(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def source_rows(data: dict) -> list[dict]:
    rows = [{'id': 'intro', 'kind': 'intro', 'text': data['intro']['text']}]
    for node in data['nodes']:
        rows.extend((
            {'id': f"{node['id']}-story", 'kind': 'story', 'nodeId': node['id'], 'text': node['story']},
            {'id': f"{node['id']}-caption", 'kind': 'caption', 'nodeId': node['id'], 'text': node['caption']},
        ))
    rows.extend({'id': f"{qa['id']}-answer", 'kind': 'answer', 'nodeId': qa['nodeId'], 'text': qa['answer']}
                for qa in data['qa'])
    return rows


def main() -> None:
    data_bytes = SOURCE.read_bytes()
    data = json.loads(data_bytes.decode('utf-8', 'strict'))
    rows = source_rows(data)
    staged = json.loads((STAGED / 'manifest.json').read_text(encoding='utf-8'))
    active = json.loads(ACTIVE_MANIFEST.read_text(encoding='utf-8'))
    staged_by_id = {entry['id']: entry for entry in staged['entries']}
    current = [entry for entry in active['tracks']
               if entry['collectionId'] == 'fiction-letter' and entry['locale'] == 'vi']
    if len(rows) != len(staged_by_id) != 34 or len(current) != 34:
        raise RuntimeError('expected exactly 34 reviewed-fiction Vietnamese tracks')
    if staged['sourceDataSha256'] != sha256(data_bytes):
        raise RuntimeError('staged source dataset hash mismatch')
    for row in rows:
        entry = staged_by_id.get(row['id'])
        if not entry or entry['textSha256'] != sha256(row['text'].encode('utf-8')):
            raise RuntimeError(f"source text mismatch: {row['id']}")
        source_asset = ROOT / entry['path']
        if not source_asset.is_file() or sha256(source_asset.read_bytes()) != entry['audioSha256']:
            raise RuntimeError(f"staged audio hash mismatch: {row['id']}")

    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    backup = BACKUPS / f'nhat-phong-fiction-letter-{stamp}'
    backup.mkdir(parents=True, exist_ok=False)
    shutil.copy2(CATALOG, backup / 'catalog.pre-nhat-phong.ts')
    shutil.copy2(ACTIVE_MANIFEST, backup / 'remaining-elevenlabs.pre-nhat-phong.json')
    for entry in current:
        target = ROOT / entry['path']
        destination = backup / 'fiction-letter' / 'vi' / f"{entry['id']}.mp3"
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(target, destination)

    for row in rows:
        entry = staged_by_id[row['id']]
        target = ACTIVE / 'fiction-letter' / 'vi' / f"{row['id']}.mp3"
        temp = target.with_suffix('.mp3.partial')
        shutil.copy2(ROOT / entry['path'], temp)
        temp.replace(target)

    for entry in active['tracks']:
        if entry['collectionId'] != 'fiction-letter' or entry['locale'] != 'vi':
            continue
        replacement = staged_by_id[entry['id']]
        entry.update({
            'voiceId': VOICE_ID,
            'model': MODEL,
            'outputFormat': FORMAT,
            'audioSha256': replacement['audioSha256'],
            'durationSeconds': replacement['durationSeconds'],
            'format': {
                **entry['format'],
                'codec': 'mp3', 'sampleRateHz': 44100, 'bitrateKbps': 128,
                'durationSeconds': replacement['durationSeconds'],
            },
            'humanApproved': False,
            'tts': {'provider': 'ElevenLabs', 'voiceSettings': 'provider defaults; no explicit voice_settings or audio tags'},
        })
    active['nhatPhongMigration'] = {
        'scope': 'fiction-letter/vi (34 reviewed-fiction demo tracks only)',
        'voiceId': VOICE_ID,
        'voiceName': 'Nhật Phong - Narrative & Compelling',
        'model': MODEL,
        'languageCode': 'vi',
        'outputFormat': FORMAT,
        'sourceDataSha256': sha256(data_bytes),
        'humanListeningApproved': False,
        'rollback': str(backup.relative_to(ROOT)).replace('\\', '/'),
    }
    ACTIVE_MANIFEST.write_text(json.dumps(active, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    original = subprocess.run(
        ['git', 'show', 'HEAD:mobile/src/voice/catalog.ts'], cwd=ROOT, check=True,
        text=True, encoding='utf-8', capture_output=True).stdout
    for row in rows:
        replacement = staged_by_id[row['id']]
        before = f'durationSeconds: '
        line_start = original.index(f'  "{row["id"]}": {{')
        line_end = original.index('\n', line_start)
        line = original[line_start:line_end]
        duration_start = line.index(before) + len(before)
        duration_end = line.index(' }', duration_start)
        original = original[:line_start] + line[:duration_start] + str(replacement['durationSeconds']) + line[duration_end:] + original[line_end:]
    CATALOG.write_text(original, encoding='utf-8')
    print(json.dumps({'activated': len(rows), 'backup': str(backup.relative_to(ROOT)).replace('\\', '/')}))


if __name__ == '__main__':
    main()
