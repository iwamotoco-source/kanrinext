/**
 * 工事管理next AI proxy for Cloudflare Workers
 * Secrets:
 *   OPENAI_API_KEY  : required
 *   OPENAI_MODEL    : required (Responses API compatible model)
 * Optional:
 *   ALLOWED_ORIGIN  : https://iwamotoco-source.github.io
 */
function corsHeaders(origin, allowed){
  const ok=!allowed||allowed==='*'||origin===allowed;
  return {
    'Access-Control-Allow-Origin':ok?(allowed==='*'?'*':origin):'null',
    'Access-Control-Allow-Headers':'Content-Type',
    'Access-Control-Allow-Methods':'POST,OPTIONS',
    'Vary':'Origin'
  };
}
function extractText(data){
  if(typeof data.output_text==='string'&&data.output_text)return data.output_text;
  const parts=[];
  for(const item of data.output||[]){
    for(const c of item.content||[]){
      if(c.type==='output_text'&&typeof c.text==='string')parts.push(c.text);
    }
  }
  return parts.join('\n').trim();
}
export default {
  async fetch(request,env){
    const origin=request.headers.get('Origin')||'';
    const allowed=env.ALLOWED_ORIGIN||'https://iwamotoco-source.github.io';
    const cors=corsHeaders(origin,allowed);
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
    if(request.method!=='POST')return Response.json({error:'POST only'},{status:405,headers:cors});
    if(allowed!=='*'&&origin!==allowed)return Response.json({error:'origin not allowed'},{status:403,headers:cors});
    if(!env.OPENAI_API_KEY)return Response.json({error:'OPENAI_API_KEY is not configured'},{status:500,headers:cors});
    if(!env.OPENAI_MODEL)return Response.json({error:'OPENAI_MODEL is not configured'},{status:500,headers:cors});

    let body;
    try{body=await request.json()}catch(e){return Response.json({error:'invalid JSON'},{status:400,headers:cors})}
    const query=String(body.query||'').slice(0,2000);
    const context=body.context||{};
    if(!query)return Response.json({error:'query is required'},{status:400,headers:cors});

    const system=`あなたは「工事管理next」の業務アシスタントです。
ユーザーが登録した予定とタスクのデータだけを根拠に、日本語で簡潔かつ正確に答えてください。
件数・日付・駅別集計は必ず与えられたJSONから数え、推測で補わないでください。
データに存在しない情報は「登録データからは分かりません」と明示してください。
未完了/完了、優先度、日付、駅、カテゴリを区別してください。
「来月」「来週」などの基準日は context.today です。
回答は本文だけを返してください。`;

    const payload={
      model:env.OPENAI_MODEL,
      instructions:system,
      input:`質問:\n${query}\n\n工事管理nextの登録データ(JSON):\n${JSON.stringify(context)}`
    };
    const r=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{'Authorization':`Bearer ${env.OPENAI_API_KEY}`,'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });
    const data=await r.json().catch(()=>({}));
    if(!r.ok)return Response.json({error:data?.error?.message||`OpenAI API ${r.status}`},{status:502,headers:cors});
    const answer=extractText(data);
    if(!answer)return Response.json({error:'empty model response'},{status:502,headers:cors});
    return Response.json({answer},{headers:{...cors,'Cache-Control':'no-store'}});
  }
};
