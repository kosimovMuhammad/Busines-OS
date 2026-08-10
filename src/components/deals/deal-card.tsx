"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useLocale } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useCanMutate } from "@/lib/hooks/usePermissions";
import type { Deal } from "@/types/api";

export function DealCard({
  deal,
  contactName,
  ownerName,
  onClick,
}: {
  deal: Deal;
  contactName: string | null;
  ownerName: string | null;
  onClick: () => void;
}) {
  const locale = useLocale();
  const canMutate = useCanMutate();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    disabled: !canMutate,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "space-y-2 rounded-xl border border-border-subtle bg-surface p-3",
        canMutate ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        isDragging && "z-10 opacity-50 shadow-lg"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-text-primary">{deal.title}</p>
        <p className="shrink-0 text-sm font-semibold text-text-primary">
          {formatCurrency(deal.value, deal.currency, locale)}
        </p>
      </div>
      <div className="flex items-center justify-between text-xs text-text-tertiary">
        <span className="truncate">{contactName ?? "—"}</span>
        {ownerName && <span className="shrink-0">{ownerName}</span>}
      </div>
    </div>
  );
}
