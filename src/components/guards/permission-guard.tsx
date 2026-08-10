"use client";

import type { ReactNode } from "react";
import { useRole } from "@/lib/hooks/useRole";
import type { UserRole } from "@/types/enums";

// Inline/button-level gate: silent by default (renders nothing), unlike
// RequireRole which is meant for section/page-level content and shows a
// visible "restricted" card by default. Wrapping a Create/Delete button in
// RequireRole would show that card in place of the button - wrong for this
// use case - hence a separate component rather than reusing RequireRole.
export function PermissionGuard({
  permission,
  roles,
  fallbackRoles,
  fallback = null,
  children,
}: {
  // Provide `permission` when a real backend permission key is known;
  // otherwise `roles` gates purely on the enum role (this is the common
  // case for Phase 6, since exact permission-key strings aren't hardcoded
  // anywhere in this app - see src/lib/permissions/constants.ts).
  permission?: string;
  roles?: UserRole[];
  fallbackRoles?: UserRole[];
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const { hasPermission, hasRole } = useRole();
  const allowed = permission ? hasPermission(permission, fallbackRoles) : !!roles && hasRole(roles);
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
