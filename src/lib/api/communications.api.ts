import { baseApi } from "./baseApi";
import type { Communication, CreateNoteRequest } from "@/types/api";

export const communicationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createNote: builder.mutation<Communication, CreateNoteRequest>({
      query: (body) => ({ url: "/communications/notes", method: "POST", body }),
      invalidatesTags: (_result, _error, { contactId }) => [
        { type: "Communications", id: contactId },
      ],
    }),
  }),
});

export const { useCreateNoteMutation } = communicationsApi;
