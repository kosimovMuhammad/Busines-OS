"use client";

import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetIntegrationsQuery } from "@/lib/api/company.api";
import { useConnectGmailMutation, useConnectOutlookMutation } from "@/lib/api/email.api";
import type { IntegrationStatus } from "@/types/api";

function ProviderCard({
  name,
  status,
  onConnect,
  isConnecting,
}: {
  name: string;
  status: IntegrationStatus | undefined;
  onConnect: () => void;
  isConnecting: boolean;
}) {
  const t = useTranslations("pages.email.connections");
  const connected = status?.connected ?? false;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-surface p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
            connected ? "bg-success/10 text-success" : "bg-surface-elevated text-text-tertiary"
          }`}
        >
          <Mail className="size-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">{name}</p>
          <p className="text-xs text-text-tertiary">
            {connected ? t("connected") : t("notConnected")}
          </p>
        </div>
      </div>
      {!connected && (
        <Button type="button" size="sm" variant="outline" onClick={onConnect} disabled={isConnecting}>
          {t("connect")}
        </Button>
      )}
    </div>
  );
}

export function EmailConnectionCards() {
  const { data: integrations } = useGetIntegrationsQuery();
  const [connectGmail, { isLoading: isConnectingGmail }] = useConnectGmailMutation();
  const [connectOutlook, { isLoading: isConnectingOutlook }] = useConnectOutlookMutation();

  const openOAuthUrl = async (trigger: () => Promise<{ url: string }>) => {
    try {
      const { url } = await trigger();
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      // errorToastMiddleware / degraded-integration toast already surfaces this
    }
  };

  return (
    <div className="space-y-3">
      <ProviderCard
        name="Gmail"
        status={integrations?.gmail}
        onConnect={() => openOAuthUrl(() => connectGmail().unwrap())}
        isConnecting={isConnectingGmail}
      />
      <ProviderCard
        name="Outlook"
        status={integrations?.outlook}
        onConnect={() => openOAuthUrl(() => connectOutlook().unwrap())}
        isConnecting={isConnectingOutlook}
      />
    </div>
  );
}
