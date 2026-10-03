/* =========================================================
   app.js — 画面構成（ナビ・ルーティング・ホーム・地図・タスク・検索・設定）
   ========================================================= */
'use strict';

/* ---------- テーマ・レイアウト ---------- */
function resolvedTheme(){const t=state.settings.theme||'dark';return t==='auto'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t}
function applyTheme(){const t=resolvedTheme();document.documentElement.dataset.theme=t;document.querySelector('meta[name=theme-color]').content=t==='light'?'#eceeeb':'#16181b';const f=$('toolFrame');if(f&&f.src){try{f.contentWindow.postMessage({type:'kouji-theme',theme:t},'*')}catch(e){}}if(railMap)setBaseLayer()}
function paneKey(){return currentRoute()==='calendar'?'paneOpenCal':'paneOpen'}
function applyLayout(){document.body.classList.toggle('railCollapsed',!!localCfg.leftCollapsed);const k=paneKey();const open=k==='paneOpenCal'?localCfg.paneOpenCal===true:localCfg.paneOpen!==false;document.body.classList.toggle('paneClosed',!open)}
function isMobile(){return innerWidth<=820}
function closeDrawers(){document.body.classList.remove('railOpenM','paneOpenM','calSideOpenM')}

/* ---------- ナビ ---------- */
function renderNav(){
  $('toolNav').innerHTML=TOOLS.map(t=>`<a class="nav" href="#tool/${t.id}" data-route="tool/${t.id}" title="${esc(t.desc)}">${icon(t.icon)}<span class="lbl">${esc(t.name)}</span></a>`).join('');
  $('catalogNav').innerHTML=CATALOGS.map(c=>`<a class="nav" href="${esc(c.url)}" target="_blank" rel="noopener">${icon('book')}<span class="lbl">${esc(c.title)}</span>${icon('ext','i ext')}</a>`).join('');
  $('bookmarkNav').innerHTML=(state.bookmarks||[]).map(b=>`<a class="nav" href="${esc(b.url)}" target="_blank" rel="noopener">${icon('link')}<span class="lbl">${esc(b.title||b.url)}</span>${icon('ext','i ext')}</a>`).join('')||`<button class="nav" type="button" data-addbm><span class="lbl" style="color:var(--ink-3)">＋ 設定から追加</span></button>`;
  $('bookmarkNav').querySelector('[data-addbm]')?.addEventListener('click',()=>openSettings('bookmarks'));
  $$('.navGroup[data-group]').forEach(g=>{g.classList.toggle('closed',!!localCfg.navClosed?.[g.dataset.group]);g.querySelector('.navHead').onclick=()=>{localCfg.navClosed=localCfg.navClosed||{};localCfg.navClosed[g.dataset.group]=!localCfg.navClosed[g.dataset.group];saveLocal();g.classList.toggle('closed')}});
  markNav();
}
function markNav(){const r=currentRoute();$$('[data-route]').forEach(a=>{if(a.dataset.route===r)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')})}

/* ---------- ルーティング（#home / #calendar / #map / #tool/<id>） ---------- */
function currentRoute(){const h=location.hash.replace(/^#/,'');return h||'home'}
function routeTo(r){if(location.hash!=='#'+r)location.hash='#'+r;else handleRoute()}
function handleRoute(){
  let r=currentRoute();const [name,arg]=r.split('/');
  const views={home:'view-home',calendar:'view-calendar',map:'view-map',tool:'view-tool'};if(!views[name]){r='home'}
  $$('.view').forEach(v=>v.classList.toggle('on',v.id===views[name]||(!views[name]&&v.id==='view-home')));
  let title='ホーム';
  if(name==='calendar'){title='カレンダー';renderCalendar()}
  if(name==='map'){title='小田急マップ';mountMap('mapViewSlot')}
  if(name==='home'||!views[name]){mountMap('homeMapSlot');renderHome()}
  if(name==='tool'){const t=TOOLS.find(x=>x.id===arg)||TOOLS[0];title=t.name;$('toolDesc').textContent=t.desc;const src=`./tools/${t.file}?embed=1&theme=${resolvedTheme()}`;const f=$('toolFrame');if(f.dataset.tool!==t.id){f.src=src;f.dataset.tool=t.id}$('toolOpenTab').href=`./tools/${t.file}`}
  $('viewTitle').textContent=title;document.title=(title==='ホーム'?'':title+' — ')+'工事管理next';
  markNav();closeDrawers();closePop();
  const wasClosed=document.body.classList.contains('paneClosed');applyLayout();if(wasClosed!==document.body.classList.contains('paneClosed')){setTimeout(()=>{railMap?.invalidateSize(false);if(name==='calendar')renderCalendar()},20)}
}

/* ---------- ホーム ---------- */
function renderHome(){
  const t=todayISO(),d=parseISO(t),h=holidayName(t);
  $('homeDate').innerHTML=`${d.getMonth()+1}月${d.getDate()}日 ${WD[d.getDay()]}曜日<small>${d.getFullYear()}年${h?'・'+esc(h):''}・第${isoWeek(t)}週</small>`;
  renderHomeAgenda();renderCurrent();
}
function renderHomeAgenda(){
  const t=todayISO(),to=addDays(t,6);const cats=visibleCats();const occ=occurrencesBetween(t,to,{cats}).map(o=>Object.assign(o,{kind:'event',color:category(o.categoryId).color}));
  const tasks=state.tasks.filter(x=>!x.done&&x.date&&x.date>=t&&x.date<=to).map(x=>({kind:'task',key:'task:'+x.id,id:x.id,title:x.title,date:x.date,endDate:x.date,start:x.time||'',allDay:!x.time,color:'#7b8590',station:x.stationName||'',task:x}));
  const days=Array.from({length:7},(_,i)=>addDays(t,i));let html='';let total=0;
  days.forEach(day=>{const items=[...occ.filter(o=>o.date<=day&&(o.endDate||o.date)>=day),...tasks.filter(x=>x.date===day)].sort((a,b)=>(b.allDay-a.allDay)||(toMin(a.start)||0)-(toMin(b.start)||0));
    if(!items.length&&day!==t)return;total+=items.length;const h=holidayName(day);const rel=relDay(day);
    html+=`<div class="agDay"><b>${rel||fmtMD(day)}</b><span>${rel?fmtMD(day)+' ':''}${WD[dowOf(day)]}曜</span>${h?`<span class="hol">${esc(h)}</span>`:''}</div>`;
    if(!items.length)html+=`<div class="empty" style="padding:6px 14px 10px">今日の予定はありません。</div>`;
    items.forEach(i=>{const multi=i.date!==(i.endDate||i.date);const tm=i.kind==='task'?(i.start||'期日'):i.allDay?'終日':multi&&i.date!==day?'〜'+(i.endDate===day?i.end:''):i.start;const sub=i.kind==='task'?'タスク':(!i.allDay&&!multi?i.end+'まで':'');
      html+=`<div class="agItem ${i.kind==='task'?'task':''} ${isPastItem(i)?'past':''}" style="--c:${i.color}" data-key="${esc(i.key)}"><div class="agTime num">${esc(tm)}${sub?`<small>${esc(sub)}</small>`:''}</div><div class="agBar"></div><div><div class="agTitle">${esc(i.title)}</div>${i.station||i.location?`<div class="agSub">${i.station?stChip(i.station,{button:true,attrs:`data-st="${esc(i.station)}"`}):''}${i.location?`<span>${esc(i.location)}</span>`:''}</div>`:''}</div></div>`})});
  $('homeAgenda').innerHTML=html;$('homeAgendaSub').textContent=total?`今日から7日間・${total}件`:'今日から7日間';
  $$('#homeAgenda .agItem').forEach(el=>el.onclick=e=>{const st=e.target.closest('[data-st]');if(st){e.stopPropagation();focusStation(st.dataset.st,true);return}const key=el.dataset.key;cal.items.set(key,findItemByKey(key));openPeek(key,el)});
}
function renderCurrent(){
  $('curList').innerHTML=CURRENT_PROJECTS.map(c=>{const s=findStation(c.station);return `<span style="display:inline-flex;gap:2px;align-items:center">${stChip(c.station,{button:true,attrs:`data-cur="${esc(c.station)}"`})}<button class="btn ghost icon sm" type="button" data-curf="${c.id}" title="${esc(c.station)}駅の案件フォルダを開く" style="width:24px;height:24px">${icon('folder','i','width:14px;height:14px')}</button></span>`}).join('');
  $$('[data-cur]').forEach(b=>b.onclick=()=>focusStation(b.dataset.cur,true));$$('[data-curf]').forEach(b=>b.onclick=()=>openLocalFolder(b.dataset.curf));
}

/* ---------- 天気 ---------- */
let weatherCache=null,wxView='hours';
function wxIcon(code){
  const cloud='<path d="M14 33h21a8 8 0 0 0 0-16 12.5 12.5 0 0 0-23.5-3A9.5 9.5 0 0 0 14 33Z"/>';let b;
  if(code===0)b='<circle cx="24" cy="24" r="8"/>'+[0,45,90,135,180,225,270,315].map(a=>`<line x1="24" y1="5" x2="24" y2="10" transform="rotate(${a} 24 24)"/>`).join('');
  else if([1,2].includes(code))b='<circle cx="17" cy="17" r="6"/><path d="M17 5v3M5 17h3M8.5 8.5l2 2"/>'+'<path d="M20 38h16a6.5 6.5 0 0 0 0-13 10 10 0 0 0-18.6-2A7.5 7.5 0 0 0 20 38Z"/>';
  else if([3,45,48].includes(code))b=cloud;
  else if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code))b='<path d="M14 29h21a8 8 0 0 0 0-16 12.5 12.5 0 0 0-23.5-3A9.5 9.5 0 0 0 14 29Z"/><path d="M17 35l-2.5 6M25 35l-2.5 6M33 35l-2.5 6"/>';
  else if([71,73,75,77,85,86].includes(code))b='<path d="M14 28h21a8 8 0 0 0 0-16 12.5 12.5 0 0 0-23.5-3A9.5 9.5 0 0 0 14 28Z"/><circle cx="17" cy="37" r="1.6"/><circle cx="25" cy="39" r="1.6"/><circle cx="33" cy="37" r="1.6"/>';
  else b='<path d="M14 28h21a8 8 0 0 0 0-16 12.5 12.5 0 0 0-23.5-3A9.5 9.5 0 0 0 14 28Z"/><path d="M25 30l-5 8h6l-3 7"/>';
  return `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${b}</svg>`;
}
function wxText(c){if(c===0)return'快晴';if([1,2].includes(c))return'晴れ';if([3].includes(c))return'曇り';if([45,48].includes(c))return'霧';if([51,53,55,56,57].includes(c))return'霧雨';if([61,63,65,66,67,80,81,82].includes(c))return c>=65&&c<80||c===82?'強い雨':'雨';if([71,73,75,77,85,86].includes(c))return'雪';if([95,96,99].includes(c))return'雷雨';return'—'}
async function loadWeather(){
  const w=state.settings.weather||DEFAULT_STATE.settings.weather;
  try{const url=`https://api.open-meteo.com/v1/forecast?latitude=${w.lat}&longitude=${w.lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTokyo&forecast_days=7`;
    const r=await fetch(url);if(!r.ok)throw 0;weatherCache=await r.json();saveJSON(WX_KEY,{at:Date.now(),data:weatherCache});renderWeather()}
  catch(e){const c=loadJSON(WX_KEY,null);if(c?.data){weatherCache=c.data;renderWeather(new Date(c.at))}else{$('wxText').textContent=`${w.name}：天気を取得できません（オフライン）`;$('wxCells').innerHTML=''}}
}
function renderWeather(stale){
  const d=weatherCache;if(!d?.current)return;const w=state.settings.weather;const c=d.current;
  $('wxIcon').innerHTML=wxIcon(c.weather_code);$('wxTemp').textContent=Math.round(c.temperature_2m)+'℃';
  $('wxText').textContent=`${w.name} ${wxText(c.weather_code)}・体感${Math.round(c.apparent_temperature)}℃・風${Math.round(c.wind_speed_10m/3.6)}m/s${stale?`（${stale.getHours()}:${pad(stale.getMinutes())}時点）`:''}`;
  let html='';
  if(wxView==='hours'){const now=Date.now();const st=d.hourly.time.findIndex(t=>new Date(t).getTime()>=now-30*60000);for(let k=0,i=Math.max(0,st);i<d.hourly.time.length&&k<7;i+=2,k++){const t=new Date(d.hourly.time[i]);html+=`<div class="wxCell"><div class="t num">${t.getHours()}時</div>${wxIcon(d.hourly.weather_code[i])}<div class="v num">${Math.round(d.hourly.temperature_2m[i])}°</div><div class="p num">${d.hourly.precipitation_probability[i]??0}%</div></div>`}}
  else d.daily.time.forEach((x,i)=>{const dw=dowOf(x);html+=`<div class="wxCell ${dw===0||holidayName(x)?'sun':dw===6?'sat':''}"><div class="t">${i===0?'今日':fmtMD(x)+' '+WD[dw]}</div>${wxIcon(d.daily.weather_code[i])}<div class="v num">${Math.round(d.daily.temperature_2m_max[i])}°/${Math.round(d.daily.temperature_2m_min[i])}°</div><div class="p num">${d.daily.precipitation_probability_max[i]??0}%</div></div>`});
  $('wxCells').innerHTML=html;
}

/* ---------- 地図 ---------- */
let railMap=null,baseLayer=null,mapWrap=null;const markerByName=new Map();const lineLayers={};const lineOn={'小田原線':true,'江ノ島線':true,'多摩線':true};let mapBase='photo';
function setBaseLayer(){if(!railMap)return;if(baseLayer)railMap.removeLayer(baseLayer);const url=mapBase==='photo'?'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}':'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';baseLayer=L.tileLayer(url,{maxZoom:19,attribution:'Tiles © Esri'}).addTo(railMap);baseLayer.bringToBack()}
function buildMap(){
  mapWrap=document.createElement('div');mapWrap.style.cssText='position:absolute;inset:0';
  mapWrap.innerHTML=`<div id="map"></div>
   <div class="mapCtl tl"><div class="mapCard"><label class="mapSearch">${icon('search','i','width:16px;height:16px;color:var(--ink-3)')}<input id="stationSearch" placeholder="駅名で探す（ひらがな可）" autocomplete="off"><button class="btn ghost icon sm hidden" type="button" id="stationClear" aria-label="クリア">${icon('x')}</button></label><div class="mapResults hidden" id="stationResults"></div><div class="lineToggles">${Object.keys(lineOn).map(l=>`<button type="button" data-line="${l}" aria-pressed="true" style="--lc:${LINE_COLOR[l]}"><i></i>${l.replace('線','')}</button>`).join('')}</div><div class="mapLegend"><span class="ring"></span>現行案件　駅をクリックでフォルダ・ルート</div></div></div>
   <div class="mapCtl tr"><div class="seg mapCard" style="box-shadow:var(--shadow-pop)"><button type="button" data-base="photo" aria-pressed="true">航空写真</button><button type="button" data-base="street" aria-pressed="false">地図</button></div><button class="btn mapCard icon" type="button" id="mapFit" title="全路線を表示">${icon('target')}</button></div>`;
  if(!window.L){mapWrap.querySelector('#map').innerHTML='<div class="mapFallback">地図ライブラリを読み込めませんでした。<br>assets/vendor/leaflet フォルダがあるか確認してください。</div>';return}
  const el=mapWrap.querySelector('#map');document.body.appendChild(mapWrap);mapWrap.style.visibility='hidden';
  railMap=L.map(el,{zoomControl:true,preferCanvas:true,attributionControl:true}).setView([35.5,139.43],10);railMap.zoomControl.setPosition('bottomright');setBaseLayer();
  MAP_SECTIONS.forEach(sec=>{(lineLayers[sec.line]=lineLayers[sec.line]||L.layerGroup().addTo(railMap));L.polyline(sec.coords,{color:LINE_COLOR[sec.line]||'#fff',weight:4,opacity:.95,lineCap:'round'}).addTo(lineLayers[sec.line])});
  STATIONS.forEach(s=>{const g=lineLayers[s.line];
    if(s.current)L.circleMarker([s.lat,s.lon],{radius:9,color:'#ffd34d',weight:2,fill:false,dashArray:'3 3',interactive:false}).addTo(g);
    const m=L.circleMarker([s.lat,s.lon],{radius:s.major?5:4,color:'#fff',weight:1.6,fillColor:LINE_COLOR[s.line],fillOpacity:1}).addTo(g);
    m.bindTooltip(s.name,{permanent:true,direction:(s.dx||0)<0?'left':'right',offset:[(s.dx||0)<0?-6:6,s.dy||0],className:'stLabel'+(s.major?'':' minor')});
    m.on('click',()=>openStationPopup(s));markerByName.set(s.name,{s,m})});
  const zcls=()=>el.classList.toggle('zLow',railMap.getZoom()<12);railMap.on('zoomend',zcls);
  fitMap();zcls();
  /* 操作 */
  const inp=mapWrap.querySelector('#stationSearch'),res=mapWrap.querySelector('#stationResults');let sel=0,list=[];
  const draw=()=>{res.classList.toggle('hidden',!list.length);res.innerHTML=list.map((s,i)=>`<button type="button" class="${i===sel?'sel':''}" data-i="${i}">${stChip(s.name)}<span style="margin-left:auto;font-size:11.5px;color:var(--ink-3)">${esc(s.kana)}</span></button>`).join('');$$('[data-i]',res).forEach(b=>b.onclick=()=>{pick(list[+b.dataset.i])})};
  const pick=s=>{list=[];draw();inp.value=s.name;focusStation(s.name,true)};
  inp.oninput=()=>{list=searchStations(inp.value,8);sel=0;draw();mapWrap.querySelector('#stationClear').classList.toggle('hidden',!inp.value)};
  inp.onkeydown=e=>{if(e.key==='ArrowDown'){sel=Math.min(list.length-1,sel+1);draw();e.preventDefault()}if(e.key==='ArrowUp'){sel=Math.max(0,sel-1);draw();e.preventDefault()}if(e.key==='Enter'&&list[sel])pick(list[sel]);if(e.key==='Escape'){inp.value='';list=[];draw()}};
  mapWrap.querySelector('#stationClear').onclick=()=>{inp.value='';list=[];draw();mapWrap.querySelector('#stationClear').classList.add('hidden')};
  $$('[data-line]',mapWrap).forEach(b=>b.onclick=()=>{const l=b.dataset.line;lineOn[l]=!lineOn[l];b.setAttribute('aria-pressed',String(lineOn[l]));lineOn[l]?lineLayers[l].addTo(railMap):railMap.removeLayer(lineLayers[l])});
  $$('[data-base]',mapWrap).forEach(b=>b.onclick=()=>{mapBase=b.dataset.base;$$('[data-base]',mapWrap).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));setBaseLayer()});
  mapWrap.querySelector('#mapFit').onclick=fitMap;
  L.DomEvent.disableClickPropagation(mapWrap.querySelector('.mapCtl.tl'));L.DomEvent.disableScrollPropagation(mapWrap.querySelector('.mapCtl.tl'));
}
function mountMap(slotId){if(!mapWrap)buildMap();const slot=$(slotId);if(!slot||!mapWrap)return;if(mapWrap.parentElement!==slot){slot.appendChild(mapWrap);mapWrap.style.visibility=''}mapWrap.querySelector('.mapCtl.tl').style.width=slotId==='homeMapSlot'?'min(250px,calc(100% - 20px))':'';setTimeout(()=>railMap?.invalidateSize(false),30)}
function fitMap(){railMap?.fitBounds(L.latLngBounds(STATIONS.map(s=>[s.lat,s.lon])),{padding:[24,24]})}
function focusStation(name,open=true){const s=findStation(name);if(!s||!railMap)return false;const r=currentRoute();if(r!=='home'&&r!=='map'){routeTo('map')}setTimeout(()=>{railMap.invalidateSize(false);railMap.flyTo([s.lat,s.lon],15,{duration:.6});if(open)setTimeout(()=>openStationPopup(s),650)},40);return true}
function showStationOnMap(name){if(currentRoute()!=='home'&&currentRoute()!=='map')routeTo('map');focusStation(name,true)}
function routeFrom(kind,s){const addr=state.settings.routes?.[kind];if(!addr){toast(`${kind==='home'?'自宅':'事務所'}の住所を設定してください`);openSettings('general');return}window.open('https://www.google.com/maps/dir/?api=1&travelmode=transit&origin='+encodeURIComponent(addr)+'&destination='+encodeURIComponent(s.name+'駅'),'_blank','noopener')}
function openStationPopup(s){
  const item=markerByName.get(s.name);if(!item)return;const win=isWindowsDesktop();
  const evs=occurrencesBetween(todayISO(),addDays(todayISO(),90)).filter(o=>o.station===s.name).slice(0,4);
  const tks=state.tasks.filter(t=>!t.done&&t.stationName===s.name).slice(0,3);
  const html=`<div class="stPop"><h4>${stChip(s.name)}<span>${esc(s.name)}駅</span></h4><div class="sub">${esc(s.line)}・フォルダ番号 ${esc(s.no)}${s.current?'・<b style="color:var(--warn)">現行案件</b>':''}</div>
   <div class="acts">${s.current?`<button class="btn primary wide" type="button" data-sa="cur" ${win?'':'disabled'}>${icon('folder')}現行案件フォルダを開く</button>`:''}
   <button class="btn ${s.current?'':'primary'} wide" type="button" data-sa="folder" ${win?'':'disabled'}>${icon('folder')}${win?'駅フォルダを開く':'フォルダはWindowsでのみ開けます'}</button>
   <button class="btn" type="button" data-sa="home">${icon('train')}自宅から</button><button class="btn" type="button" data-sa="office">${icon('train')}事務所から</button>
   <button class="btn" type="button" data-sa="ev">${icon('cal')}予定を追加</button><button class="btn" type="button" data-sa="task">${icon('check')}タスク追加</button></div>
   ${evs.length||tks.length?`<div class="evs">${evs.map(o=>`<div data-sk="${esc(o.key)}"><span class="num">${fmtMD(o.date)} ${o.allDay?'終日':o.start}</span>${esc(o.title)}</div>`).join('')}${tks.map(t=>`<div data-st="${t.id}"><span>タスク</span>${esc(t.title)}</div>`).join('')}</div>`:''}</div>`;
  item.m.unbindPopup();item.m.bindPopup(html,{maxWidth:300,autoPanPadding:[20,20]}).openPopup();
  const el=item.m.getPopup().getElement();if(!el)return;
  $$('[data-sa]',el).forEach(b=>b.onclick=()=>{const a=b.dataset.sa;if(a==='folder')openLocalFolder(s.folderId);if(a==='cur')openLocalFolder(s.current);if(a==='home'||a==='office')routeFrom(a,s);
    if(a==='ev'){railMap.closePopup();const d=newEventDefaults(todayISO());openEventEditor({event:newEventFrom(Object.assign(d,{station:s.name,title:''})),isNew:true})}
    if(a==='task'){railMap.closePopup();openTaskEditor(null,{stationName:s.name})}});
  $$('[data-sk]',el).forEach(x=>x.onclick=()=>{const it=findItemByKey(x.dataset.sk);if(it){cal.items.set(it.key,it);openPeek(it.key,x)}});
  $$('[data-st]',el).forEach(x=>x.onclick=()=>openTaskEditor(x.dataset.st));
}

/* ---------- タスク ---------- */
let taskFilter='open';
function taskDate(t){return t.date||t.dueDate||t.due||''}
function renderTasks(){
  const q=norm($('taskSearch').value),today=todayISO();let arr=state.tasks.filter(t=>!q||norm(t.title+' '+(t.stationName||'')+' '+(t.note||'')).includes(q)||(findStation(t.stationName)?.kana||'').includes(q));
  const open=state.tasks.filter(t=>!t.done).length;$('taskSummary').textContent=`未完了 ${open}`;$('navTaskCount').textContent=open||'';
  if(taskFilter==='open')arr=arr.filter(t=>!t.done);if(taskFilter==='done')arr=arr.filter(t=>t.done);if(taskFilter==='today')arr=arr.filter(t=>!t.done&&taskDate(t)&&taskDate(t)<=today);if(taskFilter==='station')arr=arr.filter(t=>!t.done&&t.stationName);
  const pri={high:0,mid:1,normal:2};arr.sort((a,b)=>(taskDate(a)||'9999').localeCompare(taskDate(b)||'9999')||(a.time||'99').localeCompare(b.time||'99')||pri[a.priority||'normal']-pri[b.priority||'normal']);
  if(taskFilter==='done')arr.sort((a,b)=>(b.doneAt||0)-(a.doneAt||0));
  const groups=taskFilter==='done'?[['完了',arr]]:[['期限切れ',arr.filter(t=>taskDate(t)&&taskDate(t)<today),'over'],['今日',arr.filter(t=>taskDate(t)===today)],['明日以降',arr.filter(t=>taskDate(t)>today)],['期日なし',arr.filter(t=>!taskDate(t))]];
  const html=groups.filter(g=>g[1].length).map(([n,list,cls])=>`<div class="tGroup ${cls||''}"><span>${n}</span><span class="num">${list.length}</span></div>`+list.map(taskRow).join('')).join('');
  $('taskList').innerHTML=html||`<div class="empty">${q?'条件に合うタスクはありません。':taskFilter==='done'?'完了したタスクはまだありません。':'タスクはありません。<br>上の欄に入力してEnterで追加できます。<br><span class="hint">例：「経堂 盤の結線確認 明日 10:00」と入力すると、駅・期日・時刻を読み取ります。</span>'}</div>`;
  $$('#taskList [data-tc]').forEach(b=>b.onclick=()=>toggleTaskDone(b.dataset.tc));
  $$('#taskList [data-te]').forEach(b=>b.onclick=e=>{if(e.target.closest('[data-tst]'))return;openTaskEditor(b.dataset.te)});
  $$('#taskList [data-tst]').forEach(b=>b.onclick=e=>{e.stopPropagation();const t=state.tasks.find(x=>x.id===b.dataset.tst);if(!t)return;const s=findStation(t.stationName);if(isWindowsDesktop()&&s){openLocalFolder(s.current||s.folderId)}else{showStationOnMap(t.stationName);if(isMobile())closeDrawers()}});
}
function taskRow(t){const d=taskDate(t),today=todayISO();const over=d&&d<today&&!t.done;const s=findStation(t.stationName);
  return `<div class="tRow ${t.done?'done':''}"><button class="tCheck" type="button" data-tc="${t.id}" aria-label="${t.done?'未完了に戻す':'完了にする'}">${icon('tick')}</button><div class="tBody" data-te="${t.id}"><div class="tTitle">${esc(t.title)}</div><div class="tMeta">${s?stChip(s.name,{button:true,attrs:`data-tst="${t.id}" title="${isWindowsDesktop()?'駅フォルダを開く':'地図で表示'}"`}):''}${d?`<span class="due num ${over?'over':''}">${relDay(d)||fmtMD(d)}${t.time?' '+t.time:''}</span>`:''}${t.note?`<span title="${esc(t.note)}">${icon('list','i','width:13px;height:13px;vertical-align:-2px')}</span>`:''}</div></div>${t.priority&&t.priority!=='normal'?`<span class="tPri ${t.priority}" title="優先度：${t.priority==='high'?'高':'やや高'}"></span>`:'<span></span>'}</div>`}
function toggleTaskDone(id){const t=state.tasks.find(x=>String(x.id)===String(id));if(!t)return;t.done=!t.done;t.doneAt=t.done?Date.now():null;commit();if(t.done)toast(`「${t.title}」を完了にしました`,{label:'元に戻す',run:()=>{t.done=false;t.doneAt=null;commit()}})}
function deleteTask(id){const undo=snapshot();const t=state.tasks.find(x=>x.id===id);state.tasks=state.tasks.filter(x=>x.id!==id);commit();toast(`「${t?.title||'タスク'}」を削除しました`,{label:'元に戻す',run:undo})}
/* 簡易入力の解析：「経堂 盤の結線確認 明日 10:00」→ 駅・期日・時刻 */
function parseQuickTask(text){
  let title=text.trim(),date='',time='',station='';const today=todayISO();
  const rel={'今日':0,'きょう':0,'明日':1,'あした':1,'明後日':2,'あさって':2};
  for(const [k,v] of Object.entries(rel)){const re=new RegExp('(^|\\s)'+k+'(?=\\s|$)');if(re.test(title)){date=addDays(today,v);title=title.replace(re,' ');break}}
  const md=title.match(/(^|\s)(\d{1,2})[\/月](\d{1,2})日?(?=\s|$)/);if(md){const y=parseISO(today).getFullYear();let d=`${y}-${pad(+md[2])}-${pad(+md[3])}`;if(d<addDays(today,-60))d=`${y+1}-${pad(+md[2])}-${pad(+md[3])}`;date=d;title=title.replace(md[0],' ')}
  const wd=title.match(/(^|\s)(来週)?([日月火水木金土])曜(日)?(?=\s|$)/);if(wd&&!date){const target=WD.indexOf(wd[3]);let n=(target-dowOf(today)+7)%7||7;if(wd[2])n+=7;date=addDays(today,n);title=title.replace(wd[0],' ')}
  const tm=title.match(/(^|\s)(\d{1,2})[:：時](\d{2})?分?(?=\s|$)/);if(tm&&+tm[2]<24){time=`${pad(+tm[2])}:${pad(+(tm[3]||0))}`;title=title.replace(tm[0],' ');if(!date)date=today}
  const tokens=title.split(/\s+/).filter(Boolean);for(const tk of tokens){const k=tk.replace(/駅$/,'');const s=STATION_BY_NAME.get(k)||STATIONS.find(x=>x.kana===k);if(s){station=s.name;title=tokens.filter(x=>x!==tk).join(' ');break}}
  return {title:title.replace(/\s+/g,' ').trim()||text.trim(),date,time,station};
}
function openTaskEditor(id,defaults={}){
  const t=id?state.tasks.find(x=>String(x.id)===String(id)):null;const v=Object.assign({title:'',stationName:'',priority:'normal',date:'',time:'',note:'',done:false},defaults,t||{});
  openModal(`<div class="mHead"><h2>${t?'タスクの編集':'タスクを追加'}</h2><button class="btn ghost icon" type="button" data-close aria-label="閉じる">${icon('x')}</button></div>
  <form class="mBody" id="tkForm" autocomplete="off"><div class="field"><input class="titleInput" name="title" value="${esc(v.title)}" placeholder="タスク名" autofocus></div>
  <div class="grid2" style="margin-top:14px"><div class="field"><label>駅ラベル（クリックで駅フォルダ）</label><input name="station" list="stationList" value="${esc(v.stationName||'')}" placeholder="駅名（ひらがな可）"><div id="tkSt" style="min-height:22px"></div></div>
  <div class="field"><label>優先度</label><select name="priority"><option value="normal">通常</option><option value="mid">やや高</option><option value="high">高</option></select></div>
  <div class="field"><label>期日</label><input type="date" name="date" value="${esc(taskDate(v))}"></div><div class="field"><label>時刻（任意）</label><input type="time" name="time" step="300" value="${esc(v.time||'')}"></div></div>
  <div class="field" style="margin-top:6px"><label>メモ</label><textarea name="note">${esc(v.note||'')}</textarea></div>
  ${t?`<label class="check" style="margin-top:8px"><input type="checkbox" name="done" ${v.done?'checked':''}>完了</label>`:''}
  <p class="hint" style="margin:10px 0 0">期日のあるタスクはカレンダーにも表示されます。</p></form>
  <div class="mFoot">${t?`<button class="btn ghost danger" type="button" data-del>${icon('trash')}削除</button>`:''}<span class="grow"></span><button class="btn" type="button" data-close>キャンセル</button><button class="btn primary" type="button" data-save>保存</button></div>`,{onMount:box=>{
    ensureStationDatalist();const f=box.querySelector('#tkForm');f.priority.value=v.priority||'normal';
    const sync=()=>{const s=findStation(f.station.value);$('tkSt').innerHTML=f.station.value?(s?stChip(s.name):'<span class="hint">一致する駅がありません</span>'):''};f.station.oninput=sync;sync();
    const save=()=>{const title=f.title.value.trim();if(!title){f.title.focus();toast('タスク名を入力してください');return}const s=findStation(f.station.value);
      const obj={title,stationName:s?s.name:'',stationId:s?s.folderId:'',priority:f.priority.value,date:f.date.value,time:f.date.value?f.time.value:'',note:f.note.value.trim()};
      if(t){Object.assign(t,obj);if(f.done){const d=f.done.checked;if(d!==!!t.done){t.done=d;t.doneAt=d?Date.now():null}}}else state.tasks.push(Object.assign({id:uid('t'),done:false,created:Date.now()},obj));
      commit();closeModal();toast(t?'タスクを保存しました':`「${title}」を追加しました`)};
    box.querySelector('[data-save]').onclick=save;f.onsubmit=e=>{e.preventDefault();save()};box.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey||e.target.name==='title')){e.preventDefault();save()}});
    box.querySelector('[data-del]')?.addEventListener('click',()=>{closeModal();deleteTask(t.id)});
  }});
}
function togglePane(force){if(innerWidth<=1180){document.body.classList.toggle('paneOpenM',force??!document.body.classList.contains('paneOpenM'));return}const k=paneKey();const cur=!document.body.classList.contains('paneClosed');localCfg[k]=force??!cur;saveLocal();applyLayout();setTimeout(()=>{railMap?.invalidateSize(false);if(currentRoute()==='calendar'&&cal.view==='month')renderCalendar()},60)}

/* ---------- コマンドパレット（Ctrl+K） ---------- */
function paletteItems(q){
  const k=norm(q);const out=[];const hit=(...xs)=>!k||xs.some(x=>norm(x).includes(k));
  const nav=[['ホーム','home','home'],['カレンダー','calendar','cal'],['小田急マップ','map','map']];
  nav.forEach(([n,r,ic])=>{if(hit(n,r))out.push({sec:'移動',icon:ic,label:n,sub:'',run:()=>routeTo(r)})});
  TOOLS.forEach(t=>{if(hit(t.name,t.desc,t.id))out.push({sec:'ツール',icon:t.icon,label:t.name,sub:t.desc,run:()=>routeTo('tool/'+t.id)})});
  if(k){searchStations(q,8).forEach(s=>out.push({sec:'駅',html:stChip(s.name),label:s.name+'駅',sub:isWindowsDesktop()?'Enter：地図　Shift+Enter：フォルダ':'地図で表示',run:()=>showStationOnMap(s.name),alt:()=>openLocalFolder(s.current||s.folderId)}))}
  else CURRENT_PROJECTS.slice(0,4).forEach(c=>out.push({sec:'現行案件',html:stChip(c.station),label:c.station+'駅',sub:isWindowsDesktop()?'Enter：地図　Shift+Enter：フォルダ':'地図で表示',run:()=>showStationOnMap(c.station),alt:()=>openLocalFolder(c.id)}));
  const acts=[['新しい予定','cal',()=>openEventEditor({event:newEventFrom(newEventDefaults(todayISO())),isNew:true}),'よてい ついか'],['タスクを追加','check',()=>openTaskEditor(null),'たすく'],['テーマを切り替え（ライト/ダーク）','moon',()=>{state.settings.theme=resolvedTheme()==='dark'?'light':'dark';commit();applyTheme()},'だーく らいと'],['今すぐ同期','sync',()=>syncNow('manual'),'どうき github'],['設定','cog',()=>openSettings(),'せってい'],['ICSファイルを読み込む','ul',()=>$('fileIcs').click(),'outlook いんぽーと'],['キーボードショートカット','key',showShortcuts,'ショートカット']];
  acts.forEach(([n,ic,run,kw])=>{if(hit(n,kw))out.push({sec:'操作',icon:ic,label:n,sub:'',run})});
  if(k&&k.length>=1){const from=addDays(todayISO(),-180),to=addDays(todayISO(),365);occurrencesBetween(from,to,{query:q}).filter(o=>o.date>=todayISO()).slice(0,6).forEach(o=>out.push({sec:'予定',icon:'clock',label:o.title,sub:fmtMDW(o.date)+(o.allDay?' 終日':' '+o.start),run:()=>{routeTo('calendar');cal.anchor=o.date;cal.view=cal.view==='list'||cal.view==='month'?'day':cal.view;renderCalendar()}}));
    state.tasks.filter(t=>!t.done&&norm(t.title+' '+(t.stationName||'')).includes(k)).slice(0,5).forEach(t=>out.push({sec:'タスク',icon:'check',label:t.title,sub:taskDate(t)?fmtMD(taskDate(t)):'',run:()=>openTaskEditor(t.id)}));
    [...CATALOGS,...(state.bookmarks||[])].forEach(c=>{if(hit(c.title))out.push({sec:'リンク',icon:'ext',label:c.title,sub:'新しいタブで開く',run:()=>window.open(c.url,'_blank','noopener')})})}
  return out;
}
function openPalette(){
  openModal(`<div class="palIn">${icon('search','i','width:20px;height:20px;color:var(--ink-3)')}<input id="palInput" placeholder="駅名・予定・ツール・操作を入力" autocomplete="off" autofocus><kbd>Esc</kbd></div><div class="palList" id="palList"></div><div class="palFoot"><span><kbd>↑</kbd><kbd>↓</kbd> 選択</span><span><kbd>Enter</kbd> 実行</span><span>駅名はひらがなでも探せます</span></div>`,{cls:'palette',onMount:box=>{
    const inp=box.querySelector('#palInput'),list=box.querySelector('#palList');let items=[],sel=0;
    const draw=()=>{items=paletteItems(inp.value);sel=Math.min(sel,Math.max(0,items.length-1));let sec='';list.innerHTML=items.map((it,i)=>{const h=it.sec!==sec?`<div class="palSec">${esc(it.sec)}</div>`:'';sec=it.sec;return h+`<button type="button" class="palItem ${i===sel?'sel':''}" data-i="${i}">${it.html||icon(it.icon||'right')}${it.html?'':`<span>${esc(it.label)}</span>`}<span class="sub">${esc(it.sub||'')}</span></button>`}).join('')||'<div class="empty">一致する項目がありません</div>';
      $$('[data-i]',list).forEach(b=>{b.onclick=e=>run(+b.dataset.i,e.shiftKey);b.onmousemove=()=>{if(sel!==+b.dataset.i){sel=+b.dataset.i;$$('.palItem',list).forEach(x=>x.classList.toggle('sel',+x.dataset.i===sel))}}})};
    const run=(i,alt)=>{const it=items[i];if(!it)return;closeModal();setTimeout(()=>(alt&&it.alt?it.alt:it.run)(),10)};
    inp.oninput=()=>{sel=0;draw()};inp.onkeydown=e=>{if(e.key==='ArrowDown'){sel=Math.min(items.length-1,sel+1);draw();list.querySelector('.sel')?.scrollIntoView({block:'nearest'});e.preventDefault()}else if(e.key==='ArrowUp'){sel=Math.max(0,sel-1);draw();list.querySelector('.sel')?.scrollIntoView({block:'nearest'});e.preventDefault()}else if(e.key==='Enter'){e.preventDefault();run(sel,e.shiftKey)}else if(e.key==='Escape')closeModal()};draw();
  }});
}

/* ---------- 設定 ---------- */
function openSettings(tab='general'){
  const s=state.settings,cs=calSettings(),g=localCfg.github;
  const tabs=[['general','表示・地点'],['calendar','カレンダー'],['categories','予定の種別'],['bookmarks','ブックマーク'],['sync','GitHub同期'],['data','バックアップ']];
  openModal(`<div class="mHead"><h2>設定</h2><button class="btn ghost icon" type="button" data-close aria-label="閉じる">${icon('x')}</button></div>
  <div class="setWrap" style="flex:1;min-height:0;overflow:hidden"><div class="setNav">${tabs.map(([k,n])=>`<button type="button" data-tab="${k}">${n}</button>`).join('')}</div>
  <form class="setBody" id="setForm" autocomplete="off">
   <section class="setSec" data-sec="general"><h3>表示・地点</h3>
     <div class="grid2"><div class="field"><label>テーマ</label><select name="theme"><option value="dark">ダーク</option><option value="light">ライト</option><option value="auto">端末の設定に合わせる</option></select></div>
     <div class="field"><label>天気の地点</label><input name="wx" value="${esc(s.weather?.name||'')}" placeholder="例：町田市"><span class="hint">保存時に地名から位置を検索します</span></div>
     <div class="field full"><label>自宅の住所（電車ルートの出発地）</label><input name="home" value="${esc(s.routes?.home||'')}"></div>
     <div class="field full"><label>事務所の住所</label><input name="office" value="${esc(s.routes?.office||'')}"></div></div></section>
   <section class="setSec" data-sec="calendar"><h3>カレンダー</h3>
     <div class="grid2"><div class="field"><label>週の始まり</label><select name="weekStart"><option value="0">日曜日</option><option value="1">月曜日</option></select></div>
     <div class="field"><label>新しい予定の長さ</label><select name="dur"><option value="30">30分</option><option value="60">1時間</option><option value="90">1時間30分</option><option value="120">2時間</option></select></div>
     <div class="field full"><label>稼働日（「稼働日」表示と時間帯の色分けに使用）</label><div class="dayPick">${[1,2,3,4,5,6,0].map(d=>`<label><input type="checkbox" name="wd" value="${d}" ${(cs.workDays||[]).includes(d)?'checked':''}><span>${WD[d]}</span></label>`).join('')}</div></div>
     <div class="field"><label>稼働時間</label><div class="row" style="flex-wrap:nowrap"><input type="time" name="ws" step="900" value="${cs.workStart}"><span>〜</span><input type="time" name="we" step="900" value="${cs.workEnd}"></div></div>
     <div class="field"><label>既定の通知</label><select name="rem">${REMINDER_OPTS.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></div>
     <div class="field full"><label class="check"><input type="checkbox" name="wn" ${cs.weekNumbers?'checked':''}>週番号を表示する</label><label class="check"><input type="checkbox" name="hol" ${cs.showHolidays?'checked':''}>日本の祝日を表示する</label><label class="check"><input type="checkbox" name="tk" ${cs.showTasks?'checked':''}>期日のあるタスクをカレンダーに表示する</label></div>
     <div class="field full"><label>通知</label><div class="row"><span class="hint" id="notifState"></span><button class="btn sm" type="button" id="notifBtn">デスクトップ通知を許可</button></div><span class="hint">アプリを開いている間、予定の通知時刻にお知らせします（ブラウザを閉じている間は通知されません）。</span></div></div></section>
   <section class="setSec" data-sec="categories"><h3>予定の種別</h3><p class="hint">色はカレンダーとホームの予定に反映されます。仕事・プライベート・その他は削除できません。</p><div class="listEd" id="catEd"></div><button class="btn sm" type="button" id="addCat">${icon('plus')}種別を追加</button></section>
   <section class="setSec" data-sec="bookmarks"><h3>ブックマーク</h3><p class="hint">左のメニューに表示されます。</p><div class="listEd" id="bmEd"></div><button class="btn sm" type="button" id="addBm">${icon('plus')}ブックマークを追加</button></section>
   <section class="setSec" data-sec="sync"><h3>GitHub同期</h3><p class="hint">予定・タスク・設定をGitHubリポジトリ内のJSONファイルに保存し、パソコンとiPhoneなど複数の端末で共有します。最終更新が新しい方のデータを採用します。</p>
     <div class="grid2"><div class="field"><label>Owner（ユーザー名）</label><input name="ghOwner" value="${esc(g.owner)}"></div><div class="field"><label>Repository</label><input name="ghRepo" value="${esc(g.repo)}"></div>
     <div class="field"><label>Branch</label><input name="ghBranch" value="${esc(g.branch||'main')}"></div><div class="field"><label>保存ファイル</label><input name="ghPath" value="${esc(g.path||'data/kouji-next.json')}"></div>
     <div class="field full"><label>Fine-grained Personal Access Token</label><input name="ghToken" type="password" value="${esc(g.token)}" autocomplete="off"><span class="hint">トークンはこの端末のブラウザにだけ保存され、同期データには含まれません。対象リポジトリの Contents: Read and write 権限で発行してください。共有パソコンでは使わないでください。</span></div>
     <div class="field"><label>自動同期</label><select name="ghEnabled"><option value="false">しない</option><option value="true">する</option></select></div><div class="field"><label>同期の間隔</label><select name="ghInterval"><option value="60">1分</option><option value="120">2分</option><option value="300">5分</option></select></div></div>
     <div class="row" style="margin-top:6px"><button class="btn sm" type="button" id="ghPull">${icon('dl')}GitHubから取得</button><button class="btn sm" type="button" id="ghPush">${icon('ul')}GitHubへ保存</button></div></section>
   <section class="setSec" data-sec="data"><h3>バックアップ</h3><p class="hint">デスクトップで使う場合、データはそのブラウザの中に保存されます。ブラウザを変える前や定期的に、バックアップファイルを書き出しておくと安心です。</p>
     <div class="row"><button class="btn" type="button" id="bkOut">${icon('dl')}バックアップを書き出す（.json）</button><button class="btn" type="button" id="bkIn">${icon('ul')}バックアップから復元</button></div>
     <h3 style="margin-top:22px">Outlookとの連携</h3><p class="hint">Outlookで「カレンダーを保存」したICSファイルを読み込めます。書き出したICSはOutlookやiPhoneのカレンダーに取り込めます。</p>
     <div class="row"><button class="btn" type="button" id="icsIn">${icon('ul')}ICSを読み込む</button><button class="btn" type="button" id="icsOut">${icon('dl')}すべての予定をICSで書き出す</button></div>
     <p class="hint" style="margin-top:22px">予定 ${state.events.length}件・タスク ${state.tasks.length}件・最終更新 ${new Date(state.updatedAt).toLocaleString('ja-JP')}</p></section>
  </form></div>
  <div class="mFoot"><span class="grow"></span><button class="btn" type="button" data-close>閉じる</button><button class="btn primary" type="button" id="setSave">設定を保存</button></div>`,{wide:true,onMount:box=>{
    const f=box.querySelector('#setForm');f.theme.value=s.theme||'dark';f.weekStart.value=String(cs.weekStart||0);f.dur.value=String(cs.defaultDuration||60);f.rem.value=cs.defaultReminder==null?'':String(cs.defaultReminder);f.ghEnabled.value=String(!!g.enabled);f.ghInterval.value=String(g.interval||120);
    const show=t=>{$$('[data-tab]',box).forEach(b=>b.setAttribute('aria-current',String(b.dataset.tab===t)));$$('.setSec',box).forEach(x=>x.classList.toggle('on',x.dataset.sec===t))};$$('[data-tab]',box).forEach(b=>b.onclick=()=>show(b.dataset.tab));show(tab);
    const cats=clone(state.categories),bms=clone(state.bookmarks||[]);
    const drawCats=()=>{$('catEd').innerHTML=cats.map((c,i)=>`<div class="r cat"><input type="color" value="${c.color}" data-cc="${i}"><input class="input" value="${esc(c.name)}" data-cn="${i}"><button class="btn ghost icon sm" type="button" data-cd="${i}" ${c.locked?'disabled title="既定の種別は削除できません"':''} aria-label="削除">${icon('trash')}</button></div>`).join('');
      $$('[data-cc]',box).forEach(x=>x.oninput=()=>cats[+x.dataset.cc].color=x.value);$$('[data-cn]',box).forEach(x=>x.oninput=()=>cats[+x.dataset.cn].name=x.value);$$('[data-cd]',box).forEach(x=>x.onclick=()=>{cats.splice(+x.dataset.cd,1);drawCats()})};
    const drawBms=()=>{$('bmEd').innerHTML=bms.map((b,i)=>`<div class="r"><input class="input" value="${esc(b.title)}" placeholder="表示名" data-bt="${i}"><input class="input" value="${esc(b.url)}" placeholder="https://" data-bu="${i}"><button class="btn ghost icon sm" type="button" data-bd="${i}" aria-label="削除">${icon('trash')}</button></div>`).join('')||'<div class="empty" style="padding:12px">まだありません。</div>';
      $$('[data-bt]',box).forEach(x=>x.oninput=()=>bms[+x.dataset.bt].title=x.value);$$('[data-bu]',box).forEach(x=>x.oninput=()=>bms[+x.dataset.bu].url=x.value);$$('[data-bd]',box).forEach(x=>x.onclick=()=>{bms.splice(+x.dataset.bd,1);drawBms()})};
    drawCats();drawBms();
    $('addCat').onclick=()=>{cats.push({id:uid('c'),name:'新しい種別',color:'#2f8f83',locked:false});drawCats();$$('[data-cn]',box).pop().select()};
    $('addBm').onclick=()=>{bms.push({title:'',url:'https://'});drawBms();$$('[data-bt]',box).pop().focus()};
    const ns=()=>{const p='Notification'in window?Notification.permission:'unsupported';$('notifState').textContent={granted:'デスクトップ通知：許可済み',denied:'デスクトップ通知：ブロック中（ブラウザの設定から許可してください）',default:'デスクトップ通知：未設定',unsupported:'この環境はデスクトップ通知に未対応です（アプリ内に表示します）'}[p];$('notifBtn').classList.toggle('hidden',p!=='default')};ns();
    $('notifBtn').onclick=async()=>{try{await Notification.requestPermission()}catch(e){}ns()};
    const readGh=()=>({enabled:f.ghEnabled.value==='true',owner:f.ghOwner.value.trim(),repo:f.ghRepo.value.trim(),branch:f.ghBranch.value.trim()||'main',path:f.ghPath.value.trim()||'data/kouji-next.json',token:f.ghToken.value.trim(),interval:+f.ghInterval.value||120});
    $('ghPull').onclick=async()=>{localCfg.github=Object.assign(readGh(),{enabled:true});saveLocal();await syncNow('pull');f.ghEnabled.value='true'};
    $('ghPush').onclick=async()=>{localCfg.github=Object.assign(readGh(),{enabled:true});saveLocal();await syncNow('push');f.ghEnabled.value='true'};
    $('bkOut').onclick=()=>{downloadText(`kouji-next_backup_${todayISO()}.json`,JSON.stringify(syncPayload(),null,2),'application/json');toast('バックアップを書き出しました')};
    $('bkIn').onclick=()=>$('fileJson').click();$('icsIn').onclick=()=>$('fileIcs').click();$('icsOut').onclick=()=>exportIcs('all');
    $('setSave').onclick=async()=>{
      const valid=cats.filter(c=>c.name.trim());if(!valid.length){toast('種別を1つ以上残してください');return}
      state.categories=valid.map(c=>Object.assign(c,{name:c.name.trim()}));const ids=new Set(state.categories.map(c=>c.id));state.events.forEach(e=>{if(!ids.has(e.categoryId))e.categoryId=state.categories[0].id});
      state.bookmarks=bms.filter(b=>b.url&&b.url!=='https://').map(b=>({title:b.title.trim()||b.url,url:/^https?:\/\//.test(b.url)?b.url:'https://'+b.url}));
      s.theme=f.theme.value;s.routes={home:f.home.value.trim(),office:f.office.value.trim()};
      Object.assign(cs,{weekStart:+f.weekStart.value,defaultDuration:+f.dur.value,workDays:$$('[name=wd]:checked',f).map(x=>+x.value),workStart:f.ws.value||'08:30',workEnd:f.we.value||'17:30',defaultReminder:f.rem.value===''?null:+f.rem.value,weekNumbers:f.wn.checked,showHolidays:f.hol.checked,showTasks:f.tk.checked});
      const place=f.wx.value.trim()||'町田市';let wxChanged=false;
      if(place!==s.weather?.name){try{const r=await fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&language=ja&format=json&name='+encodeURIComponent(place));const d=await r.json();const g0=d.results?.[0];if(g0){s.weather={name:place,lat:g0.latitude,lon:g0.longitude};wxChanged=true}else toast(`「${place}」が見つからないため、天気の地点は変更していません`)}catch(e){toast('地点を検索できませんでした（オフライン）')}}
      localCfg.github=readGh();saveLocal();commit();applyTheme();setupAutoSync();if(wxChanged)loadWeather();closeModal();toast('設定を保存しました');
    };
  }});
}
function restoreBackup(text){let p;try{p=JSON.parse(text)}catch(e){toast('バックアップファイルを読めませんでした');return}const payload=p.state?p:{state:p,updatedAt:p.updatedAt||Date.now()};if(!payload.state?.events&&!payload.state?.tasks){toast('工事管理nextのバックアップではありません');return}
  confirmBox(`バックアップ（予定${payload.state.events?.length||0}件・タスク${payload.state.tasks?.length||0}件）で現在のデータを置き換えます。よろしいですか？`,{ok:'置き換える'}).then(ok=>{if(!ok)return;payload.updatedAt=Date.now();applyPayload(payload);state.updatedAt=Date.now();saveState(true);applyTheme();toast('バックアップから復元しました')})}

/* ---------- 全体の再描画 ---------- */
function renderAll(){renderNav();renderTasks();const r=currentRoute();if(r==='calendar')renderCalendar();if(r==='home'||!['calendar','map'].includes(r.split('/')[0]))renderHome()}

/* ---------- キーボード ---------- */
let gPending=0;
function onKey(e){
  const tag=(e.target.tagName||'').toLowerCase();const typing=tag==='input'||tag==='textarea'||tag==='select'||e.target.isContentEditable;
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(modalOpen())closeModal();openPalette();return}
  if(e.key==='Escape'){if(popEl){closePop();return}if(modalOpen()){closeModal();return}closeDrawers();if(cal.sel){cal.sel=null;markSelected()}return}
  if(typing||modalOpen()||e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.key==='?'){showShortcuts();return}
  if(gPending&&Date.now()-gPending<1200){const m={h:'home',c:'calendar',m:'map'}[e.key.toLowerCase()];gPending=0;if(m){routeTo(m);e.preventDefault();return}}
  if(e.key==='g'){gPending=Date.now();return}
  if(currentRoute()==='calendar'){closePop();calendarKeys(e)}
}

/* ---------- 起動 ---------- */
function boot(){
  initState();applyTheme();applyLayout();
  if(document.documentElement.classList.contains('preRailCollapsed'))document.documentElement.classList.remove('preRailCollapsed');
  renderNav();initCalendar();
  /* イベント */
  window.addEventListener('hashchange',handleRoute);
  $('menuBtn').onclick=()=>{if(isMobile())document.body.classList.toggle('railOpenM');else{localCfg.leftCollapsed=!localCfg.leftCollapsed;saveLocal();applyLayout();setTimeout(()=>{railMap?.invalidateSize(false);if(currentRoute()==='calendar'&&cal.view==='month')renderCalendar()},60)}};
  $('railCollapseBtn').onclick=()=>{localCfg.leftCollapsed=!localCfg.leftCollapsed;saveLocal();applyLayout();setTimeout(()=>railMap?.invalidateSize(false),60)};
  $('scrimSide').onclick=closeDrawers;$('paneBtn').onclick=()=>togglePane();$('paneClose').onclick=()=>togglePane(false);$('navTasks').onclick=()=>{togglePane(true);if(isMobile())closeDrawers(),document.body.classList.add('paneOpenM');setTimeout(()=>$('taskQuickInput').focus(),50)};
  $('omniBtn').onclick=openPalette;$('settingsBtn').onclick=()=>openSettings();$('syncBtn').onclick=()=>syncNow('manual');
  $$('#tabbar [data-route]').forEach(b=>b.onclick=()=>routeTo(b.dataset.route));
  $('tabbar').querySelector('[data-act=tasks]').onclick=()=>{document.body.classList.remove('railOpenM');document.body.classList.toggle('paneOpenM')};
  $('tabbar').querySelector('[data-act=menu]').onclick=()=>{document.body.classList.remove('paneOpenM');document.body.classList.toggle('railOpenM')};
  $('taskQuick').onsubmit=e=>{e.preventDefault();const v=$('taskQuickInput').value.trim();if(!v)return;const p=parseQuickTask(v);const st=findStation(p.station);state.tasks.push({id:uid('t'),title:p.title,stationName:p.station,stationId:st?.folderId||'',priority:'normal',date:p.date,time:p.time,done:false,created:Date.now()});$('taskQuickInput').value='';commit();toast('追加しました'+([p.station?p.station+'駅':'',p.date?fmtMD(p.date):'',p.time].filter(Boolean).length?`（${[p.station?p.station+'駅':'',p.date?fmtMD(p.date):'',p.time].filter(Boolean).join('・')}）`:''))};
  $('taskDetailBtn').onclick=()=>{const v=$('taskQuickInput').value.trim();const p=v?parseQuickTask(v):{};openTaskEditor(null,{title:p.title||'',stationName:p.station||'',date:p.date||'',time:p.time||''});$('taskQuickInput').value=''};
  $$('#taskTabs button').forEach(b=>b.onclick=()=>{taskFilter=b.dataset.f;$$('#taskTabs button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderTasks()});
  $('taskSearch').oninput=renderTasks;
  $('homeNewEvent').onclick=()=>openEventEditor({event:newEventFrom(newEventDefaults(todayISO())),isNew:true});
  $('openRootFolder').onclick=()=>openLocalFolder('root');
  $$('[data-wx]').forEach(b=>b.onclick=()=>{wxView=b.dataset.wx;$$('[data-wx]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderWeather()});
  $('toolReload').onclick=()=>{const f=$('toolFrame');f.src=f.src};
  $('fileIcs').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;importIcsText(await file.text())};
  $('fileJson').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;restoreBackup(await file.text())};
  document.addEventListener('keydown',onKey);
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{if(state.settings.theme==='auto')applyTheme()});
  onChange(()=>{renderAll();applyTheme()});
  /* 日付が変わったら再描画 */
  let day=todayISO();setInterval(()=>{if(todayISO()!==day){day=todayISO();renderAll()}},60000);
  /* ツール側（iframe）からの要求 */
  window.addEventListener('message',e=>{const d=e.data||{};if(d.type==='kouji-route'&&typeof d.route==='string')routeTo(d.route)});
  if(innerWidth<=1180)document.body.classList.remove('paneOpenM');
  handleRoute();renderTasks();loadWeather();setInterval(loadWeather,20*60*1000);setupAutoSync();
  window.addEventListener('online',()=>syncNow('auto'));document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncNow('auto')});
  if('serviceWorker'in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
    /* 新しいSWが有効化されたら一度だけ再読込（モーダル入力中は閉じるまで待つ）。PWA復帰時にも更新確認する。 */
    const hadCtrl=!!navigator.serviceWorker.controller;let reloaded=false;
    const reloadWhenIdle=()=>{if(reloaded)return;/* AI Workspaceで入力・添付・応答待ち・録音中のときも再読込を待つ */if(modalOpen()||(window.KoujiAIWorkspace&&KoujiAIWorkspace.busyOrDirty&&KoujiAIWorkspace.busyOrDirty())){setTimeout(reloadWhenIdle,3000);return}reloaded=true;location.reload()};
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(hadCtrl)reloadWhenIdle()});
    navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none'}).then(reg=>{
      document.addEventListener('visibilitychange',()=>{if(!document.hidden)reg.update().catch(()=>{})});
    }).catch(()=>{});
  }
}
boot();
