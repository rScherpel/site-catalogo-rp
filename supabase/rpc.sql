create or replace function public.increment_monthly_access(
  p_establishment_id uuid,
  p_month_key text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_count integer;
begin
  insert into public.monthly_accesses (
    establishment_id,
    month_key,
    access_count,
    updated_at
  )
  values (
    p_establishment_id,
    p_month_key,
    1,
    now()
  )
  on conflict (establishment_id, month_key)
  do update set
    access_count = public.monthly_accesses.access_count + 1,
    updated_at = now()
  returning access_count into next_count;

  return next_count;
end;
$$;

grant execute on function public.increment_monthly_access(uuid, text) to anon, authenticated;
