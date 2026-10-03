/* =========================================================
   assistant-voice.js — AI Workspace の音声入力・読み上げ
   入力 : Web Speech API（SpeechRecognition / webkitSpeechRecognition）。
          非対応（iOSのホーム画面アプリ等）では、キーボードのマイク（OS標準の音声入力）を案内する。
          録音して外部へ送る文字起こしは、有料API追加になるため実装していない。
   出力 : 既定は SpeechSynthesis。setTtsEngine() で OpenAI 音声API等に差し替えられる構造。
   ========================================================= */
'use strict';
(function(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition||null;

  /* ---------- 音声入力 ---------- */
  const rec={
    supported:()=>!!(window.SpeechRecognition||window.webkitSpeechRecognition),
    _r:null,_active:false,
    get active(){return this._active},
    /* handlers: {onStart,onInterim(text),onFinal(text),onEnd,onError(code,message)} */
    start(handlers={}){
      const Ctor=window.SpeechRecognition||window.webkitSpeechRecognition;
      if(!Ctor){handlers.onError&&handlers.onError('unsupported','このブラウザは音声認識に対応していません。キーボードのマイクボタン（音声入力）をお使いください。');return false}
      if(this._active)this.stop();
      let r;
      try{r=new Ctor()}catch(e){handlers.onError&&handlers.onError('unsupported','音声認識を開始できません');return false}
      r.lang='ja-JP';r.interimResults=true;r.continuous=false;r.maxAlternatives=1;
      let finalText='',gotError=false;
      r.onstart=()=>{this._active=true;handlers.onStart&&handlers.onStart()};
      r.onresult=ev=>{
        let interim='';
        for(let i=ev.resultIndex;i<ev.results.length;i++){
          const res=ev.results[i],t=res[0]&&res[0].transcript||'';
          if(res.isFinal)finalText+=t;else interim+=t;
        }
        handlers.onInterim&&handlers.onInterim(finalText+interim);
      };
      r.onerror=ev=>{
        gotError=true;
        const code=ev&&ev.error||'error';
        const msg={'not-allowed':'マイクの使用が許可されていません。ブラウザ／iOSの設定でマイクを許可してください。',
          'service-not-allowed':'この環境では音声認識を使えません（iOSのホーム画面アプリでは制限される場合があります）。キーボードのマイクをお使いください。',
          'no-speech':'音声が聞き取れませんでした。もう一度話してください。',
          'audio-capture':'マイクが見つかりません。',
          'network':'音声認識のネットワークエラーです。',
          'aborted':''}[code];
        if(code!=='aborted')handlers.onError&&handlers.onError(code,msg||('音声認識エラー（'+code+'）'));
      };
      r.onend=()=>{this._active=false;this._r=null;handlers.onEnd&&handlers.onEnd(finalText.trim(),gotError)};
      this._r=r;
      try{r.start()}catch(e){this._active=false;this._r=null;handlers.onError&&handlers.onError('start-failed','音声認識を開始できませんでした');return false}
      return true;
    },
    stop(){try{this._r&&this._r.stop()}catch(e){}},
    abort(){try{this._r&&this._r.abort()}catch(e){}}
  };

  /* ---------- 読み上げ ---------- */
  function speakText(raw){
    /* 記号・URL・絵文字を読み上げ用に整える */
    return String(raw||'')
      .replace(/https?:\/\/\S+/g,'')
      .replace(/[*_`#>]/g,'')
      .replace(/[・●■□▶▼▲◆◇★☆※]/g,'、')
      .replace(/\p{Extended_Pictographic}/gu,'')
      .replace(/(\d{1,2}):(\d{2})/g,'$1時$2分')
      .replace(/\s*\n+\s*/g,'。')
      .replace(/。{2,}/g,'。').trim();
  }
  function chunk(text,max=110){
    /* iOS Safari は長い発話の途中で止まることがあるため、文単位で分割する */
    const out=[];let cur='';
    text.split(/(?<=[。！？!?])/).forEach(s=>{
      if((cur+s).length>max&&cur){out.push(cur);cur=''}
      while(s.length>max){out.push(s.slice(0,max));s=s.slice(max)}
      cur+=s;
    });
    if(cur.trim())out.push(cur);
    return out.filter(x=>x.trim());
  }
  let voiceCache=null;
  function pickVoice(){
    const vs=speechSynthesis.getVoices?speechSynthesis.getVoices():[];
    if(!vs.length)return null;
    if(voiceCache&&vs.includes(voiceCache))return voiceCache;
    const ja=vs.filter(v=>/^ja/i.test(v.lang));
    voiceCache=ja.find(v=>/kyoko|o-ren|otoya|google.*日本語|haruka|nanami/i.test(v.name))||ja.find(v=>v.localService)||ja[0]||null;
    return voiceCache;
  }
  const browserEngine={
    name:'speechSynthesis',
    supported:()=>'speechSynthesis' in window&&typeof SpeechSynthesisUtterance!=='undefined',
    /* iOSは最初の発話がユーザー操作中でないと無音になるため、送信ボタン押下時などに空発話で解錠する */
    unlock(){try{if(!this.supported())return;const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u)}catch(e){}},
    speak(text,{onStart,onEnd,onError}={}){
      if(!this.supported()){onError&&onError('unsupported');return}
      const parts=chunk(speakText(text));
      if(!parts.length){onEnd&&onEnd();return}
      try{speechSynthesis.cancel()}catch(e){}
      let i=0,stopped=false;
      this._stop=()=>{stopped=true;try{speechSynthesis.cancel()}catch(e){}};
      const next=()=>{
        if(stopped)return;
        if(i>=parts.length){onEnd&&onEnd();return}
        const u=new SpeechSynthesisUtterance(parts[i++]);
        u.lang='ja-JP';u.rate=1.02;const v=pickVoice();if(v)u.voice=v;
        u.onstart=()=>{if(i===1&&onStart)onStart()};
        u.onend=next;
        u.onerror=e=>{if(stopped)return;if(e&&(e.error==='interrupted'||e.error==='canceled'))return;onError&&onError(e&&e.error||'error')};
        speechSynthesis.speak(u);
      };
      next();
    },
    stop(){this._stop&&this._stop();this._stop=null;try{speechSynthesis.cancel()}catch(e){}}
  };
  let engine=browserEngine,speakingKey=null;
  const tts={
    get engine(){return engine},
    /* 将来 OpenAI 音声API等へ差し替える口: {name,supported(),speak(text,{onStart,onEnd,onError}),stop(),unlock?()} */
    setEngine(e){try{engine.stop()}catch(_){}engine=e||browserEngine},
    supported:()=>engine.supported(),
    unlock:()=>engine.unlock&&engine.unlock(),
    get speakingKey(){return speakingKey},
    speak(key,text,cb={}){
      this.stop();speakingKey=key;
      engine.speak(text,{
        onStart:()=>{cb.onStart&&cb.onStart()},
        onEnd:()=>{if(speakingKey===key)speakingKey=null;cb.onEnd&&cb.onEnd()},
        onError:c=>{if(speakingKey===key)speakingKey=null;cb.onError&&cb.onError(c);cb.onEnd&&cb.onEnd()}
      });
    },
    stop(){const k=speakingKey;speakingKey=null;try{engine.stop()}catch(e){}return k}
  };

  window.KoujiAIVoice={rec,tts,_t:{speakText,chunk}};
})();
