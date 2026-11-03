begin;
select plan(14);

insert into auth.users (id, instance_id, aud, role, email) values
('10000000-0000-4000-8000-0000000000e1','00000000-0000-0000-0000-000000000000','authenticated','authenticated','entitled@test.local');
insert into stockkit.vendors (id, name) values ('10000000-0000-4000-8000-0000000000e1', 'Entitled');

select has_table('stockkit', 'vendor_entitlements', 'stockkit.vendor_entitlements exists');
select ok((select relrowsecurity from pg_class where oid = 'stockkit.vendor_entitlements'::regclass), 'RLS on vendor_entitlements');
select ok(not has_function_privilege('authenticated', 'stockkit.apply_vendor_entitlement(text,text,boolean,text,timestamptz,timestamptz)', 'execute'), 'authenticated cannot apply an entitlement');
select ok(has_function_privilege('service_role', 'stockkit.apply_vendor_entitlement(text,text,boolean,text,timestamptz,timestamptz)', 'execute'), 'service_role can apply an entitlement');

select is(stockkit.apply_vendor_entitlement('nobody@test.local', 'paid', false, '24h', null, '2026-11-01T00:00:00Z'), 'unknown_vendor', 'unknown email is reported');
select is(stockkit.active_product_cap('10000000-0000-4000-8000-0000000000e1'), 20, 'no cache row means the free cap');

select is(stockkit.apply_vendor_entitlement('Entitled@Test.Local', 'paid', false, '24h', '2099-01-01T00:00:00Z', '2026-11-01T00:00:00Z'), 'stored', 'first push is stored, email matched case-insensitively');
select is(stockkit.active_product_cap('10000000-0000-4000-8000-0000000000e1'), null, 'a live paid row lifts the cap');

select is(stockkit.apply_vendor_entitlement('entitled@test.local', 'free', false, '24h', null, '2026-11-01T00:00:00Z'), 'stale', 'an equal issued_at is a no-op');
select is(stockkit.apply_vendor_entitlement('entitled@test.local', 'free', false, '24h', null, '2026-10-01T00:00:00Z'), 'stale', 'an older issued_at is a no-op');
select is((select tier from stockkit.vendor_entitlements), 'paid', 'a stale push leaves the stored tier alone');

select is(stockkit.apply_vendor_entitlement('entitled@test.local', 'paid', false, '24h', '2000-01-01T00:00:00Z', '2026-11-02T00:00:00Z'), 'stored', 'a newer push replaces the row');
select is(stockkit.active_product_cap('10000000-0000-4000-8000-0000000000e1'), 20, 'a lapsed valid_until falls back to the free cap with no push');

update stockkit.vendor_entitlements set valid_until = null;
select is(stockkit.active_product_cap('10000000-0000-4000-8000-0000000000e1'), null, 'a paid row with a null valid_until is open-ended');

select * from finish();
rollback;
