"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { InvoiceStatus } from "@/types/enums";

const ALL = "__all__";
const STATUSES: InvoiceStatus[] = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"];

export function InvoicesFilters({
  status,
  onStatusChange,
  onCreate,
}: {
  status: string;
  onStatusChange: (value: string) => void;
  onCreate: () => void;
}) {
  const t = useTranslations("pages.invoices");
  const tStatus = useTranslations("enums.invoiceStatus");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={status || ALL}
        onValueChange={(value) => onStatusChange(value === ALL || !value ? "" : value)}
      >
        <SelectTrigger className="h-9 w-44">
          <SelectValue>
            {(value: string) =>
              !value || value === ALL ? t("allStatuses") : tStatus(value as InvoiceStatus)
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("allStatuses")}</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {tStatus(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="button" onClick={onCreate} className="ml-auto">
        {t("createInvoice")}
      </Button>
    </div>
  );
}
