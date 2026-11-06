-- 0028_drop_prod_only_product_components.sql
-- Prod carries objects that no migration created and no code uses (backlog
-- SK-01, owner decision: drop). Everything is IF EXISTS so staging and local,
-- where they never existed, are a no-op.
DO $$
DECLARE
  fn regprocedure;
  n bigint;
BEGIN
  -- Guard: the column is part of an append-only ledger, so refuse rather than
  -- silently discard links that someone wrote.
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'stockkit'
      AND table_name = 'stock_movements'
      AND column_name = 'linked_movement_id'
  ) THEN
    EXECUTE 'SELECT count(*) FROM stockkit.stock_movements WHERE linked_movement_id IS NOT NULL'
      INTO n;
    IF n > 0 THEN
      RAISE EXCEPTION 'stock_movements.linked_movement_id has % non-null rows; resolve before dropping (SK-01)', n;
    END IF;
  END IF;

  -- CASCADE removes the table's own triggers, policies and FKs.
  DROP TABLE IF EXISTS stockkit.product_components CASCADE;

  -- Signature of record_linked_movement is not in the repo, so resolve by name.
  -- CASCADE removes any triggers that call these functions.
  FOR fn IN
    SELECT p.oid::regprocedure
    FROM pg_proc p
    JOIN pg_namespace ns ON ns.oid = p.pronamespace
    WHERE ns.nspname = 'stockkit'
      AND p.proname IN ('prevent_nested_components', 'record_linked_movement')
  LOOP
    EXECUTE format('DROP FUNCTION %s CASCADE', fn);
  END LOOP;

  -- Dropping the column also drops its FK and check constraints. Table-level
  -- grants and the immutability policies from 0015 are untouched.
  ALTER TABLE stockkit.stock_movements DROP COLUMN IF EXISTS linked_movement_id CASCADE;
END
$$;
