import { baseApi } from "./baseApi";
import type { ActivityLogEntry, Paginated } from "@/types/api";

export type ActivityLogQueryArgs = { page?: number; limit?: number };

export const activityLogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActivityLog: builder.query<Paginated<ActivityLogEntry>, ActivityLogQueryArgs>({
      query: (params) => ({ url: "/activity", params }),
      providesTags: [{ type: "ActivityLog", id: "LIST" }],
    }),
    getActivityLogByUser: builder.query<
      Paginated<ActivityLogEntry>,
      { userId: string } & ActivityLogQueryArgs
    >({
      query: ({ userId, ...params }) => ({ url: `/activity/user/${userId}`, params }),
      providesTags: (_result, _error, { userId }) => [{ type: "ActivityLog", id: `user-${userId}` }],
    }),
    getActivityLogByContact: builder.query<
      Paginated<ActivityLogEntry>,
      { contactId: string } & ActivityLogQueryArgs
    >({
      query: ({ contactId, ...params }) => ({ url: `/activity/contact/${contactId}`, params }),
      providesTags: (_result, _error, { contactId }) => [
        { type: "ActivityLog", id: `contact-${contactId}` },
      ],
    }),
    getActivityLogByDeal: builder.query<
      Paginated<ActivityLogEntry>,
      { dealId: string } & ActivityLogQueryArgs
    >({
      query: ({ dealId, ...params }) => ({ url: `/activity/deal/${dealId}`, params }),
      providesTags: (_result, _error, { dealId }) => [{ type: "ActivityLog", id: `deal-${dealId}` }],
    }),
    getActivityLogByTask: builder.query<
      Paginated<ActivityLogEntry>,
      { taskId: string } & ActivityLogQueryArgs
    >({
      query: ({ taskId, ...params }) => ({ url: `/activity/task/${taskId}`, params }),
      providesTags: (_result, _error, { taskId }) => [{ type: "ActivityLog", id: `task-${taskId}` }],
    }),
  }),
});

export const {
  useGetActivityLogQuery,
  useGetActivityLogByUserQuery,
  useGetActivityLogByContactQuery,
  useGetActivityLogByDealQuery,
  useGetActivityLogByTaskQuery,
} = activityLogApi;
