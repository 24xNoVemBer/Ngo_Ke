"""Generate the fixed demo audio catalogue with ElevenLabs, using strict UTF-8."""
from __future__ import annotations
import hashlib, json, os, shutil, sys, time, urllib.error, urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/'data'/'demo.json'
OUT=ROOT/'mobile'/'assets'/'voice-elevenlabs'
VOICE_ID='6adFm46eyy74snVn6YrT'; VOICE_NAME='Nhật Phong - Narrative & Compelling'
MODEL_ID='eleven_v3'; OUTPUT_FORMAT='mp3_44100_128'; BUDGET=15000

def key():
    if os.environ.get('ELEVENLABS_API_KEY'): return os.environ['ELEVENLABS_API_KEY']
    for line in (ROOT/'.env.local').read_text(encoding='utf-8').splitlines():
        if line.lstrip().startswith('ELEVENLABS_API_KEY='): return line.split('=',1)[1].strip().strip('"').strip("'")
    raise RuntimeError('ELEVENLABS_API_KEY is unavailable')
def sha(s: str|bytes): return hashlib.sha256(s.encode('utf-8') if isinstance(s,str) else s).hexdigest()
def mp3_duration_seconds(audio: bytes) -> float:
    """Return the CBR MPEG-1 Layer III duration without requiring a codec package."""
    offset = 0
    if audio.startswith(b'ID3') and len(audio) >= 10:
        # ID3v2 synchsafe size; the ten-byte header itself is not audio data.
        offset = 10 + sum((audio[6 + index] & 0x7F) << (7 * (3 - index)) for index in range(4))
    for index in range(offset, min(offset + 4096, len(audio) - 4)):
        header = int.from_bytes(audio[index:index + 4], 'big')
        if header >> 21 != 0x7FF:
            continue
        version = (header >> 19) & 0x3
        layer = (header >> 17) & 0x3
        bitrate_index = (header >> 12) & 0xF
        sample_rate_index = (header >> 10) & 0x3
        if version != 3 or layer != 1 or bitrate_index in (0, 15) or sample_rate_index == 3:
            continue
        bitrate_kbps = (0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320)[bitrate_index]
        return round((len(audio) - index) * 8 / (bitrate_kbps * 1000), 3)
    raise RuntimeError('MP3 has no supported MPEG-1 Layer III frame header')
def api(url, token):
    req=urllib.request.Request(url,headers={'xi-api-key':token,'Accept':'application/json'})
    with urllib.request.urlopen(req,timeout=30) as r: return json.loads(r.read().decode('utf-8'))
def rows(data):
    out=[{'id':'intro','kind':'intro','text':data['intro']['text']}]
    for node in data['nodes']:
        out += [{'id':f"{node['id']}-story",'kind':'story','nodeId':node['id'],'text':node['story']},{'id':f"{node['id']}-caption",'kind':'caption','nodeId':node['id'],'text':node['caption']}]
    out += [{'id':f"{x['id']}-answer",'kind':'answer','nodeId':x['nodeId'],'text':x['answer']} for x in data['qa']]
    assert len(out)==34 and len({x['id'] for x in out})==34
    return out
def validate_text(row):
    text=row['text']; payload={'text':text,'model_id':MODEL_ID,'language_code':'vi'}
    body=json.dumps(payload,ensure_ascii=False,separators=(',',':')).encode('utf-8','strict')
    if json.loads(body.decode('utf-8','strict')) != payload: raise RuntimeError(f"round-trip changed {row['id']}")
    if any(0xD800<=ord(c)<=0xDFFF for c in text): raise RuntimeError(f"surrogate in {row['id']}")
    return body
def main():
    data_bytes=SOURCE.read_bytes(); data=json.loads(data_bytes.decode('utf-8','strict')); clips=rows(data)
    for clip in clips: validate_text(clip)
    expected=sum(len(x['text']) for x in clips)
    if expected>BUDGET: raise RuntimeError(f'estimate {expected} exceeds {BUDGET}')
    token=key(); sub=api('https://api.elevenlabs.io/v1/user/subscription',token)
    if sub['character_limit']-sub['character_count']<expected: raise RuntimeError('insufficient credits for conservative estimate')
    voices=api(f'https://api.elevenlabs.io/v1/voices/{VOICE_ID}',token)
    if voices.get('voice_id')!=VOICE_ID: raise RuntimeError('voice unavailable')
    models=api('https://api.elevenlabs.io/v1/models',token)
    if not any(x.get('model_id')==MODEL_ID and x.get('can_do_text_to_speech') for x in models): raise RuntimeError('model unavailable')
    OUT.mkdir(parents=True,exist_ok=True); old={}
    manifest_path=OUT/'manifest.json'
    if manifest_path.exists(): old={x['id']:x for x in json.loads(manifest_path.read_text(encoding='utf-8')).get('entries',[])}
    entries=[]
    sample=ROOT/'tools'/'voice'/'.cache'/'elevenlabs-samples'/'demo-02-story-nhat-phong-eleven-v3-20261021T160948Z.mp3'
    for clip in clips:
        target=OUT/f"{clip['id']}.mp3"; text_hash=sha(clip['text']); prior=old.get(clip['id'],{})
        if target.exists() and target.stat().st_size > 2048 and (not prior or (prior.get('textSha256')==text_hash and prior.get('voiceId')==VOICE_ID and prior.get('modelId')==MODEL_ID and prior.get('outputFormat')==OUTPUT_FORMAT and sha(target.read_bytes())==prior.get('audioSha256'))):
            audio=target.read_bytes()
        elif clip['id']=='demo-02-story' and sample.exists():
            audio=sample.read_bytes(); target.write_bytes(audio)
        else:
            body=validate_text(clip); req=urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format={OUTPUT_FORMAT}',data=body,method='POST',headers={'xi-api-key':token,'Accept':'audio/mpeg','Content-Type':'application/json; charset=utf-8','Content-Length':str(len(body))})
            try:
                with urllib.request.urlopen(req,timeout=120) as r: audio=r.read()
            except urllib.error.HTTPError as e: raise RuntimeError(f'{clip["id"]}: HTTP {e.code} {e.read().decode("utf-8","replace")}') from e
            if len(audio)<=2048 or not (audio.startswith(b'ID3') or audio[:2]==b'\xff\xfb'): raise RuntimeError(f'{clip["id"]}: invalid MP3 response')
            temp=target.with_suffix('.partial'); temp.write_bytes(audio); temp.replace(target)
        entries.append({**{k:clip[k] for k in ('id','kind','nodeId') if k in clip},'textSha256':text_hash,'path':target.relative_to(ROOT).as_posix(),'audioSha256':sha(audio),'bytes':len(audio),'durationSeconds':mp3_duration_seconds(audio),'voiceId':VOICE_ID,'modelId':MODEL_ID,'languageCode':'vi','outputFormat':OUTPUT_FORMAT,'voiceSettings':'provider defaults; no explicit voice_settings or audio tags'})
        (OUT/'progress.json').write_text(json.dumps({'sourceDataSha256':sha(data_bytes),'voiceId':VOICE_ID,'modelId':MODEL_ID,'entries':entries},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        print(f"ready {clip['id']} {len(audio)}")
    stamp=datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    backup=ROOT/'mobile'/'assets'/'voice'/'backups'/f'elevenlabs-migration-{stamp}'
    backup.mkdir(parents=True,exist_ok=False)
    shutil.copy2(ROOT/'mobile'/'assets'/'voice'/'manifest.json',backup/'manifest.vieneu.json')
    shutil.copy2(ROOT/'mobile'/'src'/'voice'/'catalog.ts',backup/'catalog.vieneu.ts')
    manifest={'schemaVersion':1,'source':'data/demo.json','sourceDataSha256':sha(data_bytes),'voice':{'id':VOICE_ID,'name':VOICE_NAME},'model':MODEL_ID,'format':OUTPUT_FORMAT,'entries':entries,'generatedAt':datetime.now(timezone.utc).isoformat(),'rollback':{'catalog':'mobile/assets/voice/backups/'+backup.name+'/catalog.vieneu.ts','manifest':'mobile/assets/voice/backups/'+backup.name+'/manifest.vieneu.json','legacyAudioDirectory':'mobile/assets/voice'}}
    manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    lines=['/* eslint-disable @typescript-eslint/no-require-imports -- Metro needs statically analyzable asset requires. */',f'export const voiceCatalogueRevision = {json.dumps(sha(data_bytes))};',"export type VoiceClipKind = 'intro' | 'story' | 'caption' | 'answer';","export interface VoiceTrack { id: string; kind: VoiceClipKind; nodeId?: string; source: number; textHash: string; durationSeconds: number }",'export const voiceTracks: Record<string, VoiceTrack> = {']
    for x in entries: lines.append(f"  {json.dumps(x['id'])}: {{ id: {json.dumps(x['id'])}, kind: {json.dumps(x['kind'])}, "+(f"nodeId: {json.dumps(x['nodeId'])}, " if 'nodeId' in x else '')+f"source: require('../../assets/voice-elevenlabs/{x['id']}.mp3'), textHash: {json.dumps(x['textSha256'])}, durationSeconds: {x['durationSeconds']} }},")
    lines+=['};','']; (ROOT/'mobile'/'src'/'voice'/'catalog.ts').write_text('\n'.join(lines),encoding='utf-8')
    after=api('https://api.elevenlabs.io/v1/user/subscription',token); print(json.dumps({'clips':len(entries),'estimatedCredits':expected,'usedBefore':sub['character_count'],'usedAfter':after['character_count'],'consumed':after['character_count']-sub['character_count']}))
if __name__=='__main__': main()
