"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Camera, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { PermissionGuard } from "@/components/guards/permission-guard";
import { MUTATION_ALLOWED_ROLES } from "@/lib/permissions/constants";
import { useAppSelector } from "@/store/hooks";
import { selectIsPlatformAdmin } from "@/store/authSelectors";
import { cn, initials } from "@/lib/utils";
import {
  useGetInstagramAccountsQuery,
  useLazyGetInstagramConnectUrlQuery,
} from "@/lib/api/instagram.api";
import { InstagramConnectSheet } from "./instagram-connect-sheet";
import type { InstagramAccount } from "@/types/api";

function AccountRow({
  account,
  isPlatformAdmin,
  onReconnect,
  isReconnecting,
}: {
  account: InstagramAccount;
  isPlatformAdmin: boolean;
  onReconnect: () => void;
  isReconnecting: boolean;
}) {
  const t = useTranslations("pages.instagram");
  const displayName = account.name?.trim() || account.username;

  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-surface p-4">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar>
          <AvatarFallback className="text-xs">{initials(displayName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text-primary">{displayName}</p>
          <p className="truncate text-xs text-text-tertiary">
            {t("accountRow.username")}: @{account.username}
          </p>
          {isPlatformAdmin && account.tokenExpiresAt && (
            <p className="mt-0.5 truncate text-[11px] text-text-tertiary">
              {t("accountRow.tokenExpires")}: {new Date(account.tokenExpiresAt).toLocaleString()}
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
          {account.isActive ? t("accountRow.active") : t("accountRow.reconnectRequired")}
        </Badge>

        {!account.isActive && (
          <PermissionGuard roles={MUTATION_ALLOWED_ROLES}>
            <Button type="button" size="sm" variant="outline" onClick={onReconnect} disabled={isReconnecting}>
              {isReconnecting && <Loader2 className="size-3.5 animate-spin" />}
              {t("accountRow.reconnect")}
            </Button>
          </PermissionGuard>
        )}
      </div>
    </li>
  );
}

export function InstagramAccountsPanel() {
  const t = useTranslations("pages.instagram");
  const { data: accounts, isLoading, refetch } = useGetInstagramAccountsQuery();
  const [triggerConnectUrl, { isFetching: isFetchingUrl }] = useLazyGetInstagramConnectUrlQuery();
  const isPlatformAdmin = useAppSelector(selectIsPlatformAdmin);

  const [legacyOpen, setLegacyOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [reconnectingId, setReconnectingId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const status = searchParams.get("status");
  const reason = searchParams.get("reason");

  // Instagram itself redirects the browser to the backend callback, which
  // then redirects back here with ?status=... - there's no frontend
  // callback route to hook a tag invalidation into, so pick the result up
  // from the URL once, surface it, and refetch the accounts list by hand.
  useEffect(() => {
    if (!status) return;
    if (status === "success") {
      toast.success(t("connectCallback.success"));
      refetch();
    } else if (status === "error") {
      toast.error(
        reason ? t("connectCallback.errorWithReason", { reason }) : t("connectCallback.error")
      );
    }
    router.replace(pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, reason]);

  const redirectToConnect = async () => {
    try {
      const { url } = await triggerConnectUrl().unwrap();
      window.location.assign(url);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  const handleReconnect = async (accountId: string) => {
    setReconnectingId(accountId);
    await redirectToConnect();
    setReconnectingId(null);
  };

  const connected = (accounts?.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-surface p-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
              connected ? "bg-success/10 text-success" : "bg-surface-elevated text-text-tertiary"
            }`}
          >
            <Camera className="size-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              {connected ? t("status.connected") : t("status.notConnected")}
            </p>
            <p className="text-xs text-text-tertiary">{t("status.hint")}</p>
          </div>
        </div>

        <PermissionGuard roles={MUTATION_ALLOWED_ROLES}>
          <Button type="button" size="sm" onClick={redirectToConnect} disabled={isFetchingUrl}>
            {isFetchingUrl && <Loader2 className="size-3.5 animate-spin" />}
            {t("connectAccount")}
          </Button>
        </PermissionGuard>
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
            <AccountRow
              key={account.id}
              account={account}
              isPlatformAdmin={isPlatformAdmin}
              isReconnecting={reconnectingId === account.id && isFetchingUrl}
              onReconnect={() => handleReconnect(account.id)}
            />
          ))}
        </ul>
      ) : (
        <EmptyState icon={Camera} title={t("accountsEmpty")} />
      )}

      <PermissionGuard roles={MUTATION_ALLOWED_ROLES}>
        <div className="rounded-2xl border border-border-subtle bg-surface">
          <button
            type="button"
            onClick={() => setLegacyOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-xs font-medium text-text-tertiary transition-colors hover:text-text-secondary"
          >
            {t("legacyConnect.toggle")}
            <ChevronDown className={cn("size-3.5 transition-transform", legacyOpen && "rotate-180")} />
          </button>
          {legacyOpen && (
            <div className="space-y-3 border-t border-border-subtle px-4 py-3">
              <p className="text-xs text-text-tertiary">{t("legacyConnect.description")}</p>
              <Button type="button" size="sm" variant="outline" onClick={() => setSheetOpen(true)}>
                {t("legacyConnect.openForm")}
              </Button>
            </div>
          )}
        </div>
      </PermissionGuard>

      <InstagramConnectSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
