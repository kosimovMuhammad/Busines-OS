import { baseApi } from "./baseApi";
import type {
  CreateReportRequest,
  CustomersReport,
  EmployeePerformanceArgs,
  EmployeePerformanceEntry,
  ReportDateRangeArgs,
  ReportRunResult,
  RevenueReport,
  RevenueReportArgs,
  SalesReport,
  SavedReport,
  TasksReport,
} from "@/types/api";

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesReport: builder.query<SalesReport, ReportDateRangeArgs>({
      query: (params) => ({ url: "/reports/sales", params }),
    }),
    getRevenueReport: builder.query<RevenueReport, RevenueReportArgs>({
      query: (params) => ({ url: "/reports/revenue", params }),
    }),
    getTasksReport: builder.query<TasksReport, ReportDateRangeArgs>({
      query: (params) => ({ url: "/reports/tasks", params }),
    }),
    getCustomersReport: builder.query<CustomersReport, ReportDateRangeArgs>({
      query: (params) => ({ url: "/reports/customers", params }),
    }),
    getEmployeePerformanceReport: builder.query<
      EmployeePerformanceEntry[],
      EmployeePerformanceArgs
    >({
      query: (params) => ({ url: "/reports/employee-performance", params }),
    }),

    getSavedReports: builder.query<SavedReport[], void>({
      query: () => "/reports",
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({ type: "Reports" as const, id: r.id })),
              { type: "Reports" as const, id: "LIST" },
            ]
          : [{ type: "Reports" as const, id: "LIST" }],
    }),
    createReport: builder.mutation<SavedReport, CreateReportRequest>({
      query: (body) => ({ url: "/reports", method: "POST", body }),
      invalidatesTags: [{ type: "Reports", id: "LIST" }],
    }),
    removeReport: builder.mutation<void, string>({
      query: (id) => ({ url: `/reports/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Reports", id: "LIST" }],
    }),
    runReport: builder.query<ReportRunResult, string>({
      query: (id) => `/reports/${id}/run`,
      providesTags: (_result, _error, id) => [{ type: "Reports", id: `${id}-RUN` }],
    }),
  }),
});

export const {
  useGetSalesReportQuery,
  useGetRevenueReportQuery,
  useGetTasksReportQuery,
  useGetCustomersReportQuery,
  useGetEmployeePerformanceReportQuery,
  useGetSavedReportsQuery,
  useCreateReportMutation,
  useRemoveReportMutation,
  useRunReportQuery,
} = reportsApi;
