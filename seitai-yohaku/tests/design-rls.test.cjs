const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {PGlite}=require(process.env.PGLITE_MODULE||'@electric-sql/pglite');
(async()=>{
 const db=new PGlite();await db.exec(`
 create role anon nologin;create role authenticated nologin;
 create schema auth;create schema storage;
 create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text);
 alter table storage.objects enable row level security;
 grant usage on schema public,auth,storage to authenticated,anon;
 grant select,insert on storage.objects to authenticated;
 `);
 const root=path.resolve(__dirname,'..');await db.exec(fs.readFileSync(path.join(root,'supabase/migrations/202610170001_design_editor.sql'),'utf8'));
 await db.exec("grant select,insert,update,delete on storage.objects to authenticated,anon;create policy broad_existing_policy on storage.objects for all to authenticated,anon using(true) with check(true);");
 const a='00000000-0000-4000-8000-000000000001',b='00000000-0000-4000-8000-000000000002',ua='10000000-0000-4000-8000-000000000001',ub='10000000-0000-4000-8000-000000000002';
 const design=JSON.parse(fs.readFileSync(path.join(root,'supabase/default-design.json'),'utf8'));
 await db.query('insert into auth.users(id) values($1),($2)',[ua,ub]);await db.query("insert into public.design_tenants(id,name) values($1,'架空A'),($2,'架空B')",[a,b]);await db.query('insert into public.design_tenant_owners(tenant_id,user_id) values($1,$2),($3,$4)',[a,ua,b,ub]);
 for(const tenant of [a,b])await db.query('insert into public.design_documents(tenant_id,draft,staged) values($1,$2::jsonb,$2::jsonb)',[tenant,JSON.stringify(design)]);
 async function actor(role,uid,fn){await db.exec('set role '+role);await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid||'']);try{return await fn();}finally{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub','',false)");}}
 await actor('anon',null,async()=>{await assert.rejects(()=>db.query('select * from public.design_documents'));await assert.rejects(()=>db.query("select public.update_design_document($1,0,'simulate-publish',null)",[a]));});
 await actor('authenticated',ua,async()=>{
  const rows=await db.query('select tenant_id from public.design_documents');assert.deepEqual(rows.rows.map(r=>r.tenant_id),[a]);
  await assert.rejects(()=>db.query("update public.design_documents set revision=99 where tenant_id=$1",[a]));
  await assert.rejects(()=>db.query('insert into public.design_tenant_owners values($1,$2)',[b,ua]));
  await assert.rejects(()=>db.query("select public.update_design_document($1,0,'simulate-publish',null)",[b]));
  const changed=structuredClone(design);changed.hero.headline='保存だけでは公開しない';
  await db.query("select public.update_design_document($1,0,'save',$2::jsonb)",[a,JSON.stringify(changed)]);
  let current=(await db.query('select * from public.design_documents where tenant_id=$1',[a])).rows[0];assert.equal(current.revision,1);assert.equal(current.staged.hero.headline,design.hero.headline);
  await assert.rejects(()=>db.query("select public.update_design_document($1,0,'save',$2::jsonb)",[a,JSON.stringify(design)]));
  await assert.rejects(()=>db.query("select public.update_design_document($1,null,'save',$2::jsonb)",[a,JSON.stringify(design)]));
  for(const change of [d=>d.theme.font=null,d=>d.hero.headline=null,d=>d.layout.cards=null,d=>d.sections[0].id=null,d=>d.theme.text=d.theme.background,d=>d.extra='bad',d=>d.hero.image={kind:'stored',path:b+'/'+a+'.webp'}]){const invalid=structuredClone(design);change(invalid);assert.equal((await db.query('select public.design_settings_valid($1::jsonb,$2) as valid',[JSON.stringify(invalid),a])).rows[0].valid,false);await assert.rejects(()=>db.query("select public.update_design_document($1,1,'save',$2::jsonb)",[a,JSON.stringify(invalid)]));}
  await db.query("select public.update_design_document($1,1,'simulate-publish',null)",[a]);
  current=(await db.query('select * from public.design_documents where tenant_id=$1',[a])).rows[0];assert.equal(current.staged.hero.headline,changed.hero.headline);
  await db.query("select public.update_design_document($1,2,'restore',$2::jsonb)",[a,JSON.stringify(design)]);current=(await db.query('select * from public.design_documents where tenant_id=$1',[a])).rows[0];assert.equal(current.staged.hero.headline,changed.hero.headline);assert.equal(current.draft.hero.headline,design.hero.headline);
  assert.equal((await db.query('select * from public.design_audit')).rows.length,3);
  await db.query("insert into storage.objects(bucket_id,name) values('design-images',$1)",[a+'/'+a+'.webp']);
  await assert.rejects(()=>db.query("insert into storage.objects(bucket_id,name) values('design-images',$1)",[b+'/'+b+'.webp']));
  assert.equal((await db.query("delete from storage.objects where bucket_id='design-images' returning id")).rows.length,0);
  assert.equal((await db.query("update storage.objects set name='tampered.webp' where bucket_id='design-images' returning id")).rows.length,0);
 });
 await actor('authenticated',ub,async()=>{assert.deepEqual((await db.query('select tenant_id from public.design_documents')).rows.map(r=>r.tenant_id),[b]);assert.equal((await db.query('select * from storage.objects')).rows.length,0);assert.equal((await db.query('select * from public.design_audit')).rows.length,0);});
 await actor('authenticated','10000000-0000-4000-8000-000000000099',async()=>assert.equal((await db.query('select * from public.design_documents')).rows.length,0));
 await actor('anon',null,async()=>assert.equal((await db.query('select * from storage.objects')).rows.length,0));
 await db.close();console.log('PASS (local PostgreSQL-compatible engine): migration/functions, unauthenticated and cross-tenant denial, no self-granted membership or direct writes, schema/contrast/null rejection, revision conflicts, staged publish/restore, private image paths and owner-only audit. Supabase hosting/Auth/Storage endpoints are not live-tested.');
})().catch(e=>{console.error(e);process.exit(1)});
