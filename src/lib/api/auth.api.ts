import { baseApi } from "./baseApi";
import type {
  AuthResponse,
  LoginRequest,
  LoginWithCodeRequest,
  RegisterRequest,
  RegistrationPendingResponse,
  ResendInviteCodeRequest,
  ResendVerificationRequest,
  VerifyEmailRequest,
} from "@/types/api";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<RegistrationPendingResponse, RegisterRequest>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    verifyEmail: builder.mutation<AuthResponse, VerifyEmailRequest>({
      query: (body) => ({ url: "/auth/verify-email", method: "POST", body }),
    }),
    resendVerification: builder.mutation<
      RegistrationPendingResponse,
      ResendVerificationRequest
    >({
      query: (body) => ({ url: "/auth/resend-verification", method: "POST", body }),
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    loginWithCode: builder.mutation<AuthResponse, LoginWithCodeRequest>({
      query: (body) => ({ url: "/auth/login-code", method: "POST", body }),
    }),
    resendInviteCode: builder.mutation<void, ResendInviteCodeRequest>({
      query: (body) => ({ url: "/auth/resend-invite-code", method: "POST", body }),
    }),
    refresh: builder.mutation<AuthResponse, void>({
      query: () => ({ url: "/auth/refresh", method: "POST" }),
    }),
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
    logoutAll: builder.mutation<{ success: boolean }, void>({
      query: () => ({ url: "/auth/logout-all", method: "POST" }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useLoginMutation,
  useLoginWithCodeMutation,
  useResendInviteCodeMutation,
  useRefreshMutation,
  useLogoutMutation,
  useLogoutAllMutation,
} = authApi;
