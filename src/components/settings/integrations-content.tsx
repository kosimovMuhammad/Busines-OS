"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Camera, CreditCard, Mail, MessageCircle, Send, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetIntegrationsQuery } from "@/lib/api/company.api";
import { WhatsappAccountsPanel } from "@/components/whatsapp/whatsapp-accounts-panel";
import { TelegramAccountsPanel } from "@/components/telegram/telegram-accounts-panel";
import { TelegramChatLinksPanel } from "@/components/telegram/telegram-chat-links-panel";
import { InstagramAccountsPanel } from "@/components/instagram/instagram-accounts-panel";
import { InstagramConversationLinksPanel } from "@/components/instagram/instagram-conversation-links-panel";
import { EmailConnectionCards } from "@/components/email/email-connection-cards";
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

function IntegrationsOverview() {
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
      <ProviderRow icon={Send} name="Telegram" status={integrations.telegram} />
      <ProviderRow icon={CreditCard} name="Stripe" status={integrations.stripe} />
      <ProviderRow icon={Wallet} name="PayPal" status={integrations.paypal} />
    </div>
  );
}

export function IntegrationsContent() {
  const t = useTranslations("pages.settingsIntegrations");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Instagram's OAuth callback redirects back to this page (via the
  // deprecated /instagram route forwarding its query string here) with
  // ?status=... - jump straight to that tab instead of leaving the result
  // buried under Overview.
  const defaultTab = searchParams.get("status") ? "instagram" : "overview";

  return (
    <Tabs
      defaultValue={defaultTab}
      onValueChange={() => {
        if (searchParams.size > 0) router.replace(pathname);
      }}
    >
      <TabsList>
        <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
        <TabsTrigger value="whatsapp">
          <MessageCircle className="size-3.5" />
          {t("tabs.whatsapp")}
        </TabsTrigger>
        <TabsTrigger value="telegram">
          <Send className="size-3.5" />
          {t("tabs.telegram")}
        </TabsTrigger>
        <TabsTrigger value="instagram">
          <Camera className="size-3.5" />
          {t("tabs.instagram")}
        </TabsTrigger>
        <TabsTrigger value="email">
          <Mail className="size-3.5" />
          {t("tabs.email")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-4">
        <IntegrationsOverview />
      </TabsContent>

      <TabsContent value="whatsapp" className="mt-4">
        <WhatsappAccountsPanel />
      </TabsContent>

      <TabsContent value="telegram" className="mt-4 space-y-6">
        <TelegramAccountsPanel />
        <TelegramChatLinksPanel />
      </TabsContent>

      <TabsContent value="instagram" className="mt-4 space-y-6">
        <InstagramAccountsPanel />
        <InstagramConversationLinksPanel />
      </TabsContent>

      <TabsContent value="email" className="mt-4">
        <EmailConnectionCards />
      </TabsContent>
    </Tabs>
  );
}
