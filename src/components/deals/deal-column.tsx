"use client";

import { useDroppable } from "@dnd-kit/core";
import { useLocale } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { DealCard } from "./deal-card";
import type { Deal } from "@/types/api";
import type { DealStage } from "@/types/enums";

export function DealColumn({
  stage,
  label,
  deals,
  contactNameById,
  ownerNameById,
  onCardClick,
}: {
  stage: DealStage;
  label: string;
  deals: Deal[];
  contactNameById: Map<string, string>;
  ownerNameById: Map<string, string>;
  onCardClick: (deal: Deal) => void;
}) {
  const locale = useLocale();
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  const currency = deals[0]?.currency ?? "TJS";
  const total = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="flex items-center justify-between px-1 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wide text-text-tertiary uppercase">
            {label}
          </span>
          <span className="flex size-5 items-center justify-center rounded-full bg-surface-elevated text-xs text-text-secondary">
            {deals.length}
          </span>
        </div>
        {deals.length > 0 && (
          <span className="text-xs text-text-tertiary">
            {formatCurrency(total, currency, locale)}
          </span>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-1 flex-col gap-2 rounded-2xl border border-dashed border-transparent p-1.5 transition-colors",
          isOver && "border-border-glow bg-surface-elevated/50"
        )}
      >
        {deals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            contactName={contactNameById.get(deal.contactId) ?? null}
            ownerName={deal.ownerId ? (ownerNameById.get(deal.ownerId) ?? null) : null}
            onClick={() => onCardClick(deal)}
          />
        ))}
      </div>
    </div>
  );
}
