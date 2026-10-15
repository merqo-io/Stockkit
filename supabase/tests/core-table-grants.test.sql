begin;
select no_plan();

select ok(has_table_privilege('service_role', relation, privilege),
  relation || ': service role has ' || privilege)
from unnest(array['stockkit.vendors', 'stockkit.products']) as relation,
  unnest(array['SELECT', 'INSERT', 'UPDATE', 'DELETE']) as privilege;
select ok(has_table_privilege('service_role', 'stockkit.stock_movements', privilege),
  'stock_movements: service role has ' || privilege)
from unnest(array['SELECT', 'INSERT']) as privilege;
select ok(not has_table_privilege('service_role', 'stockkit.stock_movements', privilege),
  'stock_movements: service role lacks ' || privilege)
from unnest(array['UPDATE', 'DELETE', 'TRUNCATE']) as privilege;

select ok(has_table_privilege('authenticated', relation, 'SELECT'),
  relation || ': authenticated can select')
from unnest(array['stockkit.vendors', 'stockkit.products', 'stockkit.stock_movements'])
  as relation;
select ok(has_table_privilege('authenticated', 'stockkit.products', privilege),
  'products: authenticated has ' || privilege)
from unnest(array['INSERT', 'DELETE']) as privilege;
select ok(not has_table_privilege('authenticated', relation, 'UPDATE'),
  relation || ': authenticated update stays column-scoped')
from unnest(array['stockkit.vendors', 'stockkit.products']) as relation;
select ok(not has_column_privilege('authenticated', 'stockkit.vendors', 'plan', privilege),
  'vendors.plan: authenticated lacks ' || privilege)
from unnest(array['INSERT', 'UPDATE']) as privilege;
select ok(not has_column_privilege('authenticated', 'stockkit.products', 'on_hand', 'UPDATE'),
  'products.on_hand: authenticated cannot update directly');
select ok(not has_table_privilege('authenticated', 'stockkit.stock_movements', privilege),
  'stock_movements: authenticated lacks ' || privilege)
from unnest(array['INSERT', 'UPDATE', 'DELETE']) as privilege;

set local role service_role;
select lives_ok($$ select count(*) from stockkit.vendors $$,
  'service role can read vendors');
select lives_ok($$ select count(*) from stockkit.products $$,
  'service role can read products');
select lives_ok($$ select count(*) from stockkit.stock_movements $$,
  'service role can read stock movements');
reset role;

select * from finish();
rollback;
