/* ---------- günlük görevler / daily tasks ---------- */
function qCount(){ var m=S.prof.mins; return m>=90?20:(m>=60?15:10); }
function taskDefs(ds){
  ds=ds||todayStr();
  var p=S.prof, dow=dowOf(ds), ph=phaseOf(ds), m=p.mins, n=qCount(), tl=[];
  var testDay=isTestDay(ds), analDay=isTestDay(addDays(ds,-1));
  var wk=Math.floor(daysBetween(p.start,ds)/7);
  tl.push({id:"kelime",n:t("t_kelime"),s:t("t_kelime_s")});
  tl.push({id:"gramer",n:t("t_gramer"),s:t("t_gramer_s")});
  if(p.esl){
    var read= m>=90 ? (dow>=1&&dow<=6) : m>=60 ? (dow===2||dow===4||dow===6) : dow===6;
    var listen= m>=60 && (dow===1||dow===3||dow===5);
    if(read) tl.push({id:"okuma",n:t("t_okuma"),s:t("t_okuma_s"),u:SNE_URL,ul:t("link_sne")});
    if(listen) tl.push({id:"dinleme",n:t("t_dinleme"),s:t("t_dinleme_s")});
  }
  if(dow===0){
    if(testDay) tl.push({id:"deneme",n:t("t_deneme"),s:t("t_deneme_s"),u:BB_URL,ul:t("link_bb")});
    else {
      tl.push({id:"defter",n:t("t_defter"),s:t("t_defter_s")});
      if(m>=60) tl.push({id:"tekrarq",n:t("t_tekrarq"),s:t("t_tekrarq_s"),u:QB_URL,ul:t("link_qb")});
    }
    return tl;
  }
  if(analDay){ tl.push({id:"analiz",n:t("t_analiz"),s:t("t_analiz_s")}); return tl; }
  var module = dow===6 && (m>=60 || ph===3);
  if(module){
    tl.push(wk%2===0 ? {id:"modul",n:t("t_modul_rw"),s:t("t_modul_rw_s"),u:QB_URL,ul:t("link_qb")}
                     : {id:"modul",n:t("t_modul_m"),s:t("t_modul_m_s"),u:QB_URL,ul:t("link_qb")});
    return tl;
  }
  /* 90 dk Hacim/Prova: her gün ikisi de. Diğerleri: R&W Pzt/Çar/Cum, Math Sal/Per (+Cmt 30 dk'da) */
  var both = m>=90 && ph>1;
  var rwDays = both ? [1,2,3,4,5] : [1,3,5];
  var mDays  = both ? [1,2,3,4,5] : (m<60 ? [2,4,6] : [2,4]);
  if(rwDays.indexOf(dow)>=0){
    var grp = ph===1 ? (dow===3?"okuma":"gramer") : ["gramer","okuma"];
    tl.push({id:"rw",n:t("t_rw",n,Math.round(n*71/60)),s:t("t_rw_s",focusLine(grp)),u:QB_URL,ul:t("link_qb")});
  }
  if(mDays.indexOf(dow)>=0)
    tl.push({id:"mat",n:t("t_mat",n,Math.round(n*95/60)),s:t("t_mat_s",focusLine("mat")),u:QB_URL,ul:t("link_qb")});
  return tl;
}
function renderTasks(){
  var d=todayStr(), done=S.tasks[d]||{}, defs=taskDefs(d), h="", ph=phaseOf(d);
  $("phaseLbl").textContent="· "+t("ph_lbl",S.prof.target,ph,t("ph_names")[ph-1]);
  for(var i=0;i<defs.length;i++){
    var x=defs[i], ok=!!done[x.id];
    h+='<div class="task'+(ok?" done":"")+'" onclick="toggleTask(\''+x.id+'\')">'+
       '<div class="box">✓</div><div class="t">'+esc(x.n)+'<small>'+esc(x.s)+
       (x.u?'<br><a class="tlink" href="'+x.u+'" target="_blank" rel="noopener" onclick="event.stopPropagation()">'+esc(x.ul)+' ↗</a>':'')+
       '</small></div></div>';
  }
  $("taskList").innerHTML=h;
}
function toggleTask(id){
  var d=todayStr(); if(!S.tasks[d]) S.tasks[d]={};
  S.tasks[d][id]=!S.tasks[d][id];
  setKV("tasks",S.tasks).then(renderToday);
}
function markTask(id){
  var d=todayStr(); if(!S.tasks[d]) S.tasks[d]={};
  if(S.tasks[d][id]) return Promise.resolve();
  S.tasks[d][id]=true; return setKV("tasks",S.tasks).then(renderToday);
}
function streak(){
  var n=0, d=todayStr();
  if(!(S.tasks[d]&&S.tasks[d].kelime)) d=addDays(d,-1);
  while(S.tasks[d]&&S.tasks[d].kelime){ n++; d=addDays(d,-1); }
  return n;
}
function renderToday(){
  var d=todayStr();
  $("todayTitle").textContent=t("days")[dowOf(d)]+", "+fmtDate(d);
  var due=dueWords().length;
  $("stStreak").textContent=streak(); $("stDue").textContent=due; $("stWords").textContent=S.words.length;
  $("nextUp").textContent=due?"":nextUpLine();
  var g=daysBetween(d,S.prof.exam);
  $("stDays").textContent=g>=0?g:"—";
  $("hdrSub").innerHTML=(g>=0?esc(t("exam_in",g))+"<br>":"")+"<span style='opacity:.7'>"+esc(fmtDate(S.prof.exam))+"</span>";
  renderTasks(); renderGauge();
}

/* ---------- beceri odağı + soru kaydı / skill focus + question log ---------- */
function skillById(id){ for(var i=0;i<SKILLS.length;i++) if(SKILLS[i][0]===id) return SKILLS[i]; return null; }
function skillStats(before){
  var st={}; (S.qlog||[]).forEach(function(q){
    if(before && q.d>=before) return;
    var x=st[q.sk]||(st[q.sk]={c:0,n:0,k:0,last:""}); x.c+=q.c; x.n+=q.n; x.k++; if(q.d>x.last) x.last=q.d; });
  return st;
}
/* önce %80 altındaki en zayıf beceri; yoksa sıradaki çalışılmamış beceri (gün içinde değişmez) */
function pickSkill(grp){
  var gs=(typeof grp==="string")?[grp]:grp, st=skillStats(todayStr()), weak=null, wv=1, next=null, last=null;
  var order=SKILL_PRIO.map(skillById).filter(Boolean);
  for(var i=0;i<order.length;i++){
    var s=order[i]; if(gs.indexOf(s[3])<0) continue;
    last=s; var x=st[s[0]];
    if(!x||!x.n){ if(!next) next=s; continue; }
    var v=x.c/x.n; if(v<0.8 && v<wv){ weak=s; wv=v; }
  }
  return weak||next||last;
}
function focusLine(grp){ var s=pickSkill(grp); return s?t("focus",s[1],L(s[2])):""; }
function addQlog(){
  var sk=$("qSk").value, c=parseInt($("qC").value,10), n=parseInt($("qN").value,10);
  if(!sk||isNaN(c)||isNaN(n)||n<=0||c<0||c>n){ alert(t("q_bad")); return; }
  S.qlog=(S.qlog||[]).concat([{d:todayStr(),sk:sk,c:c,n:n}]);
  $("qC").value=""; $("qN").value="";
  setKV("qlog",S.qlog).then(function(){ renderQlog(); renderProgress(); });
}
function renderQlog(){
  var cur=$("qSk").value, dow=dowOf(todayStr());
  var def=(dow===2||dow===4)?pickSkill("mat"):pickSkill("gramer");
  var groups=[["gramer","R&W · Expression / Conventions"],["okuma","R&W · Reading"],["mat","Math"]];
  $("qSk").innerHTML=groups.map(function(g){
    return '<optgroup label="'+g[1]+'">'+SKILLS.filter(function(s){return s[3]===g[0];}).map(function(s){
      return '<option value="'+s[0]+'">'+esc(s[1])+'</option>'; }).join("")+'</optgroup>'; }).join("");
  $("qSk").value=cur||(def?def[0]:SKILLS[0][0]);
  var td=(S.qlog||[]).filter(function(q){return q.d===todayStr();});
  $("qToday").innerHTML=td.length?esc(t("q_today",td.map(function(q){var s=skillById(q.sk);return (s?s[1]:q.sk)+" "+q.c+"/"+q.n;}).join(" · "))):esc(t("q_none"));
}
function skillTableHtml(){
  var st=skillStats(null), rows=[];
  SKILLS.forEach(function(s){ var x=st[s[0]]; if(x&&x.n) rows.push([s,x,x.c/x.n]); });
  if(!rows.length) return '<p class="muted">'+esc(t("p_sk_none"))+'</p>';
  rows.sort(function(a,b){return a[2]-b[2];});
  return rows.map(function(r){
    var pc=Math.round(r[2]*100), col=pc>=80?"var(--ok)":pc>=60?"var(--warn)":"var(--bad)";
    return '<div class="mrow"><div><b>'+esc(r[0][1])+'</b><div class="muted" style="font-size:12px">'+
      (r[0][3]==="mat"?"Math":"R&amp;W")+' · '+esc(t("p_sets",r[1].k))+' · '+r[1].c+'/'+r[1].n+'</div></div>'+
      '<div style="font-weight:800;color:'+col+'">'+(LANG==="tr"?"%"+pc:pc+"%")+'</div></div>';
  }).join("")+'<p class="muted" style="margin-top:8px;font-size:12px">'+esc(t("p_sk_note"))+'</p>';
}

/* ---------- gidişat göstergesi / progress gauge ----------
   Puan yalnız tam denemelerden: son denemeden önceki 14 gündeki denemelerin ortalaması, aralık ±40/√n.
   Eğilim: ≥2 deneme ve ≥14 gün varsa en küçük kareler eğimi (puan/ay). Çalışma düzeni: son 7 gün görev oranı. */
function pct(v){ return LANG==="tr"?"%"+v:v+"%"; }
function gaugeData(){
  var td=todayStr(), ts=S.tests.slice().sort(function(a,b){return a.date<b.date?-1:1;}), r={n:ts.length};
  if(ts.length){
    var last=ts[ts.length-1];
    r.lastAge=daysBetween(last.date,td);
    var recent=ts.filter(function(x){return daysBetween(x.date,last.date)<=14;});
    r.est=Math.round(recent.reduce(function(a,x){return a+x.total;},0)/recent.length/10)*10;
    r.k=recent.length; r.err=Math.round(40/Math.sqrt(recent.length)/5)*5;
    var withSec=recent.filter(function(x){return x.rw!=null&&x.math!=null;});
    if(withSec.length){ r.rw=Math.round(withSec.reduce(function(a,x){return a+x.rw;},0)/withSec.length);
      r.math=Math.round(withSec.reduce(function(a,x){return a+x.math;},0)/withSec.length); }
    if(ts.length>=2 && daysBetween(ts[0].date,last.date)>=14){
      var xs=ts.map(function(x){return daysBetween(ts[0].date,x.date);}), ys=ts.map(function(x){return x.total;});
      var mx=xs.reduce(function(a,b){return a+b;},0)/xs.length, my=ys.reduce(function(a,b){return a+b;},0)/ys.length, num=0, den=0;
      for(var i=0;i<xs.length;i++){ num+=(xs[i]-mx)*(ys[i]-my); den+=(xs[i]-mx)*(xs[i]-mx); }
      if(den>0) r.slope=Math.round(num/den*30.4);
    }
    var left=daysBetween(td,S.prof.exam);
    if(left>0) r.need=Math.max(0,Math.round((S.prof.target-r.est)/(left/30.4)));
    r.left=left;
  }
  var tot=0, dn=0, rev=0, miss={}, counted=0;
  for(var d=1; d<=7; d++){
    var ds=addDays(td,-d); if(ds<S.prof.start) continue;
    counted++;
    var done=S.tasks[ds]||{}, defs=taskDefs(ds);
    tot+=defs.length;
    defs.forEach(function(x){ var mi=miss[x.id]||(miss[x.id]={n:x.n,due:0,ok:0}); mi.due++; if(done[x.id]){ dn++; mi.ok++; } });
    if(done.kelime) rev++;
  }
  r.counted=counted; r.eff=tot?Math.round(dn/tot*100):0; r.revDays=rev;
  r.miss=Object.keys(miss).map(function(k){return miss[k];}).filter(function(m){return m.ok<m.due;})
    .sort(function(a,b){return (a.ok/a.due)-(b.ok/b.due)||b.due-a.due;}).slice(0,4);
  var tdefs=taskDefs(td), tdone=S.tasks[td]||{}, tc=0;
  tdefs.forEach(function(x){ if(tdone[x.id]) tc++; });
  r.today=tc+"/"+tdefs.length;
  var e=r.eff, lb=t("g_lbls");
  r.lbl=!counted?[t("g_new"),"var(--dim)"]: e>=90?[lb[0],"var(--ok)"]:e>=75?[lb[1],"var(--ok)"]:e>=55?[lb[2],"var(--acc)"]:e>=35?[lb[3],"var(--warn)"]:[lb[4],"var(--bad)"];
  return r;
}
function renderGauge(){
  var g=gaugeData();
  $("gScore").textContent=g.n?("≈"+g.est):"—";
  $("gLbl").textContent=g.lbl[0]; $("gLbl").style.color=g.lbl[1];
  if(!$("gPanel").classList.contains("hide")) $("gPanel").innerHTML=gaugeHtml(g);
}
function gaugeHtml(g){
  var h='<div class="gr"><h3>'+esc(t("g_score"))+'</h3>';
  if(!g.n) h+='<div class="muted">'+esc(t("g_none"))+'</div></div>';
  else {
    h+='<div class="big">'+g.est+' <span class="muted" style="font-size:13px">('+Math.max(400,g.est-g.err)+'–'+Math.min(1600,g.est+g.err)+')</span></div>'+
       '<div class="muted">'+(g.rw!=null?'R&amp;W '+g.rw+' · Math '+g.math+' · ':'')+esc(t("g_based",g.k,g.lastAge))+'</div>';
    if(g.lastAge>35) h+='<div style="color:var(--warn);font-size:12.5px;margin-top:3px">'+esc(t("g_old"))+'</div>';
    h+='</div><div class="gr"><h3>'+esc(t("g_trend"))+'</h3>';
    h+=g.slope==null?'<div class="muted">'+esc(t("g_trend_none"))+'</div>'
      :'<div><b>'+(g.slope>=0?"+":"")+g.slope+' '+esc(t("g_perm"))+'</b>'+(g.n<3?' <span class="muted">'+esc(t("g_unrel",g.n))+'</span>':'')+'</div>';
    if(g.need!=null) h+='<div class="muted">'+t("g_need",S.prof.target,g.need,g.left)+'</div>';
    h+='</div>';
  }
  h+='<div class="gr"><h3>'+esc(t("g_eff"))+': <span style="color:'+g.lbl[1]+'">'+esc(g.lbl[0])+'</span></h3>'+
     '<div>'+t("g_eff_line",g.eff,g.revDays,g.today)+'</div>'+
     (g.miss.length?'<div style="margin-top:4px;font-size:13px">'+esc(t("g_miss"))+' '+g.miss.map(function(m){
        return '<b>'+esc(m.n.split(":")[0])+'</b> '+m.ok+'/'+m.due;}).join(" · ")+'</div>':'')+
     '<div class="muted">'+esc(t("g_scale"))+'</div></div><div class="gr muted">'+esc(t("g_note"))+'</div>';
  return h;
}
function toggleGauge(){
  var p=$("gPanel");
  if(p.classList.contains("hide")){ p.innerHTML=gaugeHtml(gaugeData()); p.classList.remove("hide"); }
  else p.classList.add("hide");
}
document.addEventListener("click",function(e){
  var p=$("gPanel"); if(!p||p.classList.contains("hide")) return;
  if(!p.contains(e.target) && !$("gPill").contains(e.target)) p.classList.add("hide");
});
