"""Generate resumable offline Vietnamese Three Lenses preview audio with ElevenLabs."""
from __future__ import annotations
import hashlib,json,os,re,shutil,sys,urllib.error,urllib.request
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]; OUT=ROOT/'mobile/assets/voice/three-lenses-nhat-phong/vi'; MAN=OUT.parent/'manifest.json'; PROG=OUT.parent/'progress.json'; CATALOG=ROOT/'mobile/src/voice/threeLensesCatalog.ts'
VOICE='6adFm46eyy74snVn6YrT'; MODEL='eleven_v3'; FORMAT='mp3_44100_128'; RESERVE=30000; BUDGET=80000
def h(b): return hashlib.sha256(b if isinstance(b,bytes) else b.encode('utf-8')).hexdigest()
def key():
  if os.getenv('ELEVENLABS_API_KEY'): return os.environ['ELEVENLABS_API_KEY']
  for l in (ROOT/'.env.local').read_text(encoding='utf-8').splitlines():
    if l.startswith('ELEVENLABS_API_KEY='): return l.split('=',1)[1].strip().strip('"\'')
  raise RuntimeError('ELEVENLABS_API_KEY unavailable')
def get(url,k):
  with urllib.request.urlopen(urllib.request.Request(url,headers={'xi-api-key':k,'Accept':'application/json'}),timeout=30) as r:return json.loads(r.read().decode('utf-8'))
def duration(b):
  o=10+sum((b[6+i]&127)<<(7*(3-i)) for i in range(4)) if b.startswith(b'ID3') else 0
  for i in range(o,min(o+4096,len(b)-4)):
    x=int.from_bytes(b[i:i+4],'big'); bit=(x>>12)&15
    if x>>21==0x7ff and ((x>>19)&3)==3 and ((x>>17)&3)==1 and bit not in (0,15) and ((x>>10)&3)!=3:
      return round((len(b)-i)*8/((0,32,40,48,56,64,80,96,112,128,160,192,224,256,320)[bit]*1000),3)
  raise RuntimeError('unsupported MP3')
def main():
  sys.path.insert(0,str(ROOT/'tools/voice')); import three_lenses as t
  rows=[]
  for collection,source,source_bytes,row in t.inventory()['vi']:
    text=row['text']; payload={'text':text,'model_id':MODEL,'language_code':'vi'}; body=json.dumps(payload,ensure_ascii=False,separators=(',',':')).encode('utf-8','strict')
    if json.loads(body.decode('utf-8','strict'))!=payload or any(0xd800<=ord(c)<=0xdfff for c in text): raise RuntimeError('unicode validation failed '+row['id'])
    rows.append({**row,'textHash':h(text),'source':source.relative_to(ROOT).as_posix(),'sourceDataSha256':h(source_bytes),'body':body})
  if len(rows)!=28: raise RuntimeError('expected 28 VI tracks')
  estimate=sum(len(r['text']) for r in rows); k=key(); sub=get('https://api.elevenlabs.io/v1/user/subscription',k); rem=sub['character_limit']-sub['character_count']
  if rem-estimate<RESERVE or estimate>BUDGET or sub.get('can_extend_character_limit') is not False: raise RuntimeError('credit safety check failed')
  voice=get('https://api.elevenlabs.io/v1/voices/'+VOICE,k); models=get('https://api.elevenlabs.io/v1/models',k)
  if voice.get('voice_id')!=VOICE or not any(m.get('model_id')==MODEL and m.get('can_do_text_to_speech') for m in models): raise RuntimeError('voice/model unavailable')
  old=json.loads(PROG.read_text(encoding='utf-8')) if PROG.exists() else {'tracks':{}}; OUT.mkdir(parents=True,exist_ok=True); entries=[]
  for r in rows:
    target=OUT/(r['id']+'.mp3'); prior=old['tracks'].get(r['id'],{})
    if target.exists() and prior.get('textHash')==r['textHash'] and h(target.read_bytes())==prior.get('audioSha256'): audio=target.read_bytes()
    else:
      req=urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format={FORMAT}',data=r['body'],method='POST',headers={'xi-api-key':k,'Accept':'audio/mpeg','Content-Type':'application/json; charset=utf-8'})
      try:
        with urllib.request.urlopen(req,timeout=120) as x: audio=x.read()
      except urllib.error.HTTPError as e: raise RuntimeError(f"{r['id']}: HTTP {e.code} {e.read().decode('utf-8','replace')}")
      if len(audio)<2048 or not (audio.startswith(b'ID3') or audio[:2]==b'\xff\xfb'): raise RuntimeError('invalid MP3 '+r['id'])
      tmp=target.with_suffix('.partial'); tmp.write_bytes(audio); tmp.replace(target)
    e={k:r[k] for k in ('id','kind','nodeId','source','sourceDataSha256','textHash') if k in r}; e.update({'collectionId':'old-quarter-three-lenses','locale':'vi','voiceId':VOICE,'voiceName':'Nhật Phong - Narrative & Compelling','model':MODEL,'outputFormat':FORMAT,'audioSha256':h(audio),'bytes':len(audio),'durationSeconds':duration(audio),'humanApproved':False,'sourceOnly':True}); entries.append(e); old['tracks'][r['id']]=e; PROG.write_text(json.dumps(old,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
  stamp=datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ'); backup=ROOT/'mobile/assets/voice/backups'/('nhat-phong-three-lenses-'+stamp); backup.mkdir(parents=True); shutil.copy2(CATALOG,backup/'threeLensesCatalog.pre-nhat-phong.ts')
  src=CATALOG.read_text(encoding='utf-8')
  for e in entries:
    pat=r'(source: require\(["\'])\.\./\.\./assets/voice/three-lenses-elevenlabs/vi/'+re.escape(e['id'])+r'\.mp3(["\']\), textHash: "[0-9a-f]+", durationSeconds: )[^ }]+ '
    src,n=re.subn(pat,r'\1../../assets/voice/three-lenses-nhat-phong/vi/'+e['id']+r'.mp3\2'+str(e['durationSeconds'])+' ',src)
    if n!=1: raise RuntimeError('catalog mapping mismatch '+e['id'])
  CATALOG.write_text(src,encoding='utf-8'); MAN.write_text(json.dumps({'schemaVersion':1,'scope':'old-quarter-three-lenses/vi preview','voiceId':VOICE,'model':MODEL,'format':FORMAT,'sourceOnly':True,'humanApproved':False,'selectedForShipping':False,'estimatedCredits':estimate,'entries':entries,'rollback':str(backup.relative_to(ROOT)).replace('\\','/')},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
  after=get('https://api.elevenlabs.io/v1/user/subscription',k); print(json.dumps({'tracks':len(entries),'estimate':estimate,'before':sub['character_count'],'after':after['character_count'],'consumed':after['character_count']-sub['character_count'],'backup':str(backup.relative_to(ROOT)).replace('\\','/')}))
if __name__=='__main__':main()
