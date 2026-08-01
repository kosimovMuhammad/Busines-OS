import { baseApi } from "./baseApi";
import type { AiSummaryResult, SummarizeRequest } from "@/types/api";

export const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    summarize: builder.mutation<void, SummarizeRequest>({
      query: (body) => ({ url: "/ai/summarize", method: "POST", body }),
    }),
    getSummary: builder.query<AiSummaryResult, string>({
      query: (id) => `/ai/summary/${id}`,
      providesTags: (_result, _error, id) => [{ type: "AI", id }],
    }),
  }),
});

export const { useSummarizeMutation, useGetSummaryQuery } = aiApi;
