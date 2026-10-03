/* AI Provider Router — gemini（標準）/ openai（予備）
 * ・provider を明示的に選ぶ。既定は gemini。
 * ・Gemini が使えないときに OpenAI へ切り替えるのは、リクエストが fallbackToOpenAI:true を明示したときだけ
 *   （無料枠の上限・障害で勝手に有料APIへ送らない）。 */
'use strict';
const gemini=require('./gemini');
const openai=require('./openai');

const PROVIDERS={gemini,openai};
const DEFAULT_PROVIDER='gemini';
/* フォールバックの対象にする失敗。入力不備・サイズ・安全フィルタ・タイムアウトでは切り替えない */
const FALLBACK_CODES=new Set(['GEMINI_KEY_MISSING','GEMINI_KEY_INVALID','GEMINI_QUOTA','GEMINI_ERROR','GEMINI_UNREACHABLE','MODEL_UNAVAILABLE']);

const normProvider=v=>{const s=String(v||'').toLowerCase();return PROVIDERS[s]?s:(v===undefined||v===null||v===''?DEFAULT_PROVIDER:null)};

async function generate(choice,req){
  const p=PROVIDERS[choice.provider];
  const out=await p.call(req);
  if(out.ok||choice.provider!=='gemini'||!choice.fallbackToOpenAI||!FALLBACK_CODES.has(out.code))return out;
  if(!openai.configured())return {...out,fallbackTried:false};
  const o2=await openai.call(req);
  if(o2.ok)return {...o2,fallbackFrom:'gemini',fallbackReason:out.code};
  return {...out,fallbackTried:true,fallbackCode:o2.code};
}
function publicInfo(){
  return {
    defaultProvider:DEFAULT_PROVIDER,
    gemini:{configured:gemini.configured(),modelConfigured:gemini.modelConfigured(),model:gemini.defaultModel()},
    openai:{configured:openai.configured(),modelConfigured:openai.modelConfigured(),model:openai.defaultModel()}
  };
}
module.exports={PROVIDERS,DEFAULT_PROVIDER,FALLBACK_CODES,normProvider,generate,publicInfo};
