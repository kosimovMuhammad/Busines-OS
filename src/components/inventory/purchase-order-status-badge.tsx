import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { PurchaseOrderStatus } from "@/types/enums";

const STATUS_CLASSES: Record<PurchaseOrderStatus, string> = {
  Draft: "bg-surface-elevated text-text-tertiary",
  Ordered: "bg-accent-secondary/10 text-accent-secondary",
  Received: "bg-success/10 text-success",
  Cancelled: "bg-surface-elevated text-text-tertiary line-through",
};

export function PurchaseOrderStatusBadge({ status }: { status: PurchaseOrderStatus }) {
  const t = useTranslations("enums.purchaseOrderStatus");

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
