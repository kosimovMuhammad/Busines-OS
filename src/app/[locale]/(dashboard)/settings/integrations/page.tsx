import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { IntegrationsContent } from "@/components/settings/integrations-content";

export default async function SettingsIntegrationsPage() {
  const t = await getTranslations("pages.settingsIntegrations");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <SettingsTabs />
      <IntegrationsContent />
    </>
  );
}
