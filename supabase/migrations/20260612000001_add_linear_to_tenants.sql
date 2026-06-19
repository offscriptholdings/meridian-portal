-- Migration 3: Add linear_project_id to tenants
-- Maps each client tenant to their Linear project for the plan surface.
-- Supabase project: hlxqkqwrgqhiqimzvlev
-- No RLS changes — existing tenants_select policy already controls access.

alter table public.tenants
  add column if not exists linear_project_id text;
