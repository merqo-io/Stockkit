-- Index every foreign key column (Supabase advisor: unindexed foreign keys).
create index if not exists admin_audit_admin_id_idx on stockkit.admin_audit (admin_id);
create index if not exists feedback_vendor_id_idx on stockkit.feedback (vendor_id);
create index if not exists products_vendor_id_idx on stockkit.products (vendor_id);
create index if not exists stock_movements_vendor_id_idx on stockkit.stock_movements (vendor_id);
