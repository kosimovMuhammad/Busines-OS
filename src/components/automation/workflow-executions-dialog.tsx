"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { History } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { useGetWorkflowExecutionsQuery } from "@/lib/api/workflows.api";
import type { WorkflowSummary } from "@/types/api";
import type { WorkflowExecutionStatus } from "@/types/api";

const LIMIT = 10;

const STATUS_VARIANT: Record<WorkflowExecutionStatus, "default" | "destructive" | "outline"> = {
  Success: "default",
  Failed: "destructive",
  Skipped: "outline",
};

export function WorkflowExecutionsDialog({
  workflow,
  onOpenChange,
}: {
  workflow: WorkflowSummary | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("pages.automation.workflows.executions");
  const locale = useLocale();
  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetWorkflowExecutionsQuery(
    { id: workflow?.id ?? "", page, limit: LIMIT },
    { skip: !workflow }
  );
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <Dialog open={!!workflow} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{workflow?.name}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : !data || data.data.length === 0 ? (
          <EmptyState icon={History} title={t("empty")} />
        ) : (
          <div className="space-y-3">
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {data.data.map((execution) => (
                <div
                  key={execution.id}
                  className="rounded-xl border border-border-subtle bg-surface-elevated p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={STATUS_VARIANT[execution.status]}>
                      {t(`status.${execution.status}`)}
                    </Badge>
                    <span className="text-xs text-text-tertiary">
                      {formatter.format(new Date(execution.startedAt))}
                    </span>
                  </div>
                  {execution.errorMessage && (
                    <p className="mt-2 text-xs text-danger">{execution.errorMessage}</p>
                  )}
                </div>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
