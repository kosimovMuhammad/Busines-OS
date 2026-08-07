import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { SecurityAuditContent } from "@/components/settings/security-audit-content";

export default async function SettingsSecurityPage() {
  const t = await getTranslations("pages.settingsSecurity");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <SettingsTabs />
      <SecurityAuditContent />
    </>
  );
}
