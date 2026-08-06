"use client";

import { useTranslations } from "next-intl";
import { CalendarDays, CreditCard, Mail, MessageCircle, Send, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetIntegrationsQuery } from "@/lib/api/company.api";
import type { IntegrationStatus } from "@/types/api";

function ProviderRow({
  icon: Icon,
  name,
  status,
}: {
  icon: typeof Mail;
  name: string;
  status: IntegrationStatus | undefined;
}) {
  const t = useTranslations("pages.settingsIntegrations");
  const connected = status?.connected ?? false;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-surface p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
            connected
              ? "bg-success/10 text-success"
              : "bg-surface-elevated text-text-tertiary"
          }`}
        >
          <Icon className="size-4" />
        </div>
        <p className="text-sm font-medium text-text-primary">{name}</p>
      </div>
      <span className="text-xs text-text-tertiary">
        {status?.comingSoon ? t("comingSoon") : connected ? t("connected") : t("notConnected")}
      </span>
    </div>
  );
}

export function IntegrationsContent() {
  const { data: integrations, isLoading } = useGetIntegrationsQuery();

  if (isLoading || !integrations) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ProviderRow icon={MessageCircle} name="WhatsApp" status={integrations.whatsapp} />
      <ProviderRow icon={Mail} name="Gmail" status={integrations.gmail} />
      <ProviderRow icon={Send} name="Outlook" status={integrations.outlook} />
      <ProviderRow icon={CalendarDays} name="Telegram" status={integrations.telegram} />
      <ProviderRow icon={CreditCard} name="Stripe" status={integrations.stripe} />
      <ProviderRow icon={Wallet} name="PayPal" status={integrations.paypal} />
    </div>
  );
}
