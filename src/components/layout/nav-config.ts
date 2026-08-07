import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Calendar,
  ChartColumn,
  CircleCheck,
  Contact,
  FileSignature,
  FileText,
  Gem,
  LayoutGrid,
  Mail,
  MessageCircle,
  MessagesSquare,
  Receipt,
} from "lucide-react";

export type NavItem = {
  href: string;
  labelKey:
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
    | "reports";
  icon: LucideIcon;
};

export const mainNavItems: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutGrid },
  { href: "/ai", labelKey: "aiAssistant", icon: Bot },
  { href: "/contacts", labelKey: "contacts", icon: Contact },
  { href: "/deals", labelKey: "deals", icon: Gem },
  { href: "/tasks", labelKey: "tasks", icon: CircleCheck },
];

export const workspaceNavItems: NavItem[] = [
  { href: "/communications", labelKey: "communications", icon: MessagesSquare },
  { href: "/whatsapp", labelKey: "whatsapp", icon: MessageCircle },
  { href: "/email", labelKey: "email", icon: Mail },
  { href: "/invoices", labelKey: "invoicing", icon: Receipt },
  { href: "/contracts", labelKey: "contracts", icon: FileSignature },
  { href: "/files", labelKey: "files", icon: FileText },
  { href: "/calendar", labelKey: "calendar", icon: Calendar },
  { href: "/reports", labelKey: "reports", icon: ChartColumn },
];
