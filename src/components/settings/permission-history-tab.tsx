"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ShieldAlert } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { useGetPermissionHistoryQuery } from "@/lib/api/auditLog.api";
import { parseAuditAction } from "@/lib/utils";

const LIMIT = 20;

export function PermissionHistoryTab() {
  const t = useTranslations("pages.settingsSecurity.permissionHistory");
  const locale = useLocale();
  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });

  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetPermissionHistoryQuery({ page, limit: LIMIT });
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState icon={ShieldAlert} title={t("empty")} />
      ) : (
        <div className="rounded-2xl border border-border-subtle bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead>{t("columnAction")}</TableHead>
                <TableHead>{t("columnUser")}</TableHead>
                <TableHead>{t("columnTarget")}</TableHead>
                <TableHead>{t("columnDate")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((entry) => {
                const { label } = parseAuditAction(entry.action);
                return (
                  <TableRow key={entry.id} className="border-border-subtle">
                    <TableCell className="text-sm text-text-primary">{label}</TableCell>
                    <TableCell className="text-text-secondary">{entry.userName}</TableCell>
                    <TableCell className="text-text-secondary">{entry.targetType}</TableCell>
                    <TableCell className="text-text-secondary">
                      {formatter.format(new Date(entry.createdAt))}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
