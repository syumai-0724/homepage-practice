-- オーナー専用のテスト保存領域。一般公開するテーブル・ポリシーは作成しません。
create table public.design_tenants (id uuid primary key default gen_random_uuid(), name text not null check(char_length(name) between 1 and 100));
create table public.design_tenant_owners (tenant_id uuid not null references public.design_tenants(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, primary key(tenant_id,user_id));

create function public.is_design_owner(p_tenant uuid) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from public.design_tenant_owners where tenant_id=p_tenant and user_id=auth.uid());
$$;
revoke all on function public.is_design_owner(uuid) from public;
grant execute on function public.is_design_owner(uuid) to authenticated;

create function public.design_exact_keys(v jsonb, expected text[]) returns boolean language sql immutable set search_path=public,pg_temp as $$
 select case when jsonb_typeof(v)='object' then
 (select array_agg(key order by key) from jsonb_object_keys(v) key)=(select array_agg(key order by key) from unnest(expected) key)
 else false end;
$$;
create function public.design_text(v jsonb, maximum integer) returns boolean language sql immutable as $$
 select coalesce(jsonb_typeof(v)='string' and char_length(v#>>'{}') between 1 and maximum and char_length(btrim(v#>>'{}'))>0
 and regexp_replace(v#>>'{}', E'[\n\r\t]', '', 'g') !~ '[[:cntrl:]]',false);
$$;
create function public.design_luminance(c text) returns double precision language plpgsql immutable as $$
 declare r double precision; result double precision:=0; i integer;
 begin
 if c !~ '^#[0-9A-Fa-f]{6}$' then return 0; end if;
 for i in 0..2 loop
 r:=get_byte(decode(substr(c,2),'hex'),i)/255.0;
 r:=case when r<=0.04045 then r/12.92 else power((r+0.055)/1.055,2.4) end;
 result:=result+r*(case i when 0 then 0.2126 when 1 then 0.7152 else 0.0722 end);
 end loop; return result;
 end;
$$;
create function public.design_settings_valid(d jsonb,p_tenant uuid) returns boolean language plpgsql immutable set search_path=public,pg_temp as $$
 declare t jsonb; l jsonb; h jsonb; s jsonb; block jsonb; color text; seen text[]:='{}'; ids text[]:=array['news','about','menu','first-visit','staff','faq','access','reservation']; a double precision; b double precision;
 begin
 if not public.design_exact_keys(d,array['schemaVersion','theme','layout','hero','sections']) or d->'schemaVersion' is distinct from '1'::jsonb then return false; end if;
 t:=d->'theme';l:=d->'layout';h:=d->'hero';s:=d->'sections';
 if not public.design_exact_keys(t,array['main','background','text','accent','font','button','spacing']) then return false; end if;
 foreach color in array array['main','background','text','accent'] loop if jsonb_typeof(t->color)<>'string' or t->>color !~ '^#[0-9A-Fa-f]{6}$' then return false; end if; end loop;
 if not(coalesce(t->>'font','')=any(array['classic','modern','soft'])) or not(coalesce(t->>'button','')=any(array['square','rounded','pill'])) or not(coalesce(t->>'spacing','')=any(array['compact','standard','airy'])) then return false; end if;
 a:=public.design_luminance(t->>'text');b:=public.design_luminance(t->>'background');if (greatest(a,b)+0.05)/(least(a,b)+0.05)<4.5 then return false; end if;
 if not public.design_exact_keys(l,array['template','imagePosition','columns','cards']) or not(coalesce(l->>'template','')=any(array['calm','editorial','compact'])) or not(coalesce(l->>'imagePosition','')=any(array['left','right'])) or not(coalesce(l->>'columns','')=any(array['auto','one','two'])) or not(coalesce(l->>'cards','')=any(array['flat','outlined','soft'])) then return false; end if;
 if not public.design_exact_keys(h,array['headline','subcopy','bookingLabel','image','alt']) or not public.design_text(h->'headline',80) or not public.design_text(h->'subcopy',200) or not public.design_text(h->'bookingLabel',24) or not public.design_text(h->'alt',140) then return false; end if;
 if h->'image'->>'kind'='default' then
 if not public.design_exact_keys(h->'image',array['kind']) then return false; end if;
 elsif h->'image'->>'kind'='stored' then
 if not public.design_exact_keys(h->'image',array['kind','path']) or h->'image'->>'path' !~ ('^'||p_tenant::text||'/[0-9a-f-]{36}\.webp$') then return false; end if;
 else return false; end if;
 if jsonb_typeof(s)<>'array' then return false; end if;
 if jsonb_array_length(s)<>8 then return false; end if;
 for block in select value from jsonb_array_elements(s) loop
 if not public.design_exact_keys(block,array['id','visible','heading','description']) or not(coalesce(block->>'id','')=any(ids)) or block->>'id'=any(seen) or jsonb_typeof(block->'visible')<>'boolean' or not public.design_text(block->'heading',80) or not public.design_text(block->'description',500) then return false; end if;
 seen:=array_append(seen,block->>'id');
 end loop;
 return true;
 exception when others then return false;
 end;
$$;
create table public.design_documents (
 tenant_id uuid primary key references public.design_tenants(id) on delete cascade,
 revision integer not null default 0 check(revision>=0), draft jsonb not null, staged jsonb not null,
 history jsonb not null default '[]'::jsonb check(jsonb_typeof(history)='array' and jsonb_array_length(history)<=10),
 updated_at timestamptz not null default now(),
 check(public.design_settings_valid(draft,tenant_id)),check(public.design_settings_valid(staged,tenant_id))
);
create table public.design_audit (id bigint generated always as identity primary key,tenant_id uuid not null references public.design_tenants(id),actor uuid not null,action text not null check(action in ('save','restore','simulate-publish')),revision integer not null,created_at timestamptz not null default now());

alter table public.design_tenants enable row level security;
alter table public.design_tenant_owners enable row level security;
alter table public.design_documents enable row level security;
alter table public.design_audit enable row level security;
revoke all on public.design_tenants,public.design_tenant_owners,public.design_documents,public.design_audit from anon,authenticated;
grant select on public.design_tenants,public.design_tenant_owners,public.design_documents,public.design_audit to authenticated;
create policy "owner memberships only" on public.design_tenant_owners for select to authenticated using(user_id=auth.uid());
create policy "owner tenants only" on public.design_tenants for select to authenticated using(public.is_design_owner(id));
create policy "owner documents only" on public.design_documents for select to authenticated using(public.is_design_owner(tenant_id));
create policy "owner audit only" on public.design_audit for select to authenticated using(public.is_design_owner(tenant_id));
-- UPDATE/INSERT/DELETE権限・ポリシーを一般利用者には与えず、検証付きRPCだけで更新。
create function public.update_design_document(p_tenant uuid,p_revision integer,p_action text,p_settings jsonb default null) returns void language plpgsql security definer set search_path=public,pg_temp as $$
 declare doc public.design_documents%rowtype; target jsonb; versions jsonb; v jsonb;
 begin
 if auth.uid() is null or not public.is_design_owner(p_tenant) then raise exception 'not authorized' using errcode='42501';end if;
 if coalesce(p_action,'') not in ('save','restore','simulate-publish') then raise exception 'invalid action';end if;
 select * into doc from public.design_documents where tenant_id=p_tenant for update;
 if not found then raise exception 'document missing';end if;
 if p_revision is null or doc.revision<>p_revision then raise exception 'revision conflict' using errcode='40001';end if;
 target:=case when p_action='simulate-publish' then doc.draft else p_settings end;
 if target is null or not public.design_settings_valid(target,p_tenant) then raise exception 'invalid design';end if;
 v:=jsonb_build_object('id',gen_random_uuid()::text,'at',now(),'action',p_action,'settings',target);
 select coalesce(jsonb_agg(value order by ordinality),'[]'::jsonb) into versions from jsonb_array_elements(jsonb_build_array(v)||doc.history) with ordinality where ordinality<=10;
 update public.design_documents set draft=target,staged=case when p_action='simulate-publish' then target else doc.staged end,history=versions,revision=doc.revision+1,updated_at=now() where tenant_id=p_tenant;
 insert into public.design_audit(tenant_id,actor,action,revision) values(p_tenant,auth.uid(),p_action,doc.revision+1);
 end;
$$;
revoke all on function public.update_design_document(uuid,integer,text,jsonb) from public;
grant execute on function public.update_design_document(uuid,integer,text,jsonb) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('design-images','design-images',false,1500000,array['image/webp']) on conflict(id) do nothing;
do $$begin if exists(select 1 from storage.buckets where id='design-images' and (public or file_size_limit is distinct from 1500000 or allowed_mime_types is distinct from array['image/webp'])) then raise exception 'design-images must be private and restricted to WebP/1500000 bytes';end if;end$$;
create function public.owns_design_image(p_path text) returns boolean language plpgsql stable security definer set search_path=public,pg_temp as $$
 begin
 if p_path !~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.webp$' then return false;end if;
 return public.is_design_owner(split_part(p_path,'/',1)::uuid);
 exception when others then return false;
 end;
$$;
revoke all on function public.owns_design_image(text) from public;
grant execute on function public.owns_design_image(text) to authenticated;
create policy "owner reads private design images" on storage.objects for select to authenticated using(bucket_id='design-images' and public.owns_design_image(name));
create policy "owner uploads own design images" on storage.objects for insert to authenticated with check(bucket_id='design-images' and public.owns_design_image(name));
-- 履歴から参照される画像の削除・上書き権限は付けない。
-- 別アプリの広いStorageポリシーが既存でも、このバケットの制限を緩めない。
create policy "design images deny anonymous" on storage.objects as restrictive for all to anon using(bucket_id<>'design-images') with check(bucket_id<>'design-images');
create policy "design images restrict reads" on storage.objects as restrictive for select to authenticated using(bucket_id<>'design-images' or public.owns_design_image(name));
create policy "design images restrict inserts" on storage.objects as restrictive for insert to authenticated with check(bucket_id<>'design-images' or public.owns_design_image(name));
create policy "design images immutable updates" on storage.objects as restrictive for update to authenticated using(bucket_id<>'design-images') with check(bucket_id<>'design-images');
create policy "design images immutable deletes" on storage.objects as restrictive for delete to authenticated using(bucket_id<>'design-images');
