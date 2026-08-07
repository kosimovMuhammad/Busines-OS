import { baseApi } from "./baseApi";
import type {
  CreatedWebhook,
  CreateWebhookRequest,
  Paginated,
  UpdateWebhookRequest,
  Webhook,
  WebhookLog,
  WebhookLogsArgs,
} from "@/types/api";

export const webhooksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWebhooks: builder.query<Webhook[], void>({
      query: () => "/webhooks",
      providesTags: (result) =>
        result
          ? [
              ...result.map((w) => ({ type: "Webhooks" as const, id: w.id })),
              { type: "Webhooks" as const, id: "LIST" },
            ]
          : [{ type: "Webhooks" as const, id: "LIST" }],
    }),
    createWebhook: builder.mutation<CreatedWebhook, CreateWebhookRequest>({
      query: (body) => ({ url: "/webhooks", method: "POST", body }),
      invalidatesTags: [{ type: "Webhooks", id: "LIST" }],
    }),
    updateWebhook: builder.mutation<Webhook, { id: string; body: UpdateWebhookRequest }>({
      query: ({ id, body }) => ({ url: `/webhooks/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Webhooks", id },
        { type: "Webhooks", id: "LIST" },
      ],
    }),
    removeWebhook: builder.mutation<void, string>({
      query: (id) => ({ url: `/webhooks/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Webhooks", id: "LIST" }],
    }),
    getWebhookLogs: builder.query<Paginated<WebhookLog>, WebhookLogsArgs>({
      query: (params) => ({ url: "/webhooks/logs", params }),
    }),
  }),
});

export const {
  useGetWebhooksQuery,
  useCreateWebhookMutation,
  useUpdateWebhookMutation,
  useRemoveWebhookMutation,
  useGetWebhookLogsQuery,
} = webhooksApi;
