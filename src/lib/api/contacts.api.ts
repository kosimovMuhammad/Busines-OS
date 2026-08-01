import { baseApi } from "./baseApi";
import type {
  Communication,
  Contact,
  CreateContactRequest,
  Paginated,
  UpdateContactRequest,
} from "@/types/api";

export type ContactsQueryArgs = {
  search?: string;
  tag?: string;
  ownerId?: string;
  page?: number;
  limit?: number;
};

export const contactsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContacts: builder.query<Paginated<Contact>, ContactsQueryArgs>({
      query: (params) => ({ url: "/contacts", params }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((c) => ({ type: "Contacts" as const, id: c.id })),
              { type: "Contacts" as const, id: "LIST" },
            ]
          : [{ type: "Contacts" as const, id: "LIST" }],
    }),
    getContact: builder.query<Contact, string>({
      query: (id) => `/contacts/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Contacts", id }],
    }),
    createContact: builder.mutation<Contact, CreateContactRequest>({
      query: (body) => ({ url: "/contacts", method: "POST", body }),
      invalidatesTags: [{ type: "Contacts", id: "LIST" }],
    }),
    updateContact: builder.mutation<
      Contact,
      { id: string; body: UpdateContactRequest }
    >({
      query: ({ id, body }) => ({ url: `/contacts/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Contacts", id },
        { type: "Contacts", id: "LIST" },
      ],
    }),
    removeContact: builder.mutation<void, string>({
      query: (id) => ({ url: `/contacts/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Contacts", id: "LIST" }],
    }),
    getContactTimeline: builder.query<Communication[], string>({
      query: (id) => `/contacts/${id}/timeline`,
      providesTags: (_result, _error, id) => [{ type: "Communications", id }],
    }),
  }),
});

export const {
  useGetContactsQuery,
  useGetContactQuery,
  useCreateContactMutation,
  useUpdateContactMutation,
  useRemoveContactMutation,
  useGetContactTimelineQuery,
} = contactsApi;
