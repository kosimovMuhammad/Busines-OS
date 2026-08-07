import { baseApi } from "./baseApi";
import type { OrgChart, OrgChartForUser } from "@/types/api";

export const orgChartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrgChart: builder.query<OrgChart, void>({
      query: () => "/org-chart",
      providesTags: [{ type: "OrgChart", id: "FULL" }],
    }),
    getOrgChartForUser: builder.query<OrgChartForUser, string>({
      query: (id) => `/org-chart/user/${id}`,
      providesTags: (_result, _error, id) => [{ type: "OrgChart", id }],
    }),
  }),
});

export const { useGetOrgChartQuery, useGetOrgChartForUserQuery } = orgChartApi;
