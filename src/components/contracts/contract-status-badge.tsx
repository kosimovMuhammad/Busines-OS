import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { ContractStatus } from "@/types/enums";

const STATUS_CLASSES: Record<ContractStatus, string> = {
  Draft: "bg-surface-elevated text-text-tertiary",
  Sent: "bg-accent-secondary/10 text-accent-secondary",
  Signed: "bg-success/10 text-success",
  Expired: "bg-warning/10 text-warning",
  Cancelled: "bg-surface-elevated text-text-tertiary line-through",
};

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const t = useTranslations("enums.contractStatus");

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
