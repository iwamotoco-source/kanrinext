// Conversation lifecycle integration. Recognition and TTS events are simulated;
// uses the real workspace, voice router and HTTP AI client. No external traffic.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'..'),requests=[];
(async()=>{
  const types={'.html':'text/html','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp'};
  const server=http.createServer((req,res)=>{
    if(req.url==='/api/ai'&&req.method==='POST'){
      let body='';req.on('data',c=>body+=c);req.on('end',()=>{requests.push(JSON.parse(body));setTimeout(()=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify({answer:'了解です。現場の状況を確認しましょう。',provider:'gemini'}));},80);});return;
    }
    const file=path.resolve(ROOT,'.'+new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html'));
    if(!file.startsWith(ROOT+path.sep)){res.writeHead(403).end();return;}
    try{res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch(_){res.writeHead(404).end();}
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({executablePath:process.env.TEST_CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  try{
    const context=await browser.newContext({viewport:{width:390,height:844}});
    await context.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
    await context.addInitScript(()=>{
      window.__recognizers=[];
      window.SpeechRecognition=class{
        constructor(){__recognizers.push(this);}
        start(){setTimeout(()=>this.onstart?.(),10);}
        stop(){this.finish(this.text||'');}
        abort(){this.onend?.();}
        finish(text){this.onresult?.({resultIndex:0,results:[Object.assign([{transcript:text}],{isFinal:true})]});this.onend?.();}
        fail(code){this.onerror?.({error:code});this.onend?.();}
      };
    });
    const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
    await p.goto(base);await p.waitForFunction(()=>window.KoujiAIWorkspace&&window.KoujiPiper);
    await p.evaluate(async base=>{
      KoujiAI._i.saveAiCfg({enabled:true,endpoint:base+'/api/ai',accessKey:'test-only',voiceMode:'piper',preferLocal:false,autoSpeak:false,sendSchedule:true,sendNotes:false,saveHistory:false});
      window.__spoken=[];KoujiPiper.installed=()=>true;KoujiPiper.unlock=()=>{};
      KoujiPiper.stop=()=>{window.__tts=null;};
      KoujiPiper.engine.speak=(text,cb)=>{__spoken.push(text);window.__tts=cb;cb.onGenerating?.(true);};
      await KoujiAIWorkspace.open();
    },base);
    const status=()=>p.locator('#aiConversationStatus').innerText();
    const final=text=>p.evaluate(text=>__recognizers.at(-1).finish(text),text);
    const finish=()=>p.evaluate(()=>{__tts.onStart?.();__tts.onEnd?.();});
    await p.evaluate(()=>{const w=state.settings.weather;saveJSON(WX_KEY,{at:Date.now(),placeKey:JSON.stringify([w.name,w.lat,w.lon]),data:{daily:{time:[todayISO()],weather_code:[61],temperature_2m_max:[24],temperature_2m_min:[18],precipitation_probability_max:[70]}}});});
    await p.click('#aiConversation');await p.click('#aiConversationTalk');
    await p.waitForFunction(()=>KoujiAIVoice.rec.active);
    assert.match(await status(),/聞き取り中/);
    await final('現場の準備について教えて');
    await p.waitForFunction(()=>!!window.__tts);assert.equal(requests.length,1);
    assert.equal(requests[0].context.weather.days[0].rainPercent,70);
    assert.equal(requests[0].context.weather.lat,undefined);
    await p.evaluate(()=>KoujiAI._i.saveAiCfg({sendSchedule:false}));
    assert.match(await status(),/音声を生成/);
    assert.equal(await p.evaluate(()=>KoujiAIVoice.rec.active),false);
    await p.evaluate(()=>__tts.onStart());assert.match(await status(),/読み上げ/);
    assert.equal(await p.locator('#aiConversationTalk').isDisabled(),true);
    await p.evaluate(()=>{__tts.onGenerating(true);__tts.onGenerating(false);});assert.match(await status(),/読み上げ/);
    await finish();assert.match(await status(),/話すボタン/);
    assert.equal(await p.evaluate(()=>__recognizers.length),1,'no automatic mic restart after speaker');
    assert.equal(await p.evaluate(()=>KoujiAI._i.aiCfg().autoSpeak),false);
    await p.click('#aiConversationTalk');await final('次に確認することは');await p.waitForFunction(()=>!!window.__tts);
    assert.equal(requests.length,2);assert.equal(requests[1].context.weather,undefined);await p.click('#aiConversationStop');
    assert.equal(await p.evaluate(()=>KoujiAIVoice.tts.speakingKey),null);
    await p.click('#aiConversationTalk');
    await p.click('#aiConversationStop');await final('停止後の遅れた認識結果');
    await p.waitForTimeout(150);assert.equal(requests.length,2,'cancelled recognition must never send');
    await p.click('#aiConversationTalk');await p.evaluate(()=>__recognizers.at(-1).fail('not-allowed'));
    assert.match(await status(),/マイクの使用/);assert.equal(requests.length,2);
    await p.click('#aiConversationTalk');await p.click('#aiClose');await final('閉じた後の発話');
    await p.evaluate(()=>KoujiAIWorkspace.open());assert.equal(await p.locator('#aiConversationBox').isVisible(),false);
    await p.click('#aiMic');await final('通常入力は送信しない');assert.equal(requests.length,2);
    assert.equal(await p.locator('#aiInput').inputValue(),'通常入力は送信しない');
    await p.evaluate(()=>{window.SpeechRecognition=null;window.webkitSpeechRecognition=null;});
    await p.click('#aiConversation');await p.click('#aiConversationTalk');assert.match(await status(),/キーボード/);
    await p.fill('#aiInput','キーボード音声入力の質問');await p.click('#aiSend');await p.waitForFunction(()=>!!window.__tts);
    assert.equal(requests.length,3);await finish();
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await p.click('#aiConversationExit');assert.equal(await p.locator('#aiConversationBox').isVisible(),false);
    assert.deepEqual(errors,[]);
    console.log('PASS: auto-send final recognition, real AI HTTP route, Piper router callbacks, next turn, mic muted during output, cancellation/late events, permission error, close, normal input, keyboard fallback, mobile width; saved autoSpeak unchanged.');
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
