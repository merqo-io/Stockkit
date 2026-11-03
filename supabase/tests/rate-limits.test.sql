begin;
select no_plan();

select has_table('stockkit', 'rate_limits', 'stockkit.rate_limits exists');
select is(
  (select relrowsecurity from pg_class where oid = 'stockkit.rate_limits'::regclass),
  true, 'rate_limits has row level security on');
select is(
  (select count(*)::int from pg_policies where schemaname = 'stockkit' and tablename = 'rate_limits'),
  0, 'rate_limits has no policies');

select is(has_function_privilege('anon', 'stockkit.check_rate_limit(text,int,int)', 'execute'), false, 'anon cannot execute check_rate_limit');
select is(has_function_privilege('authenticated', 'stockkit.check_rate_limit(text,int,int)', 'execute'), false, 'authenticated cannot execute check_rate_limit');
select is(has_function_privilege('service_role', 'stockkit.check_rate_limit(text,int,int)', 'execute'), true, 'service_role can execute check_rate_limit');

select is(stockkit.check_rate_limit('pgtap:a', 2, 3600), true, 'first hit allowed');
select is(stockkit.check_rate_limit('pgtap:a', 2, 3600), true, 'second hit allowed');
select is(stockkit.check_rate_limit('pgtap:a', 2, 3600), false, 'third hit over the limit denied');
select is(stockkit.check_rate_limit('pgtap:b', 2, 3600), true, 'other keys have their own bucket');
select throws_ok($$select stockkit.check_rate_limit('', 2, 3600)$$, '22023', null, 'empty key rejected');
select throws_ok($$select stockkit.check_rate_limit('pgtap:c', 0, 3600)$$, '22023', null, 'zero limit rejected');
select throws_ok($$select stockkit.check_rate_limit('pgtap:c', 2, 0)$$, '22023', null, 'zero window rejected');

select * from finish();
rollback;
