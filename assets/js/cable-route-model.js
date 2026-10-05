/* Copper-conductor, resistance-only estimate. Product impedance/ampacity are separate. */
(function(root){'use strict';
const power=[2,3.5,5.5,8,14,22,38,60,100,150,200,250,325],small=[0.75,1.25,2,3.5,5.5],control=[1.25,2,3.5,5.5];
const catalogs={CV:{sizes:power,temp:90},CVT:{sizes:power.filter(n=>n>=8),temp:90},CVQ:{sizes:power.filter(n=>n>=8),temp:90},'EM-CE':{sizes:power,temp:90},'EM-CET':{sizes:power.filter(n=>n>=8),temp:90},VV:{sizes:power.filter(n=>n<=100),temp:60},VVF:{sizes:[1.6,2,2.6],diameter:true,temp:60},VVR:{sizes:power.filter(n=>n<=100),temp:60},'EM-EEF':{sizes:[1.6,2,2.6],diameter:true,temp:75},IV:{sizes:power,temp:60},HIV:{sizes:power,temp:75},'EM-IE':{sizes:power,temp:75},KIV:{sizes:[...small,8,14,22,38,60,100],temp:60},VCT:{sizes:[...small,8,14,22,38,60,100],temp:60},VCTF:{sizes:small.filter(n=>n<=2),temp:60},'2PNCT':{sizes:[...small,8,14,22,38,60,100],temp:80},CVV:{sizes:control,temp:60},'EM-CEE':{sizes:control,temp:75},'その他':{sizes:[...small,8,14,22,38,60,100,150,200,250,325],temp:90}};
const vvf={1.6:8.92,2:5.65,2.6:3.35},vvr={2:9.42,3.5:5.30,5.5:3.40,8:2.36,14:1.33,22:0.840,38:0.497,60:0.309,100:0.184};
function catalog(type){return catalogs[type]||catalogs['その他'];}
function resistance(r,size=r.size){const c=catalog(r.cable),area=c.diameter?Math.PI*size*size/4:Number(size);if(r.customR&&Number.isFinite(+r.r20)&&+r.r20>0)return{r20:+r.r20,area,basis:'入力した20℃導体抵抗'};if(r.cable==='VVF')return{r20:vvf[size],area,basis:'SFCC VVF：最大導体抵抗（20℃）'};if(r.cable==='VVR'&&vvr[size])return{r20:vvr[size],area,basis:'SFCC VVR：最大導体抵抗（20℃）'};return{r20:17.8/area,area,basis:'銅の抵抗率0.0178 Ω·mm²/mによる概算（製品値ではない）'};}
function calculate(r,length,size=r.size){const b=resistance(r,size),factor=1+0.00393*(Number(r.temp)-20),rt=b.r20*factor,k=r.system==='3p'?Math.sqrt(3):2,dv=k*Number(r.current)*length*rt/1000;return{...b,factor,rt,k,dv,pct:dv/Number(r.voltage)*100};}
function label(type,size){return catalog(type).diameter?size+' mm径':size+' mm²';}
root.CableRouteModel={catalogs,catalog,resistance,calculate,label};
})(typeof window!=='undefined'?window:globalThis);
