# Backend Issues

Issues found during frontend QA that require backend investigation/fixes. Frontend code was not modified to work around these.

---

## 1. `POST /auth/refresh` returns 401 immediately after a successful login, breaking session persistence across page reloads

**Route:** any dashboard route, e.g. `/en/dashboard`
**Endpoint called:** `POST http://localhost:5129/auth/refresh`

**Expected behavior:**
After a successful `/auth/login`, the backend should set a valid `refresh_token` cookie. A subsequent `POST /auth/refresh` (sent with `credentials: "include"`) should succeed and return a fresh `accessToken`, so a hard page reload keeps the user signed in.

**Actual behavior:**
Immediately after signing in via the UI (`/en/login` → `/en/dashboard`), doing a full page reload (or any hard navigation) triggers `SessionProvider`'s bootstrap call to `POST /auth/refresh`, which returns `401`. The app then redirects back to `/login`, logging the user out.

Observed in the network log:
```
POST http://localhost:5129/auth/refresh   401
POST http://localhost:5129/auth/refresh   401   (retry from baseApi's reauth handler)
GET  http://localhost:5173/login          200
```

**Steps to reproduce:**
1. Go to `/en/login`, sign in with valid credentials.
2. Land on `/en/dashboard` successfully.
3. Hard-reload the page (or navigate via a full URL load, not client-side `Link` navigation).
4. Observe: redirected back to `/login`; `POST /auth/refresh` returned 401 in the network tab.

**Notes:**
- Frontend already sends `credentials: "include"` on all requests (`src/lib/api/baseApi.ts`) and calls `/auth/refresh` correctly on mount (`src/components/shared/session-provider.tsx`), so this is not a missing-cookie-on-the-request-side issue.
- Suspect either: (a) the `refresh_token` cookie isn't actually being set/persisted by `/auth/login`, (b) it's being set with attributes the browser rejects in this environment (e.g. `SameSite=None` without a context Chrome treats as secure), or (c) the refresh token is invalidated too quickly server-side.
- Impact: any full page reload while authenticated logs the user out. This also affects deep-linking to any dashboard route from a fresh tab/hard nav.
- **Additional observation:** the access token also appears to be very short-lived. During QA, an active session (no reload, just in-app navigation) was force-logged-out after roughly 10-15 minutes of normal use, consistent with `/auth/refresh` failing once the access token expired and no valid refresh token being available to recover it. Combined with the above, this makes any session that isn't reloaded also die quickly with no way to silently recover.

---

## 2. `/dashboard/revenue` and `/dashboard/finance` return non-numeric `totalWonValue`/`totalOutstanding` for a company with no won deals/invoices yet

**Route:** `/en/dashboard`
**Endpoints called:** `GET /dashboard/revenue`, `GET /dashboard/finance`

**Expected behavior:** Per the frontend type contract (`RevenueAnalytics.totalWonValue: number`, `FinanceAnalytics.totalOutstanding: number`), these should always be numbers — `0` for a company with no won deals or no outstanding invoices yet.

**Actual behavior:** The dashboard KPI tiles rendered "TJSNaN" for Total Revenue and Outstanding Invoices for this (empty/new) test company, meaning the values passed to `Intl.NumberFormat` were non-finite (`null`/`undefined`/`NaN`), not `0`. `openDealsCount` and `openTasksCount` on the same dashboard correctly show `0`, so this looks isolated to the revenue/finance aggregates — classic symptom of a SQL `SUM()`/aggregate over zero rows returning `NULL` instead of being coalesced to `0`.

**Steps to reproduce:**
1. Log in as a user/company with zero won deals and zero invoices.
2. Load `/en/dashboard`.
3. Observe "TOTAL REVENUE" and "OUTSTANDING INVOICES" tiles show "TJSNaN".

**Frontend mitigation applied:** `formatCurrency` (`src/lib/utils.ts`) now coerces non-finite values to `0` before formatting, so the UI no longer shows literal "NaN" to users. The underlying null/undefined aggregate from the backend should still be fixed at the source.

**Related:** `GET /dashboard/forecast`'s `confidencePercentage` has the same issue — rendered "Confidence NaN%" on the 30-Day Forecast card for the same empty-company case. Same frontend mitigation pattern applied in `src/components/dashboard/forecast-card.tsx`.

---

## 3. `GET /contacts/:id` returns 200 but with empty/missing fields (id, firstName, etc.), while `GET /contacts` (list) returns the same contact correctly

**Route:** `/en/contacts/:id` (e.g. `/en/contacts/41a3598e-cc0e-4146-b69b-b4058e290842`)
**Endpoint called:** `GET http://localhost:5129/contacts/41a3598e-cc0e-4146-b69b-b4058e290842`

**Expected behavior:** Should return the `Contact` object with the same shape as items in the `GET /contacts` list response (`id`, `firstName`, `lastName`, `email`, `companyName`, etc.).

**Actual behavior:**
1. Created a contact ("Alice Johnson", Acme Corp) via the UI — it appears correctly in the contacts list/table.
2. Clicked into the contact detail page. The request `GET /contacts/41a3598e-cc0e-4146-b69b-b4058e290842` returns `200`, but the page renders a blank avatar and "—" for the name — meaning `firstName`/`lastName`/`email` all came back falsy.
3. Because `contact.id` was also empty, the timeline component fired `GET /contacts/undefined/timeline`, which 404'd.
4. A toast also surfaced: "Something went wrong. Please try again."

**Steps to reproduce:**
1. Create a contact via `/en/contacts` → Add Contact.
2. Confirm it appears correctly in the list table.
3. Click the contact row to open `/en/contacts/:id`.
4. Observe blank name/avatar and the error toast; check network tab for `GET /contacts/:id` (200, but check response body — fields are empty/missing) followed by `GET /contacts/undefined/timeline` (404).

**Notes:**
- This strongly suggests the single-item `GET /contacts/:id` endpoint uses different serialization than the list `GET /contacts` endpoint (e.g. wrapped envelope, different field casing, or a lookup bug returning an empty/default object instead of 404 when something's off).
- Frontend mitigation applied: `ContactTimeline` now skips its query when `contactId` is falsy (`src/components/contacts/contact-timeline.tsx`), so it no longer fires a doomed request to `/contacts/undefined/timeline`. The core issue — the detail page not showing contact data — is unfixed pending the backend correction.

---

## 4. `POST /tasks/:id/time/start` returns 415 Unsupported Media Type, so the task timer can never be started

**Route:** `/en/tasks` → open a task → "Start timer"
**Endpoint called:** `POST http://localhost:5129/tasks/:id/time/start`

**Expected behavior:** Should start a time entry for the task (200/201).

**Actual behavior:** Returns `415 Unsupported Media Type`, and the UI surfaces "Something went wrong. Please try again." Confirmed with two variants: no request body/no `Content-Type` header, and an explicit `{}` JSON body with `Content-Type: application/json` — both return 415. Since neither variant satisfies the endpoint, this isn't fixable from the frontend request shape; the endpoint's content-type handling itself needs fixing.

**Steps to reproduce:**
1. Create a task via `/en/tasks` → New Task.
2. Click into the task, click "Start timer".
3. Observe the error toast; network tab shows `POST /tasks/:id/time/start` → 415.

**Notes:** `POST /tasks/:id/time/stop` likely has the same issue (same pattern, untested since start never succeeds). Likely also worth checking the other no-body POST endpoints for the same class of bug: `POST /calendar/disconnect`, `POST /users/:id/resend-invite`.

---

## 5. `GET /dashboard/activity` can return entries with a missing/null `data` payload, crashing the dashboard

**Route:** `/en/dashboard`
**Endpoint called:** `GET /dashboard/activity` (via `useGetActivityFeedQuery`)

**Expected behavior:** Every activity feed item should include its `data` payload (e.g. `{ id, title, ... }` for the related record).

**Actual behavior:** After creating a note via Communications → Add Note, the dashboard crashed entirely with `TypeError: Cannot read properties of undefined (reading 'title')` in `ActivityFeed`. The item responsible had `item.data` as `undefined`/`null` — likely the newly-created note/communication activity entry, since the crash appeared immediately after that action.

**Steps to reproduce:**
1. Create a note via `/en/communications` → Add Note (pick a contact, enter content, Save).
2. Navigate to `/en/dashboard`.
3. Observe a full-page runtime error instead of the Activity Feed rendering.

**Frontend mitigation applied:** `ActivityFeed` (`src/components/dashboard/activity-feed.tsx`) now optional-chains `item.data` so a missing payload degrades to showing the type label instead of crashing. The backend should still ensure every activity entry has a populated `data` field, particularly for the note/communication activity type.

---

## 6. `GET /invoices/:id` can return an invoice without a populated `contact` relation, crashing the invoice detail page

**Route:** `/en/invoices/:id`
**Endpoint called:** `GET /invoices/:id`

**Expected behavior:** The invoice detail response should include the related `contact` object (matching the `Invoice` type contract), same as it does in whatever produces the invoices list.

**Actual behavior:** Opening a freshly-created invoice's detail page crashed with `TypeError: Cannot read properties of undefined (reading 'firstName')` — `invoice.contact` was `undefined`.

**Steps to reproduce:**
1. Create an invoice via `/en/invoices` → New Invoice (pick a contact, amount, due date).
2. Click into the created invoice from the list.
3. Observe a full-page runtime error instead of the invoice detail view.

**Notes:** Same class of bug as issue #3 (`GET /contacts/:id`) — single-item GET endpoints in this backend seem to not consistently populate related records/fields that list endpoints do. Worth auditing all `GET /:resource/:id` endpoints for the same gap. **Frontend mitigation applied:** `invoice-detail-content.tsx` now optional-chains `invoice.contact` and falls back to plain text instead of a broken link when it's missing.

**Related:** `invoice.dueDate` was also missing/invalid on the same single-item response, causing a second crash (`RangeError: Invalid time value` from `new Date(undefined)`). Same fix pattern applied to `dueDate` and `payment.paidAt` — both now fall back to "—" instead of crashing.

**Scope is broader than just `contact`/`dueDate`:** after applying the crash fixes above, the invoice detail page loads but nearly every scalar field on the invoice is wrong/missing from `GET /invoices/:id`: `invoiceNumber` renders blank, `amount` renders "NaN" (Amount tile), and `status` doesn't match any of the `InvoiceStatus` enum values (the status dropdown shows the raw i18n key `enums.invoiceStatus...` instead of a label, because `t(status)` can't resolve it). This looks like the single-item invoice endpoint returns a near-empty/malformed object rather than being an isolated `contact`/`dueDate` gap — recommend comparing the exact JSON shape of `GET /invoices` (list item) vs `GET /invoices/:id` (single item) for the same invoice to find the discrepancy.

---

## 7. `GET /company/integrations` can omit one or more provider keys, crashing the Integrations settings tab

**Route:** `/en/settings/integrations`
**Endpoint called:** `GET /company/integrations`

**Expected behavior:** The response should always include a status object (`{ connected, comingSoon }`) for each of the six providers the UI renders: `whatsapp`, `gmail`, `outlook`, `telegram`, `stripe`, `paypal`.

**Actual behavior:** Opening Settings → Integrations crashed with `TypeError: Cannot read properties of undefined (reading 'connected')` — at least one provider key in the response was `undefined`.

**Steps to reproduce:**
1. Go to `/en/settings/integrations`.
2. Observe a full-page runtime error instead of the six provider rows.

**Frontend mitigation applied:** `ProviderRow` (`src/components/settings/integrations-content.tsx`) now treats a missing status as "not connected" instead of crashing. Backend should still ensure all six keys are always present in the response.

---

## 8. No email-verification (OTP) or role-selection step exists in registration

**Route:** `/en/register`
**Endpoint called:** `POST /auth/register`

**Expected (per QA brief):** New signups should support selecting a role and completing an OTP/email verification step before reaching the dashboard.

**Actual behavior:** `RegisterRequest` only accepts `companyName`, `name`, `email`, `password`. On success the app immediately dispatches credentials and routes straight to `/dashboard` — no OTP step, no role picker. `UserRole` (Owner/Admin/Manager/Sales/Support/Employee/ReadOnly) only appears in the invite-acceptance flow (`acceptInvite`), not self-registration.

**Note:** This isn't a regression/bug in existing code — it's a feature gap relative to the QA brief. Flagging here per user's instruction to note it rather than build new UI. If this is intended future work, it needs backend support (register endpoint accepting a role, an OTP-issuing/verification endpoint) before frontend work can start.

---

## 9. `POST /contracts` swagger marks `counterpartyName` as `nullable: true` on `CreateContractRequest`, but the endpoint 400s without it

**Route:** `/en/contracts` → New Contract
**Endpoint called:** `POST /contracts`

**Expected behavior:** Per the OpenAPI schema (`CreateContractRequest.counterpartyName: { type: "string", nullable: true }`), this field should be optional — a contract should be creatable with only a `title`.

**Actual behavior:** Submitting a contract with `title` (and optionally `templateId`/`content`) but no `counterpartyName` returns:
```json
{"status":400,"errors":{"CounterpartyName":["The CounterpartyName field is required."]}}
```
Confirmed via direct `curl POST /contracts` with a valid bearer token — not a frontend serialization issue.

**Steps to reproduce:**
1. `POST /contracts` with body `{"title":"Test","templateId":"<id>","content":"..."}` (no `counterpartyName`).
2. Observe `400` with the validation error above, despite the swagger schema saying the field is nullable.

**Frontend mitigation applied:** `ContractFormSheet` (`src/components/contracts/contract-form-sheet.tsx`) now treats "Counterparty name" as required for submission (`canSubmit` requires a non-empty value), matching actual backend behavior rather than the swagger contract. Backend should either relax the FluentValidation/model rule to match the documented-nullable schema, or fix the swagger annotation to mark it required so client generators don't get this wrong.

## 10. `POST /expenses` swagger marks `paidById` as `nullable: true` on `CreateExpenseRequest`, but the endpoint 400s without it

**Route:** `/en/inventory` → Expenses tab → New Expense
**Endpoint called:** `POST /expenses`

**Expected behavior:** Per the OpenAPI schema (`CreateExpenseRequest.paidById: { type: "string", nullable: true }`), this field should be optional.

**Actual behavior:** Submitting an expense with `description`/`amount`/`currency`/`category`/`date` but no `paidById` returns:
```json
{"status":400,"errors":{"PaidById":["The PaidById field is required."]}}
```
Confirmed via direct `curl POST /expenses` with a valid bearer token — not a frontend serialization issue.

**Steps to reproduce:**
1. `POST /expenses` with body `{"description":"Office rent","amount":1200,"currency":"TJS","category":"Rent","date":"2026-08-07T00:00:00Z"}` (no `paidById`).
2. Observe `400` with the validation error above, despite the swagger schema saying the field is nullable.

**Frontend mitigation applied:** `ExpenseFormSheet` (`src/components/inventory/expense-form-sheet.tsx`) treats "Paid by" as a required select, defaulting to the current user, matching actual backend behavior rather than the swagger contract. Same class of bug as issue #9 (Contracts `counterpartyName`) — backend should either relax the validation rule to match the documented-nullable schema, or fix the swagger annotation.
