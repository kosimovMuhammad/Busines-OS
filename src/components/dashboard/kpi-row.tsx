"use client";

import { useLocale, useTranslations } from "next-intl";
import { CircleCheck, Gem, Receipt, TrendingUp } from "lucide-react";
import {
  useGetDashboardOverviewQuery,
  useGetFinanceAnalyticsQuery,
  useGetRevenueAnalyticsQuery,
} from "@/lib/api/analytics.api";
import { StatCard } from "@/components/shared/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export function KpiRow() {
  const t = useTranslations("pages.dashboard.kpi");
  const locale = useLocale();
  const currency = "TJS";

  const overview = useGetDashboardOverviewQuery();
  const revenue = useGetRevenueAnalyticsQuery();
  const finance = useGetFinanceAnalyticsQuery();

  const openDealsCount = Object.entries(overview.data?.dealsByStage ?? {})
    .filter(([stage]) => stage !== "Won" && stage !== "Lost")
    .reduce((sum, [, count]) => sum + count, 0);

  const cards = [
    {
      key: "revenue",
      icon: TrendingUp,
      accent: "primary" as const,
      isLoading: revenue.isLoading,
      value: revenue.data
        ? formatCurrency(revenue.data.totalWonValue, currency, locale)
        : "—",
    },
    {
      key: "openDeals",
      icon: Gem,
      accent: "secondary" as const,
      isLoading: overview.isLoading,
      value: overview.data ? String(openDealsCount) : "—",
    },
    {
      key: "openTasks",
      icon: CircleCheck,
      accent: "success" as const,
      isLoading: overview.isLoading,
      value: overview.data ? String(overview.data.openTasksCount) : "—",
    },
    {
      key: "outstanding",
      icon: Receipt,
      accent: "warning" as const,
      isLoading: finance.isLoading,
      value: finance.data
        ? formatCurrency(finance.data.totalOutstanding, currency, locale)
        : "—",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) =>
        card.isLoading ? (
          <div
            key={card.key}
            className="rounded-2xl border border-border-subtle bg-surface p-5"
          >
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-3 h-8 w-1/2" />
          </div>
        ) : (
          <StatCard
            key={card.key}
            icon={card.icon}
            accent={card.accent}
            label={t(card.key)}
            value={card.value}
          />
        )
      )}
    </div>
  );
}
