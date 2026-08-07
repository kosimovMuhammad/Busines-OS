import { baseApi } from "./baseApi";
import type {
  CreateWorkflowRequest,
  Paginated,
  UpdateWorkflowRequest,
  Workflow,
  WorkflowExecution,
  WorkflowExecutionsArgs,
  WorkflowSummary,
} from "@/types/api";

export const workflowsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWorkflows: builder.query<WorkflowSummary[], void>({
      query: () => "/workflows",
      providesTags: (result) =>
        result
          ? [
              ...result.map((w) => ({ type: "Workflows" as const, id: w.id })),
              { type: "Workflows" as const, id: "LIST" },
            ]
          : [{ type: "Workflows" as const, id: "LIST" }],
    }),
    getWorkflow: builder.query<Workflow, string>({
      query: (id) => `/workflows/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Workflows", id }],
    }),
    createWorkflow: builder.mutation<Workflow, CreateWorkflowRequest>({
      query: (body) => ({ url: "/workflows", method: "POST", body }),
      invalidatesTags: [{ type: "Workflows", id: "LIST" }],
    }),
    updateWorkflow: builder.mutation<Workflow, { id: string; body: UpdateWorkflowRequest }>({
      query: ({ id, body }) => ({ url: `/workflows/${id}`, method: "PUT", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Workflows", id },
        { type: "Workflows", id: "LIST" },
      ],
    }),
    removeWorkflow: builder.mutation<void, string>({
      query: (id) => ({ url: `/workflows/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Workflows", id: "LIST" }],
    }),
    toggleWorkflow: builder.mutation<Workflow, string>({
      query: (id) => ({ url: `/workflows/${id}/toggle`, method: "PATCH" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Workflows", id },
        { type: "Workflows", id: "LIST" },
      ],
    }),
    getWorkflowExecutions: builder.query<Paginated<WorkflowExecution>, WorkflowExecutionsArgs>({
      query: ({ id, ...params }) => ({ url: `/workflows/${id}/executions`, params }),
      providesTags: (_result, _error, { id }) => [{ type: "Workflows", id: `${id}-EXECUTIONS` }],
    }),
    getWorkflowExecution: builder.query<WorkflowExecution, { id: string; executionId: string }>({
      query: ({ id, executionId }) => `/workflows/${id}/executions/${executionId}`,
    }),
  }),
});

export const {
  useGetWorkflowsQuery,
  useGetWorkflowQuery,
  useCreateWorkflowMutation,
  useUpdateWorkflowMutation,
  useRemoveWorkflowMutation,
  useToggleWorkflowMutation,
  useGetWorkflowExecutionsQuery,
  useGetWorkflowExecutionQuery,
} = workflowsApi;
