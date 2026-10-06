'use strict';
/* index.htmlの読込順を変えずに、元のICS・暗号化同期・追加ツール・モバイル補正・AIアシスタントを読み込むローダー */
(function(){
  var m=document.createElement('link');m.rel='stylesheet';m.href='./assets/css/mobile.css';document.head.appendChild(m);
  var a=document.createElement('link');a.rel='stylesheet';a.href='./assets/css/assistant.css?v=20261004-av2';document.head.appendChild(a);
  var u=document.createElement('link');u.rel='stylesheet';u.href='./assets/css/ui2.css?v=20261004-av2';document.head.appendChild(u);
})();
(function(){
  /* ?v= で版を固定し、iPhone Safari/PWA が古いJSをHTTPキャッシュから使い続けないようにする */
  var V='20261007-sec1';
  /* assistant.js は通信・設定・端末内集計。assistant-*.js が AI Workspace の部品（読込順: 履歴 → 添付 → 音声 → 操作候補 → 画面本体） */
  var files=['ics-original.js','crypto-sync.js','tool-cable-route.js','mobile-fixes.js','assistant.js','assistant-storage.js','assistant-files.js','assistant-voice.js','assistant-piper.js','assistant-tts.js','assistant-actions.js','assistant-workspace.js'];
  window.KoujiExtensionsReady=files.reduce((p,f)=>p.then(()=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='./assets/js/'+f+'?v='+V;s.onload=resolve;s.onerror=()=>reject(Error('追加機能を読み込めません'));document.head.append(s)})),Promise.resolve());
  KoujiExtensionsReady.catch(()=>{});
})();
