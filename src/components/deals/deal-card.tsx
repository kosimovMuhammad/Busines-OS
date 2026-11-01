"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLocale, useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import { cn, initials } from "@/lib/utils";
import { useCanMutate } from "@/lib/hooks/usePermissions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { STAGE_COLOR } from "./deal-stage-visuals";
import type { Deal } from "@/types/api";

// Short, human-scannable reference tag (e.g. "DEAL-4F2A") derived from the
// id - purely cosmetic, not a stored/sequential value.
function dealTag(id: string) {
  return `DEAL-${id.replace(/-/g, "").slice(0, 4).toUpperCase()}`;
}

export function DealCard({
  deal,
  contactName,
  ownerName,
  onClick,
  overlay = false,
  isDraggingActive = false,
}: {
  deal: Deal;
  contactName: string | null;
  ownerName: string | null;
  onClick: () => void;
  overlay?: boolean;
  isDraggingActive?: boolean;
}) {
  const locale = useLocale();
  const tStage = useTranslations("enums.dealStage");
  const tForm = useTranslations("pages.deals.form");
  const canMutate = useCanMutate();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: deal.id,
    disabled: !canMutate || overlay,
  });

  const style = overlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      };

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      {...(overlay ? {} : listeners)}
      {...(overlay ? {} : attributes)}
      onClick={overlay ? undefined : onClick}
      className={cn(
        "space-y-2 rounded-lg border border-border-subtle/40 bg-surface p-2.5 shadow-sm",
        canMutate && !overlay ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        // Ghost: the placeholder left behind while dragging
        isDragging && "opacity-0",
        // Overlay: floating copy that follows the cursor
        overlay && "shadow-2xl ring-1 ring-border-subtle rotate-1 scale-105"
      )}
    >
      <p className="font-mono text-[10px] tracking-wide text-text-tertiary">
        {dealTag(deal.id)}
      </p>

      <p className="text-sm font-medium text-text-primary">{deal.title}</p>

      {contactName && (
        <p className="truncate text-xs text-text-tertiary">{contactName}</p>
      )}

      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle px-2 py-0.5 text-[11px] text-text-secondary"
          >
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ background: STAGE_COLOR[deal.stage] }}
              aria-hidden
            />
            {tStage(deal.stage)}
          </span>
          <span className="shrink-0 rounded-full border border-border-subtle px-2 py-0.5 text-[11px] font-medium text-text-secondary">
            {formatCurrency(deal.value, deal.currency, locale)}
          </span>
        </div>

        <Avatar size="sm" className="shrink-0" title={ownerName ?? tForm("unassigned")}>
          <AvatarFallback className="text-[10px]">
            {ownerName ? initials(ownerName) : "?"}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
