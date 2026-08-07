"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ScrollText } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { useGetWebhookLogsQuery, useGetWebhooksQuery } from "@/lib/api/webhooks.api";

const ALL_WEBHOOKS = "__all__";
const ALL_STATUS = "__all__";
const LIMIT = 20;

export function WebhookLogsTab() {
  const t = useTranslations("pages.automation.webhooks.logs");
  const locale = useLocale();
  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });

  const { data: webhooks } = useGetWebhooksQuery();
  const [webhookId, setWebhookId] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetWebhookLogsQuery({
    webhookId: webhookId || undefined,
    success: success === "" ? undefined : success === "true",
    page,
    limit: LIMIT,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={webhookId || ALL_WEBHOOKS}
          onValueChange={(value) => {
            setWebhookId(value === ALL_WEBHOOKS ? "" : (value ?? ""));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-52">
            <SelectValue>
              {(value: string) =>
                value === ALL_WEBHOOKS || !value
                  ? t("allWebhooks")
                  : (webhooks?.find((w) => w.id === value)?.url ?? t("allWebhooks"))
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_WEBHOOKS}>{t("allWebhooks")}</SelectItem>
            {webhooks?.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.url}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={success || ALL_STATUS}
          onValueChange={(value) => {
            setSuccess(value === ALL_STATUS ? "" : (value ?? ""));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue>
              {(value: string) =>
                value === ALL_STATUS || !value
                  ? t("allStatuses")
                  : value === "true"
                    ? t("success")
                    : t("failed")
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUS}>{t("allStatuses")}</SelectItem>
            <SelectItem value="true">{t("success")}</SelectItem>
            <SelectItem value="false">{t("failed")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState icon={ScrollText} title={t("empty")} />
      ) : (
        <div className="rounded-2xl border border-border-subtle bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead>{t("columnEvent")}</TableHead>
                <TableHead>{t("columnStatus")}</TableHead>
                <TableHead>{t("columnStatusCode")}</TableHead>
                <TableHead>{t("columnDate")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((log) => (
                <TableRow key={log.id} className="border-border-subtle">
                  <TableCell className="text-sm font-medium text-text-primary">{log.event}</TableCell>
                  <TableCell>
                    {log.success ? <Badge>{t("success")}</Badge> : <Badge variant="destructive">{t("failed")}</Badge>}
                  </TableCell>
                  <TableCell className="text-text-secondary">{log.statusCode ?? "—"}</TableCell>
                  <TableCell className="text-text-secondary">
                    {formatter.format(new Date(log.createdAt))}
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
