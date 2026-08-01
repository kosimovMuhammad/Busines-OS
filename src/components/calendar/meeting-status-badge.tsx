import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { MeetingStatus } from "@/types/enums";

const STATUS_CLASSES: Record<MeetingStatus, string> = {
  SCHEDULED: "bg-accent-secondary/10 text-accent-secondary",
  COMPLETED: "bg-success/10 text-success",
  CANCELLED: "bg-surface-elevated text-text-tertiary line-through",
};

export function MeetingStatusBadge({ status }: { status: MeetingStatus }) {
  const t = useTranslations("enums.meetingStatus");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        STATUS_CLASSES[status]
      )}
    >
      {t(status)}
    </span>
  );
}
