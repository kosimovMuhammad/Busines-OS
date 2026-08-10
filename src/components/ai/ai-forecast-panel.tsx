"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Sparkles, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useGetAiForecastQuery } from "@/lib/api/ai.api";
import { formatCurrency } from "@/lib/utils";

function defaultPeriod() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
}

export function AiForecastPanel() {
  const t = useTranslations("pages.ai.forecast");
  const locale = useLocale();
  const [period, setPeriod] = useState(defaultPeriod());
  const { data, isLoading, isFetching } = useGetAiForecastQuery({ period });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="ai-forecast-period" className="text-xs font-medium text-text-tertiary uppercase">
          {t("period")}
        </label>
        <input
          id="ai-forecast-period"
          type="month"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none"
        />
      </div>

      <div className="bg-accent-gradient rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4" />
          <h3 className="text-sm font-medium">{t("title")}</h3>
        </div>

        {isLoading || isFetching || !data ? (
          <div className="mt-4 space-y-2">
            <Skeleton className="h-8 w-1/2 bg-white/20" />
            <Skeleton className="h-4 w-full bg-white/20" />
          </div>
        ) : (
          <div className="mt-3 flex items-baseline gap-3">
            <p className="text-2xl font-semibold tracking-tight">
              {formatCurrency(data.estimatedAmount, data.currency, locale)}
            </p>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-medium">
              {t("confidence")} {Math.round(data.confidencePercent)}%
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-text-tertiary uppercase">{t("topExpected")}</p>
        {!data || data.topExpectedPayments.length === 0 ? (
          !isLoading && !isFetching ? (
            <EmptyState icon={TrendingUp} title={t("empty")} />
          ) : null
        ) : (
          <ul className="divide-y divide-border-subtle rounded-2xl border border-border-subtle bg-surface">
            {data.topExpectedPayments.map((payment) => (
              <li key={payment.contactId}>
                <Link
                  href={`/contacts/${payment.contactId}`}
                  className="flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-surface-elevated"
                >
                  <span className="text-text-primary">{payment.contactName}</span>
                  <span className="font-medium text-text-secondary">
                    {formatCurrency(payment.amount, data.currency, locale)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
