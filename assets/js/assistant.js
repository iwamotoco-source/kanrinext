/* =========================================================
   assistant.js — 工事管理next AIアシスタント
   ローカル集計を優先し、未対応の質問だけ任意のAIプロキシへ送信する。
   APIキーはブラウザに保持しない。AI設定は端末ローカル(localCfg.ai)のみ。
   ========================================================= */
'use strict';
(function(){
  const AI_ENDPOINT_DEFAULT='https://kanrinext.vercel.app/api/ai';
  const AI_DEFAULT={enabled:false,endpoint:AI_ENDPOINT_DEFAULT,accessKey:'',sendNotes:false,preferLocal:true};
  let history=[];

  /* 設定は localCfg.ai（localStorage: koujiNextLocalConfigV1）だけに保存する。
     localCfg は core.js の top-level let（window.localCfg ではない）なので、同じグローバル字句スコープから直接参照する。 */
  const aiCfg=()=>Object.assign({},AI_DEFAULT,localCfg.ai||{});
  function saveAiCfg(v){
    localCfg.ai=Object.assign({},aiCfg(),v||{});
    saveLocal();
  }
  /* iOSコピーで混入する空白・改行・ゼロ幅文字・引用符を除去（サーバー側と同じ規則） */
  function cleanKey(v){return String(v||'').replace(/[\s\u200B-\u200D\u2060\uFEFF]+/g,'').replace(/^["'`]+|["'`]+$/g,'')}
  /* URL正規化: 前後空白・?key=・末尾スラッシュを除去（末尾/はVercelのリダイレクトでCORSが失敗するため） */
  function normEndpoint(v){
    const raw=String(v||'').trim();
    if(!raw)return {url:'',key:''};
    try{
      const u=new URL(raw,location.href);
      const key=cleanKey(u.searchParams.get('key'));
      u.searchParams.delete('key');u.hash='';
      u.pathname=u.pathname.replace(/\/+$/,'')||'/';
      return {url:u.toString().replace(/\?$/,''),key};
    }catch(e){return {url:raw,key:''}}
  }
  /* 旧形式（URLに ?key= を含める／別スクリプトが保存したキー）を一度だけ移行 */
  function migrateAiCfg(){
    try{
      if(!localCfg||!localCfg.ai)return;
      const ai=localCfg.ai,n=normEndpoint(ai.endpoint);let changed=false;
      if(ai.endpoint&&n.url!==ai.endpoint){ai.endpoint=n.url;changed=true}
      if(n.key&&!ai.accessKey){ai.accessKey=n.key;changed=true}
      if(ai.accessKey&&cleanKey(ai.accessKey)!==ai.accessKey){ai.accessKey=cleanKey(ai.accessKey);changed=true}
      if(changed)saveLocal();
    }catch(e){}
  }

  function jaDate(s){return s?fmtYMDW(s):''}
  function priText(p){return p==='high'?'高':p==='mid'?'やや高':'通常'}
  function normText(s){return String(s||'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ')}

  function rangeOfQuery(q){
    const t=todayISO(),d=parseISO(t);
    if(/明後日|あさって/.test(q)){const x=addDays(t,2);return {from:x,to:x,label:'明後日'}}
    if(/明日|あした/.test(q)){const x=addDays(t,1);return {from:x,to:x,label:'明日'}}
    if(/今日|きょう|本日/.test(q))return {from:t,to:t,label:'今日'};
    if(/来週/.test(q)){const st=addDays(startOfWeek(t,1),7);return {from:st,to:addDays(st,6),label:'来週'}}
    if(/今週/.test(q)){const st=startOfWeek(t,1);return {from:st,to:addDays(st,6),label:'今週'}}
    if(/来月/.test(q)){const x=new Date(d.getFullYear(),d.getMonth()+1,1),y=new Date(d.getFullYear(),d.getMonth()+2,0);return {from:iso(x),to:iso(y),label:`${x.getMonth()+1}月`}}
    if(/今月/.test(q)){const x=new Date(d.getFullYear(),d.getMonth(),1),y=new Date(d.getFullYear(),d.getMonth()+1,0);return {from:iso(x),to:iso(y),label:'今月'}}
    return null;
  }
  function eventText(e){return `${e.title||''} ${e.station||''} ${e.location||''} ${e.note||''}`}
  function taskText(t){return `${t.title||''} ${t.stationName||''} ${t.note||''}`}
  function stationFromQuery(q){
    const hits=STATIONS.filter(s=>normText(q).includes(normText(s.name)));
    return hits.sort((a,b)=>b.name.length-a.name.length)[0]?.name||'';
  }
  function qtyOf(text){
    const m=String(text||'').match(/(\d+(?:\.\d+)?)\s*(?:軒|件)\s*(?:分)?/);
    return m?Math.max(0,+m[1]||0):1;
  }
  function formatTask(t){
    const due=taskDate(t);
    return `・${t.title}${t.stationName?`（${t.stationName}駅）`:''}${due?` — ${fmtMDW(due)}${t.time?' '+t.time:''}`:''}［${priText(t.priority)}］`;
  }
  function formatEvent(e){
    return `・${e.title}${e.station?`（${e.station}駅）`:''} — ${fmtMDW(e.date)}${e.allDay?' 終日':e.start?' '+e.start:''}`;
  }
  function answer(kind,text,meta={}){
    return {kind,text,meta};
  }

  function localAnswer(query){
    const q=String(query||'').trim(),nq=normText(q),range=rangeOfQuery(q),station=stationFromQuery(q);
    const openTasks=state.tasks.filter(t=>!t.done);

    if(/(重要|優先).*(タスク)|タスク.*(重要|優先)|優先度.*高/.test(q)){
      let xs=openTasks.filter(t=>t.priority==='high');
      if(range)xs=xs.filter(t=>{const d=taskDate(t);return d&&d>=range.from&&d<=range.to});
      if(station)xs=xs.filter(t=>t.stationName===station);
      xs.sort((a,b)=>(taskDate(a)||'9999').localeCompare(taskDate(b)||'9999')||(a.created||0)-(b.created||0));
      if(!xs.length)return answer('tasks',`${range?.label||'現在'}${station?`・${station}駅関連の`:''}優先度「高」の未完了タスクはありません。`);
      return answer('tasks',`${range?.label||'現在'}${station?`・${station}駅関連の`:''}優先度「高」の未完了タスクは${xs.length}件です。\n${xs.map(formatTask).join('\n')}`,{taskIds:xs.map(x=>x.id)});
    }

    if(/期限.*(切れ|超過|過ぎ)|遅延| overdue/i.test(q)){
      const xs=openTasks.filter(t=>taskDate(t)&&taskDate(t)<todayISO()).sort((a,b)=>taskDate(a).localeCompare(taskDate(b)));
      if(!xs.length)return answer('tasks','期限を過ぎている未完了タスクはありません。');
      return answer('tasks',`期限を過ぎている未完了タスクは${xs.length}件です。\n${xs.map(formatTask).join('\n')}`,{taskIds:xs.map(x=>x.id)});
    }

    if(/現場調査|現調/.test(q)){
      const r=range||{from:todayISO(),to:addDays(todayISO(),90),label:'今後90日'};
      const re=/現場調査|現調|(?:^|[^再])調査/;
      const xs=occurrencesBetween(r.from,r.to,{}).filter(e=>re.test(eventText(e)));
      const by={};let total=0;
      xs.forEach(e=>{const st=e.station||findStation(eventText(e))?.name||'駅未設定';const qty=qtyOf(eventText(e));total+=qty;by[st]=(by[st]||0)+qty});
      if(!xs.length)return answer('events',`${r.label}の現場調査予定は見つかりませんでした。`);
      const rows=Object.entries(by).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'ja')).map(([s,c])=>`・${s}：${c}軒分`);
      return answer('events',`${r.label}の現場調査は合計${total}軒分（予定${xs.length}件）です。\n${rows.join('\n')}`,{stations:Object.keys(by),eventKeys:xs.map(x=>x.key)});
    }

    if(station&&/(予定|タスク|やること|何|なに|まとめ)/.test(q)){
      const r=range||{from:todayISO(),to:addDays(todayISO(),30),label:'今後30日'};
      const evs=occurrencesBetween(r.from,r.to,{}).filter(e=>e.station===station||normText(eventText(e)).includes(normText(station)));
      const ts=openTasks.filter(t=>t.stationName===station&&(!range||!taskDate(t)||(taskDate(t)>=r.from&&taskDate(t)<=r.to)));
      let text=`${r.label}の${station}駅関連は、予定${evs.length}件・未完了タスク${ts.length}件です。`;
      if(evs.length)text+=`\n\n予定\n${evs.slice(0,12).map(formatEvent).join('\n')}`;
      if(ts.length)text+=`\n\nタスク\n${ts.slice(0,12).map(formatTask).join('\n')}`;
      return answer('mixed',text,{stations:[station],taskIds:ts.map(x=>x.id),eventKeys:evs.map(x=>x.key)});
    }

    if(/一番.*(忙|予定.*多)|忙しい日|予定.*多い日/.test(q)){
      const r=range||{from:todayISO(),to:addDays(todayISO(),30),label:'今後30日'};
      const evs=occurrencesBetween(r.from,r.to,{}),count={};
      evs.forEach(e=>{count[e.date]=(count[e.date]||0)+1});
      openTasks.filter(t=>taskDate(t)>=r.from&&taskDate(t)<=r.to).forEach(t=>{const d=taskDate(t);count[d]=(count[d]||0)+1});
      const sorted=Object.entries(count).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
      if(!sorted.length)return answer('summary',`${r.label}に予定・期限付きタスクはありません。`);
      const max=sorted[0][1],days=sorted.filter(x=>x[1]===max);
      return answer('summary',`${r.label}で最も件数が多いのは ${days.map(([d])=>fmtMDW(d)).join('、')} で、各${max}件です。`);
    }

    if(station&&/(何回|何度|回数|行く)/.test(q)){
      const r=range||{from:todayISO(),to:addDays(todayISO(),30),label:'今後30日'};
      const evs=occurrencesBetween(r.from,r.to,{}).filter(e=>e.station===station||normText(eventText(e)).includes(normText(station)));
      const days=[...new Set(evs.map(e=>e.date))];
      return answer('events',`${r.label}に${station}駅へ行く予定として登録されているのは、${evs.length}件（${days.length}日）です。${days.length?`\n${days.map(fmtMDW).join('\n')}`:''}`,{stations:[station],eventKeys:evs.map(x=>x.key)});
    }

    if(range&&/(予定|スケジュール|何がある|なにがある)/.test(q)){
      const evs=occurrencesBetween(range.from,range.to,{});
      const ts=openTasks.filter(t=>{const d=taskDate(t);return d&&d>=range.from&&d<=range.to});
      if(!evs.length&&!ts.length)return answer('mixed',`${range.label}の予定・期限付きタスクはありません。`);
      let text=`${range.label}は予定${evs.length}件、期限付き未完了タスク${ts.length}件です。`;
      if(evs.length)text+=`\n\n予定\n${evs.slice(0,15).map(formatEvent).join('\n')}`;
      if(ts.length)text+=`\n\nタスク\n${ts.slice(0,15).map(formatTask).join('\n')}`;
      return answer('mixed',text,{taskIds:ts.map(x=>x.id),eventKeys:evs.map(x=>x.key),stations:[...new Set(evs.map(x=>x.station).filter(Boolean))]});
    }

    if(/未完了.*タスク|タスク.*未完了|やること/.test(q)){
      let xs=openTasks;
      if(range)xs=xs.filter(t=>{const d=taskDate(t);return d&&d>=range.from&&d<=range.to});
      if(station)xs=xs.filter(t=>t.stationName===station);
      xs=xs.slice().sort((a,b)=>(({high:0,mid:1,normal:2}[a.priority||'normal'])-({high:0,mid:1,normal:2}[b.priority||'normal']))||((taskDate(a)||'9999').localeCompare(taskDate(b)||'9999')));
      if(!xs.length)return answer('tasks',`${range?.label||'現在'}の条件に一致する未完了タスクはありません。`);
      return answer('tasks',`未完了タスクは${xs.length}件です。\n${xs.slice(0,20).map(formatTask).join('\n')}`,{taskIds:xs.map(x=>x.id)});
    }

    return null;
  }

  function compactContext(){
    const cfg=aiCfg(),from=addDays(todayISO(),-120),to=addDays(todayISO(),370);
    const tasks=state.tasks.map(t=>({
      id:t.id,title:t.title,station:t.stationName||'',priority:t.priority||'normal',date:taskDate(t)||'',time:t.time||'',done:!!t.done,
      ...(cfg.sendNotes&&t.note?{note:t.note}: {})
    }));
    const events=state.events.filter(e=>(e.endDate||e.date)>=from&&e.date<=to).map(e=>({
      id:e.id,title:e.title,date:e.date,endDate:e.endDate||e.date,start:e.start||'',end:e.end||'',allDay:!!e.allDay,station:e.station||'',location:e.location||'',category:category(e.categoryId).name,
      ...(cfg.sendNotes&&e.note?{note:e.note}: {})
    }));
    return {today:todayISO(),tasks,events};
  }

  class AiError extends Error{constructor(msg,code,stage){super(msg);this.code=code||'';this.stage=stage||''}}

  /* フロント → Vercel の唯一の送信口。X-App-Key はここで明示的に付ける（グローバルfetchは書き換えない）。 */
  async function postAi(cfg,body){
    const {url}=normEndpoint(cfg.endpoint),key=cleanKey(cfg.accessKey);
    if(!url)throw new AiError('AIプロキシURLが未設定です','NO_ENDPOINT','config');
    if(!key)throw new AiError('AIアクセスキーが未入力です','ACCESS_KEY_MISSING','config');
    let r;
    try{
      r=await fetch(url,{method:'POST',mode:'cors',cache:'no-store',credentials:'omit',
        headers:{'Content-Type':'application/json','X-App-Key':key},body:JSON.stringify(body)});
    }catch(e){throw new AiError('Vercel APIへ接続できません（通信・CORS）','NETWORK','network')}
    let data={};try{data=await r.json()}catch(e){}
    if(!r.ok)throw new AiError(data.error||`AI ${r.status}`,data.code||`HTTP_${r.status}`,'server');
    return data;
  }

  async function remoteAnswer(query){
    const cfg=aiCfg();
    if(!cfg.enabled||!cfg.endpoint)throw new Error('AI接続先が未設定です');
    const data=await postAi(cfg,{query,context:compactContext()});
    if(!data.answer)throw new Error('AIから回答を取得できませんでした');
    return answer('remote',String(data.answer),data.meta||{});
  }

  function modelLabel(m){
    const p=String(m||'').split('-');
    if(p[0].toLowerCase()!=='gpt'||p.length<2)return String(m||'');
    return ['GPT-'+p[1],...p.slice(2).map(x=>x.charAt(0).toUpperCase()+x.slice(1))].join(' ');
  }

  /* 段階的な接続テスト。保存済み設定は一切書き換えず、画面の入力値だけで検査する。 */
  async function testConnection(cfg,report){
    const step=(label,state,detail)=>report({label,state,detail});
    const {url}=normEndpoint(cfg.endpoint),key=cleanKey(cfg.accessKey);
    if(!url){step('AIプロキシURL','ng','URLが未入力です');return {ok:false,summary:'AIプロキシURLが未設定です'}}
    if(!key){step('AIアクセスキー','ng','未入力です');return {ok:false,summary:'AIアクセスキーが未入力です'}}

    /* 1-2. 到達・CORS（GETヘルスチェック） */
    let health=null;
    try{
      const r=await fetch(url,{method:'GET',mode:'cors',cache:'no-store',credentials:'omit'});
      health=await r.json().catch(()=>null);
      step('Vercel API到達','ok');step('CORS','ok');
    }catch(e){
      let reachable=false;
      try{await fetch(url,{method:'GET',mode:'no-cors',cache:'no-store',credentials:'omit'});reachable=true}catch(_){}
      if(reachable){step('Vercel API到達','ok');step('CORS','ng','ALLOWED_ORIGIN を確認してください');return {ok:false,summary:'CORSエラー'}}
      step('Vercel API到達','ng','URL・通信状態を確認してください');return {ok:false,summary:'Vercel APIへ到達できません'};
    }
    if(!health||health.service!=='kouji-next-ai'){step('AIプロキシ確認','ng','このURLは工事管理nextのAI APIではありません');return {ok:false,summary:'AIプロキシURLが正しくありません'}}
    if(health.accessTokenConfigured===false){step('APP_ACCESS_TOKEN認証','ng','Vercel側で未設定（設定後は再デプロイが必要）');return {ok:false,summary:'Vercel認証失敗（APP_ACCESS_TOKEN未設定）'}}

    /* 3-6. 認証 → OpenAIキー → モデル → Responses API */
    try{
      const d=await postAi(cfg,{mode:'test'});
      step('APP_ACCESS_TOKEN認証','ok');step('OpenAI APIキー','ok');
      step('モデル利用可能','ok',d.fallback?`${d.requestedModel} が使えないため ${d.model} を使用`:d.model);
      step('Responses API応答','ok');
      return {ok:true,summary:`AI接続成功 — ${modelLabel(d.model)}`};
    }catch(e){
      const c=e.code||'';
      if(/^ACCESS_|HTTP_401/.test(c)){step('APP_ACCESS_TOKEN認証','ng',e.message);return {ok:false,summary:'Vercel認証失敗'}}
      step('APP_ACCESS_TOKEN認証','ok');
      if(c==='OPENAI_KEY_MISSING'||c==='OPENAI_KEY_INVALID'||c==='OPENAI_QUOTA'){step('OpenAI APIキー','ng',e.message);return {ok:false,summary:'OpenAI APIキーエラー'}}
      step('OpenAI APIキー','ok');
      if(c==='MODEL_UNAVAILABLE'){step('モデル利用可能','ng',e.message);return {ok:false,summary:'モデルが利用できません'}}
      step('Responses API応答','ng',e.message);return {ok:false,summary:'OpenAI APIエラー'};
    }
  }

  function escapeLines(s){return esc(s).replace(/\n/g,'<br>')}
  function renderAssistantMessage(list,who,text,meta={}){
    const row=document.createElement('div');row.className='aiMsg '+who;
    row.innerHTML=`<div class="aiBubble">${escapeLines(text)}</div>`;
    list.appendChild(row);
    if(who==='bot'&&meta?.stations?.length){
      const acts=document.createElement('div');acts.className='aiActs';
      [...new Set(meta.stations)].slice(0,6).forEach(st=>{const b=document.createElement('button');b.className='btn sm';b.textContent=st+'駅を地図で見る';b.onclick=()=>{closeModal();setTimeout(()=>showStationOnMap(st),20)};acts.appendChild(b)});
      row.appendChild(acts);
    }
    list.scrollTop=list.scrollHeight;
  }

  async function askAssistant(query,list,input,send){
    const q=query.trim();if(!q)return;
    renderAssistantMessage(list,'user',q);history.push({role:'user',text:q});input.value='';send.disabled=true;input.disabled=true;
    const wait=document.createElement('div');wait.className='aiMsg bot thinking';wait.innerHTML='<div class="aiBubble">確認しています…</div>';list.appendChild(wait);list.scrollTop=list.scrollHeight;
    try{
      let a=aiCfg().preferLocal!==false?localAnswer(q):null;
      if(!a&&aiCfg().enabled&&aiCfg().endpoint)a=await remoteAnswer(q);
      if(!a)a=answer('help','この質問はローカル集計ではまだ解釈できません。AI接続先を設定すると、予定・タスクを横断してより自由な質問に答えられます。');
      wait.remove();renderAssistantMessage(list,'bot',a.text,a.meta);history.push({role:'assistant',text:a.text});
    }catch(e){
      wait.remove();renderAssistantMessage(list,'bot',`AIへの問い合わせに失敗しました。\n${e.message||e}`);
    }finally{send.disabled=false;input.disabled=false;input.focus()}
  }

  function openAiSettings(){
    migrateAiCfg();
    const c=aiCfg();
    openModal(`<div class="mHead"><h2>AIアシスタント設定</h2><button class="btn ghost icon" type="button" data-close aria-label="閉じる">${icon('x')}</button></div>
      <div class="mBody">
        <div class="field"><label>外部AIを使用する</label><select id="aiEnabled"><option value="false">使用しない（ローカル集計のみ）</option><option value="true">使用する</option></select></div>
        <div class="field" style="margin-top:12px"><label>AIプロキシURL</label><input id="aiEndpoint" type="url" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" value="${esc(c.endpoint||'')}" placeholder="${AI_ENDPOINT_DEFAULT}"></div>
        <div class="field" style="margin-top:12px"><label>AIアクセスキー</label>
          <div style="display:flex;gap:6px"><input id="aiAccessKey" type="password" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" style="flex:1" placeholder="Vercelの APP_ACCESS_TOKEN と同じ文字列"><button class="btn" type="button" id="aiKeyShow">表示</button></div>
          <span class="hint">OpenAIの sk-... APIキーではありません。OpenAIキーはVercel側だけに置き、この端末には保存しません。ここにはVercelの APP_ACCESS_TOKEN と同じ文字列を入れます（この端末内にだけ保存）。</span></div>
        <label class="check" style="margin-top:14px"><input type="checkbox" id="aiPreferLocal" ${c.preferLocal!==false?'checked':''}>答えられる質問は端末内だけで集計する</label>
        <label class="check" style="margin-top:10px"><input type="checkbox" id="aiSendNotes" ${c.sendNotes?'checked':''}>外部AIへタスク・予定のメモも送る</label>
        <div id="aiTestResult" class="hint" style="margin-top:12px;line-height:1.8" aria-live="polite"></div>
      </div>
      <div class="mFoot"><button class="btn" type="button" id="aiTest">接続テスト</button><span class="grow"></span><button class="btn" type="button" data-close>キャンセル</button><button class="btn primary" type="button" id="aiSave">保存</button></div>`,
      {onMount:box=>{
        const $b=s=>box.querySelector(s);
        const en=$b('#aiEnabled'),ep=$b('#aiEndpoint'),key=$b('#aiAccessKey'),local=$b('#aiPreferLocal'),notes=$b('#aiSendNotes'),out=$b('#aiTestResult'),testBtn=$b('#aiTest');
        en.value=String(!!c.enabled);
        key.value=c.accessKey||'';
        $b('#aiKeyShow').onclick=e=>{const v=key.type==='password';key.type=v?'text':'password';e.currentTarget.textContent=v?'隠す':'表示'};
        /* 入力値 → 設定オブジェクト（保存と接続テストで同じ関数を使い、値の食い違いをなくす） */
        const readForm=()=>{const n=normEndpoint(ep.value);return {enabled:en.value==='true',endpoint:n.url,accessKey:cleanKey(key.value)||n.key,preferLocal:local.checked,sendNotes:notes.checked}};
        $b('#aiSave').onclick=()=>{saveAiCfg(readForm());closeModal();toast('AI設定を保存しました')};
        testBtn.onclick=async()=>{
          const cfg=readForm();
          ep.value=cfg.endpoint;key.value=cfg.accessKey;
          testBtn.disabled=true;out.innerHTML='';
          const rows=[];
          const render=()=>{out.innerHTML=rows.map(x=>`<div>${x.state==='ok'?'✅':'❌'} ${esc(x.label)}${x.detail?`<span style="opacity:.75"> — ${esc(x.detail)}</span>`:''}</div>`).join('')};
          let res;
          try{res=await testConnection(cfg,x=>{rows.push(x);render()})}
          catch(e){res={ok:false,summary:e.message||String(e)}}
          finally{testBtn.disabled=false}
          /* 成功した入力値はそのまま保存（失敗時は保存済み設定に一切触れない） */
          if(res.ok){saveAiCfg(Object.assign(cfg,{enabled:true}));en.value='true';res.summary+='（設定を保存しました）'}
          out.insertAdjacentHTML('afterbegin',`<div style="font-weight:800;margin-bottom:4px;color:${res.ok?'var(--accent)':'var(--danger)'}">${esc(res.summary)}</div>`);
          toast(res.ok?res.summary:'接続できませんでした：'+res.summary);
        };
      }});
  }

  function openAssistant(){
    openModal(`<div class="mHead aiHead"><div class="aiMark">AI</div><div><h2>工事管理next AI</h2><div class="hint">予定・タスクを自然文で検索・集計</div></div><span class="grow"></span><button class="btn ghost icon" type="button" id="aiCfgBtn" title="AI設定">${icon('cog')}</button><button class="btn ghost icon" type="button" data-close aria-label="閉じる">${icon('x')}</button></div>
      <div class="mBody aiBody"><div class="aiSuggest">
        <button type="button">重要度が高いタスクは？</button>
        <button type="button">来月の現場調査はどこが何軒分？</button>
        <button type="button">期限切れのタスクはある？</button>
        <button type="button">来週の予定をまとめて</button>
      </div><div class="aiChat" id="aiChat"></div></div>
      <form class="aiComposer" id="aiForm"><textarea id="aiInput" rows="1" placeholder="例：明日本厚木で何するんだっけ？" autocomplete="off"></textarea><button class="btn primary" id="aiSend" type="submit">送信</button></form>`,
      {wide:true,onMount:box=>{
        const list=box.querySelector('#aiChat'),input=box.querySelector('#aiInput'),send=box.querySelector('#aiSend');
        renderAssistantMessage(list,'bot','予定・タスクについて聞いてください。よく使う集計は端末内だけで処理します。');
        box.querySelectorAll('.aiSuggest button').forEach(b=>b.onclick=()=>{input.value=b.textContent;askAssistant(input.value,list,input,send)});
        box.querySelector('#aiCfgBtn').onclick=()=>{closeModal();setTimeout(openAiSettings,20)};
        box.querySelector('#aiForm').onsubmit=e=>{e.preventDefault();askAssistant(input.value,list,input,send)};
        input.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();box.querySelector('#aiForm').requestSubmit()}};
        setTimeout(()=>input.focus(),30);
      }});
  }

  function injectStyle(){
    if(document.getElementById('aiStyle'))return;
    const st=document.createElement('style');st.id='aiStyle';st.textContent=`
    .aiTopBtn{font-weight:800;letter-spacing:.02em}.aiTopBtn .aiDot{width:7px;height:7px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
    .aiMark{width:34px;height:34px;border-radius:8px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;font-weight:900;letter-spacing:-.03em;flex:0 0 auto}.aiHead h2{margin-bottom:1px}.aiBody{padding:0;display:flex;flex-direction:column;min-height:360px}.aiSuggest{display:flex;gap:6px;padding:10px 12px;border-bottom:1px solid var(--line);overflow-x:auto}.aiSuggest button{flex:0 0 auto;height:28px;border:1px solid var(--line);border-radius:999px;padding:0 10px;color:var(--ink-2);background:var(--surface-2);font-size:12px}.aiChat{flex:1;min-height:280px;max-height:55vh;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:12px}.aiMsg{display:flex;flex-direction:column;max-width:86%}.aiMsg.user{margin-left:auto;align-items:flex-end}.aiMsg.bot{margin-right:auto;align-items:flex-start}.aiBubble{border:1px solid var(--line);background:var(--surface-2);border-radius:12px;padding:10px 12px;line-height:1.7;white-space:normal}.aiMsg.user .aiBubble{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}.aiMsg.thinking{opacity:.65}.aiActs{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.aiComposer{display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--line);background:var(--surface)}.aiComposer textarea{flex:1;resize:none;min-height:38px;max-height:100px;border:1px solid var(--line-2);border-radius:8px;background:var(--surface);padding:9px 10px;outline:none;font:inherit}.aiComposer textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
    @media(max-width:820px){.aiTopBtn{width:34px;padding:0;justify-content:center}.aiTopBtn .aiLbl{display:none}.aiBody{min-height:0}.aiChat{max-height:none;min-height:0}.aiSuggest{padding:8px}.aiMsg{max-width:92%}.aiComposer{padding-bottom:calc(10px + env(safe-area-inset-bottom))}}
    `;document.head.appendChild(st);
  }

  function installUi(){
    injectStyle();
    const omni=document.getElementById('omniBtn');
    if(omni&&!document.getElementById('aiTopBtn')){
      const b=document.createElement('button');b.id='aiTopBtn';b.type='button';b.className='btn aiTopBtn';b.innerHTML='<span class="aiDot"></span><span class="aiLbl">AI</span>';b.title='工事管理next AI';b.onclick=openAssistant;omni.insertAdjacentElement('afterend',b);
    }
    const tab=document.getElementById('tabbar');
    if(tab&&!tab.querySelector('[data-act=ai]')){
      const b=document.createElement('button');b.type='button';b.dataset.act='ai';b.innerHTML='<span style="font-size:15px;font-weight:900;line-height:21px">AI</span>AI';b.onclick=openAssistant;
      const tools=tab.querySelector('[data-act=menu]');tab.insertBefore(b,tools||null);
    }
    document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='k'){e.preventDefault();openAssistant()}});
    migrateAiCfg();
    window.KoujiAI={open:openAssistant,settings:openAiSettings,askLocal:localAnswer,test:()=>testConnection(aiCfg(),x=>console.log(x.state,x.label,x.detail||''))};
  }

  if(document.readyState==='complete')installUi();else window.addEventListener('load',installUi,{once:true});
})();