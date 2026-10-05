// Real model inference. npm install playwright; TEST_CHROMIUM_PATH optional.
// TEST_PIPER_ASSETS_DIR may supply model.onnx, config.json, phonemizer.wasm,
// runtime.wasm copied from the exact pinned upstream artifacts (not mock audio).
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'..');
const HF='https://huggingface.co/ayousanz/piper-plus-tsukuyomi-chan/resolve/36b59c825c36bd386b8960cf3f604382f52f2a87/';
const FILES=new Map([[HF+'tsukuyomi-chan-6lang-fp16.onnx','model.onnx'],[HF+'config.json','config.json'],
  ['https://unpkg.com/piper-plus@0.7.0/dist/rust-wasm/piper_plus_wasm_bg.wasm','phonemizer.wasm'],
  ['https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/ort-wasm-simd-threaded.wasm','runtime.wasm']]);
const MIME={'.html':'text/html','.js':'application/javascript','.mjs':'application/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp'};
(async()=>{
  const server=http.createServer((req,res)=>{
    const url=new URL(req.url,'http://localhost');
    const file=path.resolve(ROOT,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
    if(!file.startsWith(ROOT+path.sep)){res.writeHead(403).end();return;}
    try{res.setHeader('Content-Type',MIME[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}
    catch(_){res.writeHead(404).end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({executablePath:process.env.TEST_CHROMIUM_PATH||undefined,headless:true,
    args:['--no-sandbox','--disable-dev-shm-usage'],
    proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY,bypass:'127.0.0.1,localhost'}:undefined});
  try{
    const context=await browser.newContext({ignoreHTTPSErrors:true}),errors=[],downloads=[];
    // Only requested TTS artifacts may leave this isolated test. Suppress maps,
    // weather, external fonts and AI endpoints, including redirect chains.
    await context.route('**/*',route=>{
      let first=route.request();while(first.redirectedFrom())first=first.redirectedFrom();
      const url=route.request().url();
      if(FILES.has(url)){downloads.push(url);if(process.env.TEST_PIPER_ASSETS_DIR)
        return route.fulfill({path:path.join(process.env.TEST_PIPER_ASSETS_DIR,FILES.get(url)),
          headers:{'access-control-allow-origin':'*'},contentType:url.endsWith('.json')?'application/json':'application/octet-stream'});}
      return first.url().startsWith(base+'/')||FILES.has(first.url())?route.continue():route.abort();
    });
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base);await page.waitForFunction(()=>window.KoujiAI);
    assert.ok((await page.locator('body').innerText()).includes('工事管理next'));
    await page.evaluate(()=>{
      window.__piperPCM=[];
      const copy=AudioBuffer.prototype.copyToChannel;
      AudioBuffer.prototype.copyToChannel=function(a,...rest){
        __piperPCM.push({length:a.length,rate:this.sampleRate,finite:a.every(Number.isFinite),rms:Math.sqrt(a.reduce((s,x)=>s+x*x,0)/a.length)});
        return copy.call(this,a,...rest);
      };
      KoujiAI.settings();
    });
    await page.check('input[name="aiVoiceMode"][value="piper"]');
    assert.equal(await page.locator('#aiPiperBox').isVisible(),true);
    assert.equal(await page.locator('#aiTtsBox').isVisible(),false);
    await page.click('#aiPiperDownload');
    await page.waitForFunction(()=>/取得完了|✘/.test(document.querySelector('#aiPiperResult').textContent),null,{timeout:180000});
    assert.match(await page.locator('#aiPiperResult').innerText(),/取得完了/);
    await page.click('#aiPiperSample');
    await page.waitForFunction(()=>/再生しました|✘/.test(document.querySelector('#aiPiperResult').textContent),null,{timeout:120000});
    assert.match(await page.locator('#aiPiperResult').innerText(),/再生しました/);
    const pcm=await page.evaluate(()=>__piperPCM[0]);
    assert.ok(pcm.finite&&pcm.length>22050&&pcm.rate===22050&&pcm.rms>0.001);
    await page.click('#aiSave');
    assert.equal(await page.evaluate(()=>KoujiTTS.mode()),'piper');
    assert.equal(downloads.length,4);
    await page.evaluate(()=>{window.__cancelled=[];KoujiAIVoice.tts.speak('stop-test','停止の確認です。'.repeat(20),{
      onStart:()=>__cancelled.push('start'),onEnd:()=>__cancelled.push('end')});});
    await page.waitForTimeout(30);await page.evaluate(()=>KoujiAIVoice.tts.stop());
    await page.waitForTimeout(200);
    assert.deepEqual(await page.evaluate(()=>({key:KoujiAIVoice.tts.speakingKey,events:__cancelled})),{key:null,events:[]});
    await page.evaluate(()=>navigator.serviceWorker.ready);
    await page.waitForFunction(()=>navigator.serviceWorker.controller);
    await page.waitForFunction(async()=>!!await caches.match('./workers/piper-tts-worker.mjs'));
    await context.setOffline(true);await page.reload();await page.waitForFunction(()=>window.KoujiAI);
    await page.evaluate(()=>KoujiAI.settings());
    assert.equal(await page.locator('input[name="aiVoiceMode"][value="piper"]').isChecked(),true);
    await page.click('#aiPiperSample');
    await page.waitForFunction(()=>/再生しました|✘/.test(document.querySelector('#aiPiperResult').textContent),null,{timeout:120000});
    assert.match(await page.locator('#aiPiperResult').innerText(),/再生しました/);
    assert.equal(downloads.length,4,'offline restart must not download again');
    await page.setViewportSize({width:390,height:844});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert.ok(await page.locator('#aiPiperStop').isVisible());
    await page.click('#aiPiperDelete');await page.waitForFunction(()=>!KoujiPiper.installed());
    assert.equal(await page.evaluate(async()=> (await caches.keys()).includes('kouji-piper-assets-v1')),false);
    assert.deepEqual(errors,[]);
    console.log('PASS: settings/download, real Japanese PCM '+JSON.stringify(pcm)+', save, cancel inference, offline reload/synthesis, mobile width, delete; no JS errors or AI requests.');
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
