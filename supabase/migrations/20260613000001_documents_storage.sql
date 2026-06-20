-- Migration: Documents — Supabase Storage bucket + metadata table + Storage RLS
-- per-tenant file area for the Meridian Client Portal
-- Supabase project: hlxqkqwrgqhiqimzvlev
-- Path structure: {tenant_id}/{file_uuid}-{sanitized_filename}

-- 1. Storage bucket (private — signed URLs required for download)
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- 2. Documents metadata table (one row per uploaded file)
create table public.documents (
  id           uuid        primary key default gen_random_uuid(),
  tenant_id    uuid        not null references public.tenants(id) on delete cascade,
  storage_path text        not null unique,
  name         text        not null,
  uploaded_by  text        not null,
  size         bigint,
  content_type text,
  created_at   timestamptz not null default now()
);

create index documents_tenant_created_idx on public.documents (tenant_id, created_at desc);

alter table public.documents enable row level security;

-- documents table: clients see their tenant; admins see all
create policy "documents_select"
on public.documents for select
using (
  public.is_admin()
  or tenant_id in (select public.auth_tenant_ids())
);

-- documents table: clients insert for their tenant only; admins for any tenant
create policy "documents_insert"
on public.documents for insert
with check (
  public.is_admin()
  or tenant_id in (select public.auth_tenant_ids())
);

-- documents table: admin-only delete
create policy "documents_delete_admin"
on public.documents for delete
using (public.is_admin());

-- 3. Storage RLS on storage.objects for the 'documents' bucket
--    Path structure enforced by upload code: {tenant_id}/{uuid}-{filename}
--    Tenant isolation: the first path segment must be the caller's tenant_id.

-- SELECT: clients read files under their tenant prefix; admins read all
create policy "storage_documents_select"
on storage.objects for select
using (
  bucket_id = 'documents'
  and (
    public.is_admin()
    or exists (
      select 1 from public.memberships
      where user_id = auth.uid()
        and tenant_id::text = split_part(storage.objects.name, '/', 1)
    )
  )
);

-- INSERT: clients upload under their tenant prefix; admins upload anywhere
create policy "storage_documents_insert"
on storage.objects for insert
with check (
  bucket_id = 'documents'
  and (
    public.is_admin()
    or exists (
      select 1 from public.memberships
      where user_id = auth.uid()
        and tenant_id::text = split_part(name, '/', 1)
    )
  )
);

-- DELETE: admin-only storage deletion
create policy "storage_documents_delete"
on storage.objects for delete
using (
  bucket_id = 'documents'
  and public.is_admin()
);
