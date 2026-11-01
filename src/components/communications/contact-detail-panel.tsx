"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Mail, Plus, Receipt } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useGetUsersQuery } from "@/lib/api/users.api";
import { useGetDealsQuery } from "@/lib/api/deals.api";
import { useGetInvoicesQuery } from "@/lib/api/invoices.api";
import { useGetMeetingsQuery } from "@/lib/api/calendar.api";
import { STAGE_COLOR } from "@/components/deals/deal-stage-visuals";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { MeetingStatusBadge } from "@/components/calendar/meeting-status-badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import type { ContactSummary } from "./communications-content";

export function ContactDetailPanel({
  summary,
  onNewDeal,
}: {
  summary: Pick<ContactSummary, "contact" | "channelCounts">;
  onNewDeal: () => void;
}) {
  const { contact, channelCounts: _channelCounts } = summary;
  const t = useTranslations("pages.communications");
  const tStage = useTranslations("enums.dealStage");
  const locale = useLocale();

  const { data: users } = useGetUsersQuery();
  const { data: deals } = useGetDealsQuery();
  const { data: invoicesPage } = useGetInvoicesQuery({ contactId: contact.id, limit: 5 });
  const { data: meetings } = useGetMeetingsQuery({ contactId: contact.id });

  const ownerName = useMemo(
    () => (contact.ownerId ? (users?.find((u) => u.id === contact.ownerId)?.name ?? null) : null),
    [users, contact.ownerId]
  );

  const contactDeals = useMemo(
    () =>
      (deals ?? [])
        .filter((d) => d.contactId === contact.id)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 3),
    [deals, contact.id]
  );

  const meetingsSorted = useMemo(
    () =>
      [...(meetings ?? [])]
        .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
        .slice(0, 3),
    [meetings]
  );

  const meetingFormatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="scrollbar-thin h-full min-h-0 overflow-y-auto bg-surface">
      {/* CONTACT section */}
      <div className="px-5 pt-5 pb-4">
        <p className="mb-3 text-[10px] font-semibold tracking-widest text-text-tertiary uppercase">Contact</p>
        <div className="space-y-2.5">
          {contact.companyName && (
            <ContactRow label="Company" value={contact.companyName} />
          )}
          {contact.position && (
            <ContactRow label="Role" value={contact.position} />
          )}
          {ownerName && (
            <ContactRow label="Owner" value={ownerName} />
          )}
          {contact.phone && (
            <ContactRow label="Phone" value={contact.phone} />
          )}
          {contact.email && (
            <ContactRow label="Email" value={contact.email} />
          )}
        </div>
        {contact.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {contact.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border-subtle px-2 py-0.5 text-xs text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* LINKED DEAL section */}
      <div className="border-t border-border-subtle/50 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold tracking-widest text-text-tertiary uppercase">Linked Deal</p>
          <Button type="button" size="icon-xs" variant="ghost" onClick={onNewDeal} title={t("newDeal")}>
            <Plus className="size-3.5" />
          </Button>
        </div>
        <div className="space-y-2">
          {contactDeals.length === 0 ? (
            <p className="text-xs text-text-tertiary">{t("noLinkedDeals")}</p>
          ) : (
            contactDeals.map((deal) => (
              <Link
                key={deal.id}
                href={`/deals/${deal.id}`}
                className="block rounded-xl bg-surface-elevated p-3 transition-colors hover:bg-surface-elevated/80"
              >
                <p className="text-sm font-semibold text-text-primary">{deal.title}</p>
                <p className="mt-1 text-base font-bold text-text-primary">
                  {formatCurrency(deal.value, deal.currency, locale)}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className="rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase"
                    style={{
                      background: `color-mix(in oklab, ${STAGE_COLOR[deal.stage]} 20%, transparent)`,
                      color: STAGE_COLOR[deal.stage],
                    }}
                  >
                    {tStage(deal.stage)}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Invoices */}
      {(invoicesPage?.data.length ?? 0) > 0 && (
        <div className="border-t border-border-subtle/50 px-5 py-4">
          <p className="mb-3 text-[10px] font-semibold tracking-widest text-text-tertiary uppercase">Invoices</p>
          <div className="space-y-2">
            {invoicesPage?.data.slice(0, 3).map((invoice) => (
              <Link
                key={invoice.id}
                href={`/invoices/${invoice.id}`}
                className="flex items-center justify-between gap-2 rounded-xl bg-surface-elevated px-3 py-2.5 text-sm transition-colors hover:bg-surface-elevated/80"
              >
                <span className="flex min-w-0 items-center gap-2 text-text-primary">
                  <Receipt className="size-3.5 shrink-0 text-text-tertiary" />
                  <span className="truncate">{invoice.invoiceNumber}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2 text-xs text-text-tertiary">
                  {formatCurrency(invoice.amount, invoice.currency, locale)}
                  <InvoiceStatusBadge status={invoice.status} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Meetings */}
      {meetingsSorted.length > 0 && (
        <div className="border-t border-border-subtle/50 px-5 py-4">
          <p className="mb-3 text-[10px] font-semibold tracking-widest text-text-tertiary uppercase">Meetings</p>
          <div className="space-y-2">
            {meetingsSorted.map((meeting) => (
              <Link
                key={meeting.id}
                href="/calendar"
                className={cn(
                  "flex items-center justify-between gap-2 rounded-xl bg-surface-elevated px-3 py-2.5 text-sm transition-colors hover:bg-surface-elevated/80",
                  meeting.status === "Cancelled" && "opacity-60"
                )}
              >
                <span className="min-w-0 truncate text-text-primary">{meeting.title}</span>
                <span className="flex shrink-0 items-center gap-2 text-xs text-text-tertiary">
                  {meetingFormatter.format(new Date(meeting.startAt))}
                  <MeetingStatusBadge status={meeting.status} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ContactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="shrink-0 text-text-tertiary">{label}</span>
      <span className="truncate text-right font-medium text-text-primary">{value}</span>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="flex items-center gap-2.5 text-text-tertiary">
        <Icon className="size-3.5 shrink-0" />
        {label}
      </span>
      <span className="truncate text-right text-text-primary">{value}</span>
    </div>
  );
}
