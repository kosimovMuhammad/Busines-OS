"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Download, Receipt } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { useGetCompanyInvoicesQuery } from "@/lib/api/company.api";
import { useInvoicePdfDownload } from "@/lib/hooks/useInvoicePdfDownload";
import { formatCurrency } from "@/lib/utils";

const LIMIT = 10;

export function InvoiceHistoryTable() {
  const t = useTranslations("pages.settingsPlan.invoices");
  const locale = useLocale();
  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const downloadPdf = useInvoicePdfDownload();

  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetCompanyInvoicesQuery({ page, limit: LIMIT });
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-text-primary">{t("title")}</p>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState icon={Receipt} title={t("empty")} />
      ) : (
        <div className="rounded-2xl border border-border-subtle bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead>{t("columnAmount")}</TableHead>
                <TableHead>{t("columnStatus")}</TableHead>
                <TableHead>{t("columnDate")}</TableHead>
                <TableHead className="w-16 text-right">{t("columnActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((invoice) => (
                <TableRow key={invoice.id} className="border-border-subtle">
                  <TableCell className="text-text-secondary">
                    {formatCurrency(invoice.amount, invoice.currency, locale)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{invoice.status}</Badge>
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {formatter.format(new Date(invoice.issuedAt))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => downloadPdf(invoice.id)}
                        className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                        aria-label={t("download")}
                      >
                        <Download className="size-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
