import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { PlanContent } from "@/components/settings/plan-content";

export default async function SettingsPlanPage() {
  const t = await getTranslations("pages.settingsPlan");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <SettingsTabs />
      <PlanContent />
    </>
  );
}
