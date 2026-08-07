"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Contact, Trophy, UserPlus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Link } from "@/i18n/navigation";
import { formatCurrency } from "@/lib/utils";
import { useGetCustomersReportQuery } from "@/lib/api/reports.api";
import { useReportExport } from "@/lib/hooks/useReportExport";
import { ReportToolbar } from "./report-toolbar";

const CURRENCY = "TJS";

export function CustomersReportTab() {
  const t = useTranslations("pages.reports.customers");
  const locale = useLocale();
  const exportReport = useReportExport();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { data, isLoading } = useGetCustomersReportQuery({ from: from || undefined, to: to || undefined });

  return (
    <div className="space-y-4">
      <ReportToolbar
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
        onExport={() => exportReport("customers", { from, to })}
      />

      {isLoading || !data ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard icon={Contact} label={t("totalContacts")} value={String(data.totalContacts)} />
            <StatCard
              icon={UserPlus}
              label={t("newInRange")}
              value={String(data.newContactsInRange)}
              accent="success"
            />
          </div>

          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Trophy className="size-4 text-warning" />
              {t("topCustomers")}
            </p>
            {data.topCustomers.length === 0 ? (
              <EmptyState icon={Trophy} title={t("empty")} />
            ) : (
              <div className="rounded-2xl border border-border-subtle bg-surface">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border-subtle hover:bg-transparent">
                      <TableHead>{t("columnContact")}</TableHead>
                      <TableHead>{t("columnDeals")}</TableHead>
                      <TableHead>{t("columnRevenue")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topCustomers.map((row) => (
                      <TableRow key={row.contactId} className="border-border-subtle">
                        <TableCell>
                          <Link
                            href={`/contacts/${row.contactId}`}
                            className="text-sm font-medium text-text-primary hover:underline"
                          >
                            {row.contactName}
                          </Link>
                        </TableCell>
                        <TableCell className="text-text-secondary">{row.wonDealsCount}</TableCell>
                        <TableCell className="text-text-secondary">
                          {formatCurrency(row.wonRevenue, CURRENCY, locale)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
