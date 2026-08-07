import { baseApi } from "./baseApi";
import type {
  ApiKey,
  CreateApiKeyRequest,
  CreatedApiKey,
  UpdateApiKeyRequest,
} from "@/types/api";

export const apiKeysApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getApiKeys: builder.query<ApiKey[], void>({
      query: () => "/api-keys",
      providesTags: (result) =>
        result
          ? [
              ...result.map((k) => ({ type: "ApiKeys" as const, id: k.id })),
              { type: "ApiKeys" as const, id: "LIST" },
            ]
          : [{ type: "ApiKeys" as const, id: "LIST" }],
    }),
    createApiKey: builder.mutation<CreatedApiKey, CreateApiKeyRequest>({
      query: (body) => ({ url: "/api-keys", method: "POST", body }),
      invalidatesTags: [{ type: "ApiKeys", id: "LIST" }],
    }),
    updateApiKey: builder.mutation<ApiKey, { id: string; body: UpdateApiKeyRequest }>({
      query: ({ id, body }) => ({ url: `/api-keys/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ApiKeys", id },
        { type: "ApiKeys", id: "LIST" },
      ],
    }),
    removeApiKey: builder.mutation<void, string>({
      query: (id) => ({ url: `/api-keys/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "ApiKeys", id: "LIST" }],
    }),
  }),
});

export const {
  useGetApiKeysQuery,
  useCreateApiKeyMutation,
  useUpdateApiKeyMutation,
  useRemoveApiKeyMutation,
} = apiKeysApi;
