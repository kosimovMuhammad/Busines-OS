import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileSettingsContent } from "@/components/settings/profile-settings-content";

export default async function ProfilePage() {
  const t = await getTranslations("pages.settingsProfile");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <ProfileSettingsContent />
    </>
  );
}
