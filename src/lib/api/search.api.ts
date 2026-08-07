import { baseApi } from "./baseApi";
import type { GlobalSearchArgs, GlobalSearchResponse, SearchGroup } from "@/types/api";

export type EntitySearchArgs = { q: string; page?: number; limit?: number };

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    globalSearch: builder.query<GlobalSearchResponse, GlobalSearchArgs>({
      query: ({ types, ...rest }) => ({
        url: "/search",
        params: { ...rest, types: types?.join(",") },
      }),
    }),
    searchContacts: builder.query<SearchGroup, EntitySearchArgs>({
      query: (params) => ({ url: "/search/contacts", params }),
    }),
    searchDeals: builder.query<SearchGroup, EntitySearchArgs>({
      query: (params) => ({ url: "/search/deals", params }),
    }),
    searchTasks: builder.query<SearchGroup, EntitySearchArgs>({
      query: (params) => ({ url: "/search/tasks", params }),
    }),
    searchFiles: builder.query<SearchGroup, EntitySearchArgs>({
      query: (params) => ({ url: "/search/files", params }),
    }),
    searchEmails: builder.query<SearchGroup, EntitySearchArgs>({
      query: (params) => ({ url: "/search/emails", params }),
    }),
    searchMessages: builder.query<SearchGroup, EntitySearchArgs>({
      query: (params) => ({ url: "/search/messages", params }),
    }),
  }),
});

export const {
  useGlobalSearchQuery,
  useSearchContactsQuery,
  useSearchDealsQuery,
  useSearchTasksQuery,
  useSearchFilesQuery,
  useSearchEmailsQuery,
  useSearchMessagesQuery,
} = searchApi;
