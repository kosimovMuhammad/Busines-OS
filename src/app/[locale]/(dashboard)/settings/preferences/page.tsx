import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { PreferencesSettingsContent } from "@/components/settings/preferences-settings-content";

export default async function SettingsPreferencesPage() {
  const t = await getTranslations("pages.settingsPreferences");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <PreferencesSettingsContent />
    </>
  );
}
