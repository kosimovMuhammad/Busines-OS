"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MessagesSquare, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { AiSummaryBadge } from "./ai-summary-badge";
import { CHANNEL_ICON, CHANNEL_COLOR } from "./channel-visuals";
import { cn } from "@/lib/utils";
import type { Communication, Contact } from "@/types/api";

function dayKey(timestamp: string) {
  return new Date(timestamp).toDateString();
}

export function CommunicationsFeed({
  communications,
  isLoading,
  contactsById,
}: {
  communications: Communication[];
  isLoading: boolean;
  contactsById: Map<string, Contact>;
}) {
  const t = useTranslations("pages.communications");
  const tChannel = useTranslations("enums.commChannel");
  const locale = useLocale();

  const timeFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { timeStyle: "short" }),
    [locale]
  );
  const dayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }),
    [locale]
  );

  const groups = useMemo(() => {
    const sorted = [...communications].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const map = new Map<string, Communication[]>();
    for (const comm of sorted) {
      const key = dayKey(comm.timestamp);
      const list = map.get(key);
      if (list) list.push(comm);
      else map.set(key, [comm]);
    }
    return Array.from(map.entries());
  }, [communications]);

  // Lazy initializer (not a bare Date.now() call during render) per the
  // same pattern as active-timer-widget.tsx's `useState(() => Date.now())`.
  const [nowTs] = useState(() => Date.now());
  const { todayKey, yesterdayKey } = useMemo(
    () => ({
      todayKey: dayKey(new Date(nowTs).toISOString()),
      yesterdayKey: dayKey(new Date(nowTs - 86_400_000).toISOString()),
    }),
    [nowTs]
  );

  const dayLabel = (key: string, sample: string) => {
    if (key === todayKey) return t("today");
    if (key === yesterdayKey) return t("yesterday");
    return dayFormatter.format(new Date(sample));
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (communications.length === 0) {
    return <EmptyState icon={MessagesSquare} title={t("empty")} />;
  }

  return (
    <div className="space-y-6">
      {groups.map(([key, items]) => (
        <div key={key} className="space-y-4">
          {/* Day separator */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border-subtle/40" />
            <span className="shrink-0 rounded-full bg-surface-elevated px-3 py-0.5 text-[11px] text-text-tertiary">
              {dayLabel(key, items[0].timestamp)}
            </span>
            <div className="h-px flex-1 bg-border-subtle/40" />
          </div>

          <ul className="space-y-4">
            {items.map((comm) => {
              const Icon = CHANNEL_ICON[comm.channel];
              const color = CHANNEL_COLOR[comm.channel];
              const isNote = comm.channel === "ManualNote";
              const isOutbound = comm.direction === "OUTBOUND";
              const knownContact = comm.contactId ? contactsById.get(comm.contactId) : undefined;
              const unresolved = !!comm.contactId && !knownContact;

              if (isNote) {
                return (
                  <li key={comm.id} className="flex gap-2.5 rounded-2xl border border-warning/20 bg-warning/5 p-4">
                    <Icon className="mt-0.5 size-3.5 shrink-0 text-warning" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-medium tracking-wide text-warning uppercase">
                          {tChannel(comm.channel)}
                        </span>
                        <span className="shrink-0 text-[11px] tabular-nums text-text-tertiary">
                          {timeFormatter.format(new Date(comm.timestamp))}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm whitespace-pre-wrap text-text-primary">
                        {comm.content}
                      </p>
                      {unresolved && (
                        <p className="mt-1 text-xs text-text-tertiary">{t("unknownContact")}</p>
                      )}
                    </div>
                  </li>
                );
              }

              return (
                <li
                  key={comm.id}
                  className={cn("flex flex-col gap-1.5", isOutbound ? "items-end" : "items-start")}
                >
                  {/* Channel + time metadata */}
                  <div
                    className={cn(
                      "flex items-center gap-1.5 px-1 text-[11px] text-text-tertiary",
                      isOutbound && "flex-row-reverse"
                    )}
                  >
                    <span className="size-1.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden />
                    <span className="font-medium tracking-wide uppercase">{tChannel(comm.channel)}</span>
                    <span aria-hidden>{isOutbound ? "→" : "←"}</span>
                    <span className="tabular-nums">{timeFormatter.format(new Date(comm.timestamp))}</span>
                  </div>

                  {/* Message bubble */}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                      isOutbound
                        ? "rounded-tr-md bg-accent-primary text-white"
                        : "rounded-tl-md border border-border-subtle bg-surface-elevated text-text-primary"
                    )}
                  >
                    {comm.content}
                  </div>

                  {unresolved && (
                    <span className="px-1 text-[11px] text-text-tertiary">{t("unknownContact")}</span>
                  )}

                  <div className={cn("px-1", isOutbound && "self-end")}>
                    <AiSummaryBadge communicationId={comm.id} existingSummary={comm.aiSummary} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
