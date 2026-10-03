'use strict';
/* 工事管理next — iPhone / smartphone viewport stabilization */
(function(){
  function isPhone(){return window.matchMedia&&matchMedia('(max-width:820px)').matches}
  function resetX(){
    if(!isPhone())return;
    try{document.scrollingElement&&(document.scrollingElement.scrollLeft=0)}catch(e){}
    document.querySelectorAll('.view').forEach(v=>{try{v.scrollLeft=0}catch(e){}});
  }
  function fit(){
    if(!isPhone())return;
    resetX();
    /* Leafletは表示領域変更後に再計算が必要。存在する場合だけ安全に呼ぶ */
    setTimeout(()=>{try{if(window.railMap&&typeof window.railMap.invalidateSize==='function')window.railMap.invalidateSize(false)}catch(e){}},80);
  }
  addEventListener('DOMContentLoaded',()=>{fit();setTimeout(fit,250)});
  addEventListener('hashchange',()=>setTimeout(fit,40));
  addEventListener('orientationchange',()=>setTimeout(fit,180));
  addEventListener('resize',()=>setTimeout(fit,80),{passive:true});
  if(window.visualViewport)visualViewport.addEventListener('resize',()=>setTimeout(resetX,50),{passive:true});
})();
