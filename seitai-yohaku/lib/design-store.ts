import { asDataUrl } from './design-images';
import { copyDesign, defaultDesign, designErrors, parseDesign, type DesignImage, type DesignSettings } from './design-model';
export type DesignVersion={id:string;at:string;action:'save'|'restore'|'simulate-publish';settings:DesignSettings};
export type DesignState={tenantId:string;revision:number;draft:DesignSettings;published:DesignSettings;history:DesignVersion[]};
export type DesignStore={mode:'demo'|'supabase';load():Promise<DesignState>;save(settings:DesignSettings,revision:number,action?:'save'|'restore'):Promise<DesignState>;publish(revision:number):Promise<DesignState>;upload(blob:Blob):Promise<DesignImage>;imageUrl(image:DesignImage):Promise<string|null>};
export const DEMO_TENANTS=[{id:'yohaku-demo',name:'整体室 余白（架空）'},{id:'kigi-demo',name:'余白・別店舗テスト（架空）'}];
function versionId(){if(crypto.randomUUID)return crypto.randomUUID();const b=crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;const s=Array.from(b,n=>n.toString(16).padStart(2,'0')).join('');return s.slice(0,8)+'-'+s.slice(8,12)+'-'+s.slice(12,16)+'-'+s.slice(16,20)+'-'+s.slice(20);}
const key=(id:string)=>'yohaku-design-demo-v1:'+id;
const initial=(id:string):DesignState=>({tenantId:id,revision:0,draft:copyDesign(defaultDesign),published:copyDesign(defaultDesign),history:[]});
export function readState(value:unknown,id:string):DesignState|null{
 if(!value||typeof value!=='object')return null;const s=value as DesignState;
 if(s.tenantId!==id||!Number.isSafeInteger(s.revision)||s.revision<0||!parseDesign(s.draft)||!parseDesign(s.published)||designErrors(s.draft).length||designErrors(s.published).length||!Array.isArray(s.history)||s.history.length>10)return null;
 if(s.history.some(v=>!v||typeof v.id!=='string'||typeof v.at!=='string'||Number.isNaN(Date.parse(v.at))||!['save','restore','simulate-publish'].includes(v.action)||!parseDesign(v.settings)||designErrors(v.settings).length))return null;
 return JSON.parse(JSON.stringify(s));
}
export function createDemoDesignStore(id:string,storage:Pick<Storage,'getItem'|'setItem'>):DesignStore {
 if(!DEMO_TENANTS.some(t=>t.id===id))throw Error('架空店舗を選んでください。');
 function load(){const data=storage.getItem(key(id));if(!data)return initial(id);let parsed;try{parsed=JSON.parse(data);}catch{throw Error('保存データを読み込めません。別の架空店舗でお試しください。');}const state=readState(parsed,id);if(!state)throw Error('保存データの形式が不正です。');return state;}
 function write(settings:DesignSettings,revision:number,action:DesignVersion['action']){
  const parsed=parseDesign(settings);if(!parsed||designErrors(parsed).length)throw Error('文字数・配色などのエラーを修正してください。');
  const state=load();if(state.revision!==revision)throw Error('別の画面で更新されています。再読込後に編集してください。');
  const at=new Date().toISOString(),version:DesignVersion={id:versionId(),at,action,settings:copyDesign(parsed)};
  const next:DesignState={...state,revision:state.revision+1,draft:copyDesign(parsed),published:action==='simulate-publish'?copyDesign(parsed):state.published,history:[version,...state.history].slice(0,10)};
  const encoded=JSON.stringify(next);if(encoded.length>4000000)throw Error('保存容量が不足しています。小さな画像に変更してください。');
  try{storage.setItem(key(id),encoded);}catch{throw Error('ブラウザーの保存容量が不足しているか、保存が許可されていません。変更は保持しています。');}
  if(typeof window!=='undefined')window.dispatchEvent(new Event('yohaku-design-demo-change'));
  return next;
 }
 return {mode:'demo',async load(){return load();},async save(settings,revision,action='save'){return write(settings,revision,action);},async publish(revision){return write(load().draft,revision,'simulate-publish');},async upload(blob){return {kind:'inline',data:await asDataUrl(blob)};},async imageUrl(image){return image.kind==='inline'?image.data:null;}};
}
export function readDemoPublished(storage:Pick<Storage,'getItem'>):DesignSettings|null {try{const raw=storage.getItem(key('yohaku-demo'));return raw?readState(JSON.parse(raw),'yohaku-demo')?.published||null:null;}catch{return null;}}
