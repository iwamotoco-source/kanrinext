/* =========================================================
   assistant-actions.js — AIが返す「操作候補」の検証・表示・実行
   原則: AI提案 → 内容確認(カード) → ユーザー承認(ボタン) → 実行。AIが勝手にデータを書き換えない。
   対応: 予定の追加/更新、タスクの追加/更新。
   ・AIの出力は信用せず、日付・時刻・駅・対象IDをすべてここで検証し直す
   ・推測(guess)は「推測」バッジと理由で明示
   ・既に同じ予定/タスクがあれば「重複の可能性」を表示し、初期選択から外す
   ・実行は1回の commit() にまとめ、「元に戻す」を提供
   ========================================================= */
'use strict';
(function(){
  const LABEL={'event.add':'予定を追加','event.update':'予定を更新','task.add':'タスクを追加','task.update':'タスクを更新'};
  const isoOk=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&iso(parseISO(s))===s;
  const timeOk=s=>typeof s==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(s);
  const s1=(v,n)=>v===null||v===undefined?'':String(v).trim().slice(0,n);
  const isEvent=t=>t.startsWith('event.'),isUpdate=t=>t.endsWith('.update');
  let seq=0;

  function workCategory(){return (state.categories.find(c=>c.id==='work')||state.categories[0]).id}
  function dupEvent(f){return state.events.some(e=>e.date===f.date&&norm(e.title)===norm(f.title))}
  function dupTask(f){return state.tasks.some(t=>!t.done&&norm(t.title)===norm(f.title)&&(taskDate(t)||'')===(f.date||''))}

  /* 生の候補 → 検証済みの提案。invalid が空文字でなければ実行不可。 */
  function validate(p){
    const f=p.fields,w=[];p.warnings=w;p.invalid='';p.dup=false;
    const upd=isUpdate(p.type),ev=isEvent(p.type);
    if(upd){
      const list=ev?state.events:state.tasks;
      const target=list.find(x=>String(x.id)===String(p.targetId));
      if(!target){p.invalid=`更新対象の${ev?'予定':'タスク'}が見つかりません（削除された可能性）`;return p}
      if(ev&&target.recur){p.invalid='繰り返し予定の変更は未対応です。カレンダーから手動で編集してください';return p}
      p.targetTitle=target.title;
      if(!p.before)p.before=ev?{title:target.title,date:target.date,endDate:target.endDate,start:target.start||'',end:target.end||'',allDay:evAllDay(target),station:target.station||'',location:target.location||'',note:target.note||''}
        :{title:target.title,date:taskDate(target)||'',time:target.time||'',priority:target.priority||'normal',station:target.stationName||'',note:target.note||'',done:!!target.done};
    }else if(!f.title){p.invalid='タイトルがありません';return p}

    if(f.date!==''&&!isoOk(f.date)){p.invalid=`日付「${f.date}」が不正です`;return p}
    if(!upd&&ev&&!f.date){p.invalid='日付がありません';return p}
    if(f.endDate!==''&&!isoOk(f.endDate)){f.endDate='';w.push('終了日が不正なため無視しました')}
    if(f.start!==''&&!timeOk(f.start)){w.push(`開始時刻「${f.start}」が不正なため無視しました`);f.start=''}
    if(f.end!==''&&!timeOk(f.end)){w.push(`終了時刻「${f.end}」が不正なため無視しました`);f.end=''}
    if(f.time!==''&&!timeOk(f.time)){w.push(`時刻「${f.time}」が不正なため無視しました`);f.time=''}
    if(f.station){const st=findStation(f.station);if(st)f.station=st.name;else{w.push(`駅「${f.station}」は小田急の駅名に一致しないため空にします`);f.station=''}}
    if(f.priority&&!['high','mid','normal'].includes(f.priority))f.priority='';

    if(ev&&!upd){
      if(!f.endDate||f.endDate<f.date)f.endDate=f.date;
      if(f.allDay||!f.start){f.allDay=true;f.start='';f.end=''}
      else{
        f.allDay=false;
        const dur=(typeof calSettings==='function'&&calSettings().defaultDuration)||60;
        if(!f.end||(f.endDate===f.date&&toMin(f.end)<=toMin(f.start)))f.end=fromMin(Math.min(toMin(f.start)+dur,24*60-1));
      }
      p.dup=dupEvent(f);
    }
    if(!ev&&!upd){if(!f.date)f.time='';p.dup=dupTask(f)}
    if(f.date&&Math.abs(diffDays(todayISO(),f.date))>366*2)w.push('今日から2年以上離れた日付です。年を確認してください');
    if(upd){
      const changed=Object.keys(f).filter(k=>f[k]!==''&&f[k]!==null&&f[k]!==undefined&&String(f[k])!==String(p.before[k]??''));
      if(!changed.length)p.invalid='変更内容がありません';
    }
    return p;
  }

  function normalize(rawList){
    const out=[];
    (Array.isArray(rawList)?rawList:[]).forEach(a=>{
      if(!a||!LABEL[a.type])return;
      const ev=isEvent(a.type);
      const f={title:s1(a.title,200),date:s1(a.date,10),endDate:s1(a.endDate,10),start:s1(a.start,5),end:s1(a.end,5),
        allDay:a.allDay===true?true:(a.allDay===false?false:null),station:s1(a.station,40),location:s1(a.location,200),note:s1(a.note,1000),
        priority:s1(a.priority,6),done:typeof a.done==='boolean'?a.done:null,time:''};
      if(!ev){f.time=f.start;f.start='';f.end='';f.endDate='';f.location=''}
      const p={pid:'p'+Date.now().toString(36)+(++seq),type:a.type,targetId:s1(a.targetId,80),fields:f,guess:!!a.guess,reason:s1(a.reason,300),
        status:'pending',checked:true,warnings:[],invalid:'',dup:false,before:null};
      validate(p);
      if(p.invalid||p.dup)p.checked=false;
      out.push(p);
    });
    return out;
  }
  /* 履歴から復元した提案の再検証（対象が消えた等） */
  function revalidate(list){list.forEach(p=>{if(p.status==='pending'){p.before=p.before||null;validate(p);if(p.invalid)p.checked=false}});return list}

  /* ---------- 実行 ---------- */
  function applyOne(p){
    const f=p.fields,ev=isEvent(p.type);
    const note=f.note+(p.guess&&p.reason?`${f.note?'\n':''}※AIの推測: ${p.reason}`:'');
    if(p.type==='event.add'){
      const e=newEventFrom({title:f.title,date:f.date,endDate:f.endDate,start:f.start,end:f.end,allDay:f.allDay,station:f.station,location:f.location,note,categoryId:workCategory()});
      state.events.push(e);return e.id;
    }
    if(p.type==='task.add'){
      const st=f.station?findStation(f.station):null;
      const t={id:uid('t'),title:f.title,stationName:st?st.name:'',stationId:st?st.folderId:'',priority:f.priority||'normal',date:f.date,time:f.date?f.time:'',note,done:false,created:Date.now()};
      state.tasks.push(t);return t.id;
    }
    if(p.type==='event.update'){
      const e=state.events.find(x=>String(x.id)===String(p.targetId));if(!e)throw new Error('対象が見つかりません');
      const oldDur=e.start&&e.end&&(e.endDate||e.date)===e.date?toMin(e.end)-toMin(e.start):60;
      if(f.title)e.title=f.title;
      if(f.date){const d=diffDays(e.date,f.date);e.endDate=addDays(e.endDate||e.date,d);e.date=f.date}
      if(f.endDate)e.endDate=f.endDate;
      if(f.start){e.start=f.start;e.allDay=false;e.end=f.end||fromMin(Math.min(toMin(f.start)+Math.max(15,oldDur),24*60-1))}
      else if(f.end&&e.start)e.end=f.end;
      if(f.allDay===true&&!f.start){e.allDay=true;e.start='';e.end=''}
      if(e.endDate<e.date)e.endDate=e.date;
      if(f.station)e.station=f.station;if(f.location)e.location=f.location;if(f.note)e.note=f.note;
      return e.id;
    }
    if(p.type==='task.update'){
      const t=state.tasks.find(x=>String(x.id)===String(p.targetId));if(!t)throw new Error('対象が見つかりません');
      if(f.title)t.title=f.title;
      if(f.date)t.date=f.date;
      if(f.time)t.time=f.time;
      if(f.priority)t.priority=f.priority;
      if(f.station){const st=findStation(f.station);if(st){t.stationName=st.name;t.stationId=st.folderId}}
      if(f.note)t.note=f.note;
      if(typeof f.done==='boolean'&&f.done!==!!t.done){t.done=f.done;t.doneAt=f.done?Date.now():null}
      return t.id;
    }
    throw new Error('未対応の操作です');
  }
  /* 選択された提案だけを実行。1回の commit() にまとめ、元に戻せる。 */
  function applyMany(list){
    const sel=list.filter(p=>p.status==='pending'&&p.checked&&!p.invalid);
    if(!sel.length)return {done:0,failed:0,undo:null};
    const undo=snapshot();let done=0,failed=0;
    sel.forEach(p=>{
      try{p.appliedId=applyOne(p);p.status='applied';p.checked=false;done++}
      catch(e){p.status='failed';p.invalid=e.message||'実行できませんでした';failed++}
    });
    if(done)commit();
    try{   /* アバターの状態通知（登録中 → 成功/失敗）。ローカル処理のみ */
      const av=window.KoujiAvatar;
      if(av){av.flash(sel.some(p=>isEvent(p.type))?'calendar':'task',700);setTimeout(()=>av.flash(done?'success':'error',done?2200:3000),700)}
    }catch(e){}
    return {done,failed,undo};
  }
  function summaryLabel(list){
    const sel=list.filter(p=>p.status==='pending'&&p.checked&&!p.invalid);
    const n=t=>sel.filter(p=>p.type===t).length;
    const parts={ea:n('event.add'),ta:n('task.add'),eu:n('event.update'),tu:n('task.update')};
    const kinds=Object.values(parts).filter(Boolean).length;
    if(!sel.length)return '';
    if(kinds===1){
      if(parts.ea)return `${parts.ea}件を予定に追加`;if(parts.ta)return `${parts.ta}件をタスクに追加`;
      if(parts.eu)return `予定${parts.eu}件を更新`;return `タスク${parts.tu}件を更新`;
    }
    return `${sel.length}件を実行`;
  }

  /* ---------- 表示 ---------- */
  const PRI={high:'優先度：高',mid:'優先度：やや高',normal:'優先度：通常'};
  function dateText(f){
    if(!f.date)return '日付なし';
    const base=fmtMD(f.date)+'（'+WD[dowOf(f.date)]+'）';
    const span=f.endDate&&f.endDate!==f.date?`〜${fmtMD(f.endDate)}`:'';
    return base+span;
  }
  function lineOf(p){
    const f=p.fields,bits=[];
    if(isEvent(p.type)){
      bits.push(dateText(f));
      bits.push(f.allDay||!f.start?'終日':`${f.start}${f.end?'–'+f.end:''}`);
    }else{
      bits.push(f.date?`期日 ${dateText(f)}${f.time?' '+f.time:''}`:'期日なし');
      if(f.priority&&f.priority!=='normal')bits.push(PRI[f.priority]);
    }
    return bits.join('　');
  }
  const FIELD_NAME={title:'タイトル',date:'日付',endDate:'終了日',start:'開始',end:'終了',time:'時刻',station:'駅',location:'場所',note:'メモ',priority:'優先度',done:'完了',allDay:'終日'};
  function diffLines(p){
    const f=p.fields,b=p.before||{},out=[];
    Object.keys(FIELD_NAME).forEach(k=>{
      if(f[k]===''||f[k]===null||f[k]===undefined)return;
      if(String(f[k])===String(b[k]??''))return;
      const show=v=>k==='priority'?(PRI[v]||v):k==='done'?(v?'完了':'未完了'):k==='allDay'?(v?'終日':'時間指定'):String(v===''||v===undefined?'（なし）':v);
      out.push(`${FIELD_NAME[k]}：${esc(show(b[k]??''))} → <b>${esc(show(f[k]))}</b>`);
    });
    return out;
  }

  function cardHtml(p){
    const f=p.fields,upd=isUpdate(p.type),ev=isEvent(p.type);
    const done=p.status==='applied',gone=p.status==='dismissed';
    const st=f.station?stChip(f.station):'';
    const badges=[
      `<span class="apType ${ev?'apEv':'apTk'}">${esc(LABEL[p.type])}</span>`,
      p.guess?'<span class="apBadge guess" title="資料から断定できず、AIが推測した項目を含みます">推測</span>':'',
      p.dup?'<span class="apBadge dup" title="同じ日付・同名の予定/タスクが既にあります">重複の可能性</span>':'',
      done?'<span class="apBadge ok">追加済み</span>':'',gone?'<span class="apBadge off">却下</span>':''
    ].join('');
    const title=upd?(f.title||p.targetTitle||''):f.title;
    const body=upd?`<div class="apDiff">${diffLines(p).map(x=>`<div>${x}</div>`).join('')||'<div class="hint">変更なし</div>'}</div>`
      :`<div class="apMeta">${esc(lineOf(p))}${st?` ${st}`:''}${f.location?` <span class="apLoc">${icon('pin','i','width:13px;height:13px;vertical-align:-2px')}${esc(f.location)}</span>`:''}</div>`;
    const warn=p.warnings.map(x=>`<div class="apWarn">${esc(x)}</div>`).join('');
    const reason=p.guess&&p.reason?`<div class="apReason">推測の根拠：${esc(p.reason)}</div>`:'';
    const note=!upd&&f.note?`<div class="apNote">${esc(f.note).replace(/\n/g,'<br>')}</div>`:'';
    const bad=p.invalid?`<div class="apErr">${esc(p.invalid)}</div>`:'';
    const canCheck=p.status==='pending'&&!p.invalid;
    return `<div class="apHead">
        <label class="apCheck"><input type="checkbox" data-ck ${p.checked&&canCheck?'checked':''} ${canCheck?'':'disabled'} aria-label="この候補を選択"></label>
        <div class="apMain"><div class="apTitle">${badges}<b>${esc(title)}</b></div>${body}${note}${reason}${warn}${bad}</div>
        ${canCheck&&!upd?`<button class="btn sm ghost" type="button" data-edit>${p._edit?'閉じる':'編集'}</button>`:''}
      </div>${p._edit?editHtml(p):''}`;
  }
  function editHtml(p){
    const f=p.fields,ev=isEvent(p.type);
    return `<div class="apEdit">
      <label>タイトル<input data-f="title" value="${esc(f.title)}"></label>
      <label>${ev?'日付':'期日'}<input type="date" data-f="date" value="${esc(f.date)}"></label>
      ${ev?`<label>開始<input type="time" data-f="start" step="300" value="${esc(f.start)}"></label><label>終了<input type="time" data-f="end" step="300" value="${esc(f.end)}"></label>`
        :`<label>時刻<input type="time" data-f="time" step="300" value="${esc(f.time)}"></label><label>優先度<select data-f="priority"><option value="normal" ${f.priority==='normal'||!f.priority?'selected':''}>通常</option><option value="mid" ${f.priority==='mid'?'selected':''}>やや高</option><option value="high" ${f.priority==='high'?'selected':''}>高</option></select></label>`}
      <label>駅<input data-f="station" list="stationList" value="${esc(f.station)}" placeholder="駅名"></label>
      ${ev?`<label>場所<input data-f="location" value="${esc(f.location)}"></label>`:''}
    </div>`;
  }

  /* host へ操作候補ブロックを描画。hooks.onChange(list) で履歴保存などを行う。 */
  function render(host,list,hooks={}){
    host.innerHTML='';
    if(!list.length)return;
    const box=document.createElement('div');box.className='apBox';
    const draw=()=>{
      const pending=list.filter(p=>p.status==='pending');
      const sel=pending.filter(p=>p.checked&&!p.invalid);
      const lab=summaryLabel(list);
      box.innerHTML=`<div class="apBoxHead"><b>操作候補 ${list.length}件</b><span class="hint">内容を確認し、チェックした候補だけが実行されます（AIは勝手に登録しません）</span></div>
        <div class="apCards">${list.map(p=>`<div class="apCard ${p.status} ${p.invalid?'bad':''}" data-pid="${p.pid}">${cardHtml(p)}</div>`).join('')}</div>
        ${pending.length?`<div class="apFoot"><button class="btn sm ghost" type="button" data-all>${sel.length===pending.filter(p=>!p.invalid).length?'すべて解除':'すべて選択'}</button><span class="grow"></span>
          <button class="btn sm ghost" type="button" data-dismiss>却下</button>
          <button class="btn sm primary" type="button" data-run ${sel.length?'':'disabled'}>${esc(lab||'選択してください')}</button></div>`:''}`;
      box.querySelectorAll('.apCard').forEach(el=>{
        const p=list.find(x=>x.pid===el.dataset.pid);if(!p)return;
        const ck=el.querySelector('[data-ck]');ck&&(ck.onchange=()=>{p.checked=ck.checked;draw()});
        const ed=el.querySelector('[data-edit]');ed&&(ed.onclick=()=>{p._edit=!p._edit;draw()});
        el.querySelectorAll('.apEdit [data-f]').forEach(inp=>inp.onchange=()=>{
          p.fields[inp.dataset.f]=inp.value;validate(p);
          if(p.invalid)p.checked=false;draw();hooks.onChange&&hooks.onChange(list);
        });
      });
      const all=box.querySelector('[data-all]');
      all&&(all.onclick=()=>{const ok=pending.filter(p=>!p.invalid);const on=ok.every(p=>p.checked);ok.forEach(p=>{p.checked=!on});draw()});
      const dis=box.querySelector('[data-dismiss]');
      dis&&(dis.onclick=()=>{pending.forEach(p=>{p.status='dismissed';p.checked=false});draw();hooks.onChange&&hooks.onChange(list);toast('操作候補を却下しました（何も変更していません）')});
      const run=box.querySelector('[data-run]');
      run&&(run.onclick=()=>{
        const r=applyMany(list);
        draw();hooks.onChange&&hooks.onChange(list);hooks.onApplied&&hooks.onApplied(r);
        if(r.done)toast(`${r.done}件を反映しました${r.failed?`（${r.failed}件は失敗）`:''}`,{label:'元に戻す',run:()=>{r.undo&&r.undo();list.forEach(p=>{if(p.status==='applied'&&p.appliedId){p.status='pending';p.checked=true}});draw();hooks.onChange&&hooks.onChange(list)}});
        else toast('反映できる候補がありません');
      });
    };
    draw();host.appendChild(box);
    if(typeof ensureStationDatalist==='function')try{ensureStationDatalist()}catch(e){}
  }

  window.KoujiAIActions={normalize,revalidate,validate,applyMany,applyOne,render,summaryLabel,
    _t:{isoOk,timeOk}};
})();
