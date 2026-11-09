begin;
-- Manual CTT tariffs, provisional packed weight and shop conversion rate.
create table public.commerce_settings (
  id text primary key check (id = 'shop'),
  origin_postcode text not null default '5340-262' check (origin_postcode ~ '^[0-9]{4}-[0-9]{3}$'),
  portugal_cents integer not null default 1580 check (portugal_cents between 0 and 100000),
  europe_cents integer not null default 3970 check (europe_cents between 0 and 100000),
  brazil_cents integer not null default 4750 check (brazil_cents between 0 and 100000),
  eur_brl numeric(10,4) not null default 6.1449 check (eur_brl between 0.1 and 100),
  rate_date date not null default '2026-11-06',
  max_weight_g integer not null default 1000 check (max_weight_g between 100 and 30000),
  updated_at timestamptz not null default now()
);
alter table public.commerce_settings enable row level security;
grant select on public.commerce_settings to anon, authenticated;
grant update(origin_postcode,portugal_cents,europe_cents,brazil_cents,eur_brl,rate_date,max_weight_g,updated_at) on public.commerce_settings to authenticated;
grant all on public.commerce_settings to service_role;
create policy "Public shipping settings" on public.commerce_settings for select to anon, authenticated using (true);
create policy "Administrators configure shipping" on public.commerce_settings for update to authenticated using ((select public.is_store_admin())) with check ((select public.is_store_admin()));
insert into public.commerce_settings(id) values ('shop');
alter table public.products add column packed_weight_g integer not null default 600 check (packed_weight_g between 1 and 30000);
alter table public.products add column translations jsonb not null default '{}'::jsonb check (jsonb_typeof(translations) = 'object');
alter table public.orders drop constraint orders_currency_check;
alter table public.orders add constraint orders_currency_check check (currency in ('eur','brl'));
alter table public.orders add column destination_country text not null default 'PT';
alter table public.orders add column language text not null default 'pt' check (language in ('pt','en','es'));
alter table public.orders add column shipping_quote jsonb not null default '{}'::jsonb;

commit;
