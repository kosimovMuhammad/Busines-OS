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
import { useRemoveContactMutation } from "@/lib/api/contacts.api";
import type { Contact } from "@/types/api";

export function DeleteContactDialog({
  contact,
  onOpenChange,
  onDeleted,
}: {
  contact: Contact | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}) {
  const t = useTranslations("pages.contacts.deleteDialog");
  const tAction = useTranslations("pages.contacts");
  const [removeContact, { isLoading }] = useRemoveContactMutation();

  const fullName = contact
    ? [contact.firstName, contact.lastName].filter(Boolean).join(" ")
    : "";

  const handleConfirm = async () => {
    if (!contact) return;
    try {
      await removeContact(contact.id).unwrap();
      onOpenChange(false);
      onDeleted?.();
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Dialog open={!!contact} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description", { name: fullName })}</DialogDescription>
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
