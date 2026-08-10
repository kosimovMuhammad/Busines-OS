import { ROLE_MODULE_MAP, type ModuleKey, type Role } from "./constants";

// Pure, no Redux/React dependency - callers pass in the resolved permission
// keys array (from selectUserPermissions) so these stay trivially testable.

export function hasPermission(permissionKeys: string[], permission: string): boolean {
  return permissionKeys.includes(permission);
}

export function hasAnyPermission(permissionKeys: string[], permissions: string[]): boolean {
  return permissions.some((p) => permissionKeys.includes(p));
}

export function hasAllPermissions(permissionKeys: string[], permissions: string[]): boolean {
  return permissions.every((p) => permissionKeys.includes(p));
}

export function hasRole(role: Role | null, allowed: Role[]): boolean {
  return !!role && allowed.includes(role);
}

// Baseline sidebar/route module gate - see ROLE_MODULE_MAP for the map itself.
export function hasModuleAccess(role: Role | null, moduleKey: ModuleKey): boolean {
  if (!role) return false;
  return ROLE_MODULE_MAP[role].includes(moduleKey);
}
