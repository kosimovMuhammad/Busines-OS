"use client";

import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useGetTaskAnalyticsQuery } from "@/lib/api/analytics.api";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import type { TaskStatus } from "@/types/enums";
import { CircleCheck } from "lucide-react";

const STATUS_ORDER: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "COMPLETED",
  "ARCHIVED",
];

const STATUS_COLOR: Record<TaskStatus, string> = {
  TODO: "var(--chart-1)",
  IN_PROGRESS: "var(--chart-2)",
  COMPLETED: "var(--success)",
  ARCHIVED: "var(--text-tertiary)",
};

export function TaskBreakdown() {
  const t = useTranslations("pages.dashboard.tasksBreakdown");
  const tStatus = useTranslations("enums.taskStatus");
  const { data, isLoading } = useGetTaskAnalyticsQuery();

  // Horizontal bars: with 4 categories and translated labels of very
  // different lengths (e.g. "К выполнению" vs "Архив"), a vertical bar
  // chart's x-axis ticks collide/get dropped in this panel's width.
  // A row per category always has room for its own label.
  const rows = STATUS_ORDER.map((status) => ({
    status,
    label: tStatus(status),
    count: data?.byStatus.find((s) => s.status === status)?.count ?? 0,
  }));
  const hasData = rows.some((r) => r.count > 0);
  const maxCount = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-text-primary">{t("title")}</h3>
          <p className="text-xs text-text-secondary">{t("subtitle")}</p>
        </div>
        {!isLoading && (data?.overdueCount ?? 0) > 0 && (
          <span className="shrink-0 rounded-full bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger">
            {t("overdue", { count: data?.overdueCount ?? 0 })}
          </span>
        )}
      </div>

      <div className="mt-4 h-48">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : !hasData ? (
          <EmptyState icon={CircleCheck} title={t("empty")} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
            >
              <XAxis type="number" hide domain={[0, maxCount]} />
              <YAxis
                type="category"
                dataKey="label"
                width={110}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              />
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
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
                {rows.map((row) => (
                  <Cell key={row.status} fill={STATUS_COLOR[row.status]} />
                ))}
                <LabelList
                  dataKey="count"
                  position="right"
                  style={{ fill: "var(--text-primary)", fontSize: 12 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
