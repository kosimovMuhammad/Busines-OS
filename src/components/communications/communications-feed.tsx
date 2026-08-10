"use client";

import { useLocale, useTranslations } from "next-intl";
import { Mail, MessageCircle, MessagesSquare, Phone, StickyNote } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { AiSummaryBadge } from "./ai-summary-badge";
import type { Communication, Contact } from "@/types/api";
import type { CommChannel } from "@/types/enums";

const CHANNEL_ICON: Record<CommChannel, typeof Mail> = {
  Whatsapp: MessageCircle,
  Email: Mail,
  ManualNote: StickyNote,
  PhoneCall: Phone,
};

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

  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (communications.length === 0) {
    return <EmptyState icon={MessagesSquare} title={t("empty")} />;
  }

  return (
    <ul className="space-y-3">
      {communications.map((comm) => {
        const Icon = CHANNEL_ICON[comm.channel];
        const contact = comm.contactId ? contactsById.get(comm.contactId) : undefined;
        const contactName = contact
          ? [contact.firstName, contact.lastName].filter(Boolean).join(" ")
          : null;

        return (
          <li
            key={comm.id}
            className="rounded-2xl border border-border-subtle bg-surface p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-text-tertiary">
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-text-primary">
                    {contactName ?? t("unknownContact")}
                  </p>
                  <span className="text-xs text-text-tertiary">
                    {formatter.format(new Date(comm.timestamp))}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-text-tertiary">
                  {tChannel(comm.channel)}
                </p>
                <p className="mt-1.5 text-sm whitespace-pre-wrap text-text-secondary">
                  {comm.content}
                </p>
                <AiSummaryBadge
                  communicationId={comm.id}
                  existingSummary={comm.aiSummary}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
