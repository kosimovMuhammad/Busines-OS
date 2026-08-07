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
import { useCreateBranchMutation, useUpdateBranchMutation } from "@/lib/api/branches.api";
import type { Branch } from "@/types/api";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function BranchFormSheet({
  open,
  onOpenChange,
  branch,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: Branch | null;
}) {
  const t = useTranslations("pages.settingsOrganization.branches.form");
  const isEdit = !!branch;

  const [createBranch, { isLoading: isCreating }] = useCreateBranchMutation();
  const [updateBranch, { isLoading: isUpdating }] = useUpdateBranchMutation();
  const isSubmitting = isCreating || isUpdating;

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [isHeadquarters, setIsHeadquarters] = useState(false);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName(branch?.name ?? "");
      setAddress(branch?.address ?? "");
      setCity(branch?.city ?? "");
      setCountry(branch?.country ?? "");
      setTimezone(branch?.timezone ?? "");
      setIsHeadquarters(branch?.isHeadquarters ?? false);
    }
  }

  const canSubmit = name.trim().length >= 2;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const body = {
      name: name.trim(),
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      country: country.trim() || undefined,
      timezone: timezone.trim() || undefined,
      isHeadquarters,
    };
    try {
      if (isEdit && branch) {
        await updateBranch({ id: branch.id, body }).unwrap();
      } else {
        await createBranch(body).unwrap();
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

        <div className="flex flex-col gap-4 px-4">
          <div className="space-y-1.5">
            <label htmlFor="branch-name" className="text-xs font-medium text-text-tertiary uppercase">
              {t("name")}
            </label>
            <input id="branch-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="branch-address" className="text-xs font-medium text-text-tertiary uppercase">
              {t("address")}
            </label>
            <input id="branch-address" className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="branch-city" className="text-xs font-medium text-text-tertiary uppercase">
                {t("city")}
              </label>
              <input id="branch-city" className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="branch-country" className="text-xs font-medium text-text-tertiary uppercase">
                {t("country")}
              </label>
              <input id="branch-country" className={inputClass} value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="branch-timezone" className="text-xs font-medium text-text-tertiary uppercase">
              {t("timezone")}
            </label>
            <input
              id="branch-timezone"
              className={inputClass}
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="Asia/Dushanbe"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <Checkbox
              checked={isHeadquarters}
              onCheckedChange={(checked) => setIsHeadquarters(checked === true)}
            />
            {t("isHeadquarters")}
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
