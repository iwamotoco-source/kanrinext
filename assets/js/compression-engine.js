/* Browser-only compression. Originals are never overwritten or uploaded. */
(function(){'use strict';
  const MB=1024*1024,profiles={high:{q:.95,crf:18},balanced:{q:.90,crf:22},small:{q:.82,crf:26}};
  const extension=n=>String(n).split('.').pop().toLowerCase();
  const base=n=>n.replace(/\.[^.]+$/,'');
  const check=s=>{if(s?.aborted)throw new DOMException('停止しました','AbortError')};
  const tick=()=>new Promise(r=>setTimeout(r,0));
  function contains(bytes,text){const needle=new TextEncoder().encode(text);outer:for(let i=0;i<=bytes.length-needle.length;i++){for(let j=0;j<needle.length;j++)if(bytes[i+j]!==needle[j])continue outer;return true}return false}
  const unchanged=(f,note)=>({blob:f,name:f.name,changed:false,note});
  const crcTable=Uint32Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0});
  function crc32(b){let n=0xffffffff;for(const v of b)n=crcTable[(n^v)&255]^(n>>>8);return(n^0xffffffff)>>>0}
  function pngChunk(type,data){const out=new Uint8Array(data.length+12),v=new DataView(out.buffer);v.setUint32(0,data.length);out.set(new TextEncoder().encode(type),4);out.set(data,8);v.setUint32(out.length-4,crc32(out.subarray(4,out.length-4)));return out}
  function png(bytes){
    if(bytes.length<33||bytes[0]!==137||bytes[1]!==80||bytes[2]!==78||bytes[3]!==71)throw new Error('PNGを読み取れません');
    const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),chunks=[],idats=[];let offset=8,idatAt=-1;
    const width=view.getUint32(16),height=view.getUint32(20);if(!width||!height||width*height>24e6)throw new Error('PNGの画素数が上限を超えています');
    while(offset+12<=bytes.length){const length=view.getUint32(offset);if(offset+length+12>bytes.length)throw new Error('PNGの内部データが不完全です');
      const type=String.fromCharCode(...bytes.subarray(offset+4,offset+8)),chunk=bytes.subarray(offset,offset+length+12);
      if(crc32(chunk.subarray(4,chunk.length-4))!==view.getUint32(offset+length+8))throw new Error('PNGの検査値が一致しません');
      if(type==='acTL')throw new Error('アニメーションPNGは変更しません');
      if(type==='IDAT'){if(idatAt<0)idatAt=chunks.length;idats.push(bytes.subarray(offset+8,offset+8+length));}else chunks.push(chunk);
      offset+=length+12;if(type==='IEND')break;
    }
    if(idatAt<0)throw new Error('PNGに画像データがありません');
    const input=new Uint8Array(idats.reduce((n,b)=>n+b.length,0));let at=0;for(const b of idats){input.set(b,at);at+=b.length}
    const inflater=new pako.Inflate({chunkSize:65536}),parts=[];let size=0;
    inflater.onData=b=>{size+=b.length;if(size>100*MB)throw new Error('PNGの展開データが大きすぎます');parts.push(b)};inflater.push(input,true);
    if(inflater.err)throw new Error('PNGの圧縮データを読み取れません');
    const raw=new Uint8Array(size);at=0;for(const b of parts){raw.set(b,at);at+=b.length}
    chunks.splice(idatAt,0,pngChunk('IDAT',pako.deflate(raw,{level:9})));
    return new Blob([bytes.subarray(0,8),...chunks],{type:'image/png'});
  }
  function choose(f,blob,name,note){return blob.size<f.size?{blob,name,changed:true,note}:unchanged(f,'これ以上小さくならないため、元ファイルを採用しました。'+(note?' '+note:''))}
  async function archive(file,opt){
    check(opt.signal);const zip=new JSZip();zip.file(file.name,await file.arrayBuffer(),{date:new Date(file.lastModified||Date.now())});
    const b=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:9}},m=>{check(opt.signal);opt.progress?.(m.percent/100,'内容を変更せずZIP圧縮しています')});
    return choose(file,b,file.name+'.zip','元ファイルをそのままZIPに包みました。展開して使用してください。');
  }
  async function bitmap(blob){
    const url=URL.createObjectURL(blob),img=new Image();
    try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('画像を読み取れません'));img.src=url});return img}finally{URL.revokeObjectURL(url)}
  }
  async function raster(blob,type,q,signal){
    check(signal);const img=await bitmap(blob);check(signal);
    const w=img.naturalWidth,h=img.naturalHeight;
    if(!w||!h||w*h>24e6)throw new Error('2400万画素を超える画像は、メモリ保護のため元ファイルを残します');
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    try{canvas.getContext('2d').drawImage(img,0,0);const out=await new Promise(r=>canvas.toBlob(r,type,q));check(signal);if(!out||out.type!==type)throw new Error('このブラウザでは画像形式を保存できません');return out}finally{canvas.width=canvas.height=1;img.src=''}
  }
  async function image(file,opt){
    const ext=extension(file.name);
    if(opt.mode==='lossless')return archive(file,opt);
    if(!['jpg','jpeg','png','webp'].includes(ext))return unchanged(file,'この画像形式は変更せず保持します（アニメーション・ベクターを保護）。');
    const prefix=new Uint8Array(await file.slice(0,1024*1024).arrayBuffer());
    if((ext==='png'&&contains(prefix,'acTL'))||(ext==='webp'&&contains(prefix,'ANIM')))return unchanged(file,'アニメーションを保持するため、元ファイルを採用しました。');
    const mime=ext==='png'?'image/png':ext==='webp'?'image/webp':'image/jpeg';
    const blob=ext==='png'?png(new Uint8Array(await file.arrayBuffer())):await raster(file,mime,profiles[opt.quality].q,opt.signal);
    return choose(file,blob,base(file.name)+'_compressed.'+ext,ext==='png'?'画素・透過・色の情報を保ち、PNGの圧縮データを詰め直しました。':'解像度を維持。再保存した画像の位置情報・撮影情報は除去しています。');
  }
  async function pdf(file,opt){
    const bytes=new Uint8Array(await file.arrayBuffer());check(opt.signal);
    if(contains(bytes,'/ByteRange'))return unchanged(file,'電子署名を保護するため、元ファイルを採用しました。');
    const L=PDFLib;let doc;try{doc=await L.PDFDocument.load(bytes,{updateMetadata:false})}catch(e){if(/encrypt/i.test(e.message))return unchanged(file,'パスワード付きPDFは変更せず保持します。');throw new Error('PDFを読み取れません。元ファイルを残します。')}check(opt.signal);
    let replaced=0;const objects=doc.context.enumerateIndirectObjects(),N=L.PDFName.of;
    if(opt.mode!=='lossless')for(let i=0;i<objects.length;i++){
      check(opt.signal);const [ref,obj]=objects[i];
      if(obj instanceof L.PDFRawStream&&obj.dict.get(N('Subtype'))===N('Image')&&obj.dict.get(N('Filter'))===N('DCTDecode')&&obj.dict.get(N('ColorSpace'))===N('DeviceRGB')&&obj.dict.get(N('BitsPerComponent'))?.asNumber?.()===8&&!['SMask','Mask','Decode','OC'].some(k=>obj.dict.has(N(k)))){
        try{const old=obj.getContents(),b=await raster(new Blob([old],{type:'image/jpeg'}),'image/jpeg',profiles[opt.quality].q,opt.signal);
          if(b.size<old.length){const im=await doc.embedJpg(await b.arrayBuffer());await im.embed();const replacement=doc.context.lookup(im.ref);doc.context.assign(ref,replacement);doc.context.delete(im.ref);replaced++;}
        }catch(e){if(e.name==='AbortError')throw e;/* Unsupported image: leave its stream unchanged. */}
      }
      opt.progress?.((i+1)/objects.length*.85,'PDFの文字・図形を残して画像を確認しています');if(i%20===0)await tick();
    }
    check(opt.signal);const blob=new Blob([await doc.save({useObjectStreams:true,addDefaultPage:false,updateFieldAppearances:false,objectsPerTick:30})],{type:'application/pdf'});
    return choose(file,blob,base(file.name)+'_compressed.pdf',`文字・図形・${doc.getPageCount()}ページを保持。JPEG画像${replaced}点を圧縮。`);
  }
  async function excel(file,opt){
    const loaded=await JSZip.loadAsync(await file.arrayBuffer());check(opt.signal);
    const entries=Object.values(loaded.files);
    if(!loaded.file('[Content_Types].xml')||!loaded.file('xl/workbook.xml'))throw new Error('Excelの内部構造を確認できません');
    if(entries.some(e=>/^_xmlsignatures\//i.test(e.name)||/vbaProjectSignature/i.test(e.name)))return unchanged(file,'電子署名を保護するため、元ファイルを採用しました。');
    const total=entries.reduce((n,e)=>n+(e._data?.uncompressedSize||0),0);
    if(entries.length>10000||total>200*MB)throw new Error('展開後のデータが大きいため、元ファイルを残します（上限200 MB）');
    const zip=new JSZip();zip.comment=loaded.comment;let replaced=0;
    for(let i=0;i<entries.length;i++){
      check(opt.signal);const e=entries[i];
      if(e.dir){zip.file(e.name,null,{dir:true,date:e.date});continue;}
      let bytes=await e.async('uint8array');check(opt.signal);
      if(opt.mode!=='lossless'&&/^xl\/media\/.+\.(jpe?g|png)$/i.test(e.name)){
        const ext=extension(e.name),type=ext==='png'?'image/png':'image/jpeg';
        try{if(!contains(bytes,'acTL')){const b=ext==='png'?png(bytes):await raster(new Blob([bytes],{type}),type,profiles[opt.quality].q,opt.signal);if(b.size<bytes.length){bytes=new Uint8Array(await b.arrayBuffer());replaced++;}}}catch(err){if(err.name==='AbortError')throw err;}
      }
      // Fresh entries force recompression; relationships/XML/VBA bytes remain identical.
      zip.file(e.name,bytes,{date:e.date,comment:e.comment,unixPermissions:e.unixPermissions,dosPermissions:e.dosPermissions,createFolders:false});
      opt.progress?.((i+1)/entries.length*.75,'Excelの数式・書式を残して処理しています');if(i%10===0)await tick();
    }
    const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:9},mimeType:file.type||'application/octet-stream'},m=>{check(opt.signal);opt.progress?.(.75+m.percent/400,'Excelを再圧縮しています')});
    return choose(file,blob,base(file.name)+'_compressed.'+extension(file.name),`数式・書式・シート・マクロの内部データを保持。画像${replaced}点を圧縮。`);
  }
  let ff=null,loading=null;const videoBlobs=[];
  async function asset(name,type,opt){
    const url='https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/'+name;
    let cache=null,r=null;try{cache=await caches.open('kouji-compress-video-v1');r=await cache.match(url)}catch(_){}
    if(!r){r=await fetch(url,{signal:opt.signal});if(!r.ok)throw new Error('動画エンジンを取得できません。オンラインで再試行してください');try{await cache?.put(url,r.clone())}catch(_){}}
    check(opt.signal);const b=await r.blob();check(opt.signal);const blobURL=URL.createObjectURL(new Blob([b],{type}));videoBlobs.push(blobURL);return blobURL;
  }
  function resetVideo(){try{ff?.terminate()}catch(_){}ff=null;loading=null;videoBlobs.splice(0).forEach(u=>URL.revokeObjectURL(u));}
  async function loadVideo(opt){
    if(ff?.loaded)return ff;if(loading)return loading;
    loading=(async()=>{
      opt.progress?.(.02,'動画エンジンを準備しています（初回 約31 MB）');
      if(!window.FFmpegWASM)await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='../assets/vendor/compression/ffmpeg.js';s.onload=resolve;s.onerror=()=>reject(new Error('動画エンジンを読み込めません'));document.head.append(s)});
      check(opt.signal);ff=new FFmpegWASM.FFmpeg();
      const coreURL=await asset('ffmpeg-core.js','text/javascript',opt),wasmURL=await asset('ffmpeg-core.wasm','application/wasm',opt);
      await ff.load({coreURL,wasmURL});check(opt.signal);return ff;
    })();try{return await loading}catch(e){resetVideo();throw e}finally{loading=null}
  }
  async function video(file,opt){
    if(opt.mode==='lossless')return archive(file,opt);
    const ext=extension(file.name);if(!['mp4','mov','m4v'].includes(ext))return unchanged(file,'現在の動画圧縮はMP4・MOV・M4Vに対応しています。この形式は元ファイルを保持します。');
    const onAbort=()=>resetVideo();opt.signal?.addEventListener('abort',onAbort,{once:true});let engine,input='input.'+ext,output='output.'+(ext==='mov'?'mov':'mp4');
    try{
      engine=await loadVideo(opt);check(opt.signal);await engine.writeFile(input,new Uint8Array(await file.arrayBuffer()));check(opt.signal);
      let logs='';const onLog=e=>{logs=(logs+'\n'+e.message).slice(-20000)};
      engine.on('log',onLog);try{await engine.exec(['-hide_banner','-i',input])}finally{engine.off('log',onLog)}check(opt.signal);
      if(/bt2020|smpte2084|arib-std-b67/i.test(logs))return unchanged(file,'HDR動画は色と明るさを保護するため、元ファイルを採用しました。');
      const onProgress=e=>opt.progress?.(.12+Math.max(0,Math.min(.85,e.progress*.85)),'動画を圧縮しています。画面を開いたままお待ちください');
      engine.on('progress',onProgress);let code;
      try{code=await engine.exec(['-hide_banner','-y','-i',input,'-map','0','-map_metadata','0','-c','copy','-c:v:0','libx264','-preset','veryfast','-crf',String(profiles[opt.quality].crf),'-pix_fmt','yuv420p','-movflags','+faststart',output],600000)}finally{engine.off('progress',onProgress)}
      check(opt.signal);if(code!==0)throw new Error('動画の形式に対応できないか、処理時間の上限に達しました。元ファイルを残します。');
      const bytes=await engine.readFile(output);return choose(file,new Blob([bytes],{type:ext==='mov'?'video/quicktime':'video/mp4'}),base(file.name)+'_compressed.'+(ext==='mov'?'mov':'mp4'),'映像は再圧縮（多少の劣化あり）。解像度を維持し、音声・その他のトラックをコピー。');
    }catch(e){check(opt.signal);throw e}finally{
      opt.signal?.removeEventListener('abort',onAbort);
      if(engine?.loaded){try{await engine.deleteFile(input)}catch(_){}try{await engine.deleteFile(output)}catch(_){}}
      resetVideo(); // Release WASM memory after each file, especially on iPhone.
    }
  }
  async function compress(file,options={}){
    const opt={mode:'visual',quality:'high',...options};if(!profiles[opt.quality])opt.quality='high';check(opt.signal);
    const ext=extension(file.name),isVideo=file.type.startsWith('video/')||['mp4','mov','m4v','webm','mkv','avi'].includes(ext);
    const limit=isVideo?100*MB:50*MB;if(file.size>limit)return unchanged(file,`この形式の上限${limit/MB} MBを超えるため、元ファイルを残します。`);
    let result;
    if(isVideo)result=await video(file,opt);
    else if(file.type.startsWith('image/')||['jpg','jpeg','png','webp','gif','svg','heic','heif'].includes(ext))result=await image(file,opt);
    else if(ext==='pdf')result=await pdf(file,opt);
    else if(['xlsx','xlsm'].includes(ext))result=await excel(file,opt);
    else if(opt.mode==='lossless')result=await archive(file,opt);
    else result=unchanged(file,ext==='xls'?'旧形式XLSは変更せず保持します。XLSXに変換すると圧縮できます。':'この形式は変更せず保持します。');
    check(opt.signal);opt.progress?.(1,'完了');return result;
  }
  window.KoujiCompression={compress,resetVideo,extension};
})();
