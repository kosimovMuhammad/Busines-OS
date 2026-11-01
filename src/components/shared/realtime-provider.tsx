"use client";

import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { baseApi } from "@/lib/api/baseApi";
import { playMessageSound } from "@/lib/notification-sound";
import type { Communication } from "@/types/api";

// Channels that should trigger a sound — outbound notes / emails are excluded
const SOUND_CHANNELS = new Set(["Whatsapp", "Telegram", "Instagram"]);

// Direction field: inbound messages come from the contact, outbound are from us.
// The Communication type uses `direction` ("Inbound" | "Outbound") or falls back
// to checking if `senderType` exists — only play for inbound.

// Mounted only inside SessionProvider's authenticated branch, so this
// component's own mount/unmount is already tied 1:1 to having a session -
// no need to react to accessToken changes here. accessTokenFactory reads
// the ref instead of a closed-over value so a token rotated later (via
// /auth/refresh) is picked up on SignalR's automatic-reconnect attempts
// without tearing down and rebuilding the connection.
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const tokenRef = useRef(accessToken);

  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    // Guards against React Strict Mode's dev-only double effect invocation
    // (same pattern as SessionProvider's bootstrapStarted ref): the first
    // mount's connection.start() is still negotiating when Strict Mode's
    // immediate cleanup calls connection.stop(), which rejects start()
    // with a "stopped during negotiation" error. That's expected cleanup,
    // not a real failure, so don't log it - only the second (real) mount's
    // outcome matters.
    let stopped = false;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_API_URL}/hubs/messaging`, {
        accessTokenFactory: () => tokenRef.current ?? "",
      })
      .withAutomaticReconnect()
      // SignalR's own internal logger writes Error-level entries straight to
      // console.error (e.g. the same "stopped during negotiation" abort this
      // effect triggers on Strict Mode's double-invoke), bypassing the
      // `stopped` guard above entirely. Our own catch() is the single source
      // of truth for real failures, so dial the library's own console
      // logging down to Critical.
      .configureLogging(signalR.LogLevel.Critical)
      .build();

    connection.on("newCommunication", (message: Communication) => {
      // Play notification sound only for inbound messages on messaging channels
      if (
        message.direction === "INBOUND" &&
        SOUND_CHANNELS.has(message.channel)
      ) {
        playMessageSound(message.channel as "Whatsapp" | "Telegram" | "Instagram");
      }

      dispatch(
        baseApi.util.invalidateTags([
          { type: "Communications", id: "LIST" },
          ...(message.contactId
            ? [{ type: "Communications" as const, id: message.contactId }]
            : []),
        ])
      );
    });

    connection.start().catch((error) => {
      if (stopped) return;
      console.error("Realtime messaging connection failed to start", error);
    });

    return () => {
      stopped = true;
      connection.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
