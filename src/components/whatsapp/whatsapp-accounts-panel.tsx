"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MessageCircle, MoreHorizontal, Pencil, Plug2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PermissionGuard } from "@/components/guards/permission-guard";
import { MUTATION_ALLOWED_ROLES } from "@/lib/permissions/constants";
import { useRole } from "@/lib/hooks/useRole";
import { cn } from "@/lib/utils";
import { useGetWhatsappAccountsQuery } from "@/lib/api/whatsapp.api";
import { useGetIntegrationsQuery } from "@/lib/api/company.api";
import { WhatsappConnectSheet } from "./whatsapp-connect-sheet";
import { EditWhatsappAccountSheet } from "./edit-whatsapp-account-sheet";
import { DisconnectWhatsappAccountDialog } from "./disconnect-whatsapp-account-dialog";
import type { WhatsappAccount } from "@/types/api";

// wabaId isn't a secret, but truncating it (like a card number) keeps the
// row scannable instead of a long numeric string dominating it.
function maskId(id: string) {
  return id.length > 10 ? `${id.slice(0, 6)}···${id.slice(-4)}` : id;
}

function AccountRow({
  account,
  onEdit,
  onDisconnect,
}: {
  account: WhatsappAccount;
  onEdit: () => void;
  onDisconnect: () => void;
}) {
  const t = useTranslations("pages.whatsapp");
  const locale = useLocale();
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const { hasPermission } = useRole();
  const canEdit = hasPermission("whatsapp.update", MUTATION_ALLOWED_ROLES);
  const canDisconnect = hasPermission("whatsapp.delete", MUTATION_ALLOWED_ROLES);

  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-surface p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-text-primary">
            {account.verifiedName ?? t("accountRow.unnamed")}
          </p>
          <Badge
            className={cn(
              "border-transparent",
              account.isActive
                ? "bg-success/10 text-success"
                : "bg-surface-elevated text-text-tertiary"
            )}
          >
            {account.isActive ? t("accountRow.active") : t("accountRow.disconnected")}
          </Badge>
        </div>
        <p className="mt-0.5 truncate text-xs text-text-tertiary">
          {t("accountRow.phoneNumberId")}: {account.phoneNumberId}
        </p>
        <p className="truncate text-xs text-text-tertiary">
          {t("accountRow.wabaId")}: {maskId(account.wabaId)}
        </p>
        <p className="truncate text-xs text-text-tertiary">
          {t("accountRow.connectedOn")}: {dateFormatter.format(new Date(account.createdAt))}
        </p>
      </div>

      {(canEdit || canDisconnect) && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
            aria-label={t("accountRow.actions")}
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <PermissionGuard permission="whatsapp.update" fallbackRoles={MUTATION_ALLOWED_ROLES}>
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="size-4" />
                {t("accountRow.editName")}
              </DropdownMenuItem>
            </PermissionGuard>
            <PermissionGuard permission="whatsapp.delete" fallbackRoles={MUTATION_ALLOWED_ROLES}>
              <DropdownMenuItem variant="destructive" onClick={onDisconnect}>
                <Plug2 className="size-4" />
                {t("accountRow.disconnectAction")}
              </DropdownMenuItem>
            </PermissionGuard>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </li>
  );
}

export function WhatsappAccountsPanel() {
  const t = useTranslations("pages.whatsapp");
  const { data: accounts, isLoading } = useGetWhatsappAccountsQuery();
  const { data: integrations } = useGetIntegrationsQuery();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<WhatsappAccount | null>(null);
  const [disconnectingAccount, setDisconnectingAccount] = useState<WhatsappAccount | null>(null);

  const connected = integrations?.whatsapp?.connected ?? false;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-surface p-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
              connected ? "bg-success/10 text-success" : "bg-surface-elevated text-text-tertiary"
            }`}
          >
            <MessageCircle className="size-4" />
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
            <AccountRow
              key={account.id}
              account={account}
              onEdit={() => setEditingAccount(account)}
              onDisconnect={() => setDisconnectingAccount(account)}
            />
          ))}
        </ul>
      ) : (
        <EmptyState icon={MessageCircle} title={t("accountsEmpty")} />
      )}

      <WhatsappConnectSheet open={sheetOpen} onOpenChange={setSheetOpen} />

      <EditWhatsappAccountSheet
        account={editingAccount}
        onOpenChange={(open) => !open && setEditingAccount(null)}
      />

      <DisconnectWhatsappAccountDialog
        account={disconnectingAccount}
        onOpenChange={(open) => !open && setDisconnectingAccount(null)}
      />
    </div>
  );
}
