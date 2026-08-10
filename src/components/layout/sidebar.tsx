"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronLeft, ChevronRight, Layers, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/navigation";
import { useRole } from "@/lib/hooks/useRole";
import { navEntries, type NavGroup, type NavItem } from "./nav-config";
import { filterNavEntries } from "./nav-filter";

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
        "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-medium transition-all mx-3",
        collapsed && "justify-center px-0 mx-2",
        active
          ? "bg-surface text-accent-primary shadow-sm"
          : "text-text-secondary hover:bg-black/5 hover:text-text-primary dark:hover:bg-white/5"
      )}
    >
      <Icon className="size-5 shrink-0" />
      {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
    </Link>
  );
}

function NavGroupSection({
  group,
  collapsed,
  expanded,
  onToggle,
}: {
  group: NavGroup;
  collapsed: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const Icon = group.icon;
  const hasActiveChild = group.items.some((item) => pathname.startsWith(item.href));

  if (collapsed) {
    return (
      <>
        {group.items.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} />
        ))}
      </>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "group relative mx-3 flex items-center justify-between rounded-2xl px-4 py-3 text-[14px] font-medium transition-all",
          "w-[calc(100%-24px)]",
          hasActiveChild
            ? "text-accent-primary"
            : "text-text-secondary hover:bg-black/5 hover:text-text-primary dark:hover:bg-white/5"
        )}
      >
        <span className="flex min-w-0 items-center gap-3">
          <Icon className="size-5 shrink-0" />
          <span className="truncate">{t(group.titleKey)}</span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-text-tertiary transition-transform",
            !expanded && "-rotate-90"
          )}
        />
      </button>
      {expanded && (
        <div className="ml-[27px] mt-0.5 space-y-0.5 border-l border-border-subtle pb-1 pl-4">
          {group.items.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block truncate rounded-lg px-3 py-2 text-[13px] transition-colors",
                  active
                    ? "font-medium text-accent-primary"
                    : "text-text-tertiary hover:text-text-primary"
                )}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SettingsNavSection({ collapsed }: { collapsed: boolean }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const settingsActive = pathname.startsWith("/settings");

  return (
    <Link
      href="/settings"
      title={collapsed ? t("settings") : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-medium transition-all mx-3",
        collapsed && "justify-center px-0 mx-2",
        settingsActive
          ? "bg-accent-gradient glow-accent text-white"
          : "text-text-secondary hover:bg-black/5 hover:text-text-primary dark:hover:bg-white/5"
      )}
    >
      <Settings className="size-[18px] shrink-0" />
      {!collapsed && <span className="truncate">{t("settings")}</span>}
    </Link>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const t = useTranslations("nav");
  const brand = useTranslations("brand");
  const pathname = usePathname();
  const { role } = useRole();
  const visibleNavEntries = useMemo(() => filterNavEntries(navEntries, role), [role]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const entry of navEntries) {
      if (entry.kind === "group") {
        initial[entry.group.key] = entry.group.items.some((item) =>
          pathname.startsWith(item.href)
        );
      }
    }
    return initial;
  });

  const toggleGroup = (key: string) =>
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <aside
      className={cn(
        "sticky top-3 ml-3 my-3 flex h-[calc(100vh-24px)] shrink-0 flex-col rounded-3xl bg-surface-elevated border border-border-subtle transition-[width] duration-200",
        collapsed ? "w-19" : "w-[260px]"
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

      <nav
        className={cn(
          "no-scrollbar flex-1 overflow-y-auto px-3",
          collapsed ? "space-y-1" : "space-y-0.5"
        )}
      >
        {visibleNavEntries.map((entry) =>
          entry.kind === "link" ? (
            <NavLink key={entry.item.href} item={entry.item} collapsed={collapsed} />
          ) : (
            <NavGroupSection
              key={entry.group.key}
              group={entry.group}
              collapsed={collapsed}
              expanded={collapsed ? true : !!expandedGroups[entry.group.key]}
              onToggle={() => toggleGroup(entry.group.key)}
            />
          )
        )}
      </nav>

      <div className="space-y-1 p-3">
        <SettingsNavSection collapsed={collapsed} />

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
