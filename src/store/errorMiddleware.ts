import { isRejectedWithValue, type Middleware } from "@reduxjs/toolkit";
import { toast } from "sonner";
import {
  aiPlanRequiredMessage,
  aiUnavailableMessage,
  integrationUnavailableMessage,
  messageForStatus,
} from "@/lib/errorMessages";

// auth.api.ts endpoints already show their own inline error messages
// (e.g. "invalid credentials" on the login form) - don't double-toast them.
// 401 is also excluded: it's either a silent background refresh attempt
// (bootstrap/reauth) or already followed by a redirect to /login, neither
// of which needs a toast. presignUpload also shows its own calm
// "storage isn't set up yet" toast when S3 isn't configured (verified: a
// real 500 in this environment), rather than the generic error banner.
// presignProfileMedia (avatar/cover upload) follows the same pattern.
// sendWhatsappMessage/sendEmail are silenced here because the send panels
// show their own inline guidance banner for the verified 400 (no phone/
// no account connected) and 502 (provider rejected the send) responses.
// sendPlatformWhatsAppText/sendPlatformWhatsAppTemplate follow the same
// pattern: the platform-admin panel shows its own inline banner for the
// verified 403 (not a platform admin), 422 (validation), and 502 (Meta
// rejected the send) responses.
const SILENT_ENDPOINTS = new Set([
  "login",
  "register",
  "refresh",
  "logout",
  "presignUpload",
  "presignProfileMedia",
  "sendWhatsappMessage",
  "sendEmail",
  "sendPlatformWhatsAppText",
  "sendPlatformWhatsAppTemplate",
]);

// TZ §11 degraded-mode UX: these AI actions are gated behind a backend API
// key that isn't provisioned in every environment. Show the calm "AI
// features are being activated" message instead of a scary generic error
// - extend this set as more AI endpoints (F8) come online.
const AI_DEGRADED_ENDPOINTS = new Set(["summarize"]);

// Every ai.api.ts endpoint - all of /ai/* 403s when the company plan lacks
// ai_features. The AI UI proactively hides itself behind useAiFeatureEnabled
// (nav item, /ai page, AiSummaryBadge, composer stub), so a 403 reaching here
// means either a race (plan just changed in another tab) or stale client
// cache - show the specific "requires Pro plan" message rather than the
// generic "you don't have permission" one, since the real cause here is the
// company's plan, not the user's role/permissions.
const AI_PLAN_GATED_ENDPOINTS = new Set([
  "summarize",
  "aiQuery",
  "draftEmail",
  "generateQuotation",
  "getAiForecast",
  "sendAssistantMessage",
]);

// Same idea for third-party integrations whose credentials aren't
// configured in every environment - verified real 500 "MICROSOFT_CLIENT_ID/
// SECRET not configured" from GET /email/connect/outlook.
const INTEGRATION_DEGRADED_ENDPOINTS = new Set(["connectOutlook"]);

export const errorToastMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const endpointName = (action as { meta?: { arg?: { endpointName?: string } } })
      .meta?.arg?.endpointName;
    const status = (action.payload as { status?: number | string })?.status;

    if (endpointName && status === 403 && AI_PLAN_GATED_ENDPOINTS.has(endpointName)) {
      toast.error(aiPlanRequiredMessage());
    } else if (endpointName && AI_DEGRADED_ENDPOINTS.has(endpointName)) {
      toast.info(aiUnavailableMessage());
    } else if (endpointName && INTEGRATION_DEGRADED_ENDPOINTS.has(endpointName)) {
      toast.info(integrationUnavailableMessage());
    } else if (!(endpointName && SILENT_ENDPOINTS.has(endpointName)) && status !== 401) {
      toast.error(messageForStatus(status));
    }
  }

  return next(action);
};
