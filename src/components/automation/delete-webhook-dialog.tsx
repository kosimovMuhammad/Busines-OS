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
import { useRemoveWebhookMutation } from "@/lib/api/webhooks.api";
import type { Webhook } from "@/types/api";

export function DeleteWebhookDialog({
  webhook,
  onOpenChange,
}: {
  webhook: Webhook | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("pages.automation.webhooks");
  const [removeWebhook, { isLoading }] = useRemoveWebhookMutation();

  const handleConfirm = async () => {
    if (!webhook) return;
    try {
      await removeWebhook(webhook.id).unwrap();
      onOpenChange(false);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Dialog open={!!webhook} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("deleteDialog.description", { url: webhook?.url ?? "" })}
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
