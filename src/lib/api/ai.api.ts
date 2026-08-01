import { baseApi } from "./baseApi";
import type {
  AiDraftEmailRequest,
  AiDraftEmailResult,
  AiGenerateQuotationRequest,
  AiJobQueued,
  AiQueryRequest,
  AiQueryResult,
  AiQuotationResult,
  AiSummarizeQueued,
  AiSummaryRecord,
  SummarizeRequest,
} from "@/types/api";

export const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    summarize: builder.mutation<AiSummarizeQueued, SummarizeRequest>({
      query: (body) => ({ url: "/ai/summarize", method: "POST", body }),
    }),
    getSummary: builder.query<AiSummaryRecord, string>({
      query: (id) => `/ai/summary/${id}`,
      providesTags: (_result, _error, id) => [{ type: "AI", id }],
    }),

    aiQuery: builder.mutation<AiJobQueued, AiQueryRequest>({
      query: (body) => ({ url: "/ai/query", method: "POST", body }),
    }),
    getAiQueryResult: builder.query<AiQueryResult, string>({
      query: (id) => `/ai/query/result/${id}`,
    }),

    draftEmail: builder.mutation<AiJobQueued, AiDraftEmailRequest>({
      query: (body) => ({ url: "/ai/draft-email", method: "POST", body }),
    }),
    getDraftEmailResult: builder.query<AiDraftEmailResult, string>({
      query: (id) => `/ai/draft-email/result/${id}`,
    }),

    generateQuotation: builder.mutation<AiJobQueued, AiGenerateQuotationRequest>({
      query: (body) => ({ url: "/ai/generate-quotation", method: "POST", body }),
    }),
    getQuotationResult: builder.query<AiQuotationResult, string>({
      query: (id) => `/ai/generate-quotation/result/${id}`,
    }),
  }),
});

export const {
  useSummarizeMutation,
  useGetSummaryQuery,
  useAiQueryMutation,
  useGetAiQueryResultQuery,
  useDraftEmailMutation,
  useGetDraftEmailResultQuery,
  useGenerateQuotationMutation,
  useGetQuotationResultQuery,
} = aiApi;
