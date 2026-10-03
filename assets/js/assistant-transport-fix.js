'use strict';
/* 工事管理next AI通信補正
 * - 旧 ?key=... を端末内で自動移行
 * - APP_ACCESS_TOKENをURLではなく X-App-Key ヘッダーで送る
 * - SafariでのURL履歴/ログへのトークン露出を避ける
 */
(function(){
  const nativeFetch=window.fetch.bind(window);

  function isAiUrl(u){
    return u.hostname==='kanrinext.vercel.app' && u.pathname.replace(/\/+$/,'')==='/api/ai';
  }
  function migrate(){
    try{
      if(!window.localCfg?.ai?.endpoint)return;
      const u=new URL(localCfg.ai.endpoint,location.href);
      if(!isAiUrl(u))return;
      const qKey=u.searchParams.get('key');
      if(qKey&&!localCfg.ai.accessKey)localCfg.ai.accessKey=qKey;
      if(qKey){
        u.searchParams.delete('key');
        localCfg.ai.endpoint=u.toString().replace(/\?$/,'');
        saveLocal?.();
      }
    }catch(e){}
  }

  window.fetch=function(input,init){
    let rawUrl='';
    try{rawUrl=typeof input==='string'?input:input?.url||String(input)}catch(e){return nativeFetch(input,init)}
    try{
      const u=new URL(rawUrl,location.href);
      if(!isAiUrl(u))return nativeFetch(input,init);

      let key=u.searchParams.get('key')||window.localCfg?.ai?.accessKey||'';
      if(u.searchParams.has('key'))u.searchParams.delete('key');

      const opts=Object.assign({},init||{});
      const headers=new Headers(input instanceof Request?input.headers:undefined);
      new Headers(init?.headers||{}).forEach((v,k)=>headers.set(k,v));
      if(key)headers.set('X-App-Key',key);
      opts.headers=headers;

      if(input instanceof Request){
        return nativeFetch(new Request(u.toString(),input),opts);
      }
      return nativeFetch(u.toString(),opts);
    }catch(e){
      return nativeFetch(input,init);
    }
  };

  migrate();
  window.addEventListener('load',migrate,{once:true});
})();
