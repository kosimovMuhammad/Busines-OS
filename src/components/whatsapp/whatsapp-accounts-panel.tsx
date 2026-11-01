"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { AlertTriangle, Loader2, MessageCircle, Plug2, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PermissionGuard } from "@/components/guards/permission-guard";
import { MUTATION_ALLOWED_ROLES } from "@/lib/permissions/constants";
import {
  useGetWhatsappAccountsQuery,
  useRetryWhatsappAccountMutation,
} from "@/lib/api/whatsapp.api";
import { useWhatsAppSignup, whatsappErrorCode } from "@/lib/hooks/useWhatsAppSignup";
import { DisconnectWhatsappAccountDialog } from "./disconnect-whatsapp-account-dialog";
import type { WhatsappAccount } from "@/types/api";

function ConnectedCard({
  account,
  issues,
  onDisconnect,
  onIssues,
}: {
  account: WhatsappAccount;
  issues: string[];
  onDisconnect: () => void;
  onIssues: (codes: string[]) => void;
}) {
  const t = useTranslations("pages.whatsapp.signup");
  const locale = useLocale();
  const [retry, { isLoading: retrying }] = useRetryWhatsappAccountMutation();
  const needsAttention = account.connectionStatus === "NeedsAttention";
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  const errorText = (code: string) => (t.has(`errors.${code}`) ? t(`errors.${code}`) : t("errors.unknown"));

  const handleRetry = async () => {
    try {
      const result = await retry(account.id).unwrap();
      onIssues(result.issues);
      if (result.issues.length === 0 && result.account.connectionStatus === "Active") {
        toast.success(t("tab.connectedSuccess"));
      }
    } catch (e) {
      onIssues([whatsappErrorCode(e)]);
    }
  };

  return (
    <div className="space-y-3 rounded-2xl border border-border-subtle bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium text-text-primary">
              {account.displayPhoneNumber ?? account.phoneNumberId}
            </p>
            <Badge
              className={
                needsAttention
                  ? "border-transparent bg-warning/10 text-warning"
                  : "border-transparent bg-success/10 text-success"
              }
            >
              {needsAttention ? t("tab.needsAttentionTitle") : t("tab.connectedTitle")}
            </Badge>
            {account.isOnBizApp && <Badge variant="outline">{t("tab.coexistenceBadge")}</Badge>}
          </div>
          {account.verifiedName && (
            <p className="truncate text-xs text-text-tertiary">
              {t("tab.verifiedName")}: {account.verifiedName}
            </p>
          )}
          <p className="truncate text-xs text-text-tertiary">
            {t("tab.connectedAt")}:{" "}
            {dateFormatter.format(new Date(account.onboardedAt ?? account.createdAt))}
          </p>
        </div>
        <PermissionGuard permission="whatsapp.delete" fallbackRoles={MUTATION_ALLOWED_ROLES}>
          <Button type="button" variant="outline" size="sm" onClick={onDisconnect}>
            <Plug2 className="size-3.5" />
            {t("tab.disconnect")}
          </Button>
        </PermissionGuard>
      </div>

      {account.isOnBizApp && (
        <p className="text-xs text-text-secondary">
          {t("tab.coexistenceNote")} {t("tab.historyNote")}
        </p>
      )}

      {(needsAttention || issues.length > 0) && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-warning/30 bg-warning/5 p-3">
          <div className="flex min-w-0 items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <div className="min-w-0 text-xs text-text-secondary">
              <p className="font-medium text-text-primary">{t("tab.needsAttentionTitle")}</p>
              <p>{t("tab.needsAttentionBody")}</p>
              {issues.map((code) => (
                <p key={code}>{errorText(code)}</p>
              ))}
            </div>
          </div>
          <Button type="button" size="sm" onClick={handleRetry} disabled={retrying}>
            {retrying ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            {retrying ? t("tab.retrying") : t("tab.retry")}
          </Button>
        </div>
      )}
    </div>
  );
}

export function WhatsappAccountsPanel() {
  const t = useTranslations("pages.whatsapp.signup");
  const locale = useLocale();
  const { data: accounts, isLoading } = useGetWhatsappAccountsQuery();
  const [disconnecting, setDisconnecting] = useState<WhatsappAccount | null>(null);
  const [issues, setIssues] = useState<string[]>([]);

  const { connect, busy, ready, unavailable, errorCode, clearError } = useWhatsAppSignup(locale, (result) => {
    setIssues(result.issues);
    if (result.issues.length === 0) toast.success(t("tab.connectedSuccess"));
  });

  const errorText = errorCode
    ? t.has(`errors.${errorCode}`)
      ? t(`errors.${errorCode}`)
      : t("errors.unknown")
    : null;

  if (isLoading) {
    return <Skeleton className="h-20 w-full" />;
  }

  return (
    <div className="space-y-4">
      {errorText && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-text-primary"
        >
          <span>{errorText}</span>
          <button
            type="button"
            onClick={clearError}
            aria-label={t("tab.cancel")}
            className="shrink-0 text-text-tertiary hover:text-text-primary"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {accounts && accounts.length > 0 ? (
        accounts.map((account) => (
          <ConnectedCard
            key={account.id}
            account={account}
            issues={issues}
            onIssues={setIssues}
            onDisconnect={() => setDisconnecting(account)}
          />
        ))
      ) : unavailable ? (
        <div className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-surface p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-text-tertiary">
            <MessageCircle className="size-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">{t("tab.comingSoonTitle")}</p>
            <p className="text-xs text-text-tertiary">{t("tab.comingSoonDescription")}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-2xl border border-border-subtle bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-text-tertiary">
              <MessageCircle className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                {busy ? t("tab.connecting") : t("tab.notConnected")}
              </p>
              <p className="text-xs text-text-tertiary">{t("tab.description")}</p>
              <p className="text-xs text-text-tertiary">{t("tab.connectHint")}</p>
            </div>
          </div>
          <Button type="button" size="sm" onClick={connect} disabled={busy || !ready}>
            {busy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <MessageCircle className="size-3.5" />
            )}
            {busy ? t("tab.connecting") : t("tab.connect")}
          </Button>
        </div>
      )}

      <DisconnectWhatsappAccountDialog
        account={disconnecting}
        onOpenChange={(open) => !open && setDisconnecting(null)}
      />
    </div>
  );
}
