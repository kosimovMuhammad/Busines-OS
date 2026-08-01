"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRemoveDealMutation } from "@/lib/api/deals.api";
import type { Deal } from "@/types/api";

export function DeleteDealDialog({
  deal,
  onOpenChange,
}: {
  deal: Deal | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("pages.deals.deleteDialog");
  const tAction = useTranslations("pages.deals.form");
  const [removeDeal, { isLoading }] = useRemoveDealMutation();

  const handleConfirm = async () => {
    if (!deal) return;
    try {
      await removeDeal(deal.id).unwrap();
      onOpenChange(false);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Dialog open={!!deal} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", { title: deal?.title ?? "" })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            {t("cancel")}
          </DialogClose>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {tAction("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
