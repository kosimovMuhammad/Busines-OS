import type { NavLabelKey } from "@/components/layout/nav-config";
import type { UserRole } from "@/types/enums";

// Reuse the backend's role type as-is (PascalCase: "Owner" | "Admin" | ...).
// A separate UPPER_SNAKE union would never match the real runtime values.
export type Role = UserRole;

export const ALL_ROLES: Role[] = [
  "Owner",
  "Admin",
  "Manager",
  "Sales",
  "Support",
  "Employee",
  "ReadOnly",
];

// Settings-area modules. These aren't top-level nav entries (they live under
// /settings sub-items, gated today by nav-config.ts's `settingsNavItems` roles list),
// but they're modules for RBAC purposes just like the top-level nav items.
export type SettingsModuleKey =
  | "settingsProfile"
  | "settingsCompany"
  | "settingsTeam"
  | "settingsOrganization" // departments / teams / branches
  | "settingsRoles" // roles & permissions
  | "settingsSecurity" // sessions / api keys / audit log
  | "settingsIntegrations"
  | "settingsPlan" // subscription / billing
  | "settingsNotifications"
  | "settingsAiUsage";

export const ALL_SETTINGS_MODULE_KEYS: SettingsModuleKey[] = [
  "settingsProfile",
  "settingsCompany",
  "settingsTeam",
  "settingsOrganization",
  "settingsRoles",
  "settingsSecurity",
  "settingsIntegrations",
  "settingsPlan",
  "settingsNotifications",
  "settingsAiUsage",
];

// Mirrors NavLabelKey in nav-config.ts exactly - kept as a runtime array
// because NavLabelKey itself is type-only.
export const ALL_NAV_MODULE_KEYS: NavLabelKey[] = [
  "dashboard",
  "aiAssistant",
  "contacts",
  "deals",
  "tasks",
  "communications",
  "whatsapp",
  "email",
  "invoicing",
  "contracts",
  "files",
  "calendar",
  "reports",
  "automation",
  "inventory",
];

export type ModuleKey = NavLabelKey | SettingsModuleKey;

export const ALL_MODULE_KEYS: ModuleKey[] = [
  ...ALL_NAV_MODULE_KEYS,
  ...ALL_SETTINGS_MODULE_KEYS,
];

// Baseline module visibility per role. This is the primary sidebar/route gate
// (role-map based) - see useRole.hasPermission() for the finer-grained,
// permission-key-based layer that sits on top of this for per-user overrides
// (e.g. an Owner granting a SALES user a single extra permission).
export const ROLE_MODULE_MAP: Record<Role, ModuleKey[]> = {
  Owner: ALL_MODULE_KEYS,

  Admin: [
    "dashboard",
    "contacts",
    "deals",
    "tasks",
    "calendar",
    "communications",
    "whatsapp",
    "email",
    "files",
    "invoicing",
    "contracts",
    "reports",
    "aiAssistant",
    "automation",
    "inventory",
    "settingsProfile",
    "settingsCompany",
    "settingsTeam",
    "settingsOrganization",
    "settingsRoles",
    "settingsSecurity",
    "settingsIntegrations",
    "settingsPlan",
    "settingsNotifications",
    "settingsAiUsage",
    // NOT: transferOwnership / deleteCompany / changeSubscriptionOwner -
    // those are OWNER_ONLY_FEATURES below, gated inside settingsPlan/settingsSecurity.
  ],

  Manager: [
    "dashboard",
    "contacts",
    "deals",
    "tasks",
    "calendar",
    "communications",
    "whatsapp",
    "email",
    "files",
    "invoicing",
    "reports",
    "aiAssistant",
    "settingsProfile",
    "settingsCompany",
    "settingsTeam",
    "settingsOrganization", // existing nav-config.ts settingsNavItems already opens this item to Manager
    "settingsNotifications",
    // NOT: contracts, automation, inventory, settingsRoles, settingsPlan,
    // settingsSecurity, settingsIntegrations
  ],

  Sales: [
    "dashboard",
    "contacts",
    "deals",
    "tasks",
    "calendar",
    "communications",
    "whatsapp",
    "email",
    "files",
    "invoicing", // view-only, enforced at action level in Phase 6
    "aiAssistant",
    "settingsProfile",
    "settingsCompany",
    "settingsTeam",
    "settingsNotifications",
    // NOT: reports (financial reports), settingsRoles, settingsPlan
  ],

  Support: [
    "dashboard",
    "contacts",
    "whatsapp",
    "email",
    "communications",
    "tasks",
    "calendar",
    "files",
    "aiAssistant",
    "settingsProfile",
    "settingsCompany",
    "settingsTeam",
    "settingsNotifications",
    // NOT: deals, invoicing, reports, settingsRoles, settingsPlan
  ],

  Employee: [
    "dashboard",
    "tasks",
    "calendar",
    "files",
    "communications",
    "contacts",
    "aiAssistant",
    "settingsProfile",
    "settingsCompany",
    "settingsTeam",
    "settingsNotifications",
    // scoped to own/assigned records only - enforced at action/data level, not here
    // NOT: deals, invoicing, reports, contracts, inventory, automation, settingsRoles/Plan/etc
  ],

  ReadOnly: [
    "dashboard",
    "contacts",
    "deals",
    "tasks",
    "calendar",
    "invoicing",
    "reports",
    "files",
    "settingsProfile",
    "settingsCompany",
    "settingsTeam",
    "settingsNotifications",
    // all view-only - every mutating control disabled at action level (Phase 6/7)
  ],
};

// Reverse lookup off ROLE_MODULE_MAP - used by RouteGuard on page.tsx files
// so each page declares its guard as "whoever the module map allows" rather
// than a second, hand-maintained roles list that could drift from it.
export function getAllowedRoles(moduleKey: ModuleKey): Role[] {
  return ALL_ROLES.filter((role) => ROLE_MODULE_MAP[role].includes(moduleKey));
}

// Action-level gating (Phase 6/7). Module-level access (ROLE_MODULE_MAP /
// getAllowedRoles) already keeps a role that can't see a module out of it
// entirely - e.g. Support has no "deals" module access at all, so no
// deals-specific mutation-role list is needed. What's left, within a module
// a role CAN reach, is: (1) ReadOnly never mutates anywhere, and (2) Sales
// can view but not mutate Invoices specifically.
export const MUTATION_ALLOWED_ROLES: Role[] = ALL_ROLES.filter((r) => r !== "ReadOnly");

export const INVOICE_MUTATION_ALLOWED_ROLES: Role[] = MUTATION_ALLOWED_ROLES.filter(
  (r) => r !== "Sales"
);

// Action-level gating vocabulary, used by button-level guards (Phase 6/7).
export type PermissionAction =
  | "view"
  | "create"
  | "update"
  | "delete"
  | "archive"
  | "restore"
  | "invite"
  | "manage";

export const READ_ONLY_ALLOWED_ACTIONS: PermissionAction[] = ["view"];

// Features that must check role === "Owner" directly, in addition to any
// permission check - never grantable to non-owners even via a custom
// permission grant.
export const OWNER_ONLY_FEATURES = [
  "transferOwnership",
  "deleteCompany",
  "changeSubscriptionOwner",
] as const;

export type OwnerOnlyFeature = (typeof OWNER_ONLY_FEATURES)[number];
