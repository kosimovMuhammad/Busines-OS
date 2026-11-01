import { baseApi } from "./baseApi";
import type {
  CancelSubscriptionRequest,
  ChangePlanRequest,
  RequestUpgradeRequest,
  Subscription,
  SubscriptionPlan,
  UpgradeResult,
  UsageMetric,
} from "@/types/api";

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscription: builder.query<Subscription, void>({
      query: () => "/subscription",
      providesTags: ["Subscription"],
    }),
    getSubscriptionPlans: builder.query<SubscriptionPlan[], { includeInactive?: boolean } | void>({
      query: (args) => ({
        url: "/subscription/plans",
        params: args?.includeInactive ? { includeInactive: true } : undefined,
      }),
      providesTags: ["Subscription"],
    }),
    getUsage: builder.query<UsageMetric[], void>({
      query: () => "/subscription/usage",
      providesTags: ["Subscription"],
    }),
    requestUpgrade: builder.mutation<UpgradeResult, RequestUpgradeRequest>({
      query: (body) => ({ url: "/subscription/upgrade", method: "POST", body }),
      invalidatesTags: ["Subscription"],
    }),
    // Applies immediately, live on the very next getFeatures/getSubscription
    // call - invalidate both so the AI UI (and any other plan-gated UI)
    // appears without a manual refresh.
    changePlan: builder.mutation<Subscription, ChangePlanRequest>({
      query: (body) => ({ url: "/company/subscription/change-plan", method: "POST", body }),
      invalidatesTags: ["Subscription", "Company", "CompanyFeatures"],
    }),
    // An immediate:true cancel can drop ai_features (or any other plan
    // feature) just like changePlan can grant it - must invalidate the same
    // tags so the sidebar/other gated UI updates without a manual reload,
    // not just the Subscription-tagged screens (plan-content.tsx, etc).
    cancelSubscription: builder.mutation<Subscription, CancelSubscriptionRequest>({
      query: (body) => ({ url: "/subscription/cancel", method: "POST", body }),
      invalidatesTags: ["Subscription", "Company", "CompanyFeatures"],
    }),
  }),
});

export const {
  useGetSubscriptionQuery,
  useGetSubscriptionPlansQuery,
  useGetUsageQuery,
  useRequestUpgradeMutation,
  useChangePlanMutation,
  useCancelSubscriptionMutation,
} = subscriptionApi;
