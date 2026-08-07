"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { TableProperties } from "lucide-react";
import { useRunReportQuery } from "@/lib/api/reports.api";
import type { SavedReport } from "@/types/api";

export function RunReportDialog({
  report,
  onOpenChange,
}: {
  report: SavedReport | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("pages.reports.custom");
  const { data, isLoading } = useRunReportQuery(report?.id ?? "", { skip: !report });

  const metricKeys = data?.rows[0] ? Object.keys(data.rows[0].metrics) : (report?.metrics ?? []);

  return (
    <Dialog open={!!report} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{report?.name}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : !data || data.rows.length === 0 ? (
          <EmptyState icon={TableProperties} title={t("runEmpty")} />
        ) : (
          <div className="max-h-96 overflow-y-auto rounded-xl border border-border-subtle">
            <Table>
              <TableHeader>
                <TableRow className="border-border-subtle hover:bg-transparent">
                  <TableHead>{t("groupKey")}</TableHead>
                  {metricKeys.map((key) => (
                    <TableHead key={key}>{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map((row) => (
                  <TableRow key={row.groupKey} className="border-border-subtle">
                    <TableCell className="text-sm font-medium text-text-primary">{row.groupKey}</TableCell>
                    {metricKeys.map((key) => (
                      <TableCell key={key} className="text-text-secondary">
                        {row.metrics[key] ?? "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
