import { baseApi } from "./baseApi";
import type {
  CreateExpenseRequest,
  Expense,
  ExpensesQueryArgs,
  Paginated,
  UpdateExpenseRequest,
} from "@/types/api";

export const expensesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query<Paginated<Expense>, ExpensesQueryArgs | void>({
      query: (args) => ({ url: "/expenses", params: args ?? undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((e) => ({ type: "Expenses" as const, id: e.id })),
              { type: "Expenses" as const, id: "LIST" },
            ]
          : [{ type: "Expenses" as const, id: "LIST" }],
    }),
    createExpense: builder.mutation<Expense, CreateExpenseRequest>({
      query: (body) => ({ url: "/expenses", method: "POST", body }),
      invalidatesTags: [{ type: "Expenses", id: "LIST" }],
    }),
    updateExpense: builder.mutation<Expense, { id: string; body: UpdateExpenseRequest }>({
      query: ({ id, body }) => ({ url: `/expenses/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Expenses", id },
        { type: "Expenses", id: "LIST" },
      ],
    }),
    removeExpense: builder.mutation<void, string>({
      query: (id) => ({ url: `/expenses/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Expenses", id: "LIST" }],
    }),
    archiveExpense: builder.mutation<void, string>({
      query: (id) => ({ url: `/expenses/${id}/archive`, method: "PATCH" }),
      invalidatesTags: [{ type: "Expenses", id: "LIST" }],
    }),
    restoreExpense: builder.mutation<void, string>({
      query: (id) => ({ url: `/expenses/${id}/restore`, method: "POST" }),
      invalidatesTags: [{ type: "Expenses", id: "LIST" }],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useRemoveExpenseMutation,
  useArchiveExpenseMutation,
  useRestoreExpenseMutation,
} = expensesApi;
