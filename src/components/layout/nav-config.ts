import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/types/enums";
import {
  Bell,
  Bot,
  Building2,
  Calendar,
  ChartColumn,
  CircleCheck,
  Contact,
  CreditCard,
  Crown,
  FileSignature,
  FileText,
  Gem,
  LayoutGrid,
  Mail,
  MessageCircle,
  MessagesSquare,
  Network,
  PackageSearch,
  Palette,
  Plug,
  Receipt,
  Shield,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";

export type NavLabelKey =
  | "dashboard"
  | "aiAssistant"
  | "contacts"
  | "deals"
  | "tasks"
  | "communications"
  | "whatsapp"
  | "email"
  | "invoicing"
  | "contracts"
  | "files"
  | "calendar"
  | "reports"
  | "automation"
  | "inventory";

export type NavItem = {
  href: string;
  labelKey: NavLabelKey;
  icon: LucideIcon;
};

export type NavGroupLabelKey =
  | "communicationsSection"
  | "financeSection"
  | "operationsSection"
  | "insightsSection";

export type NavGroup = {
  key: string;
  titleKey: NavGroupLabelKey;
  icon: LucideIcon;
  items: NavItem[];
};

export type NavEntry =
  | { kind: "link"; item: NavItem }
  | { kind: "group"; group: NavGroup };

const communicationsGroup: NavGroup = {
  key: "communications",
  titleKey: "communicationsSection",
  icon: MessagesSquare,
  items: [
    { href: "/communications", labelKey: "communications", icon: MessagesSquare },
    { href: "/whatsapp", labelKey: "whatsapp", icon: MessageCircle },
    { href: "/email", labelKey: "email", icon: Mail },
  ],
};

const financeGroup: NavGroup = {
  key: "finance",
  titleKey: "financeSection",
  icon: Receipt,
  items: [
    { href: "/invoices", labelKey: "invoicing", icon: Receipt },
    { href: "/contracts", labelKey: "contracts", icon: FileSignature },
  ],
};

const operationsGroup: NavGroup = {
  key: "operations",
  titleKey: "operationsSection",
  icon: PackageSearch,
  items: [
    { href: "/inventory", labelKey: "inventory", icon: PackageSearch },
    { href: "/files", labelKey: "files", icon: FileText },
    { href: "/automation", labelKey: "automation", icon: Workflow },
  ],
};

const insightsGroup: NavGroup = {
  key: "insights",
  titleKey: "insightsSection",
  icon: ChartColumn,
  items: [
    { href: "/calendar", labelKey: "calendar", icon: Calendar },
    { href: "/reports", labelKey: "reports", icon: ChartColumn },
  ],
};

export const navEntries: NavEntry[] = [
  { kind: "link", item: { href: "/dashboard", labelKey: "dashboard", icon: LayoutGrid } },
  { kind: "group", group: communicationsGroup },
  { kind: "link", item: { href: "/ai", labelKey: "aiAssistant", icon: Bot } },
  { kind: "link", item: { href: "/contacts", labelKey: "contacts", icon: Contact } },
  { kind: "link", item: { href: "/deals", labelKey: "deals", icon: Gem } },
  { kind: "link", item: { href: "/tasks", labelKey: "tasks", icon: CircleCheck } },
  { kind: "group", group: financeGroup },
  { kind: "group", group: operationsGroup },
  { kind: "group", group: insightsGroup },
];

export type SettingsTabLabelKey =
  | "preferences"
  | "company"
  | "team"
  | "organization"
  | "rolesPermissions"
  | "security"
  | "integrations"
  | "plan"
  | "notifications"
  | "aiUsage"
  | "platformAdmin";

export type SettingsNavItem = {
  href: string;
  labelKey: SettingsTabLabelKey;
  icon: LucideIcon;
  roles?: readonly UserRole[];
  // IsPlatformAdmin is an internal-ops-only flag, not a tenant RBAC role -
  // kept separate from `roles` so it can't be widened to a real role by
  // accident. See RouteGuard's platformAdminOnly branch.
  platformAdminOnly?: boolean;
};

export const settingsNavItems: SettingsNavItem[] = [
  { href: "/settings", labelKey: "company", icon: Building2 },
  { href: "/settings/preferences", labelKey: "preferences", icon: Palette },
  { href: "/settings/team", labelKey: "team", icon: Users },
  { href: "/settings/organization", labelKey: "organization", icon: Network, roles: ["Owner", "Admin", "Manager"] },
  { href: "/settings/roles", labelKey: "rolesPermissions", icon: Shield, roles: ["Owner", "Admin"] },
  { href: "/settings/security", labelKey: "security", icon: ShieldCheck, roles: ["Owner", "Admin"] },
  { href: "/settings/integrations", labelKey: "integrations", icon: Plug, roles: ["Owner", "Admin"] },
  { href: "/settings/plan", labelKey: "plan", icon: CreditCard, roles: ["Owner", "Admin"] },
  { href: "/settings/ai-usage", labelKey: "aiUsage", icon: Bot, roles: ["Owner", "Admin"] },
  { href: "/settings/notifications", labelKey: "notifications", icon: Bell },
  { href: "/settings/platform", labelKey: "platformAdmin", icon: Crown, platformAdminOnly: true },
];
