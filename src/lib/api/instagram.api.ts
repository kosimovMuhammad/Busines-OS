import { baseApi } from "./baseApi";
import type {
  Communication,
  InstagramAccount,
  InstagramConnectResponse,
  InstagramConversationLink,
  LinkInstagramConversationToContactRequest,
  SendInstagramRequest,
} from "@/types/api";

export const instagramApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInstagramAccounts: builder.query<InstagramAccount[], void>({
      query: () => "/instagram/accounts",
      providesTags: (result) =>
        result
          ? [
              ...result.map((a) => ({ type: "Instagram" as const, id: a.id })),
              { type: "Instagram" as const, id: "LIST" },
            ]
          : [{ type: "Instagram" as const, id: "LIST" }],
    }),
    // OAuth consent URL - the backend generates and tracks the one-time
    // `state` itself, so this is a plain GET, but it must never be served
    // from cache. `locale` tells the backend which /{locale}/instagram path
    // to redirect back to. After the callback the browser lands on
    // /{locale}/instagram?connected=...; the accounts panel reads those
    // params and refetches by hand (no frontend callback route to hook).
    getInstagramConnectUrl: builder.query<InstagramConnectResponse, string>({
      query: (locale) => ({ url: "/instagram/connect", params: { locale } }),
      keepUnusedDataFor: 0,
    }),
    // 404 = already disconnected elsewhere; treat as success so the list
    // refetches either way.
    disconnectInstagramAccount: builder.mutation<void, string>({
      query: (id) => ({ url: `/instagram/accounts/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, error) =>
        !error || error.status === 404
          ? [{ type: "Instagram" as const, id: "LIST" }, "Company"]
          : [],
    }),
    sendInstagramMessage: builder.mutation<Communication, SendInstagramRequest>({
      query: (body) => ({ url: "/instagram/send", method: "POST", body }),
      invalidatesTags: (_result, _error, { contactId }) => [
        { type: "Communications", id: contactId },
        { type: "Communications", id: "LIST" },
      ],
    }),
    getInstagramConversationLinks: builder.query<
      InstagramConversationLink[],
      { onlyUnlinked?: boolean } | void
    >({
      query: (params) => ({ url: "/instagram/conversation-links", params: params ?? undefined }),
      providesTags: [{ type: "InstagramConversationLinks", id: "LIST" }],
    }),
    linkInstagramConversationToContact: builder.mutation<
      InstagramConversationLink,
      { id: string } & LinkInstagramConversationToContactRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/instagram/conversation-links/${id}/link-contact`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "InstagramConversationLinks", id: "LIST" },
        { type: "Communications", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetInstagramAccountsQuery,
  useLazyGetInstagramConnectUrlQuery,
  useDisconnectInstagramAccountMutation,
  useSendInstagramMessageMutation,
  useGetInstagramConversationLinksQuery,
  useLinkInstagramConversationToContactMutation,
} = instagramApi;
