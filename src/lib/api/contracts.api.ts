import { baseApi } from "./baseApi";
import type {
  Contract,
  ContractsQueryArgs,
  CreateContractRequest,
  Paginated,
  UpdateContractRequest,
} from "@/types/api";

export const contractsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContracts: builder.query<Paginated<Contract>, ContractsQueryArgs>({
      query: (params) => ({ url: "/contracts", params }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((c) => ({ type: "Contracts" as const, id: c.id })),
              { type: "Contracts" as const, id: "LIST" },
            ]
          : [{ type: "Contracts" as const, id: "LIST" }],
    }),
    getContract: builder.query<Contract, string>({
      query: (id) => `/contracts/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Contracts", id }],
    }),
    createContract: builder.mutation<Contract, CreateContractRequest>({
      query: (body) => ({ url: "/contracts", method: "POST", body }),
      invalidatesTags: [{ type: "Contracts", id: "LIST" }],
    }),
    updateContract: builder.mutation<Contract, { id: string; body: UpdateContractRequest }>({
      query: ({ id, body }) => ({ url: `/contracts/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Contracts", id },
        { type: "Contracts", id: "LIST" },
      ],
    }),
    removeContract: builder.mutation<void, string>({
      query: (id) => ({ url: `/contracts/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Contracts", id: "LIST" }],
    }),
    signContract: builder.mutation<Contract, string>({
      query: (id) => ({ url: `/contracts/${id}/sign`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Contracts", id },
        { type: "Contracts", id: "LIST" },
      ],
    }),
    archiveContract: builder.mutation<void, string>({
      query: (id) => ({ url: `/contracts/${id}/archive`, method: "PATCH" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Contracts", id },
        { type: "Contracts", id: "LIST" },
      ],
    }),
    restoreContract: builder.mutation<void, string>({
      query: (id) => ({ url: `/contracts/${id}/restore`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Contracts", id },
        { type: "Contracts", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetContractsQuery,
  useGetContractQuery,
  useCreateContractMutation,
  useUpdateContractMutation,
  useRemoveContractMutation,
  useSignContractMutation,
  useArchiveContractMutation,
  useRestoreContractMutation,
} = contractsApi;
