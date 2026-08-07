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
import { useRemoveContractMutation } from "@/lib/api/contracts.api";
import type { Contract } from "@/types/api";

export function DeleteContractDialog({
  contract,
  onOpenChange,
  onDeleted,
}: {
  contract: Contract | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}) {
  const t = useTranslations("pages.contracts.deleteDialog");
  const tAction = useTranslations("pages.contracts");
  const [removeContract, { isLoading }] = useRemoveContractMutation();

  const handleConfirm = async () => {
    if (!contract) return;
    try {
      await removeContract(contract.id).unwrap();
      onOpenChange(false);
      onDeleted?.();
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Dialog open={!!contract} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description", { title: contract?.title ?? "" })}</DialogDescription>
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
