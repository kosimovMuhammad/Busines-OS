"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CircleCheck, CircleX, Gem, Percent } from "lucide-react";
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
import { formatCurrency } from "@/lib/utils";
import { useGetSalesReportQuery } from "@/lib/api/reports.api";
import { useReportExport } from "@/lib/hooks/useReportExport";
import { ReportToolbar } from "./report-toolbar";
import type { DealStage } from "@/types/enums";

const CURRENCY = "TJS";

export function SalesReportTab() {
  const t = useTranslations("pages.reports.sales");
  const tStage = useTranslations("enums.dealStage");
  const locale = useLocale();
  const exportReport = useReportExport();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { data, isLoading } = useGetSalesReportQuery({ from: from || undefined, to: to || undefined });

  return (
    <div className="space-y-4">
      <ReportToolbar
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
        onExport={() => exportReport("sales", { from, to })}
      />

      {isLoading || !data ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Gem}
              label={t("totalDeals")}
              value={String(data.totalDeals)}
              hint={t("averageValue", {
                value: formatCurrency(data.averageDealValue, CURRENCY, locale),
              })}
            />
            <StatCard
              icon={CircleCheck}
              label={t("won")}
              value={`${data.wonCount} · ${formatCurrency(data.wonValue, CURRENCY, locale)}`}
              accent="success"
            />
            <StatCard
              icon={CircleX}
              label={t("lost")}
              value={`${data.lostCount} · ${formatCurrency(data.lostValue, CURRENCY, locale)}`}
              accent="danger"
            />
            <StatCard
              icon={Percent}
              label={t("winRate")}
              value={data.winRatePercent === null ? "—" : `${data.winRatePercent.toFixed(0)}%`}
            />
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface">
            <Table>
              <TableHeader>
                <TableRow className="border-border-subtle hover:bg-transparent">
                  <TableHead>{t("columnStage")}</TableHead>
                  <TableHead>{t("columnCount")}</TableHead>
                  <TableHead>{t("columnValue")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.byStage.map((row) => (
                  <TableRow key={row.stage} className="border-border-subtle">
                    <TableCell className="text-sm font-medium text-text-primary">
                      {tStage(row.stage as DealStage)}
                    </TableCell>
                    <TableCell className="text-text-secondary">{row.count}</TableCell>
                    <TableCell className="text-text-secondary">
                      {formatCurrency(row.value, CURRENCY, locale)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
