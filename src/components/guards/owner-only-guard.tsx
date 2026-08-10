"use client";

import type { ReactNode } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectUserRole } from "@/store/authSelectors";
import type { OwnerOnlyFeature } from "@/lib/permissions/constants";

// Hard role === "Owner" check, deliberately bypassing hasPermission()'s
// custom-permission-grant path: transferOwnership / deleteCompany /
// changeSubscriptionOwner (see OWNER_ONLY_FEATURES) must never become
// grantable to a non-owner via a custom permission the way ordinary module
// actions can. `feature` is required (not optional like PermissionGuard's
// `roles`) so a call site can't accidentally render this with no gate at all.
export function OwnerOnlyGuard({
  fallback = null,
  children,
}: {
  // Required (not read directly) so a call site can't render this guard
  // without naming which OWNER_ONLY_FEATURES entry it's protecting.
  feature: OwnerOnlyFeature;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const role = useAppSelector(selectUserRole);
  if (role !== "Owner") return <>{fallback}</>;
  return <>{children}</>;
}
