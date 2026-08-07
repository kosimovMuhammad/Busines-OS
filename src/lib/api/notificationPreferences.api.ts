import { baseApi } from "./baseApi";
import type { NotificationPreferenceItem, UpdateNotificationPreferencesRequest } from "@/types/api";

export const notificationPreferencesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotificationPreferences: builder.query<NotificationPreferenceItem[], void>({
      query: () => "/users/me/notification-preferences",
      providesTags: [{ type: "NotificationPreferences", id: "SELF" }],
    }),
    updateNotificationPreferences: builder.mutation<
      NotificationPreferenceItem[],
      UpdateNotificationPreferencesRequest
    >({
      query: (body) => ({ url: "/users/me/notification-preferences", method: "PUT", body }),
      invalidatesTags: [{ type: "NotificationPreferences", id: "SELF" }],
    }),
  }),
});

export const { useGetNotificationPreferencesQuery, useUpdateNotificationPreferencesMutation } =
  notificationPreferencesApi;
