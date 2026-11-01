"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDisconnectInstagramAccountMutation } from "@/lib/api/instagram.api";
import type { InstagramAccount } from "@/types/api";

export function DisconnectInstagramDialog({
  account,
  onOpenChange,
}: {
  account: InstagramAccount | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("pages.instagram.disconnectDialog");
  const [disconnect, { isLoading }] = useDisconnectInstagramAccountMutation();

  const handleConfirm = async () => {
    if (!account) return;
    try {
      // 404 (already disconnected) is handled in the endpoint: the list
      // refetches either way.
      await disconnect(account.id).unwrap();
      toast.success(t("success"));
    } catch (err) {
      if ((err as { status?: number })?.status !== 404) return; // generic toast already shown
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={!!account} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title", { username: account?.username ?? "" })}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{t("cancel")}</DialogClose>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
