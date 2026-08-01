"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { UserPlus, Users as UsersIcon, UserX } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useRole } from "@/lib/hooks/useRole";
import { useAppSelector } from "@/store/hooks";
import {
  useGetUsersQuery,
  useRemoveUserMutation,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
} from "@/lib/api/users.api";
import { InviteUserSheet } from "./invite-user-sheet";
import type { UserRole } from "@/types/enums";

const ROLES: UserRole[] = [
  "OWNER",
  "ADMIN",
  "MANAGER",
  "SALES",
  "SUPPORT",
  "EMPLOYEE",
  "READ_ONLY",
];

export function TeamContent() {
  const t = useTranslations("pages.settingsTeam");
  const tRole = useTranslations("enums.userRole");
  const tStatus = useTranslations("enums.userStatus");
  const { hasRole } = useRole();
  const canManage = hasRole(["OWNER", "ADMIN"]);
  const currentUserId = useAppSelector((s) => s.auth.user?.id);

  const { data: users, isLoading } = useGetUsersQuery();
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [updateUser] = useUpdateUserMutation();
  const [removeUser] = useRemoveUserMutation();

  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <Button type="button" onClick={() => setSheetOpen(true)}>
            <UserPlus className="size-3.5" />
            {t("invite")}
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !users || users.length === 0 ? (
        <EmptyState icon={UsersIcon} title={t("empty")} />
      ) : (
        <div className="rounded-2xl border border-border-subtle bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead>{t("columnUser")}</TableHead>
                <TableHead>{t("columnRole")}</TableHead>
                <TableHead>{t("columnStatus")}</TableHead>
                <TableHead className="w-16 text-right">{t("columnActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const isSelf = u.id === currentUserId;
                const suspended = u.status === "SUSPENDED";
                return (
                  <TableRow key={u.id} className="border-border-subtle">
                    <TableCell>
                      <p className="text-sm font-medium text-text-primary">{u.name}</p>
                      <p className="text-xs text-text-tertiary">{u.email}</p>
                    </TableCell>
                    <TableCell>
                      {canManage && !isSelf ? (
                        <Select
                          value={u.role}
                          onValueChange={(value) =>
                            updateUserRole({ id: u.id, body: { role: value as UserRole } })
                          }
                        >
                          <SelectTrigger className="h-8 w-36">
                            <SelectValue>
                              {(value: string) => tRole(value as UserRole)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r} value={r}>
                                {tRole(r)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm text-text-secondary">{tRole(u.role)}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-text-secondary">{tStatus(u.status)}</TableCell>
                    <TableCell>
                      {canManage && !isSelf && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateUser({
                                id: u.id,
                                body: { status: suspended ? "ACTIVE" : "SUSPENDED" },
                              })
                            }
                          >
                            {suspended ? t("activate") : t("suspend")}
                          </Button>
                          <button
                            type="button"
                            onClick={() => removeUser(u.id)}
                            className="flex size-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
                            aria-label={t("remove")}
                          >
                            <UserX className="size-3.5" />
                          </button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <InviteUserSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
