import { baseApi } from "./baseApi";
import type {
  Communication,
  ConnectWhatsappAccountRequest,
  SendPlatformWhatsAppTemplateRequest,
  SendPlatformWhatsAppTextRequest,
  SendWhatsappRequest,
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
    connectWhatsappAccount: builder.mutation<
      WhatsappAccount,
      ConnectWhatsappAccountRequest
    >({
      query: (body) => ({ url: "/whatsapp/accounts", method: "POST", body }),
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
  useConnectWhatsappAccountMutation,
  useSendWhatsappMessageMutation,
  useSendPlatformWhatsAppTextMutation,
  useSendPlatformWhatsAppTemplateMutation,
} = whatsappApi;
