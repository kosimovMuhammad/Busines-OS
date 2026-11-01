import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";
import { clearAuth, setCredentials } from "@/store/authSlice";
import type { AuthResponse } from "@/types/api";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Endpoints that are part of the unauthenticated auth flow itself. A 401/400/422 from
// one of these means "wrong password" / "wrong or expired code" - it should
// surface as a normal inline error, never trigger a refresh attempt or a redirect (there is
// no session to refresh, and redirecting off e.g. the verify-email screen on a wrong code
// is exactly the "flash and reload instead of an inline error" bug this guards against).
const AUTH_FLOW_ENDPOINTS = new Set([
  "login",
  "loginWithCode",
  "resendInviteCode",
  "register",
  "verifyEmail",
  "resendVerification",
  "refresh",
]);

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const hadSession = !!(api.getState() as RootState).auth.accessToken;
  let result = await rawBaseQuery(args, api, extraOptions);

  const shouldAttemptReauth =
    result.error?.status === 401 &&
    hadSession &&
    !AUTH_FLOW_ENDPOINTS.has(api.endpoint);

  if (shouldAttemptReauth) {
    const refreshResult = await rawBaseQuery(
      { url: "/auth/refresh", method: "POST" },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      api.dispatch(setCredentials(refreshResult.data as AuthResponse));
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearAuth());
      if (typeof window !== "undefined") {
        window.location.assign("/login");
      }
    }
  }

return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth",
    "Users",
    "Contacts",
    "Deals",
    "Tasks",
    "Communications",
    "WhatsApp",
    "Telegram",
    "TelegramChatLinks",
    "Instagram",
    "InstagramConversationLinks",
    "Email",
    "AI",
    "Files",
    "Company",
    "CompanyFeatures",
    "Invoicing",
    "Calendar",
    "Analytics",
    "Roles",
    "Permissions",
    "Departments",
    "Teams",
    "Branches",
    "OrgChart",
    "ActivityLog",
    "AuditLog",
    "Sessions",
    "ApiKeys",
    "Notifications",
    "NotificationPreferences",
    "Contracts",
    "Templates",
    "Reports",
    "Workflows",
    "Webhooks",
    "Subscription",
    "Categories",
    "Products",
    "Suppliers",
    "PurchaseOrders",
    "Inventory",
    "Expenses",
  ],
  endpoints: () => ({}),
});
