"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Download, History } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { useGetUsersQuery } from "@/lib/api/users.api";
import { useGetAuditLogQuery } from "@/lib/api/auditLog.api";
import { useAppSelector } from "@/store/hooks";
import { parseAuditAction } from "@/lib/utils";

const ALL_USERS = "__all__";
const LIMIT = 20;

export function AuditLogTab() {
  const t = useTranslations("pages.settingsSecurity.auditLog");
  const locale = useLocale();
  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  const { data: users } = useGetUsersQuery();
  const [userId, setUserId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetAuditLogQuery({
    userId: userId || undefined,
    from: from || undefined,
    to: to || undefined,
    page,
    limit: LIMIT,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (userId) params.set("userId", userId);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/audit/export?${params}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={userId || ALL_USERS}
          onValueChange={(value) => {
            setUserId(value === ALL_USERS ? "" : (value ?? ""));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue>
              {(value: string) =>
                value === ALL_USERS || !value
                  ? t("allUsers")
                  : (users?.find((u) => u.id === value)?.name ?? t("allUsers"))
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_USERS}>{t("allUsers")}</SelectItem>
            {users?.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          type="date"
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border-subtle bg-background px-3 py-1.5 text-sm text-text-primary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border-subtle bg-background px-3 py-1.5 text-sm text-text-primary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none"
        />

        <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={handleExport}>
          <Download className="size-3.5" />
          {t("export")}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState icon={History} title={t("empty")} />
      ) : (
        <div className="rounded-2xl border border-border-subtle bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead>{t("columnAction")}</TableHead>
                <TableHead>{t("columnUser")}</TableHead>
                <TableHead>{t("columnTarget")}</TableHead>
                <TableHead>{t("columnIp")}</TableHead>
                <TableHead>{t("columnDate")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className={isFetching ? "opacity-60" : undefined}>
              {data.data.map((entry) => {
                const { module, label } = parseAuditAction(entry.action);
                return (
                  <TableRow key={entry.id} className="border-border-subtle">
                    <TableCell>
                      <p className="text-sm text-text-primary">{label}</p>
                      {module && <p className="text-xs text-text-tertiary">{module}</p>}
                    </TableCell>
                    <TableCell className="text-text-secondary">{entry.userName}</TableCell>
                    <TableCell className="text-text-secondary">{entry.targetType}</TableCell>
                    <TableCell className="text-text-tertiary">{entry.ipAddress ?? "—"}</TableCell>
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
