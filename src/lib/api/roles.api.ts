import { baseApi } from "./baseApi";
import type {
  AttachPermissionRequest,
  CreateRoleRequest,
  RbacRole,
  UpdateRoleDetailsRequest,
} from "@/types/api";

export const rolesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<RbacRole[], void>({
      query: () => "/roles",
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({ type: "Roles" as const, id: r.id })),
              { type: "Roles" as const, id: "LIST" },
            ]
          : [{ type: "Roles" as const, id: "LIST" }],
    }),
    getRole: builder.query<RbacRole, string>({
      query: (id) => `/roles/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Roles", id }],
    }),
    createRole: builder.mutation<RbacRole, CreateRoleRequest>({
      query: (body) => ({ url: "/roles", method: "POST", body }),
      invalidatesTags: [{ type: "Roles", id: "LIST" }],
    }),
    updateRole: builder.mutation<
      RbacRole,
      { id: string; body: UpdateRoleDetailsRequest }
    >({
      query: ({ id, body }) => ({ url: `/roles/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Roles", id },
        { type: "Roles", id: "LIST" },
      ],
    }),
    removeRole: builder.mutation<void, string>({
      query: (id) => ({ url: `/roles/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Roles", id: "LIST" }],
    }),
    attachPermission: builder.mutation<
      RbacRole,
      { roleId: string; body: AttachPermissionRequest }
    >({
      query: ({ roleId, body }) => ({
        url: `/roles/${roleId}/permissions`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { roleId }) => [
        { type: "Roles", id: roleId },
        { type: "Roles", id: "LIST" },
      ],
    }),
    detachPermission: builder.mutation<
      void,
      { roleId: string; permissionId: string }
    >({
      query: ({ roleId, permissionId }) => ({
        url: `/roles/${roleId}/permissions/${permissionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { roleId }) => [
        { type: "Roles", id: roleId },
        { type: "Roles", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useRemoveRoleMutation,
  useAttachPermissionMutation,
  useDetachPermissionMutation,
} = rolesApi;
