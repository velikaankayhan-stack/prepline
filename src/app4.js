/* ---------- gramer antrenmanı / grammar training ---------- */
var GINT=[1,2,5,12,30,60];
var G=null;
function gRule(id){ for(var i=0;i<GRAM.length;i++) if(GRAM[i].id===id) return GRAM[i]; return null; }
function gQueue(){
  var td=todayStr(), g=S.gram, q=[], newToday=0, i, st;
  for(i=0;i<GRAM.length;i++){ st=g[GRAM[i].id]; if(st&&st.first===td) newToday++; }
  for(i=0;i<GRAM.length;i++){ st=g[GRAM[i].id]; if(st && st.due<=td && st.first!==td) q.push({rid:GRAM[i].id,type:"rev"}); }
  if(newToday<1) for(i=0;i<GRAM.length;i++) if(!g[GRAM[i].id]){ q.unshift({rid:GRAM[i].id,type:"new"}); break; }
  return q;
}
function gShuf(n){ var a=[],i,j,x; for(i=0;i<n;i++) a.push(i); for(i=n-1;i>0;i--){ j=Math.floor(Math.random()*(i+1)); x=a[i]; a[i]=a[j]; a[j]=x; } return a; }
function gSave(){ return setKV("gram",S.gram); }
function gStart(mode){
  var items=[];
  if(mode==="mix"){
    var pool=[]; GRAM.forEach(function(r){ if(S.gram[r.id]) r.q.forEach(function(q,k){ pool.push({rid:r.id,k:k}); }); });
    gShuf(pool.length).slice(0,6).forEach(function(i){ items.push({rid:pool[i].rid,k:pool[i].k,mix:true}); });
    if(!items.length) return;
  } else gQueue().forEach(function(e){
    var r=gRule(e.rid);
    if(e.type==="new"){ items.push({rid:e.rid,learn:true}); [0,1,2].forEach(function(k){ items.push({rid:e.rid,k:k,isNew:true}); }); }
    else items.push({rid:e.rid,k:(S.gram[e.rid].ii||0)%r.q.length,rev:true});
  });
  G={items:items,i:0,ans:null,res:{},ok:0,n:0,mix:mode==="mix"}; gDraw();
}
function gRead(id){ G={items:[{rid:id,learn:true,readOnly:true}],i:0,ans:null,res:{},ok:0,n:0,mix:true}; gDraw(); }
function gDraw(){
  var box=$("gramBox");
  if(!G){ renderGram(); return; }
  if(G.i>=G.items.length){ gFinish(); return; }
  var it=G.items[G.i], r=gRule(it.rid), h="";
  var prog='<p class="muted">'+(G.i+1)+' / '+G.items.length+esc(it.rev?t("gr_rev_tag"):it.isNew?t("gr_new_tag"):(G.mix&&!it.readOnly?t("gr_mix_tag"):""))+'</p>';
  if(it.learn){
    h=prog+'<div class="gt">'+esc(L(r.t))+'</div><div id="gPlayer"></div>'+
      '<details style="margin-top:10px"><summary class="muted">'+esc(t("gr_written"))+'</summary><div class="gl" style="margin-top:6px"><p>'+esc(L(r.r))+'</p>'+
      '<div class="gx ok">✓ '+esc(r.ok)+'</div><div class="gx bad">✗ '+esc(r.bad)+'</div></div></details>'+
      '<div class="row" style="margin-top:10px"><button class="primary" onclick="gpStop();GP=null;gNext()">'+esc(it.readOnly?t("gr_close"):t("gr_got"))+'</button></div>';
  } else {
    var q=r.q[it.k];
    if(!it.ord) it.ord=gShuf(q.o.length);
    h=prog+'<div class="gq" lang="en">'+esc(q.s).replace("___",'<span class="gb">_____</span>')+'</div><div class="gopts" lang="en">';
    it.ord.forEach(function(oi,pos){
      var cls=""; if(G.ans!==null){ if(oi===0) cls=" right"; else if(oi===G.ans) cls=" wrong"; }
      h+='<button class="gopt'+cls+'" '+(G.ans!==null?'disabled':'')+' onclick="gAns('+oi+')"><b>'+"ABCD"[pos]+'</b> '+esc(q.o[oi])+'</button>';
    });
    h+='</div>';
    if(G.ans!==null) h+='<div class="gwhy '+(G.ans===0?'ok':'bad')+'"><b>'+esc(G.ans===0?t("gr_right"):t("gr_wrong"))+'</b> '+esc(L(q.w))+'</div>'+
      '<div class="row" style="margin-top:10px"><button class="primary" onclick="gNext()">'+esc(t("gr_cont"))+'</button></div>';
  }
  h+='<div class="row" style="margin-top:8px"><button class="ghost sm" onclick="gpStop();GP=null;G=null;renderGram()">'+esc(t("gr_exit"))+'</button></div>';
  box.innerHTML=h;
  if(it.learn){ if(GP&&GP.rid===it.rid) gpDraw(); else gpOpen(it.rid); } else if(GP){ gpStop(); GP=null; }
}
function gAns(oi){
  if(G.ans!==null) return;
  var it=G.items[G.i], good=oi===0; G.ans=oi; G.n++; if(good) G.ok++;
  if(!G.mix){ if(!G.res[it.rid]) G.res[it.rid]={ok:0,ng:0,type:it.isNew?"new":"rev"}; G.res[it.rid][good?"ok":"ng"]++; }
  gDraw();
}
function gNext(){ G.ans=null; G.i++; gDraw(); }
function gFinish(){
  var td=todayStr(), wrong=[];
  if(!G.mix) Object.keys(G.res).forEach(function(id){
    var r=G.res[id], st=S.gram[id]||{lvl:0,ok:0,ng:0,ii:0};
    if(r.type==="new"){ st.first=td; st.ii=0; } else st.ii=(st.ii||0)+1;
    st.ok=(st.ok||0)+r.ok; st.ng=(st.ng||0)+r.ng;
    if(r.ng===0){ st.lvl=Math.min((st.lvl||0)+1,GINT.length-1); st.due=addDays(td,GINT[st.lvl]); }
    else { st.lvl=0; st.due=addDays(td,1); wrong.push(L(gRule(id).t)); }
    S.gram[id]=st;
  });
  var msg='<p>'+t("gr_score",G.ok,G.n)+'</p>'+(wrong.length?'<p class="muted">'+esc(t("gr_again",wrong.join(" · ")))+'</p>':'');
  var wasMix=G.mix; G=null;
  (wasMix?Promise.resolve():gSave()).then(function(){ renderGram(msg); });
}
function renderGram(msg){
  var box=$("gramBox"); if(G){ gDraw(); return; }
  var q=gQueue(), learned=0, weak=[];
  GRAM.forEach(function(r){ var st=S.gram[r.id]; if(st){ learned++; if(st.ng>0 && st.ng/(st.ok+st.ng)>0.25) weak.push(L(r.t)); } });
  var nNew=q.filter(function(e){return e.type==="new";}).length, nRev=q.length-nNew;
  var h=(msg||"")+'<div class="bar"><i style="width:'+Math.round(learned/GRAM.length*100)+'%"></i></div>'+
    '<p class="muted">'+esc(t("gr_prog",learned,GRAM.length,GRAM.length-learned))+'</p>';
  if(q.length) h+='<p>'+esc(t("gr_today"))+' '+(nNew?t("gr_new1"):'')+(nNew&&nRev?' + ':'')+(nRev?t("gr_rev",nRev):'')+'</p>'+
     '<div class="row"><button class="primary" onclick="gStart()">'+esc(t("gr_start"))+'</button></div>';
  else { h+='<p>'+esc(t("gr_done"))+'</p>'; if(learned) markTask("gramer"); }
  if(learned>=2) h+='<div class="row" style="margin-top:8px"><button class="sm" onclick="gStart(\'mix\')">'+esc(t("gr_mix"))+'</button></div>';
  if(weak.length) h+='<p class="muted" style="margin-top:8px">'+esc(t("gr_weak"))+' '+esc(weak.join(" · "))+'</p>';
  h+='<details style="margin-top:10px"><summary class="muted">'+esc(t("gr_rules",GRAM.length))+'</summary>';
  GRAM.forEach(function(r,i){
    h+='<div class="grow"><span>'+(i+1)+'. '+esc(L(r.t))+'</span>'+
      (S.gram[r.id]?'<button class="sm ghost" onclick="gRead(\''+r.id+'\')">'+esc(t("gr_watch"))+'</button>':'<span class="muted">'+esc(t("gr_queued"))+'</span>')+'</div>';
  });
  box.innerHTML=h+'</details>';
}

/* ---------- sesli + animasyonlu anlatım / narrated animation ----------
   Türkçe anlatımda {…} içindeki İngilizce kısımlar İngilizce sesle okunur. */
var GP=null, GP_RATE=1, GP_MUTE=false;
function gpVoices(){
  var v=(window.speechSynthesis&&speechSynthesis.getVoices())||[];
  function pick(p){ var best=null,bs=-1; v.forEach(function(x){ if(x.lang&&x.lang.replace("_","-").toLowerCase().indexOf(p)===0){
    var n=x.name||"", sc=/Natural/i.test(n)?3:/Online|Google|Neural|Premium|Enhanced/i.test(n)?2:1; if(sc>bs){bs=sc;best=x;} } }); return best; }
  return {tr:pick("tr"), en:pick("en-us")||pick("en")};
}
function gpStop(){ if(GP){ GP.tok++; GP.playing=false; } try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){} }
function gpSay(list,cb){
  var tok=GP.tok, i=0, V=gpVoices();
  function next(){
    if(!GP||GP.tok!==tok) return;
    if(i>=list.length){ cb(); return; }
    var it=list[i++], done=false, tm;
    function fin(){ if(done) return; done=true; clearTimeout(tm); setTimeout(next,it.tight?40:250); }
    var est=Math.max(it.tight?500:1400,it.t.length*70/GP_RATE);
    if(GP_MUTE||!window.speechSynthesis||!window.SpeechSynthesisUtterance){ tm=setTimeout(fin,est); return; }
    var u=new SpeechSynthesisUtterance(it.t);
    u.lang=it.l==="en"?"en-US":"tr-TR"; var vv=it.l==="en"?V.en:V.tr; if(vv) u.voice=vv;
    u.rate=(it.l==="en"?0.92:1)*GP_RATE; u.onend=fin; u.onerror=fin;
    tm=setTimeout(fin,est*2.2+3000);
    try{ speechSynthesis.speak(u); }catch(e){ fin(); }
  }
  next();
}
function gpSplit(s){
  if(LANG!=="tr") return [{t:s,l:"en"}];
  var out=[], re=/\{([^}]*)\}/g, last=0, m;
  while((m=re.exec(s))){ var a=s.slice(last,m.index).trim(); if(a) out.push({t:a,l:"tr",tight:true});
    out.push({t:m[1].replace(/\bi n g\b/g,"ing"),l:"en",tight:true}); last=re.lastIndex; }
  var z=s.slice(last).trim(); if(z) out.push({t:z,l:"tr",tight:true});
  if(out.length) out[out.length-1].tight=false;
  return out;
}
function gpCap(s){ return esc(s).replace(/\{([^}]*)\}/g,function(_,x){ return '<i class="gen">'+x.replace(/\bi n g\b/g,"-ing")+'</i>'; }); }
function gpTxt(parts){ return parts.map(function(p){return p[0];}).join(""); }
function gpSent(parts,mode){
  return parts.map(function(p){
    var tag=p[1], cls="";
    if(mode>=1 && /[ABC]/.test(tag)) cls="g"+tag;
    if(tag==="X") cls=mode>=2?"gX on":"";
    if(tag==="F") cls="gF on";
    var tx=esc(p[0]); if(tag==="X" && !p[0]) tx=mode>=2?'<span class="gcar">^</span>':"";
    return '<span class="'+cls+'">'+tx+'</span>';
  }).join("");
}
function gpDraw(){
  var el=$("gPlayer"); if(!el||!GP) return;
  var a=GANIM[GP.rid], s=GP.step, lab="", labs=L(a.lab), nar=L(a.n);
  var parts=s>=3?a.ok:a.bad, mode=s>=3?3:s;
  if(s>=1) ["A","B","C"].forEach(function(k){ if(labs[k]) lab+='<span class="glab g'+k+'">'+esc(labs[k])+'</span>'; });
  var cap=s===0?t("gp_look"):nar[s-1];
  var badge=s===2?'<div class="gbad">'+esc(t("gp_wrong"))+'</div>':s>=3?'<div class="gok">'+esc(t("gp_right"))+'</div>':'';
  var dots=""; for(var i=0;i<5;i++) dots+='<i class="'+(i===s?'on':'')+'"></i>';
  el.innerHTML='<div class="gstage">'+badge+'<div class="gsent" lang="en">'+gpSent(parts,mode)+'</div>'+
    (lab?'<div class="glabs">'+lab+'</div>':'')+
    (s===4?'<div class="gsum" lang="en"><div class="gx bad">✗ '+esc(gpTxt(a.bad))+'</div><div class="gx ok">✓ '+esc(gpTxt(a.ok))+'</div></div>':'')+
    '</div><div class="gcap">'+gpCap(cap)+'</div>'+
    '<div class="gctl"><button class="sm" onclick="gpGo(-1)" aria-label="back">◀</button>'+
    '<button class="sm primary" onclick="gpToggle()">'+esc(GP.playing?t("gp_pause"):(s===4&&GP.ended?t("gp_replay"):t("gp_play")))+'</button>'+
    '<button class="sm" onclick="gpGo(1)" aria-label="next">▶</button>'+
    '<button class="sm ghost" onclick="gpRate()">'+esc(GP_RATE<1?t("gp_slow"):t("gp_norm"))+'</button>'+
    '<button class="sm ghost" onclick="gpMute()">'+(GP_MUTE?'🔇':'🔊')+'</button></div><div class="gdots">'+dots+'</div>';
}
function gpLines(s){
  var a=GANIM[GP.rid], nar=L(a.n);
  if(s===0) return [{t:t("gp_look"),l:LANG==="tr"?"tr":"en"},{t:gpTxt(a.bad),l:"en"}];
  if(s===3) return gpSplit(nar[2]).concat([{t:gpTxt(a.ok),l:"en"}]);
  return gpSplit(nar[s-1]);
}
function gpRun(){
  if(!GP) return; GP.tok++; GP.playing=true; GP.ended=false; gpDraw();
  try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
  gpSay(gpLines(GP.step),function(){
    if(!GP) return;
    if(GP.step<4){ GP.step++; gpRun(); } else { GP.playing=false; GP.ended=true; gpDraw(); }
  });
}
function gpOpen(rid){ if(!GANIM[rid]) return; gpStop(); GP={rid:rid,step:0,playing:false,tok:0,ended:false}; gpRun(); }
function gpToggle(){ if(!GP) return; if(GP.playing){ gpStop(); gpDraw(); } else { if(GP.ended&&GP.step===4) GP.step=0; gpRun(); } }
function gpGo(d){ if(!GP) return; var p=GP.playing; gpStop(); GP.step=Math.max(0,Math.min(4,GP.step+d)); if(p) gpRun(); else gpDraw(); }
function gpRate(){ GP_RATE=GP_RATE<1?1:0.8; if(GP&&GP.playing){ gpStop(); gpRun(); } else gpDraw(); }
function gpMute(){ GP_MUTE=!GP_MUTE; if(GP&&GP.playing){ gpStop(); gpRun(); } else gpDraw(); }
if(window.speechSynthesis){ try{ speechSynthesis.getVoices(); }catch(e){} }
