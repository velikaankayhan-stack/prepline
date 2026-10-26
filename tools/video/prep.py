# Zaman çizelgesi + ses karışımı. Kullanım: python3 prep.py <ses_kök> <out_dir> [fake] [id...]
import json,re,subprocess,sys,os
SES=sys.argv[1]; OUT=sys.argv[2]; FAKE='fake' in sys.argv[3:]; ONLY=[a for a in sys.argv[3:] if a!='fake']
s=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','src','content.js')).read()
A=json.loads(re.search(r'var GANIM=(\{.*?\});\n',s).group(1))
G=json.loads(re.search(r'var GRAM=(\[.*?\]);\n',s).group(1))
jobs=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'isler.json')))
os.makedirs(OUT,exist_ok=True)
def dur(p): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p]).decode().strip())
import numpy as np
SR=48000; BASE_TEMPO=1.0   # hızlandırma yok: doğal konuşma hızı
MAX_PAUSE=0.35             # cümle içi/arası duraklama en fazla bu kadar kalır (sn)
def process(mp3, out_wav, tempo):
    """Baş/son sessizliği kırp, uzun iç sessizlikleri MAX_PAUSE'a indir, sonra hızlandır. Zaman eşleme fonksiyonu döndürür."""
    raw=subprocess.check_output(['ffmpeg','-v','error','-i',mp3,'-f','f32le','-ac','1','-ar',str(SR),'-'])
    x=np.frombuffer(raw,dtype=np.float32).copy()
    win=int(SR*0.01); n=len(x)//win
    rms=np.sqrt(np.mean(x[:n*win].reshape(n,win)**2,axis=1)+1e-12); db=20*np.log10(rms)
    loud=db>-42
    if not loud.any(): loud[:]=True
    first=int(np.argmax(loud)); last=n-1-int(np.argmax(loud[::-1]))
    keep=np.zeros(n,bool); keep[max(0,first-2):min(n,last+3)]=True
    i=first
    while i<=last:
        if not loud[i]:
            j=i
            while j<=last and not loud[j]: j+=1
            run=j-i
            half=int(MAX_PAUSE*50)
            if run>2*half: keep[i+half:j-half]=False   # en fazla MAX_PAUSE bırak
            i=j
        else: i+=1
    removed=np.cumsum(~keep)*0.01           # her pencere sonuna kadar kesilen süre
    y=np.concatenate([x[k*win:(k+1)*win] for k in range(n) if keep[k]]) if keep.any() else x
    tmp=out_wav+'.raw.wav'
    subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','1','-i','-',tmp],input=y.astype(np.float32).tobytes(),check=True)
    subprocess.run(['ffmpeg','-v','error','-y','-i',tmp,'-af','atempo=%.3f'%tempo,'-ar',str(SR),out_wav],check=True)
    os.remove(tmp)
    def mp(ms):
        k=min(n-1,max(0,int(ms/10)))
        return max(0.0,(ms/1000-removed[k]))/tempo*1000
    return mp
def tokens_with_times(text, words, mp):
    """Orijinal metni (noktalamalı) kelimelere böl, sözcük zamanlarını sırayla eşleştir."""
    toks=text.split(); norm=lambda w:re.sub(r"[^\wçğıöşüÇĞİÖŞÜ']","",w).lower()
    out=[]; wi=0
    for tk in toks:
        nt=norm(tk); hit=None
        for k in range(wi,min(len(words),wi+3)):
            if norm(words[k]['t'])==nt or (nt and nt.startswith(norm(words[k]['t'])) and norm(words[k]['t'])):
                hit=k; break
        if hit is not None:
            w=words[hit]; o=mp(w['o']); e=mp(w['o']+w['d']); out.append({"t":tk,"o":round(o,1),"d":round(max(30,e-o),1)}); wi=hit+1
        else:
            prev=out[-1]['o']+out[-1]['d'] if out else 0
            out.append({"t":tk,"o":round(prev,1),"d":60})
    return out
for n,j in enumerate(jobs):
    if ONLY and j['id'] not in ONLY: continue
    d=os.path.join(SES,j['id']); os.makedirs(d,exist_ok=True)
    r=[x for x in G if x['id']==j['rule']][0]; a=A[j['rule']]
    segs=[]; t=0.35; prev=None
    for i,sg in enumerate(j['seg']):
        mp3=os.path.join(d,'%02d.mp3'%i); js=os.path.join(d,'%02d.json'%i)
        if FAKE and not os.path.exists(mp3):
            L=max(0.4,len(sg['t'])*0.062)
            subprocess.run(['ffmpeg','-v','error','-y','-f','lavfi','-i','sine=f=220:d=%.2f'%L,'-af','volume=0.05',mp3],check=True)
            ws=[];o=0;wl=L*1000/max(1,len(sg['t'].split()))
            for w in sg['t'].split(): ws.append({"o":o,"d":wl*0.9,"t":w});o+=wl
            json.dump(ws,open(js,'w'))
        words=[w for w in json.load(open(js,encoding='utf-8')) if w.get('k','WordBoundary')=='WordBoundary']
        acr=sg['t'].replace(' ','') in ('S.A.T.',)
        wav=os.path.join(OUT,'_tmp_%s_%02d.wav'%(j['id'],i))
        mp=process(mp3,wav,BASE_TEMPO*(1.15 if acr else 1.0))
        D=dur(wav); disp='SAT' if acr else sg['t']
        words=[{"t":"SAT","o":0,"d":D*1000}] if acr else tokens_with_times(sg['t'],words,mp)
        mp3=wav
        if prev is not None:
            gap = 0.12 if sg['step']==prev['step'] else 0.60   # TR/EN geçişinde kısa nefes, adımlar arası net duraklama
            if sg['step']==prev['step'] and sg['l']==prev['l']: gap=0.35
            if prev['step']==0 and i==1: gap=0.45
            if prev['step']==0 and sg['step']==1: gap=2.4   # düşünme payı: 3-2-1 sayacı
            t+=gap
        if sg['step']==5 and prev and prev['step']!=5: t+=0.2
        segs.append({"t":disp,"l":sg['l'],"step":sg['step'],"start":round(t,3),"dur":round(D,3),"words":words,"file":mp3})
        t+=D; prev=sg
    total=t+1.3
    stepStart=[]
    for st in range(6):
        c=[x['start'] for x in segs if x['step']==st]; stepStart.append(round(min(c)-0.15 if st else 0,3))
    tl={"num":n+1,"title":r['t']['tr'],"bad":a['bad'],"ok":a['ok'],"lab":a['lab']['tr'],
        "badT":"".join(p[0] for p in a['bad']),"okT":"".join(p[0] for p in a['ok']),
        "segs":[{k:v for k,v in x.items() if k!='file'} for x in segs],"stepStart":stepStart,"think":round([x for x in segs if x["step"]==0][-1]["start"]+[x for x in segs if x["step"]==0][-1]["dur"]+0.2,3),"total":round(total,3)}
    json.dump(tl,open(os.path.join(OUT,j['id']+'.json'),'w'),ensure_ascii=False)
    # ses karışımı: konuşma + efekt (yanlış: alçak bip, doğru: çift ding, outro: yumuşak ton)
    ins=[];flt=[];k=0
    for x in segs:
        ins+=['-i',x['file']]; flt.append('[%d:a]aresample=48000,adelay=%d|%d[a%d]'%(k,int(x['start']*1000),int(x['start']*1000),k)); k+=1
    sfx=[(stepStart[2]+0.12,"aevalsrc='0.25*sin(2*PI*180*t)*exp(-6*t)':d=0.35"),
         (stepStart[3]+0.12,"aevalsrc='0.18*(sin(2*PI*880*t)+sin(2*PI*1320*t))*exp(-7*t)':d=0.6"),
         (stepStart[5]+0.05,"aevalsrc='0.12*(sin(2*PI*523*t)+sin(2*PI*659*t)+sin(2*PI*784*t))*exp(-2.5*t)':d=1.4")]
    for at,src in sfx:
        ins+=['-f','lavfi','-i',src+':s=48000']; flt.append('[%d:a]aformat=channel_layouts=stereo,adelay=%d|%d[a%d]'%(k,int(at*1000),int(at*1000),k)); k+=1
    flt.append(''.join('[a%d]'%i for i in range(k))+'amix=inputs=%d:normalize=0,apad=whole_dur=%.2f,atrim=0:%.2f,loudnorm=I=-15:TP=-1.5[out]'%(k,total,total))
    subprocess.run(['ffmpeg','-v','error','-y']+ins+['-filter_complex',';'.join(flt),'-map','[out]','-ac','2','-ar','48000',os.path.join(OUT,j['id']+'.wav')],check=True)
    print(j['id'],'%.1fs'%total)
