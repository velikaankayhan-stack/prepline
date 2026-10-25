"use strict";
/* ---------- yapılandırma / config ---------- */
var APP_NAME="Scorepath";
var APP_VER="1.2.0";
var SRC_URL="https://github.com/velikaankayhan-stack/prepline";
var FEEDBACK_URL="mailto:velikaankayhan@proton.me?subject=Scorepath%20feedback";                    /* GitHub repo URL, fill after publishing */
var QB_URL="https://satsuitequestionbank.collegeboard.org/";
var BB_URL="https://bluebook.collegeboard.org/";
var SNE_URL="https://www.snexplores.org/";
/* College Board SAT weekend dates (satsuite.collegeboard.org/sat/dates-deadlines, checked Oct 2026) */
var SAT_DATES=["2026-11-07","2026-12-05","2027-03-06","2027-05-01","2027-06-05",
               "2027-08-28","2027-09-18","2027-10-09","2027-11-06","2027-12-04","2028-03-04","2028-05-06","2028-06-03"];

/* ---------- yardımcılar ---------- */
function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];});}
function ymd(d){var y=d.getFullYear(),m=("0"+(d.getMonth()+1)).slice(-2),a=("0"+d.getDate()).slice(-2);return y+"-"+m+"-"+a;}
var DAY_START_H=4;   /* yeni gün 04:00'te başlar / a new day starts at 04:00 */
function today(){var d=new Date(Date.now()-DAY_START_H*3600000);d.setHours(0,0,0,0);return d;}
function todayStr(){return ymd(today());}
function addDays(ds,n){var d=new Date(ds+"T00:00:00");d.setDate(d.getDate()+n);return ymd(d);}
function daysBetween(a,b){return Math.round((new Date(b+"T00:00:00")-new Date(a+"T00:00:00"))/86400000);}
function dowOf(ds){return new Date(ds+"T00:00:00").getDay();}
function nowMs(){return Date.now();}
function slug(s){return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,80)||"w";}

/* ---------- dil / language ---------- */
var LANG="tr";
function t(k){
  var s=(I18N[LANG]&&I18N[LANG][k]!==undefined)?I18N[LANG][k]:(I18N.en[k]!==undefined?I18N.en[k]:k);
  if(typeof s!=="string") return s;
  for(var i=1;i<arguments.length;i++) s=s.split("{"+(i-1)+"}").join(arguments[i]);
  return s;
}
function L(o){ return (o&&typeof o==="object")?(o[LANG]!==undefined?o[LANG]:o.en):o; }  /* {tr,en} → current */
function fmtDate(ds){var d=new Date(ds+"T00:00:00"),m=t("mons")[d.getMonth()];
  return LANG==="tr"?(d.getDate()+" "+m+" "+d.getFullYear()):(m+" "+d.getDate()+", "+d.getFullYear());}
function applyI18n(){
  document.documentElement.lang=LANG;
  var a=document.querySelectorAll("[data-i]"); for(var i=0;i<a.length;i++) a[i].textContent=t(a[i].getAttribute("data-i"));
  var b=document.querySelectorAll("[data-ip]"); for(var j=0;j<b.length;j++) b[j].placeholder=t(b[j].getAttribute("data-ip"));
  $("appName").textContent=APP_NAME; document.title=APP_NAME;
  $("noteFab").title=t("inb_title"); $("gPill").title=t("g_score");
}

/* ---------- depolama / storage (IndexedDB, bellek yedeği) ---------- */
var DB=null, MEM=false;
var mem={kv:{},words:[],errors:[],tests:[],learned:{}};
var autoId={words:1,errors:1,tests:1};
function openDB(){
  return new Promise(function(res){
    var r;
    try{ r=indexedDB.open("prepline",1)   /* eski ad korunur: mevcut kullanıcıların verisi kaybolmasın */; }catch(e){ MEM=true; return res(); }
    r.onupgradeneeded=function(e){
      var d=e.target.result;
      ["words","errors","tests"].forEach(function(s){ if(!d.objectStoreNames.contains(s)) d.createObjectStore(s,{keyPath:"id",autoIncrement:true}); });
      if(!d.objectStoreNames.contains("kv")) d.createObjectStore("kv",{keyPath:"k"});
      if(!d.objectStoreNames.contains("learned")) d.createObjectStore("learned",{keyPath:"id"});
    };
    r.onsuccess=function(){ DB=r.result; res(); };
    r.onerror=function(){ MEM=true; res(); };
    r.onblocked=function(){ MEM=true; res(); };
  });
}
function rq(r){return new Promise(function(res,rej){r.onsuccess=function(){res(r.result);};r.onerror=function(){rej(r.error);};});}
function sAll(s){
  if(MEM) return Promise.resolve(
    s==="learned"?Object.keys(mem.learned).map(function(k){return {id:k,v:mem.learned[k]};})
    :s==="kv"?Object.keys(mem.kv).map(function(k){return {k:k,v:mem.kv[k]};}):mem[s].slice());
  return rq(DB.transaction(s).objectStore(s).getAll());
}
function sPut(s,v){
  if(MEM){
    if(s==="kv"){ mem.kv[v.k]=v.v; return Promise.resolve(); }
    if(s==="learned"){ mem.learned[v.id]=v.v; return Promise.resolve(); }
    if(v.id==null){ v.id=autoId[s]++; mem[s].push(v); }
    else { var i=mem[s].findIndex(function(x){return x.id===v.id;}); if(i<0) mem[s].push(v); else mem[s][i]=v; }
    return Promise.resolve();
  }
  return rq(DB.transaction(s,"readwrite").objectStore(s).put(v));
}
function sDel(s,k){
  if(MEM){ if(s==="learned"){ delete mem.learned[k]; return Promise.resolve(); }
    mem[s]=mem[s].filter(function(x){return x.id!==k;}); return Promise.resolve(); }
  return rq(DB.transaction(s,"readwrite").objectStore(s)["delete"](k));
}
function sClear(s){
  if(MEM){ if(s==="kv")mem.kv={}; else if(s==="learned")mem.learned={}; else mem[s]=[]; return Promise.resolve(); }
  return rq(DB.transaction(s,"readwrite").objectStore(s).clear());
}
function getKV(k,def){
  if(MEM) return Promise.resolve(mem.kv[k]===undefined?def:mem.kv[k]);
  return rq(DB.transaction("kv").objectStore("kv").get(k)).then(function(r){return r===undefined?def:r.v;});
}
function setKV(k,v){ return sPut("kv",{k:k,v:v}); }

/* ---------- sabit içerik / fixed content ---------- */
var DOMAINS=[
  {s:"rw",id:"info",n:"Information and Ideas"},{s:"rw",id:"craft",n:"Craft and Structure"},
  {s:"rw",id:"expr",n:"Expression of Ideas"},{s:"rw",id:"sec",n:"Standard English Conventions"},
  {s:"math",id:"alg",n:"Algebra"},{s:"math",id:"adv",n:"Advanced Math"},
  {s:"math",id:"psda",n:"Problem-Solving & Data Analysis"},{s:"math",id:"geo",n:"Geometry & Trigonometry"}];
var CAT_IDS=["bilgi","dil","teknik","dikkat"];
/* [id, College Board name, {tr,en} description, group] */
var SKILLS=[
 ["g-bnd","Boundaries",{tr:"Cümle sınırları ve noktalama",en:"sentence boundaries and punctuation"},"gramer"],
 ["g-fss","Form, Structure, and Sense",{tr:"Özne-yüklem uyumu, zaman, zamir",en:"agreement, tense, pronouns"},"gramer"],
 ["g-trn","Transitions",{tr:"Bağlaçlar: however, therefore…",en:"however, therefore, for example…"},"gramer"],
 ["g-rsy","Rhetorical Synthesis",{tr:"Notlardan amaca uygun cümle",en:"choosing the sentence that meets the goal"},"gramer"],
 ["r-wic","Words in Context",{tr:"Boşluğa en uygun kelime",en:"the best word for the blank"},"okuma"],
 ["r-tsp","Text Structure and Purpose",{tr:"Metnin / cümlenin amacı",en:"what the text or sentence does"},"okuma"],
 ["r-ctc","Cross-Text Connections",{tr:"İki metni karşılaştırma",en:"comparing two texts"},"okuma"],
 ["r-cid","Central Ideas and Details",{tr:"Ana fikir ve ayrıntı",en:"main idea and details"},"okuma"],
 ["r-inf","Inferences",{tr:"Paragrafı mantıklı tamamlama",en:"completing the text logically"},"okuma"],
 ["r-cet","Command of Evidence: Textual",{tr:"İddiayı destekleyen alıntı",en:"the quote that supports a claim"},"okuma"],
 ["r-ceq","Command of Evidence: Quantitative",{tr:"Tablo/grafikle destekleme",en:"using a table or graph"},"okuma"],
 ["m-l1","Linear equations in one variable",{tr:"Tek değişkenli doğrusal denklem",en:"one-variable linear equations"},"mat"],
 ["m-lf","Linear functions",{tr:"Doğrusal fonksiyonlar",en:"linear functions"},"mat"],
 ["m-l2","Linear equations in two variables",{tr:"İki değişkenli doğrusal denklem",en:"two-variable linear equations"},"mat"],
 ["m-sys","Systems of two linear equations",{tr:"Denklem sistemleri",en:"systems of equations"},"mat"],
 ["m-ineq","Linear inequalities",{tr:"Doğrusal eşitsizlikler",en:"linear inequalities"},"mat"],
 ["m-nlf","Nonlinear functions",{tr:"İkinci derece, üstel fonksiyonlar",en:"quadratic and exponential functions"},"mat"],
 ["m-nle","Nonlinear equations and systems",{tr:"Doğrusal olmayan denklemler",en:"nonlinear equations"},"mat"],
 ["m-eqx","Equivalent expressions",{tr:"Eşdeğer ifadeler",en:"equivalent expressions"},"mat"],
 ["m-rat","Ratios, rates, proportions, and units",{tr:"Oran, hız, orantı, birim",en:"ratios, rates, units"},"mat"],
 ["m-pct","Percentages",{tr:"Yüzdeler",en:"percentages"},"mat"],
 ["m-d1","One-variable data",{tr:"Ortalama, ortanca, dağılım",en:"mean, median, spread"},"mat"],
 ["m-d2","Two-variable data",{tr:"Saçılım grafiği, model",en:"scatterplots and models"},"mat"],
 ["m-prb","Probability",{tr:"Olasılık",en:"probability"},"mat"],
 ["m-inf","Inference from sample statistics",{tr:"Örneklemden çıkarım, hata payı",en:"samples and margin of error"},"mat"],
 ["m-esc","Evaluating statistical claims",{tr:"Gözlem / deney tasarımı",en:"observational studies and experiments"},"mat"],
 ["m-av","Area and volume",{tr:"Alan ve hacim",en:"area and volume"},"mat"],
 ["m-lat","Lines, angles, and triangles",{tr:"Doğru, açı, üçgen",en:"lines, angles, triangles"},"mat"],
 ["m-trig","Right triangles and trigonometry",{tr:"Dik üçgen ve trigonometri",en:"right triangles and trig"},"mat"],
 ["m-cir","Circles",{tr:"Çember",en:"circles"},"mat"]];
/* öğretme sırası: temelden zora / teaching order */
var SKILL_PRIO=["g-bnd","g-fss","g-trn","g-rsy","r-wic","r-cid","r-inf","r-cet","r-ceq","r-tsp","r-ctc",
  "m-l1","m-lf","m-l2","m-sys","m-ineq","m-eqx","m-nlf","m-nle","m-rat","m-pct","m-d1","m-d2","m-prb","m-inf","m-esc","m-av","m-lat","m-trig","m-cir"];

/* ---------- durum / state ---------- */
var S={words:[],errors:[],tests:[],learned:{},tasks:{},inbox:[],qlog:[],roots:[],gram:{},
  prof:null,theme:"",filter:"all",showTr:false,revLimit:100,newLimit:10,mathDrip:true,
  freeMode:false,pool:[],total:0,done:0,lastSid:null,sec:"rw",cat:"dil",cur:null};
function saveProf(){ return setKV("prof",S.prof); }

/* ---------- plan: aşamalar ve deneme günleri / phases and test days ---------- */
/* Prova: sınavdan önceki son 8 hafta. Temel: kalan sürenin %40'ı (en fazla 8 hafta). Arası Hacim. */
function planDates(){
  var p=S.prof, D=daysBetween(p.start,p.exam), prova=addDays(p.exam,-56), hacim;
  if(D<=56){ prova=p.start; hacim=p.start; }
  else hacim=addDays(p.start, Math.min(56, Math.round((D-56)*0.4)));
  return {hacim:hacim, prova:prova};
}
function phaseOf(ds){
  var pd=planDates();
  if(ds>=pd.prova) return 3;
  if(ds>=pd.hacim) return 2;
  return 1;
}
var _td=null,_tdKey="";
/* tam deneme: Pazar. Puan yoksa ilk Pazar (seviye ölçümü), sonra 4 haftada bir; Prova'da 2 haftada bir; sınava 6 günden yakınsa yok */
function testDays(){
  var p=S.prof, key=p.start+p.exam+(p.cur==null?"n":"y");
  if(_td && _tdKey===key) return _td;
  var out=[], d=addDays(p.start, p.cur==null?2:20), pd=planDates(), last=null;
  while(dowOf(d)!==0) d=addDays(d,1);
  while(daysBetween(d,p.exam)>=6){
    if(!last || daysBetween(last,d)>=(d>=pd.prova?14:28)){ out.push(d); last=d; }
    d=addDays(d,7);
  }
  _td=out; _tdKey=key; return out;
}
function isTestDay(ds){ return testDays().indexOf(ds)>=0; }
