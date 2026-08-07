import { baseApi } from "./baseApi";
import type { Session } from "@/types/api";

export const sessionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSessions: builder.query<Session[], void>({
      query: () => "/sessions",
      providesTags: (result) =>
        result
          ? [
              ...result.map((s) => ({ type: "Sessions" as const, id: s.id })),
              { type: "Sessions" as const, id: "LIST" },
            ]
          : [{ type: "Sessions" as const, id: "LIST" }],
    }),
    revokeSession: builder.mutation<void, string>({
      query: (id) => ({ url: `/sessions/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Sessions", id: "LIST" }],
    }),
    logoutAllSessions: builder.mutation<void, void>({
      query: () => ({ url: "/sessions/logout-all", method: "DELETE" }),
      invalidatesTags: [{ type: "Sessions", id: "LIST" }],
    }),
  }),
});

export const { useGetSessionsQuery, useRevokeSessionMutation, useLogoutAllSessionsMutation } =
  sessionsApi;
