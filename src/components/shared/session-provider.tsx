"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useRefreshMutation } from "@/lib/api/auth.api";
import { setCredentials, sessionCheckFailed } from "@/store/authSlice";
import { useRouter } from "@/i18n/navigation";
import { FullScreenLoading } from "./full-screen-loading";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const initialized = useAppSelector((s) => s.auth.initialized);
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const [refresh] = useRefreshMutation();
  const bootstrapStarted = useRef(false);

  useEffect(() => {
    // Session state lives in the Redux store, which persists across
    // route changes (see StoreProvider), but this component remounts
    // every time navigation enters the (dashboard) layout — e.g. right
    // after login. Skip the bootstrap call whenever a session already
    // exists so it doesn't race the fresh login/refresh-token rotation
    // and log the user back out. `bootstrapStarted` also protects
    // against React Strict Mode's dev-only double effect invocation
    // firing two concurrent /auth/refresh calls on first load.
    if (initialized || bootstrapStarted.current) return;
    bootstrapStarted.current = true;

    refresh()
      .unwrap()
      .then((data) => dispatch(setCredentials(data)))
      .catch(() => dispatch(sessionCheckFailed()));
  }, [initialized, refresh, dispatch]);

  useEffect(() => {
    if (initialized && !accessToken) {
      router.replace("/login");
    }
  }, [initialized, accessToken, router]);

  if (!initialized || !accessToken) {
    return <FullScreenLoading />;
  }

  return <>{children}</>;
}
