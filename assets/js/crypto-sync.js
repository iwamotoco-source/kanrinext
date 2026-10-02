/* =========================================================
   crypto-sync.js — GitHub同期データのクライアント側暗号化
   AES-256-GCM + PBKDF2-SHA-256。同期パスワードはsessionStorageのみ。
   ========================================================= */
'use strict';
(function(){
  const CFG_KEY='koujiNextCryptoConfigV1';
  const PASS_KEY='koujiNextCryptoPassSessionV1';
  const FORMAT='kouji-next-encrypted-v1';
  const AAD='工事管理next|github-sync|v1';
  const DEFAULT_CFG={enabled:true,iterations:250000};

  function cfg(){
    const v=loadJSON(CFG_KEY,null);
    return Object.assign({},DEFAULT_CFG,v||{});
  }
  function saveCfg(v){saveJSON(CFG_KEY,Object.assign({},cfg(),v||{}))}
  function sessionPass(){try{return sessionStorage.getItem(PASS_KEY)||''}catch(e){return ''}}
  function setSessionPass(v){try{if(v)sessionStorage.setItem(PASS_KEY,v);else sessionStorage.removeItem(PASS_KEY)}catch(e){}}
  function bytesToB64(bytes){
    let s='';for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(s);
  }
  function b64ToBytes(s){
    const bin=atob(s||''),out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out;
  }
  async function keyFromPassword(pass,salt,iterations){
    const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  }
  async function encryptPayload(payload,pass){
    const c=cfg(),salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
    const key=await keyFromPassword(pass,salt,c.iterations);
    const plain=new TextEncoder().encode(JSON.stringify(payload));
    const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode(AAD),tagLength:128},key,plain));
    return {
      app:'工事管理next',
      schema:3,
      encrypted:true,
      format:FORMAT,
      updatedAt:payload.updatedAt||Date.now(),
      crypto:{alg:'AES-256-GCM',kdf:'PBKDF2-SHA-256',iterations:c.iterations,salt:bytesToB64(salt),iv:bytesToB64(iv)},
      ciphertext:bytesToB64(ct)
    };
  }
  async function decryptPayload(env,pass){
    if(!isEncrypted(env))return env;
    const meta=env.crypto||{},salt=b64ToBytes(meta.salt),iv=b64ToBytes(meta.iv),iterations=Math.max(100000,+meta.iterations||250000);
    const key=await keyFromPassword(pass,salt,iterations);
    const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode(AAD),tagLength:128},key,b64ToBytes(env.ciphertext));
    return JSON.parse(new TextDecoder().decode(pt));
  }
  function isEncrypted(x){return !!(x&&x.encrypted===true&&x.format===FORMAT&&x.crypto&&x.ciphertext)}

  async function askPassword(){
    const current=sessionPass();if(current)return current;
    if(typeof openModal!=='function'){
      const p=window.prompt('GitHub同期データの暗号化パスワードを入力してください');
      if(p)setSessionPass(p);return p||'';
    }
    return new Promise(resolve=>{
      let settled=false;
      openModal(`<div class="mHead"><h2>同期データを復号</h2><button class="btn ghost icon" type="button" data-close aria-label="閉じる">${icon('x')}</button></div>
        <div class="mBody"><p style="margin:0 0 12px;line-height:1.7">GitHub上の同期データは暗号化されています。同期パスワードを入力してください。</p>
        <div class="field"><label>同期パスワード</label><input type="password" id="cryptoUnlockPass" autocomplete="current-password" autofocus></div>
        <p class="hint" style="margin:10px 0 0">パスワードはGitHubやlocalStorageには保存しません。このウィンドウを閉じるまでsessionStorageにだけ保持します。</p></div>
        <div class="mFoot"><button class="btn" type="button" data-close>キャンセル</button><button class="btn primary" type="button" id="cryptoUnlockGo">解除</button></div>`,
        {onMount:box=>{
          const inp=box.querySelector('#cryptoUnlockPass'),go=box.querySelector('#cryptoUnlockGo');
          const done=()=>{const p=inp.value;if(!p){inp.focus();return}settled=true;setSessionPass(p);closeModal();resolve(p)};
          go.onclick=done;inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();done()}};
        },onClose:()=>{if(!settled)resolve('')}});
    });
  }

  async function remoteRaw(){
    const g=localCfg.github;
    const r=await fetch(ghUrl()+`?ref=${encodeURIComponent(g.branch||'main')}`,{headers:ghHeaders(),cache:'no-store'});
    if(r.status===404)return null;
    if(!r.ok)throw new Error('GitHub '+r.status);
    const x=await r.json(),bin=atob((x.content||'').replace(/\n/g,''));
    const txt=new TextDecoder().decode(Uint8Array.from(bin,c=>c.charCodeAt(0)));
    return {sha:x.sha,raw:JSON.parse(txt)};
  }
  async function putRemote(payload,sha,{encrypt,pass}){
    const g=localCfg.github;
    const stored=encrypt?await encryptPayload(payload,pass):payload;
    const body={message:`工事管理next ${encrypt?'暗号化':''}同期 ${new Date().toLocaleString('ja-JP')}`,content:b64utf8(JSON.stringify(stored,null,2)),branch:g.branch||'main'};
    if(sha)body.sha=sha;
    const r=await fetch(ghUrl(),{method:'PUT',headers:{...ghHeaders(),'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(!r.ok)throw new Error('GitHub '+r.status);
    return r.json();
  }
  async function decodeRemote(remote,promptUser){
    if(!remote)return null;
    if(!isEncrypted(remote.raw))return {sha:remote.sha,payload:remote.raw,encrypted:false};
    let pass=sessionPass();
    if(!pass&&promptUser)pass=await askPassword();
    if(!pass){const e=new Error('暗号化パスワードが必要です');e.code='CRYPTO_PASS_REQUIRED';throw e}
    try{return {sha:remote.sha,payload:await decryptPayload(remote.raw,pass),encrypted:true,pass}}
    catch(err){setSessionPass('');const e=new Error('同期パスワードが違うか、暗号化データが破損しています');e.code='CRYPTO_BAD_PASS';throw e}
  }

  async function secureSyncNow(mode='auto'){
    if(!ghCfgValid()){setSyncStatus('','ローカル保存');if(mode!=='auto')toast('設定 → GitHub同期 で接続先を登録してください');return}
    if(!window.crypto?.subtle){setSyncStatus('err','暗号化未対応');if(mode!=='auto')toast('このブラウザはWeb Crypto APIに対応していません');return}
    const c=cfg(),promptUser=mode!=='auto';
    let pass=sessionPass();
    if(c.enabled&&!pass&&promptUser)pass=await askPassword();
    if(c.enabled&&!pass){setSyncStatus('err','暗号化待ち');if(promptUser)toast('同期パスワードを入力してください');return}
    setSyncStatus('busy',c.enabled?'暗号化同期中':'同期中');
    try{
      const raw=await remoteRaw();
      const remote=await decodeRemote(raw,promptUser);
      const local=syncPayload();
      const encrypt=!!(c.enabled||remote?.encrypted);
      if(encrypt&&!pass)pass=remote?.pass||sessionPass()||(promptUser?await askPassword():'');
      if(encrypt&&!pass){setSyncStatus('err','暗号化待ち');return}

      if(mode==='pull'){
        if(remote){
          applyPayload(remote.payload);
          if(encrypt&&!remote.encrypted)await putRemote(syncPayload(),remote.sha,{encrypt:true,pass});
        }else toast('GitHubに同期データがまだありません');
      }else if(mode==='push'){
        await putRemote(local,remote?.sha||null,{encrypt,pass});
      }else if(!remote){
        await putRemote(local,null,{encrypt,pass});
      }else if((remote.payload?.updatedAt||0)>state.updatedAt){
        applyPayload(remote.payload);
        if(encrypt&&!remote.encrypted)await putRemote(syncPayload(),remote.sha,{encrypt:true,pass});
      }else if((remote.payload?.updatedAt||0)<state.updatedAt){
        await putRemote(local,remote.sha,{encrypt,pass});
      }else if(encrypt&&!remote.encrypted){
        await putRemote(local,remote.sha,{encrypt:true,pass});
      }
      setSyncStatus('ok',encrypt?'暗号化同期済み':'同期済み');
      if(mode!=='auto')toast(encrypt?'暗号化してGitHubと同期しました':'GitHubと同期しました');
    }catch(e){
      console.error(e);
      if(e.code==='CRYPTO_PASS_REQUIRED'){setSyncStatus('err','暗号化待ち');if(promptUser)toast('同期パスワードを入力してください');return}
      if(e.code==='CRYPTO_BAD_PASS'){setSyncStatus('err','復号エラー');if(promptUser)toast(e.message);return}
      setSyncStatus('err','同期エラー');if(promptUser)toast('GitHub同期に失敗しました（'+e.message+'）');
    }
  }

  /* core.js の同期処理を安全版へ差し替え。scheduleSync / 自動同期タイマーも実行時にこの関数を参照する。 */
  syncNow=secureSyncNow;

  /* 設定画面に暗号化設定を追加 */
  const originalOpenSettings=openSettings;
  openSettings=function(tab='general'){
    originalOpenSettings(tab);
    const sec=document.querySelector('.setSec[data-sec="sync"]');if(!sec||sec.querySelector('#syncEncrypt'))return;
    const c=cfg(),box=document.createElement('div');box.className='cryptoBox';
    box.innerHTML=`<h4>同期データの暗号化</h4>
      <label class="check"><input type="checkbox" id="syncEncrypt" ${c.enabled?'checked':''}> GitHubへ保存する予定・タスク・設定を暗号化する</label>
      <div class="grid2 cryptoFields">
        <div class="field"><label>同期パスワード</label><input type="password" id="syncCryptoPass" autocomplete="new-password" placeholder="${sessionPass()?'このセッションでは入力済み':'8文字以上'}"></div>
        <div class="field"><label>確認</label><input type="password" id="syncCryptoPass2" autocomplete="new-password" placeholder="もう一度入力"></div>
      </div>
      <div class="row cryptoStatus"><span class="hint" id="cryptoState">${sessionPass()?'このセッションでは復号可能です':'パスワードは端末に永続保存されません'}</span><button class="btn sm ghost" type="button" id="cryptoForget">このセッションの鍵を破棄</button></div>
      <p class="hint">AES-256-GCM / PBKDF2-SHA-256（250,000回）。GitHub上には暗号文・salt・IVのみ保存します。既存の平文同期ファイルは、次の同期時に同じ場所で暗号化形式へ移行します。過去のGitコミット履歴に残った平文は別途削除が必要です。</p>`;
    const grid=sec.querySelector('.grid2');sec.insertBefore(box,grid||sec.firstChild);

    if(!document.getElementById('cryptoSyncStyle')){
      const st=document.createElement('style');st.id='cryptoSyncStyle';st.textContent='.cryptoBox{border:1px solid var(--line);background:var(--surface-2);border-radius:var(--r-m);padding:12px 14px;margin:0 0 14px}.cryptoBox h4{font-size:13.5px;margin:0 0 10px}.cryptoFields{margin-top:10px}.cryptoStatus{justify-content:space-between;margin-top:8px}.cryptoBox .hint{line-height:1.6}';document.head.appendChild(st);
    }
    const en=box.querySelector('#syncEncrypt'),p1=box.querySelector('#syncCryptoPass'),p2=box.querySelector('#syncCryptoPass2'),status=box.querySelector('#cryptoState');
    const prep=()=>{
      const on=en.checked,a=p1.value,b=p2.value;
      if(on&&a){
        if(a.length<8){toast('同期パスワードは8文字以上にしてください');p1.focus();return false}
        if(a!==b){toast('同期パスワードの確認入力が一致しません');p2.focus();return false}
        setSessionPass(a);status.textContent='このセッションでは復号可能です';
      }
      if(on&&!sessionPass()){toast('暗号化を有効にするには同期パスワードを入力してください');p1.focus();return false}
      saveCfg({enabled:on});return true;
    };
    box.querySelector('#cryptoForget').onclick=()=>{setSessionPass('');p1.value=p2.value='';status.textContent='セッション鍵を破棄しました';toast('同期パスワードをこのセッションから破棄しました')};

    const save=document.getElementById('setSave');
    if(save&&save.onclick){
      const orig=save.onclick;
      save.onclick=async ev=>{if(!prep())return;await orig.call(save,ev);saveCfg({enabled:en.checked})};
    }
    ['ghPull','ghPush'].forEach(id=>{
      const b=document.getElementById(id);if(!b||!b.onclick)return;const orig=b.onclick;
      b.onclick=async ev=>{if(!prep())return;return orig.call(b,ev)};
    });
  };

  /* 初回導入時は安全側：GitHub同期の暗号化を既定でONにする */
  if(!loadJSON(CFG_KEY,null))saveCfg(DEFAULT_CFG);
})();