import { baseApi } from "./baseApi";
import type {
  Communication,
  ConnectTelegramAccountRequest,
  LinkTelegramChatToContactRequest,
  SendTelegramRequest,
  TelegramAccount,
  TelegramChatLink,
} from "@/types/api";

export const telegramApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTelegramAccounts: builder.query<TelegramAccount[], void>({
      query: () => "/telegram/accounts",
      providesTags: (result) =>
        result
          ? [
              ...result.map((a) => ({ type: "Telegram" as const, id: a.id })),
              { type: "Telegram" as const, id: "LIST" },
            ]
          : [{ type: "Telegram" as const, id: "LIST" }],
    }),
    connectTelegramAccount: builder.mutation<
      TelegramAccount,
      ConnectTelegramAccountRequest
    >({
      query: (body) => ({ url: "/telegram/accounts", method: "POST", body }),
      invalidatesTags: [{ type: "Telegram", id: "LIST" }, "Company"],
    }),
    sendTelegramMessage: builder.mutation<Communication, SendTelegramRequest>({
      query: (body) => ({ url: "/telegram/send", method: "POST", body }),
      invalidatesTags: (_result, _error, { contactId }) => [
        { type: "Communications", id: contactId },
        { type: "Communications", id: "LIST" },
      ],
    }),
    getTelegramChatLinks: builder.query<TelegramChatLink[], { onlyUnlinked?: boolean } | void>({
      query: (params) => ({ url: "/telegram/chat-links", params: params ?? undefined }),
      providesTags: [{ type: "TelegramChatLinks", id: "LIST" }],
    }),
    linkTelegramChatToContact: builder.mutation<
      TelegramChatLink,
      { id: string } & LinkTelegramChatToContactRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/telegram/chat-links/${id}/link-contact`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "TelegramChatLinks", id: "LIST" },
        { type: "Communications", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetTelegramAccountsQuery,
  useConnectTelegramAccountMutation,
  useSendTelegramMessageMutation,
  useGetTelegramChatLinksQuery,
  useLinkTelegramChatToContactMutation,
} = telegramApi;
