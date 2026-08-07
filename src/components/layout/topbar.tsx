"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CircleHelp, Search, Sparkles } from "lucide-react";
import { ActiveTimerWidget } from "@/components/tasks/active-timer-widget";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { NotificationsPanel } from "./notifications-panel";
import { GlobalSearchDialog } from "./global-search-dialog";

export function Topbar() {
  const t = useTranslations("topbar");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-border-subtle bg-background/80 px-8 py-4 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="relative max-w-md flex-1 text-left"
      >
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary" />
        <span className="flex w-full items-center justify-between rounded-xl border border-border-subtle bg-surface py-2.5 pr-3 pl-10 text-sm text-text-tertiary transition-colors hover:border-border-glow">
          {t("searchPlaceholder")}
          <kbd className="hidden shrink-0 items-center gap-0.5 rounded-md border border-border-subtle bg-surface-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-tertiary sm:flex">
            ⌘K
          </kbd>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <ActiveTimerWidget />
        <NotificationsPanel />
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

      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
