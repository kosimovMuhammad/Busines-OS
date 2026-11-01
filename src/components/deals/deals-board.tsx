"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useDragAutoScroll } from "@/hooks/use-drag-auto-scroll";
import { useGetDealsQuery, useUpdateDealStageMutation } from "@/lib/api/deals.api";
import { useGetContactsQuery } from "@/lib/api/contacts.api";
import { useGetUsersQuery } from "@/lib/api/users.api";
import { Skeleton } from "@/components/ui/skeleton";
import { useCanMutate } from "@/lib/hooks/usePermissions";
import { DealColumn } from "./deal-column";
import { DealsFilters } from "./deals-filters";
import { DealFormSheet } from "./deal-form-sheet";
import { DeleteDealDialog } from "./delete-deal-dialog";
import { DealCard } from "./deal-card";
import type { Deal } from "@/types/api";
import type { DealStage } from "@/types/enums";

const STAGES: DealStage[] = [
  "Lead",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];

export function DealsBoard() {
  const tStage = useTranslations("enums.dealStage");
  const { data: deals, isLoading } = useGetDealsQuery();
  const { data: contactsPage } = useGetContactsQuery({ limit: 200 });
  const { data: users } = useGetUsersQuery();
  const [updateStage] = useUpdateDealStageMutation();
  const canMutate = useCanMutate();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const [search, setSearch] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [activeDealId, setActiveDealId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [createStage, setCreateStage] = useState<DealStage | undefined>();
  const [deletingDeal, setDeletingDeal] = useState<Deal | null>(null);

  // Local order state — mirrors server data, allows optimistic reordering
  const [localOrder, setLocalOrder] = useState<Map<DealStage, string[]>>(new Map());
  const serverDealsRef = useRef<Deal[] | undefined>(undefined);

  // Sync local order when server data changes (but not during a drag)
  useEffect(() => {
    if (!deals || activeDealId) return;
    if (deals === serverDealsRef.current) return;
    serverDealsRef.current = deals;
    const map = new Map<DealStage, string[]>();
    for (const stage of STAGES) map.set(stage, []);
    for (const d of deals) map.get(d.stage)?.push(d.id);
    setLocalOrder(map);
  }, [deals, activeDealId]);

  const contactNameById = useMemo(() => {
    const map = new Map<string, string>();
    contactsPage?.data.forEach((c) =>
      map.set(c.id, [c.firstName, c.lastName].filter(Boolean).join(" "))
    );
    return map;
  }, [contactsPage]);

  const ownerNameById = useMemo(() => {
    const map = new Map<string, string>();
    users?.forEach((u) => map.set(u.id, u.name));
    return map;
  }, [users]);

  // Build per-stage ordered deal lists using localOrder
  const dealsByStage = useMemo(() => {
    const allDeals = deals ?? [];
    const byId = new Map<string, Deal>(allDeals.map((d) => [d.id, d]));

    // Apply search/owner filters
    const passesFilter = (d: Deal) => {
      if (ownerId && d.ownerId !== ownerId) return false;
      const q = search.trim().toLowerCase();
      if (q) {
        return (
          d.title.toLowerCase().includes(q) ||
          (contactNameById.get(d.contactId) ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    };

    const map = new Map<DealStage, Deal[]>();
    for (const stage of STAGES) {
      const ids = localOrder.get(stage) ?? [];
      map.set(
        stage,
        ids.map((id) => byId.get(id)).filter((d): d is Deal => !!d && passesFilter(d))
      );
    }
    return map;
  }, [deals, localOrder, ownerId, search, contactNameById]);

  const autoScroll = useDragAutoScroll();

  const getDealStage = (id: string): DealStage | null => {
    for (const [stage, ids] of localOrder) {
      if (ids.includes(id)) return stage;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDealId(event.active.id as string);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    autoScroll.onDragMove({
      activatorEvent: event.activatorEvent,
      delta: event.delta,
    });
  };

  // Live reorder as user drags over cards/columns
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeStage = getDealStage(activeId);
    // over could be a column (stage string) or a card (deal id)
    const overStage = STAGES.includes(overId as DealStage)
      ? (overId as DealStage)
      : getDealStage(overId);

    if (!activeStage || !overStage) return;

    setLocalOrder((prev) => {
      const next = new Map(prev);
      const sourceIds = [...(next.get(activeStage) ?? [])];
      const destIds =
        activeStage === overStage ? sourceIds : [...(next.get(overStage) ?? [])];

      const activeIdx = sourceIds.indexOf(activeId);
      if (activeIdx === -1) return prev;

      if (activeStage === overStage) {
        // Same column: reorder
        const overIdx = destIds.indexOf(overId);
        if (overIdx === -1) return prev;
        next.set(activeStage, arrayMove(sourceIds, activeIdx, overIdx));
      } else {
        // Different column: move to target position
        sourceIds.splice(activeIdx, 1);
        const overIdx = destIds.indexOf(overId);
        // If over a card, insert before it; if over empty column, append
        const insertAt = overIdx === -1 ? destIds.length : overIdx;
        destIds.splice(insertAt, 0, activeId);
        next.set(activeStage, sourceIds);
        next.set(overStage, destIds);
      }

      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event;
    const activeId = active.id as string;

    autoScroll.onDragEnd();
    setActiveDealId(null);

    if (!canMutate) return;

    const deal = deals?.find((d) => d.id === activeId);
    if (!deal) return;

    // Determine final stage from local order (already updated in onDragOver)
    const finalStage = getDealStage(activeId);
    if (!finalStage) return;

    if (deal.stage !== finalStage) {
      updateStage({ id: activeId, stage: finalStage });
    }
  };

  const handleDragCancel = () => {
    setActiveDealId(null);
    autoScroll.onDragCancel();
    // Reset local order back to server data
    if (deals) {
      const map = new Map<DealStage, string[]>();
      for (const stage of STAGES) map.set(stage, []);
      for (const d of deals) map.get(d.stage)?.push(d.id);
      setLocalOrder(map);
    }
  };

  const activeDeal = activeDealId ? deals?.find((d) => d.id === activeDealId) : null;

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col space-y-4">
      <DealsFilters
        search={search}
        onSearchChange={setSearch}
        ownerId={ownerId}
        onOwnerIdChange={setOwnerId}
        onCreate={() => {
          setEditingDeal(null);
          setCreateStage(undefined);
          setSheetOpen(true);
        }}
      />

      {isLoading ? (
        <div className="flex gap-4">
          {STAGES.map((stage) => (
            <Skeleton key={stage} className="h-96 w-72 shrink-0" />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="no-scrollbar flex flex-1 gap-3 overflow-x-auto pb-2">
            {STAGES.map((stage) => (
              <DealColumn
                key={stage}
                stage={stage}
                label={tStage(stage)}
                deals={dealsByStage.get(stage) ?? []}
                contactNameById={contactNameById}
                ownerNameById={ownerNameById}
                activeDealId={activeDealId}
                onCardClick={(deal) => {
                  setEditingDeal(deal);
                  setCreateStage(undefined);
                  setSheetOpen(true);
                }}
                onQuickAdd={(stage) => {
                  setEditingDeal(null);
                  setCreateStage(stage);
                  setSheetOpen(true);
                }}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
            {activeDeal ? (
              <DealCard
                deal={activeDeal}
                contactName={contactNameById.get(activeDeal.contactId) ?? null}
                ownerName={activeDeal.ownerId ? (ownerNameById.get(activeDeal.ownerId) ?? null) : null}
                onClick={() => {}}
                overlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <DealFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        deal={editingDeal}
        defaultStage={createStage}
        contacts={contactsPage?.data ?? []}
        onDelete={
          editingDeal
            ? () => {
                setDeletingDeal(editingDeal);
                setSheetOpen(false);
              }
            : undefined
        }
      />

      <DeleteDealDialog
        deal={deletingDeal}
        onOpenChange={(open) => !open && setDeletingDeal(null)}
      />
    </div>
  );
}
