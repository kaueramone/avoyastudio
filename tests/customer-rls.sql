-- Transactional fixtures: no users, profiles or orders survive this check.
begin;
insert into auth.users(id,aud,role,email,created_at,updated_at) values
('11111111-1111-4111-8111-111111111111','authenticated','authenticated','avoya-rls-1@example.invalid',now(),now()),
('22222222-2222-4222-8222-222222222222','authenticated','authenticated','avoya-rls-2@example.invalid',now(),now());
insert into public.customer_profiles(user_id,full_name) values
('11111111-1111-4111-8111-111111111111','RLS fixture one'),
('22222222-2222-4222-8222-222222222222','RLS fixture two');
insert into public.orders(user_id,customer_email,checkout_key,subtotal_cents,shipping_cents,total_cents,items) values
('11111111-1111-4111-8111-111111111111','avoya-rls-1@example.invalid',gen_random_uuid(),100,0,100,'[{"name":"Fixture","quantity":1,"unit_amount":100}]'),
('22222222-2222-4222-8222-222222222222','avoya-rls-2@example.invalid',gen_random_uuid(),200,0,200,'[{"name":"Fixture","quantity":1,"unit_amount":200}]');
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","email":"avoya-rls-1@example.invalid","role":"authenticated"}';
do $$
declare affected integer;
begin
  if (select count(*) from public.customer_profiles) <> 1 then raise exception 'Cross-customer profile visibility'; end if;
  if (select count(*) from public.orders) <> 1 then raise exception 'Cross-customer order visibility'; end if;
  if (select count(*) from public.orders where user_id='22222222-2222-4222-8222-222222222222') <> 0 then raise exception 'Foreign order visible by ID'; end if;
  update public.customer_profiles set full_name='Forbidden' where user_id='22222222-2222-4222-8222-222222222222';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Foreign profile can be edited'; end if;
  update public.customer_profiles set full_name='Own profile updated' where user_id='11111111-1111-4111-8111-111111111111';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Own profile cannot be edited'; end if;
  begin
    update public.orders set payment_status='paid';
    raise exception 'Client can mark orders paid';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.orders(user_id,customer_email,checkout_key,subtotal_cents,shipping_cents,total_cents,items) values
    ('11111111-1111-4111-8111-111111111111','fixture@example.invalid',gen_random_uuid(),1,0,1,'[{"name":"Tampered"}]');
    raise exception 'Client can insert orders';
  exception when insufficient_privilege then null; end;
  begin
    perform id from public.payment_events;
    raise exception 'Client can read private payment events';
  exception when insufficient_privilege then null; end;
  update public.commerce_settings set portugal_cents=0 where id='shop';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Customer can change shipping rates'; end if;
  if not exists (select 1 from public.commerce_settings where id='shop') then raise exception 'Public shipping rates unavailable'; end if;
  if (select public.is_store_admin()) then raise exception 'Customer has admin role'; end if;
end $$;
reset role;
set local role anon;
do $$ begin
  if not exists (select 1 from public.commerce_settings where id='shop') then raise exception 'Anonymous shipping rates unavailable'; end if;
  begin
    update public.commerce_settings set brazil_cents=0;
    raise exception 'Anonymous user can alter shipping';
  exception when insufficient_privilege then null; end;
end $$;
rollback;
