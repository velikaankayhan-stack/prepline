/* ---------- gezinme / navigation ---------- */
function go(sec){
  if(sec!=="ogren" && GP){ gpStop(); GP.playing=false; }
  var secs=document.querySelectorAll("section"); for(var i=0;i<secs.length;i++) secs[i].classList.remove("on");
  $("s-"+sec).classList.add("on");
  var bs=document.querySelectorAll("nav button");
  for(var j=0;j<bs.length;j++) bs[j].setAttribute("aria-current",bs[j].dataset.t===sec?"true":"false");
  window.scrollTo(0,0);
}

/* ---------- ilerleme / progress ---------- */
function addTest(){
  var rw=parseInt($("tRw").value,10), ma=parseInt($("tMa").value,10);
  if(isNaN(rw)||isNaN(ma)||rw<200||rw>800||ma<200||ma>800){ alert(t("p_both")); return; }
  var o={date:$("tDate").value||todayStr(),name:$("tName").value.trim()||"Practice",rw:rw,math:ma,total:rw+ma};
  sPut("tests",o).then(load).then(function(){ $("tRw").value=""; $("tMa").value=""; $("tName").value=""; });
}
function delTest(id){ if(!confirm(t("delq"))) return; sDel("tests",id).then(load); }
function renderProgress(){
  var ts=S.tests.slice().sort(function(a,b){return a.date<b.date?-1:1;});
  var W=Math.max(320,ts.length*86+70), H=200, P=34, min=400, max=1600;
  function y(v){ return H-P-(v-min)/(max-min)*(H-P-18); }
  var s='<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" style="display:block" role="img">';
  [400,800,1200,1600].forEach(function(g){
    s+='<line x1="'+P+'" y1="'+y(g)+'" x2="'+(W-8)+'" y2="'+y(g)+'" stroke="var(--line)" stroke-width="1"/>'+
       '<text x="2" y="'+(y(g)+4)+'" font-size="10" fill="var(--dim)">'+g+'</text>';
  });
  if(S.prof){ var ty=y(S.prof.target);
    s+='<line x1="'+P+'" y1="'+ty+'" x2="'+(W-8)+'" y2="'+ty+'" stroke="var(--ok)" stroke-width="1" stroke-dasharray="4 4"/>'+
       '<text x="'+(W-10)+'" y="'+(ty-4)+'" font-size="10" fill="var(--ok)" text-anchor="end">'+S.prof.target+'</text>'; }
  if(ts.length){
    var step=(W-P-16)/Math.max(1,ts.length-1), pts=ts.map(function(x,i){ return [ts.length===1?(P+(W-P-16)/2):(P+i*step), y(x.total)]; });
    if(pts.length>1) s+='<path d="M'+pts.map(function(p){return p[0].toFixed(1)+","+p[1].toFixed(1);}).join(" L")+'" fill="none" stroke="var(--acc)" stroke-width="2.5" stroke-linejoin="round"/>';
    pts.forEach(function(p,k){
      s+='<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="4.5" fill="var(--acc)"/>'+
         '<text x="'+p[0].toFixed(1)+'" y="'+(p[1]-10).toFixed(1)+'" font-size="11" font-weight="700" fill="var(--fg)" text-anchor="middle">'+ts[k].total+'</text>'+
         '<text x="'+p[0].toFixed(1)+'" y="'+(H-12)+'" font-size="11" fill="var(--dim)" text-anchor="middle">'+esc(ts[k].name.length>12?ts[k].name.slice(0,11)+"…":ts[k].name)+'</text>';
    });
  } else s+='<text x="'+(W/2)+'" y="'+(H/2)+'" font-size="12" fill="var(--dim)" text-anchor="middle">'+esc(t("p_none"))+'</text>';
  $("chart").innerHTML=s+'</svg>';
  $("testList").innerHTML=ts.slice().reverse().map(function(x){
    return '<div class="item"><div class="hd"><b>'+esc(x.name)+'</b><span class="tag">'+esc(fmtDate(x.date))+'</span><b style="margin-left:auto">'+x.total+'</b></div>'+
      '<div class="hd" style="margin-top:4px"><span class="sen" style="font-style:normal">'+(x.rw!=null?'R&amp;W '+x.rw+' · Math '+x.math:'&nbsp;')+'</span>'+
      '<button class="sm ghost" style="margin-left:auto;flex:0 0 auto" onclick="delTest('+x.id+')">'+esc(t("del"))+'</button></div></div>';
  }).join("");
  $("skillTable").innerHTML=skillTableHtml();
  $("trCard").classList.toggle("hide",!S.prof.esl);
  var sorted=S.errors.slice().sort(function(a,b){return (a.id||0)-(b.id||0);}), half=Math.floor(sorted.length/2);
  function share(arr){ return arr.length?Math.round(arr.filter(function(e){return e.tr;}).length/arr.length*100):null; }
  var older=share(sorted.slice(0,half)), newer=share(sorted.slice(half)), all=share(sorted);
  if(all===null){ $("trStat").innerHTML='<p class="muted">'+esc(t("nodata"))+'</p>'; return; }
  var h='<div class="stat"><div><b>'+pct(all)+'</b><span>'+esc(t("p_tr_all"))+'</span></div>';
  if(older!==null) h+='<div><b>'+pct(older)+'</b><span>'+esc(t("p_tr_old"))+'</span></div>';
  if(newer!==null) h+='<div><b>'+pct(newer)+'</b><span>'+esc(t("p_tr_new"))+'</span></div>';
  h+='</div>';
  if(older!==null&&newer!==null) h+='<p class="muted" style="margin-top:10px">'+esc(newer<older?t("p_tr_down"):newer>older?t("p_tr_up"):t("p_tr_flat"))+'</p>';
  $("trStat").innerHTML=h;
}

/* ---------- ayarlar / settings ---------- */
function chips(id,opts,cur,fn){
  $(id).innerHTML=opts.map(function(o){ return '<button class="chip" aria-pressed="'+(cur===o[0])+'" onclick="'+fn+'('+JSON.stringify(o[0]).replace(/"/g,"&quot;")+')">'+esc(o[1])+'</button>'; }).join("");
}
function renderSettings(){
  chips("chLang",[["tr","Türkçe"],["en","English"]],LANG,"setLang");
  var dates=SAT_DATES.filter(function(d){return d>todayStr();}), cust=dates.indexOf(S.prof.exam)<0;
  $("examSel").innerHTML=dates.map(function(d){return '<option value="'+d+'">'+esc(fmtDate(d))+' (SAT)</option>';}).join("")+
    '<option value="other">'+esc(t("ob_other"))+(cust?" — "+esc(fmtDate(S.prof.exam)):"")+'</option>';
  $("examSel").value=cust?"other":S.prof.exam; $("examDate").value=S.prof.exam; $("examDate").classList.toggle("hide",!cust);
  chips("chTarget",[1200,1300,1400,1450,1500,1550,1600].map(function(v){return [v,String(v)];}),S.prof.target,"setTarget");
  chips("chMins",[30,60,90].map(function(v){return [v,t("ob_min",v)];}),S.prof.mins,"setMins");
  $("sEsl").checked=!!S.prof.esl; $("eslRow").classList.toggle("hide",LANG==="tr"); $("sMath").checked=!!S.mathDrip;
  chips("chRev",[50,100,150,200,300].map(function(v){return [v,String(v)];}),S.revLimit,"setRevLimit");
  chips("chNew",[5,10,15,20,30].map(function(v){return [v,String(v)];}),S.newLimit,"setNewLimit");
  var th=t("themes"); chips("chTheme",[["",th[0]],["light",th[1]],["dark",th[2]],["amoled",th[3]]],S.theme,"setTheme");
  $("verInfo").textContent=APP_NAME+" · "+t("s_ver",APP_VER)+(MEM?" · memory":"");
  if(SRC_URL) $("srcLink").href=SRC_URL; else $("srcWrap").style.display="none";
  if(FEEDBACK_URL) $("fbLink").href=FEEDBACK_URL; else $("fbLink").style.display="none";
}
function setLang(l){ LANG=l; S.prof.lang=l; if(l==="tr") S.prof.esl=true; saveProf().then(function(){ applyI18n(); renderAll(); }); }
function examSelChange(){ var v=$("examSel").value; if(v==="other"){ $("examDate").classList.remove("hide"); $("examDate").focus(); } else saveExam(v); }
function saveExam(v){ if(!v||v<=todayStr()){ alert(t("ob_bad_date")); return; } S.prof.exam=v; _td=null; saveProf().then(renderAll); }
function setTarget(v){ S.prof.target=v; saveProf().then(renderAll); }
function setMins(v){ S.prof.mins=v; saveProf().then(renderAll); }
function setEsl(v){ S.prof.esl=!!v; saveProf().then(renderAll); }
function setMathDrip(v){ S.mathDrip=!!v; setKV("mathDrip",S.mathDrip).then(function(){ DRIPPED=false; dripPack(); renderMath(); }); }
function setRevLimit(v){ S.revLimit=v; setKV("revLimit",v).then(function(){ renderSettings(); startReview(); renderToday(); }); }
function setNewLimit(v){ S.newLimit=v; setKV("newLimit",v).then(function(){ renderSettings(); startReview(); renderToday(); }); }
function setTheme(v){ S.theme=v; applyTheme(); setKV("theme",v).then(renderSettings); }
function applyTheme(){ if(S.theme) document.documentElement.setAttribute("data-theme",S.theme); else document.documentElement.removeAttribute("data-theme"); }

/* ---------- yedek / backup ---------- */
var KV_KEYS=["lastBackup","prof","tasks","inbox","qlog","roots","gram","theme","showTr","revLimit","newLimit","mathDrip"];
function exportData(){
  var d={app:APP_NAME,v:APP_VER,at:new Date().toISOString(),words:S.words,errors:S.errors,tests:S.tests,learned:S.learned,kv:{}};
  Promise.all(KV_KEYS.map(function(k){ return getKV(k,null).then(function(v){ d.kv[k]=v; }); })).then(function(){
    var a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([JSON.stringify(d)],{type:"application/json"}));
    a.download=slug(APP_NAME)+"-backup-"+todayStr()+".json";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(a.href); },2000);
    setKV("lastBackup",todayStr()).then(renderBackup);
  });
}
function wipe(){ return Promise.all(["words","errors","tests","learned","kv"].map(sClear)); }
function importData(inp){
  var f=inp.files[0]; if(!f) return;
  var fr=new FileReader();
  fr.onload=function(){
    var d; try{ d=JSON.parse(fr.result); }catch(e){ alert(t("s_imp_bad")); return; }
    if(!d||!d.kv||!d.kv.prof){ alert(t("s_imp_bad")); return; }
    if(!confirm(t("s_imp_q"))) return;
    wipe().then(function(){
      var p=[];
      (d.words||[]).forEach(function(w){ delete w.id; p.push(sPut("words",w)); });
      (d.errors||[]).forEach(function(e){ delete e.id; p.push(sPut("errors",e)); });
      (d.tests||[]).forEach(function(x){ delete x.id; p.push(sPut("tests",x)); });
      Object.keys(d.learned||{}).forEach(function(k){ p.push(sPut("learned",{id:k,v:d.learned[k]})); });
      Object.keys(d.kv).forEach(function(k){ if(KV_KEYS.indexOf(k)>=0 && d.kv[k]!=null) p.push(setKV(k,d.kv[k])); });
      return Promise.all(p);
    }).then(function(){ inp.value=""; return boot2(); }).then(function(){ alert(t("s_imp_ok")); });
  };
  fr.readAsText(f);
}
/* ---------- yükleme düğmesi, güncelleme, yedek hatırlatma / install, update, backup reminder ---------- */
var INST_EVT=null;
function isStandalone(){ return (window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true; }
function isIOS(){ return /iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1); }
window.addEventListener("beforeinstallprompt",function(e){ e.preventDefault(); INST_EVT=e; renderInstall(); });
window.addEventListener("appinstalled",function(){ INST_EVT=null; renderInstall(); });
function renderInstall(){
  var c=$("instCard"); if(!c||!S.prof) return;
  var hidden=false; try{ hidden=localStorage.getItem("instHide")===todayStr().slice(0,7); }catch(e){}
  var show=!isStandalone() && !hidden && (INST_EVT || isIOS());
  c.classList.toggle("hide",!show);
  if(!show) return;
  $("instText").textContent=INST_EVT?t("inst_android"):t("inst_ios");
  $("instBtn").classList.toggle("hide",!INST_EVT);
}
function doInstall(){ if(!INST_EVT) return; INST_EVT.prompt(); INST_EVT.userChoice.then(function(){ INST_EVT=null; renderInstall(); }); }
function hideInstall(){ try{ localStorage.setItem("instHide",todayStr().slice(0,7)); }catch(e){} renderInstall(); }  /* bir ay sorma */
function renderBackup(){
  var c=$("bkCard"); if(!c||!S.prof) return;
  getKV("lastBackup",null).then(function(lb){
    var ref=lb||S.prof.start, due=daysBetween(ref,todayStr())>=14 && (S.words.length>=15||S.errors.length>=5||S.tests.length>=2);
    getKV("bkSnooze",null).then(function(sn){
      var show=due && !(sn && daysBetween(sn,todayStr())<3);
      c.classList.toggle("hide",!show);
      if(show) $("bkText").textContent=t("bk_text",lb?fmtDate(lb):t("bk_never"));
    });
  });
}
function snoozeBackup(){ setKV("bkSnooze",todayStr()).then(renderBackup); }
function initUpdates(){
  if(!("serviceWorker" in navigator)) return;
  var had=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange",function(){ if(had) $("updToast").classList.remove("hide"); });
}

function resetAll(){ if(!confirm(t("s_reset_q"))) return; wipe().then(function(){ location.reload(); }); }

/* ---------- ilk kurulum / onboarding ---------- */
var OB={step:0,lang:null,exam:null,esl:true,cur:null,noScore:false,target:null,mins:60,err:""};
function obSteps(){ return OB.lang==="en"?["lang","exam","esl","score","target","mins","sum"]:["lang","exam","score","target","mins","sum"]; }
function obShow(){ $("ob").classList.remove("hide"); obDraw(); }
function obBtn(label,sub,on,fn){ return '<button class="'+(on?'on':'')+'" onclick="'+fn+'">'+esc(label)+(sub?'<small>'+esc(sub)+'</small>':'')+'</button>'; }
function obDraw(){
  var st=obSteps(), k=st[OB.step], h="";
  if(OB.lang){ LANG=OB.lang; }
  var dots='<div class="dots">'+st.map(function(_,i){return '<i class="'+(i<=OB.step?'on':'')+'"></i>';}).join("")+'</div>';
  h+='<h1>'+esc(APP_NAME)+'</h1><p class="muted" style="margin:0">'+esc(OB.lang?t("ob_welcome"):"Ücretsiz SAT programı · A free SAT study plan")+'</p>'+dots;
  if(k==="lang"){
    h+='<h2>Dil seç · Choose a language</h2><div class="big">'+obBtn("Türkçe","",OB.lang==="tr","obLang('tr')")+obBtn("English","",OB.lang==="en","obLang('en')")+'</div>';
    h+='<p style="margin-top:22px"><button class="ghost sm" onclick="document.getElementById(\'impFile\').click()">Yedekten yükle · Restore a backup</button></p>';
  } else if(k==="exam"){
    var dates=SAT_DATES.filter(function(d){return daysBetween(todayStr(),d)>=14;}).slice(0,6);
    h+='<h2>'+esc(t("ob_exam"))+'</h2><p class="muted">'+esc(t("ob_exam_hint"))+'</p><div class="big">'+
      dates.map(function(d){ return obBtn(fmtDate(d),"SAT · "+t("in_days",daysBetween(todayStr(),d)),OB.exam===d,"obExam('"+d+"')"); }).join("")+'</div>'+
      '<label>'+esc(t("ob_other"))+'</label><input type="date" id="obDate" value="'+(OB.exam&&dates.indexOf(OB.exam)<0?OB.exam:"")+'" onchange="obExam(this.value)">'+
      '<div class="big">'+obBtn(t("ob_unknown"),"",false,"obExamUnknown()")+'</div>';
  } else if(k==="esl"){
    h+='<h2>'+esc(t("ob_esl"))+'</h2><div class="big">'+obBtn(t("ob_yes"),"",OB.esl===false,"obEsl(false)")+obBtn(t("ob_no"),"",OB.esl===true,"obEsl(true)")+'</div>';
  } else if(k==="score"){
    h+='<h2>'+esc(t("ob_score"))+'</h2><p class="muted">'+esc(t("ob_score_hint"))+'</p>'+
      '<input id="obScore" type="number" inputmode="numeric" min="400" max="1600" step="10" placeholder="1100" value="'+(OB.cur||"")+'" oninput="OB.cur=parseInt(this.value,10)||null;OB.noScore=false">'+
      '<div class="big">'+obBtn(t("ob_noscore"),"",OB.noScore,"obNoScore()")+'</div>';
  } else if(k==="target"){
    var base=OB.cur||0, opts=[1200,1300,1400,1450,1500,1550,1600].filter(function(v){return v>base;});
    h+='<h2>'+esc(t("ob_target"))+'</h2><div class="chips" style="margin-top:10px">'+opts.map(function(v){
      return '<button class="chip" aria-pressed="'+(OB.target===v)+'" onclick="OB.target='+v+';OB.err=\'\';obDraw()">'+v+'</button>'; }).join("")+'</div>';
  } else if(k==="mins"){
    h+='<h2>'+esc(t("ob_mins"))+'</h2><p class="muted">'+esc(t("ob_mins_hint"))+'</p><div class="big">'+
      [30,60,90].map(function(v){ return obBtn(t("ob_min",v),"",OB.mins===v,"OB.mins="+v+";obDraw()"); }).join("")+'</div>';
  } else if(k==="sum"){
    var tmp=obProfile(), keep=S.prof; S.prof=tmp; _td=null;
    var pd=planDates(), tdays=testDays(), nm=t("ph_names"), ds=t("ph_desc"), lis="";
    if(pd.hacim>tmp.start) lis+='<li><b>'+esc(nm[0])+'</b> — '+esc(t("ph_until",fmtDate(addDays(pd.hacim,-1))))+': '+esc(ds[0])+'</li>';
    if(pd.prova>pd.hacim) lis+='<li><b>'+esc(nm[1])+'</b> — '+esc(t("ph_until",fmtDate(addDays(pd.prova,-1))))+': '+esc(ds[1])+'</li>';
    lis+='<li><b>'+esc(nm[2])+'</b> — '+esc(t("ph_exam"))+': '+esc(ds[2])+'</li>';
    h+='<h2>'+esc(t("ob_plan"))+'</h2><div class="card sum"><p>'+esc(t("ob_sum1",daysBetween(tmp.start,tmp.exam),fmtDate(tmp.exam)))+'</p>'+
      '<p>'+esc(tmp.cur?t("ob_sum2",tmp.cur,tmp.target):t("ob_sum2b",tmp.target))+'</p>'+
      '<p style="margin-bottom:0">'+esc(t("ob_sum3"))+'</p><ul style="margin-top:4px;padding-left:20px">'+lis+'</ul>'+
      (tdays.length?'<p>'+esc(t("ob_sum4",fmtDate(tdays[0])))+'</p>':'')+'</div>';
    S.prof=keep; _td=null;
  }
  h+='<div class="err">'+esc(OB.err)+'</div><div class="obnav">'+
    (OB.step>0?'<button onclick="obBack()">'+esc(t("ob_back"))+'</button>':'')+
    (k!=="lang"?'<button class="primary" onclick="obNext()">'+esc(k==="sum"?t("ob_start"):t("ob_next"))+'</button>':'')+'</div>';
  $("obBox").innerHTML=h;
}
function obLang(l){ OB.lang=l; LANG=l; if(l==="tr") OB.esl=true; OB.step=1; OB.err=""; applyI18n(); obDraw(); }
function obExam(d){ if(!d) return; if(daysBetween(todayStr(),d)<1){ OB.err=t("ob_bad_date"); obDraw(); return; } OB.exam=d; OB.err=""; obDraw(); }
function obExamUnknown(){ var d=SAT_DATES.filter(function(x){return daysBetween(todayStr(),x)>=90;})[0]||addDays(todayStr(),120); OB.exam=d; OB.err=""; obNext(); }
function obEsl(v){ OB.esl=v; obNext(); }
function obNoScore(){ OB.noScore=true; OB.cur=null; OB.err=""; obNext(); }
function obBack(){ OB.err=""; OB.step=Math.max(0,OB.step-1); obDraw(); }
function obNext(){
  var k=obSteps()[OB.step]; OB.err="";
  if(k==="exam" && !OB.exam){ OB.err=t("ob_bad_date"); return obDraw(); }
  if(k==="score" && !OB.noScore){ var v=OB.cur; if(!v||v<400||v>1600){ OB.err=t("ob_bad_score"); return obDraw(); } }
  if(k==="target"){ if(!OB.target){ OB.err=t("ob_target"); return obDraw(); } if(OB.cur && OB.target<=OB.cur){ OB.err=t("ob_bad_target"); return obDraw(); } }
  if(k==="sum") return obFinish();
  OB.step++; obDraw();
}
function obProfile(){ return {lang:OB.lang,exam:OB.exam,start:todayStr(),cur:OB.noScore?null:OB.cur,target:OB.target,mins:OB.mins,esl:OB.lang==="tr"?true:OB.esl}; }
function obFinish(){
  S.prof=obProfile(); _td=null;
  S.mathDrip=!!S.prof.esl;
  var p=[saveProf(),setKV("mathDrip",S.mathDrip)];
  if(S.prof.cur) p.push(sPut("tests",{date:todayStr(),name:t("p_start"),rw:null,math:null,total:S.prof.cur}));
  Promise.all(p).then(function(){ $("ob").classList.add("hide"); return boot2(); });
}

/* ---------- yükleme / load ---------- */
function load(){
  return Promise.all([sAll("words"),sAll("errors"),sAll("tests"),sAll("learned"),getKV("tasks",{}),getKV("inbox",[]),getKV("qlog",[]),
    getKV("roots",[]),getKV("gram",{}),getKV("theme",""),getKV("showTr",false),getKV("revLimit",100),getKV("newLimit",10),getKV("mathDrip",true)])
  .then(function(r){
    S.words=r[0]; S.errors=r[1]; S.tests=r[2]; S.learned={}; r[3].forEach(function(x){ S.learned[x.id]=x.v; });
    S.tasks=r[4]||{}; S.inbox=r[5]||[]; S.qlog=r[6]||[]; S.roots=r[7]||[]; S.gram=r[8]||{}; S.theme=r[9]||"";
    S.showTr=!!r[10]; S.revLimit=r[11]||100; S.newLimit=r[12]||10; S.mathDrip=r[13]!==false;
    applyTheme(); renderAll();
    if(!S.cur) startReview();
  });
}
function renderAll(){
  applyI18n();
  $("tDate").value=todayStr();
  $("btnTureng").classList.toggle("hide",LANG!=="tr");
  renderToday(); renderWords(); renderChips(); renderErrors(); renderLearn(); renderProgress();
  renderSettings(); renderMath(); renderNotes(); renderQlog(); renderRoots(); renderGram();
  renderInstall(); renderBackup();
}
function boot2(){
  return getKV("prof",null).then(function(p){
    if(!p){ LANG=(navigator.language||"").toLowerCase().indexOf("tr")===0?"tr":"en"; applyI18n(); obShow(); return; }
    $("ob").classList.add("hide");
    S.prof=p; LANG=p.lang||"en"; _td=null; DRIPPED=false;
    return load().then(function(){ go("bugun"); dripPack(); });
  });
}
function boot(){
  openDB().then(function(){
    if(MEM) $("memWarn").classList.remove("hide");
    return boot2();
  });
  if("serviceWorker" in navigator && /^https?:$/.test(location.protocol) && window.self===window.top){
    try{ initUpdates(); navigator.serviceWorker.register("sw.js").catch(function(){}); }catch(e){}
  }
}
var LAST_DAY=null;
function checkDayRoll(){
  if(!S.prof) return;
  var d=todayStr(); if(LAST_DAY===null){ LAST_DAY=d; return; } if(d===LAST_DAY) return;
  LAST_DAY=d; S.cur=null; DRIPPED=false; load().then(dripPack);
}
setInterval(checkDayRoll,60000);
document.addEventListener("visibilitychange",function(){ if(!document.hidden) checkDayRoll(); });
boot();
