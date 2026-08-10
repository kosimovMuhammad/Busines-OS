import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { CompanySettingsContent } from "@/components/settings/company-settings-content";

export default async function SettingsPage() {
  const t = await getTranslations("pages.settings");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <CompanySettingsContent />
    </>
  );
}
