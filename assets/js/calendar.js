/* =========================================================
   calendar.js — 日 / 稼働日 / 週 / 月 / 一覧 ビュー、ドラッグ操作、通知
   ========================================================= */
'use strict';
const cal={view:'week',anchor:todayISO(),sel:null,query:'',prevView:null,items:new Map(),scrollTop:null,days:[]};
const SNAP=15;
/* 種別の表示/非表示は同期データ(state.settings.calendar)に保存する → 端末間で共通 */
function hiddenCats(){return new Set(calSettings().hiddenCats||[])}
function setHiddenCats(arr){calSettings().hiddenCats=[...arr];commit()}
function visibleCats(){const h=hiddenCats();return new Set(state.categories.filter(c=>!h.has(c.id)).map(c=>c.id))}
function hh(){const el=document.querySelector('.tg');return el?parseFloat(getComputedStyle(el).getPropertyValue('--hh'))||46:46}

/* ---------- 範囲 ---------- */
function viewDays(){
  const cs=calSettings(),a=cal.anchor;
  if(cal.view==='day')return [a];
  if(cal.view==='week'){const s=startOfWeek(a,cs.weekStart);return Array.from({length:7},(_,i)=>addDays(s,i))}
  if(cal.view==='workweek'){const s=startOfWeek(a,cs.weekStart);const wd=(cs.workDays&&cs.workDays.length?cs.workDays:[1,2,3,4,5]);return Array.from({length:7},(_,i)=>addDays(s,i)).filter(d=>wd.includes(dowOf(d)))}
  if(cal.view==='month'){const f=a.slice(0,8)+'01';const s=startOfWeek(f,cs.weekStart);const last=addMonths(f,1);const rows=Math.ceil(diffDays(s,last)/7);return Array.from({length:rows*7},(_,i)=>addDays(s,i))}
  const s=cal.query?addDays(todayISO(),-365):a;const n=cal.query?730:31;return Array.from({length:n},(_,i)=>addDays(s,i));
}
function rangeTitle(days){
  const a=parseISO(cal.anchor);
  if(cal.query)return `「${cal.query}」の検索結果`;
  if(cal.view==='month')return `${a.getFullYear()}年${a.getMonth()+1}月`;
  if(cal.view==='day'){const h=holidayName(cal.anchor);return fmtYMDW(cal.anchor)+(h?` ${h}`:'')}
  const s=parseISO(days[0]),e=parseISO(days[days.length-1]);
  if(cal.view==='list')return `${s.getFullYear()}年${s.getMonth()+1}月${s.getDate()}日から`;
  return s.getMonth()===e.getMonth()?`${s.getFullYear()}年${s.getMonth()+1}月${s.getDate()}日〜${e.getDate()}日`:`${s.getFullYear()}年${s.getMonth()+1}月${s.getDate()}日〜${e.getFullYear()!==s.getFullYear()?e.getFullYear()+'年':''}${e.getMonth()+1}月${e.getDate()}日`;
}
function calNav(dir){if(dir===0){cal.anchor=todayISO()}else if(cal.view==='month')cal.anchor=addMonths(cal.anchor,dir);else if(cal.view==='day')cal.anchor=addDays(cal.anchor,dir);else if(cal.view==='list')cal.anchor=addDays(cal.anchor,dir*30);else cal.anchor=addDays(cal.anchor,dir*7);cal.scrollTop=null;renderCalendar()}
function setCalView(v){if(cal.query){cal.query='';$('calSearch').value=''}cal.view=v;localCfg.calView=v;saveLocal();cal.scrollTop=null;renderCalendar()}

/* ---------- データ収集 ---------- */
function taskItems(from,to){
  if(!calSettings().showTasks)return [];
  return state.tasks.filter(t=>t.date&&t.date>=from&&t.date<=to).map(t=>{const st=t.time||'';return {kind:'task',key:'task:'+t.id,id:t.id,title:t.title,date:t.date,endDate:t.date,start:st,end:st?fromMin(Math.min(toMin(st)+30,1440)):'',allDay:!st,color:'#7b8590',station:t.stationName||'',done:!!t.done,task:t}});
}
function collect(from,to){
  const cats=visibleCats();const occ=occurrencesBetween(from,to,{cats,query:cal.query});
  const items=occ.map(o=>Object.assign(o,{kind:'event',color:category(o.categoryId).color}));
  const tasks=cal.query?state.tasks.filter(t=>t.date&&norm(t.title+' '+(t.stationName||'')).includes(norm(cal.query))).map(t=>taskItems(t.date,t.date).find(x=>x.id===t.id)).filter(Boolean):taskItems(from,to);
  cal.items=new Map();[...items,...tasks].forEach(i=>cal.items.set(i.key,i));
  return {events:items,tasks};
}
function isPastItem(i){const end=i.kind==='task'?parseISO(addDays(i.date,1)):occEnd(i);return end<new Date()}

/* ---------- 全体描画 ---------- */
function renderCalendar(){
  if(!$('calBody'))return;
  const days=viewDays();cal.days=days;
  $('calRange').textContent=rangeTitle(days);
  $$('#calViews button').forEach(b=>b.setAttribute('aria-pressed',String(!cal.query&&b.dataset.v===cal.view)));
  const body=$('calBody');const prevScroll=body.querySelector('.tgScroll')?.scrollTop;
  if(cal.query||cal.view==='list')body.innerHTML=renderList(days);
  else if(cal.view==='month')body.innerHTML=renderMonth(days);
  else body.innerHTML=renderTimeGrid(days);
  if(cal.view==='month'&&!cal.query)fitMonthCells();
  const sc=body.querySelector('.tgScroll');
  if(sc){const gw=sc.offsetWidth-sc.clientWidth;$$('.tgHead,.tgAll',body).forEach(x=>x.style.gridTemplateColumns=`var(--gut) repeat(var(--n),minmax(0,1fr)) ${gw}px`);const H=hh();if(cal.scrollTop==null&&prevScroll==null){const cs=calSettings();const t=days.includes(todayISO())?Math.max(0,nowMin()-120):toMin(cs.workStart)-60;sc.scrollTop=Math.max(0,t/60*H)}else sc.scrollTop=cal.scrollTop??prevScroll;sc.onscroll=()=>{cal.scrollTop=sc.scrollTop}}
  renderMini();renderCatList();updateNowLine();
}

/* ---------- 時間グリッド ---------- */
function layoutLanes(list,days){/* 終日バーの段組み */
  const idx=d=>days.indexOf(d);const lanes=[];const out=[];
  list.map(i=>{let s=idx(i.date<days[0]?days[0]:i.date),e=idx((i.endDate||i.date)>days[days.length-1]?days[days.length-1]:(i.endDate||i.date));
    if(s<0){s=days.findIndex(d=>d>=i.date)}if(e<0){for(let k=days.length-1;k>=0;k--)if(days[k]<=(i.endDate||i.date)){e=k;break}}
    return {i,s,e}}).filter(x=>x.s>=0&&x.e>=x.s).sort((a,b)=>a.s-b.s||(b.e-b.s)-(a.e-a.s)||(a.i.kind==='task')-(b.i.kind==='task')).forEach(x=>{let l=0;while(lanes[l]&&lanes[l].some(r=>!(x.e<r.s||x.s>r.e)))l++;(lanes[l]=lanes[l]||[]).push(x);out.push(Object.assign(x,{lane:l}))});
  return {bars:out,count:lanes.length};
}
function barHtml(x,days,colOffset=0){const i=x.i;const contL=i.date<days[x.s],contR=(i.endDate||i.date)>days[x.e];
  const cls=['bar',i.kind==='task'?'task':'',i.showAs==='free'?'free':'',cal.sel===i.key?'selected':'',contL?'contL':'',contR?'contR':''].join(' ');
  const tm=!i.allDay&&i.start&&!contL?i.start+' ':'';
  return `<div class="${cls}" style="--c:${i.color};grid-column:${x.s+1+colOffset}/${x.e+2+colOffset};grid-row:${x.lane+1}" data-key="${esc(i.key)}" data-kind="${i.kind}" title="${esc(i.title)}">${contL?'‹ ':''}${i.kind==='task'?(i.done?'☑ ':'☐ '):''}${esc(tm+i.title)}${contR?' ›':''}</div>`}
function overlapLayout(segs){/* 同時間帯の重なりを横並びに */
  segs.sort((a,b)=>a.s-b.s||b.e-a.e);let cluster=[],clusterEnd=-1;const flush=()=>{const cols=[];cluster.forEach(g=>{let c=0;while(cols[c]&&cols[c]>g.s)c++;cols[c]=g.e;g.col=c});const n=cols.length;cluster.forEach(g=>{g.n=n;
      /* 右側が空いていれば広げる */let span=1;for(let c=g.col+1;c<n;c++){if(cluster.some(o=>o.col===c&&!(o.e<=g.s||o.s>=g.e)))break;span++}g.span=span});cluster=[];clusterEnd=-1};
  segs.forEach(g=>{if(cluster.length&&g.s>=clusterEnd)flush();cluster.push(g);clusterEnd=Math.max(clusterEnd,g.e)});flush();return segs;
}
function renderTimeGrid(days){
  const cs=calSettings(),today=todayISO(),n=days.length;const {events,tasks}=collect(days[0],days[n-1]);const all=[...events,...tasks];
  const top=all.filter(i=>i.allDay||(i.endDate&&i.endDate!==i.date));const timed=all.filter(i=>!top.includes(i));
  const L=layoutLanes(top,days);
  const ws=toMin(cs.workStart)||510,we=toMin(cs.workEnd)||1050;const H=hh();
  let head=`<div class="tgHead" style="--n:${n}"><div class="corner">${cal.view!=='day'&&cs.weekNumbers?'第'+isoWeek(days[0])+'週':''}</div>`;
  days.forEach(d=>{const dw=dowOf(d),h=calSettings().showHolidays?holidayName(d):'';head+=`<div class="tgDay ${d===today?'today':''} ${dw===0?'sun':dw===6?'sat':''} ${h?'hol':''}" data-goto="${d}" title="${fmtYMDW(d)}"><span class="n num">${parseISO(d).getDate()}</span><span class="wd">${WD[dw]}</span>${h?`<span class="hl">${esc(h)}</span>`:''}</div>`});
  head+='<div></div></div>';
  const rows=Math.max(2,L.count+2);
  let allRow=`<div class="tgAll" style="--n:${n}"><div class="lab" style="grid-column:1;grid-row:1">終日</div>${days.map((d,k)=>`<div class="cell" data-date="${d}" data-allday="1" style="grid-column:${k+2};grid-row:1/${rows}"></div>`).join('')}<div style="grid-column:${n+2};grid-row:1/${rows}"></div><div class="tgAllItems" style="--n:${n}">${L.bars.map(x=>barHtml(x,days)).join('')}</div></div>`;
  let grid=`<div class="tgScroll"><div class="tgGrid" style="--n:${n}"><div class="tgHours">${Array.from({length:23},(_,h)=>`<div style="top:${(h+1)*H}px">${h+1}:00</div>`).join('')}</div>`;
  days.forEach(d=>{const dw=dowOf(d);const work=(cs.workDays||[]).includes(dw)&&!holidayName(d);
    const segs=timed.filter(i=>i.date===d).map(i=>{const s=toMin(i.start)||0;let e=toMin(i.end);if(e==null||e<=s)e=Math.min(1440,s+30);return {i,s,e}});
    overlapLayout(segs);
    grid+=`<div class="tgCol ${d===today?'today':''} ${work?'':'nonwork'}" data-date="${d}">${work?`<div class="off" style="top:0;height:${ws/60*H}px"></div><div class="off" style="top:${we/60*H}px;bottom:0"></div>`:'<div class="off all"></div>'}`;
    segs.forEach(g=>{const i=g.i;const topPx=g.s/60*H,hPx=Math.max(20,(g.e-g.s)/60*H-2);const w=100/g.n;const short=hPx<38;
      const cls=['ev',i.kind==='task'?'task':'',i.showAs==='free'?'free':i.showAs==='tentative'?'tent':i.showAs==='oof'?'oof':'',short?'short':'',cal.sel===i.key?'selected':'',isPastItem(i)?'past':''].join(' ');
      const icons=(i.rec?icon('repeat'):'')+(i.reminder!=null&&i.reminder!==''&&i.kind==='event'?icon('bell'):'');
      const meta=[i.kind==='task'?'タスク':`${i.start}–${i.end}`,i.station?i.station+'駅':'',i.location||''].filter(Boolean).join('  ');
      grid+=`<div class="${cls}" style="--c:${i.color};top:${topPx}px;height:${hPx}px;left:calc(${g.col*w}% + 2px);width:calc(${w*g.span}% - 5px)" data-key="${esc(i.key)}" data-kind="${i.kind}" data-date="${d}" title="${esc(i.title)}">${icons?`<span class="ico">${icons}</span>`:''}<span class="t">${i.kind==='task'?(i.done?'☑ ':'☐ '):''}${esc(i.title)}</span><span class="m">${esc(meta)}</span>${i.kind==='event'?'<div class="rz"></div>':''}</div>`});
    if(d===today)grid+=`<div class="nowLine" style="top:${nowMin()/60*H}px"></div>`;
    grid+='</div>'});
  grid+='</div></div>';
  return `<div class="tg">${head}${allRow}${grid}</div>`;
}
function updateNowLine(){const el=document.querySelector('.tgCol.today .nowLine');if(el)el.style.top=(nowMin()/60*hh())+'px'}

/* ---------- 月 ---------- */
function renderMonth(days){
  const cs=calSettings(),today=todayISO(),m=parseISO(cal.anchor).getMonth();const {events,tasks}=collect(days[0],days[days.length-1]);const all=[...events,...tasks];
  const wk=cs.weekNumbers?'34px':'0px';const rows=days.length/7;
  let html=`<div class="mv" style="--wk:${wk};--rows:${rows}"><div class="mvHead">${cs.weekNumbers?'<div></div>':'<div style="padding:0"></div>'}${days.slice(0,7).map(d=>{const w=dowOf(d);return `<div class="${w===0?'sun':w===6?'sat':''}">${WD[w]}</div>`}).join('')}</div><div class="mvGrid">`;
  for(let r=0;r<rows;r++){const wd=days.slice(r*7,r*7+7);
    const top=all.filter(i=>(i.allDay&&i.kind==='event')||(i.endDate&&i.endDate!==i.date)).filter(i=>i.date<=wd[6]&&(i.endDate||i.date)>=wd[0]);
    const L=layoutLanes(top,wd);
    html+=`<div class="mvWeek" data-lanes="${L.count}">${cs.weekNumbers?`<div class="mvWk num">${isoWeek(wd[0])}</div>`:'<div></div>'}`;
    wd.forEach((d,ci)=>{const dw=dowOf(d),h=cs.showHolidays?holidayName(d):'';const singles=all.filter(i=>!top.includes(i)&&i.date===d);
      const hiddenTop=L.bars.filter(x=>x.s<=ci&&x.e>=ci).reduce((m,x)=>Math.max(m,x.lane+1),0);
      html+=`<div class="mvCell ${parseISO(d).getMonth()!==m?'o':''} ${d===today?'today':''} ${dw===0?'sun':dw===6?'sat':''} ${h?'hol':''}" data-date="${d}" data-top="${hiddenTop}"><div class="dh"><button type="button" class="dn num" data-goto="${d}" title="${fmtYMDW(d)}を日表示">${parseISO(d).getDate()===1?(parseISO(d).getMonth()+1)+'/':''}${parseISO(d).getDate()}</button>${h?`<span class="hn">${esc(h)}</span>`:''}</div><div class="mvItems" style="padding-top:${hiddenTop*24}px">${singles.map(i=>`<div class="mi ${i.kind==='task'?'task':''} ${i.done?'done':''} ${cal.sel===i.key?'selected':''}" style="--c:${i.color}" data-key="${esc(i.key)}" data-kind="${i.kind}" title="${esc(i.title)}"><i></i>${!i.allDay&&i.start?`<span class="tm num">${i.start}</span>`:''}<span>${esc(i.title)}</span></div>`).join('')}</div></div>`});
    html+=`<div class="mvBars">${L.bars.map(x=>barHtml(x,wd)).join('')}</div></div>`;
  }
  return html+'</div></div>';
}
function fitMonthCells(){/* はみ出した予定を「+N件」にまとめる */
  $$('.mvWeek').forEach(w=>{const lanes=+w.dataset.lanes||0;const bars=$$('.mvBars .bar',w);const ch=w.clientHeight;const maxLanes=Math.max(0,Math.floor((ch-28-22)/24));
    bars.forEach(b=>{const lane=+b.style.gridRowStart||1;if(lane>maxLanes)b.style.display='none'});
    $$('.mvCell',w).forEach(c=>{const box=c.querySelector('.mvItems');const its=$$('.mi',box);const usedLanes=Math.min(+c.dataset.top||0,maxLanes);box.style.paddingTop=(usedLanes*24)+'px';
      const hiddenBars=lanes>maxLanes?bars.filter(b=>b.style.display==='none'&&(()=>{const [s,e]=b.style.gridColumn.split('/').map(x=>parseInt(x));const ci=$$('.mvCell',w).indexOf(c);return s-1<=ci&&e-2>=ci})()).length:0;
      let avail=ch-28-usedLanes*24-2;let fit=Math.floor(avail/24);let hidden=hiddenBars;
      if(its.length>fit||hidden){const keep=Math.max(0,fit-1);its.forEach((x,k)=>{if(k>=keep){x.style.display='none';hidden++}})}
      if(hidden){const b=document.createElement('button');b.type='button';b.className='more';b.dataset.goto=c.dataset.date;b.textContent=`他 ${hidden} 件`;box.appendChild(b)}})});
}

/* ---------- 一覧 ---------- */
function renderList(days){
  const {events,tasks}=collect(days[0],days[days.length-1]);const all=[...events,...tasks];const today=todayISO();
  const byDate=new Map();all.forEach(i=>{/* 複数日予定は期間内の各日に表示 */let d=i.date<days[0]?days[0]:i.date;const end=(i.endDate||i.date)>days[days.length-1]?days[days.length-1]:(i.endDate||i.date);while(d<=end){if(!byDate.has(d))byDate.set(d,[]);byDate.get(d).push(i);d=addDays(d,1);if(cal.query)break}});
  const keys=[...byDate.keys()].sort();byDate.forEach(l=>l.sort((a,b)=>(b.allDay-a.allDay)||(toMin(a.start)||0)-(toMin(b.start)||0)));
  if(!keys.length)return `<div class="lv"><div class="empty">${cal.query?`「${esc(cal.query)}」に一致する予定はありません。キーワードを変えるか、検索欄を空にして戻ってください。`:'この期間に予定はありません。<br>「新しい予定」か、キーボードの N で追加できます。'}</div></div>`;
  let html='<div class="lv">'+(cal.query?`<div class="lvHead">${all.length}件（前後1年）</div>`:'');
  keys.forEach(d=>{const h=holidayName(d);const dt=parseISO(d);html+=`<div class="lvDay"><div class="lvDate ${d===today?'today':''}"><b class="num">${dt.getDate()}</b>${dt.getFullYear()!==parseISO(today).getFullYear()?dt.getFullYear()+'年':''}${dt.getMonth()+1}月 ${WD[dt.getDay()]}曜${relDay(d)?`・${relDay(d)}`:''}${h?`<div class="hol">${esc(h)}</div>`:''}</div><div class="lvItems">`;
    byDate.get(d).forEach(i=>{const tm=i.kind==='task'?(i.start?i.start+' タスク':'タスク'):i.allDay?(i.date!==i.endDate?`終日（${fmtMD(i.date)}〜${fmtMD(i.endDate)}）`:'終日'):(i.date!==i.endDate?`${fmtMD(i.date)} ${i.start} 〜 ${fmtMD(i.endDate)} ${i.end}`:`${i.start} 〜 ${i.end}`);
      html+=`<div class="lvItem ${isPastItem(i)?'agItem past':''}" data-key="${esc(i.key)}" data-kind="${i.kind}" style="--c:${i.color}"><div class="tm num">${esc(tm)}</div><div class="agBar"></div><div><div class="ti">${i.kind==='task'?(i.done?'☑ ':'☐ '):''}${esc(i.title)}${i.rec?' '+icon('repeat','i','width:13px;height:13px;color:var(--ink-3);vertical-align:-2px'):''}</div><div class="su">${i.station?stChip(i.station):''}${i.location?`<span>${icon('pin','i','width:13px;height:13px;vertical-align:-2px')} ${esc(i.location)}</span>`:''}</div></div><div class="cat">${i.kind==='event'?esc(category(i.categoryId).name):''}</div></div>`});
    html+='</div></div>'});
  return html+'</div>';
}

/* ---------- ミニカレンダー・種別 ---------- */
let miniMonth=null;
function renderMini(){
  const el=$('miniCal');if(!el)return;const cs=calSettings();const base=miniMonth||cal.anchor.slice(0,8)+'01';const s=startOfWeek(base,cs.weekStart);const days=Array.from({length:42},(_,i)=>addDays(s,i));const m=parseISO(base).getMonth();const today=todayISO();
  const has=new Set();occurrencesBetween(days[0],days[41],{cats:visibleCats()}).forEach(o=>{let d=o.date;while(d<=(o.endDate||o.date)&&d<=days[41]){has.add(d);d=addDays(d,1)}});
  const vr=new Set(cal.view==='month'||cal.view==='list'||cal.query?[]:cal.days);
  el.innerHTML=`<div class="miniHead"><b class="num">${parseISO(base).getFullYear()}年${m+1}月</b><span><button class="btn ghost icon sm" type="button" data-mm="-1" aria-label="前の月">${icon('left')}</button><button class="btn ghost icon sm" type="button" data-mm="1" aria-label="次の月">${icon('right')}</button></span></div><div class="miniGrid">${days.slice(0,7).map(d=>`<div class="w">${WD[dowOf(d)]}</div>`).join('')}${days.map(d=>{const w=dowOf(d);return `<button type="button" class="num ${parseISO(d).getMonth()!==m?'o':''} ${d===today?'today':''} ${w===0?'sun':w===6?'sat':''} ${holidayName(d)?'hol':''} ${has.has(d)?'has':''} ${vr.has(d)?'inRange':''}" data-d="${d}" title="${fmtYMDW(d)}${holidayName(d)?' '+holidayName(d):''}">${parseISO(d).getDate()}</button>`}).join('')}</div>`;
  $$('[data-mm]',el).forEach(b=>b.onclick=()=>{miniMonth=addMonths(base,+b.dataset.mm);renderMini()});
  $$('[data-d]',el).forEach(b=>b.onclick=()=>{cal.anchor=b.dataset.d;miniMonth=null;if(cal.query){cal.query='';$('calSearch').value=''}if(cal.view==='list')cal.view=localCfg.calView==='list'?'day':localCfg.calView;renderCalendar();document.body.classList.remove('calSideOpenM')});
}
function renderCatList(){
  const el=$('catList');if(!el)return;const h=hiddenCats();const from=cal.days[0],to=cal.days[cal.days.length-1];const cnt={};occurrencesBetween(from,to).forEach(o=>cnt[o.categoryId]=(cnt[o.categoryId]||0)+1);
  el.innerHTML=state.categories.map(c=>`<div class="catRow ${h.has(c.id)?'':'on'}" role="checkbox" tabindex="0" aria-checked="${!h.has(c.id)}" style="--c:${c.color}" data-cat="${c.id}"><span class="catBox"><svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span>${esc(c.name)}<span class="cnt num">${cnt[c.id]||''}</span></div>`).join('');
  $$('[data-cat]',el).forEach(r=>{const t=()=>{const s=hiddenCats();s.has(r.dataset.cat)?s.delete(r.dataset.cat):s.add(r.dataset.cat);setHiddenCats(s);renderCalendar()};r.onclick=t;r.onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();t()}}});
  $('togTasks').classList.toggle('on',!!calSettings().showTasks);$('togHol').classList.toggle('on',!!calSettings().showHolidays);
}

/* ---------- ピーク（詳細ポップ） ---------- */
function whenText(i){
  if(i.kind==='task')return fmtYMDW(i.date)+(i.start?' '+i.start:'')+'（期日）';
  if(i.allDay)return i.date===i.endDate?fmtYMDW(i.date)+' 終日':`${fmtMDW(i.date)} 〜 ${fmtMDW(i.endDate)} 終日（${diffDays(i.date,i.endDate)+1}日間）`;
  return i.date===i.endDate?`${fmtYMDW(i.date)} ${i.start} 〜 ${i.end}`:`${fmtMDW(i.date)} ${i.start} 〜 ${fmtMDW(i.endDate)} ${i.end}`;
}
const REMINDER_LABEL=m=>m==null||m===''?'':+m===0?'開始時刻':+m<60?`${m}分前`:+m<1440?`${m/60}時間前`:+m<10080?`${m/1440}日前`:`${m/10080}週間前`;
const SHOWAS={busy:'予定あり',free:'空き時間',tentative:'仮の予定',oof:'外出中'};
function openPeek(key,anchor){
  const i=cal.items.get(key)||findItemByKey(key);if(!i)return;cal.sel=key;markSelected();
  if(i.kind==='task'){const t=i.task;openPop(`<div class="peekBar" style="--c:${i.color}"></div><div class="peekIn"><h3>${esc(t.title)}</h3><div class="pRow">${icon('clock')}<span>${esc(whenText(i))}</span></div>${t.stationName?`<div class="pRow">${icon('train')}<span>${stChip(t.stationName)}</span></div>`:''}<div class="pRow">${icon('check')}<span>${t.done?'完了済み':'未完了'}・優先度 ${({high:'高',mid:'やや高',normal:'通常'})[t.priority||'normal']}</span></div></div><div class="peekActs">${t.stationName?`<button class="btn sm ghost" data-a="map">${icon('map')}地図</button>`:''}<button class="btn sm" data-a="done">${t.done?'未完了に戻す':'完了にする'}</button><button class="btn sm primary" data-a="edit">${icon('edit')}編集</button></div>`,anchor,{cls:'peek',onMount:el=>{el.style.setProperty('--c',i.color);$$('[data-a]',el).forEach(b=>b.onclick=()=>{closePop();if(b.dataset.a==='edit')openTaskEditor(t.id);if(b.dataset.a==='done'){toggleTaskDone(t.id)}if(b.dataset.a==='map')showStationOnMap(t.stationName)})}});return}
  const st=i.station?findStation(i.station):null;const c=category(i.categoryId);
  openPop(`<div class="peekBar" style="background:${c.color}"></div><div class="peekIn"><h3>${esc(i.title)}</h3>
    <div class="pRow">${icon('clock')}<span>${esc(whenText(i))}</span></div>
    ${i.rec?`<div class="pRow">${icon('repeat')}<span>${esc(recurText(state.events.find(e=>e.id===i.id)?.recur,state.events.find(e=>e.id===i.id)?.date))}${i.changed?'（この回は変更あり）':''}</span></div>`:''}
    ${i.location?`<div class="pRow">${icon('pin')}<span>${esc(i.location)}</span></div>`:''}
    ${st?`<div class="pRow">${icon('train')}<span style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">${stChip(st.name)}<button class="btn sm ghost" data-a="map">地図で表示</button>${isWindowsDesktop()?`<button class="btn sm ghost" data-a="folder">${icon('folder','i','width:14px;height:14px')}フォルダ</button>`:''}</span></div>`:''}
    <div class="pRow">${icon('tag')}<span><span style="display:inline-block;width:9px;height:9px;border-radius:2px;background:${c.color};margin-right:6px"></span>${esc(c.name)}${i.showAs&&i.showAs!=='busy'?'・'+SHOWAS[i.showAs]:''}</span></div>
    ${i.reminder!=null&&i.reminder!==''?`<div class="pRow">${icon('bell')}<span>${REMINDER_LABEL(i.reminder)}に通知</span></div>`:''}
    ${i.note?`<div class="pRow">${icon('list')}<span class="note">${esc(i.note)}</span></div>`:''}
  </div><div class="peekActs"><button class="btn sm ghost danger" data-a="del">${icon('trash')}削除</button><button class="btn sm ghost" data-a="dup">${icon('copy')}複製</button><button class="btn sm primary" data-a="edit">${icon('edit')}編集</button></div>`,anchor,{cls:'peek',onMount:el=>$$('[data-a]',el).forEach(b=>b.onclick=()=>{closePop();const a=b.dataset.a;if(a==='edit')editOccurrence(i);if(a==='del')deleteOccurrence(i);if(a==='dup')duplicateOccurrence(i);if(a==='map')showStationOnMap(st.name);if(a==='folder')openLocalFolder(st.current||st.folderId)})});
}
function findItemByKey(key){if(key.startsWith('task:')){const t=state.tasks.find(x=>'task:'+x.id===key);return t?taskItems(t.date,t.date).find(x=>x.id===t.id):null}const [id,orig]=key.split('::');const e=state.events.find(x=>x.id===id);if(!e)return null;const occ=expandEvent(e,orig||e.date,addDays(orig||e.date,400)).find(o=>o.key===key)||expandEvent(e,addDays(orig||e.date,-400),addDays(orig||e.date,400)).find(o=>o.key===key);return occ?Object.assign(occ,{kind:'event',color:category(occ.categoryId).color}):null}
function markSelected(){$$('#calBody .selected').forEach(x=>x.classList.remove('selected'));if(cal.sel)$$(`#calBody [data-key="${CSS.escape(cal.sel)}"]`).forEach(x=>x.classList.add('selected'))}

/* ---------- 変更操作 ---------- */
function snapshot(){const s=JSON.stringify(state.events),t=JSON.stringify(state.tasks);return ()=>{state.events=JSON.parse(s);state.tasks=JSON.parse(t);commit()}}
async function editOccurrence(i){
  const e=state.events.find(x=>x.id===i.id);if(!e)return;
  if(!i.rec){openEventEditor({event:e});return}
  const c=await choiceBox('繰り返しの予定','どちらを編集しますか？',[{label:'この回のみ',value:'one'},{label:'すべての回',value:'all'}]);if(!c)return;
  if(c==='one')openEventEditor({event:e,occ:i});else openEventEditor({event:e});
}
async function deleteOccurrence(i){
  const e=state.events.find(x=>x.id===i.id);if(!e)return;const undo=snapshot();
  if(!i.rec){state.events=state.events.filter(x=>x!==e);commit();toast(`「${e.title}」を削除しました`,{label:'元に戻す',run:undo});return}
  const c=await choiceBox('繰り返しの予定を削除',`「${e.title}」のどの回を削除しますか？`,[{label:'この回のみ',value:'one'},{label:'この回以降',value:'after'},{label:'すべて',value:'all'}]);if(!c)return;
  if(c==='one'){e.exdates=[...new Set([...(e.exdates||[]),i.orig])];if(e.overrides)delete e.overrides[i.orig]}
  else if(c==='after'){if(i.orig<=e.date)state.events=state.events.filter(x=>x!==e);else{e.recur.until=addDays(i.orig,-1);e.recur.count=0}}
  else state.events=state.events.filter(x=>x!==e);
  commit();toast('削除しました',{label:'元に戻す',run:undo});
}
function duplicateOccurrence(i){const e=state.events.find(x=>x.id===i.id);const copy=Object.assign(clone(e),{id:uid('e'),date:i.date,endDate:i.endDate,start:i.start,end:i.end,allDay:i.allDay,title:i.title+'（コピー）',recur:null,exdates:[],overrides:undefined});openEventEditor({event:copy,isNew:true})}
function applyTimeChange(i,ch){
  if(i.kind==='task'){const t=state.tasks.find(x=>x.id===i.id);if(!t)return;const undo=snapshot();t.date=ch.date;if(ch.start!==undefined)t.time=ch.allDay?'':ch.start;commit();toast('タスクの期日を変更しました',{label:'元に戻す',run:undo});return}
  const e=state.events.find(x=>x.id===i.id);if(!e)return;const undo=snapshot();
  if(!i.rec){Object.assign(e,ch);commit();toast(ch.date?'予定を移動しました':'時間を変更しました',{label:'元に戻す',run:undo});return}
  e.overrides=e.overrides||{};e.overrides[i.orig]=Object.assign({},e.overrides[i.orig]||{},{date:i.date,endDate:i.endDate,start:i.start,end:i.end,allDay:i.allDay},ch);commit();toast('この回のみ変更しました（シリーズ全体は「編集」から）',{label:'元に戻す',run:undo});
}

/* ---------- 新規作成（クイック） ---------- */
function quickCreate(def,anchor,pt){
  const cats=state.categories;const defCat=[...visibleCats()][0]||cats[0].id;const when=def.allDay?(def.date===def.endDate?fmtYMDW(def.date)+' 終日':`${fmtMDW(def.date)} 〜 ${fmtMDW(def.endDate)} 終日`):`${fmtYMDW(def.date)} ${def.start} 〜 ${def.end}`;
  openPop(`<form class="quickF" autocomplete="off"><input class="input titleInput" name="title" placeholder="予定のタイトル" style="font-size:15px!important;height:38px!important"><div class="when">${icon('clock','i','width:15px;height:15px')}${esc(when)}</div><div class="grid2" style="gap:8px"><select class="input" name="cat">${cats.map(c=>`<option value="${c.id}" ${c.id===defCat?'selected':''}>${esc(c.name)}</option>`).join('')}</select><input class="input" name="station" list="stationList" placeholder="駅ラベル（任意）"></div><div class="row" style="margin-top:12px"><button class="btn ghost" type="button" data-more>詳細オプション</button><button class="btn primary" type="submit">保存</button></div></form>`,anchor,{cls:'quick',x:pt?.x,y:pt?.y,onMount:el=>{ensureStationDatalist();const f=el.querySelector('form');setTimeout(()=>f.title.focus(),20);
    const collectDef=()=>Object.assign({},def,{title:f.title.value.trim(),categoryId:f.cat.value,station:findStation(f.station.value)?.name||''});
    f.onsubmit=ev=>{ev.preventDefault();const d=collectDef();if(!d.title){f.title.focus();return}const e=newEventFrom(d);state.events.push(e);commit();closePop();toast(`「${e.title}」を追加しました`)};
    el.querySelector('[data-more]').onclick=()=>{const d=collectDef();closePop();openEventEditor({event:newEventFrom(d),isNew:true})}}});
}
function newEventFrom(d){const cs=calSettings();return {id:uid('e'),title:d.title||'',date:d.date,endDate:d.endDate||d.date,start:d.allDay?'':d.start,end:d.allDay?'':d.end,allDay:!!d.allDay,categoryId:d.categoryId||[...visibleCats()][0]||state.categories[0].id,station:d.station||'',location:d.location||'',note:d.note||'',showAs:d.allDay?'free':'busy',reminder:d.allDay?null:(cs.defaultReminder??null),recur:null,exdates:[]}}
function newEventDefaults(date=cal.anchor){const now=new Date();const cs=calSettings();let s=date===todayISO()?Math.ceil((nowMin()+1)/30)*30:toMin(cs.workStart)||540;if(s>=1440-30)s=toMin(cs.workStart)||540;const dur=cs.defaultDuration||60;return {date,endDate:date,start:fromMin(s),end:fromMin(Math.min(s+dur,1439)),allDay:false}}
function ensureStationDatalist(){if($('stationList'))return;const dl=document.createElement('datalist');dl.id='stationList';dl.innerHTML=STATIONS.slice().sort((a,b)=>a.line.localeCompare(b.line)||a.no.localeCompare(b.no)).map(s=>`<option value="${esc(s.name)}">${esc(s.line)} ${LINE_SHORT[s.line]}${s.no}</option>`).join('');document.body.appendChild(dl)}

/* ---------- ポインター操作（選択・作成・移動・リサイズ） ---------- */
let drag=null;
function minuteAt(col,clientY){const r=col.getBoundingClientRect();const m=(clientY-r.top)/hh()*60;return Math.max(0,Math.min(1440,m))}
function colAt(x,y){return document.elementsFromPoint(x,y).find(el=>el.classList&&el.classList.contains('tgCol'))||null}
function dateCellAt(x,y){return document.elementsFromPoint(x,y).find(el=>el.matches&&el.matches('.mvCell,.tgAll .cell'))||null}
function snap(m){return Math.round(m/SNAP)*SNAP}
function wireCalendarPointer(){
  const body=$('calBody');
  body.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;const t=e.target;
    const go=t.closest('[data-goto]');if(go){return}
    const evEl=t.closest('.ev,.bar,.mi');
    if(evEl&&evEl.dataset.key){const it=cal.items.get(evEl.dataset.key);if(!it)return;
      if(it.kind==='event'||it.kind==='task'){drag={type:t.classList.contains('rz')?'resize':'move',el:evEl,item:it,x0:e.clientX,y0:e.clientY,moved:false,pointerId:e.pointerId,
        grid:!!evEl.closest('.tgCol'),startCol:evEl.closest('.tgCol'),startMin:evEl.closest('.tgCol')?minuteAt(evEl.closest('.tgCol'),e.clientY):0,startCell:dateCellAt(e.clientX,e.clientY)};if(e.pointerType!=='mouse')drag.touch=true}
      return}
    const col=t.closest('.tgCol');
    if(col&&!t.closest('.ev')){const m=snap(minuteAt(col,e.clientY)-SNAP/2);drag={type:'create',col,m0:m,m1:m+30,x0:e.clientX,y0:e.clientY,moved:false,touch:e.pointerType!=='mouse'};if(!drag.touch){e.preventDefault()}return}
    const cell=t.closest('.mvCell,.tgAll .cell');
    if(cell&&!t.closest('.mi,.bar,.more')){drag={type:'createDay',d0:cell.dataset.date,d1:cell.dataset.date,x0:e.clientX,y0:e.clientY,moved:false,touch:e.pointerType!=='mouse'};}
  });
  window.addEventListener('pointermove',e=>{
    if(!drag)return;const dx=e.clientX-drag.x0,dy=e.clientY-drag.y0;
    if(!drag.moved&&Math.hypot(dx,dy)<5)return;
    if(drag.touch&&!drag.moved&&drag.type!=='resize'){drag=null;return}/* タッチはスクロールを優先 */
    drag.moved=true;
    if(drag.type==='create'){const m=snap(minuteAt(drag.col,e.clientY));drag.m1=m;const a=Math.min(drag.m0,m),b=Math.max(drag.m0+SNAP,m);let s=drag.col.querySelector('.dragSel');if(!s){s=document.createElement('div');s.className='dragSel';drag.col.appendChild(s)}s.style.top=a/60*hh()+'px';s.style.height=(b-a)/60*hh()+'px';s.textContent=`${fromMin(a)} – ${fromMin(b)}`;return}
    if(drag.type==='createDay'){const c=dateCellAt(e.clientX,e.clientY);if(c&&c.dataset.date){drag.d1=c.dataset.date;$$('#calBody .drop').forEach(x=>x.classList.remove('drop'));const [a,b]=[drag.d0,drag.d1].sort();$$('#calBody .mvCell,#calBody .tgAll .cell').forEach(x=>{if(x.dataset.date>=a&&x.dataset.date<=b)x.classList.add('drop')})}return}
    if(drag.type==='resize'){const col=drag.startCol;const s=toMin(drag.item.start);const e0=toMin(drag.item.end)??s+30;const m=e0+snap(minuteAt(col,e.clientY)-drag.startMin);drag.newEnd=Math.max(s+SNAP,Math.min(1440,m));drag.el.style.height=((drag.newEnd-s)/60*hh()-2)+'px';drag.el.querySelector('.m').textContent=`${drag.item.start}–${fromMin(drag.newEnd)}`;return}
    if(drag.type==='move'){
      if(!drag.ghost){drag.el.classList.add('dragging');const g=document.createElement('div');g.className='dragGhost';document.body.appendChild(g);g.style.position='fixed';drag.ghost=g}
      const g=drag.ghost;
      if(drag.grid){const col=colAt(e.clientX,e.clientY);if(col){const it=drag.item;const dur=Math.max(SNAP,(toMin(it.end)??toMin(it.start)+30)-(toMin(it.start)||0));const off=drag.startMin-(toMin(it.start)||0);let s=snap(minuteAt(col,e.clientY)-off);s=Math.max(0,Math.min(1440-dur,s));drag.target={date:col.dataset.date,s,e:s+dur};const r=col.getBoundingClientRect();g.style.left=r.left+2+'px';g.style.width=r.width-6+'px';g.style.top=r.top+s/60*hh()+'px';g.style.height=dur/60*hh()-2+'px';g.textContent=`${fromMin(s)} – ${fromMin(s+dur)}`;g.style.display='block'}else{const c=dateCellAt(e.clientX,e.clientY);if(c&&c.closest('.tgAll')){drag.target={date:c.dataset.date,allDay:true};const r=c.getBoundingClientRect();Object.assign(g.style,{left:r.left+2+'px',width:r.width-4+'px',top:r.top+2+'px',height:'22px',display:'block'});g.textContent='終日'}}}
      else{const c=dateCellAt(e.clientX,e.clientY);if(c&&c.dataset.date){const it=drag.item;const grabbed=drag.startCell?.dataset.date||it.date;const delta=diffDays(grabbed,c.dataset.date);drag.target={delta,date:c.dataset.date};const r=c.getBoundingClientRect();Object.assign(g.style,{left:r.left+2+'px',width:r.width-4+'px',top:(c.classList.contains('mvCell')?r.top+26:r.top+2)+'px',height:'22px',display:'block'});g.textContent=it.title}}
    }
  });
  window.addEventListener('pointerup',e=>{
    if(!drag)return;const d=drag;drag=null;
    if(d.ghost)d.ghost.remove();d.el?.classList.remove('dragging');$$('#calBody .drop').forEach(x=>x.classList.remove('drop'));
    if(d.type==='create'){d.col.querySelector('.dragSel')?.remove();let a=Math.min(d.m0,d.m1),b=Math.max(d.m0,d.m1);if(!d.moved){a=d.m0;b=d.m0+30}if(b-a<SNAP)b=a+SNAP;a=Math.max(0,a);b=Math.min(1439,b);const date=d.col.dataset.date;quickCreate({date,endDate:date,start:fromMin(a),end:fromMin(b),allDay:false},null,{x:e.clientX,y:e.clientY});return}
    if(d.type==='createDay'){const [a,b]=[d.d0,d.d1].sort();quickCreate({date:a,endDate:b,allDay:true},null,{x:e.clientX,y:e.clientY});return}
    if(!d.moved){openPeek(d.item.key,d.el);return}
    const it=d.item;
    if(d.type==='resize'&&d.newEnd!=null){applyTimeChange(it,{end:fromMin(Math.min(d.newEnd,1439))});return}
    if(d.type==='move'&&d.target){
      if(d.grid&&d.target.allDay){applyTimeChange(it,{date:d.target.date,endDate:d.target.date,allDay:true,start:'',end:''});return}
      if(d.grid){applyTimeChange(it,{date:d.target.date,endDate:d.target.date,start:fromMin(d.target.s),end:fromMin(Math.min(d.target.e,1439)),allDay:false});return}
      if(d.target.delta){applyTimeChange(it,{date:addDays(it.date,d.target.delta),endDate:addDays(it.endDate||it.date,d.target.delta)})}
    }
  });
  window.addEventListener('pointercancel',()=>{if(drag?.ghost)drag.ghost.remove();drag?.el?.classList.remove('dragging');drag=null});
  body.addEventListener('click',e=>{const go=e.target.closest('[data-goto]');if(go){cal.anchor=go.dataset.goto;cal.view='day';if(cal.query){cal.query='';$('calSearch').value=''}renderCalendar();return}
    const li=e.target.closest('.lvItem');if(li){openPeek(li.dataset.key,li)}});
  body.addEventListener('dblclick',e=>{const el=e.target.closest('[data-key]');if(!el)return;closePop();const it=cal.items.get(el.dataset.key);if(!it)return;if(it.kind==='task')openTaskEditor(it.id);else editOccurrence(it)});
}

/* ---------- キーボード ---------- */
function calendarKeys(e){
  if(e.ctrlKey||e.metaKey||e.altKey)return false;const k=e.key;
  const map={t:()=>calNav(0),T:()=>calNav(0),ArrowLeft:()=>calNav(-1),ArrowRight:()=>calNav(1),j:()=>calNav(1),k:()=>calNav(-1),d:()=>setCalView('day'),r:()=>setCalView('workweek'),w:()=>setCalView('week'),m:()=>setCalView('month'),a:()=>setCalView('list'),n:()=>openEventEditor({event:newEventFrom(newEventDefaults(cal.view==='month'?todayISO():cal.anchor)),isNew:true}),'/':()=>$('calSearch').focus()};
  if(map[k]){e.preventDefault();map[k]();return true}
  if((k==='Delete'||k==='Backspace')&&cal.sel){const it=cal.items.get(cal.sel);if(it){e.preventDefault();if(it.kind==='task'){deleteTask(it.id)}else deleteOccurrence(it)}return true}
  if(k==='Enter'&&cal.sel){const el=document.querySelector(`#calBody [data-key="${CSS.escape(cal.sel)}"]`);if(el){openPeek(cal.sel,el);return true}}
  return false;
}

/* ---------- 通知 ---------- */
let reminderTimer=null;
function checkReminders(){
  const now=Date.now();const fired=loadJSON(FIRED_KEY,{});const from=addDays(todayISO(),-1),to=addDays(todayISO(),8);
  occurrencesBetween(from,to).forEach(o=>{if(o.reminder==null||o.reminder==='')return;const st=occStart(o).getTime();const at=(fired['snooze:'+o.key])||st-(+o.reminder)*60000;const id=o.key+'@'+st;
    if(at<=now&&st>now-30*60000&&!fired[id]){fired[id]=now;delete fired['snooze:'+o.key];showReminder(o)}});
  Object.keys(fired).forEach(k=>{if(!k.startsWith('snooze:')&&now-fired[k]>14*864e5)delete fired[k]});saveJSON(FIRED_KEY,fired);
}
function showReminder(o){
  const c=category(o.categoryId).color;const box=$('reminders');const el=document.createElement('div');el.className='rem';el.style.setProperty('--c',c);
  const mins=Math.round((occStart(o)-Date.now())/60000);const rel=mins>0?`あと${mins<60?mins+'分':Math.round(mins/60)+'時間'}で開始`:'開始時刻です';
  el.innerHTML=`<b>${esc(o.title)}</b><small>${esc(whenText(o))}・${rel}</small>${o.station||o.location?`<small>${esc([o.station?o.station+'駅':'',o.location].filter(Boolean).join(' / '))}</small>`:''}<div class="row"><button class="btn sm ghost" data-s>5分後に再通知</button><button class="btn sm ghost" data-o>開く</button><button class="btn sm primary" data-x>閉じる</button></div>`;
  box.appendChild(el);
  el.querySelector('[data-x]').onclick=()=>el.remove();
  el.querySelector('[data-o]').onclick=()=>{el.remove();location.hash='#calendar';cal.anchor=o.date;cal.view=cal.view==='list'?'day':cal.view;renderCalendar()};
  el.querySelector('[data-s]').onclick=()=>{const f=loadJSON(FIRED_KEY,{});f['snooze:'+o.key]=Date.now()+5*60000;delete f[o.key+'@'+occStart(o).getTime()];saveJSON(FIRED_KEY,f);el.remove()};
  osNotify(o,whenText(o)+'\n'+rel);
}
/* OSの通知として表示。Service Worker 経由を優先する（iPhoneのホーム画面アプリ・Androidでは new Notification が使えないため）。
   失敗したら従来の new Notification。どちらも許可済みのときだけ。アプリを閉じている間は届かない（Web Pushは未対応） */
async function osNotify(o,body){
  if(!('Notification'in window)||Notification.permission!=='granted')return false;
  const opt={body,icon:'./icons/icon-192.png',badge:'./icons/icon-64.png',tag:o.key,renotify:true,data:{date:o.date,key:o.key}};
  try{
    const reg=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();
    if(reg&&reg.showNotification){await reg.showNotification(o.title,opt);return true}
  }catch(e){}
  try{const n=new Notification(o.title,opt);n.onclick=()=>{window.focus();n.close()};return true}catch(e){}
  return false;
}
function testNotify(){return osNotify({title:'テスト通知',key:'test-'+Date.now(),date:todayISO()},'この通知が見えれば、予定の通知も届きます')}
function startReminders(){clearInterval(reminderTimer);checkReminders();reminderTimer=setInterval(()=>{checkReminders();updateNowLine()},30000)}
function askNotifyPermission(){try{if('Notification'in window&&Notification.permission==='default')Notification.requestPermission()}catch(e){}}

/* ---------- 初期化 ---------- */
function initCalendar(){
  cal.view=localCfg.calView||'week';if(!['day','workweek','week','month','list'].includes(cal.view))cal.view='week';if(innerWidth<=820&&(cal.view==='week'||cal.view==='workweek'))cal.view='day';
  $$('#calViews button').forEach(b=>b.onclick=()=>setCalView(b.dataset.v));
  $('calPrev').onclick=()=>calNav(-1);$('calNext').onclick=()=>calNav(1);$('calToday').onclick=()=>calNav(0);
  $('calNew').onclick=()=>openEventEditor({event:newEventFrom(newEventDefaults(cal.view==='month'||cal.view==='list'?todayISO():cal.anchor)),isNew:true});
  $('calSideBtn').onclick=()=>{if(innerWidth<=1100){document.body.classList.toggle('calSideOpenM')}else{localCfg.calSide=!localCfg.calSide;saveLocal();document.body.classList.toggle('calSideClosed',!localCfg.calSide);renderCalendar()}};
  document.body.classList.toggle('calSideClosed',localCfg.calSide===false);
  $('catAllBtn').onclick=()=>{setHiddenCats([]);renderCalendar()};
  $('togTasks').onclick=e=>{e.preventDefault();calSettings().showTasks=!calSettings().showTasks;commit()};
  $('togHol').onclick=e=>{e.preventDefault();calSettings().showHolidays=!calSettings().showHolidays;commit()};
  let qT;$('calSearch').oninput=e=>{clearTimeout(qT);qT=setTimeout(()=>{const q=e.target.value.trim();if(q&&!cal.query)cal.prevView=cal.view;cal.query=q;if(!q&&cal.prevView){cal.view=cal.prevView;cal.prevView=null}renderCalendar()},180)};
  $('calSearch').onkeydown=e=>{if(e.key==='Escape'){e.target.value='';cal.query='';if(cal.prevView){cal.view=cal.prevView;cal.prevView=null}renderCalendar();e.target.blur()}};
  $('calMore').onclick=e=>menu([
    {label:'ICSファイルを読み込む（Outlookなど）',icon:'ul',run:()=>$('fileIcs').click()},
    {label:'表示中の期間をICSで書き出す',icon:'dl',run:()=>exportIcs('range')},
    {label:'すべての予定をICSで書き出す',icon:'dl',run:()=>exportIcs('all')},'-',
    {label:'印刷',icon:'print',run:()=>window.print()},
    {label:'カレンダーの設定',icon:'cog',run:()=>openSettings('calendar')},
    {label:'キーボードショートカット',icon:'key',run:showShortcuts}],e.currentTarget);
  wireCalendarPointer();
  let rT;window.addEventListener('resize',()=>{clearTimeout(rT);rT=setTimeout(()=>{if(cal.view==='month'&&currentRoute()==='calendar')renderCalendar()},150)});
  startReminders();
}
function showShortcuts(){openModal(`<div class="mHead"><h2>キーボードショートカット</h2><button class="btn ghost icon" data-close aria-label="閉じる">${icon('x')}</button></div><div class="mBody"><div class="grid2" style="font-size:13.5px;line-height:2.2">
  <div><b>全体</b><br><kbd>Ctrl</kbd>+<kbd>K</kbd> 検索・移動<br><kbd>G</kbd> → <kbd>H</kbd>/<kbd>C</kbd>/<kbd>M</kbd> ホーム/カレンダー/マップ<br><kbd>Esc</kbd> 閉じる</div>
  <div><b>カレンダー</b><br><kbd>N</kbd> 新しい予定　<kbd>T</kbd> 今日<br><kbd>←</kbd><kbd>→</kbd> 前/次　<kbd>/</kbd> 検索<br><kbd>D</kbd> 日 <kbd>R</kbd> 稼働日 <kbd>W</kbd> 週 <kbd>M</kbd> 月 <kbd>A</kbd> 一覧<br><kbd>Enter</kbd> 詳細　<kbd>Delete</kbd> 削除<br>ダブルクリックで編集</div></div></div>`)}
