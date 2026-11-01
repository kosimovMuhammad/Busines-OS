"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useCompleteWhatsappSignupMutation,
  useLazyGetWhatsappSignupConfigQuery,
  useReportWhatsappSignupEventMutation,
} from "@/lib/api/whatsapp.api";
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
      window.FB.init({
        appId: config.appId,
        autoLogAppEvents: true,
        xfbml: true,
        version: config.graphVersion,
      });
      resolve();
    };
    if (window.FB) {
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

  const [fetchConfig] = useLazyGetWhatsappSignupConfigQuery();
  const [completeSignup] = useCompleteWhatsappSignupMutation();
  const [reportEvent] = useReportWhatsappSignupEventMutation();

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
      if (!sdkReady.current) {
        await loadSdk(cfg);
        sdkReady.current = true;
      }
      setReady(true);
    } catch (e) {
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
        return;
      }
      if (msg?.type !== "WA_EMBEDDED_SIGNUP") return;
      const d = msg.data ?? {};

      if (msg.event === "CANCEL" || msg.event === "ERROR") {
        session.current = null;
        eventHandled.current = true;
        reportEvent({
          event: msg.event,
          currentStep: d.current_step,
          errorCode: d.error_code != null ? String(d.error_code) : undefined,
          errorMessage: d.error_message,
          sessionId: d.session_id,
        })
          .unwrap()
          .then(
            (r) => setErrorCode(r.code),
            () => setErrorCode(msg.event === "CANCEL" ? "cancelled" : "unknown")
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
      try {
        const result = await completeSignup({
          code,
          state: cfg.state,
          session: session.current ?? undefined,
        }).unwrap();
        onConnectedRef.current(result);
      } catch (e) {
        setErrorCode(whatsappErrorCode(e));
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
      setErrorCode("sdk_load_failed");
      return;
    }
    setErrorCode(null);
    setBusyBoth(true);
    session.current = null;
    eventHandled.current = false;

    window.FB.login(
      (response: any) => {
        const code = response?.authResponse?.code;
        if (code) {
          complete(code, cfg);
          return;
        }
        // Closed/denied without a code. A CANCEL/ERROR event normally reports
        // itself and clears busy; otherwise report a plain cancel after a short wait.
        setTimeout(() => {
          if (!busyRef.current || eventHandled.current) return;
          setBusyBoth(false);
          setErrorCode("cancelled");
          reportEvent({ event: "CANCEL" }).catch(() => {});
          refreshConfig();
        }, 1500);
      },
      {
        config_id: cfg.configurationId,
        response_type: "code",
        override_default_response_type: true,
        // v5: WhatsApp Business app onboarding (Coexistence) is on by default.
        extras: { setup: {}, version: cfg.signupVersion },
      }
    );
  }, [complete, reportEvent, refreshConfig, setBusyBoth]);

  return { connect, busy, ready, errorCode, setErrorCode, clearError: () => setErrorCode(null) };
}
