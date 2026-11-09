begin;
-- Supabase may assign default table grants; expose only what the UI needs.
revoke all on public.commerce_settings from anon, authenticated;
grant select on public.commerce_settings to anon, authenticated;
grant update(origin_postcode,portugal_cents,europe_cents,brazil_cents,eur_brl,rate_date,max_weight_g,updated_at) on public.commerce_settings to authenticated;
grant all on public.commerce_settings to service_role;
commit;
