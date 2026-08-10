import type { NavEntry } from "./nav-config";
import { hasModuleAccess } from "@/lib/permissions/utils";
import type { Role } from "@/lib/permissions/constants";

// TODO(custom rbacRoleId roles): hasModuleAccess() resolves purely against
// the fixed 7-role ROLE_MODULE_MAP, keyed by the enum `role` (UserRole).
// A user assigned a custom RBAC role still carries one of the 7 enum values
// here (rbacRoleId is a separate, additional assignment - see useRole's
// comment on how the backend resolves permissionKeys from it), so today they
// see whatever their enum role's module map allows, not their actual custom
// permission set. Once custom-role users need sidebar visibility that
// diverges from their enum role, this should fall back to checking
// permissionKeys (selectUserPermissions / usePermissions()) module-by-module
// - e.g. a module is visible if hasModuleAccess(role, key) OR the user holds
// any permission whose `module` field matches - instead of relying on
// hasModuleAccess() alone.
export function filterNavEntries(entries: NavEntry[], role: Role | null): NavEntry[] {
  return entries
    .map((entry): NavEntry | null => {
      if (entry.kind === "link") {
        return hasModuleAccess(role, entry.item.labelKey) ? entry : null;
      }
      const items = entry.group.items.filter((item) => hasModuleAccess(role, item.labelKey));
      if (items.length === 0) return null;
      return { kind: "group", group: { ...entry.group, items } };
    })
    .filter((entry): entry is NavEntry => entry !== null);
}
