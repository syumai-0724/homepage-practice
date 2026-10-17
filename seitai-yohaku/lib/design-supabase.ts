import { parseDesign, designErrors, type DesignImage, type DesignSettings } from './design-model';
import { readState, type DesignState, type DesignStore } from './design-store';
export type SupabaseConfig={url:string;key:string};
export function designConnection():{kind:'demo'}|{kind:'invalid'}|{kind:'supabase';config:SupabaseConfig}{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL||'',key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'';
 if(!url&&!key)return {kind:'demo'};
 try{if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)||key.startsWith('sb_secret_'))return {kind:'invalid'};
 const anon=key.startsWith('sb_publishable_')||JSON.parse(atob((key.split('.')[1]||'').replace(/-/g,'+').replace(/_/g,'/'))).role==='anon';if(!anon)return {kind:'invalid'};
 return {kind:'supabase',config:{url,key}};
 }catch{return {kind:'invalid'};}
}
async function request(config:SupabaseConfig,path:string,token?:string,init:RequestInit={}){
 const response=await fetch(config.url+path,{...init,signal:AbortSignal.timeout(15000),headers:{apikey:config.key,Authorization:'Bearer '+(token||config.key),'Content-Type':'application/json',...init.headers}});
 if(!response.ok)throw Error(response.status===401?'ログインの有効期限が切れました。再ログインしてください。':response.status===403?'この店舗を編集する権限がありません。':'保存処理を完了できません。権限・設定・更新の競合をご確認ください。');
 return response.status===204?null:response.json();
}
export async function loginDesignOwner(config:SupabaseConfig,email:string,password:string){
 const session=await request(config,'/auth/v1/token?grant_type=password',undefined,{method:'POST',body:JSON.stringify({email,password})});
 const user=await request(config,'/auth/v1/user',session.access_token);
 const rows=await request(config,'/rest/v1/design_tenant_owners?select=tenant_id,design_tenants(name)&user_id=eq.'+encodeURIComponent(user.id),session.access_token);
 const tenants=(rows as {tenant_id:string;design_tenants:{name:string}|null}[]).map(r=>({id:r.tenant_id,name:r.design_tenants?.name||r.tenant_id}));
 if(!tenants.length)throw Error('編集を許可された店舗がありません。管理者にご確認ください。');
 return {token:String(session.access_token),tenants};
}
export function createSupabaseDesignStore(config:SupabaseConfig,token:string,tenantId:string):DesignStore{
 if(!/^[0-9a-f-]{36}$/i.test(tenantId))throw Error('店舗IDが不正です。');
 async function load(){const rows=await request(config,'/rest/v1/design_documents?select=*&tenant_id=eq.'+tenantId,token);if(!rows[0])throw Error('店舗のデザインが未登録です。初期データを設定してください。');
 const state=readState({tenantId,revision:rows[0].revision,draft:rows[0].draft,published:rows[0].staged,history:rows[0].history},tenantId);if(!state)throw Error('保存されたデザインを検証できません。');return state;}
 async function mutate(action:string,revision:number,settings?:DesignSettings){if(settings&&(!parseDesign(settings)||designErrors(settings).length))throw Error('入力エラーを修正してください。');await request(config,'/rest/v1/rpc/update_design_document',token,{method:'POST',body:JSON.stringify({p_tenant:tenantId,p_revision:revision,p_action:action,p_settings:settings||null})});return load();}
 return {mode:'supabase',load,save:(settings,revision,action='save')=>mutate(action,revision,settings),publish:revision=>mutate('simulate-publish',revision),async upload(blob){
  if(blob.type!=='image/webp'||blob.size>1500000)throw Error('画像形式・容量をご確認ください。');
  const path=tenantId+'/'+crypto.randomUUID()+'.webp';
  await request(config,'/storage/v1/object/design-images/'+path,token,{method:'POST',headers:{'Content-Type':'image/webp','x-upsert':'false'},body:blob});return {kind:'stored',path};
 },async imageUrl(image:DesignImage){if(image.kind==='inline')return image.data;if(image.kind!=='stored')return null;if(!image.path.startsWith(tenantId+'/'))throw Error('別の店舗の画像は使えません。');const data=await request(config,'/storage/v1/object/sign/design-images/'+image.path,token,{method:'POST',body:JSON.stringify({expiresIn:3600})});return config.url+'/storage/v1'+data.signedURL;}};
}
