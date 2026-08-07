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
import { useRemovePurchaseOrderMutation } from "@/lib/api/purchaseOrders.api";
import type { PurchaseOrderSummary } from "@/types/api";

export function DeletePurchaseOrderDialog({
  purchaseOrder,
  onOpenChange,
}: {
  purchaseOrder: PurchaseOrderSummary | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("pages.inventory.purchaseOrders");
  const [removePurchaseOrder, { isLoading }] = useRemovePurchaseOrderMutation();

  const handleConfirm = async () => {
    if (!purchaseOrder) return;
    try {
      await removePurchaseOrder(purchaseOrder.id).unwrap();
      onOpenChange(false);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Dialog open={!!purchaseOrder} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("deleteDialog.description", { number: purchaseOrder?.orderNumber ?? "" })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            {t("deleteDialog.cancel")}
          </DialogClose>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {t("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
