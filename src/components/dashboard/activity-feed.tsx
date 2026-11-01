"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Activity,
  Calendar,
  CircleCheck,
  Contact,
  Gem,
  MessagesSquare,
  Receipt,
  type LucideIcon,
} from "lucide-react";
import { useGetActivityFeedQuery } from "@/lib/api/analytics.api";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";

const TYPE_ICON: Record<string, LucideIcon> = {
  task: CircleCheck,
  deal: Gem,
  contact: Contact,
  invoice: Receipt,
  meeting: Calendar,
  communication: MessagesSquare,
};

const KNOWN_TYPES = new Set(Object.keys(TYPE_ICON));

export function ActivityFeed() {
  const t = useTranslations("pages.dashboard.activityFeed");
  const tType = useTranslations("enums.activityType");
  const locale = useLocale();
  const { data, isLoading } = useGetActivityFeedQuery();

  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5">
      <h3 className="text-sm font-medium text-text-primary">{t("title")}</h3>

      {isLoading ? (
        <div className="mt-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : !data || data.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={Activity} title={t("empty")} />
        </div>
      ) : (
        <ul className="scrollbar-thin mt-4 max-h-48 space-y-4 overflow-y-auto">
          {data.map((item, i) => {
            const Icon = TYPE_ICON[item.type] ?? Activity;
            const typeLabel = KNOWN_TYPES.has(item.type)
              ? tType(item.type as Parameters<typeof tType>[0])
              : item.type;
            const title = item.data?.title ?? typeLabel;
            return (
              <li key={`${item.type}-${item.data?.id}-${i}`} className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-text-tertiary">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-text-primary">{title}</p>
                  <p className="text-xs text-text-tertiary">
                    {typeLabel} · {formatter.format(new Date(item.timestamp))}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
