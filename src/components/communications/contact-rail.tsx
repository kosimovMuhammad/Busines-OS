"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Search, SquarePen, Users, MessageSquare } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { cn, initials } from "@/lib/utils";
import { CHANNEL_COLOR, CHANNEL_ICON } from "./channel-visuals";
import type { ContactSummary } from "./communications-content";
import type { CommChannel } from "@/types/enums";

const ALL = "";
const CHANNELS: CommChannel[] = ["Email", "Whatsapp", "Instagram", "Telegram", "PhoneCall", "ManualNote"];

export function ContactRail({
  summaries,
  isLoading,
  selectedContactId,
  onSelectContact,
  search,
  onSearchChange,
  channel,
  onChannelChange,
  onNewNote,
}: {
  summaries: ContactSummary[];
  isLoading: boolean;
  selectedContactId: string;
  onSelectContact: (id: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  channel: string;
  onChannelChange: (value: string) => void;
  onNewNote: () => void;
}) {
  const t = useTranslations("pages.communications");
  const tChannel = useTranslations("enums.commChannel");
  const locale = useLocale();

  const timeFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }),
    [locale]
  );
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }),
    [locale]
  );

  const formatWhen = (timestamp: string) => {
    const d = new Date(timestamp);
    const isToday = d.toDateString() === new Date().toDateString();
    return isToday ? timeFormatter.format(d) : dateFormatter.format(d);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <h2 className="text-lg font-semibold text-text-primary">Inbox</h2>
        <span className="text-xs text-text-tertiary">{summaries.length} total</span>
      </div>

      <div className="space-y-3 border-b border-border-subtle/50 px-4 pb-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-text-tertiary" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-8 w-full rounded-xl border border-border-subtle/60 bg-surface-elevated/40 py-1 pr-2.5 pl-8 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-primary/30 focus:ring-1 focus:ring-accent-primary/20 outline-none transition-all"
          />
        </div>
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => onChannelChange(ALL)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium whitespace-nowrap transition-colors",
              channel === ALL
                ? "border-accent-secondary/50 bg-accent-secondary/10 text-accent-secondary"
                : "border-border-subtle text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
            )}
          >
            All
          </button>
          {CHANNELS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChannelChange(channel === c ? ALL : c)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium whitespace-nowrap transition-colors",
                channel === c
                  ? "border-accent-secondary/50 bg-accent-secondary/10 text-accent-secondary"
                  : "border-border-subtle text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
              )}
            >
              {tChannel(c)}
            </button>
          ))}
        </div>
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : summaries.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Users}
              title={search || channel ? t("noResults") : t("noConversations")}
            />
          </div>
        ) : (
          <ul>
            {summaries.map(({ contact, lastComm, totalCount }) => {
              const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ");
              const isSelected = contact.id === selectedContactId;
              const Icon = CHANNEL_ICON[lastComm.channel] || MessageSquare;
              return (
                <li key={contact.id}>
                  <button
                    type="button"
                    onClick={() => onSelectContact(contact.id)}
                    className={cn(
                      "flex w-full items-start gap-3 border-l-[3px] px-4 py-4 text-left transition-colors",
                      isSelected
                        ? "border-l-accent-primary bg-surface-elevated"
                        : "border-l-transparent hover:bg-surface-elevated/40"
                    )}
                  >
                    <div className="relative mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-[13px] font-semibold text-text-secondary ring-1 ring-border-subtle/50">
                      {initials(fullName) || "?"}
                      <div
                        className="absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full ring-2 ring-surface"
                        style={{ background: CHANNEL_COLOR[lastComm.channel] }}
                      >
                        <Icon className="size-2.5 text-white" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn("truncate text-sm font-semibold", isSelected ? "text-text-primary" : "text-text-primary")}>{fullName}</p>
                        <span className="shrink-0 text-[11px] tabular-nums text-text-tertiary">
                          {formatWhen(lastComm.timestamp)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 pr-2">
                        <p className="truncate text-[13px] text-text-secondary">
                          {lastComm.channel === "ManualNote" ? `${t("noteSheet.title")}: ` : ""}
                          {lastComm.content}
                        </p>
                        {lastComm.direction === "INBOUND" && !isSelected && (
                          <span className="ml-auto size-2 shrink-0 rounded-full bg-accent-primary" />
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
