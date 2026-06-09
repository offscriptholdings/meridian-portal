# meridian-portal

Multi-tenant client portal for Meridian Tech Co. — a calm, single place for clients to see where their engagement stands and hand David work.

Built with Vite + React 18 + TypeScript. Separate Supabase project from all other internal DBs.

## Stack

- **Framework:** Vite + React 18 + TypeScript (`react-ts` template)
- **Styling:** CSS custom properties (`src/styles/tokens.css`) — no Tailwind
- **Database:** Supabase project `hlxqkqwrgqhiqimzvlev` (separate from all internal DBs)
- **Auth:** Google OAuth + magic-link (invite/allowlist — no open signup). Wired in MTC-361.
- **Deployment:** Vercel (offscriptholdings org). Domain: `portal.meridiantechco.com`

## Folder structure

```
src/
  lib/
    supabase.ts        # browser Supabase client (anon key via VITE_ env vars)
  routes/
    client/            # client-facing surfaces (project plan, tickets, docs) — MTC-362+
    admin/             # admin surfaces (cross-tenant, David only) — MTC-362+
  styles/
    tokens.css         # CSS custom properties (real brand values: MTC-362)
  App.tsx              # root component; routing wired in MTC-362
  main.tsx             # React entry point
```

## Supabase

- **Project ref:** `hlxqkqwrgqhiqimzvlev`
- **Browser client:** `import { supabase } from '../lib/supabase'`
- **Service key:** server-side only — NEVER use as a `VITE_` env var (it would appear in the client bundle)
- **Multi-tenancy:** every data table carries `tenant_id` — RLS enforced from migration 1 (MTC-360)
- **Roles:** `client` (scoped to their tenant) · `admin` (David, sees all tenants)

## Supabase env vars

| Variable | Where | What |
|---|---|---|
| `VITE_SUPABASE_URL` | Vercel env (Production + Preview) | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Vercel env (Production + Preview) | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel env (no VITE_ prefix, server-side only) | Service role key (never in client bundle) |

All three provisioned in MTC-359.

## Auth (wired in MTC-361)

Google OAuth + magic-link fallback. Invite/allowlist provisioning — a Google login alone doesn't authorize; admin (David) invites a client and binds them to a tenant. No open self-signup.

## Commands

```bash
npm run dev       # local dev server (http://localhost:5173)
npm run build     # Vite production build — must exit 0 before any PR
npm run preview   # preview production build locally
```

## Conventions

- CSS via custom properties only — no Tailwind, no styled-components, no CSS-in-JS
- Tokens in `src/styles/tokens.css`; components import it directly or inherit via App.tsx
- No inline styles except where absolutely required (and document why in a comment)
- Supabase queries from `lib/supabase.ts` only — never re-initialize the client
- TypeScript strict mode; no `any` without a comment explaining why

## Foundry

- **Tenant:** offscript
- **GitHub:** `offscriptholdings/meridian-portal`
- **Vercel project:** offscriptholdings/meridian-portal
- **Linear label:** `repo:meridian-portal`
- **Branch protection:** `foundry/reviewer` status required to merge (MTC-359)
- **Build flow:** standard (feature/fix/chore branch → draft PR → Reviewer → auto-merge)
- **MTC-368:** bootstrap scaffold (direct to main, no PR — one-time exception)

## v1 surface map

| Surface | Route | Status |
|---|---|---|
| Client — project plan | `/client/plan` | MTC-363 |
| Client — tickets | `/client/tickets` | MTC-364 |
| Client — documents | `/client/docs` | MTC-365 |
| Admin — dashboard | `/admin` | MTC-366 |
| Auth shell | `/login`, `/invite/:token` | MTC-361 |
| App shell + routing | `/` | MTC-362 |

## Deferred (Phase 2)

Invoices · Questionnaire → agent session loop · Vercel preview pane · Notifications (Resend) · Legal (ToS/privacy) · Audit log
