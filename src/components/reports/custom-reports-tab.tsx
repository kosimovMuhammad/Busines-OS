"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, Play, Plus, TableProperties, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { useGetSavedReportsQuery, useRemoveReportMutation } from "@/lib/api/reports.api";
import { CreateReportSheet } from "./create-report-sheet";
import { RunReportDialog } from "./run-report-dialog";
import { PermissionGuard } from "@/components/guards/permission-guard";
import { useCanMutate } from "@/lib/hooks/usePermissions";
import { MUTATION_ALLOWED_ROLES } from "@/lib/permissions/constants";
import type { SavedReport } from "@/types/api";

export function CustomReportsTab() {
  const t = useTranslations("pages.reports.custom");
  const tField = useTranslations("pages.reports.custom.fields");
  const locale = useLocale();
  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  const { data: reports, isLoading } = useGetSavedReportsQuery();
  const [removeReport, { isLoading: isRemoving }] = useRemoveReportMutation();
  const canMutate = useCanMutate();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [runningReport, setRunningReport] = useState<SavedReport | null>(null);
  const [deletingReport, setDeletingReport] = useState<SavedReport | null>(null);

  const handleDelete = async () => {
    if (!deletingReport) return;
    try {
      await removeReport(deletingReport.id).unwrap();
      setDeletingReport(null);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <PermissionGuard roles={MUTATION_ALLOWED_ROLES}>
          <Button type="button" onClick={() => setSheetOpen(true)}>
            <Plus className="size-3.5" />
            {t("createTitle")}
          </Button>
        </PermissionGuard>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !reports || reports.length === 0 ? (
        <EmptyState
          icon={TableProperties}
          title={t("empty")}
          action={
            <PermissionGuard roles={MUTATION_ALLOWED_ROLES}>
              <Button type="button" size="sm" onClick={() => setSheetOpen(true)}>
                <Plus className="size-3.5" />
                {t("createTitle")}
              </Button>
            </PermissionGuard>
          }
        />
      ) : (
        <div className="rounded-2xl border border-border-subtle bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead>{t("columnName")}</TableHead>
                <TableHead>{t("columnEntity")}</TableHead>
                <TableHead>{t("columnGroupBy")}</TableHead>
                <TableHead>{t("columnCreated")}</TableHead>
                <TableHead className="w-24 text-right">{t("columnActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id} className="border-border-subtle">
                  <TableCell className="text-sm font-medium text-text-primary">{report.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{tField(`entity.${report.entityType}`)}</Badge>
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {report.groupBy ? tField(`groupBy.${report.groupBy}`) : "—"}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {formatter.format(new Date(report.createdAt))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setRunningReport(report)}
                        className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                        aria-label={t("run")}
                      >
                        <Play className="size-3.5" />
                      </button>
                      <PermissionGuard roles={MUTATION_ALLOWED_ROLES}>
                        <button
                          type="button"
                          onClick={() => setDeletingReport(report)}
                          className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
                          aria-label={t("delete")}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </PermissionGuard>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateReportSheet open={sheetOpen} onOpenChange={setSheetOpen} />

      <RunReportDialog report={runningReport} onOpenChange={(open) => !open && setRunningReport(null)} />

      <Dialog open={!!deletingReport} onOpenChange={(open) => !open && setDeletingReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("deleteDialog.description", { name: deletingReport?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {t("deleteDialog.cancel")}
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={isRemoving || !canMutate}>
              {isRemoving && <Loader2 className="size-4 animate-spin" />}
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
