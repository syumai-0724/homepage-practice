/* 予約とお休みはこのブラウザー内だけに保存します。 */
(function(){
 "use strict";
 const M=window.NagiBooking,KEY="nagi-booking-demo-v1",HKEY="nagi-booking-holidays-v1",$=id=>document.getElementById(id);
 let chosenTime="",writable=true;
 function message(text,error=false){$("message").textContent=text;$("message").classList.toggle("error",error);}
 function read(key=KEY){try{const value=JSON.parse(localStorage.getItem(key)||"[]");return key===KEY?M.sanitize(value):M.sanitizeHolidays(value);}catch(e){writable=false;message("保存データを読み込めません。ブラウザーの保存設定をご確認ください。",true);return [];}}
 function write(value,key=KEY){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(e){writable=false;message("保存できませんでした。ブラウザーの保存設定をご確認ください。",true);return false;}}
 function person(){return document.querySelector('input[name="staff"]:checked')?.value||"";}
 function name(id){return M.staff.find(s=>s.id===id)?.name||"";}
 function selected(){return Array.from(document.querySelectorAll('input[name="services"]:checked')).map(x=>x.value);}
 function text(parent,tag,value,cls){const el=document.createElement(tag);el.textContent=value;if(cls)el.className=cls;parent.append(el);return el;}
 function summary(){
  const chosen=selected();$("summary").replaceChildren();
  const rows=[["担当者",name(person())||"未選択"],["メニュー",chosen.join("・")||"未選択"],["日時",$("date").value+(chosenTime?" "+chosenTime+"〜"+M.endTime(chosenTime,chosen.length):" ／ 時間未選択")],["所要時間",chosen.length*30+"分"],["指名料","100円（1予約につき1回）"]];
  for(const [k,v] of rows){const row=document.createElement("div");text(row,"dt",k);text(row,"dd",v);$("summary").append(row);}
  $("total-price").textContent="¥"+(chosen.length*500+100).toLocaleString("ja-JP");$("save-booking").disabled=!writable||!chosenTime||!chosen.length;
 }
 function holidayState(holidays){const date=$("date").value,who=person(),isOff=M.off(holidays,who,date);$("holiday-state").textContent=name(who)+" ／ "+date+"："+(M.closed(date)?"火曜定休":isOff?"お休み":"出勤設定");$("toggle-holiday").textContent=isOff?"この担当者の休みを解除する":"この担当者を休みにする";$("toggle-holiday").disabled=!writable||!M.validDate(date)||M.closed(date);}
 function slots(){
  const bookings=read(),holidays=read(HKEY),date=$("date").value,who=person(),now=new Date(),count=selected().length;
  if(chosenTime&&M.slotState(who,date,chosenTime,bookings,now,count,holidays)!=="available")chosenTime="";
  $("slots").replaceChildren();holidayState(holidays);
  let note="";
  if(!M.validDate(date))note="予約日を選んでください。";
  else if(!count)note="メニューを1つ以上選んでください。";
  else if(M.closed(date))note="火曜日は定休日です。別の日付を選んでください。";
  else if(M.off(holidays,who,date))note=name(who)+"はこの日がお休みです。別の担当者か日付を選んでください。";
  if(note){$("availability-note").textContent=note;summary();return;}
  $("availability-note").textContent=name(who)+" ／ "+date+" ／ 必要な時間："+count*30+"分";
  for(const time of M.times){
   const state=M.slotState(who,date,time,bookings,now,count,holidays),b=document.createElement("button");b.type="button";b.className="slot";b.textContent=time;b.disabled=state!=="available";b.setAttribute("aria-pressed",String(time===chosenTime));
   const label={available:"空き",booked:"予約あり",past:"受付終了",short:"時間不足",invalid:"選択不可",closed:"定休日",off:"お休み"}[state];text(b,"small",label);b.setAttribute("aria-label",time+" "+label);
   b.addEventListener("click",()=>{chosenTime=time;slots();Array.from($("slots").children).find(x=>x.getAttribute("aria-pressed")==="true")?.focus();});$("slots").append(b);
  }
  if(!Array.from($("slots").children).some(b=>!b.disabled))$("availability-note").textContent="選んだメニューに必要な連続した空き時間がありません。別の担当者か日付を選んでください。";
  summary();
 }
 function saved(){
  const list=read().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));$("saved-bookings").replaceChildren();
  if(!list.length){text($("saved-bookings"),"li","まだデモ予約はありません。");return;}
  for(const booking of list){
   const li=document.createElement("li"),info=document.createElement("div");text(info,"strong",booking.date+" "+booking.time+"〜"+M.endTime(booking.time,booking.services.length)+" ／ "+name(booking.staff));text(info,"p",booking.services.join("・")+" ／ "+booking.nickname);text(info,"p",M.duration(booking)+"分 ／ 合計"+M.total(booking).toLocaleString("ja-JP")+"円（指名料100円含む）");li.append(info);
   const cancel=text(li,"button","キャンセル","cancel");cancel.type="button";cancel.setAttribute("aria-label",booking.date+" "+booking.time+" "+name(booking.staff)+"の予約をキャンセル");
   cancel.addEventListener("click",()=>{const current=read();if(!writable)return;if(write(current.filter(b=>b.id!==booking.id))){message("デモ予約をキャンセルしました。");slots();saved();}});$("saved-bookings").append(li);
  }
 }
 const requested=new URLSearchParams(location.search).get("staff"),defaultStaff=M.staff.some(s=>s.id===requested)?requested:M.staff[0].id;
 for(const staff of M.staff){
  const label=document.createElement("label");label.className="staff-choice";const radio=document.createElement("input");radio.type="radio";radio.name="staff";radio.value=staff.id;radio.checked=staff.id===defaultStaff;radio.required=true;label.append(radio);
  const card=document.createElement("span");card.className="staff-card";const img=document.createElement("img");img.src=staff.image;img.alt=staff.name+"のイメージイラスト";img.width=200;img.height=240;img.loading="lazy";card.append(img);text(card,"strong",staff.name);text(card,"span",staff.style);text(card,"small","指名料 ¥100");label.append(card);
  radio.addEventListener("change",()=>{chosenTime="";slots();});$("staff-options").append(label);
 }
 const groups=[["カット",0,3],["カラー",3,10],["パーマ・ストレート",10,15],["ヘアケア",15,18],["ヘアセット",18,21]];
 for(const [title,start,end] of groups){const group=document.createElement("details");group.className="service-group";group.open=start===0;text(group,"summary",title);const options=document.createElement("div");options.className="service-choices";for(const service of M.services.slice(start,end)){const label=document.createElement("label"),input=document.createElement("input");input.type="checkbox";input.name="services";input.value=service;input.checked=service==="カット";input.addEventListener("change",()=>{chosenTime="";slots();});label.append(input);text(label,"span",service+" ／ ¥500");options.append(label);}group.append(options);$("service-options").append(group);}
 const today=M.today();$("date").min=today;let initial=today;if(M.closed(initial)){const d=new Date(initial+"T00:00:00Z");d.setUTCDate(d.getUTCDate()+1);initial=d.toISOString().slice(0,10);}$("date").value=initial;
 $("date").addEventListener("change",()=>{chosenTime="";slots();});
 $("toggle-holiday").addEventListener("click",()=>{const holidays=read(HKEY),bookings=read(),who=person(),date=$("date").value;if(!writable||!M.validDate(date)||M.closed(date))return;const isOff=M.off(holidays,who,date);if(!isOff&&bookings.some(b=>b.staff===who&&b.date===date)){message("この担当者には当日の予約があります。先に該当の予約をキャンセルしてください。",true);return;}const changed=isOff?holidays.filter(h=>h.staff!==who||h.date!==date):[...holidays,{staff:who,date}];if(write(changed,HKEY)){chosenTime="";message(isOff?"担当者の休みを解除しました。":"選んだ担当者・日付をお休みに設定しました。");slots();}});
 $("booking-form").addEventListener("submit",event=>{event.preventDefault();if(!writable)return;const bookings=read(),holidays=read(HKEY);if(!writable)return;const record={id:globalThis.crypto?.randomUUID?.()||(Date.now()+"-"+Math.random()),staff:person(),services:selected(),date:$("date").value,time:chosenTime,nickname:$("nickname").value.trim()};const error=M.validate(record,bookings,new Date(),holidays);if(error){message(error,true);slots();return;}if(write([...bookings,record])){chosenTime="";message("デモ予約を保存しました。実際の来店予約ではありません。");slots();saved();$("message").scrollIntoView({block:"center",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});}});
 window.addEventListener("storage",e=>{if(e.key===KEY||e.key===HKEY||e.key===null){slots();saved();}});setInterval(slots,60000);slots();saved();
})();
