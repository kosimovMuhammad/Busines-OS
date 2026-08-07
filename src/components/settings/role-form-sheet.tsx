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
import { Button } from "@/components/ui/button";
import { useCreateRoleMutation, useUpdateRoleMutation } from "@/lib/api/roles.api";
import type { RbacRole } from "@/types/api";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function RoleFormSheet({
  open,
  onOpenChange,
  role,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RbacRole | null;
  onCreated?: (role: RbacRole) => void;
}) {
  const t = useTranslations("pages.settingsRoles.form");
  const isEdit = !!role;

  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const isSubmitting = isCreating || isUpdating;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName(role?.name ?? "");
      setDescription(role?.description ?? "");
    }
  }

  const canSubmit = name.trim().length >= 2;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      if (isEdit && role) {
        await updateRole({
          id: role.id,
          body: { name: name.trim(), description: description.trim() || undefined },
        }).unwrap();
      } else {
        const created = await createRole({
          name: name.trim(),
          description: description.trim() || undefined,
        }).unwrap();
        onCreated?.(created);
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
            <label htmlFor="role-name" className="text-xs font-medium text-text-tertiary uppercase">
              {t("name")}
            </label>
            <input
              id="role-name"
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="role-description" className="text-xs font-medium text-text-tertiary uppercase">
              {t("description")}
            </label>
            <textarea
              id="role-description"
              className={`${inputClass} min-h-20 resize-none`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
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
