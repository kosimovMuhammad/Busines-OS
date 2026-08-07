"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CircleCheck, ClipboardList, Percent, TriangleAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/stat-card";
import { useGetTasksReportQuery } from "@/lib/api/reports.api";
import { useReportExport } from "@/lib/hooks/useReportExport";
import { ReportToolbar } from "./report-toolbar";
import type { TaskPriority, TaskStatus } from "@/types/enums";

function BreakdownList({
  rows,
  labelFor,
}: {
  rows: { label: string; count: number }[];
  labelFor: (label: string) => string;
}) {
  const total = rows.reduce((sum, r) => sum + r.count, 0) || 1;
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-3 text-sm">
          <span className="w-28 shrink-0 text-text-secondary">{labelFor(row.label)}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-elevated">
            <div
              className="h-full rounded-full bg-accent-primary"
              style={{ width: `${(row.count / total) * 100}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-text-tertiary">{row.count}</span>
        </div>
      ))}
    </div>
  );
}

export function TasksReportTab() {
  const t = useTranslations("pages.reports.tasks");
  const tStatus = useTranslations("enums.taskStatus");
  const tPriority = useTranslations("enums.taskPriority");
  const exportReport = useReportExport();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { data, isLoading } = useGetTasksReportQuery({ from: from || undefined, to: to || undefined });

  return (
    <div className="space-y-4">
      <ReportToolbar
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
        onExport={() => exportReport("tasks", { from, to })}
      />

      {isLoading || !data ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={ClipboardList} label={t("total")} value={String(data.totalTasks)} />
            <StatCard
              icon={CircleCheck}
              label={t("completed")}
              value={String(data.completedCount)}
              accent="success"
            />
            <StatCard
              icon={TriangleAlert}
              label={t("overdue")}
              value={String(data.overdueCount)}
              accent="danger"
            />
            <StatCard
              icon={Percent}
              label={t("completionRate")}
              value={data.completionRatePercent === null ? "—" : `${data.completionRatePercent.toFixed(0)}%`}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border-subtle bg-surface p-5">
              <p className="mb-3 text-sm font-semibold text-text-primary">{t("byStatus")}</p>
              <BreakdownList
                rows={data.byStatus.map((r) => ({ label: r.status, count: r.count }))}
                labelFor={(s) => tStatus(s as TaskStatus)}
              />
            </div>
            <div className="rounded-2xl border border-border-subtle bg-surface p-5">
              <p className="mb-3 text-sm font-semibold text-text-primary">{t("byPriority")}</p>
              <BreakdownList
                rows={data.byPriority.map((r) => ({ label: r.priority, count: r.count }))}
                labelFor={(p) => tPriority(p as TaskPriority)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
