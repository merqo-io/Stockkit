-- Fixed-window rate limiter backing signup, feedback, profile saves and the
-- /api/merqo/* routes. Counter rows are short-lived abuse state; keys carry
-- only digests of IPs and user ids. No policies: only the definer function and
-- the service role touch the table.
create table if not exists stockkit.rate_limits (
  key          text        not null,
  window_start timestamptz not null,
  count        int         not null default 0,
  primary key (key, window_start)
);
create index if not exists rate_limits_window_start_idx on stockkit.rate_limits (window_start);
alter table stockkit.rate_limits enable row level security;
revoke all on stockkit.rate_limits from public, anon, authenticated;
grant select, insert, update, delete on stockkit.rate_limits to service_role;

create or replace function stockkit.check_rate_limit(
  p_key text, p_limit int, p_window_seconds int
)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_window timestamptz;
  v_count int;
begin
  if p_key is null or pg_catalog.length(p_key) not between 1 and 255
     or p_limit is null or p_limit not between 1 and 100000
     or p_window_seconds is null or p_window_seconds not between 1 and 86400 then
    raise exception 'invalid rate limit parameters' using errcode = '22023';
  end if;

  v_window := pg_catalog.to_timestamp(
    pg_catalog.floor(extract(epoch from pg_catalog.now()) / p_window_seconds) * p_window_seconds
  );
  insert into stockkit.rate_limits (key, window_start, count)
    values (p_key, v_window, 1)
    on conflict (key, window_start) do update
      set count = least(stockkit.rate_limits.count::bigint + 1, 2147483647)::int
    returning count into v_count;

  -- Cheap probabilistic cleanup keeps the table small without a cron job; the
  -- longest window is one day, so older rows can never be read again.
  if pg_catalog.random() < 0.02 then
    delete from stockkit.rate_limits
      where window_start < pg_catalog.now() - interval '1 day';
  end if;
  return v_count <= p_limit;
end;
$$;
revoke all on function stockkit.check_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function stockkit.check_rate_limit(text, int, int) to service_role;
