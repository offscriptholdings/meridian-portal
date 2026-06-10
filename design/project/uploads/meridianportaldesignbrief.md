# Meridian Client Portal — Design Brief (for Claude Design)

*Paste this into Claude Design to produce the handoff bundle that the build (MTC-362 shell + the v1 surfaces) ports. 2026-06-09.*
*Specs behind it: `foundry/visions/2026-06-08-meridian-client-portal.md` · surface map in `meridian-portal/CLAUDE.md`.*

---

## What this is

A **multi-tenant client portal for Meridian Tech Co.** (David's consulting firm — operations infrastructure with AI). **One job:** *a calm, single place for a client to see where their engagement stands and hand David work.* Editorial and quiet — a well-run firm's private workspace, not a busy SaaS dashboard. Two experiences in one app: the **client** view (scoped to their own engagement) and the **admin** view (David, across all clients).

## Brand — match the existing Meridian identity (don't reinvent)

Warm-dark, editorial. Deep slate background (~`#1f2a30`), warm parchment ink (~`#e8e0cd`), restrained burnt-orange accent (~`#e36a2c`) reserved for emphasis only. **Newsreader** serif for display/headings, **IBM Plex Sans** for UI, **IBM Plex Mono** for meta/labels/small-caps. Subtle paper-grain texture. Support light + dark. (Source: the Meridian marketing site.) Calm, lots of whitespace.

## Form factors — BOTH required, every screen

- **Desktop:** sidebar nav, multi-column where it helps.
- **Mobile:** collapsed/bottom nav, single column, touch-sized targets, no horizontal scroll. **Tables become stacked cards on mobile.**

A client glancing on their phone should instantly see *where things stand* without hunting.

## Screens

### A. Auth / entry
1. **Login** (`/login`) — minimal, branded. "Sign in with Google" + "Email me a magic link." One quiet line: *invite-only — contact David if you need access.*
2. **Invite acceptance** (`/invite/:token`) — welcoming: "You've been invited to **[Client]**'s engagement" → sign in to accept.
3. **Not-authorized gate** — signed in but no engagement yet: a calm "You're not set up with an engagement — reach out to David." Not an error page; no data shown.

### B. Client experience (scoped to their one engagement)
Shell: branded header with the client's company name + nav to the three surfaces.
4. **Project plan** (`/client/plan`) — **the hero.** "Where your engagement stands." Milestones + work items mirrored read-only from Linear. Status-at-a-glance — a timeline or grouped-by-status view (what's done · in flight · next), **not** a raw issue dump.
5. **Tickets** (`/client/tickets`) — their requests with status (open / in progress / resolved). Prominent **"Submit a request"** → simple form (title, description, optional file). Ticket detail = a **threaded conversation** (client ↔ David).
6. **Documents** (`/client/docs`) — clean file area, upload + download both ways. List: name / who / when / size. Drag-and-drop upload.

### C. Admin experience (David — cross-tenant)
Shell: a control surface across **all** clients (a tenant picker / switcher).
7. **Admin dashboard** (`/admin`) — clients list, a **cross-client ticket queue** (what's waiting on David), recent activity.
8. **Client management** — create a client, link their Linear project, **invite users by email**, see who has access.
9. **Admin tickets** — the cross-client queue; open, reply, change status.
10. **Admin documents** — upload into any client's area.

(Admin reuses the client components inside a cross-tenant frame.)

## States — design for each surface
- **Empty** (no tickets / no documents / plan not set up yet) — inviting, never just blank.
- **Loading** — skeletons.
- **Error** — calm, recoverable.
- The **not-authorized** gate (above).

## Components / patterns to establish
Nav (desktop sidebar ↔ mobile bottom/collapsed) · branded client-name header · status badges (ticket states + plan phases) · milestone/timeline component · ticket list + threaded detail · request form · file list + drag-drop uploader · empty/loading/error states · auth + invite screens · admin tenant-switcher. Tables → cards on mobile.

## Tone
Editorial, calm, confident. Newsreader serif for warmth; accent used sparingly. It should feel like a private, considered workspace — the opposite of a generic help-desk.

## Deliverable
A **high-fidelity handoff bundle** (HTML + React via in-browser Babel, or equivalent) — every screen above at **desktop AND mobile** — plus the **design tokens as CSS custom properties** (the repo uses `src/styles/tokens.css`, **no Tailwind**). Match the build stack: **React + TypeScript + CSS variables**. Output tokens + components so the shell build (MTC-362) can port them directly.

## Out of scope — do NOT design (Phase 2)
Invoices · questionnaire→agent loop · Vercel preview pane · notifications · legal pages · audit log.
