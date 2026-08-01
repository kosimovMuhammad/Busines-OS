import { baseApi } from "./baseApi";
import type { CreateDealRequest, Deal, UpdateDealRequest } from "@/types/api";
import type { DealStage } from "@/types/enums";

export type DealsQueryArgs = {
  stage?: DealStage;
  ownerId?: string;
};

// The API serializes decimal fields (e.g. `value`) as strings; coerce to
// number here so every consumer works with real numbers.
function normalizeDeal(deal: Deal): Deal {
  return { ...deal, value: Number(deal.value) };
}

export const dealsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeals: builder.query<Deal[], DealsQueryArgs | void>({
      query: (params) => ({ url: "/deals", params: params ?? undefined }),
      transformResponse: (response: Deal[]) => response.map(normalizeDeal),
      providesTags: (result) =>
        result
          ? [
              ...result.map((d) => ({ type: "Deals" as const, id: d.id })),
              { type: "Deals" as const, id: "LIST" },
            ]
          : [{ type: "Deals" as const, id: "LIST" }],
    }),
    getDeal: builder.query<Deal, string>({
      query: (id) => `/deals/${id}`,
      transformResponse: normalizeDeal,
      providesTags: (_result, _error, id) => [{ type: "Deals", id }],
    }),
    createDeal: builder.mutation<Deal, CreateDealRequest>({
      query: (body) => ({ url: "/deals", method: "POST", body }),
      transformResponse: normalizeDeal,
      invalidatesTags: [{ type: "Deals", id: "LIST" }],
    }),
    updateDeal: builder.mutation<Deal, { id: string; body: UpdateDealRequest }>({
      query: ({ id, body }) => ({ url: `/deals/${id}`, method: "PATCH", body }),
      transformResponse: normalizeDeal,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Deals", id },
        { type: "Deals", id: "LIST" },
      ],
    }),
    updateDealStage: builder.mutation<Deal, { id: string; stage: DealStage }>({
      query: ({ id, stage }) => ({
        url: `/deals/${id}/stage`,
        method: "PATCH",
        body: { stage },
      }),
      transformResponse: normalizeDeal,
      // Optimistic per TZ §8.3 (drag-and-drop should feel instant); roll
      // back the board's cached list if the request fails.
      onQueryStarted: async ({ id, stage }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          dealsApi.util.updateQueryData("getDeals", undefined, (draft) => {
            const deal = draft.find((d) => d.id === id);
            if (deal) deal.stage = stage;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Deals", id },
        { type: "Deals", id: "LIST" },
      ],
    }),
    removeDeal: builder.mutation<void, string>({
      query: (id) => ({ url: `/deals/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Deals", id: "LIST" }],
    }),
  }),
});

export const {
  useGetDealsQuery,
  useGetDealQuery,
  useCreateDealMutation,
  useUpdateDealMutation,
  useUpdateDealStageMutation,
  useRemoveDealMutation,
} = dealsApi;
