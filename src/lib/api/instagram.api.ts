import { baseApi } from "./baseApi";
import type {
  Communication,
  ConnectInstagramAccountRequest,
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
    // OAuth consent URL - the backend generates and tracks the `state`
    // itself, so this is a plain GET, not a mutation. Instagram then
    // redirects the browser straight to the backend callback, which
    // redirects back here with ?status=success|error - there is no
    // frontend callback route to invalidate tags from, so the accounts
    // panel refetches manually when it sees that query param.
    getInstagramConnectUrl: builder.query<InstagramConnectResponse, void>({
      query: () => "/instagram/connect",
    }),
    connectInstagramAccount: builder.mutation<
      InstagramAccount,
      ConnectInstagramAccountRequest
    >({
      query: (body) => ({ url: "/instagram/accounts", method: "POST", body }),
      invalidatesTags: [{ type: "Instagram", id: "LIST" }, "Company"],
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
  useConnectInstagramAccountMutation,
  useSendInstagramMessageMutation,
  useGetInstagramConversationLinksQuery,
  useLinkInstagramConversationToContactMutation,
} = instagramApi;
