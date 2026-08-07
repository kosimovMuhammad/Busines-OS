"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, TrendingUp, Wallet } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { formatCurrency } from "@/lib/utils";
import { useGetRevenueReportQuery } from "@/lib/api/reports.api";
import { useReportExport } from "@/lib/hooks/useReportExport";
import { ReportToolbar } from "./report-toolbar";

const CURRENCY = "TJS";
const GROUP_BY_OPTIONS = ["day", "week", "month"] as const;

export function RevenueReportTab() {
  const t = useTranslations("pages.reports.revenue");
  const locale = useLocale();
  const exportReport = useReportExport();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("month");
  const { data, isLoading } = useGetRevenueReportQuery({
    from: from || undefined,
    to: to || undefined,
    groupBy,
  });

  const changeIsPositive = (data?.percentChange ?? 0) >= 0;

  return (
    <div className="space-y-4">
      <ReportToolbar
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
        onExport={() => exportReport("revenue", { from, to })}
      >
        <Select value={groupBy} onValueChange={(value) => setGroupBy((value as typeof groupBy) ?? "month")}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue>{(value: string) => t(`groupBy.${value}`)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {GROUP_BY_OPTIONS.map((g) => (
              <SelectItem key={g} value={g}>
                {t(`groupBy.${g}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ReportToolbar>

      {isLoading || !data ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={Wallet}
              label={t("totalRevenue")}
              value={formatCurrency(data.totalRevenue, CURRENCY, locale)}
              hint={
                data.percentChange === null
                  ? undefined
                  : t("vsPrevious", { value: `${changeIsPositive ? "+" : ""}${data.percentChange.toFixed(1)}%` })
              }
              accent="success"
            />
            <StatCard
              icon={TrendingUp}
              label={t("forecasted")}
              value={formatCurrency(data.forecastedRevenue, CURRENCY, locale)}
            />
            <StatCard
              icon={data.percentChange !== null && changeIsPositive ? ArrowUp : ArrowDown}
              label={t("previousPeriod")}
              value={formatCurrency(data.previousPeriodRevenue, CURRENCY, locale)}
              accent={changeIsPositive ? "success" : "danger"}
            />
          </div>

          {data.byPeriod.length === 0 ? (
            <EmptyState icon={TrendingUp} title={t("empty")} />
          ) : (
            <div className="rounded-2xl border border-border-subtle bg-surface">
              <Table>
                <TableHeader>
                  <TableRow className="border-border-subtle hover:bg-transparent">
                    <TableHead>{t("columnPeriod")}</TableHead>
                    <TableHead>{t("columnRevenue")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.byPeriod.map((row) => (
                    <TableRow key={row.periodLabel} className="border-border-subtle">
                      <TableCell className="text-sm font-medium text-text-primary">{row.periodLabel}</TableCell>
                      <TableCell className="text-text-secondary">
                        {formatCurrency(row.revenue, CURRENCY, locale)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
