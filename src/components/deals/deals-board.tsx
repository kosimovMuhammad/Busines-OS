"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useGetDealsQuery, useUpdateDealStageMutation } from "@/lib/api/deals.api";
import { useGetContactsQuery } from "@/lib/api/contacts.api";
import { useGetUsersQuery } from "@/lib/api/users.api";
import { Skeleton } from "@/components/ui/skeleton";
import { DealColumn } from "./deal-column";
import { DealsFilters } from "./deals-filters";
import { DealFormSheet } from "./deal-form-sheet";
import { DeleteDealDialog } from "./delete-deal-dialog";
import type { Deal } from "@/types/api";
import type { DealStage } from "@/types/enums";

const STAGES: DealStage[] = [
  "LEAD",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
];

export function DealsBoard() {
  const tStage = useTranslations("enums.dealStage");
  const { data: deals, isLoading } = useGetDealsQuery();
  const { data: contactsPage } = useGetContactsQuery({ limit: 200 });
  const { data: users } = useGetUsersQuery();
  const [updateStage] = useUpdateDealStageMutation();

  const [search, setSearch] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deletingDeal, setDeletingDeal] = useState<Deal | null>(null);

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

  const filteredDeals = useMemo(() => {
    let list = deals ?? [];
    if (ownerId) list = list.filter((d) => d.ownerId === ownerId);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          (contactNameById.get(d.contactId) ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [deals, ownerId, search, contactNameById]);

  const dealsByStage = useMemo(() => {
    const map = new Map<DealStage, Deal[]>();
    for (const stage of STAGES) map.set(stage, []);
    for (const deal of filteredDeals) map.get(deal.stage)?.push(deal);
    return map;
  }, [filteredDeals]);

  const handleDragEnd = (event: DragEndEvent) => {
    const dealId = event.active.id as string;
    const newStage = event.over?.id as DealStage | undefined;
    if (!newStage || !STAGES.includes(newStage)) return;
    const deal = deals?.find((d) => d.id === dealId);
    if (!deal || deal.stage === newStage) return;
    updateStage({ id: dealId, stage: newStage });
  };

  return (
    <div className="space-y-4">
      <DealsFilters
        search={search}
        onSearchChange={setSearch}
        ownerId={ownerId}
        onOwnerIdChange={setOwnerId}
        onCreate={() => {
          setEditingDeal(null);
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
        <DndContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGES.map((stage) => (
              <DealColumn
                key={stage}
                stage={stage}
                label={tStage(stage)}
                deals={dealsByStage.get(stage) ?? []}
                contactNameById={contactNameById}
                ownerNameById={ownerNameById}
                onCardClick={(deal) => {
                  setEditingDeal(deal);
                  setSheetOpen(true);
                }}
              />
            ))}
          </div>
        </DndContext>
      )}

      <DealFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        deal={editingDeal}
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
