/* DOMや通信に依存しない、料金・カレンダー・入力チェックのルールです。 */
(function(root){
'use strict';
const D=typeof module!=='undefined'&&module.exports?require('./data.js'):root.LueurData;
const menu=id=>D.menus.find(x=>x.id===id);
const option=id=>D.options.find(x=>x.id===id);
function today(now=new Date()){const parts=new Intl.DateTimeFormat('en',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));return p.year+'-'+p.month+'-'+p.day;}
function validDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return false;const d=new Date(value+'T00:00:00Z');return !isNaN(d)&&d.toISOString().slice(0,10)===value;}
function addDays(date,n){const d=new Date(date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
function dateState(date,now=new Date()){if(!validDate(date))return 'invalid';const first=today(now);if(date<first)return 'past';if(date>addDays(first,D.schedule.horizon))return 'future';if(D.schedule.closedWeekdays.includes(new Date(date+'T00:00:00Z').getUTCDay()))return 'closed';return 'available';}
function monthDays(year,month){const first=new Date(Date.UTC(year,month,1)),total=new Date(Date.UTC(year,month+1,0)).getUTCDate();return {offset:first.getUTCDay(),dates:Array.from({length:total},(_,i)=>year+'-'+String(month+1).padStart(2,'0')+'-'+String(i+1).padStart(2,'0'))};}
function time(minutes){return String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0');}
function toMinutes(value){if(!/^\d{2}:\d{2}$/.test(value||''))return NaN;const [h,m]=value.split(':').map(Number);return h<24&&m<60?h*60+m:NaN;}
function quote(menuId,ids=[]){const selected=menu(menuId);if(!selected)throw Error('メニューを選んでください。');if(!Array.isArray(ids)||new Set(ids).size!==ids.length||ids.some(id=>!option(id)))throw Error('オプションを確認してください。');const extras=ids.map(option).filter(x=>x.id!=='none');if(extras.filter(x=>x.type==='off').length>1)throw Error('付け替えオフはいずれか1つを選んでください。');if(menuId==='off'&&extras.some(x=>x.type==='off'))throw Error('オフのみには付け替えオフを追加できません。');return {menu:selected,options:extras,price:selected.price+extras.reduce((n,x)=>n+x.price,0),duration:selected.duration+extras.reduce((n,x)=>n+x.duration,0),fromPrice:selected.fromPrice,fromDuration:selected.fromDuration};}
// 全て架空の満席サンプル。実際の店舗の予約情報ではありません。
function sampleBusy(date){const day=Number(date.slice(-2));return day%2===0?[{start:720,end:810}]:[{start:810,end:870}];}
function slotState(date,start,duration,now=new Date()){const ds=dateState(date,now);if(ds!=='available')return ds;if(!Number.isFinite(start)||!Number.isInteger(duration)||duration<=0||duration%15!==0||start<D.schedule.start||(start-D.schedule.start)%D.schedule.step!==0)return 'invalid';if(start+duration>D.schedule.end)return 'short';if(new Date(date+'T'+time(start)+':00+09:00')<=now)return 'past';return sampleBusy(date).some(b=>start<b.end&&start+duration>b.start)?'busy':'available';}
function slots(date,duration,now=new Date()){return Array.from({length:Math.floor((D.schedule.end-D.schedule.start)/D.schedule.step)},(_,i)=>{const start=D.schedule.start+i*D.schedule.step;return {start,label:time(start),state:slotState(date,start,duration,now)}});}
function personErrors(person,phoneRequired=false){const errors={};if(typeof person.name!=='string'||!person.name.trim()||person.name.trim().length>60)errors.name='お名前を60文字以内で入力してください。';if(typeof person.email!=='string'||person.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email.trim()))errors.email='メールアドレスの形式を確認してください。';if(phoneRequired){const digits=(person.phone||'').replace(/\D/g,'');if(!/^[+\d\s()（）-]+$/.test(person.phone||'')||digits.length<10||digits.length>15)errors.phone='電話番号を10〜15桁の数字で入力してください。';}return errors;}
function reservationErrors(draft,now=new Date()){const errors=personErrors(draft,true);let q;try{q=quote(draft.menuId,draft.options);}catch(e){errors.menu=e.message;}if(dateState(draft.date,now)!=='available')errors.date='過去日・仮定休日・受付範囲外を除いて日付を選んでください。';if(q&&slotState(draft.date,toMinutes(draft.time),q.duration,now)!=='available')errors.time='必要な時間が空いている開始時刻を選び直してください。';if(typeof draft.request!=='string'||draft.request.length>1000)errors.request='備考は1,000文字以内にしてください。';return errors;}
function contactErrors(draft){const errors=personErrors(draft);if(typeof draft.message!=='string'||!draft.message.trim()||draft.message.trim().length>2000)errors.message='お問い合わせ内容を2,000文字以内で入力してください。';return errors;}
function normalize(value){return String(value).normalize('NFKC').toLocaleLowerCase('ja-JP').trim();}
function faqMatches(item,query){const hay=normalize(item.question+' '+item.answer);return normalize(query).split(/\s+/).filter(Boolean).every(word=>hay.includes(word));}
function money(value,from=false){return '¥'+value.toLocaleString('ja-JP')+(from?'〜':'');}
function safeFavorites(value){return Array.isArray(value)?[...new Set(value)].filter(id=>D.gallery.some(x=>x.id===id)):[];}
const api={menu,option,today,validDate,addDays,dateState,monthDays,time,toMinutes,quote,sampleBusy,slotState,slots,personErrors,reservationErrors,contactErrors,normalize,faqMatches,money,safeFavorites};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LueurModel=api;
})(typeof window!=='undefined'?window:globalThis);
