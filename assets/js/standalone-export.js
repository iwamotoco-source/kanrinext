'use strict';
/* =========================================================
   工事管理next — ローカル用「単一HTML」書き出し
   設定 → バックアップ → 「ローカル用の単一HTMLを保存」から呼ばれる。

   やること（ビルド工程やサーバー処理は不要。公開中のファイルをこのブラウザで取得して1つにまとめる）:
     1. index.html から出発し、読み込まれるJS/CSS・ツール・アバター画像・ライブラリを集める
     2. JS/CSS は HTML にそのまま埋め込み、画像・ライブラリ・各ツールは「仮想ファイル」として埋め込む
     3. 書き出したHTMLの中では knRuntime（下）が動き、相対パスで参照される画像・スクリプト・fetch・Worker・
        ツールのiframe を埋め込み済みの仮想ファイルへ振り替える

   ネットが必要な機能（地図の背景・天気・AI/GitHub通信・動画圧縮エンジン・端末内音声のモデル取得）は、
   オンラインのときだけ動く。予定・タスク・各ツール・AI画面の表示などはオフラインで動く。
   ※ 新しいファイルを足したときは、index.html / ics.js / ツールHTML から参照される形で書けば自動で含まれる。
   ========================================================= */
(function(){
  /* ---------- 書き出したHTMLの中で動く実行時シム ----------
     この関数は toString() で書き出し先へ丸ごと埋め込まれる。外側の変数には一切触れないこと。
     FILES: { 'assets/avatar/i/idle.webp': [mime, 't'|'u', data], ... }  't'=テキスト 'u'=data URI */
  function knRuntime(FILES,META){
    'use strict';
    var VROOT='https://kn.invalid/';
    var mainDir=(function(){var u=new URL(document.baseURI);u.hash='';u.search='';return u.href.slice(0,u.href.lastIndexOf('/')+1)})();
    var urlCache=Object.create(null),origSrc=new WeakMap();

    var ALIAS=META.aliases||{};
    function has(k){return Object.prototype.hasOwnProperty.call(FILES,k)}
    /* FILES に無い名前は、別名（同じ中身を持つ同梱ファイル）があればそちらを使う */
    function pick(k){return has(k)?k:(ALIAS[k]&&has(ALIAS[k])?ALIAS[k]:null)}
    function relOf(abs){
      var rel=null;
      if(abs.indexOf(VROOT)===0)rel=abs.slice(VROOT.length);
      else if(abs.indexOf(mainDir)===0)rel=abs.slice(mainDir.length);
      if(rel==null)return null;
      rel=rel.split('#')[0].split('?')[0];
      try{rel=decodeURIComponent(rel)}catch(e){}
      return rel;
    }
    /* 相対URL → FILES のキー（無ければ null） */
    function keyOf(u,win){
      if(u==null)return null;u=String(u);
      if(!u||/^(?:data|blob|about|javascript|mailto|tel):/i.test(u))return null;
      var abs;try{abs=new URL(u,(win||window).document.baseURI).href}catch(e){return null}
      var rel=relOf(abs);
      return rel!=null?pick(rel):null;
    }
    function urlFor(key){
      if(urlCache[key])return urlCache[key];
      var e=FILES[key];
      return urlCache[key]=e[1]==='u'?e[2]:URL.createObjectURL(new Blob([e[2]],{type:e[0]}));
    }
    function escScript(s){return String(s).replace(/<\/script/gi,'<\\/script').replace(/<!--/g,'<\\!--')}
    function esc(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}

    /* ツールのHTMLを組み立てる（static な <script src>/<link> を埋め込み、?embed=1&theme= を渡す） */
    function toolDoc(key,qs){
      var html=FILES[key][2];
      function toolKey(ref){
        if(!ref||/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(ref))return null;
        var rel=relOf(new URL(ref,VROOT+'tools/').href);
        return rel!=null?pick(rel):null;
      }
      var deferred=[];
      html=html.replace(/<script\b([^>]*?)\bsrc\s*=\s*(["'])(.*?)\2([^>]*)>\s*<\/script>/gi,function(m,a,q,src,b){
        var k=toolKey(src);if(!k)return m;
        var code=escScript(FILES[k][2]);
        /* defer / async は「ページを読み終えてから実行」。インライン化すると即時実行になるので、本文の最後へ回す */
        if(/\b(?:defer|async)\b/i.test(a+' '+b)&&!/type\s*=\s*["']?module/i.test(a+' '+b)){deferred.push(code);return ''}
        return '<script'+a+b+'>'+code+'</script>';
      });
      if(deferred.length){
        var tailJs=deferred.map(function(c){return '<script>'+c+'</script>'}).join('\n');
        var bi=html.toLowerCase().lastIndexOf('</body>');
        html=bi>=0?html.slice(0,bi)+tailJs+html.slice(bi):html+tailJs;
      }
      html=html.replace(/<link\b[^>]*>/gi,function(m){
        if(!/rel\s*=\s*["']?stylesheet/i.test(m))return m;
        var h=/href\s*=\s*(["'])(.*?)\1/i.exec(m);if(!h)return m;
        var k=toolKey(h[2]);if(!k)return m;
        return '<style>'+String(FILES[k][2]).replace(/<\/style/gi,'<\\/style')+'</style>';
      });
      /* iframe内には ?embed=1&theme= が無いので、location.search の参照だけ差し替える */
      html=html.replace(/\blocation\.search\b/g,'(window.__KN_QS||location.search)');
      var head='<base href="'+VROOT+'tools/"><script>window.__KN_QS='+JSON.stringify(qs||'')+';try{parent.__KN.install(window)}catch(e){}</script>';
      if(/<head[^>]*>/i.test(html))html=html.replace(/<head[^>]*>/i,function(m){return m+head});
      else html=head+html;
      return html;
    }

    function install(win){
      var doc=win.document,P=win.HTMLImageElement.prototype;

      /* --- <img>.src --- */
      var imgSrc=Object.getOwnPropertyDescriptor(P,'src');
      Object.defineProperty(P,'src',{configurable:true,enumerable:true,
        get:function(){return imgSrc.get.call(this)},
        set:function(v){var k=keyOf(v,win);if(k){origSrc.set(this,String(v));imgSrc.set.call(this,urlFor(k))}else{origSrc.delete(this);imgSrc.set.call(this,v)}}});
      /* --- <script>.src --- */
      var SP=win.HTMLScriptElement.prototype,scSrc=Object.getOwnPropertyDescriptor(SP,'src');
      Object.defineProperty(SP,'src',{configurable:true,enumerable:true,
        get:function(){return scSrc.get.call(this)},
        set:function(v){var k=keyOf(v,win);scSrc.set.call(this,k?urlFor(k):v)}});
      /* --- setAttribute / getAttribute（avatar.js などが getAttribute('src') を比較に使う） --- */
      var EP=win.Element.prototype,nSet=EP.setAttribute,nGet=EP.getAttribute;
      EP.setAttribute=function(n,v){
        if(typeof n==='string'){
          var ln=n.toLowerCase(),t=this.tagName;
          if((ln==='src'&&(t==='IMG'||t==='SCRIPT'||t==='SOURCE'||t==='AUDIO'||t==='VIDEO'))||(ln==='href'&&t==='LINK')){
            var k=keyOf(v,win);
            if(k){if(t==='IMG')origSrc.set(this,String(v));return nSet.call(this,n,urlFor(k))}
            if(t==='IMG')origSrc.delete(this);
          }
        }
        return nSet.call(this,n,v);
      };
      EP.getAttribute=function(n){
        if(origSrc.has(this)&&String(n).toLowerCase()==='src')return origSrc.get(this);
        return nGet.call(this,n);
      };
      /* --- innerHTML などで作られた <img src="./assets/..."> を後から差し替える --- */
      function fixImg(im){
        if(origSrc.has(im))return;
        var raw=nGet.call(im,'src'),k=keyOf(raw,win);
        if(k){origSrc.set(im,raw);nSet.call(im,'src',urlFor(k))}
      }
      try{
        new win.MutationObserver(function(ms){
          for(var i=0;i<ms.length;i++){
            var m=ms[i];
            if(m.type==='attributes'){if(m.target.tagName==='IMG')fixImg(m.target)}
            else for(var j=0;j<m.addedNodes.length;j++){
              var n=m.addedNodes[j];if(n.nodeType!==1)continue;
              if(n.tagName==='IMG')fixImg(n);
              if(n.querySelectorAll){var l=n.querySelectorAll('img');for(var q=0;q<l.length;q++)fixImg(l[q])}
            }
          }
        }).observe(doc.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});
      }catch(e){}

      /* --- fetch --- */
      var nFetch=win.fetch&&win.fetch.bind(win);
      if(nFetch)win.fetch=function(input,init){
        var u=typeof input==='string'?input:(input&&input.url),k=keyOf(u,win);
        if(k){
          var method=((init&&init.method)||(input&&input.method)||'GET').toUpperCase(),e=FILES[k];
          if(method==='HEAD')return Promise.resolve(new win.Response(null,{status:200,headers:{'Content-Type':e[0]}}));
          return e[1]==='t'?Promise.resolve(new win.Response(e[2],{status:200,headers:{'Content-Type':e[0]}})):nFetch(e[2]);
        }
        return nFetch(input,init);
      };
      /* --- Worker --- */
      var NW=win.Worker;
      if(NW){
        var W=function(u,o){var k=keyOf(u,win);return new NW(k?urlFor(k):u,o)};
        W.prototype=NW.prototype;win.Worker=W;
      }
      /* --- pdf.js ---
         file:// ではpdf.jsの標準のworker起動（blobを経由して読み込む方式）が拒否されるため、埋め込み済みworkerを直接起動して workerPort に渡す。
         起動に失敗したときは workerPort を返さず、pdf.js 本来のメインスレッド処理に任せる（ハングさせない）。 */
      var wk='tools/lib/pdf.worker.min.js',pdf;
      function hookPdf(v){
        var g=v&&v.GlobalWorkerOptions;if(!g)return;
        var port=null,failed=false;
        try{
          port=new win.Worker(urlFor(wk));
          port.addEventListener('error',function(){failed=true;try{port.terminate()}catch(e){}port=null});
        }catch(e){failed=true;port=null}
        Object.defineProperty(g,'workerSrc',{configurable:true,enumerable:true,get:function(){return urlFor(wk)},set:function(){}});
        Object.defineProperty(g,'workerPort',{configurable:true,enumerable:true,get:function(){return failed?null:port},set:function(x){if(x){port=x;failed=false}}});
      }
      if(has(wk)&&!('pdfjsLib' in win&&win.pdfjsLib)){
        try{Object.defineProperty(win,'pdfjsLib',{configurable:true,enumerable:true,
          get:function(){return pdf},
          set:function(v){pdf=v;try{hookPdf(v)}catch(e){}}})}catch(e){}
      }
      /* --- ツールのiframe（本体側のみ） --- */
      if(win===window&&win.HTMLIFrameElement){
        var IP=win.HTMLIFrameElement.prototype,ifSrc=Object.getOwnPropertyDescriptor(IP,'src');
        Object.defineProperty(IP,'src',{configurable:true,enumerable:true,
          get:function(){return this.__knSrc!==undefined?this.__knSrc:ifSrc.get.call(this)},
          set:function(v){
            var k=keyOf(v,win);
            if(k&&/^tools\/[^/]+\.html$/.test(k)){
              var q=/\?[^#]*/.exec(String(v));
              this.__knSrc=String(v);
              this.srcdoc=toolDoc(k,q?q[0]:'');
            }else{this.__knSrc=undefined;ifSrc.set.call(this,v)}
          }});
      }
    }

    window.KN_STANDALONE=true;
    window.KNStandalone={isStandalone:true,builtAt:META.builtAt,source:META.source,files:Object.keys(FILES).length};
    window.__KN={install:install,keyOf:keyOf,urlFor:urlFor};
    document.documentElement.setAttribute('data-kn-local','1');
    install(window);
  }

  /* ---------- 書き出し側 ---------- */
  var MIME={js:'text/javascript',mjs:'text/javascript',css:'text/css',html:'text/html',json:'application/json',txt:'text/plain',svg:'image/svg+xml',
    webp:'image/webp',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',ico:'image/x-icon',woff:'font/woff',woff2:'font/woff2',ttf:'font/ttf',wasm:'application/wasm'};
  var TEXT_EXT=/^(?:js|mjs|css|html|json|txt|svg)$/;
  /* ツールが ./lib/ に置く前提のファイルのうち、リポジトリには別の場所に同じものがあるもの（PDF整理ツールのpdf-lib） */
  var ALIASES={'tools/lib/pdf-lib.min.js':'assets/vendor/compression/pdf-lib.min.js'};
  var EXCLUDE=[/^docs\//,/^scripts\//,/^workers\//,/^local-tts\//,/^api\//,/^\.github\//,/^data\/kouji-next\.json$/,
    /^assets\/vendor\/piper-plus\//,/^tools\/piper-voice\.html$/,/\.md$/i,/^icons\/icon-512\.png$/,/^service-worker\.js$/,/^manifest\.json$/,
    /^assets\/js\/standalone-export\.js$/];
  /* 「何が書いてあるか」を読んで参照先を探すのは、アプリ自身のJS/HTMLだけ（巨大なライブラリ・データは読まない） */
  var SCAN_SKIP=[/^tools\/lib\//,/^assets\/vendor\//,/^assets\/js\/electrical-knowledge-data\.js$/];
  var REF=/(?:\.{1,2}\/)?(?:assets|tools|icons)\/[A-Za-z0-9_\-.\/%]+?\.(?:js|mjs|css|html|json|webp|png|jpe?g|gif|svg|ico|woff2?|ttf)(?![A-Za-z0-9])/g;
  var LIBREF=/(?:\.\/)?lib\/[A-Za-z0-9_\-.]+\.(?:js|css|mjs)(?![A-Za-z0-9])/g;

  function norm(p){var out=[],a=p.split('/');for(var i=0;i<a.length;i++){var s=a[i];if(!s||s==='.')continue;if(s==='..')out.pop();else out.push(s)}return out.join('/')}
  function resolveRef(ref,baseDir){
    if(/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(ref))return null;
    return norm(baseDir+ref.split('#')[0].split('?')[0]);
  }
  var extOf=function(k){var m=/\.([A-Za-z0-9]+)$/.exec(k);return m?m[1].toLowerCase():''};
  var excluded=function(k){return EXCLUDE.some(function(r){return r.test(k)})};
  function readDataURL(blob){return new Promise(function(res,rej){var f=new FileReader();f.onload=function(){res(f.result)};f.onerror=function(){rej(f.error)};f.readAsDataURL(blob)})}
  function escScript(s){return String(s).replace(/<\/script/gi,'<\\/script').replace(/<!--/g,'<\\!--')}
  function stamp(d){var p=function(n){return String(n).padStart(2,'0')};return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())}

  /* ics.js は document.write で本体JSを後から読み込む。その一覧を、偽の document を渡して実行することで取り出す。 */
  function expandLoader(text){
    var out={css:[],js:[]};
    var fake={
      createElement:function(){return {}},
      head:{appendChild:function(e){if(e&&e.href)out.css.push(String(e.href))}},
      body:{appendChild:function(){}},
      write:function(h){String(h).replace(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi,function(m,s){out.js.push(s);return m})},
      currentScript:null
    };
    try{new Function('document',text)(fake)}catch(e){throw new Error('ics.js の読み込み一覧を解析できませんでした（'+e.message+'）')}
    if(!out.js.length)throw new Error('ics.js から読み込むJSの一覧を取得できませんでした');
    return out;
  }

  /* 取得 → 収集 */
  async function collect(progress){
    var files=new Map();           /* key -> {mime,kind,data} */
    var inflight=new Map();        /* key -> Promise */
    var missing=[],scanned=new Set(),active=0,doneCount=0,queue=[];
    var LIMIT=6;
    function tick(label){progress&&progress(doneCount,files.size+inflight.size,label)}

    function fetchOne(key){
      return fetch('./'+key.split('/').map(encodeURIComponent).join('/'),{cache:'no-cache'}).then(async function(r){
        if(!r.ok)throw new Error('HTTP '+r.status);
        var ext=extOf(key),mime=MIME[ext]||'application/octet-stream';
        if(TEXT_EXT.test(ext))return {mime:mime,kind:'t',data:await r.text()};
        var buf=await r.arrayBuffer();
        return {mime:mime,kind:'u',data:await readDataURL(new Blob([buf],{type:mime}))};
      });
    }
    /* 同時取得数を絞る（スマホ回線でも詰まらないように） */
    function schedule(fn){
      return new Promise(function(res,rej){
        var run=function(){active++;fn().then(res,rej).then(function(){active--;var n=queue.shift();n&&n()})};
        active<LIMIT?run():queue.push(run);
      });
    }
    function get(key,opts){
      opts=opts||{};
      if(files.has(key))return Promise.resolve(files.get(key));
      if(inflight.has(key))return inflight.get(key);
      var p=schedule(function(){return fetchOne(key)}).then(function(f){
        files.set(key,f);inflight.delete(key);doneCount++;tick(key);return f;
      },function(e){
        inflight.delete(key);doneCount++;
        if(opts.required)throw new Error(key+' を取得できませんでした（'+e.message+'）');
        missing.push(key);return null;
      });
      inflight.set(key,p);
      return p;
    }
    /* テキスト内の参照先（assets/…, tools/…, icons/…, lib/…）を探して追いかける */
    async function scan(key,text,ctxDir){
      var sk=key+'|'+ctxDir;if(scanned.has(sk))return;scanned.add(sk);
      if(SCAN_SKIP.some(function(r){return r.test(key)}))return;
      var found=new Set(),m;
      REF.lastIndex=0;while((m=REF.exec(text)))found.add(m[0]);
      if(/^tools\/[^/]+\.html$/.test(key)){LIBREF.lastIndex=0;while((m=LIBREF.exec(text)))found.add(m[0])}
      var jobs=[];
      found.forEach(function(lit){
        var k=resolveRef(lit,ctxDir);
        if(!k||excluded(k)||files.has(k)||inflight.has(k))return;
        jobs.push(addFile(k,ctxDir));
      });
      await Promise.all(jobs);
    }
    async function addFile(key,ctxDir,opts){
      if(excluded(key))return null;
      var f=await get(key,opts);
      if(f&&f.kind==='t'&&/^(?:js|mjs|css|html)$/.test(extOf(key)))await scan(key,f.data,ctxDir);
      return f;
    }
    /* ツールHTML: 静的な script/link/img を DOM から、動的な参照（workerSrc・LIB一覧など）を文字列から集める */
    async function addTool(key){
      var f=await addFile(key,'tools/',{required:true});
      if(!f)return;
      var d=new DOMParser().parseFromString(f.data,'text/html'),jobs=[];
      d.querySelectorAll('script[src],link[href],img[src]').forEach(function(el){
        var ref=el.getAttribute('src')||el.getAttribute('href'),k=resolveRef(ref||'','tools/');
        if(k&&!excluded(k))jobs.push(addFile(k,'tools/'));
      });
      await Promise.all(jobs);
    }
    return {files:files,missing:missing,get:get,addFile:addFile,addTool:addTool,scan:scan,idle:function(){return Promise.all(Array.from(inflight.values()))}};
  }

  async function build(progress){
    if(window.KN_STANDALONE)throw new Error('これはすでにローカル版です');
    if(location.protocol==='file:')throw new Error('公開ページ（https）から実行してください。ファイルを直接開いた状態では、ほかのファイルを読み取れません');
    var C=await collect(progress);
    var inlined=new Set(['index.html']);   /* index.html 自身は書き出し先の本体になるので、仮想ファイルには入れない */

    /* 1) index.html */
    var indexF=await C.get('index.html',{required:true});
    var doc=new DOMParser().parseFromString(indexF.data,'text/html');
    var head=doc.head,tail=[];

    /* 2) 本体のスクリプト／CSSを埋め込む（順序は元のまま） */
    var scripts=Array.prototype.slice.call(doc.querySelectorAll('script[src]'));
    var cssFromLoader=[];
    for(var i=0;i<scripts.length;i++){
      var el=scripts[i],ref=el.getAttribute('src'),key=resolveRef(ref,'');
      if(!key||/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(ref)){continue}            /* CDNなど外部はそのまま */
      if(key==='assets/js/standalone-export.js'){el.remove();continue}
      var f=await C.addFile(key,'',{required:true});
      var group=[];
      if(/(?:^|\/)ics\.js$/.test(key)){
        var L=expandLoader(f.data);
        inlined.add(key);
        for(var c=0;c<L.css.length;c++)cssFromLoader.push(resolveRef(L.css[c],''));
        for(var j=0;j<L.js.length;j++)group.push(resolveRef(L.js[j],''));
      }else group.push(key);
      for(var g=0;g<group.length;g++){
        var gk=group[g],gf=await C.addFile(gk,'',{required:true});
        inlined.add(gk);
        var s=doc.createElement('script');
        s.setAttribute('data-kn-src',gk);
        s.textContent='\n'+escScript(gf.data.replace(/document\.currentScript\.src/g,"(document.currentScript.dataset.knSrc?new URL(document.currentScript.dataset.knSrc,document.baseURI).href:'')"))+'\n';
        if(el.hasAttribute('defer')&&!/module/i.test(el.getAttribute('type')||''))doc.body.appendChild(s);   /* defer: 本文の最後で実行 */
        else el.parentNode.insertBefore(s,el);
      }
      el.remove();
    }
    var links=Array.prototype.slice.call(doc.querySelectorAll('link[href]'));
    for(var k2=0;k2<links.length;k2++){
      var ln=links[k2],rel=(ln.getAttribute('rel')||'').toLowerCase(),href=ln.getAttribute('href'),lk=resolveRef(href,'');
      if(!lk)continue;
      if(rel==='manifest'){ln.remove();continue}
      var lf=await C.addFile(lk,'',{required:rel==='stylesheet'});
      if(!lf)continue;
      if(rel==='stylesheet'){
        inlined.add(lk);
        var st=doc.createElement('style');st.setAttribute('data-kn-src',lk);st.textContent=lf.data;ln.parentNode.replaceChild(st,ln);
      }else if(lf.kind==='u'){ln.setAttribute('href',lf.data);inlined.add(lk)}
    }
    for(var c2=0;c2<cssFromLoader.length;c2++){
      var cf=await C.addFile(cssFromLoader[c2],'',{required:true});inlined.add(cssFromLoader[c2]);
      var st2=doc.createElement('style');st2.setAttribute('data-kn-src',cssFromLoader[c2]);st2.textContent=cf.data;head.appendChild(st2);
    }
    /* HTML内の画像（アバターなど）はそのまま data URI に */
    var imgs=Array.prototype.slice.call(doc.querySelectorAll('img[src]'));
    for(var m2=0;m2<imgs.length;m2++){
      var ik=resolveRef(imgs[m2].getAttribute('src'),'');if(!ik)continue;
      var imf=await C.addFile(ik,'');if(imf&&imf.kind==='u')imgs[m2].setAttribute('src',imf.data);
    }

    /* 3) ツール・アバター・ライブラリ */
    var tools=(typeof TOOLS!=='undefined'&&Array.isArray(TOOLS))?TOOLS:[];
    for(var t=0;t<tools.length;t++){
      var tk='tools/'+tools[t].file;
      if(excluded(tk))continue;
      await C.addTool(tk);
    }
    try{var av=window.KoujiAvatar&&window.KoujiAvatar.files&&window.KoujiAvatar.files()||[];await Promise.all(av.map(function(p){return C.addFile(p,'')}))}catch(e){}
    await C.idle();
    /* 別名の解決: 取得できなかったファイルに別の同梱ファイルがあれば、そちらを同梱する */
    var aliases={};
    for(var ak in ALIASES){
      if(C.files.has(ak))continue;
      var at=await C.addFile(ALIASES[ak],'tools/');
      if(at){aliases[ak]=ALIASES[ak];var mi=C.missing.indexOf(ak);if(mi>=0)C.missing.splice(mi,1)}
    }

    /* 4) 仮想ファイル表（HTMLに直接埋め込んだものは除く） */
    var table={},count=0;
    C.files.forEach(function(f,key){
      if(inlined.has(key)||!f)return;
      table[key]=[f.mime,f.kind,f.data];count++;
    });
    var meta={builtAt:new Date().toISOString(),source:location.origin+location.pathname.replace(/[^/]*$/,''),aliases:aliases};
    var json=JSON.stringify(table).replace(/<\/script/gi,'<\\/script').replace(/<!--/g,'<\\!--');

    /* 5) 組み立て */
    var boot=doc.createElement('script');
    boot.setAttribute('data-kn','runtime');
    boot.textContent='window.__KN_FILES='+json+';\n('+escScript(knRuntime.toString())+')(window.__KN_FILES,'+JSON.stringify(meta)+');';
    var metas=head.querySelectorAll('meta'),anchor=metas.length?metas[metas.length-1]:head.firstChild;
    anchor?anchor.insertAdjacentElement('afterend',boot):head.appendChild(boot);
    var gen=doc.createElement('meta');gen.setAttribute('name','kn-standalone');gen.setAttribute('content',meta.builtAt+' '+meta.source);head.insertBefore(gen,boot);
    var hide=doc.createElement('style');hide.textContent='#toolOpenTab{display:none!important}';head.appendChild(hide);

    var html='<!doctype html>\n'+doc.documentElement.outerHTML;
    var blob=new Blob([html],{type:'text/html;charset=utf-8'});
    return {blob:blob,name:'kanrinext-local_'+stamp(new Date())+'.html',files:count,missing:C.missing.slice(),size:blob.size};
  }

  /* 書き出し済み版では自分自身を書き出せないので、状態だけ公開する */
  if(!window.KN_STANDALONE)window.KNStandalone={isStandalone:false,build:build};
})();
