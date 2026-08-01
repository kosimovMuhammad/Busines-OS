import { baseApi } from "./baseApi";
import type {
  ActiveTimeEntry,
  CreateTaskRequest,
  Task,
  TimeEntry,
  UpdateTaskRequest,
} from "@/types/api";
import type { TaskStatus } from "@/types/enums";

export type TasksQueryArgs = {
  status?: TaskStatus;
  assignedTo?: string;
  dealId?: string;
  contactId?: string;
};

// GET /tasks/time/active returns 200 with an empty body when there is no
// active timer - fetchBaseQuery's default JSON parsing throws on that.
const parseNullableJson = async (response: Response) => {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], TasksQueryArgs | void>({
      query: (params) => ({ url: "/tasks", params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({ type: "Tasks" as const, id: t.id })),
              { type: "Tasks" as const, id: "LIST" },
            ]
          : [{ type: "Tasks" as const, id: "LIST" }],
    }),
    getTask: builder.query<Task, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Tasks", id }],
    }),
    createTask: builder.mutation<Task, CreateTaskRequest>({
      query: (body) => ({ url: "/tasks", method: "POST", body }),
      invalidatesTags: [{ type: "Tasks", id: "LIST" }],
    }),
    updateTask: builder.mutation<Task, { id: string; body: UpdateTaskRequest }>({
      query: ({ id, body }) => ({ url: `/tasks/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Tasks", id },
        { type: "Tasks", id: "LIST" },
      ],
    }),
    updateTaskStatus: builder.mutation<Task, { id: string; status: TaskStatus }>({
      query: ({ id, status }) => ({
        url: `/tasks/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Tasks", id },
        { type: "Tasks", id: "LIST" },
      ],
    }),
    removeTask: builder.mutation<void, string>({
      query: (id) => ({ url: `/tasks/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Tasks", id: "LIST" }],
    }),

    getActiveTimeEntry: builder.query<ActiveTimeEntry | null, void>({
      query: () => ({ url: "/tasks/time/active", responseHandler: parseNullableJson }),
      providesTags: [{ type: "Tasks", id: "ACTIVE_TIMER" }],
    }),
    startTimer: builder.mutation<TimeEntry, string>({
      query: (taskId) => ({ url: `/tasks/${taskId}/time/start`, method: "POST" }),
      invalidatesTags: (_result, _error, taskId) => [
        { type: "Tasks", id: "ACTIVE_TIMER" },
        { type: "Tasks", id: taskId },
        { type: "Tasks", id: "LIST" },
        { type: "Tasks", id: `TIME_${taskId}` },
      ],
    }),
    stopTimer: builder.mutation<TimeEntry, string>({
      query: (taskId) => ({ url: `/tasks/${taskId}/time/stop`, method: "POST" }),
      invalidatesTags: (_result, _error, taskId) => [
        { type: "Tasks", id: "ACTIVE_TIMER" },
        { type: "Tasks", id: taskId },
        { type: "Tasks", id: "LIST" },
        { type: "Tasks", id: `TIME_${taskId}` },
      ],
    }),
    getTaskTimeEntries: builder.query<TimeEntry[], string>({
      query: (taskId) => `/tasks/${taskId}/time`,
      providesTags: (_result, _error, taskId) => [
        { type: "Tasks", id: `TIME_${taskId}` },
      ],
    }),
    removeTimeEntry: builder.mutation<void, { taskId: string; entryId: string }>({
      query: ({ taskId, entryId }) => ({
        url: `/tasks/${taskId}/time/${entryId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: "Tasks", id: `TIME_${taskId}` },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useRemoveTaskMutation,
  useGetActiveTimeEntryQuery,
  useStartTimerMutation,
  useStopTimerMutation,
  useGetTaskTimeEntriesQuery,
  useRemoveTimeEntryMutation,
} = tasksApi;
