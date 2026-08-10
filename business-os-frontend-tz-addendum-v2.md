# Business OS — Frontend TZ Addendum v2
> Дельта байни **Frontend Architecture TZ** (навишта барои backend-и кӯҳна) ва **swagger-и нави .NET 8 / ASP.NET Core**.
> Ин ҳуҷҷат ҷойи TZ-и асосиро иваз намекунад — онро **пур мекунад**. Ҳар ҷо ки навишта шудааст "TZ §X", маънояш: ҳамон ҷои ҳуҷҷати аслӣ бо ин маълумот бояд иловагӣ/ислоҳ шавад.

---

## 0. Хулосаи фарқият

TZ-и аслӣ барои backend-и **NestJS** (13 модул: Auth, Users, Contacts, Deals, Tasks, Communications, WhatsApp, Email, AI, Files, Company, Invoicing, Calendar, Analytics) навишта шуда буд.

Swagger-и нав **32 tag** дорад. Модулҳое, ки дар TZ буданд — ҳамон тавр монданд (баъзеашон бо майдонҳои иловагӣ). Аммо **як гурӯҳи калони модул тамоман нав аст** ва дар TZ зикр нашудааст:

| Гурӯҳ | Tag-ҳои нав | Тавзеҳ |
|---|---|---|
| **RBAC воқеӣ** | `Roles`, `Permissions`, `Departments`, `Teams`, `Branches`, `OrgChart` | Аллакай backend-ат тайёр (Phase 1 confirmed) — frontend бояд UI-и идоракунии ин чизҳоро дошта бошад |
| **Аудит ва хавфсизӣ** | `AuditLog`, `ActivityLog`, `Sessions`, `ApiKeys`, `NotificationPreferences`, `Notifications` | Phase 2 (delivered) |
| **Шартнома** | `Contracts` | Click-to-sign MVP, тибқи қарори қаблӣ |
| **Молиявӣ/захира** | `Products`, `Categories`, `Suppliers`, `PurchaseOrders`, `Inventory`, `Expenses` | ⚠️ **Диққат:** ин модулҳо CRM-ро ба таври возеҳ ба тарафи retail/inventory мебаранд — дар мушаххасоти аслии Business OS (CRM+WhatsApp+Email+AI барои SMB) зикр нашуда буданд. Пеш аз лоиҳакашии frontend бояд тасдиқ шавад, ки инҳо воқеан лозиманд ё бо сабаби умумӣ будани backend template омадаанд. |
| **Гузоришот** | `Reports`, `Search` | Гузоришоти алоҳида аз Analytics/dashboard |
| **Автоматика** | `Workflows`, `Webhooks` | Automation engine — калон, алоҳида фаза металабад |
| **Тарифҳо** | `Plans`, `Subscription` (+ `Company/subscription/*`) | Дуплекс: ҳам company-level plan (кӯҳна), ҳам subscription system-и нав бо billing cycle |
| **Танзимот** | `Settings` (умумӣ/company/security/branding) | Ҷудо аз `Company` — эҳтимол ҳоло ҳарду вуҷуд доранд, бояд аниқ кард кадомаш authoritative |
| **Шаблонҳо** | `Templates` | Барои Contract/Email |

---

## 1. Auth & RBAC — тағйирот дар TZ §4

TZ-и кӯҳна фарз мекард, ки нақш як `enum Role` (OWNER/ADMIN/...) аст. Swagger нишон медиҳад, ки ҳоло **ду системаи нақш параллел** вуҷуд дорад:

```ts
// enums.ts — object ivaz namekunad, faqat iловагӣ мешавад
export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'SALES' | 'SUPPORT' | 'EMPLOYEE' | 'READ_ONLY'; // hamon Role enum

// НАВ: RBAC custom role
interface RbacRole {
  id: string;
  name: string;
  description?: string;
  permissionIds: string[];
}
```

`InviteUserRequest` ва `UpdateRoleRequest` ҳарду майдонро доранд:
```ts
{ role: UserRole; rbacRoleId?: string }
```

**Хулоса барои frontend**: Team screen (TZ §7.13, §7.9 Settings→Team) бояд:
- Ҳангоми invite/تغيير роли корбар — интихоби **ё** enum-role пешфарз, **ё** RBAC role-и custom аз `GET /roles` (агар компания permission matrix-и худро сохта бошад).
- Саҳифаи нав **Settings → Roles & Permissions**: рӯйхати `GET /roles`, эҷод/таҳрир (`POST/PATCH /roles`), attach/detach permission (`POST /roles/:id/permissions`, `DELETE /roles/:roleId/permissions/:permissionId`), рӯйхати ҳамаи permission-ҳо аз `GET /permissions?module=`.
- `useRole()` hook бояд аз ҳарду манбаъ (enum + RBAC permission list аз `GET /users/:id/permissions`) кор кунад — TZ-и кӯҳна танҳо enum-ро тафтиш мекард.

---

## 2. Иловаҳо ба §5 Data Contracts (enums.ts)

```ts
export type ContractStatus = 'DRAFT' | 'SENT' | 'SIGNED' | 'EXPIRED' | 'CANCELLED';
export type PurchaseOrderStatus = 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
export type ProductUnit = 'PIECE' | 'KG' | 'GRAM' | 'LITER' | 'MILLILITER' | 'METER' | 'BOX' | 'PACK';
export type TemplateType = 'CONTRACT' | 'EMAIL' | 'OTHER';
export type NotificationType =
  | 'DEAL_ASSIGNED' | 'TASK_ASSIGNED' | 'TASK_DUE' | 'TASK_OVERDUE'
  | 'MENTION_IN_COMMENT' | 'LEAD_ASSIGNED' | 'PAYMENT_RECEIVED'
  | 'INVITE_ACCEPTED' | 'ROLE_CHANGED' | 'DEAL_STAGE_CHANGED';
export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'WHATSAPP';
export type WorkflowTriggerType = 'RECORD_CREATED' | 'RECORD_UPDATED' | 'RECORD_STATUS_CHANGED' | 'TIME_BASED' | 'FIELD_VALUE_MATCHES';
export type WorkflowActionType = 'SEND_NOTIFICATION' | 'SEND_EMAIL' | 'SEND_WHATSAPP_MESSAGE' | 'CREATE_TASK' | 'UPDATE_FIELD' | 'ASSIGN_OWNER';
export type ConditionOperator = 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'IS_EMPTY' | 'IS_NOT_EMPTY';
export type ConditionLogicOperator = 'AND' | 'OR';
export type BillingCycle = 'MONTHLY' | 'YEARLY';
```

---

## 3. Иловаҳо ба §6 RTK Query endpoint map

Ҷадвали нав, файлҳои иловагӣ дар `lib/api/`:

| Tag | Файл | Endpoint-ҳои асосӣ |
|---|---|---|
| `Roles` | `roles.api.ts` | findAll, findOne, create, update, remove, attachPermission, detachPermission |
| `Permissions` | `permissions.api.ts` | findAll (по module), findOne, create, update, remove |
| `Departments` | `departments.api.ts` | findAll (flat/tree), findOne, create, update, remove |
| `Teams` | `teams.api.ts` | findAll, findOne, create, update, remove, members: list/add/remove |
| `Branches` | `branches.api.ts` | findAll, findOne, create, update, remove |
| `OrgChart` | `orgChart.api.ts` | getFull, getForUser |
| `ActivityLog` | `activityLog.api.ts` | findAll, byUser, byContact, byDeal, byTask (ҳама pagination-dor) |
| `AuditLog` | `auditLog.api.ts` | findAll, loginHistory, security, permissionHistory, export |
| `Sessions` | `sessions.api.ts` | findAll (active sessions), revoke(:id), logoutAll |
| `ApiKeys` | `apiKeys.api.ts` | findAll, create, update, remove |
| `Notifications` | `notifications.api.ts` | findAll, unread, unreadCount, markRead, markAllRead, remove |
| `NotificationPreferences` | `notificationPreferences.api.ts` | get, update |
| `Contracts` | `contracts.api.ts` | findAll, findOne, create, update, remove, sign, archive, restore |
| `Templates` | `templates.api.ts` | findAll (by type), findOne, create, update, remove |
| `Products` | `products.api.ts` | findAll, findOne, create, update, remove, archive, restore |
| `Categories` | `categories.api.ts` | findAll, findOne, create, update, remove, archive, restore |
| `Suppliers` | `suppliers.api.ts` | findAll, findOne, create, update, remove, archive, restore |
| `PurchaseOrders` | `purchaseOrders.api.ts` | findAll, findOne, create, update, remove, archive, restore |
| `Inventory` | `inventory.api.ts` | findAll, findOne, create, update, remove, stockIn, stockOut |
| `Expenses` | `expenses.api.ts` | findAll, findOne, create, update, remove, archive, restore |
| `Reports` | `reports.api.ts` | findAll, create, run(:id), remove, + presets: employeePerformance/revenue/sales/tasks/customers/employees, export |
| `Search` | `search.api.ts` | global (`/search?q=&types=`), + per-entity (contacts/deals/tasks/files/emails/messages) |
| `Workflows` | `workflows.api.ts` | findAll, findOne, create, update, remove, toggle, executions (list + detail) |
| `Webhooks` | `webhooks.api.ts` | findAll, findOne, create, update, remove, logs |
| `Plans` | `plans.api.ts` | findAll, findOne, create, update, remove (admin/superadmin panel — на CRM UI-и оддӣ) |
| `Subscription` | `subscription.api.ts` | get, plans, usage, upgrade, cancel |
| `Settings` | `settings.api.ts` | getAll/updateAll, company, security, branding (ҳар кадом get+patch) |

**Эзоҳ:** `Plans` tag (CRUD-и тарифҳо) эҳтимол панели алоҳидаи super-admin аст, на қисми UI-и муштарӣ — тасдиқ талаб мекунад.

---

## 4. Company tag — иловаҳо ба TZ §7.13 Settings→Plan

`Company` энди инҳоро низ дорад: `GET /company/subscription`, `GET /company/usage`, `GET /company/features`, `POST /company/subscription/change-plan`, `POST /company/subscription/cancel`, `GET /company/invoices` (+ `GET /company/invoices/:id/pdf`), `POST /company/transfer-ownership`.

Settings → Plan саҳифа бояд иловагӣ дошта бошад:
- Usage bar (аз `/company/usage` — масалан "23/50 users", "1200/5000 contacts")
- Feature flags рӯйхат (аз `/company/features`) — кадом хусусиятҳо фаъоланд тибқи plan
- Billing history (`/company/invoices`, PDF download)
- "Transfer ownership" action (Owner only, бо password confirm)

---

## 5. Нав скринҳо/модулҳо барои §7 Screens ↔ API mapping

### 5.1 Settings → Roles & Permissions (нав)
RBAC матритса: рӯйхати role-ҳо (custom, аз `/roles`), барои ҳар як — checklist-и permission-ҳо (аз `/permissions?module=`) бо group-бандӣ аз рӯи module. Owner/Admin only.

### 5.2 Settings → Organization (нав)
Tabs: **Departments** (tree view, `GET /departments?flat=false`), **Teams** (list + members), **Branches** (list, `isHeadquarters` badge). Ҳар се — CRUD оддӣ бо RequireRole(['OWNER','ADMIN']).

### 5.3 Settings → Security & Audit (нав)
- Sessions: рӯйхати сессияҳои фаъол, revoke алоҳида ё `logoutAll`.
- API Keys: эҷод (бо copy-once token), фаъол/ғайрифаъол, ҳазф.
- Audit log: filterable jadval (action/user/date range), export CSV.
- Login history / permission history — sub-tabs.

### 5.4 Notifications (нав — bell icon дар Topbar)
Dropdown/panel: `GET /notifications/unread-count` барои badge, `GET /notifications` барои рӯйхат, mark-read/mark-all-read. Алоҳида **Settings → Notification Preferences**: matrix (type × channel: In-App/Email/WhatsApp toggle).

### 5.5 Contracts (нав, дар Deal detail ё алоҳида саҳифа `/contracts`)
Рӯйхат бо status filter, эҷод аз шаблон (`templateId` аз Templates), click-to-sign audit trail (`POST /contracts/:id/sign`), status pill (Draft→Sent→Signed/Expired/Cancelled).

### 5.6 Global Search (нав — Cmd+K/Topbar search)
`GET /search?q=&types=contacts,deals,tasks,...` — natijalar grouped by type, click → navigate.

### 5.7 Reports (нав, `/reports`)
Custom report builder (filters + groupBy + metrics аз DTO), presets (Employee Performance, Revenue, Sales, Tasks, Customers) ҳамчун tabs ё saved-report cards, export.

### 5.8 Workflows / Automation (нав, калон — ба фазаи алоҳида металабад)
Список workflow-ҳо бо toggle active/inactive, visual builder: trigger → condition groups (AND/OR nested) → actions (ordered list). Execution history per workflow.

### 5.9 Inventory Suite ⚠️ (тасдиқ талаб мекунад)
Агар тасдиқ шавад: Products (bilan Categories), Suppliers, Purchase Orders, Inventory (stock levels + stock-in/out), Expenses — ҳамаи инҳо CRUD+list+filter+archive/restore, дар шакли якхела бо Contacts/Deals table pattern.

---

## 6. Тағйирот дар Implementation Phases (TZ §10)

Фазаҳои F0–F12 **бетағйир мемонанд**. Иловагӣ:

| Фаза | Мазмун |
|---|---|
| **F13 — RBAC & Organization** | Roles/Permissions matrix, Departments/Teams/Branches CRUD, OrgChart view |
| **F14 — Security & Audit** | Sessions, API Keys, Audit/Activity log jadvallar, Notifications panel + preferences |
| **F15 — Contracts** | Contract list/detail/sign flow, Templates management |
| **F16 — Global Search** | Cmd+K palette + `/search` results page |
| **F17 — Reports** | Report builder + presets + export |
| **F18 — Workflows/Webhooks** | Automation builder (калонтарин фаза — эҳтимолан 2 sub-phase) |
| **F19 — Inventory Suite** ⚠️ | Танҳо агар тасдиқ шавад: Products/Categories/Suppliers/PurchaseOrders/Inventory/Expenses |
| **F20 — Subscription/Billing** | Usage bar, feature flags, invoice history, plan upgrade flow |

Ҳар фаза — ҳамон DoD-format (checklist + commit point) тибқи TZ §0.

---

## 7.5 Role → Component Visibility Matrix (иловагӣ ба TZ §4)

Ин матритса **UX-level gating** аст (`useRole()` + `<RequireRole>`, TZ §4) — backend боз ҳам ҳар request-ро аз рӯи permission-и воқеӣ тафтиш мекунад (403 агар лозим ояд). Frontend танҳо чизеро пинҳон/ғайрифаъол мекунад, ки корбар барои он тавре ки коркунад 403 мегирад.

Легенда: ✅ пурра дастрас · 👁 танҳо хондан (mutating actions пинҳон) · ❌ тамоман пинҳон/ноаён дар nav

| Компонент / Nav item | OWNER | ADMIN | MANAGER | SALES | SUPPORT | EMPLOYEE | READ_ONLY |
|---|---|---|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ | 👁 (шахсии худ) | 👁 (шахсии худ) | 👁 (шахсии худ) | 👁 |
| Contacts | ✅ | ✅ | ✅ | ✅ (owner=худ пешфарз) | 👁 | 👁 | 👁 |
| Deals / Kanban | ✅ | ✅ | ✅ | ✅ (own deals) | ❌ | ❌ | 👁 |
| Tasks & Time Tracking | ✅ | ✅ | ✅ | ✅ (assigned=худ) | ✅ (assigned=худ) | ✅ (assigned=худ) | 👁 |
| — Time entry delete | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Communications | ✅ | ✅ | ✅ | ✅ | ✅ | 👁 | 👁 |
| WhatsApp | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | 👁 |
| — Connect account (Advanced) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Email | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | 👁 |
| AI Assistant | ✅ | ✅ | ✅ | ✅ | ✅ | 👁 | 👁 |
| Invoicing | ✅ | ✅ | ✅ | 👁 | ❌ | ❌ | 👁 |
| Files | ✅ | ✅ | ✅ | ✅ | ✅ | 👁 | 👁 |
| Calendar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 👁 |
| Contracts (§5.5) | ✅ | ✅ | ✅ | ✅ (create/sign own deal) | ❌ | ❌ | 👁 |
| Global Search (§5.6) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reports (§5.7) | ✅ | ✅ | ✅ | 👁 (шахсии худ) | ❌ | ❌ | ❌ |
| Workflows (§5.8) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Notifications panel (§5.4) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Settings → Company** | ✅ | ✅ | 👁 | ❌ | ❌ | ❌ | ❌ |
| **Settings → Team** (invite/role) | ✅ | ✅ | 👁 | ❌ | ❌ | ❌ | ❌ |
| **Settings → Roles & Permissions** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Settings → Organization** (Dept/Team/Branch) | ✅ | ✅ | 👁 | ❌ | ❌ | ❌ | ❌ |
| **Settings → Security & Audit** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| — API Keys | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Settings → Integrations** | ✅ | ✅ | 👁 | ❌ | ❌ | ❌ | ❌ |
| **Settings → Plan/Subscription** | ✅ | 👁 | ❌ | ❌ | ❌ | ❌ | ❌ |
| — Change plan / Transfer ownership | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Inventory suite (§5.9, агар тасдиқ шавад) | ✅ | ✅ | ✅ | 👁 | ❌ | ❌ | 👁 |

**Қоидаҳои умумӣ (эзоҳ дар TZ §4 бояд илова шавад):**
- `READ_ONLY` — глобалӣ: ҳама mutating buttons (create/edit/delete/send/sign/start-timer) пинҳон, новобаста аз модул — ин аллакай дар TZ буд, инҷо танҳо such tashkil karda shud.
- `SALES`/`SUPPORT`/`EMPLOYEE` дар рӯйхатҳо (Contacts/Deals/Tasks) бо `ownerId`/`assignedTo` filter пешфарз маҳдуд мешаванд — ин UI-level default аст, на backend restriction (backend ҳанӯз ҳам умумиро бармегардонад, агар permission иҷозат диҳад).
- Ҳангоми `rbacRoleId` (custom RBAC role) мавҷуд будан — ин матритса **override** мешавад бо натиҷаи воқеии `GET /users/:id/permissions`; enum-based матритса танҳо fallback аст барои корбароне, ки танҳо enum role доранд (RBAC role насохтаанд).

---

## 7.6 Invite → Login flow — интизории дуруст (кушода барои тасдиқ)

TZ §4 қадами 1-ро тавсиф мекунад: `POST /auth/register` → корбари Owner. Аммо барои **invite** (`POST /users/invite`) TZ ин қадамҳоро возеҳ нанавиштааст. Тибқи swagger:

```
POST /users/invite  { name, email, role, rbacRoleId? }  →  бояд invite token созад ва (тахминан) email/notification фиристад
POST /auth/accept-invite  { token, password }  →  корбар account-ро фаъол мекунад, метавонад login кунад
POST /users/{id}/resend-invite  →  дубора фиристодани invite
```

**Тасдиқ шуд:** сабаб **SMTP-и backend танзим нашудааст** — `POST /users/invite` record-и invite-ро (бо token) месозад, аммо email тамоман намеравад. Ин ба худи қатори "paused backend features" (WhatsApp real-send, Gmail/Outlook OAuth) дохил мешавад — на баги frontend, на чизе ки frontend бояд "fix" кунад.

### Дуруст барои TZ §7.13 (Team) ва §11 (Degraded-mode UX):

**Flow-и дуруст (вақте SMTP кор кунад):**
```
Admin/Owner → "Invite user" form (name, email, role/rbacRoleId)
  → POST /users/invite → backend invite record + token месозад + email мефиристад
  → корбари нав link-ро мекушояд → /accept-invite?token=... саҳифа
  → форма: password + confirm → POST /auth/accept-invite {token, password}
  → account фаъол мешавад → redirect ба /login (ё auto-login агар API token баргардонад)
```

**Иловагӣ ба §11 — Degraded-mode UX барои invite:**
- Пас аз `POST /users/invite` муваффақ — toast на "Invite sent" балки: **"Invite created — email delivery is being set up, share this link manually for now"**, бо **тугмаи "Copy invite link"** (frontend худаш link-ро аз token месозад: `${APP_URL}/accept-invite?token=${token}`, агар backend token-ро дар response баргардонад — агар набардонад, инро ба backend TODO илова кун).
- Team list дар ҳар invited-корбар бояд нишон диҳад: статус **"Invited"** + тугмаи **"Copy link"** (на танҳо "Resend invite", чунки resend низ SMTP лозим дорад ва то ҳол кор намекунад) — `POST /users/{id}/resend-invite` low-priority, аммо copy-link ҳамеша бояд кор кунад.
- Ин мисли WhatsApp/Gmail — **"features mid-rollout"**, на error-и сурх.

**Саҳифаи нав, ки TZ надошт:** `/accept-invite` (public route, берун аз auth guard) — `token` аз query param, форма: Name (агар лозим), Password + Confirm → `POST /auth/accept-invite`. Дар F1 (Auth phase) бояд илова шавад, чунки бе SMTP низ **frontend flow-ро пурра тестида метавонад** — token-ро ба таври дастӣ аз backend/DB гирифта, URL-ро дастӣ сохта.

---

## 7. Кушода саволҳо (пеш аз оғози F13)

1. **Inventory suite (§5.9)** — воқеан лозим аст барои Business OS (CRM), ё ин аз backend template омадааст ва frontend-ро лозим нест бинед?
2. **`Plans` vs `Subscription/Company.plan`** — се роҳи гуногуни идоракунии тариф намоён аст. Кадомаш production flow аст?
3. **`Settings` tag vs `Company` tag** — ҳарду company profile доранд (`/settings/company` ва `/company`). Кадоме authoritative?
4. **Workflows/Webhooks** — ин automation engine хеле калон аст (nested condition groups, cron triggers). Оё дар MVP лозим аст ё баъдтар?

Ҷавоби ин 4 савол тартиби F13–F20-ро муайян мекунад.
