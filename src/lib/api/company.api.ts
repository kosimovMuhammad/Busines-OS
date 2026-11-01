import { baseApi } from "./baseApi";
import type {
  Company,
  CompanyFeatures,
  CompanyIntegrations,
  CompanyInvoice,
  CompanyInvoicesQueryArgs,
  Paginated,
  PlanInfo,
  UpdateCompanyRequest,
  UpdatePlanRequest,
} from "@/types/api";

export const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIntegrations: builder.query<CompanyIntegrations, void>({
      query: () => "/company/integrations",
      providesTags: ["Company"],
    }),
    getCompany: builder.query<Company, void>({
      query: () => "/company",
      providesTags: ["Company"],
    }),
    updateCompany: builder.mutation<Company, UpdateCompanyRequest>({
      query: (body) => ({ url: "/company", method: "PATCH", body }),
      invalidatesTags: ["Company"],
    }),
    getPlan: builder.query<PlanInfo, void>({
      query: () => "/company/plan",
      providesTags: ["Company"],
    }),
    updatePlan: builder.mutation<PlanInfo, UpdatePlanRequest>({
      query: (body) => ({ url: "/company/plan", method: "PATCH", body }),
      invalidatesTags: ["Company"],
    }),
    getFeatures: builder.query<CompanyFeatures, void>({
      query: () => "/company/features",
      providesTags: ["CompanyFeatures"],
    }),
    getCompanyInvoices: builder.query<Paginated<CompanyInvoice>, CompanyInvoicesQueryArgs | void>({
      query: (args) => ({ url: "/company/invoices", params: args ?? undefined }),
      providesTags: ["Company"],
    }),
  }),
});

export const {
  useGetIntegrationsQuery,
  useGetCompanyQuery,
  useUpdateCompanyMutation,
  useGetPlanQuery,
  useUpdatePlanMutation,
  useGetFeaturesQuery,
  useGetCompanyInvoicesQuery,
} = companyApi;
