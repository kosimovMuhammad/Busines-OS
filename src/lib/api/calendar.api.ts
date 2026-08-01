import { baseApi } from "./baseApi";
import type {
  CalendarConnectionStatus,
  CalendarConnectResponse,
  CreateMeetingRequest,
  Meeting,
  UpdateMeetingRequest,
  UpdateMeetingStatusRequest,
} from "@/types/api";

export type MeetingsQueryArgs = {
  from?: string;
  to?: string;
  contactId?: string;
  dealId?: string;
  organizerId?: string;
};

export const calendarApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMeetings: builder.query<Meeting[], MeetingsQueryArgs | void>({
      query: (params) => ({ url: "/meetings", params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((m) => ({ type: "Calendar" as const, id: m.id })),
              { type: "Calendar" as const, id: "LIST" },
            ]
          : [{ type: "Calendar" as const, id: "LIST" }],
    }),
    getMeeting: builder.query<Meeting, string>({
      query: (id) => `/meetings/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Calendar", id }],
    }),
    createMeeting: builder.mutation<Meeting, CreateMeetingRequest>({
      query: (body) => ({ url: "/meetings", method: "POST", body }),
      invalidatesTags: [{ type: "Calendar", id: "LIST" }, "Analytics"],
    }),
    updateMeeting: builder.mutation<Meeting, { id: string; body: UpdateMeetingRequest }>({
      query: ({ id, body }) => ({ url: `/meetings/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Calendar", id },
        { type: "Calendar", id: "LIST" },
        "Analytics",
      ],
    }),
    updateMeetingStatus: builder.mutation<
      Meeting,
      { id: string; body: UpdateMeetingStatusRequest }
    >({
      query: ({ id, body }) => ({ url: `/meetings/${id}/status`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Calendar", id },
        { type: "Calendar", id: "LIST" },
        "Analytics",
      ],
    }),
    removeMeeting: builder.mutation<void, string>({
      query: (id) => ({ url: `/meetings/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Calendar", id: "LIST" }, "Analytics"],
    }),

    getCalendarStatus: builder.query<CalendarConnectionStatus, void>({
      query: () => "/calendar/status",
      providesTags: ["Calendar"],
    }),
    connectGoogleCalendar: builder.mutation<CalendarConnectResponse, void>({
      query: () => "/calendar/connect/google",
    }),
    disconnectGoogleCalendar: builder.mutation<{ success: boolean }, void>({
      query: () => ({ url: "/calendar/disconnect", method: "POST" }),
      invalidatesTags: ["Calendar"],
    }),
  }),
});

export const {
  useGetMeetingsQuery,
  useGetMeetingQuery,
  useCreateMeetingMutation,
  useUpdateMeetingMutation,
  useUpdateMeetingStatusMutation,
  useRemoveMeetingMutation,
  useGetCalendarStatusQuery,
  useConnectGoogleCalendarMutation,
  useDisconnectGoogleCalendarMutation,
} = calendarApi;
