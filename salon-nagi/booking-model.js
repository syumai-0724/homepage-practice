/* メニュー別の仮の施術時間と、担当者ごとの空き・休みを管理するデモ用ルール。 */
(function(root){
 "use strict";
 const staff=[
 {id:"yui",name:"YUI",style:"韓国風レイヤー",image:"staff-yui.svg"},
 {id:"ren",name:"REN",style:"メンズ・マッシュ",image:"staff-ren.svg"},
 {id:"mei",name:"MEI",style:"透明感カラー",image:"staff-mei.svg"},
 {id:"sora",name:"SORA",style:"ショート・ボブ",image:"staff-sora.svg"},
 {id:"rin",name:"RIN",style:"デザインカラー",image:"staff-rin.svg"},
 {id:"aoi",name:"AOI",style:"パーマスタイル",image:"staff-aoi.svg"},
 {id:"hina",name:"HINA",style:"ヘアアレンジ",image:"staff-hina.svg"}
 ];
 const services=["カット","学生カット","前髪カット","ワンカラー","リタッチカラー","ブリーチ","ダブルカラー","インナーカラー","ハイライト","バレイヤージュ","パーマ","デジタルパーマ","ポイントパーマ","ストレートパーマ","縮毛矯正","トリートメント","ヘッドスパ","シャンプー＆ブロー","ヘアセット","ヘアアレンジ","眉カット"];
 const serviceMinutes={"カット":60,"学生カット":60,"前髪カット":30,"ワンカラー":90,"リタッチカラー":60,"ブリーチ":90,"ダブルカラー":150,"インナーカラー":120,"ハイライト":120,"バレイヤージュ":150,"パーマ":90,"デジタルパーマ":120,"ポイントパーマ":60,"ストレートパーマ":90,"縮毛矯正":180,"トリートメント":30,"ヘッドスパ":30,"シャンプー＆ブロー":30,"ヘアセット":60,"ヘアアレンジ":60,"眉カット":30};
 const times=Array.from({length:18},(_,i)=>String(9+Math.floor(i/2)).padStart(2,"0")+":"+(i%2?"30":"00"));
 const knownStaff=id=>staff.some(s=>s.id===id);
 function today(now=new Date()) {const p=new Intl.DateTimeFormat("en",{timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);const v=Object.fromEntries(p.map(x=>[x.type,x.value]));return v.year+"-"+v.month+"-"+v.day;}
 function validDate(date) {if(!/^\d{4}-\d{2}-\d{2}$/.test(date||""))return false;const d=new Date(date+"T00:00:00Z");return !isNaN(d)&&d.toISOString().slice(0,10)===date;}
 function closed(date) {return validDate(date)&&new Date(date+"T00:00:00Z").getUTCDay()===2;}
 function minutes(time){const p=time.split(":").map(Number);return p[0]*60+p[1];}
 function selections(record){return Array.isArray(record.services)?record.services:(record.service?[record.service]:[]);}
 function selectedDuration(chosen){return chosen.reduce((sum,name)=>sum+(serviceMinutes[name]||0),0);}
 // 保存済みの予約は当時の時間を維持します。旧データは1メニュー30分です。
 function duration(record){return Number.isInteger(record.durationMinutes)&&record.durationMinutes>=30&&record.durationMinutes<=540&&record.durationMinutes%30===0?record.durationMinutes:selections(record).length*30;}
 function requiredDuration(selection){if(Array.isArray(selection)){if(!selection.length||new Set(selection).size!==selection.length||!selection.every(s=>services.includes(s)))return 0;return selectedDuration(selection);}return Number.isInteger(selection)&&selection>0&&selection<=services.length?selection*30:0;}
 function endAt(time,length){const n=minutes(time)+length;return String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0");}
 function total(record){return selections(record).length*500+100;}
 function endTime(time,count){const n=minutes(time)+count*30;return String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0");}
 function off(holidays,person,date){return holidays.some(h=>h.staff===person&&h.date===date);}
 function occupied(bookings,person,date,time,count=1){const start=minutes(time),end=start+requiredDuration(count);return bookings.some(b=>b.staff===person&&b.date===date&&minutes(b.time)<end&&minutes(b.time)+duration(b)>start);}
 function slotState(person,date,time,bookings,now=new Date(),count=1,holidays=[]){
  if(!knownStaff(person)||!validDate(date)||!times.includes(time)||!requiredDuration(count))return "invalid";
  if(closed(date))return "closed";
  if(off(holidays,person,date))return "off";
  if(minutes(time)+requiredDuration(count)>18*60)return "short";
  if(new Date(date+"T"+time+":00+09:00")<=now)return "past";
  return occupied(bookings,person,date,time,count)?"booked":"available";
 }
 function validate(record,bookings,now=new Date(),holidays=[]){
  if(!record)return "予約内容を選んでください。";
  const chosen=selections(record);
  if(!chosen.length||new Set(chosen).size!==chosen.length||!chosen.every(s=>services.includes(s)))return "メニューを1つ以上選んでください。";
  if(typeof record.nickname!=="string"||!record.nickname.trim()||record.nickname.trim().length>40)return "ニックネームを40文字以内で入力してください。";
  return {invalid:"担当者・日付・時間を選んでください。",closed:"火曜日は定休日です。",off:"この担当者は選択した日がお休みです。",short:"必要な施術時間が閉店時刻を超えます。",past:"過去の時間は予約できません。",booked:"必要な時間の途中に予約済み枠があります。別の時間を選んでください。",available:""}[slotState(record.staff,record.date,record.time,bookings,now,chosen,holidays)];
 }
 function sanitize(value){if(!Array.isArray(value))return [];return value.filter(b=>b&&typeof b.id==="string"&&b.id.length<=100&&knownStaff(b.staff)&&validDate(b.date)&&!closed(b.date)&&times.includes(b.time)&&selections(b).length>0&&new Set(selections(b)).size===selections(b).length&&selections(b).every(s=>services.includes(s))&&minutes(b.time)+duration(b)<=1080&&typeof b.nickname==="string"&&b.nickname.trim().length>0&&b.nickname.length<=40).map(b=>({id:b.id,staff:b.staff,date:b.date,time:b.time,services:selections(b),nickname:b.nickname,durationMinutes:duration(b)}));}
 function sanitizeHolidays(value){return Array.isArray(value)?value.filter(h=>h&&knownStaff(h.staff)&&validDate(h.date)).map(h=>({staff:h.staff,date:h.date})):[];}
 const api={staff,services,serviceMinutes,selectedDuration,requiredDuration,endAt,times,today,validDate,closed,minutes,selections,duration,total,endTime,off,occupied,slotState,validate,sanitize,sanitizeHolidays};
 if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.NagiBooking=api;
})(typeof window!=="undefined"?window:globalThis);
