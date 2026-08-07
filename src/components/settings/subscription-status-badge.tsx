import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { SubscriptionStatus } from "@/types/enums";

const STATUS_CLASSES: Record<SubscriptionStatus, string> = {
  Trialing: "bg-accent-secondary/10 text-accent-secondary",
  Active: "bg-success/10 text-success",
  PastDue: "bg-warning/10 text-warning",
  Canceled: "bg-surface-elevated text-text-tertiary",
};

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  const t = useTranslations("enums.subscriptionStatus");

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
