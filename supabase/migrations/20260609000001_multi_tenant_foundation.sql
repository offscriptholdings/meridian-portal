-- Migration 1: Multi-tenant foundation
-- Creates tenants, memberships, helper functions, and RLS.
-- Every future data table must carry tenant_id and reference these policies.
-- Supabase project: hlxqkqwrgqhiqimzvlev

-- tenants: one row per client organization
create table public.tenants (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  status     text        not null default 'active'
                         check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

-- memberships: user_id × tenant_id × role; one entry per user-tenant pair
create table public.memberships (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  tenant_id  uuid        not null references public.tenants(id) on delete cascade,
  role       text        not null check (role in ('client', 'admin')),
  created_at timestamptz not null default now(),
  unique (user_id, tenant_id)
);

create index memberships_user_id_idx   on public.memberships (user_id);
create index memberships_tenant_id_idx on public.memberships (tenant_id);

-- auth_tenant_ids(): returns all tenant IDs the current authenticated user belongs to.
-- security definer + set search_path prevents RLS recursion when called from a policy.
create or replace function public.auth_tenant_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select tenant_id
  from public.memberships
  where user_id = auth.uid();
$$;

-- is_admin(): true if the current authenticated user has any membership with role = 'admin'.
-- security definer + set search_path prevents RLS recursion when called from a policy.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.memberships
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

-- Enable RLS on every table (tenants and memberships — future tables follow the same pattern)
alter table public.tenants     enable row level security;
alter table public.memberships enable row level security;

-- tenants policies
create policy "tenants_select"
on public.tenants for select
using (
  public.is_admin()
  or id in (select public.auth_tenant_ids())
);

create policy "tenants_insert_admin"
on public.tenants for insert
with check (public.is_admin());

create policy "tenants_update_admin"
on public.tenants for update
using (public.is_admin()) with check (public.is_admin());

create policy "tenants_delete_admin"
on public.tenants for delete
using (public.is_admin());

-- memberships policies
create policy "memberships_select"
on public.memberships for select
using (
  public.is_admin()
  or user_id = auth.uid()
);

create policy "memberships_insert_admin"
on public.memberships for insert
with check (public.is_admin());

create policy "memberships_update_admin"
on public.memberships for update
using (public.is_admin()) with check (public.is_admin());

create policy "memberships_delete_admin"
on public.memberships for delete
using (public.is_admin());
