"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  CircleCheck,
  Contact,
  FileText,
  Gem,
  Mail,
  MessageCircle,
  Search,
  User,
  type LucideIcon,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "@/i18n/navigation";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useGlobalSearchQuery } from "@/lib/api/search.api";
import type { SearchResultType } from "@/types/api";

const TYPE_ICONS: Record<SearchResultType, LucideIcon> = {
  contacts: Contact,
  deals: Gem,
  tasks: CircleCheck,
  users: User,
  files: FileText,
  emails: Mail,
  messages: MessageCircle,
};

export function GlobalSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("topbar.search");
  const tType = useTranslations("search.groups");
  const router = useRouter();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 250);
  const trimmed = debouncedQuery.trim();

  const { data, isFetching } = useGlobalSearchQuery(
    { q: trimmed, limit: 5 },
    { skip: trimmed.length < 2 }
  );

  const groups = (data?.groups ?? []).filter((g) => g.allowed && g.items.length > 0);

  const goTo = (link: string) => {
    router.push(link);
    onOpenChange(false);
    setQuery("");
  };

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-24 max-w-xl translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3">
          <Search className="size-4 shrink-0 text-text-tertiary" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
          />
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {trimmed.length < 2 ? (
            <p className="px-3 py-8 text-center text-sm text-text-tertiary">{t("hint")}</p>
          ) : isFetching && !data ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-text-tertiary">{t("empty")}</p>
          ) : (
            groups.map((group) => {
              const Icon = TYPE_ICONS[group.type];
              return (
                <div key={group.type} className="mb-1">
                  <p className="px-3 py-1.5 text-xs font-semibold tracking-wide text-text-tertiary uppercase">
                    {tType(group.type)}
                  </p>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => goTo(item.link)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-surface-elevated"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-text-tertiary">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">{item.title}</p>
                        {item.subtitle && (
                          <p className="truncate text-xs text-text-tertiary">{item.subtitle}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>

        {trimmed.length >= 2 && (
          <button
            type="button"
            onClick={() => goTo(`/search?q=${encodeURIComponent(trimmed)}`)}
            className="border-t border-border-subtle px-4 py-2.5 text-left text-sm text-accent-primary hover:underline"
          >
            {t("viewAll", { query: trimmed })}
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}
