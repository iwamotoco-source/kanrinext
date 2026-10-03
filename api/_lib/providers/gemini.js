/* Gemini Provider（標準）— Gemini API (generateContent, v1beta)
 * 環境変数: GEMINI_API_KEY（必須。Google AI Studio で取得）/ GEMINI_MODEL（任意。設定時は最優先）
 * キーは x-goog-api-key ヘッダーで送る（URLに載せない＝ログに残らない）。ブラウザへは返さない。
 *
 * 公式ドキュメント確認（ai.google.dev, 2026-10-03）:
 *  ・モデル一覧: Flash系の標準は gemini-3.8-flash、他に 3.6-flash / 3.5-flash / 3.5-flash-lite / 3.1-flash-lite
 *  ・料金ページ: 上記モデルはいずれも Free Tier（Standard の入出力が無料）対象。無料枠の入出力は Google の製品改善に使われうる
 *  ・Structured Output: JSON Schema（type配列の "null"、anyOf、enum、additionalProperties）に対応
 *  ・PDF: inline_data(base64) で送れる（application/pdf）。画像も inline
 *  ・レート制限超過: 429 RESOURCE_EXHAUSTED
 * 実APIのフィールド名は版で変わりうるため、400(INVALID_ARGUMENT)のときだけ段階的に簡素な形式へ落として再試行し、
 * 動いた形式は同じインスタンス内で記憶する（無料枠の無駄打ちを避ける）。 */
'use strict';
const {cleanSecret,redact}=require('../util');

const BASE='https://generativelanguage.googleapis.com/v1beta';
/* GEMINI_MODEL が未設定/誤入力/利用不可のときだけ、この順で試す（いずれも Free Tier 対象を確認済み） */
const DEFAULT_MODELS=['gemini-3.8-flash','gemini-3.6-flash','gemini-3.5-flash-lite'];

const apiKey=()=>cleanSecret(process.env.GEMINI_API_KEY);
function cleanModel(v){
  let m=String(v||'').trim().replace(/^models\//i,'');
  if(!m||/^https?:\/\//i.test(m)||/\s/.test(m))return '';
  if(!/^gemini-[a-z0-9][a-z0-9._-]*$/i.test(m))return '';
  return m;
}
function modelChain(){
  return [...new Set([cleanModel(process.env.GEMINI_MODEL),...DEFAULT_MODELS].filter(Boolean))];
}

/* ---- JSON Schema の変換 ---- */
/* 旧来の OpenAPI サブセット（responseSchema）向け: type配列→nullable、additionalProperties削除 */
function toOpenApiSchema(s){
  if(Array.isArray(s))return s.map(toOpenApiSchema);
  if(!s||typeof s!=='object')return s;
  const o={};
  for(const [k,v] of Object.entries(s)){
    if(k==='additionalProperties')continue;
    if(k==='type'&&Array.isArray(v)){const t=v.filter(x=>x!=='null');o.type=t[0]||'string';if(v.includes('null'))o.nullable=true;continue}
    if(k==='anyOf'&&Array.isArray(v)){
      const nn=v.filter(x=>x&&x.type!=='null');
      if(nn.length===1&&v.length===2){Object.assign(o,toOpenApiSchema(nn[0]));o.nullable=true;continue}
    }
    o[k]=(k==='properties'&&v&&typeof v==='object')?Object.fromEntries(Object.entries(v).map(([pk,pv])=>[pk,toOpenApiSchema(pv)])):toOpenApiSchema(v);
  }
  return o;
}

/* ---- リクエスト本文 ---- */
function toParts(parts,extraSchemaText){
  const out=[];
  for(const p of parts){
    if(p.type==='text')out.push({text:p.text});
    else if(p.type==='image')out.push({inlineData:{mimeType:p.mime,data:p.b64}});
    else if(p.type==='pdf')out.push({text:`PDF: ${p.name||'document.pdf'}`},{inlineData:{mimeType:'application/pdf',data:p.b64}});
  }
  if(extraSchemaText)out.push({text:extraSchemaText});
  return out;
}
/* variant: {thinking:boolean, schema:'json'|'openapi'|'prompt'} */
function buildBody(req,v){
  const gen={maxOutputTokens:req.maxTokens,responseMimeType:'application/json'};
  if(v.schema==='json')gen.responseJsonSchema=req.schema;
  else if(v.schema==='openapi')gen.responseSchema=toOpenApiSchema(req.schema);
  if(v.thinking)gen.thinkingConfig={thinkingLevel:'low'};
  const body={
    systemInstruction:{parts:[{text:req.system}]},
    contents:[{role:'user',parts:toParts(req.parts,v.schema==='prompt'?`\n\n出力は次のJSON Schemaに厳密に従うJSONオブジェクトのみ（前後に文章やコードフェンスを付けない）:\n${JSON.stringify(req.schema)}`:'')}],
    generationConfig:gen
  };
  return body;
}
const VARIANTS=[
  {thinking:true,schema:'json'},
  {thinking:false,schema:'json'},
  {thinking:false,schema:'openapi'},
  {thinking:false,schema:'prompt'}
];
let workingVariant=0;   /* インスタンス内で記憶 */

/* ---- エラー分類（Google のエラー本文: {error:{code,message,status}}） ---- */
/* 一時的な障害（混雑・内部エラー）。同じモデルを一度だけ短く待って再試行し、だめなら次のGeminiモデルへ */
const isTransient=(status,err)=>status>=500||['UNAVAILABLE','INTERNAL','DEADLINE_EXCEEDED'].includes(String(err?.status||''));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function classify(status,err){
  const st=String(err?.status||''),msg=String(err?.message||'');
  const reasons=JSON.stringify(err?.details||[]);
  if(status===429||st==='RESOURCE_EXHAUSTED')return 'GEMINI_QUOTA';
  if(/API_KEY_INVALID|API key not valid|API key expired|API_KEY_/i.test(reasons+msg))return 'GEMINI_KEY_INVALID';
  if(status===401||status===403||st==='PERMISSION_DENIED'||st==='UNAUTHENTICATED')return 'GEMINI_KEY_INVALID';
  if(status===404||st==='NOT_FOUND'||/models\/.*(is not found|not supported)/i.test(msg))return 'MODEL_UNAVAILABLE';
  return 'GEMINI_ERROR';
}
/* 400 のうち、thinking/スキーマ形式など「リクエスト形式」が原因らしいものだけ再試行の対象にする */
const isArgErr=(status,err)=>status===400&&(!err?.status||err.status==='INVALID_ARGUMENT')&&/thinking|thought|schema|responseMimeType|response_|unknown name|invalid json payload|additionalProperties|nullable|not supported|generation_?config/i.test(String(err?.message||''));

/* ---- 応答の取り出し ---- */
function extractText(data){
  const cand=data?.candidates?.[0];
  const parts=cand?.content?.parts||[];
  return parts.filter(p=>typeof p.text==='string'&&!p.thought).map(p=>p.text).join('').trim();
}
function stripFence(t){return String(t).replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim()}

async function post(key,model,body,signal){
  const r=await fetch(`${BASE}/models/${encodeURIComponent(model)}:generateContent`,{
    method:'POST',headers:{'x-goog-api-key':key,'Content-Type':'application/json'},body:JSON.stringify(body),
    ...(signal?{signal}:{})
  });
  const data=await r.json().catch(()=>({}));
  return {r,data};
}

const provider={
  id:'gemini',label:'Gemini',
  configured:()=>!!apiKey(),
  modelConfigured:()=>!!cleanModel(process.env.GEMINI_MODEL),
  defaultModel:()=>modelChain()[0],
  /* models.get: 生成クォータを使わずにモデルの存在を確認（接続テスト用） */
  async checkModel(signal){
    const key=apiKey();
    if(!key)return {ok:false,provider:'gemini',code:'GEMINI_KEY_MISSING',status:500};
    const chain=modelChain();let last=null;
    try{
      for(const model of chain){
        const r=await fetch(`${BASE}/models/${encodeURIComponent(model)}`,{method:'GET',headers:{'x-goog-api-key':key},...(signal?{signal}:{})});
        const data=await r.json().catch(()=>({}));
        if(r.ok)return {ok:true,provider:'gemini',model,requestedModel:chain[0],fallback:model!==chain[0]};
        const code=classify(r.status,data?.error);
        last={ok:false,provider:'gemini',code,status:502,detail:redact(data?.error?.message||`HTTP ${r.status}`),model};
        if(code!=='MODEL_UNAVAILABLE')break;
      }
      return last;
    }catch(e){
      if(e&&e.name==='AbortError')return {ok:false,provider:'gemini',code:'TIMEOUT',status:504};
      return {ok:false,provider:'gemini',code:'GEMINI_UNREACHABLE',status:502,detail:redact(e?.message)};
    }
  },
  /* req: {system,parts,schemaName,schema,maxTokens,signal,model?}（OpenAI Provider と同じ中立形式） */
  async call(req){
    const key=apiKey();
    if(!key)return {ok:false,provider:'gemini',code:'GEMINI_KEY_MISSING',status:500};
    const chain=req.model?[req.model]:modelChain();let last=null;
    try{
      for(const model of chain){
        let vi=workingVariant,res=null;
        for(;vi<VARIANTS.length;vi++){
          res=await post(key,model,buildBody(req,VARIANTS[vi]),req.signal);
          if(res.r.ok||!isArgErr(res.r.status,res.data?.error))break;
          /* 400: モデルが未知のフィールド（thinking/schema形式）を受け付けない可能性 → 次の形式へ */
        }
        if(vi>=VARIANTS.length)vi=VARIANTS.length-1;
        if(!res.r.ok&&isTransient(res.r.status,res.data?.error)&&!req.signal?.aborted){
          await sleep(600);
          res=await post(key,model,buildBody(req,VARIANTS[vi]),req.signal);
        }
        const {r,data}=res;
        if(r.ok){
          workingVariant=vi;
          const pf=data?.promptFeedback;
          if(pf?.blockReason)return {ok:false,provider:'gemini',code:'BLOCKED',status:502,detail:String(pf.blockReason),model};
          const cand=data?.candidates?.[0];
          const text=stripFence(extractText(data));
          if(!text){
            const fr=cand?.finishReason;
            if(fr==='MAX_TOKENS')return {ok:false,provider:'gemini',code:'TRUNCATED',status:502,model};
            if(fr&&fr!=='STOP')return {ok:false,provider:'gemini',code:'BLOCKED',status:502,detail:String(fr),model};
            return {ok:false,provider:'gemini',code:'EMPTY_RESPONSE',status:502,model};
          }
          if(cand?.finishReason==='MAX_TOKENS'){let ok=true;try{JSON.parse(text)}catch{ok=false}if(!ok)return {ok:false,provider:'gemini',code:'TRUNCATED',status:502,model}}
          return {ok:true,provider:'gemini',model,text,fallback:model!==chain[0],requestedModel:chain[0]};
        }
        const code=classify(r.status,data?.error);
        last={ok:false,provider:'gemini',code,status:502,detail:redact(data?.error?.message||`HTTP ${r.status}`),model};
        /* モデル未提供・無料枠(モデルごとに別枠)・一時障害のときだけ次のGeminiモデルを試す。キー不正・安全フィルタ等では続けない */
        if(code!=='MODEL_UNAVAILABLE'&&code!=='GEMINI_QUOTA'&&!(code==='GEMINI_ERROR'&&isTransient(r.status,data?.error)))break;
      }
      return last;
    }catch(e){
      if(e&&e.name==='AbortError')return {ok:false,provider:'gemini',code:'TIMEOUT',status:504};
      return {ok:false,provider:'gemini',code:'GEMINI_UNREACHABLE',status:502,detail:redact(e?.message)};
    }
  },
  _t:{buildBody,toOpenApiSchema,classify,VARIANTS,resetVariant(){workingVariant=0}}
};
module.exports=provider;
