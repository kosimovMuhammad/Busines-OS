import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { RolesPermissionsContent } from "@/components/settings/roles-permissions-content";

export default async function SettingsRolesPage() {
  const t = await getTranslations("pages.settingsRoles");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <SettingsTabs />
      <RolesPermissionsContent />
    </>
  );
}
