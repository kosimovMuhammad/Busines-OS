"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateInvoiceStatusMutation } from "@/lib/api/invoices.api";
import type { InvoiceStatus } from "@/types/enums";

const STATUSES: InvoiceStatus[] = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"];

export function InvoiceStatusSelect({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: InvoiceStatus;
}) {
  const t = useTranslations("enums.invoiceStatus");
  const [updateStatus, { isLoading }] = useUpdateInvoiceStatusMutation();

  return (
    <Select
      value={status}
      onValueChange={(value) => {
        const next = value as InvoiceStatus;
        if (next && next !== status) {
          updateStatus({ id: invoiceId, body: { status: next } });
        }
      }}
    >
      <SelectTrigger className="h-8 w-36" disabled={isLoading}>
        <SelectValue>{(value: string) => t(value as InvoiceStatus)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {t(s)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
