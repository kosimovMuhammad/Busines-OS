import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { TeamContent } from "@/components/settings/team-content";

export default async function SettingsTeamPage() {
  const t = await getTranslations("pages.settingsTeam");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <TeamContent />
    </>
  );
}
