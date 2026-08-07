"use client";

import type { ReactNode } from "react";
import { useRole } from "@/lib/hooks/useRole";
import type { UserRole } from "@/types/enums";
import { RestrictedAccess } from "./restricted-access";

export function RequireRole({
  roles,
  permission,
  fallback,
  children,
}: {
  roles?: UserRole[];
  permission?: string;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const { hasRole, hasPermission } = useRole();
  const allowed = permission ? hasPermission(permission) : !!roles && hasRole(roles);

  if (!allowed) return <>{fallback ?? <RestrictedAccess />}</>;
  return <>{children}</>;
}
