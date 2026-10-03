/**
 * 工事管理next AI proxy for Vercel Functions
 * Environment variables:
 *   OPENAI_API_KEY  : required
 *   OPENAI_MODEL    : required
 *   ALLOWED_ORIGIN  : optional (default: https://iwamotoco-source.github.io)
 */
function cors(origin, allowed){
  const ok=!allowed||allowed==='*'||origin===allowed;
  return {
    'Access-Control-Allow-Origin':ok?(allowed==='*'?'*':origin):'null',
    'Access-Control-Allow-Headers':'Content-Type',
    'Access-Control-Allow-Methods':'POST,OPTIONS',
    'Vary':'Origin',
    'Cache-Control':'no-store'
  };
}
function extractText(data){
  if(typeof data?.output_text==='string'&&data.output_text)return data.output_text;
  const parts=[];
  for(const item of data?.output||[]){
    for(const c of item?.content||[]){
      if(c?.type==='output_text'&&typeof c.text==='string')parts.push(c.text);
    }
  }
  return parts.join('\n').trim();
}
export default async function handler(req,res){
  const origin=req.headers.origin||'';
  const allowed=process.env.ALLOWED_ORIGIN||'https://iwamotoco-source.github.io';
  const headers=cors(origin,allowed);
  for(const [k,v] of Object.entries(headers))res.setHeader(k,v);
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='POST')return res.status(405).json({error:'POST only'});
  if(allowed!=='*'&&origin!==allowed)return res.status(403).json({error:'origin not allowed'});
  if(!process.env.OPENAI_API_KEY)return res.status(500).json({error:'OPENAI_API_KEY is not configured'});
  if(!process.env.OPENAI_MODEL)return res.status(500).json({error:'OPENAI_MODEL is not configured'});

  const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
  const query=String(body.query||'').slice(0,2000);
  const context=body.context||{};
  if(!query)return res.status(400).json({error:'query is required'});

  const instructions=`あなたは「工事管理next」の業務アシスタントです。
ユーザーが登録した予定とタスクのデータだけを根拠に、日本語で簡潔かつ正確に答えてください。
件数・日付・駅別集計は必ず与えられたJSONから数え、推測で補わないでください。
データに存在しない情報は「登録データからは分かりません」と明示してください。
未完了/完了、優先度、日付、駅、カテゴリを区別してください。
「来月」「来週」などの基準日は context.today です。
回答は本文だけを返してください。`;

  try{
    const r=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{
        'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        model:process.env.OPENAI_MODEL,
        instructions,
        input:`質問:\n${query}\n\n工事管理nextの登録データ(JSON):\n${JSON.stringify(context)}`
      })
    });
    const data=await r.json().catch(()=>({}));
    if(!r.ok)return res.status(502).json({error:data?.error?.message||`OpenAI API ${r.status}`});
    const answer=extractText(data);
    if(!answer)return res.status(502).json({error:'empty model response'});
    return res.status(200).json({answer});
  }catch(e){
    return res.status(500).json({error:e?.message||'AI proxy failed'});
  }
}
