-- Migration 2: Invite provisioning
-- Adds invitations table for the pending-invite flow.
-- Supabase project: hlxqkqwrgqhiqimzvlev

create table public.invitations (
  id           uuid        primary key default gen_random_uuid(),
  email        text        not null,
  tenant_id    uuid        not null references public.tenants(id) on delete cascade,
  role         text        not null default 'client' check (role in ('client', 'admin')),
  invite_token uuid        not null default gen_random_uuid(),
  status       text        not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  created_at   timestamptz not null default now(),
  accepted_at  timestamptz,
  unique (email, tenant_id)
);

create index invitations_email_idx on public.invitations (email);
create index invitations_token_idx on public.invitations (invite_token);

alter table public.invitations enable row level security;

-- has_pending_invite(): used by memberships_insert_invite_activation policy.
-- security definer so it can safely read invitations regardless of caller's RLS context.
create or replace function public.has_pending_invite(p_tenant_id uuid, p_role text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.invitations
    where email = (auth.jwt() ->> 'email')
      and tenant_id = p_tenant_id
      and role = p_role
      and status = 'pending'
  );
$$;

-- Admins see all invitations; authenticated users see invites addressed to their email
create policy "invitations_select"
on public.invitations for select
using (
  public.is_admin()
  or (auth.uid() is not null and email = (auth.jwt() ->> 'email'))
);

-- Only admins can create invitations (admin UI in MTC-366)
create policy "invitations_insert_admin"
on public.invitations for insert
with check (public.is_admin());

-- User can mark their own pending invite as accepted (only valid transition)
create policy "invitations_update_self"
on public.invitations for update
using (
  auth.uid() is not null
  and email = (auth.jwt() ->> 'email')
  and status = 'pending'
)
with check (status = 'accepted');

-- Allow self-activation: user can insert their own membership row when a pending invite exists.
-- This supplements memberships_insert_admin (added in migration 1) — both policies OR together.
create policy "memberships_insert_invite_activation"
on public.memberships for insert
with check (
  user_id = auth.uid()
  and public.has_pending_invite(tenant_id, role)
);
