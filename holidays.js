/* =========================================================
   holidays.js — 日本の祝日（内閣府の規定に基づく計算。2000〜2099年）
   振替休日・国民の休日・2019〜2021年の特例を含む
   ========================================================= */
'use strict';
const _holCache=new Map();
function _nthMonday(y,m,n){const d=new Date(y,m-1,1);const first=(8-d.getDay())%7+1;return first+(n-1)*7}
function _equinox(y,spring){const b=spring?20.8431:23.2488;return Math.floor(b+0.242194*(y-1980)-Math.floor((y-1980)/4))}
function holidaysOfYear(y){
  if(_holCache.has(y))return _holCache.get(y);
  const H=new Map();const add=(m,d,n)=>H.set(`${y}-${pad(m)}-${pad(d)}`,n);
  add(1,1,'元日');add(1,_nthMonday(y,1,2),'成人の日');add(2,11,'建国記念の日');
  if(y>=2020)add(2,23,'天皇誕生日');else if(y<=2018)add(12,23,'天皇誕生日');
  add(3,_equinox(y,true),'春分の日');add(4,29,'昭和の日');add(5,3,'憲法記念日');add(5,4,'みどりの日');add(5,5,'こどもの日');
  if(y===2020)add(7,23,'海の日');else if(y===2021)add(7,22,'海の日');else add(7,_nthMonday(y,7,3),'海の日');
  if(y===2020)add(8,10,'山の日');else if(y===2021)add(8,8,'山の日');else if(y>=2016)add(8,11,'山の日');
  add(9,_nthMonday(y,9,3),'敬老の日');add(9,_equinox(y,false),'秋分の日');
  const sp=y>=2020?'スポーツの日':'体育の日';if(y===2020)add(7,24,sp);else if(y===2021)add(7,23,sp);else add(10,_nthMonday(y,10,2),sp);
  add(11,3,'文化の日');add(11,23,'勤労感謝の日');
  if(y===2019){add(4,30,'国民の休日');add(5,1,'天皇の即位の日');add(5,2,'国民の休日');add(10,22,'即位礼正殿の儀の行われる日')}
  /* 国民の休日（祝日に挟まれた平日） */
  const keys=[...H.keys()].sort();
  for(let i=0;i<keys.length-1;i++){const mid=addDays(keys[i],1);if(addDays(mid,1)===keys[i+1]&&!H.has(mid)&&dowOf(mid)!==0)H.set(mid,'国民の休日')}
  /* 振替休日 */
  [...H.keys()].sort().forEach(k=>{if(dowOf(k)===0){let d=addDays(k,1);while(H.has(d))d=addDays(d,1);if(d.slice(0,4)===String(y))H.set(d,'振替休日')}});
  _holCache.set(y,H);return H;
}
function holidayName(s){if(!s)return '';const y=+s.slice(0,4);return holidaysOfYear(y).get(s)||''}
