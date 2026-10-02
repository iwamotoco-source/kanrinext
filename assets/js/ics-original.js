/* =========================================================
   ics.js — iCalendar (.ics) の読み込み・書き出し
   Outlook / Google カレンダー / iPhone と予定をやり取りするため
   ========================================================= */
'use strict';
const ICS_DAYS=['SU','MO','TU','WE','TH','FR','SA'];
function icsEsc(s){return String(s||'').replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\r?\n/g,'\\n')}
function icsFold(line){const out=[];let cur='';let bytes=0;for(const ch of line){const b=new TextEncoder().encode(ch).length;if(bytes+b>73){out.push(cur);cur=' ';bytes=1}cur+=ch;bytes+=b}out.push(cur);return out.join('\r\n')}
function icsDate(d){return d.replace(/-/g,'')}
function icsDT(d,t){return icsDate(d)+'T'+t.replace(':','')+'00'}
function rruleOf(e){const r=e.recur;if(!r)return '';const p=['FREQ='+r.freq.toUpperCase()];if(+r.interval>1)p.push('INTERVAL='+r.interval);
  if(r.freq==='weekly')p.push('BYDAY='+(r.byDay&&r.byDay.length?r.byDay:[dowOf(e.date)]).map(d=>ICS_DAYS[d]).join(','));
  if(r.freq==='monthly'){if(r.monthMode==='nth'){const n=r.nth||nthOfDate(e.date).nth;p.push('BYDAY='+(n===-1?'-1':n)+ICS_DAYS[r.weekday??dowOf(e.date)])}else p.push('BYMONTHDAY='+parseISO(e.date).getDate())}
  if(r.until)p.push('UNTIL='+icsDate(r.until)+(evAllDay(e)?'':'T235959'));else if(+r.count)p.push('COUNT='+r.count);
  return 'RRULE:'+p.join(';')}
function veventLines(e,uidv,stamp,recId){
  const L=['BEGIN:VEVENT','UID:'+uidv,'DTSTAMP:'+stamp];const ad=evAllDay(e);
  if(recId)L.push(ad?'RECURRENCE-ID;VALUE=DATE:'+icsDate(recId):'RECURRENCE-ID;TZID=Asia/Tokyo:'+icsDT(recId,(state.events.find(x=>x.id===e.id)||e).start||'00:00'));
  if(ad){L.push('DTSTART;VALUE=DATE:'+icsDate(e.date));L.push('DTEND;VALUE=DATE:'+icsDate(addDays(e.endDate||e.date,1)))}
  else{L.push('DTSTART;TZID=Asia/Tokyo:'+icsDT(e.date,e.start));L.push('DTEND;TZID=Asia/Tokyo:'+icsDT(e.endDate||e.date,e.end||e.start))}
  L.push('SUMMARY:'+icsEsc(e.title));
  const loc=[e.station?e.station+'駅':'',e.location].filter(Boolean).join(' / ');if(loc)L.push('LOCATION:'+icsEsc(loc));
  if(e.note)L.push('DESCRIPTION:'+icsEsc(e.note));
  L.push('CATEGORIES:'+icsEsc(category(e.categoryId).name));
  if(e.station)L.push('X-KOUJI-STATION:'+icsEsc(e.station));
  L.push('TRANSP:'+(e.showAs==='free'?'TRANSPARENT':'OPAQUE'));
  if(e.showAs)L.push('X-MICROSOFT-CDO-BUSYSTATUS:'+({busy:'BUSY',free:'FREE',tentative:'TENTATIVE',oof:'OOF'})[e.showAs]);
  if(!recId){const rr=rruleOf(e);if(rr)L.push(rr);if(e.recur&&e.exdates?.length)e.exdates.forEach(x=>L.push(ad?'EXDATE;VALUE=DATE:'+icsDate(x):'EXDATE;TZID=Asia/Tokyo:'+icsDT(x,e.start)))}
  if(e.reminder!=null&&e.reminder!==''){L.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icsEsc(e.title),'TRIGGER:-PT'+(+e.reminder)+'M','END:VALARM')}
  L.push('END:VEVENT');return L;
}
function buildIcs(events){
  const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
  let L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//kouji-next//JA','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:工事管理next','X-WR-TIMEZONE:Asia/Tokyo',
    'BEGIN:VTIMEZONE','TZID:Asia/Tokyo','BEGIN:STANDARD','DTSTART:19390101T000000','TZOFFSETFROM:+0900','TZOFFSETTO:+0900','TZNAME:JST','END:STANDARD','END:VTIMEZONE'];
  events.forEach(e=>{const u=(e.icsUid||e.id)+'@kouji-next';L=L.concat(veventLines(e,u,stamp));if(e.recur&&e.overrides)Object.entries(e.overrides).forEach(([orig,o])=>{L=L.concat(veventLines(Object.assign({},e,o,{id:e.id,recur:null}),u,stamp,orig))})});
  L.push('END:VCALENDAR');return L.map(icsFold).join('\r\n')+'\r\n';
}
function exportIcs(mode){
  let evs=state.events;if(mode==='range'){const d=cal.days;evs=state.events.filter(e=>expandEvent(e,d[0],d[d.length-1]).length)}
  if(!evs.length){toast('書き出す予定がありません');return}
  downloadText(`kouji-next_${mode==='all'?'all':cal.days[0]}.ics`,buildIcs(evs),'text/calendar');toast(`${evs.length}件の予定をICSで書き出しました`);
}
/* ---- 読み込み ---- */
function icsUnesc(s){return s.replace(/\\n/gi,'\n').replace(/\\,/g,',').replace(/\\;/g,';').replace(/\\\\/g,'\\')}
function parseIcsDT(v,params){/* → {date,time|'' ,allDay} ローカル時刻(JST)に変換 */
  if(/VALUE=DATE(?!-)/.test(params)||/^\d{8}$/.test(v))return {date:`${v.slice(0,4)}-${v.slice(4,6)}-${v.slice(6,8)}`,time:'',allDay:true};
  const m=v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/);if(!m)return null;
  let d;if(m[7])d=new Date(Date.UTC(+m[1],m[2]-1,+m[3],+m[4],+m[5]));
  else{const tz=(params.match(/TZID=([^;:]+)/)||[])[1]||'';d=new Date(+m[1],m[2]-1,+m[3],+m[4],+m[5]);
    /* 日本以外のタイムゾーン指定は概算補正（Outlookの "Tokyo Standard Time" 等はそのまま） */
    const off={'UTC':0,'GMT':0,'Pacific Standard Time':-8,'Eastern Standard Time':-5,'America/New_York':-5,'America/Los_Angeles':-8,'Europe/London':0}[tz];if(off!==undefined){const utc=Date.UTC(+m[1],m[2]-1,+m[3],+m[4]-off,+m[5]);d=new Date(utc)}}
  return {date:iso(d),time:`${pad(d.getHours())}:${pad(d.getMinutes())}`,allDay:false};
}
function parseIcs(text){
  const lines=text.replace(/\r\n/g,'\n').replace(/\n[ \t]/g,'').split('\n');const out=[];let cur=null,inAlarm=false;
  for(const raw of lines){if(!raw)continue;const i=raw.indexOf(':');if(i<0)continue;const left=raw.slice(0,i),val=raw.slice(i+1);const name=left.split(';')[0].toUpperCase(),params=left.slice(name.length);
    if(name==='BEGIN'&&val==='VEVENT'){cur={props:{},exdates:[]};continue}if(!cur)continue;
    if(name==='BEGIN'&&val==='VALARM'){inAlarm=true;continue}if(name==='END'&&val==='VALARM'){inAlarm=false;continue}
    if(inAlarm){if(name==='TRIGGER'){const m=val.match(/-?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?/);if(m)cur.reminder=(+m[1]||0)*10080+(+m[2]||0)*1440+(+m[3]||0)*60+(+m[4]||0)}continue}
    if(name==='END'&&val==='VEVENT'){out.push(cur);cur=null;continue}
    if(name==='EXDATE'){val.split(',').forEach(x=>{const p=parseIcsDT(x.trim(),params);if(p)cur.exdates.push(p.date)});continue}
    cur.props[name]={val,params};}
  return out;
}
function importIcsText(text){
  const raw=parseIcs(text);if(!raw.length){toast('ICSファイルに予定が見つかりませんでした');return}
  const byUid=new Map(state.events.filter(e=>e.icsUid).map(e=>[e.icsUid,e]));let added=0,updated=0,skipped=0;const masters=new Map();const exceptions=[];
  raw.forEach(v=>{const P=v.props;const s=P.DTSTART&&parseIcsDT(P.DTSTART.val,P.DTSTART.params);if(!s){skipped++;return}
    let en=P.DTEND?parseIcsDT(P.DTEND.val,P.DTEND.params):null;
    if(!en&&P.DURATION){const m=P.DURATION.val.match(/P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?/);const mins=((+m?.[1]||0)*1440)+((+m?.[2]||0)*60)+(+m?.[3]||0);const d=parseISO(s.date);if(!s.allDay){const t=toMin(s.time);d.setHours(0,t+mins)}else d.setDate(d.getDate()+Math.max(1,mins/1440));en={date:iso(d),time:s.allDay?'':`${pad(d.getHours())}:${pad(d.getMinutes())}`,allDay:s.allDay}}
    if(!en)en=s.allDay?{date:addDays(s.date,1),time:'',allDay:true}:{date:s.date,time:fromMin(Math.min(toMin(s.time)+60,1439)),allDay:false};
    const ev={title:icsUnesc(P.SUMMARY?.val||'（件名なし）'),date:s.date,allDay:s.allDay,start:s.time,end:s.allDay?'':en.time,endDate:s.allDay?addDays(en.date,-1):en.date,location:icsUnesc(P.LOCATION?.val||''),note:icsUnesc(P.DESCRIPTION?.val||'').trim(),reminder:v.reminder??null,exdates:v.exdates};
    if(ev.endDate<ev.date)ev.endDate=ev.date;
    if(!s.allDay&&ev.endDate>ev.date&&en.time==='00:00'){ev.endDate=addDays(ev.endDate,-1);ev.end='23:59'}
    const st=P['X-KOUJI-STATION']?icsUnesc(P['X-KOUJI-STATION'].val):'';const stGuess=st||(()=>{const m=(ev.location+' '+ev.title).match(/([^\s\/／、,]+?)駅/);return m&&findStation(m[1])?findStation(m[1]).name:''})();ev.station=stGuess;
    if(st&&ev.location){ev.location=ev.location.replace(new RegExp('^'+st+'駅( / )?'),'')}
    const catName=P.CATEGORIES?icsUnesc(P.CATEGORIES.val).split(',')[0]:'';const c=state.categories.find(c=>c.name===catName);ev.categoryId=c?c.id:(state.categories.find(c=>c.id==='work')||state.categories[0]).id;
    const bs=(P['X-MICROSOFT-CDO-BUSYSTATUS']?.val||'').toUpperCase();ev.showAs=bs==='FREE'||P.TRANSP?.val==='TRANSPARENT'?'free':bs==='TENTATIVE'?'tentative':bs==='OOF'?'oof':'busy';
    if(P.RRULE){const R=Object.fromEntries(P.RRULE.val.split(';').map(x=>x.split('=')));const fr=(R.FREQ||'').toLowerCase();if(['daily','weekly','monthly','yearly'].includes(fr)){const rr={freq:fr,interval:+R.INTERVAL||1};
      if(R.BYDAY){const ds=R.BYDAY.split(',');if(fr==='weekly')rr.byDay=ds.map(x=>ICS_DAYS.indexOf(x.slice(-2))).filter(x=>x>=0);if(fr==='monthly'){const m=ds[0].match(/^(-?\d)?([A-Z]{2})$/);if(m){rr.monthMode='nth';rr.nth=+(m[1]||R.BYSETPOS||1);rr.weekday=ICS_DAYS.indexOf(m[2])}}}
      if(R.UNTIL){const u=parseIcsDT(R.UNTIL,R.UNTIL.length===8?'VALUE=DATE':'');if(u)rr.until=u.date}if(R.COUNT)rr.count=+R.COUNT;ev.recur=rr}}
    const u=P.UID?.val||'';
    if(P['RECURRENCE-ID']){const rid=parseIcsDT(P['RECURRENCE-ID'].val,P['RECURRENCE-ID'].params);exceptions.push({uid:u,orig:rid?.date,ev});return}
    ev.icsUid=u;const ex=u&&byUid.get(u);
    if(ex){Object.assign(ex,ev);updated++;masters.set(u,ex)}else{const ne=Object.assign({id:uid('e'),recur:null,exdates:[]},ev);if(!ev.recur)ne.recur=null;state.events.push(ne);if(u)byUid.set(u,ne);masters.set(u,ne);added++}
  });
  exceptions.forEach(x=>{const m=masters.get(x.uid)||byUid.get(x.uid);if(!m||!x.orig||!m.recur)return;m.overrides=m.overrides||{};const o=Object.assign({},x.ev);delete o.recur;delete o.exdates;delete o.icsUid;m.overrides[x.orig]=o});
  commit();toast(`ICSを読み込みました：追加${added}件${updated?`・更新${updated}件`:''}${skipped?`・読めなかった${skipped}件`:''}`);
}
