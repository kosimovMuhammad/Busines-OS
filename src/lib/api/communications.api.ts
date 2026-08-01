import { baseApi } from "./baseApi";
import type { Communication, CreateNoteRequest } from "@/types/api";
import type { CommChannel } from "@/types/enums";

export type CommunicationsQueryArgs = {
  contactId?: string;
  channel?: CommChannel;
};

export const communicationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommunications: builder.query<Communication[], CommunicationsQueryArgs | void>({
      query: (params) => ({ url: "/communications", params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((c) => ({ type: "Communications" as const, id: c.id })),
              { type: "Communications" as const, id: "LIST" },
            ]
          : [{ type: "Communications" as const, id: "LIST" }],
    }),
    createNote: builder.mutation<Communication, CreateNoteRequest>({
      query: (body) => ({ url: "/communications/notes", method: "POST", body }),
      invalidatesTags: (_result, _error, { contactId }) => [
        { type: "Communications", id: contactId },
        { type: "Communications", id: "LIST" },
      ],
    }),
  }),
});

export const { useGetCommunicationsQuery, useCreateNoteMutation } = communicationsApi;
