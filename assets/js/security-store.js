/* Automatic device storage encryption. No extra unlock prompt.
 * A non-extractable device key lives in IndexedDB. This protects stored values
 * from plain-text copies; it does NOT protect against same-origin XSS or a
 * person/process with access to the whole browser profile. */
'use strict';
(()=>{
  const FORMAT='kouji-device-sealed-v1',DB='koujiNextDeviceSecurity',STORE='keys';
  const keys=new Set(['koujiNextStateV1','koujiNextLocalConfigV1','koujiNextSyncBaseV1','odakyu_foldernav_tasks_v2','odakyu_fare_note_v2','koujiNextAiConvV1','koujiElectricalChecksV1','kanrinextElectricalPersonalV1']);
  const cache=new Map(),queues=new Map();let deviceKey,ready=false,failed=false;
  const enc=new TextEncoder(),dec=new TextDecoder();
  const parse=s=>JSON.parse(s,(k,v)=>['__proto__','constructor','prototype'].includes(k)?undefined:v);
  const b64=b=>{let s='';for(let i=0;i<b.length;i+=32768)s+=String.fromCharCode(...b.subarray(i,i+32768));return btoa(s)};
  const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  function notice(){failed=true;let p=document.getElementById('deviceSaveError');if(!p){p=document.createElement('div');p.id='deviceSaveError';p.setAttribute('role','alert');p.style.cssText='position:fixed;z-index:100000;bottom:0;left:0;right:0;padding:14px;background:#602020;color:white';(document.body||document.documentElement).append(p)}p.textContent='端末への保護保存に失敗しました。この画面を閉じず、バックアップを書き出してください。';}
  async function key(){
    if(!crypto.subtle||!indexedDB)throw Error('安全な端末保存に対応していません');
    const db=await new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('端末保存が他の画面で使用中です'))});
    const candidate=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);
    return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite'),s=tx.objectStore(STORE),r=s.get('device');let k;r.onsuccess=()=>{k=r.result||candidate;if(!r.result)s.put(k,'device')};tx.oncomplete=()=>{db.close();resolve(k)};tx.onabort=()=>{db.close();reject(tx.error||Error('端末鍵を保存できません'))}});
  }
  async function seal(value,context){
    await api.ready;const iv=crypto.getRandomValues(new Uint8Array(12));
    const data=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:enc.encode(FORMAT+'|'+context)},deviceKey,enc.encode(JSON.stringify(value)));
    return {format:FORMAT,iv:b64(iv),ciphertext:b64(new Uint8Array(data))};
  }
  async function open(value,context){
    if(value?.format!==FORMAT)return value;
    const iv=bytes(value.iv);if(iv.length!==12)throw Error('保存データの形式が不正です');
    const data=await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:enc.encode(FORMAT+'|'+context)},deviceKey,bytes(value.ciphertext));return parse(dec.decode(data));
  }
  // Internal variant avoids waiting on initialization's own promise.
  async function persist(k,text){const iv=crypto.getRandomValues(new Uint8Array(12)),data=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:enc.encode(FORMAT+'|'+k)},deviceKey,enc.encode(JSON.stringify(text)));localStorage.setItem(k,JSON.stringify({format:FORMAT,iv:b64(iv),ciphertext:b64(new Uint8Array(data))}));}
  const api={
    protects:k=>keys.has(k),parse,
    getText(k){if(!keys.has(k))return localStorage.getItem(k);if(!ready)throw Error('端末保存の準備中です');return cache.get(k)??null},
    setText(k,text){if(!keys.has(k)){localStorage.setItem(k,text);return}if(!ready)throw Error('端末保存の準備中です');text=String(text);cache.set(k,text);const prior=queues.get(k)||Promise.resolve();const p=prior.catch(()=>{}).then(()=>persist(k,text));queues.set(k,p);p.then(()=>{if(queues.get(k)===p)queues.delete(k)},notice);},
    remove(k){cache.delete(k);const p=(queues.get(k)||Promise.resolve()).catch(()=>{}).then(()=>localStorage.removeItem(k));queues.set(k,p);p.then(()=>{if(queues.get(k)===p)queues.delete(k)},notice)},
    read(k,d){const s=api.getText(k);return s===null?d:parse(s)},
    write(k,v){api.setText(k,JSON.stringify(v))},seal,open,
    async flush(){await Promise.all([...queues.values()]);if(failed)throw Error('保護保存に失敗しました')},
    status:()=>({ready,pending:queues.size,failed})
  };
  window.KoujiSecurity=api;
  api.ready=(async()=>{
    deviceKey=await key();
    for(const k of keys){const raw=localStorage.getItem(k);if(raw===null)continue;let v;try{v=parse(raw)}catch{throw Error('保存済みデータを読めません：'+k)}
      if(v?.format===FORMAT){const text=await open(v,k);if(typeof text!=='string')throw Error('保存データの形式が不正です');cache.set(k,text)}
      else{cache.set(k,raw);await persist(k,raw);const checked=await open(parse(localStorage.getItem(k)),k);if(checked!==raw)throw Error('端末保存を検証できません')}
    }
    ready=true;
  })();
  api.ready.catch(()=>{}); // Main/standalone startup renders an error; never initializes empty state.
  addEventListener('beforeunload',e=>{if(queues.size||failed){e.preventDefault();e.returnValue=''}});
  addEventListener('storage',e=>{if(!keys.has(e.key))return;if(e.newValue===null){cache.delete(e.key);return}api.ready.then(async()=>{const v=parse(e.newValue);if(v?.format===FORMAT)cache.set(e.key,await open(v,e.key));else{cache.set(e.key,e.newValue);api.setText(e.key,e.newValue)}}).catch(notice)});
})();
