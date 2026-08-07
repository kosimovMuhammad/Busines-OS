import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { OrganizationContent } from "@/components/settings/organization-content";

export default async function SettingsOrganizationPage() {
  const t = await getTranslations("pages.settingsOrganization");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <SettingsTabs />
      <OrganizationContent />
    </>
  );
}
