"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useCompleteWhatsappSignupMutation,
  useLazyGetWhatsappSignupConfigQuery,
  useReportWhatsappSignupEventMutation,
  useTraceWhatsappSignupStepMutation,
} from "@/lib/api/whatsapp.api";
import { setWaTraceSink, waKeys, waTrace } from "@/lib/whatsapp-trace";
import type {
  WhatsappConnectResult,
  WhatsappSignupConfig,
  WhatsappSignupSession,
} from "@/types/api";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

const SDK_URL = "https://connect.facebook.net/en_US/sdk.js";
const SESSION_EVENT_GRACE_MS = 3000; // the code lives ~30 s; the server derives ids from the token anyway
const CONFIG_REFRESH_MS = 5 * 60 * 1000; // signed state is valid 10 min

// Our API errors arrive as RTK { status, data: { statusCode, error, message: { code, message } } }.
export function whatsappErrorCode(e: unknown): string {
  const code = (e as any)?.data?.message?.code ?? (e as any)?.message?.code;
  return typeof code === "string" ? code : "unknown";
}

let sdkPromise: Promise<void> | null = null;
function loadSdk(config: WhatsappSignupConfig): Promise<void> {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<void>((resolve, reject) => {
    const init = () => {
      waTrace("sdk.init", { appId: config.appId, version: config.graphVersion });
      window.FB.init({
        appId: config.appId,
        autoLogAppEvents: true,
        xfbml: true,
        version: config.graphVersion,
      });
      waTrace("sdk.loaded");
      resolve();
    };
    if (window.FB) {
      waTrace("sdk.already-present");
      init();
      return;
    }
    window.fbAsyncInit = init;
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.onerror = () => {
      waTrace("sdk.load-error", { url: SDK_URL });
      sdkPromise = null;
      script.remove();
      reject(new Error("sdk_load_failed"));
    };
    document.body.appendChild(script);
  });
  return sdkPromise;
}

export function useWhatsAppSignup(
  locale: string,
  onConnected: (result: WhatsappConnectResult) => void
) {
  const [busy, setBusy] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  // Server says Embedded Signup is switched off (WHATSAPP_EMBEDDED_SIGNUP_ENABLED=false / not set up).
  const [unavailable, setUnavailable] = useState(false);

  const [fetchConfig] = useLazyGetWhatsappSignupConfigQuery();
  const [completeSignup] = useCompleteWhatsappSignupMutation();
  const [reportEvent] = useReportWhatsappSignupEventMutation();
  const [traceStep] = useTraceWhatsappSignupStepMutation();
  useEffect(() => {
    setWaTraceSink((step, data) => {
      traceStep({ step, data }).catch(() => {});
    });
    return () => setWaTraceSink(null);
  }, [traceStep]);

  const config = useRef<WhatsappSignupConfig | null>(null);
  const session = useRef<WhatsappSignupSession | null>(null);
  const sdkReady = useRef(false);
  const busyRef = useRef(false);
  const eventHandled = useRef(false);
  const onConnectedRef = useRef(onConnected);
  useEffect(() => {
    onConnectedRef.current = onConnected;
  }, [onConnected]);

  const setBusyBoth = useCallback((v: boolean) => {
    busyRef.current = v;
    setBusy(v);
  }, []);

  // Fetched on mount (never inside the click: FB.login must run synchronously
  // in the click handler or popup blockers kill it) and refreshed every ~5 min.
  const refreshConfig = useCallback(async () => {
    try {
      const cfg = await fetchConfig(locale, false).unwrap();
      config.current = cfg;
      setUnavailable(false);
      waTrace("config.fetched", {
        appId: cfg.appId,
        configurationId: cfg.configurationId,
        graphVersion: cfg.graphVersion,
        signupVersion: cfg.signupVersion,
        statePresent: !!cfg.state,
        locale,
        origin: window.location.origin,
      });
      if (!sdkReady.current) {
        await loadSdk(cfg);
        sdkReady.current = true;
      }
      setReady(true);
    } catch (e) {
      waTrace("config.error", { message: e instanceof Error ? e.message : undefined, code: whatsappErrorCode(e) });
      if (whatsappErrorCode(e) === "not_configured") {
        setUnavailable(true);
        return;
      }
      setErrorCode(
        e instanceof Error && e.message === "sdk_load_failed" ? "sdk_load_failed" : whatsappErrorCode(e)
      );
    }
  }, [fetchConfig, locale]);

  useEffect(() => {
    const first = setTimeout(refreshConfig, 0);
    const t = setInterval(refreshConfig, CONFIG_REFRESH_MS);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [refreshConfig]);

  // WA_EMBEDDED_SIGNUP session events from the Meta popup.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!event.origin.endsWith("facebook.com")) return;
      let msg: any;
      try {
        msg = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        // Safe preview: truncated, with anything code/token/secret-like redacted.
        const raw = typeof event.data === "string" ? event.data : "";
        const preview = raw
          .replace(/((?:code|token|access_token|secret|signed_request)["'=:\s]+)[^&"'\s,}]+/gi, "$1[redacted]")
          .slice(0, 300);
        waTrace("message.unparsable", {
          origin: event.origin,
          dataType: typeof event.data,
          length: raw.length,
          preview,
        });
        return;
      }
      waTrace("message", {
        origin: event.origin,
        type: msg?.type,
        event: msg?.event,
        dataKeys: waKeys(msg?.data),
        step: msg?.data?.current_step,
        errorCode: msg?.data?.error_code,
        sessionId: msg?.data?.session_id,
        phoneNumberIdPresent: !!msg?.data?.phone_number_id,
        wabaIdPresent: !!msg?.data?.waba_id,
        isOnBizApp: msg?.data?.is_on_biz_app,
      });
      if (msg?.type !== "WA_EMBEDDED_SIGNUP") return;
      const d = msg.data ?? {};

      if (msg.event === "CANCEL" || msg.event === "ERROR") {
        session.current = null;
        eventHandled.current = true;
        waTrace("client-event.report", { event: msg.event, step: d.current_step, errorCode: d.error_code });
        reportEvent({
          event: msg.event,
          currentStep: d.current_step,
          errorCode: d.error_code != null ? String(d.error_code) : undefined,
          errorMessage: d.error_message,
          sessionId: d.session_id,
        })
          .unwrap()
          .then(
            (r) => {
              waTrace("client-event.result", { code: r.code });
              setErrorCode(r.code);
            },
            () => {
              waTrace("client-event.failed");
              setErrorCode(msg.event === "CANCEL" ? "cancelled" : "unknown");
            }
          )
          .finally(() => {
            setBusyBoth(false);
            refreshConfig(); // state is single-purpose
          });
        return;
      }

      session.current = {
        event: msg.event, // FINISH | FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING | FINISH_ONLY_WABA | FINISH_GRANT_ONLY_API_ACCESS
        phoneNumberId: d.phone_number_id,
        wabaId: d.waba_id,
        messagingAccountIds: d.messaging_account_ids,
        businessId: d.business_id,
        isOnBizApp: d.is_on_biz_app,
      };
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [reportEvent, refreshConfig, setBusyBoth]);

  const complete = useCallback(
    async (code: string, cfg: WhatsappSignupConfig) => {
      // Give the FINISH* event a moment to arrive, but never let the ~30 s code run out.
      const started = Date.now();
      while (!session.current && Date.now() - started < SESSION_EVENT_GRACE_MS) {
        await new Promise((r) => setTimeout(r, 100));
      }
      waTrace("complete.request", {
        codePresent: true,
        sessionEvent: session.current?.event ?? null,
        waitedMs: Date.now() - started,
      });
      const hadSessionEvent = !!session.current;
      try {
        const result = await completeSignup({
          code,
          state: cfg.state,
          session: session.current ?? undefined,
        }).unwrap();
        waTrace("complete.ok", { accountId: result.account?.id, issues: result.issues });
        onConnectedRef.current(result);
      } catch (e) {
        const errCode = whatsappErrorCode(e);
        waTrace("complete.error", { code: errCode, httpStatus: (e as any)?.status });
        // A code Meta refuses to exchange AND no WA_EMBEDDED_SIGNUP event = the popup took the
        // plain "Continue as <user>" login path and never showed the WhatsApp screens.
        setErrorCode(
          errCode === "code_exchange_failed" && !hadSessionEvent ? "continue_as_not_supported" : errCode
        );
      } finally {
        session.current = null;
        setBusyBoth(false);
        refreshConfig();
      }
    },
    [completeSignup, refreshConfig, setBusyBoth]
  );

  // Call directly from onClick - no await before FB.login.
  const connect = useCallback(() => {
    const cfg = config.current;
    if (!cfg || !window.FB) {
      waTrace("connect.blocked", { configLoaded: !!cfg, sdkPresent: !!window.FB });
      setErrorCode("sdk_load_failed");
      return;
    }
    setErrorCode(null);
    setBusyBoth(true);
    session.current = null;
    eventHandled.current = false;

    const loginOptions = {
      config_id: cfg.configurationId,
      response_type: "code",
      override_default_response_type: true,
      // v5: WhatsApp Business app onboarding (Coexistence) is on by default.
      extras: { setup: {}, version: cfg.signupVersion },
    };
    waTrace("fb.login.call", { options: loginOptions });

    window.FB.login(
      (response: any) => {
        const code = response?.authResponse?.code;
        waTrace("fb.login.response", {
          status: response?.status ?? null,
          hasAuthResponse: !!response?.authResponse,
          authResponseKeys: waKeys(response?.authResponse),
          codePresent: !!code,
          responseKeys: waKeys(response),
        });
        if (code) {
          complete(code, cfg);
          return;
        }
        // Closed/denied without a code. A CANCEL/ERROR event normally reports
        // itself and clears busy; otherwise report a plain cancel after a short wait.
        setTimeout(() => {
          waTrace("fb.login.no-code-timeout", { busy: busyRef.current, eventHandled: eventHandled.current });
          if (!busyRef.current || eventHandled.current) return;
          setBusyBoth(false);
          // Logged in (token-only authResponse) but no code and no signup event: Meta did not run
          // the Embedded Signup flow for this config/app - not a user cancel.
          if (response?.authResponse) {
            setErrorCode("embedded_signup_not_started");
            refreshConfig();
            return;
          }
          setErrorCode("cancelled");
          reportEvent({ event: "CANCEL" }).catch(() => {});
          refreshConfig();
        }, 1500);
      },
      loginOptions
    );
  }, [complete, reportEvent, refreshConfig, setBusyBoth]);

  return { connect, busy, ready, unavailable, errorCode, setErrorCode, clearError: () => setErrorCode(null) };
}
