"use client";

import { useLocale, useTranslations } from "next-intl";
import { FileSignature } from "lucide-react";
import { Link } from "@/i18n/navigation";
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
import { ContractStatusBadge } from "./contract-status-badge";
import type { Contract } from "@/types/api";

export function ContractsTable({
  contracts,
  isLoading,
}: {
  contracts: Contract[];
  isLoading: boolean;
}) {
  const t = useTranslations("pages.contracts");
  const locale = useLocale();
  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (contracts.length === 0) {
    return <EmptyState icon={FileSignature} title={t("empty")} />;
  }

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface">
      <Table>
        <TableHeader>
          <TableRow className="border-border-subtle hover:bg-transparent">
            <TableHead>{t("columnTitle")}</TableHead>
            <TableHead>{t("columnCounterparty")}</TableHead>
            <TableHead>{t("columnStatus")}</TableHead>
            <TableHead>{t("columnUpdated")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => (
            <TableRow key={contract.id} className="border-border-subtle">
              <TableCell>
                <Link
                  href={`/contracts/${contract.id}`}
                  className="text-sm font-medium text-text-primary hover:underline"
                >
                  {contract.title}
                </Link>
                {contract.dealTitle && (
                  <p className="text-xs text-text-tertiary">{contract.dealTitle}</p>
                )}
              </TableCell>
              <TableCell className="text-text-secondary">
                {contract.counterpartyName ?? contract.contactName ?? "—"}
              </TableCell>
              <TableCell>
                <ContractStatusBadge status={contract.status} />
              </TableCell>
              <TableCell className="text-text-secondary">
                {formatter.format(new Date(contract.updatedAt))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
