"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { useGetLoginHistoryQuery } from "@/lib/api/auditLog.api";

const LIMIT = 20;

export function LoginHistoryTab() {
  const t = useTranslations("pages.settingsSecurity.loginHistory");
  const locale = useLocale();
  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });

  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetLoginHistoryQuery({ page, limit: LIMIT });
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
        <EmptyState icon={ShieldCheck} title={t("empty")} />
      ) : (
        <div className="rounded-2xl border border-border-subtle bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead>{t("columnDevice")}</TableHead>
                <TableHead>{t("columnIp")}</TableHead>
                <TableHead>{t("columnStatus")}</TableHead>
                <TableHead>{t("columnDate")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((entry) => (
                <TableRow key={entry.id} className="border-border-subtle">
                  <TableCell>
                    <p className="text-sm text-text-primary">{entry.deviceInfo ?? "—"}</p>
                    {entry.isNewDevice && (
                      <Badge variant="outline" className="mt-1">
                        {t("newDevice")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-text-secondary">{entry.ipAddress ?? "—"}</TableCell>
                  <TableCell>
                    {entry.success ? (
                      <Badge>{t("success")}</Badge>
                    ) : (
                      <Badge variant="destructive">{entry.failureReason ?? t("failed")}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {formatter.format(new Date(entry.loginAt))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
