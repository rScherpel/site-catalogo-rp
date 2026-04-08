create extension if not exists pgcrypto;

alter table if exists public.establishments
  add column if not exists closed_weekdays smallint[] not null default '{}'::smallint[];

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.sync_admin_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, coalesce(new.email, ''), 'admin')
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.sync_admin_profile();

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
after update of email on auth.users
for each row
execute function public.sync_admin_profile();

create or replace function public.replace_establishment_hours(
  p_establishment_id uuid,
  p_hours jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can manage hours';
  end if;

  delete from public.establishment_hours
  where establishment_id = p_establishment_id;

  if p_hours is null or jsonb_typeof(p_hours) <> 'array' then
    return;
  end if;

  insert into public.establishment_hours (
    establishment_id,
    weekday,
    interval_index,
    open_time,
    close_time
  )
  select
    p_establishment_id,
    items.weekday::smallint,
    items.interval_index::smallint,
    items.open_time::time,
    items.close_time::time
  from jsonb_to_recordset(p_hours) as items(
    weekday smallint,
    interval_index smallint,
    open_time text,
    close_time text
  )
  where coalesce(items.open_time, '') <> ''
    and coalesce(items.close_time, '') <> '';
end;
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.establishments enable row level security;
alter table public.establishment_hours enable row level security;
alter table public.monthly_accesses enable row level security;

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists profiles_admin_manage on public.profiles;
create policy profiles_admin_manage
on public.profiles
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists categories_public_select on public.categories;
create policy categories_public_select
on public.categories
for select
using (true);

drop policy if exists categories_admin_manage on public.categories;
create policy categories_admin_manage
on public.categories
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists establishments_public_select on public.establishments;
create policy establishments_public_select
on public.establishments
for select
using (active = true or public.is_admin());

drop policy if exists establishments_admin_manage on public.establishments;
create policy establishments_admin_manage
on public.establishments
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists establishment_hours_public_select on public.establishment_hours;
create policy establishment_hours_public_select
on public.establishment_hours
for select
using (true);

drop policy if exists establishment_hours_admin_manage on public.establishment_hours;
create policy establishment_hours_admin_manage
on public.establishment_hours
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists monthly_accesses_public_select on public.monthly_accesses;
create policy monthly_accesses_public_select
on public.monthly_accesses
for select
using (true);

drop policy if exists monthly_accesses_admin_manage on public.monthly_accesses;
create policy monthly_accesses_admin_manage
on public.monthly_accesses
for all
using (public.is_admin())
with check (public.is_admin());

grant select on public.profiles to authenticated;
grant insert, update, delete on public.profiles to authenticated;
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant select on public.establishments to anon, authenticated;
grant insert, update, delete on public.establishments to authenticated;
grant select on public.establishment_hours to anon, authenticated;
grant insert, update, delete on public.establishment_hours to authenticated;
grant select on public.monthly_accesses to anon, authenticated;
grant insert, update, delete on public.monthly_accesses to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.sync_admin_profile() to authenticated;
grant execute on function public.replace_establishment_hours(uuid, jsonb) to authenticated;
