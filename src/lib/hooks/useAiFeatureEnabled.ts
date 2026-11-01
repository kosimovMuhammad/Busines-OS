import { useGetFeaturesQuery } from "@/lib/api/company.api";

// Thin, ergonomic wrapper over getFeatures matching useCanMutate/usePermission's
// imperative-check shape. GET /company/features has no backend staleness (it's
// live on every call), so the only staleness risk is our own RTK Query cache -
// closed by invalidating the CompanyFeatures tag on changePlan (subscription.api.ts).
// Defaults to false (gated) while the query hasn't resolved yet, matching the
// "hide until proven allowed" bias of PermissionGuard/RouteGuard.
export function useAiFeatureEnabled(): boolean {
  const { data } = useGetFeaturesQuery();
  return !!data?.ai_features;
}
