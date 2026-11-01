import { baseApi } from "./baseApi";
import type {
  Communication,
  CompleteWhatsappSignupRequest,
  SendPlatformWhatsAppTemplateRequest,
  SendPlatformWhatsAppTextRequest,
  SendWhatsappRequest,
  WhatsappClientEventRequest,
  WhatsappConnectResult,
  WhatsappSignupConfig,
  WhatsAppSendResult,
  WhatsappAccount,
} from "@/types/api";

export const whatsappApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWhatsappAccounts: builder.query<WhatsappAccount[], void>({
      query: () => "/whatsapp/accounts",
      providesTags: (result) =>
        result
          ? [
              ...result.map((a) => ({ type: "WhatsApp" as const, id: a.id })),
              { type: "WhatsApp" as const, id: "LIST" },
            ]
          : [{ type: "WhatsApp" as const, id: "LIST" }],
    }),
    // State is single-purpose and expires in 10 min, so never serve a cached copy.
    getWhatsappSignupConfig: builder.query<WhatsappSignupConfig, string>({
      query: (locale) => `/whatsapp/embedded-signup/config?locale=${encodeURIComponent(locale)}`,
      keepUnusedDataFor: 0,
    }),
    completeWhatsappSignup: builder.mutation<WhatsappConnectResult, CompleteWhatsappSignupRequest>({
      query: (body) => ({ url: "/whatsapp/embedded-signup/complete", method: "POST", body }),
      invalidatesTags: [{ type: "WhatsApp", id: "LIST" }, "Company"],
    }),
    reportWhatsappSignupEvent: builder.mutation<
      { code: string; message: string },
      WhatsappClientEventRequest
    >({
      query: (body) => ({ url: "/whatsapp/embedded-signup/client-event", method: "POST", body }),
    }),
    // Development-only step trace; the backend returns 404 outside Development.
    traceWhatsappSignupStep: builder.mutation<void, { step: string; data?: Record<string, unknown> }>({
      query: (body) => ({ url: "/whatsapp/embedded-signup/debug", method: "POST", body }),
    }),
    retryWhatsappAccount: builder.mutation<WhatsappConnectResult, string>({
      query: (id) => ({ url: `/whatsapp/accounts/${id}/retry`, method: "POST" }),
      invalidatesTags: [{ type: "WhatsApp", id: "LIST" }, "Company"],
    }),
    deleteWhatsappAccount: builder.mutation<void, string>({
      query: (id) => ({ url: `/whatsapp/accounts/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "WhatsApp", id: "LIST" }, "Company"],
    }),
    sendWhatsappMessage: builder.mutation<Communication, SendWhatsappRequest>({
      query: (body) => ({ url: "/whatsapp/send", method: "POST", body }),
      invalidatesTags: (_result, _error, { contactId }) => [
        { type: "Communications", id: contactId },
        { type: "Communications", id: "LIST" },
      ],
    }),
    // Platform mode: sends from the platform's own WhatsApp number, not a
    // tenant's connected account. Backend gates this to IsPlatformAdmin
    // users (403 otherwise) - see WhatsAppService.EnsurePlatformAdminAsync.
    sendPlatformWhatsAppText: builder.mutation<
      WhatsAppSendResult,
      SendPlatformWhatsAppTextRequest
    >({
      query: (body) => ({ url: "/whatsapp/platform/send/text", method: "POST", body }),
    }),
    sendPlatformWhatsAppTemplate: builder.mutation<
      WhatsAppSendResult,
      SendPlatformWhatsAppTemplateRequest
    >({
      query: (body) => ({ url: "/whatsapp/platform/send/template", method: "POST", body }),
    }),
  }),
});

export const {
  useGetWhatsappAccountsQuery,
  useLazyGetWhatsappSignupConfigQuery,
  useCompleteWhatsappSignupMutation,
  useReportWhatsappSignupEventMutation,
  useTraceWhatsappSignupStepMutation,
  useRetryWhatsappAccountMutation,
  useDeleteWhatsappAccountMutation,
  useSendWhatsappMessageMutation,
  useSendPlatformWhatsAppTextMutation,
  useSendPlatformWhatsAppTemplateMutation,
} = whatsappApi;
