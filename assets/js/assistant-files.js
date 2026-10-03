/* =========================================================
   assistant-files.js — AI Workspace の添付ファイル処理
   すべてブラウザ内で処理する（ファイルをサーバーへ保存しない）。
     画像  : 向き補正 → 縮小 → JPEG（ビジョン入力として送る）
     PDF   : pdf.js でページごとにテキスト抽出。図面/スキャン等で文字が少ないページはページ画像も送る
     Excel : .xlsx を自前で解析（シート名・セル位置・日付・結合・塗りつぶし）。.xls は未対応
     CSV   : UTF-8 / Shift_JIS 自動判定
     文書  : .docx / .txt / .md / .json
   AIへ送る内容は build() で初めて確定し、送信前確認ダイアログに describe() の結果を表示する。
   ========================================================= */
'use strict';
(function(){
  const LIM={
    maxFiles:10,fileBytes:30*1024*1024,
    imageMaxDim:1800,imageMaxBytes:1.5*1024*1024,
    imagesTotal:8,                       /* サーバー側 LIMITS.images と同じ */
    imageBytesTotal:3.0*1024*1024,       /* 画像+PDF原本の合計。サーバー側 3.2MB（base64化後も本文上限4.5MBに収まる）より少し手前 */
    pdfNativeBytes:2.0*1024*1024,        /* PDFを原本のままAIへ渡せる大きさ（サーバー側 2.6MB） */
    pdfTextPages:150,pdfTextChars:60000,pdfAutoImages:4,pdfThinChars:120,
    sheetRows:400,sheetCols:60,sheetChars:40000,sheetTotalChars:90000,
    textChars:80000
  };
  const TAG={image:'IMG',pdf:'PDF',sheet:'XLS',csv:'CSV',docx:'DOC',text:'TXT'};
  const ACCEPT_DOC='.pdf,.xlsx,.xlsm,.xls,.csv,.tsv,.docx,.txt,.md,.json,application/pdf';

  class FileError extends Error{constructor(msg,code){super(msg);this.code=code||'FILE'}}
  const uid=()=>'f'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  const fmtSize=n=>n<1024?n+' B':n<1048576?(n/1024).toFixed(0)+' KB':(n/1048576).toFixed(1)+' MB';
  const dataBytes=u=>Math.max(0,Math.floor((String(u).length-String(u).indexOf(',')-1)*3/4));

  function classify(file){
    const n=String(file.name||'').toLowerCase(),t=String(file.type||'').toLowerCase();
    if(t.startsWith('image/')||/\.(jpe?g|png|webp|gif|bmp|heic|heif)$/.test(n))return 'image';
    if(t==='application/pdf'||n.endsWith('.pdf'))return 'pdf';
    if(/\.(xlsx|xlsm)$/.test(n))return 'sheet';
    if(/\.(xls|xlsb)$/.test(n))return 'xls';
    if(/\.(csv|tsv)$/.test(n))return 'csv';
    if(n.endsWith('.docx'))return 'docx';
    if(/\.(txt|md|json|log)$/.test(n)||t.startsWith('text/'))return 'text';
    return 'unsupported';
  }

  /* ---------- ライブラリの遅延読込（同梱の tools/lib を使う。ネット不要） ---------- */
  const scripts={};
  function loadScript(src){
    if(!scripts[src])scripts[src]=new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>{delete scripts[src];rej(new FileError('ライブラリを読み込めませんでした（'+src+'）','LIB'))};document.head.appendChild(s)});
    return scripts[src];
  }
  async function getPdfjs(){
    if(!window.pdfjsLib)await loadScript('./tools/lib/pdf.min.js');
    if(pdfjsLib.GlobalWorkerOptions&&!pdfjsLib.GlobalWorkerOptions.workerSrc)pdfjsLib.GlobalWorkerOptions.workerSrc=new URL('./tools/lib/pdf.worker.min.js',document.baseURI).href;
    return pdfjsLib;
  }
  async function getJSZip(){if(!window.JSZip)await loadScript('./tools/lib/jszip.min.js');return window.JSZip}

  /* ---------- 画像 ---------- */
  async function loadBitmap(blob){
    if(window.createImageBitmap){
      try{return await createImageBitmap(blob,{imageOrientation:'from-image'})}catch(e){}
      try{return await createImageBitmap(blob)}catch(e){}
    }
    return new Promise((res,rej)=>{
      const u=URL.createObjectURL(blob),im=new Image();
      im.onload=()=>{res(im);setTimeout(()=>URL.revokeObjectURL(u),4000)};
      im.onerror=()=>{URL.revokeObjectURL(u);rej(new FileError('画像を読み込めませんでした（HEICなど非対応形式の可能性）','IMG'))};
      im.src=u;
    });
  }
  function drawJpeg(src,maxDim,q){
    const w0=src.width||src.naturalWidth,h0=src.height||src.naturalHeight;
    const k=Math.min(1,maxDim/Math.max(w0,h0)),w=Math.max(1,Math.round(w0*k)),h=Math.max(1,Math.round(h0*k));
    const c=document.createElement('canvas');c.width=w;c.height=h;
    const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,w,h);g.drawImage(src,0,0,w,h);
    return {data:c.toDataURL('image/jpeg',q),w,h};
  }
  function fitJpeg(src,maxDim=LIM.imageMaxDim){
    let best=null;
    for(const d of [maxDim,1500,1250,1000,800]){
      for(const q of [.82,.7,.58]){
        const r=drawJpeg(src,Math.min(d,maxDim),q);best=r;
        if(dataBytes(r.data)<=LIM.imageMaxBytes)return r;
      }
    }
    return best;
  }
  async function shrinkData(dataUrl,factor,q){
    const im=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new FileError('画像の再圧縮に失敗','IMG'));i.src=dataUrl});
    const c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.naturalWidth*factor));c.height=Math.max(1,Math.round(im.naturalHeight*factor));
    const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(im,0,0,c.width,c.height);
    return c.toDataURL('image/jpeg',q);
  }

  async function prepareImage(file){
    const bmp=await loadBitmap(file);
    const full=fitJpeg(bmp);
    const th=drawJpeg(bmp,110,.6);
    if(bmp.close)try{bmp.close()}catch(e){}
    const img={name:file.name,label:'',data:full.data,detail:'high'};
    return {
      kind:'image',summary:`${full.w}×${full.h}`,thumb:th.data,
      describe:()=>[`画像 1枚（${full.w}×${full.h}・約${fmtSize(dataBytes(full.data))}）をAIに送ります`],
      estimate:()=>({images:1,chars:0}),
      controls:[],
      build:async()=>({images:[Object.assign({},img)],texts:[]})
    };
  }

  /* ---------- PDF ---------- */
  function pageToText(tc){
    const rows=[];
    for(const it of tc.items){
      if(!it.str)continue;
      const y=it.transform[5],x=it.transform[4],tol=Math.max(2,(it.height||8)*.4);
      let row=rows.find(r=>Math.abs(r.y-y)<=tol);
      if(!row){row={y,items:[]};rows.push(row)}
      row.items.push({x,w:it.width||0,s:it.str});
    }
    rows.sort((a,b)=>b.y-a.y);
    return rows.map(r=>{
      r.items.sort((a,b)=>a.x-b.x);
      let out='',px=null;
      for(const i of r.items){if(px!==null){const gap=i.x-px;out+=gap>12?'\t':gap>1.5?' ':''}out+=i.s;px=i.x+i.w}
      return out.replace(/[ \t]+$/,'');
    }).filter(s=>s.trim()).join('\n');
  }
  function parsePages(str,max){
    const set=new Set();
    String(str||'').replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xFEE0)).split(/[,、\s]+/).forEach(tok=>{
      const m=/^(\d+)(?:[-~〜ー](\d+))?$/.exec(tok);if(!m)return;
      const a=+m[1],b=m[2]?+m[2]:a;for(let p=Math.min(a,b);p<=Math.max(a,b)&&p<=max;p++)if(p>=1)set.add(p);
    });
    return [...set].sort((a,b)=>a-b);
  }
  /* 既定: 選択中のAIが Gemini のときだけPDF原本を送る（OpenAI選択時は従来の抽出方式）。2MB超は常に抽出方式 */
  function defaultNative(file){
    try{const c=window.KoujiAI&&window.KoujiAI._i&&window.KoujiAI._i.aiCfg();return file.size<=LIM.pdfNativeBytes&&(!c||c.provider!=='openai')}catch(e){return false}
  }
  async function preparePdf(file){
    const lib=await getPdfjs();
    const buf=new Uint8Array(await file.arrayBuffer());
    let doc;
    try{doc=await lib.getDocument({data:buf.slice(0)}).promise}
    catch(e){throw new FileError(e&&e.name==='PasswordException'?'パスワード付きPDFは未対応です':'PDFを読み込めませんでした','PDF')}
    const n=doc.numPages,texts=[];let chars=0;
    for(let i=1;i<=Math.min(n,LIM.pdfTextPages);i++){
      const pg=await doc.getPage(i);
      let t='';try{t=pageToText(await pg.getTextContent())}catch(e){}
      texts.push(t);chars+=t.length;try{pg.cleanup()}catch(e){}
    }
    const att={
      kind:'pdf',summary:`${n}ページ`,file,options:{imagePages:'',forceImages:false,native:defaultNative(file)},
      controls:[
        ...(file.size<=LIM.pdfNativeBytes?[{type:'check',key:'native',label:'PDFを原本のままAIへ送る（図・表・手書きも読み取れる。Gemini推奨）。オフ＝文字抽出＋必要ページだけ画像'}]:[]),
        {type:'text',key:'imagePages',label:'画像として送るページ（例 1,3-5。空欄＝文字が少ないページを自動選択）',placeholder:'空欄＝自動'},
        {type:'check',key:'forceImages',label:'図面・スキャン対策：先頭から最大4ページを画像でも送る'}
      ]
    };
    const isNative=()=>!!att.options.native&&file.size<=LIM.pdfNativeBytes;
    att.plan=slots=>{
      const o=att.options,custom=parsePages(o.imagePages,n);
      let pages=[],reason='';
      if(custom.length){pages=custom;reason='指定ページ'}
      else if(o.forceImages){pages=Array.from({length:Math.min(n,LIM.pdfAutoImages)},(_,i)=>i+1);reason='先頭ページ'}
      else{
        const thin=[];texts.forEach((t,i)=>{if(t.trim().length<LIM.pdfThinChars)thin.push(i+1)});
        pages=thin.slice(0,LIM.pdfAutoImages);reason=pages.length?'文字がほぼ無いページ（図面・スキャン）':'';
      }
      const cap=custom.length?Math.min(slots,LIM.imagesTotal):Math.min(slots,LIM.pdfAutoImages);
      const over=pages.length>cap;
      return {pages:pages.slice(0,cap),reason,over};
    };
    att.describe=(slots=LIM.imagesTotal)=>{
      if(isNative())return [`PDF原本をそのまま送信（${n}ページ・${fmtSize(file.size)}）：図・表・手書きも読み取れます`,'文字抽出・ページ画像化は行いません'];
      const p=att.plan(slots),out=[];
      const used=Math.min(chars,LIM.pdfTextChars);
      out.push(chars>0?`テキスト抽出 ${Math.min(n,LIM.pdfTextPages)}ページ・${used.toLocaleString()}文字${chars>LIM.pdfTextChars?'（上限で省略）':''}`:'テキストは抽出できません（画像のみのPDF）');
      out.push(p.pages.length?`ページ画像 ${p.pages.length}枚（p.${p.pages.join(', p.')}｜${p.reason}）`:'ページ画像は送りません');
      if(p.over)out.push('画像の上限を超えるページは送りません');
      if(n>LIM.pdfTextPages)out.push(`${LIM.pdfTextPages}ページ目以降はテキスト抽出しません`);
      return out;
    };
    att.estimate=(slots=LIM.imagesTotal)=>isNative()?{images:0,chars:0,pdfs:1,bytes:file.size}:{images:att.plan(slots).pages.length,chars:Math.min(chars,LIM.pdfTextChars)};
    att.build=async(opts={})=>{
      if(isNative()){
        opts.onProgress&&opts.onProgress(`${file.name}: PDF原本を準備中…`);
        const data=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result||''));r.onerror=()=>rej(new FileError('PDFを読み込めませんでした','PDF'));r.readAsDataURL(file)});
        const b64=data.replace(/^data:[^,]*,/,'');
        return {images:[],texts:[],pdfs:[{name:file.name,label:`PDF ${n}ページ`,data:'data:application/pdf;base64,'+b64}]};
      }
      const p=att.plan(opts.slots??LIM.imagesTotal),images=[];
      for(let k=0;k<p.pages.length;k++){
        opts.onProgress&&opts.onProgress(`${file.name}: p.${p.pages[k]} を画像化中…`);
        const pg=await doc.getPage(p.pages[k]);
        const vp0=pg.getViewport({scale:1}),sc=Math.min(2.4,LIM.imageMaxDim/Math.max(vp0.width,vp0.height)),vp=pg.getViewport({scale:sc});
        const c=document.createElement('canvas');c.width=Math.round(vp.width);c.height=Math.round(vp.height);
        const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);
        await pg.render({canvasContext:g,viewport:vp}).promise;
        const r=fitJpeg(c);try{pg.cleanup()}catch(e){}
        images.push({name:file.name,label:`p.${p.pages[k]}`,data:r.data,detail:'high'});
      }
      let text='';
      if(chars>0){
        const parts=[];let len=0;
        for(let i=0;i<texts.length;i++){
          if(!texts[i].trim())continue;
          const blk=`【p.${i+1}】\n${texts[i]}`;
          if(len+blk.length>LIM.pdfTextChars){parts.push(`（以降のページは文字数上限のため省略）`);break}
          parts.push(blk);len+=blk.length;
        }
        text=parts.join('\n\n');
      }
      return {images,texts:text?[{name:file.name,label:`PDF ${n}ページ`,text}]:[]};
    };
    return att;
  }

  /* ---------- Excel / CSV ---------- */
  const colName=i=>{let s='';i++;while(i>0){const m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26)}return s};
  const colIndex=l=>{let n=0;for(const ch of l)n=n*26+(ch.charCodeAt(0)-64);return n-1};
  function parseRef(ref){const m=/^([A-Z]+)(\d+)$/.exec(String(ref||''));return m?{c:colIndex(m[1]),r:+m[2]}:null}
  const xmlDoc=s=>new DOMParser().parseFromString(s,'application/xml');
  const byTag=(root,name)=>Array.from(root.getElementsByTagNameNS('*',name));
  const BUILTIN_DATE=new Set([14,15,16,17,18,19,20,21,22,27,28,29,30,31,32,33,34,35,36,45,46,47,50,51,52,53,54,55,56,57,58]);
  function isDateFormat(code){
    const s=String(code||'').replace(/"[^"]*"/g,'').replace(/\[[^\]]*\]/g,'').replace(/\\./g,'');
    return /[ymdhs]/i.test(s)&&!/^general$/i.test(s.trim());
  }
  function serialToText(v,date1904){
    let n=parseFloat(v);if(!isFinite(n))return String(v);
    if(date1904)n+=1462;
    const ms=Date.UTC(1899,11,30)+Math.round(n*86400000),d=new Date(ms);
    const ymd=d.toISOString().slice(0,10),hm=d.toISOString().slice(11,16);
    return n>=1?(n%1>1e-6?`${ymd} ${hm}`:ymd):hm;
  }
  function colorOf(el){
    if(!el)return '';
    const rgb=el.getAttribute('rgb'),th=el.getAttribute('theme'),ix=el.getAttribute('indexed');
    if(rgb){const c=rgb.slice(-6).toUpperCase();return c==='FFFFFF'?'':c}
    if(th!==null){if(th==='0'&&!el.getAttribute('tint'))return '';return 'theme'+th+(el.getAttribute('tint')?(+el.getAttribute('tint')<0?'-':'+'):'')}
    if(ix!==null)return ix==='64'||ix==='9'?'':'idx'+ix;
    return '';
  }
  async function parseXlsx(buf){
    const JSZip=await getJSZip();
    let z;try{z=await JSZip.loadAsync(buf)}catch(e){throw new FileError('Excelファイルを開けませんでした（破損・パスワード付きの可能性）','XLSX')}
    const read=async p=>{const f=z.file(p);return f?await f.async('string'):null};
    const wbS=await read('xl/workbook.xml');if(!wbS)throw new FileError('xl/workbook.xml が見つかりません（.xlsxではありません）','XLSX');
    const wb=xmlDoc(wbS);
    const date1904=byTag(wb,'workbookPr').some(e=>/^(1|true)$/i.test(e.getAttribute('date1904')||''));
    const relS=await read('xl/_rels/workbook.xml.rels'),rels={};
    if(relS)byTag(xmlDoc(relS),'Relationship').forEach(e=>{rels[e.getAttribute('Id')]=e.getAttribute('Target')});
    const sheets=byTag(wb,'sheet').map(e=>{
      const rid=e.getAttribute('r:id')||e.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id');
      let t=rels[rid]||'';t=t.startsWith('/')?t.slice(1):'xl/'+t.replace(/^\.\//,'');
      return {name:e.getAttribute('name'),path:t,hidden:(e.getAttribute('state')||'visible')!=='visible'};
    });
    const sst=[];
    const ssS=await read('xl/sharedStrings.xml');
    if(ssS)byTag(xmlDoc(ssS),'si').forEach(si=>{
      let s='';for(const t of byTag(si,'t')){if(t.parentNode&&t.parentNode.localName==='rPh')continue;s+=t.textContent}sst.push(s);
    });
    const xfDate=[],xfFill=[];
    const stS=await read('xl/styles.xml');
    if(stS){
      const st=xmlDoc(stS),custom={};
      byTag(st,'numFmt').forEach(e=>{custom[e.getAttribute('numFmtId')]=e.getAttribute('formatCode')});
      const fills=byTag(byTag(st,'fills')[0]||st,'fill').map(f=>{
        const pf=byTag(f,'patternFill')[0];
        if(!pf||pf.getAttribute('patternType')!=='solid')return '';
        return colorOf(byTag(pf,'fgColor')[0]);
      });
      const xfs=byTag(byTag(st,'cellXfs')[0]||st,'xf');
      xfs.forEach(x=>{
        const id=+x.getAttribute('numFmtId')||0;
        xfDate.push(BUILTIN_DATE.has(id)||(custom[id]!==undefined&&isDateFormat(custom[id])));
        xfFill.push(fills[+x.getAttribute('fillId')||0]||'');
      });
    }
    const out=[];
    for(const sh of sheets){
      const s=await read(sh.path);
      const info={name:sh.name,hidden:sh.hidden,rows:new Map(),merges:[],maxR:0,maxC:0,minC:1e9,cut:false,fillCells:0};
      if(s){
        const d=xmlDoc(s);
        byTag(d,'mergeCell').forEach(m=>info.merges.push(m.getAttribute('ref')));
        for(const c of byTag(d,'c')){
          const p=parseRef(c.getAttribute('r'));if(!p)continue;
          if(p.r>LIM.sheetRows||p.c>=LIM.sheetCols){info.cut=true;continue}
          const t=c.getAttribute('t'),si=+c.getAttribute('s')||0,vEl=byTag(c,'v')[0];
          let v='';
          if(t==='inlineStr')v=byTag(c,'t').map(x=>x.textContent).join('');
          else if(vEl){
            const raw=vEl.textContent;
            if(t==='s')v=sst[+raw]??'';
            else if(t==='b')v=raw==='1'?'TRUE':'FALSE';
            else if(t==='str'||t==='e')v=raw;
            else v=xfDate[si]?serialToText(raw,date1904):raw;
          }
          const fill=xfFill[si]||'';
          if(v===''&&!fill)continue;
          let row=info.rows.get(p.r);if(!row){row=new Map();info.rows.set(p.r,row)}
          row.set(p.c,{v:String(v).replace(/[\r\n\t]+/g,' ').trim(),fill});
          if(fill)info.fillCells++;
          info.maxR=Math.max(info.maxR,p.r);
          if(v!==''){info.maxC=Math.max(info.maxC,p.c);info.minC=Math.min(info.minC,p.c)}
        }
      }
      out.push(info);
    }
    return {sheets:out,date1904};
  }
  function csvRows(text,delim){
    const rows=[];let row=[],cell='',q=false;
    for(let i=0;i<text.length;i++){
      const ch=text[i];
      if(q){if(ch==='"'){if(text[i+1]==='"'){cell+='"';i++}else q=false}else cell+=ch}
      else if(ch==='"')q=true;
      else if(ch===delim){row.push(cell);cell=''}
      else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell=''}
      else cell+=ch;
    }
    if(cell!==''||row.length){row.push(cell);rows.push(row)}
    return rows;
  }
  function gridFromRows(name,rows){
    const info={name,hidden:false,rows:new Map(),merges:[],maxR:0,maxC:0,minC:1e9,cut:false,fillCells:0};
    rows.slice(0,LIM.sheetRows).forEach((r,i)=>{
      r.slice(0,LIM.sheetCols).forEach((v,c)=>{
        const s=String(v).replace(/[\r\n\t]+/g,' ').trim();if(!s)return;
        let row=info.rows.get(i+1);if(!row){row=new Map();info.rows.set(i+1,row)}
        row.set(c,{v:s,fill:''});info.maxR=i+1;info.maxC=Math.max(info.maxC,c);info.minC=Math.min(info.minC,c);
      });
    });
    if(rows.length>LIM.sheetRows)info.cut=true;
    return info;
  }
  /* シート → AIが読める文字列。列見出し(A,B,…)と行番号を付け、セル位置を引用できるようにする */
  function sheetText(info){
    if(!info.rows.size)return '（値のあるセルがありません）';
    const c0=info.minC===1e9?0:info.minC,c1=info.maxC;
    const lines=[`範囲: ${colName(c0)}1:${colName(c1)}${info.maxR}${info.cut?`（先頭${LIM.sheetRows}行・${LIM.sheetCols}列までで省略）`:''}`];
    if(info.merges.length)lines.push('結合セル: '+info.merges.slice(0,60).join(', ')+(info.merges.length>60?' …':''));
    lines.push('列\t'+Array.from({length:c1-c0+1},(_,i)=>colName(c0+i)).join('\t'));
    [...info.rows.keys()].sort((a,b)=>a-b).forEach(r=>{
      const row=info.rows.get(r);let any=false;const cells=[];
      for(let c=c0;c<=c1;c++){const x=row.get(c);const v=x?x.v:'';if(v)any=true;cells.push(v)}
      if(any){while(cells.length&&!cells[cells.length-1])cells.pop();lines.push(r+'\t'+cells.join('\t'))}
    });
    if(info.fillCells){
      /* 工程表は「色付きセルの帯」で期間を表すことが多いので、塗りつぶしの連なりも示す */
      const runs=[];
      [...info.rows.keys()].sort((a,b)=>a-b).forEach(r=>{
        const row=info.rows.get(r),cols=[...row.keys()].filter(c=>row.get(c).fill).sort((a,b)=>a-b);
        let i=0;
        while(i<cols.length){
          let j=i;while(j+1<cols.length&&cols[j+1]===cols[j]+1&&row.get(cols[j+1]).fill===row.get(cols[i]).fill)j++;
          runs.push(`${colName(cols[i])}${r}:${colName(cols[j])}${r} [${row.get(cols[i]).fill}]`);i=j+1;
        }
      });
      lines.push('','塗りつぶしセル（バー表示の可能性。位置と色）:');
      lines.push(...runs.slice(0,250));if(runs.length>250)lines.push('…（省略）');
    }
    let t=lines.join('\n');
    if(t.length>LIM.sheetChars)t=t.slice(0,LIM.sheetChars)+'\n…（文字数上限のため省略）';
    return t;
  }
  function makeSheetAttachment(file,kind,infos){
    const texts=infos.map(i=>sheetText(i));
    const att={
      kind,summary:infos.length>1?`${infos.length}シート`:(infos[0]?`${infos[0].maxR}行`:''),
      options:{sheets:infos.filter(i=>!i.hidden).map(i=>i.name)},
      controls:infos.length>1||infos.some(i=>i.hidden)?[{type:'checks',key:'sheets',label:'AIに送るシート',
        items:infos.map(i=>({value:i.name,label:`${i.name}${i.hidden?'（非表示）':''}`}))}]:[]
    };
    const chosen=()=>infos.map((i,k)=>({i,t:texts[k]})).filter(x=>att.options.sheets.includes(x.i.name));
    att.describe=()=>{
      const c=chosen(),chars=c.reduce((n,x)=>n+x.t.length,0);
      return [c.length?`${c.map(x=>`「${x.i.name}」${x.i.maxR}行`).join('、')} を表データ（シート名・セル位置・日付付き）に変換して送ります`:'送るシートが選択されていません',
        `約${Math.min(chars,LIM.sheetTotalChars).toLocaleString()}文字${chars>LIM.sheetTotalChars?'（上限で省略）':''}${c.some(x=>x.i.fillCells)?'・塗りつぶし位置を含む':''}`];
    };
    att.estimate=()=>({images:0,chars:Math.min(LIM.sheetTotalChars,chosen().reduce((n,x)=>n+x.t.length,0))});
    att.build=async()=>{
      const out=[];let total=0;
      for(const x of chosen()){
        let t=x.t;if(total+t.length>LIM.sheetTotalChars){t=t.slice(0,Math.max(0,LIM.sheetTotalChars-total))+'\n…（合計文字数上限のため省略）'}
        total+=t.length;
        out.push({name:file.name,label:`シート「${x.i.name}」`,text:t});
        if(total>=LIM.sheetTotalChars)break;
      }
      return {images:[],texts:out};
    };
    return att;
  }
  async function decodeText(file){
    const buf=await file.arrayBuffer();
    let s;
    try{s=new TextDecoder('utf-8',{fatal:true}).decode(buf)}
    catch(e){try{s=new TextDecoder('shift_jis').decode(buf)}catch(e2){s=new TextDecoder('utf-8').decode(buf)}}
    return s.replace(/^﻿/,'');
  }
  async function prepareSheet(file){
    const x=await parseXlsx(await file.arrayBuffer());
    return makeSheetAttachment(file,'sheet',x.sheets);
  }
  async function prepareCsv(file){
    const s=await decodeText(file);
    const first=s.split(/\r?\n/,1)[0]||'';
    const delim=/\.tsv$/i.test(file.name)||(first.split('\t').length>first.split(',').length)?'\t':(first.split(';').length>first.split(',').length?';':',');
    return makeSheetAttachment(file,'csv',[gridFromRows(file.name.replace(/\.[^.]+$/,''),csvRows(s,delim))]);
  }

  /* ---------- 文書 ---------- */
  function plainAtt(file,kind,text,note){
    let cut=false;if(text.length>LIM.textChars){text=text.slice(0,LIM.textChars);cut=true}
    return {kind,summary:`${text.length.toLocaleString()}文字`,controls:[],
      describe:()=>[`本文テキスト ${text.length.toLocaleString()}文字を送ります${cut?'（上限で省略）':''}${note?'｜'+note:''}`],
      estimate:()=>({images:0,chars:text.length}),
      build:async()=>({images:[],texts:[{name:file.name,label:kind==='docx'?'Word文書':'テキスト',text:cut?text+'\n…（省略）':text}]})};
  }
  async function prepareDocx(file){
    const JSZip=await getJSZip();
    let z;try{z=await JSZip.loadAsync(await file.arrayBuffer())}catch(e){throw new FileError('Wordファイルを開けませんでした','DOCX')}
    const f=z.file('word/document.xml');if(!f)throw new FileError('word/document.xml が見つかりません','DOCX');
    const d=xmlDoc(await f.async('string'));
    const paras=byTag(d,'p').map(p=>{
      let s='';
      (function walk(n){for(const c of n.childNodes){
        if(c.nodeType!==1)continue;
        if(c.localName==='t')s+=c.textContent;else if(c.localName==='tab')s+='\t';else if(c.localName==='br')s+='\n';else walk(c);
        if(c.localName==='tc')s+='\t';
      }})(p);
      return s.replace(/\t+$/,'');
    }).filter(s=>s.trim());
    return plainAtt(file,'docx',paras.join('\n'),'表・図形内の文字は順序が崩れることがあります');
  }
  async function prepareText(file){return plainAtt(file,'text',await decodeText(file))}

  /* ---------- 入口 ---------- */
  async function prepare(file){
    if(file.size>LIM.fileBytes)throw new FileError(`ファイルが大きすぎます（${fmtSize(file.size)}／上限 ${fmtSize(LIM.fileBytes)}）`,'BIG');
    if(file.size===0)throw new FileError('空のファイルです','EMPTY');
    const k=classify(file);
    if(k==='xls')throw new FileError('旧形式のExcel（.xls）は未対応です。Excelで .xlsx として保存し直してください','XLS');
    if(k==='unsupported')throw new FileError('このファイル形式は未対応です（対応: 画像・PDF・.xlsx・CSV・.docx・テキスト）','UNSUPPORTED');
    const fn={image:prepareImage,pdf:preparePdf,sheet:prepareSheet,csv:prepareCsv,docx:prepareDocx,text:prepareText}[k];
    const a=await fn(file);
    a.id=uid();a.name=file.name;a.size=file.size;a.tag=TAG[a.kind]||'FILE';a.warnings=a.warnings||[];a.options=a.options||{};
    return a;
  }

  /* 送信用に確定。画像の枚数・合計サイズの上限に収め、収まらなければ理由つきで失敗させる */
  async function buildAll(atts,{onProgress}={}){
    const fixedImages=atts.filter(a=>a.kind==='image').length;
    let slots=LIM.imagesTotal-fixedImages;
    if(slots<0)throw new FileError(`画像は合計${LIM.imagesTotal}枚までです（${fixedImages}枚選択中）`,'TOO_MANY');
    const images=[],texts=[],notes=[],pdfs=[];
    for(const a of atts){
      const r=await a.build({slots,onProgress});
      if(a.kind!=='image')slots-=r.images.length;
      images.push(...r.images);texts.push(...r.texts);pdfs.push(...(r.pdfs||[]));
    }
    const pdfBytes=pdfs.reduce((n,p)=>n+dataBytes(p.data),0);
    if(pdfs.length>3)throw new FileError('PDF原本は3件までです。「PDFを原本のまま送る」をオフにするか、件数を減らしてください','TOO_MANY');
    if(pdfBytes>LIM.imageBytesTotal-0.4*1024*1024)throw new FileError('PDF原本が大きすぎて送れません。「PDFを原本のまま送る」をオフにするか、件数を減らしてください','TOO_LARGE');
    if(images.length>LIM.imagesTotal)throw new FileError(`画像は合計${LIM.imagesTotal}枚までです`,'TOO_MANY');
    const budget=LIM.imageBytesTotal-pdfBytes;
    let total=images.reduce((n,i)=>n+dataBytes(i.data),0),pass=0;
    while(total>budget&&pass<3){
      pass++;onProgress&&onProgress('画像を圧縮しています…');
      for(const im of images)im.data=await shrinkData(im.data,pass===1?.8:.75,pass===3?.5:.62);
      total=images.reduce((n,i)=>n+dataBytes(i.data),0);
    }
    if(total>budget)throw new FileError('画像が大きすぎて送れません。枚数を減らしてください','TOO_LARGE');
    const chars=texts.reduce((n,t)=>n+t.text.length,0);
    return {images,texts,pdfs,notes,stats:{images:images.length,imageBytes:total,pdfs:pdfs.length,pdfBytes,chars}};
  }

  window.KoujiAIFiles={LIM,TAG,ACCEPT_DOC,FileError,classify,prepare,buildAll,fmtSize,
    _t:{parseXlsx,sheetText,serialToText,isDateFormat,csvRows,parsePages,pageToText,gridFromRows,colName}};
})();
