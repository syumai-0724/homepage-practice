import { menus } from './site-data';
export const schedule = { open: 600, close: 1200, step: 30, holiday: 3, horizon: 60 };
export type Selection = { menuId: string; date: string; time: number };
export type DemoRecord = Selection & { id: string; duration: number; price: number; status: 'confirmed' | 'cancelled' };
export type Person = { name: string; email: string; phone: string; request: string; consent: boolean };
export const emptyPerson = (): Person => ({ name: '', email: '', phone: '', request: '', consent: false });
const clockFormatter = new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
export function jstNow(now = new Date()) {
 const parts = clockFormatter.formatToParts(now);
 const get=(key:string)=>parts.find(p=>p.type===key)!.value;
 return { date: `${get('year')}-${get('month')}-${get('day')}`, minute: Number(get('hour'))*60+Number(get('minute')) };
}
export function validDate(value: string) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value+'T00:00:00Z')) && new Date(value+'T00:00:00Z').toISOString().slice(0,10) === value; }
export function addDays(value: string, days: number) { const d=new Date(value+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10); }
export function dateReason(value: string, now = new Date()) {
 if(!validDate(value))return '日付が不正です';
 const today=jstNow(now).date;
 if(value<today)return '過去の日付';
 if(value>addDays(today,schedule.horizon))return '受付期間外';
 if(new Date(value+'T00:00:00Z').getUTCDay()===schedule.holiday)return '仮定休日';
 return '';
}
export const timeLabel=(value:number)=>String(Math.floor(value/60)).padStart(2,'0')+':'+String(value%60).padStart(2,'0');
export function sampleBusy(date: string): [number,number][] { return Number(date.slice(-2))%2===0 ? [[720,780],[960,1020]] : [[750,810],[990,1050]]; }
export function slotReason(selection: Selection, records: DemoRecord[]=[], excludeId?: string, now = new Date()) {
 const m=menus.find(menu=>menu.id===selection.menuId);if(!m)return 'メニューを選択してください';
 const reason=dateReason(selection.date,now);if(reason)return reason;
 const {time,date}=selection;
 if(!Number.isInteger(time)||time<schedule.open||time% schedule.step!==0)return '受付時間外';
 if(time+m.duration>schedule.close)return '閉店時間を超えます';
 const current=jstNow(now);if(date===current.date&&time<=current.minute)return '開始時刻を過ぎています';
 const occupied=[...sampleBusy(date),...records.filter(r=>r.id!==excludeId&&r.status==='confirmed'&&r.date===date).map(r=>[r.time,r.time+r.duration] as [number,number])];
 if(occupied.some(([start,end])=>time<end&&time+m.duration>start))return '予約済みのサンプル';
 return '';
}
export function slots(date: string, menuId: string, records: DemoRecord[]=[], excludeId?:string, now=new Date()) { return Array.from({length:(schedule.close-schedule.open)/schedule.step},(_,i)=>{const time=schedule.open+i*schedule.step;return {time,label:timeLabel(time),reason:slotReason({date,time,menuId},records,excludeId,now)};}); }
export function monthDays(month: string) {
 const start=new Date(month+'-01T00:00:00Z'),count=new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()+1,0)).getUTCDate();
 return [...Array(start.getUTCDay()).fill(null),...Array.from({length:count},(_,i)=>month+'-'+String(i+1).padStart(2,'0'))] as (string|null)[];
}
export function shiftMonth(month: string, offset: number) {const d=new Date(month+'-01T00:00:00Z');d.setUTCMonth(d.getUTCMonth()+offset);return d.toISOString().slice(0,7);}
export function dateLabel(value: string) {if(!validDate(value))return '未選択';return new Intl.DateTimeFormat('ja-JP',{timeZone:'UTC',month:'long',day:'numeric',weekday:'short'}).format(new Date(value+'T00:00:00Z'));}
export function personErrors(person: Person) {
 const errors:Partial<Record<keyof Person,string>>={};
 if(!person.name.trim()||person.name.trim().length>60)errors.name='お名前を60文字以内で入力してください。';
 if(person.email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email.trim()))errors.email='メールアドレスの形式をご確認ください。';
 if(person.phone.trim()&&!/^\d{10,11}$/.test(person.phone.normalize('NFKC').replace(/[\s-]/g,'')))errors.phone='電話番号を10〜11桁で入力してください。';
 if(person.request.length>300)errors.request='ご要望は300文字以内にしてください。';
 if(!person.consent)errors.consent='デモについての確認にチェックしてください。';
 return errors;
}
