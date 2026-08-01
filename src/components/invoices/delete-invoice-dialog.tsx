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
import { useRemoveInvoiceMutation } from "@/lib/api/invoices.api";
import type { Invoice } from "@/types/api";

export function DeleteInvoiceDialog({
  invoice,
  onOpenChange,
  onDeleted,
}: {
  invoice: Invoice | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}) {
  const t = useTranslations("pages.invoices.deleteDialog");
  const tAction = useTranslations("pages.invoices");
  const [removeInvoice, { isLoading }] = useRemoveInvoiceMutation();

  const handleConfirm = async () => {
    if (!invoice) return;
    try {
      await removeInvoice(invoice.id).unwrap();
      onOpenChange(false);
      onDeleted?.();
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Dialog open={!!invoice} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", { number: invoice?.invoiceNumber ?? "" })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{t("cancel")}</DialogClose>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {tAction("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
