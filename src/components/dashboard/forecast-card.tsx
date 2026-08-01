"use client";

import { useLocale, useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { useGetForecastQuery } from "@/lib/api/analytics.api";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export function ForecastCard() {
  const t = useTranslations("pages.dashboard.forecast");
  const locale = useLocale();
  const { data, isLoading } = useGetForecastQuery();

  return (
    <div className="bg-accent-gradient rounded-2xl p-5 text-white">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4" />
        <h3 className="text-sm font-medium">{t("title")}</h3>
      </div>

      {isLoading || !data ? (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-8 w-1/2 bg-white/20" />
          <Skeleton className="h-4 w-full bg-white/20" />
        </div>
      ) : (
        <>
          <div className="mt-3 flex items-baseline gap-3">
            <p className="text-2xl font-semibold tracking-tight">
              {formatCurrency(data.estimatedRevenue, "TJS", locale)}
            </p>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-medium">
              {t("confidence")} {Math.round(data.confidencePercentage)}%
            </span>
          </div>
          <p className="mt-2 text-sm text-white/85">{data.summary}</p>
        </>
      )}
    </div>
  );
}
