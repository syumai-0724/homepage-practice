import { menus } from './site-data';
import { slotReason, type Selection, type DemoRecord } from './booking-model';
/** 顧客情報を受け取らないデモ。実予約の競合制御・永続化・メール通知は未接続。 */
export interface ReservationService {
 list(): DemoRecord[];
 create(selection: Selection): Promise<DemoRecord>;
 change(id: string, selection: Selection): Promise<DemoRecord>;
 cancel(id: string): Promise<DemoRecord>;
}
export function createDemoReservationService(clock=()=>new Date()): ReservationService {
 const records=new Map<string,DemoRecord>();let sequence=0;
 const list=()=>Array.from(records.values()).map(r=>({...r}));
 function reserve(selection:Selection,id:string) {
  const reason=slotReason(selection,list(),id,clock());if(reason)throw Error(reason);
  const menu=menus.find(m=>m.id===selection.menuId)!;
  const record:DemoRecord={id,menuId:menu.id,date:selection.date,time:selection.time,duration:menu.duration,price:menu.price,status:'confirmed'};
  // 検証と占有はawaitを挟まず実行。同じデモ画面内の連打・重複だけを防ぎます。
  records.set(id,record);return {...record};
 }
 return {list,async create(selection){return reserve(selection,'DEMO-'+String(++sequence).padStart(4,'0'));},async change(id,selection){const old=records.get(id);if(!old||old.status!=='confirmed')throw Error('変更できるデモ予約がありません。');return reserve(selection,id);},async cancel(id){const old=records.get(id);if(!old)throw Error('デモ予約がありません。');const record={...old,status:'cancelled' as const};records.set(id,record);return {...record};}};
}
