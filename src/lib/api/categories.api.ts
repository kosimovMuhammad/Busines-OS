import { baseApi } from "./baseApi";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "@/types/api";

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], { includeArchived?: boolean } | void>({
      query: (args) => ({ url: "/categories", params: args ?? undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((c) => ({ type: "Categories" as const, id: c.id })),
              { type: "Categories" as const, id: "LIST" },
            ]
          : [{ type: "Categories" as const, id: "LIST" }],
    }),
    createCategory: builder.mutation<Category, CreateCategoryRequest>({
      query: (body) => ({ url: "/categories", method: "POST", body }),
      invalidatesTags: [{ type: "Categories", id: "LIST" }],
    }),
    updateCategory: builder.mutation<Category, { id: string; body: UpdateCategoryRequest }>({
      query: ({ id, body }) => ({ url: `/categories/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Categories", id },
        { type: "Categories", id: "LIST" },
      ],
    }),
    removeCategory: builder.mutation<void, string>({
      query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Categories", id: "LIST" }],
    }),
    archiveCategory: builder.mutation<void, string>({
      query: (id) => ({ url: `/categories/${id}/archive`, method: "PATCH" }),
      invalidatesTags: [{ type: "Categories", id: "LIST" }],
    }),
    restoreCategory: builder.mutation<void, string>({
      query: (id) => ({ url: `/categories/${id}/restore`, method: "POST" }),
      invalidatesTags: [{ type: "Categories", id: "LIST" }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useRemoveCategoryMutation,
  useArchiveCategoryMutation,
  useRestoreCategoryMutation,
} = categoriesApi;
