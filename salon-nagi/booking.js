/* ブラウザーに予約を保存する練習用デモです。実際の予約受付ではありません。 */
(function () {
  "use strict";
  const M=window.NagiBooking, KEY="nagi-booking-demo-v1";
  const $=id=>document.getElementById(id);
  let chosenTime="", writable=true;
  function message(text,error=false) { $("message").textContent=text; $("message").classList.toggle("error",error); }
  function read() {
    try { return M.sanitize(JSON.parse(localStorage.getItem(KEY)||"[]")); }
    catch(e) { writable=false; message("保存データを読み込めません。ブラウザーの保存設定をご確認ください。",true); return []; }
  }
  function write(bookings) {
    try { localStorage.setItem(KEY,JSON.stringify(bookings)); return true; }
    catch(e) { writable=false; message("予約を保存できませんでした。ブラウザーの保存設定をご確認ください。",true); return false; }
  }
  function person() { return document.querySelector('input[name="staff"]:checked')?.value || ""; }
  function name(id) { return M.staff.find(s=>s.id===id)?.name || ""; }
  function addText(parent,tag,text,className) { const el=document.createElement(tag); el.textContent=text; if(className)el.className=className; parent.append(el); return el; }
  function summary() {
    $("summary").replaceChildren();
    const rows=[["担当者",name(person())||"未選択"],["メニュー",$("service").value],["日時",$("date").value+(chosenTime?" "+chosenTime+"〜（30分）":" ／ 時間未選択")],["指名料","100円"]];
    for(const [k,v] of rows){const row=document.createElement("div");addText(row,"dt",k);addText(row,"dd",v);$("summary").append(row);}
    $("save-booking").disabled=!writable || !chosenTime;
  }
  function slots() {
    const bookings=read(), date=$("date").value, who=person(), now=new Date();
    if (chosenTime && M.slotState(who,date,chosenTime,bookings,now)!=="available") chosenTime="";
    $("slots").replaceChildren();
    if(!M.validDate(date)){ $("availability-note").textContent="予約日を選んでください。"; summary(); return; }
    if(M.closed(date)){ $("availability-note").textContent="火曜日は定休日です。別の日付を選んでください。"; summary(); return; }
    $("availability-note").textContent=name(who)+" ／ "+date+" の空き時間";
    for(const time of M.times){
      const state=M.slotState(who,date,time,bookings,now), b=document.createElement("button");
      b.type="button";b.className="slot";b.textContent=time;b.disabled=state!=="available";b.setAttribute("aria-pressed",String(time===chosenTime));
      const label={available:"空き",booked:"予約済み",past:"受付終了",invalid:"選択不可",closed:"定休日"}[state];addText(b,"small",label);
      b.setAttribute("aria-label",time+" "+label);
      b.addEventListener("click",()=>{chosenTime=time; slots(); const target=Array.from($("slots").children).find(x=>x.getAttribute("aria-pressed")==="true");target?.focus();});
      $("slots").append(b);
    }
    if(!Array.from($("slots").children).some(b=>!b.disabled)) $("availability-note").textContent="この担当者・日付の空き枠はありません。別の担当者か日付を選んでください。";
    summary();
  }
  function saved() {
    const list=read().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));$("saved-bookings").replaceChildren();
    if(!list.length){addText($("saved-bookings"),"li","まだデモ予約はありません。");return;}
    for(const booking of list){
      const li=document.createElement("li"), info=document.createElement("div");
      addText(info,"strong",booking.date+" "+booking.time+"〜 ／ "+name(booking.staff));
      addText(info,"p",booking.service+" ／ "+booking.nickname+" ／ 合計600円（指名料100円含む）");li.append(info);
      const cancel=addText(li,"button","キャンセル","cancel");cancel.type="button";cancel.setAttribute("aria-label",booking.date+" "+booking.time+" "+name(booking.staff)+"のデモ予約をキャンセル");
      cancel.addEventListener("click",()=>{if(write(read().filter(b=>b.id!==booking.id))){message("デモ予約をキャンセルしました。時間枠が空きました。");slots();saved();}});
      $("saved-bookings").append(li);
    }
  }
  const requestedStaff=new URLSearchParams(location.search).get("staff");
  const defaultStaff=M.staff.some(s=>s.id===requestedStaff)?requestedStaff:M.staff[0].id;
  for(const [i,staff] of M.staff.entries()){
    const label=document.createElement("label");label.className="staff-choice";
    const radio=document.createElement("input");radio.type="radio";radio.name="staff";radio.value=staff.id;radio.checked=staff.id===defaultStaff;radio.required=true;label.append(radio);
    const card=document.createElement("span");card.className="staff-card";addText(card,"strong",staff.name);addText(card,"span",staff.style);addText(card,"small","指名料 ¥100");label.append(card);
    radio.addEventListener("change",()=>{chosenTime="";slots();});$("staff-options").append(label);
  }
  for(const service of M.services){const o=document.createElement("option");o.value=service;o.textContent=service+" ／ ¥500";$("service").append(o);}
  const today=M.today();$("date").min=today;
  let initial=today;if(M.closed(initial)){const d=new Date(initial+"T00:00:00Z");d.setUTCDate(d.getUTCDate()+1);initial=d.toISOString().slice(0,10);}$("date").value=initial;
  $("date").addEventListener("change",()=>{chosenTime="";slots();});$("service").addEventListener("change",summary);
  $("booking-form").addEventListener("submit",event=>{
    event.preventDefault();if(!writable)return;
    const bookings=read();if(!writable)return;
    const record={id:(globalThis.crypto?.randomUUID?.() || Date.now()+"-"+Math.random()),staff:person(),service:$("service").value,date:$("date").value,time:chosenTime,nickname:$("nickname").value.trim()};
    const error=M.validate(record,bookings);if(error){message(error,true);slots();return;}
    if(write([...bookings,record])){chosenTime="";message("デモ予約を保存しました。実際の来店予約ではありません。");slots();saved();$("message").scrollIntoView({block:"center",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});}
  });
  window.addEventListener("storage",e=>{if(e.key===KEY || e.key===null){slots();saved();}});
  // ページを開いたままでも、過去になった時間枠を更新します。
  setInterval(slots,60000);
  slots();saved();
})();
