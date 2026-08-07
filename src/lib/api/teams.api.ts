import { baseApi } from "./baseApi";
import type {
  AddTeamMemberRequest,
  CreateTeamRequest,
  Team,
  TeamMember,
  UpdateTeamRequest,
} from "@/types/api";

export const teamsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeams: builder.query<Team[], void>({
      query: () => "/teams",
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({ type: "Teams" as const, id: t.id })),
              { type: "Teams" as const, id: "LIST" },
            ]
          : [{ type: "Teams" as const, id: "LIST" }],
    }),
    getTeam: builder.query<Team, string>({
      query: (id) => `/teams/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Teams", id }],
    }),
    createTeam: builder.mutation<Team, CreateTeamRequest>({
      query: (body) => ({ url: "/teams", method: "POST", body }),
      invalidatesTags: [{ type: "Teams", id: "LIST" }],
    }),
    updateTeam: builder.mutation<Team, { id: string; body: UpdateTeamRequest }>({
      query: ({ id, body }) => ({ url: `/teams/${id}`, method: "PUT", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Teams", id },
        { type: "Teams", id: "LIST" },
      ],
    }),
    removeTeam: builder.mutation<void, string>({
      query: (id) => ({ url: `/teams/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Teams", id: "LIST" }],
    }),
    getTeamMembers: builder.query<TeamMember[], string>({
      query: (id) => `/teams/${id}/members`,
      providesTags: (_result, _error, id) => [{ type: "Teams", id: `${id}-MEMBERS` }],
    }),
    addTeamMember: builder.mutation<
      TeamMember,
      { id: string; body: AddTeamMemberRequest }
    >({
      query: ({ id, body }) => ({
        url: `/teams/${id}/members`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Teams", id: `${id}-MEMBERS` },
        { type: "OrgChart", id: "FULL" },
      ],
    }),
    removeTeamMember: builder.mutation<void, { id: string; userId: string }>({
      query: ({ id, userId }) => ({
        url: `/teams/${id}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Teams", id: `${id}-MEMBERS` },
        { type: "OrgChart", id: "FULL" },
      ],
    }),
  }),
});

export const {
  useGetTeamsQuery,
  useGetTeamQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useRemoveTeamMutation,
  useGetTeamMembersQuery,
  useAddTeamMemberMutation,
  useRemoveTeamMemberMutation,
} = teamsApi;
