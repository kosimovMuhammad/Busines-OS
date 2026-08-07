"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Archive, ArchiveRestore, FileSignature, Pencil, Send, Trash2, XCircle } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  useArchiveContractMutation,
  useGetContractQuery,
  useRestoreContractMutation,
  useUpdateContractMutation,
} from "@/lib/api/contracts.api";
import { ContractStatusBadge } from "./contract-status-badge";
import { ContractFormSheet } from "./contract-form-sheet";
import { DeleteContractDialog } from "./delete-contract-dialog";
import { SignContractDialog } from "./sign-contract-dialog";
import type { Contract } from "@/types/api";

export function ContractDetailContent({ id }: { id: string }) {
  const t = useTranslations("pages.contracts");
  const router = useRouter();
  const locale = useLocale();
  const { data: contract, isLoading } = useGetContractQuery(id);

  const [updateContract] = useUpdateContractMutation();
  const [archiveContract, { isLoading: isArchiving }] = useArchiveContractMutation();
  const [restoreContract, { isLoading: isRestoring }] = useRestoreContractMutation();

  const [editOpen, setEditOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [deletingContract, setDeletingContract] = useState<Contract | null>(null);

  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const dateTimeFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });

  if (isLoading || !contract) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const canEdit = contract.status === "Draft" || contract.status === "Sent";
  const canDelete = contract.status !== "Signed";

  return (
    <div className="space-y-4">
      <Link
        href="/contracts"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="size-4" />
        {t("backToList")}
      </Link>

      {contract.isArchived && (
        <div className="rounded-xl border border-border-subtle bg-surface-elevated px-4 py-2 text-sm text-text-secondary">
          {t("archivedNotice")}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border-subtle bg-surface p-5">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-text-tertiary">
            <FileSignature className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-text-primary">{contract.title}</h1>
            <p className="text-sm text-text-secondary">
              {contract.contactId ? (
                <Link href={`/contacts/${contract.contactId}`} className="hover:underline">
                  {contract.contactName ?? contract.counterpartyName}
                </Link>
              ) : (
                (contract.counterpartyName ?? "—")
              )}
            </p>
            {contract.dealTitle && <p className="text-xs text-text-tertiary">{contract.dealTitle}</p>}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <ContractStatusBadge status={contract.status} />

          {contract.status === "Draft" && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => updateContract({ id: contract.id, body: { status: "Sent" } })}
            >
              <Send className="size-3.5" />
              {t("send")}
            </Button>
          )}
          {contract.status === "Sent" && (
            <Button type="button" size="sm" onClick={() => setSignOpen(true)}>
              <FileSignature className="size-3.5" />
              {t("sign")}
            </Button>
          )}
          {(contract.status === "Draft" || contract.status === "Sent") && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => updateContract({ id: contract.id, body: { status: "Cancelled" } })}
            >
              <XCircle className="size-3.5" />
              {t("cancelContract")}
            </Button>
          )}

          {canEdit && (
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="flex size-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
              aria-label={t("edit")}
            >
              <Pencil className="size-4" />
            </button>
          )}
          {contract.isArchived ? (
            <button
              type="button"
              onClick={() => restoreContract(contract.id)}
              disabled={isRestoring}
              className="flex size-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
              aria-label={t("restore")}
            >
              <ArchiveRestore className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => archiveContract(contract.id)}
              disabled={isArchiving}
              className="flex size-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
              aria-label={t("archive")}
            >
              <Archive className="size-4" />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => setDeletingContract(contract)}
              className="flex size-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
              aria-label={t("delete")}
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border-subtle bg-surface p-4">
          <p className="text-xs font-medium text-text-tertiary uppercase">{t("form.effectiveDate")}</p>
          <p className="mt-1 text-lg font-semibold text-text-primary">
            {contract.effectiveDate ? dateFormatter.format(new Date(contract.effectiveDate)) : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-surface p-4">
          <p className="text-xs font-medium text-text-tertiary uppercase">{t("form.expiryDate")}</p>
          <p className="mt-1 text-lg font-semibold text-text-primary">
            {contract.expiryDate ? dateFormatter.format(new Date(contract.expiryDate)) : "—"}
          </p>
        </div>
      </div>

      {contract.status === "Signed" && (
        <div className="rounded-2xl border border-success/30 bg-success/5 p-4">
          <p className="text-xs font-medium text-success uppercase">{t("signedBanner")}</p>
          <p className="mt-1 text-sm text-text-primary">
            {t("signedBy", {
              name: contract.signedByUserName ?? "—",
              date: contract.signedAt ? dateTimeFormatter.format(new Date(contract.signedAt)) : "—",
            })}
          </p>
          {contract.signedIpAddress && (
            <p className="text-xs text-text-tertiary">{t("signedIp", { ip: contract.signedIpAddress })}</p>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-border-subtle bg-surface p-5">
        <p className="mb-2 text-xs font-medium text-text-tertiary uppercase">{t("form.content")}</p>
        {contract.content ? (
          <pre className="max-h-[32rem] overflow-y-auto font-sans text-sm whitespace-pre-wrap text-text-secondary">
            {contract.content}
          </pre>
        ) : (
          <p className="text-sm text-text-tertiary">{t("noContent")}</p>
        )}
      </div>

      <ContractFormSheet open={editOpen} onOpenChange={setEditOpen} contract={contract} />

      <SignContractDialog contractId={contract.id} open={signOpen} onOpenChange={setSignOpen} />

      <DeleteContractDialog
        contract={deletingContract}
        onOpenChange={(open) => !open && setDeletingContract(null)}
        onDeleted={() => router.push("/contracts")}
      />
    </div>
  );
}
