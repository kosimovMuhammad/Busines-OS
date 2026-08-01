"use client";

import { useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useConnectGoogleCalendarMutation,
  useDisconnectGoogleCalendarMutation,
  useGetCalendarStatusQuery,
} from "@/lib/api/calendar.api";

export function GoogleCalendarCard() {
  const t = useTranslations("pages.calendar.connect");
  const { data: status } = useGetCalendarStatusQuery();
  const [connect, { isLoading: isConnecting }] = useConnectGoogleCalendarMutation();
  const [disconnect, { isLoading: isDisconnecting }] = useDisconnectGoogleCalendarMutation();

  const connected = status?.connected ?? false;

  const handleConnect = async () => {
    try {
      const { url } = await connect().unwrap();
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect().unwrap();
    } catch {
      // errorToastMiddleware already surfaces this via a toast
    }
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-surface p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
            connected ? "bg-success/10 text-success" : "bg-surface-elevated text-text-tertiary"
          }`}
        >
          <CalendarDays className="size-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">{t("title")}</p>
          <p className="text-xs text-text-tertiary">
            {connected ? t("connected") : t("notConnected")}
          </p>
        </div>
      </div>
      {connected ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleDisconnect}
          disabled={isDisconnecting}
        >
          {t("disconnect")}
        </Button>
      ) : (
        <Button type="button" size="sm" onClick={handleConnect} disabled={isConnecting}>
          {t("connect")}
        </Button>
      )}
    </div>
  );
}
