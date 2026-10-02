/* =========================================================
   event-editor.js — 予定の詳細編集（Outlookの予定フォーム相当）
   ========================================================= */
'use strict';
const REMINDER_OPTS=[['','なし'],['0','開始時刻'],['5','5分前'],['10','10分前'],['15','15分前'],['30','30分前'],['60','1時間前'],['120','2時間前'],['1440','1日前'],['2880','2日前'],['10080','1週間前']];
function recurPreset(r,date){
  if(!r)return 'none';const iv=+r.interval||1;
  if(r.freq==='daily'&&iv===1&&!r.until&&!+r.count)return 'daily';
  if(r.freq==='weekly'&&iv===1){const d=(r.byDay||[]).slice().sort().join();if(d==='1,2,3,4,5')return 'weekdays';if(!r.byDay||!r.byDay.length||(r.byDay.length===1&&r.byDay[0]===dowOf(date)))return 'weekly'}
  if(r.freq==='monthly'&&iv===1)return r.monthMode==='nth'?'monthlyNth':'monthly';
  if(r.freq==='yearly'&&iv===1)return 'yearly';
  return 'custom';
}
function openEventEditor({event,occ=null,isNew=false}){
  const scope=occ?'one':'all';
  const src=occ?Object.assign({},event,event.overrides?.[occ.orig]||{},{date:occ.date,endDate:occ.endDate}):event;
  const e=clone(src);e.allDay=evAllDay(e);if(!e.endDate)e.endDate=e.date;
  if(e.allDay&&!e.start){const d=newEventDefaults(e.date);e._st=d.start;e._en=d.end}
  const r=e.recur?clone(e.recur):null;const nd=nthOfDate(e.date);
  const cats=state.categories;
  const html=`<div class="mHead"><h2>${isNew?'新しい予定':'予定の編集'}</h2><button class="btn ghost icon" type="button" data-close aria-label="閉じる">${icon('x')}</button></div>
  ${occ?`<div class="scopeBar">${icon('repeat')}<span>繰り返しのうち <b>${fmtMDW(occ.orig)}</b> の回だけを編集しています</span><button class="btn sm ghost" type="button" data-series style="margin-left:auto">シリーズ全体を編集</button></div>`:''}
  <form class="mBody" id="evForm" autocomplete="off">
    <div class="field"><input class="titleInput" name="title" placeholder="タイトルを追加" value="${esc(e.title)}" autofocus></div>
    <div class="grid2" style="margin-top:14px">
      <div class="field"><label>種別</label><select name="cat">${cats.map(c=>`<option value="${c.id}" ${c.id===e.categoryId?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div>
      <div class="field"><label>公開方法</label><select name="showAs">${Object.entries(SHOWAS).map(([k,v])=>`<option value="${k}" ${k===(e.showAs||'busy')?'selected':''}>${v}</option>`).join('')}</select></div>
    </div>
    <div style="margin:16px 0 8px" class="row"><label class="check"><input type="checkbox" name="allDay" ${e.allDay?'checked':''}>終日</label><span class="hint" id="evDur"></span></div>
    <div class="grid2">
      <div class="field"><label>開始</label><div class="row" style="flex-wrap:nowrap"><input type="date" name="date" value="${e.date}" required><input type="time" name="start" step="300" value="${e.start||e._st||''}" style="max-width:130px"></div></div>
      <div class="field"><label>終了</label><div class="row" style="flex-wrap:nowrap"><input type="date" name="endDate" value="${e.endDate}" required><input type="time" name="end" step="300" value="${e.end||e._en||''}" style="max-width:130px"></div></div>
    </div>
    ${occ?'':`<div class="grid2" style="margin-top:14px">
      <div class="field"><label>繰り返し</label><select name="preset" id="evPreset"></select></div>
      <div class="field"><label>通知</label><select name="reminder">${REMINDER_OPTS.map(([v,l])=>`<option value="${v}" ${String(e.reminder??'')===v?'selected':''}>${l}</option>`).join('')}</select></div>
    </div>
    <div class="recBox hidden" id="recBox" style="margin-top:10px">
      <div class="row"><span class="fieldLabel">間隔</span><input class="input" type="number" min="1" max="99" name="iv" value="${r?.interval||1}" style="width:72px"><select class="input" name="freq" style="width:auto"><option value="daily">日ごと</option><option value="weekly">週間ごと</option><option value="monthly">か月ごと</option><option value="yearly">年ごと</option></select></div>
      <div class="row" id="recDays"><span class="fieldLabel">曜日</span><div class="dayPick">${[1,2,3,4,5,6,0].map(d=>`<label><input type="checkbox" name="byDay" value="${d}"><span>${WD[d]}</span></label>`).join('')}</div></div>
      <div class="row" id="recMonth"><span class="fieldLabel">指定</span><label class="check"><input type="radio" name="mmode" value="date">毎月${parseISO(e.date).getDate()}日</label><label class="check"><input type="radio" name="mmode" value="nth">${nd.isLast&&nd.nth>=4?'最終':'第'+nd.nth}${WD[nd.weekday]}曜日</label></div>
      <div class="row"><span class="fieldLabel">終了</span><label class="check"><input type="radio" name="rend" value="never">なし</label><label class="check"><input type="radio" name="rend" value="until">日付</label><input class="input" type="date" name="until" value="${r?.until||addMonths(e.date,3)}" style="width:150px"><label class="check"><input type="radio" name="rend" value="count">回数</label><input class="input" type="number" min="1" max="999" name="count" value="${+r?.count||10}" style="width:72px"></div>
      <div class="hint" id="recSummary"></div>
    </div>`}
    ${occ?`<div class="grid2" style="margin-top:14px"><div class="field"><label>通知</label><select name="reminder">${REMINDER_OPTS.map(([v,l])=>`<option value="${v}" ${String(e.reminder??'')===v?'selected':''}>${l}</option>`).join('')}</select></div></div>`:''}
    <div class="grid2" style="margin-top:14px">
      <div class="field"><label>駅ラベル（地図・フォルダと連携）</label><input name="station" list="stationList" value="${esc(e.station||'')}" placeholder="駅名（ひらがな可）"><div id="evSt" style="min-height:22px"></div></div>
      <div class="field"><label>場所</label><input name="location" value="${esc(e.location||'')}" placeholder="会議室、現場住所など"></div>
    </div>
    <div class="field" style="margin-top:6px"><label>メモ</label><textarea name="note" placeholder="作業内容、持ち物、連絡先など">${esc(e.note||'')}</textarea></div>
  </form>
  <div class="mFoot">${isNew?'':`<button class="btn ghost danger" type="button" data-del>${icon('trash')}削除</button>`}<span class="grow"></span><button class="btn" type="button" data-close>キャンセル</button><button class="btn primary" type="button" data-save>保存</button></div>`;
  openModal(html,{wide:true,onMount:box=>{
    ensureStationDatalist();const f=box.querySelector('#evForm');
    const sync=()=>{const ad=f.allDay.checked;f.start.disabled=ad;f.end.disabled=ad;f.start.style.visibility=ad?'hidden':'';f.end.style.visibility=ad?'hidden':'';
      const s=parseISO(f.date.value),en=parseISO(f.endDate.value);let txt='';if(ad){const n=diffDays(f.date.value,f.endDate.value)+1;txt=n>1?`${n}日間`:''}else if(f.start.value&&f.end.value){let m=(en-s)/60000+toMin(f.end.value)-toMin(f.start.value);if(m>0)txt=m>=1440?`${Math.floor(m/1440)}日${m%1440?Math.round(m%1440/60*10)/10+'時間':''}`:m%60?`${Math.floor(m/60)?Math.floor(m/60)+'時間':''}${m%60}分`:`${m/60}時間`}
      $('evDur').textContent=txt;const st=findStation(f.station.value);$('evSt').innerHTML=f.station.value?(st?stChip(st.name):'<span class="hint">一致する駅がありません</span>'):'';};
    /* 開始を動かしたら所要時間を保って終了も移動（Outlookと同じ挙動） */
    let prevDate=f.date.value,prevStart=f.start.value;
    f.date.onchange=()=>{const d=diffDays(prevDate,f.date.value);if(f.endDate.value)f.endDate.value=addDays(f.endDate.value,d);prevDate=f.date.value;updRecLabels();sync()};
    f.start.onchange=()=>{if(prevStart&&f.start.value&&f.end.value){const d=toMin(f.start.value)-toMin(prevStart);let em=toMin(f.end.value)+d;let ed=f.endDate.value;while(em>=1440){em-=1440;ed=addDays(ed,1)}while(em<0){em+=1440;ed=addDays(ed,-1)}f.end.value=fromMin(em);f.endDate.value=ed<f.date.value?f.date.value:ed}prevStart=f.start.value;sync()};
    f.end.onchange=sync;f.endDate.onchange=sync;f.allDay.onchange=()=>{if(!f.allDay.checked&&!f.start.value){const d=newEventDefaults(f.date.value);f.start.value=d.start;f.end.value=d.end}sync()};f.station.oninput=sync;
    const updRecLabels=()=>{};
    if(!occ){
      const pre=$('evPreset');const d0=()=>dowOf(f.date.value);const n0=()=>nthOfDate(f.date.value);
      const fillPre=()=>{const dd=parseISO(f.date.value);const n=n0();const cur=pre.value;pre.innerHTML=[['none','なし'],['daily','毎日'],['weekdays','平日（月〜金）'],['weekly',`毎週 ${WD[d0()]}曜日`],['monthly',`毎月 ${dd.getDate()}日`],['monthlyNth',`毎月 ${n.isLast&&n.nth>=4?'最終':'第'+n.nth}${WD[n.weekday]}曜日`],['yearly',`毎年 ${dd.getMonth()+1}月${dd.getDate()}日`],['custom','ユーザー設定…']].map(([v,l])=>`<option value="${v}">${l}</option>`).join('');pre.value=cur||'none'};
      fillPre();pre.value=recurPreset(r,e.date);
      const box2=$('recBox');
      const setBox=(rr)=>{f.iv.value=rr.interval||1;f.freq.value=rr.freq;$$('[name=byDay]',f).forEach(c=>c.checked=(rr.byDay&&rr.byDay.length?rr.byDay:[d0()]).includes(+c.value));$$('[name=mmode]',f).forEach(c=>c.checked=c.value===(rr.monthMode||'date'));$$('[name=rend]',f).forEach(c=>c.checked=c.value===(rr.until?'until':+rr.count?'count':'never'))};
      const readBox=()=>{if(pre.value==='none')return null;const fr=f.freq.value;const rr={freq:fr,interval:Math.max(1,+f.iv.value||1)};if(fr==='weekly'){rr.byDay=$$('[name=byDay]:checked',f).map(c=>+c.value);if(!rr.byDay.length)rr.byDay=[d0()]}if(fr==='monthly'){rr.monthMode=($$('[name=mmode]:checked',f)[0]?.value)||'date';if(rr.monthMode==='nth'){const n=n0();rr.nth=n.isLast&&n.nth>=4?-1:n.nth;rr.weekday=n.weekday}}const re=($$('[name=rend]:checked',f)[0]?.value)||'never';if(re==='until')rr.until=f.until.value;if(re==='count')rr.count=Math.max(1,+f.count.value||1);return rr};
      const showParts=()=>{const fr=f.freq.value;$('recDays').classList.toggle('hidden',fr!=='weekly');$('recMonth').classList.toggle('hidden',fr!=='monthly');box2.classList.toggle('hidden',pre.value==='none');const rr=readBox();$('recSummary').textContent=rr?'→ '+recurText(rr,f.date.value):''};
      pre.onchange=()=>{const p=pre.value,n=n0();const base={daily:{freq:'daily'},weekdays:{freq:'weekly',byDay:[1,2,3,4,5]},weekly:{freq:'weekly',byDay:[d0()]},monthly:{freq:'monthly',monthMode:'date'},monthlyNth:{freq:'monthly',monthMode:'nth'},yearly:{freq:'yearly'},custom:readBox()||{freq:'weekly',byDay:[d0()]}}[p];if(base)setBox(Object.assign({interval:1},base));showParts()};
      setBox(r||{freq:'weekly',byDay:[d0()]});showParts();box2.addEventListener('change',()=>{if(pre.value!=='custom'&&pre.value!=='none'){const now=readBox();const p=recurPreset(now,f.date.value);pre.value=p}showParts()});
      f.date.addEventListener('change',()=>{const v=pre.value;fillPre();pre.value=v;if(v==='weekly')$$('[name=byDay]',f).forEach(c=>c.checked=+c.value===d0());showParts()});
      f.reminder.addEventListener('change',()=>{if(f.reminder.value!=='')askNotifyPermission()});
      box._readRecur=readBox;
    }
    sync();
    box.querySelector('[data-series]')?.addEventListener('click',()=>{closeModal();openEventEditor({event})});
    const save=()=>{
      const title=f.title.value.trim();if(!title){f.title.focus();f.title.style.borderColor='var(--danger)';toast('タイトルを入力してください');return}
      const ad=f.allDay.checked;let date=f.date.value,endDate=f.endDate.value||date,start=ad?'':f.start.value,end=ad?'':f.end.value;
      if(!date){toast('開始日を入力してください');return}
      if(endDate<date)endDate=date;if(!ad){if(!start)start='09:00';if(!end)end=fromMin(Math.min(toMin(start)+60,1439));if(endDate===date&&toMin(end)<=toMin(start)){end=fromMin(Math.min(toMin(start)+30,1439))}}
      const st=findStation(f.station.value);
      const fields={title,categoryId:f.cat.value,showAs:f.showAs.value,allDay:ad,date,endDate,start,end,station:st?st.name:'',location:f.location.value.trim(),note:f.note.value.trim(),reminder:f.reminder.value===''?null:+f.reminder.value};
      if(fields.reminder!=null)askNotifyPermission();
      if(occ){const ev=state.events.find(x=>x.id===event.id);ev.overrides=ev.overrides||{};ev.overrides[occ.orig]=fields;commit();closeModal();toast('この回の予定を保存しました');return}
      fields.recur=box._readRecur?box._readRecur():null;
      if(isNew){state.events.push(Object.assign({},event,fields,{exdates:[]}));commit();closeModal();toast(`「${title}」を保存しました`);return}
      const ev=state.events.find(x=>x.id===event.id);if(!ev){state.events.push(Object.assign({},event,fields));commit();closeModal();return}
      const dateShift=ev.recur&&fields.recur&&ev.date!==fields.date;Object.assign(ev,fields);if(dateShift){ev.overrides={};ev.exdates=[]}if(!ev.recur){delete ev.overrides;ev.exdates=[]}
      commit();closeModal();toast('予定を保存しました');
    };
    box.querySelector('[data-save]').onclick=save;f.onsubmit=ev=>{ev.preventDefault();save()};
    box.addEventListener('keydown',ev=>{if((ev.ctrlKey||ev.metaKey)&&ev.key==='Enter'){ev.preventDefault();save()}if(ev.key==='Enter'&&ev.target.name==='title'){ev.preventDefault();save()}});
    box.querySelector('[data-del]')?.addEventListener('click',()=>{closeModal();const inst=occ?Object.assign({},occ,{kind:'event'}):Object.assign({},event,{orig:event.date,rec:!!event.recur,kind:'event'});if(!event.recur){const undo=snapshot();state.events=state.events.filter(x=>x.id!==event.id);commit();toast(`「${event.title}」を削除しました`,{label:'元に戻す',run:undo})}else deleteOccurrence(inst)});
  }});
}
