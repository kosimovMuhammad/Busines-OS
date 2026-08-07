"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/hooks/useRole";

const TABS = [
  { href: "/settings", labelKey: "company" },
  { href: "/settings/team", labelKey: "team" },
  { href: "/settings/organization", labelKey: "organization", roles: ["Owner", "Admin", "Manager"] },
  { href: "/settings/roles", labelKey: "rolesPermissions", roles: ["Owner", "Admin"] },
  { href: "/settings/security", labelKey: "security", roles: ["Owner", "Admin"] },
  { href: "/settings/integrations", labelKey: "integrations" },
  { href: "/settings/plan", labelKey: "plan", roles: ["Owner", "Admin"] },
  { href: "/settings/notifications", labelKey: "notifications" },
] as const;

export function SettingsTabs() {
  const t = useTranslations("pages.settings.tabs");
  const pathname = usePathname();
  const { hasRole } = useRole();

  const tabs = TABS.filter((tab) => !("roles" in tab) || hasRole([...tab.roles]));

  return (
    <div className="mb-4 flex items-center gap-1 border-b border-border-subtle">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "text-accent-primary"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            {t(tab.labelKey)}
            {active && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent-primary" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
