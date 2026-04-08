create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.establishments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  logo_url text,
  phone text not null,
  whatsapp text,
  address text not null,
  maps_url text,
  sponsored boolean not null default false,
  primary_category_id uuid not null references public.categories (id) on update cascade on delete restrict,
  keywords text[] not null default '{}'::text[],
  active boolean not null default true,
  closed_weekdays smallint[] not null default '{}'::smallint[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.establishments
  add column if not exists closed_weekdays smallint[] not null default '{}'::smallint[];

create table if not exists public.establishment_hours (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments (id) on update cascade on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  interval_index smallint not null check (interval_index between 1 and 2),
  open_time time not null,
  close_time time not null,
  constraint establishment_hours_unique unique (establishment_id, weekday, interval_index),
  constraint establishment_hours_valid_time check (close_time > open_time)
);

create table if not exists public.monthly_accesses (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments (id) on update cascade on delete cascade,
  month_key text not null check (month_key ~ '^\d{4}-\d{2}$'),
  access_count integer not null default 0 check (access_count >= 0),
  updated_at timestamptz not null default now(),
  constraint monthly_accesses_unique unique (establishment_id, month_key)
);

create index if not exists idx_establishments_primary_category_id on public.establishments (primary_category_id);
create index if not exists idx_establishments_active on public.establishments (active);
create index if not exists idx_establishment_hours_establishment_weekday on public.establishment_hours (establishment_id, weekday);
create index if not exists idx_monthly_accesses_month_key on public.monthly_accesses (month_key);
create index if not exists idx_monthly_accesses_establishment_month on public.monthly_accesses (establishment_id, month_key);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_establishments_updated_at on public.establishments;
create trigger touch_establishments_updated_at
before update on public.establishments
for each row
execute function public.touch_updated_at();

drop trigger if exists touch_monthly_accesses_updated_at on public.monthly_accesses;
create trigger touch_monthly_accesses_updated_at
before update on public.monthly_accesses
for each row
execute function public.touch_updated_at();

alter table public.categories enable row level security;
alter table public.establishments enable row level security;
alter table public.establishment_hours enable row level security;
alter table public.monthly_accesses enable row level security;

drop policy if exists categories_select_public on public.categories;
create policy categories_select_public
on public.categories
for select
using (true);

drop policy if exists establishments_select_public on public.establishments;
create policy establishments_select_public
on public.establishments
for select
using (true);

drop policy if exists establishment_hours_select_public on public.establishment_hours;
create policy establishment_hours_select_public
on public.establishment_hours
for select
using (true);

drop policy if exists monthly_accesses_select_public on public.monthly_accesses;
create policy monthly_accesses_select_public
on public.monthly_accesses
for select
using (true);

grant select on public.categories to anon, authenticated;
grant select on public.establishments to anon, authenticated;
grant select on public.establishment_hours to anon, authenticated;
grant select on public.monthly_accesses to anon, authenticated;
