import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@/types/enums";

const STATUS_CLASSES: Record<InvoiceStatus, string> = {
  Draft: "bg-surface-elevated text-text-tertiary",
  Sent: "bg-accent-secondary/10 text-accent-secondary",
  Paid: "bg-success/10 text-success",
  Overdue: "bg-danger/10 text-danger",
  Cancelled: "bg-surface-elevated text-text-tertiary line-through",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const t = useTranslations("enums.invoiceStatus");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_CLASSES[status]
      )}
    >
      {t(status)}
    </span>
  );
}
