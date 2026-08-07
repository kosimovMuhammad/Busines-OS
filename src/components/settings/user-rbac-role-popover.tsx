"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Shield } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetUserPermissionsQuery, useUpdateUserRoleMutation } from "@/lib/api/users.api";
import type { RbacRole, User } from "@/types/api";

const NONE = "__none__";

export function UserRbacRolePopover({ user, customRoles }: { user: User; customRoles: RbacRole[] }) {
  const t = useTranslations("pages.settingsTeam");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const { data: permissions, isLoading } = useGetUserPermissionsQuery(user.id, { skip: !open });
  const [updateUserRole, { isLoading: isSaving }] = useUpdateUserRoleMutation();

  const current = selected ?? (customRoles.some((r) => r.id === permissions?.roleId) ? permissions?.roleId ?? "" : "");

  const handleSave = async () => {
    try {
      await updateUserRole({
        id: user.id,
        body: { role: user.role, rbacRoleId: current || null },
      }).unwrap();
      setOpen(false);
      setSelected(null);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Popover open={open} onOpenChange={(next) => { setOpen(next); if (!next) setSelected(null); }}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary"
            aria-label={t("rbacRole")}
          />
        }
      >
        <Shield className="size-3.5" />
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-xs font-medium text-text-tertiary uppercase">{t("rbacRole")}</p>
        {isLoading ? (
          <Skeleton className="h-8 w-full" />
        ) : (
          <>
            <p className="text-xs text-text-tertiary">
              {t("rbacRoleCurrent", { name: permissions?.roleName ?? "—" })}
            </p>
            <Select value={current || NONE} onValueChange={(value) => setSelected(value === NONE ? "" : (value ?? ""))}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) =>
                    value === NONE || !value
                      ? t("inviteSheet.rbacRoleNone")
                      : (customRoles.find((r) => r.id === value)?.name ?? t("inviteSheet.rbacRoleNone"))
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{t("inviteSheet.rbacRoleNone")}</SelectItem>
                {customRoles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" size="sm" className="w-full" onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="size-3.5 animate-spin" />}
              {t("rbacRoleSave")}
            </Button>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
