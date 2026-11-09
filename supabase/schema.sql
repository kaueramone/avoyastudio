-- Initial Avoya Studio schema. Run against the dedicated Avoya project only.
begin;
create table if not exists public.admin_users (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
create policy admin_self_read on public.admin_users for select to authenticated
using (email = (select auth.jwt()->>'email'));
insert into public.admin_users (email) values ('contact@avoyastudio.com') on conflict do nothing;

create or replace function public.is_store_admin() returns boolean language sql stable security invoker set search_path = '' as $$
  select auth.uid() is not null and exists (select 1 from public.admin_users where email = (select auth.jwt()->>'email'));
$$;
revoke all on function public.is_store_admin() from public;
grant execute on function public.is_store_admin() to authenticated;

create table if not exists public.products (
  id text primary key check (id ~ '^[a-zA-Z0-9_-]{1,64}$'),
  name text not null check (length(name) between 1 and 120),
  subtitle text not null default '', family text not null default 'Frescas',
  notes text not null default '', price numeric(10,2) not null check (price >= 0 and price <= 99999),
  size text not null default '', image text not null default 'assets/hero.webp',
  mood text not null default '', description text not null default '',
  status text not null default 'draft' check (status in ('published','draft','archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.products enable row level security;
revoke all on public.products from anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert, update on public.products to authenticated;
create policy public_products on public.products for select to anon using (status='published');
create policy member_products_read on public.products for select to authenticated using (status='published' or (select public.is_store_admin()));
create policy admin_products_insert on public.products for insert to authenticated with check ((select public.is_store_admin()));
create policy admin_products_update on public.products for update to authenticated using ((select public.is_store_admin())) with check ((select public.is_store_admin()));

create table if not exists public.site_content (
  id text primary key check (id='site'), data jsonb not null default '{}', updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;
revoke all on public.site_content from anon, authenticated;
grant select on public.site_content to anon, authenticated;
grant update on public.site_content to authenticated;
create policy public_content_read on public.site_content for select to anon, authenticated using (true);
create policy admin_content_update on public.site_content for update to authenticated using ((select public.is_store_admin())) with check ((select public.is_store_admin()));

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(), path text not null unique, url text not null,
  name text not null, alt text not null default '', created_at timestamptz not null default now()
);
alter table public.media enable row level security;
revoke all on public.media from anon, authenticated;
grant select, insert on public.media to authenticated;
create policy admin_media_read on public.media for select to authenticated using ((select public.is_store_admin()));
create policy admin_media_insert on public.media for insert to authenticated with check ((select public.is_store_admin()));

create or replace function public.update_timestamp() returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.updated_at=now(); return new; end;
$$;
create trigger products_updated before update on public.products for each row execute function public.update_timestamp();
create trigger content_updated before update on public.site_content for each row execute function public.update_timestamp();

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('avoya-media','avoya-media',true,5242880,array['image/jpeg','image/png','image/webp','image/avif']) on conflict (id) do nothing;
create policy admin_media_upload on storage.objects for insert to authenticated
with check (bucket_id='avoya-media' and (select public.is_store_admin()));
create policy admin_media_list on storage.objects for select to authenticated
using (bucket_id='avoya-media' and (select public.is_store_admin()));
-- No delete or overwrite policies: replacement uses new paths; previous images stay recoverable.
commit;
