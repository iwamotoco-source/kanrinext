/* =========================================================
   assistant-workspace.js — 工事管理next AI Workspace（画面本体）
   部品: assistant.js（通信/認証/設定/ローカル集計）・assistant-storage.js（履歴）
         assistant-files.js（添付）・assistant-voice.js（音声）・assistant-actions.js（操作候補）
   方針: 端末内で答えられる質問は端末内で処理し、ファイル解析・自由な言い回しだけ Vercel → Gemini（標準）/ OpenAI（予備）へ送る。
         送る内容は送信前に確認でき、AIの提案は承認するまでデータを変更しない。
   ========================================================= */
'use strict';
(function(){
  const AI=()=>window.KoujiAI&&window.KoujiAI._i;
  const Store=()=>window.KoujiAIStore,Files=()=>window.KoujiAIFiles,Voice=()=>window.KoujiAIVoice,Act=()=>window.KoujiAIActions;
  const LAST_KEY='koujiNextAiLastConv';

  const S={
    el:null,open:false,conv:null,busy:false,ctrl:null,atts:[],ctx:{events:true,tasks:true},
    sent:new Map(),          /* メッセージID → 送信済み添付（メモリのみ。再送用） */
    lastReq:null,recording:false,histOpen:false,restored:false,ctxTimer:0
  };
  const $q=sel=>S.el.querySelector(sel);
  const cfg=()=>AI().aiCfg();
  const provLabel=()=>AI().providerLabel(AI().providerOf(cfg()));

  /* ---------- 小物 ---------- */
  const SVG={
    mic:'<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/>',
    send:'<path d="m4 11.5 16-7-6.5 15.5-2.5-6.5z"/>',
    spk:'<path d="M4.5 9.5h3l4.5-3.5v12l-4.5-3.5h-3z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    spkOff:'<path d="M4.5 9.5h3l4.5-3.5v12l-4.5-3.5h-3z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>',
    cam:'<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.5-2h5L16 7h2.5A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.5"/>',
    stop:'<rect x="7" y="7" width="10" height="10" rx="1.5"/>',
    clip:'<path d="m19 11-7.5 7.5a4.5 4.5 0 0 1-6.4-6.4L13 4.3a3 3 0 0 1 4.2 4.2L9.4 16.3a1.5 1.5 0 0 1-2.1-2.1l7-7"/>'
  };
  const ic=n=>SVG[n]?`<svg class="i" viewBox="0 0 24 24">${SVG[n]}</svg>`:icon(n);
  const mid=()=>'m'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const isPhone=()=>innerWidth<=820;

  /* 回答本文の整形: エスケープしてから **太字** と改行だけ許可 */
  function fmt(text){
    return esc(text).replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>');
  }
  const tagColor={PDF:'pdf',XLS:'xls',CSV:'xls',IMG:'img',DOC:'doc',TXT:'txt'};
  function chipHtml(a,{x=false,state=''}={}){
    const tag=a.tag||(Files().TAG[a.kind])||'FILE';
    const sub=a.status==='loading'?'解析中…':a.error?esc(a.error):esc(a.summary||'');
    return `<span class="aiChip ${tagColor[tag]||''} ${a.error?'err':''} ${a.status==='loading'?'busy':''} ${state}" data-aid="${esc(a.id||'')}">
      ${a.thumb?`<img src="${esc(a.thumb)}" alt="">`:''}<span class="tag">${esc(tag)}</span><span class="nm" title="${esc(a.name)}">${esc(a.name)}</span>${sub?`<span class="sub">${sub}</span>`:''}
      ${x?`<button type="button" class="x" data-rm="${esc(a.id)}" aria-label="添付を削除">${icon('x','i','width:13px;height:13px')}</button>`:''}</span>`;
  }

  /* ---------- 質問の振り分け ---------- */
  const ACT_VERB=/(追加|登録|入れて|いれて|作って|作成|にして|にしといて|変更|更新|編集|変えて|移動|ずらして|延期|完了にして|消して|削除|リマインド|メモして|メモを|設定して|予約|取って)/;
  const QUESTION=/[?？]|(ですか|ますか|でしょうか|かな|教えて|知りたい|見せて|まとめて|一覧|何件|何軒|何回|いくつ|どこ|いつ|何が|あるか|ありますか|提案|考えて|整理|分析|チェック|調べて|見て|確認して|比較|相談|アドバイス)/;
  function looksLikeAction(q){
    if(ACT_VERB.test(q))return true;
    const hasTime=/\d{1,2}\s*[:：時]\s*\d{0,2}/.test(q);
    const hasDate=/(今日|明日|明後日|来週|[月火水木金土日]曜|\d{1,2}\/\d{1,2}|\d{1,2}月\d{1,2}日)/.test(q);
    return (hasTime||hasDate)&&!QUESTION.test(q)&&/[でにへ]|から/.test(q)&&q.length<80;
  }
  const remoteOk=()=>{const c=cfg();return !!(c.enabled&&c.endpoint&&c.accessKey&&!c.localOnly)};
  const localOnly=q=>{try{return AI().localAnswer(q)}catch(e){return null}};

  /* AIへ送る登録データ。毎回全部は送らず、質問に関係する期間・状態だけに絞る。 */
  function buildContext(q,opt){
    const today=todayISO(),c=cfg(),empty={payload:null,counts:{events:0,tasks:0},range:null};
    if(c.sendSchedule===false)return Object.assign(empty,{off:true});
    const notes=!!c.sendNotes;
    let from=addDays(today,-14),to=addDays(today,75);
    try{const r=AI().rangeOfQuery(q);if(r){from=addDays(r.from,-1);to=addDays(r.to,1)}}catch(e){}
    const events=opt.events?occurrencesBetween(from,to,{}).slice(0,300).map(o=>({
      id:o.id,title:o.title,date:o.date,endDate:o.endDate||o.date,start:o.start||'',end:o.end||'',allDay:!!o.allDay,station:o.station||'',
      location:o.location||'',category:category(o.categoryId).name,...(o.rec?{recurring:true}:{}),...(notes&&o.note?{note:o.note}:{})
    })):[];
    let ts=[];
    if(opt.tasks){
      ts=state.tasks.filter(t=>!t.done);
      if(/完了|終わ|済/.test(q))ts=ts.concat(state.tasks.filter(t=>t.done).sort((a,b)=>(b.doneAt||0)-(a.doneAt||0)).slice(0,60));
      ts=ts.slice(0,300).map(t=>({id:t.id,title:t.title,station:t.stationName||'',priority:t.priority||'normal',date:taskDate(t)||'',time:t.time||'',done:!!t.done,...(notes&&t.note?{note:t.note}:{})}));
    }
    return {payload:{today,events,tasks:ts},counts:{events:events.length,tasks:ts.length},range:{from,to}};
  }

  /* ---------- 会話 ---------- */
  function newConv(){
    return {id:Store().newId(),title:'新しい会話',createdAt:Date.now(),updatedAt:Date.now(),messages:[]};
  }
  async function persist(){
    if(!S.conv||!S.conv.messages.length)return;
    try{await Store().save(S.conv,{persist:cfg().saveHistory!==false});localStorage.setItem(LAST_KEY,S.conv.id)}catch(e){}
    renderHistory();
  }
  function pushMsg(m){S.conv.messages.push(m);if(m.role==='user'&&S.conv.title==='新しい会話')S.conv.title=Store().titleOf(m.text);return m}

  /* ---------- 画面の組み立て ---------- */
  const AV_=()=>window.KoujiAvatar||{hold(){},release(){},flash(){},setSpeaking(){},mount(){return {unmount(){}}},state:'idle'};
  /* 通信・処理の状態を小さなステータスで表示（アバターの状態＝アプリが今していること） */
  function liveText(){
    const st=AV_().state,c=cfg();
    if(st==='error')return {t:'エラー',k:'err'};
    if(st==='analyzing'||st==='document'||st==='image')return {t:'解析中',k:'busy'};
    if(st==='thinking')return {t:AI().providerLabel(AI().providerOf(c))+' 考え中',k:'busy'};
    if(st==='listening')return {t:'聞き取り中',k:'busy'};
    if(st==='speaking'||st==='voice')return {t:'回答中',k:'busy'};
    if(st==='warning')return {t:'確認待ち',k:'warn'};
    if(st==='local')return {t:'ローカル',k:'local'};
    if(st==='calendar'||st==='task')return {t:'登録中',k:'busy'};
    if(st==='success'||st==='celebrate')return {t:'完了',k:'ok'};
    const ready=c.enabled&&c.endpoint&&c.accessKey;
    if(c.localOnly)return {t:'ローカルのみ',k:'local'};
    if(!ready)return {t:'ローカル',k:'local'};
    return {t:AI().providerLabel(AI().providerOf(c))+' 接続中',k:'ok'};
  }
  function updateLive(){const el=S.el&&$q('#aiLive');if(!el)return;const l=liveText();el.textContent=l.t;el.dataset.k=l.k}
  /* 最新のAI回答だけ小さなアバターを添える（過去の回答には出さない） */
  function placeAv(){
    if(!S.el)return;
    S.el.querySelectorAll('.aiMsgAv').forEach(n=>{n.parentNode&&n.parentNode.classList.remove('hasAv');n.remove()});
    const bots=S.el.querySelectorAll('#aiMsgs .aiM.bot');const last=bots[bots.length-1];if(!last)return;
    const a=document.createElement('span');a.className='aiMsgAv';a.setAttribute('aria-hidden','true');
    a.innerHTML='<img class="kn-icon" alt="" width="40" height="40" src="./assets/avatar/i/idle.webp?v=20261004-av1">';
    last.classList.add('hasAv');last.prepend(a);AV_().mount(a,{kind:'icon'});
  }
  function greetText(){
    const h=new Date().getHours();let n=0,o=0;
    try{n=occurrencesBetween(todayISO(),todayISO(),{cats:visibleCats()}).length;o=state.tasks.filter(x=>!x.done).length}catch(e){}
    const g=h<11?'おはようございます':h<17?'こんにちは':'お疲れさまです';
    return `${g}。今日は予定が${n}件、未完了のタスクが${o}件あります。`;
  }
  function build(){
    const el=document.createElement('div');
    el.id='aiWs';el.className='aiWs';el.hidden=true;
    el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','工事管理next AI Workspace');
    el.innerHTML=`
    <aside class="aiWsSide" id="aiSide" aria-label="会話履歴">
      <div class="aiSideHead"><b>会話履歴</b><button class="btn sm primary" type="button" id="aiNewSide">${icon('plus','i','width:15px;height:15px')}新しい会話</button></div>
      <div class="aiHist" id="aiHist"></div>
      <div class="aiSideFoot"><button class="btn sm ghost" type="button" id="aiCfgSide">${icon('cog','i','width:15px;height:15px')}設定</button></div>
    </aside>
    <div class="aiSideScrim" id="aiSideScrim"></div>
    <section class="aiWsMain">
      <header class="aiWsHead">
        <button class="btn ghost icon aiHistBtn" type="button" id="aiHistBtn" aria-label="会話履歴">${icon('menu')}</button>
        <div class="aiMark" id="aiHeadAv"><img class="kn-icon" alt="" aria-hidden="true" width="40" height="40" src="./assets/avatar/i/idle.webp?v=20261004-av1"></div>
        <div class="aiWsTitle"><h2>工事管理next AI <span class="aiLive" id="aiLive" role="status" aria-live="polite"></span></h2><div class="hint" id="aiStatus"></div></div>
        <span class="grow"></span>
        <button class="btn ghost icon" type="button" id="aiNew" title="新しい会話" aria-label="新しい会話">${icon('plus')}</button>
        <button class="btn ghost icon" type="button" id="aiSpeakToggle" title="自動読み上げ" aria-label="自動読み上げ" aria-pressed="false"></button>
        <button class="btn ghost icon" type="button" id="aiCfg" title="AI設定" aria-label="AI設定">${icon('cog')}</button>
        <button class="btn ghost icon" type="button" id="aiClose" title="閉じる" aria-label="閉じる">${icon('x')}</button>
      </header>
      <div class="aiWsScroll" id="aiScroll"><div class="aiWsInner" id="aiMsgs" aria-live="polite"></div></div>
      <footer class="aiWsComposer" id="aiComposer">
        <div class="aiCtx" id="aiCtx"></div>
        <div class="aiRec" id="aiRec" hidden><span class="dot"></span><span id="aiRecText">録音中…話してください</span><button class="btn sm" type="button" id="aiRecStop">${ic('stop')}停止</button></div>
        <div class="aiChips" id="aiChips"></div>
        <div class="aiInRow">
          <button class="btn icon aiRound" type="button" id="aiPlus" aria-label="添付（写真・カメラ・ファイル）" title="添付">${icon('plus')}</button>
          <textarea id="aiInput" rows="1" placeholder="AIに質問・依頼" autocomplete="off" enterkeyhint="send"></textarea>
          <button class="btn icon aiRound" type="button" id="aiMic" aria-label="音声入力" title="音声入力">${ic('mic')}</button>
          <button class="btn primary icon aiRound" type="button" id="aiSend" aria-label="送信" title="送信">${ic('send')}</button>
        </div>
        <input type="file" id="aiFilePhoto" accept="image/*" multiple hidden>
        <input type="file" id="aiFileCam" accept="image/*" capture="environment" hidden>
        <input type="file" id="aiFileDoc" accept="${Files().ACCEPT_DOC}" multiple hidden>
      </footer>
      <div class="aiDrop" id="aiDrop" hidden>ここにファイルをドロップして添付</div>
    </section>`;
    document.body.appendChild(el);
    S.el=el;
    wire();
    AV_().mount($q('#aiHeadAv'),{kind:'icon'});
    window.addEventListener('kouji-avatar',updateLive);updateLive();
  }

  function wire(){
    $q('#aiClose').onclick=close;
    $q('#aiNew').onclick=$q('#aiNewSide').onclick=()=>{newChat();if(isPhone())setHist(false)};
    $q('#aiCfg').onclick=$q('#aiCfgSide').onclick=()=>window.KoujiAI.settings();
    $q('#aiHistBtn').onclick=()=>setHist(!S.histOpen);
    $q('#aiSideScrim').onclick=()=>setHist(false);
    $q('#aiSend').onclick=()=>{if(S.busy)return;send()};
    $q('#aiSpeakToggle').onclick=()=>{AI().saveAiCfg({autoSpeak:!cfg().autoSpeak});if(!cfg().autoSpeak)Voice().tts.stop();refreshStatus()};
    const inp=$q('#aiInput');
    inp.addEventListener('input',()=>{grow();scheduleCtx()});
    inp.addEventListener('keydown',e=>{
      /* IME変換中のEnterは送信しない。iPhoneでは改行、PCでは Enter 送信（Shift+Enter 改行） */
      if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&e.keyCode!==229&&!isPhone()){e.preventDefault();if(!S.busy)send()}
    });
    inp.addEventListener('focus',()=>{setTimeout(()=>{window.scrollTo(0,0);scrollBottom()},320)});
    inp.addEventListener('paste',e=>{
      const fs=[...(e.clipboardData&&e.clipboardData.files||[])];
      if(fs.length){e.preventDefault();addFiles(fs)}
    });
    $q('#aiPlus').onclick=e=>{
      menu([
        {label:'写真を選ぶ',icon:'img',run:()=>$q('#aiFilePhoto').click()},
        {label:'カメラで撮影',icon:'target',run:()=>$q('#aiFileCam').click()},
        {label:'PDF・Excel・CSV・文書を選ぶ',icon:'pdf',run:()=>$q('#aiFileDoc').click()}
      ],e.currentTarget);
    };
    ['aiFilePhoto','aiFileCam','aiFileDoc'].forEach(id=>{const f=$q('#'+id);f.onchange=()=>{const fs=[...f.files];f.value='';addFiles(fs)}});
    $q('#aiMic').onclick=toggleMic;
    $q('#aiRecStop').onclick=()=>Voice().rec.stop();
    $q('#aiChips').addEventListener('click',e=>{
      const rm=e.target.closest('[data-rm]');
      if(rm){S.atts=S.atts.filter(a=>a.id!==rm.dataset.rm);renderChips();scheduleCtx();return}
      const chip=e.target.closest('.aiChip');
      if(chip){const a=S.atts.find(x=>x.id===chip.dataset.aid);if(a&&a.controls&&a.controls.length)openFileSettings(a)}
    });
    /* ドラッグ&ドロップ（PC） */
    const drop=$q('#aiDrop');let dc=0;
    S.el.addEventListener('dragenter',e=>{if(e.dataTransfer&&[...e.dataTransfer.types].includes('Files')){dc++;drop.hidden=false}});
    S.el.addEventListener('dragleave',()=>{dc=Math.max(0,dc-1);if(!dc)drop.hidden=true});
    S.el.addEventListener('dragover',e=>{if(e.dataTransfer&&[...e.dataTransfer.types].includes('Files'))e.preventDefault()});
    S.el.addEventListener('drop',e=>{e.preventDefault();dc=0;drop.hidden=true;if(e.dataTransfer.files.length)addFiles([...e.dataTransfer.files])});
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&S.open&&!modalOpen()&&!document.querySelector('.pop')){if(S.recording)Voice().rec.abort();else close()}
    });
    /* iPhone Safari: キーボード表示で入力欄が隠れないよう、見えている領域（visualViewport）に合わせて高さを追従 */
    if(window.visualViewport){
      visualViewport.addEventListener('resize',fitViewport);
      visualViewport.addEventListener('scroll',fitViewport);
    }
    addEventListener('resize',fitViewport);
    /* 設定モーダルが閉じたら状態表示を更新 */
    const sc=document.getElementById('scrim');
    if(sc&&window.MutationObserver)new MutationObserver(()=>{if(!sc.classList.contains('on'))refreshStatus()}).observe(sc,{attributes:true,attributeFilter:['class']});
  }

  function fitViewport(){
    if(!S.el||!S.open)return;
    const vv=window.visualViewport;
    if(vv){
      S.el.style.height=Math.round(vv.height)+'px';
      S.el.style.top=Math.round(vv.offsetTop)+'px';
      const kb=innerHeight-vv.height-vv.offsetTop>90;
      S.el.classList.toggle('kbOpen',kb);
      if(kb)scrollBottom();
    }
  }
  function grow(){const t=$q('#aiInput');t.style.height='auto';t.style.height=Math.min(t.scrollHeight,150)+'px'}
  function scrollBottom(){const s=$q('#aiScroll');if(!s)return;if(s.querySelector('.aiWelcome')){s.scrollTop=0;return}s.scrollTop=s.scrollHeight}
  function setHist(v){S.histOpen=!!v;S.el.classList.toggle('histOpen',S.histOpen)}

  /* ---------- 状態表示・参照中データ ---------- */
  function refreshStatus(){
    if(!S.el)return;
    const c=cfg(),ready=c.enabled&&c.endpoint&&c.accessKey,PL=provLabel();
    $q('#aiStatus').innerHTML=!ready?'外部AI：未設定｜予定・タスクの集計は端末内のみ（添付解析・自由な依頼には設定が必要）'
      :c.localOnly?'ローカルのみ｜外部AIへは何も送信しません（端末内の集計だけ）'
      :`外部AI：有効（Vercel → ${esc(PL)}${AI().providerOf(c)==='gemini'&&c.fallbackToOpenAI===true?'／上限時は OpenAI':''}）｜予定・タスクの集計は端末内を優先`;
    const b=$q('#aiSpeakToggle');
    b.innerHTML=ic(c.autoSpeak?'spk':'spkOff');b.setAttribute('aria-pressed',String(!!c.autoSpeak));
    b.title=c.autoSpeak?'自動読み上げ：オン':'自動読み上げ：オフ';
    b.hidden=!Voice().tts.supported();
    scheduleCtx(true);
  }
  function scheduleCtx(now){clearTimeout(S.ctxTimer);S.ctxTimer=setTimeout(renderCtx,now?0:220)}
  function renderCtx(){
    if(!S.el)return;
    const q=$q('#aiInput').value.trim(),c=cfg(),host=$q('#aiCtx');
    const hasFiles=S.atts.some(a=>!a.error&&a.status!=='loading');
    const local=!hasFiles&&q&&c.preferLocal!==false&&!looksLikeAction(q)&&localOnly(q)!==null;
    const ready=c.enabled&&c.endpoint&&c.accessKey;
    const bits=[];
    if(local){
      bits.push('<span class="aiCtxNote ok">端末内で回答（外部へ送信しません）</span>');
    }else{
      const ctx=buildContext(q,S.ctx);
      if(ctx.off)bits.push('<span class="aiCtxNote">予定・タスクは送信しません（設定）</span>');
      else{
        bits.push(`<button type="button" class="aiPill ${S.ctx.events?'on':''}" data-ctx="events" aria-pressed="${S.ctx.events}">予定 ${S.ctx.events?ctx.counts.events+'件':'送らない'}${S.ctx.events&&ctx.range?`<small>${fmtMD(ctx.range.from)}〜${fmtMD(ctx.range.to)}</small>`:''}</button>`);
        bits.push(`<button type="button" class="aiPill ${S.ctx.tasks?'on':''}" data-ctx="tasks" aria-pressed="${S.ctx.tasks}"><span class="long">未完了</span>タスク ${S.ctx.tasks?ctx.counts.tasks+'件':'送らない'}</button>`);
      }
      if(q||hasFiles)bits.push(`<span class="aiCtxNote">${!ready?'外部AI未設定':c.localOnly?'ローカルのみ（送信しません）':`送信先：${esc(provLabel())}（Vercel経由）`}</span>`);
    }
    /* 送信先の切替: ローカルのみ / Gemini（または選択中のAI）へ送信 */
    const dest=`<span class="aiDest" role="group" aria-label="送信先"><button type="button" class="${c.localOnly?'on':''}" data-dest="local" aria-pressed="${!!c.localOnly}">ローカルのみ</button><button type="button" class="${!c.localOnly?'on':''}" data-dest="ai" aria-pressed="${!c.localOnly}">${esc(provLabel())}へ送信</button></span>`;
    host.innerHTML=(bits.length?'<span class="aiCtxLbl">参照中</span>':'')+bits.join('')+dest;
    host.querySelectorAll('[data-dest]').forEach(b=>b.onclick=()=>{
      const toLocal=b.dataset.dest==='local';
      if(!toLocal&&!(c.enabled&&c.endpoint&&c.accessKey)){window.KoujiAI.settings();return}
      AI().saveAiCfg({localOnly:toLocal});refreshStatus();
      toast(toLocal?'ローカルのみ：外部AIへは送信しません':`${provLabel()}へ送信できます（端末内で答えられる質問は引き続き送信しません）`);
    });
    host.querySelectorAll('[data-ctx]').forEach(b=>b.onclick=()=>{S.ctx[b.dataset.ctx]=!S.ctx[b.dataset.ctx];renderCtx()});
  }

  /* ---------- 添付 ---------- */
  function renderChips(){
    $q('#aiChips').innerHTML=S.atts.map(a=>chipHtml(a,{x:true})).join('');
    $q('#aiChips').hidden=!S.atts.length;
    scheduleCtx(true);
  }
  async function addFiles(files){
    if(!files.length)return;
    const room=Files().LIM.maxFiles-S.atts.length;
    if(room<=0){toast(`添付は${Files().LIM.maxFiles}件までです`);return}
    if(files.length>room){toast(`添付は${Files().LIM.maxFiles}件までです。先頭の${room}件だけ追加します`);files=files.slice(0,room)}
    for(const f of files){
      const ph={id:'ph'+Math.random().toString(36).slice(2),name:f.name,status:'loading',kind:'file',tag:Files().TAG[Files().classify(f)]||'FILE'};
      S.atts.push(ph);renderChips();
      try{
        const a=await Files().prepare(f);
        const i=S.atts.findIndex(x=>x.id===ph.id);if(i<0)continue;
        S.atts[i]=a;
      }catch(e){
        const i=S.atts.findIndex(x=>x.id===ph.id);
        if(i>=0){S.atts[i]=Object.assign(ph,{status:'error',error:e.message||'読み込めませんでした'})}
        toast(`${f.name}：${e.message||'読み込めませんでした'}`);
      }
      renderChips();
    }
  }

  /* 添付ごとの送信内容設定／送信前確認。resolve(true)=送信 */
  function fileDialog(atts,{text,ctx,confirm}){
    return new Promise(resolve=>{
      let settled=false;const done=v=>{if(!settled){settled=true;resolve(v)}};
      const fileHtml=a=>`<div class="aiCfmFile" data-aid="${esc(a.id)}">
        <div class="aiCfmName">${chipHtml(a)}<span class="hint">${esc(Files().fmtSize(a.size||0))}</span></div>
        <ul class="aiCfmList" data-desc></ul>
        ${(a.controls||[]).map(ct=>{
          if(ct.type==='text')return `<label class="aiCfmCtl">${esc(ct.label)}<input data-k="${ct.key}" value="${esc(a.options[ct.key]||'')}" placeholder="${esc(ct.placeholder||'')}"></label>`;
          if(ct.type==='check')return `<label class="check aiCfmCtl"><input type="checkbox" data-k="${ct.key}" ${a.options[ct.key]?'checked':''}>${esc(ct.label)}</label>`;
          if(ct.type==='checks')return `<div class="aiCfmCtl"><div>${esc(ct.label)}</div>${ct.items.map(it=>`<label class="check"><input type="checkbox" data-ks="${ct.key}" value="${esc(it.value)}" ${a.options[ct.key].includes(it.value)?'checked':''}>${esc(it.label)}</label>`).join('')}</div>`;
          return '';
        }).join('')}</div>`;
      const ctxLine=ctx?(ctx.off?'送信しません（設定でオフ）':`予定 ${ctx.counts.events}件${ctx.range?`（${fmtMD(ctx.range.from)}〜${fmtMD(ctx.range.to)}）`:''}・タスク ${ctx.counts.tasks}件${cfg().sendNotes?'・メモを含む':'・メモは含まない'}`):'';
      openModal(`<div class="mHead"><h2>${confirm?'AIに送る内容の確認':'送信内容の設定'}</h2><button class="btn ghost icon" type="button" data-close aria-label="閉じる">${icon('x')}</button></div>
        <div class="mBody aiCfm">
          ${confirm?`<p class="hint">次の内容が Vercel 経由で <b>${esc(provLabel())}</b> に送られます。ファイルはこの端末内で処理し、Vercelにも${esc(provLabel())}にも保存を求めません。${AI().providerOf(cfg())==='gemini'?'<br><b>Gemini 無料枠では、入力・出力が Google の製品改善に使われる場合があります。</b>機密性の高い資料は送らず、キャンセルしてください（「ローカルのみ」に切り替えると何も送られません）。':''}</p>`:''}
          ${confirm?`<div class="aiCfmSec"><h4>質問</h4><div class="aiCfmText">${esc(text)}</div></div>
          <div class="aiCfmSec"><h4>工事管理nextのデータ</h4><div>${esc(ctxLine)}</div></div>`:''}
          <div class="aiCfmSec"><h4>添付ファイル</h4>${atts.map(fileHtml).join('')}<div class="hint" id="aiCfmTotal"></div></div>
        </div>
        <div class="mFoot"><span class="grow"></span><button class="btn" type="button" data-close>${confirm?'キャンセル':'閉じる'}</button>${confirm?'<button class="btn primary" type="button" id="aiCfmOk">この内容で送信</button>':''}</div>`,
        {wide:true,onClose:()=>done(false),onMount:box=>{
          const refresh=()=>{
            let imgs=0,chars=0,pdfs=0;
            atts.forEach(a=>{
              const el=box.querySelector(`.aiCfmFile[data-aid="${a.id}"] [data-desc]`);
              el.innerHTML=a.describe().map(x=>`<li>${esc(x)}</li>`).join('');
              const e=a.estimate();imgs+=e.images;chars+=e.chars;pdfs+=e.pdfs||0;
            });
            box.querySelector('#aiCfmTotal').textContent=`合計：画像 ${imgs}枚（上限${Files().LIM.imagesTotal}枚）${pdfs?`・PDF原本 ${pdfs}件`:''}・テキスト 約${chars.toLocaleString()}文字`;
          };
          box.querySelectorAll('.aiCfmFile').forEach(row=>{
            const a=atts.find(x=>x.id===row.dataset.aid);
            row.querySelectorAll('[data-k]').forEach(i=>i.onchange=i.oninput=()=>{a.options[i.dataset.k]=i.type==='checkbox'?i.checked:i.value;refresh()});
            row.querySelectorAll('[data-ks]').forEach(i=>i.onchange=()=>{
              a.options[i.dataset.ks]=[...row.querySelectorAll(`[data-ks="${i.dataset.ks}"]:checked`)].map(x=>x.value);refresh();
            });
          });
          refresh();
          const ok=box.querySelector('#aiCfmOk');
          if(ok)ok.onclick=()=>{done(true);closeModal()};
        }});
    });
  }
  const openFileSettings=a=>fileDialog([a],{confirm:false});

  /* ---------- 音声入力 ---------- */
  function toggleMic(){
    const V=Voice().rec;
    if(S.recording){V.stop();return}
    const inp=$q('#aiInput');
    if(!V.supported()){
      showRec(false);
      toast('このブラウザは音声認識に未対応です。キーボードのマイクボタンで音声入力できます');
      inp.focus();return;
    }
    const base=inp.value?inp.value.replace(/\s+$/,'')+' ':'';
    V.start({
      onStart:()=>{S.recording=true;AV_().hold('mic','listening');showRec(true,'録音中… 話してください（停止で入力欄に反映）')},
      onInterim:t=>{inp.value=base+t;grow();$q('#aiRecText').textContent='録音中… '+t.slice(-40)},
      onEnd:(final,err)=>{S.recording=false;AV_().release('mic');showRec(false);if(final){inp.value=base+final;grow();scheduleCtx(true);toast('音声を入力しました。内容を確認して送信してください')}},
      onError:(code,msg)=>{S.recording=false;AV_().release('mic');showRec(false);toast(msg||'音声入力に失敗しました');if(code==='service-not-allowed'||code==='unsupported')inp.focus()}
    });
  }
  function showRec(on,text){
    const r=$q('#aiRec');r.hidden=!on;if(text)$q('#aiRecText').textContent=text;
    $q('#aiMic').classList.toggle('rec',on);$q('#aiMic').setAttribute('aria-pressed',String(on));
  }

  /* ---------- 表示 ---------- */
  function suggestHtml(){
    const ready=cfg().enabled&&cfg().endpoint&&cfg().accessKey;
    const L=(t,go)=>`<button type="button" class="aiSug" data-q="${esc(t)}" data-go="${go?1:0}">${esc(t)}</button>`;
    return `<div class="aiWelcome">
      <div class="aiHero"><div class="aiStage" id="aiStage" style="--ratio:1"></div>
        <h3>${esc(greetText())}</h3>
        <p class="hint">予定・タスクの検索と集計は端末内で処理します。写真・図面・工程表（PDF/Excel）の解析や、自由な言い回しの依頼は外部AIに送ります（送信前に内容を確認できます）。</p></div>
      <div class="aiSugs">
        ${L('今日の予定は？',1)}${L('未完了のタスクは？',1)}${L('優先度が高いタスクは？',1)}${L('期限切れのタスクはある？',1)}${L('来週の予定をまとめて',1)}
        ${L('明日10時に厚木で現場調査',0)}
      </div>
      <div class="aiCaps">
        <div><b>端末内で回答</b><span>今日・今週の予定／未完了・優先度高・期限切れのタスク／駅ごとの予定／現場調査の件数</span></div>
        <div><b>写真・図面</b><span>注意点の指摘・記載情報の整理・数量の拾い・確認事項のタスク化</span></div>
        <div><b>工程表 PDF / Excel</b><span>来週分や電気工事だけの抽出 → 予定候補を一括登録</span></div>
        <div><b>音声</b><span>マイクで入力、回答の読み上げ（設定で自動読み上げ）</span></div>
      </div>
      <div class="aiCaps ops"><div><b>AIが実行できる操作（すべて承認後）</b><span>予定の追加・編集／タスクの追加・更新。AIは提案までで、あなたが確認して押した時だけ登録されます。</span></div></div>
      <p class="hint">${ready?'ファイル例：「この工程表から電気工事の予定を登録して」「この図面で確認が必要なところをタスクにして」':'添付ファイルの解析や予定・タスクの追加提案を使うには、右上の歯車からAI接続を設定してください。'}</p>
    </div>`;
  }

  function renderAll(){
    const host=$q('#aiMsgs');host.innerHTML='';
    if(!S.conv||!S.conv.messages.length){host.innerHTML=suggestHtml();bindSuggest(host);const st=$q('#aiStage');if(st)AV_().mount(st,{kind:'stage'});return}
    S.conv.messages.forEach(m=>host.appendChild(renderMsg(m)));
    placeAv();scrollBottom();
  }
  function bindSuggest(host){
    host.querySelectorAll('.aiSug').forEach(b=>b.onclick=()=>{
      const inp=$q('#aiInput');inp.value=b.dataset.q;grow();
      if(b.dataset.go==='1')send();else{inp.focus();scheduleCtx(true)}
    });
  }
  function refChips(m){
    const refs=[...(m.refs||[])];
    return refs.length?`<div class="aiRefs"><span class="aiRefLbl">参照</span>${refs.map(r=>{
      const att=(m.attachments||[]).find(a=>a.name===r);
      return att?chipHtml(att,{state:'ref'}):`<span class="aiChip ref ${r==='予定'?'refEv':r==='タスク'?'refTk':''}"><span class="nm">${esc(r)}</span></span>`;
    }).join('')}</div>`:'';
  }
  function renderMsg(m){
    const row=document.createElement('div');row.className='aiM '+(m.role==='user'?'user':'bot')+(m.error?' err':'');row.dataset.id=m.id;
    if(m.role==='user'){
      row.innerHTML=`<div class="aiBub">${fmt(m.text)}</div>${(m.attachments||[]).length?`<div class="aiAtts">${m.attachments.map(a=>chipHtml(a)).join('')}</div>`:''}`;
      return row;
    }
    const badge=m.error?'':m.mode==='local'?'<span class="aiBadge local">端末内で集計</span>':m.mode==='remote'?`<span class="aiBadge remote ${esc(m.provider||'openai')}">${esc(AI().providerLabel(m.provider||'openai'))}${m.model?' · '+esc(AI().modelLabel(m.model)):''}</span>${m.fallbackFrom?'<span class="aiBadge warn" title="設定「Geminiが利用できない場合、OpenAIを使用する」により切り替えました">Gemini利用不可のためOpenAIで回答</span>':''}`:'';
    const sent=m.sent?`<span class="aiSentInfo">送信：${esc(m.sent)}</span>`:'';
    row.innerHTML=`<div class="aiBub">${fmt(m.text)}</div>${refChips(m)}
      <div class="aiStations"></div><div class="aiActHost"></div>
      <div class="aiTools">${badge}${sent}<span class="grow"></span>
        ${m.error&&m.retry?'<button type="button" class="btn sm" data-retry>再試行</button>':''}
        ${m.error&&m.fixCfg?'<button type="button" class="btn sm" data-cfg>AI設定を開く</button>':''}
        ${m.mode==='local'&&!m.error&&remoteOk()?'<button type="button" class="btn sm" data-askai title="端末内の集計ではなく、外部AIに同じ質問を送ります">AIに聞き直す</button>':''}
        ${m.error?'':`<button type="button" class="btn sm ghost" data-speak>${ic('spk')}読み上げ</button><button type="button" class="btn sm ghost" data-copy>${icon('copy','i','width:15px;height:15px')}コピー</button>`}</div>`;
    const st=row.querySelector('.aiStations');
    [...new Set(m.stations||[])].slice(0,6).forEach(s=>{
      const b=document.createElement('button');b.type='button';b.className='btn sm';b.textContent=s+'駅を地図で見る';
      b.onclick=()=>{close();setTimeout(()=>showStationOnMap(s),30)};st.appendChild(b);
    });
    if(m.actions&&m.actions.length){
      const list=Act().revalidate(m.actions);
      Act().render(row.querySelector('.aiActHost'),list,{onChange:()=>{persist()}});
    }
    const sp=row.querySelector('[data-speak]');
    if(sp){
      const upd=()=>{const on=Voice().tts.speakingKey===m.id;sp.classList.toggle('on',on);sp.innerHTML=ic(on?'stop':'spk')+(on?'停止':'読み上げ')};
      sp.onclick=()=>{
        if(Voice().tts.speakingKey===m.id){Voice().tts.stop();upd();return}
        if(!Voice().tts.supported()){toast('このブラウザは読み上げに対応していません');return}
        Voice().tts.speak(m.id,m.text,{onStart:upd,onEnd:upd,onError:()=>toast('読み上げに失敗しました')});upd();
      };
    }
    const cp=row.querySelector('[data-copy]');
    cp&&(cp.onclick=async()=>{
      try{await navigator.clipboard.writeText(m.text);toast('コピーしました')}
      catch(e){const t=document.createElement('textarea');t.value=m.text;document.body.appendChild(t);t.select();try{document.execCommand('copy');toast('コピーしました')}catch(_){toast('コピーできませんでした')}t.remove()}
    });
    const rt=row.querySelector('[data-retry]');rt&&(rt.onclick=()=>{S.conv.messages=S.conv.messages.filter(x=>x.id!==m.id);row.remove();m.retry()});
    const cf=row.querySelector('[data-cfg]');cf&&(cf.onclick=()=>window.KoujiAI.settings());
    const ra=row.querySelector('[data-askai]');
    ra&&(ra.onclick=()=>{
      if(S.busy)return;
      const i=S.conv.messages.findIndex(x=>x.id===m.id);let q='';
      for(let k=i-1;k>=0;k--){if(S.conv.messages[k].role==='user'){q=S.conv.messages[k].text;break}}
      if(!q)return;
      S.forceRemote=true;$q('#aiInput').value=q;grow();send();
    });
    return row;
  }
  function addBot(m){
    const host=$q('#aiMsgs');
    if(host.querySelector('.aiWelcome'))host.innerHTML='';
    pushMsg(m);host.appendChild(renderMsg(m));placeAv();scrollBottom();return m;
  }
  function showThinking(label){
    const host=$q('#aiMsgs'),w=document.createElement('div');
    w.className='aiM bot thinking';
    w.innerHTML=`<div class="aiBub"><span class="aiDots"><i></i><i></i><i></i></span><span class="aiThinkText">${esc(label)}</span><button type="button" class="btn sm" data-cancel>中止</button></div>`;
    host.appendChild(w);placeAv();scrollBottom();
    const t0=Date.now(),tx=w.querySelector('.aiThinkText');
    const tick=setInterval(()=>{tx.textContent=`${tx.dataset.base||label}（${Math.round((Date.now()-t0)/1000)}秒）`},1000);
    w.querySelector('[data-cancel]').onclick=()=>{if(S.ctrl)S.ctrl.abort()};
    return {set:t=>{tx.dataset.base=t;tx.textContent=t},remove:()=>{clearInterval(tick);w.remove()}};
  }

  /* ---------- 送信 ---------- */
  const ERR={
    ACCESS_KEY_MISSING:'AIアクセスキーが未入力です。設定を確認してください。',
    ACCESS_KEY_INVALID:'AIアクセスキーが Vercel の APP_ACCESS_TOKEN と一致しません。設定を確認してください。',
    ACCESS_TOKEN_NOT_CONFIGURED:'Vercel 側に APP_ACCESS_TOKEN が設定されていません。',
    NO_ENDPOINT:'AIプロキシURLが未設定です。',
    NETWORK:'Vercel API に接続できません。ネットワーク接続・URL・CORS（ALLOWED_ORIGIN）を確認してください。',
    GEMINI_KEY_MISSING:'Gemini APIキーが設定されていません。Vercel の環境変数 GEMINI_API_KEY を登録して再デプロイしてください。',
    GEMINI_KEY_INVALID:'Gemini APIキーが無効、または権限がありません。Vercel の GEMINI_API_KEY を確認してください。',
    GEMINI_QUOTA:'Gemini無料枠の利用上限に達した可能性があります。しばらく待つか、明日もう一度お試しください。（設定で OpenAI へ切り替えることもできます）',
    GEMINI_ERROR:'Gemini でエラーが発生しました。時間をおいて再試行してください。',
    GEMINI_UNREACHABLE:'Vercel から Gemini に接続できませんでした。時間をおいて再試行してください。',
    BLOCKED:'Gemini の安全フィルターにより回答できませんでした。内容を変えて再試行してください。',
    TRUNCATED:'回答が長すぎて途中で切れました。依頼を小さく分けて（例：期間や工種を絞って）再試行してください。',
    PROVIDER_INVALID:'AIプロバイダーの設定が不正です。AI設定を開いて選び直してください。',
    OPENAI_KEY_MISSING:'Vercel 側に OPENAI_API_KEY が設定されていません。',
    OPENAI_KEY_INVALID:'OpenAI APIキーが無効です（Vercel の環境変数を確認）。',
    OPENAI_QUOTA:'OpenAI の利用上限または残高不足です。',
    MODEL_UNAVAILABLE:'AIモデルが利用できません。Vercel の GEMINI_MODEL / OPENAI_MODEL を確認してください。',
    PAYLOAD_TOO_LARGE:'送信データが大きすぎます。画像の枚数やファイルを減らして再試行してください。',
    TOO_MANY_FILES:'添付が多すぎます。',
    UNSUPPORTED_FILE:'対応していない形式の添付が含まれています。',
    TIMEOUT:'AIの応答が時間内に返りませんでした。添付を減らす／質問を絞って再試行してください。',
    EMPTY_RESPONSE:'AIの応答が空でした。もう一度お試しください。',
    OPENAI_ERROR:'OpenAI でエラーが発生しました。時間をおいて再試行してください。',
    OPENAI_UNREACHABLE:'Vercel から OpenAI に接続できませんでした。'
  };
  function errText(e){
    if(e&&e.code==='BAD_REQUEST'&&/query is required/.test(e.detail||''))return 'Vercel 側の API が古い版です（AI Workspace 未対応）。最新の api/ai.js をデプロイしてください。';
    const base=ERR[e&&e.code]||(e&&e.message)||'AIへの問い合わせに失敗しました。';
    const det=(e&&e.detail&&/^(GEMINI_ERROR|GEMINI_UNREACHABLE|MODEL_UNAVAILABLE|OPENAI_ERROR|OPENAI_UNREACHABLE|EMPTY_RESPONSE|BLOCKED|TRUNCATED|GEMINI_QUOTA)$/.test(e.code))?`\n（詳細：${String(e.detail).slice(0,160)}）`:'';
    return base+det+(e&&e.fallbackTried===true?'\n（設定に従い OpenAI への切り替えも試みましたが、利用できませんでした）':'');
  }
  const needsCfg=e=>/^ACCESS_|^NO_ENDPOINT|^NETWORK$|^GEMINI_KEY|^OPENAI_KEY|^GEMINI_QUOTA$|^OPENAI_QUOTA$|^PROVIDER_INVALID$/.test(e&&e.code||'');

  async function send(){
    const inp=$q('#aiInput');
    let text=inp.value.trim();
    const ready=S.atts.filter(a=>!a.error&&a.status!=='loading');
    if(S.atts.some(a=>a.status==='loading')){toast('ファイルを解析中です。少し待ってください');return}
    if(!text&&!ready.length)return;
    const withFiles=ready.length>0;
    if(!text)text='添付ファイルの内容を確認して、要点を整理してください。';
    const c=cfg(),remoteReady=c.enabled&&c.endpoint&&c.accessKey&&!c.localOnly;
    if(withFiles&&c.localOnly){toast('「ローカルのみ」のため、添付ファイルは解析できません（送信先を切り替えてください）');return}
    if(c.autoSpeak)Voice().tts.unlock();   /* iOS: 送信タップ中に音声を解錠 */
    Voice().tts.stop();

    /* 1) 添付なし: 端末内で答えられるものは端末内で */
    const force=S.forceRemote&&remoteReady;S.forceRemote=false;
    if(!withFiles&&!force&&c.preferLocal!==false&&!looksLikeAction(text)){
      const a=localOnly(text);
      if(a){
        userSay(text,[]);inp.value='';grow();scheduleCtx(true);
        const refs=[];if((a.meta.eventKeys||[]).length)refs.push('予定');if((a.meta.taskIds||[]).length)refs.push('タスク');
        const m=addBot({id:mid(),role:'bot',text:a.text,ts:Date.now(),mode:'local',stations:a.meta.stations||[],refs});
        AV_().flash('local',1800);afterBot(m);return;
      }
    }

    /* 2) 外部AIが必要 */
    if(!remoteReady){
      userSay(text,[]);inp.value='';grow();scheduleCtx(true);
      /* 「端末内を優先」をオフにしていても、外部AIが無ければ端末内の集計で答える */
      if(!withFiles&&!looksLikeAction(text)){
        const a=localOnly(text);
        if(a){
          const refs=[];if((a.meta.eventKeys||[]).length)refs.push('予定');if((a.meta.taskIds||[]).length)refs.push('タスク');
          afterBot(addBot({id:mid(),role:'bot',text:a.text,ts:Date.now(),mode:'local',stations:a.meta.stations||[],refs}));return;
        }
      }
      if(!withFiles&&looksLikeAction(text)&&c.actionsEnabled!==false){
        /* 外部AIが無くても、タスクだけは既存の簡易解析で候補化できる */
        const p=parseQuickTask(text);
        const acts=Act().normalize([{type:'task.add',title:p.title,date:p.date||null,start:p.time||null,station:p.station||null,guess:true,reason:'端末内の簡易解析（外部AI未設定）',priority:'normal'}]);
        const m=addBot({id:mid(),role:'bot',mode:'local',text:'外部AIが未設定のため、端末内の簡易解析で「タスク」として提案します。予定の追加・ファイル解析にはAI接続の設定が必要です。内容を確認して実行してください。',ts:Date.now(),actions:acts});
        afterBot(m,{noSpeak:false});return;
      }
      addBot({id:mid(),role:'bot',error:true,fixCfg:!c.localOnly,ts:Date.now(),
        text:c.localOnly?'「ローカルのみ」のため外部AIへは送信していません。この質問は端末内の集計では解釈できません。入力欄上の送信先を切り替えると、外部AIで回答できます。':withFiles?'添付ファイルの解析には外部AIの設定が必要です。右上の歯車から「外部AIを使用する」・AIプロキシURL・AIアクセスキーを設定してください。':'この質問は端末内の集計では解釈できません。外部AIを設定すると、自由な言い回しの質問や予定・タスクの追加提案ができます。'});
      persist();return;
    }

    const ctxOpt=Object.assign({},S.ctx);
    const ctx=buildContext(text,ctxOpt);
    /* 3) 添付の送信前確認（設定でオフ可）。キャンセルしても入力はそのまま残す */
    if(withFiles&&c.confirmFileSend!==false){
      const ok=await fileDialog(ready,{text,ctx,confirm:true});
      if(!ok)return;
    }
    const atts=ready.slice();
    const attMeta=atts.map(a=>({id:a.id,name:a.name,kind:a.kind,tag:a.tag,size:a.size,summary:a.summary}));
    const um=userSay(text,attMeta);
    S.sent.set(um.id,atts);
    inp.value='';grow();S.atts=[];renderChips();
    await runRemote({text,atts,ctxOpt,userMsg:um});
  }
  function userSay(text,attMeta){
    const host=$q('#aiMsgs');
    if(host.querySelector('.aiWelcome'))host.innerHTML='';
    const m=pushMsg({id:mid(),role:'user',text,ts:Date.now(),attachments:attMeta});
    host.appendChild(renderMsg(m));scrollBottom();return m;
  }
  function afterBot(m,{noSpeak}={}){
    persist();
    if(!noSpeak&&cfg().autoSpeak&&Voice().tts.supported()&&m.text&&!m.error)Voice().tts.speak(m.id,m.text,{onEnd:()=>{const b=S.el.querySelector(`.aiM[data-id="${m.id}"] [data-speak]`);if(b){b.classList.remove('on');b.innerHTML=ic('spk')+'読み上げ'}}});
  }

  async function runRemote(req){
    const {text,atts,ctxOpt,userMsg}=req;
    S.busy=true;$q('#aiSend').disabled=true;S.ctrl=new AbortController();
    const think=showThinking(atts.length?'添付を処理しています…':'考えています…');
    const kinds=atts.map(a=>a.kind||'');
    AV_().hold('req',atts.length?(kinds.includes('pdf')?'document':kinds.includes('image')?'image':'analyzing'):'thinking');
    const retry=()=>runRemote(req);
    try{
      let built={images:[],texts:[],pdfs:[],stats:{images:0,chars:0,imageBytes:0}};
      if(atts.length){
        built=await Files().buildAll(atts,{onProgress:t=>think.set(t)});
        think.set('AIに送信して解析しています…');
        AV_().hold('req','analyzing');
      }
      const ctx=buildContext(text,ctxOpt);
      const names=atts.map(a=>a.name);
      const hist=S.conv.messages.filter(m=>!m.error&&m.id!==userMsg.id&&(m.role==='user'||m.text)).slice(-10)
        .map(m=>({role:m.role==='user'?'user':'assistant',text:String(m.text||'').slice(0,1500)}));
      const body={mode:'workspace',today:todayISO(),
        messages:[...hist,{role:'user',text:text+(names.length?`\n（添付: ${names.join('、')}）`:'')}],
        context:ctx.payload||{today:todayISO(),tasks:[],events:[]},
        attachments:[
          ...built.images.map(i=>({kind:'image',name:i.name,label:i.label,data:i.data,detail:i.detail})),
          ...(built.pdfs||[]).map(p=>({kind:'pdf',name:p.name,label:p.label,data:p.data})),
          ...built.texts.map(t=>({kind:'text',name:t.name,label:t.label,text:t.text}))
        ],
        options:{actions:cfg().actionsEnabled!==false}};
      const data=await AI().postAi(cfg(),body,{signal:S.ctrl.signal});
      think.remove();
      if(!data||!data.answer)throw new (AI().AiError)('AIから回答を取得できませんでした','EMPTY_RESPONSE','server');
      const meta=data.meta||{};
      const acts=Act().normalize(meta.actions||[]);
      const sentBits=[];
      if(!ctx.off&&ctx.payload)sentBits.push(`予定${ctx.counts.events}件・タスク${ctx.counts.tasks}件`);
      if(built.stats.images)sentBits.push(`画像${built.stats.images}枚`);
      if((built.pdfs||[]).length)sentBits.push(`PDF原本${built.pdfs.length}件`);
      if(built.texts.length)sentBits.push(`テキスト約${built.stats.chars.toLocaleString()}文字`);
      /* 「参照」は、AIが言った内容ではなく、実際に送ったデータから作る（送っていないものを参照したことにしない） */
      const refs=[];
      if(!ctx.off&&ctx.payload){if(ctx.counts.events)refs.push('予定');if(ctx.counts.tasks)refs.push('タスク')}
      names.forEach(n=>refs.push(n));
      const m=addBot({id:mid(),role:'bot',mode:'remote',provider:data.provider||AI().providerOf(cfg()),model:data.model||'',fallbackFrom:data.fallbackFrom||'',text:String(data.answer),ts:Date.now(),
        stations:meta.stations||[],refs,attachments:userMsg.attachments,actions:acts,sent:sentBits.join('・')});
      AV_().release('req');
      if(acts.length)AV_().flash('warning',2600);
      else{AV_().flash('speaking',1500);setTimeout(()=>{if(!Voice().tts.speakingKey)AV_().flash('smile',1500)},1500)}
      afterBot(m);
    }catch(e){
      think.remove();
      AV_().release('req');
      if(e&&e.code==='ABORTED'){addBot({id:mid(),role:'bot',error:true,ts:Date.now(),text:'中止しました。',retry});}
      else{
        const fe=e instanceof (Files().FileError)?e.message:errText(e);
        addBot({id:mid(),role:'bot',error:true,ts:Date.now(),text:fe,retry,fixCfg:needsCfg(e)});
      }
      AV_().flash('error',3200);persist();
    }finally{
      S.busy=false;S.ctrl=null;$q('#aiSend').disabled=false;
    }
  }

  /* ---------- 履歴 ---------- */
  function groupLabel(ts){
    const d=new Date(ts),t=todayISO(),k=iso(d);
    if(k===t)return '今日';if(k===addDays(t,-1))return '昨日';if(k>=addDays(t,-7))return '過去7日間';return 'それ以前';
  }
  async function renderHistory(){
    if(!S.el)return;
    const list=await Store().list(),host=$q('#aiHist');
    if(!list.length){host.innerHTML='<div class="hint aiHistEmpty">まだ会話履歴はありません。</div>';return}
    let last='';
    host.innerHTML=list.map(c=>{
      const g=groupLabel(c.updatedAt),head=g!==last?`<div class="aiHistGrp">${g}</div>`:'';last=g;
      return head+`<div class="aiHistRow ${S.conv&&S.conv.id===c.id?'cur':''}" data-id="${esc(c.id)}"><button type="button" class="aiHistOpen" title="${esc(c.title)}">${esc(c.title)}</button><button type="button" class="aiHistDel" data-del aria-label="この会話を削除">${icon('trash','i','width:14px;height:14px')}</button></div>`;
    }).join('');
    host.querySelectorAll('.aiHistRow').forEach(r=>{
      r.querySelector('.aiHistOpen').onclick=()=>loadConv(r.dataset.id);
      r.querySelector('[data-del]').onclick=async e=>{
        e.stopPropagation();
        if(!await confirmBox('この会話を履歴から削除しますか？',{ok:'削除'}))return;
        await Store().remove(r.dataset.id);
        if(S.conv&&S.conv.id===r.dataset.id)newChat();else renderHistory();
      };
    });
  }
  async function loadConv(id){
    if(S.busy){toast('応答中は切り替えられません');return}
    const c=await Store().get(id);if(!c){renderHistory();return}
    Voice().tts.stop();S.conv=c;S.atts=[];renderChips();renderAll();renderHistory();
    try{localStorage.setItem(LAST_KEY,id)}catch(e){}
    if(isPhone())setHist(false);
  }
  function newChat(){
    if(S.busy){toast('応答中は新しい会話を始められません');return}
    Voice().tts.stop();S.conv=newConv();S.atts=[];$q('#aiInput').value='';grow();renderChips();renderAll();renderHistory();
    try{localStorage.removeItem(LAST_KEY)}catch(e){}
  }

  /* ---------- 開閉 ---------- */
  async function open(){
    if(!S.el)build();
    if(!S.conv){
      S.conv=newConv();
      if(!S.restored){
        S.restored=true;
        try{const id=localStorage.getItem(LAST_KEY);if(id){const c=await Store().get(id);if(c&&c.messages&&c.messages.length)S.conv=c}}catch(e){}
      }
    }
    S.el.hidden=false;S.open=true;
    document.documentElement.classList.add('aiWsOpen');
    document.body.classList.remove('railOpenM','paneOpenM','calSideOpenM');
    renderAll();renderHistory();renderChips();refreshStatus();fitViewport();
    if(!S.conv.messages.length)AV_().flash('greeting',3000);
    AV_().prefetchCommon&&AV_().prefetchCommon();
    if(!isPhone())setTimeout(()=>{const i=$q('#aiInput');i&&i.focus()},40);
  }
  function close(){
    if(!S.el)return;
    if(S.recording)Voice().rec.abort();
    Voice().tts.stop();
    S.el.hidden=true;S.open=false;setHist(false);AV_().setSpeaking(false);
    document.documentElement.classList.remove('aiWsOpen');
  }

  /* Service Worker更新による自動再読込を、入力・添付・応答待ち・録音中は待たせるための判定 */
  const busyOrDirty=()=>!!(S.el&&S.open&&(S.busy||S.recording||S.atts.length||($q('#aiInput')&&$q('#aiInput').value.trim())));
  window.KoujiAIWorkspace={open,close,busyOrDirty,
    reloadHistory:()=>{if(S.el&&!S.busy){S.conv=newConv();renderAll();renderHistory()}},
    get state(){return S},
    _t:{looksLikeAction,buildContext,fmt}};
})();
