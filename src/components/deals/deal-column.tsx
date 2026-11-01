"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { Minimize2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCanMutate } from "@/lib/hooks/usePermissions";
import { DealCard } from "./deal-card";
import { STAGE_COLOR } from "./deal-stage-visuals";
import type { Deal } from "@/types/api";
import type { DealStage } from "@/types/enums";

export function DealColumn({
  stage,
  label,
  deals,
  contactNameById,
  ownerNameById,
  activeDealId,
  onCardClick,
  onQuickAdd,
}: {
  stage: DealStage;
  label: string;
  deals: Deal[];
  contactNameById: Map<string, string>;
  ownerNameById: Map<string, string>;
  activeDealId: string | null;
  onCardClick: (deal: Deal) => void;
  onQuickAdd: (stage: DealStage) => void;
}) {
  const t = useTranslations("pages.deals");
  const canMutate = useCanMutate();
  const [collapsed, setCollapsed] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  const itemIds = deals.map((d) => d.id);

  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col rounded-xl bg-surface-elevated p-2.5">
      <div className="flex items-center justify-between px-1 pb-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ background: STAGE_COLOR[stage] }}
            aria-hidden
          />
          <span className="truncate text-sm font-medium text-text-primary">{label}</span>
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-xs text-text-secondary">
            {deals.length}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? t("expandColumn") : t("collapseColumn")}
            aria-expanded={!collapsed}
            className="flex size-6 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
          >
            <Minimize2 className={cn("size-3.5 transition-transform", collapsed && "rotate-180")} />
          </button>
          {canMutate && (
            <button
              type="button"
              onClick={() => onQuickAdd(stage)}
              aria-label={t("createDeal")}
              className="flex size-6 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
            >
              <Plus className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div
            ref={setNodeRef}
            className={cn(
              "flex min-h-16 flex-1 flex-col gap-2 rounded-xl border border-dashed border-transparent transition-colors overflow-y-auto no-scrollbar",
              isOver && "border-border-glow bg-surface-elevated/30"
            )}
          >
            {deals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                contactName={contactNameById.get(deal.contactId) ?? null}
                ownerName={deal.ownerId ? (ownerNameById.get(deal.ownerId) ?? null) : null}
                onClick={() => onCardClick(deal)}
                isDraggingActive={activeDealId === deal.id}
              />
            ))}

            {canMutate && (
              <button
                type="button"
                onClick={() => onQuickAdd(stage)}
                className="mt-1 flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-2 text-left text-xs text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-secondary"
              >
                <Plus className="size-3.5" />
                {t("newItem")}
              </button>
            )}
          </div>
        </SortableContext>
      )}
    </div>
  );
}
