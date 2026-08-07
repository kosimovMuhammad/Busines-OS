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
import { useRemoveSupplierMutation } from "@/lib/api/suppliers.api";
import type { Supplier } from "@/types/api";

export function DeleteSupplierDialog({
  supplier,
  onOpenChange,
}: {
  supplier: Supplier | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("pages.inventory.suppliers");
  const [removeSupplier, { isLoading }] = useRemoveSupplierMutation();

  const handleConfirm = async () => {
    if (!supplier) return;
    try {
      await removeSupplier(supplier.id).unwrap();
      onOpenChange(false);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Dialog open={!!supplier} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("deleteDialog.description", { name: supplier?.name ?? "" })}
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
