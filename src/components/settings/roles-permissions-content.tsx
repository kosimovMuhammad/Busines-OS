"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Pencil, Plus, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { RequireRole } from "@/components/shared/require-role";
import { cn } from "@/lib/utils";
import {
  useAttachPermissionMutation,
  useDetachPermissionMutation,
  useGetRolesQuery,
  useRemoveRoleMutation,
} from "@/lib/api/roles.api";
import { useGetPermissionsQuery } from "@/lib/api/permissions.api";
import { RoleFormSheet } from "./role-form-sheet";
import type { RbacRole } from "@/types/api";

function RolesPermissionsInner() {
  const t = useTranslations("pages.settingsRoles");
  const { data: roles, isLoading: rolesLoading } = useGetRolesQuery();
  const { data: permissions, isLoading: permissionsLoading } = useGetPermissionsQuery();
  const [removeRole, { isLoading: isRemoving }] = useRemoveRoleMutation();
  const [attachPermission] = useAttachPermissionMutation();
  const [detachPermission] = useDetachPermissionMutation();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RbacRole | null>(null);
  const [deletingRole, setDeletingRole] = useState<RbacRole | null>(null);

  const selectedRole = roles?.find((r) => r.id === selectedId) ?? roles?.[0] ?? null;

  const grouped = useMemo(() => {
    const map = new Map<string, typeof permissions>();
    for (const p of permissions ?? []) {
      const list = map.get(p.module) ?? [];
      list.push(p);
      map.set(p.module, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [permissions]);

  const rolePermissionIds = useMemo(
    () => new Set((selectedRole?.permissions ?? []).map((p) => p.id)),
    [selectedRole]
  );

  const togglePermission = (permissionId: string, checked: boolean) => {
    if (!selectedRole || selectedRole.isSystemRole) return;
    if (checked) {
      attachPermission({ roleId: selectedRole.id, body: { permissionId } });
    } else {
      detachPermission({ roleId: selectedRole.id, permissionId });
    }
  };

  const handleDelete = async () => {
    if (!deletingRole) return;
    try {
      await removeRole(deletingRole.id).unwrap();
      if (selectedId === deletingRole.id) setSelectedId(null);
      setDeletingRole(null);
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  const isLoading = rolesLoading || permissionsLoading;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => {
            setEditingRole(null);
            setSheetOpen(true);
          }}
        >
          <Plus className="size-3.5" />
          {t("createRole")}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : !roles || roles.length === 0 ? (
        <EmptyState
          icon={Shield}
          title={t("empty")}
          action={
            <Button type="button" size="sm" onClick={() => setSheetOpen(true)}>
              <Plus className="size-3.5" />
              {t("createRole")}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
          <div className="space-y-1 rounded-2xl border border-border-subtle bg-surface p-2">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedId(role.id)}
                className={cn(
                  "flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-2.5 text-left transition-colors",
                  (selectedRole?.id ?? roles[0]?.id) === role.id
                    ? "bg-surface-elevated text-text-primary"
                    : "text-text-secondary hover:bg-surface-elevated/60 hover:text-text-primary"
                )}
              >
                <span className="flex w-full items-center justify-between gap-2 text-sm font-medium">
                  {role.name}
                  {role.isSystemRole && (
                    <Badge variant="outline" className="shrink-0">
                      {t("systemBadge")}
                    </Badge>
                  )}
                </span>
                <span className="text-xs text-text-tertiary">
                  {t("permissionCount", { count: role.permissions.length })}
                </span>
              </button>
            ))}
          </div>

          {selectedRole && (
            <div className="space-y-4 rounded-2xl border border-border-subtle bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-text-primary">
                      {selectedRole.name}
                    </h3>
                    {selectedRole.isSystemRole && (
                      <Badge variant="outline">{t("systemBadge")}</Badge>
                    )}
                  </div>
                  {selectedRole.description && (
                    <p className="mt-1 text-sm text-text-secondary">
                      {selectedRole.description}
                    </p>
                  )}
                </div>

                {!selectedRole.isSystemRole && (
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingRole(selectedRole);
                        setSheetOpen(true);
                      }}
                    >
                      <Pencil className="size-3.5" />
                      {t("edit")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeletingRole(selectedRole)}
                    >
                      <Trash2 className="size-3.5" />
                      {t("delete")}
                    </Button>
                  </div>
                )}
              </div>

              {selectedRole.isSystemRole && (
                <p className="text-xs text-text-tertiary">{t("systemRoleHint")}</p>
              )}

              <div className="space-y-5">
                {grouped.map(([module, modulePermissions]) => (
                  <div key={module} className="space-y-2">
                    <p className="text-xs font-semibold tracking-wide text-text-tertiary uppercase">
                      {module}
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {modulePermissions?.map((permission) => (
                        <label
                          key={permission.id}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border border-border-subtle px-3 py-2 text-sm text-text-secondary",
                            !selectedRole.isSystemRole && "cursor-pointer hover:bg-surface-elevated"
                          )}
                        >
                          <Checkbox
                            checked={rolePermissionIds.has(permission.id)}
                            disabled={selectedRole.isSystemRole}
                            onCheckedChange={(checked) =>
                              togglePermission(permission.id, checked === true)
                            }
                          />
                          {permission.description}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <RoleFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        role={editingRole}
        onCreated={(role) => setSelectedId(role.id)}
      />

      <Dialog open={!!deletingRole} onOpenChange={(open) => !open && setDeletingRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("deleteDialog.description", { name: deletingRole?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {t("deleteDialog.cancel")}
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={isRemoving}>
              {isRemoving && <Loader2 className="size-4 animate-spin" />}
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function RolesPermissionsContent() {
  return (
    <RequireRole roles={["Owner", "Admin"]}>
      <RolesPermissionsInner />
    </RequireRole>
  );
}
