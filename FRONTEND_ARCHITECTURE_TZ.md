# Business OS — Frontend Architecture TZ

> Master specification for the frontend of **Business OS** (unified CRM + WhatsApp + Email + AI SaaS).
> Source of truth for API contracts: `Business OS API` OpenAPI spec (v1.0).
> Source of truth for visual direction: "Nexus OS" mockup set (dark, cinematic, glass/glow premium UI).
> This document is self-contained: a session with no prior context should be able to implement any phase from this file alone.

---

## 0. How to use this document

- Work **phase by phase**, in order. Do not start Phase N+1 until Phase N is approved.
- Each phase ends with a **Definition of Done** checklist and a **commit point**.
- Every API call referenced below maps 1:1 to an operationId in the OpenAPI spec — if a screen needs data not in the spec, flag it, don't invent an endpoint.
- Backend is already implemented (NestJS, Phases 0–6 & 10–11 done). This TZ only covers the **frontend consuming that API**.
- Paused backend features (WhatsApp real send, Email OAuth via ngrok, AI credits) are **not** blockers for frontend work — build the UI + wire it to the endpoints; it will start working the moment those are unblocked. See §11 "Degraded mode".

---

## 1. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| State | Redux Toolkit + RTK Query (server state), local `useState`/Context only for pure UI state |
| UI kit | shadcn/ui on Tailwind CSS |
| Forms | react-hook-form + zod (schemas mirrored from the DTOs in §5) |
| Charts | Recharts (dashboard/finance graphs) |
| Dates | date-fns |
| Icons | lucide-react |
| Realtime updates | Polling (see §8.4 — no websockets in the current API) |
| Auth | Access token in memory (Redux) + refresh token in httpOnly cookie (backend-managed) |
| i18n | `next-intl`, full setup from F0 — locales `ru` (default), `tj`, `en`, routed via `[locale]` segment |

---

## 2. Design System (derived from Nexus OS mockups)

**Aesthetic**: dark, cinematic, premium SaaS. Near-black backgrounds, soft violet/blue glow accents, glassmorphic panels, generous spacing, subtle gradients — not flat corporate CRM.

### 2.1 Color tokens (Tailwind CSS variables)

```css
--background: #0a0a0f;          /* page background, near-black with slight blue tint */
--surface: #13131c;             /* card/panel background */
--surface-elevated: #1a1a26;    /* modals, popovers, hover state */
--border-subtle: #26263a;       /* hairline borders on cards */
--border-glow: rgba(124, 92, 255, 0.35); /* accent border on focus/active */

--accent-primary: #7c5cff;      /* primary violet accent (buttons, active nav, highlights) */
--accent-secondary: #4f8cff;    /* secondary blue accent (links, info states) */
--accent-gradient: linear-gradient(135deg, #7c5cff 0%, #4f8cff 100%);

--text-primary: #f4f4f8;
--text-secondary: #9d9db0;
--text-tertiary: #6b6b80;

--success: #34d399;
--warning: #fbbf24;
--danger: #f87171;

--chart-1: #7c5cff;
--chart-2: #4f8cff;
--chart-3: #34d399;
--chart-4: #fbbf24;
```

### 2.2 Typography

- Font: `Inter` (or `Geist Sans` if available) for UI text; `Geist Mono`/`JetBrains Mono` for numeric/data-heavy cells (invoice amounts, IDs).
- Scale: `text-xs` (12px) metadata → `text-sm` (14px) body/table → `text-base` (16px) form labels → `text-2xl`/`text-3xl` page titles and dashboard KPI numbers.
- Headings are never bold-black; use `font-semibold` at most, letter-spacing slightly tightened on large numbers.

### 2.3 Surface language

- **Sidebar**: fixed, dark (`--surface`), collapsible, active item gets a left accent bar + soft violet glow background, icon-only collapsed state.
- **Cards/panels**: `--surface` background, 1px `--border-subtle`, `rounded-2xl`, subtle inner glow on hover for interactive cards (deal cards, contact cards).
- **KPI cards** (dashboard): large number top, label + delta (▲/▼ %) below, tiny sparkline optional, gradient icon badge top-right.
- **Kanban board** (Deals pipeline): columns = pipeline stages, each column header shows stage name + count + total value; cards are draggable, show contact avatar, deal value, days-in-stage indicator.
- **Tables**: zebra-free, row hover = subtle `--surface-elevated` background, sticky header, right-aligned numeric columns.
- **Chat-style panels** (WhatsApp, Communications, AI Assistant): message bubbles, inbound = `--surface-elevated` left-aligned, outbound = gradient-tinted right-aligned, timestamps in `--text-tertiary`.
- **Empty states**: centered icon + one-line copy + primary CTA, never a bare "No data".
- **Buttons**: primary = gradient fill, rounded-lg; secondary = outline `--border-subtle`; destructive = `--danger` outline, fills red on hover.
- Both **dark mode** (default, matches the mockups exactly) and **light mode** are supported. Implement via `next-themes` + CSS variables — every component reads `var(--background)`, `var(--surface)`, etc. rather than hardcoded hex values, so switching themes is free everywhere with zero per-component logic.

### 2.3b Light theme tokens

```css
--background: #f7f7fb;
--surface: #ffffff;
--surface-elevated: #f0f0f7;
--border-subtle: #e4e4ee;
--border-glow: rgba(124, 92, 255, 0.25);

--accent-primary: #6a45f0;      /* slightly deeper violet for contrast on white */
--accent-secondary: #3f74e6;
--accent-gradient: linear-gradient(135deg, #6a45f0 0%, #3f74e6 100%);

--text-primary: #17171f;
--text-secondary: #55556b;
--text-tertiary: #8a8aa0;

--success: #16a34a;
--warning: #d97706;
--danger: #dc2626;
```

A theme toggle (sun/moon icon) lives in the Topbar next to notifications/help — persists via `next-themes` (localStorage), defaults to **dark** for new users (matches the mockups on first load), and respects `prefers-color-scheme` only as a fallback if no explicit choice is stored.

### 2.4 Motion

- Page/panel transitions: fade + 8px slide, 150–200ms, ease-out.
- Kanban drag: slight lift + shadow while dragging.
- Loading: skeleton shimmer (not spinners) for cards/tables; spinner only for button-level actions.

---

## 3. Project Structure

```
src/
  i18n/
    routing.ts                    # next-intl locales config: ru (default), tj, en
    request.ts                    # server-side locale resolution
  messages/
    ru.json
    tj.json
    en.json
  middleware.ts                   # next-intl locale middleware + auth guard combined
  app/
    [locale]/
      (auth)/
        login/page.tsx
        register/page.tsx
      (dashboard)/                # authenticated shell, sidebar+topbar layout
        layout.tsx
        dashboard/page.tsx
        contacts/
          page.tsx
          [id]/page.tsx
        deals/
          page.tsx
          [id]/page.tsx
        tasks/page.tsx
        communications/page.tsx
        whatsapp/page.tsx
        email/page.tsx
        ai/page.tsx
        invoices/
          page.tsx
          [id]/page.tsx
        files/page.tsx
        calendar/page.tsx
        settings/
          page.tsx                # company
          team/page.tsx           # users & roles
          integrations/page.tsx
          plan/page.tsx
      layout.tsx                  # NextIntlClientProvider wraps children here
    api/                          # (only if any BFF route/proxy is ever needed — avoid unless required)
    layout.tsx                    # root layout (fonts, minimal — real layout is [locale]/layout.tsx)
    globals.css
  components/
    ui/                           # shadcn primitives
    layout/                       # Sidebar, Topbar, PageHeader
    contacts/
    deals/                        # KanbanBoard, DealCard, StageColumn
    tasks/
    communications/               # Timeline, ChatBubble
    whatsapp/
    email/
    ai/                           # AiQueryBox, AiSummaryCard, QuotationBuilder
    invoices/
    files/                        # Uploader (presign flow), FileList
    calendar/                     # MonthGrid, MeetingModal
    shared/                       # DataTable, EmptyState, StatCard, StatusBadge, Pagination
  lib/
    api/
      baseApi.ts                  # RTK Query base with auth header + 401 refresh interceptor
      auth.api.ts
      users.api.ts
      contacts.api.ts
      deals.api.ts
      tasks.api.ts
      communications.api.ts
      whatsapp.api.ts
      email.api.ts
      ai.api.ts
      files.api.ts
      company.api.ts
      invoices.api.ts
      calendar.api.ts
    hooks/
      usePolling.ts               # generic poll-until-ready hook for AI job results
      useDebounce.ts
    schemas/                      # zod schemas mirroring DTOs (§5)
    utils/
  store/
    store.ts
    authSlice.ts                  # access token, current user, current company
    uiSlice.ts                    # sidebar collapsed, active modals, toasts
  types/
    api.ts                        # TS interfaces generated/mirrored from OpenAPI schemas
    enums.ts                      # Role, DealStage, TaskStatus, InvoiceStatus, etc.
```

**Rule**: one `*.api.ts` file per OpenAPI tag, one RTK Query endpoint per `operationId`. Do not hand-roll `fetch` calls outside this layer.

---

## 4. Auth & Session Architecture

Flow, per the spec (`Auth` tag):

1. `POST /auth/register` → creates company + Owner user, returns access token. Login the user immediately (same as login flow below).
2. `POST /auth/login` → returns access token in body; refresh token set as **httpOnly cookie** by the backend (frontend never touches it directly).
3. Store access token **in memory only** (Redux `authSlice`), never in `localStorage`/`sessionStorage`.
4. On app load / hard refresh: call `POST /auth/refresh` (cookie sent automatically) to silently obtain a new access token before rendering protected routes. Show a full-screen loading state during this check.
5. RTK Query `baseApi` attaches `Authorization: Bearer <token>` from Redux state to every request.
6. On any `401` response: attempt one silent `POST /auth/refresh`, retry the original request once; if refresh also fails → clear `authSlice`, redirect to `/login`.
7. `POST /auth/logout` → clears cookie server-side; clear Redux state; redirect to `/login`.
8. `middleware.ts` guards all `(dashboard)` routes: no in-memory token on a fresh navigation is fine (client will attempt refresh), but expired/absent refresh cookie → redirect to `/login`.

**Roles** (`OWNER`, `ADMIN`, `MANAGER`, `SALES`, `SUPPORT`, `EMPLOYEE`, `READ_ONLY`) drive UI-level permission gates:
- A `useRole()` hook + `<RequireRole roles={[...]}>` wrapper hides/disables actions (invite user, change role, delete user, delete time entry, change plan) that the API would 403 on. This is UX polish only — the backend remains the real authority.
- `READ_ONLY` role: hide all mutating buttons app-wide (create/edit/delete/send), not just per-module.

---

## 5. Data Contracts (TS types mirror these 1:1)

Derive `src/types/api.ts` directly from the OpenAPI `components.schemas`. Key enums to centralize in `src/types/enums.ts`:

```ts
export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'SALES' | 'SUPPORT' | 'EMPLOYEE' | 'READ_ONLY';
export type UserStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED';
export type DealStage = 'LEAD' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type CommChannel = 'WHATSAPP' | 'EMAIL' | 'MANUAL_NOTE' | 'PHONE_CALL';
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'OTHER';
export type MeetingStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
export type Plan = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
```

Every DTO in the spec (`CreateContactDto`, `UpdateDealDto`, `CreateInvoiceDto`, etc.) gets a matching zod schema in `src/lib/schemas/` used by react-hook-form resolvers — this keeps client-side validation in sync with backend `class-validator` rules (minLength, min/max, required fields).

---

## 6. RTK Query API Layer — endpoint map

One slice per tag, tags used for cache invalidation so lists auto-refresh after mutations.

| Tag | Endpoints (operationId → RTK method) |
|---|---|
| `Auth` | register, login, refresh, logout |
| `Users` | findAll, findOne, update, remove, invite, updateRole — invalidates `Users` list on mutation |
| `Contacts` | findAll (search/tag/ownerId/page/limit), findOne, create, update, remove, timeline — invalidates `Contacts` + `Contact:{id}` |
| `Deals` | findAll (stage/ownerId), findOne, create, update, remove, updateStage — updateStage invalidates the specific deal + the board list |
| `Tasks` | findAll (status/assignedTo/dealId/contactId), findOne, create, update, remove, updateStatus + Time Tracking: findActive, start, stop, findAllForTask, remove entry |
| `Communications` | findAll (contactId/channel), createNote |
| `WhatsApp` | listAccounts, connectAccount, send |
| `Email` | connectGmail, connectOutlook, send (OAuth callbacks are backend redirect targets, not called from RTK Query directly — see §9.7) |
| `AI` | summarize + getSummary, query + getQueryResult, draftEmail + getDraftEmail, generateQuotation + getQuotation — all async job pattern, see §8.4 |
| `Files` | presign, create (confirm), findAll, remove — see §8.5 upload flow |
| `Company` | findOne, update, getPlan, updatePlan, getIntegrations |
| `Invoicing` | findAll (status/contactId/dealId/page/limit), findOne, create, update, remove, updateStatus, listPayments, addPayment |
| `Calendar` | meetings: findAll (from/to/contactId/dealId/organizerId), findOne, create, update, remove, updateStatus; connection: connect(google), status, disconnect |
| `Analytics` | overview, sales, revenue, tasks, activityFeed, finance, upcomingMeetings, forecast |

---

## 7. Screens ↔ API mapping

### 7.1 Auth
- **Login** (`Login - Nexus OS.png`): centered card on the dark cinematic background (reuse landing page shader/gradient as backdrop), email+password, "Forgot password" placeholder (no endpoint yet — hide or disable), link to Register.
- **Register**: companyName, name, email, password → `POST /auth/register`, then redirect straight into dashboard (token already returned).

### 7.2 Dashboard (`Dashboard Overview - Nexus OS`)
KPI row (revenue, open deals, tasks due, unpaid invoices) ← `GET /dashboard`.
Sections below, each independently loaded (parallel RTK Query hooks, independent skeletons):
- Sales snapshot ← `/dashboard/sales`
- Revenue chart ← `/dashboard/revenue`
- Task stats ← `/dashboard/tasks`
- Activity feed (chronological) ← `/dashboard/activity-feed`
- Finance summary (outstanding/paid/overdue) ← `/dashboard/finance`
- Upcoming meetings widget ← `/dashboard/upcoming-meetings`
- Forecast card (AI one-liner + number) ← `/dashboard/forecast`

### 7.3 Contacts (`Contacts CRM - Nexus OS`)
- List view: search box (debounced → `search` query param), tag filter, owner filter, pagination ← `GET /contacts`.
- Create/edit via drawer or modal ← `POST /contacts`, `PATCH /contacts/:id`.
- Contact detail page: profile header + tabs — **Timeline** (`GET /contacts/:id/timeline`, merges communications/deals/tasks chronologically), **Deals**, **Files** (`GET /files?contactId=`), **Notes** (create via `POST /communications/notes`).
- Delete with confirm dialog ← `DELETE /contacts/:id`.

### 7.4 Deals (`Deals Pipeline - Nexus OS`)
- Kanban board, one column per `DealStage`. Drag card between columns → `PATCH /deals/:id/stage`. Column totals computed client-side from the loaded list.
- Filters: stage (redundant with columns, used for search-within-board), owner.
- Deal detail (drawer or page): value/currency/probability/expectedCloseDate editable ← `PATCH /deals/:id`; linked contact; linked tasks; "Generate quotation" action → AI flow (§7.9); "Create invoice" shortcut → prefills Invoicing create form.

### 7.5 Tasks & Time Tracking (`Tasks - Nexus OS`)
- List/board toggle, filters: status, assignedTo, dealId, contactId ← `GET /tasks`.
- Row-level status change ← `PATCH /tasks/:id/status`.
- Time tracking widget (persistent, top bar or floating): shows active timer if any ← `GET /tasks/time/active`; Start/Stop buttons on each task ← `POST /tasks/:id/time/start` / `POST /tasks/:id/time/stop`; task detail shows full time log ← `GET /tasks/:id/time`, delete entry (Owner/Admin/Manager only) ← `DELETE /tasks/:id/time/:entryId`.
- Enforce client-side: cannot start a new timer if one is already active (mirror the 409 the API returns) — surface the API's 409 as a toast either way.

### 7.6 Communications (`Communications - Nexus OS`)
- Unified feed across channels, filter by contact/channel ← `GET /communications`. Each item shows channel icon, snippet, AI summary badge if `AiSummary` exists (click → fetch via `GET /ai/summary/:id`, trigger `POST /ai/summarize` if missing).
- "Add note" quick action ← `POST /communications/notes`.

### 7.7 WhatsApp (`WhatsApp - Nexus OS`)
- Chat-style UI per contact, connected accounts list ← `GET /whatsapp/accounts`; connect form (phoneNumberId, wabaId, accessToken, verifiedName) ← `POST /whatsapp/accounts` — gate this form behind an "Advanced/Integration" area, not the main chat screen.
- Send message ← `POST /whatsapp/send`; on 400 ("no phone"/"no account"), show inline guidance, not a raw error.
- Message history for a contact is just their `Communications` filtered to `channel=WHATSAPP`.

### 7.8 Email (`Email - Nexus OS`)
- Connection cards for Gmail/Outlook: "Connect" button opens `GET /email/connect/gmail` (or outlook) URL returned by the API in a new tab/redirect — OAuth callback is handled server-side, frontend just polls `GET /company/integrations` afterward to reflect connected status.
- Compose ← `POST /email/send` (contactId, subject, body). Reuse the AI draft as a prefill (§7.9).

### 7.9 AI (`AI Assistant - Nexus OS`)
All AI actions are **async job + poll** (see §8.4 generic pattern):
- **Natural-language query box**: `POST /ai/query {question}` → job id → poll `GET /ai/query/result/:id` until it returns rows + answer, or 422 ("couldn't understand").
- **Draft email**: from a contact context, `POST /ai/draft-email` → poll `GET /ai/draft-email/result/:id` → prefill Email compose with subject/body, editable before sending.
- **Generate quotation**: from a deal, line-item builder (description/qty/unitPrice, client-side subtotal preview) → `POST /ai/generate-quotation` → poll `GET /ai/generate-quotation/result/:id` → show totals + presigned download link once ready.
- **Summarize thread**: triggered from Communications (§7.6).

### 7.10 Invoicing (`Invoicing - Nexus OS`)
- List with status/contact/deal filters + pagination ← `GET /invoices`.
- Create ← `POST /invoices` (status always starts DRAFT). Status changes via explicit action ← `PATCH /invoices/:id/status` (not via the general update endpoint — the API separates these on purpose, mirror that in the UI: a status pill with a dropdown, not a free-text field in the edit form).
- Detail page: line info, linked contact/deal, **Payments** sub-list ← `GET /invoices/:id/payments`, add payment ← `POST /invoices/:id/payments` (auto-marks PAID server-side once fully paid — refetch invoice after adding a payment).
- Delete only allowed when `status === 'DRAFT'` — hide/disable the delete action otherwise instead of letting the 409 surprise the user.

### 7.11 Files (`Files - Nexus OS`)
Two-step upload, mirror the API exactly:
1. `POST /files/presign {filename, mimeType, contactId|dealId|invoiceId}` → get presigned S3 PUT URL + future `s3Key`.
2. Client `PUT`s the raw file directly to that S3 URL (progress bar).
3. `POST /files {s3Key, filename, mimeType, sizeBytes, ...same relation}` → confirms and creates the `FileAsset` record.
List ← `GET /files?contactId=|dealId=|invoiceId=` (each item includes a presigned download URL — just link it, don't re-derive).
Delete ← `DELETE /files/:id`.

### 7.12 Calendar (`Calendar - Nexus OS`)
- Month/week grid, range-loaded ← `GET /meetings?from=&to=`, filters by contact/deal/organizer.
- Create/edit meeting modal: title, startAt/endAt (client-side validate end > start before hitting the API, since the API 400s on this), location, description, attendees.
- Status change (SCHEDULED/COMPLETED/CANCELLED) ← `PATCH /meetings/:id/status`.
- Google Calendar connect card (separate from Gmail) ← `GET /calendar/connect/google`, status ← `GET /calendar/status`, disconnect ← `POST /calendar/disconnect`.

### 7.13 Settings (`Settings - Nexus OS`)
Tabs:
- **Company**: name/industry/timezone ← `GET/PATCH /company` (Owner/Admin only for PATCH).
- **Team** (`Team - Nexus OS`): user list ← `GET /users`, invite ← `POST /users/invite`, edit/suspend ← `PATCH /users/:id`, remove ← `DELETE /users/:id`, role change ← `PATCH /users/:id/role`. Gate all mutating actions behind `RequireRole(['OWNER','ADMIN'])`.
- **Integrations**: status cards for WhatsApp/Gmail/Outlook/Telegram/Stripe/PayPal ← `GET /company/integrations` (read-only status display; actual connect flows live in their respective modules).
- **Plan**: current plan ← `GET /company/plan`, upgrade/downgrade ← `PATCH /company/plan` (Owner only — 403 otherwise, hide the action entirely for non-Owners).

---

## 8. Cross-cutting Frontend Logic

### 8.1 Pagination
Any list with `page`/`limit` params (`Contacts`, `Invoicing`): use a shared `<Pagination>` component + a `usePaginatedQuery` convention (page state in URL search params, not component state, so back/forward and refresh preserve position).

### 8.2 Filtering
URL-synced filters (search params) for every filterable list — enables shareable/bookmarkable filtered views and survives refresh. Debounce free-text search inputs (300ms).

### 8.3 Optimistic updates
Use for low-risk, high-frequency actions only: task status changes, deal stage drag-and-drop. Roll back on error with a toast. Do **not** optimistically update money-related mutations (invoices, payments) — wait for server confirmation there.

### 8.4 Async AI job pattern (generic hook)
Every AI endpoint follows: `POST` (enqueue, returns job/record id) → `GET .../result/:id` returns either the finished payload, or a "pending" shape, or 404 (not ready yet), or 422 (failed). Build one hook:

```ts
usePollUntilReady(resultQueryHook, id, { intervalMs: 1500, timeoutMs: 30000 })
```

Show: pending → skeleton + "AI is working..." with the cinematic loading style (not a generic spinner); success → render payload; 422/timeout → inline error with a "Try again" button that re-enqueues.

### 8.5 File upload flow
Encapsulate the 3-step S3 flow (§7.11) in a single `useFileUpload()` hook so every module (Contacts, Deals, Invoices) reuses it identically — do not duplicate the presign/PUT/confirm sequence per screen.

### 8.6 Toasts & error handling
Global toast system (shadcn `sonner` or `toast`) fed by a single RTK Query error middleware: any non-2xx response → human-readable toast (map known status codes — 400/403/404/409/422/500/502 — to friendly copy per module; unknown → generic "Something went wrong").

### 8.7 Permissions
`useRole()` + `<RequireRole>` (see §4) used consistently across Team, Plan, Time Entry deletion, and any Owner/Admin-only action listed in the spec's response descriptions (403 cases).

---

## 9. Environment Variables (frontend)

```
NEXT_PUBLIC_API_URL=            # NestJS API base URL
NEXT_PUBLIC_APP_NAME="Business OS"
```

No secrets live in the frontend — WhatsApp tokens, Gmail/Outlook client secrets, S3 keys, Gemini key all stay backend-side per the existing architecture.

---

## 10. Implementation Phases (frontend)

Work through these in order; commit after each Definition of Done is met.

**Phase F0 — Project scaffold from zero**

Nothing exists yet — this phase creates the whole project and installs everything before any UI work starts.

```bash
# 1. Scaffold Next.js (App Router, TS, Tailwind, ESLint, src/ dir, import alias @/*)
npx create-next-app@latest business-os-frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd business-os-frontend

# 2. State management
npm install @reduxjs/toolkit react-redux

# 3. shadcn/ui
npx shadcn@latest init
# then add components as needed per phase, e.g.:
npx shadcn@latest add button card input label dialog dropdown-menu table tabs badge avatar sonner select checkbox popover calendar

# 4. Forms & validation
npm install react-hook-form zod @hookform/resolvers

# 5. Data viz & dates
npm install recharts date-fns

# 6. Icons
npm install lucide-react

# 7. Drag-and-drop (Deals kanban)
npm install @dnd-kit/core @dnd-kit/sortable

# 8. Fonts: Inter/Geist via next/font (no install needed, configure in layout.tsx)

# 9. i18n
npm install next-intl

# 10. Theming (dark/light)
npm install next-themes
```

Then:
- Apply design tokens (§2.1) as CSS variables in `globals.css` + Tailwind theme extension.
- Build the folder structure exactly as in §3 (empty files/folders are fine at this stage — this is scaffolding, not implementation).
- Set up `next-intl`: `src/i18n/routing.ts` + `request.ts`, `middleware.ts` combining locale detection with the auth guard, `messages/ru.json` (default) + `messages/tj.json` + `messages/en.json` seeded with the nav labels and static copy visible in the mockups (sidebar items, page titles, button labels). All new UI copy from Phase F1 onward goes through `useTranslations()` / `getTranslations()` — no hardcoded user-facing strings.
- Global layout shell: Sidebar + Topbar components (static, no data yet) matching the mockups.
- Auth pages (`/login`, `/register`) built as static UI first — no API calls yet, that's Phase F1.
- Configure `NEXT_PUBLIC_API_URL` in `.env.local`.
- Initialize git, first commit: "chore: project scaffold + design system + i18n".

**Design reference for this phase and every phase after**: the Nexus OS mockup PNGs (Dashboard, Contacts, Deals, Tasks, Communications, WhatsApp, Email, Files, Calendar, Settings, Team, Invoicing, AI Assistant, Login, Register, Landing) are the visual source of truth. When working in Claude Code, attach the relevant mockup image(s) for the screen being built in that turn — e.g. attach `Dashboard Overview - Nexus OS (Restyled).png` when building Phase F2, attach `Deals Pipeline - Nexus OS (Restyled).png` when building Phase F4, etc. Match layout, spacing, color, and component style from the image; §2 of this doc is the fallback spec when a mockup doesn't cover a specific state (loading/error/empty).

DoD: `npm run dev` runs clean; `/login` and `/register` render pixel-close to mockups; dashboard shell renders with sidebar nav (all nav items from mockups present) and empty content areas; theme toggle in Topbar switches dark↔light instantly with no unstyled flash; no TypeScript errors; first commit made.

**Phase F1 — Auth**
Wire `authSlice`, `baseApi` with token attach + 401 refresh interceptor, `middleware.ts` route protection, real register/login/logout/refresh.
DoD: full login→dashboard→logout loop works against the live API; hard refresh preserves session via refresh cookie.

**Phase F2 — Dashboard**
All 7 dashboard endpoints wired with independent loading states.
DoD: dashboard fully data-driven, matches KPI/section layout in mockup.

**Phase F3 — Contacts**
List (search/filter/pagination), create/edit, detail page with timeline tab.
DoD: full CRUD + timeline working.

**Phase F4 — Deals**
Kanban board, drag-to-stage, detail drawer, create/edit.
DoD: drag-and-drop persists stage changes; board totals correct.

**Phase F5 — Tasks & Time Tracking**
List/board, status changes, timer widget (start/stop/active/log/delete-entry).
DoD: only one active timer enforced client-side and matches server 409 behavior.

**Phase F6 — Communications + Files**
Unified feed, notes, AI summary trigger/display; file upload hook + Files screen.
DoD: 3-step S3 upload works end-to-end for at least Contacts and Deals.

**Phase F7 — WhatsApp + Email**
Account connect forms (WhatsApp), send flows for both channels, Gmail/Outlook OAuth connect buttons + integration status polling.
DoD: UI fully built and wired; actual sends may show the backend's known-paused-feature errors gracefully (see §11) until those are unblocked.

**Phase F8 — AI Assistant**
Query box, draft-email flow, quotation builder, generic poll hook (§8.4) reused across all four AI features.
DoD: all four AI flows work end-to-end once `GEMINI_API_KEY`/Anthropic credits are configured backend-side; until then, UI correctly surfaces the 500 "not configured" state.

**Phase F9 — Invoicing**
List/filter/pagination, create, status pill, payments sub-flow.
DoD: adding a payment that fully covers the invoice auto-reflects PAID status after refetch.

**Phase F10 — Calendar**
Month/week grid, meeting CRUD, Google Calendar connect/status/disconnect.
DoD: calendar UI complete; Google Calendar connection functional once backend OAuth is reachable.

**Phase F11 — Settings**
Company profile, Team (users & roles) with role-gated actions, Integrations status, Plan management.
DoD: role-gating verified for at least two roles (e.g., OWNER sees everything, SALES sees a reduced set).

**Phase F12 — Polish**
Empty states, skeleton loading everywhere, animation pass (§2.4), responsive check (tablet breakpoint minimum), accessibility pass on forms/modals.

---

## 11. Degraded-mode UX (paused backend features)

Build the UI now; handle these gracefully rather than blocking:

- **WhatsApp send** (blocked on Meta phone-number field issue): build full send UI; a `502`/`400` from `/whatsapp/send` shows "WhatsApp sending isn't available yet for this number — check back soon" instead of a raw error.
- **Email OAuth** (needs ngrok HTTPS redirect): Connect buttons work once backend is reachable; if the consent URL endpoint 500s, show "Email connection is being set up — try again later."
- **AI features** (needs Anthropic API credits): all four AI actions handle their documented `500` ("not configured") the same way — a calm "AI features are being activated" state, not an error-red banner.

None of these should read as a broken app — they read as features mid-rollout.

---

## 12. Appendix — Mockup file → Phase map

Give Claude Code the matching image(s) as attachments when starting each phase:

| Phase | Mockup file(s) |
|---|---|
| F0 | `Login - Nexus OS.png`, `Register - Nexus OS.png`, `Business OS - Cinematic Landing Page (Globe Motif).png`, `Business OS Landing Page.png`, `Shader.png` |
| F2 | `Dashboard Overview - Nexus OS (Restyled).png` |
| F3 | `Contacts CRM - Nexus OS.png` |
| F4 | `Deals Pipeline - Nexus OS (Restyled).png` |
| F5 | `Tasks - Nexus OS.png` |
| F6 | `Communications - Nexus OS.png`, `Files - Nexus OS.png` |
| F7 | `WhatsApp - Nexus OS.png`, `Email - Nexus OS.png` |
| F8 | `AI Assistant - Nexus OS.png` |
| F9 | `Invoicing - Nexus OS (Restyled).png` |
| F10 | `Calendar - Nexus OS.png` |
| F11 | `Settings - Nexus OS.png`, `Team - Nexus OS (Restyled).png` |

## 13. Open Questions / Non-goals for MVP

- No websocket/live-push in the current API — all "live" feeling data (active timer, integration status) is achieved via polling or refetch-on-focus, not sockets. Revisit only if a future backend phase adds one.
- No "forgot password" endpoint in the spec — hide that link or mark as coming soon; do not fake a flow against a nonexistent endpoint.
- Telegram/Stripe/PayPal appear in `GET /company/integrations` status but have no connect endpoints in this spec — render their cards as "Coming soon", not connectable yet.
