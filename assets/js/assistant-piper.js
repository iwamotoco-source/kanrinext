/* Piper-plus: lazy downloads, one inference Worker, Web Audio playback on main thread. */
'use strict';
(function(){
  const ROOT=new URL('../../',document.currentScript.src),KEY='koujiPiperInstalledV1';
  let worker=null,seq=0,run=0,current=null,context=null;const pending=new Map();
  const installed=()=>{try{return localStorage.getItem(KEY)==='1'}catch(_){return false}};
  const mark=v=>{try{v?localStorage.setItem(KEY,'1'):localStorage.removeItem(KEY)}catch(_){}};
  const supported=()=>!!(window.Worker&&window.WebAssembly&&window.caches&&(window.AudioContext||window.webkitAudioContext));
  function terminate(){
    worker?.terminate();worker=null;
    for(const p of pending.values())p.reject(new DOMException('停止しました','AbortError'));
    pending.clear();
  }
  function request(type,body={},onProgress){
    if(!supported())return Promise.reject(new Error('このブラウザでは端末内音声を使えません。ブラウザ標準音声を選んでください。'));
    if(!worker){
      worker=new Worker(new URL('workers/piper-tts-worker.mjs',ROOT),{type:'module'});
      worker.onmessage=({data})=>{const p=pending.get(data.id);if(!p)return;if(data.progress){p.progress?.(data.progress);return;}
        pending.delete(data.id);data.error?p.reject(new Error(data.error)):p.resolve(data.result);};
      worker.onerror=()=>{const list=[...pending.values()];pending.clear();worker?.terminate();worker=null;
        for(const p of list)p.reject(new Error('音声エンジンを起動できませんでした。アプリを更新して再試行してください。'));};
    }
    const id=++seq;
    return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject,progress:onProgress});worker.postMessage({id,type,...body});});
  }
  function unlock(){
    if(!context)context=new (window.AudioContext||window.webkitAudioContext)();
    context.resume().catch(()=>{});
    const s=context.createBufferSource();s.buffer=context.createBuffer(1,1,context.sampleRate);s.connect(context.destination);s.start();
  }
  function stop(){
    run++;const st=current;current=null;
    if(st){st.cancelled=true;st.cb.onGenerating?.(false);try{st.source?.stop()}catch(_){};st.resolvePlay?.();}
    // Cancel active inference/download as well as playback; cached complete files survive.
    if(pending.size)terminate();
  }
  async function prepare(onProgress){stop();await request('prepare',{},onProgress);mark(true);
    try{await navigator.storage?.persist?.()}catch(_){}return true;}
  async function remove(){stop();terminate();await caches.delete('kouji-piper-assets-v1');mark(false);}
  function speak(text,cb={}){
    stop();const token=run,st={cb,cancelled:false,source:null};current=st;
    const alive=()=>current===st&&run===token&&!st.cancelled;
    const end=e=>{if(!alive())return;current=null;cb.onGenerating?.(false);e?cb.onError?.(e.message):cb.onEnd?.();};
    if(!installed()){end(new Error('AI設定でPiper-plusの音声データを取得してください。'));return;}
    try{unlock()}catch(e){end(e);return;}
    const parts=window.KoujiTTS.split(window.KoujiTTS.normalize(text),80,20);let started=false;
    (async()=>{try{
      for(const part of parts){
        cb.onGenerating?.(true);
        const audio=await request('synthesize',{text:part});if(!alive())return;
        cb.onGenerating?.(false);
        const buffer=context.createBuffer(1,audio.samples.length,audio.sampleRate);buffer.copyToChannel(audio.samples,0);
        if(context.state==='suspended')await context.resume();if(!alive())return;
        await new Promise(resolve=>{st.resolvePlay=resolve;const src=context.createBufferSource();src.buffer=buffer;src.connect(context.destination);st.source=src;src.onended=resolve;
          src.start();if(!started){started=true;cb.onStart?.();}});
        if(!alive())return;
      }
      end();
    }catch(e){if(alive())end(e);}})();
  }
  window.KoujiPiper={supported,installed,prepare,remove,stop,unlock,engine:{name:'piper-plus',supported,speak,stop,unlock}};
})();
