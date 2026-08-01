"use client";

import { useTranslations } from "next-intl";
import { Bell, CircleHelp, Search, Sparkles } from "lucide-react";
import { ActiveTimerWidget } from "@/components/tasks/active-timer-widget";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function Topbar() {
  const t = useTranslations("topbar");

  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-border-subtle bg-background/80 px-8 py-4 backdrop-blur-sm">
      <div className="relative max-w-md flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary" />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-xl border border-border-subtle bg-surface py-2.5 pr-4 pl-10 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ActiveTimerWidget />
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
        >
          <Bell className="size-[18px]" />
        </button>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
        >
          <Sparkles className="size-[18px]" />
        </button>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
        >
          <CircleHelp className="size-[18px]" />
        </button>
        <ThemeToggle />

        <div className="mx-2 h-6 w-px bg-border-subtle" />

        <UserMenu />
      </div>
    </header>
  );
}
