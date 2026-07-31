"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    refresh()
      .unwrap()
      .then((data) => dispatch(setCredentials(data)))
      .catch(() => dispatch(sessionCheckFailed()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
