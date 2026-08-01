"use client";

import { useLocale, useTranslations } from "next-intl";
import { Calendar } from "lucide-react";
import { useGetUpcomingMeetingsQuery } from "@/lib/api/analytics.api";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";

export function UpcomingMeetings() {
  const t = useTranslations("pages.dashboard.upcomingMeetings");
  const locale = useLocale();
  const { data, isLoading } = useGetUpcomingMeetingsQuery();

  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5">
      <h3 className="text-sm font-medium text-text-primary">{t("title")}</h3>

      {isLoading ? (
        <div className="mt-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : !data || data.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={Calendar} title={t("empty")} />
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {data.map((meeting) => {
            const contactName = meeting.contact
              ? [meeting.contact.firstName, meeting.contact.lastName]
                  .filter(Boolean)
                  .join(" ")
              : null;
            return (
              <li key={meeting.id} className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-text-tertiary">
                  <Calendar className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-text-primary">
                    {meeting.title}
                  </p>
                  <p className="truncate text-xs text-text-tertiary">
                    {formatter.format(new Date(meeting.startAt))}
                    {contactName ? ` · ${contactName}` : ""}
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
