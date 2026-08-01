import { baseApi } from "./baseApi";
import type {
  ConfirmFileRequest,
  FileAsset,
  PresignUploadRequest,
  PresignUploadResponse,
} from "@/types/api";

export type FilesQueryArgs = {
  contactId?: string;
  dealId?: string;
  invoiceId?: string;
};

export const filesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFiles: builder.query<FileAsset[], FilesQueryArgs | void>({
      query: (params) => ({ url: "/files", params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((f) => ({ type: "Files" as const, id: f.id })),
              { type: "Files" as const, id: "LIST" },
            ]
          : [{ type: "Files" as const, id: "LIST" }],
    }),
    presignUpload: builder.mutation<PresignUploadResponse, PresignUploadRequest>({
      query: (body) => ({ url: "/files/presign", method: "POST", body }),
    }),
    confirmFile: builder.mutation<FileAsset, ConfirmFileRequest>({
      query: (body) => ({ url: "/files", method: "POST", body }),
      invalidatesTags: [{ type: "Files", id: "LIST" }],
    }),
    removeFile: builder.mutation<void, string>({
      query: (id) => ({ url: `/files/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Files", id: "LIST" }],
    }),
  }),
});

export const {
  useGetFilesQuery,
  usePresignUploadMutation,
  useConfirmFileMutation,
  useRemoveFileMutation,
} = filesApi;
