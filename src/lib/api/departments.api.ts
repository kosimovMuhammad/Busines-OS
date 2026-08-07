import { baseApi } from "./baseApi";
import type {
  CreateDepartmentRequest,
  Department,
  DepartmentTreeNode,
  UpdateDepartmentRequest,
} from "@/types/api";

export const departmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDepartments: builder.query<Department[], void>({
      query: () => ({ url: "/departments", params: { flat: true } }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((d) => ({ type: "Departments" as const, id: d.id })),
              { type: "Departments" as const, id: "LIST" },
            ]
          : [{ type: "Departments" as const, id: "LIST" }],
    }),
    getDepartmentTree: builder.query<DepartmentTreeNode[], void>({
      query: () => ({ url: "/departments", params: { flat: false } }),
      providesTags: [{ type: "Departments", id: "TREE" }],
    }),
    getDepartment: builder.query<Department, string>({
      query: (id) => `/departments/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Departments", id }],
    }),
    createDepartment: builder.mutation<Department, CreateDepartmentRequest>({
      query: (body) => ({ url: "/departments", method: "POST", body }),
      invalidatesTags: [
        { type: "Departments", id: "LIST" },
        { type: "Departments", id: "TREE" },
        { type: "OrgChart", id: "FULL" },
      ],
    }),
    updateDepartment: builder.mutation<
      Department,
      { id: string; body: UpdateDepartmentRequest }
    >({
      query: ({ id, body }) => ({
        url: `/departments/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Departments", id },
        { type: "Departments", id: "LIST" },
        { type: "Departments", id: "TREE" },
        { type: "OrgChart", id: "FULL" },
      ],
    }),
    removeDepartment: builder.mutation<void, string>({
      query: (id) => ({ url: `/departments/${id}`, method: "DELETE" }),
      invalidatesTags: [
        { type: "Departments", id: "LIST" },
        { type: "Departments", id: "TREE" },
        { type: "OrgChart", id: "FULL" },
      ],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useGetDepartmentTreeQuery,
  useGetDepartmentQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useRemoveDepartmentMutation,
} = departmentsApi;
