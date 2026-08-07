import { baseApi } from "./baseApi";
import type {
  Branch,
  CreateBranchRequest,
  UpdateBranchRequest,
} from "@/types/api";

export const branchesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBranches: builder.query<Branch[], void>({
      query: () => "/branches",
      providesTags: (result) =>
        result
          ? [
              ...result.map((b) => ({ type: "Branches" as const, id: b.id })),
              { type: "Branches" as const, id: "LIST" },
            ]
          : [{ type: "Branches" as const, id: "LIST" }],
    }),
    getBranch: builder.query<Branch, string>({
      query: (id) => `/branches/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Branches", id }],
    }),
    createBranch: builder.mutation<Branch, CreateBranchRequest>({
      query: (body) => ({ url: "/branches", method: "POST", body }),
      invalidatesTags: [{ type: "Branches", id: "LIST" }],
    }),
    updateBranch: builder.mutation<
      Branch,
      { id: string; body: UpdateBranchRequest }
    >({
      query: ({ id, body }) => ({ url: `/branches/${id}`, method: "PUT", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Branches", id },
        { type: "Branches", id: "LIST" },
      ],
    }),
    removeBranch: builder.mutation<void, string>({
      query: (id) => ({ url: `/branches/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Branches", id: "LIST" }],
    }),
  }),
});

export const {
  useGetBranchesQuery,
  useGetBranchQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useRemoveBranchMutation,
} = branchesApi;
