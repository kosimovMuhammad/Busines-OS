import { baseApi } from "./baseApi";
import type {
  CreatePermissionRequest,
  Permission,
  UpdatePermissionRequest,
} from "@/types/api";

export const permissionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPermissions: builder.query<Permission[], { module?: string } | void>({
      query: (params) => ({ url: "/permissions", params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({ type: "Permissions" as const, id: p.id })),
              { type: "Permissions" as const, id: "LIST" },
            ]
          : [{ type: "Permissions" as const, id: "LIST" }],
    }),
    getPermission: builder.query<Permission, string>({
      query: (id) => `/permissions/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Permissions", id }],
    }),
    createPermission: builder.mutation<Permission, CreatePermissionRequest>({
      query: (body) => ({ url: "/permissions", method: "POST", body }),
      invalidatesTags: [{ type: "Permissions", id: "LIST" }],
    }),
    updatePermission: builder.mutation<
      Permission,
      { id: string; body: UpdatePermissionRequest }
    >({
      query: ({ id, body }) => ({
        url: `/permissions/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Permissions", id },
        { type: "Permissions", id: "LIST" },
      ],
    }),
    removePermission: builder.mutation<void, string>({
      query: (id) => ({ url: `/permissions/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Permissions", id: "LIST" }],
    }),
  }),
});

export const {
  useGetPermissionsQuery,
  useGetPermissionQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useRemovePermissionMutation,
} = permissionsApi;
