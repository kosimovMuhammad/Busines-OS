import { baseApi } from "./baseApi";
import type { AuditLogEntry, AuditLogQueryArgs, LoginHistoryEntry, Paginated } from "@/types/api";

export const auditLogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLog: builder.query<Paginated<AuditLogEntry>, AuditLogQueryArgs>({
      query: (params) => ({ url: "/audit", params }),
      providesTags: [{ type: "AuditLog", id: "LIST" }],
    }),
    getSecurityAuditLog: builder.query<Paginated<AuditLogEntry>, AuditLogQueryArgs>({
      query: (params) => ({ url: "/audit/security", params }),
      providesTags: [{ type: "AuditLog", id: "SECURITY" }],
    }),
    getPermissionHistory: builder.query<Paginated<AuditLogEntry>, AuditLogQueryArgs>({
      query: (params) => ({ url: "/audit/permission-history", params }),
      providesTags: [{ type: "AuditLog", id: "PERMISSIONS" }],
    }),
    getLoginHistory: builder.query<Paginated<LoginHistoryEntry>, { page?: number; limit?: number }>({
      query: (params) => ({ url: "/audit/login-history", params }),
      providesTags: [{ type: "AuditLog", id: "LOGIN" }],
    }),
  }),
});

export const {
  useGetAuditLogQuery,
  useGetSecurityAuditLogQuery,
  useGetPermissionHistoryQuery,
  useGetLoginHistoryQuery,
} = auditLogApi;
