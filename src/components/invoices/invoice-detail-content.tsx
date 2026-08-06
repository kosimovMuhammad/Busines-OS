"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, CreditCard, Pencil, Receipt, Trash2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useGetInvoiceQuery } from "@/lib/api/invoices.api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { InvoiceStatusSelect } from "./invoice-status-select";
import { InvoiceFormSheet } from "./invoice-form-sheet";
import { DeleteInvoiceDialog } from "./delete-invoice-dialog";
import { AddPaymentSheet } from "./add-payment-sheet";
import type { Invoice } from "@/types/api";

export function InvoiceDetailContent({ id }: { id: string }) {
  const t = useTranslations("pages.invoices");
  const tMethod = useTranslations("enums.paymentMethod");
  const router = useRouter();
  const locale = useLocale();
  const { data: invoice, isLoading } = useGetInvoiceQuery(id);

  const [editOpen, setEditOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);

  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const dateTimeFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  if (isLoading || !invoice) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const contactName = [invoice.contact?.firstName, invoice.contact?.lastName]
    .filter(Boolean)
    .join(" ");
  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-4">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="size-4" />
        {t("backToList")}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border-subtle bg-surface p-5">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-text-tertiary">
            <Receipt className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-text-primary">
              {invoice.invoiceNumber}
            </h1>
            {invoice.contact ? (
              <Link
                href={`/contacts/${invoice.contact.id}`}
                className="text-sm text-text-secondary hover:underline"
              >
                {contactName}
              </Link>
            ) : (
              <p className="text-sm text-text-secondary">{contactName || "—"}</p>
            )}
            {invoice.deal && (
              <p className="text-xs text-text-tertiary">{invoice.deal.title}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <InvoiceStatusSelect invoiceId={invoice.id} status={invoice.status} />
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="flex size-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
            aria-label={t("edit")}
          >
            <Pencil className="size-4" />
          </button>
          {invoice.status === "DRAFT" && (
            <button
              type="button"
              onClick={() => setDeletingInvoice(invoice)}
              className="flex size-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
              aria-label={t("delete")}
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border-subtle bg-surface p-4">
          <p className="text-xs font-medium text-text-tertiary uppercase">{t("amount")}</p>
          <p className="mt-1 text-lg font-semibold text-text-primary">
            {invoice.amount.toFixed(2)} {invoice.currency}
          </p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-surface p-4">
          <p className="text-xs font-medium text-text-tertiary uppercase">{t("paid")}</p>
          <p className="mt-1 text-lg font-semibold text-text-primary">
            {totalPaid.toFixed(2)} {invoice.currency}
          </p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-surface p-4">
          <p className="text-xs font-medium text-text-tertiary uppercase">{t("dueDate")}</p>
          <p className="mt-1 text-lg font-semibold text-text-primary">
            {dateFormatter.format(new Date(invoice.dueDate))}
          </p>
        </div>
      </div>

      {invoice.notes && (
        <div className="rounded-2xl border border-border-subtle bg-surface p-4">
          <p className="text-xs font-medium text-text-tertiary uppercase">{t("notes")}</p>
          <p className="mt-1 text-sm whitespace-pre-wrap text-text-secondary">
            {invoice.notes}
          </p>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-medium text-text-primary">{t("payments")}</h4>
          <Button type="button" size="sm" variant="outline" onClick={() => setPaymentOpen(true)}>
            {t("addPayment")}
          </Button>
        </div>

        {invoice.payments.length === 0 ? (
          <EmptyState icon={CreditCard} title={t("noPayments")} />
        ) : (
          <ul className="space-y-2">
            {invoice.payments.map((payment) => (
              <li
                key={payment.id}
                className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface p-3 text-sm"
              >
                <div>
                  <p className="text-text-primary">
                    {payment.amount.toFixed(2)} {invoice.currency} · {tMethod(payment.method)}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {dateTimeFormatter.format(new Date(payment.paidAt))}
                  </p>
                </div>
                {payment.notes && (
                  <p className="max-w-xs truncate text-xs text-text-tertiary">{payment.notes}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <InvoiceFormSheet open={editOpen} onOpenChange={setEditOpen} invoice={invoice} />

      <AddPaymentSheet open={paymentOpen} onOpenChange={setPaymentOpen} invoiceId={invoice.id} />

      <DeleteInvoiceDialog
        invoice={deletingInvoice}
        onOpenChange={(open) => !open && setDeletingInvoice(null)}
        onDeleted={() => router.push("/invoices")}
      />
    </div>
  );
}
