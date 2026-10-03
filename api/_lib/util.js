/* 工事管理next — api 共通の小物（Vercel は api/ 直下の _ 始まりをエンドポイント化しない） */
'use strict';

/* Vercel入力やiOSコピーで混入した空白・改行・ゼロ幅文字・引用符を除去 */
function cleanSecret(v){
  return String(v||'').replace(/[\s​-‍⁠﻿]+/g,'').replace(/^["'`]+|["'`]+$/g,'');
}
/* エラーメッセージに混入しうるAPIキー断片（OpenAI sk-…／Google AIza…）をマスク */
function redact(s){
  return String(s||'')
    .replace(/sk-[A-Za-z0-9_\-*]{4,}/g,'sk-***')
    .replace(/AIza[0-9A-Za-z_\-]{8,}/g,'AIza***')
    .replace(/([?&]key=)[^&\s"']+/gi,'$1***');
}
function b64Bytes(b64){const n=b64.length;const pad=b64.endsWith('==')?2:b64.endsWith('=')?1:0;return Math.floor(n*3/4)-pad}

module.exports={cleanSecret,redact,b64Bytes};
