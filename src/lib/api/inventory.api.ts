import { baseApi } from "./baseApi";
import type {
  CreateInventoryRequest,
  InventoryQueryArgs,
  InventoryRecord,
  Paginated,
  StockMovementRequest,
  UpdateInventoryRequest,
} from "@/types/api";

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventory: builder.query<Paginated<InventoryRecord>, InventoryQueryArgs | void>({
      query: (args) => ({ url: "/inventory", params: args ?? undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((i) => ({ type: "Inventory" as const, id: i.id })),
              { type: "Inventory" as const, id: "LIST" },
            ]
          : [{ type: "Inventory" as const, id: "LIST" }],
    }),
    createInventoryRecord: builder.mutation<InventoryRecord, CreateInventoryRequest>({
      query: (body) => ({ url: "/inventory", method: "POST", body }),
      invalidatesTags: [{ type: "Inventory", id: "LIST" }],
    }),
    updateInventoryRecord: builder.mutation<
      InventoryRecord,
      { id: string; body: UpdateInventoryRequest }
    >({
      query: ({ id, body }) => ({ url: `/inventory/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Inventory", id },
        { type: "Inventory", id: "LIST" },
      ],
    }),
    removeInventoryRecord: builder.mutation<void, string>({
      query: (id) => ({ url: `/inventory/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Inventory", id: "LIST" }],
    }),
    stockIn: builder.mutation<InventoryRecord, StockMovementRequest>({
      query: (body) => ({ url: "/inventory/stock-in", method: "POST", body }),
      invalidatesTags: [{ type: "Inventory", id: "LIST" }],
    }),
    stockOut: builder.mutation<InventoryRecord, StockMovementRequest>({
      query: (body) => ({ url: "/inventory/stock-out", method: "POST", body }),
      invalidatesTags: [{ type: "Inventory", id: "LIST" }],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useCreateInventoryRecordMutation,
  useUpdateInventoryRecordMutation,
  useRemoveInventoryRecordMutation,
  useStockInMutation,
  useStockOutMutation,
} = inventoryApi;
