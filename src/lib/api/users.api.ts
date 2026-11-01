import { baseApi } from "./baseApi";
import { updateUser as setAuthUser } from "@/store/authSlice";
import type {
  ChangePasswordRequest,
  ConfirmEmailChangeRequest,
  ConfirmProfileMediaRequest,
  DeleteProfileMediaRequest,
  InviteUserRequest,
  PresignProfileMediaRequest,
  PresignProfileMediaResponse,
  RequestEmailChangeRequest,
  SetPasswordRequest,
  UpdateRoleRequest,
  UpdateUserPermissionsRequest,
  UpdateUserRequest,
  User,
  UserPermissions,
} from "@/types/api";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<User, void>({
      query: () => "/users/me",
      providesTags: ["Auth"],
    }),
    updateMe: builder.mutation<User, UpdateUserRequest>({
      query: (body) => ({ url: "/users/me", method: "PATCH", body }),
      invalidatesTags: ["Auth"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setAuthUser(data));
        } catch {
          // errorToastMiddleware / component-level catch already surface this
        }
      },
    }),
    setPassword: builder.mutation<void, SetPasswordRequest>({
      query: (body) => ({ url: "/users/me/set-password", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),
    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (body) => ({ url: "/users/me/change-password", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),
    presignProfileMedia: builder.mutation<PresignProfileMediaResponse, PresignProfileMediaRequest>({
      query: (body) => ({ url: "/users/me/media/presign", method: "POST", body }),
    }),
    confirmProfileMedia: builder.mutation<User, ConfirmProfileMediaRequest>({
      query: (body) => ({ url: "/users/me/media/confirm", method: "POST", body }),
      invalidatesTags: ["Auth"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setAuthUser(data));
        } catch {
          // errorToastMiddleware / component-level catch already surface this
        }
      },
    }),
    deleteProfileMedia: builder.mutation<User, DeleteProfileMediaRequest>({
      query: (body) => ({ url: "/users/me/media", method: "DELETE", body }),
      invalidatesTags: ["Auth"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setAuthUser(data));
        } catch {
          // errorToastMiddleware / component-level catch already surface this
        }
      },
    }),
    requestEmailChange: builder.mutation<{ success: boolean }, RequestEmailChangeRequest>({
      query: (body) => ({ url: "/users/me/request-email-change", method: "POST", body }),
    }),
    confirmEmailChange: builder.mutation<User, ConfirmEmailChangeRequest>({
      query: (body) => ({ url: "/users/me/confirm-email-change", method: "POST", body }),
      invalidatesTags: ["Auth"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setAuthUser(data));
        } catch {
          // errorToastMiddleware / component-level catch already surface this
        }
      },
    }),
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
  useGetMeQuery,
  useUpdateMeMutation,
  useSetPasswordMutation,
  useChangePasswordMutation,
  usePresignProfileMediaMutation,
  useConfirmProfileMediaMutation,
  useDeleteProfileMediaMutation,
  useRequestEmailChangeMutation,
  useConfirmEmailChangeMutation,
  useGetUsersQuery,
  useInviteUserMutation,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
  useResendInviteMutation,
  useRemoveUserMutation,
  useGetUserPermissionsQuery,
  useUpdateUserPermissionsMutation,
} = usersApi;
