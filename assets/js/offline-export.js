/* Export a portable core-only offline HTML. No saved data or credentials are copied. */
(()=>{'use strict';
const btn=document.getElementById('offlineHtmlExport');
if(!btn)return;
const base=new URL('./',location.href);
const read=async url=>{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('取得失敗: '+new URL(url,base).pathname);return r};
const dataUrl=async url=>{const blob=await (await read(url)).blob();return new Promise((resolve,reject)=>{const f=new FileReader();f.onload=()=>resolve(f.result);f.onerror=()=>reject(f.error);f.readAsDataURL(blob)})};
const xmlSafe=s=>s.replace(/<\//gi,'<\\/');
async function exportHTML(){
  if(location.protocol==='file:')throw Error('書き出しは公開中のkanrinextを開いて実行してください');
  btn.disabled=true;const initial=btn.textContent;btn.textContent='HTMLを作成中…';
  try{
    const raw=await (await read(new URL('index.html',base))).text();
    const doc=new DOMParser().parseFromString(raw,'text/html');
    doc.querySelectorAll('meta[http-equiv="Content-Security-Policy"],link[rel="manifest"],link[rel="preconnect"],link[rel="apple-touch-icon"],link[href*="fonts.googleapis.com"]').forEach(e=>e.remove());
    const styles=[...doc.querySelectorAll('link[rel="stylesheet"]')];
    for(const el of styles){
      const url=new URL(el.getAttribute('href'),base),css=await (await read(url)).text();
      const matches=[...css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)].filter(m=>!m[2].startsWith('data:')&&!m[2].startsWith('#'));
      let out=css;
      for(const m of [...matches].reverse()){
        const asset=new URL(m[2],url);
        try{const encoded=await dataUrl(asset);out=out.slice(0,m.index)+'url("'+encoded+'")'+out.slice(m.index+m[0].length)}
        catch(e){out=out.slice(0,m.index)+'none'+out.slice(m.index+m[0].length)}
      }
      const style=doc.createElement('style');style.textContent=out;el.replaceWith(style);
    }
    // Images in the shell are bundled too; no cookies, personal state or tokens are serialized.
    for(const img of doc.querySelectorAll('img[src],link[rel="icon"][href]')){
      const attr=img.tagName==='IMG'?'src':'href',value=img.getAttribute(attr);
      if(value && !/^(data:|https?:|blob:)/i.test(value)){try{img.setAttribute(attr,await dataUrl(new URL(value,base)))}catch(e){if(img.tagName==='LINK')img.remove()}}
    }
    for(const el of [...doc.querySelectorAll('script[src]')]){
      const src=new URL(el.getAttribute('src'),base),js=await (await read(src)).text();
      const script=doc.createElement('script');script.textContent=xmlSafe(js);el.replaceWith(script);
    }
    // Separate iframe tools require their own asset graphs: do not imply they work offline.
    const info=doc.createElement('script');
    info.textContent=String.raw`(()=>{window.__KANRINEXT_SINGLE_HTML__=true;const note=()=>{if(location.hash.startsWith('#tool/')){const frame=document.getElementById('toolFrame');if(frame){frame.removeAttribute('src');frame.srcdoc='<html lang="ja"><meta charset="utf-8"><body style="font:16px sans-serif;background:#111827;color:white;padding:30px"><h2>単一HTML版ではこのツールを同梱していません</h2><p>PDF・Excelなどの個別ツールは通常版で利用してください。</p></body></html>';}}};window.addEventListener('hashchange',()=>setTimeout(note,30));window.addEventListener('DOMContentLoaded',()=>setTimeout(note,50));})();`;
    doc.body.append(info);
    doc.getElementById('offlineHtmlExport')?.remove();
    doc.querySelectorAll('script[src*="offline-export"]')?.forEach(e=>e.remove());
    const title=doc.querySelector('title');if(title)title.textContent='工事管理next（単一HTML・簡易オフライン版）';
    const html='<!doctype html>\n'+doc.documentElement.outerHTML;
    const blob=new Blob([html],{type:'text/html;charset=utf-8'}),a=document.createElement('a');
    const url=URL.createObjectURL(blob);a.href=url;a.download='kanrinext-offline-'+new Date().toISOString().slice(0,10)+'.html';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
    alert('単一HTMLを保存しました。予定・タスク等のデータやGitHubトークンは含まれません。個別ツール、オンライン同期、天気、地図タイルはこの簡易版の対象外です。');
  }finally{btn.disabled=false;btn.textContent=initial}
}
btn.addEventListener('click',()=>exportHTML().catch(e=>alert('書き出しに失敗しました: '+e.message)));
})();