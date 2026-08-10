"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/navigation";
import { useRole } from "@/lib/hooks/useRole";
import { useAppSelector } from "@/store/hooks";
import { selectIsPlatformAdmin } from "@/store/authSelectors";
import { settingsNavItems } from "@/components/layout/nav-config";

export function SettingsNav() {
  const t = useTranslations("pages.settings.tabs");
  const pathname = usePathname();
  const { hasRole } = useRole();
  const isPlatformAdmin = useAppSelector(selectIsPlatformAdmin);
  const items = settingsNavItems.filter((item) => {
    if (item.platformAdminOnly && !isPlatformAdmin) return false;
    return !item.roles || hasRole([...item.roles]);
  });

  return (
    <nav className="flex shrink-0 flex-col gap-0.5 rounded-3xl border border-border-subtle bg-surface-elevated p-3 lg:w-64">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[14px] font-medium transition-all",
              active
                ? "bg-surface text-accent-primary shadow-sm"
                : "text-text-secondary hover:bg-black/5 hover:text-text-primary dark:hover:bg-white/5"
            )}
          >
            <Icon className="size-[18px] shrink-0" />
            <span className="truncate">{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
