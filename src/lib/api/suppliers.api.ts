import { baseApi } from "./baseApi";
import type {
  CreateSupplierRequest,
  Paginated,
  Supplier,
  SuppliersQueryArgs,
  UpdateSupplierRequest,
} from "@/types/api";

export const suppliersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSuppliers: builder.query<Paginated<Supplier>, SuppliersQueryArgs | void>({
      query: (args) => ({ url: "/suppliers", params: args ?? undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((s) => ({ type: "Suppliers" as const, id: s.id })),
              { type: "Suppliers" as const, id: "LIST" },
            ]
          : [{ type: "Suppliers" as const, id: "LIST" }],
    }),
    createSupplier: builder.mutation<Supplier, CreateSupplierRequest>({
      query: (body) => ({ url: "/suppliers", method: "POST", body }),
      invalidatesTags: [{ type: "Suppliers", id: "LIST" }],
    }),
    updateSupplier: builder.mutation<Supplier, { id: string; body: UpdateSupplierRequest }>({
      query: ({ id, body }) => ({ url: `/suppliers/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Suppliers", id },
        { type: "Suppliers", id: "LIST" },
      ],
    }),
    removeSupplier: builder.mutation<void, string>({
      query: (id) => ({ url: `/suppliers/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Suppliers", id: "LIST" }],
    }),
    archiveSupplier: builder.mutation<void, string>({
      query: (id) => ({ url: `/suppliers/${id}/archive`, method: "PATCH" }),
      invalidatesTags: [{ type: "Suppliers", id: "LIST" }],
    }),
    restoreSupplier: builder.mutation<void, string>({
      query: (id) => ({ url: `/suppliers/${id}/restore`, method: "POST" }),
      invalidatesTags: [{ type: "Suppliers", id: "LIST" }],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useRemoveSupplierMutation,
  useArchiveSupplierMutation,
  useRestoreSupplierMutation,
} = suppliersApi;
