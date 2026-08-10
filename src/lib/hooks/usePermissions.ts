import { useRole } from "./useRole";
import { MUTATION_ALLOWED_ROLES, type Role } from "@/lib/permissions/constants";

// Thin, ergonomic wrapper over useRole() matching the { permissions, role,
// hasPermission, hasAnyPermission, hasAllPermissions } shape for call sites
// that want imperative checks (e.g. disabling a button) rather than the
// render-or-fallback guard components in src/components/guards/.
// Deliberately built on useRole rather than a second implementation, so
// there's exactly one place (useRole) that knows about the loading-fallback
// nuance around permissions not having loaded yet on first paint.
export function usePermissions() {
  const { role, hasRole, hasPermission, permissionKeys } = useRole();

  return {
    role,
    permissions: permissionKeys,
    hasRole,
    hasPermission: (permission: string) => hasPermission(permission),
    hasAnyPermission: (permissions: string[]) => permissions.some((p) => hasPermission(p)),
    hasAllPermissions: (permissions: string[]) => permissions.every((p) => hasPermission(p)),
  };
}

export function usePermission(permission: string): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
}

// For imperative gating that PermissionGuard (render-or-nothing) can't
// express cleanly - disabling a drag handle, greying out an inline-edit
// input, no-op'ing a Kanban onDragEnd. Defaults to "can mutate anything
// except ReadOnly"; pass a narrower roles list for a module with its own
// carve-out (e.g. INVOICE_MUTATION_ALLOWED_ROLES for Sales-can't-edit-invoices).
export function useCanMutate(allowedRoles: Role[] = MUTATION_ALLOWED_ROLES): boolean {
  const { hasRole } = useRole();
  return hasRole(allowedRoles);
}

// Hard role === "Owner" check for OWNER_ONLY_FEATURES - see OwnerOnlyGuard
// for why this bypasses the permission-grant path rather than using
// hasRole(["Owner"]) (same effect today, but this name documents that it's
// intentionally never meant to widen to "Owner or Admin").
export function useIsOwner(): boolean {
  const { role } = useRole();
  return role === "Owner";
}
