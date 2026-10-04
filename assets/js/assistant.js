/* =========================================================
   assistant.js — 工事管理next AIアシスタント
   ローカル集計を優先し、未対応の質問だけ任意のAIプロキシへ送信する。
   APIキーはブラウザに保持しない。AI設定は端末ローカル(localCfg.ai)のみ。
   ========================================================= */
'use strict';
(function(){
  const AI_ENDPOINT_DEFAULT='https://kanrinext.vercel.app/api/ai';
  /* sendNotes/preferLocal は従来どおり。以下はAI Workspaceで追加した設定（既存の保存値は壊さず、無ければ既定値で補う）:
     sendSchedule 外部AIへ予定/タスクを送る / actionsEnabled AIによる操作候補 / confirmFileSend 添付送信前の確認
     saveHistory 会話履歴を端末に保存 / autoSpeak AI回答の自動読み上げ
     provider 使うAI（'gemini' 標準 / 'openai' 予備。既定は必ず gemini）
     fallbackToOpenAI Geminiが使えないとき OpenAI を使う（既定オフ。有料APIへ勝手に送らないため、明示ONのときだけ）
     localOnly 「ローカルのみ」（オンの間は外部AIへ何も送らない） */
  const AI_DEFAULT={enabled:false,endpoint:AI_ENDPOINT_DEFAULT,accessKey:'',sendNotes:false,preferLocal:true,
    sendSchedule:true,actionsEnabled:true,confirmFileSend:true,saveHistory:true,autoSpeak:false,
    provider:'gemini',fallbackToOpenAI:false,localOnly:false,profile:'',
    /* 読み上げ音声（assistant-tts.js）。既定値はHugging Face mikuTTS Spaceの初期設定に合わせる */
    voiceMode:'character',ttsEndpoint:'',ttsKey:'',ttsFallback:true,ttsPitch:6,ttsSpeed:0,ttsVolume:100,
    ttsModel:'',ttsVoice:'ja-JP-NanamiNeural',ttsF0:'rmvpe',ttsIndexRate:1,ttsProtect:0.33,ttsFilterRadius:3,ttsRmsMix:0.25};
  const PROVIDER_LABEL={gemini:'Gemini',openai:'OpenAI'};
  const providerOf=c=>(c&&c.provider==='openai')?'openai':'gemini';
  const providerLabel=p=>PROVIDER_LABEL[p]||String(p||'');
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

  /* 質問文から対象期間を決める。「今月の明日以降」「今月の残り」「来週の水曜以降」のような
     「期間（今月/来週…）」＋「下限（明日以降/残り/これから…）」の組み合わせも解釈する。 */
  function rangeOfQuery(q){
    const t=todayISO(),d=parseISO(t),tom=addDays(t,1);
    const mon=(y,m)=>{const x=new Date(y,m,1),z=new Date(y,m+1,0);return {from:iso(x),to:iso(z),label:`${x.getMonth()+1}月`}};
    /* 1) 下限（いつ以降か） */
    let lb=null,lbLabel='';
    if(/(明後日|あさって)\s*(以降|以後|から|より後)/.test(q)){lb=addDays(t,2);lbLabel='明後日以降'}
    else if(/(明日|あした)\s*(以降|以後|から|より後)/.test(q)){lb=tom;lbLabel='明日以降'}
    else if(/(今日|本日|きょう)\s*(以降|以後|から)|これから|今後|残り|以降|以後/.test(q)){lb=t;lbLabel=/残り/.test(q)?'残り':'今日以降'}
    /* 2) 期間 */
    let base=null;
    const nm=q.match(/(\d{1,2})\s*月(?!曜)/);
    if(/再来月/.test(q))base=Object.assign(mon(d.getFullYear(),d.getMonth()+2),{});
    else if(/来月/.test(q))base=mon(d.getFullYear(),d.getMonth()+1);
    else if(/今月|当月/.test(q))base=Object.assign(mon(d.getFullYear(),d.getMonth()),{label:'今月'});
    else if(nm&&+nm[1]>=1&&+nm[1]<=12)base=mon(d.getFullYear(),+nm[1]-1);
    else if(/来週/.test(q)){const st=addDays(startOfWeek(t,1),7);base={from:st,to:addDays(st,6),label:'来週'}}
    else if(/今週/.test(q)){const st=startOfWeek(t,1);base={from:st,to:addDays(st,6),label:'今週'}}
    if(base&&/(来週|来月|再来月|\d{1,2}\s*月(?!曜)|今週|今月)\s*(以降|以後)/.test(q)){   /* 「来週以降」「来月以降」は期間の終わりを区切らない */
      const from=lb&&lb>base.from?lb:base.from;
      return {from,to:addDays(base.from,365),label:`${base.label}以降`,after:from};
    }
    if(base){
      if(lb&&lb>base.from)return {from:lb>base.to?base.to:lb,to:base.to,label:`${base.label}の${lbLabel==='残り'?'残り':lbLabel}`,after:lb};
      return base;
    }
    if(lb)return {from:lb,to:addDays(lb,365),label:lbLabel,after:lb};
    if(/明後日|あさって/.test(q)){const x=addDays(t,2);return {from:x,to:x,label:'明後日'}}
    if(/明日|あした/.test(q)){return {from:tom,to:tom,label:'明日'}}
    if(/今日|きょう|本日/.test(q))return {from:t,to:t,label:'今日'};
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

  function localAnswerCore(query){
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

  /* ---- 端末内で答えてよい質問かの判定 ----
     端末内の集計は「決まった言い回し」だけを正確に扱う。文中に“解釈できない語”が1つでも残る場合
     （例: 平日・午前・金曜・〜のうち・じゃあ来週は？）は推測で答えず、外部AI（会話履歴つき）に任せる。 */
  const KNOWN_WORDS=['明後日','あさって','明日','あした','今日','きょう','本日','来週','今週','再来月','来月','今月','当月','月末','以降','以後','これから','今後','残り','から','まで',
    '予定','スケジュール','タスク','やること','現場調査','現調','調査','件数','何件','件','いくつ','何','なに','あります','ありますか','ある','ない','教えて','ください','見せて','まとめて','まとめ','一覧','すべて','全部',
    '未完了','完了','優先度','優先','重要','高い','期限','切れ','超過','過ぎ','遅延','忙しい','多い','一番','何回','何度','回数','行く','駅','軒','です','ですか','でしょうか','か','は','の','が','を','に','で','も','と','や','て','って','日','回'];
  function fullyUnderstood(q){
    let r=String(q||'');
    const sts=(typeof STATIONS!=='undefined'?STATIONS:[]).map(x=>x.name).sort((a,b)=>b.length-a.length);
    sts.forEach(n=>{r=r.split(n).join(' ')});
    r=r.replace(/\d{1,2}\s*月(?!曜)/g,' ');
    KNOWN_WORDS.slice().sort((a,b)=>b.length-a.length).forEach(w=>{r=r.split(w).join(' ')});
    r=r.replace(/[\s　?？!！。、,，.．・「」『』()（）]/g,'');
    return r.length===0;
  }
  function localAnswer(query){
    const q=String(query||'').trim();
    const a=localAnswerCore(q);
    if(!a)return null;
    if(!fullyUnderstood(q))return null;   /* 解釈できない語が残る → 外部AIへ */
    const r=rangeOfQuery(q);
    if(r){   /* どの期間として読んだかを必ず見せる（読み違いに気付けるように） */
      const f=fmtMDW(r.from),t=fmtMDW(r.to);
      const span=r.from===r.to?f:(parseISO(r.to)-parseISO(r.from)>250*864e5?`${f} 以降`:`${f}〜${t}`);
      a.text+=`\n\n（対象期間：${span}）`;
      a.meta=Object.assign({},a.meta,{range:{from:r.from,to:r.to}});
    }
    return a;
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

  class AiError extends Error{constructor(msg,code,stage,detail){super(msg);this.code=code||'';this.stage=stage||'';this.detail=detail||''}}

  /* フロント → Vercel の唯一の送信口。X-App-Key はここで明示的に付ける（グローバルfetchは書き換えない）。 */
  async function postAi(cfg,body,opts={}){
    const {url}=normEndpoint(cfg.endpoint),key=cleanKey(cfg.accessKey);
    if(!url)throw new AiError('AIプロキシURLが未設定です','NO_ENDPOINT','config');
    if(!key)throw new AiError('AIアクセスキーが未入力です','ACCESS_KEY_MISSING','config');
    /* 使うAIの選択はここで一括して付ける（Gemini が標準。OpenAI への切替は明示した場合のみ） */
    const prov=providerOf(cfg);
    body=Object.assign({},body,{provider:prov,fallbackToOpenAI:prov==='gemini'&&cfg.fallbackToOpenAI===true});
    let r;
    try{
      r=await fetch(url,{method:'POST',mode:'cors',cache:'no-store',credentials:'omit',
        headers:{'Content-Type':'application/json','X-App-Key':key},body:JSON.stringify(body),
        ...(opts.signal?{signal:opts.signal}:{})});
    }catch(e){
      if(e&&e.name==='AbortError')throw new AiError('中止しました','ABORTED','client');
      throw new AiError('Vercel APIへ接続できません（通信・CORS）','NETWORK','network');
    }
    let data={};try{data=await r.json()}catch(e){}
    if(!r.ok){const er=new AiError(data.error||`AI ${r.status}`,data.code||`HTTP_${r.status}`,'server',data.detail);er.provider=data.provider||prov;er.fallbackTried=data.fallbackTried;throw er}
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
    if(p[0].toLowerCase()==='gemini'&&p.length>1)return ['Gemini '+p[1],...p.slice(2).map(x=>x.charAt(0).toUpperCase()+x.slice(1))].join(' ');
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

    const prov=providerOf(cfg),PL=providerLabel(prov);
    /* 古い api/ai.js（OpenAI専用）が動いている場合は、Gemini を選んでいても通らない */
    if(prov==='gemini'&&!health.gemini){step('Vercel API','ng','Vercel側の api/ai.js が古い版です（Gemini未対応）。最新版をデプロイしてください');return {ok:false,summary:'Vercel側APIがGemini未対応（再デプロイが必要）'}}
    /* 認証 → APIキー → モデル → 応答 */
    try{
      const d=await postAi(cfg,{mode:'test'});
      step('APP_ACCESS_TOKEN認証','ok');step(`${PL} APIキー`,'ok');
      step(prov==='gemini'?'Gemini モデル利用可能':'モデル利用可能','ok',d.fallback?`${d.requestedModel} が使えないため ${d.model} を使用`:d.model);
      step(prov==='gemini'?'Gemini 応答':'Responses API応答','ok');
      return {ok:true,summary:`${prov==='gemini'?'Gemini':'AI'}接続成功 — ${modelLabel(d.model)}`,model:d.model,provider:prov};
    }catch(e){
      const c=e.code||'';
      if(/^ACCESS_|HTTP_401/.test(c)){step('APP_ACCESS_TOKEN認証','ng',e.message);return {ok:false,summary:'Vercel認証失敗'}}
      step('APP_ACCESS_TOKEN認証','ok');
      if(/KEY_MISSING|KEY_INVALID/.test(c)||c==='OPENAI_QUOTA'){step(`${PL} APIキー`,'ng',c.endsWith('KEY_MISSING')?`Vercel に ${prov==='gemini'?'GEMINI_API_KEY':'OPENAI_API_KEY'} が未設定です（設定後は再デプロイが必要）`:e.message);return {ok:false,summary:c==='OPENAI_QUOTA'?'OpenAIの残高・利用上限エラー':c.endsWith('KEY_MISSING')?`${PL} APIキーが設定されていません`:`${PL} APIキーが無効です`}}
      step(`${PL} APIキー`,'ok');
      if(c==='MODEL_UNAVAILABLE'){step(`${PL} モデル利用可能`,'ng',e.message);return {ok:false,summary:`${PL}モデルが利用できません`}}
      step(`${PL} モデル利用可能`,'ok');
      if(c==='GEMINI_QUOTA'){step(`${PL} 応答`,'ng',e.message);return {ok:false,summary:'Gemini無料枠の利用上限に達した可能性があります'}}
      step(`${PL} 応答`,'ng',e.message);return {ok:false,summary:`${PL} APIエラー`};
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

  /* 「外部AIへ送信されるデータ」の説明（設定画面・添付確認で共通） */
  function sendInfoHtml(prov,o={}){
    const PL=providerLabel(prov),free=prov==='gemini';
    const li=t=>`<li>${t}</li>`;
    return `<ul style="margin:6px 0 0 1.1em;padding:0;line-height:1.7">
      ${li('質問文と、直近の会話（最大10件）')}
      ${li(o.sendSchedule===false?'予定・タスク：<b>送りません</b>（設定でオフ）':'予定・タスク：質問の期間に絞って最大各300件（'+(o.sendNotes?'メモも含む':'メモは含まない')+'）')}
      ${li('添付ファイルの内容（画像・PDF・表の抽出文字など）。送信前に内容を確認できます')}
      ${li('端末内で答えられる質問（今日の予定・件数・未完了タスクなど）は<b>何も送りません</b>。「ローカルのみ」にすると外部AIへは一切送りません')}
      ${li('送らないもの：各AIのAPIキー（Vercel内だけ）、会話履歴の全件、端末内のその他のデータ')}
      ${li('音声入力は、ブラウザ/OSの音声認識を使います。音声そのものは本アプリにもAIにも送りません（文字になった内容だけが入力欄に入ります）')}
    </ul>
    <p style="margin:8px 0 0">送信先：この端末 → Vercel → <b>${esc(PL)}</b>。ファイルは保存しません。${free?'<br><b>Gemini 無料枠</b>では、入力・出力が Google の製品改善に使われる場合があります（有料枠は使われません）。機密性の高い資料（個人情報・未公開の図面・契約書など）は送らないでください。':'<br>OpenAI へは保存を求めない設定（store=false）で送信します。API利用は課金対象です。'}</p>`;
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
          <span class="hint">Gemini / OpenAI のAPIキーではありません。AIのキーはVercelの環境変数（GEMINI_API_KEY / OPENAI_API_KEY）だけに置き、この端末には保存しません。ここにはVercelの APP_ACCESS_TOKEN と同じ文字列を入れます（この端末内にだけ保存）。</span></div>
        <div class="field aiProvBox" style="margin-top:14px"><label>AIプロバイダー</label>
          <label class="check aiProvRow"><input type="radio" name="aiProv" value="gemini" ${providerOf(c)==='gemini'?'checked':''}><span><b>Gemini</b>（標準）<small class="hint">Google AI Studio の無料枠で利用できます。Vercelの GEMINI_API_KEY を使用</small></span></label>
          <label class="check aiProvRow"><input type="radio" name="aiProv" value="openai" ${providerOf(c)==='openai'?'checked':''}><span><b>OpenAI</b>（予備・任意）<small class="hint">有料API（課金設定が必要）。Vercelの OPENAI_API_KEY を使用</small></span></label>
          <label class="check" id="aiFbRow" style="margin-top:10px"><input type="checkbox" id="aiFallback" ${c.fallbackToOpenAI===true?'checked':''}><span>Geminiが利用できない場合、OpenAIを使用する<small class="hint">初期値はオフ。オンにすると、Geminiの無料枠上限・障害のときに限り OpenAI（課金対象）へ送信します。オフなら、そこで止まります。</small></span></label>
        </div>
        <details class="aiSendInfo" id="aiSendInfo"><summary>外部AIへ送信されるデータ</summary>
          <div id="aiSendInfoBody" class="hint"></div></details>
        <label class="check" style="margin-top:14px"><input type="checkbox" id="aiPreferLocal" ${c.preferLocal!==false?'checked':''}>答えられる質問は端末内だけで集計する</label>
        <label class="check" style="margin-top:10px"><input type="checkbox" id="aiSendSchedule" ${c.sendSchedule!==false?'checked':''}>外部AIへ予定・タスクを送る（オフにすると、登録データを参照せずに質問だけを送る）</label>
        <label class="check" style="margin-top:10px"><input type="checkbox" id="aiSendNotes" ${c.sendNotes?'checked':''}>外部AIへタスク・予定のメモも送る</label>
        <div style="height:1px;background:var(--line);margin:14px 0 4px"></div>
        <div class="hint" style="font-weight:700;margin-bottom:2px">AI Workspace</div>
        <label style="display:block;margin-top:8px"><span class="hint" style="font-weight:700">AIに伝えておく前提（業務プロフィール）</span>
          <textarea id="aiProfile" rows="4" maxlength="1500" placeholder="例：担当は電気設備工事。工程表では「電気」「弱電」の行だけが自分の担当。土日祝は休工。略語：EPS=電気シャフト、LAN=弱電…" style="width:100%;margin-top:4px">${esc(c.profile||'')}</textarea>
          <small class="hint">担当工種・休工日・略語・よく使う現場などを書くと、工程表や図面の読み取りと質問の解釈に使われます（外部AIへ送られます。個人情報や機密は書かないでください）。</small></label>
        <label class="check" style="margin-top:8px"><input type="checkbox" id="aiActions" ${c.actionsEnabled!==false?'checked':''}>AIによる操作候補（予定・タスクの追加/更新の提案。実行は必ず確認後）</label>
        <label class="check" style="margin-top:10px"><input type="checkbox" id="aiConfirmFile" ${c.confirmFileSend!==false?'checked':''}>添付ファイルを送る前に内容を確認する</label>
        <label class="check" style="margin-top:10px"><input type="checkbox" id="aiSaveHistory" ${c.saveHistory!==false?'checked':''}>会話履歴をこの端末に保存する（ファイルの中身は保存しません）</label>
        <label class="check" style="margin-top:10px"><input type="checkbox" id="aiAutoSpeak" ${c.autoSpeak?'checked':''}>AIの回答を自動で読み上げる</label>
        <div style="height:1px;background:var(--line);margin:14px 0 4px"></div>
        <div class="hint" style="font-weight:700;margin-bottom:2px">読み上げ音声</div>
        <div class="ttsModes" role="radiogroup" aria-label="読み上げ音声">
          <label class="check" style="margin-top:6px"><input type="radio" name="aiVoiceMode" value="character" ${(c.voiceMode||'character')==='character'?'checked':''}>キャラクター音声（Edge TTS → RVC。自分用のHugging Face Space、または自分のPCのTTSサーバーで生成）</label>
          <label class="check" style="margin-top:6px"><input type="radio" name="aiVoiceMode" value="browser" ${c.voiceMode==='browser'?'checked':''}>ブラウザ標準音声</label>
          <label class="check" style="margin-top:6px"><input type="radio" name="aiVoiceMode" value="off" ${c.voiceMode==='off'?'checked':''}>読み上げなし</label>
        </div>
        <div id="aiTtsBox" style="margin-top:8px">
          <label style="display:block"><span class="hint">TTSサーバーのURL（空欄 = Vercel経由で自分用のHugging Face Spaceを使う。PCで動かす場合のみ入力）</span><input id="aiTtsEndpoint" type="url" inputmode="url" autocomplete="off" placeholder="例：https://pc名.tailnet名.ts.net　または　http://localhost:8765" style="width:100%" value="${esc(c.ttsEndpoint||'')}"></label>
          <label style="display:block;margin-top:6px"><span class="hint">TTSアクセスキー（PCのTTSサーバーを使う場合のみ。サーバー起動時に表示されるもの）</span><input id="aiTtsKey" type="password" autocomplete="off" style="width:100%" value="${esc(c.ttsKey||'')}"></label>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">
            <label style="flex:1;min-width:110px"><span class="hint">声の高さ(Tune)</span><input id="aiTtsPitch" type="number" step="1" min="-24" max="24" style="width:100%" value="${esc(c.ttsPitch??6)}"></label>
            <label style="flex:1;min-width:110px"><span class="hint">速度(%)</span><input id="aiTtsSpeed" type="number" step="10" min="-100" max="100" style="width:100%" value="${esc(c.ttsSpeed??0)}"></label>
            <label style="flex:1;min-width:110px"><span class="hint">音量(%)</span><input id="aiTtsVolume" type="number" step="10" min="0" max="100" style="width:100%" value="${esc(c.ttsVolume??100)}"></label>
          </div>
          <label class="check" style="margin-top:10px"><input type="checkbox" id="aiTtsFallback" ${c.ttsFallback!==false?'checked':''}>キャラクター音声が利用できない場合、ブラウザ音声を使用</label>
          <details style="margin-top:8px"><summary class="hint">詳細設定（通常は変更不要）</summary>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
              <label><span class="hint">モデル名（空欄=サーバーの既定）</span><input id="aiTtsModel" style="width:100%" value="${esc(c.ttsModel||'')}"></label>
              <label><span class="hint">Edge TTS の話者</span><input id="aiTtsVoice" style="width:100%" value="${esc(c.ttsVoice||'ja-JP-NanamiNeural')}"></label>
              <label><span class="hint">ピッチ抽出</span><select id="aiTtsF0" style="width:100%"><option value="rmvpe" ${c.ttsF0!=='pm'?'selected':''}>rmvpe</option><option value="pm" ${c.ttsF0==='pm'?'selected':''}>pm</option></select></label>
              <label><span class="hint">Index Rate (0–1)</span><input id="aiTtsIndexRate" type="number" step="0.05" min="0" max="1" style="width:100%" value="${esc(c.ttsIndexRate??1)}"></label>
              <label><span class="hint">Protect (0–0.5)</span><input id="aiTtsProtect" type="number" step="0.01" min="0" max="0.5" style="width:100%" value="${esc(c.ttsProtect??0.33)}"></label>
              <label><span class="hint">Filter Radius (0–7)</span><input id="aiTtsFilterRadius" type="number" step="1" min="0" max="7" style="width:100%" value="${esc(c.ttsFilterRadius??3)}"></label>
              <label><span class="hint">RMS Mix Rate (0–1)</span><input id="aiTtsRmsMix" type="number" step="0.05" min="0" max="1" style="width:100%" value="${esc(c.ttsRmsMix??0.25)}"></label>
            </div>
          </details>
          <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" type="button" id="aiTtsTest">音声サーバーの接続テスト</button><button class="btn sm" type="button" id="aiTtsSample">試し聞き</button></div>
          <div id="aiTtsResult" class="hint" style="margin-top:8px;line-height:1.7" aria-live="polite"></div>
          <div class="hint" style="margin-top:6px">読み上げのためにGeminiへ追加で送信することはありません（すでに表示された回答の文字列だけを、あなたのTTSサーバーへ送ります）。モデルファイルはこのアプリには含まれず、PC側にだけ置きます。</div>
        </div>
        <div style="margin-top:12px"><button class="btn sm danger" type="button" id="aiClearHist">会話履歴をすべて削除</button></div>
        <div id="aiTestResult" class="hint" style="margin-top:12px;line-height:1.8" aria-live="polite"></div>
      </div>
      <div class="mFoot"><button class="btn" type="button" id="aiTest">接続テスト</button><span class="grow"></span><button class="btn" type="button" data-close>キャンセル</button><button class="btn primary" type="button" id="aiSave">保存</button></div>`,
      {onMount:box=>{
        const $b=s=>box.querySelector(s);
        const en=$b('#aiEnabled'),ep=$b('#aiEndpoint'),key=$b('#aiAccessKey'),local=$b('#aiPreferLocal'),notes=$b('#aiSendNotes'),out=$b('#aiTestResult'),testBtn=$b('#aiTest');
        const sched=$b('#aiSendSchedule'),acts=$b('#aiActions'),cfm=$b('#aiConfirmFile'),hist=$b('#aiSaveHistory'),spk=$b('#aiAutoSpeak');
        const readTts=()=>{const v=id=>($b('#'+id)||{}).value,n=(id,d)=>{const x=parseFloat(v(id));return isFinite(x)?x:d};
          return {voiceMode:(box.querySelector('input[name=aiVoiceMode]:checked')||{}).value||'character',ttsEndpoint:String(v('aiTtsEndpoint')||'').trim(),ttsKey:String(v('aiTtsKey')||'').replace(/[\s\u200B-\u200D\uFEFF]+/g,''),
            ttsFallback:!!($b('#aiTtsFallback')&&$b('#aiTtsFallback').checked),ttsPitch:n('aiTtsPitch',6),ttsSpeed:n('aiTtsSpeed',0),ttsVolume:n('aiTtsVolume',100),
            ttsModel:String(v('aiTtsModel')||'').trim(),ttsVoice:String(v('aiTtsVoice')||'').trim()||'ja-JP-NanamiNeural',ttsF0:v('aiTtsF0')==='pm'?'pm':'rmvpe',
            ttsIndexRate:n('aiTtsIndexRate',1),ttsProtect:n('aiTtsProtect',0.33),ttsFilterRadius:n('aiTtsFilterRadius',3),ttsRmsMix:n('aiTtsRmsMix',0.25)}};
        const ttsBox=$b('#aiTtsBox');
        const syncTts=()=>{const m=(box.querySelector('input[name=aiVoiceMode]:checked')||{}).value;ttsBox.style.display=m==='character'?'':'none'};
        box.querySelectorAll('input[name=aiVoiceMode]').forEach(r=>r.onchange=syncTts);syncTts();
        const ttsOut=$b('#aiTtsResult');
        $b('#aiTtsTest').onclick=async()=>{ttsOut.textContent='接続を確認しています…';const r=await KoujiTTS.test(readTts());ttsOut.textContent=(r.ok?'✔ ':'✘ ')+r.msg};
        $b('#aiTtsSample').onclick=()=>{
          /* 保存前の入力値で試せるよう、一時的に反映して再生し、直後に元へ戻す */
          const keep=Object.assign({},aiCfg());saveAiCfg(readTts());ttsOut.textContent='音声を生成しています…';
          KoujiTTS.clearCache();
          KoujiTTS.sample('',{onStart:()=>{ttsOut.textContent='再生中'},onEnd:()=>{ttsOut.textContent='再生しました'},onError:()=>{ttsOut.textContent='✘ 再生できませんでした（接続テストで原因を確認してください）'},onFallback:why=>{ttsOut.textContent='キャラクター音声に接続できないため、ブラウザ音声で再生します'}});
          localCfg.ai=keep;saveLocal();
        };
        $b('#aiClearHist').onclick=async()=>{
          if(!window.KoujiAIStore)return;
          if(await confirmBox('AI Workspaceの会話履歴をすべて削除します。予定・タスクのデータは変わりません。',{ok:'削除する'})){await KoujiAIStore.clear();window.KoujiAIWorkspace&&KoujiAIWorkspace.reloadHistory&&KoujiAIWorkspace.reloadHistory();toast('会話履歴を削除しました')}
        };
        en.value=String(!!c.enabled);
        key.value=c.accessKey||'';
        $b('#aiKeyShow').onclick=e=>{const v=key.type==='password';key.type=v?'text':'password';e.currentTarget.textContent=v?'隠す':'表示'};
        const fb=$b('#aiFallback'),fbRow=$b('#aiFbRow'),infoBody=$b('#aiSendInfoBody');
        const curProv=()=>(box.querySelector('input[name=aiProv]:checked')||{}).value==='openai'?'openai':'gemini';
        const refreshProv=()=>{
          const p=curProv();
          fb.disabled=p==='openai';fbRow.style.opacity=p==='openai'?'.5':'1';
          infoBody.innerHTML=sendInfoHtml(p,{sendSchedule:sched.checked,sendNotes:notes.checked});
        };
        box.querySelectorAll('input[name=aiProv]').forEach(r=>r.onchange=refreshProv);
        sched.addEventListener('change',refreshProv);notes.addEventListener('change',refreshProv);
        refreshProv();
        /* 入力値 → 設定オブジェクト（保存と接続テストで同じ関数を使い、値の食い違いをなくす） */
        const readForm=()=>{const n=normEndpoint(ep.value);return {enabled:en.value==='true',endpoint:n.url,accessKey:cleanKey(key.value)||n.key,preferLocal:local.checked,sendNotes:notes.checked,
          sendSchedule:sched.checked,actionsEnabled:acts.checked,confirmFileSend:cfm.checked,saveHistory:hist.checked,autoSpeak:spk.checked,...readTts(),profile:(($b('#aiProfile')||{}).value||'').trim().slice(0,1500),
          provider:(box.querySelector('input[name=aiProv]:checked')||{}).value==='openai'?'openai':'gemini',fallbackToOpenAI:!!($b('#aiFallback')&&$b('#aiFallback').checked&&(box.querySelector('input[name=aiProv]:checked')||{}).value!=='openai')}};
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
    .aiProvRow,.aiProvBox .check{align-items:flex-start;gap:8px;margin-top:8px}.aiProvRow small,.aiProvBox small{display:block;font-weight:400;opacity:.8;line-height:1.5}.aiSendInfo{margin-top:12px;border:1px solid var(--line);border-radius:8px;padding:8px 10px}.aiSendInfo summary{cursor:pointer;font-weight:700;font-size:13px}
    .aiTopBtn{font-weight:800;letter-spacing:.02em}.aiTopBtn .aiDot{width:7px;height:7px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
    .aiMark{width:34px;height:34px;border-radius:8px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;font-weight:900;letter-spacing:-.03em;flex:0 0 auto}.aiHead h2{margin-bottom:1px}.aiBody{padding:0;display:flex;flex-direction:column;min-height:360px}.aiSuggest{display:flex;gap:6px;padding:10px 12px;border-bottom:1px solid var(--line);overflow-x:auto}.aiSuggest button{flex:0 0 auto;height:28px;border:1px solid var(--line);border-radius:999px;padding:0 10px;color:var(--ink-2);background:var(--surface-2);font-size:12px}.aiChat{flex:1;min-height:280px;max-height:55vh;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:12px}.aiMsg{display:flex;flex-direction:column;max-width:86%}.aiMsg.user{margin-left:auto;align-items:flex-end}.aiMsg.bot{margin-right:auto;align-items:flex-start}.aiBubble{border:1px solid var(--line);background:var(--surface-2);border-radius:12px;padding:10px 12px;line-height:1.7;white-space:normal}.aiMsg.user .aiBubble{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}.aiMsg.thinking{opacity:.65}.aiActs{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.aiComposer{display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--line);background:var(--surface)}.aiComposer textarea{flex:1;resize:none;min-height:38px;max-height:100px;border:1px solid var(--line-2);border-radius:8px;background:var(--surface);padding:9px 10px;outline:none;font:inherit}.aiComposer textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
    @media(max-width:820px){.aiTopBtn{width:34px;padding:0;justify-content:center}.aiTopBtn .aiLbl{display:none}.aiBody{min-height:0}.aiChat{max-height:none;min-height:0}.aiSuggest{padding:8px}.aiMsg{max-width:92%}.aiComposer{padding-bottom:calc(10px + env(safe-area-inset-bottom))}}
    `;document.head.appendChild(st);
  }

  /* AI Workspace（assistant-workspace.js）が読み込まれていればそちらを開く。無い/失敗時は従来の小型チャットへ退避。 */
  function openEntry(){
    try{if(window.KoujiAIWorkspace&&typeof KoujiAIWorkspace.open==='function'){KoujiAIWorkspace.open();return}}catch(e){console.error(e)}
    openAssistant();
  }

  function installUi(){
    injectStyle();
    const omni=document.getElementById('omniBtn');
    if(omni&&!document.getElementById('aiTopBtn')){
      const b=document.createElement('button');b.id='aiTopBtn';b.type='button';b.className='btn aiTopBtn';b.innerHTML='<span class="aiTopAv"><img class="kn-icon" alt="" aria-hidden="true" width="28" height="28" src="./assets/avatar/i/idle.webp?v=20261004-av1"></span><span class="aiLbl">AI</span>';b.title='工事管理next AI';b.setAttribute('aria-label','AIアシスタントを開く');b.onclick=openEntry;omni.insertAdjacentElement('afterend',b);
      if(window.KoujiAvatar)KoujiAvatar.mount(b.querySelector('.aiTopAv'),{kind:'nav'});
    }
    const tab=document.getElementById('tabbar');
    if(tab&&!tab.querySelector('[data-act=ai]')){
      const b=document.createElement('button');b.type='button';b.dataset.act='ai';b.innerHTML='<span style="font-size:15px;font-weight:900;line-height:21px">AI</span>AI';b.onclick=openEntry;
      const tools=tab.querySelector('[data-act=menu]');tab.insertBefore(b,tools||null);
    }
    document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='k'){e.preventDefault();openEntry()}});
    migrateAiCfg();
    window.KoujiAI={open:openEntry,openLegacy:openAssistant,settings:openAiSettings,askLocal:localAnswer,test:()=>testConnection(aiCfg(),x=>console.log(x.state,x.label,x.detail||'')),
      /* AI Workspace が使う内部部品（通信・認証・設定・ローカル集計は従来の実装をそのまま共有する） */
      _i:{aiCfg,saveAiCfg,postAi,providerOf,providerLabel,sendInfoHtml,normEndpoint,cleanKey,AiError,localAnswer,rangeOfQuery,fullyUnderstood,modelLabel,migrateAiCfg,AI_DEFAULT}};
  }

  if(document.readyState==='complete')installUi();else window.addEventListener('load',installUi,{once:true});
})();