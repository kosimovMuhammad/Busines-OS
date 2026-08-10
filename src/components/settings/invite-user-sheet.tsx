"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, MailCheck } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useInviteUserMutation } from "@/lib/api/users.api";
import { useGetRolesQuery } from "@/lib/api/roles.api";
import { useRole } from "@/lib/hooks/useRole";
import type { UserRole } from "@/types/enums";

const ROLES: UserRole[] = [
  "Admin",
  "Manager",
  "Sales",
  "Support",
  "Employee",
  "ReadOnly",
];

const NONE = "__none__";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:ring-2 focus:ring-border-glow focus:outline-none";

export function InviteUserSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("pages.settingsTeam.inviteSheet");
  const tRole = useTranslations("enums.userRole");
  const [inviteUser, { isLoading }] = useInviteUserMutation();
  // Defense in depth: team-content.tsx already gates the trigger that opens
  // this sheet to Owner/Admin (canManage), but that gate lives on the
  // caller, not here - if this sheet were ever opened from another entry
  // point it would otherwise submit ungated.
  const { hasRole } = useRole();
  const canInvite = hasRole(["Owner", "Admin"]);
  const { data: roles } = useGetRolesQuery();
  const customRoles = (roles ?? []).filter((r) => !r.isSystemRole);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Employee");
  const [rbacRoleId, setRbacRoleId] = useState("");
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName("");
      setEmail("");
      setRole("Employee");
      setRbacRoleId("");
      setInvitedEmail(null);
    }
  }

  const selectedCustomRole = customRoles.find((r) => r.id === rbacRoleId);
  const canSubmit = name.trim().length >= 2 && email.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await inviteUser({
        name: name.trim(),
        email: email.trim(),
        role,
        rbacRoleId: rbacRoleId || undefined,
      }).unwrap();
      setInvitedEmail(email.trim());
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
        </SheetHeader>

        {invitedEmail ? (
          <>
            <div className="flex flex-col items-center gap-3 px-4 py-6 text-center">
              <MailCheck className="size-8 text-accent-secondary" />
              <p className="text-sm text-text-primary">
                {t("inviteSentTitle", { email: invitedEmail })}
              </p>
              <p className="text-xs text-text-tertiary">{t("inviteSentHint")}</p>
            </div>

            <SheetFooter>
              <Button type="button" onClick={() => onOpenChange(false)}>
                {t("done")}
              </Button>
            </SheetFooter>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-4 px-4">
              <div className="space-y-1.5">
                <label htmlFor="invite-name" className="text-xs font-medium text-text-tertiary uppercase">
                  {t("name")}
                </label>
                <input id="invite-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="invite-email" className="text-xs font-medium text-text-tertiary uppercase">
                  {t("email")}
                </label>
                <input
                  id="invite-email"
                  className={inputClass}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="invite-role" className="text-xs font-medium text-text-tertiary uppercase">
                  {t("role")}
                </label>
                <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                  <SelectTrigger id="invite-role" className="w-full">
                    <SelectValue>{(value: string) => tRole(value as UserRole)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {tRole(r)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {customRoles.length > 0 && (
                <div className="space-y-1.5">
                  <label htmlFor="invite-rbac-role" className="text-xs font-medium text-text-tertiary uppercase">
                    {t("rbacRole")}
                  </label>
                  <Select
                    value={rbacRoleId || NONE}
                    onValueChange={(value) => setRbacRoleId(value === NONE ? "" : (value ?? ""))}
                  >
                    <SelectTrigger id="invite-rbac-role" className="w-full">
                      <SelectValue>
                        {(value: string) =>
                          value === NONE || !value
                            ? t("rbacRoleNone")
                            : (customRoles.find((r) => r.id === value)?.name ?? t("rbacRoleNone"))
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>{t("rbacRoleNone")}</SelectItem>
                      {customRoles.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCustomRole && (
                    <p className="text-xs text-text-tertiary">
                      {t("rbacRoleSummary", { count: selectedCustomRole.permissions.length })}
                    </p>
                  )}
                </div>
              )}
            </div>

            <SheetFooter>
              <Button type="button" onClick={handleSubmit} disabled={isLoading || !canSubmit || !canInvite}>
                {isLoading && <Loader2 className="size-4 animate-spin" />}
                {t("invite")}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
