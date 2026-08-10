"use client";

import { useTranslations } from "next-intl";
import { useGetSalesAnalyticsQuery } from "@/lib/api/analytics.api";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import type { DealStage } from "@/types/enums";
import { Gem } from "lucide-react";

const STAGE_ORDER: DealStage[] = [
  "Lead",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];

const STAGE_COLOR: Record<DealStage, string> = {
  Lead: "var(--chart-1)",
  Qualified: "var(--chart-2)",
  Proposal: "var(--chart-3)",
  Negotiation: "var(--chart-4)",
  Won: "var(--success)",
  Lost: "var(--danger)",
};

export function PipelineBreakdown() {
  const t = useTranslations("pages.dashboard.pipeline");
  const tStage = useTranslations("enums.dealStage");
  const { data, isLoading } = useGetSalesAnalyticsQuery();

  const rows = STAGE_ORDER.map((stage) => ({
    stage,
    count: data?.pipelineByStage[stage] ?? 0,
  })).filter((row) => row.count > 0);

  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="flex flex-col rounded-2xl border border-border-subtle bg-surface p-5">
      <div>
        <h3 className="text-sm font-medium text-text-primary">{t("title")}</h3>
        <p className="text-xs text-text-secondary">{t("subtitle")}</p>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={Gem} title={t("empty")} />
        </div>
      ) : (
        <>
          <p className="mt-4 text-xs font-medium tracking-wide text-text-tertiary uppercase">
            {t("total")}
          </p>
          <p className="text-2xl font-semibold text-text-primary">{total}</p>

          <ul className="mt-4 space-y-3">
            {rows.map((row) => (
              <li key={row.stage} className="flex items-center gap-3 text-sm">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: STAGE_COLOR[row.stage] }}
                  aria-hidden
                />
                <span className="flex-1 text-text-primary">{tStage(row.stage)}</span>
                <span className="text-text-secondary">{row.count}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
