# Backend Issues

Issues found during frontend QA that require backend investigation/fixes. Frontend code was not modified to work around these (except where noted).

Last re-verified live against `http://localhost:5129` on 2026-08-08 (backend rewritten to .NET/EF Core in commit `e96e689`). Issues that were previously listed here and are now confirmed fixed — `dashboard/revenue`+`finance`+`forecast` shapes, `dashboard/activity-feed` nested `data`, `invoices/:id` nested `contact`, `users/invite` 500 for `mmgosimov@gmail.com`, `tasks/time/active` missing `taskTitle` — have been removed from this file. The frontend code for those was already correct against the originally-agreed contract and needed no changes now that the backend matches it again, **except** the active-timer widget (`src/components/tasks/active-timer-widget.tsx`), which was reading a nonexistent `activeEntry.task.title` — that's been fixed this pass to read the new flat `taskTitle` field, along with the `TimeEntry`/`ActiveTimeEntry` types in `src/types/api.ts`.

**Update 2026-08-08 (later same day):** SMTP has now been configured on the backend (`SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` set). Confirmed working for the `/register` → `/auth/verify-email` OTP flow — the 6-digit code email arrives. Issue #4 below (previously: no email ever sent, for either invite or verification-code emails) is removed as fixed for the verification-code path. The invite-email path (`POST /users/invite`) uses the same `SmtpMailService`, so it's very likely also fixed now, but hasn't been separately re-verified live yet — the frontend's manual "Copy invite link" fallback in `InviteUserSheet` has been left in place until that's confirmed, since it's a harmless no-op if the backend does send the email now.

**Update 2026-08-08 (live re-test of the invite flow, later still):** Live-tested `POST /users/invite` for a `ReadOnly`-role user (`notebookaccoun1@gmail.com`) via the actual UI (Settings → Team → Invite User). Result:
- The response no longer includes `inviteToken` — `InviteUserSheet` closed immediately instead of showing the "Copy invite link" panel, confirming the backend now sends the email itself (issue #4's invite-email gap is fixed on the "does an email arrive" axis).
- **But the email that arrived contains only a 6-digit code (confirmed: no link, no token, just a code) — not a link to `/accept-invite?token=...`.** This is a new contract break: the entire invite/accept flow was built around `POST /auth/accept-invite {token, password}` consuming a URL token (`src/app/[locale]/(auth)/accept-invite/page.tsx`), and there is no frontend screen that accepts a bare 6-digit code for an *invited* user — the only 6-digit-code UI that exists (`VerifyEmailStep` in `src/app/[locale]/(auth)/register/page.tsx`) is wired to `POST /auth/verify-email` for *self-registration*, which takes no password and returns tokens directly (it's not an "accept invite and set your password" flow).
- **Open question for backend:** what is the invited user now supposed to do with this code? If invite emails were switched from a link+token to a code, the backend needs to either (a) go back to sending the `/accept-invite?token=...` link, or (b) specify a new endpoint contract (e.g. does the code pair with `POST /auth/accept-invite` in place of `token`? does it need a new "set password" step after code entry?) so the frontend can build a matching screen. Nothing has been built on the frontend for this yet — do not assume `VerifyEmailStep`'s endpoint applies to invited users without confirming, since it has no password field and returns live tokens for what the backend still considers an unauthenticated, passwordless account.

**Resolved 2026-08-08 (backend confirmed option (b)):** the contract is `POST /auth/login-code {email, code}` (same response shape as `/auth/login`, minted tokens directly) plus `POST /auth/resend-invite-code {email}`, and `/auth/accept-invite` was removed from the backend entirely (confirmed via live `/swagger/v1/swagger.json` — the route no longer exists) rather than restored. Also new: `GET /users/me` now returns `hasPassword`, and `POST /users/me/set-password` / `POST /users/me/change-password` let a user add or change a password after the fact. Frontend now implements all of this: a Password/Invite-code tab switch on `/login`, a post-login "set a password" nudge banner, a Password section under a new `/settings/profile` tab, and `InviteUserSheet` now shows "An invite code was sent to {email}" instead of the old copy-link panel (verified live: `POST /users/invite` no longer returns `inviteToken` — confirmed via a live invite in this pass, response carries no token, backend sends the code by email itself). The old `/accept-invite` page now just redirects to `/login?tab=code` server-side, for any invite links sent before this change. `inviteToken` has been removed from the `User` type and `AcceptInviteRequest`/`acceptInvite` removed from the frontend entirely since the endpoint is gone.

Also new this pass: `POST /auth/register` now requires a `role` field (`Founder|Sales|Marketing|Operations|Support|Other`) and returns `{ email, requiresVerification: true }` instead of tokens, gated behind a new `POST /auth/verify-email` + `POST /auth/resend-verification` OTP flow. Frontend has been updated to match (role picker + verify-code step on `/register`, plus a new `/accept-invite` page that previously didn't exist at all). See issue 4 (removed) for what previously existed here — this closes that gap.

---

## 1. `POST /contracts` swagger marks `counterpartyName` as `nullable: true`, but the endpoint still 400s without it

**Route:** `/en/contracts` → New Contract
**Endpoint called:** `POST /contracts`

**Actual behavior (re-verified live 2026-08-08):**
```
POST /contracts {"title":"Verify Test Contract"}
→ 400 {"errors":{"CounterpartyName":["The CounterpartyName field is required."]}}
```
Still broken exactly as originally found — no change since the .NET rewrite.

**Frontend mitigation already applied (unchanged):** `ContractFormSheet` treats "Counterparty name" as required for submission, matching actual backend behavior.

---

## 2. `POST /expenses` swagger marks `paidById` and `category` as optional, but the endpoint requires them

**Route:** `/en/inventory` → Expenses tab → New Expense
**Endpoint called:** `POST /expenses`

**Actual behavior (re-verified live 2026-08-08):**
```
POST /expenses {"description":"Verify test","amount":10,"currency":"TJS","date":"2026-08-08T00:00:00Z"}
→ 400 {"errors":{"Category":["The Category field is required."],"PaidById":["The PaidById field is required."]}}
```
Both fields confirmed still broken — no change since the .NET rewrite.

**Frontend mitigation:** `ExpenseFormSheet` already treated "Paid by" as required. This pass also tightened `category` to be required in the form (it previously wasn't), since the backend has now enforced it across two rewrites — this isn't going to be relaxed.

---

## 3. `POST /products` swagger marks `sku` as `nullable: true`, but the endpoint still 400s without it

**Route:** `/en/inventory` → Products tab → New Product
**Endpoint called:** `POST /products`

**Actual behavior (re-verified live 2026-08-08):**
```
POST /products {"name":"Verify Product","price":10,"cost":5,"currency":"TJS","unit":"Piece","isActive":true}
→ 400 {"errors":{"Sku":["The Sku field is required."]}}
```
Still broken exactly as originally found — no change. Same class of bug as issues #1 and #2 above.

**Frontend mitigation:** `ProductFormSheet` did not previously require SKU; this pass added it to the required-field check, matching actual backend behavior.

---

## 4. `DELETE /users/me/media` does not exist on the backend

**Route:** `/en/settings/profile` → hover avatar or cover → "Remove photo"
**Endpoint called:** `DELETE /users/me/media { target: "Avatar" | "Cover" }`

**Actual behavior (verified live 2026-08-09 against `http://localhost:5129/swagger/v1/swagger.json`):** the live Swagger doc lists `POST /users/me/media/presign` and `POST /users/me/media/confirm`, but no `DELETE` route under `/users/me/*` at all, and no route named `media` besides those two POSTs. Cross-checked against every `DELETE` route in the spec (`/users/{id}`, `/contacts/{id}`, etc.) — the media-delete route simply isn't registered.

**Frontend implementation:** built anyway per the originally-agreed contract (`src/lib/api/users.api.ts` → `deleteProfileMedia`, called from the new `EditPhotoDialog` at `src/components/settings/edit-photo-dialog.tsx`), sending `DELETE /users/me/media` with a JSON body `{ target }` (matching the body style already used by the presign/confirm endpoints). This will 404 in production until the backend adds the route. If the backend instead expects a query-string `target` param rather than a JSON body once implemented, only the `query` function of the `deleteProfileMedia` mutation needs to change.

---
