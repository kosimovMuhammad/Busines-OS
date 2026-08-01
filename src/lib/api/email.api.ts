import { baseApi } from "./baseApi";
import type { Communication, EmailConnectResponse, SendEmailRequest } from "@/types/api";

export const emailApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    connectGmail: builder.mutation<EmailConnectResponse, void>({
      query: () => "/email/connect/gmail",
    }),
    connectOutlook: builder.mutation<EmailConnectResponse, void>({
      query: () => "/email/connect/outlook",
    }),
    sendEmail: builder.mutation<Communication, SendEmailRequest>({
      query: (body) => ({ url: "/email/send", method: "POST", body }),
      invalidatesTags: (_result, _error, { contactId }) => [
        { type: "Communications", id: contactId },
        { type: "Communications", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useConnectGmailMutation,
  useConnectOutlookMutation,
  useSendEmailMutation,
} = emailApi;
