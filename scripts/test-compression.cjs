// Real browser codecs, OOXML/PDF files and single-thread FFmpeg WASM.
// Public engine downloads are intercepted with test fixtures; no user files leave localhost.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),fixtures=process.env.COMPRESSION_FIXTURES||'/tmp/compression-test';
(async()=>{
  const server=http.createServer((req,res)=>{
    const pathname=new URL(req.url,'http://localhost').pathname;
    const file=pathname.startsWith('/fixtures/')?path.join(fixtures,path.basename(pathname)):path.resolve(root,'.'+pathname.replace(/^\/$/,'/index.html'));
    if(!file.startsWith(root+'/')&&!file.startsWith(fixtures+'/'))return res.writeHead(403).end();
    try{const ext=path.extname(file);res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.mp4':'video/mp4','.wasm':'application/wasm'})[ext]||'application/octet-stream');res.end(fs.readFileSync(file))}catch(_){res.writeHead(404).end()}
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({executablePath:process.env.TEST_CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  try{
    const ctx=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true});
    await ctx.route('**/*',async r=>{
      const u=r.request().url();
      if(u.startsWith(base+'/'))return r.continue();
      if(u==='https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.js'||u==='https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.wasm')return r.fulfill({status:200,contentType:u.endsWith('.wasm')?'application/wasm':'text/javascript',headers:{'Access-Control-Allow-Origin':'*'},body:fs.readFileSync(path.join(fixtures,path.basename(u)))});
      return r.abort();
    });
    const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'/tools/file-compressor.html');await page.waitForFunction(()=>!!window.KoujiCompression&&!!window.PDFLib&&!!window.JSZip);
    const result=await page.evaluate(async()=>{
      const get=async(n,type)=>new File([await (await fetch('/fixtures/'+n)).arrayBuffer()],n,{type});
      const record=async(f,options={})=>{const r=await KoujiCompression.compress(f,options);return {name:r.name,changed:r.changed,size:r.blob.size,source:f.size,note:r.note,bytes:Array.from(new Uint8Array(await r.blob.arrayBuffer()))}};
      const photo=await get('photo.jpg','image/jpeg'),png=await get('transparent.png','image/png');
      const image=await record(photo),transparent=await record(png);
      const doc=await PDFLib.PDFDocument.create(),im=await doc.embedJpg(await photo.arrayBuffer()),p=doc.addPage([640,600]);p.drawImage(im,{x:0,y:0,width:640,height:480});p.drawText('Voltage 200 V / Circuit A',{x:30,y:540,size:18});
      const field=doc.getForm().createTextField('site');field.setText('ABC123');field.addToPage(p,{x:30,y:490,width:200,height:25});
      const source=await doc.save({useObjectStreams:false});window.__pdf=new File([source],'drawing.pdf',{type:'application/pdf'});
      const pdf=await record(__pdf);
      const excel=await record(await get('fixture.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'));
      const zip=await JSZip.loadAsync(await (await fetch('/fixtures/fixture.xlsx')).arrayBuffer());
      zip.file('xl/vbaProject.bin',new Uint8Array([1,2,3,4,5]));
      const macro=await record(new File([await zip.generateAsync({type:'blob',compression:'STORE'})],'macro.xlsm'));
      const lossless=await record(photo,{mode:'lossless'});
      if(lossless.changed){const z=await JSZip.loadAsync(new Uint8Array(lossless.bytes));const restored=await z.file('photo.jpg').async('uint8array');const original=new Uint8Array(await photo.arrayBuffer());if(restored.length!==photo.size||restored.some((v,i)=>v!==original[i]))throw Error('lossless archive mismatch')}
      const signedPDF=await record(new File([source,'\n% /ByteRange [0 10 20 30]'],'signed.pdf'));
      zip.file('_xmlsignatures/sig1.xml','signature');const signedExcel=await record(new File([await zip.generateAsync({type:'blob'})],'signed.xlsx'));
      const cancelled=new AbortController();cancelled.abort();let cancel='';try{await KoujiCompression.compress(photo,{signal:cancelled.signal})}catch(e){cancel=e.name}
      const unsupported=await record(new File(['legacy'],'legacy.xls'));
      return {image,transparent,pdf,excel,macro,lossless,signedPDF,signedExcel,unsupported,cancel};
    });
    for(const kind of ['image','transparent','pdf','excel','macro']){assert.equal(result[kind].changed,true,kind+' should shrink');assert.ok(result[kind].size<result[kind].source);fs.writeFileSync(path.join(fixtures,result[kind].name),Buffer.from(result[kind].bytes));}
    assert.equal(result.signedPDF.changed,false);assert.equal(result.signedExcel.changed,false);assert.equal(result.unsupported.changed,false);assert.equal(result.cancel,'AbortError');
    const source=await page.evaluate(async()=>Array.from(new Uint8Array(await __pdf.arrayBuffer())));fs.writeFileSync(path.join(fixtures,'source.pdf'),Buffer.from(source));
    const video=await page.evaluate(async()=>{const f=new File([await (await fetch('/fixtures/video.mp4')).arrayBuffer()],'video.mp4',{type:'video/mp4'});const r=await KoujiCompression.compress(f);return {changed:r.changed,name:r.name,note:r.note,source:f.size,size:r.blob.size,bytes:Array.from(new Uint8Array(await r.blob.arrayBuffer()))}});
    assert.equal(video.changed,true,video.note);fs.writeFileSync(path.join(fixtures,video.name),Buffer.from(video.bytes));
    const videoAbort=await page.evaluate(async()=>{const ctrl=new AbortController();const file=new File([await(await fetch('/fixtures/video.mp4')).arrayBuffer()],'cancel.mp4',{type:'video/mp4'});const timer=setTimeout(()=>ctrl.abort(),50);try{await KoujiCompression.compress(file,{signal:ctrl.signal});return 'not cancelled'}catch(e){return e.name}finally{clearTimeout(timer)}});
    assert.equal(videoAbort,'AbortError');
    // Test the actual upload/batch UI and download, including ZIP output.
    await page.locator('#files').setInputFiles([path.join(fixtures,'photo.jpg'),path.join(fixtures,'transparent.png')]);
    await page.click('#start');await page.waitForFunction(()=>!document.querySelector('#zip').disabled);
    assert.equal(await page.locator('.downloads').count(),2);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.selectOption('#target','5');
    const dl=page.waitForEvent('download');await page.click('#zip');await (await dl).saveAs(path.join(fixtures,'batch.zip'));
    await page.screenshot({path:path.join(fixtures,'mobile.png'),fullPage:true});
    await page.click('#clear');assert.equal(await page.locator('.file').count(),0);
    await page.goto(base+'/#tool/compress');
    await page.waitForFunction(()=>document.querySelector('#toolNav [href="#tool/compress"]'));
    const frame=page.frameLocator('#toolFrame');
    await frame.locator('h1').waitFor();
    assert.equal(await frame.locator('h1').innerText(),'ファイルを、軽く。');
    assert.equal(await frame.locator('.back').isVisible(),false);
    assert.equal(await frame.locator('html').getAttribute('data-theme'),'dark');
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({image:[result.image.source,result.image.size],png:[result.transparent.source,result.transparent.size],pdf:[result.pdf.source,result.pdf.size],excel:[result.excel.source,result.excel.size],video:[video.source,video.size],checks:'real compression, signed originals, macro bytes, cancel, mobile, batch ZIP'},null,2));
  }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
