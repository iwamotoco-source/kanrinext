/* =========================================================
   core.js — 共通ユーティリティ・状態管理・GitHub同期
   ※ file:// でも動くよう ES Modules は使わずグローバル関数で構成
   ========================================================= */
'use strict';

/* ---------- 定数 ---------- */
const STATE_KEY='koujiNextStateV1', LOCAL_KEY='koujiNextLocalConfigV1', OLD_TASK_KEY='odakyu_foldernav_tasks_v2', FARE_KEY='odakyu_fare_note_v2', WX_KEY='koujiNextWeatherCache', FIRED_KEY='koujiNextFiredReminders';
const LINE_KEY={'小田原線':'odawara','江ノ島線':'enoshima','多摩線':'tama'};
const LINE_SHORT={'小田原線':'小','江ノ島線':'江','多摩線':'多'};
const LINE_COLOR={'小田原線':'#d9483f','江ノ島線':'#3f9e5f','多摩線':'#c98a24'};
const WD=['日','月','火','水','木','金','土'];

const TOOLS=[
  {id:'law',file:'electrical-assistant.html',name:'電気法令・検査アシスト',desc:'公式条文の検索・改正比較・検査記録・AI相談',icon:'bolt'},
  {id:'compress',file:'file-compressor.html',name:'ファイル圧縮',desc:'画像・動画・PDF・Excelを軽くして、一括ダウンロード',icon:'copy'},
  {id:'pdf',file:'pdf-editor.html',name:'PDF整理・編集',desc:'PDFの統合・並べ替え・回転・画像のPDF化',icon:'pdf'},
  {id:'excel',file:'excel-images.html',name:'Excel画像抽出',desc:'.xlsx内の画像をシート別フォルダに振り分けてZIP化',icon:'img'},
  {id:'scale',file:'drawing-scale.html',name:'アナログ図面計測',desc:'縮尺の狂った図面から実寸を算出',icon:'ruler'},
  {id:'takeoff',file:'quantity-takeoff.html',name:'数量拾い',desc:'図面上に器具をプロットして数量を集計',icon:'count'},
  {id:'knowledge',file:'electrical-knowledge.html',name:'電気技術データベース',desc:'接地・配管・照明・EVなど129テーマの解説と検索',icon:'bolt'},
  {id:'elec',file:'electrical-calc.html',name:'電気お手軽計算',desc:'電圧降下・許容電流・接地・配管サイズなど',icon:'bolt'},
  {id:'fare',file:'odakyu-fare.html',name:'小田急交通費記録',desc:'乗車区間と運賃を記録して月ごとに集計',icon:'ticket'},
  {id:'docs',file:'document-generator.html',name:'現場書類作成',desc:'現場名を差し込み、登録ひな形からExcel書類を一括生成',icon:'copy'}
];
const CATALOGS=[
  {title:'未来工業',url:'https://sun-dbook.meclib.jp/library/books/denzai_mirai_2026/book/#target/page_no=1'},
  {title:'ネグロス電工',url:'https://negurosu.meclib.jp/library/books/den26/book/index.html#target/page_no=511'},
  {title:'カナフジ電工',url:'https://kanafuji.actibookone.com/content/detail?param=eyJjb250ZW50TnVtIjo3MDA1NjksImNhdGVnb3J5TnVtIjo2OTEyNn0=&pNo=16'},
  {title:'河村電器産業',url:'https://www.kawamura.co.jp/ebook/hyojun/van/202503/index.html#page=13'},
  {title:'外山電気',url:'http://sotoyama.co.jp/products/conduit/files/Z3catalog.pdf'}
];
/* インストーラー（kouji://）に登録済みの「●現行案件」フォルダ */
const CURRENT_PROJECTS=[
  {id:'current-01',station:'南林間'},{id:'current-02',station:'経堂'},{id:'current-03',station:'千歳船橋'},{id:'current-04',station:'成城学園前'},
  {id:'current-05',station:'藤沢'},{id:'current-06',station:'本鵠沼'},{id:'current-07',station:'狛江'},{id:'current-08',station:'登戸'},
  {id:'current-09',station:'鶴川'},{id:'current-10',station:'本厚木'},{id:'current-11',station:'渋沢'}
];
/* 駅名のよみ（ひらがな検索用） */
const STATION_KANA={'新宿':'しんじゅく','南新宿':'みなみしんじゅく','参宮橋':'さんぐうばし','代々木八幡':'よよぎはちまん','代々木上原':'よよぎうえはら','東北沢':'ひがしきたざわ','下北沢':'しもきたざわ','世田谷代田':'せたがやだいた','梅ヶ丘':'うめがおか','豪徳寺':'ごうとくじ','経堂':'きょうどう','千歳船橋':'ちとせふなばし','祖師ヶ谷大蔵':'そしがやおおくら','成城学園前':'せいじょうがくえんまえ','喜多見':'きたみ','狛江':'こまえ','和泉多摩川':'いずみたまがわ','登戸':'のぼりと','向ヶ丘遊園':'むこうがおかゆうえん','生田':'いくた','読売ランド前':'よみうりらんどまえ','百合ヶ丘':'ゆりがおか','新百合ヶ丘':'しんゆりがおか','柿生':'かきお','鶴川':'つるかわ','玉川学園前':'たまがわがくえんまえ','町田':'まちだ','相模大野':'さがみおおの','小田急相模原':'おだきゅうさがみはら','相武台前':'そうぶだいまえ','座間':'ざま','海老名':'えびな','厚木':'あつぎ','本厚木':'ほんあつぎ','愛甲石田':'あいこういしだ','伊勢原':'いせはら','鶴巻温泉':'つるまきおんせん','東海大学前':'とうかいだいがくまえ','秦野':'はだの','渋沢':'しぶさわ','新松田':'しんまつだ','開成':'かいせい','栢山':'かやま','富水':'とみず','螢田':'ほたるだ','足柄':'あしがら','小田原':'おだわら','東林間':'ひがしりんかん','中央林間':'ちゅうおうりんかん','南林間':'みなみりんかん','鶴間':'つるま','大和':'やまと','桜ヶ丘':'さくらがおか','高座渋谷':'こうざしぶや','長後':'ちょうご','湘南台':'しょうなんだい','六会日大前':'むつあいにちだいまえ','善行':'ぜんぎょう','藤沢本町':'ふじさわほんまち','藤沢':'ふじさわ','本鵠沼':'ほんくげぬま','鵠沼海岸':'くげぬまかいがん','片瀬江ノ島':'かたせえのしま','五月台':'さつきだい','栗平':'くりひら','黒川':'くろかわ','はるひ野':'はるひの','小田急永山':'おだきゅうながやま','小田急多摩センター':'おだきゅうたませんたー','唐木田':'からきだ'};

const DEFAULT_CATEGORIES=[
  {id:'work',name:'仕事',color:'#3d6fd0',locked:true},{id:'private',name:'プライベート',color:'#8a5cc9',locked:true},{id:'other',name:'その他',color:'#6f7b86',locked:true}
];
const DEFAULT_CAL_SETTINGS={weekStart:0,workDays:[1,2,3,4,5],workStart:'08:30',workEnd:'17:30',defaultReminder:15,showHolidays:true,showTasks:true,defaultDuration:60,weekNumbers:false,hiddenCats:[]};
const DEFAULT_STATE={version:2,updatedAt:Date.now(),tasks:[],events:[],categories:DEFAULT_CATEGORIES,bookmarks:[],
  settings:{theme:'dark',weather:{name:'町田市',lat:35.5486,lon:139.4467},routes:{home:'〒194-0036 東京都町田市木曽東1丁目36-26',office:'〒194-0021 東京都町田市中町3丁目4-3'},calendar:DEFAULT_CAL_SETTINGS}};
const DEFAULT_LOCAL={deviceId:'dev-'+Math.random().toString(36).slice(2)+Date.now().toString(36),leftCollapsed:false,rightCollapsed:false,paneOpen:true,calSide:true,calView:'week',hiddenCats:[],navClosed:{},
  github:{enabled:false,owner:'',repo:'',branch:'main',path:'data/kouji-next.json',token:'',interval:120}};

/* ---------- 汎用 ---------- */
const $=id=>document.getElementById(id);
const $$=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clone=o=>JSON.parse(JSON.stringify(o));
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
function loadJSON(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch(e){return d}}
function saveJSON(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){toast('ブラウザの保存領域に書き込めませんでした')}}
function icon(name,cls='i',style=''){return `<svg class="${cls}"${style?` style="${style}"`:''}><use href="#i-${name}"/></svg>`}
/* 検索用正規化：カタカナ→ひらがな、全角英数→半角、記号除去 */
function norm(s){return String(s||'').normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60)).replace(/駅$/,'').replace(/[\s_\-・ー（）()「」]/g,'')}
function isWindowsDesktop(){return /Windows/i.test(navigator.userAgent)&&!/Mobile|Phone|iPad|Android/i.test(navigator.userAgent)}

/* ---------- 日付 ---------- */
const pad=n=>String(n).padStart(2,'0');
function iso(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
function parseISO(s){const [y,m,d]=String(s).split('-').map(Number);return new Date(y,(m||1)-1,d||1)}
function todayISO(){return iso(new Date())}
function addDays(s,n){const d=parseISO(s);d.setDate(d.getDate()+n);return iso(d)}
function addMonths(s,n){const d=parseISO(s);const day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+n);const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(day,last));return iso(d)}
function dowOf(s){return parseISO(s).getDay()}
function diffDays(a,b){return Math.round((parseISO(b)-parseISO(a))/864e5)}
function toMin(t){if(!t)return null;const [h,m]=t.split(':').map(Number);return h*60+(m||0)}
function fromMin(m){m=Math.max(0,Math.min(24*60,Math.round(m)));return `${pad(Math.floor(m/60))}:${pad(m%60)}`}
function nowMin(){const d=new Date();return d.getHours()*60+d.getMinutes()}
function startOfWeek(s,ws){const d=dowOf(s);return addDays(s,-((d-ws+7)%7))}
function fmtMD(s){const d=parseISO(s);return `${d.getMonth()+1}/${d.getDate()}`}
function fmtMDW(s){const d=parseISO(s);return `${d.getMonth()+1}月${d.getDate()}日（${WD[d.getDay()]}）`}
function fmtYMDW(s){const d=parseISO(s);return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日（${WD[d.getDay()]}）`}
function relDay(s){const n=diffDays(todayISO(),s);return n===0?'今日':n===1?'明日':n===-1?'昨日':n===2?'明後日':''}
function isoWeek(s){const d=parseISO(s);d.setDate(d.getDate()+3-((d.getDay()+6)%7));const w1=new Date(d.getFullYear(),0,4);return 1+Math.round(((d-w1)/864e5-3+((w1.getDay()+6)%7))/7)}

/* ---------- 駅 ---------- */
const STATION_BY_NAME=new Map(STATIONS.map(s=>[s.name,s]));
STATIONS.forEach(s=>{s.kana=STATION_KANA[s.name]||'';s.no=(s.folderId||'').split('-')[1]||'';s.lk=LINE_KEY[s.line]||'odawara';s.current=CURRENT_PROJECTS.find(c=>c.station===s.name)?.id||''});
function findStation(q){if(!q)return null;if(typeof q==='object')return q;const k=norm(q);if(!k)return null;return STATION_BY_NAME.get(String(q).replace(/駅$/,''))||STATIONS.find(s=>norm(s.name)===k||s.kana===k)||STATIONS.find(s=>norm(s.name).startsWith(k)||s.kana.startsWith(k))||STATIONS.find(s=>norm(s.name).includes(k)||s.kana.includes(k))}
function searchStations(q,limit=12){const k=norm(q);if(!k)return [];const sc=s=>{const n=norm(s.name);if(n===k||s.kana===k)return 0;if(n.startsWith(k)||s.kana.startsWith(k))return 1;if(n.includes(k)||s.kana.includes(k))return 2;return 9};return STATIONS.map(s=>[sc(s),s]).filter(x=>x[0]<9).sort((a,b)=>a[0]-b[0]||a[1].name.length-b[1].name.length).slice(0,limit).map(x=>x[1])}
/* 駅チップ（路線色＋フォルダ番号） */
function stChip(name,{button=false,attrs=''}={}){const s=findStation(name);if(!s)return name?`<span class="st"><span>${esc(name)}</span></span>`:'';const tag=button?'button type="button"':'span';return `<${tag} class="st l-${s.lk}${s.current?' cur':''}" title="${esc(s.line)} ${esc(s.name)}駅${s.current?'（現行案件）':''}" ${attrs}><b>${LINE_SHORT[s.line]}${esc(s.no)}</b><span>${esc(s.name)}</span></${button?'button':'span'}>`}
function openLocalFolder(id){if(!id)return;if(!isWindowsDesktop()){toast('フォルダはWindowsパソコンでのみ開けます');return}location.href='kouji://'+id}

/* ---------- トースト ---------- */
function toast(msg,action){const box=$('toasts');const t=document.createElement('div');t.className='toast';t.innerHTML=`<span>${esc(msg)}</span>`;if(action){const b=document.createElement('button');b.textContent=action.label;b.onclick=()=>{action.run();t.remove()};t.appendChild(b)}box.appendChild(t);setTimeout(()=>t.remove(),action?6500:2600)}

/* ---------- ポップオーバー / モーダル ---------- */
let popEl=null,popCleanup=null;
function closePop(){if(popEl){popEl.remove();popEl=null}if(popCleanup){popCleanup();popCleanup=null}}
function openPop(html,anchor,{cls='',onMount,x,y}={}){
  closePop();const el=document.createElement('div');el.className='pop '+cls;el.innerHTML=html;document.body.appendChild(el);popEl=el;
  const r=anchor?anchor.getBoundingClientRect():{left:x,right:x,top:y,bottom:y,width:0,height:0};const w=el.offsetWidth,h=el.offsetHeight,vw=innerWidth,vh=innerHeight;
  let left=r.right+8,top=r.top;if(left+w>vw-8)left=r.left-w-8;if(left<8){left=Math.max(8,Math.min(vw-w-8,r.left));top=r.bottom+6}if(top+h>vh-8)top=Math.max(8,vh-h-8);
  if(vw<=820){left=Math.max(12,(vw-w)/2);top=Math.max(12,Math.min(top,vh-h-80))}
  el.style.left=left+'px';el.style.top=top+'px';
  const onDown=e=>{if(!el.contains(e.target)&&!(anchor&&anchor.contains&&anchor.contains(e.target)))closePop()};const onKey=e=>{if(e.key==='Escape')closePop()};
  setTimeout(()=>{document.addEventListener('pointerdown',onDown,true);document.addEventListener('keydown',onKey)},0);
  popCleanup=()=>{document.removeEventListener('pointerdown',onDown,true);document.removeEventListener('keydown',onKey)};
  onMount&&onMount(el);return el;
}
function menu(items,anchor){const html='<div class="menu">'+items.map((it,i)=>it==='-'?'<hr>':`<button type="button" data-i="${i}">${it.icon?icon(it.icon):''}<span>${esc(it.label)}</span></button>`).join('')+'</div>';openPop(html,anchor,{onMount:el=>$$('[data-i]',el).forEach(b=>b.onclick=()=>{closePop();items[+b.dataset.i].run()})})}
let modalStack=[];
function openModal(html,{wide=false,cls='',onMount,onClose}={}){
  const sc=$('scrim');const box=document.createElement('div');box.className=(cls||'modal')+(wide?' wide':'');box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.innerHTML=html;sc.innerHTML='';sc.appendChild(box);sc.classList.add('on');
  modalStack=[{box,onClose}];sc.onpointerdown=e=>{if(e.target===sc)closeModal()};
  $$('[data-close]',box).forEach(b=>b.onclick=closeModal);onMount&&onMount(box);
  const f=box.querySelector('[autofocus]')||box.querySelector('input,select,textarea,button');setTimeout(()=>f&&f.focus(),20);return box;
}
function closeModal(){const sc=$('scrim');const top=modalStack.pop();sc.classList.remove('on');sc.innerHTML='';top?.onClose&&top.onClose()}
function modalOpen(){return $('scrim').classList.contains('on')}
function confirmBox(msg,{ok='削除',danger=true}={}){return new Promise(res=>{openModal(`<div class="mHead"><h2>確認</h2></div><div class="mBody" style="font-size:14px;line-height:1.7">${esc(msg)}</div><div class="mFoot"><button class="btn" type="button" data-no>キャンセル</button><button class="btn ${danger?'primary':'primary'}" type="button" data-ok ${danger?'style="background:var(--danger);border-color:var(--danger);color:#fff"':''}>${esc(ok)}</button></div>`,{onMount:b=>{b.querySelector('[data-no]').onclick=()=>{res(false);closeModal()};b.querySelector('[data-ok]').onclick=()=>{res(true);closeModal()};setTimeout(()=>b.querySelector('[data-ok]').focus(),30)},onClose:()=>res(false)})})}
function choiceBox(title,msg,choices){return new Promise(res=>{openModal(`<div class="mHead"><h2>${esc(title)}</h2></div><div class="mBody" style="font-size:14px;line-height:1.7">${esc(msg)}</div><div class="mFoot"><button class="btn" type="button" data-c="">キャンセル</button>${choices.map((c,i)=>`<button class="btn ${i===choices.length-1?'primary':''}" type="button" data-c="${esc(c.value)}">${esc(c.label)}</button>`).join('')}</div>`,{onMount:b=>$$('[data-c]',b).forEach(x=>x.onclick=()=>{res(x.dataset.c||null);closeModal()}),onClose:()=>res(null)})})}

/* ---------- 状態 ---------- */
let state, localCfg;
const listeners=new Set();
function onChange(fn){listeners.add(fn)}
function emit(){listeners.forEach(fn=>{try{fn()}catch(e){console.error(e)}})}
function migrateState(s){
  s=s||clone(DEFAULT_STATE);
  if(!Array.isArray(s.categories)||!s.categories.length)s.categories=clone(DEFAULT_CATEGORIES);
  if(!Array.isArray(s.bookmarks))s.bookmarks=[];if(!Array.isArray(s.events))s.events=[];if(!Array.isArray(s.tasks))s.tasks=[];
  s.settings=Object.assign(clone(DEFAULT_STATE.settings),s.settings||{});
  s.settings.calendar=Object.assign(clone(DEFAULT_CAL_SETTINGS),s.settings.calendar||{});if(!Array.isArray(s.settings.calendar.hiddenCats))s.settings.calendar.hiddenCats=[];
  s.settings.weather=s.settings.weather||clone(DEFAULT_STATE.settings.weather);s.settings.routes=s.settings.routes||clone(DEFAULT_STATE.settings.routes);
  /* 予定：旧形式 {date,start,end} を保持したまま拡張フィールドを補完（旧バージョンでも表示できる互換形式） */
  s.events.forEach(e=>{e.id=e.id||uid('e');if(!e.date)e.date=todayISO();if(e.allDay===undefined)e.allDay=!e.start;if(!e.endDate)e.endDate=e.date;if(e.start&&!e.end){e.end=fromMin(Math.min(toMin(e.start)+60,24*60-1))}
    if(e.endDate<e.date)e.endDate=e.date;if(!e.categoryId||!s.categories.some(c=>c.id===e.categoryId))e.categoryId=s.categories[0].id;e.exdates=e.exdates||[];if(e.recur&&!e.recur.freq)e.recur=null});
  s.tasks.forEach(t=>{t.id=t.id||uid('t');if(!t.date&&(t.dueDate||t.due))t.date=t.dueDate||t.due;if(!t.time&&t.dueTime)t.time=t.dueTime;t.priority=t.priority||'normal'});
  s.version=2;return s;
}
function initState(){
  state=migrateState(loadJSON(STATE_KEY,null));
  localCfg=Object.assign(clone(DEFAULT_LOCAL),loadJSON(LOCAL_KEY,{})||{});localCfg.github=Object.assign(clone(DEFAULT_LOCAL.github),localCfg.github||{});
  if(!localCfg.deviceId)localCfg.deviceId=DEFAULT_LOCAL.deviceId;
  /* 種別の表示/非表示は端末ごとではなく同期データへ移した（初回だけ、この端末の旧設定を引き継ぐ） */
  if(!state.settings.calendar.hiddenCatsInit){if(Array.isArray(localCfg.hiddenCats)&&localCfg.hiddenCats.length)state.settings.calendar.hiddenCats=[...localCfg.hiddenCats];state.settings.calendar.hiddenCatsInit=true}
  if(!state.tasks.length){const old=loadJSON(OLD_TASK_KEY,[]);if(Array.isArray(old)&&old.length){state.tasks=old.map(t=>({...t,date:t.dueDate||t.due||'',time:t.dueTime||''}));state.updatedAt=Date.now()}}
  saveJSON(STATE_KEY,state);saveLocal();
}
function saveState(sync=true){saveJSON(STATE_KEY,state);if(sync)scheduleSync()}
function commit(){state.updatedAt=Date.now();saveState(true);emit()}
function saveLocal(){saveJSON(LOCAL_KEY,localCfg)}
function calSettings(){return state.settings.calendar}
function category(id){return state.categories.find(c=>c.id===id)||state.categories[0]}

/* ---------- GitHub 同期（最終更新が新しい方を採用） ---------- */
let syncTimer=null,syncDebounce=null;
function setSyncStatus(type,label){const p=$('syncBtn');if(!p)return;p.className='syncPill '+type;$('syncLabel').textContent=label}
function ghCfgValid(){const g=localCfg.github;return !!(g&&g.enabled&&g.owner&&g.repo&&g.path&&g.token)}
function ghUrl(){const g=localCfg.github;return `https://api.github.com/repos/${encodeURIComponent(g.owner)}/${encodeURIComponent(g.repo)}/contents/${g.path.split('/').map(encodeURIComponent).join('/')}`}
function ghHeaders(){return {Authorization:`Bearer ${localCfg.github.token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}}
async function ghGet(){const g=localCfg.github;const r=await fetch(ghUrl()+`?ref=${encodeURIComponent(g.branch||'main')}`,{headers:ghHeaders(),cache:'no-store'});if(r.status===404)return null;if(!r.ok)throw new Error('GitHub '+r.status);const x=await r.json();const bin=atob((x.content||'').replace(/\n/g,''));const txt=new TextDecoder().decode(Uint8Array.from(bin,c=>c.charCodeAt(0)));return {sha:x.sha,payload:JSON.parse(txt)}}
function b64utf8(txt){const bytes=new TextEncoder().encode(txt);let bin='';for(let i=0;i<bytes.length;i+=0x8000)bin+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(bin)}
async function ghPut(payload,sha){const g=localCfg.github;const body={message:`工事管理next 自動同期 ${new Date().toLocaleString('ja-JP')}`,content:b64utf8(JSON.stringify(payload,null,2)),branch:g.branch||'main'};if(sha)body.sha=sha;const r=await fetch(ghUrl(),{method:'PUT',headers:{...ghHeaders(),'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error('GitHub '+r.status);return r.json()}
function syncPayload(){return {app:'工事管理next',schema:2,updatedAt:state.updatedAt,deviceId:localCfg.deviceId,state,extras:{fare:loadJSON(FARE_KEY,{})}}}
function applyPayload(p){if(!p?.state)return false;state=migrateState(p.state);state.updatedAt=p.updatedAt||state.updatedAt||Date.now();if(p.extras?.fare)saveJSON(FARE_KEY,p.extras.fare);saveState(false);emit();return true}

/* ---------- 同期の合体（3-way merge） ----------
   「前回同期した時点」(base) を覚えておき、両方の端末が変更していたら、1件ずつ（id単位）合体する。
   片方だけが変えた項目はその変更を採用、両方が変えた項目だけ新しい端末の内容を採用、片方が削除して相手が未変更なら削除。 */
const SYNC_BASE_KEY='koujiNextSyncBaseV1';
function getSyncBase(){const b=loadJSON(SYNC_BASE_KEY,null);return b&&b.state&&typeof b.updatedAt==='number'?b:null}
function setSyncBase(payload){try{if(payload&&payload.state)saveJSON(SYNC_BASE_KEY,{updatedAt:payload.updatedAt||0,state:migrateState(clone(payload.state))})}catch(e){}}
const sameJ=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function mergeById(base,loc,rem,key,localNewer){
  const idx=a=>{const m=new Map();(a||[]).forEach(x=>{const k=key(x);if(k!=null&&k!=='')m.set(k,x)});return m};
  const B=idx(base),L=idx(loc),R=idx(rem),out=[],seen=new Set();
  const pick=k=>{
    const b=B.get(k),l=L.get(k),r=R.get(k);
    if(l&&r){if(sameJ(l,r))return l;if(!b)return localNewer?l:r;const lc=!sameJ(l,b),rc=!sameJ(r,b);if(lc&&!rc)return l;if(rc&&!lc)return r;return localNewer?l:r}
    if(l)return !b||!sameJ(l,b)?l:null;      /* 相手が削除：自分が未変更なら削除、変更していれば残す */
    if(r)return !b||!sameJ(r,b)?r:null;      /* 自分が削除：相手が未変更なら削除、変更していれば残す */
    return null;
  };
  [...L.keys(),...R.keys()].forEach(k=>{if(seen.has(k))return;seen.add(k);const v=pick(k);if(v)out.push(v)});
  return out;
}
function merge3(b,l,r,localNewer){
  const isO=x=>x&&typeof x==='object'&&!Array.isArray(x);
  if(isO(l)&&isO(r)){const o={};new Set([...Object.keys(l),...Object.keys(r)]).forEach(k=>{const v=merge3(b&&b[k],l[k],r[k],localNewer);if(v!==undefined)o[k]=v});return o}
  if(sameJ(l,r))return l;
  if(b===undefined)return localNewer?l:r;
  const lc=!sameJ(l,b),rc=!sameJ(r,b);
  if(lc&&!rc)return l;if(rc&&!lc)return r;return localNewer?l:r;
}
function mergeStates(base,local,remote,localNewer){
  const b=base||{},o=Object.assign({},localNewer?remote:local,localNewer?local:remote);
  o.events=mergeById(b.events,local.events,remote.events,x=>x.id,localNewer);
  o.tasks=mergeById(b.tasks,local.tasks,remote.tasks,x=>x.id,localNewer);
  o.categories=mergeById(b.categories,local.categories,remote.categories,x=>x.id,localNewer);
  o.bookmarks=mergeById(b.bookmarks,local.bookmarks,remote.bookmarks,x=>x.url,localNewer);
  o.settings=merge3(b.settings,local.settings,remote.settings,localNewer);
  return migrateState(o);
}
/* 同期の進め方を決める: none / apply(相手を取り込む) / push(自分を送る) / merge(合体して両方へ) */
function planSync(rp){
  rp=rp||{};const ru=rp.updatedAt||0,lu=state.updatedAt||0,base=getSyncBase();
  if(base){
    const lc=lu!==base.updatedAt,rc=ru!==base.updatedAt;
    if(!lc&&!rc)return {act:'none'};
    if(rc&&!lc)return {act:'apply'};
    if(lc&&!rc)return {act:'push'};
    const mu=Math.max(lu,ru)+1,st=mergeStates(base.state,state,migrateState(clone(rp.state)),lu>=ru);
    st.updatedAt=mu;
    return {act:'merge',payload:{app:'工事管理next',schema:2,updatedAt:mu,deviceId:localCfg.deviceId,state:st,extras:lu>=ru?{fare:loadJSON(FARE_KEY,{})}:(rp.extras||{})}};
  }
  return ru>lu?{act:'apply'}:ru<lu?{act:'push'}:{act:'none'};
}
async function syncNow(mode='auto'){
  if(!ghCfgValid()){setSyncStatus('','ローカル保存');if(mode!=='auto')toast('設定 → 同期 でGitHubの接続先を登録してください');return}
  setSyncStatus('busy','同期中');
  try{const remote=await ghGet(),local=syncPayload();
    if(mode==='pull'){if(remote){applyPayload(remote.payload);setSyncBase(remote.payload)}else toast('GitHubに同期データがまだありません')}
    else if(mode==='push'){await ghPut(local,remote?.sha||null);setSyncBase(local)}
    else if(!remote){await ghPut(local,null);setSyncBase(local)}
    else{const pl=planSync(remote.payload);
      if(pl.act==='apply'){applyPayload(remote.payload);setSyncBase(remote.payload)}
      else if(pl.act==='push'){await ghPut(local,remote.sha);setSyncBase(local)}
      else if(pl.act==='merge'){await ghPut(pl.payload,remote.sha);applyPayload(pl.payload);setSyncBase(pl.payload)}
      else if(!getSyncBase())setSyncBase(local)}
    setSyncStatus('ok','同期済み');if(mode!=='auto')toast('GitHubと同期しました');
  }catch(e){console.error(e);setSyncStatus('err','同期エラー');if(mode!=='auto')toast('GitHub同期に失敗しました（'+e.message+'）。トークンと権限を確認してください')}
}
function scheduleSync(){clearTimeout(syncDebounce);if(ghCfgValid())syncDebounce=setTimeout(()=>syncNow('auto'),2500)}
function setupAutoSync(){clearInterval(syncTimer);if(ghCfgValid()){syncTimer=setInterval(()=>syncNow('auto'),Math.max(60,localCfg.github.interval||120)*1000);setTimeout(()=>syncNow('auto'),700)}else setSyncStatus('','ローカル保存')}

/* ---------- ファイル保存 ---------- */
function downloadText(name,text,type='text/plain'){const b=new Blob([text],{type:type+';charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
