"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useCreateSupplierMutation, useUpdateSupplierMutation } from "@/lib/api/suppliers.api";
import type { Supplier } from "@/types/api";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function SupplierFormSheet({
  open,
  onOpenChange,
  supplier,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
}) {
  const t = useTranslations("pages.inventory.suppliers.form");
  const isEdit = !!supplier;

  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();
  const isSubmitting = isCreating || isUpdating;

  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName(supplier?.name ?? "");
      setContactName(supplier?.contactName ?? "");
      setEmail(supplier?.email ?? "");
      setPhone(supplier?.phone ?? "");
      setAddress(supplier?.address ?? "");
      setNotes(supplier?.notes ?? "");
      setIsActive(supplier?.isActive ?? true);
    }
  }

  const canSubmit = name.trim().length >= 1;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const body = {
      name: name.trim(),
      contactName: contactName.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
      isActive,
    };
    try {
      if (isEdit && supplier) {
        await updateSupplier({ id: supplier.id, body }).unwrap();
      } else {
        await createSupplier(body).unwrap();
      }
      onOpenChange(false);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEdit ? t("editTitle") : t("createTitle")}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <div className="space-y-1.5">
            <label htmlFor="supplier-name" className="text-xs font-medium text-text-tertiary uppercase">
              {t("name")}
            </label>
            <input id="supplier-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="supplier-contact" className="text-xs font-medium text-text-tertiary uppercase">
              {t("contactName")}
            </label>
            <input
              id="supplier-contact"
              className={inputClass}
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="supplier-email" className="text-xs font-medium text-text-tertiary uppercase">
                {t("email")}
              </label>
              <input
                id="supplier-email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="supplier-phone" className="text-xs font-medium text-text-tertiary uppercase">
                {t("phone")}
              </label>
              <input
                id="supplier-phone"
                className={inputClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="supplier-address" className="text-xs font-medium text-text-tertiary uppercase">
              {t("address")}
            </label>
            <input
              id="supplier-address"
              className={inputClass}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="supplier-notes" className="text-xs font-medium text-text-tertiary uppercase">
              {t("notes")}
            </label>
            <textarea
              id="supplier-notes"
              className={inputClass}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <Checkbox checked={isActive} onCheckedChange={(checked) => setIsActive(checked === true)} />
            {t("isActive")}
          </label>
        </div>

        <SheetFooter>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting || !canSubmit}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? t("save") : t("create")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
