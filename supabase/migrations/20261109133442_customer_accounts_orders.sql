begin;

create table public.customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  full_name text not null default '' check (length(full_name) <= 120),
  phone text not null default '' check (length(phone) <= 30),
  updated_at timestamptz not null default now()
);
alter table public.customer_profiles enable row level security;
revoke all on public.customer_profiles from anon, authenticated;
grant select, insert on public.customer_profiles to authenticated;
grant update (full_name, phone) on public.customer_profiles to authenticated;
create policy customer_profile_read on public.customer_profiles for select to authenticated
using ((select auth.uid()) = user_id);
create policy customer_profile_insert on public.customer_profiles for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy customer_profile_update on public.customer_profiles for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create trigger customer_profiles_updated before update on public.customer_profiles
for each row execute function public.update_timestamp();

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('AV-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),
  user_id uuid not null references auth.users(id) on delete restrict,
  customer_email text not null,
  checkout_key uuid not null,
  status text not null default 'pending' check (status in ('pending','payment_processing','confirmed','preparing','shipped','delivered','cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','processing','paid','failed','partially_refunded','refunded')),
  currency text not null default 'eur' check (currency='eur'),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  shipping_cents integer not null check (shipping_cents >= 0),
  total_cents integer not null check (total_cents = subtotal_cents + shipping_cents),
  refunded_cents integer not null default 0 check (refunded_cents between 0 and total_cents),
  items jsonb not null check (jsonb_typeof(items)='array' and jsonb_array_length(items) between 1 and 30),
  is_test boolean not null default true,
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  shipping_details jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, checkout_key)
);
create index orders_user_created on public.orders (user_id, created_at desc);
create index orders_payment_intent on public.orders (stripe_payment_intent_id) where stripe_payment_intent_id is not null;
alter table public.orders enable row level security;
revoke all on public.orders from anon, authenticated;
grant select on public.orders to authenticated;
create policy customer_orders_read on public.orders for select to authenticated
using ((select auth.uid()) = user_id or (select public.is_store_admin()));
create trigger orders_updated before update on public.orders
for each row execute function public.update_timestamp();

-- Only the server writes orders, payment states and verified webhook events.
create table public.payment_events (
  id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);
alter table public.payment_events enable row level security;
revoke all on public.payment_events from anon, authenticated;
grant all on public.orders, public.payment_events, public.customer_profiles to service_role;
commit;
