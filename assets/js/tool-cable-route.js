'use strict';
/* 工事管理next: 配線ルート・電圧降下ツールを既存ツール一覧へ追加 */
try{
  if(typeof TOOLS!=='undefined'&&Array.isArray(TOOLS)&&!TOOLS.some(t=>t.id==='cableRoute')){
    const item={id:'cableRoute',file:'cable-route.html',name:'配線ルート・電圧降下',desc:'PDF図面上で配線ルートを描き、施工想定長と電圧降下を判定',icon:'ruler'};
    const i=Math.max(0,TOOLS.findIndex(t=>t.id==='elec'));
    TOOLS.splice(i<0?TOOLS.length:i,0,item);
  }
}catch(e){console.error('cable route tool registration failed',e)}
