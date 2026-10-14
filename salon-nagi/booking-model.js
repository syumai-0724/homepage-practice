/* 空き時間と予約のルール。ブラウザーと確認用のNodeで共用します。 */
(function (root) {
  "use strict";
  const staff = [
    {id:"yui",name:"YUI",style:"韓国風レイヤー"},
    {id:"ren",name:"REN",style:"メンズ・マッシュ"},
    {id:"mei",name:"MEI",style:"透明感カラー"},
    {id:"sora",name:"SORA",style:"ショート・ボブ"},
    {id:"rin",name:"RIN",style:"デザインカラー"},
    {id:"aoi",name:"AOI",style:"パーマスタイル"},
    {id:"hina",name:"HINA",style:"ヘアアレンジ"}
  ];
  const services = ["カット","学生カット","前髪カット","ワンカラー","リタッチカラー","ブリーチ","ダブルカラー","インナーカラー","ハイライト","バレイヤージュ","パーマ","デジタルパーマ","ポイントパーマ","ストレートパーマ","縮毛矯正","トリートメント","ヘッドスパ","シャンプー＆ブロー","ヘアセット","ヘアアレンジ","眉カット"];
  const times = Array.from({length:18},(_,i)=>String(9+Math.floor(i/2)).padStart(2,"0")+":"+(i%2?"30":"00"));
  function today(now=new Date()) {
    const p = new Intl.DateTimeFormat("en",{timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);
    const v = Object.fromEntries(p.map(x=>[x.type,x.value]));
    return v.year+"-"+v.month+"-"+v.day;
  }
  function validDate(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return false;
    const d = new Date(date+"T00:00:00Z");
    return !isNaN(d) && d.toISOString().slice(0,10)===date;
  }
  function closed(date) { return validDate(date) && new Date(date+"T00:00:00Z").getUTCDay()===2; }
  function occupied(bookings,person,date,time) { return bookings.some(b=>b.staff===person && b.date===date && b.time===time); }
  function slotState(person,date,time,bookings,now=new Date()) {
    if (!staff.some(s=>s.id===person) || !validDate(date) || !times.includes(time)) return "invalid";
    if (closed(date)) return "closed";
    if (new Date(date+"T"+time+":00+09:00")<=now) return "past";
    return occupied(bookings,person,date,time)?"booked":"available";
  }
  function validate(record,bookings,now=new Date()) {
    if (!record || !services.includes(record.service)) return "メニューを選んでください。";
    if (typeof record.nickname!=="string" || !record.nickname.trim() || record.nickname.trim().length>40) return "ニックネームを40文字以内で入力してください。";
    const state=slotState(record.staff,record.date,record.time,bookings,now);
    return {invalid:"担当者・日付・時間を選んでください。",closed:"火曜日は定休日です。",past:"過去の時間は予約できません。",booked:"この担当者の時間枠は予約済みです。別の時間を選んでください。",available:""}[state];
  }
  function sanitize(value) {
    if (!Array.isArray(value)) return [];
    return value.filter(b=>b && typeof b.id==="string" && b.id.length<=100 && staff.some(s=>s.id===b.staff) && validDate(b.date) && !closed(b.date) && times.includes(b.time) && services.includes(b.service) && typeof b.nickname==="string" && b.nickname.trim().length>0 && b.nickname.length<=40);
  }
  const api={staff,services,times,today,validDate,closed,occupied,slotState,validate,sanitize};
  if (typeof module!=="undefined" && module.exports) module.exports=api;
  else root.NagiBooking=api;
})(typeof window!=="undefined"?window:globalThis);
