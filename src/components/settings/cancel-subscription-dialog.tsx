"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useCancelSubscriptionMutation } from "@/lib/api/subscription.api";

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("pages.settingsPlan.cancelDialog");
  const [immediate, setImmediate] = useState(false);
  const [cancelSubscription, { isLoading }] = useCancelSubscriptionMutation();

  const handleConfirm = async () => {
    try {
      await cancelSubscription({ immediate }).unwrap();
      onOpenChange(false);
      setImmediate(false);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <Checkbox checked={immediate} onCheckedChange={(checked) => setImmediate(checked === true)} />
          {t("immediate")}
        </label>

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
