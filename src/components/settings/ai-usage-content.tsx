"use client";

import { useLocale, useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Sparkles, Zap } from "lucide-react";
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
import { formatCompactNumber, formatCurrency } from "@/lib/utils";
import { useGetAiUsageQuery } from "@/lib/api/ai.api";

const ENDPOINT_LABEL_KEYS: Record<string, string> = {
  summarize: "summarize",
  query: "query",
  draftEmail: "draftEmail",
  quotation: "quotation",
  forecast: "forecast",
  assistant: "assistant",
};

function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(iso));
}

export function AiUsagePanel() {
  const t = useTranslations("pages.settingsAiUsage");
  const locale = useLocale();
  const { data, isLoading } = useGetAiUsageQuery();

  const endpointLabel = (endpoint: string) => {
    const key = ENDPOINT_LABEL_KEYS[endpoint];
    return key ? t(`endpoints.${key}`) : endpoint;
  };

  const chartData = (data?.byEndpoint ?? []).map((row) => ({
    ...row,
    label: endpointLabel(row.endpoint),
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs font-medium text-text-tertiary uppercase">
        <Sparkles className="size-3.5 text-accent-primary" />
        {t("currentPeriod")} {formatDate(data.periodStart, locale)} – {formatDate(data.periodEnd, locale)}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard icon={Zap} label={t("totalRequests")} value={formatCompactNumber(data.totalRequests, locale)} />
        <StatCard
          icon={Sparkles}
          label={t("totalCost")}
          value={formatCurrency(data.estimatedCost, "USD", locale)}
        />
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface p-5">
        <h3 className="text-sm font-medium text-text-primary">{t("chartTitle")}</h3>
        <div className="mt-4 h-56">
          {chartData.length === 0 ? (
            <EmptyState icon={Sparkles} title={t("empty")} />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border-subtle)" strokeDasharray="4 4" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--text-tertiary)", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "var(--surface-elevated)" }}
                  contentStyle={{
                    background: "var(--surface-elevated)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "var(--text-primary)",
                  }}
                />
                <Bar dataKey="requestCount" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface">
        <Table>
          <TableHeader>
            <TableRow className="border-border-subtle">
              <TableHead>{t("table.endpoint")}</TableHead>
              <TableHead className="text-right">{t("table.requests")}</TableHead>
              <TableHead className="text-right">{t("table.tokens")}</TableHead>
              <TableHead className="text-right">{t("table.cost")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.byEndpoint.map((row) => (
              <TableRow key={row.endpoint} className="border-border-subtle">
                <TableCell className="text-sm font-medium text-text-primary">
                  {endpointLabel(row.endpoint)}
                </TableCell>
                <TableCell className="text-right text-sm text-text-secondary">
                  {formatCompactNumber(row.requestCount, locale)}
                </TableCell>
                <TableCell className="text-right text-sm text-text-secondary">
                  {formatCompactNumber(row.tokensUsed, locale)}
                </TableCell>
                <TableCell className="text-right text-sm text-text-secondary">
                  {formatCurrency(row.cost, "USD", locale)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
