/* ---------- kelime paketleri / word packs ---------- */
var ACAD_PER_DAY=1, MATH_PER_DAY=3, DRIPPED=false;
/* akademik: günde 1 kelime kutuya düşer (cümleyi kullanıcı yazar). matematik: günde 3 terim tekrara girer. */
function dripPack(){
  if(DRIPPED || !S.prof) return; DRIPPED=true;
  var td=todayStr(), i, done=0, ops=[], added=false;
  S.inbox=S.inbox||[];
  S.inbox.forEach(function(x){ if(x.src==="akademik" && x.d===td) done++; });
  S.words.forEach(function(w){ if(w.src==="akademik" && w.created===td) done++; });
  var need=ACAD_PER_DAY-done;
  for(i=0;i<ACAD_PACK.length && need>0;i++){
    var w=ACAD_PACK[i][0];
    if(findWord(w) || S.inbox.some(function(x){return slug(x.w)===slug(w);})) continue;
    S.inbox.push({id:nowMs()+i, w:w, d:td, src:"akademik", ex:ACAD_PACK[i][1]});
    need--; added=true;
  }
  if(S.mathDrip){
    var md=0; S.words.forEach(function(w){ if(w.src==="matematik" && w.created===td) md++; });
    var mneed=MATH_PER_DAY-md;
    for(i=0;i<MATH_PACK.length && mneed>0;i++){
      var m=MATH_PACK[i]; if(findWord(m[0])) continue;
      var o={word:m[0], mk:i, src:"matematik", sen:(m[3]?m[3]+"  ·  ":"")+"Math · "+t("m_groups")[m[2]],
             created:td, due:td, lvl:1, step:0, reps:0, sid:slug(m[0])};
      ops.push(sPut("words",o)); mneed--;
    }
  }
  if(added) ops.push(saveInbox());
  if(ops.length) Promise.all(ops).then(load);
}
/* matematik terimlerinin anlamı dile göre gösterilir / math term meaning follows the language */
function meanOf(w){ if(w.meanEdited) return w.mean||""; if(w.src==="matematik" && w.mk!=null && MATH_PACK[w.mk]) return L(MATH_PACK[w.mk][1]); if(w.src==="akademik" && !w.mean) return acadMean(w.word); return w.mean||""; }
function acadMean(word){ for(var i=0;i<ACAD_PACK.length;i++) if(ACAD_PACK[i][0]===word) return L(ACAD_PACK[i][2]); return ""; }

function renderMath(){
  var q=($("mathQ").value||"").toLowerCase().trim(), h="", total=0, inRev=0, G=["q","geo","basic"];
  G.forEach(function(g){
    var rows="", n=0;
    MATH_PACK.forEach(function(m){
      if(m[2]!==g) return;
      var has=!!findWord(m[0]); total++; if(has) inRev++;
      var mean=L(m[1]);
      if(q && (m[0]+" "+mean).toLowerCase().indexOf(q)<0) return;
      n++;
      rows+='<div class="mrow"><div><b>'+esc(m[0])+'</b>'+(m[3]?' <span class="mex">'+esc(m[3])+'</span>':'')+
            '</div><div class="mtr">'+esc(mean)+(has?' <span class="mtag">'+esc(t("m_in"))+'</span>':'')+'</div></div>';
    });
    if(n) h+='<details class="card"'+(q?' open':'')+'><summary><b>'+esc(t("m_groups")[g])+'</b> <span class="muted">('+n+')</span></summary>'+rows+'</details>';
  });
  $("mathList").innerHTML=h||'<p class="muted">'+esc(t("none"))+'</p>';
  $("mathInfo").textContent=t("m_info",total,inRev)+(S.mathDrip?t("m_info_drip"):"");
}

/* ---------- kelime kutusu / word box ---------- */
var INB_PROC=false;
function renderNotes(){
  var ib=S.inbox||[];
  $("noteCnt").textContent=ib.length; $("noteCnt").classList.toggle("hide",!ib.length);
  $("inbGo").disabled=!ib.length;
  $("inbGo").textContent=ib.length?t("inb_go_n",ib.length):t("inb_empty");
  $("noteList").innerHTML=ib.map(function(x,i){
    return '<div class="nitem" style="display:flex;align-items:center;gap:8px"><span class="muted" style="width:20px">'+(i+1)+'</span>'+
      '<b style="flex:1">'+esc(x.w)+(x.src==="akademik"?' <span class="mtag" style="color:var(--acc);border-color:var(--acc)">'+esc(t("tag_acad"))+'</span>':'')+'</b>'+
      '<button class="sm ghost" onclick="processInbox('+x.id+')">'+esc(t("process"))+'</button>'+
      '<button class="sm ghost" onclick="delInbox('+x.id+')">'+esc(t("del"))+'</button></div>';
  }).join("");
}
function saveInbox(){ return setKV("inbox",S.inbox).then(renderNotes); }
function addInbox(){
  var raw=$("inbIn").value; if(!raw.trim()) return;
  var parts=raw.split(/\n|;/).map(function(x){return x.trim();}).filter(Boolean), t0=nowMs();
  parts.forEach(function(w,i){
    if(S.inbox.some(function(x){return slug(x.w)===slug(w);})) return;
    S.inbox.push({id:t0+i, w:w, d:todayStr()});
  });
  $("inbIn").value=""; $("inbIn").focus(); saveInbox();
}
function inbPaste(e){
  var x=(e.clipboardData||window.clipboardData).getData("text");
  if(x && /\n/.test(x)){ e.preventDefault(); $("inbIn").value=x.split(/\r?\n/).join(";"); addInbox(); }
}
function delInbox(id){ S.inbox=S.inbox.filter(function(x){return x.id!==id;}); saveInbox(); }
function processInbox(id){
  var ib=S.inbox; if(!ib.length) return;
  var it=ib[0]; if(id!=null) ib.forEach(function(x){ if(x.id===id) it=x; });
  INB_PROC=true;
  $("notePanel").classList.add("hide");
  go("kelime"); kwView("w");
  $("wWord").value=it.w; $("wSen").value=""; $("wMean").value=it.src==="akademik"?acadMean(it.w):"";
  if(it.ex) $("wSen").placeholder=it.ex;
  checkDup(); $("inbHint").classList.remove("hide");
  $("inbHint").textContent=t("inb_proc",ib.length);
  setTimeout(function(){ $("wSen").focus(); },80);
}
function inboxAfterSave(word){
  var s0=slug(word), before=S.inbox.length;
  S.inbox=S.inbox.filter(function(x){return slug(x.w)!==s0;});
  var p=(S.inbox.length!==before)?saveInbox():Promise.resolve();
  return p.then(function(){
    if(!INB_PROC) return;
    if(S.inbox.length) processInbox();
    else { INB_PROC=false; $("inbHint").classList.remove("hide"); $("inbHint").textContent=t("inb_done"); }
  });
}
function toggleNotes(){
  var p=$("notePanel"); p.classList.toggle("hide");
  if(!p.classList.contains("hide")){ renderNotes(); setTimeout(function(){ $("inbIn").focus(); },50); }
}

/* ---------- kökler / roots ---------- */
function kwView(v){
  $("kwWords").classList.toggle("hide",v!=="w"); $("kwRoots").classList.toggle("hide",v!=="r");
  $("segW").classList.toggle("on",v==="w"); $("segR").classList.toggle("on",v==="r");
  if(v==="r") renderRoots();
}
function saveRoots(){ return setKV("roots",S.roots).then(renderRoots); }
function addRoot(){
  var r=$("rRoot").value.trim(), m=$("rMean").value.trim(), o=$("rOrig").value.trim();
  if(!r||!m){ alert(t("r_need")); return; }
  if(S.roots.some(function(x){return x.r.toLowerCase()===r.toLowerCase();})){ alert(t("r_dup")); return; }
  S.roots.unshift({id:nowMs(),r:r,m:m,o:o,d:[]});
  $("rRoot").value=""; $("rMean").value=""; $("rOrig").value=""; saveRoots();
}
function findRoot(id){ for(var i=0;i<S.roots.length;i++) if(S.roots[i].id===id) return S.roots[i]; return null; }
function addDeriv(id){
  var R=findRoot(id); if(!R) return;
  var w=$("dw"+id).value.trim(), m=$("dm"+id).value.trim(); if(!w) return;
  R.d.push({w:w,m:m}); saveRoots().then(function(){ var x=$("dw"+id); if(x) x.focus(); });
}
function delDeriv(id,k){ var R=findRoot(id); if(!R) return; R.d.splice(k,1); saveRoots(); }
function delRoot(id){ if(!confirm(t("r_delq"))) return; S.roots=S.roots.filter(function(x){return x.id!==id;}); saveRoots(); }
function renderRoots(){
  var q=($("rSearch").value||"").toLowerCase().trim(), h="";
  $("rCount").textContent=S.roots.length;
  S.roots.forEach(function(R){
    var hay=(R.r+" "+R.m+" "+R.d.map(function(x){return x.w+" "+x.m;}).join(" ")).toLowerCase();
    if(q && hay.indexOf(q)<0) return;
    h+='<div class="root"><div class="rh"><b>'+esc(R.r)+'</b><span>'+esc(R.m)+'</span>'+(R.o?'<span class="ro">'+esc(R.o)+'</span>':'')+
       '<button class="sm ghost" style="margin-left:auto" onclick="delRoot('+R.id+')">'+esc(t("del"))+'</button></div>'+
       R.d.map(function(x,k){ return '<div class="dv"><b>'+esc(x.w)+'</b><span>'+esc(x.m)+' <a href="#" onclick="delDeriv('+R.id+','+k+');return false" style="color:var(--dim);margin-left:6px">✕</a></span></div>'; }).join("")+
       '<div class="add"><input id="dw'+R.id+'" placeholder="'+esc(t("r_deriv"))+'" lang="en" autocapitalize="none" autocorrect="off" spellcheck="false">'+
       '<input id="dm'+R.id+'" placeholder="'+esc(t("r_dmean"))+'" onkeydown="if(event.key===\'Enter\')addDeriv('+R.id+')">'+
       '<button class="sm" onclick="addDeriv('+R.id+')">'+esc(t("add"))+'</button></div></div>';
  });
  $("rootList").innerHTML=h||'<p class="muted">'+esc(q?t("none"):t("r_none"))+'</p>';
}

/* ---------- aralıklı tekrar / spaced repetition ---------- */
function lvlOf(w){ return w.lvl==null?1:w.lvl; }
function weightOf(w){ var l=lvlOf(w); return l===0?6:(l===1?3:(l===2?1.5:0.5)); }
function lvlColor(w){ var l=lvlOf(w); return l===0?"var(--bad)":(l===1?"var(--warn)":(l===2?"var(--ok)":"var(--acc)")); }
function lvlName(w){ return t("lv")[lvlOf(w)]; }
function capOf(w){ return lvlOf(w)===0?2:1; }          /* zor kelime günde en fazla 2 kez */
function viewsToday(w){ return w.seenDate===todayStr()?(w.seenCount||0):0; }
function isNew(w){ return !(w.reps>0) && !w.firstSeen; }
function viewedTodayTotal(){ return S.words.reduce(function(a,w){return a+viewsToday(w);},0); }
function introducedToday(){ var td=todayStr(); return S.words.filter(function(w){return w.firstSeen===td;}).length; }
function eligible(){ var td=todayStr(); return S.words.filter(function(w){ return (!w.due||w.due<=td) && viewsToday(w)<capOf(w); }); }
function dueWords(){
  var td=todayStr(), all=eligible();
  var fresh=all.filter(isNew).sort(function(a,b){return (a.created||"")<(b.created||"")?-1:1;});
  var rev=all.filter(function(w){return !isNew(w);}).sort(function(a,b){
    var da=daysBetween(a.due||td,td), db=daysBetween(b.due||td,td);
    return db!==da?db-da:lvlOf(a)-lvlOf(b);
  });
  var newLeft=Math.max(0,S.newLimit-introducedToday()), slots=Math.max(0,S.revLimit-viewedTodayTotal());
  var newTake=Math.min(newLeft,slots,fresh.length);
  return rev.slice(0,slots-newTake).concat(fresh.slice(0,newTake));
}
function nextUpLine(){
  var td=todayStr(), best=null;
  S.words.forEach(function(w){ if(w.due && w.due>td && (!best||w.due<best)) best=w.due; });
  if(!best) return "";
  return t("rev_next",S.words.filter(function(w){return w.due===best;}).length,fmtDate(best));
}
function limitLine(){ return t("rev_limit",viewedTodayTotal(),S.revLimit,introducedToday(),S.newLimit); }
function weightedShuffle(arr){
  return arr.map(function(w){return {w:w,k:Math.pow(Math.random(),1/weightOf(w))};})
    .sort(function(a,b){return b.k-a.k;}).map(function(x){return x.w;});
}
function findWord(txt){ var s=slug(txt); for(var i=0;i<S.words.length;i++) if(slug(S.words[i].word)===s) return S.words[i]; return null; }
function checkDup(){
  var txt=$("wWord").value.trim(), box=$("dupBox"), ex=txt?findWord(txt):null;
  if(!ex){ box.classList.add("hide"); $("btnSave").textContent=t("save"); return; }
  box.classList.remove("hide");
  box.innerHTML="<b>"+esc(t("w_dup"))+"</b><div style='margin-top:5px'>"+esc(meanOf(ex)||t("no_mean"))+"</div>"+
    (ex.sen?"<div style='font-style:italic;opacity:.8;margin-top:4px'>"+esc(ex.sen)+"</div>":"")+
    "<div style='margin-top:6px;opacity:.75'>"+esc(t("w_state",lvlName(ex),ex.reps||0))+"</div>";
  $("btnSave").textContent=t("w_update");
}
function addWord(){
  var txt=$("wWord").value.trim(); if(!txt){ alert(t("w_empty")); return; }
  var sen=$("wSen").value.trim(), mean=$("wMean").value.trim(), ex=findWord(txt), o;
  if(ex){ o=ex; if(sen) o.sen=sen; if(mean && mean!==meanOf(ex)){ o.mean=mean; o.meanEdited=true; } }
  else o={word:txt,sen:sen,mean:mean,created:todayStr(),due:todayStr(),lvl:1,step:0,reps:0,sid:slug(txt)};
  if(!ex && INB_PROC && S.inbox.some(function(x){return slug(x.w)===slug(txt)&&x.src==="akademik";})){ o.src="akademik"; if(mean===acadMean(txt)) o.mean=""; else o.meanEdited=true; }
  o.upd=nowMs();
  sPut("words",o).then(load).then(function(){
    $("wWord").value=""; $("wSen").value=""; $("wMean").value=""; $("wSen").placeholder="such concerns didn't ___ her efforts";
    $("dictOut").innerHTML=""; $("dupBox").classList.add("hide");
    $("btnSave").textContent=t("save"); $("wWord").focus(); $("inbHint").classList.add("hide");
    return inboxAfterSave(txt);
  });
}
function editWord(id){
  var w=S.words.filter(function(x){return x.id===id;})[0]; if(!w) return;
  $("wWord").value=w.word; $("wSen").value=w.sen||""; $("wMean").value=meanOf(w);
  checkDup(); $("wWord").scrollIntoView({behavior:"smooth",block:"center"});
}
function openTureng(){ var w=$("wWord").value.trim(); if(w) window.open("https://tureng.com/en/turkish-english/"+encodeURIComponent(w),"_blank","noopener"); }
function lookupWord(){
  var w=$("wWord").value.trim(); if(!w) return;
  $("dictOut").textContent=t("d_search");
  fetch("https://api.dictionaryapi.dev/api/v2/entries/en/"+encodeURIComponent(w))
   .then(function(r){ if(!r.ok) throw 0; return r.json(); })
   .then(function(j){
     var m=j[0].meanings||[], out="";
     for(var i=0;i<Math.min(2,m.length);i++){
       var d=m[i].definitions[0];
       out+="<div style='margin-top:6px'><b>"+esc(m[i].partOfSpeech)+"</b> — "+esc(d.definition)+"</div>";
       if(d.example) out+="<div style='font-style:italic;opacity:.8'>"+esc(d.example)+"</div>";
     }
     $("dictOut").innerHTML=out||esc(t("d_none"));
   }).catch(function(){ $("dictOut").textContent=t("d_off"); });
}
function startReview(allWords){ S.freeMode=!!allWords; S.pool=buildRound(); S.total=S.pool.length; S.done=0; S.lastSid=null; nextCard(); }
function buildRound(){
  var base=S.freeMode?S.words.filter(function(w){return viewsToday(w)<capOf(w);}):dueWords();
  var g1=[],g2=[],g3=[];   /* sıra: tekrar → yeni → matematik */
  base.forEach(function(w){ if(w.src==="matematik") g3.push(w); else if(isNew(w)) g2.push(w); else g1.push(w); });
  var r=weightedShuffle(g1).concat(weightedShuffle(g2),weightedShuffle(g3));
  if(r.length>1 && r[0].sid===S.lastSid){ var x=r[0]; r[0]=r[1]; r[1]=x; }
  return r;
}
function nextCard(){
  if(!S.pool||!S.pool.length) S.pool=buildRound();
  if(!S.pool.length){
    S.cur=null; $("revBox").classList.add("hide"); $("revEmpty").classList.remove("hide");
    var waiting=eligible().length;
    $("revEmptyMsg").textContent=waiting>0?t("rev_capped",waiting,limitLine()):(S.words.length?t("rev_nothing",limitLine(),nextUpLine()):t("rev_empty"));
    return;
  }
  S.cur=S.pool[0];
  $("revEmpty").classList.add("hide"); $("revBox").classList.remove("hide");
  var grp=S.cur.src==="matematik"?t("rev_grp_math"):(isNew(S.cur)?t("rev_grp_new"):t("rev_grp_rev"));
  var left={T:0,Y:0,M:0}; S.pool.forEach(function(w){ if(w.src==="matematik") left.M++; else if(isNew(w)) left.Y++; else left.T++; });
  $("revCount").innerHTML="<b>"+esc(grp)+"</b> · "+esc(t("rev_left",left.T,left.Y,left.M))+"<br><span style='font-size:12px'>"+esc(limitLine())+"</span>";
  $("revWord").textContent=S.cur.word;
  $("revSen").innerHTML=S.cur.sen?esc(S.cur.sen):"<span style='opacity:.5'>"+esc(t("no_sen"))+"</span>";
  $("revMean").textContent=meanOf(S.cur)||"—";
  $("revMean").classList.add("hide"); $("revShow").classList.remove("hide"); $("revGrade").classList.add("hide");
}
function revealCard(){ $("revMean").classList.remove("hide"); $("revShow").classList.add("hide"); $("revGrade").classList.remove("hide"); }
var KNOWN_STEPS=[3,8,21,45,90], VERY_STEPS=[14,45,120,240];
function gradeCard(lvl){
  var w=S.cur; if(!w) return;
  var td=todayStr();
  if(w.seenDate!==td){ w.seenDate=td; w.seenCount=0; }
  w.seenCount++; if(!w.firstSeen) w.firstSeen=td;
  w.reps=(w.reps||0)+1; w.lvl=lvl; w.last=td;
  var leaves=true;
  if(lvl===3){ w.vstep=(w.vstep||0)+1; w.step=0; w.due=addDays(td,VERY_STEPS[Math.min(w.vstep-1,VERY_STEPS.length-1)]); }
  else if(lvl===2){ w.step=(w.step||0)+1; w.vstep=0; w.due=addDays(td,KNOWN_STEPS[Math.min(w.step-1,KNOWN_STEPS.length-1)]); }
  else if(lvl===1){ w.step=0; w.vstep=0; w.due=addDays(td,1); }
  else { w.step=0; w.vstep=0; if(w.seenCount>=2) w.due=addDays(td,2); else { w.due=td; leaves=false; } }
  w.upd=nowMs(); S.lastSid=w.sid=w.sid||slug(w.word);
  S.pool.shift(); if(leaves) S.done++;
  if(!S.tasks[td]) S.tasks[td]={}; S.tasks[td].kelime=true;
  sPut("words",w).then(function(){ return setKV("tasks",S.tasks); }).then(function(){ nextCard(); renderToday(); renderWords(); });
}
function nextLine(w){
  var td=todayStr(), d=w.due||td; if(d<=td) return t("today_l");
  var n=daysBetween(td,d); return n===1?t("tomorrow"):t("in_days",n);
}
function renderWords(){
  var q=($("wSearch").value||"").toLowerCase();
  var list=S.words.filter(function(w){ return !q||w.word.toLowerCase().indexOf(q)>=0||meanOf(w).toLowerCase().indexOf(q)>=0||(w.sen||"").toLowerCase().indexOf(q)>=0; })
    .sort(function(a,b){return a.word.toLowerCase().localeCompare(b.word.toLowerCase(),"en");});
  $("wCount").textContent=S.words.length;
  var h="", letter="";
  list.forEach(function(w){
    var Lt=(w.word[0]||"?").toUpperCase();
    if(Lt!==letter){ letter=Lt; h+='<h3 style="margin:14px 0 2px">'+esc(letter)+'</h3>'; }
    var mn=meanOf(w);
    h+='<div class="item"><div class="hd"><span class="lvl" style="background:'+lvlColor(w)+'"></span><b>'+esc(w.word)+'</b>'+
       '<span class="tag">'+esc(nextLine(w))+'</span>'+
       '<button class="sm ghost" style="margin-left:auto;flex:0 0 auto" onclick="editWord('+w.id+')">'+esc(t("edit"))+'</button>'+
       '<button class="sm ghost" style="flex:0 0 auto" onclick="delWord('+w.id+')">'+esc(t("del"))+'</button></div>'+
       (mn?'<div class="mn">'+esc(mn)+'</div>':'')+(w.sen?'<div class="sen">'+esc(w.sen)+'</div>':'')+'</div>';
  });
  $("wordList").innerHTML=h||'<p class="muted">'+esc(t("w_none"))+'</p>';
}
function delWord(id){ if(!confirm(t("delq"))) return; sDel("words",id).then(load); }

/* ---------- hata defteri / mistake log ---------- */
function renderChips(){
  $("chSec").innerHTML='<button class="chip" aria-pressed="'+(S.sec==="rw")+'" onclick="setSec(\'rw\')">Reading &amp; Writing</button>'+
    '<button class="chip" aria-pressed="'+(S.sec==="math")+'" onclick="setSec(\'math\')">Math</button>';
  $("chCat").innerHTML=CAT_IDS.map(function(c){ return '<button class="chip" aria-pressed="'+(S.cat===c)+'" onclick="setCat(\''+c+'\')">'+esc(t("cats")[c])+'</button>'; }).join("");
  $("eDomain").innerHTML=DOMAINS.filter(function(d){return d.s===S.sec;}).map(function(d){return '<option value="'+d.id+'">'+d.n+'</option>';}).join("");
  $("eTrRow").classList.toggle("hide",!S.prof.esl);
}
function setSec(s){ S.sec=s; renderChips(); }
function setCat(c){ S.cat=c; renderChips(); }
function addError(){
  var o={date:todayStr(),sec:S.sec,dom:$("eDomain").value,cat:S.cat,tr:S.prof.esl&&$("eTr").checked,
         no:$("eNo").value.trim(),src:$("eSrc").value.trim(),note:$("eNote").value.trim()};
  sPut("errors",o).then(load).then(function(){ $("eNo").value=""; $("eNote").value=""; $("eTr").checked=false; });
}
function domName(id){ for(var i=0;i<DOMAINS.length;i++) if(DOMAINS[i].id===id) return DOMAINS[i].n; return id; }
function renderErrors(){
  $("eCount").textContent=S.errors.length;
  $("chFilter").innerHTML='<button class="chip" aria-pressed="'+(S.filter==="all")+'" onclick="setFilter(\'all\')">'+esc(t("all"))+'</button>'+
    CAT_IDS.map(function(c){ return '<button class="chip" aria-pressed="'+(S.filter===c)+'" onclick="setFilter(\''+c+'\')">'+esc(t("catshort")[c])+'</button>'; }).join("");
  var list=S.errors.filter(function(e){return S.filter==="all"||e.cat===S.filter;}).sort(function(a,b){return (b.id||0)-(a.id||0);});
  $("errList").innerHTML=list.map(function(e){
    return '<div class="item"><div class="hd"><span class="cat '+e.cat+'">'+esc(t("catshort")[e.cat])+'</span>'+
      '<b style="font-size:14px">'+esc(e.no||domName(e.dom))+'</b>'+(e.tr?'<span class="tag">'+esc(t("e_trtag"))+'</span>':'')+
      '<button class="sm ghost" style="margin-left:auto;flex:0 0 auto" onclick="delErr('+e.id+')">'+esc(t("del"))+'</button></div>'+
      '<div class="sen" style="font-style:normal">'+esc(domName(e.dom))+(e.src?" · "+esc(e.src):"")+' · '+esc(fmtDate(e.date))+'</div>'+
      (e.note?'<div class="mn">'+esc(e.note)+'</div>':'')+'</div>';
  }).join("")||'<p class="muted">'+esc(t("e_none"))+'</p>';
  var tot=S.errors.length||1;
  $("catDist").innerHTML=CAT_IDS.map(function(c){
    var n=S.errors.filter(function(e){return e.cat===c;}).length;
    return '<div style="margin-bottom:9px"><div style="display:flex;font-size:13px"><span>'+esc(t("cats")[c])+'</span><b style="margin-left:auto">'+n+'</b></div>'+
      '<div class="bar"><i style="width:'+Math.round(n/tot*100)+'%;background:var(--c-'+c+')"></i></div></div>';
  }).join("");
  var dh="";
  DOMAINS.forEach(function(d){
    var n=S.errors.filter(function(e){return e.dom===d.id;}).length; if(!n) return;
    dh+='<div style="margin-bottom:9px"><div style="display:flex;font-size:13px"><span>'+d.n+'</span><b style="margin-left:auto">'+n+'</b></div>'+
        '<div class="bar"><i style="width:'+Math.round(n/tot*100)+'%"></i></div></div>';
  });
  $("domDist").innerHTML=dh||'<p class="muted">—</p>';
}
function setFilter(f){ S.filter=f; renderErrors(); }
function delErr(id){ if(!confirm(t("delq"))) return; sDel("errors",id).then(load); }

/* ---------- müfredat / curriculum ---------- */
function renderLearn(){
  var showTrOpt=LANG==="tr";
  $("chTr").innerHTML=showTrOpt?('<button class="chip" aria-pressed="'+(!S.showTr)+'" onclick="setShowTr(false)">'+esc(t("c_en"))+'</button>'+
    '<button class="chip" aria-pressed="'+(!!S.showTr)+'" onclick="setShowTr(true)">'+esc(t("c_tr"))+'</button>'):"";
  var out="", tot=0, td=0;
  CURR.forEach(function(un){
    var done=0, body="";
    un.items.forEach(function(it,i){
      var key=un.k+"-"+i, on=!!S.learned[key]; if(on) done++;
      body+='<details'+(on?' class="learned"':'')+'><summary><span class="dot"></span>'+it[0]+'</summary><div class="bd">'+it[1]+
        (showTrOpt?'<div class="trbox'+(S.showTr?'':' hide')+'" id="tr-'+key+'">'+(it[2]||"")+'</div>':'')+
        '<div class="row" style="margin-top:10px">'+
        (showTrOpt?'<button class="sm ghost" onclick="toggleTr(\''+key+'\')">'+esc(t("c_trbtn"))+'</button>':'')+
        '<button class="sm" onclick="toggleLearn(\''+key+'\')">'+esc(on?t("c_unlearn"):t("c_learned"))+'</button></div></div></details>';
    });
    tot+=un.items.length; td+=done;
    out+='<div class="card"><h2>'+un.n+' <span class="muted" style="font-weight:400">'+done+'/'+un.items.length+'</span></h2>'+
      '<p class="muted" style="margin:0 0 4px">'+un.pct+' — '+un.d+'</p>'+
      '<div class="bar"><i style="width:'+Math.round(done/un.items.length*100)+'%"></i></div><div style="margin-top:12px">'+body+'</div></div>';
  });
  $("currList").innerHTML=out;
  $("allProg").textContent=t("c_prog",td,tot);
  $("allBar").style.width=(tot?Math.round(td/tot*100):0)+"%";
}
function toggleTr(key){ var el=$("tr-"+key); if(el) el.classList.toggle("hide"); }
function setShowTr(v){ S.showTr=v; setKV("showTr",v).then(renderLearn); }
function toggleLearn(id){
  var v=!S.learned[id]; S.learned[id]=v;
  sPut("learned",{id:id,v:v}).then(renderLearn);
}
