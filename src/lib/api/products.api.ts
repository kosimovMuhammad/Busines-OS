import { baseApi } from "./baseApi";
import type {
  CreateProductRequest,
  Paginated,
  Product,
  ProductsQueryArgs,
  UpdateProductRequest,
} from "@/types/api";

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Paginated<Product>, ProductsQueryArgs | void>({
      query: (args) => ({ url: "/products", params: args ?? undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((p) => ({ type: "Products" as const, id: p.id })),
              { type: "Products" as const, id: "LIST" },
            ]
          : [{ type: "Products" as const, id: "LIST" }],
    }),
    createProduct: builder.mutation<Product, CreateProductRequest>({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),
    updateProduct: builder.mutation<Product, { id: string; body: UpdateProductRequest }>({
      query: ({ id, body }) => ({ url: `/products/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Products", id },
        { type: "Products", id: "LIST" },
      ],
    }),
    removeProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),
    archiveProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/products/${id}/archive`, method: "PATCH" }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),
    restoreProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/products/${id}/restore`, method: "POST" }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useRemoveProductMutation,
  useArchiveProductMutation,
  useRestoreProductMutation,
} = productsApi;
