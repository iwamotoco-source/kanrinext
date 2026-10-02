/* =========================================================
   recur.js — 予定の展開（繰り返し・例外・個別変更）
   予定データ:
   {id,title,date,endDate,start,end,allDay,categoryId,station,location,note,showAs,reminder,
    recur:{freq:'daily'|'weekly'|'monthly'|'yearly',interval,byDay:[0-6],monthMode:'date'|'nth',nth,weekday,until,count},
    exdates:[元の日付], overrides:{元の日付:{変更フィールド}}}
   ========================================================= */
'use strict';
function evAllDay(e){return e.allDay===undefined?!e.start:!!e.allDay}
function evSpan(e){return Math.max(0,diffDays(e.date,e.endDate||e.date))}
function nthWeekdayOfMonth(y,m,nth,wd){/* m:0-11, nth:1..4 or -1(最終) */
  if(nth>0){const first=new Date(y,m,1).getDay();const d=1+((wd-first+7)%7)+(nth-1)*7;const last=new Date(y,m+1,0).getDate();return d<=last?d:null}
  const last=new Date(y,m+1,0);const d=last.getDate()-((last.getDay()-wd+7)%7);return d;
}
function nthOfDate(s){const d=parseISO(s);const n=Math.ceil(d.getDate()/7);const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();return {nth:n,isLast:d.getDate()+7>last,weekday:d.getDay()}}

/* 元の発生日（オリジナル日付）を順に生成 */
function* recurDates(e,limitTo){
  const r=e.recur;const start=e.date;const iv=Math.max(1,+r.interval||1);const until=r.until||'9999-12-31';const max=+r.count||0;let n=0,guard=0;
  const end=until<limitTo?until:limitTo;
  const emit=d=>{n++;return d};
  if(r.freq==='daily'){for(let d=start;d<=end&&guard<20000;d=addDays(d,iv),guard++){if(max&&n>=max)return;yield emit(d)}return}
  if(r.freq==='weekly'){
    const ws=calSettings().weekStart||0;const days=(r.byDay&&r.byDay.length?r.byDay:[dowOf(start)]).slice();const offs=days.map(d=>(d-ws+7)%7).sort((a,b)=>a-b);
    let wk=startOfWeek(start,ws);
    while(wk<=end&&guard<20000){for(const o of offs){const d=addDays(wk,o);if(d<start)continue;if(d>end)return;if(max&&n>=max)return;yield emit(d)}wk=addDays(wk,7*iv);guard++}return}
  if(r.freq==='monthly'){
    const s=parseISO(start);let y=s.getFullYear(),m=s.getMonth();const mode=r.monthMode||'date';const md=s.getDate();const nth=r.nth||nthOfDate(start).nth;const wd=r.weekday??s.getDay();
    while(guard<5000){const day=mode==='nth'?nthWeekdayOfMonth(y,m,nth,wd):(md<=new Date(y,m+1,0).getDate()?md:null);if(day){const d=`${y}-${pad(m+1)}-${pad(day)}`;if(d>end)return;if(d>=start){if(max&&n>=max)return;yield emit(d)}}m+=iv;y+=Math.floor(m/12);m%=12;guard++;if(`${y}-${pad(m+1)}-01`>end)return}return}
  if(r.freq==='yearly'){
    const s=parseISO(start);let y=s.getFullYear();const m=s.getMonth(),md=s.getDate();
    while(guard<300){if(md<=new Date(y,m+1,0).getDate()){const d=`${y}-${pad(m+1)}-${pad(md)}`;if(d>end)return;if(max&&n>=max)return;yield emit(d)}y+=iv;guard++}return}
}
/* from〜to（日付文字列, 両端含む）と重なる発生を返す */
function expandEvent(e,from,to){
  const out=[];const span=evSpan(e);
  if(!e.recur){const ed=e.endDate||e.date;if(e.date<=to&&ed>=from)out.push(Object.assign({},e,{orig:e.date,key:e.id,rec:false,allDay:evAllDay(e)}));return out}
  const ex=new Set(e.exdates||[]);const ov=e.overrides||{};const lim=addDays(to,45);const lo=addDays(from,-Math.max(span,45));
  for(const d of recurDates(e,lim)){
    if(ex.has(d))continue;if(d<lo&&!ov[d])continue;
    const base=Object.assign({},e,{date:d,endDate:addDays(d,span)});const o=ov[d];const inst=Object.assign(base,o||{},{orig:d,key:e.id+'::'+d,rec:true,changed:!!o,id:e.id});
    inst.allDay=evAllDay(inst);if(inst.date<=to&&(inst.endDate||inst.date)>=from)out.push(inst);
  }
  return out;
}
function occurrencesBetween(from,to,{cats=null,query=''}={}){
  const q=norm(query);let res=[];
  for(const e of state.events){if(cats&&!cats.has(e.categoryId))continue;for(const o of expandEvent(e,from,to)){if(cats&&!cats.has(o.categoryId))continue;if(q&&!norm([o.title,o.location,o.note,o.station,category(o.categoryId).name].join(' ')).includes(q))continue;res.push(o)}}
  res.sort((a,b)=>a.date.localeCompare(b.date)||(b.allDay-a.allDay)||(toMin(a.start)||0)-(toMin(b.start)||0)||a.title.localeCompare(b.title));
  return res;
}
/* 発生の開始/終了をDateで */
function occStart(o){const d=parseISO(o.date);if(!o.allDay&&o.start){const m=toMin(o.start);d.setHours(Math.floor(m/60),m%60)}return d}
function occEnd(o){const d=parseISO(o.endDate||o.date);if(o.allDay||!o.end){d.setDate(d.getDate()+1);return d}const m=toMin(o.end);d.setHours(Math.floor(m/60),m%60);return d}

/* 繰り返しの説明文 */
function recurText(r,date){
  if(!r)return '';const iv=Math.max(1,+r.interval||1);let t='';
  if(r.freq==='daily')t=iv===1?'毎日':`${iv}日ごと`;
  if(r.freq==='weekly'){const days=(r.byDay&&r.byDay.length?r.byDay:[dowOf(date)]).slice().sort((a,b)=>((a+6)%7)-((b+6)%7));const ds=days.length===5&&[1,2,3,4,5].every(x=>days.includes(x))?'平日':days.map(d=>WD[d]).join('・')+'曜日';t=(iv===1?'毎週 ':`${iv}週間ごと `)+ds}
  if(r.freq==='monthly'){const p=iv===1?'毎月 ':`${iv}か月ごと `;if(r.monthMode==='nth'){const n=r.nth||nthOfDate(date).nth;t=p+(n===-1?'最終':`第${n}`)+WD[r.weekday??dowOf(date)]+'曜日'}else t=p+parseISO(date).getDate()+'日'}
  if(r.freq==='yearly'){const d=parseISO(date);t=(iv===1?'毎年 ':`${iv}年ごと `)+`${d.getMonth()+1}月${d.getDate()}日`}
  if(r.until)t+=`（${fmtMD(r.until)}まで）`;else if(+r.count)t+=`（${r.count}回）`;
  return t;
}
