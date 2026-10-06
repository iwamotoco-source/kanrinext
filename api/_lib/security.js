'use strict';
const {createHash}=require('crypto');
const DEFAULT_ORIGIN='https://iwamotoco-source.github.io';
const buckets=new Map();
function setCors(req,res){
  const origin=String(req.headers.origin||'');
  const allowed=String(process.env.ALLOWED_ORIGIN||DEFAULT_ORIGIN).split(',').map(v=>{try{return new URL(v.trim()).origin}catch{return ''}}).filter(Boolean);
  const local=process.env.NODE_ENV!=='production'&&/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const ok=!origin||allowed.includes(origin)||local;
  res.setHeader('Vary','Origin');if(origin&&ok)res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type, X-App-Key');
  res.setHeader('Access-Control-Max-Age','600');res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  return ok;
}
// Per-instance burst guard. Not a distributed quota or a replacement for authentication.
function burst(req,res,kind,limit){
  const now=Date.now();for(const [k,v]of buckets)if(v.until<=now)buckets.delete(k);
  const ip=req.headers['x-real-ip']||req.socket?.remoteAddress||'unknown';
  const id=createHash('sha256').update(kind+'|'+String(ip)).digest('hex');
  const v=buckets.get(id)||{count:0,until:now+60000};v.count++;buckets.set(id,v);
  if(buckets.size>10000)buckets.delete(buckets.keys().next().value);
  if(v.count<=limit)return true;
  res.setHeader('Retry-After',String(Math.max(1,Math.ceil((v.until-now)/1000))));
  res.status(429).json({ok:false,code:'RATE_LIMITED',error:'短時間のアクセスが多いため、少し待って再試行してください'});return false;
}
function bodyAllowed(req,max){
  const length=Number(req.headers['content-length']);if(Number.isFinite(length)&&length>max)return false;
  try{return Buffer.byteLength(typeof req.body==='string'?req.body:JSON.stringify(req.body??null),'utf8')<=max}catch{return false}
}
module.exports={setCors,burst,bodyAllowed};
