// 単一HTML書き出し（assets/js/standalone-export.js）の結合テスト。
// 1) 公開ページ相当（HTTP）で書き出しを実行  2) 書き出したHTMLを、ネット遮断の file:// で開いて動作確認。
// 実行: NODE_PATH=<playwrightのあるnode_modules> TEST_CHROMIUM_PATH=/path/to/chromium node scripts/test-standalone.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'..');
const TYPES={'.html':'text/html','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png'};

/* 1ページだけのPDFを手で組む（外部ライブラリ不要）。pdf.js が読み込んで文字と図形を描画できるかを見る */
function makePdf(){
  const objs=[
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    null,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  ];
  const stream='BT /F1 24 Tf 40 240 Td (Standalone OK) Tj ET\n0 0.4 0.9 rg 40 60 200 100 re f';
  objs[3]=`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  let out='%PDF-1.4\n';const off=[];
  objs.forEach((o,i)=>{off.push(out.length);out+=`${i+1} 0 obj\n${o}\nendobj\n`});
  const x=out.length;
  out+=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`+off.map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF\n`;
  return Buffer.from(out,'latin1');
}

(async()=>{
  const server=http.createServer((req,res)=>{
    const file=path.resolve(ROOT,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/$/,'/index.html'));
    if(!file.startsWith(ROOT+path.sep)){res.writeHead(403).end();return}
    try{res.setHeader('Content-Type',TYPES[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}catch(_){res.writeHead(404).end()}
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({executablePath:process.env.TEST_CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'kn-standalone-'));
  try{
    /* ---- 1) 書き出し ---- */
    const ctxA=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});
    await ctxA.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
    const a=await ctxA.newPage();
    await a.goto(base+'/index.html');await a.waitForSelector('#view-home.on');
    await a.click('#settingsBtn');await a.click('[data-tab=data]');
    assert.ok(await a.$('#stOut'),'設定のバックアップに「単一HTMLを保存する」ボタンがある');
    const [dl]=await Promise.all([a.waitForEvent('download'),a.click('#stOut')]);
    const out=path.join(tmp,'standalone.html');await dl.saveAs(out);
    assert.match(dl.suggestedFilename(),/^kanrinext-local_\d{4}-\d{2}-\d{2}\.html$/);
    await a.waitForFunction(()=>/保存しました/.test(document.getElementById('stMsg').innerText));
    const msg=await a.textContent('#stMsg');
    assert.ok(!/取得できなかった/.test(msg),'取得できなかったファイルがない: '+msg);
    const size=fs.statSync(out).size;
    assert.ok(size>3e6&&size<30e6,'サイズが想定範囲（3〜30MB）: '+size);
    const html=fs.readFileSync(out,'utf8');
    assert.ok(!/<link[^>]+rel="manifest"/.test(html),'manifestを外している');
    assert.ok(!/<script[^>]+\ssrc="\.\/assets\//.test(html.replace(/<script data-kn="runtime">[\s\S]*?<\/script>/,'')),'本体のscript srcは全て埋め込み済み');
    await ctxA.close();

    /* ---- 2) ネット遮断の file:// で開く ---- */
    const ctx=await browser.newContext({viewport:{width:1280,height:800},offline:true});
    const p=await ctx.newPage();const errors=[];
    p.on('pageerror',e=>errors.push(e.message));
    await p.goto('file://'+out);await p.waitForSelector('#view-home.on',{timeout:20000});
    assert.equal(await p.evaluate(()=>window.KN_STANDALONE===true&&KNStandalone.isStandalone),true);
    assert.equal(await p.evaluate(()=>navigator.serviceWorker?navigator.serviceWorker.controller:null),null,'file:// ではService Workerを使わない');

    /* 画像: 外部（地図タイル）以外は全て表示できている */
    await p.waitForTimeout(800);
    const bad=await p.evaluate(()=>[...document.images].filter(i=>!/^https?:/.test(i.currentSrc||i.src)&&!i.naturalWidth).map(i=>(i.getAttribute('src')||'').slice(0,80)));
    assert.deepEqual(bad,[],'同梱画像が表示できる');
    assert.ok(await p.evaluate(()=>document.querySelectorAll('#homeAiAv img').length>0&&document.querySelector('#homeAiAv img').naturalWidth>0),'AIアバター');

    /* 予定・タスクがファイル内のブラウザ保存で動く */
    await p.fill('#taskQuickInput','単一HTML検証 明日 10:00');await p.press('#taskQuickInput','Enter');
    await p.reload();await p.waitForSelector('#view-home.on');await p.waitForTimeout(400);
    assert.ok((await p.textContent('#taskList')).includes('単一HTML検証'),'タスクが保存・復元される');

    /* 設定: ローカル版では案内表示（書き出しボタンは出さない） */
    await p.click('#settingsBtn');await p.click('[data-tab=data]');
    assert.ok((await p.textContent('.setSec.on')).includes('ローカル用の単一HTML版'));
    assert.equal(await p.$('#stOut'),null);
    await p.evaluate(()=>closeModal());

    /* 本体側 pdf.js: 同梱ライブラリとworkerで PDF を読み、文字と図形が描画される */
    const pdfB64=makePdf().toString('base64');
    const r=await p.evaluate(async b64=>{
      await new Promise((res,rej)=>{const s=document.createElement('script');s.src='./tools/lib/pdf.min.js';s.onload=res;s.onerror=()=>rej(new Error('pdf.js'));document.head.appendChild(s)});
      pdfjsLib.GlobalWorkerOptions.workerSrc=new URL('./tools/lib/pdf.worker.min.js',document.baseURI).href;
      const doc=await pdfjsLib.getDocument({data:Uint8Array.from(atob(b64),c=>c.charCodeAt(0))}).promise,pg=await doc.getPage(1),vp=pg.getViewport({scale:1}),cv=document.createElement('canvas');
      cv.width=vp.width;cv.height=vp.height;await pg.render({canvasContext:cv.getContext('2d'),viewport:vp}).promise;
      const px=cv.getContext('2d').getImageData(100,180,1,1).data,tc=await pg.getTextContent();
      return {text:tc.items.map(i=>i.str).join(' '),blue:px[2]>150&&px[0]<80,worker:pdfjsLib.GlobalWorkerOptions.workerSrc.slice(0,5)};
    },pdfB64);
    assert.match(r.text,/Standalone OK/);assert.ok(r.blue,'PDFの図形が描画される');assert.equal(r.worker,'blob:','workerは埋め込みから起動');

    /* 全ツール: 描画でき、エラーが出ず、?embed=1 が渡り、必要なライブラリが入っている */
    const need={pdf:['pdfjsLib','PDFLib'],excel:['JSZip'],takeoff:['pdfjsLib','jspdf'],cableRoute:['pdfjsLib'],compress:['JSZip','PDFLib'],docs:['JSZip']};
    const ids=await p.evaluate(()=>TOOLS.map(t=>t.id));
    assert.ok(ids.length>=9,'ツール一覧');
    for(const id of ids){
      const before=errors.length;
      await p.evaluate(i=>{location.hash='#tool/'+i},id);await p.waitForTimeout(1200);
      const info=await p.evaluate(libs=>{const f=document.getElementById('toolFrame'),w=f.contentWindow,d=f.contentDocument;return {qs:w.__KN_QS,len:d.body?d.body.innerText.length:0,libs:libs.map(n=>typeof w[n]!=='undefined')}},need[id]||[]);
      assert.ok(info.len>20,id+' が描画される');assert.match(info.qs,/embed=1/,id+' に ?embed=1 が渡る');
      assert.ok(info.libs.every(Boolean),id+' の同梱ライブラリ '+need[id]);
      assert.deepEqual(errors.slice(before),[],id+' でスクリプトエラーがない');
    }

    /* PDF整理: ネットなし（CDNなし）で、同梱pdf-libとpdf.jsでPDFを読み込める。
       ファイルはiframe内で作ってドロップする（Playwrightのsetinputfilesで渡すとFileが別realm扱いになり、pdf-libの instanceof 判定が通らないため。実際のファイル選択では起きない） */
    await p.evaluate(()=>{location.hash='#tool/pdf'});
    const fr=p.frames().find(f=>f!==p.mainFrame());
    await fr.waitForFunction(()=>window.pdfjsLib&&window.PDFLib&&document.getElementById('board'),null,{timeout:20000});
    await p.waitForTimeout(500);
    await fr.evaluate(async b64=>{
      const dt=new DataTransfer();dt.items.add(new File([Uint8Array.from(atob(b64),c=>c.charCodeAt(0))],'drop.pdf',{type:'application/pdf'}));
      document.getElementById('board').dispatchEvent(new DragEvent('drop',{dataTransfer:dt,bubbles:true,cancelable:true}));
    },pdfB64);
    await fr.waitForFunction(()=>document.querySelectorAll('#grid .card').length>=1,null,{timeout:20000});
    assert.equal(await fr.evaluate(()=>document.querySelectorAll('#grid .card').length),1,'PDF整理にページが並ぶ');

    /* 電気技術データベースは同梱データで検索できる */
    await p.evaluate(()=>{location.hash='#tool/knowledge'});await p.waitForTimeout(1200);
    const kf=p.frames().find(f=>f!==p.mainFrame());await kf.fill('#query','接地');await p.waitForTimeout(600);
    assert.match(await kf.textContent('#count'),/^[1-9]\d* \//,'電気技術DBの検索');

    assert.deepEqual(errors,[],'ページ全体でスクリプトエラーがない');
    console.log('standalone export: ok ('+(size/1048576).toFixed(1)+'MB, tools='+ids.length+')');
  }finally{
    await browser.close();server.close();fs.rmSync(tmp,{recursive:true,force:true});
  }
})().catch(e=>{console.error(e);process.exit(1)});
