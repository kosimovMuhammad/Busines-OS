# RBAC Backlog

Known gaps left out of the RBAC hardening pass (frontend, 7 roles: Owner/Admin/Manager/Sales/Support/Employee/ReadOnly). Not bugs in what was built — deliberately deferred scope. See `src/lib/permissions/constants.ts` for the current role/module/action model.

## Action-level gating not yet applied

Module-level access (sidebar + `RouteGuard`) is correct for all of these — a role that can't reach the module can't reach its buttons either. What's missing is the finer-grained Create/Edit/Delete/Archive gating *within* a module a role can already open (the same treatment already applied to Contacts, Deals, Tasks, Invoices, Files, Calendar, and Reports):

- **Contracts** — Owner/Admin only module, so lower urgency, but its Create/Edit/Delete/Sign controls aren't wrapped with `PermissionGuard`/`useCanMutate`.
- **Inventory** — Owner/Admin only module; Create/Edit/Delete/Archive controls (products, stock, purchase orders, suppliers, categories, expenses) aren't wrapped.
- **WhatsApp / Email** — compose/send actions aren't wrapped (module itself is correctly role-gated, but a role that *can* open WhatsApp/Email can send messages regardless of any finer per-action distinction).
- **Automation / Workflows** — Owner/Admin only module; create/edit/delete/enable-disable workflow controls aren't wrapped.

## Data-scoping (not a role check)

- **Employee "own/assigned records only"** — the spec calls for Employee to only mutate records assigned to them, which is per-record ownership, not a role check `PermissionGuard`/`useCanMutate` can express. Needs each list/detail component's `ownerId`/`assigneeId` field compared against the current user id, surveyed component-by-component, ideally backed by the same check server-side.

## Missing UI (net-new feature, not a gap in this pass)

- **No UI exists for an Owner to grant/revoke individual permission overrides on a user** — `useUpdateUserPermissionsMutation` (`src/lib/api/users.api.ts`) exists and is correctly wired to cache invalidation (tags `Users:{id}-PERMISSIONS`, consumed by `useGetUserPermissionsQuery`/`useRole`), but has zero call sites anywhere in `src/`. Building the Owner-facing UI for this is separate feature work.
