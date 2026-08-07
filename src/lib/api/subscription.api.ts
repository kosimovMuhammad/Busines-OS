import { baseApi } from "./baseApi";
import type {
  CancelSubscriptionRequest,
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
    cancelSubscription: builder.mutation<Subscription, CancelSubscriptionRequest>({
      query: (body) => ({ url: "/subscription/cancel", method: "POST", body }),
      invalidatesTags: ["Subscription"],
    }),
  }),
});

export const {
  useGetSubscriptionQuery,
  useGetSubscriptionPlansQuery,
  useGetUsageQuery,
  useRequestUpgradeMutation,
  useCancelSubscriptionMutation,
} = subscriptionApi;
