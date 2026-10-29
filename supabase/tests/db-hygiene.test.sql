begin;
select no_plan();

select has_index('stockkit', 'admin_audit', 'admin_audit_admin_id_idx', 'stockkit.admin_audit (admin_id) is indexed');
select has_index('stockkit', 'feedback', 'feedback_vendor_id_idx', 'stockkit.feedback (vendor_id) is indexed');
select has_index('stockkit', 'products', 'products_vendor_id_idx', 'stockkit.products (vendor_id) is indexed');
select has_index('stockkit', 'stock_movements', 'stock_movements_vendor_id_idx', 'stockkit.stock_movements (vendor_id) is indexed');

select is(
  (select count(*)::int from pg_tables where schemaname = 'stockkit' and not rowsecurity),
  0, 'every stockkit table has row level security on');

select * from finish();
rollback;
