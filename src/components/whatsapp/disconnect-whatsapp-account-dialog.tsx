"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
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
import { useDeleteWhatsappAccountMutation } from "@/lib/api/whatsapp.api";
import type { WhatsappAccount } from "@/types/api";

export function DisconnectWhatsappAccountDialog({
  account,
  onOpenChange,
}: {
  account: WhatsappAccount | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("pages.whatsapp.disconnectDialog");
  const [deleteAccount, { isLoading }] = useDeleteWhatsappAccountMutation();

  const handleConfirm = async () => {
    if (!account) return;
    try {
      await deleteAccount(account.id).unwrap();
      toast.success(t("success"));
      onOpenChange(false);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Dialog open={!!account} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", { name: account?.verifiedName ?? account?.phoneNumberId ?? "" })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            {t("cancel")}
          </DialogClose>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
