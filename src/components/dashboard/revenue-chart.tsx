"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { useGetRevenueAnalyticsQuery } from "@/lib/api/analytics.api";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

function monthLabel(month: string, locale: string) {
  const [year, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, { month: "short" }).format(
    new Date(year, (m ?? 1) - 1, 1)
  );
}

export function RevenueChart() {
  const t = useTranslations("pages.dashboard.revenueChart");
  const locale = useLocale();
  const { data, isLoading } = useGetRevenueAnalyticsQuery();

  const currency = "TJS";
  const points = (data?.byMonth ?? []).map((p) => ({
    ...p,
    label: monthLabel(p.month, locale),
  }));

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5">
      <div>
        <h3 className="text-sm font-medium text-text-primary">{t("title")}</h3>
        <p className="text-xs text-text-secondary">{t("subtitle")}</p>
      </div>

      <div className="mt-4 h-56">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : points.length === 0 ? (
          <EmptyState icon={TrendingUp} title={t("empty")} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="var(--border-subtle)"
                strokeDasharray="4 4"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ stroke: "var(--border-subtle)" }}
                contentStyle={{
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--text-primary)",
                }}
                formatter={(value) => formatCurrency(Number(value), currency, locale)}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#revenueFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
