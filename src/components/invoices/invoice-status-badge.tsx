import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@/types/enums";

const STATUS_CLASSES: Record<InvoiceStatus, string> = {
  DRAFT: "bg-surface-elevated text-text-tertiary",
  SENT: "bg-accent-secondary/10 text-accent-secondary",
  PAID: "bg-success/10 text-success",
  OVERDUE: "bg-danger/10 text-danger",
  CANCELLED: "bg-surface-elevated text-text-tertiary line-through",
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
