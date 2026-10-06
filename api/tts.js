/* 工事管理next — キャラクター音声プロキシ for Vercel
 *
 * 構成: 工事管理next(GitHub Pages) → このVercel関数 → あなた専用の Hugging Face Space（mikuTTS の複製）→ WAV
 *   ・Gemini / AI Router / api/ai.js には一切関与しない（読み上げのための追加Geminiリクエストは0）
 *   ・認証・CORS は api/ai.js と同じ規則（X-App-Key = APP_ACCESS_TOKEN、許可オリジン）
 *   ・HFトークンはVercelの環境変数だけに置く。ブラウザへは返さず、Space以外のホストへも送らない
 *   ・本文は保存・ログ出力しない
 *
 * Environment variables (Vercel):
 *   APP_ACCESS_TOKEN  既存（api/ai.js と共通）
 *   HF_TTS_SPACE      必須。複製したSpaceのURL（例 https://yourname-mikutts.hf.space）または「yourname/mikuTTS」
 *   HF_TOKEN          非公開Spaceなら必須。Hugging Face の Read トークン（hf_...）
 *   HF_TTS_MODEL      任意。モデルフォルダ名（既定 1a_miku_default_rvc_(aple)）
 *   ALLOWED_ORIGIN    既存と共通
 */
'use strict';

const {createHash,timingSafeEqual}=require('crypto');
const {setCors,burst,bodyAllowed}=require('./_lib/security');
const {cleanSecret,redact}=require('./_lib/util');

const DEFAULT_ORIGIN='https://iwamotoco-source.github.io';
const BUILD_ID='tts-security-20261007';
const MAX_TEXT=400,MAX_BODY=16*1024,SPACE_TIMEOUT_MS=50000;
/* mikuTTS Space（app.py）の既定値 */
const DEF={model:'1a_miku_default_rvc_(aple)',voice:'ja-JP-NanamiNeural',pitch:6,f0:'rmvpe',indexRate:1,protect:0.33,speed:0,volume:0};

const normOrigin=v=>String(v||'').trim().replace(/\/+$/,'');
const digest=v=>createHash('sha256').update(String(v),'utf8').digest();
function checkAccess(supplied){
  const expected=cleanSecret(process.env.APP_ACCESS_TOKEN);
  if(!expected)return 'ACCESS_TOKEN_NOT_CONFIGURED';
  const got=cleanSecret(supplied);
  if(!got)return 'ACCESS_KEY_MISSING';
  return timingSafeEqual(digest(got),digest(expected))?null:'ACCESS_KEY_INVALID';
}

const MESSAGES={
  ORIGIN_NOT_ALLOWED:'このサイトからは利用できません',
  ACCESS_TOKEN_NOT_CONFIGURED:'Vercel側に APP_ACCESS_TOKEN が設定されていません',
  ACCESS_KEY_MISSING:'AIアクセスキーが送信されていません',
  ACCESS_KEY_INVALID:'AIアクセスキーが APP_ACCESS_TOKEN と一致しません',
  SPACE_NOT_CONFIGURED:'Vercel側に HF_TTS_SPACE が設定されていません（キャラクター音声の準備が未完了）',
  SPACE_STARTING:'音声Spaceが起動中です（無料枠は休止していることがあります）。1〜2分後にもう一度お試しください',
  SPACE_AUTH:'音声Spaceにアクセスできません（HF_TOKEN が未設定・期限切れ、または権限不足）',
  SPACE_ERROR:'音声Spaceでエラーが発生しました',
  TIMEOUT:'音声の生成に時間がかかりすぎました',
  BAD_REQUEST:'リクエストが不正です',
  PAYLOAD_TOO_LARGE:'送信データが大きすぎます',
  TEXT_TOO_LONG:'文章が長すぎます'
};
function fail(res,status,code,detail){
  return res.status(status).json({ok:false,code,error:MESSAGES[code]||code,...(detail?{detail:redact(String(detail)).slice(0,200)}:{})});
}

/* Space の URL を決める。URL ならそのまま（http は検証用の localhost のみ）、owner/name なら *.hf.space へ。 */
function spaceBase(){
  const raw=cleanSecret(process.env.HF_TTS_SPACE);
  if(!raw)return '';
  if(/^https?:\/\//i.test(raw)){
    try{const u=new URL(raw);if(u.protocol==='http:'&&!/^(localhost|127\.0\.0\.1)$/.test(u.hostname))return '';return (u.origin+u.pathname).replace(/\/+$/,'')}catch(e){return ''}
  }
  const m=/^([\w.-]+)\/([\w.-]+)$/.exec(raw);
  if(!m)return '';
  return 'https://'+(m[1]+'-'+m[2]).toLowerCase().replace(/[._]/g,'-')+'.hf.space';
}
const num=(v,d,lo,hi)=>{v=+v;if(!isFinite(v))v=d;return Math.min(hi,Math.max(lo,v))};

/* Gradio の SSE（event:/data: 行）から complete / error を取り出す */
function parseSse(text){
  let last=null;
  for(const blk of String(text).split(/\n\n+/)){
    let ev='',data='';
    for(const line of blk.split('\n')){
      if(line.startsWith('event:'))ev=line.slice(6).trim();
      else if(line.startsWith('data:'))data+=line.slice(5).trim();
    }
    if(ev==='complete'||ev==='error')last={event:ev,data};
  }
  return last;
}

async function callSpace(base,payload,signal){
  const token=cleanSecret(process.env.HF_TOKEN);
  const headers={'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})};
  let r=await fetch(base+'/gradio_api/call/tts',{method:'POST',headers,body:JSON.stringify({data:payload}),signal,redirect:'error'});
  if(r.status===401||r.status===403||r.status===404&&token)throw Object.assign(new Error('auth'),{code:'SPACE_AUTH'});
  if(r.status===503||r.status===502||r.status===504||r.status===404)throw Object.assign(new Error('starting'),{code:'SPACE_STARTING'});
  if(!r.ok)throw Object.assign(new Error('HTTP '+r.status),{code:'SPACE_ERROR'});
  const {event_id}=await r.json();
  if(!event_id)throw Object.assign(new Error('no event_id'),{code:'SPACE_ERROR'});
  r=await fetch(base+'/gradio_api/call/tts/'+encodeURIComponent(event_id),{headers:token?{Authorization:'Bearer '+token}:{},signal,redirect:'error'});
  if(!r.ok)throw Object.assign(new Error('HTTP '+r.status),{code:'SPACE_ERROR'});
  const ev=parseSse(await r.text());
  if(!ev||ev.event==='error')throw Object.assign(new Error('space error'),{code:'SPACE_ERROR'});
  let out;try{out=JSON.parse(ev.data)}catch(e){throw Object.assign(new Error('bad result'),{code:'SPACE_ERROR'})}
  /* out = [info, edge音声, 変換後音声]。info にエラー文が入り音声が null のことがある */
  const res=out&&out[2];
  if(!res)throw Object.assign(new Error(String(out&&out[0]||'no audio').slice(0,160)),{code:'SPACE_ERROR'});
  return res;
}

async function fetchAudio(base,file,signal){
  /* file: {url?, path?}。Space以外のホストへはトークンを送らない（SSRF/漏えい対策） */
  let url=file.url||'';
  if(!url&&file.path)url=base+'/gradio_api/file='+file.path;
  let u;try{u=new URL(url,base+'/')}catch(e){throw Object.assign(new Error('bad url'),{code:'SPACE_ERROR'})}
  if(u.origin!==new URL(base).origin)throw Object.assign(new Error('foreign host'),{code:'SPACE_ERROR'});
  const token=cleanSecret(process.env.HF_TOKEN);
  const r=await fetch(u.href,{headers:token?{Authorization:'Bearer '+token}:{},signal,redirect:'error'});
  if(!r.ok)throw Object.assign(new Error('audio HTTP '+r.status),{code:'SPACE_ERROR'});
  const buf=Buffer.from(await r.arrayBuffer());
  if(!buf.length)throw Object.assign(new Error('empty audio'),{code:'SPACE_ERROR'});
  return {buf,type:r.headers.get('content-type')||'audio/wav'};
}

module.exports=async function handler(req,res){
  const corsOk=setCors(req,res);
  if(req.method==='OPTIONS')return corsOk?res.status(204).end():fail(res,403,'ORIGIN_NOT_ALLOWED');
  if(!corsOk)return fail(res,403,'ORIGIN_NOT_ALLOWED');
  if(!burst(req,res,'tts.js-all',240))return;
  if(req.method==='GET'){const authErr=checkAccess(req.headers['x-app-key']);if(authErr)return fail(res,authErr==='ACCESS_TOKEN_NOT_CONFIGURED'?500:401,authErr);}
  if(req.method==='GET'){
    return res.status(200).json({ok:true,service:'kouji-next-tts-proxy',build:BUILD_ID,
      spaceConfigured:!!spaceBase(),tokenConfigured:!!cleanSecret(process.env.HF_TOKEN),
      model:cleanSecret(process.env.HF_TTS_MODEL)||DEF.model,maxText:MAX_TEXT});
  }
  if(req.method!=='POST')return fail(res,405,'BAD_REQUEST','POST only');
  const authErr=checkAccess(req.headers['x-app-key']);
  if(authErr)return fail(res,authErr==='ACCESS_TOKEN_NOT_CONFIGURED'?500:401,authErr);
  if(!burst(req,res,'tts.js-auth',180))return;
  if(!bodyAllowed(req,MAX_BODY))return fail(res,413,'PAYLOAD_TOO_LARGE');
  const base=spaceBase();
  if(!base)return fail(res,503,'SPACE_NOT_CONFIGURED');

  let body=req.body;
  if(typeof body==='string')try{body=JSON.parse(body)}catch{return fail(res,400,'BAD_REQUEST','invalid JSON')}
  if(!body||typeof body!=='object')return fail(res,400,'BAD_REQUEST','invalid body');
  const text=String(body.text||'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'').trim();
  if(!text)return fail(res,400,'BAD_REQUEST','empty text');
  if(text.length>MAX_TEXT)return fail(res,413,'TEXT_TOO_LONG');
  let voice=String(body.tts_voice||DEF.voice);
  if(!/^[a-z]{2,3}-[A-Z]{2}-[A-Za-z0-9]+Neural(-(Female|Male))?$/.test(voice))return fail(res,400,'BAD_REQUEST','bad tts_voice');
  if(!/-(Female|Male)$/.test(voice))voice+='-Female';   /* Space は「話者-性別」形式で受け取り、末尾を除いて Edge TTS へ渡す */
  const model=String(body.model||'').trim()||cleanSecret(process.env.HF_TTS_MODEL)||DEF.model;
  if(model.length>120||/[\u0000-\u001F\u007F]/.test(model))return fail(res,400,'BAD_REQUEST','bad model');
  /* Space の入力順: [model_name, speed, volume, pitch(Hz), tts_text, tts_voice, f0_up_key, f0_method, index_rate, protect] */
  const payload=[model,Math.round(num(body.speed,DEF.speed,-100,100)),Math.round(num(body.volume,DEF.volume,-100,100)),0,text,voice,
    Math.round(num(body.pitch,DEF.pitch,-24,24)),body.f0_method==='pm'?'pm':DEF.f0,num(body.index_rate,DEF.indexRate,0,1),num(body.protect,DEF.protect,0,0.5)];

  const ac=new AbortController(),to=setTimeout(()=>ac.abort(),SPACE_TIMEOUT_MS);
  try{
    const file=await callSpace(base,payload,ac.signal);
    const {buf,type}=await fetchAudio(base,file,ac.signal);
    res.setHeader('Content-Type',type);res.setHeader('X-TTS-Engine','hf-space');
    return res.status(200).send(buf);
  }catch(e){
    if(e&&e.name==='AbortError')return fail(res,504,'TIMEOUT');
    const code=e&&e.code||'SPACE_ERROR';
    return fail(res,code==='SPACE_STARTING'?503:code==='SPACE_AUTH'?502:502,code,e&&e.message);
  }finally{clearTimeout(to)}
};
module.exports._t={parseSse,spaceBase,checkAccess};
