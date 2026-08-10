import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import { usersApi } from "@/lib/api/users.api";
import type { Role } from "@/lib/permissions/constants";

// role lives on the session user (set by AuthResponse on login/refresh).
export const selectUserRole = (state: RootState): Role | null =>
  state.auth.user?.role ?? null;

export const selectUserId = (state: RootState): string | null =>
  state.auth.user?.id ?? null;

// Internal-ops-only flag, orthogonal to tenant RBAC roles - see
// WhatsAppService.EnsurePlatformAdminAsync on the backend for why even an
// Owner/Admin isn't automatically a platform admin.
export const selectIsPlatformAdmin = (state: RootState): boolean =>
  state.auth.user?.isPlatformAdmin ?? false;

// Permissions are NOT duplicated into the auth slice - they stay in the
// getUserPermissions RTK Query cache (already tagged/invalidated correctly
// by roles.api.ts / users.api.ts mutations) and are surfaced here as a plain
// selector so callers don't need to know it's cache-backed.
const selectUserPermissionsResult = createSelector(
  [selectUserId, (state: RootState) => state],
  (userId, state) =>
    userId ? usersApi.endpoints.getUserPermissions.select(userId)(state) : undefined
);

export const selectUserPermissions = createSelector(
  [selectUserPermissionsResult],
  (result): string[] => result?.data?.permissionKeys ?? []
);

export const selectUserRbacRoleName = createSelector(
  [selectUserPermissionsResult],
  (result): string | null => result?.data?.roleName ?? null
);
