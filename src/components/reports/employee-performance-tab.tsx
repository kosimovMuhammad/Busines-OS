"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { formatCurrency } from "@/lib/utils";
import { useGetUsersQuery } from "@/lib/api/users.api";
import { useGetEmployeePerformanceReportQuery } from "@/lib/api/reports.api";
import { useReportExport } from "@/lib/hooks/useReportExport";
import { ReportToolbar } from "./report-toolbar";

const CURRENCY = "TJS";
const ALL_USERS = "__all__";

export function EmployeePerformanceTab() {
  const t = useTranslations("pages.reports.employeePerformance");
  const locale = useLocale();
  const exportReport = useReportExport();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [userId, setUserId] = useState("");
  const { data: users } = useGetUsersQuery();
  const { data, isLoading } = useGetEmployeePerformanceReportQuery({
    from: from || undefined,
    to: to || undefined,
    userId: userId || undefined,
  });

  return (
    <div className="space-y-4">
      <ReportToolbar
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
        onExport={() => exportReport("employee-performance", { from, to })}
      >
        <Select value={userId || ALL_USERS} onValueChange={(value) => setUserId(value === ALL_USERS ? "" : (value ?? ""))}>
          <SelectTrigger className="h-8 w-40">
            <SelectValue>
              {(value: string) =>
                value === ALL_USERS || !value
                  ? t("allEmployees")
                  : (users?.find((u) => u.id === value)?.name ?? t("allEmployees"))
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_USERS}>{t("allEmployees")}</SelectItem>
            {users?.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ReportToolbar>

      {isLoading || !data ? (
        <Skeleton className="h-64 w-full" />
      ) : data.length === 0 ? (
        <EmptyState icon={Users} title={t("empty")} />
      ) : (
        <div className="rounded-2xl border border-border-subtle bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead>{t("columnEmployee")}</TableHead>
                <TableHead>{t("columnWon")}</TableHead>
                <TableHead>{t("columnLost")}</TableHead>
                <TableHead>{t("columnTasksCompleted")}</TableHead>
                <TableHead>{t("columnTasksOverdue")}</TableHead>
                <TableHead>{t("columnActivity")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.userId} className="border-border-subtle">
                  <TableCell className="text-sm font-medium text-text-primary">{row.userName}</TableCell>
                  <TableCell className="text-text-secondary">
                    {row.dealsWonCount} · {formatCurrency(row.dealsWonValue, CURRENCY, locale)}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {row.dealsLostCount} · {formatCurrency(row.dealsLostValue, CURRENCY, locale)}
                  </TableCell>
                  <TableCell className="text-text-secondary">{row.tasksCompleted}</TableCell>
                  <TableCell className="text-text-secondary">{row.tasksOverdue}</TableCell>
                  <TableCell className="text-text-secondary">{row.activityCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
