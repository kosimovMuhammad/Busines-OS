import { baseApi } from "./baseApi";
import type {
  AiAssistantConversation,
  AiAssistantMessageRequest,
  AiAssistantMessageResponse,
  AiDraftEmailRequest,
  AiDraftEmailResult,
  AiForecastRequest,
  AiForecastResult,
  AiGenerateQuotationRequest,
  AiJobQueued,
  AiQueryRequest,
  AiQueryResult,
  AiQuotationResult,
  AiSummarizeQueued,
  AiSummaryRecord,
  AiUsageResponse,
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

    // Synchronous - POST but no job/polling envelope, per the feature spec
    // ("no polling needed"). Modeled as a query (not a mutation) since it
    // doesn't mutate server state, just like getForecast on analytics.api.ts.
    getForecast: builder.query<AiForecastResult, AiForecastRequest | void>({
      query: (body) => ({ url: "/ai/forecast", method: "POST", body: body ?? {} }),
      providesTags: ["AI"],
    }),

    sendAssistantMessage: builder.mutation<AiAssistantMessageResponse, AiAssistantMessageRequest>({
      query: (body) => ({ url: "/ai/assistant/message", method: "POST", body }),
      invalidatesTags: (result) =>
        result ? [{ type: "AI", id: result.conversationId }] : [],
    }),
    getAssistantConversation: builder.query<AiAssistantConversation, string>({
      query: (id) => `/ai/assistant/conversations/${id}`,
      providesTags: (_result, _error, id) => [{ type: "AI", id }],
    }),

    getAiUsage: builder.query<AiUsageResponse, void>({
      query: () => "/company/ai-usage",
      providesTags: ["Company"],
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
  useGetForecastQuery: useGetAiForecastQuery,
  useSendAssistantMessageMutation,
  useGetAssistantConversationQuery,
  useGetAiUsageQuery,
} = aiApi;
