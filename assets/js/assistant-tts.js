/* =========================================================
   assistant-tts.js — 読み上げ音声ルーター（キャラクター音声 / ブラウザ音声 / なし）
   流れ: Geminiの回答テキスト（すでに取得済みの文字列）→ TTS Router
         ├ キャラクター音声: ローカルTTSサーバー（Edge TTS → RVC）へ POST /tts → WAV を Web Audio で再生
         └ ブラウザ音声   : speechSynthesis（既存の実装）
   ・Gemini / AIプロバイダ / 認証は一切触らない（このファイルからGeminiへは通信しない）
   ・モデル(.pth/.index)はこのリポジトリに存在しない。ユーザーのPCのTTSサーバー側にだけ置く（local-tts/README.md）
   ・口パク: 再生中の音量を AnalyserNode で測り、KoujiAvatar.setMouthLevel() に渡す（closed/half/open）
   ・失敗時: 設定「利用できない場合はブラウザ音声」(既定ON)で speechSynthesis へ切り替え
   ・キャッシュ: メモリのみ・短時間（業務文章をブラウザへ永続保存しない）
   ========================================================= */
'use strict';
(function(){
  const AI=()=>window.KoujiAI&&window.KoujiAI._i,V=()=>window.KoujiAIVoice;
  const cfg=()=>{try{return AI().aiCfg()}catch(e){return {}}};
  const DEF={voiceMode:'character',ttsEndpoint:'',ttsKey:'',ttsFallback:true,ttsPitch:6,ttsSpeed:0,ttsVolume:100,
    ttsModel:'',ttsVoice:'ja-JP-NanamiNeural',ttsF0:'rmvpe',ttsIndexRate:1,ttsProtect:0.33,ttsFilterRadius:3,ttsRmsMix:0.25};
  /* Hugging Face Space「John6666/mikuTTS」の既定値（app.py で確認）: Tune=6, rmvpe, index_rate=1, protect=0.33, filter_radius=3, rms_mix_rate=0.25, Edge TTS=ja-JP-NanamiNeural, speed/volume/pitch=0 */
  const T=()=>Object.assign({},DEF,cfg());
  const num=(v,d,lo,hi)=>{v=+v;if(!isFinite(v))v=d;return Math.min(hi,Math.max(lo,v))};

  /* ---------- 接続先 ---------- */
  function baseUrl(raw){
    let u=String(raw||'').trim().replace(/[\s​-‍﻿]+/g,'');
    if(!u)return '';
    if(!/^https?:\/\//i.test(u))u='http://'+u;
    return u.replace(/\/(tts|status|health)\/?$/i,'').replace(/\/+$/,'');
  }
  const configured=()=>{const t=T();return !!(baseUrl(t.ttsEndpoint)&&String(t.ttsKey||'').trim())};
  const mode=()=>{const m=T().voiceMode;return m==='browser'||m==='off'?m:'character'};
  /* https のページから http の(localhost以外の)サーバーへは、ブラウザが混在コンテンツとして遮断する */
  function mixedBlocked(url){
    try{const u=new URL(url);return location.protocol==='https:'&&u.protocol==='http:'&&!/^(localhost|127\.|\[::1\])/.test(u.hostname)}catch(e){return false}
  }

  /* ---------- 読み上げ用の整形（キャラクター音声のみ。ブラウザ音声の既存処理は変更しない） ---------- */
  function normalize(raw){
    let t=V()._t.speakText(raw);
    t=t.replace(/(\d{4})[-\/年](\d{1,2})[-\/月](\d{1,2})日?/g,(m,y,mo,d)=>`${y}年${+mo}月${+d}日`)
       .replace(/(?<![\d])(\d{1,2})\/(\d{1,2})(?![\d\/])/g,(m,mo,d)=>`${+mo}月${+d}日`)
       .replace(/時00分/g,'時').replace(/時0(\d)分/g,'時$1分')
       .replace(/\s*[〜~～]\s*/g,'から')
       .replace(/[()（）「」『』【】\[\]]/g,'、')
       .replace(/、{2,}/g,'、').replace(/^、|、$/g,'');
    return t.trim();
  }
  /* 文の途中で切れないよう句点・改行で分割。短い文は次とまとめ、長い文は読点でだけ切る */
  function split(text,max=90,min=14){
    const sents=text.split(/(?<=[。！？!?])/).map(s=>s.trim()).filter(Boolean);
    const out=[];let cur='';
    const push=s=>{if(s)out.push(s)};
    for(let s of sents){
      while(s.length>max){
        let cut=s.lastIndexOf('、',max);if(cut<20)cut=s.lastIndexOf(' ',max);if(cut<20)cut=max;else cut+=1;
        const head=s.slice(0,cut);s=s.slice(cut);
        if(cur){push(cur);cur=''}
        push(head);
      }
      if(!cur)cur=s;
      else if((cur+s).length<=max&&cur.length<min)cur+=s;
      else{push(cur);cur=s}
    }
    push(cur);
    return out;
  }

  /* ---------- メモリキャッシュ（短時間・小容量。永続保存しない） ---------- */
  const CACHE_MAX=24,CACHE_MS=8*60*1000,cache=new Map();
  const cacheGet=k=>{const e=cache.get(k);if(!e)return null;if(Date.now()-e.t>CACHE_MS){cache.delete(k);return null}cache.delete(k);cache.set(k,e);return e.b};
  const cachePut=(k,b)=>{cache.set(k,{b,t:Date.now()});while(cache.size>CACHE_MAX)cache.delete(cache.keys().next().value)};
  const clearCache=()=>cache.clear();

  /* ---------- Web Audio ---------- */
  let actx=null;
  function ctx(){
    if(!actx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;actx=new C()}
    return actx;
  }
  /* iOS Safari: ユーザー操作の中で AudioContext を resume し、無音を1回鳴らして解錠する（🔊押下・送信タップの同期処理内で呼ぶ） */
  function unlock(){
    try{
      const c=ctx();if(!c)return;
      if(c.state==='suspended')c.resume();
      const b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start(0);
    }catch(e){}
  }

  /* ---------- サーバー通信 ---------- */
  function headers(t){return {'Content-Type':'application/json','Authorization':'Bearer '+String(t.ttsKey||'').trim()}}
  function bodyFor(t,text){
    return {text,voice:'character',pitch:num(t.ttsPitch,6,-24,24),speed:num(t.ttsSpeed,0,-100,100),volume:0,
      model:String(t.ttsModel||''),tts_voice:String(t.ttsVoice||DEF.ttsVoice),f0_method:t.ttsF0==='pm'?'pm':'rmvpe',
      index_rate:num(t.ttsIndexRate,1,0,1),protect:num(t.ttsProtect,0.33,0,0.5),filter_radius:num(t.ttsFilterRadius,3,0,7),
      rms_mix_rate:num(t.ttsRmsMix,0.25,0,1),resample_sr:0};
  }
  function keyOf(b){return JSON.stringify([b.text,b.pitch,b.speed,b.model,b.tts_voice,b.f0_method,b.index_rate,b.protect,b.filter_radius,b.rms_mix_rate])}
  async function fetchWav(t,text,signal){
    const body=bodyFor(t,text),k=keyOf(body);
    const hit=cacheGet(k);if(hit)return hit;
    const ac=new AbortController(),to=setTimeout(()=>ac.abort(),60000);
    const onAbort=()=>ac.abort();signal&&signal.addEventListener('abort',onAbort);
    try{
      const r=await fetch(baseUrl(t.ttsEndpoint)+'/tts',{method:'POST',headers:headers(t),body:JSON.stringify(body),signal:ac.signal,cache:'no-store'});
      if(!r.ok){let m='';try{m=(await r.json()).error||''}catch(e){}const err=new Error(m||('HTTP '+r.status));err.status=r.status;throw err}
      const buf=await r.arrayBuffer();
      if(!buf.byteLength)throw new Error('empty audio');
      const c=ctx();if(!c)throw new Error('Web Audio unsupported');
      const audio=await new Promise((res,rej)=>c.decodeAudioData(buf,res,rej));
      cachePut(k,audio);return audio;
    }finally{clearTimeout(to);signal&&signal.removeEventListener('abort',onAbort)}
  }

  /* ---------- キャラクター音声エンジン ---------- */
  let run=0,cur=null;   // run: 世代番号（古い読み上げの処理を無効化）
  const characterEngine={
    name:'character',
    supported:()=>!!(window.AudioContext||window.webkitAudioContext),
    unlock,
    speak(text,cb={}){
      const t=T(),id=++run;
      const parts=split(normalize(text));
      if(!parts.length){cb.onEnd&&cb.onEnd();return}
      const ac=new AbortController(),c=ctx();
      const st={id,ac,src:null,raf:0,started:false,gain:null,ended:false};cur=st;
      const av=window.KoujiAvatar;
      const alive=()=>cur===st&&!st.ended;
      const gen=on=>{try{cb.onGenerating&&cb.onGenerating(on)}catch(e){}try{if(av){on?av.hold('ttsgen','speaking'):av.release('ttsgen')}}catch(e){}};
      const finish=(err)=>{
        if(st.ended)return;st.ended=true;cancelAnimationFrame(st.raf);gen(false);
        try{av&&av.setMouthLevel(null)}catch(e){}
        if(cur===st)cur=null;
        err?(cb.onError&&cb.onError(err)):(cb.onEnd&&cb.onEnd());
      };
      st.abort=()=>{if(st.ended)return;st.ended=true;ac.abort();cancelAnimationFrame(st.raf);gen(false);try{st.src&&st.src.stop()}catch(e){}try{av&&av.setMouthLevel(null)}catch(e){}if(cur===st)cur=null};
      /* ブラウザ音声へ切り替え（未再生ぶんの文章だけ） */
      const fallback=(rest,why)=>{
        st.ended=true;cancelAnimationFrame(st.raf);gen(false);try{av&&av.setMouthLevel(null)}catch(e){}if(cur===st)cur=null;
        const be=V().browser;
        if(!T().ttsFallback||!be||!be.supported()){cb.onError&&cb.onError(why||'character-voice-failed');return}
        try{cb.onFallback&&cb.onFallback(why)}catch(e){}
        be.speak(rest.join(' '),{onStart:()=>{if(!st.started)cb.onStart&&cb.onStart()},onEnd:cb.onEnd,onError:cb.onError});
      };
      const gain=c.createGain();gain.gain.value=num(t.ttsVolume,100,0,100)/100;
      const an=c.createAnalyser();an.fftSize=1024;an.smoothingTimeConstant=0.4;
      gain.connect(an);an.connect(c.destination);st.gain=gain;
      const wave=new Uint8Array(an.fftSize);let lvl=0;
      const tick=()=>{
        if(!alive())return;
        an.getByteTimeDomainData(wave);
        let sum=0;for(let i=0;i<wave.length;i++){const d=(wave[i]-128)/128;sum+=d*d}
        const rms=Math.sqrt(sum/wave.length)*3.2;           // 声の音量を 0〜1 程度へ
        lvl=lvl*0.5+rms*0.5;                                  // 平滑化（口がバタつかない）
        try{av&&av.setMouthLevel(lvl)}catch(e){}
        st.raf=requestAnimationFrame(tick);
      };
      (async()=>{
        gen(true);
        const pend=new Array(parts.length);
        const kick=i=>{if(i<parts.length&&!pend[i]){pend[i]=fetchWav(t,parts[i],ac.signal);pend[i].catch(()=>{})}};
        kick(0);kick(1);
        for(let i=0;i<parts.length;i++){
          let audio;
          try{audio=await pend[i]}catch(e){
            if(!alive())return;
            return fallback(parts.slice(i),(e&&e.name==='AbortError')?'timeout':(e&&e.message)||'error');
          }
          if(!alive())return;
          kick(i+1);kick(i+2);
          if(c.state==='suspended'){try{await c.resume()}catch(e){}}
          await new Promise(res=>{
            const src=c.createBufferSource();src.buffer=audio;src.connect(gain);st.src=src;
            src.onended=res;
            if(!st.started){st.started=true;gen(false);try{cb.onStart&&cb.onStart()}catch(e){};lvl=0;st.raf=requestAnimationFrame(tick)}
            src.start(0);
          });
          if(!alive())return;
        }
        finish();
      })();
    },
    stop(){if(cur){const st=cur;st.abort&&st.abort()}run++}
  };

  /* ---------- ルーター（Voice.tts のエンジンとして差し込む） ---------- */
  const router={
    name:'router',
    /* 読み上げが使えるか。「読み上げなし」なら false（🔊ボタン・自動読み上げが無効になる） */
    supported(){
      const m=mode();if(m==='off')return false;
      const b=V().browser&&V().browser.supported();
      if(m==='character'&&configured()&&characterEngine.supported())return true;
      return !!b;
    },
    unlock(){const m=mode();if(m==='off')return;if(m==='character'&&configured())unlock();try{V().browser&&V().browser.unlock()}catch(e){}},
    speak(text,cb={}){
      const be=V().browser,m=mode();
      if(m==='off'){cb.onEnd&&cb.onEnd();return}
      if(m==='character'&&configured()&&characterEngine.supported()&&!mixedBlocked(baseUrl(T().ttsEndpoint))){
        try{be&&be.stop()}catch(e){}
        characterEngine.speak(text,cb);return;
      }
      if(m==='character'&&configured()){try{cb.onFallback&&cb.onFallback(mixedBlocked(baseUrl(T().ttsEndpoint))?'mixed-content':'unsupported')}catch(e){}}
      if(be&&be.supported())be.speak(text,cb);else cb.onError&&cb.onError('unsupported');
    },
    stop(){try{characterEngine.stop()}catch(e){}try{V().browser&&V().browser.stop()}catch(e){}}
  };

  /* ---------- 接続テスト・試し聞き（設定画面から） ---------- */
  async function test(over){
    const t=Object.assign(T(),over||{}),url=baseUrl(t.ttsEndpoint);
    if(!url)return {ok:false,msg:'キャラクター音声サーバーのURLが未設定です'};
    if(!String(t.ttsKey||'').trim())return {ok:false,msg:'TTSアクセスキーが未設定です'};
    if(mixedBlocked(url))return {ok:false,msg:'このページ(https)から http のサーバーへは接続できません。https の URL（Tailscale Serve / Cloudflare Tunnel など）を使うか、同じPCの http://localhost を指定してください'};
    const ac=new AbortController(),to=setTimeout(()=>ac.abort(),8000);
    try{
      const r=await fetch(url+'/status',{headers:{'Authorization':'Bearer '+String(t.ttsKey).trim()},signal:ac.signal,cache:'no-store'});
      if(r.status===401||r.status===403)return {ok:false,msg:'TTSアクセスキーが違います'};
      if(!r.ok)return {ok:false,msg:'サーバーがエラーを返しました（HTTP '+r.status+'）'};
      const j=await r.json();
      const bits=[j.dryRun?'テストモード（合成音）':(j.rvc?'RVC 利用可':'RVC 未準備（Edge TTSのみ）'),j.models&&j.models.length?'モデル '+j.models.length+'件':'モデルなし'];
      return {ok:true,msg:'接続できました：'+bits.join('／'),info:j};
    }catch(e){
      return {ok:false,msg:e&&e.name==='AbortError'?'応答がありません（サーバー未起動、URL違い、またはネットワーク不通）':'接続できませんでした（サーバー未起動／URL・CORS設定／混在コンテンツの可能性）'};
    }finally{clearTimeout(to)}
  }
  /* 試し聞き: Voice.tts と同じ経路で再生（ユーザー操作の中で呼ぶ） */
  function sample(text,cb){
    const w=text||'お疲れさまです。今日の予定は5件あります。';
    router.unlock();V().tts.speak('sample',w,cb||{});
  }

  window.KoujiTTS={DEF,baseUrl,configured,mode,normalize,split,test,sample,clearCache,engine:characterEngine,router,
    _t:{mixedBlocked,bodyFor,cache,fetchWav}};
  /* 差し込み: 以後、Voice.tts は常にルーター経由で読み上げる */
  function install(){try{V().tts.setEngine(router)}catch(e){}}
  if(window.KoujiAIVoice)install();else window.addEventListener('load',install);
})();
