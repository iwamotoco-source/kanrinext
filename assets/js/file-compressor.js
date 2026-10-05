(function(){'use strict';
  const $=id=>document.getElementById(id),rows=[];let busy=false,ctrl=null,seq=0;
  const fmt=n=>n<1024?n+' B':n<1024*1024?(n/1024).toFixed(1)+' KB':(n/1024/1024).toFixed(2)+' MB';
  function text(tag,value,cls){const el=document.createElement(tag);el.textContent=value;if(cls)el.className=cls;return el}
  function status(t){$('status').textContent=t}
  function release(r){(r.urls||[]).forEach(u=>URL.revokeObjectURL(u));r.urls=[]}
  function resultName(r){return r.result?.name||r.file.name}
  function url(r,b){const u=URL.createObjectURL(b);r.urls.push(u);return u}
  function download(r,blob,name,label){const a=text('a',label);a.href=url(r,blob);a.download=name;return a}
  function renderRow(r){
    release(r);const el=r.el;el.replaceChildren();const head=text('div','','fileHead'),left=text('div');
    left.append(text('div',r.file.name.split('.').pop().toUpperCase(),'tag'),text('div',r.file.name,'name'));
    const remove=text('button','×','remove');remove.setAttribute('aria-label',r.file.name+'を削除');remove.disabled=busy;remove.onclick=()=>{release(r);rows.splice(rows.indexOf(r),1);el.remove();update()};head.append(left,remove);el.append(head);
    if(!r.result){el.append(text('p',fmt(r.file.size)+' · '+(r.state||'待機中'),'detail'));return;}
    const b=r.result.blob,sizes=text('div','','sizes');sizes.append(text('span',fmt(r.file.size)+' →'),text('strong',fmt(b.size)));
    sizes.append(text('span',b.size<r.file.size?((1-b.size/r.file.size)*100).toFixed(1)+'% 削減':'元ファイルを保持','saving'));el.append(sizes,text('p',r.result.note,'detail'+(r.error?' warning':'')));
    const target=Number($('target').value)*1024*1024;if(target&&b.size>target)el.append(text('p','目標サイズを超えています。品質保護のため無理な圧縮はしていません。','detail warning'));
    const links=text('div','','downloads');links.append(download(r,b,resultName(r),r.result.changed?'圧縮結果を保存':'元ファイルを保存'));
    if(r.result.changed)links.append(download(r,r.file,r.file.name,'元ファイル'));el.append(links);
    if(r.file.type.startsWith('image/')&&b.type.startsWith('image/')&&r.file.size<20*1024*1024){
      const wrap=text('div','','preview');for(const [label,blob] of [['元の画像',r.file],['圧縮結果',b]]){const fig=text('figure'),im=document.createElement('img');im.src=url(r,blob);im.alt=label;im.loading='lazy';fig.append(im,text('figcaption',label));wrap.append(fig)}el.append(wrap);
    }
  }
  function update(){
    $('start').disabled=busy||!rows.length;$('stop').disabled=!busy;$('clear').disabled=busy||!rows.length;$('zip').disabled=busy||!rows.some(r=>r.result);
    for(const id of ['mode','quality','target','files'])$(id).disabled=busy;
    document.querySelectorAll('.remove').forEach(b=>b.disabled=busy);
    const done=rows.filter(r=>r.result),before=done.reduce((a,r)=>a+r.file.size,0),after=done.reduce((a,r)=>a+r.result.blob.size,0);
    $('summary').hidden=!done.length;$('summary').textContent=`${done.length}件処理済み · ${fmt(before)} → ${fmt(after)}${before>after?' · '+fmt(before-after)+'削減':''}`;
  }
  function help(){
    const lossless=$('mode').value==='lossless';$('quality').disabled=lossless||busy;
    $('modeHelp').textContent=lossless?'画質は変えません。PDF・Excelは構造を再圧縮。画像・動画はZIPに包み、小さくならなければ元ファイルを残します。':'写真と映像を再圧縮します。多少の劣化はあります。PDFの文字・図形、Excelの数式・書式は残し、解像度は変えません。';
  }
  function add(files){
    if(busy)return;let rejected=0;
    for(const file of files){
      if(rows.some(r=>r.file.name===file.name&&r.file.size===file.size&&r.file.lastModified===file.lastModified))continue;
      if(rows.length>=20||rows.reduce((a,r)=>a+r.file.size,0)+file.size>250*1024*1024){rejected++;continue;}
      const r={id:++seq,file,urls:[],el:text('article','','file'),state:'待機中'};rows.push(r);$('results').append(r.el);renderRow(r);
    }
    update();help();status(rejected?`${rows.length}件追加済み。上限（20件・合計250 MB）を超える${rejected}件は追加しませんでした。`:`${rows.length}件を追加しました。圧縮方法を選んで開始してください。`);
  }
  $('files').onchange=e=>{add(e.target.files);e.target.value=''};
  const drop=$('drop');drop.ondragover=e=>{e.preventDefault();if(!busy)drop.classList.add('over')};drop.ondragleave=()=>drop.classList.remove('over');drop.ondrop=e=>{e.preventDefault();drop.classList.remove('over');add(e.dataTransfer.files)};
  for(const id of ['mode','quality'])$(id).onchange=()=>{rows.forEach(r=>{release(r);r.result=null;r.error=false;r.state='設定を変更しました。再圧縮してください';renderRow(r)});update();help()};
  $('target').onchange=()=>rows.forEach(renderRow);
  $('clear').onclick=()=>{rows.forEach(release);rows.length=0;$('results').replaceChildren();update();help();status('ファイルを追加してください。')};
  $('stop').onclick=()=>{ctrl?.abort();$('stop').disabled=true;status('停止しています。処理済みのファイルは保存できます。')};
  $('start').onclick=async()=>{
    if(busy)return;busy=true;ctrl=new AbortController();update();let count=0;
    const options={mode:$('mode').value,quality:$('quality').value,signal:ctrl.signal};
    try{
      for(const r of rows){
        if(ctrl.signal.aborted)break;if(r.result)continue;
        r.state='処理中';renderRow(r);const progress=document.createElement('progress');progress.max=1;progress.value=0;r.el.append(progress);const hint=text('p','','detail');r.el.append(hint);
        status(`${rows.indexOf(r)+1} / ${rows.length} · ${r.file.name}`);
        try{r.result=await KoujiCompression.compress(r.file,{...options,progress:(p,t)=>{progress.value=p;hint.textContent=t}});count++;}
        catch(e){if(e.name==='AbortError'||ctrl.signal.aborted){r.state='停止しました。再開するとこのファイルから処理します';renderRow(r);break;}r.error=true;r.result={blob:r.file,name:r.file.name,changed:false,note:(e.message||'処理できませんでした')+' 元ファイルを保持しています。'};}
        renderRow(r);update();await new Promise(resolve=>setTimeout(resolve,0));
      }
      status(ctrl.signal.aborted?'停止しました。処理済みの結果は保存できます。':`${count}件の圧縮処理が完了しました。結果を確認して保存してください。`);
    }finally{busy=false;ctrl=null;update();help()}
  };
  $('zip').onclick=async()=>{
    if(busy)return;busy=true;ctrl=new AbortController();update();
    try{const zip=new JSZip(),used=new Set();for(const r of rows.filter(r=>r.result)){
      let name=resultName(r),n=2;while(used.has(name)){const dot=resultName(r).lastIndexOf('.');name=dot<0?resultName(r)+'_'+n:resultName(r).slice(0,dot)+'_'+n+resultName(r).slice(dot);n++;}used.add(name);
      zip.file(name,await r.result.blob.arrayBuffer());if(ctrl.signal.aborted)throw new DOMException('停止','AbortError');
    }
      const blob=await zip.generateAsync({type:'blob',compression:'STORE'},m=>{if(ctrl.signal.aborted)throw new DOMException('停止','AbortError');status(`ZIPを作成しています… ${Math.round(m.percent)}%`)});
      const a=document.createElement('a'),u=URL.createObjectURL(blob);a.href=u;a.download='kanrinext_compressed.zip';a.click();setTimeout(()=>URL.revokeObjectURL(u),60000);status('ZIPを作成しました。ダウンロード先を確認してください。');
    }catch(e){status(e.name==='AbortError'?'ZIP作成を停止しました。':'ZIPを作成できません。個別の保存ボタンを使用してください。');}
    finally{busy=false;ctrl=null;update();help()}
  };
  addEventListener('beforeunload',e=>{if(busy){e.preventDefault();e.returnValue=''}});
  addEventListener('pagehide',()=>{ctrl?.abort();KoujiCompression.resetVideo()});
  function theme(t){document.documentElement.dataset.theme=t==='dark'?'dark':'light'}
  theme(new URLSearchParams(location.search).get('theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));
  addEventListener('message',e=>{if(e.source===parent&&e.origin===location.origin&&e.data?.type==='kouji-theme')theme(e.data.theme)});
  if(new URLSearchParams(location.search).has('embed'))document.querySelector('.back').hidden=true;
  update();help();
})();
