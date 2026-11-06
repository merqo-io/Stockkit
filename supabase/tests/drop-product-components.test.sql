begin;
select no_plan();

select hasnt_table('stockkit', 'product_components', 'product_components is gone');
select hasnt_column('stockkit', 'stock_movements', 'linked_movement_id', 'linked_movement_id is gone');
select hasnt_function('stockkit', 'prevent_nested_components', 'prevent_nested_components is gone');
select hasnt_function('stockkit', 'record_linked_movement', 'record_linked_movement is gone');

select has_table('stockkit', 'stock_movements', 'the ledger table remains');
select has_function('stockkit', 'record_stock_movement', 'record_stock_movement remains');
select ok(has_table_privilege('service_role', 'stockkit.stock_movements', 'select'), 'service_role can still select the ledger');
select ok(has_table_privilege('service_role', 'stockkit.stock_movements', 'insert'), 'service_role can still insert into the ledger');
select ok(not has_table_privilege('service_role', 'stockkit.stock_movements', 'update'), '0015: service_role cannot update the ledger');
select ok(not has_table_privilege('service_role', 'stockkit.stock_movements', 'delete'), '0015: service_role cannot delete from the ledger');
select ok((select count(*) from pg_policies where schemaname = 'stockkit' and tablename = 'stock_movements' and cmd in ('UPDATE', 'DELETE')) = 0, 'no update/delete policy on the ledger');

select * from finish();
rollback;
