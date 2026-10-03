'use strict';
/* index.htmlの読込順を変えずに、元のICS・暗号化同期・追加ツール・モバイル補正・AIアシスタントを読み込むローダー */
(function(){
  var m=document.createElement('link');m.rel='stylesheet';m.href='./assets/css/mobile.css';document.head.appendChild(m);
})();
document.write('<script src="./assets/js/ics-original.js"><\/script><script src="./assets/js/crypto-sync.js"><\/script><script src="./assets/js/tool-cable-route.js"><\/script><script src="./assets/js/mobile-fixes.js"><\/script><script src="./assets/js/assistant.js"><\/script><script src="./assets/js/assistant-transport-fix.js"><\/script>');
