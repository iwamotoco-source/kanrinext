const assert=require('node:assert/strict');
process.env.APP_ACCESS_TOKEN='unit-test-access';process.env.NODE_ENV='production';process.env.ALLOWED_ORIGIN='https://iwamotoco-source.github.io';
const ai=require('../api/ai'),tts=require('../api/tts'),router=require('../api/_lib/providers');
router.generate=async()=>({ok:true,provider:'gemini',model:'test',text:'{"answer":"テスト応答"}'});
async function call(fn,{method='POST',origin='https://iwamotoco-source.github.io',key='unit-test-access',body={query:'テスト'},ip='192.0.2.1',headers={}}={}){
 const req={method,body,headers:{origin,'x-app-key':key,'x-real-ip':ip,...headers}};
 const out={statusCode:200,headers:{},body:null};const res={setHeader:(k,v)=>out.headers[k]=v,status(n){out.statusCode=n;return this},json(v){out.body=v;return this},end(){return this}};
 await fn(req,res);return out;
}
(async()=>{
 for(const fn of [ai,tts]){
  assert.equal((await call(fn,{method:'GET',key:''})).statusCode,401);
  assert.equal((await call(fn,{method:'GET'})).statusCode,200);
  assert.equal((await call(fn,{origin:'https://evil.test'})).statusCode,403);
  assert.equal((await call(fn,{origin:'http://localhost:3000'})).statusCode,403);
  assert.equal((await call(fn,{method:'OPTIONS',origin:'https://evil.test'})).statusCode,403);
  assert.equal((await call(fn,{method:'OPTIONS'})).statusCode,204);
  assert.equal((await call(fn,{headers:{'content-length':'999999999'}})).statusCode,413);
 }
 process.env.ALLOWED_ORIGIN='*';assert.equal((await call(ai)).statusCode,403);process.env.ALLOWED_ORIGIN='https://iwamotoco-source.github.io/kanrinext';assert.equal((await call(ai,{method:'GET'})).statusCode,200);
 assert.equal((await call(ai,{key:'wrong'})).statusCode,401);
 assert.equal((await call(ai,{body:{query:'テスト'}})).body.answer,'テスト応答');
 assert.equal((await call(tts,{body:{text:'a'.repeat(17000)}})).statusCode,413);
 let limited;for(let i=0;i<41;i++)limited=await call(ai,{ip:'192.0.2.99'});assert.equal(limited.statusCode,429);assert(limited.headers['Retry-After']);
 console.log('PASS: authenticated health, strict production CORS/preflight, access checks, actual/header body limits, existing AI request, burst guard');
})().catch(e=>{console.error(e);process.exit(1)});
