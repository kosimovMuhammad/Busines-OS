"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Send, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useGetTelegramAccountsQuery } from "@/lib/api/telegram.api";
import { useGetIntegrationsQuery } from "@/lib/api/company.api";
import { TelegramConnectSheet } from "./telegram-connect-sheet";

export function TelegramAccountsPanel() {
  const t = useTranslations("pages.telegram");
  const { data: accounts, isLoading } = useGetTelegramAccountsQuery();
  const { data: integrations } = useGetIntegrationsQuery();
  const [sheetOpen, setSheetOpen] = useState(false);

  const connected = integrations?.telegram?.connected ?? false;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-surface p-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
              connected ? "bg-success/10 text-success" : "bg-surface-elevated text-text-tertiary"
            }`}
          >
            <Send className="size-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              {connected ? t("status.connected") : t("status.notConnected")}
            </p>
            <p className="text-xs text-text-tertiary">{t("status.hint")}</p>
          </div>
        </div>
        <Button type="button" size="sm" onClick={() => setSheetOpen(true)}>
          <Plus className="size-3.5" />
          {t("connectAccount")}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : accounts && accounts.length > 0 ? (
        <ul className="space-y-3">
          {accounts.map((account) => (
            <li
              key={account.id}
              className="flex items-center justify-between rounded-2xl border border-border-subtle bg-surface p-4"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">
                  @{account.botUsername}
                </p>
                <p className="mt-0.5 text-xs text-text-tertiary">
                  {t("accountRow.botUsername")}: {account.botUsername}
                </p>
              </div>
              <Badge variant={account.isActive ? "default" : "outline"}>
                {account.isActive ? t("accountRow.active") : t("accountRow.inactive")}
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={Send} title={t("accountsEmpty")} />
      )}

      <TelegramConnectSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
