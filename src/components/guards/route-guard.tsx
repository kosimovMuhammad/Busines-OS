"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAppSelector } from "@/store/hooks";
import { useRole } from "@/lib/hooks/useRole";
import { selectIsPlatformAdmin } from "@/store/authSelectors";
import { FullScreenLoading } from "@/components/shared/full-screen-loading";
import type { UserRole } from "@/types/enums";

// Page-level gate: redirects instead of rendering a fallback in place.
// Mirrors SessionProvider's initialized-gate + effect-redirect pattern so a
// disallowed user never flashes the protected content before being sent away.
export function RouteGuard({
  permission,
  roles,
  // IsPlatformAdmin is an internal-ops-only flag, not a tenant RBAC role -
  // kept as its own branch rather than folded into `roles`/`permission` so
  // it can't be widened to "Owner" or any real role by accident.
  platformAdminOnly,
  redirectTo = "/403",
  children,
}: {
  permission?: string;
  roles?: UserRole[];
  platformAdminOnly?: boolean;
  redirectTo?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const initialized = useAppSelector((s) => s.auth.initialized);
  const isPlatformAdmin = useAppSelector(selectIsPlatformAdmin);
  const { hasRole, hasPermission } = useRole();
  const allowed = platformAdminOnly
    ? isPlatformAdmin
    : permission
      ? hasPermission(permission)
      : !!roles && hasRole(roles);

  useEffect(() => {
    if (initialized && !allowed) {
      router.replace(redirectTo);
    }
  }, [initialized, allowed, redirectTo, router]);

  if (!initialized || !allowed) {
    return <FullScreenLoading />;
  }

  return <>{children}</>;
}
