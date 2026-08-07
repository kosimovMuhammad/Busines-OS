"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  CircleCheck,
  Contact,
  FileText,
  Gem,
  Mail,
  MessageCircle,
  Search,
  SearchX,
  User,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
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

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-surface py-3 pr-4 pl-11 text-base text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function SearchContent() {
  const t = useTranslations("pages.search");
  const tType = useTranslations("search.groups");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const debouncedQuery = useDebounce(query, 300);
  const trimmed = debouncedQuery.trim();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmed]);

  const { data, isLoading, isFetching } = useGlobalSearchQuery(
    { q: trimmed, limit: 20 },
    { skip: trimmed.length < 2 }
  );

  const groups = (data?.groups ?? []).filter((g) => g.allowed);
  const hasAnyResults = groups.some((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <div className="relative max-w-xl">
        <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-text-tertiary" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("placeholder")}
          className={inputClass}
        />
      </div>

      {trimmed.length < 2 ? (
        <EmptyState icon={Search} title={t("hint")} />
      ) : isLoading || (isFetching && !data) ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !hasAnyResults ? (
        <EmptyState icon={SearchX} title={t("empty", { query: trimmed })} />
      ) : (
        <div className="space-y-6">
          {groups
            .filter((g) => g.items.length > 0)
            .map((group) => {
              const Icon = TYPE_ICONS[group.type];
              return (
                <div key={group.type}>
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className="size-4 text-text-tertiary" />
                    <h3 className="text-sm font-semibold text-text-primary">{tType(group.type)}</h3>
                    <span className="text-xs text-text-tertiary">{group.total}</span>
                  </div>
                  <div className="rounded-2xl border border-border-subtle bg-surface">
                    {group.items.map((item, i) => (
                      <Link
                        key={item.id}
                        href={item.link}
                        className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-elevated ${
                          i > 0 ? "border-t border-border-subtle" : ""
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-text-primary">{item.title}</p>
                          {item.subtitle && (
                            <p className="truncate text-xs text-text-tertiary">{item.subtitle}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
