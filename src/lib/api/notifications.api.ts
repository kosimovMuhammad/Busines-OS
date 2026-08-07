import { baseApi } from "./baseApi";
import type { Notification, NotificationsQueryArgs, Paginated } from "@/types/api";

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<Paginated<Notification>, NotificationsQueryArgs>({
      query: (params) => ({ url: "/notifications", params }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((n) => ({ type: "Notifications" as const, id: n.id })),
              { type: "Notifications" as const, id: "LIST" },
            ]
          : [{ type: "Notifications" as const, id: "LIST" }],
    }),
    getUnreadNotifications: builder.query<Paginated<Notification>, NotificationsQueryArgs>({
      query: (params) => ({ url: "/notifications/unread", params }),
      providesTags: [{ type: "Notifications", id: "LIST" }],
    }),
    getUnreadNotificationCount: builder.query<{ count: number }, void>({
      query: () => "/notifications/unread-count",
      providesTags: [{ type: "Notifications", id: "COUNT" }],
    }),
    markNotificationRead: builder.mutation<void, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: [
        { type: "Notifications", id: "LIST" },
        { type: "Notifications", id: "COUNT" },
      ],
    }),
    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({ url: "/notifications/read-all", method: "PATCH" }),
      invalidatesTags: [
        { type: "Notifications", id: "LIST" },
        { type: "Notifications", id: "COUNT" },
      ],
    }),
    removeNotification: builder.mutation<void, string>({
      query: (id) => ({ url: `/notifications/${id}`, method: "DELETE" }),
      invalidatesTags: [
        { type: "Notifications", id: "LIST" },
        { type: "Notifications", id: "COUNT" },
      ],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useRemoveNotificationMutation,
} = notificationsApi;
