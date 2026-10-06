/* =========================================================
   assistant-storage.js — AI Workspace の会話履歴
   IndexedDB（使えない端末では localStorage）に保存する。
   保存するのは会話テキスト・添付の「名前/種別/サイズ/要約」・操作候補の状態だけ。
   画像・PDF・Excelなどファイルの中身は保存しない（data / dataUrl キーは書き込み時に必ず除去）。
   ========================================================= */
'use strict';
(function(){
  const DB_NAME='koujiNextAi',STORE='conversations',LS_KEY='koujiNextAiConvV1';
  const MAX_CONV=100,MAX_MSG=200;
  const mem=new Map();          /* 履歴保存OFF・保存失敗時の一時領域（ページを閉じると消える） */
  let dbp=null;

  function idb(){
    if(dbp)return dbp;
    dbp=new Promise(res=>{
      if(!window.indexedDB)return res(null);
      let req;try{req=indexedDB.open(DB_NAME,1)}catch(e){return res(null)}
      req.onupgradeneeded=()=>{try{req.result.createObjectStore(STORE,{keyPath:'id'})}catch(e){}};
      req.onsuccess=()=>res(req.result);
      req.onerror=()=>res(null);
      req.onblocked=()=>res(null);
    });
    return dbp;
  }
  function wrap(req){return new Promise((res,rej)=>{req.onsuccess=()=>res(req.result);req.onerror=()=>rej(req.error)})}
  async function store(mode){const db=await idb();if(!db)return null;try{return db.transaction(STORE,mode).objectStore(STORE)}catch(e){return null}}

  /* localStorage フォールバック */
  function lsAll(){try{const v=KoujiSecurity.read(LS_KEY,{});return v&&typeof v==='object'?v:{}}catch(e){return {}}}
  function lsSave(o){try{KoujiSecurity.write(LS_KEY,o);return true}catch(e){return false}}

  /* ファイルの中身を絶対に保存しないためのサニタイズ */
  function clean(conv){
    const c=JSON.parse(JSON.stringify(conv,(k,v)=>{
      if(k==='data'||k==='dataUrl'||k==='thumb'||k==='images')return undefined;
      if(k==='text'&&typeof v==='string'&&v.length>20000)return v.slice(0,20000);
      return v;
    }));
    if(Array.isArray(c.messages)&&c.messages.length>MAX_MSG)c.messages=c.messages.slice(-MAX_MSG);
    return c;
  }
  function summary(c){return {id:c.id,title:c.title||'新しい会話',updatedAt:c.updatedAt||0,createdAt:c.createdAt||0,count:(c.messages||[]).length}}

  async function unseal(c){
    if(!c)return null;
    if(c.sealed){const v=await KoujiSecurity.open(c.sealed,'ai-conversation:'+c.id);if(v.id!==c.id)throw Error('会話IDが一致しません');return v}
    const sealed=await KoujiSecurity.seal(clean(c),'ai-conversation:'+c.id);
    const s=await store('readwrite');if(s)await committed(s,{id:c.id,sealed});
    return c;
  }
  function committed(s,v){return new Promise((resolve,reject)=>{const tx=s.transaction;tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error||Error('会話を保存できません'));s.put(v)})}
  const api={
    newId(){return 'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)},
    titleOf(text){const t=String(text||'').replace(/\s+/g,' ').trim();return t.length>28?t.slice(0,28)+'…':(t||'新しい会話')},

    async list(){
      const out=new Map();
      mem.forEach(c=>out.set(c.id,summary(c)));
      const s=await store('readonly');
      if(s){try{for(const row of await wrap(s.getAll())){const c=await unseal(row);out.set(c.id,summary(c))}}catch(e){}}
      else{const all=lsAll();Object.keys(all).forEach(k=>out.set(k,summary(all[k])))}
      return [...out.values()].sort((a,b)=>b.updatedAt-a.updatedAt);
    },
    async get(id){
      if(mem.has(id))return JSON.parse(JSON.stringify(mem.get(id)));
      const s=await store('readonly');
      if(s){try{return await unseal(await wrap(s.get(id)))}catch(e){return null}}
      return lsAll()[id]||null;
    },
    /* persist=false（履歴保存OFF）のときは端末にも書かない */
    async save(conv,{persist=true}={}){
      const c=clean(conv);c.updatedAt=Date.now();if(!c.createdAt)c.createdAt=c.updatedAt;
      if(!persist){mem.set(c.id,c);return c}
      mem.delete(c.id);
      const sealed=await KoujiSecurity.seal(c,'ai-conversation:'+c.id);
      const s=await store('readwrite');
      if(s){try{await committed(s,{id:c.id,sealed})}catch(e){mem.set(c.id,c)}}
      else{const all=lsAll();all[c.id]=c;if(!lsSave(all)){mem.set(c.id,c)}}
      api.prune().catch(()=>{});
      return c;
    },
    async remove(id){
      mem.delete(id);
      const s=await store('readwrite');
      if(s){try{await wrap(s.delete(id))}catch(e){}}
      else{const all=lsAll();delete all[id];lsSave(all)}
    },
    async clear(){
      mem.clear();
      const s=await store('readwrite');
      if(s){try{await wrap(s.clear())}catch(e){}}
      try{KoujiSecurity.remove(LS_KEY)}catch(e){}
    },
    async prune(){
      const list=await api.list();
      for(const x of list.slice(MAX_CONV))await api.remove(x.id);
    },
    /* 診断用: どの保存先を使っているか */
    async backend(){return (await idb())?'indexeddb':'localstorage'}
  };
  window.KoujiAIStore=api;
})();
