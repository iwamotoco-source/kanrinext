'use strict';
/* index.htmlの読込順を変えずに、元のICS・暗号化同期・追加ツール・モバイル補正・AIアシスタントを読み込むローダー */
(function(){
  var m=document.createElement('link');m.rel='stylesheet';m.href='./assets/css/mobile.css';document.head.appendChild(m);
})();
(function(){
  /* ?v= で版を固定し、iPhone Safari/PWA が古いJSをHTTPキャッシュから使い続けないようにする */
  var V='20261003-ai4';
  var files=['ics-original.js','crypto-sync.js','tool-cable-route.js','mobile-fixes.js','assistant.js','assistant-workspace.js'];
  document.write(files.map(function(f){return '<script src="./assets/js/'+f+'?v='+V+'"><\/script>'}).join(''));
})();
