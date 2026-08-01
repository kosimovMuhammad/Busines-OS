import { baseApi } from "./baseApi";
import type { User } from "@/types/api";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => "/users",
      providesTags: ["Users"],
    }),
  }),
});

export const { useGetUsersQuery } = usersApi;
