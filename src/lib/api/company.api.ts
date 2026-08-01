import { baseApi } from "./baseApi";
import type { CompanyIntegrations } from "@/types/api";

export const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIntegrations: builder.query<CompanyIntegrations, void>({
      query: () => "/company/integrations",
      providesTags: ["Company"],
    }),
  }),
});

export const { useGetIntegrationsQuery } = companyApi;
