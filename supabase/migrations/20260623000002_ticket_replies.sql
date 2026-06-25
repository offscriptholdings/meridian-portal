-- Migration 6: ticket_replies — per-ticket threaded conversation (MTC-457)
-- Supabase project: hlxqkqwrgqhiqimzvlev

create table public.ticket_replies (
  id           uuid        primary key default gen_random_uuid(),
  ticket_id    uuid        not null references public.tickets(id) on delete cascade,
  tenant_id    uuid        not null references public.tenants(id) on delete cascade,
  sender_email text        not null,
  sender_role  text        not null check (sender_role in ('client', 'admin')),
  body         text        not null,
  created_at   timestamptz not null default now()
);

create index ticket_replies_ticket_created_idx
  on public.ticket_replies (ticket_id, created_at asc);

alter table public.ticket_replies enable row level security;

-- SELECT: clients see replies on their tenant's tickets; admins see all
create policy "ticket_replies_select"
on public.ticket_replies for select
using (
  public.is_admin()
  or tenant_id in (select public.auth_tenant_ids())
);

-- INSERT: clients for their tenant; admins for any
create policy "ticket_replies_insert"
on public.ticket_replies for insert
with check (
  public.is_admin()
  or tenant_id in (select public.auth_tenant_ids())
);
