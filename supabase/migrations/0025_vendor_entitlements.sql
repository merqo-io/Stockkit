-- 0025_vendor_entitlements.sql
-- Merqo owns subscriptions and pushes each vendor's entitlement here. This
-- table is a cache of that push; stockkit's plan gate reads only from it.
-- event_pass is deliberately not stored: it is a qkit concept.
CREATE TABLE stockkit.vendor_entitlements (
  vendor_id    UUID        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  tier         TEXT        NOT NULL CHECK (tier IN ('free', 'paid')),
  founder      BOOLEAN     NOT NULL DEFAULT false,
  stats_window TEXT        NOT NULL DEFAULT '24h' CHECK (stats_window IN ('24h', '90d')),
  -- NULL on a paid row means open-ended: it only comes from the legacy
  -- vendors.plan migration (0026) and holds until merqo's next push.
  valid_until  TIMESTAMPTZ,
  issued_at    TIMESTAMPTZ NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE stockkit.vendor_entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vendor_entitlements_self_select" ON stockkit.vendor_entitlements
  FOR SELECT USING (vendor_id = (select auth.uid()));

-- Writes happen only through apply_vendor_entitlement (service role).
REVOKE ALL ON stockkit.vendor_entitlements FROM PUBLIC, anon, authenticated;
GRANT SELECT ON stockkit.vendor_entitlements TO authenticated;
GRANT ALL ON stockkit.vendor_entitlements TO service_role;

-- Maps the pushed email to auth.users and upserts in one statement. The
-- WHERE on the conflict branch makes the issued_at ordering atomic: a stale or
-- replayed push updates nothing and returns 'stale'.
CREATE FUNCTION stockkit.apply_vendor_entitlement(
  p_email        TEXT,
  p_tier         TEXT,
  p_founder      BOOLEAN,
  p_stats_window TEXT,
  p_valid_until  TIMESTAMPTZ,
  p_issued_at    TIMESTAMPTZ
) RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_vendor UUID;
  v_written UUID;
BEGIN
  SELECT id INTO v_vendor FROM auth.users WHERE lower(email) = lower(p_email) LIMIT 1;
  IF v_vendor IS NULL THEN RETURN 'unknown_vendor'; END IF;

  INSERT INTO stockkit.vendor_entitlements AS e
    (vendor_id, tier, founder, stats_window, valid_until, issued_at, updated_at)
  VALUES (v_vendor, p_tier, p_founder, p_stats_window, p_valid_until, p_issued_at, now())
  ON CONFLICT (vendor_id) DO UPDATE SET
    tier = EXCLUDED.tier,
    founder = EXCLUDED.founder,
    stats_window = EXCLUDED.stats_window,
    valid_until = EXCLUDED.valid_until,
    issued_at = EXCLUDED.issued_at,
    updated_at = now()
  WHERE e.issued_at < EXCLUDED.issued_at
  RETURNING e.vendor_id INTO v_written;

  RETURN CASE WHEN v_written IS NULL THEN 'stale' ELSE 'stored' END;
END;
$$;
REVOKE ALL ON FUNCTION stockkit.apply_vendor_entitlement(text, text, boolean, text, timestamptz, timestamptz)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION stockkit.apply_vendor_entitlement(text, text, boolean, text, timestamptz, timestamptz)
  TO service_role;

-- The single definition of "paid". Merqo has no cron, so a lapse must apply
-- here by comparing valid_until to now() rather than waiting for a push.
CREATE FUNCTION stockkit.vendor_is_paid(p_vendor UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM stockkit.vendor_entitlements
    WHERE vendor_id = p_vendor
      AND tier = 'paid'
      AND (valid_until IS NULL OR valid_until > now())
  );
$$;
REVOKE ALL ON FUNCTION stockkit.vendor_is_paid(uuid) FROM PUBLIC, anon, authenticated, service_role;

-- Same name and signature as 0011 so can_create_product, the row/statement
-- triggers and the reactivation guard keep working unchanged.
CREATE OR REPLACE FUNCTION stockkit.active_product_cap(p_vendor UUID)
RETURNS INTEGER
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '' AS $$
  SELECT CASE WHEN stockkit.vendor_is_paid(p_vendor) THEN NULL::integer ELSE 20 END;
$$;
