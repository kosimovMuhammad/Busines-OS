import { baseApi } from "./baseApi";
import type {
  CreatePurchaseOrderRequest,
  Paginated,
  PurchaseOrder,
  PurchaseOrderSummary,
  PurchaseOrdersQueryArgs,
  UpdatePurchaseOrderRequest,
} from "@/types/api";

export const purchaseOrdersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query<Paginated<PurchaseOrderSummary>, PurchaseOrdersQueryArgs | void>({
      query: (args) => ({ url: "/purchase-orders", params: args ?? undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((po) => ({ type: "PurchaseOrders" as const, id: po.id })),
              { type: "PurchaseOrders" as const, id: "LIST" },
            ]
          : [{ type: "PurchaseOrders" as const, id: "LIST" }],
    }),
    getPurchaseOrder: builder.query<PurchaseOrder, string>({
      query: (id) => `/purchase-orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: "PurchaseOrders", id }],
    }),
    createPurchaseOrder: builder.mutation<PurchaseOrder, CreatePurchaseOrderRequest>({
      query: (body) => ({ url: "/purchase-orders", method: "POST", body }),
      invalidatesTags: [{ type: "PurchaseOrders", id: "LIST" }],
    }),
    updatePurchaseOrder: builder.mutation<
      PurchaseOrder,
      { id: string; body: UpdatePurchaseOrderRequest }
    >({
      query: ({ id, body }) => ({ url: `/purchase-orders/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "PurchaseOrders", id },
        { type: "PurchaseOrders", id: "LIST" },
      ],
    }),
    removePurchaseOrder: builder.mutation<void, string>({
      query: (id) => ({ url: `/purchase-orders/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "PurchaseOrders", id: "LIST" }],
    }),
    archivePurchaseOrder: builder.mutation<void, string>({
      query: (id) => ({ url: `/purchase-orders/${id}/archive`, method: "PATCH" }),
      invalidatesTags: [{ type: "PurchaseOrders", id: "LIST" }],
    }),
    restorePurchaseOrder: builder.mutation<void, string>({
      query: (id) => ({ url: `/purchase-orders/${id}/restore`, method: "POST" }),
      invalidatesTags: [{ type: "PurchaseOrders", id: "LIST" }],
    }),
  }),
});

export const {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useRemovePurchaseOrderMutation,
  useArchivePurchaseOrderMutation,
  useRestorePurchaseOrderMutation,
} = purchaseOrdersApi;
