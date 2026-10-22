"""Local-only finalizer for the completed Nhật Phong Three Lenses checkpoint."""
from __future__ import annotations
import hashlib,json,re,shutil,sys
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]; BASE=ROOT/'mobile/assets/voice/three-lenses-nhat-phong'; OUT=BASE/'vi'; PROG=BASE/'progress.json'; MAN=BASE/'manifest.json'; CAT=ROOT/'mobile/src/voice/threeLensesCatalog.ts'
VOICE='6adFm46eyy74snVn6YrT'; MODEL='eleven_v3'; FORMAT='mp3_44100_128'
def h(b): return hashlib.sha256(b if isinstance(b,bytes) else b.encode()).hexdigest()
def main():
 sys.path.insert(0,str(ROOT/'tools/voice')); import three_lenses as t
 p=json.loads(PROG.read_text(encoding='utf-8')); by=p.get('tracks',{}); rows=[]
 for collection,source,source_bytes,row in t.inventory()['vi']:
  e=by.get(row['id']); path=OUT/(row['id']+'.mp3'); th=h(row['text'])
  if not e or not path.is_file() or e.get('textHash')!=th or h(path.read_bytes())!=e.get('audioSha256') or e.get('voiceId')!=VOICE or e.get('model')!=MODEL or e.get('durationSeconds',0)<=0: raise RuntimeError('checkpoint mismatch '+row['id'])
  if e.get('sourceDataSha256')!=h(source_bytes): raise RuntimeError('source mismatch '+row['id'])
  rows.append(e)
 if len(rows)!=28: raise RuntimeError('expected 28 tracks')
 stamp=datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ'); backup=ROOT/'mobile/assets/voice/backups'/('nhat-phong-three-lenses-finalize-'+stamp); backup.mkdir(parents=True); shutil.copy2(CAT,backup/'threeLensesCatalog.pre-nhat-phong.ts')
 src=CAT.read_text(encoding='utf-8')
 for e in rows:
  old=f'../../assets/voice/three-lenses-elevenlabs/vi/{e["id"]}.mp3'; new=f'../../assets/voice/three-lenses-nhat-phong/vi/{e["id"]}.mp3'
  if old not in src: raise RuntimeError('missing static mapping '+e['id'])
  src=src.replace(old,new,1)
  pos=src.index(new); end=src.index('\n',pos); line=src[pos:end]
  src=src[:pos]+line.replace(re.search(r'durationSeconds: [0-9.]+',line).group(0),f'durationSeconds: {e["durationSeconds"]}')+src[end:]
 CAT.write_text(src,encoding='utf-8')
 manifest={'schemaVersion':1,'scope':'old-quarter-three-lenses/vi preview','sourceOnly':True,'humanApproved':False,'selectedForShipping':False,'voice':{'id':VOICE,'name':'Nhật Phong - Narrative & Compelling'},'model':MODEL,'outputFormat':FORMAT,'entries':rows,'generatedAt':datetime.now(timezone.utc).isoformat(),'rollback':str(backup.relative_to(ROOT)).replace('\\','/')}
 MAN.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8'); print(json.dumps({'tracks':len(rows),'backup':manifest['rollback']}))
if __name__=='__main__':main()
