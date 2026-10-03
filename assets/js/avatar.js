'use strict';
/* =========================================================
   工事管理next — AvatarController
   AIアシスタントの表情・瞬き・口パク・待機状態を「アプリ内の状態」だけで決める。
   ・Gemini / OpenAI など外部APIは一切呼ばない（このファイルに fetch / XHR は無い。通信は静的な画像の読み込みのみ）。
   ・アプリ側は KoujiAvatar.set / hold / release / flash / setSpeaking を呼ぶだけ。
   素材: assets/avatar/（s=立ち絵512px / i=顔アイコン160px / a=目・口の重ね合わせ512px）
   ========================================================= */
(function(){
  const BASE='./assets/avatar/';
  const V='20261004-av1';
  const STATES=['idle','smile','thinking','speaking','listening','analyzing','success','warning','error','local','calendar','task','document','image','voice','sleep','greeting','pointing','serious','celebrate'];
  const LABEL={idle:'待機中',smile:'笑顔',thinking:'考え中',speaking:'回答中',listening:'聞き取り中',analyzing:'解析中',success:'完了',warning:'確認してください',error:'エラー',local:'端末内で処理中',calendar:'予定を処理中',task:'タスクを処理中',document:'書類を確認中',image:'画像を確認中',voice:'音声',sleep:'待機（スリープ）',greeting:'こんにちは',pointing:'ここに注目',serious:'重要',celebrate:'完了'};
  /* 顔アイコン(10種)が無い状態は近い表情のアイコンを使う */
  const ICON_OF={idle:'idle',smile:'smile',thinking:'thinking',speaking:'speaking',listening:'listening',analyzing:'analyzing',success:'success',warning:'warning',error:'error',sleep:'sleep',
    local:'idle',calendar:'smile',task:'smile',document:'analyzing',image:'analyzing',voice:'speaking',greeting:'smile',pointing:'idle',serious:'idle',celebrate:'success'};
  /* 目・口の重ね合わせが自然に乗る状態（素材パックのmanifest.animation.compatibleStates） */
  const ANIM_OK=new Set(['idle','smile','speaking','listening','success','voice','greeting','pointing','serious','celebrate']);
  const SLEEP_MS=90000;
  const reduced=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
  const url=(k,n)=>BASE+k+'/'+n+'.webp?v='+V;

  const imgCache=new Map();   /* path -> Promise<HTMLImageElement> */
  function load(path){
    if(!imgCache.has(path)){
      imgCache.set(path,new Promise((res,rej)=>{const im=new Image();im.decoding='async';im.onload=()=>res(im);im.onerror=()=>{imgCache.delete(path);rej(new Error('avatar load failed: '+path))};im.src=path}));
    }
    return imgCache.get(path);
  }

  const views=new Set();
  const S={base:'greeting',holds:[],flashState:null,flashTimer:0,speaking:false,audioDriven:false,state:'greeting',idleTimer:0,mouthT:0,mouthEpoch:0,blinkT:0,started:false,log:[]};

  function effective(){
    if(S.flashState)return S.flashState;
    if(S.holds.length)return S.holds[S.holds.length-1].state;
    return S.base;
  }
  function recompute(){
    views.forEach(v=>{if(!v.el.isConnected){views.delete(v);v.destroy&&v.destroy()}});
    const next=effective();
    if(next===S.state)return;
    S.state=next;
    S.log.push(next);if(S.log.length>200)S.log.shift();
    views.forEach(v=>v.render(next));
    syncMouth();
    try{window.dispatchEvent(new CustomEvent('kouji-avatar',{detail:{state:next,label:LABEL[next]}}))}catch(e){}
  }

  /* ----- ビュー ----- */
  class StageView{
    constructor(el){
      this.el=el;this.kind='stage';el.classList.add('kn-stage');
      el.innerHTML='<img class="kn-body" alt="" decoding="async"><img class="kn-ov kn-eyes" alt="" aria-hidden="true" hidden><img class="kn-ov kn-mouth" alt="" aria-hidden="true" hidden>';
      this.body=el.querySelector('.kn-body');this.eyes=el.querySelector('.kn-eyes');this.mouth=el.querySelector('.kn-mouth');
      el.setAttribute('role','img');
      this.shown=null;this.ticket=0;
      this.render(S.state);
    }
    async render(state){
      const t=++this.ticket;
      this.el.dataset.state=state;this.el.setAttribute('aria-label','AIアシスタント：'+LABEL[state]);
      this.eyes.hidden=true;this.mouth.hidden=true;
      try{await load(url('s',state))}catch(e){return}
      if(t!==this.ticket)return;
      this.body.src=url('s',state);this.shown=state;
      if(S.speaking)syncMouth();
    }
    setOverlay(kind,name){const im=kind==='eyes'?this.eyes:this.mouth;if(!name){im.hidden=true;return}const u=url('a',kind+'_'+name);if(im.getAttribute('src')!==u)im.src=u;im.hidden=false}
    destroy(){this.ticket++;this.el.innerHTML='';this.el.classList.remove('kn-stage')}
  }
  class IconView{
    constructor(el,opts={}){
      this.el=el;this.kind=opts.kind||'icon';
      this.img=el.querySelector('img.kn-icon')||document.createElement('img');
      this.img.className='kn-icon';this.img.alt=opts.alt!==undefined?opts.alt:'';if(this.img.alt==='')this.img.setAttribute('aria-hidden','true');this.img.decoding='async';
      if(!this.img.parentNode)el.prepend(this.img);
      this.render(S.state);
    }
    render(state){
      this.el.dataset.av=state;
      const n=ICON_OF[state]||'idle';
      const u=url('i',n);
      if(this.img.getAttribute('src')!==u)this.img.src=u;
    }
    destroy(){}
  }

  /* ----- 瞬き（目の差分: open→half→closed→half→open。間隔はランダム）----- */
  function scheduleBlink(){
    clearTimeout(S.blinkT);
    if(document.hidden||reduced())return;
    S.blinkT=setTimeout(async()=>{
      if(ANIM_OK.has(S.state)&&!document.hidden){
        const st=[...views].filter(v=>v.kind==='stage'&&v.el.isConnected&&v.el.offsetParent!==null);
        if(st.length){
          const seq=[['half',55],['closed',85],['half',55]];
          for(const [f,ms] of seq){st.forEach(v=>v.setOverlay('eyes',f));await new Promise(r=>setTimeout(r,ms));if(!ANIM_OK.has(S.state))break}
          st.forEach(v=>v.setOverlay('eyes',null));
        }
      }
      scheduleBlink();
    },2800+Math.random()*3800);
  }
  /* ----- 口パク（読み上げ中のみ。closed/half/open をランダムに110〜200ms間隔で）----- */
  function syncMouth(){
    S.mouthEpoch++;clearTimeout(S.mouthT);S.mouthFrame=null;
    const st=[...views].filter(v=>v.kind==='stage');
    if(!S.speaking||!ANIM_OK.has(S.state)||document.hidden){st.forEach(v=>v.setOverlay('mouth',null));return}
    if(S.audioDriven)return;   /* 音声の音量で口を動かしている間は疑似口パクを止める */
    const ep=S.mouthEpoch,frames=reduced()?['closed','half']:['closed','half','open','half'];
    const tick=()=>{
      if(ep!==S.mouthEpoch)return;
      const f=frames[Math.floor(Math.random()*frames.length)];
      st.forEach(v=>v.setOverlay('mouth',f));
      S.mouthT=setTimeout(tick,reduced()?260:110+Math.random()*90);
    };
    tick();
  }

  /* ----- 無操作でスリープ / 操作で復帰 ----- */
  function arm(){
    clearTimeout(S.idleTimer);
    S.idleTimer=setTimeout(()=>{if(!S.holds.length&&!S.speaking){S.base='sleep';recompute()}},SLEEP_MS);
  }
  function wake(){
    if(S.base==='sleep'){S.base='idle';recompute()}
    arm();
  }

  const api={
    STATES,LABEL,ICON_OF,ANIM_OK,
    get state(){return S.state},
    get history(){return S.log.slice()},
    /* 基本状態（待機）を変える。success/errorのような一時表示は flash を使う */
    set(state,opts={}){
      if(!STATES.includes(state))throw new Error('unknown avatar state: '+state);
      if(opts.ttl){return api.flash(state,opts.ttl)}
      S.base=state;recompute();
      return api;
    },
    /* 処理中の状態を保持（複数同時でも最後のものを表示）。終わったら release(key) */
    hold(key,state){
      if(!STATES.includes(state))throw new Error('unknown avatar state: '+state);
      /* 新しい処理の開始は、前の一時表示(flash)より優先する */
      if(S.flashState){clearTimeout(S.flashTimer);S.flashState=null}
      S.holds=S.holds.filter(h=>h.key!==key);S.holds.push({key,state});recompute();arm();return api;
    },
    release(key){S.holds=S.holds.filter(h=>h.key!==key);recompute();return api},
    /* success / error / warning などの短時間表示。終わると保持中の状態か待機に戻る */
    flash(state,ms=2400){
      if(!STATES.includes(state))throw new Error('unknown avatar state: '+state);
      clearTimeout(S.flashTimer);S.flashState=state;recompute();
      S.flashTimer=setTimeout(()=>{S.flashState=null;recompute()},ms);arm();return api;
    },
    setSpeaking(on){
      on=!!on;
      if(on){api.hold('tts','speaking')}else{api.release('tts')}
      if(!on)S.audioDriven=false;
      S.speaking=on;syncMouth();
      if(on)arm();
    },
    /* 再生中の音量(0〜1)で口を動かす。null で疑似口パクに戻す。AI/RVCへは問い合わせない（JS側の簡易リップシンク） */
    setMouthLevel(level){
      if(level===null||level===undefined){if(S.audioDriven){S.audioDriven=false;syncMouth()}return}
      if(!S.speaking||!ANIM_OK.has(S.state)||document.hidden)return;
      if(!S.audioDriven){S.audioDriven=true;S.mouthEpoch++;clearTimeout(S.mouthT)}
      const lv=+level||0,f=lv<0.06?'closed':lv<0.18?'half':'open';
      if(S.mouthFrame===f)return;S.mouthFrame=f;
      [...views].filter(v=>v.kind==='stage').forEach(v=>v.setOverlay('mouth',f));
    },
    mount(el,opts={}){
      const kind=opts.kind||'icon';
      const v=kind==='stage'?new StageView(el):new IconView(el,opts);
      v.kind=kind==='stage'?'stage':kind;views.add(v);
      if(kind==='stage'){api.prefetch(['idle','greeting']);scheduleBlink()}
      return {el,view:v,unmount(){views.delete(v);v.destroy()}};
    },
    /* 必要な素材だけ先に読む（立ち絵は1枚≈70KB）。アイコンは小さいので初回に全部 */
    prefetch(states){states.forEach(s=>{load(url('s',s)).catch(()=>{})})},
    prefetchIcons(){new Set(Object.values(ICON_OF)).forEach(n=>load(url('i',n)).catch(()=>{}))},
    prefetchCommon(){
      const run=()=>{api.prefetch(['thinking','speaking','listening','analyzing','success','warning','error','local']);['eyes_open','eyes_half','eyes_closed','mouth_closed','mouth_half','mouth_open'].forEach(n=>load(url('a',n)).catch(()=>{}))};
      (window.requestIdleCallback||(f=>setTimeout(f,1500)))(run);
    },
    url,
    /* 開発用: 全状態の画像を読み、404・寸法・状態復帰を確認する */
    async selfTest(){
      const out=[];
      for(const s of STATES){
        try{const im=await load(url('s',s));out.push({state:s,ok:im.naturalWidth===512&&im.naturalHeight===512,w:im.naturalWidth,h:im.naturalHeight})}
        catch(e){out.push({state:s,ok:false,err:String(e.message)})}
      }
      for(const n of new Set(Object.values(ICON_OF))){
        try{const im=await load(url('i',n));out.push({state:'icon:'+n,ok:im.naturalWidth===160,w:im.naturalWidth,h:im.naturalHeight})}
        catch(e){out.push({state:'icon:'+n,ok:false,err:String(e.message)})}
      }
      for(const n of ['eyes_open','eyes_half','eyes_closed','mouth_closed','mouth_half','mouth_open']){
        try{const im=await load(url('a',n));out.push({state:'ov:'+n,ok:im.naturalWidth===512,w:im.naturalWidth,h:im.naturalHeight})}
        catch(e){out.push({state:'ov:'+n,ok:false,err:String(e.message)})}
      }
      return out;
    },
    /* 開発用テストパネル（?avatar=test）。全状態を順番に切り替える */
    openTestPanel(){
      let p=document.getElementById('knTest');if(p){p.remove();return}
      p=document.createElement('div');p.id='knTest';p.className='knTest';
      p.innerHTML='<div class="knTestHead"><b>Avatar test</b><button type="button" data-x>閉じる</button></div><div class="knTestStage" id="knTestStage"></div><div class="knTestBtns">'+STATES.map(s=>`<button type="button" data-s="${s}">${s}</button>`).join('')+'<button type="button" data-cycle>▶ 全状態を巡回</button><button type="button" data-speak>口パク</button></div><div class="knTestOut" id="knTestOut"></div>';
      document.body.appendChild(p);
      const m=api.mount(p.querySelector('#knTestStage'),{kind:'stage'});
      p.onclick=async e=>{
        const b=e.target.closest('button');if(!b)return;
        if(b.dataset.x!==undefined){m.unmount();p.remove();return}
        if(b.dataset.s)api.set(b.dataset.s);
        if(b.dataset.speak!==undefined)api.setSpeaking(!S.speaking);
        if(b.dataset.cycle!==undefined){const o=p.querySelector('#knTestOut');o.textContent='';for(const s of STATES){api.set(s);await new Promise(r=>setTimeout(r,600));o.textContent+=s+' '}api.set('idle')}
      };
    },
    _S:S
  };

  /* 起動: greeting → idle。操作・可視化イベントで sleep からも復帰 */
  function start(){
    if(S.started)return;S.started=true;
    S.base='greeting';S.state='greeting';
    api.prefetchIcons();
    setTimeout(()=>{if(S.base==='greeting'){S.base='idle';recompute()}},4500);
    ['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,wake,{passive:true,capture:true}));
    document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(S.blinkT);syncMouth()}else{wake();scheduleBlink();syncMouth()}});
    arm();scheduleBlink();
    try{if(/[?&]avatar=test/.test(location.search))setTimeout(()=>api.openTestPanel(),600)}catch(e){}
  }
  window.KoujiAvatar=api;
  window.setAvatarState=(s,o)=>api.set(s,o);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
