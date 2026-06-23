-- Migration 5: Support tickets — per-tenant ticket table + RLS
-- Clients submit tickets; status tracked for P1.2b; replies for P1.2c.
-- Supabase project: hlxqkqwrgqhiqimzvlev

create table public.tickets (
  id           uuid        primary key default gen_random_uuid(),
  tenant_id    uuid        not null references public.tenants(id) on delete cascade,
  submitted_by text        not null,
  subject      text        not null,
  body         text        not null,
  status       text        not null default 'open'
                           check (status in ('open', 'closed')),
  created_at   timestamptz not null default now()
);

create index tickets_tenant_created_idx on public.tickets (tenant_id, created_at desc);

alter table public.tickets enable row level security;

-- SELECT: clients see their tenant's tickets; admins see all
create policy "tickets_select"
on public.tickets for select
using (
  public.is_admin()
  or tenant_id in (select public.auth_tenant_ids())
);

-- INSERT: clients for their tenant; admins for any tenant
create policy "tickets_insert"
on public.tickets for insert
with check (
  public.is_admin()
  or tenant_id in (select public.auth_tenant_ids())
);

-- UPDATE: admin-only (for status changes — used by P1.2b+)
create policy "tickets_update_admin"
on public.tickets for update
using (public.is_admin())
with check (public.is_admin());

-- DELETE: admin-only
create policy "tickets_delete_admin"
on public.tickets for delete
using (public.is_admin());
