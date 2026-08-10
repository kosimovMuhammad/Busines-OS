"use client";

import { useLocale, useTranslations } from "next-intl";
import { Receipt, Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import { PermissionGuard } from "@/components/guards/permission-guard";
import { INVOICE_MUTATION_ALLOWED_ROLES } from "@/lib/permissions/constants";
import type { Contact, Invoice } from "@/types/api";

export function InvoicesTable({
  invoices,
  contactsById,
  isLoading,
  onDelete,
}: {
  invoices: Invoice[];
  contactsById: Map<string, Contact>;
  isLoading: boolean;
  onDelete: (invoice: Invoice) => void;
}) {
  const t = useTranslations("pages.invoices");
  const locale = useLocale();
  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return <EmptyState icon={Receipt} title={t("empty")} />;
  }

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface">
      <Table>
        <TableHeader>
          <TableRow className="border-border-subtle hover:bg-transparent">
            <TableHead>{t("columnNumber")}</TableHead>
            <TableHead>{t("columnContact")}</TableHead>
            <TableHead>{t("columnAmount")}</TableHead>
            <TableHead>{t("columnStatus")}</TableHead>
            <TableHead>{t("columnDueDate")}</TableHead>
            <TableHead className="w-16 text-right">{t("columnActions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => {
            const contact = contactsById.get(invoice.contactId);
            const contactName = contact
              ? [contact.firstName, contact.lastName].filter(Boolean).join(" ")
              : "—";
            return (
              <TableRow key={invoice.id} className="border-border-subtle">
                <TableCell>
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="text-sm font-medium text-text-primary hover:underline"
                  >
                    {invoice.invoiceNumber}
                  </Link>
                </TableCell>
                <TableCell className="text-text-secondary">{contactName}</TableCell>
                <TableCell className="text-text-secondary">
                  {invoice.amount.toFixed(2)} {invoice.currency}
                </TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={invoice.status} />
                </TableCell>
                <TableCell className="text-text-secondary">
                  {formatter.format(new Date(invoice.dueDate))}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    {invoice.status === "Draft" && (
                      <PermissionGuard roles={INVOICE_MUTATION_ALLOWED_ROLES}>
                        <button
                          type="button"
                          onClick={() => onDelete(invoice)}
                          className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
                          aria-label={t("delete")}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </PermissionGuard>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
