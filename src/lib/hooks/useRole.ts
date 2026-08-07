import { useAppSelector } from "@/store/hooks";
import { useGetUserPermissionsQuery } from "@/lib/api/users.api";
import type { UserRole } from "@/types/enums";

export function useRole() {
  const role = useAppSelector((s) => s.auth.user?.role) ?? null;
  const userId = useAppSelector((s) => s.auth.user?.id) ?? null;

  // Backend resolves the effective permission set for the current user -
  // from their custom rbacRoleId when set, or the enum role otherwise -
  // so this single query is the source of truth for hasPermission().
  const { data: permissions } = useGetUserPermissionsQuery(userId ?? "", {
    skip: !userId,
  });

  const hasRole = (allowed: UserRole[]) => !!role && allowed.includes(role);

  // Falls back to the enum-based role matrix (via hasRole) while the live
  // permission set hasn't loaded yet, so gates still work on first paint.
  const hasPermission = (key: string, fallbackRoles: UserRole[] = ["Owner", "Admin"]) => {
    if (permissions) return permissions.permissionKeys.includes(key);
    return hasRole(fallbackRoles);
  };

  return {
    role,
    hasRole,
    hasPermission,
    permissionKeys: permissions?.permissionKeys ?? [],
  };
}
