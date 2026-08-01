import { isRejectedWithValue, type Middleware } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { messageForStatus } from "@/lib/errorMessages";

// auth.api.ts endpoints already show their own inline error messages
// (e.g. "invalid credentials" on the login form) - don't double-toast them.
// 401 is also excluded: it's either a silent background refresh attempt
// (bootstrap/reauth) or already followed by a redirect to /login, neither
// of which needs a toast.
const SILENT_ENDPOINTS = new Set(["login", "register", "refresh", "logout"]);

export const errorToastMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const endpointName = (action as { meta?: { arg?: { endpointName?: string } } })
      .meta?.arg?.endpointName;
    const status = (action.payload as { status?: number | string })?.status;

    if (!(endpointName && SILENT_ENDPOINTS.has(endpointName)) && status !== 401) {
      toast.error(messageForStatus(status));
    }
  }

  return next(action);
};
