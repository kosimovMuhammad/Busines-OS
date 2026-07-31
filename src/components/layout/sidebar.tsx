"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Layers, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/navigation";
import { mainNavItems, workspaceNavItems, type NavItem } from "./nav-config";

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const active = pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? t(item.labelKey) : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        collapsed && "justify-center px-0",
        active
          ? "bg-accent-primary/15 text-accent-primary"
          : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-accent-primary" />
      )}
      <Icon className="size-[18px] shrink-0" />
      {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
    </Link>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const t = useTranslations("nav");
  const brand = useTranslations("brand");
  const pathname = usePathname();
  const settingsActive = pathname.startsWith("/settings");

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-border-subtle bg-surface transition-[width] duration-200",
        collapsed ? "w-[76px]" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 px-6 py-6",
          collapsed && "justify-center px-0"
        )}
      >
        <div className="bg-accent-gradient flex size-9 shrink-0 items-center justify-center rounded-xl text-white">
          <Layers className="size-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold text-text-primary">
              {brand("name")}
            </div>
            <div className="truncate text-[10px] font-medium tracking-widest text-text-tertiary uppercase">
              {brand("tagline")}
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {mainNavItems.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} />
        ))}

        <div className={cn("pt-4 pb-1", collapsed ? "px-0" : "px-3")}>
          {!collapsed ? (
            <span className="text-[10px] font-semibold tracking-widest text-text-tertiary uppercase">
              {t("workspaceSection")}
            </span>
          ) : (
            <div className="mx-auto h-px w-6 bg-border-subtle" />
          )}
        </div>

        {workspaceNavItems.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="space-y-1 p-3">
        <Link
          href="/settings"
          title={collapsed ? t("settings") : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            collapsed && "justify-center px-0",
            settingsActive
              ? "bg-accent-gradient glow-accent text-white"
              : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
          )}
        >
          <Settings className="size-[18px] shrink-0" />
          {!collapsed && <span className="truncate">{t("settings")}</span>}
        </Link>

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-secondary"
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <>
              <ChevronLeft className="size-4" />
              <span>{t("collapse")}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
