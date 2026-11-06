-- 0028_drop_prod_only_product_components.sql
-- Prod carries objects that no migration created and no code uses (backlog
-- SK-01, owner decision: drop). Everything is IF EXISTS so staging and local,
-- where they never existed, are a no-op. No CASCADE anywhere: an unexpected
-- prod-only dependent must abort the migration, not vanish silently.
DO $$
DECLARE
  n bigint;
  r record;
BEGIN
  -- Guards: both objects can hold data, and the ledger is append-only, so
  -- refuse rather than discard rows someone wrote.
  IF to_regclass('stockkit.product_components') IS NOT NULL THEN
    EXECUTE 'SELECT count(*) FROM stockkit.product_components' INTO n;
    IF n > 0 THEN
      RAISE EXCEPTION 'stockkit.product_components has % rows; resolve before dropping (SK-01)', n;
    END IF;
  END IF;

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

  RAISE NOTICE '0028: dropping stockkit.product_components (if exists)';
  DROP TABLE IF EXISTS stockkit.product_components;

  -- The signature of record_linked_movement is not in the repo, so triggers
  -- and functions are resolved by name. Remaining triggers are dropped
  -- explicitly so each one is named in the log.
  FOR r IN
    SELECT t.tgname, t.tgrelid::regclass AS tbl
    FROM pg_trigger t
    JOIN pg_proc p ON p.oid = t.tgfoid
    JOIN pg_namespace ns ON ns.oid = p.pronamespace
    WHERE ns.nspname = 'stockkit'
      AND p.proname IN ('prevent_nested_components', 'record_linked_movement')
      AND NOT t.tgisinternal
  LOOP
    RAISE NOTICE '0028: dropping trigger % on %', r.tgname, r.tbl;
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %s', r.tgname, r.tbl);
  END LOOP;

  FOR r IN
    SELECT p.oid::regprocedure AS fn
    FROM pg_proc p
    JOIN pg_namespace ns ON ns.oid = p.pronamespace
    WHERE ns.nspname = 'stockkit'
      AND p.proname IN ('prevent_nested_components', 'record_linked_movement')
  LOOP
    RAISE NOTICE '0028: dropping function %', r.fn;
    EXECUTE format('DROP FUNCTION %s', r.fn);
  END LOOP;

  RAISE NOTICE '0028: dropping stock_movements.linked_movement_id (if exists)';
  ALTER TABLE stockkit.stock_movements DROP COLUMN IF EXISTS linked_movement_id;
END
$$;
