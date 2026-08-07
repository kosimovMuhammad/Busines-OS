import { baseApi } from "./baseApi";
import type {
  CreateTemplateRequest,
  Template,
  UpdateTemplateRequest,
} from "@/types/api";
import type { TemplateType } from "@/types/enums";

export type TemplatesQueryArgs = { type?: TemplateType; isActive?: boolean };

export const templatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTemplates: builder.query<Template[], TemplatesQueryArgs | void>({
      query: (params) => ({ url: "/templates", params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({ type: "Templates" as const, id: t.id })),
              { type: "Templates" as const, id: "LIST" },
            ]
          : [{ type: "Templates" as const, id: "LIST" }],
    }),
    getTemplate: builder.query<Template, string>({
      query: (id) => `/templates/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Templates", id }],
    }),
    createTemplate: builder.mutation<Template, CreateTemplateRequest>({
      query: (body) => ({ url: "/templates", method: "POST", body }),
      invalidatesTags: [{ type: "Templates", id: "LIST" }],
    }),
    updateTemplate: builder.mutation<Template, { id: string; body: UpdateTemplateRequest }>({
      query: ({ id, body }) => ({ url: `/templates/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Templates", id },
        { type: "Templates", id: "LIST" },
      ],
    }),
    removeTemplate: builder.mutation<void, string>({
      query: (id) => ({ url: `/templates/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Templates", id: "LIST" }],
    }),
  }),
});

export const {
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useRemoveTemplateMutation,
} = templatesApi;
