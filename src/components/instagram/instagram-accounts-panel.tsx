"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Camera, Loader2, Lock, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PermissionGuard } from "@/components/guards/permission-guard";
import { MUTATION_ALLOWED_ROLES } from "@/lib/permissions/constants";
import { cn, initials } from "@/lib/utils";
import {
  useGetInstagramAccountsQuery,
  useLazyGetInstagramConnectUrlQuery,
} from "@/lib/api/instagram.api";
import { DisconnectInstagramDialog } from "./disconnect-instagram-dialog";
import type { InstagramAccount } from "@/types/api";

const DAY_MS = 24 * 60 * 60 * 1000;
const EXPIRY_WARNING_DAYS = 7;

// Backend error codes -> translation keys (pages.instagram.callback.*).
// `retry: false` for errors where trying again can't help.
const ERROR_CODES: Record<string, { key: string; retry: boolean }> = {
  invalid_state: { key: "invalidState", retry: true },
  already_connected: { key: "alreadyConnected", retry: false },
  provider_error: { key: "providerError", retry: true },
};

type CallbackNotice = { code: string; message: string | null };

function readCallback(params: URLSearchParams) {
  const connected = params.get("connected");
  const error = params.get("error");
  if (connected === null && !error) return null;
  return {
    connected: connected === "true",
    username: params.get("username"),
    error,
    message: params.get("message"),
  };
}

function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function AccountRow({
  account,
  now,
  onReconnect,
  isConnecting,
  onDisconnect,
}: {
  account: InstagramAccount;
  now: number;
  onReconnect: () => void;
  isConnecting: boolean;
  onDisconnect: () => void;
}) {
  const t = useTranslations("pages.instagram");
  const format = useFormatter();
  const displayName = account.name?.trim() || account.username;

  const expiresAt = account.tokenExpiresAt ? new Date(account.tokenExpiresAt).getTime() : null;
  const msLeft = expiresAt === null ? null : expiresAt - now;
  const expired = msLeft !== null && msLeft <= 0;
  const expiringSoon = msLeft !== null && !expired && msLeft < EXPIRY_WARNING_DAYS * DAY_MS;
  const daysLeft = msLeft === null ? 0 : Math.max(1, Math.ceil(msLeft / DAY_MS));
  const needsReconnect = expired || expiringSoon || !account.isActive;

  const warning = expired
    ? t("expiry.expired")
    : expiringSoon
      ? t("expiry.soon", { days: daysLeft })
      : !account.isActive
        ? t("expiry.inactive")
        : null;

  return (
    <li className="rounded-2xl border border-border-subtle bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar>
            <AvatarFallback className="text-xs">{initials(displayName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-primary">@{account.username}</p>
            {account.name?.trim() && (
              <p className="truncate text-xs text-text-tertiary">{account.name.trim()}</p>
            )}
            {account.tokenExpiresAt && !expired && (
              <p className="mt-0.5 truncate text-[11px] text-text-tertiary">
                {t("accountRow.tokenValidUntil", {
                  date: format.dateTime(new Date(account.tokenExpiresAt), { dateStyle: "medium" }),
                })}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Badge
            className={cn(
              "border-transparent",
              account.isActive ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
            )}
          >
            {account.isActive ? t("accountRow.active") : t("accountRow.inactive")}
          </Badge>

          <PermissionGuard roles={MUTATION_ALLOWED_ROLES}>
            {needsReconnect && (
              <Button type="button" size="sm" variant="outline" onClick={onReconnect} disabled={isConnecting}>
                {isConnecting && <Loader2 className="size-3.5 animate-spin" />}
                {t("accountRow.reconnect")}
              </Button>
            )}
            <Button type="button" size="sm" variant="ghost" onClick={onDisconnect}>
              {t("accountRow.disconnect")}
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {warning && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          <span>{warning}</span>
        </div>
      )}
    </li>
  );
}

export function InstagramAccountsPanel() {
  const t = useTranslations("pages.instagram");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const now = useNow();

  // Tokens are long-lived, but keep the list (and the "valid until" /
  // expiry warning derived from it) fresh while the page stays open.
  const {
    data: accounts,
    isLoading,
    error,
    refetch,
  } = useGetInstagramAccountsQuery(undefined, {
    pollingInterval: 5 * 60_000,
    skipPollingIfUnfocused: true,
  });
  const [triggerConnectUrl] = useLazyGetInstagramConnectUrlQuery();

  const [connecting, setConnecting] = useState(false);
  const [disconnectTarget, setDisconnectTarget] = useState<InstagramAccount | null>(null);

  // Backend redirects here with ?connected=...&error=...&username=...; read
  // them once (initial state), then toast + strip them in the effect below.
  const [callback] = useState(() => readCallback(searchParams));
  const [notice, setNotice] = useState<CallbackNotice | null>(() => {
    if (!callback || callback.connected || !callback.error) return null;
    if (callback.error === "access_denied") return null;
    return { code: callback.error, message: callback.message };
  });
  const handled = useRef(false);

  useEffect(() => {
    if (!callback || handled.current) return;
    handled.current = true;

    if (callback.connected) {
      toast.success(
        callback.username
          ? t("callback.connected", { username: callback.username })
          : t("callback.connectedGeneric")
      );
      refetch();
    } else if (callback.error === "access_denied") {
      toast.info(t("callback.cancelled"));
    } else {
      const known = callback.error ? ERROR_CODES[callback.error] : undefined;
      toast.error(known ? t(`callback.${known.key}`) : callback.message || t("callback.generic"));
    }

    window.history.replaceState(null, "", window.location.pathname + window.location.hash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startConnect = async () => {
    setNotice(null);
    setConnecting(true);
    try {
      const { url } = await triggerConnectUrl(locale).unwrap();
      // Full-page redirect; keep the button disabled while the browser leaves.
      window.location.assign(url);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
      setConnecting(false);
    }
  };

  // 403 = the Instagram module isn't enabled for this company.
  if ((error as { status?: number } | undefined)?.status === 403) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-surface p-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-text-tertiary">
          <Lock className="size-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">{t("moduleDisabled.title")}</p>
          <p className="mt-1 text-xs text-text-tertiary">{t("moduleDisabled.description")}</p>
        </div>
      </div>
    );
  }

  const noticeInfo = notice
    ? (() => {
        const known = ERROR_CODES[notice.code];
        return {
          text: known ? t(`callback.${known.key}`) : notice.message || t("callback.generic"),
          retry: known ? known.retry : true,
        };
      })()
    : null;

  const hasAccounts = (accounts?.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      {noticeInfo && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          <span className="flex items-start gap-2">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            {noticeInfo.text}
          </span>
          <span className="flex items-center gap-2">
            {noticeInfo.retry && (
              <PermissionGuard roles={MUTATION_ALLOWED_ROLES}>
                <Button type="button" size="sm" variant="outline" onClick={startConnect} disabled={connecting}>
                  {connecting && <Loader2 className="size-3.5 animate-spin" />}
                  {t("callback.retry")}
                </Button>
              </PermissionGuard>
            )}
            <Button type="button" size="sm" variant="ghost" onClick={() => setNotice(null)}>
              {t("callback.dismiss")}
            </Button>
          </span>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : hasAccounts ? (
        <ul className="space-y-3">
          {accounts!.map((account) => (
            <AccountRow
              key={account.id}
              account={account}
              now={now}
              isConnecting={connecting}
              onReconnect={startConnect}
              onDisconnect={() => setDisconnectTarget(account)}
            />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border-subtle bg-surface px-6 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-surface-elevated text-text-tertiary">
            <Camera className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">{t("notConnected.title")}</p>
            <p className="mt-1 text-xs text-text-secondary">{t("notConnected.description")}</p>
          </div>
          <PermissionGuard roles={MUTATION_ALLOWED_ROLES}>
            <Button type="button" onClick={startConnect} disabled={connecting}>
              {connecting && <Loader2 className="size-4 animate-spin" />}
              {t("notConnected.connect")}
            </Button>
          </PermissionGuard>
          <p className="max-w-md text-xs text-text-tertiary">{t("notConnected.requirement")}</p>
        </div>
      )}

      <DisconnectInstagramDialog
        account={disconnectTarget}
        onOpenChange={(open) => {
          if (!open) setDisconnectTarget(null);
        }}
      />
    </div>
  );
}
