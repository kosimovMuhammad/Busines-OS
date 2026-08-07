import { baseApi } from "./baseApi";
import type {
  InviteUserRequest,
  UpdateRoleRequest,
  UpdateUserPermissionsRequest,
  UpdateUserRequest,
  User,
  UserPermissions,
} from "@/types/api";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => "/users",
      providesTags: (result) =>
        result
          ? [
              ...result.map((u) => ({ type: "Users" as const, id: u.id })),
              { type: "Users" as const, id: "LIST" },
            ]
          : [{ type: "Users" as const, id: "LIST" }],
    }),
    inviteUser: builder.mutation<User, InviteUserRequest>({
      query: (body) => ({ url: "/users/invite", method: "POST", body }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),
    updateUser: builder.mutation<User, { id: string; body: UpdateUserRequest }>({
      query: ({ id, body }) => ({ url: `/users/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),
    updateUserRole: builder.mutation<User, { id: string; body: UpdateRoleRequest }>({
      query: ({ id, body }) => ({ url: `/users/${id}/role`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
        { type: "Users", id: `${id}-PERMISSIONS` },
      ],
    }),
    resendInvite: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/users/${id}/resend-invite`, method: "POST" }),
    }),
    removeUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),
    getUserPermissions: builder.query<UserPermissions, string>({
      query: (id) => `/users/${id}/permissions`,
      providesTags: (_result, _error, id) => [{ type: "Users", id: `${id}-PERMISSIONS` }],
    }),
    updateUserPermissions: builder.mutation<
      UserPermissions,
      { id: string; body: UpdateUserPermissionsRequest }
    >({
      query: ({ id, body }) => ({
        url: `/users/${id}/permissions`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Users", id: `${id}-PERMISSIONS` },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useInviteUserMutation,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
  useResendInviteMutation,
  useRemoveUserMutation,
  useGetUserPermissionsQuery,
  useUpdateUserPermissionsMutation,
} = usersApi;
