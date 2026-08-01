import { baseApi } from "./baseApi";
import type {
  ActivityFeedItem,
  DashboardOverview,
  FinanceAnalytics,
  ForecastAnalytics,
  RevenueAnalytics,
  SalesAnalytics,
  TaskAnalytics,
  UpcomingMeeting,
} from "@/types/api";

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOverview: builder.query<DashboardOverview, void>({
      query: () => "/dashboard",
      providesTags: ["Analytics"],
    }),
    getSalesAnalytics: builder.query<SalesAnalytics, void>({
      query: () => "/dashboard/sales",
      providesTags: ["Analytics"],
    }),
    getRevenueAnalytics: builder.query<RevenueAnalytics, void>({
      query: () => "/dashboard/revenue",
      providesTags: ["Analytics"],
    }),
    getTaskAnalytics: builder.query<TaskAnalytics, void>({
      query: () => "/dashboard/tasks",
      providesTags: ["Analytics"],
    }),
    getActivityFeed: builder.query<ActivityFeedItem[], void>({
      query: () => "/dashboard/activity-feed",
      providesTags: ["Analytics"],
    }),
    getFinanceAnalytics: builder.query<FinanceAnalytics, void>({
      query: () => "/dashboard/finance",
      providesTags: ["Analytics"],
    }),
    getUpcomingMeetings: builder.query<UpcomingMeeting[], void>({
      query: () => "/dashboard/upcoming-meetings",
      providesTags: ["Analytics"],
    }),
    getForecast: builder.query<ForecastAnalytics, void>({
      query: () => "/dashboard/forecast",
      providesTags: ["Analytics"],
    }),
  }),
});

export const {
  useGetDashboardOverviewQuery,
  useGetSalesAnalyticsQuery,
  useGetRevenueAnalyticsQuery,
  useGetTaskAnalyticsQuery,
  useGetActivityFeedQuery,
  useGetFinanceAnalyticsQuery,
  useGetUpcomingMeetingsQuery,
  useGetForecastQuery,
} = analyticsApi;
