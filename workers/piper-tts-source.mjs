// Build with scripts/build-piper.sh. Runs only in a dedicated module Worker.
import {PiperPlus} from 'piper-plus';
import * as ort from '../assets/vendor/piper-plus/ort.wasm.min.mjs';
import * as phonemizer from '../assets/vendor/piper-plus/phonemizer.mjs';

const CACHE='kouji-piper-assets-v1';
const HF='https://huggingface.co/ayousanz/piper-plus-tsukuyomi-chan/resolve/36b59c825c36bd386b8960cf3f604382f52f2a87/';
const MODEL=HF+'tsukuyomi-chan-6lang-fp16.onnx';
const CONFIG=HF+'config.json';
const G2P='https://unpkg.com/piper-plus@0.7.0/dist/rust-wasm/piper_plus_wasm_bg.wasm';
const ORT='https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/ort-wasm-simd-threaded.wasm';
const ASSETS=[[MODEL,'音声モデル'],[CONFIG,'音声設定'],[G2P,'日本語辞書'],[ORT,'音声生成エンジン']];
let tts=null,allowDownload=false,activeId=null,chain=Promise.resolve();
const netFetch=self.fetch.bind(self);
const progress=message=>self.postMessage({id:activeId,progress:message});
async function asset(url){
  const cache=await caches.open(CACHE),hit=await cache.match(url);
  if(hit)return hit;
  if(!allowDownload)throw new Error('音声データがありません。AI設定で「音声データを取得」を押してください。');
  const label=ASSETS.find(a=>a[0]===url)?.[1]||'音声データ';
  progress(label+'を取得しています…');
  const response=await netFetch(url);
  if(!response.ok)throw new Error(label+'を取得できませんでした（HTTP '+response.status+'）。通信を確認して再試行してください。');
  // Read progressively; store only complete responses so cancellation is recoverable.
  const reader=response.body?.getReader(),chunks=[];let loaded=0,last=0;
  const total=response.headers.get('Content-Encoding')?0:Number(response.headers.get('Content-Length'));
  if(reader){for(;;){const {done,value}=await reader.read();if(done)break;chunks.push(value);loaded+=value.length;
    if(Date.now()-last>250){last=Date.now();progress(label+'：'+(loaded/1e6).toFixed(1)+' MB'+(total?' / '+(total/1e6).toFixed(1)+' MB':''));}}}
  else chunks.push(await response.arrayBuffer());
  const blob=new Blob(chunks,{type:response.headers.get('Content-Type')||'application/octet-stream'});
  const stored=new Response(blob,{headers:{'Content-Type':blob.type,'Content-Length':String(blob.size)}});
  await cache.put(url,stored.clone());return stored;
}
// Piper's config fetch also works offline. No application/AI traffic passes here.
self.fetch=(input,init)=>{
  const url=typeof input==='string'?input:input.url;
  if(url===MODEL+'.json')return Promise.resolve(new Response('',{status:404}));
  if(ASSETS.some(a=>a[0]===url))return asset(url);
  return netFetch(input,init);
};
async function initialize(download){
  if(tts)return;
  allowDownload=download;
  for(const [url] of ASSETS)await asset(url);
  progress('端末内の音声エンジンを準備しています…');
  ort.env.wasm.numThreads=1; // GitHub Pages / Safari: no SharedArrayBuffer required.
  ort.env.wasm.proxy=false; // Already inside our single Worker.
  ort.env.wasm.wasmBinary=await (await asset(ORT)).arrayBuffer();
  ort.env.wasm.wasmPaths={mjs:new URL('../assets/vendor/piper-plus/ort-wasm-simd-threaded.mjs',import.meta.url).href};
  const runtime={...ort,InferenceSession:{create:async(path,options)=>{
    const session=await ort.InferenceSession.create(path===MODEL?await (await asset(MODEL)).arrayBuffer():path,options);
    const infer=session.run.bind(session);
    session.run=feeds=>{
      // npm 0.7.0 defaults to CAM++'s 192 dimensions, but this pinned model
      // declares legacy ECAPA's 256. Keep mask=0: use the model's own voice.
      if(feeds.speaker_embedding?.data.length===192&&feeds.speaker_embedding_mask?.data[0]!==1n)
        feeds.speaker_embedding=new ort.Tensor('float32',new Float32Array(256),[1,256]);
      if(feeds.speaker_embedding_mask)
        feeds.speaker_embedding_mask=new ort.Tensor('int64',feeds.speaker_embedding_mask.data,[1,1]);
      return infer(feeds);
    };
    return session;
  }}};
  tts=await PiperPlus.initialize({model:MODEL,ort:runtime,wasmLoader:async()=>{
    await phonemizer.default({module_or_path:await (await asset(G2P)).arrayBuffer()});
    // Japanese only: don't request unrelated Chinese dictionaries.
    return {...phonemizer,WasmPhonemizer:class extends phonemizer.WasmPhonemizer{
      get setChineseDictionary(){return undefined;}
    }};
  }});
  if(!tts._phonemizer.supportedLanguages.includes('ja')){tts.dispose();tts=null;throw new Error('日本語辞書を初期化できませんでした。音声データを削除して再取得してください。');}
  allowDownload=false;
}
self.onmessage=({data})=>{
  // Never overlap ONNX sessions or synthesis, including double taps in settings.
  chain=chain.then(async()=>{
    activeId=data.id;
    try{
      if(data.type==='clear'){tts?.dispose();tts=null;await caches.delete(CACHE);self.postMessage({id:data.id,result:true});return;}
      await initialize(data.type==='prepare');
      if(data.type==='prepare'){self.postMessage({id:data.id,result:true});return;}
      const audio=await tts.synthesize(data.text,{language:'ja',lengthScale:data.lengthScale||1.5,noiseScale:0.667});
      const samples=audio.samples;
      if(!samples.length||!samples.every(Number.isFinite))throw new Error('音声を生成できませんでした。');
      self.postMessage({id:data.id,result:{samples,sampleRate:audio.sampleRate}},[samples.buffer]);
    }catch(e){tts?.dispose();tts=null;self.postMessage({id:data.id,error:e.message||String(e)});}
    finally{activeId=null;allowDownload=false;}
  });
};
