import { isRejectedWithValue, type Middleware } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { aiUnavailableMessage, messageForStatus } from "@/lib/errorMessages";

// auth.api.ts endpoints already show their own inline error messages
// (e.g. "invalid credentials" on the login form) - don't double-toast them.
// 401 is also excluded: it's either a silent background refresh attempt
// (bootstrap/reauth) or already followed by a redirect to /login, neither
// of which needs a toast. presignUpload also shows its own calm
// "storage isn't set up yet" toast when S3 isn't configured (verified: a
// real 500 in this environment), rather than the generic error banner.
const SILENT_ENDPOINTS = new Set(["login", "register", "refresh", "logout", "presignUpload"]);

// TZ §11 degraded-mode UX: these AI actions are gated behind a backend API
// key that isn't provisioned in every environment. Show the calm "AI
// features are being activated" message instead of a scary generic error
// - extend this set as more AI endpoints (F8) come online.
const AI_DEGRADED_ENDPOINTS = new Set(["summarize"]);

export const errorToastMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const endpointName = (action as { meta?: { arg?: { endpointName?: string } } })
      .meta?.arg?.endpointName;
    const status = (action.payload as { status?: number | string })?.status;

    if (endpointName && AI_DEGRADED_ENDPOINTS.has(endpointName)) {
      toast.info(aiUnavailableMessage());
    } else if (!(endpointName && SILENT_ENDPOINTS.has(endpointName)) && status !== 401) {
      toast.error(messageForStatus(status));
    }
  }

  return next(action);
};
