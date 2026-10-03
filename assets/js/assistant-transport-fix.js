'use strict';
/* 工事管理next AI通信補正
 * - 旧 ?key=... を端末内で自動移行
 * - APP_ACCESS_TOKENをURLではなく X-App-Key ヘッダーで送る
 * - AI設定画面に専用の「AIアクセスキー」欄を追加
 * - iOSコピー時に混入した空白・改行を除去
 */
(function(){
  const nativeFetch=window.fetch.bind(window);

  function isAiUrl(u){
    return u.hostname==='kanrinext.vercel.app' && u.pathname.replace(/\/+$/,'')==='/api/ai';
  }
  function cleanKey(v){return String(v||'').replace(/\s+/g,'').trim()}
  function migrate(){
    try{
      if(!window.localCfg?.ai?.endpoint)return;
      const u=new URL(localCfg.ai.endpoint,location.href);
      if(!isAiUrl(u))return;
      const qKey=cleanKey(u.searchParams.get('key'));
      if(qKey&&!localCfg.ai.accessKey)localCfg.ai.accessKey=qKey;
      if(u.searchParams.has('key')){
        u.searchParams.delete('key');
        localCfg.ai.endpoint=u.toString().replace(/\?$/,'');
        saveLocal?.();
      }
      if(localCfg.ai.accessKey){
        const cleaned=cleanKey(localCfg.ai.accessKey);
        if(cleaned!==localCfg.ai.accessKey){localCfg.ai.accessKey=cleaned;saveLocal?.()}
      }
    }catch(e){}
  }

  function enhanceSettings(root=document){
    const ep=root.querySelector?.('#aiEndpoint');
    if(!ep||root.querySelector('#aiAccessKey'))return;
    migrate();
    try{
      const u=new URL(ep.value||'https://kanrinext.vercel.app/api/ai',location.href);
      if(isAiUrl(u)&&u.searchParams.has('key')){
        const k=cleanKey(u.searchParams.get('key'));
        if(k&&!localCfg.ai.accessKey)localCfg.ai.accessKey=k;
        u.searchParams.delete('key');
        ep.value=u.toString().replace(/\?$/,'');
      }
    }catch(e){}

    const field=document.createElement('div');
    field.className='field';field.style.marginTop='12px';
    field.innerHTML='<label>AIアクセスキー</label><input id="aiAccessKey" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Vercelの APP_ACCESS_TOKEN"><span class="hint">OpenAIの sk-... キーではありません。Vercelで自分で設定した APP_ACCESS_TOKEN と同じ文字列を入力します。</span>';
    const keyInput=field.querySelector('#aiAccessKey');
    keyInput.value=cleanKey(localCfg?.ai?.accessKey||'');
    ep.closest('.field')?.insertAdjacentElement('afterend',field);

    const persist=()=>{
      localCfg.ai=localCfg.ai||{};
      localCfg.ai.accessKey=cleanKey(keyInput.value);
      keyInput.value=localCfg.ai.accessKey;
      try{const u=new URL(ep.value,location.href);u.searchParams.delete('key');ep.value=u.toString().replace(/\?$/,'')}catch(e){}
      saveLocal?.();
    };
    const save=root.querySelector('#aiSave');
    if(save&&!save.dataset.aiKeyBound){save.dataset.aiKeyBound='1';save.addEventListener('click',persist,true)}
    const test=root.querySelector('#aiTest');
    if(test&&!test.dataset.aiKeyBound){test.dataset.aiKeyBound='1';test.addEventListener('click',persist,true)}
  }

  window.fetch=function(input,init){
    let rawUrl='';
    try{rawUrl=typeof input==='string'?input:input?.url||String(input)}catch(e){return nativeFetch(input,init)}
    try{
      const u=new URL(rawUrl,location.href);
      if(!isAiUrl(u))return nativeFetch(input,init);
      const key=cleanKey(u.searchParams.get('key')||window.localCfg?.ai?.accessKey||'');
      if(u.searchParams.has('key'))u.searchParams.delete('key');
      const opts=Object.assign({},init||{});
      const headers=new Headers(input instanceof Request?input.headers:undefined);
      new Headers(init?.headers||{}).forEach((v,k)=>headers.set(k,v));
      if(key)headers.set('X-App-Key',key);
      opts.headers=headers;
      if(input instanceof Request)return nativeFetch(new Request(u.toString(),input),opts);
      return nativeFetch(u.toString(),opts);
    }catch(e){return nativeFetch(input,init)}
  };

  migrate();
  const mo=new MutationObserver(()=>enhanceSettings(document));
  mo.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('load',()=>{migrate();enhanceSettings(document)},{once:true});
})();
