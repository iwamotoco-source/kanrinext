/* OpenAI Provider（予備）— Responses API。従来の実装をそのまま分離したもの。
 * 環境変数: OPENAI_API_KEY（必須）/ OPENAI_MODEL（任意）。ブラウザへは返さない。 */
'use strict';
const {cleanSecret,redact}=require('../util');

/* developers.openai.com で Responses API・Structured Outputs 対応を確認済みのモデル（2026-10時点） */
const FALLBACK_MODELS=['gpt-6-luna','gpt-5.6-luna'];

function cleanModel(v){
  const m=String(v||'').trim();
  if(!m||/^https?:\/\//i.test(m)||/\s/.test(m))return '';
  if(!/^(gpt-|o\d|chatgpt-)/i.test(m))return '';
  return m;
}
const apiKey=()=>cleanSecret(process.env.OPENAI_API_KEY);
function modelChain(){
  return [...new Set([cleanModel(process.env.OPENAI_MODEL),...FALLBACK_MODELS].filter(Boolean))];
}
function classify(status,err){
  const code=String(err?.code||''),type=String(err?.type||''),msg=String(err?.message||'');
  if(status===401||code==='invalid_api_key')return 'OPENAI_KEY_INVALID';
  if(code==='model_not_found'||/model .*(does not exist|not found)|do not have access to (it|the model)/i.test(msg))return 'MODEL_UNAVAILABLE';
  if(status===429&&(code==='insufficient_quota'||type==='insufficient_quota'))return 'OPENAI_QUOTA';
  return 'OPENAI_ERROR';
}
function extractText(data){
  if(typeof data?.output_text==='string'&&data.output_text)return data.output_text;
  const parts=[];
  for(const item of data?.output||[])for(const c of item?.content||[])if(c?.type==='output_text'&&typeof c.text==='string')parts.push(c.text);
  return parts.join('\n').trim();
}
/* 中立の parts → Responses API の input */
function toInput(parts){
  const content=[];
  for(const p of parts){
    if(p.type==='text')content.push({type:'input_text',text:p.text});
    else if(p.type==='image')content.push({type:'input_image',image_url:`data:${p.mime};base64,${p.b64}`,detail:p.detail||'auto'});
    else if(p.type==='pdf')content.push({type:'input_file',filename:p.name||'document.pdf',file_data:`data:application/pdf;base64,${p.b64}`});
  }
  return [{role:'user',content}];
}
async function callOnce(key,model,req){
  const payload={model,store:false,reasoning:{effort:'low'},max_output_tokens:req.maxTokens,instructions:req.system,input:toInput(req.parts),
    text:{format:{type:'json_schema',name:req.schemaName,strict:true,schema:req.schema}}};
  const r=await fetch('https://api.openai.com/v1/responses',{
    method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify(payload),
    ...(req.signal?{signal:req.signal}:{})
  });
  const data=await r.json().catch(()=>({}));
  return {r,data};
}

const provider={
  id:'openai',label:'OpenAI',
  configured:()=>!!apiKey(),
  modelConfigured:()=>!!cleanModel(process.env.OPENAI_MODEL),
  defaultModel:()=>modelChain()[0],
  /* req: {system,parts,schemaName,schema,maxTokens,signal} → {ok,text,model,fallback} | {ok:false,code,status,detail,model} */
  async call(req){
    const key=apiKey();
    if(!key)return {ok:false,provider:'openai',code:'OPENAI_KEY_MISSING',status:500};
    const chain=modelChain();let last=null;
    try{
      for(const model of chain){
        const {r,data}=await callOnce(key,model,req);
        if(r.ok){
          const text=extractText(data);
          return text?{ok:true,provider:'openai',model,text,fallback:model!==chain[0],requestedModel:chain[0]}:{ok:false,provider:'openai',code:'EMPTY_RESPONSE',status:502,model};
        }
        const code=classify(r.status,data?.error);
        last={ok:false,provider:'openai',code,status:502,detail:redact(data?.error?.message||`HTTP ${r.status}`),model};
        if(code!=='MODEL_UNAVAILABLE')break;
      }
      return last;
    }catch(e){
      if(e&&e.name==='AbortError')return {ok:false,provider:'openai',code:'TIMEOUT',status:504};
      return {ok:false,provider:'openai',code:'OPENAI_UNREACHABLE',status:502,detail:redact(e?.message)};
    }
  }
};
module.exports=provider;
