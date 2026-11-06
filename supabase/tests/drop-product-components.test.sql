begin;
select plan(5);

select hasnt_table('stockkit', 'product_components', 'product_components is gone');
select hasnt_column('stockkit', 'stock_movements', 'linked_movement_id', 'linked_movement_id is gone');
select hasnt_function('stockkit', 'prevent_nested_components', 'prevent_nested_components is gone');
select hasnt_function('stockkit', 'record_linked_movement', 'record_linked_movement is gone');
select has_table('stockkit', 'stock_movements', 'the ledger table itself remains');

select * from finish();
rollback;
